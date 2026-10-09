# GudTour — ordered implementation TODOs

Updated: 2026-10-10. All application tasks are pending. This is a planning backlog, not authorization to start coding.

Read [TECHNICAL_IMPLEMENTATION_PLAN.md](TECHNICAL_IMPLEMENTATION_PLAN.md) for engineering contracts, PLAN.md for behavior and tech-stack.md for the latest user overrides: Expo/Convex/Google OAuth, platform-native maps, AccuWeather, SACHET, Jev 1.13 via OpenCode Zen, Google Translation, no news, online-first.

## Ownership and execution rules

| Owner | Exclusive responsibility |
| --- | --- |
| A — Integration/backend | Shared types, Convex schema/auth, authorization, domain mutations, configuration, integration |
| B — Tourist mobile | Gate/onboarding, map, reporting, incident/shelter/settings screens and public cache |
| C — Evidence/alerts | Feed/weather/OpenCode Zen Jev/translation adapters, assessment and delivery workers |
| D — Authority/release | Authority screens/moderation, independent QA, native artifacts, landing and demo |

These are proposed human/team streams, not running agents. With three builders, B and D share screens; QA/release remains an explicit assignment. A owns shared schema, dependencies and interfaces. Do not concurrently edit shared files.

Every task uses a short bounded checkpoint: objective, owned modules, agreed input/output/auth/error contract, acceptance check and evidence. Timeboxes below are integration checkpoints; unfinished work is reported rather than marked complete.

## M0 — Planning and provider readiness (first 60 minutes after implementation approval)

- [x] P00 Read latest remote PLAN.md and identify conflicts in older documents.
- [x] P01 Record user-selected stack and online-first/no-news overrides in tech-stack.md.
- [x] P02 Align older README/strategy/UI references with current behavior; preserve historical requirements as history. Owner A.
- [x] P11 Complete the in-depth technical design and architecture entry point, preserving PLAN.md core behavior. Owner A.
- [x] P12 Migrate planning work to the verified GitHub-connected bitsnbytes folder and remove the verified duplicate checkout. Owner A.
- [ ] P03 Confirm application implementation authorization and organizer development window. Owner A.
- [ ] P04 Inventory access to Convex, EAS/Apple signing, GCP, Jev and AccuWeather without storing credentials in docs. Owners A/C/D.
- [ ] P05 Verify AccuWeather current + 24-hour history endpoint entitlement, quota and allowed retention. Owner C.
- [ ] P06 Inspect a real SACHET feed and one CAP notice; document geographic coverage/update/cancellation fields. Owner C.
- [x] P07a Confirm OpenCode Zen paid Jev 1.13 endpoint access with one authorized synthetic Noul call; HTTP 200 on 2026-10-10. Owner C.
- [ ] P07 Verify remaining Jev Choice/Score schemas, probabilities/confidence, timeout/errors, budget limits and labeled incident evaluations. Owner C.
- [ ] P08 Verify GCP OAuth, Android Maps and Translation enablement/billing/permissions; prepare scoped configuration. Owner A.
- [ ] P09 Agree initial approved demo authorities/jurisdictions and sourced or DEMO-labeled shelters/contacts. Owners A/D.
- [ ] P10 Choose judge-accessible Android/iOS delivery paths and landing host immediately. Owner D.

**Exit:** chosen services have accessible contracts; missing keys/entitlements/distribution blockers are explicit. No fake provider success.

## M1 — Foundation and shared contracts (checkpoint by hour 3)

- [ ] F01 Initialize Expo TypeScript app, Router and dedicated Convex project; pin SDK/native-compatible dependencies. Owner A.
- [ ] F02 Establish light/dark tokens, native chrome, safe areas, readable large-text controls and six-language resource structure. Owner B.
- [ ] F03 Define shared geometry, timestamp, language, policy, error and version/idempotency contracts. Owner A.
- [ ] F04 Define Convex records/indexes and finite geographic candidate queries; document exact boundary checks. Owner A.
- [ ] F05 Define privacy-filtered public read models separate from private observations, locations and devices. Owner A.
- [ ] F06 Implement Google OAuth through Convex Auth; prove native redirect, session restore and sign-out on both platforms. Owner A, D verifies.
- [ ] F07 Enforce default tourist role and operator-approved authority memberships/jurisdictions in every backend handler. Owner A.
- [ ] F08 Create native development builds early; confirm Android Google basemap and iOS Apple basemap render. Owners B/D.
- [ ] F09 Implement common loading/error/empty/offline/stale components and structured error handling. Owner B.

**Exit:** both native apps authenticate and read real authorized Convex data; direct unauthorized mutations are denied.

## M2 — India gate, onboarding and location (checkpoint by hour 5; depends on M1)

- [ ] L01 Language selection before permission prompts; India boundary gate using <=5-minute, <=200-metre fix. Owner B.
- [ ] L02 Blocking denied/disabled/uncertain/outside-India states with Settings/Retry and restoration behavior. Owner B.
- [ ] L03 Required name; private optional blood group/emergency contact; persistent profile and alias. Owners A/B.
- [ ] L04 Separate optional notification and background-location prompts with actual reduced-capability copy. Owner B.
- [ ] L05 Latest-location mutation records observed time/accuracy; stops eligibility outside India and avoids travel-history storage. Owner A.
- [ ] L06 Refresh on foreground/report/corroboration/chat/shelter selection; show stale age and actual tracking status. Owner B.
- [ ] L07 Device registration and profile/token/language association; sign-out stops tracking and disconnects device delivery. Owners A/C.
- [ ] L08 Verify background permission denial, revocation and platform restrictions in native builds. Owner D.

**Exit:** outside-India and foreground-denied users cannot enter; background/push denial leaves the foreground app usable.

## M3 — Incidents, observations and live map (checkpoint by hour 8; depends on M1/M2)

- [ ] I01 Implement eight hazard presets, radii, witness windows and stale timers exactly from PLAN.md section 5. Owner A.
- [ ] I02 Keep verification, activity and emergency qualification as separate fields/state transitions. Owner A.
- [ ] I03 Build Report incident form: hazard, captured location, observed time, description <=500; no media. Owner B.
- [ ] I04 Suggest same-type nearby candidates; require user choice to corroborate or report a different event. Owners A/B.
- [ ] I05 Idempotent submit persists observation; acknowledged response opens unverified/pending detail. Owner A.
- [ ] I06 Count one independent witness per person; refresh observation time without incrementing count. Owner A.
- [ ] I07 Enforce proximity/fix quality, <=24-hour observed-time validation, five reports/hour and ten-minute witness cooldown. Owner A.
- [ ] I08 Corrections/withdrawals/flags and merge redirects preserve history and independent counts. Owners A/D.
- [ ] I09 Map overlays include active unverified reports with dashed uncertainty, official areas and shelters; recenter/filter/grouped marker list. Owner B.
- [ ] I10 Incident list: emergency section, distance ordering, 5/15/25/50-km filters and separate stale/archive views. Owner B.
- [ ] I11 Incident detail: evidence, source, timestamps, lifecycle, recent/total witnesses and eligible corroboration. Owner B.
- [ ] I12 Implement stale/expired/rejected/resolved/merged behavior; never infer safe/all-clear from silence. Owner A.

**Exit:** two clients see a persisted report and fresh witness updates; no tourist emergency notification happens before qualification.

## M4 — SACHET, AccuWeather and Jev (checkpoint by hour 11; starts after F03/F04)

- [ ] E01 Implement bounded CAP/RSS parser, source directory configuration, timeouts and per-feed status. Owner C.
- [ ] E02 Normalize warning geometry/provenance/originals, references, revisions, cancellations, advisory versus urgent declaration. Owner C.
- [ ] E03 Poll at two-minute target; reject test/exercise/private notices and irrelevant state-only matching. Owner C.
- [ ] E04 Implement AccuWeather location-key/current/24-hour adapters with allowed caching, quota and freshness handling. Owner C.
- [ ] E05 Build versioned evidence bundle with recent witnesses, weather, relevant SACHET, twelve-month nearby incident history, unknowns/contradictions; no news. Owner C.
- [ ] E06 Implement bounded Jev judgments and normalized outcomes; separate severity/option probability/model confidence. Owner C.
- [ ] E07 Accept automatic NOTIFIABLE_EMERGENCY only at option probability >=0.90; recheck current evidence/version and authority suppression. Owners A/C.
- [ ] E08 Reassess on meaningful changes and five-minute target; outage retries at 1/5/15 minutes then every 15. Owner C.
- [ ] E09 Preserve active emergencies on negative result/outage; route changed assessment to authority review without all-clear. Owners A/C.
- [ ] E10 Assemble source-backed evidence summaries without asking Jev to generate prose or instructions. Owner C.

**Exit:** real provider results produce the three distinct outcomes; timeout/malformed/stale results cannot broadcast or override authority state.

## M5 — Authority operations and shelters (checkpoint by hour 12; starts after F07/I02)

- [ ] A01 Authority overview prioritizes emergencies, conflicting instructions, pending/stale assessments and flags. Owner D.
- [ ] A02 Review actions: verify/unverified, hazard/severity/area changes, merge, reject and resolve with actor/reason/time. Owners A/D.
- [ ] A03 Declare/update review sheet shows instructions, area, severity, deadline and recipient estimate when available. Owner D.
- [ ] A04 Publish official declaration immediately, bypass Jev; default verification is distinct from explicit emergency declaration. Owner A.
- [ ] A05 Implement timed suppression (30-minute default, two-hour maximum), urgent-review flags and resumption. Owner A.
- [ ] A06 Source-specific withdrawal/resolution/false-alert correction; reject after alert requires explicit correction atomically. Owner A.
- [ ] A07 Shelter maintenance: open/closed/full/unknown, fresh confirmation, capacity, accessibility, facilities, contact and archive. Owners A/D.
- [ ] A08 Contact maintenance with jurisdiction/source and over-30-day age label. Owners A/D.
- [ ] A09 Select nearest eligible open shelter: <=2-hour confirmation, <=50 km, outside known hazard areas, instruction/accessibility precedence. Owner A.
- [ ] A10 Shelter list/detail shows excluded reasons, status ages and distance; external Google Maps/copy/dialer fallbacks. Owner B.
- [ ] A11 Audit authority changes; reject revoked/cross-jurisdiction access and stale concurrent writes. Owner A, D verifies.

**Exit:** authority edits immediately change tourist data and shelter eligibility; shelter-in-place overrides generic shelter CTA.

## M6 — Six-language alerts and real delivery (checkpoint by hour 14; depends on E07/A04)

- [ ] N01 Google Translation backend adapter with scoped server authentication and version/hash/language cache. Owner C.
- [ ] N02 Preserve originals, prefer official supplied translations, invalidate obsolete translations and implement generic-language fallback. Owner C.
- [ ] N03 Review static UI/templates in all six languages; test names/numbers/deadlines/negation and instruction strength. Owners B/C/D.
- [ ] N04 Atomic alert/source/revision publication with expansion job, then paginated deduplicated recipient jobs; no logical duplicates from retries/merge aliases. Owner A.
- [ ] N05 Target <=30-minute, <=1-km-accuracy Indian positions including uncertainty overlap; new entry into ongoing emergency triggers eligibility. Owner A.
- [ ] N06 Register/configure APNs/FCM; send Expo notifications and process tickets/receipts/token failures with bounded retries. Owners C/D.
- [ ] N07 Foreground full-screen alert, one-at-a-time severity/source ordering, actions and silent reopen/dismissed yellow banner. Owner B.
- [ ] N08 Implement material-update sound rules, ten-minute repeat limit/Critical exception, exit/re-entry and quiet ending/correction follow-ups. Owners A/B/C.
- [ ] N09 Deep links open current incident/alert revision; language changes do not replay sounds. Owner B.
- [ ] N10 Verify preferred-language receive/open on physical Android/iOS; distinguish provider accepted, receipt, opened and failed. Owner D.

**Exit:** second user receives a real targeted alert; outside/stale users do not; translation failure never delays the prepared fallback indefinitely.

## M7 — Nearby chat and moderation (checkpoint by hour 16; starts after L05/F07)

- [ ] C01 Geospatial stream anchored to message origin: 15 km, <=5-minute/<=500-metre fix, chronological order, 24-hour expiry. Owner A.
- [ ] C02 Plain-text composer <=500 characters, alias/locality labels and authority announcement attribution. Owner B.
- [ ] C03 Limits five messages/minute and 30/hour; no links/media/DMs/private profile or precise origin disclosure. Owner A.
- [ ] C04 Structured incident links remain separate from unverified chat; chat does not count as witnesses or trigger Jev. Owners A/B.
- [ ] C05 Message reports, authority moderation queue, hide reason/placeholder, 24-hour posting restriction and one appeal. Owners A/D.
- [ ] C06 Local alias mute; official alerts remain visible. Disable fresh delivery/posting when chat fix expires. Owner B.
- [ ] C07 Expire live/cached messages and retain moderation evidence for specified seven-day/active-appeal periods. Owner A.

**Exit:** two users inside/outside the radius get different streams; sender movement does not relocate messages; expiry and moderation work.

## M8 — Online resilience and privacy (checkpoint by hour 17; depends on prior read models)

- [ ] R01 Persist last successful public snapshot and received emergency text with item/sync timestamps. Owner B.
- [ ] R02 Connection loss shows cached lists/contacts and offline banner; no promise of downloaded basemaps/live capacity. Owner B.
- [ ] R03 Save local unsent drafts; no automatic offline posting; retry requires fresh eligible context and explicit send/publish. Owners B/D.
- [ ] R04 Reconnection refreshes current location, corrections/emergencies and shelter status before Live label. Owner B.
- [ ] R05 Retention jobs: inactive latest location 24 hours, incident history twelve months, alert history 30 days, chat/moderation rules. Owner A.
- [ ] R06 Profile deletion/sign-out clear private data/device association/drafts; retained public evidence is anonymized. Owners A/B.
- [ ] R07 API/client/log disclosure checks for private location, name, blood group, contact, tokens and credentials. Owner D.

**Exit:** a failed refresh preserves age labels; old cancelled warnings do not revive; direct private-data reads are denied.

## M9 — Integrated acceptance and release (hours 17–22)

- [ ] Q01 Translate PLAN.md section 18 into a pass/fail ledger; explicitly replace full-offline cases with online-first recovery checks. Owner D.
- [ ] Q02 Domain tests for time/radius boundaries, uncertainty overlap, witness deduplication, state/source endings and shelter exclusions. Owners A/C.
- [ ] Q03 Convex tests for tourist privilege escalation, owner privacy, revoked authorities and jurisdiction/concurrent-version rejection. Owner D.
- [ ] Q04 Fault tests for Jev/weather/feed/translation outage, malformed CAP, stale action responses and duplicate worker execution. Owner C, D verifies.
- [ ] Q05 Device tests for India/permission gates, background/push, cold-start deep links, keyboard/safe areas and all six languages. Owner D.
- [ ] Q06 Accessibility: screen reader, 200% text, color-independent status, reduced motion and accessible map/list alternative. Owners B/D.
- [ ] Q07 Standalone Android APK clean install without Metro; real iOS judge-accessible install/test path. Owner D.
- [ ] Q08 Public landing with verified artifact links, actual screenshots, privacy summary and honest capability limits. Owner D.
- [ ] Q09 README clean setup, environment templates and actual API/library/model disclosures; no secrets or fictional working claims. Owner A.
- [ ] Q10 Record real 2–5-minute video: community qualification, official bypass, multilingual targeted alert, suitable shelter, chat and one failure. Owner D.
- [ ] Q11 Save measured checks/build/commit/limitations in judging evidence; DEMO labels isolate fixtures from ordinary users. Owner D.

**Exit:** required workflows are real and tested; artifacts/video/links are accessible; every remaining gap is disclosed.

## M10 — Freeze and submission (hours 22–24)

- [ ] S01 Release candidate, artifact/link/video playback checks and full demo rehearsal. Owners A/D.
- [ ] S02 Freeze feature changes; fix release blockers only within permitted window. Owner A.
- [ ] S03 Team leader submits GitHub, actual demo video and required access links before the official deadline. Team leader.

## Deferred by latest scope

Downloaded basemap packs, comprehensive offline area downloads, automatically queued offline observations, offline routing and a fully offline crisis experience. News adapters are removed, not pending. PLAN.md's SOS/rescue/family tracking/media reports/chat attachments/shelter reservations remain excluded. The public web page is a landing, not a full web app.

## Completion evidence

Checking a box requires an actual accepted result, not merely created files. At each checkpoint record objective, owned modules, test/check, result, commit/build, dependency blocker and next task. Documentation completed here does not mark any app functionality implemented.
