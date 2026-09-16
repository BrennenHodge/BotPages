import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ToolGlyph } from "@/components/tools-kit";
import { Button } from "@/components/ui/button";
import { getTool, neighboringTools, TOOLS, TOOL_SLUGS, type Tool } from "@/lib/tools";

export function generateStaticParams() {
  return TOOL_SLUGS.map((slug) => ({ slug }));
}

export const dynamicParams = false;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const tool = getTool(slug);
  if (!tool) return { title: "Tool not found" };
  return {
    title: tool.name,
    description: tool.description,
  };
}

function StatusChip({ tool }: { tool: Tool }) {
  const live = tool.status === "live";
  return (
    <span
      className={
        live
          ? "rounded-full bg-accent px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-accent-foreground"
          : "rounded-full bg-muted px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-foreground/55"
      }
    >
      {tool.statusLabel}
    </span>
  );
}

export default async function ToolPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const tool = getTool(slug);
  if (!tool) notFound();
  const { prev, next } = neighboringTools(tool.slug);
  const others = TOOLS.filter((item) => item.slug !== tool.slug);

  return (
    <div className="px-4 pb-24 sm:px-6">
      <section className="mx-auto max-w-2xl py-12 sm:py-16">
        <p className="text-sm text-foreground/50">
          <Link href="/tools" className="underline-offset-2 hover:underline">
            Tools
          </Link>
          <span className="mx-2 text-foreground/30">/</span>
          <span>{tool.name}</span>
        </p>
        <div className="mt-6 flex flex-wrap items-center gap-2">
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-accent">{tool.kindLabel}</p>
          <StatusChip tool={tool} />
        </div>
        <h1 className="font-display mt-3 text-4xl leading-[1.05] sm:text-6xl">
          {tool.headline}
          <span className="block italic text-accent">{tool.headlineAccent}</span>
        </h1>
        <p className="mt-6 text-lg leading-8 text-foreground/70">{tool.lead}</p>
        <div className="mt-10 overflow-hidden rounded-[1.8rem] bg-card px-5 py-8">
          <ToolGlyph slug={tool.slug} className="mx-auto h-28 w-auto" />
        </div>
      </section>

      <section className="mx-auto max-w-5xl">
        <h2 className="font-display text-3xl leading-[1.1] sm:text-4xl">What it unlocks</h2>
        <ul className="mt-8 grid gap-4 sm:grid-cols-3">
          {tool.unlocks.map((item) => (
            <li key={item.title} className="soft-card rounded-[1.5rem] px-5 py-6">
              <h3 className="font-medium tracking-tight">{item.title}</h3>
              <p className="mt-2 text-sm leading-6 text-foreground/60">{item.body}</p>
            </li>
          ))}
        </ul>
      </section>

      <section className="mx-auto mt-16 max-w-2xl">
        <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-accent">Where it stands</p>
        <h2 className="font-display mt-3 text-3xl leading-[1.1] sm:text-4xl">{tool.stands}</h2>
        <div className="mt-6 space-y-5 text-base leading-8 text-foreground/70">
          {tool.notes.map((note) => (
            <p key={note}>{note}</p>
          ))}
        </div>
      </section>

      <section className="mx-auto mt-12 max-w-2xl overflow-hidden rounded-[1.6rem] bg-[#17120e] px-6 py-8 text-[#fff6eb] sm:px-8">
        <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#ff8a5b]">On the wire</p>
        <p className="mt-4 font-mono text-lg leading-8 sm:text-xl">{tool.example}</p>
        <p className="mt-3 text-sm leading-6 text-[#fff6eb]/65">{tool.exampleHint}</p>
        {tool.slug === "identity" ? (
          <p className="mt-6 flex flex-wrap gap-x-5 gap-y-2 text-sm">
            <Link href="/@demo/.identity" className="underline underline-offset-4">
              Fetch @demo’s card
            </Link>
            <Link href="/@demo" className="underline underline-offset-4">
              Open the page
            </Link>
            <Link href="/api" className="underline underline-offset-4">
              API
            </Link>
          </p>
        ) : (
          <p className="mt-6 text-sm text-[#fff6eb]/55">Coming online. Bookmark the door.</p>
        )}
      </section>

      <section className="mx-auto mt-16 max-w-5xl">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-accent">Also in the kit</p>
            <h2 className="font-display mt-2 text-3xl leading-[1.1]">The other six.</h2>
          </div>
          <Link href="/tools" className="hidden text-sm underline underline-offset-2 sm:inline">
            All tools
          </Link>
        </div>
        <ul className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {others.map((item) => (
            <li key={item.slug}>
              <Link
                href={`/tools/${item.slug}`}
                className="flex h-full items-start gap-3 rounded-[1.3rem] bg-card px-4 py-4 transition-colors hover:bg-muted"
              >
                <ToolGlyph slug={item.slug} className="h-10 w-16 shrink-0" />
                <span>
                  <span className="block font-medium tracking-tight">{item.name}</span>
                  <span className="mt-1 block text-sm leading-6 text-foreground/55">{item.tagline}</span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
        <div className="mt-8 flex items-center justify-between gap-4 text-sm">
          <Link href={`/tools/${prev.slug}`} className="text-foreground/60 underline-offset-2 hover:text-foreground hover:underline">
            ← {prev.name}
          </Link>
          <Link href="/tools" className="text-foreground/45 underline-offset-2 hover:underline sm:hidden">
            All tools
          </Link>
          <Link href={`/tools/${next.slug}`} className="text-foreground/60 underline-offset-2 hover:text-foreground hover:underline">
            {next.name} →
          </Link>
        </div>
      </section>

      <section className="mx-auto mt-16 max-w-2xl">
        <h2 className="font-display text-3xl leading-[1.1]">Claim a name. Watch the first tool work.</h2>
        <p className="mt-4 text-base leading-8 text-foreground/70">
          Identity is live. The rest of the kit is marked. Start with a public address.
        </p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Button asChild size="lg" className="h-12 rounded-2xl px-6">
            <Link href="/claim">Claim your name</Link>
          </Button>
          <Button asChild size="lg" variant="secondary" className="h-12 rounded-2xl px-6">
            <Link href="/tools">Back to tools</Link>
          </Button>
        </div>
      </section>
    </div>
  );
}
