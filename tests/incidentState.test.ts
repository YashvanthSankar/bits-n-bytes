import { expect, it } from 'vitest';
import { currentIncidentState, witnessSummary } from '../src/domain/incidentState';
import { HAZARD_POLICY, HOUR } from '../src/domain/policy';
import { HAZARD_CODES } from '../src/contracts/domain';
const now = 100 * HOUR;
const base = { lifecycle: 'ACTIVE' as const, verification: 'UNVERIFIED' as const, qualification: null, lastObservedAt: now - 3 * HOUR, provenance: 'COMMUNITY' };
it('deduplicates identities while separating historical and recent evidence', () => {
  const result = witnessSummary([{authorId:'a',observedAt:now-30_000},{authorId:'a',observedAt:now-10_000},{authorId:'b',observedAt:now-2*HOUR},{observedAt:now},{authorId:'c',observedAt:now+1}], 'FLASH_FLOOD',now);
  expect(result).toEqual({total:2,recent:1});
});
it('ages verification separately from emergency qualification and source attribution', () => {
  expect(currentIncidentState({...base,qualification:'NOTIFIABLE_EMERGENCY'},'FLASH_FLOOD',0,now)).toEqual({verification:'UNVERIFIED',lifecycle:'ACTIVE'});
  expect(currentIncidentState({...base,verification:'AUTHORITY_VERIFIED',provenance:'AUTHORITY',staleAt:now-1},'FLASH_FLOOD',0,now)).toEqual({verification:'AUTHORITY_VERIFIED',lifecycle:'STALE'});
});
it('stale and expired community reports never become a safe/all-clear state', () => {
  expect(currentIncidentState(base,'FLASH_FLOOD',0,now).lifecycle).toBe('STALE');
  expect(currentIncidentState({...base,lastObservedAt:now-49*HOUR},'FLASH_FLOOD',0,now).lifecycle).toBe('EXPIRED');
  expect(currentIncidentState({...base,lifecycle:'RESOLVED'},'FLASH_FLOOD',2,now).lifecycle).toBe('RESOLVED');
});
it.each(HAZARD_CODES)('%s retains the exact recent/stale boundary and ages just after it', hazard => {
  const policy = HAZARD_POLICY[hazard];
  expect(witnessSummary([{authorId:'a',observedAt:now-policy.witnessWindowMs}],hazard,now).recent).toBe(1);
  expect(witnessSummary([{authorId:'a',observedAt:now-policy.witnessWindowMs-1}],hazard,now).recent).toBe(0);
  expect(currentIncidentState({...base,lastObservedAt:now-policy.staleAfterMs},hazard,1,now).lifecycle).toBe('ACTIVE');
  expect(currentIncidentState({...base,lastObservedAt:now-policy.staleAfterMs-1},hazard,1,now).lifecycle).toBe('STALE');
});
