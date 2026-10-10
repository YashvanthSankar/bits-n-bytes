import { EmergencyNoticeContent } from '../../features/alerts/EmergencyNotice';
import { useConvexAuth, useQuery } from 'convex/react';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { api } from '../../../convex/_generated/api';
import type { Id } from '../../../convex/_generated/dataModel';
import { ActionButton, AppText, LoadingState, Screen } from '../../components/ui';
import { ReadBoundary } from '../../components/ReadBoundary';
import { useLocationSession } from '../../session/LocationSession';

function Detail() {
  const { id } = useLocalSearchParams<{ id: string }>(), { t } = useTranslation();
  const { isAuthenticated } = useConvexAuth(), { fix, signedOut } = useLocationSession();
  const value = useQuery(api.alerts.detail, isAuthenticated && fix && !signedOut && typeof id === 'string' ? { alertId: id as Id<'alerts'> } : 'skip');
  const [now, setNow] = useState(Date.now);
  useEffect(() => { const timer = setInterval(() => setNow(Date.now()), 15_000); return () => clearInterval(timer); }, []);
  return <Screen footer={<>{value?.instructions.some(source => source.kind === 'COMMUNITY') && <ActionButton title={t('evidenceTitle')} onPress={() => router.push({pathname:'/incident/[id]',params:{id:value.incidentId}})} />}<ActionButton title={t('backToMap')} variant="secondary" onPress={() => router.replace('/map')} /></>}>
    {!value ? <LoadingState /> : <>
      <AppText variant="title">{value.audience === 'DEMO' ? 'DEMO · ' : ''}{t(value.lifecycle === 'ACTIVE' ? 'emergencyActive' : 'emergencyOriginal')}</AppText>
      <EmergencyNoticeContent value={value} now={now}/>
    </>}
  </Screen>;
}
export default function AlertDetail() { return <ReadBoundary><Detail /></ReadBoundary>; }
