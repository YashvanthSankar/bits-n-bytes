# TravelTech Research — Real-Time Crisis Communication for Tourists

**Scope:** This document analyzes only the TravelTech problem statement in `docs/hackathon-brief.md`.
**Author context:** Subagent strategy research. No app code, no external side effects. This file is the only artifact produced.
**Rubric:** Innovation 20 · Technical 35 · Feasibility 20 · Video 15 · Deployment 10.
**Hard constraint applied throughout:** Do **not** claim safe evacuation routing or "safest path" from generic weather/maps data. Routing is out of scope and a credibility risk.

---

## 0. How to read this document

- **[FACT]** = supported by a cited primary/secondary source (URLs in §11).
- **[HYPOTHESIS]** = our inference or design assumption, not yet verified.
- **[DECISION]** = recommended position for the build.
- **[KILL]** = condition to drop the feature.

Team size was unknown when commissioned; the team subsequently reported 3–4 builders. Stack remains unknown.

> **Orchestrator review:** treat competitor gaps and search-result-derived product details as research leads, not verified pitch facts. For a 24-hour MVP, omit cryptographic verification unless an actual trusted key distribution and validation path is available. Entity/number checks do not establish semantic translation accuracy: label them “checks passed,” not a safety-confidence score. A map cannot establish current street-level flooding from coarse disaster feeds.

---

## 1. The honest problem framing

The brief says local warnings are "fragmented and rarely translated or localized for tourists," travelers "struggle to verify which areas are actively flooded or unsafe," and they fall back on "chaotic, unverified social media rumors."

Decomposed into buildable sub-problems:

1. **Aggregation/provenance** — pull authoritative alerts from many producers and show *who* said *what*, *when*, for *which area*.
2. **Verification/trust** — separate official, signed/attributable alerts from unverified rumor, and never silently merge them.
3. **Multilingual integrity** — translate without corrupting numbers, place names, units, or safety-critical verbs.
4. **Offline/stale safety** — a tourist in a dead-zone or on hotel Wi-Fi must not be shown stale data as if it were live.
5. **Uncertainty display** — show confidence/validity windows, not a false binary "safe/unsafe."

**[DECISION]** The product is a **provenance-and-comprehension layer over official alerts for tourists**, not a forecasting engine and not a navigation tool. That framing is both defensible and demoable in 24 hours.

---

## 2. What already exists (differentiation without unsupported novelty)

We must not claim to invent CAP, alert aggregation, or translation. We differentiate on the **tourist-facing trust UX** and **failure honesty**.

| Existing system | What it is | Gap we address | Source |
|---|---|---|---|
| CAP 1.2 (OASIS/WMO/ITU-T X.1303 bis) | International XML standard for all-hazard alerts; includes optional `<signature>` for XML digital signature | Standard exists but consumer tourist apps rarely surface provenance or signature validity | [FACT] OASIS/WMO |
| SACHET (NDMA India) + IMD CAP | India's official CAP-based alert portal/app; IMD generates CAP weather warnings | Government/India-centric, not tourist-multilingual-provenance UX | [FACT] NDMA/IMD |
| GDACS | Global disaster alert + public REST API, no auth | Event-level global, not hyper-local tourist instructions or translation | [FACT] GDACS/Elastic |
| Google Flood Hub / Flood Forecasting API | Riverine flood forecasts, 150+ countries; API access restricted, primarily non-commercial | Riverine only, no urban/flash/coastal; not a tourist communication layer | [FACT] Google Help/Research |
| FEMA IPAWS / WEA | US alerting with XML digital signatures for non-repudiation; multilingual EAS/WEA being expanded | US-only; WEA multilingual rollout delayed | [FACT] FEMA/FCC/DHS |
| Commercial travel-risk apps (International SOS, Crisis24, Travel Smart) | Advisories, mass notification, tracking | Advisories are generic; little provenance-per-alert or translation-integrity UX | [FACT] vendor sites |

**[DECISION]** Position the novelty narrowly and truthfully: *"a CAP-consuming, provenance-first, offline-safe, translation-integrity-aware tourist alert client."* Never say "first" or "novel alert standard."

**[HYPOTHESIS]** No mainstream consumer app visibly shows per-alert provenance + signature/attestation status + translation confidence to tourists. We should verify during judging prep and hedge language ("we are not aware of").

---

## 3. Original, feasible 24-hour web MVP

### 3.1 MVP definition (ship this)

A deployed **PWA** (public URL) that:

1. **Ingests** at least one real CAP/JSON feed (GDACS JSON is the lowest-friction no-auth option [FACT]) plus a bundled **simulated** dataset.
2. **Normalizes** each alert into a provenance record: publisher, authority, msgType, status, certainty/urgency/severity, area, issued/effective/expires, references, source URL, content hash, signature presence/validity.
3. **Displays** a tourist view: map/list of active alerts, each with a **provenance card** ("Source: IMD/NDMA · Issued 12:40 IST · Expires 18:00 · Signature: not provided").
4. **Translates** alert text into 2–3 tourist languages with a **translation-quality badge** and the **official text always visible**.
5. **Works offline**: service-worker cache, explicit "as of <time>" and staleness banner; expired alerts marked/hidden.
6. **Separates rumor**: an "unverified reports" lane that is visually and structurally distinct and never merged.
7. **Simulated vs live banner**: an unmistakable mode indicator bound to the data source.

### 3.2 Explicit non-goals (say these in the video)

- No evacuation/safe-route calculation from weather or map data.
- No claim of forecasting floods/cyclones.
- No official endorsement; we are a consumer display layer.

**[DECISION]** Stating non-goals protects credibility and pre-empts the most likely judge objection.

### 3.3 Rough time budget (24h, assumes 2–4 people)

| Block | Hours | Output |
|---|---|---|
| Setup, deploy skeleton, PWA shell | 2 | Public URL, offline shell |
| Data model + CAP/GDACS adapter + simulated seed | 4 | Normalized alerts with provenance |
| Verification pipeline + provenance UI | 4 | Trust cards, signature/attestation status |
| Translation + integrity checks + badges | 4 | Multilingual with QA flags |
| Offline/stale logic + failure handling | 3 | Cache, staleness, degradation |
| Map/list UX + rumour lane + sim/live banner | 3 | Coherent tourist view |
| Tests, README, video | 4 | Submission |

**KILL:** if the CAP/GDACS adapter slips past hour 8, ship the simulated feed first and wire live ingest behind it. Live is a bonus, not the spine.

---

## 4. Verification and provenance design

### 4.1 Trust model

CAP 1.2 defines an optional `<signature>` element (XML digital signature) [FACT: OASIS CAP 1.2]. WEA/FEMA use XML digital signatures for non-repudiation [FACT: DHS WEA cybersecurity guidelines]. **But signing is optional and not universally deployed** [HYPOTHESIS], so verification must be tiered rather than binary.

**Recommended trust tiers (displayed per alert):**

| Tier | Meaning | Evidence |
|---|---|---|
| **Attested** | Publisher in our allowlist AND valid CAP signature | Signature verifies against publisher key |
| **Official** | Publisher in allowlist (HTTPS, known authority) but unsigned | Transport + publisher registry |
| **Corroborated** | Official from ≥2 independent authorities for same event | Dedup/correlation |
| **Unverified** | Social/user-submitted or unknown source | Never auto-merged; labeled |

### 4.2 Pipeline stages

1. **Transport** — HTTPS/TLS only.
2. **Publisher allowlist** — registry of known alerting authorities (IMD, NDMA/SACHET, GDACS, etc.).
3. **Schema validation** — reject malformed CAP.
4. **Signature verification** — where `<signature>` exists; record result, don't drop unsigned.
5. **Dedup/correlation** — use CAP `<references>` (Update/Cancel chains) and spatial/temporal overlap.
6. **Consistency checks** — flag contradictory severity across sources instead of picking one silently.
7. **Hash + append** — store `raw_hash` and a record hash; expose an append-only provenance view.

**[HYPOTHESIS]** A hash-chained ledger is cheap and visually compelling ("this alert record has not been altered since ingest"), but it proves *our* integrity, not the authority's truth. Label it as integrity-of-record, not truth.

**[DECISION]** Never rank or merge official and unverified items into one list. The separation *is* the feature.

---

## 5. Multilingual integrity

Translation errors in emergencies are a documented safety risk [FACT: multiple 2024–2025 sources on emergency MT risk]. Therefore:

- **Canonical source text is always shown**; translation is an aid, not a replacement.
- **Machine vs official** translation labeled distinctly; official multilingual text wins when present.
- **Constrained glossary** for safety-critical terms (evacuate, shelter, flood, landslide, "do not travel") — do not let a generic MT model improvise these.
- **Numeric/entity preservation checks** — regex + NER verify that numbers, units, distances, and place names survive translation; mismatch → lower badge or block.
- **Round-trip (back-translation) similarity** as a cheap QA signal [HYPOTHESIS: useful but noisy].
- **Low-confidence → show source text prominently** rather than a possibly-wrong translation.

**[DECISION]** A "translation confidence" badge with an explicit *why* ("critical term matched glossary; numbers preserved") scores technical depth and honesty at once.

**KILL:** if the glossary/entity checks can't be built, cut to **two languages + source text always shown** rather than shipping unguarded MT.

---

## 6. Offline / stale-data safety

This is the strongest differentiator and the easiest to demo (airplane mode on stage).

- **PWA service worker** caches shell + last-good alerts.
- **Explicit timestamps everywhere**: "Last updated 12:41 IST · you are offline."
- **Staleness policy**: configurable thresholds; past `expires` → mark **EXPIRED** and demote/hide.
- **Never present cached content as live**; stale banner is non-dismissible while offline.
- **No actionable instruction from stale data** — show "check official channels" links.
- **Low-bandwidth mode**: text-first, no heavy tiles.

**[DECISION]** Offline correctness is a *safety* claim we can honestly make ("we never show stale as live"), unlike routing which we cannot.

---

## 7. Technical depth (to justify the 35% weight)

Depth signals that are cheap and defensible:

- Typed data model + schema validation (Zod/JSON Schema), provenance fields first-class.
- Adapter interface with ≥2 implementations (CAP/GDACS + simulated) proving pluggability.
- **Failure handling**: per-adapter timeout, retry with backoff, circuit breaker; partial results rendered with per-source health.
- **Model/API failure**: LLM/MT failure → fall back to cached phrasebook/templates + source text; never block the alert view on translation. GDACS/API failure → show last-good + degraded banner.
- **Determinism**: translation cache keyed by (text hash, lang, model version) so demos are reproducible.
- **Tests**: unit tests for provenance tiering, staleness, entity-preservation checks; one end-to-end smoke test.
- **Observability**: per-source ingest health panel (nice for judges, trivial to build).

**[DECISION]** The judging story is "robust under failure," so build the degraded path before the happy path is pretty.

---

## 8. Model / API failure matrix

| Failure | User-visible behavior | Mitigation |
|---|---|---|
| Live CAP/GDACS unreachable | Last-good alerts + "source degraded" banner | Cache, backoff, circuit breaker |
| Translation model down/rate-limited | Source text + cached glossary phrases; badge "translation unavailable" | Templates, cache, no blocking |
| Signature library fails or signature is invalid | Show verification unavailable/failed; quarantine from attested trust and preserve source evidence | Never relabel a failed signature as unsigned/verified; never crash ingest |
| Geocoding/area parse fails | Show raw area text, don't guess a polygon | No silent fallback to map routing |
| Clock skew / bad `expires` | Flag invalid temporal data; treat as unknown | Validation rules |

**[DECISION]** Every failure maps to an *honest degraded state*, never to a fabricated one.

---

## 9. Simulated vs live boundaries (anti-disqualification)

The brief warns that fake/non-working demos lead to disqualification [FACT: brief §Additional Notes]. So the boundary must be explicit and enforced:

- Separate **source registry** entries: `live: true/false`, with the simulated dataset clearly tagged `source=simulated`.
- A persistent, color-coded **mode banner**: "SIMULATED DATA — DEMO" vs "LIVE FEEDS."
- Provenance cards show the actual source; simulated alerts can never render with an official badge.
- README discloses all APIs/libraries and exactly what is live vs seeded [FACT: brief §Submission Guidelines].
- Video states the boundary out loud.

**[DECISION]** Make the simulated mode the *default* for a stable demo, and toggle live on camera to show it works. This is honest and demo-safe.

---

## 10. Demo plan (video, 2–5 min)

1. **0:00–0:30 Problem** — tourist, language barrier, rumor chaos.
2. **0:30–1:00 Live ingest** — show a real GDACS/CAP item appearing with provenance card.
3. **1:00–1:45 Verification** — compare Official vs Unverified lane; explain tiers.
4. **1:45–2:30 Multilingual integrity** — switch language; show badge, preserved numbers, source text.
5. **2:30–3:15 Offline/stale** — airplane mode; staleness banner; expired alert demotion.
6. **3:15–4:00 Failure handling** — kill a feed / translation API; show degraded state.
7. **4:00–4:30 Scope + non-goals** — "we do not route or forecast; we make official alerts trustworthy and readable."

**[DECISION]** Rehearse the offline + failure segments most; they win technical and feasibility points.

---

## 11. Deployment (10%)

- Host static PWA on Vercel/Netlify/Cloudflare Pages; public link in README [FACT: brief requires public link].
- Serverless functions (if needed) for ingest/translation to keep keys off client.
- Seed with simulated data so judges see a working app instantly; live feed optional.
- Health page showing source status and last successful ingest.
- README: problem, solution, architecture, APIs/libraries disclosed, setup, live-vs-simulated note.

---

## 12. Scope cuts and kill criteria

**Cut first (in order):** extra languages → map tiles → signature verification UI detail → corroboration tier → user-submitted reports.

**Never cut:** provenance cards, official-text-always-visible, offline/stale banner, simulated/live banner, README disclosure.

**Kill criteria:**

- [KILL] Live CAP/GDACS ingest unstable after hour 8 → simulated feed is the spine; live is demo garnish.
- [KILL] MT unavailable/unreliable → glossary + templates + source text.
- [KILL] No signed feeds available → present signature as "not provided" honestly; don't fake attestation.
- [KILL] Time short → 2 languages, no map, list-only. Still coherent and deployable.
- [KILL] Any temptation to add "safe route" → hard no (constraint).

---

## 13. Rubric mapping

| Criterion | Weight | Our strongest evidence |
|---|---|---|
| Innovation | 20 | Provenance-first trust UX + translation-integrity badges + offline-stale safety for tourists (narrow, honest differentiation) |
| Technical | 35 | Tiered verification, adapter architecture, failure/degradation matrix, staleness logic, tests |
| Feasibility | 20 | Real CAP/GDACS + simulated fallback, serverless deploy, low-bandwidth mode, non-goals |
| Video | 15 | Structured 7-beat script incl. offline + failure demos |
| Deployment | 10 | Public PWA link, seeded demo, health page, full disclosure |

---

## 14. Sourced facts vs hypotheses (audit trail)

**Sourced facts [FACT]:**
- CAP 1.2 is the OASIS/WMO/ITU-T standard for all-hazard alert exchange and defines an optional signature element.
- FEMA WEA uses XML digital signatures for non-repudiation; FCC multilingual WEA expansion has been delayed.
- SACHET (NDMA) and IMD produce/distribute CAP alerts in India.
- GDACS exposes a public no-auth REST API; Google Flood Hub covers riverine floods only and its API is access-restricted/non-commercial.
- Machine-translation errors in emergency/medical contexts are documented safety risks.
- The brief requires public hosting, GitHub repo, 2–5 min video, README, and disclosure of APIs/libraries; fake demos risk disqualification.

**Hypotheses [HYPOTHESIS] (verify before judging):**
- Most CAP feeds are unsigned, so signature verification will often be "not provided."
- No mainstream tourist app visibly surfaces per-alert provenance + translation confidence.
- Back-translation similarity is a useful but noisy QA signal.
- A hash-chained ledger is cheap to build and reads well to judges.

---

## 15. Sources

Accessed 2026-10-09. Provided for provenance; not independently re-verified beyond the search result text.

1. OASIS — Common Alerting Protocol v1.2: https://docs.oasis-open.org/emergency/cap/v1.2/CAP-v1.2-os.html
2. WMO — Common Alerting Protocol: https://wmo.int/activities/common-alerting-protocol-cap
3. FEMA — Common Alerting Protocol / IPAWS: https://www.fema.gov/emergency-managers/practitioners/integrated-public-alert-warning-system/technology-developers/common-alerting-protocol
4. DHS — Wireless Emergency Alerts CMSP Cybersecurity Guidelines (XML signatures, non-repudiation): https://www.dhs.gov/sites/default/files/publications/WEA-CMSP-Cybersecurity-Guidelines-508.pdf
5. FCC — Multilingual Alerting for EAS/WEA: https://www.fcc.gov/MultilingualAlerting_EAS-WEA
6. NDMA — SACHET National Disaster Alert Portal: https://sachet.ndma.gov.in/
7. PIB — IMD CAP weather warnings: https://www.pib.gov.in/PressReleasePage.aspx?PRID=2288239
8. GDACS integration (public REST API): https://www.elastic.co/docs/reference/integrations/gdacs
9. Google — Flood Hub FAQ (riverine only, coverage limits): https://support.google.com/flood-hub/answer/15638004
10. Google — Flood Forecasting API: https://developers.google.com/flood-forecasting
11. PreventionWeb — Machine translation for emergency communication: https://www.preventionweb.net/publication/documents-and-publications/understanding-and-improving-machine-translations-emergency
12. Tranquality — AI Safety and translation errors: https://www.tranquality.info/wp-content/uploads/2025/09/AI-Safety-Report-LTAC.pdf
13. OECD — Adapting tourism to extreme weather events: https://www.oecd.org/en/publications/oecd-tourism-trends-and-policies-2026_3fd3cd75-en/full-report/adapting-tourism-to-extreme-weather-related-events_30e2191f.html
