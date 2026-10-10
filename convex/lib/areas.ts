import { difference } from '@turf/difference';
import { kinks } from '@turf/kinks';
import { booleanPointInPolygon } from '@turf/boolean-point-in-polygon';
import { feature, featureCollection, point, polygon } from '@turf/helpers';
import geohash from 'ngeohash';
import type { AreaGeometry, Point } from '../../src/contracts/domain';
import { asGeoJSON, distanceM, distanceToBoundaryM } from '../../src/domain/geography';
import { isValidPoint } from '../../src/domain/eligibility';
import { reject } from './errors';

const EARTH_M = 6_371_008.8;
const same = (a:Point,b:Point)=>a.latitude===b.latitude && a.longitude===b.longitude;
export function validateArea(area:AreaGeometry):void {
  if (area.type==='circle') {
    if (!isValidPoint(area.center) || !Number.isFinite(area.radiusM) || area.radiusM<=0 || area.radiusM>1_000_000) reject('INVALID_INPUT');
    return;
  }
  const polygons=area.type==='polygon'?[area.rings]:area.polygons;
  if (!polygons.length || polygons.length>32) reject('INVALID_INPUT');
  let count=0;
  for(const rings of polygons) {
    if(!rings.length || rings.length>32) reject('INVALID_INPUT');
    for(const ring of rings) {
      count+=ring.length;
      if(ring.length<4 || count>2048 || ring.some(p=>!isValidPoint(p)) || !same(ring[0]!,ring[ring.length-1]!)) reject('INVALID_INPUT');
      let twiceArea=0;
      for(let i=1;i<ring.length;i++) {
        if(same(ring[i-1]!,ring[i]!) || Math.abs(ring[i]!.longitude-ring[i-1]!.longitude)>180) reject('INVALID_INPUT');
        twiceArea+=ring[i-1]!.longitude*ring[i]!.latitude-ring[i]!.longitude*ring[i-1]!.latitude;
      }
      if(Math.abs(twiceArea)<1e-12) reject('INVALID_INPUT');
    }
    const geometry=asGeoJSON({type:'polygon',rings});
    if(kinks(geometry).features.length) reject('INVALID_INPUT');
    const exterior=polygon([geometry.coordinates[0]!] as number[][][]);
    for(let h=1;h<rings.length;h++) {
      if(!booleanPointInPolygon(point([rings[h]![0]!.longitude,rings[h]![0]!.latitude]),exterior,{ignoreBoundary:true})) reject('INVALID_INPUT');
      for(let other=1;other<h;other++) {
        const hole=polygon([rings[other]!.map(p=>[p.longitude,p.latitude])]);
        if(booleanPointInPolygon(point([rings[h]![0]!.longitude,rings[h]![0]!.latitude]),hole)) reject('INVALID_INPUT');
        const thisHole=polygon([rings[h]!.map(p=>[p.longitude,p.latitude])]);
        if(booleanPointInPolygon(point([rings[other]![0]!.longitude,rings[other]![0]!.latitude]),thisHole)) reject('INVALID_INPUT');
      }
    }
  }
  if(kinks(asGeoJSON(area)).features.length) reject('INVALID_INPUT');
  // Nested/overlapping components without crossing edges are invalid MultiPolygons too.
  for(let i=0;i<polygons.length;i++) for(let j=i+1;j<polygons.length;j++) {
    const a=polygons[i]!;const b=polygons[j]!;
    const inside=(p:Point,rings:readonly (readonly Point[])[])=>booleanPointInPolygon(point([p.longitude,p.latitude]),asGeoJSON({type:'polygon',rings}));
    if(inside(a[0]![0]!,b) || inside(b[0]![0]!,a)) reject('INVALID_INPUT');
  }
}
export function containsCircle(scope:AreaGeometry, affected:Extract<AreaGeometry,{type:'circle'}>):boolean {
  if(scope.type==='circle') return distanceM(scope.center,affected.center)+affected.radiusM<=scope.radiusM;
  const geometry=asGeoJSON(scope);
  return booleanPointInPolygon(point([affected.center.longitude,affected.center.latitude]),geometry)
    && distanceToBoundaryM(affected.center,geometry)>=affected.radiusM;
}
/** Bound every point of a coordinate-linear edge using a spherical arc-length bound. */
function edgeInsideCircle(a:Point,b:Point,scope:Extract<AreaGeometry,{type:'circle'}>,depth=0):boolean {
  const mid={latitude:(a.latitude+b.latitude)/2,longitude:(a.longitude+b.longitude)/2};
  const bound=EARTH_M*Math.PI/180*(Math.abs(a.latitude-b.latitude)+Math.abs(a.longitude-b.longitude))/2;
  const distance=distanceM(scope.center,mid);
  if(distance+bound<=scope.radiusM) return true;
  if(distance>scope.radiusM || distanceM(scope.center,a)>scope.radiusM || distanceM(scope.center,b)>scope.radiusM || depth>=16) return false;
  return edgeInsideCircle(a,mid,scope,depth+1) && edgeInsideCircle(mid,b,scope,depth+1);
}
export function containsArea(scope:AreaGeometry, affected:AreaGeometry):boolean {
  if(affected.type==='circle') return containsCircle(scope,affected);
  if(scope.type==='circle') {
    const polygons=affected.type==='polygon'?[affected.rings]:affected.polygons;
    return polygons.every(rings=>rings.every(ring=>ring.slice(1).every((end,i)=>edgeInsideCircle(ring[i]!,end,scope))));
  }
  // Empty geometric difference proves no polygon interior, concavity or hole crosses the scope.
  return difference(featureCollection([feature(asGeoJSON(affected)),feature(asGeoJSON(scope))]))===null;
}
export function areaBounds(area:AreaGeometry, bufferM=0) {
  let minLat:number,maxLat:number,minLon:number,maxLon:number;
  if(area.type==='circle') {
    const angular=area.radiusM/EARTH_M; const deltaLat=angular*180/Math.PI;
    minLat=Math.max(-90,area.center.latitude-deltaLat);maxLat=Math.min(90,area.center.latitude+deltaLat);
    const deltaLon=minLat<=-90 || maxLat>=90?180:Math.asin(Math.min(1,Math.sin(angular)/Math.cos(area.center.latitude*Math.PI/180)))*180/Math.PI;
    minLon=area.center.longitude-deltaLon;maxLon=area.center.longitude+deltaLon;
  } else {
    const points=area.type==='polygon'?area.rings.flat():area.polygons.flat(2);
    minLat=Math.min(...points.map(p=>p.latitude));maxLat=Math.max(...points.map(p=>p.latitude));
    minLon=Math.min(...points.map(p=>p.longitude));maxLon=Math.max(...points.map(p=>p.longitude));
  }
  const latitudeBuffer=bufferM/EARTH_M*180/Math.PI;
  const longitudeBuffer=latitudeBuffer/Math.max(.001,Math.cos(Math.max(Math.abs(minLat),Math.abs(maxLat))*Math.PI/180));
  return {minLat:Math.max(-90,minLat-latitudeBuffer),maxLat:Math.min(90,maxLat+latitudeBuffer),minLon:Math.max(-180,minLon-longitudeBuffer),maxLon:Math.min(180,maxLon+longitudeBuffer)};
}
/** Prefix cells include up to one kilometre of eligible location uncertainty. */
export function coveringCells(area:AreaGeometry):string[] {
  const bounds=areaBounds(area,1000);
  const cells=geohash.bboxes(bounds.minLat,bounds.minLon,bounds.maxLat,bounds.maxLon,3);
  if(cells.length>2048) reject('CONFIGURATION_REQUIRED');
  return [...new Set(cells)].sort();
}
