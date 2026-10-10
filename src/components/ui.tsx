import { ArrowRight, type LucideIcon } from 'lucide-react-native';
import { ActivityIndicator, KeyboardAvoidingView, Platform, Pressable, ScrollView, Text, View, type TextProps } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import type { PropsWithChildren, ReactNode } from 'react';
import { spacing, typography } from '../theme/tokens';
import { useTheme } from '../theme/useTheme';
import { useNavigationInset } from '../navigation/NavigationInset';

export function AppText({ variant = 'body', style, ...props }: TextProps & { variant?: keyof typeof typography }) {
  const theme = useTheme();
  return <Text {...props} style={[typography[variant], { color: theme.text, fontFamily: Platform.OS === 'android' ? 'Inter' : undefined }, style]} />;
}
export function Screen({ children, footer }: PropsWithChildren<{ footer?: ReactNode }>) {
  const theme = useTheme();
  const navigationInset = useNavigationInset();
  return <SafeAreaView edges={navigationInset === null ? ['top', 'bottom', 'left', 'right'] : ['top', 'left', 'right']} style={{ flex: 1, backgroundColor: theme.background }}>
    <View style={{flex:1,paddingBottom:navigationInset??0}}>
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
    <ScrollView style={{ flex: 1 }} contentContainerStyle={{ flexGrow: 1, padding: spacing.xl, width: '100%', maxWidth: 640, alignSelf: 'center', gap: spacing.xl }} keyboardShouldPersistTaps="handled">{children}</ScrollView>
    {footer && <View style={{ borderTopWidth: 1, borderTopColor: theme.border, backgroundColor: theme.background }}>
      <View style={{ width: '100%', maxWidth: 640, alignSelf: 'center', paddingHorizontal: spacing.xl, paddingVertical: spacing.lg, gap: spacing.md }}>{footer}</View>
    </View>}
    </KeyboardAvoidingView>
    </View>
  </SafeAreaView>;
}
export function ActionButton({ title, onPress, disabled = false, busy = false, variant = 'primary', icon: Icon = ArrowRight, iconOnly = false }: {
  iconOnly?: boolean; icon?: LucideIcon; title: string; onPress: () => void; disabled?: boolean; busy?: boolean; variant?: 'primary' | 'secondary' | 'danger';
}) {
  const theme = useTheme();
  return <Pressable onPress={onPress} disabled={disabled || busy} accessibilityRole="button" accessibilityLabel={title} accessibilityState={{ disabled: disabled || busy, busy }}
    style={({ pressed }) => ({ minHeight: 52, minWidth: 52, borderRadius: 16, padding: spacing.lg, borderWidth: variant === 'primary' ? 0 : 1, borderColor: theme.border, backgroundColor: variant === 'primary' ? theme.accent : theme.surface, opacity: disabled ? 0.55 : pressed ? 0.8 : 1, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: spacing.sm })}>
    {busy && <ActivityIndicator color={variant === 'primary' ? theme.onAccent : variant === 'danger' ? theme.danger : theme.accent} />}
    {!busy && <Icon size={20} accessible={false} color={variant === 'primary' ? theme.onAccent : variant === 'danger' ? theme.danger : theme.accent} />}
    {!iconOnly && <AppText style={{ color: variant === 'primary' ? theme.onAccent : variant === 'danger' ? theme.danger : theme.text, fontWeight: '600', textAlign: 'center', flexShrink: 1 }}>{title}</AppText>}
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
