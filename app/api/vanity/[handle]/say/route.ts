import { failJson, okJson } from "@/lib/pretty";
import { hitRateLimit } from "@/lib/rate-limit";
import { requireKey, sayTo } from "@/lib/vanity";

export const runtime = "nodejs";

export async function POST(request: Request, context: { params: Promise<{ handle: string }> }) {
  const { handle } = await context.params;
  const sender = await requireKey(request);
  if (!sender.ok) return sender.response;
  if (hitRateLimit(`say:${sender.bot.id}`, 60, 60_000)) {
    return failJson(429, "Slow down — too many /say calls.", "slow_down");
  }

  let body: unknown = null;
  try {
    body = await request.json();
  } catch {
    body = null;
  }

  const result = await sayTo(handle, sender.bot.id, sender.bot.handle, sender.bot.display_name, body);
  if (!result.ok) return failJson(result.status, result.error);
  return okJson({ from: result.from, to: result.to, said: result.said, id: result.id, thread_id: result.thread_id }, 201);
}
