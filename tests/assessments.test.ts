import { expect, it } from 'vitest';
import { convexTest } from 'convex-test';
import schema from '../convex/schema';
import { internal } from '../convex/_generated/api';
const modules=import.meta.glob('../convex/**/*.ts');
const result={model:'jev-1.13',rubric:'gudtour-crisis-v1',qualification:'NOTIFIABLE_EMERGENCY' as const,optionProbability:0.9,confidence:0.2,severity:'HIGH' as const,inputTokens:100,outputTokens:20,latencyMs:100,judgmentsJson:'{}'};
async function fixture(){const t=convexTest(schema,modules);const ids=await t.run(async ctx=>{
 const geometryId=await ctx.db.insert('geometries',{area:{type:'circle',center:{latitude:13.08,longitude:80.27},radiusM:5000},source:'APPROXIMATE_REPORT_AREA',sourceAccuracyM:10,version:1,geometryHash:'test'});
 const incidentId=await ctx.db.insert('incidents',{hazard:'FLASH_FLOOD',locality:'Test',geometryId,provenance:'COMMUNITY',verification:'UNVERIFIED',lifecycle:'ACTIVE',qualification:null,assessmentStatus:'PENDING',severity:'UNKNOWN',recentWitnesses:0,totalWitnesses:0,lastObservedAt:Date.now(),staleAt:Date.now()+3600000,revision:1,evidenceGeneration:1,controlRevision:1,nextAssessmentAt:0,audience:'DEMO'});
 const jobId=await ctx.db.insert('assessmentJobs',{incidentId,evidenceGeneration:1,controlRevision:1,status:'RUNNING',attempt:1,runId:1,dueAt:0,leaseUntil:Date.now()+120000});
 const snapshotId=await ctx.db.insert('evidenceSnapshots',{incidentId,incidentRevision:1,evidenceGeneration:1,controlRevision:1,hash:'test',json:JSON.stringify({incident:{counts:{recent:0}}}),createdAt:Date.now(),policyVersion:'test'});
 return {incidentId,jobId,snapshotId};});return {t,...ids};}
it.each([0.899,0.9,0.91])('uses selected probability %s independently of confidence',async probability=>{
 const {t,incidentId,...ids}=await fixture();const applied=await t.mutation(internal.assessments.apply,{...ids,runId:1,result:{...result,optionProbability:probability}});
 expect(applied.outcome).toBe(probability>=0.9?'QUALIFIED':'INSUFFICIENT_EVIDENCE');expect(await t.run(ctx=>ctx.db.query('alerts').collect())).toHaveLength(probability>=0.9?1:0);
 expect((await t.run(ctx=>ctx.db.get(incidentId)))!.verification).toBe('UNVERIFIED');
});
it('publishes source/revision/recipient job atomically and ignores duplicate worker completion',async()=>{
 const {t,incidentId,...ids}=await fixture();await t.mutation(internal.assessments.apply,{...ids,runId:1,result});
 expect(await t.run(ctx=>ctx.db.query('alertSources').collect())).toMatchObject([{kind:'COMMUNITY',active:true,sourceRevision:1}]);expect(await t.run(ctx=>ctx.db.query('jobs').collect())).toHaveLength(1);
 expect(await t.mutation(internal.assessments.apply,{...ids,runId:1,result})).toEqual({outcome:'STALE_JOB'});expect(await t.run(ctx=>ctx.db.query('assessments').collect())).toHaveLength(1);
 expect((await t.run(ctx=>ctx.db.get(incidentId)))!.qualification).toBe('NOTIFIABLE_EMERGENCY');
});
it.each(['control','evidence','closed','age','witness'])('rejects %s changes after snapshot construction',async mode=>{
 const {t,incidentId,...ids}=await fixture();await t.run(async ctx=>{
  if(mode==='control')await ctx.db.patch(incidentId,{controlRevision:2});if(mode==='evidence')await ctx.db.patch(incidentId,{evidenceGeneration:2});if(mode==='closed')await ctx.db.patch(incidentId,{lifecycle:'REJECTED'});if(mode==='age')await ctx.db.patch(ids.snapshotId,{createdAt:Date.now()-121000});
  if(mode==='witness'){const authorId=await ctx.db.insert('users',{});await ctx.db.insert('observations',{incidentId,authorId,alias:'Test',capturedPoint:{latitude:13.08,longitude:80.27},fixObservedAt:Date.now(),accuracyM:10,observedAt:Date.now(),receivedAt:Date.now(),description:'Rising water',status:'ACTIVE',revision:1,lastContributionAt:Date.now(),provenance:'COMMUNITY'});}
 });const applied=await t.mutation(internal.assessments.apply,{...ids,runId:1,result});expect(['SUPERSEDED','EVIDENCE_CHANGED']).toContain(applied.outcome);expect(await t.run(ctx=>ctx.db.query('alerts').collect())).toEqual([]);
});
it('suppresses automatic publication without labelling the incident qualified',async()=>{
 const {t,incidentId,...ids}=await fixture();await t.run(async ctx=>{const agencyId=await ctx.db.insert('agencies',{name:'Test',sourceLabel:'Test',active:true,audience:'DEMO'});await ctx.db.insert('suppressionRules',{incidentId,agencyId,endsAt:Date.now()+3600000,createdAt:Date.now()});});
 expect((await t.mutation(internal.assessments.apply,{...ids,runId:1,result})).outcome).toBe('SUPPRESSED');expect(await t.run(ctx=>ctx.db.query('alerts').collect())).toEqual([]);expect(await t.run(ctx=>ctx.db.get(incidentId))).toMatchObject({qualification:'INSUFFICIENT_EVIDENCE',reviewNeeded:true});
});
it('keeps an active emergency after negative reassessment and avoids repeat publication on unchanged acceptance',async()=>{
 const {t,incidentId,...ids}=await fixture();await t.mutation(internal.assessments.apply,{...ids,runId:1,result});
 async function reassess(runId:number,qualification:'NOTIFIABLE_EMERGENCY'|'NOT_QUALIFIED'){
  const incident=(await t.run(ctx=>ctx.db.get(incidentId)))!;
  await t.run(async ctx=>{await ctx.db.patch(ids.jobId,{status:'RUNNING',runId,leaseUntil:Date.now()+120000});await ctx.db.patch(ids.snapshotId,{incidentRevision:incident.revision,createdAt:Date.now()});});
  return t.mutation(internal.assessments.apply,{...ids,runId,result:{...result,qualification}});
 }
 await reassess(2,'NOTIFIABLE_EMERGENCY');expect(await t.run(ctx=>ctx.db.query('alertRevisions').collect())).toHaveLength(1);
 await reassess(3,'NOT_QUALIFIED');expect((await t.run(ctx=>ctx.db.query('alerts').collect()))[0]!.lifecycle).toBe('ACTIVE');expect(await t.run(ctx=>ctx.db.get(incidentId))).toMatchObject({qualification:'NOTIFIABLE_EMERGENCY',reviewNeeded:true});
});
it('uses bounded retries and stops malformed/configuration retries until evidence changes',async()=>{
 const {t,jobId}=await fixture();await t.mutation(internal.assessments.failed,{jobId,runId:1,error:'UNAVAILABLE'});expect(await t.run(ctx=>ctx.db.get(jobId))).toMatchObject({status:'PENDING',lastError:'UNAVAILABLE'});
 await t.run(ctx=>ctx.db.patch(jobId,{status:'RUNNING',runId:2}));await t.mutation(internal.assessments.failed,{jobId,runId:2,error:'INVALID_RESPONSE'});expect(await t.run(ctx=>ctx.db.get(jobId))).toMatchObject({status:'FAILED'});
});
it('delivers a qualified community emergency through existing exact-area tourist exposure',async()=>{
 const {t,incidentId,...ids}=await fixture();const userId=await t.run(async ctx=>{
  const userId=await ctx.db.insert('users',{});await ctx.db.insert('profiles',{userId,name:'Test',alias:'Traveler',language:'en',stepFreeNeeded:false,demoEnabled:true,onboardingCompletedAt:Date.now(),revision:1});
  await ctx.db.insert('locations',{userId,point:{latitude:13.08,longitude:80.27},accuracyM:10,observedAt:Date.now(),receivedAt:Date.now(),countryStatus:'INSIDE_INDIA',foregroundPermission:'granted',backgroundPermission:'denied',source:'FOREGROUND',admittedAt:Date.now(),revision:1});
  const {default:geohash}=await import('ngeohash');await ctx.db.insert('geoPoints',{kind:'USER',entityId:userId,precision:4,cell:geohash.encode(13.08,80.27,4),point:{latitude:13.08,longitude:80.27},active:true});return userId;
 });
 await t.mutation(internal.assessments.apply,{...ids,runId:1,result});const job=(await t.run(ctx=>ctx.db.query('jobs').collect()))[0]!;
 for(let i=0;i<100;i++){const current=(await t.run(ctx=>ctx.db.get(job._id)))!;if(current.status!=='PENDING')break;await t.mutation(internal.alertExpansion.page,{jobId:job._id,checkpoint:current.checkpoint});}
 const {api}=await import('../convex/_generated/api');const actor=t.withIdentity({subject:`${userId}|session`});const alerts=await actor.query(api.alerts.active,{});expect(alerts.items).toHaveLength(1);expect(alerts.items[0]).toMatchObject({incidentId,severity:'HIGH',needsAttention:true});
 const detail=await actor.query(api.alerts.detail,{alertId:alerts.items[0]!.id});expect(detail.instructions[0]!.originalText).toBeNull();expect(detail.instructions[0]!.issuer).toContain('community evidence');
});
it('preserves stronger official sources and government verification during model publication',async()=>{
 const {t,incidentId,...ids}=await fixture();const sourceId=await t.run(async ctx=>{
  const incident=(await ctx.db.get(incidentId))!;await ctx.db.patch(incidentId,{verification:'AUTHORITY_VERIFIED',severity:'CRITICAL'});
  const alertId=await ctx.db.insert('alerts',{incidentId,lifecycle:'ACTIVE',currentRevision:1,createdAt:Date.now(),updatedAt:Date.now(),audience:'DEMO'});
  const sourceId=await ctx.db.insert('alertSources',{alertId,kind:'AUTHORITY',geometryId:incident.geometryId,severity:'CRITICAL',issuerLabel:'Authority',active:true,sourceRevision:1,audience:'DEMO'});
  await ctx.db.insert('alertRevisions',{alertId,revision:1,sources:[{sourceId,geometryId:incident.geometryId,severity:'CRITICAL',issuerLabel:'Authority',active:true}],severity:'CRITICAL',materialReason:'FIRST',urgency:'FIRST',criticalInstruction:true,publishedAt:Date.now(),policyVersion:'test'});return sourceId;
 });await t.mutation(internal.assessments.apply,{...ids,runId:1,result});expect(await t.run(ctx=>ctx.db.get(sourceId))).toMatchObject({active:true,severity:'CRITICAL',sourceRevision:1});
 expect((await t.run(ctx=>ctx.db.query('alertRevisions').collect())).at(-1)!.severity).toBe('CRITICAL');expect(await t.run(ctx=>ctx.db.get(incidentId))).toMatchObject({verification:'AUTHORITY_VERIFIED',severity:'CRITICAL'});
});
it('exposes only curated evidence to an admitted tourist and enforces DEMO consent',async()=>{
 const {t,incidentId,...ids}=await fixture();await t.mutation(internal.assessments.apply,{...ids,runId:1,result});
 const userId=await t.run(async ctx=>{
  await ctx.db.patch(ids.snapshotId,{json:JSON.stringify({incident:{counts:{recent:0},samples:[{description:'PRIVATE REPORT',authorId:'PRIVATE USER'}]},weather:{data:{current:{description:'Rain',observedAt:Date.now(),temperatureC:29},stale:false,history:[]}},official:{items:[]},missingInputs:['UPSTREAM_WEATHER_UNAVAILABLE']})});
  const userId=await ctx.db.insert('users',{});await ctx.db.insert('profiles',{userId,name:'Test',alias:'Traveler',language:'en',stepFreeNeeded:false,demoEnabled:true,onboardingCompletedAt:Date.now(),revision:1});await ctx.db.insert('locations',{userId,point:{latitude:13.08,longitude:80.27},accuracyM:10,observedAt:Date.now(),receivedAt:Date.now(),countryStatus:'INSIDE_INDIA',foregroundPermission:'granted',backgroundPermission:'denied',source:'FOREGROUND',admittedAt:Date.now(),revision:1});return userId;
 });
 const {api}=await import('../convex/_generated/api');const actor=t.withIdentity({subject:`${userId}|session`});const summary=await actor.query(api.incidents.assessment,{incidentId});expect(summary.latest).toMatchObject({outcome:'QUALIFIED',weather:{description:'Rain',temperatureC:29},incomplete:true});expect(JSON.stringify(summary)).not.toContain('PRIVATE');expect(JSON.stringify(summary)).not.toContain('judgmentsJson');
 await t.run(ctx=>ctx.db.patch(incidentId,{evidenceGeneration:2}));expect((await actor.query(api.incidents.assessment,{incidentId})).latest!.currentEvidence).toBe(false);
 await t.run(async ctx=>{const profile=(await ctx.db.query('profiles').withIndex('by_user',q=>q.eq('userId',userId)).unique())!;await ctx.db.patch(profile._id,{demoEnabled:false});});await expect(actor.query(api.incidents.assessment,{incidentId})).rejects.toThrow();
});

it('schedules successful assessments an hour ahead and resets only today’s Jev reservations', async () => {
 const {t,incidentId,...ids}=await fixture();
 const before=Date.now();
 await t.mutation(internal.assessments.apply,{...ids,runId:1,result});
 const incident=await t.run(ctx=>ctx.db.get(incidentId));
 expect(incident!.nextAssessmentAt).toBeGreaterThanOrEqual(before+60*60_000);
 expect(incident!.nextAssessmentAt).toBeLessThanOrEqual(Date.now()+60*60_000);
 const day=new Date().toISOString().slice(0,10);
 await t.run(async ctx=>{
  await ctx.db.insert('providerUsage',{provider:'JEV',day,calls:100});
  await ctx.db.insert('providerUsage',{provider:'JEV',day:'2026-01-01',calls:70});
  await ctx.db.insert('providerUsage',{provider:'ACCUWEATHER',day,calls:39});
  await ctx.db.patch(ids.jobId,{status:'PENDING',lastError:'MODEL_DAILY_LIMIT',dueAt:Date.now()+900_000});
 });
 expect(await t.mutation(internal.operator.resetTodayJevBudget,{})).toMatchObject({day,previousCalls:100,calls:0,resumed:1});
 const usage=await t.run(ctx=>ctx.db.query('providerUsage').collect());
 expect(usage.map(x=>[x.provider,x.day,x.calls])).toEqual(expect.arrayContaining([['JEV',day,0],['JEV','2026-01-01',70],['ACCUWEATHER',day,39]]));
 expect(await t.run(ctx=>ctx.db.get(ids.jobId))).toMatchObject({status:'PENDING'});
 expect((await t.run(ctx=>ctx.db.get(ids.jobId)))!.lastError).toBeUndefined();
});
