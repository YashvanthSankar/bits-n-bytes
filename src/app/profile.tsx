import { useAuthActions } from '@convex-dev/auth/react';
import { useConvexAuth, useMutation, useQuery } from 'convex/react';
import { randomUUID } from 'expo-crypto';
import { router, useFocusEffect } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Switch, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { api } from '../../convex/_generated/api';
import { ActionButton, AppText, LoadingState, Screen } from '../components/ui';
import { Field } from '../components/Field';
import { errorTranslationKey } from '../domain/apiError';
import { useLanguage } from '../i18n/LanguageProvider';
import { useLocationSession } from '../session/LocationSession';

export default function ProfileScreen() {
  const { t } = useTranslation(); const { language } = useLanguage(); const { isAuthenticated, isLoading } = useConvexAuth();
  const own = useQuery(api.profiles.me, isAuthenticated ? {} : 'skip'); const save = useMutation(api.profiles.save);
  const { signOut } = useAuthActions(); const { fix, setFix, setSignedOut } = useLocationSession();
  const [name, setName] = useState(''); const [blood, setBlood] = useState('');
  const [contactName, setContactName] = useState(''); const [phone, setPhone] = useState(''); const [stepFree, setStepFree] = useState(false);
  const [busy, setBusy] = useState(false); const [error, setError] = useState<string | null>(null); const loaded = useRef(false);
  useFocusEffect(useCallback(() => { if (!isLoading && !isAuthenticated) router.replace('/login'); }, [isLoading, isAuthenticated]));
  useEffect(() => { if (own?.profile && !loaded.current) {
    loaded.current = true; setName(own.profile.name); setBlood(own.profile.bloodGroup ?? '');
    setContactName(own.profile.emergencyContact?.name ?? ''); setPhone(own.profile.emergencyContact?.phone ?? ''); setStepFree(own.profile.stepFreeNeeded);
  } }, [own]);
  async function submit() {
    if (!fix && !own?.profile) { router.replace('/location'); return; }
    setBusy(true); setError(null);
    try {
      await save({ requestId: randomUUID(), expectedRevision: own?.profile?.revision ?? 0, name, language, ...(blood.trim() ? { bloodGroup: blood.trim().toUpperCase() } : {}), ...((contactName.trim() || phone.trim()) ? { emergencyContact: { name: contactName.trim(), phone: phone.trim() } } : {}), stepFreeNeeded: stepFree });
      router.replace('/map');
    } catch (err) { setError(errorTranslationKey(err)); } finally { setBusy(false); }
  }
  async function logout() {
    setBusy(true); setError(null);
    setSignedOut(true);
    try { await signOut(); setFix(null); router.replace('/login'); } catch { setSignedOut(false); setError('serviceUnavailable'); } finally { setBusy(false); }
  }
  if (isLoading || (isAuthenticated && own === undefined)) return <Screen><LoadingState /></Screen>;
  return <Screen footer={<>
    <ActionButton title={t('saveContinue')} onPress={() => void submit()} busy={busy} disabled={name.trim().length < 2} />
    <ActionButton title={t('signOut')} variant="secondary" onPress={() => void logout()} disabled={busy} />
  </>}><AppText variant="title" accessibilityRole="header">{t('profileTitle')}</AppText><AppText>{t('profilePrivacy')}</AppText>
    <Field label={t('nameLabel')} value={name} onChangeText={setName} maxLength={80} autoComplete="name" editable={!busy} />
    <Field label={t('bloodLabel')} value={blood} onChangeText={setBlood} maxLength={3} autoCapitalize="characters" editable={!busy} />
    <Field label={t('contactNameLabel')} value={contactName} onChangeText={setContactName} maxLength={80} editable={!busy} />
    <Field label={t('contactPhoneLabel')} value={phone} onChangeText={setPhone} maxLength={24} keyboardType="phone-pad" editable={!busy} />
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 16 }}><AppText style={{ flex: 1 }}>{t('stepFreeLabel')}</AppText><Switch value={stepFree} onValueChange={setStepFree} disabled={busy} accessibilityLabel={t('stepFreeLabel')} /></View>
    {own?.profile && <AppText>{t('aliasLabel')}: {own.profile.alias}</AppText>}
    {error && <AppText accessibilityLiveRegion="polite">{t(error)}</AppText>}
  </Screen>;
}
