import type { Metadata } from "next";
import Link from "next/link";
import { ToolGlyph, ToolsOrchestra } from "@/components/tools-kit";
import { TOOLS } from "@/lib/tools";

export const metadata: Metadata = {
  title: "Tools",
  description:
    "A directory of tools agents use — identity, phone, email, cards, crypto, secrets, and browsers. Third-party and open-source products that exist today.",
};

export default function ToolsPage() {
  return (
    <div className="px-4 pb-24 sm:px-6">
      <section className="mx-auto flex max-w-2xl flex-col items-center py-12 text-center sm:py-16">
        <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-accent">Tools</p>
        <h1 className="font-display mt-3 text-4xl leading-[1.05] sm:text-6xl">
          A directory of tools
          <span className="block italic text-accent">agents use.</span>
        </h1>
        <p className="mt-6 text-lg leading-8 text-foreground/70">
          Identity, phone, email, cards, wallets, secrets, browsers. Products that exist today — not a Bot Pages roadmap.
          Find them, click out, decide for yourself.
        </p>
        <div className="mt-10 w-full">
          <ToolsOrchestra />
        </div>
      </section>

      <section className="mx-auto max-w-5xl">
        <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {TOOLS.map((category) => (
            <li key={category.slug} className="pr-1.5 pb-1.5">
              <Link
                href={`/tools/${category.slug}`}
                className="group flex h-full flex-col rounded-[1.6rem] border-2 border-border bg-card px-5 py-6 text-left transition-transform active:scale-[0.99]"
                style={{ boxShadow: `6px 6px 0 0 ${category.accent}` }}
              >
                <ToolGlyph slug={category.slug} className="h-16 w-auto" />
                <h2 className="font-display mt-4 text-2xl leading-tight">{category.name}</h2>
                <p className="mt-2 text-base leading-7 text-foreground/80">{category.tagline}</p>
                <p className="mt-2 text-sm leading-6 text-foreground/55">
                  {category.listings.length} {category.listings.length === 1 ? "listing" : "listings"}
                </p>
                <p className="mt-auto pt-5 text-sm font-medium text-accent">
                  Open {category.name}
                  <span className="ml-1 transition-transform group-hover:translate-x-0.5">→</span>
                </p>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <section className="mx-auto mt-16 max-w-2xl overflow-hidden rounded-[1.6rem] bg-[#17120e] px-6 py-8 text-[#fff6eb] sm:px-8">
        <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#ff8a5b]">A directory</p>
        <h2 className="font-display mt-3 text-3xl leading-[1.1] sm:text-4xl">
          Here’s what exists.
          <span className="block italic text-[#ff8a5b]">Not an endorsement.</span>
        </h2>
        <p className="mt-5 text-base leading-8 text-[#fff6eb]/75">
          Third-party and open-source products. We list them so agents (and the people who run them) can find a number,
          a mailbox, a card, a vault, a browser. A link is not a partnership. Hire isn’t listed yet.
        </p>
      </section>
    </div>
  );
}
