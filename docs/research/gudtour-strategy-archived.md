# Archived TravelTech — GudTour: crisis instructions tourists can trace

> **Superseded by the final user specification:** this briefing-first/no-login plan is historical, not an implementation assignment. Current requirements include authenticated tourist/authority roles, a map-first home, incident evidence/model escalation, radius alerts and maintained shelters. See [final requirements](../product-requirements.md) and [current plan](../winning-strategy.md). Statements below claiming controlling status are historical, not current authority.

**Historical status:** former controlling planning document; no app code, build, deployment, tests or video completed. Team: 3–4 builders. Requested stack: Expo. **Latest platform decision at writing: Android + iOS apps, web landing page.** This replaces the earlier macOS request. DeepSeek V4.1 Flash supplies bounded research; the orchestrator owns scope, integration and verification. The [organizer brief](../hackathon-brief.md) controls requirements.

## 1. Fixed decision and winning thesis

The team selected **TravelTech**, considering HealthTech too generic and CivicTech insufficiently practical for this event. Respect that decision; these preferences are not claims that those markets lack viable solutions. The earlier CivicTech recommendation is archived and is no longer an assignment.

**Working title:** GudTour (name not checked for trademark availability).

**Pitch:** *When weather warnings become rumor, find instructions for your area, read them in your language, inspect their source, and carry the last downloaded briefing through a connection loss—with its age always visible.*

The distinctive loop is **area relevance → original bulletin → version-linked translation → saved briefing → update/cancellation on reconnect**. Not another itinerary app, weather forecast, emergency chatbot, or invented “AI trust score.” Standards already support multilingual, geographic and lifecycle alerts; our proposed distinction is the tourist-facing implementation of that complete loop, not an invention of the underlying standard or a first-ever claim.

Treat this as a communication aid, not an emergency authority. Do not infer which streets are flooded, declare an area safe, route people through a disaster, or claim rescue dispatch. The software can relay supplied authority statements; it cannot establish their ground truth.

## 2. Fixed platform scope: Android + iOS, web landing

The user clarified **“android+ios, web landing”**. Both app targets use one Expo/React Native codebase and the same briefing flow. **No native macOS app, desktop wrapper or full web crisis app is assigned.** The web deliverable is a small public landing page, not a substitute for the mobile app.

| Deliverable | Acceptance / decision gate |
| --- | --- |
| Android | Standalone preview/release APK with bundled JavaScript; clean install and core loop without Expo Go/Metro |
| iOS | Signed installable/TestFlight path when account/provisioning/access are available; otherwise a standalone tested iOS Simulator build only if organizers accept it as their testable artifact |
| Public web landing | Problem/pitch, actual screenshots, data/translation limitations, installation/setup instructions, actual Android/iOS links and repo/video links once published; mobile-responsive HTTPS page |

Start **both platform builds early**. A simulator `.app` is not an installable iPhone `.ipa`; TestFlight upload is not proof judges can access the build. Precise account, signing, device-registration and review constraints are tracked in [iOS delivery research](expo-ios-delivery.md). Verify the selected iOS path before promising a release. Expo Go and development-client builds requiring Metro are not standalone submission artifacts.

The brief describes web development but permits testable mobile formats. Confirm that **mobile apps plus a landing page** are accepted; a landing page alone is not a functioning web solution to the crisis problem. If organizers require a full public web app, resolve that scope conflict with the user rather than silently expanding. External account/build/deployment actions remain authorization-gated.

**User-confirmed prerequisite:** active paid Apple Developer account available (not independently inspected). Verify authorized roles and judge access. Ad hoc works only for registered tester UDIDs; external TestFlight requires Beta App Review. Internal TestFlight is team-only QA, not general judge access. Do not grant judges account roles to bypass review. Start the selected distribution path early; retain an organizer-accepted simulator fallback, with no guaranteed approval time.

## 3. Compliance and open confirmations

- Development window: Oct 9 2026 20:30 to Oct 10 20:30; submission strictly before Oct 10 21:00. Timezone unstated—confirm it, do not silently assert IST.
- Team reports organizer permission for AI agents; retain exact confirmation. Planning does not authorize pre-window app code. Start implementation only after the window and agreed scope are confirmed.
- GitHub repository, README (problem/solution/setup), API/library disclosure and a real **2–5 minute video added to the repository**. Team leader alone submits through the supplied form. Link-only video acceptance is not assumed.
- Confirm TravelTech fixture/replay use: only HealthTech explicitly permits simulated data. This is an ambiguity, not a statement that TravelTech simulation is forbidden.
- Confirm mobile-first Android+iOS plus landing-page submission, and exact accepted iOS artifact/access path. Native macOS is no longer in scope.
- Do not provision accounts, purchase services, publish repositories or deploy without authorization. Keep tokens server-side.
- A working replay is valid functional evidence only if clearly described as replay; never call simulated bulletins live government alerts.

## 4. MVP: one destination, two languages, one complete loop

Destination scope: one tourist area and three named subareas, selected once usable sources are known. Language scope: **two distinct languages**: local source language plus English tourist instructions. If the source is already English, select a second tourist language with a competent reviewer; identical English views are not multilingual. Lock the destination, pair and reviewer before translation assignments. Another language is a stretch goal.

### MUST

1. Select a destination/subarea manually; no login or location permission required. Display the bulletin's declared area and the reason it matches. Coarse city coverage must stay coarse.
2. List bulletins with source attribution, issued time, effective/expiry times, area, severity as supplied, status and data mode. Never display “all clear” because the list is empty.
3. Detail screen with original instructions, original-source link/reference and translated instructions side by side or one tap apart. Translation provenance and version visible.
4. Separate exercise fixtures, configured-source bulletins and unverified reports. No uploader can promote a report to a government bulletin. No statistical credibility score.
5. Deterministic Alert/Update/Cancel replay using exact predecessor references; history remains inspectable. Cancelled, superseded and expired instructions are not current action cards.
6. Persist the downloaded briefing locally; reopen it offline after app restart. Show offline state, last successful fetch and explicit inability to check newer updates/cancellations.
7. Reconnect and refresh atomically; update/cancel replay reaches the client, invalidates obsolete translations, and leaves the previous complete cache intact if refresh fails.
8. Standalone Android and accepted iOS artifacts tested independently; public landing page with honest access links. Readable, accessible screens and honest empty/error states.

### SHOULD, only after the loop passes

- A read-only adapter to one approved publicly accessible source, with documented license, coverage, retrieval timestamp and error handling.
- Small static area diagram using local assets. If a map is used, hazard shapes must come from source data, not model invention; label approximate/replay shapes.
- Local reading acknowledgment attached to a bulletin version. This records the user's tap, not comprehension or authority receipt.
- A second tourist language with independent human review.

### CUT first

Push notifications, background polling, GPS tracking, social posting/moderation, crowdsourced credibility voting, emergency chatbot, generalized scraping, OCR ingestion, dynamic rescue/shelter routing, voice/TTS, offline map tiles, full CAP XML compliance, cryptographic signing, native desktop packaging without proven tooling. Do not sacrifice offline text, provenance or cancellation correctness for a map.

## 5. Data and translation strategy

### Honest two-mode source plan

**Replay mode (baseline):** labeled Exercise/Test bulletins created for the chosen scenario; actual ingestion/validation/filtering/cache/lifecycle logic runs. Source references must say “team exercise fixture,” not impersonate a real agency. A source publisher is a protected local replay runner or protected server operation—not a publicly writable authority console.

**Source mode (conditional):** at most one read-only adapter. Before adoption, verify endpoint access, permission/license, stable fields, relevant geography, source identity and update behavior. The absence of a live hazard is normal; historical examples must show their real age and archival mode. No guaranteed live-local feed has been verified at this planning stage.

**Real-time feasibility gate:** Replay demonstrates delivery mechanics, not actual current local conditions. Obtain organizer confirmation that the labeled exercise meets the TravelTech statement. **Without that confirmation, one verified read-only source adapter becomes MUST**; do not present replay-only as meeting real-time availability. If no suitable accessible local source exists, escalate the unmet requirement and cut optional features rather than substitute coarse global events as street-level evidence. An adapter alone does not guarantee complete warning coverage.

For meaningful-data credit, import one permitted public archival bulletin into a separate labeled example and record URL, publication time, retrieval time, license and transformation. Do not present a historical bulletin as active or imply it supplies real-time street flood extent. CAP is a format, not a data subscription; a global disaster feed is not street-level flood telemetry.

**Provenance badges:** `Exercise fixture`, `Retrieved from configured source`, `Unverified report`, plus lifecycle/freshness labels. “Configured source” means the application fetched an approved endpoint; it does not mean independent cryptographic verification or validated ground truth. A hash identifies bytes for version binding; it does not prove official authorship. Missing attribution/invalid input is quarantined, not upgraded to trusted.

Unverified example reports may be bundled read-only for the comparison demo; building a public report-posting system is out of scope. Never generate emergency instructions from those reports.

### Translation rules

Prefer a source-provided English version where present. Otherwise use human-reviewed translations for the bounded fixture set. Credit the translator/reviewer and label it team-reviewed, not authority-approved. An optional online machine translation must be clearly marked unreviewed, original always accessible, and cannot fabricate missing instructions.

Cache translations by `(bulletin identity, content version/hash, source language, target language)`. On update, old translation is history only; until the new translation exists show the current original with “translation unavailable.” Preserve places, phone numbers, times, units and negation during review. Automated entity checks are regression guards, **not proof of semantic accuracy**. Record at least one negative test involving a flipped “do not.”

API timeout, quota failure or missing language → explicit translation unavailable; never invent success or silently display the predecessor's translated instruction. No language model used to decide hazard truth or emergency action.

## 6. Portable contract and deterministic semantics

Use TypeScript pure functions for filtering and lifecycle, shared by all approved clients. This is a **CAP-inspired normalized subset**, not a claim to implement or validate all CAP 1.2 XML.

### Core records

- `Source`: stable ID, attribution, approved origin/reference, mode, coverage note.
- `Bulletin`: unique composite `(sourceId, sender, identifier, sent)`; type `Alert | Update | Cancel`; status `Actual | Exercise | Test`; public scope only; exact predecessor references; area IDs and original area text; source language, original instruction/body; issued/effective/expiry instants with offsets; supplied severity; content hash/version; fetch time and source reference.
- `Translation`: exact bulletin key/hash, language, text, origin `source | team-reviewed | machine-unreviewed`, reviewer metadata when applicable.
- `BriefingSnapshot`: schema version, complete bulletins/lifecycle references/translations, selected area, last successful fetch, mode. Acknowledgments, if included, are local and version-specific.

**Identity normalization:** `sourceId` is an exact configured adapter key assigned by the adapter, not trusted from payload. Preserve sender/identifier case and nonempty text; reject surrounding whitespace/control characters rather than guessing aliases. Require explicit-offset ISO `sent`; normalize to UTC milliseconds, reject invalid dates/unsupported precision, preserve raw timestamps for display. References follow the same rules. A sourceId absent from a CAP-like reference inherits the ingest adapter's sourceId, never global lookup. Reject explicit cross-source references and unauthorized sender changes. Same canonical identity with a different content hash is quarantined, not overwritten.

Missing geographic detail stays unknown; never enrich with invented polygons. Require valid identity/times/references and bounded payloads. Preserve source-specific meaning; reject unsupported status/scope into an explanatory non-actionable state. No authenticated travelers or private data are needed for this MVP.

### Lifecycle contract

1. Validate and deduplicate exact message identities. Duplicate bytes are idempotent. Same identity with different content is quarantined as conflicting input, not overwritten.
2. References include full source/sender/identifier/sent identity. Allow mutation of a predecessor only within the same configured source/sender; reject missing, self, cyclic or invalid references from action display and show diagnostics. Store unresolved references pending another refresh; do not show their instructions as active.
3. Update explicitly supersedes referenced predecessors; Cancel explicitly cancels them. Keep complete history and persisted tombstones so replaying an old Alert cannot resurrect it. A later genuinely new Alert is a separate message, not automatically a reactivation.
4. **Cancel safety precedence:** valid resolved cancellation is retained and prominently displayed, never discarded as an ordinary competing successor. For this conservative MVP, Cancel referencing any node in a known linked update chain suppresses current action instructions for that entire chain, including competing update branches; show “cancellation received—consult source,” not “hazard ended.” This chain-suppression is an application safety policy, not claimed CAP semantics. Multiple competing **Updates without Cancel** produce visible unresolved conflict and no current instruction recommendation. Independent Alerts may coexist; never merge conflicting instructions into generated advice.
5. Base temporal eligibility is `effective <= now < expires`. If effective absent, use sent. If expiry absent, show “expiry not supplied / current validity unknown” and do not claim it is currently active. Reject expiry earlier than effective. “Expired” means bulletin validity ended, not hazard ended.
6. A selected area's exact declared membership is a match. A city-level bulletin matches the relevant city with an explicit coarse-coverage explanation; unknown area is discoverable but marked “local applicability unknown.” No inferred street safety. Within current matched bulletins sort supplied severity, then sent descending, then identity for stability; unknown severity stays unknown.
7. Evaluate both cached and online data using the same injected-clock function. Online refresh policy: user refresh and foreground checks; optional foreground 60-second polling only after baseline works. No background-delivery guarantee. Show “last fetched” even online; a failed fetch never advances it.
8. Offline age warning: demo policy of 15 minutes since last successful fetch, clearly labeled an application policy, not an authority freshness standard. Before and after that threshold cached data is still not guaranteed current. Expiry is re-evaluated offline; cancellation can only be learned once retrieved. If clock rollback/inconsistency is detected, label validity unknown.

Never show cached shelters or zones as guaranteed safe. Any relayed safe-zone declaration is versioned, attributed and time-bounded with offline uncertainty; shelter status/routing is not baseline scope.

### Normative resolution table (replaces exploratory sequential tables)

Compute from the retained validated message set, not arrival order; render lifecycle before temporal/freshness labels. No grouping solely by hazard name/event ID and no implicit Update from another Alert.

| Input / graph state | Required result |
| --- | --- |
| New unique Alert, no exact update/cancel links | Independent chain; evaluate effective/expiry and area |
| Exact duplicate | No new record or transition |
| Valid Update references predecessor | Link/supersede predecessor; current successor original/translation only |
| Unresolved Update/Cancel reference | Persist pending, visibly non-actionable; re-resolve when predecessor arrives |
| Resolved Cancel references any known chain node | Preserve cancellation; suppress chain action instructions irrespective of competing Updates |
| Multiple Update successors, no Cancel | Conflict visible, no current action instructions |
| Cancel-before-Alert or old Alert replay after Cancel | Same final suppression as in-order input; no resurrection |
| Expired/future/missing-expiry leaf | Expired/scheduled/validity-unknown; no current-validity claim |

Recompute graph to a fixed point after successful ingest. Invalid/cross-source/cyclic inputs are quarantined. Tests permute Alert/Update/Cancel, include Cancel vs competing Updates and cancellation of an older chain node. Cancellation stays visible even when its predecessor expires; expiration never converts it into an all-clear.

### Minimal architecture

Expo + React Native + TypeScript; navigation chosen once by the integration owner. One persistence interface using a storage library verified on **both Android and iOS**. Landing page is a separate minimal static surface, not an offline web app. Feed can be static hosted exercise snapshots with a protected replay writer; add one small server only when required for source proxying or secret API keys. Do not ship service credentials to clients. Static read-only demo data needs no elaborate database or role system.

Refresh is all-or-nothing: download → size/schema validation → **merge retained history, cancellation tombstones and pending references** with new validated messages → reference validation/lifecycle calculation → atomic snapshot replacement including all durable records. A successful shorter feed window does not delete previously seen records. Deduplicate canonical identities; quarantine identity/hash conflicts. For this bounded demo do not garbage-collect history; future retention requires an explicit anti-resurrection policy. Invalid/partial refresh does not delete the last complete cache or advance last-successful-fetch. Version schema migrations; invalid stored data produces a recoverable “no valid saved briefing” state, not invented content.

## 7. Strict build assignments

All implementation is later and time-window gated. Model for delegated work remains `opencode/deepseek-v4.1-flash`. Every task has exclusive files, an agreed contract, timebox and named tests. The orchestrator reviews evidence, integrates and decides cuts; no recursive vague delegation.

| Builder | Exclusive scope | Acceptance evidence |
| --- | --- | --- |
| A — integration/release | Dependency/toolchain choices, adapters, source endpoint/replay delivery, builds/config, approved deployment | Clean Android install, accepted iOS launch, endpoint errors, secret scan |
| B — domain/data | Normalization, lifecycle, relevance, fixtures, translation-version contract | Deterministic unit tests incl. order independence and cancellation |
| C — app/UI/offline | Screens, persistence adapter, snapshot refresh, offline/error accessibility | Restart offline, reconnect invalidation, empty/missing-language states |
| D — QA/demo/landing | Independent safety/edge checks, reviewed translations, minimal landing, README/disclosures, recording/submission rehearsal | Evidence ledger, real 2–5min video, both-platform smoke tests and landing-link checks |

Three builders: B owns fixture translations/docs preparation; C supplies UI test recordings and minimal landing; A owns release integration. Everyone reserves final testing time. Agree interface files first; one owner merges shared files, lockfile and configuration. No external publication without authorization.

## 8. Acceptance tests: pending, not passed

1. Manual area selection works without GPS permission; unknown/coarse areas do not imply a local all-clear.
2. Exact area match/nonmatch, city-level match and unknown-area state have deterministic explanations.
3. Invalid identities/times/scope, oversize payloads and unsafe links are rejected/quarantined. Render content as text, never executable HTML; allow only approved HTTP(S) source links, no automatic dialing.
4. Duplicate ingestion is idempotent; altered bytes under the same identity are quarantined.
5. Alert → Update → Cancel removes obsolete action cards and preserves history. Expiry boundary at `now == expires` is non-active; future effective time and missing expiry are correct.
6. All permutations of the bounded message set yield the same final state; Cancel before its target remains pending then prevents resurrection. Test unknown/cross-source references, cycles, competing Updates, **Cancel vs competing Updates and Cancel of an older chain node**; cancellation stays visible and suppresses action instructions.
7. Current translation matches current hash; predecessor translation cannot leak after update. Unsupported language/API failure shows original and honest fallback.
8. Human review catches changed negation and checks times, phone numbers, places and units; entity tests alone are not semantic validation.
9. Save briefing, kill/reopen app with networking disabled, recover original + reviewed translation and last-fetch metadata. Fresh install offline shows no saved briefing, not success.
10. Freshness threshold 14:59/15:00, expiry while offline and clock rollback produce specified warnings without “safe” claims. Airplane mode does not deliver new cancellations.
11. Reconnect fetches cancellation and invalidates old translation. Failed/partial refresh keeps prior complete snapshot and does not advance last successful fetch.
    Also test **successful shorter-window refresh** omitting a previously seen Cancel/pending Cancel: durable records survive refresh and app restart, and target replay never resurrects instructions. Same-identity/different-hash input is quarantined.
12. Exercise, configured-source and unverified inputs are visibly distinct in list, detail and cache; arbitrary public input cannot impersonate an authority.
13. Standalone APK and accepted iOS artifact launch without Expo Go/development server; restart, offline cache and lifecycle work on each. Device-only/Simulator-only limitations explicitly recorded. TestFlight links are tested by intended testers, not just uploaded.
14. Readable contrast, screen-reader labels, text scaling and no color-only severity; keyboard/mobile-responsive landing with tested artifact links. No secrets/location history in bundle, repository or video.
15. README setup and release links tested by teammate; video measured 2–5min and accessible in repository; final submission fields rehearsed by leader.

## 9. 24-hour critical path and cut gates

`T0` is a relative planning anchor for Oct 9 20:30; timezone remains **unconfirmed** until organizers answer. Do not treat this as a verified absolute schedule. Before T0: documentation/decisions only; do not create app code or disguise implementation as preparation. This schedule alone controls; research schedules are superseded.

| Time | Deliverable / decision gate |
| --- | --- |
| T0–T1 | Confirm permissions, iOS distribution path, mobile+landing acceptance, source/replay permission, toolchain/accounts; freeze contract/fixture set; establish repository within window |
| T1–T3 | Minimal Expo app, first Android and iOS standalone builds initiated, source snapshot contract; flag signing/account/toolchain blockers immediately |
| T3–T6 | One area → source bulletin → original/translation end-to-end; first install test. No device artifact by T6: release/build failure takes priority over features |
| T6–T10 | Offline persisted restart + deterministic lifecycle on both platforms; minimal public landing if authorized |
| T10–T14 | Update/cancel/reconnect/version tests; source adapter only if stable permissions and fields verified, otherwise honest replay |
| T14–T18 | Independent negative tests/accessibility and all MUST gaps. Cut map, second translation/API, acknowledgments before touching safety core |
| T18–T20 | Android+iOS validation, landing-link checks, README/API inventory, disclosure/data citations, video rehearsal |
| T20–T22 | Record real 4-minute walkthrough, inspect playback, repository/release access; release candidate |
| T22–T23 | Independent smoke test, evidence ledger, leader submission rehearsal; no new features |
| T23–T24 | Internal freeze target; only essential verified fixes before development ends. Preserve last working artifact |
| T24–T24.5 | Submission buffer, not extra coding time. Leader submits well before hard deadline and retains receipt |

Neither mobile platform is quietly cut. By T6 require a clean Android launch and an accepted iOS build path with actual launch evidence; unresolved iOS distribution triggers an explicit user/organizer decision, not an “iOS supported” label. Account approval, cloud queues, signing and TestFlight access are schedule risks; no promised turnaround. Simulator fallback is valid only if accepted and tested.

## 10. Judge-facing story and evidence

| Criterion | Weight | What we demonstrate |
| --- | --- | --- |
| Innovation | 20% | Tourist-focused traceable instruction loop, version-bound translation and offline cancellation reconciliation—not unsupported novelty |
| Technical | 35% | Tested lifecycle/reference/relevance engine, atomic persistence, failure handling, installable app; no unnecessary database/AI complexity |
| Feasibility | 20% | One realistic destination, explicit source coverage/license, language review, permissionless manual selection and honest offline limits |
| Video | 15% | Actual artifact completes workflow, with visible exercise labels and one negative case |
| Deployment | 10% | Clean APK install, accepted iOS artifact/access and public landing; no requirement for judges to run Expo tooling |

### Four-minute demo

- **0:00–0:25:** Tourist sees fragmented warnings; state destination, source mode and actual supported platforms.
- **0:25–1:15:** Select area, inspect matching bulletin, original source, timestamps and supplied instructions. Show unverified example separated, not judged by AI.
- **1:15–2:00:** Switch to reviewed tourist-language text; show version/reviewer label and original. No claim translation guarantees safe action.
- **2:00–2:45:** Save, turn off connectivity, restart; read cached text and visible age/expiry/unknown-currentness.
- **2:45–3:35:** While disconnected advance labeled replay to Update/Cancel; reconnect. Show real refreshed lifecycle and obsolete translation removal. Not a push notification or actual government issue.
- **3:35–4:00:** Actual artifact/access, one tested failure, source/translation limitations and sensible next step.

Round 2: retain a known working version and offline briefing; prepare a separate live runbook once timing is known. Do not claim measured panic reduction, rescue savings or lives saved. Meaningful-data evidence is provenance/coverage/lifecycle handling and permitted archival examples, not unvalidated impact arithmetic.

## 11. Research hierarchy and verified anchor

Use [original TravelTech research](traveltech.md) as exploratory input, [Expo platform research](expo-platforms.md) for historical Android/macOS findings, [iOS delivery research](expo-ios-delivery.md) for release gates, and [bounded Expo MVP research](traveltech-expo-mvp.md) for alternatives. This paragraph describes the archived scope only, not the final map-first requirements.

The [independent plan review](traveltech-plan-review.md) identified judge-access, identity and refresh-retention gaps. Contracts above address identity/retention **in the archived plan, not with executed tests**. Apple account availability is user-confirmed; tester access, organizer replay/mobile+landing acceptance, source coverage and timezone remain open external gates.

**Verified primary source:** [OASIS CAP 1.2 standard](https://docs.oasis-open.org/emergency/cap/v1.2/CAP-v1.2-os.html), fetched 2026-10-09. It specifies geographic targeting, multiple language info blocks, effective/expiry fields and Alert/Update/Cancel references; expiry may be absent and consumers may set policy. These facts support the lifecycle design, not any claim that a feed is available, that our subset is fully conformant, or that a source is authentic. Our missing-expiry and conflict rules above are conservative application policies.
