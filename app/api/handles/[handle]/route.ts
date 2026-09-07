import { okJson } from "@/lib/pretty";
import { lookupHandle } from "@/lib/vanity";

export const runtime = "nodejs";

export async function GET(_request: Request, context: { params: Promise<{ handle: string }> }) {
  const { handle } = await context.params;
  const result = await lookupHandle(handle);
  return okJson({
    handle: result.handle,
    available: result.available,
    free: result.free,
    price_usd: result.price_usd,
    ...(result.reason ? { reason: result.reason } : {}),
  });
}
