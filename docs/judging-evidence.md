# Judge-facing evidence plan

This is a planning checklist, not a report that tests have run. All evidence is **pending** until application implementation and verification occur within the permitted window.

**Selected track: TravelTech / Waypoint, Expo.** The controlling test list is in `winning-strategy.md`; generic transaction/auth rows below apply only if those surfaces are actually built. A read-only briefing app need not manufacture a database or login to score technical points.

## What the rubric means for our engineering choices

| Official criterion | Weight | Evidence to prepare | Weak substitute to avoid |
| --- | --- | --- | --- |
| Innovation | 20% | Specific user pain, explicit comparison to existing approaches, one distinctive working loop | “First ever,” adding AI without a reason, unsupported competitor gaps |
| Technical implementation | 35% | Reference-safe alert lifecycle, relevance boundaries, atomic offline snapshots, version-linked translation, named edge-case tests | Attractive static UI, inflated complexity, invented authenticity or frontend-only protection of a publisher |
| Feasibility | 20% | Input availability, uncertainty handling, realistic adoption path, known constraints and honest limitations | Pretending institutions have integrated or users already exist |
| Video | 15% | A real 2–5 minute walkthrough of the deployed core loop, clearly labeled fixtures | Mocked success, an architecture lecture, lengthy intro |
| Deployment | 10% | Clean standalone APK and accepted iOS artifact installation; public landing with verified access links | Expo Go/Metro requirement, inaccessible TestFlight upload, landing mistaken for a working web app |

The weights total 100%. Mandatory deliverables and disqualification rules still apply; a weighted score cannot compensate for violating them. Domain shortlisting is explicit, but competitor counts and shortlist quotas are unknown. Do not pick a track on an unsupported assumption that it is less crowded.

## Evidence ledger template

During the event, maintain a short table in the application repository:

| Claim | Check / evidence | Result | Build / commit | Limitation |
| --- | --- | --- | --- | --- |
| Public app works | Logged-out fresh-browser walkthrough | Pending | Pending | Hosting availability not guaranteed |
| Domain algorithm handles boundaries | Named automated positive/negative/boundary tests | Pending | Pending | Input quality affects outputs |
| Access rules are server enforced | Direct API calls with denied roles/resources | Pending | Pending | Seeded identities are demo identities |
| Saved briefing persists | Download, restart offline, then reconnect | Pending | Pending | Cache is not proof of current authority state |
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

Distinguish four categories on screen and in narration: **implemented**, **simulated input**, **not implemented**, and **future work**. Simulation is not permission to fake functional behavior. The HealthTech brief explicitly permits simulated medical data; obtain organizer confirmation for the planned CivicTech/TravelTech fixture approach, which the brief does not explicitly address.

For any quantitative impact, distinguish:

1. Fixture arithmetic (e.g. time since last successful briefing fetch).
2. Modeled scenarios with visible assumptions.
3. Measured real-world outcomes.

Only claim category 3 if actually measured. Do not translate a collision flag into rupees saved, tests avoided, or lives saved.
