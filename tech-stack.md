# GudTour — technical stack

Updated: 2026-10-10. Status: planning complete; application implementation/deployment pending. OpenCode Zen Jev connectivity smoke test passed; other integrations and decision quality remain unverified.

## 1. Decisions and precedence

The latest user decisions select Expo for Android/iOS, Convex for the backend, Google OAuth, Apple Maps on iOS, Google Maps on Android, AccuWeather, NDMA SACHET CAP/RSS, TypeSafe.ai Jev through OpenCode Zen, and Google Cloud Translation. News collection is removed. The product is primarily online; downloaded basemaps and the comprehensive offline workflows in the original PLAN.md are deferred.

Read [TECHNICAL_IMPLEMENTATION_PLAN.md](TECHNICAL_IMPLEMENTATION_PLAN.md) for the detailed engineering design and [TODO.md](TODO.md) for implementation order. Use PLAN.md for the detailed product behavior, with these explicit overrides. Older documents describing Supabase, destination subscriptions, optional foreground permission, human approval of Jev escalation, or unresolved Jev/languages do not override the latest plan. GudTour is the selected project name throughout this repository.

## 2. Stack at a glance

| Layer | Selected technology | Responsibility |
| --- | --- | --- |
| Mobile | Expo + React Native + TypeScript | One codebase for Android and iOS |
| Navigation | Expo Router | Tourist tabs, authority routes, sheets, notification deep links |
| Authentication | Convex Auth with Google OAuth | Google identity, app sessions, secure mobile redirect |
| Authorization | Convex queries/mutations | Ownership, approved authority accounts, jurisdiction enforcement |
| Database and live state | Convex | Durable domain records and reactive subscriptions |
| Background server work | Convex actions, cron jobs, scheduled functions | Feed ingestion, weather/translation/Jev calls, targeting, delivery retries |
| Map UI | react-native-maps | Apple Maps on iOS; Google Maps on Android; markers and hazard geometry |
| Location | expo-location + expo-task-manager | Foreground fixes and optional background updates |
| Notifications | expo-notifications + Expo Push Service | Device registration, foreground handling, APNs/FCM delivery |
| Official disaster data | NDMA SACHET published CAP/RSS feeds | Attributed warnings, geography, revisions and cancellations |
| Weather evidence | AccuWeather Core Weather API | Geoposition/location key, current conditions, past 24-hour conditions |
| Decision model | TypeSafe.ai Jev 1.13 via OpenCode Zen | Bounded typed evidence judgments and emergency qualification |
| Dynamic translation | Google Cloud Translation API | Version-bound translated authority instructions and notices |
| Static UI languages | i18next + react-i18next + expo-localization | Reviewed local resources for en, hi, ta, fr, de, es |
| Device session storage | expo-secure-store | Session material; clear on sign-out |
| Cached public content | expo-sqlite | Last successful emergency/incident/shelter/contact snapshot |
| Network state | @react-native-community/netinfo | Disconnection/reconnection and honest stale UI |
| Geometry helpers | Turf modules + geographic cell indexes | Boundary checks, geodesic distance, polygon/uncertainty overlap |
| Builds | EAS Build / local native development builds | Standalone Android and signed iOS artifacts |
| Verification | Domain tests, convex-test, React Native Testing Library, device checks | Policy, authorization, interactions, actual push/background behavior |
| Public landing | Static page; host selected at release checkpoint | Real download/access links and product/privacy summary |

Package names beyond the user's selected services are implementation choices. Pin compatible versions against the chosen stable Expo SDK when implementation starts; no dependencies are installed by this document. Prefer react-native-maps for the established cross-platform overlay interface; evaluate native compatibility in the first build before committing screen work to it.

## 3. Mobile application

Tourist destinations follow PLAN.md: Map, Incidents, Shelters, Nearby chat, Settings. Alerts and emergency contacts remain reachable from every main destination. The map has the bottom-centre Report incident action. Authority routes cover overview/review, publishing, shelters, contacts and moderation.

Google sign-in uses the system browser and the Convex Auth OAuth callback, returning through an app-specific deep link. Google OAuth establishes identity only. A server-controlled approved-authority record establishes organization, jurisdiction and permissions. No client-provided role or profile update can elevate an account.

The country/foreground-location gate remains mandatory. Background permission and notification permission remain optional. Track the actual fix time and accuracy; the OS cannot guarantee the plan's desired update cadence. Use native builds for background location and push verification.

Use Convex subscriptions for live incident, shelter, alert and chat read models. Keep transient forms and filters in local React state. SQLite is a separate snapshot for degraded reads, not a substitute live database or an assumption that Convex handles offline mutations automatically.

## 4. Convex backend

### Responsibilities

- Queries return authorized, privacy-filtered read models.
- Mutations validate inputs and atomically apply domain changes, versions, audit events and durable delivery jobs.
- Actions perform external I/O to AccuWeather, SACHET, Jev, Google Translation and Expo Push. External I/O does not belong in mutations.
- Cron jobs poll official feeds, reassess candidate incidents and enforce retention. Scheduled work processes claimed jobs and retries.
- Revalidate the incident/evidence version in a mutation before applying an action result; a late Jev response must not override a newer authority decision.

Use finite geographic candidate selection followed by exact distance/polygon checks. Convex is not PostgreSQL/PostGIS: define cell indexes or evaluate a compatible geospatial component before implementation, and test area-crossing boundaries. Do not load all tourists or messages for every map query or alert.

### Proposed records

| Records | Important ownership/version boundaries |
| --- | --- |
| Auth users/sessions | Convex Auth owns the session lifecycle |
| Tourist profiles, latest locations, devices | Private to the owner and narrowly scoped internal jobs |
| Agencies, approved authority memberships, jurisdictions | Operator-controlled; never self-assigned |
| Incidents, observations, incident versions | Private observation identity; public generated aliases/read model |
| Assessment jobs, evidence snapshots, Jev results | Internal context; public summary excludes private identity/location |
| Official notices and notice revisions | Source identifier, published area, original text, issue/expiry/cancellation |
| Alerts, alert sources, revisions, recipient exposure, delivery jobs/receipts | Per-source endings, per-user version deduplication |
| Translations | Original hash + revision + language + provider/status |
| Shelters, emergency contacts | Authority/jurisdiction, status and confirmation timestamps |
| Chat messages, reports, moderation actions, appeals | Private origin for 15-km matching; public locality and alias |
| Audit events and policy configuration | Actor, reason, time; no raw secrets or unnecessary personal data |

Core internal interfaces: submit observation → acknowledged incident ID/version; build evidence → timestamped bundle; assess → typed result; publish → durable alert/revision/jobs; snapshot → filtered map/list records; delivery → accepted/receipt/failure states. Document actual schemas before parallel implementation.

## 5. Provider boundaries

### SACHET

Discover the actual published CAP/RSS feed URLs through the official feed directory. Fetch server-side and parse bounded XML payloads. Preserve identifiers, references, message type/status/scope, issuer, hazard, severity, urgency, certainty, affected polygons/circles or broad geocodes, originals, effective/expiry times and available official translations.

Poll at the plan's two-minute target, with concurrency limits/backoff. Reconcile updates/cancellations by source references, exclude tests/exercises/private notices, and record per-feed last successful checks. Official urgent notices bypass Jev; ordinary advisories remain warnings/context. An unavailable source is not an empty source. Expiry does not imply all-clear.

### AccuWeather

Resolve an incident coordinate to a provider location key, then retrieve current conditions and available past 24-hour hourly observations. Record observation/fetch time and provider geography. Verify API access, precipitation fields, attribution, retention terms and quota before claiming the full context is available. Multiple incident jobs sharing a provider location should reuse allowed cached requests.

AccuWeather's local observation does not establish upstream hydrology. Regional/upstream context remains explicitly unknown unless a documented location-selection method and actual data are available. Historical incident susceptibility comes from retained incident records, not a claim of twelve-month weather API access.

### Jev

Selected endpoint: `POST https://opencode.ai/zen/v1/systemone`, bearer `OPENCODE_API_KEY`, model `jev-1.13`, server-side fetch in a Convex action. An authorized synthetic Noul check passed on 2026-10-10 (HTTP 200, ~1.3 seconds, 302 input tokens, result 0.96). Choice/Score contract, timeout/rate-limit handling and application-specific accuracy still need verification. `jev-1.13-free` is limited-time; do not depend on it for production. OpenAI Decisions/Responses are not part of the selected initial stack. Inputs contain recent independent evidence, current/recent weather, locally relevant SACHET notices, incident history, contradictions and unknowns. News is excluded.

Normalize the provider response into bounded outcomes: NOTIFIABLE_EMERGENCY, NOT_QUALIFIED, INSUFFICIENT_EVIDENCE. Automatically qualify only the first outcome with that option's probability >= 0.90, as specified in PLAN.md. Keep option probability, overall confidence and severity confidence separate. This product cutoff is not an empirically validated hazard probability.

Jev is not a prose generator, translator or source-fetching agent. Build evidence summaries from stored evidence. Missing/malformed results stay assessment pending; valid insufficient evidence differs from a service failure. Authority declarations bypass Jev. A negative later result cannot automatically end an existing emergency.

### Google Cloud Translation

Use the official Cloud Translation API, invoked from a backend action. Prefer Advanced v3 for a future emergency glossary, subject to project access and actual language coverage. Bind each result to the exact original revision/hash and target language. Prefer translations supplied by the issuing authority where available.

Preserve place names, contacts, numbers/units, deadlines, negation and instruction strength; tests and review are needed beyond entity matching. Never label machine output authority-approved without exact-version approval. Invalidate obsolete translations when originals change. A prepared local-language summary plus original text provides a timely fallback; specific instructions are not invented.

Translate UI strings into reviewed resource files during development, not with paid network calls every time a screen renders. Jev and Translation have distinct jobs.

### Maps and shelter navigation

Use Apple Maps/MapKit rendering on iOS and the Google Maps SDK on Android through react-native-maps. App-owned incident areas and curated shelters are independent overlays. Android needs the Maps SDK enabled and a key restricted to its package/signing certificate. No Google map key is needed merely to render the iOS Apple basemap.

Keep PLAN.md's Google Maps external-navigation behavior for now: an iOS Apple basemap does not silently change the selected directions destination. If Google Maps is absent, retain address, coordinates, contact and Copy destination. Neither native basemap nor external directions calculates an app-verified safe route.

## 6. Online-first operation

The user explicitly prioritized online operation. Initial scope has no downloadable Apple/Google basemap packages, offline routing, comprehensive area-download manager or automatically queued offline reports/corroborations. These override PLAN.md section 16 and related offline acceptance cases.

Useful degraded operation: retain previously received emergency originals/translations, shelters, contacts and incident summaries; show last-sync/item timestamps and an offline banner. If tiles fail, display cached lists and coordinates. Save unsent form drafts locally; sending requires reconnection and user confirmation. Authority actions never publish offline. Cached chat must obey its expiry and cannot masquerade as a live nearby stream.

Reconnect by refreshing location, active alerts/corrections and shelter status before marking data current. A resolved historical alert must not play a new emergency sound. Switching Apple/Google basemaps does not create a supported downloaded-map feature; external map apps' offline capabilities are separate from this app.

## 7. Notifications and scheduling

Commit the alert/revision and a durable expansion job atomically with accepted publication. Expansion pages create deduplicated per-user/device delivery jobs in bounded transactions. Use Expo Push Service from backend actions and record provider tickets/receipts/failures. Register APNs and Android FCM credentials through the release workflow. Provider acceptance is not human receipt. Foreground subscriptions trigger the app overlay; background notifications deep-link to the current alert.

Apply PLAN.md's location eligibility: up to 30 minutes old, accuracy <=1 km, uncertainty overlap included, visibly stale after 15 minutes. Entering an existing emergency is an eligibility event. Apply revision/material-change sound rules independently of delivery retry.

Convex scheduling is the first-version worker infrastructure; no VPS/FastAPI/Cloud Run service is required just because the historical repository used one. Jobs need leases/claims, retry policy, idempotency and receipt processing; scheduled external actions are not assumed to be exactly-once.

## 8. GCP and secrets

Read-only local check on 2026-10-09 found gcloud installed with an active account and project `project-ba909057-8b45-4731-9b9`. Listing enabled services filtered for Translation and Android Maps returned no matches; actual permission, billing, OAuth configuration and API enablement remain verification tasks. No GCP resource/settings changes were made during planning.

Local gcloud login is not an authentication mechanism inside deployed Convex. Google Translation needs a deployment-supported server credential flow: evaluate short-lived federation first, or a narrowly scoped dedicated service account credential if necessary. Keep it only in backend secret storage; never reuse or upload the developer's local OAuth refresh token.

Backend-only: Google OAuth client secret, Translation server credentials, AccuWeather key, OpenCode Zen `OPENCODE_API_KEY`, protected Expo sender credentials. Mobile public configuration: Convex public URL, app identifiers and restricted Android Maps SDK key. A mobile Maps key is extractable and must be restricted; environment-variable naming does not make bundled credentials secret.

Do not create a paid service, purchase an API plan, or deploy application code as part of this documentation task. User authorization to use the existing GCP project permits later necessary setup in the accepted implementation scope.

## 9. Source references and capability checks

- [Expo react-native-maps](https://docs.expo.dev/versions/latest/sdk/map-view/): platform map providers and native configuration.
- [Expo location](https://docs.expo.dev/versions/latest/sdk/location/) and [notifications](https://docs.expo.dev/versions/latest/sdk/notifications/): check pinned SDK and test real native behavior.
- [Convex Auth](https://docs.convex.dev/auth/convex-auth) and [Google OAuth](https://labs.convex.dev/auth/config/oauth/google): mobile-compatible auth; Convex Auth is currently beta, so prove the redirect/session flow early.
- [Convex cron jobs](https://docs.convex.dev/scheduling/cron-jobs) and [scheduled functions](https://docs.convex.dev/scheduling/scheduled-functions): backend work and transaction boundaries.
- [SACHET CAP feed directory](https://sachet.ndma.gov.in/CapFeed): actual feed discovery.
- [AccuWeather current conditions](https://developer.accuweather.com/core-weather/location-key-currentconditions) and [historical conditions](https://developer.accuweather.com/core-weather/historical): verify subscribed endpoint access.
- [OpenCode Zen Jev](https://docs.opencode.ai/docs/zen/#jev) and [pricing](https://docs.opencode.ai/docs/zen/#pricing): selected gateway/model; Jev 1.13 standard input price $0.042 per million tokens, output free, subject to future change. Reported $17 balance was not verified through the inference response.
- [Jev introduction](https://docs.typesafe.ai/introduction) and [confidence](https://docs.typesafe.ai/confidence): bounded decisions and distinct confidence semantics.
- [Google Cloud Translation](https://cloud.google.com/translate/docs/advanced/translating-text-v3): server API and credential requirements.
- [Apple offline maps](https://support.apple.com/en-in/105084) describes the consumer Maps app; it is not proof of embedded SDK downloads. [Google tile policy](https://developers.google.com/maps/documentation/tile/policies) restricts offline tile use.

## 10. Remaining implementation inputs

OpenCode Zen key deployment and remaining Jev contract/quality checks (connectivity passed); AccuWeather endpoint entitlement (key locally supplied); approved authority organizations/jurisdictions; initial shelter/contact data; dedicated Convex development/production deployments; authorized Google OAuth setup; Apple signing/EAS and judge distribution access; landing host. These are setup inputs, not reasons to reopen the chosen stack. Track them in TODO.md. No application code starts until the user explicitly authorizes implementation.
