import { ConvexError, v } from 'convex/values';
import geohash from 'ngeohash';
import { mutation, query, internalMutation, type QueryCtx, type MutationCtx } from './_generated/server';
import type { Id, Doc } from './_generated/dataModel';
import { internal } from './_generated/api';
import type { PublicIncident } from '../src/contracts/domain';
import { requireUser, requireIndiaAccess, requireEligibleFix, activeMemberships, requireAuthorityForCircle, containsCircle } from './lib/authorization';
import { command, payloadHash } from './lib/idempotency';
import { reject } from './lib/errors';
import { hazard, fix, audience } from './lib/validators';
import { HAZARD_POLICY, HOUR, POLICY } from '../src/domain/policy';
import { countryStatus, distanceM } from '../src/domain/geography';
import { validateFix, validateIndiaFix } from '../src/domain/eligibility';
import { currentIncidentState, witnessSummary } from '../src/domain/incidentState';
import { freshIncidentDTO } from './lib/publicModels';

function cells(point: { latitude: number; longitude: number }, precision: number) {
  const center = geohash.encode(point.latitude, point.longitude, precision);
  return [center, ...geohash.neighbors(center)];
}
async function resolve(ctx: QueryCtx, id: Id<'incidents'>) {
  const visited = new Set<string>();
  for (let hop = 0; hop < 16; hop++) {
    if (visited.has(id)) return reject('CONFIGURATION_REQUIRED'); visited.add(id);
    const incident = await ctx.db.get(id);
    if (!incident) return reject('NOT_FOUND');
    if (!incident.mergedInto) return incident;
    id = incident.mergedInto;
  }
  return reject('CONFIGURATION_REQUIRED');
}
async function mayObserve(ctx: QueryCtx, incident: Doc<'incidents'>, location: Doc<'locations'>) {
  const geometry = await ctx.db.get(incident.geometryId);
  if (geometry && ['AUTHORITY_AFFECTED_AREA', 'SACHET_AREA'].includes(geometry.source)
    && containsCircle(geometry.area, { type: 'circle', center: location.point, radiusM: Math.max(location.accuracyM, 0.001) })) return;
  let truncated = false;
  for (const cell of cells(location.point, 5)) {
    const origins = await ctx.db.query('observationOrigins').withIndex('by_incident_cell', q => q.eq('incidentId', incident._id).eq('cell', cell)).take(101);
    if (origins.length > 100) truncated = true;
    for (const origin of origins) if (origin.active && distanceM(location.point, origin.point) + location.accuracyM + origin.accuracyM <= 1_000) return;
  }
  if (truncated) return reject('CONFIGURATION_REQUIRED');
  return reject('OBSERVATION_TOO_FAR');
}
/** Bounded pilot aggregate; exceeding the bound fails explicitly, never produces a fake exact count. */
async function refresh(ctx: MutationCtx, incidentId: Id<'incidents'>) {
  const incident = await ctx.db.get(incidentId); if (!incident) return;
  const active = await ctx.db.query('observations').withIndex('by_incident_status_observedAt', q => q.eq('incidentId', incidentId).eq('status', 'ACTIVE')).take(501);
  if (active.length > 500) return reject('CONFIGURATION_REQUIRED');
  const now = Date.now(); const counts = witnessSummary(active, incident.hazard, now);
  const state = currentIncidentState(incident, incident.hazard, counts.recent, now);
  if (counts.recent !== incident.recentWitnesses || counts.total !== incident.totalWitnesses || state.verification !== incident.verification || state.lifecycle !== incident.lifecycle) {
    await ctx.db.patch(incidentId, { recentWitnesses: counts.recent, totalWitnesses: counts.total, ...state, revision: incident.revision + 1, evidenceGeneration: incident.evidenceGeneration + 1, nextAssessmentAt: now });
  }
  const nextExpiry = active.filter(item => item.observedAt + HAZARD_POLICY[incident.hazard].witnessWindowMs >= now)
    .map(item => item.observedAt + HAZARD_POLICY[incident.hazard].witnessWindowMs + 1);
  const timers = [...nextExpiry, incident.staleAt + 1, incident.lastObservedAt + 48 * HOUR + 1].filter(time => time > now);
  if (timers.length && ['ACTIVE','STALE'].includes(state.lifecycle)) await ctx.scheduler.runAt(Math.min(...timers), internal.observations.refreshState, { incidentId, generation: (await ctx.db.get(incidentId))!.evidenceGeneration });
}
export const refreshState = internalMutation({ args: { incidentId: v.id('incidents'), generation: v.number() }, handler: async (ctx, args) => {
  const incident = await ctx.db.get(args.incidentId); if (!incident || incident.evidenceGeneration !== args.generation) return;
  await refresh(ctx, args.incidentId);
} });

export const eligibility = query({ args: { incidentId: v.id('incidents') }, handler: async (ctx, args) => {
  const { location, userId } = await requireIndiaAccess(ctx);
  const incident = await resolve(ctx,args.incidentId);
  if (incident.audience === 'DEMO') {
    const profile = await ctx.db.query('profiles').withIndex('by_user', q=>q.eq('userId',userId)).unique();
    if (!profile?.demoEnabled) return reject('NOT_FOUND');
  }
  const checked = validateFix(location,Date.now(),POLICY.entryFix);
  if (!checked.ok) return { eligible:false, reason:checked.error.code, retryAfterMs:0 };
  if (!['ACTIVE','STALE'].includes(currentIncidentState(incident,incident.hazard,incident.recentWitnesses,Date.now()).lifecycle)) return { eligible:false,reason:'INCIDENT_CLOSED' as const,retryAfterMs:0 };
  try { await mayObserve(ctx,incident,location); }
  catch (error) {
    if (error instanceof ConvexError && typeof error.data === 'object' && error.data && 'code' in error.data && error.data.code === 'OBSERVATION_TOO_FAR') return { eligible:false,reason:'OBSERVATION_TOO_FAR' as const,retryAfterMs:0 };
    throw error;
  }
  return { eligible:true,reason:null,retryAfterMs:0 };
} });

export const candidates = query({ args: { hazard, audience: v.optional(audience) }, handler: async (ctx, args) => {
  const { location, userId } = await requireEligibleFix(ctx);
  const profile = await ctx.db.query('profiles').withIndex('by_user', q => q.eq('userId', userId)).unique();
  const selectedAudience = args.audience ?? 'LIVE';
  if (selectedAudience === 'DEMO' && !profile?.demoEnabled) return reject('NOT_FOUND');
  const found = new Map<string, PublicIncident>(); let partial = false;
  const now = Date.now(); const radius = args.hazard === 'CYCLONE' ? 10_000 : 1_000;
  for (const cell of cells(location.point, 4)) {
    const points = await ctx.db.query('geoPoints').withIndex('by_kind_precision_cell_active', q => q.eq('kind','INCIDENT').eq('precision',4).eq('cell',cell).eq('active',true)).take(31);
    if (points.length > 30) partial = true;
    for (const candidate of points.slice(0,30)) {
      if (distanceM(candidate.point, location.point) > radius) continue;
      const id = ctx.db.normalizeId('incidents', candidate.entityId); if (!id) continue;
      const incident = await ctx.db.get(id);
      if (!incident || incident.hazard !== args.hazard || !['ACTIVE','STALE'].includes(incident.lifecycle) || now - incident.lastObservedAt > POLICY.maxObservationAgeMs || incident.audience !== selectedAudience) continue;
      if (found.has(id)) continue;
      if (found.size >= 30) { partial = true; continue; }
      const geometry = await ctx.db.get(incident.geometryId);
      if (geometry) found.set(id, await freshIncidentDTO(ctx, incident, geometry));
    }
  }
  return { items: [...found.values()], partial, serverTime: now };
} });

export const submit = mutation({ args: {
  requestId: v.string(), hazard, fix, observedAt: v.number(), description: v.string(), incidentId: v.optional(v.id('incidents')), audience: v.optional(audience),
}, handler: async (ctx, args) => {
  const userId = await requireUser(ctx);
  return command(ctx, userId, 'OBSERVATION_SUBMIT', args.requestId, args, async () => {
    const now = Date.now(); const { location } = await requireEligibleFix(ctx);
    const checked = validateIndiaFix(args.fix, countryStatus(args.fix), now);
    if (!checked.ok) return reject(checked.error.code);
    // Bind report origin to the acknowledged latest fix, never a map camera/pin.
    if (args.fix.observedAt !== location.observedAt || args.fix.accuracyM !== location.accuracyM || args.fix.point.latitude !== location.point.latitude || args.fix.point.longitude !== location.point.longitude) return reject('LOCATION_STALE');
    if (!Number.isFinite(args.observedAt) || args.observedAt > now || now - args.observedAt > POLICY.maxObservationAgeMs) return reject('INVALID_INPUT');
    const description = args.description.trim();
    if (description.length > 500 || /[\u0000-\u0008\u000b\u000c\u000e-\u001f]/.test(description) || (args.hazard === 'OTHER_NATURAL' && description.length < 3)) return reject('INVALID_INPUT');
    const profile = await ctx.db.query('profiles').withIndex('by_user', q => q.eq('userId',userId)).unique();
    if (!profile) return reject('INVALID_INPUT');
    const selectedAudience = args.audience ?? 'LIVE';
    if (selectedAudience === 'DEMO' && !profile.demoEnabled) return reject('NOT_FOUND');
    const memberships = await activeMemberships(ctx, userId);
    let incident: Doc<'incidents'>;
    if (args.incidentId) {
      incident = await resolve(ctx, args.incidentId);
      if (incident.audience !== selectedAudience || incident.hazard !== args.hazard) return reject('NOT_FOUND');
      if (!['ACTIVE','STALE'].includes(incident.lifecycle)) return reject('INCIDENT_CLOSED');
      await mayObserve(ctx, incident, location);
    } else {
      const area = { type: 'circle' as const, center: location.point, radiusM: HAZARD_POLICY[args.hazard].radiusM };
      if (memberships.length) await requireAuthorityForCircle(ctx, area, selectedAudience);
      const provenance = memberships.length ? 'AUTHORITY' as const : 'COMMUNITY' as const;
      const geometryId = await ctx.db.insert('geometries', { area, source: 'APPROXIMATE_REPORT_AREA', sourceAccuracyM: location.accuracyM, version: 1, geometryHash: payloadHash(area) });
      const id = await ctx.db.insert('incidents', { hazard: args.hazard, locality: 'Address unavailable', geometryId, provenance, verification: provenance === 'AUTHORITY' ? 'AUTHORITY_VERIFIED' : 'UNVERIFIED', lifecycle: 'ACTIVE', qualification: null, assessmentStatus: 'PENDING', severity: 'UNKNOWN', recentWitnesses: 0, totalWitnesses: 0, lastObservedAt: args.observedAt, staleAt: provenance === 'AUTHORITY' ? now + 6 * HOUR : args.observedAt + HAZARD_POLICY[args.hazard].staleAfterMs, revision: 1, evidenceGeneration: 1, controlRevision: 1, nextAssessmentAt: now, audience: selectedAudience });
      incident = (await ctx.db.get(id))!;
      for (const precision of [4,5]) await ctx.db.insert('geoPoints',{ kind: 'INCIDENT', entityId: id, precision, cell: geohash.encode(location.point.latitude,location.point.longitude,precision),point:location.point,active:true,observedAt:args.observedAt });
    }
    const previous = await ctx.db.query('observations').withIndex('by_incident_author', q => q.eq('incidentId',incident._id).eq('authorId',userId)).unique();
    const observation = { incidentId: incident._id, authorId: userId, alias: profile.alias, capturedPoint: location.point, fixObservedAt: location.observedAt, accuracyM: location.accuracyM, observedAt: args.observedAt, receivedAt: now, description, status: 'ACTIVE' as const, revision: (previous?.revision ?? 0)+1, lastContributionAt: now, provenance: !args.incidentId && memberships.length ? 'AUTHORITY' as const : 'COMMUNITY' as const };
    const observationId = previous?._id ?? await ctx.db.insert('observations', observation);
    if (previous) await ctx.db.patch(observationId, observation);
    const oldOrigins = await ctx.db.query('observationOrigins').withIndex('by_observation', q => q.eq('observationId',observationId)).take(2);
    for (const old of oldOrigins) await ctx.db.delete(old._id);
    await ctx.db.insert('observationOrigins',{ incidentId:incident._id,observationId,cell:geohash.encode(location.point.latitude,location.point.longitude,5),point:location.point,accuracyM:location.accuracyM,observedAt:args.observedAt,active:true });
    await ctx.db.patch(incident._id,{lastObservedAt:Math.max(incident.lastObservedAt,args.observedAt),staleAt:incident.provenance === 'AUTHORITY' ? incident.staleAt : Math.max(incident.lastObservedAt,args.observedAt)+HAZARD_POLICY[incident.hazard].staleAfterMs,revision:incident.revision+1,evidenceGeneration:incident.evidenceGeneration+1,nextAssessmentAt:now});
    await refresh(ctx,incident._id);
    const updated = (await ctx.db.get(incident._id))!;
    await ctx.db.insert('auditEvents',{actorId:userId,actorKind:memberships.length ? 'AUTHORITY' : 'TOURIST',objectKind:'INCIDENT',objectId:incident._id,revision:updated.revision,action:previous?'UPDATE_OBSERVATION':'ADD_OBSERVATION',reason:'',createdAt:now});
    return { incidentId:incident._id,observationId,revision:updated.revision,verification:updated.verification,qualification:updated.qualification,recentWitnesses:updated.recentWitnesses,totalWitnesses:updated.totalWitnesses };
  });
} });
