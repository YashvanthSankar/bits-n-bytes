import { useConvexAuth, useQuery } from 'convex/react';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { POLICY } from '../../domain/policy';
import { View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { api } from '../../../convex/_generated/api';
import type { Id } from '../../../convex/_generated/dataModel';
import { ActionButton, AppText, LoadingState, Screen } from '../../components/ui';
import { NearestShelter } from '../../components/NearestShelter';
import { ReadBoundary } from '../../components/ReadBoundary';
import { useLocationSession } from '../../session/LocationSession';
import { useTheme } from '../../theme/useTheme';

function Detail() {
  const { id } = useLocalSearchParams<{ id: string }>(), { t, i18n } = useTranslation(), theme = useTheme();
  const { isAuthenticated } = useConvexAuth(), { fix, signedOut } = useLocationSession();
  const value = useQuery(api.alerts.detail, isAuthenticated && fix && !signedOut && typeof id === 'string' ? { alertId: id as Id<'alerts'> } : 'skip');
  const [now, setNow] = useState(Date.now);
  useEffect(() => { const timer = setInterval(() => setNow(Date.now()), 15_000); return () => clearInterval(timer); }, []);
  const fresh = value?.locationFresh && now - value.locationObservedAt <= POLICY.alertFix.maxAgeMs;
  const date = (time: number) => new Date(time).toLocaleString(i18n.language);
  return <Screen footer={<>{value?.instructions.some(source => source.kind === 'COMMUNITY') && <ActionButton title={t('evidenceTitle')} onPress={() => router.push({pathname:'/incident/[id]',params:{id:value.incidentId}})} />}<ActionButton title={t('backToMap')} variant="secondary" onPress={() => router.replace('/map')} /></>}>
    {!value ? <LoadingState /> : <>
      <AppText variant="title">{value.audience === 'DEMO' ? 'DEMO · ' : ''}{t(value.lifecycle === 'ACTIVE' ? 'emergencyActive' : 'emergencyOriginal')}</AppText>
      <AppText variant="heading">{value.locality}</AppText><AppText>{value.severity} · {value.lifecycle}</AppText>
      {!fresh && <AppText style={{ color: theme.warning }}>{t('emergencyLocationOld')}</AppText>}
      {value.proximity === 'OUTSIDE' && <AppText>{t('emergencyOutside')}</AppText>}
      {value.instructions.map(source => <View key={source.sourceId} style={{ padding: 16, gap: 12, borderRadius: 20, backgroundColor: theme.surface, borderWidth: 1, borderColor: theme.border }}>
        <AppText variant="heading">{source.issuer}</AppText>
        {!source.active && <AppText>{t('emergencySourceEnded')}</AppText>}<AppText variant="caption">{t('emergencyIssued')}: {date(source.issuedAt)}</AppText>
        {(source.reviewOverdue || (source.reviewDueAt !== null && source.reviewDueAt < now)) && <AppText style={{ color: theme.warning }}>{t('emergencyReviewOverdue')}</AppText>}
        {source.appliesToCurrentLocation === false && <AppText>{t('emergencyOutside')}</AppText>}
        {source.deadlineAt !== null && <AppText style={{ fontWeight: '700' }}>{t('emergencyDeadline')}: {date(source.deadlineAt)}</AppText>}
        {source.originalText !== null ? <><AppText variant="heading">{t('emergencyOriginal')} · {source.sourceLanguage ?? '—'}</AppText><AppText selectable>{source.originalText}</AppText></> : <AppText>{t(source.kind === 'COMMUNITY' ? 'modelEvidenceNotice' : 'emergencyNoOriginal')}</AppText>}
        {source.translation?.status === 'READY' && source.translation.language === i18n.language && source.translation.text ? <>
          <AppText variant="heading">{t('emergencyMachineTranslation')}</AppText>
          <AppText selectable>{source.translation.text}</AppText><AppText variant="caption">{t('emergencyTranslationReview')}</AppText>
        </> : source.originalText !== null && source.sourceLanguage !== null && source.sourceLanguage !== i18n.language && <AppText variant="caption">{t(source.translation?.status === 'FAILED' || source.translation?.status === 'FLAGGED' ? 'emergencyTranslationUnavailable' : 'emergencyTranslationPending')}</AppText>}
      </View>)}
      {value.lifecycle === 'ACTIVE' && <NearestShelter />}
    </>}
  </Screen>;
}
export default function AlertDetail() { return <ReadBoundary><Detail /></ReadBoundary>; }
