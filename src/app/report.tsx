import { useConvex, useConvexAuth, useMutation } from 'convex/react';
import { router, useLocalSearchParams } from 'expo-router';
import { randomUUID } from 'expo-crypto';
import { useEffect, useRef, useState } from 'react';
import { View } from 'react-native';
import { useTranslation } from 'react-i18next';
import type { FunctionArgs } from 'convex/server';
import { api } from '../../convex/_generated/api';
import type { Id } from '../../convex/_generated/dataModel';
import { HAZARD_CODES, type HazardCode, type LocationFix, type PublicIncident } from '../contracts/domain';
import { Choice } from '../components/Choice';
import { Field } from '../components/Field';
import { IncidentCard } from '../components/IncidentCard';
import { ActionButton, AppText, LoadingState, Screen } from '../components/ui';
import { apiErrorCode, apiRetryAfterMs, errorTranslationKey } from '../domain/apiError';
import { observationTime, type ObservationTimeChoice } from '../domain/reportTime';
import { useReportLocation } from '../features/incidents/useReportLocation';
import { LocationFailure } from '../services/location';
import { useTheme } from '../theme/useTheme';

type Submission = FunctionArgs<typeof api.observations.submit>;
export default function ReportScreen() {
  const { t, i18n } = useTranslation(); const theme = useTheme();
  const { incidentId, hazard: suggestedHazard, audience: suggestedAudience } = useLocalSearchParams<{ incidentId?: string; hazard?: string; audience?: string }>();
  const { isLoading, isAuthenticated } = useConvexAuth();
  const [hazard, setHazard] = useState<HazardCode | null>(HAZARD_CODES.find(code => code === suggestedHazard) ?? null);
  const [choosingHazard, setChoosingHazard] = useState(!suggestedHazard);
  const [when, setWhen] = useState<ObservationTimeChoice>('NOW'); const [day, setDay] = useState<'TODAY'|'YESTERDAY'>('TODAY');
  const [clock, setClock] = useState(''); const [description, setDescription] = useState('');
  const [fix, setFix] = useState<LocationFix | null>(null); const [matches, setMatches] = useState<PublicIncident[] | null>(null);
  const [partial, setPartial] = useState(false); const [chosen, setChosen] = useState<string | null>(incidentId ?? null);
  const [busy, setBusy] = useState(false); const [error, setError] = useState<string | null>(null); const [uncertain, setUncertain] = useState(false);
  const [retryAt, setRetryAt] = useState(0); const [now, setNow] = useState(() => Date.now());
  const pending = useRef<Submission | null>(null); const running = useRef(false);
  const convex = useConvex(); const submit = useMutation(api.observations.submit); const locate = useReportLocation();
  const audience = suggestedAudience === 'DEMO' ? 'DEMO' as const : 'LIVE' as const;
  useEffect(() => { if (!isLoading && !isAuthenticated) router.replace('/location'); }, [isLoading, isAuthenticated]);
  useEffect(() => {
    if (!retryAt) return;
    const timer = setInterval(() => { const time = Date.now(); setNow(time); if (time >= retryAt) setRetryAt(0); },1_000);
    return () => clearInterval(timer);
  }, [retryAt]);
  const failed = (err: unknown) => {
    if (err instanceof LocationFailure) setError(({ disabled:'locationDisabled',denied:'permissionDenied',accuracy:'inaccurateLocation',outside:'outsideIndia',uncertain:'uncertainLocation',unavailable:'serviceUnavailable' })[err.reason]);
    else setError(errorTranslationKey(err));
  };
  const checkMatches = async () => {
    if (running.current || !hazard) return; running.current = true; setBusy(true); setError(null);
    try {
      const value = await locate(); setFix(value);
      const result = await convex.query(api.observations.candidates, { hazard, audience });
      const items = result.items;
      if (incidentId && !items.some(item=>item.id===incidentId)) items.unshift(await convex.query(api.incidents.detail,{incidentId:incidentId as Id<'incidents'>}));
      setMatches(items); setPartial(result.partial);
      setChosen(incidentId ?? (result.items.length ? null : 'NEW'));
    } catch (err) { setFix(null); failed(err); }
    finally { running.current = false; setBusy(false); }
  };
  const send = async () => {
    if (running.current || !hazard || retryAt > Date.now()) return;
    running.current = true; setBusy(true); setError(null);
    try {
      if (!pending.current) {
        const observedAt = observationTime(when, day, clock, Date.now());
        if (observedAt === null || description.length > 500 || (hazard === 'OTHER_NATURAL' && description.trim().length < 3)) { setError('inputError'); return; }
        const current = await locate(); setFix(current);
        pending.current = { requestId: randomUUID(), hazard, fix: current, observedAt, description, audience,
          ...(chosen && chosen !== 'NEW' ? { incidentId: chosen as Id<'incidents'> } : {}) };
      }
      const receipt = await submit(pending.current);
      pending.current = null; setUncertain(false);
      router.replace({ pathname: '/incident/[id]', params: { id: receipt.incidentId, accepted: '1' } });
    } catch (err) {
      if (pending.current && !apiErrorCode(err)) { setUncertain(true); setError('submissionUncertain'); }
      else {
        pending.current = null; setUncertain(false); failed(err);
        const delay = apiRetryAfterMs(err); if (delay) { setNow(Date.now()); setRetryAt(Date.now() + delay); }
      }
    } finally { running.current = false; setBusy(false); }
  };
  const locked = busy || uncertain;
  return <Screen footer={<>
    {error && <AppText accessibilityLiveRegion="polite" style={{ color: theme.danger }}>{t(error)}</AppText>}
    {retryAt > now && <AppText variant="caption">{t('secondsUntilRetry')}: {Math.ceil((retryAt-now)/1000)}</AppText>}
    <ActionButton title={t(uncertain ? 'retry' : matches === null ? 'findMatches' : chosen && chosen !== 'NEW' ? 'submitObservation' : 'submitReport')}
      busy={busy} disabled={isLoading || !isAuthenticated || !hazard || retryAt > now || (matches !== null && !chosen)} onPress={() => void (matches === null ? checkMatches() : send())} />
    <ActionButton title={t('backToMap')} variant="secondary" disabled={locked} onPress={() => router.replace('/map')} />
  </>}>
    <AppText variant="title" accessibilityRole="header">{t('reportTitle')}</AppText>
    {audience === 'DEMO' && <AppText>DEMO</AppText>}
    <AppText>{t('reportSafety')}</AppText>
    <View style={{ gap: 8 }}><AppText variant="heading">{t('hazardLabel')}</AppText>
      {choosingHazard ? HAZARD_CODES.map(code => <Choice key={code} label={t(`hazard${code}`)} selected={hazard === code} disabled={locked || !!incidentId}
        onPress={() => { setHazard(code); setChoosingHazard(false); setMatches(null); setChosen(null); }} />) : <>
        <AppText>{t(`hazard${hazard}`)}</AppText>
        {!incidentId && <ActionButton title={t('changeHazard')} variant="secondary" disabled={locked} onPress={()=>setChoosingHazard(true)} />}</>}
    </View>
    <View style={{ gap: 8 }}><AppText variant="heading">{t('timeLabel')}</AppText>
      {(['NOW','MINUTES_15','MINUTES_30','EARLIER'] as const).map((choice, index) => <Choice key={choice} label={t(['timeNow','time15','time30','timeEarlier'][index]!)} selected={when === choice} disabled={locked} onPress={() => setWhen(choice)} />)}
      {when === 'EARLIER' && <><Choice label={t('timeToday')} selected={day === 'TODAY'} onPress={() => setDay('TODAY')} disabled={locked} />
        <Choice label={t('timeYesterday')} selected={day === 'YESTERDAY'} onPress={() => setDay('YESTERDAY')} disabled={locked} />
        <Field label={t('timeEarlierField')} value={clock} onChangeText={setClock} maxLength={5} placeholder="HH:MM" editable={!locked} autoCapitalize="none" />
        <AppText variant="caption">{t('timeEarlierHelp')}</AppText></>}
    </View>
    <Field label={t('descriptionLabel')} value={description} onChangeText={setDescription} multiline maxLength={500} editable={!locked} style={{ minHeight: 112, textAlignVertical: 'top' }} />
    <AppText variant="caption">{description.length}/500</AppText>
    {fix && <View style={{ gap: 8 }}><AppText variant="heading">{t('locationCaptured')}</AppText><AppText>{t('addressUnavailable')}</AppText>
      <AppText variant="caption">{fix.point.latitude.toFixed(5)}, {fix.point.longitude.toFixed(5)} · ±{Math.ceil(fix.accuracyM)} m</AppText>
      <AppText variant="caption">{new Date(fix.observedAt).toLocaleString(i18n.language)}</AppText>
      <ActionButton title={t('refreshLocation')} variant="secondary" disabled={locked} onPress={() => void checkMatches()} />
    </View>}
    {matches !== null && <View style={{ gap: 12 }}><AppText variant="heading">{t(matches.length ? 'matchTitle' : 'noMatches')}</AppText>
      <AppText>{t('matchExplanation')}</AppText>
      {partial && <AppText>{t('matchesPartial')}</AppText>}
      {matches.map(item => <View key={item.id} style={{ gap: 8 }}><IncidentCard incident={item} /><Choice label={t('addObservation')} selected={chosen === item.id} disabled={locked} onPress={() => setChosen(item.id)} /></View>)}
      <Choice label={t('differentEvent')} selected={chosen === 'NEW'} disabled={locked} onPress={() => setChosen('NEW')} />
      <AppText variant="caption">{t('reportDifferentExplanation')}</AppText>
    </View>}
    {busy && <LoadingState />}
  </Screen>;
}
