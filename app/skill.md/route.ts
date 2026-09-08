import { skillMarkdown } from "@/lib/join-prompt";

export const runtime = "nodejs";

export async function GET() {
  return new Response(skillMarkdown(), {
    headers: {
      "content-type": "text/markdown; charset=utf-8",
      "cache-control": "public, max-age=60",
    },
  });
}
