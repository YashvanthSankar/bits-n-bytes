import { internalMutation } from './_generated/server';
import { internal } from './_generated/api';
import { v } from 'convex/values';
import { overlapsArea } from '../src/domain/geography';
import { validateFix } from '../src/domain/eligibility';
import { POLICY } from '../src/domain/policy';

/** A checkpoint is a transaction fence: duplicate scheduled invocations do no work. */
export const page = internalMutation({ args: { jobId: v.id('jobs'), checkpoint: v.number() }, handler: async (ctx, args): Promise<void> => {
  const job = await ctx.db.get(args.jobId);
  if (!job || job.status !== 'PENDING' || job.checkpoint !== args.checkpoint || job.kind !== 'ALERT_EXPANSION') return;
  const now = Date.now();
  const alert = job.alertId ? await ctx.db.get(job.alertId) : null;
  if (!alert || alert.currentRevision !== job.alertRevision || alert.lifecycle !== 'ACTIVE') {
    await ctx.db.patch(job._id, { status: 'SUPERSEDED' }); return;
  }
  const snapshot = await ctx.db.query('alertRevisions').withIndex('by_alert_revision', q => q.eq('alertId', alert._id).eq('revision', alert.currentRevision)).unique();
  if (!snapshot || snapshot.sources.length > 32) {
    await ctx.db.patch(job._id, { status: 'FAILED', lastErrorCode: 'SOURCE_SNAPSHOT_MISSING' }); return;
  }
  const areas = [];
  for (const source of snapshot.sources) {
    if (!source.active) continue;
    const geometry = await ctx.db.get(source.geometryId);
    if (!geometry) { await ctx.db.patch(job._id, { status: 'FAILED', lastErrorCode: 'GEOMETRY_MISSING' }); return; }
    areas.push(geometry.area);
  }
  const prefix = job.cells[job.cellIndex];
  if (!prefix) { await ctx.db.patch(job._id, { status: 'DONE' }); return; }
  // USER precision4 cells share the published precision3 prefix. Exact geometry is checked below.
  const candidates = await ctx.db.query('geoPoints').withIndex('by_kind_precision_cell_active', q => q.eq('kind', 'USER').eq('precision', 4).gte('cell', prefix).lt('cell', prefix + '~'))
    .filter(q => q.eq(q.field('active'), true)).paginate({ numItems: 25, cursor: job.cursor });
  for (const candidate of candidates.page) {
    const userId = ctx.db.normalizeId('users', candidate.entityId);
    if (!userId) continue;
    const location = await ctx.db.query('locations').withIndex('by_user', q => q.eq('userId', userId)).unique();
    if (!location || location.admittedAt === undefined || location.foregroundPermission !== 'granted' || location.countryStatus !== 'INSIDE_INDIA' || !validateFix(location, now, POLICY.alertFix).ok) continue;
    const profile = await ctx.db.query('profiles').withIndex('by_user', q => q.eq('userId', userId)).unique();
    if (!profile || (alert.audience === 'DEMO' && !profile.demoEnabled)) continue;
    const relevant = areas.some(area => overlapsArea(location, area));
    if (!relevant) continue;
    const inside = areas.some(area => overlapsArea({ ...location, accuracyM: 0 }, area));
    const prior = await ctx.db.query('exposures').withIndex('by_user_incident', q => q.eq('userId', userId).eq('incidentId', alert.incidentId)).unique();
    if (prior && prior.appliedRevision > alert.currentRevision) continue;
    const soundEpoch = prior?.soundEpoch ?? 1;
    // First exposure only for now; material/reentry sound policy is a separate pending task.
    const shouldSound = !prior;
    const exposure = { userId, incidentId: alert.incidentId, alertId: alert._id, relevant: true, proximityKind: inside ? 'INSIDE' as const : 'POSSIBLE_PROXIMITY' as const,
      locationRevision: location.revision, lastEnteredAt: prior?.lastEnteredAt ?? now, soundEpoch,
      dismissedRevision: prior?.dismissedRevision ?? 0, latestSeenRevision: prior?.latestSeenRevision ?? 0, appliedRevision: alert.currentRevision };
    if (prior) await ctx.db.patch(prior._id, exposure); else await ctx.db.insert('exposures', exposure);
    const existing = await ctx.db.query('userAlerts').withIndex('by_user_alert_revision', q => q.eq('userId', userId).eq('alertId', alert._id).eq('revision', alert.currentRevision)).unique();
    if (!existing) await ctx.db.insert('userAlerts', { userId, alertId: alert._id, revision: alert.currentRevision,
      eligibilityReason: inside ? 'INSIDE' : 'POSSIBLE_PROXIMITY', locationAgeMs: now - location.observedAt, accuracyM: location.accuracyM,
      firstRelevantAt: now, shouldSound, soundEpoch });
  }
  const cellIndex = candidates.isDone ? job.cellIndex + 1 : job.cellIndex;
  const done = cellIndex >= job.cells.length;
  await ctx.db.patch(job._id, { checkpoint: job.checkpoint + 1, cellIndex, cursor: candidates.isDone ? null : candidates.continueCursor, status: done ? 'DONE' : 'PENDING' });
  if (!done) await ctx.scheduler.runAfter(0, internal.alertExpansion.page, { jobId: job._id, checkpoint: job.checkpoint + 1 });
} });

/** Recovery sweep uses stored checkpoints, never starts a second logical job. */
export const resume = internalMutation({ args: {}, handler: async (ctx): Promise<void> => {
  const jobs = await ctx.db.query('jobs').withIndex('by_kind_status_dueAt', q => q.eq('kind', 'ALERT_EXPANSION').eq('status', 'PENDING').lte('dueAt', Date.now())).take(10);
  for (const job of jobs) if (job.kind === 'ALERT_EXPANSION') await ctx.scheduler.runAfter(0, internal.alertExpansion.page, { jobId: job._id, checkpoint: job.checkpoint });
} });
