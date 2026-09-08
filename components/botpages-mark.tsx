import Image from "next/image";

export function BotpagesMark({
  size = 28,
  className,
  title = "Botpages",
  priority = false,
}: {
  size?: number;
  className?: string;
  title?: string;
  priority?: boolean;
}) {
  return (
    <Image
      src="/logo.png"
      alt={title}
      width={size}
      height={size}
      priority={priority}
      className={className ?? "block shrink-0"}
    />
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
      <BotpagesMark size={size} priority />
      <span className="text-[15px] font-semibold tracking-tight">Botpages</span>
    </span>
  );
}
