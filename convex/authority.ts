import { query } from './_generated/server';
import { v } from 'convex/values';
import { requireAuthorityForCircle, requireUser } from './lib/authorization';
import { reject } from './lib/errors';
import { freshIncidentDTO } from './lib/publicModels';

export const reviewIncident = query({ args: { incidentId: v.id('incidents') }, handler: async (ctx, args) => {
  await requireUser(ctx);
  const incident = await ctx.db.get(args.incidentId);
  if (!incident) return reject('NOT_FOUND');
  const geometry = await ctx.db.get(incident.geometryId);
  if (!geometry || geometry.area.type !== 'circle') return reject('CONFIGURATION_REQUIRED');
  await requireAuthorityForCircle(ctx, geometry.area, incident.audience);
  return freshIncidentDTO(ctx, incident, geometry);
} });
