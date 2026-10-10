import React, { forwardRef, useImperativeHandle } from 'react';
import { act, create, type ReactTestRenderer } from 'react-test-renderer';
import { expect, it, vi } from 'vitest';
const state=vi.hoisted(()=>({animate:vi.fn()}));
vi.mock('react-native',()=>({View:'View',StyleSheet:{absoluteFill:{position:'absolute'}}}));
vi.mock('react-native-maps',()=>({
 default:forwardRef(function MockMap(props:object,ref){useImperativeHandle(ref,()=>({animateToRegion:state.animate}));return React.createElement('map',props);}),
 Circle:'Circle',Marker:'Marker',Polyline:'Polyline',
}));
vi.mock('react-i18next',()=>({useTranslation:()=>({t:(key:string)=>key})}));
vi.mock('../src/theme/useTheme',()=>({useTheme:()=>({accent:'#008080'})}));
import { NearbyMap } from '../src/components/NearbyMap.native';
import { AreaPicker } from '../src/components/AreaPicker.native';
const point={latitude:13.08,longitude:80.27};
it('omits padding and camera commands until the native map is ready, including remount',async()=>{
 Object.assign(globalThis,{IS_REACT_ACT_ENVIRONMENT:true});state.animate.mockClear();let screen!:ReactTestRenderer;
 await act(async()=>{screen=create(<NearbyMap point={point} recenter={1} topInset={40} bottomInset={120}/>);});
 try{
  expect(screen.root.findByType('map').props).not.toHaveProperty('mapPadding');expect(state.animate).not.toHaveBeenCalled();
  await act(async()=>screen.root.findByType('map').props.onMapReady());
  expect(screen.root.findByType('map').props.mapPadding).toEqual({top:40,bottom:120,left:16,right:16});expect(state.animate).toHaveBeenCalledTimes(1);
  await act(async()=>screen.update(<NearbyMap key="new" point={point} recenter={1}/>));
  expect(screen.root.findByType('map').props).not.toHaveProperty('mapPadding');expect(state.animate).toHaveBeenCalledTimes(1);
 }finally{await act(async()=>screen.unmount());}
});
it('defers selected-area camera animation until the picker map is ready',async()=>{
 state.animate.mockClear();let screen!:ReactTestRenderer;await act(async()=>{screen=create(<AreaPicker center={point} selected={point} radiusM={1000} onSelect={()=>{}}/>);});
 try{expect(state.animate).not.toHaveBeenCalled();await act(async()=>screen.root.findByType('map').props.onMapReady());expect(state.animate).toHaveBeenCalledTimes(1);}
 finally{await act(async()=>screen.unmount());}
});
