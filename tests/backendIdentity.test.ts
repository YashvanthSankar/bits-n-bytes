/// <reference types="vite/client" />
import { beforeEach, describe, expect, it } from 'vitest';
import { convexTest, type TestConvex } from 'convex-test';
import schema from '../convex/schema';
import { api, internal } from '../convex/_generated/api';
import type { Id } from '../convex/_generated/dataModel';
import { HOUR, MINUTE } from '../src/domain/policy';
import geohash from 'ngeohash';

const modules = import.meta.glob('../convex/**/*.ts');
const position = { latitude: 12.82, longitude: 80.04 };
const makeFix = (accuracyM = 20, ageMs = 0) => ({ point: position, accuracyM, observedAt: Date.now() - ageMs });
const locationArgs = (requestId: string) => ({ requestId, fix: makeFix(), foregroundPermission: 'granted' as const, backgroundPermission: 'denied' as const, source: 'FOREGROUND' as const });
const profileArgs = { requestId: 'profile-save-0001', expectedRevision: 0, name: 'Private Tourist', language: 'en' as const, stepFreeNeeded: false, bloodGroup: 'AB+', emergencyContact: { name: 'Private Contact', phone: '+919876543210' } };

describe('server identity, admission and privacy', () => {
  let t: TestConvex<typeof schema>;
  let a: Id<'users'>, b: Id<'users'>;
  beforeEach(async () => {
    t = convexTest(schema, modules);
    [a, b] = await t.run(async ctx => [await ctx.db.insert('users', { name: 'First', email: 'first@example.test' }), await ctx.db.insert('users', { name: 'Second', email: 'second@example.test' })]);
  });
  const actor = (userId: Id<'users'>) => t.withIdentity({ subject: `${userId}|session` });

  it('rejects anonymous private reads and location writes', async () => {
    await expect(t.query(api.profiles.me, {})).rejects.toThrow('AUTH_REQUIRED');
    await expect(t.mutation(api.locations.update, locationArgs('location-update-001'))).rejects.toThrow('AUTH_REQUIRED');
  });
  it('cannot select another tourist through private read arguments', async () => {
    await expect(actor(a).query(api.locations.me, { userId: b } as never)).rejects.toThrow();
    await expect(actor(a).query(api.profiles.me, { userId: b } as never)).rejects.toThrow();
  });
  it('defaults to tourist and rejects a client-supplied authority role', async () => {
    expect((await actor(a).query(api.profiles.me, {})).role).toBe('TOURIST');
    await expect(actor(a).mutation(api.profiles.save, { ...profileArgs, role: 'AUTHORITY' } as never)).rejects.toThrow();
  });
  it('requires server admission for initial profile and persists only to the session owner', async () => {
    await expect(actor(a).mutation(api.profiles.save, profileArgs)).rejects.toThrow('LOCATION_REQUIRED');
    await actor(a).mutation(api.locations.update, locationArgs('location-update-001'));
    await actor(a).mutation(api.profiles.save, profileArgs);
    expect((await actor(a).query(api.profiles.me, {})).profile).toMatchObject({ name: 'Private Tourist', bloodGroup: 'AB+', emergencyContact: profileArgs.emergencyContact, revision: 1 });
    expect((await actor(b).query(api.profiles.me, {})).profile).toBeNull();
    expect(await actor(b).query(api.locations.me, {})).toBeNull();
  });
  it('deduplicates retries but rejects changed payloads and stale revisions', async () => {
    await actor(a).mutation(api.locations.update, locationArgs('location-update-001'));
    expect(await actor(a).mutation(api.profiles.save, profileArgs)).toEqual({ revision: 1 });
    expect(await actor(a).mutation(api.profiles.save, profileArgs)).toEqual({ revision: 1 });
    await expect(actor(a).mutation(api.profiles.save, { ...profileArgs, name: 'Different' })).rejects.toThrow('COMMAND_KEY_REUSED');
    await expect(actor(a).mutation(api.profiles.save, { ...profileArgs, requestId: 'profile-save-0002' })).rejects.toThrow('REVISION_CONFLICT');
    const records = await t.run(ctx => ctx.db.query('profiles').collect());
    expect(records).toHaveLength(1);
  });
  it('does not allow stale or coarse location to create admission', async () => {
    expect(await actor(a).mutation(api.locations.update, { ...locationArgs('location-update-001'), fix: makeFix(500, 6 * MINUTE) })).toMatchObject({ admitted: false });
    await expect(actor(a).mutation(api.profiles.save, profileArgs)).rejects.toThrow('LOCATION_REQUIRED');
    await expect(actor(a).mutation(api.locations.update, { ...locationArgs('location-update-002'), fix: makeFix(20, HOUR) })).rejects.toThrow('LOCATION_STALE');
    await expect(actor(a).mutation(api.locations.update, { ...locationArgs('location-update-003'), fix: { ...makeFix(), observedAt: Date.now() + HOUR } })).rejects.toThrow('LOCATION_INVALID');
  });
  it('changes only the authenticated profile language with revision/replay guards',async()=>{
    await actor(a).mutation(api.locations.update,locationArgs('language-location-001'));
    await actor(a).mutation(api.profiles.save,profileArgs);
    const change={requestId:'language-save-0001',expectedRevision:1,language:'ta' as const};
    await expect(t.mutation(api.profiles.setLanguage,change)).rejects.toThrow('AUTH_REQUIRED');
    await expect(actor(b).mutation(api.profiles.setLanguage,change)).rejects.toThrow('NOT_FOUND');
    expect(await actor(a).mutation(api.profiles.setLanguage,change)).toEqual({revision:2});
    expect(await actor(a).mutation(api.profiles.setLanguage,change)).toEqual({revision:2});
    await expect(actor(a).mutation(api.profiles.setLanguage,{...change,requestId:'language-save-0002'})).rejects.toThrow('REVISION_CONFLICT');
    await expect(actor(a).mutation(api.profiles.setLanguage,{...change,language:'fr'})).rejects.toThrow('COMMAND_KEY_REUSED');
    expect((await actor(a).query(api.profiles.me,{})).profile).toMatchObject({language:'ta',name:profileArgs.name,bloodGroup:'AB+',emergencyContact:profileArgs.emergencyContact,revision:2});
  });
  it('keeps one latest fix, ignores older replay, and removes geographic eligibility outside India', async () => {
    const first = locationArgs('location-update-001');
    await actor(a).mutation(api.locations.update, first);
    await expect(actor(a).mutation(api.locations.update, { ...first, requestId: 'location-update-002', fix: { ...first.fix, observedAt: first.fix.observedAt - 1 } })).rejects.toThrow('REVISION_CONFLICT');
    await actor(a).mutation(api.locations.update, { ...locationArgs('location-update-003'), fix: { ...makeFix(), point: { latitude: 1.35, longitude: 103.82 } } });
    const records = await t.run(async ctx => ({ locations: await ctx.db.query('locations').collect(), geo: await ctx.db.query('geoPoints').collect() }));
    expect(records.locations).toHaveLength(1);
    expect(records.locations[0]!.countryStatus).toBe('OUTSIDE_INDIA');
    expect(records.geo).toHaveLength(0);
  });
});

describe('incident read models and authority scope', () => {
  async function fixture() {
    const t = convexTest(schema, modules);
    const ids = await t.run(async ctx => {
      const userId = await ctx.db.insert('users', { email: 'private@example.test' });
      const geometryId = await ctx.db.insert('geometries', { area: { type: 'circle', center: position, radiusM: 5_000 }, source: 'COMMUNITY', sourceAccuracyM: 20, version: 1, geometryHash: 'incident' });
      const incidentId = await ctx.db.insert('incidents', { hazard: 'FLASH_FLOOD', locality: 'Test locality', geometryId, provenance: 'COMMUNITY', verification: 'UNVERIFIED', lifecycle: 'ACTIVE', qualification: null, assessmentStatus: 'PENDING', severity: 'UNKNOWN', recentWitnesses: 1, totalWitnesses: 1, lastObservedAt: Date.now(), staleAt: Date.now() + HOUR, revision: 1, evidenceGeneration: 1, controlRevision: 1, nextAssessmentAt: Date.now(), audience: 'LIVE' });
      await ctx.db.insert('observations', { incidentId, authorId: userId, alias: 'Private origin', capturedPoint: { latitude: 12.819876, longitude: 80.039876 }, fixObservedAt: Date.now(), accuracyM: 10, observedAt: Date.now(), receivedAt: Date.now(), description: 'Private observation evidence', status: 'ACTIVE', revision: 1, lastContributionAt: Date.now(), provenance: 'COMMUNITY' });
      return { userId, incidentId, geometryId };
    });
    const tourist = t.withIdentity({ subject: `${ids.userId}|session` });
    await tourist.mutation(api.locations.update, locationArgs('location-update-001'));
    await tourist.mutation(api.profiles.save, profileArgs);
    return { t, tourist, ...ids };
  }
  it('public incident detail never includes private profile/witness fields', async () => {
    const { tourist, incidentId, userId } = await fixture();
    const detail = await tourist.query(api.incidents.detail, { incidentId });
    expect(detail).toMatchObject({ verification: 'UNVERIFIED', qualification: null, recentWitnesses: 1 });
    const serialized = JSON.stringify(detail);
    for (const privateValue of [userId, 'Private Tourist', 'Private Contact', '+919876543210', 'AB+', 'Private origin', 'Private observation evidence', '12.819876']) expect(serialized).not.toContain(privateValue);
  });
  it('tourists cannot invoke authority review', async () => {
    const { tourist, incidentId } = await fixture();
    await expect(tourist.query(api.authority.reviewIncident, { incidentId })).rejects.toThrow('AUTHORITY_REQUIRED');
  });
  it('checks active agency, assigned jurisdiction and the full affected radius', async () => {
    const { t, tourist, incidentId, userId, geometryId } = await fixture();
    const ids = await t.run(async ctx => {
      const scope = await ctx.db.insert('geometries', { area: { type: 'circle', center: position, radiusM: 10_000 }, source: 'OPERATOR', sourceAccuracyM: null, version: 1, geometryHash: 'jurisdiction' });
      const agencyId = await ctx.db.insert('agencies', { name: 'Test agency', sourceLabel: 'Test agency', active: true, audience: 'LIVE' });
      const jurisdictionId = await ctx.db.insert('jurisdictions', { agencyId, name: 'Pilot area', geometryId: scope, coverageVersion: 1, active: true });
      const membershipId = await ctx.db.insert('authorityMemberships', { userId, agencyId, jurisdictionIds: [jurisdictionId], status: 'ACTIVE', approvedBy: 'TEST_OPERATOR', approvedAt: Date.now() });
      return { membershipId, agencyId };
    });
    expect((await tourist.query(api.profiles.me, {})).role).toBe('AUTHORITY');
    expect((await tourist.query(api.authority.reviewIncident, { incidentId })).id).toBe(incidentId);
    await t.run(ctx => ctx.db.patch(geometryId, { area: { type: 'circle', center: position, radiusM: 10_001 } }));
    await expect(tourist.query(api.authority.reviewIncident, { incidentId })).rejects.toThrow('JURISDICTION_DENIED');
    await t.run(ctx => ctx.db.patch(geometryId, { area: { type: 'circle', center: position, radiusM: 5_000 } }));
    await t.run(ctx => ctx.db.patch(ids.agencyId, { active: false }));
    await expect(tourist.query(api.authority.reviewIncident, { incidentId })).rejects.toThrow('AUTHORITY_REQUIRED');
    await t.run(async ctx => { await ctx.db.patch(ids.agencyId, { active: true }); await ctx.db.patch(ids.membershipId, { status: 'REVOKED', revokedAt: Date.now() }); });
    expect((await tourist.query(api.profiles.me, {})).role).toBe('TOURIST');
    await expect(tourist.query(api.authority.reviewIncident, { incidentId })).rejects.toThrow('AUTHORITY_REQUIRED');
  });
  it('isolates demo incidents from ordinary tourist detail', async () => {
    const { t, tourist, incidentId } = await fixture();
    await t.run(ctx => ctx.db.patch(incidentId, { audience: 'DEMO' }));
    await expect(tourist.query(api.incidents.detail, { incidentId })).rejects.toThrow('NOT_FOUND');
  });
  it('bounds candidate pages and never returns user-location index entries', async () => {
    const { tourist } = await fixture();
    const cell = geohash.encode(position.latitude, position.longitude, 4);
    const result = await tourist.query(api.incidents.inCell, { cell, paginationOpts: { numItems: 100, cursor: null } });
    expect(result.items).toEqual([]);
    expect(result.candidatePage).toBe(true);
    await expect(tourist.query(api.incidents.inCell, { cell, paginationOpts: { numItems: 101, cursor: null } })).rejects.toThrow('INVALID_INPUT');
  });
  it('operator approval is internal and enforces the agency/jurisdiction association', async () => {
    const { t, tourist, userId } = await fixture();
    const ids = await t.run(async ctx => {
      const area = await ctx.db.insert('geometries', { area: { type: 'circle', center: position, radiusM: 10_000 }, source: 'OPERATOR', sourceAccuracyM: null, version: 1, geometryHash: 'jurisdiction' });
      const agencyId = await ctx.db.insert('agencies', { name: 'Agency one', sourceLabel: 'Agency one', active: true, audience: 'LIVE' });
      const otherId = await ctx.db.insert('agencies', { name: 'Agency two', sourceLabel: 'Agency two', active: true, audience: 'LIVE' });
      const jurisdictionId = await ctx.db.insert('jurisdictions', { agencyId, name: 'Pilot', geometryId: area, coverageVersion: 1, active: true });
      return { agencyId, otherId, jurisdictionId };
    });
    const args = { userId, agencyId: ids.agencyId, jurisdictionIds: [ids.jurisdictionId], operatorLabel: 'Test operator', reason: 'Approved test fixture' };
    await expect(t.mutation(internal.operator.approveAuthority, { ...args, agencyId: ids.otherId })).rejects.toThrow('JURISDICTION_DENIED');
    const result = await t.mutation(internal.operator.approveAuthority, args);
    expect((await tourist.query(api.profiles.me, {})).role).toBe('AUTHORITY');
    await t.mutation(internal.operator.revokeAuthority, { membershipId: result.membershipId, reason: 'Revoked test fixture' });
    expect((await tourist.query(api.profiles.me, {})).role).toBe('TOURIST');
    expect(await t.run(ctx => ctx.db.query('auditEvents').collect())).toHaveLength(2);
  });
});
