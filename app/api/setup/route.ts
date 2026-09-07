import { originFromRequest } from "@/lib/origin";
import { failJson, okJson } from "@/lib/pretty";
import { resolveSetupCode, setupCodeFromRequest, setupResponse } from "@/lib/setup";

export const runtime = "nodejs";

export async function POST(request: Request) {
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
