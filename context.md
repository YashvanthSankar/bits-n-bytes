# GudTour — agent handoff context

Updated: 2026-10-10, Asia/Kolkata. This file records the working state and user decisions for the next Codex agent. Read it alongside AGENTS.md, docs/README.md, docs/architecture.md, PLAN.md, TECHNICAL_IMPLEMENTATION_PLAN.md and TODO.md. Those documents hold the complete behavior and acceptance contracts; this file does not replace them.

## Repository and authorization

- Work in **/Users/yashvanths/Dev/bitsnbytes**. The tool environment may start in /Users/yashvanths/Dev/babbageBrosAutomation, which is another project. Always set the intended working directory. Its professor/NextAuth repository instructions do not apply to GudTour.
- GitHub origin: https://github.com/YashvanthSankar/bits-n-bytes.git; branch main. The old duplicate bits-n-bytes directory was migrated/removed previously. Do not recreate it.
- Development is authorized. The user expects autonomous, efficient execution, frequent TODO updates and clear progress. Read before changing, verify before ticking tasks, review/commit/push after each three completed TODOs. Earlier explicit commit requests also authorize commits. Never report the full app complete while required workflows remain pending.
- Preserve the original product scope across turns. New messages usually steer the ongoing work. No subagents unless the user or applicable repository instructions explicitly request delegation.
- No secrets, .env.local, provider tokens, private tourist data or uploaded user information in Git. Configuration is already available privately; do not ask for the same credentials again or print them.

## Product and decisions

**GudTour — Local alerts. Your language.** An India-focused tourist crisis communication app, Android and iOS. Tourists report nearby natural hazards; approved authorities publish official instructions/emergencies and maintain shelters/contacts. Recent independent witnesses, weather, SACHET and retained history inform model qualification. Alerts are geographically relevant and translated while preserving the original issuer, places, deadlines, severity, prohibitions and strength of instruction.

- Expo SDK 57 / React Native; Convex is canonical backend, Google OAuth, Apple Maps on iOS / Google Maps on Android.
- NDMA SACHET RSS/CAP XML, AccuWeather, Jev 1.13 through OpenCode Zen, Google Cloud Translation Basic v2. **OpenAI is not the selected decision dependency** despite earlier discussion. News was explicitly removed.
- Online first. Downloaded basemaps, offline routing and automatic offline report posting are deferred. Cached public information and explicitly unsent drafts remain degraded-state work.
- Physically inside India, not pre-arrival destination subscriptions. Foreground location mandatory; background and notifications optional, with honest reduced-alert messaging. Map camera movement never changes eligibility.
- Tourists default to unverified; government verification and emergency qualification are separate dimensions. Approved authority emergency publication bypasses Jev.
- An empty hazard list, feed failure, expiry or missing source is never an all-clear. Chat is not witness evidence. Nearest shelter must honor actual eligibility and official instructions; no route/admission guarantee.
- Full required scope still includes nearby chat/moderation, authority workflows, six languages, private settings/deletion, device delivery, recovery and both native platforms. Scaffolds/provider smoke calls do not complete those workflows.

### Latest user overrides — apply immediately

1. **No incident submission rate limiting.** On 2026-10-10 the user said “remove rate limit ... submission of incidents no rate limiting.” Remove both five-new-incidents/hour and ten-minute corroboration/update cooldown. Authentication, India/current GPS, time/proximity checks, one witness/person/incident and idempotent command receipts remain. Chat rate limits and emergency sound cooldowns are separate and were not removed. POLICY_VERSION is now 2026-10-10-v2. This override has been implemented/tested/deployed; I13 is checked.
2. **Floating frosted bottom navigation on Android and iOS.** Five destinations: Map, Incidents, Shelters, Nearby chat, Settings; Report incident is a separate action above the bar. Labels and conventional vector icons, selected state, safe areas, readable light/dark, large text, reduced transparency.
3. **Main map must fill the screen.** User saw a boxed map and asked for full-screen map with a floating Report incident button above navigation. User was unsure about a welcome page after onboarding. Recommended direction communicated: go straight to full-screen map with a compact welcome/current-area panel and quick actions for incidents/shelters, avoiding a separate welcome detour. Do not invent locality/weather/status until real data exists.
4. **UI regression reported by user:** navbar shows unusual “Un” symbols and lacks frost. Actual simulator screenshot confirmed missing-native-module fallback boxes (SVG and ExpoBlur) because JavaScript changed before the native binary was rebuilt. A new native development build is required. Also TabTrigger asChild forwards default row styles; custom button must put its own column styles AFTER incoming styles. Current bar overlapped Report footer in screenshot; full-screen layout must separate them.
5. **Maintain this root context.md** so a future agent can continue. Refresh it before context exhaustion/end of checkpoint. No claim that a summary captures every detail; full controlling docs remain essential.

## Configured services — references only

Private .env.local is ignored, mode 600. Do not quote values. docs/api-setup.md explains team setup. Ignored tmp/env-tools.mjs reads it with Node parseEnv and safely writes quoted mode-600 values. Ignored temporary credential files exist; never stage tmp or native generated directories.

- Convex **Denoise Labs** team slug denoise-labs, project gudtour, development basic-newt-690: https://basic-newt-690.convex.cloud, auth site https://basic-newt-690.convex.site. Do not use the old personal amiable-egret deployment.
- GCP project ID project-ba909057-8b45-4731-9b9, friendly name agentslash; billing enabled. User authorized existing project use and its shared OAuth consent branding. gcloud is installed at /opt/homebrew/bin/gcloud.
- Google OAuth Web client configured; redirect https://basic-newt-690.convex.site/api/auth/callback/google, native callback gudtour://auth/callback. Private client ID/secret configured in Convex and local env.
- Android Maps key restricted to com.bitsnbytes.gudtour and debug certificate; API enabled, manifest configuration generated through app.config.ts. Android runtime remains unverified.
- Translation Basic v2 live call verified, key API-restricted, server only. Advanced service-account key creation was blocked by organization policy; do not relax that policy. Six-language static label translations used authorized Basic v2 calls; human linguistic review pending.
- AccuWeather live Chennai location/current/24-hour responses verified. Provider subscription quota/retention validation remains pending.
- OpenCode Zen POST /zen/v1/systemone, model jev-1.13; Noul and Choice synthetic connectivity passed. Probability comes from selected Choice option, not overall confidence. Automated assessment integration/evaluation pending. Existing subscription is not ChatGPT API credit.
- No completed APNs/FCM/EAS release signing/device delivery setup. Do not invent a general Expo API key or call a push ticket proof of delivery.

## Git/checkpoints

Last fully reviewed/pushed HEAD at this handoff's initial creation: **c446eafc18008c899daf2549fda66268303bcccc**. Earlier checkpoints: b4e1c22 foundation, fb94df7 onboarding/provider setup, 2232fe9 incident backend. Verify current status/HEAD before committing; this file will be updated as work progresses.

At initial context creation, working tree contains unfinished official-backend prep plus policy override and navigation/UI changes. These are shared files; do not revert or overwrite them blindly. All current changes are uncommitted.

- New dependencies via **npx expo install**: @turf/difference, @turf/kinks, expo-blur, react-native-svg, lucide-react-native. Expo dependencies must always use expo install. Native directories ios/android are generated and ignored; never edit by hand.
- New areas.ts and generalized authority geometry guard have deployed to development. New alert/shelter/device/job tables are schema preparation only; publishing/targeting/delivery functions do not yet exist.
- I13 removal deployed at 09:04 IST; profiles.setLanguage and shelters.nearby deployed at 09:11 IST. Since then geometry validation was improved and must be redeployed after final checks.
- Previous committed checkpoint had 102 passing tests/12 files, strict typecheck/lint, Android/iOS/web Expo exports, backend deploy. Updated no-rate tests also passed 102 tests before navigation edits. New geometry/profile tests were added; current full verification needs rerun.

## Runtime and native verification

- iPhone 17 Pro simulator UUID **6C3B78D4-C1C7-4DE2-A422-5C43C56BB225**, iOS 26.5, Xcode 27; bundle com.bitsnbytes.gudtour. Direct xcrun simctl commands are preferred. User asked to run the phone directly, not open Device Hub unnecessarily.
- Metro at localhost:8081, originally exec session 26128, command with REACT_NATIVE_PACKAGER_HOSTNAME=127.0.0.1 and expo start --dev-client --lan. Its stdin is closed; do not write r to that session. Check running processes before starting a second server.
- Supported Metro reload: Node ws client to ws://127.0.0.1:8081/message with Origin http://127.0.0.1:8081; send {version:2,method:'reload'}, then close. Do not extract private auth tokens through debugger.
- xcrun simctl openurl booted gudtour://report and other app deep links work. Screenshots via xcrun simctl io booted screenshot tmp/name.png, then view_image. Screenshot paths stay ignored, not deployment proof.
- Simulated GPS Chennai 13.0827,80.2707 configured; not a claim about real user location. Native location permission and Google authentication were verified historically. Location route now auto-refreshes when permission already granted. Full JS reload resets in-memory location but secure auth can restore.
- Actual tmp/ios-navigation-before.png shows the missing SVG/Blur native modules, cramped/row-arranged nav labels, overlap with report footer, and boxed map. A fresh iOS prebuild has completed (09:12-ish), **native compile/install subsequently succeeded; see latest updates below**. Run expo run:ios --device <UUID> --no-bundler and inspect output.
- /opt/homebrew/share/android-commandlinetools/emulator/emulator exists; adb available. No connected Android device or configured AVD was listed. Android build/runtime verification remains pending; do not claim cross-platform runtime success from an export.
- CUA has Device Hub, not Simulator, as an enabled app; selecting Simulator returned invalid app. Avoid repeating stalled Device Hub paths. CLI launch/screenshot works.

## Existing implementation

### Identity/location

Convex Auth session derives actor. requireUser/requireIndiaAccess/requireEligibleFix enforce private identity, admitted latest India position, country certainty, permission and age/accuracy. Approved memberships/jurisdictions are operator-controlled. Public DTOs exclude exact witness origins and private names/health/contacts/device tokens.

locations.update stores one latest private GPS fix; upload time does not substitute observation time. Accepted India positions have private USER geo index precision 4/5; outside/uncertain/denied updates remove indexes. Reporting captures and acknowledges fresh GPS before use. An outside captured fix is persisted before admission failure to remove prior eligibility. Permission revocation/background/location expiry acceptance still pending.

### Incidents

Eight PLAN hazard presets; separate verification/activity/qualification. Tourist report remains UNVERIFIED/PENDING until evidence changes. Two recent distinct people yield CORROBORATED, not official verification/emergency. Approved authority report within scope defaults AUTHORITY_VERIFIED but is not yet an emergency declaration.

observations.submit binds fix exactly to acknowledged latest position, observation age <=24 h, description <=500, Other text >=3, proximity within 1 km of eligible reported origin including uncertainty or inside explicit official area. New incident and witness/audit/command receipt are atomic. Exact retry returns original receipt; changed body with same key rejects COMMAND_KEY_REUSED. One effective observation per author is updated without increasing witness count. No submission rate/cooldown now. Legacy postingRates table is migration history only.

State timers use generation checks. Public reads recompute recency when schedulers run late. **Known pilot cap:** >500 active observations fails explicitly CONFIGURATION_REQUIRED; scalable counts remain I06, not silently complete. Correction/withdrawal/flag/merge/history remain I08.

Native report form: explicit hazard choice, relative/earlier times, fresh GPS, explicit candidate/new-event selection, server acknowledgment routing, frozen id/body on uncertain transport, errors beside pinned footer. New no-rate version has no waiting timer. Native detail/map/list connected; two-account/native submit/open acceptance still pending. User may have tested a report in simulator; don't infer all acceptance from a visible marker.

### UI and navigation in current working tree

- Shared Screen safe area + scrolling body + fixed footer preserves pinned onboarding Continue. Keyboard avoidance, scalable system text, semantic color tokens.
- src/app/map.tsx was moved to **src/app/(tabs)/map.tsx**, keeping public /map URL. Other tab routes: incidents.tsx, shelters.tsx, chat.tsx, settings.tsx, _layout.tsx.
- Headless Expo Router Tabs from expo-router/ui. Hidden TabList directly under Tabs configures routes; separate floating TabTriggers render visual navigation. BlurTargetView wraps ONLY TabSlot content; BlurView is sibling afterward, avoiding recursive Android capture.
- src/navigation/FloatingNavigation.tsx uses real Lucide SVG icons; native binary must contain react-native-svg. Expo SDK57 Android blur requires blurTarget ref and dimezisBlurViewSdk31Plus (efficient API31+, older opaque fallback). iOS reduced-transparency setting toggles opaque surface. Keyboard hides bar; measured chrome inset reserves body/footer space.
- Icon-only navigation fits ordinary phone widths independently of font scale; width <316 uses a compact current-icon/Menu bar with a labeled route sheet. No decorative animation. Need actual device tests of dark/large text/narrow/landscape/native back/accessibility.
- Current custom button incorrectly applies incoming TabTrigger style after its own column style, explaining row layout. **Fix ordering**. Native blur now has translucent theme tints, with contrast regression checks against extreme background colors.
- Full-screen MapView, compact welcome/current-fix panel, quick actions and floating Report CTA above measured navbar are implemented. Keep Google/Apple legal attribution unobscured by overlays/mapPadding; don't claim blank areas safe.
- Incidents tab uses real protected nearby 5 km query, partial labels/cards. Full filters/archives/official polygons remain pending I09/I10.
- Shelters tab uses real sheltered read API but no maintenance/recommendation worker yet. Empty list states ingestion is being connected. Chat route explicitly says pending; never imply messages work. F10 navigation acceptance doesn't complete M7 chat.
- Settings exposes profile, private GPS timestamp and real language-only backend update. Settings uses state for retry UI and a private command ref; the lint violation was fixed without disabling rules.
- All locales contain 18 new nav/shelter/chat labels generated through Google Translate. Human review pending N03. Obsolete secondsUntilRetry label can be removed from all six locales. Existing dictionary equality/contrast tests must pass.

## Official backend preparation in working tree

convex/lib/areas.ts validates bounded circles, polygon rings/holes/multipolygons, self intersections, closure and complexity. containsArea uses whole polygon difference to respect concavity and holes, circle containment and conservative spherical edge bounds. A recently added check rejects nested overlapping multipolygon components; island inside a polygon hole remains valid. Covering prefix geohash3 cells includes 1 km uncertainty buffer. New authorityAreas.test.ts contains six meaningful geometry cases and must pass.

authorization.ts now has requireAuthorityForArea(ctx,area,audience,agencyId?) and the circle wrapper. Scope includes active assigned jurisdiction, agency/audience and optional ownership. Callers must enforce appropriate India access. Existing reviewIncident remains circle-only; publishing must use general geometry.

Schema additions: authorityDeclarations, immutable instructionVersions, alerts, alertSources, alertRevisions, private exposures/userAlerts, checkpointed jobs, devices/deliveryJobs, shelters/contacts; optional incident agency ID and new areaCoverage index. These are **not completed workflows**.

Planned authority path:

1. Authenticated approved authority with full affected-area containment creates/updates declaration using revision/command receipt/reason.
2. Atomic declaration, exact original instruction version/hash, issuer/source, alert revision and durable expansion job. Official publication bypasses model. Source-specific withdrawal preserves other active sources; no timer invents all-clear.
3. Paginate recipient USER geo candidates with durable cursor/checkpoint; validate latest fix <=30 min, accuracy <=1 km, Indian admitted permission and actual uncertainty overlap. Deduplicate logical exposure/userAlert/device job; stale location/revision jobs supersede. Private locations never return to authorities.
4. Translation/actions/push happen after canonical publication; failures cannot roll back published original instruction. Push tickets/receipts/open are separate evidence.
5. Shelter maintenance jurisdiction/agency ownership, actual confirmation, revision/reason/audit; recommendation excludes stale/full/unsafe/inaccessible and honors stay-put/named-shelter/conflicting authority guidance.

## SACHET contract already researched; not yet implemented

Read docs/research/sachet-feed-contract.md. User supplied required guide: https://sachet.ndma.gov.in/CapFeed and Integration_Guide_For_Agencies.pdf. Directory lists India +36 state/UT feeds. Correct India feed https://sachet.ndma.gov.in/cap_public_website/rss/rss_india.xml.

FetchXMLFile?identifier=... supports ETag. Store XML and exact ETag after first 200; subsequent calls MUST send If-None-Match. 304 uses cached XML immediately with no repeat fetch. Valid new 200 atomically replaces XML/ETag. Malformed 200, outage or missing cache on304 cannot erase alerts or become empty/all-clear.

Some CAP actual notices contain **Polygon URL parameter** pointing to allowlisted FetchPolygonXMLFile XML, not inline polygon/JSON. Parse CAP coordinate latitude,longitude into explicit WGS84/GeoJSON longitude,latitude. Preserve references/update/cancel/tombstones, audience/status filtering and official translations. Worker/parser tests and ingestion E01/E02/E03 remain pending despite real feed/304 research proof.

## TODO state and verification discipline

Completed historical IDs: F01/F02/F03/F04/F05/F07/F09, L01/L03, P03/P04/P06/P08, Q01, I01/I02/I03/I04/I07; new **I13** complete no submission limits. F06/F08 remain partial (Android/auth restore/signout/device evidence). F10 navigation newly in progress. Main emergency/translation/delivery/provider/chat/release tasks remain pending.

Read TODO.md for current statuses. Update rows and dated notes as each check passes. Do not tick composite Android+iOS navigation F10 solely from iOS screenshot or export. Keep native source/template linguistic review and complete acceptance ledger explicit.

### Immediate next actions at initial context creation

1. Fix settings refs-during-render lint error and TabTrigger injected style ordering.
2. Finish full-screen map/welcome/quick-actions/floating Report layout and clearer frosted background. Add necessary language keys consistently; retain accessible opaque fallback and safe-area legal map attribution.
3. Rebuild/install iOS (new native SVG/Blur), reload JS and inspect actual screenshot. Verify icons, no overlapping report, navigation routes, light/dark, large text/small/landscape. Never call a missing native module fixed before rebuilt binary renders.
4. Run npm run check (current last full run failed on settings lint), Expo all-platform export, Convex deploy after source changes and targeted shelter/geometry/profile tests. Tests are isolated; don't fabricate LIVE disasters or push alerts.
5. Update TODO/progress/acceptance/context with exact evidence; review diff/privacy/secrets, commit/push authorized checkpoint without secrets. Then continue A04/N04/A07 official path and Android runtime setup.

Useful commands: npm run check; npx convex dev --once; npx expo export --platform all; npx expo install <dependencies>; npx expo prebuild --platform ios --no-install; npx expo run:ios --device <UUID> --no-bundler. Avoid repeated broad tests after success unless new source/failure warrants it.


## Latest continuation updates — 2026-10-10 09:29 IST

These updates supersede earlier working-state notes in this handoff.

- User explicitly prioritized **functional completion**; postpone broad accessibility/responsiveness polish and stop changing simulator font sizes. Default iOS content size restored to `large`. Keep basic usable controls/labels, but do not spend implementation time on exhaustive display permutations now.
- User requested icon-only navbar (no visible tab labels). Implemented conventional Lucide Map/List/House/MessageCircle/Settings icons with retained screen-reader labels.
- User requested closing Android simulator and focusing on iOS. Android AVD was created temporarily, then closed through adb; no connected Android device remains. Do not relaunch Android or spend time verifying it unless requested. Shared platform support stays in code; Android runtime output is unverified.
- Fresh iOS development binary built and installed successfully (SVG + ExpoBlur modules). Missing `Un` placeholders are gone in actual screenshots. Full-screen map and Report CTA above navbar render correctly in light/dark. Screenshot evidence: ignored tmp/ios-fullscreen-map-light.png and tmp/ios-fullscreen-map-dark.png.
- settings refs-during-render lint violation fixed with state for uncertainty. Navbar incoming TabTrigger row style ordering fixed. Glass uses real native blur plus translucent theme scrim. Map has genuine optional city/state reverse geocoding (generic fallback) and captured-fix timestamp; no invented locality.
- User observed Report CTA hidden by navbar on Incidents. Root cause: iOS KeyboardAvoidingView overrides inline paddingBottom. Fixed by reserving measured navigation inset on a separate outer View in shared Screen. Native confirmation after this fix is the immediate next step.
- Current checks: 111 tests/13 files, strict TypeScript and lint pass (09:27). All-platform export passed before the most recent locality/Screen changes; final export must rerun. Backend deployed successfully 09:23 to basic-newt-690. No commit yet; last pushed HEAD remains c446eaf.
- Metro restarted after confirming old process absent; active exec session 57329, localhost8081, log tmp/metro-navigation.log. iOS build session 31096 is terminal/success; don't poll unknown old handle or rebuild again without native changes.
- New official geometry and shelter/alert/job schema remain preparation, not published emergency functionality. Next functional milestone is authority publication + durable targeting jobs and shelter maintenance.

- At 09:29, actual default-font iOS screenshot tmp/ios-incidents-footer-fixed.png confirmed Report fully above navbar. F10 now checked for the user-prioritized iOS scope; broader display/Android checks remain deferred. No more font-size changes.
- I14 popup implemented in src/features/incidents/IncidentMatchesModal.tsx. checkMatches opens it automatically for candidates or partial results; choice is explicit; dismissal cannot silently create a new incident; Review similar incidents reopens it. Selection closes to a compact form summary; submission still waits for explicit submit/server receipt. Native popup exercise is pending.

- Final checkpoint validation includes the popup/Screen/locality changes: 111 tests, strict typecheck/lint, all-platform Expo export, no whitespace errors, exact configured-secret scan of 354 eligible files. Checkpoint I13/F10/DOC01 is ready to commit; I14 remains native-verification pending.

## Latest popup verification — 2026-10-10 09:36 IST

- Checkpoint **71976bd** is committed and pushed to main. This supersedes the earlier uncommitted checkpoint notes.
- Latest user requirement: show similar incidents in an attention-grabbing popup rather than append suggestions below the report form. Existing IncidentMatchesModal implementation satisfies that presentation: dimmed backdrop, explicit existing observation/new event controls, Close and Review similar incidents reopening.
- Actual iOS screenshot **tmp/ios-modal-check-start.png** now confirms the native modal renders with a nearby flash-flood suggestion and Continue disabled before selection. The app was already displaying the popup when captured; do not claim automation clicked through the full flow or submitted a report.
- I14 remains open for selection/dismiss/reopen and draft-preservation interaction checks; only the native-rendering uncertainty is resolved. Default fonts and iOS-first/functionality-first priorities remain in force.

## Latest submission UX fix — 2026-10-10 09:42 IST

- User reported a loop and clarified: successful detail page had another contribution button; clicking it restarted reporting. This was a confusing success-state CTA, not evidence of failed server persistence or automatic popup recursion.
- I15 implemented: receipt route accepted=1 now shows a prominent saved title, explicit completion explanation and only primary Back to map. Ordinary detail uses session-private eligibility.hasObservation to label existing contributions Update my observation. Other tourists retain the contribution action. Exact retry/independent-witness rules are unchanged.
- Three component regression tests in tests/incidentCompletion.test.tsx cover actual detail rendering/navigation. Added react-test-renderer 19.2.3 and types through Expo install; vitest now includes TSX test files. Backend test checks own-observation boolean per authenticated user. All six dictionaries have new labels (human review pending).
- Checks: typecheck/lint, 114 tests/14 files, iOS export pass. Convex deployed 09:41:45. Screenshot tmp/ios-observation-saved-fixed.png verifies saved-screen layout only via explicit receipt-route display; no new incident submitted. I14 full popup interactions and I05 two-account native acceptance remain open.
- User explicitly requested commit for this fix; review and commit/push it with these updated TODO/progress/context documents. Authority shelter work has not started; resume it after this fix checkpoint.

## Latest shelter work — 2026-10-10 09:55 IST

- **4a24fb1** submission-loop fix committed and pushed; worktree now contains subsequent uncommitted shelter work.
- A07 backend and authority forms implemented. New authorization helper requires exact assigned jurisdiction, active agency/membership and India admission. New scopes query returns only own assigned-area labels. Schema adds shelters.by_jurisdiction_archivedAt for bounded active-list pagination.
- shelters.save/archive/managed/managedDetail enforce immutable ownership, optimistic revision, reasons, exact retry receipts, actual availability confirmation, bounded capacity, scope/India coordinates and audit/index updates. Archives retain history and remove geo indexes. Inactive agency listings are excluded. Official publication/recipient workers and shelter recommendations are still not implemented.
- Settings authority link plus /authority, /authority/shelters and /authority/shelters/edit routes added. Form supports all maintained shelter fields, explicit status confirmation, archive popup, frozen retry and current-version review retaining the draft on conflicts. Do not grant the signed-in tourist authority to demonstrate this without actual operator approval.
- 133 tests/16 files + typecheck/lint pass (14 backend shelter tests and 5 form tests). Approved-account native maintenance acceptance remains pending; A07 stays open. No LIVE shelters or authorities were fabricated. Six new label sets use configured Google Translate; human review pending.
- Next: deploy/check native authority denial, connect public shelter detail/destination actions, then continue official publication/targeting. Keep iOS focus and default fonts. No new native dependencies yet at this checkpoint.

## Latest shelter detail update — 2026-10-10 10:00 IST

- Tourist /shelter/[id] now displays protected maintained details, known status/access limitations, honest unknown capacity and location/status ages. Listing is explicitly not a recommendation; hazard screening/official-instruction precedence/recommender A09 remain unfinished.
- Directions and calling revalidate revision/removal before opening external URLs. Universal Google Maps URL supplies destination only, no private tourist origin/key; browser fallback when app absent. Copying the visible destination does not require networking. Unknown capacity/access, private profile and DEMO access have backend tests; detail interaction tests cover changed/unavailable record, copy fallback and dialer.
- **New native dependency expo-clipboard ~57.0.2 installed through Expo.** CNG iOS prebuild done; native build/install still running **exec session 84937**, log tmp/ios-shelter-native-build.log. Poll this live handle; do not restart on an observation timeout. Earlier iOS binary lacks clipboard until this succeeds. Metro localhost8081 still running.
- Latest checks: 142 tests/18 files + strict typecheck/lint passed. Backend final deploy and iOS export started after these changes; inspect current handles/results. A07/A10 remain open for native approved-account/listed-shelter acceptance and A09-dependent exclusions; no completed-task count should be fabricated to trigger a commit.

## Standalone landing page — 2026-10-10

- User requested a compact, distinctive light/iOS-style landing matching app colors, short idea explanation and Android/iOS links; explicitly required **all landing source inside `web/`, not root**. Implemented independent static HTML/CSS/JS/SVG and an actual development screenshot there. No Expo route, backend change, dependency or root landing setup was added by this task.
- App palette/system sans, restrained cobalt, phone/map visual, short three-part explanation, privacy/safety footer; no fabricated live emergency, testimonials or release availability. Development screenshot uses simulated data and is visibly labeled, with map attribution preserved.
- `web/downloads.js` deliberately contains null URLs pending accessible releases; actions clearly say Release pending. Configure real public HTTPS links when ready; page rejects unsafe/credential-bearing URLs. No public hosting or push/commit performed by this landing task. Q08 remains incomplete.
- Verification: root typecheck/lint pass; Playwright Chromium desktop/tablet/mobile/small (1440/768/390/320 px), no overflow/JS errors, loaded image, zero automated axe WCAG A/AA violations; keyboard skip, reduced motion, absent/configured/test-invalid links pass. Desktop/mobile screenshots in ignored `tmp/gudtour-web-*.png` visually reviewed. Test harness/dependencies remain ignored in tmp, not root package.json.
- Local static preview running on http://localhost:4173 (Python process serving **only web/**; shell sh_124168710001nCS17eh0L2R1Jc). HTTP 200 confirmed separately; browser tests intercepted exact static files after direct localhost navigation timed out. See `web/README.md` for deployment/configuration and limits. Preserve concurrent uncommitted authority/shelter work.

## Latest authority configuration — 2026-10-10 10:12 IST

- User explicitly selected comma-separated backend authority emails. Implemented AUTHORITY_EMAILS + AUTHORITY_AGENCY_ID + AUTHORITY_JURISDICTION_IDS, verified Google authAccounts identity only, audited EMAIL_ALLOWLIST membership sync and live configuration checks. Existing operator memberships remain supported. Explicit operator revocation blocks refresh regrant. Old Google accounts require sign-out/sign-in once to record verified provider email.
- New scripts/configure-authority.mjs and npm run authority:configure; --demo idempotently provisions Chennai 50-km DEMO scope. Successfully ran it against basic-newt-690: private .env.local now has scope IDs and empty email list, mode600. User adds emails and reruns command; exact instructions docs/api-setup.md. No email has been guessed or granted, no LIVE fixtures created.
- Root session automatic sync and Settings Refresh account access implemented. New six-test authorityAllowlist suite includes removal disabling privileged membership before sync. Full suite148/19 + strict typecheck/lint pass; targeted latest test rerun passes. Backend modules deployed10:06:49. Native clipboard build84937 completed/install succeeded; do not rebuild again. Latest iOS export log tmp/ios-authority-export.log.
- Shelter/allowlist work remains uncommitted atop4a24fb1. Preserve independent web/ landing work; do not accidentally include it in this checkpoint. A07/A10 approved-account native acceptance and A09 recommendations remain unfinished. All original emergency/provider/delivery/chat work still pending; do not mark goal complete.

### Authority emails applied — 2026-10-10

User supplied three authority Google account addresses. Saved privately in ignored mode600 .env.local and applied via npm run authority:configure to the existing Chennai DEMO agency/jurisdiction. Read-back comparison verified all three backend configuration variables against local values without printing them. Actual membership is created on each listed user's authenticated sync after verified Google login; this is not evidence that those users have signed in or completed native acceptance. Email values deliberately omitted from committed docs.

## Latest session fixes/publication foundation — 2026-10-10 10:18 IST

- Latest user steering: logout failed/“Stay informed nearby” loop; then explicitly requested red Sign out at bottom of Settings SCROLL, NOT pinned, clear of navbar. Implemented end-of-content danger button; shared Screen already reserves measured navbar inset. Profile retains its existing logout, now with corrected ordering.
- Logout awaits signOut token removal before setFix(null), routes /login; on storage failure keeps GPS and shows error. Location automatic restore effect now depends on readiness, using latest callback ref, not reactive own profile object. Removed repeated AppState automatic restart; explicit refresh remains. New tests/logout.test.tsx (3) and locationLoop.test.tsx (2) cover ordering/error and reactive rerender loop. 157 tests/22 files + strict TypeScript/lint pass. Native taps not verified yet.
- Added convex/declarations.ts publish mutation; new/existing incident CAS, exact assigned scope and full geometry containment, input bounds, exact original immutable instruction/hash, source attribution, atomic alert revision+union geographic cells targeting job+audit+receipt; Jev not called. Tests/declarations.test.ts four checks. Update/withdrawal/review UI/recipient worker still pending, no actual test publication to shared deployment. A04/N04 stay open.
- Current backend deploy log tmp/convex-authority-checkpoint.log, exec79887; iOS export tmp/ios-session-fix-export.log exec43108. Poll these before claiming success. New dependencies unchanged; native clipboard binary already installed. Worktree includes independent web/ landing; preserve it and exclude from this checkpoint.

- Checkpoint backend deployment and iOS export both finished successfully (79887/43108 exit0). Latest user status question answered from actual TODO: 30/110 numbered tasks checked (27%); this is equal task count, not weighted product readiness. Keep delivering full remaining scope.

## Latest authority UI — 2026-10-10 10:25 IST

- Checkpoint8183e2c committed/pushed (session fixes/shelters/allowlist/publication foundation); current subsequent authority UI changes uncommitted. Independent web/ remains untracked; preserve it.
- User logged in with authority email but saw tourist UI, then requested clean authority dashboard like tourist. Backend operator:authorityConfigurationStatus diagnostics returns counts/booleans only: configured3, matched1, Google verifiedtrue, activeMemberships1. Access was active; workspace was buried. Added prominent map CTA, Settings role label and location completion redirect to /authority for approved role.
- Dashboard redesigned matching tourist palette/default fonts/rounded cards with scoped DEMO labels, Declare emergency primary and Manage shelters secondary. No fake metrics/queues.
- New src/app/authority/declare.tsx circular-area declaration form, exact original notice, six languages, severity/action/review-time, modal review before atomic publish, frozen unknown-transport retry and saved completion screen. Does not claim recipient delivery works. Named-shelter/deadline/polygon editing and updates/withdrawals pending. New six-locale labels via GoogleTranslate; human review pending. Backend declaration mutation already deployedpreviouscheckpoint.
- tests/declarationForm.test.tsx two review/retry cases, authorityDashboard.test.tsx scoped action routing, locationLoop new authority route test. Actual screenshot tmp/ios-authority-workspace.png captured declaration form during user interaction; no automated tap or publish claimed. Do not disrupt user's active draft for screenshot purposes.
- Automatic backend recipient worker discussed but NOT written; still next core backend task. Current iOS final dashboard export log tmp/ios-authority-dashboard-export.log.

- Latest authority UI verification complete:161 tests/24files, strict TypeScript/lint and final iOS dashboard export pass. Two test-host typing errors were fixed (dialog intrinsic and typed mocked Pressable); no production workaround. User's current scope is clean authority UI, full app goal remains active. No new composite A01/A03 tasks marked complete.

## Latest location picker/recipient expansion — 2026-10-10 10:29 IST

- User requested selecting affected location/current location and radius instead of lat/long. Implemented native AreaPicker modal in declaration form, tap/drag pin with circle preview, explicit apply/cancel and real current-position capture. Removed coordinate inputs; review still shows the actual selected coordinates transparently. No current tourist location is changed by map selection. Tests/declarationForm now3cases including cancellation. AreaPicker.native uses existing react-native-maps binary; no new dependency/rebuild required.
- Added convex/alertExpansion.ts internal page+resume, publication schedules firstpage. Checkpoint fence,25candidates/page, precision3prefix range of USER precision4 index, exact latest location/India/permissions/30min/1km/area checks, DEMO opt-in, immutable alert snapshot, private deduplicated exposures/userAlerts. New jobs.by_kind_status_dueAt index + convex/crons.ts one-minute recovery. Eight backendtests including31recipients paginated. Sound only marks first exposure; N08 fullpolicy pending. Device jobs, movement exposure, aliases/merges, public alert UI and actualpush still pending. N04 remains open.
- Current full check170tests/25files + strictTypeScript/lint pass. iOS export session92614 logtmp/ios-area-picker-export.log and Convexdeploy81924 logtmp/alert-targeting-deploy.log started; poll exacthandles before reporting success. No test disaster published to actual deployment. UI/map-native taps not yet verified; don't interrupt user's active draft to take screenshots.
- Lastcommit8183e2c pushed; all subsequent authoritydashboard/form/picker/worker work uncommitted. Preserve independentweb/. Commit cadence after3fullyverifiedtodos; do not fabricate composite completions.

- Final picker checkpoint iOS export92614 and backenddeploy81924 both completed exit0. Backend worker deployed with minute recovery; no push sender yet.170tests remain passing.

## Latest priority: persistent logout loop — 2026-10-10 10:35 IST

- User angry that Sign out still loops through current-location page; explicitly says fix FIRST then continue. Pause newemergency feature work until this correction verified/ready. Previous ordering-only fix insufficient; F12 reopened and no native pass claimed.
- LocationSession now tracks in-memory signedOut intent. Both logoutentrypoints settrue BEFORE awaiting signOut, then clearGPS+route/login; failures resetfalse. Login automaticentry suppressedwhileintenttrue; only successful explicit OAuth code exchange/callback clearsit. Intent is UIroutingonly, neverbackendauthorization.
- Map/login/profile/report/incident authredirects now use Expo useFocusEffect; inactive Stack/Tab screens cannot redirect. Protected signedout routes pointlogin insteadlocation. Location autoGPS isfocus-only anddisabledafterexplicitlogout; manual capture remainsallowed. Focusgeneration invalidatesinflight capturebeforeDB/profile/setFix/navigation afterblur/unmount. Manual capturewhen signedout doesnotpersist asoldauthenticateduser or routeprotectedmap.
- Tests/logoutNavigation.test.tsx usesREAL LocationSession provider and Settings→Loginroute, simulates authstilltrue aftersignOut andlaterfalse; nolocationredirect. Additionallocation tests lateGPSafterunmount andnoautoGPSsignedout. Existinglogout tests updatedsetSignedOut mocks.173tests/26files+strictTS/lint pass. FinaliosExport1979 logtmp/ios-logout-race-export.log started; pollbeforeclaimingexport. Actualnative sign-out notautomated; noaccount/sessionsecretsread.
- Earlierplannedpublicofficialinstruction integration wasNOTwritten. Targetingworker frompriorcheckpoint deployed; publicalertUI,movement,devices/pushstillpending. Current worktreeuncommitted atop8183e2c; independentweb/untouched.

- Final logout iOS export1979 finished exit0. Passive native screenshot tmp/ios-logout-current-state.png shows current map, not proof of logout or a completed native sign-out attempt. Do not claim native logout passed from this image. Metro remains live; no forced navigation/reload interrupted user state.173 tests passing.

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

Koodhiyur targeted map-index repair36369 completed successfully with indexed:true. DEMO gate remains until explicit user opt-in.

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


## 2026-10-10 11:42 IST — current checkpoint, supersedes older runtime notes
- User says prioritize app completeness; explicitly defer instruction editing and minor extras. Continue weather/Jev pipeline after SACHET. User asked to minimize ETag work; retained only small provider-required conditional fetch behavior.
- Expo Go OAuth fix pushed fa0c946. Metro restarted in Expo Go LAN mode, exec9354, log tmp/metro-expo-go.log, host172.17.229.92:8081. Exact exp://HOST:8081/--/auth/callback configured in private AUTH_EXPO_GO_REDIRECTS and Convex. Android separate device testing is the user's task, not verified. Installed GudTour scheme unchanged; browser login disabled. Old Metro exec57329 stopped.
- SACHET new files convex/providers/sachet.ts, convex/sachet.ts, convex/lib/sachetValidators.ts; schema feedDocuments/officialNotices/officialNoticeRevisions/officialReferenceTombstones. Fast XML Parser installed via expo install. Two-minute cron plus bounded sequential batches, leases/generation checks and backoff. Originals/revisions/cancellation tombstones, separate polygon XML and exact-geometry evidence query. No SACHET emergency publication, no invented state/locality targeting. Live provider has numeric fetch token vs IN-..._revision CAP identity; regression fixtures preserve this distinction. Trusted Actual/Public reference chains may span issuing senders (real CWC→SDMA example).
- 214 tests/31 files +TS/lint pass, git diff check passes. Convex deployed11:40:49 log tmp/sachet-deploy.log exec85278 completed. Live poll exec27795 completed, follow-up batch scheduler continues. First status exec56715 completed:132 documents/32notices,33successful,zeroerrors,partialfalse. Query status only returns diagnostics, no secrets. E01 checked; E02/E03 still composite partial, automatic qualification integration pending.
- Uncommitted atop fa0c946: authority emergencies management/source end, tourist correction follow-ups and SACHET. Three increments checkpoint due now. Preserve independent untracked web/. Native source-ending and two-client real-time acceptance remain unverified. No shared demo alert was ended for tests.


## 2026-10-10 — weather, decision adapter and evidence construction checkpoint
- Weather provider adapter: fixed HTTPS Bearer authentication; current and optional24-hour history normalized with explicit units/null unknowns. Shared10-minute rounded-area cache, single-flight lease/generation fences, default100 reserved providercalls/day configurable ACCUWEATHER_DAILY_CALL_LIMIT, one-hour cache expiry/cleanup. These controls do not rate-limit incident submission. Current data survives missing history;403/config,429/retry-after and transport failures remain distinct. Provider entitlement/retention review remains open; E04 partial.
- Live internal weather.context Chennai test: AVAILABLE, fresh, City resolution, history AVAILABLE with24samples. No full provider payload retained. Deployed11:45:34.
- Jev adapter: fixedOpenCodeZen jev-1.13, bounded two-stage Choice calls; complete distributions/type/model/choice validation; selected-option probability independentofconfidence; no generated instructions. Live three-case smoke: missing evidence→INSUFFICIENT0.99; fresh synthetic life-threatening flood→NOTIFIABLE0.97; historical minor report expectedNOT_QUALIFIED but model conservatively returnedINSUFFICIENT0.72. This is not a calibrated evaluation; gate remains open. E06partial, noautomaticpublicationworker yet.
- Evidence builder: internal source-backed recent independent samples/counts, ten-kilometre/twelve-month boundedhistory, current/historyweather, exactmatchedSACHET originals, missing-input/truncation/provenance labels. No authoridentity/alias/privatewitnesscoordinates/health/contact/device/chat fields. Immutablehash snapshots fence incident/control/evidence revisions; fetch-time noise excluded fromhash. Communityclosed/official-onlyevents excluded. Authoritysuppression/priorassessmentintegration and automatedpublication pending; E05partial.
- Final SACHET ingestion progressed to99CAPnotices/199documents. Later snapshot170successfuldocuments;29polygon documents rejected (5oversize,24fetch/geometry failures), retained pending geography, not invented targets. Earlier zero-error claim was only first32notice snapshot. Sourceingestion is not complete emergencyinterpretation.
- User is testingAndroidExpoGo separately; leave runtime/device testing to them. CurrentMetro exec9354 LANExpoGo; noAndroidsim opened. Next core step: durable assessment jobs, authoritysuppression/late-result guards and reuse existing recipient publication. Then shelterguidance/contact/chat. Instructionediting andpolish deferred.

Latest verification:227 tests/34files+strictTypeScript/lintpass; evidence final Convex deploy ready11:51:37 IST (tmp/evidence-final-deploy.log,exec60952). Weather/decision/evidence checkpoint ready to commit atopb85d7c7. Still no assessment scheduling/application, suppression UI, safe shelter recommendation, contacts/chat/release. Do not call app complete. Current goal active/no budget. Preserve web/. Update these notes with actual commit hash after push. Internal evidence.build can be exercised next against an existing COMMUNITY incident, but model publication must remain version/suppression guarded. No fictitious emergency was published in live evaluation; ignored script called provider directly only.


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

Replacement release build submitted from pushed commit 05942f2: EAS db0b0df6-9cda-405e-8673-2fd261dbf58e, production-apk, versionCode3, existing managed signing key. Build URL https://expo.dev/accounts/yashvanths-org/projects/gudtour/builds/db0b0df6-9cda-405e-8673-2fd261dbf58e. User previously asked to stop cloud monitoring and will report updates; submission only, do not automatically wait for the whole cloud build. Local :app:processReleaseResources check is running as exec58357 in ignored tmp/splash-resource-check/android; log tmp/splash-gradle-resources.log.

2026-10-10 splash fix verification: isolated Android `:app:processReleaseResources` completed BUILD SUCCESSFUL (251 tasks, 2m27s), confirming the original resource-link failure is fixed locally. Logo/config commit 05942f2 is pushed; replacement EAS build db0b0df6-9cda-405e-8673-2fd261dbf58e (versionCode3) remains the cloud artifact to inspect. No GitHub APK publication or real-device acceptance yet.


## 2026-10-10 — Android testing prerelease published
- EAS replacement build db0b0df6-9cda-405e-8673-2fd261dbf58e FINISHED. User requested five-minute monitoring and publication after success; completed.
- GitHub prerelease v0.1.0-rc.1 published at https://github.com/YashvanthSankar/bits-n-bytes/releases/tag/v0.1.0-rc.1, target build source 05942f295277381c82841f8c66e89d00d0aac742. Assets GudTour-0.1.0-rc.1.apk and SHA256SUMS both uploaded; isDraft=false. APK 117722451 bytes, version0.1.0/versionCode3/package com.bitsnbytes.gudtour/minSDK24.
- apksigner verified v2 signature and certificate SHA1 77:B1:FB:47:55:BB:78:1F:99:48:82:31:CD:8E:3E:4D:C7:60:05:33. ZIP integrity, production hostname in Hermes bundle, absent development hostname, no configured backend secrets or environment files in archive checked. Hermes string-prefix compaction means checking whole uncompressed URL literals is invalid; production hostname is present. Google Maps restriction already confirmed.
- APK SHA256 2fdd8584c5675baa388a2985186e042e176eec4af363cfef4db6d8d8ea172c7d matches GitHub asset digest. Production backend deployed/configured; accounts need fresh onboarding and explicit DEMO opt-in for controlled authority tests. Native/two-client physical acceptance, iOS distribution and remaining product features are still open. Release snapshot delivery complete; do not mark full app goal complete. Preserve independent web/.


## 2026-10-10 — authority normal-report permission fix
- Production APK user reported JURISDICTION_DENIED from the normal report form. Cause: observations.submit auto-promoted any authority membership into an official report, then required matching audience/full jurisdiction; DEMO-only membership could not submit ordinary LIVE reports.
- Normal observation submissions are now COMMUNITY for all account roles. Authority workspace remains the explicit official action and preserves jurisdiction/audience restrictions. No bypass or automatic official verification was introduced. Existing published incidents remain unchanged. Regression tests cover LIVE and DEMO authorities outside assigned geography, unverified COMMUNITY creation, replay and denied official review.
- 256 tests/41 files, strict TypeScript and lint pass. Development and production backend deployments running in exec30458; logs tmp/normal-authority-report-dev.log and tmp/normal-authority-report-prod.log. Installed APK needs no rebuild for this backend-only fix. Android after-location crash remains a separate unresolved report awaiting device crash logs.

Deployment verified: development basic-newt-690 ready14:52:42 IST; production jovial-eagle-875 deployment completed successfully with schema validation. Backend-only normal-report fix is live for existing APK clients. Physical-device retry remains user acceptance.


## 2026-10-10 — hourly assessment, requested budget reset and reports text fix
- User changed periodic Jev assessment from5 to60minutes; policy now HOUR. Observation-triggered immediate assessments and1/5/15-minute transient retry unchanged. Dev/prod deployments both succeeded. Already scheduled work may run once before its next hourly due time.
- User requested today's budget reset. Trusted internal operator.resetTodayJevBudget resets only today's UTC JEV reservation row and resumes MODEL_DAILY_LIMIT pending jobs, with operator audit record. Dev reset100→0 and resumed3jobs; follow-up all3DONE with no lastError, usage6/100 after two calls each. Production unused counter not reset. Historical/provider billing usage is not erased; AccuWeather unaffected by reset.
- Fixed authority reports React Native raw-text error: removed inline JSX space between load-more conditional elements. Simulator uses dev basic-newt-690; GitHubAPK uses prod jovial-eagle-875. Reload Metro simulator for frontend correction; existing release APK does not contain this UI change and would need a new build to acquire it.
-257tests/41files, strictTypeScript/lint pass. Added regression for hourly next due time and reset preserving other providers/historical usage. No physical-device acceptance claim. Existing APK after-location crash remains unresolved awaiting adb logs. Preserve independentweb/.


## 2026-10-10 — Android GoogleMap initialization crash
- User provided physical APK fatal NPE GoogleMap.setPadding on null after location selection. Installed react-native-maps1.27.2 MapManager.setMapPadding unconditionally dereferences view.map; NearbyMap supplied mapPadding at initial mount, before Google native readiness.
- NearbyMap now omits mapPadding entirely until onMapReady (not null/undefined setter), then applies insets. NearbyMap recenter and AreaPicker selected-camera effects also wait for onMapReady. Readiness resets per component mount. No dependency/node_modules/generated-native modifications.
-259tests/42files, strictTypeScript/lint pass. Regression covers initial padding omission, ready padding/camera, remount reset, and picker camera deferral. This verifies lifecycle sequencing, not physical GoogleMap execution. Physical Android retest remains required. Version-matched Expo57 maps documentation and installed native setter inspected.
- Existing GitHub rc1 APK remains affected; new production-apk build required and being submitted. Include latest reports raw-text fix and hourly model cadence. Preserve independentweb/ and dev/prod separation.
