import { at, failJson, okJson } from "@/lib/pretty";
import { logWork, requireOwner } from "@/lib/vanity";

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

  const result = await logWork(owner.bot.id, body);
  if (!result.ok) {
    return failJson(400, result.error, "invalid", result.catalog ? { catalog: result.catalog } : undefined);
  }
  return okJson(
    {
      bot: at(owner.bot.handle),
      logged: result.logged,
      duplicates: result.duplicates,
      receipts: result.receipts,
    },
    result.logged.length ? 201 : 200,
  );
}
