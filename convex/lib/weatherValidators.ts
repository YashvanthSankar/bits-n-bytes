import { v } from 'convex/values';
import { point } from './validators';
const number = v.union(v.number(), v.null());
export const weatherSample = v.object({ observedAt: v.number(), description: v.string(), temperatureC: number, windKmh: number, gustKmh: number, hasPrecipitation: v.union(v.boolean(), v.null()), precipitationType: v.union(v.string(), v.null()), precipitation1hMm: number });
export const weatherData = v.object({ locationKey: v.string(), providerPoint: point, locality: v.string(), resolution: v.string(), current: weatherSample, history: v.array(weatherSample), historyAvailability: v.string() });
