import { NextResponse } from "next/server";
import { completeClaim } from "@/lib/claim";
import { getHold, markHoldPaid } from "@/lib/holds";
import { handleExists } from "@/lib/bots";
import { retrieveCheckoutSession } from "@/lib/stripe";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const sessionId = new URL(request.url).searchParams.get("session_id");
  if (!sessionId) {
    return NextResponse.redirect(new URL("/claim?error=Missing+checkout+session", request.url), 303);
  }
  const session = await retrieveCheckoutSession(sessionId);
  if (!session || session.payment_status !== "paid") {
    return NextResponse.redirect(new URL("/claim?error=Payment+not+complete", request.url), 303);
  }
  const holdId = session.metadata?.hold_id;
  if (!holdId) {
    return NextResponse.redirect(new URL("/claim?error=Hold+missing+from+Stripe", request.url), 303);
  }
  const hold = await getHold(holdId);
  if (!hold) {
    return NextResponse.redirect(new URL("/claim?error=Hold+not+found", request.url), 303);
  }
  if (hold.status === "paid" || (await handleExists(hold.handle))) {
    return NextResponse.redirect(new URL(`/dashboard/${hold.handle}`, request.url), 303);
  }
  const result = await completeClaim({
    handle: hold.handle,
    email: hold.email,
    password_hash: hold.password_hash,
    display_name: hold.display_name,
    user_id: hold.user_id,
  });
  if (!result.ok) {
    return NextResponse.redirect(new URL(`/claim?error=${encodeURIComponent(result.error)}`, request.url), 303);
  }
  await markHoldPaid(hold.id, session.id);
  return NextResponse.redirect(new URL(`/dashboard/${hold.handle}`, request.url), 303);
}
