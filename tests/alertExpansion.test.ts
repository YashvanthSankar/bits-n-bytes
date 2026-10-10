/// <reference types="vite/client" />
import { expect, it } from 'vitest';
import { convexTest } from 'convex-test';
import schema from '../convex/schema';
import { api, internal } from '../convex/_generated/api';
const modules=import.meta.glob('../convex/**/*.ts');
const point={latitude:13.0827,longitude:80.2707};
async function fixture() {
 const t=convexTest(schema,modules),scope=await t.mutation(internal.operator.ensureDemoAuthorityScope,{});
 const userId=await t.run(ctx=>ctx.db.insert('users',{})),actor=t.withIdentity({subject:`${userId}|session`});
 await actor.mutation(api.locations.update,{requestId:'location-test-001',fix:{point,accuracyM:10,observedAt:Date.now()},foregroundPermission:'granted',backgroundPermission:'denied',source:'FOREGROUND'});
 await actor.mutation(api.profiles.save,{requestId:'profile-test-001',expectedRevision:0,name:'Test',language:'en',stepFreeNeeded:false});
 await t.run(async ctx=>{const p=await ctx.db.query('profiles').withIndex('by_user',q=>q.eq('userId',userId)).unique();await ctx.db.patch(p!._id,{demoEnabled:true});});
 await t.mutation(internal.operator.approveAuthority,{userId,agencyId:scope.agencyId,jurisdictionIds:scope.jurisdictionIds,operatorLabel:'Test',reason:'Isolated approval'});
 await actor.mutation(api.declarations.publish,{requestId:'publish-test-001',jurisdictionId:scope.jurisdictionIds[0]!,expectedIncidentRevision:0,hazard:'FLASH_FLOOD',locality:'Test',area:{type:'circle',center:point,radiusM:1000},severity:'HIGH',originalText:'Stay indoors',sourceLanguage:'en',actionKind:'STAY_PUT',reviewDueAt:Date.now()+3600000,reason:'Isolated testing'});
 const job=(await t.run(ctx=>ctx.db.query('jobs').collect()))[0]!;
 async function drain(){for(let i=0;i<100;i++){const current=await t.run(ctx=>ctx.db.get(job._id));if(current?.status!=='PENDING')return;await t.mutation(internal.alertExpansion.page,{jobId:job._id,checkpoint:current.checkpoint});}throw Error('Worker failed to finish');}
 return {t,userId,job,drain,actor,scope};
}
it('creates one private recipient record and exposure, fencing repeated page invocations',async()=>{
 const {t,job,drain,userId}=await fixture();await drain();
 await t.mutation(internal.alertExpansion.page,{jobId:job._id,checkpoint:0});
 const records=await t.run(ctx=>ctx.db.query('userAlerts').collect());expect(records).toHaveLength(1);expect(records[0]).toMatchObject({userId,revision:1,eligibilityReason:'INSIDE',shouldSound:true});
 expect(await t.run(ctx=>ctx.db.query('exposures').collect())).toHaveLength(1);
 expect(await t.run(ctx=>ctx.db.get(job._id))).toMatchObject({status:'DONE'});
});
it.each(['stale','inaccurate','outside','demo-disabled','permission-denied'])('does not target %s users from a coarse cached geographic candidate',async mode=>{
 const {t,userId,drain}=await fixture();
 await t.run(async ctx=>{
  const loc=await ctx.db.query('locations').withIndex('by_user',q=>q.eq('userId',userId)).unique();
  if(mode==='stale')await ctx.db.patch(loc!._id,{observedAt:Date.now()-31*60000});
  if(mode==='inaccurate')await ctx.db.patch(loc!._id,{accuracyM:1001});
  if(mode==='outside')await ctx.db.patch(loc!._id,{point:{latitude:13.15,longitude:80.27}});
  if(mode==='permission-denied')await ctx.db.patch(loc!._id,{foregroundPermission:'denied'});
  if(mode==='demo-disabled'){const p=await ctx.db.query('profiles').withIndex('by_user',q=>q.eq('userId',userId)).unique();await ctx.db.patch(p!._id,{demoEnabled:false});}
 });
 await drain();expect(await t.run(ctx=>ctx.db.query('userAlerts').collect())).toHaveLength(0);
});
it('supersedes a publication job when its alert revision changes',async()=>{
 const {t,job}=await fixture();
 await t.run(ctx=>ctx.db.patch(job.alertId!,{currentRevision:2}));
 await t.mutation(internal.alertExpansion.page,{jobId:job._id,checkpoint:0});
 expect(await t.run(ctx=>ctx.db.get(job._id))).toMatchObject({status:'SUPERSEDED'});
 expect(await t.run(ctx=>ctx.db.query('userAlerts').collect())).toHaveLength(0);
});
it('continues beyond one recipient page without dropping or duplicating users',async()=>{
 const {t,userId,drain}=await fixture();
 await t.run(async ctx=>{
  const loc=(await ctx.db.query('locations').withIndex('by_user',q=>q.eq('userId',userId)).unique())!;
  const profile=(await ctx.db.query('profiles').withIndex('by_user',q=>q.eq('userId',userId)).unique())!;
  const geo=(await ctx.db.query('geoPoints').withIndex('by_kind_entity',q=>q.eq('kind','USER').eq('entityId',userId)).collect()).find(g=>g.precision===4)!;
  const {_id:li,_creationTime:lt,...locationData}=loc; const {_id:pi,_creationTime:pt,...profileData}=profile;
  const {_id:gi,_creationTime:gt,...geoData}=geo;void li;void lt;void pi;void pt;void gi;void gt;
  for(let i=0;i<30;i++){const next=await ctx.db.insert('users',{});await ctx.db.insert('locations',{...locationData,userId:next});await ctx.db.insert('profiles',{...profileData,userId:next});await ctx.db.insert('geoPoints',{...geoData,entityId:next});}
 });
 await drain();const alerts=await t.run(ctx=>ctx.db.query('userAlerts').collect());expect(alerts).toHaveLength(31);expect(new Set(alerts.map(a=>a.userId)).size).toBe(31);
});

it('reads private targeted alerts and acknowledges only the current revision while retaining the warning',async()=>{
 const {t,actor,drain}=await fixture();await drain();
 const before=await actor.query(api.alerts.active,{});expect(before.items).toHaveLength(1);expect(before.items[0]!.needsAttention).toBe(true);
 const alertId=before.items[0]!.id;
 const detail=await actor.query(api.alerts.detail,{alertId});expect(detail.instructions[0]!.originalText).toBe('Stay indoors');expect(detail.instructions[0]!.issuer).toBeTruthy();
 await expect(actor.mutation(api.alerts.dismiss,{alertId,revision:2})).rejects.toThrow();
 await actor.mutation(api.alerts.dismiss,{alertId,revision:1});
 const after=await actor.query(api.alerts.active,{});expect(after.items).toHaveLength(1);expect(after.items[0]!.needsAttention).toBe(false);
 const stranger=await t.run(ctx=>ctx.db.insert('users',{}));const other=t.withIdentity({subject:`${stranger}|session`});
 await other.mutation(api.locations.update,{requestId:'stranger-location-001',fix:{point,accuracyM:10,observedAt:Date.now()},foregroundPermission:'granted',backgroundPermission:'denied',source:'FOREGROUND'});
 await expect(other.query(api.alerts.detail,{alertId})).rejects.toThrow();
 await expect(other.mutation(api.alerts.dismiss,{alertId,revision:1})).rejects.toThrow();
});
it('rechecks exact relevance and demo access when reading an existing exposure',async()=>{
 const {t,actor,userId,drain}=await fixture();await drain();
 const initial=await actor.query(api.alerts.active,{});const alertId=initial.items[0]!.id;
 await t.run(async ctx=>{const location=await ctx.db.query('locations').withIndex('by_user',q=>q.eq('userId',userId)).unique();await ctx.db.patch(location!._id,{point:{latitude:13.15,longitude:80.27}});});
 expect((await actor.query(api.alerts.active,{})).items).toHaveLength(0);
 expect((await actor.query(api.alerts.detail,{alertId})).proximity).toBe('OUTSIDE');
 await t.run(async ctx=>{const profile=await ctx.db.query('profiles').withIndex('by_user',q=>q.eq('userId',userId)).unique();await ctx.db.patch(profile!._id,{demoEnabled:false});});
 await expect(actor.query(api.alerts.detail,{alertId})).rejects.toThrow();
});

it('lists only eligible assigned-area incidents for promotion and promotes without duplicating the event',async()=>{
 const {t,actor,scope}=await fixture();
 const candidates=await actor.query(api.authority.declarationCandidates,{jurisdictionId:scope.jurisdictionIds[0]!,paginationOpts:{numItems:20,cursor:null}});
 expect(candidates.page).toHaveLength(1);const existing=candidates.page[0]!;
 await actor.mutation(api.declarations.publish,{requestId:'promote-existing-001',jurisdictionId:scope.jurisdictionIds[0]!,incidentId:existing.id,expectedIncidentRevision:existing.revision,hazard:existing.hazard,locality:existing.locality,area:existing.area,severity:'CRITICAL',originalText:'Do not approach flood water',sourceLanguage:'en',actionKind:'AVOID_TRAVEL',reviewDueAt:Date.now()+3600000,reason:'Updated official assessment'});
 expect(await t.run(ctx=>ctx.db.query('incidents').collect())).toHaveLength(1);
 expect(await t.run(ctx=>ctx.db.query('alerts').collect())).toHaveLength(1);
 await t.run(ctx=>ctx.db.patch(existing.id,{lifecycle:'RESOLVED'}));
 expect((await actor.query(api.authority.declarationCandidates,{jurisdictionId:scope.jurisdictionIds[0]!,paginationOpts:{numItems:20,cursor:null}})).page).toHaveLength(0);
});
it('catches up an existing DEMO emergency only after explicit opt-in, and opt-out hides it',async()=>{
 const {t,actor,userId,drain}=await fixture();
 await actor.mutation(api.profiles.setDemoEnabled,{enabled:false});await drain();
 expect((await actor.query(api.alerts.active,{})).items).toHaveLength(0);
 await actor.mutation(api.profiles.setDemoEnabled,{enabled:true});
 await t.mutation(internal.alertExpansion.demoCatchup,{userId,cursor:null});await drain();
 expect((await actor.query(api.alerts.active,{})).items).toHaveLength(1);
 await actor.mutation(api.profiles.setDemoEnabled,{enabled:false});expect((await actor.query(api.alerts.active,{})).items).toHaveLength(0);
});
it('deduplicates publication translation jobs and fences concurrent claims and duplicate completion',async()=>{
 const {t}=await fixture();const jobs=await t.run(ctx=>ctx.db.query('instructionTranslations').collect());expect(jobs).toHaveLength(5);
 const job=jobs.find(j=>j.targetLanguage==='fr')!;
 await t.mutation(internal.translations.enqueueExisting,{instructionVersionId:job.instructionVersionId});await t.mutation(internal.translations.enqueueExisting,{instructionVersionId:job.instructionVersionId});expect(await t.run(ctx=>ctx.db.query('instructionTranslations').collect())).toHaveLength(5);
 const first=await t.mutation(internal.translations.claim,{translationId:job._id});expect(first?.attempt).toBe(1);
 expect(await t.mutation(internal.translations.claim,{translationId:job._id})).toBeNull();
 await t.mutation(internal.translations.finish,{translationId:job._id,attempt:1,text:'Restez à l’intérieur'});
 await t.mutation(internal.translations.finish,{translationId:job._id,attempt:1,text:'Wrong replacement'});
 expect(await t.run(ctx=>ctx.db.get(job._id))).toMatchObject({status:'READY',text:'Restez à l’intérieur'});
});
it('suppresses translations that alter numeric details or complete after their source is withdrawn',async()=>{
 const {t}=await fixture();const jobs=await t.run(ctx=>ctx.db.query('instructionTranslations').collect());const job=jobs[0]!;
 await t.mutation(internal.translations.claim,{translationId:job._id});await t.mutation(internal.translations.finish,{translationId:job._id,attempt:1,text:'Stay indoors for 3 hours'});
 expect(await t.run(ctx=>ctx.db.get(job._id))).toMatchObject({status:'FLAGGED',issues:['NUMBERS_CHANGED']});
 const next=jobs[1]!;await t.mutation(internal.translations.claim,{translationId:next._id});
 await t.run(async ctx=>{const instruction=await ctx.db.get(next.instructionVersionId);await ctx.db.patch(instruction!.declarationId,{active:false});});
 await t.mutation(internal.translations.finish,{translationId:next._id,attempt:1,text:'Translated text'});expect(await t.run(ctx=>ctx.db.get(next._id))).toMatchObject({status:'OBSOLETE'});
});
it('bounds retries and rejects an expired worker completion after a newer lease is claimed',async()=>{
 const {t}=await fixture();const job=(await t.run(ctx=>ctx.db.query('instructionTranslations').collect()))[0]!;
 await t.mutation(internal.translations.claim,{translationId:job._id});await t.run(ctx=>ctx.db.patch(job._id,{dueAt:Date.now()-1}));
 expect((await t.mutation(internal.translations.claim,{translationId:job._id}))?.attempt).toBe(2);
 await t.mutation(internal.translations.finish,{translationId:job._id,attempt:1,text:'Late obsolete completion'});expect(await t.run(ctx=>ctx.db.get(job._id))).toMatchObject({status:'RUNNING',attempts:2});
 await t.mutation(internal.translations.finish,{translationId:job._id,attempt:2,error:'PROVIDER_UNAVAILABLE'});await t.run(ctx=>ctx.db.patch(job._id,{dueAt:Date.now()-1}));
 await t.mutation(internal.translations.claim,{translationId:job._id});await t.mutation(internal.translations.finish,{translationId:job._id,attempt:3,error:'PROVIDER_UNAVAILABLE'});
 expect(await t.run(ctx=>ctx.db.get(job._id))).toMatchObject({status:'FAILED',attempts:3});expect(await t.mutation(internal.translations.claim,{translationId:job._id})).toBeNull();
});
it('returns only the preferred language translation for the exact original and never replays attention on translation completion',async()=>{
 const {t,actor,userId,drain}=await fixture();await drain();
 await t.run(async ctx=>{const p=await ctx.db.query('profiles').withIndex('by_user',q=>q.eq('userId',userId)).unique();await ctx.db.patch(p!._id,{language:'fr'});});
 const before=await actor.query(api.alerts.active,{}),alertId=before.items[0]!.id;
 await actor.mutation(api.alerts.dismiss,{alertId,revision:1});
 const job=(await t.run(ctx=>ctx.db.query('instructionTranslations').collect())).find(j=>j.targetLanguage==='fr')!;
 await t.mutation(internal.translations.claim,{translationId:job._id});await t.mutation(internal.translations.finish,{translationId:job._id,attempt:1,text:'Restez à l’intérieur'});
 const detail=await actor.query(api.alerts.detail,{alertId});expect(detail.instructions[0]).toMatchObject({originalText:'Stay indoors',translation:{language:'fr',status:'READY',text:'Restez à l’intérieur',machineTranslated:true,reviewed:false}});
 expect((await actor.query(api.alerts.active,{})).items[0]!.needsAttention).toBe(false);
 await t.run(ctx=>ctx.db.patch(job._id,{originalHash:'different-source'}));expect((await actor.query(api.alerts.detail,{alertId})).instructions[0]!.translation).toBeNull();
});
