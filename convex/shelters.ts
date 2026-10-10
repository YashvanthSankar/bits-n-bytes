import geohash from 'ngeohash';
import { query } from './_generated/server';
import { requireIndiaAccess } from './lib/authorization';
import { distanceM } from '../src/domain/geography';
import { POLICY } from '../src/domain/policy';

/** Listed shelters only. Recommendation eligibility is a separate unfinished workflow. */
export const nearby=query({args:{},handler:async ctx=>{
  const {location}=await requireIndiaAccess(ctx);
  const center=geohash.encode(location.point.latitude,location.point.longitude,3);
  const items=[]; const seen=new Set<string>();let partial=false;
  for(const cell of [center,...geohash.neighbors(center)]) {
    const points=await ctx.db.query('geoPoints').withIndex('by_kind_precision_cell_active',q=>q.eq('kind','SHELTER').eq('precision',3).eq('cell',cell).eq('active',true)).take(31);
    if(points.length>30) partial=true;
    for(const entry of points.slice(0,30)) {
      if(seen.has(entry.entityId)) continue;seen.add(entry.entityId);
      const id=ctx.db.normalizeId('shelters',entry.entityId);if(!id)continue;
      const shelter=await ctx.db.get(id);
      if(!shelter || shelter.archivedAt!==undefined || shelter.audience!=='LIVE')continue;
      const distance=distanceM(location.point,shelter.point);if(distance>POLICY.shelterRadiusM)continue;
      if(items.length>=30){partial=true;continue;}
      const agency=await ctx.db.get(shelter.agencyId);if(!agency)continue;
      items.push({id:shelter._id,name:shelter.name,point:shelter.point,address:shelter.address,status:shelter.status,statusConfirmedAt:shelter.statusConfirmedAt,
        capacity:shelter.capacity,remaining:shelter.remaining,accessibility:shelter.accessibility,facilities:shelter.facilities,phone:shelter.phone,accessInstruction:shelter.accessInstruction,
        accessRestricted:shelter.accessRestricted,issuer:agency.sourceLabel,distanceM:distance,stale:Date.now()-shelter.statusConfirmedAt>POLICY.shelterFreshMs,revision:shelter.revision});
    }
  }
  return {items:items.sort((a,b)=>a.distanceM-b.distanceM),partial,radiusM:POLICY.shelterRadiusM,locationObservedAt:location.observedAt,serverTime:Date.now()};
} });
