// AstroMenace 1.4.3 (Mikhail Kurinnoi, Viewizard; GPL-3.0-or-later), port of src/game/hud.cpp and
// src/core/particle_system2d/particle_system2d.cpp: the head-up display (border, energy and armor bars,
// experience and money, the emblems' 2D particles). Changed for the browser by the freegames project, 2026.
import { Vec3, fRand, fRand0, vwSqrtf, mat33, m33CreateRotate, m33CalcPoint, clamp } from '../core/math.ts';
import { rect, vw_Draw2D, type Rect } from '../engine/draw2d.ts';
import { getTexture } from '../engine/textures.ts';
import { SDL_GetTicks, vw_GetTimeThread } from '../engine/core.ts';
import { GameConfig } from './config.ts';
import type { SpaceShip } from '../object3d/spaceship.ts';

// ---- 2D particle systems

export const Particle2DCreationType = { Point: 0, Quad: 1, Circle: 2 };
interface C3 { r: number; g: number; b: number }

class Particle2D {
  Location = new Vec3();
  Velocity = new Vec3();
  Color: C3 = { r: 1, g: 0, b: 0 };
  ColorDelta: C3 = { r: 0, g: 0, b: 0 };
  Age = 0;
  Lifetime = 0;
  Size = 1;
  SizeDelta = 0;
  Alpha = 1;
  NeedStop = false;
  Update(dt: number, parent: Vec3, magnet: boolean, magnetFactor: number): boolean {
    if (this.Age + dt >= this.Lifetime) return false;
    this.Age += dt;
    this.Location.addTo(this.Velocity.mul(dt));
    if (this.NeedStop) this.Velocity.subFrom(this.Velocity.mul(dt));
    if (magnet) {
      const d = parent.sub(this.Location);
      d.Normalize();
      if (this.NeedStop) magnetFactor -= magnetFactor * dt;
      this.Velocity.addTo(d.mul(magnetFactor * dt));
    }
    this.Color.r += this.ColorDelta.r * dt;
    this.Color.g += this.ColorDelta.g * dt;
    this.Color.b += this.ColorDelta.b * dt;
    this.Size += this.SizeDelta * dt;
    return true;
  }
}

export class ParticleSystem2D {
  Texture: string | null = null;
  Direction = new Vec3();
  SizeStart = 1; SizeVar = 0; SizeEnd = 1;
  AlphaStart = 1; AlphaVar = 0; AlphaEnd = 1;
  ColorStart: C3 = { r: 1, g: 1, b: 1 };
  ColorVar: C3 = { r: 0, g: 0, b: 0 };
  ColorEnd: C3 = { r: 1, g: 1, b: 1 };
  Speed = 1; SpeedVar = 1; SpeedOnCreation = 1;
  CreationType = Particle2DCreationType.Point;
  CreationSize = new Vec3(0.05, 0.05, 0.05);
  Life = 1; LifeVar = 0;
  IsMagnet = false;
  MagnetFactor = 25;
  DeadZone = 0;
  IsSuppressed = false;
  ParticlesPerSec = 100;
  Theta = 1;
  RotationMatrix = mat33();
  Location = new Vec3();
  PrevLocation = new Vec3();
  Angle = new Vec3();
  TimeLastUpdate = 0;
  EmissionResidue = 0;
  ParticlesList: Particle2D[] = [];
  released = false;

  Update(Time: number): void {
    const dt = Time - this.TimeLastUpdate;
    this.TimeLastUpdate = Time;
    this.ParticlesList = this.ParticlesList.filter((p) => p.Update(dt, this.Location, this.IsMagnet, this.MagnetFactor));
    const needed = this.ParticlesPerSec * dt + this.EmissionResidue;
    let created = Math.trunc(needed);
    if (!this.IsSuppressed) {
      this.EmissionResidue = needed - created;
    } else {
      this.EmissionResidue = needed;
      created = 0;
    }
    if (created < 1) return;
    this.EmitParticles(created, dt);
  }

  private EmitParticles(Quantity: number, dt: number): void {
    let corr = new Vec3();
    let dtCorr = 0;
    if (Quantity > 1) {
      corr = this.PrevLocation.sub(this.Location).div(Quantity);
      dtCorr = dt / Quantity;
    }
    while (Quantity > 0) {
      const p = new Particle2D();
      this.ParticlesList.push(p);
      p.Lifetime = this.Life + fRand0() * this.LifeVar;
      if (p.Lifetime < 0) p.Lifetime = 0;
      p.Color.r = clamp(this.ColorStart.r + fRand0() * this.ColorVar.r, 0, 1);
      p.Color.g = clamp(this.ColorStart.g + fRand0() * this.ColorVar.g, 0, 1);
      p.Color.b = clamp(this.ColorStart.b + fRand0() * this.ColorVar.b, 0, 1);
      p.ColorDelta.r = (this.ColorEnd.r - p.Color.r) / p.Lifetime;
      p.ColorDelta.g = (this.ColorEnd.g - p.Color.g) / p.Lifetime;
      p.ColorDelta.b = (this.ColorEnd.b - p.Color.b) / p.Lifetime;
      p.Alpha = clamp(this.AlphaStart + fRand0() * this.AlphaVar, 0, 1);
      switch (this.CreationType) {
        case Particle2DCreationType.Point:
          p.Location = this.Location.clone();
          break;
        case Particle2DCreationType.Quad: {
          const x = (1 - fRand() * 2) * this.CreationSize.x;
          const y = (1 - fRand() * 2) * this.CreationSize.y;
          const z = (1 - fRand() * 2) * this.CreationSize.z;
          p.Location = this.Location.add(new Vec3(x, y, z));
          break;
        }
        case Particle2DCreationType.Circle: {
          const x = fRand0() * this.CreationSize.x;
          const y = fRand0() * this.CreationSize.y;
          const z = fRand0() * this.CreationSize.z;
          const c = new Vec3(x, y, z);
          if (this.DeadZone > 0) {
            const d2 = c.x * c.x + c.y * c.y + c.z * c.z;
            if (d2 < this.DeadZone * this.DeadZone) c.scale(this.DeadZone / vwSqrtf(d2));
          }
          p.Location = this.Location.add(c);
          break;
        }
      }
      p.Size = this.SizeStart + fRand0() * this.SizeVar;
      if (p.Size < 0) p.Size = 0;
      p.SizeDelta = (this.SizeEnd - p.Size) / p.Lifetime;
      this.direction(p);
      let s = this.Speed + fRand0() * this.SpeedVar;
      if (s < 0) s = 0;
      p.Velocity = p.Velocity.mul(s);
      Quantity--;
      if (Quantity > 0) {
        p.Location.addTo(corr.mul(Quantity));
        if (!p.Update(dtCorr * Quantity, this.Location, this.IsMagnet, this.MagnetFactor)) this.ParticlesList.pop();
      }
    }
  }

  private direction(p: Particle2D): void {
    const D = this.Direction;
    if (!(D.x === 0 && D.y === 0 && D.z === 0) && this.Theta !== 360) {
      if (this.Theta === 0) {
        p.Velocity = D.clone();
        return;
      }
      const yaw = fRand0() * 3.14159 * 2;
      const pitch = fRand0() * this.Theta * 3.14159 / 180;
      const v = new Vec3();
      v.y = D.y * Math.cos(pitch);
      v.x = D.y * Math.sin(pitch) * Math.cos(yaw);
      v.z = D.y * Math.sin(pitch) * Math.sin(yaw);
      v.y += D.x * Math.sin(pitch) * Math.cos(yaw);
      v.x += D.x * Math.cos(pitch);
      v.z += D.x * Math.sin(pitch) * Math.sin(yaw);
      v.y += D.z * Math.sin(pitch) * Math.sin(yaw);
      v.x += D.z * Math.sin(pitch) * Math.cos(yaw);
      v.z += D.z * Math.cos(pitch);
      m33CalcPoint(v, this.RotationMatrix);
      p.Velocity = v;
      return;
    }
    const v = new Vec3();
    v.y = fRand0() * this.Theta / 360;
    v.x = fRand0() * this.Theta / 360;
    v.z = fRand0() * this.Theta / 360;
    v.Normalize();
    p.Velocity = v;
  }

  Draw(): void {
    if (!this.Texture || !this.ParticlesList.length) return;
    const t = getTexture(this.Texture);
    if (!t) return;
    for (const p of this.ParticlesList) {
      const h = p.Size / 2;
      // colours rounded to 1/32 so that the tinted copies of the texture stay few
      const q = (v: number): number => Math.round(clamp(v, 0, 1) * 32) / 32;
      vw_Draw2D(rect(p.Location.x - h, p.Location.y - h, p.Location.x + h, p.Location.y + h), rect(0, 0, t.width, t.height),
        this.Texture, true, p.Alpha, 0, { r: q(p.Color.r), g: q(p.Color.g), b: q(p.Color.b) });
    }
  }

  MoveSystem(l: Vec3): void {
    const d = l.sub(this.Location);
    this.Location = l.clone();
    this.PrevLocation = this.Location.clone();
    for (const p of this.ParticlesList) p.Location.addTo(d);
  }

  SetRotation(a: Vec3): void {
    m33CreateRotate(this.RotationMatrix, this.Angle.mul(-1));
    m33CreateRotate(this.RotationMatrix, a);
    this.Angle = a.clone();
  }
}

export const particleSystems2D: ParticleSystem2D[] = [];
export function vw_CreateParticleSystem2D(Time: number): ParticleSystem2D {
  const s = new ParticleSystem2D();
  s.TimeLastUpdate = Time;
  particleSystems2D.unshift(s);
  return s;
}
export function vw_ReleaseAllParticleSystems2D(): void {
  for (const s of particleSystems2D) s.released = true;
  particleSystems2D.length = 0;
}

// ---- HUD

const H = {
  EnergyEmblem: null as ParticleSystem2D | null,
  ArmorEmblemCircle: null as ParticleSystem2D | null,
  ArmorEmblemHoriz: null as ParticleSystem2D | null,
  ArmorEmblemVert: null as ParticleSystem2D | null,
  CurrentExperience: 0,
  CurrentMoney: 0,
  text: [] as [Rect, Rect, number][],
  bars: [] as [Rect, Rect, number][],
  CurrentDrawEnergyStatus: 0,
  CurrentDrawArmorStatus: 0,
  LastUpdateTick: 0,
  Blinking: 1,
};
const SEGMENTS = 19;
const live = (s: ParticleSystem2D | null): ParticleSystem2D | null => (s && !s.released ? s : null);

function InitHUDParticleSystems(): void {
  const W = GameConfig().InternalWidth;
  const mk = (s: ParticleSystem2D | null): ParticleSystem2D => live(s) ?? vw_CreateParticleSystem2D(vw_GetTimeThread(0));
  const e = H.EnergyEmblem = mk(H.EnergyEmblem);
  e.ColorStart = { r: 0.7, g: 0.8, b: 1 };
  e.ColorEnd = { r: 0, g: 0, b: 1 };
  e.AlphaStart = 1; e.AlphaEnd = 1;
  e.SizeStart = 12; e.SizeVar = 10; e.SizeEnd = 0;
  e.Speed = 70; e.SpeedVar = 20; e.Theta = 360;
  e.Life = 2.1; e.LifeVar = 0.05;
  e.ParticlesPerSec = 50;
  e.IsMagnet = true; e.MagnetFactor = 150;
  e.CreationType = Particle2DCreationType.Point;
  e.Texture = 'gfx/flare1.tga';
  e.MoveSystem(new Vec3(33, 29, 0));
  const armor = (s: ParticleSystem2D, sx: number, sy: number): void => {
    s.ColorStart = { r: 1, g: 0.4, b: 0.1 };
    s.ColorEnd = { r: 0.5, g: 0, b: 0 };
    s.AlphaStart = 1; s.AlphaEnd = 1;
    s.SizeStart = 13; s.SizeVar = 5; s.SizeEnd = 0;
    s.Speed = 0; s.SpeedOnCreation = 8; s.SpeedVar = 0; s.Theta = 360;
    s.Life = 2; s.LifeVar = 0.05;
    s.ParticlesPerSec = 50;
    s.CreationType = Particle2DCreationType.Quad;
    s.CreationSize = new Vec3(sx, sy, 0);
    s.Texture = 'gfx/flare1.tga';
    s.MoveSystem(new Vec3(W - 33, 29, 0));
  };
  armor(H.ArmorEmblemVert = mk(H.ArmorEmblemVert), 1, 18);
  armor(H.ArmorEmblemHoriz = mk(H.ArmorEmblemHoriz), 18, 1);
  const c = H.ArmorEmblemCircle = mk(H.ArmorEmblemCircle);
  c.ColorStart = { r: 1, g: 0.6, b: 0.2 };
  c.ColorEnd = { r: 0.5, g: 0, b: 0 };
  c.AlphaStart = 1; c.AlphaEnd = 1;
  c.SizeStart = 25; c.SizeVar = 5; c.SizeEnd = 0;
  c.Speed = 0; c.SpeedOnCreation = 8; c.SpeedVar = 10; c.Theta = 360;
  c.Life = 1.5; c.LifeVar = 0.05;
  c.ParticlesPerSec = 70;
  c.Direction = new Vec3(1, 0, 0);
  c.CreationType = Particle2DCreationType.Circle;
  c.CreationSize = new Vec3(25, 25, 0);
  c.DeadZone = 24;
  c.IsMagnet = true; c.MagnetFactor = 25;
  c.Texture = 'gfx/flare.tga';
  c.MoveSystem(new Vec3(W - 33, 29, 0));
  c.SetRotation(new Vec3(0, 0, 90));
}

function UpdateHUDParticleSystems(ship: SpaceShip | null, EnergyStatus: number): void {
  if (ship) {
    const e = live(H.EnergyEmblem);
    if (e) e.ParticlesPerSec = Math.trunc(1 + 49 * EnergyStatus);
    const pct = ship.ArmorCurrentStatus / ship.ArmorInitialStatus;
    const low = ship.ArmorCurrentStatus < ship.ArmorInitialStatus / 10;
    for (const s0 of [H.ArmorEmblemCircle, H.ArmorEmblemHoriz, H.ArmorEmblemVert]) {
      const s = live(s0);
      if (!s) continue;
      s.ColorStart.r = 1;
      s.ColorStart.g = 0.6 * pct;
      s.ColorStart.b = 0.2 * pct;
      if (low) {
        const a = H.Blinking > 0.6 ? H.Blinking : 0;
        s.AlphaStart = a;
        s.AlphaEnd = a;
      } else {
        s.AlphaStart = 1;
        s.AlphaEnd = 1;
      }
    }
  } else {
    for (const s0 of [H.EnergyEmblem, H.ArmorEmblemCircle, H.ArmorEmblemHoriz, H.ArmorEmblemVert]) {
      const s = live(s0);
      if (!s) continue;
      s.AlphaStart = 0;
      s.AlphaEnd = 0;
      s.ParticlesPerSec = 1;
    }
  }
  for (const s of particleSystems2D) s.Update(vw_GetTimeThread(0));
}

function DrawHUDBorder(): void {
  if (GameConfig().InternalWidth === 1024) {
    vw_Draw2D(rect(0, 0, 1024, 74), rect(0, 0, 1024, 74), 'game/game_panel.tga', true, 1);
    return;
  }
  const t = 'game/game_panel2.tga';
  vw_Draw2D(rect(0, 0, 466, 73), rect(0, 0, 466, 73), t, true, 1);
  vw_Draw2D(rect(540, 0, 540 + 149, 71), rect(1, 74, 150, 145), t, true, 1);
  vw_Draw2D(rect(768, 0, 768 + 460, 71), rect(150, 74, 610, 145), t, true, 1);
}

const CHARS: Record<string, [number, number, number, number]> = {
  0: [232, 4, 245, 25], 1: [71, 4, 84, 25], 2: [88, 4, 101, 25], 3: [106, 4, 119, 25], 4: [124, 4, 137, 25],
  5: [142, 4, 155, 25], 6: [160, 4, 173, 25], 7: [178, 4, 191, 25], 8: [196, 4, 209, 25], 9: [214, 4, 227, 25],
  E: [47, 4, 66, 25], S: [4, 4, 21, 25], $: [25, 4, 41, 25], ' ': [0, 0, 13, 0],
};

function addChar(ch: string, Xstart: number, Ystart: number, Alpha: number): number {
  const c = CHARS[ch] ?? [0, 0, 0, 0];
  const src = rect(c[0], c[1], c[2], c[3]);
  const x = Math.trunc(Xstart);
  H.text.push([src, rect(x, Ystart, x + c[2] - c[0], Ystart + c[3] - c[1]), Alpha]);
  return c[2] - c[0];
}

function addString(s: string, Xstart: number, Ystart: number): void {
  let Transp = 0.2;
  for (const ch of s) {
    if (ch !== '0') Transp = 1;
    Xstart += addChar(ch, Xstart, Ystart, Transp);
  }
}

export function SetupHUDText(Experience: number, Money: number): void {
  H.CurrentExperience = Experience;
  H.CurrentMoney = Money;
  H.text = [];
  const W = GameConfig().InternalWidth;
  addChar('E', W / 2 - 57, 5, 1);
  addChar('$', W / 2 - 56, 31, 1);
  const pad = (n: number): string => (n < 0 ? `-${String(-n).padStart(6, '0')}` : String(n).padStart(7, '0'));
  addString(pad(Experience), W / 2 - 57 + 23, 5);
  addString(pad(Money), W / 2 - 57 + 23, 31);
}

function UpdateHUDProgressBars(ship: SpaceShip | null, EnergyStatus: number, dt: number): void {
  let ArmorStatus = 0;
  if (ship) ArmorStatus = ship.ArmorCurrentStatus / ship.ArmorInitialStatus;
  else EnergyStatus = 0;
  const anim = (Status: number, cur: number): number => {
    if (Status > cur) {
      cur += 0.5 * dt;
      if (cur > Status) cur = Status;
    } else if (Status < cur) {
      cur -= 0.5 * dt;
      if (cur < Status) cur = Status;
    }
    return cur;
  };
  H.CurrentDrawEnergyStatus = anim(EnergyStatus, H.CurrentDrawEnergyStatus);
  H.CurrentDrawArmorStatus = anim(ArmorStatus, H.CurrentDrawArmorStatus);
  const lastE = Math.ceil(Math.fround(H.CurrentDrawEnergyStatus * SEGMENTS));
  const lastA = Math.ceil(Math.fround(H.CurrentDrawArmorStatus * SEGMENTS));
  if (lastA + lastE <= 0) return;
  H.bars = [];
  for (let i = 0; i < lastE; i++) {
    const src = rect(67 + i * 20, 0, 85 + i * 20, 64);
    H.bars.push([src, src, Math.min(1, H.CurrentDrawEnergyStatus * SEGMENTS - i)]);
  }
  for (let i = 0; i < lastA; i++) {
    const src = rect(582 + i * 20, 0, 599 + i * 20, 64);
    const dst = GameConfig().InternalWidth === 1024 ? src : rect(204 + 582 + i * 20, 0, 204 + 599 + i * 20, 64);
    H.bars.push([src, dst, Math.min(1, H.CurrentDrawArmorStatus * SEGMENTS - i)]);
  }
}

export function InitHUD(ship: SpaceShip | null, EnergyStatus: number, Experience: number, Money: number): void {
  H.LastUpdateTick = SDL_GetTicks();
  InitHUDParticleSystems();
  H.CurrentDrawEnergyStatus = EnergyStatus;
  if (ship) H.CurrentDrawArmorStatus = ship.ArmorCurrentStatus / ship.ArmorInitialStatus;
  H.bars = [];
  SetupHUDText(Experience, Money);
}

export function DrawHUD(): void {
  DrawHUDBorder();
  for (const s of particleSystems2D) s.Draw();
  for (const [src, dst, a] of H.bars) vw_Draw2D(dst, src, 'game/game_panel_el.tga', true, a);
  for (const [src, dst, a] of H.text) vw_Draw2D(dst, src, 'game/game_num.tga', true, a);
}

export function UpdateHUD(ship: SpaceShip | null, EnergyStatus: number): void {
  const now = SDL_GetTicks();
  const dt = (now - H.LastUpdateTick) / 1000;
  H.Blinking -= 1.9 * dt;
  if (H.Blinking < 0.1 || H.Blinking > 1) H.Blinking = 1;
  H.LastUpdateTick = now;
  UpdateHUDParticleSystems(ship, EnergyStatus);
  UpdateHUDProgressBars(ship, EnergyStatus, dt);
}

export const hudState = H;
