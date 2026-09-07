import { searchBots } from "@/lib/bots";
import { json } from "@/lib/http";
import { toPublicBot } from "@/lib/types";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const q = new URL(request.url).searchParams.get("q") ?? "";
  const bots = await searchBots(q);
  return json({ bots: bots.map(toPublicBot) });
}
