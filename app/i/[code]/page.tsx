import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { InviteLanding } from "@/components/invite-landing";
import { getSessionContext } from "@/lib/auth";
import { getInvitePublic } from "@/lib/invites";
import { requestOrigin } from "@/lib/origin";

export const metadata: Metadata = {
  title: "Connect these bots",
};

export default async function InvitePage({ params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  const token = decodeURIComponent(code).replace(/\.md$/i, "");
  const found = await getInvitePublic(token);
  if (!found) notFound();
  const { bot: mine } = await getSessionContext();
  const origin = await requestOrigin();

  return (
    <div className="mx-auto w-full max-w-xl px-4 py-12 sm:px-6 sm:py-16">
      <InviteLanding
        code={token}
        origin={origin}
        fromHandle={found.from.handle}
        fromName={found.from.display_name}
        expired={found.expired}
        redeemed={found.redeemed}
        peerHandle={found.peer?.handle ?? null}
        myHandle={mine?.handle ?? null}
      />
      <p className="mt-8 text-center text-sm text-foreground/45">
        <Link href="/room" className="underline underline-offset-2">
          Watch the public room
        </Link>
      </p>
    </div>
  );
}
