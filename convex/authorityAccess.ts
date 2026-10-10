import { mutation } from './_generated/server';
import { requireUser } from './lib/authorization';
import { configuredAuthorityAccess } from './lib/authorityAllowlist';
import { reject } from './lib/errors';

/** Refresh own access from backend configuration; caller cannot select an email, role or scope. */
export const sync = mutation({ args: {}, handler: async ctx => {
  const userId = await requireUser(ctx), configured = await configuredAuthorityAccess(ctx, userId), now = Date.now();
  const active = await ctx.db.query('authorityMemberships').withIndex('by_user_status', q => q.eq('userId', userId).eq('status', 'ACTIVE')).take(21);
  if (active.length > 20) return reject('CONFIGURATION_REQUIRED');
  const managed = active.filter(m => m.approvalSource === 'EMAIL_ALLOWLIST');
  let kept = false;
  for (const membership of managed) {
    if (configured && !kept && membership.agencyId === configured.agency._id && membership.allowlistEmail === configured.email
      && membership.jurisdictionIds.length === configured.jurisdictionIds.length && membership.jurisdictionIds.every(id => configured.jurisdictionIds.includes(id))) { kept = true; continue; }
    await ctx.db.patch(membership._id, { status: 'REVOKED', revokedAt: now, revocationSource: 'EMAIL_ALLOWLIST' });
    await ctx.db.insert('auditEvents', { actorId: userId, actorKind: 'CONFIGURATION', objectKind: 'AUTHORITY_MEMBERSHIP', objectId: membership._id, revision: now, action: 'ALLOWLIST_REVOKE', reason: 'Configured email or assigned scope changed', createdAt: now });
  }
  if (!configured || kept) return { configured: Boolean(configured), changed: managed.length > (kept ? 1 : 0) };
  const revoked = await ctx.db.query('authorityMemberships').withIndex('by_user_source_status', q => q.eq('userId', userId).eq('approvalSource', 'EMAIL_ALLOWLIST').eq('status', 'REVOKED')).order('desc').first();
  // Explicit operator revocation takes precedence; an app refresh cannot undo it.
  if (revoked?.revocationSource === 'OPERATOR') return { configured: true, changed: false, blocked: true };
  if (active.some(m => m.approvalSource !== 'EMAIL_ALLOWLIST' && m.agencyId === configured.agency._id)) return { configured: true, changed: false };
  if (active.length - managed.length >= 20) return reject('CONFIGURATION_REQUIRED');
  const membershipId = await ctx.db.insert('authorityMemberships', { userId, agencyId: configured.agency._id, jurisdictionIds: configured.jurisdictionIds,
    status: 'ACTIVE', approvalSource: 'EMAIL_ALLOWLIST', allowlistEmail: configured.email, approvedBy: 'Backend email allowlist', approvedAt: now });
  await ctx.db.insert('auditEvents', { actorId: userId, actorKind: 'CONFIGURATION', objectKind: 'AUTHORITY_MEMBERSHIP', objectId: membershipId, revision: now, action: 'ALLOWLIST_APPROVE', reason: 'Verified Google email matched configured authority access', createdAt: now });
  return { configured: true, changed: true };
} });
