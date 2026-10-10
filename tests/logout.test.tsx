import React, { type PropsWithChildren, type ReactNode } from 'react';
import { act, create, type ReactTestRenderer } from 'react-test-renderer';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
const state = vi.hoisted(() => ({ signOut: vi.fn(), setSignedOut: vi.fn(), setFix: vi.fn(), replace: vi.fn(), mutate: vi.fn() }));
vi.mock('../src/services/onboarding', () => ({ rememberCompletedSetup: vi.fn().mockResolvedValue(undefined) }));
vi.mock('lucide-react-native', () => Object.fromEntries(['UserRound','ShieldCheck','RefreshCw','LocateFixed','LogOut','FlaskConical','Languages','ChevronRight','ChevronDown'].map(name => [name, () => null])));
vi.mock('@convex-dev/auth/react', () => ({ useAuthActions: () => ({ signOut: state.signOut }) }));
vi.mock('react-native', () => ({ View: 'View', Pressable: 'Pressable', Switch: 'Switch' }));
vi.mock('expo-router', () => ({ useFocusEffect: (callback: () => void) => React.useEffect(callback, [callback]), router: { replace: state.replace, push: vi.fn() } }));
vi.mock('expo-crypto', () => ({ randomUUID: () => 'test-request-001' }));
vi.mock('convex/react', () => ({ useConvexAuth: () => ({ isAuthenticated: true, isLoading: false }), useQuery: () => ({ role: 'TOURIST', profile: { name: 'Test', alias: 'Traveler', revision: 1, language: 'en', stepFreeNeeded: false } }), useMutation: () => state.mutate }));
vi.mock('react-i18next', () => ({ useTranslation: () => ({ t: (key: string) => key, i18n: { language: 'en' } }) }));
vi.mock('../src/session/LocationSession', () => ({ useLocationSession: () => ({ fix: null, setFix: state.setFix, setSignedOut: state.setSignedOut }) }));
vi.mock('../src/i18n/LanguageProvider', () => ({ useLanguage: () => ({ language: 'en', changeLanguage: vi.fn() }) }));
vi.mock('../src/theme/useTheme', () => ({ useTheme: () => ({ danger: '#f00' }) }));
vi.mock('../src/components/ReadBoundary', () => ({ ReadBoundary: ({ children }: PropsWithChildren) => <>{children}</> }));
vi.mock('../src/components/Choice', () => ({ Choice: () => null }));
vi.mock('../src/components/Field', () => ({ Field: () => null }));
vi.mock('../src/components/ui', () => ({ Screen: ({ children, footer }: PropsWithChildren<{ footer: ReactNode }>) => <>{children}<footer>{footer}</footer></>, AppText: ({ children }: PropsWithChildren) => <>{children}</>, LoadingState: () => null, ActionButton: (props: object) => React.createElement('button', props) }));
import Settings from '../src/app/(tabs)/settings';
import Profile from '../src/app/profile';
let screen: ReactTestRenderer;
beforeEach(() => { Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true }); vi.clearAllMocks(); });
afterEach(async () => { if (screen) await act(async () => screen.unmount()); });
it.each([['settings', Settings], ['profile', Profile]] as const)('%s waits for token removal before clearing GPS and routing to login', async (_, Component) => {
  let finish!: () => void;
  state.signOut.mockImplementation(() => new Promise<void>(resolve => { finish = resolve; }));
  await act(async () => { screen = create(<Component />); });
  const logout = screen.root.findAll(node => node.props.title === 'signOut' && typeof node.props.onPress === 'function')[0]!;
  expect(logout).toBeDefined();
  if (_ === 'settings') {
    expect(logout.props.danger).toBe(true);
    expect(screen.root.findByType('footer').findAllByType('button')).toHaveLength(0);
  }
  await act(async () => { logout.props.onPress(); });
  expect(state.setFix).not.toHaveBeenCalled(); expect(state.replace).not.toHaveBeenCalled();
  await act(async () => finish());
  expect(state.setFix).toHaveBeenCalledExactlyOnceWith(null);
  expect(state.replace).toHaveBeenCalledExactlyOnceWith('/login');
});
it('keeps location and displays failure if token removal fails', async () => {
  state.signOut.mockRejectedValue(new Error('storage failed'));
  await act(async () => { screen = create(<Settings />); });
  await act(async () => screen.root.findAll(node => node.props.title === 'signOut' && typeof node.props.onPress === 'function')[0]!.props.onPress());
  expect(state.setFix).not.toHaveBeenCalled(); expect(state.replace).not.toHaveBeenCalled();
  expect(JSON.stringify(screen.toJSON())).toContain('serviceUnavailable');
});
