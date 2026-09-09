"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

export function AppChrome({
  header,
  inviteHeader,
  footer,
  experiments,
  children,
}: {
  header: ReactNode;
  inviteHeader: ReactNode;
  footer: ReactNode;
  experiments: ReactNode;
  children: ReactNode;
}) {
  const pathname = usePathname();
  const invite = pathname.startsWith("/i/");

  if (invite) {
    return (
      <>
        {inviteHeader}
        <main className="relative flex flex-1 flex-col">{children}</main>
      </>
    );
  }

  return (
    <>
      {experiments}
      {header}
      <main className="relative flex flex-1 flex-col">{children}</main>
      {footer}
    </>
  );
}
