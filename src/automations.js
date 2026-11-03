// Scheduled, free-tier automations. Each is documented in docs/AUTOMATION.md with
// purpose / trigger / input / output / tools / permissions / failure mode / test.
// White-hat only: no fake traffic, no click bots, no scraped outreach.

export async function runScheduledChecks(env, ctx) {
  const base = (env.SITE_URL || "").replace(/\/$/, "");
  const results = { at: new Date().toISOString(), checks: [] };
  if (!base || base.includes("REPLACE-WITH")) {
    console.log(JSON.stringify({ ...results, skipped: "SITE_URL placeholder not yet replaced" }));
    return results;
  }
  for (const path of ["/", "/robots.txt", "/sitemap.xml"]) {
    try {
      const res = await fetch(base + path, { method: "GET", redirect: "follow" });
      results.checks.push({ path, status: res.status, ok: res.ok });
    } catch (err) {
      results.checks.push({ path, status: 0, ok: false, error: String(err).slice(0, 200) });
    }
  }
  // Broken-link check is intentionally limited to the site's own key routes on the
  // free tier; full crawl guidance lives in docs/AUTOMATION.md.
  console.log(JSON.stringify(results));
  return results;
}

// AI lead summarization: ARCHITECTURE ONLY, disabled by design.
// Enable only after Amber approves an AI API cost, a provider, and a secret binding.
// When enabled, summarize a single lead server-side and store it in a new
// `ai_summary` column added by a later migration — never call an AI API from the browser.
export const aiSummarization = { enabled: false, reason: "No AI API cost approved." };
