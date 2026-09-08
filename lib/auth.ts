import { cookies } from "next/headers";
import { execute, queryOne } from "./db";
import { getOwnedBot, listBotsByUserId } from "./bots";
import { makeId } from "./ids";
import type { Bot, User } from "./types";

export { createUser, getUserByEmail, getUserById, hashPassword, updatePassword, verifyPassword } from "./users";

export const SESSION_COOKIE = "cb_session";
export const REVEAL_COOKIE = "cb_reveal_key";
const SESSION_DAYS = 14;
const REVEAL_LEGACY = "__legacy";
const REVEAL_MAX_CHARS = 3500;

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

function parseRevealMap(raw?: string | null): Record<string, string> {
  if (!raw) return {};
  if (raw.startsWith("{")) {
    try {
      const parsed = JSON.parse(raw) as unknown;
      if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
        return Object.fromEntries(
          Object.entries(parsed as Record<string, unknown>).filter(
            (entry): entry is [string, string] => typeof entry[1] === "string",
          ),
        );
      }
    } catch {
      /* fall through */
    }
  }
  return { [REVEAL_LEGACY]: raw };
}

export async function setRevealKeyCookie(handle: string, key: string) {
  const jar = await cookies();
  const map = parseRevealMap(jar.get(REVEAL_COOKIE)?.value);
  delete map[REVEAL_LEGACY];
  map[handle.toLowerCase()] = key;
  const entries = Object.entries(map);
  while (JSON.stringify(Object.fromEntries(entries)).length > REVEAL_MAX_CHARS && entries.length > 1) {
    entries.shift();
  }
  jar.set(REVEAL_COOKIE, JSON.stringify(Object.fromEntries(entries)), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24,
  });
}

export async function takeRevealKey(handle?: string) {
  const jar = await cookies();
  const map = parseRevealMap(jar.get(REVEAL_COOKIE)?.value);
  if (handle) {
    const named = map[handle.toLowerCase()];
    if (named) return named;
    const keys = Object.keys(map);
    if (map[REVEAL_LEGACY] && keys.length === 1) return map[REVEAL_LEGACY];
    return null;
  }
  return map[REVEAL_LEGACY] ?? Object.values(map)[0] ?? null;
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

export async function getSessionToken() {
  const jar = await cookies();
  return jar.get(SESSION_COOKIE)?.value ?? null;
}

export async function destroySession() {
  const jar = await cookies();
  const token = jar.get(SESSION_COOKIE)?.value;
  if (token) {
    await execute("DELETE FROM sessions WHERE token = ?", [token]);
  }
  await clearSessionCookie();
}

export async function destroyOtherSessions(userId: string, keepToken?: string | null) {
  if (keepToken) {
    await execute("DELETE FROM sessions WHERE user_id = ? AND token != ?", [userId, keepToken]);
    return;
  }
  await execute("DELETE FROM sessions WHERE user_id = ?", [userId]);
}

export async function getSessionContext() {
  const user = await getSessionUser();
  if (!user) return { user: null, bot: null as Bot | null, bots: [] as Bot[] };
  const bots = await listBotsByUserId(user.id);
  return { user, bots, bot: bots[0] ?? null };
}

export async function requireOwnedBot(handle?: string | null) {
  const user = await getSessionUser();
  if (!user) return { ok: false as const, status: 401 as const, user: null, bot: null };
  if (!handle) return { ok: false as const, status: 400 as const, user, bot: null };
  const bot = await getOwnedBot(user.id, handle);
  if (!bot) return { ok: false as const, status: 404 as const, user, bot: null };
  return { ok: true as const, status: 200 as const, user, bot };
}

export function publicUser(user: User) {
  return { id: user.id, email: user.email, created_at: user.created_at };
}
