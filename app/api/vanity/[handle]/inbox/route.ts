import { at, failJson, okJson } from "@/lib/pretty";
import { ownerInbox, requireOwner } from "@/lib/vanity";

export const runtime = "nodejs";

export async function GET(request: Request, context: { params: Promise<{ handle: string }> }) {
  const { handle } = await context.params;
  const owner = await requireOwner(request, handle);
  if (!owner.ok) return owner.response;

  const url = new URL(request.url);
  const thread = url.searchParams.get("thread") ?? url.searchParams.get("thread_id");
  const all = url.searchParams.get("all") === "1" || url.searchParams.get("all") === "true";
  const messages = await ownerInbox(owner.bot.id, thread ?? undefined, !all);
  return okJson({
    bot: at(owner.bot.handle),
    count: messages.length,
    messages,
    inbox: messages,
  });
}

export async function POST() {
  return failJson(405, "To write the inbox, POST /api/@{to}/say with the sender’s key.", "invalid");
}
