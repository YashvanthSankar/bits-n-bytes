import { internalQuery, mutation, query } from './_generated/server';
import { v } from 'convex/values';
import { requireAssignedJurisdiction, requireUser } from './lib/authorization';
import { containsArea, validateArea } from './lib/areas';
import { command, payloadHash } from './lib/idempotency';
import { reject } from './lib/errors';
import { language, point, severity } from './lib/validators';
import { overlapsArea } from '../src/domain/geography';

const circle = v.object({ type: v.literal('circle'), center: point, radiusM: v.number() });
const textOk = (value: string, max: number) => value.trim().length > 0 && value.length <= max && !/[\u0000-\u001f]/.test(value);
const capValue = v.union(v.literal('Immediate'), v.literal('Expected'), v.literal('Future'), v.literal('Past'), v.literal('Unknown'));
const certaintyValue = v.union(v.literal('Observed'), v.literal('Likely'), v.literal('Possible'), v.literal('Unlikely'), v.literal('Unknown'));

/** DEMO-only test data. It is not an official notice and never creates an alert directly. */
export const create = mutation({ args: {
  requestId: v.string(), jurisdictionId: v.id('jurisdictions'), title: v.string(), event: v.string(), description: v.string(), instruction: v.string(),
  severity, urgency: capValue, certainty: certaintyValue, sourceLanguage: language, locality: v.string(), area: circle, expiresAt: v.number(),
}, handler: async (ctx, args) => {
  const userId = await requireUser(ctx);
  return command(ctx, userId, 'DEMO_EVIDENCE_NOTICE_CREATE', args.requestId, args, async () => {
    const scope = await requireAssignedJurisdiction(ctx, args.jurisdictionId);
    if (scope.agency.audience !== 'DEMO') return reject('JURISDICTION_DENIED');
    validateArea(args.area);
    if (!containsArea(scope.area, args.area)) return reject('JURISDICTION_DENIED');
    const now = Date.now();
    if (!textOk(args.title, 160) || !textOk(args.event, 160) || !textOk(args.description, 4000) || !textOk(args.instruction, 4000) || !textOk(args.locality, 160)
      || args.severity === 'UNKNOWN' || !Number.isFinite(args.expiresAt) || args.expiresAt <= now || args.expiresAt > now + 24 * 60 * 60_000) return reject('INVALID_INPUT');
    const geometryId = await ctx.db.insert('geometries', { area: args.area, source: 'DEMO_AUTHORITY_TEST_NOTICE', sourceAccuracyM: null, version: 1, geometryHash: payloadHash(args.area) });
    const noticeId = await ctx.db.insert('demoEvidenceNotices', { agencyId: scope.agency._id, jurisdictionId: scope.jurisdiction._id, membershipId: scope.membership._id, creatorId: userId, geometryId,
      title: args.title.trim(), event: args.event.trim(), description: args.description.trim(), instruction: args.instruction.trim(), locality: args.locality.trim(), severity: args.severity,
      urgency: args.urgency, certainty: args.certainty, sourceLanguage: args.sourceLanguage, issuedAt: now, expiresAt: args.expiresAt, active: true, revision: 1, audience: 'DEMO' });
    await ctx.db.insert('auditEvents', { actorId: userId, actorKind: 'AUTHORITY', objectKind: 'DEMO_EVIDENCE_NOTICE', objectId: noticeId, revision: 1, action: 'CREATE', reason: 'DEMO authority-created test evidence', createdAt: now });
    return { noticeId, revision: 1, issuedAt: now, expiresAt: args.expiresAt };
  });
} });

/** Only the issuing DEMO authority can withdraw its still-active test evidence. */
export const withdraw = mutation({ args: { requestId: v.string(), jurisdictionId: v.id('jurisdictions'), noticeId: v.id('demoEvidenceNotices'), expectedRevision: v.number() }, handler: async (ctx, args) => {
  const userId = await requireUser(ctx);
  return command(ctx, userId, 'DEMO_EVIDENCE_NOTICE_WITHDRAW', args.requestId, args, async () => {
    const scope = await requireAssignedJurisdiction(ctx, args.jurisdictionId);
    const notice = await ctx.db.get(args.noticeId);
    if (scope.agency.audience !== 'DEMO' || !notice || notice.agencyId !== scope.agency._id || notice.jurisdictionId !== scope.jurisdiction._id || notice.creatorId !== userId) return reject('JURISDICTION_DENIED');
    if (!notice.active || notice.expiresAt <= Date.now() || notice.revision !== args.expectedRevision) return reject('REVISION_CONFLICT');
    const now = Date.now(), revision = notice.revision + 1;
    await ctx.db.patch(notice._id, { active: false, endedAt: now, revision });
    await ctx.db.insert('auditEvents', { actorId: userId, actorKind: 'AUTHORITY', objectKind: 'DEMO_EVIDENCE_NOTICE', objectId: notice._id, revision, action: 'WITHDRAW', reason: 'DEMO test evidence withdrawn early', createdAt: now });
    return { revision, withdrawnAt: now };
  });
} });

export const managed = query({ args: { jurisdictionId: v.id('jurisdictions') }, handler: async (ctx, args) => {
  const scope = await requireAssignedJurisdiction(ctx, args.jurisdictionId);
  if (scope.agency.audience !== 'DEMO') return reject('JURISDICTION_DENIED');
  const now = Date.now();
  const notices = await ctx.db.query('demoEvidenceNotices').withIndex('by_jurisdiction_active', q => q.eq('jurisdictionId', scope.jurisdiction._id).eq('active', true)).order('desc').take(51);
  const page = [];
  for (const notice of notices.slice(0, 50)) {
    const geometry = await ctx.db.get(notice.geometryId);
    if (!geometry || geometry.area.type !== 'circle') continue;
    page.push({ id: notice._id, revision: notice.revision, title: notice.title, event: notice.event, description: notice.description, instruction: notice.instruction, locality: notice.locality, severity: notice.severity, urgency: notice.urgency, certainty: notice.certainty, sourceLanguage: notice.sourceLanguage, issuedAt: notice.issuedAt, expiresAt: notice.expiresAt, area: geometry.area, status: notice.expiresAt > now ? 'ACTIVE' : 'EXPIRED', issuer: scope.agency.sourceLabel, audience: 'DEMO' as const });
  }
  return { page, partial: notices.length > 50 };
} });

/** Internal evidence read model. This intentionally cannot see LIVE incidents or official SACHET records. */
export const relevant = internalQuery({ args: { point, accuracyM: v.number(), audience: v.literal('DEMO') }, handler: async (ctx, args) => {
  const now = Date.now();
  if (!Number.isFinite(args.accuracyM) || args.accuracyM < 0 || args.accuracyM > 1000) throw Error('DEMO_NOTICE_POSITION_INVALID');
  const notices = await ctx.db.query('demoEvidenceNotices').withIndex('by_active_expiresAt', q => q.eq('active', true).gt('expiresAt', now)).take(101);
  const items = [];
  for (const notice of notices.slice(0, 100)) {
    const geometry = await ctx.db.get(notice.geometryId); const agency = await ctx.db.get(notice.agencyId);
    if (!geometry || !agency || geometry.area.type !== 'circle' || !overlapsArea({ point: args.point, accuracyM: args.accuracyM, observedAt: now }, geometry.area)) continue;
    items.push({ noticeId: notice._id, revision: notice.revision, sourceKind: 'DEMO_AUTHORITY_TEST_NOTICE' as const, evidenceLabel: 'DEMO authority-created test evidence', issuer: agency.sourceLabel, title: notice.title, event: notice.event, description: notice.description, instruction: notice.instruction, locality: notice.locality, severity: notice.severity, urgency: notice.urgency, certainty: notice.certainty, sourceLanguage: notice.sourceLanguage, issuedAt: notice.issuedAt, expiresAt: notice.expiresAt, geometry: geometry.area });
  }
  return { items, partial: notices.length > 100, checkedAt: now };
} });
