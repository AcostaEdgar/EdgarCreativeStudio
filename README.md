# Edgar Creative Studio

Personal portfolio and creative studio for Edgar Acosta. The immersive entrance, motion interlude, aligned tile field, and interactive 3D showroom are preserved. `/admin` is the local owner workspace for adding work, updating the entrance hero, and saving a writing sample.

Run `pnpm install`, then `pnpm dev`. Preview at http://127.0.0.1:3000. Validate with `pnpm lint`, `pnpm typecheck`, `pnpm build`.

Brand settings: `lib/brand.ts`. Published Edgar portfolio assets: `public/media`. Content: `content/portfolio.json`, `content/home-media.json`. Twelve previously published works were migrated; camera filenames were replaced by Untitled + year. Original files and the private legacy database remain excluded from Git and unused by the app. The homepage uses the restored tilted-card entrance, scroll-driven motion section, aligned tile field, and the 3D showroom at `/gallery`.

The restored ink-motion section is local and can be replaced with Edgar-owned footage later. Contact email: `contact@edgaracosta.com`.

## Owner admin (`/admin`)

- **Local:** set `ADMIN_PASSWORD` in `.env.local`. Without a Blob token, uploads are optimized to WebP in `public/media` and content is written to `content/*.json`.
- **Hosted (Vercel):** requires `ADMIN_PASSWORD_HASH` (bcrypt), `AUTH_SECRET`, and a connected **public** Vercel Blob store (`BLOB_READ_WRITE_TOKEN`, or `Blob2_READ_WRITE_TOKEN` for a store connected with that prefix). Images upload straight from the browser to Blob; portfolio, hero, and writing state live in `studio/state.json` in Blob. The home page and showroom read that state and are revalidated on every publish. If the state file does not exist yet, the committed `content/*.json` defaults are shown.
- Sessions are HMAC-signed cookies (7 days); login is rate-limited.

Generate a password hash locally:

```
node -e "require('bcryptjs').hash(process.argv[1],12).then(console.log)" 'your-password'
```

## Deployment

GitHub `main` is the production branch; Vercel deploys it automatically. Keep secrets in Vercel's environment variables, never in Git. Add `edgaracosta.com` and `www` in Vercel (www redirects to apex) and preserve existing MX/TXT email records at the DNS provider.
