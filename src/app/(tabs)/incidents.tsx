import { Plus } from 'lucide-react-native';
import { useConvexAuth, useQuery } from 'convex/react';
import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { api } from '../../../convex/_generated/api';
import { ActionButton, AppText, EmptyState, LoadingState, Screen } from '../../components/ui';
import { IncidentCard } from '../../components/IncidentCard';
import { ReadBoundary } from '../../components/ReadBoundary';
import { useLocationSession } from '../../session/LocationSession';

import { EmergencyAlerts } from '../../features/alerts/EmergencyAlerts';

function Incidents() {
  const { t } = useTranslation(); const { isAuthenticated } = useConvexAuth(); const { fix } = useLocationSession();
  const nearby = useQuery(api.incidents.nearby, isAuthenticated && fix ? {} : 'skip');
  return <Screen footer={<ActionButton icon={Plus} title={t('reportTitle')} onPress={() => router.push('/report')} disabled={!isAuthenticated || !fix} />}>
    <AppText variant="title" accessibilityRole="header">{t('navIncidents')}</AppText><AppText variant="caption">{t('nearbyReports')} · 5 km</AppText>
    <EmergencyAlerts />
    {!isAuthenticated || !fix ? <ActionButton title={t('locationAction')} onPress={() => router.replace('/location')} /> : !nearby ? <LoadingState /> : <>
      {nearby.partial && <AppText>{t('matchesPartial')}</AppText>}
      {!nearby.items.length && <EmptyState title={t('noHazards')} message={t('noHazardsExplanation')} />}
      {nearby.items.map(item => <IncidentCard key={item.id} incident={item} onPress={() => router.push({ pathname: '/incident/[id]', params: { id: item.id } })} />)}
    </>}
  </Screen>;
}
export default function IncidentsScreen() { return <ReadBoundary><Incidents /></ReadBoundary>; }
