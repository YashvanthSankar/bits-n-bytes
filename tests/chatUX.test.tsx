import React, { type PropsWithChildren } from 'react';
import { act, create, type ReactTestRenderer } from 'react-test-renderer';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
const state=vi.hoisted(()=>({items:[] as Array<{id:string;body:string;alias:string;own:boolean;createdAt:number;expiresAt:number}>,age:10000,scroll:vi.fn(),send:vi.fn().mockResolvedValue({}),refresh:vi.fn().mockResolvedValue({})}));
vi.mock('lucide-react-native',()=>Object.fromEntries(['Navigation','Plus','ArrowUp','MessageCircle'].map(key=>[key,()=>null])));
vi.mock('expo-crypto',()=>({randomUUID:()=> 'chat-request-001'}));
vi.mock('expo-router',()=>({router:{push:vi.fn()},useFocusEffect:(callback:()=>void)=>React.useEffect(callback,[callback])}));
vi.mock('react-i18next',()=>({useTranslation:()=>({t:(key:string)=>key,i18n:{language:'en'}})}));
vi.mock('convex/react',()=>({useConvexAuth:()=>({isAuthenticated:true}),useConvexConnectionState:()=>({isWebSocketConnected:true}),useQuery:()=>React.useMemo(()=>({items:state.items,needsLocation:false,truncated:false}),[state.items]),useMutation:()=>state.send}));
vi.mock('../src/session/LocationSession',()=>({useLocationSession:()=>({fix:{point:{latitude:13.0827,longitude:80.2707},accuracyM:10,observedAt:Date.now()-state.age}})}));
vi.mock('../src/features/chat/useChatLocation',()=>({useChatLocation:()=>state.refresh}));
vi.mock('../src/navigation/NavigationInset',()=>({useNavigationInset:()=>0}));
vi.mock('../src/theme/useTheme',()=>({useTheme:()=>({})}));
vi.mock('../src/components/JourneyHeader',()=>({JourneyBrand:()=>null}));
vi.mock('../src/components/ReadBoundary',()=>({ReadBoundary:({children}:PropsWithChildren)=><>{children}</>}));
vi.mock('../src/components/ui',()=>({AppText:({children}:PropsWithChildren)=><>{children}</>,ActionButton:()=>null,LoadingState:()=>null}));
vi.mock('react-native-safe-area-context',()=>({SafeAreaView:({children}:PropsWithChildren)=><>{children}</>}));
vi.mock('react-native',()=>({View:'div',Pressable:'button',TextInput:'input',ActivityIndicator:()=>null,AppState:{currentState:'active',addEventListener:()=>({remove(){}})},Platform:{OS:'ios'},KeyboardAvoidingView:({children}:PropsWithChildren)=><>{children}</>,
 FlatList:React.forwardRef(function List(props:{data:object[];renderItem:(args:{item:object})=>React.ReactNode},ref){React.useImperativeHandle(ref,()=>({scrollToEnd:state.scroll}));return React.createElement('section',props,props.data.map((item,index)=>React.createElement(React.Fragment,{key:index},props.renderItem({item}))));})}));
import Chat from '../src/app/(tabs)/chat';
let screen:ReactTestRenderer;
const message=(id:string)=>({id,body:'Hello',alias:'Traveler',own:false,createdAt:Date.now(),expiresAt:Date.now()+86400000});
beforeEach(()=>{Object.assign(globalThis,{IS_REACT_ACT_ENVIRONMENT:true});vi.clearAllMocks();state.items=[message('1')];state.age=10000;});
afterEach(async()=>{await act(async()=>screen.unmount());});
it('keeps the composer inline and ensures location eligibility before sending the draft',async()=>{
 await act(async()=>{screen=create(<Chat/>);});
 await act(async()=>screen.root.findByType('input').props.onChangeText('Hello nearby'));
 const send=screen.root.findAllByType('button').find(node=>node.props.accessibilityLabel==='chatSend')!;
 expect(send.props.accessibilityState.disabled).toBe(false);
 await act(async()=>send.props.onPress());
 expect(state.refresh).toHaveBeenCalledExactlyOnceWith(false);expect(state.send).toHaveBeenCalledWith({body:'Hello nearby',requestId:'chat-request-001'});
 expect(state.refresh.mock.invocationCallOrder[0]).toBeLessThan(state.send.mock.invocationCallOrder[0]!);
 expect(screen.root.findByType('input').props.value).toBe('');
});
it('offers new messages without pulling a reader away from older content',async()=>{
 await act(async()=>{screen=create(<Chat/>);});
 await act(async()=>screen.root.findByType('section').props.onContentSizeChange());state.scroll.mockClear();
 await act(async()=>screen.root.findByType('section').props.onScroll({nativeEvent:{contentOffset:{y:0},contentSize:{height:2000},layoutMeasurement:{height:600}}}));
 state.items=[...state.items,message('2')];await act(async()=>screen.update(<Chat/>));
 await act(async()=>screen.root.findByType('section').props.onContentSizeChange());
 expect(state.scroll).not.toHaveBeenCalled();
 const latest=screen.root.findAllByType('button').find(node=>node.props.accessibilityLabel==='chatNewMessages')!;expect(latest).toBeDefined();
 await act(async()=>latest.props.onPress());expect(state.scroll).toHaveBeenCalledWith({animated:true});
 expect(screen.root.findAllByType('button').some(node=>node.props.accessibilityLabel==='chatNewMessages')).toBe(false);
});

it('automatically refreshes an expired location on chat entry without requiring the refresh button',async()=>{
 state.age=360000;await act(async()=>{screen=create(<Chat/>);});
 expect(state.refresh).toHaveBeenCalledExactlyOnceWith(true,false);
});
