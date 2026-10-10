import { getFunctionName } from 'convex/server';
import React, { type PropsWithChildren, type ReactNode } from 'react';
import { act, create, type ReactTestRenderer } from 'react-test-renderer';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
const state = vi.hoisted(() => ({ publish: vi.fn(), replace: vi.fn() }));
vi.mock('react-native', () => ({ View: 'View', ScrollView: 'ScrollView', Modal: ({visible,children}: PropsWithChildren<{visible:boolean}>) => visible ? <dialog>{children}</dialog> : null }));
vi.mock('expo-router', () => ({ router: { replace: state.replace }, useLocalSearchParams: () => ({ jurisdictionId: 'scope-1' }) }));
vi.mock('expo-crypto', () => ({ randomUUID: () => 'declaration-test-001' }));
vi.mock('convex/react', () => ({ useQuery: (ref: Parameters<typeof getFunctionName>[0]) => getFunctionName(ref) === 'authority:scopes' ? [{ id: 'scope-1', name: 'Test area', issuer: 'Test issuer', audience: 'DEMO' }] : {page:[{id:'incident-1',revision:7,hazard:'FLASH_FLOOD',locality:'Reported flood',area:{type:'circle',center:{latitude:13.0827,longitude:80.2707},radiusM:1000}}],isDone:true}, useMutation: () => state.publish }));
vi.mock('react-native-safe-area-context', () => ({ useSafeAreaInsets: () => ({ bottom: 0 }) }));
vi.mock('react-i18next', () => ({ useTranslation: () => ({ t: (key: string) => key }) }));
vi.mock('../src/features/authority/AuthorityGate', () => ({ AuthorityGate: ({ children }: PropsWithChildren) => <>{children}</> }));
vi.mock('../src/features/incidents/useReportLocation', () => ({ useReportLocation: () => vi.fn() }));
vi.mock('../src/i18n/LanguageProvider', () => ({ useLanguage: () => ({ language: 'en' }) }));
vi.mock('../src/theme/useTheme', () => ({ useTheme: () => ({ danger: '#f00', background: '#fff' }) }));
vi.mock('../src/session/LocationSession', () => ({ useLocationSession: () => ({ fix: null }) }));
vi.mock('../src/components/AreaPicker', () => ({ AreaPicker: (props: object) => React.createElement('map-picker',props) }));
vi.mock('../src/components/Choice', () => ({ Choice: () => null }));
vi.mock('../src/components/Field', () => ({ Field: (props: object) => React.createElement('input',props) }));
vi.mock('../src/components/ui', () => ({ Screen: ({ children, footer }: PropsWithChildren<{ footer: ReactNode }>) => <>{children}{footer}</>, AppText: ({ children }: PropsWithChildren) => <>{children}</>, LoadingState: () => null, ActionButton: (props: object) => React.createElement('button', props) }));
import Declare from '../src/app/authority/declare';
let screen: ReactTestRenderer;
beforeEach(async () => { Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true }); vi.clearAllMocks(); await act(async () => { screen = create(<Declare />); }); });
afterEach(async () => { await act(async () => screen.unmount()); });
const button = (title:string) => screen.root.findAllByType('button').find(b=>b.props.title===title)!;
async function draft() {
  await act(async()=>button('selectAffectedLocation').props.onPress());
  await act(async()=>screen.root.findByType('map-picker' as React.ElementType).props.onSelect({latitude:13.0827,longitude:80.2707}));
  await act(async()=>button('useSelectedLocation').props.onPress());
  for (const [label,value] of Object.entries({declarationLocality:'Test locality',declarationOriginal:'  Do not cross the bridge.  '})) {
    await act(async()=>screen.root.findAllByType('input').find(f=>f.props.label===label)!.props.onChangeText(value));
  }
}
it('requires review before publishing and finishes without offering another submission', async () => {
  await draft(); await act(async()=>button('declarationReviewButton').props.onPress());
  expect(state.publish).not.toHaveBeenCalled(); expect(screen.root.findAllByType('dialog')).toHaveLength(1);
  expect(JSON.stringify(screen.toJSON())).toContain('  Do not cross the bridge.  ');
  state.publish.mockResolvedValue({revision:1});
  await act(async()=>button('declarationPublish').props.onPress());
  expect(state.publish).toHaveBeenCalledTimes(1);
  expect(state.publish.mock.calls[0]![0]).toMatchObject({jurisdictionId:'scope-1',originalText:'  Do not cross the bridge.  ',expectedIncidentRevision:0});
  expect(screen.root.findAllByType('button').map(b=>b.props.title)).toEqual(['manageEmergencies','authorityTitle']);
  expect(JSON.stringify(screen.toJSON())).toContain('declarationPublished');
});
it('holds an uncertain publication for an exact retry without creating a new command', async () => {
  await draft(); await act(async()=>button('declarationReviewButton').props.onPress());
  state.publish.mockRejectedValueOnce(new Error('Network lost'));
  await act(async()=>button('declarationPublish').props.onPress());
  expect(button('cancel').props.disabled).toBe(true);
  expect(screen.root.findAllByType('input').every(f=>!f.props.editable)).toBe(true);
  state.publish.mockResolvedValue({revision:1});
  await act(async()=>button('retry').props.onPress());
  expect(state.publish.mock.calls[1]![0]).toEqual(state.publish.mock.calls[0]![0]);
});

it('requires explicit map selection and discards a cancelled location change', async () => {
  expect(screen.root.findAllByType('input').some(f=>['latitude','longitude'].includes(f.props.label))).toBe(false);
  await act(async()=>button('selectAffectedLocation').props.onPress());
  expect(button('useSelectedLocation').props.disabled).toBe(true);
  await act(async()=>screen.root.findByType('map-picker' as React.ElementType).props.onSelect({latitude:12,longitude:79}));
  const cancels=screen.root.findAllByType('button').filter(b=>b.props.title==='cancel');
  await act(async()=>cancels.at(-1)!.props.onPress());
  await act(async()=>button('selectAffectedLocation').props.onPress());
  expect(screen.root.findByType('map-picker' as React.ElementType).props.selected).toBeNull();
  expect(state.publish).not.toHaveBeenCalled();
});

it('keeps specialist controls collapsed and shows field-level guidance before review', async () => {
  expect(screen.root.findAllByType('input').some(field => field.props.label === 'declarationReview')).toBe(false);
  await act(async()=>button('declarationReviewButton').props.onPress());
  expect(JSON.stringify(screen.toJSON())).toContain('declarationLocalityRequired');
  expect(JSON.stringify(screen.toJSON())).toContain('declarationInstructionsRequired');
  expect(JSON.stringify(screen.toJSON())).toContain('selectLocationRequired');
  await act(async()=>button('declarationMoreOptions').props.onPress());
  expect(screen.root.findAllByType('input').some(field => field.props.label === 'declarationReview')).toBe(true);
});

it('selects an existing incident and publishes with its identity and revision rather than creating a duplicate',async()=>{
 await act(async()=>button('selectExistingIncident').props.onPress());
 await act(async()=>button('Reported flood · hazardFLASH_FLOOD').props.onPress());
 for (const [label,value] of Object.entries({declarationOriginal:'Avoid the flooded road'})) await act(async()=>screen.root.findAllByType('input').find(f=>f.props.label===label)!.props.onChangeText(value));
 await act(async()=>button('declarationReviewButton').props.onPress());
 state.publish.mockResolvedValue({revision:1});await act(async()=>button('declarationPublish').props.onPress());
 expect(state.publish.mock.calls[0]![0]).toMatchObject({incidentId:'incident-1',expectedIncidentRevision:7,locality:'Reported flood',hazard:'FLASH_FLOOD'});
});
