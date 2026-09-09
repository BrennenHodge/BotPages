import { randomBytes } from "node:crypto";
import { hashApiKey } from "./api-keys";
import { getBotByHandle, getBotById } from "./bots";
import { execute, queryOne } from "./db";
import { makeId, nowIso } from "./ids";
import { insertMessage } from "./messages";
import { stripAt } from "./pretty";

export const INVITE_PREFIX = "bpi_";
export const INVITE_TTL_MS = 30 * 24 * 60 * 60 * 1000;

export type Invite = {
  id: string;
  code_hash: string;
  from_bot_id: string;
  redeemed_by_bot_id: string | null;
  message: string | null;
  expires_at: string | null;
  created_at: string;
  redeemed_at: string | null;
};

export function generateInviteCode() {
  return `${INVITE_PREFIX}${randomBytes(18).toString("base64url")}`;
}

export function invitePath(code: string) {
  return `/i/${code}`;
}

export async function createInvite(fromBotId: string, message?: string | null) {
  const code = generateInviteCode();
  const expires = new Date(Date.now() + INVITE_TTL_MS).toISOString();
  const id = makeId("inv");
  await execute(
    `INSERT INTO invites (id, code_hash, from_bot_id, redeemed_by_bot_id, message, expires_at, created_at, redeemed_at)
     VALUES (?, ?, ?, NULL, ?, ?, ?, NULL)`,
    [id, hashApiKey(code), fromBotId, message?.trim() || null, expires, nowIso()],
  );
  return { id, code, expires_at: expires };
}

export async function getInviteByCode(code: string) {
  const token = code.trim();
  if (!token.startsWith(INVITE_PREFIX)) return null;
  const row = await queryOne<Invite>("SELECT * FROM invites WHERE code_hash = ?", [hashApiKey(token)]);
  return row ?? null;
}

export async function getInvitePublic(code: string) {
  const invite = await getInviteByCode(code);
  if (!invite) return null;
  const from = await getBotById(invite.from_bot_id);
  if (!from) return null;
  const expired = Boolean(invite.expires_at && new Date(invite.expires_at).getTime() < Date.now());
  const redeemed = Boolean(invite.redeemed_at && invite.redeemed_by_bot_id);
  const peer = invite.redeemed_by_bot_id ? await getBotById(invite.redeemed_by_bot_id) : null;
  return {
    invite,
    from,
    peer,
    expired,
    redeemed,
  };
}

export async function redeemInvite(code: string, byBotId: string) {
  const found = await getInvitePublic(code);
  if (!found) return { ok: false as const, status: 404 as const, error: "Unknown invite." };
  if (found.expired) return { ok: false as const, status: 410 as const, error: "That invite expired." };
  if (found.invite.from_bot_id === byBotId) {
    return { ok: false as const, status: 400 as const, error: "That’s your own invite." };
  }
  if (found.redeemed && found.invite.redeemed_by_bot_id !== byBotId) {
    return { ok: false as const, status: 409 as const, error: "Someone else already used this invite." };
  }
  if (!found.redeemed) {
    await execute("UPDATE invites SET redeemed_by_bot_id = ?, redeemed_at = ? WHERE id = ?", [
      byBotId,
      nowIso(),
      found.invite.id,
    ]);
    const peerBot = await getBotById(byBotId);
    if (peerBot) {
      const threadId = makeId("thr");
      await insertMessage({
        recipient_bot_id: found.from.id,
        sender_bot_id: peerBot.id,
        sender_type: "bot",
        sender_handle: peerBot.handle,
        sender_name: peerBot.display_name,
        thread_id: threadId,
        text: `hey @${found.from.handle} — I approved your invite. Our bots can talk now. What are you working on?`,
        metadata: { invite_id: found.invite.id, invite_accepted: true },
      });
    }
  }
  const from = found.from;
  const peer = await getBotById(byBotId);
  return { ok: true as const, from, peer };
}

export async function areGranted(fromHandle: string, toHandle: string) {
  const a = stripAt(fromHandle);
  const b = stripAt(toHandle);
  if (!a || !b) return false;
  const from = await getBotByHandle(a);
  const to = await getBotByHandle(b);
  if (!from || !to) return false;
  const row = await queryOne<{ n: number }>(
    `SELECT 1 as n FROM invites
     WHERE redeemed_at IS NOT NULL
       AND (
         (from_bot_id = ? AND redeemed_by_bot_id = ?)
         OR (from_bot_id = ? AND redeemed_by_bot_id = ?)
       )
     LIMIT 1`,
    [to.id, from.id, from.id, to.id],
  );
  return Boolean(row);
}
