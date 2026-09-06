import { AlertTriangle, Play, Target } from "lucide-react";
import { useForge } from "@/lib/store";
import { ACTION_LABEL, DEVICE } from "@/lib/catalog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Panel, ToggleRow } from "@/components/ui/row";

export function PubgProfile() {
  const setView = useForge((s) => s.setView);
  const energy = useForge((s) => s.energy);
  const patchEnergy = useForge((s) => s.patchEnergy);
  const ai = useForge((s) => s.ai);
  const patchAi = useForge((s) => s.patchAi);
  const triggers = useForge((s) => s.triggers);
  const plugins = useForge((s) => s.plugins);

  return (
    <div className="min-h-0 flex-1 space-y-4 overflow-y-auto px-4 pb-6 stagger-in">
      <header className="pt-2">
        <p className="font-mono text-[10px] tracking-[0.24em] text-primary uppercase">Title profile</p>
        <h1 className="mt-1 font-display text-[28px] leading-none font-semibold">PUBG Mobile</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Tuned for {DEVICE.name}. 60 Hz panel, 240 Hz software touch, vapor chamber, S Pen as a third
          trigger.
        </p>
      </header>

      <Button className="h-12 w-full" onClick={() => setView("session")}>
        <Play className="size-4" />
        Drop into training range
      </Button>

      <Panel className="p-3">
        <div className="flex items-start gap-2">
          <AlertTriangle className="mt-0.5 size-4 shrink-0 text-warn" />
          <p className="text-xs leading-relaxed text-muted-foreground">
            Forge Space cannot inject into the PUBG client from the browser. Train the claw, triggers, and
            AI habits here. Rapid fire, auto-fire, and macros can get a real account banned in ranked.
          </p>
        </div>
      </Panel>

      <Panel className="p-4">
        <p className="font-mono text-[10px] uppercase tracking-wide text-muted-foreground">Recommended</p>
        <ul className="mt-2 space-y-1.5 text-sm">
          <li>Graphics Smooth · Frame rate Ultra (60)</li>
          <li>Style Classic · Color Vibrant via Enhanced Color</li>
          <li>4-finger + gyro + L1 ADS / R1 fire</li>
          <li>Aim assist on · Peek & fire on</li>
        </ul>
        <div className="mt-3 flex flex-wrap gap-1.5">
          <Badge tone="accent">{energy.mode}</Badge>
          <Badge>{energy.touchSample} touch</Badge>
          <Badge>{energy.wifiLowLatency ? "low-lat Wi-Fi" : "stock net"}</Badge>
        </div>
      </Panel>

      <Panel className="p-3">
        <p className="mb-1 text-sm font-medium">Shoulder map</p>
        {triggers.map((t) => (
          <div key={t.id} className="flex items-center justify-between py-2">
            <div>
              <p className="text-sm">{t.id === "SPEN" ? "S Pen" : t.id}</p>
              <p className="font-mono text-[10px] text-muted-foreground">
                {t.mode} · {ACTION_LABEL[t.action]}
                {t.mode === "dual" || t.mode === "binary" ? ` / ${ACTION_LABEL[t.action2]}` : ""}
              </p>
            </div>
            <Badge tone={t.enabled ? "ok" : "muted"}>{t.enabled ? "on" : "off"}</Badge>
          </div>
        ))}
        <Button variant="outline" className="mt-1 w-full" size="sm" onClick={() => setView("triggers")}>
          <Target className="size-3.5" />
          Open trigger studio
        </Button>
      </Panel>

      <Panel className="p-3">
        <p className="mb-1 text-sm font-medium">AI Smart Trigger</p>
        <ToggleRow
          label="Master"
          hint="Context detector on the training range."
          checked={ai.enabled}
          onCheckedChange={(v) => patchAi({ enabled: v })}
        />
        <ToggleRow
          label="Auto-reload"
          hint="Fires when the mag hits 0 — the original Red Magic AI Trigger."
          checked={ai.autoReload}
          onCheckedChange={(v) => patchAi({ autoReload: v })}
        />
        <ToggleRow
          label="Auto-loot"
          checked={ai.autoLoot}
          onCheckedChange={(v) => patchAi({ autoLoot: v })}
        />
        <ToggleRow
          label="Auto-heal"
          hint="First-aid when HP drops under 38."
          checked={ai.autoHeal}
          onCheckedChange={(v) => patchAi({ autoHeal: v })}
        />
        <ToggleRow
          label="Auto-fire on lock"
          hint="Only while a target sits in the reticle. Ranked risk."
          checked={ai.autoFire}
          onCheckedChange={(v) => patchAi({ autoFire: v })}
          risk="high"
        />
      </Panel>

      <Panel className="p-3">
        <p className="mb-1 text-sm font-medium">PUBG plugins active</p>
        <p className="text-xs leading-relaxed text-muted-foreground">
          {[
            plugins.crosshair && "Crosshair",
            plugins.audioProbe && "Sound radar",
            plugins.auxiliaryLine && "Throw arc",
            plugins.stopwatch && "Zone clock",
            plugins.dataPanel && "CPS",
            plugins.winRate && "Win-rate",
            plugins.aiCoach && "Coach",
            plugins.highSensWheel && "High-sens wheel",
            plugins.vibrate4d && "4D vibrate",
          ]
            .filter(Boolean)
            .join(" · ") || "None"}
        </p>
        <Button variant="outline" className="mt-3 w-full" size="sm" onClick={() => setView("plugins")}>
          Plugin library
        </Button>
      </Panel>

      <Panel className="p-3">
        <p className="mb-2 text-sm font-medium">Clocks for this title</p>
        <div className="grid grid-cols-2 gap-2">
          {(["rise", "diablo", "balance", "eco"] as const).map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => patchEnergy({ mode: m })}
              className={`rounded-md py-2 font-mono text-[10px] uppercase tracking-wide hairline ${
                energy.mode === m ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
              }`}
            >
              {m}
            </button>
          ))}
        </div>
      </Panel>
    </div>
  );
}
