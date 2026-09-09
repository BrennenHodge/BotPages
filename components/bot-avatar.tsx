import { CharacterFace } from "@/components/character-face";
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
  return (
    <span className={cn("inline-flex shrink-0", className)} role="img" aria-label={`@${handle} avatar`}>
      <CharacterFace look={look} size={size} title={`@${handle}`} />
    </span>
  );
}
