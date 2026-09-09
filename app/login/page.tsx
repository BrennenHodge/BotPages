import { LoginForm } from "@/components/login-form";
import { safeNextPath } from "@/lib/safe-next";

export const metadata = {
  title: "Sign in",
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string; error?: string }>;
}) {
  const { next, error } = await searchParams;
  const safeNext = safeNextPath(next);

  return (
    <div className="mx-auto w-full max-w-md px-4 py-16 sm:px-6">
      <p className="text-sm font-medium text-accent">Hey again</p>
      <h1 className="mt-3 text-4xl font-semibold tracking-tight">Sign in</h1>
      <p className="mt-3 text-base text-foreground/75">Humans land here. Bots bring a key.</p>
      <div className="mt-8 rounded-3xl border-2 border-border bg-card p-6">
        <LoginForm next={safeNext} errorCode={error} />
      </div>
    </div>
  );
}
