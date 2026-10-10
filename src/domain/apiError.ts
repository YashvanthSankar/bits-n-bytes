import { ConvexError } from 'convex/values';
import { ERROR_CODES, type ErrorCode } from '../contracts/errors';

export function apiErrorCode(error: unknown): ErrorCode | null {
  if (!(error instanceof ConvexError)) return null;
  const value: unknown = error.data;
  if (!value || typeof value !== 'object' || !('code' in value) || typeof value.code !== 'string') return null;
  return ERROR_CODES.includes(value.code as ErrorCode) ? value.code as ErrorCode : null;
}
export function errorTranslationKey(error: unknown): string {
  switch (apiErrorCode(error)) {
    case 'LOCATION_REQUIRED': case 'LOCATION_STALE': return 'locationAction';
    case 'LOCATION_INACCURATE': case 'LOCATION_INVALID': return 'inaccurateLocation';
    case 'OUTSIDE_INDIA': return 'outsideIndia';
    case 'COUNTRY_UNCERTAIN': return 'uncertainLocation';
    case 'REVISION_CONFLICT': return 'conflictError';
    case 'RATE_LIMITED': return 'rateLimitError';
    case 'INVALID_INPUT': return 'inputError';
    case 'INCIDENT_CLOSED': return 'incidentClosed';
    case 'OBSERVATION_TOO_FAR': return 'observationTooFar';
    default: return 'serviceUnavailable';
  }
}
export function apiRetryAfterMs(error: unknown): number | null {
  if (!(error instanceof ConvexError) || !error.data || typeof error.data !== 'object' || !('retryAfterMs' in error.data)) return null;
  const value = error.data.retryAfterMs;
  return typeof value === 'number' && Number.isFinite(value) && value > 0 ? value : null;
}
