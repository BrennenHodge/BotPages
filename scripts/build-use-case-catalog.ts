/**
 * Merge grokbot.money ways + bots with the Bot Pages wild catalog.
 * Dedupes templates by install URL. Scrubs banned copy words.
 * Writes content/catalog.json and redirects/grokbot-money.conf.
 *
 * Source file: content/source/grokbot-raw.json (public API snapshot).
 */
import fs from "node:fs";
import path from "node:path";
import { WILD_BOTS } from "../lib/wild-bots";
import type { JobSlug, OutcomeSlug, Status } from "../lib/use-cases/taxonomy";
import type { CatalogFile, FaqItem, RoundupRecord, TemplateRecord, UseCaseRecord } from "../lib/use-cases/types";

const ROOT = path.resolve(import.meta.dirname, "..");
const RAW_PATH = path.join(ROOT, "content/source/grokbot-raw.json");
const OUT_PATH = path.join(ROOT, "content/catalog.json");
const MAP_PATH = path.join(ROOT, "redirects/grokbot-money.conf");

/** Checked with HTTP HEAD on 13 Oct 2026. Both returned 404. */
const DEAD_INSTALLS = new Set([
  "https://x.ai/bot/nGEBqtXuN-klNcPPyoR3S",
  "https://x.ai/bot/UMCdNlqEH7USe3eOznd1U",
]);

const BANNED = /\b(desks?|receipts?)\b/gi;

function scrub(value: string) {
  return value.replace(BANNED, (word) => {
    const lower = word.toLowerCase();
    const rep =
      lower === "desks" ? "setups" : lower === "desk" ? "setup" : lower === "receipts" ? "records" : "record";
    if (word === word.toUpperCase()) return rep.toUpperCase();
    if (word[0] === word[0].toUpperCase()) return rep[0].toUpperCase() + rep.slice(1);
    return rep;
  });
}

function scrubDeep<T>(value: T): T {
  if (typeof value === "string") return scrub(value) as T;
  if (Array.isArray(value)) return value.map((item) => scrubDeep(item)) as T;
  if (value && typeof value === "object") {
    const out: Record<string, unknown> = {};
    for (const [key, item] of Object.entries(value)) out[key] = scrubDeep(item);
    return out as T;
  }
  return value;
}

function normInstall(url: string) {
  const parsed = new URL(url);
  const host = parsed.hostname.toLowerCase();
  const pathname = parsed.pathname.replace(/\/+$/, "");
  return `https://${host}${pathname}`;
}

function handleOf(raw: string | null | undefined) {
  const handle = (raw ?? "").replace(/^@+/, "").trim();
  return handle || null;
}

function creatorFrom(handle: string | null, url: string | null | undefined) {
  if (!handle) return null;
  return {
    handle,
    url: url && url.startsWith("http") ? url : `https://x.com/${handle}`,
  };
}

type Classified = { category: JobSlug; outcome: OutcomeSlug };

function classify(input: {
  category?: string;
  tags?: string[];
  name?: string;
  summary?: string;
  description?: string;
}): Classified {
  const tags = new Set((input.tags ?? []).map((tag) => tag.toLowerCase()));
  const cat = (input.category ?? "").toLowerCase();
  const blob = `${input.name ?? ""} ${input.summary ?? ""} ${input.description ?? ""} ${[...tags].join(" ")} ${cat}`.toLowerCase();

  const has = (...needles: string[]) => needles.some((needle) => blob.includes(needle));

  if (has("travel", "flight", "airbnb", "hotel", "itinerary")) {
    return { category: "travel", outcome: "save-time" };
  }
  if (has("game", "hardware", "robot", "3d print", "arduino")) {
    return { category: "science-hardware", outcome: "build" };
  }
  if (
    tags.has("developer") ||
    tags.has("engineering") ||
    cat === "tools" ||
    cat === "dev" ||
    has("github", "devops", "sentry", "vercel", "deploy", "codebase", "pull request")
  ) {
    if (tags.has("agent-team") || has("fleet", "agent team", "multi-bot", "multi bot")) {
      return { category: "automations", outcome: "build" };
    }
    return { category: "software", outcome: "build" };
  }
  if (tags.has("agent-team") || tags.has("meta-bot") || has("fleet", "agent team", "routine", "n8n", "mcp")) {
    return { category: "automations", outcome: "build" };
  }
  if (has("refund", "subscription", "late fee", "late-fee", "haggle", "coupon") || cat === "save-money" || tags.has("saving-money")) {
    if (has("cart", "marketplace", "shopping", "amazon", "ebay")) return { category: "shopping", outcome: "save-money" };
    return { category: "money", outcome: "save-money" };
  }
  if (has("cart", "marketplace", "shopping", "dropship") || tags.has("shopping")) {
    return { category: "shopping", outcome: "save-money" };
  }
  if (cat === "trading" || has("trading", "portfolio", "stocks", "crypto")) {
    return { category: "money", outcome: "make-money" };
  }
  if (tags.has("research") || cat === "research" || has("briefing", "digest", "research")) {
    return { category: "research", outcome: "save-time" };
  }
  if (tags.has("health") || tags.has("learning") || tags.has("student") || has("health", "habit", "study", "learning")) {
    return { category: "personal", outcome: "save-time" };
  }
  if (
    (tags.has("email") || tags.has("calendar") || has("inbox", "calendar", "household")) &&
    !tags.has("sales") &&
    cat !== "sales"
  ) {
    return { category: "life-admin", outcome: "save-time" };
  }
  if (
    cat === "content" ||
    cat === "marketing" ||
    cat === "grow-an-audience" ||
    cat === "sell-what-it-makes" ||
    tags.has("content") ||
    tags.has("creator") ||
    tags.has("marketer") ||
    has("newsletter", "youtube", "seo", "blog", "video")
  ) {
    return { category: "content", outcome: "make-money" };
  }
  if (cat === "sales" || tags.has("sales") || has("outreach", "cold email", "leads", "pipeline")) {
    return { category: "sales-marketing", outcome: "make-money" };
  }
  if (cat === "personal" || cat === "productivity") {
    return { category: cat === "productivity" ? "life-admin" : "personal", outcome: "save-time" };
  }
  if (cat === "do-the-work-for-clients" || cat === "run-a-business" || cat === "run-a-shop" || cat === "ops" || cat === "work") {
    return {
      category: "work",
      outcome: cat === "ops" ? "save-time" : "make-money",
    };
  }
  if (cat === "get-paid" || cat === "make-money" || cat === "money" || cat === "sell-the-bot") {
    return { category: cat === "sell-the-bot" ? "sales-marketing" : "money", outcome: "make-money" };
  }
  return { category: "work", outcome: "save-time" };
}

function statusOf(text: string): Status {
  const fail = /did not work|didn't work|didn’t work|never worked|it failed|does not work/i;
  const unseen = /we did not see|we have not seen|we haven't seen|haven’t seen|not yet confirm|unconfirmed/i;
  const result = /\$\s?\d|\b\d[\d,]*(?:\.\d+)?\s*(%|percent|hours?|days?|minutes?)\b|\brefund(?:ed)?\b|\bsaved\b|\bshipped\b/i;
  if (fail.test(text)) return "didnt-work";
  const hasResult = result.test(text);
  if (unseen.test(text)) return hasResult ? "partly-worked" : "unconfirmed";
  if (hasResult) return "worked";
  return "unconfirmed";
}

function sentences(text: string, max: number) {
  const parts = text
    .replace(/\s+/g, " ")
    .trim()
    .split(/(?<=[.!?])\s+/)
    .filter(Boolean);
  return parts.slice(0, max).join(" ");
}

type Way = {
  slug: string;
  name: string;
  summary: string;
  category: string;
  source_url?: string;
  handle?: string;
  handle_url?: string;
  prompt?: string;
  prompt_from?: string;
  added_at?: string;
  intro?: string;
  story?: string;
  money_how?: string;
  steps?: string[];
  watch_out?: string[];
  sources?: { label?: string; url?: string }[];
};

type Bot = {
  slug: string;
  name: string;
  summary: string;
  category: string;
  tags?: string[];
  handle?: string;
  handle_url?: string;
  share_url?: string;
  source_url?: string;
  source_label?: string;
  added_at?: string;
  description?: string;
  includes?: string[];
};

function wayToUseCase(way: Way): UseCaseRecord {
  const classified = classify({
    category: way.category,
    name: way.name,
    summary: way.summary,
    description: `${way.story ?? ""} ${way.money_how ?? ""}`,
  });
  const body = [way.story, way.money_how, way.summary, ...(way.watch_out ?? [])].filter(Boolean).join("\n");
  const status = statusOf(body);
  const handle = handleOf(way.handle);
  const credited = handleOf(way.prompt_from);
  const promptText = (way.prompt ?? "").trim();
  const steps = (way.steps ?? []).map((step) => step.trim()).filter(Boolean);
  let prompt = promptText;
  let promptAttribution: "creator" | "ours" = "ours";
  let promptCredit = "Our starter prompt";
  if (promptText && credited) {
    promptAttribution = "creator";
    promptCredit = `Prompt credited to @${credited}`;
  } else if (promptText) {
    promptCredit = "Prompt from this write-up";
  } else {
    const numbered = steps.map((step, index) => `${index + 1}. ${step}`).join("\n");
    prompt = `Here is the published setup. Follow it, and do nothing irreversible without a yes.\n\n${numbered}\n\nAfter each step, report what is done, what is stuck, and what you need from me.`;
    promptCredit = "Our starter prompt, built from the published steps";
  }
  const source = way.sources?.find((item) => item.url) ?? null;
  const addedAt = way.added_at || "2026-08-29T00:00:00.000Z";
  return {
    kind: "use-case",
    slug: way.slug,
    title: way.name,
    summary: way.summary,
    agents: ["grok-bot"],
    category: classified.category,
    outcome: classified.outcome,
    outcomes: [classified.outcome],
    status,
    creator: creatorFrom(handle, way.handle_url),
    sourceUrl: source?.url || way.source_url || "",
    sourceLabel: source?.label || (handle ? `Post by @${handle}` : "Source"),
    prompt,
    promptAttribution,
    promptCredit,
    whatTheyDid: sentences(way.story || way.intro || way.summary, 4),
    howItWent: sentences(way.money_how || way.summary, 3),
    steps,
    watchOut: (way.watch_out ?? []).map((item) => item.trim()).filter(Boolean),
    addedAt,
    updatedAt: addedAt,
    legacyPath: `/ways/${way.slug}`,
  };
}

function templateSteps(name: string, includes: string[]) {
  const steps = [`Open the install page for ${name} and read it before you add the template.`];
  if (includes.includes("instructions")) {
    steps.push("The listing includes instructions. Follow those, rather than a routine this page does not have.");
  }
  if (includes.includes("schedule")) {
    steps.push("The listing includes a schedule. Turn it on only after you have read what it will do.");
  }
  if (includes.includes("workflow")) {
    steps.push("The listing includes a workflow. Use that workflow as the setup.");
  }
  steps.push("Do not paste a password or a key into chat. Use the login the template asks for.");
  steps.push("After a run, check what it did before you let it send, pay, or change an account.");
  return steps;
}

function templateFaq(title: string, summary: string, handle: string | null, installNote: string | null): FaqItem[] {
  const faq: FaqItem[] = [
    { question: `What does ${title} do?`, answer: summary },
    {
      question: "Who shared it?",
      answer: handle ? `The listing credits @${handle}.` : "The listing does not name a creator.",
    },
    {
      question: "Did it work?",
      answer: "The public listing does not state a result, so this page marks it Unconfirmed.",
    },
  ];
  if (installNote) faq.push({ question: "Where is the install link?", answer: installNote });
  return faq;
}

function botToTemplate(bot: Bot, legacyPaths: string[]): TemplateRecord {
  const classified = classify({
    category: bot.category,
    tags: bot.tags,
    name: bot.name,
    summary: bot.summary,
    description: bot.description,
  });
  const handle = handleOf(bot.handle);
  const includes = bot.includes ?? [];
  const installRaw = bot.share_url ? normInstall(bot.share_url) : null;
  const dead = installRaw ? DEAD_INSTALLS.has(installRaw) : false;
  const installUrl = installRaw && !dead ? installRaw : null;
  const installNote = dead
    ? "The install link on the original listing returned 404 when checked on October 13, 2026. This page does not substitute another link."
    : null;
  const whatItDoes = (bot.description || bot.summary).trim();
  const addedAt = bot.added_at ?? null;
  return {
    kind: "template",
    slug: bot.slug,
    title: bot.name,
    summary: bot.summary,
    description: whatItDoes,
    agents: ["grok-bot"],
    category: classified.category,
    outcome: classified.outcome,
    outcomes: [classified.outcome],
    status: "unconfirmed",
    creator: creatorFrom(handle, bot.handle_url),
    sourceUrl: bot.source_url ?? null,
    sourceLabel: bot.source_label || (handle ? `Post by @${handle}` : "Listing"),
    installUrl,
    installNote,
    includes,
    whatItDoes,
    howItWent: "Unconfirmed. The public listing describes the template and does not state a result.",
    steps: templateSteps(bot.name, includes),
    prompt: `You are ${bot.name}. ${bot.summary}\n\nStay inside the public instructions for this template.\nAsk before you spend money, send a message, or change an account.\nWhen you finish, say what you did, what is stuck, and what you need from me.`,
    promptAttribution: "ours",
    faq: templateFaq(bot.name, bot.summary, handle, installNote),
    addedAt,
    updatedAt: addedAt,
    legacyPaths,
  };
}

type RawFile = {
  ways: Way[];
  bots: Bot[];
  sitemap: string[];
  roundups: Record<string, { links: string[] }>;
};

function redirectTarget(pathname: string) {
  if (pathname === "/" || pathname === "") return "/";
  if (pathname === "/ways") return "/use-cases";
  if (pathname.startsWith("/ways/")) return `/use-cases/${pathname.slice("/ways/".length)}`;
  if (pathname === "/bots") return "/agents/grok-bot/templates";
  if (pathname.startsWith("/bots/")) return `/agents/grok-bot/templates/${pathname.slice("/bots/".length)}`;
  if (pathname === "/roundups" || pathname.startsWith("/roundups/")) return pathname;
  if (pathname === "/sponsors" || pathname === "/sponsors/setup" || pathname === "/sponsors/account") return "/sponsor";
  if (pathname === "/submit") return "/submit";
  if (pathname === "/about") return "/about";
  if (pathname === "/plugins" || pathname === "/agent") return "/agents/grok-bot";
  return "/agents/grok-bot";
}

function writeRedirects(paths: string[]) {
  const lines = [
    "# grokbot.money and www.grokbot.money → https://botpages.co",
    "# Page-level 301 map. NOT APPLIED. Do not install this on a server from this change.",
    "#",
    "# Intended use, later, inside the grokbot.money nginx server:",
    "#",
    "#   include /etc/nginx/grokbot-money-botpages.map;",
    "#   return 301 https://botpages.co$botpages_path$is_args$args;",
    "#",
    "# $uri has no query string. One hop. Unknown paths go to /agents/grok-bot,",
    "# not the home page. /api/ on grokbot.money is unmapped and would follow",
    "# that default; keep a location ^~ /api/ exception if the JSON API should stay up.",
    "#",
    "map $uri $botpages_path {",
    '    default "/agents/grok-bot";',
  ];
  const seen = new Set<string>();
  const extras = ["/ways/move-website-hosting-in-four-days"];
  for (const loc of [...paths, ...extras.map((item) => `https://grokbot.money${item}`)]) {
    const pathname = loc.replace("https://grokbot.money", "") || "/";
    if (seen.has(pathname)) continue;
    seen.add(pathname);
    const target =
      pathname === "/ways/move-website-hosting-in-four-days"
        ? "/guides/move-website-hosting-in-four-days"
        : redirectTarget(pathname);
    const key = pathname === "/" ? '"/"' : pathname;
    lines.push(`    ${key} "${target}";`);
  }
  lines.push("}", "");
  fs.mkdirSync(path.dirname(MAP_PATH), { recursive: true });
  fs.writeFileSync(MAP_PATH, lines.join("\n"));
  return seen.size;
}

function main() {
  const raw = JSON.parse(fs.readFileSync(RAW_PATH, "utf8")) as RawFile;
  const useCases = raw.ways.map(wayToUseCase);

  const byInstall = new Map<string, TemplateRecord>();
  for (const bot of raw.bots) {
    const install = bot.share_url ? normInstall(bot.share_url) : "";
    const record = botToTemplate(bot, [`/bots/${bot.slug}`]);
    if (install) byInstall.set(install, record);
    else byInstall.set(`slug:${bot.slug}`, record);
  }

  let wildOnly = 0;
  let merged = 0;
  for (const wild of WILD_BOTS) {
    const install = normInstall(wild.shareUrl);
    const existing = byInstall.get(install);
    if (existing) {
      merged += 1;
      if ((wild.description || "").length > existing.description.length) {
        existing.description = wild.description;
        existing.whatItDoes = wild.description;
      }
      if (wild.slug !== existing.slug && !existing.legacyPaths.includes(`/${wild.slug}`)) {
        existing.legacyPaths.push(`/${wild.slug}`);
      }
      continue;
    }
    wildOnly += 1;
    const record = botToTemplate(
      {
        added_at: "2026-10-13T00:00:00.000Z",
        slug: wild.slug,
        name: wild.name,
        summary: wild.blurb,
        category: wild.category,
        tags: wild.tags,
        handle: wild.xHandle ? `@${wild.xHandle}` : undefined,
        handle_url: wild.xHandle ? `https://x.com/${wild.xHandle}` : undefined,
        share_url: wild.shareUrl,
        source_url: wild.sourceUrl,
        description: wild.description,
        includes: wild.includes,
      },
      [`/${wild.slug}`],
    );
    byInstall.set(install, record);
  }

  const templates = [...byInstall.values()].sort((a, b) => a.slug.localeCompare(b.slug));
  const slugs = new Set<string>();
  for (const template of templates) {
    if (slugs.has(template.slug)) throw new Error(`Duplicate template slug ${template.slug}`);
    slugs.add(template.slug);
  }

  const useSlugs = new Set(useCases.map((item) => item.slug));
  const templateSlugs = new Set(templates.map((item) => item.slug));
  const roundupMeta: Record<string, { title: string; intro: string }> = {
    "refunds-found-money": {
      title: "Refunds and found money",
      intro: "These posts are about money already spent: a bill, a fee, a claim, a cancel. Numbers are as posted. Not our books.",
    },
    "overnight-fleets": {
      title: "Overnight fleets",
      intro: "People said bots kept going while they slept. We list those write-ups here. We did not sit the night. Do not copy a fill from a tweet.",
    },
    "marketplace-haggle": {
      title: "Marketplace haggle",
      intro: "These posts are about a cart, a listing, or a buy. Numbers are as posted. Not our books.",
    },
  };
  const roundups: RoundupRecord[] = Object.entries(raw.roundups).map(([slug, data]) => {
    const entries: RoundupRecord["entries"] = [];
    for (const link of data.links) {
      if (link.startsWith("/ways/")) {
        const id = link.slice("/ways/".length);
        if (useSlugs.has(id)) entries.push({ kind: "use-case", slug: id });
      } else if (link.startsWith("/bots/")) {
        const id = link.slice("/bots/".length);
        if (templateSlugs.has(id)) entries.push({ kind: "template", slug: id });
      }
    }
    const meta = roundupMeta[slug] ?? { title: slug, intro: "" };
    return { slug, title: meta.title, intro: meta.intro, entries };
  });

  const catalog: CatalogFile = scrubDeep({
    generatedAt: "2026-10-13",
    useCases: useCases.sort((a, b) => a.slug.localeCompare(b.slug)),
    templates,
    roundups,
  });

  const bannedLeft = JSON.stringify(catalog).match(BANNED);
  if (bannedLeft) throw new Error(`Banned words left in catalog: ${bannedLeft.slice(0, 5).join(", ")}`);

  fs.writeFileSync(OUT_PATH, JSON.stringify(catalog));
  const mapped = writeRedirects(raw.sitemap);

  const byJob = new Map<string, number>();
  const byOutcome = new Map<string, number>();
  const byStatus = new Map<string, number>();
  for (const item of catalog.useCases) {
    byJob.set(item.category, (byJob.get(item.category) ?? 0) + 1);
    byOutcome.set(item.outcome, (byOutcome.get(item.outcome) ?? 0) + 1);
    byStatus.set(item.status, (byStatus.get(item.status) ?? 0) + 1);
  }
  console.log(
    JSON.stringify(
      {
        useCases: catalog.useCases.length,
        templates: catalog.templates.length,
        wildMerged: merged,
        wildOnly,
        deadInstalls: catalog.templates.filter((item) => !item.installUrl).length,
        roundups: catalog.roundups.map((item) => [item.slug, item.entries.length]),
        redirectLines: mapped,
        jobs: Object.fromEntries(byJob),
        outcomes: Object.fromEntries(byOutcome),
        status: Object.fromEntries(byStatus),
        bytes: fs.statSync(OUT_PATH).size,
      },
      null,
      2,
    ),
  );
}

main();
