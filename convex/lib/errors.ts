import { ConvexError } from 'convex/values';
import type { ErrorCode } from '../../src/contracts/errors';

export function reject(code: ErrorCode, details: { retryAfterMs?: number; currentRevision?: number } = {}): never {
  throw new ConvexError({ code, ...details });
}
