// C-Dogs SDL 2.5.0, translated: actors (actors.c), firing (actor_fire.c), placement (actor_placement.c), the
// floor materials (material.c) and actor damage (damage.c). GPL-2.0-or-later / BSD-2-Clause
// (web/games/cdogs/LICENSE.md).
import {
  CMD_BUTTON2, CMD_GRENADE, CMD_HAS_DIRECTION, CmdGetReverse, CmdToDirection, DIRECTION_DOWN, EPSILON_POS, FLT_EPSILON,
  MAX, MIN, MPI, MPI_2, RAND_DOUBLE, RAND_FLOAT, RAND_INT, SPECIAL_CONFUSE, SPECIAL_FLAME, SPECIAL_NONE, SPECIAL_PETRIFY,
  SPECIAL_POISON, TILE_HEIGHT, TILE_WIDTH, Vec2CenterOfTile, Vec2FromRadiansScaled, Vec2ToTile, Z_FACTOR, Button1, Button2,
  CLAMP, ColorEquals, ColorMult, Down, Left, RadiansToDirection, Right, Up, colorBlack, colorTransparent, colorWhite,
  dir2radians, f32, fabsf, nearly_equal, svec2, svec2_add, svec2_distance, svec2_is_nearly_equal, svec2_is_zero,
  svec2_length, svec2_normalize, svec2_scale, svec2_subtract, svec2_zero, svec2i, svec2i_add, svec2i_is_zero,
  type Color, type Vec2, type Vec2i,
} from './base.ts';
import {
  ACTOR_H, ACTOR_W, AABBOverlap, CalcCollisionTeam, COLLISIONTEAM_NONE, FLAGS_GOOD_GUY, FLAGS_PRISONER, FLAGS_VICTIM,
  FLAGS_VISIBLE, gCollisionSystem, gMap, IsCollisionDiamond, IsCollisionWithWall, MapGetExitPos, MapGetRandomPos,
  MapGetTile, MapIsPosOKForPlayer, MapIsTileAreaClear, MapIsTileInExit, MapPlaceRandomPos, MapPosIsInLockedRoom,
  MapRemoveThing, MapTryMoveThing, newThing, OverlapGetFirstItem, OverlapThings, ThingUpdate, TriggerCannotActivate,
  TriggerSetCannotActivate, TriggerTryActivate, collisionHooks, type CollisionParams, type GameMap,
} from './map.ts';
import {
  GUNSTATE_FIRING, GUNSTATE_READY, GUNSTATE_RECOIL, GUNTYPE_GRENADE, GUNTYPE_MELEE, GUNTYPE_NORMAL, INPUT_DEVICE_JOYSTICK,
  KIND_CHARACTER, KIND_OBJECT, KIND_PICKUP, MAX_GUNS, MAX_WEAPONS, MELEE_SLOT, GRENADE_SLOT, PICKUP_GUN,
  TILE_CLASS_FLOOR, THING_CAN_BE_SHOT, THING_IMPASSABLE, THING_OBJECTIVE, type AddParticle, type BulletClass,
  type Character, type CharacterClass, type PlayerData, type Pickup, type TActor, type Thing, type Tile, type Weapon,
  type WeaponClass,
} from './types.ts';
import {
  AmmoGetById, AmmoGetNumClasses, CharacterClassGetDeathSprites, CharacterClassGetSound, FPS_FRAMELIMIT,
  GetRandomBloodPool, GunTypeGetSlotStartEnd, MapObjectGetFlags, PickupClassGetName, StrBulletClass, StrMapObject,
  StrParticleClass, StrWeaponClass, WC_BARREL, WeaponClassCanShoot, WeaponClassGetBarrel,
  WeaponClassGetBarrelMuzzleOffset, WeaponClassGetBullet, WeaponClassGetMuzzleHeight, WeaponClassGetRange as _wcr,
  WeaponClassHasMuzzle, WeaponClassId, WeaponClassNumBarrels, WeaponUsagesUpdate, brassParticle,
} from './classes.ts';
import { HEAD_PART_HAT } from './pics.ts';
import {
  ALLYCOLLISION_REPEL, ConfigGetBool, ConfigGetEnum, ConfigGetInt, FIREMOVE_STOP, FIREMOVE_STRAFE, GORE_LOW,
  GORE_MEDIUM, GORE_NONE, SPLITSCREEN_NEVER, SWITCHMOVE_STRAFE,
} from './config.ts';
import {
  GAME_EVENT_ACTOR_ADD, GAME_EVENT_ACTOR_BARK, GAME_EVENT_ACTOR_DIE, GAME_EVENT_ACTOR_DIR, GAME_EVENT_ACTOR_IMPULSE,
  GAME_EVENT_ACTOR_MELEE, GAME_EVENT_ACTOR_MOVE, GAME_EVENT_ACTOR_PICKUP_ALL, GAME_EVENT_ACTOR_PILOT,
  GAME_EVENT_ACTOR_REPLACE_GUN, GAME_EVENT_ACTOR_SLIDE, GAME_EVENT_ACTOR_STATE, GAME_EVENT_ACTOR_SWITCH_GUN,
  GAME_EVENT_ACTOR_USE_AMMO, GAME_EVENT_ADD_BULLET, GAME_EVENT_ADD_PARTICLE, GAME_EVENT_ADD_PICKUP, GAME_EVENT_GUN_RELOAD,
  GAME_EVENT_GUN_STATE, GAME_EVENT_MAP_OBJECT_ADD, GAME_EVENT_PARTICLE_REMOVE, GAME_EVENT_RESCUE_CHARACTER,
  GAME_EVENT_SCORE, GAME_EVENT_SCREEN_SHAKE, GAME_EVENT_SOUND_AT, GAME_EVENT_THING_DAMAGE, GameEventNew,
  GameEventsEnqueue, gGameEvents, newAddParticle, uidCounters, type GameEvent, type GameEventU,
} from './events.ts';
import { gActors, gCampaign, gMission, gObjs, gParticles, gPickups, IsPVP } from './state.ts';
import { gSoundDevice, SoundHalt, SoundPlay, SoundPlayAt, StrSound } from './sounds.ts';
import { OBJECTIVE_KILL, OBJECTIVE_RESCUE, ObjectiveFromThing } from './mission.ts';
import {
  ACTORANIMATION_IDLE, ACTORANIMATION_STAND, ACTORANIMATION_WALKING, AnimationGetActorAnimation, AnimationGetFrame,
  AnimationUpdate, EmitterInit, EmitterReset, EmitterStart, EmitterUpdate, newEmitter, BULLET_Z,
} from './particles.ts';
import {
  WeaponBarrelIsOverheating, WeaponBarrelOnFire, WeaponCreate, WeaponGetUnlockedBarrel, WeaponUpdate,
} from './weapon.ts';
import {
  AIContextNew, AIContextSetState, AIContextShowChatter, AIGetClosestPlayer, AIStateGetChatterText, AIWake,
  AIWakeOnSoundAt, AI_STATE_IDLE,
} from './ai.ts';
import {
  CanHit, Damage, HasHitSound, HIT_FLESH, HIT_NONE, HIT_OBJECT, MobObjsObjsGetNextUID, ObjIsDangerous,
  ObjsGetNextUID, PlayHitSound, SHOT_IMPULSE_FACTOR, ThingGetByUID, BulletToDamageEvent, WeaponClassFire,
} from './objs.ts';
import {
  CharacterGetStartingHealth, IsPlayerHuman, PlayerDataGetByUID, PlayerHasGrenadeButton, PlayerIsLocal,
  PlayersNumUseAmmo,
} from './player.ts';
import { PickupAddGun, PickupApplyEffect, PickupIsManual, PickupPickup } from './pickups.ts';
import { AICoopOnPickupGun } from './aicoop.ts';
import { UpdateMissionObjective } from './missionrun.ts';
import { platformHooks } from './hooks.ts';
import { HandleGameEvents } from './handle.ts';
void _wcr;

export const FLAGS_HURTALWAYS = 1 << 2;
export const FLAGS_DETOURING = 1 << 5;
export const FLAGS_TRYRIGHT = 1 << 6;
export const FLAGS_SLEEPING = 1 << 7;
export const FLAGS_ASBESTOS = 1 << 9;
export const FLAGS_IMMUNITY = 1 << 10;
export const FLAGS_SEETHROUGH = 1 << 11;
export const FLAGS_DEAF = 1 << 12;
export const FLAGS_ALL_SEEING = 1 << 13;
export const FLAGS_UNLOCK_DOORS = 1 << 14;
export const FLAGS_WAKING = 1 << 15;
export const FLAGS_RUNS_AWAY = 1 << 16;
export const FLAGS_INVULNERABLE = 1 << 19;
export const FLAGS_FOLLOWER = 1 << 20;
export const FLAGS_PENALTY = 1 << 21;
export const FLAGS_SNEAKY = 1 << 23;
export const FLAGS_SLEEPALWAYS = 1 << 24;
export const FLAGS_AWAKEALWAYS = 1 << 25;
export const FLAGS_RESCUED = 1 << 26;
export const FLAGS_MOVE_AND_SHOOT = 1 << 27;
export { FLAGS_GOOD_GUY, FLAGS_PRISONER, FLAGS_VICTIM, FLAGS_VISIBLE };

export const ACTORACTION_MOVING = 0;
export const ACTORACTION_EXITING = 1;
export const PLACEMENT_ACCESS_ANY = 0;
export const PLACEMENT_ACCESS_LOCKED = 1;
export const PLACEMENT_ACCESS_NOT_LOCKED = 2;
export const AMMO_STARTING_MULTIPLE = 2;

const FOOTSTEP_MAX_ANIM_SPEED = 2;
const REPEL_STRENGTH = f32(0.06);
const SLIDE_LOCK = 50;
const SLIDE_X = Math.trunc(TILE_WIDTH / 3);
const SLIDE_Y = Math.trunc(TILE_HEIGHT / 3);
const VEL_DECAY_X = f32((TILE_WIDTH * 2) / 256.0);
const VEL_DECAY_Y = f32((TILE_WIDTH * 2) / 256.0);
const SOUND_LOCK_WEAPON_CLICK = 20;
const DRAW_RADIAN_SPEED = f32(MPI / 16);
const LOW_HEALTH_PERCENTAGE = 25;
const GORE_EMITTER_MAX_SPEED = f32(0.25);
const CHATTER_SHOW_SECONDS = 2;
const CHATTER_SWITCH_GUN = 45;
const GRIMACE_PERIOD = 20;
const GRIMACE_HIT_TICKS = 39;
const GRIMACE_MELEE_TICKS = 19;
const DAMAGE_TEXT_DISTANCE_RESET_THRESHOLD = ACTOR_W / 2;
const FOOTPRINT_MAX = 8;

collisionHooks.actorByUID = (uid: number) => ActorGetByUID(uid);

export const ACTOR_GET_GUN = (a: TActor): Weapon => a.guns[a.gunIndex];
export const ACTOR_GET_GRENADE = (a: TActor): Weapon => a.guns[MAX_GUNS];
export const ACTOR_GET_WEAPON = (a: TActor): Weapon => (ACTOR_GET_GUN(a).Gun != null ? ACTOR_GET_GUN(a) : ACTOR_GET_GRENADE(a));

function apNew(): AddParticle {
  return newAddParticle();
}

// --- material.c --------------------------------------------------------------------------------------------------

const IsTileFloor = (t: Tile | null): boolean => t != null && t.Class != null && t.Class.Type === TILE_CLASS_FLOOR;
export function MatGetFootstepSound(c: CharacterClass, t: Tile | null): string {
  if (c.Footsteps) return `footsteps/${c.Footsteps}`;
  if (IsTileFloor(t) && t!.Class.Style != null) {
    for (const tid of t!.things) {
      if (tid.Kind === KIND_OBJECT) {
        const obj = gObjs[tid.Id];
        if (obj && obj.Class.DrawBelow && obj.Class.FootstepSound) return obj.Class.FootstepSound;
      }
    }
    const s = t!.Class.Style;
    if (s.startsWith('checker') || s.startsWith('tile')) return 'footsteps/tile';
    if (s.startsWith('cobble')) return 'footsteps/gravel';
    if (s.startsWith('dirt')) return 'footsteps/grass';
    if (s.startsWith('grate')) return 'footsteps/metal';
    if (s.startsWith('water')) return 'footsteps/water';
    if (s.startsWith('wood')) return 'footsteps/wood';
  }
  return 'footsteps/boots';
}
export function MatGetFootprintMask(t: Tile | null): Color {
  if (IsTileFloor(t)) {
    for (const tid of t!.things) {
      if (tid.Kind === KIND_OBJECT) {
        const obj = gObjs[tid.Id];
        if (obj && obj.Class.DrawBelow) {
          let mask = obj.Class.FootprintMask;
          if (!ColorEquals(obj.thing.CPic.Mask, colorWhite)) {
            mask = ColorMult(obj.thing.CPic.Mask, { r: 33, g: 33, b: 33, a: 255 });
          }
          if (mask.a !== 0) return mask;
        }
      }
    }
    if (t!.Class.Style != null && t!.Class.Style.startsWith('water')) return { ...colorBlack, a: 0x99 };
  }
  return { ...colorTransparent };
}
export function MatGetDamageBullet(t: Tile | null): BulletClass | null {
  return IsTileFloor(t) ? StrBulletClass(t!.Class.DamageBullet) : null;
}

// --- actors.c ----------------------------------------------------------------------------------------------------

export function UpdateActorState(actor: TActor, ticks: number): void {
  ActorUpdateWeapon(actor, ACTOR_GET_GUN(actor), ticks);
  ActorUpdateWeapon(actor, ACTOR_GET_GRENADE(actor), ticks);
  if (actor.PickupAll && !gCampaign.IsClient) CheckPickups(actor);
  actor.PickupAll = false;
  if (actor.health > 0) {
    actor.flamed = MAX(0, actor.flamed - ticks);
    if (actor.flamed) {
      const ap = apNew();
      const x = RAND_FLOAT(-8, 8);
      const y = RAND_FLOAT(-6, 6);
      ap.Pos = svec2_add(actor.Pos, svec2(x, y));
      ap.Z = RAND_FLOAT(0, 14);
      ap.ActorUID = actor.uid;
      EmitterUpdate(actor.flameEffect, ap, ticks);
    } else {
      EmitterReset(actor.flameEffect);
    }
    if (actor.poisoned) {
      if ((actor.poisoned & 7) === 0) InjureActor(actor, 1);
      actor.poisoned = MAX(0, actor.poisoned - ticks);
      const ap = apNew();
      const x = RAND_FLOAT(-6, 6);
      const y = RAND_FLOAT(-4, 4);
      ap.Pos = svec2_add(actor.Pos, svec2(x, y));
      ap.Z = 10;
      ap.ActorUID = actor.uid;
      EmitterUpdate(actor.poisonEffect, ap, ticks);
    } else {
      EmitterReset(actor.poisonEffect);
    }
    actor.petrified = MAX(0, actor.petrified - ticks);
    if (actor.petrified) {
      const ap = apNew();
      const x = RAND_FLOAT(-8, 8);
      const y = RAND_FLOAT(-6, 6);
      ap.Pos = svec2_add(actor.Pos, svec2(x, y));
      ap.Z = RAND_FLOAT(0, 14);
      ap.ActorUID = actor.uid;
      EmitterUpdate(actor.iceEffect, ap, ticks);
    } else {
      EmitterReset(actor.iceEffect);
    }
    actor.confused = MAX(0, actor.confused - ticks);
    if (actor.confused) {
      const ap = apNew();
      ap.Pos = actor.Pos;
      ap.Z = 16;
      ap.ActorUID = actor.uid;
      ap.IsAttached = true;
      EmitterUpdate(actor.confusionEffect, ap, ticks);
    } else {
      EmitterReset(actor.confusionEffect);
    }
    actor.damageCooldownTicks += ticks;
    if (actor.accumulatedDamage && actor.damageCooldownTicks >= FPS_FRAMELIMIT) {
      actor.accumulatedDamage = 0;
      actor.damageCooldownTicks = 0;
    }
  }
  actor.slideLock = MAX(0, actor.slideLock - ticks);
  if (actor.slideLock > Math.trunc((SLIDE_LOCK * 4) / 5)) {
    const ap = apNew();
    ap.Pos = actor.Pos;
    EmitterStart(actor.slideEffect, ap);
  }
  ThingUpdate(actor.thing, ticks);
  actor.stateCounter = MAX(0, actor.stateCounter - ticks);
  if (actor.stateCounter > 0) return;
  const c = ActorGetCharacter(actor);
  if (actor.health <= 0) {
    if (actor.dead === 0 && !gCampaign.IsClient) {
      if (c.Drop) {
        const e = GameEventNew(GAME_EVENT_ADD_PICKUP);
        e.u.PickupClass = c.Drop.Name;
        e.u.Pos = actor.Pos;
        GameEventsEnqueue(gGameEvents, e);
      } else if (!gCampaign.Setting.BuyAndSell) {
        if (gCampaign.Setting.Ammo) ActorAddAmmoPickup(actor);
        ActorAddGunPickup(actor);
      }
    }
    actor.dead++;
    actor.MoveVel = svec2_zero();
    actor.stateCounter = 4;
    actor.thing.flags = 0;
    return;
  }
  const targetRadians = f32(dir2radians[actor.direction]);
  if (f32(actor.DrawRadians - targetRadians) > MPI) actor.DrawRadians = f32(actor.DrawRadians - f32(2 * MPI));
  if (f32(actor.DrawRadians - targetRadians) < -MPI) actor.DrawRadians = f32(actor.DrawRadians + f32(2 * MPI));
  const dr = f32(actor.DrawRadians - targetRadians);
  if (dr < 0) actor.DrawRadians = f32(actor.DrawRadians + MIN(f32(DRAW_RADIAN_SPEED * ticks), -dr));
  else if (dr > 0) actor.DrawRadians = f32(actor.DrawRadians - MIN(f32(DRAW_RADIAN_SPEED * ticks), dr));
  const tilePos = Vec2ToTile(actor.Pos);
  const t = MapGetTile(gMap, tilePos);
  const frame = AnimationGetFrame(actor.anim);
  const isFootstepFrame = actor.anim.Type === ACTORANIMATION_WALKING && (frame === 2 || frame === 6) && actor.anim.newFrame;
  if (isFootstepFrame) {
    if (ConfigGetBool('Sound.Footsteps')) {
      const e = GameEventNew(GAME_EVENT_SOUND_AT);
      e.u.Sound = MatGetFootstepSound(c.Class!, t);
      e.u.Pos = actor.thing.Pos;
      e.u.Distance = c.Class!.FootstepsDistancePlus;
      GameEventsEnqueue(gGameEvents, e);
    }
    const footprintMask = MatGetFootprintMask(t);
    if (footprintMask.a !== 0) {
      actor.footprintMask = footprintMask;
      actor.footprintCounter = FOOTPRINT_MAX;
    }
    if (actor.footprintCounter > 0) {
      const e = GameEventNew(GAME_EVENT_ADD_PARTICLE);
      e.u.Class = StrParticleClass('footprint');
      const footOffset = svec2_scale(Vec2FromRadiansScaled(f32(actor.DrawRadians + MPI_2)), frame === 2 ? 3 : -3);
      e.u.Pos = svec2_subtract(actor.thing.Pos, footOffset);
      e.u.Angle = actor.DrawRadians;
      e.u.Mask = { ...actor.footprintMask };
      e.u.Mask.a = MIN(Math.trunc((actor.footprintCounter * e.u.Mask.a) / FOOTPRINT_MAX), 255) & 255;
      GameEventsEnqueue(gGameEvents, e);
      actor.footprintCounter--;
    }
  }
  if ((!gCampaign.IsClient && actor.anim.Type === ACTORANIMATION_WALKING) ? isFootstepFrame : (gMission.time % FPS_FRAMELIMIT) === 0) {
    const b = MatGetDamageBullet(t);
    if (b != null) {
      const e = GameEventNew(GAME_EVENT_THING_DAMAGE);
      e.u.UID = actor.uid;
      e.u.Kind = KIND_CHARACTER;
      BulletToDamageEvent(b, e);
      GameEventsEnqueue(gGameEvents, e);
    }
  }
  let animTicks = 1;
  if (actor.anim.Type === ACTORANIMATION_WALKING) {
    animTicks = MIN(svec2_length(svec2_add(actor.MoveVel, actor.thing.Vel)), FOOTSTEP_MAX_ANIM_SPEED);
  }
  animTicks = f32(animTicks * ticks);
  AnimationUpdate(actor.anim, animTicks);
  actor.ChatterCounter = MAX(0, actor.ChatterCounter - ticks);
  if (actor.ChatterCounter === 0) actor.Chatter = '';
  actor.grimaceCounter = MAX(0, actor.grimaceCounter - ticks);
}

function ActorUpdateWeapon(a: TActor, w: Weapon, ticks: number): void {
  if (w.Gun == null) return;
  WeaponUpdate(w, ticks);
  ActorFireUpdate(w, a, ticks);
  for (let i = 0; i < WeaponClassNumBarrels(w.Gun); i++) {
    if (WeaponBarrelIsOverheating(w, i)) {
      const ap = apNew();
      ap.Pos = svec2_add(a.Pos, ActorGetMuzzleOffset(a, w, i));
      ap.Z = f32(Math.trunc(WeaponClassGetMuzzleHeight(w.Gun, w.barrels[i].state, i) / Z_FACTOR));
      ap.Mask = { ...colorWhite };
      EmitterUpdate(a.barrelSmoke, ap, ticks);
    }
  }
}

function TryMoveActor(actor: TActor, pos: Vec2): boolean {
  actor.CanPickupSpecial = false;
  if (actor.vehicleUID === -1) {
    actor.hasCollided = true;
    const oldPos = actor.Pos;
    pos = GetConstrainedPos(gMap, actor.Pos, pos, actor.thing.size);
    if (svec2_is_nearly_equal(oldPos, pos, EPSILON_POS)) return false;
    const params: CollisionParams = {
      ThingMask: THING_IMPASSABLE, Team: CalcCollisionTeam(true, actor), IsPVP: IsPVP(gCampaign.Entry.Mode), AllActors: false,
    };
    const target = OverlapGetFirstItem(actor.thing, pos, actor.thing.size, actor.thing.Vel, params);
    if (target && actor.health > 0) {
      const meleeW = actor.guns[MELEE_SLOT];
      if (actor.gunIndex !== MELEE_SLOT && meleeW.Gun && meleeW.Gun.Type === GUNTYPE_MELEE && meleeW.Gun.Normal.Auto &&
        !actor.hasShot && CanMeleeTarget(actor, meleeW, target)) {
        const e = GameEventNew(GAME_EVENT_ACTOR_SWITCH_GUN);
        e.u.UID = actor.uid;
        e.u.GunIdx = MELEE_SLOT;
        GameEventsEnqueue(gGameEvents, e);
      } else {
        const gun = ACTOR_GET_WEAPON(actor);
        if (CanMeleeTarget(actor, gun, target)) {
          const barrel = ActorGetCanFireBarrel(actor, gun);
          if (barrel >= 0) {
            const b = WeaponClassGetBullet(gun.Gun!, barrel)!;
            if (CanHit(b, actor.flags, actor.uid, target)) {
              const e = GameEventNew(GAME_EVENT_ACTOR_MELEE);
              e.u.UID = actor.uid;
              e.u.BulletClass = b.Name;
              e.u.TargetKind = target.kind;
              switch (target.kind) {
                case KIND_CHARACTER:
                  e.u.TargetUID = gActors[target.id].uid;
                  e.u.HitType = HIT_FLESH;
                  break;
                case KIND_OBJECT:
                  e.u.TargetUID = gObjs[target.id].uid;
                  e.u.HitType = HIT_OBJECT;
                  break;
                default:
                  break;
              }
              if (gun.barrels[barrel].soundLock > 0) e.u.HitType = HIT_NONE;
              GameEventsEnqueue(gGameEvents, e);
              WeaponBarrelOnFire(gun, barrel);
              if (actor.grimaceCounter === 0) actor.grimaceCounter = GRIMACE_MELEE_TICKS;
            }
          }
          return false;
        }
      }
      const yPos = svec2(actor.Pos.x, pos.y);
      if (OverlapGetFirstItem(actor.thing, yPos, actor.thing.size, svec2_zero(), params)) pos = svec2(pos.x, actor.Pos.y);
      const xPos = svec2(pos.x, actor.Pos.y);
      if (OverlapGetFirstItem(actor.thing, xPos, actor.thing.size, svec2_zero(), params)) pos = svec2(actor.Pos.x, pos.y);
      if (pos.x !== actor.Pos.x && pos.y !== actor.Pos.y) pos = svec2(pos.x, actor.Pos.y);
      if ((pos.x === actor.Pos.x && pos.y === actor.Pos.y) || IsCollisionWithWall(pos, actor.thing.size)) return false;
    }
  }
  actor.Pos = pos;
  OnMove(actor);
  actor.hasCollided = false;
  return true;
}
function CanMeleeTarget(a: TActor, w: Weapon, target: Thing): boolean {
  if (!w.Gun || WeaponClassCanShoot(w.Gun)) return false;
  if (!ActorIsLocalPlayer(a.uid) && (gCampaign.IsClient || a.PlayerUID >= 0)) return false;
  for (let barrel = 0; barrel < WeaponClassNumBarrels(w.Gun); barrel++) {
    const b = WeaponClassGetBullet(w.Gun, barrel);
    if (b == null) continue;
    if (target.kind === KIND_OBJECT) {
      if (!b.Hit.Object.Hit) continue;
      const object = gObjs[target.id];
      if (object && !ObjIsDangerous(object)) return true;
    } else if (b.Hit.Flesh.Hit && target.kind === KIND_CHARACTER) {
      return true;
    }
  }
  return false;
}
function GetConstrainedPos(map: GameMap, from: Vec2, to: Vec2, size: Vec2i): Vec2 {
  if (!IsCollisionWithWall(to, size)) return to;
  const dv = svec2_subtract(to, from);
  if (!nearly_equal(dv.x, 0, EPSILON_POS) && !nearly_equal(dv.y, 0, EPSILON_POS)) {
    const xVec = svec2(to.x, from.y);
    if (!IsCollisionWithWall(xVec, size)) return xVec;
    const yVec = svec2(from.x, to.y);
    if (!IsCollisionWithWall(yVec, size)) return yVec;
    const xPos = GetConstrainedPos(map, from, xVec, size);
    if (!svec2_is_nearly_equal(xPos, from, EPSILON_POS)) return xPos;
    const yPos = GetConstrainedPos(map, from, yVec, size);
    if (!svec2_is_nearly_equal(yPos, from, EPSILON_POS)) return yPos;
  }
  if (nearly_equal(dv.x, 0, EPSILON_POS)) {
    const xScale = size.x > size.y ? Math.ceil(size.x / size.y) : 1;
    const diag1Vec = svec2_add(from, svec2(f32(-dv.y * xScale), dv.y));
    if (!IsCollisionDiamond(map, diag1Vec, size)) return diag1Vec;
    const diag2Vec = svec2_add(from, svec2(f32(dv.y * xScale), dv.y));
    if (!IsCollisionDiamond(map, diag2Vec, size)) return diag2Vec;
  } else if (nearly_equal(dv.y, 0, EPSILON_POS)) {
    const diag1Vec = svec2_add(from, svec2(dv.x, -dv.x));
    if (!IsCollisionDiamond(map, diag1Vec, size)) return diag1Vec;
    const diag2Vec = svec2_add(from, svec2(dv.x, dv.x));
    if (!IsCollisionDiamond(map, diag2Vec, size)) return diag2Vec;
  }
  return from;
}
export function ActorMove(am: GameEventU): void {
  const a = ActorGetByUID(am.UID);
  if (a == null || !a.isInUse) return;
  a.Pos = { ...am.Pos };
  a.MoveVel = { ...am.MoveVel };
  OnMove(a);
}
function OnMove(a: TActor): void {
  MapTryMoveThing(gMap, a.thing, a.Pos);
  a.action = MapIsTileInExit(gMap, a.thing, -1) !== -1 ? ACTORACTION_EXITING : ACTORACTION_MOVING;
  if (!gCampaign.IsClient) {
    CheckTrigger(a, gMap);
    CheckPickups(a);
    CheckRescue(a);
  }
}
function CheckTrigger(a: TActor, map: GameMap): void {
  if (a.PlayerUID < 0 && (a.flags & FLAGS_SLEEPING)) return;
  const tilePos = Vec2ToTile(a.Pos);
  const showLocked = ActorIsLocalPlayer(a.uid);
  const t = MapGetTile(map, tilePos)!;
  const keyFlags = (a.flags & FLAGS_UNLOCK_DOORS) ? -1 : gMission.KeyFlags;
  for (let i = 0; i < t.triggers.length; i++) {
    const tp = t.triggers[i];
    if (!TriggerTryActivate(tp, keyFlags, tilePos) && tp.isActive && TriggerCannotActivate(tp) && showLocked) {
      TriggerSetCannotActivate(tp);
      const s = GameEventNew(GAME_EVENT_ADD_PARTICLE);
      s.u.Class = StrParticleClass('locked_text');
      s.u.Pos = Vec2CenterOfTile(tilePos);
      s.u.Z = BULLET_Z * 2 * Z_FACTOR;
      s.u.Text = 'locked';
      GameEventsEnqueue(gGameEvents, s);
    }
  }
}
function CheckPickups(actor: TActor): void {
  if (actor.PlayerUID < 0) return;
  const params: CollisionParams = { ThingMask: 0, Team: CalcCollisionTeam(true, actor), IsPVP: IsPVP(gCampaign.Entry.Mode), AllActors: false };
  OverlapThings(actor.thing, actor.Pos, actor.thing.Vel, actor.thing.size, params, (ti) => {
    if (ti.kind !== KIND_PICKUP) return true;
    PickupPickup(actor, gPickups[ti.id], actor.PickupAll);
    return true;
  }, null, null);
  if (actor.PickupAll) {
    CheckPilot(actor, { ThingMask: THING_IMPASSABLE | THING_CAN_BE_SHOT, Team: params.Team, IsPVP: params.IsPVP, AllActors: true });
  }
}
function CheckPilot(a: TActor, params: CollisionParams): void {
  const ti = OverlapGetFirstItem(a.thing, a.Pos, a.thing.size, a.thing.Vel, params);
  if (ti == null || ti.kind !== KIND_CHARACTER) return;
  const vehicle = gActors[ti.id];
  if (vehicle.pilotUID >= 0) return;
  const e = GameEventNew(GAME_EVENT_ACTOR_PILOT);
  e.u.On = true;
  e.u.UID = a.uid;
  e.u.VehicleUID = vehicle.uid;
  GameEventsEnqueue(gGameEvents, e);
}
function CheckRescue(a: TActor): void {
  if (a.PlayerUID < 0) return;
  const RESCUE_CHECK_PAD = 2;
  const target = OverlapGetFirstItem(a.thing, a.Pos, svec2i_add(a.thing.size, svec2i(RESCUE_CHECK_PAD, RESCUE_CHECK_PAD)),
    a.thing.Vel, { ThingMask: THING_IMPASSABLE, Team: CalcCollisionTeam(true, a), IsPVP: IsPVP(gCampaign.Entry.Mode), AllActors: false });
  if (target != null && target.kind === KIND_CHARACTER) {
    const other = gActors[target.id];
    if (other.flags & FLAGS_PRISONER) {
      other.flags &= ~FLAGS_PRISONER;
      const e = GameEventNew(GAME_EVENT_RESCUE_CHARACTER);
      e.u.UID = other.uid;
      GameEventsEnqueue(gGameEvents, e);
      UpdateMissionObjective(gMission, other.thing.flags, OBJECTIVE_RESCUE, 1);
    }
  }
}
export function ActorHeal(actor: TActor, amount: number, exceedMax: boolean): void {
  actor.health += amount;
  actor.health = MIN(actor.health, ActorGetMaxHeal(actor, exceedMax));
  const ap = apNew();
  ap.Pos = actor.Pos;
  ap.Z = 10;
  for (let i = 0; i < MAX(Math.trunc(amount / 20), 1); i++) {
    const x = RAND_FLOAT(f32(-0.2), f32(0.2));
    const y = RAND_FLOAT(f32(-0.2), f32(0.2));
    ap.Vel = svec2(x, y);
    EmitterStart(actor.healEffect, ap);
  }
}
export function InjureActor(actor: TActor, injury: number): void {
  const lastHealth = actor.health;
  actor.health -= injury;
  if (lastHealth > 0 && actor.health <= 0) {
    actor.stateCounter = 0;
    let es = GameEventNew(GAME_EVENT_ACTOR_BARK);
    es.u.Sound = CharacterClassGetSound(ActorGetCharacter(actor).Class!, 'die');
    es.u.UID = actor.uid;
    GameEventsEnqueue(gGameEvents, es);
    if (actor.PlayerUID >= 0) {
      es = GameEventNew(GAME_EVENT_SOUND_AT);
      es.u.Sound = 'hahaha';
      es.u.Pos = actor.thing.Pos;
      GameEventsEnqueue(gGameEvents, es);
    }
    if (actor.thing.flags & THING_OBJECTIVE) {
      UpdateMissionObjective(gMission, actor.thing.flags, OBJECTIVE_KILL, 1);
      if (!(actor.flags & FLAGS_PRISONER)) UpdateMissionObjective(gMission, actor.thing.flags, OBJECTIVE_RESCUE, -1);
    }
  }
}
export function ActorAddAmmo(actor: TActor, ammoId: number, amount: number): void {
  actor.ammo[ammoId] += amount;
  const ammoMax = AmmoGetById(ammoId)!.Max;
  if (ammoMax > 0) actor.ammo[ammoId] = CLAMP(actor.ammo[ammoId], 0, ammoMax);
}
export function ActorUsesAmmo(actor: TActor | null, ammoId: number): boolean {
  if (!actor) return false;
  for (let i = 0; i < MAX_WEAPONS; i++) {
    const wc = actor.guns[i].Gun;
    if (wc == null) continue;
    for (let j = 0; j < WeaponClassNumBarrels(wc); j++) if (WC_BARREL(wc, 'AmmoId', j) === ammoId) return true;
  }
  return false;
}
function ActorSetChatter(a: TActor, text: string, count: number): void {
  a.Chatter = text;
  a.ChatterCounter = count;
}
export function ActorReplaceGun(rg: GameEventU): void {
  const a = ActorGetByUID(rg.UID);
  if (a == null || !a.isInUse) return;
  const wc = StrWeaponClass(rg.Gun)!;
  if (ActorFindGun(a, wc) >= 0) return;
  a.guns[rg.GunIdx] = WeaponCreate(wc);
  if (ActorCanSwitchToWeapon(a, rg.GunIdx)) a.gunIndex = rg.GunIdx;
  SoundPlayAt(gSoundDevice, wc.SwitchSound, a.Pos);
  if (a.PlayerUID >= 0) ActorSetChatter(a, wc.name, CHATTER_SWITCH_GUN);
}
export function ActorFindGun(a: TActor, wc: WeaponClass): number {
  for (let i = 0; i < MAX_WEAPONS; i++) if (a.guns[i].Gun === wc) return i;
  return -1;
}
export function ActorGetNumWeapons(a: TActor): number {
  let n = 0;
  for (let i = 0; i < MAX_WEAPONS; i++) if (a.guns[i].Gun != null) n++;
  return n;
}
export function ActorGetNumGuns(a: TActor): number {
  let n = 0;
  for (let i = 0; i < MAX_GUNS; i++) if (a.guns[i].Gun != null) n++;
  return n;
}
export function ActorGetNumGrenades(a: TActor): number {
  let n = 0;
  for (let i = MAX_GUNS; i < MAX_WEAPONS; i++) if (a.guns[i].Gun != null) n++;
  return n;
}
export function ActorSetAIState(actor: TActor, s: number): void {
  if (AIContextSetState(actor.aiContext!, s) && AIContextShowChatter(ConfigGetEnum('Interface.AIChatter'))) {
    ActorSetChatter(actor, AIStateGetChatterText(actor.aiContext!.State), CHATTER_SHOW_SECONDS * ConfigGetInt('Game.FPS'));
  }
}
export function ActorPilot(ap: GameEventU): void {
  const pilot = ActorGetByUID(ap.UID)!;
  const vehicle = ActorGetByUID(ap.VehicleUID)!;
  if (ap.On) {
    pilot.vehicleUID = vehicle.uid;
    vehicle.pilotUID = pilot.uid;
    SoundPlayAt(gSoundDevice, StrSound(CharacterClassGetSound(ActorGetCharacter(vehicle).Class!, 'alert')), vehicle.Pos);
  } else {
    pilot.vehicleUID = -1;
    vehicle.pilotUID = -1;
    SoundPlayAt(gSoundDevice, StrSound(MatGetFootstepSound(ActorGetCharacter(pilot).Class!, null)), vehicle.Pos);
  }
}
function FireWeapon(a: TActor, w: Weapon): void {
  if (w.Gun == null) return;
  if (w.Gun.Type === GUNTYPE_MELEE && w.Gun.Normal.Auto && a.guns[a.lastGunIdx].Gun != null) {
    const e = GameEventNew(GAME_EVENT_ACTOR_SWITCH_GUN);
    e.u.UID = a.uid;
    e.u.GunIdx = a.lastGunIdx;
    GameEventsEnqueue(gGameEvents, e);
    return;
  }
  const barrel = ActorGetCanFireBarrel(a, w);
  if (barrel === -1) {
    const unlockedBarrel = WeaponGetUnlockedBarrel(w);
    if (unlockedBarrel >= 0 && gCampaign.Setting.Ammo && w.clickLock <= 0) {
      const es = GameEventNew(GAME_EVENT_SOUND_AT);
      es.u.Sound = 'click';
      es.u.Pos = a.Pos;
      GameEventsEnqueue(gGameEvents, es);
      w.clickLock = SOUND_LOCK_WEAPON_CLICK;
    }
    return;
  }
  ActorFireBarrel(w, a, barrel);
  const ammoId = WC_BARREL(w.Gun, 'AmmoId', barrel);
  if (a.PlayerUID >= 0 && gCampaign.Setting.Ammo && ammoId >= 0) {
    const e = GameEventNew(GAME_EVENT_ACTOR_USE_AMMO);
    e.u.UID = a.uid;
    e.u.PlayerUID = a.PlayerUID;
    e.u.Ammo = { Id: ammoId, Amount: 1 };
    GameEventsEnqueue(gGameEvents, e);
  }
  const firingActor = ActorGetByUID(a.pilotUID)!;
  const cost = WC_BARREL(w.Gun, 'Cost', barrel);
  if (firingActor.PlayerUID >= 0 && cost !== 0) {
    const e = GameEventNew(GAME_EVENT_SCORE);
    e.u.PlayerUID = firingActor.PlayerUID;
    e.u.Score = -cost;
    GameEventsEnqueue(gGameEvents, e);
  }
}
function ActorTryChangeDirection(actor: TActor, cmd: number, prevCmd: number): boolean {
  const willChange = !actor.petrified && CMD_HAS_DIRECTION(cmd) &&
    (!Button2(cmd) || ConfigGetEnum('Game.SwitchMoveStyle') !== SWITCHMOVE_STRAFE) &&
    (!Button1(prevCmd) || ConfigGetEnum('Game.FireMoveStyle') !== FIREMOVE_STRAFE);
  const dir = CmdToDirection(cmd);
  if (willChange && dir !== actor.direction) {
    const e = GameEventNew(GAME_EVENT_ACTOR_DIR);
    e.u.UID = actor.uid;
    e.u.Dir = dir;
    GameEventsEnqueue(gGameEvents, e);
    actor.direction = dir;
  }
  return willChange;
}
function ActorTryShoot(actor: TActor, cmd: number): boolean {
  const willShoot = !actor.petrified && Button1(cmd);
  if (willShoot) {
    FireWeapon(actor, ACTOR_GET_GUN(actor));
  } else {
    const w = ACTOR_GET_GUN(actor);
    for (let i = 0; i < WeaponClassNumBarrels(w.Gun); i++) {
      if (w.barrels[i].state === GUNSTATE_FIRING) {
        const e = GameEventNew(GAME_EVENT_GUN_STATE);
        e.u.ActorUID = actor.uid;
        e.u.Barrel = i;
        e.u.State = GUNSTATE_READY;
        GameEventsEnqueue(gGameEvents, e);
      }
    }
  }
  return willShoot;
}
function TryGrenade(a: TActor, cmd: number): boolean {
  const willGrenade = !a.petrified && (cmd & CMD_GRENADE) !== 0;
  if (willGrenade) FireWeapon(a, ACTOR_GET_GRENADE(a));
  return willGrenade;
}
export function CommandActor(actor: TActor, cmd: number, ticks: number): number {
  if (actor.pickupMenu.pickup) {
    const items = actor.pickupMenu.effect!.Menu.Items;
    if (Button1(cmd) && !Button1(actor.lastCmd)) {
      if (actor.pickupMenu.index < items.length) {
        const m = items[actor.pickupMenu.index];
        let canPickup = false;
        const sound = { s: 'menu_enter' as string | null };
        for (const pe of m.Effects) canPickup = PickupApplyEffect(actor, actor.pickupMenu.pickup, pe, true, sound) || canPickup;
        if (canPickup && sound.s != null) {
          const e = GameEventNew(GAME_EVENT_SOUND_AT);
          e.u.Sound = sound.s;
          e.u.Pos = actor.thing.Pos;
          GameEventsEnqueue(gGameEvents, e);
        }
      }
      actor.pickupMenu.pickup = null;
      actor.pickupMenu.effect = null;
      actor.pickupMenu.index = 0;
      platformHooks.lockInput();
      actor.lastCmd = 0;
      return 0;
    } else if (Up(cmd) && !Up(actor.lastCmd)) {
      actor.pickupMenu.index--;
      if (actor.pickupMenu.index < 0) actor.pickupMenu.index = items.length - 1;
      SoundPlay(gSoundDevice, StrSound('menu_switch'));
    } else if (Down(cmd) && !Down(actor.lastCmd)) {
      actor.pickupMenu.index++;
      if (actor.pickupMenu.index === items.length) actor.pickupMenu.index = 0;
      SoundPlay(gSoundDevice, StrSound('menu_switch'));
    }
  } else {
    actor.hasShot = false;
    if (actor.vehicleUID !== -1) {
      CommandActor(ActorGetByUID(actor.vehicleUID)!, cmd, ticks);
    } else if (actor.pilotUID === -1) {
      // a vehicle without a pilot
    } else {
      if (actor.confused) cmd = CmdGetReverse(cmd);
      if (actor.health > 0) {
        const hasChangedDirection = ActorTryChangeDirection(actor, cmd, actor.lastCmd);
        actor.hasShot = ActorTryShoot(actor, cmd);
        const hasGrenaded = TryGrenade(actor, cmd);
        const hasMoved = ActorTryMove(actor, cmd, ticks);
        let anim: number;
        if (!(hasChangedDirection || actor.hasShot || hasGrenaded || hasMoved)) anim = ACTORANIMATION_IDLE;
        else if (hasMoved) anim = ACTORANIMATION_WALKING;
        else anim = ACTORANIMATION_STAND;
        if (actor.anim.Type !== anim) {
          const e = GameEventNew(GAME_EVENT_ACTOR_STATE);
          e.u.UID = actor.uid;
          e.u.State = anim;
          GameEventsEnqueue(gGameEvents, e);
          actor.anim = AnimationGetActorAnimation(anim);
        }
      }
    }
    actor.specialCmdDir = CMD_HAS_DIRECTION(cmd);
    if (Button2(cmd) && !actor.specialCmdDir) {
      if (!actor.PickupAll && !Button2(actor.lastCmd) && actor.vehicleUID === -1) {
        const e = GameEventNew(GAME_EVENT_ACTOR_PICKUP_ALL);
        e.u.UID = actor.uid;
        e.u.PickupAll = true;
        GameEventsEnqueue(gGameEvents, e);
      }
    }
  }
  actor.lastCmd = cmd;
  return cmd;
}
function ActorTryMove(actor: TActor, cmd: number, ticks: number): boolean {
  const canMoveWhenShooting = actor.PlayerUID < 0
    ? (actor.flags & FLAGS_MOVE_AND_SHOOT) !== 0
    : ConfigGetEnum('Game.FireMoveStyle') !== FIREMOVE_STOP ||
      (ConfigGetEnum('Game.SwitchMoveStyle') === SWITCHMOVE_STRAFE && Button2(cmd));
  const canMove = !actor.hasShot || canMoveWhenShooting;
  const willMove = !actor.petrified && CMD_HAS_DIRECTION(cmd) && canMove;
  actor.MoveVel = svec2_zero();
  if (willMove) {
    const moveAmount = f32(ActorGetCharacter(actor).speed * ticks);
    const moveVel = { x: 0, y: 0 };
    if (Left(cmd)) moveVel.x--;
    else if (Right(cmd)) moveVel.x++;
    if (Up(cmd)) moveVel.y--;
    else if (Down(cmd)) moveVel.y++;
    if (!svec2_is_zero(moveVel)) actor.MoveVel = svec2_scale(svec2_normalize(moveVel), moveAmount);
  }
  if (cmd !== actor.lastCmd || actor.hasCollided) {
    const e = GameEventNew(GAME_EVENT_ACTOR_MOVE);
    e.u.UID = actor.uid;
    e.u.Pos = actor.Pos;
    e.u.MoveVel = actor.MoveVel;
    GameEventsEnqueue(gGameEvents, e);
  }
  return willMove || !svec2_is_zero(actor.thing.Vel);
}
export function SlideActor(actor: TActor, cmd: number): void {
  if (actor.slideLock > 0) return;
  if (actor.petrified) return;
  if (actor.confused) cmd = CmdGetReverse(cmd);
  const e = GameEventNew(GAME_EVENT_ACTOR_SLIDE);
  e.u.UID = actor.uid;
  const vel = { x: 0, y: 0 };
  if (Left(cmd)) vel.x = -SLIDE_X;
  else if (Right(cmd)) vel.x = SLIDE_X;
  if (Up(cmd)) vel.y = -SLIDE_Y;
  else if (Down(cmd)) vel.y = SLIDE_Y;
  e.u.Vel = vel;
  GameEventsEnqueue(gGameEvents, e);
  actor.slideLock = SLIDE_LOCK;
}
export function UpdateAllActors(ticks: number): void {
  for (let i = 0; i < gActors.length; i++) {
    const actor = gActors[i];
    if (!actor.isInUse) continue;
    if (actor.vehicleUID !== -1) {
      const vehicle = ActorGetByUID(actor.vehicleUID)!;
      if (vehicle.dead) actor.vehicleUID = -1;
    }
    if (actor.pilotUID !== -1 && actor.pilotUID !== actor.uid) {
      const pilot = ActorGetByUID(actor.pilotUID)!;
      if (pilot.dead) actor.pilotUID = -1;
    }
    ActorUpdatePosition(actor, ticks);
    UpdateActorState(actor, ticks);
    const deathSprites = CharacterClassGetDeathSprites(ActorGetCharacter(actor).Class!);
    if (actor.dead && (deathSprites == null || actor.dead - 1 > deathSprites.pics.length)) {
      if (!gCampaign.IsClient) ActorDie(actor);
      continue;
    }
    if (!gCampaign.IsClient && gCollisionSystem.allyCollision === ALLYCOLLISION_REPEL) {
      const collidingItem = OverlapGetFirstItem(actor.thing, actor.Pos, actor.thing.size, actor.thing.Vel,
        { ThingMask: THING_IMPASSABLE, Team: COLLISIONTEAM_NONE, IsPVP: IsPVP(gCampaign.Entry.Mode), AllActors: false });
      if (collidingItem && collidingItem.kind === KIND_CHARACTER) {
        const collidingActor = gActors[collidingItem.id];
        if (CalcCollisionTeam(true, collidingActor) === CalcCollisionTeam(true, actor)) {
          let v = svec2_subtract(actor.Pos, collidingActor.Pos);
          if (svec2_is_zero(v)) v = svec2(1, 0);
          v = svec2_scale(svec2_normalize(v), REPEL_STRENGTH);
          let e = GameEventNew(GAME_EVENT_ACTOR_IMPULSE);
          e.u.UID = actor.uid;
          e.u.Vel = v;
          e.u.Pos = actor.Pos;
          GameEventsEnqueue(gGameEvents, e);
          e = GameEventNew(GAME_EVENT_ACTOR_IMPULSE);
          e.u.UID = collidingActor.uid;
          e.u.Vel = svec2_scale(v, -1);
          e.u.Pos = collidingActor.Pos;
          GameEventsEnqueue(gGameEvents, e);
        }
      }
    }
    if (ActorIsLowHealth(actor)) {
      actor.bleedCounter -= ticks;
      if (actor.bleedCounter <= 0) {
        ActorAddBloodSplatters(actor, 1, 1.0, svec2_zero());
        actor.bleedCounter += ActorGetHealthPercent(actor);
      }
    }
  }
}
function ActorUpdatePosition(actor: TActor, ticks: number): void {
  let newPos: Vec2;
  if (actor.vehicleUID !== -1) {
    newPos = ActorGetByUID(actor.vehicleUID)!.Pos;
  } else {
    newPos = svec2_add(actor.Pos, actor.MoveVel);
    if (!svec2_is_zero(actor.thing.Vel)) {
      newPos = svec2_add(newPos, svec2_scale(actor.thing.Vel, ticks));
      const v = { x: actor.thing.Vel.x, y: actor.thing.Vel.y };
      for (let i = 0; i < ticks; i++) {
        if (v.x > FLT_EPSILON) v.x = MAX(0, f32(v.x - VEL_DECAY_X));
        else if (v.x < -FLT_EPSILON) v.x = MIN(0, f32(v.x + VEL_DECAY_X));
        if (v.y > FLT_EPSILON) v.y = MAX(0, f32(v.y - VEL_DECAY_Y));
        else if (v.y < FLT_EPSILON) v.y = MIN(0, f32(v.y + VEL_DECAY_Y));
      }
      actor.thing.Vel = v;
    }
  }
  if (!svec2_is_nearly_equal(actor.Pos, newPos, EPSILON_POS)) TryMoveActor(actor, newPos);
  CheckManualPickups(actor);
}
function CheckManualPickups(a: TActor): void {
  if (a.PlayerUID < 0) return;
  const params: CollisionParams = { ThingMask: 0, Team: CalcCollisionTeam(true, a), IsPVP: IsPVP(gCampaign.Entry.Mode), AllActors: false };
  OverlapThings(a.thing, a.Pos, a.thing.Vel, a.thing.size, params, (ti) => {
    if (ti.kind !== KIND_PICKUP) return true;
    const p: Pickup = gPickups[ti.id];
    if (!PickupIsManual(a, p)) return true;
    const pData = PlayerDataGetByUID(a.PlayerUID)!;
    if (pData.IsLocal && IsPlayerHuman(pData)) {
      const buttonName = platformHooks.buttonName(pData, CMD_BUTTON2);
      let buf = `${buttonName} to pick up\n${PickupClassGetName(p.class)}`;
      const plus = buf.lastIndexOf('+');
      if (plus >= 0) buf = buf.slice(0, plus);
      ActorSetChatter(a, buf, 2);
    }
    if (a.aiContext != null) {
      for (const pe of p.class.Effects) if (pe.Type === PICKUP_GUN) AICoopOnPickupGun(a, pe.GunId);
    }
    a.CanPickupSpecial = true;
    return false;
  }, null, null);
  CheckManualPilot(a, { ThingMask: THING_IMPASSABLE | THING_CAN_BE_SHOT, Team: params.Team, IsPVP: params.IsPVP, AllActors: true });
}
function CheckManualPilot(a: TActor, params: CollisionParams): void {
  if (a.vehicleUID >= 0) return;
  const ti = OverlapGetFirstItem(a.thing, a.Pos, a.thing.size, a.thing.Vel, params);
  if (ti == null || ti.kind !== KIND_CHARACTER) return;
  const vehicle = gActors[ti.id];
  if (vehicle.pilotUID >= 0) return;
  const pData = PlayerDataGetByUID(a.PlayerUID)!;
  if (pData.IsLocal && IsPlayerHuman(pData)) {
    const buttonName = platformHooks.buttonName(pData, CMD_BUTTON2);
    ActorSetChatter(a, `${buttonName} to pilot\n${ActorGetCharacter(vehicle).Class!.Name}`, 2);
  }
  a.CanPickupSpecial = true;
}
function ActorDie(actor: TActor): void {
  if (ConfigGetEnum('Graphics.Gore') !== GORE_NONE) {
    const c = ActorGetCharacter(actor);
    const ea = GameEventNew(GAME_EVENT_MAP_OBJECT_ADD);
    ea.u.UID = ObjsGetNextUID();
    let corpse = StrMapObject(c.Class!.Corpse);
    if (!corpse) {
      corpse = GetRandomBloodPool();
      ea.u.Mask = { ...c.Class!.BloodColor };
    }
    ea.u.MapObjectClass = corpse.Name;
    ea.u.Pos = actor.Pos;
    ea.u.ThingFlags = MapObjectGetFlags(corpse);
    ea.u.Health = corpse.Health;
    GameEventsEnqueue(gGameEvents, ea);
  }
  const e = GameEventNew(GAME_EVENT_ACTOR_DIE);
  e.u.UID = actor.uid;
  GameEventsEnqueue(gGameEvents, e);
  ActorPersistPlayerWeaponsAndAmmo(actor);
}
function ActorAddAmmoPickup(actor: TActor): void {
  if (IsUnarmedBot(actor)) return;
  for (let i = 0; i < MAX_WEAPONS; i++) {
    const w = actor.guns[i];
    if (w.Gun == null) continue;
    for (let j = 0; j < WeaponClassNumBarrels(w.Gun); j++) {
      const ammoId = WC_BARREL(w.Gun, 'AmmoId', j);
      if (ammoId < 0) continue;
      if (PlayersNumUseAmmo(ammoId) === 0) continue;
      const e = GameEventNew(GAME_EVENT_ADD_PICKUP);
      e.u.PickupClass = `ammo_${AmmoGetById(ammoId)!.Name}`;
      const ox = f32(RAND_INT(-TILE_WIDTH, TILE_WIDTH) / 2);
      const oy = f32(RAND_INT(-TILE_HEIGHT, TILE_HEIGHT) / 2);
      e.u.Pos = svec2_add(actor.Pos, svec2(ox, oy));
      GameEventsEnqueue(gGameEvents, e);
    }
  }
}
function ActorAddGunPickup(actor: TActor): void {
  if (IsUnarmedBot(actor)) return;
  for (let i = 0; i < MAX_WEAPONS; i++) {
    let wc = actor.guns[i].Gun;
    if (wc == null) continue;
    if (!wc.CanDrop) continue;
    if (wc.DropGun) wc = StrWeaponClass(wc.DropGun)!;
    if (HasGunPickups(wc, 2)) continue;
    PickupAddGun(wc, actor.Pos);
    break;
  }
}
function HasGunPickups(wc: WeaponClass, n: number): boolean {
  const wcId = WeaponClassId(wc);
  let count = 0;
  for (const p of gPickups) {
    if (!p.isInUse) continue;
    if (p.class.Effects.some((pe) => pe.Type === PICKUP_GUN && pe.GunId === wcId)) {
      count++;
      if (count >= n) return true;
    }
  }
  return false;
}
function IsUnarmedBot(actor: TActor): boolean {
  const c = ActorGetCharacter(actor);
  return c.bot != null && c.bot.probabilityToShoot === 0;
}
export function ActorsPilotVehicles(): void {
  for (let i = 0; i < gActors.length; i++) {
    const vehicle = gActors[i];
    if (!vehicle.isInUse) continue;
    if (vehicle.pilotUID === -1) VehicleTakePilot(vehicle);
  }
}
function VehicleTakePilot(vehicle: TActor): void {
  for (let i = 0; i < gActors.length; i++) {
    const pilot = gActors[i];
    if (!pilot.isInUse) continue;
    if (pilot.pilotUID === pilot.uid && AABBOverlap(vehicle.Pos, pilot.Pos, vehicle.thing.size, pilot.thing.size)) {
      const e = GameEventNew(GAME_EVENT_ACTOR_PILOT);
      e.u.On = true;
      e.u.UID = pilot.uid;
      e.u.VehicleUID = vehicle.uid;
      GameEventsEnqueue(gGameEvents, e);
      break;
    }
  }
}
export function ActorsInit(): void {
  gActors.length = 0;
  uidCounters.actors = 0;
}
export function ActorsTerminate(): void {
  for (const a of gActors) if (a.isInUse) ActorDestroy(a);
  gActors.length = 0;
}
export const ActorsGetNextUID = (): number => uidCounters.actors++;
export function ActorsGetFreeIndex(): number {
  const i = gActors.findIndex((a) => !a.isInUse);
  return i >= 0 ? i : gActors.length;
}
function newActor(): TActor {
  return {
    Pos: svec2_zero(), MoveVel: svec2_zero(), direction: 0, DrawRadians: 0, anim: AnimationGetActorAnimation(ACTORANIMATION_IDLE),
    stateCounter: 0, lastCmd: 0, hasCollided: false, specialCmdDir: false, PickupAll: false, CanPickupSpecial: false,
    charId: 0, PlayerUID: 0, uid: 0, pilotUID: 0, vehicleUID: 0, guns: [WeaponCreate(null), WeaponCreate(null), WeaponCreate(null), WeaponCreate(null)],
    ammo: [], gunIndex: 0, lastGunIdx: 0, health: 0, dead: 0, flamed: 0, poisoned: 0, petrified: 0, confused: 0, flags: 0,
    turns: 0, slideLock: 0, accumulatedDamage: 0, damageCooldownTicks: 0, grimaceCounter: 0, voiceChannel: 0, Chatter: '',
    ChatterCounter: 0, barrelSmoke: newEmitter(), healEffect: newEmitter(), slideEffect: newEmitter(),
    confusionEffect: newEmitter(), poisonEffect: newEmitter(), flameEffect: newEmitter(), iceEffect: newEmitter(),
    blood1: newEmitter(), blood2: newEmitter(), blood3: newEmitter(), bleedCounter: 0, footprintMask: { ...colorTransparent },
    footprintCounter: 0, hasShot: false, isHatDetached: false, pickupMenu: { pickup: null, effect: null, index: 0 }, action: 0,
    aiContext: null, thing: newThing(0, KIND_CHARACTER, svec2i(ACTOR_W, ACTOR_H), 0), isInUse: false,
  };
}
export function ActorAdd(aa: GameEventU): TActor | null {
  if (ActorGetByUID(aa.UID) != null) return null;
  const id = ActorsGetFreeIndex();
  while (id >= gActors.length) gActors.push(newActor());
  const actor = newActor();
  gActors[id] = actor;
  actor.uid = aa.UID;
  actor.pilotUID = aa.PilotUID;
  actor.vehicleUID = aa.VehicleUID;
  for (let i = 0; i < AmmoGetNumClasses(); i++) actor.ammo.push(AmmoGetById(i)!.Amount * AMMO_STARTING_MULTIPLE);
  if (gMission.missionData && gMission.missionData.WeaponPersist) {
    for (const am of aa.Ammo as { Id: number; Amount: number }[]) {
      const ammo = AmmoGetById(am.Id);
      if (ammo && (gCampaign.Setting.BuyAndSell || am.Amount > ammo.Amount * AMMO_STARTING_MULTIPLE)) actor.ammo[am.Id] = am.Amount;
    }
  }
  actor.PlayerUID = aa.PlayerUID;
  actor.charId = aa.CharId;
  const c = ActorGetCharacter(actor);
  if (aa.PlayerUID >= 0) {
    const p = PlayerDataGetByUID(aa.PlayerUID)!;
    for (let i = 0; i < MAX_WEAPONS; i++) {
      actor.guns[i] = WeaponCreate(p.guns[i]);
      if (i < MAX_GUNS && ACTOR_GET_GUN(actor).Gun == null) actor.gunIndex = i;
    }
    p.ActorUID = aa.UID;
  } else {
    actor.guns[0] = WeaponCreate(c.Gun);
    actor.gunIndex = 0;
    if (c.Melee) actor.guns[MELEE_SLOT] = WeaponCreate(c.Melee);
  }
  actor.health = aa.Health;
  actor.voiceChannel = -1;
  actor.action = ACTORACTION_MOVING;
  actor.thing = newThing(id, KIND_CHARACTER, svec2i(ACTOR_W, ACTOR_H), THING_IMPASSABLE | THING_CAN_BE_SHOT | aa.ThingFlags);
  actor.isInUse = true;
  actor.flags = FLAGS_SLEEPING | c.flags;
  if (actor.flags & FLAGS_AWAKEALWAYS) actor.flags &= ~FLAGS_SLEEPING;
  if (actor.thing.flags & THING_OBJECTIVE) {
    const o = gMission.missionData!.Objectives[ObjectiveFromThing(actor.thing.flags)];
    if (o.Type === OBJECTIVE_RESCUE && !(actor.flags & FLAGS_PRISONER) && !gCampaign.IsClient) {
      const e = GameEventNew(GAME_EVENT_RESCUE_CHARACTER);
      e.u.UID = aa.UID;
      GameEventsEnqueue(gGameEvents, e);
      UpdateMissionObjective(gMission, actor.thing.flags, OBJECTIVE_RESCUE, 1);
    }
  }
  actor.direction = aa.Direction;
  actor.DrawRadians = f32(dir2radians[actor.direction]);
  actor.anim = AnimationGetActorAnimation(ACTORANIMATION_IDLE);
  actor.slideLock = 0;
  if (c.bot) {
    actor.aiContext = AIContextNew();
    ActorSetAIState(actor, AI_STATE_IDLE);
  }
  const barrelSmoke = StrParticleClass('smoke');
  if (barrelSmoke) EmitterInit(actor.barrelSmoke, barrelSmoke, svec2_zero(), f32(-0.05), f32(0.05), 3, 3, 0, 0, 10);
  const healthPlus = StrParticleClass('health_plus');
  if (healthPlus) EmitterInit(actor.healEffect, healthPlus, svec2_zero(), f32(-0.1), f32(0.1), 0, 0, 0, 0, 0);
  const slideDust = StrParticleClass('slide_dust');
  if (slideDust) EmitterInit(actor.slideEffect, slideDust, svec2_zero(), f32(-0.05), f32(0.05), 3, 3, 0, 0, 10);
  const confusionStars = StrParticleClass('confusion_stars');
  if (confusionStars) EmitterInit(actor.confusionEffect, confusionStars, svec2_zero(), 0, 0, 0, 0, 0, 1.0, 350);
  const poisonBubble = StrParticleClass('poison_bubble');
  if (poisonBubble) EmitterInit(actor.poisonEffect, poisonBubble, svec2_zero(), f32(-0.05), f32(0.05), 3, 3, 0, 0, 10);
  const flame = StrParticleClass('flame');
  if (flame) EmitterInit(actor.flameEffect, flame, svec2_zero(), f32(-0.1), f32(0.1), 6, 9, 0, 0, 5);
  const iceSparkle = StrParticleClass('ice_sparkle');
  if (iceSparkle) EmitterInit(actor.iceEffect, iceSparkle, svec2_zero(), 0, 0, 0, 0, 0, 0, 30);
  GoreEmitterInit(actor.blood1, 'blood1');
  GoreEmitterInit(actor.blood2, 'blood2');
  GoreEmitterInit(actor.blood3, 'blood3');
  TryMoveActor(actor, { ...aa.Pos });
  return actor;
}
function GoreEmitterInit(em: ReturnType<typeof newEmitter>, name: string): void {
  EmitterInit(em, StrParticleClass(name), svec2_zero(), 0, GORE_EMITTER_MAX_SPEED, 6, 12, -0.1, 0.1, 0);
}
export function ActorDestroy(a: TActor): void {
  MapRemoveThing(gMap, a.thing);
  const p = PlayerDataGetByUID(a.PlayerUID);
  if (p != null) p.ActorUID = -1;
  a.isInUse = false;
}
export function ActorGetByUID(uid: number): TActor | null {
  for (const a of gActors) if (a.uid === uid) return a;
  return null;
}
export function ActorGetCharacter(a: TActor): Character {
  if (a.PlayerUID >= 0) return PlayerDataGetByUID(a.PlayerUID)!.Char;
  return gCampaign.Setting.characters.OtherChars[a.charId];
}
export function ActorGetAverageWeaponMuzzleOffset(a: TActor): Vec2 {
  const w = ACTOR_GET_WEAPON(a);
  let offset = svec2_zero();
  const n = WeaponClassNumBarrels(w.Gun);
  for (let i = 0; i < n; i++) offset = svec2_add(offset, ActorGetMuzzleOffset(a, w, i));
  return svec2_scale(offset, f32(1.0 / f32(n)));
}
export function ActorGetMuzzleOffset(a: TActor, w: Weapon, barrel: number): Vec2 {
  const c = ActorGetCharacter(a);
  return WeaponClassGetBarrelMuzzleOffset(w.Gun!, c.Class!.Sprites!, barrel, a.direction, w.barrels[barrel].state);
}
export function ActorWeaponGetAmmo(a: TActor, wc: WeaponClass | null, barrel: number): number {
  if (wc == null) return 0;
  const ammoId = WC_BARREL(wc, 'AmmoId', barrel);
  if (ammoId === -1) return -1;
  return a.ammo[ammoId];
}
export function ActorGetCanFireBarrel(a: TActor, w: Weapon): number {
  if (w.Gun == null) return -1;
  const barrel = WeaponGetUnlockedBarrel(w);
  if (barrel === -1) return -1;
  const hasAmmo = ActorWeaponGetAmmo(a, w.Gun, barrel) !== 0;
  if (gCampaign.Setting.Ammo && !hasAmmo) return -1;
  return barrel;
}
export function ActorCanSwitchToWeapon(a: TActor, slot: number): boolean {
  const wc = a.guns[slot].Gun;
  if (wc == null) return false;
  if (slot === MELEE_SLOT && wc.Normal.Auto) {
    for (let i = 0; i < MELEE_SLOT; i++) {
      const wc2 = a.guns[i].Gun;
      if (wc2 != null) {
        if (!gCampaign.Setting.Ammo) return false;
        for (let j = 0; j < WeaponClassNumBarrels(wc2); j++) if (ActorWeaponGetAmmo(a, wc2, j) !== 0) return false;
      }
    }
  }
  if (slot === GRENADE_SLOT) return !PlayerHasGrenadeButton(PlayerDataGetByUID(a.PlayerUID));
  return true;
}
export function ActorTrySwitchWeapon(a: TActor): boolean {
  const startIndex = ActorGetNumGuns(a) > 0 ? a.gunIndex : MAX_GUNS;
  let weaponIndex = startIndex;
  do {
    weaponIndex = (weaponIndex + 1) % MAX_WEAPONS;
  } while (!ActorCanSwitchToWeapon(a, weaponIndex));
  if (weaponIndex === startIndex) return false;
  const e = GameEventNew(GAME_EVENT_ACTOR_SWITCH_GUN);
  e.u.UID = a.uid;
  e.u.GunIdx = weaponIndex;
  GameEventsEnqueue(gGameEvents, e);
  return true;
}
export function ActorSwitchGun(sg: GameEventU): void {
  const a = ActorGetByUID(sg.UID);
  if (a == null || !a.isInUse) return;
  a.gunIndex = sg.GunIdx;
  if (sg.GunIdx < MELEE_SLOT) a.lastGunIdx = sg.GunIdx;
  const gun = ACTOR_GET_WEAPON(a).Gun!;
  SoundPlayAt(gSoundDevice, gun.SwitchSound, a.thing.Pos);
  if (a.PlayerUID >= 0) ActorSetChatter(a, gun.name, CHATTER_SWITCH_GUN);
}
export function ActorPickupGun(a: TActor, wc: WeaponClass): void {
  let actorsGunIdx = ActorFindGun(a, wc);
  if (actorsGunIdx >= 0) {
    if (ActorCanSwitchToWeapon(a, actorsGunIdx)) {
      const e = GameEventNew(GAME_EVENT_ACTOR_SWITCH_GUN);
      e.u.UID = a.uid;
      e.u.GunIdx = actorsGunIdx;
      GameEventsEnqueue(gGameEvents, e);
    }
    PickupAddGun(wc, a.Pos);
  } else {
    const [slotStart, slotEnd] = GunTypeGetSlotStartEnd(wc.Type);
    if (actorsGunIdx < slotStart || actorsGunIdx > slotEnd) actorsGunIdx = slotStart;
    const e = GameEventNew(GAME_EVENT_ACTOR_REPLACE_GUN);
    e.u.UID = a.uid;
    e.u.Gun = wc.name;
    switch (wc.Type) {
      case GUNTYPE_MELEE: e.u.GunIdx = MELEE_SLOT; break;
      case GUNTYPE_GRENADE: e.u.GunIdx = GRENADE_SLOT; break;
      default: e.u.GunIdx = a.gunIndex < MELEE_SLOT ? a.gunIndex : 0; break;
    }
    let replaceGunIndex = e.u.GunIdx;
    for (let i = slotStart; i <= slotEnd; i++) {
      if (a.guns[i].Gun == null) {
        e.u.GunIdx = i;
        replaceGunIndex = -1;
        break;
      }
    }
    GameEventsEnqueue(gGameEvents, e);
    if (replaceGunIndex >= 0) PickupAddGun(a.guns[replaceGunIndex].Gun!, a.Pos);
  }
}
export function ActorIsImmune(actor: TActor, damage: number): boolean {
  switch (damage) {
    case SPECIAL_FLAME: return (actor.flags & FLAGS_ASBESTOS) !== 0;
    case SPECIAL_POISON:
    case SPECIAL_PETRIFY:
    case SPECIAL_CONFUSE:
      return (actor.flags & FLAGS_IMMUNITY) !== 0;
    default:
      break;
  }
  return actor.health <= 0;
}
export function ActorTakesDamage(actor: TActor, damage: number): boolean {
  return damage === SPECIAL_FLAME ? !(actor.flags & FLAGS_ASBESTOS) : true;
}
const MAX_POISONED_COUNT = 140;
function ActorTakeSpecialDamage(actor: TActor, damage: number, ticks: number): void {
  if (ActorIsImmune(actor, damage)) return;
  switch (damage) {
    case SPECIAL_FLAME: actor.flamed = ticks; break;
    case SPECIAL_POISON: actor.poisoned = MIN(actor.poisoned + ticks, MAX_POISONED_COUNT); break;
    case SPECIAL_PETRIFY: if (!actor.petrified) actor.petrified = ticks; break;
    case SPECIAL_CONFUSE: actor.confused = ticks; break;
    default: break;
  }
}
export function ActorHit(d: GameEventU): void {
  const a = ActorGetByUID(d.UID)!;
  if (!a.isInUse) return;
  ActorTakeHit(a, d);
  if (d.Power > 0) {
    DamageActor(a, d.Power, d.SourceActorUID);
    let damage = d.Power | 0;
    const rx = RAND_FLOAT(-3, 3);
    const ry = RAND_FLOAT(-3, 3);
    let pos = svec2_add(a.Pos, svec2(rx, ry));
    for (let i = 0; i < gParticles.length; i++) {
      const p = gParticles[i];
      if (p.isInUse && p.ActorUID === a.uid) {
        damage += a.accumulatedDamage;
        if (svec2_distance(pos, p.Pos) < DAMAGE_TEXT_DISTANCE_RESET_THRESHOLD) pos = p.Pos;
        const e = GameEventNew(GAME_EVENT_PARTICLE_REMOVE);
        e.u.ParticleRemoveId = i;
        GameEventsEnqueue(gGameEvents, e);
        break;
      }
    }
    a.accumulatedDamage = damage;
    a.damageCooldownTicks = 0;
    const s = GameEventNew(GAME_EVENT_ADD_PARTICLE);
    s.u.Class = StrParticleClass('damage_text');
    s.u.ActorUID = a.uid;
    s.u.Pos = pos;
    s.u.Z = BULLET_Z * Z_FACTOR;
    s.u.DZ = 3;
    s.u.Text = `-${damage}`;
    GameEventsEnqueue(gGameEvents, s);
    ActorAddBloodSplatters(a, d.Power, d.Mass, d.Vel);
    if (a.PlayerUID >= 0) {
      const p = PlayerDataGetByUID(a.PlayerUID)!;
      if (p.inputDevice === INPUT_DEVICE_JOYSTICK) platformHooks.joyImpact(p.deviceIndex);
    }
    a.grimaceCounter = GRIMACE_HIT_TICKS;
    const sourceWC = StrWeaponClass(d.SourceWeaponClassName);
    const c = ActorGetCharacter(a);
    const hat = c.HeadParts[HEAD_PART_HAT];
    if (sourceWC && sourceWC.Type === GUNTYPE_NORMAL && !a.isHatDetached && damage > 0 &&
      a.health < Math.trunc(c.maxHealth / 2) && a.health > 0 && RAND_INT(0, 3) === 0 && hat && hat.length > 0) {
      const hatParticle = StrParticleClass(`hat/${hat}`);
      if (hatParticle) {
        const e = GameEventNew(GAME_EVENT_ADD_PARTICLE);
        e.u.Class = hatParticle;
        e.u.Pos = a.thing.Pos;
        e.u.Z = 16 * Z_FACTOR;
        e.u.DZ = 12;
        e.u.Vel = svec2_scale(svec2_normalize(d.Vel), f32(0.4));
        e.u.Spin = RAND_DOUBLE(-0.5, 0.5);
        e.u.ActorUID = a.uid;
        GameEventsEnqueue(gGameEvents, e);
        const es = GameEventNew(GAME_EVENT_SOUND_AT);
        es.u.Sound = 'headshot';
        es.u.Pos = a.Pos;
        GameEventsEnqueue(gGameEvents, es);
        a.isHatDetached = true;
      }
    }
  }
}
function ActorTakeHit(actor: TActor, d: GameEventU): void {
  if (!gCampaign.IsClient) AIWake(actor, 1);
  const source = ActorGetByUID(d.SourceActorUID);
  const playerUID = source != null ? source.PlayerUID : -1;
  if (ActorIsInvulnerable(actor, d.Flags, playerUID, gCampaign.Entry.Mode, d.Special)) return;
  ActorTakeSpecialDamage(actor, d.Special, d.SpecialTicks);
  if (!gCampaign.IsClient && playerUID >= 0 && d.SourceWeaponClassName.length > 0) {
    const p = PlayerDataGetByUID(playerUID)!;
    WeaponUsagesUpdate(p.WeaponUsages, StrWeaponClass(d.SourceWeaponClassName), 0, 1);
  }
}
export function ActorIsInvulnerable(actor: TActor, flags: number, playerUID: number, mode: number, special: number): boolean {
  if (actor.flags & FLAGS_INVULNERABLE) return true;
  if (!(flags & FLAGS_HURTALWAYS) && !(actor.flags & FLAGS_VICTIM)) {
    if (playerUID >= 0 && playerUID === actor.PlayerUID) return true;
    const isGood = playerUID >= 0 || (flags & FLAGS_GOOD_GUY) !== 0;
    const isTargetGood = actor.PlayerUID >= 0 || (actor.flags & FLAGS_GOOD_GUY) !== 0;
    if (!IsPVP(mode) && !ConfigGetBool('Game.FriendlyFire') && isGood && isTargetGood) return true;
    if (!isGood && !isTargetGood) return true;
    if (!ActorTakesDamage(actor, special)) return true;
  }
  return false;
}
function ActorAddBloodSplatters(a: TActor, power: number, mass: number, hitVector: Vec2): void {
  const ga = ConfigGetEnum('Graphics.Gore');
  if (ga === GORE_NONE) return;
  const bloodColor = ActorGetCharacter(a).Class!.BloodColor;
  if (bloodColor.a === 0) return;
  let bloodPower = power * 2;
  let bloodSize = 1;
  const hitVNorm = svec2_normalize(hitVector);
  const speedBase = f32(MAX(1.0, f32(mass)) * SHOT_IMPULSE_FACTOR);
  while (bloodPower > 0) {
    const em = bloodSize === 1 ? a.blood1 : bloodSize === 2 ? a.blood2 : a.blood3;
    bloodSize++;
    if (bloodSize > 3) bloodSize = 1;
    const vel = svec2_scale(hitVNorm, f32(speedBase * RAND_FLOAT(0.5, 1)));
    const ap = newAddParticle();
    ap.Pos = a.Pos;
    ap.Angle = NaN;
    ap.Z = 10;
    ap.Vel = vel;
    ap.Mask = { ...bloodColor };
    EmitterStart(em, ap);
    switch (ga) {
      case GORE_LOW: bloodPower = Math.trunc(bloodPower / 8); break;
      case GORE_MEDIUM: bloodPower = Math.trunc(bloodPower / 2); break;
      default: bloodPower = Math.trunc((bloodPower * 7) / 8); break;
    }
  }
}
export function ActorGetMaxHeal(a: TActor, exceedMax: boolean): number {
  const c = ActorGetCharacter(a);
  return exceedMax ? c.excessHealth : c.maxHealth;
}
export function ActorGetHealthPercent(a: TActor): number {
  return Math.trunc((a.health * 100) / ActorGetCharacter(a).maxHealth);
}
export function ActorIsLowHealth(a: TActor): boolean {
  return ActorGetHealthPercent(a) < LOW_HEALTH_PERCENTAGE;
}
export function ActorIsGrimacing(a: TActor): boolean {
  const gun = ACTOR_GET_WEAPON(a);
  if (gun.Gun) {
    for (let i = 0; i < WeaponClassNumBarrels(gun.Gun); i++) {
      if (gun.barrels[i].state === GUNSTATE_FIRING || gun.barrels[i].state === GUNSTATE_RECOIL) return true;
    }
  }
  return a.grimaceCounter % GRIMACE_PERIOD > GRIMACE_PERIOD / 2;
}
export function ActorIsLocalPlayer(uid: number): boolean {
  const a = ActorGetByUID(uid);
  if (a == null) return true;
  return PlayerIsLocal(a.PlayerUID);
}
export function ActorPersistPlayerWeaponsAndAmmo(a: TActor): void {
  const p = PlayerDataGetByUID(a.PlayerUID);
  if (p == null) return;
  for (let i = 0; i < MAX_WEAPONS; i++) p.guns[i] = a.guns[i].Gun;
  p.ammo = [...a.ammo];
}
export function ActorBark(ab: GameEventU): void {
  const a = ActorGetByUID(ab.UID);
  if (a == null || !a.isInUse) return;
  if (a.voiceChannel >= 0) SoundHalt(a.voiceChannel);
  a.voiceChannel = SoundPlayAt(gSoundDevice, StrSound(ab.Sound), a.Pos);
}
/** Mix_ChannelFinished(ActorVoiceChannelFinished): the sound player reports finished channels */
export function ActorVoiceChannelFinished(channel: number): void {
  for (const a of gActors) {
    if (a.voiceChannel === channel) {
      a.voiceChannel = -1;
      break;
    }
  }
}

// --- damage.c ----------------------------------------------------------------------------------------------------

export function DamageActor(victim: TActor, power: number, sourceActorUID: number): void {
  const startingHealth = victim.health;
  InjureActor(victim, power);
  const source = ActorGetByUID(sourceActorUID);
  if (source != null) {
    const pd = PlayerDataGetByUID(source.PlayerUID);
    if (pd != null && startingHealth > 0 && victim.health <= 0) TrackKills(pd, victim);
  }
}
function TrackKills(pd: PlayerData, victim: TActor): void {
  if (!IsPVP(gCampaign.Entry.Mode) && (victim.PlayerUID >= 0 || (victim.flags & (FLAGS_GOOD_GUY | FLAGS_PENALTY)))) {
    pd.Stats.Friendlies++;
    pd.Totals.Friendlies++;
  } else if (pd.UID === victim.PlayerUID) {
    pd.Stats.Suicides++;
    pd.Totals.Suicides++;
  } else {
    pd.Stats.Kills++;
    pd.Totals.Kills++;
  }
}
const MELEE_SPREAD_FACTOR = f32(0.5);
const MELEE_VEL_SCALE = 40.0;
export function DamageMelee(m: GameEventU): void {
  const a = ActorGetByUID(m.UID)!;
  if (!a.isInUse) return;
  const b = StrBulletClass(m.BulletClass)!;
  if (m.HitType !== HIT_NONE && HasHitSound(m.TargetKind, m.TargetUID, SPECIAL_NONE, false)) PlayHitSound(b, m.HitType, a.Pos);
  if (!gCampaign.IsClient) {
    const target = ThingGetByUID(m.TargetKind, m.TargetUID)!;
    const sx = RAND_FLOAT(-MELEE_SPREAD_FACTOR, MELEE_SPREAD_FACTOR);
    const sy = RAND_FLOAT(-MELEE_SPREAD_FACTOR, MELEE_SPREAD_FACTOR);
    const vel = svec2_scale(svec2_add(svec2_normalize(svec2_subtract(target.Pos, a.Pos)), svec2(sx, sy)), MELEE_VEL_SCALE);
    Damage(vel, b, null, a.flags, a, m.TargetKind, m.TargetUID);
  }
}

// --- actor_fire.c --------------------------------------------------------------------------------------------------

export function ActorFireBarrel(w: Weapon, a: TActor, barrel: number): void {
  if (w.barrels[barrel].state !== GUNSTATE_FIRING && w.barrels[barrel].state !== GUNSTATE_RECOIL) {
    const e = GameEventNew(GAME_EVENT_GUN_STATE);
    e.u.ActorUID = a.uid;
    e.u.Barrel = barrel;
    e.u.State = GUNSTATE_FIRING;
    GameEventsEnqueue(gGameEvents, e);
  }
  if (!WeaponClassCanShoot(w.Gun!)) return;
  const radians = dir2radians[a.direction];
  const muzzlePosition = svec2_add(a.Pos, ActorGetMuzzleOffset(a, w, barrel));
  const playSound = w.barrels[barrel].soundLock <= 0;
  const firingActor = ActorGetByUID(a.pilotUID)!;
  WeaponClassFire(WeaponClassGetBarrel(w.Gun!, barrel), muzzlePosition,
    WeaponClassGetMuzzleHeight(w.Gun!, GUNSTATE_FIRING, barrel), radians, firingActor.flags, firingActor.uid, playSound, true);
  WeaponBarrelOnFire(w, barrel);
}
export function ActorFireUpdate(w: Weapon, a: TActor, ticks: number): void {
  if (!ConfigGetBool('Sound.Reloads')) return;
  for (let i = 0; i < WeaponClassNumBarrels(w.Gun); i++) {
    const reloadLead = WC_BARREL(w.Gun!, 'ReloadLead', i);
    const lock = w.barrels[i].lock;
    if (lock > reloadLead && lock - ticks <= reloadLead && lock > 0) {
      const e = GameEventNew(GAME_EVENT_GUN_RELOAD);
      e.u.PlayerUID = a.PlayerUID;
      e.u.Gun = WeaponClassGetBarrel(w.Gun!, i).name;
      e.u.Pos = svec2_add(a.Pos, ActorGetMuzzleOffset(a, w, i));
      e.u.Direction = a.direction;
      GameEventsEnqueue(gGameEvents, e);
    }
  }
}
export function OnGunFire(gf: GameEventU, sd: typeof gSoundDevice | null): void {
  const wc = StrWeaponClass(gf.Gun)!;
  const pos: Vec2 = gf.MuzzlePos;
  const n = wc.Normal;
  if (!gCampaign.IsClient) {
    const spreadStartAngle = f32(n.AngleOffset - f32(f32((n.Spread.Count - 1) * n.Spread.Width) / 2));
    for (let i = 0; i < n.Spread.Count; i++) {
      const recoil = f32(RAND_FLOAT(f32(-0.5), f32(0.5)) * n.Recoil);
      const finalAngle = f32(f32(f32(gf.Angle + spreadStartAngle) + f32(i * n.Spread.Width)) + recoil);
      const ab = GameEventNew(GAME_EVENT_ADD_BULLET);
      ab.u.MuzzlePos = pos;
      ab.u.MuzzleHeight = gf.Z;
      ab.u.Angle = finalAngle;
      ab.u.Elevation = RAND_INT(n.ElevationLow, n.ElevationHigh);
      ab.u.Flags = gf.Flags;
      ab.u.ActorUID = gf.ActorUID;
      ab.u.Gun = wc.name;
      for (const bc of n.Bullets) {
        const e: GameEvent = { Type: ab.Type, Delay: ab.Delay, u: { ...ab.u } };
        ab.u.UID = MobObjsObjsGetNextUID();
        ab.u.BulletClass = bc!.Name;
        e.u.UID = ab.u.UID;
        e.u.BulletClass = ab.u.BulletClass;
        GameEventsEnqueue(gGameEvents, e);
      }
    }
  }
  if (WeaponClassHasMuzzle(wc) && n.MuzzleFlash != null) {
    const ap = GameEventNew(GAME_EVENT_ADD_PARTICLE);
    ap.u.Class = n.MuzzleFlash;
    ap.u.Pos = pos;
    ap.u.Z = f32(gf.Z);
    ap.u.Angle = gf.Angle;
    ap.u.ActorUID = gf.ActorUID;
    ap.u.IsAttached = true;
    GameEventsEnqueue(gGameEvents, ap);
  }
  if (gf.Sound && n.Sound) {
    SoundPlayAt(sd, n.Sound, pos);
    AIWakeOnSoundAt(pos);
  }
  if (n.Shake.Amount > 0) {
    const s = GameEventNew(GAME_EVENT_SCREEN_SHAKE);
    s.u.Amount = n.Shake.Amount;
    s.u.CameraSubjectOnly = n.Shake.CameraSubjectOnly;
    s.u.ActorUID = gf.ActorUID;
    GameEventsEnqueue(gGameEvents, s);
  }
  if (n.Brass && n.ReloadLead === 0) WeaponClassAddBrass(wc, RadiansToDirection(gf.Angle), pos);
}
export function WeaponClassAddBrass(wc: WeaponClass, d: number, pos: Vec2): void {
  if (!ConfigGetBool('Graphics.Brass')) return;
  const e = GameEventNew(GAME_EVENT_ADD_PARTICLE);
  e.u.Class = wc.Normal.Brass;
  Object.assign(e.u, brassParticle(wc, d, pos));
  GameEventsEnqueue(gGameEvents, e);
}

// --- actor_placement.c ------------------------------------------------------------------------------------------

function PlacePlayerSimple(map: GameMap): Vec2 {
  const halfMap = Math.trunc(MAX(map.Size.x * TILE_WIDTH, map.Size.y * TILE_HEIGHT) / 2);
  let attemptsAwayFromExits = 0;
  let pos = svec2_zero();
  let ok = false;
  for (let j = 0; j < 10000 && !ok; j++) {
    pos = MapGetRandomPos(map);
    ok = MapIsPosOKForPlayer(map, pos, false);
    if (!ok) continue;
    if (attemptsAwayFromExits < 100) {
      attemptsAwayFromExits++;
      for (let i = 0; i < map.exits.length; i++) {
        const exitPos = MapGetExitPos(map, i);
        if (fabsf(f32(pos.x - exitPos.x)) > halfMap && fabsf(f32(pos.y - exitPos.y)) > halfMap) {
          ok = false;
          break;
        }
      }
    }
  }
  return pos;
}
function PlaceActorNear(map: GameMap, nearPos: Vec2, allowAllTiles: boolean): Vec2 {
  const tryAt = (dx: number, dy: number): Vec2 | null => {
    const pos = svec2_add(nearPos, svec2(dx, dy));
    return MapIsPosOKForPlayer(map, pos, allowAllTiles) ? pos : null;
  };
  let r = tryAt(0, 0);
  if (r) return r;
  const inc = 1;
  for (let radius = 12; ; radius = f32(radius + 12)) {
    let dx: number;
    let dy: number;
    for (dx = radius, dy = 0; dy < radius; dx = f32(dx - inc), dy = f32(dy + inc)) if ((r = tryAt(dx, dy))) return r;
    for (dx = 0, dy = radius; dy > 0; dx = f32(dx - inc), dy = f32(dy - inc)) if ((r = tryAt(dx, dy))) return r;
    for (dx = -radius, dy = 0; dx < 0; dx = f32(dx + inc), dy = f32(dy - inc)) if ((r = tryAt(dx, dy))) return r;
    for (dx = 0, dy = -radius; dy < 0; dx = f32(dx + inc), dy = f32(dy + inc)) if ((r = tryAt(dx, dy))) return r;
  }
}
export function PlaceAwayFromPlayers(map: GameMap, giveUp: boolean, paFlags: number): Vec2 {
  let out = svec2_zero();
  if (MapPlaceRandomPos(map, paFlags, (pos) => {
    out = pos;
    const closestPlayer = AIGetClosestPlayer(pos);
    return (closestPlayer == null ||
      MAX(fabsf(f32(pos.x - closestPlayer.Pos.x)), fabsf(f32(pos.y - closestPlayer.Pos.y))) >= 150) &&
      MapIsTileAreaClear(map, pos, svec2i(ACTOR_W, ACTOR_H));
  })) return out;
  for (let i = 0; i < 10000 || !giveUp; i++) {
    const pos = MapGetRandomPos(map);
    if (MapIsTileAreaClear(map, pos, svec2i(ACTOR_W, ACTOR_H))) return pos;
  }
  return svec2(Math.trunc((TILE_WIDTH * 3) / 2), Math.trunc((TILE_HEIGHT * 3) / 2));
}
export function PlacePrisoner(map: GameMap): Vec2 {
  let pos: Vec2;
  do {
    do {
      pos = MapGetRandomPos(map);
    } while (!MapPosIsInLockedRoom(map, pos));
  } while (!MapIsTileAreaClear(map, pos, svec2i(ACTOR_W, ACTOR_H)));
  return pos;
}
export function PlacePlayer(map: GameMap, p: PlayerData, firstPos: Vec2, pumpEvents: boolean): Vec2 {
  let pos: Vec2;
  if (IsPVP(gCampaign.Entry.Mode)) {
    pos = PlaceAwayFromPlayers(map, false, PLACEMENT_ACCESS_ANY);
  } else if (ConfigGetEnum('Interface.Splitscreen') === SPLITSCREEN_NEVER && !svec2_is_zero(firstPos)) {
    pos = PlaceActorNear(map, firstPos, true);
  } else if (!svec2i_is_zero(map.start)) {
    pos = PlaceActorNear(map, Vec2CenterOfTile(map.start), true);
  } else {
    pos = PlacePlayerSimple(map);
  }
  const e = GameEventNewActorAdd(pos, p.Char, p);
  e.u.Direction = DIRECTION_DOWN;
  e.u.PlayerUID = p.UID;
  e.u.Ammo = Ammo2Net(p.ammo);
  GameEventsEnqueue(gGameEvents, e);
  if (pumpEvents) HandleGameEvents(gGameEvents, null, null, null);
  return e.u.Pos;
}
export function Ammo2Net(a: number[]): { Id: number; Amount: number }[] {
  const out: { Id: number; Amount: number }[] = [];
  for (let i = 0; i < a.length; i++) if (a[i] > 0) out.push({ Id: i, Amount: a[i] });
  return out;
}

// --- game_events.c ---------------------------------------------------------------------------------------------

export function GameEventNewActorAdd(pos: Vec2, c: Character, p: PlayerData | null): GameEvent {
  const e = GameEventNew(GAME_EVENT_ACTOR_ADD);
  e.u.Pos = pos;
  e.u.UID = ActorsGetNextUID();
  if (!c.Class!.Vehicle) e.u.PilotUID = e.u.UID;
  e.u.Health = CharacterGetStartingHealth(c, c.Class!.Vehicle ? null : p);
  return e;
}
export { MAX_GUNS, MAX_WEAPONS, MELEE_SLOT, GRENADE_SLOT, ACTORANIMATION_STAND };
