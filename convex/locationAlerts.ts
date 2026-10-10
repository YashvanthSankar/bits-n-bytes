import { internalMutation } from './_generated/server';
import { internal } from './_generated/api';
import { v } from 'convex/values';
import { targetRecipient } from './lib/targetRecipient';
/** Each saved GPS revision scans bounded pages; a later GPS update invalidates old work. */
export const reconcile=internalMutation({args:{userId:v.id('users'),locationRevision:v.number(),cursor:v.union(v.string(),v.null())},handler:async(ctx,args):Promise<void>=>{
 const location=await ctx.db.query('locations').withIndex('by_user',q=>q.eq('userId',args.userId)).unique();
 if(!location || location.revision!==args.locationRevision)return;
 const alerts=await ctx.db.query('alerts').withIndex('by_lifecycle',q=>q.eq('lifecycle','ACTIVE')).paginate({numItems:20,cursor:args.cursor});
 for(const alert of alerts.page){
  const snapshot=await ctx.db.query('alertRevisions').withIndex('by_alert_revision',q=>q.eq('alertId',alert._id).eq('revision',alert.currentRevision)).unique();
  if(!snapshot || snapshot.sources.length>32)throw new Error('ALERT_SNAPSHOT_MISSING');
  const areas=[];
  for(const source of snapshot.sources)if(source.active){const geometry=await ctx.db.get(source.geometryId);if(!geometry)throw new Error('ALERT_GEOMETRY_MISSING');areas.push(geometry.area);}
  await targetRecipient(ctx,args.userId,alert,areas,Date.now());
 }
 if(!alerts.isDone)await ctx.scheduler.runAfter(0,internal.locationAlerts.reconcile,{...args,cursor:alerts.continueCursor});
}});
