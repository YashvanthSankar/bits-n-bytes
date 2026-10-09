# GudTour

**Local alerts. Your language.**

TravelTech project for the Bits and Bytes CS Week hackathon: a map-first crisis-communication app for tourists during extreme weather.

## The product

- Tourist and approved-authority login; India-only language/profile onboarding with mandatory foreground location and consent-based location updates.
- Live hazard/shelter map with a bottom-center **Report incident** action.
- Unverified tourist reports evaluated using recent independent reports, AccuWeather, SACHET and an automatic Jev 1.13 decision gate through OpenCode Zen; no immediate rumor broadcast.
- Approved authorities verify incidents and can declare emergencies immediately; emergency declarations publish without waiting for Jev.
- Radius-targeted multilingual notifications, per-user nearest eligible listed shelter and authority-maintained contacts.
- Original official notice alongside version-bound translations preserving critical instructions.

**Platforms:** Android + iOS via Expo; public web landing page. No macOS or full web crisis app.

## Status and setup

**Planning only.** There is no application source, package manifest, runnable setup, backend, APK, iOS artifact, deployed landing page or demo video yet. Do not treat proposed behavior as implemented. A live OpenCode Zen Jev connectivity test passed; decision quality and app workflows remain unverified. Setup commands and real release links will be added after implementation and verification during the permitted window.

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
