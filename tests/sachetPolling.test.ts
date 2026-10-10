import { afterEach, expect, it, vi } from 'vitest';
import { convexTest } from 'convex-test';
import schema from '../convex/schema';
import { internal } from '../convex/_generated/api';
import { POLICY, MINUTE } from '../src/domain/policy';
const modules = import.meta.glob('../convex/**/*.ts');
afterEach(() => vi.useRealTimers());
it('does not re-fetch an accepted feed document before the 30-minute interval', async () => {
  vi.useFakeTimers(); vi.setSystemTime(new Date('2026-10-10T13:00:00Z'));
  const t = convexTest(schema, modules);
  await t.mutation(internal.sachet.prepare, {});
  const [doc] = await t.mutation(internal.sachet.claim, {});
  await t.mutation(internal.sachet.accept, { id: doc!._id, generation: doc!.generation, xml: '<rss><channel><title>Test feed</title></channel></rss>' });
  const saved = await t.run(ctx => ctx.db.get(doc!._id));
  expect(saved?.nextPollAt).toBe(Date.now() + 30 * MINUTE);
  vi.setSystemTime(Date.now() + 29 * MINUTE);
  expect(await t.mutation(internal.sachet.claim, {})).toHaveLength(0);
  vi.setSystemTime(Date.now() + MINUTE);
  expect(await t.mutation(internal.sachet.claim, {})).toHaveLength(1);
});
it('backs failed feed fetches off for at least 30 minutes', async () => {
  const t = convexTest(schema, modules);
  await t.mutation(internal.sachet.prepare, {});
  const [doc] = await t.mutation(internal.sachet.claim, {});
  const before = Date.now();
  await t.mutation(internal.sachet.fail, { id: doc!._id, generation: doc!.generation, error: 'SACHET_FETCH_FAILED' });
  const saved = await t.run(ctx => ctx.db.get(doc!._id));
  expect(saved!.nextPollAt).toBeGreaterThanOrEqual(before + POLICY.feedIntervalMs);
});
