import { Pressable } from 'react-native';
import { AppText } from './ui';
import { useTheme } from '../theme/useTheme';

export function Choice({ label, selected, onPress, disabled }: { label: string; selected: boolean; onPress: () => void; disabled?: boolean }) {
  const theme = useTheme();
  return <Pressable accessibilityRole="radio" accessibilityState={{ checked: selected, disabled: !!disabled }} onPress={onPress} disabled={disabled}
    style={({ pressed }) => ({ minHeight: 52, padding: 14, borderRadius: 12, borderWidth: selected ? 2 : 1, borderColor: selected ? theme.accent : theme.border,
      backgroundColor: selected ? theme.muted : theme.surface, flexDirection: 'row', alignItems: 'center', gap: 12, opacity: disabled ? 0.55 : pressed ? 0.8 : 1 })}>
    <AppText style={{ color: selected ? theme.accent : theme.secondary }} accessible={false}>{selected ? '●' : '○'}</AppText>
    <AppText style={{ flex: 1, fontWeight: selected ? '600' : '400' }}>{label}</AppText>
  </Pressable>;
}
