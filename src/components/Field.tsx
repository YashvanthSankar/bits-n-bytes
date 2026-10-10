import { Platform, TextInput, View, type TextInputProps } from 'react-native';
import { AppText } from './ui';
import { useTheme } from '../theme/useTheme';

export function Field({ label, ...props }: TextInputProps & { label: string }) {
  const theme = useTheme();
  return <View style={{ gap: 6 }}><AppText variant="caption" style={{ fontWeight: '600', color: theme.secondary }}>{label}</AppText>
    <TextInput {...props} accessibilityLabel={label} placeholderTextColor={theme.secondary}
      style={[{ minHeight: 48, padding: 12, borderWidth: 1, borderColor: theme.border, borderRadius: 14, borderCurve: 'continuous', fontSize: 16, includeFontPadding: false, fontFamily: Platform.OS === 'android' ? 'Inter' : undefined, color: theme.text, backgroundColor: theme.surface }, props.style]} />
  </View>;
}
