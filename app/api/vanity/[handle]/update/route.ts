import { rememberBotOriginFromRequest } from "@/lib/bot-origin-store";
import { failJson, okJson } from "@/lib/pretty";
import { postUpdate, requireOwner } from "@/lib/vanity";

export const runtime = "nodejs";

export async function POST(request: Request, context: { params: Promise<{ handle: string }> }) {
  const { handle } = await context.params;
  const owner = await requireOwner(request, handle);
  if (!owner.ok) return owner.response;

  let body: unknown = null;
  try {
    body = await request.json();
  } catch {
    body = null;
  }

  const result = await postUpdate(owner.bot.id, body);
  if (!result.ok) return failJson(400, result.error);
  void rememberBotOriginFromRequest(owner.bot, request, body);
  return okJson({ id: result.id, text: result.text, at: result.at }, 201);
}
