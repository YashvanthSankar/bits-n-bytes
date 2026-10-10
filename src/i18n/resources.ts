import { LANGUAGE_CODES, type LanguageCode } from '../contracts/domain';
import { en } from './locales/en';
import { hi } from './locales/hi';
import { ta } from './locales/ta';
import { fr } from './locales/fr';
import { de } from './locales/de';
import { es } from './locales/es';

// Keep every locale renderable when a newly added UI label is awaiting language review.
// Locale-specific entries always win over this English fallback.
export const dictionaries = { en, hi: { ...en, ...hi }, ta: { ...en, ...ta }, fr: { ...en, ...fr }, de: { ...en, ...de }, es: { ...en, ...es } };
export const languageNames: Record<LanguageCode, { native: string; english: string }> = {
  en: { native: 'English', english: 'English' }, hi: { native: 'हिन्दी', english: 'Hindi' },
  ta: { native: 'தமிழ்', english: 'Tamil' }, fr: { native: 'Français', english: 'French' },
  de: { native: 'Deutsch', english: 'German' }, es: { native: 'Español', english: 'Spanish' },
};
export function isLanguageCode(value: unknown): value is LanguageCode {
  return typeof value === 'string' && LANGUAGE_CODES.some((code) => code === value);
}
