import { useConvexAuth, useMutation, useQuery } from 'convex/react';
import { router } from 'expo-router';
import { randomUUID } from 'expo-crypto';
import { useCallback, useEffect, useRef, useState } from 'react';
import * as Location from 'expo-location';
import { AppState, Linking, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { api } from '../../convex/_generated/api';
import { ActionButton, AppText, Screen } from '../components/ui';
import { errorTranslationKey } from '../domain/apiError';
import { currentIndiaFix, LocationFailure } from '../services/location';
import { useLocationSession } from '../session/LocationSession';
import { spacing } from '../theme/tokens';
import { useLanguage } from '../i18n/LanguageProvider';
import { useTheme } from '../theme/useTheme';

export default function LocationScreen() {
  const { t } = useTranslation(); const theme = useTheme();
  const { isLoading, isAuthenticated } = useConvexAuth();
  const own = useQuery(api.profiles.me, isAuthenticated ? {} : 'skip');
  const saveProfile = useMutation(api.profiles.save); const { language } = useLanguage();
  const update = useMutation(api.locations.update); const { setFix } = useLocationSession();
  const [busy, setBusy] = useState(false); const [error, setError] = useState<string | null>(null);
  const [settings, setSettings] = useState(false);
  const running = useRef(false);
  const locate = useCallback(async () => {
    if (running.current) return;
    running.current = true;
    setBusy(true); setError(null); setSettings(false); setFix(null);
    try {
      const { fix } = await currentIndiaFix(isAuthenticated ? async ({ fix, backgroundPermission }) => {
        await update({ requestId: randomUUID(), fix, foregroundPermission: 'granted', backgroundPermission, source: 'FOREGROUND' });
      } : undefined);
      if (own?.profile && own.profile.language !== language) {
        const profile = own.profile;
        await saveProfile({ requestId: randomUUID(), expectedRevision: profile.revision, name: profile.name, language, stepFreeNeeded: profile.stepFreeNeeded, ...(profile.bloodGroup === null ? {} : { bloodGroup: profile.bloodGroup }), ...(profile.emergencyContact === null ? {} : { emergencyContact: profile.emergencyContact }) });
      }
      setFix(fix); router.replace(isAuthenticated ? own?.profile ? '/map' : '/profile' : '/login');
    } catch (err) {
      if (err instanceof LocationFailure) {
        setSettings(err.settings);
        setError(({ disabled: 'locationDisabled', denied: 'permissionDenied', accuracy: 'inaccurateLocation', outside: 'outsideIndia', uncertain: 'uncertainLocation', unavailable: 'serviceUnavailable' })[err.reason]);
      } else setError(errorTranslationKey(err));
    } finally { running.current = false; setBusy(false); }
  }, [isAuthenticated, setFix, update, own, language, saveProfile]);
  useEffect(() => {
    if (isLoading || (isAuthenticated && own === undefined)) return;
    async function restore() {
      try {
        const permission = await Location.getForegroundPermissionsAsync();
        if (permission.granted) await locate();
      } catch { setError('serviceUnavailable'); }
    }
    void restore();
    const subscription = AppState.addEventListener('change', state => { if (state === 'active') void restore(); });
    return () => subscription.remove();
  }, [isLoading, isAuthenticated, own, locate]);
  return <Screen footer={<>
    <ActionButton title={t('locationAction')} busy={busy} disabled={isLoading || (isAuthenticated && own === undefined)} onPress={() => void locate()} />
    <ActionButton title={t('languageTitle')} variant="secondary" disabled={busy} onPress={() => router.replace('/')} />
  </>}><View style={{ paddingTop: spacing.page, gap: spacing.lg }}>
    <AppText variant="title" accessibilityRole="header">{t('locationTitle')}</AppText>
    <AppText>{t('locationDescription')}</AppText>
    <AppText variant="caption" style={{ color: theme.secondary }}>{t('locationPrivacy')}</AppText>
  </View>
    {error && <AppText accessibilityLiveRegion="polite" style={{ color: theme.danger }}>{t(error)}</AppText>}
    {settings && <ActionButton title={t('settings')} onPress={() => { void Linking.openSettings().catch(() => setError('serviceUnavailable')); }} />}
  </Screen>;
}
