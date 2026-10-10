import { paginationOptsValidator } from 'convex/server';
import geohash from 'ngeohash';
import { enqueueTranslations } from './translations';
import { internal } from './_generated/api';
import { mutation, query } from './_generated/server';
import { v } from 'convex/values';
import { requireAssignedJurisdiction, requireUser } from './lib/authorization';
import { containsArea, coveringCells, validateArea } from './lib/areas';
import { command, payloadHash } from './lib/idempotency';
import { reject } from './lib/errors';
import { actionKind, geometry, hazard, language, severity } from './lib/validators';
import type { Id } from './_generated/dataModel';
import { DAY, POLICY_VERSION } from '../src/domain/policy';

/** Canonical publication only; provider calls and delivery happen after this transaction. */
export const publish = mutation({ args: {
  requestId: v.string(), jurisdictionId: v.id('jurisdictions'), incidentId: v.optional(v.id('incidents')),
  expectedIncidentRevision: v.number(), hazard, locality: v.string(), area: geometry, severity,
  originalText: v.string(), sourceLanguage: language, actionKind, namedShelterId: v.optional(v.id('shelters')),
  deadlineAt: v.optional(v.number()), reviewDueAt: v.number(), reason: v.optional(v.string()),
}, handler: async (ctx, args): Promise<{ incidentId: Id<'incidents'>; declarationId: Id<'authorityDeclarations'>; alertId: Id<'alerts'>; revision: number; instructionVersionId: Id<'instructionVersions'>; publishedAt: number }> => {
  const userId = await requireUser(ctx);
  return command(ctx, userId, 'DECLARATION_PUBLISH', args.requestId, args, async () => {
    const scope = await requireAssignedJurisdiction(ctx, args.jurisdictionId);
    validateArea(args.area);
    if (!containsArea(scope.area, args.area)) return reject('JURISDICTION_DENIED');
    const now = Date.now();
    if (!args.originalText.trim() || args.originalText.length > 8000 || /[\u0000-\u0008\u000b\u000c\u000e-\u001f]/.test(args.originalText)
      || args.locality.trim().length < 1 || args.locality.length > 160 || /[\u0000-\u001f]/.test(args.locality)
      || (args.reason !== undefined && args.reason.length > 500) || args.severity === 'UNKNOWN'
      || !Number.isFinite(args.reviewDueAt) || args.reviewDueAt <= now || args.reviewDueAt > now + DAY
      || (args.deadlineAt !== undefined && (!Number.isFinite(args.deadlineAt) || args.deadlineAt <= now))) return reject('INVALID_INPUT');
    if ((args.actionKind === 'NAMED_SHELTER') !== Boolean(args.namedShelterId)) return reject('INVALID_INPUT');
    if (args.namedShelterId) {
      const shelter = await ctx.db.get(args.namedShelterId);
      if (!shelter || shelter.archivedAt !== undefined || shelter.agencyId !== scope.agency._id || shelter.audience !== scope.agency.audience) return reject('JURISDICTION_DENIED');
    }
    const existing = args.incidentId ? await ctx.db.get(args.incidentId) : null;
    if (args.incidentId && !existing) return reject('NOT_FOUND');
    if (args.expectedIncidentRevision !== (existing?.revision ?? 0)) return reject('REVISION_CONFLICT');
    if (existing && (existing.audience !== scope.agency.audience || existing.hazard !== args.hazard || !['ACTIVE', 'STALE'].includes(existing.lifecycle))) return reject('INVALID_INPUT');
    if (existing) {
      const previousArea = await ctx.db.get(existing.geometryId);
      if (!previousArea || !containsArea(scope.area, previousArea.area)) return reject('JURISDICTION_DENIED');
    }
    // Validate bounded geographic expansion before any canonical publication is committed.
    const cells = new Set(coveringCells(args.area));
    const geometryId = await ctx.db.insert('geometries', { area: args.area, source: 'AUTHORITY', sourceAccuracyM: null, version: 1, geometryHash: payloadHash(args.area) });
    const incidentId = existing?._id ?? await ctx.db.insert('incidents', {
      hazard: args.hazard, locality: args.locality.trim(), geometryId, provenance: 'AUTHORITY', verification: 'AUTHORITY_VERIFIED', lifecycle: 'ACTIVE',
      qualification: null, assessmentStatus: 'PENDING', severity: args.severity, recentWitnesses: 0, totalWitnesses: 0,
      lastObservedAt: now, staleAt: args.reviewDueAt, revision: 1, evidenceGeneration: 1, controlRevision: 1,
      nextAssessmentAt: args.reviewDueAt, audience: scope.agency.audience, authorityAgencyId: scope.agency._id,
    });
    if (!existing && args.area.type === 'circle') for (const precision of [4,5]) await ctx.db.insert('geoPoints',{kind:'INCIDENT',entityId:incidentId,precision,cell:geohash.encode(args.area.center.latitude,args.area.center.longitude,precision),point:args.area.center,active:true,observedAt:now});
    if (existing) await ctx.db.patch(incidentId, { verification: 'AUTHORITY_VERIFIED', lifecycle: 'ACTIVE', revision: existing.revision + 1, controlRevision: existing.controlRevision + 1 });
    const declarationId = await ctx.db.insert('authorityDeclarations', { incidentId, membershipId: scope.membership._id, agencyId: scope.agency._id,
      geometryId, severity: args.severity, reviewDueAt: args.reviewDueAt, active: true, revision: 1, audience: scope.agency.audience });
    const instructionVersionId = await ctx.db.insert('instructionVersions', { declarationId, revision: 1, originalText: args.originalText,
      originalHash: payloadHash(args.originalText), sourceLanguage: args.sourceLanguage, actionKind: args.actionKind, ...(args.namedShelterId ? { namedShelterId: args.namedShelterId } : {}), issuedAt: now, ...(args.deadlineAt !== undefined ? { deadlineAt: args.deadlineAt } : {}) });
    await ctx.db.patch(declarationId, { instructionVersionId });
    const previousAlert = await ctx.db.query('alerts').withIndex('by_incident', q => q.eq('incidentId', incidentId)).unique();
    const revision = (previousAlert?.currentRevision ?? 0) + 1;
    const alertId = previousAlert?._id ?? await ctx.db.insert('alerts', { incidentId, lifecycle: 'ACTIVE', currentRevision: revision, createdAt: now, updatedAt: now, audience: scope.agency.audience });
    if (previousAlert) await ctx.db.patch(alertId, { lifecycle: 'ACTIVE', currentRevision: revision, updatedAt: now });
    await ctx.db.insert('alertSources', { alertId, kind: 'AUTHORITY', declarationId, instructionVersionId, geometryId, severity: args.severity,
      agencyId: scope.agency._id, issuerLabel: scope.agency.sourceLabel, active: true, sourceRevision: 1, audience: scope.agency.audience });
    const sources = await ctx.db.query('alertSources').withIndex('by_alert_active', q => q.eq('alertId', alertId).eq('active', true)).take(33);
    if (sources.length > 32) return reject('CONFIGURATION_REQUIRED');
    for (const source of sources) {
      const sourceArea = await ctx.db.get(source.geometryId);
      if (!sourceArea) return reject('CONFIGURATION_REQUIRED');
      for (const cell of coveringCells(sourceArea.area)) cells.add(cell);
      if (cells.size > 2048) return reject('CONFIGURATION_REQUIRED');
    }
    const ranks = ['CRITICAL', 'HIGH', 'MODERATE', 'LOW', 'UNKNOWN'];
    const strongest = sources.reduce<typeof sources[number]['severity']>((best, source) => ranks.indexOf(source.severity) < ranks.indexOf(best) ? source.severity : best, args.severity);
    await ctx.db.insert('alertRevisions', { alertId, revision, sources: sources.map(s => ({ sourceId: s._id, geometryId: s.geometryId, ...(s.instructionVersionId ? { instructionVersionId: s.instructionVersionId } : {}), severity: s.severity, issuerLabel: s.issuerLabel, active: s.active })),
      severity: strongest, materialReason: previousAlert ? 'SOURCE' : 'FIRST', urgency: previousAlert ? 'MATERIAL' : 'FIRST', criticalInstruction: true, publishedAt: now, policyVersion: POLICY_VERSION });
    const jobId = await ctx.db.insert('jobs', { kind: 'ALERT_EXPANSION', key: `${alertId}:${revision}`, status: 'PENDING', dueAt: now, createdAt: now, alertId, alertRevision: revision,
      geometryId, cells: [...cells].sort(), cellIndex: 0, childIndex: 0, cursor: null, checkpoint: 0 });
    await ctx.scheduler.runAfter(0, internal.alertExpansion.page, { jobId, checkpoint: 0 });
    await ctx.db.insert('auditEvents', { actorId: userId, actorKind: 'AUTHORITY', objectKind: 'AUTHORITY_DECLARATION', objectId: declarationId, revision: 1, action: 'PUBLISH', reason: args.reason?.trim() || 'Emergency declaration published', createdAt: now });
    await enqueueTranslations(ctx, instructionVersionId);
    return { incidentId, declarationId, alertId, revision, instructionVersionId, publishedAt: now };
  });
} });

export const managed = query({args:{jurisdictionId:v.id('jurisdictions'),paginationOpts:paginationOptsValidator},handler:async(ctx,args)=>{
 const scope=await requireAssignedJurisdiction(ctx,args.jurisdictionId);
 if(args.paginationOpts.numItems<1 || args.paginationOpts.numItems>30)return reject('INVALID_INPUT');
 const result=await ctx.db.query('authorityDeclarations').withIndex('by_agency_active',q=>q.eq('agencyId',scope.agency._id).eq('active',true)).order('desc').paginate(args.paginationOpts);
 const page=[];
 for(const declaration of result.page){
  const geometry=await ctx.db.get(declaration.geometryId);if(!geometry || !containsArea(scope.area,geometry.area))continue;
  const incident=await ctx.db.get(declaration.incidentId),instruction=declaration.instructionVersionId?await ctx.db.get(declaration.instructionVersionId):null;
  if(!incident || declaration.audience!==scope.agency.audience)continue;
  page.push({id:declaration._id,revision:declaration.revision,locality:incident.locality,hazard:incident.hazard,severity:declaration.severity,reviewDueAt:declaration.reviewDueAt,originalText:instruction?.originalText??null,issuer:scope.agency.sourceLabel,audience:declaration.audience});
 }
 return {...result,page};
}});
/** Ends only this agency's source; concurrent independent sources remain authoritative. */
export const end = mutation({args:{requestId:v.string(),jurisdictionId:v.id('jurisdictions'),declarationId:v.id('authorityDeclarations'),expectedRevision:v.number(),kind:v.union(v.literal('WITHDRAWN'),v.literal('RESOLVED'),v.literal('FALSE_ALERT'))},handler:async(ctx,args)=>{
 const userId=await requireUser(ctx);
 return command(ctx,userId,'DECLARATION_END',args.requestId,args,async()=>{
  const scope=await requireAssignedJurisdiction(ctx,args.jurisdictionId),declaration=await ctx.db.get(args.declarationId);
  if(!declaration || declaration.agencyId!==scope.agency._id || declaration.audience!==scope.agency.audience)return reject('JURISDICTION_DENIED');
  const geometry=await ctx.db.get(declaration.geometryId);if(!geometry || !containsArea(scope.area,geometry.area))return reject('JURISDICTION_DENIED');
  if(!declaration.active || declaration.revision!==args.expectedRevision)return reject('REVISION_CONFLICT');
  const now=Date.now(),declarationRevision=declaration.revision+1;
  await ctx.db.patch(declaration._id,{active:false,endedAt:now,endReason:args.kind,revision:declarationRevision});
  const source=await ctx.db.query('alertSources').withIndex('by_declaration',q=>q.eq('declarationId',declaration._id)).unique();
  if(!source)return reject('CONFIGURATION_REQUIRED');
  await ctx.db.patch(source._id,{active:false,endedAt:now,endReason:args.kind,sourceRevision:source.sourceRevision+1});
  const alert=await ctx.db.get(source.alertId);if(!alert)return reject('CONFIGURATION_REQUIRED');
  const prior=await ctx.db.query('alertRevisions').withIndex('by_alert_revision',q=>q.eq('alertId',alert._id).eq('revision',alert.currentRevision)).unique();if(!prior)return reject('CONFIGURATION_REQUIRED');
  const remaining=await ctx.db.query('alertSources').withIndex('by_alert_active',q=>q.eq('alertId',alert._id).eq('active',true)).take(33);if(remaining.length>32)return reject('CONFIGURATION_REQUIRED');
  const revision=alert.currentRevision+1,ranks=['CRITICAL','HIGH','MODERATE','LOW','UNKNOWN'];
  const strongest=remaining.reduce<typeof source.severity>((best,item)=>ranks.indexOf(item.severity)<ranks.indexOf(best)?item.severity:best,'UNKNOWN');
  const sources=prior.sources.map(item=>item.sourceId===source._id?{...item,active:false}:item);
  await ctx.db.patch(alert._id,{currentRevision:revision,lifecycle:remaining.length?'ACTIVE':'ENDED',updatedAt:now});
  await ctx.db.insert('alertRevisions',{alertId:alert._id,revision,sources,severity:strongest,materialReason:args.kind==='FALSE_ALERT'?'CORRECTION':'ENDING',urgency:'SILENT',criticalInstruction:false,publishedAt:now,policyVersion:POLICY_VERSION});
  if(remaining.length){
   const cells=new Set<string>();for(const item of remaining){const area=await ctx.db.get(item.geometryId);if(!area)return reject('CONFIGURATION_REQUIRED');for(const cell of coveringCells(area.area))cells.add(cell);if(cells.size>2048)return reject('CONFIGURATION_REQUIRED');}
   const jobId=await ctx.db.insert('jobs',{kind:'ALERT_EXPANSION',key:`${alert._id}:${revision}`,status:'PENDING',dueAt:now,createdAt:now,alertId:alert._id,alertRevision:revision,geometryId:remaining[0]!.geometryId,cells:[...cells].sort(),cellIndex:0,childIndex:0,cursor:null,checkpoint:0});
   await ctx.scheduler.runAfter(0,internal.alertExpansion.page,{jobId,checkpoint:0});
  }
  await ctx.db.insert('auditEvents',{actorId:userId,actorKind:'AUTHORITY',objectKind:'AUTHORITY_DECLARATION',objectId:declaration._id,revision:declarationRevision,action:args.kind,reason:'Authority ended this declaration',createdAt:now});
  return {declarationRevision,alertRevision:revision,alertEnded:remaining.length===0};
 });
}});
