import { XMLParser, XMLValidator } from 'fast-xml-parser';
import type { Infer } from 'convex/values';
import type { geometry } from '../lib/validators';
type AreaGeometry = Infer<typeof geometry>;
import { validateArea } from '../lib/areas';

export const INDIA_FEED = 'https://sachet.ndma.gov.in/cap_public_website/rss/rss_india.xml';
const MAX_BYTES = 512_000;
type Node = Record<string, unknown>;
const list = (value: unknown): unknown[] => value === undefined ? [] : Array.isArray(value) ? value : [value];
const node = (value: unknown): Node => value && typeof value === 'object' && !Array.isArray(value) ? value as Node : {};
const text = (value: unknown): string => typeof value === 'string' ? value.trim() : typeof value === 'number' ? String(value) : '';
const required = (value: unknown): string => { const s = text(value); if (!s) throw Error('CAP_REQUIRED_FIELD'); return s; };
const date = (value: unknown): number | null => { const s = text(value); if (!s) return null; const n = Date.parse(s); if (!Number.isFinite(n)) throw Error('CAP_INVALID_TIME'); return n; };
export function sachetUrl(value: string): string {
  const u = new URL(value);
  if (u.origin !== 'https://sachet.ndma.gov.in' || u.username || u.password || u.hash) throw Error('SACHET_URL_REJECTED');
  if (!/^\/cap_public_website\/rss\/rss_[a-z_]+\.xml$/.test(u.pathname) && !['/cap_public_website/FetchXMLFile', '/cap_public_website/FetchPolygonXMLFile'].includes(u.pathname)) throw Error('SACHET_URL_REJECTED');
  if (!u.pathname.includes('/rss/') && (!u.searchParams.get('identifier') || u.searchParams.get('identifier')!.length > 300)) throw Error('SACHET_URL_REJECTED');
  return u.href;
}
function xml(value: string): Node {
  if (new TextEncoder().encode(value).length > MAX_BYTES || /<!\s*(DOCTYPE|ENTITY)\b/i.test(value)) throw Error('XML_REJECTED');
  // Bound nesting before constructing an object graph. CDATA and comments cannot introduce tags.
  const tags = value.replace(/<!\[CDATA\[[\s\S]*?\]\]>/g, '').replace(/<!--[\s\S]*?-->/g, '').match(/<[^>]+>/g) ?? [];
  let depth = 0;
  for (const tag of tags) { if (/^<\//.test(tag)) depth--; else if (!/^<[?!]/.test(tag) && !/\/>$/.test(tag)) depth++; if (depth > 32) throw Error('XML_DEPTH'); }
  if (XMLValidator.validate(value) !== true) throw Error('XML_INVALID');
  return node(new XMLParser({ ignoreAttributes: false, removeNSPrefix: true, parseTagValue: false, trimValues: true }).parse(value));
}
export function parseDiscovery(value: string): string[] {
  const root = xml(value); const channel = node(node(root.rss).channel);
  if (!root.rss || !node(root.rss).channel) throw Error('RSS_INVALID');
  const items = list(channel.item); if (items.length > 500) throw Error('RSS_TOO_MANY_ITEMS');
  return [...new Set(items.flatMap(item => { try { const url = sachetUrl(text(node(item).link)); return new URL(url).pathname.endsWith('/FetchXMLFile') ? [url] : []; } catch { return []; } }))];
}
function coordinate(value: string) {
  const parts = value.split(','); if (parts.length !== 2 || parts.some(p => !p.trim())) throw Error('CAP_COORDINATE');
  return { latitude: Number(parts[0]), longitude: Number(parts[1]) };
}
function polygon(value: string): AreaGeometry { const area: AreaGeometry = { type: 'polygon', rings: [value.trim().split(/\s+/).map(coordinate)] }; validateArea(area); return area; }
function circle(value: string): AreaGeometry { const parts = value.trim().split(/\s+/); if (parts.length !== 2) throw Error('CAP_CIRCLE'); const area: AreaGeometry = { type: 'circle', center: coordinate(parts[0]!), radiusM: Number(parts[1]) * 1000 }; validateArea(area); return area; }
export type CapInfo = { language: string; event: string; headline: string; description: string; instruction: string; urgency: string; severity: string; certainty: string; responseTypes: string[]; effectiveAt: number | null; onsetAt: number | null; expiresAt: number | null; areaDescriptions: string[]; geometries: AreaGeometry[]; polygonUrls: string[] };
export type CapNotice = { key: string; identifier: string; sender: string; sentAt: number; status: string; scope: string; msgType: string; references: string[]; eligible: boolean; infos: CapInfo[] };
export function parseCap(value: string): CapNotice {
  const a = node(xml(value).alert); const identifier = required(a.identifier), sender = required(a.sender), sentAt = date(a.sent);
  if (sentAt === null) throw Error('CAP_REQUIRED_FIELD');
  const status = required(a.status), scope = required(a.scope), msgType = required(a.msgType);
  if (!['Alert', 'Update', 'Cancel', 'Ack', 'Error'].includes(msgType)) throw Error('CAP_MESSAGE_TYPE');
  const references = text(a.references).split(/\s+/).filter(Boolean).map(ref => { const p = ref.split(','); if (p.length !== 3 || !p[0] || !p[1]) throw Error('CAP_REFERENCE'); const at = date(p[2]); if (at === null) throw Error('CAP_REFERENCE'); return JSON.stringify([p[0], p[1], at]); });
  if (references.length > 100 || (['Update', 'Cancel'].includes(msgType) && !references.length)) throw Error('CAP_REFERENCE');
  const infos = list(a.info).map(raw => {
    const i = node(raw); const areas = list(i.area).map(node); const geometries: AreaGeometry[] = [], polygonUrls: string[] = [];
    for (const area of areas) {
      for (const p of list(area.polygon)) geometries.push(polygon(required(p)));
      for (const c of list(area.circle)) geometries.push(circle(required(c)));
    }
    for (const parameter of [...list(i.parameter), ...areas.flatMap(area => list(area.parameter))]) {
      const p = node(parameter); if (text(p.valueName).toLowerCase() === 'polygon url') polygonUrls.push(sachetUrl(required(p.value)));
    }
    if (geometries.length > 32 || polygonUrls.length > 8) throw Error('CAP_GEOMETRY_LIMIT');
    return { language: text(i.language) || 'en', event: required(i.event), headline: text(i.headline), description: text(i.description), instruction: text(i.instruction), urgency: text(i.urgency), severity: text(i.severity), certainty: text(i.certainty), responseTypes: list(i.responseType).map(text), effectiveAt: date(i.effective), onsetAt: date(i.onset), expiresAt: date(i.expires), areaDescriptions: areas.map(area => text(area.areaDesc)), geometries, polygonUrls };
  });
  if (infos.length > 20 || (!infos.length && msgType !== 'Cancel')) throw Error('CAP_INFO_INVALID');
  return { key: JSON.stringify([sender, identifier, sentAt]), identifier, sender, sentAt, status, scope, msgType, references, eligible: status === 'Actual' && scope === 'Public' && ['Alert', 'Update', 'Cancel'].includes(msgType), infos };
}
export function parsePolygon(value: string, identifier: string): AreaGeometry[] {
  const a = node(xml(value).alert); if (required(a.identifier) !== identifier) throw Error('CAP_POLYGON_ID_MISMATCH');
  const result = list(a.polygon).map(p => polygon(required(p))); if (!result.length || result.length > 32) throw Error('CAP_GEOMETRY_LIMIT'); return result;
}
export async function fetchXml(url: string, cached: { xml: string; etag?: string } | null, fetcher: (url: string, init: RequestInit) => Promise<Response> = fetch): Promise<{ xml: string; etag?: string; unchanged: boolean }> {
  const response = await fetcher(sachetUrl(url), { redirect: 'error', signal: AbortSignal.timeout(15_000), headers: cached?.etag ? { 'If-None-Match': cached.etag } : {} });
  if (response.status === 304) { if (!cached?.xml) throw Error('SACHET_CACHE_MISSING'); return { ...cached, unchanged: true }; }
  if (response.status !== 200) throw Error('SACHET_HTTP_ERROR');
  if (Number(response.headers.get('content-length')) > MAX_BYTES) throw Error('SACHET_TOO_LARGE');
  if (!response.body) throw Error('SACHET_EMPTY');
  const reader = response.body.getReader(); const decoder = new TextDecoder(); let body = '', size = 0;
  try { for (;;) { const part = await reader.read(); if (part.done) break; size += part.value.byteLength; if (size > MAX_BYTES) throw Error('SACHET_TOO_LARGE'); body += decoder.decode(part.value, { stream: true }); } body += decoder.decode(); } finally { await reader.cancel(); }
  xml(body); const etag = response.headers.get('etag') ?? undefined;
  return { xml: body, ...(etag ? { etag } : {}), unchanged: false };
}
