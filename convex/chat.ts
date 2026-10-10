import geohash from 'ngeohash';
import { v } from 'convex/values';
import { internalMutation, mutation, query } from './_generated/server';
import { requireEligibleFix, requireIndiaAccess } from './lib/authorization';
import { command } from './lib/idempotency';
import { reject } from './lib/errors';
import { validateFix } from '../src/domain/eligibility';
import { distanceM } from '../src/domain/geography';
import { HOUR, MINUTE, POLICY } from '../src/domain/policy';

/** Coordinates and authenticated identity remain private; chat never creates incident evidence. */
export const nearby = query({ args: { refreshKey: v.number() }, handler: async (ctx) => {
  const { userId, location } = await requireIndiaAccess(ctx);
  const now = Date.now();
  if (!validateFix(location, now, POLICY.chatFix).ok) return { items: [], needsLocation: true, truncated: false, serverTime: now };
  const cell = geohash.encode(location.point.latitude, location.point.longitude, 3);
  const groups = await Promise.all([cell, ...geohash.neighbors(cell)].map(cell => ctx.db.query('chatMessages')
    .withIndex('by_cell_createdAt', q => q.eq('cell', cell).gt('createdAt', now - POLICY.chatLifetimeMs)).order('desc').take(101)));
  const eligible = groups.flat().filter(message => message.expiresAt > now && distanceM(message.origin, location.point) <= POLICY.chatRadiusM)
    .sort((a, b) => b.createdAt - a.createdAt || b._creationTime - a._creationTime);
  return { items: eligible.slice(0, 100).reverse().map(message => ({ id: message._id, body: message.body, alias: message.alias,
    createdAt: message.createdAt, expiresAt: message.expiresAt, own: message.userId === userId })), needsLocation: false,
    truncated: eligible.length > 100 || groups.some(group => group.length === 101), serverTime: now };
} });

export const send = mutation({ args: { body: v.string(), requestId: v.string() }, handler: async (ctx, args) => {
  const { userId, location } = await requireEligibleFix(ctx, POLICY.chatFix);
  const body = args.body.trim();
  if (!body || [...body].length > POLICY.chatMaxCharacters || /[\u0000-\u0008\u000b\u000c\u000e-\u001f]/.test(body)) return reject('INVALID_INPUT');
  const profile = await ctx.db.query('profiles').withIndex('by_user', q => q.eq('userId', userId)).unique();
  if (!profile) return reject('AUTH_REQUIRED');
  return command(ctx, userId, 'chat.send', args.requestId, { body }, async () => {
    const now = Date.now();
    const recent = await ctx.db.query('chatMessages').withIndex('by_user_createdAt', q => q.eq('userId', userId).gt('createdAt', now - HOUR)).order('desc').take(POLICY.chatHourlyLimit);
    const minute = recent.filter(message => message.createdAt > now - MINUTE);
    if (minute.length >= POLICY.chatMinuteLimit) return reject('RATE_LIMITED', { retryAfterMs: MINUTE - (now - minute[minute.length - 1]!.createdAt) });
    if (recent.length >= POLICY.chatHourlyLimit) return reject('RATE_LIMITED', { retryAfterMs: HOUR - (now - recent[recent.length - 1]!.createdAt) });
    const messageId = await ctx.db.insert('chatMessages', { userId, alias: profile.alias, body, origin: location.point,
      cell: geohash.encode(location.point.latitude, location.point.longitude, 3), createdAt: now, expiresAt: now + POLICY.chatLifetimeMs });
    return { messageId };
  });
} });

export const cleanup = internalMutation({ args: {}, handler: async ctx => {
  const expired = await ctx.db.query('chatMessages').withIndex('by_expiresAt', q => q.lte('expiresAt', Date.now())).take(500);
  for (const message of expired) await ctx.db.delete(message._id);
  return { removed: expired.length };
} });
