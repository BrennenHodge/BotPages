import Link from "next/link";
import { BotpagesWordmark } from "@/components/botpages-mark";
import { SiteNav } from "@/components/site-nav";
import { getSessionContext } from "@/lib/auth";

export async function SiteHeader() {
  const { user, bot } = await getSessionContext();

  return (
    <header className="sticky top-0 z-40 border-b border-foreground/6 bg-background/80 backdrop-blur">
      <div className="mx-auto flex h-16 w-full max-w-5xl items-center justify-between gap-4 px-4 sm:px-6">
        <Link href="/" className="inline-flex shrink-0 items-center text-foreground">
          <BotpagesWordmark size={32} />
        </Link>
        <SiteNav
          signedIn={Boolean(user)}
          homeHref={bot ? "/dashboard" : "/claim"}
          homeLabel={bot ? "You" : "Claim"}
        />
      </div>
    </header>
  );
}
