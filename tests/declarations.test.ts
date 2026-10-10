/// <reference types="vite/client" />
import { beforeEach, expect, it } from 'vitest';
import { convexTest, type TestConvex } from 'convex-test';
import schema from '../convex/schema';
import { api, internal } from '../convex/_generated/api';
import type { Id } from '../convex/_generated/dataModel';
import { HOUR } from '../src/domain/policy';
const modules = import.meta.glob('../convex/**/*.ts');
const point = { latitude: 13.0827, longitude: 80.2707 };
let t: TestConvex<typeof schema>, userId: Id<'users'>, jurisdictionId: Id<'jurisdictions'>, agencyId: Id<'agencies'>;
const actor = () => t.withIdentity({ subject: `${userId}|session` });
const args = () => ({ requestId: 'publish-test-001', jurisdictionId, expectedIncidentRevision: 0, hazard: 'FLASH_FLOOD' as const,
  locality: 'Test area', area: { type: 'circle' as const, center: point, radiusM: 1000 }, severity: 'HIGH' as const,
  originalText: '  Stay indoors. Do not cross the bridge.\nFollow authority instructions.  ', sourceLanguage: 'en' as const,
  actionKind: 'STAY_PUT' as const, reviewDueAt: Date.now() + HOUR, reason: 'Isolated test declaration' });
beforeEach(async () => {
  t = convexTest(schema, modules);
  const scope = await t.mutation(internal.operator.ensureDemoAuthorityScope, {});
  agencyId = scope.agencyId; jurisdictionId = scope.jurisdictionIds[0]!;
  userId = await t.run(ctx => ctx.db.insert('users', { name: 'Private authority' }));
  await actor().mutation(api.locations.update, { requestId: 'test-location-001', fix: { point, accuracyM: 10, observedAt: Date.now() }, foregroundPermission: 'granted', backgroundPermission: 'denied', source: 'FOREGROUND' });
  await t.mutation(internal.operator.approveAuthority, { userId, agencyId, jurisdictionIds: [jurisdictionId], operatorLabel: 'Test operator', reason: 'Test scope approved' });
});
it('atomically publishes original instructions, source, revision and one durable job without model assessment', async () => {
  const input = args(); const result = await actor().mutation(api.declarations.publish, input);
  expect(await actor().mutation(api.declarations.publish, input)).toEqual(result);
  const state = await t.run(async ctx => ({ declaration: await ctx.db.get(result.declarationId), instruction: await ctx.db.get(result.instructionVersionId),
    alert: await ctx.db.get(result.alertId), sources: await ctx.db.query('alertSources').collect(), revisions: await ctx.db.query('alertRevisions').collect(), jobs: await ctx.db.query('jobs').collect(), audit: await ctx.db.query('auditEvents').collect() }));
  expect(state.instruction?.originalText).toBe(input.originalText);
  expect(state.declaration).toMatchObject({ active: true, audience: 'DEMO', revision: 1 });
  expect(state.alert).toMatchObject({ lifecycle: 'ACTIVE', currentRevision: 1 });
  expect(state.sources).toHaveLength(1); expect(state.revisions).toHaveLength(1); expect(state.jobs).toHaveLength(1);
  expect(state.jobs[0]).toMatchObject({ status: 'PENDING', kind: 'ALERT_EXPANSION', alertRevision: 1, checkpoint: 0 });
  expect(state.jobs[0]!.cells.length).toBeGreaterThan(0);
  expect(state.audit.filter(a => a.action === 'PUBLISH')).toHaveLength(1);
  await expect(actor().mutation(api.declarations.publish, { ...input, originalText: 'changed' })).rejects.toThrow('COMMAND_KEY_REUSED');
});
it('denies unauthenticated, tourist and out-of-scope publication with no partial alert records', async () => {
  await expect(t.mutation(api.declarations.publish, args())).rejects.toThrow('AUTH_REQUIRED');
  await expect(actor().mutation(api.declarations.publish, { ...args(), area: { type: 'circle', center: point, radiusM: 100_000 } })).rejects.toThrow('JURISDICTION_DENIED');
  const memberships = await t.run(ctx => ctx.db.query('authorityMemberships').collect());
  await t.mutation(internal.operator.revokeAuthority, { membershipId: memberships[0]!._id, reason: 'Revoked for test' });
  await expect(actor().mutation(api.declarations.publish, args())).rejects.toThrow('AUTHORITY_REQUIRED');
  expect(await t.run(ctx => ctx.db.query('alerts').collect())).toHaveLength(0);
});
it('validates instructions, deadlines, severity and named shelter references before committing', async () => {
  for (const changes of [{ originalText: '' }, { originalText: '\u0000bad' }, { severity: 'UNKNOWN' as const }, { reviewDueAt: Date.now() - 1 }, { deadlineAt: Date.now() - 1 }, { actionKind: 'NAMED_SHELTER' as const }]) {
    await expect(actor().mutation(api.declarations.publish, { ...args(), ...changes })).rejects.toThrow('INVALID_INPUT');
  }
  expect(await t.run(ctx => ctx.db.query('authorityDeclarations').collect())).toHaveLength(0);
  expect(await t.run(ctx => ctx.db.query('jobs').collect())).toHaveLength(0);
});
it('retains separately attributed concurrent sources and rejects stale incident revisions', async () => {
  const first = await actor().mutation(api.declarations.publish, args());
  const input = { ...args(), requestId: 'publish-test-002', incidentId: first.incidentId, expectedIncidentRevision: 1, severity: 'CRITICAL' as const, originalText: 'Evacuate as directed.', actionKind: 'EVACUATE' as const };
  const second = await actor().mutation(api.declarations.publish, input);
  expect(second.alertId).toBe(first.alertId); expect(second.revision).toBe(2);
  expect(await t.run(ctx => ctx.db.query('alertSources').collect())).toHaveLength(2);
  const revisions = await t.run(ctx => ctx.db.query('alertRevisions').collect());
  expect(revisions[1]).toMatchObject({ severity: 'CRITICAL', materialReason: 'SOURCE' });
  expect(revisions[1]!.sources).toHaveLength(2);
  await expect(actor().mutation(api.declarations.publish, { ...input, requestId: 'publish-test-003' })).rejects.toThrow('REVISION_CONFLICT');
  expect(await t.run(ctx => ctx.db.query('jobs').collect())).toHaveLength(2);
});
