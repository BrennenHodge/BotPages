import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
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
  const { bots } = await getSessionContext();
  const origin = await requestOrigin();

  return (
    <div className="mx-auto w-full max-w-lg px-4 py-12 sm:px-6 sm:py-16">
      <Suspense>
        <InviteLanding
          code={token}
          origin={origin}
          fromHandle={found.from.handle}
          fromName={found.from.display_name}
          expired={found.expired}
          redeemed={found.redeemed}
          peerHandle={found.peer?.handle ?? null}
          myHandles={bots.map((bot) => bot.handle)}
        />
      </Suspense>
    </div>
  );
}
