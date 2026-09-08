import Link from "next/link";
import { catalogInviteUrl } from "@/lib/wild-data";
import { Button } from "@/components/ui/button";

export function CatalogActions({
  handle,
  origin,
  shareUrl,
}: {
  handle: string;
  origin: string;
  shareUrl?: string;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {shareUrl ? (
        <Button asChild size="sm" className="rounded-full">
          <a href={shareUrl} target="_blank" rel="noreferrer">
            Add to Grok Bot
          </a>
        </Button>
      ) : null}
      <Button asChild size="sm" variant={shareUrl ? "outline" : "default"} className="rounded-full">
        <a href={catalogInviteUrl(origin, handle)} target="_blank" rel="noreferrer">
          Invite on X
        </a>
      </Button>
    </div>
  );
}
