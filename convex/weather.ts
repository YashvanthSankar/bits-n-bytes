import { v, type Infer } from 'convex/values';
import { internalAction, internalMutation } from './_generated/server';
import { internal } from './_generated/api';
import { point } from './lib/validators';
import { weatherData } from './lib/weatherValidators';
import { fetchConditions, resolveWeatherLocation, WeatherFailure } from './providers/accuWeather';
import { isValidPoint } from '../src/domain/eligibility';

export const claim = internalMutation({ args: { point }, handler: async (ctx, args) => {
  if (!isValidPoint(args.point)) throw Error('INVALID_INPUT');
  const now = Date.now(), key = `${args.point.latitude.toFixed(2)},${args.point.longitude.toFixed(2)}`;
  const previous = await ctx.db.query('weatherCache').withIndex('by_key', q => q.eq('key', key)).unique();
  const cache = previous?.expiresAt && previous.expiresAt > now && previous.data ? { ...previous.data, fetchedAt: previous.fetchedAt!, stale: now - previous.data.current.observedAt > 30 * 60_000 } : null;
  if (cache && now - cache.fetchedAt < 10 * 60_000) return { status: 'CACHED' as const, cache };
  if (previous && (previous.leaseUntil > now || previous.nextAttemptAt > now)) return { status: 'WAITING' as const, cache };
  const day = new Date(now).toISOString().slice(0, 10);
  const usage = await ctx.db.query('providerUsage').withIndex('by_provider_day', q => q.eq('provider', 'ACCUWEATHER').eq('day', day)).unique();
  const configured = Number(process.env.ACCUWEATHER_DAILY_CALL_LIMIT ?? '100');
  const ceiling = Number.isSafeInteger(configured) && configured >= 0 ? configured : 100;
  if ((usage?.calls ?? 0) + 3 > ceiling) return { status: 'QUOTA' as const, cache };
  if (usage) await ctx.db.patch(usage._id, { calls: usage.calls + 3 }); else await ctx.db.insert('providerUsage', { provider: 'ACCUWEATHER', day, calls: 3 });
  const generation = (previous?.generation ?? 0) + 1;
  const id = previous?._id ?? await ctx.db.insert('weatherCache', { key, requestedPoint: args.point, generation, leaseUntil: now + 60_000, expiresAt: now + 60 * 60_000, nextAttemptAt: now });
  if (previous) await ctx.db.patch(id, { generation, leaseUntil: now + 60_000 });
  return { status: 'CLAIMED' as const, id, generation, cache };
} });
export const finish = internalMutation({ args: { id: v.id('weatherCache'), generation: v.number(), data: v.optional(weatherData), error: v.optional(v.string()), retryAfterMs: v.optional(v.number()) }, handler: async (ctx, args) => {
  const cache = await ctx.db.get(args.id); if (!cache || cache.generation !== args.generation || !cache.leaseUntil) return false;
  const now = Date.now();
  if (args.data) await ctx.db.patch(cache._id, { data: args.data, fetchedAt: now, expiresAt: now + 60 * 60_000, leaseUntil: 0, lastError: undefined, nextAttemptAt: now + 10 * 60_000 });
  else await ctx.db.patch(cache._id, { leaseUntil: 0, lastError: args.error ?? 'UNAVAILABLE', nextAttemptAt: now + Math.min(3_600_000, Math.max(60_000, args.retryAfterMs ?? 60_000)) });
  return true;
} });
export type WeatherContext = { availability: string; data: (Infer<typeof weatherData> & { fetchedAt: number; stale: boolean }) | null };
export const context = internalAction({ args: { point }, handler: async (ctx, args): Promise<WeatherContext> => {
  const claim = await ctx.runMutation(internal.weather.claim, args);
  if (claim.status !== 'CLAIMED') return { availability: claim.status, data: claim.cache };
  try {
    const options = { apiKey: process.env.ACCUWEATHER_KEY };
    const location = await resolveWeatherLocation(args.point, options);
    const conditions = await fetchConditions(location.locationKey, options);
    const data = { ...location, ...conditions };
    const accepted = await ctx.runMutation(internal.weather.finish, { id: claim.id, generation: claim.generation, data });
    return accepted ? { availability: 'AVAILABLE', data: { ...data, fetchedAt: Date.now(), stale: Date.now() - data.current.observedAt > 30 * 60_000 } } : { availability: 'SUPERSEDED', data: null };
  } catch (error) {
    const failure = error instanceof WeatherFailure ? error : new WeatherFailure('UNAVAILABLE');
    await ctx.runMutation(internal.weather.finish, { id: claim.id, generation: claim.generation, error: failure.code, retryAfterMs: failure.retryAfterMs });
    return { availability: failure.code, data: claim.cache };
  }
} });
export const cleanup = internalMutation({ args: {}, handler: async ctx => {
  const rows = await ctx.db.query('weatherCache').withIndex('by_expiresAt', q => q.lte('expiresAt', Date.now())).take(100);
  for (const row of rows) if (row.leaseUntil <= Date.now()) await ctx.db.delete(row._id);
} });
