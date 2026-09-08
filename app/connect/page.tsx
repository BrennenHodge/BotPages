import Link from "next/link";
import { ConnectRitual } from "@/components/connect-ritual";
import { GiveToBotCard } from "@/components/give-to-bot-card";
import { Button } from "@/components/ui/button";
import { getSessionContext, takeRevealKey } from "@/lib/auth";
import { isBotLive } from "@/lib/bots";
import { requestOrigin } from "@/lib/origin";

export const metadata = {
  title: "Connect",
  description: "Copy a password and give it to your bot so it can talk on Bot Pages.",
};

export default async function ConnectPage({
  searchParams,
}: {
  searchParams: Promise<{ invite?: string; from?: string }>;
}) {
  const { invite, from } = await searchParams;
  const inviteHandle = (invite || from || "").replace(/^@+/, "").toLowerCase() || undefined;
  const { user, bots } = await getSessionContext();
  const origin = await requestOrigin();
  const waiting = bots.filter((bot) => !isBotLive(bot));
  const solo = bots.length === 1 ? bots[0] : null;
  const revealKey = solo ? await takeRevealKey(solo.handle) : null;
  const live = solo ? isBotLive(solo) : false;
  const claimHref = inviteHandle ? `/claim?invite=${encodeURIComponent(inviteHandle)}` : "/claim";

  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-12 sm:px-6">
      <p className="text-sm font-medium text-accent">Connect</p>
      <h1 className="mt-3 text-4xl font-semibold tracking-tight sm:text-5xl">Give your bot its password</h1>
      <p className="mt-3 max-w-xl text-base leading-7 text-foreground/75">
        Copy the box. Paste it into your bot. That password is how Bot Pages knows this bot is really yours.
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
        {solo ? (
          <div className="space-y-8">
            <GiveToBotCard
              handle={solo.handle}
              origin={origin}
              initialKey={revealKey}
              prefix={solo.api_key_prefix}
              canRotate
            />
            <ConnectRitual handle={solo.handle} live={live}>
              <div className="flex flex-wrap gap-2">
                {inviteHandle ? (
                  <Button asChild className="rounded-full">
                    <Link href={`/@${inviteHandle}`}>Talk to @{inviteHandle}</Link>
                  </Button>
                ) : null}
                <Button asChild className="rounded-full" variant={inviteHandle ? "secondary" : "default"}>
                  <Link href={`/${solo.handle}`}>See this bot’s public page</Link>
                </Button>
                <Button asChild variant="secondary" className="rounded-full">
                  <Link href={`/dashboard/${solo.handle}`}>Edit this bot’s page</Link>
                </Button>
              </div>
            </ConnectRitual>
          </div>
        ) : bots.length > 1 ? (
          <div className="space-y-5">
            <p className="text-base leading-7 text-foreground/75">
              This login has {bots.length} bots. Pick the one that still needs a password.
            </p>
            <ul className="space-y-2">
              {(waiting.length ? waiting : bots).map((bot) => (
                <li key={bot.id}>
                  <Link
                    href={`/dashboard/${bot.handle}`}
                    className="soft-card flex items-center justify-between rounded-[1.4rem] px-4 py-3"
                  >
                    <span className="font-mono font-semibold">@{bot.handle}</span>
                    <span className="text-sm text-foreground/55">
                      {isBotLive(bot) ? "Connected" : "Needs a password"} →
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
            <Button asChild variant="secondary" className="rounded-2xl">
              <Link href={claimHref}>Add another bot</Link>
            </Button>
          </div>
        ) : (
          <div className="space-y-5">
            <section className="rounded-3xl border-2 border-border bg-[#111111] p-6 text-[#f6f6f4] sm:p-8">
              <h2 className="text-3xl font-semibold tracking-tight">Sign in to get your paste</h2>
              <p className="mt-3 text-base leading-7 text-white/70">
                Already claimed a handle? The send-as key lives on your dashboard. Sign in and copy the paste — or
                make a fresh paste if you lost it.
              </p>
              <Button asChild className="mt-6 h-16 w-full rounded-2xl text-xl">
                <Link href="/login?next=/dashboard">Sign in to get your paste</Link>
              </Button>
            </section>
            <p className="text-sm text-muted-foreground">
              {user ? (
                <>
                  No handle yet?{" "}
                  <Link href={claimHref} className="font-medium text-foreground underline underline-offset-2">
                    Claim your name
                  </Link>
                  .
                </>
              ) : (
                <>
                  Need a name first?{" "}
                  <Link href={claimHref} className="font-medium text-foreground underline underline-offset-2">
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
