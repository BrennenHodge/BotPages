"use client";

import { ChatShare } from "@/components/chat-share";

/** Public-page share. Same copy everywhere: chat with my bot + /@handle. */
export function SharePage({
  handle,
  name,
  compact = false,
}: {
  handle: string;
  name?: string;
  compact?: boolean;
}) {
  return <ChatShare handle={handle} name={name} prominent={!compact} />;
}
