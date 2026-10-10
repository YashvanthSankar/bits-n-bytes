import { v } from 'convex/values';
import { internalAction, internalMutation, internalQuery, type MutationCtx } from './_generated/server';
import type { Id } from './_generated/dataModel';
import { internal } from './_generated/api';
import { qualification, severity } from './lib/validators';
import { assessIncident, DecisionFailure } from './providers/jev';
import { publishCommunity } from './lib/communityPublication';
import { POLICY } from '../src/domain/policy';
import { witnessSummary } from '../src/domain/incidentState';

async function queue(ctx: MutationCtx, incidentId: Id<'incidents'>) {
  const incident = await ctx.db.get(incidentId); if (!incident || incident.provenance !== 'COMMUNITY' || incident.mergedInto || !['ACTIVE', 'STALE'].includes(incident.lifecycle)) return;
  const old = await ctx.db.query('assessmentJobs').withIndex('by_incident', q => q.eq('incidentId', incidentId)).unique();
  const same = old?.evidenceGeneration === incident.evidenceGeneration && old?.controlRevision === incident.controlRevision;
  if (same && (old.status === 'FAILED' || ['PENDING', 'RUNNING'].includes(old.status))) { await ctx.db.patch(incidentId, { nextAssessmentAt: Date.now() + (old.status === 'FAILED' ? 24 * 60 * 60_000 : POLICY.assessmentIntervalMs) }); return; }
  const data = { incidentId, evidenceGeneration: incident.evidenceGeneration, controlRevision: incident.controlRevision, status: 'PENDING' as const, attempt: 0, runId: (old?.runId ?? 0) + 1, dueAt: Date.now(), leaseUntil: 0 };
  const id = old?._id ?? await ctx.db.insert('assessmentJobs', data); if (old) await ctx.db.patch(id, { ...data, snapshotId: undefined, lastError: undefined });
  await ctx.db.patch(incidentId, { nextAssessmentAt: Date.now() + POLICY.assessmentIntervalMs });
  await ctx.scheduler.runAfter(0, internal.assessments.run, { jobId: id });
}
export const enqueue = internalMutation({ args: { incidentId: v.id('incidents') }, handler: async (ctx, args) => { await queue(ctx, args.incidentId); } });
export const claim = internalMutation({ args: { jobId: v.id('assessmentJobs') }, handler: async (ctx, args) => {
  const job = await ctx.db.get(args.jobId), now = Date.now(); if (!job || job.status !== 'PENDING' || job.dueAt > now) return null;
  const running = await ctx.db.query('assessmentJobs').withIndex('by_status_dueAt', q => q.eq('status', 'RUNNING')).take(3);
  if (running.length >= 2) return null;
  const incident = await ctx.db.get(job.incidentId);
  if (!incident || incident.evidenceGeneration !== job.evidenceGeneration || incident.controlRevision !== job.controlRevision || !['ACTIVE', 'STALE'].includes(incident.lifecycle)) { await ctx.db.patch(job._id, { status: 'SUPERSEDED' }); return null; }
  const day = new Date(now).toISOString().slice(0, 10);
  const usage = await ctx.db.query('providerUsage').withIndex('by_provider_day', q => q.eq('provider', 'JEV').eq('day', day)).unique();
  const raw = Number(process.env.JEV_DAILY_CALL_LIMIT ?? 100); const limit = Number.isSafeInteger(raw) && raw >= 0 ? raw : 100;
  if ((usage?.calls ?? 0) + 2 > limit) { await ctx.db.patch(job._id, { dueAt: now + 15 * 60_000, lastError: 'MODEL_DAILY_LIMIT' }); return null; }
  if (usage) await ctx.db.patch(usage._id, { calls: usage.calls + 2 }); else await ctx.db.insert('providerUsage', { provider: 'JEV', day, calls: 2 });
  const next = { ...job, status: 'RUNNING' as const, runId: job.runId + 1, attempt: job.attempt + 1, leaseUntil: now + 120_000 };
  await ctx.db.patch(job._id, { status: next.status, runId: next.runId, attempt: next.attempt, leaseUntil: next.leaseUntil }); return next;
} });
export const readSnapshot = internalQuery({ args: { snapshotId: v.id('evidenceSnapshots') }, handler: (ctx, args) => ctx.db.get(args.snapshotId) });
export const failed = internalMutation({ args: { jobId: v.id('assessmentJobs'), runId: v.number(), error: v.string() }, handler: async (ctx, args) => {
  const job = await ctx.db.get(args.jobId); if (!job || job.status !== 'RUNNING' || job.runId !== args.runId) return;
  const terminal = ['INVALID_INPUT', 'INVALID_RESPONSE', 'CONFIGURATION'].includes(args.error);
  await ctx.db.patch(job._id, { status: terminal ? 'FAILED' : args.error === 'SUPERSEDED' ? 'SUPERSEDED' : 'PENDING', leaseUntil: 0, lastError: args.error, dueAt: Date.now() + (POLICY.assessmentRetryMs[Math.min(job.attempt - 1, 2)] ?? 15 * 60_000) });
  const incident = await ctx.db.get(job.incidentId); if (incident && incident.evidenceGeneration === job.evidenceGeneration && incident.controlRevision === job.controlRevision) await ctx.db.patch(incident._id, { assessmentStatus: 'ERROR' });
} });
const result = v.object({ model: v.string(), rubric: v.string(), qualification, optionProbability: v.number(), confidence: v.number(), severity, inputTokens: v.number(), outputTokens: v.number(), latencyMs: v.number(), judgmentsJson: v.string() });
export const apply = internalMutation({ args: { jobId: v.id('assessmentJobs'), runId: v.number(), snapshotId: v.id('evidenceSnapshots'), result }, handler: async (ctx, args) => {
  const job = await ctx.db.get(args.jobId); if (!job || job.status !== 'RUNNING' || job.runId !== args.runId) return { outcome: 'STALE_JOB' };
  const snapshot = await ctx.db.get(args.snapshotId), incident = await ctx.db.get(job.incidentId), now = Date.now();
  const stale = !snapshot || !incident || snapshot.incidentId !== incident._id || incident.revision !== snapshot.incidentRevision || incident.evidenceGeneration !== snapshot.evidenceGeneration || incident.controlRevision !== snapshot.controlRevision || job.evidenceGeneration !== snapshot.evidenceGeneration || job.controlRevision !== snapshot.controlRevision || now - snapshot.createdAt > 120_000 || !['ACTIVE', 'STALE'].includes(incident.lifecycle);
  if (stale || !snapshot || !incident) { await ctx.db.patch(job._id, { status: 'SUPERSEDED', leaseUntil: 0 }); return { outcome: 'SUPERSEDED' }; }
  for (const value of [args.result.optionProbability, args.result.confidence]) if (!Number.isFinite(value) || value < 0 || value > 1) throw Error('INVALID_RESULT');
  if (!/^jev-1\.13(?:\.\d+)?$/.test(args.result.model)) throw Error('INVALID_RESULT');
  const bundle = JSON.parse(snapshot.json) as { incident?: { counts?: { recent: number } }; official?: { items?: { noticeId: Id<'officialNotices'>; revision: number; stale: boolean; checkedAt: number; expiresAt: number | null }[] } };
  const observations = await ctx.db.query('observations').withIndex('by_incident_status_observedAt', q => q.eq('incidentId', incident._id).eq('status', 'ACTIVE')).take(501);
  let sourceChanged = observations.length > 500 || !bundle.incident?.counts || witnessSummary(observations, incident.hazard, now).recent !== bundle.incident.counts.recent;
  for (const ref of bundle.official?.items ?? []) { const source = await ctx.db.get(ref.noticeId); if (!source?.active || source.revision !== ref.revision || (ref.expiresAt !== null && ref.expiresAt <= now) || (!ref.stale && now - ref.checkedAt > POLICY.feedStaleMs)) sourceChanged = true; }
  if (sourceChanged) { await ctx.db.patch(job._id, { status: 'SUPERSEDED', leaseUntil: 0 }); await ctx.db.patch(incident._id, { nextAssessmentAt: now }); return { outcome: 'EVIDENCE_CHANGED' }; }
  const suppression = (await ctx.db.query('suppressionRules').withIndex('by_incident', q => q.eq('incidentId', incident._id)).take(33)).some(rule => rule.endsAt > now);
  const accepted = args.result.qualification === 'NOTIFIABLE_EMERGENCY' && args.result.optionProbability >= POLICY.qualificationProbability;
  const normalized = args.result.qualification === 'NOTIFIABLE_EMERGENCY' && !accepted ? 'INSUFFICIENT_EVIDENCE' as const : args.result.qualification;
  const outcome = suppression && accepted ? 'SUPPRESSED' : accepted ? 'QUALIFIED' : normalized;
  await ctx.db.insert('assessments', { incidentId: incident._id, snapshotId: snapshot._id, runId: args.runId, ...args.result, outcome, createdAt: now });
  await ctx.db.patch(job._id, { status: 'DONE', snapshotId: snapshot._id, leaseUntil: 0, lastError: undefined });
  const priorAlert = await ctx.db.query('alerts').withIndex('by_incident', q => q.eq('incidentId', incident._id)).unique();
  const preserve = priorAlert?.lifecycle === 'ACTIVE';
  const rank = ['CRITICAL', 'HIGH', 'MODERATE', 'LOW', 'UNKNOWN'];
  const increased = rank.indexOf(args.result.severity) < rank.indexOf(incident.severity);
  const reduced = rank.indexOf(args.result.severity) > rank.indexOf(incident.severity);
  await ctx.db.patch(incident._id, { assessmentStatus: 'ACCEPTED', qualification: accepted && !suppression ? 'NOTIFIABLE_EMERGENCY' : preserve ? incident.qualification : suppression && accepted ? 'INSUFFICIENT_EVIDENCE' : normalized, severity: preserve && !(accepted && !suppression && increased) ? incident.severity : args.result.severity, lifecycle: accepted && !suppression ? 'ACTIVE' : incident.lifecycle, reviewNeeded: !!incident.reviewNeeded || (preserve && (!accepted || reduced)) || (suppression && accepted), revision: incident.revision + 1, nextAssessmentAt: now + POLICY.assessmentIntervalMs });
  const publication = accepted && !suppression ? await publishCommunity(ctx, incident, args.result.severity) : null;
  return { outcome, publication };
} });
export const run = internalAction({ args: { jobId: v.id('assessmentJobs') }, handler: async (ctx, args): Promise<void> => {
  const job = await ctx.runMutation(internal.assessments.claim, args); if (!job) return;
  try {
    const built = await ctx.runAction(internal.evidence.build, { incidentId: job.incidentId });
    if (!built.snapshotId) { await ctx.runMutation(internal.assessments.failed, { jobId: job._id, runId: job.runId, error: 'SUPERSEDED' }); return; }
    const snapshot = await ctx.runQuery(internal.assessments.readSnapshot, { snapshotId: built.snapshotId }); if (!snapshot) throw new DecisionFailure('INVALID_INPUT');
    const assessed = await assessIncident(JSON.parse(snapshot.json), { apiKey: process.env.OPENCODE_API_KEY });
    const { judgments, ...result } = assessed;
    await ctx.runMutation(internal.assessments.apply, { jobId: job._id, runId: job.runId, snapshotId: snapshot._id, result: { ...result, judgmentsJson: JSON.stringify(judgments) } });
  } catch (error) { await ctx.runMutation(internal.assessments.failed, { jobId: job._id, runId: job.runId, error: error instanceof DecisionFailure ? error.code : 'UNAVAILABLE' }); }
} });
export const resume = internalMutation({ args: {}, handler: async ctx => {
  const now = Date.now();
  for (const lifecycle of ['ACTIVE', 'STALE'] as const) {
    const incidents = await ctx.db.query('incidents').withIndex('by_provenance_lifecycle_assessment', q => q.eq('provenance', 'COMMUNITY').eq('lifecycle', lifecycle).lte('nextAssessmentAt', now)).take(20);
    for (const incident of incidents) await queue(ctx, incident._id);
  }
  for (const status of ['PENDING', 'RUNNING'] as const) {
    const jobs = await ctx.db.query('assessmentJobs').withIndex('by_status_dueAt', q => q.eq('status', status).lte('dueAt', now)).take(20);
    for (const job of jobs) {
      if (status === 'RUNNING' && job.leaseUntil > now) continue;
      if (status === 'RUNNING') await ctx.db.patch(job._id, { status: 'PENDING', leaseUntil: 0 });
      await ctx.scheduler.runAfter(0, internal.assessments.run, { jobId: job._id });
    }
  }
} });

export const status = internalQuery({ args: {}, handler: async ctx => {
  const jobs = await ctx.db.query('assessmentJobs').take(101);
  const latest = await ctx.db.query('assessments').order('desc').take(20);
  return { partial: jobs.length > 100, jobs: jobs.slice(0, 100).map(job => ({ status: job.status, attempt: job.attempt, dueAt: job.dueAt, leaseUntil: job.leaseUntil, lastError: job.lastError ?? null })), latest: latest.map(item => ({ outcome: item.outcome, qualification: item.qualification, optionProbability: item.optionProbability, evaluatedAt: item.createdAt, model: item.model })) };
} });
