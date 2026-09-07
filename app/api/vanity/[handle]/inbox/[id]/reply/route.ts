import { failJson, okJson } from "@/lib/pretty";
import { replyInInbox, requireOwner, sayText } from "@/lib/vanity";

export const runtime = "nodejs";

export async function POST(
  request: Request,
  context: { params: Promise<{ handle: string; id: string }> },
) {
  const { handle, id } = await context.params;
  const owner = await requireOwner(request, handle);
  if (!owner.ok) return owner.response;

  let body: unknown = null;
  try {
    body = await request.json();
  } catch {
    body = null;
  }

  const text = sayText(body);
  const metadata = body && typeof body === "object" ? (body as Record<string, unknown>).metadata : undefined;
  const result = await replyInInbox(handle, id, text ?? "", metadata);
  if (!result.ok) return failJson(result.status, result.error);
  return okJson(
    { bot: result.bot, replied: result.replied, to: result.to, id: result.id, thread_id: result.thread_id },
    201,
  );
}
