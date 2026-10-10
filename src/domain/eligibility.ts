import type { ChoiceAssessment, CountryStatus, LocationFix, Point } from '../contracts/domain';
import { failure, type Result } from '../contracts/errors';
import { POLICY } from './policy';

export function isValidPoint(point: Point): boolean {
  return Number.isFinite(point.latitude) && Number.isFinite(point.longitude)
    && Math.abs(point.latitude) <= 90 && Math.abs(point.longitude) <= 180;
}

export function validateFix(
  fix: LocationFix | null,
  now: number,
  requirements: { maxAgeMs: number; maxAccuracyM: number },
): Result<LocationFix> {
  if (!fix) return failure('LOCATION_REQUIRED');
  if (!isValidPoint(fix.point) || !Number.isFinite(fix.observedAt)
    || !Number.isFinite(fix.accuracyM) || fix.accuracyM < 0
    || !Number.isFinite(now) || fix.observedAt > now) return failure('LOCATION_INVALID');
  if (now - fix.observedAt > requirements.maxAgeMs) return failure('LOCATION_STALE');
  if (fix.accuracyM > requirements.maxAccuracyM) return failure('LOCATION_INACCURATE');
  return { ok: true, value: fix };
}

export function validateIndiaFix(
  fix: LocationFix | null, country: CountryStatus, now: number,
  requirements: { maxAgeMs: number; maxAccuracyM: number } = POLICY.entryFix,
): Result<LocationFix> {
  const result = validateFix(fix, now, requirements);
  if (!result.ok) return result;
  if (country === 'OUTSIDE_INDIA') return failure('OUTSIDE_INDIA');
  if (country === 'UNCERTAIN') return failure('COUNTRY_UNCERTAIN');
  return result;
}

/** Qualification is independent of verification and never ends an existing emergency. */
export function qualifiesAutomatically(assessment: ChoiceAssessment): boolean {
  return assessment.choice === 'NOTIFIABLE_EMERGENCY'
    && Number.isFinite(assessment.optionProbability)
    && assessment.optionProbability >= POLICY.qualificationProbability
    && assessment.optionProbability <= 1;
}

export function isRecentObservation(observedAt: number, now: number, windowMs: number): boolean {
  return Number.isFinite(observedAt) && Number.isFinite(now)
    && observedAt <= now && now - observedAt <= windowMs;
}
