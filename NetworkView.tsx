import { useForge } from "@/lib/store";
import { Panel, ToggleRow } from "@/components/ui/row";
import { Progress } from "@/components/ui/progress";
import { Slider } from "@/components/ui/slider";

export function NetworkView() {
  const net = useForge((s) => s.network);
  const patch = useForge((s) => s.patchNetwork);
  const t = useForge((s) => s.telemetry);
  const energy = useForge((s) => s.energy);

  return (
    <div className="min-h-0 flex-1 space-y-4 overflow-y-auto px-4 pb-6 stagger-in">
      <header className="pt-2">
        <p className="font-mono text-[10px] tracking-[0.24em] text-primary uppercase">Link</p>
        <h1 className="mt-1 font-display text-[28px] leading-none font-semibold">Network booster</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Game-first queues, background lock, and Wi-Fi change protection — the Game Space net panel.
        </p>
      </header>

      <Panel className="p-4">
        <p className="font-mono text-[10px] uppercase tracking-wide text-muted-foreground">Live ping</p>
        <p className="mt-1 font-display text-4xl font-semibold tabular">{Math.round(t.ping)} ms</p>
        <Progress className="mt-3" value={Math.max(8, 100 - t.ping)} tone="ok" />
        <p className="mt-2 text-xs text-muted-foreground">
          Target {net.pingTarget} ms · {energy.wifiLowLatency ? "low-latency Wi-Fi on" : "low-latency off"}
        </p>
      </Panel>

      <Panel className="p-3">
        <ToggleRow
          label="Game first"
          hint="PUBG sockets jump the queue ahead of downloads and sync."
          checked={net.gameFirst}
          onCheckedChange={(v) => patch({ gameFirst: v })}
        />
        <ToggleRow
          label="Block background data"
          checked={net.blockBackground}
          onCheckedChange={(v) => patch({ blockBackground: v })}
        />
        <ToggleRow
          label="Network change protect"
          hint="Don't hop Wi-Fi ↔ LTE mid-circle."
          checked={net.changeProtect}
          onCheckedChange={(v) => patch({ changeProtect: v })}
        />
        <div className="py-2">
          <div className="mb-1.5 flex justify-between font-mono text-[10px] text-muted-foreground">
            <span>Ping target</span>
            <span className="text-foreground">{net.pingTarget} ms</span>
          </div>
          <Slider
            min={20}
            max={80}
            step={2}
            value={[net.pingTarget]}
            onValueChange={(v) => patch({ pingTarget: v[0] ?? 40 })}
          />
        </div>
      </Panel>
    </div>
  );
}
