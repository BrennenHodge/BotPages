import { failJson, okJson } from "@/lib/pretty";
import { ackInbox, requireOwner } from "@/lib/vanity";

export const runtime = "nodejs";

export async function POST(
  request: Request,
  context: { params: Promise<{ handle: string; id: string }> },
) {
  const { handle, id } = await context.params;
  const owner = await requireOwner(request, handle);
  if (!owner.ok) return owner.response;

  const result = await ackInbox(owner.bot.id, id);
  if (!result.ok) return failJson(result.status, result.error);
  return okJson({ id: result.id, at: result.at });
}
