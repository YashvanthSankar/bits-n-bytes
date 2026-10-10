import React, { type PropsWithChildren, type ReactNode } from 'react';
import { act, create, type ReactTestRenderer } from 'react-test-renderer';
import { expect, it, vi } from 'vitest';
vi.mock('convex/react',()=>({useQuery:()=>({incident:{hazard:'CYCLONE',locality:'Test',audience:'DEMO',verification:'CORROBORATED',recentWitnesses:2,totalWitnesses:2},reviewNeeded:false,job:{status:'DONE',lastError:null},assessment:{model:'jev-1.13',rubric:'gudtour-crisis-v2',qualification:'INSUFFICIENT_EVIDENCE',outcome:'INSUFFICIENT_EVIDENCE',optionProbability:0.83,confidence:0.74,severity:'UNKNOWN',assessedAt:Date.now(),latencyMs:903,currentEvidence:true,judgmentsJson:JSON.stringify({recency:{choice:'UNKNOWN',optionProbability:0.64,confidence:0.46}}),contextJson:JSON.stringify({incident:{counts:{recent:2,total:2},samples:[{description:'Exact original witness description',observedAt:Date.now()}]},missingInputs:['UPSTREAM_WEATHER_UNAVAILABLE']})}})}));
vi.mock('expo-router',()=>({useLocalSearchParams:()=>({id:'incident-test',jurisdictionId:'jurisdiction-test'}),router:{push:vi.fn(),replace:vi.fn()}}));
vi.mock('react-native',()=>({View:'View'}));
vi.mock('react-i18next',()=>({useTranslation:()=>({t:(key:string)=>key,i18n:{language:'en'}})}));
vi.mock('../src/theme/useTheme',()=>({useTheme:()=>({})}));
vi.mock('../src/features/authority/AuthorityGate',()=>({AuthorityGate:({children}:PropsWithChildren)=><>{children}</>}));
vi.mock('../src/components/ui',()=>({Screen:({children,footer}:PropsWithChildren<{footer:ReactNode}>)=><>{children}{footer}</>,AppText:({children}:PropsWithChildren)=><>{children}</>,LoadingState:()=>null,ActionButton:(props:object)=>React.createElement('button',props)}));
import Detail from '../src/app/authority/reports/[id]';
it('shows actual Jev result separately from confidence and expands both exact model context stages',async()=>{
 Object.assign(globalThis,{IS_REACT_ACT_ENVIRONMENT:true});let screen!:ReactTestRenderer;await act(async()=>{screen=create(<Detail/>);});try{
  const before=JSON.stringify(screen.toJSON());expect(before).toContain('qualificationINSUFFICIENT_EVIDENCE');expect(before).toContain('selectedProbability');expect(before).toContain('modelConfidence');expect(before).toContain('Exact original witness description');expect(before).not.toContain('contextStageOne');
  await act(async()=>screen.root.findAllByType('button').find(b=>b.props.title==='showExactContext')!.props.onPress());const after=JSON.stringify(screen.toJSON());expect(after).toContain('contextStageOne');expect(after).toContain('contextStageTwo');expect(after).toContain('gudtour-crisis-v2');expect(after).toContain('UPSTREAM_WEATHER_UNAVAILABLE');
 }finally{await act(async()=>screen.unmount());}
});
