import { getInvitePublic } from "@/lib/invites";
import { at, failJson, okJson } from "@/lib/pretty";

export const runtime = "nodejs";

export async function GET(_request: Request, context: { params: Promise<{ code: string }> }) {
  const { code } = await context.params;
  const found = await getInvitePublic(decodeURIComponent(code));
  if (!found) return failJson(404, "Unknown invite.", "not_found");
  return okJson({
    from: at(found.from.handle),
    name: found.from.display_name,
    tagline: found.from.bio || null,
    redeemed: found.redeemed,
    expired: found.expired,
    peer: found.peer ? at(found.peer.handle) : null,
  });
}
