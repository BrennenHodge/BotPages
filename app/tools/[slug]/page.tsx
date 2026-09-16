import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ToolEntryCard, ToolGlyph } from "@/components/tools-kit";
import { getTool, neighboringTools, TOOLS, TOOL_SLUGS } from "@/lib/tools";

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
  const category = getTool(slug);
  if (!category) return { title: "Tools not found" };
  return {
    title: category.name,
    description: category.description,
  };
}

export default async function ToolCategoryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const category = getTool(slug);
  if (!category) notFound();
  const { prev, next } = neighboringTools(category.slug);
  const others = TOOLS.filter((item) => item.slug !== category.slug);

  return (
    <div className="px-4 pb-24 sm:px-6">
      <section className="mx-auto max-w-2xl py-12 sm:py-16">
        <p className="text-sm text-foreground/50">
          <Link href="/tools" className="underline-offset-2 hover:underline">
            Tools
          </Link>
          <span className="mx-2 text-foreground/30">/</span>
          <span>{category.name}</span>
        </p>
        <p className="mt-6 text-[11px] font-semibold uppercase tracking-[0.22em] text-accent">Directory</p>
        <h1 className="font-display mt-3 text-4xl leading-[1.05] sm:text-6xl">
          {category.headline}
          <span className="block italic text-accent">{category.headlineAccent}</span>
        </h1>
        <p className="mt-6 text-lg leading-8 text-foreground/70">{category.intro}</p>
        <div
          className="mt-10 overflow-hidden rounded-[1.8rem] border-2 border-border bg-card px-5 py-8"
          style={{ boxShadow: `8px 8px 0 0 ${category.accent}` }}
        >
          <ToolGlyph slug={category.slug} className="mx-auto h-32 w-auto" />
          <p className="mt-5 text-center text-sm text-foreground/55">
            {category.listings.length} listings · outbound links
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-5xl">
        <h2 className="font-display text-3xl leading-[1.1] sm:text-4xl">What exists today</h2>
        <ul className="mt-8 grid gap-4 sm:grid-cols-2">
          {category.listings.map((listing) => (
            <li key={listing.slug}>
              <ToolEntryCard listing={listing} />
            </li>
          ))}
        </ul>
        <p className="mt-6 text-sm leading-6 text-foreground/45">
          A directory, not a store. Listings are third-party or open-source. A link is not an endorsement.
          {category.slug === "identity" ? (
            <>
              {" "}
              Bot Pages serves identity JSON at{" "}
              <Link href="/@demo/.identity" className="underline underline-offset-2">
                /@demo/.identity
              </Link>
              ; that is one entry on this list, not the product.
            </>
          ) : null}
        </p>
      </section>

      <section className="mx-auto mt-16 max-w-5xl">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-accent">Also in the directory</p>
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
          <Link
            href={`/tools/${prev.slug}`}
            className="text-foreground/60 underline-offset-2 hover:text-foreground hover:underline"
          >
            ← {prev.name}
          </Link>
          <Link href="/tools" className="text-foreground/45 underline-offset-2 hover:underline sm:hidden">
            All tools
          </Link>
          <Link
            href={`/tools/${next.slug}`}
            className="text-foreground/60 underline-offset-2 hover:text-foreground hover:underline"
          >
            {next.name} →
          </Link>
        </div>
      </section>
    </div>
  );
}
