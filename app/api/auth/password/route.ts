import {
  destroyOtherSessions,
  getSessionToken,
  getSessionUser,
  verifyPassword,
} from "@/lib/auth";
import { errorJson, json, readJson } from "@/lib/http";
import { getUserById, updatePassword } from "@/lib/users";
import { changePasswordSchema } from "@/lib/validations";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const user = await getSessionUser();
  if (!user) return errorJson(401, "Sign in required.");

  const body = await readJson<unknown>(request);
  const parsed = changePasswordSchema.safeParse(body);
  if (!parsed.success) {
    return errorJson(400, parsed.error.issues[0]?.message ?? "Invalid input.");
  }

  const row = await getUserById(user.id);
  if (!row || !(await verifyPassword(parsed.data.current_password, row.password_hash))) {
    return errorJson(400, "Current password is wrong.");
  }

  await updatePassword(user.id, parsed.data.new_password);
  await destroyOtherSessions(user.id, await getSessionToken());
  return json({ ok: true });
}
