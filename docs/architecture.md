# GudTour — architecture entry point

Updated: 2026-10-10. Application development authorized; current implementation and release evidence is in [current-state.md](current-state.md).

Read [docs/README.md](README.md), [PLAN.md](../PLAN.md), [tech-stack.md](../tech-stack.md), [TECHNICAL_IMPLEMENTATION_PLAN.md](../TECHNICAL_IMPLEMENTATION_PLAN.md) and [TODO.md](../TODO.md) before implementing. PLAN.md is the core product behavior specification. The latest explicit online-first/no-news/provider decisions override only the conflicting portions described in its banner; the technical design must not silently reduce its core workflows.

## Core product to preserve

- Tourists report hazards; their reports remain visibly unverified until sufficiently recent, independent, locally relevant evidence supports qualification. Jev qualification is not government verification.
- Approved jurisdiction-bound authorities can verify incidents, publish emergencies immediately, and maintain shelters and contacts. Verification and emergency declaration are separate operations.
- Convex builds evidence from observations, AccuWeather, SACHET and retained incident history. Jev 1.13 through OpenCode Zen evaluates bounded questions; backend rules apply the accepted result.
- Actual source geography and recent eligible tourist location determine alert relevance. Model confidence does not determine the user's position or replace geographic checks.
- Preferred-language alerts preserve original official instructions, issuer, critical place names, severity, deadlines and prohibited actions. Failed translation retains the original.
- Applicable authority instructions precede generic raw nearest listed shelter guidance. No route or capacity guarantee is implied.
- Native Android/iOS map and list views, nearby chat/moderation, profile/privacy, honest freshness and online recovery remain part of the requested product.

## Technical boundaries

Expo owns native presentation, location/notification permissions and private session storage. Convex owns identity authorization, canonical data, versioned state changes and durable jobs. Actions call providers; mutations apply validated results only if evidence/control revisions still match. Public DTOs exclude private profiles, witness origins and device tokens.

Selected model gateway: OpenCode Zen `/zen/v1/systemone`, model `jev-1.13`, server-only `OPENCODE_API_KEY`. Two-stage Choice integration and durable qualification/publication workers are deployed; held-out decision quality/calibration remains pending. Score is not used. Periodic reassessment is hourly, while observations queue immediately. OpenAI is not an active dependency. Basemaps are Apple on iOS and Google on Android; downloaded basemaps and automatic offline posting are deferred by user instruction.

## Detailed design map

| Implementation concern | Technical plan sections |
| --- | --- |
| Architecture, repository, invariants and policies | 1–5 |
| Schema/indexes, authorization, geography and APIs | 6–9 |
| Incident lifecycle, SACHET, weather and Jev | 10–13 |
| Publication, targeting, shelters, translations and delivery | 14–17 |
| Mobile, permissions, chat and online recovery | 18–20 |
| Scheduling, retention, secrets, budgets and deployment | 21–22 |
| Failure handling, verification, build gates and inputs | 23–26 |

The TODO file assigns acceptance checks and dependencies to proposed team owners. Older strategy/research documents remain historical input. Follow [agent-execution-policy.md](agent-execution-policy.md) and the user authorized application coding on 2026-10-10. GitHub remote and local progress are recorded in [the dated progress note](progress/2026-10-10-technical-plan-and-migration.md).


Current checkpoint: reporting, declaration/endings, shelters, targeting/foreground alerts, SACHET/weather/evidence/Jev workers and source/context review are implemented. Chat, full incident/authority review controls, source urgent interpretation, recovery/privacy and full device acceptance remain unfinished.259 tests / 42 files and local production APK build pass. rc.2 map readiness fix awaits physical retest; GitHub upload is stopped by user. Read [current state](current-state.md) and [TODO](../TODO.md) before interpreting historical notes.
