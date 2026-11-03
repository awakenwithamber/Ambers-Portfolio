# Audit of the existing project — 2026-11-03

Source audited: `~/workspace/portfolio/site/` (the previous full-stack edition, also published via GitHub Pages) and its assets.

## Working components preserved (concept / assets reused)
- Dark plum + gold theme, Cinzel / EB Garamond typography — carried into the new design system, with violet/lavender + restrained teal accents per the master prompt.
- Three reconstructed proof SVGs (`before-demo.svg`, `after-demo.svg`, `analytics-demo.svg`) — all already visibly labeled as reconstructions; copied unchanged into `public/assets/`.
- Cloudflare D1 contact-endpoint concept (`functions/api/contact.ts`) — rebuilt as a Worker (`src/index.js`) with the full field set, validation, honeypot, hashed-IP rate limiting, and status workflow.
- D1 `leads` table concept — expanded in `migrations/0001_create_leads.sql` to all inquiry fields.

## Bugs / gaps found in the old project
1. **GitHub Pages workflow** at `.github/workflows/pages.yml` — conflicts with Cloudflare production. Not carried over; no Pages workflow exists in the new repo.
2. **README claimed portability to Netlify / GitHub Pages / Vercel** — removed. The new repo contains zero Netlify references (enforced by `scripts/check-site.mjs`).
3. **Old `wrangler.toml` used Cloudflare Pages format** (`pages_build_output_dir`) — replaced with current Workers + Static Assets architecture.
4. **Old D1 schema lacked** website, project type, budget, problem, outcome, consent, source/referrer — all added.
5. **Old contact endpoint** validated only name/email/message, had permissive `access-control-allow-origin: *`, no rate limit, no honeypot, no consent. All fixed in the Worker.
6. **Old homepage carried claims outside the master prompt's source material** (dealer pilot section, build-count statistics, extra testimonials, a Toggl-hours case-study framing, and a platform list including Netlify/Supabase). The new build includes only the master prompt's content and metrics, so nothing unsupported was carried forward.
7. **Classification conflict flagged:** the old README (2026-10-12) framed Vanta, Webflow, Kit, Podia, Carrd, Empire Flippers, BarkBox, Function of Beauty and Death Wish Coffee as platforms/brands *used*. Amber's 2026-11-03 master prompt directs that they be presented as **"Team / Project Experience"** with no invented role details. The new build follows the newer, explicit instruction, labels them only that way, and leaves every per-company field empty pending documentation.

## What was NOT preserved
The old single-file `index.html` (44 KB, enterprise "Who/What/When/Where/Why" structure) remains untouched in `~/workspace/portfolio/site/` as history. The new production project is this directory.
