import React, { type PropsWithChildren } from 'react';
import { act, create, type ReactTestRenderer } from 'react-test-renderer';
import { expect, it, vi } from 'vitest';
const state=vi.hoisted(()=>({push:vi.fn(),data:{nearestId:'near',partial:false,items:[{id:'near',name:'Nearest',status:'CLOSED',audience:'DEMO',distanceM:200}]}}));
vi.mock('convex/react',()=>({useConvexAuth:()=>({isAuthenticated:true}),useQuery:()=>state.data}));
vi.mock('expo-router',()=>({router:{push:state.push}}));
vi.mock('react-i18next',()=>({useTranslation:()=>({t:(key:string)=>key})}));
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
