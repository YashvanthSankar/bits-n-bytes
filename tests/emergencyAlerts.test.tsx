import { getFunctionName } from 'convex/server';
import React, { type PropsWithChildren } from 'react';
import { act, create, type ReactTestRenderer } from 'react-test-renderer';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
const state = vi.hoisted(() => ({ dismiss: vi.fn(), push: vi.fn(), now: Date.now(), path:'/settings', items:true, updates:false, appState:'active', detailReady:true, listener:null as null | ((state:string)=>void) }));
vi.mock('convex/react', () => ({ useConvexAuth: () => ({ isAuthenticated: true }), useMutation: () => state.dismiss, useQuery: (ref: Parameters<typeof getFunctionName>[0]) => getFunctionName(ref) === 'alerts:detail' ? state.detailReady ? ({revision:state.updates?2:1,audience:'DEMO',severity:'CRITICAL',lifecycle:state.updates?'ENDED':'ACTIVE',locality:'Chennai',locationFresh:true,locationObservedAt:state.now,proximity:'INSIDE',instructions:[{sourceId:'authority-source',issuer:'DEMO Authority',active:!state.updates,originalText:'Move to the school shelter. Do not cross the river.',sourceLanguage:'en',issuedAt:state.now,deadlineAt:null,reviewDueAt:null,reviewOverdue:false,appliesToCurrentLocation:true,translation:null}]}) : undefined : ({locationFresh:true,locationObservedAt:state.now,updates:state.updates?[{id:'alert-one',exposureId:'exposure-one',revision:2,locality:'Chennai',audience:'DEMO',kind:'CORRECTION',ended:true}]:[],items:state.items?[{id:'alert-one',exposureId:'exposure-one',revision:1,severity:'HIGH',publishedAt:1,needsAttention:true,locality:'Chennai',audience:'DEMO',hazard:'FLASH_FLOOD',proximity:'INSIDE'}]:[]}) }));
vi.mock('lucide-react-native', () => ({ ChevronRight: 'ChevronRight', Radio: 'Radio' }));
vi.mock('expo-router', () => ({ router: { push: state.push }, usePathname:()=>state.path }));
vi.mock('react-native', () => ({ AppState:{currentState:'active',addEventListener:(_event:string,listener:(value:string)=>void)=>{state.listener=listener;return{remove:vi.fn()};}},View: 'View', Pressable: 'Pressable', ScrollView: 'ScrollView', Modal: ({visible,children}:PropsWithChildren<{visible:boolean}>) => visible ? <section>{children}</section> : null }));
vi.mock('react-native-safe-area-context', () => ({useSafeAreaInsets:()=>({top:0,bottom:0})}));
vi.mock('react-i18next', () => ({useTranslation:()=>({t:(key:string)=>key,i18n:{language:'en'}})}));
vi.mock('../src/session/LocationSession', () => ({useLocationSession:()=>({fix:{point:{latitude:13,longitude:80}},signedOut:false})}));
vi.mock('../src/theme/useTheme', () => ({useTheme:()=>({})}));
vi.mock('../src/components/ui', () => ({ AppText: ({children}:PropsWithChildren)=><>{children}</>,LoadingState:()=> <span>loading</span>,ActionButton:(props:{title:string;onPress:()=>void})=>React.createElement('button',props) }));
vi.mock('../src/components/NearestShelter', () => ({ NearestShelter: ({inline}:{inline:boolean}) => <span>{inline ? 'Nearest school shelter · Main Road · OPEN' : 'shelter'}</span> }));
import { EmergencyAlerts } from '../src/features/alerts/EmergencyAlerts';
let screen:ReactTestRenderer;
beforeEach(()=>{state.items=true;state.updates=false;state.detailReady=true;state.path='/settings';});
afterEach(async()=>{if(screen)await act(async()=>screen.unmount());vi.clearAllMocks();});
it('dismisses attention once while keeping the emergency warning and instructions accessible',async()=>{
 state.dismiss.mockResolvedValue({revision:1});await act(async()=>{screen=create(<><EmergencyAlerts/><EmergencyAlerts global /></>);});
 expect(screen.root.findAllByType('section')).toHaveLength(1);
 await act(async()=>screen.root.findAllByType('button').find(b=>b.props.title==='dismissPopup')!.props.onPress());
 expect(state.dismiss).toHaveBeenCalledExactlyOnceWith({alertId:'alert-one',revision:1});
 expect(screen.root.findAllByType('section')).toHaveLength(0);
 const text=JSON.stringify(screen.toJSON());
 expect(text).toContain('Move to the school shelter. Do not cross the river.');
 expect(text).toContain('DEMO Authority');expect(text).toContain('severityCRITICAL');expect(text).toContain('Nearest school shelter');
 expect(screen.root.findAllByType('button').some(b=>b.props.title==='viewEmergency')).toBe(false);
 expect(state.push).not.toHaveBeenCalled();
});

it('reacts to a newly published alert while Settings is open and hides the popup in the background',async()=>{
 state.items=false;state.path='/settings';await act(async()=>{screen=create(<EmergencyAlerts global/>);});expect(screen.root.findAllByType('section')).toHaveLength(0);
 state.items=true;await act(async()=>screen.update(<EmergencyAlerts global/>));expect(screen.root.findAllByType('section')).toHaveLength(1);
 await act(async()=>state.listener?.('background'));expect(screen.root.findAllByType('section')).toHaveLength(0);
 await act(async()=>state.listener?.('active'));expect(screen.root.findAllByType('section')).toHaveLength(1);
 state.path='/login';await act(async()=>screen.update(<EmergencyAlerts global/>));expect(screen.root.findAllByType('section')).toHaveLength(0);
});

it('presents corrections with a distinct notice title and acknowledges the corrected revision',async()=>{
 state.items=false;state.updates=true;state.dismiss.mockResolvedValue({revision:2});await act(async()=>{screen=create(<EmergencyAlerts global/>);});
 const text=JSON.stringify(screen.toJSON());expect(text).toContain('alertCorrected');expect(text).not.toContain('emergencyActive');
 await act(async()=>screen.root.findAllByType('button').find(b=>b.props.title==='dismissPopup')!.props.onPress());expect(state.dismiss).toHaveBeenCalledWith({alertId:'alert-one',revision:2});expect(screen.root.findAllByType('section')).toHaveLength(0);
});

it('shows the full notice and nearest shelter in the first popup without filler or a read button',async()=>{
 await act(async()=>{screen=create(<EmergencyAlerts global/>);});
 const rendered=JSON.stringify(screen.toJSON());expect(rendered).toContain('Move to the school shelter. Do not cross the river.');
 expect(rendered).toContain('DEMO Authority');expect(rendered).toContain('severityCRITICAL');expect(rendered).toContain('Nearest school shelter');
 expect(rendered).not.toContain('emergencyNearby');expect(rendered).not.toContain('emergencyStillAvailable');
 expect(screen.root.findAllByType('button').map(b=>b.props.title)).toEqual(['dismissPopup']);
});
it('loads instruction content in place while keeping dismissal available',async()=>{
 state.detailReady=false;await act(async()=>{screen=create(<EmergencyAlerts global/>);});
 expect(JSON.stringify(screen.toJSON())).toContain('loading');
 state.detailReady=true;await act(async()=>screen.update(<EmergencyAlerts global/>));
 expect(JSON.stringify(screen.toJSON())).toContain('Move to the school shelter. Do not cross the river.');
});

it('keeps the compact map notice attributed and opens the full instructions', async () => {
 await act(async () => { screen = create(<EmergencyAlerts compact />); });
 const notice = screen.root.find(node => String(node.type) === 'Pressable');
 expect(notice.props.accessibilityLabel).toContain('DEMO');
 expect(notice.props.accessibilityLabel).toContain('hazardFLASH_FLOOD');
 expect(notice.props.accessibilityLabel).toContain('severityHIGH');
 expect(notice.props.accessibilityLabel).toContain('Chennai');
 await act(async () => notice.props.onPress());
 expect(state.push).toHaveBeenCalledWith({ pathname: '/alert/[id]', params: { id: 'alert-one' } });
});
