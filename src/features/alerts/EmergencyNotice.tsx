import { useQuery } from 'convex/react';
import type { FunctionReturnType } from 'convex/server';
import { Component, type PropsWithChildren } from 'react';
import { View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { api } from '../../../convex/_generated/api';
import type { Id } from '../../../convex/_generated/dataModel';
import { ActionButton, AppText, LoadingState } from '../../components/ui';
import { NearestShelter } from '../../components/NearestShelter';
import { useTheme } from '../../theme/useTheme';
import { POLICY } from '../../domain/policy';

type AlertDetail = FunctionReturnType<typeof api.alerts.detail>;
/** Same attributed instructions in the first popup, persistent card, and full notice. */
export function EmergencyNoticeContent({ value, now }: { value: AlertDetail; now: number }) {
  const { t, i18n } = useTranslation(); const theme = useTheme();
  const fresh = value.locationFresh && now - value.locationObservedAt <= POLICY.alertFix.maxAgeMs;
  const date = (time: number) => new Date(time).toLocaleString(i18n.language, { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' });
  return <View style={{ gap: 16 }}>
    <View style={{ gap: 4 }}>
      <AppText variant="heading">{value.locality}</AppText>
      <AppText style={{ color: theme.danger, fontWeight: '700' }}>{value.audience === 'DEMO' ? 'DEMO · ' : ''}{t(`severity${value.severity}`)} · {t(value.lifecycle === 'ACTIVE' ? 'emergencyActive' : 'alertSourceEnded')}</AppText>
    </View>
    {!fresh && <AppText style={{ color: theme.warning }}>{t('emergencyLocationOld')}</AppText>}
    {value.proximity === 'OUTSIDE' && <AppText>{t('emergencyOutside')}</AppText>}
    {value.proximity === 'POSSIBLE_PROXIMITY' && <AppText variant="caption">{t('emergencyPossible')}</AppText>}
    {value.instructions.map(source => <View key={source.sourceId} style={{ padding: 16, gap: 10, borderRadius: 20, backgroundColor: theme.muted, borderWidth: 1, borderColor: theme.border }}>
      <AppText variant="heading">{source.issuer}</AppText>
      {!source.active && <AppText style={{ color: theme.warning }}>{t('emergencySourceEnded')}</AppText>}
      {(source.reviewOverdue || (source.reviewDueAt !== null && source.reviewDueAt < now)) && <AppText style={{ color: theme.warning }}>{t('emergencyReviewOverdue')}</AppText>}
      {source.appliesToCurrentLocation === false && <AppText>{t('emergencyOutside')}</AppText>}
      {source.deadlineAt !== null && <AppText style={{ fontWeight: '700' }}>{t('emergencyDeadline')}: {date(source.deadlineAt)}</AppText>}
      {source.originalText !== null ? <>
        {source.sourceLanguage !== i18n.language && <AppText variant="caption">{t('emergencyOriginal')} · {source.sourceLanguage ?? '—'}</AppText>}
        <AppText selectable style={{ fontWeight: '600' }}>{source.originalText}</AppText>
      </> : <AppText>{t(source.kind === 'COMMUNITY' ? 'modelEvidenceNotice' : 'emergencyNoOriginal')}</AppText>}
      {source.translation?.status === 'READY' && source.translation.language === i18n.language && source.translation.text ? <>
        <AppText variant="caption">{t('emergencyMachineTranslation')}</AppText><AppText selectable>{source.translation.text}</AppText>
        <AppText variant="caption" style={{ color: theme.secondary }}>{t('emergencyTranslationReview')}</AppText>
      </> : source.originalText !== null && source.sourceLanguage !== null && source.sourceLanguage !== i18n.language && <AppText variant="caption">{t(source.translation?.status === 'FAILED' || source.translation?.status === 'FLAGGED' ? 'emergencyTranslationUnavailable' : 'emergencyTranslationPending')}</AppText>}
      <AppText variant="caption" style={{ color: theme.secondary }}>{t('emergencyIssued')}: {date(source.issuedAt)}</AppText>
    </View>)}
    {value.lifecycle === 'ACTIVE' && <View style={{ padding: 16, gap: 8, borderRadius: 20, backgroundColor: theme.muted }}><NearestShelter inline /></View>}
  </View>;
}
function Preview({ alertId, revision, now }: { alertId: string; revision: number; now: number }) {
  const value = useQuery(api.alerts.detail, { alertId: alertId as Id<'alerts'> });
  return !value || value.revision < revision ? <LoadingState /> : <EmergencyNoticeContent value={value} now={now} />;
}
function NoticeFailure({ retry }: { retry: () => void }) {
  const { t } = useTranslation();
  return <View style={{ gap: 8 }}><AppText>{t('errorMessage')}</AppText><ActionButton title={t('retry')} variant="secondary" onPress={retry}/></View>;
}
class NoticeBoundary extends Component<PropsWithChildren, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  render() { return this.state.failed ? <NoticeFailure retry={() => this.setState({ failed: false })}/> : this.props.children; }
}
export function EmergencyNotice(props: { alertId: string; revision: number; now: number }) {
  return <NoticeBoundary key={`${props.alertId}:${props.revision}`}><Preview {...props}/></NoticeBoundary>;
}
