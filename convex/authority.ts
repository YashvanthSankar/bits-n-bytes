import { paginationOptsValidator } from 'convex/server';
import { query } from './_generated/server';
import { v } from 'convex/values';
import { containsCircle, requireAssignedJurisdiction, activeMemberships, requireAuthorityForCircle, requireIndiaAccess, requireUser } from './lib/authorization';
import { reject } from './lib/errors';
import { freshIncidentDTO } from './lib/publicModels';

/** Own approved scope labels only; never returns tourist positions or membership operators. */
export const scopes = query({ args: {}, handler: async ctx => {
  const { userId } = await requireIndiaAccess(ctx);
  const memberships = await activeMemberships(ctx, userId);
  if (!memberships.length) return reject('AUTHORITY_REQUIRED');
  const result = new Map<string, { id: typeof memberships[number]['membership']['jurisdictionIds'][number]; name: string; agencyName: string; issuer: string; audience: 'LIVE' | 'DEMO' }>();
  for (const { membership, agency } of memberships) {
    if (membership.jurisdictionIds.length > 32) return reject('CONFIGURATION_REQUIRED');
    for (const id of membership.jurisdictionIds) {
      if (result.has(id)) continue;
      const jurisdiction = await ctx.db.get(id);
      if (jurisdiction?.active && jurisdiction.agencyId === agency._id) result.set(id, { id, name: jurisdiction.name, agencyName: agency.name, issuer: agency.sourceLabel, audience: agency.audience });
    }
  }
  return [...result.values()];
} });

export const reviewIncident = query({ args: { incidentId: v.id('incidents') }, handler: async (ctx, args) => {
  await requireUser(ctx);
  const incident = await ctx.db.get(args.incidentId);
  if (!incident) return reject('NOT_FOUND');
  const geometry = await ctx.db.get(incident.geometryId);
  if (!geometry || geometry.area.type !== 'circle') return reject('CONFIGURATION_REQUIRED');
  await requireAuthorityForCircle(ctx, geometry.area, incident.audience);
  return freshIncidentDTO(ctx, incident, geometry);
} });

/** Bounded pages scoped to the selected assigned jurisdiction; never witness identities. */
export const declarationCandidates = query({ args: { jurisdictionId: v.id('jurisdictions'), paginationOpts: paginationOptsValidator }, handler: async (ctx, args) => {
  const { agency, area } = await requireAssignedJurisdiction(ctx, args.jurisdictionId);
  if (args.paginationOpts.numItems < 1 || args.paginationOpts.numItems > 30) return reject('INVALID_INPUT');
  const result = await ctx.db.query('incidents').withIndex('by_audience_lifecycle', q => q.eq('audience', agency.audience).eq('lifecycle', 'ACTIVE')).order('desc').paginate(args.paginationOpts);
  const page = [];
  for (const incident of result.page) {
    const geometry = await ctx.db.get(incident.geometryId);
    if (!geometry || geometry.area.type !== 'circle' || !containsCircle(area, geometry.area)) continue;
    page.push({ id: incident._id, revision: incident.revision, hazard: incident.hazard, locality: incident.locality, area: geometry.area, verification: incident.verification });
  }
  return { ...result, page };
} });
