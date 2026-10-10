import React, { type PropsWithChildren, type ReactNode } from 'react';
import { act, create, type ReactTestRenderer } from 'react-test-renderer';
import { expect, it, vi } from 'vitest';
const state=vi.hoisted(()=>({open:vi.fn().mockResolvedValue(undefined)}));
vi.mock('convex/react',()=>({useConvexAuth:()=>({isAuthenticated:true}),useQuery:()=>({id:'notice-test',headline:'Official warning',issuer:'Test issuing authority',severity:'Severe',urgency:'Immediate',certainty:'Observed',active:true,expired:true,stale:false,issuedAt:Date.now()-3600000,effectiveAt:null,onsetAt:null,expiresAt:Date.now()-1,geometryPending:true,areaDescriptions:['Published district'],language:'en-IN',identifier:'test-id',revision:2,sourceUrl:'https://sachet.ndma.gov.in/cap_public_website/FetchXMLFile?identifier=test',infoBlocks:[{description:'Original details',instruction:'Do not cross the river.'},{headline:'Second warning',event:'Flood',areaDescriptions:['Second district'],severity:'Severe',urgency:'Immediate',expiresAt:null,description:'Second published block',instruction:'Evacuate by 18:00.'}]})}));
vi.mock('expo-router',()=>({useLocalSearchParams:()=>({id:'notice-test'}),router:{replace:vi.fn()}}));
vi.mock('react-native',()=>({View:'View',Linking:{openURL:state.open}}));
vi.mock('react-i18next',()=>({useTranslation:()=>({t:(key:string)=>key,i18n:{language:'en'}})}));
vi.mock('../src/theme/useTheme',()=>({useTheme:()=>({})}));
vi.mock('../src/components/ReadBoundary',()=>({ReadBoundary:({children}:PropsWithChildren)=><>{children}</>}));
vi.mock('../src/components/ui',()=>({Screen:({children,footer}:PropsWithChildren<{footer:ReactNode}>)=><>{children}{footer}</>,AppText:({children}:PropsWithChildren)=><>{children}</>,LoadingState:()=>null,ActionButton:(props:object)=>React.createElement('button',props)}));
import Detail from '../src/app/sachet/[id]';
it('formats original instructions from every selected-language block and labels expired notices',async()=>{
 Object.assign(globalThis,{IS_REACT_ACT_ENVIRONMENT:true});let screen!:ReactTestRenderer;await act(async()=>{screen=create(<Detail/>);});try{
  const text=JSON.stringify(screen.toJSON());expect(text).toContain('Do not cross the river.');expect(text).toContain('Evacuate by 18:00.');expect(text).toContain('sachetExpired');expect(text).toContain('sachetGeometryPending');
  await act(async()=>screen.root.findAllByType('button').find(b=>b.props.title==='sachetOriginalXml')!.props.onPress());expect(state.open).toHaveBeenCalledWith('https://sachet.ndma.gov.in/cap_public_website/FetchXMLFile?identifier=test');
 }finally{await act(async()=>screen.unmount());}
});
