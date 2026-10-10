# GudTour — acceptance ledger

Updated: 2026-10-10. Every application scenario is pending. The completed Jev connectivity smoke test is separate provider evidence.

Source: PLAN.md §18, with the explicit online-first overrides below. Record actual device/OS/build/commit, fixture versus live source and observed outcome when executing a check.

| ID | Scenario | Required outcome | Result / evidence |
| --- | --- | --- | --- |
| AC01 | First launch outside India | Language and location gate are available; onboarding and app content are blocked. | Pending |
| AC02 | First launch with denied foreground permission | Blocking permission screen; no map access. | Pending |
| AC03 | Background permission denied | Full foreground app works; reduced tracking/alert warning is visible. | Pending |
| AC04 | Notification permission denied | Onboarding continues; in-app alerts work; delivery limitations are clear. | Pending |
| AC05 | Tourist reports a flood | Unverified/pending detail opens; other tourists receive no alert yet. | Pending |
| AC06 | Tourist taps corroboration repeatedly | One independent witness; immediate updates accepted without cooldown (2026-10-10 user override). | Pending |
| AC07 | Corroboration from too far away | Disabled with explanation; new local observation remains possible. | Pending |
| AC08 | Ten old reports versus one new report | Recent and total counts differ; old reports do not form a fresh evidence cluster. | Pending |
| AC09 | Jev qualifies with sufficient probability | Automatic area-targeted app-assessed emergency, without authority approval. | Pending |
| AC10 | Jev is uncertain or down | Incident remains visible and pending/unqualified; no new tourist emergency notification. | Pending |
| AC11 | Jev says sunny but recent upstream rain exists | Context retains both facts; sunshine is not an automatic rejection rule. | Pending |
| AC12 | Authority records an unconfirmed claim | Verified organization badge, Unverified incident content. | Pending |
| AC13 | Authority declares emergency while Jev is down | Official emergency publishes immediately. | Pending |
| AC14 | Feed contains a test or irrelevant same-state alert | No public emergency escalation from that notice. | Pending |
| AC15 | User enters an ongoing emergency area | First relevant alert appears using fresh location eligibility. | Pending |
| AC16 | User's location is 45 minutes old | No new personalized targeting; refresh warning and cached access remain. | Pending |
| AC17 | User dismisses an alert | Yellow banner remains while exposure is active; reopening is silent. | Pending |
| AC18 | Two active emergencies overlap | Both remain accessible; overlay order follows severity/source rules. | Pending |
| AC19 | More witnesses arrive without changed instructions | Detail updates without another emergency sound. | Pending |
| AC20 | Official instruction changes | A new revision is visible; old translation is invalidated; urgent action change is re-alerted. | Pending |
| AC21 | Authority says stay indoors | No generic go-to-shelter instruction replaces it. | Pending |
| AC22 | Nearest shelter is full or in a hazard zone | Excluded from automatic recommendation; reason visible. | Pending |
| AC23 | Every nearby shelter is unsuitable | No confirmed suitable shelter message, official instructions and contacts. | Pending |
| AC24 | Google Maps is absent | Address/coordinates/contact and Copy destination remain available. | Pending |
| AC25 | Translation fails | Timely prepared-language warning plus original notice; no invented translation/instruction. | Pending |
| AC26 | Tourist loses connection | Cached public lists/notices/shelters/contacts remain readable with offline/item timestamps; downloaded basemaps are not required. | Pending |
| AC27 | Tourist reports offline | Save an unsent local draft; no public witness or alert; explicit resend after reconnect and a fresh eligible fix. | Pending |
| AC28 | Old queued report reconnects | The unsent draft retains original observation time; no automatic posting or fresh-witness increase. Explicit resend revalidates context. | Pending |
| AC29 | Authority edits a shelter offline | Draft only; reconnection requires review and explicit publication. | Pending |
| AC30 | User enters chat within 15 km of a message origin | Unexpired message appears with original time and approximate locality. | Pending |
| AC31 | Sender travels away after posting | Message eligibility remains anchored to its original point. | Pending |
| AC32 | Chat reaches 24-hour expiry | Message disappears from live/cached tourist streams. | Pending |
| AC33 | Message is reported or removed | Moderation queue receives report; removal has reason/placeholder/appeal. | Pending |
| AC34 | App is offline when an alert is cancelled | Cached warning stays aged; genuine correction appears on synchronization. | Pending |
| AC35 | Feed expires or disappears | No automatic all-clear. | Pending |
| AC36 | Profile is deleted | Private profile/current location/device association removed; retained public evidence is anonymous. | Pending |

## Additional engineering acceptance checks

| ID | Check | Required outcome | Result / evidence |
| --- | --- | --- | --- |
| EC01 | Unauthorized/other-user requests | Role cannot self-elevate; private profiles, witness origins and tokens denied. | Pending |
| EC02 | Jurisdiction/revocation | Cross-scope and revoked authority writes denied, audit retained. | Pending |
| EC03 | Concurrent revisions/retry | Stale writes rejected; idempotent retry keeps one logical operation. | Pending |
| EC04 | Worker recovery | Expired lease/page resumes without duplicate logical jobs; uncertain sends remain separate. | Pending |
| EC05 | Six-language integrity | Original, issuer, places, numbers, deadlines and negation survive exact-version translation checks. | Pending |
| EC06 | Native distribution | Android clean install without Metro; valid signed judge-accessible iOS path. | Pending |
| EC07 | Accessibility | Large text, screen reader, contrast, reduced motion and map/list alternative checked on native builds. | Pending |
| EC08 | DEMO isolation | Fixtures and demo alerts never target ordinary identities/devices. | Pending |
| EC09 | Model budget ceiling | Model calls suspend at configured ceiling while official declaration still publishes. | Pending |
| EC10 | Held-out Jev cases | Record model/rubric/threshold and false positive/negative examples separately from tuning data. | Pending |

No scenario passes solely from a screenshot, mock or provider ticket. Feature-level checks are recorded as they run; release requires scope-appropriate native and integration evidence.
