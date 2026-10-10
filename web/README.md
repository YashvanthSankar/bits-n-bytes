# GudTour landing

Standalone static site. All landing source and public assets live in `web/`; it does not import, modify or expose the Expo app, Convex session or private environment files. No dependencies, build step, remote fonts or analytics.

## Preview

From this folder: `python3 -m http.server 4173 --bind 127.0.0.1`

Open http://localhost:4173. Deploy **only `web/`** to any static host, not the repository root. No publication has been performed.

## Downloads

Set `ios` and `android` in `downloads.js` to the real public HTTPS release URLs. They start at `null` because release artifacts/access are not verified. Missing/invalid links remain visibly pending and non-clickable. There are no fake store links. Keep any credentials out of this public file. Verify clean-device access before publication.

## Design and content

- Shares the light app palette from `src/theme/tokens.ts`: warm off-white, ink, cobalt, muted green-grey; system sans and floating rounded native-style surfaces.
- One concise hero, actual iOS development screenshot, two download actions, three short ideas and a privacy/safety footer. No fabricated testimonials, safety scores, live notices or availability.
- `assets/app-preview.jpg` is a resized development screenshot from `tmp/ios-fullscreen-map-light.png`, with simulated location/data and no private profile details. It retains the map attribution and is visibly labeled as development, not a release or live emergency.
- Screenshot is decorative presentation around an actual captured screen; phone frame/compass logo are CSS/SVG. Do not describe the decorative compass as the released app icon.
- Plain semantic HTML, responsive CSS, keyboard focus, skip link, reduced-motion behavior and readable failure states for missing downloads.

Complete Q08 still requires public hosting, verified release links and release-capability checks; building this page alone does not complete that task.

## Verification — 2026-10-10

- Root TypeScript and Expo lint passed with the new standalone files present. Existing unrelated mobile/backend work was preserved.
- Playwright Chromium rendered the exact static files at 1440, 768, 390 and 320 px. Image loaded, no horizontal overflow, no browser JavaScript errors; screenshots visually reviewed at desktop/mobile widths.
- Axe WCAG A/AA checks reported zero violations at those four widths. This is an automated check, not comprehensive assistive-technology certification.
- Keyboard skip link, reduced-motion rendering, absent release state, configured HTTPS test links and rejection of script/credential-bearing URLs passed. Test URLs were only browser fixtures, not written to public config.
- Local HTTP server responds 200; Chromium test used intercepted static-file responses because direct localhost browser navigation timed out. Preview: http://localhost:4173. No hosting or real-download verification is claimed.
