import { getAuthUserId } from '@convex-dev/auth/server';
import type { QueryCtx } from '../_generated/server';
import type { AreaGeometry } from '../../src/contracts/domain';
import { POLICY } from '../../src/domain/policy';
import { isValidPoint, validateFix } from '../../src/domain/eligibility';
import { asGeoJSON, distanceM, distanceToBoundaryM } from '../../src/domain/geography';
import { booleanPointInPolygon } from '@turf/boolean-point-in-polygon';
import { point } from '@turf/helpers';
import { reject } from './errors';

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
  for (const membership of memberships) {
    const agency = await ctx.db.get(membership.agencyId);
    if (agency?.active) allowed.push({ membership, agency });
  }
  return allowed;
}
export function containsCircle(scope: AreaGeometry, affected: Extract<AreaGeometry, { type: 'circle' }>): boolean {
  if (!isValidPoint(affected.center) || !Number.isFinite(affected.radiusM) || affected.radiusM <= 0) return false;
  if (scope.type === 'circle') return distanceM(scope.center, affected.center) + affected.radiusM <= scope.radiusM;
  const boundary = asGeoJSON(scope);
  return booleanPointInPolygon(point([affected.center.longitude, affected.center.latitude]), boundary)
    && distanceToBoundaryM(affected.center, boundary) >= affected.radiusM;
}
export async function requireAuthorityForCircle(ctx: QueryCtx, affected: Extract<AreaGeometry, { type: 'circle' }>, audience: 'LIVE' | 'DEMO') {
  const userId = await requireUser(ctx);
  const memberships = await activeMemberships(ctx, userId);
  if (!memberships.length) return reject('AUTHORITY_REQUIRED');
  for (const { membership, agency } of memberships) {
    if (agency.audience !== audience) continue;
    if (membership.jurisdictionIds.length > 32) return reject('CONFIGURATION_REQUIRED');
    for (const id of membership.jurisdictionIds) {
      const jurisdiction = await ctx.db.get(id);
      if (!jurisdiction?.active || jurisdiction.agencyId !== agency._id) continue;
      const geometry = await ctx.db.get(jurisdiction.geometryId);
      if (geometry && containsCircle(geometry.area, affected)) return { userId, membership, agency, jurisdiction };
    }
  }
  return reject('JURISDICTION_DENIED');
}
