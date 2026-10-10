import { mutation, query, type QueryCtx } from './_generated/server';
import { v } from 'convex/values';
import type { Doc } from './_generated/dataModel';
import { requireIndiaAccess } from './lib/authorization';
import { reject } from './lib/errors';
import { validateFix } from '../src/domain/eligibility';
import { overlapsArea } from '../src/domain/geography';
import { compareAlerts } from '../src/domain/alertOrder';
import { POLICY } from '../src/domain/policy';

async function snapshot(ctx: QueryCtx, alert: Doc<'alerts'>) {
  const revision = await ctx.db.query('alertRevisions').withIndex('by_alert_revision', q => q.eq('alertId', alert._id).eq('revision', alert.currentRevision)).unique();
  if (!revision || revision.sources.length > 32) return reject('CONFIGURATION_REQUIRED');
  return revision;
}
async function applicable(ctx: QueryCtx, revision: Doc<'alertRevisions'>, location: Doc<'locations'>) {
  let inside = false, nearby = false;
  for (const source of revision.sources) if (source.active) {
    const geometry = await ctx.db.get(source.geometryId);
    if (!geometry) return reject('CONFIGURATION_REQUIRED');
    nearby ||= overlapsArea(location, geometry.area);
    inside ||= overlapsArea({ ...location, accuracyM: 0 }, geometry.area);
  }
  return inside ? 'INSIDE' as const : nearby ? 'POSSIBLE_PROXIMITY' as const : 'OUTSIDE' as const;
}

/** Only this session's exposures. A stale cached exposure is never current relevance proof. */
export const active = query({ args: {}, handler: async ctx => {
  const { userId, location } = await requireIndiaAccess(ctx);
  const now = Date.now(), locationFresh = validateFix(location, now, POLICY.alertFix).ok;
  const profile = await ctx.db.query('profiles').withIndex('by_user', q => q.eq('userId', userId)).unique();
  const exposures = await ctx.db.query('exposures').withIndex('by_user_relevant', q => q.eq('userId', userId).eq('relevant', true)).take(21);
  const items = [];
  if (locationFresh) for (const exposure of exposures.slice(0, 20)) {
    const alert = await ctx.db.get(exposure.alertId);
    if (!alert || alert.lifecycle !== 'ACTIVE' || (alert.audience === 'DEMO' && !profile?.demoEnabled)) continue;
    const revision = await snapshot(ctx, alert), proximity = await applicable(ctx, revision, location);
    if (proximity === 'OUTSIDE') continue;
    const incident = await ctx.db.get(alert.incidentId);
    if (!incident) continue;
    items.push({ exposureId: exposure._id, id: alert._id, incidentId: incident._id, revision: alert.currentRevision, hazard: incident.hazard, locality: incident.locality,
      severity: revision.severity, audience: alert.audience, publishedAt: revision.publishedAt, proximity,
      needsAttention: exposure.dismissedRevision < alert.currentRevision && revision.urgency !== 'SILENT' });
  }
  items.sort(compareAlerts);
  return { items, partial: exposures.length > 20, locationFresh, locationObservedAt: location.observedAt, serverTime: now };
} });

/** Original notices are attributed separately; no invented combined instruction or translation. */
export const detail = query({ args: { alertId: v.id('alerts') }, handler: async (ctx, args) => {
  const { userId, location } = await requireIndiaAccess(ctx);
  const alert = await ctx.db.get(args.alertId);
  if (!alert) return reject('NOT_FOUND');
  const exposure = await ctx.db.query('exposures').withIndex('by_user_incident', q => q.eq('userId', userId).eq('incidentId', alert.incidentId)).unique();
  if (!exposure || exposure.alertId !== alert._id) return reject('NOT_FOUND');
  const profile = await ctx.db.query('profiles').withIndex('by_user', q => q.eq('userId', userId)).unique();
  if (!alert || (alert.audience === 'DEMO' && !profile?.demoEnabled)) return reject('NOT_FOUND');
  const revision = await snapshot(ctx, alert), incident = await ctx.db.get(alert.incidentId);
  if (!incident) return reject('NOT_FOUND');
  const now = Date.now(), fresh = validateFix(location, now, POLICY.alertFix).ok;
  const instructions = [];
  for (const source of revision.sources) if (source.active) {
    const geometry = await ctx.db.get(source.geometryId);
    if (!geometry) return reject('CONFIGURATION_REQUIRED');
    const instruction = source.instructionVersionId ? await ctx.db.get(source.instructionVersionId) : null;
    const declaration = instruction ? await ctx.db.get(instruction.declarationId) : null;
    if (source.instructionVersionId && !instruction) return reject('CONFIGURATION_REQUIRED');
    instructions.push({ sourceId: source.sourceId, issuer: source.issuerLabel, severity: source.severity, area: geometry.area,
      appliesToCurrentLocation: fresh ? overlapsArea(location, geometry.area) : null,
      originalText: instruction?.originalText ?? null, sourceLanguage: instruction?.sourceLanguage ?? null,
      actionKind: instruction?.actionKind ?? null, issuedAt: instruction?.issuedAt ?? revision.publishedAt,
      deadlineAt: instruction?.deadlineAt ?? null, reviewDueAt: declaration?.reviewDueAt ?? null,
      reviewOverdue: declaration ? declaration.reviewDueAt < now : false });
  }
  return { id: alert._id, revision: alert.currentRevision, lifecycle: alert.lifecycle, audience: alert.audience,
    hazard: incident.hazard, locality: incident.locality, severity: revision.severity, publishedAt: revision.publishedAt,
    locationFresh: fresh, locationObservedAt: location.observedAt, proximity: fresh ? await applicable(ctx, revision, location) : null,
    instructions, serverTime: now };
} });

/** Idempotent acknowledgement of a specific revision; future revisions are never dismissed. */
export const dismiss = mutation({ args: { alertId: v.id('alerts'), revision: v.number() }, handler: async (ctx, args) => {
  const { userId } = await requireIndiaAccess(ctx);
  const alert = await ctx.db.get(args.alertId);
  if (!alert || args.revision !== alert.currentRevision) return reject('REVISION_CONFLICT');
  const exposure = await ctx.db.query('exposures').withIndex('by_user_incident', q => q.eq('userId', userId).eq('incidentId', alert.incidentId)).unique();
  if (!exposure || exposure.alertId !== alert._id) return reject('NOT_FOUND');
  await ctx.db.patch(exposure._id, { dismissedRevision: Math.max(exposure.dismissedRevision, args.revision) });
  return { revision: args.revision };
} });
