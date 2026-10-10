vi.mock('../src/services/onboarding', () => ({ rememberCompletedSetup: vi.fn().mockResolvedValue(undefined) }));
import React, { useState, createContext, type PropsWithChildren, type ReactNode } from 'react';
import { act, create, type ReactTestRenderer } from 'react-test-renderer';
import { expect, it, vi } from 'vitest';
const Focus = createContext(true);
const state=vi.hoisted(()=>({authenticated:true,signOut:vi.fn(),signIn:vi.fn(),browser:vi.fn(),replace:vi.fn(),permission:vi.fn(),locate:vi.fn(),navigate:null as null | ((path:string)=>void)}));
vi.mock('lucide-react-native', () => Object.fromEntries(['UserRound','ShieldCheck','RefreshCw','LocateFixed','LogOut','FlaskConical','Languages','ChevronRight','ChevronDown'].map(name => [name, () => null])));
vi.mock('@convex-dev/auth/react',()=>({useAuthActions:()=>({signOut:state.signOut,signIn:state.signIn})}));
vi.mock('react-native',()=>({View:'View',Pressable:'Pressable',Platform:{OS:'ios'}}));
vi.mock('react-native-svg',()=>({default:'Svg',Circle:'Circle',Path:'Path',Rect:'Rect',G:'G',Ellipse:'Ellipse'}));
vi.mock('expo-router',()=>({useFocusEffect:(callback:()=>void)=>{const focused=React.useContext(Focus);React.useEffect(()=>focused?callback():undefined,[focused,callback]);},router:{replace:(path:string)=>{state.replace(path);state.navigate?.(path);},push:vi.fn()}}));
vi.mock('expo-linking',()=>({createURL:()=> 'gudtour://auth/callback'}));
vi.mock('expo-location',()=>({getForegroundPermissionsAsync:state.permission}));
vi.mock('../src/services/location',()=>({currentIndiaFix:state.locate,LocationFailure:class extends Error{}}));
vi.mock('expo-crypto',()=>({randomUUID:()=> 'request-test-001'}));
vi.mock('expo-web-browser',()=>({openAuthSessionAsync:state.browser}));
vi.mock('convex/react',()=>({useConvexAuth:()=>({isAuthenticated:state.authenticated,isLoading:false}),useQuery:()=>({role:'TOURIST',profile:{name:'Test',alias:'Traveler',revision:1,language:'en',stepFreeNeeded:false}}),useMutation:()=>vi.fn()}));
vi.mock('react-i18next',()=>({useTranslation:()=>({t:(key:string)=>key,i18n:{language:'en'}})}));
vi.mock('../src/i18n/LanguageProvider',()=>({useLanguage:()=>({language:'en',changeLanguage:vi.fn()})}));
vi.mock('../src/theme/useTheme',()=>({useTheme:()=>({})}));
vi.mock('../src/components/Choice',()=>({Choice:()=>null}));
vi.mock('../src/components/ReadBoundary',()=>({ReadBoundary:({children}:PropsWithChildren)=><>{children}</>}));
vi.mock('../src/components/ui',()=>({Screen:({children,footer}:PropsWithChildren<{footer:ReactNode}>)=><>{children}{footer}</>,AppText:({children}:PropsWithChildren)=><>{children}</>,LoadingState:()=>null,ActionButton:(props:object)=>React.createElement('button',props)}));
import { LocationSession } from '../src/session/LocationSession';
import Settings from '../src/app/(tabs)/settings';
import Login from '../src/app/login';
import LocationScreen from '../src/app/location';
function Routes(){const [path,setPath]=useState('/settings');state.navigate=setPath;return <><Focus.Provider value={path==='/settings'}><Settings/></Focus.Provider><Focus.Provider value={path==='/login'}><Login/></Focus.Provider><Focus.Provider value={path==='/location'}><LocationScreen/></Focus.Provider></>;}
it('stays on login after logout even while the server auth hook briefly reports authenticated',async()=>{
 Object.assign(globalThis,{IS_REACT_ACT_ENVIRONMENT:true});vi.clearAllMocks();state.permission.mockResolvedValue({granted:true});state.authenticated=true;state.signOut.mockResolvedValue(undefined);let screen!:ReactTestRenderer;
 await act(async()=>{screen=create(<LocationSession><Routes/></LocationSession>);});
 try{
  await act(async()=>screen.root.findAll(node=>node.props.title==='signOut' && typeof node.props.onPress==='function')[0]!.props.onPress());
  expect(state.replace.mock.calls).toEqual([['/login']]);
  expect(state.permission).not.toHaveBeenCalled();expect(state.locate).not.toHaveBeenCalled();
  expect(JSON.stringify(screen.toJSON())).toContain('googleSignIn');
  state.authenticated=false;
  await act(async()=>screen.update(<LocationSession><Routes/></LocationSession>));
  expect(state.replace.mock.calls).toEqual([['/login']]);
  expect(state.permission).not.toHaveBeenCalled();expect(state.locate).not.toHaveBeenCalled();
 }finally{await act(async()=>screen.unmount());state.navigate=null;}
});

it('starts Google login directly after logout by capturing GPS without reopening location onboarding', async () => {
 Object.assign(globalThis,{IS_REACT_ACT_ENVIRONMENT:true});vi.clearAllMocks();state.authenticated=true;state.signOut.mockResolvedValue(undefined);
 state.locate.mockResolvedValue({fix:{point:{latitude:13.0827,longitude:80.2707},accuracyM:10,observedAt:Date.now()}});
 state.signIn.mockResolvedValue({redirect:new URL('https://example.test/oauth')});state.browser.mockResolvedValue({type:'cancel'});
 let screen!:ReactTestRenderer;
 await act(async()=>{screen=create(<LocationSession><Routes/></LocationSession>);});
 try{
  await act(async()=>screen.root.findAll(node=>node.props.title==='signOut' && typeof node.props.onPress==='function')[0]!.props.onPress());
  state.authenticated=false;await act(async()=>screen.update(<LocationSession><Routes/></LocationSession>));
  await act(async()=>screen.root.findByType(Login).findAllByType('button').find(b=>b.props.title==='googleSignIn')!.props.onPress());
  expect(state.locate).toHaveBeenCalledTimes(1);expect(state.signIn).toHaveBeenCalledWith('google',expect.any(Object));expect(state.browser).toHaveBeenCalledTimes(1);
  expect(state.replace.mock.calls).toEqual([['/login']]);
 }finally{await act(async()=>screen.unmount());state.navigate=null;}
});
