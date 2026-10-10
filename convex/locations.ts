import { mutation, query } from './_generated/server';
import { v } from 'convex/values';
import geohash from 'ngeohash';
import { requireUser } from './lib/authorization';
import { fix, permission } from './lib/validators';
import { countryStatus } from '../src/domain/geography';
import { validateFix } from '../src/domain/eligibility';
import { POLICY } from '../src/domain/policy';
import { command } from './lib/idempotency';
import { reject } from './lib/errors';

export const me = query({ args: {}, handler: async ctx => {
  const userId = await requireUser(ctx);
  const location = await ctx.db.query('locations').withIndex('by_user', q => q.eq('userId', userId)).unique();
  return location ? { point: location.point, observedAt: location.observedAt, accuracyM: location.accuracyM, countryStatus: location.countryStatus, foregroundPermission: location.foregroundPermission, backgroundPermission: location.backgroundPermission, revision: location.revision } : null;
} });
export const update = mutation({ args: { requestId: v.string(), fix, foregroundPermission: permission, backgroundPermission: permission, source: v.union(v.literal('FOREGROUND'), v.literal('BACKGROUND')) }, handler: async (ctx, args) => {
  const userId = await requireUser(ctx);
  return command(ctx, userId, 'LOCATION_UPDATE', args.requestId, args, async () => {
    const now = Date.now();
    const result = validateFix(args.fix, now, { maxAgeMs: POLICY.alertFix.maxAgeMs, maxAccuracyM: 10_000 });
    if (!result.ok) return reject(result.error.code);
    const current = await ctx.db.query('locations').withIndex('by_user', q => q.eq('userId', userId)).unique();
    if (current && args.fix.observedAt < current.observedAt) return reject('REVISION_CONFLICT', { currentRevision: current.revision });
    const country = countryStatus(args.fix);
    const entry = country === 'INSIDE_INDIA' && args.foregroundPermission === 'granted' && validateFix(args.fix, now, POLICY.entryFix).ok;
    const revision = (current?.revision ?? 0) + 1;
    const admittedAt = entry ? now : current?.admittedAt;
    const record = { userId, ...args.fix, countryStatus: country, foregroundPermission: args.foregroundPermission, backgroundPermission: args.backgroundPermission, source: args.source, receivedAt: now, ...(admittedAt === undefined ? {} : { admittedAt }), revision };
    if (current) await ctx.db.patch(current._id, record); else await ctx.db.insert('locations', record);
    const old = await ctx.db.query('geoPoints').withIndex('by_kind_entity', q => q.eq('kind', 'USER').eq('entityId', userId)).take(3);
    for (const item of old) await ctx.db.delete(item._id);
    if (country === 'INSIDE_INDIA' && args.foregroundPermission === 'granted' && args.fix.accuracyM <= POLICY.alertFix.maxAccuracyM) {
      for (const precision of [4, 5]) await ctx.db.insert('geoPoints', { kind: 'USER', entityId: userId, precision, cell: geohash.encode(args.fix.point.latitude, args.fix.point.longitude, precision), point: args.fix.point, active: true, observedAt: args.fix.observedAt });
    }
    return { revision, countryStatus: country, admitted: entry };
  });
} });
