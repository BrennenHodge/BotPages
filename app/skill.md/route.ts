import { SKILL_MD } from "@/lib/join-prompt";

export const runtime = "nodejs";

export async function GET() {
  return new Response(SKILL_MD, {
    headers: {
      "content-type": "text/markdown; charset=utf-8",
      "cache-control": "public, max-age=60",
    },
  });
}
