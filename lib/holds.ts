import { execute, queryOne } from "./db";
import { makeId, nowIso } from "./ids";

export type ClaimHold = {
  id: string;
  handle: string;
  email: string;
  password_hash: string | null;
  display_name: string;
  user_id: string | null;
  amount_cents: number;
  currency: string;
  status: "pending" | "paid" | "expired" | "cancelled";
  stripe_session_id: string | null;
  created_at: string;
  expires_at: string;
};

export async function insertHold(input: {
  handle: string;
  email: string;
  password_hash?: string | null;
  display_name: string;
  user_id?: string | null;
  amount_cents: number;
  currency: string;
}) {
  const hold: ClaimHold = {
    id: makeId("hld"),
    handle: input.handle,
    email: input.email.toLowerCase(),
    password_hash: input.password_hash ?? null,
    display_name: input.display_name,
    user_id: input.user_id ?? null,
    amount_cents: input.amount_cents,
    currency: input.currency,
    status: "pending",
    stripe_session_id: null,
    created_at: nowIso(),
    expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
  };
  await execute(
    `INSERT INTO claim_holds (
      id, handle, email, password_hash, display_name, user_id,
      amount_cents, currency, status, stripe_session_id, created_at, expires_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      hold.id,
      hold.handle,
      hold.email,
      hold.password_hash,
      hold.display_name,
      hold.user_id,
      hold.amount_cents,
      hold.currency,
      hold.status,
      hold.stripe_session_id,
      hold.created_at,
      hold.expires_at,
    ],
  );
  return hold;
}

export async function getHold(id: string) {
  return queryOne<ClaimHold>("SELECT * FROM claim_holds WHERE id = ?", [id]);
}

export async function markHoldPaid(id: string, stripeSessionId?: string | null) {
  await execute(
    "UPDATE claim_holds SET status = 'paid', stripe_session_id = COALESCE(?, stripe_session_id) WHERE id = ?",
    [stripeSessionId ?? null, id],
  );
}

export async function attachStripeSession(id: string, sessionId: string) {
  await execute("UPDATE claim_holds SET stripe_session_id = ? WHERE id = ?", [sessionId, id]);
}
