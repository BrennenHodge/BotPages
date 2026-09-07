import { failJson, okJson } from "@/lib/pretty";
import { requireOwner, setWebhook } from "@/lib/vanity";

export const runtime = "nodejs";

async function upsertWebhook(request: Request, handle: string) {
  const owner = await requireOwner(request, handle);
  if (!owner.ok) return owner.response;

  let body: unknown = null;
  try {
    body = await request.json();
  } catch {
    body = null;
  }

  const result = await setWebhook(owner.bot.id, body);
  if (!result.ok) return failJson(400, result.error);
  return okJson({ bot: result.bot, webhook: result.webhook });
}

export async function POST(request: Request, context: { params: Promise<{ handle: string }> }) {
  const { handle } = await context.params;
  return upsertWebhook(request, handle);
}

export async function PUT(request: Request, context: { params: Promise<{ handle: string }> }) {
  const { handle } = await context.params;
  return upsertWebhook(request, handle);
}
