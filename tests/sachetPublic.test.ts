import { expect, it } from 'vitest';
import { convexTest } from 'convex-test';
import schema from '../convex/schema';
import { api } from '../convex/_generated/api';
const modules=import.meta.glob('../convex/**/*.ts');
const info={language:'en-IN',event:'Heavy rain',headline:'Official rain warning',description:'Published details',instruction:'Do not cross the river.',urgency:'Immediate',severity:'Severe',certainty:'Likely',responseTypes:['Avoid'],effectiveAt:null,onsetAt:null,expiresAt:Date.now()+3600000,areaDescriptions:['Test area'],geometries:[],polygonUrls:[]};
async function fixture(){const t=convexTest(schema,modules);const ids=await t.run(async ctx=>{
 const userId=await ctx.db.insert('users',{});await ctx.db.insert('locations',{userId,point:{latitude:13.08,longitude:80.27},accuracyM:10,observedAt:Date.now(),receivedAt:Date.now(),countryStatus:'INSIDE_INDIA',foregroundPermission:'granted',backgroundPermission:'denied',source:'FOREGROUND',admittedAt:Date.now(),revision:1});
 const documentId=await ctx.db.insert('feedDocuments',{url:'https://sachet.ndma.gov.in/cap_public_website/FetchXMLFile?identifier=test',kind:'CAP',revision:1,lastSuccessAt:Date.now(),nextPollAt:Date.now()+10000,failures:0,leaseUntil:0,generation:1});
 const noticeId=await ctx.db.insert('officialNotices',{key:'test-key',sender:'Official test issuer',identifier:'test-cap',sentAt:Date.now(),documentId,revision:1,eligible:true,active:true,msgType:'Alert',references:[],infos:[info,{...info,headline:'Second warning',instruction:'Additional original instruction'},{...info,language:'ta-IN',headline:'தமிழ் எச்சரிக்கை',instruction:'அசல் அறிவுரை'}],updatedAt:Date.now()});return {userId,noticeId};
 });return {t,...ids,actor:t.withIdentity({subject:`${ids.userId}|session`})};}
it('lists only eligible notices with original language fallback, expiry and provenance',async()=>{
 const {t,actor,noticeId}=await fixture();
 await expect(t.query(api.sachetPublic.latest,{language:'en',paginationOpts:{numItems:15,cursor:null}})).rejects.toThrow('AUTH_REQUIRED');
 const result=await actor.query(api.sachetPublic.latest,{language:'fr',paginationOpts:{numItems:15,cursor:null}});expect(result.page[0]).toMatchObject({id:noticeId,headline:info.headline,language:'en-IN',issuer:'Official test issuer',expired:false});
 expect((await actor.query(api.sachetPublic.detail,{noticeId,language:'en'})).infoBlocks).toHaveLength(2);
 expect((await actor.query(api.sachetPublic.detail,{noticeId,language:'ta'})).instruction).toBe('அசல் அறிவுரை');
 await t.run(ctx=>ctx.db.patch(noticeId,{infos:[{...info,expiresAt:Date.now()-1}]}));expect((await actor.query(api.sachetPublic.detail,{noticeId,language:'en'})).expired).toBe(true);
 await t.run(ctx=>ctx.db.patch(noticeId,{eligible:false}));expect((await actor.query(api.sachetPublic.latest,{language:'en',paginationOpts:{numItems:15,cursor:null}})).page).toHaveLength(0);
 await expect(actor.query(api.sachetPublic.detail,{noticeId,language:'en'})).rejects.toThrow('NOT_FOUND');
});
it('keeps superseded detail readable while removing it from current notices',async()=>{
 const {t,actor,noticeId}=await fixture();await t.run(ctx=>ctx.db.patch(noticeId,{active:false,supersededBy:'newer-official-notice'}));
 expect((await actor.query(api.sachetPublic.latest,{language:'en',paginationOpts:{numItems:15,cursor:null}})).page).toHaveLength(0);
 expect(await actor.query(api.sachetPublic.detail,{noticeId,language:'en'})).toMatchObject({active:false,instruction:info.instruction});
});
