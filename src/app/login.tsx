import { useAuthActions } from '@convex-dev/auth/react';
import { useConvexAuth } from 'convex/react';
import { router } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import { useEffect, useState } from 'react';
import { Platform } from 'react-native';
import { useTranslation } from 'react-i18next';
import { ActionButton, AppText, Screen } from '../components/ui';
import { NATIVE_AUTH_CALLBACK } from '../domain/authRedirect';
import { validateIndiaFix } from '../domain/eligibility';
import { countryStatus } from '../domain/geography';
import { consumeAuthCode, codeFromCallback } from '../services/authCallback';
import { useLocationSession } from '../session/LocationSession';

export default function LoginScreen() {
  const { t } = useTranslation(); const { signIn } = useAuthActions();
  const { isAuthenticated, isLoading } = useConvexAuth(); const { fix } = useLocationSession();
  const [busy, setBusy] = useState(false); const [error, setError] = useState(false);
  useEffect(() => { if (isAuthenticated) router.replace('/location'); }, [isAuthenticated]);
  async function login() {
    if (!fix || !validateIndiaFix(fix, countryStatus(fix), Date.now()).ok) { router.replace('/location'); return; }
    setBusy(true); setError(false);
    try {
      const started = await signIn('google', { redirectTo: NATIVE_AUTH_CALLBACK });
      if (!started.redirect) throw new Error('Missing redirect');
      const response = await WebBrowser.openAuthSessionAsync(started.redirect.toString(), NATIVE_AUTH_CALLBACK);
      if (response.type === 'success') {
        await consumeAuthCode(codeFromCallback(response.url), code => signIn('google', { code }));
        router.replace('/location');
      }
    } catch { setError(true); } finally { setBusy(false); }
  }
  return <Screen footer={<>
    <ActionButton title={t('googleSignIn')} disabled={isLoading || Platform.OS === 'web'} busy={busy} onPress={() => void login()} />
    <ActionButton title={t('locationAction')} variant="secondary" disabled={busy} onPress={() => router.replace('/location')} />
  </>}><AppText variant="title" accessibilityRole="header">{t('loginTitle')}</AppText><AppText>{t('loginDescription')}</AppText>
    {error && <AppText accessibilityLiveRegion="polite">{t('serviceUnavailable')}</AppText>}
    {Platform.OS === 'web' && <AppText>{t('nativeRequired')}</AppText>}
  </Screen>;
}
