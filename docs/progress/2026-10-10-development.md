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
