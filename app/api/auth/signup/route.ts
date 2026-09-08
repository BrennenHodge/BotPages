import { NextResponse } from "next/server";
import { completeClaim } from "@/lib/claim";
import { getSessionUser } from "@/lib/auth";
import { handleExists } from "@/lib/bots";
import { validateHandle } from "@/lib/handles";
import { insertHold } from "@/lib/holds";
import { errorJson, isFormPost, json, readBody } from "@/lib/http";
import { canClaimWithoutPayment, priceForHandle, stripeConfigured } from "@/lib/pricing";
import { createCheckoutSession } from "@/lib/stripe";
import { hashPassword } from "@/lib/users";
import { claimSchema } from "@/lib/validations";

export const runtime = "nodejs";

function fail(request: Request, form: boolean, status: number, message: string, extra?: Record<string, unknown>) {
  if (form) {
    const url = new URL("/claim", request.url);
    url.searchParams.set("error", message);
    return NextResponse.redirect(url, 303);
  }
  return errorJson(status, message, extra);
}

export async function POST(request: Request) {
  const form = isFormPost(request);
  const body = await readBody(request);
  const parsed = claimSchema.safeParse(body);
  if (!parsed.success) {
    return fail(request, form, 400, parsed.error.issues[0]?.message ?? "Invalid input.");
  }

  const handleCheck = validateHandle(parsed.data.handle);
  if (!handleCheck.ok) return fail(request, form, 400, handleCheck.reason);
  if (await handleExists(handleCheck.handle)) {
    return fail(request, form, 409, "That handle is already claimed.");
  }

  const sessionUser = await getSessionUser();

  const pricing = priceForHandle(handleCheck.handle);
  const displayName = parsed.data.display_name?.trim() || handleCheck.handle;

  if (!canClaimWithoutPayment(handleCheck.handle)) {
    const hold = await insertHold({
      handle: handleCheck.handle,
      email: sessionUser?.email ?? parsed.data.email,
      password_hash: sessionUser ? null : await hashPassword(parsed.data.password),
      display_name: displayName,
      user_id: sessionUser?.id ?? null,
      amount_cents: pricing.amount_cents,
      currency: pricing.currency,
    });

    let checkoutUrl: string | null = null;
    if (stripeConfigured()) {
      try {
        const session = await createCheckoutSession({
          holdId: hold.id,
          handle: handleCheck.handle,
          email: hold.email,
          amountCents: hold.amount_cents,
          currency: hold.currency,
        });
        checkoutUrl = session?.url ?? null;
      } catch (error) {
        return fail(request, form, 502, error instanceof Error ? error.message : "Checkout failed.");
      }
    }

    const payPath = checkoutUrl ?? `/claim/pay?hold=${hold.id}`;
    if (form) {
      return NextResponse.redirect(new URL(payPath, request.url), 303);
    }
    return json(
      {
        payment_required: true,
        hold_id: hold.id,
        handle: handleCheck.handle,
        pricing,
        checkout_url: checkoutUrl,
        pay_url: `/claim/pay?hold=${hold.id}`,
        message: checkoutUrl
          ? "Paid handle. Complete Stripe Checkout to claim."
          : "Paid handle. Stripe is not configured — hold created. Open pay_url or set STRIPE_SECRET_KEY / DEV_BYPASS_PAYMENTS=1.",
      },
      402,
    );
  }

  const result = await completeClaim({
    handle: handleCheck.handle,
    email: sessionUser?.email ?? parsed.data.email,
    password: sessionUser ? undefined : parsed.data.password,
    display_name: displayName,
    user_id: sessionUser?.id ?? null,
  });
  if (!result.ok) return fail(request, form, 409, result.error);
  if (!result.bot) return fail(request, form, 500, "Claim finished but the page did not appear.");

  if (form) {
    return NextResponse.redirect(new URL(`/dashboard/${result.bot.handle}`, request.url), 303);
  }
  return json(
    {
      ok: true,
      at: `@${result.bot.handle}`,
      user: result.user,
      bot: result.bot,
      api_key: result.api_key,
      pricing,
      warning: "Store this send-as key now. Bot Pages only keeps a hash.",
    },
    201,
  );
}
