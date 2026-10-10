import { LANGUAGE_CODES, type LanguageCode } from '../../src/contracts/domain';

export class TranslationFailure extends Error {
  constructor(readonly code: 'CONFIGURATION' | 'INVALID_INPUT' | 'PROVIDER_UNAVAILABLE' | 'INVALID_RESPONSE') { super(code); }
}
function decodeEntities(text: string) {
  return text.replace(/&(#x[0-9a-f]+|#\d+|amp|lt|gt|quot|apos);/gi, (match, entity: string) => {
    const named: Record<string, string> = { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'" };
    if (entity[0] !== '#') return named[entity.toLowerCase()] ?? match;
    const value = entity[1]?.toLowerCase() === 'x' ? parseInt(entity.slice(2), 16) : Number(entity.slice(1));
    return Number.isInteger(value) && value > 0 && value <= 0x10ffff && !(value >= 0xd800 && value <= 0xdfff) ? String.fromCodePoint(value) : match;
  });
}
const numericTokens = (text: string) => text.normalize('NFKC').match(/\d+(?:[.,:/-]\d+)*/g) ?? [];
/** Detectable integrity checks only; never a claim to verify negation or semantic equivalence. */
export function translationIntegrity(original: string, translated: string, protectedTerms: readonly string[] = []) {
  const sourceNumbers = numericTokens(original), targetNumbers = numericTokens(translated);
  const issues: ('NUMBERS_CHANGED' | 'PROTECTED_TERM_CHANGED')[] = [];
  if (JSON.stringify([...sourceNumbers].sort()) !== JSON.stringify([...targetNumbers].sort())) issues.push('NUMBERS_CHANGED');
  if (protectedTerms.some(term => original.includes(term) && !translated.includes(term))) issues.push('PROTECTED_TERM_CHANGED');
  return { issues, requiresHumanReview: true as const };
}

/** Server-only Basic v2. Never sends identity, geography history, or credentials in URLs. */
export async function translateInstruction(input: { text: string; source: LanguageCode; target: LanguageCode; protectedTerms?: readonly string[] }, options: { apiKey: string | undefined; fetcher?: (url: string, init: RequestInit) => Promise<Response> }) {
  if (!input.text.trim() || input.text.length > 8000 || !LANGUAGE_CODES.includes(input.source) || !LANGUAGE_CODES.includes(input.target)) throw new TranslationFailure('INVALID_INPUT');
  if (input.source === input.target) return { text: input.text, provider: 'ORIGINAL' as const, issues: [], requiresHumanReview: false };
  if (!options.apiKey) throw new TranslationFailure('CONFIGURATION');
  let response: Response;
  try {
    response = await (options.fetcher ?? fetch)('https://translation.googleapis.com/language/translate/v2', {
      method: 'POST', headers: { 'Content-Type': 'application/json', 'X-Goog-Api-Key': options.apiKey },
      body: JSON.stringify({ q: input.text, source: input.source, target: input.target, format: 'text' }), signal: AbortSignal.timeout(15_000),
    });
  } catch { throw new TranslationFailure('PROVIDER_UNAVAILABLE'); }
  if (!response.ok) throw new TranslationFailure('PROVIDER_UNAVAILABLE');
  let body: unknown;
  try { body = await response.json(); } catch { throw new TranslationFailure('INVALID_RESPONSE'); }
  if (!body || typeof body !== 'object' || !('data' in body)) throw new TranslationFailure('INVALID_RESPONSE');
  const data = body.data;
  if (!data || typeof data !== 'object' || !('translations' in data) || !Array.isArray(data.translations) || data.translations.length !== 1) throw new TranslationFailure('INVALID_RESPONSE');
  const value: unknown = data.translations[0];
  if (!value || typeof value !== 'object' || !('translatedText' in value) || typeof value.translatedText !== 'string' || !value.translatedText.trim() || value.translatedText.length > 32_000) throw new TranslationFailure('INVALID_RESPONSE');
  const text = decodeEntities(value.translatedText);
  return { text, provider: 'GOOGLE_BASIC_V2' as const, ...translationIntegrity(input.text, text, input.protectedTerms) };
}
