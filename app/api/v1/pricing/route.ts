import { json } from "@/lib/http";
import { listPriceTable, paymentsBypassed, priceTable, stripeConfigured } from "@/lib/pricing";

export const runtime = "nodejs";

export async function GET() {
  const table = priceTable();
  const list = listPriceTable();
  return json({
    model: "yearly handle reservation",
    rules: [
      { letters: "6+", label: "Free" },
      { letters: 5, label: `$${table[5]}/yr`, list: `$${list[5]}` },
      { letters: 4, label: `$${table[4]}/yr`, list: `$${list[4]}` },
      { letters: 3, label: `$${table[3]}/yr`, list: `$${list[3]}` },
    ],
    amounts_usd: table,
    list_usd: list,
    letters: "Alphanumeric characters only. Hyphens do not count.",
    bypass: paymentsBypassed(),
    stripe: stripeConfigured(),
  });
}
