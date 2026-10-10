import type { Point, PublicIncident } from '../contracts/domain';
import { useTranslation } from 'react-i18next';
import { AppText } from './ui';
export function NearbyMap({ point: _point }: { point: Point; incidents?: PublicIncident[]; onIncidentPress?: (id:string)=>void; fullscreen?: boolean; topInset?: number; bottomInset?: number; recenter?: number }) {
  const { t } = useTranslation();
  return <AppText>{t('nativeRequired')}</AppText>;
}
