import { useState } from 'react';
import { View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { ActionButton, AppText, Screen } from '../components/ui';
import { spacing } from '../theme/tokens';
import { useTheme } from '../theme/useTheme';

/** Location admission is implemented in the next location milestone; never bypass it. */
export default function LocationScreen() {
  const { t } = useTranslation(); const theme = useTheme(); const [unavailable, setUnavailable] = useState(false);
  return <Screen><View style={{ paddingTop: spacing.page, gap: spacing.lg }}>
    <AppText variant="title" accessibilityRole="header">{t('locationTitle')}</AppText>
    <AppText>{t('locationDescription')}</AppText>
    <AppText variant="caption" style={{ color: theme.secondary }}>{t('locationPrivacy')}</AppText>
  </View>
    {unavailable && <AppText accessibilityLiveRegion="polite" style={{ color: theme.danger }}>{t('serviceUnavailable')}</AppText>}
    <View style={{ marginTop: 'auto' }}><ActionButton title={t('locationAction')} onPress={() => setUnavailable(true)} /></View>
  </Screen>;
}
