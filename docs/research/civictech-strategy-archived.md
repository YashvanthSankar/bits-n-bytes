# Archived CivicTech strategy — superseded by TravelTech

> Historical planning only. The team subsequently chose TravelTech with Expo for Android and a requested macOS target. This document is not an implementation assignment; use `../winning-strategy.md` for current scope. The independent CivicTech review identified unresolved approval-cardinality, proposer-approval and session-persistence ambiguities. Do not implement this archived plan without resolving them.

**Status:** planning only; no application code implemented or tested. Supplied organizer brief is the rule source. Team: 3–4 builders; strongest stack unknown. Team reports AI agents are allowed; retain the organizer confirmation. This plan aims to maximize our chance of shortlisting and winning, not promise either.

## 1. Decision: recommend CivicTech — “Corridor”

**Pitch:** *Before another department digs the same road, detect the overlap, agree a coordinated plan, and let residents see who changed what and why.*

The winning unit is not a map. It is a working loop:

**publish work → detect overlap/re-dig risk → explain evidence → propose a revised schedule → both departments approve → atomically apply → residents see the updated plan and reason → resident reports a delay → responsible officer responds.**

Choose CivicTech provisionally, subject to team acceptance and clarification of synthetic fixture use. HealthTech is the fallback if organizers restrict CivicTech simulation or the team has materially stronger health-record expertise. Do not switch after the initial scope lock merely because another idea sounds exciting.

### Why this recommendation beats the alternatives for us

| Track | Best proposed wedge | Main 24-hour risk | Decision |
| --- | --- | --- | --- |
| HealthTech / Thread | Patient-held timeline, reconciliation prompts, scoped expiring/revocable shares | Clinical wording, data/terminology licensing, link privacy, scope leaks; structured-input demo may under-address paper/PDF reality | Strong second choice; simulated records explicitly allowed |
| TravelTech | Provenance-first multilingual alerts with honest offline/stale state | Local alert availability, translation safety, authority verification, coarse feeds cannot establish street flooding | Third choice unless team already has reliable local feeds and language expertise |
| CivicTech / Corridor | Explainable coordination decisions connected to a public timeline and follow-up | Municipal adoption/data entry; geometry ambiguity; danger of becoming generic CRUD | Best risk-adjusted default when narrowed to corridor-based deterministic logic |

This ranking is a judgment, not a predicted score or a claim about how many competitors choose each track. We do not know shortlist quotas or other teams' entries. Avoid fake precision from numerical “expected marks.”

**Verified comparison anchor:** [UK DfT's Street Manager guidance](https://www.gov.uk/guidance/plan-and-manage-roadworks), fetched 2026-10-09, confirms a real planning/permit/inspection/reinstatement service and publicly available roadworks data through an API with registration. Coordination and transparency are not inventions. Our differentiation is the specific working loop we implement, not an unsupported claim that existing products lack it.

### What I accepted and rejected from the agents

- Accepted the CivicTech two-sided coordination loop, source labels, and guarded approval workflow.
- **Rejected Monte Carlo, Wilson confidence badges, weighted severity scoring, and a 9-configuration sensitivity grid as MVP requirements.** Assumed distributions without calibration add fragile complexity, not reliable real-world probability.
- Added **sequential re-excavation** detection: simultaneous overlap alone misses the brief's “same road dug up several times in a few months” symptom.
- Added citizen delay reports and visible officer responses; coordination alone does not satisfy accountability.
- Kept an ordinary append-only change history. Hash-chain verification is optional, not the product or a tamper-proof claim.
- Rejected broad claims that competitors lack these features. Existing-system comparisons require primary-source verification before entering the pitch.

## 2. Full rules interpretation

- Kickoff: **Friday 9 October 2026, 8:00 PM**, IIITDM Kancheepuram.
- Development: **9 October 8:30 PM → 10 October 8:30 PM**, 24 hours; remote teams.
- Submission-only buffer: **10 October 8:30–9:00 PM**; submit **strictly before 9:00 PM**, leader only, Google Form shared that day.
- Timezone is not written in the brief. IST is a venue-based inference; confirm it. Do not use the local machine timezone as authority.
- Select one domain/problem. Code must be developed during the permitted window. No application code is being created in this planning phase.
- GitHub repository + **2–5 minute video added to the repository** + README explaining problem, solution, setup.
- Web deployment must have a **public usable link**. Libraries/APIs must be disclosed.
- Fake/non-working demos mean disqualification. Incomplete/non-functional work may be penalized.
- Initial evaluation and shortlisting are **within each domain**; Round 2 requires a presentation/demo, with timing announced later.
- Team retains ownership; promotional use requires organizers to request permission. Organizers do not cover technical/equipment failures.

**Still confirm:** timezone; AI-use confirmation wording/disclosure; pre-event planning/assets; registered team-size eligibility; synthetic CivicTech fixtures; video-file delivery vs link acceptance; repository visibility; form fields/availability; Round 2 schedule. Do not assume the 30-minute submission buffer permits more development.

For strict video compliance, prefer a compressed playable video file under `demo/` and link it from README. Verify repository host limits before recording/exporting; do not assume a README URL alone satisfies “added to repository.” Use Git LFS only if judge access and download behavior are verified.

## 3. Rubric-to-build priorities

| Criterion | Weight | Our evidence |
| --- | --- | --- |
| Innovation | 20% | A decision receipt linking conflict evidence, two-party coordination, revised plan, and public explanation |
| Technical implementation | 35% | Deterministic interval engine, revision-aware approval state machine, transactions, session-scoped authorization, direct API negative tests |
| Feasibility | 20% | Manual data entry works without institutional integrations; clear input uncertainty, low-bandwidth list, realistic adoption/limitations |
| Video | 15% | One real four-minute before/after workflow plus a failed unauthorized/stale action |
| Deployment | 10% | Public URL, fresh isolated seeded demo, persisted changes, clean-browser access |

**55% is technical + feasibility; 25% is video + deployment.** Ship a dependable core, reserve release time, and invest remaining polish in comprehension. An AI chatbot is not our core feature. No real-money savings or prevented-construction claims.

## 4. Selected scope — strict

### MUST

1. Public works list and corridor schematic/map: purpose, responsible department, public contact, planned dates, current reported status, update timestamp, and delay reason.
2. Department work create/edit form with validated corridor segment and schedule; persistent storage.
3. Explainable detector for simultaneous disruption and repeat excavation. Evidence links open both work records.
4. Reschedule proposal requiring both affected departments' acknowledgements, tied to exact input/proposal versions.
5. Transactional schedule application and public change receipt; rerun detection after updates.
6. Resident delay/quality report with tracking ID, linked to a work, and a public officer response. Resident allegations stay labeled unverified.
7. Server-side role and resource authorization, isolated seeded sessions, append-only history, automated domain tests.
8. Public deployment, honest synthetic-data banner, README/disclosures, recorded real demo.

### SHOULD, only after core passes

- Simple map visualization, CSV import with row errors, one overdue/stale badge, department inbox.
- Accessibility/mobile polish; export a plain-text coordination receipt.

### CUT / NOT IN MVP

- Probabilistic forecasting, weighted “AI risk” scores, PostGIS setup unless already familiar, arbitrary polygon geometry.
- Actual municipal integrations, phone/SMS/email delivery, photo upload pipeline, public social feed, payments, native mobile.
- Blockchain, production identity verification, “verified construction,” cost-savings estimates.
- Multi-city administration, automatic route planning, AI schedule changes without approval.

**Minimum convincing outcome:** a real reschedule avoids the seeded simultaneous collision, the second department approves the exact revision, the public view updates with a reason, and a resident report receives a traceable response. Do not call it merged construction unless joint-work execution is actually modeled.

## 5. Detector specification — bounded and honest

### Input model

For MVP, works choose a predefined **corridor ID** and segment `[from_m, to_m)` along that corridor. Use a few synthetic streets with surveyed-looking but explicitly invented coordinates; do not imply a real survey. This is **linear corridor matching**, not full GIS or cross-street detection. A map is illustrative, not the authority for distances.

Dates entered as inclusive civil calendar dates in the confirmed jurisdiction timezone are normalized to half-open **calendar-day intervals** `[start_day, end_day + 1)`. Day numbers represent local dates, not UTC instants; avoid daylight-saving off-by-one arithmetic.

Keep `requires_excavation`, `restores_surface`, `status`, `department_id`, `updated_at`, `schedule_revision`, and optional earliest/latest schedule bounds. Reject invalid segment/date ranges. Canceled work is excluded; missing/unknown dates are flagged as insufficient data, not interpreted as “no conflict.”

### Rule A — simultaneous disruption

For two works on the same corridor:

`overlap_m = max(0, min(toA, toB) - max(fromA, fromB))`

`overlap_days = max(0, min(endExclusiveA, endExclusiveB) - max(startA, startB))`

If both are positive, flag **planned overlap**, with both values and input revisions. A touching segment boundary has zero shared length. Two projects on the same calendar day do overlap because dates are inclusive. Include same-department collisions too; cross-department pairs are highlighted, not the only pairs checked.

### Rule B — sequential re-excavation review

If shared length is positive, A restores a road surface, B excavates, B starts on/after A's end-exclusive day, and the gap is within a visible policy threshold (initially **90 calendar days**, a demo assumption, not municipal law), flag **repeat-excavation review**. Report exact gap and threshold. Use actual completion date if present; otherwise label calculation as based on planned completion. This is a review candidate, not proof of waste. Necessary follow-up work may be legitimate.

### Uncertainty and ranking

- Exact planned windows: “overlap in submitted plans,” never “confirmed ground truth.”
- Optional earliest/latest ranges: “possible overlap within declared bounds”; no probability. Unknown bounds remain unknown.
- Rank simultaneous overlaps first, then re-excavation candidates, using shared length/overlap duration and stable IDs as deterministic tie-breakers. Expose the ordering rule; it is a heuristic, not objective societal harm.
- Deduplicate unordered work pairs by session and rule. Persist input revisions and rule version; changed inputs supersede results and invalidate old proposal approvals.
- Start with pairwise comparison for the small fixture. Document O(n²); add corridor grouping and temporal prefilters only if needed. Do not claim thousands-of-works scale until benchmarked.

## 6. Resolution and accountability semantics

Small state machine: **open → proposed → agreed/applied**, with **rejected/superseded** outcomes. No coordinator override in MVP.

1. An affected officer proposes exact replacement dates, rationale, both base work revisions, and proposal version.
2. Each affected department acknowledges the exact proposal version through an authorized session.
3. Apply only when both approvals exist and both work revisions still match.
4. In a database transaction, update affected schedule(s), increment revisions, append public history, mark proposal applied, and recompute affected flags. Repeat requests must not apply twice.
5. Changed proposals or schedules invalidate prior approvals; stale writes return conflict errors without partial changes.
6. Departments can reject with rationale. The public view says “coordination pending” or shows the published outcome; internal drafts and credentials never leak.
7. A resident report receives a tracking ID and is linked to the responsible department. An officer responds with a reason/status update. Publicly submitted allegations are not automatically published as established facts; escape user text and keep personal contact data out of public responses.

An applied plan is **not completed construction**. Status updates are self-reported. A change history is not a government-certified or independently immutable record.

## 7. Architecture and data contract

**Provisional stack if team knows TypeScript:** Next.js + managed PostgreSQL + one schema/validation layer + unit tests. Use a simple corridor SVG or Leaflet only after the primary loop works. Disclose map libraries, data/tiles and required attribution; verify tile-provider terms rather than assuming unlimited free use.

Choose the stack the team actually knows. If Python is stronger, use familiar Python backend tools with the same contracts. Lock stack within 30 minutes. Do not put SQLite on ephemeral serverless disk; a SQLite alternative requires persistent-volume hosting. No external account provisioning/deployment until authorized.

Core entities:

- `DemoSession`: isolated seed namespace, expiry, cookie-bound identity.
- `Department`, `Corridor`: session-owned fixture metadata.
- `Work`: public fields, segment/dates/status, source label, revision.
- `Conflict`: unordered work pair, rule/evidence, source revisions, active/superseded.
- `Proposal`, `Approval`: base revisions, proposed dates, version, per-department decision.
- `Report`, `Response`: work link, tracking ID, public-safe content/status, actor.
- `ChangeEvent`: actor, action, before/after or safe delta, timestamp, public summary.

Example API contract (planning only):

| Endpoint | Responsibility |
| --- | --- |
| `POST /api/demo-session` | Create rate-limited isolated fixture/session; issue secure HTTP-only cookie |
| `GET /api/works` | Public-safe fields only, scoped to session |
| `POST/PATCH /api/works` | Department ownership, input validation, expected revision |
| `GET /api/conflicts` | Explanation/evidence for session's current inputs |
| `POST /api/proposals` | Exact base revisions, replacement dates, reason |
| `POST /api/proposals/:id/approve` | Authorized department, exact proposal version, transactional apply |
| `POST /api/reports` | Validated/rate-limited text; return tracking ID |
| `POST /api/reports/:id/respond` | Responsible officer; public-safe response/history |

Seeded role switching is a **demo identity control**, not proof of officer identity. Still enforce the selected role/session/department on the server. Nobody can access another visitor's session by changing an ID. Reset affects only the caller's session; a public global reset is forbidden. Check origin/CSRF protections for cookie-authenticated writes and parameterize database queries.

## 8. Four-builder implementation split

| Owner | Exclusive scope | Done means |
| --- | --- | --- |
| A: integration/backend | DB/schema, sessions/authorization, API orchestration, transaction/state machine, hosting | Persistence, both-party approvals, isolation, stale-update protection verified |
| B: domain engine | Pure detector/types and fixture/test vectors | Positive, negative, boundary, deterministic and sequential cases pass |
| C: frontend | Resident and officer surfaces, forms, conflict evidence/proposal UI | Deployed full loop usable, errors clear, no fake success states |
| D: QA/data/demo | Fixtures after contract agreement, integration tests, README/disclosures, video/release checklist | Independent API abuse checks, clean-browser smoke, real 2–5 min video |

With three builders, A owns backend integration, B also owns fixtures and domain test evidence, and C owns UI; all reserve release time, with leader coordinating recording/submission. Avoid a dedicated doc-only role if it leaves implementation understaffed.

Agents use `opencode/deepseek-v4.1-flash`; each gets bounded file ownership, agreed types/API shapes, acceptance cases, timebox, and non-goals. A owns shared package/schema/config changes. The orchestrator accepts work only after checks, not completion claims.

## 9. 24-hour execution gates

T0 = confirmed **development start**. If joining late, use remaining time, not the full schedule; cut SHOULD items first.

| Time | Gate / cut decision |
| --- | --- |
| T+0–0.5 | Confirm scope/eligibility/timezone, lock stack/interfaces, initialize project in-window |
| T+0.5–2 | Minimal public deployment + persistent DB + labeled seed/session; hosting failure gets immediate priority |
| T+2–6 | Domain tests and persisted resident work list; create/edit + conflict evidence vertical slice |
| T+6–10 | Both-department proposal/approval/apply loop works on deployment |
| T+10–14 | Resident report/response, public history, API authorization and concurrency tests |
| T+14 | Core scope freeze; cut anything not on the critical loop |
| T+14–18 | Hardening, failure states, keyboard/mobile, clean-browser tests; optional map/import only if core green |
| T+18–20 | README/disclosures, complete rehearsal, export recording, repository video delivery check |
| T+20–22 | Record final real ~4-minute video; all links and files verified |
| T+22–23 | Release candidate verification, leader prepares submission, fix only blockers |
| T+23 | Internal final freeze; preserve last good build |
| T+24 | Official development stops; no further code changes |
| T+24–24.5 | Submission logistics only; leader submits as early as form availability permits, strictly before deadline; save receipt |

At T+6, if geometry is blocking, use corridor segment form/schematic and remove map work. At T+10, if approvals are not integrated, drop all optional features and prioritize the state machine. Do not cut authorization, persistent application of the plan, or video/deployment to preserve decoration. Stagger rest; no plan assumes four people can work effectively for 24 hours without breaks.

## 10. Acceptance tests — required evidence, currently pending

1. Same corridor/shared segment/overlapping dates → one planned-overlap flag with exact days/metres.
2. Different corridors or disjoint segments → none; known crossing-corridor limitation disclosed.
3. Segment boundary touching → no shared-length conflict; date touching on the same civil day → overlap.
4. Restored surface followed by excavation at 0/90/91-day gaps → matches configured boundaries; label planned vs actual basis.
5. Invalid/missing date or reversed segment → actionable validation/insufficient-data state, not false no-conflict.
6. Same inputs in different order → same pair IDs, flags and ordering.
7. Same-department overlaps are not silently excluded; canceled work is excluded.
8. Resident/other department directly calls write API → denied, no change.
9. One approval cannot apply; different proposal version or stale work revision cannot apply.
10. Both valid approvals → changes/history/conflict recomputation persist; failure rolls back all changes.
11. Two concurrent apply attempts → one application; duplicate request is harmless.
12. A proposal editing the wrong session/resource is denied; internal notes/private contact never appear publicly.
13. Resident report persists with tracking ID; responsible officer response appears with timestamp and honest status.
14. Two independent browser sessions cannot modify/reset/read each other's private data; shared-link behavior, if added, is explicitly tested.
15. Public deployed URL survives refresh/new session/redeploy with intended persistence; core works on mobile width and keyboard.
16. Video duration/file accessibility, README clean setup, disclosure inventory, secrets scan and all submission links pass.

Only mark these passed after running named checks. Record build/commit and known limitations in the evidence ledger. No application checks have run yet.

## 11. Four-minute demo and Round 2 defense

- **0:00–0:25:** repeated excavation problem, two departments, one synthetic road; show public URL and demo label.
- **0:25–0:55:** resident sees purpose, responsibility, dates, delay reason and freshness.
- **0:55–1:35:** officer enters second work; real detector shows shared metres, date overlap, and a separate repeat-excavation review example.
- **1:35–2:40:** propose reschedule, show one approval insufficient, second department approves, transaction applies; reload proves persistence.
- **2:40–3:15:** public view shows revised dates and reason; resident reports delay, officer responds with tracking history.
- **3:15–3:45:** show a direct unauthorized or stale API update rejected; name tests actually run.
- **3:45–4:00:** deployment, honest limitations, future institutional onboarding—not promised integrations or savings.

Use real screen recording, not a staged animation as a substitute for functioning software. Record only implemented behavior. Round 2 answers to rehearse:

- **How do you get data?** Manual department entry/import, not a fake live feed; data freshness and adoption are unresolved real-world constraints.
- **Is this new?** Coordination tools exist; our entry demonstrates explainable re-dig review plus revision-safe bilateral decisions and public follow-up. No first-ever claim.
- **What if plans are wrong?** Submitted-plan labels, freshness, declared uncertainty and resident reports; no claimed ground truth.
- **Can one officer force a plan?** Not in the MVP; exact-version acknowledgements from both departments, transactional update.
- **Does detection prove waste?** No. It identifies review candidates; emergency repairs/necessary follow-ups can be legitimate.
- **What scales?** A bounded fixture is tested; corridor grouping/indexes and institutional auth are future work unless actually implemented/benchmarked.

## 12. Next decision, not premature coding

Approve **CivicTech / Corridor** and provide the strongest team stack, teammate roles, and confirmed timezone/current start status. Then lock the architecture and delegate in-window implementation tasks. Until that point, this repository contains planning documentation only.
