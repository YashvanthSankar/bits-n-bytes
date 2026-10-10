import React, { type PropsWithChildren, type ReactNode } from 'react';
import { act, create, type ReactTestRenderer } from 'react-test-renderer';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';

const state = vi.hoisted(() => ({ shown: null as unknown, query: vi.fn(), open: vi.fn(), copy: vi.fn(), replace: vi.fn() }));
vi.mock('react-native', () => ({ View: 'View', Linking: { openURL: state.open } }));
vi.mock('expo-clipboard', () => ({ setStringAsync: state.copy }));
vi.mock('expo-router', () => ({ useLocalSearchParams: () => ({ id: 'shelter-test' }), router: { replace: state.replace } }));
vi.mock('react-i18next', () => ({ useTranslation: () => ({ t: (key: string) => key, i18n: { language: 'en' } }) }));
vi.mock('convex/react', () => ({ useConvexAuth: () => ({ isAuthenticated: true }), useQuery: () => state.shown, useConvex: () => ({ query: state.query }) }));
vi.mock('../src/theme/useTheme', () => ({ useTheme: () => ({}) }));
vi.mock('../src/components/ui', () => ({
  Screen: ({ children, footer }: PropsWithChildren<{ footer: ReactNode }>) => <>{children}{footer}</>,
  AppText: ({ children }: PropsWithChildren) => <>{children}</>, LoadingState: () => null,
  ActionButton: (props: { title: string; onPress: () => void }) => React.createElement('button', props),
}));
vi.mock('../src/components/ReadBoundary', () => ({ ReadBoundary: ({ children }: PropsWithChildren) => <>{children}</> }));
import ShelterDetailScreen from '../src/app/shelter/[id]';

const shelter = { id: 'shelter-test', name: 'Test shelter', address: 'East entrance', issuer: 'Test issuer', audience: 'LIVE', point: { latitude: 13.08, longitude: 80.27 },
  status: 'OPEN', statusConfirmedAt: Date.now(), distanceM: 1_000, locationFresh: true, limitations: [], capacity: null, remaining: null,
  accessibility: 'UNKNOWN', facilities: [], phone: '+919876543210', accessInstruction: '', revision: 1 };
let screen: ReactTestRenderer;
beforeEach(() => {
  Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true }); vi.clearAllMocks();
  state.shown = shelter; state.query.mockReset().mockResolvedValue(shelter); state.open.mockReset().mockResolvedValue(undefined); state.copy.mockReset().mockResolvedValue(undefined);
});
afterEach(async () => { if (screen) await act(async () => screen.unmount()); });
async function render() { await act(async () => { screen = create(<ShelterDetailScreen />); }); }
async function press(title: string) { await act(async () => screen.root.findAllByType('button').find(button => button.props.title === title)!.props.onPress()); }

it('revalidates the selected shelter before opening the universal Google Maps destination', async () => {
  await render(); await press('shelterDirections');
  expect(state.query).toHaveBeenCalledTimes(1);
  expect(state.open).toHaveBeenCalledExactlyOnceWith('https://www.google.com/maps/dir/?api=1&destination=13.08%2C80.27');
});
it('requires review of changed status and never navigates to an archived/unavailable listing', async () => {
  state.query.mockResolvedValueOnce({ ...shelter, revision: 2, status: 'CLOSED' });
  await render(); await press('shelterDirections');
  expect(state.open).not.toHaveBeenCalled(); expect(JSON.stringify(screen.toJSON())).toContain('shelterChanged');
  state.query.mockRejectedValueOnce(new Error('Not found')); await press('shelterDirections');
  expect(state.open).not.toHaveBeenCalled(); expect(JSON.stringify(screen.toJSON())).toContain('destinationUnavailable');
});
it('keeps destination copying available when live revalidation or external maps fail', async () => {
  state.query.mockRejectedValue(new Error('Offline'));
  await render(); await press('copyDestination');
  expect(state.query).not.toHaveBeenCalled(); expect(state.copy).toHaveBeenCalledExactlyOnceWith('Test shelter\nEast entrance\n13.08,80.27');
  state.open.mockRejectedValueOnce(new Error('No handler')); state.query.mockResolvedValueOnce(shelter); await press('shelterDirections');
  expect(JSON.stringify(screen.toJSON())).toContain('destinationUnavailable');
  await press('copyDestination'); expect(state.copy).toHaveBeenCalledTimes(2);
});
it('opens the dialer without claiming a successful call and shows unknown capacity honestly', async () => {
  await render(); expect(JSON.stringify(screen.toJSON())).toContain('unknownValue'); await press('callShelter');
  expect(state.open).toHaveBeenCalledExactlyOnceWith('tel:+919876543210');
  expect(JSON.stringify(screen.toJSON())).toContain('shelterRouteNotice');
});
