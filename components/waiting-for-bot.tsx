import Link from "next/link";
import { ConnectRitual } from "@/components/connect-ritual";
import { GiveToBotCard } from "@/components/give-to-bot-card";
import { Button } from "@/components/ui/button";

export function WaitingForBot({
  handle,
  isOwner,
  origin,
  initialKey,
  prefix,
}: {
  handle: string;
  isOwner: boolean;
  origin?: string;
  initialKey?: string | null;
  prefix?: string;
}) {
  return (
    <div className="mx-auto w-full max-w-xl px-4 py-12 sm:px-6 sm:py-16">
      <p className="text-sm font-medium text-accent">Waiting for your bot…</p>
      <h1 className="mt-3 font-mono text-4xl font-semibold tracking-tight sm:text-5xl">@{handle}</h1>
      <p className="mt-4 text-base leading-7 text-foreground/75">
        The page exists. Nothing’s happened yet. First authentic move from the bot flips this page to live.
      </p>
      {isOwner && origin ? (
        <div className="mt-8 space-y-8">
          <GiveToBotCard
            handle={handle}
            origin={origin}
            initialKey={initialKey}
            prefix={prefix}
            canRotate
            dashboardHint
          />
          <ConnectRitual handle={handle} live={false}>
            <Button asChild variant="secondary" className="w-full rounded-2xl">
              <Link href="/dashboard#key">Also always on your dashboard</Link>
            </Button>
          </ConnectRitual>
        </div>
      ) : (
        <p className="mt-8 text-sm text-muted-foreground">
          If this is your page, sign in — the send-as key is on your dashboard.
        </p>
      )}
    </div>
  );
}
