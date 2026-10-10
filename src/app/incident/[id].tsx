import { ChevronDown, ChevronUp, Users, MapPin, Newspaper, Map, PencilLine, RefreshCw } from 'lucide-react-native';
import { IncidentSummary, Fact, RelativeTime } from '../../components/IncidentSummary';
import { useTheme } from '../../theme/useTheme';
import { useConvexAuth, useQuery } from 'convex/react';
import { router, useLocalSearchParams, useFocusEffect } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Pressable, View } from 'react-native';
import { useCallback, useState } from 'react';
import { api } from '../../../convex/_generated/api';
import type { Id } from '../../../convex/_generated/dataModel';
import { ActionButton, AppText, LoadingState, Screen } from '../../components/ui';
import { ReadBoundary } from '../../components/ReadBoundary';
import { HAZARD_POLICY, HOUR } from '../../domain/policy';

function Detail() {
  const { t, i18n } = useTranslation(); const { id, accepted } = useLocalSearchParams<{ id: string; accepted?: string }>();
  const theme = useTheme(); const [evidenceOpen,setEvidenceOpen]=useState(false);
  const saved = accepted === '1';
  const { isAuthenticated, isLoading } = useConvexAuth();
  useFocusEffect(useCallback(()=>{if(!isLoading && !isAuthenticated) router.replace('/login');},[isLoading,isAuthenticated]));
  const incident = useQuery(api.incidents.detail, isAuthenticated && id ? { incidentId:id as Id<'incidents'> } : 'skip');
  const assessment = useQuery(api.incidents.assessment, isAuthenticated && id ? { incidentId:id as Id<'incidents'> } : 'skip');
  const eligibility = useQuery(api.observations.eligibility, isAuthenticated && id && !saved ? { incidentId:id as Id<'incidents'> } : 'skip');
  const eligibilityLabel = eligibility?.reason === 'OBSERVATION_TOO_FAR' ? 'observationTooFar' : eligibility?.reason === 'INCIDENT_CLOSED' ? 'incidentClosed' : 'locationAction';
  return <Screen footer={<>
    {!saved && <ActionButton icon={PencilLine} title={t(eligibility?.hasObservation ? 'updateObservation' : 'corroborate')} disabled={!incident || !eligibility?.eligible} onPress={() => incident && router.push({pathname:'/report',params:{incidentId:incident.id,hazard:incident.hazard,audience:incident.audience}})} />}
    <ActionButton icon={Map} title={t('backToMap')} variant={saved ? 'primary' : 'secondary'} onPress={() => router.replace('/map')} />
  </>}>
    <AppText variant="title" accessibilityRole="header" accessibilityLiveRegion={saved ? 'polite' : 'none'}>{t(saved ? 'reportAccepted' : 'detailTitle')}</AppText>
    {saved && <AppText>{t('reportSavedHelp')}</AppText>}
    {!incident ? <LoadingState /> : <>
      {incident.audience === 'DEMO' && <AppText>DEMO</AppText>}
      <AppText variant="heading">{t(`hazard${incident.hazard}`)}</AppText>
      <View style={{padding:18,borderRadius:22,backgroundColor:theme.surface,borderWidth:1,borderColor:theme.border,gap:18}}>
        <IncidentSummary incident={incident}/>
        <Fact icon={Newspaper}><AppText variant="caption" style={{color:theme.secondary,flex:1}}>{t(`source${incident.provenance}`)}</AppText></Fact>
        <Fact icon={Users}><AppText variant="caption" style={{flex:1}}>{t('witnessSummary',{recent:incident.recentWitnesses,total:incident.totalWitnesses,hours:HAZARD_POLICY[incident.hazard].witnessWindowMs/HOUR})}</AppText></Fact>
        {incident.geometry.type === 'circle' && <Fact icon={MapPin}><AppText variant="caption" style={{color:theme.secondary,flex:1}}>{incident.geometry.radiusM/1000} km · {t('approximateArea')}</AppText></Fact>}
      </View>
      <View style={{padding:18,borderRadius:22,backgroundColor:theme.surface,borderWidth:1,borderColor:theme.border,gap:12}}>
      <Pressable accessibilityRole="button" accessibilityState={{expanded:evidenceOpen}} onPress={()=>setEvidenceOpen(value=>!value)} style={{minHeight:48,flexDirection:'row',alignItems:'center',gap:12}}>
        <View style={{flex:1,gap:4}}><AppText variant="heading">{t('evidenceTitle')}</AppText>{assessment?.latest && <RelativeTime timestamp={assessment.latest.evaluatedAt}/>}</View>
        {evidenceOpen?<ChevronUp size={22} color={theme.secondary}/>:<ChevronDown size={22} color={theme.secondary}/>}
      </Pressable>
      <AppText variant="caption" style={{color:theme.secondary}}>{t('modelEvidenceNotice')}</AppText>

      {assessment?.lastError && <AppText>{t('assessmentRetrying')}</AppText>}
      {assessment?.latest && !assessment.latest.currentEvidence && !evidenceOpen && <AppText variant="caption" style={{color:theme.warning}}>{t('assessmentOutdated')}</AppText>}
      {assessment?.reviewNeeded && <AppText>{t('reviewRequested')}</AppText>}
      {evidenceOpen && (!assessment?.latest ? <AppText>{t('assessmentDevelopment')}</AppText> : <View style={{gap:12}}>
        <AppText>{t('assessedAt')}: {new Date(assessment.latest.evaluatedAt).toLocaleString(i18n.language,{month:'short',day:'numeric',hour:'numeric',minute:'2-digit'})}</AppText>
        <AppText>{t('assessmentLabel')}: {t(assessment.latest.outcome === 'SUPPRESSED' ? 'assessmentSuppressed' : `qualification${assessment.latest.outcome === 'QUALIFIED' ? 'NOTIFIABLE_EMERGENCY' : assessment.latest.outcome}`)}</AppText>
        {!assessment.latest.currentEvidence && <AppText>{t('assessmentOutdated')}</AppText>}
        <AppText>{t('weatherEvidence')}: {assessment.latest.weather ? `${assessment.latest.weather.description}${assessment.latest.weather.temperatureC === null ? '' : ` · ${assessment.latest.weather.temperatureC} °C`}` : t('unavailableEvidence')}</AppText>
        {assessment.latest.weather && <AppText variant="caption">{new Date(assessment.latest.weather.observedAt).toLocaleString(i18n.language,{month:'short',day:'numeric',hour:'numeric',minute:'2-digit'})}{assessment.latest.weather.stale ? ` · ${t('assessmentOutdated')}` : ''}</AppText>}
        {assessment.latest.official.map((notice,index) => <View key={index} style={{gap:4}}><AppText>{notice.headline}</AppText><AppText variant="caption">{notice.issuer} · {new Date(notice.issuedAt).toLocaleString(i18n.language,{month:'short',day:'numeric',hour:'numeric',minute:'2-digit'})}{notice.stale ? ` · ${t('assessmentOutdated')}` : ''}</AppText></View>)}
        {!assessment.latest.official.length && <AppText>{t('noOfficialMatch')}</AppText>}
        {assessment.latest.incomplete && <AppText variant="caption">{t('evidenceIncomplete')}</AppText>}
      </View>)}
      </View>
      {eligibility && !eligibility.eligible && <><AppText>{t(eligibilityLabel)}</AppText>
        {(eligibility.reason === 'LOCATION_STALE' || eligibility.reason === 'LOCATION_INACCURATE') && <ActionButton icon={RefreshCw} title={t('refreshLocation')} variant="secondary" onPress={()=>router.replace('/location')} />}</>}
    </>}
  </Screen>;
}
export default function IncidentScreen() { return <ReadBoundary><Detail /></ReadBoundary>; }
