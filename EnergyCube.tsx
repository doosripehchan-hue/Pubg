import { X } from "lucide-react";
import { useForge } from "@/lib/store";
import { PERF_MODES } from "@/lib/catalog";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { ToggleRow, Panel } from "@/components/ui/row";
import type { PerfMode } from "@/lib/types";

export function EnergyCube({ onClose }: { onClose: () => void }) {
  const energy = useForge((s) => s.energy);
  const patch = useForge((s) => s.patchEnergy);
  const telemetry = useForge((s) => s.telemetry);

  return (
    <div className="absolute inset-y-0 left-0 z-30 flex w-[min(100%,320px)] flex-col bg-card/95 hairline">
      <div className="flex items-center justify-between px-3 py-3">
        <div>
          <p className="font-mono text-[10px] tracking-[0.2em] text-primary uppercase">Energy Cube</p>
          <p className="font-display text-lg font-semibold">In-match overlay</p>
        </div>
        <Button size="icon" variant="ghost" onClick={onClose} aria-label="Close">
          <X />
        </Button>
      </div>
      <div className="min-h-0 flex-1 space-y-3 overflow-y-auto px-3 pb-4">
        <div className="grid grid-cols-4 gap-1">
          {PERF_MODES.map((m) => (
            <button
              key={m.id}
              type="button"
              onClick={() => patch({ mode: m.id as PerfMode })}
              className={`rounded-md py-2 font-mono text-[10px] uppercase tracking-wide hairline ${
                energy.mode === m.id ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
              }`}
            >
              {m.name}
            </button>
          ))}
        </div>
        <Panel>
          <p className="font-mono text-[10px] uppercase tracking-wide text-muted-foreground">Live</p>
          <p className="mt-1 font-mono text-xs tabular text-foreground">
            {Math.round(telemetry.cpu)}% CPU · {Math.round(telemetry.gpu)}% GPU · {telemetry.temp.toFixed(1)}°
          </p>
        </Panel>
        <Panel>
          <p className="mb-2 text-xs font-medium">Touch</p>
          <ToggleRow
            label="Ultra sampling"
            hint="240 Hz software poll on Note 10+ 120 Hz panel"
            checked={energy.touchSample === "ultra"}
            onCheckedChange={(v) => patch({ touchSample: v ? "ultra" : "high" })}
          />
          <Field label="Sensitivity" value={energy.sensitivity} min={-2} max={2} onChange={(v) => patch({ sensitivity: v })} />
          <Field label="Smoothness" value={energy.smoothness} min={-2} max={2} onChange={(v) => patch({ smoothness: v })} />
          <Field
            label="Stabilization"
            value={energy.stabilization}
            min={-2}
            max={2}
            onChange={(v) => patch({ stabilization: v })}
          />
        </Panel>
        <Panel>
          <ToggleRow
            label="Wi-Fi low latency"
            checked={energy.wifiLowLatency}
            onCheckedChange={(v) => patch({ wifiLowLatency: v })}
          />
          <ToggleRow
            label="Vapor chamber boost"
            checked={energy.vaporBoost}
            onCheckedChange={(v) => patch({ vaporBoost: v })}
          />
          <ToggleRow
            label="MSAA"
            hint="Heavy on 855"
            checked={energy.msaa}
            onCheckedChange={(v) => patch({ msaa: v })}
          />
          <ToggleRow
            label="Anisotropic filter"
            checked={energy.anisotropic}
            onCheckedChange={(v) => patch({ anisotropic: v })}
          />
          <ToggleRow
            label="Auto VRS"
            checked={energy.autoVrs}
            onCheckedChange={(v) => patch({ autoVrs: v })}
          />
        </Panel>
      </div>
    </div>
  );
}

function Field({
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
