import { useForge } from "@/lib/store";
import { ACTION_LABEL } from "@/lib/catalog";
import { Panel, ToggleRow } from "@/components/ui/row";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import type { PubgAction, RapidCps, TriggerMode } from "@/lib/types";

const MODES: { id: TriggerMode; name: string; hint: string }[] = [
  { id: "tap", name: "Single tap", hint: "Press maps to one screen tap." },
  { id: "hold", name: "Long press", hint: "Hold ADS or lean for the full press." },
  { id: "rapid", name: "Rapid fire", hint: "3 / 5 / 10 CPS auto-clicker." },
  { id: "motion", name: "Motion", hint: "Trigger + gyro, like Red Magic motion sensing." },
  { id: "dual", name: "Dual op", hint: "One press hits two HUD points." },
  { id: "binary", name: "Press & lift", hint: "Down fires, release ADS — binary trigger." },
  { id: "macro", name: "Macro", hint: "Peek-fire combo on a single squeeze." },
  { id: "ai", name: "AI", hint: "Hands the press to Smart Trigger logic." },
];

const ACTIONS = Object.keys(ACTION_LABEL) as PubgAction[];

export function TriggerStudio() {
  const triggers = useForge((s) => s.triggers);
  const patch = useForge((s) => s.patchTrigger);
  const ai = useForge((s) => s.ai);
  const patchAi = useForge((s) => s.patchAi);
  const setView = useForge((s) => s.setView);

  return (
    <div className="min-h-0 flex-1 space-y-4 overflow-y-auto px-4 pb-6 stagger-in">
      <header className="pt-2">
        <p className="font-mono text-[10px] tracking-[0.24em] text-primary uppercase">Shoulders</p>
        <h1 className="mt-1 font-display text-[28px] leading-none font-semibold">AI Smart Trigger</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Note 10+ has no capacitive shoulders. Forge paints L1 / R1 on the long edges and maps the S Pen
          button as a third trigger.
        </p>
      </header>

      <div className="relative mx-auto h-52 w-28 rounded-[1.6rem] bg-card hairline">
        {triggers.map((t) => {
          const side = t.id === "R1" ? "right-0" : t.id === "L1" ? "left-0" : "right-2";
          return (
            <div
              key={t.id}
              className={`absolute w-2 rounded-sm ${t.enabled ? "bg-primary" : "bg-muted-foreground/40"} ${side}`}
              style={{ top: `${t.along}%`, height: `${Math.max(18, t.size * 0.55)}px` }}
            />
          );
        })}
        <p className="absolute inset-0 flex items-center justify-center font-mono text-[9px] tracking-widest text-muted-foreground">
          NOTE 10+
        </p>
      </div>

      {triggers.map((t) => (
        <Panel key={t.id} className="p-3">
          <div className="mb-1 flex items-center justify-between">
            <p className="font-medium">
              {t.id} · {t.label}
            </p>
            <Badge tone={t.enabled ? "ok" : "muted"}>{t.enabled ? "live" : "off"}</Badge>
          </div>
          <ToggleRow label="Enabled" checked={t.enabled} onCheckedChange={(v) => patch(t.id, { enabled: v })} />
          <p className="mt-1 mb-2 font-mono text-[10px] uppercase tracking-wide text-muted-foreground">Mode</p>
          <div className="grid grid-cols-2 gap-1.5">
            {MODES.map((m) => (
              <button
                key={m.id}
                type="button"
                onClick={() => patch(t.id, { mode: m.id })}
                className={`rounded-md px-2 py-2 text-left hairline ${
                  t.mode === m.id ? "bg-primary text-primary-foreground" : "bg-muted"
                }`}
              >
                <p className="text-xs font-medium">{m.name}</p>
              </button>
            ))}
          </div>
          <label className="mt-3 block text-xs text-muted-foreground">
            Action
            <select
              className="mt-1 h-10 w-full rounded-md bg-muted px-2 text-sm text-foreground"
              value={t.action}
              onChange={(e) => patch(t.id, { action: e.target.value as PubgAction })}
            >
              {ACTIONS.map((a) => (
                <option key={a} value={a}>
                  {ACTION_LABEL[a]}
                </option>
              ))}
            </select>
          </label>
          {(t.mode === "dual" || t.mode === "binary") && (
            <label className="mt-2 block text-xs text-muted-foreground">
              Second action
              <select
                className="mt-1 h-10 w-full rounded-md bg-muted px-2 text-sm text-foreground"
                value={t.action2}
                onChange={(e) => patch(t.id, { action2: e.target.value as PubgAction })}
              >
                {ACTIONS.map((a) => (
                  <option key={a} value={a}>
                    {ACTION_LABEL[a]}
                  </option>
                ))}
              </select>
            </label>
          )}
          {t.mode === "rapid" && (
            <div className="mt-3 flex gap-1">
              {([3, 5, 10] as RapidCps[]).map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => patch(t.id, { rapidCps: c })}
                  className={`flex-1 rounded-md py-2 font-mono text-xs hairline ${
                    t.rapidCps === c ? "bg-primary text-primary-foreground" : "bg-muted"
                  }`}
                >
                  {c} CPS
                </button>
              ))}
            </div>
          )}
          <div className="mt-3">
            <div className="mb-1 flex justify-between font-mono text-[10px] text-muted-foreground">
              <span>Position</span>
              <span>{t.along}%</span>
            </div>
            <Slider min={12} max={78} value={[t.along]} onValueChange={(v) => patch(t.id, { along: v[0] ?? 38 })} />
          </div>
          <div className="mt-3">
            <div className="mb-1 flex justify-between font-mono text-[10px] text-muted-foreground">
              <span>Size</span>
              <span>{t.size}</span>
            </div>
            <Slider min={28} max={72} value={[t.size]} onValueChange={(v) => patch(t.id, { size: v[0] ?? 46 })} />
          </div>
          <ToggleRow
            label="Haptic"
            checked={t.haptic}
            onCheckedChange={(v) => patch(t.id, { haptic: v })}
          />
        </Panel>
      ))}

      <Panel className="p-3">
        <p className="mb-1 text-sm font-medium">AI detector</p>
        <ToggleRow
          label="Context assist"
          checked={ai.enabled}
          onCheckedChange={(v) => patchAi({ enabled: v })}
        />
        <div className="mt-2 grid grid-cols-3 gap-1">
          {(["context", "image", "color"] as const).map((d) => (
            <button
              key={d}
              type="button"
              onClick={() => patchAi({ detectMode: d })}
              className={`rounded-md py-2 font-mono text-[10px] uppercase hairline ${
                ai.detectMode === d ? "bg-primary text-primary-foreground" : "bg-muted"
              }`}
            >
              {d}
            </button>
          ))}
        </div>
        <p className="mt-2 text-xs text-muted-foreground">
          Image / color modes match Red Magic’s “recognize then tap.” On Note 10+ they run against the
          training range buffer, not the PUBG process.
        </p>
      </Panel>

      <button type="button" className="text-xs text-primary" onClick={() => setView("session")}>
        Calibrate in the range →
      </button>
    </div>
  );
}
