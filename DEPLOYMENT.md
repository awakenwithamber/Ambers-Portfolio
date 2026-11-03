# Deployment — Exact Steps

Nothing here requires a paid plan. All placeholders are marked `REPLACE-WITH-*`;
this project ships with **no real account IDs, database IDs, tokens, or domains**.

## A. GitHub — DONE (2026-11-03, by Muse via the GitHub connector)
- Repository: **github.com/awakenwithamber/Ambers-Portfolio** (her existing canonical portfolio repo — reused, not duplicated).
- New branch: **`cloudflare-production`** — the full project was pushed there in 4 verified batches; legacy Pages-era files (root `index.html`, `assets/*.svg`) were removed from this branch only.
- **`main` was not touched** — the live GitHub Pages site keeps running until Cloudflare cutover is approved.
- Creating a brand-new repository through the connector was attempted and is blocked by the GitHub App's permissions (403 "Resource not accessible by integration"), which is why the existing repo + branch route was used.
- Note: the appendix PPTX in `deck-pack/` is binary and is **not** in GitHub (the connector carries text only); it lives in the workspace and in Amber's files.
- There is intentionally **no** GitHub Actions workflow: Cloudflare deploys the Worker. No GitHub Pages workflow on this branch, no Netlify.

## B. Cloudflare steps (Amber)
You need: a free Cloudflare account. A custom domain is optional — you can launch on the free `*.workers.dev` subdomain first.

1. **Create the database**
   ```bash
   npm install
   npx wrangler login
   npx wrangler d1 create amber-portfolio
   ```
   Wrangler prints a `database_id` (a UUID).
2. **Put the real database ID where it belongs:** open `wrangler.toml` and replace
   `database_id = "REPLACE-WITH-YOUR-D1-DATABASE-ID"` with that UUID. Commit the change.
3. **Set your real domain:** search the whole repo for `REPLACE-WITH-YOUR-DOMAIN` and replace it with your real origin (no trailing slash), in:
   - `wrangler.toml` → `SITE_URL`
   - `public/index.html` and all six `public/case-studies/*.html` → canonical + Open Graph URLs
   - `public/robots.txt` and `public/sitemap.xml`
   If launching on `*.workers.dev` first, use that full subdomain here and re-run this step when you add a custom domain.
4. **Apply the database schema**
   ```bash
   npm run db:migrate
   ```
5. **(Optional) Notification email secret** — only if you later connect a mail provider:
   ```bash
   npx wrangler secret put NOTIFY_EMAIL
   ```
   No email is sent until a provider is wired up; submissions are safely stored in D1 regardless.
6. **Deploy**
   ```bash
   npm run deploy
   ```
   Wrangler prints the live URL.
7. **(Optional) Custom domain:** Cloudflare dashboard → Workers & Pages → `amber-patten-portfolio` → Settings → Domains & Routes → Add custom domain. Then repeat step 3 with the real domain and redeploy.
8. **Verify after deploy** (see the QA list in the final build report): open the site, submit a test inquiry, then confirm the row:
   ```bash
   npx wrangler d1 execute amber-portfolio --remote --command "SELECT id,name,email,status,created_at FROM leads ORDER BY id DESC LIMIT 5;"
   ```

## C. Alternative: dashboard-connected deploy
Cloudflare dashboard → Workers & Pages → Create → Connect to Git → pick the GitHub repo →
Framework preset: **None** → Build command: *(leave empty)* → Deploy command: `npx wrangler deploy`.
Then complete steps B1–B4 above so the D1 binding and placeholders are real before the first successful deploy.
