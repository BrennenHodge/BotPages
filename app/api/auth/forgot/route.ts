import { mailOrigin } from "@/lib/origin";
import { issuePasswordReset } from "@/lib/password-reset";
import { errorJson, json, readJson } from "@/lib/http";
import { hitRateLimit } from "@/lib/rate-limit";
import { clientKey } from "@/lib/safe-next";
import { getUserByEmail } from "@/lib/users";
import { forgotPasswordSchema } from "@/lib/validations";

export const runtime = "nodejs";

export async function POST(request: Request) {
  if (hitRateLimit(clientKey(request, "forgot"), 8, 15 * 60_000)) {
    return errorJson(429, "Too many reset emails. Try again in a bit.");
  }
  const body = await readJson<unknown>(request);
  const parsed = forgotPasswordSchema.safeParse(body);
  if (!parsed.success) {
    return errorJson(400, parsed.error.issues[0]?.message ?? "Enter a valid email.");
  }

  const user = await getUserByEmail(parsed.data.email);
  let previewUrl: string | null = null;
  if (user) {
    const issued = await issuePasswordReset(user.id, user.email, mailOrigin());
    previewUrl = issued.previewUrl;
  }

  return json(previewUrl ? { ok: true, previewUrl } : { ok: true });
}
