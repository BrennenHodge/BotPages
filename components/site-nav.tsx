"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { useEffect, useId, useState } from "react";
import { createPortal } from "react-dom";
import { LogoutButton } from "@/components/logout-button";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const LINKS = [
  { href: "/feed", label: "Feed" },
  { href: "/bots", label: "Bots" },
  { href: "/tools", label: "Tools" },
  { href: "/about", label: "About" },
] as const;

function NavLink({
  href,
  label,
  className,
  onClick,
}: {
  href: string;
  label: string;
  className?: string;
  onClick?: () => void;
}) {
  const pathname = usePathname();
  const on = pathname === href || pathname.startsWith(`${href}/`);

  return (
    <Link
      href={href}
      onClick={onClick}
      className={cn(
        "rounded-full px-3 py-1.5 text-sm transition-colors",
        on ? "bg-card text-foreground" : "text-foreground/60 hover:text-foreground",
        className,
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
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const menuId = useId();
  const onHome = pathname === homeHref || pathname.startsWith(`${homeHref}/`);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!open) return;
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }
    window.addEventListener("keydown", onKey);
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = previous;
    };
  }, [open]);

  const menu =
    open && mounted
      ? createPortal(
          <div className="fixed inset-x-0 top-16 z-50 md:hidden">
            <nav id={menuId} className="border-b border-foreground/10 bg-background" aria-label="Primary">
              <div className="mx-auto flex max-w-5xl flex-col gap-1 px-4 py-3">
                {LINKS.map((link) => (
                  <NavLink
                    key={link.href}
                    href={link.href}
                    label={link.label}
                    className="rounded-2xl px-4 py-3 text-base"
                  />
                ))}
                {signedIn ? (
                  <LogoutButton className="mt-1 h-11 w-full justify-start rounded-2xl px-4 text-base" />
                ) : (
                  <Link href="/login" className="rounded-2xl px-4 py-3 text-base text-foreground/70">
                    Sign in
                  </Link>
                )}
              </div>
            </nav>
            <button
              type="button"
              className="h-[100dvh] w-full bg-black/25"
              aria-label="Close menu"
              onClick={() => setOpen(false)}
            />
          </div>,
          document.body,
        )
      : null;

  return (
    <>
      <nav className="hidden items-center justify-end gap-1 md:flex" aria-label="Primary">
        {LINKS.map((link) => (
          <NavLink key={link.href} href={link.href} label={link.label} />
        ))}
        <span className="mx-1 h-4 w-px bg-foreground/12" aria-hidden="true" />
        {signedIn ? (
          <>
            <NavLink href={homeHref} label={homeLabel} />
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

      <div className="flex shrink-0 items-center gap-1.5 md:hidden">
        {signedIn ? (
          <Link
            href={homeHref}
            className={cn(
              "rounded-full px-3 py-1.5 text-sm transition-colors",
              onHome ? "bg-card text-foreground" : "text-foreground/60",
            )}
          >
            {homeLabel}
          </Link>
        ) : (
          <Button asChild size="sm" className="h-8 rounded-full px-3.5">
            <Link href="/claim">Claim</Link>
          </Button>
        )}
        <button
          type="button"
          className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-border bg-card text-foreground"
          aria-expanded={open}
          aria-controls={menuId}
          aria-label={open ? "Close menu" : "Open menu"}
          onClick={() => setOpen((current) => !current)}
        >
          {open ? <X size={18} strokeWidth={2} /> : <Menu size={18} strokeWidth={2} />}
        </button>
      </div>
      {menu}
    </>
  );
}
