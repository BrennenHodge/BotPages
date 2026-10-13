import catalogJson from "@/content/catalog.json";
import { HOSTING_GUIDE, SIMON_CARD } from "@/content/authored";
import {
  AGENT_HUB_INDEX_MIN,
  AGENT_JOB_INDEX_MIN,
  AGENTS,
  JOBS,
  OUTCOMES,
  agentBySlug,
  agentJobPath,
  agentPath,
  jobBySlug,
  jobPath,
  outcomeBySlug,
  outcomePath,
  type JobSlug,
  type OutcomeSlug,
  type Status,
} from "./taxonomy";
import type {
  CatalogFile,
  GuideRecord,
  Published,
  RelatedLink,
  RoundupRecord,
  TemplateRecord,
  UseCaseRecord,
} from "./types";

const catalog = catalogJson as CatalogFile;

export type Card = UseCaseRecord | GuideRecord;

const useCases: UseCaseRecord[] = [...catalog.useCases, SIMON_CARD];
const guides: GuideRecord[] = [HOSTING_GUIDE];
const templates: TemplateRecord[] = catalog.templates;
const roundups: RoundupRecord[] = catalog.roundups;

const useCaseBySlug = new Map(useCases.map((item) => [item.slug, item]));
const guideBySlug = new Map(guides.map((item) => [item.slug, item]));
const templateBySlug = new Map(templates.map((item) => [item.slug, item]));

const STATUS_RANK: Record<Status, number> = {
  worked: 0,
  "partly-worked": 1,
  "didnt-work": 2,
  unconfirmed: 3,
};

export function allUseCases() {
  return useCases;
}

export function allGuides() {
  return guides;
}

export function allTemplates() {
  return templates;
}

export function allRoundups() {
  return roundups;
}

export function getUseCase(slug: string) {
  return useCaseBySlug.get(slug) ?? null;
}

export function getGuide(slug: string) {
  return guideBySlug.get(slug) ?? null;
}

export function getTemplate(slug: string) {
  return templateBySlug.get(slug) ?? null;
}

export function getRoundup(slug: string) {
  return roundups.find((item) => item.slug === slug) ?? null;
}

export function cards() {
  return [...guides, ...useCases] as Card[];
}

function isCard(item: Published): item is Card {
  return item.kind === "use-case" || item.kind === "guide";
}

export function hrefFor(item: Published) {
  if (item.kind === "guide") return `/guides/${item.slug}`;
  if (item.kind === "template") return `/agents/grok-bot/templates/${item.slug}`;
  return `/use-cases/${item.slug}`;
}

export function agentLabels(slugs: string[]) {
  return slugs.map((slug) => agentBySlug(slug)?.name ?? slug).join(", ");
}

export type Row = {
  href: string;
  title: string;
  summary: string;
  status: Status;
  kind: Published["kind"];
  agent: string;
  meta: string;
  updatedAt: string;
};

export function toRow(item: Published): Row {
  const creator = item.creator ? `@${item.creator.handle}` : "Creator not named";
  return {
    href: hrefFor(item),
    title: item.title,
    summary: item.summary,
    status: item.status,
    kind: item.kind,
    agent: agentLabels(item.agents),
    meta: item.kind === "template" ? `Template · ${creator}` : item.kind === "guide" ? `Guide · ${creator}` : creator,
    updatedAt: item.updatedAt ?? item.addedAt ?? "",
  };
}

function byRecent(a: Published, b: Published) {
  return (b.updatedAt ?? "").localeCompare(a.updatedAt ?? "");
}

function byStart(a: Published, b: Published) {
  const guideBias = Number(b.kind === "guide") - Number(a.kind === "guide");
  if (guideBias) return guideBias;
  const status = STATUS_RANK[a.status] - STATUS_RANK[b.status];
  if (status) return status;
  return byRecent(a, b);
}

export function cardsForAgent(agent: string) {
  return cards().filter((item) => item.agents.includes(agent));
}

export function templatesForAgent(agent: string) {
  return templates.filter((item) => item.agents.includes(agent));
}

export function cardsForJob(job: JobSlug) {
  return cards().filter((item) => item.category === job);
}

export function templatesForJob(job: JobSlug) {
  return templates.filter((item) => item.category === job);
}

export function cardsForOutcome(outcome: OutcomeSlug) {
  return cards().filter((item) => item.outcomes.includes(outcome));
}

export function templatesForOutcome(outcome: OutcomeSlug) {
  return templates.filter((item) => item.outcomes.includes(outcome));
}

export function agentCardCount(agent: string) {
  return cardsForAgent(agent).length;
}

export function agentGuideCount(agent: string) {
  return guides.filter((item) => item.agents.includes(agent)).length;
}

export function agentHubIndexable(agent: string) {
  return agentCardCount(agent) >= AGENT_HUB_INDEX_MIN;
}

export function agentJobCount(agent: string, job: string) {
  return cardsForAgent(agent).filter((item) => item.category === job).length;
}

export function agentJobIndexable(agent: string, job: string) {
  return agentJobCount(agent, job) >= AGENT_JOB_INDEX_MIN;
}

export function startHere(items: Published[], limit = 5) {
  return [...items].sort(byStart).slice(0, limit).map(toRow);
}

export function latestCards(limit = 8) {
  return [...useCases].sort(byRecent).slice(0, limit).map(toRow);
}

export function latestGuides(limit = 5) {
  return [...guides].sort(byRecent).slice(0, limit).map(toRow);
}

export function jobCounts() {
  return JOBS.map((job) => ({
    ...job,
    cards: cardsForJob(job.slug).length,
    templates: templatesForJob(job.slug).length,
  }));
}

export function outcomeCounts() {
  return OUTCOMES.map((outcome) => ({
    ...outcome,
    cards: cardsForOutcome(outcome.slug).length,
    templates: templatesForOutcome(outcome.slug).length,
  }));
}

export function agentCounts() {
  return AGENTS.map((agent) => ({
    ...agent,
    cards: agentCardCount(agent.slug),
    guides: agentGuideCount(agent.slug),
    templates: templatesForAgent(agent.slug).length,
    indexable: agentHubIndexable(agent.slug),
  }));
}

export function groupByJob(items: Published[]) {
  return JOBS.map((job) => ({
    ...job,
    href: jobPath(job.slug),
    rows: items.filter((item) => item.category === job.slug).sort(byStart).map(toRow),
  })).filter((group) => group.rows.length > 0);
}

export function groupByAgent(items: Published[]) {
  return AGENTS.map((agent) => ({
    ...agent,
    href: agentPath(agent.slug),
    rows: items.filter((item) => item.agents.includes(agent.slug)).sort(byStart).map(toRow),
  })).filter((group) => group.rows.length > 0);
}

export function jobsForAgent(agent: string) {
  return JOBS.map((job) => ({
    ...job,
    href: agentJobPath(agent, job.slug),
    count: agentJobCount(agent, job.slug),
  })).filter((job) => job.count > 0);
}

export function searchUseCases(query: string) {
  const q = query.trim().toLowerCase();
  const list = q
    ? useCases.filter((item) =>
        `${item.title} ${item.summary} ${item.whatTheyDid} ${agentLabels(item.agents)} ${item.creator?.handle ?? ""}`
          .toLowerCase()
          .includes(q),
      )
    : useCases;
  return [...list].sort(byRecent).map(toRow);
}

function creatorKey(handle: string) {
  return handle.replace(/^@+/, "").toLowerCase();
}

export function creators() {
  const map = new Map<string, { handle: string; url: string; items: Published[] }>();
  for (const item of [...cards(), ...templates]) {
    if (!item.creator) continue;
    const key = creatorKey(item.creator.handle);
    const row = map.get(key) ?? { handle: item.creator.handle, url: item.creator.url, items: [] };
    row.items.push(item);
    map.set(key, row);
  }
  return [...map.values()].sort((a, b) => b.items.length - a.items.length || a.handle.localeCompare(b.handle));
}

export function getCreator(handle: string) {
  const key = creatorKey(handle);
  return creators().find((creator) => creatorKey(creator.handle) === key) ?? null;
}

export function relatedLinks(item: Published, min = 6, max = 8): RelatedLink[] {
  const pool: Published[] = [...cards(), ...templates].filter((other) => hrefFor(other) !== hrefFor(item));
  const scored = pool.map((other) => {
    let score = 0;
    if (other.category === item.category) score += 4;
    if (other.outcome === item.outcome) score += 2;
    if (other.agents.some((agent) => item.agents.includes(agent))) score += 2;
    if (item.creator && other.creator && creatorKey(other.creator.handle) === creatorKey(item.creator.handle)) score += 5;
    if (other.kind === "guide") score += 1;
    return { other, score };
  });
  scored.sort((a, b) => b.score - a.score || byRecent(a.other, b.other));
  const links: RelatedLink[] = [];
  const seen = new Set<string>();
  function push(link: RelatedLink) {
    if (links.length >= max || seen.has(link.href)) return;
    seen.add(link.href);
    links.push(link);
  }
  for (const { other, score } of scored) {
    if (score <= 0) break;
    push({
      href: hrefFor(other),
      label: other.title,
      note: `${agentLabels(other.agents)} · ${jobBySlug(other.category)?.label ?? other.category}`,
    });
  }
  const agent = item.agents[0];
  if (agent) {
    push({ href: agentPath(agent), label: `${agentBySlug(agent)?.name ?? agent} use cases`, note: "Agent hub" });
    push({
      href: agentJobPath(agent, item.category),
      label: `${agentBySlug(agent)?.name ?? agent} · ${jobBySlug(item.category)?.label ?? ""}`,
      note: "Same agent and job",
    });
  }
  push({ href: jobPath(item.category), label: jobBySlug(item.category)?.label ?? item.category, note: "Job hub" });
  push({ href: outcomePath(item.outcome), label: outcomeBySlug(item.outcome)?.label ?? item.outcome, note: "Outcome hub" });
  if (item.kind === "guide") {
    push({ href: "/guides", label: "All guides", note: "Guides" });
  }
  if (item.agents.includes("grok-bot")) {
    push({ href: "/agents/grok-bot/templates", label: "Grok Bot templates", note: "Template catalog" });
  }
  for (const roundup of roundups) {
    push({ href: `/roundups/${roundup.slug}`, label: roundup.title, note: "Roundup" });
    if (links.length >= min) break;
  }
  if (item.creator) {
    push({
      href: `/creators/${creatorKey(item.creator.handle)}`,
      label: `@${item.creator.handle}`,
      note: "Creator",
    });
  }
  return links.slice(0, max);
}

export function roundupRows(roundup: RoundupRecord) {
  return roundup.entries
    .map((entry) => {
      const record = entry.kind === "use-case" ? getUseCase(entry.slug) : getTemplate(entry.slug);
      return record ? { record, row: toRow(record) } : null;
    })
    .filter((item): item is { record: UseCaseRecord | TemplateRecord; row: Row } => Boolean(item));
}

export function hubFaqs(label: string, cardCount: number, templateCount: number, topJobs: { label: string; count: number }[]) {
  const top = topJobs
    .slice(0, 3)
    .map((job) => `${job.label} (${job.count})`)
    .join(", ");
  return [
    {
      question: `How many published examples are in ${label}?`,
      answer: `${cardCount} use cases and guides, plus ${templateCount} Grok Bot templates. Both counts are from what is published on this site.`,
    },
    {
      question: "Which jobs show up most?",
      answer: top ? `The largest groups here are ${top}.` : "Nothing is published in this hub yet.",
    },
    {
      question: "What does Unconfirmed mean?",
      answer: "The source did not state a result. The page does not fill one in.",
    },
  ];
}

export function sitemapRecords() {
  type Entry = { path: string; lastmod: string | null; indexable: boolean };
  const entries: Entry[] = [];
  function add(path: string, lastmod: string | null, indexable = true) {
    entries.push({ path, lastmod, indexable });
  }

  const stamp = (items: { updatedAt?: string | null; addedAt?: string | null }[]) => {
    const dates = items.map((item) => item.updatedAt || item.addedAt || "").filter(Boolean).sort();
    return dates.at(-1) ?? null;
  };

  add("/", stamp([...useCases, ...guides, ...templates]), true);
  add("/agents", stamp(cards()), true);
  add("/job", stamp(cards()), true);
  add("/outcomes", stamp(cards()), true);
  add("/use-cases", stamp(useCases), true);
  add("/guides", stamp(guides), true);
  add("/roundups", stamp(cards()), true);
  add("/experiments", "2026-10-13T00:00:00.000Z", true);
  add("/agents/grok-bot/templates", stamp(templates), true);

  for (const agent of AGENTS) {
    const agentCards = cardsForAgent(agent.slug);
    add(agentPath(agent.slug), stamp(agentCards.length ? agentCards : templatesForAgent(agent.slug)), agentHubIndexable(agent.slug));
    for (const job of JOBS) {
      const count = agentJobCount(agent.slug, job.slug);
      if (!count) continue;
      const items = agentCards.filter((item) => item.category === job.slug);
      add(agentJobPath(agent.slug, job.slug), stamp(items), agentJobIndexable(agent.slug, job.slug));
    }
  }

  for (const job of JOBS) {
    const items = [...cardsForJob(job.slug), ...templatesForJob(job.slug)];
    if (!items.length) continue;
    add(jobPath(job.slug), stamp(items), true);
  }
  for (const outcome of OUTCOMES) {
    const items = [...cardsForOutcome(outcome.slug), ...templatesForOutcome(outcome.slug)];
    if (!items.length) continue;
    add(outcomePath(outcome.slug), stamp(items), true);
  }
  for (const item of useCases) add(`/use-cases/${item.slug}`, item.updatedAt, true);
  for (const item of guides) add(`/guides/${item.slug}`, item.updatedAt, true);
  for (const item of templates) add(`/agents/grok-bot/templates/${item.slug}`, item.updatedAt, true);
  for (const item of roundups) {
    const members = roundupRows(item).map((row) => row.record);
    add(`/roundups/${item.slug}`, stamp(members), true);
  }
  for (const creator of creators()) {
    add(`/creators/${creatorKey(creator.handle)}`, stamp(creator.items), true);
  }

  return entries.filter((entry) => entry.indexable);
}

export function isCardRecord(item: Published) {
  return isCard(item);
}
