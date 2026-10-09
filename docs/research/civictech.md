# CivicTech — Transparency and Coordination in Public Works Projects

**Strategy & research memo for the 24-hour web MVP.** Companion to `docs/hackathon-brief.md` (CivicTech track, lines 65–73). This is a decision document, not an implementation. No application code was written and no external systems were touched.

- **Scope:** one track only — CivicTech / public works.
- **Method:** decompose the problem, compare against known existing systems, specify a distinctive feasible MVP, specify a real collision-detection algorithm with honest uncertainty, specify the resolution/audit model, data model, tests, deployment, demo, and kill criteria.
- **Team size was unknown when commissioned; the team subsequently reported 3–4 builders.** Skills remain unspecified.
- **Hard honesty constraints (from the task and the brief):** no fake government integrations, no invented monetary savings, no claims of having "verified" construction or wrongdoing, and no unsupported claims of global novelty. Everything uncertain is labeled.

---

## 1. Problem decomposition

The brief (lines 69–73) bundles two distinct failures that most solutions solve separately:

| Failure | Who feels it | What's missing |
|---|---|---|
| **Transparency** | Residents | Purpose, responsible authority, timeline, delay reasons, a way to follow up |
| **Coordination** | Departments / utilities / contractors | Awareness of each other's planned works in the same place and time |

The brief's sharpest concrete symptom is **repeated excavation**: "the same road may be dug up several times in a few months by different departments." That is a **spatio-temporal collision** problem. This is the wedge: build a tool whose core is detecting and resolving those collisions, then expose the resolution to citizens. That single core simultaneously produces transparency (the public sees *why* a road is being dug and *what was coordinated*) and coordination (departments see each other's plans before they dig).

### Actors
- **Resident / commuter / business owner** — wants to know what, who, how long, and how to complain; wants to plan around disruption.
- **Department officer** (roads, water, drainage, electricity, telecom) — wants to plan and report work with minimal overhead.
- **Utility / contractor** — performs work, often not a municipal department.
- **Municipal coordinator / engineer** — the operator of this tool: reviews conflicts, brokers resolutions.
- **Auditor / journalist / councillor** — reads the public record.

### Jobs to be done
1. *"Tell me what is happening on my street and who is responsible."* (transparency)
2. *"Show me, before I dig, whether someone else is already digging here soon."* (coordination)
3. *"When two works collide, help us agree who moves and record the agreement so it sticks."* (resolution + accountability)

### Design consequences
- The system must be **usable without any real government integration**. The brief explicitly permits simulated data only for HealthTech; equivalent permission for CivicTech is not stated and should be confirmed. Proposed CivicTech fixtures must be labeled synthetic. Inputs can be manual or imported, never a claimed live municipal feed.
- The public and internal views share one data model but differ in **field visibility**.
- The value must be demonstrable on **seeded, clearly-labeled synthetic data** and, optionally, on a real open dataset the team imports itself.

---

## 2. Existing systems and differentiation

> **Provenance:** The following is from the author's **prior knowledge, not verified in this session**. Web search and fetch were unavailable in this environment (see Appendix A for verification steps). Treat every claim here as *to be confirmed* before it is repeated on a slide. Nothing here is presented as a measured comparison.

> **Primary-source check by orchestrator, 2026-10-09:** [DfT: Plan and manage roadworks](https://www.gov.uk/guidance/plan-and-manage-roadworks) explicitly covers planning/managing/recording works, permit applications/assessment, inspections, and reinstatements. It also explicitly states that roadworks data is publicly viewable free of charge through an API with registration. Therefore, do **not** characterize Street Manager as lacking public transparency or assert that it lacks our workflow/algorithm without further documentation. Other competitor feature exclusions in the table remain unverified; absence of a feature on one page is not evidence that the product lacks it.

Known approaches in this space, grouped:

| Category | Representative systems (unverified) | What they do | What they do **not** do |
|---|---|---|---|
| Statutory street-works permitting & coordination | UK **Street Manager** (DfT) | Digital permits/notices, conditions, coordination notices, open data | Not citizen-facing in an explainable way; assumes a formal permit regime; not a general conflict engine for teams without such a regime |
| One-call excavation notification | US **811 / Call Before You Dig** | Notify utilities before digging so lines are marked | Safety locate service, not planning-level scheduling; no public timeline, no conflict scoring |
| "Dig once" policy | Municipal/state dig-once policies (often broadband conduit) | Policy to share trench openings | A policy, not a tool; enforcement and coordination are manual |
| Citizen reporting | **FixMyStreet** (mySociety), **SeeClickFix**, municipal grievance apps | Report potholes/defects; route to authority | Reactive, one-way; no inter-department planning or collision detection |
| Static open data / dashboards | City open-data permit/roadwork datasets, construction maps | Publish permits or works | Static, no conflict reasoning, no resolution workflow, no audit |
| Traffic/navigation | Waze, Google/Apple Maps road-closure layers | Congestion and closures | Not about who is responsible or why work is duplicated |

### The defensible differentiation (not a novelty claim)

The realistic claim is **not** "the first system to coordinate street works" — Street Manager exists and does coordination. The defensible claim is a **specific combination** that is (a) open and model-agnostic, (b) built around an **explainable spatio-temporal conflict score with explicit uncertainty**, and (c) carrying a **tamper-evident public audit of the resolution**, all in one artifact that serves residents and departments at once.

Three candidate differentiators, each stated as a design choice, not a first-ever claim:
1. **Uncertainty-aware conflict detection.** Treats works as *uncertain* intervals in space and time and reports a conflict **probability with a credible interval and a sensitivity check**, rather than a binary overlap flag or a static map layer.
2. **Resolution as a first-class, auditable object.** The negotiation (merge / reschedule / sequence / accept risk) and its acknowledgements are recorded in an append-only, hash-chained log anyone can verify for internal consistency.
3. **Two-sided by construction.** The same conflict that a coordinator resolves is the thing a resident sees explained ("your road is being opened once because two departments combined their work").

**Positioning line to use on a slide:** *"Street Manager-class coordination assumes a permit regime. We built the open, uncertainty-aware coordination layer — and made its decisions auditable — for places that don't have one yet."*

---

## 3. Product concept

**Working name: `Corridor`** (alternatives: `UnderOneRoad`, `DigSync`, `CommonGround`). A shared map of planned and ongoing public works where collisions are detected automatically, resolutions are negotiated and logged, and the public sees the outcome.

**One-liner:** *A shared, auditable map of who is digging where and when — so a road is opened once, not three times.*

### Two views, one core
- **Public view:** map + timeline of works; purpose, responsible department/contractor, status, planned vs actual dates, "last updated N days ago", the resolved conflicts (what was combined/moved), and a way to follow/comment.
- **Coordinator view:** conflict board ranked by severity; for each conflict, the algorithm's explanation and uncertainty; a workflow to propose/agree a resolution; an audit trail.

### Why this fits a 24-hour build
- The *hard, judge-impressing* part is the conflict engine — bounded, testable, deterministic-with-seed.
- The *visible* part is a map + workflow — standard web work.
- No external dependencies are required to demo; data is seeded and labeled synthetic.

---

## 4. Core innovation: the collision-detection algorithm

> **Orchestrator decision:** the Monte Carlo design below is exploratory and is **not the selected MVP**. Wilson intervals measure Monte Carlo sampling error under assumed distributions, not real-world confidence or model calibration; they are not Bayesian credible intervals. Planned/actual dates do not prove current conditions. The final plan uses deterministic corridor/date overlap plus sequential re-excavation checks and transparent uncertainty labels. A locally stored hash chain is not independently tamper-proof. See `../winning-strategy.md` for controlling scope, schedule, architecture, and acceptance criteria.

This is the technical centerpiece (rubric: 35% technical, 20% innovation). It must be real, implementable in a day, and honest about uncertainty.

### 4.1 Representing a work

Each **Work** has:
- **Footprint** `G`: point-with-accuracy-radius, LineString-with-width, or Polygon (normalized to a buffered polygon for metric math).
- **Schedule:** a *planned* start/end and, where known, an *actual* start/end. Because plans slip, each date carries uncertainty expressed as a **triangular distribution** `Tri(min, mode, max)` — a form that maps naturally to how people actually plan ("earliest the 3rd, most likely the 10th, worst case the 20th").
- **Disruption attributes:** road class, lane-closure count, full-closure flag, pedestrian/sensitive-site proximity, asset type.

All geometry is stored in EPSG:4326 and projected to a local UTM zone for buffers/distances in **meters**.

### 4.2 Spatial score `S(A,B)`

Let `buf(X) = buffer(X.geom, X.accuracy/2 + baseBuffer)`, with `baseBuffer` a configurable tolerance (default e.g. 5 m).

```
inter = intersection(buf(A), buf(B))
if area(inter) > 0:
    S = area(inter) / min(area(buf(A)), area(buf(B)))     # overlap fraction
    spatialType = "intersect"
else:
    d   = distance(A.geom, B.geom)
    tol = A.accuracy/2 + B.accuracy/2 + 2*baseBuffer
    S   = max(0, 1 - d / tol)                              # graded proximity
    spatialType = "proximity"
```

Rationale: `min`-area normalization means a small trench fully inside a large resurfacing footprint scores 1.0 (fully relevant to the smaller, more disruptive work). Graded proximity catches *adjacent segments of the same corridor* that would still disrupt the same street.

### 4.3 Temporal overlap probability `P(A,B)`

Monte Carlo over the uncertain intervals. Seeded RNG → reproducible.

```
N = 2000                         # configurable; fixed seed for determinism
overlapDays = []; hits = 0
for i in 1..N:
    sA = Tri(A.start); dA = Tri(A.duration); eA = sA + dA
    sB = Tri(B.start); dB = Tri(B.duration); eB = sB + dB
    ov = max(0, min(eA,eB) - max(sA,sB))
    if ov > 0: hits++
    overlapDays.push(ov)
P  = hits / N
ci = wilsonInterval(hits, N, 0.90)         # 90% CI on the probability itself
expectedOverlap = median(overlapDays where ov > 0)
overlapWindow   = [quantile(overlapDays, 0.05), quantile(overlapDays, 0.95)]  # conditional
```

**Hard conflicts (certainty).** If both works have *confirmed/actual* dates that overlap, set `P = 1.0`, `spatialType = "confirmed"` — no simulation needed. This cleanly separates *certain* overlaps from *probable* ones.

**Assumption, stated plainly:** starts and durations are treated as independent across works. Real slippage can be correlated (monsoon, budget cycles). A stretch goal adds a shared "season" latent variable; until then the UI must say "assumes independent scheduling uncertainty."

### 4.4 Disruption weight `W(A,B)`

A normalized weighted sum in `[0,1]` over interpretable factors, e.g.:

```
W = clamp01(
      w1*roadClassScore + w2*laneClosureScore + w3*fullClosure
    + w4*sensitiveSiteProximity + w5*assetCriticality
    + w6*durationOverlapScore )
```

Weights are config-driven and exposed in the UI, so a judge can see the lever, not a black box.

### 4.5 Severity and explainability

```
severity = round(100 * P * S * W)      # 0..100
```

Every conflict stores its **multiplicative decomposition** (`P`, `S`, `W`), the overlap geometry, the expected overlap window, the assumptions-version id, and the RNG seed. The UI renders a sentence like:

> *"Conflict 82/100: works on the same 120 m stretch overlap with ~78% probability (90% CI 74–81%), expected 6–11 overlapping days; both require a lane closure on an arterial road. Driver: high spatial overlap × high disruption. Assumes independent schedule uncertainty; ranking stable under ±2× buffer and ±2× date uncertainty."*

### 4.6 Defensible uncertainty (this is the part judges should probe)

- **Probabilities come with intervals** (Wilson CI), not just point estimates.
- **Sensitivity analysis:** re-run the full ranking over a grid of `bufferScale ∈ {0.5, 1, 2}` × `uncertaintyScale ∈ {0.5, 1, 2}`; report **top-K set stability** (e.g., how many of the top 5 survive all 9 configurations). Stable → "robust ordering"; unstable → flag "low confidence in ordering."
- **Reproducibility:** seed + assumptions version recorded per conflict; recomputation is deterministic.
- **Explicit non-claim:** this is a *decision-support prioritization heuristic over self-reported/imported data*. It does **not** verify ground truth, does **not** prove duplication or wrongdoing, and must **not** be converted into a money figure.

### 4.7 Candidate generation (performance)

Naive pairwise is O(n²). For the MVP scale (hundreds of works) that is acceptable, but do it properly: build a bounding-box index (PostGIS GiST / SQLite R*Tree / a grid bucket) and only simulate pairs whose padded boxes intersect. This keeps "recompute all" interactive and is an easy technical-depth point.

### 4.8 Reference pseudocode

```
function detectConflicts(works, cfg):
    candidates = spatialIndex.queryPairs(works, pad = cfg.maxBuffer)
    out = []
    for (A, B) in candidates:
        if A.dept == B.dept and not cfg.includeIntraDept: continue
        S, type, geom = spatialScore(A, B, cfg)
        if S <= 0: continue
        P, ci, win = temporalOverlap(A, B, cfg)
        if P < cfg.minP and type != "confirmed": continue
        W = disruptionWeight(A, B, cfg)
        out.append({A, B, P, ci, S, type, W, severity: round(100*P*S*W), ...})
    return rank(out, by = severity)
```

---

## 5. Resolution workflow and auditability

Rubric: technical + feasibility. The workflow turns a detected conflict into a durable, reviewable decision.

### 5.1 Conflict state machine

```
detected → triaged → coordinating → resolution_proposed → agreed → closed
                                        │                     │
                                        └────→ disputed ←─────┘
any non-closed state → cancelled
```

Resolution types: `merge` (dig once), `reschedule`, `sequence` (stagger), `split` (separate corridors), `no_action`, `accept_risk`.

Guards (enforced server-side, illegal transitions return 409):
- `resolution_proposed` requires a resolution type, summary, and proposer.
- `agreed` requires an acknowledgement from **each involved department**; a coordinator **override** is allowed only with a mandatory rationale (and is logged distinctly).
- `closed` requires a self-reported completion date. **It does not assert verification.**

### 5.2 Tamper-evident audit log

Append-only `AuditEvent`, hash-chained:

```
hash = SHA256(prev_hash || canonical_json(payload))
genesis prev_hash = "0"*64
```

- Every state transition, every resolution proposal/ack/override, and every **conflict computation** (storing input hash + assumptions version + seed) writes an event.
- `GET /api/audit/verify` recomputes the chain and returns `{ok, firstBrokenIndex}`.
- **Non-claim:** this detects *internal tampering with our own log*. It is **not** a blockchain, **not** a government record, and does **not** prove that real-world work happened. Say this in the demo.

### 5.3 Transparency surface
- Public map/timeline with purpose, responsible dept/contractor, status, planned vs actual, and a **staleness** indicator ("last updated 41 days ago").
- Resolved conflicts shown publicly with the resolution summary (public fields only).
- Residents can follow an area and comment. Comments have `visibility`; internal notes never appear publicly.

---

## 6. Data model

Postgres + PostGIS target. Types simplified.

| Entity | Key fields |
|---|---|
| `Jurisdiction` | id, name, bbox, timezone |
| `Department` | id, jurisdiction_id, name, type, contact |
| `Contractor` | id, name, contact |
| `Asset` (optional) | id, type, geometry, owner_dept_id |
| `Work` | id, jurisdiction_id, title, purpose, dept_id, contractor_id, geometry, geom_accuracy_m, road_class, lane_closures, full_closure, sensitive_site, asset_criticality, planned_start/end, earliest/latest_start/end, actual_start/end, status, visibility, created_by, created_at |
| `WorkStatusHistory` | id, work_id, from, to, actor, rationale, at |
| `Conflict` | id, work_a_id, work_b_id, severity, p_overlap, p_ci_low, p_ci_high, spatial_score, spatial_type, overlap_geom, overlap_start_med, overlap_end_med, disruption_weight, factors_json, assumptions_version, rng_seed, computed_at |
| `ConflictReview` | id, conflict_id, state, assignee, updated_at |
| `Resolution` | id, conflict_id, type, summary, proposed_by, proposed_at, agreed_at, status |
| `ResolutionAck` | id, resolution_id, dept_id, ack_by, decision, ack_at |
| `Comment` | id, target_type, target_id, author, body, visibility, created_at |
| `Subscription` | id, user_id, area_geom, channel |
| `AuditEvent` | seq, id, actor, action, entity_type, entity_id, payload_json, prev_hash, hash, at |
| `User` | id, name, role, dept_id, email_hash |
| `Evidence` | id, owner_type, owner_id, kind, url, note, uploaded_by, at |

Notes:
- `visibility` on `Work` and `Comment` drives the public/internal split.
- `assumptions_version` + `rng_seed` make any conflict score reproducible and citable.
- `Evidence` exists for *attachments*, never for asserting third-party verification.
- **Security-sensitive utility geometry** is a real-world concern (some infrastructure locations are restricted). For the demo, use synthetic data; note the concern as a deployment consideration, not a solved problem.

---

## 7. Architecture and stack (with decision rules for unknown skills)

**Recommended default (minimal moving parts):**
- **Next.js** (React + API route handlers) as a monolith — one language, one deploy.
- **MapLibre GL JS** + OpenStreetMap raster/vector tiles (no API token).
- **Postgres + PostGIS** on a managed host (Neon/Supabase).
- Geometry math in SQL (`ST_Buffer`, `ST_Intersection`, `ST_Distance`) for the spatial score; Monte Carlo in a Node module.

**Decision rules:**
- *No GIS comfort / PostGIS setup is eating time* → switch to **SQLite** + a JS geometry library (Turf) and an R*Tree prefilter. Geometry lives in SQLite as GeoJSON. Keep the same algorithm interface.
- *Team is Python-strong* → **FastAPI** + PostGIS + Shapely/SciPy; still Next.js or a static React front end.
- *Solo dev* → drop to a single Next.js app, SQLite, Turf, seeded auth.

**Trigger points:** recompute conflicts on work create/update, plus a manual "recompute all" (bounded N). Nightly cron is a stretch.

**Auth:** seeded demo accounts + session cookie, roles enforced server-side. State clearly that this is demo auth, not production identity.

---

## 8. Acceptance tests

Concrete, runnable, mapped to the algorithm and workflow. (Unit / integration / e2e.)

| # | Given | When | Then |
|---|---|---|---|
| T1 | Valid GeoJSON/CSV of works | import | rows created; counts match; geometry parsed |
| T2 | Malformed row (bad geometry/date) | import | rejected with field-level error; no partial corruption |
| T3 | Two footprints that overlap | detect | `spatialType="intersect"`, `S>0` |
| T4 | Two footprints 100 m apart | detect | `S=0`, no conflict |
| T5 | Two footprints 2 m apart within tolerance | detect | `spatialType="proximity"`, `0<S<1` |
| T6 | Two works, confirmed overlapping dates | detect | `P=1.0`, `spatialType="confirmed"` |
| T7 | Two works, disjoint planned windows | detect | `P≈0`, not flagged |
| T8 | Two works, uncertain overlapping windows | detect | `0<P<1` with `p_ci_low ≤ P ≤ p_ci_high` |
| T9 | Same fixture, same seed | detect twice | identical `P`, `severity`, ordering (determinism) |
| T10 | Fixture ranking | run 9-config sensitivity grid | top-5 stability reported; result reproducible |
| T11 | Severity fixture | compute | `severity == round(100*P*S*W)` within rounding |
| T12 | Illegal transition (e.g., detected→closed) | attempt | HTTP 409; state unchanged |
| T13 | Resolution proposed | attempt `agreed` without all acks | rejected |
| T14 | Coordinator override | agree with rationale | allowed; distinct event type recorded |
| T15 | Any transition | perform | one append-only AuditEvent written |
| T16 | Untampered audit log | verify | `{ok:true}` |
| T17 | Direct DB edit of an event | verify | `{ok:false, firstBrokenIndex:...}` |
| T18 | Public view request | load | internal-only fields (notes, PII) absent |
| T19 | 500 seeded works | detect all | completes under a stated budget (e.g., < 2 s) |
| T20 | Deployed public URL | smoke test | health OK; seed loads; create→conflict→resolve→verify works end to end |

Test T9 (determinism) and T10 (sensitivity) are the ones that make the "defensible uncertainty" claim real rather than decorative.

---

## 9. Deployment (rubric: 10%, mandatory)

- **Primary:** Vercel (front end + serverless API) + Neon/Supabase Postgres with PostGIS. Public URL, no local setup for judges.
- **Alternative:** one Docker image on Render/Railway/Fly + managed Postgres; `docker-compose.yml` for local parity.
- **Seeding:** deterministic seed script creates a labeled-synthetic scenario (two departments about to dig the same stretch). A guarded `/demo/reset` endpoint restores it so judges always see the same thing.
- **Ops hygiene:** `/health` endpoint; structured logs; input validation (zod/pydantic); rate-limit the public write API; secrets via platform env. **No external government credentials exist or are needed** — this is what keeps the "no fake integration" promise.
- **Data note surfaced in the UI:** a persistent banner "Demo data is synthetic. No live municipal systems are connected."

---

## 10. Demo video (2–5 min, rubric 15%)

Target ~4:00. Screen-record, one scenario, one narrator.

| Time | Beat | On screen |
|---|---|---|
| 0:00–0:20 | Hook: "This stretch was dug up three times in four months by three departments." | photo/stock of repeated excavation + the brief's quote |
| 0:20–0:50 | Resident view: works near me, who's responsible, timeline, staleness, follow | public map + work card |
| 0:50–1:25 | Coordinator imports/creates works; conflict board appears, ranked | two works → a new conflict at top |
| 1:25–2:15 | **The algorithm**: click the conflict; show `P`, 90% CI, spatial overlap, disruption factors, plain-English explanation; toggle buffer/uncertainty and show the ranking stays stable (or is flagged unstable) | explanation panel + sensitivity |
| 2:15–3:05 | **Resolution workflow**: propose "merge", both departments acknowledge, coordinator closes; show the audit chain and `/audit/verify` returning ok; tamper a row live and show it fail | workflow + audit verify |
| 3:05–3:40 | Payoff: one excavation instead of two; resident now sees the combined work and the reason | before/after public view |
| 3:40–4:00 | Technical close: architecture, tests green, deployed link, explicit non-claims | diagram + test output + URL |

Rules for the video: never claim live government data, never show a money number, and explicitly say "synthetic demo data" and "this detects internal log tampering, not real-world completion."

---

## 11. Feasibility: critical path for 24 hours

Assume unknown team; sequence is dependency-ordered, not calendar-bound.

1. **H0–1 — Scaffold + schema + seed.** Next.js app, DB, entities, synthetic fixtures (two colliding works + a few neutral ones).
2. **H1–4 — Deterministic core.** Spatial score, hard-conflict detection, candidate indexing. Unit tests T3–T7.
3. **H4–6 — Uncertainty.** Triangular intervals + Monte Carlo + Wilson CI + determinism test (T8, T9).
4. **H6–7 — Scoring + sensitivity.** Severity decomposition + 9-config grid (T10, T11).
5. **H7–11 — UI.** Map, work cards, conflict board, explanation panel.
6. **H11–14 — Workflow + audit.** State machine, acks, hash chain, verify endpoint (T12–T17).
7. **H14–16 — Public view.** Field-visibility split, staleness, follow/comment (T18).
8. **H16–18 — Import.** CSV/GeoJSON import + validation (T1, T2) — *if behind, ship seeded create-form only.*
9. **H18–20 — Deploy + performance + smoke.** T19, T20.
10. **H20–23 — Video + README + buffer.**
11. **H23–24 — Submit** (30-min window per brief lines 21–22).

Critical path = **core engine → UI explanation → workflow → deploy.** If any of these slip, cut from the right (Section 12), never from the engine's honesty.

---

## 12. Cuts and kill criteria

**Tiers**
- **P0 (must exist for the demo):** synthetic seed; spatial+temporal conflict detection with `P` and CI; conflict board with explanation; one resolution type (`merge` or `reschedule`) end-to-end; hash-chained audit + verify; public view; deployed public URL.
- **P1 (should):** sensitivity grid; import CSV/GeoJSON; comments/follow; multiple resolution types; performance test.
- **P2 (nice):** nightly recompute; subscriptions/notifications; correlated-slippage model; asset registry; role admin UI.

**Kill triggers (time-gated decisions)**
- If PostGIS setup isn't working by the engine milestone → **kill PostGIS**, move to SQLite + Turf. (The algorithm is unchanged.)
- If Monte Carlo + sensitivity threatens the UI milestone → **keep Monte Carlo, cut the sensitivity grid to 3 configs** (not zero — it's the credibility hook).
- If the workflow/audit threatens deployment by the deploy milestone → **cut to a single resolution type and two roles**; keep the hash chain (small, high-value).
- If import threatens the core → **cut import entirely**; ship the create-form + seed.
- If behind at the video milestone → **record a shorter 2:30 cut** rather than skip deployment. Deployment is 10% and mandatory.

**Explicit anti-patterns (do not do, even if behind)**
- Do not fabricate a municipal API integration or imply live data.
- Do not compute or display a rupee/dollar savings figure.
- Do not claim the system "verified" that work was completed or that a department did something wrong.
- Do not call the hash chain a blockchain.
- Do not claim to be the first/only coordination system.

---

## 13. Rubric mapping

| Criterion (weight) | How this plan scores | Evidence to show |
|---|---|---|
| Innovation (20) | Uncertainty-aware, explainable conflict engine + auditable resolution + two-sided by design | explanation panel, sensitivity stability, audit verify |
| Technical (35) | Real spatial+temporal algorithm, Monte Carlo with CIs, sensitivity, hash-chained audit, state machine, indexing, tests | algorithm section, test suite output, code structure |
| Feasibility (20) | Import-based (no fake integration), graceful stack fallback, seeded demo, honest limitations, future path (real open data, notifications) | architecture, decision rules, non-claims |
| Video (15) | Single tight scenario, algorithm shown, payoff shown, non-claims stated | storyboard above |
| Deployment (10) | Public Vercel URL, seeded demo, health check, one-click reset | live link, smoke test |

---

## 14. Risks, edge cases, and non-claims register

**Risks**
- *Data availability.* Real works data may be incomplete or non-spatial; mitigated by import + synthetic seed, and by a manual create form.
- *Uncertainty honesty vs. usability.* Probabilities can confuse; mitigated by plain-language explanations and the deterministic "confirmed" class.
- *Independence assumption* in Monte Carlo may overstate or understate overlap during correlated delay seasons; disclosed, with a stretch fix.
- *Security-sensitive geometry.* Publishing some utility locations may be inappropriate in reality; demo uses synthetic data and flags this as a deployment decision.
- *Scope.* The engine is the risk; the plan's kill criteria protect it.
- *Existing-system overlap.* Street Manager-class systems exist; we position as complementary/open, not novel-in-kind.

**Non-claims register (state these in README and video)**
1. No live government/municipal integration; all demo data is synthetic and labeled.
2. No monetary savings are computed or claimed.
3. Conflict scores are decision-support heuristics over self-reported/imported data; they do not verify reality.
4. The audit log detects internal tampering with our own records; it is not a blockchain and not an official record.
5. No claim of being the first or only street-works coordination system.
6. Completion statuses are self-reported, not verified by the platform.

---

## Appendix A — Optional primary-source research (NOT performed; labeled unverified)

Web search/fetch were unavailable in this session, so Section 2 is prior knowledge. Before putting any comparison on a slide, verify with these primary sources:

- UK Department for Transport — *Street Manager* (gov.uk service pages / DfT guidance): confirm scope (permits, notices, coordination, open data).
- US *811 / Call Before You Dig* (national one-call): confirm it is a locate/safety service, not a scheduling/coordination tool.
- *Dig Once* policies (US DOT / state DOT broadband guidance): confirm it is policy, not tooling.
- *FixMyStreet* (mySociety) and *SeeClickFix*: confirm citizen-reporting scope.
- A representative municipal open-data roadwork/permit dataset (e.g., a large city's construction-permit or street-works dataset): confirm what is and isn't published.
- Any Indian municipal grievance/works app relevant to the team's city.

For each, record: source URL, date accessed, and the one-sentence distinction that matters. Add a "verified on <date>" note to Section 2 before the video.

---

## Appendix B — Open questions for the parent agent / team

1. Team size and strongest skills (GIS? React? Python?) → selects the Section 7 stack branch.
2. Any city the team wants the scenario to name? (Use a *generic* jurisdiction unless data is legitimately open and imported by the team.)
3. Is the team comfortable with PostGIS, or should the default be SQLite + Turf from the start?
4. Should P1 import target one specific open dataset the team will actually fetch and cite, or stay format-generic?

**Recommended defaults if no answer:** SQLite + Turf (fastest to a deployed link), generic synthetic jurisdiction, keep import format-generic, and keep the sensitivity grid at 3 configs.
