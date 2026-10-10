import React, { type PropsWithChildren, type ReactNode } from 'react';
import { act, create, type ReactTestRenderer } from 'react-test-renderer';
import { expect, it, vi } from 'vitest';
const state=vi.hoisted(()=>({push:vi.fn(),replace:vi.fn()}));
vi.mock('react-native',()=>({View:'View',Pressable:'Pressable'}));
vi.mock('lucide-react-native',()=>({ShieldCheck:()=>null,TriangleAlert:()=>null,House:()=>null,ChevronRight:()=>null,MapPin:()=>null}));
vi.mock('expo-router',()=>({router:state}));
vi.mock('convex/react',()=>({useQuery:()=>[{id:'assigned-scope',name:'Chennai demo area',agencyName:'Demo authority',audience:'DEMO'}]}));
vi.mock('react-i18next',()=>({useTranslation:()=>({t:(key:string)=>key})}));
vi.mock('../src/features/authority/AuthorityGate',()=>({AuthorityGate:({children}:PropsWithChildren)=><>{children}</>}));
vi.mock('../src/theme/useTheme',()=>({useTheme:()=>({})}));
vi.mock('../src/components/ui',()=>({Screen:({children,footer}:PropsWithChildren<{footer:ReactNode}>)=><>{children}{footer}</>,AppText:({children}:PropsWithChildren)=><>{children}</>,EmptyState:()=>null,LoadingState:()=>null,ActionButton:(props:object)=>React.createElement('button',props)}));
import Dashboard from '../src/app/authority';
it('keeps the authority workspace alert-first and places test tooling behind DEMO tools',async()=>{
 Object.assign(globalThis,{IS_REACT_ACT_ENVIRONMENT:true});let screen!:ReactTestRenderer;
 await act(async()=>{screen=create(<Dashboard/>);});
 try{
  const actions=screen.root.findAllByType('Pressable' as React.ElementType);
  expect(actions.map(a=>a.props.accessibilityLabel)).toEqual(['authorityPublishEmergency','manageShelters']);
  await act(async()=>actions[0]!.props.onPress());
  expect(state.push).toHaveBeenLastCalledWith({pathname:'/authority/declare',params:{jurisdictionId:'assigned-scope'}});
  expect(JSON.stringify(screen.toJSON())).not.toContain('authorityCreateDemoEvidence');
  expect(JSON.stringify(screen.toJSON())).toContain('authorityPublishEmergencyHelp');
  await act(async()=>actions[1]!.props.onPress());
  expect(state.push).toHaveBeenLastCalledWith({pathname:'/authority/shelters',params:{jurisdictionId:'assigned-scope'}});
  await act(async()=>screen.root.findAllByType('button').find(b=>b.props.title==='authorityDemoTools')!.props.onPress());
  await act(async()=>screen.root.findAllByType('button').find(b=>b.props.title==='authorityCreateTestNotice')!.props.onPress());
  expect(state.push).toHaveBeenLastCalledWith({pathname:'/authority/demo-notices',params:{jurisdictionId:'assigned-scope'}});
  expect(JSON.stringify(screen.toJSON())).toContain('DEMO');
  await act(async()=>screen.root.findAllByType('button').find(b=>b.props.title==='manageEmergencies')!.props.onPress());
  expect(state.push).toHaveBeenLastCalledWith({pathname:'/authority/emergencies',params:{jurisdictionId:'assigned-scope'}});
  await act(async()=>screen.root.findAllByType('button').find(b=>b.props.title==='backToMap')!.props.onPress());
  expect(state.replace).toHaveBeenCalledWith('/map');
 }finally{await act(async()=>screen.unmount());}
});
