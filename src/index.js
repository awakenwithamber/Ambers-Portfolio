// Amber Patten Portfolio — Cloudflare Worker
// Serves static assets, handles POST /api/contact -> D1, applies security headers,
// and runs scheduled portfolio checks. No secrets in code; DB is a binding.
import { sanitizeLead, validateLead } from "./validate.js";
import { runScheduledChecks } from "./automations.js";

const SECURITY_HEADERS = {
  "x-content-type-options": "nosniff",
  "x-frame-options": "DENY",
  "referrer-policy": "strict-origin-when-cross-origin",
  "permissions-policy": "camera=(), microphone=(), geolocation=()",
  "strict-transport-security": "max-age=31536000; includeSubDomains",
  "content-security-policy":
    "default-src 'self'; img-src 'self' data:; style-src 'self' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; script-src 'self'; connect-src 'self'; base-uri 'self'; form-action 'self'; frame-ancestors 'none'",
};

function withHeaders(response) {
  const res = new Response(response.body, response);
  for (const [k, v] of Object.entries(SECURITY_HEADERS)) res.headers.set(k, v);
  return res;
}
const json = (data, status = 200) =>
  withHeaders(new Response(JSON.stringify(data), { status, headers: { "content-type": "application/json" } }));

async function sha256(text) {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(text));
  return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

async function handleContact(request, env, ctx) {
  if (request.method !== "POST") return json({ error: "Method not allowed" }, 405);
  if (!env.DB) return json({ error: "Database is not configured yet." }, 503);
  let body;
  try { body = await request.json(); } catch { return json({ error: "Invalid JSON." }, 400); }

  const lead = sanitizeLead(body);
  const errors = validateLead(lead);
  if (errors.includes("spam_detected")) return json({ ok: true }); // silently drop bots
  if (errors.length) return json({ error: "Please correct: " + errors.join("; "), errors }, 400);

  const ip = request.headers.get("cf-connecting-ip") || "unknown";
  const ipHash = await sha256(ip + "|amber-portfolio");

  // Rate limit: max 5 submissions per hashed IP per 10 minutes.
  const recent = await env.DB.prepare(
    "SELECT COUNT(*) AS c FROM leads WHERE ip_hash = ? AND created_at > datetime('now','-10 minutes')"
  ).bind(ipHash).first();
  if (recent && recent.c >= 5) return json({ error: "Too many submissions. Please try again later." }, 429);

  await env.DB.prepare(
    `INSERT INTO leads (name,email,company,website,project_type,budget,primary_problem,desired_outcome,message,consent,status,source,referrer,ip_hash,user_agent)
     VALUES (?,?,?,?,?,?,?,?,?,?,'new',?,?,?,?)`
  ).bind(
    lead.name, lead.email, lead.company, lead.website, lead.project_type, lead.budget,
    lead.primary_problem, lead.desired_outcome, lead.message, lead.consent,
    lead.source, lead.referrer || request.headers.get("referer") || "",
    ipHash, (request.headers.get("user-agent") || "").slice(0, 300)
  ).run();

  // Lead notification to Amber's business email via Resend — ACTIVE only when all
  // three are configured: RESEND_API_KEY (secret), MAIL_FROM (a sender on a domain
  // verified in Resend), and NOTIFY_EMAIL (var, amber@awakenagain.com). Until then
  // the lead is still stored in D1 and the notification is logged as not configured.
  if (ctx && ctx.waitUntil) ctx.waitUntil(notifyNewLead(env, lead));
  return json({ ok: true, status: "new" }, 201);
}

async function notifyNewLead(env, lead) {
  if (!env.RESEND_API_KEY || !env.MAIL_FROM || !env.NOTIFY_EMAIL) {
    console.log(JSON.stringify({ notify: "not_configured", reason: "RESEND_API_KEY/MAIL_FROM/NOTIFY_EMAIL incomplete" }));
    return;
  }
  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { authorization: `Bearer ${env.RESEND_API_KEY}`, "content-type": "application/json" },
      body: JSON.stringify({
        from: env.MAIL_FROM,
        to: [env.NOTIFY_EMAIL],
        reply_to: lead.email,
        subject: `New portfolio inquiry — ${lead.name}`,
        text: `Name: ${lead.name}\nEmail: ${lead.email}\nCompany: ${lead.company || "-"}\nType: ${lead.project_type || "-"}\nBudget: ${lead.budget || "-"}\nProblem: ${lead.primary_problem || "-"}\nOutcome: ${lead.desired_outcome || "-"}\n\n${lead.message}`,
      }),
    });
    console.log(JSON.stringify({ notify: res.ok ? "sent" : "failed", status: res.status }));
  } catch (err) { console.log(JSON.stringify({ notify: "error", error: String(err).slice(0, 200) })); }
}

async function handleEvent(request, env) {
  if (request.method !== "POST") return json({ error: "Method not allowed" }, 405);
  if (!env.DB) return json({ ok: true }); // tracking never blocks the page
  let body = {};
  try { body = await request.json(); } catch { /* sendBeacon may send text */ 
    try { body = JSON.parse(await request.text()); } catch { body = {}; } }
  const type = String(body.type || "").replace(/[^a-z0-9_]/gi, "").slice(0, 60);
  if (!type) return json({ error: "type required" }, 400);
  const path = String(body.path || "").slice(0, 300);
  const referrer = String(body.referrer || "").slice(0, 500);
  await env.DB.prepare("INSERT INTO events (type, path, referrer) VALUES (?,?,?)").bind(type, path, referrer).run();
  return json({ ok: true });
}

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    if (url.pathname === "/api/contact") return handleContact(request, env, ctx);
    if (url.pathname === "/api/event") return handleEvent(request, env);
    if (url.pathname === "/api/health") return json({ ok: true, service: "amber-patten-portfolio" });
    if (env.ASSETS) return withHeaders(await env.ASSETS.fetch(request));
    return json({ error: "Not found" }, 404);
  },
  async scheduled(event, env, ctx) {
    ctx.waitUntil(runScheduledChecks(env, ctx));
  },
};
