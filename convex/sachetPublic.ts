import { v } from 'convex/values';
import { paginationOptsValidator } from 'convex/server';
import { query } from './_generated/server';
import { requireIndiaAccess } from './lib/authorization';
import { language } from './lib/validators';
import { INDIA_FEED } from './providers/sachet';
import { reject } from './lib/errors';
import type { Doc } from './_generated/dataModel';
function localized(notice:Doc<'officialNotices'>,preferred:string){return notice.infos.find(i=>i.language.split('-')[0]===preferred)??notice.infos.find(i=>i.language.startsWith('en'))??notice.infos[0];}
export const latest=query({args:{language,paginationOpts:paginationOptsValidator},handler:async(ctx,args)=>{
 await requireIndiaAccess(ctx);
 if(!Number.isInteger(args.paginationOpts.numItems)||args.paginationOpts.numItems<1||args.paginationOpts.numItems>30)reject('INVALID_INPUT');
 const result=await ctx.db.query('officialNotices').withIndex('by_active_sentAt',q=>q.eq('active',true)).order('desc').paginate(args.paginationOpts);
 const page=[];
 for(const notice of result.page){
  if(!notice.eligible)continue;const info=localized(notice,args.language);if(!info)continue;
  const document=await ctx.db.get(notice.documentId);
  page.push({id:notice._id,headline:info.headline||info.event,event:info.event,issuer:notice.sender,language:info.language,severity:info.severity,urgency:info.urgency,certainty:info.certainty,issuedAt:notice.sentAt,expiresAt:info.expiresAt,expired:info.expiresAt!==null&&info.expiresAt<=Date.now(),areaDescriptions:info.areaDescriptions.slice(0,5).map(s=>s.slice(0,300)),descriptionPreview:info.description.slice(0,240),checkedAt:document?.lastSuccessAt??null,stale:!document?.lastSuccessAt||Date.now()-document.lastSuccessAt>600_000,geometryPending:info.geometries.length===0});
 }
 const feed=await ctx.db.query('feedDocuments').withIndex('by_url',q=>q.eq('url',INDIA_FEED)).unique();
 return {...result,page,feedCheckedAt:feed?.lastSuccessAt??null,feedFailed:!!feed?.lastError,serverTime:Date.now()};
}});
export const detail=query({args:{noticeId:v.id('officialNotices'),language},handler:async(ctx,args)=>{
 await requireIndiaAccess(ctx);const notice=await ctx.db.get(args.noticeId);if(!notice?.eligible) return reject('NOT_FOUND');
 const info=localized(notice,args.language);if(!info)return reject('NOT_FOUND');const document=await ctx.db.get(notice.documentId);
 const {geometries,polygonUrls,...original}=info;void polygonUrls;
 const infoBlocks=notice.infos.filter(i=>i.language===info.language).map(({geometries,polygonUrls,...block})=>{void geometries;void polygonUrls;return block;});
 return {id:notice._id,issuer:notice.sender,identifier:notice.identifier,revision:notice.revision,active:notice.active,messageType:notice.msgType,issuedAt:notice.sentAt,checkedAt:document?.lastSuccessAt??null,sourceUrl:document?.url??null,stale:!document?.lastSuccessAt||Date.now()-document.lastSuccessAt>600_000,expired:info.expiresAt!==null&&info.expiresAt<=Date.now(),geometryPending:geometries.length===0,infoBlocks,...original};
}});

export const status=query({args:{},handler:async ctx=>{await requireIndiaAccess(ctx);const feed=await ctx.db.query('feedDocuments').withIndex('by_url',q=>q.eq('url',INDIA_FEED)).unique();return {checkedAt:feed?.lastSuccessAt??null,failed:!!feed?.lastError,stale:!feed?.lastSuccessAt||Date.now()-feed.lastSuccessAt>600_000};}});
