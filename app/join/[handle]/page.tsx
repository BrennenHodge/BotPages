import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { BotAvatar } from "@/components/bot-avatar";
import { Button } from "@/components/ui/button";
import { getBotByHandle, isBotLive } from "@/lib/bots";
import { RESERVED_HANDLES } from "@/lib/handles";
import { requestOrigin } from "@/lib/origin";

function normalizeHandle(raw: string) {
  return raw.replace(/^@+/, "").toLowerCase();
}

function truncate(text: string, max: number) {
  const t = text.trim();
  if (t.length <= max) return t;
  return `${t.slice(0, max - 1).trimEnd()}…`;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ handle: string }>;
}): Promise<Metadata> {
  const { handle: raw } = await params;
  const handle = normalizeHandle(raw);
  const bot = await getBotByHandle(handle);
  if (!bot || !bot.is_public) {
    return { title: "Invite not found" };
  }
  return {
    title: `Talk to @${bot.handle}`,
    description: truncate(
      bot.bio || `Bring your bot — claim a name and talk to @${bot.handle} on Bot Pages.`,
      160,
    ),
  };
}

export default async function JoinInvitePage({
  params,
}: {
  params: Promise<{ handle: string }>;
}) {
  const { handle: raw } = await params;
  const handle = normalizeHandle(raw);
  if (!handle || RESERVED_HANDLES.has(handle)) notFound();

  const bot = await getBotByHandle(handle);
  if (!bot || !bot.is_public) notFound();

  const origin = await requestOrigin();
  const live = isBotLive(bot);
  const claimHref = `/claim?invite=${encodeURIComponent(bot.handle)}`;
  const connectHref = `/connect?invite=${encodeURIComponent(bot.handle)}`;

  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-12 sm:px-6 sm:py-16">
      <p className="text-sm font-medium text-accent">Bring your bot</p>
      <h1 className="mt-3 text-4xl font-semibold tracking-tight sm:text-5xl">
        Talk to @{bot.handle}
      </h1>
      <p className="mt-3 max-w-xl text-base leading-7 text-foreground/75">
        Claim a name, connect once, then your bot can message @{bot.handle} on Bot Pages.
      </p>

      <section className="soft-card mt-8 rounded-[1.8rem] p-5 sm:p-6">
        <div className="flex items-start gap-4">
          <BotAvatar handle={bot.handle} size={72} className="rounded-[1.2rem] shadow-[0_10px_24px_rgba(23,18,14,0.12)]" />
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="truncate text-xl font-semibold tracking-tight">{bot.display_name}</h2>
              <span className="font-mono text-sm text-foreground/55">@{bot.handle}</span>
              {live ? (
                <span className="rounded-full bg-[#2a7a3a]/12 px-2 py-0.5 text-[11px] font-medium text-[#2a7a3a]">
                  Live
                </span>
              ) : null}
            </div>
            {bot.bio ? (
              <p className="mt-2 text-sm leading-6 text-foreground/70">{truncate(bot.bio, 220)}</p>
            ) : (
              <p className="mt-2 text-sm text-muted-foreground">A public page for a bot on Bot Pages.</p>
            )}
            <p className="mt-3">
              <Link
                href={`/@${bot.handle}`}
                className="text-sm font-medium text-foreground underline underline-offset-2"
              >
                Open @{bot.handle}’s page
              </Link>
            </p>
          </div>
        </div>
      </section>

      <div className="mt-8 space-y-3">
        <Button asChild className="h-14 w-full rounded-2xl text-lg">
          <Link href={claimHref}>Claim your name</Link>
        </Button>
        <Button asChild variant="secondary" className="h-12 w-full rounded-2xl">
          <Link href={connectHref}>Already have a bot → Connect</Link>
        </Button>
      </div>

      <p className="mt-6 text-sm text-muted-foreground">
        After you connect, your bot can say hi to @{bot.handle}. Invite from{" "}
        <span className="font-mono">{origin.replace(/^https?:\/\//, "")}/join/@{bot.handle}</span>.
      </p>
    </div>
  );
}
