# Judge-facing evidence plan

> **Latest scope:** [PLAN.md](../PLAN.md), [tech-stack.md](../tech-stack.md) and [TODO.md](../TODO.md) supersede conflicting behavior/stack assignments below. In particular: India-only mandatory foreground location, six languages, automatic typed Jev decisions, Convex, no news, five tourist destinations, and online-first operation. Earlier branding is historical.

This is a planning checklist. Application evidence is **pending** until implementation and verification occur within the permitted window. The standalone OpenCode Zen Jev 1.13 synthetic connectivity check passed on 2026-10-10; see [the progress note](progress/2026-10-10-technical-plan-and-migration.md). It does not establish app behavior or decision accuracy. The core behavior is in PLAN.md and its engineering design in TECHNICAL_IMPLEMENTATION_PLAN.md.

**Selected track: TravelTech / GudTour, Expo Android + iOS and web landing.** The final map-first role-based scope and controlling acceptance tests are in `winning-strategy.md`. Auth, incident persistence, authority maintenance, model gating and targeted notification behavior are now requested core features, not optional technical decoration.

## What the rubric means for our engineering choices

| Official criterion | Weight | Evidence to prepare | Weak substitute to avoid |
| --- | --- | --- | --- |
| Innovation | 20% | Specific user pain, explicit comparison to existing approaches, one distinctive working loop | “First ever,” adding AI without a reason, unsupported competitor gaps |
| Technical implementation | 35% | Server-enforced tourist/authority permissions, recent independent-report/model gate, radius boundaries, real notification receipts, versioned translations and offline withdrawal retention | Static map, role dropdown granting authority, model output treated as official truth, mocked push success |
| Feasibility | 20% | Input availability, uncertainty handling, realistic adoption path, known constraints and honest limitations | Pretending institutions have integrated or users already exist |
| Video | 15% | A real 2–5 minute walkthrough of the deployed core loop, clearly labeled fixtures | Mocked success, an architecture lecture, lengthy intro |
| Deployment | 10% | Clean standalone APK and accepted iOS artifact installation; public landing with verified access links | Expo Go/Metro requirement, inaccessible TestFlight upload, landing mistaken for a working web app |

The weights total 100%. Mandatory deliverables and disqualification rules still apply; a weighted score cannot compensate for violating them. Domain shortlisting is explicit, but competitor counts and shortlist quotas are unknown. Do not pick a track on an unsupported assumption that it is less crowded.

## Evidence ledger template

During the event, maintain a short table in the application repository:

| Claim | Check / evidence | Result | Build / commit | Limitation |
| --- | --- | --- | --- | --- |
| Public landing/access works | Fresh-browser visit and actual Android/iOS artifact access | Pending | Pending | Landing is not a full web crisis app |
| Domain algorithm handles boundaries | Named automated positive/negative/boundary tests | Pending | Pending | Input quality affects outputs |
| Access rules are server enforced | Direct API calls with denied roles/resources | Pending | Pending | Seeded identities are demo identities |
| Saved alerts/shelters persist | Download, restart offline, then reconnect | Pending | Pending | Cache is not proof of current authority state |
| Tourist report does not broadcast prematurely | Two users: submit unverified, inspect public map/inbox and notification jobs | Pending | Pending | Community confirmation is not authority provenance |
| Authority report auto-publishes | Approved role publishes; verify persisted incident/outbox and second-client update | Pending | Pending | Seeded agency is not government integration |
| Model gate uses real evidence | Inspect timestamped reports/weather/news, structured result and timeout/invalid path | Pending | Pending | Model and thresholds are not public-safety validated |
| Radius alerts and shelter selection work | Two recipient locations, boundary/stale cases, different closest eligible shelters | Pending | Pending | Last-known location and geodesic distance do not prove safety |
| Push works on devices | Android/iOS standalone receive/open alert, receipt and failure inspection | Pending | Pending | Provider acceptance does not guarantee human receipt |
| Multilingual meaning is retained | Reviewed original/translation tests for negation, names, numbers and evacuation deadlines | Pending | Pending | Entity matching alone is not semantic validation |
| Concurrent updates are safe | Two clients mutate one version | Pending | Pending | Document exact conflict semantics |
| Demo video meets requirement | Measure file duration and check repo playback/access | Pending | Pending | Link-only acceptance not assumed |

Never change “Pending” to “Passed” without running the named check. A screenshot alone does not prove a mutation persisted or authorization was enforced.

## Minimum common test categories

- Happy path from a clean seeded session through the entire selected workflow.
- Empty and malformed input, invalid date order, missing required fields, excessive payloads.
- Domain boundary positives and negatives, not just convenient seeded examples.
- Unauthorized mutation and cross-session/resource access through the API.
- Lost connection or unavailable backend produces an honest error and preserves unsaved user input when feasible.
- Refresh and a second browser show consistent persisted state.
- Keyboard use, clear focus, readable contrast, mobile-width primary workflow.
- No secrets in repository, client bundle, network responses, screenshots, or video.
- Public deployment + database behavior after redeploy/restart.
- README clean setup is reproducible; disclosure inventory matches dependencies/APIs actually used.

## Presentation discipline

Use a roughly four-minute video to leave duration margin. Show the problem briefly, complete the core loop, demonstrate one negative/edge case, then state limitations and deployment access. Prepare a separate Round 2 live-demo runbook; the organizer has not supplied Round 2 timing yet.

Distinguish four categories on screen and in narration: **implemented**, **simulated input**, **not implemented**, and **future work**. Simulation is not permission to fake functional behavior. The HealthTech brief explicitly permits simulated medical data; organizer acceptance of TravelTech fixtures/replay remains an open gate because the brief does not explicitly permit them. Do not claim a live feed from a replay or broaden HealthTech permission to this track.

For any quantitative impact, distinguish:

1. Fixture arithmetic (e.g. time since last successful briefing fetch).
2. Modeled scenarios with visible assumptions.
3. Measured real-world outcomes.

Only claim category 3 if actually measured. Do not translate a collision flag into rupees saved, tests avoided, or lives saved.
