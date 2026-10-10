import { useEffect, useRef, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import MapView, { Circle, Marker, Polyline } from 'react-native-maps';
import { useTranslation } from 'react-i18next';
import type { Point, PublicIncident } from '../contracts/domain';
import { useTheme } from '../theme/useTheme';
import { circleOutline } from '../domain/circleOutline';
export function NearbyMap({ point, incidents = [], onIncidentPress, fullscreen = false, topInset = 0, bottomInset = 0, recenter = 0 }: { point: Point; incidents?: PublicIncident[]; onIncidentPress?: (id: string) => void; fullscreen?: boolean; topInset?: number; bottomInset?: number; recenter?: number }) {
  const { t } = useTranslation(); const theme = useTheme();
  const map=useRef<MapView>(null);
  const [ready,setReady]=useState(false);
  useEffect(()=>{if(ready&&recenter>0)map.current?.animateToRegion({...point,latitudeDelta:0.08,longitudeDelta:0.08});},[ready,recenter,point]);
  return <View style={fullscreen ? StyleSheet.absoluteFill : { height: 420, borderRadius: 16, overflow: 'hidden' }}><MapView ref={map} style={{ flex: 1 }} showsUserLocation showsCompass={false}
    onMapReady={()=>setReady(true)}
    {...(ready ? {mapPadding:{top:topInset,bottom:bottomInset,left:16,right:16}} : {})} legalLabelInsets={{top:0,bottom:bottomInset,left:16,right:0}} initialRegion={{ ...point, latitudeDelta: 0.08, longitudeDelta: 0.08 }}>
    {incidents.map(incident => incident.geometry.type === 'circle' ? incident.verification === 'UNVERIFIED' ?
      <Polyline key={'area-'+incident.id} coordinates={circleOutline(incident.geometry.center,incident.geometry.radiusM)} lineDashPattern={[6,6]} strokeWidth={2}
        strokeColor={(incident.officialEmergency || incident.qualification === 'NOTIFIABLE_EMERGENCY') ? theme.danger : theme.warning} /> : <Circle key={'area-'+incident.id} center={incident.geometry.center} radius={incident.geometry.radiusM}
      strokeColor={(incident.officialEmergency || incident.qualification === 'NOTIFIABLE_EMERGENCY') ? theme.danger : theme.warning} fillColor="transparent" strokeWidth={2}
       /> : null)}
    {incidents.map(incident => incident.geometry.type === 'circle' ? <Marker key={incident.id} coordinate={incident.geometry.center}
      title={t(`hazard${incident.hazard}`)} description={t(`verification${incident.verification}`)} onCalloutPress={()=>onIncidentPress?.(incident.id)}
      pinColor={(incident.officialEmergency || incident.qualification === 'NOTIFIABLE_EMERGENCY') ? theme.danger : theme.warning} /> : null)}
  </MapView></View>;
}
