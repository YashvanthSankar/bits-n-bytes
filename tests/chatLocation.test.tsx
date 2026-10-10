import React from 'react';
import { act, create } from 'react-test-renderer';
import { beforeEach, expect, it, vi } from 'vitest';
const state = vi.hoisted(() => ({ fix: { point: { latitude: 13, longitude: 80 }, observedAt: 0, accuracyM: 10 }, capture: vi.fn(), update: vi.fn(), setFix: vi.fn() }));
vi.mock('convex/react', () => ({ useMutation: () => state.update }));
vi.mock('expo-crypto', () => ({ randomUUID: () => 'chat-location-id' }));
vi.mock('../src/session/LocationSession', () => ({ useLocationSession: () => ({ fix: state.fix, setFix: state.setFix }) }));
vi.mock('../src/services/location', () => ({ currentIndiaFix: state.capture, LocationFailure: class extends Error {} }));
import { useChatLocation } from '../src/features/chat/useChatLocation';
let ensure: ReturnType<typeof useChatLocation>;
function Probe() { ensure = useChatLocation(); return null; }
beforeEach(() => { Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true }); vi.clearAllMocks(); state.fix = { point: { latitude: 13, longitude: 80 }, observedAt: Date.now() - 1000, accuracyM: 10 }; });
it('sends repeatedly with the admitted fresh fix without GPS or server update calls', async () => {
  let screen!: ReturnType<typeof create>;
  await act(async () => { screen = create(<Probe />); });
  expect(await ensure()).toEqual(state.fix); expect(await ensure()).toEqual(state.fix);
  expect(state.capture).not.toHaveBeenCalled(); expect(state.update).not.toHaveBeenCalled();
  await act(async () => screen.unmount());
});
it('shares one in-flight stale-location refresh across focus and send requests', async () => {
  state.fix.observedAt = Date.now() - 360000;
  let finish!: (value: unknown) => void;
  state.capture.mockImplementation(() => new Promise(resolve => { finish = resolve; }));
  let screen!: ReturnType<typeof create>;
  await act(async () => { screen = create(<Probe />); });
  const first = ensure(), second = ensure(true);
  expect(first).toBe(second); expect(state.capture).toHaveBeenCalledOnce();
  const fresh = { ...state.fix, observedAt: Date.now() };
  await act(async () => { finish({ fix: fresh }); await first; });
  expect(state.setFix).toHaveBeenCalledWith(fresh);
  expect(await ensure()).toEqual(fresh); expect(state.capture).toHaveBeenCalledOnce();
  await act(async () => screen.unmount());
});
it('preserves the session and permits retry after transient GPS failure', async () => {
  state.capture.mockRejectedValueOnce(Error('timeout')).mockResolvedValueOnce({ fix: state.fix });
  let screen!: ReturnType<typeof create>;
  await act(async () => { screen = create(<Probe />); });
  await expect(ensure(true)).rejects.toThrow('timeout'); expect(state.setFix).not.toHaveBeenCalled();
  await expect(ensure(true)).resolves.toEqual(state.fix);
  await act(async () => screen.unmount());
});
