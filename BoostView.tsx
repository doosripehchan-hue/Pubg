import { useForge } from "@/lib/store";
import { PERF_MODES, DEVICE } from "@/lib/catalog";
import { Panel, ToggleRow } from "@/components/ui/row";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import type { PerfMode } from "@/lib/types";

export function BoostView() {
  const energy = useForge((s) => s.energy);
  const patch = useForge((s) => s.patchEnergy);
  const runBoost = useForge((s) => s.runBoost);
  const boosting = useForge((s) => s.boosting);
  const t = useForge((s) => s.telemetry);
  const brightness = useForge((s) => s.brightness);
  const setBrightness = useForge((s) => s.setBrightness);

  return (
    <div className="min-h-0 flex-1 space-y-4 overflow-y-auto px-4 pb-6 stagger-in">
      <header className="pt-2">
        <p className="font-mono text-[10px] tracking-[0.24em] text-primary uppercase">Energy Cube</p>
        <h1 className="mt-1 font-display text-[28px] leading-none font-semibold">Performance</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Eco · Balance · Rise · Diablo on {DEVICE.chipset}. No fan — {DEVICE.cooling.toLowerCase()} is the
          cooler.
        </p>
      </header>

      <div className="grid grid-cols-2 gap-2">
        {PERF_MODES.map((m) => (
          <button
            key={m.id}
            type="button"
            onClick={() => patch({ mode: m.id })}
            className={`rounded-xl p-3 text-left hairline ${
              energy.mode === m.id ? "bg-primary text-primary-foreground" : "bg-card"
            }`}
          >
            <p className="font-display text-lg font-semibold">{m.name}</p>
            <p className={`mt-1 text-xs leading-snug ${energy.mode === m.id ? "text-primary-foreground/80" : "text-muted-foreground"}`}>
              {m.blurb}
            </p>
          </button>
        ))}
      </div>

      <Button className="w-full" onClick={runBoost} disabled={boosting}>
        {boosting ? "Clearing RAM…" : `Free RAM · ${t.ramUsed.toFixed(1)} GB in use`}
      </Button>

      <Panel className="p-3">
        <p className="mb-1 text-sm font-medium">Touch & aim</p>
        <ToggleRow
          label="Ultra sampling"
          hint="Poll at 240 Hz. Native panel is 60 Hz / 120 Hz touch."
          checked={energy.touchSample === "ultra"}
          onCheckedChange={(v) => patch({ touchSample: v ? "ultra" : "high" })}
        />
        <Slide label="Sensitivity" value={energy.sensitivity} min={-2} max={2} onChange={(v) => patch({ sensitivity: v })} />
        <Slide label="Smoothness" value={energy.smoothness} min={-2} max={2} onChange={(v) => patch({ smoothness: v })} />
        <Slide
          label="Stabilization"
          value={energy.stabilization}
          min={-2}
          max={2}
          onChange={(v) => patch({ stabilization: v })}
        />
        <p className="mt-3 font-mono text-[10px] uppercase tracking-wide text-muted-foreground">
          Edge mistouch
        </p>
        <div className="mt-1 grid grid-cols-4 gap-1">
          {(["off", "small", "medium", "broad"] as const).map((e) => (
            <button
              key={e}
              type="button"
              onClick={() => patch({ edgeProtect: e })}
              className={`rounded-md py-2 font-mono text-[10px] uppercase hairline ${
                energy.edgeProtect === e ? "bg-primary text-primary-foreground" : "bg-muted"
              }`}
            >
              {e}
            </button>
          ))}
        </div>
      </Panel>

      <Panel className="p-3">
        <p className="mb-1 text-sm font-medium">GPU</p>
        <ToggleRow label="MSAA" checked={energy.msaa} onCheckedChange={(v) => patch({ msaa: v })} />
        <ToggleRow
          label="Anisotropic"
          checked={energy.anisotropic}
          onCheckedChange={(v) => patch({ anisotropic: v })}
        />
        <ToggleRow label="Auto VRS" checked={energy.autoVrs} onCheckedChange={(v) => patch({ autoVrs: v })} />
        <Slide label="Mip LOD" value={energy.mipLod} min={-2} max={2} onChange={(v) => patch({ mipLod: v })} />
        <ToggleRow
          label="Superior pic quality"
          hint="Sharper buffers. Extra heat on 855."
          checked={energy.mode === "diablo"}
          onCheckedChange={(v) => patch({ mode: v ? "diablo" : "rise" })}
        />
      </Panel>

      <Panel className="p-3">
        <p className="mb-1 text-sm font-medium">Panel</p>
        <ToggleRow
          label="Lock brightness"
          checked={energy.lockBrightness}
          onCheckedChange={(v) => patch({ lockBrightness: v })}
        />
        <ToggleRow
          label="Enhanced color"
          checked={energy.enhancedColor}
          onCheckedChange={(v) => patch({ enhancedColor: v })}
        />
        <ToggleRow
          label="Screen energy save"
          checked={energy.screenSave}
          onCheckedChange={(v) => patch({ screenSave: v })}
        />
        <Slide label="Brightness" value={brightness} min={20} max={100} onChange={setBrightness} />
      </Panel>

      <Panel className="p-3">
        <ToggleRow
          label="Vapor chamber boost"
          hint="Keeps the 855 in Rise longer. No fake fan curve."
          checked={energy.vaporBoost}
          onCheckedChange={(v) => patch({ vaporBoost: v })}
        />
        <ToggleRow
          label="Wi-Fi low latency"
          checked={energy.wifiLowLatency}
          onCheckedChange={(v) => patch({ wifiLowLatency: v })}
        />
      </Panel>
    </div>
  );
}

function Slide({
  label,
  value,
  min,
  max,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  onChange: (v: number) => void;
}) {
  return (
    <div className="py-2">
      <div className="mb-1.5 flex justify-between font-mono text-[10px] text-muted-foreground">
        <span>{label}</span>
        <span className="tabular text-foreground">{value}</span>
      </div>
      <Slider min={min} max={max} step={1} value={[value]} onValueChange={(v) => onChange(v[0] ?? 0)} />
    </div>
  );
}
