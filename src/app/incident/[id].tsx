import { useConvexAuth, useQuery } from 'convex/react';
import { router, useLocalSearchParams, useFocusEffect } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';
import { useCallback } from 'react';
import { api } from '../../../convex/_generated/api';
import type { Id } from '../../../convex/_generated/dataModel';
import { ActionButton, AppText, LoadingState, Screen } from '../../components/ui';
import { ReadBoundary } from '../../components/ReadBoundary';
import { HAZARD_POLICY, HOUR } from '../../domain/policy';

function Detail() {
  const { t, i18n } = useTranslation(); const { id, accepted } = useLocalSearchParams<{ id: string; accepted?: string }>();
  const saved = accepted === '1';
  const { isAuthenticated, isLoading } = useConvexAuth();
  useFocusEffect(useCallback(()=>{if(!isLoading && !isAuthenticated) router.replace('/login');},[isLoading,isAuthenticated]));
  const incident = useQuery(api.incidents.detail, isAuthenticated && id ? { incidentId:id as Id<'incidents'> } : 'skip');
  const eligibility = useQuery(api.observations.eligibility, isAuthenticated && id && !saved ? { incidentId:id as Id<'incidents'> } : 'skip');
  const eligibilityLabel = eligibility?.reason === 'OBSERVATION_TOO_FAR' ? 'observationTooFar' : eligibility?.reason === 'INCIDENT_CLOSED' ? 'incidentClosed' : 'locationAction';
  return <Screen footer={<>
    {!saved && <ActionButton title={t(eligibility?.hasObservation ? 'updateObservation' : 'corroborate')} disabled={!incident || !eligibility?.eligible} onPress={() => incident && router.push({pathname:'/report',params:{incidentId:incident.id,hazard:incident.hazard,audience:incident.audience}})} />}
    <ActionButton title={t('backToMap')} variant={saved ? 'primary' : 'secondary'} onPress={() => router.replace('/map')} />
  </>}>
    <AppText variant="title" accessibilityRole="header" accessibilityLiveRegion={saved ? 'polite' : 'none'}>{t(saved ? 'reportAccepted' : 'detailTitle')}</AppText>
    {saved && <AppText>{t('reportSavedHelp')}</AppText>}
    {!incident ? <LoadingState /> : <>
      {incident.audience === 'DEMO' && <AppText>DEMO</AppText>}
      <AppText variant="heading">{t(`hazard${incident.hazard}`)}</AppText>
      <View style={{gap:12}}>
        <AppText>{t('verificationLabel')}: {t(`verification${incident.verification}`)}</AppText>
        <AppText>{t('lifecycleLabel')}: {t(`lifecycle${incident.lifecycle}`)}</AppText>
        {incident.officialEmergency ? <AppText>{t('emergencyActive')} · {t(`severity${incident.officialEmergency.severity}`)}</AppText> : <AppText>{t('assessmentLabel')}: {t(`qualification${incident.qualification ?? 'PENDING'}`)}</AppText>}
        <AppText>{t('sourceLabel')}: {t(`source${incident.provenance}`)}</AppText>
      </View>
      <AppText>{t('lastObservation')}: {new Date(incident.lastObservedAt).toLocaleString(i18n.language)}</AppText>
      <View style={{gap:12}}><AppText>{t('recentWitnesses')}: {incident.recentWitnesses}</AppText>
        <AppText>{t('totalWitnesses')}: {incident.totalWitnesses}</AppText>
        <AppText variant="caption">{t('witnessWindow')}: {HAZARD_POLICY[incident.hazard].witnessWindowMs/HOUR}</AppText></View>
      {incident.geometry.type === 'circle' && <AppText>{t('approximateArea')} ({incident.geometry.radiusM/1000} km)</AppText>}
      {!incident.officialEmergency && incident.assessmentStatus === 'PENDING' && <AppText>{t('assessmentDevelopment')}</AppText>}
      {eligibility && !eligibility.eligible && <><AppText>{t(eligibilityLabel)}</AppText>
        {(eligibility.reason === 'LOCATION_STALE' || eligibility.reason === 'LOCATION_INACCURATE') && <ActionButton title={t('refreshLocation')} variant="secondary" onPress={()=>router.replace('/location')} />}</>}
    </>}
  </Screen>;
}
export default function IncidentScreen() { return <ReadBoundary><Detail /></ReadBoundary>; }
