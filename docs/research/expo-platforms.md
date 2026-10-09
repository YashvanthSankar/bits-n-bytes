# Expo Platform Support — Android + macOS (TravelTech, 24h)

**Scope:** Platform feasibility only. This document answers whether an Expo app can ship the team's stated **Android + macOS** goal for the 24-hour web hackathon, and what the honest, viable platform plan is.
**Author context:** Subagent platform research. Planning only. No application code. This file is the only artifact produced by this stream; I own only this file.
**Chosen track:** TravelTech (per team decision). Track content is out of scope here.
**Brief under analysis:** `docs/hackathon-brief.md` (24-hour *web* hackathon that also permits mobile artifacts).
**Evidence date:** 2026-10-09. All claims below are tagged by how they were obtained.

> **Historical platform investigation:** The user subsequently chose **Android + iOS, web landing**. Native macOS and full web/PWA app are no longer requested. Recommendations below about a Mac PWA are superseded; use `../winning-strategy.md` and `expo-ios-delivery.md` for current assignment.

> **Orchestrator release clarification:** The final Android artifact must be a standalone preview/release APK with bundled JavaScript, not just a development-client APK requiring Metro. `expo run:android` and a development-client EAS profile are development checks, not proof of a self-contained submission. Prefer a non-development profile with `android.buildType: "apk"`, then test a clean launch without Expo Go or a development server. Independently re-fetched the APK guide and experimental macOS Expo-module guide. macOS distribution specifics remain unverified; do not infer a paid Apple account is required for every local unsigned run. No published desktop scoring category does **not** establish that organizers reject desktop apps—ask them. Version tables below are dated observations, not a pinned dependency contract.

> **Headline finding:** Expo does **not** target native macOS. There is no documented macOS build target in Expo or EAS Build. React Native for macOS is a separate, Microsoft-maintained **out-of-tree fork** with its own toolchain, and Expo modules on macOS are documented as **experimental**. A native macOS app is therefore **not a viable 24-hour deliverable on the Expo path**. The macOS experience must come from the **Expo web (PWA) path**, which runs in a macOS browser and can be installed as a desktop app — but that is a **substitution that requires explicit user approval**.

---

## 0. How to read this document

| Tag | Meaning |
|---|---|
| **[VERIFIED]** | Confirmed by fetching the cited primary URL in this session; content summarized from what was actually returned. |
| **[INFERENCE]** | My reasoned conclusion from verified facts; not stated verbatim by a source. |
| **[DECISION]** | Recommended position for the build. |
| **[BLOCKED]** | Cannot be done on the stated stack without a substitution or a separate project. |
| **[NOT VERIFIED]** | Not fetched/confirmed; treat as unknown. |

A note on method: an initial guess at the React Native macOS docs URL (`https://microsoft.github.io/react-native-windows/docs/rnm-getting-started`) returned **HTTP 404**; the live macOS documentation is at `https://microsoft.github.io/react-native-macos/...`. This is recorded because the task explicitly forbids assuming native macOS support — it had to be located and confirmed, not presumed.

---

## 1. What Expo officially targets

**[VERIFIED]** `https://docs.expo.dev/versions/latest/` (Expo SDK reference, SDK **57.0.0**) returns an OS-support table that lists **only Android and iOS**:

| Expo SDK | Android | compileSdk | targetSdk | iOS | Xcode |
|---|---|---|---|---|---|
| 57.0.0 | 7+ | 36 | 36 | 16.4+ | 26.4+ |
| 56.0.0 | 7+ | 36 | 36 | 16.4+ | 26.4+ |

The same page's version matrix lists **React Native 0.86, React 19.2.3, React Native Web 0.21.0, React Native TV 0.86-stable, min Node 22.13.x** for SDK 57. There is **no macOS column and no macOS target**.

**[VERIFIED]** `https://docs.expo.dev/workflow/web/` — "Expo has first-class support for building full-stack websites with React." Web is a supported Expo platform via React Native Web.

**[INFERENCE]** Expo's documented first-class targets are **Android, iOS, and web** (with TV via the separate `react-native-tvos` track). **Native macOS is not among them.**

---

## 2. Native macOS: what actually exists

**[VERIFIED]** `https://reactnative.dev/docs/out-of-tree-platforms` lists macOS under **"From Partners"**, not core React Native:

> "**React Native macOS** — React Native for macOS and Cocoa." (links to the Microsoft repo)

**[VERIFIED]** `https://github.com/microsoft/react-native-macos` — the repo is "a working fork of **facebook/react-native** that adds support for the official React Native for macOS implementation from Microsoft" (MIT license, ~4.4k stars). It is a fork, not part of Expo.

**[VERIFIED]** `https://microsoft.github.io/react-native-macos/docs/getting-started` — the macOS setup path is entirely separate from Expo:

```sh
npx @react-native-community/cli init <projectName> --version 0.81.2
cd <projectName>
npx react-native-macos-init
npm run start
npx react-native run-macos
```

It uses **Xcode + CocoaPods** and the standard React Native CLI. The docs say "Be sure to use the same minor version between React Native and React Native macOS."

**[VERIFIED]** `https://microsoft.github.io/react-native-macos/docs/guides/installing-expo-modules` — Expo modules *can* be added to a React Native macOS project, but the page opens with an explicit warning:

> "**macOS support for Expo modules is currently experimental.**"

The integration requires manual `Podfile` edits (`use_expo_modules!`), `babel-preset-expo`, an `expo/metro-config` override that rewrites `react-native` → `react-native-macos` for `platform === 'macos'`, and an Xcode "Bundle React Native code and images" build-phase replacement. The page references the **SDK 53** template. This is a hand-configured bare project, not the Expo managed workflow.

**[INFERENCE / RISK] Version skew:** Expo SDK 57 targets **React Native 0.86**, while the React Native macOS getting-started guide pins **0.81.2** and instructs matching RN minor versions. The docs do **not** publish a supported Expo-SDK-57 + react-native-macos compatibility matrix. Combining them is undocumented territory.

**[BLOCKED] EAS Build has no macOS target.**
- **[VERIFIED]** `https://docs.expo.dev/build/setup/` describes EAS Build as building "a React Native **Android or iOS** project," with commands `eas build --platform android|ios|all`. No macOS platform.
- **[VERIFIED]** `https://docs.expo.dev/build/eas-json/` shows build profiles only support platform-specific keys `android` and `ios`. There is no `macos` configuration object.
- **[VERIFIED]** The one place the word "macOS" appears in EAS distribution docs is `https://docs.expo.dev/build/internal-distribution/`, and it concerns **Apple provisioning device categories** ("iPhone and iPad for iOS, **Mac** for macOS") for iOS ad hoc device selection — **not** an EAS macOS build target.

**[DECISION]** Do **not** promise a native macOS app. It cannot be produced by Expo or EAS Build, and the only route (a separate react-native-macos fork with experimental Expo modules) is a second toolchain with real 24-hour failure risk.

---

## 3. Expo web desktop path vs native macOS

**[VERIFIED]** `https://docs.expo.dev/guides/progressive-web-apps/` — a PWA "is a website that can be installed on the user's device and used offline." The page explicitly says: "We recommend building native apps whenever possible as they have the best offline support, but **PWAs are a great option for desktop users**." It documents a web manifest (`display: standalone`), icons, and a service worker for offline.

**[VERIFIED]** `https://docs.expo.dev/guides/publishing-websites/` — Expo web output (`single` / `static` / `server`) can be deployed to **EAS Hosting**, Netlify, Vercel, AWS Amplify, Firebase Hosting, or GitHub Pages, producing a public URL.

**[VERIFIED]** `https://docs.expo.dev/eas/hosting/get-started/` — `npx expo export --platform web` then `eas deploy` yields a preview/production URL (`https://<name>.expo.app/`).

| Dimension | Expo web / PWA (desktop) | Native macOS app |
|---|---|---|
| Build target | Expo SDK (web) — **[VERIFIED]** | React Native macOS fork — **[VERIFIED]** |
| Managed by | Expo | Microsoft (out-of-tree) — **[VERIFIED]** |
| Toolchain | Metro/Expo CLI; deploy = `expo export` + `eas deploy` — **[VERIFIED]** | Xcode + CocoaPods + RN CLI — **[VERIFIED]** |
| EAS Build support | Web deploy via EAS Hosting; Android/iOS builds via EAS Build — **[VERIFIED]** | **No documented EAS build target** — **[VERIFIED]** |
| Runs on macOS | In browser; installable as PWA ("Add to Dock"/"Install App") — **[VERIFIED]** | As a `.app` bundle — **[VERIFIED]** |
| Offline | Service worker (docs warn it is suboptimal vs native) — **[VERIFIED]** | Native (best) — **[VERIFIED]** |
| Expo modules | Full Expo SDK | **Experimental** — **[VERIFIED]** |
| 24h risk | Low–moderate | High (separate project + experimental + version skew) — **[INFERENCE]** |

**[DECISION]** The honest distinction to state to judges and teammates: the Expo web build is a **browser-based PWA**, not a native macOS application. It gives a usable macOS desktop experience and satisfies the brief's **web** deployment requirement, but it must not be described as a native macOS app.

---

## 4. Android: installable APK vs Expo Go

**[VERIFIED]** `https://docs.expo.dev/develop/development-builds/faq/` — **Expo Go is a development playground**, not a distributable artifact of our app:

> "Expo Go is a playground app for students and learners... It comes with a fixed set of native libraries built in... A development build is a fully featured development environment."

**[VERIFIED]** `https://docs.expo.dev/get-started/set-up-your-environment/` frames Expo Go and development builds as development environments for **Android and iOS** only.

**[DECISION] Expo Go does not satisfy the brief's mobile artifact gate.** The brief requires an "installable and testable format (APK / TestFlight / emulator-friendly build)." Expo Go is a third-party playground that runs our JS bundle — it is not our app's installable binary. The submission artifact must be a **`.apk`** of our app (or an emulator build).

**[VERIFIED] Building an installable APK:**
- `https://docs.expo.dev/build-reference/apk/` — the default EAS Android output is `.aab` (Play Store, not directly installable). To get an installable `.apk`, set one of: `"developmentClient": true` (default), `"distribution": "internal"`, `"android.buildType": "apk"`, or a Gradle command producing an APK (`:app:assembleRelease`, `:app:assembleDebug`, `:app:assembleDebugOptimized`). Then `eas build -p android --profile <profile>`.
- `https://docs.expo.dev/build/internal-distribution/` — `"distribution": "internal"` makes Android generate an **APK** and EAS generates/uses an **Android keystore**. Internal build URLs are shareable (32-char UUID), optionally gated to an Expo account.
- `https://docs.expo.dev/tutorial/eas/android-development-build/` — `eas build --platform android --profile development` produces a `.apk` installable on **device or emulator**; install via EAS QR/"Install" link, Expo Orbit, or `adb install`. A single `.apk` runs on both device and emulator.
- Local alternative (no cloud): `https://docs.expo.dev/develop/development-builds/introduction/` — `npx expo run:android` (add `--device` for a physical phone) compiles and installs locally with Android Studio/Emulator.

**[VERIFIED]** The same APK works on an emulator and a device — `https://docs.expo.dev/build/eas-json/`: "No such configuration is required to run an Android `.apk` on a device and an Android Emulator as the same `.apk` will run with both environments."

---

## 5. Distribution / signing / build prerequisites

| Requirement | Android (Expo/EAS) | Web (Expo) | Native macOS (RN macOS fork) |
|---|---|---|---|
| Account | Free Expo account — **[VERIFIED]** (`build/setup`) | Free Expo account for EAS Hosting (free plan OK) — **[VERIFIED]** | Apple Developer Program ($99/yr) for device install/notarization — **[NOT VERIFIED for macOS specifically]** |
| CLI | `eas-cli` (`npm i -g eas-cli`), `eas login` — **[VERIFIED]** | `eas-cli` — **[VERIFIED]** | React Native CLI + `react-native-macos-init` — **[VERIFIED]** |
| Signing | EAS can **auto-generate the Android keystore** — **[VERIFIED]** (`internal-distribution`) | N/A | Manual Xcode/CocoaPods signing/notarization — **[NOT VERIFIED]** |
| Store fee | **Not needed** for a direct APK. Google Play **$25 one-time** only for Play Store — **[VERIFIED]** (`build/setup`) | None — **[VERIFIED]** | — |
| Local toolchain | JDK 17 (Azul Zulu), Android Studio, Android SDK Platform 36 + Build-Tools + Emulator — **[VERIFIED]** (`set-up-your-environment`) | Node only for export; deploy is cloud — **[VERIFIED]** | Xcode + CocoaPods; macOS **Big Sur 11+** to run — **[VERIFIED]** (`react-native-macos` README) |
| Host OS for build | Android builds from macOS/Windows/Linux — **[VERIFIED]** (`development-builds/introduction`) | Any — **[VERIFIED]** | macOS only — **[VERIFIED]** |

**[DECISION]** For a 24-hour hackathon, the Android path has **no paid prerequisite** for an installable APK: a free Expo account + EAS-generated keystore is sufficient. The **$25 Google Play fee is not required** because we distribute the APK directly via the EAS share link/QR, which matches the brief's "APK / emulator-friendly build" wording.

---

## 6. Time and risk assessment (24 hours)

| Step | Time/risk | Basis |
|---|---|---|
| Expo project + web export + public deploy | Low; `expo export -p web` + `eas deploy` gives a URL — **[VERIFIED]** | `eas/hosting/get-started` |
| EAS Android APK build | "For a small app, builds... trigger within a few minutes" — **[VERIFIED]**; queue can vary and paid plans get priority — **[VERIFIED]** | `build/setup` |
| First local native Android build | Slower (SDK/Gradle/emulator setup; JDK 17 + Android SDK 36) — **[INFERENCE]** from `set-up-your-environment` prereqs | `set-up-your-environment` |
| Expo Go iteration during development | Fast, but **not** a submission artifact — **[VERIFIED]** | `development-builds/faq` |
| Separate native macOS project | **High risk.** Second repo/toolchain (Xcode/CocoaPods), experimental Expo modules, RN 0.81.2 vs Expo SDK 57's RN 0.86, no EAS build target — **[VERIFIED]/[INFERENCE]** | `installing-expo-modules`, `versions/latest` |

**[DECISION]** The deployment gate (10% of the rubric) is easiest to secure via the **web public link**, with the Android APK as the mobile artifact. Native macOS adds the highest-risk workstream for a category the brief does not even list.

---

## 7. Recommended viable platform plan

### 7.1 Option A — RECOMMENDED (respects the macOS goal as a desktop experience)

**One Expo codebase (Expo Router) → web (PWA) + Android (APK).**

1. **Web (primary, satisfies the brief's web path):** `npx expo export --platform web` → deploy to **EAS Hosting** (or Vercel/Netlify) → public URL. Add a **PWA manifest** so macOS users can install it from Safari/Chrome as a desktop app. Runs on macOS in-browser.
2. **Android (mobile artifact):** a **non-development** preview/release profile with `distribution: "internal"`, `android.buildType: "apk"`, and no `developmentClient: true`; bundled JavaScript must work without Metro. Local `expo run:android` is a development check, not release evidence; test a self-contained release artifact.
3. **macOS:** served by the **web PWA**, not a native app.

**Why this is the right call:** it is the only path that is fully supported by primary Expo docs, has no paid prerequisite for the required artifacts, reuses one codebase, and satisfies both deployment options the brief offers (web public link / installable mobile build).

### 7.2 Option B — only if a NATIVE macOS binary is non-negotiable

Treat macOS as a **separate, non-Expo project**: initialize with `@react-native-community/cli` + `react-native-macos-init`, add Expo modules **experimental**, build/run via Xcode. Android stays on Expo/EAS.

**Why this is discouraged:** two codebases, two toolchains, experimental macOS Expo-module support, an unpublished version-skew matrix, no EAS macOS build/signing path, and macOS is **not** one of the brief's listed deployment formats. In 24 hours this risks the 10% deployment score and the "real, working demo" disqualification gate.

### 7.3 Mandatory approval note

**[DECISION]** Adopting Option A is a **substitution**: a browser PWA is **not** a native macOS app. If the team's "macOS app" means a native `.app`, the user must **explicitly approve** replacing it with a browser-installable PWA (Option A) before implementation. Do not silently relabel the PWA as a native macOS app, in the plan, README, or demo video. Option B requires a separate explicit go/no-go decision and should be timeboxed with a kill switch if it slips.

---

## 8. Brief alignment

**[VERIFIED]** `docs/hackathon-brief.md` §Evaluation Criteria 5:

> "Web Apps: Must be hosted and accessible via a public link
> Mobile Apps: Must be provided in an installable and testable format (APK / TestFlight / emulator-friendly build)"

- The brief titles the event a **web development hackathon** yet explicitly allows mobile artifacts. Option A satisfies **both** clauses: a public web link **and** an installable Android APK.
- **macOS is not listed** as a deployment format. A native macOS artifact would neither match "web" nor the listed mobile formats.
- **[INFERENCE]** The PWA is the correct way to honor the macOS *experience* while staying inside the brief's scoring categories.

---

## 9. Verification ledger (exact URLs + what actually fetched)

| URL | Fetch result | Key content used |
|---|---|---|
| `https://docs.expo.dev/versions/latest/` | **[VERIFIED]** | SDK 57; Android/iOS-only OS table; RN 0.86, RNW 0.21.0; **no macOS** |
| `https://docs.expo.dev/workflow/web/` | **[VERIFIED]** | "first-class support" for web via React Native Web |
| `https://docs.expo.dev/guides/progressive-web-apps/` | **[VERIFIED]** | PWA manifest/service worker; "great option for desktop users" |
| `https://docs.expo.dev/guides/publishing-websites/` | **[VERIFIED]** | Web output targets; EAS Hosting, Netlify, Vercel, Amplify, Firebase, GH Pages |
| `https://docs.expo.dev/eas/hosting/get-started/` | **[VERIFIED]** | `expo export -p web` + `eas deploy`; free plan |
| `https://docs.expo.dev/develop/development-builds/introduction/` | **[VERIFIED]** | Dev build methods; host-platform support table; `expo run:android` |
| `https://docs.expo.dev/develop/development-builds/faq/` | **[VERIFIED]** | Expo Go = playground; not a distributable artifact |
| `https://docs.expo.dev/build-reference/apk/` | **[VERIFIED]** | `.aab` default; `.apk` config; device/emulator install |
| `https://docs.expo.dev/build/setup/` | **[VERIFIED]** | Expo account; `eas build --platform android\|ios\|all`; keystore; $25 Play / $99 Apple |
| `https://docs.expo.dev/build/internal-distribution/` | **[VERIFIED]** | `distribution: internal` → APK; EAS generates keystore; shareable URL |
| `https://docs.expo.dev/tutorial/eas/android-development-build/` | **[VERIFIED]** | Cloud APK for device/emulator; QR/Orbit/`adb` install |
| `https://docs.expo.dev/build/eas-json/` | **[VERIFIED]** | Profiles expose only `android`/`ios`; no macOS object |
| `https://docs.expo.dev/get-started/set-up-your-environment/` | **[VERIFIED]** | Android local prereqs (JDK 17, Android Studio, SDK 36); Expo Go/dev-build framing |
| `https://reactnative.dev/docs/out-of-tree-platforms` | **[VERIFIED]** | macOS listed as **out-of-tree partner** platform |
| `https://microsoft.github.io/react-native-macos/docs/getting-started` | **[VERIFIED]** | RN macOS install/run; `react-native-macos-init`; RN 0.81.2; Xcode |
| `https://microsoft.github.io/react-native-macos/docs/guides/installing-expo-modules` | **[VERIFIED]** | "macOS support for Expo modules is currently experimental" |
| `https://github.com/microsoft/react-native-macos` | **[VERIFIED]** | Fork of facebook/react-native; MIT; Big Sur 11+ |
| `https://microsoft.github.io/react-native-windows/docs/rnm-getting-started` | **HTTP 404** | Stale URL; **recorded to show native macOS support was not assumed** |

**Not fetched / [NOT VERIFIED]:** Apple macOS notarization/distribution specifics for the RN macOS fork; a supported Expo SDK 57 + react-native-macos matrix; whether the organizers accept a PWA as the macOS deliverable.

---

## 10. Open questions / confirmations needed

1. **macOS intent:** Does "macOS app" mean a **native `.app`**, or is a **browser-installable PWA** acceptable? (Determines Option A vs B; requires explicit user approval for the PWA substitution.)
2. **Organizer confirmation:** Is a PWA accepted for the web path, and is an Android `.apk` the preferred mobile artifact (vs an emulator build)? (The brief permits both; confirm.)
3. **Toolchain availability:** Is Android Studio + JDK 17 already installed on the build machine, or do we rely on EAS cloud builds? (Affects the first-build time risk.)
4. **EAS account:** Confirm a free Expo account can be used and that cloud build queue time is acceptable within the 24-hour window.
5. **Native macOS (only if required):** Accept the experimental/unsupported status and the second codebase, and set an explicit kill switch.

---

*End of platform research. Planning artifact only; no app code, build, or deployment performed.*
