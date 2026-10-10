import { afterEach, expect, it, vi } from 'vitest';
import { relativeTime } from '../src/i18n/relativeTime';
afterEach(() => vi.unstubAllGlobals());
it('formats relative time without the Intl constructor missing on Hermes', () => {
  vi.stubGlobal('Intl', { RelativeTimeFormat: undefined });
  const now = 1_800_000_000_000;
  expect(relativeTime(now - 15 * 60_000, 'en', now)).toBe('15 min ago');
});
it('handles minute/hour/day boundaries, future clock skew and invalid input', () => {
  const now = 1_800_000_000_000;
  expect(relativeTime(now - 59_000, 'en', now)).toBe('Just now');
  expect(relativeTime(now - 60_000, 'en', now)).toBe('1 min ago');
  expect(relativeTime(now - 3_600_000, 'en', now)).toBe('1 hr ago');
  expect(relativeTime(now - 86_400_000, 'en', now)).toBe('1 d ago');
  expect(relativeTime(now + 30_000, 'en', now)).toBe('Just now');
  expect(relativeTime(NaN, 'en', now)).toBe('—');
});
it('localizes supported languages and falls back for unsupported locales', () => {
  for (const language of ['en','hi','ta','fr','de','es']) expect(relativeTime(0,language,900_000)).not.toContain('{{count}}');
  expect(relativeTime(0,'fr-FR',900_000)).toBe('il y a 15 min');
  expect(relativeTime(0,'xx',900_000)).toBe('15 min ago');
});
