import { useConvexAuth } from 'convex/react';
import { router } from 'expo-router';
import { useEffect } from 'react';
import { NearbyMap } from '../components/NearbyMap';
import { useTranslation } from 'react-i18next';
import { ActionButton, AppText, Screen } from '../components/ui';
import { useLocationSession } from '../session/LocationSession';

export default function MapScreen() {
  const { t } = useTranslation(); const { isLoading, isAuthenticated } = useConvexAuth(); const { fix } = useLocationSession();
  useEffect(() => { if (!isLoading && (!isAuthenticated || !fix)) router.replace('/location'); }, [isLoading, isAuthenticated, fix]);
  return <Screen><AppText variant="heading">{t('mapTitle')}</AppText>
    {fix && <NearbyMap point={fix.point} />}
    <AppText>{t('mapPending')}</AppText>
    <ActionButton title={t('profileTitle')} onPress={() => router.push('/profile')} />
    <ActionButton title={t('locationAction')} onPress={() => router.replace('/location')} />
  </Screen>;
}
