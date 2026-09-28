# Phase 1 — Edgar Creative Studio

Local implementation verified September 28, 2026. Preview: http://127.0.0.1:3000/

## Changed

- Replaced the project brief in AGENTS.md and created branch `codex/edgar-studio-phase-1`.
- Centralized the brand in `lib/brand.ts`; updated the homepage, navigation, footer, metadata, favicon, and not-found page.
- Removed public accounts, social features, multi-artist pages, local authentication/upload endpoints, museum/demo assets, and Supabase dependencies.
- Migrated the 12 published works from Edgar's account into optimized local WebP assets. Original uploads and the private database were preserved, remain ignored by Git, and are not used by the application.
- Reused the tilted-card Three.js hero, theme toggle, pause control, skip link, artwork enlargement, and previous/next controls. Retained the circular room component for optional future project views.
- Added permanent redirects for all known former routes and their nested paths.
- Preserved a feature-video slot and section, hidden until Edgar-owned footage is supplied. Removed the previous third-party footage.
- Navigation currently targets homepage sections. Dedicated pages, forms, newsletter, and Media Manager belong to subsequent phases.

Removed legacy files have a recovery copy outside the repository at `/private/tmp/edgar-phase1-legacy-backup`. This temporary backup is not a durable archive and does not ship.

## Verification

- Production build, ESLint, and TypeScript passed.
- Home returned HTTP 200; all 12 portfolio assets returned HTTP 200.
- All 64 checks of configured removed routes and nested paths returned HTTP 308 to `/`.
- Browser smoke checks: artwork next/enlarge/Escape, mobile menu, section navigation, theme switch, and pause toggle worked. Keyboard focus on the 3D hero had a visible solid outline.
- Tested 1440 × 900 and 390 × 844 viewport layouts with no horizontal overflow or broken loaded images. Browser console had no errors during the home interaction checks.
- Lighthouse scores and a complete keyboard-only audit have not been measured. Inquiry/admin smoke tests are deferred because those routes are not implemented in Phase 1.

## Screenshots

| Changed page | Desktop 1440 × 900 | Mobile 390 × 844 |
| --- | --- | --- |
| Home | [Desktop](screenshots/home-desktop.png) | [Mobile](screenshots/home-mobile.png) |
| Not found | [Desktop](screenshots/not-found-desktop.png) | [Mobile](screenshots/not-found-mobile.png) |

Additional light-mode portfolio review: [Mobile work section](screenshots/work-mobile-light.png).

## Outstanding deployment gate

No Git remote, base commit, or Vercel project is configured in this checkout. A pull request and Vercel Preview URL were not created. Phase 1's local changes are ready to review, but its preview-deployment completion criterion remains pending. A GitHub repository destination and connected Vercel project are needed.

## Needed from Edgar

Final headline/subline; bio and portrait; three first projects; one essay; confirmed contact email, social links, services, and Atlanta/Bogotá wording; owned video if the motion section should be active. Review the migrated works' titles and credits before public launch.

## Next step

Connect the repository and obtain the Phase 1 preview. Then, in the next task, execute Phase 2: work/project pages, writing, about, inquiry, newsletter, and metadata. Stop here as requested by the phased brief.
