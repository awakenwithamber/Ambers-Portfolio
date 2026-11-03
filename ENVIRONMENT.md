# Environment — Variables, Bindings, Secrets

| Name | Kind | Where it goes | Real value |
|---|---|---|---|
| `DB` | D1 binding | `wrangler.toml` → `[[d1_databases]] binding` | Created with `wrangler d1 create amber-portfolio`; no value to type — the binding name is `DB` |
| `database_id` | Config | `wrangler.toml` → `[[d1_databases]] database_id` | The UUID printed by `wrangler d1 create` — replaces `REPLACE-WITH-YOUR-D1-DATABASE-ID` |
| `database_name` | Config | `wrangler.toml` | `amber-portfolio` (already set) |
| `ASSETS` | Static Assets binding | `wrangler.toml` → `[assets] binding` | Automatic — serves `./public` |
| `SITE_URL` | Plain variable | `wrangler.toml` → `[vars]` + canonical/OG URLs in `public/**/*.html` + `public/robots.txt` + `public/sitemap.xml` | Your real origin, e.g. `https://your-domain.com` — replaces every `REPLACE-WITH-YOUR-DOMAIN` |
| `NOTIFY_EMAIL` | **Secret** (optional, unused until a mail provider is connected) | `npx wrangler secret put NOTIFY_EMAIL` — never in `wrangler.toml`, never in code | Your notification inbox address |

Rules:
- No API keys exist in this project. There is nothing to leak: the frontend JavaScript contains no keys, and the QA script (`npm run check`) fails if a hardcoded secret pattern appears.
- Never commit `.dev.vars` or `.env` — both are in `.gitignore`. See `.env.example` for the local-dev shape.
