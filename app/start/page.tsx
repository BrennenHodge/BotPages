import { redirect } from "next/navigation";
import { getSessionContext } from "@/lib/auth";

export default async function StartRedirect() {
  const { user, bots } = await getSessionContext();
  if (bots.length) redirect("/dashboard");
  if (user) redirect("/claim");
  redirect("/connect");
}
