import { LANGUAGE_CODES, type LanguageCode } from '../contracts/domain';
import { en } from './locales/en';
import { hi } from './locales/hi';
import { ta } from './locales/ta';
import { fr } from './locales/fr';
import { de } from './locales/de';
import { es } from './locales/es';

export const dictionaries = { en, hi, ta, fr, de, es };
export const languageNames: Record<LanguageCode, { native: string; english: string }> = {
  en: { native: 'English', english: 'English' }, hi: { native: 'हिन्दी', english: 'Hindi' },
  ta: { native: 'தமிழ்', english: 'Tamil' }, fr: { native: 'Français', english: 'French' },
  de: { native: 'Deutsch', english: 'German' }, es: { native: 'Español', english: 'Spanish' },
};
export function isLanguageCode(value: unknown): value is LanguageCode {
  return typeof value === 'string' && LANGUAGE_CODES.some((code) => code === value);
}
