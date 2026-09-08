import { createHash, randomBytes } from "node:crypto";
import { execute, queryOne } from "./db";
import { makeId, nowIso } from "./ids";
import { sendMail } from "./mail";
import { appUrl } from "./utils";

const RESET_MINUTES = 60;
const COOLDOWN_MS = 60_000;

type ResetRow = {
  id: string;
  user_id: string;
  token_hash: string;
  expires_at: string;
  used_at: string | null;
  created_at: string;
};

function hashToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

export async function issuePasswordReset(userId: string, email: string, origin: string) {
  const recent = await queryOne<ResetRow>(
    `SELECT * FROM password_resets
     WHERE user_id = ? AND used_at IS NULL
     ORDER BY created_at DESC
     LIMIT 1`,
    [userId],
  );
  if (recent && Date.now() - new Date(recent.created_at).getTime() < COOLDOWN_MS) {
    return { sent: false as const, previewUrl: null };
  }

  const token = randomBytes(32).toString("hex");
  const now = nowIso();
  const expires = new Date(Date.now() + RESET_MINUTES * 60 * 1000).toISOString();
  await execute(
    "INSERT INTO password_resets (id, user_id, token_hash, expires_at, used_at, created_at) VALUES (?, ?, ?, ?, NULL, ?)",
    [makeId("pwr"), userId, hashToken(token), expires, now],
  );

  const base = origin || appUrl() || "http://127.0.0.1:43127";
  const resetUrl = `${base.replace(/\/$/, "")}/reset?token=${encodeURIComponent(token)}`;
  const text = `Reset your Bot Pages password:\n\n${resetUrl}\n\nThis link expires in ${RESET_MINUTES} minutes. If you didn't ask for it, ignore this email.`;

  const mailed = await sendMail({
    to: email,
    subject: "Reset your Bot Pages password",
    text,
    html: `<p>Reset your Bot Pages password:</p><p><a href="${resetUrl}">${resetUrl}</a></p><p>This link expires in ${RESET_MINUTES} minutes. If you didn't ask for it, ignore this email.</p>`,
  });

  if (!mailed.ok) {
    console.info(`[password-reset] ${email} ${resetUrl}`);
  }

  const preview =
    process.env.NODE_ENV !== "production" || process.env.MAIL_DEBUG === "1" ? resetUrl : null;
  return { sent: mailed.ok, previewUrl: preview };
}

export async function consumePasswordReset(token: string) {
  const row = await queryOne<ResetRow>("SELECT * FROM password_resets WHERE token_hash = ?", [
    hashToken(token),
  ]);
  if (!row || row.used_at) return null;
  if (new Date(row.expires_at).getTime() < Date.now()) return null;
  await execute("UPDATE password_resets SET used_at = ? WHERE id = ?", [nowIso(), row.id]);
  await execute("UPDATE password_resets SET used_at = COALESCE(used_at, ?) WHERE user_id = ? AND used_at IS NULL", [
    nowIso(),
    row.user_id,
  ]);
  return row;
}
