# TravelTech on Expo — Strict 24-Hour MVP Plan

> **Orchestrator reconciliation:** Exploratory, not the build assignment. `../winning-strategy.md` controls: Android+iOS, web landing only; one destination, two distinct reviewed languages; no generated emergency guidance or confidence badge. Live adapter becomes mandatory if organizers reject labeled exercise delivery. Implement the controlling exact-identity graph, durable pending refs/tombstones and merge-before-commit cache contract, not older illustrative tables. Provider quotas/language counts are unverified. All schedules below are superseded; start both mobile artifacts early and deploy only after authorization.

**Track:** TravelTech — *Real-Time Crisis Communication for Tourists During Extreme Weather Events* (`docs/hackathon-brief.md`).
**Platform decision under test:** Android (Expo) primary; shared desktop UI via Expo Web; native macOS **pending feasibility** (see §2).
**Status:** Planning only. No app code, no account creation, no builds, no deployments, no external side effects. This file is the only artifact.
**Author context:** Independent subagent proposal, reconciled against `docs/research/traveltech.md`, `docs/agent-execution-policy.md`, `docs/research/compliance.md`, and `docs/winning-strategy.md`.
**Prior state:** CivicTech and HealthTech were rejected by the user. TravelTech is fixed. Team reports 3–4 builders and organizer confirmation that AI agents are allowed (exact wording retained for eligibility questions; not re-verified here).

> **Latest user decision supersedes platform sections below:** Android + iOS apps, **web landing only**. No macOS/native-desktop work or full Expo web briefing app is assigned. Read `../winning-strategy.md` and `expo-ios-delivery.md` for current scope and release gates. Schedules below are historical alternatives; external deployment requires authorization. A live-source adapter becomes mandatory if organizers do not accept labeled exercise delivery for the real-time brief.

---

## 0. How to read this document

| Tag | Meaning |
|---|---|
| **[FACT]** | Supported by a cited source in §15, or by the supplied brief. |
| **[ASSUMPTION]** | Our design assumption or inference. Not verified. |
| **[DECISION]** | Recommended position for the build. |
| **[KILL]** | Condition that drops or cuts the item. |

**Rubric reminder (brief §Evaluation Criteria):** Innovation 20 · Technical 35 · Feasibility 20 · Video 15 · Deployment 10. Technical + Feasibility = 55%. Video + Deployment = 25% and are the most commonly lost points. This plan budgets for all five.

**Governing constraint:** This is a *comprehension-and-provenance display layer over coarse public disaster feeds for tourists*. It is **not** a forecasting engine, **not** a navigation tool, and **not** an authority channel. Every claim in the app must be traceable to a source or explicitly labeled as our own generic template.

---

## 1. Non-negotiable exclusions (say these out loud in the video)

These are hard product boundaries. They protect credibility and pre-empt the most likely judge objections.

| # | We will **not** do | Why |
|---|---|---|
| 1 | Compute a "safe route", "safest path", or evacuation route from weather/map data | Generic feeds cannot establish street-level conditions; routing is a safety and credibility risk. [DECISION, per prior research constraint] |
| 2 | Claim official authority, endorsement, or that we are a government/emergency channel | We are an independent consumer display layer. [DECISION] |
| 3 | Verify or display digital signatures, or ship production cryptography | Signing is optional/rarely deployed, key distribution is unavailable, and it is out of 24h scope. We display provenance facts only. [DECISION] |
| 4 | Show a speculative numeric/letter "trust score" | A score implies a calibration we do not have. We show categorical source facts and keep rumor structurally separate. [DECISION] |
| 5 | Present GDACS as street-level flood data | GDACS is event-level and coarse (see §3, §10). [FACT] |
| 6 | Forecast floods/cyclones or predict escalation | We reflect published alerts; we do not predict. [DECISION] |
| 7 | Merge official alerts and unverified rumor into one ranked list | The separation *is* the feature. [DECISION] |

---

## 2. Platform decision: Android + shared desktop UI; macOS pending

### 2.1 Facts

- Expo officially targets **Android, iOS, and web** (web via `react-native-web`). [FACT: Expo docs — "Expo is an open-source framework for building iOS, Android and web apps".]
- **macOS is not a first-class Expo target.** Expo's "Additional platform support" guide routes macOS through the separate `react-native-macos` project and the Expo Modules API, which is documented as supporting macOS/tvOS as **out-of-tree** platforms requiring native module work and `pod install`. [FACT: Expo docs, Additional platform support.]
- An Expo maintainer states that building **first-class macOS support "is a much larger scope of work"** and is not currently provided. [FACT: expo/expo GitHub discussion #22273.]
- Expo Web renders the same React component tree through `react-native-web` in a normal browser, including on macOS. [FACT: Expo docs.]

### 2.2 Decision

- **Primary installable artifact:** Android app built with Expo. [DECISION]
- **Shared desktop UI:** the **same React component tree** rendered via **Expo Web** (a public URL). This is the "shared desktop UI" — one codebase, two targets. [DECISION]
- **Native macOS app:** a separate high-risk toolchain, not a standard Expo target. If its early build gate fails, ask the user to approve a browser alternative; do not silently drop their native target. [DECISION]
- **If organizers require a native desktop artifact:** a web build does not meet that requirement; obtain an accepted alternative or report the unmet requirement. [DECISION]

**Why this satisfies the brief's deployment gate:** the brief requires mobile apps to be "installable and testable (APK / TestFlight / emulator-friendly build)" and web apps to have a "public link" [FACT: brief §Evaluation Criteria 5]. Android APK + Expo Web public link covers both paths and gives judges a zero-setup way to try the app.

> **[ASSUMPTION]** The team's strongest stack is TypeScript/React. If the team is stronger in another stack, keep the same data model, lifecycle semantics, and tests from this doc; the platform reasoning still holds.

---

## 3. The five critical needs → MVP surfaces

The brief's decomposed sub-problems, mapped one-to-one to screens/behaviors so nothing is decorative.

| Critical need | MVP surface | Honest boundary |
|---|---|---|
| Localized hazards/instructions | Hazard header + instruction block in the user's chosen language, with the canonical source text always visible | Generic instruction templates are labeled "generic guidance — not from a local authority" when no official instruction text exists |
| Source provenance | Provenance card per alert: publisher, source kind, message type, issued/fetched/expires, area text, raw source link | Categorical facts only; no trust score, no signature claim |
| Language barrier | 2–3 tourist languages + constrained safety glossary + source text always shown | Machine translation is an aid; low-confidence → source text shown prominently |
| Rumor separation | A separate "Unverified reports" lane, structurally and visually distinct, never merged | User reports are labeled unverified and rate-limited; never auto-promoted |
| Offline freshness | Explicit "as of" timestamps, online/offline banner, freshness states, expired-alert demotion | Never present cached content as live; no actionable instruction from stale data |

---

## 4. MVP definition — strict

### 4.1 MUST (the spine; if any fails, the MVP fails)

1. **Expo app** with a list-first alert view (no map dependency), runnable on Android and as Expo Web.
2. **Source registry** with `live`/`simulated` kind; a persistent color-coded **mode banner** bound to the actual data source.
3. **Two adapters behind one interface:** a **simulated CAP-shaped lifecycle fixture** (the deterministic spine) and a **live GDACS adapter** (bonus, no-auth). [ASSUMPTION: GDACS is the lowest-friction live source; confirmed by prior research.]
4. **Normalized alert model** with provenance fields first-class (§5).
5. **Real lifecycle engine** handling `alert → update → cancel` plus **expiry**, with history retained and pure, deterministic transitions (§6).
6. **Provenance card** per alert (§7).
7. **Rumor lane**, separate and never merged (§7).
8. **Localization** for 2–3 languages with canonical source text always visible, glossary hits, and number/unit/place-preservation checks (§8).
9. **Offline-first persistence** (`expo-sqlite` or AsyncStorage) with computed freshness states; expired alerts demoted; offline banner non-dismissible (§9).
10. **Deterministic tests** for lifecycle, freshness, provenance separation, and translation-integrity checks (§11).
11. **Android APK + Expo Web public link**, seeded with simulated data so judges see a working app instantly.
12. **README + disclosures** (libraries, APIs, live-vs-simulated, AI tooling if used) and a real 4-minute video.

### 4.2 SHOULD (only after the spine is green)

- One extra language (3rd).
- Live GDACS fetch on Android with a per-source health indicator.
- Live translation via a single serverless proxy (keeps keys off the client).
- Simple list filtering by hazard type / active-only.

### 4.3 CUT / NOT IN MVP

- Map tiles, polygons, routing, "safest path".
- Signature verification, key management, hash-chained ledgers, any production cryptography.
- Numeric/letter trust scores, severity weighting, probabilistic confidence.
- User accounts, social feed, push notifications, SMS/email delivery.
- Forecasting, storm-surge modeling, riverine prediction.
- Native macOS (`react-native-macos`), tvOS, iOS build.
- Backend database server, microservices, message queues.

**Minimum convincing outcome:** the app shows a provenance card for a real alert shape, correctly applies an **Update** (prior version superseded, history visible), applies a **Cancel** (alert leaves the active list), auto-**expires** an alert without network, shows translated text with source text always visible, keeps an unverified report out of the official lane, and degrades honestly when a feed or the translation service is unavailable.

---

## 5. Data model (minimum)

Typed, schema-validated. Names are illustrative; contracts are what matter. Provenance fields are first-class, not decoration.

### 5.1 `SourceRegistry`
| Field | Type | Notes |
|---|---|---|
| `id` | string | stable |
| `label` | string | e.g. "GDACS (public feed)" |
| `kind` | `"live" \| "simulated"` | drives mode banner and badges |
| `publisher` | string | who produced the data |
| `authority_label` | string \| null | displayed only as a label, never as endorsement |
| `url` | string | raw source link shown on the card |
| `enabled` | boolean | for failure/degradation demos |

### 5.2 `RawRecord` (fetch audit, no security claim)
| Field | Type | Notes |
|---|---|---|
| `source_id` | string | FK |
| `fetched_at` | ISO timestamp | drives freshness |
| `raw_payload` | JSON/text | retained for evidence |
| `content_hash` | string | **dedup/change-detection only**, explicitly not a security or tamper-proof claim |

### 5.3 `AlertMessage` (normalized, immutable per version)
| Field | Type | Notes |
|---|---|---|
| `id` | uuid | internal message id |
| `source_id` | string | FK |
| `source_event_id` | string | e.g. GDACS event/episode id |
| `msg_type` | `"alert" \| "update" \| "cancel"` | CAP-aligned [FACT: CAP 1.2 `msgType`] |
| `references` | array of `{ identifier, sender, sent }` | prior-message links; required for `update`/`cancel` in the CAP model [FACT: CAP 1.2 `references`] |
| `hazard_type` | enum | flood, cyclone, earthquake, volcano, drought, wildfire, other |
| `severity` / `urgency` / `certainty` | enum \| null | CAP fields when present; else null |
| `headline` | string | source headline |
| `description` | string | canonical source text |
| `instruction` | string \| null | official instruction if present; else null |
| `area_description` | string | **raw text**; we do not fabricate a polygon |
| `geometry` | GeoJSON \| null | optional coarse centroid/bbox only |
| `effective_at` / `expires_at` | ISO timestamp | temporal validity |
| `status` | enum | actual, test, exercise, simulated |
| `fetched_at` | ISO timestamp | |

### 5.4 `AlertState` (resolved current state per logical event)
| Field | Type | Notes |
|---|---|---|
| `logical_key` | `source_id + source_event_id` | stable identity |
| `current_message_id` | uuid | latest non-superseded message |
| `lifecycle_state` | `active \| updated \| cancelled \| expired \| unknown` | computed |
| `superseded_by` | uuid \| null | update chain |
| `cancelled_by` | uuid \| null | cancel link |
| `history` | array of message ids | retained, newest last |
| `last_change_at` | ISO timestamp | |

### 5.5 `RumorReport` (separate lane)
`id, text, submitted_at, coarse_area_text, status="unverified", source="user"`. Never joined to `AlertState`; never given an official badge.

### 5.6 `TranslationRecord` (deterministic cache)
`bulletin_identity, source_text_hash, source_language, target_language, provider, model_version, translated_text, reviewer, checked_at`. Normative key: `(bulletin_identity, source_text_hash, source_language, target_language)`; provider/model version are metadata. Integrity checks are internal regression evidence, not semantic-confidence badges.

### 5.7 `FreshnessView` (computed at read time, never stored as truth)
`data_as_of, online:boolean, freshness: live | aging | stale | expired`.

---

## 6. Minimum actual lifecycle: Update / Cancel / expiry

This is the technical core and the honest replacement for a trust score. Transitions are **pure functions** over `(AlertState, AlertMessage, now)`.

### 6.1 Semantics

| Incoming `msg_type` | Condition | Result |
|---|---|---|
| `alert` | no existing state for `logical_key` | Create state, `lifecycle_state = active`, `current_message_id = new` |
| `alert` | another Alert exists | Independent unless exact Update/Cancel references link them; **never implicit supersession** |
| `update` | `references` resolves to current message | Prior message marked `superseded_by = new`; new becomes current; `lifecycle_state = updated`; history grows |
| `update` | `references` missing/unknown | Record as **orphan/unknown**; do **not** merge into an existing event; surface for review |
| `cancel` | `references` resolves to current message | `lifecycle_state = cancelled`, `cancelled_by = new`; removed from active list; retained in history |
| `cancel` | unknown reference | Retain pending and visibly non-actionable; re-resolve when target arrives, then suppress according to controlling plan |
| any | `now >= expires_at` | `lifecycle_state = expired` **regardless of connectivity** (computed from stored `expires_at`) |
| any | `expires_at < effective_at` (or malformed) | `lifecycle_state = unknown`; flagged as invalid temporal data; never treated as active |

### 6.2 Rules

- **History is append-only in the UI sense** (prior versions remain viewable) — but this is an ordinary change history, **not** an immutability or cryptography claim. [DECISION]
- **Expiry is offline-safe by construction:** because it is computed from a stored timestamp at read time, an alert expires correctly in airplane mode. This is the single easiest thing to demo and the strongest honest technical claim.
- **No silent merge:** updates chain only through exact validated `references`, never matching event ID alone. The controlling plan's normative graph table replaces this illustrative transition table.
- **Cancellation stays visible and suppresses instructions for its known update chain**, including competing Updates; unresolved Update-only branches are visible conflicts. Apply lifecycle labels before expiry/freshness; this is the controlling plan's conservative application policy.
- **Clock skew** is a first-class edge case: if the device clock or a bad `expires` produces a non-monotonic window, the item is `unknown`, not active.

### 6.3 CAP alignment

CAP 1.2 defines `msgType` values including `Alert`, `Update`, `Cancel`, the `<references>` element linking prior messages, and an **optional** `<expires>`. [FACT: OASIS CAP 1.2, independently checked by orchestrator.] Our fixture uses a CAP-inspired subset, not a claim of full standard conformance. Missing-expiry handling is an explicit application policy in the controlling plan.

> **[ASSUMPTION]** GDACS is not CAP and does not expose CAP `references`/`msgType` directly. The live adapter therefore maps each GDACS event/episode to an `alert`, and *may* emit an `update` when the episode id or alert level changes. The **deterministic lifecycle demonstration uses the simulated CAP-shaped fixture**; live GDACS is a bonus that may only produce `alert` + `expires`. Do not claim GDACS provides Update/Cancel semantics.

---

## 7. Provenance and rumor separation (no trust score)

### 7.1 Provenance card — categorical facts only

Each alert shows: **publisher · source kind (live/simulated) · message type (Alert/Update/Cancel) · issued · fetched · expires · area (raw text) · hazard type · raw source link**, plus a permanent footer: *"Independent display layer. Not an official emergency channel."* [DECISION]

- We do **not** display signature status, a verification badge implying authority, or a computed score.
- If an official `instruction` field exists, it is shown and attributed to the source; otherwise we show a **labeled generic template** ("Generic guidance — verify with local authorities"). [DECISION]
- `geometry`, if shown at all, is a coarse marker labeled as an approximate event footprint, never a flood extent. [DECISION]

### 7.2 Rumor lane

- Separate tab/section, distinct color and typography, headed **"Unverified reports — not confirmed."**
- User text is escaped, length-limited, rate-limited, and never merged or ranked alongside official alerts.
- No "corroboration" computation in MVP (that would edge toward a trust score). [DECISION]
- The same event may appear in both lanes; the two records are never joined in the data model. [DECISION]

---

## 8. Localized hazards/instructions and translation integrity

### 8.1 Languages

- **2 languages minimum, 3 maximum.** Recommended demo set: **English + Hindi + one tourist language** (e.g. French). [ASSUMPTION: language choice is a demo decision; confirm the target tourist demographic.]
- **Canonical source text is always visible** next to the translation. Translation is an aid, never a replacement. [DECISION]

### 8.2 Constrained safety glossary

Safety-critical terms (`evacuate`, `shelter`, `flood`, `landslide`, `do not travel`, `move to higher ground`) are translated from a **bundled, human-checked glossary**, not improvised by a generic MT model. [DECISION]

### 8.3 Integrity checks (cheap, deterministic, demoable)

For each translation, compare source vs translation for preservation of:
- **numbers** (counts, magnitudes),
- **units** (mm, km, m/s, hours),
- **place names** (via a small gazetteer/entity list).

Results are **internal regression checks**, not user-facing semantic confidence or credibility badges. On mismatch, require human review; original remains accessible. Matching entities does not validate negation or meaning. [ORCHESTRATOR CORRECTION]

### 8.4 Translation API limitations (facts)

| Provider | Free tier | Limit notes |
|---|---|---|
| Google Cloud Translation (NMT) | 500,000 chars/month, never expires | 30,000 chars max/request (Advanced); ~6M chars/min/project; 189 languages; requires billing/card enabled. [FACT] |
| Microsoft Translator | 2M chars/month for first 12 months | then paid. [FACT] |
| DeepL | limited free tier | 31 languages; strong European quality, narrower coverage. [FACT] |
| LibreTranslate | open source, self-hostable | no vendor free-tier guarantee; operational overhead. [ASSUMPTION] |

**Consequences for the MVP:**
- Calling a paid MT API directly from the client would expose the key; **[DECISION]** demo translations are **pre-translated fixtures + glossary, cached by `(text_hash, lang, model_version)`** for determinism and key safety. Live translation, if added, goes through a **single serverless proxy**.
- **No offline MT:** optional machine translation requires network. Offline display only translations bound to the exact current bulletin hash/language pair. After an Update, never fall back to the predecessor's translation; show current original with “translation unavailable.” [ORCHESTRATOR CORRECTION]
- MT errors in emergency contexts are a documented safety risk, so the source text always wins. [FACT: prior research sources.]

---

## 9. Offline freshness (the strongest differentiator)

- **Persistence:** `expo-sqlite` (official Expo SDK package, persists across restarts) or AsyncStorage for small key-value state. [FACT: Expo docs.]
- **Explicit timestamps everywhere:** "Last updated 12:41 · you are offline."
- **Controlling freshness policy:** show last-successful-fetch timestamp and online/offline state; add age warning at 15 minutes (demo policy, not official standard). Expiry is separate and recomputed offline. A recent fetch is not a guarantee of current conditions; no six-hour tier is assigned.
- **Never present cached content as live.** The stale banner cannot be dismissed while offline. [DECISION]
- **Saved instructions remain readable as historical/as-of content**, with prominent current-validity uncertainty. Expired/cancelled/superseded content is not an active action recommendation. Follow the controlling plan, which does not erase the offline briefing at its age threshold.
- **Low-bandwidth mode:** text-first, no heavy assets. [DECISION]

---

## 10. Source and data limitations (honest, cite in the video)

- **GDACS** is a UN/EC cooperation framework exposing a **public REST API with no authentication**; event types are EQ, TC, FL, VO, DR, WF; alert levels are Green/Orange/Red; feeds refresh roughly every 6 minutes; the search endpoint returns the first 100 elements with paging; KML bulk is limited to the last 4 days. [FACT: GDACS API quick start, Elastic integration docs.]
- GDACS flood severity is derived from the **Global Flood Detection System** at **event level** — it cannot establish which street is flooded. [FACT: IFRC/Monty GDACS mapping.]
- GDACS publishes **no usable structured impact figures** for several event types; some data is free text and not reliable to parse. [FACT: IFRC/Monty.]
- **Therefore [DECISION]:** the app labels GDACS-derived items as **"coarse event-level alert — not street-level flood data"** and never implies a specific safe/unsafe street.
- **CORS risk:** React Native fetch is not subject to browser CORS, but **Expo Web** may be. Mitigation: a tiny serverless proxy or a bundled static snapshot for the web build. [ASSUMPTION — verify during build.]
- **Fixture confirmation:** the brief explicitly permits simulated medical data for HealthTech but does **not** explicitly address TravelTech/CivicTech fixtures. [FACT: judging-evidence note.] **[DECISION]** Ask organizers; until answered, keep simulated data unmistakably labeled and keep processing/persistence real.

---

## 11. Deterministic tests (named cases)

Only mark these passed after the named check actually runs. Record build/commit and limitations in the evidence ledger (`docs/judging-evidence.md` template).

**Lifecycle**
1. New `alert` → state `active`, history length 1.
2. Valid `update` → prior `superseded_by` set, new current, state `updated`, history length 2.
3. `update` with unknown reference → `unknown`/orphan, no merge.
4. Valid `cancel` → state `cancelled`, absent from active list, retained in history.
5. `cancel` with unknown reference → durable pending record, no fabricated target; re-resolve later and retain across refresh/restart.
6. Duplicate identical message → no duplicate active state (idempotent ingest).
7. Same inputs in different order → same final state and stable ids (order independence).

**Expiry / temporal**
8. `now < expires_at` → active.
9. `now == expires_at` → expired (boundary).
10. `now > expires_at` → expired.
11. `expires_at < effective_at` (malformed) → `unknown`, never active.
12. Device clock skewed backwards/forwards → state derived from stored timestamp; no fabricated active state.

**Offline / freshness**
13. Offline with stored `expires_at` in the past → expired without any network call.
14. Offline with unexpired data → `stale`/`aging` banner, no "live" label.
15. Online fresh fetch → `live`.
16. Stale alert renders "check official channels", not an instruction block.

**Provenance / rumor**
17. Official alert and rumor text for the same event → two separate records, never joined.
18. Simulated source never renders with an official badge; mode banner matches source kind.
19. No numeric/letter trust score field exists in any rendered view (assert absence).

**Translation**
20. Number/unit/place preservation check passes → internal regression evidence only, no confidence badge.
21. A dropped/altered number → translation blocked pending review; current original accessible, internal failed-check record, no confidence badge.
22. Glossary term present in source → matched-from-glossary flag.
23. MT/proxy unavailable → cached translation + glossary + source text; app does not block.

**Integration / smoke**
24. Clean install → seeded simulated dataset visible → full lifecycle demo path works.
25. One end-to-end smoke test on Android and one on Expo Web.

---

## 12. 24-hour budget and gates (3–4 builders)

T0 = confirmed development start (assume IST; confirm timezone). The prior compliance plan's milestone cadence (T+19 feature freeze, T+22 release candidate, T+23 internal freeze, T+24 hard stop) applies. [FACT: `docs/research/compliance.md` §6.]

| Elapsed | Output | Owner |
|---|---|---|
| T+0–0.5 | Historical alternative only: superseded by controlling schedule; no full Expo web assignment or deployment without authorization | Integration |
| T+0.5–2 | Repo, types, data model, source registry; first commits | Integration |
| T+1–3 | Lifecycle pure functions + deterministic lifecycle/expiry tests | Domain |
| T+3–7 | GDACS adapter + simulated CAP fixture + `expo-sqlite` persistence | Domain/Data |
| T+5–9 | Alert list + provenance cards + rumor lane + mode banner | Frontend |
| T+7–11 | Translation fixtures/glossary + integrity checks + offline freshness UI | Frontend/Domain |
| T+11–14 | Integration, failure/degradation states, Android + Web smoke | All |
| **T+14** | **Feature freeze** — no new scope | All |
| T+14–18 | Hardening, edge cases, **Android APK build**, web redeploy, clean-device test | QA |
| T+18–21 | README + disclosures; record real 4-min video | QA/Demo |
| T+21–23 | Verify, internal freeze, preserve last good build | All |
| T+23–24 | Submission logistics (leader only) | Leader |

**Cut order if behind:** 3rd language → live translation → live GDACS fetch (simulated becomes the spine) → provenance-card detail → rumor lane polish.
**Never cut:** lifecycle engine (update/cancel/expiry), provenance cards, source-text-always-visible, offline/stale banner, simulated/live banner, rumor separation, APK + web deploy, README disclosure.

**Build-risk note:** APK generation is a gate. Prefer `expo run:android` / `gradle assembleRelease` locally if the Android SDK is present, or EAS Build if an Expo account is authorized. Confirm the preferred artifact with organizers (APK vs emulator-friendly build) — this is an open question (§14). No build/account actions are taken in this planning phase.

---

## 13. Four-minute demo script

| Time | Beat |
|---|---|
| 0:00–0:20 | Problem: foreign tourist, local warnings untranslated, rumors, dead zones. |
| 0:20–0:45 | Live/seed alert list with a **provenance card**; caption "coarse event-level — not street flood data." |
| 0:45–1:20 | **Lifecycle:** show an **Update** superseding a prior version (history visible), then a **Cancel** removing an item, then an **expiry** demotion. |
| 1:20–2:00 | **Language:** switch between two distinct languages; original accessible, reviewed version-bound translation and attribution, no confidence badge. |
| 2:00–2:35 | **Rumor separation:** unverified lane, clearly distinct, never merged. |
| 2:35–3:15 | **Offline:** airplane mode; stale banner; expired alert demoted; no instruction from stale data. |
| 3:15–3:40 | **Failure:** kill the feed / translation service → honest degraded state. |
| 3:40–4:00 | Scope + non-goals + deployment (Android APK + Expo Web link) + limitations. |

Use real screen recording of the deployed app. Do not substitute animation for working software. Rehearse the offline and failure beats most.

---

## 14. Open questions (confirm before/at kickoff)

1. Preferred mobile artifact: **APK** vs emulator-friendly build vs both?
2. Is a **public Expo Web link** acceptable as the desktop/web deliverable alongside the APK?
3. Are **synthetic TravelTech fixtures** permitted (the brief only explicitly permits simulated HealthTech data)?
4. Timezone and date format for all deadlines.
5. Is AI-tool usage permitted and must it be disclosed? (Team reports "allowed"; retain the wording.)
6. Does "macOS support" mean a **native app** or is a browser-based desktop UI acceptable? (Determines whether native macOS stays a [KILL] gate.)
7. Repo visibility and exact Google Form fields.

---

## 15. Facts vs assumptions (audit trail)

**Sourced facts [FACT]**
- Expo targets Android, iOS, and web; macOS is not first-class and routes through `react-native-macos` / out-of-tree Expo Modules support. (Expo docs; expo/expo discussion #22273.)
- GDACS exposes a public, no-auth REST API; event types EQ/TC/FL/VO/DR/WF; Green/Orange/Red levels; ~6-minute refresh; first-100 paging; 4-day KML bulk. (GDACS API quick start; Elastic integration.)
- GDACS flood severity is event-level via the Global Flood Detection System; no reliable structured impact for several event types. (IFRC/Monty GDACS mapping.)
- Google Cloud Translation: 500K chars/month free (NMT), 30K chars/request, ~6M chars/min/project, 189 languages, billing/card required. Microsoft: 2M chars/month for 12 months. DeepL: 31 languages. (Vendor docs/coverage.)
- CAP 1.2 defines `msgType` (Alert/Update/Cancel/…), `references`, and optional `expires`. (OASIS CAP 1.2.)
- `expo-sqlite` is an official Expo package that persists across restarts; AsyncStorage is unencrypted key-value. (Expo docs.)
- The brief permits simulated medical data for HealthTech but is silent on TravelTech fixtures; deployment is a mandatory gate; fake demos risk disqualification; 2–5 min video must be added to the repo. (`docs/hackathon-brief.md`, `docs/research/compliance.md`.)

**Design assumptions [ASSUMPTION] (verify before judging)**
- The team's strongest stack is TypeScript/React.
- Expo Web can render the shared UI as the desktop deliverable; native macOS is out of 24h scope.
- GDACS is the lowest-friction live source and may hit CORS on Expo Web (needs a proxy or static snapshot).
- The simulated CAP fixture is the deterministic spine; live GDACS is bonus.
- Pre-translated fixtures + glossary are sufficient for a reproducible, key-safe demo.
- Demo language set (English + Hindi + one tourist language) matches the target demographic.

**Sources**
1. Expo — Additional platform support (macOS/tvOS, out-of-tree): https://docs.expo.dev/modules/additional-platform-support
2. expo/expo — Discussion #22273, "Support for Windows and MacOS apps development": https://github.com/expo/expo/discussions/22273
3. Expo — Local-first architecture / SQLite / AsyncStorage: https://docs.expo.dev/guides/local-first
4. GDACS (MHEWS) API quick start (PDF, 2025): https://www.gdacs.org/Documents/2025/GDACS_API_quickstart_v1.pdf
5. Elastic — GDACS integration (public REST, no auth; event types): https://www.elastic.co/docs/reference/integrations/gdacs
6. IFRC/Monty — GDACS source mapping (event-level severity; no structured impact): https://ifrcgo.org/monty-stac-extension/model/sources/GDACS
7. Google Cloud Translation — pricing (500K free chars/month): https://cloud.google.com/products/translate/pricing
8. Google Cloud Translation — quotas (30K chars/request, 6M chars/min): https://docs.cloud.google.com/translate/quotas
9. OASIS — Common Alerting Protocol v1.2: https://docs.oasis-open.org/emergency/cap/v1.2/CAP-v1.2-os.html
10. Supplied brief and prior research: `docs/hackathon-brief.md`, `docs/research/traveltech.md`, `docs/research/compliance.md`, `docs/agent-execution-policy.md`.

*End of TravelTech Expo MVP plan. Planning artifact only; no implementation, build, deployment, or account action has been performed.*
