import { query } from './_generated/server';
import { v } from 'convex/values';
import { paginationOptsValidator } from 'convex/server';
import { requireIndiaAccess } from './lib/authorization';
import { freshIncidentDTO } from './lib/publicModels';
import { reject } from './lib/errors';
import geohash from 'ngeohash';
import { distanceM } from '../src/domain/geography';

/** Initial 5-km report view. Bounded results explicitly advertise partial coverage. */
export const nearby = query({ args: {}, handler: async ctx => {
  const { location, userId } = await requireIndiaAccess(ctx);
  const profile = await ctx.db.query('profiles').withIndex('by_user', q => q.eq('userId', userId)).unique();
  const center = geohash.encode(location.point.latitude, location.point.longitude, 4);
  const found = new Map<string, Awaited<ReturnType<typeof freshIncidentDTO>>>(); let partial = false;
  for (const cell of [center, ...geohash.neighbors(center)]) {
    const points = await ctx.db.query('geoPoints').withIndex('by_kind_precision_cell_active', q => q.eq('kind','INCIDENT').eq('precision',4).eq('cell',cell).eq('active',true)).take(31);
    if (points.length > 30) partial = true;
    for (const item of points.slice(0,30)) {
      if (distanceM(location.point,item.point) > 5_000) continue;
      const id = ctx.db.normalizeId('incidents',item.entityId); const incident = id ? await ctx.db.get(id) : null;
      if (!incident || (incident.audience === 'DEMO' && !profile?.demoEnabled)) continue;
      if (found.has(incident._id)) continue;
      if (found.size >= 30) { partial = true; continue; }
      const geometry = await ctx.db.get(incident.geometryId); if (!geometry) continue;
      const dto = await freshIncidentDTO(ctx,incident,geometry);
      if (dto.lifecycle === 'ACTIVE') found.set(incident._id,dto);
    }
  }
  const distance = (item: Awaited<ReturnType<typeof freshIncidentDTO>>) => item.geometry.type === 'circle' ? distanceM(location.point,item.geometry.center) : Infinity;
  return { items: [...found.values()].sort((a,b)=>distance(a)-distance(b)), partial, radiusM:5_000, locationObservedAt:location.observedAt, serverTime:Date.now() };
} });

export const detail = query({ args: { incidentId: v.id('incidents') }, handler: async (ctx, args) => {
  const { userId } = await requireIndiaAccess(ctx);
  const incident = await ctx.db.get(args.incidentId);
  if (!incident) return reject('NOT_FOUND');
  if (incident.audience === 'DEMO') {
    const profile = await ctx.db.query('profiles').withIndex('by_user', q => q.eq('userId', userId)).unique();
    if (!profile?.demoEnabled) return reject('NOT_FOUND');
  }
  const geometry = await ctx.db.get(incident.geometryId);
  if (!geometry) return reject('NOT_FOUND');
  return freshIncidentDTO(ctx, incident, geometry);
} });

/** Bounded cell pages are candidate pages, never an asserted complete nearby list. */
export const inCell = query({ args: { cell: v.string(), paginationOpts: paginationOptsValidator }, handler: async (ctx, args) => {
  const { userId } = await requireIndiaAccess(ctx);
  if (!/^[0123456789bcdefghjkmnpqrstuvwxyz]{4}$/.test(args.cell) || !Number.isInteger(args.paginationOpts.numItems) || args.paginationOpts.numItems < 1 || args.paginationOpts.numItems > 100) return reject('INVALID_INPUT');
  const profile = await ctx.db.query('profiles').withIndex('by_user', q => q.eq('userId', userId)).unique();
  const page = await ctx.db.query('geoPoints').withIndex('by_kind_precision_cell_active', q => q.eq('kind', 'INCIDENT').eq('precision', 4).eq('cell', args.cell).eq('active', true)).paginate({ ...args.paginationOpts, numItems:Math.min(30,args.paginationOpts.numItems) });
  const items = [];
  for (const item of page.page) {
    const id = ctx.db.normalizeId('incidents', item.entityId);
    const incident = id ? await ctx.db.get(id) : null;
    if (!incident || (incident.audience === 'DEMO' && !profile?.demoEnabled)) continue;
    const geometry = await ctx.db.get(incident.geometryId);
    if (geometry) items.push(await freshIncidentDTO(ctx, incident, geometry));
  }
  return { items, isDone: page.isDone, continueCursor: page.continueCursor, candidatePage: true as const };
} });
