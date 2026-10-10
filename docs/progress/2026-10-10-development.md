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
