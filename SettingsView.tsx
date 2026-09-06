import { useForge } from "@/lib/store";
import { DEVICE } from "@/lib/catalog";
import { Panel, ToggleRow } from "@/components/ui/row";
import { Button } from "@/components/ui/button";

export function SettingsView() {
  const disturb = useForge((s) => s.disturb);
  const patchDisturb = useForge((s) => s.patchDisturb);
  const watermark = useForge((s) => s.watermark);
  const setWatermark = useForge((s) => s.setWatermark);
  const wellbeing = useForge((s) => s.wellbeing);
  const setWellbeing = useForge((s) => s.setWellbeing);
  const energy = useForge((s) => s.energy);
  const patchEnergy = useForge((s) => s.patchEnergy);
  const rotationLock = useForge((s) => s.plugins.rotationLock);
  const patchPlugins = useForge((s) => s.patchPlugins);
  const setView = useForge((s) => s.setView);

  return (
    <div className="min-h-0 flex-1 space-y-4 overflow-y-auto px-4 pb-6 stagger-in">
      <header className="pt-2">
        <p className="font-mono text-[10px] tracking-[0.24em] text-primary uppercase">System</p>
        <h1 className="mt-1 font-display text-[28px] leading-none font-semibold">Game Space</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {DEVICE.model} · {DEVICE.display} · {DEVICE.resolution} · {DEVICE.battery} · {DEVICE.spen}
        </p>
      </header>

      <Panel className="p-3">
        <p className="mb-1 text-sm font-medium">Anti-disturbance</p>
        <ToggleRow label="Do not disturb" checked={disturb.dnd} onCheckedChange={(v) => patchDisturb({ dnd: v })} />
        <ToggleRow
          label="Barrage messages"
          hint="Toasts become a thin ticker instead of banners."
          checked={disturb.barrage}
          onCheckedChange={(v) => patchDisturb({ barrage: v })}
        />
        <ToggleRow
          label="Block calls"
          checked={disturb.blockCalls}
          onCheckedChange={(v) => patchDisturb({ blockCalls: v })}
        />
        <ToggleRow
          label="Rotation lock"
          checked={rotationLock}
          onCheckedChange={(v) => patchPlugins({ rotationLock: v })}
        />
      </Panel>

      <Panel className="p-3">
        <p className="mb-1 text-sm font-medium">Anti-mistouch</p>
        <ToggleRow
          label="Hide status bar"
          checked={disturb.hideStatus}
          onCheckedChange={(v) => patchDisturb({ hideStatus: v })}
        />
        <ToggleRow
          label="Disable 3-finger gesture"
          checked={disturb.noThreeFinger}
          onCheckedChange={(v) => patchDisturb({ noThreeFinger: v })}
        />
        <ToggleRow
          label="Gesture confirmation"
          hint="Swipe twice for panels — Red Magic false-touch prevention."
          checked={disturb.falseTouchConfirm}
          onCheckedChange={(v) => patchDisturb({ falseTouchConfirm: v })}
        />
        <ToggleRow
          label="Block full-screen gestures"
          checked={disturb.fullScreenGesturesOff}
          onCheckedChange={(v) => patchDisturb({ fullScreenGesturesOff: v })}
        />
      </Panel>

      <Panel className="p-3">
        <p className="mb-1 text-sm font-medium">Capture</p>
        <ToggleRow label="Forge watermark" checked={watermark} onCheckedChange={setWatermark} />
        <ToggleRow
          label="1080p recording"
          checked={energy.recordQuality === "1080"}
          onCheckedChange={(v) => patchEnergy({ recordQuality: v ? "1080" : "720" })}
        />
        <ToggleRow
          label="Digital wellbeing ping"
          hint="Hourly break nudge."
          checked={wellbeing}
          onCheckedChange={setWellbeing}
        />
      </Panel>

      <Panel className="p-3">
        <p className="text-sm font-medium">Peripherals</p>
        <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
          X Gravity maps a keyboard, mouse, or pad onto the PUBG HUD. Host mode can throw the range to a
          monitor. S Pen is already a trigger in the studio.
        </p>
      </Panel>

      <div className="flex gap-2">
        <Button variant="outline" className="flex-1" size="sm" onClick={() => setView("network")}>
          Network
        </Button>
        <Button variant="outline" className="flex-1" size="sm" onClick={() => setView("library")}>
          Library
        </Button>
      </div>
    </div>
  );
}
