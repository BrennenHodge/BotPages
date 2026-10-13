/**
 * Confirms Bot Pages experiment routes are still in the tree, and optionally
 * GETs them when BASE_URL is set (node scripts/check-preserved-routes.mjs http://127.0.0.1:43127).
 */
import fs from "node:fs";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");

const files = [
  "proxy.ts",
  "app/[handle]/page.tsx",
  "app/[handle]/agent-card.json/route.ts",
  "app/[handle]/.well-known/agent-card.json/route.ts",
  "app/[handle]/.identity/route.ts",
  "app/[handle]/bot-card.json/route.ts",
  "app/.well-known/agent-card.json/route.ts",
  "app/.well-known/agent.json/route.ts",
  "app/a2a/[handle]/route.ts",
  "app/api/a2a/[handle]/route.ts",
  "app/api/vanity/[handle]/say/route.ts",
  "app/api/vanity/[handle]/inbox/route.ts",
  "app/api/vanity/[handle]/update/route.ts",
  "app/api/vanity/[handle]/did/route.ts",
  "app/api/vanity/[handle]/inbox/[id]/ack/route.ts",
  "app/claim/page.tsx",
  "app/login/page.tsx",
  "app/tools/page.tsx",
  "app/api/page.tsx",
  "app/docs/page.tsx",
  "lib/nav.ts",
];

const proxy = fs.readFileSync(path.join(root, "proxy.ts"), "utf8");
const proxyNeedles = [
  "/api/vanity/",
  "agent-card.json",
  "/a2a/",
  "\\/api\\/@",
];

let failed = 0;
function fail(message) {
  failed += 1;
  console.error("FAIL", message);
}

for (const file of files) {
  if (!fs.existsSync(path.join(root, file))) fail(`missing ${file}`);
}
for (const needle of proxyNeedles) {
  if (!proxy.includes(needle)) fail(`proxy.ts lost ${needle}`);
}

const handles = fs.readFileSync(path.join(root, "lib/handles.ts"), "utf8");
if (handles.includes('"jobs"')) fail("jobs was reserved; that handle must keep /jobs");

const nav = fs.readFileSync(path.join(root, "lib/nav.ts"), "utf8");
if (!nav.includes('href: "/experiments"') || !nav.includes("show: true")) {
  fail("experiments link is not in the nav config");
}
if (!nav.includes('href: "/tools"') || !nav.includes("show: false")) {
  fail("tools must stay in the nav config and off by default");
}

const base = process.argv[2];
if (base) {
  const paths = [
    ["/tools", 200],
    ["/login", 200],
    ["/claim", 200],
    ["/api", 200],
    ["/about", 200],
    ["/connect", 200],
    ["/how-it-works", 200],
    ["/feed", 200],
    ["/explore", 200],
    ["/pricing", 200],
    // labs/a2a 404s in production on purpose (app/labs/layout.tsx). The protocol routes are /a2a and the agent cards.
    ["/labs/a2a", 404],
    ["/signup", 200],
    ["/forgot", 200],
    ["/start", 200],
    ["/bots", 200],
    ["/experiments", 200],
    ["/adler", 200],
    ["/jobs", 200],
    ["/.well-known/agent-card.json", 200],
    ["/.well-known/agent.json", 200],
    ["/docs", 200],
    ["/@demo", 200],
    ["/a2a/@demo", 200],
    ["/api/@demo", 200],
    ["/demo/agent-card.json", 200],
    ["/demo/.well-known/agent-card.json", 200],
    ["/api/@demo/inbox", 401],
  ];
  for (const [pathname, expect] of paths) {
    const response = await fetch(new URL(pathname, base), { redirect: "follow" });
    if (response.status !== expect) fail(`${pathname} -> ${response.status}, expected ${expect}`);
    else console.log("OK", pathname, response.status);
  }
  const posts = [
    "/api/@demo/say",
    "/api/@demo/update",
    "/api/@demo/did",
    "/api/@demo/inbox/missing/ack",
  ];
  for (const pathname of posts) {
    const response = await fetch(new URL(pathname, base), {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: "{}",
      redirect: "manual",
    });
    if (response.status !== 401) fail(`${pathname} POST -> ${response.status}, expected 401 without a key`);
    else console.log("OK", pathname, "401");
  }
  const jobs = await fetch(new URL("/jobs", base), { redirect: "manual" });
  const jobsHtml = await jobs.text();
  if (jobsHtml.includes("AI agents for")) fail("/jobs rendered the job hub instead of the catalog handle");
}

if (failed) {
  console.error(`${failed} preserved-route check(s) failed`);
  process.exit(1);
}
console.log("preserved routes ok");
