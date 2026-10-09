# Tovrilo — final TravelTech implementation plan

**Working name:** Tovrilo (*toh-VREE-loh*). **Tagline:** Local alerts. Your language.

**Status:** documentation only. No app, backend, model integration, notification, build or deployment is implemented or tested. Final scope comes from [the user's product requirements](product-requirements.md); organizer eligibility, deliverables and scoring come from [the unchanged organizer brief](hackathon-brief.md). This plan supersedes the old Waypoint briefing-first/no-login strategy.

## 1. Product promise and locked scope

A map-first Android/iOS app for tourists to understand nearby weather incidents, receive attributed multilingual alerts and find maintained shelters. Tourists onboard before travel. Authorities publish incidents and maintain shelter/contact information; community reports contribute time-sensitive evidence rather than instantly spreading rumors.

**Required final product:**

1. Separate tourist and authority login experiences with server-enforced permissions.
2. Tourist onboarding: preferred alert language, destination, live location permission and optional background updates.
3. Live map: hazard zones, shelters, freshness/source legend and bottom-center **Report incident** button.
4. Reporting screen with phenomenon buttons: flash flood, landslide, cyclone/severe wind, heavy rain and other weather incident.
5. Tourist reports start unverified; no public incident notification before confirmation.
6. Authorized authority reports are automatically authority-verified and escalated to targeted notifications.
7. Community escalation combines independent recent reports, current/recent weather and relevant news; a decision model returns `NOTIFIABLE_EMERGENCY` or an explicit non-positive result.
8. Default configurable radius by incident type; recipients selected using last reported location.
9. Per-user nearest eligible configured shelter and a shelter CTA, without a promise of safe routing.
10. Multilingual instructions preserving critical meaning; original notice and issuing authority remain accessible.
11. Authority shelter/contact maintenance, incident correction/withdrawal and visible updates.
12. Public web landing page with actual Android/iOS access instructions.

**Not requested:** native macOS, a full web crisis app, social feed, chatbot, autonomous rescue, custom turn-by-turn routing, fabricated street-level weather coverage or guaranteed safety. Do not silently drop a required feature to recreate the old smaller scope; any deadline cut needs an explicit team decision and disclosure.

## 2. Role and identity contract

Tourists can self-register, manage their own preferences/location, submit reports and read published incidents/shelters. They cannot edit verification, evidence decisions, issuer identity, official instructions or another user's data.

Authority login does **not** mean anyone can choose an authority role during signup. Authority accounts are provisioned/approved by an administrator, bound to an agency and jurisdiction, and authorized server-side. The prototype can use clearly labeled seeded demo agencies; it must not claim government accreditation. A revoked account cannot publish or mutate shelters.

Authorities can publish/update/withdraw their jurisdiction's incidents and maintain shelters and contacts. Privileged role assignments are separate from ordinary profile edits. Protect database reads/writes as well as API handlers; hiding controls is not authorization. Do not expose reporter identities, precise tourist locations or notification tokens to other tourists.

## 3. Incident state machine

Keep three separate dimensions:

| Dimension | Values | Meaning |
| --- | --- | --- |
| Provenance | `COMMUNITY`, `AUTHORITY_VERIFIED` | Who issued it; verified authority identity is not proof of physical ground truth |
| Confirmation | `UNVERIFIED`, `CONFIRMED`, `DISPUTED` | Evidence assessment, not official attribution |
| Lifecycle | `OPEN`, `UPDATED`, `WITHDRAWN`, `EXPIRED` | Whether this version remains actionable |

Notification eligibility is a separate versioned decision: `NOTIFIABLE_EMERGENCY`, `NOT_QUALIFIED`, `UNCERTAIN`, or `PENDING_REVIEW`. UI labels distinguish **Authority-issued** from **Community-confirmed**. Model confirmation never upgrades a community incident to an official one.

**Tourist path:** validated report → match/create incident → collect independent evidence → evaluate current evidence snapshot → confirmed + positive notification decision → radius targeting → localized notification + map update. Unverified reports are visible to their submitter and authorized reviewers, not portrayed as established hazards on the public map. Repeated reports alone cannot trigger notification.

**Authority path:** approved authority submits within its jurisdiction → server records authority provenance and confirmation → automatically creates notification decision/outbox entry for a valid publishable incident → radius targeting → localized notification + map update. This honors the requested automatic official-report path: weather/news/model failure must not silently veto an authorized official warning. Invalid payload, revoked role, missing geometry or expired version cannot publish.

Every transition records actor, incident/version, evidence snapshot or official source, timestamps and policy/model version. Use an audit trail, not an unsupported claim of tamper-proof storage. Correction/withdrawal preserves history, removes stale actionable presentation and notifies prior recipients as applicable; withdrawal does not mean “all clear.”

## 4. Evidence aggregation and decision model

- Cluster only compatible phenomenon reports within configured geographic/time windows; preserve each observation's event time and server receipt time. Never merge unrelated hazards merely because they share a place.
- Count distinct eligible reporters, not button taps or accounts asserted to be independent. Dedupe repeated submissions; apply abuse limits and document that multiple accounts can still defeat naive counting.
- Weight recency; old observations do not establish a current emergency. Future timestamps, implausible positions and unrelated areas are rejected or quarantined.
- Fetch current **and recent** weather with source, geographic resolution, observation time and fetch time. Weather supports context, not proof. Sunny local skies cannot rule out upstream flooding, storm surge, reservoir release or landslides after earlier rain.
- Collect relevant timestamped news from a documented source/search adapter. Validate place/event relevance and deduplicate syndicated copies. News is untrusted input, not an instruction to the model. Lack of news is not evidence that nothing happened.
- Missing feeds remain `unavailable`, never invented sunshine/no-news evidence. Conflicting evidence is surfaced.

**“Jev” is an unresolved provider reference, not an implemented integration.** Use a provider-independent adapter; select and verify the actual model/API, access, latency, cost and data terms before implementation.

Model input: incident version, distinct recent-report evidence, source/time-stamped weather/news, known missing inputs and policy limits. Exclude unnecessary personal data. Output must be structured: decision enum, evidence references, rationale, uncertainty, model/version and evaluated time. The model cannot invent instructions, sources or hazard geometry.

The model makes the proposed qualification decision for the community path; deterministic server gates check evidence sufficiency, geography, recency, output schema and unchanged incident version before accepting it. A positive model output alone is not authority verification. Thresholds/windows/radii are explicit **prototype policy settings**, not scientifically validated predictions. Uncertain or invalid results go to authority review, not automatic broadcast.

Timeout, malformed response, stale evaluation or service failure → `UNCERTAIN`/retry/review, no community broadcast and no all-clear. Re-evaluate on new evidence. Record the actual input/output so decisions can be explained; identical evidence need not produce identical stochastic model output. This is a bounded prototype, not a production-certified autonomous emergency adjudicator.

## 5. Notifications and last-known location

1. Configure a default effect radius per phenomenon, with units and policy version. Authorized authorities may supply more accurate geometry/radius within validated limits. Circles are approximate notification zones, not flood extents.
2. Evaluate geodesic distance on the server against each opted-in user's last reported position, timestamp and accuracy. Test equality at the radius boundary explicitly.
3. Store the selected location/evidence version with the targeting decision; do not describe a stale location as current. Proposed demo freshness limit: 15 minutes, clearly application policy. Unknown/stale locations get a separate uncertain-location fallback: alert opted-in users subscribed to the affected destination, labeled as destination-based rather than precise nearby targeting. Do not silently exclude them or assert their current position.
4. Create durable notification jobs in the same transaction as accepted publication. Idempotency key: incident version + recipient + notification kind. Worker retries delivery and processes receipts; token failure is not successful delivery.
5. Expo push/APNs/FCM is best-effort. Permission denied, offline devices and OS restrictions can prevent delivery. The in-app alert inbox and foreground refresh remain available; do not promise everyone was notified because a provider accepted a request.
6. Updates/withdrawals reference previous versions; avoid re-broadcasting unchanged evidence. Reconnecting clients retain withdrawals and do not resurrect a hazard from an older snapshot.

Push payloads should contain minimal private data and a versioned incident link. Do not put precise tourist coordinates on lock screens. Account/language/token changes and signout must update recipient associations safely.

## 6. Shelters and emergency contacts

Authorities maintain shelter name, coordinates, jurisdiction, source, open/closed/unknown status, last-confirmed time, contact and optional accessibility/capacity information. Unknown capacity stays unknown. Only open, sufficiently current shelters outside known active hazard zones qualify for a suggested destination; this filtering is not proof of route or shelter safety.

For each recipient select the nearest eligible configured shelter by geodesic distance from their last reported location. Show **“Closest listed shelter — route safety not verified”**, position age, shelter status age, source and contact. If none qualifies, show “No current eligible shelter listed” and authority contact rather than inventing a safe zone.

CTA: **View shelter** → shelter details, call contact, optional external map directions. Preserve official instructions if an authority directs people elsewhere. External navigation does not inherit our hazard exclusions. Do not say “safest route,” and do not imply that Google Maps consumes these incident reports. Offline phone/map actions require the relevant device services; explain unavailable actions.

## 7. Meaning-preserving multilingual communication

Onboarding stores a preferred language; settings can change it later. Architecture supports a configured language catalog. Demonstrate at least two distinct languages end-to-end; wider language coverage is not “complete” until each advertised language has working alerts and tested critical text.

For official notices preserve: place names, issuer, severity, dates/times/timezone, numbers/units, evacuation orders, negation and prohibited actions. Store immutable original instruction text plus version/hash. Translation key binds incident version + original hash + source/target language; corrected originals invalidate previous translations.

Show original beside/below translated instructions in detail, issuing authority, source time and translation origin (`human-reviewed` or `machine-unreviewed`). Entity checks detect missing numbers/names but cannot prove semantic preservation. Human-reviewed emergency templates and test cases cover the demonstrated languages; do not advertise machine output as certified accurate.

If a critical translation is missing, fails validation or is unreviewed, retain the original and a clear fallback notice. Do not silently substitute older translated instructions. A localized notification can use a reviewed generic warning template linking to original details while specific instructions await review. The decision model does not generate rescue advice.

## 8. Location, offline behavior and privacy

Onboard before arrival with destination subscription and language; current GPS might be the user's home, so it does not replace destination planning. Request foreground location with a clear explanation, then background access separately when justified. Denial/restriction must leave manual destination selection and alerts readable.

Background location is conditional on permission, native configuration and OS behavior; continuous operation after force-quit cannot be guaranteed. Implement and verify in standalone builds, not merely Expo Go. Recheck on foreground; show location age/accuracy. Minimize update frequency and retention, allow pause/revocation/deletion, and keep precise location server-private.

Persist a real local snapshot of published incidents, withdrawals, reviewed instructions, shelters and fetch metadata. On restart offline show saved data with “Cannot check for newer incidents, changes or withdrawals.” Recompute expiry; missing validity is unknown. Failed refresh preserves cache/last-success time; successful refresh merges withdrawals/history atomically rather than trusting a truncated live window. Basemap tiles are not automatically offline-capable; provide a readable saved list if the map is unavailable. Offline report drafts remain unsent until an acknowledged upload; never show a draft as submitted.

## 9. Architecture and implementation boundaries

**Proposed stack, not installed:** Expo Router + TypeScript apps; SDK-compatible native map/location/notifications; TanStack Query for remote state; SecureStore for auth; local persistent cache for offline data. Public informational landing hosted separately. Pin the SDK before selecting `@expo/ui` APIs or native dependencies.

Backend proposal: Supabase Auth + Postgres with spatial queries (PostGIS where available), RLS and server-side handlers/workers for authority publishing, model/weather/news adapters and delivery. This is a proposal, not provisioned infrastructure. No service-role/model/weather/news secrets in `EXPO_PUBLIC_*` or a mobile bundle. Restrict native map keys by application identity where supported; document provider terms and quotas.

Domain records: agency/approved role; tourist private preferences/location/device tokens; incident and immutable versions; report observations; evidence/assessment snapshots; source notices/versioned translations; shelter/contact records; audit events; delivery outbox/receipts. Index jurisdiction/incident/time and geographic queries; enforce ownership and versioned writes. Sensitive internal evidence is not exposed through the public incident read model.

Interfaces agreed before parallel implementation:

- Auth/onboarding → role, agency/jurisdiction, language, destination subscriptions and consent state.
- Reporting → idempotent submit response, incident ID and unverified/published status; acknowledged uploads only.
- Escalation → versioned evidence bundle and validated model result; official publication is a separate authorized path.
- Published snapshot → geometry, provenance, confirmation, lifecycle, original/translation, timestamps and shelter references; no reporter PII.
- Targeting/delivery → recipient selection reasons, notification job IDs and actual delivery states.

## 10. Screen contract

Read [ui-ux-direction.md](ui-ux-direction.md) before building. Tourist home is the **live map**, never a briefing dashboard. Persistent native destinations: **Map**, **Alerts**, **Profile**. Incident/shelter details open as native sheets or stack screens. Report incident is the bottom-center map action above safe-area/tab chrome.

Authority mode has operational map, incident publishing/review and shelter/contact management. Same design system, visibly different permissions. No public role-switch that grants authority privileges. All data surfaces have loading, error, empty, cached/offline and content states; every enabled action performs the advertised task.

## 11. 24-hour build plan

This final scope is materially larger than the earlier plan; call it ambitious, not guaranteed feasible. Use one destination, a small phenomenon catalog, configured shelters and two tested languages for a complete vertical slice. Expand only after real delivery and verification.

| Relative time | Integration checkpoint |
| --- | --- |
| T0–T1 | Confirm development window/timezone, organizer fixture/mobile+landing acceptance, actual model/weather/news access, agency demo identities, build accounts and judge distribution route |
| T1–T3 | Scaffold during permitted window, pin dependencies/contracts; start Android/iOS standalone build pipeline; auth, map and backend skeleton |
| T3–T6 | Real tourist report + authorized official publish + persistent map/shelters; launch standalone apps and prove one push on each available physical platform |
| T6–T10 | Recent-report aggregation, weather/news evidence, structured model gate; positive/uncertain/rejected paths |
| T10–T14 | Radius targeting/outbox/receipts, per-user shelter selection, reviewed bilingual alerts and original notice; authority maintenance |
| T14–T18 | Background permissions, offline restart/withdrawal reconciliation, abuse/RLS/version tests; polish accessibility |
| T18–T22 | Fix blockers, accepted iOS distribution, standalone Android, public landing; record real 2–5 minute demo; clean-setup rehearsal |
| T22 | Release candidate with tested links and artifacts |
| T23 | Internal code/content freeze; submission rehearsal |
| T24 | Stop development conservatively at official window close |
| T24–T24.5 | Team leader submits complete deliverables before hard cutoff; no planned feature work |

Four builders: (1) backend/auth/domain/security integration; (2) native map/onboarding/report UI; (3) evidence/model/translation/targeting worker; (4) authority surfaces, QA, builds/landing/demo. With three, combine authority UI into the mobile stream and share QA; keep one migrations/dependency owner. Delegate exclusively scoped files using DeepSeek V4.1 Flash; orchestrator reviews and integrates.

**Release blockers:** no verified provider = do not pretend model/news/weather integration works; no physical push test = no verified push claim; simulation-only data = label and obtain organizer acceptance; no judge-accessible iOS path = unresolved deployment. Any disabled required feature is a disclosed gap, not a completed product.

### Submission artifacts and distribution

| Deliverable | Required access evidence | Owner / checkpoint | Current state |
| --- | --- | --- | --- |
| Android APK | Fresh install and launch without Metro; real artifact link | Release owner, initial T6 / final T22 | Pending |
| iOS | Judge-accessible signed TestFlight/ad-hoc path, or explicitly organizer-accepted simulator fallback | Release owner, path decision T1 / launch T6 / final T22 | Pending; fallback acceptance unconfirmed |
| Web landing | Public HTTPS page with tested real artifact/access links; host chosen at T1 | Release owner, final T22 | No host provisioned |
| Repository/README | Accessible GitHub URL, clean setup, real dependency disclosures | Integration owner, final T22 | Local repository only; remote access unverified |
| Demo video | Real 2–5 minute file in repo, duration/playback checked | QA/demo owner, final T22 | Not recorded |

- **Android:** directly installable standalone `.apk` with bundled JavaScript, verified without Metro. An `.aab` alone is not a direct-install judge artifact; Expo Go/development clients are not the release.
- **iOS:** signed device build with an actually accessible TestFlight/ad-hoc path. Internal TestFlight is team-only, not general judge access; external testing may require Beta App Review with no guaranteed turnaround. Ad-hoc requires registered tester UDIDs. A simulator `.app` is not a physical iPhone `.ipa`; use a simulator fallback only if the organizer accepts it.
- Active paid Apple Developer membership is user-reported; verify authorized account role, signing and judge access early. Push capabilities/credentials and background-location native configuration are now required considerations; prior research exclusions of push are superseded. Do not modify account settings without authorization.
- Public landing: real artifact/access links, limitations and instructions tested in a clean browser. It is not a substitute for working mobile artifacts.
- Repository: problem, solution, clean setup, configuration templates, API/library/model disclosures and actual 2–5 minute demo video. No secrets or signing material. Store builds via approved artifact hosting/release attachments; keep the required video file in the repository unless organizers explicitly approve link-only delivery. Check repository file-size constraints early.

## 12. Acceptance tests and demo

Required checks, all currently **pending**:

1. Tourist signup cannot grant authority role through profile/API/database mutation; revoked/out-of-jurisdiction publishers denied.
2. Tourist report persists as unverified; no public notification or established-hazard marker before confirmation.
3. Valid authority report auto-publishes/notifies even if enrichment/model is unavailable; source attribution preserved.
4. Duplicate reporter taps and old/future reports do not count as current independent evidence; unrelated hazards do not merge.
5. Community confirmation requires eligible evidence + accepted positive model result; invalid/timeout/uncertain response does not broadcast.
6. Model evaluation against superseded incident version cannot publish; weather/news gaps and conflicting inputs are visible.
7. Sunny-local-weather scenario cannot produce an all-clear or automatically reject upstream-flood evidence.
8. Radius boundary, inside/outside, accuracy and stale-location destination fallback behave as documented; no private-location leakage.
9. Duplicate publication/worker retry creates no duplicate logical notification; provider acceptance, receipt and failure distinguished.
10. Actual preferred-language push and detail open on Android/iOS; denied notification/location permissions remain usable.
11. Nearest eligible shelter differs for two users; closed/stale/known-hazard-zone shelters excluded; no eligible shelter handled honestly.
12. Authority shelter/contact edits persist and tourist clients refresh; unauthorized direct writes denied.
13. Translation preserves negation, evacuation orders, place names, deadlines and numbers in tested languages; update invalidates older translation; original always accessible.
14. Background location/permission behavior tested on standalone devices; force-quit limitations stated.
15. Restart offline restores saved alerts/shelters with correct freshness; withdrawal retained through short refresh/restart; offline drafts not marked sent.
16. 200% text, screen reader, light/dark, reduced motion, keyboard, safe areas and map-to-list accessibility checked.
17. Fresh installation without Metro, actual iOS judge access, public landing links, no-secret scan and clean README setup checked.

**Four-minute demo:** problem + pre-arrival language/destination → tourist unverified report/no broadcast → recent corroboration/weather/news and model qualification → real localized alert on another device → map hazard and per-user shelter detail → authority-issued notice with original/translation → authority correction/withdrawal + offline caveat → deployment and honest limitations. Show both official and community paths without presenting seeded agencies/weather as live government integration.

The official rubric is innovation 20, technical 35, feasibility 20, video 15, deployment 10. Innovation/feasibility are the user's focus, not a replacement for the full judging scheme. Technical evidence for the working loop outweighs extra mock screens. See [judging-evidence.md](judging-evidence.md).

## 13. Name and remaining decisions

Tovrilo replaces Waypoint as the working brand. An exact-name web search on 2026-10-09 surfaced unrelated similar-spelling results, not an obvious exact-name app/company. **Non-existence, domain availability and trademark clearance are not proven.** No domain or account has been registered. Release owner screens exact store/domain names at T1 and records results by T22; formal trademark clearance remains required before commercial launch. The hackathon name stays knowingly provisional, without a legal-clearance claim.

Open: actual “Jev”/decision provider; weather/news coverage; language catalog; radius/report-window/shelter freshness settings; verified real agency onboarding; location retention; organizer replay acceptance/timezone; judge iOS access. Prototype policy numbers are not public-safety validation.

Historical research remains input only. [iOS delivery research](research/expo-ios-delivery.md) informs signing/distribution, not proof a build exists. [The archived Waypoint plan](research/waypoint-strategy-archived.md) and its reviews no longer control product scope.
