import React, { type PropsWithChildren, type ReactNode } from 'react';
import { act, create, type ReactTestRenderer } from 'react-test-renderer';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { getFunctionName } from 'convex/server';

const state = vi.hoisted(() => ({
  params: { id: 'incident-test', accepted: undefined as string | undefined },
  hasObservation: false,
  push: vi.fn(), replace: vi.fn(), eligibilityReads: 0,
}));
vi.mock('react-native', () => ({ View: 'View' }));
vi.mock('expo-router', () => ({ useFocusEffect: (callback: () => void) => React.useEffect(callback, [callback]), useLocalSearchParams: () => state.params, router: { push: state.push, replace: state.replace } }));
vi.mock('react-i18next', () => ({ useTranslation: () => ({ t: (key: string) => key, i18n: { language: 'en' } }) }));
vi.mock('convex/react', () => ({
  useConvexAuth: () => ({ isAuthenticated: true, isLoading: false }),
  useQuery: (reference: Parameters<typeof getFunctionName>[0], args: unknown) => {
    if (args === 'skip') return undefined;
    if (getFunctionName(reference) === 'observations:eligibility') {
      state.eligibilityReads++;
      return { eligible: true, hasObservation: state.hasObservation };
    }
    return { id: 'incident-test', hazard: 'FLASH_FLOOD', audience: 'LIVE', verification: 'UNVERIFIED', lifecycle: 'ACTIVE', qualification: null,
      provenance: 'COMMUNITY', assessmentStatus: 'PENDING', lastObservedAt: Date.now(), recentWitnesses: 1, totalWitnesses: 1,
      geometry: { type: 'circle', radiusM: 5_000 } };
  },
}));
vi.mock('../src/components/ui', () => ({
  Screen: ({ children, footer }: PropsWithChildren<{ footer: ReactNode }>) => <>{children}{footer}</>,
  AppText: ({ children }: PropsWithChildren) => <>{children}</>,
  LoadingState: () => null,
  ActionButton: (props: { title: string; onPress: () => void; variant?: string }) => React.createElement('button', props),
}));
vi.mock('../src/components/ReadBoundary', () => ({ ReadBoundary: ({ children }: PropsWithChildren) => <>{children}</> }));

import IncidentScreen from '../src/app/incident/[id]';

let screen: ReactTestRenderer;
beforeEach(() => {
  Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });
  state.params = { id: 'incident-test', accepted: undefined };
  state.hasObservation = false; state.eligibilityReads = 0; vi.clearAllMocks();
});
afterEach(async () => { if (screen) await act(async () => screen.unmount()); });
async function render() { await act(async () => { screen = create(<IncidentScreen />); }); }

it('finishes accepted submissions with one map action rather than restarting reporting', async () => {
  state.params.accepted = '1';
  await render();
  const buttons = screen.root.findAllByType('button');
  expect(buttons.map(button => button.props.title)).toEqual(['backToMap']);
  expect(buttons[0]!.props.variant).toBe('primary');
  expect(JSON.stringify(screen.toJSON())).toContain('reportAccepted');
  expect(JSON.stringify(screen.toJSON())).toContain('reportSavedHelp');
  expect(state.eligibilityReads).toBe(0);
  await act(async () => buttons[0]!.props.onPress());
  expect(state.replace).toHaveBeenCalledExactlyOnceWith('/map');
  expect(state.push).not.toHaveBeenCalled();
});

it('labels a deliberate later contribution as updating the existing observation', async () => {
  state.hasObservation = true;
  await render();
  const update = screen.root.findAllByType('button').find(button => button.props.title === 'updateObservation');
  expect(update).toBeDefined();
  expect(screen.root.findAllByType('button').some(button => button.props.title === 'corroborate')).toBe(false);
  await act(async () => update!.props.onPress());
  expect(state.push).toHaveBeenCalledExactlyOnceWith({ pathname: '/report', params: { incidentId: 'incident-test', hazard: 'FLASH_FLOOD', audience: 'LIVE' } });
});

it('still lets a different tourist contribute from a normal incident detail page', async () => {
  await render();
  expect(screen.root.findAllByType('button').map(button => button.props.title)).toEqual(['corroborate', 'backToMap']);
});
