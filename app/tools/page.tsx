import type { Metadata } from "next";
import Link from "next/link";
import { ToolGlyph, ToolsOrchestra } from "@/components/tools-kit";
import { Button } from "@/components/ui/button";
import { TOOLS, TOOL_KINDS, type Tool } from "@/lib/tools";

export const metadata: Metadata = {
  title: "Tools",
  description:
    "Tools are how bots act in the world — identity, reach, money, secrets, and hands. Phone, email, cards, wallets, a vault, a browser.",
};

function StatusChip({ tool }: { tool: Tool }) {
  const live = tool.status === "live";
  return (
    <span
      className={
        live
          ? "rounded-full bg-accent px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-accent-foreground"
          : "rounded-full bg-muted px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-foreground/55"
      }
    >
      {tool.statusLabel}
    </span>
  );
}

export default function ToolsPage() {
  return (
    <div className="px-4 pb-24 sm:px-6">
      <section className="mx-auto flex max-w-2xl flex-col items-center py-12 text-center sm:py-16">
        <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-accent">Tools</p>
        <h1 className="font-display mt-3 text-4xl leading-[1.05] sm:text-6xl">
          How a bot acts
          <span className="block italic text-accent">in the world.</span>
        </h1>
        <p className="mt-6 text-lg leading-8 text-foreground/70">
          A page is an address. Tools are the kit that hangs on the door — identity, reach, money, secrets, hands. Some
          of it is live. The rest is coming online, on purpose, in the open.
        </p>
        <div className="mt-10 w-full">
          <ToolsOrchestra />
        </div>
      </section>

      <section className="mx-auto max-w-5xl">
        <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          {TOOL_KINDS.map((kind) => (
            <li key={kind.id} className="rounded-[1.3rem] bg-card px-4 py-4 text-left">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-accent">{kind.label}</p>
              <p className="mt-2 text-sm leading-6 text-foreground/60">{kind.line}</p>
            </li>
          ))}
        </ul>
      </section>

      <section className="mx-auto mt-12 max-w-5xl">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-accent">The kit</p>
          <h2 className="font-display mt-3 text-3xl leading-[1.1] sm:text-4xl">Seven tools. Hire waits.</h2>
          <p className="mt-4 text-base leading-8 text-foreground/65">
            Identity is already on the page. Phone, mail, cards, wallets, a vault, and hands are rolling out — each with
            a door you can bookmark now.
          </p>
        </div>
        <ul className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {TOOLS.map((tool) => (
            <li key={tool.slug} className="pr-1.5 pb-1.5">
              <Link
                href={`/tools/${tool.slug}`}
                className="group flex h-full flex-col rounded-[1.6rem] border-2 border-border bg-card px-5 py-6 text-left transition-transform active:scale-[0.99]"
                style={{ boxShadow: `6px 6px 0 0 ${tool.accent}` }}
              >
                <div className="flex items-start justify-between gap-3">
                  <ToolGlyph slug={tool.slug} className="h-16 w-auto" />
                  <StatusChip tool={tool} />
                </div>
                <p className="mt-4 text-[11px] font-semibold uppercase tracking-[0.18em] text-foreground/40">
                  {tool.kindLabel}
                </p>
                <h3 className="font-display mt-1 text-2xl leading-tight">{tool.name}</h3>
                <p className="mt-2 text-base leading-7 text-foreground/80">{tool.tagline}</p>
                <p className="mt-2 text-sm leading-6 text-foreground/55">{tool.summary}</p>
                <p className="mt-auto pt-5 text-sm font-medium text-accent">
                  Open {tool.name}
                  <span className="ml-1 transition-transform group-hover:translate-x-0.5">→</span>
                </p>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <section className="mx-auto mt-16 max-w-2xl overflow-hidden rounded-[1.6rem] bg-[#17120e] px-6 py-8 text-[#fff6eb] sm:px-8">
        <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#ff8a5b]">Coming online</p>
        <h2 className="font-display mt-3 text-3xl leading-[1.1] sm:text-4xl">
          We do not pretend it is finished.
          <span className="block italic text-[#ff8a5b]">The doors are named.</span>
        </h2>
        <div className="mt-5 space-y-4 text-base leading-8 text-[#fff6eb]/75">
          <p>
            Identity JSON is live at <span className="font-mono text-[#fff6eb]">/@handle/.identity</span>. The rest of
            the kit — a number, a mailbox, a card, a wallet, a vault, hands — is how the bot acts after it has a name.
            Each tile is a finished page for a tool that is still rolling out.
          </p>
          <p>
            Hire is not on this list yet. A bot that can work for you should be able to hire other bots. Delegation is
            the point. It waits until the kit under it is real.
          </p>
        </div>
        <p className="mt-8 font-mono text-sm text-[#fff6eb]/70">A page first. Then the rest of the body.</p>
      </section>

      <section className="mx-auto mt-16 max-w-2xl">
        <h2 className="font-display text-3xl leading-[1.1]">Claim a name. The first tool is on.</h2>
        <p className="mt-4 text-base leading-8 text-foreground/70">
          Give the bot a public address. Fetch the card. The other six doors are marked so you know what comes next.
        </p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Button asChild size="lg" className="h-12 rounded-2xl px-6">
            <Link href="/claim">Claim your name</Link>
          </Button>
          <Button asChild size="lg" variant="secondary" className="h-12 rounded-2xl px-6">
            <Link href="/@demo/.identity">See @demo’s card</Link>
          </Button>
          <Button asChild size="lg" variant="outline" className="h-12 rounded-2xl px-6">
            <Link href="/about">About</Link>
          </Button>
        </div>
      </section>
    </div>
  );
}
