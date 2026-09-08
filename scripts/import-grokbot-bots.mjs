/**
 * Pull shareable Grok bots from grokbot.money (bots.json — not ways)
 * and write lib/wild-bots.ts. Details add description + includes.
 */
import fs from "node:fs";
import path from "node:path";

const ROOT = path.resolve(import.meta.dirname, "..");
const LIST_URL = "https://grokbot.money/api/v1/bots.json";
const LOCAL_LIST = path.join(ROOT, "data", "grokbot-bots.json");
const OUT = path.join(ROOT, "lib", "wild-bots.ts");

const HANDLE_MIN = 3;
const HANDLE_MAX = 24;
const RESERVED = new Set([
  "about", "account", "admin", "a2a", "api", "app", "assets", "auth", "blog", "bot", "bots",
  "card", "cdn", "checkout", "catalog", "claim", "connect", "contact", "cursor", "dashboard",
  "docs", "email", "explore", "favicon", "feed", "handle", "handles", "health", "help", "home",
  "how", "how-it-works", "inbox", "index", "legal", "login", "logout", "mail", "manifest", "me",
  "messages", "mod", "moderator", "news", "next", "_next", "official", "og", "opengraph", "owner",
  "ping", "join", "pay", "pricing", "privacy", "private", "profile", "public", "register", "robots",
  "room", "root", "search", "seed", "settings", "skill", "start", "signin", "signout", "signup",
  "sitemap", "staff", "static", "status", "support", "system", "terms", "u", "user", "users",
  "humans", "vercel", "ways", "webhook", "webhooks", "well-known", "wild", "www",
]);

const CATEGORY_FROM_GROK = {
  personal: "personal",
  sales: "sales",
  "run-a-shop": "ops",
  ops: "ops",
  "save-money": "money",
  content: "marketing",
  trading: "money",
  "make-money": "money",
};

function lit(value) {
  return JSON.stringify(value);
}

function toHandle(slug, used) {
  let base = String(slug || "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-+/g, "-");
  if (base.length > HANDLE_MAX) {
    base = base.slice(0, HANDLE_MAX).replace(/-+$/g, "");
  }
  if (base.length < HANDLE_MIN || RESERVED.has(base) || used.has(base)) {
    const stem = (base || "bot").slice(0, HANDLE_MAX - 4).replace(/-+$/g, "") || "bot";
    let n = 2;
    let candidate = `${stem}-bot`.slice(0, HANDLE_MAX);
    while (RESERVED.has(candidate) || used.has(candidate) || candidate.length < HANDLE_MIN) {
      const suffix = `-${n}`;
      candidate = `${stem.slice(0, HANDLE_MAX - suffix.length)}${suffix}`;
      n += 1;
    }
    base = candidate;
  }
  used.add(base);
  return base;
}

function mapCategory(item) {
  const tags = item.tags || [];
  if (tags.includes("developer") || tags.includes("engineering")) return "dev";
  if (tags.includes("research")) return "research";
  if (tags.includes("marketer") || tags.includes("social-media") || tags.includes("seo")) return "marketing";
  if (tags.includes("sales") && !tags.includes("personal")) return "sales";
  if (
    tags.includes("saving-money") ||
    tags.includes("finance") ||
    item.category === "trading" ||
    item.category === "make-money" ||
    item.category === "save-money"
  ) {
    return "money";
  }
  if (tags.includes("ops") || tags.includes("back-office") || item.category === "ops" || item.category === "run-a-shop") {
    return "ops";
  }
  if (tags.includes("productivity")) return "productivity";
  return CATEGORY_FROM_GROK[item.category] || "personal";
}

function integrations(item, description = "") {
  const hay = `${item.name} ${item.summary} ${description} ${(item.tags || []).join(" ")}`.toLowerCase();
  const tags = new Set(item.tags || []);
  const out = ["grok"];
  if (tags.has("social-media") || /\btwitter\b|\btweet\b|\bx\.com\b|\binstagram\b|\blinkedin\b/.test(hay)) {
    out.push("x");
  }
  if (/hacker\s*news|\bhn\b/.test(hay)) out.push("hackernews");
  if (tags.has("developer") || tags.has("engineering") || /github/.test(hay)) out.push("github");
  if (/reddit/.test(hay)) out.push("reddit");
  if (tags.has("email") || /gmail|\binbox\b|\bemail\b|\bmail\b/.test(hay)) out.push("gmail");
  if (/slack/.test(hay)) out.push("slack");
  if (tags.has("calendar") || /calendar/.test(hay)) out.push("calendar");
  if (/notion/.test(hay)) out.push("notion");
  if (/linear/.test(hay)) out.push("linear");
  return [...new Set(out)];
}

function includesFrom(item, extra = []) {
  const tags = new Set(item.tags || []);
  const set = new Set(["instructions", ...extra]);
  if (tags.has("scheduled")) set.add("schedule");
  if (tags.has("automation") || tags.has("ops") || tags.has("workflow") || tags.has("back-office")) {
    set.add("workflow");
  }
  return [...set];
}

async function loadList() {
  try {
    const res = await fetch(LIST_URL, { headers: { accept: "application/json" } });
    if (!res.ok) throw new Error(`list ${res.status}`);
    return await res.json();
  } catch (err) {
    if (fs.existsSync(LOCAL_LIST)) {
      console.warn("API list failed, using local snapshot:", err.message);
      return JSON.parse(fs.readFileSync(LOCAL_LIST, "utf8"));
    }
    throw err;
  }
}

async function fetchDetail(item) {
  const url = item.detail_url;
  if (!url) return item;
  try {
    const res = await fetch(url, { headers: { accept: "application/json" } });
    if (!res.ok) return item;
    const json = await res.json();
    return json.item || json.items?.[0] || item;
  } catch {
    return item;
  }
}

async function mapPool(items, size, fn) {
  const out = new Array(items.length);
  let i = 0;
  async function worker() {
    while (i < items.length) {
      const idx = i++;
      out[idx] = await fn(items[idx], idx);
    }
  }
  await Promise.all(Array.from({ length: Math.min(size, items.length) }, () => worker()));
  return out;
}

const list = await loadList();
const items = list.items || [];
console.log(`list ${items.length}, fetching details…`);
const details = await mapPool(items, 10, fetchDetail);
const used = new Set();

const bots = details.map((item) => {
  const description = (item.description || "").trim();
  return {
    handle: toHandle(item.slug, used),
    slug: item.slug,
    name: item.name,
    blurb: item.summary,
    description: description && description !== item.summary ? description : "",
    category: mapCategory(item),
    tags: item.tags || [],
    xHandle: String(item.handle || "").replace(/^@+/, ""),
    shareUrl: item.share_url || "",
    sourceUrl: item.tweet_url || item.source_url || "",
    includes: item.includes?.length ? item.includes : includesFrom(item),
    integrations: integrations(item, description),
  };
});

const rows = bots
  .map(
    (bot) => `  {
    handle: ${lit(bot.handle)},
    slug: ${lit(bot.slug)},
    name: ${lit(bot.name)},
    blurb: ${lit(bot.blurb)},
    description: ${lit(bot.description)},
    category: ${lit(bot.category)},
    tags: ${lit(bot.tags)},
    xHandle: ${lit(bot.xHandle)},
    shareUrl: ${lit(bot.shareUrl)},
    sourceUrl: ${lit(bot.sourceUrl)},
    includes: ${lit(bot.includes)},
    integrations: ${lit(bot.integrations)},
  }`,
  )
  .join(",\n");

const file = `/** Shareable Grok bots from grokbot.money/api/v1/bots.json — not ways. Regenerated by scripts/import-grokbot-bots.mjs */
import type { WildBot } from "./wild-data";

export const WILD_BOTS: WildBot[] = [
${rows},
];
`;

fs.writeFileSync(OUT, file);
const withDesc = bots.filter((b) => b.description).length;
const withShare = bots.filter((b) => b.shareUrl).length;
console.log(`wrote ${bots.length} bots (${withDesc} descriptions, ${withShare} share links) → lib/wild-bots.ts`);
