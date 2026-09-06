import { useForge } from "@/lib/store";
import { GAMES } from "@/lib/catalog";
import { Badge } from "@/components/ui/badge";

export function LibraryView() {
  const setView = useForge((s) => s.setView);
  return (
    <div className="min-h-0 flex-1 space-y-4 overflow-y-auto px-4 pb-6 stagger-in">
      <header className="pt-2">
        <p className="font-mono text-[10px] tracking-[0.24em] text-primary uppercase">Shelf</p>
        <h1 className="mt-1 font-display text-[28px] leading-none font-semibold">Games</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Auto-detected titles. Only PUBG Mobile ships a full trigger + plugin profile in this build.
        </p>
      </header>
      <div className="space-y-2">
        {GAMES.map((g) => (
          <button
            key={g.id}
            type="button"
            onClick={() => {
              if (g.id === "pubg") setView("pubg");
              else if (g.id === "range") setView("session");
            }}
            className="w-full rounded-xl bg-card p-4 text-left hairline"
          >
            <div className="flex items-center justify-between">
              <p className="font-medium">{g.title}</p>
              {g.featured && <Badge tone="accent">Main</Badge>}
            </div>
            <p className="mt-1 text-xs text-muted-foreground">{g.note}</p>
            <p className="mt-2 font-mono text-[10px] text-muted-foreground">
              {g.hours}h · {g.ping} ms · {g.preset}
            </p>
          </button>
        ))}
      </div>
    </div>
  );
}
