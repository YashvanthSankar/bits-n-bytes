import * as Linking from 'expo-linking';
import { runtimeAuthCallback } from '../domain/authRedirect';

/** createURL resolves the Expo Go host; installed builds retain GudTour's stable scheme. */
export function getAuthCallback(): string {
  return runtimeAuthCallback(Linking.createURL('auth/callback'));
}
