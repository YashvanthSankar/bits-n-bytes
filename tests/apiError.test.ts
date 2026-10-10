import { expect, it } from 'vitest';
import { ConvexError } from 'convex/values';
import { apiErrorCode, apiRetryAfterMs, errorTranslationKey } from '../src/domain/apiError';
it('does not display provider diagnostics or unknown payloads', () => {
  for (const error of [new Error('sensitive provider URL'), new ConvexError('sensitive diagnostic'), new ConvexError({ code: 'UNEXPECTED_PROVIDER_TEXT', token: 'private' })]) {
    expect(apiErrorCode(error)).toBeNull(); expect(errorTranslationKey(error)).toBe('serviceUnavailable');
  }
});
it('exposes bounded retry timing without rendering provider details',()=>{
  expect(apiRetryAfterMs(new ConvexError({code:'RATE_LIMITED',retryAfterMs:600_000}))).toBe(600_000);
  for(const value of [-1,0,'600000',Infinity]) expect(apiRetryAfterMs(new ConvexError({code:'RATE_LIMITED',retryAfterMs:value}))).toBeNull();
  expect(errorTranslationKey(new ConvexError({code:'OBSERVATION_TOO_FAR'}))).toBe('observationTooFar');
  expect(errorTranslationKey(new ConvexError({code:'INCIDENT_CLOSED'}))).toBe('incidentClosed');
});
it('distinguishes country denial, uncertain boundary and stale writes', () => {
  expect(errorTranslationKey(new ConvexError({ code: 'OUTSIDE_INDIA' }))).toBe('outsideIndia');
  expect(errorTranslationKey(new ConvexError({ code: 'COUNTRY_UNCERTAIN' }))).toBe('uncertainLocation');
  expect(errorTranslationKey(new ConvexError({ code: 'REVISION_CONFLICT', currentRevision: 3 }))).toBe('conflictError');
});
