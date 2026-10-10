import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { ActionButton, AppText, LoadingState, Screen } from '../components/ui';
import { LANGUAGE_CODES, type LanguageCode } from '../contracts/domain';
import { useLanguage } from '../i18n/LanguageProvider';
import { languageNames } from '../i18n/resources';
import { spacing } from '../theme/tokens';
import { useTheme } from '../theme/useTheme';

export default function LanguageScreen() {
  const { t } = useTranslation(); const theme = useTheme();
  const { language, ready, changeLanguage } = useLanguage();
  const [busy, setBusy] = useState(false); const [error, setError] = useState(false);
  async function select(code: LanguageCode) {
    setBusy(true); setError(false);
    try { await changeLanguage(code); } catch { setError(true); } finally { setBusy(false); }
  }
  return <Screen footer={<>
    {error && <AppText accessibilityLiveRegion="polite" style={{ color: theme.danger }}>{t('saveError')}</AppText>}
    <ActionButton title={t('continue')} disabled={!ready || busy || error} onPress={() => router.push('/location')} />
  </>}>
    <View style={{ paddingTop: spacing.section, gap: spacing.sm }}>
      <AppText variant="heading" style={{ color: theme.accent }}>GudTour</AppText>
      <AppText variant="caption" style={{ color: theme.secondary }}>{t('tagline')}</AppText>
    </View>
    <View style={{ gap: spacing.md }}><AppText variant="title" accessibilityRole="header">{t('languageTitle')}</AppText><AppText style={{ color: theme.secondary }}>{t('languageDescription')}</AppText></View>
    {!ready ? <LoadingState /> : <View accessibilityRole="radiogroup">
      {LANGUAGE_CODES.map((code) => <Pressable key={code} onPress={() => void select(code)} disabled={busy}
        accessibilityRole="radio" accessibilityState={{ checked: language === code, disabled: busy }} accessibilityLabel={`${languageNames[code].native}, ${languageNames[code].english}`}
        style={({ pressed }) => ({ minHeight: 64, padding: spacing.lg, borderBottomWidth: 1, borderBottomColor: theme.border, backgroundColor: language === code ? theme.selection : pressed ? theme.muted : 'transparent', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: spacing.md })}>
        <View style={{ flex: 1 }}><AppText style={{ fontWeight: '600' }}>{languageNames[code].native}</AppText><AppText variant="caption" style={{ color: theme.secondary }}>{languageNames[code].english}</AppText></View>
        <AppText style={{ color: theme.accent }}>{language === code ? '✓' : ''}</AppText>
      </Pressable>)}
    </View>}
  </Screen>;
}
