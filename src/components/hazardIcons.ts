import { CloudLightning, Mountain, ThermometerSun, TriangleAlert, Waves, Wind } from 'lucide-react-native';
import type { HazardCode } from '../contracts/domain';
export const hazardIcons = {
  FLASH_FLOOD: Waves, FLOOD_WATERLOGGING: Waves, LANDSLIDE: Mountain, CYCLONE: Wind,
  SEVERE_STORM: CloudLightning, COASTAL_SURGE: Waves, HEATWAVE: ThermometerSun, OTHER_NATURAL: TriangleAlert,
} satisfies Record<HazardCode, typeof TriangleAlert>;
