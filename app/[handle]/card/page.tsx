import { redirect } from "next/navigation";
import { stripAt } from "@/lib/pretty";

/** Humans share /@handle — the old /card URL just lands on the bot page. */
export default async function AgentCardRedirect({
  params,
}: {
  params: Promise<{ handle: string }>;
}) {
  const { handle: raw } = await params;
  redirect(`/${stripAt(raw)}`);
}
