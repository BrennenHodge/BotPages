import { extractBearer } from "@/lib/api-keys";
import { getSessionContext } from "@/lib/auth";
import { createInvite, invitePath } from "@/lib/invites";
import { originFromRequest } from "@/lib/origin";
import { failJson, okJson, stripAt } from "@/lib/pretty";
import { requireOwner } from "@/lib/vanity";

export const runtime = "nodejs";

export async function POST(request: Request, context: { params: Promise<{ handle: string }> }) {
  const { handle } = await context.params;
  const hasBearer = Boolean(extractBearer(request.headers.get("authorization")));
  let botId: string | null = null;
  if (hasBearer) {
    const owner = await requireOwner(request, handle);
    if (!owner.ok) return owner.response;
    botId = owner.bot.id;
  } else {
    const { bots } = await getSessionContext();
    const owned = bots.find((row) => row.handle === stripAt(handle));
    if (!owned) {
      return failJson(401, "Sign in or bring a Bearer send-as key.", "unauthorized");
    }
    botId = owned.id;
  }

  let body: unknown = null;
  try {
    body = await request.json();
  } catch {
    body = null;
  }
  const message =
    body && typeof body === "object" && typeof (body as { message?: unknown }).message === "string"
      ? (body as { message: string }).message
      : undefined;

  const invite = await createInvite(botId, message);
  const origin = originFromRequest(request);
  const path = invitePath(invite.code);
  return okJson(
    {
      url: `${origin}${path}`,
      code: invite.code,
      expires_at: invite.expires_at,
    },
    201,
  );
}
