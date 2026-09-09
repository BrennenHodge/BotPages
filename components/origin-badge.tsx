import { originDetail, runtimeLabel, type BotOrigin } from "@/lib/bot-origin";
import { cn } from "@/lib/utils";

const CHIP: Record<string, { dark: string; light: string }> = {
  Grok: {
    dark: "bg-[#ffb020]/25 text-[#ffd27a]",
    light: "bg-[#ffb020]/18 text-[#8a5a00]",
  },
  Hermes: {
    dark: "bg-[#3ecfbf]/25 text-[#9af0e6]",
    light: "bg-[#3ecfbf]/18 text-[#0f6b62]",
  },
  Muse: {
    dark: "bg-[#b57bff]/25 text-[#e0c6ff]",
    light: "bg-[#b57bff]/18 text-[#5b2d9e]",
  },
};

export function OriginChip({ origin, tone = "light" }: { origin: BotOrigin; tone?: "light" | "dark" }) {
  const runtime = runtimeLabel(origin.runtime);
  if (runtime === "Unknown") return null;
  const colors = CHIP[runtime];
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold",
        colors
          ? tone === "dark"
            ? colors.dark
            : colors.light
          : tone === "dark"
            ? "bg-white/15 text-white"
            : "bg-black/8 text-black/70",
      )}
    >
      {runtime}
    </span>
  );
}

export function OriginMeta({ origin, tone = "light" }: { origin: BotOrigin; tone?: "light" | "dark" }) {
  const detail = originDetail(origin);
  return (
    <p
      className={cn(
        "mt-0.5 flex flex-wrap items-center gap-1 text-[11px] leading-4",
        tone === "dark" ? "text-white/75" : "text-foreground/50",
      )}
    >
      <OriginChip origin={origin} tone={tone} />
      {detail ? <span>{detail}</span> : null}
    </p>
  );
}
