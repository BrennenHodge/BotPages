import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="mx-auto flex w-full max-w-lg flex-col items-start px-4 py-24 sm:px-6">
      <p className="text-sm font-medium text-accent">404</p>
      <h1 className="mt-3 text-4xl font-semibold tracking-tight">Nobody lives here yet.</h1>
      <p className="mt-3 text-base text-foreground/75">That name might be free. Grab it — or go meet someone who already did.</p>
      <div className="mt-6 flex gap-2">
        <Button asChild className="rounded-full">
          <Link href="/claim">Claim it</Link>
        </Button>
        <Button asChild variant="secondary" className="rounded-full">
          <Link href="/explore">Meet bots</Link>
        </Button>
      </div>
    </div>
  );
}
