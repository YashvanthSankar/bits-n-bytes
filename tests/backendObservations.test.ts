/// <reference types="vite/client" />
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { convexTest, type TestConvex } from 'convex-test';
import schema from '../convex/schema';
import { api, internal } from '../convex/_generated/api';
import type { Id } from '../convex/_generated/dataModel';
import { HOUR } from '../src/domain/policy';
import geohash from 'ngeohash';
const modules=import.meta.glob('../convex/**/*.ts');
const point={latitude:13.0827,longitude:80.2707};
let t:TestConvex<typeof schema>; let first:Id<'users'>,second:Id<'users'>;
const actor=(id:Id<'users'>)=>t.withIdentity({subject:`${id}|test-session`});
const fix=()=>({point,observedAt:Date.now(),accuracyM:10});
let locationSequence = 0;
async function admit(id:Id<'users'>,position=point){const value={...fix(),point:position};await actor(id).mutation(api.locations.update,{requestId:'location-'+(++locationSequence),fix:value,foregroundPermission:'granted',backgroundPermission:'denied',source:'FOREGROUND'});return value;}
const report=(value:ReturnType<typeof fix>,requestId='report-0001')=>({requestId,hazard:'FLASH_FLOOD' as const,fix:value,observedAt:Date.now(),description:'Test-only observation'});
afterEach(() => vi.useRealTimers());
beforeEach(async()=>{
 t=convexTest(schema,modules);[first,second]=await t.run(async ctx=>[await ctx.db.insert('users',{}),await ctx.db.insert('users',{})]);
 for(const id of [first,second]){await admit(id);await actor(id).mutation(api.profiles.save,{requestId:'profile-0001',expectedRevision:0,name:'Test Tourist',language:'en',stepFreeNeeded:false});}
});
it('commits one unverified incident/observation and replays the exact receipt',async()=>{
 const args=report(await admit(first));const receipt=await actor(first).mutation(api.observations.submit,args);
 expect(receipt).toMatchObject({verification:'UNVERIFIED',qualification:null,recentWitnesses:1,totalWitnesses:1});
 expect(await actor(first).mutation(api.observations.submit,args)).toEqual(receipt);
 const rows=await t.run(async ctx=>({incidents:await ctx.db.query('incidents').collect(),observations:await ctx.db.query('observations').collect(),rates:await ctx.db.query('postingRates').collect()}));
 expect(rows.incidents).toHaveLength(1);expect(rows.observations).toHaveLength(1);expect(rows.rates).toHaveLength(0);
 expect(rows.incidents[0]).toMatchObject({assessmentStatus:'PENDING',qualification:null});
 await expect(actor(first).mutation(api.observations.submit,{...args,description:'Different body'})).rejects.toThrow('COMMAND_KEY_REUSED');
});
it('one person cannot add repeated independent witnesses; a second nearby author corroborates',async()=>{
 const origin=await actor(first).mutation(api.observations.submit,report(await admit(first)));
 expect(await actor(first).mutation(api.observations.submit,{...report(await admit(first),'report-0002'),incidentId:origin.incidentId})).toMatchObject({recentWitnesses:1,totalWitnesses:1});
 const secondArgs={...report(await admit(second),'report-second-0001'),incidentId:origin.incidentId};
 expect(await actor(second).mutation(api.observations.submit,secondArgs)).toMatchObject({recentWitnesses:2,totalWitnesses:2,verification:'CORROBORATED',qualification:null});
 expect(await actor(second).mutation(api.observations.submit,secondArgs)).toMatchObject({totalWitnesses:2});
});
it('old independent observations remain total evidence without fresh corroboration',async()=>{
 const args={...report(await admit(first)),observedAt:Date.now()-2*HOUR};
 const receipt=await actor(first).mutation(api.observations.submit,args);expect(receipt).toMatchObject({recentWitnesses:0,totalWitnesses:1,verification:'UNVERIFIED'});
});
it('binds origin to latest acknowledged fix and rejects future, old and missing Other text',async()=>{
 const value=await admit(first);
 await expect(actor(first).mutation(api.observations.submit,{...report(value),fix:{...value,point:{...point,latitude:13.1}}})).rejects.toThrow('LOCATION_STALE');
 await expect(actor(first).mutation(api.observations.submit,{...report(value),observedAt:Date.now()+HOUR})).rejects.toThrow('INVALID_INPUT');
 await expect(actor(first).mutation(api.observations.submit,{...report(value),observedAt:Date.now()-25*HOUR})).rejects.toThrow('INVALID_INPUT');
 await expect(actor(first).mutation(api.observations.submit,{...report(value),hazard:'OTHER_NATURAL',description:''})).rejects.toThrow('INVALID_INPUT');
});
it('does not use a five-kilometre alert radius as witness proximity',async()=>{
 const origin=await actor(first).mutation(api.observations.submit,report(await admit(first)));
 const distant=await admit(second,{latitude:13.1127,longitude:80.2707});
 await expect(actor(second).mutation(api.observations.submit,{...report(distant,'report-second-0001'),incidentId:origin.incidentId})).rejects.toThrow('OBSERVATION_TOO_FAR');
 expect(await actor(second).query(api.observations.eligibility,{incidentId:origin.incidentId})).toMatchObject({eligible:false,reason:'OBSERVATION_TOO_FAR'});
});
it('keeps the public nearby list private and allows immediate contribution updates',async()=>{
 const receipt=await actor(first).mutation(api.observations.submit,report(await admit(first)));
 const nearby=await actor(second).query(api.incidents.nearby,{});
 expect(nearby.items).toHaveLength(1);expect(nearby).toMatchObject({radiusM:5000,partial:false});
 expect(JSON.stringify(nearby)).not.toContain('Test-only observation');expect(JSON.stringify(nearby)).not.toContain(first);
 expect(await actor(second).query(api.observations.eligibility,{incidentId:receipt.incidentId})).toMatchObject({eligible:true,hasObservation:false});
 expect(await actor(first).query(api.observations.eligibility,{incidentId:receipt.incidentId})).toMatchObject({eligible:true,reason:null,hasObservation:true});
});
it('suggests a candidate rather than silently attaching the second new report',async()=>{
 await actor(first).mutation(api.observations.submit,report(await admit(first)));
 const candidates=await actor(second).query(api.observations.candidates,{hazard:'FLASH_FLOOD'});expect(candidates.items).toHaveLength(1);expect(candidates.partial).toBe(false);
 await actor(second).mutation(api.observations.submit,report(await admit(second),'report-second-0001'));
 expect(await t.run(ctx=>ctx.db.query('incidents').collect())).toHaveLength(2);
});
it('accepts more than five new reports per hour without rate events or duplicate replay',async()=>{
 const value=await admit(first);
 const submissions=Array.from({length:12},(_,i)=>report(value,'report-number-'+i));
 for(const args of submissions)await actor(first).mutation(api.observations.submit,args);
 await actor(first).mutation(api.observations.submit,submissions[11]!);
 expect(await t.run(ctx=>ctx.db.query('incidents').collect())).toHaveLength(12);
 expect(await t.run(ctx=>ctx.db.query('postingRates').collect())).toHaveLength(0);
});
it('does not let an ordinary profile create or query DEMO evidence',async()=>{
 await expect(actor(first).mutation(api.observations.submit,{...report(await admit(first)),audience:'DEMO'})).rejects.toThrow('NOT_FOUND');
 await expect(actor(first).query(api.observations.candidates,{hazard:'FLASH_FLOOD',audience:'DEMO'})).rejects.toThrow('NOT_FOUND');
});
it('read-time recency remains correct when the scheduled expiry job is late', async () => {
 const receipt=await actor(first).mutation(api.observations.submit,report(await admit(first)));
 await actor(second).mutation(api.observations.submit,{...report(await admit(second),'second-report-0001'),incidentId:receipt.incidentId});
 vi.useFakeTimers();vi.setSystemTime(Date.now()+HOUR+1);
 expect(await actor(first).query(api.incidents.detail,{incidentId:receipt.incidentId})).toMatchObject({recentWitnesses:0,totalWitnesses:2,verification:'UNVERIFIED',lifecycle:'ACTIVE'});
 const incident=await t.run(ctx=>ctx.db.get(receipt.incidentId));
 await t.mutation(internal.observations.refreshState,{incidentId:receipt.incidentId,generation:incident!.evidenceGeneration});
 expect(await t.run(ctx=>ctx.db.get(receipt.incidentId))).toMatchObject({recentWitnesses:0,verification:'UNVERIFIED'});
});
it('allows repeated immediate updates without creating another independent witness', async () => {
 const receipt=await actor(first).mutation(api.observations.submit,report(await admit(first)));
 for(let i=0;i<12;i++) expect(await actor(first).mutation(api.observations.submit,{...report(await admit(first),'update-report-'+i),incidentId:receipt.incidentId})).toMatchObject({recentWitnesses:1,totalWitnesses:1});
 expect(await t.run(ctx=>ctx.db.query('observations').collect())).toHaveLength(1);
});
it('labels truncated nearby/candidate results and preserves continuation for bounded cell pages',async()=>{
 const cell=geohash.encode(point.latitude,point.longitude,4);
 await t.run(async ctx=>{
  for(let i=0;i<32;i++){
   const geometryId=await ctx.db.insert('geometries',{area:{type:'circle',center:point,radiusM:5000},source:'APPROXIMATE_REPORT_AREA',sourceAccuracyM:10,version:1,geometryHash:'test-'+i});
   const id=await ctx.db.insert('incidents',{hazard:'FLASH_FLOOD',locality:'Test locality',geometryId,provenance:'COMMUNITY',verification:'UNVERIFIED',lifecycle:'ACTIVE',qualification:null,assessmentStatus:'PENDING',severity:'UNKNOWN',recentWitnesses:0,totalWitnesses:0,lastObservedAt:Date.now(),staleAt:Date.now()+2*HOUR,revision:1,evidenceGeneration:1,controlRevision:1,nextAssessmentAt:Date.now(),audience:'LIVE'});
   await ctx.db.insert('geoPoints',{kind:'INCIDENT',entityId:id,precision:4,cell,point,active:true,observedAt:Date.now()});
  }
 });
 const nearby=await actor(first).query(api.incidents.nearby,{});expect(nearby.items).toHaveLength(30);expect(nearby.partial).toBe(true);
 const candidates=await actor(first).query(api.observations.candidates,{hazard:'FLASH_FLOOD'});expect(candidates.items).toHaveLength(30);expect(candidates.partial).toBe(true);
 const page=await actor(first).query(api.incidents.inCell,{cell,paginationOpts:{numItems:100,cursor:null}});expect(page.items).toHaveLength(30);expect(page.isDone).toBe(false);
 const next=await actor(first).query(api.incidents.inCell,{cell,paginationOpts:{numItems:100,cursor:page.continueCursor}});expect(next.items).toHaveLength(2);expect(next.isDone).toBe(true);
});


it.each(['LIVE', 'DEMO'] as const)('allows a %s authority to submit a normal LIVE observation without official privileges', async agencyAudience => {
 await t.run(async ctx => {
  const geometryId = await ctx.db.insert('geometries', {area:{type:'circle',center:{latitude:12.8,longitude:80.1},radiusM:1000},source:'OPERATOR',sourceAccuracyM:null,version:1,geometryHash:'remote-authority-scope'});
  const agencyId = await ctx.db.insert('agencies', {name:'Test authority',sourceLabel:'Test authority',active:true,audience:agencyAudience});
  const jurisdictionId = await ctx.db.insert('jurisdictions', {agencyId,name:'Other area',geometryId,coverageVersion:1,active:true});
  await ctx.db.insert('authorityMemberships', {userId:first,agencyId,jurisdictionIds:[jurisdictionId],status:'ACTIVE',approvedBy:'TEST_OPERATOR',approvedAt:Date.now()});
 });
 expect((await actor(first).query(api.profiles.me,{})).role).toBe('AUTHORITY');
 const args=report(await admit(first));
 const receipt=await actor(first).mutation(api.observations.submit,args);
 expect(receipt).toMatchObject({verification:'UNVERIFIED',qualification:null,recentWitnesses:1,totalWitnesses:1});
 expect(await actor(first).mutation(api.observations.submit,args)).toEqual(receipt);
 expect(await t.run(ctx=>ctx.db.get(receipt.incidentId))).toMatchObject({provenance:'COMMUNITY',verification:'UNVERIFIED',audience:'LIVE'});
 expect(await t.run(ctx=>ctx.db.get(receipt.observationId))).toMatchObject({provenance:'COMMUNITY'});
 await expect(actor(first).query(api.authority.reviewIncident,{incidentId:receipt.incidentId})).rejects.toThrow('JURISDICTION_DENIED');
});
