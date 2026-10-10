import type { ExpoConfig } from 'expo/config';

const androidMapsKey = process.env.GOOGLE_MAPS_ANDROID_API_KEY;
const config: ExpoConfig = {
  name: 'GudTour', slug: 'gudtour', owner: 'yashvanths-org', version: '0.1.0', scheme: 'gudtour',
  extra: { eas: { projectId: '809ee1d1-47b4-4676-a726-23c8a203bbd4' } },
  orientation: 'default', userInterfaceStyle: 'automatic',
  ios: { bundleIdentifier: 'com.bitsnbytes.gudtour', supportsTablet: true },
  android: {
    package: 'com.bitsnbytes.gudtour', predictiveBackGestureEnabled: true,
    adaptiveIcon: { foregroundImage: './assets/brand/gudtour-logo.png', backgroundColor: '#F6F7F4' },
  },
  web: { output: 'static' },
  plugins: [
    'expo-router', 'expo-secure-store', 'expo-localization',
    ['expo-splash-screen', {
      image: './assets/brand/gudtour-logo.png', imageWidth: 200, resizeMode: 'contain',
      backgroundColor: '#F6F7F4',
      dark: { image: './assets/brand/gudtour-logo.png', backgroundColor: '#101917' },
    }],
    ['expo-location', {
      locationWhenInUsePermission: 'GudTour uses your location to show nearby hazards and shelter information in India.',
      locationAlwaysAndWhenInUsePermission: 'Allow background location to keep your latest location updated. Emergency alerts appear while GudTour is open.',
      isIosBackgroundLocationEnabled: true, isAndroidBackgroundLocationEnabled: true,
      isAndroidForegroundServiceEnabled: true,
    }],
    ['expo-notifications', { defaultChannel: 'emergencies' }],
    ...(androidMapsKey ? [['react-native-maps', { androidGoogleMapsApiKey: androidMapsKey }] as [string, Record<string, string>]] : []),
  ],
  experiments: { typedRoutes: true },
};
export default config;
