import { ConvexReactClient } from 'convex/react';
import { ConvexAuthProvider } from '@convex-dev/auth/react';
import { preferenceStorage } from '../services/preferences';
import { LocationSession } from '../session/LocationSession';
import { ErrorState, Screen } from '../components/ui';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import type { PropsWithChildren } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { LanguageProvider } from '../i18n/LanguageProvider';
import { useTheme } from '../theme/useTheme';
import { GlobalEmergencyNotifications } from '../features/alerts/EmergencyAlerts';
import { AuthorityAccessSync } from '../session/AuthorityAccessSync';

const url = process.env.EXPO_PUBLIC_CONVEX_URL;
const convex = url ? new ConvexReactClient(url, { unsavedChangesWarning: false }) : null;
function BackendProvider({ children }: PropsWithChildren) {
  return convex ? <ConvexAuthProvider client={convex} storage={preferenceStorage} shouldHandleCode={false}><AuthorityAccessSync /><LocationSession>{children}<GlobalEmergencyNotifications /></LocationSession></ConvexAuthProvider> : <Screen><ErrorState /></Screen>;
}
function Navigation() {
  const theme = useTheme();
  return <><StatusBar style="auto" /><Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: theme.background } }} /></>;
}
export default function RootLayout() {
  return <SafeAreaProvider><LanguageProvider><BackendProvider><Navigation /></BackendProvider></LanguageProvider></SafeAreaProvider>;
}
