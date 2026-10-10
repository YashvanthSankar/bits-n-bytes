import type { Point } from '../contracts/domain';
import { isValidPoint } from './eligibility';

export function coordinates(point: Point): string {
  if (!isValidPoint(point)) throw new Error('Invalid destination');
  return `${point.latitude},${point.longitude}`;
}
/** Universal Google Maps URL falls back to browser when the native app is absent. */
export function shelterMapsUrl(point: Point): string {
  return 'https://www.google.com/maps/dir/?api=1&destination=' + encodeURIComponent(coordinates(point));
}
export function shelterPhoneUrl(phone: string): string | null {
  if (!/^\+?[0-9 ()-]{7,24}$/.test(phone)) return null;
  return 'tel:' + phone.replace(/[ ()-]/g, '');
}
export function shelterCopyText(shelter: { name: string; address: string; point: Point }): string {
  return [shelter.name, shelter.address, coordinates(shelter.point)].join('\n');
}
