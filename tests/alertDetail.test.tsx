import React, { type PropsWithChildren, type ReactNode } from 'react';
import { act, create, type ReactTestRenderer } from 'react-test-renderer';
import { expect, it, vi } from 'vitest';
const state=vi.hoisted(()=>({push:vi.fn(),source:{sourceId:'source-test',kind:'COMMUNITY',issuer:'Community evidence',active:true,issuedAt:Date.now(),reviewOverdue:false,reviewDueAt:null,deadlineAt:null,appliesToCurrentLocation:true,originalText:null as string|null,sourceLanguage:null as string|null,translation:null}}));
vi.mock('convex/react',()=>({useConvexAuth:()=>({isAuthenticated:true}),useQuery:()=>({id:'alert-test',incidentId:'incident-test',audience:'DEMO',lifecycle:'ACTIVE',locality:'Test',severity:'HIGH',locationFresh:true,locationObservedAt:Date.now(),proximity:'INSIDE',instructions:[state.source]})}));
vi.mock('expo-router',()=>({useLocalSearchParams:()=>({id:'alert-test'}),router:{push:state.push,replace:vi.fn()}}));
vi.mock('react-native',()=>({View:'View'}));
vi.mock('react-i18next',()=>({useTranslation:()=>({t:(key:string)=>key,i18n:{language:'en'}})}));
vi.mock('../src/session/LocationSession',()=>({useLocationSession:()=>({fix:{observedAt:Date.now()},signedOut:false})}));
vi.mock('../src/theme/useTheme',()=>({useTheme:()=>({})}));
vi.mock('../src/components/ReadBoundary',()=>({ReadBoundary:({children}:PropsWithChildren)=><>{children}</>}));
vi.mock('../src/components/ui',()=>({Screen:({children,footer}:PropsWithChildren<{footer:ReactNode}>)=><>{children}{footer}</>,AppText:({children}:PropsWithChildren)=><>{children}</>,LoadingState:()=>null,ActionButton:(props:object)=>React.createElement('button',props)}));
import Detail from '../src/app/alert/[id]';
it('shows community assessment evidence without an endlessly pending official translation',async()=>{
 Object.assign(globalThis,{IS_REACT_ACT_ENVIRONMENT:true});let screen!:ReactTestRenderer;state.source.kind='COMMUNITY';state.source.originalText=null;state.source.sourceLanguage=null;
 await act(async()=>{screen=create(<Detail/>);});try{const text=JSON.stringify(screen.toJSON());expect(text).toContain('modelEvidenceNotice');expect(text).not.toContain('emergencyTranslationPending');await act(async()=>screen.root.findAllByType('button').find(b=>b.props.title==='evidenceTitle')!.props.onPress());expect(state.push).toHaveBeenCalledWith({pathname:'/incident/[id]',params:{id:'incident-test'}});}finally{await act(async()=>screen.unmount());}
});
it('retains the exact original and pending translation fallback for an authority instruction',async()=>{
 Object.assign(globalThis,{IS_REACT_ACT_ENVIRONMENT:true});state.source.kind='AUTHORITY';state.source.originalText='Do not cross the river.';state.source.sourceLanguage='ta';let screen!:ReactTestRenderer;
 await act(async()=>{screen=create(<Detail/>);});try{const text=JSON.stringify(screen.toJSON());expect(text).toContain('Do not cross the river.');expect(text).toContain('emergencyTranslationPending');expect(text).not.toContain('modelEvidenceNotice');}finally{await act(async()=>screen.unmount());}
});
