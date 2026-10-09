# Expo iOS Delivery — Physical Device, TestFlight, Ad Hoc, Simulator (24h TravelTech)

**Scope:** iOS delivery feasibility only. Planning artifact; **no accounts, builds, code, or deployments**. Platform decision: **Android + iOS, plus a web landing page**; native macOS dropped (do not build macOS, do not substitute a full web app). Evidence date 2026-10-09; every URL below was fetched this session unless tagged otherwise. This file is the only artifact produced by this stream.

**Brief gate:** mobile apps must be "installable and testable (APK / TestFlight / emulator-friendly build)" (`docs/hackathon-brief.md` §Evaluation Criteria 5).

> **Orchestrator update:** User confirms an active paid Apple Developer account; signing roles unverified. Internal TestFlight is team-only QA, not outside-judge access. Ad hoc needs actual tester UDIDs; otherwise use external TestFlight approval or an organizer-accepted simulator fallback. Orchestrator fetched Expo TestFlight/simulator pages independently on 2026-10-09, confirming these distinctions. No account/build operations occurred.

## 1. Bottom line

There are **four different iOS outcomes**; conflating them is the main failure mode.

| Outcome | Real iPhone? | Paid account? | Standalone? | Notes |
|---|---|---|---|---|
| Ad hoc internal distribution | Yes | Yes | Yes | UDID allow-list; shareable URL; no store review |
| TestFlight (internal / external) | Yes | Yes | Yes | Store-signed `.ipa`; external needs Beta App Review |
| Simulator build (`ios.simulator`) | **No** | **No** | Yes | `.app` runs only in the iOS Simulator on macOS |
| Development build (dev client) | Yes/No | Depends | **No** | Needs `npx expo start` (Metro) |

**Recommended checkpoint choice:**
1. If a **paid Apple Developer account** is available and the judging iPhone's UDID can be registered early → **ad hoc internal distribution** is the fastest real-iPhone iOS artifact (no review, install URL). Use **TestFlight internal** as parallel/backup. **External TestFlight only if Beta App Review slack exists.**
2. If no paid account, or organizers accept a simulator/emulator artifact → ship a **release iOS Simulator `.app`** (standalone, no Expo Go) plus exact run instructions, and keep the **Android APK** as the primary installable.
3. Never relabel a simulator build as a real iPhone release. Never relabel a dev build as standalone.

## 2. Mechanisms (verified)

- **Simulator:** `eas.json` → `ios.simulator: true`; `eas build -p ios --profile <preview>`; `eas build:run -p ios` installs it. Expo: "a standalone (independent of Expo Go) version of the app running without needing to deploy to TestFlight or even having an Apple Developer account." Also: **"iOS Simulator builds can only be installed on simulators and not on real devices."**
- **Ad hoc internal:** `"distribution": "internal"`; device UDID allow-list at build time. Add via `eas device:create`, then rebuild or `eas build:resign`. Paid membership device-registration limits apply across apps, not per app. Shareable URL; no store review, but device registration/build time is not guaranteed. **EAS "internal distribution" ≠ TestFlight "internal testing."**
- **TestFlight internal:** production `distribution: "store"` `.ipa`; up to **100** App Store Connect team testers; per Expo's TestFlight table **no Beta App Review**, "available as soon as the build finishes processing"; invited by email only.
- **TestFlight external:** up to **10,000** testers; **Beta App Review required on the first build of every app version**; email/CSV/public link; beta description + feedback email required. Apple: external testers need "your first build already approved by App Review for TestFlight." Builds expire after **90 days**.

## 3. Account, signing, provisioning

- **Paid Apple Developer Program: $99/year** (Apple). Required for TestFlight and for signing a build installable on a real iPhone via EAS. A free account cannot distribute; TestFlight and App Store Connect require membership.
- **Free account limits (Apple):** on-device testing via an Xcode personal team only — up to 10 App IDs, 3 devices, 3 apps per device; provisioning profiles **expire after 7 days** (rebuild/reinstall). This is a *dev* install, not a distributable artifact.
- **iOS signing credentials:** Distribution Certificate and Provisioning Profile. Push Notification Key only if push is enabled; push is outside MVP. EAS can manage credentials; Apple Developer Program membership required. Profiles expire after 12 months.
- **Ad hoc** needs each device's UDID in the provisioning profile at build time; **TestFlight** needs an app record in App Store Connect (EAS Submit can create it).

## 4. Timing and access (schedule risk)

- **EAS build queue:** variable; no promised duration. Paid plans get priority (per prior platform research; not re-verified here).
- **TestFlight processing:** Expo states 5–10 minutes (submit page says 10–15); no guarantee.
- **TestFlight external Beta App Review:** required; **no guaranteed review duration**. Only attempt it if hours of slack remain.
- **Ad hoc:** installable immediately after the build; **but device registration can lag.** Apple: 1–10 registered devices "upon registration"; 11–100 "within 24 to 72 hours"; new/renewed memberships may need extra processing. Expo warns the first build/re-sign that includes a new device may fail for new/renewed memberships — wait, then rebuild.
- **Implication:** register the judging iPhone's UDID and start the iOS build at **T0**, not T+18. Production App Review is a separate, later step and is **not** needed for ad hoc or TestFlight.

## 5. Anti-conflation rules (state these in the README/video)

1. A free simulator build is **not** a real iPhone release.
2. A dev client build requires Metro (`npx expo start`) and is **not** a standalone artifact.
3. EAS "internal distribution" is **not** TestFlight "internal testing."
4. A free personal-team Xcode install (7-day, needs the device) is **not** a distributable artifact.
5. Expo Go is a playground, not our artifact.
6. A web landing page **links to actual artifacts**; it must not claim a working web app.

## 6. Checkpoint recommendations

| Checkpoint | Action | Decision |
|---|---|---|
| CP0 (T0) | Ask organizers which iOS format is accepted (TestFlight link / ad hoc install link / simulator or emulator build). Confirm who holds a paid account + Account Holder/Admin role. | Branch selection |
| CP1 (T0–T1) | If paid account: `eas device:create` the judging iPhone; start the ad hoc internal build. In parallel, build a release simulator artifact as fallback. | iOS artifact in flight |
| CP2 | If ad hoc install succeeds on a clean device → primary iOS artifact = ad hoc URL; optionally add TestFlight internal. | Ship ad hoc |
| CP3 | If no paid account / organizers accept simulator → primary installable = Android APK; iOS = release simulator `.app` + exact repro; landing page labels it a simulator artifact. | Ship simulator fallback |
| CP4 | If only TestFlight is acceptable, internal is team-only QA; outside judges require external review plus actual invitation/link access. Start early; no guaranteed review time. | Constrained; upload alone is not judge access |

## 7. Landing page / artifact honesty

- Link only to artifacts that actually exist and were tested: Android APK (direct), iOS ad hoc install URL or TestFlight public link, and a simulator `.app` **only if organizers accept it**, with the exact OS/simulator used.
- Label each link (platform, format, build id/date). Do not imply the landing page itself is the app.
- If a web build is shown, it is informational; do not claim a "working web app" unless that exact build was deployed and tested.

## 8. Evidence ledger (exact fetched URLs)

| URL | Verified content |
|---|---|
| `https://docs.expo.dev/build/internal-distribution/` | internal → iOS ad hoc/enterprise, UDID allow-list, 100 iPhones/yr, `eas device:create`, rebuild/re-sign; unauthenticated-URL option |
| `https://docs.expo.dev/build-reference/simulators/` | `ios.simulator: true`; standalone, no Expo Go/Apple account; `eas build:run -p ios`; dev build needs `npx expo start` |
| `https://docs.expo.dev/submit/testflight/` | paid account; internal vs external table; internal = no Beta App Review; external = required; 5–10 min processing; 90-day expiry; internal distribution ≠ internal testing |
| `https://docs.expo.dev/app-signing/app-credentials/` | iOS distribution cert / profile / push key; EAS auto-manage; re-sign; profile 12-month expiry |
| `https://docs.expo.dev/app-signing/managed-credentials/` | generating iOS credentials requires Apple Developer Program membership |
| `https://docs.expo.dev/submit/ios/` | production `.ipa`; TestFlight appears after processing (10–15 min); App Review separate |
| `https://docs.expo.dev/review/overview/` | TestFlight requires paid account; internal ≤100, external 10,000; internal distribution is ad hoc/APK URL |
| `https://docs.expo.dev/develop/development-builds/introduction/` | "iOS Simulator builds can only be installed on simulators and not on real devices"; iPhone builds need paid account; dev build → `npx expo start` |
| `https://docs.expo.dev/build-reference/npx-testflight/` | `npx testflight` builds+signs+submits; paid account required |
| `https://developer.apple.com/programs/` | **$99 annual** membership; free account = on-device testing via Xcode; TestFlight in paid tier |
| `https://developer.apple.com/help/account/reference/device-registration-updates/` | 1–10 devices upon registration; 11–100 within 24–72 h; new/renewed membership processing |
| `https://developer.apple.com/help/account/basics/about-your-developer-account` | free personal team: 10 App IDs, 3 devices, 3 apps, 7-day profiles; paid required for App Store Connect/TestFlight |
| `https://developer.apple.com/testflight/` | external testers require first build approved by App Review; ≤100 internal / 10,000 external; 100 builds |
| `https://developer.apple.com/support/compare-memberships/` | **[fetch timed out]** |
| `https://developer.apple.com/help/app-store-connect/test-a-beta-version/testflight-app-store-review/` | **[HTTP 404]** — use the `developer.apple.com/testflight/` and Expo TestFlight pages instead |

## 9. Caveats / not verified

- Expo `review/overview` says both internal and external TestFlight "wait for the automated review," conflicting with the dedicated TestFlight page (internal: no Beta App Review). Treat internal as **no** Beta App Review, matching Apple's external-only review language; confirm in App Store Connect.
- No guaranteed EAS queue, TestFlight processing, Beta App Review, or App Review durations.
- Fees, device/tester limits, and registration windows are current-at-fetch; re-verify before relying on them.
- Whether organizers accept a **simulator** artifact for iOS is unconfirmed — CP0 must ask.
- `compare-memberships` fetch timed out; the $99 figure is taken from `developer.apple.com/programs/`.
- No accounts, builds, code, or deployments were performed.

*End of iOS delivery research. Planning artifact only.*
