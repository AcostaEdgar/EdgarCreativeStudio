# Edgar Creative Studio: Codex Rebuild Prompt

## Latest direction — October 6, 2026

The latest user correction supersedes the earlier editorial and immersive-room instructions below. Brand as Edgar Studio / Edgar Creative Studio, with bold original sans typography. One full-screen photograph follows a flowing loading entrance, then a dense four-column grid of 4:5 image tiles (two columns on phones). All portfolio images appear together, without category filters or public category labels. Clicking opens an uncropped full-screen viewer. Retain the optimized halftone cursor and subtle scroll depth, with reduced-motion support. No about page, artist slogans, services, or public writing section. Contact is email contact@edgaracosta.com and telephone +1 470 931 2900. Studio Login must remain clearly visible in the footer. One hero image can be selected in admin. Keep the existing password. Publishing is authorized.

## Earlier direction — October 6, 2026

Edgar explicitly superseded the September 28 immersive-studio direction. The site now represents Edgar Acosta as an artist and photographer: clean editorial presentation, high-quality uncropped photographs, restrained motion, warm paper typography, and an accessible image viewer. The 3D showroom, commercial agency positioning, autoplay music, and digital spectacle are no longer the public experience. Focus inquiries on signature portraits, spaces/interiors, one-of-one prints, artistic collaboration, and speaking. Use the newly supplied Desktop/Portfolio photographs; remove the older low-quality website images. Never publish camera filenames as artwork titles or invent credentials or exhibition histories.

Owner editing must support reliable batch uploads, metadata editing, reordering, hero selection, replacement, and deletion. Preserve existing password/authentication environment values. The editorial collection uses studio/artist-state-v2.json in Vercel Blob, leaving the previous state document recoverable; local editing uses ignored .artist-state.json. Seed content comes from content/portfolio.json and content/home-media.json. The public site renders current storage on every request. The user authorized rebuilding and publishing this version.

## Current direction — user correction, September 28, 2026

This correction supersedes conflicting visual and gallery instructions below. Preserve the original immersive homepage, scroll-driven 3D entrance, motion interlude, aligned edge-to-edge tiles with hover/touch reveals, and the full interactive circular showroom as the primary gallery experience. Adapt the established experience into Edgar's personal studio; do not replace it with a conventional portfolio layout. Keep gallery walking/navigation, artwork map, spatial/index switch, and detail views. Use Edgar's published portfolio in the tiles and showroom. The existing credited ink footage may remain as the restored motion treatment. Public account/platform features stay removed. Confirmed contact email: contact@edgaracosta.com. Future feature work must preserve this visual foundation.

> **How to use:** Replace the old `AGENTS.md` in the repo root with this file. Then run one task per phase: *"Execute Phase 1 from AGENTS.md."* Codex stops and reports after each phase.

---

## 0. What changed

The existing repo was built as **FeniStudio**, a multi-artist platform. It is now being converted into **Edgar Creative Studio**, the personal creative studio of Edgar Acosta, served at **edgaracosta.com**. This is a **refactor of the existing codebase, not a rewrite.** Keep the current visual system (dark palette, large grotesk type, mono labels, motion, pause-motion control, tilted card hero, 3D room component). Remove the platform features.

**The site has four jobs, in this order:**
1. Show Edgar's work (photography, painting, writing, design) so it looks like a serious studio.
2. Turn visitors into **project inquiries** (primary conversion).
3. Turn readers into **newsletter subscribers** (secondary conversion).
4. Later, credit Latin American collaborators who help deliver client work.

**Rules**
- Only Edgar can log in. There is **no public account creation** anywhere.
- No invented artists, no AI-generated "artist" work, no museum or public-domain demo artworks. Every image on the site is Edgar's, or a collaborator's with permission and credit.
- Content (text, work items, essays) is edited in code/content files by Codex. **The only in-browser editing is the Media Manager (§5)** for home-page media.
- Secrets never in git. Work on feature branches, one PR per phase, and each PR gets a Vercel Preview URL.
- End every phase with a report: what changed, desktop (1440×900) and mobile (390×844) screenshots of each changed page, anything Edgar must provide or decide, and the next step. Then stop.

---

## 1. Remove (Phase 1)

Delete the routes, components, data and copy for:
- `/join`, `/signup`, `/login` for the public, viewer/artist/gallery account types, and the "Join FeniStudio" button.
- `/discover`, `/following`, `/library`, follow/save features, and the discipline filter bar.
- All multi-artist "World" pages (`/[handle]`), including `/salvador-dali`, `/vincent-van-gogh`, `/claude-monet`, `/form-lab`, `/chroma-studio`, `/liminal-visions`, `/future-archaeology`, `/memory-archive`, `/other-terrain`.
- All files in `public/art/`, `public/worlds/`, `public/contemporary/` and any other non-Edgar imagery. **The Dalí images are copyrighted: delete them from the repo so they can never ship.** (Scrubbing git history isn't required.)
- Any "local workspace / stored on this machine" auth or upload code.
- Every string "FeniStudio", "Artist Worlds", and "Worlds within". Brand lives in one file, `lib/brand.ts`:
  ```ts
  export const brand = {
    name: "Edgar Creative Studio",
    byline: "by Edgar Acosta",
    domain: "edgaracosta.com",
    email: "contact@edgaracosta.com",
  };
  ```

Keep and reuse: design tokens, fonts, the tilted-card hero, the ink-motion video section, the pause-motion control, the skip link, the 3D circular room (as an optional view inside a project, never the default), the artwork viewer with prev/next.

Set up permanent redirects (308) from every removed route to `/`, so no old link returns a 404.

---

## 2. Site map (Phase 2)

```
/                  Home
/work              All work (grid, filterable: Photography · Painting · Writing · Design · Campaigns)
/work/[slug]       Project or piece: case study or single work
/writing           Essays and journal
/writing/[slug]    Essay page with newsletter signup at the end
/about             Edgar, the studio, how it works, collaborators
/start             Start a project (inquiry form)
/newsletter        Newsletter landing + archive link
/admin             Media Manager, Edgar only (§5)
```
Header: wordmark **Edgar Creative Studio** (small mono byline "by Edgar Acosta" under it on the home page only) · Work · Writing · About · **Start a project** (pill button). Keep the light/dark toggle.

Footer: newsletter signup, email, Instagram, LinkedIn, `© Edgar Acosta`, and "Atlanta · Bogotá" (placeholder; Edgar confirms).

---

## 3. Page specs

### 3.1 Home
1. **Hero:** keep the current tilted-card composition, but the cards come from the Media Manager's `hero` slot (1 video OR up to 4 images). Replace "WORLDS WITHIN." with a headline Edgar will finalize. Use this placeholder: **"STORIES, MADE VISIBLE."** Subline (placeholder): *"A creative studio for writing, design, and campaigns, rooted between Latin America and the U.S."* Two buttons: **Start a project** · **See the work**.
2. **Collage:** the tile field (current Discover grid styling) filled from the Media Manager's `collage` slot. Each tile has an optional caption and link (to a `/work/[slug]`, `/writing/[slug]`, or none). Varied sizes: a mix of 1×1, 1×2 and 2×1 tiles, laid out automatically from each image's aspect ratio. **No repeated "Edgar Acosta / Enter world" labels.** Caption appears on hover (desktop) or under the tile (mobile) only if one is set.
3. **Motion section:** keep the ink video section. Its video comes from the Media Manager's `feature_video` slot. Replace "FEEL SOMETHING DIFFERENT." copy with a placeholder line Edgar will edit.
4. **Services:** three columns, no prices yet. Placeholders: *Writing & Copy* · *Design & Web* · *Campaigns & Launches*. One sentence each, plus "Delivered with a network of Latin American artists and makers."
5. **Latest writing:** 3 most recent essays.
6. **Newsletter** block, then footer.

### 3.2 Work and project pages
- Content lives in `content/work/*.mdx` with frontmatter: `title, slug, category, year, client (optional), role, cover, gallery[], collaborators[] ({name, role, link}), summary, featured`.
- A project page shows: cover full-bleed, title, meta row (year · category · role · client), summary, then body (MDX) with images at natural aspect ratio, and a credits block listing collaborators.
- Single works (a photo or painting) use the existing artwork viewer: large image, title, year, medium, prev/next.
- **Fix titles:** never show camera filenames (e.g., "KJ11230"). If a title is missing, show "Untitled" plus the location/year, and log a warning in dev.

### 3.3 Writing
- `content/writing/*.mdx` (title, slug, date, dek, cover optional, tags).
- Reading column ~680px, serif headings, a newsletter signup at the end of every essay, and RSS at `/writing/rss.xml`.

### 3.4 About
- Portrait, a short bio (placeholder Edgar replaces), "How we work" (you work with Edgar directly, and specialists join as needed), and a Collaborators list (empty state is hidden until one is added).

### 3.5 Start a project
Form fields: name, email, company, what you need (checkboxes: Writing/Copy, Design, Website, Campaign, Other), budget range (Under $2k · $2–5k · $5–15k · $15k+ · Not sure), timeline, message, and how you found us. Honeypot + Cloudflare Turnstile. On submit: email Edgar via **Resend** and show a thank-you state with "I reply within 2 business days." If `RESEND_API_KEY` is missing, show an honest "Form not connected yet" message in dev and never fake success.

### 3.6 Newsletter
Use **Buttondown** (simple, supports custom domain, double opt-in, archive). One reusable `<NewsletterSignup />` component posts to Buttondown's API via a server action. Env: `BUTTONDOWN_API_KEY`. Consent line under the field: "One email when there's something worth reading. Unsubscribe anytime."

---

## 4. SEO & sharing
- `generateMetadata` on every page. Default title pattern: `{Page} · Edgar Creative Studio`.
- `opengraph-image` for home, each project, and each essay: image + title in site typography, no badges.
- JSON-LD: `Person` (Edgar), `Organization` (studio), `CreativeWork` (projects), `Article` (essays).
- `sitemap.ts`, `robots.ts`, canonical URLs on `https://edgaracosta.com`.

---

## 5. Media Manager (Phase 3): the only in-browser editor

**Purpose:** let Edgar swap home-page media without Codex: the hero images/video, the feature video, and the collage photos.

**Stack:** **Vercel Blob** for files and **Vercel Edge Config** (or a single JSON document in Vercel Blob, whichever is simpler) for the slot data. No database.

**Auth:** a single owner.
- `/admin` protected by **Auth.js (NextAuth) email magic link** restricted to `ADMIN_EMAIL` (env), or, if simpler, a passcode checked against `ADMIN_PASSWORD_HASH` (bcrypt) with an httpOnly signed session cookie, 7-day expiry, and rate-limited login.
- Every admin API route re-checks the session server-side. No other user can sign in; unknown emails are rejected with a generic message.

**Slots** (data shape):
```ts
type Media = { id: string; kind: "image" | "video"; url: string; poster?: string;
               width: number; height: number; alt: string; caption?: string; href?: string };
type Slots = {
  hero: Media[];            // 1 video OR 1–4 images
  feature_video: Media | null;
  collage: Media[];         // up to 40, ordered
};
```

**Admin UI** (reuse site styling, desktop-first, works on phone):
- Three sections (Hero, Feature video, Collage), each showing current items as thumbnails.
- **Upload** by drag-and-drop or file picker, with progress bars. Client-side upload directly to Vercel Blob (`@vercel/blob/client` `upload()` with a server `handleUpload` route that checks the session).
- **Reorder** by drag, **Replace**, **Remove** (confirm inline, not with a browser `confirm()` dialog), and edit **alt text, caption, link**. Alt text is required before saving.
- **Preview** button opens the home page in a new tab with the draft; **Publish** saves the slot JSON and triggers `revalidatePath('/')`. Keep the previous 5 published versions and offer **Undo last publish**.

**Media rules (enforced on upload):**
- Images: JPEG/PNG/WebP/AVIF, max 25 MB, long edge ≥ 1600px for hero. Serve through `next/image` with correct `sizes`. Never apply filters or crops to the stored file; cropping is display-only via `object-position` (let Edgar set a focal point by clicking the thumbnail).
- Video: MP4 (H.264) required, max 40 MB, ≤ 30 seconds recommended. The admin extracts a poster frame automatically (first frame via `<video>` + canvas) and stores it. Playback: `autoplay muted loop playsinline`, `preload="metadata"`, poster shown until it plays. Respect `prefers-reduced-motion` and the site's Pause-motion control (show the poster instead). On mobile data-saver (`navigator.connection.saveData`), show the poster only.
- Show a friendly warning if a file is too big, with the fix: "Export at 1080p, H.264, under 40 MB."

**Fallback:** if Blob/Edge Config env vars are missing, the home page reads `content/home-media.json` (committed defaults using Edgar's existing photos) so the site never breaks.

---

## 6. Deploy (Edgar does once; put in README)
1. Push repo to GitHub → Vercel "Add New Project" → import → deploy.
2. Vercel → Storage → create a **Blob** store (and **Edge Config** if used) and connect them to the project (this auto-adds env vars).
3. Add env vars: `ADMIN_EMAIL` (or `ADMIN_PASSWORD_HASH`), `AUTH_SECRET`, `RESEND_API_KEY`, `CONTACT_TO_EMAIL`, `BUTTONDOWN_API_KEY`, `TURNSTILE_SITE_KEY`, `TURNSTILE_SECRET_KEY`, `NEXT_PUBLIC_SITE_URL=https://edgaracosta.com`.
4. Vercel → Domains → add `edgaracosta.com` + `www` (redirect www → apex) and update DNS at the registrar. Optional: add `edgarcreativestudio.com` as a redirect to `edgaracosta.com`.
5. Resend → verify the domain (SPF/DKIM/DMARC) so form emails don't land in spam.
6. Turn on Vercel Analytics.

---

## 7. Quality bar (every PR)
- `lint`, `typecheck`, `build` pass; Playwright smoke test: home loads, the inquiry form validates, `/admin` redirects when logged out, and removed routes redirect to `/`.
- Lighthouse mobile on `/`, `/work`, and one essay: Performance ≥ 90, Accessibility ≥ 95, SEO ≥ 95. LCP < 2.5s even with a hero video (poster is the LCP element).
- Keyboard-only walkthrough; visible focus rings; reduced-motion respected.
- The 3D room never shows an empty black box: it must render works on load, or show a loading state, and it is never the default view.
- No stock or placeholder art ships to production except Edgar's own files.

---

## 8. Phases
1. **Clean-up & rebrand:** §1, brand file, redirects, header/footer. *Done when* no platform features or non-Edgar images remain and the preview deploys.
2. **Pages:** §2–§4 with placeholder copy and Edgar's existing photos; inquiry form and newsletter wired (or honest demo states). *Done when* all pages render well on desktop and mobile.
3. **Media Manager:** §5. *Done when* Edgar can log in on his phone, swap the hero video, reorder the collage, publish, and see it live within a minute, and undo it.
4. **Launch:** §6 checklist, domain live, final copy from Edgar swapped in.

**Needed from Edgar:** final headline and subline, bio, portrait, 3 first projects (even small ones), 1 essay, contact email, social links, and which services to list.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
