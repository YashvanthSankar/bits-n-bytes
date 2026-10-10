import { useMutation } from 'convex/react';
import type { FunctionArgs, FunctionReturnType } from 'convex/server';
import { randomUUID } from 'expo-crypto';
import { router } from 'expo-router';
import { useRef, useState } from 'react';
import { Modal, ScrollView, Switch, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { api } from '../../../convex/_generated/api';
import type { Id } from '../../../convex/_generated/dataModel';
import { ActionButton, AppText, Screen } from '../../components/ui';
import { Field } from '../../components/Field';
import { AreaPicker } from '../../components/AreaPicker';
import { useLocationSession } from '../../session/LocationSession';
import type { Point } from '../../contracts/domain';
import { Choice } from '../../components/Choice';
import { apiErrorCode, errorTranslationKey } from '../../domain/apiError';
import { isValidPoint } from '../../domain/eligibility';
import { useReportLocation } from '../incidents/useReportLocation';
import { useTheme } from '../../theme/useTheme';

type SaveArgs = FunctionArgs<typeof api.shelters.save>;
type Initial = FunctionReturnType<typeof api.shelters.managedDetail>;
type Pending = { kind: 'SAVE'; args: SaveArgs } | { kind: 'ARCHIVE'; args: FunctionArgs<typeof api.shelters.archive> };
function count(value: string): number | null | undefined {
  if (!value.trim()) return null;
  if (!/^\d+$/.test(value.trim())) return undefined;
  const parsed = Number(value);
  return Number.isSafeInteger(parsed) && parsed <= 1_000_000 ? parsed : undefined;
}

export function ShelterForm({ jurisdictionId, jurisdictionName, issuer, audience, initial }: {
  jurisdictionId: Id<'jurisdictions'>; jurisdictionName: string; issuer: string; audience: 'LIVE' | 'DEMO'; initial: Initial | null;
}) {
  const { t } = useTranslation(); const theme = useTheme(); const safe = useSafeAreaInsets();
  const { fix } = useLocationSession();
  const [pickerOpen, setPickerOpen] = useState(false), [picked, setPicked] = useState<Point | null>(null);
  const save = useMutation(api.shelters.save), archive = useMutation(api.shelters.archive), locate = useReportLocation();
  const [form, setForm] = useState(() => ({ name: initial?.name ?? '', address: initial?.address ?? '', latitude: initial ? String(initial.point.latitude) : '',
    longitude: initial ? String(initial.point.longitude) : '', status: initial?.status ?? 'UNKNOWN', capacity: initial?.capacity == null ? '' : String(initial.capacity),
    remaining: initial?.remaining == null ? '' : String(initial.remaining), accessibility: initial?.accessibility ?? 'UNKNOWN',
    facilities: initial?.facilities.join(', ') ?? '', phone: initial?.phone ?? '', accessInstruction: initial?.accessInstruction ?? '',
    accessRestricted: initial?.accessRestricted ?? false, confirmStatus: false }));
  const [revision, setRevision] = useState(initial?.revision ?? 0);
  const [busy, setBusy] = useState(false), [uncertain, setUncertain] = useState(false), [error, setError] = useState<string | null>(null);
  const [archiveOpen, setArchiveOpen] = useState(false);
  const [reviewOpen, setReviewOpen] = useState(false);
  const pending = useRef<Pending | null>(null), running = useRef(false);
  const locked = busy || uncertain;
  const update = <K extends keyof typeof form>(key: K, value: typeof form[K]) => setForm(previous => ({ ...previous, [key]: value }));
  const back = () => router.replace({ pathname: '/authority/shelters', params: { jurisdictionId } });

  async function execute(next: Pending | null) {
    if (running.current || !next) return;
    running.current = true; setBusy(true); setError(null); pending.current = next;
    try {
      if (next.kind === 'SAVE') await save(next.args); else await archive(next.args);
      pending.current = null; setUncertain(false);
      router.replace({ pathname: '/authority/shelters', params: { jurisdictionId, ...(next.kind === 'SAVE' ? { saved: '1' } : { archived: '1' }) } });
    } catch (err) {
      if (!apiErrorCode(err)) { setUncertain(true); setError('authorityWriteUncertain'); }
      else { pending.current = null; setUncertain(false); setError(errorTranslationKey(err)); }
    } finally { running.current = false; setBusy(false); }
  }
  async function captureShelterPoint() {
    if (running.current || uncertain) return; running.current = true; setBusy(true); setError(null);
    try { const fix = await locate(); setForm(previous => ({ ...previous, latitude: String(fix.point.latitude), longitude: String(fix.point.longitude) })); }
    catch { setError('locationAction'); }
    finally { running.current = false; setBusy(false); }
  }
  // Explicit fields avoid accidentally sending local-only state in a server command.
  function saveForm() {
    if (locked) return;
    const { latitude, longitude, ...details } = form;
    const capacity = count(details.capacity), remaining = count(details.remaining);
    const point = { latitude: Number(latitude), longitude: Number(longitude) };
    for (const [field, value, minimum] of [['shelterName', details.name, 2], ['shelterAddress', details.address, 3]] as const) {
      if (value.trim().length < minimum) { setError(t('shelterFieldMinimum', { field: t(field), count: minimum })); return; }
    }
    if (!latitude.trim() || !longitude.trim() || !isValidPoint(point) || capacity === undefined || remaining === undefined) { setError('inputError'); return; }
    if (!details.confirmStatus && (!initial || details.status !== initial.status || capacity !== initial.capacity || remaining !== initial.remaining || point.latitude !== initial.point.latitude || point.longitude !== initial.point.longitude)) { setError('confirmStatusRequired'); return; }
    void execute({ kind: 'SAVE', args: { ...details, requestId: randomUUID(), expectedRevision: revision, jurisdictionId,
      ...(initial ? { shelterId: initial.id } : {}), point, capacity, remaining, facilities: details.facilities.split(',').map(value => value.trim()).filter(Boolean) } });
  }
  return <Screen footer={<>
    {!archiveOpen && error && <AppText style={{ color: theme.danger }} accessibilityLiveRegion="polite">{t(error)}</AppText>}
    <ActionButton title={t(uncertain ? 'retry' : 'saveShelter')} busy={busy} onPress={() => uncertain ? void execute(pending.current) : saveForm()} />
    <ActionButton title={t('cancel')} variant="secondary" disabled={locked} onPress={back} />
  </>}>
    <AppText variant="title">{t(initial ? 'editShelter' : 'addShelter')}</AppText>
    <AppText>{jurisdictionName} · {issuer}</AppText>{audience === 'DEMO' && <AppText>DEMO</AppText>}
    {initial && initial.revision !== revision && <View style={{ gap: 8 }}><AppText style={{ color: theme.warning }}>{t('conflictError')}</AppText>
      <ActionButton title={t('reviewLatestShelter')} variant="secondary" disabled={locked} onPress={() => setReviewOpen(true)} />
    </View>}
    <Field label={t('shelterName')} value={form.name} onChangeText={value => update('name', value)} maxLength={120} editable={!locked} />
    <Field label={t('shelterAddress')} value={form.address} onChangeText={value => update('address', value)} maxLength={500} multiline editable={!locked} />
    <AppText>{t('shelterPointHelp')}</AppText>
    <ActionButton title={t('selectShelterLocation')} variant="secondary" disabled={locked} onPress={() => { setPicked(form.latitude && form.longitude ? {latitude:Number(form.latitude),longitude:Number(form.longitude)} : null); setPickerOpen(true); }} />
    {form.latitude && form.longitude && <AppText variant="caption">{t('shelterLocationSelected')}</AppText>}
    <ActionButton title={t('shelterUseLocation')} variant="secondary" disabled={locked} onPress={() => void captureShelterPoint()} />
    <View style={{ gap: 8 }}><AppText variant="heading">{t('shelterStatusLabel')}</AppText>
      {(['OPEN', 'CLOSED', 'FULL', 'UNKNOWN'] as const).map(value => <Choice key={value} label={t(`shelter${value}`)} selected={form.status === value} disabled={locked} onPress={() => update('status', value)} />)}
    </View>
    <AppText variant="caption">{t('capacityUnknownHelp')}</AppText>
    <Field label={t('shelterCapacity')} value={form.capacity} onChangeText={value => update('capacity', value)} keyboardType="number-pad" editable={!locked} />
    <Field label={t('shelterRemaining')} value={form.remaining} onChangeText={value => update('remaining', value)} keyboardType="number-pad" editable={!locked} />
    <View style={{ gap: 8 }}><AppText variant="heading">{t('shelterAccessibility')}</AppText>
      {(['STEP_FREE', 'NOT_STEP_FREE', 'UNKNOWN'] as const).map(value => <Choice key={value} label={t(`access${value}`)} selected={form.accessibility === value} disabled={locked} onPress={() => update('accessibility', value)} />)}
    </View>
    <Field label={t('shelterFacilities')} value={form.facilities} onChangeText={value => update('facilities', value)} maxLength={1_000} editable={!locked} />
    <Field label={t('shelterPhone')} value={form.phone} onChangeText={value => update('phone', value)} keyboardType="phone-pad" maxLength={24} editable={!locked} />
    <Field label={t('shelterInstructions')} value={form.accessInstruction} onChangeText={value => update('accessInstruction', value)} maxLength={1_000} multiline editable={!locked} />
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}><AppText style={{ flex: 1 }}>{t('accessRestricted')}</AppText>
      <Switch accessibilityLabel={t('accessRestricted')} value={form.accessRestricted} onValueChange={value => update('accessRestricted', value)} disabled={locked} />
    </View>
    <View style={{ gap: 8 }}><View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}><AppText style={{ flex: 1 }}>{t('confirmShelterStatus')}</AppText>
      <Switch accessibilityLabel={t('confirmShelterStatus')} value={form.confirmStatus} onValueChange={value => update('confirmStatus', value)} disabled={locked} />
    </View><AppText variant="caption">{t('confirmShelterHelp')}</AppText></View>
    {initial && <ActionButton title={t('archiveShelter')} variant="secondary" disabled={locked} onPress={() => { setError(null); setArchiveOpen(true); }} />}
    <Modal visible={pickerOpen} animationType="slide" onRequestClose={() => setPickerOpen(false)}>
      <View style={{flex:1,backgroundColor:theme.background,paddingTop:safe.top}}>
        <View style={{padding:20,gap:8}}><AppText variant="heading">{t('selectShelterLocation')}</AppText><AppText>{t('tapShelterLocation')}</AppText></View>
        <AreaPicker center={fix?.point ?? null} selected={picked} radiusM={0} onSelect={setPicked} />
        <View style={{padding:20,paddingBottom:safe.bottom+20,gap:12}}>
          <ActionButton title={t('useSelectedLocation')} disabled={!picked} onPress={() => { if (picked) { setForm(previous=>({...previous,latitude:String(picked.latitude),longitude:String(picked.longitude)})); setPickerOpen(false); } }} />
          <ActionButton title={t('cancel')} variant="secondary" onPress={() => setPickerOpen(false)} />
        </View>
      </View>
    </Modal>
    <Modal visible={archiveOpen} transparent animationType="none" onRequestClose={() => { if (!locked) setArchiveOpen(false); }}>
      <View style={{ flex: 1, justifyContent: 'center', backgroundColor: theme.scrim, padding: 20, paddingTop: safe.top + 20, paddingBottom: safe.bottom + 20 }}>
        <View accessibilityViewIsModal style={{ width: '100%', maxWidth: 600, maxHeight: '90%', alignSelf: 'center', borderRadius: 24, backgroundColor: theme.surface, padding: 20, gap: 16 }}>
          <AppText variant="heading">{t('archiveShelter')}</AppText>
          <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={{ gap: 16 }}>
            <AppText>{t('archiveShelterHelp')}</AppText><AppText>{initial?.name}</AppText>
            {error && <AppText style={{ color: theme.danger }} accessibilityLiveRegion="polite">{t(error)}</AppText>}
          </ScrollView>
          <ActionButton title={t(uncertain ? 'retry' : 'archiveShelter')} busy={busy} onPress={() => {
            if (uncertain) void execute(pending.current);
            else if (initial) void execute({ kind: 'ARCHIVE', args: { requestId: randomUUID(), shelterId: initial.id, expectedRevision: revision } });
          }} />
          <ActionButton title={t('cancel')} variant="secondary" disabled={locked} onPress={() => setArchiveOpen(false)} />
        </View>
      </View>
    </Modal>
    <Modal visible={reviewOpen} transparent animationType="none" onRequestClose={() => setReviewOpen(false)}>
      <View style={{ flex: 1, justifyContent: 'center', backgroundColor: theme.scrim, padding: 20, paddingTop: safe.top + 20, paddingBottom: safe.bottom + 20 }}>
        <View accessibilityViewIsModal style={{ width: '100%', maxWidth: 600, maxHeight: '90%', alignSelf: 'center', borderRadius: 24, backgroundColor: theme.surface, padding: 20, gap: 16 }}>
          <AppText variant="heading">{t('reviewLatestShelter')}</AppText>
          <ScrollView contentContainerStyle={{ gap: 12 }}>
            <AppText>{t('reviewShelterHelp')}</AppText>
            {initial && <><AppText>{initial.name}</AppText><AppText>{initial.address}</AppText>
              <AppText>{initial.point.latitude}, {initial.point.longitude}</AppText><AppText>{t(`shelter${initial.status}`)}</AppText>
              <AppText>{t('shelterCapacity')}: {initial.capacity ?? t('unknownValue')}</AppText><AppText>{t('shelterRemaining')}: {initial.remaining ?? t('unknownValue')}</AppText>
              <AppText>{t(`access${initial.accessibility}`)}</AppText><AppText>{initial.facilities.join(', ')}</AppText>
              <AppText>{initial.phone}</AppText><AppText>{initial.accessInstruction}</AppText>
              <AppText>{t('accessRestricted')}: {t(initial.accessRestricted ? 'yes' : 'no')}</AppText>
            </>}
          </ScrollView>
          <ActionButton title={t('continueWithDraft')} onPress={() => { if (initial) setRevision(initial.revision); update('confirmStatus', false); setError(null); setReviewOpen(false); }} />
          <ActionButton title={t('cancel')} variant="secondary" onPress={() => setReviewOpen(false)} />
        </View>
      </View>
    </Modal>
  </Screen>;
}
