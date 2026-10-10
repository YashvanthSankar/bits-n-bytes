import { getAuthUserId } from '@convex-dev/auth/server';
import type { QueryCtx } from '../_generated/server';
import type { AreaGeometry } from '../../src/contracts/domain';
import { POLICY } from '../../src/domain/policy';
import { isValidPoint, validateFix } from '../../src/domain/eligibility';
import { asGeoJSON, distanceM, distanceToBoundaryM } from '../../src/domain/geography';
import { booleanPointInPolygon } from '@turf/boolean-point-in-polygon';
import { point } from '@turf/helpers';
import { reject } from './errors';
import { containsArea, validateArea } from './areas';
import type { Id } from '../_generated/dataModel';
import { configuredAuthorityAccess } from './authorityAllowlist';

export async function requireUser(ctx: QueryCtx) {
  const userId = await getAuthUserId(ctx);
  if (!userId || !(await ctx.db.get(userId))) return reject('AUTH_REQUIRED');
  return userId;
}
export async function requireIndiaAccess(ctx: QueryCtx) {
  const userId = await requireUser(ctx);
  const location = await ctx.db.query('locations').withIndex('by_user', q => q.eq('userId', userId)).unique();
  if (!location || location.admittedAt === undefined || location.foregroundPermission !== 'granted') return reject('LOCATION_REQUIRED');
  if (location.countryStatus === 'OUTSIDE_INDIA') return reject('OUTSIDE_INDIA');
  if (location.countryStatus !== 'INSIDE_INDIA') return reject('COUNTRY_UNCERTAIN');
  if (Date.now() - location.observedAt > POLICY.locationRetentionMs) return reject('LOCATION_STALE');
  return { userId, location };
}
export async function requireEligibleFix(ctx: QueryCtx, requirements = POLICY.entryFix as { maxAgeMs: number; maxAccuracyM: number }) {
  const access = await requireIndiaAccess(ctx);
  const result = validateFix(access.location, Date.now(), requirements);
  if (!result.ok) return reject(result.error.code);
  return access;
}
export async function activeMemberships(ctx: QueryCtx, userId: Awaited<ReturnType<typeof requireUser>>) {
  const memberships = await ctx.db.query('authorityMemberships').withIndex('by_user_status', q => q.eq('userId', userId).eq('status', 'ACTIVE')).take(21);
  if (memberships.length > 20) return reject('CONFIGURATION_REQUIRED');
  const allowed = [];
  const configured = memberships.some(m => m.approvalSource === 'EMAIL_ALLOWLIST') ? await configuredAuthorityAccess(ctx, userId) : null;
  for (const membership of memberships) {
    if (membership.approvalSource === 'EMAIL_ALLOWLIST' && (!configured || membership.agencyId !== configured.agency._id || membership.allowlistEmail !== configured.email
      || membership.jurisdictionIds.length !== configured.jurisdictionIds.length || membership.jurisdictionIds.some(id => !configured.jurisdictionIds.includes(id)))) continue;
    const agency = await ctx.db.get(membership.agencyId);
    if (agency?.active) allowed.push({ membership, agency });
  }
  return allowed;
}

/** Exact assigned jurisdiction, not merely an overlapping area owned by the same agency. */
export async function requireAssignedJurisdiction(ctx: QueryCtx, jurisdictionId: Id<'jurisdictions'>) {
  const { userId } = await requireIndiaAccess(ctx);
  const memberships = await activeMemberships(ctx, userId);
  if (!memberships.length) return reject('AUTHORITY_REQUIRED');
  const jurisdiction = await ctx.db.get(jurisdictionId);
  if (!jurisdiction?.active) return reject('JURISDICTION_DENIED');
  for (const { membership, agency } of memberships) {
    if (membership.jurisdictionIds.length > 32) return reject('CONFIGURATION_REQUIRED');
    if (agency._id !== jurisdiction.agencyId || !membership.jurisdictionIds.includes(jurisdictionId)) continue;
    const geometry = await ctx.db.get(jurisdiction.geometryId);
    if (!geometry) return reject('CONFIGURATION_REQUIRED');
    validateArea(geometry.area);
    return { userId, membership, agency, jurisdiction, area: geometry.area };
  }
  return reject('JURISDICTION_DENIED');
}
export function containsCircle(scope: AreaGeometry, affected: Extract<AreaGeometry, { type: 'circle' }>): boolean {
  if (!isValidPoint(affected.center) || !Number.isFinite(affected.radiusM) || affected.radiusM <= 0) return false;
  if (scope.type === 'circle') return distanceM(scope.center, affected.center) + affected.radiusM <= scope.radiusM;
  const boundary = asGeoJSON(scope);
  return booleanPointInPolygon(point([affected.center.longitude, affected.center.latitude]), boundary)
    && distanceToBoundaryM(affected.center, boundary) >= affected.radiusM;
}
export async function requireAuthorityForCircle(ctx: QueryCtx, affected: Extract<AreaGeometry, { type: 'circle' }>, audience: 'LIVE' | 'DEMO') {
  return requireAuthorityForArea(ctx, affected, audience);
}
export async function requireAuthorityForArea(ctx: QueryCtx, affected: AreaGeometry, audience: 'LIVE' | 'DEMO', agencyId?: string) {
  validateArea(affected);
  const userId = await requireUser(ctx);
  const memberships = await activeMemberships(ctx, userId);
  if (!memberships.length) return reject('AUTHORITY_REQUIRED');
  for (const { membership, agency } of memberships) {
    if (agency.audience !== audience || (agencyId && agency._id !== agencyId)) continue;
    if (membership.jurisdictionIds.length > 32) return reject('CONFIGURATION_REQUIRED');
    for (const id of membership.jurisdictionIds) {
      const jurisdiction = await ctx.db.get(id);
      if (!jurisdiction?.active || jurisdiction.agencyId !== agency._id) continue;
      const geometry = await ctx.db.get(jurisdiction.geometryId);
      if (geometry && containsArea(geometry.area, affected)) return { userId, membership, agency, jurisdiction };
    }
  }
  return reject('JURISDICTION_DENIED');
}
