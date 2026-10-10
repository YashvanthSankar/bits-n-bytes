# Expo Go authentication callback fix — 2026-10-10

Login now uses Expo Linking's runtime URL for Expo Go and preserves gudtour://auth/callback for installed builds. The same callback goes to Convex Auth redirectTo, the browser session and the exact authorization-code parser. Router callback handling also validates the originating URL before sharing the deduplicated exchange.

Convex auth accepts the native callback or an exact comma-separated AUTH_EXPO_GO_REDIRECTS entry. Wildcards, credentials, foreign paths, queries and fragments are rejected. Browser login remains disabled; Google's registered redirect stays the existing Convex HTTPS endpoint.

Development Metro was restarted in Expo Go LAN mode; its exact advertised callback was configured privately in the Denoise Labs GudTour development deployment. When another developer's Metro host/port changes, add its exact exp://HOST:PORT/--/auth/callback to AUTH_EXPO_GO_REDIRECTS on that same deployment. Run npx expo start --go --lan; do not register exp:// URLs in Google Cloud OAuth.

Verification: strict TypeScript, lint and 204 tests/30 files pass, including exact Expo Go callback selection, foreign host/port rejection and unchanged logout navigation. Convex deployment passed. Android Expo Go end-to-end sign-in remains for the user's separate device test; no claim of native device acceptance.
