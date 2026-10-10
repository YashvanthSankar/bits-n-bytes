import { expect, it } from 'vitest';
import { convexTest } from 'convex-test';
import schema from '../convex/schema';
import { internal } from '../convex/_generated/api';
const modules=import.meta.glob('../convex/**/*.ts');
async function fixture(){
 const t=convexTest(schema,modules);
 const id=await t.run(async ctx=>{
  const geometryId=await ctx.db.insert('geometries',{area:{type:'circle',center:{latitude:13.08,longitude:80.27},radiusM:5000},source:'APPROXIMATE_REPORT_AREA',sourceAccuracyM:20,version:1,geometryHash:'test'});
  const id=await ctx.db.insert('incidents',{hazard:'FLASH_FLOOD',locality:'Test',geometryId,provenance:'COMMUNITY',verification:'UNVERIFIED',lifecycle:'ACTIVE',qualification:null,assessmentStatus:'PENDING',severity:'UNKNOWN',recentWitnesses:1,totalWitnesses:1,lastObservedAt:Date.now(),staleAt:Date.now()+3600000,revision:1,evidenceGeneration:1,controlRevision:1,nextAssessmentAt:0,audience:'DEMO'});
  const authorId=await ctx.db.insert('users',{name:'PRIVATE NAME',email:'private@example.test'});
  await ctx.db.insert('observations',{incidentId:id,authorId,alias:'PRIVATE ALIAS',capturedPoint:{latitude:13.081,longitude:80.271},fixObservedAt:Date.now(),accuracyM:10,observedAt:Date.now(),receivedAt:Date.now(),description:'Water rising by the bridge',status:'ACTIVE',revision:1,lastContributionAt:Date.now(),provenance:'COMMUNITY'});
  return id;
 });return {t,id};
}
it('builds bounded anonymous observation/history input with explicit provenance',async()=>{
 const {t,id}=await fixture();const result=await t.query(internal.evidence.input,{incidentId:id});expect(result).toMatchObject({counts:{recent:1,total:1},audience:'DEMO',historyPartial:false});expect(result!.samples[0]).toMatchObject({description:'Water rising by the bridge',provenance:'COMMUNITY'});
 const serialized=JSON.stringify(result);for(const privateText of ['PRIVATE NAME','private@example.test','PRIVATE ALIAS','capturedPoint','authorId','13.081'])expect(serialized).not.toContain(privateText);
});
it('rejects late snapshots after observations or authority control changes and coalesces identical snapshots',async()=>{
 const {t,id}=await fixture();const args={incidentId:id,incidentRevision:1,evidenceGeneration:1,controlRevision:1,json:'{"evidence":"original"}'};
 const first=await t.mutation(internal.evidence.store,args);expect(first).toBeTruthy();expect(await t.mutation(internal.evidence.store,args)).toBe(first);
 await t.run(ctx=>ctx.db.patch(id,{controlRevision:2}));expect(await t.mutation(internal.evidence.store,args)).toBeNull();
 expect(await t.run(ctx=>ctx.db.query('evidenceSnapshots').collect())).toHaveLength(1);
});
it('does not send official-only or closed incidents through community evaluation',async()=>{
 const {t,id}=await fixture();await t.run(ctx=>ctx.db.patch(id,{provenance:'AUTHORITY'}));expect(await t.query(internal.evidence.input,{incidentId:id})).toBeNull();
 await t.run(ctx=>ctx.db.patch(id,{provenance:'COMMUNITY',lifecycle:'REJECTED'}));expect(await t.query(internal.evidence.input,{incidentId:id})).toBeNull();
});

it('ignores successful fetch-time noise when deduplicating identical evidence',async()=>{
 const {t,id}=await fixture();const args={incidentId:id,incidentRevision:1,evidenceGeneration:1,controlRevision:1};
 const one=await t.mutation(internal.evidence.store,{...args,json:JSON.stringify({weather:{temperatureC:29,fetchedAt:1000},official:{checkedAt:1000},ageMs:10000})});
 const two=await t.mutation(internal.evidence.store,{...args,json:JSON.stringify({weather:{temperatureC:29,fetchedAt:2000},official:{checkedAt:2000},ageMs:20000})});expect(two).toBe(one);
});
