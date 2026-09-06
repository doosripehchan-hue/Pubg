import { useEffect, useRef, useState } from "react";
import { Crosshair, Gauge, Pause, Play, RotateCcw, X, Zap } from "lucide-react";
import { RangeEngine, type EngineInput } from "@/game/range-engine";
import { useForge } from "@/lib/store";
import { ACTION_LABEL } from "@/lib/catalog";
import { formatMs } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { EnergyCube } from "./EnergyCube";
import type { PubgAction, TriggerConfig } from "@/lib/types";

const emptyInput = (): EngineInput => ({
  moveX: 0,
  moveY: 0,
  aimX: 0,
  aimY: 0,
  fire: false,
  ads: false,
  jump: false,
  crouch: false,
  prone: false,
  reload: false,
  grenade: false,
  peekL: false,
  peekR: false,
  sprint: false,
  heal: false,
  loot: false,
  dt: 0,
});

export function BattleSession() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const engine = useRef(new RangeEngine());
  const keys = useRef(new Set<string>());
  const pointer = useRef({ x: 0, y: 0, down: false, rdown: false });
  const stick = useRef({ active: false, x: 0, y: 0, ox: 0, oy: 0, id: -1 });
  const pulse = useRef<Partial<Record<PubgAction, boolean>>>({});
  const sticky = useRef<Partial<Record<PubgAction, boolean>>>({});
  const edges = useRef<Record<string, boolean>>({ L1: false, R1: false, SPEN: false });
  const last = useRef(0);
  const frames = useRef(0);
  const fpsT = useRef(0);
  const fps = useRef(60);
  const lastHud = useRef(0);
  const [hud, setHud] = useState(() => engine.current.hud());
  const [paused, setPaused] = useState(false);
  const [cube, setCube] = useState(false);
  const [showHelp, setShowHelp] = useState(true);
  const setView = useForge((s) => s.setView);
  const energy = useForge((s) => s.energy);
  const plugins = useForge((s) => s.plugins);
  const ai = useForge((s) => s.ai);
  const triggers = useForge((s) => s.triggers);
  const tickTelemetry = useForge((s) => s.tickTelemetry);
  const setCoach = useForge((s) => s.setCoach);
  const disturb = useForge((s) => s.disturb);
  const watermark = useForge((s) => s.watermark);
  const telemetry = useForge((s) => s.telemetry);

  const applyAction = (action: PubgAction, down: boolean, mode: TriggerConfig["mode"]) => {
    if (mode === "hold" || mode === "rapid") {
      sticky.current[action] = down;
      return;
    }
    if (mode === "binary") {
      if (down) pulse.current.fire = true;
      else pulse.current.ads = true;
      return;
    }
    if (down) pulse.current[action] = true;
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent, down: boolean) => {
      if (e.repeat && down) return;
      if (down) keys.current.add(e.code);
      else keys.current.delete(e.code);
      if (e.code === "Space") e.preventDefault();
    };
    const kd = (e: KeyboardEvent) => onKey(e, true);
    const ku = (e: KeyboardEvent) => onKey(e, false);
    window.addEventListener("keydown", kd);
    window.addEventListener("keyup", ku);
    return () => {
      window.removeEventListener("keydown", kd);
      window.removeEventListener("keyup", ku);
    };
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    const wrap = wrapRef.current;
    if (!canvas || !wrap) return;
    let raf = 0;
    let alive = true;
    const loop = (t: number) => {
      if (!alive) return;
      const dt = last.current ? Math.min(0.05, (t - last.current) / 1000) : 0.016;
      last.current = t;
      frames.current += 1;
      fpsT.current += dt;
      if (fpsT.current >= 0.4) {
        fps.current = Math.round(frames.current / fpsT.current);
        frames.current = 0;
        fpsT.current = 0;
      }
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      const w = wrap.clientWidth;
      const h = wrap.clientHeight;
      if (canvas.width !== Math.floor(w * dpr) || canvas.height !== Math.floor(h * dpr)) {
        canvas.width = Math.floor(w * dpr);
        canvas.height = Math.floor(h * dpr);
        canvas.style.width = `${w}px`;
        canvas.style.height = `${h}px`;
      }
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        raf = requestAnimationFrame(loop);
        return;
      }
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      const eng = engine.current;
      const inp = emptyInput();
      inp.dt = paused || showHelp ? 0 : dt;

      const k = keys.current;
      let mx = 0;
      let my = 0;
      if (k.has("KeyA") || k.has("ArrowLeft")) mx -= 1;
      if (k.has("KeyD") || k.has("ArrowRight")) mx += 1;
      if (k.has("KeyW") || k.has("ArrowUp")) my -= 1;
      if (k.has("KeyS") || k.has("ArrowDown")) my += 1;
      if (stick.current.active) {
        mx = stick.current.x;
        my = stick.current.y;
      }
      inp.moveX = mx;
      inp.moveY = my;
      const world = eng.screenToWorld(
        pointer.current.x,
        pointer.current.y,
        w,
        h,
        eng.ads,
        plugins.scout,
      );
      inp.aimX = world.x;
      inp.aimY = world.y;

      const r1 = triggers.find((tr) => tr.id === "R1");
      const l1 = triggers.find((tr) => tr.id === "L1");
      const rapid = !!(r1?.enabled && r1.mode === "rapid" && edges.current.R1);

      inp.fire =
        pointer.current.down ||
        k.has("KeyF") ||
        !!pulse.current.fire ||
        !!sticky.current.fire ||
        !!(r1?.enabled && edges.current.R1 && r1.action === "fire");
      inp.ads =
        pointer.current.rdown ||
        k.has("KeyE") ||
        !!sticky.current.ads ||
        !!(l1?.enabled && edges.current.L1 && l1.action === "ads");
      inp.jump = k.has("Space") || !!pulse.current.jump;
      inp.crouch = k.has("KeyC") || !!pulse.current.crouch;
      inp.prone = k.has("KeyZ") || !!pulse.current.prone;
      inp.reload = k.has("KeyR") || !!pulse.current.reload;
      inp.grenade = k.has("KeyG") || !!pulse.current.grenade;
      inp.peekL = k.has("KeyQ") || !!sticky.current.peekL;
      inp.peekR = k.has("KeyX") || !!sticky.current.peekR;
      inp.heal = k.has("KeyH") || !!pulse.current.heal;
      inp.sprint = k.has("ShiftLeft") || !!sticky.current.sprint;

      if (!paused && !showHelp) {
        eng.update(inp, { ai, plugins, rapid, triggers });
      }
      eng.draw(
        ctx,
        w,
        h,
        plugins.hunt,
        plugins.scout,
        plugins.crosshair,
        plugins.audioProbe,
        plugins.auxiliaryLine,
      );

      if (t - lastHud.current > 100) {
        lastHud.current = t;
        const snap = eng.hud();
        snap.fps = fps.current;
        setHud(snap);
      }
      pulse.current = {};
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    const tel = window.setInterval(() => tickTelemetry(true, fps.current), 400);
    return () => {
      alive = false;
      cancelAnimationFrame(raf);
      window.clearInterval(tel);
    };
  }, [paused, showHelp, ai, plugins, triggers, tickTelemetry]);

  useEffect(() => {
    setCoach(hud.coach);
  }, [hud.coach, setCoach]);

  useEffect(() => {
    if (plugins.vibrate4d && hud.shake > 6 && navigator.vibrate) navigator.vibrate(12);
  }, [hud.shake, plugins.vibrate4d]);

  const onPointerMove = (e: React.PointerEvent) => {
    const rect = wrapRef.current?.getBoundingClientRect();
    if (!rect) return;
    pointer.current.x = e.clientX - rect.left;
    pointer.current.y = e.clientY - rect.top;
    if (stick.current.active && e.pointerId === stick.current.id) {
      const dx = e.clientX - stick.current.ox;
      const dy = e.clientY - stick.current.oy;
      const max = plugins.highSensWheel ? 36 : 52;
      const len = Math.hypot(dx, dy);
      const k = len > max ? max / len : 1;
      stick.current.x = (dx * k) / max;
      stick.current.y = (dy * k) / max;
    }
  };

  const fireEdge = (id: TriggerConfig["id"], down: boolean) => {
    const tr = triggers.find((x) => x.id === id);
    if (!tr?.enabled) return;
    edges.current[id] = down;
    if (tr.haptic && down && navigator.vibrate) navigator.vibrate(8);
    applyAction(tr.action, down, tr.mode);
    if (tr.mode === "dual" && down) applyAction(tr.action2, true, "tap");
    if (tr.mode === "macro" && down) {
      sticky.current.peekL = true;
      pulse.current.fire = true;
    }
    if (tr.mode === "macro" && !down) sticky.current.peekL = false;
  };

  return (
    <div className="relative flex h-full min-h-0 flex-1 flex-col bg-background">
      <div
        ref={wrapRef}
        className="relative min-h-0 flex-1 touch-none overflow-hidden"
        onPointerMove={onPointerMove}
        onPointerDown={(e) => {
          const rect = wrapRef.current?.getBoundingClientRect();
          if (!rect) return;
          pointer.current.x = e.clientX - rect.left;
          pointer.current.y = e.clientY - rect.top;
          const left = e.clientX - rect.left < rect.width * 0.38;
          if (left) {
            stick.current = {
              active: true,
              x: 0,
              y: 0,
              ox: e.clientX,
              oy: e.clientY,
              id: e.pointerId,
            };
            (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
          } else {
            pointer.current.down = true;
          }
        }}
        onPointerUp={(e) => {
          if (stick.current.id === e.pointerId) {
            stick.current.active = false;
            stick.current.x = 0;
            stick.current.y = 0;
          }
          pointer.current.down = false;
        }}
        onContextMenu={(e) => {
          e.preventDefault();
          pointer.current.rdown = !pointer.current.rdown;
        }}
      >
        <canvas ref={canvasRef} className="block h-full w-full" />

        {plugins.stopwatch && (
          <div className="pointer-events-none absolute top-3 left-1/2 z-10 -translate-x-1/2 text-center">
            <p className="font-mono text-[11px] text-foreground/80">
              Zone {formatMs(hud.zoneIn * 1000)} · Wave {hud.wave}
            </p>
            {plugins.aiCoach && (
              <p className="mt-1 max-w-[220px] text-[11px] text-foreground/75">{hud.coach}</p>
            )}
          </div>
        )}

        <div className="pointer-events-none absolute top-3 left-3 z-10 flex flex-col gap-1 font-mono text-[10px] text-muted-foreground">
          <span className="text-foreground">{hud.fps} FPS</span>
          {plugins.dataPanel && <span>{hud.cps} CPS</span>}
          <span>{Math.round(telemetry.temp)}°C</span>
          <span>{Math.round(telemetry.ping)} ms</span>
        </div>

        <div className="pointer-events-none absolute top-3 right-3 z-10 text-right">
          <p className="font-display text-lg leading-none font-semibold tabular">{hud.kills}</p>
          <p className="font-mono text-[10px] tracking-wide text-muted-foreground uppercase">kills</p>
          {plugins.winRate && (
            <p className="mt-1 font-mono text-[10px] text-ok">{Math.round(hud.winRate)}% WR</p>
          )}
          {hud.aiLock && ai.enabled && (
            <p className="mt-1 font-mono text-[10px] tracking-widest text-primary uppercase">AI lock</p>
          )}
        </div>

        <button
          type="button"
          className="absolute top-11 left-0 z-20 flex h-11 w-8 items-center justify-center rounded-r-md bg-card/80 hairline"
          onClick={() => setCube((v) => !v)}
          aria-label="Open Energy Cube"
        >
          <Zap className="size-3.5 text-primary" />
        </button>

        <div className="pointer-events-none absolute right-3 bottom-28 left-3 z-10">
          <div className="mb-1 flex gap-1">
            <Bar value={hud.hp} tone="hp" />
            <Bar value={hud.vest} tone="vest" />
            <Bar value={hud.boost} tone="boost" />
          </div>
          <div className="flex items-end justify-between">
            <p className="font-mono text-xs text-muted-foreground">
              {hud.reloading > 0 ? `RLD ${hud.reloading.toFixed(1)}` : `${hud.mag} / ${hud.reserve}`}
              {hud.looting ? " · LOOT" : ""}
            </p>
            <p className="font-mono text-[10px] text-muted-foreground">
              kits {hud.kits} · nades {hud.nades}
            </p>
          </div>
        </div>

        {plugins.aiCoach && !plugins.stopwatch && (
          <p className="pointer-events-none absolute top-10 left-3 right-3 z-10 text-center text-[11px] text-foreground/80">
            {hud.coach}
          </p>
        )}

        {watermark && (
          <p className="pointer-events-none absolute right-3 bottom-16 z-10 font-display text-[10px] tracking-[0.2em] text-foreground/30">
            FORGE SPACE · NOTE 10+
          </p>
        )}

        {triggers.map((tr) => {
          if (!tr.enabled) return null;
          const side = tr.id === "L1" ? "left" : "right";
          const top = `${18 + tr.along * 0.45}%`;
          return (
            <button
              key={tr.id}
              type="button"
              aria-label={tr.label}
              className="absolute z-20 w-8 rounded-sm bg-card/70 hairline"
              style={{
                [side]: 0,
                top,
                height: `${Math.max(44, tr.size)}px`,
              }}
              onPointerDown={(e) => {
                e.stopPropagation();
                fireEdge(tr.id, true);
              }}
              onPointerUp={(e) => {
                e.stopPropagation();
                fireEdge(tr.id, false);
              }}
              onPointerLeave={() => fireEdge(tr.id, false)}
            >
              <span className="block font-mono text-[9px] tracking-widest text-muted-foreground">
                {tr.id}
              </span>
            </button>
          );
        })}

        <div className="absolute right-9 bottom-28 z-20 flex flex-col gap-2">
          <HudBtn label="Jump" onPress={() => (pulse.current.jump = true)} />
          <HudBtn label="Crouch" onPress={() => (pulse.current.crouch = true)} />
          <HudBtn label="Reload" onPress={() => (pulse.current.reload = true)} />
          <HudBtn label="Throw" onPress={() => (pulse.current.grenade = true)} />
        </div>
        <div className="absolute bottom-28 left-9 z-20 flex flex-col gap-2">
          <HudBtn label="Peek L" onHold={(v) => (sticky.current.peekL = v)} />
          <HudBtn label="Heal" onPress={() => (pulse.current.heal = true)} />
          <HudBtn label="ADS" onHold={(v) => (sticky.current.ads = v)} />
        </div>
      </div>

      <div className="flex items-center gap-2 border-t border-border bg-panel px-3 py-2">
        <Button size="sm" variant="ghost" onClick={() => setView("pubg")}>
          <X className="size-4" />
          Exit
        </Button>
        <Button size="sm" variant="ghost" onClick={() => setPaused((p) => !p)}>
          {paused ? <Play className="size-4" /> : <Pause className="size-4" />}
          {paused ? "Resume" : "Pause"}
        </Button>
        <Button
          size="sm"
          variant="ghost"
          onClick={() => {
            engine.current.reset();
            setPaused(false);
            setShowHelp(false);
          }}
        >
          <RotateCcw className="size-4" />
          Restart
        </Button>
        <span className="ml-auto flex items-center gap-2 font-mono text-[10px] text-muted-foreground">
          <Crosshair className="size-3" />
          {energy.mode.toUpperCase()}
          <Gauge className="size-3" />
          {energy.touchSample === "ultra" ? "240 Hz" : "120 Hz"}
        </span>
      </div>

      {cube && <EnergyCube onClose={() => setCube(false)} />}

      {disturb.barrage && !disturb.dnd && (
        <div className="pointer-events-none absolute top-16 right-0 left-0 overflow-hidden">
          <p className="font-mono text-[10px] text-muted-foreground">Missed call · Work</p>
        </div>
      )}

      {(showHelp || hud.dead || paused) && (
        <div className="absolute inset-0 z-30 flex items-center justify-center bg-background/72 p-6">
          <div className="w-full max-w-sm rounded-xl bg-card p-5 hairline stagger-in">
            <p className="font-mono text-[10px] tracking-[0.22em] text-primary uppercase">
              {hud.dead ? "Eliminated" : paused ? "Paused" : "Forge Range"}
            </p>
            <h2 className="mt-1 font-display text-2xl font-semibold">
              {hud.dead ? `${hud.kills} kills` : "PUBG layout trainer"}
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              Move with WASD or the left stick. Mouse aims. Left click or R1 fires. Right click or L1
              holds ADS. Space jump, R reload, G throw, H heal, Q peek.
            </p>
            <p className="mt-2 text-xs text-muted-foreground">
              AI Smart Trigger is {ai.enabled ? "armed" : "off"}
              {ai.autoFire ? " · auto-fire on lock" : " · auto-fire off (safer for ranked habits)"}.
              This range is local — it cannot inject into PUBG Mobile.
            </p>
            <div className="mt-4 flex gap-2">
              <Button
                className="flex-1"
                onClick={() => {
                  if (hud.dead) engine.current.reset();
                  setPaused(false);
                  setShowHelp(false);
                }}
              >
                {hud.dead ? "Drop again" : "Enter"}
              </Button>
              <Button variant="outline" onClick={() => setView("pubg")}>
                Profile
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Bar({ value, tone }: { value: number; tone: "hp" | "vest" | "boost" }) {
  return (
    <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted">
      <div
        className={
          tone === "hp"
            ? "h-full bg-primary"
            : tone === "vest"
              ? "h-full bg-foreground/70"
              : "h-full bg-warn"
        }
        style={{ width: `${Math.max(0, Math.min(100, value))}%` }}
      />
    </div>
  );
}

function HudBtn({
  label,
  onPress,
  onHold,
}: {
  label: string;
  onPress?: () => void;
  onHold?: (v: boolean) => void;
}) {
  return (
    <button
      type="button"
      className="size-12 rounded-full bg-card/75 font-mono text-[9px] tracking-wide text-foreground uppercase hairline"
      onPointerDown={(e) => {
        e.stopPropagation();
        onPress?.();
        onHold?.(true);
      }}
      onPointerUp={(e) => {
        e.stopPropagation();
        onHold?.(false);
      }}
      onPointerLeave={() => onHold?.(false)}
    >
      {label}
    </button>
  );
}
