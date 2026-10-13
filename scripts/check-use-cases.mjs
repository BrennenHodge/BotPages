/**
 * Catalog integrity: banned copy words, deduped install URLs, redirect coverage, related-link counts.
 */
import fs from "node:fs";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const catalog = JSON.parse(fs.readFileSync(path.join(root, "content/catalog.json"), "utf8"));
const authored = fs.readFileSync(path.join(root, "content/authored.ts"), "utf8");
const redirects = fs.readFileSync(path.join(root, "redirects/grokbot-money.conf"), "utf8");
const banned = /\b(desks?|receipts?)\b/i;

let failed = 0;
function fail(message) {
  failed += 1;
  console.error("FAIL", message);
}

const blob = JSON.stringify(catalog) + "\n" + authored;
if (banned.test(blob)) fail("banned copy word in catalog or authored pages");

const installs = new Map();
for (const template of catalog.templates) {
  if (!template.installUrl) continue;
  if (installs.has(template.installUrl)) fail(`duplicate install ${template.installUrl}`);
  installs.set(template.installUrl, template.slug);
  const host = new URL(template.installUrl).hostname;
  if (host !== "x.ai") fail(`unexpected install host ${template.installUrl}`);
}
if (catalog.templates.filter((item) => !item.installUrl).length !== 2) {
  fail("expected exactly two templates without a live install link");
}

const raw = JSON.parse(fs.readFileSync(path.join(root, "content/source/grokbot-raw.json"), "utf8"));
for (const loc of raw.sitemap) {
  const pathname = loc.replace("https://grokbot.money", "") || "/";
  const key = pathname === "/" ? '"/"' : pathname;
  if (!redirects.includes(key)) fail(`redirect map missing ${pathname}`);
}
if (!redirects.includes("/guides/move-website-hosting-in-four-days")) fail("hosting guide redirect missing");
if (!redirects.includes("NOT APPLIED")) fail("redirect file must say it is not applied");

if (!authored.includes("build-terminal-to-html-tool-claude-code")) fail("Simon card missing");
if (!authored.includes("move-website-hosting-in-four-days")) fail("hosting guide missing");
if (!authored.includes("https://x.ai/bot/qQ0fMeAgyYvPV8jAPmVw_")) fail("hosting install link missing");
if (!authored.includes("https://simonwillison.net/2025/Oct/23/claude-code-for-web-video/")) fail("Simon source missing");

const uiDirs = ["app/agents", "app/jobs", "app/guides", "app/use-cases", "app/outcomes", "components/use-cases", "app/page.tsx", "app/experiments"];
function walk(entry) {
  const full = path.join(root, entry);
  if (!fs.existsSync(full)) return;
  const stat = fs.statSync(full);
  if (stat.isDirectory()) {
    for (const name of fs.readdirSync(full)) walk(path.join(entry, name));
    return;
  }
  if (!/\.(tsx|ts)$/.test(full)) return;
  const text = fs.readFileSync(full, "utf8");
  if (banned.test(text)) fail(`banned word in ${entry}`);
}
for (const entry of uiDirs) walk(entry);

if (catalog.useCases.length < 245) fail("use cases dropped");
if (catalog.templates.length < 321) fail("templates dropped");

if (failed) {
  console.error(`${failed} use-case check(s) failed`);
  process.exit(1);
}
console.log("use case catalog ok", catalog.useCases.length, "cards", catalog.templates.length, "templates");
