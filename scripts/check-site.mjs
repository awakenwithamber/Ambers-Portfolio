// QA check: local links/assets exist, every page has title+meta description+canonical,
// no Netlify references, no GitHub Pages workflow, no obvious secrets, form fields present.
import { readFileSync, existsSync, readdirSync, statSync } from "node:fs";
import { join, dirname } from "node:path";
const root = new URL("..", import.meta.url).pathname;
const pub = join(root, "public");
let failures = [], warnings = [];
function walk(dir) { return readdirSync(dir).flatMap((n) => { const p = join(dir, n); return statSync(p).isDirectory() ? walk(p) : [p]; }); }
const htmlFiles = walk(pub).filter((f) => f.endsWith(".html"));
const allFiles = walk(root).filter((f) => !f.includes("node_modules") && !f.endsWith("check-site.mjs"));
for (const f of allFiles) {
  const t = readFileSync(f, "utf8");
  // A Netlify *dependency/config* fails; prose stating "No Netlify" in docs is fine.
  if (/netlify\.toml/i.test(t) || f.endsWith("netlify.toml")) failures.push(`Netlify config reference in ${f.replace(root, "")}`);
  if (f.endsWith("package.json") && /"netlify/i.test(t)) failures.push("Netlify dependency in package.json");
  if (/(api[_-]?key|secret|token)\s*=\s*["'][A-Za-z0-9_\-]{16,}["']/i.test(t)) failures.push(`Possible hardcoded secret in ${f.replace(root, "")}`);
}
if (existsSync(join(root, ".github/workflows/pages.yml"))) failures.push("GitHub Pages workflow still present");
for (const f of htmlFiles) {
  const t = readFileSync(f, "utf8"), rel = f.replace(pub, "");
  if (!/<title>[^<]+<\/title>/.test(t)) failures.push(`${rel}: missing title`);
  if (!/name="description"/.test(t) && !rel.includes("404")) failures.push(`${rel}: missing meta description`);
  if (!/rel="canonical"/.test(t) && !rel.includes("404")) failures.push(`${rel}: missing canonical`);
  for (const m of t.matchAll(/(?:href|src)="(\/[^"#]+)"/g)) {
    const target = m[1] === "/" ? join(pub, "index.html") : join(pub, m[1]);
    if (!existsSync(target)) failures.push(`${rel}: broken local link ${m[1]}`);
  }
  for (const m of t.matchAll(/<img[^>]+>/g)) if (!/alt="[^"]+"/.test(m[0])) failures.push(`${rel}: img without alt`);
}
const home = readFileSync(join(pub, "index.html"), "utf8");
for (const field of ["name", "email", "company", "website", "project_type", "budget", "primary_problem", "desired_outcome", "message", "consent"])
  if (!home.includes(`name="${field}"`)) failures.push(`Contact form missing field: ${field}`);
if (!home.includes("Your Entire Growth Ecosystem. One Strategic Partner.")) failures.push("New positioning tagline missing from home page");
if (home.includes("Team / Project Experience")) failures.push("Unsubstantiated Team/Project framing still present on home page");
if (!home.includes("I don’t just build websites. I build the systems behind growth.") && !home.includes("I don't just build websites")) warnings.push("Positioning line not found verbatim-ish in hero (check apostrophe encoding)");
const projects = JSON.parse(readFileSync(join(root, "data/projects.json"), "utf8"));
if (projects.projects.length !== 6) failures.push("projects.json should contain 6 projects");
if (!projects.platformsUsed || projects.platformsUsed.length !== 9) failures.push("platformsUsed should contain 9 names");
for (const w of warnings) console.log("WARN:", w);
if (failures.length) { console.error("FAILURES:\n- " + failures.join("\n- ")); process.exit(1); }
console.log(`QA PASS — ${htmlFiles.length} HTML pages, links/assets/metadata/form/data checks OK. Placeholders remaining are listed in DEPLOYMENT.md.`);
