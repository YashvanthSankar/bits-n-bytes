import { expect, it, vi } from 'vitest';
import realCap from './fixtures/sachet/actual-update.xml?raw';
import realPolygon from './fixtures/sachet/actual-polygon.xml?raw';
import { convexTest } from 'convex-test';
import schema from '../convex/schema';
import { internal } from '../convex/_generated/api';
import { fetchXml, INDIA_FEED, parseCap, parseDiscovery, parsePolygon, sachetUrl } from '../convex/providers/sachet';
const modules = import.meta.glob('../convex/**/*.ts');
const sent = '2026-10-10T09:00:00+05:30';
function cap(id = 'one', type = 'Alert', refs = '', status = 'Actual', geometry = '<circle>13,80 2</circle>') {
  return `<alert xmlns="urn:oasis:names:tc:emergency:cap:1.2"><identifier>${id}</identifier><sender>official@example.test</sender><sent>${sent}</sent><status>${status}</status><msgType>${type}</msgType><scope>Public</scope><references>${refs}</references><info><language>en-IN</language><event>Flood</event><severity>Severe</severity><urgency>Immediate</urgency><certainty>Observed</certainty><instruction>Do not cross water before 18:00.</instruction><area><areaDesc>Test area</areaDesc>${geometry}</area></info></alert>`;
}
it('parses original CAP fields with latitude/longitude and kilometre conversion', () => {
 const notice = parseCap(cap()); expect(notice.eligible).toBe(true); expect(notice.infos[0]!.instruction).toBe('Do not cross water before 18:00.');
 expect(notice.infos[0]!.geometries[0]).toEqual({ type:'circle',center:{latitude:13,longitude:80},radiusM:2000 });
 expect(parseCap(cap('test','Alert','','Test')).eligible).toBe(false);
 expect(parseCap(cap('none','Alert','','Actual','')).infos[0]!.geometries).toEqual([]);
});
it('deduplicates trusted discovery links and refuses arbitrary sources', () => {
 const url = 'https://sachet.ndma.gov.in/cap_public_website/FetchXMLFile?identifier=one';
 expect(parseDiscovery(`<rss><channel><item><link>${url}</link></item><item><link>${url}</link></item><item><link>https://evil.test/x</link></item></channel></rss>`)).toEqual([url]);
 for(const url of ['http://sachet.ndma.gov.in/cap_public_website/rss/rss_india.xml','https://sachet.ndma.gov.in.evil.test/cap_public_website/FetchXMLFile?identifier=one','https://sachet.ndma.gov.in/private']) expect(()=>sachetUrl(url)).toThrow();
});
it('rejects malformed/hostile XML, excessive depth, broken geometry and polygon identity mismatch', () => {
 for(const xml of ['<!DOCTYPE alert [<!ENTITY x SYSTEM "file:///etc/passwd">]>'+cap(), '<alert>', '<a>'.repeat(33)+'</a>'.repeat(33),cap('one','Alert','','Actual','<circle>91,80 2</circle>')])expect(()=>parseCap(xml)).toThrow();
 expect(()=>parsePolygon('<alert><identifier>other</identifier><polygon>13,80 13,81 14,81 13,80</polygon></alert>','one')).toThrow();
 expect(parsePolygon('<alert><identifier>one</identifier><polygon>13,80 13,81 14,81 13,80</polygon></alert>','one')).toHaveLength(1);
});
it('reuses the exact ETag and cached XML on 304 without a second request or reading its body', async () => {
 const fake = vi.fn<(url: string, init: RequestInit) => Promise<Response>>().mockResolvedValue(new Response(null,{status:304}));
 const cached = {xml:cap(),etag:'W/"opaque"'};
 expect(await fetchXml(INDIA_FEED,cached,fake)).toEqual({...cached,unchanged:true});
 expect(fake).toHaveBeenCalledTimes(1);expect(fake.mock.calls[0]![1]!.headers).toEqual({'If-None-Match':'W/"opaque"'});
 await expect(fetchXml(INDIA_FEED,null,fake)).rejects.toThrow('SACHET_CACHE_MISSING');
});
it('accepts valid changed XML and rejects invalid 200 replacements',async()=>{
 const fake=vi.fn<(url: string, init: RequestInit) => Promise<Response>>().mockResolvedValueOnce(new Response(cap(),{headers:{ETag:'"new"'}})).mockResolvedValueOnce(new Response('<bad>'));
 expect(await fetchXml(INDIA_FEED,null,fake)).toMatchObject({xml:cap(),etag:'"new"',unchanged:false});await expect(fetchXml(INDIA_FEED,null,fake)).rejects.toThrow();
});
async function ingest(t:ReturnType<typeof convexTest>,id:string,xml:string){
 const documentId=await t.run(ctx=>ctx.db.insert('feedDocuments',{url:`https://sachet.ndma.gov.in/cap_public_website/FetchXMLFile?identifier=${id}`,kind:'CAP',revision:0,failures:0,nextPollAt:0,leaseUntil:Date.now()+100000,generation:1}));
 await t.mutation(internal.sachet.accept,{id:documentId,generation:1,xml,etag:'"first"'});return documentId;
}
it('retains cancellation tombstones so a late original cannot resurrect a notice',async()=>{
 const t=convexTest(schema,modules);await ingest(t,'cancel',cap('cancel','Cancel',`official@example.test,one,${sent}`));await ingest(t,'one',cap());
 const notices=await t.run(ctx=>ctx.db.query('officialNotices').collect());expect(notices.find(n=>n.identifier==='one')).toMatchObject({active:false,supersededBy:JSON.stringify(['official@example.test','cancel',Date.parse(sent)])});
 expect(notices.find(n=>n.identifier==='cancel')!.active).toBe(false);expect(await t.run(ctx=>ctx.db.query('incidents').collect())).toEqual([]);
});
it('never lets a test cancellation retire a live notice',async()=>{
 const t=convexTest(schema,modules);await ingest(t,'one',cap());await ingest(t,'test-cancel',cap('test-cancel','Cancel',`official@example.test,one,${sent}`,'Test'));
 expect((await t.run(ctx=>ctx.db.query('officialNotices').collect())).find(n=>n.identifier==='one')!.active).toBe(true);
});
it('keeps successful-check time separate from content revision and preserves cache on failure',async()=>{
 const t=convexTest(schema,modules);const id=await ingest(t,'one',cap());
 const before=(await t.run(ctx=>ctx.db.get(id)))!;
 await t.run(ctx=>ctx.db.patch(id,{leaseUntil:Date.now()+100000,generation:2}));await t.mutation(internal.sachet.accept,{id,generation:2,xml:cap(),etag:'"first"'});
 const after=(await t.run(ctx=>ctx.db.get(id)))!;expect(after.revision).toBe(1);expect(after.changedAt).toBe(before.changedAt);expect(await t.run(ctx=>ctx.db.query('officialNoticeRevisions').collect())).toHaveLength(1);
 await t.run(ctx=>ctx.db.patch(id,{leaseUntil:Date.now()+100000,generation:3}));await t.mutation(internal.sachet.fail,{id,generation:3,error:'SACHET_HTTP_ERROR'});
 expect(await t.run(ctx=>ctx.db.get(id))).toMatchObject({xml:cap(),etag:'"first"',revision:1,failures:1});
 await t.mutation(internal.sachet.accept,{id,generation:2,xml:cap('wrong')});expect((await t.run(ctx=>ctx.db.get(id)))!.failures).toBe(1);
});
it('ingests real SACHET numeric fetch tokens and binds separately fetched polygon identity',async()=>{
 const xml=realCap, polygon=realPolygon;
 const t=convexTest(schema,modules);await ingest(t,'1791608368182027',xml);
 const id=await t.run(ctx=>ctx.db.query('feedDocuments').withIndex('by_url',q=>q.eq('url','https://sachet.ndma.gov.in/cap_public_website/FetchPolygonXMLFile?identifier=1791608368182027')).unique());expect(id).toBeTruthy();
 await t.run(ctx=>ctx.db.patch(id!._id,{leaseUntil:Date.now()+100000,generation:1}));
 await t.mutation(internal.sachet.accept,{id:id!._id,generation:1,xml:polygon});
 expect((await t.run(ctx=>ctx.db.get(id!._id)))!.revision).toBe(1);
 const notice=(await t.run(ctx=>ctx.db.query('officialNotices').collect()))[0]!;expect(notice.identifier).toBe('IN-1791608368182027_27');expect(notice.infos[0]!.urgency).toBe('Future');
});
it('matches evidence to actual source geometry and excludes expired and area-name-only notices',async()=>{
 const t=convexTest(schema,modules);await ingest(t,'one',cap());await ingest(t,'names',cap('names','Alert','','Actual',''));
 await ingest(t,'expired',cap('expired').replace('<event>Flood</event>','<event>Flood</event><expires>2020-01-01T00:00:00Z</expires>'));
 const inside=await t.query(internal.sachet.relevant,{point:{latitude:13,longitude:80},accuracyM:10});expect(inside.items).toHaveLength(1);expect(inside.geometryPending).toBe(1);
 const outside=await t.query(internal.sachet.relevant,{point:{latitude:15,longitude:80},accuracyM:10});expect(outside.items).toEqual([]);
});
