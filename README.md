# Edgar Creative Studio

Personal portfolio and creative studio for Edgar Acosta. The immersive entrance, motion interlude, aligned tile field, and interactive 3D showroom are preserved. `/admin` is the local owner workspace for adding work, updating the entrance hero, and saving a writing sample.

Run `pnpm install`, then `pnpm dev`. Preview at http://127.0.0.1:3000. Validate with `pnpm lint`, `pnpm typecheck`, `pnpm build`.

Brand settings: `lib/brand.ts`. Published Edgar portfolio assets: `public/media`. Content: `content/portfolio.json`, `content/home-media.json`. Twelve previously published works were migrated; camera filenames were replaced by Untitled + year. Original files and the private legacy database remain excluded from Git and unused by the app. The homepage uses the restored tilted-card entrance, scroll-driven motion section, aligned tile field, and the 3D showroom at `/gallery`.

The restored ink-motion section is local and can be replaced with Edgar-owned footage later. Contact email: `contact@edgaracosta.com`.

For local admin, open http://127.0.0.1:3000/admin and use `edgar-local`, or set `ADMIN_PASSWORD` in `.env.local`. The local session is intentionally in-memory and resets when the dev server restarts. Multiple selected image files are optimized to WebP, added to the portfolio and collage, and can be added to the four-image entrance hero. The writing sample is stored in `content/writing.json`. The production version should replace this local filesystem adapter with owner authentication and Vercel Blob before launch.

## Deployment (owner setup)

Connect a GitHub repository, import it in Vercel, and enable automatic Preview deployments for pull requests. No Git remote or Vercel project is configured in this checkout yet.

For subsequent phases: connect Vercel Blob; add ADMIN_EMAIL (or ADMIN_PASSWORD_HASH), AUTH_SECRET, RESEND_API_KEY, CONTACT_TO_EMAIL, BUTTONDOWN_API_KEY, TURNSTILE_SITE_KEY, TURNSTILE_SECRET_KEY, NEXT_PUBLIC_SITE_URL=https://edgaracosta.com. Keep values out of Git. Add edgaracosta.com and www with www redirected to apex, verify the sending domain in Resend, and enable Vercel Analytics. These integrations are not implemented in Phase 1.
