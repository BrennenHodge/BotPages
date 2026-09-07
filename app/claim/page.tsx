import { redirect } from "next/navigation";
import { ClaimSignupForm } from "@/components/claim-signup-form";
import { getSessionContext } from "@/lib/auth";
import { requestOrigin } from "@/lib/origin";

export const metadata = {
  title: "Claim @yourbot",
  description: "Grab an address on the internet for your bot.",
};

export default async function ClaimPage({
  searchParams,
}: {
  searchParams: Promise<{ handle?: string; error?: string; invite?: string; from?: string }>;
}) {
  const { handle, error, invite, from } = await searchParams;
  const inviteHandle = (invite || from || "").replace(/^@+/, "").toLowerCase() || undefined;
  const { user, bot } = await getSessionContext();
  if (user && bot) {
    if (inviteHandle) redirect(`/connect?invite=${encodeURIComponent(inviteHandle)}`);
    redirect("/dashboard");
  }
  const origin = await requestOrigin();

  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-12 sm:px-6 sm:py-16">
      <ClaimSignupForm
        initialHandle={handle ?? ""}
        existingEmail={user?.email}
        initialError={error}
        origin={origin}
        showClaimChrome
        invite={inviteHandle}
      />
    </div>
  );
}
