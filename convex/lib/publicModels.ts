import type { Doc } from '../_generated/dataModel';
import type { PublicIncident } from '../../src/contracts/domain';
import type { QueryCtx } from '../_generated/server';
import { currentIncidentState, witnessSummary } from '../../src/domain/incidentState';
import { reject } from './errors';

/** Read-time freshness also holds when a scheduled expiry job runs late. */
export async function freshIncidentDTO(ctx: QueryCtx, incident: Doc<'incidents'>, geometry: Doc<'geometries'>): Promise<PublicIncident> {
  const observations = await ctx.db.query('observations').withIndex('by_incident_status_observedAt', q => q.eq('incidentId', incident._id).eq('status', 'ACTIVE')).take(501);
  if (observations.length > 500) return reject('CONFIGURATION_REQUIRED');
  const now = Date.now();
  const counts = witnessSummary(observations, incident.hazard, now);
  const alert = await ctx.db.query('alerts').withIndex('by_incident', q => q.eq('incidentId', incident._id)).unique();
  const snapshot = alert?.lifecycle === 'ACTIVE' ? await ctx.db.query('alertRevisions').withIndex('by_alert_revision', q => q.eq('alertId', alert._id).eq('revision', alert.currentRevision)).unique() : null;
  const officialEmergency = snapshot?.sources.some(source => source.active && source.issuerLabel && source.instructionVersionId)
    ? { severity: snapshot.severity, revision: snapshot.revision } : null;
  const dto = incidentDTO({ ...incident, recentWitnesses: counts.recent, totalWitnesses: counts.total,
    ...currentIncidentState(incident, incident.hazard, counts.recent, now) }, geometry);
  return { ...dto, ...(officialEmergency ? { lifecycle: 'ACTIVE' as const } : {}), officialEmergency };
}

export function incidentDTO(incident: Doc<'incidents'>, geometry: Doc<'geometries'>): PublicIncident {
  return { officialEmergency: null, id: incident._id, hazard: incident.hazard, locality: incident.locality, geometry: geometry.area,
    provenance: incident.provenance, verification: incident.verification, lifecycle: incident.lifecycle,
    qualification: incident.qualification, assessmentStatus: incident.assessmentStatus, severity: incident.severity,
    recentWitnesses: incident.recentWitnesses, totalWitnesses: incident.totalWitnesses, lastObservedAt: incident.lastObservedAt,
    revision: incident.revision, audience: incident.audience };
}
