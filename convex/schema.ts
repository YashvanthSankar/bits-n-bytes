import { authTables } from '@convex-dev/auth/server';
import { defineSchema, defineTable } from 'convex/server';
import { v } from 'convex/values';
import * as types from './lib/validators';

export default defineSchema({
  ...authTables,
  profiles: defineTable({
    userId: v.id('users'), name: v.string(), alias: v.string(), language: types.language,
    bloodGroup: v.optional(v.string()), emergencyContact: v.optional(v.object({ name: v.string(), phone: v.string() })),
    stepFreeNeeded: v.boolean(), demoEnabled: v.boolean(), onboardingCompletedAt: v.number(), revision: v.number(),
  }).index('by_user', ['userId']),
  agencies: defineTable({ name: v.string(), sourceLabel: v.string(), active: v.boolean(), audience: types.audience }).index('by_active', ['active']),
  jurisdictions: defineTable({ agencyId: v.id('agencies'), name: v.string(), geometryId: v.id('geometries'), coverageVersion: v.number(), active: v.boolean() }).index('by_agency', ['agencyId']),
  authorityMemberships: defineTable({
    userId: v.id('users'), agencyId: v.id('agencies'), jurisdictionIds: v.array(v.id('jurisdictions')),
    status: v.union(v.literal('ACTIVE'), v.literal('REVOKED')), approvedBy: v.string(), approvedAt: v.number(), revokedAt: v.optional(v.number()),
  }).index('by_user_status', ['userId', 'status']).index('by_agency', ['agencyId']),
  locations: defineTable({
    userId: v.id('users'), point: types.point, observedAt: v.number(), receivedAt: v.number(), accuracyM: v.number(), countryStatus: types.country,
    foregroundPermission: types.permission, backgroundPermission: types.permission, source: v.union(v.literal('FOREGROUND'), v.literal('BACKGROUND')),
    admittedAt: v.optional(v.number()), revision: v.number(),
  }).index('by_user', ['userId']).index('by_country_observedAt', ['countryStatus', 'observedAt']),
  geometries: defineTable({ area: types.geometry, source: v.string(), sourceAccuracyM: v.union(v.number(), v.null()), version: v.number(), geometryHash: v.string() }).index('by_hash', ['geometryHash']),
  incidents: defineTable({
    hazard: types.hazard, locality: v.string(), geometryId: v.id('geometries'), provenance: types.provenance,
    verification: types.verification, lifecycle: types.lifecycle, qualification: v.union(types.qualification, v.null()), assessmentStatus: types.assessmentStatus,
    severity: types.severity, recentWitnesses: v.number(), totalWitnesses: v.number(), lastObservedAt: v.number(), staleAt: v.number(),
    revision: v.number(), evidenceGeneration: v.number(), controlRevision: v.number(), nextAssessmentAt: v.number(), audience: types.audience,
    mergedInto: v.optional(v.id('incidents')),
    authorityAgencyId: v.optional(v.id('agencies')),
  }).index('by_lifecycle_nextAssessmentAt', ['lifecycle', 'nextAssessmentAt']).index('by_hazard_lastObservedAt', ['hazard', 'lastObservedAt']).index('by_mergedInto', ['mergedInto']),
  observations: defineTable({
    incidentId: v.id('incidents'), authorId: v.optional(v.id('users')), alias: v.string(), capturedPoint: types.point,
    fixObservedAt: v.number(), accuracyM: v.number(), observedAt: v.number(), receivedAt: v.number(), description: v.string(),
    status: v.union(v.literal('ACTIVE'), v.literal('WITHDRAWN'), v.literal('REMOVED')), revision: v.number(), lastContributionAt: v.number(), provenance: types.provenance,
  }).index('by_incident_author', ['incidentId', 'authorId']).index('by_incident_status_observedAt', ['incidentId', 'status', 'observedAt']).index('by_author_receivedAt', ['authorId', 'receivedAt']),
  // Legacy rows are retained for migration only; incident submissions never read/write this table.
  postingRates: defineTable({ userId: v.id('users'), kind: v.literal('NEW_INCIDENT'), createdAt: v.number() }).index('by_user_kind_at', ['userId', 'kind', 'createdAt']),
  observationOrigins: defineTable({ incidentId: v.id('incidents'), observationId: v.id('observations'), cell: v.string(), point: types.point, accuracyM: v.number(), observedAt: v.number(), active: v.boolean() }).index('by_incident_cell', ['incidentId', 'cell']).index('by_observation', ['observationId']),
  geoPoints: defineTable({
    kind: v.union(v.literal('USER'), v.literal('INCIDENT'), v.literal('SHELTER'), v.literal('CHAT')),
    entityId: v.string(), precision: v.number(), cell: v.string(), point: types.point, active: v.boolean(), observedAt: v.optional(v.number()),
  }).index('by_kind_precision_cell_active', ['kind', 'precision', 'cell', 'active']).index('by_kind_entity', ['kind', 'entityId']),
  areaCoverage: defineTable({
    geometryId: v.id('geometries'), precision: v.number(), cell: v.string(), entityKind: v.string(), entityId: v.string(), revision: v.number(), generation: v.number(), active: v.boolean(),
  }).index('by_precision_cell_kind', ['precision', 'cell', 'entityKind']).index('by_entity_generation', ['entityId', 'generation']).index('by_entity_generation_cell', ['entityId', 'generation', 'cell']),
  authorityDeclarations: defineTable({
    incidentId: v.id('incidents'), membershipId: v.id('authorityMemberships'), agencyId: v.id('agencies'), geometryId: v.id('geometries'),
    severity: types.severity, instructionVersionId: v.optional(v.id('instructionVersions')), reviewDueAt: v.number(), active: v.boolean(),
    endedAt: v.optional(v.number()), endReason: v.optional(v.string()), revision: v.number(), audience: types.audience,
  }).index('by_incident_active', ['incidentId', 'active']).index('by_active_reviewDueAt', ['active', 'reviewDueAt']),
  instructionVersions: defineTable({
    declarationId: v.id('authorityDeclarations'), revision: v.number(), originalText: v.string(), sourceLanguage: types.language, originalHash: v.string(),
    actionKind: types.actionKind, namedShelterId: v.optional(v.id('shelters')), issuedAt: v.number(), deadlineAt: v.optional(v.number()),
  }).index('by_declaration_revision', ['declarationId', 'revision']),
  alerts: defineTable({ incidentId: v.id('incidents'), lifecycle: v.union(v.literal('ACTIVE'), v.literal('ENDED')), currentRevision: v.number(), createdAt: v.number(), updatedAt: v.number(), audience: types.audience }).index('by_incident', ['incidentId']).index('by_lifecycle', ['lifecycle']),
  alertSources: defineTable({
    alertId: v.id('alerts'), kind: types.provenance, declarationId: v.optional(v.id('authorityDeclarations')), instructionVersionId: v.optional(v.id('instructionVersions')),
    geometryId: v.id('geometries'), severity: types.severity, agencyId: v.optional(v.id('agencies')), issuerLabel: v.string(), active: v.boolean(),
    sourceRevision: v.number(), endedAt: v.optional(v.number()), endReason: v.optional(v.string()), audience: types.audience,
  }).index('by_alert_active', ['alertId', 'active']).index('by_declaration', ['declarationId']).index('by_active', ['active']),
  alertRevisions: defineTable({
    alertId: v.id('alerts'), revision: v.number(), sources: v.array(v.object({ sourceId: v.id('alertSources'), geometryId: v.id('geometries'), instructionVersionId: v.optional(v.id('instructionVersions')), severity: types.severity, issuerLabel: v.string(), active: v.boolean() })),
    severity: types.severity, materialReason: v.union(v.literal('FIRST'), v.literal('INSTRUCTION'), v.literal('SEVERITY'), v.literal('AREA'), v.literal('SOURCE'), v.literal('ENDING'), v.literal('CORRECTION'), v.literal('REFRESH')),
    urgency: v.union(v.literal('FIRST'), v.literal('MATERIAL'), v.literal('SILENT')), criticalInstruction: v.boolean(), publishedAt: v.number(), policyVersion: v.string(),
  }).index('by_alert_revision', ['alertId', 'revision']),
  exposures: defineTable({
    userId: v.id('users'), incidentId: v.id('incidents'), alertId: v.id('alerts'), relevant: v.boolean(), proximityKind: v.union(v.literal('INSIDE'), v.literal('POSSIBLE_PROXIMITY')),
    locationRevision: v.number(), lastEnteredAt: v.number(), leftAt: v.optional(v.number()), soundEpoch: v.number(), lastSoundAt: v.optional(v.number()),
    dismissedRevision: v.number(), latestSeenRevision: v.number(), appliedRevision: v.number(),
  }).index('by_user_relevant', ['userId', 'relevant']).index('by_user_incident', ['userId', 'incidentId']),
  userAlerts: defineTable({
    userId: v.id('users'), alertId: v.id('alerts'), revision: v.number(), eligibilityReason: v.string(), locationAgeMs: v.number(), accuracyM: v.number(),
    firstRelevantAt: v.number(), shouldSound: v.boolean(), soundEpoch: v.number(), openedAt: v.optional(v.number()), endedAt: v.optional(v.number()),
  }).index('by_user_createdAt', ['userId', 'firstRelevantAt']).index('by_user_alert_revision', ['userId', 'alertId', 'revision']),
  jobs: defineTable({
    kind: v.union(v.literal('ALERT_EXPANSION'), v.literal('LOCATION_EXPOSURE')), key: v.string(), status: v.union(v.literal('PENDING'), v.literal('DONE'), v.literal('SUPERSEDED'), v.literal('FAILED')),
    dueAt: v.number(), createdAt: v.number(), alertId: v.optional(v.id('alerts')), alertRevision: v.optional(v.number()), geometryId: v.optional(v.id('geometries')),
    userId: v.optional(v.id('users')), locationRevision: v.optional(v.number()), cells: v.array(v.string()), cellIndex: v.number(), childIndex: v.number(), cursor: v.union(v.string(), v.null()), checkpoint: v.number(),
    lastErrorCode: v.optional(v.string()),
  }).index('by_key', ['key']).index('by_status_dueAt', ['status', 'dueAt']),
  devices: defineTable({
    userId: v.id('users'), installationId: v.string(), registrationHash: v.string(), expoPushToken: v.optional(v.string()),
    platform: v.union(v.literal('ios'), v.literal('android')), permission: types.permission, active: v.boolean(), revision: v.number(), lastRegisteredAt: v.number(),
  }).index('by_installation', ['installationId']).index('by_user_active', ['userId', 'active']).index('by_token', ['expoPushToken']),
  deliveryJobs: defineTable({
    userId: v.id('users'), deviceId: v.id('devices'), alertId: v.id('alerts'), revision: v.number(), kind: v.union(v.literal('FIRST'), v.literal('UPDATE'), v.literal('ENDING')),
    soundEpoch: v.number(), shouldSound: v.boolean(), key: v.string(), status: v.union(v.literal('PENDING'), v.literal('SENDING'), v.literal('ACCEPTED'), v.literal('FAILED'), v.literal('SUPERSEDED')),
    createdAt: v.number(), dueAt: v.number(), expiresAt: v.number(), attempt: v.number(), deviceRevision: v.number(),
  }).index('by_key', ['key']).index('by_status_dueAt', ['status', 'dueAt']),
  shelters: defineTable({
    agencyId: v.id('agencies'), jurisdictionId: v.id('jurisdictions'), name: v.string(), point: types.point, address: v.string(), status: types.shelterStatus,
    statusConfirmedAt: v.number(), capacity: v.union(v.number(), v.null()), remaining: v.union(v.number(), v.null()), accessibility: types.accessibility,
    facilities: v.array(v.string()), phone: v.string(), accessInstruction: v.string(), accessRestricted: v.boolean(), revision: v.number(),
    archivedAt: v.optional(v.number()), audience: types.audience,
  }).index('by_jurisdiction_status', ['jurisdictionId', 'status']).index('by_audience_archivedAt', ['audience', 'archivedAt']).index('by_statusConfirmedAt', ['statusConfirmedAt']),
  contacts: defineTable({
    agencyId: v.id('agencies'), jurisdictionId: v.id('jurisdictions'), name: v.string(), purpose: v.string(), phone: v.string(), source: v.string(),
    level: v.union(v.literal('LOCAL'), v.literal('STATE'), v.literal('NATIONAL')), confirmedAt: v.number(), revision: v.number(), archivedAt: v.optional(v.number()), audience: types.audience,
  }).index('by_jurisdiction_level', ['jurisdictionId', 'level']).index('by_audience_archivedAt', ['audience', 'archivedAt']),
  commandKeys: defineTable({
    userId: v.id('users'), commandKind: v.string(), clientRequestId: v.string(), payloadHash: v.string(), result: v.any(), createdAt: v.number(),
  }).index('by_user_kind_key', ['userId', 'commandKind', 'clientRequestId']),
  auditEvents: defineTable({ actorId: v.optional(v.id('users')), actorKind: v.string(), objectKind: v.string(), objectId: v.string(), revision: v.number(), action: v.string(), reason: v.string(), createdAt: v.number() }).index('by_object_createdAt', ['objectId', 'createdAt']),
});
