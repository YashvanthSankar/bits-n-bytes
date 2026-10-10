import { describe, expect, it } from 'vitest';
import { HAZARD_CODES } from '../src/contracts/domain';
import { isRecentObservation, qualifiesAutomatically, validateFix, validateIndiaFix } from '../src/domain/eligibility';
import { HAZARD_POLICY, HOUR, MINUTE, POLICY } from '../src/domain/policy';

const now = Date.UTC(2026, 9, 10, 2);
const fix = { point: { latitude: 12.82, longitude: 80.04 }, observedAt: now, accuracyM: 20 };

describe('location admission and targeting boundaries', () => {
  it('accepts exactly the configured age and accuracy limits', () => {
    expect(validateFix({ ...fix, observedAt: now - 5 * MINUTE, accuracyM: 200 }, now, POLICY.entryFix).ok).toBe(true);
  });
  it('rejects a fix just beyond the time boundary', () => {
    expect(validateFix({ ...fix, observedAt: now - 5 * MINUTE - 1 }, now, POLICY.entryFix)).toMatchObject({ error: { code: 'LOCATION_STALE' } });
  });
  it('rejects a fix just beyond the accuracy boundary', () => {
    expect(validateFix({ ...fix, accuracyM: 201 }, now, POLICY.entryFix)).toMatchObject({ error: { code: 'LOCATION_INACCURATE' } });
  });
  it.each([NaN, Infinity, -1])('rejects invalid accuracy %s', (accuracyM) => {
    expect(validateFix({ ...fix, accuracyM }, now, POLICY.entryFix)).toMatchObject({ error: { code: 'LOCATION_INVALID' } });
  });
  it('does not let upload time disguise a 45-minute-old fix', () => {
    expect(validateFix({ ...fix, observedAt: now - 45 * MINUTE }, now, POLICY.alertFix).ok).toBe(false);
  });
  it('rejects future timestamps and invalid coordinates', () => {
    expect(validateFix({ ...fix, observedAt: now + 1 }, now, POLICY.entryFix).ok).toBe(false);
    expect(validateFix({ ...fix, point: { latitude: 91, longitude: 80 } }, now, POLICY.entryFix).ok).toBe(false);
  });
  it('requires certainty inside India', () => {
    expect(validateIndiaFix(fix, 'INSIDE_INDIA', now).ok).toBe(true);
    expect(validateIndiaFix(fix, 'OUTSIDE_INDIA', now)).toMatchObject({ error: { code: 'OUTSIDE_INDIA' } });
    expect(validateIndiaFix(fix, 'UNCERTAIN', now)).toMatchObject({ error: { code: 'COUNTRY_UNCERTAIN' } });
  });
});

describe('evidence qualification', () => {
  const assessment = { choice: 'NOTIFIABLE_EMERGENCY' as const, optionProbability: 0.9, confidence: 0.1, evidenceGeneration: 1, controlRevision: 1, policyVersion: POLICY.version };
  it('uses selected-option probability, not overall confidence', () => {
    expect(qualifiesAutomatically(assessment)).toBe(true);
    expect(qualifiesAutomatically({ ...assessment, optionProbability: 0.899, confidence: 1 })).toBe(false);
  });
  it.each(['NOT_QUALIFIED', 'INSUFFICIENT_EVIDENCE'] as const)('never qualifies %s', (choice) => {
    expect(qualifiesAutomatically({ ...assessment, choice, optionProbability: 1 })).toBe(false);
  });
  it.each([NaN, Infinity, -0.1, 1.1])('rejects invalid probability %s', (optionProbability) => {
    expect(qualifiesAutomatically({ ...assessment, optionProbability })).toBe(false);
  });
  it('does not treat an old observation or future observation as fresh', () => {
    expect(isRecentObservation(now - HOUR, now, HOUR)).toBe(true);
    expect(isRecentObservation(now - HOUR - 1, now, HOUR)).toBe(false);
    expect(isRecentObservation(now + 1, now, HOUR)).toBe(false);
  });
  it('contains all eight required hazard presets and distinct cyclone/landslide radii', () => {
    expect(Object.keys(HAZARD_POLICY)).toEqual([...HAZARD_CODES]);
    expect(HAZARD_POLICY.CYCLONE.radiusM).toBe(25_000);
    expect(HAZARD_POLICY.LANDSLIDE.radiusM).toBe(1_000);
  });
});
