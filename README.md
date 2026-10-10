# GudTour

**Local alerts. Your language.**

TravelTech project for the Bits and Bytes CS Week hackathon: a map-first crisis-communication app for tourists during extreme weather.

## The product

- Tourist and approved-authority login; India-only language/profile onboarding with mandatory foreground location and consent-based location updates.
- Live hazard/shelter map with a bottom-center **Report incident** action.
- Unverified tourist reports evaluated using recent independent reports, AccuWeather, SACHET and an automatic Jev 1.13 decision gate through OpenCode Zen; no immediate rumor broadcast.
- Approved authorities can declare emergencies immediately; declarations publish without waiting for Jev. Full general verification/review controls remain unfinished.
- Radius-targeted multilingual notifications, per-user raw nearest listed shelter; emergency contact maintenance is deferred.
- Original official notice alongside version-bound translations preserving critical instructions.

**Platforms:** Android + iOS via Expo; public web landing page. No macOS or full web crisis app.

## Status and setup

**Current testing snapshot:** core tourist reporting, authority declarations/shelters, realtime in-app alerts, translations, SACHET browsing and Jev decision/context review are implemented.259 tests / 42 files, strictTypeScript/lint, Expo Doctor 21/21 and local Android release build pass. Development Convex is `basic-newt-690`; production is `jovial-eagle-875`. iOS simulator uses development.

Android rc.1 is public but has a reported map initialization crash. Local rc.2(versionCode 4) includes the readiness fix and is verified as an artifact; physical retesting remains pending. **rc.2 GitHub upload was stopped by the user and is not published.** Nearby chat, full incident/authority management, provider decision evaluation, recovery/privacy and physical iOS delivery remain incomplete. See [current state and remaining work](docs/current-state.md) and [TODO](TODO.md).

For local development, install dependencies with `npm ci`, copy `.env.example` to private `.env.local`, and configure a development deployment with `npx convex dev`. Existing team members should select the Denoise Labs GudTour project. Run `npm run start`, then `npm run ios` or `npm run android` with a configured native device. `npm run check` runs typechecking, lint and domain tests. Expo Go runtime OAuth callbacks are supported where explicitly allowlisted; installed builds use the native callback. Native release testing remains necessary. Alerts are foreground in-app only; closed-app push is deferred. Provider secrets belong on Convex, never in the public client environment.

## Documentation

Start with the [detailed technical implementation plan](TECHNICAL_IMPLEMENTATION_PLAN.md), [PLAN.md](PLAN.md), the latest [technical stack](tech-stack.md), and the [ordered implementation TODOs](TODO.md). User updates select Convex, Google OAuth, platform-native maps, AccuWeather, SACHET/Jev through OpenCode Zen, Google Cloud Translation, no news, and online-first operation. These supersede conflicting pre-arrival, Supabase, news, and full-offline proposals in older documents.

The [architecture entry point](docs/architecture.md) maps the core product to the engineering sections. [Current progress](docs/progress/2026-10-10-technical-plan-and-migration.md) records completed planning, provider access evidence and repository migration.

1. [Final user requirements](docs/product-requirements.md) — preserved source request.
2. [Implementation plan](docs/winning-strategy.md) — historical strategy; the detailed technical plan and latest user decisions take precedence.
3. [UI/UX contract](docs/ui-ux-direction.md) — premium native map-first experience, not generic AI UI.
4. [Organizer brief](docs/hackathon-brief.md) — official supplied rules and full scoring rubric.
5. [Evidence checklist](docs/judging-evidence.md) and [execution policy](docs/agent-execution-policy.md).
6. [Documentation index](docs/README.md) — research and superseded plans.

## Safety and honesty

Authority verification identifies the issuer; it does not guarantee conditions are safe. Community/model confirmation is not government verification. Notifications/background location are best-effort. Nearest listed shelter is not a verified safe route. Always show source, timestamps, uncertainty and original instructions; label simulated data.

GudTour is the selected project name. No brand-availability or legal-clearance claim is made.

## Repository conventions

Keep secrets in local environment configuration, never source or `EXPO_PUBLIC_*`. `.gitignore` excludes secrets, dependencies, caches and generated builds. Project skill definitions and `skills-lock.json` are versioned for reproducible agent guidance. API/library/model disclosures and the required real 2–5 minute video must be added when they exist; no integration is claimed merely because it appears in this plan.
