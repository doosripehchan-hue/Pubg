import type { AiTrigger, HuntFilter, Plugins, TriggerConfig } from "@/lib/types";

export interface EngineInput {
  moveX: number;
  moveY: number;
  aimX: number;
  aimY: number;
  fire: boolean;
  ads: boolean;
  jump: boolean;
  crouch: boolean;
  prone: boolean;
  reload: boolean;
  grenade: boolean;
  peekL: boolean;
  peekR: boolean;
  sprint: boolean;
  heal: boolean;
  loot: boolean;
  dt: number;
}

export interface EngineHud {
  hp: number;
  vest: number;
  boost: number;
  mag: number;
  reserve: number;
  reloading: number;
  kills: number;
  alive: number;
  wave: number;
  zoneIn: number;
  fps: number;
  cps: number;
  ping: number;
  ads: boolean;
  jumping: boolean;
  crouched: boolean;
  aiLock: boolean;
  coach: string;
  winRate: number;
  dead: boolean;
  kits: number;
  nades: number;
  looting: boolean;
  shake: number;
}

type Bullet = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  from: "p" | "e";
  dmg: number;
  live: boolean;
};
type Bot = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  hp: number;
  aim: number;
  fireCd: number;
  live: boolean;
  name: string;
  knocked: number;
};
type Crate = { x: number; y: number; w: number; h: number };
type Particle = { x: number; y: number; vx: number; vy: number; life: number; max: number; c: string; r: number };
type Nade = { x: number; y: number; vx: number; vy: number; fuse: number; live: boolean };

const NAMES = ["Misha", "Ravi", "Jun", "Omar", "Lina", "Chen", "Igor", "Noor", "Pavel", "Aya"];

export class RangeEngine {
  w = 2400;
  h = 1800;
  player = { x: 1200, y: 900, vx: 0, vy: 0, aim: 0, hp: 100, vest: 75, boost: 20 };
  mag = 30;
  reserve = 90;
  kits = 3;
  nades = 2;
  reloadT = 0;
  fireCd = 0;
  jumpT = 0;
  crouch = false;
  prone = false;
  ads = false;
  peek = 0;
  kills = 0;
  wave = 1;
  zoneR = 1100;
  zoneT = 90;
  dead = false;
  aiLock = false;
  coach = "Hold the compound. Don't ego peek the ridge.";
  clicks = 0;
  clickWindow = 0;
  cps = 0;
  healT = 0;
  crates: Crate[] = [];
  bots: Bot[] = [];
  bullets: Bullet[] = [];
  nadeList: Nade[] = [];
  particles: Particle[] = [];
  cam = { x: 1200, y: 900, shake: 0 };
  lastFire = 0;
  time = 0;
  looting = false;
  private bPool: Bullet[] = [];
  private pPool: Particle[] = [];

  constructor() {
    this.reset();
  }

  reset() {
    this.player = { x: 1200, y: 900, vx: 0, vy: 0, aim: 0, hp: 100, vest: 75, boost: 20 };
    this.mag = 30;
    this.reserve = 90;
    this.kits = 3;
    this.nades = 2;
    this.reloadT = 0;
    this.fireCd = 0;
    this.jumpT = 0;
    this.crouch = false;
    this.prone = false;
    this.ads = false;
    this.peek = 0;
    this.kills = 0;
    this.wave = 1;
    this.zoneR = 1100;
    this.zoneT = 90;
    this.dead = false;
    this.healT = 0;
    this.looting = false;
    this.cam = { x: 1200, y: 900, shake: 0 };
    this.time = 0;
    this.crates = [
      { x: 980, y: 820, w: 70, h: 48 },
      { x: 1380, y: 760, w: 86, h: 42 },
      { x: 1100, y: 1140, w: 64, h: 64 },
      { x: 1520, y: 1080, w: 96, h: 40 },
      { x: 760, y: 1000, w: 52, h: 80 },
      { x: 1680, y: 880, w: 70, h: 70 },
      { x: 900, y: 540, w: 120, h: 36 },
      { x: 1480, y: 1400, w: 80, h: 50 },
    ];
    this.bots = [];
    this.bullets = [];
    this.nadeList = [];
    this.particles = [];
    this.spawnWave(4);
  }

  private allocBullet(): Bullet {
    const b = this.bPool.pop() ?? {
      x: 0,
      y: 0,
      vx: 0,
      vy: 0,
      life: 0,
      from: "p",
      dmg: 0,
      live: false,
    };
    return b;
  }

  private spawnWave(n: number) {
    for (let i = 0; i < n; i++) {
      const a = Math.random() * Math.PI * 2;
      const d = 420 + Math.random() * 380;
      this.bots.push({
        x: this.player.x + Math.cos(a) * d,
        y: this.player.y + Math.sin(a) * d,
        vx: 0,
        vy: 0,
        hp: 80 + Math.random() * 40,
        aim: 0,
        fireCd: 0.6 + Math.random(),
        live: true,
        name: NAMES[(this.kills + i) % NAMES.length] ?? "Bot",
        knocked: 0,
      });
    }
  }

  private burst(x: number, y: number, c: string, n: number, sp = 120) {
    for (let i = 0; i < n; i++) {
      const a = Math.random() * Math.PI * 2;
      const s = Math.random() * sp;
      const p = this.pPool.pop() ?? {
        x: 0,
        y: 0,
        vx: 0,
        vy: 0,
        life: 0,
        max: 0,
        c: "#fff",
        r: 2,
      };
      p.x = x;
      p.y = y;
      p.vx = Math.cos(a) * s;
      p.vy = Math.sin(a) * s;
      p.life = 0.25 + Math.random() * 0.4;
      p.max = p.life;
      p.c = c;
      p.r = 1.5 + Math.random() * 2.5;
      this.particles.push(p);
    }
  }

  private blocked(x: number, y: number, r: number) {
    for (const c of this.crates) {
      if (x + r > c.x && x - r < c.x + c.w && y + r > c.y && y - r < c.y + c.h) return c;
    }
    return null;
  }

  private los(ax: number, ay: number, bx: number, by: number) {
    const steps = 12;
    for (let i = 1; i < steps; i++) {
      const t = i / steps;
      if (this.blocked(ax + (bx - ax) * t, ay + (by - ay) * t, 2)) return false;
    }
    return true;
  }

  fireShot(from: "p" | "e", x: number, y: number, ang: number, spread: number, dmg: number) {
    const a = ang + (Math.random() - 0.5) * spread;
    const spd = from === "p" ? 920 : 720;
    const b = this.allocBullet();
    b.x = x + Math.cos(a) * 22;
    b.y = y + Math.sin(a) * 22;
    b.vx = Math.cos(a) * spd;
    b.vy = Math.sin(a) * spd;
    b.life = 0.85;
    b.from = from;
    b.dmg = dmg;
    b.live = true;
    this.bullets.push(b);
  }

  tryFire(ai: AiTrigger, rapid: boolean) {
    if (this.dead || this.reloadT > 0 || this.healT > 0 || this.mag <= 0) return false;
    const rate = rapid ? 0.045 : this.ads ? 0.09 : 0.078;
    if (this.fireCd > 0) return false;
    this.fireCd = rate;
    this.mag -= 1;
    this.clicks += 1;
    const spread = this.ads ? 0.028 : this.crouch ? 0.05 : 0.09;
    const dmg = this.ads ? 28 : 22;
    const px = this.player.x + this.peek;
    this.fireShot("p", px, this.player.y, this.player.aim, spread, dmg);
    this.cam.shake = Math.min(7, this.cam.shake + 2.2);
    this.burst(px + Math.cos(this.player.aim) * 24, this.player.y + Math.sin(this.player.aim) * 24, "#ffb0a8", 4, 80);
    if (this.mag === 0 && ai.enabled && ai.autoReload) this.startReload();
    return true;
  }

  startReload() {
    if (this.reloadT > 0 || this.reserve <= 0 || this.mag >= 30 || this.dead) return;
    this.reloadT = 1.85;
  }

  throwNade() {
    if (this.nades <= 0 || this.dead || this.healT > 0) return;
    this.nades -= 1;
    const a = this.player.aim;
    const power = this.ads ? 280 : 360;
    this.nadeList.push({
      x: this.player.x,
      y: this.player.y,
      vx: Math.cos(a) * power,
      vy: Math.sin(a) * power,
      fuse: 2.05,
      live: true,
    });
  }

  startHeal() {
    if (this.kits <= 0 || this.player.hp >= 100 || this.healT > 0 || this.dead) return;
    this.healT = 2.4;
  }

  update(
    input: EngineInput,
    opts: {
      ai: AiTrigger;
      plugins: Plugins;
      rapid: boolean;
      triggers: TriggerConfig[];
    },
  ) {
    const dt = Math.min(input.dt, 0.05);
    this.time += dt;
    this.zoneT -= dt;
    if (this.zoneT <= 0) {
      this.zoneR = Math.max(280, this.zoneR - 140);
      this.zoneT = 55;
    }
    this.fireCd = Math.max(0, this.fireCd - dt);
    this.jumpT = Math.max(0, this.jumpT - dt);
    this.clickWindow += dt;
    if (this.clickWindow >= 1) {
      this.cps = this.clicks;
      this.clicks = 0;
      this.clickWindow = 0;
    }

    if (this.dead) {
      this.stepProjectiles(dt);
      this.stepCam(dt, input);
      return;
    }

    if (input.jump && this.jumpT <= 0 && !this.prone) this.jumpT = 0.34;
    if (input.crouch) this.crouch = !this.crouch;
    if (input.prone) {
      this.prone = !this.prone;
      this.crouch = false;
    }
    this.ads = input.ads;
    this.peek = input.peekL ? -20 : input.peekR ? 20 : 0;
    if (input.reload) this.startReload();
    if (input.grenade) this.throwNade();
    if (input.heal) this.startHeal();

    if (this.reloadT > 0) {
      this.reloadT -= dt;
      if (this.reloadT <= 0) {
        const need = 30 - this.mag;
        const take = Math.min(need, this.reserve);
        this.mag += take;
        this.reserve -= take;
      }
    }
    if (this.healT > 0) {
      this.healT -= dt;
      if (this.healT <= 0) {
        this.kits -= 1;
        this.player.hp = Math.min(100, this.player.hp + 55);
        this.coach = "Healed. Re-peek only if you have cover.";
      }
    }

    const len = Math.hypot(input.moveX, input.moveY);
    let mx = 0,
      my = 0;
    if (len > 0.12 && this.healT <= 0 && this.reloadT <= 0) {
      mx = input.moveX / len;
      my = input.moveY / len;
    }
    let spd = 205;
    if (input.sprint && !this.ads) spd = 275;
    if (this.ads) spd *= 0.58;
    if (this.crouch) spd *= 0.55;
    if (this.prone) spd *= 0.32;
    if (this.jumpT > 0) spd *= 1.05;
    this.player.vx = mx * spd;
    this.player.vy = my * spd;
    const nx = this.player.x + this.player.vx * dt;
    const ny = this.player.y + this.player.vy * dt;
    const pr = this.prone ? 10 : 13;
    if (!this.blocked(nx, this.player.y, pr)) this.player.x = nx;
    if (!this.blocked(this.player.x, ny, pr)) this.player.y = ny;
    this.player.x = Math.max(40, Math.min(this.w - 40, this.player.x));
    this.player.y = Math.max(40, Math.min(this.h - 40, this.player.y));

    this.player.aim = Math.atan2(input.aimY - this.player.y, input.aimX - this.player.x);

    const dxz = this.player.x - this.w / 2;
    const dyz = this.player.y - this.h / 2;
    if (Math.hypot(dxz, dyz) > this.zoneR) {
      this.hurt(8 * dt, false);
    }

    this.aiLock = false;
    let nearest: Bot | null = null;
    let nearestD = 1e9;
    for (const b of this.bots) {
      if (!b.live) continue;
      const d = Math.hypot(b.x - this.player.x, b.y - this.player.y);
      if (d < nearestD) {
        nearestD = d;
        nearest = b;
      }
    }

    if (opts.ai.enabled && nearest && nearest.live) {
      const ang = Math.atan2(nearest.y - this.player.y, nearest.x - this.player.x);
      let diff = ang - this.player.aim;
      while (diff > Math.PI) diff -= Math.PI * 2;
      while (diff < -Math.PI) diff += Math.PI * 2;
      const los = this.los(this.player.x, this.player.y, nearest.x, nearest.y);
      if (Math.abs(diff) < 0.22 && los && nearestD < 560) this.aiLock = true;
    }

    const wantFire =
      input.fire || (opts.ai.enabled && opts.ai.autoFire && this.aiLock && this.ads);
    if (wantFire) this.tryFire(opts.ai, opts.rapid);

    if (opts.ai.enabled && opts.ai.autoReload && this.mag === 0) this.startReload();
    if (opts.ai.enabled && opts.ai.autoHeal && this.player.hp < 38 && this.kits > 0 && this.healT <= 0)
      this.startHeal();

    if (opts.ai.enabled && opts.ai.autoLoot) {
      this.looting = false;
      for (const c of this.crates) {
        const d = Math.hypot(c.x + c.w / 2 - this.player.x, c.y + c.h / 2 - this.player.y);
        if (d < 56 && this.reserve < 150) {
          this.looting = true;
          this.reserve = Math.min(150, this.reserve + 18 * dt);
        }
      }
    }

    this.stepBots(dt);
    this.stepProjectiles(dt);
    this.stepCam(dt, input);

    const living = this.bots.filter((b) => b.live).length;
    if (living === 0) {
      this.wave += 1;
      this.spawnWave(3 + this.wave);
      this.coach = `Wave ${this.wave}. Rotate, don't hold the same crate.`;
    } else if (this.aiLock) {
      this.coach = opts.plugins.aiCoach
        ? "Target locked. Burst, then un-ADS."
        : this.coach;
    } else if (this.player.hp < 40) {
      this.coach = "HP critical. Break line of sight and heal.";
    }

    this.cam.shake *= Math.pow(0.04, dt);
  }

  private stepBots(dt: number) {
    for (const b of this.bots) {
      if (!b.live) {
        if (b.knocked > 0) {
          b.knocked -= dt;
          if (b.knocked <= 0) {
            /* finished bleed */
          }
        }
        continue;
      }
      const dx = this.player.x - b.x;
      const dy = this.player.y - b.y;
      const d = Math.hypot(dx, dy) || 1;
      let sx = dx / d;
      let sy = dy / d;
      for (const o of this.bots) {
        if (o === b || !o.live) continue;
        const ox = b.x - o.x;
        const oy = b.y - o.y;
        const od = Math.hypot(ox, oy);
        if (od < 46 && od > 0) {
          sx += (ox / od) * 0.7;
          sy += (oy / od) * 0.7;
        }
      }
      const sl = Math.hypot(sx, sy) || 1;
      const spd = d > 260 ? 92 : 48;
      const nx = b.x + (sx / sl) * spd * dt;
      const ny = b.y + (sy / sl) * spd * dt;
      if (!this.blocked(nx, b.y, 12)) b.x = nx;
      if (!this.blocked(b.x, ny, 12)) b.y = ny;
      b.aim = Math.atan2(dy, dx);
      b.fireCd -= dt;
      const los = this.los(b.x, b.y, this.player.x, this.player.y);
      if (b.fireCd <= 0 && d < 480 && los) {
        b.fireCd = 0.55 + Math.random() * 0.45;
        this.fireShot("e", b.x, b.y, b.aim, 0.12, 11);
      }
    }
  }

  private stepProjectiles(dt: number) {
    for (const b of this.bullets) {
      if (!b.live) continue;
      b.x += b.vx * dt;
      b.y += b.vy * dt;
      b.life -= dt;
      if (b.life <= 0 || this.blocked(b.x, b.y, 2)) {
        if (this.blocked(b.x, b.y, 2)) this.burst(b.x, b.y, "#d4d0c8", 3, 40);
        b.live = false;
        continue;
      }
      if (b.from === "p") {
        for (const bot of this.bots) {
          if (!bot.live) continue;
          if (Math.hypot(bot.x - b.x, bot.y - b.y) < 16) {
            bot.hp -= b.dmg;
            b.live = false;
            this.burst(bot.x, bot.y, "#e10600", 6, 90);
            this.cam.shake = Math.min(10, this.cam.shake + 3);
            if (bot.hp <= 0) {
              bot.live = false;
              bot.knocked = 8;
              this.kills += 1;
              this.burst(bot.x, bot.y, "#f3f3f4", 14, 160);
              this.coach = `${bot.name} down. ${this.kills} kills.`;
            }
            break;
          }
        }
      } else if (this.jumpT <= 0 && Math.hypot(this.player.x - b.x, this.player.y - b.y) < 14) {
        b.live = false;
        this.hurt(b.dmg, true);
      }
    }
    this.bullets = this.bullets.filter((b) => {
      if (!b.live) {
        this.bPool.push(b);
        return false;
      }
      return true;
    });

    for (const n of this.nadeList) {
      if (!n.live) continue;
      n.x += n.vx * dt;
      n.y += n.vy * dt;
      n.vx *= 0.985;
      n.vy *= 0.985;
      n.fuse -= dt;
      if (n.fuse <= 0) {
        n.live = false;
        this.burst(n.x, n.y, "#ff6a3d", 22, 220);
        this.cam.shake = 12;
        for (const bot of this.bots) {
          if (!bot.live) continue;
          const d = Math.hypot(bot.x - n.x, bot.y - n.y);
          if (d < 110) {
            bot.hp -= 90 * (1 - d / 110);
            if (bot.hp <= 0) {
              bot.live = false;
              this.kills += 1;
            }
          }
        }
        const pd = Math.hypot(this.player.x - n.x, this.player.y - n.y);
        if (pd < 110) this.hurt(70 * (1 - pd / 110), true);
      }
    }
    this.nadeList = this.nadeList.filter((n) => n.live);

    for (const p of this.particles) {
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.life -= dt;
    }
    this.particles = this.particles.filter((p) => {
      if (p.life <= 0) {
        this.pPool.push(p);
        return false;
      }
      return true;
    });
  }

  private hurt(amount: number, shake: boolean) {
    let dmg = amount;
    if (this.player.vest > 0) {
      const soak = Math.min(this.player.vest, dmg * 0.55);
      this.player.vest -= soak;
      dmg -= soak;
    }
    this.player.hp -= dmg;
    if (shake) this.cam.shake = Math.min(14, this.cam.shake + 4);
    if (this.player.hp <= 0) {
      this.player.hp = 0;
      this.dead = true;
      this.coach = "Knocked. Tap Restart to drop again.";
    }
  }

  private stepCam(dt: number, input: EngineInput) {
    const look = this.ads ? 90 : 48;
    const tx = this.player.x + Math.cos(this.player.aim) * look;
    const ty = this.player.y + Math.sin(this.player.aim) * look;
    this.cam.x += (tx - this.cam.x) * (1 - Math.pow(0.001, dt));
    this.cam.y += (ty - this.cam.y) * (1 - Math.pow(0.001, dt));
    void input;
  }

  hud(): EngineHud {
    const alive = this.bots.filter((b) => b.live).length;
    const kd = this.kills / Math.max(1, (100 - this.player.hp) / 20);
    const win = Math.max(4, Math.min(78, 18 + this.kills * 7 - (100 - this.player.hp) * 0.2 + (this.zoneR / 1100) * 8));
    return {
      hp: this.player.hp,
      vest: this.player.vest,
      boost: this.player.boost,
      mag: this.mag,
      reserve: Math.floor(this.reserve),
      reloading: this.reloadT,
      kills: this.kills,
      alive: alive + (this.dead ? 0 : 1),
      wave: this.wave,
      zoneIn: this.zoneT,
      fps: 0,
      cps: this.cps,
      ping: 0,
      ads: this.ads,
      jumping: this.jumpT > 0,
      crouched: this.crouch,
      aiLock: this.aiLock,
      coach: this.coach,
      winRate: win,
      dead: this.dead,
      kits: this.kits,
      nades: this.nades,
      looting: this.looting,
      shake: this.cam.shake,
    };
  }

  draw(
    ctx: CanvasRenderingContext2D,
    vw: number,
    vh: number,
    hunt: HuntFilter,
    scout: boolean,
    crosshair: boolean,
    audioProbe: boolean,
    aux: boolean,
  ) {
    const zoom = (this.ads ? 1.55 : 1) * (scout && this.ads ? 1.35 : 1);
    const sx = this.cam.shake * (Math.random() - 0.5);
    const sy = this.cam.shake * (Math.random() - 0.5);
    ctx.save();
    ctx.fillStyle = hunt === "night" ? "#070b10" : hunt === "invert" ? "#d9d6d0" : "#14151a";
    ctx.fillRect(0, 0, vw, vh);

    ctx.translate(vw / 2 + sx, vh / 2 + sy);
    ctx.scale(zoom, zoom);
    ctx.translate(-this.cam.x, -this.cam.y);

    ctx.fillStyle = hunt === "focus" ? "#10140f" : hunt === "invert" ? "#cfcabe" : "#17181d";
    ctx.fillRect(0, 0, this.w, this.h);

    ctx.strokeStyle = "rgba(255,255,255,0.04)";
    ctx.lineWidth = 1;
    for (let x = 0; x <= this.w; x += 80) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, this.h);
      ctx.stroke();
    }
    for (let y = 0; y <= this.h; y += 80) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(this.w, y);
      ctx.stroke();
    }

    ctx.beginPath();
    ctx.arc(this.w / 2, this.h / 2, this.zoneR, 0, Math.PI * 2);
    ctx.strokeStyle = "rgba(70,140,255,0.55)";
    ctx.lineWidth = 4;
    ctx.stroke();
    ctx.fillStyle = "rgba(40,90,180,0.05)";
    ctx.fill();

    for (const c of this.crates) {
      ctx.fillStyle = hunt === "invert" ? "#3a3a40" : "#2a2c32";
      ctx.fillRect(c.x, c.y, c.w, c.h);
      ctx.strokeStyle = "rgba(255,255,255,0.08)";
      ctx.strokeRect(c.x, c.y, c.w, c.h);
    }

    if (audioProbe) {
      for (const b of this.bots) {
        if (!b.live) continue;
        const moving = Math.hypot(b.vx, b.vy) > 1 || true;
        if (!moving) continue;
        const d = Math.hypot(b.x - this.player.x, b.y - this.player.y);
        if (d > 420) continue;
        ctx.beginPath();
        ctx.arc(b.x, b.y, 18 + (this.time * 40) % 26, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(225,6,0,${0.28 - (d / 420) * 0.2})`;
        ctx.lineWidth = 2;
        ctx.stroke();
      }
    }

    for (const n of this.nadeList) {
      ctx.fillStyle = "#c4c0b6";
      ctx.beginPath();
      ctx.arc(n.x, n.y, 5, 0, Math.PI * 2);
      ctx.fill();
      if (aux) {
        ctx.beginPath();
        ctx.arc(n.x, n.y, 110, 0, Math.PI * 2);
        ctx.strokeStyle = "rgba(232,161,58,0.45)";
        ctx.setLineDash([6, 6]);
        ctx.stroke();
        ctx.setLineDash([]);
      }
    }

    for (const b of this.bots) {
      if (!b.live && b.knocked <= 0) continue;
      ctx.save();
      ctx.translate(b.x, b.y);
      ctx.fillStyle = b.live ? "#8a403c" : "#5a3030";
      ctx.beginPath();
      ctx.arc(0, 0, 13, 0, Math.PI * 2);
      ctx.fill();
      if (b.live) {
        ctx.rotate(b.aim);
        ctx.fillStyle = "#6a3230";
        ctx.fillRect(8, -3, 16, 6);
      }
      ctx.restore();
      ctx.fillStyle = "#f3f3f4";
      ctx.font = "11px Sora, sans-serif";
      ctx.textAlign = "center";
      ctx.fillText(b.live ? b.name : `${b.name} · DBNO`, b.x, b.y - 20);
      if (b.live) {
        ctx.fillStyle = "#2a2a30";
        ctx.fillRect(b.x - 16, b.y - 26, 32, 3);
        ctx.fillStyle = "#e10600";
        ctx.fillRect(b.x - 16, b.y - 26, 32 * (b.hp / 120), 3);
      }
    }

    for (const b of this.bullets) {
      ctx.strokeStyle = b.from === "p" ? "#f3f3f4" : "#e10600";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(b.x, b.y);
      ctx.lineTo(b.x - b.vx * 0.018, b.y - b.vy * 0.018);
      ctx.stroke();
    }

    for (const p of this.particles) {
      ctx.globalAlpha = Math.max(0, p.life / p.max);
      ctx.fillStyle = p.c;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = 1;
    }

    const px = this.player.x + this.peek;
    const py = this.player.y;
    ctx.save();
    ctx.translate(px, py);
    ctx.rotate(this.player.aim);
    ctx.fillStyle = this.dead ? "#4a4a50" : "#d9d4cc";
    ctx.beginPath();
    ctx.arc(0, 0, this.prone ? 9 : 12, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#9a9590";
    ctx.fillRect(10, -3, this.ads ? 22 : 18, 6);
    ctx.restore();

    if (aux && this.nades > 0) {
      const a = this.player.aim;
      ctx.beginPath();
      ctx.moveTo(px, py);
      const power = this.ads ? 280 : 360;
      for (let t = 0; t < 1.2; t += 0.08) {
        const x = px + Math.cos(a) * power * t * 0.85;
        const y = py + Math.sin(a) * power * t * 0.85;
        ctx.lineTo(x, y);
      }
      ctx.strokeStyle = "rgba(232,161,58,0.55)";
      ctx.setLineDash([5, 5]);
      ctx.stroke();
      ctx.setLineDash([]);
    }

    ctx.restore();

    if (crosshair) {
      const cx = vw / 2;
      const cy = vh / 2;
      ctx.strokeStyle = this.aiLock ? "#e10600" : "rgba(243,243,244,0.85)";
      ctx.lineWidth = 1.5;
      const g = this.ads ? 5 : 9;
      ctx.beginPath();
      ctx.moveTo(cx - 12, cy);
      ctx.lineTo(cx - g, cy);
      ctx.moveTo(cx + g, cy);
      ctx.lineTo(cx + 12, cy);
      ctx.moveTo(cx, cy - 12);
      ctx.lineTo(cx, cy - g);
      ctx.moveTo(cx, cy + g);
      ctx.lineTo(cx, cy + 12);
      ctx.stroke();
      ctx.fillStyle = this.aiLock ? "#e10600" : "#f3f3f4";
      ctx.fillRect(cx - 1, cy - 1, 2, 2);
    }

    if (hunt === "invert") {
      ctx.globalCompositeOperation = "difference";
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, vw, vh);
      ctx.globalCompositeOperation = "source-over";
    }
  }

  screenToWorld(sx: number, sy: number, vw: number, vh: number, ads: boolean, scout: boolean) {
    const zoom = (ads ? 1.55 : 1) * (scout && ads ? 1.35 : 1);
    return {
      x: this.cam.x + (sx - vw / 2) / zoom,
      y: this.cam.y + (sy - vh / 2) / zoom,
    };
  }
}
