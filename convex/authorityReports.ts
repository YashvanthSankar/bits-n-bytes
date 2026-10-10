import { v } from 'convex/values';
import { paginationOptsValidator } from 'convex/server';
import { query } from './_generated/server';
import { containsCircle, requireAssignedJurisdiction } from './lib/authorization';
import { reject } from './lib/errors';
import { audience } from './lib/validators';
import { freshIncidentDTO } from './lib/publicModels';
export const list=query({args:{jurisdictionId:v.id('jurisdictions'),audience:v.optional(audience),paginationOpts:paginationOptsValidator},handler:async(ctx,args)=>{
 const {agency,area}=await requireAssignedJurisdiction(ctx,args.jurisdictionId);
 if(!Number.isInteger(args.paginationOpts.numItems)||args.paginationOpts.numItems<1||args.paginationOpts.numItems>30)reject('INVALID_INPUT');
 // LIVE report evidence is readable within assigned geography; DEMO access stays explicit. Publishing authorization is unchanged.
 const selected=args.audience??agency.audience;if(selected==='DEMO'&&agency.audience!=='DEMO')reject('JURISDICTION_DENIED');
 const result=await ctx.db.query('incidents').withIndex('by_audience',q=>q.eq('audience',selected)).order('desc').paginate(args.paginationOpts);
 const page=[];
 for(const incident of result.page){
  if(incident.mergedInto)continue;const geometry=await ctx.db.get(incident.geometryId);if(!geometry||geometry.area.type!=='circle'||!containsCircle(area,geometry.area))continue;
  const dto=await freshIncidentDTO(ctx,incident,geometry);
  const assessment=await ctx.db.query('assessments').withIndex('by_incident_createdAt',q=>q.eq('incidentId',incident._id)).order('desc').first();
  page.push({...dto,assessment:assessment?{outcome:assessment.outcome,qualification:assessment.qualification,assessedAt:assessment.createdAt,model:assessment.model}:null,reviewNeeded:!!incident.reviewNeeded});
 }
 return {...result,page};
}});
export const detail=query({args:{jurisdictionId:v.id('jurisdictions'),incidentId:v.id('incidents')},handler:async(ctx,args)=>{
 const {agency,area}=await requireAssignedJurisdiction(ctx,args.jurisdictionId);const incident=await ctx.db.get(args.incidentId);
 if(!incident||(incident.audience==='DEMO'&&agency.audience!=='DEMO'))return reject('NOT_FOUND');
 const geometry=await ctx.db.get(incident.geometryId);if(!geometry||geometry.area.type!=='circle'||!containsCircle(area,geometry.area))return reject('JURISDICTION_DENIED');
 const assessment=await ctx.db.query('assessments').withIndex('by_incident_createdAt',q=>q.eq('incidentId',incident._id)).order('desc').first();
 const snapshot=assessment?await ctx.db.get(assessment.snapshotId):null;
 const job=await ctx.db.query('assessmentJobs').withIndex('by_incident',q=>q.eq('incidentId',incident._id)).unique();
 return {canDeclare:incident.audience===agency.audience,incident:await freshIncidentDTO(ctx,incident,geometry),reviewNeeded:!!incident.reviewNeeded,job:job?{status:job.status,lastError:job.lastError??null,attempt:job.attempt}:null,assessment:assessment?{model:assessment.model,rubric:assessment.rubric,qualification:assessment.qualification,outcome:assessment.outcome,optionProbability:assessment.optionProbability,confidence:assessment.confidence,severity:assessment.severity,assessedAt:assessment.createdAt,latencyMs:assessment.latencyMs,inputTokens:assessment.inputTokens,outputTokens:assessment.outputTokens,judgmentsJson:assessment.judgmentsJson,contextJson:snapshot?.json??null,currentEvidence:!!snapshot&&snapshot.evidenceGeneration===incident.evidenceGeneration&&snapshot.controlRevision===incident.controlRevision}:null};
}});
