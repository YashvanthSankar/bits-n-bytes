/// <reference types="vite/client" />
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { convexTest, type TestConvex } from 'convex-test';
import schema from '../convex/schema';
import { api, internal } from '../convex/_generated/api';
import type { Id } from '../convex/_generated/dataModel';
import { HOUR } from '../src/domain/policy';
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
 expect(rows.incidents).toHaveLength(1);expect(rows.observations).toHaveLength(1);expect(rows.rates).toHaveLength(1);
 expect(rows.incidents[0]).toMatchObject({assessmentStatus:'PENDING',qualification:null});
 await expect(actor(first).mutation(api.observations.submit,{...args,description:'Different body'})).rejects.toThrow('COMMAND_KEY_REUSED');
});
it('one person cannot add repeated independent witnesses; a second nearby author corroborates',async()=>{
 const origin=await actor(first).mutation(api.observations.submit,report(await admit(first)));
 await expect(actor(first).mutation(api.observations.submit,{...report(await admit(first),'report-0002'),incidentId:origin.incidentId})).rejects.toThrow('RATE_LIMITED');
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
});
it('suggests a candidate rather than silently attaching the second new report',async()=>{
 await actor(first).mutation(api.observations.submit,report(await admit(first)));
 const candidates=await actor(second).query(api.observations.candidates,{hazard:'FLASH_FLOOD'});expect(candidates.items).toHaveLength(1);expect(candidates.partial).toBe(false);
 await actor(second).mutation(api.observations.submit,report(await admit(second),'report-second-0001'));
 expect(await t.run(ctx=>ctx.db.query('incidents').collect())).toHaveLength(2);
});
it('enforces five new reports per rolling hour without counting replay twice',async()=>{
 const value=await admit(first);
 for(let i=0;i<5;i++)await actor(first).mutation(api.observations.submit,report(value,'report-number-'+i));
 await expect(actor(first).mutation(api.observations.submit,report(value,'report-number-5'))).rejects.toThrow('RATE_LIMITED');
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
it('allows a later update without creating another independent witness', async () => {
 const receipt=await actor(first).mutation(api.observations.submit,report(await admit(first)));
 vi.useFakeTimers();vi.setSystemTime(Date.now()+10*60_000+1);
 expect(await actor(first).mutation(api.observations.submit,{...report(await admit(first),'update-report-0002'),incidentId:receipt.incidentId})).toMatchObject({recentWitnesses:1,totalWitnesses:1});
 expect(await t.run(ctx=>ctx.db.query('observations').collect())).toHaveLength(1);
});
