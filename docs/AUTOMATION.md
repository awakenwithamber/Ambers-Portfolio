# Automation Architecture — White-Hat Only

No fake traffic, no click bots, no spam, no scraped mass outreach, no black-hat SEO.
Legitimate visitors come from search, referrals, content and internal linking — these
automations support that work and the lead pipeline. No AI API is called anywhere.

| # | Automation | Purpose | Trigger | Input | Output | Tools | Permissions | Failure mode | Test |
|---|---|---|---|---|---|---|---|---|---|
| 1 | Contact submission | Capture inquiries safely | POST /api/contact | Form JSON | D1 row, status `new`, HTTP 201 | Worker + D1 | D1 write only | 400 validation / 429 rate limit / 503 if DB unbound | Submit the form locally with `wrangler dev`; check the row with `wrangler d1 execute` |
| 2 | Lead storage & status | Run the pipeline new → contacted → qualified → proposal → won/lost → archived | Manual (future admin dashboard) | Lead id + new status | Updated `status`, `updated_at` | D1 | D1 read/write | Invalid status rejected by CHECK constraint | Migration test: insert, update through each status |
| 3 | Notification | Tell Amber a lead arrived | New D1 row | Lead summary | Notification | Hook in `src/index.js` (disabled) | Secret `NOTIFY_EMAIL` + a mail provider, when configured | No mail sent until configured — by design | After configuring a provider, submit a test lead and confirm receipt |
| 4 | Follow-up reminders | Prevent stale leads | Future scheduled job | Leads in `new`/`contacted` older than a threshold | Reminder list | Worker Cron + D1 (architecture documented, query in README of this doc's repo issues) | D1 read only | None — read-only | Run the status query against local D1 |
| 5 | Scheduled portfolio checks | Catch downtime / broken sitemap / robots | Cron `0 13 * * *` UTC (wrangler.toml) | `SITE_URL` var | Log lines with status per route | Worker scheduled handler (`src/automations.js`) | Outbound fetch to own site only | Logs `skipped` while SITE_URL is a placeholder | `wrangler tail` after deploy; or temporarily set a real URL in dev |
| 6 | Broken-link monitoring | Find dead internal links | `npm run check` (local/CI) + scheduled check #5 | All HTML in `public/` | Pass/fail report | `scripts/check-site.mjs` | Local read only | Fails the check run, never the site | Run `npm run check` — must print QA PASS |
| 7 | Recurring SEO audit | Metadata, canonical, OG, internal links stay complete | `npm run check` before every deploy | All HTML pages | Pass/fail report | `scripts/check-site.mjs` | Local read only | Blocks deploy checklist until fixed | Delete a meta description in a copy and confirm the check fails |
| 8 | Content-distribution & internal-linking workflow | Drive real search/referral traffic | Manual, per new case study | New page in `public/case-studies/` + entry in `data/projects.json` + sitemap entry | One publish checklist (see below) | Repo files | Repo write | Page missing from sitemap is caught by checklist review | Publish checklist walkthrough before deploy |
| 9 | Analytics review summaries | Summarize real performance | Manual / future | Real analytics export supplied by Amber | Summary added to the case study with an evidence label | Human + repo | None | Never generated from invented data | Confirm every figure cites its export |
| 10 | AI lead summarization | Shorten lead triage | — DISABLED — | — | — | — | Requires Amber's explicit approval of provider + API cost + secret | Stays off | `src/automations.js` exports `aiSummarization.enabled = false` |

## Publish checklist for a new case study (automation #8)
1. Add the project record to `data/projects.json` with an honest evidence label.
2. Create `public/case-studies/<id>.html` with unique title, description, canonical, OG/Twitter tags.
3. Add the URL to `public/sitemap.xml`.
4. Link it from the home page grid and from at least one related case study (internal linking).
5. Run `npm run check`.
6. Share the live URL through Amber's owned channels — no automated posting, no scraped outreach.
