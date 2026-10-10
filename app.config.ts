import type { ExpoConfig } from 'expo/config';

const androidMapsKey = process.env.GOOGLE_MAPS_ANDROID_API_KEY;
const config: ExpoConfig = {
  name: 'GudTour', slug: 'gudtour', version: '0.1.0', scheme: 'gudtour',
  orientation: 'default', userInterfaceStyle: 'automatic',
  ios: { bundleIdentifier: 'com.bitsnbytes.gudtour', supportsTablet: true },
  android: { package: 'com.bitsnbytes.gudtour', predictiveBackGestureEnabled: true },
  web: { output: 'static' },
  plugins: [
    'expo-router', 'expo-secure-store', 'expo-localization',
    ['expo-splash-screen', { backgroundColor: '#F6F7F4', dark: { backgroundColor: '#101917' } }],
    ['expo-location', {
      locationWhenInUsePermission: 'GudTour uses your location to show nearby hazards and shelter information in India.',
      locationAlwaysAndWhenInUsePermission: 'Allow background location to receive nearby emergency alerts when GudTour is closed.',
      isIosBackgroundLocationEnabled: true, isAndroidBackgroundLocationEnabled: true,
      isAndroidForegroundServiceEnabled: true,
    }],
    ['expo-notifications', { defaultChannel: 'emergencies' }],
    ...(androidMapsKey ? [['react-native-maps', { androidGoogleMapsApiKey: androidMapsKey }] as [string, Record<string, string>]] : []),
  ],
  experiments: { typedRoutes: true },
};
export default config;
