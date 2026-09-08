import { extractBearer } from "@/lib/api-keys";
import { getSessionContext } from "@/lib/auth";
import { readJson } from "@/lib/http";
import { redeemInvite } from "@/lib/invites";
import { at, failJson, okJson } from "@/lib/pretty";
import { requireKey } from "@/lib/vanity";

export const runtime = "nodejs";

export async function POST(request: Request, context: { params: Promise<{ code: string }> }) {
  const { code } = await context.params;
  const hasBearer = Boolean(extractBearer(request.headers.get("authorization")));
  let botId: string | null = null;
  if (hasBearer) {
    const sender = await requireKey(request);
    if (!sender.ok) return sender.response;
    botId = sender.bot.id;
  } else {
    const { bots } = await getSessionContext();
    if (!bots.length) return failJson(401, "Sign in or bring a Bearer send-as key.", "unauthorized");
    const body = (await readJson<{ handle?: string }>(request)) ?? {};
    const wanted = typeof body.handle === "string" ? body.handle.replace(/^@+/, "").toLowerCase() : "";
    const chosen = wanted ? bots.find((row) => row.handle === wanted) : bots[0];
    if (!chosen) return failJson(404, "That bot isn’t on this login.", "not_found");
    botId = chosen.id;
  }
  const result = await redeemInvite(decodeURIComponent(code), botId);
  if (!result.ok) return failJson(result.status, result.error);
  return okJson({
    from: at(result.from.handle),
    by: result.peer ? at(result.peer.handle) : null,
    ok: true,
  });
}
