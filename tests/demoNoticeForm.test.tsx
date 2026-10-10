import React, { type PropsWithChildren, type ReactNode } from 'react';
import { act, create, type ReactTestRenderer } from 'react-test-renderer';
import { expect, it, vi } from 'vitest';
import { getFunctionName } from 'convex/server';

const state = vi.hoisted(() => ({ create: vi.fn(), withdraw: vi.fn() }));
vi.mock('react-native', () => ({ View: 'View', ScrollView: 'ScrollView', Modal: ({ visible, children }: PropsWithChildren<{visible:boolean}>) => visible ? <dialog>{children}</dialog> : null }));
vi.mock('expo-router', () => ({ router: { replace: vi.fn() }, useLocalSearchParams: () => ({ jurisdictionId: 'scope-1' }) }));
vi.mock('expo-crypto', () => ({ randomUUID: () => 'demo-notice-001' }));
vi.mock('convex/react', () => ({ useQuery: (ref: Parameters<typeof getFunctionName>[0]) => getFunctionName(ref) === 'authority:scopes' ? [{id:'scope-1',name:'Demo area',issuer:'Demo issuer',audience:'DEMO'}] : {page:[],isDone:true}, useMutation: (ref: Parameters<typeof getFunctionName>[0]) => getFunctionName(ref) === 'demoNotices:withdraw' ? state.withdraw : state.create }));
vi.mock('react-native-safe-area-context', () => ({ useSafeAreaInsets: () => ({bottom:0,top:0}) }));
vi.mock('react-i18next', () => ({ useTranslation: () => ({t:(key:string)=>key}) }));
vi.mock('../src/i18n/LanguageProvider', () => ({ useLanguage: () => ({language:'en'}) }));
vi.mock('../src/features/authority/AuthorityGate', () => ({ AuthorityGate: ({children}:PropsWithChildren)=><>{children}</> }));
vi.mock('../src/features/incidents/useReportLocation', () => ({useReportLocation:()=>vi.fn()}));
vi.mock('../src/session/LocationSession', () => ({useLocationSession:()=>({fix:null})}));
vi.mock('../src/theme/useTheme', () => ({useTheme:()=>({accent:'#07f',danger:'#f00',background:'#fff',border:'#ccc',muted:'#eee'})}));
vi.mock('../src/components/AreaPicker', () => ({AreaPicker:(props:object)=>React.createElement('map-picker',props)}));
vi.mock('../src/components/Choice', () => ({Choice:()=>null}));
vi.mock('../src/components/Field', () => ({Field:(props:object)=>React.createElement('input',props)}));
vi.mock('../src/components/ui', () => ({Screen:({children,footer}:PropsWithChildren<{footer:ReactNode}>)=><>{children}{footer}</>,AppText:({children}:PropsWithChildren)=><>{children}</>,LoadingState:()=>null,ActionButton:(props:object)=>React.createElement('button',props)}));
import DemoNotices from '../src/app/authority/demo-notices';

it('starts with a two-hour DEMO evidence notice and explains that it cannot alert directly', async () => {
  Object.assign(globalThis,{IS_REACT_ACT_ENVIRONMENT:true}); let screen!:ReactTestRenderer;
  await act(async()=>{screen=create(<DemoNotices/>);});
  try {
    expect(JSON.stringify(screen.toJSON())).toContain('demoNoticeEvidenceOnly');
    expect(JSON.stringify(screen.toJSON())).toContain('demoNoticeHowToTestSteps');
    expect(screen.root.findAllByType('input').find(item=>item.props.label==='demoNoticeExpiry')!.props.value).toBe('120');
    await act(async()=>screen.root.findAllByType('button').find(item=>item.props.title==='declarationMoreOptions')!.props.onPress());
    expect(JSON.stringify(screen.toJSON())).toContain('demoNoticeUrgency');
  } finally { await act(async()=>screen.unmount()); }
});
