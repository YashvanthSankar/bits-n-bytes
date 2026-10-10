# GudTour

### Local alerts. Your language.

**A map-first crisis-communication app for tourists in India—built for Android and iOS.**

GudTour connects nearby community observations, official weather notices, approved-authority instructions, multilingual alerts and shelter information in one mobile experience. Its central question is simple: **“What is happening near me, who is saying it, and what should I read next?”**

Built for **Bits and Bytes CS Week · IIITDM Kancheepuram · TravelTech**.

## Try it / watch it

| Resource | Access |
| --- | --- |
| **Website / Android download entry point** | **[gudtour.zapdos.me](https://gudtour.zapdos.me)** |
| **Demo video — Android + iOS walkthrough** | **`[PASTE_DEMO_VIDEO_URL_HERE]`** |
| **Direct final Android APK** | **`[PASTE_PUBLIC_FINAL_APK_URL_HERE]`** |
| Repository | [YashvanthSankar/bits-n-bytes](https://github.com/YashvanthSankar/bits-n-bytes) |
| Full project explanation | **[Hackathon case study](docs/hackathon-submission.md)** |

**Release note, 10 October 2026:** the final signed Android APK has been built and checked. At this documentation check, the public website still showed release-pending buttons and its APK URL was unset. The website is the intended download destination; public APK access must be connected before judges can install from it. iOS runs as a native simulator development build and is the iOS demonstration target; no public TestFlight/App Store release is claimed. Paste the real recording link above before submission.

### Android installation

1. Open **https://gudtour.zapdos.me** on your Android phone.
2. Once the download is enabled, select **GudTour for Android** and download the final APK. If the page says release pending, use the direct final APK link above once supplied.
3. Open the APK. If Android requests it, allow installation from the browser or file manager used for this download.
4. Launch GudTour, choose your language, complete the location and Google sign-in/profile steps.
5. Keep the app open to receive its real-time **in-app** emergency notices. A fresh, sufficiently accurate location inside India is required for admission.

Android minimum: **Android 7 / API 24**, internet access and Google sign-in. A normal tourist account does not receive authority privileges. Controlled demonstrations require explicitly enabled DEMO data and an approved DEMO authority account.

## The problem statement

**Real-Time Crisis Communication for Tourists During Extreme Weather Events.**

The organizer describes localized floods and cyclones leaving tourists exposed to fragmented warnings, unfamiliar geography, language barriers and unverified social-media rumors. Information exists, but it is difficult to connect it to **a visitor’s location, language and next action** at the moment it matters.

GudTour addresses that communication gap rather than trying to become a weather prediction service or invent a safe evacuation route. Read the [original organizer brief](docs/hackathon-brief.md#traveltech).

## What we built

| Capability | What it does |
| --- | --- |
| **Native Android + iOS app** | Shared Expo/React Native application with Google Maps on Android and Apple Maps on iOS. |
| **Map-first reporting** | Eight hazard categories, location-aware reporting, similar-incident suggestions and distinct witness observations. Community reports do not automatically broadcast emergencies. |
| **Evidence-backed qualification** | Recent observations, AccuWeather, SACHET and retained incident context feed bounded Jev decisions. Backend checks decide whether a result can be applied. |
| **Approved-authority workflow** | Jurisdiction-scoped emergency declarations bypass the model; optional DEMO evidence tools remain separate from emergency publication. |
| **Relevant in-app alerts** | Durable geographic targeting and live subscriptions bring instructions, issuer, severity and nearest listed shelter into the first emergency message. |
| **Six language choices** | English, Hindi, Tamil, French, German and Spanish UI resources; version-bound Google Translation for dynamic instructions with original-text access. Human review remains incomplete. |
| **Shelter information** | Authority-maintained records, status, confirmation time, contact details and straight-line distance. |
| **Nearby community chat** | Location-scoped, alias-based live messages with expiry and limits; chat is not evidence or an official alert channel. |
| **Personal presentation** | System / Light / Dark appearance setting, native iOS typography and bundled Inter on Android. |
| **Public landing page** | Lightweight standalone website under `web/`, showing the actual app and the Android download entry point. |

## The engineering idea

```text
Tourist observation ──► versioned incident ──► evidence snapshot
                                                 │
                            weather + SACHET + recent witnesses
                                                 │
                                           bounded Jev decision
                                                 │
                                      backend eligibility checks
                                                 ▼
Approved authority ──► immediate declaration ──► atomic publication
                                                 │
                                       durable geographic targeting
                                                 │
                            Android / iOS in-app alert + translation
```

**Three distinctions guide the entire system:**

1. A community report is an observation, not an official warning.
2. Model qualification is not government verification.
3. An authority declaration must not wait for a model’s approval.

## Tools and why we chose them

| Tool | Reason |
| --- | --- |
| **Expo SDK 57 · React Native 0.86 · TypeScript** | Share product logic across Android/iOS while retaining native maps, permissions, secure storage and real installable builds. |
| **Expo Router** | Explicit navigation between onboarding, map, incident details, chat and authority workflows. |
| **Convex + Convex Auth** | Reactive reads, authenticated server-side authorization, atomic state transitions and durable scheduled work in one backend. |
| **Google OAuth** | Established sign-in; authority membership is still controlled independently on the backend. |
| **TypeSafe.ai Jev 1.13 via OpenCode Zen** | Bounded decision outputs rather than open-ended emergency advice. |
| **NDMA SACHET CAP/RSS** | Attributed official notices with source geography, timestamps and lifecycle references. |
| **AccuWeather** | Current and recent weather as supporting context, with shared caching and usage budgets. |
| **Google Cloud Translation + i18next** | Separate dynamic instruction translation from local UI strings; preserve original text and language fallback. |
| **react-native-maps · Turf · geohash indexing** | Native basemaps plus application-owned geometry and exact relevance checks after candidate selection. |
| **Vitest · convex-test · component tests** | Exercise authorization, state transitions, jobs, geography and UI recovery—not only successful requests. |
| **EAS/native builds · static HTML/CSS/JS** | Produce mobile artifacts and a small, independently hosted public landing page. |

The [case study](docs/hackathon-submission.md) explains the alternatives, trade-offs, provider boundaries, failure handling and implementation evidence in detail. Installed dependencies are recorded in [package.json](package.json) and the lockfile; installation alone does not imply a shipped feature.

## Verification and honest scope

Latest fresh repository check: **308 tests across 54 files passed**, alongside **TypeScript and Expo lint**, on 10 October 2026.

Final Android artifact recorded in the release handoff:

```text
File:         GudTour-0.1.0-final.apk
Version:      0.1.0 / Android versionCode 13
Package:      com.bitsnbytes.gudtour
Build source: 8059adf
SHA-256:      b5d69141da4daeca32d869b048a1d694a9c578905e2f401627fb81315bb522d2
```

Signature, ZIP integrity, production-backend selection and configured-secret exclusion were checked for that artifact. Automated tests and build checks do not substitute for complete physical-device acceptance.

Current boundaries: **online-first**, **foreground in-app alerts**, **raw nearest listed shelter**, and **iOS simulator demonstration**. Closed-app push, downloaded offline maps, safe-route computation, complete authority review controls, full retention/deletion workflows and comprehensive device/language acceptance are not claimed complete. SACHET browsing/ingestion does not yet mean every urgent notice automatically becomes a targeted emergency. See the [scope and evidence table](docs/hackathon-submission.md#11-what-is-complete-and-what-is-not).

## Run locally

```bash
npm ci
cp .env.example .env.local
```

Configure your own development Convex deployment and the providers described in [API setup](docs/api-setup.md). Public client configuration and backend credentials have different destinations: provider secrets belong in Convex, never `EXPO_PUBLIC_*` or Git.

```bash
npm run backend       # Configure/sync the development backend; keep running
# In another terminal:
npm run start         # Metro for the native development client
# With the relevant local native toolchain/device configured:
npm run ios           # iOS development build
# or
npm run android       # Android development build

npm run check         # TypeScript + lint + 308 current tests
```

Google OAuth callbacks, the Android Maps package/signing restriction, backend provider configuration and approved authority scope must be configured for your environment. Never point development tests at production accidentally. For the separate landing page, run `python3 -m http.server 4173 --directory web` and visit `http://localhost:4173`.

## Read next

- **[Full hackathon case study](docs/hackathon-submission.md)** — problem, solution, implementation, decisions, evidence and demo script.
- **[Submission link template](docs/submission-links.md)** — paste website, final APK and video links in one place.
- [Architecture](docs/architecture.md) · [Detailed engineering plan](TECHNICAL_IMPLEMENTATION_PLAN.md) · [Behavior contract](PLAN.md).
- [Current-state history](docs/current-state.md) · [Acceptance ledger](docs/acceptance-ledger.md) · [Documentation index](docs/README.md).

**GudTour’s contribution is the connected workflow:** local observation → accountable evidence → geographically relevant communication → understandable instructions. Android and iOS share that workflow; the website makes it discoverable.
