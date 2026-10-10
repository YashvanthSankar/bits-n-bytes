import type { HazardCode } from '../contracts/domain';

export const MINUTE = 60_000;
export const HOUR = 60 * MINUTE;
export const DAY = 24 * HOUR;
export const POLICY_VERSION = '2026-10-10-v1';

export const HAZARD_POLICY: Readonly<Record<HazardCode, {
  radiusM: number; witnessWindowMs: number; staleAfterMs: number;
}>> = {
  FLASH_FLOOD: { radiusM: 5_000, witnessWindowMs: HOUR, staleAfterMs: 2 * HOUR },
  FLOOD_WATERLOGGING: { radiusM: 5_000, witnessWindowMs: 2 * HOUR, staleAfterMs: 6 * HOUR },
  LANDSLIDE: { radiusM: 1_000, witnessWindowMs: HOUR, staleAfterMs: 6 * HOUR },
  CYCLONE: { radiusM: 25_000, witnessWindowMs: 6 * HOUR, staleAfterMs: DAY },
  SEVERE_STORM: { radiusM: 10_000, witnessWindowMs: 2 * HOUR, staleAfterMs: 6 * HOUR },
  COASTAL_SURGE: { radiusM: 5_000, witnessWindowMs: 2 * HOUR, staleAfterMs: 6 * HOUR },
  HEATWAVE: { radiusM: 10_000, witnessWindowMs: 6 * HOUR, staleAfterMs: DAY },
  OTHER_NATURAL: { radiusM: 2_000, witnessWindowMs: HOUR, staleAfterMs: 2 * HOUR },
};

export const POLICY = {
  version: POLICY_VERSION,
  entryFix: { maxAgeMs: 5 * MINUTE, maxAccuracyM: 200 },
  chatFix: { maxAgeMs: 5 * MINUTE, maxAccuracyM: 500 },
  alertFix: { maxAgeMs: 30 * MINUTE, maxAccuracyM: 1_000 },
  staleLocationMs: 15 * MINUTE,
  maxObservationAgeMs: DAY,
  witnessCooldownMs: 10 * MINUTE,
  incidentHourlyLimit: 5,
  corroboratedWitnessCount: 2,
  qualificationProbability: 0.9,
  assessmentIntervalMs: 5 * MINUTE,
  assessmentRetryMs: [MINUTE, 5 * MINUTE, 15 * MINUTE] as readonly number[],
  feedIntervalMs: 2 * MINUTE,
  feedStaleMs: 10 * MINUTE,
  weatherStaleMs: 30 * MINUTE,
  shelterFreshMs: 2 * HOUR,
  shelterRadiusM: 50_000,
  chatRadiusM: 15_000,
  chatLifetimeMs: DAY,
  chatMaxCharacters: 500,
  chatMinuteLimit: 5,
  chatHourlyLimit: 30,
  repeatSoundCooldownMs: 10 * MINUTE,
  silentReentryMs: 30 * MINUTE,
  locationRetentionMs: DAY,
  alertHistoryMs: 30 * DAY,
} as const;
