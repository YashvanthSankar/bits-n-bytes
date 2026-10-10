import { useMutation, useQuery } from 'convex/react';
import type { FunctionArgs } from 'convex/server';
import { randomUUID } from 'expo-crypto';
import { router, useLocalSearchParams } from 'expo-router';
import { useRef, useState } from 'react';
import { Modal, ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { api } from '../../../convex/_generated/api';
import { ActionButton, AppText, LoadingState, Screen } from '../../components/ui';
import { AreaPicker } from '../../components/AreaPicker';
import { Field } from '../../components/Field';
import { Choice } from '../../components/Choice';
import { AuthorityGate } from '../../features/authority/AuthorityGate';
import { useLocationSession } from '../../session/LocationSession';
import { useReportLocation } from '../../features/incidents/useReportLocation';
import { isValidPoint } from '../../domain/eligibility';
import { apiErrorCode, errorTranslationKey } from '../../domain/apiError';
import { useTheme } from '../../theme/useTheme';
import type { LanguageCode, Point } from '../../contracts/domain';

type Create = FunctionArgs<typeof api.demoNotices.create>;
const severityChoices = ['CRITICAL', 'HIGH', 'MODERATE', 'LOW'] as const;
const urgencyChoices = ['Immediate', 'Expected', 'Future', 'Past', 'Unknown'] as const;
const certaintyChoices = ['Observed', 'Likely', 'Possible', 'Unlikely', 'Unknown'] as const;

function Editor() {
  const { jurisdictionId } = useLocalSearchParams<{ jurisdictionId?: string }>();
  const theme = useTheme(), safe = useSafeAreaInsets(), { fix } = useLocationSession(), locate = useReportLocation();
  const scopes = useQuery(api.authority.scopes, {}), managed = useQuery(api.demoNotices.managed, jurisdictionId ? { jurisdictionId: jurisdictionId as never } : 'skip');
  const create = useMutation(api.demoNotices.create), withdraw = useMutation(api.demoNotices.withdraw);
  const scope = scopes?.find(item => item.id === jurisdictionId);
  const [title, setTitle] = useState(''), [event, setEvent] = useState(''), [description, setDescription] = useState(''), [instruction, setInstruction] = useState(''), [locality, setLocality] = useState('');
  const [latitude, setLatitude] = useState(''), [longitude, setLongitude] = useState(''), [radius, setRadius] = useState('1000'), [expiryMinutes, setExpiryMinutes] = useState('120');
  const [severity, setSeverity] = useState<Create['severity']>('HIGH'), [urgency, setUrgency] = useState<Create['urgency']>('Immediate'), [certainty, setCertainty] = useState<Create['certainty']>('Observed'), [sourceLanguage, setSourceLanguage] = useState<LanguageCode>('en');
  const [pickerOpen, setPickerOpen] = useState(false), [picked, setPicked] = useState<Point | null>(null), [review, setReview] = useState<Create | null>(null), [withdrawTarget, setWithdrawTarget] = useState<{ id: string; revision: number; title: string } | null>(null);
  const [busy, setBusy] = useState(false), [saved, setSaved] = useState(false), [error, setError] = useState<string | null>(null); const running = useRef(false);
  const locked = busy;
  function prepare() {
    if (!scope || scope.audience !== 'DEMO') return;
    const center = { latitude: Number(latitude), longitude: Number(longitude) }, radiusM = Number(radius), minutes = Number(expiryMinutes);
    if (!title.trim() || !event.trim() || !description.trim() || !instruction.trim() || !locality.trim() || !isValidPoint(center) || !Number.isFinite(radiusM) || radiusM <= 0 || radiusM > 200_000 || !Number.isInteger(minutes) || minutes < 1 || minutes > 1440) { setError('Check the required fields, map circle, and expiry (1–1,440 minutes).'); return; }
    setError(null); setReview({ requestId: randomUUID(), jurisdictionId: scope.id, title, event, description, instruction, locality, severity, urgency, certainty, sourceLanguage, area: { type: 'circle', center, radiusM }, expiresAt: Date.now() + minutes * 60_000 });
  }
  async function submit() { if (!review || running.current) return; running.current = true; setBusy(true); setError(null); try { await create(review); setReview(null); setSaved(true); } catch (err) { setError(apiErrorCode(err) ? errorTranslationKey(err) : 'Unable to save the DEMO test notice.'); } finally { running.current = false; setBusy(false); } }
  async function capturePosition() { if (running.current) return; running.current = true; setBusy(true); try { const next = await locate(); setLatitude(String(next.point.latitude)); setLongitude(String(next.point.longitude)); } catch { setError('Unable to get your current location.'); } finally { running.current = false; setBusy(false); } }
  async function endNotice() { if (!withdrawTarget || !jurisdictionId || running.current) return; running.current = true; setBusy(true); try { await withdraw({ requestId: randomUUID(), jurisdictionId: jurisdictionId as never, noticeId: withdrawTarget.id as never, expectedRevision: withdrawTarget.revision }); setWithdrawTarget(null); } catch (err) { setError(apiErrorCode(err) ? errorTranslationKey(err) : 'Unable to withdraw the DEMO test notice.'); } finally { running.current = false; setBusy(false); } }
  if (!scopes) return <Screen><LoadingState /></Screen>;
  if (!scope || scope.audience !== 'DEMO') return <Screen><AppText>This action is available only in a DEMO authority scope.</AppText></Screen>;
  return <Screen footer={<><ActionButton title="Review DEMO test notice" onPress={prepare} disabled={locked} /><ActionButton title="Back to authority workspace" variant="secondary" onPress={() => router.replace('/authority')} /></>}>
    <AppText variant="title">Create DEMO test notice</AppText><AppText>This is test evidence only. It is not an NDMA/SACHET notice and cannot directly publish an emergency.</AppText><AppText>{scope.issuer} · {scope.name} · DEMO</AppText>
    {saved && <AppText style={{ color: theme.accent }}>Saved. It is available only to matching DEMO Jev evidence until it expires or is withdrawn.</AppText>}
    <Field label="Title" value={title} onChangeText={setTitle} maxLength={160} editable={!locked} /><Field label="Event" value={event} onChangeText={setEvent} maxLength={160} editable={!locked} />
    <Field label="Locality" value={locality} onChangeText={setLocality} maxLength={160} editable={!locked} /><Field label="Description" value={description} onChangeText={setDescription} multiline maxLength={4000} editable={!locked} /><Field label="Instructions" value={instruction} onChangeText={setInstruction} multiline maxLength={4000} editable={!locked} />
    <AppText variant="heading">Severity</AppText>{severityChoices.map(value => <Choice key={value} label={value} selected={severity === value} disabled={locked} onPress={() => setSeverity(value)} />)}
    <AppText variant="heading">Urgency</AppText>{urgencyChoices.map(value => <Choice key={value} label={value} selected={urgency === value} disabled={locked} onPress={() => setUrgency(value)} />)}
    <AppText variant="heading">Certainty</AppText>{certaintyChoices.map(value => <Choice key={value} label={value} selected={certainty === value} disabled={locked} onPress={() => setCertainty(value)} />)}
    <Field label="Source language" value={sourceLanguage} onChangeText={value => setSourceLanguage(value as LanguageCode)} maxLength={2} editable={!locked} /><Field label="Expiry in minutes (default 120; max 1,440)" value={expiryMinutes} onChangeText={setExpiryMinutes} keyboardType="numeric" editable={!locked} />
    <ActionButton title="Select notice area on map" variant="secondary" disabled={locked} onPress={() => { setPicked(latitude && longitude ? { latitude: Number(latitude), longitude: Number(longitude) } : null); setPickerOpen(true); }} /><ActionButton title="Use current location" variant="secondary" disabled={locked} onPress={() => void capturePosition()} />
    {latitude && longitude && <AppText variant="caption">Area center selected: {latitude}, {longitude}</AppText>}<Field label="Circle radius (metres)" value={radius} onChangeText={setRadius} keyboardType="numeric" editable={!locked} />
    {error && <AppText style={{ color: theme.danger }}>{error}</AppText>}
    <AppText variant="heading">Active DEMO test notices</AppText>{!managed ? <LoadingState /> : !managed.page.length ? <AppText>No active DEMO test notices in this scope.</AppText> : managed.page.map(notice => <View key={notice.id} style={{ gap: 8, borderWidth: 1, borderColor: theme.border, borderRadius: 18, padding: 16 }}><AppText variant="caption" style={{ color: theme.accent, fontWeight: '700' }}>DEMO TEST NOTICE · NOT NDMA/SACHET</AppText><AppText style={{ fontWeight: '700' }}>{notice.title} · {notice.event}</AppText><AppText>{notice.locality} · {notice.severity}</AppText><AppText variant="caption">{notice.issuer} · expires {new Date(notice.expiresAt).toLocaleString(notice.sourceLanguage)}</AppText><ActionButton title="Withdraw DEMO notice" variant="secondary" disabled={locked || notice.status !== 'ACTIVE'} onPress={() => setWithdrawTarget({ id: notice.id, revision: notice.revision, title: notice.title })} /></View>)}
    <Modal visible={pickerOpen} animationType="slide" onRequestClose={() => setPickerOpen(false)}><View style={{ flex: 1, backgroundColor: theme.background, paddingTop: safe.top }}><View style={{ padding: 20, gap: 8 }}><AppText variant="heading">Select DEMO notice circle center</AppText><AppText>The whole circle must be inside your assigned DEMO jurisdiction.</AppText></View><AreaPicker center={fix?.point ?? null} selected={picked} radiusM={Number(radius) > 0 ? Math.min(Number(radius), 200_000) : 1000} onSelect={setPicked} /><View style={{ padding: 20, paddingBottom: safe.bottom + 20, gap: 12 }}><ActionButton title="Use selected location" disabled={!picked} onPress={() => { if (picked) { setLatitude(String(picked.latitude)); setLongitude(String(picked.longitude)); setPickerOpen(false); } }} /><ActionButton title="Cancel" variant="secondary" onPress={() => setPickerOpen(false)} /></View></View></Modal>
    <Modal visible={review !== null} transparent animationType="slide" onRequestClose={() => !locked && setReview(null)}><View style={{ flex: 1, justifyContent: 'flex-end', backgroundColor: '#0008' }}><View style={{ maxHeight: '90%', backgroundColor: theme.background, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, paddingBottom: safe.bottom + 24, gap: 14 }}><ScrollView contentContainerStyle={{ gap: 10 }}><AppText variant="heading">Review DEMO test notice</AppText><AppText>This will be DEMO authority-created evidence only; it is not official SACHET data and does not publish an emergency.</AppText>{review && <><AppText>{review.title} · {review.event} · {review.severity}</AppText><AppText>{review.locality} · {review.area.center.latitude}, {review.area.center.longitude} · {review.area.radiusM} m</AppText><AppText>Expires {new Date(review.expiresAt).toLocaleString(review.sourceLanguage)}</AppText><AppText>{review.instruction}</AppText></>}</ScrollView><ActionButton title="Create DEMO test notice" busy={busy} onPress={() => void submit()} /><ActionButton title="Cancel" variant="secondary" disabled={locked} onPress={() => setReview(null)} /></View></View></Modal>
    <Modal visible={withdrawTarget !== null} transparent animationType="fade" onRequestClose={() => !locked && setWithdrawTarget(null)}><View style={{ flex: 1, justifyContent: 'center', padding: 24, backgroundColor: '#0008' }}><View style={{ backgroundColor: theme.background, borderRadius: 24, padding: 24, gap: 14 }}><AppText variant="heading">Withdraw DEMO test notice?</AppText><AppText>{withdrawTarget?.title}. It will no longer be used as DEMO Jev evidence.</AppText><ActionButton title="Withdraw notice" busy={busy} onPress={() => void endNotice()} /><ActionButton title="Cancel" variant="secondary" disabled={locked} onPress={() => setWithdrawTarget(null)} /></View></View></Modal>
  </Screen>;
}
export default function DemoNoticesScreen() { return <AuthorityGate><Editor /></AuthorityGate>; }
