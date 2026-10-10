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
| Incident backend I01/I02/I07 | Eight preset boundaries, separate state dimensions and authenticated atomic reporting/time/proximity guards verified. UI, correction/withdrawal and full M3 acceptance remain pending. |
| Navigation F10 | iOS icon-only routes, native blur, full-screen map and unobscured Incidents Report button verified. Android runtime/extended display checks deferred by user. |
| Submission policy I13 | Complete: no hourly limit/cooldown; 12-report and repeated immediate-update regressions pass. Convex development deployment verified. |
| Main product flows | Official alerts, shelters, provider workers, chat and release acceptance pending. |

Primary onboarding actions now stay pinned above the bottom safe area while content scrolls. Latest mobile checkpoint: 111 tests, strict typecheck/lint, Convex development deployment and Android/iOS/web exports pass. Report/detail and initial 5-km map/list are connected; two-account device submission and complete crisis workflows remain pending.

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

- [x] DOC01 Create root context.md with product decisions, current implementation, runtime/configuration references, verified limitations and next actions; link it from agent entry instructions. Keep it current without credentials.

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
- [x] F10 Build floating frosted bottom navigation for Map, Incidents, Shelters, Nearby chat and Settings; verify correct icon-only routes, iOS native blur and unobscured Report actions. Extended responsiveness/accessibility and Android runtime checks deferred per user priority. Owner B.

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
- [x] I07 Enforce proximity/fix quality and <=24-hour observed-time validation. Incident creation/updates have no rate limit or cooldown per 2026-10-10 user override. Owner A.
- [ ] I14 Present similar incident suggestions automatically in a popup, require existing/new-event choice, and allow reviewing again without losing the report draft. Owner B. Implemented; actual iOS popup rendering verified at 09:36 (tmp/ios-modal-check-start.png). Selection, dismissal/reopen and draft-preservation interaction checks remain pending.
- [x] I15 End successful submissions with a clear saved screen and primary Back to map action; remove repeat-contribution CTA from that receipt screen. On ordinary detail, identify an authenticated user's existing contribution as Update my observation. Owner B. Component regression tests, per-user backend eligibility test and iOS saved-screen rendering verified; see 2026-10-10 progress note.
- [x] I13 Remove all incident creation/corroboration rate limits and submission cooldowns; prove >5 reports/hour and immediate repeated updates, preserving one witness per person and exact command replay. Owner A.
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
- [ ] A07 Shelter maintenance: open/closed/full/unknown, fresh confirmation, capacity, accessibility, facilities, contact and archive. Owners A/D. Backend and authority forms implemented; 14 backend + 5 form checks pass (09:55). Approved-account native workflow remains pending; no LIVE shelter was fabricated.
- [ ] A08 Contact maintenance with jurisdiction/source and over-30-day age label. Owners A/D.
- [x] A09 Select raw nearest listed shelter within 50 km by straight-line distance. User override 2026-10-10 removes eligibility filtering; show status, confirmation age and DEMO attribution separately. Backend ordering/DEMO regression and emergency shelter-action component tests pass.
- [ ] A10 Shelter list/detail shows excluded reasons, status ages and distance; external Google Maps/copy/dialer fallbacks. Owner B. Detail/actions implemented and backend/component checks pass (142 total tests at 10:00); iOS clipboard rebuild running. Known status/access limitations are shown; hazard-based eligibility exclusions are superseded by the raw-nearest user override.
- [ ] A11 Audit authority changes; reject revoked/cross-jurisdiction access and stale concurrent writes. Owner A, D verifies.

**Done when:** Publish with Jev unavailable: the official alert/source/revision and expansion job commit immediately. Reject a cross-jurisdiction edit. Demonstrate stay-put, no eligible shelter, and full/stale/unsafe shelter exclusions. Delivery becomes visible in M5.


## M5 — Deliver a translated, targeted official alert

**Goal:** Complete the first working checkpoint: the correct tourist receives an official emergency, original/translation and an eligible shelter.

**Depends on:** M2 device/location registration, M4 publication/shelters and its N04 durable publication contract; P08 Translation access and APNs/FCM configuration.

**Design reference:** Technical plan §§8, 14–18, 22.

- [x] N01 Google Translation backend adapter with scoped server authentication and version/hash/language cache. Owner C. Verified 2026-10-10: fixed-origin key-header adapter, durable deduplicated instruction/version/hash/language jobs, lease fencing, retry recovery; ten real translations READY.
- [ ] N02 Show originals immediately; prefer exact-version official translations, otherwise show machine-translation status. Invalidate obsolete translations and provide reviewed localized labels while translation is pending. Owner C.
- [ ] N03 Review static UI/templates in all six languages; test names/numbers/deadlines/negation and instruction strength. Owners B/C/D.
- [x] N05 Target <=30-minute, <=1-km-accuracy Indian positions including uncertainty overlap; new entry into ongoing emergency triggers eligibility. Owner A. Backend publication/movement shared gate and location-revision-fenced paginated reconciliation verified with entry/exit/duplicates/old-task tests (2026-10-10). Physical delivery remains N06/N10.
- [ ] N06 DEFERRED by user 2026-10-10: native permission/APNs/FCM/Expo push and closed-app delivery. Current notification scope is Convex real-time targeting + global custom in-app controller.
- [ ] N07 Foreground full-screen alert, one-at-a-time severity/source ordering, actions and silent reopen/dismissed yellow banner. Owner B.
- [ ] N08 Implement material-update sound rules, ten-minute repeat limit/Critical exception, exit/re-entry and quiet ending/correction follow-ups. Owners A/B/C.
- [ ] N09 Deep links open current incident/alert revision; language changes do not replay sounds. Owner B.
- [ ] N10 Verify preferred-language real-time receive/open across two authenticated foreground clients under latest user in-app-only scope. Test inside/outside, stale GPS, DEMO opt-in, dismissal and reopening. Native push ticket/receipt gates deferred. Owner D.

**Done when (latest in-app-only scope):** Use two open authenticated clients at inside/outside positions to verify live publication and targeting; separately test stale/inaccurate positions. Prove global foreground receive/open, original fallback on translation failure, material-update sound rules and silent reopen. Complete all six languages before release. Closed-app/native-push delivery is deferred.


## M6 — Add official feeds, weather and automatic Jev qualification

**Goal:** A tourist incident uses fresh source-backed evidence to become notifiable, not qualified or insufficient evidence without masquerading as an official declaration.

**Depends on:** M3 evidence records and M5 working delivery. P05 weather entitlement, P06 real SACHET fields and P07 Jev contracts/evaluation are gates for their adapters.

**Design reference:** Technical plan §§10–14, 21–24.

- [x] E01 Implement bounded CAP/RSS parser, source directory configuration, timeouts and per-feed status. Owner C.
- [ ] E02 Normalize warning geometry/provenance/originals, references, revisions, cancellations, advisory versus urgent declaration. Owner C.
- [ ] E03 Poll at two-minute target; reject test/exercise/private notices and irrelevant state-only matching. Owner C.
- [ ] E04 Implement AccuWeather location-key/current/24-hour adapters with allowed caching, quota and freshness handling. Owner C.
- [ ] E05 Build versioned evidence bundle with recent witnesses, weather, relevant SACHET, twelve-month nearby incident history, unknowns/contradictions; no news. Owner C.
- [ ] E06 Implement bounded Jev judgments and normalized outcomes; separate severity/option probability/model confidence. Owner C.
- [x] E07 Accept automatic NOTIFIABLE_EMERGENCY only at option probability >=0.90; recheck current evidence/version and authority suppression. Owners A/C.
- [ ] E08 Reassess on meaningful changes and five-minute target; outage retries at 1/5/15 minutes then every 15. Owner C.
- [ ] E09 Preserve active emergencies on negative result/outage; route changed assessment to authority review without all-clear. Owners A/C.
- [x] E10 Assemble source-backed evidence summaries without asking Jev to generate prose or instructions. Owner C.
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

1. Finish I14 native selection, dismissal/reopen and draft-preservation checks. Report actions above floating navigation are verified on iOS; keep simulator default fonts. Functionality precedes extended responsiveness/accessibility polish per user instruction.
2. Verify I05/I11 on iOS: submit/open receipt, two-account contribution and source/evidence detail.
3. Finish I06/I08/I12: scalable independent counts, correction/withdrawal/history and lifecycle checks.
4. Continue M4 official publication/shelters and M5 delivery; focus iOS native checks now; Android runtime is deferred by user instruction.

## Deliberately deferred or excluded

Downloaded basemaps, offline routing, automatically queued offline reports and a fully offline crisis experience are deferred by the user. News ingestion is removed. Rescue dispatch/SOS, family tracking, media reports, chat attachments/DMs, shelter reservations and a full web crisis app remain excluded. The web deliverable is a public landing page. These exclusions do not remove chat, authority workflows, six languages or either native platform.

## Evidence and progress format

For each task record: **task ID → behavior demonstrated → check/result → build/commit/device → blocker or limitation → next action**. Record provider access, model decision quality, server publication, push ticket/receipt and human app-open as different claims. A failed milestone stays open.

Do not commit keys, .env.local or private tourist data. Do not lower the Jev threshold, fake weather, bypass location rules or relabel fixtures to make a demonstration pass. Only an explicit user decision changes the core product scope.

### Authority email configuration checkpoint — 2026-10-10 10:12 IST

- [x] Add backend-only comma-separated verified Google authority emails, audited scoped synchronization, removal/revocation enforcement, login refresh and manual Settings refresh. Six new backend tests pass; complete suite 148 tests, strict TypeScript and lint pass. Configuration helper applied empty email list and isolated Chennai DEMO scope to Denoise Labs GudTour deployment. User adds their emails privately using docs/api-setup.md.
- [ ] Approved-account iOS authority/shelter acceptance: pending user-provided allowlist emails and fresh Google sign-in. A07/A10 remain partial; hazard recommendation A09 is unfinished.

### Session UX fixes — 2026-10-10 10:18 IST

- [x] F11 Stop reactive profile updates from restarting “Stay informed nearby” GPS/navigation. Two component regression checks cover repeated query updates and explicit permission action.
- [x] F12 Complete sign-out before clearing in-memory location; route to login without onboarding bounce. Settings ends with a red scrolling Sign out button (not pinned), retaining shared measured navbar clearance. Three component checks cover both logout entry points, ordering and storage failure. Actual user-device interaction remains to be rechecked.
- A04/N04 backend publication progress: declarations.publish atomically stores original instruction/hash, attributed source, immutable revision and bounded union-area targeting job, bypassing Jev. Four backend tests cover exact retries, forbidden/invalid publication, concurrent sources and revision conflict. UI, updates/withdrawal and recipient worker remain unfinished; these composite tasks stay open.

### Authority workspace continuation — 2026-10-10 10:25 IST

- Authority access diagnosis: backend verified one configured account has verified Google email and an active scoped membership. The perceived tourist-only UI was discoverability: added map workspace entry, visible Settings role and authority-first location-completion routing.
- A01 in progress: clean scoped dashboard now matches tourist palette/default typography/cards and exposes declaration/shelter actions; emergency/review queues still pending.
- A03 in progress: circular-area emergency form plus explicit review modal and saved completion screen; original language/action/severity/review time supported, exact retry on uncertain transport. Named shelter/deadline and polygon editor still pending. Two component tests cover review-before-publication and frozen exact retry; dashboard and role-routing tests added.
- Native screenshot tmp/ios-authority-workspace.png confirms authenticated declaration form rendering (user was interacting; no automated publication claimed). No backend incident was fabricated.

### Affected-location picker and targeting progress — 2026-10-10 10:29 IST

- A03 user UX override implemented: no editable latitude/longitude fields in declaration form. Select affected location opens a native map modal; tap/drag pin, preview radius, confirm selection or cancel without overwriting. Current location is a separate explicit action. Component tests cover selection, cancellation and exact publication retry.
- N04 now has checkpointed 25-recipient pages, indexed geographic-prefix candidates, fresh exact geometry/uncertainty checks, DEMO isolation, deduplicated private exposure/userAlert writes, supersession and scheduled recovery. Eight worker tests include >one-page recipients. Push jobs/device delivery, movement-entry checks, merges and full sound policy remain unfinished; N04 stays open.

### Logout regression follow-up — 2026-10-10 10:35 IST

- User reported the location-page loop persisted; F12 reopened for actual native confirmation. The earlier ordering-only fix was insufficient.
- Added explicit session logout intent suppressing login/location auto-entry until successful deliberate Google sign-in. Navigation guards run only while their screen is focused; signed-out guards point to login, not the location prompt. GPS requests carry a focus generation and cannot restore location or navigate after blur/unmount.
- New integrated Settings→Login test retains real LocationSession state while server auth is deliberately still true; it proves no redirect back to location, including subsequent signed-out rerender. Location tests cover late completion after unmount and no auto GPS after explicit logout.173 tests/26files plus typecheck/lint pass. User-device logout interaction still requires confirmation before F12 can be checked.

### 2026-10-10 shelter location and validation checkpoint
- User confirmed logout stays on login; F12 native confirmation obtained, superseding earlier pending notes.
- Shelter entrance map picker added: tap/drag pin, current location, explicit apply/cancel, no coordinate inputs. Existing location preserved on cancel. A07 remains partial until complete native shelter acceptance.
- Shelter save log identified name text validation failure. Added field-specific minimum-length validation for name (2) and address (3), preserving the draft instead of making a rejected server request.

## Tourist alert read/UI checkpoint — 2026-10-10 10:48 IST
- Convex dev --once completed successfully at10:48:05 against denoise-labs:gudtour basic-newt-690. Includes alerts.active, alerts.detail and alerts.dismiss plus targeting worker/recovery cron. No LIVE/DEMO disaster fabricated in shared backend.
- Tourist map/incidents now render private exact-location alerts, focused attention modal, persistent warning after dismissal, and /alert/[id] separately attributed exact original instructions/deadlines/review-overdue notices. Translation explicitly pending. Client timer expires location-based banners after30min. Full-screen severity ordering/yellow dismissed styling, sound, movement entry and actualpush remain unfinished; N02/N07/N09 remain partial.
-179tests/27files, strict TS/lint pass; backend tests prove session isolation, currentrevision acknowledgement, original preservation, DEMO gate and changed geographic relevance. Component test proves popup dismissal retains instruction access. iOSexport tmp/ios-emergency-export completed exit0. Native alert interaction not yet verified. New backend reads/UI uncommitted; preserve independentweb/.

## Existing-incident emergency promotion — 2026-10-10
- Declare emergency now offers Select existing incident with bounded paginated candidates from the exact assigned jurisdiction/audience, active circular incident areas only. Selection seeds hazard/locality/affected center/radius; hazard locked for existing event, emergency radius remains editable with backend containment enforcement. Explicit new-incident option retained. Reviewed command carries selected incidentId and expectedIncidentRevision; stale edits rejected, uncertain retries retain exact body.
- Backend authority.declarationCandidates deployed to basic-newt-690. Form regression proves existing identity/revision; isolated backend test proves promotion leaves one incident/one alert and excludes resolved incidents.182tests/28files and strictTS/lint pass. New labels machine-translated six languages, human review pending. Native picker interaction not yet verified.
- Alert review also added deterministic critical-first order, full-screen attention modal, warning-colored dismissed banner and client ticking detail freshness/review deadlines. Full delivery/sound/translation remain pending; do not mark complete.

## Remove change-reason forms — 2026-10-10
User override: no reason-for-change field anywhere in app. Removed it from shelter create/edit/archive and emergency declaration, including client minimum-length gates. Backend accepts absent legacy reason and emits automatic audit descriptions; optional reason retained for backwards-compatible old clients, no user explanation required. Backend fixtures now save/publish without reasons, form test proves absence.183tests/28files, TS/lint pass; Convex deployed (tmp/no-reason-deploy.log). Previous checkpoint eafa9ad pushed main. Independent web/ preserved. Translation adapter work has not started; user steering took priority.

## Translation adapter foundation — 2026-10-10 10:55 IST
- Added convex/providers/googleTranslation.ts fixed-origin server-only Basicv2 adapter with header credential, bounded original input/output,15s timeout, structured response validation, sanitized errors and plain-text entity decode. Same-language returns exact original without provider call. Numeric-token multiset and explicitly protected-term checks flag detectable alterations; requiresHumanReview always true for machineoutput. These checks do not prove negation/action equivalence.
- Six adapter tests plus full189tests/29files, strictTS/lint pass. No app dynamic translation job/cache/UI pipeline yet; N01/N02 remain open. Adapter not deployed as callable public function. Existingalert reads remain original-only. Next implement immutable instruction/hash/language cache, dedup durable jobs/retry and internal action completion guards, then labeled translated display. Do not claim emergency translation works from adapter tests alone.
- Last pushedcommit eafa9ad; no-reason forms/backend changes and adapter remain uncommitted. No-reason Convex deployment and ios export succeeded. Preserve independentweb/.

## Koodhiyur heatwave visibility diagnosis — 2026-10-10 11:00 IST
- Inspected actual development database using sanitized aggregate output (no account emails/positions printed). Koodhiyur HEATWAVE ACTIVE, DEMO, alertACTIVErev2; expansion revisions1/2 DONE with zero exposures. Both current accounts demoEnabledfalse, foregroundgranted/admitted, fresh3–4min/5maccuracy, inside1kmarea. Two displayed community reports are LIVE. Primary missingalert cause is deliberate DEMOgate, not model/weather or GPS.
- Added Settings explicit enable/disable DEMO alerts and session-owned profiles.setDemoEnabled. Opt-in triggers bounded paginated demoCatchup rescheduling current expansion with checkpoint fence; opt-out readgatehidesexistingexposures. Test verifies opt-in catches existing event and opt-out hides. No accounts auto-enabled, no DEMO→LIVE conversion.
- Also fixed future new circular official publications missing geoPoints mapindex. Added internal idempotent operator.repairOfficialMapIndex; targeted actualKoodhiyur repair started exec36369, poll before claiming successful. Currentbackend deploy11:00:07 succeeded.190tests/29files, strictTS/lint and iOSexport29045 completedsuccessfully. DEMOlabels translatedsixlanguages (humanreviewpending).
- Translationpipeline scaffold now instructionTranslations table, internalclaim/finish/run/resume, threeattempts/leasefence/exactactiveinstructionhash checks, publicationenqueuefivelanguages, minute recovery. Deployed withvisibilityfix but pipeline/cache tests and UIread/displaypending; not claimfulltranslationcomplete. Codeatconvex/translations.ts, no publicprovideraction.
- Worktreeuncommitted atop eafa9ad; no-reasonchanges+translationadapter/pipeline+DEMOvisibility. Preserveindependentweb/. User can test Settings→EnableDEMOalerts, remainingmainproductgoalactive.

## Translation cache/display verified — 2026-10-10 11:03 IST
- Deployed translations pipeline+alerts.detail current preferred-language DTO at11:02:44. READY exact-version/hash machine translations appear alongside original; FLAGGED/FAILED translations withheld, explicit fallback; never authority-reviewed label. Completion does not incrementalertrevision orreplayattention. Internal enqueueExisting backfilledtwoexistingactiveoriginals withoutchangingevents; tenjobs hi/ta/fr/de/es allREADYonfirstattempt, no numericissues. Providertextnotprinted/readout onlystatus metadata.
- N01 checked with adapter/cache/backend/liveprovider evidence. N02/N03 remainpartial: exactofficialtranslation support, semanticreview/fixtures and authorityapprovalworkflow pending. Currentintegritychecks numericmultiset only; no claimofpreservednegation/actionstrength/place names. Fullproductstillunfinished.
- Fourpipelinebackendtests cover dedup/lease, boundedretry+latecompletion, withdrawnoriginal+numericflag, exacthash/preferred-language+noattentionreplay.194tests/29files+strictTS/lint pass; finaladdedduplicateenqueueassertion checkrunning39945. iOStranslationexport46036 completedexit0.
- Completeduserchange-reasonremoval+DEMOoptin/catchup+translationcache/display readyforreviewedcheckpoint. Independentweb/untouched. Latestpushed eafa9ad untilnewcommit.

## Movement eligibility — 2026-10-10 11:05 IST
- Added internal locationAlerts.reconcile on every accepted locations.update. Bounded20-activealert pages, queuedcontinuations, user/locationrevisionfence; newerGPS invalidatesoldwork. Shared lib/targetRecipient.ts is used bypublication worker and movement: exact currentIndia/admission/permission/30min/1km/uncertainty/DEMOchecks, private deduplicated exposures/userAlerts, exit relevancecleared. Existing dismissedrev/soundepoch preserved; nofullreentry/materialsoundpolicy claimed.
- Regression test proves initiallyoutside→insideongoingalert, repeatedreconciliationwithoutduplicates, exitclearsrelevance, oldqueuedlocationtaskcannotrestoreit.195tests/29files+strictTS/lint pass. N05backendeligibilitychecked; actualdevices/pushremainN06/N10. Fullactive-alertscanisboundedperpagebutneedsgeographicindexoptimizationforlargeproductionvolume.
- Deployment tmp/location-alerts-deploy.log exec99358; pollbeforeclaimingready. No nativecode/deps changed. Lastpushed5e8759c (translation/DEMO/no-reasoncheckpoint); movementchangesuncommitted. Independentweb/untouched. Fullproductgoalactive; nextdelivery/sound/authorityupdates/provideringestionstillpending.

## Latest notification scope/global controller — 2026-10-10 11:09 IST
- User initiallyaskednotificationpermission/tasks, then explicitlyoverrode: ignore native notifications, usecustomin-apprealtimewhenanotherclientappopen. No newnativepermission/deviceregistration/pushsender implemented. EAS/APNsquestion resolvedbyoverride; nofurthercredentialsneededforthisscope. CorePLAN/technicalplan/techstackbannerandN06recordscopeoverride; historicalpushdetailsfutureonly.
- GlobalEmergencyNotifications nowmountedinsideLocationSessionalongsideNavigation. OneglobalmodalcontrollerusesConvexalerts.active subscription. Map/incidentscomponentsdisplaypersistentcardswithouttheirpreviousper-tabmodal. AppStateforeground+eligiblepathguard suppresseslogin/onboarding/detail/background; defaultfonts. Localhiddenkeysandserverdismissedrevisionkeeppopupsfromlooping. RootNotificationBoundaryisolatesprotected-readerrorsinsteadreplacingnavigation; resetswithfreshfix/signout. Currentlimitation: transientglobalreaderrorcanremainquietuntilfix/sessionreset; normalpagequeriesstillproviderecovery.
- Publicationatomicexpansion→privateexposures→Convexreactivequeryupdates; exactarea/freshness/DEMOgatesretained. No claimclosed-appdelivery. ComponentregressionreactsfromnoalerttonewalertwhileSettingsopen, background/foregroundandloginvisibility.196tests/29files+strictTS/lint pass; nativecross-clientrealtimeinteractionnotyetverified.
- Movementbackenddeploy11:05:46 ready. Lastpushed5e8759c; movement/globalcontroller/docsuncommitted. Independentweb/untouched. Fullproductgoalstillactive.

## Official emergency presentation checkpoint — 2026-10-10 11:11 IST
- PublicIncident DTO now separates officialEmergency summary from Jevqualification. freshIncidentDTO reads currentactivealertsnapshot, retains officialACTIVE presentation even after reviewdue ratherthan hidingdanger; originalinstructiondetail still flagsreviewoverdue. incidentcard/detail shows emergencyactive insteadassessmentpending, native map redareas/pins forofficialactive. qualification unchanged(null forofficial); nevermodelqualificationfabricated.
- Backend regression verifies officialstatus in detail+nearby while staleAtpast andqualificationnull.197tests/29files, strictTS/lint pass. Backenddeploy93083 logtmp/official-status-deploy.log and iOSexport23499 logtmp/ios-official-status-export.log running; pollbeforeclaimingready.
- Currentwork includes3featureincrements: movementreconciliation, globalinappnotificationcontroller perlatestuseroverride, officialemergencypresentation. Review+commitcheckpointdue afterverification. N07/N10stillneedactualtwo-clientnativeinteraction; physicalOSpushdeferredbyuser. Fullremainingauthorityupdate/withdrawal, providers/Jev/SACHET, sheltersguidance/chat/releasepending. Lastpushed5e8759c. Independentweb/untouched.

## Resumed: authority declaration management — 2026-10-10 11:20 IST
User explicitlyresumedimplementationafterpause. Added /authority/emergencies viaauthoritydashboard scopedaction. declarations.managed paginatedassignedagency/geometry/audience activeoriginals; declarations.end CAS+idempotency handlesWITHDRAWN/RESOLVED/FALSE_ALERT withoutreasonfield. Ends onlychosenagencydeclarationsource; atomicallycreatesSILENTENDING/CORRECTIONalertrevision, retainsotheractivesources+strongestseverity+newtargetingjob, endsalertonlywhennosourcesremain. Exactoriginalinstructionshistoryretained; detailincludesinactiveoriginalswithno-all-clearlabel. Noactualshareddeclarationwasendedfortesting.
- Managerrequiresconfirmmodal, freezesunknowntransportexactbody/retry, blocksnewnavigationwhileuncertain, savedstate. Sixlanguagemachinelabels added(humanreviewpending).
-199tests/30files+strictTS/lint pass. Sourceendingbackendregression covers2sources,logicalretry,staleCAS,finalendingandcorrection. Componentregression coversexplicitconfirm/frozenretry. Dashboardroutingtestupdated. Initialiosmanagementexport88498passed; finalafterlocalizationexport runninglogtmp/ios-emergency-management-final.log. Convexdeploy56116logtmp/declaration-management-deploy.log; pollbeforeclaimingready.
- A06stillpartial: touristquietending/correctionfollow-upsnotyetconnected; declarationinstructionupdate/editorstillpendingnext. Currentworkuncommitted atopb8e1529, independentweb/untouched. Fullgoalactive, no nativepushrequested(currentinapp-onlyscope).

## Tourist correction/ending follow-ups — 2026-10-10 11:27 IST
- alerts.active now returns own bounded historicalexposure ending/correction updates independentlyofcurrentarea overlap. Apreviouslytargetedaccountafterexit stillreceives sourcechange; DEMO/account/Indiaaccessgates remain. Activeemergencyitems still requirefreshcurrentexactarea. Quietupdates acknowledgedbyspecificcurrentrevision, no sound ormodelqualificationchanges. APIpartialflag coversbounded21exposures.
- Globalcontroller prioritizescurrenturgentemergency thenquietupdate; correctiondistinctwarningtitle/no-all-clearcopy, currentinstructionhistoryaction, ifothersourcesactive explicitlystatesremaininginstructions. Map/incidentsquietupdatecards alsoavailableuntilserverack. Originalnoticehistoryfrompreviouscheckpointretained.
- Newbackendtest proves exitedrecipientgetsFALSE_ALERTcorrection andackremovesit; componenttest provesdistincttitle/currentrevisionack.201tests/30files+strictTS/lintpass. Convexdeploy32603 logtmp/correction-followup-deploy.log andiOSexport logtmp/ios-correction-followup-export.log running; pollbeforeclaimingready. Native2clientinteractionstillpending.
- Instructionupdateeditorstillnext; A06remainscompositepartial untilincidentreject/correctionworkflowfullyhandled. Workuncommitted atopb8e1529 includesauthoritymanagement+sourceend+correctionfollowups. Preserveindependentweb/. Fullgoalactive.


### 2026-10-10 — core functionality checkpoint: SACHET ingestion
- User deferred instruction editing/polish and requested app completion first. Minimal mandatory ETag reuse remains inside the fetcher; no cache-management UI was added.
- E01 complete: trusted all-India discovery, bounded RSS/CAP/polygon XML, fixed HTTPS origins/paths, 15-second transport timeout, size/depth/geometry limits, DTD rejection, exact original fields and durable per-document freshness/errors/backoff/lease fences.
- E02/E03 partial: immutable revisions, explicit Update/Cancel reference tombstones including reversed arrival, Actual/Public eligibility, two-minute recovery cron and exact source-area evidence lookup. Separately fetched polygon identity is bound to CAP identity; numeric fetch tokens differ from CAP identifiers. Expired/future-effective and unresolved area-name-only notices are excluded from current evidence. Source warning classification/publication integration remains pending; no automatic emergency or all-clear from import.
- 214 tests/31 files plus strict TypeScript/lint pass. New tests cover real provider CAP/polygon fixtures, 304 reuse, bad replacements, cancellation-before-original, test cancellation, source geography/expiry and stale worker fencing. Convex deployed 11:40:49 IST. First live snapshot:132 documents discovered,32 notices imported,33 successful documents,zero errors; ingestion continued afterward. Native two-client acceptance remains pending.
- Android Expo Go OAuth fix committed/pushed fa0c946; runtime callback shared throughout login, exact backend allowlist configured privately, Metro now Expo Go over LAN. User will test another Android device. See docs/progress/2026-10-10-expo-go-auth.md.
- Three implementation increments ready for checkpoint: authority source ending, quiet correction follow-ups, SACHET ingestion. Next: AccuWeather evidence, Jev assessment/application, then shelter guidance/contacts/chat. Instruction editing remains deferred by user.


## 2026-10-10 — weather, decision adapter and evidence construction checkpoint
- Weather provider adapter: fixed HTTPS Bearer authentication; current and optional24-hour history normalized with explicit units/null unknowns. Shared10-minute rounded-area cache, single-flight lease/generation fences, default100 reserved providercalls/day configurable ACCUWEATHER_DAILY_CALL_LIMIT, one-hour cache expiry/cleanup. These controls do not rate-limit incident submission. Current data survives missing history;403/config,429/retry-after and transport failures remain distinct. Provider entitlement/retention review remains open; E04 partial.
- Live internal weather.context Chennai test: AVAILABLE, fresh, City resolution, history AVAILABLE with24samples. No full provider payload retained. Deployed11:45:34.
- Jev adapter: fixedOpenCodeZen jev-1.13, bounded two-stage Choice calls; complete distributions/type/model/choice validation; selected-option probability independentofconfidence; no generated instructions. Live three-case smoke: missing evidence→INSUFFICIENT0.99; fresh synthetic life-threatening flood→NOTIFIABLE0.97; historical minor report expectedNOT_QUALIFIED but model conservatively returnedINSUFFICIENT0.72. This is not a calibrated evaluation; gate remains open. E06partial, noautomaticpublicationworker yet.
- Evidence builder: internal source-backed recent independent samples/counts, ten-kilometre/twelve-month boundedhistory, current/historyweather, exactmatchedSACHET originals, missing-input/truncation/provenance labels. No authoridentity/alias/privatewitnesscoordinates/health/contact/device/chat fields. Immutablehash snapshots fence incident/control/evidence revisions; fetch-time noise excluded fromhash. Communityclosed/official-onlyevents excluded. Authoritysuppression/priorassessmentintegration and automatedpublication pending; E05partial.
- Final SACHET ingestion progressed to99CAPnotices/199documents. Later snapshot170successfuldocuments;29polygon documents rejected (5oversize,24fetch/geometry failures), retained pending geography, not invented targets. Earlier zero-error claim was only first32notice snapshot. Sourceingestion is not complete emergencyinterpretation.
- User is testingAndroidExpoGo separately; leave runtime/device testing to them. CurrentMetro exec9354 LANExpoGo; noAndroidsim opened. Next core step: durable assessment jobs, authoritysuppression/late-result guards and reuse existing recipient publication. Then shelterguidance/contact/chat. Instructionediting andpolish deferred.


## 2026-10-10 — durable assessment and public evidence checkpoint
- Three implementation increments: (1) durable Jev assessment queue, claim/lease recovery, retry and atomic publication through existing exact-area recipient expansion; (2) authority false-alert control fencing and 30-minute automatic suppression; (3) curated tourist evidence summaries and community alert detail behavior.
- Automatic qualification requires selected-option probability >=0.90, independently of model confidence. Application rechecks incident/evidence/control revisions, snapshot age, witness counts and included official-source freshness. Repeated unchanged acceptance does not republish. Negative assessments/outages preserve active warnings and request review; model decisions never change authority verification or generate evacuation instructions.
- Concurrency capped at two model jobs. Default JEV_DAILY_CALL_LIMIT=100 reserves two calls per assessment; provider outages retry at 1/5/15 minutes, then 15 minutes. This is a call budget, not a dollar spend ceiling. No incident submission limit was introduced. Malformed/configuration failures await changed evidence; operator retry UI remains unfinished.
- Rubric v2 direct synthetic provider checks: missing evidence -> INSUFFICIENT 1.00; life-threatening flood -> NOTIFIABLE 0.94; explicitly refuted report -> NOT_QUALIFIED 0.72. Historical minor-report expected-negative case still returned INSUFFICIENT 0.54. This is smoke evidence, not calibrated or held-out decision-quality validation.
- Deployed worker status inspected: two existing community jobs DONE, latest outcomes both INSUFFICIENT_EVIDENCE, no provider errors. No synthetic app emergency was published. Final backend deployment and test/export logs are under ignored tmp/assessment-* and tmp/ios-assessment-verified-export.log.
- Curated evidence UI shows assessment time, weather, issuing sources and missing/stale evidence without private witness identity or raw model context. Community alerts have no official instruction translation job; regression fix removes their misleading pending-translation label. Six-language new copy is machine translated, human review pending.
- Review aligned false-alert suppression with PLAN's 30-minute default. Dedicated authority suppression/review UI, immediate source-change fanout, full provider evaluation, shelter recommendations/contacts, chat, recovery/privacy and native/two-client release acceptance remain unfinished. User handles Android Expo Go testing; preserve LAN runtime and independent web/ work.

Verification: 245 tests/36 files, strict TypeScript and lint pass; corrected iOS bundle export succeeds. Native interaction and two-client acceptance remain unverified.


## 2026-10-10 12:11 IST — latest continuation state
- Assessment/evidence checkpoint committed and pushed as b998284; Convex ready12:08:50. Full checkpoint tests245/245 and iOS export succeeded. Supersedes previous uncommitted/provider-only notes.
- Started next shelter recommendation increment: src/domain/shelterEligibility.ts and tests/shelterEligibility.test.ts are UNCOMMITTED. Pure rules cover open/fresh/not-full, 50km range, hazard exclusion, incomplete hazard context, fresh location, step-free needs and official instruction precedence. Deterministic nearest/freshest/name ordering; unknown capacity remains unknown. 248 tests/37files + strict TS/lint pass.
- This helper is NOT connected to Convex/public screens yet. A09 remains unchecked. Next: bounded complete hazard context (community, active alerts, official warnings), preserve applicable official instruction precedence, expose eligibility/exclusion DTOs and reactive recommended shelter UI, then contact maintenance. Do not claim working shelter recommendations from helper tests. Preserve independent web/. No new dependencies/native APIs added.


## 2026-10-10 — raw nearest shelter and DEMO visibility
- User explicitly says ignore shelter eligibility and use raw nearest shelter. Removed the uncommitted eligibility helper/tests, superseding12:11 notes. Core/technical/stack documents carry override banners. No status/accessibility/hazard filtering controls selection; display maintained facts separately.
- Diagnosed actual saved shelter ABCDEFGHIAJ: OPEN, DEMO, not archived, within roughly100m of both saved client positions. Both profiles have DEMO opt-in enabled. Cause was hardcoded LIVE-only filter in shelters.nearby, unlike shelter detail's existing DEMO gate.
- Nearby now includes DEMO only for explicitly opted-in profiles, preserves agency-active/audience/archived checks, sorts by straight-line distance before clipping to30 results, and returns nearestId. Bounded100-per-cell lookup exposes partial results. Closed/full/unknown shelters are not filtered from raw distance order. Opt-out immediately hides DEMO again. No profile/authority/location data was altered for diagnosis.
- Tourist list labels nearest and DEMO; alert detail adds nearest listed shelter status/distance and detail action, retaining official instructions above. Removed obsolete pending-eligibility message from shelter detail. Nearest label supports all six languages. No new dependencies/native APIs.
- Convex deployed12:14:08;248tests/37files+strictTS/lint pass. Backend tests cover DEMO opt-in/out and raw distance even when nearest is closed; component test covers DEMO/status and destination action. iOS export and live authenticated read verification running in tmp/ios-nearest-shelter-export.log (exec41895). Next inspect same process; do not restart blindly.
- Three increments this checkpoint: DEMO visibility repair, raw nearest backend/list, emergency nearest-shelter CTA. Review/commit/push after export/live verification. Preserve independent web/. No native/two-client UI acceptance claim.

Verified continuation: live session-scoped shelters.nearby reads for both existing clients return exactly one DEMO shelter, ABCDEFGHIAJ, as nearestId, partial=false. iOS export tmp/ios-nearest-shelter-export completed successfully. No settings or records modified during live diagnosis.


## 2026-10-10 — SACHET browsing and authority decision review
- User requested SACHET latest alerts and View reports in Authority workspace, with Jev decision and the context it received. Removed large access-active/ready card. Open workspace from map authority button or Settings. SACHET also linked from map, Incidents and Settings; bottom navigation remains five icon-only destinations.
- SACHET public read model lists newest active eligible CAP notices across India, with original issuer/language, severity, area labels, dates, expiry and feed check status. Detail preserves all same-language CAP info blocks and original instructions; preferred published language falls back to English, then original. Expired and superseded detail has explicit historical labels; no false all-clear or inferred geographic applicability. Original CAP XML action uses stored trusted source URL. Feed ingestion and required conditional cache behavior unchanged.
- Authority report list is paginated and checks exact assigned jurisdiction and full incident geometry. LIVE and DEMO views are separate. DEMO authorities may inspect LIVE evidence in their assigned geography, but this read access does not grant LIVE declaration/verification/shelter writes. DEMO report access remains DEMO-scope-only. Detail returns sanitized saved model input, original Jev qualification versus backend-applied outcome, selected probability versus confidence, stage-one judgments, timestamp/model/rubric, worker state and changed-evidence label. Expand shows stage1 {policy,evidence} and stage2 {evidence,judgments}; model question templates are not included in this state display. No witness identities/private origin coordinates/profile data exposed.
- Existing official declarations without assessment are labeled as bypassing Jev. Report history review is read-only; verify/merge/manual suppression controls remain unfinished. SACHET browsing does not itself auto-publish feed emergencies; E02/E03 urgent interpretation remains unfinished.
- Emergency contacts were explicitly deferred by user. All temporary contact implementation files and their schema/generated changes were removed; no contact data was created. The user paused general development for Jev testing, then explicitly authorized these pages; do not automatically resume unrelated chat/contact work.
- Backend deployed to Denoise Labs GudTour basic-newt-690 at12:38:06; iOS export tmp/ios-sachet-reports-final-export succeeded. Tests cover eligible/expired/superseded/language fallback/multiple original CAP blocks, tourist/revoked/unassigned authority rejection, exact model context and evidence versions, DEMO authority LIVE read-only behavior, original notice UI and workspace links. Six-language static copy machine translated; human language review and native page interactions unverified.
- Live SACHET query returned15 newest notices including Rajasthan-SDMA and IMD-Chennai, feed healthy. Final LIVE authority report read verification logged separately; inspect its result before claiming actual cyclone visibility.

- [x] E12 Add formatted latest SACHET notices and full original notice detail with issuer, geography labels, published language, timestamps and stale/expired/superseded states; source XML action and backend/component regressions verified.
- [x] E13 Add jurisdiction-bound authority reports and saved Jev context/decision review with separate LIVE/DEMO views, original decision/applied outcome, evidence and version labels; read-only LIVE access does not grant DEMO authorities LIVE publication rights.
- [x] F13 Put SACHET and View reports in authority workspace and remove large access-active card; navigation regression verified.

Final verification:254tests/41files, strictTypeScript/lint and git diff check pass. Live DEMO-authority LIVE view returns CYCLONE and FLASH_FLOOD; cyclone decision INSUFFICIENT_EVIDENCE, saved counts2recent/2total, currentEvidence=true, canDeclare=false. Source feed/read-only decision inspection caused no incident or profile mutations. Native interactions remain unverified. Three requested-page increments ready for reviewed commit/push.


## 2026-10-10 — production Android testing release
- User explicitly authorized production deployment and GitHub APK publication. Production Convex jovial-eagle-875 deployed with current schema/functions/crons and server-only provider configuration; existing signing keys preserved and keypair verified. Auth metadata and JWKS endpoints return HTTP 200. Production DEMO authority scope provisioned independently; no development tourist data copied.
- EAS @yashvanths-org/gudtour project 809ee1d1-47b4-4676-a726-23c8a203bbd4, production-apk profile, production backend URLs and restricted Maps key configured. Source/config commit 5da951f pushed. Build b546cde0-43d6-4984-8526-7e6f332bde80 FAILED at :app:processReleaseResources because splashscreen_logo was missing; superseded by the logo fix below. APK version 0.1.0/versionCode 2. Intended GitHub prerelease v0.1.0-rc.1; not published yet.
- User saved production Google OAuth callback and release Maps certificate restriction; gcloud confirms package com.bitsnbytes.gudtour and SHA1 77:B1:FB:47:55:BB:78:1F:99:48:82:31:CD:8E:3E:4D:C7:60:05:33 alongside development certificate, Maps SDK for Android only.
- Before build: 254 tests, strict TypeScript/lint and Expo Doctor 21/21 pass. Production source ingestion currently has 99 notices and 100 successfully fetched documents; polygon endpoint failures remain explicitly unknown geography, never fabricated targeting. Native APK/install/two-client acceptance still pending. In-app foreground alerts only; physical iOS distribution remains separate.
- Next: download finished APK, verify package/version/signature/prod URLs and absence of backend secrets, publish APK/checksum GitHub prerelease, then record actual links. Preserve independent untracked web/. General feature implementation remains paused outside this release scope.


## 2026-10-10 — release splash resource fix
- User supplied Android resource-link failure: drawable/splashscreen_logo missing. expo-splash-screen had background settings but no image. Generated a transparent GudTour shield/location/weather logo with built-in imagegen, committed under assets/brand/gudtour-logo.png; prompt/provenance in assets/brand/README.md.
- app.config.ts now explicitly provides image for light and dark splash, imageWidth 200, contain scaling, and Android adaptive foreground. No generated native project edits. Isolated prebuild under ignored tmp/splash-resource-check succeeded and generated all ten light/dark density splashscreen_logo.png resources. Strict TypeScript/lint and Expo Doctor 21/21 pass. Local resource-link check pending, replacement cloud build pending. No GitHub APK release yet; physical device acceptance remains pending.
