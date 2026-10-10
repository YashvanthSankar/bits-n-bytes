import * as Location from 'expo-location';
import type { LocationFix, PermissionState } from '../contracts/domain';
import { countryStatus } from '../domain/geography';
import { validateIndiaFix } from '../domain/eligibility';

export class LocationFailure extends Error {
  constructor(public readonly reason: 'disabled' | 'denied' | 'accuracy' | 'outside' | 'uncertain' | 'unavailable', public readonly settings = false) { super(reason); }
}
export async function currentIndiaFix(): Promise<{ fix: LocationFix; backgroundPermission: PermissionState }> {
  if (!await Location.hasServicesEnabledAsync()) throw new LocationFailure('disabled', true);
  let permission = await Location.getForegroundPermissionsAsync();
  if (!permission.granted && permission.canAskAgain) permission = await Location.requestForegroundPermissionsAsync();
  if (!permission.granted) throw new LocationFailure('denied', !permission.canAskAgain);
  // GPS may hang with disabled simulator location. A timeout never admits a stale fallback.
  let timer: ReturnType<typeof setTimeout> | undefined;
  let position: Location.LocationObject;
  try {
    position = await Promise.race([
      Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High }),
      new Promise<never>((_, reject) => { timer = setTimeout(() => reject(new LocationFailure('unavailable')), 25_000); }),
    ]);
  } finally { if (timer) clearTimeout(timer); }
  const fix: LocationFix = { point: { latitude: position.coords.latitude, longitude: position.coords.longitude }, observedAt: position.timestamp, accuracyM: position.coords.accuracy ?? Infinity };
  const checked = validateIndiaFix(fix, countryStatus(fix), Date.now());
  if (!checked.ok) throw new LocationFailure(checked.error.code === 'OUTSIDE_INDIA' ? 'outside' : checked.error.code === 'COUNTRY_UNCERTAIN' ? 'uncertain' : 'accuracy');
  const background = await Location.getBackgroundPermissionsAsync();
  return { fix, backgroundPermission: background.status };
}
