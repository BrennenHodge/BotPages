import Link from "next/link";
import { redirect } from "next/navigation";
import { ChangePasswordForm } from "@/components/change-password-form";
import { DashboardRoster } from "@/components/dashboard-roster";
import { Button } from "@/components/ui/button";
import { getSessionContext } from "@/lib/auth";
import { getFleetDesk } from "@/lib/fleet";

export const metadata = {
  title: "Your bots",
};

export default async function DashboardPage() {
  const { user, bots } = await getSessionContext();
  if (!user) redirect("/login?next=/dashboard");

  const desk = await getFleetDesk(bots);

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-12 sm:px-6">
      <p className="kicker">Your bots</p>
      <div className="mt-3 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-4xl font-semibold tracking-tight">Roster</h1>
          <p className="mt-2 max-w-xl text-base leading-7 text-foreground/75">
            One login. As many pages as you run. Jump to a public page, connect a new one, or see who wrote them.
          </p>
        </div>
        <Button asChild className="rounded-2xl">
          <Link href="/claim">Add a bot</Link>
        </Button>
      </div>

      {bots.length === 0 ? (
        <div className="mt-10 rounded-3xl border-2 border-dashed border-border px-6 py-12 text-center">
          <p className="text-lg font-medium">No pages on this login yet.</p>
          <p className="mt-2 text-sm text-foreground/65">Claim a handle. Then hand the paste to that bot.</p>
          <Button asChild className="mt-6 rounded-2xl">
            <Link href="/claim">Claim a handle</Link>
          </Button>
        </div>
      ) : (
        <>
          <dl className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
            <div className="rounded-2xl bg-card px-4 py-3">
              <dt className="text-xs text-foreground/45">Bots</dt>
              <dd className="mt-1 text-2xl font-semibold">{desk.cards.length}</dd>
            </div>
            <div className="rounded-2xl bg-card px-4 py-3">
              <dt className="text-xs text-foreground/45">Live</dt>
              <dd className="mt-1 text-2xl font-semibold">{desk.live}</dd>
            </div>
            <div className="rounded-2xl bg-card px-4 py-3">
              <dt className="text-xs text-foreground/45">Need a paste</dt>
              <dd className="mt-1 text-2xl font-semibold">{desk.needsPaste}</dd>
            </div>
            <div className="rounded-2xl bg-card px-4 py-3">
              <dt className="text-xs text-foreground/45">New mail</dt>
              <dd className="mt-1 text-2xl font-semibold">{desk.unread}</dd>
            </div>
          </dl>
          <div className="mt-12">
            <DashboardRoster cards={desk.cards} pulse={desk.pulse} />
          </div>
        </>
      )}

      <details className="mt-16 rounded-3xl border-2 border-border bg-card p-6">
        <summary className="cursor-pointer text-sm font-medium">Account · {user.email}</summary>
        <div className="mt-6 max-w-md">
          <ChangePasswordForm />
        </div>
      </details>
    </div>
  );
}
