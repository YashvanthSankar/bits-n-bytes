import { sha256 } from '@noble/hashes/sha2.js';
import { bytesToHex } from '@noble/hashes/utils.js';
import type { MutationCtx } from '../_generated/server';
import type { Id } from '../_generated/dataModel';
import { reject } from './errors';

function canonical(value: unknown): string {
  if (Array.isArray(value)) return '[' + value.map(canonical).join(',') + ']';
  if (value !== null && typeof value === 'object') return '{' + Object.entries(value).filter(([,v]) => v !== undefined).sort(([a], [b]) => a.localeCompare(b)).map(([k,v]) => JSON.stringify(k) + ':' + canonical(v)).join(',') + '}';
  return JSON.stringify(value) ?? 'null';
}
export function payloadHash(value: unknown) { return bytesToHex(sha256(new TextEncoder().encode(canonical(value)))); }
export async function command<T>(ctx: MutationCtx, userId: Id<'users'>, kind: string, requestId: string, payload: unknown, apply: () => Promise<T>): Promise<T> {
  if (!/^[a-zA-Z0-9_-]{8,120}$/.test(requestId)) return reject('INVALID_INPUT');
  const hash = payloadHash(payload);
  const previous = await ctx.db.query('commandKeys').withIndex('by_user_kind_key', q => q.eq('userId', userId).eq('commandKind', kind).eq('clientRequestId', requestId)).unique();
  if (previous) {
    if (previous.payloadHash !== hash) return reject('COMMAND_KEY_REUSED');
    return previous.result as T;
  }
  const result = await apply();
  await ctx.db.insert('commandKeys', { userId, commandKind: kind, clientRequestId: requestId, payloadHash: hash, result, createdAt: Date.now() });
  return result;
}
