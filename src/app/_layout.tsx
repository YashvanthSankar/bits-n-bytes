import { ConvexProvider, ConvexReactClient } from 'convex/react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import type { PropsWithChildren } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { LanguageProvider } from '../i18n/LanguageProvider';
import { useTheme } from '../theme/useTheme';

const url = process.env.EXPO_PUBLIC_CONVEX_URL;
const convex = url ? new ConvexReactClient(url, { unsavedChangesWarning: false }) : null;
function BackendProvider({ children }: PropsWithChildren) {
  return convex ? <ConvexProvider client={convex}>{children}</ConvexProvider> : children;
}
function Navigation() {
  const theme = useTheme();
  return <><StatusBar style="auto" /><Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: theme.background } }} /></>;
}
export default function RootLayout() {
  return <SafeAreaProvider><LanguageProvider><BackendProvider><Navigation /></BackendProvider></LanguageProvider></SafeAreaProvider>;
}
