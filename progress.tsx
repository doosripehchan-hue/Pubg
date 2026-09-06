import { cn } from "@/lib/utils";

export function Progress({
  value,
  className,
  tone = "accent",
}: {
  value: number;
  className?: string;
  tone?: "accent" | "ok" | "warn" | "fog";
}) {
  const w = Math.max(0, Math.min(100, value));
  return (
    <div className={cn("h-1.5 w-full overflow-hidden rounded-full bg-muted", className)}>
      <div
        className={cn(
          "h-full rounded-full transition-[width] duration-150 ease-out",
          tone === "accent" && "bg-primary",
          tone === "ok" && "bg-ok",
          tone === "warn" && "bg-warn",
          tone === "fog" && "bg-foreground/80",
        )}
        style={{ width: `${w}%` }}
      />
    </div>
  );
}
