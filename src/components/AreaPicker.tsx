import type { Point } from '../contracts/domain';
import { AppText } from './ui';
import { useTranslation } from 'react-i18next';
export function AreaPicker(_props: { center: Point | null; selected: Point | null; radiusM: number; onSelect: (point: Point) => void }) {
  const { t } = useTranslation(); return <AppText>{t('nativeRequired')}</AppText>;
}
