import geohash from 'ngeohash';
import { internalMutation, internalQuery } from './_generated/server';
import { v } from 'convex/values';
import { reject } from './lib/errors';
import { authorityEmails } from './lib/authorityAllowlist';

/** Operator-only provisioning: never exported as a public client mutation. */
export const approveAuthority = internalMutation({ args: {
  userId: v.id('users'), agencyId: v.id('agencies'), jurisdictionIds: v.array(v.id('jurisdictions')), operatorLabel: v.string(), reason: v.string(),
}, handler: async (ctx, args) => {
  if (!(await ctx.db.get(args.userId))) return reject('NOT_FOUND');
  const agency = await ctx.db.get(args.agencyId);
  if (!agency?.active || args.jurisdictionIds.length < 1 || args.jurisdictionIds.length > 32 || !args.operatorLabel.trim() || args.operatorLabel.length > 80 || args.reason.trim().length < 5 || args.reason.length > 500) return reject('INVALID_INPUT');
  for (const id of new Set(args.jurisdictionIds)) {
    const jurisdiction = await ctx.db.get(id);
    if (!jurisdiction?.active || jurisdiction.agencyId !== args.agencyId) return reject('JURISDICTION_DENIED');
  }
  const active = await ctx.db.query('authorityMemberships').withIndex('by_user_status', q => q.eq('userId', args.userId).eq('status', 'ACTIVE')).take(21);
  if (active.length >= 20) return reject('CONFIGURATION_REQUIRED');
  const existing = active.find(m => m.agencyId === args.agencyId);
  const now = Date.now();
  const approval = { jurisdictionIds: [...new Set(args.jurisdictionIds)], approvedBy: args.operatorLabel.trim(), approvedAt: now, approvalSource: 'OPERATOR' as const };
  const membershipId = existing ? existing._id : await ctx.db.insert('authorityMemberships', { userId: args.userId, agencyId: args.agencyId, status: 'ACTIVE', ...approval });
  if (existing) await ctx.db.patch(existing._id, approval);
  await ctx.db.insert('auditEvents', { actorKind: 'OPERATOR', objectKind: 'AUTHORITY_MEMBERSHIP', objectId: membershipId, revision: now, action: 'APPROVE', reason: args.reason, createdAt: now });
  return { membershipId };
} });

export const revokeAuthority = internalMutation({ args: { membershipId: v.id('authorityMemberships'), reason: v.string() }, handler: async (ctx, args) => {
  const current = await ctx.db.get(args.membershipId);
  if (!current) return reject('NOT_FOUND');
  if (args.reason.trim().length < 5 || args.reason.length > 500) return reject('INVALID_INPUT');
  const now = Date.now();
  await ctx.db.patch(current._id, { status: 'REVOKED', revokedAt: now, revocationSource: 'OPERATOR' });
  await ctx.db.insert('auditEvents', { actorKind: 'OPERATOR', objectKind: 'AUTHORITY_MEMBERSHIP', objectId: current._id, revision: now, action: 'REVOKE', reason: args.reason, createdAt: now });
  return { revoked: true };
} });

/** Idempotent, operator-only test scope. This creates no LIVE authority or disaster. */
export const ensureDemoAuthorityScope = internalMutation({ args: {}, handler: async ctx => {
  const configKey = 'gudtour-demo-chennai-v1';
  let agency = await ctx.db.query('agencies').withIndex('by_configKey', q => q.eq('configKey', configKey)).unique();
  if (!agency) {
    const id = await ctx.db.insert('agencies', { configKey, name: 'GudTour demo authority', sourceLabel: 'GudTour DEMO authority', active: true, audience: 'DEMO' });
    agency = (await ctx.db.get(id))!;
  }
  if (agency.audience !== 'DEMO' || !agency.active) return reject('CONFIGURATION_REQUIRED');
  let jurisdiction = await ctx.db.query('jurisdictions').withIndex('by_configKey', q => q.eq('configKey', configKey)).unique();
  if (!jurisdiction) {
    const geometryId = await ctx.db.insert('geometries', { area: { type: 'circle', center: { latitude: 13.0827, longitude: 80.2707 }, radiusM: 50_000 }, source: 'DEMO_JURISDICTION', sourceAccuracyM: null, version: 1, geometryHash: configKey });
    const id = await ctx.db.insert('jurisdictions', { configKey, agencyId: agency._id, geometryId, name: 'Chennai demo area (50 km)', coverageVersion: 1, active: true });
    jurisdiction = (await ctx.db.get(id))!;
  }
  if (!jurisdiction.active || jurisdiction.agencyId !== agency._id) return reject('CONFIGURATION_REQUIRED');
  return { agencyId: agency._id, jurisdictionIds: [jurisdiction._id], audience: 'DEMO' as const };
} });

/** Operator-only diagnostics; never returns email addresses, tokens or private profile fields. */
export const authorityConfigurationStatus = internalQuery({ args: {}, handler: async ctx => {
  const emails = authorityEmails(process.env.AUTHORITY_EMAILS);
  const results = [];
  for (const email of emails) {
    const users = await ctx.db.query('users').withIndex('email', q => q.eq('email', email)).take(3);
    for (const user of users) {
      const accounts = await ctx.db.query('authAccounts').withIndex('userIdAndProvider', q => q.eq('userId', user._id).eq('provider', 'google')).take(11);
      const members = await ctx.db.query('authorityMemberships').withIndex('by_user_status', q => q.eq('userId', user._id).eq('status', 'ACTIVE')).take(21);
      results.push({ googleAccount: accounts.length > 0, verifiedGoogleEmail: accounts.some(a => a.emailVerified?.toLowerCase() === email), activeMemberships: members.length });
    }
  }
  return { configuredCount: emails.size, matchedAccounts: results };
} });

export const repairOfficialMapIndex = internalMutation({args:{incidentId:v.id('incidents')},handler:async(ctx,args)=>{
 const incident=await ctx.db.get(args.incidentId);if(!incident || incident.provenance!=='AUTHORITY')return reject('INVALID_INPUT');
 const geometry=await ctx.db.get(incident.geometryId);if(!geometry || geometry.area.type!=='circle')return reject('INVALID_INPUT');
 const entries=await ctx.db.query('geoPoints').withIndex('by_kind_entity',q=>q.eq('kind','INCIDENT').eq('entityId',incident._id)).take(3);
 for(const precision of [4,5])if(!entries.some(e=>e.precision===precision))await ctx.db.insert('geoPoints',{kind:'INCIDENT',entityId:incident._id,precision,cell:geohash.encode(geometry.area.center.latitude,geometry.area.center.longitude,precision),point:geometry.area.center,active:incident.lifecycle==='ACTIVE',observedAt:incident.lastObservedAt});
 return {indexed:true};
}});
