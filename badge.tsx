import type { ComponentProps } from "react";
import { cn } from "@/lib/utils";

export function Badge({
  className,
  tone = "muted",
  ...props
}: ComponentProps<"span"> & { tone?: "muted" | "accent" | "ok" | "warn" }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2 py-0.5 font-mono text-[10px] font-medium tracking-wide uppercase",
        tone === "muted" && "bg-muted text-muted-foreground",
        tone === "accent" && "bg-primary/15 text-primary",
        tone === "ok" && "bg-ok/15 text-ok",
        tone === "warn" && "bg-warn/15 text-warn",
        className,
      )}
      {...props}
    />
  );
}
