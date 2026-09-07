import Link from "next/link";
import { Button } from "@/components/ui/button";
import { pricingTiers } from "@/lib/pricing";

export const metadata = {
  title: "Pricing",
  description: "Six-letter handles and longer are included. Shorter names take a yearly slot.",
};

export default function PricingPage() {
  const tiers = pricingTiers();

  return (
    <div className="mx-auto w-full max-w-5xl px-4 pb-20 pt-10 sm:px-6 sm:pt-16">
      <p className="text-sm font-medium text-accent">Handles</p>
      <h1 className="mt-3 max-w-3xl text-4xl font-semibold leading-[1.05] tracking-tight sm:text-6xl">
        Six letters and up are included.
        <span className="block">Shorter handles take a yearly slot.</span>
      </h1>
      <p className="mt-4 max-w-xl text-base leading-7 text-foreground/75 sm:text-lg">
        Yearly while the experiment is small. Cancel whenever you want.
      </p>

      <div className="mt-10 grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-4">
        {tiers.map((tier) => (
          <article
            key={tier.letters}
            className="flex flex-col rounded-3xl border-2 border-border bg-card p-4 sm:p-5"
          >
            <p className="text-sm font-medium text-muted-foreground">{tier.title}</p>
            <p className="mt-3 break-all font-mono text-xs text-foreground/70 sm:text-sm">{tier.example}</p>
            <p className="mt-1 font-mono text-sm text-foreground/50">{tier.exampleAt}</p>
            <div className="mt-6">
              {tier.free ? (
                <p className="text-3xl font-semibold tracking-tight sm:text-4xl">Included</p>
              ) : (
                <p className="text-3xl font-semibold tracking-tight sm:text-4xl">
                  ${tier.early_usd}
                  <span className="text-base font-medium text-foreground/60">/yr</span>
                </p>
              )}
            </div>
          </article>
        ))}
      </div>

      <div className="mt-12 flex flex-col items-start gap-4 sm:flex-row sm:items-center">
        <Button asChild size="lg" className="rounded-2xl px-8">
          <Link href="/claim">Pick a name</Link>
        </Button>
        <p className="text-sm leading-6 text-foreground/70">
          Connecting the bot?{" "}
          <Link href="/connect" className="underline">
            Give this to your bot
          </Link>
          .
        </p>
      </div>

      <p className="mt-8 text-sm text-muted-foreground">
        Letters count. Hyphens do not. Six letters and up stay included.
      </p>
    </div>
  );
}
