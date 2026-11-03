# Amber Patten — Production Portfolio

**"I don't just build websites. I build the systems behind growth."**

A production-ready professional portfolio on **GitHub + Cloudflare Workers + Static Assets + D1**.
No Netlify configuration, dependency, or workflow exists in this repository.

## What is built
- Responsive dark portfolio (dark plum/violet, parchment, lavender + restrained teal, gold sparingly; Cinzel / EB Garamond) with hero, labeled results, flagship FNSM case study, before/after + analytics reconstructions (labeled), founder ventures, Project Experience (St. Josephine), a Platforms & Tools section (nine platforms Amber has used — explicitly not employers/clients/partners), audience CTAs for owners/employers/sponsors/investors, an FAQ with FAQPage schema, verified proof (WebMD patient review naming Amber; documented recommendation letter and Toggl work record), skills, stack, proof system, demo slot, and a full project-inquiry form.
- Six case-study pages under `public/case-studies/`, each with unique title, meta description, canonical, Open Graph / Twitter tags, and schema.org data. Person schema on the home page.
- First-party conversion tracking: CTA clicks and lead submissions POST to `/api/event` → D1 `events` table. No cookies, no PII, no third-party trackers. (Cloudflare Web Analytics can be added later with Amber's token.)
- Lead notifications: the Worker emails new inquiries to amber@awakenagain.com via Resend as soon as the `RESEND_API_KEY` and `MAIL_FROM` secrets are set (see ENVIRONMENT.md) — until then leads are stored in D1 and the notification attempt is logged.
- Real contact backend: `POST /api/contact` (Worker) → Cloudflare D1, with validation, sanitization, honeypot spam trap, hashed-IP rate limiting (5 / 10 min), timestamps, source/referrer, and a `new → contacted → qualified → proposal → won / lost → archived` status workflow.
- Editable source of truth for every project: `data/projects.json` — add role, dates, responsibilities, deliverables, screenshots, URLs, outcomes and testimonials without redesigning the site.
- Security headers + CSP on every response, no secrets in code, no AI API calls or costs.
- White-hat automation architecture + a working daily scheduled check: see `docs/AUTOMATION.md`.
- QA gate: `npm run check` (links, assets, metadata, form fields, no Netlify, no hardcoded secrets) and `npm test` (validation unit tests).

## Repository structure
```
public/            Static site (served by Workers Static Assets)
  index.html       Home page (all main sections + inquiry form)
  case-studies/    6 case-study pages with unique SEO metadata
  assets/          CSS, JS, and the 3 labeled reconstructed-demo SVGs
  robots.txt  sitemap.xml  favicon.svg  404.html
src/
  index.js         Worker: assets, /api/contact, /api/health, scheduled handler, security headers
  validate.js      Pure lead validation/sanitization (unit-tested)
  automations.js   Scheduled checks + disabled-by-design AI summarization stub
data/projects.json Editable project / case-study data model
migrations/        D1 migrations (0001_create_leads.sql)
scripts/           check-site.mjs (QA), test-validate.mjs (tests)
docs/              AUTOMATION.md, EVIDENCE.md
wrangler.toml      Cloudflare config — placeholders clearly marked REPLACE-WITH-*
AUDIT.md           Audit of the previous project and what was preserved / fixed
DEPLOYMENT.md      Exact GitHub + Cloudflare steps
ENVIRONMENT.md     Every variable / binding / secret and where its real value goes
```

## Local development
```bash
npm install          # installs wrangler (dev only; the site itself has no build step)
npm run db:migrate:local
npm run dev          # wrangler dev — site + /api/contact on local D1
npm run check && npm test
```

## Production
Follow `DEPLOYMENT.md` step by step. In short: push to GitHub, create the D1 database,
paste its ID into `wrangler.toml`, replace every `REPLACE-WITH-YOUR-DOMAIN` with the real
domain, apply migrations, and `npm run deploy` (or connect the repo in the Cloudflare dashboard).

## Integrity
Evidence is labeled Verified / Portfolio-Recorded / Stated / Illustrative everywhere.
Full rules: `docs/EVIDENCE.md`. Nothing on this site is fabricated.
