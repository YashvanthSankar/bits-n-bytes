import { useConvexAuth, useQuery } from 'convex/react';
import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { api } from '../../convex/_generated/api';
import { useLocationSession } from '../session/LocationSession';
import { ActionButton, AppText } from './ui';

/** Raw distance order, with maintained status shown separately. */
export function NearestShelter({ inline = false }: { inline?: boolean }) {
  const { t, i18n } = useTranslation();
  const { isAuthenticated } = useConvexAuth();
  const { fix, signedOut } = useLocationSession();
  const listed = useQuery(api.shelters.nearby, isAuthenticated && fix && !signedOut ? {} : 'skip');
  const nearest = listed?.items.find(s => s.id === listed.nearestId);
  if (!listed) return <AppText>{t('loading')}</AppText>;
  return <>
    <AppText variant="heading">{t('nearestListedShelter')}</AppText>
    {listed.partial && <AppText>{t('matchesPartial')}</AppText>}
    {nearest ? <>
      <AppText>{nearest.audience === 'DEMO' ? 'DEMO · ' : ''}{nearest.name}</AppText>
      <AppText>{t(`shelter${nearest.status}`)} · {(nearest.distanceM / 1_000).toFixed(1)} km · {t('approximateDistance')}</AppText>
      {inline && <>
        <AppText>{nearest.issuer}</AppText><AppText selectable>{nearest.address}</AppText>
        {nearest.accessInstruction && <AppText selectable>{nearest.accessInstruction}</AppText>}
        {nearest.phone && <AppText selectable>{nearest.phone}</AppText>}
        <AppText variant="caption">{t('lastConfirmed')}: {new Date(nearest.statusConfirmedAt).toLocaleString(i18n.language,{month:'short',day:'numeric',hour:'numeric',minute:'2-digit'})}</AppText>
        {nearest.stale && <AppText>{t('stale')}</AppText>}
        {nearest.accessRestricted && <AppText>{t('shelterLimitACCESS_RESTRICTED')}</AppText>}
        <AppText variant="caption">{t('shelterRouteNotice')}</AppText>
      </>}
      {!inline && <ActionButton title={t('shelterDetails')} onPress={() => router.push({ pathname: '/shelter/[id]', params: { id: nearest.id } })} />}
    </> : <AppText>{t('shelterEmpty')}</AppText>}
    {!inline && <ActionButton title={t('navShelters')} variant="secondary" onPress={() => router.push('/shelters')} />}
  </>;
}
