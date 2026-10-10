import { useConvexAuth, useMutation, useQuery } from 'convex/react';
import { router, useLocalSearchParams, useFocusEffect } from 'expo-router';
import { randomUUID } from 'expo-crypto';
import * as Location from 'expo-location';
import { useCallback, useEffect, useState, useRef, type PropsWithChildren } from 'react';
import { api } from '../../convex/_generated/api';
import { useLanguage } from '../i18n/LanguageProvider';
import { useLocationSession } from '../session/LocationSession';
import { currentIndiaFix } from '../services/location';
import { hasCompletedSetup, rememberCompletedSetup } from '../services/onboarding';
import { LoadingState, Screen } from './ui';

/** Cold starts wait for hydration; returning users refresh admission without replaying onboarding. */
export function StartupGate({ children }: PropsWithChildren) {
  const { language: chooseLanguage } = useLocalSearchParams<{ language?: string }>();
  const explicitLanguage = chooseLanguage === '1';
  const { ready } = useLanguage();
  const { isAuthenticated, isLoading } = useConvexAuth();
  const { fix: sessionFix, setFix, signedOut } = useLocationSession();
  const own = useQuery(api.profiles.me, isAuthenticated && !signedOut && !explicitLanguage ? {} : 'skip');
  const update = useMutation(api.locations.update);
  const [completed, setCompleted] = useState<boolean | null>(null);
  useEffect(() => { let alive = true; void hasCompletedSetup().then(value => { if (alive) setCompleted(value); }); return () => { alive = false; }; }, []);
  const waiting = !ready || isLoading || completed === null || (isAuthenticated && !signedOut && !explicitLanguage && own === undefined);
  const hasProfile = !!own?.profile;
  const navigated = useRef(false);
  const navigate = useCallback((path: '/login' | '/location' | '/map') => {
    if (navigated.current) return;
    navigated.current = true;
    router.replace(path);
  }, []);
  useFocusEffect(useCallback(() => {
    if (waiting || explicitLanguage || navigated.current) return;
    let active = true;
    if (signedOut || !isAuthenticated) {
      if (completed || signedOut) navigate('/login');
      return;
    }
    if (!hasProfile) { navigate('/location'); return; }
    if (sessionFix) { navigate('/map'); return; }
    void (async () => {
      await rememberCompletedSetup();
      if (!active) return;
      try {
        const permission = await Location.getForegroundPermissionsAsync();
        if (!active) return;
        if (!permission.granted) { navigate('/location'); return; }
        const { fix } = await currentIndiaFix(async ({ fix, backgroundPermission }) => {
          if (!active) return;
          await update({ requestId: randomUUID(), fix, foregroundPermission: 'granted', backgroundPermission, source: 'FOREGROUND' });
        });
        if (active) { setFix(fix); navigate('/map'); }
      } catch { if (active) { setFix(null); navigate('/location'); } }
    })();
    return () => { active = false; };
  }, [waiting, explicitLanguage, signedOut, isAuthenticated, completed, hasProfile, update, setFix, sessionFix, navigate]));
  if (explicitLanguage && ready) return children;
  if (waiting || isAuthenticated || signedOut || completed) return <Screen><LoadingState /></Screen>;
  return children;
}
