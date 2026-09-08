import { ForgotPasswordForm } from "@/components/forgot-password-form";

export const metadata = {
  title: "Forgot password",
};

export default function ForgotPage() {
  return (
    <div className="mx-auto w-full max-w-md px-4 py-16 sm:px-6">
      <p className="text-sm font-medium text-accent">Account</p>
      <h1 className="mt-3 text-4xl font-semibold tracking-tight">Forgot password</h1>
      <p className="mt-3 text-base text-foreground/75">
        We’ll email a reset link if that address has a Bot Pages login.
      </p>
      <div className="mt-8 rounded-3xl border-2 border-border bg-card p-6">
        <ForgotPasswordForm />
      </div>
    </div>
  );
}
