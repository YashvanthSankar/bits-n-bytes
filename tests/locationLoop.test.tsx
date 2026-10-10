import React, { type PropsWithChildren, type ReactNode } from 'react';
import { act, create, type ReactTestRenderer } from 'react-test-renderer';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
const state = vi.hoisted(() => ({ own: { profile: { name: 'Test', revision: 1, language: 'en', stepFreeNeeded: false, bloodGroup: null, emergencyContact: null } },
  locate: vi.fn(), permission: vi.fn(), update: vi.fn(), setFix: vi.fn(), replace: vi.fn() }));
vi.mock('react-native', () => ({ View: 'View', Linking: { openSettings: vi.fn() } }));
vi.mock('expo-router', () => ({ router: { replace: state.replace } }));
vi.mock('expo-crypto', () => ({ randomUUID: () => 'test-location-001' }));
vi.mock('expo-location', () => ({ getForegroundPermissionsAsync: state.permission }));
vi.mock('convex/react', () => ({ useConvexAuth: () => ({ isAuthenticated: true, isLoading: false }), useQuery: () => state.own, useMutation: () => state.update }));
vi.mock('react-i18next', () => ({ useTranslation: () => ({ t: (key: string) => key }) }));
vi.mock('../src/session/LocationSession', () => ({ useLocationSession: () => ({ setFix: state.setFix }) }));
vi.mock('../src/i18n/LanguageProvider', () => ({ useLanguage: () => ({ language: 'en' }) }));
vi.mock('../src/theme/useTheme', () => ({ useTheme: () => ({ secondary: '#000', danger: '#f00' }) }));
vi.mock('../src/services/location', () => ({ currentIndiaFix: state.locate, LocationFailure: class extends Error {} }));
vi.mock('../src/components/ui', () => ({ Screen: ({ children, footer }: PropsWithChildren<{ footer: ReactNode }>) => <>{children}{footer}</>, AppText: ({ children }: PropsWithChildren) => <>{children}</>, ActionButton: (props: object) => React.createElement('button', props) }));
import LocationScreen from '../src/app/location';
let screen: ReactTestRenderer;
beforeEach(() => { Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true }); vi.clearAllMocks(); state.permission.mockResolvedValue({ granted: true }); state.locate.mockResolvedValue({ fix: { point: { latitude: 13, longitude: 80 }, observedAt: Date.now(), accuracyM: 10 } }); });
afterEach(async () => { if (screen) await act(async () => screen.unmount()); });
it('does not restart location/navigation when reactive profile results change', async () => {
  await act(async () => { screen = create(<LocationScreen />); });
  expect(state.locate).toHaveBeenCalledTimes(1);
  expect(state.replace).toHaveBeenCalledExactlyOnceWith('/map');
  state.own = { profile: { ...state.own.profile, revision: 2 } };
  await act(async () => screen.update(<LocationScreen />));
  expect(state.locate).toHaveBeenCalledTimes(1);
  expect(state.permission).toHaveBeenCalledTimes(1);
  expect(state.replace).toHaveBeenCalledTimes(1);
});
it('waits for an explicit action when permission is not already granted', async () => {
  state.permission.mockResolvedValue({ granted: false });
  await act(async () => { screen = create(<LocationScreen />); });
  expect(state.locate).not.toHaveBeenCalled();
  const button = screen.root.findAllByType('button').find(b => b.props.title === 'locationAction')!;
  await act(async () => button.props.onPress());
  expect(state.locate).toHaveBeenCalledTimes(1);
  expect(state.replace).toHaveBeenCalledExactlyOnceWith('/map');
});
