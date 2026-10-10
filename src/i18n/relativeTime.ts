import { dictionaries, isLanguageCode } from './resources';

/** Hermes does not guarantee Intl.RelativeTimeFormat. Keep this dependency-free on native. */
export function relativeTime(timestamp: number, language: string, now = Date.now()) {
  const base = language.split('-')[0];
  const labels = dictionaries[isLanguageCode(base) ? base : 'en'];
  const seconds = Math.max(0, (now - timestamp) / 1000);
  if (!Number.isFinite(seconds)) return '—';
  if (seconds < 60) return labels.relativeNow;
  const [value, template] = seconds < 3600 ? [Math.floor(seconds / 60), labels.relativeMinutes]
    : seconds < 86400 ? [Math.floor(seconds / 3600), labels.relativeHours] : [Math.floor(seconds / 86400), labels.relativeDays];
  return String(template).replace('{{count}}', String(value));
}
