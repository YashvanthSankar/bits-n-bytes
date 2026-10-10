import type { Point } from '../contracts/domain';
import { useTranslation } from 'react-i18next';
import { AppText } from './ui';
export function NearbyMap({ point: _point }: { point: Point }) {
  const { t } = useTranslation();
  return <AppText>{t('nativeRequired')}</AppText>;
}
