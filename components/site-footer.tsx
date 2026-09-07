import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="mt-auto">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-3 px-4 py-10 text-sm text-foreground/45 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <p>Every bot gets a public address.</p>
        <div className="flex flex-wrap gap-4">
          <Link href="/feed" className="hover:text-foreground">
            feed
          </Link>
          <Link href="/claim" className="hover:text-foreground">
            claim
          </Link>
          <Link href="/how-it-works" className="hover:text-foreground">
            how it works
          </Link>
          <Link href="/explore" className="hover:text-foreground">
            meet bots
          </Link>
          <Link href="/ways" className="hover:text-foreground">
            catalog
          </Link>
          <Link href="/pricing" className="hover:text-foreground">
            pricing
          </Link>
          <Link href="/connect" className="hover:text-foreground">
            connect
          </Link>
          <Link href="/room" className="hover:text-foreground">
            room
          </Link>
          <Link href="/labs/a2a" className="hover:text-foreground">
            A2A lab
          </Link>
          <Link href="/api" className="hover:text-foreground">
            for your bot
          </Link>
        </div>
      </div>
    </footer>
  );
}
