import React, { type PropsWithChildren } from 'react';
import { act, create, type ReactTestRenderer } from 'react-test-renderer';
import { afterEach, expect, it, vi } from 'vitest';
const state = vi.hoisted(() => ({ dismiss: vi.fn(), push: vi.fn(), now: Date.now(), path:'/settings', items:true, appState:'active', listener:null as null | ((state:string)=>void) }));
vi.mock('convex/react', () => ({ useConvexAuth: () => ({ isAuthenticated: true }), useMutation: () => state.dismiss, useQuery: () => ({locationFresh:true,locationObservedAt:state.now,items:state.items?[{id:'alert-one',exposureId:'exposure-one',revision:1,severity:'HIGH',publishedAt:1,needsAttention:true,locality:'Chennai',audience:'DEMO',hazard:'FLASH_FLOOD',proximity:'INSIDE'}]:[]}) }));
vi.mock('expo-router', () => ({ router: { push: state.push }, usePathname:()=>state.path }));
vi.mock('react-native', () => ({ AppState:{currentState:'active',addEventListener:(_event:string,listener:(value:string)=>void)=>{state.listener=listener;return{remove:vi.fn()};}},View: 'View', ScrollView: 'ScrollView', Modal: ({visible,children}:PropsWithChildren<{visible:boolean}>) => visible ? <section>{children}</section> : null }));
vi.mock('react-native-safe-area-context', () => ({useSafeAreaInsets:()=>({top:0,bottom:0})}));
vi.mock('react-i18next', () => ({useTranslation:()=>({t:(key:string)=>key})}));
vi.mock('../src/session/LocationSession', () => ({useLocationSession:()=>({fix:{point:{latitude:13,longitude:80}},signedOut:false})}));
vi.mock('../src/theme/useTheme', () => ({useTheme:()=>({})}));
vi.mock('../src/components/ui', () => ({ AppText: ({children}:PropsWithChildren)=><>{children}</>,ActionButton:(props:{title:string;onPress:()=>void})=>React.createElement('button',props) }));
import { EmergencyAlerts } from '../src/features/alerts/EmergencyAlerts';
let screen:ReactTestRenderer;
afterEach(async()=>{if(screen)await act(async()=>screen.unmount());vi.clearAllMocks();});
it('dismisses attention once while keeping the emergency warning and instructions accessible',async()=>{
 state.dismiss.mockResolvedValue({revision:1});await act(async()=>{screen=create(<><EmergencyAlerts/><EmergencyAlerts global /></>);});
 expect(screen.root.findAllByType('section')).toHaveLength(1);
 await act(async()=>screen.root.findAllByType('button').find(b=>b.props.title==='dismissPopup')!.props.onPress());
 expect(state.dismiss).toHaveBeenCalledExactlyOnceWith({alertId:'alert-one',revision:1});
 expect(screen.root.findAllByType('section')).toHaveLength(0);
 const open=screen.root.findAllByType('button').find(b=>b.props.title==='viewEmergency')!;
 await act(async()=>open.props.onPress());expect(state.push).toHaveBeenCalledWith({pathname:'/alert/[id]',params:{id:'alert-one'}});
});

it('reacts to a newly published alert while Settings is open and hides the popup in the background',async()=>{
 state.items=false;state.path='/settings';await act(async()=>{screen=create(<EmergencyAlerts global/>);});expect(screen.root.findAllByType('section')).toHaveLength(0);
 state.items=true;await act(async()=>screen.update(<EmergencyAlerts global/>));expect(screen.root.findAllByType('section')).toHaveLength(1);
 await act(async()=>state.listener?.('background'));expect(screen.root.findAllByType('section')).toHaveLength(0);
 await act(async()=>state.listener?.('active'));expect(screen.root.findAllByType('section')).toHaveLength(1);
 state.path='/login';await act(async()=>screen.update(<EmergencyAlerts global/>));expect(screen.root.findAllByType('section')).toHaveLength(0);
});
