# TravelTech plan review — independent, planning-only

**Reviewer:** independent subagent (own review). **Date:** 2026-10-09.
**Reviewed:** `winning-strategy.md` (controlling), `hackathon-brief.md`, `research/expo-ios-delivery.md`, plus reconciliation headers of `research/expo-platforms.md` and `research/traveltech-expo-mvp.md`, `README.md`, `agent-execution-policy.md`, `judging-evidence.md`.
**No app code, build, test or deployment exists; every acceptance item remains Pending.**
**Current platform decision under review:** Android + iOS apps, public web landing page. Superseded macOS / full-web scope is not re-litigated.

## Verdict: conditional GO (planning)
> **Orchestrator disposition after review:** User confirms active paid Apple account availability. Controlling strategy now explicitly defines judge access (internal TestFlight is QA only), canonical identity matching, merge-before-commit durable tombstones/pending refs, and successful-shorter-window/restart retention checks. Research test/demo badge wording corrected. These are documentation fixes, not executed tests; permission/access/source/timezone gates remain unresolved. Assessment below is retained as the review-time snapshot, not a second verification of subsequent edits.
The controlling plan is internally coherent, brief-aligned on honesty/anti-fabrication rules, and correctly reframed for iOS. It is ready to govern implementation **only after the conditions below**. The dominant residual risk is not engineering; it is unresolved *external access/permission* (iOS judge access; TravelTech fixture/real-time acceptance) plus a few *contract-level* gaps that must be frozen before the lifecycle is implemented.

## Verified current-state alignment
- Strategy §2/§4/§8/§9 now require Android + accepted iOS + landing, both built early, no Expo Go/Metro; §3 and §9 explicitly record the timezone as unconfirmed rather than silently asserting IST. Correct.
- Strategy §4 locks "two distinct languages" with an explicit English-source caveat; §5 makes one verified adapter a MUST if labeled replay is not accepted.
- Strategy §6.4 / §6 normative table define conservative cancel-chain suppression and "no implicit Update"; `traveltech-expo-mvp.md` lines 193/197/205–206 now match the controlling plan.
- `expo-ios-delivery.md` §1–§6 correctly separates ad hoc / TestFlight-internal / TestFlight-external / simulator / dev-client and requires CP0 clarification; consistent with brief §Evaluation Criteria 5.

## Remaining risks (prioritized)
**R1 (high, external) — iOS judge access unresolved.** `expo-ios-delivery.md` §2/§3: TestFlight **internal** reaches only App Store Connect team testers (≤100, email invite); judges are not team members, so internal TestFlight is **not** a judge-accessible artifact. Ad hoc needs the judging device UDID registered at build time (impractical for remote judges). The only judge-reachable paths are **external TestFlight (Beta App Review, no guaranteed duration)** or an organizer-accepted **simulator** artifact. Strategy §2 / §8 test 13 say TestFlight links must be tested by "intended testers" but do not require external-testing access. Action: confirm the accepted path at CP0; if external TestFlight, reserve Beta App Review slack or the Deployment (10%) / G4 gate is at risk.

**R2 (high, external) — Real-time conditional MUST has no verified source.** Strategy §5 makes a live adapter MUST if replay is not accepted; `traveltech-expo-mvp.md` §10 shows GDACS is coarse event-level, not street-local, and no accessible local feed is verified. If organizers reject replay and no suitable local source exists, the fallback adapter still cannot establish localized relevance. Action: settle organizer acceptance of labeled replay at T0; otherwise name the adapter and its coverage limit before T3.

**R3 (medium, contract) — All-or-nothing refresh vs tombstones is under-specified.** Strategy §6 architecture states "Persist cancellation history across refresh" and "atomic snapshot replacement," but does not state that retained **tombstones and unresolved pending references** are merged into the new snapshot before replacement. If a successful refresh replaces the snapshot with only the fetched window, a Cancel or pending Cancel outside that window can be lost, enabling resurrection and breaking §6 rows "Cancel-before-Alert" and "old Alert replay after Cancel." §8 test 11 covers only a **failed** refresh; no check covers tombstone retention across a **successful** refresh or app restart. Action: define tombstones/pending refs as durable snapshot state that is merged (not replaced) on refresh; add a named retention check.

**R4 (medium, contract) — Exact graph identity fields need canonicalization.** Strategy §6 defines the identity tuple `(sourceId, sender, identifier, sent)` and §6.2 requires references to carry "full source/sender/identifier/sent." Equality semantics are unspecified: `sent` format/offset normalization, sender/identifier case and whitespace, and how a reference lacking `sourceId` is scoped. Without one canonicalization rule, dedup, cross-source rejection, "same configured source/sender" mutation, and order-independence can disagree. Action: freeze a normalization/equality spec (trim, case, timezone-normalized instant) and reference-to-identity matching before implementing the §6 table.

**R5 (medium, external) — TravelTech fixture permission still unconfirmed.** The brief explicitly permits simulated data only for HealthTech; strategy §3 and `judging-evidence.md` line 51 still flag this. R2 and R5 are one organizer question; ask once, in writing.

**R6 (low, external) — Timezone/date format and Google Form timing remain unconfirmed** (strategy §3/§9; `compliance.md` §3.3/§6.2). Correctly treated as open, but T0–T24.5 stays a relative anchor until answered.

**R7 (low, doc hygiene) — Residual stale lines in `traveltech-expo-mvp.md`.** §11 test 5 (line 303) still says cancel-unknown is "logged as orphan," contradicting the corrected line 197 "retain pending"; §11 tests 20–21 and the demo script (line 370) still reference a user-facing "preserved" badge though the reconciliation note and line 254 make integrity checks internal-only. The reconciliation note controls, but stale lines should be marked/removed to avoid mis-delegation.

## Conditions for "GO" on implementation
1. CP0 written answers: accepted iOS artifact/access path; TravelTech fixture/replay acceptance (else adapter MUST); mobile + landing acceptance; timezone/date format.
2. Freeze the lifecycle identity/canonicalization spec (R4) and the refresh-retains-tombstones contract (R3) before domain implementation starts.
3. Confirm a paid Apple Developer account with Account Holder/Admin role, or record organizer acceptance of a simulator artifact; never label internal TestFlight as judge access (R1).
4. Keep every strategy §8 acceptance item and every `judging-evidence.md` row Pending until a named check runs; this review claims no implementation or test result.

## Specific verification answers
- **iOS intended-tester access vs team-only TestFlight:** not equivalent. Internal TestFlight excludes judges; use external TestFlight or an organizer-accepted simulator/ad hoc path.
- **All-or-nothing refresh retaining tombstones:** intent is stated, mechanism and test are missing. Merge durable tombstones + pending refs into the replacement snapshot and test retention across a successful refresh.
- **Exact graph identity fields:** tuple is `(sourceId, sender, identifier, sent)` with full reference parity; canonicalization/equality rules are missing and required.
