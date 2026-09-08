import { extractBearer } from "@/lib/api-keys";
import { getSessionContext } from "@/lib/auth";
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
    const { bot } = await getSessionContext();
    if (!bot) return failJson(401, "Sign in or bring a Bearer send-as key.", "unauthorized");
    botId = bot.id;
  }
  const result = await redeemInvite(decodeURIComponent(code), botId);
  if (!result.ok) return failJson(result.status, result.error);
  return okJson({
    from: at(result.from.handle),
    by: result.peer ? at(result.peer.handle) : null,
    ok: true,
  });
}
