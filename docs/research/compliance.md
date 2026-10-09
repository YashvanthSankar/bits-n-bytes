# Compliance & Acceptance Review — Bits and Bytes CS Week Hackathon

> **Reviewer role:** independent strict compliance/judging reviewer.
> **Authoritative source:** `docs/hackathon-brief.md` only. No external verification performed.
> **Scope:** planning only. No application code. This file is owned by the compliance reviewer.
> **Interpretation:** quoted requirements come from the supplied brief; gate labels and operational practices are reviewer recommendations, not an organizer-published pass/fail scheme. Unknown items require clarification.
>
> **Orchestrator update:** the team subsequently reported **3–4 builders** and **organizer confirmation that AI agents are allowed**. The exact confirmation and timezone were not supplied. The AI section below records what the written brief itself does not specify, not a rejection of the team's confirmation.

---

## 0. Status legend

| Tag | Meaning |
|---|---|
| **[R]** | Rule stated in the brief. Traceable to a section. |
| **[G]** | Hard gate — failure risks penalty or disqualification. |
| **[S]** | Scored rubric item — earns points, does not by itself pass/fail. |
| **[?]** | Ambiguity / gap. Must be clarified. Do **not** assume a permissive answer. |
| **[REC]** | Reviewer recommendation. Not an organizer rule. |

---

## 1. Facts extracted from the brief (traceable)

| # | Fact | Source |
|---|---|---|
| 1 | Event is a 24-hour web development hackathon at IIITDM Kancheepuram. | Title, §Rules intro |
| 2 | Kickoff ceremony: Friday **09/10/2026, 8:00 PM**, venue IIITDM Kancheepuram. | §1 |
| 3 | Development window: Friday 09/10/2026 **20:30** → Saturday 10/10/2026 **20:30** (24 h). | §2 |
| 4 | A 30-minute submission window stays open after development: **20:30–21:00** on 10/10/2026. | §2 |
| 5 | Final submission deadline: **21:00 on 10/10/2026**. | §2, §3 |
| 6 | Teams work **remotely**. | §2 |
| 7 | **Only the team leader** may submit. | §3 |
| 8 | Submission is **online via a Google Form shared on 10th October**. | §3 |
| 9 | Teams pick **one** of the listed problem statements across HealthTech / TravelTech / CivicTech. | §Problem Statements |
| 10 | Deliverable: **GitHub repository** + **2–5 minute demo video**, with the **video added to the project repository**. | §Submission Guidelines 1 |
| 11 | Code must be **developed during the hackathon duration**. | §Submission Guidelines 2 |
| 12 | Open-source libraries and APIs **allowed but must be disclosed**. | §Submission Guidelines 2 |
| 13 | **README required**: problem statement, solution, setup instructions. | §Submission Guidelines 3 |
| 14 | Round 1: judged within domain. Top teams per domain shortlisted for **Round 2** (present + demo to panel). | §Submission Guidelines 4 |
| 15 | **Deployment/Hosting mandatory in an accessible form.** Web = public link; Mobile = installable/testable (APK / TestFlight / emulator-friendly build). | §Evaluation Criteria 5 |
| 16 | Disqualification for rule violation or misconduct. | §Terms 2 |
| 17 | **Fake or non-working demos → disqualification.** | §Additional Notes |
| 18 | Incomplete or non-functional projects **may be penalized**. | §Additional Notes |
| 19 | Teams retain ownership; organizers may request permission for promotional use. | §Terms 1 |
| 20 | Organizers not responsible for technical failures/equipment problems. | §Terms 3 |
| 21 | Additional credit possible for real-world applicability and meaningful use of data. | §Additional Notes |

---

## 2. Gates vs rubric (the core risk model)

A submission can score well on the rubric and still be invalid or penalized for missing requirements. The G1–G9 labels below are our operational release gates, not an official extra scoring scheme. Only consequences explicitly stated in the brief should be described as certain. Order of operations: **satisfy required deliverables → then optimize rubric.**

### 2.1 Hard gates (pass/fail) — failure = penalty or disqualification

| Gate | Requirement | Source | Evidence of compliance |
|---|---|---|---|
| G1 | Repo is a **GitHub repository** and reachable by judges. | [R] §SG1 | Public URL or judge-access granted; verify in incognito/clean browser |
| G2 | **Demo video 2–5 minutes**, added to the repository. | [R][G] §SG1 | Prefer the video file in the repository; link-only acceptance requires organizer confirmation. Duration measured. |
| G3 | **README** with problem statement, solution, setup instructions. | [R][G] §SG3 | README at repo root covering all three |
| G4 | **Deployment/hosting accessible** (web public link; mobile APK/TestFlight/emulator build). | [R][G] §EC5 | Live URL or installable artifact reachable without setup |
| G5 | **Developed during the hackathon window.** | [R][G] §SG2 | Honest work log and in-window commits support provenance; timestamps alone do not prove when code was authored. |
| G6 | **Disclose all open-source libraries and APIs used.** | [R][G] §SG2 | Disclosure section in README listing every lib/API |
| G7 | Submission through the **Google Form**, by the **team leader only**, **before 21:00**. | [R][G] §3 | Leader submits; timestamped confirmation captured |
| G8 | Demo must be **real and working** (no fake/non-working demo). | [R][G] §Additional Notes | Live walkthrough works on judge's device/browser |
| G9 | Project **functional**; incomplete/non-functional may be penalized. | [R] §Additional Notes | End-to-end path demonstrably works |

### 2.2 Scored rubric (points, not gates)

| Criterion | Weight | What judges look for | Source |
|---|---|---|---|
| Innovation | **20%** | Originality, novelty, distinctiveness vs existing solutions | §EC1 |
| Technical Implementation | **35%** | Depth/complexity, code quality/structure/robustness, edge cases, system design | §EC2 |
| Feasibility | **20%** | Real-world practicality, scalability/reliability, constraints, future scope | §EC3 |
| Video Presentation | **15%** | Clear structured demo, problem+solution explanation, key features shown | §EC4 |
| Deployment / Hosting | **10%** | Quality/completeness, usable without setup, stability, real-world effort | §EC5 |
| Bonus (unspecified amount) | — | Real-world applicability, meaningful use of data | §Additional Notes |

**[REC]** Technical Implementation (35%) + Feasibility (20%) = 55% of the score. Deployment (10%) + Video (15%) = 25% and are the most commonly lost points because they are treated as afterthoughts. Budget for them explicitly.

---

## 3. Ambiguities and permission gaps (do NOT assume)

The following are **not resolved by the brief**. Each is a compliance risk. Default posture = **conservative** until organizers answer in writing.

### 3.1 AI agents / AI-assisted development
- The brief says open-source libraries and APIs are allowed **if disclosed** [R] §SG2. It does **not** mention AI coding agents (Copilot, Cursor, Claude, ChatGPT, etc.).
- **Do not assume AI agents are permitted.**
- **[?]** Are AI coding assistants allowed? Is AI *usage* required to be disclosed? Is AI-generated code counted as "developed during the hackathon"?
- **[REC]** Ask organizers in writing before relying on any AI tool. If no answer, default to: use only human-written code and document all tooling. If AI is used, disclose it explicitly in the README regardless of the answer.

### 3.2 Pre-event docs, assets, boilerplate
- The brief requires the project be "developed during the duration of the hackathon" [R] §SG2. It does **not** define the boundary for pre-written scaffolding, templates, design assets, datasets, or starter repos.
- **[?]** Are pre-event boilerplate/templates/assets allowed? Must they be disclosed? Is a pre-built starter repo acceptable if core logic is written in-window?
- **[REC]** Treat all pre-event material as a liability. Prefer starting from a bare skeleton. If anything pre-exists, disclose it and keep it clearly separated from in-window work. Commit history is the primary evidence for G5.

### 3.3 Timezone
- The brief gives times (20:30, 21:00) **without a timezone** and dates as `09/10/2026` / `10/10/2026`.
- The system date (Fri Oct 09 2026) plus the India venue strongly suggest **IST (UTC+05:30)** and **DD/MM/YYYY**. This is inference, **not stated**.
- **[?]** Confirm the authoritative timezone and date format. All deadlines (G7, freeze) hinge on this.
- **[REC]** Confirm in writing. Assume IST only as a working default, and keep a buffer so a timezone misunderstanding cannot cost the submission.

### 3.4 Freeze / post-window commits
- Development ends at 20:30; the submission window 20:30–21:00 is described as for **submission** [R] §2–3. The brief does not say whether code commits are permitted during that window.
- **[?]** Is any code change after 20:30 permitted? Does "developed during the hackathon duration" forbid post-20:30 commits?
- **[REC]** Treat **20:30 as a full code freeze**. Use 20:30–21:00 exclusively for submitting via the form and verifying receipt. Any commit after 20:30 risks G5/G8 scrutiny.

### 3.5 Team size
- The brief mentions a "team leader" [R] §3 but **never states team size, minimum, or maximum**.
- **[?]** Team size rules, eligibility, and registration constraints are outside this brief. They may exist in registration terms not supplied.
- **[REC]** Confirm team composition against registration rules before the event. Do not infer a limit.

### 3.6 Other unstated items
- **[?]** Round 2 format, duration, and scheduling — brief says only that it will be communicated to shortlisted teams.
- **[?]** Google Form link — "shared on 10th October"; arrival time unknown → submission-window risk.
- **[?]** Whether the repo must be public vs private-with-access.
- **[?]** Mobile submission path only applies if a mobile app is chosen; web path applies to web apps.
- **[?]** Scoring scale/rounding and tie-breaks — not specified.

---

## 4. Clarification questions to send organizers immediately (before/at kickoff)

Send as one message; request written answers.

1. Confirm timezone and date format for all deadlines (kickoff, dev window, submission).
2. Are AI coding assistants/agents permitted? Must their use be disclosed?
3. Are pre-existing templates, boilerplate, assets, or datasets allowed? Disclosure required?
4. May code be committed during the 20:30–21:00 submission window, or is 20:30 a hard freeze?
5. What are the team size and eligibility rules?
6. What exactly must the Google Form submission contain (repo link, video link, deployed URL, disclosures)?
7. Must the repo be public, or can judges be granted access?
8. What is the expected Round 2 format and time?
9. For mobile submissions, which artifact is preferred (APK / TestFlight / emulator build)?
10. When on 10th October will the Google Form link be shared?

**[REC]** Capture every answer with a timestamp and store alongside the repo. If an answer is never received, document the conservative default actually used.

---

## 5. Measurable acceptance / submission checklist

Every item is binary. A submission is **ready** only when all **[G]** items are checked. Verify on a clean device and a logged-out browser.

### 5.1 Repository
- [ ] Repo exists on GitHub and is reachable by a judge (public or access granted). **[G1]**
- [ ] Commit history shows work inside the development window. **[G5]**
- [ ] No unexplained large pre-event dump of code/assets. **[G5][?]**
- [ ] Code runs from a clean clone following the README. **[G9]**

### 5.2 README
- [ ] Problem statement explained. **[G3]**
- [ ] Solution described. **[G3]**
- [ ] Setup instructions (dependencies, env vars, run steps). **[G3]**
- [ ] Every open-source library disclosed. **[G6]**
- [ ] Every external API disclosed. **[G6]**
- [ ] Any pre-event material disclosed (if used). **[?]**
- [ ] Any AI tooling disclosed (if used / if required). **[?]**

### 5.3 Demo video
- [ ] Duration is **≥ 2:00 and ≤ 5:00**. **[G2]**
- [ ] Video file is added to the repository; use link-only delivery only if organizers confirm it satisfies the rule. **[G2]**
- [ ] Problem is explained. **[S, §EC4]**
- [ ] Solution and key features are demonstrated live. **[S, §EC4]**
- [ ] Demo shows real working functionality, not mockups. **[G8]**
- [ ] Structure is clear (intro → problem → solution → demo → close). **[S, §EC4]**

### 5.4 Deployment / hosting
- [ ] Web app reachable via a **public link** (or mobile artifact: APK / TestFlight / emulator build). **[G4]**
- [ ] Works without any judge setup (no local install for web). **[G4][S]**
- [ ] Stable across a fresh session; no auth dead-ends or cold-start failures. **[S, §EC5]**
- [ ] Seed/demo data present so judges can exercise features. **[S, §EC5]**

### 5.5 Submission mechanics
- [ ] Team leader identified and available at 20:30–21:00. **[G7]**
- [ ] Google Form link received and opened early. **[G7][?]**
- [ ] Repo link, video link, and deployed URL ready to paste. **[G7]**
- [ ] Submitted **before 21:00**. **[G7]**
- [ ] Confirmation/receipt captured (screenshot/email). **[REC]**

---

## 6. 24-hour milestone & time-budget principles

Times are relative to **T0 = development start (Fri 20:30)**. T+24 = dev end. T+24.5 = hard submission deadline. Target **T+22 (≈18:30 Sat)** for a release candidate; **T+23** is the internal final freeze after final verification.

### 6.1 Budget principles
1. **Gates before rubric.** Allocate time to G1–G9 before polishing scores.
2. **Deploy on day zero.** A public link from hour 1 de-risks the mandatory 10% and surfaces hosting problems early.
3. **Reserve ≥ 25% of the window for judge-facing work** (video 15% + deployment 10% + README), because these are commonly under-budgeted and gated.
4. **Freeze before the deadline.** Release candidate at T+22, internal final freeze at T+23, hard development stop at T+24 (20:30). Submission window is for submitting only.
5. **Commit every 30–60 minutes** to evidence in-window development for G5.
6. **No new scope after T+19.** Only hardening, edge cases, and judge-facing work after that.
7. **Maintain a buffer.** Never plan to finish at the deadline; plan to finish 2 hours early.
8. **One owner per gate.** Every [G] item has a named responsible person and a verification time.

### 6.2 Milestone table

| Elapsed | Wall (IST, inferred) | Milestone | Gate linkage |
|---|---|---|---|
| T+0.0 | Fri 20:30 | Statement chosen; repo created; README skeleton; clarification questions sent | G1, G3, §3 |
| T+0.5 | 21:00 (timezone unconfirmed) | Historical schedule; controlling strategy supersedes it. Deployment only after authorization; current web scope is landing only | G4 |
| T+1.5 | 22:00 | Data model + auth/skeleton; first commits pushed | G5 |
| T+4 | Sat 00:30 | Core happy-path vertical slice works end-to-end | G9 |
| T+8 | 04:30 | **MVP checkpoint** — primary flow demoable | G8, G9 |
| T+12 | 08:30 | Primary features complete; midpoint rubric review | §EC1–3 |
| T+16 | 12:30 | Secondary features + edge-case handling | §EC2 |
| T+19 | 15:30 | **Feature freeze** — no new scope | — |
| T+20 | 16:30 | Hardening; deployment finalized; seed/demo data; disclosures written | G4, G6 |
| T+21 | 17:30 | README complete (problem/solution/setup/disclosures) | G3, G6 |
| T+21.5 | 18:00 | Record demo video (target 3–4 min, within 2–5) | G2 |
| T+22.5 | 19:00 | Video edited + **added to repo**; clean-device link test | G2, G4 |
| T+23 | 19:30 | **Internal freeze** — final smoke test on clean device/browser | G8, G9 |
| T+24 | Sat 20:30 | **Hard code freeze** — development window ends | G5 |
| T+24.0–24.5 | 20:30–21:00 | Leader submits Google Form; capture receipt | G7 |
| T+24.5 | **21:00** | **HARD DEADLINE** | G7 |

### 6.3 Rubric-coverage checkpoints (measure against weights)

- [ ] Innovation (20%): a one-paragraph statement of what is genuinely distinct. **[S]**
- [ ] Technical (35%): edge cases handled; code structured; tests or validation present. **[S]**
- [ ] Feasibility (20%): scalability, constraints, future scope documented. **[S]**
- [ ] Video (15%): 2–5 min, structured, real demo. **[S][G2]**
- [ ] Deployment (10%): public, accessible, stable, seeded. **[S][G4]**
- [ ] Bonus: real-world applicability and meaningful data use demonstrated. **[S]**

---

## 7. Operational risks

| Risk | Impact | Likelihood | Mitigation |
|---|---|---|---|
| Google Form shared late on 10th | Missed/ rushed submission (G7) | Medium | Monitor channels; pre-stage all links/text; submit the instant it arrives |
| Timezone/date-format misread | Missed deadline (G7) | Low–Medium | Confirm in writing; keep buffer; assume IST working default |
| Repo not accessible to judges | G1 fail | Low | Verify in logged-out browser / incognito |
| Video outside 2–5 min | G2 fail | Medium | Time to the second; target 3–4 min |
| Video not added to repo | G2 fail | Medium | Commit/link explicitly; verify from repo page |
| Deployment down at judging time | G4 + 10% lost | Medium | Deploy early; add uptime check; keep artifact fallback |
| Judges cannot use app without setup | G4/§EC5 loss | Medium | Seeded demo account/data; no local install for web |
| Fake/non-working demo | **Disqualification (G8)** | Low but fatal | Only demo real working features; never mock a live path |
| Post-freeze commits | G5 scrutiny | Medium | Hard freeze at T+24; submission window is submit-only |
| Pre-event code/assets undisclosed | G5/§SG2 risk | Medium | Start clean; disclose anything pre-existing |
| AI-tool usage undisclosed / disallowed | G6/§SG2 risk, possible DQ | Unknown | Clarify; default conservative; disclose if used |
| Only leader can submit; leader unavailable | G7 fail | Low | Backup channel; leader on standby 20:30–21:00 |
| Remote coordination drift | Scope creep, missed gates | Medium | One owner per gate; checkpoints in §6.2 |
| Incomplete/non-functional features | Penalty (G9) | Medium | Cut scope at T+19; ship a working core |
| Organizer tech failures | No recourse | Low | Terms §3: organizers not liable; keep local backups of everything |

---

## 8. Red flags (concise)

1. **AI agents: not mentioned anywhere.** Cannot be assumed allowed. Must clarify; if used, disclose. **[?]**
2. **Pre-event docs/assets: undefined boundary.** "Developed during the hackathon" is unqualified. Keep commit evidence; start clean. **[?]**
3. **Timezone not stated.** Dates/times only. Inference = IST + DD/MM, unconfirmed. Deadline-critical. **[?]**
4. **Freeze ambiguity.** Brief never says whether commits are allowed during 20:30–21:00. Treat 20:30 as hard freeze. **[?]**
5. **Team size not stated.** Only "team leader" is mentioned. Confirm against registration rules. **[?]**
6. **Google Form arrives on the final day.** Submission-window logistics risk for G7.
7. **Video is a gate, not just a score.** 2–5 min, added to repo. A 1:59 or 5:01 video risks G2.
8. **Deployment is mandatory (10%) and a gate.** A working app with no public link fails accessibility.
9. **Fake/non-working demo = disqualification**, and incomplete/non-functional projects may be penalized. Real functionality only.
10. **Disclosure is mandatory** for every open-source library and API. Missing disclosure risks G6.
11. **Only the team leader may submit.** Single point of failure at the deadline.
12. **Round 2 depends on Round 1 domain ranking** — shortlisting is per-domain, not global. Competition is within the chosen domain.
13. **The brief itself is unverified** ("No external verification has been performed"). Confirm against any official organizer materials.

---

## 9. Reviewer stance

- This document is a **planning artifact**; it asserts no outcome.
- We aim to **maximize gate compliance and rubric coverage**; we do not promise placement or winning.
- Resolve material **[?]** items with organizers; retain the team's reported AI-use confirmation. Where unresolved, apply the conservative default.
- Re-audit this checklist at T+19 (feature freeze) and T+23 (internal freeze).

*End of compliance review.*
