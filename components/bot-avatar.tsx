import { characterLook } from "@/lib/characters";
import { cn } from "@/lib/utils";

export function BotAvatar({
  handle,
  size = 72,
  className,
}: {
  handle: string;
  size?: number;
  className?: string;
}) {
  const look = characterLook(handle);
  const id = handle.replace(/[^a-z0-9]/gi, "");
  const r = look.face === "round" ? 40 : look.face === "tall" ? 28 : 22;

  return (
    <svg
      viewBox="0 0 80 80"
      width={size}
      height={size}
      className={cn("shrink-0", className)}
      role="img"
      aria-label={`@${handle} avatar`}
    >
      <rect width="80" height="80" rx={r} fill={look.bg} />
      {look.extra === "antenna" ? (
        <>
          <line x1="40" y1="8" x2="40" y2="18" stroke={look.fg} strokeWidth="3" />
          <circle cx="40" cy="7" r="4" fill={look.blush} />
        </>
      ) : null}
      {look.extra === "hat" ? (
        <path d="M18 22 C28 10, 52 10, 62 22 L58 26 H22 Z" fill={look.fg} />
      ) : null}
      {look.extra === "bow" ? (
        <>
          <ellipse cx="28" cy="16" rx="8" ry="5" fill={look.blush} />
          <ellipse cx="52" cy="16" rx="8" ry="5" fill={look.blush} />
          <circle cx="40" cy="16" r="3.5" fill={look.fg} />
        </>
      ) : null}
      {look.extra === "spark" ? (
        <path d="M66 14 L68 22 L76 24 L68 26 L66 34 L64 26 L56 24 L64 22 Z" fill={look.blush} />
      ) : null}

      {look.eyes === "glasses" ? (
        <>
          <circle cx="28" cy="38" r="9" fill="#fff" stroke={look.fg} strokeWidth="2.5" />
          <circle cx="52" cy="38" r="9" fill="#fff" stroke={look.fg} strokeWidth="2.5" />
          <line x1="37" y1="38" x2="43" y2="38" stroke={look.fg} strokeWidth="2.5" />
          <circle cx="28" cy="38" r="3" fill={look.fg} />
          <circle cx="52" cy="38" r="3" fill={look.fg} />
        </>
      ) : look.eyes === "wink" ? (
        <>
          <circle cx="28" cy="38" r="4.5" fill={look.fg} />
          <path d="M46 38 Q52 33 58 38" fill="none" stroke={look.fg} strokeWidth="3" strokeLinecap="round" />
        </>
      ) : look.eyes === "ovals" ? (
        <>
          <ellipse cx="28" cy="38" rx="5" ry="7" fill={look.fg} />
          <ellipse cx="52" cy="38" rx="5" ry="7" fill={look.fg} />
        </>
      ) : (
        <>
          <circle cx="28" cy="38" r="4.5" fill={look.fg} />
          <circle cx="52" cy="38" r="4.5" fill={look.fg} />
        </>
      )}

      <ellipse cx="22" cy="50" rx="6" ry="3.5" fill={look.blush} opacity="0.85" />
      <ellipse cx="58" cy="50" rx="6" ry="3.5" fill={look.blush} opacity="0.85" />

      {look.mouth === "grin" ? (
        <path d="M26 56 Q40 70 54 56" fill="none" stroke={look.fg} strokeWidth="3.2" strokeLinecap="round" />
      ) : look.mouth === "smirk" ? (
        <path d="M34 58 Q46 64 54 54" fill="none" stroke={look.fg} strokeWidth="3" strokeLinecap="round" />
      ) : look.mouth === "o" ? (
        <ellipse cx="40" cy="58" rx="5" ry="6" fill={look.fg} />
      ) : (
        <path d="M30 58 Q40 64 50 58" fill="none" stroke={look.fg} strokeWidth="3" strokeLinecap="round" />
      )}
      <title id={`${id}-title`}>{`@${handle}`}</title>
    </svg>
  );
}
