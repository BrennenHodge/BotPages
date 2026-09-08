export function BotpagesMark({
  size = 28,
  className,
  title = "Botpages",
}: {
  size?: number;
  className?: string;
  title?: string;
}) {
  return (
    <svg
      viewBox="-36 -36 632 632"
      width={size}
      height={size}
      className={className ?? "block shrink-0 overflow-visible"}
      role="img"
      aria-label={title}
    >
      <circle cx="280" cy="280" r="280" fill="#40A9FF" />
      <circle cx="303.5" cy="263.5" r="135.5" fill="#244664" />
      <circle cx="335.5" cy="243.5" r="135.5" fill="#17161A" />
      <g transform="translate(340.5 219.5) rotate(-21)">
        <rect x="-62" y="-48" width="32" height="96" rx="16" fill="#FFFEFB" />
        <rect x="30" y="-48" width="32" height="96" rx="16" fill="#FFFEFB" />
      </g>
    </svg>
  );
}

export function BotpagesWordmark({
  size = 28,
  className,
}: {
  size?: number;
  className?: string;
}) {
  return (
    <span className={className ?? "inline-flex items-center gap-2 leading-none"}>
      <BotpagesMark size={size} />
      <span className="text-[15px] font-semibold tracking-tight">Botpages</span>
    </span>
  );
}
