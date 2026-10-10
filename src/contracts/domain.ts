export const LANGUAGE_CODES = ['en', 'hi', 'ta', 'fr', 'de', 'es'] as const;
export type LanguageCode = (typeof LANGUAGE_CODES)[number];

export const HAZARD_CODES = [
  'FLASH_FLOOD', 'FLOOD_WATERLOGGING', 'LANDSLIDE', 'CYCLONE',
  'SEVERE_STORM', 'COASTAL_SURGE', 'HEATWAVE', 'OTHER_NATURAL',
] as const;
export type HazardCode = (typeof HAZARD_CODES)[number];
export type Verification = 'UNVERIFIED' | 'CORROBORATED' | 'AUTHORITY_VERIFIED';
export type IncidentLifecycle = 'ACTIVE' | 'STALE' | 'RESOLVED' | 'REJECTED' | 'MERGED' | 'EXPIRED';
export type Qualification = 'NOTIFIABLE_EMERGENCY' | 'NOT_QUALIFIED' | 'INSUFFICIENT_EVIDENCE';
export type AssessmentStatus = 'PENDING' | 'ACCEPTED' | 'ERROR' | 'SUPERSEDED';
export type Severity = 'CRITICAL' | 'HIGH' | 'MODERATE' | 'LOW' | 'UNKNOWN';
export type Provenance = 'COMMUNITY' | 'AUTHORITY' | 'SACHET';
export type DataAudience = 'LIVE' | 'DEMO';
export type PermissionState = 'granted' | 'denied' | 'undetermined';
export type CountryStatus = 'INSIDE_INDIA' | 'OUTSIDE_INDIA' | 'UNCERTAIN';

/** WGS84 named coordinates. GeoJSON arrays must explicitly use longitude, latitude. */
export interface Point { latitude: number; longitude: number }
export interface LocationFix {
  point: Point;
  observedAt: number;
  accuracyM: number;
}
export type AreaGeometry =
  | { type: 'circle'; center: Point; radiusM: number }
  | { type: 'polygon'; rings: readonly (readonly Point[])[] }
  | { type: 'multipolygon'; polygons: readonly (readonly (readonly Point[])[])[] };

export interface RevisionCommand {
  requestId: string;
  expectedRevision: number;
}
/** Contains no actor ID: the backend derives identity from the authenticated session. */
export interface ObservationCommand {
  requestId: string;
  hazard: HazardCode;
  fix: LocationFix;
  observedAt: number;
  description: string;
  incidentId?: string;
}
export interface SourceFreshness {
  available: boolean;
  lastSuccessAt: number | null;
  observedAt: number | null;
  reason: string | null;
}
export interface ChoiceAssessment {
  choice: Qualification;
  optionProbability: number;
  confidence: number | null;
  evidenceGeneration: number;
  controlRevision: number;
  policyVersion: string;
}
export interface PublicIncident {
  id: string;
  hazard: HazardCode;
  locality: string;
  geometry: AreaGeometry;
  provenance: Provenance;
  verification: Verification;
  lifecycle: IncidentLifecycle;
  qualification: Qualification | null;
  assessmentStatus: AssessmentStatus;
  severity: Severity;
  recentWitnesses: number;
  totalWitnesses: number;
  lastObservedAt: number;
  revision: number;
  audience: DataAudience;
}
