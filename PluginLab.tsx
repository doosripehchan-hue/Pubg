import { useForge } from "@/lib/store";
import { PLUGIN_META, MACROS } from "@/lib/catalog";
import { Panel, ToggleRow } from "@/components/ui/row";
import { Badge } from "@/components/ui/badge";
import type { HuntFilter, Plugins } from "@/lib/types";

export function PluginLab() {
  const plugins = useForge((s) => s.plugins);
  const patch = useForge((s) => s.patchPlugins);

  return (
    <div className="min-h-0 flex-1 space-y-4 overflow-y-auto px-4 pb-6 stagger-in">
      <header className="pt-2">
        <p className="font-mono text-[10px] tracking-[0.24em] text-primary uppercase">Library</p>
        <h1 className="mt-1 font-display text-[28px] leading-none font-semibold">Plugins</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Red Magic’s full Game Space kit, filtered for PUBG Mobile on Note 10+.
        </p>
      </header>

      <Panel className="p-3">
        <p className="mb-2 text-sm font-medium">Hunt filter</p>
        <div className="grid grid-cols-4 gap-1">
          {(["off", "invert", "night", "focus"] as HuntFilter[]).map((h) => (
            <button
              key={h}
              type="button"
              onClick={() => patch({ hunt: h })}
              className={`rounded-md py-2 font-mono text-[10px] uppercase hairline ${
                plugins.hunt === h ? "bg-primary text-primary-foreground" : "bg-muted"
              }`}
            >
              {h}
            </button>
          ))}
        </div>
      </Panel>

      <Panel className="divide-y divide-border p-3">
        {PLUGIN_META.map((p) => {
          if (p.id === "hunt") return null;
          const key = p.id as keyof Plugins;
          const on = plugins[key];
          const checked = typeof on === "boolean" ? on : false;
          return (
            <ToggleRow
              key={p.id}
              label={p.name}
              hint={p.blurb}
              checked={checked}
              onCheckedChange={(v) => patch({ [key]: v } as Partial<Plugins>)}
              risk={p.risk}
            />
          );
        })}
      </Panel>

      <Panel className="p-3">
        <div className="mb-2 flex items-center justify-between">
          <p className="text-sm font-medium">Macros</p>
          <Badge tone={plugins.macros ? "accent" : "muted"}>
            {plugins.macros ? "bound to squeeze" : "off"}
          </Badge>
        </div>
        <ul className="space-y-2">
          {MACROS.map((m) => (
            <li key={m.id}>
              <p className="text-sm">{m.name}</p>
              <p className="font-mono text-[10px] text-muted-foreground">{m.steps}</p>
            </li>
          ))}
        </ul>
      </Panel>
    </div>
  );
}
