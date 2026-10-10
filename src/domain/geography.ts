import { booleanPointInPolygon } from '@turf/boolean-point-in-polygon';
import { distance } from '@turf/distance';
import { lineString, point } from '@turf/helpers';
import { pointToLineDistance } from '@turf/point-to-line-distance';
import type { MultiPolygon, Polygon } from 'geojson';
import type { AreaGeometry, CountryStatus, LocationFix, Point } from '../contracts/domain';
import indiaData from './data/india.geojson.json';
import { isValidPoint } from './eligibility';

type Boundary = Polygon | MultiPolygon;
const india = indiaData.features[0]!.geometry as MultiPolygon;
const xy = (p: Point) => [p.longitude, p.latitude];

export function distanceM(a: Point, b: Point): number {
  return distance(xy(a), xy(b), { units: 'meters' });
}

function boundaryRings(boundary: Boundary): number[][][] {
  return boundary.type === 'Polygon' ? boundary.coordinates : boundary.coordinates.flat();
}
export function distanceToBoundaryM(position: Point, boundary: Boundary): number {
  const p = point(xy(position));
  // GeoJSON edges are linear in coordinate space, matching point-in-polygon.
  // A great-circle edge can curve away from that boundary. Use planar projection
  // with a conservative latitude factor instead of combining incompatible edges.
  return Math.min(...boundaryRings(boundary).map(ring => {
    const maxLatitude = Math.max(Math.abs(position.latitude), ...ring.map(v => Math.abs(v[1]!)));
    const latitudeFactor = Math.max(0, Math.cos(maxLatitude * Math.PI / 180));
    return Math.max(0, pointToLineDistance(p, lineString(ring), { units: 'meters', method: 'planar' }) * latitudeFactor - 0.001);
  }));
}

/** Boundary intersections are uncertain: the complete accuracy circle must fit inside. */
export function countryStatus(fix: LocationFix, boundary: Boundary = india): CountryStatus {
  if (!isValidPoint(fix.point) || !Number.isFinite(fix.accuracyM) || fix.accuracyM < 0) return 'UNCERTAIN';
  if (distanceToBoundaryM(fix.point, boundary) <= fix.accuracyM) return 'UNCERTAIN';
  return booleanPointInPolygon(point(xy(fix.point)), boundary) ? 'INSIDE_INDIA' : 'OUTSIDE_INDIA';
}

export function asGeoJSON(area: Exclude<AreaGeometry, { type: 'circle' }>): Boundary {
  return area.type === 'polygon'
    ? { type: 'Polygon', coordinates: area.rings.map(r => r.map(xy)) }
    : { type: 'MultiPolygon', coordinates: area.polygons.map(p => p.map(r => r.map(xy))) };
}

/** Includes uncertainty-circle overlap for alerts; containment is deliberately stricter. */
export function overlapsArea(fix: LocationFix, area: AreaGeometry): boolean {
  if (!isValidPoint(fix.point) || !Number.isFinite(fix.accuracyM) || fix.accuracyM < 0) return false;
  if (area.type === 'circle') return distanceM(fix.point, area.center) <= area.radiusM + fix.accuracyM;
  const boundary = asGeoJSON(area);
  return booleanPointInPolygon(point(xy(fix.point)), boundary)
    || distanceToBoundaryM(fix.point, boundary) <= fix.accuracyM;
}
