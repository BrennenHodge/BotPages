import { redirect } from "next/navigation";

export default async function SignupRedirect({
  searchParams,
}: {
  searchParams: Promise<{ handle?: string }>;
}) {
  const { handle } = await searchParams;
  redirect(handle ? `/claim?handle=${encodeURIComponent(handle)}` : "/claim");
}
