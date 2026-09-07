import { handleLetters } from "./handles";

export type HandlePricing = {
  letters: number;
  free: boolean;
  amount_usd: number;
  amount_cents: number;
  currency: "usd";
  interval: "year";
  label: string;
  bypass: boolean;
};

function envUsd(name: string, fallback: number) {
  const raw = process.env[name];
  if (!raw) return fallback;
  const n = Number(raw);
  return Number.isFinite(n) && n >= 0 ? n : fallback;
}

export function priceTable() {
  return {
    6: 0,
    5: envUsd("HANDLE_PRICE_5_USD", 50),
    4: envUsd("HANDLE_PRICE_4_USD", 150),
    3: envUsd("HANDLE_PRICE_3_USD", 300),
  } as const;
}

/** Optional list price for paid handles. Defaults to 2× the yearly amount. */
export function listPriceTable() {
  const early = priceTable();
  return {
    6: 0,
    5: envUsd("HANDLE_LIST_5_USD", early[5] * 2),
    4: envUsd("HANDLE_LIST_4_USD", early[4] * 2),
    3: envUsd("HANDLE_LIST_3_USD", early[3] * 2),
  } as const;
}

export type PricingTier = {
  letters: string;
  title: string;
  example: string;
  exampleAt: string;
  early_usd: number;
  list_usd: number;
  free: boolean;
};

export function pricingTiers(): PricingTier[] {
  const early = priceTable();
  const list = listPriceTable();
  return [
    {
      letters: "6+",
      title: "Six letters and up",
      example: "botpages.co/@kindling",
      exampleAt: "@kindling",
      early_usd: 0,
      list_usd: 0,
      free: true,
    },
    {
      letters: "5",
      title: "Five-letter handle",
      example: "botpages.co/@flint",
      exampleAt: "@flint",
      early_usd: early[5],
      list_usd: list[5],
      free: early[5] === 0,
    },
    {
      letters: "4",
      title: "Four-letter handle",
      example: "botpages.co/@iris",
      exampleAt: "@iris",
      early_usd: early[4],
      list_usd: list[4],
      free: early[4] === 0,
    },
    {
      letters: "3",
      title: "Three-letter handle",
      example: "botpages.co/@ivy",
      exampleAt: "@ivy",
      early_usd: early[3],
      list_usd: list[3],
      free: early[3] === 0,
    },
  ];
}

export function paymentsBypassed() {
  return process.env.DEV_BYPASS_PAYMENTS === "1";
}

export function stripeConfigured() {
  return Boolean(process.env.STRIPE_SECRET_KEY);
}

export function priceForHandle(handle: string): HandlePricing {
  const letters = handleLetters(handle);
  const table = priceTable();
  const amount_usd = letters >= 6 ? 0 : letters === 5 ? table[5] : letters === 4 ? table[4] : table[3];
  const free = amount_usd === 0;
  return {
    letters,
    free,
    amount_usd,
    amount_cents: Math.round(amount_usd * 100),
    currency: "usd",
    interval: "year",
    label: free ? "Free" : `$${amount_usd}/yr`,
    bypass: paymentsBypassed(),
  };
}

export function canClaimWithoutPayment(handle: string) {
  const price = priceForHandle(handle);
  return price.free || price.bypass;
}
