# GudTour — native UI/UX contract

Updated 2026-10-10. PLAN.md is the core behavior specification. tech-stack.md and TECHNICAL_IMPLEMENTATION_PLAN.md control the selected integrations and online-first override. This document describes implementation intent; screenshots and device evidence must prove the resulting UI.

## Direction and visual system

Calm, precise, mobile-native crisis communication. The map is the primary working surface. Use system typography, semantic light/dark colors, 4-point spacing, 20-unit content insets, separators and grouped rows. Status must use words and a pattern/icon alongside color. Never paint unknown areas green, invent trust percentages, display fake agency seals or imply a route is safe. Brand: **GudTour — Local alerts. Your language.**

Use native stack/back behavior, sheets and tabs with safe areas. Interactive targets are at least 48 units. Text scales with the operating system. Primary onboarding actions stay in a footer above the bottom safe area; language/content lists scroll independently. The footer participates in layout rather than overlapping or covering list rows. Use keyboard avoidance for forms, readable wrapping labels and one dominant primary action; secondary navigation/sign-out has lower emphasis. Motion explains changes and respects reduced motion. Every critical error remains visible beside the affected action.

## Entry and navigation

Entry: choose en/hi/ta/fr/de/es → explain/request foreground location → validate a fresh, accurate fix wholly inside India's country polygon → Google sign-in → consent-based profile. Denied, disabled, stale, inaccurate, outside-India and uncertain-boundary outcomes each explain recovery. No manual destination or pin bypasses country admission. Notifications and background location are optional requests after the core app is usable; denied permissions do not loop prompts.

Tourist destinations: **Map · Incidents · Shelters · Nearby chat · Settings**, represented by familiar **icons only** in the floating frosted bottom bar (user update 2026-10-10). Retain accessibility labels, selected-state semantics and at least 48-unit targets. Native background blur uses an explicit content target on Android; older Android and iOS Reduce Transparency use readable opaque fallbacks. Alert history and emergency contacts are reachable from the app. Report incident is a prominent bottom-center action on the map, not a tab. Approved authority mode adds incident review/publishing, shelters/contacts and moderation; a client role picker never grants access.

## Main map and incident reporting

After onboarding, open the full-screen map directly, with a compact welcome/current-location panel and quick actions; avoid a separate welcome detour. Report incident floats above the navbar without overlap. Preserve map attribution and legal controls with measured overlay padding. Render Apple basemap on iOS and Google basemap on Android. Show actual hazard geography, dashed unverified community zones and attributed shelters; provide a usable list alternative. Map camera movement never updates the tourist's location or notification eligibility. The compact freshness strip exposes stale location, disconnected data and source age. Empty areas say that no listed incidents does not establish safety.

Incident detail separates verification, activity and emergency qualification. Authority verification is not an emergency declaration; model qualification is not authority verification. Show phenomenon, source/issuer, locality, original observed time, recent independent witness count and evidence availability. A failed provider call is unavailable evidence, never a negative or all-clear.

Reporting uses eight phenomenon choices, a timestamped device location, observed time and bounded optional description. Any permitted adjustment must retain location eligibility checks. Submit is pending until server acknowledgment; double taps share a command key. Preserve failed drafts with explicit resend. Offline drafts say **not submitted** and never post automatically. Updating an observation does not create another independent witness.

## Emergency alerts and translation

Foreground eligible emergencies show a full-screen overlay with brief sound/vibration. Background push is best effort; the app cannot guarantee delivery or override Do Not Disturb. Seen/acknowledged means seen, not safe or resolved. Material changes follow cooldown and Critical-exception rules; routine updates, language changes, short re-entry and endings are silent.

Hierarchy: current activity and attribution → preferred-language instruction → original official notice and issuing authority → effective time/deadline/prohibitions → applicable authority guidance or eligible shelter CTA → source/evidence freshness. Original text stays readable with the translation. Translation failure shows the original plus a fallback label; automated entity checks do not establish perfect translation.

Source withdrawals and endings remain attached to the source they affect. Expiry, disappearance from a feed or model failure never becomes an all-clear. Opening an old alert resolves its current incident version and visibly labels history.

## Shelters and contacts

Show current status, issuing authority, last confirmation, approximate distance and location age, contact, capacity and step-free status when known. Only eligible shelters appear in the nearest recommendation: current/open, within 50 km, not full, accessibility eligible, and outside active hazard geometry unless a recorded authority override applies. Stay-put or named-shelter authority instructions take precedence.

Copy: **Closest eligible listed shelter — route safety not verified.** External Google Maps directions, copy-location and dialer actions are real platform operations, not claimed rescue dispatch. No eligible shelter shows the contact fallback and reason rather than an invented recommendation.

## Nearby chat and settings

Nearby chat uses a fixed private GPS origin and 15 km radius, fresh location, plain text and bounded structured incident links. Chat messages and structured incident links never count as corroborating observations. Display loading, empty, disconnected, location-ineligible, restricted, removed-message and appeal states. Moderation is authorized and records a reason.

Settings expose preferred language, accessibility preference, foreground/background and notification status, private location freshness, sign-out and account deletion. No trip-destination subscription or decorative statistics. Explain data retention and accurately show when background sharing is unavailable. Deletion clears private local state and anonymizes retained public evidence.

## Authority workflows

Publishing captures phenomenon, jurisdiction-bound geometry, times, severity, original instructions and protection/evacuation guidance. Explain the notification consequence before confirmation. A successful response means the canonical publication and durable targeting job committed; it does not mean all phones received alerts. Verify and declare-emergency actions are separate, versioned and auditable. Failed forms preserve drafts.

Review shows independent witness recency, weather freshness, SACHET attribution and typed model result/error. Shelter/contact editing confirms real saves and handles revision conflicts. Authorities cannot inspect private tourist locations or identities through operational lists.

## Required quality evidence

For each primary screen, verify content/loading/error/empty and cached/offline states on both native platforms. Check screen-reader labels/focus, 200% text, long translations, light/dark contrast, reduced motion, keyboard avoidance, small-screen safe areas and native back behavior. Test real permissions and recovery. Save actual screenshots; simulator compilation alone is not push/background or release-device evidence.

## Public landing

A concise static page links only real Android release artifacts and an actually available iOS distribution option. Include current screenshots, installation instructions, privacy and source limitations. Pending artifacts remain labeled pending. No fictional store badges, agency logos, download counts, testimonials or simulated data presented as live.
