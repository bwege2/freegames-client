// C-Dogs SDL 2.5.0, translated: map objects and mobile objects (objs.c), bullets in flight (bullet_class.c:
// BulletUpdate, BulletAdd, BulletBounce, PlayHitSound) and damage (damage.c). GPL-2.0-or-later / BSD-2-Clause
// (web/games/cdogs/LICENSE.md).
import {
  EPSILON_POS, FLT_EPSILON, MAX, MIN, MPI_2, RAND_FLOAT, RAND_INT, RAND_MAX, TILE_HEIGHT, TILE_WIDTH, Vec2FromRadians,
  Vec2ToTile, ColorEquals, colorTransparent, colorWhite, f32, fabsf, rand, sqrtf, svec2, svec2_add, svec2_angle,
  svec2_assign_vec2i, svec2_distance_squared, svec2_divide, svec2_is_nearly_equal, svec2_is_zero, svec2_length,
  svec2_length_squared, svec2_normalize, svec2_scale, svec2_subtract, svec2_zero, svec2i_add, svec2i_zero,
  type Vec2, type Vec2i,
} from './base.ts';
import {
  COLLISIONTEAM_NONE, FLAGS_GOOD_GUY, GetWallBouncePosVel, gMap, MapGetTile, MapIsTileIn, MapRemoveThing,
  MapTryMoveThing, newThing, OverlapThings, PathCacheClear, ThingUpdate, TileHasCharacter, TileIsOpaque,
  TileIsShootable,
} from './map.ts';
import {
  CPICFUNC_BULLET, CPICFUNC_MAPOBJECT, KIND_CHARACTER, KIND_MOBILEOBJECT, KIND_OBJECT, MAP_OBJECT_TYPE_ACTOR_SPAWNER,
  MAP_OBJECT_TYPE_NORMAL, MAP_OBJECT_TYPE_PICKUP_SPAWNER, PARTICLE_PIC, PICKUP_AMMO, PICKUP_GUN, PICKUP_HEALTH,
  SOUND_LOCK_THING, THING_CAN_BE_SHOT, THING_IMPASSABLE, THING_OBJECTIVE, type BulletClass,
  type TActor, type TMobileObject, type TObject, type Thing, type WeaponClass,
} from './types.ts';
import { CPicClone, CPicGetPic, PicGetRandomColor } from './pics.ts';
import {
  AmmoGetById, AmmoGetNumClasses, StrBulletClass, StrMapObject, StrParticleClass, StrWeaponClass, MapObjectGetFlags,
  WeaponUsagesUpdate,
} from './classes.ts';
import { ConfigGetBool } from './config.ts';
import {
  GAME_EVENT_ACTOR_IMPULSE, GAME_EVENT_ADD_BULLET, GAME_EVENT_ADD_PARTICLE, GAME_EVENT_ADD_PICKUP,
  GAME_EVENT_BULLET_BOUNCE, GAME_EVENT_GUN_FIRE, GAME_EVENT_MAP_OBJECT_ADD,
  GAME_EVENT_MAP_OBJECT_REMOVE, GAME_EVENT_REMOVE_BULLET, GAME_EVENT_SCORE, GAME_EVENT_SOUND_AT,
  GAME_EVENT_THING_DAMAGE, GameEventNew, GameEventsEnqueue, gGameEvents, uidCounters, type GameEvent, type GameEventU,
} from './events.ts';
import { gActors, gCampaign, gMission, gMobObjs, gObjs, IsPVP } from './state.ts';
import { gSoundDevice, SoundPlayAt } from './sounds.ts';
import { OBJECTIVE_DESTROY } from './mission.ts';
import { EmitterInit, EmitterStart, EmitterUpdate, newEmitter } from './particles.ts';
import { newAddParticle } from './events.ts';
import {
  ActorGetByUID, ActorGetCharacter, ActorIsInvulnerable, ActorTakesDamage, FLAGS_HURTALWAYS, FLAGS_PENALTY,
  GameEventNewActorAdd,
} from './actors.ts';
import { AIGetClosestEnemy } from './ai.ts';
import { PlayerDataGetByUID } from './player.ts';
import { UpdateMissionObjective } from './missionrun.ts';

export const HIT_NONE = 0;
export const HIT_WALL = 1;
export const HIT_OBJECT = 2;
export const HIT_FLESH = 3;
export const SHOT_IMPULSE_FACTOR = f32(0.04);
export const BULLET_Z = 10;
export const OBJECT_SCORE = 50;
export const PENALTY_MULTIPLIER = -3;
export const CHARACTER_DEFAULT_MASS = 100;
export const AMMO_SPAWNER_RESPAWN_TICKS = 70 * 30;
const WALL_MARK_Z = 5;

export const ObjsGetNextUID = (): number => uidCounters.objs++;
export const MobObjsObjsGetNextUID = (): number => uidCounters.mobObjs++;
export function ObjsInit(): void {
  gObjs.length = 0;
  uidCounters.objs = 0;
}
export function MobObjsInit(): void {
  gMobObjs.length = 0;
  uidCounters.mobObjs = 0;
}

// --- damage.c --------------------------------------------------------------------------------------------------

export function CanHitCharacter(flags: number, uid: number, actor: TActor): boolean {
  return !(!(flags & FLAGS_HURTALWAYS) && (uid === actor.uid || uid === actor.pilotUID));
}
export function CanDamageCharacter(flags: number, source: TActor | null, target: TActor, special: number): boolean {
  if (!CanHitCharacter(flags, source ? source.uid : -1, target)) return false;
  return !ActorIsInvulnerable(target, flags, source ? source.PlayerUID : -1, gCampaign.Entry.Mode, special);
}

// --- objs.c ----------------------------------------------------------------------------------------------------

const NUM_SPALL_PARTICLES = 3;
const SPALL_IMPULSE_FACTOR = 1.0;

export function DamageObject(d: GameEventU): void {
  const o = ObjGetByUID(d.UID)!;
  if (o.Health <= 0) return;
  const em = newEmitter();
  EmitterInit(em, null, svec2_zero(), f32(-0.5), f32(0.5), 1, 4, 0, 0, 0);
  const ap = newAddParticle();
  ap.Pos = o.thing.Pos;
  ap.Angle = NaN;
  ap.Z = 10;
  ap.Vel = svec2_scale(svec2_normalize(d.Vel), SPALL_IMPULSE_FACTOR);
  for (let i = 0; i < MIN(o.Health, d.Power); i++) {
    ap.Class = StrParticleClass(`spall${(rand() % NUM_SPALL_PARTICLES) + 1}`);
    ap.Mask = PicGetRandomColor(CPicGetPic(o.Class.Pic, 0)!);
    EmitterStart(em, ap);
  }
  o.Health -= d.Power;
  if (o.Health <= 0) {
    if (!gCampaign.IsClient) {
      const e = GameEventNew(GAME_EVENT_MAP_OBJECT_REMOVE);
      e.u.UID = o.uid;
      e.u.ActorUID = d.SourceActorUID;
      e.u.Flags = d.Flags;
      GameEventsEnqueue(gGameEvents, e);
    }
    EmitterInit(em, null, svec2_zero(), f32(-1.0), f32(1.0), 1, 16, 0, 0, 0);
    ap.Vel = svec2_scale(ap.Vel, f32(0.5));
    for (let i = 0; i < 20; i++) {
      ap.Class = StrParticleClass(`spall${(rand() % NUM_SPALL_PARTICLES) + 1}`);
      ap.Mask = PicGetRandomColor(CPicGetPic(o.Class.Pic, 0)!);
      EmitterStart(em, ap);
    }
  }
  const source = ActorGetByUID(d.SourceActorUID);
  const playerUID = source != null ? source.PlayerUID : -1;
  if (!gCampaign.IsClient && playerUID >= 0 && d.SourceWeaponClassName.length > 0) {
    const p = PlayerDataGetByUID(playerUID)!;
    WeaponUsagesUpdate(p.WeaponUsages, StrWeaponClass(d.SourceWeaponClassName), 0, 1);
  }
}

function AddPickupAtObject(o: TObject, type: number): void {
  const e = GameEventNew(GAME_EVENT_ADD_PICKUP);
  switch (type) {
    case PICKUP_HEALTH:
      if (!ConfigGetBool('Game.HealthPickups')) return;
      e.u.PickupClass = 'health';
      break;
    case PICKUP_AMMO: {
      if (!gCampaign.Setting.Ammo) return;
      const ammoId = rand() % AmmoGetNumClasses();
      e.u.PickupClass = `ammo_${AmmoGetById(ammoId)!.Name}`;
      break;
    }
    case PICKUP_GUN: {
      const gunId = rand() % gMission.Weapons.length;
      e.u.PickupClass = `gun_${gMission.Weapons[gunId].name}`;
      break;
    }
    default:
      break;
  }
  e.u.Pos = o.thing.Pos;
  e.u.IsRandomSpawned = true;
  GameEventsEnqueue(gGameEvents, e);
}

export function ObjRemove(mor: GameEventU): void {
  const o = ObjGetByUID(mor.UID)!;
  o.Health = 0;
  if (!gCampaign.IsClient) {
    UpdateMissionObjective(gMission, o.thing.flags, OBJECTIVE_DESTROY, 1);
    const a = ActorGetByUID(mor.ActorUID);
    const playerUID = a != null ? a.PlayerUID : -1;
    if ((o.thing.flags & THING_OBJECTIVE) && playerUID >= 0) {
      const e = GameEventNew(GAME_EVENT_SCORE);
      e.u.PlayerUID = playerUID;
      e.u.Score = OBJECT_SCORE;
      GameEventsEnqueue(gGameEvents, e);
    }
    for (const wc of o.Class.DestroyGuns) WeaponClassFire(wc, o.thing.Pos, 0, 0, mor.Flags, mor.ActorUID, true, false);
    if (!IsPVP(gCampaign.Entry.Mode)) {
      for (const mods of o.Class.DestroySpawn) {
        const chance = rand() / RAND_MAX;
        if (chance < mods.SpawnChance) AddPickupAtObject(o, mods.Type);
      }
    }
    if (o.Class.Wreck.Bullet.length > 0) {
      const e = GameEventNew(GAME_EVENT_ADD_BULLET);
      e.u.UID = MobObjsObjsGetNextUID();
      e.u.BulletClass = o.Class.Wreck.Bullet;
      e.u.MuzzlePos = o.thing.Pos;
      GameEventsEnqueue(gGameEvents, e);
    }
  }
  SoundPlayAt(gSoundDevice, o.Class.Wreck.Sound, o.thing.Pos);
  PlaceWreck(o.Class.Wreck.MO, o.thing);
  ObjDestroy(o);
  if (o.thing.flags & THING_IMPASSABLE) PathCacheClear();
}
function PlaceWreck(wreckClass: string | null, ti: Thing): void {
  if (wreckClass == null) return;
  const e = GameEventNew(GAME_EVENT_MAP_OBJECT_ADD);
  e.u.UID = ObjsGetNextUID();
  const mo = StrMapObject(wreckClass);
  if (mo == null) return;
  e.u.MapObjectClass = mo.Name;
  e.u.Pos = ti.Pos;
  e.u.ThingFlags = MapObjectGetFlags(mo);
  e.u.Health = mo.Health;
  GameEventsEnqueue(gGameEvents, e);
}
export function CanHit(b: BulletClass, flags: number, uid: number, target: Thing): boolean {
  switch (target.kind) {
    case KIND_CHARACTER: return b.Hit.Flesh.Hit && CanHitCharacter(flags, uid, gActors[target.id]);
    case KIND_OBJECT: return b.Hit.Object.Hit;
    default: return false;
  }
}
export function HasHitSound(targetKind: number, targetUID: number, special: number, allowFriendlyHitSound: boolean): boolean {
  switch (targetKind) {
    case KIND_CHARACTER: {
      const a = ActorGetByUID(targetUID)!;
      return allowFriendlyHitSound || ActorTakesDamage(a, special);
    }
    case KIND_OBJECT: return true;
    default: return false;
  }
}
export function Damage(hitVector: Vec2, bullet: BulletClass, weapon: WeaponClass | null, flags: number,
  source: TActor | null, targetKind: number, targetUID: number): void {
  switch (targetKind) {
    case KIND_CHARACTER:
      DoDamageCharacter(ActorGetByUID(targetUID)!, source, hitVector, bullet, weapon, flags);
      break;
    case KIND_OBJECT:
      DoDamageThing(targetKind, targetUID, source, flags, bullet, weapon, true, hitVector);
      break;
    default:
      break;
  }
}
function DoDamageThing(targetKind: number, targetUID: number, source: TActor | null, flags: number,
  bullet: BulletClass, weapon: WeaponClass | null, canDamage: boolean, hitVector: Vec2): void {
  const e = GameEventNew(GAME_EVENT_THING_DAMAGE);
  e.u.UID = targetUID;
  e.u.Kind = targetKind;
  e.u.SourceActorUID = source ? source.uid : -1;
  e.u.Flags = flags;
  BulletToDamageEvent(bullet, e);
  if (!canDamage) e.u.Power = 0;
  e.u.Vel = hitVector;
  if (weapon) e.u.SourceWeaponClassName = weapon.name;
  GameEventsEnqueue(gGameEvents, e);
}
function DoDamageCharacter(actor: TActor, source: TActor | null, hitVector: Vec2, bullet: BulletClass,
  weapon: WeaponClass | null, flags: number): void {
  const impulseFactor = f32(f32(f32(f32(bullet.Mass * SHOT_IMPULSE_FACTOR) * CHARACTER_DEFAULT_MASS)) /
    ActorGetCharacter(actor).Class!.Mass);
  const vel = svec2_scale(hitVector, impulseFactor);
  if (!svec2_is_zero(vel)) {
    const ei = GameEventNew(GAME_EVENT_ACTOR_IMPULSE);
    ei.u.UID = actor.uid;
    ei.u.Vel = vel;
    ei.u.Pos = actor.Pos;
    GameEventsEnqueue(gGameEvents, ei);
  }
  const canDamage = CanDamageCharacter(flags, source, actor, bullet.Special.Effect);
  DoDamageThing(KIND_CHARACTER, actor.uid, source, flags, bullet, weapon, canDamage, hitVector);
  if (canDamage) {
    const isFriendly = (actor.flags & FLAGS_GOOD_GUY) !== 0 || actor.pilotUID === -1 ||
      (!IsPVP(gCampaign.Entry.Mode) && actor.PlayerUID >= 0);
    if (source && source.PlayerUID >= 0 && bullet.Power !== 0 && !isFriendly) {
      const e = GameEventNew(GAME_EVENT_SCORE);
      e.u.PlayerUID = source.PlayerUID;
      e.u.Score = (actor.flags & FLAGS_PENALTY) ? PENALTY_MULTIPLIER * bullet.Power : bullet.Power;
      GameEventsEnqueue(gGameEvents, e);
    }
  }
}
export function UpdateMobileObjects(ticks: number): void {
  for (let i = 0; i < gMobObjs.length; i++) {
    const obj = gMobObjs[i];
    if (!obj.isInUse) continue;
    if (!BulletUpdate(obj, ticks) && !gCampaign.IsClient) {
      const e = GameEventNew(GAME_EVENT_REMOVE_BULLET);
      e.u.UID = obj.UID;
      GameEventsEnqueue(gGameEvents, e);
    }
  }
}
export function ObjAdd(amo: GameEventU): void {
  if (ObjGetByUID(amo.UID) != null) return;
  let i = gObjs.findIndex((o) => !o.isInUse);
  if (i < 0) {
    i = gObjs.length;
    gObjs.push(null as unknown as TObject);
  }
  const cls = StrMapObject(amo.MapObjectClass)!;
  const o: TObject = {
    uid: amo.UID, Class: cls, Health: amo.Health, counter: 0, thing: newThing(i, KIND_OBJECT, cls.Size, amo.ThingFlags),
    damageSmoke: newEmitter(), isInUse: false,
  };
  gObjs[i] = o;
  if (cls.Type === MAP_OBJECT_TYPE_ACTOR_SPAWNER) o.counter = cls.Character.Counter;
  o.thing.CPic = CPicClone(cls.Pic);
  o.thing.CPic.Mask = { ...amo.Mask };
  if (ColorEquals(o.thing.CPic.Mask, colorTransparent)) o.thing.CPic.Mask = { ...cls.Pic.Mask };
  o.thing.CPicFunc = CPICFUNC_MAPOBJECT;
  MapTryMoveThing(gMap, o.thing, amo.Pos);
  EmitterInit(o.damageSmoke, StrParticleClass(cls.DamageSmoke.ParticleClass), svec2_zero(), f32(-0.05), f32(0.05),
    3, 3, 0, 0, cls.DamageSmoke.Ticks);
  o.isInUse = true;
  if (o.thing.flags & THING_IMPASSABLE) PathCacheClear();
}
export function ObjDestroy(o: TObject): void {
  MapRemoveThing(gMap, o.thing);
  o.isInUse = false;
}
export function ObjIsDangerous(o: TObject): boolean {
  return o.Class.DestroyGuns.length > 0;
}
export function UpdateObjects(ticks: number): void {
  for (let i = 0; i < gObjs.length; i++) {
    const obj = gObjs[i];
    if (!obj.isInUse) continue;
    ThingUpdate(obj.thing, ticks);
    switch (obj.Class.Type) {
      case MAP_OBJECT_TYPE_NORMAL:
        if (obj.Class.DamageSmoke.HealthThreshold >= 0 &&
          obj.Health <= f32(obj.Class.Health * obj.Class.DamageSmoke.HealthThreshold)) {
          const ap = newAddParticle();
          const sx = Math.trunc(obj.thing.size.x / 4);
          const sy = Math.trunc(obj.thing.size.y / 4);
          const x = RAND_FLOAT(-sx, sx);
          const y = RAND_FLOAT(-sy, sy);
          ap.Pos = svec2_add(obj.thing.Pos, svec2(x, y));
          ap.Z = obj.Class.DamageSmoke.Z;
          ap.Mask = { ...colorWhite };
          EmitterUpdate(obj.damageSmoke, ap, ticks);
        }
        break;
      case MAP_OBJECT_TYPE_PICKUP_SPAWNER: {
        if (gCampaign.IsClient) break;
        if (obj.counter === -1) break;
        obj.counter -= ticks;
        if (obj.counter <= 0) {
          obj.counter = -1;
          const e = GameEventNew(GAME_EVENT_ADD_PICKUP);
          e.u.PickupClass = obj.Class.PickupClass!.Name;
          e.u.SpawnerUID = obj.uid;
          e.u.Pos = obj.thing.Pos;
          GameEventsEnqueue(gGameEvents, e);
        }
        break;
      }
      case MAP_OBJECT_TYPE_ACTOR_SPAWNER: {
        if (gCampaign.IsClient) break;
        if (obj.counter === -1) break;
        obj.counter -= ticks;
        if (obj.counter <= 0) {
          obj.counter = -1;
          let e = GameEventNewActorAdd(obj.thing.Pos, gCampaign.Setting.characters.OtherChars[obj.Class.Character.CharId], null);
          e.u.CharId = obj.Class.Character.CharId;
          GameEventsEnqueue(gGameEvents, e);
          e = GameEventNew(GAME_EVENT_MAP_OBJECT_REMOVE);
          e.u.UID = obj.uid;
          GameEventsEnqueue(gGameEvents, e);
        }
        break;
      }
      default:
        break;
    }
  }
}
export function ObjGetByUID(uid: number): TObject | null {
  for (const o of gObjs) if (o.uid === uid) return o;
  return null;
}
export function BulletToDamageEvent(b: BulletClass, e: GameEvent): void {
  e.u.Special = b.Special.Effect;
  e.u.SpecialTicks = b.Special.Ticks;
  e.u.Power = b.Power;
  e.u.Mass = b.Mass;
}
export function MobObjGetByUID(uid: number): TMobileObject | null {
  for (const o of gMobObjs) if (o.UID === uid) return o;
  return null;
}
export function ThingGetByUID(kind: number, uid: number): Thing | null {
  switch (kind) {
    case KIND_CHARACTER: {
      const a = ActorGetByUID(uid);
      return a ? a.thing : null;
    }
    case KIND_OBJECT: {
      const o = ObjGetByUID(uid);
      return o ? o.thing : null;
    }
    case KIND_MOBILEOBJECT: {
      const m = MobObjGetByUID(uid);
      return m ? m.thing : null;
    }
    default:
      return null;
  }
}

// --- weapon_class.c: WeaponClassFire -----------------------------------------------------------------------------

export function WeaponClassFire(wc: WeaponClass, pos: Vec2, z: number, radians: number, flags: number, actorUID: number,
  playSound: boolean, isGun: boolean): void {
  const e = GameEventNew(GAME_EVENT_GUN_FIRE);
  e.u.ActorUID = actorUID;
  e.u.Gun = wc.name;
  e.u.MuzzlePos = pos;
  e.u.Z = Math.trunc(z);
  e.u.Angle = f32(radians);
  e.u.Sound = playSound;
  e.u.Flags = flags;
  e.u.IsGun = isGun;
  GameEventsEnqueue(gGameEvents, e);
}

// --- bullet_class.c --------------------------------------------------------------------------------------------

function SeekTowards(pos: Vec2, vel: Vec2, speedMin: number, targetPos: Vec2, seekFactor: number): Vec2 {
  const targetVel = svec2_subtract(svec2_subtract(targetPos, pos), vel);
  if (fabsf(targetVel.x) > 40 || fabsf(targetVel.y) > 40 || svec2_is_zero(targetVel)) return vel;
  const targetMag = svec2_length(targetVel);
  const magnitude = MAX(speedMin, svec2_length(vel));
  const combinedX = f32(f32(f32(vel.x / magnitude) * seekFactor) + f32(targetVel.x / targetMag));
  const combinedY = f32(f32(f32(vel.y / magnitude) * seekFactor) + f32(targetVel.y / targetMag));
  return svec2(f32(f32(combinedX * magnitude) / (seekFactor + 1)), f32(f32(combinedY * magnitude) / (seekFactor + 1)));
}

interface HitResult { Type: number; Pos: Vec2; Normal: Vec2 }

export function BulletUpdate(obj: TMobileObject, ticks: number): boolean {
  const bc = obj.bulletClass;
  ThingUpdate(obj.thing, ticks);
  obj.count += ticks;
  if (obj.count < bc.Delay) return true;
  if (obj.range >= 0 && obj.count > obj.range) {
    if (!gCampaign.IsClient) FireGuns(obj, bc.OutOfRangeGuns);
    if (bc.OutOfRangeSpark != null) {
      const s = GameEventNew(GAME_EVENT_ADD_PARTICLE);
      s.u.Class = bc.OutOfRangeSpark;
      s.u.Pos = obj.thing.Pos;
      s.u.Z = obj.z;
      GameEventsEnqueue(gGameEvents, s);
    }
    return false;
  }
  if (bc.SeekFactor > 0) {
    const owner = ActorGetByUID(obj.ActorUID);
    if (owner == null) return false;
    const target = AIGetClosestEnemy(obj.thing.Pos, owner, obj.flags);
    if (target && !target.dead) {
      for (let i = 0; i < ticks; i++) {
        obj.thing.Vel = SeekTowards(obj.thing.Pos, obj.thing.Vel, bc.SpeedLow, target.Pos, bc.SeekFactor);
      }
    }
  }
  let pos = svec2_add(obj.thing.Pos, svec2_scale(obj.thing.Vel, ticks));
  let posStart = obj.thing.Pos;
  let vel = svec2_subtract(pos, obj.thing.Pos);
  let alive = true;
  let bounced = false;
  let hasHit = false;
  do {
    const hit = HitItem(obj, posStart, vel, bc.Persists);
    if (hit.Type === HIT_NONE) break;
    hasHit = true;
    bounced = hit.Type === HIT_WALL && !svec2_is_zero(obj.thing.Vel) && alive &&
      !svec2_is_nearly_equal(posStart, hit.Pos, EPSILON_POS);
    const hitPos = hit.Pos;
    if (bounced) {
      const r = GetWallBouncePosVel(posStart, obj.thing.Vel, hit.Pos, hit.Normal);
      pos = r.pos;
      obj.thing.Vel = r.vel;
      pos = svec2_add(hit.Pos, svec2_scale(svec2_subtract(pos, hit.Pos), bc.WallBounceElasticity));
      obj.thing.Vel = svec2_scale(obj.thing.Vel, bc.WallBounceElasticity);
    }
    if (!gCampaign.IsClient) {
      const b = GameEventNew(GAME_EVENT_BULLET_BOUNCE);
      b.u.UID = obj.UID;
      b.u.HitType = hit.Type;
      if ((hit.Type === HIT_WALL && bc.WallBounceElasticity === 0) ||
        (hit.Type === HIT_OBJECT && bc.Hit.Object.Hit) || (hit.Type === HIT_FLESH && bc.Hit.Flesh.Hit)) {
        b.u.Spark = true;
        FireGuns(obj, bc.HitGuns);
        if (hit.Type === HIT_WALL || !bc.Persists) alive = false;
        if (hit.Type === HIT_WALL && vel.y < 0 &&
          !TileIsOpaque(MapGetTile(gMap, Vec2ToTile(svec2(hit.Pos.x, f32(hit.Pos.y + 1)))))) {
          b.u.WallMark = true;
        }
      }
      b.u.Pos = hitPos;
      b.u.BouncePos = hitPos;
      b.u.Vel = obj.thing.Vel;
      if (bounced) b.u.Pos = pos;
      b.u.HitSound = obj.thing.SoundLock === 0;
      if (obj.thing.SoundLock <= 0) obj.thing.SoundLock += SOUND_LOCK_THING;
      GameEventsEnqueue(gGameEvents, b);
    }
    AddTrail(obj, posStart, bounced || !alive ? hit.Pos : pos, ticks);
    if (bounced) {
      const preBounceLen = svec2_length(svec2_subtract(hit.Pos, posStart));
      const fullLen = svec2_length(vel);
      const velNorm = svec2_normalize(obj.thing.Vel);
      posStart = svec2_add(hit.Pos, velNorm);
      vel = svec2_scale(velNorm, f32(f32(f32(fullLen - preBounceLen) - 1) * bc.WallBounceElasticity));
    }
  } while (alive && bounced && svec2_length_squared(vel) > 2);
  if (!alive) return false;
  AddTrail(obj, posStart, svec2_add(posStart, vel), ticks);
  if (hasHit && obj.thing.SoundLock === 0) obj.thing.SoundLock += SOUND_LOCK_THING;
  if (bc.Falling.GravityFactor !== 0) {
    let hasDropped = obj.z <= 0;
    for (let i = 0; i < ticks; i++) {
      obj.z = f32(obj.z + obj.dz);
      if (obj.z <= 0 && obj.dz < 0) {
        obj.z = 0;
        obj.dz = f32(-obj.dz * bc.Falling.BounceElasticity);
        obj.thing.Vel = svec2_scale(obj.thing.Vel, f32(1.0 - bc.Falling.BounceFriction));
        if (!hasDropped && !gCampaign.IsClient) FireGuns(obj, bc.Falling.DropGuns);
        hasDropped = true;
        if (bc.Falling.DestroyOnDrop) return false;
        const es = GameEventNew(GAME_EVENT_SOUND_AT);
        es.u.Sound = bc.Hit.Wall.Sound ?? '';
        es.u.Pos = pos;
        GameEventsEnqueue(gGameEvents, es);
      } else {
        obj.dz = f32(obj.dz - bc.Falling.GravityFactor);
      }
      if (!bc.Falling.FallsDown) obj.dz = MAX(0, obj.dz);
    }
  }
  const isDiagonal = fabsf(obj.thing.Vel.x) < FLT_EPSILON && fabsf(obj.thing.Vel.y) < FLT_EPSILON;
  const frictionComponent = isDiagonal ? f32(bc.Friction / sqrtf(2)) : bc.Friction;
  const v = { x: obj.thing.Vel.x, y: obj.thing.Vel.y };
  for (let i = 0; i < ticks; i++) {
    if (v.x > FLT_EPSILON) v.x = f32(v.x - frictionComponent);
    else if (v.x < -FLT_EPSILON) v.x = f32(v.x + frictionComponent);
    if (v.y > FLT_EPSILON) v.y = f32(v.y - frictionComponent);
    else if (v.y < -FLT_EPSILON) v.y = f32(v.y + frictionComponent);
  }
  obj.thing.Vel = v;
  if (!MapTryMoveThing(gMap, obj.thing, pos)) {
    obj.count = obj.range;
    return false;
  }
  if (bc.Erratic) {
    for (let i = 0; i < ticks; i++) {
      const ex = f32((rand() % 3) - 1);
      const ey = f32((rand() % 3) - 1);
      obj.thing.Vel = svec2_add(obj.thing.Vel, svec2_scale(svec2(ex, ey), f32(0.5)));
    }
  }
  if (bc.ProximityGuns.length > 0 && !(obj.count & 3)) {
    if (!gCampaign.IsClient) {
      const tv = Vec2ToTile(pos);
      for (let dy = -1; dy <= 1; dy++) {
        for (let dx = -1; dx <= 1; dx++) {
          const dtv = svec2i_add(tv, { x: dx, y: dy });
          if (!MapIsTileIn(gMap, dtv)) continue;
          if (TileHasCharacter(MapGetTile(gMap, dtv)!)) {
            FireGuns(obj, bc.ProximityGuns);
            return false;
          }
        }
      }
    }
  }
  return true;
}
function FireGuns(obj: TMobileObject, guns: WeaponClass[]): void {
  const angle = f32(svec2_angle(obj.thing.Vel) + MPI_2);
  for (const wc of guns) WeaponClassFire(wc, obj.thing.Pos, obj.z, angle, obj.flags, obj.ActorUID, true, false);
}
function AddTrail(obj: TMobileObject, from: Vec2, to: Vec2, ticks: number): void {
  const bc = obj.bulletClass;
  if (bc.Trail.P == null) return;
  const vel = svec2_subtract(to, from);
  const ap = newAddParticle();
  ap.Pos = svec2_scale(svec2_add(to, from), f32(0.5));
  ap.Z = f32(obj.z / 16);
  ap.Angle = f32(svec2_angle(vel) + MPI_2);
  ap.Mask = { ...colorTransparent };
  if (bc.Trail.P.Type === PARTICLE_PIC) {
    const cpic = bc.Trail.P.Pic;
    const pic = CPicGetPic(cpic, 0)!;
    if (bc.Trail.Width > 0) {
      const trailSize = svec2(bc.Trail.Width, svec2_length(vel));
      ap.DrawScale = svec2_divide(trailSize, svec2_assign_vec2i(pic.size));
    }
    ap.Mask = { ...cpic.Mask };
  }
  if (obj.trail.ticksPerEmit > 0 && ticks > 0) EmitterUpdate(obj.trail, ap, ticks);
  else EmitterStart(obj.trail, ap);
}

interface HitItemData {
  HitType: number;
  MultipleHits: boolean;
  Obj: TMobileObject;
  Target: Thing | null;
  TilePos: Vec2i;
  ColPos: Vec2;
  ColNormal: Vec2;
  ColPosDist2: number;
}
function HitItem(obj: TMobileObject, pos: Vec2, vel: Vec2, multipleHits: boolean): HitResult {
  const data: HitItemData = {
    HitType: HIT_NONE, MultipleHits: multipleHits, Obj: obj, Target: null, TilePos: svec2i_zero(), ColPos: pos,
    ColNormal: svec2_zero(), ColPosDist2: -1,
  };
  OverlapThings(obj.thing, pos, vel, obj.thing.size,
    { ThingMask: THING_CAN_BE_SHOT, Team: COLLISIONTEAM_NONE, IsPVP: IsPVP(gCampaign.Entry.Mode), AllActors: false },
    (ti, colA, _colB, normal) => {
      if (!CanHit(obj.bulletClass, obj.flags, obj.ActorUID, ti)) return true;
      if (data.MultipleHits) OnHit(data, ti);
      else SetClosestCollision(data, colA, normal, GetHitType(ti, obj).ht, ti, svec2i_zero());
      return true;
    },
    (tilePos) => {
      const t = MapGetTile(gMap, tilePos);
      return t == null || TileIsShootable(t);
    },
    (tilePos, col, normal) => {
      SetClosestCollision(data, col, normal, HIT_WALL, null, tilePos);
      return true;
    });
  if (!multipleHits && data.ColPosDist2 >= 0) {
    if (data.HitType === HIT_OBJECT || data.HitType === HIT_FLESH) OnHit(data, data.Target!);
  }
  return { Type: data.HitType, Pos: data.ColPos, Normal: data.ColNormal };
}
function GetHitType(ti: Thing, bullet: TMobileObject): { ht: number; uid: number } {
  let tUID = -1;
  let ht = HIT_NONE;
  switch (ti.kind) {
    case KIND_CHARACTER:
      ht = HIT_FLESH;
      tUID = gActors[ti.id].uid;
      break;
    case KIND_OBJECT:
      ht = HIT_OBJECT;
      tUID = gObjs[ti.id].uid;
      break;
    default:
      break;
  }
  if (bullet.thing.SoundLock > 0 || !HasHitSound(ti.kind, tUID, bullet.bulletClass.Special.Effect, true)) ht = HIT_NONE;
  return { ht, uid: tUID };
}
function SetClosestCollision(data: HitItemData, col: Vec2, normal: Vec2, ht: number, target: Thing | null, tilePos: Vec2i): void {
  const d2 = svec2_distance_squared(col, data.Obj.thing.Pos);
  if (data.ColPosDist2 < 0 || d2 < data.ColPosDist2) {
    data.ColPos = col;
    data.ColPosDist2 = d2;
    data.ColNormal = normal;
    data.HitType = ht;
    if (ht === HIT_WALL) data.TilePos = tilePos;
    else data.Target = target;
  }
}
function OnHit(data: HitItemData, target: Thing): void {
  if (gCampaign.IsClient) return;
  const r = GetHitType(target, data.Obj);
  data.HitType = r.ht;
  const source = ActorGetByUID(data.Obj.ActorUID);
  Damage(data.Obj.thing.Vel, data.Obj.bulletClass, data.Obj.weapon, data.Obj.flags, source, target.kind, r.uid);
  if (target.SoundLock <= 0) target.SoundLock += SOUND_LOCK_THING;
}

export function BulletAdd(add: GameEventU): void {
  const pos = add.MuzzlePos as Vec2;
  let i = gMobObjs.findIndex((m) => !m.isInUse);
  if (i < 0) {
    i = gMobObjs.length;
    gMobObjs.push(null as unknown as TMobileObject);
  }
  const bc = StrBulletClass(add.BulletClass)!;
  const obj: TMobileObject = {
    UID: add.UID, ActorUID: 0, bulletClass: bc, z: f32(add.MuzzleHeight), dz: f32(add.Elevation), count: 0, range: 0,
    flags: 0, thing: newThing(i, KIND_MOBILEOBJECT, bc.Size, 0), trail: newEmitter(), weapon: null, isInUse: false,
  };
  gMobObjs[i] = obj;
  EmitterInit(obj.trail, bc.Trail.P, svec2_zero(), 0, 0, 0, 0, 0, 0, bc.Trail.TicksPerEmit);
  obj.thing.Vel = svec2_scale(Vec2FromRadians(add.Angle), RAND_FLOAT(bc.SpeedLow, bc.SpeedHigh));
  if (bc.SpeedScale) obj.thing.Vel.y = f32(obj.thing.Vel.y * f32(TILE_WIDTH / TILE_HEIGHT));
  obj.ActorUID = add.ActorUID;
  obj.range = RAND_INT(bc.RangeLow, bc.RangeHigh);
  obj.flags = add.Flags;
  if (bc.HurtAlways) obj.flags |= FLAGS_HURTALWAYS;
  obj.weapon = StrWeaponClass(add.Gun);
  obj.isInUse = true;
  obj.thing.drawData.MobObjId = i;
  obj.thing.CPic = CPicClone(bc.CPic);
  obj.thing.CPicFunc = CPICFUNC_BULLET;
  obj.thing.ShadowSize = { ...bc.ShadowSize };
  MapTryMoveThing(gMap, obj.thing, pos);
  if (!gCampaign.IsClient) {
    const source = ActorGetByUID(add.ActorUID);
    const p = PlayerDataGetByUID(source != null ? source.PlayerUID : -1);
    if (p) WeaponUsagesUpdate(p.WeaponUsages, obj.weapon, 1, 0);
  }
}
export function BulletBounce(bb: GameEventU): void {
  const o = MobObjGetByUID(bb.UID);
  if (o == null || !o.isInUse) return;
  const bouncePos = bb.BouncePos as Vec2;
  if (bb.HitSound) PlayHitSound(o.bulletClass, bb.HitType, bouncePos);
  if (bb.Spark && o.bulletClass.Spark != null) {
    const s = GameEventNew(GAME_EVENT_ADD_PARTICLE);
    s.u.Class = o.bulletClass.Spark;
    s.u.Pos = bouncePos;
    s.u.Z = o.z;
    GameEventsEnqueue(gGameEvents, s);
  }
  if (bb.WallMark && o.bulletClass.WallMark != null) {
    const s = GameEventNew(GAME_EVENT_ADD_PARTICLE);
    s.u.Class = o.bulletClass.WallMark;
    s.u.Pos = bouncePos;
    s.u.Z = f32(o.z + Math.trunc(RAND_FLOAT(-WALL_MARK_Z, WALL_MARK_Z)));
    GameEventsEnqueue(gGameEvents, s);
  }
  MapTryMoveThing(gMap, o.thing, bb.Pos);
  o.thing.Vel = { ...bb.Vel };
}
export function PlayHitSound(b: BulletClass, t: number, pos: Vec2): void {
  const es = GameEventNew(GAME_EVENT_SOUND_AT);
  let sound: string | null = null;
  switch (t) {
    case HIT_WALL: sound = b.Hit.Wall.Sound; break;
    case HIT_OBJECT: sound = b.Hit.Object.Sound; break;
    case HIT_FLESH: sound = b.Hit.Flesh.Sound; break;
    default: return;
  }
  if (!sound || sound.length === 0) return;
  es.u.Sound = sound;
  es.u.Pos = pos;
  GameEventsEnqueue(gGameEvents, es);
}
export function BulletDestroy(obj: TMobileObject): void {
  MapRemoveThing(gMap, obj.thing);
  obj.isInUse = false;
}
export { BULLET_Z as OBJS_BULLET_Z, AMMO_SPAWNER_RESPAWN_TICKS as AMMO_RESPAWN };
