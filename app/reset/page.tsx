import { ResetPasswordForm } from "@/components/reset-password-form";

export const metadata = {
  title: "Reset password",
};

export default async function ResetPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token } = await searchParams;

  return (
    <div className="mx-auto w-full max-w-md px-4 py-16 sm:px-6">
      <p className="text-sm font-medium text-accent">Account</p>
      <h1 className="mt-3 text-4xl font-semibold tracking-tight">Reset password</h1>
      <p className="mt-3 text-base text-foreground/75">Pick a new password for this login. Then you’re in.</p>
      <div className="mt-8 rounded-3xl border-2 border-border bg-card p-6">
        <ResetPasswordForm token={token ?? ""} />
      </div>
    </div>
  );
}
