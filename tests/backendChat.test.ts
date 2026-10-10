/// <reference types="vite/client" />
import { beforeEach, afterEach, expect, it, vi } from 'vitest';
import { convexTest, type TestConvex } from 'convex-test';
import schema from '../convex/schema';
import { api, internal } from '../convex/_generated/api';
import type { Id } from '../convex/_generated/dataModel';
import { DAY, MINUTE } from '../src/domain/policy';
const modules = import.meta.glob('../convex/**/*.ts');
let t: TestConvex<typeof schema>, a: Id<'users'>, b: Id<'users'>;
const point = { latitude: 13.0827, longitude: 80.2707 };
const actor = (id: Id<'users'>) => t.withIdentity({ subject: `${id}|session` });
const input = (body = 'Hello nearby', requestId = 'chat-send-00001') => ({ body, requestId });
const read = (id = b) => actor(id).query(api.chat.nearby, { refreshKey: 0 });
let sequence = 0;
async function locate(id: Id<'users'>, longitude = point.longitude, accuracyM = 20, ageMs = 0) {
  await actor(id).mutation(api.locations.update, { requestId: `location-chat-${++sequence}`, fix: { point: { ...point, longitude }, accuracyM, observedAt: Date.now() - ageMs }, foregroundPermission: 'granted', backgroundPermission: 'denied', source: 'FOREGROUND' });
}
beforeEach(async () => {
  vi.useFakeTimers(); vi.setSystemTime(new Date('2026-10-10T10:00:00Z'));
  t = convexTest(schema, modules);
  [a, b] = await t.run(async ctx => [await ctx.db.insert('users', {}), await ctx.db.insert('users', {})]);
  for (const id of [a, b]) {
    await locate(id);
    await actor(id).mutation(api.profiles.save, { requestId: `profile-chat-${++sequence}`, expectedRevision: 0, name: 'Private Person', language: 'en', stepFreeNeeded: false });
  }
});
afterEach(() => vi.useRealTimers());
it('delivers chronologically within 15 km using only public aliases and idempotent receipts', async () => {
  const receipt = await actor(a).mutation(api.chat.send, input());
  expect(await actor(a).mutation(api.chat.send, input())).toEqual(receipt);
  await actor(b).mutation(api.chat.send, input('Hi!', 'chat-send-00002'));
  const result = await read();
  expect(result.items.map(m => m.body)).toEqual(['Hello nearby', 'Hi!']);
  expect(result.items.map(m => m.own)).toEqual([false, true]);
  expect(Object.keys(result.items[0]!).sort()).toEqual(['alias','body','createdAt','expiresAt','id','own']);
  expect(JSON.stringify(result)).not.toContain('Private Person');
  await expect(actor(a).mutation(api.chat.send, input('Different'))).rejects.toThrow('COMMAND_KEY_REUSED');
});
it('uses immutable origin across sender movement, exact radius and cell boundaries', async () => {
  await locate(a, 80.156); await actor(a).mutation(api.chat.send, input());
  expect((await read()).items).toHaveLength(1);
  await locate(a, 80.0); // Sender movement cannot move an existing message.
  expect((await read()).items).toHaveLength(1);
  await locate(b, 80.0); expect((await read()).items).toHaveLength(0);
});
it('requires authenticated fresh precise India access and rejects identity selection', async () => {
  await expect(t.query(api.chat.nearby, { refreshKey: 0 })).rejects.toThrow('AUTH_REQUIRED');
  await expect(t.mutation(api.chat.send, input())).rejects.toThrow('AUTH_REQUIRED');
  await expect(actor(a).mutation(api.chat.send, { ...input(), userId: b } as never)).rejects.toThrow();
  vi.setSystemTime(Date.now() + 6 * MINUTE);
  expect((await read()).needsLocation).toBe(true);
  await expect(actor(a).mutation(api.chat.send, input())).rejects.toThrow('LOCATION_STALE');
  await locate(a, point.longitude, 501);
  await expect(actor(a).mutation(api.chat.send, input())).rejects.toThrow('LOCATION_INACCURATE');
  await locate(a, point.longitude, 500);
  await actor(a).mutation(api.chat.send, input());
});
it('rejects empty/overlong text, limits bursts transactionally and never creates incident evidence', async () => {
  for (const body of ['   ', 'a'.repeat(501)]) await expect(actor(a).mutation(api.chat.send, input(body))).rejects.toThrow('INVALID_INPUT');
  for (let i = 0; i < 5; i++) await actor(a).mutation(api.chat.send, input(`Hi ${i}`, `chat-burst-0000${i}`));
  await expect(actor(a).mutation(api.chat.send, input('Sixth', 'chat-burst-00006'))).rejects.toThrow('RATE_LIMITED');
  expect(await t.run(ctx => ctx.db.query('observations').collect())).toHaveLength(0);
  expect(await t.run(ctx => ctx.db.query('assessmentJobs').collect())).toHaveLength(0);
});
it('omits expired messages before cleanup and physically deletes their private origins', async () => {
  await actor(a).mutation(api.chat.send, input());
  vi.setSystemTime(Date.now() + DAY); await locate(b);
  expect((await read()).items).toHaveLength(0);
  expect(await t.mutation(internal.chat.cleanup, {})).toEqual({ removed: 1 });
  expect(await t.run(ctx => ctx.db.query('chatMessages').collect())).toHaveLength(0);
});

it('enforces the hourly limit independently of the burst limit', async () => {
  for (let batch = 0; batch < 6; batch++) {
    for (let i = 0; i < 5; i++) await actor(a).mutation(api.chat.send, input('Hello', `hourly-chat-${batch}-${i}`));
    vi.setSystemTime(Date.now() + 61_000); await locate(a);
  }
  await expect(actor(a).mutation(api.chat.send, input('Too many', 'hourly-chat-final'))).rejects.toThrow('RATE_LIMITED');
});
it('blocks delivery and sending after permission revocation or leaving India', async () => {
  await actor(a).mutation(api.chat.send, input());
  await t.run(async ctx => {
    const location = await ctx.db.query('locations').withIndex('by_user', q => q.eq('userId', b)).unique();
    await ctx.db.patch(location!._id, { foregroundPermission: 'denied' });
  });
  await expect(read()).rejects.toThrow('LOCATION_REQUIRED');
  await locate(a, 80.6);
  await expect(read(a)).rejects.toThrow('OUTSIDE_INDIA');
  await expect(actor(a).mutation(api.chat.send, input('No', 'outside-chat-001'))).rejects.toThrow('OUTSIDE_INDIA');
});
