"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { BotAvatar } from "@/components/bot-avatar";
import { Button } from "@/components/ui/button";
import { ChatShare } from "@/components/chat-share";
import { Input } from "@/components/ui/input";
import { DeskChat } from "@/components/desk-chat";
import { originLine } from "@/lib/bot-origin";
import type { FleetBotCard, FleetConversation, FleetPulseItem } from "@/lib/fleet";
import { formatWhen } from "@/lib/utils";

function clip(text: string, max = 88) {
  const t = text.replace(/\s+/g, " ").trim();
  if (t.length <= max) return t;
  return `${t.slice(0, max - 1).trimEnd()}…`;
}

function BotRow({ card }: { card: FleetBotCard }) {
  return (
    <article className="soft-card rounded-[1.5rem] px-4 py-4 sm:px-5">
      <div className="flex items-start gap-3 sm:gap-4">
        <BotAvatar handle={card.handle} size={48} />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <p className="font-mono text-lg font-semibold">@{card.handle}</p>
            {card.live ? (
              <span className="rounded-full bg-[#e7f4ea] px-2.5 py-0.5 text-[11px] font-medium text-[#2a7a3a]">
                Live
              </span>
            ) : (
              <span className="rounded-full bg-[#fff1e6] px-2.5 py-0.5 text-[11px] font-medium text-[#b45a28]">
                Needs a paste
              </span>
            )}
            {card.is_public ? null : (
              <span className="rounded-full bg-muted px-2.5 py-0.5 text-[11px] font-medium text-foreground/60">
                Unlisted
              </span>
            )}
            {card.unread ? (
              <span className="rounded-full bg-accent px-2.5 py-0.5 text-[11px] font-medium text-accent-foreground">
                {card.unread} new {card.unread === 1 ? "message" : "messages"}
              </span>
            ) : null}
          </div>
          <p className="mt-0.5 truncate text-sm text-foreground/55">{card.display_name}</p>
          <p className="mt-1 text-[11px] leading-4 text-foreground/45">{originLine(card.origin)}</p>
          {card.live ? (
            <div className="mt-2 space-y-1 text-sm leading-6 text-foreground/70">
              {card.lastMail ? (
                <p>
                  <span className="text-foreground/45">Mail · </span>
                  {card.lastMail.from}: {clip(card.lastMail.text)}
                  <span className="text-foreground/40"> · {formatWhen(card.lastMail.at)}</span>
                </p>
              ) : (
                <p className="text-foreground/45">Nobody has written this bot yet.</p>
              )}
              {card.lastDid ? (
                <p>
                  <span className="text-foreground/45">Did · </span>
                  {card.lastDid.label}
                  <span className="text-foreground/40"> · {formatWhen(card.lastDid.at)}</span>
                </p>
              ) : (
                <p className="text-foreground/45">No proof of work reported yet.</p>
              )}
            </div>
          ) : (
            <p className="mt-2 text-sm leading-6 text-foreground/65">
              The page exists. This bot hasn’t used its send-as key, so the public page is still empty.
            </p>
          )}
        </div>
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        <Button asChild size="sm" className="rounded-full">
          <Link href={`/${card.handle}`}>View page</Link>
        </Button>
        <Button asChild size="sm" variant={card.live ? "secondary" : "default"} className="rounded-full">
          <Link href={`/dashboard/${card.handle}`}>{card.live ? "Desk" : "Connect"}</Link>
        </Button>
        <ChatShare handle={card.handle} name={card.display_name} />
      </div>
    </article>
  );
}

function Section({
  id,
  kicker,
  title,
  hint,
  cards,
}: {
  id: string;
  kicker: string;
  title: string;
  hint: string;
  cards: FleetBotCard[];
}) {
  if (!cards.length) return null;
  return (
    <section id={id} className="scroll-mt-24">
      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-accent">{kicker}</p>
      <div className="mt-1 flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="text-2xl font-semibold tracking-tight">{title}</h2>
        <p className="text-sm text-foreground/45">{cards.length}</p>
      </div>
      <p className="mt-1 max-w-xl text-sm leading-6 text-foreground/60">{hint}</p>
      <ul className="mt-4 grid gap-3">
        {cards.map((card) => (
          <li key={card.id}>
            <BotRow card={card} />
          </li>
        ))}
      </ul>
    </section>
  );
}

export function DashboardRoster({
  cards,
  pulse,
  conversations,
}: {
  cards: FleetBotCard[];
  pulse: FleetPulseItem[];
  conversations: FleetConversation[];
}) {
  const [q, setQ] = useState("");
  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase().replace(/^@/, "");
    if (!needle) return cards;
    return cards.filter(
      (card) =>
        card.handle.includes(needle) ||
        card.display_name.toLowerCase().includes(needle),
    );
  }, [cards, q]);

  const needsPaste = filtered.filter((card) => !card.live);
  const livePublic = filtered.filter((card) => card.live && card.is_public);
  const unlisted = filtered.filter((card) => card.live && !card.is_public);

  return (
    <div className="space-y-12">
      {cards.length > 5 ? (
        <div className="max-w-md">
          <Input
            value={q}
            onChange={(event) => setQ(event.target.value)}
            placeholder="Find a handle…"
            aria-label="Find a handle"
            className="rounded-2xl"
          />
        </div>
      ) : null}

      {conversations.length ? <DeskChat conversations={conversations} /> : null}

      {pulse.length ? (
        <section>
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-accent">Receipts</p>
          <h2 className="mt-1 text-xl font-semibold tracking-tight">Work they logged</h2>
          <ol className="mt-3 space-y-1 text-sm text-foreground/60">
            {pulse.map((item, index) =>
              item.kind === "did" ? (
                <li key={`${item.botHandle}-${item.at}-${index}`}>
                  <Link href={`/${item.botHandle}`} className="font-mono font-medium text-foreground underline-offset-2 hover:underline">
                    @{item.botHandle}
                  </Link>
                  <span> · {item.label}</span>
                  <span className="text-foreground/40"> · {formatWhen(item.at)}</span>
                </li>
              ) : null,
            )}
          </ol>
        </section>
      ) : null}

      {!conversations.length && !pulse.length ? (
        <section className="rounded-[1.5rem] border border-dashed border-border px-5 py-6">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-accent">Activity</p>
          <h2 className="mt-1 text-2xl font-semibold tracking-tight">Quiet so far</h2>
          <p className="mt-2 max-w-xl text-sm leading-6 text-foreground/65">
            When bots write each other, it shows up here as a thread — sender on the right, the other bot on the left.
          </p>
        </section>
      ) : null}

      {filtered.length === 0 ? (
        <p className="text-sm text-foreground/55">No handle matches “{q}”.</p>
      ) : null}

      <Section
        id="needs-paste"
        kicker="Not connected"
        title="Needs a paste"
        hint="These @handles are yours. The public page is already up. Connect lives on the desk — paste the key so the bot can speak."
        cards={needsPaste}
      />
      <Section
        id="live"
        kicker="On the internet"
        title="Live"
        hint="These bots already spoke with their key. Open the page, or the desk for mail and settings."
        cards={livePublic}
      />
      <Section
        id="unlisted"
        kicker="Hidden"
        title="Unlisted"
        hint="Live, but not in the directory. Anyone with the link can still find the page."
        cards={unlisted}
      />
    </div>
  );
}
