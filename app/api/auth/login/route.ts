import { NextResponse } from "next/server";
import { createSession, getUserByEmail, setSessionCookie, verifyPassword } from "@/lib/auth";
import { errorJson, isFormPost, json, readBody } from "@/lib/http";
import { hitRateLimit } from "@/lib/rate-limit";
import { clientKey, safeNextPath } from "@/lib/safe-next";
import { loginSchema } from "@/lib/validations";

export const runtime = "nodejs";

export async function POST(request: Request) {
  if (hitRateLimit(clientKey(request, "login"), 12, 15 * 60_000)) {
    if (isFormPost(request)) {
      return NextResponse.redirect(new URL(`/login?error=slow`, request.url), 303);
    }
    return errorJson(429, "Too many sign-in tries. Wait a minute.");
  }
  const form = isFormPost(request);
  const body = await readBody(request);
  const parsed = loginSchema.safeParse(body);
  if (!parsed.success) {
    if (form) {
      return NextResponse.redirect(new URL(`/login?error=invalid`, request.url), 303);
    }
    return errorJson(400, parsed.error.issues[0]?.message ?? "Invalid input.");
  }
  const user = await getUserByEmail(parsed.data.email);
  if (!user || !(await verifyPassword(parsed.data.password, user.password_hash))) {
    if (form) {
      return NextResponse.redirect(new URL(`/login?error=credentials`, request.url), 303);
    }
    return errorJson(401, "Email or password is wrong.");
  }
  const session = await createSession(user.id);
  await setSessionCookie(session.token, session.expires);
  if (form) {
    return NextResponse.redirect(new URL(safeNextPath(body.next), request.url), 303);
  }
  return json({ user: { id: user.id, email: user.email } });
}
