# 2026-10-10 — development progress

## Batch 1: P03, P04, Q01

User explicitly authorized application implementation and requested a review, commit and push after every three completed todos. The supplied organizer brief permits development from 2026-10-09 20:30 to 2026-10-10 20:30 Asia/Kolkata, with submission by 21:00. UTC clock 2026-10-10 01:43 corresponds to 07:13 IST inside that window.

Access inventory: Node 26.11.0/npm 11.20.0, Git origin matching GudTour, local Convex/Expo auth files present, GCP CLI available, Xcode/iOS 26.5 simulators available, Android adb available with no attached devices. EAS CLI was not globally installed. AccuWeather local secret exists; endpoint entitlement is pending. OpenCode Zen access was previously verified; backend secret deployment is pending. Dedicated Convex deployment, Google OAuth credentials, Maps restrictions, Translation credentials and signed iOS distribution remain setup work. Presence of local auth files does not establish current account authorization.

Created docs/acceptance-ledger.md from all PLAN.md section 18 scenarios, explicitly replacing only the deferred full-offline/queued-submission expectations with cached public content and explicit unsent-draft resend. Added engineering checks for authorization, concurrency, worker recovery, translation integrity, distribution, accessibility, demo isolation and model budget/evaluation. Every application scenario remains pending.

Review: core scope preserved, no app scenario falsely marked passed, local documentation links valid and supplied credentials excluded. The TODO rewrite was already committed externally as 751219a; this checkpoint records implementation authorization and evidence. Batch 1 was reviewed, committed and pushed as d27ff38.


## Batch 2: F01, F02, F03

Created Expo SDK 57.0.27, React Native 0.86.3 and React 19.2.3 TypeScript/Router foundation with strict checking, SDK-compatible native dependencies, generated-native-directory ignores and reproducible lockfile. Routes use src/app; technical tree and UI contract now reflect the current country gate, five tabs, no-news and online-first decisions.

Established semantic light/dark tokens, safe-area and scrolling controls, 52/64-unit actions, system text scaling and typed six-language entry dictionaries. Contrast checks cover text/action colors and dictionaries have matching nonempty keys. Human language review, 200% native layout, screen-reader and rendered-device checks remain pending; this completes the resource/control foundation, not the accessibility release gate.

Shared contracts cover WGS84 geometry, UTC timestamps, independent verification/activity/qualification, audience isolation, policy values, explicit errors and versioned commands without client actor IDs. Added boundary/hole/island/uncertainty tests and selected-option probability tests. Pinned CC0 country data includes islands; boundary-resolution/jurisdiction review remains required before release.

User corrected team ownership during setup. Created GudTour under Denoise Labs (denoise-labs), development deployment basic-newt-690, switched private local deployment configuration and deployed health/auth tables. The earlier personal-team project is unused and contains no tourist data. It was not deleted. The team deployment health query returned the expected service/version/policy.

User approved creating GudTour Convex Development in the existing GCP project. Created its Web OAuth client with only https://basic-newt-690.convex.site/api/auth/callback/google as redirect. Downloaded credentials are private; Convex auth signing keys, Google credentials and AccuWeather secret are configured on the team development backend. Google provider and exact native callback allowlist deployed. This is setup progress toward F06; a real authenticated session, restore/sign-out and Android/iOS redirects are not yet verified.

Verification: npm run check passes typecheck/lint and 38 domain/resource tests. Expo exports Android/iOS bundles and static developer preview. iOS native build succeeds (zero compiler errors, one generated build-phase warning) and app is installed on iPhone 17 Pro simulator. Automated opening timed out; CUA cannot currently open Device Hub, so runtime visuals are unverified. Expo Doctor previously passed all 21 checks; latest rerun recorded below. No basemap or push/background claim is established by compilation.

Dependency review: patched @auth/core to 0.41.3. npm audit still reports 30 transitive/native-toolchain findings (11 moderate, 19 high), including Metro-related chains. Its suggested broad downgrades/SDK-major changes are incompatible with the chosen SDK and have not been forced. Development Metro is localhost-only. Compatibility-preserving remediation/release dependency audit remains pending.

Review: foundation contracts match core behavior; original instructions and independent state dimensions preserved. Location route currently stops before app admission; no synthetic report or login is presented as working. Application acceptance scenarios remain pending. Credentials, .env.local, downloads, generated native builds and tmp diagnostics are excluded from Git.


Batch 2 final verification: Expo Doctor 21/21; Google OAuth initiation returned HTTP 302 to accounts.google.com with PKCE and the correct team callback; public JWKS endpoint returned HTTP 200 with one signing key. Commit b4e1c22 was reviewed and pushed to origin/main.

## Batch 3: F04, F05, F07

Implemented the core identity, latest-location, authority/jurisdiction, incident/observation, geometry, idempotency, audit and precision-4/5 geographic index schema. Shelter/alert/job/chat tables will be added with their workflows rather than unused stubs. Candidate APIs cap pages at 100 and explicitly label them candidate pages; complete nearby area expansion is later incident-map work.

Private profile/location queries accept no target user ID. Profiles cannot assign roles or demo access. Mutations derive the actor from the authenticated context, deduplicate a canonical SHA-256 payload and reject changed-key payloads/stale revisions. Initial onboarding requires a prior eligible country admission. Locations preserve observed time, maintain one latest row and remove targeting indexes for outside-India/ineligible updates; full location-triggered targeting and native consent/revocation work remain pending.

Public incident DTOs explicitly include only public fields, excluding profiles, private observations, witness origins and device data. Approved active memberships derive authority status; agency inactivity and revocation remove access. Authority review checks the complete affected circle within its assigned jurisdiction and separates LIVE/DEMO agency access. Polygon authority commands and broader operational workflows are not exposed yet. Internal operator approval validates agency/jurisdiction associations and records approval/revocation audits; ordinary tourists cannot call a public approval endpoint.

Verification: strict application and Convex typechecking, lint and 51 tests pass. Backend integration checks anonymous denial, wrong-account reads, role injection, required admission, stale/coarse/future fix rejection, retry/body conflicts, latest-location replay/outside-country handling, public DTO redaction, authority radius/scope/inactivity/revocation, demo isolation, bounded candidate pages and operator approval/audit. Deployed core schema/handlers to Denoise Labs development deployment basic-newt-690. These checks do not claim a real Google session or completed incident/alert workflow.

User requested an open iOS simulator and frequent TODO updates. The live checkpoint table now distinguishes completed backend foundations from pending native workflows. The installed iOS app process is running; a new CLI launch is using 127.0.0.1 to match localhost-only Metro. Device Hub/CUA runtime capture remains problematic and visible UI is not yet verified.

Batch 3 was reviewed, committed and pushed as 63e8b1f. Direct CLI investigation found Expo localhost bound only IPv6 ::1 while the app requested IPv4 127.0.0.1. Restarting Metro with LAN binding and an explicit loopback advertised host fixed it; iOS bundled and GudTour rendered directly. Device Hub is not required for CLI launch or simulator screenshots.

## Entry/UI checkpoint: L01, L03, F09

Implemented real foreground permission/service checks and a 25-second bounded fresh GPS acquisition, full uncertainty-aware India gate, disabled/denied/outside/uncertain/accuracy recovery states and return-from-Settings refresh. Observed GPS time is retained. Background permission is read without prompting or requiring it. Current fixes remain in memory; authenticated updates persist only the latest canonical location. Full native permission/revocation/background checks remain L02/L04/L06/L08 work.

Convex Auth now uses native SecureStore, Google browser OAuth, exact callback validation and one exchange shared between browser completion and Router to prevent consuming a verifier twice. Real iOS interaction produced one stored Google session, one admitted inside-India location and one saved private profile with a name, public alias and optional emergency contact. Verification inspected counts/field presence without printing private values. Android redirect, restart restore and explicit sign-out remain pending; F06 is not marked complete.

The profile form supports required name, optional blood group/contact and step-free preference, server-derived alias, revision conflicts and sign-out clearing the in-memory fix. Returning admitted profiles proceed to the map; explicitly chosen language updates are persisted before entry. Apple Maps rendered with current location on the iPhone 17 Pro simulator. Android Maps still requires native runtime verification.

User requested comfortable long-term UI and a pinned Continue action. Added a reusable layout footer outside the scroll area, safe-area clearance and keyboard avoidance, then applied it to language/location/login/profile. Language content scrolls while Continue remains visible; a native screenshot confirms the light-mode layout. Secondary actions use lower emphasis, touch targets are >=52 and labels wrap. Largest-text/dark-mode exploration was performed on the currently displayed map and restored afterward; small-device/landscape and complete large-text/screen-reader verification remain release checks. No test is claimed merely from the footer implementation.

Shared errors now map only known safe codes to localized messages; raw provider diagnostics are never displayed. Native-only Maps has a separate web fallback. Added typed resources for all six languages, auth callback deduplication/validation checks, mobile permission/GPS timeout/freshness mocks and safe-error checks.

Verification: strict typecheck, lint (zero warnings) and 65 tests pass; all-platform Expo export succeeds. Tests include permission denial without request loops, disabled services, optional background denial, stale/inaccurate/outside fixes and hung GPS without stale admission. Native inside-India entry/profile/map is observed; mocked cases are not presented as native permission evidence. Core crisis acceptance scenarios remain pending.

## API access checkpoint: P06, P08

On explicit user instruction, configured all currently needed API credentials in ignored root .env.local, mode 600, for private teammate copying. Enabled Android Maps and Translation in the existing agentslash GCP project. Created a dedicated Android key restricted to Maps SDK, GudTour package and the generated development certificate; project billing and key restrictions verified, Android native metadata generated. Different teammate/EAS/release signing certificates require corresponding restrictions before rendering works.

Created a dedicated Translation service account with Translation User role, but organization policy iam.disableServiceAccountKeyCreation rejected key issuance. Preserved that policy. Created a backend-only key restricted to Translation and verified the supported Basic v2 API with a real English-to-Tamil call. No service-account private key was issued; Advanced v3/glossaries await a supported keyless flow. This replaces the provisional v3 credential suggestion without changing the user's Google Translation choice.

Saved the user's previously provided OpenCode credential privately. Live Jev 1.13 Choice returned HTTP 200: INSUFFICIENT_EVIDENCE, selected-option probability 0.94, independent confidence 0.91; probabilities are keyed by label. It was a synthetic connectivity test, not a published emergency, quality evaluation or balance check. Failure/evaluation gate P07 stays pending.

AccuWeather Bearer credential returned 200 for fixed Chennai test-coordinate lookup, current conditions and historical/24; history had 24 observations. Account quota and licensed cache retention review remain P05 work. Never put the current developer credential in logged query URLs.

Read SACHET's actual directory and official three-page ETag guide. Verified all-India RSS at /cap_public_website/rss/rss_india.xml (99 entries, 77,586 bytes), one Actual/Public/Alert flood CAP (1,657 bytes), and real conditional 200→304 with zero body bytes and reusable cached XML. A Polygon URL parameter led to separate polygon XML; the original area had no inline polygon. Recorded source fields, geography handling, reference/cancellation requirements, no-all-clear rules and mandatory XML/ETag caching in docs/research/sachet-feed-contract.md. Update/Cancel reconciliation and the production parser remain pending.

Backend provider configuration/credentials are set on Denoise Labs basic-newt-690. docs/api-setup.md describes private team setup, signing restrictions, supported credential flow and remaining APNs/FCM/native delivery gaps. Technical plan now matches implemented error/command/DTO contracts and current access evidence. .env.local, key-fetch output, XML diagnostics, generated native projects and all private files remain excluded from Git.


### Incident backend checkpoint — I01, I02, I07

Previous onboarding/API checkpoint `fb94df7` was committed and pushed to main.

- I01: all eight PLAN.md hazard radii/windows/stale thresholds are implemented. Tests cover each exact witness/stale boundary and the next millisecond; scheduled generation-guarded refresh maintains stored state.
- I02: verification, lifecycle and emergency qualification stay independent. Two recent authors yield Corroborated without emergency qualification; old evidence loses current corroboration; age/outage never ends an existing emergency. Public reads calculate current recency/state even when a scheduler job runs late.
- I07: session-derived identity, acknowledged current fix binding, five-minute/200-metre eligibility, one-kilometre witness proximity including uncertainty, 24-hour observation validity, five new incidents per rolling hour and ten-minute contribution cooldown. Exact accepted retries return the original receipt and do not consume another report allowance. DEMO access is denied to ordinary profiles.
- Validation: `npm run check` passes strict TypeScript, lint and **86 tests** across 10 files. `npx convex dev --once` deploys successfully to Denoise Labs GudTour development. Tests use isolated test data, not live crisis reports.
- Current explicit pilot bound: aggregating more than 500 active observations fails with CONFIGURATION_REQUIRED instead of claiming a complete count. Larger-scale paginated/incremental aggregates remain part of I06. I08 withdrawal/restriction/history and M3 two-device acceptance are not complete.
- No emergency notification is emitted by observation submission. Provider assessment and publication workers remain pending. Native report/detail UI is under development; it is not yet accepted as complete.


### Native reporting checkpoint — I03/I04 and connected detail/map

- Backend checkpoint `2232fe9` is committed and pushed.
- I03: native report form renders in the running iPhone 17 Pro simulator. No hazard is preselected; selection collapses the list into a readable summary. The scrolling form includes relative observation times, explicit Today/Yesterday with HH:MM validation, 500-character text, required Other explanation and acknowledged fresh GPS. Submission/navigation remain pinned above safe areas. Screenshot: ignored `tmp/ios-native-report.png`.
- I04: captured-position candidate query returns same-hazard suggestions with explicit Add my observation/Report a different event selection; no silent merge. Backend tests demonstrate separate incidents when the user chooses a new event. Partial result coverage is labeled.
- Connected detail shows separate verification, lifecycle, qualification, provenance, timestamp and recent/total windowed witnesses. Server eligibility disables distant/closed/cooldown contributions. Retry keeps a frozen request ID/body while confirmation is uncertain; authoritative validation errors permit correction and show cooldown seconds. Accepted response is wired to the detail route; **actual native submit/open and two-account corroboration remain pending I05/M3**.
- Map/list query initially covers 5 km with bounded/partial results. Unverified approximate circles use dashed polylines supported by iOS Apple Maps and Android Google Maps; marker labels and readable incident cards give a non-color alternative. Full filters, polygon/official overlays, shelters and archive remain pending I09/I10. No empty view claims safety.
- Newly captured outside-India coordinates are recorded before admission fails, removing prior location targeting indexes. Native foreground revocation/background/targeting acceptance still remains pending L02/L05/L06/L08.
- Added 72 report/detail labels in all six languages. New translations were generated through the configured Google Translation v2 API; N03 human review remains pending. No runtime translation is required for these UI labels.
- Validation: strict TypeScript/lint, 102 tests across 12 files, successful Convex development deploy, and Android/iOS/web exports. Native reload and report rendering confirmed; no synthetic LIVE emergency was posted.

- Read-budget review caps initial nearby/candidate results and cell pages at 30 incidents. Partial lists carry an explicit flag; cell pagination retains its cursor so later pages remain accessible. This prevents 100 worst-case witness aggregates exceeding a Convex read budget. A dense 32-incident test checks both partial disclosure and 30+2 pagination.


### Incident submission policy override — I13

- The user removed incident submission rate limiting on 2026-10-10. This supersedes the historical five-per-hour and ten-minute witness-update defaults recorded above. Incident creation and corroboration updates now accept immediate submissions without those limits; chat limits and emergency sound rules retain their separate policies.
- Removed backend rate-window reads/writes and cooldown rejection, plus report-form countdown/disabled waiting states. Eligibility no longer rejects a person for having just contributed. Legacy postingRates rows remain migration history only and are not read or written by submissions. Policy version advanced to 2026-10-10-v2.
- Preserved authentication, current acknowledged India GPS, observation-time/proximity checks, one effective witness per person, and command replay deduplication.
- Evidence: regression cases accept twelve new reports per hour and twelve immediate updates of one incident, with one witness and no new rate rows. All 102 tests, strict TypeScript and lint pass. Deployed successfully to basic-newt-690 at 09:04 IST.
- F10 frosted navigation is now tracked explicitly and in progress; native/platform accessibility verification is still pending.


### iOS navigation and continuity checkpoint — F10

- User selected icon-only floating navigation and a full-screen map with Report incident floating above the bar. Initial landing after onboarding remains the map, with a compact welcome/current-location panel and genuine Incidents/Shelters quick actions. Optional device reverse geocoding supplies a real locality; failure retains the generic label. Captured GPS time/accuracy is exposed without pretending a recenter refreshes location.
- Fresh iOS development build succeeded and installed ExpoBlur and SVG modules; this removes the native “Un” placeholders. Consistent Lucide icons and real blur render in actual iOS light/dark screenshots. Sources remain platform-compatible; Android runtime is unverified and deferred by the user's latest direction.
- Fixed the second tab's Report footer overlapping navigation. KeyboardAvoidingView overwrote inline paddingBottom; a separate measured-inset wrapper now reserves the bar space. Actual default-font screenshot tmp/ios-incidents-footer-fixed.png shows Report fully above the bar.
- User explicitly prioritized functionality and requested default fonts. Restored simulator content_size large, closed Android emulator, and deferred extended accessibility/responsiveness checks. Do not relaunch Android for routine work.
- Settings now saves only language with session-derived ownership, revision checks and exact retry receipt; tests cover unauthorized/stale/changed-key writes and preservation of other private profile fields. Shelters list is connected to a bounded private-location-based public read, with honest empty/pending information. Shelter maintenance/recommendations and chat still remain unfinished.
- New official workflow tables and complete geometry scope validation are preparation only; no authority emergency publisher/targeting worker exists yet. Geometry tests cover jurisdiction holes, concavities, invalid rings, nested components and uncertainty index coverage.
- Validation at 09:27: strict TypeScript/lint and 111 tests/13 files passed. Initial all-platform export passed; latest popup/Screen/locality source requires final export. Root context.md now records decisions, configuration references, authoritative state, current limitations and exact continuation instructions without secrets.
- I14: similar incidents now appear in an automatic native modal with explicit existing/new-event choice, dismiss/reopen controls and a compact form summary. Native modal exercise is still pending, not marked complete from code alone.

- Final checkpoint verification: 111 tests/13 files, TypeScript/lint and all-platform export pass with the popup/Screen/locality changes included. Exact configured-secret scan passed for 354 Git-eligible files. Completed checkpoint IDs: I13, F10 (current iOS scope), DOC01. I14 remains pending native exercise.

### Similar incident popup — 09:36 IST

- Checkpoint 71976bd is committed and pushed to main, including the native similar-incident modal.
- Actual iPhone simulator capture tmp/ios-modal-check-start.png shows a centered, dimmed-backdrop popup containing the nearby flash-flood suggestion, Add my observation, disabled Continue before selection, Report a different event and Close. Similar incident cards are no longer appended to the report form.
- This confirms native rendering, not a completed interaction suite. Dismiss/reopen, explicit selection and preservation of entered draft text remain pending I14 checks. No incident was submitted by this verification.

### Submission completion loop — I15, 09:42 IST

- User confirmed the apparent loop was the successful incident-detail page presenting another contribution button, rather than the matching modal reopening or a failed backend write.
- Accepted receipt navigation now presents Your observation was saved, an explicit completion explanation and one primary Back to map action. It neither queries contribution eligibility nor offers another report action on the completion screen.
- Ordinary incident detail retains deliberate contribution access. Eligibility returns only a session-owned hasObservation boolean; existing contributors see Update my observation while other tourists see the first-contribution action. No private witness record is returned.
- Added actual detail-component regression tests for completion exit, deliberate later update and another tourist's contribution. Backend tests assert the own-observation boolean differs between authenticated authors. Six locale dictionaries include the completion/update labels; human linguistic review remains pending.
- Verification: TypeScript, lint and 114 tests/14 files passed; iOS export passed; Convex development deployed at 09:41:45. Actual iOS capture tmp/ios-observation-saved-fixed.png shows the saved screen with only Back to map. This display check opened the receipt route explicitly against an existing incident; no new LIVE report was fabricated and it does not replace the pending two-account native acceptance gate.

### Authority shelter maintenance — A07 in progress, 09:55 IST

- Submission-loop checkpoint 4a24fb1 is committed and pushed. Shelter maintenance adds exact assigned-jurisdiction authorization, scope labels, bounded paginated management queries and atomic save/archive commands with revision checks, idempotent receipts and audit reasons.
- Shelter status/capacity/availability/location changes require explicit actual confirmation. Unrelated edits preserve statusConfirmedAt. Unknown capacity stays null; contradictory or malformed capacity is rejected. Archives retain records/audits and remove tourist indexes; inactive agencies no longer supply active tourist listings.
- Settings exposes an authority workspace only for server-approved membership. New authority routes support assigned-area selection, shelter create/edit, archive confirmation and deliberate review of a concurrent server version while preserving draft fields. Unknown transport freezes and retries the original command.
- TypeScript, lint and 133 tests/16 files pass, including 14 shelter backend checks and 5 form interaction tests. Six locale label sets are present; human review pending. Approved-account native management acceptance remains pending, so A07 is not checked complete.

### Tourist shelter details — A10 in progress, 10:00 IST

- Protected public shelter detail adds source, address/coordinates, status/capacity/accessibility/facilities/contact, status confirmation age and distance/location freshness. Known closed/full/unknown/stale/access-restriction/step-free limitations are derived from maintained facts and the requesting user's private preference. Full hazard screening/recommendations remain unavailable and are stated honestly; this does not complete A09.
- Google Maps uses a universal destination URL, falling back to the browser without requiring the Google Maps app or another API key. Directions/calling revalidate the selected record and stop for revision changes or removed listings. Copy uses the visible address/coordinates even if live networking is unavailable. External routes are explicitly unverified; opening the dialer does not claim a successful call.
- Added SDK-compatible expo-clipboard through Expo install. iOS CNG prebuild completed; native compile/install is running in session 84937, log tmp/ios-shelter-native-build.log. Do not claim clipboard works in the old binary.
- TypeScript/lint and 142 tests/18 files pass, including backend detail privacy/limitations and real detail-component revalidation, fallback copying and dialer tests. Native listed-shelter/approved-authority interaction remains pending; no fake LIVE data was inserted.

## 10:12 IST — configured authority emails

Implemented the requested backend comma-separated AUTHORITY_EMAILS setting with exact verified Google OAuth identity matching, audited scope-bound membership synchronization, immediate configuration checks and explicit operator-revocation precedence. Client syncs on sign-in/session restore and offers Settings refresh. The private configuration helper successfully provisioned/reused Chennai DEMO scope and applied an empty email list; no real account was granted authority and no LIVE records were fabricated. Six allowlist backend tests pass; full verification reached 148 tests/19 files, strict TypeScript and lint. Setup instructions and controlling plans updated. Native clipboard build/install completed successfully earlier; approved-account native acceptance remains pending actual configured emails.

### Authority allowlist activated

Applied the user's three supplied Google account emails privately to the existing Chennai DEMO scope. Configuration command succeeded and backend read-back matched all three local authority variables. Users must authenticate/refresh access before membership synchronization; no claim of completed sign-in or authority UI acceptance. No email list or credential added to tracked documentation.

## 10:18 IST — session loop fixes and official publication foundation

Fixed location auto-restore dependency loop: reactive profile updates no longer trigger repeated GPS/navigation; automatic permission check runs only when readiness changes. Sign-out now awaits auth token removal before clearing location, preventing map redirect during live authentication. Settings exposes red Sign out at the end of its scroll, not in a pinned footer, with the shared measured navbar inset. Existing profile logout ordering also fixed. Five component regression tests added; total157/22 files plus strict TypeScript and lint pass. Native user interaction has not been automated or claimed.

Added canonical declarations.publish with assigned jurisdiction/agency/audience checks, immutable exact original instructions, source-specific attributed records, revision concurrency, atomic alert revision and durable bounded union-area expansion job. Four backend tests pass. This is publication foundation; declaration editing/withdrawal, review UI, recipient worker and actual delivery remain unfinished. No LIVE or DEMO incident was published to the shared backend by these isolated tests.

## 10:25 IST — visible authority workspace and declaration UI

Backend-only diagnostics confirmed an allowlisted account has verified Google identity and one active authority membership. Added prominent map workspace entry, explicit Settings authority status and authority-first navigation after admitted location. Redesigned workspace with tourist palette/system typography, clean assigned-area cards, DEMO badge and declaration/shelter actions. Circular-area form preserves original text/language, severity and protective-action classification, requires explicit modal review, freezes uncertain retries and finishes in a saved state. Recipient delivery is visibly described as pending. Native screenshot confirms actual declaration form rendering, not submission. Dashboard review queues, polygon editor, named shelter/deadline inputs and declaration updates/withdrawals still pending; A01/A03 remain open.

Final authority UI checkpoint verification:161 tests/24files, strict TypeScript/lint and iOS export pass. Component tests exercise scoped dashboard navigation, role routing, required review and identical unknown-transport retries. Actual full publication/delivery acceptance remains pending.

## 10:29 IST — map-selected declaration area and recipient expansion

Replaced declaration coordinate fields with native map selection/current-location actions and affected-radius input. Map modal previews circle, supports tap/drag marker and explicit apply/cancel; selection never changes tourist location eligibility. Current-position action uses actual authorized GPS capture. Six locale labels added via GoogleTranslate (human review pending).

Added internal checkpointed recipient expansion, 25 candidates/page using precision3 prefix ranges over precision4 USER index. Each transaction rechecks latest location/admission/permission/30-minute age/1-km accuracy, exact geometry and DEMO profile opt-in; atomically creates deduplicated private exposures/userAlerts and continuation checkpoint. New alert revisions supersede old jobs. Publication schedules initial page; indexed minute recovery resumes pending checkpoints. Eight isolated backend tests cover eligible targeting, stale/inaccurate/outside/permission/DEMO exclusions, duplicate checkpoint, supersession and31 recipients over multiple pages. Movement checks, device delivery, merge handling and material/reentry sounds are still unfinished. Latest170 tests/25files plus strict TypeScript/lint pass.

## 10:35 IST — repeated logout loop correction

User reported the loop persisted after the previous fix. Reopened F12; token-removal ordering alone did not cover navigation races. Added in-memory explicit logout intent to prevent login and location auto-entry during auth propagation; cleared only by successful deliberate Google sign-in (or failed logout rollback). Auth navigation guards now use focus effects, inactive screens cannot redirect, and signed-out protected screens route to login. GPS capture checks a focus generation before backend/profile/location/navigation effects so completion after leaving cannot navigate. Real-session integration test covers Settings sign-out while the auth hook still reports authenticated and subsequent signed-out rerender. Added canceled-GPS and explicit-logout no-autolocation tests.173 tests/26files and strict TypeScript/lint pass. Native interaction acceptance is pending; do not infer it from the component tests.

## Shelter picker and validation — 2026-10-10
User confirmed logout fixed (stays on login); resume implementation. ShelterForm now uses shared native AreaPicker for entrance selection with tap/drag and explicit apply/cancel, retaining current-location capture. Circle disabled for point-only shelter selection. New regression checks cover canceled selection and saved point. Metro shelter save error b73c777bd5c45b5e points to text(args.name,2,120): minimum two trimmed characters; address minimum three. Added local field-specific minimum validation and regression test. No private form contents logged. Tourist alerts backend read/ack foundation exists but tourist emergency UI/push remains unfinished. Independent web/ work preserved.

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
