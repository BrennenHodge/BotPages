import { originFromRequest } from "@/lib/origin";
import { failJson, okJson } from "@/lib/pretty";
import { hitRateLimit } from "@/lib/rate-limit";
import { clientKey } from "@/lib/safe-next";
import { resolveSetupCode, setupCodeFromRequest, setupResponse } from "@/lib/setup";

export const runtime = "nodejs";

export async function POST(request: Request) {
  if (hitRateLimit(clientKey(request, "setup"), 30, 60 * 60_000)) {
    return failJson(429, "Too many setup tries. Wait a minute.", "rate_limited");
  }
  let body: unknown = null;
  try {
    body = await request.json();
  } catch {
    body = null;
  }

  const code = setupCodeFromRequest(request, body);
  if (!code) {
    return failJson(
      400,
      "Send { code } — your claim send-as key is the setup token. Or claim a number at /claim.",
    );
  }

  const resolved = await resolveSetupCode(code);
  if (!resolved) {
    return failJson(
      404,
      "Unknown setup code. Claim at /claim — the send-as key you get is the setup token.",
      "not_found",
    );
  }

  const origin = originFromRequest(request);
  return okJson(setupResponse(origin, resolved.bot.handle, resolved.token));
}
