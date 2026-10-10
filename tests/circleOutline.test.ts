import { expect, it } from 'vitest';
import { circleOutline } from '../src/domain/circleOutline';
import { distanceM } from '../src/domain/geography';
it.each([1000,5000,25000])('renders a closed %s-metre circle without swapping coordinate axes',radius=>{
  const center={latitude:13.0827,longitude:80.2707}; const ring=circleOutline(center,radius);
  expect(ring).toHaveLength(97);expect(ring[0]).toEqual(ring[96]);
  for(const point of ring) expect(distanceM(center,point)).toBeCloseTo(radius,4);
});
