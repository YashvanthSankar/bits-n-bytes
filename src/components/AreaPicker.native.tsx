import { useEffect, useRef, useState } from 'react';
import MapView, { Circle, Marker } from 'react-native-maps';
import type { Point } from '../contracts/domain';
import { useTheme } from '../theme/useTheme';
export function AreaPicker({ center, selected, radiusM, onSelect }: { center: Point | null; selected: Point | null; radiusM: number; onSelect: (point: Point) => void }) {
  const theme = useTheme(), map = useRef<MapView>(null);
  const [ready,setReady]=useState(false);
  useEffect(() => { if (ready && selected) map.current?.animateToRegion({...selected, latitudeDelta:Math.max(.02,radiusM/30_000),longitudeDelta:Math.max(.02,radiusM/30_000)}); },[ready,selected,radiusM]);
  return <MapView ref={map} onMapReady={()=>setReady(true)} style={{flex:1}} initialRegion={{...(selected ?? center ?? {latitude:22,longitude:79}),latitudeDelta:selected || center ? .12 : 25,longitudeDelta:selected || center ? .12 : 25}}
    onPress={event=>onSelect({latitude:event.nativeEvent.coordinate.latitude,longitude:event.nativeEvent.coordinate.longitude})}>
    {selected && <><Marker coordinate={selected} draggable onDragEnd={event=>onSelect(event.nativeEvent.coordinate)} />
      {radiusM > 0 && <Circle center={selected} radius={radiusM} strokeColor={theme.accent} fillColor={theme.accent+'22'} strokeWidth={2} />}</>}
  </MapView>;
}
