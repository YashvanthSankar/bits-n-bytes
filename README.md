
# GudTour

### Local alerts. Your language.

**A map-first crisis-communication app for tourists in India, built natively for both Android and iOS from one shared codebase.**

<img width="1536" height="1024" alt="GudTour Local Alert Architecture" src="https://github.com/user-attachments/assets/1facf822-c8a2-415b-bb46-973bd222656f" />

GudTour answers one question for a visitor under stress: **“What is happening near me, who is saying it, and what should I read next?”**

It connects nearby community observations, official weather context, official SACHET notices, approved-authority instructions, multilingual alerts, shelter information, and nearby community chat in one mobile workflow.

Built for **Bits and Bytes CS Week, IIITDM Kancheepuram.**

---

## 1. Submission links

| Resource | Link |
| --- | --- |
| Website / Android download page | https://gudtour.zapdos.me |
| Demo video, Android + iOS walkthrough | https://drive.google.com/drive/folders/1O6Q8Cfs1UXP0nRU4mV6cVA-V32AseBHX |
| Direct public final Android APK | Available on the website |
| Repository | https://github.com/YashvanthSankar/bits-n-bytes |
| iOS access | Native iOS demonstration in the video |

Judges can install the Android build from the website and watch both platforms in the demo recording.

---

## 2. The problem statement we chose

**TravelTech: Real-Time Crisis Communication for Tourists During Extreme Weather Events.**

The organizer’s problem is not a shortage of weather data. It is a delivery failure:

- Local warnings, emergency broadcasts, and safe-zone declarations are fragmented.
- They are rarely translated or localized for tourists.
- Travelers cannot verify which areas are actively unsafe.
- They cannot easily access translated instructions from local authorities.
- They fall back to chaotic, unverified social-media rumors.

The stated impact is panic, stranded travelers entering high-risk zones, and unnecessary strain on rescue services.

A concrete example: a tourist in an unfamiliar Indian city sees sudden flooding nearby. A forwarded message names a flooded road. An official notice names a district the visitor does not recognize. A shelter is listed somewhere else, with no clear confirmation time. A social post says one thing, a notice says another, and neither is in the visitor’s language.

GudTour was designed around four needs from that moment:

1. Geographic relevance: does this concern where I actually am?
2. Provenance: is this a witness report, official instruction, or model judgment?
3. Understandability: what does it say in my language, including what I must not do?
4. Next information: where is the original, and what shelter information exists?

GudTour does not claim to predict weather, establish physical ground truth from a phone, or certify any route as safe.

---

## 3. What we built

### One product, two native platforms

The same GudTour workflow runs on:

- **Android:** signed installable APK for judges and users.
- **iOS:** native iOS build demonstrated in the demo recording.
- **Website:** a public landing and Android download entry point at https://gudtour.zapdos.me.

This matters because tourists do not all carry the same phone. Building both platforms keeps incident behavior, authority behavior, alerts, translations, and shelter information consistent.

### Tourist onboarding

1. Choose one of six languages: English, Hindi, Tamil, French, German, or Spanish.
2. Complete mandatory foreground location admission inside India.
3. Complete Google sign-in and profile setup.
4. Public displays use an alias, not the private profile.
5. Choose System, Light, or Dark appearance; the choice is saved on the device.

Missing permission, an old location, an inaccurate fix, or a location outside India leads to recovery guidance, not a fabricated position.

### Tourist reporting without rumor broadcast

Tourists can report eight hazards:

- Flash flood
- Flood
- Landslide
- Cyclone
- Storm
- Coastal surge
- Heat
- Other

The report flow validates observation time, description, and fresh location. It shows similar nearby incidents so a tourist can contribute to existing evidence instead of creating a duplicate emergency.

A tourist report enters as a **community observation**, not as an official warning. Repeat submissions use idempotency so retries do not create false additional witnesses. Observations by the same person do not inflate independent corroboration. A normal tourist report remains community observation even if that account also has authority access elsewhere.

### Evidence-backed qualification

The backend builds a timestamped evidence snapshot from:

- Recent independent observations near the incident.
- Current and recent AccuWeather conditions.
- Geographically relevant NDMA SACHET notices.
- Retained incident context and contradictions.
- Explicit unknowns where provider data is unavailable.

A bounded Jev decision model evaluates only defined outcomes. Backend version and policy checks decide whether the result may be applied. Missing, stale, malformed, uncertain, or late results cannot silently become confirmed emergencies.

### Approved-authority communication

Approved authorities work in a separate jurisdiction-bound workspace. Backend membership and jurisdiction checks control permission. The interface never grants authority by itself.

An approved authority can:

- Declare an emergency immediately for a selected incident or area.
- Maintain shelters and their status, confirmation time, address, access instructions, and phone details.
- Review reports and relevant decision context.
- End its own source-specific emergency without deleting another active authority source.
- Use isolated DEMO evidence tools for controlled testing.

Authority declaration bypasses Jev because an official instruction must not wait for model approval. Optional DEMO test notices are separate: they can supply controlled evidence for assessment, but they never directly publish an alert and never appear as LIVE official notices.

### Alerts that reach the right open clients

Publication and its geographic expansion job are committed together. Expansion creates deduplicated recipient exposures through bounded, resumable work.

Eligible open Android and iOS clients receive a foreground in-app alert through live subscriptions. The first emergency message shows:

- Actual instructions.
- Issuer and source type.
- Severity and DEMO label where applicable.
- Original text and translation state.
- Nearest listed shelter details.
- Active, ended, stale, uncertain-location, and outside-area states.

Dismissal changes presentation, not the underlying emergency. Persistent warning and detail screens preserve access. No closed-app OS push delivery is claimed.

### Translation and original instructions

Static app text uses reviewed local resources for six languages. Dynamic official instructions use backend Google Translation tied to the exact original version and target language.

If translation is missing, stale, or fails, the app retains the original and its status. It does not substitute an older translation under a newer instruction. Machine translation is not labeled authority-approved. Full human review of names, numbers, deadlines, negation, and instruction strength remains pending.

### Shelters and nearby chat

Shelter records show issuer, status, confirmation time, distance, address, access instructions, and phone details. The current product intentionally uses raw nearest listed shelter by straight-line distance. That is proximity information, not a safe-route or capacity guarantee. Applicable authority instructions remain primary.

Nearby community chat is a separate channel:

- Authenticated users with eligible recent India locations.
- Immutable 15 km message origin.
- Public alias only.
- 24-hour expiry.
- 500-character plain-text messages.
- Burst and hourly sending limits.
- Idempotent sending and bounded live history.
- No media, direct messages, clickable links, incident evidence effects, or authority announcements.

Chat moderation was explicitly excluded from the final chat scope, so chat is not presented as a production-moderated community service.

---

## 4. How the system works

```text
Tourist observation
  -> versioned incident
  -> timestamped evidence snapshot
       recent independent witnesses
     + current and recent weather
     + geographically relevant SACHET notices
     + retained incident context
  -> bounded Jev decision
  -> backend version and policy validation
  -> eligible qualification

Approved authority
  -> immediate jurisdiction-checked declaration
  -> atomic publication plus durable expansion job
  -> exact geographic recipient selection
  -> Android and iOS foreground in-app alert
  -> version-bound translation plus original text
```

Three distinctions control the whole design:

1. A community report is an observation, not an official warning.
2. Model qualification is not government verification.
3. An authority emergency must not depend on model approval.

Version guards matter because assessment and authority action happen asynchronously. An assessment started against an older incident revision must not overwrite a newer authority decision. An older translation must not appear beneath newer instructions. Durable expansion matters because publication must not depend on hoping a separate notification call succeeds later.

---

## 5. Decisions we made and why

1. **Map-first, not dashboard-first:** a traveler needs nearby relevance immediately, not charts or rumor counts.
2. **Separate community and official paths:** this prevents one viral report from looking like a government warning.
3. **Authority bypass for emergencies:** official communication cannot wait for model inference, enrichment, or community votes.
4. **Bounded model output:** Jev returns defined choices rather than open-ended emergency prose.
5. **Version-bound evidence and translation:** late or stale machine output cannot corrupt newer canonical state.
6. **Durable geographic targeting:** publication and expansion are committed together and processed resumably.
7. **Exact geography after indexed candidates:** efficient candidate selection is followed by real boundary and distance checks.
8. **Explicit unknown instead of false reassurance:** unavailable weather, missing geometry, absent expiry, or failed translation stays visible as unknown.
9. **Original instructions always accessible:** translation supports understanding; it does not replace source text.
10. **Raw nearest shelter:** avoids inventing eligibility, capacity, routing, or safety guarantees the app cannot prove.
11. **Online-first with honest degraded reads:** previously received public information remains readable with sync/item timestamps; authority actions never publish offline.
12. **Both mobile platforms plus a lightweight website:** shared mobile logic serves Android and iOS users, while a small static site makes discovery and Android installation easier.
13. **No fabricated completeness:** unfinished workflows, pending device acceptance, and deferred features remain explicitly listed.

---

## 6. Tools used and why each was chosen

| Tool | Why we chose it |
| --- | --- |
| Expo SDK 57, React Native 0.86, React 19, TypeScript | Shared product logic for Android and iOS while retaining native maps, permissions, secure storage, fonts, and installable builds. |
| Expo Router | Explicit routes for onboarding, map, incidents, shelters, SACHET, chat, settings, details, and authority workflows. |
| Convex backend | Reactive reads, authenticated server authorization, atomic mutations, scheduled jobs, and TypeScript contracts in one backend. |
| Convex Auth with Google OAuth | Established identity and session lifecycle; authority membership remains independently controlled on the backend. |
| NDMA SACHET CAP and RSS feeds | Attributed official notices with source identity, lifecycle references, timestamps, geography, and originals. |
| AccuWeather Core Weather API | Current and recent weather as supporting evidence, with shared caching and call budgets. |
| TypeSafe.ai Jev 1.13 through OpenCode Zen | Bounded decision choices suitable for explicit backend policy, rather than open-ended emergency advice. |
| Google Cloud Translation Basic v2 | Backend translation of changing official instructions, bound to exact original versions. |
| i18next, react-i18next, expo-localization | Local six-language app resources without calling a translation API for every rendered string. |
| react-native-maps, Turf geometry, geohash indexing | Apple Maps on iOS, Google Maps on Android, application-owned overlays, efficient candidate lookup, and exact relevance checks. |
| SecureStore | OS-backed storage for session and preference material. |
| Native system typography, bundled Inter, Lucide icons, custom SVG | Readable mobile hierarchy and a recognizable product interface without heavy device-incompatible styling. |
| Vitest, backend test framework, React component tests | Regression coverage for authorization, state transitions, geography, jobs, provider failures, startup, and UI recovery. |
| Native build tooling and static web HTML, CSS, and JavaScript | A real Android artifact, a native iOS demonstration build, and a small independently hosted public landing page. |

AI-assisted development tools, including OpenCode and AI coding and research assistants, supported planning, implementation, review, and documentation. Their use was reported as permitted by the organizers. Those assistants are separate from Jev, the bounded runtime decision model used by the product. No exclusively hand-written implementation claim is made.

Third-party maps, data, model, translation, font, and brand services retain their own terms and attribution. SACHET use does not imply NDMA endorsement or partnership. Controlled DEMO authority tools do not represent a real government deployment.

---

## 7. Verification and final artifact

A fresh repository check on 10 October 2026 passed:

```text
308 tests across 54 files
Strict TypeScript
Expo lint
```

Those checks cover identity and authority isolation, reporting and witness independence, declarations and DEMO isolation, geographic expansion and ordering, evidence and decision workers, SACHET lifecycle and polling, translation behavior, chat isolation and limits, startup, native regressions, emergency presentation, and shelter behavior. Passing tests do not prove model calibration or complete field reliability.

Final Android artifact recorded in the release handoff:

```text
File:         GudTour-0.1.0-final.apk
Version:      0.1.0 / Android versionCode 13
Package:      com.bitsnbytes.gudtour
Build source: 8059adf
SHA-256:      b5d69141da4daeca32d869b048a1d694a9c578905e2f401627fb81315bb522d2
```

Recorded artifact checks included signing identity, ZIP integrity, launcher and splash assets, production-backend selection, and exclusion of configured server credentials. Build verification is not the same as complete physical-device acceptance.

The landing page was separately checked across small, mobile, tablet, and desktop widths for overflow, image loading, keyboard access, reduced motion, URL validation, and automated accessibility rules. Automated checks do not replace a full screen-reader or native device audit.

---

## 8. Get and install the app

### Website

Open:

```text
https://gudtour.zapdos.me
```

That page is the public product and Android download entry point. It explains GudTour briefly, shows the actual app, and provides platform-specific download actions. If it still says release pending, use the direct public final APK URL after it is connected.

### Android installation from the website

1. Open https://gudtour.zapdos.me on the Android phone.
2. Select **GudTour for Android**.
3. Download the final APK from the connected public release URL.
4. Open the downloaded APK.
5. If Android asks, allow installation from the browser or file manager used for this download.
6. Launch GudTour.
7. Choose a language.
8. Grant foreground location access.
9. Complete Google sign-in and profile setup.
10. Keep the app open to receive real-time in-app emergency notices.

Requirements:

```text
Android 7 / API 24 or newer
Internet access
Google sign-in
Fresh, sufficiently accurate location inside India
```

A normal tourist account does not receive authority privileges. Controlled authority demonstrations require an approved DEMO account and explicitly enabled DEMO data.

### iOS demonstration

iOS is shown through the native iOS app in the demo recording. There is no public TestFlight or App Store release claimed in this submission. Judges should use the demo video for the iOS walkthrough and the website plus APK for direct Android testing.

---

## 9. Run the project locally

These steps are for technical review, not for normal tourist installation.

```bash
npm ci
cp .env.example .env.local
```

Configure a private development backend deployment and provider credentials. Backend secrets belong in backend configuration, never in public client variables or Git.

```bash
npm run backend
```

Keep that backend process running, then in another terminal:

```bash
npm run start
```

With the relevant native toolchain and device configured:

```bash
npm run ios
```

or:

```bash
npm run android
```

Run the complete repository check:

```bash
npm run check
```

For the separate landing page:

```bash
python3 -m http.server 4173 --directory web
```

Then visit:

```text
http://localhost:4173
```

Google OAuth callbacks, Android Maps package and signing restrictions, backend provider configuration, and approved authority scope must match the environment being tested. Do not point development tests at production data accidentally.

---

## 10. Suggested 2–5 minute demo

Record real behavior. Mark controlled incidents and authority scope as DEMO. Show Android and iOS explicitly. Do not imply that an iOS simulator recording is a TestFlight release.

| Time | Show | Explain |
| --- | --- | --- |
| 0:00–0:25 | Problem and live map | Fragmented warnings, geography, and language barriers. |
| 0:25–1:10 | Tourist report and similar-incident contribution | A witness observation is not an automatic emergency broadcast. |
| 1:10–1:50 | Evidence and context view | Source timestamps, weather and official context, and bounded assessment state. |
| 1:50–2:40 | Approved DEMO authority declaration to an eligible open tourist client | Direct publication bypasses Jev; the first message contains useful instructions. |
| 2:40–3:15 | Translation plus original and nearest listed shelter | Understandability and source visibility; distance is not safe routing. |
| 3:15–3:40 | Nearby chat and iOS interface | Shared workflow across platforms; chat is separate from official alerts. |
| 3:40–4:15 | Website, Android installation, and evidence summary | Real access, architecture, tests, and remaining limits. |

Use the same intended backend and DEMO scope on both demonstration clients. Never fabricate cross-device delivery by editing unrelated events together. If a step cannot be demonstrated, identify it rather than calling it verified.

---

## 11. How this addresses the judging rubric

| Criterion | What judges can inspect |
| --- | --- |
| Innovation, 20 percent | Connected tourist-specific communication, explicit provenance, separate authority and model paths, version-bound multilingual instructions. |
| Technical implementation, 35 percent | Native Android and iOS clients, reactive backend, atomic publication, durable jobs, authorization checks, geographic targeting, provider adapters, and 308 automated tests. |
| Feasibility, 20 percent | Bounded model work, caching, separate environments, budget controls, explicit limitations, and an actionable completion path. |
| Video presentation, 15 percent | Real end-to-end behavior on both mobile platforms and a clear explanation of why each transition matters. |
| Deployment, 10 percent | Signed Android artifact, public website, and iOS demonstration build. Final public APK wiring must be completed. |

These are evidence pointers, not a prediction of scores or a guarantee of success.

---

**The core result is a connected and accountable workflow:** local observation, evidence review, geographically relevant communication, and understandable instructions across Android and iOS, discoverable through a public website.
