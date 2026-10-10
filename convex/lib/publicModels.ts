import type { Doc } from '../_generated/dataModel';
import type { PublicIncident } from '../../src/contracts/domain';

export function incidentDTO(incident: Doc<'incidents'>, geometry: Doc<'geometries'>): PublicIncident {
  return { id: incident._id, hazard: incident.hazard, locality: incident.locality, geometry: geometry.area,
    provenance: incident.provenance, verification: incident.verification, lifecycle: incident.lifecycle,
    qualification: incident.qualification, assessmentStatus: incident.assessmentStatus, severity: incident.severity,
    recentWitnesses: incident.recentWitnesses, totalWitnesses: incident.totalWitnesses, lastObservedAt: incident.lastObservedAt,
    revision: incident.revision, audience: incident.audience };
}
