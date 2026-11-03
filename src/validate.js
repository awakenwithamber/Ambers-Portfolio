// Pure validation / sanitization for lead submissions. No I/O — unit-testable in Node.
const clean = (v, max) => String(v ?? "").replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, "").trim().slice(0, max);
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export function sanitizeLead(body = {}) {
  return {
    name: clean(body.name, 120),
    email: clean(body.email, 180).toLowerCase(),
    company: clean(body.company, 180),
    website: clean(body.website, 300),
    project_type: clean(body.project_type, 80),
    budget: clean(body.budget, 80),
    primary_problem: clean(body.primary_problem, 1000),
    desired_outcome: clean(body.desired_outcome, 1000),
    message: clean(body.message, 5000),
    consent: body.consent === true || body.consent === "true" || body.consent === "on" ? 1 : 0,
    source: clean(body.source, 200),
    referrer: clean(body.referrer, 500),
    honeypot: clean(body.fax_number, 50), // must stay empty; bots fill it
  };
}

export function validateLead(lead) {
  const errors = [];
  if (lead.honeypot) errors.push("spam_detected");
  if (!lead.name) errors.push("name is required");
  if (!lead.email || !EMAIL_RE.test(lead.email)) errors.push("a valid email is required");
  if (!lead.message || lead.message.length < 10) errors.push("message is required (min 10 characters)");
  if (!lead.consent) errors.push("consent is required");
  if (lead.website && !/^https?:\/\//i.test(lead.website) && !/^[\w.-]+\.[a-z]{2,}/i.test(lead.website)) {
    errors.push("website looks invalid");
  }
  return errors;
}

export const LEAD_STATUSES = ["new", "contacted", "qualified", "proposal", "won", "lost", "archived"];
