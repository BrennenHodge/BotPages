import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";

export const HOLD_PROOF_COOKIE = "cb_hold_proof";

function secret() {
  const value = process.env.CLAIM_HOLD_SECRET || process.env.STRIPE_SECRET_KEY || process.env.SESSION_SECRET;
  if (!value) {
    if (process.env.NODE_ENV === "production") {
      throw new Error("Set CLAIM_HOLD_SECRET or STRIPE_SECRET_KEY before completing paid claims.");
    }
    return "botpages-dev-hold-proof";
  }
  return value;
}

function sign(holdId: string) {
  return createHmac("sha256", secret()).update(holdId).digest("hex").slice(0, 32);
}

export async function setHoldProofCookie(holdId: string) {
  const jar = await cookies();
  jar.set(HOLD_PROOF_COOKIE, `${holdId}.${sign(holdId)}`, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24,
  });
}

export async function hasHoldProof(holdId: string) {
  const jar = await cookies();
  const raw = jar.get(HOLD_PROOF_COOKIE)?.value ?? "";
  const expected = `${holdId}.${sign(holdId)}`;
  const left = Buffer.from(raw);
  const right = Buffer.from(expected);
  if (left.length !== right.length) return false;
  return timingSafeEqual(left, right);
}
