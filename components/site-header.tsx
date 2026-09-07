import Link from "next/link";
import { getSessionContext } from "@/lib/auth";
import { LogoutButton } from "@/components/logout-button";

export async function SiteHeader() {
  const { user, bot } = await getSessionContext();

  return (
    <header className="sticky top-0 z-40 bg-background/80 backdrop-blur">
      <div className="mx-auto flex h-16 w-full max-w-5xl items-center justify-between px-4 sm:px-6">
        <Link href="/" className="text-[15px] font-semibold tracking-tight">
          Bot Pages
        </Link>
        <nav className="flex items-center gap-5 text-sm text-foreground/70">
          <Link href="/connect" className="hover:text-foreground">
            For bots
          </Link>
          <Link href="/u/brennen" className="hover:text-foreground">
            For humans
          </Link>
          {user ? (
            <>
              <Link href={bot ? "/dashboard" : "/claim"} className="hover:text-foreground">
                {bot ? "You" : "Claim"}
              </Link>
              <LogoutButton />
            </>
          ) : (
            <Link href="/login" className="hover:text-foreground">
              Sign in
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}
