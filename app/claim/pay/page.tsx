import Link from "next/link";
import { notFound } from "next/navigation";
import { Button } from "@/components/ui/button";
import { getHold } from "@/lib/holds";
import { paymentsBypassed, priceForHandle, stripeConfigured } from "@/lib/pricing";
import { createCheckoutSession } from "@/lib/stripe";

export const metadata = {
  title: "Pay to claim",
};

export default async function PayPage({
  searchParams,
}: {
  searchParams: Promise<{ hold?: string; error?: string }>;
}) {
  const { hold: holdId, error } = await searchParams;
  if (!holdId) notFound();
  const hold = await getHold(holdId);
  if (!hold) notFound();
  const pricing = priceForHandle(hold.handle);
  const bypass = paymentsBypassed();
  let checkoutUrl: string | null = null;
  if (stripeConfigured() && hold.status === "pending") {
    try {
      const session = await createCheckoutSession({
        holdId: hold.id,
        handle: hold.handle,
        email: hold.email,
      });
      checkoutUrl = session?.url ?? null;
    } catch {
      checkoutUrl = null;
    }
  }

  return (
    <div className="mx-auto w-full max-w-lg px-4 py-16 sm:px-6">
      <p className="kicker">Paid handle</p>
      <h1 className="mt-3 text-4xl font-semibold">@{hold.handle}</h1>
      <p className="mt-3 text-sm text-muted-foreground">
        {pricing.letters} letters · {pricing.label} yearly. Six letters and up stay included.
      </p>
      {error ? <p className="mt-4 text-sm text-destructive">{error}</p> : null}
      <div className="mt-8 space-y-3 border border-border bg-card p-6">
        <p className="text-3xl font-semibold">{pricing.label}</p>
        <p className="text-xs text-muted-foreground">
          Hold {hold.id} expires {hold.expires_at.slice(0, 16).replace("T", " ")} UTC.
        </p>
        {checkoutUrl ? (
          <Button asChild className="w-full">
            <a href={checkoutUrl}>Pay with Stripe</a>
          </Button>
        ) : bypass ? (
          <form method="post" action={`/api/billing/holds/${hold.id}/complete`}>
            <Button type="submit" className="w-full">
              Complete claim (dev bypass)
            </Button>
          </form>
        ) : (
          <p className="text-sm text-muted-foreground">
            Stripe is not configured. Set <code>STRIPE_SECRET_KEY</code> for Checkout, or{" "}
            <code>DEV_BYPASS_PAYMENTS=1</code> to complete holds locally.
          </p>
        )}
        <Button asChild variant="ghost" className="w-full">
          <Link href={`/claim?handle=${hold.handle}`}>Back</Link>
        </Button>
      </div>
    </div>
  );
}
