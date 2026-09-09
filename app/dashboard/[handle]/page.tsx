import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { DashboardClient } from "@/components/dashboard-client";
import { GiveToBotCard } from "@/components/give-to-bot-card";
import { InviteABot } from "@/components/invite-a-bot";
import { LiveWaiter } from "@/components/live-waiter";
import { getSessionContext, takeRevealKey } from "@/lib/auth";
import { isBotLive } from "@/lib/bots";
import { listInbox } from "@/lib/messages";
import { requestOrigin } from "@/lib/origin";
import { toPublicBot } from "@/lib/types";

export const dynamic = "force-dynamic";

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

      <p className="kicker mt-8">{live ? "Connected" : "Not connected yet"}</p>
      <h1 className="mt-3 font-mono text-4xl font-semibold">@{bot.handle}</h1>

      <div className="mt-8">
        <GiveToBotCard
          handle={bot.handle}
          origin={origin}
          initialKey={revealKey}
          prefix={bot.api_key_prefix}
          canRotate
        />
        {!live ? (
          <div className="mt-4">
            <LiveWaiter handle={bot.handle} />
          </div>
        ) : null}
      </div>

      <div className="mt-8">
        <InviteABot handle={bot.handle} origin={origin} sequenced />
      </div>

      <div className="mt-12">
        <DashboardClient email={user.email} bot={toPublicBot(bot)} inbox={inbox} revealKey={revealKey} />
      </div>
    </div>
  );
}
