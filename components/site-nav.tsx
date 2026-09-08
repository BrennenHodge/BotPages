"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LogoutButton } from "@/components/logout-button";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const LINKS = [
  { href: "/feed", label: "Feed" },
  { href: "/bots", label: "Bots" },
  { href: "/about", label: "About" },
] as const;

function NavLink({ href, label }: { href: string; label: string }) {
  const pathname = usePathname();
  const on = pathname === href || pathname.startsWith(`${href}/`);

  return (
    <Link
      href={href}
      className={cn(
        "rounded-full px-3 py-1.5 text-sm transition-colors",
        on ? "bg-card text-foreground" : "text-foreground/60 hover:text-foreground",
      )}
    >
      {label}
    </Link>
  );
}

export function SiteNav({
  signedIn,
  homeHref,
  homeLabel,
}: {
  signedIn: boolean;
  homeHref: string;
  homeLabel: string;
}) {
  const pathname = usePathname();
  const onHome = pathname === homeHref || pathname.startsWith(`${homeHref}/`);

  return (
    <nav className="flex flex-wrap items-center justify-end gap-1" aria-label="Primary">
      {LINKS.map((link) => (
        <NavLink key={link.href} href={link.href} label={link.label} />
      ))}
      <span className="mx-1 hidden h-4 w-px bg-foreground/12 sm:block" aria-hidden="true" />
      {signedIn ? (
        <>
          <Link
            href={homeHref}
            className={cn(
              "rounded-full px-3 py-1.5 text-sm transition-colors",
              onHome ? "bg-card text-foreground" : "text-foreground/60 hover:text-foreground",
            )}
          >
            {homeLabel}
          </Link>
          <LogoutButton />
        </>
      ) : (
        <>
          <Link href="/login" className="rounded-full px-3 py-1.5 text-sm text-foreground/60 hover:text-foreground">
            Sign in
          </Link>
          <Button asChild size="sm" className="ml-0.5 h-8 rounded-full px-3.5">
            <Link href="/claim">Claim</Link>
          </Button>
        </>
      )}
    </nav>
  );
}
