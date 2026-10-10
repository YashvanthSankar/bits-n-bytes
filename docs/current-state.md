# GudTour current implementation state

Authority UX (2026-10-10): the DEMO workspace now distinguishes **Publish DEMO emergency now** (immediate authority publication, bypassing Jev) from **Add DEMO Jev test evidence** (never a direct alert). Declaration and notice forms start with essential public fields, map/radius choices and a review; source language, action, review timing, urgency and certainty are available under More options. DEMO test guidance and labels use the i18n resource system with English fallback while translations await review. Full suite (290 tests/48 files), strict TypeScript and lint pass; physical two-account DEMO acceptance remains pending.

Emergency UI (2026-10-10): first popup and persistent warning now display the notice/instructions, severity, authority, DEMO and nearest shelter details directly. Removed the intermediate read-instructions action and generic proximity/availability filler. TypeScript/lint and 280 tests/46 files pass; physical popup acceptance remains pending.

Latest UI/startup checkpoint (2026-10-10): compact collapsible map panel, SACHET tab in place of unimplemented Chat, icon controls, relative incident timestamps and expandable assessment details. Returning-user root startup remembers completed setup, restores authentication and quietly refreshes location before Map. Strict TypeScript/lint and 277 tests/46 files pass; authenticated native cold-start and populated UI/device matrix still require acceptance. Existing APK artifacts do not contain these source changes.

Updated: 2026-10-10. Source checkpoint `0a3443d`; later documentation-only commits do not change the APK. This page supersedes older status summaries. PLAN.md remains the core product contract with its dated user overrides. Implementation, automated checks and physical-device acceptance are separate.

## Environments and artifacts

| Environment | Current state |
| --- | --- |
| Development Convex | Denoise Labs GudTour `basic-newt-690`; used by local `.env.local`, Metro and the iOS simulator. |
| Production Convex | Denoise Labs GudTour `jovial-eagle-875`; current functions/schema/provider configuration deployed. Separate accounts/data; no dev tourist data copied. |
| Public Android rc.1 | GitHub prerelease `v0.1.0-rc.1`, versionCode 3, source 05942f2. User reported a fatal GoogleMap padding initialization crash. Does not contain the latest frontend fixes; do not use as proof of a working Android release. |
| Local Android rc.2 | EAS local build succeeded, versionCode 4, source 0a3443d. `tmp/release-artifacts/GudTour-0.1.0-rc.2.apk`; same signer as rc.1. ZIP/signature/production-hostname/configured-secret scan pass. Physical crash retest pending. |
| GitHub rc.2 | Upload explicitly stopped by user. Draft exists with checksum only; APK is not uploaded and release is not public. Do not resume upload without a new request. |
| iOS | Simulator development build and user testing available; no physical iOS/TestFlight distribution verified. |

rc.2 SHA256: `08d71a534935269432a29d971e49c4f6d302bee1641a6b60498a5921d400a9dc`.
Signing SHA1: `77:B1:FB:47:55:BB:78:1F:99:48:82:31:CD:8E:3E:4D:C7:60:05:33` (configured Google Maps restriction). Production Google OAuth HTTPS callback is saved. Backend secrets remain in Convex/private environment, never client public variables. Independent untracked `web/` is not part of the app release and must be preserved.

## Implemented, with verification limits

| Area | Implemented behavior | Remaining acceptance or gaps |
| --- | --- | --- |
| Entry/auth/profile | Google OAuth, runtime callback handling, language/profile onboarding, India/location gate, settings/sign-out. User confirmed sign-out fix. | Android standalone login/restore/gate matrix and full permission revocation/cold start checks. |
| Tourist incidents | Eight hazard types, fresh acknowledged location, time/text checks, similar-incident popup, idempotent submit/replay, independent witness counts, report/detail/map/list and evidence summaries. No incident submission rate limit. | Full two-account native flow, correction/withdrawal/flag/merge UI, richer filters/grouping and lifecycle acceptance. |
| Authority | Approved jurisdiction-bound workspace, clearly separated immediate DEMO emergency and Jev-only evidence paths, progressive declaration/test-notice forms, existing/new incident declaration, managed declaration endings, shelter CRUD/location picker, report review and saved Jev context. DEMO authorities can create/withdraw clearly labeled DEMO test notices confined to an assigned jurisdiction. Normal report form always creates COMMUNITY observations, including for authority accounts. | General verify/merge/reject/hazard/severity/area review controls, instruction editing and dedicated suppression/review controls; native acceptance. Existing configured authority scope is DEMO, not LIVE government approval. |
| Alerts | Atomic publication and durable recipient expansion, exact geographic eligibility, movement reconciliation, global foreground in-app popup, dismiss/reopen and source endings. Official declarations bypass Jev. | Two open clients inside/outside/stale-position acceptance, overlap/order/material updates/sound/reentry checks. Closed-app OS push deliberately deferred. |
| Languages | Six-language UI resources; original official instruction and version-bound Google Translation with fallback/status. | Human review and end-to-end names/numbers/deadlines/negation/strength checks. |
| Shelters | Authority maintenance, DEMO opt-in visibility, nearby list/detail and raw nearest straight-line ordering/alert CTA. | Physical create/edit/archive/navigation acceptance; status freshness confirmation. No eligibility or safe-route guarantee. |
| SACHET | CAP/RSS ingestion, conditional caching, normalization, geometry handling, source revisions/endings, latest-notice page and full originals. | Some upstream polygon requests fail; keep geography unknown. Complete urgent/advisory interpretation and source-driven emergency fanout. Browsing notices is not automatic emergency publication. |
| AccuWeather | Current/history adapters, explicit unknowns, bounded shared cache, provider call budget. Live calls verified. | Entitlement/retention confirmation and broader outage/device scenarios. |
| Jev | Evidence snapshots, two-stage bounded Choice, durable queue/leases/retries, version/control guards, qualification/publication and authority saved-context inspection. | Held-out quality/calibration evaluation, operator review/retry controls and broader failure acceptance. Smoke calls are not accuracy proof. |

Latest automated checkpoint: **263 tests / 43 files**, strict TypeScript/lint pass. The prior Expo Doctor **21/21** and local production APK build remain valid evidence; neither proves physical Android crash resolution or complete crisis workflow acceptance.

## 2026-10-10 — DEMO authority test evidence notices

- Added a separately stored `demoEvidenceNotices` workflow. An active DEMO authority must select an assigned DEMO jurisdiction and a fully contained circle; creation is idempotent/audited, starts immediately, defaults to a two-hour UI expiry and rejects more than 24 hours. Only the issuing authority may withdraw an active notice early.
- These records are explicitly labelled “DEMO authority-created test evidence,” are never `officialNotices`, never contribute to SACHET feed freshness or tourist official-source presentation, and cannot directly publish alerts. Jev includes only geographically overlapping active records in a DEMO incident snapshot; LIVE incidents always receive none.
- Automated typecheck/lint/backend tests cover creation, withdrawal, authorization/containment, expiry/overlap exclusion and evidence labels. The UI is typechecked/linted; the required physical two-account test—DEMO authority injects → DEMO tourist reports in circle → Jev evidence view confirms label and normal qualification behavior—remains pending.

## 2026-10-10 — development authority access repair

- The Expo-connected development backend had the email allowlist but lacked configured agency/jurisdiction values and matching records, so account refresh returned `CONFIGURATION_REQUIRED`.
- A repository-managed DEMO Chennai authority scope was seeded and configured privately. One allowlisted verified Google account has been detected; the pending device action is **Settings → Refresh account access**, which should create its DEMO membership and reveal the Authority workspace. No LIVE authority, official SACHET record, incident, or emergency was created.

## 2026-10-10 — Android hotfix follow-up

- Synced the checkout to `origin/main` through commit `c37efd0`. The pulled map fix waits for native `onMapReady` before supplying `mapPadding` or issuing a camera animation; its component regression test covers both initial mount and remount.
- A physical Expo Go run also exposed a client/backend mismatch: the app requested `sachetPublic.latest`, which was absent from its targeted Convex deployment. The local Convex selector was aligned with the app's public Convex site and the pulled functions were deployed successfully. The device must retry the SACHET screen to confirm the public function is now reachable.
- Expo Go Google authentication remains dependent on the currently advertised LAN callback being configured in the app-targeted Convex deployment. It changes when Metro's host or port changes; it is not a Google Cloud redirect URI.

Jev periodic reassessment is **60 minutes** per eligible community incident; new/updated observations queue immediately. Transient retries remain1/5/15 minutes. A worker sweep runs each minute but does not itself call Jev for every incident. Each assessment reserves2 calls; daily default100 per deployment, UTC reset at05:30 IST. On request, today's development counter was reset100 → 0, three blocked jobs completed and immediate follow-up usage was6/100 (historical observation, not a live balance). Production was unused at that check. This internal counter is separate from provider billing/credit.

## Remaining work in priority order

1. **Stabilize real-device core flows.** Install local rc.2 over rc.1, reproduce location→map without the NPE, then Google login/restore/sign-out. Verify two-client emergency targeting, translations, dismissal/reopen, source endings, shelter creation and reports context. Record actual device/build results.
2. **Complete incident/authority management.** Corrections/withdrawal/flags, merge/reject/verify/resolve and area/severity changes with concurrency checks; dedicated suppression/review/retry UI. Instruction editing was deferred by user and is not an immediate assignment.
3. **Complete provider behavior.** Source urgent/advisory/cancellation interpretation and geographic fanout; explicit failed geometry handling; Jev held-out decisions/failure cases; provider usage and entitlement evidence.
4. **Implement nearby chat and moderation.** Current chat tab is a placeholder. Backend stream/composer/expiry/limits/reporting/moderation/mute/appeals are not implemented.
5. **Finish recovery/privacy.** Reliable cached snapshots, unsent drafts/reconnection, retention jobs, deletion/anonymization and full disclosure/lease-recovery acceptance.
6. **Finish distribution and submission.** rc.2 GitHub publication is paused by user; physical iOS signing/TestFlight, verified landing links/screenshots, language review, demo video and rehearsal/submission evidence remain open.

## Explicit scope overrides

- Online-first; downloadable offline maps are deferred.
- Foreground custom in-app notifications; native push/permission/APNs/FCM and closed-app delivery are deferred.
- Raw nearest listed shelter; eligibility filtering is intentionally excluded.
- Emergency contacts are explicitly deferred by user, not the next active feature.
- No incident submission rate limit; provider budgets still apply.
- Minor polish/accessibility/responsiveness and instruction editing were deprioritized by user. Do not silently schedule them ahead of functional completion.
- Do not restart GitHub upload: user explicitly stopped it. Do not claim full app completion or a precise completion percentage from legacy checkbox counts.

Use [TODO.md](../TODO.md) for task IDs, [acceptance-ledger.md](acceptance-ledger.md) for pending scenarios, and [context.md](../context.md) for agent continuity. Historical progress notes remain dated evidence rather than current-state claims.

2026-10-10 UI hotfix: native runtime lacks Intl.RelativeTimeFormat; relative timestamps now use localized templates without that API. Missing-Intl regression passes; native populated-screen retry remains pending.


## 2026-10-10 — Android typography and nearby chat request
- Android shared text and inputs now use bundled Inter regular/medium/semibold/bold through the Expo 57 font plugin; iOS keeps native system typography. Inter by Rasmus Andersson is distributed under SIL OFL 1.1; license bundled with @expo-google-fonts/inter (LICENSE_FONT).
- Verification: strict TypeScript, lint and 280 tests / 46 files pass. Local signed production APK build running (exec42630), ignored output tmp/release-artifacts/GudTour-0.1.0-rc.4.apk and private log tmp/inter-local-build.log. Prior no-font build exec67777 canceled. No GitHub publication authorized. Artifact verification pending.
- User now explicitly authorizes nearby proximity chat without moderation. This overrides prior moderation/report/appeal requirements; implement authenticated geographic chat, not moderation machinery. Existing private profile/location and official-emergency boundaries remain.


## 2026-10-10 — Chat implemented, combined Android snapshot next
- Nearby community chat implemented without moderation per user override: authenticated fresh <=5min/<=500m India GPS, exact15km immutable origin, public alias only, 24h expiry, 500characters, 5/min+30/hour, idempotent sending, bounded latest100 live stream, plain text without clickable URLs/media/DMs. No incident/evidence effects. Ten-minute bounded cleanup deletes expired body/origin. Six UI locales. No authority announcements/mute/structured incident cards yet.
- Dev+prod Convex deployments succeeded. Simulator chat screen rendered with composer/empty state and labelled navigation. Physical two-client Android/iOS, accessibility, all six language layouts and offline/reconnect journeys still need actual acceptance.
- User supplied UI audit feedback; Settings simplified to grouped rows, language chooser collapsed, redundant profile/privacy explainers removed, signout quieter; six navbar destinations now labelled, full menu for large text/narrow screens.
- Bundled Inter APK rc.4 complete and delivered locally, versionCode6; expected signing identity, ZIP integrity, four Inter font resources and production-only backend/absence of configured server secrets verified. SHA25633ecea7dae74e699b2dfb093990c861ec8c70b2cefe968f8c0824f6f2e9dfa52. Build42630 finished. No GitHub release publication. Combined chat+Settings+font APK next.


2026-10-10 latest design decision: user explicitly selected ORIGINAL BLUE with better layouts and spacing, rejecting turquoise and palette experiments. Restored original cobalt tokens; no experimental dark header blocks remain. Navbar icon-only per explicit request (accessible labels and full expanded menu retained). Chat composer now one multiline input with adjacent44px circular send button, count only near limit, centered empty state, and no forced scroll while reading old messages. Settings grouped rows/collapsed language and typography/spacing hierarchy retained. Combined localAPK build pending after final checks.

2026-10-10 final frontend scope: original cobalt restored throughout chat send/sent bubbles; no dark decorative header cards. Removed SACHET detail's original CAP XML external button and redundant bottom list button; added visible44px top back control with router-back/list fallback and six localized accessible labels. Latest verification pending final check.

2026-10-10 release checkpoint: strict TypeScript, Expo lint and288 tests/47files pass, including updated SACHET back/fallback and XML removal, GPS500m chat vs200m reporting, radius/privacy/expiry/auth/idempotency/burst+hour limits. User now explicitly requested releasing the new APK after building; this supersedes prior publication stop for this new combined snapshot only. Next build rc.5, verify signing/package/version/fonts/prodbackend/no configured secrets/ZIP/checksum, then publish GitHub testing prerelease. Physical Android, two-device chat, large text and six-language journeys remain unverified.
