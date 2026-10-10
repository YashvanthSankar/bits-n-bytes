import type { MutationCtx } from '../_generated/server';
import type { Doc, Id } from '../_generated/dataModel';
import type { AreaGeometry } from '../../src/contracts/domain';
import { overlapsArea } from '../../src/domain/geography';
import { validateFix } from '../../src/domain/eligibility';
import { POLICY } from '../../src/domain/policy';

/** Shared publication/movement gate; never trusts cached cell membership as relevance. */
export async function targetRecipient(ctx: MutationCtx, userId: Id<'users'>, alert: Doc<'alerts'>, areas: AreaGeometry[], now: number) {
 const location=await ctx.db.query('locations').withIndex('by_user',q=>q.eq('userId',userId)).unique();
 const profile=await ctx.db.query('profiles').withIndex('by_user',q=>q.eq('userId',userId)).unique();
 const prior=await ctx.db.query('exposures').withIndex('by_user_incident',q=>q.eq('userId',userId).eq('incidentId',alert.incidentId)).unique();
 if(prior && prior.appliedRevision>alert.currentRevision)return;
 const eligible=location && location.admittedAt!==undefined && location.foregroundPermission==='granted' && location.countryStatus==='INSIDE_INDIA' && validateFix(location,now,POLICY.alertFix).ok && profile && (alert.audience!=='DEMO' || profile.demoEnabled) && areas.some(area=>overlapsArea(location,area));
 if(!eligible || !location){if(prior?.relevant)await ctx.db.patch(prior._id,{relevant:false,leftAt:now,locationRevision:location?.revision??prior.locationRevision});return;}
 const inside=areas.some(area=>overlapsArea({...location,accuracyM:0},area));
 const soundEpoch=prior?.soundEpoch??1;
 const exposure={userId,incidentId:alert.incidentId,alertId:alert._id,relevant:true,proximityKind:inside?'INSIDE' as const:'POSSIBLE_PROXIMITY' as const,
  locationRevision:location.revision,lastEnteredAt:prior?.relevant?prior.lastEnteredAt:now,soundEpoch,
  dismissedRevision:prior?.dismissedRevision??0,latestSeenRevision:prior?.latestSeenRevision??0,appliedRevision:alert.currentRevision};
 if(prior)await ctx.db.patch(prior._id,exposure);else await ctx.db.insert('exposures',exposure);
 const existing=await ctx.db.query('userAlerts').withIndex('by_user_alert_revision',q=>q.eq('userId',userId).eq('alertId',alert._id).eq('revision',alert.currentRevision)).unique();
 if(!existing)await ctx.db.insert('userAlerts',{userId,alertId:alert._id,revision:alert.currentRevision,eligibilityReason:inside?'INSIDE':'POSSIBLE_PROXIMITY',locationAgeMs:now-location.observedAt,accuracyM:location.accuracyM,firstRelevantAt:now,shouldSound:!prior,soundEpoch});
}
