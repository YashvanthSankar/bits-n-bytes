import { beforeEach, expect, it, vi } from 'vitest';
const location = vi.hoisted(() => ({ hasServicesEnabledAsync: vi.fn(), getForegroundPermissionsAsync: vi.fn(), requestForegroundPermissionsAsync: vi.fn(), getBackgroundPermissionsAsync: vi.fn(), getLastKnownPositionAsync: vi.fn(), getCurrentPositionAsync: vi.fn(), Accuracy: { High: 4 } }));
vi.mock('expo-location', () => location);
import { currentIndiaFix } from '../src/services/location';
import { POLICY } from '../src/domain/policy';
const position = () => ({ coords: { latitude: 13.08, longitude: 80.2, accuracy: 20 }, timestamp: Date.now() - 1000 });
beforeEach(() => {
  vi.clearAllMocks(); location.hasServicesEnabledAsync.mockResolvedValue(true);
  location.getForegroundPermissionsAsync.mockResolvedValue({ granted: true });
  location.getBackgroundPermissionsAsync.mockResolvedValue({ status: 'denied' });
  location.getLastKnownPositionAsync.mockResolvedValue(position());
  location.getCurrentPositionAsync.mockResolvedValue(position());
});
it('uses a sufficiently recent OS fix for chat without waiting for a new GPS capture', async () => {
  const publish = vi.fn();
  const result = await currentIndiaFix(publish, POLICY.chatFix, { preferRecent: true, requestPermission: false });
  expect(location.getLastKnownPositionAsync).toHaveBeenCalledExactlyOnceWith({ maxAge: 30000, requiredAccuracy: 500 });
  expect(location.getCurrentPositionAsync).not.toHaveBeenCalled();
  expect(publish).toHaveBeenCalledWith({ fix: result.fix, backgroundPermission: 'denied' });
});
it('falls back to live GPS when no recent OS fix meets the requirements', async () => {
  location.getLastKnownPositionAsync.mockResolvedValue(null);
  await currentIndiaFix(undefined, POLICY.chatFix, { preferRecent: true });
  expect(location.getCurrentPositionAsync).toHaveBeenCalledOnce();
});
it('automatic refresh does not reopen a denied permission prompt', async () => {
  location.getForegroundPermissionsAsync.mockResolvedValue({ granted: false, canAskAgain: true });
  await expect(currentIndiaFix(undefined, POLICY.chatFix, { preferRecent: true, requestPermission: false })).rejects.toMatchObject({ reason: 'denied' });
  expect(location.requestForegroundPermissionsAsync).not.toHaveBeenCalled(); expect(location.getCurrentPositionAsync).not.toHaveBeenCalled();
});
it('incident reporting still captures a new position instead of reusing the chat shortcut', async () => {
  await currentIndiaFix();
  expect(location.getLastKnownPositionAsync).not.toHaveBeenCalled(); expect(location.getCurrentPositionAsync).toHaveBeenCalledOnce();
});
