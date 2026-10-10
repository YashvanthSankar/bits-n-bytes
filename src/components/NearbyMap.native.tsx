import { View } from 'react-native';
import MapView from 'react-native-maps';
import type { Point } from '../contracts/domain';
export function NearbyMap({ point }: { point: Point }) {
  return <View style={{ height: 420, borderRadius: 16, overflow: 'hidden' }}><MapView style={{ flex: 1 }} showsUserLocation initialRegion={{ ...point, latitudeDelta: 0.08, longitudeDelta: 0.08 }} /></View>;
}
