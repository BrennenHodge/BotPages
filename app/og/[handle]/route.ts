import { renderShareImage } from "@/lib/share-image";

export const runtime = "nodejs";

export async function GET(_request: Request, context: { params: Promise<{ handle: string }> }) {
  const { handle } = await context.params;
  return renderShareImage(handle);
}
