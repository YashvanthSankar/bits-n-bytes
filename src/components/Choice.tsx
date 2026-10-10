import { Circle, CircleCheck, type LucideIcon } from 'lucide-react-native';
import { Pressable } from 'react-native';
import { AppText } from './ui';
import { useTheme } from '../theme/useTheme';

export function Choice({ label, selected, onPress, disabled, icon: Icon }: { icon?: LucideIcon; label: string; selected: boolean; onPress: () => void; disabled?: boolean }) {
  const theme = useTheme();
  return <Pressable accessibilityRole="radio" accessibilityState={{ checked: selected, disabled: !!disabled }} onPress={onPress} disabled={disabled}
    style={({ pressed }) => ({ minHeight: 48, padding: 12, borderRadius: 14, borderCurve: 'continuous', borderWidth: 1, borderColor: selected ? theme.accent : theme.border,
      backgroundColor: selected ? theme.selection : theme.surface, flexDirection: 'row', alignItems: 'center', gap: 12, opacity: disabled ? 0.55 : pressed ? 0.8 : 1 })}>
    {Icon ? <Icon size={22} color={selected ? theme.accent : theme.secondary} accessible={false}/> : selected ? <CircleCheck size={20} color={theme.accent} accessible={false}/> : <Circle size={20} color={theme.secondary} accessible={false}/>}
    <AppText style={{ flex: 1, fontWeight: selected ? '600' : '400' }}>{label}</AppText>
  </Pressable>;
}
