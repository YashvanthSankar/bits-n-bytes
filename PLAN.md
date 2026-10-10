> Emergency presentation override — 2026-10-10: the first emergency message displays actual attributed instructions, severity, authority, DEMO and nearest listed shelter details inline. Do not require a Read instructions button or show generic nearby/alert-remains filler. Preserve original/translation, deadlines and actual stale/outside/uncertain location warnings.

> Navigation override — 2026-10-10: user requested Map, Incidents, Shelters, SACHET and Settings; hide Nearby chat until implemented. Compact/collapsible map welcome panel replaces duplicate top shortcuts.

> Implementation status: [docs/current-state.md](docs/current-state.md) distinguishes implemented functionality, acceptance gaps and deferred scope. This document includes planned features and is not proof they are complete.

> Assessment cadence override — 2026-10-10: periodic Jev reassessment is now hourly (60 minutes). New/updated observations still queue immediately; outage retries remain 1/5/15 minutes.

> Reporting clarification — 2026-10-10: normal Report incident records a personal COMMUNITY observation for every account, including authorities. It never grants official verification from account membership. Official publication is an explicit authority-workspace action with audience and jurisdiction authorization.

> Shelter override — 2026-10-10: user explicitly requested raw nearest listed shelter by straight-line distance, without eligibility filtering. Preserve visible status, age, source, DEMO attribution and official instructions. Older suitable-shelter selection/exclusion requirements below are superseded for the current implementation. DEMO shelters appear only with explicit DEMO opt-in.

> Latest notification scope (2026-10-10): user requested in-app custom notifications only. When an emergency is published, queued geographic targeting updates eligible accounts and Convex real-time subscriptions present a global popup in open foreground clients. Native notification permission, APNs/FCM/Expo push and closed-app delivery are deferred. Other core incident, authority, translation and location requirements remain unchanged.

# PLAN — India Tourist Crisis Communication Mobile App

> **2026-10-10 scope update:** Read [tech-stack.md](tech-stack.md) and [TODO.md](TODO.md) with this plan. [TECHNICAL_IMPLEMENTATION_PLAN.md](TECHNICAL_IMPLEMENTATION_PLAN.md) provides the full engineering design. The user selected Expo, Convex, Google OAuth, Apple Maps on iOS/Google Maps on Android, AccuWeather, SACHET, Jev 1.13 through OpenCode Zen and Google Cloud Translation. OpenCode Jev access passed a synthetic connectivity test; app integration and accuracy remain pending. News is removed. Online-first operation supersedes downloaded basemaps and comprehensive offline workflows below; cached public content and explicit unsent drafts remain degraded-mode support. These latest decisions override conflicting older documentation.

Status: implementation-ready product behavior specification  
Date: 9 October 2026  
Scope: mobile app behavior only. No technology stack, service architecture, database schema, or implementation framework is prescribed.

## 1. Purpose and scope

Help tourists physically in India understand nearby natural hazards, receive timely multilingual emergency alerts, find authority-maintained shelters and contacts, and exchange local information during extreme weather.

The first implementation includes the complete tourist experience, authority workflows, automatic Jev assessment, official SACHET warnings, offline access to previously downloaded information, and nearby chat with moderation. These are required features, not optional mock screens.

The app communicates danger and actionable information. It does not promise rescue dispatch, guaranteed notification delivery, live knowledge of every hazard, shelter admission, or a verified safe route.

### Confirmed user decisions

| Subject | Fixed behavior |
| --- | --- |
| Emergency qualification | Jev automatically qualifies tourist incidents for emergency notification; human approval is not required. Authorities can also declare emergencies directly. |
| Location access | Foreground location permission is mandatory. Background location permission is optional, with a reduced-alert warning when unavailable. |
| Geographic coverage | App use and onboarding are blocked outside India. There is no pre-arrival onboarding or foreign destination-alert mode. |
| Chat | Nearby chat is included, with expiry, reporting, and moderation. |
| Emergency action | Specific applicable authority instructions take priority. Otherwise offer the nearest eligible open shelter outside known hazard zones and Google Maps navigation. |
| Personal information | Name is required. Blood group and emergency contact are optional and private. |
| Languages | English, Hindi, Tamil, French, German, and Spanish for UI and alerts. |
| Assessment uncertainty/outage | A new tourist incident stays visible as unverified or assessment pending. No emergency notification until Jev qualifies it or an authority declares it. |

### Definition of defaults

All remaining rules and numerical values in this document are explicit first-version product defaults chosen to complete the specification. They are binding for implementation unless the product owner later changes them. They are not validated meteorological thresholds or claims about Jev's accuracy. Do not invent different behavior for an edge case already covered here.

## 2. Users, authority trust, and permissions

### Tourist

A tourist can view incidents, alerts, shelters and emergency contacts; submit observations; corroborate nearby incidents; participate in nearby chat; and manage their profile, language, location permissions, and offline downloads.

Tourist contributions use a persistent private identity so one person cannot repeatedly increase the same incident's independent witness count. Public displays use a generated alias, not the required personal name. The sign-in mechanism is an implementation choice; its visible requirements are to preserve the profile and contributions and never grant authority privileges through self-selection.

### Verified authority

Authority accounts are approved by a trusted app operator before use. The first version may use preapproved demonstration accounts. A tourist cannot select a role to become an authority. Every public official action shows the organization and the time; its responsible account remains traceable in authority history.

An authority has an assigned Indian jurisdiction and can:

- Review, verify, correct, merge, reject, and resolve incidents in that jurisdiction.
- Declare, update, withdraw, and end app-issued official emergency alerts.
- Define the affected area and issue instructions.
- Maintain shelters and emergency contacts in its jurisdiction.
- Moderate local chat and publish identifiable authority announcements.

An authority can browse incidents outside its jurisdiction but cannot edit them. Overlapping jurisdictions allow either responsible authority to act; the latest authorized action is recorded, and contradictory instructions are flagged for review rather than silently combined.

The trusted app operator approves authority accounts, sets jurisdictions, handles escalated abuse appeals, and manages account restrictions. This is an administrative responsibility, not a third tourist-facing product experience.

Authority screens must never expose a searchable list of tourist names, health details, emergency contacts, or precise live locations. The first version has no responder access to private tourist profiles.

## 3. India restriction, location, and onboarding

### Entry gate

1. Offer the six-language selector before requesting permission, so the gate is understandable.
2. Explain the location requirement and request foreground location.
3. If permission is denied or location services are disabled, show a blocking screen with Enable location, Open settings, and Retry. Do not enter the app or complete onboarding.
4. Obtain a location fix from the last five minutes with reported accuracy of 200 metres or better, clearly within India's supported boundary.
5. If clearly outside India, show “Available only in India” and Retry. Do not allow onboarding, browsing, reporting, chat, or targeted alerts.
6. If location is unavailable or too uncertain to establish country, keep the gate open with a useful explanation. An uncertain border position is not sufficient to allow entry.

The restriction follows physical location, not nationality, phone country code, device language, or the map viewport. Scrolling a map does not change the user's country or alert eligibility. A hazard near the border may extend beyond India visually, but the app's user service and authority actions remain restricted to India.

### Onboarding inside India

After passing the entry gate:

1. Confirm the preferred UI and alert language; default to a supported device language, otherwise English.
2. Collect name, optional blood group including Unknown, and optional emergency contact name and phone number. Explain that these details remain private and are not shared by submitting a report or entering chat.
3. Establish the tourist profile. A name is not presented as verified identity. A supplied blood group is self-reported and not medically verified.
4. Explain and request notification permission. Denial does not block entry; show that alerts will be available only when the app is open or when the device permits delivery.
5. Explain background location separately. Denial does not block entry. Show “Location updates only while using the app. Alerts may use an older location.”
6. Download information for the current local area and explain the offline status banner.
7. Open the main map.

There is no mandatory tutorial before reaching the map. Help and permission explanations remain available in Settings.

### Location during use

- Refresh location when entering the foreground, before reporting, before corroborating, before posting to chat, and before selecting a shelter.
- While active, aim to refresh at least every five minutes and when substantial movement is detected. With background permission, aim for the same freshness while travelling; restrictions or failures are represented by the actual update age.
- Background updates are attempted only with the relevant permission. Show the actual last update time rather than implying uninterrupted tracking.
- Use a five-minute, 200-metre-accuracy fix for reporting and corroboration. Use a five-minute, 500-metre-accuracy fix for chat participation.
- For emergency targeting, a last known Indian location up to 30 minutes old with accuracy of one kilometre or better is eligible. If its uncertainty area overlaps a hazard boundary, include the user and label possible proximity. Do not silently exclude a boundary user because their position is imprecise.
- Locations older than 15 minutes are visibly labeled stale. At over 30 minutes, stop new personalized emergency targeting until location refreshes; active and cached alerts remain viewable.
- Background denial therefore still allows recent-location alerts, but cannot provide continuing travel-aware alerts after the location ages out.
- A temporary GPS failure after successful onboarding allows cached viewing and browsing with the last known Indian position. Reporting, corroboration, and chat posting wait for a qualifying fix. Distances show “From last known location” and its age.
- Revoking mandatory foreground permission or disabling location services returns the user to the location gate. Keep locally saved data intact for later restoration.
- A newly established position outside India immediately blocks app use, chat participation, and further targeted notifications until the user returns. It does not delete the profile or previously issued reports.

The app can only enforce geography against available location evidence. It must never call an old position the user's confirmed current position.

## 4. Navigation and shared presentation

Tourist navigation has five destinations: Map, Incidents, Shelters, Nearby chat, and Settings. Emergency contacts and active alerts are reachable from every main screen. The bottom-centre Report incident button is prominent on the map and has a text label as well as an icon.

All screens define loading, empty, failed-to-refresh, offline, and stale-information states. A failed refresh preserves the previous content with its age. No information is presented as fresh merely because the screen was reopened.

Use separate visual signals for incident verification, severity, emergency status, and data freshness. Do not make a single badge or color stand for all four. Colors always have accompanying labels or icons. Support readable large text, screen readers, one-handed primary actions, and reduced motion.

Yellow offline and active-alert banners remain separate. When both apply, the active-alert banner is first and offline status is directly beneath it. Marquee text can scroll slowly, but the full message must be readable through a static accessible label; reduced motion disables scrolling. Alert overlays use a stronger red treatment; after dismissal the app uses the requested yellow alert treatment without obscuring hazard colors.

## 5. Incident concepts and hazard presets

A report is one person's dated observation. An incident groups observations about the same ongoing event. An alert is a versioned instruction/notification associated with an incident or an official warning. Several witnesses do not create several emergency interruptions for the same incident.

### Initial hazard choices and defaults

| Hazard | Default approximate notification radius | Recent witness window | Non-emergency report becomes stale after no fresh observation |
| --- | --- | --- | --- |
| Flash flood | 5 km | 60 minutes | 2 hours |
| Flood / waterlogging | 5 km | 2 hours | 6 hours |
| Landslide | 1 km | 60 minutes | 6 hours |
| Cyclone | 25 km | 6 hours | 24 hours |
| Severe storm / heavy rain | 10 km | 2 hours | 6 hours |
| Coastal storm surge | 5 km | 2 hours | 6 hours |
| Heatwave | 10 km | 6 hours | 24 hours |
| Other natural hazard | 2 km | 60 minutes | 2 hours |

These radii are approximate coverage presets, not claims that an entire circular area is affected. Show “Approximate alert area.” Authority-defined affected areas and official geographic areas replace a default radius when available. The radius determines who may need information, not who may corroborate an observation.

Tourists cannot enlarge a radius or declare an evacuation zone. Authorities can change the area with a recorded reason. An official area remains as published; the app must not replace it with an unrelated circle.

## 6. Reporting, corroboration, and duplication

### Tourist report flow

1. Choose a large labeled hazard button. Other requires a short description.
2. Capture a qualifying live location. Show the point and readable locality/address. If address lookup fails, retain coordinates and “Address unavailable”; location failure blocks submission.
3. Ask when the event was observed: Now, 15 minutes ago, 30 minutes ago, or Earlier. Earlier allows an explicit time in the last 24 hours. Future observations are invalid. Historical submissions outside the witness window are visible evidence but do not count as current witnesses.
4. Optional description, maximum 500 characters. Photos and videos are outside first-version scope; submitting a report must not require approaching a hazard to obtain evidence.
5. Present active same-type candidate incidents observed within the last 24 hours and within one kilometre of the report point; for cyclones use ten kilometres. Offer “Add my observation” or “Report a different event.”
6. Submit once. Open the incident detail screen immediately on success; show Unverified and Assessment pending as applicable.

Candidate matches are suggestions, not silent merges. Authorities can merge genuine duplicates, preserve every observation, and retain links from old incident pages. Merging keeps the strongest active alert and official provenance, deduplicates witnesses, and never produces another first-alert sound solely because an identifier changed.

### Corroboration

The detail action is “I also observe this,” not “Verify.” It is enabled only for an active incident when the user's qualifying current fix is within one kilometre of a reported observation point. For an explicitly published official affected area, being inside that area also qualifies. Users elsewhere can submit their own observation at their location and reference the existing incident.

One person contributes at most one independent witness per incident, including the original reporter. A later update refreshes that person's observation time rather than incrementing the count. Show both “Recent independent witnesses” and “Total witnesses,” with the current window named. Withdrawn, rejected, or restricted-account contributions do not count.

Corroboration records what the person currently observes; it does not grant official verification or automatically guarantee escalation. Tourists can correct or withdraw their own contribution. If an emergency has already been distributed, withdrawal requests correction review and preserves the incident and alert history.

### Abuse controls and user-facing outcomes

**2026-10-10 user override:** Incident creation, corroboration and observation updates have no application rate limit or submission cooldown. Authentication, location/time validation, idempotency and independent witness counting still apply.

- Accept incident submissions and corroboration updates without per-hour limits or waiting periods. Each person still contributes at most one independent witness per incident.
- Keep the ability to read alerts and contact authorities available while posting is restricted.
- Users can flag an incident as inaccurate, duplicate, or abusive. Flags are moderation evidence, not votes that automatically cancel an emergency.
- Moderators give a reason when rejecting an observation. The contributor sees that reason and can appeal once through Help.
- Tourist profile details and exact observer positions are private. The incident hazard point/area and a generated source alias are public.

## 7. Incident lifecycle: separate dimensions

### Verification

| Label | Meaning |
| --- | --- |
| Unverified | Tourist report or an authority explicitly logging an unconfirmed claim. |
| Corroborated | At least two distinct recent qualifying witnesses. Still not official verification. |
| Authority verified | An approved authority confirms the event, or a genuine official warning establishes the stated warning. |

An authority-created incident defaults to Authority verified. If the authority deliberately records a claim it has not confirmed, it can choose Unverified. Its organization still has a verified source badge. Verified publisher identity and verified incident content are separate concepts. A weather warning is presented as a forecast/warning, not proof that flooding has already occurred.

Corroborated is based on the current witness window. If its qualifying witness count drops below two, return to Unverified unless an authority has verified the incident. Age alone never removes the source attribution of an authority verification; show that its confirmation is old instead.

### Activity lifecycle

| State | Tourist presentation | Transition |
| --- | --- | --- |
| Active | In nearby map/list with appropriate uncertainty | Created or refreshed observation/authority warning. |
| Stale | Last known condition; not current-confirmed | Non-emergency tourist incident exceeds its hazard stale timer. |
| Resolved | Archived; ending time and authority reason | Authority confirms event ended. |
| Rejected | Removed from active views; correction available | Authority finds false, abusive, or irrelevant content. |
| Merged | Redirect to surviving incident | Authority links duplicate events. |

Non-emergency stale incidents leave the default live layer but remain in a “Show stale reports” layer. New qualifying observations can return them to Active and cause reassessment. Tourist-only incidents with no fresh observations for 48 hours are archived as “Expired — current conditions unknown,” never as “Safe.”

Authority-created non-emergency incidents require a review deadline, default six hours and maximum 24 hours. Missing that deadline marks their condition Stale while retaining their authority attribution. Feed-origin warnings follow their published expiry. An authority can renew a condition explicitly; merely reopening a record is not reconfirmation.

Resolved, rejected, and expired incidents do not reopen from a new tourist contribution; a new occurrence creates a new incident, linked to previous history when relevant. An authority can correct an accidental closure with a reason and a new alert revision if needed.

### Emergency qualification

Emergency status is separate from verification: Not qualified, Assessment pending, Notifiable emergency, or Emergency ended. A Jev-qualified incident can remain Unverified or Corroborated and must display both facts. “App-assessed emergency” and “Official emergency” have equal immediate visibility but different source labels.

An active emergency is never automatically resolved because reports stop, weather becomes sunny, a feed cannot be reached, or a timer expires. Its assessment can become stale; its last warning remains clearly labeled until renewed, explicitly ended, or withdrawn by an authority. No missing-data condition creates an all-clear.

## 8. Jev decision behavior

Jev is the automatic decision model for tourist incidents. The app supplies evidence; Jev does not independently fetch weather, official warnings, history, or user locations. The app must not claim that the model knows information absent from the assessment record.

### Context supplied for each assessment

- Hazard category, incident point/area, readable locality, district and state when known, observation and submission times, and the evaluation time.
- Recent distinct observations with observation times, location quality, proximity eligibility, source provenance, withdrawals and moderation outcomes. Include counts and ages already established by the app.
- Current weather, the previous 24 hours of relevant weather, available upstream/regional weather context, and source timestamps. Mark missing sources explicitly.
- Active relevant SACHET warnings: issuing authority, original notice, covered area, hazard, severity, issue/expiry time, and update/cancellation status.
- Nearby prior incidents within ten kilometres over the preceding twelve months, distinguishing confirmed events from unverified reports and stating when no history exists.
- Existing assessments, applicable authority decisions/instructions, changes since the preceding assessment, and contradictory evidence.

History is a significant susceptibility factor, as requested, but is not proof of a new event. Sunny current weather does not veto flooding; recent/upstream rainfall and ongoing conditions may support it. State-level location similarity alone does not make an official warning locally relevant. Neither numerous old reports nor copied reports count as a recent independent cluster.

### Bounded judgments and final qualification

Define narrow judgments about current evidence, weather consistency, official-warning relevance, historical susceptibility, severity, and instruction applicability. The final Jev qualification selects exactly one outcome:

1. NOTIFIABLE_EMERGENCY — available evidence supports a nearby hazard requiring immediate protective attention.
2. NOT_QUALIFIED — available evidence does not currently justify emergency notification; this does not mean the area is safe.
3. INSUFFICIENT_EVIDENCE — uncertainty prevents qualification.

For automatic escalation, the final selection must be NOTIFIABLE_EMERGENCY with that option's probability at least 0.90. Anything else does not create a new emergency alert. Preserve the returned selection, probability and model confidence separately. A valid high-confidence NOT_QUALIFIED result is not an assessment outage. Missing, malformed, or failed results are Assessment pending. The 0.90 cutoff is a first-version product default requiring later evaluation on representative scenarios, not an empirically validated safety cutoff.

This is automatic Jev qualification, not an authority approval queue. There is no minimum number of tourist witnesses that overrides the result: a credible single observation may qualify, and many weak observations may fail to qualify.

Severity has four ordered labels: Low, Moderate, High, and Critical. Show the Jev severity and its confidence only when available; otherwise show Unknown. An authority-set severity takes display precedence and remains labeled as an authority assessment. A low-confidence severity must not be displayed as a certain severity or cause a new urgent repeat by itself.

### Explanation and confidence presentation

- Jev returns bounded judgments rather than free-form explanations or translated notices.
- Incident detail shows evidence summaries assembled from actual observations and sources, such as “3 recent independent observations; heavy rain recorded; relevant official flood warning.” Show unknown and contradictory factors too.
- Confidence is labeled “Model assessment confidence,” with a short explanation that it measures the model's decisiveness and is not a verified probability that the hazard exists.
- Do not label the qualification option's probability, verification status, or severity score as interchangeable confidence values.
- For authority-declared emergencies with no Jev result, show “Declared by authority; AI assessment unavailable,” not an invented score of 100%.

### Reassessment and authority precedence

Assess after initial submission and after a new qualifying observation, withdrawal, moderation correction, authority change, or relevant official/weather update. Reassess ongoing candidate incidents at least every five minutes while assessment services are available. Identical refreshed data does not create repeated user notifications.

If Jev is unavailable, keep new reports visible and pending; retry at one, five, and fifteen minutes, then every fifteen minutes while the incident remains eligible. Display last assessment time. Existing emergencies retain their last warning, with “Assessment update unavailable” when appropriate.

An authority can declare an emergency immediately without Jev. It can also withdraw a mistaken emergency, resolve an incident, or explicitly suppress automatic escalation after review. A suppression requires a reason and review deadline, default 30 minutes and maximum two hours; pending reports remain visible. New Critical assessments or new official emergency notices flag the suppression urgently for authority review, and a new official emergency is still displayed. At the deadline, ordinary automatic assessment resumes.

A Jev result that becomes NOT_QUALIFIED does not send an all-clear or silently end an existing emergency. Mark it “Updated assessment — authority review needed”; only an explicit authority end/correction or the applicable official notice's cancellation ends that emergency. Jev cannot modify or cancel an authority declaration.

## 9. Official warnings and source freshness

SACHET's CAP Feed page is the source-discovery entry point for official warnings; do not assume its web page is itself one universal machine-readable alert stream. Use its published state feeds as appropriate and preserve issuing-source attribution.

For the user experience:

- Check official warnings at least every two minutes while the service is available; display last successful check time.
- Match hazard and actual published affected area, including relevant neighboring-state coverage where it reaches the incident. A textual address assists interpretation but never replaces available official geographic coverage.
- If only a district or state is specified, retain that broad coverage and label it. Never imply a village-level location was supplied.
- Preserve issue time, expiry, original text, issuing authority, and source link. Distinguish observed events from forecasts.
- Recognize revisions and cancellations as changes to the same notice, not new duplicate incidents.
- Exclude test, exercise, draft, private, and cancelled messages from live public emergency treatment. Demo notices must be clearly marked DEMO and cannot target ordinary users.
- Publish a current official notice directly as an official warning without waiting for tourist witnesses or Jev.
- When the issuing notice explicitly requests immediate protective action for a severe or extreme imminent threat, treat it as an official emergency and target the published affected area directly. Other current official notices are visible advisories and assessment context, not automatic full-screen emergencies merely because they exist.
- If notice meaning is incomplete or ambiguous, retain the original official warning visibly, flag interpretation pending, and do not fabricate an evacuation order.

At published expiry, the notice moves out of the current-warning layer and displays Expired. An emergency previously issued from it retains a separate “Warning expired — current conditions unconfirmed” record until a genuine cancellation/end or a responsible authority update. Notice expiry alone is not an all-clear.

Weather older than 30 minutes is stale; official-source checks unsuccessful for over ten minutes are stale. Keep earlier material with these labels and ages. Missing data stays Unknown, never “No warnings.” Do not present state feeds that failed to load as checked and empty.

## 10. Alert eligibility, delivery, and updates

### Who receives a notifiable emergency

Target users whose eligible last known Indian position lies within the affected area or approximate default radius, including overlapping position uncertainty. Manual map browsing has no effect on targeting. A new qualifying location inside an already-active emergency generates that user's first alert even if the emergency began earlier.

Unverified/non-qualified reports are visible on map/list but do not notify other tourists. Assessment pending does not trigger a caution notification under the chosen policy.

### Foreground and background experience

- With the app open, a newly relevant emergency opens a full-screen alert with a brief sound and vibration where permitted. There is no endless alarm.
- In the background or on a locked device, request an urgent device notification with the short hazard/location/action text. Opening it shows the full alert.
- Do not claim that the app can force a full-screen takeover or override mute, Do Not Disturb, notification denial, or device restrictions.
- Sound does not carry unique information. Everything needed is on screen.
- When notification permission is denied, show a persistent reminder in Settings and a non-blocking status on the map. Check active relevance when the app reopens.

### Full-screen content

Show hazard, severity/unknown severity, app-assessed or official source, locality, issue/update time, and a short applicable action. Primary language is the user's preference. Provide an Original / Translation toggle and a compact source label; the full original text is always accessible.

Actions: follow the relevant instruction or view/navigate to an eligible shelter; open incident detail; access official contacts; and dismiss the overlay. Dismiss means “I have seen this,” not “I am safe” or “Emergency resolved.” Opening the alert again from its banner is silent.

### Several alerts and deduplication

Order simultaneous alerts by Critical before High before Moderate before Low/Unknown, official before app-assessed at equal severity, then most recent material revision. The overlay displays one at a time with “2 more active alerts” and a list selector. Every relevant active alert remains in the alert centre.

Sound once per user per incident on first entry into its emergency state. Ordinary new witnesses, confidence changes, translations arriving, and repeated feed entries update silently. A confirmed severity increase, new protective instruction, materially expanded area affecting the user, or newly unsafe recommended shelter can generate a new urgent revision and sound. Limit such repeat sounds to once per incident per ten minutes, except a new Critical instruction.

If the user moves outside an affected area, remove the active exposure banner after a fresh fix, retain the alert in history, and display “Outside the reported area — conditions may change.” Do not claim the entire journey is safe. Re-entering within 30 minutes of leaving reopens the exposure banner silently; re-entry after 30 minutes can issue a fresh exposure sound if the emergency is still active.

Explicit authority resolution, cancellation, or false-alert correction produces a quiet follow-up to previously alerted users, including the changed status and source. Corrections to a dangerous instruction may be urgent. Keep the original alert linked to the correction; never erase what users were told.

Cancellation applies to the specific originating declaration or notice. If another independent app-assessed or authority emergency remains active for the same incident, retain that emergency and explain which source ended. Rejecting an incident that has already triggered an alert requires an explicit false-alert correction in the same authority action; it cannot disappear silently.

## 11. Shelter eligibility and navigation

Only approved authorities add or maintain shelters. Tourists can flag incorrect details for review but cannot change official status.

Each shelter shows name, address/point, maintaining authority, Open / Closed / Full / Unknown status, last confirmation time, optional capacity/remaining spaces, accessibility information, available facilities, contact, and any access instructions. Unknown capacity and unknown facilities are labeled, not treated as zero or available.

An automatic recommendation requires all of the following:

1. Open status confirmed within the last two hours, including an authority's fresh reconfirmation that capacity is not Full.
2. Within 50 km of the user's latest usable Indian location.
3. Outside current official, app-assessed, and unverified reported hazard areas. The default is cautious exclusion; authority-published information can explicitly establish a shelter as usable within a wider warning area and record why.
4. No known closure or explicit authority restriction on accessing that shelter.
5. No applicable authority instruction to stay put, avoid travel, or go to a different named shelter.

Unknown accessibility does not equal accessible. If the user selects “Step-free access needed” in shelter filters, unknown or unsuitable accessibility is excluded from automatic selection.

Choose the eligible shelter with the shortest straight-line distance and label that distance approximate; this is not route length. Break equal distances by freshest confirmation, then shelter name. Refresh the user's location and shelter status before navigation where possible. If location is older than 15 minutes, show the age and require location refresh for a personalized nearest recommendation; shelter browsing remains available.

When an authority names a destination or orders shelter-in-place, show that instruction first. Do not replace it with generic “Go to the nearest shelter.” If the named shelter has a conflicting closed/hazard status, show the conflict and the official contact prominently; do not silently send the user elsewhere or call the destination safe.

The navigation button opens Google Maps to the shelter point. Explain in one short message that its route may not include the app's hazard reports and that local closures and authority instructions take priority. The app does not claim to calculate or guarantee a safe route. If Google Maps is unavailable, show the address, coordinates, contact and Copy destination instead.

If no eligible shelter is found, say “No currently confirmed suitable shelter nearby.” Show applicable official instructions, official contacts, and other shelters with their exclusions and timestamps. Do not automatically direct the user to a closed, full, unconfirmed, or potentially affected shelter.

If a recommended shelter becomes unsuitable, remove its recommendation immediately, explain the change, and offer the next eligible shelter if one exists. For an active emergency this is a material alert update. Following navigation or dismissing an alert never reserves a place or proves the tourist arrived.

## 12. Multilingual instructions

All essential UI, banners, report choices, notification summaries, canned instructions, empty/error states and contact labels support the six confirmed languages. User-generated text is shown in its original language with an optional translation; it is not represented as official text.

For official notices and authority instructions, preserve:

- Place and shelter names, retaining original spellings alongside a transliteration if needed.
- Severity, dates, times/timezone, numbers, distances, contact numbers and links.
- Obligations versus suggestions, deadlines, evacuation orders, negations and prohibited actions.
- Issuing authority, original notice, and the revision to which the translation applies.

Display “Translation” explicitly; machine translation is not authority-approved unless an authority supplied or approved that exact version. Use an official provided translation when available. A changed original invalidates its old translation immediately; never show the old translated instruction as the current revision.

Emergency delivery must not wait indefinitely for translation. If a complete trustworthy translation is unavailable, show a prepared short warning in the preferred language, accurate known hazard/location/source details, the original notice, and “Full translation unavailable.” Do not invent protective instructions or present a partial translation as complete. Known official phone numbers and place names remain readable.

Changing language affects the entire UI, future alerts and visible cached content where translations are available. It does not repeat an emergency sound. Already delivered device notification text may retain its earlier language; opening it shows the current preference.

## 13. Screen-by-screen tourist behavior

### Map — main screen

- Centre on live or explicitly aged last known location; distinguish their markers.
- Show active incidents of every verification status, approximate hazard areas, official warning areas, and shelters.
- Unverified incident areas use a visibly uncertain/dashed treatment; official, corroborated and app-assessed labels are distinct.
- Default local range is 25 km; users can pan/zoom within India, with incidents displayed for the viewport. A broad official area is still shown if it overlaps the viewport.
- Provide filters for hazard, verification, active warnings and shelters; a separate opt-in stale-report layer. Defaults include all active incident types and verification states.
- Tapping a marker opens a summary then its detail screen. Dense overlapping markers remain selectable through a grouped list.
- Show last refresh, location freshness, active-alert status, and offline status.
- Keep Report incident visible. If its location requirements are unmet, explain the required refresh.

### Incidents list

Default to active incidents within 25 km sorted by approximate distance from the current/last usable location, as requested. Each row shows hazard, locality, distance and location age when relevant, verification, severity/unknown, emergency label if applicable, recent witness count and last observation time.

Provide an active emergency section above the distance-sorted list, filters matching the map, and radius choices of 5, 15, 25, or 50 km. “No nearby incidents” does not say “No danger.” Stale/archive views are separate and labeled.

### Incident detail

Show description, hazard location/area, approximate radius or official footprint, activity lifecycle, verification, emergency status, source, timeline, observations, current and total witnesses, Jev severity/confidence with definitions, assessment time, official notices/originals/translations, and evidence freshness/conflicts.

Offer eligible corroboration, report a related observation, flag for review, and applicable shelter/contact actions. Explain why a disabled corroboration action is unavailable. Contributor details remain anonymous. Every correction/end links to the earlier warning.

### Shelters list/detail

List nearby shelters within 50 km by approximate distance, including ineligible shelters with status and reason. Keep the nearest eligible recommendation separately prominent. Provide status, step-free access and distance filters. A list may contain shelters even when none qualifies for the automatic recommendation.

Detail shows all maintained information, timestamps, authority and current hazard exclusions. Navigation uses the rules in section 11, including offline and missing-Google-Maps fallbacks.

### Active alerts and history

The alert centre includes all current location-relevant alerts and previously received alerts for 30 days. Display dismissals, revisions, withdrawn emergencies and corrections without treating dismissal as resolution. Cached items retain their original issue/update times.

### Settings and emergency help

Include language, private profile details, permission status/actions, last location update, offline area management, notification/sound status, shelter accessibility preference, Help/abuse appeal, sign out where applicable, and profile deletion.

Emergency help shows authority-maintained national/state/local contacts appropriate to the current or last known area, with purpose, source and last confirmed time. A Call button opens the device dialer; it does not silently call, send an SOS, dispatch rescue, or send medical details. Optional personal emergency contacts appear only to the tourist and never become public emergency-service contacts.

## 14. Authority mobile workflows

Authority entry requires an approved account and location gate. Show the organization and jurisdiction throughout. Provide Overview, Incident review, Shelters, Contacts, and Chat moderation.

### Overview and review

Prioritize active emergencies, conflicting official instructions, pending assessments, stale emergency assessments, flagged incidents, and ordinary new reports. Filters include jurisdiction, hazard, severity, verification, lifecycle, and age.

An incident review shows the same underlying evidence as tourist detail plus moderation history. Actions are Verify, Leave unverified, Change hazard/severity/affected area, Issue instruction, Declare emergency, Suppress automatic escalation, Merge, Reject, and Resolve. Each change records actor, organization, reason, and time. Verification alone does not notify users; declaration does.

Before a declaration or material update, show a review sheet containing source, original and translated instructions, affected area, severity, expiry/review time, and estimated eligible recipient count if available. The authority confirms the actual change. Declaration is published immediately after confirmation; Jev does not delay it.

Declare/update requires a short instruction and review deadline, default one hour and no more than 24 hours. Review deadline means confirmation is overdue, not that the emergency has safely ended. Show overdue notices to authorities and tourists appropriately. Resolving or withdrawing requires a reason and sends the correction/end behavior in section 10.

Authorities may correct app interpretations of official feeds, but cannot rewrite the original external notice or claim its issuing authority cancelled it. Their differing local instruction is a separately attributed notice. Two contradictory current authority instructions are shown with sources and an instruction to contact the responsible authority; the app does not synthesize a new order.

### Shelters and contacts

Create/edit/reconfirm status and capacity, mark closed/full/unknown, add accessibility/facility information, and archive records with reason. Show a preview before saving. Changes affect tourist eligibility immediately after successful publication.

Contacts require name, purpose, jurisdiction, number, issuing/maintaining authority, and last confirmation. Over 30 days since confirmation displays “Contact not recently confirmed” but retains the number. Removing or correcting a number updates the app's cached version on the next successful synchronization.

### Offline authority actions

Authorities can view previously saved information and prepare drafts offline. Emergency declarations, resolutions, moderation actions, and shelter status changes do not become official offline. On reconnection show the current record and require an explicit publish confirmation, so an outdated draft never silently overwrites a newer emergency instruction.

## 15. Nearby chat

Chat is a location-scoped stream, not one permanent group per city. Each message has a fixed origin, send time, source alias/authority badge, and expires 24 hours after successful publication.

- A user with an eligible current Indian chat position receives messages whose origin is within 15 km of that position. Nearby is determined from the message's original point, not the sender's later movement.
- Users entering that radius can see unexpired messages with their original timestamps. Moving out removes them from the current local stream; cached history is not misrepresented as presently nearby.
- Sender location is privately used for eligibility, but public display is only an approximate locality. Do not display precise coordinates, a live person marker, personal name, health data, emergency contact, or a persistent travel trail.
- Show chronological order, source, locality and age. Mark all tourist messages “Community message — unverified.” Authority messages identify the organization.
- Messages are plain text up to 500 characters. No media, direct messages, live location sharing, arbitrary clickable links, or chat attachments in the first version.
- Limit tourists to five messages per minute and 30 per hour; show a rate-limit notice. Authorities can post announcements within their jurisdiction using the same 15 km origin behavior.
- Chat is never an official emergency declaration channel. An authority can link a real incident/alert using an in-app reference; tourist chat claims do not independently count as incident witnesses or trigger Jev. Offer Report incident for a structured observation.

### Moderation

Provide report reasons: dangerous misinformation, impersonation, harassment, spam, or exposed personal data. One report per user per message. Reports enter the jurisdiction's authority moderation queue; a high report count alone is not proof that a message is false and does not suppress it automatically.

An authority may hide a message with a reason, restrict chat posting for 24 hours, or escalate account abuse to the operator. Repeat restrictions require another recorded action. Hidden messages leave a “Removed by moderator” placeholder, and the sender sees the reason and one appeal action. Users can mute an alias locally; muted community posts no longer appear for that user, but official alerts remain available.

An authority can post a sourced correction linked to the affected incident. Chat moderation is not assumed to be instantaneous. New reports are visible to the moderation queue immediately when online, and chat UI never claims all messages are reviewed.

Expiry removes the message from live and cached tourist streams. Moderation evidence remains private for seven additional days, then is deleted unless attached to an active appeal, which is retained until resolved plus seven days.

### Chat location loss and offline

When the five-minute chat fix expires, label the stream “Location needs refresh,” disable new posting and new local message delivery, and allow reading already loaded content with its age. Do not claim a stale position defines the user's current neighborhood.

Offline, display only previously loaded, unexpired messages with Offline and Original send time. A draft may be saved, but is not queued for automatic publication. On reconnection, refresh location, ask the user to send again, and assign the actual new send time/location. Do not publish yesterday's travel message in a different neighborhood silently.

## 16. Offline behavior and synchronization

Offline mode means essential downloaded information remains usable. It cannot mean receiving new warnings, current chat, or live shelter capacity without a connection.

The yellow banner reads: “Offline — not receiving live alerts. Viewing cached information.” Show the last successful synchronization time and per-item last updates. Tapping it opens offline details and pending submissions. Do not use the offline banner as the only stale-data indication.

### Downloaded area

Automatically retain the current 25 km area, overlapping official warning areas, shelters/contacts within 50 km, recent incident detail and translations, active received alerts, and a usable downloaded map for the local area. Refresh when online and when the user moves to a new area. Allow two additional Indian local-area downloads from Settings while physically inside India.

If a download is incomplete, say what is missing; never label a partial map/translation pack as fully ready. Users can remove saved areas, except active received emergency information stays available until ended or aged out of the 30-day history. If the user is offline beyond the saved map area, show coordinates and cached list/contact content instead of blank unexplained map tiles.

### Available offline

- Read cached alerts, originals, translations, incidents, shelters and contacts with age labels.
- Use local location when available to show approximate distance to cached points.
- Read previously loaded chat subject to expiry and save an unsent draft.
- Edit private profile and language preference, using downloaded language content.
- Create and queue a tourist report or corroboration with a qualifying locally captured position and the actual observation time.

### Queued tourist submissions

Show “Saved on this device — not submitted; nobody else has been notified.” A local provisional incident detail is marked Pending submission and is never public or counted by Jev until received. Allow edit/cancel before sending.

On reconnection, submit observations no older than 24 hours exactly once with their original captured time/position and the actual receipt time. Do not update an old observation to Now. Corroboration proximity uses the recorded observation fix, and witness freshness uses observed time, so old queued evidence cannot pretend to be recent.

If the incident was merged, attach to the surviving incident. If resolved/rejected/expired, retain the contribution as a pending draft and explain that a new current report is needed. Observations over 24 hours stay as local drafts requiring review rather than being silently published. If the user's current country is known to be outside India, hold queued submissions until the India entry gate is passed again.

### Reconnection

Refresh active alerts, corrections, official-source freshness, shelter status and user location before labeling information Live. Prioritize newly relevant active emergency instructions. A missed alert that has already ended is history, not a new emergency sound. Show overdue corrections to an earlier received warning.

External Google Maps navigation, phone calls, translations not downloaded, and map areas not saved may depend on other device services. Provide cached destination/contacts and an honest unavailable state. Never promise an offline route calculation or call delivery.

## 17. Privacy, retention, and control

- Require only name and necessary location permissions. Optional profile information can be removed independently.
- Keep the latest usable location and its time/accuracy for eligibility; do not maintain a user-visible or authority-queryable background travel history. Delete an inactive last location after 24 hours without a new update; earlier positions are replaced as updates arrive.
- Incident observation points/times remain part of the incident evidence and are separate from ongoing background location. Explain this before submission.
- Public incident history is retained for twelve months to support the requested historical context. Archived history preserves event/source information and generated aliases, not personal names or medical details.
- Alert history is 30 days. Chat follows its 24-hour visibility and seven-day moderation retention rules.
- Show a profile deletion action and explain its effect before confirmation: profile, optional medical/contact data, current location and active device delivery association are removed; published incident evidence and authority audit records remain anonymized for their stated retention. Pending local submissions and chat drafts are cleared.
- Signing out stops location updates and notifications associated with that profile on that device, and clears private local profile data. The sign-out screen explains this consequence.
- No tourist data is sent to emergency contacts automatically. No “I'm safe,” SOS dispatch, family tracking, or rescue-management workflow is implied.

## 18. Scenario-based acceptance criteria

The coding agent must demonstrate these observable outcomes. These are behavior checks, not a prescribed technical test framework.

| Scenario | Required outcome |
| --- | --- |
| First launch outside India | Language and location gate are available; onboarding and app content are blocked. |
| First launch with denied foreground permission | Blocking permission screen; no map access. |
| Background permission denied | Full foreground app works; reduced tracking/alert warning is visible. |
| Notification permission denied | Onboarding continues; in-app alerts work; delivery limitations are clear. |
| Tourist reports a flood | Unverified/pending detail opens; other tourists receive no alert yet. |
| Tourist taps corroboration repeatedly | One independent witness; immediate updates are accepted without a cooldown. |
| Corroboration from too far away | Disabled with explanation; new local observation remains possible. |
| Ten old reports versus one new report | Recent and total counts differ; old reports do not form a fresh evidence cluster. |
| Jev qualifies with sufficient probability | Automatic area-targeted app-assessed emergency, without authority approval. |
| Jev is uncertain or down | Incident remains visible and pending/unqualified; no new tourist emergency notification. |
| Jev says sunny but recent upstream rain exists | Context retains both facts; sunshine is not an automatic rejection rule. |
| Authority records an unconfirmed claim | Verified organization badge, Unverified incident content. |
| Authority declares emergency while Jev is down | Official emergency publishes immediately. |
| Feed contains a test or irrelevant same-state alert | No public emergency escalation from that notice. |
| User enters an ongoing emergency area | First relevant alert appears using fresh location eligibility. |
| User's location is 45 minutes old | No new personalized targeting; refresh warning and cached access remain. |
| User dismisses an alert | Yellow banner remains while exposure is active; reopening is silent. |
| Two active emergencies overlap | Both remain accessible; overlay order follows severity/source rules. |
| More witnesses arrive without changed instructions | Detail updates without another emergency sound. |
| Official instruction changes | A new revision is visible; old translation is invalidated; urgent action change is re-alerted. |
| Authority says stay indoors | No generic go-to-shelter instruction replaces it. |
| Nearest shelter is full or in a hazard zone | Excluded from automatic recommendation; reason visible. |
| Every nearby shelter is unsuitable | No confirmed suitable shelter message, official instructions and contacts. |
| Google Maps is absent | Address/coordinates/contact and Copy destination remain available. |
| Translation fails | Timely prepared-language warning plus original notice; no invented translation/instruction. |
| Tourist loses connection | Cached map/content, offline banner, sync/item timestamps. |
| Tourist reports offline | Clearly pending local submission; no public witness/alert until received. |
| Old queued report reconnects | Original observation time retained; no false recent-witness increase. |
| Authority edits a shelter offline | Draft only; reconnection requires review and explicit publication. |
| User enters chat within 15 km of a message origin | Unexpired message appears with original time and approximate locality. |
| Sender travels away after posting | Message eligibility remains anchored to its original point. |
| Chat reaches 24-hour expiry | Message disappears from live/cached tourist streams. |
| Message is reported or removed | Moderation queue receives report; removal has reason/placeholder/appeal. |
| App is offline when an alert is cancelled | Cached warning stays aged; genuine correction appears on synchronization. |
| Feed expires or disappears | No automatic all-clear. |
| Profile is deleted | Private profile/current location/device association removed; retained public evidence is anonymous. |

## 19. Completion and exclusions

Done means both roles can complete their full workflows; every confirmed language works for essential UI and emergencies; geography/permission gates work; Jev assessment and uncertainty outcomes are distinct; official notices have provenance and freshness; shelter selection follows eligibility; chat has geographic scope and moderation; offline information and pending submissions are honest; and all scenarios above have a visible outcome.

Demo data or simulated weather/alerts may support demonstration, but every simulated record and alert must carry DEMO. Do not show simulated conditions as live public information or silently substitute them for a failed source.

Outside first-version scope: pre-arrival/foreign-country use, SOS dispatch, rescue assignment, health-record sharing, family tracking, guaranteed safe routing, shelter reservations/check-in, media reports, chat media/direct messages, and more than six supported languages. This document does not choose the mobile framework, backend, maps provider for display, authentication mechanism, notification infrastructure, translation provider, or weather provider.

## 20. Research grounding

Reviewed 9 October 2026. These references inform capability boundaries, not claims of validated emergency performance.

- [TypeSafe Jev introduction](https://docs.typesafe.ai/introduction): state and bounded typed questions produce structured decisions; Jev does not generate prose. This informs the separate assessment, explanation, and translation behavior.
- [TypeSafe confidence documentation](https://docs.typesafe.ai/confidence): Choice/Score confidence summarizes the returned probability distribution; thresholds depend on the use case. This informs distinct probability/confidence labels and the explicit product cutoff.
- [System One Engine documentation](https://www.systemoneengine.com/docs/): System One exposes bounded Jev judgments, while the calling application retains action control. The product applies qualifying outcomes automatically under this plan.
- [NDMA SACHET CAP Feed page](https://sachet.ndma.gov.in/CapFeed) and [SACHET portal](https://sachet.ndma.gov.in/): official warning distribution and feed discovery. The plan requires actual published coverage, original notices, freshness, revisions and cancellations rather than state-name matching alone.

No cited source establishes that the selected Jev cutoff, hazard radii, freshness intervals, or shelter freshness rule are operationally validated for emergencies. They are explicit prototype behavior defaults, to be changed only through a deliberate product revision.

### Confirmed authority onboarding decision — 2026-10-10

The user chose a backend comma-separated authority email allowlist. Verified Google accounts matching that list receive the configured scoped authority membership automatically; other users remain tourists. Agency/jurisdiction enforcement, audit history and DEMO/LIVE separation still apply. Email configuration and setup are documented in docs/api-setup.md.
