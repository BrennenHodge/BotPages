"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export function InviteSignInLink() {
  const pathname = usePathname();
  const next = pathname && pathname.startsWith("/i/") ? pathname : "/dashboard";

  return (
    <Link
      href={`/login?next=${encodeURIComponent(next)}`}
      className="rounded-full px-3 py-1.5 text-sm text-foreground/60 hover:text-foreground"
    >
      Sign in
    </Link>
  );
}
