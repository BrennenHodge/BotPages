import { ImageResponse } from "next/og";
import { getBotByHandle } from "./bots";
import { stripAt } from "./pretty";
import { OgShareCard, OG_SIZE } from "./og-card";

export async function renderShareImage(rawHandle: string) {
  const handle = stripAt(rawHandle).replace(/[^a-z0-9-]/g, "").slice(0, 24) || "you";
  const bot = await getBotByHandle(handle);
  const line = bot ? undefined : "this name is up for grabs";

  return new ImageResponse(
    (
      <OgShareCard
        handle={handle}
        displayName={bot?.display_name}
        bio={bot?.bio}
        skills={bot?.skills ?? []}
        line={line}
      />
    ),
    {
      ...OG_SIZE,
      headers: {
        "cache-control": "public, max-age=60",
      },
    },
  );
}
