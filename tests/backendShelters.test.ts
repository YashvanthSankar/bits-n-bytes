/// <reference types="vite/client" />
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { convexTest, type TestConvex } from 'convex-test';
import schema from '../convex/schema';
import { api, internal } from '../convex/_generated/api';
import type { Id } from '../convex/_generated/dataModel';
import { HOUR, MINUTE } from '../src/domain/policy';

const modules = import.meta.glob('../convex/**/*.ts');
const point = { latitude: 13.0827, longitude: 80.2707 };
let t: TestConvex<typeof schema>, authority: Id<'users'>, tourist: Id<'users'>, agencyId: Id<'agencies'>,
  jurisdictionId: Id<'jurisdictions'>, otherJurisdictionId: Id<'jurisdictions'>, membershipId: Id<'authorityMemberships'>;
const actor = (id: Id<'users'>) => t.withIdentity({ subject: `${id}|session` });
function input(requestId = 'shelter-create-001') {
  return { requestId, expectedRevision: 0, jurisdictionId, name: 'Test shelter', point, address: 'Test-only address', status: 'OPEN' as const,
    capacity: 100, remaining: 40, accessibility: 'STEP_FREE' as const, facilities: ['Water', 'Toilets'], phone: '+919876543210',
    accessInstruction: 'Use the east entrance', accessRestricted: false, confirmStatus: true, reason: 'Confirmed by test authority' };
}
beforeEach(async () => {
  t = convexTest(schema, modules);
  const fixture = await t.run(async ctx => {
    const authority = await ctx.db.insert('users', { name: 'Private authority', email: 'authority@example.test' });
    const tourist = await ctx.db.insert('users', { name: 'Private tourist' });
    const agencyId = await ctx.db.insert('agencies', { name: 'Test agency', sourceLabel: 'Test issuer', active: true, audience: 'LIVE' });
    const geometryId = await ctx.db.insert('geometries', { area: { type: 'circle', center: point, radiusM: 20_000 }, source: 'JURISDICTION', sourceAccuracyM: null, version: 1, geometryHash: 'test-shelter-scope' });
    const jurisdictionId = await ctx.db.insert('jurisdictions', { agencyId, geometryId, name: 'Assigned', coverageVersion: 1, active: true });
    // Same geometry and agency: geographic overlap alone must not grant assignment.
    const otherJurisdictionId = await ctx.db.insert('jurisdictions', { agencyId, geometryId, name: 'Not assigned', coverageVersion: 1, active: true });
    return { authority, tourist, agencyId, jurisdictionId, otherJurisdictionId };
  });
  ({ authority, tourist, agencyId, jurisdictionId, otherJurisdictionId } = fixture);
  for (const user of [authority, tourist]) await actor(user).mutation(api.locations.update, { requestId: 'shelter-location-001', fix: { point, accuracyM: 10, observedAt: Date.now() }, foregroundPermission: 'granted', backgroundPermission: 'denied', source: 'FOREGROUND' });
  ({ membershipId } = await t.mutation(internal.operator.approveAuthority, { userId: authority, agencyId, jurisdictionIds: [jurisdictionId], operatorLabel: 'Test operator', reason: 'Isolated test approval' }));
});
afterEach(() => vi.restoreAllMocks());

it('denies anonymous, tourist and overlapping-but-unassigned authority writes', async () => {
  await expect(t.mutation(api.shelters.save, input())).rejects.toThrow('AUTH_REQUIRED');
  await expect(actor(tourist).mutation(api.shelters.save, input())).rejects.toThrow('AUTHORITY_REQUIRED');
  await expect(actor(authority).mutation(api.shelters.save, { ...input(), jurisdictionId: otherJurisdictionId })).rejects.toThrow('JURISDICTION_DENIED');
  await expect(actor(tourist).query(api.authority.scopes, {})).rejects.toThrow('AUTHORITY_REQUIRED');
  expect(await actor(authority).query(api.authority.scopes, {})).toEqual([{ id: jurisdictionId, name: 'Assigned', agencyName: 'Test agency', issuer: 'Test issuer', audience: 'LIVE' }]);
});

it('creates once, indexes it for tourists and returns no private actor fields', async () => {
  const args = input(); const result = await actor(authority).mutation(api.shelters.save, args);
  expect(await actor(authority).mutation(api.shelters.save, args)).toEqual(result);
  await expect(actor(authority).mutation(api.shelters.save, { ...args, name: 'Changed payload' })).rejects.toThrow('COMMAND_KEY_REUSED');
  const listed = await actor(tourist).query(api.shelters.nearby, {});
  expect(listed.items).toHaveLength(1);
  expect(listed.items[0]).toMatchObject({ id: result.shelterId, status: 'OPEN', capacity: 100, remaining: 40, issuer: 'Test issuer', stale: false, accessRestricted: false });
  expect(JSON.stringify(listed)).not.toContain(authority);
  expect(JSON.stringify(listed)).not.toContain('Private authority');
  const data = await t.run(async ctx => ({ points: await ctx.db.query('geoPoints').withIndex('by_kind_entity', q => q.eq('kind', 'SHELTER').eq('entityId', result.shelterId)).collect(), audit: await ctx.db.query('auditEvents').withIndex('by_object_createdAt', q => q.eq('objectId', result.shelterId)).collect() }));
  expect(data.points.map(p => p.precision).sort()).toEqual([3, 4]); expect(data.audit).toHaveLength(1);
  expect(data.audit[0]).toMatchObject({ actorId: authority, actorKind: 'AUTHORITY', action: 'CREATE', revision: 1 });
});

it('requires actual confirmation for availability, without refreshing status for unrelated edits', async () => {
  const args = input(); const created = await actor(authority).mutation(api.shelters.save, args);
  const now = Date.now(); vi.spyOn(Date, 'now').mockReturnValue(now + 3 * HOUR);
  const edit = { ...args, shelterId: created.shelterId, requestId: 'shelter-edit-001', expectedRevision: 1, name: 'New name', confirmStatus: false };
  expect(await actor(authority).mutation(api.shelters.save, edit)).toMatchObject({ revision: 2, statusConfirmedAt: created.statusConfirmedAt });
  expect((await actor(tourist).query(api.shelters.nearby, {})).items[0]).toMatchObject({ stale: true });
  await expect(actor(authority).mutation(api.shelters.save, { ...edit, requestId: 'shelter-edit-002', expectedRevision: 2, remaining: 30 })).rejects.toThrow('INVALID_INPUT');
  const confirmed = await actor(authority).mutation(api.shelters.save, { ...edit, requestId: 'shelter-confirm-001', expectedRevision: 2, remaining: 30, confirmStatus: true });
  expect(confirmed.statusConfirmedAt).toBe(now + 3 * HOUR);
  expect((await actor(tourist).query(api.shelters.nearby, {})).items[0]).toMatchObject({ remaining: 30, stale: false });
});

it.each(['OPEN', 'CLOSED', 'FULL', 'UNKNOWN'] as const)('maintains %s explicitly, allowing unknown capacity without inventing it', async status => {
  const result = await actor(authority).mutation(api.shelters.save, { ...input(), status, capacity: null, remaining: null, accessibility: 'UNKNOWN', phone: '' });
  expect(await actor(authority).query(api.shelters.managedDetail, { shelterId: result.shelterId })).toMatchObject({ status, capacity: null, remaining: null, accessibility: 'UNKNOWN', phone: '' });
});

it('rejects contradictory capacity, malformed fields and locations outside the assigned area', async () => {
  for (const changes of [{ capacity: -1 }, { remaining: 101 }, { capacity: 1.5 }, { status: 'FULL' as const, remaining: 2 }, { confirmStatus: false }, { name: '\u0000bad' }, { facilities: Array(21).fill('Water') }, { phone: 'unsafe link' }, { reason: 'no' }]) {
    await expect(actor(authority).mutation(api.shelters.save, { ...input(), ...changes })).rejects.toThrow('INVALID_INPUT');
  }
  await expect(actor(authority).mutation(api.shelters.save, { ...input(), point: { latitude: 13.5, longitude: 80.27 } })).rejects.toThrow('JURISDICTION_DENIED');
  await expect(actor(authority).mutation(api.shelters.save, { ...input(), point: { latitude: 1.35, longitude: 103.82 } })).rejects.toThrow('JURISDICTION_DENIED');
  expect((await actor(tourist).query(api.shelters.nearby, {})).items).toHaveLength(0);
});

it('keeps ownership immutable and rejects stale concurrent edits before changing indexes', async () => {
  const args = input(); const created = await actor(authority).mutation(api.shelters.save, args);
  const edit = { ...args, shelterId: created.shelterId, requestId: 'shelter-edit-001', expectedRevision: 1, status: 'CLOSED' as const };
  await actor(authority).mutation(api.shelters.save, edit);
  await expect(actor(authority).mutation(api.shelters.save, { ...edit, requestId: 'shelter-edit-002', status: 'OPEN' })).rejects.toThrow('REVISION_CONFLICT');
  await t.mutation(internal.operator.approveAuthority, { userId: authority, agencyId, jurisdictionIds: [jurisdictionId, otherJurisdictionId], operatorLabel: 'Test operator', reason: 'Approve another test scope' });
  await expect(actor(authority).mutation(api.shelters.save, { ...edit, requestId: 'shelter-edit-003', expectedRevision: 2, jurisdictionId: otherJurisdictionId })).rejects.toThrow('JURISDICTION_DENIED');
  expect((await actor(tourist).query(api.shelters.nearby, {})).items[0]).toMatchObject({ status: 'CLOSED', revision: 2 });
});

it('archives atomically, removes tourist indexes and preserves audited history on exact retry', async () => {
  const created = await actor(authority).mutation(api.shelters.save, input());
  const args = { requestId: 'shelter-archive-001', shelterId: created.shelterId, expectedRevision: 1, reason: 'Site permanently closed' };
  const result = await actor(authority).mutation(api.shelters.archive, args);
  expect(await actor(authority).mutation(api.shelters.archive, args)).toEqual(result);
  expect((await actor(tourist).query(api.shelters.nearby, {})).items).toEqual([]);
  expect((await actor(authority).query(api.shelters.managed, { jurisdictionId, paginationOpts: { numItems: 20, cursor: null } })).page).toEqual([]);
  const history = await t.run(async ctx => ({ record: await ctx.db.get(created.shelterId), points: await ctx.db.query('geoPoints').withIndex('by_kind_entity', q => q.eq('kind', 'SHELTER').eq('entityId', created.shelterId)).collect(), audits: await ctx.db.query('auditEvents').withIndex('by_object_createdAt', q => q.eq('objectId', created.shelterId)).collect() }));
  expect(history.record).toMatchObject({ revision: 2, archivedAt: expect.any(Number) }); expect(history.points).toHaveLength(0); expect(history.audits).toHaveLength(2);
  await expect(actor(authority).query(api.shelters.managedDetail, { shelterId: created.shelterId })).rejects.toThrow('NOT_FOUND');
});

it('rechecks revoked assignment without revoking tourist access', async () => {
  const args = input(); const created = await actor(authority).mutation(api.shelters.save, args);
  await t.mutation(internal.operator.revokeAuthority, { membershipId, reason: 'Test membership revoked' });
  await expect(actor(authority).mutation(api.shelters.save, { ...args, shelterId: created.shelterId, requestId: 'shelter-edit-001', expectedRevision: 1 })).rejects.toThrow('AUTHORITY_REQUIRED');
  await expect(actor(authority).query(api.shelters.managed, { jurisdictionId, paginationOpts: { numItems: 20, cursor: null } })).rejects.toThrow('AUTHORITY_REQUIRED');
  expect((await actor(authority).query(api.shelters.nearby, {})).items).toHaveLength(1);
  expect(await actor(authority).mutation(api.shelters.save, args)).toEqual(created); // Original receipt only; no new write.
});

it('removes inactive agency listings and rejects further privileged changes', async () => {
  const args = input(); const created = await actor(authority).mutation(api.shelters.save, args);
  await t.run(ctx => ctx.db.patch(agencyId, { active: false }));
  expect((await actor(tourist).query(api.shelters.nearby, {})).items).toHaveLength(0);
  await expect(actor(authority).mutation(api.shelters.save, { ...args, requestId: 'shelter-edit-001', shelterId: created.shelterId, expectedRevision: 1 })).rejects.toThrow('AUTHORITY_REQUIRED');
});

it('paginates management records without truncating and isolates DEMO from tourist lists', async () => {
  const results: { shelterId: Id<'shelters'> }[] = [];
  for (let i = 0; i < 3; i++) results.push(await actor(authority).mutation(api.shelters.save, { ...input('shelter-page-000' + i), name: 'Shelter ' + i }));
  const first = await actor(authority).query(api.shelters.managed, { jurisdictionId, paginationOpts: { numItems: 2, cursor: null } });
  const second = await actor(authority).query(api.shelters.managed, { jurisdictionId, paginationOpts: { numItems: 2, cursor: first.continueCursor } });
  expect(first.isDone).toBe(false); expect(second.isDone).toBe(true);
  expect(new Set([...first.page, ...second.page].map(s => s.id)).size).toBe(3);
  await t.run(async ctx => { await ctx.db.patch(results[0]!.shelterId, { audience: 'DEMO' }); });
  expect((await actor(tourist).query(api.shelters.nearby, {})).items).toHaveLength(2);
  await expect(actor(authority).query(api.shelters.managed, { jurisdictionId, paginationOpts: { numItems: 51, cursor: null } })).rejects.toThrow('INVALID_INPUT');
});

it('requires current India admission for new authority maintenance', async () => {
  vi.spyOn(Date, 'now').mockReturnValue(Date.now() + 24 * HOUR + MINUTE);
  await expect(actor(authority).mutation(api.shelters.save, input())).rejects.toThrow('LOCATION_STALE');
});

it('shows real availability/access limitations without claiming hazard screening or exposing profile details', async () => {
  await actor(tourist).mutation(api.profiles.save, { requestId: 'tourist-profile-001', expectedRevision: 0, name: 'Private traveler', language: 'en', stepFreeNeeded: true, bloodGroup: 'AB+' });
  const created = await actor(authority).mutation(api.shelters.save, { ...input(), remaining: 0, accessibility: 'UNKNOWN', accessRestricted: true });
  const fresh = await actor(tourist).query(api.shelters.detail, { shelterId: created.shelterId });
  expect(fresh).toMatchObject({ limitations: ['FULL', 'ACCESS_RESTRICTED', 'STEP_FREE_NOT_CONFIRMED'], recommendationAvailable: false, hazardCheck: 'PENDING', locationFresh: true });
  const now = Date.now(); vi.spyOn(Date, 'now').mockReturnValue(now + 3 * HOUR);
  const aged = await actor(tourist).query(api.shelters.detail, { shelterId: created.shelterId });
  expect(aged.limitations).toContain('STALE'); expect(aged.locationFresh).toBe(false);
  for (const privateValue of ['Private traveler', 'AB+', tourist, authority]) expect(JSON.stringify(aged)).not.toContain(privateValue);
});

it('does not expose archived, inactive-source or unapproved DEMO shelter details', async () => {
  const created = await actor(authority).mutation(api.shelters.save, input());
  await expect(t.query(api.shelters.detail, { shelterId: created.shelterId })).rejects.toThrow('AUTH_REQUIRED');
  await t.run(ctx => ctx.db.patch(created.shelterId, { audience: 'DEMO' }));
  await expect(actor(tourist).query(api.shelters.detail, { shelterId: created.shelterId })).rejects.toThrow('NOT_FOUND');
  await t.run(ctx => ctx.db.patch(created.shelterId, { audience: 'LIVE' }));
  await actor(authority).mutation(api.shelters.archive, { requestId: 'public-archive-001', shelterId: created.shelterId, expectedRevision: 1, reason: 'No longer listed' });
  await expect(actor(tourist).query(api.shelters.detail, { shelterId: created.shelterId })).rejects.toThrow('NOT_FOUND');
});
