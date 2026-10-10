import type { QueryCtx } from '../_generated/server';
import type { Id } from '../_generated/dataModel';
import { reject } from './errors';

/** Exact normalized addresses only: no domain wildcards, plus/dot rewriting or partial matching. */
export function authorityEmails(raw: string | undefined): Set<string> {
  if (!raw?.trim()) return new Set();
  const values = raw.split(',').map(value => value.trim().toLowerCase()).filter(Boolean);
  if (values.length > 250 || values.some(value => value.length > 254 || !/^[^\s,@]+@[^\s,@]+\.[^\s,@]+$/.test(value))) return new Set();
  return new Set(values);
}

/** Account identity and verified email come from Google OAuth records, never from profile form input. */
export async function configuredAuthorityAccess(ctx: QueryCtx, userId: Id<'users'>) {
  const user = await ctx.db.get(userId);
  const email = user?.email?.trim().toLowerCase();
  if (!email || !authorityEmails(process.env.AUTHORITY_EMAILS).has(email)) return null;
  const accounts = await ctx.db.query('authAccounts').withIndex('userIdAndProvider', q => q.eq('userId', userId).eq('provider', 'google')).take(11);
  if (accounts.length > 10) return reject('CONFIGURATION_REQUIRED');
  if (!accounts.some(account => account.emailVerified?.trim().toLowerCase() === email)) return null;
  const agencyId = ctx.db.normalizeId('agencies', process.env.AUTHORITY_AGENCY_ID ?? '');
  const rawIds = (process.env.AUTHORITY_JURISDICTION_IDS ?? '').split(',').map(value => value.trim()).filter(Boolean);
  if (!agencyId || !rawIds.length || rawIds.length > 32) return reject('CONFIGURATION_REQUIRED');
  const agency = await ctx.db.get(agencyId);
  if (!agency?.active) return reject('CONFIGURATION_REQUIRED');
  const jurisdictionIds: Id<'jurisdictions'>[] = [];
  for (const rawId of new Set(rawIds)) {
    const id = ctx.db.normalizeId('jurisdictions', rawId);
    const jurisdiction = id ? await ctx.db.get(id) : null;
    if (!id || !jurisdiction?.active || jurisdiction.agencyId !== agencyId) return reject('CONFIGURATION_REQUIRED');
    jurisdictionIds.push(id);
  }
  return { email, agency, jurisdictionIds };
}
