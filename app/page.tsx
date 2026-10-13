import Link from "next/link";
import { ChipRow, RecordList, SponsorSlot } from "@/components/use-cases/bits";
import { JsonLd } from "@/components/use-cases/json-ld";
import { agentCounts, jobCounts, latestCards, latestGuides, outcomeCounts } from "@/lib/use-cases/content";
import { breadcrumbLd, pageMeta } from "@/lib/use-cases/seo";
import { BRAND, JOB_INDEX_PATH, SITE_ORIGIN, agentPath, jobPath, outcomePath } from "@/lib/use-cases/taxonomy";

export const metadata = pageMeta({
  path: "/",
  absoluteTitle: true,
  title: `AI Agent Use Cases: Real Examples and How-To Guides | ${BRAND}`,
  description:
    "See what people really do with Grok Bot, Claude, ChatGPT, n8n and more. Honest results, copyable prompts and step-by-step guides.",
});

export default function HomePage() {
  const agents = agentCounts();
  const jobs = jobCounts();
  const outcomes = outcomeCounts();
  const fresh = latestCards(8);
  const guideRows = latestGuides(5);
  const indexableAgents = agents.filter((agent) => agent.indexable);

  const websiteLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: BRAND,
    url: SITE_ORIGIN,
    description:
      "Real AI agent use cases you can copy: what people did, how it actually went, and step-by-step guides.",
    potentialAction: {
      "@type": "SearchAction",
      target: `${SITE_ORIGIN}/use-cases?q={query}`,
      "query-input": "required name=query",
    },
  };
  const orgLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: BRAND,
    url: SITE_ORIGIN,
  };

  return (
    <div className="mx-auto w-full max-w-5xl px-4 pb-24 sm:px-6">
      <JsonLd data={websiteLd} />
      <JsonLd data={orgLd} />
      <JsonLd data={breadcrumbLd([{ name: "Home", path: "/" }])} />

      <section className="py-10 sm:py-16">
        <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-accent">Bot Pages</p>
        <h1 className="font-display mt-3 max-w-3xl text-4xl leading-[1.05] sm:text-6xl">
          What people actually do with AI agents
        </h1>
        <p className="mt-4 max-w-xl text-base leading-7 text-foreground/70 sm:text-lg">
          Real AI agent use cases you can copy: what people did, how it actually went, and step-by-step guides with
          results and install links.
        </p>
        <form action="/use-cases" className="mt-6 flex max-w-xl gap-2">
          <label htmlFor="q" className="sr-only">
            Search use cases
          </label>
          <input
            id="q"
            name="q"
            placeholder="Search use cases"
            className="h-12 min-w-0 flex-1 rounded-full border border-foreground/15 bg-card px-4 text-base"
          />
          <button type="submit" className="h-12 shrink-0 rounded-full bg-foreground px-4 text-sm font-medium text-background">
            Search
          </button>
        </form>
      </section>

      <section aria-label="Agents">
        <div className="flex items-baseline justify-between gap-3">
          <h2 className="font-display text-2xl sm:text-3xl">By agent</h2>
          <Link href="/agents" className="text-sm text-foreground/60 underline-offset-4 hover:underline">
            All agents
          </Link>
        </div>
        <div className="-mx-4 mt-4 flex gap-3 overflow-x-auto px-4 pb-2 sm:mx-0 sm:px-0">
          {agents.map((agent) => (
            <Link
              key={agent.slug}
              href={agentPath(agent.slug)}
              className="w-36 shrink-0 rounded-2xl border border-foreground/10 bg-card px-3 py-3"
            >
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-foreground text-sm font-medium text-background">
                {agent.name.slice(0, 1)}
              </span>
              <span className="mt-3 block text-sm font-medium leading-snug">{agent.name}</span>
              <span className="mt-1 block text-xs text-foreground/50">
                {agent.cards} {agent.cards === 1 ? "example" : "examples"}
              </span>
            </Link>
          ))}
        </div>
      </section>

      <section className="mt-10" aria-label="Outcomes">
        <h2 className="font-display text-2xl sm:text-3xl">By outcome</h2>
        <ul className="mt-4 grid grid-cols-2 gap-3 lg:grid-cols-4">
          {outcomes.map((outcome) => (
            <li key={outcome.slug}>
              <Link href={outcomePath(outcome.slug)} className="block h-full rounded-2xl border border-foreground/10 bg-card p-4">
                <span className="font-display text-2xl leading-none">{outcome.label}</span>
                <span className="mt-2 block text-sm text-foreground/55">{outcome.cards} examples</span>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-10" aria-label="Jobs">
        <div className="flex items-baseline justify-between gap-3">
          <h2 className="font-display text-2xl sm:text-3xl">By job</h2>
          <Link href={JOB_INDEX_PATH} className="text-sm text-foreground/60 underline-offset-4 hover:underline">
            All jobs
          </Link>
        </div>
        <div className="mt-4">
          <ChipRow items={jobs.map((job) => ({ href: jobPath(job.slug), label: job.label, count: job.cards }))} />
        </div>
      </section>

      <section className="mt-12">
        <h2 className="font-display text-2xl sm:text-3xl">Latest additions</h2>
        <p className="mt-2 text-sm text-foreground/55">The eight most recently added use cases. Dates come from the source catalog.</p>
        <div className="mt-4">
          <RecordList rows={fresh} />
        </div>
        <SponsorSlot />
      </section>

      <section className="mt-12">
        <h2 className="font-display text-2xl sm:text-3xl">Guides</h2>
        <div className="mt-4">
          <RecordList rows={guideRows} />
        </div>
      </section>

      <section className="mt-12 grid gap-4 sm:grid-cols-2">
        <Link href="/submit" className="rounded-2xl border border-foreground/10 bg-card p-5">
          <h2 className="font-display text-2xl">Send a setup</h2>
          <p className="mt-2 text-sm leading-6 text-foreground/65">
            Share what you did, how it went, and the prompt. A person reviews it before it goes on the site.
          </p>
        </Link>
        <Link href="/newsletter" className="rounded-2xl border border-foreground/10 bg-card p-5">
          <h2 className="font-display text-2xl">Newsletter</h2>
          <p className="mt-2 text-sm leading-6 text-foreground/65">The list is not open yet. The page says what it will be.</p>
        </Link>
      </section>

      <nav className="mt-12" aria-label="Hubs">
        <h2 className="text-[11px] font-semibold uppercase tracking-[0.16em] text-foreground/40">Indexable hubs</h2>
        <ul className="mt-3 flex flex-wrap gap-x-4 gap-y-2 text-sm">
          {indexableAgents.map((agent) => (
            <li key={agent.slug}>
              <Link href={agentPath(agent.slug)} className="underline-offset-4 hover:underline">
                {agent.name}
              </Link>
            </li>
          ))}
          {jobs.map((job) => (
            <li key={job.slug}>
              <Link href={jobPath(job.slug)} className="underline-offset-4 hover:underline">
                {job.label}
              </Link>
            </li>
          ))}
          {outcomes.map((outcome) => (
            <li key={outcome.slug}>
              <Link href={outcomePath(outcome.slug)} className="underline-offset-4 hover:underline">
                {outcome.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
}
