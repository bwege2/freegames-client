// AstroMenace 1.4.3 (Mikhail Kurinnoi, Viewizard; GPL-3.0-or-later), port of src/core/light/light.cpp
// (the lights' bookkeeping; OpenGL lighting is done by render/) and src/core/particle_system/
// particle_system.cpp (all of the simulation; drawing is in render/). Changed for the browser by the
// freegames project, 2026.
import {
  Vec3, fRand, fRand0, rotatePoint, mat33, m33InverseRotate, m33CreateRotate, m33CalcPoint, vwSqrtf, clamp,
} from './math.ts';

export const LightType = { Directional: 0, Point: 1 };
export type LightType = number;

export class Light {
  Diffuse = [0, 0, 0, 1];
  Specular = [0, 0, 0, 1];
  Ambient = [0, 0, 0, 1];
  ConstantAttenuation = 0;
  LinearAttenuation = 0;
  QuadraticAttenuation = 0;
  LinearAttenuationBase = 0;
  QuadraticAttenuationBase = 0;
  Direction = new Vec3();
  Location = new Vec3();
  On = true;
  released = false;
  type: LightType;
  constructor(type: LightType) {
    this.type = type;
  }
  SetLocation(l: Vec3): void {
    this.Location = l.clone();
  }
}

/** LightsMap (an unordered_multimap keyed by type: the order inside one type is creation order reversed) */
export const lights: Light[] = [];

const ATTENUATION_LIMIT = 10;

/** vw_CalculateAllPointLightsAttenuation: the affected lights sorted by attenuation */
export function calculateAllPointLightsAttenuation(loc: Vec3, radius2: number): Light[] {
  const out: [number, Light][] = [];
  for (const l of lights) {
    if (l.type !== LightType.Point || !l.On) continue;
    let att = l.ConstantAttenuation;
    const dx = loc.x - l.Location.x, dy = loc.y - l.Location.y, dz = loc.z - l.Location.z;
    let d2 = dx * dx + dy * dy + dz * dz;
    if (d2 > radius2) {
      d2 -= radius2;
      att += l.QuadraticAttenuation * d2;
      if (att < ATTENUATION_LIMIT && l.LinearAttenuation > 0) att += l.LinearAttenuation * vwSqrtf(d2);
    }
    if (att <= ATTENUATION_LIMIT) out.push([att, l]);
  }
  out.sort((a, b) => a[0] - b[0]);
  return out.map((x) => x[1]);
}

export function releaseLight(l: Light | null): void {
  if (!l || l.released) return;
  l.released = true;
  const i = lights.indexOf(l);
  if (i >= 0) lights.splice(i, 1);
}

export function releaseAllLights(): void {
  for (const l of lights) l.released = true;
  lights.length = 0;
}

export function createLight(type: LightType): Light {
  const l = new Light(type);
  lights.push(l);
  return l;
}

export function createPointLight(loc: Vec3, r: number, g: number, b: number, linear: number, quadratic: number): Light {
  const l = createLight(LightType.Point);
  l.Diffuse = [r, g, b, 1];
  l.Specular = [r, g, b, 1];
  l.LinearAttenuation = l.LinearAttenuationBase = linear;
  l.QuadraticAttenuation = l.QuadraticAttenuationBase = quadratic;
  l.Location = loc.clone();
  return l;
}

export function getMainDirectLight(): Light | null {
  return lights.find((l) => l.type === LightType.Directional) ?? null;
}

// ---- particle systems

export const ParticleCreationType = { Point: 0, Cube: 1, Tube: 2, Sphere: 3 };
export type ParticleCreationType = number;

export interface RGB { r: number; g: number; b: number }

export class Particle {
  Location = new Vec3();
  Velocity = new Vec3();
  NeedStop = false;
  Color: RGB = { r: 1, g: 0, b: 0 };
  ColorDelta: RGB = { r: 0, g: 0, b: 0 };
  Age = 0;
  Lifetime = 0;
  Size = 1;
  SizeDelta = 0;
  Alpha = 1;
  AlphaDelta = 0;
  AlphaShowHide = false;
  Show = true;

  Update(dt: number, parent: Vec3 = new Vec3(), magnet = false, magnetFactor = 25): boolean {
    if (this.Age + dt >= this.Lifetime) {
      this.Age = -1;
      return false;
    }
    this.Age += dt;
    this.Location.addTo(this.Velocity.mul(dt));
    if (this.NeedStop) this.Velocity.subFrom(this.Velocity.mul(dt));
    if (magnet) {
      const dir = parent.sub(this.Location);
      dir.Normalize();
      if (this.NeedStop) magnetFactor -= magnetFactor * dt;
      this.Velocity.addTo(dir.mul(magnetFactor * dt));
    }
    this.Color.r = clamp(this.Color.r + this.ColorDelta.r * dt, 0, 1);
    this.Color.g = clamp(this.Color.g + this.ColorDelta.g * dt, 0, 1);
    this.Color.b = clamp(this.Color.b + this.ColorDelta.b * dt, 0, 1);
    if (!this.AlphaShowHide) {
      this.Alpha += this.AlphaDelta * dt;
    } else {
      if (this.Show) {
        this.Alpha += this.AlphaDelta * dt;
        if (this.Alpha >= 1) {
          this.Alpha = 1;
          this.Show = false;
        }
      } else {
        this.Alpha -= this.AlphaDelta * dt;
      }
      this.Alpha = clamp(this.Alpha, 0, 1);
    }
    this.Size += this.SizeDelta * dt;
    return true;
  }
}

/** the camera location, for SizeCorrectionByCameraDist (set by game/camera.ts) */
export const particleCamera = { Location: new Vec3() };

let particleSystemQuality = 1;

export class ParticleSystem {
  Texture = '';
  TextureBlend = false;
  Direction = new Vec3();
  Angle = new Vec3();
  ParticlesPerSec = 100;
  NeedStop = false;
  SizeStart = 1;
  SizeVar = 0;
  SizeEnd = 1;
  AlphaStart = 1;
  AlphaVar = 0;
  AlphaEnd = 1;
  AlphaShowHide = false;
  ColorStart: RGB = { r: 1, g: 1, b: 1 };
  ColorVar: RGB = { r: 0, g: 0, b: 0 };
  ColorEnd: RGB = { r: 1, g: 1, b: 1 };
  Speed = 1;
  SpeedVar = 1;
  SpeedOnCreation = 1;
  CreationType = ParticleCreationType.Point;
  CreationSize = new Vec3(0.05, 0.05, 0.05);
  DeadZone = 0;
  CameraDistResize = 1;
  Life = 1;
  LifeVar = 0;
  Theta = 1;
  IsMagnet = false;
  MagnetFactor = 25;
  IsSuppressed = false;
  DestroyIfNoParticles = false;
  Age = 0;
  TimeLastUpdate = -1;
  EmissionResidue = 0;
  Light: Light | null = null;
  LightNeedDeviation = false;
  LightDeviation = 100;
  NextLightDeviation: number;
  LightDeviationSpeed: number;
  Location = new Vec3();
  PrevLocation = new Vec3();
  AABB: Vec3[] = Array.from({ length: 8 }, () => new Vec3(-1000000, 1000000, -1000000));
  /** forward_list: new particles at the front */
  ParticlesList: Particle[] = [];
  CurrentRotationMat = mat33();
  OldInvRotationMat = mat33();
  released = false;

  constructor() {
    // the member initializers call vw_fRand in this order
    this.NextLightDeviation = 0.7 + 0.3 * fRand();
    this.LightDeviationSpeed = 3.5 + 3.5 * fRand();
  }

  GetLocation(): Vec3 {
    return this.Location;
  }

  Update(time: number): boolean {
    if (this.TimeLastUpdate < 0) {
      this.TimeLastUpdate = time;
      return true;
    }
    const dt = time - this.TimeLastUpdate;
    if (dt === 0) return true;
    this.TimeLastUpdate = time;
    this.ParticlesList = this.ParticlesList.filter((p) => p.Update(dt, this.Location, this.IsMagnet, this.MagnetFactor));
    const needed = (this.ParticlesPerSec / particleSystemQuality) * dt + this.EmissionResidue;
    let created = Math.trunc(needed);
    if (!this.IsSuppressed) {
      this.EmissionResidue = needed - created;
    } else {
      this.EmissionResidue = needed;
      created = 0;
    }
    if (created > 0) this.EmitParticles(created, dt);
    if (this.DestroyIfNoParticles && !this.ParticlesList.length) return false;
    if (this.Light && !this.Light.released) this.UpdateLight(dt);
    this.CalculateAABB();
    return true;
  }

  private EmitParticles(quantity: number, dt: number): void {
    let locCorr = new Vec3();
    let dtCorr = 0;
    if (quantity > 1) {
      locCorr = this.PrevLocation.sub(this.Location).div(quantity);
      dtCorr = dt / quantity;
    }
    while (quantity > 0) {
      const p = new Particle();
      this.ParticlesList.unshift(p);
      p.Age = 0;
      p.Lifetime = this.Life + fRand0() * this.LifeVar;
      if (p.Lifetime < 0) p.Lifetime = 0;
      p.Color.r = this.ColorStart.r + fRand0() * this.ColorVar.r;
      p.Color.g = this.ColorStart.g + fRand0() * this.ColorVar.g;
      p.Color.b = this.ColorStart.b + fRand0() * this.ColorVar.b;
      p.Color.r = clamp(p.Color.r, 0, 1);
      p.Color.g = clamp(p.Color.g, 0, 1);
      p.Color.b = clamp(p.Color.b, 0, 1);
      p.ColorDelta.r = (this.ColorEnd.r - p.Color.r) / p.Lifetime;
      p.ColorDelta.g = (this.ColorEnd.g - p.Color.g) / p.Lifetime;
      p.ColorDelta.b = (this.ColorEnd.b - p.Color.b) / p.Lifetime;
      p.Alpha = clamp(this.AlphaStart + fRand0() * this.AlphaVar, 0, 1);
      p.AlphaDelta = (this.AlphaEnd - p.Alpha) / p.Lifetime;
      p.AlphaShowHide = this.AlphaShowHide;
      if (p.AlphaShowHide) {
        p.AlphaDelta = (2 - this.AlphaEnd * 2) / p.Lifetime;
        p.Alpha = this.AlphaEnd;
      }
      switch (this.CreationType) {
        case ParticleCreationType.Point:
          p.Location = this.Location.add(new Vec3(fRand0() * this.CreationSize.x, fRand0() * this.CreationSize.y, fRand0() * this.CreationSize.z));
          break;
        case ParticleCreationType.Cube: {
          const c = new Vec3((1 - fRand() * 2) * this.CreationSize.x, (1 - fRand() * 2) * this.CreationSize.y, (1 - fRand() * 2) * this.CreationSize.z);
          m33CalcPoint(c, this.CurrentRotationMat);
          p.Location = this.Location.add(c);
          break;
        }
        case ParticleCreationType.Tube: {
          const c = new Vec3((0.5 - fRand()) * this.CreationSize.x, (0.5 - fRand()) * this.CreationSize.y, (0.5 - fRand()) * this.CreationSize.z);
          m33CalcPoint(c, this.CurrentRotationMat);
          p.Location = this.Location.add(c);
          break;
        }
        case ParticleCreationType.Sphere: {
          const c = new Vec3(fRand0() * this.CreationSize.x, fRand0() * this.CreationSize.y, fRand0() * this.CreationSize.z);
          if (this.DeadZone > 0) {
            const d2 = c.x * c.x + c.y * c.y + c.z * c.z;
            if (d2 < this.DeadZone * this.DeadZone) {
              c.scale(this.DeadZone / vwSqrtf(d2));
              c.x = clamp(c.x, -this.CreationSize.x, this.CreationSize.x);
              c.y = clamp(c.y, -this.CreationSize.y, this.CreationSize.y);
              c.z = clamp(c.z, -this.CreationSize.z, this.CreationSize.z);
            }
          }
          m33CalcPoint(c, this.CurrentRotationMat);
          p.Location = this.Location.add(c);
          break;
        }
      }
      p.Size = this.SizeStart + fRand0() * this.SizeVar;
      if (p.Size < 0) p.Size = this.SizeStart;
      p.SizeDelta = (this.SizeEnd - p.Size) / p.Lifetime;
      if (this.CameraDistResize < 1) this.SizeCorrectionByCameraDist(p);
      p.Velocity = this.Direction.clone();
      if (this.Theta !== 0) {
        const ax = this.Theta * fRand0() / 2;
        const ay = this.Theta * fRand0() / 2;
        rotatePoint(p.Velocity, new Vec3(ax, ay, 0));
      }
      p.NeedStop = this.NeedStop;
      let ns = this.Speed + fRand0() * this.SpeedVar;
      if (ns < 0) ns = 0;
      p.Velocity.scale(ns);
      quantity--;
      if (quantity > 0) {
        p.Location.addTo(locCorr.mul(quantity));
        if (!p.Update(dtCorr * quantity, this.Location, this.IsMagnet, this.MagnetFactor)) this.ParticlesList.shift();
      }
    }
  }

  private SizeCorrectionByCameraDist(p: Particle): void {
    const cam = particleCamera.Location;
    const sx = cam.x - this.Location.x - this.CreationSize.x, sy = cam.y - this.Location.y - this.CreationSize.y, sz = cam.z - this.Location.z - this.CreationSize.z;
    const syst = sx * sx + sy * sy + sz * sz;
    const px = cam.x - p.Location.x, py = cam.y - p.Location.y, pz = cam.z - p.Location.z;
    const pd = px * px + py * py + pz * pz;
    if (pd < syst) {
      const f = (1 - this.CameraDistResize) * (syst - pd) / syst;
      const start = this.SizeStart - this.SizeStart * f;
      const end = this.SizeEnd - this.SizeEnd * f;
      const v = this.SizeVar - this.SizeVar * f;
      p.Size = start + fRand0() * v;
      if (p.Size < 0) p.Size = 0;
      p.SizeDelta = (end - p.Size) / p.Lifetime;
    }
  }

  private UpdateLight(dt: number): void {
    if (!this.IsSuppressed) {
      if (this.LightNeedDeviation) {
        if (this.LightDeviation > 1) this.LightDeviation = 0.7;
        if (this.NextLightDeviation < this.LightDeviation) {
          this.LightDeviation -= this.LightDeviationSpeed * dt;
          if (this.NextLightDeviation >= this.LightDeviation) {
            this.LightDeviation = this.NextLightDeviation;
            this.LightDeviationSpeed = 3.5 + 3.5 * fRand();
            this.NextLightDeviation = 0.7 + 0.3 * fRand();
          }
        } else {
          this.LightDeviation += this.LightDeviationSpeed * dt;
          if (this.NextLightDeviation <= this.LightDeviation) {
            this.LightDeviation = this.NextLightDeviation;
            this.LightDeviationSpeed = 3.5 + 3.5 * fRand();
            this.NextLightDeviation = 0.7 - 0.3 * fRand();
          }
        }
      } else if (this.LightDeviation > 1) {
        this.LightDeviation = 1;
      }
    } else if (this.Life !== 0) {
      this.LightDeviation += (25 / this.Life) * dt;
    }
    const l = this.Light!;
    if (l.LinearAttenuationBase !== 0) {
      l.LinearAttenuation = l.LinearAttenuationBase + 2 * (this.LightDeviation - 0.5) * l.LinearAttenuationBase;
      if (l.LinearAttenuation < l.LinearAttenuationBase) l.LinearAttenuation = l.LinearAttenuationBase;
    }
    if (l.QuadraticAttenuationBase !== 0) {
      l.QuadraticAttenuation = l.QuadraticAttenuationBase + 2 * (this.LightDeviation - 0.5) * l.QuadraticAttenuationBase;
      if (l.QuadraticAttenuation < l.QuadraticAttenuationBase) l.QuadraticAttenuation = l.QuadraticAttenuationBase;
    }
    l.On = this.ParticlesList.length > 0;
  }

  private CalculateAABB(): void {
    let minX: number, minY: number, minZ: number, maxX: number, maxY: number, maxZ: number;
    const f = this.ParticlesList.length ? this.ParticlesList[0].Location : this.Location;
    minX = maxX = f.x; minY = maxY = f.y; minZ = maxZ = f.z;
    for (const p of this.ParticlesList) {
      if (p.Alpha > 0 && p.Size > 0) {
        if (maxX < p.Location.x + p.Size) maxX = p.Location.x + p.Size;
        if (maxY < p.Location.y + p.Size) maxY = p.Location.y + p.Size;
        if (maxZ < p.Location.z + p.Size) maxZ = p.Location.z + p.Size;
        if (minX > p.Location.x - p.Size) minX = p.Location.x - p.Size;
        if (minY > p.Location.y - p.Size) minY = p.Location.y - p.Size;
        if (minZ > p.Location.z - p.Size) minZ = p.Location.z - p.Size;
      }
    }
    this.AABB[0].set(maxX, maxY, maxZ);
    this.AABB[6].set(minX, minY, minZ);
  }

  SetStartLocation(l: Vec3): void {
    this.Location = l.clone();
    this.PrevLocation = l.clone();
    if (this.Light && !this.Light.released) this.Light.SetLocation(this.Location);
  }

  MoveSystem(l: Vec3): void {
    if (this.Location.equals(l)) return;
    const d = l.sub(this.Location);
    this.Location = l.clone();
    this.PrevLocation = l.clone();
    for (const p of this.ParticlesList) p.Location.addTo(d);
    if (this.Light && !this.Light.released) this.Light.SetLocation(this.Location);
  }

  MoveSystemLocation(l: Vec3): void {
    if (this.Location.equals(l)) return;
    this.PrevLocation = this.Location;
    this.Location = l.clone();
    if (this.Light && !this.Light.released) this.Light.SetLocation(this.Location);
  }

  RotateSystemByAngle(a: Vec3): void {
    this.Angle = a.clone();
    this.OldInvRotationMat = Float64Array.from(this.CurrentRotationMat);
    m33InverseRotate(this.OldInvRotationMat);
    m33CreateRotate(this.CurrentRotationMat, this.Angle);
    m33CalcPoint(this.Direction, this.OldInvRotationMat);
    m33CalcPoint(this.Direction, this.CurrentRotationMat);
  }

  RotateSystemAndParticlesByAngle(a: Vec3): void {
    this.RotateSystemByAngle(a);
    for (const p of this.ParticlesList) {
      const t = p.Location.sub(this.Location);
      m33CalcPoint(t, this.OldInvRotationMat);
      m33CalcPoint(t, this.CurrentRotationMat);
      p.Location = t.add(this.Location);
    }
  }

  RotateParticlesByAngle(a: Vec3): void {
    const inv = Float64Array.from(this.CurrentRotationMat);
    m33InverseRotate(inv);
    const r = mat33();
    m33CreateRotate(r, a);
    for (const p of this.ParticlesList) {
      const t = p.Location.sub(this.Location);
      m33CalcPoint(t, inv);
      m33CalcPoint(t, r);
      m33CalcPoint(t, this.CurrentRotationMat);
      p.Location = t.add(this.Location);
    }
  }

  StopAllParticles(): void {
    this.Speed = 0;
    this.IsMagnet = false;
    for (const p of this.ParticlesList) p.Velocity = new Vec3();
  }

  ChangeSpeed(v: Vec3): void {
    for (const p of this.ParticlesList) p.Velocity.addTo(v);
  }
}

/** ParticleSystemsList: a forward_list, new systems at the front */
export const particleSystems: ParticleSystem[] = [];

export function initParticleSystems(quality: number): void {
  particleSystemQuality = quality;
}

export function createParticleSystem(): ParticleSystem {
  const ps = new ParticleSystem();
  particleSystems.unshift(ps);
  return ps;
}

export function releaseParticleSystem(ps: ParticleSystem | null): void {
  if (!ps || ps.released) return;
  const i = particleSystems.indexOf(ps);
  if (i >= 0) particleSystems.splice(i, 1);
  destroyParticleSystem(ps);
}

function destroyParticleSystem(ps: ParticleSystem): void {
  ps.released = true;
  releaseLight(ps.Light);
}

export function releaseAllParticleSystems(): void {
  for (const ps of particleSystems) destroyParticleSystem(ps);
  particleSystems.length = 0;
  particleSystemQuality = 1;
}

export function updateAllParticleSystems(time: number): void {
  for (let i = 0; i < particleSystems.length;) {
    const ps = particleSystems[i];
    if (!ps.Update(time)) {
      particleSystems.splice(i, 1);
      destroyParticleSystem(ps);
    } else {
      i++;
    }
  }
}

/** a weak_ptr's lock(): the object, or null once it was released */
export function alive<T extends { released: boolean }>(x: T | null | undefined): T | null {
  return x && !x.released ? x : null;
}
