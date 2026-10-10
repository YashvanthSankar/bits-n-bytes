import { describe,expect,it } from 'vitest';
import { containsArea,coveringCells,validateArea } from '../convex/lib/areas';
import type { AreaGeometry } from '../src/contracts/domain';
import geohash from 'ngeohash';

const ring=(values:number[][])=>values.map(([longitude,latitude])=>({latitude:latitude!,longitude:longitude!}));
const square=(west:number,south:number,east:number,north:number)=>ring([[west,south],[east,south],[east,north],[west,north],[west,south]]);
const area=(rings:ReturnType<typeof ring>[]):AreaGeometry=>({type:'polygon',rings});
describe('complete authority geometry scope',()=>{
 it('rejects an area that covers a jurisdiction hole even when every vertex is inside',()=>{
  const scope=area([square(80,13,81,14),square(80.4,13.4,80.6,13.6)]);
  const affected=area([square(80.2,13.2,80.8,13.8)]);
  validateArea(scope);validateArea(affected);
  expect(containsArea(scope,affected)).toBe(false);
  expect(containsArea(scope,area([square(80.1,13.1,80.3,13.3)]))).toBe(true);
 });
 it('rejects edges crossing a concave jurisdiction with otherwise contained vertices',()=>{
  const scope=area([ring([[80,13],[81,13],[81,14],[80.7,14],[80.7,13.3],[80.3,13.3],[80.3,14],[80,14],[80,13]])]);
  expect(containsArea(scope,area([ring([[80.1,13.8],[80.9,13.8],[80.5,13.1],[80.1,13.8]])]))).toBe(false);
 });
 it('rejects unclosed, self-crossing, degenerate and nested component geometries',()=>{
  const valid=square(80,13,81,14);
  for(const invalid of [area([valid.slice(0,-1)]),area([ring([[80,13],[81,14],[80,14],[81,13],[80,13]])]),area([ring([[80,13],[80.5,13],[81,13],[80,13]])]),{type:'multipolygon',polygons:[[valid],[square(80.2,13.2,80.8,13.8)]]} as const]) expect(()=>validateArea(invalid)).toThrow('INVALID_INPUT');
 });
 it('allows a disjoint island inside a polygon hole',()=>{
  expect(()=>validateArea({type:'multipolygon',polygons:[[square(80,13,81,14),square(80.2,13.2,80.8,13.8)],[square(80.4,13.4,80.6,13.6)]]})).not.toThrow();
 });
 it('checks whole circle containment and polygon edges inside circle scope',()=>{
  const scope={type:'circle' as const,center:{latitude:13.5,longitude:80.5},radiusM:20_000};
  expect(containsArea(scope,{...scope,radiusM:20_001})).toBe(false);
  expect(containsArea(scope,area([square(80.49,13.49,80.51,13.51)]))).toBe(true);
  expect(containsArea(scope,area([square(80.1,13.1,80.9,13.9)]))).toBe(false);
 });
 it('indexes the uncertainty buffer as well as the affected point',()=>{
  const center={latitude:13.0827,longitude:80.2707};const cells=coveringCells({type:'circle',center,radiusM:5000});
  expect(cells).toContain(geohash.encode(center.latitude,center.longitude,3));expect(new Set(cells).size).toBe(cells.length);
 });
});
