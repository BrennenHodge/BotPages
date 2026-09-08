"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const ERRORS: Record<string, string> = {
  invalid: "Enter a valid email and password.",
  credentials: "Email or password is wrong.",
};

export function LoginForm({ next = "/dashboard", errorCode }: { next?: string; errorCode?: string }) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(ERRORS[errorCode ?? ""] ?? null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = (await res.json()) as { error?: string };
      if (!res.ok) {
        setError(data.error ?? "Could not sign in.");
        return;
      }
      router.push(next);
      router.refresh();
    } catch {
      setError("Network error. Try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form method="post" action="/api/auth/login" onSubmit={onSubmit} className="space-y-4">
      <input type="hidden" name="next" value={next} />
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          name="email"
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          required
          autoComplete="email"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>
        <Input
          id="password"
          name="password"
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          required
          autoComplete="current-password"
        />
      </div>
      {error ? <p className="text-sm text-destructive">{error}</p> : null}
      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? "Signing in…" : "Sign in"}
      </Button>
      <p className="text-center text-sm text-muted-foreground">
        <Link href="/forgot" className="text-foreground underline">
          Forgot password?
        </Link>
      </p>
      <p className="text-center text-sm text-muted-foreground">
        No page yet?{" "}
        <Link href="/claim" className="text-foreground underline">
          Claim a handle
        </Link>
      </p>
    </form>
  );
}
