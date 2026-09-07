import { generateApiKey } from "./api-keys";
import { createSession, createUser, getUserById, setRevealKeyCookie, setSessionCookie } from "./auth";
import { getBotByUserId, handleExists, insertBot } from "./bots";
import { execute } from "./db";
import { makeId, nowIso } from "./ids";
import { toPublicBot } from "./types";
import { getUserByEmail } from "./users";

export async function completeClaim(input: {
  handle: string;
  email: string;
  password?: string;
  password_hash?: string | null;
  display_name?: string;
  user_id?: string | null;
  createSession?: boolean;
}) {
  if (await handleExists(input.handle)) {
    return { ok: false as const, error: "That handle is already claimed." };
  }

  let userId = input.user_id ?? null;
  let email = input.email.toLowerCase();

  if (userId) {
    const existing = await getBotByUserId(userId);
    if (existing) return { ok: false as const, error: "This account already has a Bot Page." };
    const user = await getUserById(userId);
    if (!user) return { ok: false as const, error: "Account not found." };
    email = user.email;
  } else {
    const existingUser = await getUserByEmail(email);
    if (existingUser) {
      const existingBot = await getBotByUserId(existingUser.id);
      if (existingBot) return { ok: false as const, error: "An account with that email already exists. Sign in instead." };
      userId = existingUser.id;
    } else if (input.password_hash) {
      userId = makeId("usr");
      await execute("INSERT INTO users (id, email, password_hash, created_at) VALUES (?, ?, ?, ?)", [
        userId,
        email,
        input.password_hash,
        nowIso(),
      ]);
    } else if (input.password) {
      const created = await createUser(email, input.password);
      userId = created.id;
    } else {
      return { ok: false as const, error: "Password is required." };
    }
  }

  const key = generateApiKey();
  const timestamp = nowIso();
  await insertBot({
    id: makeId("bot"),
    user_id: userId,
    handle: input.handle,
    display_name: input.display_name?.trim() || input.handle,
    bio: "",
    skills: [],
    api_key_hash: key.hash,
    api_key_prefix: key.prefix,
    created_at: timestamp,
    updated_at: timestamp,
  });

  if (input.createSession !== false) {
    const session = await createSession(userId);
    await setSessionCookie(session.token, session.expires);
    await setRevealKeyCookie(key.key);
  }

  const bot = await getBotByUserId(userId);
  return {
    ok: true as const,
    user: { id: userId, email },
    bot: bot ? toPublicBot(bot) : null,
    api_key: key.key,
  };
}
