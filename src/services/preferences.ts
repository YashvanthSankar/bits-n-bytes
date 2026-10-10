import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

/** Native preferences and auth tokens use OS-backed secure storage. Web is a development preview. */
export const preferenceStorage = {
  async getItem(key: string): Promise<string | null> {
    if (Platform.OS !== 'web') return SecureStore.getItemAsync(key);
    return typeof localStorage === 'undefined' ? null : localStorage.getItem(key);
  },
  async setItem(key: string, value: string): Promise<void> {
    if (Platform.OS !== 'web') return SecureStore.setItemAsync(key, value);
    if (typeof localStorage !== 'undefined') localStorage.setItem(key, value);
  },
  async removeItem(key: string): Promise<void> {
    if (Platform.OS !== 'web') return SecureStore.deleteItemAsync(key);
    if (typeof localStorage !== 'undefined') localStorage.removeItem(key);
  },
};
