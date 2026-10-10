import { DAY, MINUTE } from './policy';

export type ObservationTimeChoice = 'NOW' | 'MINUTES_15' | 'MINUTES_30' | 'EARLIER';
/** An explicit device-local date/time; reject impossible times and the rolling 24-hour boundary. */
export function observationTime(choice: ObservationTimeChoice, earlierDay: 'TODAY' | 'YESTERDAY', clock: string, now: number): number | null {
  if (choice !== 'EARLIER') return now - (choice === 'MINUTES_15' ? 15 : choice === 'MINUTES_30' ? 30 : 0) * MINUTE;
  const match = /^(\d{2}):(\d{2})$/.exec(clock.trim());
  if (!match || Number(match[1]) > 23 || Number(match[2]) > 59) return null;
  const date = new Date(now);
  if (earlierDay === 'YESTERDAY') date.setDate(date.getDate() - 1);
  date.setHours(Number(match[1]), Number(match[2]), 0, 0);
  const value = date.getTime();
  // During a daylight-saving gap Date adjusts the clock. Never silently reinterpret user input.
  if (date.getHours() !== Number(match[1]) || date.getMinutes() !== Number(match[2]) || value > now || now - value > DAY) return null;
  return value;
}
