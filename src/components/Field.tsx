import { TextInput, View, type TextInputProps } from 'react-native';
import { AppText } from './ui';
import { useTheme } from '../theme/useTheme';

export function Field({ label, ...props }: TextInputProps & { label: string }) {
  const theme = useTheme();
  return <View style={{ gap: 8 }}><AppText style={{ fontWeight: '600' }}>{label}</AppText>
    <TextInput {...props} accessibilityLabel={label} placeholderTextColor={theme.secondary}
      style={[{ minHeight: 52, padding: 12, borderWidth: 1, borderColor: theme.border, borderRadius: 12, fontSize: 16, color: theme.text, backgroundColor: theme.surface }, props.style]} />
  </View>;
}
