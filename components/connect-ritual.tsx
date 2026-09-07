"use client";

import { useEffect, useState, type ReactNode } from "react";
import { ConfettiBurst } from "@/components/confetti-burst";
import { ConnectLadder } from "@/components/connect-ladder";
import { GiveToBotCard } from "@/components/give-to-bot-card";
import { FireworksBurst } from "@/components/fireworks-burst";
import { copiedPromptKey, liveFireworksKey, readFlag, writeFlag } from "@/lib/connect-progress";

export function ConnectRitual({
  handle,
  live,
  prompt,
  origin,
  initialKey,
  prefix,
  canRotate,
  dashboardHint,
  celebrateClaim = false,
  children,
}: {
  handle: string;
  live: boolean;
  prompt?: string;
  origin?: string;
  initialKey?: string | null;
  prefix?: string;
  canRotate?: boolean;
  dashboardHint?: boolean;
  celebrateClaim?: boolean;
  children?: ReactNode;
}) {
  const [copied, setCopied] = useState(false);
  const [confettiTick, setConfettiTick] = useState(0);
  const [fireworks, setFireworks] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const done: 1 | 2 | 3 | 4 = live ? 4 : copied ? 2 : 1;

  useEffect(() => {
    setCopied(readFlag(copiedPromptKey(handle)));
  }, [handle]);

  useEffect(() => {
    if (!celebrateClaim) return;
    setConfettiTick((n) => n + 1);
    setToast("It’s yours.");
    const timer = setTimeout(() => setToast(null), 2200);
    return () => clearTimeout(timer);
  }, [celebrateClaim]);

  useEffect(() => {
    if (!live) return;
    const key = liveFireworksKey(handle);
    if (readFlag(key)) return;
    writeFlag(key);
    setFireworks(true);
    setToast("Magic. Your bot is alive.");
    const timer = setTimeout(() => setToast(null), 2800);
    return () => clearTimeout(timer);
  }, [live, handle]);

  function onCopied() {
    writeFlag(copiedPromptKey(handle));
    setCopied(true);
    if (!live) {
      setConfettiTick((n) => n + 1);
      setToast("Copied. Give that to your bot.");
      window.setTimeout(() => setToast(null), 2200);
    }
  }

  return (
    <div className="relative space-y-6">
      <ConfettiBurst key={confettiTick} play={confettiTick > 0} />
      <FireworksBurst play={fireworks} />
      {toast ? (
        <p
          className="rounded-2xl bg-foreground px-4 py-3 text-sm font-medium text-background"
          style={{ animation: "cb-toast 2.2s ease both" }}
        >
          {toast}
        </p>
      ) : null}
      <ConnectLadder done={done} />
      {prompt || origin || initialKey || canRotate ? (
        <GiveToBotCard
          prompt={prompt}
          handle={handle}
          origin={origin}
          initialKey={initialKey}
          prefix={prefix}
          canRotate={canRotate}
          dashboardHint={dashboardHint}
          onCopied={onCopied}
        />
      ) : null}
      {children}
    </div>
  );
}
