import { View } from 'react-native';
import MapView, { Circle, Marker, Polyline } from 'react-native-maps';
import { useTranslation } from 'react-i18next';
import type { Point, PublicIncident } from '../contracts/domain';
import { useTheme } from '../theme/useTheme';
import { circleOutline } from '../domain/circleOutline';
export function NearbyMap({ point, incidents = [], onIncidentPress }: { point: Point; incidents?: PublicIncident[]; onIncidentPress?: (id: string) => void }) {
  const { t } = useTranslation(); const theme = useTheme();
  return <View style={{ height: 420, borderRadius: 16, overflow: 'hidden' }}><MapView style={{ flex: 1 }} showsUserLocation initialRegion={{ ...point, latitudeDelta: 0.08, longitudeDelta: 0.08 }}>
    {incidents.map(incident => incident.geometry.type === 'circle' ? incident.verification === 'UNVERIFIED' ?
      <Polyline key={'area-'+incident.id} coordinates={circleOutline(incident.geometry.center,incident.geometry.radiusM)} lineDashPattern={[6,6]} strokeWidth={2}
        strokeColor={incident.qualification === 'NOTIFIABLE_EMERGENCY' ? theme.danger : theme.warning} /> : <Circle key={'area-'+incident.id} center={incident.geometry.center} radius={incident.geometry.radiusM}
      strokeColor={incident.qualification === 'NOTIFIABLE_EMERGENCY' ? theme.danger : theme.warning} fillColor="transparent" strokeWidth={2}
       /> : null)}
    {incidents.map(incident => incident.geometry.type === 'circle' ? <Marker key={incident.id} coordinate={incident.geometry.center}
      title={t(`hazard${incident.hazard}`)} description={t(`verification${incident.verification}`)} onCalloutPress={()=>onIncidentPress?.(incident.id)}
      pinColor={incident.qualification === 'NOTIFIABLE_EMERGENCY' ? theme.danger : theme.warning} /> : null)}
  </MapView></View>;
}
