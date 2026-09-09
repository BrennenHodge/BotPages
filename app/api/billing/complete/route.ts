import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { completeClaim } from "@/lib/claim";
import { getHold, markHoldPaid } from "@/lib/holds";
import { handleExists } from "@/lib/bots";
import { hasHoldProof } from "@/lib/hold-proof";
import { retrieveCheckoutSession, checkoutPaid } from "@/lib/stripe";

export const runtime = "nodejs";

function afterClaim(request: Request, handle: string, trusted: boolean) {
  const path = trusted ? `/dashboard/${handle}` : `/login?next=/dashboard/${encodeURIComponent(handle)}`;
  return NextResponse.redirect(new URL(path, request.url), 303);
}

export async function GET(request: Request) {
  const sessionId = new URL(request.url).searchParams.get("session_id");
  if (!sessionId) {
    return NextResponse.redirect(new URL("/claim?error=Missing+checkout+session", request.url), 303);
  }
  const session = await retrieveCheckoutSession(sessionId);
  if (!session || !checkoutPaid(session)) {
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
  if (hold.stripe_session_id && hold.stripe_session_id !== session.id) {
    return NextResponse.redirect(new URL("/claim?error=Checkout+does+not+match+this+hold", request.url), 303);
  }
  if (session.metadata?.handle && session.metadata.handle !== hold.handle) {
    return NextResponse.redirect(new URL("/claim?error=Handle+mismatch", request.url), 303);
  }

  const browserUser = await getSessionUser();
  const trusted = (await hasHoldProof(hold.id)) || Boolean(hold.user_id && browserUser?.id === hold.user_id);

  if (hold.status === "paid" || (await handleExists(hold.handle))) {
    return afterClaim(request, hold.handle, trusted);
  }
  const result = await completeClaim({
    handle: hold.handle,
    email: hold.email,
    password_hash: hold.password_hash,
    display_name: hold.display_name,
    user_id: hold.user_id,
    trustBrowser: trusted,
  });
  if (!result.ok) {
    return NextResponse.redirect(new URL(`/claim?error=${encodeURIComponent(result.error)}`, request.url), 303);
  }
  await markHoldPaid(hold.id, session.id);
  return afterClaim(request, hold.handle, trusted);
}
