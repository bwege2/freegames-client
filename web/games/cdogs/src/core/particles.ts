// C-Dogs SDL 2.5.0, translated: particles (particle.c), emitters (emitter.c) and actor animations (animation.c).
// GPL-2.0-or-later / BSD-2-Clause (web/games/cdogs/LICENSE.md).
import {
  MPI, RAND_DOUBLE, RAND_FLOAT, RAND_INT, Z_FACTOR, ColorEquals, colorTransparent, f32, fabsf, nearly_equal, rand,
  svec2, svec2_add, svec2_distance_squared, svec2_is_zero, svec2_one, svec2_rotate, svec2_scale, svec2_subtract,
  svec2_zero, type Vec2,
} from './base.ts';
import { CPicCopyPic, CPicUpdate } from './pics.ts';
import {
  COLLISIONTEAM_NONE, GetWallBouncePosVel, gMap, MapGetTile, MapRemoveThing, MapTryMoveThing, newThing, OverlapThings,
  TileIsShootable,
} from './map.ts';
import {
  DRAWFUNC_PARTICLE, KIND_PARTICLE, PARTICLE_CHAR_SPRITE, PARTICLE_PIC, PARTICLE_TEXT, THING_DRAW_ABOVE,
  THING_DRAW_BELOW, type AddParticle, type Animation, type Emitter, type Particle, type ParticleClass,
} from './types.ts';
import { GAME_EVENT_ADD_PARTICLE, GAME_EVENT_PARTICLE_REMOVE, GameEventNew, GameEventsEnqueue, gGameEvents } from './events.ts';
import { gCampaign, gParticles, IsPVP } from './state.ts';
import { ActorGetByUID, ActorGetCharacter } from './actors.ts';

// --- emitter.c --------------------------------------------------------------------------------------------------

export function newEmitter(): Emitter {
  return {
    p: null, offset: svec2_zero(), minSpeed: 0, maxSpeed: 0, minDZ: 0, maxDZ: 0, minRotation: 0, maxRotation: 0,
    ticksPerEmit: 0, counter: 0,
  };
}
/** minSpeed/maxSpeed are floats, minRotation/maxRotation doubles: pass f32() for float literals */
export function EmitterInit(em: Emitter, p: ParticleClass | null, offset: Vec2, minSpeed: number, maxSpeed: number,
  minDZ: number, maxDZ: number, minRotation: number, maxRotation: number, ticksPerEmit: number): void {
  em.p = p;
  em.offset = offset;
  em.minSpeed = f32(minSpeed);
  em.maxSpeed = f32(maxSpeed);
  em.minDZ = minDZ;
  em.maxDZ = maxDZ;
  em.minRotation = minRotation;
  em.maxRotation = maxRotation;
  em.ticksPerEmit = ticksPerEmit;
  em.counter = 0;
}
export function EmitterStart(em: Emitter, data: AddParticle): void {
  const p = svec2_add(data.Pos, em.offset);
  const e = GameEventNew(GAME_EVENT_ADD_PARTICLE);
  const ap: AddParticle = { ...data, Pos: p, Vel: { ...data.Vel }, DrawScale: { ...data.DrawScale }, Mask: { ...data.Mask } };
  e.u = ap;
  ap.Z = f32(ap.Z * Z_FACTOR);
  if (ap.Class == null) ap.Class = em.p;
  const speed = RAND_FLOAT(em.minSpeed, em.maxSpeed);
  const baseVel = svec2_rotate(svec2(0, speed), RAND_FLOAT(0, f32(MPI * 2)));
  ap.Vel = svec2_add(data.Vel, baseVel);
  if (Number.isNaN(data.Angle)) ap.Angle = RAND_FLOAT(0, f32(MPI * 2));
  ap.DZ = RAND_FLOAT(em.minDZ, em.maxDZ);
  ap.Spin = RAND_DOUBLE(em.minRotation, em.maxRotation);
  if (ap.Text.length === 0 && ap.Class!.Type === PARTICLE_TEXT) ap.Text = ap.Class!.Text.Value ?? '';
  GameEventsEnqueue(gGameEvents, e);
}
export function EmitterUpdate(em: Emitter, data: AddParticle, ticks: number): void {
  if (em.ticksPerEmit > 0) {
    em.counter -= ticks;
    if (em.counter <= 0) {
      EmitterStart(em, data);
      em.counter += em.ticksPerEmit;
    }
  }
}
export function EmitterReset(em: Emitter): void {
  em.counter = 0;
}

// --- animation.c --------------------------------------------------------------------------------------------------

export const ACTORANIMATION_STAND = 0;
export const ACTORANIMATION_IDLE = 1;
export const ACTORANIMATION_WALKING = 2;
export const IDLEHEAD_NORMAL = 0;
export const IDLEHEAD_LEFT = 1;
export const IDLEHEAD_RIGHT = 2;
export const ANIMATION_MAX_FRAMES = 8;
const pad8 = (a: number[]): number[] => [...a, ...new Array(ANIMATION_MAX_FRAMES - a.length).fill(0)];
export function AnimationGetActorAnimation(aa: number): Animation {
  switch (aa) {
    case ACTORANIMATION_STAND:
      return { Type: ACTORANIMATION_STAND, frame: 0, frames: pad8([IDLEHEAD_NORMAL]), ticksPerFrame: pad8([1]), frameCounter: 0, randomFrames: false, newFrame: true };
    case ACTORANIMATION_WALKING:
      return { Type: ACTORANIMATION_WALKING, frame: 0, frames: [0, 1, 2, 3, 4, 5, 6, 7], ticksPerFrame: [4, 4, 4, 4, 4, 4, 4, 4], frameCounter: 0, randomFrames: false, newFrame: true };
    default:
      return {
        Type: ACTORANIMATION_IDLE, frame: 0, frames: pad8([IDLEHEAD_NORMAL, IDLEHEAD_LEFT, IDLEHEAD_RIGHT]),
        ticksPerFrame: pad8([90, 60, 60]), frameCounter: 0, randomFrames: true, newFrame: true,
      };
  }
}
/** ticks is a float */
export function AnimationUpdate(a: Animation, ticks: number): void {
  a.frameCounter = f32(a.frameCounter + ticks);
  a.newFrame = false;
  if (a.frameCounter > a.ticksPerFrame[a.frame]) {
    a.frameCounter = f32(a.frameCounter - a.ticksPerFrame[a.frame]);
    a.newFrame = true;
    if (a.randomFrames) {
      if (a.frame === 0) {
        do {
          a.frame = (rand() % (ANIMATION_MAX_FRAMES - 1)) + 1;
        } while (a.ticksPerFrame[a.frame] < 0);
      } else {
        a.frame = 0;
      }
    } else {
      a.frame++;
      if (a.frame >= ANIMATION_MAX_FRAMES || a.ticksPerFrame[a.frame] < 0) a.frame = 0;
    }
  }
}
export function AnimationGetFrame(a: Animation): number {
  return a.frames[a.frame];
}

// --- particle.c -------------------------------------------------------------------------------------------------

const MAX_PARTICLES = 4096;
export const BULLET_Z = 10;

export function ParticlesUpdate(particles: Particle[], ticks: number): void {
  let maxParticleAge = -1;
  let maxParticleId = -1;
  let numParticles = 0;
  for (let i = 0; i < particles.length; i++) {
    const p = particles[i];
    if (!p.isInUse) continue;
    if (!ParticleUpdate(p, ticks)) {
      const e = GameEventNew(GAME_EVENT_PARTICLE_REMOVE);
      e.u.ParticleRemoveId = i;
      GameEventsEnqueue(gGameEvents, e);
    } else {
      if (p.Count > maxParticleAge) {
        maxParticleAge = p.Count;
        maxParticleId = i;
      }
      numParticles++;
    }
  }
  if (numParticles > MAX_PARTICLES && maxParticleId >= 0) {
    const e = GameEventNew(GAME_EVENT_PARTICLE_REMOVE);
    e.u.ParticleRemoveId = maxParticleId;
    GameEventsEnqueue(gGameEvents, e);
  }
}

function ParticleUpdate(p: Particle, ticks: number): boolean {
  if (p.Class.Type === PARTICLE_PIC && p.Pic) CPicUpdate(p.Pic, ticks);
  p.Count += ticks;
  const startPos = p.Pos;
  if (p.isAttached) {
    const a = ActorGetByUID(p.ActorUID);
    if (a != null) p.Pos = svec2_add(p.Pos, svec2_subtract(a.thing.Pos, a.thing.LastPos));
  }
  for (let i = 0; i < ticks; i++) {
    p.Pos = svec2_add(p.Pos, p.thing.Vel);
    p.Z = f32(p.Z + p.DZ);
    if (p.Class.GravityFactor !== 0) {
      if (p.Z <= 0) {
        p.Z = 0;
        if (p.Class.Bounces) {
          p.DZ = f32(-p.DZ / 2);
          p.thing.Vel = svec2_scale(p.thing.Vel, f32(1 - p.Class.BounceFriction));
        } else {
          p.DZ = 0;
        }
      } else {
        p.DZ = f32(p.DZ - p.Class.GravityFactor);
      }
      if (fabsf(p.DZ) < Math.abs(p.Class.GravityFactor) && nearly_equal(p.Z, 0, f32(0.1))) {
        p.thing.Vel = svec2_zero();
        p.Spin = 0;
        p.thing.flags |= THING_DRAW_BELOW;
        break;
      }
    }
  }
  if (!svec2_is_zero(p.thing.Vel) && p.Class.HitsWalls) {
    const data = { ColPos: svec2_zero(), ColNormal: svec2_zero(), ColPosDist2: -1 };
    OverlapThings(p.thing, startPos, p.thing.Vel, p.thing.size,
      { ThingMask: 0, Team: COLLISIONTEAM_NONE, IsPVP: IsPVP(gCampaign.Entry.Mode), AllActors: false }, null,
      (tilePos) => {
        const t = MapGetTile(gMap, tilePos);
        return t == null || TileIsShootable(t);
      },
      (_tilePos, col, normal) => {
        const d2 = svec2_distance_squared(col, p.thing.Pos);
        if (data.ColPosDist2 < 0 || d2 < data.ColPosDist2) {
          data.ColPos = col;
          data.ColPosDist2 = d2;
          data.ColNormal = normal;
        }
        return true;
      });
    if (data.ColPosDist2 >= 0) {
      if (p.Class.WallBounces) {
        const r = GetWallBouncePosVel(startPos, p.thing.Vel, data.ColPos, data.ColNormal);
        p.Pos = r.pos;
        p.thing.Vel = r.vel;
      } else {
        p.thing.Vel = svec2_zero();
      }
    }
  }
  if (!MapTryMoveThing(gMap, p.thing, p.Pos)) return false;
  p.Angle += p.Spin;
  if (p.Angle > 2 * MPI) p.Angle -= 2 * MPI;
  if (p.Angle < 0) p.Angle += 2 * MPI;
  return p.Count <= p.Range;
}

export function ParticleAdd(particles: Particle[], add: AddParticle): number {
  let i = particles.findIndex((s) => !s.isInUse);
  if (i < 0) {
    i = particles.length;
    particles.push(null as unknown as Particle);
  }
  const cls = add.Class!;
  const p: Particle = {
    Class: cls, Pic: null, Text: '', Char: null, ActorUID: add.ActorUID, Pos: add.Pos, Z: f32(add.Z), Angle: add.Angle,
    DZ: f32(add.DZ), Spin: add.Spin, Count: 0, Range: 0, thing: newThing(i, KIND_PARTICLE, { x: 0, y: 0 }, 0),
    isAttached: false, isInUse: false,
  };
  particles[i] = p;
  switch (cls.Type) {
    case PARTICLE_PIC:
      p.Pic = CPicCopyPic(cls.Pic);
      break;
    case PARTICLE_TEXT:
      p.Text = add.Text;
      break;
    case PARTICLE_CHAR_SPRITE: {
      const actor = ActorGetByUID(add.ActorUID);
      if (actor) p.Char = ActorGetCharacter(actor);
      break;
    }
    default:
      break;
  }
  p.Range = RAND_INT(cls.RangeLow, cls.RangeHigh);
  p.isInUse = true;
  p.thing.Vel = { ...add.Vel };
  p.thing.drawFunc = DRAWFUNC_PARTICLE;
  p.thing.drawData.MobObjId = i;
  p.thing.drawData.Scale = svec2_is_zero(add.DrawScale) ? svec2_one() : { ...add.DrawScale };
  if (!ColorEquals(add.Mask, colorTransparent) && p.Pic) p.Pic.Mask = { ...add.Mask };
  if (cls.DrawBelow) p.thing.flags |= THING_DRAW_BELOW;
  if (cls.DrawAbove) p.thing.flags |= THING_DRAW_ABOVE;
  p.isAttached = add.IsAttached;
  MapTryMoveThing(gMap, p.thing, add.Pos);
  return i;
}
export function ParticleDestroy(particles: Particle[], id: number): void {
  const p = particles[id];
  if (!p || !p.isInUse) return;
  MapRemoveThing(gMap, p.thing);
  p.isInUse = false;
}
export function ParticlesTerminate(): void {
  for (let i = 0; i < gParticles.length; i++) if (gParticles[i].isInUse) ParticleDestroy(gParticles, i);
  gParticles.length = 0;
}
export { PARTICLE_CHAR_SPRITE };
