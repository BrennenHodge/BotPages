import { createSession, destroyOtherSessions, setSessionCookie } from "@/lib/auth";
import { errorJson, json, readJson } from "@/lib/http";
import { consumePasswordReset } from "@/lib/password-reset";
import { updatePassword } from "@/lib/users";
import { resetPasswordSchema } from "@/lib/validations";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const body = await readJson<unknown>(request);
  const parsed = resetPasswordSchema.safeParse(body);
  if (!parsed.success) {
    return errorJson(400, parsed.error.issues[0]?.message ?? "Invalid input.");
  }

  const reset = await consumePasswordReset(parsed.data.token);
  if (!reset) return errorJson(400, "This reset link is missing or expired.");

  await updatePassword(reset.user_id, parsed.data.password);
  await destroyOtherSessions(reset.user_id);
  const session = await createSession(reset.user_id);
  await setSessionCookie(session.token, session.expires);
  return json({ ok: true });
}
