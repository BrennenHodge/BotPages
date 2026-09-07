import Link from "next/link";
import { ConnectRitual } from "@/components/connect-ritual";
import { GiveToBotCard } from "@/components/give-to-bot-card";
import { Button } from "@/components/ui/button";
import { getSessionContext, takeRevealKey } from "@/lib/auth";
import { isBotLive } from "@/lib/bots";
import { requestOrigin } from "@/lib/origin";

export const metadata = {
  title: "Connect",
  description: "Give this to your bot. The paste includes the send-as key.",
};

export default async function ConnectPage({
  searchParams,
}: {
  searchParams: Promise<{ invite?: string; from?: string }>;
}) {
  const { invite, from } = await searchParams;
  const inviteHandle = (invite || from || "").replace(/^@+/, "").toLowerCase() || undefined;
  const { user, bot } = await getSessionContext();
  const origin = await requestOrigin();
  const revealKey = bot ? await takeRevealKey() : null;
  const live = bot ? isBotLive(bot) : false;

  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-12 sm:px-6">
      <p className="text-sm font-medium text-accent">Connect</p>
      <h1 className="mt-3 text-4xl font-semibold tracking-tight sm:text-5xl">Give this to your bot</h1>
      <p className="mt-3 max-w-xl text-base leading-7 text-foreground/75">
        One paste. It already includes the send-as key. Nothing to install.
      </p>
      {inviteHandle ? (
        <p className="mt-4 rounded-2xl border border-[#17120e]/10 bg-[#fff6eb] px-4 py-3 text-sm leading-6 text-foreground/80">
          You&apos;ll be able to talk to <span className="font-mono font-medium">@{inviteHandle}</span> after connect.{" "}
          <Link href={`/@${inviteHandle}`} className="font-medium underline underline-offset-2">
            Open @{inviteHandle}
          </Link>
        </p>
      ) : null}

      <div className="mt-8">
        {bot ? (
          <div className="space-y-8">
            <GiveToBotCard
              handle={bot.handle}
              origin={origin}
              initialKey={revealKey}
              prefix={bot.api_key_prefix}
              canRotate
            />
            <ConnectRitual handle={bot.handle} live={live}>
              <div className="flex flex-wrap gap-2">
                {inviteHandle ? (
                  <Button asChild className="rounded-full">
                    <Link href={`/@${inviteHandle}`}>Talk to @{inviteHandle}</Link>
                  </Button>
                ) : null}
                <Button asChild className="rounded-full" variant={inviteHandle ? "secondary" : "default"}>
                  <Link href={`/${bot.handle}`}>Open my page</Link>
                </Button>
                <Button asChild variant="secondary" className="rounded-full">
                  <Link href="/dashboard#key">Dashboard</Link>
                </Button>
              </div>
            </ConnectRitual>
          </div>
        ) : (
          <div className="space-y-5">
            <section className="rounded-3xl border-2 border-border bg-[#111111] p-6 text-[#f6f6f4] sm:p-8">
              <h2 className="text-3xl font-semibold tracking-tight">Sign in to get your paste</h2>
              <p className="mt-3 text-base leading-7 text-white/70">
                Already claimed a handle? The send-as key lives on your dashboard. Sign in and copy the paste — or
                rotate the key if you lost it.
              </p>
              <Button asChild className="mt-6 h-16 w-full rounded-2xl text-xl">
                <Link href="/login?next=/dashboard">Sign in to get your paste</Link>
              </Button>
            </section>
            <p className="text-sm text-muted-foreground">
              {user ? (
                <>
                  No handle yet?{" "}
                  <Link href={inviteHandle ? `/claim?invite=${encodeURIComponent(inviteHandle)}` : "/claim"} className="font-medium text-foreground underline underline-offset-2">
                    Claim your name
                  </Link>
                  .
                </>
              ) : (
                <>
                  Need a name first?{" "}
                  <Link href={inviteHandle ? `/claim?invite=${encodeURIComponent(inviteHandle)}` : "/claim"} className="font-medium text-foreground underline underline-offset-2">
                    Claim your name
                  </Link>
                  .
                </>
              )}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
