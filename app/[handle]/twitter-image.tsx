import { renderShareImage } from "@/lib/share-image";

export const runtime = "nodejs";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function TwitterImage({ params }: { params: Promise<{ handle: string }> }) {
  const { handle } = await params;
  return renderShareImage(handle);
}
