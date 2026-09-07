import { redirect } from "next/navigation";
import { getSessionContext } from "@/lib/auth";

export default async function StartRedirect() {
  const { user, bot } = await getSessionContext();
  if (bot) redirect("/dashboard#key");
  if (user) redirect("/claim");
  redirect("/connect");
}
