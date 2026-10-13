/** Launch agents, jobs, and outcomes. Counts are computed from published records. */

export const SITE_ORIGIN = "https://botpages.co";
export const BRAND = "Bot Pages";

/** A hub is indexable once it has this many published cards (use cases and guides). */
export const AGENT_HUB_INDEX_MIN = 10;
/** An agent × job page is indexable once it has this many published cards. */
export const AGENT_JOB_INDEX_MIN = 5;

export type JobSlug =
  | "money"
  | "shopping"
  | "life-admin"
  | "personal"
  | "travel"
  | "work"
  | "sales-marketing"
  | "research"
  | "content"
  | "software"
  | "automations"
  | "science-hardware";

export type OutcomeSlug = "save-time" | "save-money" | "make-money" | "build";

export type Status = "worked" | "partly-worked" | "didnt-work" | "unconfirmed";

export const JOBS: { slug: JobSlug; label: string; blurb: string }[] = [
  {
    slug: "money",
    label: "Money, bills and benefits",
    blurb: "Refunds, bills, benefits, and trading setups people handed to an agent.",
  },
  {
    slug: "shopping",
    label: "Shopping and errands",
    blurb: "Carts, listings, haggling, and the errands people stopped doing by hand.",
  },
  {
    slug: "life-admin",
    label: "Life admin and home",
    blurb: "Inbox, calendar, household paperwork, and the admin that piles up at home.",
  },
  {
    slug: "personal",
    label: "Health, learning and personal",
    blurb: "Health, study, habits, and personal decisions people asked an agent to help with.",
  },
  {
    slug: "travel",
    label: "Travel and bookings",
    blurb: "Trips, bookings, and the travel tasks people published.",
  },
  {
    slug: "work",
    label: "Work and operations",
    blurb: "Client work, shops, and the operations of a working week.",
  },
  {
    slug: "sales-marketing",
    label: "Sales, marketing and support",
    blurb: "Outreach, leads, support, and the conversations that bring work in.",
  },
  {
    slug: "research",
    label: "Research and knowledge",
    blurb: "Briefings, digests, and research people stopped doing from scratch.",
  },
  {
    slug: "content",
    label: "Content and creative",
    blurb: "Newsletters, video, search pages, and other things people publish.",
  },
  {
    slug: "software",
    label: "Software and DevOps",
    blurb: "Code, sites, deploys, and the security work around them.",
  },
  {
    slug: "automations",
    label: "Agents and automations",
    blurb: "Teams of agents, routines, and the glue between tools.",
  },
  {
    slug: "science-hardware",
    label: "Games, science and hardware",
    blurb: "Games, science, and hardware projects people ran with an agent.",
  },
];

export const OUTCOMES: { slug: OutcomeSlug; label: string; blurb: string }[] = [
  {
    slug: "save-time",
    label: "Save time",
    blurb: "Setups that take a repeated task off someone's week.",
  },
  {
    slug: "save-money",
    label: "Save money",
    blurb: "Refunds, bill cuts, and spending someone actually posted about.",
  },
  {
    slug: "make-money",
    label: "Make money",
    blurb: "Offers, audiences, and client work people ran with an agent.",
  },
  {
    slug: "build",
    label: "Build",
    blurb: "Software, sites, and agent teams people put together.",
  },
];

export const AGENTS: {
  slug: string;
  name: string;
  blurb: string;
  officialUrl?: string;
}[] = [
  {
    slug: "grok-bot",
    name: "Grok Bot",
    blurb: "xAI's Grok Bot, including public templates people install and share.",
    officialUrl: "https://x.ai",
  },
  {
    slug: "claude-code",
    name: "Claude Code",
    blurb: "Anthropic's coding agent, including Claude Code for web.",
    officialUrl: "https://www.anthropic.com",
  },
  {
    slug: "chatgpt",
    name: "ChatGPT",
    blurb: "OpenAI's ChatGPT, including the agent mode.",
    officialUrl: "https://chatgpt.com",
  },
  {
    slug: "claude",
    name: "Claude",
    blurb: "Anthropic's Claude, including Cowork.",
    officialUrl: "https://www.anthropic.com",
  },
  {
    slug: "codex",
    name: "Codex",
    blurb: "OpenAI's Codex coding agent.",
    officialUrl: "https://openai.com",
  },
  {
    slug: "cursor",
    name: "Cursor",
    blurb: "The Cursor code editor and its agent.",
    officialUrl: "https://cursor.com",
  },
  {
    slug: "gemini",
    name: "Gemini",
    blurb: "Google's Gemini assistant and agent.",
    officialUrl: "https://gemini.google.com",
  },
  {
    slug: "manus",
    name: "Manus",
    blurb: "Manus, the autonomous agent.",
  },
  {
    slug: "n8n",
    name: "n8n",
    blurb: "n8n, the workflow tool people connect to agents.",
    officialUrl: "https://n8n.io",
  },
  {
    slug: "openclaw",
    name: "OpenClaw",
    blurb: "OpenClaw. This hub lists published examples only.",
  },
  {
    slug: "devin",
    name: "Devin",
    blurb: "Cognition's Devin software-engineering agent.",
  },
  {
    slug: "lindy",
    name: "Lindy",
    blurb: "Lindy, an assistant for work tasks.",
  },
  {
    slug: "perplexity-comet",
    name: "Perplexity Comet",
    blurb: "Perplexity's Comet browser agent.",
    officialUrl: "https://www.perplexity.ai",
  },
  {
    slug: "zapier",
    name: "Zapier Agents",
    blurb: "Zapier's agent product.",
    officialUrl: "https://zapier.com",
  },
  {
    slug: "meta-muse",
    name: "Meta Muse",
    blurb: "Meta Muse. This hub lists published examples only.",
  },
];

export const STATUS_LABEL: Record<Status, string> = {
  worked: "Worked",
  "partly-worked": "Partly worked",
  "didnt-work": "Didn't work",
  unconfirmed: "Unconfirmed",
};

const JOB_BY_SLUG = new Map(JOBS.map((job) => [job.slug, job]));
const OUTCOME_BY_SLUG = new Map(OUTCOMES.map((outcome) => [outcome.slug, outcome]));
const AGENT_BY_SLUG = new Map(AGENTS.map((agent) => [agent.slug, agent]));

export function jobBySlug(slug: string) {
  return JOB_BY_SLUG.get(slug as JobSlug) ?? null;
}

export function outcomeBySlug(slug: string) {
  return OUTCOME_BY_SLUG.get(slug as OutcomeSlug) ?? null;
}

export function agentBySlug(slug: string) {
  return AGENT_BY_SLUG.get(slug) ?? null;
}

/**
 * /jobs is an existing catalog handle, so the job index cannot take that URL.
 * Category pages stay at /jobs/{category}. The index is /job.
 */
export const JOB_INDEX_PATH = "/job";

export function jobPath(slug: string) {
  return `/jobs/${slug}`;
}

export function outcomePath(slug: string) {
  return `/outcomes/${slug}`;
}

export function agentPath(slug: string) {
  return `/agents/${slug}`;
}

export function agentJobPath(agent: string, category: string) {
  return `/agents/${agent}/${category}`;
}
