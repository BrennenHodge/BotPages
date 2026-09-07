import { handleExists } from "@/lib/bots";
import { json } from "@/lib/http";
import { validateHandle } from "@/lib/handles";
import { priceForHandle } from "@/lib/pricing";

export const runtime = "nodejs";

export async function GET(_request: Request, context: { params: Promise<{ handle: string }> }) {
  const { handle: raw } = await context.params;
  const check = validateHandle(raw);
  if (!check.ok) {
    return json({
      handle: raw.toLowerCase(),
      valid: false,
      available: false,
      reason: check.reason,
      pricing: null,
    });
  }
  const taken = await handleExists(check.handle);
  const pricing = priceForHandle(check.handle);
  return json({
    handle: check.handle,
    valid: true,
    available: !taken,
    reason: taken ? "That handle is already claimed." : undefined,
    pricing,
  });
}
