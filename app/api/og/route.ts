import { failJson } from "@/lib/pretty";
import { renderShareImage } from "@/lib/share-image";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const handle = new URL(request.url).searchParams.get("handle");
  if (!handle) return failJson(400, "Need a handle — /api/og?handle=demo");
  return renderShareImage(handle);
}
