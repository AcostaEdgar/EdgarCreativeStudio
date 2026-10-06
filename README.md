# Edgar Studio

Photographic portfolio for edgaracosta.com. A full-screen photographic entrance flows into a dense four-column contact sheet (two columns on phones). Each image opens uncropped. Bold studio typography, restrained scroll depth, and the halftone cursor frame the work. Contact and Studio Login are in the footer.

## Run and validate

Run `pnpm install`, then `pnpm dev`. Validate with `pnpm lint`, `pnpm typecheck`, and `pnpm build`.
Run `node scripts/admin-smoke.mjs` for the isolated local admin lifecycle test. It creates temporary test data, restores prior local state, and never changes hosted credentials or content.

## Content and owner access

The October 2026 selection contains 111 photographs from Edgar's supplied Desktop/Portfolio folder. High-quality WebP copies, up to 3200px on the long edge, live in `public/portfolio`; source originals remain untouched. Filenames are never used as artwork titles.

Open `/admin` using the existing password. The workspace supports:
- Multiple image uploads, individual descriptions and optional titles, progress, and retry without repeating completed uploads.
- Image metadata editing, replacement, removal, and ordered positions.
- One full-screen hero photograph, published by selecting it.

Hosted uploads go directly to Vercel Blob (multipart for large files); the admin registers each successful upload separately. Optimistic ETag writes prevent concurrent changes from silently overwriting one another. Every public request reads current collection state. Remove clears both the portfolio and opening-image references. Removing from the website retains the original Blob file, allowing manual recovery rather than irreversible destruction.

**Storage:** `studio/artist-state-v2.json` in the existing public Blob store. The old `studio/state.json` is retained separately for recovery and is not used by the new site. Until the new state is first saved, the site uses committed `content/portfolio.json`, `content/home-media.json`, and `content/writing.json` defaults. An intentionally empty saved collection remains empty; old defaults do not reappear.

**Authentication:** existing `ADMIN_PASSWORD_HASH` and `AUTH_SECRET` remain unchanged. Existing `BLOB_READ_WRITE_TOKEN` or `Blob2_READ_WRITE_TOKEN` is reused. Sessions remain signed, httpOnly, seven-day cookies. Locally, `ADMIN_PASSWORD` is supported; local state is kept in ignored `.artist-state.json` with atomic writes. Never commit credentials.

**Inquiries:** direct email to contact@edgaracosta.com and telephone +1 470 931 2900. Artwork inquiries include a link to the chosen image. No categories, biography, public writing section, checkout, or fabricated credentials.

## Deployment

GitHub `main` deploys automatically to the existing Vercel project `edgar-studio-publish`. Domain: edgaracosta.com. No new services or password changes are required. Retained legacy source components are not imported by the public routes; the site no longer loads Three.js or autoplay audio.
