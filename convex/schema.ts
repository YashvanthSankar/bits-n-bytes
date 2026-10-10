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
  }).index('by_lifecycle_nextAssessmentAt', ['lifecycle', 'nextAssessmentAt']).index('by_hazard_lastObservedAt', ['hazard', 'lastObservedAt']).index('by_mergedInto', ['mergedInto']),
  observations: defineTable({
    incidentId: v.id('incidents'), authorId: v.optional(v.id('users')), alias: v.string(), capturedPoint: types.point,
    fixObservedAt: v.number(), accuracyM: v.number(), observedAt: v.number(), receivedAt: v.number(), description: v.string(),
    status: v.union(v.literal('ACTIVE'), v.literal('WITHDRAWN'), v.literal('REMOVED')), revision: v.number(), lastContributionAt: v.number(), provenance: types.provenance,
  }).index('by_incident_author', ['incidentId', 'authorId']).index('by_incident_status_observedAt', ['incidentId', 'status', 'observedAt']).index('by_author_receivedAt', ['authorId', 'receivedAt']),
  geoPoints: defineTable({
    kind: v.union(v.literal('USER'), v.literal('INCIDENT'), v.literal('SHELTER'), v.literal('CHAT')),
    entityId: v.string(), precision: v.number(), cell: v.string(), point: types.point, active: v.boolean(), observedAt: v.optional(v.number()),
  }).index('by_kind_precision_cell_active', ['kind', 'precision', 'cell', 'active']).index('by_kind_entity', ['kind', 'entityId']),
  areaCoverage: defineTable({
    geometryId: v.id('geometries'), precision: v.number(), cell: v.string(), entityKind: v.string(), entityId: v.string(), revision: v.number(), generation: v.number(), active: v.boolean(),
  }).index('by_precision_cell_kind', ['precision', 'cell', 'entityKind']).index('by_entity_generation', ['entityId', 'generation']),
  commandKeys: defineTable({
    userId: v.id('users'), commandKind: v.string(), clientRequestId: v.string(), payloadHash: v.string(), result: v.any(), createdAt: v.number(),
  }).index('by_user_kind_key', ['userId', 'commandKind', 'clientRequestId']),
  auditEvents: defineTable({ actorId: v.optional(v.id('users')), actorKind: v.string(), objectKind: v.string(), objectId: v.string(), revision: v.number(), action: v.string(), reason: v.string(), createdAt: v.number() }).index('by_object_createdAt', ['objectId', 'createdAt']),
});
