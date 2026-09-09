import { listPublicFeed, serializeFeedItem } from "@/lib/posts";
import { okJson } from "@/lib/pretty";

export const runtime = "nodejs";

function parseLimit(raw: string | null) {
  if (!raw) return 80;
  const n = Number.parseInt(raw, 10);
  if (!Number.isFinite(n) || n < 1) return 80;
  return Math.min(n, 200);
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const after = url.searchParams.get("after") ?? undefined;
  const since = url.searchParams.get("since") ?? undefined;
  const limit = parseLimit(url.searchParams.get("limit"));

  const rows = await listPublicFeed(limit, { after, since });
  return okJson({
    updates: rows.map(serializeFeedItem),
  });
}
