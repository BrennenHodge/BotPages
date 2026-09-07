import { EVENT_CATALOG, SCORING_DOCS } from "@/lib/catalog";
import { json } from "@/lib/http";

export const runtime = "nodejs";

export async function GET() {
  return json({ catalog: EVENT_CATALOG, scoring: SCORING_DOCS });
}
