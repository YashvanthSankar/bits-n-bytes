import { useAuthActions } from '@convex-dev/auth/react';
import { useConvexAuth } from 'convex/react';
import { router, useFocusEffect } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import { useCallback, useRef, useState } from 'react';
import { Platform } from 'react-native';
import { useTranslation } from 'react-i18next';
import { ActionButton, AppText, Screen } from '../components/ui';
import { getAuthCallback } from '../services/authRuntime';
import { validateIndiaFix } from '../domain/eligibility';
import { countryStatus } from '../domain/geography';
import { consumeAuthCode, codeFromCallback } from '../services/authCallback';
import { currentIndiaFix, LocationFailure } from '../services/location';
import { useLocationSession } from '../session/LocationSession';
import { JourneyHeader } from '../components/JourneyHeader';
import { JourneyMark } from '../components/JourneyMark';

export default function LoginScreen() {
  const { t } = useTranslation(); const { signIn } = useAuthActions();
  const { isAuthenticated, isLoading } = useConvexAuth(); const { fix, setFix, signedOut, setSignedOut } = useLocationSession();
  const [busy, setBusy] = useState(false); const [error, setError] = useState<string | null>(null); const running = useRef(false);
  useFocusEffect(useCallback(() => { if (isAuthenticated && !signedOut) router.replace('/location'); }, [isAuthenticated, signedOut]));
  async function login() {
    if (running.current) return;
    running.current = true; setBusy(true); setError(null);
    try {
      if (!fix || !validateIndiaFix(fix, countryStatus(fix), Date.now()).ok) {
        const captured = await currentIndiaFix(); setFix(captured.fix);
      }
      const callback = getAuthCallback();
      const started = await signIn('google', { redirectTo: callback });
      if (!started.redirect) throw new Error('Missing redirect');
      const response = await WebBrowser.openAuthSessionAsync(started.redirect.toString(), callback);
      if (response.type === 'success') {
        await consumeAuthCode(codeFromCallback(response.url, callback), code => signIn('google', { code }));
        // The focused auth guard performs the single post-login navigation.
        setSignedOut(false);
      }
    } catch (err) {
      setError(err instanceof LocationFailure ? ({ disabled: 'locationDisabled', denied: 'permissionDenied', accuracy: 'inaccurateLocation', outside: 'outsideIndia', uncertain: 'uncertainLocation', unavailable: 'serviceUnavailable' })[err.reason] : 'serviceUnavailable');
    } finally { running.current = false; setBusy(false); }
  }
  return <Screen footer={<>
    <ActionButton title={t('googleSignIn')} disabled={isLoading || Platform.OS === 'web'} busy={busy} onPress={() => void login()} />
    <ActionButton title={t('locationAction')} variant="secondary" disabled={busy} onPress={() => router.replace('/location')} />
  </>}><JourneyHeader title={t('loginTitle')} /><JourneyMark /><AppText>{t('loginDescription')}</AppText>
    {error && <AppText accessibilityLiveRegion="polite">{t(error)}</AppText>}
    {Platform.OS === 'web' && <AppText>{t('nativeRequired')}</AppText>}
  </Screen>;
}
