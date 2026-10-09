# HealthTech Track — Independent Strategy Analysis

**Event:** Bits and Bytes CS Week, 24-hour web hackathon (IIITDM Kancheepuram)
**Track:** HealthTech — *"Lost in Transit: Fragmented Medical Records and Repeated Care Across Providers"*
**Author:** strategy research subagent (independent analysis)
**Date:** 2026-10-09
**Status:** recommendation only. No application code, no external side effects. This file is owned solely by this subagent.

> **Ground rules used throughout**
> - Simulated / synthetic records only. No real PHI.
> - No unsafe clinical advice. No generative model emits diagnosis, dosing, or treatment instructions.
> - No real hospital / ABDM / lab / pharmacy integration is assumed.
> - Rubric weights: **Innovation 20 · Technical 35 · Feasibility 20 · Video 15 · Deployment 10.**
> - Team size was unknown when commissioned; the team subsequently reported **3–4 builders**. Stack remains unknown.
> - "Sourced fact" = backed by a primary source in the references. "Hypothesis" = this subagent's judgement, not a verified claim.

---

## 1. Executive recommendation

> **Orchestrator review:** this is an alternative-track proposal, not the final cross-track decision. External references have not all been independently verified. A local hash chain is not proof against an operator rewriting the entire chain; signed/external checkpoints would be needed for stronger claims. Bearer links authorize possession, not clinician identity. Revocation stops future server access, not previously downloaded or photographed data. Flags and their evidence must be filtered by grant scope to avoid secondary leaks. A repeated test can be clinically appropriate; describe it as a previous result available for review, never an unnecessary test. Check terminology licensing before bundling subsets.

Build **Thread** — a web app where a patient's scattered, synthetic provider records are merged into **one deterministic timeline**, and the patient can **grant a clinician a time-boxed, scope-limited, instantly revocable view** of that timeline, with a **tamper-evident audit trail** the patient can verify.

The wedge is **not** "consent-based health record exchange" (that already exists as national infrastructure — see §3). The wedge is the **patient-facing reconciliation + explainable safety-flag layer** on top of records, plus **receipt-style consent** and **verifiable audit**, all demonstrated deterministically on simulated data with no integration.

One workflow must work end to end, flawlessly: **ingest → timeline → deterministic flags → scoped share → revoke → audit verify.**

Do **not** attempt ABDM/ABHA sandbox integration in 24 hours. Do **not** build a drug-interaction database. Do **not** use an LLM for any clinical output.

---

## 2. Problem, sharpened

The brief's core is **continuity of care across fragmented providers**. The five sub-problems map to five *distinct* engineering jobs, which is why scope control matters:

| Brief sub-problem | Engineering job | Cheap deterministic version |
| --- | --- | --- |
| Scattered records / no single timeline | Ingest + normalize + order | FHIR-ish bundles → canonical entities → merged timeline |
| Unreliable recall | Fast, correct read view | "Active meds / allergies / conditions" summary card |
| Repeated tests & conflicting treatment | Cross-record reconciliation | Duplicate-therapy, allergy-conflict, repeated-test, interaction rules |
| Insecure, hard-to-revoke sharing | Scoped, expiring, revocable access | Signed consent token + revocation + audit |
| Broken continuity (new doctor / ER) | Zero-setup clinician view | No-account, in-scope, time-limited link |

**Hypothesis:** judges reward a *narrow, deep, provable* implementation of all five over a shallow implementation of any one. Technical is 35% — depth beats breadth.

---

## 3. Sourced landscape (facts) and what it means for us

These are primary-source facts; each is a **constraint on our novelty claims**, not a feature we can pretend to invent.

- **ABDM (India) already does consent-based exchange.** Milestone 3 defines a Health Information User (HIU) requesting records via a **consent request** against the patient's ABHA address; the patient approves/denies/revokes in a PHR app; consent artefacts are generated per HIP; records move as **encrypted FHIR R4 Document Bundles** using **ECDH Curve25519** key exchange to a `dataPushUrl`; transfers carry purpose codes (`CAREMGT`, `HPAYMT`, `PUBHLTH`, `DSRCH`, `PATRQT`), access modes (`VIEW`/`STORE`/`STREAM`/`QUERY`), and a `dataEraseAt`. *(source: docs.abdm.gov.in, ABDM Developer Portal — M3 / PHR / Citizen)*
- **ABDM mandates FHIR R4** via the NRCeS FHIR Implementation Guide, with defined record types and care contexts. *(source: nrces.in/ndhm/fhir/r4)*
- **FHIR R4 already models the exact clinical entities** we need: `Patient`, `MedicationRequest`, `AllergyIntolerance`, `Condition`, `Observation`, `DiagnosticReport`, `Encounter`, `Consent`, `Provenance`, `AuditEvent`. *(source: hl7.org/fhir)*
- **Apple Health Records** aggregates records from participating US health systems into the iPhone Health app; it is iOS-centric and provider-account dependent. *(source: apple.com newsroom, 2018; Apple support)*
- **Fragmentation persists despite EHR adoption.** Peer-reviewed work documents interoperability and data fragmentation remaining a real problem even with near-universal EHR adoption. *(source: Rolnick et al., PMC8826150)*
- **Free structured drug-interaction APIs were withdrawn.** NLM's RxNav Drug-Drug Interaction API was **discontinued on/around 2024-01-02**; RxNorm/RxNav terminology APIs remain. `openFDA` drug-label endpoints still exist but return **unstructured label prose**, not a structured interaction database with severity. *(source: NLM RxNav FAQ / API pages; FDA openFDA)*

**Implication:** Any claim like "we invented secure consent-based sharing" or "we built a drug-interaction engine" is **false or unsupported** and risks the innovation and integrity marks. Our defensible novelty is the *composition and the patient-facing proof layer*, demonstrated on simulated data. See §5 and §19.

---

## 4. Existing products and honest differentiation

| Existing solution | What it already does | Our honest delta (do NOT overclaim) |
| --- | --- | --- |
| **ABDM / ABHA PHR apps** | Consent-based FHIR exchange at national scale | We are **standalone and integration-free**; we add a deterministic reconciliation/flag layer and a *verifiable receipt* UX. We do not replace or out-scale ABDM. |
| **Apple Health Records / CommonHealth** | Aggregates records from health systems | We are **web + OS-agnostic**, work on **simulated** data with **no provider accounts**, and expose **share-out + revoke + audit**, not just aggregation. |
| **MyChart / Epic** | Patient portal tethered to one health system | We are **multi-provider by construction** and **patient-held**, not provider-tethered. |
| **Medication reminder apps** | Adherence reminders | We do **reconciliation across prescribers** (duplicate therapy), not reminders. |
| **Generic "health wallet" demos** | File storage | We add **deterministic explainable flags**, **scoped tokens**, and a **hash-chained audit**, with reproducibility as a demoable property. |

### Claims we will NOT make
- "First/only consent-based health record system." (ABDM, Apple, others exist.)
- "Novel AI diagnoses your conditions." (Out of scope and unsafe.)
- "Real drug-interaction coverage." (Only a small, cited demo subset, clearly labelled.)
- "Production-grade / HIPAA / DPDP compliant." (We implement *patterns* and say so; no certification claimed.)
- Any integration with real hospitals, labs, or ABDM.

---

## 5. Recommended MVP concept — **Thread** (working name)

**One-liner:** *Your health history, stitched into one thread — and you decide who sees which part, for how long.*

**Core objects the user sees:**
1. **Timeline** — merged, chronologically ordered events from multiple simulated providers, each tagged with its source.
2. **Summary card** — active medications, allergies, conditions (the ER "first 10 seconds" view).
3. **Flags** — deterministic, explainable "review prompts" (never directives), each with evidence links to the exact source records.
4. **Share link** — a clinician opens it with **no account**, sees **only the scoped slice**, for a **bounded time**.
5. **Audit receipt** — every access is logged in a **hash-chained, tamper-evident** log the patient can verify.
6. **Emergency view** (should-have) — a QR/short link exposing *only* allergies + active meds + conditions, expiring fast, revocable.

**Deterministic flag rules (v1, all explainable, all pure functions):**
- `R-DUP-THERAPY` — two active prescriptions sharing the same **RxNorm ingredient** (duplicate therapy across prescribers).
- `R-ALLERGY-MED` — an active medication whose ingredient matches a recorded allergy substance.
- `R-DDI-DEMO` — a **small, cited, bundled** interaction pair list (e.g. a curated demo subset) — explicitly labelled *not clinical decision support*.
- `R-REPEAT-TEST` — the same LOINC lab code ordered by two providers within a configurable window.
- `R-STALE-MED` — a prescription still marked active past its expected end date (data-hygiene prompt).
- `R-CONFLICT-DOSE` — same ingredient, materially different dose across prescribers (prompt only).

Each flag returns: `rule_id`, `severity (info|review)`, `explanation (template)`, `evidence[]` (record/entity ids + timestamps). No free-text medical advice.

**Optional distinctive feature — "What changed since last visit"** (`R-DIFF`): a deterministic diff of the record set between two timestamps, so an ER clinician instantly sees what is new. This is a strong demo beat and is purely deterministic.

---

## 6. The critical workflow (the ONE path that must never break)

This is the acceptance-tested happy path. Everything else is optional.

1. **Sign in** as the seeded patient (simulated auth; no real identity).
2. **Ingest** a bundled synthetic dataset of records from 3–4 providers (clinic, lab, pharmacy, hospital) as FHIR-ish JSON bundles.
3. **Normalize + merge** into one timeline; show source badges and counts.
4. **Compute flags** deterministically; show them with evidence links and a *report hash*.
5. **Share**: patient creates a grant — scope = `{medications, allergies}`, duration = 24h, purpose = `care-management` — and gets a link/token.
6. **Clinician view** (incognito, no account): sees only in-scope data + relevant flags; the access is written to the audit log.
7. **Revoke**: patient revokes the grant; the clinician link now **fails immediately**.
8. **Audit**: patient opens the audit trail, sees the access event, and **verifies the hash chain**.

**Acceptance criteria (must all pass on the deployed URL, not just localhost):**
- [ ] Fresh seed produces the **same flag set and same report hash** on every run (determinism).
- [ ] Scoped link never exposes out-of-scope resources (verified by hitting the API directly, not just the UI).
- [ ] Revoked/expired token returns 401/403 and no data.
- [ ] Audit chain verifies; a deliberately tampered entry fails verification.
- [ ] Works for a judge with **zero setup** via public URL.

---

## 7. Data model

Simulated, provider-agnostic, aligned to FHIR concepts so the "future development" story is credible.

```
Patient(id, display_name, dob, sex, local_health_id?, created_at)
Provider(id, name, kind[clinic|lab|pharmacy|hospital], city)
SourceRecord(id, patient_id, provider_id, kind, authored_at,
             source_format, raw_ref, content_hash, ingested_at)

Medication(id, record_id, rxnorm_code, display, dose, route,
           frequency, status[active|completed|unknown], authored_at)
Condition(id, record_id, snomed_code, display, onset_at, status)
Allergy(id, record_id, substance_code, display, reaction, severity)
Observation(id, record_id, loinc_code, display, value, unit,
            ref_range, collected_at)
Encounter(id, record_id, provider_id, occurred_at, reason_display)

ConsentGrant(id, patient_id, clinician_label, purpose_code,
             scope[], date_from, date_to, expires_at,
             revoked_at?, token_id, created_at)
AccessEvent(id, grant_id?, patient_id, actor_label, action,
            resource_type, at, prev_hash, hash)   -- append-only, hash-chained
Flag(derived, not authoritative)  -- recomputed from records; cache optional
```

**Design notes**
- `Flag` is **derived**; storing it is a cache. Determinism comes from recomputation over the canonical dataset, not from stored state.
- `SourceRecord.content_hash` supports provenance and dedup.
- `AccessEvent` is append-only; `hash = SHA256(prev_hash || canonical(entry))`.
- Codes (RxNorm/LOINC/SNOMED) come from a **bundled JSON subset** with attribution; no live terminology calls required for the demo.

---

## 8. Security & privacy model

Patterns we implement (and describe honestly as *patterns*, not certifications):

| Concern | MVP approach | Production note (stated in README, not built) |
| --- | --- | --- |
| AuthN (patient) | Simulated single-patient session / seeded login | Real IdP / OIDC |
| AuthN (clinician) | **Scoped bearer token** in share link; no account | Same, with audience restriction |
| AuthZ | Server-side scope check on every read | Policy engine |
| Consent token | Signed JWT: `grant_id, patient_id, scope, purpose, exp, jti` | Add key rotation + short TTL + DPoP |
| Revocation | DB revocation check + deny-list on every request | Push revocation, not just poll |
| Encryption at rest | AES-256-GCM per patient data key, wrapped by env master key | KMS/HSM |
| Encryption in transit | HTTPS only | — |
| Audit integrity | SHA-256 hash chain + verify endpoint | External append-only store / WORM |
| Data minimisation | Scope limits resource types; emergency view is a fixed tiny slice | Policy-based |
| PII | **Synthetic only**, clearly labelled | DPDP/HIPAA mapping documented |
| Clinical safety | Rules are **review prompts**; no advice; persistent disclaimer | Clinical governance |

**Hard rule:** no secret or key is committed; deploy-time env vars only.

---

## 9. Deterministic demonstrable technical depth (the 35%)

Technical marks come from *provable* behaviour. Make determinism a first-class, visible property.

**Three mechanisms:**
1. **Deterministic normalization** — fixed mapping tables (`RxNorm subset`, `LOINC subset`, `SNOMED subset`) + canonical string fallback. No probabilistic matching, no live API dependency.
2. **Deterministic rule engine** — pure functions, stable rule ordering, stable sort keys, template-only explanations. Same input ⇒ byte-identical output.
3. **Determinism hash** — `report_hash = SHA256(canonical_json(sorted_flags) || dataset_hash)`. Display it in the UI and expose `GET /api/report/hash`. Judges can re-run and see the same hash.

**Suggested test vectors (ship these as tests):**
- Duplicate ingredient across two providers ⇒ exactly one `R-DUP-THERAPY` with both evidence ids, ordered by `(rule_id, severity, first_evidence_id)`.
- Allergy + matching active med ⇒ `R-ALLERGY-MED`.
- Same LOINC within window ⇒ `R-REPEAT-TEST`; outside window ⇒ none.
- Revoked grant ⇒ 403 and zero rows.
- Tamper one `AccessEvent` ⇒ `verify` returns `valid:false` with the first bad index.

**Why this reads as depth:** canonicalization, rule ordering, provenance, hash-chaining, and scope enforcement are exactly the "edge cases and overall system design" the rubric asks for — and each is demoable in seconds.

---

## 10. Simulated data plan

- **Seeded, versioned fixture** in-repo: 1 patient, 3–4 providers, ~15–25 records spanning ~3 years, deliberately containing: a duplicate-therapy pair, one allergy conflict, one repeated lab, one stale med, and (optionally) one demo interaction pair.
- **Story:** a diabetic/hypertensive-type chronic patient who moved cities and switched doctors — matches the brief's persona.
- **Labelling:** every screen and the README state "synthetic data for demonstration."
- **Reset:** one button/command restores the exact fixture so the demo is reproducible.
- **No external data downloads at runtime**; the subset is committed with attribution to avoid network fragility during judging.

---

## 11. Demo script (2–5 min) mapped to the video rubric

| Time | Beat | Rubric signal |
| --- | --- | --- |
| 0:00–0:25 | Problem: fragmented records, repeated tests, unsafe sharing (persona). | Clear problem explanation |
| 0:25–1:10 | Timeline: 4 providers merge into one view; source badges. | Feature showcase |
| 1:10–2:00 | Flags: duplicate therapy + allergy conflict + repeated test, each with evidence and *review-prompt* wording; show report hash. | Technical depth + safety |
| 2:00–2:50 | Share: create 24h meds+allergies grant; open in incognito as "Dr. X"; show scope actually enforced; audit entry appears. | Core differentiator |
| 2:50–3:20 | Revoke; link dies instantly. | Security / control |
| 3:20–3:50 | Audit verify (and tamper → fail). | Deterministic depth |
| 3:50–4:20 | Re-run: same report hash; deployed public URL; disclaimer; future ABDM/FHIR alignment. | Determinism + deployment + feasibility |

Keep the video ~3.5–4 min to stay safely inside 2–5 min. Record the deployed URL, not localhost.

---

## 12. Rubric scoring strategy

- **Innovation (20):** Score on *composition + proof layer* (receipt-style consent, tamper-evident audit, deterministic explainability, "what changed since last visit"), not on invented standards. Avoid unsupported novelty claims (see §4).
- **Technical (35):** Deterministic engine + provenance + hash-chained audit + scope enforcement + tests. This is where we invest the most engineering hours.
- **Feasibility (20):** Single-command deploy, seeded demo, responsive web, documented production path (KMS, OIDC, ABDM/FHIR). Explicitly name constraints we handled (no integration, synthetic data, fixed terminology subset).
- **Video (15):** Follow §11 exactly; one clean narrative; show scope enforcement and revocation, since these are visually convincing.
- **Deployment (10):** Public URL, no login for judges beyond the seeded demo, stable fixture, health check, README with setup. Prefer a managed host with a persistent DB so restarts don't wipe state.

---

## 13. Feasibility plan

**Recommended stack (fast, single deploy, one language):**
- Next.js (App Router) or SvelteKit — UI + API routes together.
- Postgres via a managed provider (Neon/Supabase) **or** SQLite + persistent volume. Managed Postgres is safer for "state survives redeploy."
- Prisma or Drizzle for schema/migrations; Tailwind for UI.
- Zod (or equivalent) for input validation; `jose`/`jsonwebtoken` for consent tokens.
- Vitest/Jest for the deterministic rule tests.
- Host on Vercel/Render/Fly with env-based secrets.

**Solo fallback:** drop the clinician incognito view to a read-only page behind the same token; drop the emergency QR; keep timeline + flags + share/revoke + audit. The critical workflow in §6 still holds.

**24-hour allocation (hypothesis; adjust to team size):**
- **H0–H2:** scaffold, deploy "hello", schema, seed fixture. *Deploy early.*
- **H2–H8:** ingest + normalization + timeline UI.
- **H8–H13:** rule engine + flags UI + report hash + tests.
- **H13–H18:** consent grants, tokens, scoped clinician view, revocation.
- **H18–H20:** hash-chained audit + verify + tamper demo.
- **H20–H22:** polish, disclaimers, README, seed reset.
- **H22–H23:** record video against the deployed URL.
- **H23–H24:** buffer + submission.

**Parallelisation (if 3–4 people):** (A) data/ingest/normalization; (B) rule engine/tests; (C) auth/consent/audit; (D) UI/video/README. Interface contracts (types + API shapes) frozen in hour 2 so work streams don't block.

---

## 14. Risks and kill criteria

| Risk | Likelihood | Impact | Kill / mitigation |
| --- | --- | --- | --- |
| Integration rabbit hole (ABDM sandbox, real APIs) | Med | High | **Kill on sight.** Simulated only. No external clinical API at runtime. |
| Rule engine reads as medical advice / false positives | Med | High | Frame as *review prompts*; template wording; disclaimer; cap rule set. |
| Determinism broken by unordered iteration | Med | High | Stable sort keys; canonical JSON; hash test in CI. |
| Auth/consent over-engineered | Med | Med | One patient session + scoped link; no multi-tenant RBAC. |
| Scope leak (clinician sees too much) | Low | High | Server-side scope enforcement test; hit API directly in demo. |
| Deployment flakiness during judging | Med | High | Deploy by H2; managed DB; health check; reset endpoint; local fallback video. |
| Free interaction data unavailable | High | Low | Bundle a tiny cited demo subset; label clearly; never depend on a live DDI API. |
| Scope creep (mobile, PDF OCR, LLM) | High | Med | Explicit "won't" list (§15). |
| Time overrun | Med | Med | Cut order in §15; protect the critical workflow. |

**Hard kill criteria (stop and cut, don't fight):**
- Any feature requiring a live external clinical data source.
- Any LLM-generated clinical statement.
- Any auth flow beyond seeded patient + scoped token.
- Any effort to make claims we can't source (see §4).

---

## 15. Scope cuts (ordered)

**MUST (the demo dies without these):** deploy; seed fixture; ingest + normalize; merged timeline; flags (≥3 rules); scoped share link; revocation; audit log + verify; README + disclaimer.

**SHOULD:** determinism hash in UI; "what changed since last visit"; evidence links per flag; tests for the rule engine; emergency summary view.

**COULD:** QR emergency card; tamper-demo button; multi-patient; PDF/image "upload" (stored as opaque, not parsed); basic RBAC.

**WON'T (state explicitly):** real ABDM/FHIR endpoints; real hospital/lab/pharmacy integrations; production DDI database; LLM diagnosis/dosing; native mobile app; OCR/NLP extraction; HIPAA/DPDP certification claims.

---

## 16. Safety, ethics, and integrity

- **No unsafe clinical advice:** flags are prompts for a clinician, never instructions to a patient. No dosing changes, no "stop taking," no diagnosis.
- **No generative clinical output:** eliminates hallucination and the "fake demo" disqualification risk.
- **Synthetic data only**, visibly labelled; README states the data is fabricated.
- **Honest attribution:** all open-source libraries, terminology subsets, and any public interaction data are disclosed in the README (hackathon rule §2 of Submission Guidelines).
- **Accessibility:** responsive web; keyboard-navigable; readable contrast; judges need no setup.

---

## 17. Alternatives considered (and why not chosen)

1. **ABDM sandbox HIU/HIP integration** — high novelty optics, but needs registration, certs, callbacks, and time we don't have; also risks being judged as "just ABDM." Rejected as core; kept as a future-development slide.
2. **LLM "explain my records" assistant** — fast to build, but unsafe, non-deterministic, and hard to demo reliably. Rejected.
3. **Drug-interaction engine** — free structured APIs were withdrawn; building one is out of 24h scope and risks unsupported claims. Rejected as core; tiny cited subset only.
4. **Blockchain for records** — poor fit, slow, and mostly theatre; hash-chained audit gives tamper-evidence without the overhead. Rejected.
5. **Mobile app** — deployment rubric prefers accessible web; mobile adds build/signing risk. Rejected.

---

## 18. Recommendation

**Proceed with Thread.** It is narrow enough to finish in 24 hours, deep enough for the 35% technical weight (deterministic engine, provenance, hash-chained audit, enforced scope), visually convincing for the 15% video (scope enforcement + instant revocation + tamper detection), and deployable to a public URL for the 10%.

Differentiate honestly: **not** a new consent standard, but a **patient-held reconciliation + proof layer** that works with **no integration** and demonstrates **determinism** as a property. Protect the §6 workflow above all else.

**Open questions for the team (decide in hour 0–1):**
- Team size/skills → pick solo vs 4-way split.
- Hosting + DB choice → managed Postgres vs SQLite volume.
- How many rules to ship (recommend 3 must + 1 should).
- Whether to include the emergency view (recommend: only if timeline+share+audit are done by H18).

---

## 19. Sourced facts vs hypotheses

**Sourced facts (primary):**
- ABDM M3 HIU consent flow, consent artefacts, FHIR R4 bundles, ECDH Curve25519, purpose codes, `dataEraseAt` — ABDM Developer Portal.
- ABDM PHR app roles and consent management — ABDM Developer Portal.
- ABDM FHIR R4 implementation guide — NRCeS.
- FHIR R4 resources `Patient`, `MedicationRequest`, `AllergyIntolerance`, `Condition`, `Observation`, `DiagnosticReport`, `Encounter`, `Consent`, `Provenance`, `AuditEvent` — HL7.
- RxNav Drug-Drug Interaction API discontinued ~2024-01-02; RxNorm terminology APIs remain — NLM.
- openFDA drug-label endpoint exists but is unstructured prose — FDA.
- Apple Health Records aggregates from participating health systems, iOS-centric — Apple.
- Fragmentation persists despite EHR adoption — Rolnick et al., PMC8826150.

**Hypotheses (this subagent's judgement, unverified):**
- The specific MVP design, rule set, determinism-hash approach, and audit chain.
- Rubric-scoring strategy and 24-hour allocation.
- The differentiation table and the "claims we will not make" list.
- All feasibility, risk, and scope-cut judgements.

**Secondary source (treat with caution):**
- A 2026 industry blog claims the free DDI-API landscape shifted and that a managed vendor now fills the gap. Used only to corroborate the *timing* of the RxNav shutdown; the primary NLM pages are the authority.

---

## 20. References

1. ABDM Developer Portal — M3 (HIU consent flow): https://docs.abdm.gov.in/docs/hiecm/v3/milestones/m3
2. ABDM Developer Portal — PHR application: https://docs.abdm.gov.in/docs/hiecm/v3/concepts/participants/phr
3. ABDM Developer Portal — Citizen & consent: https://docs.abdm.gov.in/docs/hiecm/v3/concepts/participants/citizen
4. ABDM Developer Portal — M2 (HIP): https://docs.abdm.gov.in/docs/hiecm/v3/milestones/m2
5. NRCeS FHIR Implementation Guide for ABDM: https://nrces.in/ndhm/fhir/r4/index.html
6. HL7 FHIR R4 — Patient: https://www.hl7.org/fhir/patient.html
7. HL7 FHIR R4 — MedicationRequest: https://www.hl7.org/fhir/medicationrequest.html
8. HL7 US Core — MedicationRequest / medication list: https://hl7.org/fhir/us/core/
9. NLM RxNav FAQ (DDI API discontinued): https://lhncbc.nlm.nih.gov/RxNav/information/FAQs.html
10. NLM RxNav APIs: https://lhncbc.nlm.nih.gov/RxNav/APIs/index.html
11. FDA openFDA drug label API: https://open.fda.gov/apis/drug/label/
12. Apple — Health Records announcement (2018): https://www.apple.com/newsroom/2018/01/apple-announces-effortless-solution-bringing-health-records-to-iPhone/
13. Rolnick et al., "Early Adopters of Apple Health Records…" (fragmentation persists): https://pmc.ncbi.nlm.nih.gov/articles/PMC8826150/
14. Organizer brief: `docs/hackathon-brief.md`
