import { useMutation, useQuery } from 'convex/react';
import type { FunctionArgs } from 'convex/server';
import { randomUUID } from 'expo-crypto';
import { router, useLocalSearchParams } from 'expo-router';
import { useRef, useState } from 'react';
import { Modal, ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
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
import { LANGUAGE_CODES, type LanguageCode, type Point } from '../../contracts/domain';
import { languageNames } from '../../i18n/resources';
import { useLanguage } from '../../i18n/LanguageProvider';

type Create = FunctionArgs<typeof api.demoNotices.create>;
const severityChoices = ['CRITICAL', 'HIGH', 'MODERATE', 'LOW'] as const;
const urgencyChoices = ['Immediate', 'Expected', 'Future', 'Past', 'Unknown'] as const;
const certaintyChoices = ['Observed', 'Likely', 'Possible', 'Unlikely', 'Unknown'] as const;

function Editor() {
  const { jurisdictionId } = useLocalSearchParams<{ jurisdictionId?: string }>();
  const { t } = useTranslation(), { language } = useLanguage();
  const theme = useTheme(), safe = useSafeAreaInsets(), { fix } = useLocationSession(), locate = useReportLocation();
  const scopes = useQuery(api.authority.scopes, {}), managed = useQuery(api.demoNotices.managed, jurisdictionId ? { jurisdictionId: jurisdictionId as never } : 'skip');
  const create = useMutation(api.demoNotices.create), withdraw = useMutation(api.demoNotices.withdraw);
  const scope = scopes?.find(item => item.id === jurisdictionId);
  const [title, setTitle] = useState(''), [event, setEvent] = useState(''), [description, setDescription] = useState(''), [instruction, setInstruction] = useState(''), [locality, setLocality] = useState('');
  const [latitude, setLatitude] = useState(''), [longitude, setLongitude] = useState(''), [radius, setRadius] = useState('1000'), [expiryMinutes, setExpiryMinutes] = useState('120');
  const [severity, setSeverity] = useState<Create['severity']>('HIGH'), [urgency, setUrgency] = useState<Create['urgency']>('Immediate'), [certainty, setCertainty] = useState<Create['certainty']>('Observed'), [sourceLanguage, setSourceLanguage] = useState<LanguageCode>(language), [advancedOpen, setAdvancedOpen] = useState(false);
  const [pickerOpen, setPickerOpen] = useState(false), [picked, setPicked] = useState<Point | null>(null), [review, setReview] = useState<Create | null>(null), [withdrawTarget, setWithdrawTarget] = useState<{ id: string; revision: number; title: string } | null>(null);
  const [busy, setBusy] = useState(false), [saved, setSaved] = useState(false), [error, setError] = useState<string | null>(null); const running = useRef(false);
  const locked = busy;
  function prepare() {
    if (!scope || scope.audience !== 'DEMO') return;
    const center = { latitude: Number(latitude), longitude: Number(longitude) }, radiusM = Number(radius), minutes = Number(expiryMinutes);
    if (!title.trim() || !event.trim() || !description.trim() || !instruction.trim() || !locality.trim() || !isValidPoint(center) || !Number.isFinite(radiusM) || radiusM <= 0 || radiusM > 200_000 || !Number.isInteger(minutes) || minutes < 1 || minutes > 1440) { setError('demoNoticeRequiredFields'); return; }
    setError(null); setReview({ requestId: randomUUID(), jurisdictionId: scope.id, title, event, description, instruction, locality, severity, urgency, certainty, sourceLanguage, area: { type: 'circle', center, radiusM }, expiresAt: Date.now() + minutes * 60_000 });
  }
  async function submit() { if (!review || running.current) return; running.current = true; setBusy(true); setError(null); try { await create(review); setReview(null); setSaved(true); } catch (err) { setError(apiErrorCode(err) ? errorTranslationKey(err) : 'demoNoticeSaveError'); } finally { running.current = false; setBusy(false); } }
  async function capturePosition() { if (running.current) return; running.current = true; setBusy(true); try { const next = await locate(); setLatitude(String(next.point.latitude)); setLongitude(String(next.point.longitude)); } catch { setError('locationAction'); } finally { running.current = false; setBusy(false); } }
  async function endNotice() { if (!withdrawTarget || !jurisdictionId || running.current) return; running.current = true; setBusy(true); try { await withdraw({ requestId: randomUUID(), jurisdictionId: jurisdictionId as never, noticeId: withdrawTarget.id as never, expectedRevision: withdrawTarget.revision }); setWithdrawTarget(null); } catch (err) { setError(apiErrorCode(err) ? errorTranslationKey(err) : 'demoNoticeWithdrawError'); } finally { running.current = false; setBusy(false); } }
  if (!scopes) return <Screen><LoadingState /></Screen>;
  if (!scope || scope.audience !== 'DEMO') return <Screen><AppText>{t('demoNoticeDemoScopeOnly')}</AppText></Screen>;
  return <Screen footer={<><ActionButton title={t('demoNoticeReview')} onPress={prepare} disabled={locked} /><ActionButton title={t('authorityTitle')} variant="secondary" onPress={() => router.replace('/authority')} /></>}>
    <AppText variant="title">{t('demoNoticeCreate')}</AppText><AppText>{t('demoNoticeEvidenceOnly')}</AppText><AppText>{scope.issuer} · {scope.name} · DEMO</AppText>
    <View style={{ padding: 14, borderRadius: 14, backgroundColor: theme.muted, gap: 6 }}><AppText style={{ fontWeight: '700' }}>{t('demoNoticeHowToTest')}</AppText><AppText variant="caption">{t('demoNoticeHowToTestSteps')}</AppText></View>
    {saved && <View style={{gap:10}}><AppText style={{ color: theme.accent }}>{t('demoNoticeSaved')}</AppText><ActionButton title={t('demoNoticeManage')} variant="secondary" onPress={() => setSaved(false)} /></View>}
    {!saved && <><Field label={t('demoNoticeTitle')} value={title} onChangeText={setTitle} maxLength={160} editable={!locked} /><Field label={t('demoNoticeEvent')} value={event} onChangeText={setEvent} maxLength={160} editable={!locked} />
    <Field label={t('declarationLocality')} value={locality} onChangeText={setLocality} maxLength={160} editable={!locked} /><Field label={t('demoNoticeDescription')} value={description} onChangeText={setDescription} multiline maxLength={4000} editable={!locked} /><Field label={t('demoNoticeInstructions')} value={instruction} onChangeText={setInstruction} multiline maxLength={4000} editable={!locked} />
    <AppText variant="heading">{t('declarationSeverity')}</AppText>{severityChoices.map(value => <Choice key={value} label={t(`severity${value}`)} selected={severity === value} disabled={locked} onPress={() => setSeverity(value)} />)}
    <Field label={t('demoNoticeExpiry')} value={expiryMinutes} onChangeText={setExpiryMinutes} keyboardType="numeric" editable={!locked} />
    <ActionButton title={t('demoNoticeSelectArea')} variant="secondary" disabled={locked} onPress={() => { setPicked(latitude && longitude ? { latitude: Number(latitude), longitude: Number(longitude) } : null); setPickerOpen(true); }} /><ActionButton title={t('declarationUseLocation')} variant="secondary" disabled={locked} onPress={() => void capturePosition()} />
    {latitude && longitude && <AppText variant="caption">{t('affectedLocationSelected')} · {radius} m</AppText>}<AppText variant="caption">{t('declarationRadiusPresets')}</AppText><View style={{flexDirection:'row',flexWrap:'wrap',gap:8}}>{[500,1000,5000].map(value => <ActionButton key={value} title={`${value >= 1000 ? value / 1000 : value}${value >= 1000 ? ' km' : ' m'}`} variant="secondary" disabled={locked} onPress={() => setRadius(String(value))} />)}</View><Field label={t('declarationRadius')} value={radius} onChangeText={setRadius} keyboardType="numeric" editable={!locked} />
    <ActionButton title={t(advancedOpen ? 'declarationHideOptions' : 'declarationMoreOptions')} variant="secondary" disabled={locked} onPress={() => setAdvancedOpen(value => !value)} />
    {advancedOpen && <View style={{gap:16,padding:16,borderRadius:16,borderWidth:1,borderColor:theme.border}}><AppText variant="heading">{t('declarationMoreOptions')}</AppText><AppText variant="heading">{t('demoNoticeUrgency')}</AppText>{urgencyChoices.map(value => <Choice key={value} label={t(`demoNoticeUrgency${value}`)} selected={urgency === value} disabled={locked} onPress={() => setUrgency(value)} />)}<AppText variant="heading">{t('demoNoticeCertainty')}</AppText>{certaintyChoices.map(value => <Choice key={value} label={t(`demoNoticeCertainty${value}`)} selected={certainty === value} disabled={locked} onPress={() => setCertainty(value)} />)}<AppText variant="heading">{t('declarationSourceLanguage')}</AppText>{LANGUAGE_CODES.map(code => <Choice key={code} label={languageNames[code].native} selected={sourceLanguage === code} disabled={locked} onPress={() => setSourceLanguage(code)} />)}</View>}
    </>}
    {error && <AppText style={{ color: theme.danger }}>{t(error)}</AppText>}
    <AppText variant="heading">{t('demoNoticeActive')}</AppText>{!managed ? <LoadingState /> : !managed.page.length ? <AppText>{t('demoNoticeEmpty')}</AppText> : managed.page.map(notice => <View key={notice.id} style={{ gap: 8, borderWidth: 1, borderColor: theme.border, borderRadius: 18, padding: 16 }}><AppText variant="caption" style={{ color: theme.accent, fontWeight: '700' }}>{t('demoNoticeLabel')}</AppText><AppText style={{ fontWeight: '700' }}>{notice.title} · {notice.event}</AppText><AppText>{notice.locality} · {t(`severity${notice.severity}`)}</AppText><AppText variant="caption">{notice.issuer} · {t('demoNoticeExpires')} {new Date(notice.expiresAt).toLocaleString(notice.sourceLanguage)}</AppText><ActionButton title={t('demoNoticeWithdraw')} variant="secondary" disabled={locked || notice.status !== 'ACTIVE'} onPress={() => setWithdrawTarget({ id: notice.id, revision: notice.revision, title: notice.title })} /></View>)}
    <Modal visible={pickerOpen} animationType="slide" onRequestClose={() => setPickerOpen(false)}><View style={{ flex: 1, backgroundColor: theme.background, paddingTop: safe.top }}><View style={{ padding: 20, gap: 8 }}><AppText variant="heading">{t('demoNoticeSelectArea')}</AppText><AppText>{t('demoNoticeAreaHelp')}</AppText></View><AreaPicker center={fix?.point ?? null} selected={picked} radiusM={Number(radius) > 0 ? Math.min(Number(radius), 200_000) : 1000} onSelect={setPicked} /><View style={{ padding: 20, paddingBottom: safe.bottom + 20, gap: 12 }}><ActionButton title={t('useSelectedLocation')} disabled={!picked} onPress={() => { if (picked) { setLatitude(String(picked.latitude)); setLongitude(String(picked.longitude)); setPickerOpen(false); } }} /><ActionButton title={t('cancel')} variant="secondary" onPress={() => setPickerOpen(false)} /></View></View></Modal>
    <Modal visible={review !== null} transparent animationType="slide" onRequestClose={() => !locked && setReview(null)}><View style={{ flex: 1, justifyContent: 'flex-end', backgroundColor: '#0008' }}><View style={{ maxHeight: '90%', backgroundColor: theme.background, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, paddingBottom: safe.bottom + 24, gap: 14 }}><ScrollView contentContainerStyle={{ gap: 10 }}><AppText variant="heading">{t('demoNoticeReview')}</AppText><AppText>{t('demoNoticeEvidenceOnly')}</AppText>{review && <><AppText>{review.title} · {review.event} · {t(`severity${review.severity}`)}</AppText><AppText>{review.locality} · {review.area.center.latitude}, {review.area.center.longitude} · {review.area.radiusM} m</AppText><AppText>{t('demoNoticeExpires')} {new Date(review.expiresAt).toLocaleString(review.sourceLanguage)}</AppText><AppText>{review.instruction}</AppText></>}</ScrollView><ActionButton title={t('demoNoticeCreate')} busy={busy} onPress={() => void submit()} /><ActionButton title={t('cancel')} variant="secondary" disabled={locked} onPress={() => setReview(null)} /></View></View></Modal>
    <Modal visible={withdrawTarget !== null} transparent animationType="fade" onRequestClose={() => !locked && setWithdrawTarget(null)}><View style={{ flex: 1, justifyContent: 'center', padding: 24, backgroundColor: '#0008' }}><View style={{ backgroundColor: theme.background, borderRadius: 24, padding: 24, gap: 14 }}><AppText variant="heading">{t('demoNoticeWithdrawConfirm')}</AppText><AppText>{withdrawTarget?.title}. {t('demoNoticeWithdrawHelp')}</AppText><ActionButton title={t('demoNoticeWithdraw')} busy={busy} onPress={() => void endNotice()} /><ActionButton title={t('cancel')} variant="secondary" disabled={locked} onPress={() => setWithdrawTarget(null)} /></View></View></Modal>
  </Screen>;
}
export default function DemoNoticesScreen() { return <AuthorityGate><Editor /></AuthorityGate>; }
