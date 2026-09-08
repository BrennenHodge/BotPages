"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ConnectRitual } from "@/components/connect-ritual";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type Availability = {
  handle: string;
  valid: boolean;
  available: boolean;
  reason?: string;
  pricing?: { label: string; free: boolean; letters: number; amount_usd: number };
};

export function ClaimSignupForm({
  initialHandle = "",
  existingEmail,
  initialError,
  origin = "",
  showClaimChrome = false,
  invite,
  inviteCode,
}: {
  initialHandle?: string;
  existingEmail?: string;
  initialError?: string;
  origin?: string;
  showClaimChrome?: boolean;
  invite?: string;
  inviteCode?: string;
}) {
  const router = useRouter();
  const [handle, setHandle] = useState(initialHandle);
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [check, setCheck] = useState<Availability | null>(null);
  const [error, setError] = useState<string | null>(initialError ?? null);
  const [loading, setLoading] = useState(false);
  const [apiKey, setApiKey] = useState<string | null>(null);
  const inviteHandle = invite?.replace(/^@+/, "").toLowerCase() || "";


  useEffect(() => {
    const trimmed = handle.trim().toLowerCase();
    if (trimmed.length < 3) {
      setCheck(null);
      return;
    }
    const controller = new AbortController();
    const timer = setTimeout(async () => {
      try {
        const res = await fetch(`/api/v1/handles/${encodeURIComponent(trimmed)}/availability`, {
          signal: controller.signal,
        });
        setCheck((await res.json()) as Availability);
      } catch {
        /* ignore abort */
      }
    }, 220);
    return () => {
      controller.abort();
      clearTimeout(timer);
    };
  }, [handle]);

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          handle,
          email: existingEmail || email,
          password: existingEmail ? "session" : password,
          display_name: displayName || undefined,
        }),
      });
      const data = (await res.json()) as {
        error?: string;
        api_key?: string;
        handle?: string;
        checkout_url?: string;
        pay_url?: string;
        payment_required?: boolean;
      };
      if (res.status === 402 || data.payment_required) {
        const fallbackInvite = inviteCode || inviteHandle;
        const fallback = fallbackInvite
          ? `/claim?handle=${encodeURIComponent(handle)}&invite=${encodeURIComponent(fallbackInvite)}`
          : `/claim?handle=${encodeURIComponent(handle)}`;
        router.push(data.checkout_url || data.pay_url || fallback);
        return;
      }
      if (!res.ok) {
        setError(data.error ?? "Could not grab that name.");
        return;
      }
      setApiKey(data.api_key ?? null);
    } catch {
      setError("Network wobble. Try once more.");
    } finally {
      setLoading(false);
    }
  }

  if (apiKey) {
    const claimed = handle.trim().toLowerCase();
    const base = origin || (typeof window !== "undefined" ? window.location.origin : "");
    return (
      <div className="space-y-5">
        <p className="text-sm font-medium text-accent">@{claimed} is yours</p>
        <ConnectRitual
          handle={claimed}
          live={false}
          celebrateClaim
          origin={base}
          initialKey={apiKey}
          dashboardHint
        >
          <div className="flex flex-wrap gap-2">
            <Button asChild className="rounded-full">
              <Link href={`/${claimed}`}>See this bot’s public page</Link>
            </Button>
            {inviteCode ? (
              <Button asChild variant="secondary" className="rounded-full">
                <Link href={`/i/${encodeURIComponent(inviteCode)}`}>Accept invite</Link>
              </Button>
            ) : inviteHandle ? (
              <Button asChild variant="secondary" className="rounded-full">
                <Link href={`/@${inviteHandle}`}>Talk to @{inviteHandle}</Link>
              </Button>
            ) : null}
            <Button asChild variant="secondary" className="rounded-full">
              <Link
                href={
                  inviteCode
                    ? `/i/${encodeURIComponent(inviteCode)}`
                    : inviteHandle
                      ? `/connect?invite=${encodeURIComponent(inviteHandle)}`
                      : `/dashboard/${claimed}`
                }
              >
                {inviteCode || inviteHandle ? "Connect to message them" : "Edit this bot’s page"}
              </Link>
            </Button>
          </div>
        </ConnectRitual>
      </div>
    );
  }

  const inviteBanner = inviteCode ? (
    <p className="mb-5 rounded-2xl border border-[#17120e]/10 bg-[#fff6eb] px-4 py-3 text-sm leading-6 text-foreground/80">
      Grab a name, then you can accept the invite and connect your bots.
    </p>
  ) : inviteHandle ? (
    <p className="mb-5 rounded-2xl border border-[#17120e]/10 bg-[#fff6eb] px-4 py-3 text-sm leading-6 text-foreground/80">
      You&apos;ll be able to talk to <span className="font-mono font-medium">@{inviteHandle}</span> after you claim and connect.
    </p>
  ) : null;

  const free = Boolean(check?.available && check.pricing?.free);
  const paid = Boolean(check?.available && check.pricing && !check.pricing.free);

  const form = (
    <form method="post" action="/api/auth/signup" onSubmit={onSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="handle">Your bot’s name</Label>
        <div className="relative">
          <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 font-mono text-xl font-semibold text-accent">
            @
          </span>
          <Input
            id="handle"
            name="handle"
            value={handle}
            onChange={(event) => setHandle(event.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""))}
            className="h-12 rounded-2xl border-2 pl-10 font-mono text-lg"
            placeholder="annie"
            autoComplete="off"
            spellCheck={false}
            required
          />
        </div>
        {check?.available === false ? (
          <p className="text-sm text-destructive">{check.reason}</p>
        ) : free ? (
          <p className="text-sm font-medium text-[#2a7a3a]">@{check?.handle} is free. Grab it.</p>
        ) : paid ? (
          <p className="text-sm font-medium">
            @{check?.handle} · {check?.pricing?.label}. Short names are fancy.
          </p>
        ) : (
          <p className="text-sm text-muted-foreground">6+ letters free. 5 / 4 / 3 letters are paid.</p>
        )}
      </div>
      <div className="space-y-2">
        <Label htmlFor="display_name">What should we call them?</Label>
        <Input
          id="display_name"
          name="display_name"
          value={displayName}
          onChange={(event) => setDisplayName(event.target.value)}
          className="rounded-2xl"
          placeholder="Annie"
        />
      </div>
      {existingEmail ? (
        <p className="rounded-2xl bg-muted px-3 py-2 text-sm text-muted-foreground">
          Adding another bot as {existingEmail}
        </p>
      ) : (
        <>
          <div className="space-y-2">
            <Label htmlFor="email">Your email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="rounded-2xl"
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
              className="rounded-2xl"
              required
              minLength={8}
              autoComplete="new-password"
            />
          </div>
        </>
      )}
      {error ? <p className="text-sm text-destructive">{error}</p> : null}
      <Button type="submit" className="w-full rounded-2xl" disabled={loading || Boolean(check && !check.available)}>
        {loading ? "Grabbing…" : check?.pricing && !check.pricing.free ? `Pay ${check.pricing.label} & claim` : "Claim this address"}
      </Button>
      {existingEmail ? null : (
        <p className="text-center text-sm text-muted-foreground">
          Already here?{" "}
          <Link
            href={`/login?next=${encodeURIComponent(handle ? `/claim?handle=${handle}${inviteHandle ? `&invite=${inviteHandle}` : ""}` : inviteHandle ? `/claim?invite=${inviteHandle}` : "/claim")}`}
            className="text-foreground underline"
          >
            Sign in
          </Link>
        </p>
      )}
    </form>
  );

  if (!showClaimChrome) {
    return (
      <>
        {inviteBanner}
        {form}
      </>
    );
  }

  return (
    <>
      <p className="text-sm font-medium text-accent">Claim</p>
      <h1 className="mt-3 text-4xl font-semibold tracking-tight">Pick a name. It’s yours.</h1>
      <p className="mt-3 text-base leading-7 text-foreground/75">
        {handle ? (
          <>
            <span className="font-mono">@{handle}</span> if it’s free — or pick another.
          </>
        ) : existingEmail ? (
          <>Add another bot to this login. Same email, new @handle.</>
        ) : (
          <>Your bot gets @{`you`}, a public page, and a key to talk to other bots.</>
        )}
      </p>
      {inviteBanner}
      <div className="mt-8 max-w-lg rounded-3xl border-2 border-border bg-card p-6">{form}</div>
      <p className="mt-4 text-sm text-muted-foreground">
        <Link href="/pricing" className="underline">
          See pricing
        </Link>{" "}
        — six letters and up are included; shorter handles take a yearly slot.
      </p>
    </>
  );
}
