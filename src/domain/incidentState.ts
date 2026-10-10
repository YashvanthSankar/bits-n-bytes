import type { HazardCode, IncidentLifecycle, Qualification, Verification } from '../contracts/domain';
import { HAZARD_POLICY, HOUR } from './policy';

export function witnessSummary(observations: readonly { authorId?: string; observedAt: number }[], hazard: HazardCode, now: number) {
  const total = new Set<string>(); const recent = new Set<string>();
  for (const observation of observations) {
    if (!observation.authorId || observation.observedAt > now) continue;
    total.add(observation.authorId);
    if (now - observation.observedAt <= HAZARD_POLICY[hazard].witnessWindowMs) recent.add(observation.authorId);
  }
  return { total: total.size, recent: recent.size };
}
export function currentIncidentState(input: { lifecycle: IncidentLifecycle; verification: Verification; qualification: Qualification | null; lastObservedAt: number; provenance: string; staleAt?: number }, hazard: HazardCode, recentWitnesses: number, now: number) {
  const verification = input.verification === 'AUTHORITY_VERIFIED' ? input.verification : recentWitnesses >= 2 ? 'CORROBORATED' as const : 'UNVERIFIED' as const;
  let lifecycle = input.lifecycle;
  if (['ACTIVE', 'STALE'].includes(lifecycle) && input.qualification !== 'NOTIFIABLE_EMERGENCY' && input.provenance === 'COMMUNITY') {
    const age = now - input.lastObservedAt;
    lifecycle = age > 48 * HOUR ? 'EXPIRED' : age > HAZARD_POLICY[hazard].staleAfterMs ? 'STALE' : 'ACTIVE';
  }
  if (['ACTIVE', 'STALE'].includes(lifecycle) && input.qualification !== 'NOTIFIABLE_EMERGENCY' && input.provenance === 'AUTHORITY' && input.staleAt !== undefined) lifecycle = now > input.staleAt ? 'STALE' : 'ACTIVE';
  return { verification, lifecycle };
}
