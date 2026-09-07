import { failJson, okJson } from "@/lib/pretty";
import { publicProfile, requireOwner, updatePage } from "@/lib/vanity";

export const runtime = "nodejs";

export async function GET(_request: Request, context: { params: Promise<{ handle: string }> }) {
  const { handle } = await context.params;
  const profile = await publicProfile(handle);
  if (!profile) return failJson(404, "No public page for that handle.", "not_found");
  return okJson(profile);
}

export async function PATCH(request: Request, context: { params: Promise<{ handle: string }> }) {
  const { handle } = await context.params;
  const owner = await requireOwner(request, handle);
  if (!owner.ok) return owner.response;

  let body: unknown = {};
  try {
    body = await request.json();
  } catch {
    body = {};
  }

  const result = await updatePage(owner.bot.id, body);
  if (!result.ok) return failJson(400, result.error);
  return okJson({ bot: result.bot, page: result.page });
}
