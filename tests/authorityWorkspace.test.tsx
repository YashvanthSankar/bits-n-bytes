import React, { type PropsWithChildren, type ReactNode } from 'react';
import { act, create, type ReactTestRenderer } from 'react-test-renderer';
import { expect, it, vi } from 'vitest';
const state=vi.hoisted(()=>({push:vi.fn()}));
vi.mock('convex/react',()=>({useQuery:()=>[{id:'jurisdiction-test',name:'Assigned area',agencyName:'Test authority',issuer:'Test issuer',audience:'DEMO'}]}));
vi.mock('expo-router',()=>({router:{push:state.push,replace:vi.fn()}}));
vi.mock('react-native',()=>({View:'View',Pressable:'Pressable'}));
vi.mock('lucide-react-native',()=>({ShieldCheck:()=>null,TriangleAlert:()=>null,House:()=>null,ChevronRight:()=>null,MapPin:()=>null}));
vi.mock('react-i18next',()=>({useTranslation:()=>({t:(key:string)=>key})}));
vi.mock('../src/theme/useTheme',()=>({useTheme:()=>({})}));
vi.mock('../src/features/authority/AuthorityGate',()=>({AuthorityGate:({children}:PropsWithChildren)=><>{children}</>}));
vi.mock('../src/components/ui',()=>({Screen:({children,footer}:PropsWithChildren<{footer:ReactNode}>)=><>{children}{footer}</>,AppText:({children}:PropsWithChildren)=><>{children}</>,LoadingState:()=>null,EmptyState:()=>null,ActionButton:(props:object)=>React.createElement('button',props)}));
import Workspace from '../src/app/authority/index';
it('links both requested pages from the workspace without the large access-active card',async()=>{
 Object.assign(globalThis,{IS_REACT_ACT_ENVIRONMENT:true});let screen!:ReactTestRenderer;await act(async()=>{screen=create(<Workspace/>);});try{
  expect(JSON.stringify(screen.toJSON())).not.toContain('authorityReady');
  for(const title of ['sachetTitle','viewReports'])await act(async()=>screen.root.findAllByType('button').find(b=>b.props.title===title)!.props.onPress());
  expect(state.push).toHaveBeenCalledWith('/sachet');expect(state.push).toHaveBeenCalledWith({pathname:'/authority/reports',params:{jurisdictionId:'jurisdiction-test'}});
 }finally{await act(async()=>screen.unmount());}
});
