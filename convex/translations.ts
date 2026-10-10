import { internalAction, internalMutation, type MutationCtx } from './_generated/server';
import { internal } from './_generated/api';
import { v } from 'convex/values';
import type { Id } from './_generated/dataModel';
import { LANGUAGE_CODES } from '../src/contracts/domain';
import { translateInstruction, TranslationFailure, translationIntegrity } from './providers/googleTranslation';

export async function enqueueTranslations(ctx: MutationCtx, instructionVersionId: Id<'instructionVersions'>) {
  const instruction = await ctx.db.get(instructionVersionId);
  if (!instruction) throw new Error('INSTRUCTION_MISSING');
  for (const targetLanguage of LANGUAGE_CODES) {
    if (targetLanguage === instruction.sourceLanguage) continue;
    const existing = await ctx.db.query('instructionTranslations').withIndex('by_instruction_language', q => q.eq('instructionVersionId', instructionVersionId).eq('targetLanguage', targetLanguage)).unique();
    if (existing) continue;
    const translationId = await ctx.db.insert('instructionTranslations', { instructionVersionId, originalHash: instruction.originalHash, targetLanguage, status: 'PENDING', attempts: 0, dueAt: Date.now(), issues: [], updatedAt: Date.now() });
    await ctx.scheduler.runAfter(0, internal.translations.run, { translationId });
  }
}
export const claim = internalMutation({ args: { translationId: v.id('instructionTranslations') }, handler: async (ctx, args) => {
  const job = await ctx.db.get(args.translationId), now = Date.now();
  if (!job || !['PENDING','RUNNING'].includes(job.status) || job.dueAt > now) return null;
  const instruction = await ctx.db.get(job.instructionVersionId);
  const declaration = instruction ? await ctx.db.get(instruction.declarationId) : null;
  if (!instruction || instruction.originalHash !== job.originalHash || !declaration?.active || declaration.instructionVersionId !== instruction._id) { await ctx.db.patch(job._id, {status:'OBSOLETE',updatedAt:now}); return null; }
  if (job.attempts >= 3) { await ctx.db.patch(job._id, {status:'FAILED',lastError:'RETRY_EXHAUSTED',updatedAt:now}); return null; }
  const attempt = job.attempts + 1;
  await ctx.db.patch(job._id, {status:'RUNNING',attempts:attempt,dueAt:now+60_000,updatedAt:now});
  return { text: instruction.originalText, source: instruction.sourceLanguage, target: job.targetLanguage, attempt };
} });
export const finish = internalMutation({ args: { translationId: v.id('instructionTranslations'), attempt: v.number(), text: v.optional(v.string()), error: v.optional(v.string()) }, handler: async (ctx, args) => {
  const job = await ctx.db.get(args.translationId);
  if (!job || job.status !== 'RUNNING' || job.attempts !== args.attempt) return;
  const instruction = await ctx.db.get(job.instructionVersionId), now = Date.now();
  const declaration = instruction ? await ctx.db.get(instruction.declarationId) : null;
  if (!instruction || instruction.originalHash !== job.originalHash || !declaration?.active || declaration.instructionVersionId !== instruction._id) { await ctx.db.patch(job._id,{status:'OBSOLETE',updatedAt:now});return; }
  if (args.text !== undefined && args.text.trim() && args.text.length <= 32_000) {
    const {issues} = translationIntegrity(instruction.originalText,args.text);
    await ctx.db.patch(job._id,{status:issues.length?'FLAGGED':'READY',text:args.text,issues,updatedAt:now});return;
  }
  const retry = job.attempts < 3, delay = job.attempts * 30_000;
  const allowed = ['CONFIGURATION','INVALID_INPUT','PROVIDER_UNAVAILABLE','INVALID_RESPONSE'];
  await ctx.db.patch(job._id,{status:retry?'PENDING':'FAILED',lastError:allowed.includes(args.error ?? '')?args.error!:'PROVIDER_UNAVAILABLE',dueAt:now+delay,updatedAt:now});
  if (retry) await ctx.scheduler.runAfter(delay,internal.translations.run,{translationId:job._id});
} });
export const run = internalAction({ args: { translationId: v.id('instructionTranslations') }, handler: async (ctx,args) => {
  const input = await ctx.runMutation(internal.translations.claim,args);
  if (!input) return;
  try {
    const result = await translateInstruction(input,{apiKey:process.env.GOOGLE_TRANSLATION_API_KEY});
    await ctx.runMutation(internal.translations.finish,{...args,attempt:input.attempt,text:result.text});
  } catch (error) {
    await ctx.runMutation(internal.translations.finish,{...args,attempt:input.attempt,error:error instanceof TranslationFailure?error.code:'PROVIDER_UNAVAILABLE'});
  }
} });
export const resume = internalMutation({ args: {}, handler: async ctx => {
  for (const status of ['PENDING','RUNNING'] as const) {
    const jobs = await ctx.db.query('instructionTranslations').withIndex('by_status_dueAt',q=>q.eq('status',status).lte('dueAt',Date.now())).take(10);
    for (const job of jobs) await ctx.scheduler.runAfter(0,internal.translations.run,{translationId:job._id});
  }
} });
/** Operator backfill for already-published current originals; no alert or instruction is changed. */
export const enqueueExisting = internalMutation({args:{instructionVersionId:v.id('instructionVersions')},handler:async(ctx,args)=>{
 const instruction=await ctx.db.get(args.instructionVersionId);
 const declaration=instruction?await ctx.db.get(instruction.declarationId):null;
 if(!instruction || !declaration?.active || declaration.instructionVersionId!==instruction._id)return {queued:false};
 await enqueueTranslations(ctx,instruction._id);return {queued:true};
}});
