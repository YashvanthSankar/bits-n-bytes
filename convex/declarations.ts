import { internal } from './_generated/api';
import { mutation } from './_generated/server';
import { v } from 'convex/values';
import { requireAssignedJurisdiction, requireUser } from './lib/authorization';
import { containsArea, coveringCells, validateArea } from './lib/areas';
import { command, payloadHash } from './lib/idempotency';
import { reject } from './lib/errors';
import { actionKind, geometry, hazard, language, severity } from './lib/validators';
import type { Id } from './_generated/dataModel';
import { DAY, POLICY_VERSION } from '../src/domain/policy';

/** Canonical publication only; provider calls and delivery happen after this transaction. */
export const publish = mutation({ args: {
  requestId: v.string(), jurisdictionId: v.id('jurisdictions'), incidentId: v.optional(v.id('incidents')),
  expectedIncidentRevision: v.number(), hazard, locality: v.string(), area: geometry, severity,
  originalText: v.string(), sourceLanguage: language, actionKind, namedShelterId: v.optional(v.id('shelters')),
  deadlineAt: v.optional(v.number()), reviewDueAt: v.number(), reason: v.string(),
}, handler: async (ctx, args): Promise<{ incidentId: Id<'incidents'>; declarationId: Id<'authorityDeclarations'>; alertId: Id<'alerts'>; revision: number; instructionVersionId: Id<'instructionVersions'>; publishedAt: number }> => {
  const userId = await requireUser(ctx);
  return command(ctx, userId, 'DECLARATION_PUBLISH', args.requestId, args, async () => {
    const scope = await requireAssignedJurisdiction(ctx, args.jurisdictionId);
    validateArea(args.area);
    if (!containsArea(scope.area, args.area)) return reject('JURISDICTION_DENIED');
    const now = Date.now();
    if (!args.originalText.trim() || args.originalText.length > 8000 || /[\u0000-\u0008\u000b\u000c\u000e-\u001f]/.test(args.originalText)
      || args.locality.trim().length < 1 || args.locality.length > 160 || /[\u0000-\u001f]/.test(args.locality)
      || args.reason.trim().length < 5 || args.reason.length > 500 || args.severity === 'UNKNOWN'
      || !Number.isFinite(args.reviewDueAt) || args.reviewDueAt <= now || args.reviewDueAt > now + DAY
      || (args.deadlineAt !== undefined && (!Number.isFinite(args.deadlineAt) || args.deadlineAt <= now))) return reject('INVALID_INPUT');
    if ((args.actionKind === 'NAMED_SHELTER') !== Boolean(args.namedShelterId)) return reject('INVALID_INPUT');
    if (args.namedShelterId) {
      const shelter = await ctx.db.get(args.namedShelterId);
      if (!shelter || shelter.archivedAt !== undefined || shelter.agencyId !== scope.agency._id || shelter.audience !== scope.agency.audience) return reject('JURISDICTION_DENIED');
    }
    const existing = args.incidentId ? await ctx.db.get(args.incidentId) : null;
    if (args.incidentId && !existing) return reject('NOT_FOUND');
    if (args.expectedIncidentRevision !== (existing?.revision ?? 0)) return reject('REVISION_CONFLICT');
    if (existing && (existing.audience !== scope.agency.audience || existing.hazard !== args.hazard || !['ACTIVE', 'STALE'].includes(existing.lifecycle))) return reject('INVALID_INPUT');
    if (existing) {
      const previousArea = await ctx.db.get(existing.geometryId);
      if (!previousArea || !containsArea(scope.area, previousArea.area)) return reject('JURISDICTION_DENIED');
    }
    // Validate bounded geographic expansion before any canonical publication is committed.
    const cells = new Set(coveringCells(args.area));
    const geometryId = await ctx.db.insert('geometries', { area: args.area, source: 'AUTHORITY', sourceAccuracyM: null, version: 1, geometryHash: payloadHash(args.area) });
    const incidentId = existing?._id ?? await ctx.db.insert('incidents', {
      hazard: args.hazard, locality: args.locality.trim(), geometryId, provenance: 'AUTHORITY', verification: 'AUTHORITY_VERIFIED', lifecycle: 'ACTIVE',
      qualification: null, assessmentStatus: 'PENDING', severity: args.severity, recentWitnesses: 0, totalWitnesses: 0,
      lastObservedAt: now, staleAt: args.reviewDueAt, revision: 1, evidenceGeneration: 1, controlRevision: 1,
      nextAssessmentAt: args.reviewDueAt, audience: scope.agency.audience, authorityAgencyId: scope.agency._id,
    });
    if (existing) await ctx.db.patch(incidentId, { verification: 'AUTHORITY_VERIFIED', lifecycle: 'ACTIVE', revision: existing.revision + 1, controlRevision: existing.controlRevision + 1 });
    const declarationId = await ctx.db.insert('authorityDeclarations', { incidentId, membershipId: scope.membership._id, agencyId: scope.agency._id,
      geometryId, severity: args.severity, reviewDueAt: args.reviewDueAt, active: true, revision: 1, audience: scope.agency.audience });
    const instructionVersionId = await ctx.db.insert('instructionVersions', { declarationId, revision: 1, originalText: args.originalText,
      originalHash: payloadHash(args.originalText), sourceLanguage: args.sourceLanguage, actionKind: args.actionKind, ...(args.namedShelterId ? { namedShelterId: args.namedShelterId } : {}), issuedAt: now, ...(args.deadlineAt !== undefined ? { deadlineAt: args.deadlineAt } : {}) });
    await ctx.db.patch(declarationId, { instructionVersionId });
    const previousAlert = await ctx.db.query('alerts').withIndex('by_incident', q => q.eq('incidentId', incidentId)).unique();
    const revision = (previousAlert?.currentRevision ?? 0) + 1;
    const alertId = previousAlert?._id ?? await ctx.db.insert('alerts', { incidentId, lifecycle: 'ACTIVE', currentRevision: revision, createdAt: now, updatedAt: now, audience: scope.agency.audience });
    if (previousAlert) await ctx.db.patch(alertId, { lifecycle: 'ACTIVE', currentRevision: revision, updatedAt: now });
    await ctx.db.insert('alertSources', { alertId, kind: 'AUTHORITY', declarationId, instructionVersionId, geometryId, severity: args.severity,
      agencyId: scope.agency._id, issuerLabel: scope.agency.sourceLabel, active: true, sourceRevision: 1, audience: scope.agency.audience });
    const sources = await ctx.db.query('alertSources').withIndex('by_alert_active', q => q.eq('alertId', alertId).eq('active', true)).take(33);
    if (sources.length > 32) return reject('CONFIGURATION_REQUIRED');
    for (const source of sources) {
      const sourceArea = await ctx.db.get(source.geometryId);
      if (!sourceArea) return reject('CONFIGURATION_REQUIRED');
      for (const cell of coveringCells(sourceArea.area)) cells.add(cell);
      if (cells.size > 2048) return reject('CONFIGURATION_REQUIRED');
    }
    const ranks = ['CRITICAL', 'HIGH', 'MODERATE', 'LOW', 'UNKNOWN'];
    const strongest = sources.reduce<typeof sources[number]['severity']>((best, source) => ranks.indexOf(source.severity) < ranks.indexOf(best) ? source.severity : best, args.severity);
    await ctx.db.insert('alertRevisions', { alertId, revision, sources: sources.map(s => ({ sourceId: s._id, geometryId: s.geometryId, ...(s.instructionVersionId ? { instructionVersionId: s.instructionVersionId } : {}), severity: s.severity, issuerLabel: s.issuerLabel, active: s.active })),
      severity: strongest, materialReason: previousAlert ? 'SOURCE' : 'FIRST', urgency: previousAlert ? 'MATERIAL' : 'FIRST', criticalInstruction: true, publishedAt: now, policyVersion: POLICY_VERSION });
    const jobId = await ctx.db.insert('jobs', { kind: 'ALERT_EXPANSION', key: `${alertId}:${revision}`, status: 'PENDING', dueAt: now, createdAt: now, alertId, alertRevision: revision,
      geometryId, cells: [...cells].sort(), cellIndex: 0, childIndex: 0, cursor: null, checkpoint: 0 });
    await ctx.scheduler.runAfter(0, internal.alertExpansion.page, { jobId, checkpoint: 0 });
    await ctx.db.insert('auditEvents', { actorId: userId, actorKind: 'AUTHORITY', objectKind: 'AUTHORITY_DECLARATION', objectId: declarationId, revision: 1, action: 'PUBLISH', reason: args.reason.trim(), createdAt: now });
    return { incidentId, declarationId, alertId, revision, instructionVersionId, publishedAt: now };
  });
} });
