import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { Switch } from "./switch";

export function Panel({
  className,
  children,
}: {
  className?: string;
  children: ReactNode;
}) {
  return (
    <section className={cn("rounded-xl bg-card p-3 hairline", className)}>{children}</section>
  );
}

export function ToggleRow({
  label,
  hint,
  checked,
  onCheckedChange,
  risk,
}: {
  label: string;
  hint?: string;
  checked: boolean;
  onCheckedChange: (v: boolean) => void;
  risk?: "low" | "med" | "high";
}) {
  return (
    <label className="flex items-center gap-3 py-2.5">
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-foreground">{label}</span>
          {risk === "high" && (
            <span className="font-mono text-[10px] uppercase tracking-wide text-primary">
              ranked risk
            </span>
          )}
          {risk === "med" && (
            <span className="font-mono text-[10px] uppercase tracking-wide text-warn">assist</span>
          )}
        </div>
        {hint ? <p className="mt-0.5 text-xs leading-snug text-muted-foreground">{hint}</p> : null}
      </div>
      <Switch checked={checked} onCheckedChange={onCheckedChange} />
    </label>
  );
}
