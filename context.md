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
