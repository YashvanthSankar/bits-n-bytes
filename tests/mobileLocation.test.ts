import { afterEach, beforeEach, expect, it, vi } from 'vitest';
const mock = vi.hoisted(() => ({ services: vi.fn(), foreground: vi.fn(), request: vi.fn(), position: vi.fn(), background: vi.fn() }));
vi.mock('expo-location', () => ({
  hasServicesEnabledAsync: mock.services, getForegroundPermissionsAsync: mock.foreground,
  requestForegroundPermissionsAsync: mock.request, getCurrentPositionAsync: mock.position,
  getBackgroundPermissionsAsync: mock.background, Accuracy: { High: 4 },
}));
import { currentIndiaFix } from '../src/services/location';
const now = Date.now();
function position(latitude = 13.0827, longitude = 80.2707, accuracy: number | null = 10, timestamp = now) {
  return { timestamp, coords: { latitude, longitude, accuracy } };
}
beforeEach(() => {
  vi.resetAllMocks(); mock.services.mockResolvedValue(true);
  mock.foreground.mockResolvedValue({ granted: true, canAskAgain: false });
  mock.background.mockResolvedValue({ status: 'denied' }); mock.position.mockResolvedValue(position());
});
afterEach(() => vi.useRealTimers());
it('retains GPS observation time and optional background denial', async () => {
  const result = await currentIndiaFix(); expect(result.fix.observedAt).toBe(now);
  expect(result.backgroundPermission).toBe('denied'); expect(mock.request).not.toHaveBeenCalled();
});
it('disabled services do not trigger a permission request', async () => {
  mock.services.mockResolvedValue(false);
  await expect(currentIndiaFix()).rejects.toMatchObject({ reason: 'disabled', settings: true });
  expect(mock.request).not.toHaveBeenCalled();
});
it('permanent denial points to Settings and does not loop requests', async () => {
  mock.foreground.mockResolvedValue({ granted: false, canAskAgain: false });
  await expect(currentIndiaFix()).rejects.toMatchObject({ reason: 'denied', settings: true });
  expect(mock.request).not.toHaveBeenCalled(); expect(mock.position).not.toHaveBeenCalled();
});
it('first request denial remains retryable without claiming GPS access', async () => {
  mock.foreground.mockResolvedValue({ granted: false, canAskAgain: true }); mock.request.mockResolvedValue({ granted: false, canAskAgain: true });
  await expect(currentIndiaFix()).rejects.toMatchObject({ reason: 'denied', settings: false }); expect(mock.position).not.toHaveBeenCalled();
});
it('permission restoration acquires a new fix rather than admitting cached data', async () => {
  mock.foreground.mockResolvedValue({ granted: false, canAskAgain: true }); mock.request.mockResolvedValue({ granted: true });
  await expect(currentIndiaFix()).resolves.toMatchObject({ fix: { accuracyM: 10 } }); expect(mock.position).toHaveBeenCalledTimes(1);
});
it.each([
  ['outside', position(1.3521, 103.8198)], ['accuracy', position(13.0827, 80.2707, null)],
  ['accuracy', position(13.0827, 80.2707, 201)], ['accuracy', position(13.0827, 80.2707, 10, now - 301_000)],
])('blocks %s fixes', async (reason, value) => { mock.position.mockResolvedValue(value); await expect(currentIndiaFix()).rejects.toMatchObject({ reason }); });
it('hung GPS times out without admitting an older location', async () => {
  vi.useFakeTimers(); mock.position.mockReturnValue(new Promise(() => {}));
  const pending = expect(currentIndiaFix()).rejects.toMatchObject({ reason: 'unavailable' });
  await vi.advanceTimersByTimeAsync(25_001); await pending;
});
