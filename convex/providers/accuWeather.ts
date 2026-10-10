import type { Point } from '../../src/contracts/domain';
import { isValidPoint } from '../../src/domain/eligibility';

export class WeatherFailure extends Error {
  constructor(readonly code: 'CONFIGURATION' | 'INVALID_INPUT' | 'INVALID_RESPONSE' | 'UNAVAILABLE' | 'QUOTA', readonly retryAfterMs = 60_000) { super(code); }
}
type Obj = Record<string, unknown>;
const obj = (value: unknown): Obj => value && typeof value === 'object' && !Array.isArray(value) ? value as Obj : {};
const num = (value: unknown): number | null => typeof value === 'number' && Number.isFinite(value) ? value : null;
function metric(value: unknown, unit: string): number | null {
  const amount = obj(obj(value).Metric); return amount.Unit === unit ? num(amount.Value) : null;
}
export type WeatherSample = { observedAt: number; description: string; temperatureC: number | null; windKmh: number | null; gustKmh: number | null; hasPrecipitation: boolean | null; precipitationType: string | null; precipitation1hMm: number | null };
export function normalizeConditions(value: unknown, limit: number): WeatherSample[] {
  if (!Array.isArray(value) || !value.length || value.length > limit) throw new WeatherFailure('INVALID_RESPONSE');
  return value.map(raw => {
    const item = obj(raw), epoch = num(item.EpochTime);
    if (epoch === null || epoch < 1_000_000_000 || epoch > 10_000_000_000 || typeof item.WeatherText !== 'string' || item.WeatherText.length > 300) throw new WeatherFailure('INVALID_RESPONSE');
    return { observedAt: epoch * 1000, description: item.WeatherText, temperatureC: metric(item.Temperature, 'C'), windKmh: metric(obj(item.Wind).Speed, 'km/h'), gustKmh: metric(obj(item.WindGust).Speed, 'km/h'), hasPrecipitation: typeof item.HasPrecipitation === 'boolean' ? item.HasPrecipitation : null, precipitationType: typeof item.PrecipitationType === 'string' ? item.PrecipitationType.slice(0, 50) : null, precipitation1hMm: metric(item.Precip1hr, 'mm') };
  }).sort((a, b) => b.observedAt - a.observedAt);
}
export type WeatherOptions = { apiKey: string | undefined; fetcher?: (url: string, init: RequestInit) => Promise<Response> };
async function get(path: string, options: WeatherOptions): Promise<unknown> {
  if (!options.apiKey) throw new WeatherFailure('CONFIGURATION');
  let response: Response;
  try { response = await (options.fetcher ?? fetch)(`https://dataservice.accuweather.com${path}`, { headers: { Authorization: `Bearer ${options.apiKey}` }, signal: AbortSignal.timeout(15_000), redirect: 'error' }); } catch { throw new WeatherFailure('UNAVAILABLE'); }
  if ([401, 403].includes(response.status)) throw new WeatherFailure('CONFIGURATION');
  if (response.status === 429) {
    const raw = response.headers.get('retry-after'); const seconds = raw && /^\d+$/.test(raw) ? Number(raw) * 1000 : raw ? Date.parse(raw) - Date.now() : 60_000;
    throw new WeatherFailure('QUOTA', Math.max(60_000, Math.min(3_600_000, Number.isFinite(seconds) ? seconds : 60_000)));
  }
  if (!response.ok) throw new WeatherFailure('UNAVAILABLE');
  if (Number(response.headers.get('content-length')) > 256_000 || !response.body) throw new WeatherFailure('INVALID_RESPONSE');
  const reader = response.body.getReader(), decoder = new TextDecoder(); let size = 0, body = '';
  try { for (;;) { const part = await reader.read(); if (part.done) break; size += part.value.byteLength; if (size > 256_000) throw new WeatherFailure('INVALID_RESPONSE'); body += decoder.decode(part.value, { stream: true }); } body += decoder.decode(); } finally { await reader.cancel(); }
  try { return JSON.parse(body); } catch { throw new WeatherFailure('INVALID_RESPONSE'); }
}
export async function resolveWeatherLocation(position: Point, options: WeatherOptions) {
  if (!isValidPoint(position)) throw new WeatherFailure('INVALID_INPUT');
  const data = obj(await get(`/locations/v1/cities/geoposition/search?q=${position.latitude},${position.longitude}&language=en-us`, options));
  const key = data.Key, geo = obj(data.GeoPosition), latitude = num(geo.Latitude), longitude = num(geo.Longitude);
  if (typeof key !== 'string' || !/^[A-Za-z0-9_-]{1,80}$/.test(key) || latitude === null || longitude === null || !isValidPoint({ latitude, longitude })) throw new WeatherFailure('INVALID_RESPONSE');
  return { locationKey: key, providerPoint: { latitude, longitude }, locality: typeof data.EnglishName === 'string' ? data.EnglishName.slice(0, 200) : 'Unknown', resolution: typeof data.Type === 'string' ? data.Type.slice(0, 50) : 'Unknown' };
}
export async function fetchConditions(locationKey: string, options: WeatherOptions) {
  if (!/^[A-Za-z0-9_-]{1,80}$/.test(locationKey)) throw new WeatherFailure('INVALID_INPUT');
  const current = normalizeConditions(await get(`/currentconditions/v1/${locationKey}?details=true`, options), 1)[0]!;
  // Missing/forbidden history stays unknown; a usable current observation survives history failure.
  try {
    const history = normalizeConditions(await get(`/currentconditions/v1/${locationKey}/historical/24?details=true`, options), 24);
    return { current, history, historyAvailability: 'AVAILABLE' as const };
  } catch (error) {
    return { current, history: [] as WeatherSample[], historyAvailability: error instanceof WeatherFailure ? error.code : 'UNAVAILABLE' as const };
  }
}
