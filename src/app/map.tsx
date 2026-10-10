import { useConvexAuth, useQuery } from 'convex/react';
import { router } from 'expo-router';
import { useEffect } from 'react';
import { NearbyMap } from '../components/NearbyMap';
import { useTranslation } from 'react-i18next';
import { ActionButton, AppText, EmptyState, LoadingState, Screen } from '../components/ui';
import { useLocationSession } from '../session/LocationSession';
import { api } from '../../convex/_generated/api';
import { ReadBoundary } from '../components/ReadBoundary';
import { IncidentCard } from '../components/IncidentCard';

function MapContent() {
  const { t } = useTranslation(); const { isLoading, isAuthenticated } = useConvexAuth(); const { fix } = useLocationSession();
  const nearby = useQuery(api.incidents.nearby,isAuthenticated && fix ? {} : 'skip');
  useEffect(() => { if (!isLoading && (!isAuthenticated || !fix)) router.replace('/location'); }, [isLoading, isAuthenticated, fix]);
  return <Screen footer={<ActionButton title={t('reportTitle')} onPress={()=>router.push('/report')} disabled={!isAuthenticated || !fix} />}><AppText variant="title" accessibilityRole="header">{t('mapTitle')}</AppText>
    {fix && <NearbyMap point={fix.point} incidents={nearby?.items ?? []} onIncidentPress={id=>router.push({pathname:'/incident/[id]',params:{id}})} />}
    <AppText variant="heading">{t('nearbyReports')} · 5 km</AppText>
    {!nearby ? <LoadingState /> : <>
      {nearby.partial && <AppText>{t('matchesPartial')}</AppText>}
      {nearby.items.length === 0 && <EmptyState title={t('noHazards')} message={t('noHazardsExplanation')} />}
      {nearby.items.map(incident=><IncidentCard key={incident.id} incident={incident} onPress={()=>router.push({pathname:'/incident/[id]',params:{id:incident.id}})} />)}
    </>}
    <ActionButton title={t('profileTitle')} variant="secondary" onPress={() => router.push('/profile')} />
    <ActionButton title={t('locationAction')} variant="secondary" onPress={() => router.replace('/location')} />
  </Screen>;
}
export default function MapScreen() { return <ReadBoundary><MapContent /></ReadBoundary>; }
