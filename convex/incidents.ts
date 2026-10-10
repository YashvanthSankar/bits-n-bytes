import { query } from './_generated/server';
import { v } from 'convex/values';
import { paginationOptsValidator } from 'convex/server';
import { requireIndiaAccess } from './lib/authorization';
import { incidentDTO } from './lib/publicModels';
import { reject } from './lib/errors';

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
  return incidentDTO(incident, geometry);
} });

/** Bounded cell pages are candidate pages, never an asserted complete nearby list. */
export const inCell = query({ args: { cell: v.string(), paginationOpts: paginationOptsValidator }, handler: async (ctx, args) => {
  const { userId } = await requireIndiaAccess(ctx);
  if (!/^[0123456789bcdefghjkmnpqrstuvwxyz]{4}$/.test(args.cell) || !Number.isInteger(args.paginationOpts.numItems) || args.paginationOpts.numItems < 1 || args.paginationOpts.numItems > 100) return reject('INVALID_INPUT');
  const profile = await ctx.db.query('profiles').withIndex('by_user', q => q.eq('userId', userId)).unique();
  const page = await ctx.db.query('geoPoints').withIndex('by_kind_precision_cell_active', q => q.eq('kind', 'INCIDENT').eq('precision', 4).eq('cell', args.cell).eq('active', true)).paginate(args.paginationOpts);
  const items = [];
  for (const item of page.page) {
    const id = ctx.db.normalizeId('incidents', item.entityId);
    const incident = id ? await ctx.db.get(id) : null;
    if (!incident || (incident.audience === 'DEMO' && !profile?.demoEnabled)) continue;
    const geometry = await ctx.db.get(incident.geometryId);
    if (geometry) items.push(incidentDTO(incident, geometry));
  }
  return { items, isDone: page.isDone, continueCursor: page.continueCursor, candidatePage: true as const };
} });
