export const ERROR_CODES = [
  'AUTH_REQUIRED', 'AUTHORITY_REQUIRED', 'JURISDICTION_DENIED', 'LOCATION_REQUIRED',
  'LOCATION_STALE', 'LOCATION_INACCURATE', 'LOCATION_INVALID', 'OUTSIDE_INDIA',
  'COUNTRY_UNCERTAIN', 'INVALID_INPUT', 'REVISION_CONFLICT', 'RATE_LIMITED',
  'NOT_FOUND', 'INCIDENT_CLOSED', 'OBSERVATION_TOO_FAR', 'PROVIDER_UNAVAILABLE', 'CONFIGURATION_REQUIRED', 'COMMAND_KEY_REUSED',
] as const;
export type ErrorCode = (typeof ERROR_CODES)[number];
export interface DomainError { code: ErrorCode; retryAfterMs?: number }
export type Result<T> = { ok: true; value: T } | { ok: false; error: DomainError };

export function failure(code: ErrorCode): { ok: false; error: DomainError } {
  return { ok: false, error: { code } };
}
