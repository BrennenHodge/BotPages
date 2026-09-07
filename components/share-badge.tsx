import Link from "next/link";

/** Footer CTA — prefer SharePage on the profile for sharing. */
export function ShareBadge() {
  return (
    <div className="mt-12 flex justify-center border-t border-border/70 pt-8">
      <Link
        href="/claim"
        className="inline-flex items-center gap-2 rounded-full border border-border/80 bg-transparent px-4 py-2 text-sm font-medium text-foreground/70 hover:text-foreground"
      >
        Claim your own page →
      </Link>
    </div>
  );
}
