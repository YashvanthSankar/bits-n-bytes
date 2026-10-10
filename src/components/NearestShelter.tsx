import { useConvexAuth, useQuery } from 'convex/react';
import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { api } from '../../convex/_generated/api';
import { useLocationSession } from '../session/LocationSession';
import { ActionButton, AppText } from './ui';

/** Raw distance order, with maintained status shown separately. */
export function NearestShelter() {
  const { t } = useTranslation();
  const { isAuthenticated } = useConvexAuth();
  const { fix, signedOut } = useLocationSession();
  const listed = useQuery(api.shelters.nearby, isAuthenticated && fix && !signedOut ? {} : 'skip');
  const nearest = listed?.items.find(s => s.id === listed.nearestId);
  if (!listed) return null;
  return <>
    <AppText variant="heading">{t('nearestListedShelter')}</AppText>
    {listed.partial && <AppText>{t('matchesPartial')}</AppText>}
    {nearest ? <>
      <AppText>{nearest.audience === 'DEMO' ? 'DEMO · ' : ''}{nearest.name}</AppText>
      <AppText>{t(`shelter${nearest.status}`)} · {(nearest.distanceM / 1_000).toFixed(1)} km · {t('approximateDistance')}</AppText>
      <ActionButton title={t('shelterDetails')} onPress={() => router.push({ pathname: '/shelter/[id]', params: { id: nearest.id } })} />
    </> : <AppText>{t('shelterEmpty')}</AppText>}
    <ActionButton title={t('navShelters')} variant="secondary" onPress={() => router.push('/shelters')} />
  </>;
}
