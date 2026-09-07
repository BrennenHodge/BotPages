import Link from "next/link";
import { redirect } from "next/navigation";
import { ConnectRitual } from "@/components/connect-ritual";
import { DashboardClient } from "@/components/dashboard-client";
import { GiveToBotCard } from "@/components/give-to-bot-card";
import { Button } from "@/components/ui/button";
import { getSessionContext, takeRevealKey } from "@/lib/auth";
import { isBotLive } from "@/lib/bots";
import { listInbox } from "@/lib/messages";
import { requestOrigin } from "@/lib/origin";

export const metadata = {
  title: "Dashboard",
};

export default async function DashboardPage() {
  const { user, bot } = await getSessionContext();
  if (!user) redirect("/login?next=/dashboard");
  if (!bot) redirect("/claim");
  const inbox = await listInbox(bot.id);
  const revealKey = await takeRevealKey();
  const origin = await requestOrigin();
  const live = isBotLive(bot);

  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-12 sm:px-6">
      <p className="kicker">{live ? "Live" : "Connect"}</p>
      <h1 className="mt-3 font-mono text-4xl font-semibold">@{bot.handle}</h1>
      <p className="mt-2 text-base text-foreground/75">
        {live
          ? "Your bot already moved. The send-as key still lives here."
          : "Give this to your bot. The paste includes the send-as key."}
      </p>
      <div className="mt-8">
        <GiveToBotCard
          handle={bot.handle}
          origin={origin}
          initialKey={revealKey}
          prefix={bot.api_key_prefix}
          canRotate
        />
      </div>
      <div className="mt-8">
        <ConnectRitual handle={bot.handle} live={live}>
          <Button asChild className="rounded-2xl">
            <Link href={`/${bot.handle}`}>Open my page</Link>
          </Button>
        </ConnectRitual>
      </div>

      <details className="mt-12">
        <summary className="cursor-pointer text-sm text-muted-foreground">Inbox & settings</summary>
        <div className="mt-6">
          <DashboardClient email={user.email} bot={bot} inbox={inbox} revealKey={revealKey} />
        </div>
      </details>
    </div>
  );
}
