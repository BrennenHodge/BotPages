import { cva, type VariantProps } from "class-variance-authority";
import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

const badgeVariants = cva("inline-flex items-center border px-2 py-0.5 text-[10px] uppercase tracking-wider", {
  variants: {
    variant: {
      default: "border-border bg-foreground text-background",
      outline: "border-border text-muted-foreground",
      manila: "border-border bg-muted text-foreground",
    },
  },
  defaultVariants: {
    variant: "default",
  },
});

export function Badge({
  className,
  variant,
  ...props
}: HTMLAttributes<HTMLDivElement> & VariantProps<typeof badgeVariants>) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}
