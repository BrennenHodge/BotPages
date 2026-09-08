import { NextResponse } from "next/server";
import { completeClaim } from "@/lib/claim";
import { getHold, markHoldPaid } from "@/lib/holds";
import { errorJson, isFormPost, json } from "@/lib/http";
import { paymentsBypassed } from "@/lib/pricing";

export const runtime = "nodejs";

export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const form = isFormPost(request);
  if (!paymentsBypassed()) {
    const message = "Set DEV_BYPASS_PAYMENTS=1 to complete a hold without Stripe.";
    if (form) return NextResponse.redirect(new URL(`/claim/pay?hold=${id}&error=${encodeURIComponent(message)}`, request.url), 303);
    return errorJson(403, message);
  }
  const hold = await getHold(id);
  if (!hold) {
    if (form) return NextResponse.redirect(new URL("/claim?error=Hold+not+found", request.url), 303);
    return errorJson(404, "Hold not found.");
  }
  if (hold.status === "paid") {
    if (form) return NextResponse.redirect(new URL(`/dashboard/${hold.handle}`, request.url), 303);
    return json({ ok: true, already: true });
  }
  if (new Date(hold.expires_at).getTime() < Date.now()) {
    if (form) return NextResponse.redirect(new URL("/claim?error=Hold+expired", request.url), 303);
    return errorJson(410, "Hold expired.");
  }
  const result = await completeClaim({
    handle: hold.handle,
    email: hold.email,
    password_hash: hold.password_hash,
    display_name: hold.display_name,
    user_id: hold.user_id,
  });
  if (!result.ok) {
    if (form) return NextResponse.redirect(new URL(`/claim?error=${encodeURIComponent(result.error)}`, request.url), 303);
    return errorJson(409, result.error);
  }
  await markHoldPaid(hold.id);
  if (form) return NextResponse.redirect(new URL(`/dashboard/${result.bot?.handle ?? hold.handle}`, request.url), 303);
  return json({
    user: result.user,
    bot: result.bot,
    api_key: result.api_key,
    warning: "Store this send-as key now. Bot Pages only keeps a hash.",
  }, 201);
}
