/// <reference types="vite/client" />
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { convexTest } from 'convex-test';
import schema from '../convex/schema';
import { api, internal } from '../convex/_generated/api';
import { activeMemberships } from '../convex/lib/authorization';
import { authorityEmails } from '../convex/lib/authorityAllowlist';
const modules = import.meta.glob('../convex/**/*.ts');
beforeEach(() => vi.stubEnv('AUTHORITY_EMAILS', ' Authority@Example.test,second@example.test '));
afterEach(() => vi.unstubAllEnvs());
async function fixture(verified = true) {
  const t = convexTest(schema, modules);
  const scope = await t.mutation(internal.operator.ensureDemoAuthorityScope, {});
  vi.stubEnv('AUTHORITY_AGENCY_ID', scope.agencyId);
  vi.stubEnv('AUTHORITY_JURISDICTION_IDS', scope.jurisdictionIds.join(','));
  const userId = await t.run(async ctx => {
    const id = await ctx.db.insert('users', { email: 'authority@example.test' });
    await ctx.db.insert('authAccounts', { userId: id, provider: 'google', providerAccountId: 'test-sub', ...(verified ? { emailVerified: 'authority@example.test' } : {}) });
    return id;
  });
  const actor = t.withIdentity({ subject: `${userId}|session` });
  const memberships = () => t.run(ctx => ctx.db.query('authorityMemberships').collect());
  return { t, actor, userId, memberships, scope };
}
it('normalizes exact addresses and fails closed for malformed configuration', () => {
  expect([...authorityEmails(' A@example.test,a@example.test,b+test@example.test ')]).toEqual(['a@example.test', 'b+test@example.test']);
  expect(authorityEmails('valid@example.test,invalid').size).toBe(0);
  expect(authorityEmails('').size).toBe(0);
  expect(authorityEmails('a@example.test').has('a+extra@example.test')).toBe(false);
});
it('grants one audited scoped membership from verified Google identity and retries without duplicate writes', async () => {
  const { t, actor, memberships, scope } = await fixture();
  await expect(t.mutation(api.authorityAccess.sync, {})).rejects.toThrow('AUTH_REQUIRED');
  expect(await actor.mutation(api.authorityAccess.sync, {})).toEqual({ configured: true, changed: true });
  expect(await actor.mutation(api.authorityAccess.sync, {})).toEqual({ configured: true, changed: false });
  expect(await memberships()).toHaveLength(1);
  expect((await memberships())[0]).toMatchObject({ agencyId: scope.agencyId, jurisdictionIds: scope.jurisdictionIds, approvalSource: 'EMAIL_ALLOWLIST', status: 'ACTIVE' });
  expect(await t.run(ctx => ctx.db.query('auditEvents').collect())).toHaveLength(1);
});
it('does not infer verification from a user email or an unverified OAuth record', async () => {
  const { actor, memberships } = await fixture(false);
  expect(await actor.mutation(api.authorityAccess.sync, {})).toEqual({ configured: false, changed: false });
  expect(await memberships()).toHaveLength(0);
});
it('removes access when the list changes and records revocation on refresh', async () => {
  const { actor, memberships } = await fixture();
  await actor.mutation(api.authorityAccess.sync, {});
  vi.stubEnv('AUTHORITY_EMAILS', 'other@example.test');
  const member = (await memberships())[0]!;
  expect(await actor.run(ctx => activeMemberships(ctx, member.userId))).toHaveLength(0);
  expect(await actor.mutation(api.authorityAccess.sync, {})).toEqual({ configured: false, changed: true });
  expect((await memberships())[0]).toMatchObject({ status: 'REVOKED', revocationSource: 'EMAIL_ALLOWLIST' });
  vi.stubEnv('AUTHORITY_EMAILS', 'authority@example.test');
  expect(await actor.mutation(api.authorityAccess.sync, {})).toEqual({ configured: true, changed: true });
});
it('does not undo explicit operator revocation', async () => {
  const { t, actor, memberships } = await fixture();
  await actor.mutation(api.authorityAccess.sync, {});
  await t.mutation(internal.operator.revokeAuthority, { membershipId: (await memberships())[0]!._id, reason: 'Test operator revocation' });
  expect(await actor.mutation(api.authorityAccess.sync, {})).toEqual({ configured: true, changed: false, blocked: true });
  expect((await memberships()).filter(m => m.status === 'ACTIVE')).toHaveLength(0);
});
it('rejects invalid assigned configuration and provisions DEMO scope idempotently', async () => {
  const { t, actor, scope, memberships } = await fixture();
  expect(await t.mutation(internal.operator.ensureDemoAuthorityScope, {})).toEqual(scope);
  expect(scope.audience).toBe('DEMO');
  vi.stubEnv('AUTHORITY_JURISDICTION_IDS', 'invalid');
  await expect(actor.mutation(api.authorityAccess.sync, {})).rejects.toThrow('CONFIGURATION_REQUIRED');
  expect(await memberships()).toHaveLength(0);
});
