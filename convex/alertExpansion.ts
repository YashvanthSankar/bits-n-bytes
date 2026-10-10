import { internalMutation } from './_generated/server';
import { internal } from './_generated/api';
import { v } from 'convex/values';
import { targetRecipient } from './lib/targetRecipient';

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
    await targetRecipient(ctx,userId,alert,areas,now);
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

/** Opt-in must catch up emergencies published before consent. Bounded resumable scan. */
export const demoCatchup = internalMutation({args:{userId:v.id('users'),cursor:v.union(v.string(),v.null())},handler:async(ctx,args):Promise<void>=>{
 const profile=await ctx.db.query('profiles').withIndex('by_user',q=>q.eq('userId',args.userId)).unique();if(!profile?.demoEnabled)return;
 const alerts=await ctx.db.query('alerts').withIndex('by_lifecycle',q=>q.eq('lifecycle','ACTIVE')).paginate({numItems:20,cursor:args.cursor});
 for(const alert of alerts.page){
  if(alert.audience!=='DEMO')continue;
  const job=await ctx.db.query('jobs').withIndex('by_key',q=>q.eq('key',`${alert._id}:${alert.currentRevision}`)).unique();
  if(!job || job.kind!=='ALERT_EXPANSION')continue;
  const checkpoint=job.checkpoint+1;
  await ctx.db.patch(job._id,{status:'PENDING',checkpoint,cellIndex:0,cursor:null,dueAt:Date.now()});
  await ctx.scheduler.runAfter(0,internal.alertExpansion.page,{jobId:job._id,checkpoint});
 }
 if(!alerts.isDone)await ctx.scheduler.runAfter(0,internal.alertExpansion.demoCatchup,{...args,cursor:alerts.continueCursor});
}});
