import type { MutationCtx } from '../_generated/server';
import type { Doc } from '../_generated/dataModel';
import { internal } from '../_generated/api';
import { coveringCells } from './areas';
import { POLICY_VERSION } from '../../src/domain/policy';
const rank = ['CRITICAL', 'HIGH', 'MODERATE', 'LOW', 'UNKNOWN'];
/** Model conclusions never create official instructions or change an authority source. */
export async function publishCommunity(ctx: MutationCtx, incident: Doc<'incidents'>, severity: Doc<'incidents'>['severity']) {
  const now = Date.now();
  const previous = await ctx.db.query('alerts').withIndex('by_incident', q => q.eq('incidentId', incident._id)).unique();
  const oldSources = previous ? await ctx.db.query('alertSources').withIndex('by_alert_active', q => q.eq('alertId', previous._id).eq('active', true)).take(33) : [];
  if (oldSources.length > 32) throw Error('SOURCE_LIMIT');
  const old = oldSources.find(source => source.kind === 'COMMUNITY');
  if (old && rank.indexOf(severity) >= rank.indexOf(old.severity) && old.geometryId === incident.geometryId) return { alertId: previous!._id, revision: previous!.currentRevision, changed: false };
  const revision = (previous?.currentRevision ?? 0) + 1;
  const alertId = previous?._id ?? await ctx.db.insert('alerts', { incidentId: incident._id, lifecycle: 'ACTIVE', currentRevision: revision, createdAt: now, updatedAt: now, audience: incident.audience });
  if (previous) await ctx.db.patch(alertId, { currentRevision: revision, lifecycle: 'ACTIVE', updatedAt: now });
  if (old) await ctx.db.patch(old._id, { severity, geometryId: incident.geometryId, sourceRevision: old.sourceRevision + 1 });
  else await ctx.db.insert('alertSources', { alertId, kind: 'COMMUNITY', geometryId: incident.geometryId, severity, issuerLabel: 'GudTour · Jev-assessed community evidence', active: true, sourceRevision: 1, audience: incident.audience });
  const sources = await ctx.db.query('alertSources').withIndex('by_alert_active', q => q.eq('alertId', alertId).eq('active', true)).take(33);
  if (sources.length > 32) throw Error('SOURCE_LIMIT');
  const cells = new Set<string>();
  for (const source of sources) { const area = await ctx.db.get(source.geometryId); if (!area) throw Error('MISSING_GEOMETRY'); for (const cell of coveringCells(area.area)) cells.add(cell); if (cells.size > 2048) throw Error('COVERAGE_LIMIT'); }
  const strongest = sources.reduce((a, b) => rank.indexOf(a) <= rank.indexOf(b.severity) ? a : b.severity, severity);
  await ctx.db.insert('alertRevisions', { alertId, revision, sources: sources.map(s => ({ sourceId: s._id, geometryId: s.geometryId, ...(s.instructionVersionId ? { instructionVersionId: s.instructionVersionId } : {}), severity: s.severity, issuerLabel: s.issuerLabel, active: true })), severity: strongest, materialReason: previous ? old ? 'SEVERITY' : 'SOURCE' : 'FIRST', urgency: previous ? 'MATERIAL' : 'FIRST', criticalInstruction: false, publishedAt: now, policyVersion: POLICY_VERSION });
  const jobId = await ctx.db.insert('jobs', { kind: 'ALERT_EXPANSION', key: `${alertId}:${revision}`, status: 'PENDING', dueAt: now, createdAt: now, alertId, alertRevision: revision, geometryId: incident.geometryId, cells: [...cells].sort(), cellIndex: 0, childIndex: 0, cursor: null, checkpoint: 0 });
  await ctx.scheduler.runAfter(0, internal.alertExpansion.page, { jobId, checkpoint: 0 });
  return { alertId, revision, changed: true };
}
