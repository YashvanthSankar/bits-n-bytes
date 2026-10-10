import { View } from 'react-native';
import { AppText } from './ui';
import { useTheme } from '../theme/useTheme';

export function JourneyBrand({ inverse = false }: { inverse?: boolean }) {
  const theme = useTheme();
  return <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
      <View style={{ width: 20, height: 2, backgroundColor: inverse ? theme.onAccent : theme.text }} />
      <AppText variant="caption" style={{ letterSpacing: 2, fontWeight: '600', color: inverse ? theme.onAccent : theme.secondary }}>GUDTOUR</AppText>
    </View>;
}

export function JourneyHeader({ title, subtitle }: { title: string; subtitle?: string }) {
  const theme = useTheme();
  return <View style={{ gap: 8, paddingVertical: 2 }}>
    <JourneyBrand />
    <View style={{ gap: 4 }}>
      <AppText variant="title" accessibilityRole="header" style={{ fontSize: 24, lineHeight: 30, letterSpacing: -0.6 }}>{title}</AppText>
      {subtitle && <AppText variant="caption" style={{ color: theme.secondary }}>{subtitle}</AppText>}
    </View>
  </View>;
}
