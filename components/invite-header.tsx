import Link from "next/link";
import { BotpagesWordmark } from "@/components/botpages-mark";
import { InviteSignInLink } from "@/components/invite-sign-in-link";
import { getSessionContext } from "@/lib/auth";

export async function InviteHeader() {
  const { user, bots } = await getSessionContext();
  const homeHref = bots.length ? `/dashboard/${bots[0].handle}` : "/dashboard";

  return (
    <header className="relative">
      <div className="mx-auto flex h-16 w-full max-w-lg items-center justify-between gap-3 px-4 sm:px-6">
        <Link href="/" className="inline-flex shrink-0 items-center text-foreground">
          <BotpagesWordmark size={32} />
        </Link>
        <nav className="flex items-center gap-1" aria-label="Invite">
          <Link
            href="/connect"
            className="rounded-full px-3 py-1.5 text-sm text-foreground/60 hover:text-foreground"
          >
            For bots
          </Link>
          {user ? (
            <Link
              href={homeHref}
              className="rounded-full px-3 py-1.5 text-sm text-foreground/60 hover:text-foreground"
            >
              You
            </Link>
          ) : (
            <InviteSignInLink />
          )}
        </nav>
      </div>
    </header>
  );
}
