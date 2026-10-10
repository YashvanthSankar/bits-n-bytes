import { v } from 'convex/values';

export const point = v.object({ latitude: v.number(), longitude: v.number() });
export const fix = v.object({ point, observedAt: v.number(), accuracyM: v.number() });
export const language = v.union(v.literal('en'), v.literal('hi'), v.literal('ta'), v.literal('fr'), v.literal('de'), v.literal('es'));
export const hazard = v.union(v.literal('FLASH_FLOOD'), v.literal('FLOOD_WATERLOGGING'), v.literal('LANDSLIDE'), v.literal('CYCLONE'), v.literal('SEVERE_STORM'), v.literal('COASTAL_SURGE'), v.literal('HEATWAVE'), v.literal('OTHER_NATURAL'));
export const permission = v.union(v.literal('granted'), v.literal('denied'), v.literal('undetermined'));
export const country = v.union(v.literal('INSIDE_INDIA'), v.literal('OUTSIDE_INDIA'), v.literal('UNCERTAIN'));
export const audience = v.union(v.literal('LIVE'), v.literal('DEMO'));
export const geometry = v.union(
  v.object({ type: v.literal('circle'), center: point, radiusM: v.number() }),
  v.object({ type: v.literal('polygon'), rings: v.array(v.array(point)) }),
  v.object({ type: v.literal('multipolygon'), polygons: v.array(v.array(v.array(point))) }),
);
export const qualification = v.union(v.literal('NOTIFIABLE_EMERGENCY'), v.literal('NOT_QUALIFIED'), v.literal('INSUFFICIENT_EVIDENCE'));
export const severity = v.union(v.literal('CRITICAL'), v.literal('HIGH'), v.literal('MODERATE'), v.literal('LOW'), v.literal('UNKNOWN'));
export const verification = v.union(v.literal('UNVERIFIED'), v.literal('CORROBORATED'), v.literal('AUTHORITY_VERIFIED'));
export const lifecycle = v.union(v.literal('ACTIVE'), v.literal('STALE'), v.literal('RESOLVED'), v.literal('REJECTED'), v.literal('MERGED'), v.literal('EXPIRED'));
export const assessmentStatus = v.union(v.literal('PENDING'), v.literal('ACCEPTED'), v.literal('ERROR'), v.literal('SUPERSEDED'));
export const provenance = v.union(v.literal('COMMUNITY'), v.literal('AUTHORITY'), v.literal('SACHET'));
export const actionKind = v.union(v.literal('STAY_PUT'), v.literal('AVOID_TRAVEL'), v.literal('NAMED_SHELTER'), v.literal('EVACUATE'), v.literal('OTHER'));
export const shelterStatus = v.union(v.literal('OPEN'), v.literal('CLOSED'), v.literal('FULL'), v.literal('UNKNOWN'));
export const accessibility = v.union(v.literal('STEP_FREE'), v.literal('NOT_STEP_FREE'), v.literal('UNKNOWN'));
