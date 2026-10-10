import { useMutation, useQuery } from 'convex/react';
import type { FunctionArgs, FunctionReturnType } from 'convex/server';
import { randomUUID } from 'expo-crypto';
import { router, useLocalSearchParams } from 'expo-router';
import { useRef, useState } from 'react';
import { Modal, ScrollView, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { api } from '../../../convex/_generated/api';
import { ActionButton, AppText, LoadingState, Screen } from '../../components/ui';
import { AreaPicker } from '../../components/AreaPicker';
import { useLocationSession } from '../../session/LocationSession';
import { Choice } from '../../components/Choice';
import { Field } from '../../components/Field';
import { AuthorityGate } from '../../features/authority/AuthorityGate';
import { HAZARD_CODES, LANGUAGE_CODES, type HazardCode, type LanguageCode, type Point } from '../../contracts/domain';
import { languageNames } from '../../i18n/resources';
import { useLanguage } from '../../i18n/LanguageProvider';
import { apiErrorCode, errorTranslationKey } from '../../domain/apiError';
import { isValidPoint } from '../../domain/eligibility';
import { MINUTE } from '../../domain/policy';
import { useReportLocation } from '../../features/incidents/useReportLocation';
import { useTheme } from '../../theme/useTheme';

type Publish = FunctionArgs<typeof api.declarations.publish>;
function Editor() {
  const { t } = useTranslation(), theme = useTheme(), safe = useSafeAreaInsets(), { language } = useLanguage();
  const { jurisdictionId } = useLocalSearchParams<{ jurisdictionId?: string }>();
  const scopes = useQuery(api.authority.scopes, {}), publish = useMutation(api.declarations.publish), locate = useReportLocation();
  const { fix } = useLocationSession();
  const [pickerOpen, setPickerOpen] = useState(false), [picked, setPicked] = useState<Point | null>(null);
  const scope = scopes?.find(s => s.id === jurisdictionId);
  const [hazard, setHazard] = useState<HazardCode>('FLASH_FLOOD'), [severity, setSeverity] = useState<Publish['severity']>('HIGH');
  const [sourceLanguage, setSourceLanguage] = useState<LanguageCode>(language), [action, setAction] = useState<Publish['actionKind']>('STAY_PUT');
  const [locality, setLocality] = useState(''), [latitude, setLatitude] = useState(''), [longitude, setLongitude] = useState(''), [radius, setRadius] = useState('1000');
  const [original, setOriginal] = useState(''), [reviewMinutes, setReviewMinutes] = useState('60');
  const [review, setReview] = useState<Publish | null>(null), [busy, setBusy] = useState(false), [uncertain, setUncertain] = useState(false), [saved, setSaved] = useState(false), [error, setError] = useState<string | null>(null);
  const running = useRef(false), pending = useRef<Publish | null>(null);
  const locked = busy || uncertain;
  const [existingOpen, setExistingOpen] = useState(false), [cursor, setCursor] = useState<string | null>(null);
  const [selectedIncident, setSelectedIncident] = useState<FunctionReturnType<typeof api.authority.declarationCandidates>['page'][number] | null>(null);
  const candidates = useQuery(api.authority.declarationCandidates, scope && existingOpen ? { jurisdictionId: scope.id, paginationOpts: {numItems: 20, cursor} } : 'skip');
  function prepare() {
    if (!scope || locked) return;
    const point = { latitude: Number(latitude), longitude: Number(longitude) }, radiusM = Number(radius), minutes = Number(reviewMinutes);
    if (!latitude.trim() || !longitude.trim() || !isValidPoint(point) || !Number.isFinite(radiusM) || radiusM <= 0 || radiusM > 200_000
      || !Number.isInteger(minutes) || minutes < 1 || minutes > 1440 || !locality.trim() || !original.trim()) { setError(!latitude.trim() || !longitude.trim() ? 'selectLocationRequired' : 'inputError'); return; }
    setError(null); setReview({ requestId: randomUUID(), jurisdictionId: scope.id, expectedIncidentRevision: selectedIncident?.revision ?? 0, ...(selectedIncident ? {incidentId: selectedIncident.id} : {}), hazard, locality, area: { type: 'circle', center: point, radiusM }, severity,
      originalText: original, sourceLanguage, actionKind: action, reviewDueAt: Date.now() + minutes * MINUTE });
  }
  async function submit(args: Publish | null) {
    if (!args || running.current) return;
    running.current = true; setBusy(true); setError(null); pending.current = args;
    try { await publish(args); pending.current = null; setUncertain(false); setReview(null); setSaved(true); }
    catch (err) { if (apiErrorCode(err)) { pending.current = null; setUncertain(false); setReview(null); setError(errorTranslationKey(err)); } else { setUncertain(true); setError('authorityWriteUncertain'); } }
    finally { running.current = false; setBusy(false); }
  }
  async function capturePosition() {
    if (running.current || uncertain) return; running.current = true; setBusy(true); setError(null);
    try { const fix = await locate(); setLatitude(String(fix.point.latitude)); setLongitude(String(fix.point.longitude)); }
    catch { setError('locationAction'); } finally { running.current = false; setBusy(false); }
  }
  if (!scopes) return <Screen><LoadingState /></Screen>;
  if (!scope) return <Screen><AppText>{t('jurisdictionDenied')}</AppText></Screen>;
  if (saved) return <Screen footer={<ActionButton title={t('authorityTitle')} onPress={() => router.replace('/authority')} />}><AppText variant="title">{t('declarationPublished')}</AppText><AppText>{t('declarationSavedHelp')}</AppText><AppText>{scope.issuer} · {scope.audience}</AppText></Screen>;
  return <Screen footer={<><ActionButton title={t('declarationReviewButton')} onPress={prepare} disabled={locked} /><ActionButton title={t('cancel')} variant="secondary" disabled={locked} onPress={() => router.replace('/authority')} /></>}>
    <AppText variant="title">{t('declareEmergency')}</AppText><AppText>{scope.issuer} · {scope.name} · {scope.audience}</AppText>
    <ActionButton title={t('selectExistingIncident')} variant="secondary" disabled={locked} onPress={() => { setCursor(null); setExistingOpen(true); }} />
    {selectedIncident && <><AppText>{t('promotingExistingIncident')}: {selectedIncident.locality}</AppText><ActionButton title={t('createNewIncident')} variant="secondary" disabled={locked} onPress={() => setSelectedIncident(null)} /></>}
    <AppText variant="heading">{t('hazardLabel')}</AppText>
    {HAZARD_CODES.map(code => <Choice key={code} label={t(`hazard${code}`)} selected={hazard === code} disabled={locked || !!selectedIncident} onPress={() => setHazard(code)} />)}
    <Field label={t('declarationLocality')} value={locality} onChangeText={setLocality} maxLength={160} editable={!locked} />
    <ActionButton title={t('selectAffectedLocation')} variant="secondary" disabled={locked} onPress={() => { setPicked(latitude && longitude ? {latitude:Number(latitude),longitude:Number(longitude)} : null); setPickerOpen(true); }} />
    <ActionButton title={t('declarationUseLocation')} variant="secondary" disabled={locked} onPress={() => void capturePosition()} />
    {latitude && longitude && <AppText variant="caption">{t('affectedLocationSelected')}</AppText>}
    <Field label={t('declarationRadius')} value={radius} onChangeText={setRadius} keyboardType="numeric" editable={!locked} />
    <AppText variant="heading">{t('declarationSeverity')}</AppText>
    {(['CRITICAL','HIGH','MODERATE','LOW'] as const).map(code => <Choice key={code} label={t(`severity${code}`)} selected={severity === code} disabled={locked} onPress={() => setSeverity(code)} />)}
    <AppText variant="heading">{t('declarationSourceLanguage')}</AppText>
    {LANGUAGE_CODES.map(code => <Choice key={code} label={languageNames[code].native} selected={sourceLanguage === code} disabled={locked} onPress={() => setSourceLanguage(code)} />)}
    <Field label={t('declarationOriginal')} value={original} onChangeText={setOriginal} multiline maxLength={8000} editable={!locked} />
    <AppText variant="heading">{t('declarationAction')}</AppText>
    {(['STAY_PUT','AVOID_TRAVEL','EVACUATE','OTHER'] as const).map(code => <Choice key={code} label={t(`action${code}`)} selected={action === code} disabled={locked} onPress={() => setAction(code)} />)}
    <Field label={t('declarationReview')} value={reviewMinutes} onChangeText={setReviewMinutes} keyboardType="numeric" editable={!locked} />
    {error && <AppText style={{color:theme.danger}}>{t(error)}</AppText>}
    <Modal visible={existingOpen} animationType="slide" onRequestClose={() => setExistingOpen(false)}>
      <View style={{flex:1,backgroundColor:theme.background,padding:20,paddingTop:safe.top+20,paddingBottom:safe.bottom+20,gap:16}}>
        <AppText variant="heading">{t('selectExistingIncident')}</AppText>
        <ScrollView contentContainerStyle={{gap:12}}>
          {!candidates ? <LoadingState /> : <>
            {!candidates.page.length && <AppText>{t('noIncidentsInPage')}</AppText>}
            {candidates.page.map(item => <ActionButton key={item.id} title={item.locality+' · '+t(`hazard${item.hazard}`)} variant="secondary" onPress={() => {
              setSelectedIncident(item); setHazard(item.hazard); setLocality(item.locality); setLatitude(String(item.area.center.latitude)); setLongitude(String(item.area.center.longitude)); setRadius(String(item.area.radiusM)); setExistingOpen(false); setError(null);
            }} />)}
            {!candidates.isDone && <ActionButton title={t('moreIncidents')} variant="secondary" onPress={() => setCursor(candidates.continueCursor)} />}
          </>}
        </ScrollView>
        <ActionButton title={t('cancel')} variant="secondary" onPress={() => setExistingOpen(false)} />
      </View>
    </Modal>
    <Modal visible={pickerOpen} animationType="slide" onRequestClose={() => setPickerOpen(false)}>
      <View style={{flex:1,backgroundColor:theme.background,paddingTop:safe.top}}>
        <View style={{padding:20,gap:8}}><AppText variant="heading">{t('selectAffectedLocation')}</AppText><AppText>{t('tapAffectedLocation')}</AppText></View>
        <AreaPicker center={fix?.point ?? null} selected={picked} radiusM={Number.isFinite(Number(radius)) && Number(radius)>0 ? Math.min(Number(radius),200_000) : 1000} onSelect={setPicked} />
        <View style={{padding:20,paddingBottom:safe.bottom+20,gap:12}}>
          <ActionButton title={t('useSelectedLocation')} disabled={!picked} onPress={() => { if (picked) { setLatitude(String(picked.latitude)); setLongitude(String(picked.longitude)); setPickerOpen(false); } }} />
          <ActionButton title={t('cancel')} variant="secondary" onPress={() => setPickerOpen(false)} />
        </View>
      </View>
    </Modal>
    <Modal visible={review !== null} transparent animationType="slide" onRequestClose={() => { if (!locked) setReview(null); }}>
      <View style={{flex:1,justifyContent:'flex-end',backgroundColor:'#0008'}}><View style={{maxHeight:'90%',backgroundColor:theme.background,borderTopLeftRadius:24,borderTopRightRadius:24,padding:24,paddingBottom:safe.bottom+24,gap:16}}>
        <ScrollView contentContainerStyle={{gap:12}}><AppText variant="heading">{t('declarationReviewButton')}</AppText><AppText>{scope.issuer} · {scope.audience}</AppText><AppText>{t('declarationReviewHelp')}</AppText>
          {review && <>{selectedIncident && <AppText>{t('promotingExistingIncident')}: {selectedIncident.locality}</AppText>}<AppText>{review.locality} · {t(`hazard${review.hazard}`)} · {t(`severity${review.severity}`)}</AppText><AppText>{latitude}, {longitude} · {radius} m</AppText><AppText>{t(`action${action}`)} · {languageNames[review.sourceLanguage].native}</AppText><AppText>{review.originalText}</AppText><AppText>{new Date(review.reviewDueAt).toLocaleString(sourceLanguage)}</AppText></>}
          {error && <AppText style={{color:theme.danger}}>{t(error)}</AppText>}
        </ScrollView>
        <ActionButton title={t(uncertain ? 'retry' : 'declarationPublish')} busy={busy} onPress={() => void submit(uncertain ? pending.current : review)} />
        <ActionButton title={t('cancel')} variant="secondary" disabled={locked} onPress={() => setReview(null)} />
      </View></View>
    </Modal>
  </Screen>;
}
export default function DeclareScreen() { return <AuthorityGate><Editor /></AuthorityGate>; }
