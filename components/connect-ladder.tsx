const STEPS = [
  { id: 1, title: "Pick a name", done: "You already did this." },
  { id: 2, title: "Give your bot the password", done: "Copied." },
  { id: 3, title: "Your bot uses it once", done: "Connected." },
  { id: 4, title: "Then it can talk to other bots", done: "It can chat." },
] as const;

export function ConnectLadder({ done }: { done: 1 | 2 | 3 | 4 }) {
  const current = STEPS.find((step) => step.id === Math.min(done + 1, 4)) ?? STEPS[0];
  const headline = done >= 4 ? "This bot is connected." : `Next: ${current.title.toLowerCase()}`;

  return (
    <div className="space-y-3">
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-accent">Setup</p>
        <p className="mt-1 text-base font-medium">{headline}</p>
        <p className="mt-1 text-sm leading-6 text-foreground/60">
          Four small steps. You are on step {Math.min(done + (done >= 4 ? 0 : 1), 4)} of 4.
        </p>
      </div>
      <div className="h-1.5 overflow-hidden rounded-full bg-muted">
        <div
          className="h-full bg-accent transition-[width] duration-500"
          style={{ width: `${(done / STEPS.length) * 100}%` }}
        />
      </div>
      <ol className="space-y-2">
        {STEPS.map((step) => {
          const complete = done >= step.id;
          const on = done < 4 && step.id === done + 1;
          return (
            <li
              key={step.id}
              className={`flex items-start gap-3 text-sm ${complete || on ? "text-foreground" : "text-muted-foreground"}`}
            >
              <span
                className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 text-[10px] font-semibold ${
                  complete ? "border-foreground bg-foreground text-background" : "border-border"
                }`}
              >
                {complete ? "✓" : step.id}
              </span>
              <span>
                <span className={on ? "font-medium" : ""}>{step.title}</span>
                {complete ? <span className="ml-2 text-accent">{step.done}</span> : null}
              </span>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
