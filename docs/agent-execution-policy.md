# Bits and Bytes — strict execution policy

## Known team decisions

- Team reports **3–4 active builders**; individual roles remain unspecified.
- Team chose **TravelTech**. Latest user platform decision: **“android+ios, web landing”**, using **Expo** for the apps. This supersedes the initial Android/macOS request. The team's rationale is that HealthTech feels generic and CivicTech insufficiently practical; these are preferences, not verified market facts.
- Native macOS and a full web crisis app are not assigned. Verify iOS distribution/signing early; the public web surface is a landing page, not substitute app functionality.
- User reports an **active paid Apple Developer account**. Verify authorized roles/access; no purchase or unapproved account changes, and no credentials in documents.
- Team reports organizer confirmation that AI agents are allowed. Exact wording, permitted pre-event activity, and timezone have not been supplied; retain the confirmation for eligibility questions.
- This initial deliverable is documentation and strategy, not application implementation.
- Final user scope is preserved in `product-requirements.md`: map-first tourist/authority login, reporting, time-sensitive multi-source/model escalation, targeted multilingual notifications, location permissions and maintained shelters/contacts. This supersedes the old Waypoint briefing-only/no-login scope. Working brand: **Tovrilo**; availability is not proven.
- Follow `winning-strategy.md` and `ui-ux-direction.md` for current implementation contracts. Earlier research cannot silently remove required final features.
- A win is the goal, not a guaranteed outcome. Organizer rubric and actual working evidence govern prioritization.

## Delegation already commissioned

Model: `opencode/deepseek-v4.1-flash` (resolved through the available-model catalog).

| Stream | Exclusive output | Purpose |
| --- | --- | --- |
| HealthTech | `research/healthtech.md` | Track-specific MVP, differentiation, privacy, demo, and failure modes |
| TravelTech | `research/traveltech.md` | Track-specific MVP, authority/provenance, multilingual and stale-data safety |
| CivicTech | `research/civictech.md` | Track-specific MVP, coordination engine, citizen transparency, evidence |
| Compliance | `research/compliance.md` | Rules, ambiguous permissions, delivery gates, judging risks |
| Expo feasibility | `research/expo-platforms.md` | Primary-source platform/build constraints and distribution options |
| TravelTech MVP | `research/traveltech-expo-mvp.md` | Bounded Expo crisis-communication architecture and safety tests |
| iOS release | `research/expo-ios-delivery.md` | Current signed-device/TestFlight vs simulator gates |

These are independent inputs. The orchestrator reviews the files, reconciles conflicts against the supplied brief, chooses the recommendation, and owns the integrated plan. Agent confidence is not evidence.

## Implementation contract for later work

Do not start application implementation until the development window is confirmed to be open and the team accepts scope. Do not silently convert planning into pre-event development. Do not publish, purchase services, create external repositories, or change account settings without authorization.

Each implementation task must specify:

1. Objective and user-visible acceptance test.
2. Exclusive files/modules and shared interfaces agreed in advance.
3. Inputs, output schema, authentication boundary, and error semantics.
4. Explicit non-goals and timebox.
5. Tests to run and evidence to return.
6. Known limitations, dependency disclosures, and integration instructions.

Use parallel work for independent modules, not concurrent edits to shared files. One integration owner controls migrations, dependencies, environment configuration, and final merges. Never overwrite unowned changes. No recursive agent delegation unless the orchestrator approves a concrete need.

## Evidence standard

- “Implemented” means the user can exercise the real workflow, not just view a mock screen.
- “Verified” means a named check actually ran and its result is recorded.
- Simulated inputs must be labeled; processing and persistence must still be real.
- Do not claim live government/hospital integrations, validated clinical decisions, safe emergency routes, proven cost savings, or first-in-market novelty without evidence.
- An unavailable service must produce an honest degraded state, not fabricated success.
- Keep credentials and sensitive data out of docs, prompts, recordings, logs, and source.
- External API dependencies must have a documented fallback or an explicit impact on the demo.

## Four-person responsibility model

Names and assignments are provisional until the team's stack is known.

- **Integration/backend owner:** schema, authorization, domain logic, deployment secrets, migrations.
- **Native UI owner:** map-first tourist onboarding/reporting/alerts, accessible native states and role-aware navigation.
- **Evidence/decision owner:** recent independent reports, weather/news/model adapters, version-bound translations and notification worker contracts.
- **Authority/QA/release owner:** publishing/review and shelter/contact surfaces, independent abuse/edge-case checks, builds, landing, README, dependency disclosure and real demo.

With three builders, the second workflow/data owner also handles QA preparation, and all builders contribute test cases. The team leader alone performs the official submission. Assign an explicit backup communication channel, but do not violate the leader-only submission rule.

## Daily operating discipline during the event

- Small integration checkpoints, not four isolated projects merged at the end.
- Deploy a minimal usable slice early; keep the last good deployment available.
- At each checkpoint: what works, evidence, blocker, next bounded task, and cut decision.
- Prefer a reliable core loop over decorative complexity or unnecessary AI.
- Final acceptance is against the organizer rules and the selected MVP's tests, not against an agent's completion message.
