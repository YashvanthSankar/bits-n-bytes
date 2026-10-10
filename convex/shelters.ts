import geohash from 'ngeohash';
import { mutation, query, type MutationCtx } from './_generated/server';
import { v } from 'convex/values';
import { paginationOptsValidator } from 'convex/server';
import type { Doc, Id } from './_generated/dataModel';
import { containsCircle, requireAssignedJurisdiction, requireIndiaAccess, requireUser } from './lib/authorization';
import { countryStatus, distanceM } from '../src/domain/geography';
import { MINUTE, POLICY } from '../src/domain/policy';
import { accessibility, point, shelterStatus } from './lib/validators';
import { command } from './lib/idempotency';
import { reject } from './lib/errors';

function text(value: string, min: number, max: number, multiline = false) {
  const clean = value.trim();
  if (clean.length < min || clean.length > max || (multiline ? /[\u0000-\u0008\u000b\u000c\u000e-\u001f]/ : /[\u0000-\u001f]/).test(clean)) reject('INVALID_INPUT');
  return clean;
}
function count(value: number | null) {
  if (value !== null && (!Number.isSafeInteger(value) || value < 0 || value > 1_000_000)) reject('INVALID_INPUT');
  return value;
}
function publicShelter(s: Doc<'shelters'>, issuer: string) {
  return { id: s._id, jurisdictionId: s.jurisdictionId, name: s.name, point: s.point, address: s.address, status: s.status,
    statusConfirmedAt: s.statusConfirmedAt, capacity: s.capacity, remaining: s.remaining, accessibility: s.accessibility,
    facilities: s.facilities, phone: s.phone, accessInstruction: s.accessInstruction, accessRestricted: s.accessRestricted,
    revision: s.revision, audience: s.audience, issuer, stale: Date.now() - s.statusConfirmedAt > POLICY.shelterFreshMs };
}
async function removeIndex(ctx: MutationCtx, shelterId: Id<'shelters'>) {
  const old = await ctx.db.query('geoPoints').withIndex('by_kind_entity', q => q.eq('kind', 'SHELTER').eq('entityId', shelterId)).take(3);
  if (old.length > 2) return reject('CONFIGURATION_REQUIRED');
  for (const entry of old) await ctx.db.delete(entry._id);
}

/** Public maintained information, never a claim that a shelter or route is hazard-free. */
export const detail = query({ args: { shelterId: v.id('shelters') }, handler: async (ctx, args) => {
  const { userId, location } = await requireIndiaAccess(ctx);
  const shelter = await ctx.db.get(args.shelterId);
  if (!shelter || shelter.archivedAt !== undefined) return reject('NOT_FOUND');
  const profile = await ctx.db.query('profiles').withIndex('by_user', q => q.eq('userId', userId)).unique();
  if (shelter.audience === 'DEMO' && !profile?.demoEnabled) return reject('NOT_FOUND');
  const agency = await ctx.db.get(shelter.agencyId);
  if (!agency?.active || agency.audience !== shelter.audience) return reject('NOT_FOUND');
  const value = publicShelter(shelter, agency.sourceLabel);
  const limitations: ('CLOSED' | 'FULL' | 'UNKNOWN' | 'STALE' | 'ACCESS_RESTRICTED' | 'STEP_FREE_NOT_CONFIRMED')[] = [];
  if (shelter.status === 'CLOSED') limitations.push('CLOSED');
  if (shelter.status === 'FULL' || shelter.remaining === 0 || shelter.capacity === 0) limitations.push('FULL');
  if (shelter.status === 'UNKNOWN') limitations.push('UNKNOWN');
  if (value.stale) limitations.push('STALE');
  if (shelter.accessRestricted) limitations.push('ACCESS_RESTRICTED');
  if (profile?.stepFreeNeeded && shelter.accessibility !== 'STEP_FREE') limitations.push('STEP_FREE_NOT_CONFIRMED');
  return { ...value, limitations, recommendationAvailable: false as const, hazardCheck: 'PENDING' as const,
    distanceM: distanceM(location.point, shelter.point), locationObservedAt: location.observedAt,
    locationFresh: Date.now() - location.observedAt <= 15 * MINUTE && location.accuracyM <= 1_000, serverTime: Date.now() };
} });

export const managed = query({ args: { jurisdictionId: v.id('jurisdictions'), paginationOpts: paginationOptsValidator }, handler: async (ctx, args) => {
  const { agency } = await requireAssignedJurisdiction(ctx, args.jurisdictionId);
  if (!Number.isInteger(args.paginationOpts.numItems) || args.paginationOpts.numItems < 1 || args.paginationOpts.numItems > 50) return reject('INVALID_INPUT');
  const result = await ctx.db.query('shelters').withIndex('by_jurisdiction_archivedAt', q => q.eq('jurisdictionId', args.jurisdictionId).eq('archivedAt', undefined)).paginate(args.paginationOpts);
  return { ...result, page: result.page.filter(s => s.agencyId === agency._id && s.audience === agency.audience).map(s => publicShelter(s, agency.sourceLabel)) };
} });

export const managedDetail = query({ args: { shelterId: v.id('shelters') }, handler: async (ctx, args) => {
  await requireIndiaAccess(ctx);
  const shelter = await ctx.db.get(args.shelterId);
  if (!shelter) return reject('NOT_FOUND');
  const { agency } = await requireAssignedJurisdiction(ctx, shelter.jurisdictionId);
  if (shelter.agencyId !== agency._id || shelter.audience !== agency.audience || shelter.archivedAt !== undefined) return reject('NOT_FOUND');
  return publicShelter(shelter, agency.sourceLabel);
} });

export const save = mutation({ args: {
  requestId: v.string(), expectedRevision: v.number(), shelterId: v.optional(v.id('shelters')), jurisdictionId: v.id('jurisdictions'),
  name: v.string(), point, address: v.string(), status: shelterStatus, capacity: v.union(v.number(), v.null()), remaining: v.union(v.number(), v.null()),
  accessibility, facilities: v.array(v.string()), phone: v.string(), accessInstruction: v.string(), accessRestricted: v.boolean(),
  confirmStatus: v.boolean(), reason: v.string(),
}, handler: async (ctx, args) => {
  const userId = await requireUser(ctx);
  return command(ctx, userId, 'SHELTER_SAVE', args.requestId, args, async () => {
    const { agency, area } = await requireAssignedJurisdiction(ctx, args.jurisdictionId);
    const current = args.shelterId ? await ctx.db.get(args.shelterId) : null;
    if (args.shelterId && !current) return reject('NOT_FOUND');
    // Ownership/scope cannot be reassigned through an edit.
    if (current && (current.archivedAt !== undefined || current.jurisdictionId !== args.jurisdictionId || current.agencyId !== agency._id || current.audience !== agency.audience)) return reject('JURISDICTION_DENIED');
    if (args.expectedRevision !== (current?.revision ?? 0)) return reject('REVISION_CONFLICT', { currentRevision: current?.revision ?? 0 });
    if (countryStatus({ point: args.point, accuracyM: 0.001, observedAt: Date.now() }) !== 'INSIDE_INDIA'
      || !containsCircle(area, { type: 'circle', center: args.point, radiusM: 0.001 })) return reject('JURISDICTION_DENIED');
    const capacity = count(args.capacity), remaining = count(args.remaining);
    if (capacity !== null && remaining !== null && remaining > capacity) return reject('INVALID_INPUT');
    if (args.status === 'FULL' && remaining !== null && remaining !== 0) return reject('INVALID_INPUT');
    if (args.facilities.length > 20 || (args.phone && !/^\+?[0-9 ()-]{7,24}$/.test(args.phone))) return reject('INVALID_INPUT');
    const availabilityChanged = !current || current.status !== args.status || current.capacity !== capacity || current.remaining !== remaining
      || current.point.latitude !== args.point.latitude || current.point.longitude !== args.point.longitude;
    if (availabilityChanged && !args.confirmStatus) return reject('INVALID_INPUT');
    const reason = text(args.reason, 5, 500, true), now = Date.now(), revision = (current?.revision ?? 0) + 1;
    const value = { agencyId: agency._id, jurisdictionId: args.jurisdictionId, audience: agency.audience, name: text(args.name, 2, 120),
      point: args.point, address: text(args.address, 3, 500, true), status: args.status, capacity, remaining,
      accessibility: args.accessibility, facilities: [...new Set(args.facilities.map(f => text(f, 1, 50)))], phone: args.phone.trim(),
      accessInstruction: text(args.accessInstruction, 0, 1_000, true), accessRestricted: args.accessRestricted,
      statusConfirmedAt: args.confirmStatus ? now : current!.statusConfirmedAt, revision };
    const shelterId = current?._id ?? await ctx.db.insert('shelters', value);
    if (current) await ctx.db.patch(shelterId, value);
    await removeIndex(ctx, shelterId);
    for (const precision of [3, 4]) await ctx.db.insert('geoPoints', { kind: 'SHELTER', entityId: shelterId, precision,
      cell: geohash.encode(args.point.latitude, args.point.longitude, precision), point: args.point, active: true });
    await ctx.db.insert('auditEvents', { actorId: userId, actorKind: 'AUTHORITY', objectKind: 'SHELTER', objectId: shelterId, revision,
      action: current ? (args.confirmStatus ? 'UPDATE_AND_CONFIRM' : 'UPDATE') : 'CREATE', reason, createdAt: now });
    return { shelterId, revision, statusConfirmedAt: value.statusConfirmedAt };
  });
} });

export const archive = mutation({ args: { requestId: v.string(), shelterId: v.id('shelters'), expectedRevision: v.number(), reason: v.string() }, handler: async (ctx, args) => {
  const userId = await requireUser(ctx);
  return command(ctx, userId, 'SHELTER_ARCHIVE', args.requestId, args, async () => {
    const current = await ctx.db.get(args.shelterId);
    if (!current || current.archivedAt !== undefined) return reject('NOT_FOUND');
    const { agency } = await requireAssignedJurisdiction(ctx, current.jurisdictionId);
    if (agency._id !== current.agencyId || agency.audience !== current.audience) return reject('JURISDICTION_DENIED');
    if (args.expectedRevision !== current.revision) return reject('REVISION_CONFLICT', { currentRevision: current.revision });
    const reason = text(args.reason, 5, 500, true), revision = current.revision + 1, now = Date.now();
    await ctx.db.patch(current._id, { archivedAt: now, revision });
    await removeIndex(ctx, current._id);
    await ctx.db.insert('auditEvents', { actorId: userId, actorKind: 'AUTHORITY', objectKind: 'SHELTER', objectId: current._id, revision, action: 'ARCHIVE', reason, createdAt: now });
    return { shelterId: current._id, revision };
  });
} });

/** Listed shelters only. Recommendation eligibility is a separate unfinished workflow. */
export const nearby=query({args:{},handler:async ctx=>{
  const {location}=await requireIndiaAccess(ctx);
  const center=geohash.encode(location.point.latitude,location.point.longitude,3);
  const items=[]; const seen=new Set<string>();let partial=false;
  for(const cell of [center,...geohash.neighbors(center)]) {
    const points=await ctx.db.query('geoPoints').withIndex('by_kind_precision_cell_active',q=>q.eq('kind','SHELTER').eq('precision',3).eq('cell',cell).eq('active',true)).take(31);
    if(points.length>30) partial=true;
    for(const entry of points.slice(0,30)) {
      if(seen.has(entry.entityId)) continue;seen.add(entry.entityId);
      const id=ctx.db.normalizeId('shelters',entry.entityId);if(!id)continue;
      const shelter=await ctx.db.get(id);
      if(!shelter || shelter.archivedAt!==undefined || shelter.audience!=='LIVE')continue;
      const distance=distanceM(location.point,shelter.point);if(distance>POLICY.shelterRadiusM)continue;
      if(items.length>=30){partial=true;continue;}
      const agency=await ctx.db.get(shelter.agencyId);if(!agency?.active || agency.audience!==shelter.audience)continue;
      items.push({id:shelter._id,name:shelter.name,point:shelter.point,address:shelter.address,status:shelter.status,statusConfirmedAt:shelter.statusConfirmedAt,
        capacity:shelter.capacity,remaining:shelter.remaining,accessibility:shelter.accessibility,facilities:shelter.facilities,phone:shelter.phone,accessInstruction:shelter.accessInstruction,
        accessRestricted:shelter.accessRestricted,issuer:agency.sourceLabel,distanceM:distance,stale:Date.now()-shelter.statusConfirmedAt>POLICY.shelterFreshMs,revision:shelter.revision});
    }
  }
  return {items:items.sort((a,b)=>a.distanceM-b.distanceM),partial,radiusM:POLICY.shelterRadiusM,locationObservedAt:location.observedAt,serverTime:Date.now()};
} });
