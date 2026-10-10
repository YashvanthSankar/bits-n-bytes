# GudTour API and teammate setup

Updated 2026-10-10. Real credentials are in the ignored root `.env.local` (mode 600). Copy it privately to trusted teammates; Git contains only `.env.example`. Backend secrets belong in Convex, not public mobile variables or app config extras.

| Integration | Local variables | Verified status |
| --- | --- | --- |
| Team Convex | CONVEX_DEPLOYMENT, EXPO_PUBLIC_CONVEX_URL, EXPO_PUBLIC_CONVEX_SITE_URL | Denoise Labs / GudTour / basic-newt-690; schema and core functions deployed. |
| Google OAuth | AUTH_GOOGLE_ID, AUTH_GOOGLE_SECRET | Existing agentslash GCP project; native callback and one real Google session/profile confirmed on iOS. Android/restore/sign-out checks pending. |
| Android Maps | GOOGLE_MAPS_ANDROID_API_KEY | Dedicated GudTour Android Development key; SDK enabled, project billing enabled, package/certificate/API restrictions verified; native metadata generated. Android map rendering still pending. |
| iOS map | No API key | Apple Maps rendered in the iPhone 17 Pro simulator. |
| Google Translation | GOOGLE_TRANSLATION_API_KEY, GOOGLE_TRANSLATION_API_VERSION=v2, GOOGLE_TRANSLATION_PROJECT_ID | Dedicated backend key restricted to translate.googleapis.com; real English-to-Tamil request returned 200. Key configured in team Convex development. |
| AccuWeather | ACCUWEATHER_KEY, ACCUWEATHER_BASE_URL | Bearer authentication; real location lookup, current condition and 24-hour history returned 200; history contained 24 observations. Quota/license retention review pending. |
| Jev / OpenCode Zen | OPENCODE_API_KEY, JEV_MODEL, JEV_BASE_URL | Live Jev 1.13 Choice returned 200 with a selected label, confidence and probabilities keyed by label. Evaluation/failure tests and application use pending. |
| SACHET | SACHET_RSS_URL, SACHET_CAP_ENDPOINT | Public, no API key; real RSS/CAP/polygon XML inspected and CAP ETag 200→304 confirmed. See [provider contract](research/sachet-feed-contract.md). |
| Expo/APNs/FCM | Native build/EAS signing configuration; no invented general push API key | Foreground/background real-device delivery and judge-access signing pending. Simulator rendering is not evidence of background push delivery. |

## Maps restrictions and team builds

GCP project: `project-ba909057-8b45-4731-9b9`. Android package: `com.bitsnbytes.gudtour`. Development key accepts SHA-1 `5E:8F:16:06:2E:A3:CD:2C:4A:0D:54:78:76:BA:A6:F3:8C:AB:F6:25`, from the generated Android development keystore. A teammate/EAS/release build signed with a different certificate requires that certificate to be added to the appropriate key restriction before its map works. Keep production signing separate from the standard development certificate.

Maps keys are embedded in the native app and extractable; Android package, certificate and service restrictions provide protection. Apple Maps remains the iOS basemap. External Google Maps directions use app/web links and do not require enabling a paid routing API or claim hazard-safe navigation.

## Translation credential choice

GCP's `constraints/iam.disableServiceAccountKeyCreation` blocked a private key for the dedicated GudTour Translation Backend service account. The policy was preserved. Current implementation uses supported Cloud Translation Basic v2 API-key authentication, verified with a real request. The service account currently has the Translation User role but no issued private key and is unused. Advanced v3/glossaries remain a future option with an approved keyless credential flow; there is no usable GOOGLE_TRANSLATION_CREDENTIALS_JSON today.

Do not copy a developer gcloud refresh token into Convex. The Translation key is backend-only and restricted to its service. Provider credentials and configuration have been set on the Denoise Labs development deployment. Google OAuth signing material already lives in that deployment; teammates connecting to it do not need its private signing key in local mobile configuration.

## Run a teammate checkout

1. Clone the GitHub repository and privately copy `.env.local` to its root.
2. Run `npm ci`, then `npm run check`.
3. Have the project owner grant appropriate Denoise Labs Convex team access for backend CLI work; copying public deployment URLs does not grant dashboard or deployment permissions.
4. Run `npx expo prebuild --platform android` or `npx expo run:ios` for a native development build. Android Maps configuration changes require a native rebuild.
5. Run `npm start`. For a simulator-only loopback URL, use `REACT_NATIVE_PACKAGER_HOSTNAME=127.0.0.1 npx expo start --dev-client --lan`; Expo's localhost mode bound IPv6 while the simulator launch used IPv4 on this machine.
6. Keep backend-only keys out of EXPO_PUBLIC_ variables and app.config.extra. Never commit the private env file or paste it into a public issue.

Native Google callback: `gudtour://auth/callback`. Registered Google Web OAuth redirect: `https://basic-newt-690.convex.site/api/auth/callback/google`. The existing GCP project's shared consent branding also applies to this client.

## Authority emails — 2026-10-10 user decision

Authority access is configured on the backend using a comma-separated exact email allowlist. In the ignored root `.env.local`, set:

```dotenv
AUTHORITY_EMAILS='first@example.com,second@example.com'
```

Then run from the repository root:

```bash
npm run authority:configure -- --demo
```

This provisions/reuses the clearly labeled **DEMO Chennai 50-km jurisdiction**, saves its `AUTHORITY_AGENCY_ID` and `AUTHORITY_JURISDICTION_IDS` privately, and applies all three settings to the selected Convex deployment. It does not grant LIVE government authority. For an operator-approved LIVE agency, set those two IDs explicitly and run `npm run authority:configure` without `--demo`.

Sign in with the listed Google account. Existing accounts should sign out and sign in once so Google email verification is recorded. Access refreshes on login/session restoration; Settings → **Refresh account access** retries it while signed in. No app role picker is needed. Addresses match after trimming/lowercasing; plus-addresses and dots are not rewritten. Removing an address disables its configured authority privileges; refreshing records the revocation. Operator revocation cannot be undone by app refresh. Backend checks still enforce assigned area, agency, audience and current India access. The list is never shipped as an `EXPO_PUBLIC_` variable or committed.
