import { ActivityIndicator, Pressable, ScrollView, Text, View, type TextProps } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import type { PropsWithChildren } from 'react';
import { spacing, typography } from '../theme/tokens';
import { useTheme } from '../theme/useTheme';

export function AppText({ variant = 'body', style, ...props }: TextProps & { variant?: keyof typeof typography }) {
  const theme = useTheme();
  return <Text {...props} style={[typography[variant], { color: theme.text }, style]} />;
}
export function Screen({ children }: PropsWithChildren) {
  const theme = useTheme();
  return <SafeAreaView style={{ flex: 1, backgroundColor: theme.background }}>
    <ScrollView contentContainerStyle={{ flexGrow: 1, padding: spacing.xl, width: '100%', maxWidth: 640, alignSelf: 'center', gap: spacing.xxl }} keyboardShouldPersistTaps="handled">{children}</ScrollView>
  </SafeAreaView>;
}
export function ActionButton({ title, onPress, disabled = false, busy = false }: {
  title: string; onPress: () => void; disabled?: boolean; busy?: boolean;
}) {
  const theme = useTheme();
  return <Pressable onPress={onPress} disabled={disabled || busy} accessibilityRole="button" accessibilityState={{ disabled: disabled || busy, busy }}
    style={({ pressed }) => ({ minHeight: 52, borderRadius: 12, padding: spacing.lg, backgroundColor: theme.accent, opacity: disabled ? 0.55 : pressed ? 0.8 : 1, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: spacing.sm })}>
    {busy && <ActivityIndicator color={theme.onAccent} />}
    <AppText style={{ color: theme.onAccent, fontWeight: '600', textAlign: 'center', flexShrink: 1 }}>{title}</AppText>
  </Pressable>;
}
export function LoadingState() {
  const { t } = useTranslation(); const theme = useTheme();
  return <View accessibilityRole="progressbar" accessibilityLabel={t('loading')} style={{ padding: spacing.section, alignItems: 'center', gap: spacing.md }}>
    <ActivityIndicator color={theme.accent} /><AppText>{t('loading')}</AppText>
  </View>;
}
export function ErrorState({ message, onRetry }: { message?: string; onRetry?: () => void }) {
  const { t } = useTranslation(); const theme = useTheme();
  return <View accessibilityLiveRegion="polite" style={{ gap: spacing.lg }}>
    <AppText variant="heading" style={{ color: theme.danger }}>{t('errorTitle')}</AppText>
    <AppText>{message ?? t('errorMessage')}</AppText>
    {onRetry && <ActionButton title={t('retry')} onPress={onRetry} />}
  </View>;
}
export function EmptyState({ title, message }: { title?: string; message?: string }) {
  const { t } = useTranslation();
  return <View style={{ paddingVertical: spacing.section, gap: spacing.sm }}><AppText variant="heading">{title ?? t('emptyTitle')}</AppText>{message && <AppText>{message}</AppText>}</View>;
}
export function FreshnessBanner({ offline, stale }: { offline: boolean; stale: boolean }) {
  const { t } = useTranslation(); const theme = useTheme();
  if (!offline && !stale) return null;
  return <View accessibilityLiveRegion="polite" style={{ padding: spacing.md, borderLeftWidth: 3, borderLeftColor: theme.warning, backgroundColor: theme.muted }}>
    <AppText variant="caption">{t(offline ? 'offline' : 'stale')}</AppText>
  </View>;
}
