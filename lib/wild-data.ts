import { WILD_BOTS } from "./wild-bots";

export const WILD_CATEGORIES = [
  "money",
  "sales",
  "marketing",
  "ops",
  "productivity",
  "research",
  "personal",
  "dev",
] as const;

export type WildCategory = (typeof WILD_CATEGORIES)[number];

export const CONNECT_INTEGRATIONS = ["x", "hackernews", "github", "reddit"] as const;
export const EXTRA_INTEGRATIONS = ["grok", "gmail", "calendar", "slack", "notion", "linear"] as const;
export const INTEGRATIONS = [...CONNECT_INTEGRATIONS, ...EXTRA_INTEGRATIONS] as const;

export type IntegrationId = (typeof INTEGRATIONS)[number];
export type ConnectIntegrationId = (typeof CONNECT_INTEGRATIONS)[number];

export type WildInclude = "instructions" | "schedule" | "workflow";

export type WildBot = {
  handle: string;
  slug: string;
  name: string;
  blurb: string;
  description: string;
  category: WildCategory;
  tags: string[];
  xHandle: string;
  shareUrl: string;
  sourceUrl: string;
  includes: string[];
  integrations: IntegrationId[];
};

export type WildRow = WildBot & { claimed: boolean };

export { WILD_BOTS };

export const CATEGORY_LABEL: Record<WildCategory, string> = {
  money: "Money",
  sales: "Sales",
  marketing: "Marketing",
  ops: "Ops",
  productivity: "Productivity",
  research: "Research",
  personal: "Personal",
  dev: "Dev",
};

export const CATEGORY_PILL: Record<WildCategory, string> = {
  money: "bg-[#e7f3ea] text-[#2a7a3a]",
  sales: "bg-[#ffe8dc] text-[#c45a2a]",
  marketing: "bg-[#ffe0d6] text-[#d44520]",
  ops: "bg-[#eee6f8] text-[#5b3d8f]",
  productivity: "bg-[#e4eef8] text-[#2a5f8f]",
  research: "bg-[#fff0d6] text-[#8a5a12]",
  personal: "bg-[#fff6c8] text-[#8a6a10]",
  dev: "bg-[#efe8df] text-[#17120e]",
};

export const INTEGRATION_LABEL: Record<IntegrationId, string> = {
  x: "X",
  hackernews: "Hacker News",
  github: "GitHub",
  reddit: "Reddit",
  grok: "Grok Bot",
  gmail: "Gmail",
  calendar: "Calendar",
  slack: "Slack",
  notion: "Notion",
  linear: "Linear",
};

export const INCLUDE_LABEL: Record<string, string> = {
  instructions: "instructions",
  schedule: "schedule",
  workflow: "workflow",
};

export function getWildBot(handle: string) {
  const key = handle.replace(/^@+/, "").toLowerCase();
  return WILD_BOTS.find((bot) => bot.handle === key || bot.slug === key) ?? null;
}

export function relatedWildBots(handle: string, limit = 3) {
  const bot = getWildBot(handle);
  if (!bot) return [];
  const scored = WILD_BOTS.filter((row) => row.handle !== bot.handle).map((row) => {
    let score = 0;
    if (row.category === bot.category) score += 3;
    score += row.tags.filter((tag) => bot.tags.includes(tag)).length;
    return { row, score };
  });
  return scored
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score || a.row.name.localeCompare(b.row.name))
    .slice(0, limit)
    .map((item) => item.row);
}

export function shareOrigin(origin: string) {
  if (!origin || origin.includes("localhost") || origin.includes("127.0.0.1")) {
    return "https://botpages.co";
  }
  return origin.replace(/\/$/, "");
}

export function wildPagePath(handle: string) {
  return `/${handle.replace(/^@+/, "").toLowerCase()}`;
}

export function catalogInviteTweet(origin: string, handle: string) {
  const bot = getWildBot(handle);
  const host = shareOrigin(origin);
  const key = handle.replace(/^@+/, "").toLowerCase();
  const page = `${host.replace(/^https?:\/\//, "")}/${key}`;
  const claim = `${host.replace(/^https?:\/\//, "")}/claim?handle=${encodeURIComponent(key)}`;
  if (bot) {
    return `@${bot.xHandle} your bot should have a page at ${page}\n\nClaim @${bot.handle} → ${claim}`;
  }
  return `@you your bot should have a page at ${page}\n\nClaim @${key} → ${claim}`;
}

export function catalogInviteUrl(origin: string, handle: string) {
  return `https://twitter.com/intent/tweet?text=${encodeURIComponent(catalogInviteTweet(origin, handle))}`;
}

export function xProfileUrl(xHandle: string) {
  return `https://x.com/${xHandle.replace(/^@+/, "")}`;
}

export function xStatusPermalink(url: string) {
  const match = url.match(/^https?:\/\/(?:www\.)?(?:x\.com|twitter\.com)\/([^/?#]+)\/status\/(\d+)/i);
  if (!match) return null;
  return `https://x.com/${match[1]}/status/${match[2]}`;
}
