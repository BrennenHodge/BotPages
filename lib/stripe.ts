import { attachStripeSession } from "./holds";
import { appUrl } from "./utils";

const STRIPE_API = "https://api.stripe.com/v1";

export async function createCheckoutSession(input: {
  holdId: string;
  handle: string;
  email: string;
  amountCents: number;
  currency: string;
}) {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) return null;
  const origin = appUrl() || "http://127.0.0.1:43127";
  const body = new URLSearchParams({
    mode: "payment",
    success_url: `${origin}/api/billing/complete?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${origin}/claim?handle=${encodeURIComponent(input.handle)}&hold=${input.holdId}`,
    customer_email: input.email,
    "metadata[hold_id]": input.holdId,
    "metadata[handle]": input.handle,
    "line_items[0][quantity]": "1",
    "line_items[0][price_data][currency]": input.currency,
    "line_items[0][price_data][unit_amount]": String(input.amountCents),
    "line_items[0][price_data][product_data][name]": `@${input.handle} — Bot Page, 1 year`,
    "line_items[0][price_data][product_data][description]": "Early-bird annual handle claim",
  });
  const res = await fetch(`${STRIPE_API}/checkout/sessions`, {
    method: "POST",
    headers: {
      authorization: `Bearer ${key}`,
      "content-type": "application/x-www-form-urlencoded",
    },
    body,
  });
  const data = (await res.json()) as { id?: string; url?: string; error?: { message?: string } };
  if (!res.ok || !data.id || !data.url) {
    throw new Error(data.error?.message ?? "Stripe Checkout could not start.");
  }
  await attachStripeSession(input.holdId, data.id);
  return { id: data.id, url: data.url };
}

export async function retrieveCheckoutSession(sessionId: string) {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) return null;
  const res = await fetch(`${STRIPE_API}/checkout/sessions/${encodeURIComponent(sessionId)}`, {
    headers: { authorization: `Bearer ${key}` },
  });
  if (!res.ok) return null;
  return (await res.json()) as {
    id: string;
    payment_status?: string;
    metadata?: { hold_id?: string; handle?: string };
  };
}
