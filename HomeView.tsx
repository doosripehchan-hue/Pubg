import { Activity, Cpu, Flame, MemoryStick, Radio, Zap } from "lucide-react";
import { useForge } from "@/lib/store";
import { DEVICE, GAMES } from "@/lib/catalog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Panel, ToggleRow } from "@/components/ui/row";
import { Progress } from "@/components/ui/progress";
import { Switch } from "@/components/ui/switch";

export function HomeView() {
  const t = useForge((s) => s.telemetry);
  const armed = useForge((s) => s.armed);
  const setArmed = useForge((s) => s.setArmed);
  const boosting = useForge((s) => s.boosting);
  const runBoost = useForge((s) => s.runBoost);
  const setView = useForge((s) => s.setView);
  const energy = useForge((s) => s.energy);
  const disturb = useForge((s) => s.disturb);
  const patchDisturb = useForge((s) => s.patchDisturb);

  const ramPct = (t.ramUsed / t.ramTotal) * 100;

  return (
    <div className="min-h-0 flex-1 space-y-4 overflow-y-auto px-4 pb-6 stagger-in">
      <header className="pt-2">
        <p className="font-mono text-[10px] tracking-[0.28em] text-primary uppercase">Game Space</p>
        <h1 className="mt-1 font-display text-[28px] leading-none font-semibold tracking-tight">
          FORGE SPACE
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {DEVICE.name} · {DEVICE.chipset} · {DEVICE.ramGb} GB · {DEVICE.cooling}
        </p>
      </header>

      <Panel className="p-4">
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0">
            <p className="font-mono text-[10px] uppercase tracking-wide text-muted-foreground">Game Key</p>
            <p className="mt-1 font-display text-xl font-semibold">{armed ? "Armed" : "Standby"}</p>
            <p className="mt-1 text-xs text-muted-foreground">
              Arms DND, edge triggers, and Rise clocks — the competitive key.
            </p>
          </div>
          <Switch checked={armed} onCheckedChange={setArmed} aria-label="Game Key" />
        </div>
      </Panel>

      <div className="grid grid-cols-2 gap-2">
        <Stat icon={Cpu} label="CPU" value={`${Math.round(t.cpu)}%`} bar={t.cpu} />
        <Stat icon={Activity} label="GPU" value={`${Math.round(t.gpu)}%`} bar={t.gpu} />
        <Stat
          icon={MemoryStick}
          label="RAM"
          value={`${t.ramUsed.toFixed(1)} / ${t.ramTotal}`}
          bar={ramPct}
        />
        <Stat
          icon={Flame}
          label="Thermal"
          value={`${t.temp.toFixed(1)}°`}
          bar={Math.min(100, (t.temp - 30) * 5)}
          warn={t.temp > 48}
        />
      </div>

      <Button className="h-12 w-full" onClick={runBoost} disabled={boosting}>
        <Zap className="size-4" />
        {boosting ? "Purging background…" : "Boost now"}
      </Button>

      <button
        type="button"
        onClick={() => setView("pubg")}
        className="w-full rounded-xl bg-card p-4 text-left hairline"
      >
        <div className="flex items-center justify-between">
          <Badge tone="accent">Featured</Badge>
          <span className="font-mono text-[10px] text-muted-foreground">{energy.mode.toUpperCase()}</span>
        </div>
        <h2 className="mt-3 font-display text-2xl font-semibold">PUBG Mobile</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Smooth + Ultra · 4-finger claw · AI Smart Trigger · Energy Cube
        </p>
        <p className="mt-3 font-mono text-xs text-primary">Open profile →</p>
      </button>

      <div className="grid grid-cols-2 gap-2">
        {GAMES.filter((g) => g.id !== "pubg")
          .slice(0, 4)
          .map((g) => (
            <button
              key={g.id}
              type="button"
              onClick={() => setView(g.id === "range" ? "session" : "library")}
              className="rounded-lg bg-card p-3 text-left hairline"
            >
              <p className="font-mono text-[10px] text-muted-foreground uppercase">{g.tag}</p>
              <p className="mt-1 text-sm font-medium">{g.title}</p>
            </button>
          ))}
      </div>

      <Panel className="p-3">
        <div className="mb-1 flex items-center gap-2">
          <Radio className="size-3.5 text-primary" />
          <p className="text-sm font-medium">Match hygiene</p>
        </div>
        <ToggleRow
          label="Do not disturb"
          hint="Calls, heads-up, and Edge panels stay off while armed."
          checked={disturb.dnd}
          onCheckedChange={(v) => patchDisturb({ dnd: v })}
        />
        <ToggleRow
          label="Block calls"
          checked={disturb.blockCalls}
          onCheckedChange={(v) => patchDisturb({ blockCalls: v })}
        />
        <ToggleRow
          label="Hide status bar"
          checked={disturb.hideStatus}
          onCheckedChange={(v) => patchDisturb({ hideStatus: v })}
        />
      </Panel>

      <button
        type="button"
        onClick={() => setView("settings")}
        className="w-full text-left text-xs text-muted-foreground"
      >
        Network, screen, anti-mistouch, S Pen → Settings
      </button>
    </div>
  );
}

function Stat({
  icon: Icon,
  label,
  value,
  bar,
  warn,
}: {
  icon: typeof Cpu;
  label: string;
  value: string;
  bar: number;
  warn?: boolean;
}) {
  return (
    <div className="rounded-lg bg-card p-3 hairline">
      <div className="flex items-center gap-1.5 text-muted-foreground">
        <Icon className="size-3.5" />
        <span className="font-mono text-[10px] uppercase tracking-wide">{label}</span>
      </div>
      <p className="mt-2 font-display text-xl font-semibold tabular">{value}</p>
      <Progress className="mt-2" value={bar} tone={warn ? "warn" : "fog"} />
    </div>
  );
}
