/// <reference types="vite/client" />
import { beforeEach, expect, it } from 'vitest';
import { convexTest, type TestConvex } from 'convex-test';
import schema from '../convex/schema';
import { api, internal } from '../convex/_generated/api';
import type { Id } from '../convex/_generated/dataModel';
const modules = import.meta.glob('../convex/**/*.ts');
const point = { latitude: 13.0827, longitude: 80.2707 };
let t: TestConvex<typeof schema>, userId: Id<'users'>, jurisdictionId: Id<'jurisdictions'>, agencyId: Id<'agencies'>;
const actor = () => t.withIdentity({ subject: `${userId}|session` });
const args = () => ({ requestId: 'demo-notice-create-001', jurisdictionId, title: 'Test flood notice', event: 'Flood test', description: 'DEMO-only injected evidence.', instruction: 'Use this only for a controlled test.', severity: 'HIGH' as const, urgency: 'Immediate' as const, certainty: 'Observed' as const, sourceLanguage: 'en' as const, locality: 'Test Chennai', area: { type: 'circle' as const, center: point, radiusM: 1000 }, expiresAt: Date.now() + 2 * 60 * 60_000 });
beforeEach(async () => {
  t = convexTest(schema, modules);
  const scope = await t.mutation(internal.operator.ensureDemoAuthorityScope, {}); agencyId = scope.agencyId; jurisdictionId = scope.jurisdictionIds[0]!;
  userId = await t.run(ctx => ctx.db.insert('users', { name: 'Demo authority' }));
  await actor().mutation(api.locations.update, { requestId: 'demo-notice-location-001', fix: { point, accuracyM: 10, observedAt: Date.now() }, foregroundPermission: 'granted', backgroundPermission: 'denied', source: 'FOREGROUND' });
  await t.mutation(internal.operator.approveAuthority, { userId, agencyId, jurisdictionIds: [jurisdictionId], operatorLabel: 'Test', reason: 'Test DEMO scope' });
});
it('creates idempotent, audited DEMO-only test evidence and lets its issuer withdraw it', async () => {
  const input = args(), created = await actor().mutation(api.demoNotices.create, input);
  expect(await actor().mutation(api.demoNotices.create, input)).toEqual(created);
  const managed = await actor().query(api.demoNotices.managed, { jurisdictionId });
  expect(managed.page).toHaveLength(1); expect(managed.page[0]).toMatchObject({ title: input.title, audience: 'DEMO', status: 'ACTIVE' });
  await actor().mutation(api.demoNotices.withdraw, { requestId: 'demo-notice-withdraw-001', jurisdictionId, noticeId: created.noticeId, expectedRevision: 1 });
  expect((await actor().query(api.demoNotices.managed, { jurisdictionId })).page).toHaveLength(0);
  const audit = await t.run(ctx => ctx.db.query('auditEvents').collect()); expect(audit.filter(item => item.objectKind === 'DEMO_EVIDENCE_NOTICE').map(item => item.action)).toEqual(['CREATE', 'WITHDRAW']);
});
it('rejects tourists, expired inputs and out-of-bound circles without creating records', async () => {
  await expect(t.mutation(api.demoNotices.create, args())).rejects.toThrow('AUTH_REQUIRED');
  await expect(actor().mutation(api.demoNotices.create, { ...args(), requestId: 'demo-notice-expired-001', expiresAt: Date.now() - 1 })).rejects.toThrow('INVALID_INPUT');
  await expect(actor().mutation(api.demoNotices.create, { ...args(), requestId: 'demo-notice-outside-001', area: { type: 'circle', center: point, radiusM: 1_000_000 } })).rejects.toThrow('JURISDICTION_DENIED');
  expect(await t.run(ctx => ctx.db.query('demoEvidenceNotices').collect())).toHaveLength(0);
});
it('rejects a LIVE scope, an unassigned jurisdiction, and a revoked membership', async () => {
  const otherGeometry = await t.run(ctx => ctx.db.insert('geometries', { area: { type: 'circle', center: point, radiusM: 20_000 }, source: 'TEST', sourceAccuracyM: null, version: 1, geometryHash: 'other-scope' }));
  const otherAgency = await t.run(ctx => ctx.db.insert('agencies', { name: 'Other DEMO agency', sourceLabel: 'Other DEMO', active: true, audience: 'DEMO' }));
  const otherJurisdiction = await t.run(ctx => ctx.db.insert('jurisdictions', { agencyId: otherAgency, name: 'Other scope', geometryId: otherGeometry, coverageVersion: 1, active: true }));
  await expect(actor().mutation(api.demoNotices.create, { ...args(), requestId: 'demo-notice-other-scope-001', jurisdictionId: otherJurisdiction })).rejects.toThrow('JURISDICTION_DENIED');
  const liveAgency = await t.run(ctx => ctx.db.insert('agencies', { name: 'LIVE test agency', sourceLabel: 'LIVE test', active: true, audience: 'LIVE' }));
  const liveJurisdiction = await t.run(ctx => ctx.db.insert('jurisdictions', { agencyId: liveAgency, name: 'LIVE scope', geometryId: otherGeometry, coverageVersion: 1, active: true }));
  await t.mutation(internal.operator.approveAuthority, { userId, agencyId: liveAgency, jurisdictionIds: [liveJurisdiction], operatorLabel: 'Test', reason: 'LIVE scope' });
  await expect(actor().mutation(api.demoNotices.create, { ...args(), requestId: 'demo-notice-live-scope-001', jurisdictionId: liveJurisdiction })).rejects.toThrow('JURISDICTION_DENIED');
  const membership = await t.run(ctx => ctx.db.query('authorityMemberships').withIndex('by_user_status', q => q.eq('userId', userId).eq('status', 'ACTIVE')).first());
  await t.mutation(internal.operator.revokeAuthority, { membershipId: membership!._id, reason: 'revoked' });
  await expect(actor().mutation(api.demoNotices.create, { ...args(), requestId: 'demo-notice-revoked-001' })).rejects.toThrow('JURISDICTION_DENIED');
});
it('returns overlapping active DEMO notice evidence only, excluding expired and withdrawn data', async () => {
  const created = await actor().mutation(api.demoNotices.create, args());
  const relevant = await t.query(internal.demoNotices.relevant, { point, accuracyM: 20, audience: 'DEMO' });
  expect(relevant.items[0]).toMatchObject({ noticeId: created.noticeId, sourceKind: 'DEMO_AUTHORITY_TEST_NOTICE', evidenceLabel: 'DEMO authority-created test evidence' });
  expect((await t.query(internal.demoNotices.relevant, { point: { latitude: 28.6, longitude: 77.2 }, accuracyM: 20, audience: 'DEMO' })).items).toHaveLength(0);
  await actor().mutation(api.demoNotices.withdraw, { requestId: 'demo-notice-withdraw-002', jurisdictionId, noticeId: created.noticeId, expectedRevision: 1 });
  expect((await t.query(internal.demoNotices.relevant, { point, accuracyM: 20, audience: 'DEMO' })).items).toHaveLength(0);
});
