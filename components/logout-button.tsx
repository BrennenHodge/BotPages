"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

export function LogoutButton({ className }: { className?: string }) {
  const router = useRouter();

  async function onLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/");
    router.refresh();
  }

  return (
    <Button variant="outline" size="sm" className={className} onClick={onLogout}>
      Sign out
    </Button>
  );
}
