import type { Point } from '../contracts/domain';

/** Rendering only: a closed geodesic outline, preserving the canonical circle area. */
export function circleOutline(center: Point, radiusM: number): Point[] {
  const lat = center.latitude * Math.PI/180, lon = center.longitude * Math.PI/180;
  const angular = radiusM / 6_371_008.8;
  const points = Array.from({length:96},(_,i)=>{
    const bearing = i/96 * 2*Math.PI;
    const latitude = Math.asin(Math.sin(lat)*Math.cos(angular)+Math.cos(lat)*Math.sin(angular)*Math.cos(bearing));
    const longitude = lon+Math.atan2(Math.sin(bearing)*Math.sin(angular)*Math.cos(lat),Math.cos(angular)-Math.sin(lat)*Math.sin(latitude));
    return {latitude:latitude*180/Math.PI,longitude:((longitude*180/Math.PI+540)%360)-180};
  });
  return [...points,points[0]!];
}
