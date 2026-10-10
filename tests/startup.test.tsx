import React, { type PropsWithChildren } from 'react';
import { act, create, type ReactTestRenderer } from 'react-test-renderer';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
const state = vi.hoisted(() => ({
  authenticated: true, loading: false, ready: true, signedOut: false, explicit: false,
  own: { profile: { revision: 1 } } as { profile: { revision: number } | null } | undefined,
  completed: vi.fn(), remember: vi.fn(), permission: vi.fn(), locate: vi.fn(), update: vi.fn(), setFix: vi.fn(), replace: vi.fn(),
}));
vi.mock('convex/react', () => ({ useConvexAuth: () => ({ isAuthenticated: state.authenticated, isLoading: state.loading }), useQuery: () => state.own, useMutation: () => state.update }));
vi.mock('expo-router', () => ({ useLocalSearchParams: () => ({ language: state.explicit ? '1' : undefined }), useFocusEffect: (callback: () => void) => React.useEffect(callback, [callback]), router: { replace: state.replace } }));
vi.mock('expo-crypto', () => ({ randomUUID: () => 'startup-test-id' }));
vi.mock('expo-location', () => ({ getForegroundPermissionsAsync: state.permission }));
vi.mock('../src/i18n/LanguageProvider', () => ({ useLanguage: () => ({ ready: state.ready }) }));
vi.mock('../src/session/LocationSession', () => ({ useLocationSession: () => ({ setFix: state.setFix, signedOut: state.signedOut }) }));
vi.mock('../src/services/location', () => ({ currentIndiaFix: state.locate }));
vi.mock('../src/services/onboarding', () => ({ hasCompletedSetup: state.completed, rememberCompletedSetup: state.remember }));
vi.mock('../src/components/ui', () => ({ Screen: ({ children }: PropsWithChildren) => <>{children}</>, LoadingState: () => <span>Restoring</span> }));
import { StartupGate } from '../src/components/StartupGate';
let screen: ReactTestRenderer;
const fix = { point: { latitude: 13, longitude: 80 }, accuracyM: 10, observedAt: 1_800_000_000_000 };
beforeEach(() => {
  Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true }); vi.clearAllMocks();
  Object.assign(state, { authenticated: true, loading: false, ready: true, signedOut: false, explicit: false, own: { profile: { revision: 1 } } });
  state.completed.mockResolvedValue(false); state.remember.mockResolvedValue(undefined); state.permission.mockResolvedValue({ granted: true });
  state.locate.mockImplementation(async (capture: (value: unknown) => Promise<void>) => { await capture({ fix, backgroundPermission: 'denied' }); return { fix }; });
});
afterEach(async () => { if (screen) await act(async () => screen.unmount()); });
const render = async () => { await act(async () => { screen = create(<StartupGate><span>Choose language</span></StartupGate>); }); };
it('migrates an existing profile and opens the map after publishing a fresh fix', async () => {
  await render(); expect(state.remember).toHaveBeenCalledOnce(); expect(state.update).toHaveBeenCalledWith(expect.objectContaining({ fix, source: 'FOREGROUND' }));
  expect(state.setFix).toHaveBeenCalledWith(fix); expect(state.replace).toHaveBeenCalledExactlyOnceWith('/map');
  expect(JSON.stringify(screen.toJSON())).not.toContain('Choose language');
  state.own = { profile: { revision: 2 } }; await act(async () => screen.update(<StartupGate><span>Choose language</span></StartupGate>));
  expect(state.locate).toHaveBeenCalledOnce();
});
it('waits for auth and language hydration before navigating or displaying onboarding', async () => {
  state.loading = true; state.ready = false; await render(); expect(state.replace).not.toHaveBeenCalled(); expect(state.locate).not.toHaveBeenCalled(); expect(JSON.stringify(screen.toJSON())).not.toContain('Choose language');
});
it('shows language setup for a first installation', async () => {
  state.authenticated = false; state.own = undefined; await render(); expect(JSON.stringify(screen.toJSON())).toContain('Choose language'); expect(state.replace).not.toHaveBeenCalled();
});
it('skips repeated language setup when a previous user needs to sign in again', async () => {
  state.completed.mockResolvedValue(true); state.authenticated = false; state.own = undefined; await render(); expect(state.replace).toHaveBeenCalledExactlyOnceWith('/login'); expect(state.locate).not.toHaveBeenCalled();
});
it('returns to location recovery when permission has been revoked without silently requesting it', async () => {
  state.permission.mockResolvedValue({ granted: false }); await render(); expect(state.replace).toHaveBeenCalledExactlyOnceWith('/location'); expect(state.locate).not.toHaveBeenCalled(); expect(state.setFix).not.toHaveBeenCalled();
});
it('never opens the map after failed GPS or India admission', async () => {
  state.locate.mockRejectedValue(Error('OUTSIDE_INDIA')); await render(); expect(state.replace).toHaveBeenCalledExactlyOnceWith('/location'); expect(state.setFix).toHaveBeenCalledWith(null);
});
it('keeps an explicit language change available for returning users', async () => {
  state.explicit = true; await render(); expect(JSON.stringify(screen.toJSON())).toContain('Choose language'); expect(state.locate).not.toHaveBeenCalled(); expect(state.replace).not.toHaveBeenCalled();
});
it('ignores location completion after leaving startup', async () => {
  let finish!: (value: unknown) => void; state.locate.mockImplementation(() => new Promise(resolve => { finish = resolve; })); await render();
  await act(async () => screen.unmount()); await act(async () => finish({ fix })); expect(state.replace).not.toHaveBeenCalled(); expect(state.setFix).not.toHaveBeenCalled();
});
