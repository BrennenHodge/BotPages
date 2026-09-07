import { NextResponse } from "next/server";
import { createSession, getUserByEmail, setSessionCookie, verifyPassword } from "@/lib/auth";
import { errorJson, isFormPost, json, readBody } from "@/lib/http";
import { loginSchema } from "@/lib/validations";

export const runtime = "nodejs";

function safeNext(value: unknown) {
  return typeof value === "string" && value.startsWith("/") ? value : "/dashboard";
}

export async function POST(request: Request) {
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
    return NextResponse.redirect(new URL(safeNext(body.next), request.url), 303);
  }
  return json({ user: { id: user.id, email: user.email } });
}
