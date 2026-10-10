# GudTour — feasible implementation TODOs

Updated: 2026-10-10. **Development authorized and started on 2026-10-10.** Completed items require recorded evidence; remaining checkboxes stay pending. Review each group of three completed todos before committing and pushing it, as requested by the user.

Source of truth: [PLAN.md](PLAN.md) for core behavior, [tech-stack.md](tech-stack.md) for selected services, and [TECHNICAL_IMPLEMENTATION_PLAN.md](TECHNICAL_IMPLEMENTATION_PLAN.md) for contracts and mechanisms. Stack: Expo Android/iOS, Convex, Google OAuth, Apple/Google basemaps, SACHET, AccuWeather, Jev 1.13 through OpenCode Zen and Google Cloud Translation. News and full offline maps are excluded by the user.

## Current implementation checkpoint — 2026-10-10

| Work | Verified state |
| --- | --- |
| Foundation F01–F03 | Complete; committed/pushed b4e1c22. Expo SDK 57, Denoise Labs Convex, themes/language resources and shared contracts. |
| Core backend F04/F05/F07 | Complete for currently exposed core handlers; 51 checks pass. Private ownership, public DTOs, bounded indexes, internal operator approval and jurisdiction/revocation checks. |
| Google login F06 | OAuth client/keys and PKCE initiation configured; Real Google session/private profile confirmed on iOS; Android, restore and sign-out remain pending. |
| iOS testing F08 | Simulator development build compiles/installs; Native runtime and Apple Maps rendering confirmed; Android development build/Maps verification pending. |
| Location L01/L02/L05 | Shared country checks and server latest-fix mutation exist; Mobile fresh-fix admission and private profile implemented; mocked denial/disabled/old/coarse cases pass. Full native revocation/targeting pending. |
| API access P06/P08 | Maps restrictions/billing and Translation calls verified; RSS/CAP/polygon XML and real ETag 304 verified. Credentials saved privately; see docs/api-setup.md. |
| Report UI I03/I04 | Native report form renders on iOS; eight explicit choices, relative/earlier time, 500-character text, fresh GPS and explicit candidate/different-event choice. Export/typecheck checks pass; two-account device submission acceptance remains pending. |
| Incident backend I01/I02/I07 | Eight preset boundaries, separate state dimensions and authenticated atomic reporting/rate/proximity guards verified. UI, correction/withdrawal and full M3 acceptance remain pending. |
| Main product flows | Official alerts, shelters, provider workers, chat and release acceptance pending. |

Primary onboarding actions now stay pinned above the bottom safe area while content scrolls. Latest mobile checkpoint: 102 tests, strict typecheck/lint, Convex development deployment and Android/iOS/web exports pass. Report/detail and initial 5-km map/list are connected; two-account device submission and complete crisis workflows remain pending.

See [dated verification details](docs/progress/2026-10-10-development.md). Task completion here is scoped to the named foundation/backend work; M1's full sign-in/device goal remains incomplete.

## The outcome we are building

A tourist in India reports a nearby hazard. Recent independent evidence, weather and official warnings inform Jev qualification. A qualifying incident or official authority declaration produces a geographically relevant alert in the tourist's preferred language, with the original instruction, issuer, eligible shelter and emergency contacts. Authorities can maintain and correct that information. Nearby chat and honest degraded states complete the requested app.

**First working checkpoint:** an approved authority publishes one DEMO emergency; an eligible nearby tourist receives it, an outside tourist does not, and the recipient can read the original/translation and a suitable listed shelter. Build this reliable path before attaching automatic community qualification. This checkpoint is not the final scope or a substitute for the remaining milestones.

## How to execute feasibly

- Complete one visible workflow at a time, using the existing technical contracts. Add schema/UI/provider work only when the next workflow needs it.
- Use DEMO-isolated fixtures for early integration; label them clearly. Provider integration and device delivery must later be checked with real calls and builds.
- Start Android device verification early and keep iOS builds/signing active from M1. Both platforms remain required for final acceptance.
- Start with English plus one additional language to prove the translation flow; finish all six languages before M9 passes.
- Test authorization, time/radius boundaries and retries alongside each feature. M9 consolidates evidence rather than postponing all testing to the end.
- Keep only one primary milestone active per owner. If a provider is blocked, continue independent work and document the blocker; never replace missing evidence with fabricated success.
- There is no promised 24-hour completion schedule. Estimate remaining work after each working checkpoint against the actual team, access and deadline. A short event may not fit the complete scope; report that explicitly before proposing any scope change.
- Tick a task only when its stated behavior is demonstrated and its check is recorded. A mock, file, accepted push ticket or single provider smoke call alone does not complete an app workflow.

## Ownership

| Owner | Responsibility |
| --- | --- |
| A — Backend/integration | Shared contracts/schema, Google auth, permissions, geographic/domain mutations and integration |
| B — Tourist mobile | Entry, map, reporting, alert/shelter/settings screens, location and public cache |
| C — Evidence/delivery | SACHET, weather, Jev, Translation and delivery workers |
| D — Authority/verification/release | Authority/moderation screens, independent checks, native distribution, landing and demo |

These are proposed team responsibilities, not automatic agent assignments. For three builders, combine B/D screen ownership and explicitly share independent verification. A owns changes to shared schema/dependencies. Assign names before implementation and avoid simultaneous edits to shared files.

## Completed planning and access evidence

- [x] P00 Read latest remote PLAN.md and identify conflicts in older documents.
- [x] P01 Record user-selected stack and online-first/no-news overrides in tech-stack.md.
- [x] P02 Align older README/strategy/UI references with current behavior; preserve historical requirements as history. Owner A.
- [x] P11 Complete and maintain the technical design, architecture entry point and this feasible milestone backlog without reducing PLAN.md core behavior. Owner A.
- [x] P12 Migrate planning work to the verified GitHub-connected bitsnbytes folder and remove the verified duplicate checkout. Owner A.
- [x] P07a Confirm OpenCode Zen paid Jev 1.13 endpoint access with one authorized synthetic Noul call; HTTP 200 on 2026-10-10. Owner C.

The Jev check above proves only one synthetic Noul request succeeded. Choice mapping, real incident accuracy, deployed credentials and app integration remain pending.


## M0 — Clear the setup blockers

**Goal:** Have a documented development/deployment path and know which features are blocked by access.

**Depends on:** None; this is the entry gate.

**Design reference:** Technical plan §§1–4, 22, 26.

- [x] P03 Confirm the user has authorized application coding and the organizer development window is open. Record the actual deadline. Owner A.
- [x] P04 Create an access checklist for Convex, EAS/Apple signing, GCP, OpenCode Zen and AccuWeather. Record available/pending access without credentials. Owners A/C/D.
- [ ] P05 Verify AccuWeather current + 24-hour history endpoint entitlement, quota and allowed retention. Owner C.
- [x] P06 Inspect a real SACHET feed and one CAP notice; document geographic coverage/update/cancellation fields. Owner C.
- [ ] P07 Verify live Jev Choice responses, selected-option probabilities and confidence; check Score only if used. Record timeout/auth/rate-limit/malformed behavior and run labeled incident evaluations before automatic publication. Owner C.
- [x] P08 Verify Google OAuth first, then Android Maps and Translation before their dependent features. Record enabled services, billing, restrictions and deployed credential flow. Owner A.
- [ ] P09 Agree initial approved demo authorities/jurisdictions and sourced or DEMO-labeled shelters/contacts. Owners A/D.
- [ ] P10 Confirm Android install and signed iOS judge-access paths before screen-heavy work; choose landing hosting before release. Owner D.
- [x] Q01 Create a pass/fail ledger from PLAN.md section 18 before feature work. Replace only the user-deferred full-offline cases with online-first recovery checks; review the ledger at every milestone. Owner D.

Provider-specific P05/P06/P07 checks may remain open until M6, P09 gates M4, and P08 is completed per Google feature. They are not reasons to block unrelated foundation work.

**Done when:** Coding authorization/window is recorded; the team has a usable Convex/EAS path and Android/iOS install plan. Provider gaps are assigned to their dependent milestone. Missing weather/translation access does not block unrelated auth or incident work.


## M1 — Open the native app and sign in

**Goal:** An Android and iOS development build signs in with Google and reads its own profile from Convex.

**Depends on:** M0 coding/access gate; F03 precedes shared feature contracts.

**Design reference:** Technical plan §§3–4, 6–9, 18, 22.

- [x] F01 Initialize Expo TypeScript app, Router and dedicated Convex project; pin SDK/native-compatible dependencies. Owner A.
- [x] F02 Establish light/dark tokens, native chrome, safe areas, readable large-text controls and six-language resource structure. Owner B.
- [x] F03 Define shared geometry, timestamp, language, policy, error and version/idempotency contracts. Owner A.
- [x] F04 Create the core identity/incident/location schema and bounded geographic indexes first; add shelter/alert/chat tables with their milestones using technical-plan section 6. Owner A.
- [x] F05 Define privacy-filtered public read models separate from private observations, locations and devices. Owner A.
- [ ] F06 Implement Google OAuth through Convex Auth; prove native redirect, session restore and sign-out on both platforms. Owner A, D verifies.
- [x] F07 Enforce default tourist role and operator-approved authority memberships/jurisdictions in every backend handler. Owner A.
- [ ] F08 Produce Android/iOS development builds; prove Google basemap on Android and Apple basemap on iOS before building map overlays. Owners B/D.
- [x] F09 Implement common loading/error/empty/offline/stale components and structured error handling. Owner B.

**Done when:** Run both native builds, restore a session after restart, sign out, and directly attempt an unauthorized read/mutation. The tourist cannot assign an authority role. Both basemaps render.


## M2 — Admit an eligible tourist and capture location

**Goal:** A tourist in India can complete onboarding; location freshness and optional permissions are accurately represented.

**Depends on:** M1; L05 and L07 are shared prerequisites for targeting.

**Design reference:** Technical plan §§5, 7–9, 18.

- [x] L01 Language selection before permission prompts; India boundary gate using <=5-minute, <=200-metre fix. Owner B.
- [ ] L02 Blocking denied/disabled/uncertain/outside-India states with Settings/Retry and restoration behavior. Owner B.
- [x] L03 Required name; private optional blood group/emergency contact; persistent profile and alias. Owners A/B.
- [ ] L04 Separate optional notification and background-location prompts with actual reduced-capability copy. Owner B.
- [ ] L05 Latest-location mutation records observed time/accuracy; stops eligibility outside India and avoids travel-history storage. Owner A.
- [ ] L06 Refresh on foreground/report/corroboration/chat/shelter selection; show stale age and actual tracking status. Owner B.
- [ ] L07 Device registration and profile/token/language association; sign-out stops tracking and disconnects device delivery. Owners A/C.
- [ ] L08 Verify background permission denial, revocation and platform restrictions in native builds. Owner D.

**Done when:** Check inside/outside/uncertain India, denied foreground permission and an old/inaccurate fix. Background/push denial leaves admitted foreground use working. Stored fix time is the actual observation time.


## M3 — Report and corroborate a real persisted incident

**Goal:** Two accounts see the same unverified incident on map/list and can contribute independent recent observations.

**Depends on:** M1–M2; no AI dependency.

**Design reference:** Technical plan §§5–6, 8–10, 18.

- [x] I01 Implement eight hazard presets, radii, witness windows and stale timers exactly from PLAN.md section 5. Owner A.
- [x] I02 Keep verification, activity and emergency qualification as separate fields/state transitions. Owner A.
- [x] I03 Build Report incident form: hazard, captured location, observed time, description <=500; no media. Owner B.
- [x] I04 Suggest same-type nearby candidates; require user choice to corroborate or report a different event. Owners A/B.
- [ ] I05 Idempotent submit persists observation; acknowledged response opens unverified/pending detail. Owner A. Backend receipt/replay tests pass and native routing is connected; device submit/open confirmation remains pending.
- [ ] I06 Count one independent witness per person; refresh observation time without incrementing count. Owner A.
- [x] I07 Enforce proximity/fix quality, <=24-hour observed-time validation, five reports/hour and ten-minute witness cooldown. Owner A.
- [ ] I08 Corrections/withdrawals/flags and merge redirects preserve history and independent counts. Owners A/D.
- [ ] I09 Map overlays include active unverified reports with dashed uncertainty, official areas and shelters; recenter/filter/grouped marker list. Owner B.
- [ ] I10 Incident list: emergency section, distance ordering, 5/15/25/50-km filters and separate stale/archive views. Owner B.
- [ ] I11 Incident detail: evidence, source, timestamps, lifecycle, recent/total witnesses and eligible corroboration. Owner B.
- [ ] I12 Implement stale/expired/rejected/resolved/merged behavior; never infer safe/all-clear from silence. Owner A.

**Done when:** Submit from account one, reopen from account two, corroborate, retry the first request, and withdraw an observation. Counts remain independent, status/timestamps update, and no emergency notification is emitted.


## M4 — Publish official instructions and maintain shelters

**Goal:** An approved authority can declare/update/end an emergency and maintain usable shelters/contacts in its jurisdiction.

**Depends on:** M1–M3. P09 must supply approved DEMO authority/jurisdiction and labeled shelter/contact fixtures.

**Design reference:** Technical plan §§6, 9–10, 14–15, 18.

- [ ] A01 Authority overview prioritizes emergencies, conflicting instructions, pending/stale assessments and flags. Owner D.
- [ ] A02 Review actions: verify/unverified, hazard/severity/area changes, merge, reject and resolve with actor/reason/time. Owners A/D.
- [ ] A03 Declare/update review sheet shows instructions, area, severity, deadline and recipient estimate when available. Owner D.
- [ ] A04 Publish official declaration immediately, bypass Jev; default verification is distinct from explicit emergency declaration. Owner A.
- [ ] N04 Atomic alert/source/revision publication with expansion job, then paginated deduplicated recipient jobs; no logical duplicates from retries/merge aliases. Owner A.
- [ ] A05 Implement timed suppression (30-minute default, two-hour maximum), urgent-review flags and resumption. Owner A.
- [ ] A06 Source-specific withdrawal/resolution/false-alert correction; reject after alert requires explicit correction atomically. Owner A.
- [ ] A07 Shelter maintenance: open/closed/full/unknown, fresh confirmation, capacity, accessibility, facilities, contact and archive. Owners A/D.
- [ ] A08 Contact maintenance with jurisdiction/source and over-30-day age label. Owners A/D.
- [ ] A09 Select nearest eligible open shelter: <=2-hour confirmation, <=50 km, outside known hazard areas, instruction/accessibility precedence. Owner A.
- [ ] A10 Shelter list/detail shows excluded reasons, status ages and distance; external Google Maps/copy/dialer fallbacks. Owner B.
- [ ] A11 Audit authority changes; reject revoked/cross-jurisdiction access and stale concurrent writes. Owner A, D verifies.

**Done when:** Publish with Jev unavailable: the official alert/source/revision and expansion job commit immediately. Reject a cross-jurisdiction edit. Demonstrate stay-put, no eligible shelter, and full/stale/unsafe shelter exclusions. Delivery becomes visible in M5.


## M5 — Deliver a translated, targeted official alert

**Goal:** Complete the first working checkpoint: the correct tourist receives an official emergency, original/translation and an eligible shelter.

**Depends on:** M2 device/location registration, M4 publication/shelters and its N04 durable publication contract; P08 Translation access and APNs/FCM configuration.

**Design reference:** Technical plan §§8, 14–18, 22.

- [ ] N01 Google Translation backend adapter with scoped server authentication and version/hash/language cache. Owner C.
- [ ] N02 Show originals immediately; prefer exact-version official translations, otherwise show machine-translation status. Invalidate obsolete translations and provide reviewed localized labels while translation is pending. Owner C.
- [ ] N03 Review static UI/templates in all six languages; test names/numbers/deadlines/negation and instruction strength. Owners B/C/D.
- [ ] N05 Target <=30-minute, <=1-km-accuracy Indian positions including uncertainty overlap; new entry into ongoing emergency triggers eligibility. Owner A.
- [ ] N06 Register/configure APNs/FCM; send Expo notifications and process tickets/receipts/token failures with bounded retries. Owners C/D.
- [ ] N07 Foreground full-screen alert, one-at-a-time severity/source ordering, actions and silent reopen/dismissed yellow banner. Owner B.
- [ ] N08 Implement material-update sound rules, ten-minute repeat limit/Critical exception, exit/re-entry and quiet ending/correction follow-ups. Owners A/B/C.
- [ ] N09 Deep links open current incident/alert revision; language changes do not replay sounds. Owner B.
- [ ] N10 Verify preferred-language receive/open on physical Android/iOS; distinguish provider accepted, receipt, opened and failed. Owner D.

**Done when:** Use two eligible accounts at inside/outside positions to verify targeting; separately test stale/inaccurate locations. Prove foreground and background receive/open on native devices, original fallback on translation failure, material-update sound rules and silent reopen. Complete all six languages before release.


## M6 — Add official feeds, weather and automatic Jev qualification

**Goal:** A tourist incident uses fresh source-backed evidence to become notifiable, not qualified or insufficient evidence without masquerading as an official declaration.

**Depends on:** M3 evidence records and M5 working delivery. P05 weather entitlement, P06 real SACHET fields and P07 Jev contracts/evaluation are gates for their adapters.

**Design reference:** Technical plan §§10–14, 21–24.

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
- [ ] E11 Record provider usage/errors, coalesce duplicate evidence jobs and enforce configurable context/concurrency/spend ceilings. At the model ceiling, pause Jev calls while official declarations still publish. Owner C.

**Done when:** Inspect a real CAP notice/weather response and record a live Jev Choice assessment. Test all three normalized outcomes with appropriate labeled cases, independent/stale reports, malformed/late/outage responses and authority precedence. A qualifying current result reaches the same proven alert path; source cancellation never creates a false all-clear.


## M7 — Make nearby chat usable and moderated

**Goal:** Tourists can exchange local plain-text information; location, expiry, restrictions and authority moderation are enforced.

**Depends on:** M1–M2 and authority membership from M4; independent of Jev.

**Design reference:** Technical plan §§6, 8–9, 19, 21.

- [ ] C01 Geospatial stream anchored to message origin: 15 km, <=5-minute/<=500-metre fix, chronological order, 24-hour expiry. Owner A.
- [ ] C02 Plain-text composer <=500 characters, alias/locality labels and authority announcement attribution. Owner B.
- [ ] C03 Limits five messages/minute and 30/hour; no links/media/DMs/private profile or precise origin disclosure. Owner A.
- [ ] C04 Structured incident links remain separate from unverified chat; chat does not count as witnesses or trigger Jev. Owners A/B.
- [ ] C05 Message reports, authority moderation queue, hide reason/placeholder, 24-hour posting restriction and one appeal. Owners A/D.
- [ ] C06 Local alias mute; official alerts remain visible. Disable fresh delivery/posting when chat fix expires. Owner B.
- [ ] C07 Expire live/cached messages and retain moderation evidence for specified seven-day/active-appeal periods. Owner A.

**Done when:** Two users inside/outside 15 km see different feeds. Moving the sender does not move an existing message. Test stale location, limits, expiry, hide/reason, restriction and one appeal. Chat never triggers incident qualification.


## M8 — Handle disconnection, deletion and worker recovery

**Goal:** Previously received information stays readable with honest ages; private data and background jobs have an explicit lifecycle.

**Depends on:** Working read models from M3–M7. Implement relevant cache/deletion safeguards as features are added.

**Design reference:** Technical plan §§17, 20–23.

- [ ] R01 Persist last successful public snapshot and received emergency text with item/sync timestamps. Owner B.
- [ ] R02 Connection loss shows cached lists/contacts and offline banner; no promise of downloaded basemaps/live capacity. Owner B.
- [ ] R03 Save local unsent drafts; no automatic offline posting; retry requires fresh eligible context and explicit send/publish. Owners B/D.
- [ ] R04 Reconnection refreshes current location, corrections/emergencies and shelter status before Live label. Owner B.
- [ ] R05 Retention jobs: inactive latest location 24 hours, incident history twelve months, alert history 30 days, chat/moderation rules. Owner A.
- [ ] R06 Profile deletion/sign-out clear private data/device association/drafts; retained public evidence is anonymized. Owners A/B.
- [ ] R07 API/client/log disclosure checks for private location, name, blood group, contact, tokens and credentials. Owner D.
- [ ] R08 Recover expired worker leases and resume paginated jobs from checkpoints. Replay a targeting/delivery job and verify no duplicate logical job; record uncertain network sends separately. Owners A/C.

**Done when:** Disconnect/reconnect with an unsent draft; require explicit send and fresh context. Ended alerts stay ended. Sign out/delete an account and verify device/location/cache cleanup. Recover an expired job lease without duplicating logical jobs; confirm retention and appeal holds.


## M9 — Prove the complete app and prepare deliverables

**Goal:** Every required core workflow has recorded evidence; native artifacts, landing and demo are actually accessible.

**Depends on:** M1–M8 passed, or any unmet requirement explicitly recorded as incomplete; no silent scope reduction.

**Design reference:** Technical plan §§23–25; PLAN.md §18; organizer brief.

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

**Done when:** A clean tester installs Android without Metro and uses the accepted signed iOS path. The pass/fail ledger covers all six languages, auth/privacy, boundaries, concurrent changes, outages, accessibility and actual delivery. Landing links work and the real 2–5-minute video shows both community and official flows.


## M10 — Freeze and submit the verified release

**Goal:** The team leader submits the correct repository, real demo video and required access links before the official deadline.

**Depends on:** M9 release evidence and organizer-required deliverables.

**Design reference:** Technical plan §25 and organizer brief.

- [ ] S01 Release candidate, artifact/link/video playback checks and full demo rehearsal. Owners A/D.
- [ ] S02 Freeze feature changes; fix release blockers only within permitted window. Owner A.
- [ ] S03 Team leader submits GitHub, actual demo video and required access links before the official deadline. Team leader.

**Done when:** Rehearse from clean installs, play the full video, open every submitted link and record the leader's actual submission receipt. Only release blockers are changed after freeze.

## Next development actions

1. Verify I05/I11 on native devices: submit/open receipt, two-account contribution and source/evidence detail.
2. Finish I06/I08/I12: scalable independent counts, correction/withdrawal/history and lifecycle checks.
3. Continue M4 official publication/shelters and M5 delivery; complete Android auth/Maps and native permission checks alongside these workflows.

## Deliberately deferred or excluded

Downloaded basemaps, offline routing, automatically queued offline reports and a fully offline crisis experience are deferred by the user. News ingestion is removed. Rescue dispatch/SOS, family tracking, media reports, chat attachments/DMs, shelter reservations and a full web crisis app remain excluded. The web deliverable is a public landing page. These exclusions do not remove chat, authority workflows, six languages or either native platform.

## Evidence and progress format

For each task record: **task ID → behavior demonstrated → check/result → build/commit/device → blocker or limitation → next action**. Record provider access, model decision quality, server publication, push ticket/receipt and human app-open as different claims. A failed milestone stays open.

Do not commit keys, .env.local or private tourist data. Do not lower the Jev threshold, fake weather, bypass location rules or relabel fixtures to make a demonstration pass. Only an explicit user decision changes the core product scope.
