import React, { type PropsWithChildren, type ReactNode } from 'react';
import { act, create, type ReactTestRenderer } from 'react-test-renderer';
import { expect, it, vi } from 'vitest';
const state=vi.hoisted(()=>({back:vi.fn(),replace:vi.fn(),canGoBack:true}));
vi.mock('lucide-react-native',()=>({ArrowLeft:()=>null}));
vi.mock('convex/react',()=>({useConvexAuth:()=>({isAuthenticated:true}),useQuery:()=>({id:'notice-test',headline:'Official warning',issuer:'Test issuing authority',severity:'Severe',urgency:'Immediate',certainty:'Observed',active:true,expired:true,stale:false,issuedAt:Date.now()-3600000,effectiveAt:null,onsetAt:null,expiresAt:Date.now()-1,geometryPending:true,areaDescriptions:['Published district'],language:'en-IN',identifier:'test-id',revision:2,sourceUrl:'https://sachet.ndma.gov.in/cap_public_website/FetchXMLFile?identifier=test',infoBlocks:[{description:'Original details',instruction:'Do not cross the river.'},{headline:'Second warning',event:'Flood',areaDescriptions:['Second district'],severity:'Severe',urgency:'Immediate',expiresAt:null,description:'Second published block',instruction:'Evacuate by 18:00.'}]})}));
vi.mock('expo-router',()=>({useLocalSearchParams:()=>({id:'notice-test'}),router:{replace:state.replace,back:state.back,canGoBack:()=>state.canGoBack}}));
vi.mock('react-native',()=>({View:'View',Pressable:'button'}));
vi.mock('react-i18next',()=>({useTranslation:()=>({t:(key:string)=>key,i18n:{language:'en'}})}));
vi.mock('../src/theme/useTheme',()=>({useTheme:()=>({})}));
vi.mock('../src/components/ReadBoundary',()=>({ReadBoundary:({children}:PropsWithChildren)=><>{children}</>}));
vi.mock('../src/components/ui',()=>({Screen:({children,footer}:PropsWithChildren<{footer:ReactNode}>)=><>{children}{footer}</>,AppText:({children}:PropsWithChildren)=><>{children}</>,LoadingState:()=>null,ActionButton:(props:object)=>React.createElement('button',props)}));
import Detail from '../src/app/sachet/[id]';
it('formats original instructions from every selected-language block and labels expired notices',async()=>{
 Object.assign(globalThis,{IS_REACT_ACT_ENVIRONMENT:true});let screen!:ReactTestRenderer;await act(async()=>{screen=create(<Detail/>);});try{
  const text=JSON.stringify(screen.toJSON());expect(text).toContain('Do not cross the river.');expect(text).toContain('Evacuate by 18:00.');expect(text).toContain('sachetExpired');expect(text).toContain('sachetGeometryPending');
  expect(text).not.toContain('sachetOriginalXml');
  const back=screen.root.findByType('button');
  expect(back.props.accessibilityLabel).toBe('sachetBack');
  await act(async()=>back.props.onPress());expect(state.back).toHaveBeenCalledTimes(1);
  state.canGoBack=false;await act(async()=>back.props.onPress());expect(state.replace).toHaveBeenCalledWith('/sachet');
 }finally{await act(async()=>screen.unmount());}
});
