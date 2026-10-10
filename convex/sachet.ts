import { v } from 'convex/values';
import { internalAction, internalMutation, internalQuery } from './_generated/server';
import { internal } from './_generated/api';
import { fetchXml, INDIA_FEED, parseCap, parseDiscovery, parsePolygon, sachetUrl } from './providers/sachet';
import { payloadHash } from './lib/idempotency';
import { point } from './lib/validators';
import { POLICY } from '../src/domain/policy';
import { overlapsArea } from '../src/domain/geography';

export const prepare = internalMutation({ args: {}, handler: async ctx => {
  const url = INDIA_FEED;
  if (!await ctx.db.query('feedDocuments').withIndex('by_url', q => q.eq('url', url)).unique()) await ctx.db.insert('feedDocuments', { url, kind: 'RSS', revision: 0, failures: 0, nextPollAt: 0, leaseUntil: 0, generation: 0 });
} });
export const claim = internalMutation({ args: {}, handler: async ctx => {
  const now = Date.now(); const docs = await ctx.db.query('feedDocuments').withIndex('by_nextPollAt', q => q.lte('nextPollAt', now)).take(10);
  const claimed = [];
  for (const doc of docs) {
    if (doc.leaseUntil > now) continue;
    const generation = doc.generation + 1;
    await ctx.db.patch(doc._id, { generation, leaseUntil: now + 180_000, nextPollAt: now + 180_000, lastAttemptAt: now });
    claimed.push({ ...doc, generation });
  }
  return claimed;
} });
export const accept = internalMutation({ args: { id: v.id('feedDocuments'), generation: v.number(), xml: v.string(), etag: v.optional(v.string()) }, handler: async (ctx, args) => {
  const doc = await ctx.db.get(args.id); if (!doc || doc.generation !== args.generation || !doc.leaseUntil) return { accepted: false };
  const now = Date.now(), hash = payloadHash(args.xml), changed = hash !== doc.hash;
  const revision = doc.revision + (changed ? 1 : 0);
  if (doc.kind === 'RSS') {
    for (const url of parseDiscovery(args.xml)) {
      if (!await ctx.db.query('feedDocuments').withIndex('by_url', q => q.eq('url', url)).unique()) await ctx.db.insert('feedDocuments', { url, kind: 'CAP', revision: 0, failures: 0, nextPollAt: now, leaseUntil: 0, generation: 0 });
    }
  } else if (doc.kind === 'CAP') {
    const cap = parseCap(args.xml);
    // The provider uses a numeric fetch identifier distinct from CAP's IN-..._revision identity.
    let notice = await ctx.db.query('officialNotices').withIndex('by_key', q => q.eq('key', cap.key)).unique();
    if (changed || !notice) {
      const tombstone = await ctx.db.query('officialReferenceTombstones').withIndex('by_key', q => q.eq('key', cap.key)).unique();
      const data = { key: cap.key, sender: cap.sender, identifier: cap.identifier, sentAt: cap.sentAt, documentId: doc._id, revision, eligible: cap.eligible, active: cap.eligible && cap.msgType !== 'Cancel' && !tombstone, msgType: cap.msgType, references: cap.references, infos: cap.infos, updatedAt: now, ...(tombstone ? { supersededBy: tombstone.supersededBy } : {}) };
      const noticeId = notice?._id ?? await ctx.db.insert('officialNotices', data);
      if (notice) await ctx.db.patch(noticeId, data);
      await ctx.db.insert('officialNoticeRevisions', { noticeId, revision, hash, xml: args.xml, fetchedAt: now });
      if (cap.eligible && ['Update', 'Cancel'].includes(cap.msgType)) for (const key of cap.references) {
        // Only accepted Actual/Public provider documents can retire their explicit references.
        if (!await ctx.db.query('officialReferenceTombstones').withIndex('by_key', q => q.eq('key', key)).unique()) await ctx.db.insert('officialReferenceTombstones', { key, supersededBy: cap.key, msgType: cap.msgType, createdAt: now });
        const previous = await ctx.db.query('officialNotices').withIndex('by_key', q => q.eq('key', key)).unique();
        if (previous) await ctx.db.patch(previous._id, { active: false, supersededBy: cap.key, updatedAt: now });
      }
      notice = await ctx.db.get(noticeId);
    }
    for (const url of [...new Set(cap.infos.flatMap(i => i.polygonUrls))]) {
      if (!new URL(url).pathname.endsWith('/FetchPolygonXMLFile') || new URL(url).searchParams.get('identifier') !== new URL(doc.url).searchParams.get('identifier')) continue;
      if (!await ctx.db.query('feedDocuments').withIndex('by_url', q => q.eq('url', url)).unique()) await ctx.db.insert('feedDocuments', { url, kind: 'POLYGON', revision: 0, failures: 0, nextPollAt: now, leaseUntil: 0, generation: 0 });
    }
  } else {
    // Polygon XML carries CAP identity, not the numeric fetch token. Bind it to its linked CAP.
    const parentUrl = doc.url.replace('/FetchPolygonXMLFile', '/FetchXMLFile');
    const parent = await ctx.db.query('feedDocuments').withIndex('by_url', q => q.eq('url', parentUrl)).unique();
    if (!parent?.xml) throw Error('CAP_POLYGON_PARENT_MISSING');
    const cap = parseCap(parent.xml);
    if (!cap.infos.some(info => info.polygonUrls.includes(doc.url))) throw Error('CAP_POLYGON_NOT_LINKED');
    parsePolygon(args.xml, cap.identifier);
  }
  await ctx.db.patch(doc._id, { xml: args.xml, etag: args.etag, hash, revision, lastSuccessAt: now, ...(changed ? { changedAt: now } : {}), failures: 0, lastError: undefined, leaseUntil: 0, nextPollAt: now + POLICY.feedIntervalMs });
  return { accepted: true, changed };
} });
export const fail = internalMutation({ args: { id: v.id('feedDocuments'), generation: v.number(), error: v.string() }, handler: async (ctx, args) => {
  const doc = await ctx.db.get(args.id); if (!doc || doc.generation !== args.generation || !doc.leaseUntil) return;
  const failures = doc.failures + 1;
  await ctx.db.patch(doc._id, { failures, lastError: args.error.slice(0, 80), leaseUntil: 0, nextPollAt: Date.now() + Math.min(6 * 60 * 60_000, POLICY.feedIntervalMs * 2 ** Math.min(failures - 1, 4)) });
} });
export const poll = internalAction({ args: {}, handler: async ctx => {
  await ctx.runMutation(internal.sachet.prepare, {});
  const docs = await ctx.runMutation(internal.sachet.claim, {});
  // At most ten bounded fetches per worker, sequential to keep provider pressure low.
  for (const doc of docs) {
    try {
      sachetUrl(doc.url);
      const result = await fetchXml(doc.url, doc.xml ? { xml: doc.xml, ...(doc.etag ? { etag: doc.etag } : {}) } : null);
      await ctx.runMutation(internal.sachet.accept, { id: doc._id, generation: doc.generation, xml: result.xml, ...(result.etag ? { etag: result.etag } : {}) });
    } catch (error) {
      const code = error instanceof Error && /^(CAP_|XML_|RSS_|SACHET_)[A-Z_]+$/.test(error.message) ? error.message : 'SACHET_FETCH_FAILED';
      await ctx.runMutation(internal.sachet.fail, { id: doc._id, generation: doc.generation, error: code });
    }
  }
  if (docs.length === 10) await ctx.scheduler.runAfter(1000, internal.sachet.poll, {});
} });
export const status = internalQuery({ args: {}, handler: async ctx => {
  const docs = await ctx.db.query('feedDocuments').take(501);
  return { partial: docs.length > 500, documents: docs.slice(0, 500).map(d => ({ kind: d.kind, revision: d.revision, lastSuccessAt: d.lastSuccessAt, failures: d.failures, lastError: d.lastError })), notices: (await ctx.db.query('officialNotices').take(501)).length };
} });

/** Source evidence only: official provenance does not automatically imply immediate emergency. */
export const relevant = internalQuery({ args: { point, accuracyM: v.number() }, handler: async (ctx, args) => {
  if (!Number.isFinite(args.accuracyM) || args.accuracyM < 0 || args.accuracyM > 1000) throw Error('CAP_POSITION_INVALID');
  const now = Date.now();
  const notices = await ctx.db.query('officialNotices').withIndex('by_active_sentAt', q => q.eq('active', true)).order('desc').take(201);
  const items = []; let geometryPending = 0;
  for (const notice of notices.slice(0, 200)) {
    const document = await ctx.db.get(notice.documentId);
    if (!document?.lastSuccessAt || notice.sentAt > now + 300_000) continue;
    for (const info of notice.infos) {
      if ((info.expiresAt !== null && info.expiresAt <= now) || (info.effectiveAt !== null && info.effectiveAt > now)) continue;
      const geometries = [...info.geometries]; let checkedAt = document.lastSuccessAt;
      for (const url of info.polygonUrls) {
        const polygon = await ctx.db.query('feedDocuments').withIndex('by_url', q => q.eq('url', url)).unique();
        if (!polygon?.xml || !polygon.lastSuccessAt) continue;
        try { geometries.push(...parsePolygon(polygon.xml, notice.identifier)); checkedAt = Math.min(checkedAt, polygon.lastSuccessAt); } catch { /* Mismatched old geometry is not evidence for the new revision. */ }
      }
      if (!geometries.length) { geometryPending++; continue; }
      if (!geometries.some(area => overlapsArea({ point: args.point, accuracyM: args.accuracyM, observedAt: now }, area))) continue;
      const { polygonUrls: omitted, ...original } = info; void omitted;
      items.push({ noticeId: notice._id, revision: notice.revision, sourceUrl: document.url, issuer: notice.sender, identifier: notice.identifier, issuedAt: notice.sentAt, checkedAt, stale: now - checkedAt > POLICY.feedStaleMs, ...original, geometries });
    }
  }
  return { items, geometryPending, partial: notices.length > 200, checkedAt: now };
} });
