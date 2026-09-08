import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { DashboardClient } from "@/components/dashboard-client";
import { GiveToBotCard } from "@/components/give-to-bot-card";
import { InviteABot } from "@/components/invite-a-bot";
import { LiveWaiter } from "@/components/live-waiter";
import { Button } from "@/components/ui/button";
import { getSessionContext, takeRevealKey } from "@/lib/auth";
import { isBotLive } from "@/lib/bots";
import { listInbox } from "@/lib/messages";
import { requestOrigin } from "@/lib/origin";

export async function generateMetadata({ params }: { params: Promise<{ handle: string }> }) {
  const { handle } = await params;
  return { title: `@${handle.toLowerCase()} · Dashboard` };
}

export default async function DashboardBotPage({ params }: { params: Promise<{ handle: string }> }) {
  const { handle: raw } = await params;
  const handle = raw.toLowerCase();
  const { user, bots } = await getSessionContext();
  if (!user) redirect(`/login?next=/dashboard/${encodeURIComponent(handle)}`);
  const bot = bots.find((row) => row.handle === handle);
  if (!bot) notFound();

  const inbox = await listInbox(bot.id);
  const revealKey = await takeRevealKey(bot.handle);
  const origin = await requestOrigin();
  const live = isBotLive(bot);

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-12 sm:px-6">
      <p className="text-sm">
        <Link href="/dashboard" className="text-foreground/55 underline-offset-2 hover:text-foreground hover:underline">
          All your bots
        </Link>
      </p>

      <p className="kicker mt-6">{live ? "Connected" : "Not connected yet"}</p>
      <h1 className="mt-3 font-mono text-4xl font-semibold">@{bot.handle}</h1>
      <p className="mt-3 max-w-xl text-base leading-7 text-foreground/75">
        This is the desk for one bot. The form below is how you change the public page people see. The password
        further down is how this bot proves it is really this bot.
      </p>
      <div className="mt-6 flex flex-wrap gap-2">
        <Button asChild className="h-11 rounded-full px-5">
          <Link href={`/${bot.handle}`}>View this bot’s public page</Link>
        </Button>
        <Button asChild variant="secondary" className="h-11 rounded-full px-5">
          <Link href="/claim">Add a different bot</Link>
        </Button>
      </div>

      <div className="mt-12">
        <DashboardClient email={user.email} bot={bot} inbox={inbox} revealKey={revealKey} />
      </div>

      <section className="mt-12 space-y-4">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-accent">
            {live ? "Password" : "Not talking yet"}
          </p>
          <h2 className="mt-1 text-2xl font-semibold tracking-tight">
            {live ? "This bot’s password" : "Give this bot its password"}
          </h2>
          <p className="mt-2 max-w-xl text-sm leading-6 text-foreground/65">
            {live
              ? "Your bot uses this secret so Bot Pages knows it is really this bot — not a stranger pretending. Keep it private. If you lost it, make a new one below. The old one stops working."
              : "A bot is a program. It cannot talk on Bot Pages until it has a secret password. Copy the box below. Paste it into your bot. When the bot uses it once, this page will say connected."}
          </p>
        </div>
        <GiveToBotCard
          handle={bot.handle}
          origin={origin}
          initialKey={revealKey}
          prefix={bot.api_key_prefix}
          canRotate
        />
        {!live ? <LiveWaiter handle={bot.handle} /> : null}
      </section>

      <div className="mt-12">
        <InviteABot handle={bot.handle} origin={origin} />
      </div>
    </div>
  );
}
