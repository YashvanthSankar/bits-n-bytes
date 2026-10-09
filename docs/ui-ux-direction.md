# Tovrilo — map-first native UI/UX contract

**Controlling scope:** [final user requirements](product-requirements.md) and [implementation plan](winning-strategy.md). This supersedes the old Briefings/Saved navigation. Design instructions, not rendered or verified UI.

## Direction

Calm, precise, mobile-native wayfinding. The map is the working surface, not a decorative hero. No AI chatbot, editorial layout, oversized slogan, purple gradient, glass-card grid, dashboard metrics, emoji navigation, fake trust percentage or “safe” green map. Brand: **Tovrilo — Local alerts. Your language.**

Loaded guidance: product-engineering, Expo overview/design-system/native-ui/UI/router/animation/data-fetching, Vercel React Native guidance and web interface guidelines. SDK-specific APIs still need checking against the pinned project; loaded skills are not evidence that an app works. Resolve style guidance into one consistent token system rather than two competing themes.

## Visual system

- One theme entry point, system sans typography, tabular numerals for times/distances, 4-point spacing scale and consistent 20-unit content inset where appropriate.
- Platform semantic backgrounds/text/separators with explicit light/dark brand accent pairs. Starting brand references: warm near-white `#F6F7F4`, ink `#182321`, secondary `#53615C`, cobalt `#244BC4`. These are direction, not certified contrast combinations.
- Severity uses text + icon + zone pattern, never color alone. Reserve warning/destructive color for meaningful status, not all page furniture.
- Hairline rows and grouped sections rather than every item in a rounded shadow card. Shadows only when overlay depth needs explanation.
- Native headers, tabs, back behavior, menus and sheets; inspect `@expo/ui` availability for the actual SDK before picking controls. Virtualized feeds use FlatList/FlashList, not a native grouped-settings List.
- SF Symbols on iOS and corresponding Material/vector icons on Android. Shared semantics, platform-fit chrome.
- Minimum 48-unit interactive target; meaningful pressed state. Motion explains navigation/state, never delays an alert. Reduced motion supported; no animated tab slides or ceremonial screen entrances.

## Navigation

Tourist destinations: **Map · Alerts · Profile**. Home opens Map after onboarding. Incident, original notice/translation and shelter detail are sheets or stack screens. Bottom-center **Report incident** floats above map/tab safe areas; it is an action, not a fourth tab.

Authority mode: operational map, incidents/review, shelters/contacts and account. Mode reflects a server-approved role; an arbitrary role picker cannot unlock authority. Shared primitives, not a disconnected dashboard theme.

## Screens and primary journeys

### 1. Login and pre-arrival onboarding

Tourist signup/login and clearly separate **Authority sign in**. Authority copy explains approved accounts only; no self-verified signup. Restore persisted auth before routing or handling a deep link.

Tourist steps: choose preferred language → destination subscription → explain/request foreground location → explain optional background access → notification permission. Keep each short. Manual destination selection works if permissions are denied. Explain that current home location differs from the trip destination. Never trap users in repeated permission prompts.

### 2. Live map — main page

Full-bleed map with native contextual header (destination selector), hazard zones, shelter markers, recenter and an accessible list alternative. Map controls respect top/bottom safe areas and the Report action.

Keep a compact freshness/location strip: connection state, last successful update and last location age when relevant. Legend explicitly distinguishes **Authority-issued**, **Community-confirmed**, approximate radius and shelter status. Unverified community reports are not displayed as confirmed public hazards. Do not paint unknown areas green.

Selecting a zone opens its attributed detail. Selecting a shelter opens name/status/source age/distance/contact. Zones must remain readable over the chosen basemap at both themes. If tiles fail, saved incident/shelter list remains usable. Empty copy: “No published incidents for this area. This does not mean conditions are safe.”

### 3. Report incident

Native sheet/full-height form with phenomenon buttons, selected state, location pin/manual position, observed time and optional short description. No social-post composer or panic illustration. Make the label **Report incident** discoverable with one tap from home.

Confirmation explains “Your report is unverified and will not alert others until confirmed.” Submission is pending until server acknowledgment. Disable double-submit, preserve draft on failure and expose retry. Offline copy says **Draft — not submitted**. Never show a success toast instead of persisted submission.

### 4. Alerts inbox and incident detail

Dense readable rows: phenomenon/title, provenance, confirmation/lifecycle, area, issuer/source and issued time. Updates/withdrawals visibly reference earlier notices; neither stale history nor cancelled instructions looks like the current action.

Detail hierarchy: current lifecycle warning → official or community attribution → current original/translated instruction → issued/effective/expiry and fetch metadata → nearest eligible listed shelter CTA → source and evidence summary. Evidence summarizes report recency/weather/news and model uncertainty without reporter PII or fake authority seals.

Translation and original are accessible on the same screen (stacked on phones; side-by-side on wide layout when useful). Label language/translation origin; no “accuracy verified” badge based only on entity checks. Missing translation displays original plus clear fallback. Withdrawn instructions remain readable as history, not rendered illegibly under strike-through.

### 5. Shelter detail

Name, status, issuer, last-confirmed time, approximate distance from timestamped location, accessibility/capacity if known and contact. Copy: “Closest listed shelter — route safety not verified.” **Call contact** and optional external directions; no fake “Navigate safely.” No eligible shelter yields an honest contact fallback.

### 6. Authority publishing and review

Publish form: phenomenon, zone/radius, observed/issued/validity times, original instructions, jurisdiction and source. Explain the consequence: “Publishing sends alerts to eligible users.” Consequential confirmation is appropriate; successful publish must actually persist and enqueue delivery.

Review screen separates community evidence from official publication, shows recent unique reporter count, timestamps, weather/news provenance and model result/error. Accept/reject/correct actions are authorized, versioned and auditable. Shelter/contact forms preserve failed drafts and show saved state only after acknowledgment.

### 7. Profile and preferences

Language, trip destination, location sharing/background permissions, notification status, saved-data age, privacy controls and signout. Settings must affect real behavior. No irrelevant account statistics or decorative profile badges.

## Required states

Design loading, error, empty, content and cached/offline independently. Cached content survives a failed refresh; last-success time does not advance. Include denied location/notifications, stale location, unavailable model/weather/news, disputed incident, expired/withdrawn alert, missing translation, no eligible shelter, storage failure and unsent draft states. Inline errors belong near the action; no toast-only critical information.

Notifications use the chosen language and issuer/area context, without exact tourist coordinates. Opening one navigates to the referenced current incident version; expired/withdrawn links do not revive old actions.

## Quality gates before calling a screen complete

1. Walk primary task + failure/recovery on iOS and Android; save, call, recenter, filters and settings genuinely work.
2. Screen reader labels and logical focus; accessible hazard/shelter list so map manipulation is not compulsory.
3. 200% system text without missing actions, contrast measured, color-independent status, long translated strings tested.
4. Keyboard never covers report/publish controls; native back/dismiss preserves drafts appropriately.
5. Safe areas and Report button work on small screens and gesture-navigation devices; light/dark and reduced motion checked.
6. Screenshot actual loading/content/offline/withdrawal/report/shelter states; release-device testing required for gesture/performance/background/push claims.

## Web landing

Concise mobile-friendly product page: name, real screenshot when available, short use case, actual install/access instructions, source/safety limitations and privacy summary. No fictional store badges, agency logos, download counts, testimonials or mock “live” map. Pending artifacts are labeled pending. Review against fresh web interface guidelines before deployment.
