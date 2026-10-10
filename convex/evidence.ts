import { v } from 'convex/values';
import { internalAction, internalMutation, internalQuery } from './_generated/server';
import { internal } from './_generated/api';
import type { Id } from './_generated/dataModel';
import { HAZARD_POLICY, POLICY_VERSION } from '../src/domain/policy';
import { distanceM } from '../src/domain/geography';
import { witnessSummary } from '../src/domain/incidentState';
import { payloadHash } from './lib/idempotency';

export const input = internalQuery({ args: { incidentId: v.id('incidents') }, handler: async (ctx, args) => {
  const incident = await ctx.db.get(args.incidentId); if (!incident || incident.provenance !== 'COMMUNITY' || !['ACTIVE', 'STALE'].includes(incident.lifecycle) || incident.mergedInto) return null;
  const geometry = await ctx.db.get(incident.geometryId); if (!geometry || geometry.area.type !== 'circle') return null;
  const now = Date.now(), point = geometry.area.center;
  const observations = await ctx.db.query('observations').withIndex('by_incident_status_observedAt', q => q.eq('incidentId', incident._id).eq('status', 'ACTIVE')).order('desc').take(501);
  const overflow = observations.length > 500;
  const counts = overflow ? null : witnessSummary(observations, incident.hazard, now);
  const recent = observations.filter(o => o.observedAt <= now && o.observedAt >= now - HAZARD_POLICY[incident.hazard].witnessWindowMs);
  const distinct = new Set<string>();
  const samples = recent.filter(o => { const key = o.authorId ?? o._id; if (distinct.has(key)) return false; distinct.add(key); return true; }).slice(0, 20).map(o => ({ description: o.description, observedAt: o.observedAt, ageMs: now - o.observedAt, accuracyM: o.accuracyM, distanceFromIncidentM: distanceM(point, o.capturedPoint), provenance: o.provenance }));
  const candidates = await ctx.db.query('incidents').withIndex('by_hazard_lastObservedAt', q => q.eq('hazard', incident.hazard).gte('lastObservedAt', now - 365 * 24 * 60 * 60_000)).order('desc').take(101);
  const history = [];
  for (const other of candidates.slice(0, 100)) {
    if (other._id === incident._id || other.audience !== incident.audience || other.mergedInto) continue;
    const area = await ctx.db.get(other.geometryId); if (!area || area.area.type !== 'circle') continue;
    const distance = distanceM(point, area.area.center); if (distance > 10_000) continue;
    history.push({ hazard: other.hazard, lastObservedAt: other.lastObservedAt, distanceM: distance, provenance: other.provenance, verification: other.verification, lifecycle: other.lifecycle, qualification: other.qualification });
  }
  return { incidentId: incident._id, incidentRevision: incident.revision, evidenceGeneration: incident.evidenceGeneration, controlRevision: incident.controlRevision, geometryId: incident.geometryId, point, sourceAccuracyM: geometry.sourceAccuracyM, hazard: incident.hazard, locality: incident.locality, audience: incident.audience, priorQualification: incident.qualification, counts, samples, observationsTruncated: overflow || recent.length > samples.length, history, historyPartial: candidates.length > 100, evaluatedAt: now };
} });
export const store = internalMutation({ args: { incidentId: v.id('incidents'), incidentRevision: v.number(), evidenceGeneration: v.number(), controlRevision: v.number(), json: v.string() }, handler: async (ctx, args) => {
  const incident = await ctx.db.get(args.incidentId);
  if (!incident || incident.revision !== args.incidentRevision || incident.evidenceGeneration !== args.evidenceGeneration || incident.controlRevision !== args.controlRevision || !['ACTIVE', 'STALE'].includes(incident.lifecycle)) return null;
  if (args.json.length > 40_000) throw Error('EVIDENCE_TOO_LARGE');
  const canonical = JSON.parse(JSON.stringify(JSON.parse(args.json), (key, value: unknown) => ['fetchedAt', 'checkedAt'].includes(key) ? undefined : key === 'ageMs' && typeof value === 'number' ? Math.floor(value / 300_000) * 300_000 : value));
  const hash = payloadHash(canonical);
  const existing = await ctx.db.query('evidenceSnapshots').withIndex('by_incident_hash', q => q.eq('incidentId', args.incidentId).eq('hash', hash)).unique();
  return existing?._id ?? await ctx.db.insert('evidenceSnapshots', { incidentId: args.incidentId, incidentRevision: args.incidentRevision, evidenceGeneration: args.evidenceGeneration, controlRevision: args.controlRevision, hash, json: args.json, createdAt: Date.now(), policyVersion: POLICY_VERSION });
} });
export const build = internalAction({ args: { incidentId: v.id('incidents') }, handler: async (ctx, args): Promise<{ snapshotId: Id<'evidenceSnapshots'> | null; outcome: string }> => {
  const input = await ctx.runQuery(internal.evidence.input, args); if (!input) return { snapshotId: null, outcome: 'NOT_ELIGIBLE' };
  const weather = await ctx.runAction(internal.weather.context, { point: input.point });
  const official = await ctx.runQuery(internal.sachet.relevant, { point: input.point, accuracyM: Math.min(1000, input.sourceAccuracyM ?? 0) });
  const missingInputs = [];
  if (!weather.data || weather.data.stale) missingInputs.push('CURRENT_WEATHER_UNAVAILABLE_OR_STALE');
  if (!weather.data?.history.length) missingInputs.push('PAST_24H_WEATHER_UNAVAILABLE');
  if (!input.counts) missingInputs.push('OBSERVATION_COUNT_EXCEEDS_PILOT_BOUND');
  if (official.partial) missingInputs.push('OFFICIAL_SOURCE_SCAN_PARTIAL');
  if (official.geometryPending) missingInputs.push('SOME_OFFICIAL_GEOMETRY_UNRESOLVED');
  missingInputs.push('UPSTREAM_WEATHER_UNAVAILABLE');
  // No identities, witness coordinates, health details, contacts, device tokens or chat are sent.
  const { incidentId, incidentRevision, evidenceGeneration, controlRevision, geometryId, evaluatedAt, ...facts } = input; void geometryId;
  const json = JSON.stringify({ policyVersion: POLICY_VERSION, evaluatedAt: Math.floor(evaluatedAt / 300_000) * 300_000, incident: facts, weather, official: { ...official, items: official.items.slice(0, 10).map(({ geometries, ...notice }) => { void geometries; return { ...notice, exactGeometryMatched: true }; }), samplesTruncated: official.items.length > 10 }, missingInputs });
  const snapshotId = await ctx.runMutation(internal.evidence.store, { incidentId, incidentRevision, evidenceGeneration, controlRevision, json });
  return { snapshotId, outcome: snapshotId ? 'READY' : 'SUPERSEDED' };
} });
