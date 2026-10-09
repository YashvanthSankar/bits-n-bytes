# Final user product brief — TravelTech

**Source:** user's final implementation-plan message. Wording below is preserved, with only whitespace/heading formatting normalized. This replaces the earlier briefing-only product scope, **not** the [organizer brief](hackathon-brief.md). Interpretation, safety constraints and acceptance tests belong in [winning-strategy.md](winning-strategy.md); do not silently substitute them for the source request.

## BITS AND BYTES HACKATHON: PROJECT IMPLEMENTATION PLAN

### PROBLEM STATEMENT

TravelTech

Real-Time Crisis Communication for Tourists During Extreme Weather Events

CONTEXT: When localized extreme weather events occur—such as sudden flash floods or severe cyclones—foreign tourists are highly vulnerable due to their lack of local geographic knowledge and language barriers.

PROBLEM: Local weather warnings, emergency broadcasts, and safe-zone declarations are fragmented and rarely translated or localized for tourists. Travelers struggle to verify which areas are actively flooded or unsafe and cannot easily access translated instructions from local authorities, forcing them to rely on chaotic, unverified social media rumors.

IMPACT: This communication gap leads to widespread panic, stranded travelers wandering into high-risk weather zones, and unnecessary strain on local rescue services during critical windows.

WINNING CRITERIA:

INNOVATION

FEASIBILITY

## FEATURES

### Role based login

One for tourists, one for authorities. Authority incident reports are auto promoted to verified status. And authorities maintain the shelter info and contact infos. Tourists are the main target users. They are expected to onboard this app before arriving to the location so their info is up to date.

### Incident architecture

Incident is created when a tourist reports it, or an authority reports it. They can be a variety of commonly occuring natural phenomenon, like flash floods, landslides, etc.

Tourist creates -> status is unverified. Others are not notified until this incident becomes “confirmed”

Authority creates -> status is verified. Incident is escalated and target users are notified.

Escalation logic: To determine if an incident should be notified to users in the radius area, we use these factors:

Number of people reported by (status), or if it is official. It should not only depend on the number of users reported by. It should also depend on the timestamp of individual reports. Only if reports are relatively close to each other, or new, it is valid.

Live and previous weather conditions in that area. (flash flood is very unlikely if the live weather is sunny and has no history of rain)

Any news about that particular area/event covered online.

To make the final decision, we pass all the required context to a decision model like Jev, which determines if the incident is now qualified as an “NOTIFIABLE_EMERGENCY”.

### Notification strategy

Have a default effect radius for each incident. If an incident is qualified to be NOTIFIABLE EMERGENCY, notify all users that have the last reported location to be in this radius.

Nearest shelter alert: From the configured shelters, this should pick the nearest shelter from the last reported location (different for each user) and direct them to that location safely. (just a call to action to move to shelter)

## GENERAL THINGS

Available in many languages: during onboarding, tourist picks their preferred language to receive alerts in.

Innovation C: Meaning-preserving emergency translation

Translate official instructions while preserving critical details such as place names, severity, deadlines, evacuation orders, and prohibited actions.

Show the original notice alongside the translation, and identify the issuing authority.

Why it wins: In emergencies, a fluent translation that changes the meaning is worse than a slightly awkward but accurate one.

## PAGES

### Onboarding

Get live location info and background runnin

### Live map (main page)

Map with hazard zones and shelters

A clear visual representation of the current scenario.

A floating button in the bottom center for “REPORT INCIDENT”

### Report incident page

Buttons for commonly occuring natural phenomenon.

## User's requested documentation/naming action

> read these perfectly understand this is final output we want perfectly in our app understand think and then rewrite the docs and readme properly keep a good cool name for the app unique non existent super cool app name memorable easier wordish, like that

## Earlier decisions still in force

**Interpretation notes (not edits to the quoted source):** “background runnin” is incomplete wording; the plan interprets it as consent-based background location updates subject to OS limitations. “Direct them ... safely” is a requested user outcome, not a verifiable routing guarantee: the plan preserves the nearest-shelter CTA while explicitly labeling route safety as unverified. No custom safe-route implementation was requested.

- Android + iOS apps using Expo; public web **landing page**, not a full web crisis app.
- 3–4 builders; active paid Apple Developer account reported available.
- Orchestrator owns integration and evidence; delegated model is `opencode/deepseek-v4.1-flash`.
- Premium mobile-native UI, explicitly not generic AI/editorial/AI-slop.
- Application development, accounts and deployment remain separately gated. This request asks for a documentation rewrite, not performed implementation.
