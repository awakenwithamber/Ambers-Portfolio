# Build Report — 2026-11-03

## 1. What was built
A new production project in this directory: home page with hero (positioning verbatim), labeled measurable results, flagship FNSM case study with before/after + analytics reconstructions, founder ventures, 9-company Team / Project Experience grid, St. Josephine project entry, skills, stack, proof/testimonial + video/demo slots, and a full 10-field inquiry form; 6 case-study pages; a Cloudflare Worker serving static assets and `POST /api/contact` → D1; D1 migration; editable `data/projects.json`; automation + evidence docs; QA and unit-test scripts.

## 2. Repository structure
See `README.md` — `public/` (8 HTML pages, CSS, JS, 3 labeled SVGs, robots, sitemap, favicon, 404), `src/` (Worker, validation, automations), `data/`, `migrations/`, `scripts/`, `docs/`, `wrangler.toml`, `AUDIT.md`, `DEPLOYMENT.md`, `ENVIRONMENT.md`.

## 3. What was changed (vs. the audited old project)
New Workers + Static Assets architecture replacing the old Pages-format config; no GitHub Pages workflow carried over; zero Netlify config/dependencies; D1 schema expanded to all inquiry fields with a status CHECK constraint; contact endpoint rebuilt with consent requirement, honeypot, hashed-IP rate limiting, security headers + CSP; old homepage content outside the master prompt's source material (dealer pilot, build-count stats, extra testimonials, Toggl framing, Netlify/Supabase platform list) was not carried forward; the 3 labeled reconstructed SVGs and the plum/gold theme were preserved. Full detail: `AUDIT.md`.

## 4. What was verified (and how)
- `node scripts/check-site.mjs` → **QA PASS**: 8 HTML pages; all local links/assets resolve; every non-404 page has title, meta description and canonical; every image has alt text; contact form contains all 10 required field names; `data/projects.json` parses with 6 projects + 9 team/project companies; no Netlify config/dependency; no hardcoded-secret pattern; no GitHub Pages workflow.
- `node scripts/test-validate.mjs` → **PASS** (4 cases: valid lead, missing consent, bad email, honeypot bot).
- Worker harness in Node with a stubbed D1: `GET /api/health` → 200 with CSP header; valid submission → 201 `{ok:true,status:"new"}` with 14 insert values; invalid submission → 400 with field errors; 6th submission in window → 429 rate limit.
- Migration executed in SQLite (D1-compatible SQL): lead inserts, status transitions through all 7 statuses succeed, an invalid status is rejected by the CHECK constraint.
- In-page anchor check: no missing anchors on any page.
- **Not verified live:** real Cloudflare deploy, real D1 write, and Lighthouse scores — these require Amber's Cloudflare account (Section 5). Performance/accessibility/SEO targets were designed for (no build step, one small CSS + one small JS file, system-fallback fonts with display=swap, semantic headings, labels, focus styles, reduced-motion support) but scores are not claimed until measured on the deployed site.

## 5. Anything requiring Amber's credentials / account access
1. Cloudflare account: `wrangler login`, `wrangler d1 create amber-portfolio`, deploy — all hers.
2. GitHub account: create/push the repository.
3. A real domain (or the free `*.workers.dev` subdomain) to replace the domain placeholder.
4. Optional: `NOTIFY_EMAIL` secret + a mail provider, if lead email notifications are wanted later. No AI API approval was used or needed.

## 6. Exact GitHub steps
See `DEPLOYMENT.md` Section A.

## 7. Exact Cloudflare deployment steps
See `DEPLOYMENT.md` Section B — including exactly where each real value goes: `database_id` → `wrangler.toml`; real domain → `SITE_URL` in `wrangler.toml`, canonical/OG URLs in all 7 content pages, `public/robots.txt`, `public/sitemap.xml`.

## 8. Remaining evidence Amber can provide to strengthen case studies
- **FNSM:** any real analytics export, original before/after screenshots, business-profile screenshots — each would upgrade a metric from Portfolio-Recorded toward Verified. A sourced testimonial.
- **The 9 Team / Project Experience companies:** per company — exact role, dates, responsibilities, deliverables, screenshots, URLs, outcomes, testimonials. Until then each stays labeled only "Team / Project Experience." Note the classification conflict flagged in `AUDIT.md` §7.
- **AwakenAgain:** live URL, repo URL, real catalog/checkout screenshots, any documented platform metrics.
- **Awaken With Amber LLC / Limitless / Identity Orchestrator:** dates, live URLs, repos, deliverables, documentation of status/scope.
- **St. Josephine:** documentation for any claim she wants stated as fact; tour/communications work samples.
- **Site-wide:** a 60–90 second real demo/walkthrough video for the demo slot; real attributed testimonials for the proof slots; her real domain for the placeholders.
