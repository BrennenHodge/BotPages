import { cookies } from "next/headers";
import { execute, queryOne } from "./db";
import { getBotByUserId } from "./bots";
import { makeId } from "./ids";
import type { User } from "./types";

export { createUser, getUserByEmail, getUserById, hashPassword, verifyPassword } from "./users";

export const SESSION_COOKIE = "cb_session";
export const REVEAL_COOKIE = "cb_reveal_key";
const SESSION_DAYS = 14;

export async function createSession(userId: string) {
  const id = makeId("ses");
  const token = makeId("tok");
  const expires = new Date(Date.now() + SESSION_DAYS * 24 * 60 * 60 * 1000);
  await execute("INSERT INTO sessions (id, user_id, token, expires_at) VALUES (?, ?, ?, ?)", [
    id,
    userId,
    token,
    expires.toISOString(),
  ]);
  return { token, expires };
}

export async function setSessionCookie(token: string, expires: Date) {
  const jar = await cookies();
  jar.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    expires,
  });
}

export async function clearSessionCookie() {
  const jar = await cookies();
  jar.delete(SESSION_COOKIE);
}

export async function setRevealKeyCookie(key: string) {
  const jar = await cookies();
  jar.set(REVEAL_COOKIE, key, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24,
  });
}

export async function takeRevealKey() {
  const jar = await cookies();
  return jar.get(REVEAL_COOKIE)?.value ?? null;
}

export async function getSessionUser(): Promise<User | null> {
  const jar = await cookies();
  const token = jar.get(SESSION_COOKIE)?.value;
  if (!token) return null;
  const row = await queryOne<{
    user_id: string;
    email: string;
    created_at: string;
    expires_at: string;
  }>(
    `SELECT s.user_id, u.email, u.created_at, s.expires_at
     FROM sessions s
     JOIN users u ON u.id = s.user_id
     WHERE s.token = ?`,
    [token],
  );
  if (!row) return null;
  if (new Date(row.expires_at).getTime() < Date.now()) {
    await execute("DELETE FROM sessions WHERE token = ?", [token]);
    return null;
  }
  return { id: row.user_id, email: row.email, created_at: row.created_at };
}

export async function destroySession() {
  const jar = await cookies();
  const token = jar.get(SESSION_COOKIE)?.value;
  if (token) {
    await execute("DELETE FROM sessions WHERE token = ?", [token]);
  }
  await clearSessionCookie();
}

export async function getSessionContext() {
  const user = await getSessionUser();
  if (!user) return { user: null, bot: null };
  const bot = await getBotByUserId(user.id);
  return { user, bot };
}

export function publicUser(user: User) {
  return { id: user.id, email: user.email, created_at: user.created_at };
}
