import { internalMutation } from './_generated/server';
import { v } from 'convex/values';
import { reject } from './lib/errors';

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
  const approval = { jurisdictionIds: [...new Set(args.jurisdictionIds)], approvedBy: args.operatorLabel.trim(), approvedAt: now };
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
  await ctx.db.patch(current._id, { status: 'REVOKED', revokedAt: now });
  await ctx.db.insert('auditEvents', { actorKind: 'OPERATOR', objectKind: 'AUTHORITY_MEMBERSHIP', objectId: current._id, revision: now, action: 'REVOKE', reason: args.reason, createdAt: now });
  return { revoked: true };
} });
