import { beforeEach, expect, it, vi } from 'vitest';
const storage = vi.hoisted(() => ({ getItem: vi.fn(), setItem: vi.fn() }));
vi.mock('../src/services/preferences', () => ({ preferenceStorage: storage }));
import { hasCompletedSetup, rememberCompletedSetup } from '../src/services/onboarding';
beforeEach(() => { vi.clearAllMocks(); });
it('persists only a completion flag that survives a new read', async () => {
  let saved: string | null = null;
  storage.getItem.mockImplementation(async () => saved);
  storage.setItem.mockImplementation(async (_key: string, value: string) => { saved = value; });
  expect(await hasCompletedSetup()).toBe(false);
  await rememberCompletedSetup(); expect(await hasCompletedSetup()).toBe(true);
  expect(storage.setItem).toHaveBeenCalledExactlyOnceWith('gudtour.setup-completed.v1', '1');
});
it('handles unavailable preference storage without blocking profile completion', async () => {
  storage.getItem.mockRejectedValue(Error('unavailable')); storage.setItem.mockRejectedValue(Error('unavailable'));
  expect(await hasCompletedSetup()).toBe(false); await expect(rememberCompletedSetup()).resolves.toBeUndefined();
});
