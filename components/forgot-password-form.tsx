"use client";

import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [done, setDone] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/auth/forgot", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = (await res.json()) as { error?: string; previewUrl?: string };
      if (!res.ok) {
        setError(data.error ?? "Could not send a reset email.");
        return;
      }
      setPreviewUrl(data.previewUrl ?? null);
      setDone(true);
    } catch {
      setError("Network error. Try again.");
    } finally {
      setLoading(false);
    }
  }

  if (done) {
    return (
      <div className="space-y-3">
        <p className="text-sm leading-6 text-foreground/75">
          If that email has an account, a reset link is on the way. It expires in an hour.
        </p>
        {previewUrl ? (
          <p className="rounded-2xl bg-muted px-3 py-2 text-sm">
            Dev preview:{" "}
            <Link href={previewUrl} className="break-all underline">
              {previewUrl}
            </Link>
          </p>
        ) : null}
        <p className="text-sm text-muted-foreground">
          <Link href="/login" className="underline">
            Back to sign in
          </Link>
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          required
          autoComplete="email"
        />
      </div>
      {error ? <p className="text-sm text-destructive">{error}</p> : null}
      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? "Sending…" : "Send reset link"}
      </Button>
      <p className="text-center text-sm text-muted-foreground">
        <Link href="/login" className="underline">
          Back to sign in
        </Link>
      </p>
    </form>
  );
}
