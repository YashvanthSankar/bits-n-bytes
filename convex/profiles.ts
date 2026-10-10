import { mutation, query } from './_generated/server';
import { v } from 'convex/values';
import { activeMemberships, requireIndiaAccess, requireUser } from './lib/authorization';
import { language } from './lib/validators';
import { command, payloadHash } from './lib/idempotency';
import { reject } from './lib/errors';

/** Own private profile only; no argument can select another tourist. */
export const me = query({ args: {}, handler: async ctx => {
  const userId = await requireUser(ctx);
  const profile = await ctx.db.query('profiles').withIndex('by_user', q => q.eq('userId', userId)).unique();
  const memberships = await activeMemberships(ctx, userId);
  return {
    profile: profile ? { name: profile.name, alias: profile.alias, language: profile.language, bloodGroup: profile.bloodGroup ?? null, emergencyContact: profile.emergencyContact ?? null, stepFreeNeeded: profile.stepFreeNeeded, demoEnabled: profile.demoEnabled, revision: profile.revision } : null,
    role: memberships.length ? 'AUTHORITY' as const : 'TOURIST' as const,
    memberships: memberships.map(({ membership, agency }) => ({ id: membership._id, agencyName: agency.name, sourceLabel: agency.sourceLabel, jurisdictionIds: membership.jurisdictionIds, audience: agency.audience })),
  };
} });

/** Language-only settings cannot overwrite concurrent private profile edits. */
export const setLanguage = mutation({ args: { requestId:v.string(), expectedRevision:v.number(), language }, handler:async(ctx,args)=>{
  const userId=await requireUser(ctx);
  return command(ctx,userId,'PROFILE_LANGUAGE',args.requestId,args,async()=>{
    const profile=await ctx.db.query('profiles').withIndex('by_user',q=>q.eq('userId',userId)).unique();
    if(!profile) return reject('NOT_FOUND');
    if(profile.revision!==args.expectedRevision) return reject('REVISION_CONFLICT',{currentRevision:profile.revision});
    await ctx.db.patch(profile._id,{language:args.language,revision:profile.revision+1});
    return {revision:profile.revision+1};
  });
} });

export const save = mutation({ args: {
  requestId: v.string(), expectedRevision: v.number(), name: v.string(), language,
  bloodGroup: v.optional(v.string()), emergencyContact: v.optional(v.object({ name: v.string(), phone: v.string() })), stepFreeNeeded: v.boolean(),
}, handler: async (ctx, args) => {
  const userId = await requireUser(ctx);
  return command(ctx, userId, 'PROFILE_SAVE', args.requestId, args, async () => {
    const current = await ctx.db.query('profiles').withIndex('by_user', q => q.eq('userId', userId)).unique();
    if (args.expectedRevision !== (current?.revision ?? 0)) return reject('REVISION_CONFLICT', { currentRevision: current?.revision ?? 0 });
    const name = args.name.trim();
    if (name.length < 2 || name.length > 80 || /[\u0000-\u001f]/.test(name)) return reject('INVALID_INPUT');
    if (args.bloodGroup && !['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].includes(args.bloodGroup)) return reject('INVALID_INPUT');
    if (args.emergencyContact && (args.emergencyContact.name.trim().length < 2 || args.emergencyContact.name.length > 80 || !/^\+?[0-9 ()-]{7,24}$/.test(args.emergencyContact.phone))) return reject('INVALID_INPUT');
    if (!current) await requireIndiaAccess(ctx);
    const revision = (current?.revision ?? 0) + 1;
    const value = { name, language: args.language, bloodGroup: args.bloodGroup, emergencyContact: args.emergencyContact, stepFreeNeeded: args.stepFreeNeeded, revision };
    if (current) await ctx.db.patch(current._id, value);
    else await ctx.db.insert('profiles', { userId, name, language: args.language, ...(args.bloodGroup === undefined ? {} : { bloodGroup: args.bloodGroup }), ...(args.emergencyContact === undefined ? {} : { emergencyContact: args.emergencyContact }), stepFreeNeeded: args.stepFreeNeeded, revision, alias: 'Traveler ' + payloadHash(userId).slice(0, 8).toUpperCase(), demoEnabled: false, onboardingCompletedAt: Date.now() });
    return { revision };
  });
} });
