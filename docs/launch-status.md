# Launch status — September 28, 2026

The immersive entrance and circular gallery remain the primary experience. This pass adds a fullscreen, keyboard-accessible menu, phone-sized controls, previous/next gallery visits, phone composition fixes, metadata, sitemap, robots rules, and Vercel build configuration.

## Verification

- TypeScript and ESLint pass.
- Production Webpack build passes using a separate `.next-test` directory, preserving the running development server.
- Chrome at 390 × 844: homepage and gallery have no horizontal overflow; menu destinations and artwork detail dialog open successfully.
- Admin state and uploads now read current JSON from disk instead of a stale imported copy. Gallery sizes normalize cm, inches, and mm. Display scale remains bounded for the room; this is not an architectural measurement tool.

## Publishing dependencies

- GitHub connector authenticates as AcostaEdgar but exposes no repositories and no repository-creation action. Browser GitHub requires sign-in. Create private `edgar-creative-studio`, then push this branch and configure the production branch in Vercel.
- Vercel browser requires sign-in. Import the repository as Next.js, using `pnpm build`. Current repository defaults include artwork and media.
- Wix account tools returned internal errors. DNS has not been modified. Once the Vercel preview is verified, add apex and www in Vercel, then apply the exact provided A/CNAME records in Wix. Preserve all MX/TXT email records.
- Hosted admin editing is deliberately disabled while storage is local-only. Connect durable storage and owner authentication before enabling writes on Vercel. A deployed filesystem is not a persistent media library. The local development workspace remains usable.
- Production login never falls back to the local demo password. No private environment files or legacy account database are tracked.

## Remaining launch work

Connect persistent storage and owner sessions, test a real upload/edit/delete roundtrip on a Vercel preview, verify domain HTTPS and email preservation, and run Lighthouse on the actual hosted mobile site. No award ranking or performance score is claimed by these local checks.
