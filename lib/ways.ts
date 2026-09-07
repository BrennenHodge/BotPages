import { handleExists } from "./bots";

export type CatalogSource = "GrokBot Money" | "seen on X" | "example";

export type CatalogBot = {
  id: string;
  handle: string;
  blurb: string;
  source: CatalogSource;
};

/** Example / discovered numbers waiting to be claimed. Handles are fictional unless someone grabs them. */
export const CATALOG_BOTS: CatalogBot[] = [
  {
    id: "moneyscout",
    handle: "moneyscout",
    blurb: "Scouts gigs, grants, and weird little payouts overnight. Leaves a shortlist by breakfast.",
    source: "GrokBot Money",
  },
  {
    id: "grantscout",
    handle: "grantscout",
    blurb: "Reads RFPs so a human does not have to. Flags the ones that actually fit.",
    source: "GrokBot Money",
  },
  {
    id: "clipscout",
    handle: "clipscout",
    blurb: "Finds clips that could pay. Drafts the caption. Does not pretend to be a brand agency.",
    source: "GrokBot Money",
  },
  {
    id: "dealdesk",
    handle: "dealdesk",
    blurb: "Prices the offer, writes the one-pager, pings the other bot when it’s time to close.",
    source: "GrokBot Money",
  },
  {
    id: "foiafile",
    handle: "foiafile",
    blurb: "Drafts a FOIA, tracks the clock, files the follow-up when the agency goes quiet.",
    source: "seen on X",
  },
  {
    id: "weathernudge",
    handle: "weathernudge",
    blurb: "Texts you before the storm, not after your bike is already wet.",
    source: "seen on X",
  },
  {
    id: "versebot",
    handle: "versebot",
    blurb: "A bible bot with a number. Ask for a verse, get a verse — not a sermon thread.",
    source: "seen on X",
  },
  {
    id: "insulate",
    handle: "insulate",
    blurb: "Insulation ops: measure the attic, price the foam, book the crew. Extremely specific. That’s the point.",
    source: "example",
  },
  {
    id: "formclerk",
    handle: "formclerk",
    blurb: "Takes a packet from a research bot and actually submits the form. Replies when it’s done.",
    source: "example",
  },
  {
    id: "briefbot",
    handle: "briefbot",
    blurb: "One-page brief, sources, then a handoff. Does not write a novel.",
    source: "example",
  },
  {
    id: "tickerscout",
    handle: "tickerscout",
    blurb: "Watches a tiny watchlist. Pings when something actually moved. Not financial advice.",
    source: "GrokBot Money",
  },
  {
    id: "inboxdawn",
    handle: "inboxdawn",
    blurb: "Triage overnight. Receipts in the morning. Your human opens mail last.",
    source: "seen on X",
  },
];

export const WAYS = CATALOG_BOTS.map((row) => ({
  id: row.id,
  title: `@${row.handle}`,
  summary: row.blurb,
  source_url: "#",
  suggested_handle: row.handle,
}));

export type CatalogRow = CatalogBot & { claimed: boolean };

export async function catalogWithStatus(): Promise<CatalogRow[]> {
  return Promise.all(
    CATALOG_BOTS.map(async (row) => ({
      ...row,
      claimed: await handleExists(row.handle),
    })),
  );
}

export function shareOrigin(origin: string) {
  if (!origin || origin.includes("localhost") || origin.includes("127.0.0.1")) {
    return "https://botpages.co";
  }
  return origin.replace(/\/$/, "");
}

export function catalogInviteTweet(origin: string, handle: string) {
  const host = shareOrigin(origin);
  const claimPath = `${host.replace(/^https?:\/\//, "")}/claim?handle=${handle}`;
  return `@you your bot should have a number — claim @${handle} on ${claimPath}`;
}

export function catalogInviteUrl(origin: string, handle: string) {
  return `https://twitter.com/intent/tweet?text=${encodeURIComponent(catalogInviteTweet(origin, handle))}`;
}
