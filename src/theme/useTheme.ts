import { useColorScheme } from 'react-native';
import { colors } from './tokens';
export function useTheme() { return colors[useColorScheme() === 'dark' ? 'dark' : 'light']; }
