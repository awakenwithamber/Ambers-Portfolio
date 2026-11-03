// Mobile nav + contact form. No secrets, no external calls except POST /api/contact.
const toggle = document.getElementById("navToggle");
const nav = document.getElementById("mainNav");
if (toggle && nav) {
  toggle.addEventListener("click", () => {
    const open = nav.classList.toggle("open");
    toggle.setAttribute("aria-expanded", String(open));
  });
  nav.querySelectorAll("a").forEach((a) => a.addEventListener("click", () => nav.classList.remove("open")));
}

// Privacy-first conversion tracking: first-party only, no cookies, no PII.
function track(type) {
  try {
    const payload = JSON.stringify({ type, path: location.pathname, referrer: document.referrer || "" });
    if (navigator.sendBeacon) navigator.sendBeacon("/api/event", new Blob([payload], { type: "application/json" }));
    else fetch("/api/event", { method: "POST", body: payload, headers: { "content-type": "application/json" }, keepalive: true }).catch(() => {});
  } catch {}
}
document.querySelectorAll("[data-track]").forEach((el) =>
  el.addEventListener("click", () => track(el.getAttribute("data-track"))));

const form = document.getElementById("inquiry");
// Consultation deep-link: ?type=consultation (or an option value) preselects project type.
try {
  const wanted = new URLSearchParams(location.search).get("type");
  const sel = document.querySelector('select[name="project_type"]');
  if (wanted && sel) {
    const match = [...sel.options].find((o) => o.text.toLowerCase().includes(wanted.toLowerCase()) || o.value.toLowerCase().includes(wanted.toLowerCase()));
    if (match) sel.value = match.value || match.text;
  }
} catch {}
if (form) {
  const msg = document.getElementById("formmsg");
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    msg.textContent = "Sending…";
    const data = Object.fromEntries(new FormData(form).entries());
    data.consent = form.querySelector("[name=consent]").checked;
    data.source = location.pathname;
    data.referrer = document.referrer || "";
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(data),
      });
      const out = await res.json().catch(() => ({}));
      if (res.ok && out.ok) { track("lead_submitted"); msg.textContent = "Thank you — your inquiry was received and stored securely. Amber will reply by email."; form.reset(); }
      else msg.textContent = out.error || "Something went wrong. Please try again.";
    } catch { msg.textContent = "Network error. Please try again."; }
  });
}
