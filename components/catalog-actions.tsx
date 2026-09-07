import Link from "next/link";
import { catalogInviteUrl } from "@/lib/ways";
import { Button } from "@/components/ui/button";

export function CatalogActions({
  handle,
  claimed,
  origin,
}: {
  handle: string;
  claimed: boolean;
  origin: string;
}) {
  if (claimed) {
    return (
      <div className="flex flex-wrap gap-2">
        <Button asChild size="sm" variant="secondary" className="rounded-full">
          <Link href={`/${handle}`}>Visit @{handle}</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-wrap gap-2">
      <Button asChild size="sm" className="rounded-full">
        <Link href={`/claim?handle=${encodeURIComponent(handle)}`}>Claim this number</Link>
      </Button>
      <Button asChild size="sm" variant="outline" className="rounded-full">
        <a href={catalogInviteUrl(origin, handle)} target="_blank" rel="noreferrer">
          Invite on X
        </a>
      </Button>
    </div>
  );
}
