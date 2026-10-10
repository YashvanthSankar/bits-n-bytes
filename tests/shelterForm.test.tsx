import React, { type PropsWithChildren, type ReactNode } from 'react';
import { act, create, type ReactTestRenderer } from 'react-test-renderer';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { getFunctionName } from 'convex/server';
import { ConvexError } from 'convex/values';
import type { Id } from '../convex/_generated/dataModel';

const state = vi.hoisted(() => ({ save: vi.fn(), archive: vi.fn(), replace: vi.fn(), sequence: 0 }));
vi.mock('react-native', () => ({ View: 'View', ScrollView: 'ScrollView', Switch: 'Switch', Modal: ({ visible, children }: PropsWithChildren<{ visible: boolean }>) => visible ? children : null }));
vi.mock('react-native-safe-area-context', () => ({ useSafeAreaInsets: () => ({ top: 0, bottom: 0 }) }));
vi.mock('expo-router', () => ({ router: { replace: state.replace } }));
vi.mock('expo-crypto', () => ({ randomUUID: () => 'request-test-' + (++state.sequence) }));
vi.mock('react-i18next', () => ({ useTranslation: () => ({ t: (key: string) => key }) }));
vi.mock('convex/react', () => ({ useMutation: (reference: Parameters<typeof getFunctionName>[0]) => getFunctionName(reference) === 'shelters:save' ? state.save : state.archive }));
vi.mock('../src/features/incidents/useReportLocation', () => ({ useReportLocation: () => async () => ({ point: { latitude: 13.08, longitude: 80.27 }, accuracyM: 10, observedAt: Date.now() }) }));
vi.mock('../src/theme/useTheme', () => ({ useTheme: () => ({}) }));
vi.mock('../src/components/ui', () => ({
  Screen: ({ children, footer }: PropsWithChildren<{ footer: ReactNode }>) => <>{children}{footer}</>,
  AppText: ({ children }: PropsWithChildren) => <>{children}</>,
  ActionButton: (props: { title: string; onPress: () => void }) => React.createElement('button', props),
}));
vi.mock('../src/components/Field', () => ({ Field: (props: { label: string; value: string; onChangeText: (text: string) => void }) => React.createElement('input', props) }));
vi.mock('../src/session/LocationSession', () => ({ useLocationSession: () => ({ fix: null }) }));
vi.mock('../src/components/AreaPicker', () => ({ AreaPicker: (props: object) => React.createElement('map-picker', props) }));
vi.mock('../src/components/Choice', () => ({ Choice: (props: { label: string; onPress: () => void }) => React.createElement('choice', props) }));

import { ShelterForm } from '../src/features/authority/ShelterForm';

const jurisdictionId = 'jurisdiction-test' as Id<'jurisdictions'>;
const initial = { id: 'shelter-test' as Id<'shelters'>, jurisdictionId, name: 'Existing shelter', address: 'Existing address', point: { latitude: 13.08, longitude: 80.27 },
  status: 'OPEN' as const, statusConfirmedAt: Date.now(), capacity: 100, remaining: 40, accessibility: 'STEP_FREE' as const,
  facilities: ['Water'], phone: '+919876543210', accessInstruction: 'East gate', accessRestricted: false, revision: 4, audience: 'LIVE' as const, issuer: 'Test issuer', stale: false };
let screen: ReactTestRenderer;
const props = { jurisdictionId, jurisdictionName: 'Test area', issuer: 'Test issuer', audience: 'LIVE' as const, initial };
beforeEach(() => {
  Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true }); vi.clearAllMocks(); state.sequence = 0;
  state.save.mockReset().mockResolvedValue({ shelterId: initial.id, revision: 5 });
  state.archive.mockReset().mockResolvedValue({ shelterId: initial.id, revision: 5 });
});
afterEach(async () => { if (screen) await act(async () => screen.unmount()); });
async function render(value = props) { await act(async () => { screen = create(<ShelterForm {...value} />); }); }
async function press(title: string) { await act(async () => { screen.root.findAllByType('button').find(button => button.props.title === title)!.props.onPress(); }); }
async function field(label: string, value: string, last = false) {
  await act(async () => { const fields = screen.root.findAllByType('input').filter(input => input.props.label === label); fields[last ? fields.length - 1 : 0]!.props.onChangeText(value); });
}

it('saves a metadata edit with its original revision, without local fields or automatic reconfirmation', async () => {
  await render(); await field('shelterName', 'Updated name'); await field('changeReason', 'Correct public name'); await press('saveShelter');
  expect(state.save).toHaveBeenCalledTimes(1);
  expect(state.save.mock.calls[0]![0]).toMatchObject({ shelterId: initial.id, expectedRevision: 4, name: 'Updated name', confirmStatus: false, point: initial.point });
  expect(state.save.mock.calls[0]![0]).not.toHaveProperty('latitude');
  expect(state.save.mock.calls[0]![0]).not.toHaveProperty('longitude');
  expect(state.replace).toHaveBeenCalledWith({ pathname: '/authority/shelters', params: { jurisdictionId, saved: '1' } });
});

it('requires an actual confirmation when changing availability', async () => {
  await render(); await field('changeReason', 'Current site count'); await field('shelterRemaining', '30'); await press('saveShelter');
  expect(state.save).not.toHaveBeenCalled(); expect(JSON.stringify(screen.toJSON())).toContain('confirmStatusRequired');
  await act(async () => screen.root.findAllByType('Switch' as React.ElementType).find(item => item.props.accessibilityLabel === 'confirmShelterStatus')!.props.onValueChange(true));
  await press('saveShelter'); expect(state.save.mock.calls[0]![0]).toMatchObject({ remaining: 30, confirmStatus: true });
});

it('freezes an uncertain command and retries the exact body rather than inventing a second write', async () => {
  state.save.mockRejectedValueOnce(new Error('Transport unavailable'));
  await render(); await field('changeReason', 'Correct public name'); await press('saveShelter');
  expect(state.replace).not.toHaveBeenCalled();
  expect(screen.root.findAllByType('input').every(input => input.props.editable === false)).toBe(true);
  const original = state.save.mock.calls[0]![0]; await press('retry');
  expect(state.save).toHaveBeenCalledTimes(2); expect(state.save.mock.calls[1]![0]).toEqual(original); expect(state.sequence).toBe(1);
  expect(state.replace).toHaveBeenCalledTimes(1);
});

it('preserves draft fields on a stale revision and requires reviewing the new server version', async () => {
  state.save.mockRejectedValueOnce(new ConvexError({ code: 'REVISION_CONFLICT' }));
  await render(); await field('shelterName', 'My draft name'); await field('changeReason', 'Correct public name'); await press('saveShelter');
  expect(state.replace).not.toHaveBeenCalled();
  await act(async () => screen.update(<ShelterForm {...props} initial={{ ...initial, name: 'Other authority edit', revision: 5 }} />));
  expect(screen.root.findAllByType('input').find(input => input.props.label === 'shelterName')!.props.value).toBe('My draft name');
  await press('reviewLatestShelter'); expect(JSON.stringify(screen.toJSON())).toContain('Other authority edit');
  await press('continueWithDraft'); await press('saveShelter');
  expect(state.save.mock.calls[1]![0]).toMatchObject({ expectedRevision: 5, name: 'My draft name' });
});

it('opens an archive confirmation, preserves the listing on cancel and navigates only after acceptance', async () => {
  await render(); await press('archiveShelter'); expect(state.archive).not.toHaveBeenCalled();
  await act(async () => screen.root.findAllByType('button').filter(button => button.props.title === 'cancel')[0]!.props.onPress());
  expect(state.archive).not.toHaveBeenCalled(); expect(state.replace).not.toHaveBeenCalled();
  await press('archiveShelter');
  await field('changeReason', 'Site permanently closed', true);
  // The first archive button is behind the modal; press its explicit confirmation action.
  await act(async () => screen.root.findAllByType('button').filter(button => button.props.title === 'archiveShelter')[1]!.props.onPress());
  expect(state.archive).toHaveBeenCalledExactlyOnceWith({ requestId: 'request-test-1', shelterId: initial.id, expectedRevision: 4, reason: 'Site permanently closed' });
  expect(state.replace).toHaveBeenCalledWith({ pathname: '/authority/shelters', params: { jurisdictionId, archived: '1' } });
});

it('uses a map-selected entrance without coordinate fields, and cancellation preserves the previous entrance', async () => {
  await render();
  expect(screen.root.findAllByType('input').some(f=>['latitude','longitude'].includes(f.props.label))).toBe(false);
  await press('selectShelterLocation');
  expect(screen.root.findByType('map-picker' as React.ElementType).props.selected).toEqual(initial.point);
  await act(async()=>screen.root.findByType('map-picker' as React.ElementType).props.onSelect({latitude:13.09,longitude:80.28}));
  await press('cancel');await press('selectShelterLocation');
  expect(screen.root.findByType('map-picker' as React.ElementType).props.selected).toEqual(initial.point);
  await act(async()=>screen.root.findByType('map-picker' as React.ElementType).props.onSelect({latitude:13.09,longitude:80.28}));
  await press('useSelectedLocation');await field('changeReason','Correct entrance location');await press('saveShelter');
  expect(state.save).not.toHaveBeenCalled(); // Moving the entrance still requires real status confirmation.
  await act(async()=>screen.root.findAllByType('Switch' as React.ElementType).find(s=>s.props.accessibilityLabel==='confirmShelterStatus')!.props.onValueChange(true));
  await press('saveShelter');expect(state.save.mock.calls[0]![0].point).toEqual({latitude:13.09,longitude:80.28});
});

 it('identifies a too-short name or address before sending a save', async () => {
  await render(); await field('shelterName', ' '); await press('saveShelter');
  expect(state.save).not.toHaveBeenCalled(); expect(JSON.stringify(screen.toJSON())).toContain('shelterFieldMinimum');
  await field('shelterName', 'Valid shelter'); await field('shelterAddress', ' '); await press('saveShelter');
  expect(state.save).not.toHaveBeenCalled(); expect(JSON.stringify(screen.toJSON())).toContain('shelterFieldMinimum');
});
