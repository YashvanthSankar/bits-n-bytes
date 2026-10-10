import React, { type PropsWithChildren } from 'react';
import { act, create, type ReactTestRenderer } from 'react-test-renderer';
import { expect, it, vi } from 'vitest';
const state=vi.hoisted(()=>({push:vi.fn(),data:{nearestId:'near',partial:false,items:[{id:'near',name:'Nearest',status:'CLOSED',audience:'DEMO',distanceM:200,issuer:'City authority',address:'School Road',phone:'1234567890',accessInstruction:'Use the east gate',statusConfirmedAt:Date.now(),stale:true,accessRestricted:false}]}}));
vi.mock('convex/react',()=>({useConvexAuth:()=>({isAuthenticated:true}),useQuery:()=>state.data}));
vi.mock('expo-router',()=>({router:{push:state.push}}));
vi.mock('react-i18next',()=>({useTranslation:()=>({t:(key:string)=>key,i18n:{language:'en'}})}));
vi.mock('../src/session/LocationSession',()=>({useLocationSession:()=>({fix:{observedAt:Date.now()},signedOut:false})}));
vi.mock('../src/components/ui',()=>({AppText:({children}:PropsWithChildren)=><>{children}</>,ActionButton:(props:object)=>React.createElement('button',props)}));
import { NearestShelter } from '../src/components/NearestShelter';
it('opens raw nearest shelter while displaying its status and DEMO attribution',async()=>{
 Object.assign(globalThis,{IS_REACT_ACT_ENVIRONMENT:true});let screen!:ReactTestRenderer;
 await act(async()=>{screen=create(<NearestShelter/>);});try{
  expect(JSON.stringify(screen.toJSON())).toContain('shelterCLOSED');expect(JSON.stringify(screen.toJSON())).toContain('DEMO');
  await act(async()=>screen.root.findAllByType('button').find(b=>b.props.title==='shelterDetails')!.props.onPress());
  expect(state.push).toHaveBeenCalledWith({pathname:'/shelter/[id]',params:{id:'near'}});
 }finally{await act(async()=>screen.unmount());}
});

it('shows shelter address, issuer, instructions, contact and freshness directly in an emergency',async()=>{
 Object.assign(globalThis,{IS_REACT_ACT_ENVIRONMENT:true});let screen!:ReactTestRenderer;
 await act(async()=>{screen=create(<NearestShelter inline/>);});try{
  const text=JSON.stringify(screen.toJSON());for(const value of ['School Road','City authority','Use the east gate','1234567890','lastConfirmed','stale','shelterCLOSED','DEMO'])expect(text).toContain(value);
  expect(screen.root.findAllByType('button')).toHaveLength(0);
 }finally{await act(async()=>screen.unmount());}
});
