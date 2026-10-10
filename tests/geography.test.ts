import { describe, expect, it } from 'vitest';
import type { Polygon } from 'geojson';
import { countryStatus, distanceM, overlapsArea } from '../src/domain/geography';

const makeFix = (latitude: number, longitude: number, accuracyM = 20) => ({ point: { latitude, longitude }, observedAt: 1, accuracyM });
const box: Polygon = { type: 'Polygon', coordinates: [[[79, 12], [81, 12], [81, 14], [79, 14], [79, 12]]] };

describe('country admission and exact geometry', () => {
  it.each([[12.82, 80.04], [28.61, 77.20], [11.66, 92.73], [10.567, 72.637]])('admits interior mainland/island point %s,%s', (lat, lon) => {
    expect(countryStatus(makeFix(lat, lon))).toBe('INSIDE_INDIA');
  });
  it.each([[6.93, 79.85], [27.72, 85.32], [1.35, 103.82]])('rejects nearby foreign point %s,%s', (lat, lon) => {
    expect(countryStatus(makeFix(lat, lon))).toBe('OUTSIDE_INDIA');
  });
  it('does not admit an accuracy circle crossing the boundary on either side', () => {
    expect(countryStatus(makeFix(13, 79.00001, 20), box)).toBe('UNCERTAIN');
    expect(countryStatus(makeFix(13, 78.99999, 20), box)).toBe('UNCERTAIN');
    expect(countryStatus(makeFix(13, 79, 0), box)).toBe('UNCERTAIN');
  });
  it('respects holes rather than treating the polygon bounding box as eligible', () => {
    const withHole: Polygon = { ...box, coordinates: [...box.coordinates, [[79.5, 12.5], [80.5, 12.5], [80.5, 13.5], [79.5, 13.5], [79.5, 12.5]]] };
    expect(countryStatus(makeFix(13, 80), withHole)).toBe('OUTSIDE_INDIA');
    expect(countryStatus(makeFix(12.50001, 80), withHole)).toBe('UNCERTAIN');
  });
  it('includes uncertain edge overlap in hazard targeting', () => {
    const center = makeFix(13, 80).point;
    const outside = makeFix(13, 80.05, 30);
    const radiusM = distanceM(center, outside.point) - 20;
    expect(overlapsArea(outside, { type: 'circle', center, radiusM })).toBe(true);
    expect(overlapsArea({ ...outside, accuracyM: 0 }, { type: 'circle', center, radiusM })).toBe(false);
  });
  it('targets polygon overlaps and excludes a distant point', () => {
    const area = { type: 'polygon' as const, rings: box.coordinates.map(r => r.map(([longitude, latitude]) => ({ latitude: latitude!, longitude: longitude! }))) };
    expect(overlapsArea(makeFix(13, 79.00001), area)).toBe(true);
    expect(overlapsArea(makeFix(13, 78.99999), area)).toBe(true);
    expect(overlapsArea(makeFix(13, 77), area)).toBe(false);
  });
});
