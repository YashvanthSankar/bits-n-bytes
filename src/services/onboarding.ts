import { preferenceStorage } from './preferences';
const KEY = 'gudtour.setup-completed.v1';
export async function hasCompletedSetup() {
  try { return await preferenceStorage.getItem(KEY) === '1'; } catch { return false; }
}
/** Only a completion flag is stored here, never a location or profile. */
export async function rememberCompletedSetup() {
  try { await preferenceStorage.setItem(KEY, '1'); } catch { /* Authenticated profile still establishes returning-user status. */ }
}
