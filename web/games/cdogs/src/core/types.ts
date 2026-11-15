// C-Dogs SDL 2.5.0, translated: the game's data structures (the structs of actors.h, thing.h, objs.h,
// particle.h, pickup.h, weapon.h, weapon_class.h, bullet_class.h, ammo.h, particle_class.h, pickup_class.h,
// map_object.h, character.h, character_class.h, player.h, emitter.h, animation.h, tile.h, tile_class.h).
// GPL-2.0-or-later / BSD-2-Clause (web/games/cdogs/LICENSE.md).
import type { Color, Vec2, Vec2i } from './base.ts';
import type { CPic, CharColors, CharSprites, Pic } from './pics.ts';
import type { SoundRef } from './sounds.ts';
import type { Trigger } from './map.ts';

export const KIND_CHARACTER = 0;
export const KIND_PARTICLE = 1;
export const KIND_MOBILEOBJECT = 2;
export const KIND_OBJECT = 3;
export const KIND_PICKUP = 4;

export const THING_IMPASSABLE = 1;
export const THING_CAN_BE_SHOT = 2;
export const THING_OBJECTIVE = 8 + 16 + 32 + 64 + 128;
export const THING_DRAW_BELOW = 256;
export const THING_DRAW_ABOVE = 512;
export const OBJECTIVE_SHIFT = 3;
export const SOUND_LOCK_THING = 12;

export interface ThingId { Id: number; Kind: number }

export interface ThingDrawData {
  MobObjId: number;
  Scale: Vec2;
  MuzzleFlash?: { Sprites: Pic[] | null; Dir: number; Color: Color };
}

export interface Thing {
  Pos: Vec2;
  LastPos: Vec2;
  Vel: Vec2;
  size: Vec2i;
  kind: number;
  id: number;
  flags: number;
  /** drawFunc: particles draw themselves (DrawParticle) */
  drawFunc: number;
  drawData: ThingDrawData;
  CPic: CPic;
  /** CPicFunc: which draw function (THING_DRAW_*) */
  CPicFunc: number;
  drawShake: Vec2;
  ShadowSize: Vec2i;
  SoundLock: number;
}
export const CPICFUNC_NONE = 0;
export const CPICFUNC_BULLET = 1;
export const CPICFUNC_MAPOBJECT = 2;
export const CPICFUNC_PICKUP = 3;
export const DRAWFUNC_NONE = 0;
export const DRAWFUNC_PARTICLE = 1;

export interface Animation {
  Type: number;
  frame: number;
  frames: number[];
  ticksPerFrame: number[];
  frameCounter: number;
  randomFrames: boolean;
  newFrame: boolean;
}

export interface Emitter {
  p: ParticleClass | null;
  offset: Vec2;
  minSpeed: number;
  maxSpeed: number;
  minDZ: number;
  maxDZ: number;
  minRotation: number;
  maxRotation: number;
  ticksPerEmit: number;
  counter: number;
}

export interface Barrel {
  state: number;
  lock: number;
  soundLock: number;
  stateCounter: number;
  heatCounter: number;
}
export interface Weapon {
  Gun: WeaponClass | null;
  clickLock: number;
  barrels: Barrel[];
}

export const MAX_GUNS = 3;
export const MELEE_SLOT = 2;
export const GRENADE_SLOT = 3;
export const MAX_GRENADES = 1;
export const MAX_WEAPONS = MAX_GUNS + MAX_GRENADES;

export interface AIObjectiveState {
  Type: number;
  IsDestructible: boolean;
  /** union u: Obj (an objective) or UID */
  Obj: unknown;
  UID: number;
  LastDone: number;
  Goal: Vec2;
}
export interface AIGotoContext {
  Goal: Vec2i;
  Path: Vec2i[] | null;
  PathIndex: number;
  IsFollowing: boolean;
}
export interface AIContext {
  LastCmd: number;
  Delay: number;
  lastState: number;
  State: number;
  ConfusionState: { Type: number; Cmd: number };
  ObjectiveState: AIObjectiveState;
  LastTile: Vec2i;
  IsStuckTooLong: boolean;
  Goto: AIGotoContext;
  EnemyId: number;
  GunRangeScalar: number;
  OnGunId: number;
}

export interface TActor {
  Pos: Vec2;
  MoveVel: Vec2;
  direction: number;
  DrawRadians: number;
  anim: Animation;
  stateCounter: number;
  lastCmd: number;
  hasCollided: boolean;
  specialCmdDir: boolean;
  PickupAll: boolean;
  CanPickupSpecial: boolean;
  charId: number;
  PlayerUID: number;
  uid: number;
  pilotUID: number;
  vehicleUID: number;
  guns: Weapon[];
  ammo: number[];
  gunIndex: number;
  lastGunIdx: number;
  health: number;
  dead: number;
  flamed: number;
  poisoned: number;
  petrified: number;
  confused: number;
  flags: number;
  turns: number;
  slideLock: number;
  accumulatedDamage: number;
  damageCooldownTicks: number;
  grimaceCounter: number;
  voiceChannel: number;
  Chatter: string;
  ChatterCounter: number;
  barrelSmoke: Emitter;
  healEffect: Emitter;
  slideEffect: Emitter;
  confusionEffect: Emitter;
  poisonEffect: Emitter;
  flameEffect: Emitter;
  iceEffect: Emitter;
  blood1: Emitter;
  blood2: Emitter;
  blood3: Emitter;
  bleedCounter: number;
  footprintMask: Color;
  footprintCounter: number;
  hasShot: boolean;
  isHatDetached: boolean;
  pickupMenu: { pickup: Pickup | null; effect: PickupEffect | null; index: number };
  action: number;
  aiContext: AIContext | null;
  thing: Thing;
  isInUse: boolean;
}

export interface TObject {
  uid: number;
  Class: MapObject;
  Health: number;
  counter: number;
  thing: Thing;
  damageSmoke: Emitter;
  isInUse: boolean;
}

export interface TMobileObject {
  UID: number;
  ActorUID: number;
  bulletClass: BulletClass;
  z: number;
  dz: number;
  count: number;
  range: number;
  flags: number;
  thing: Thing;
  trail: Emitter;
  weapon: WeaponClass | null;
  isInUse: boolean;
}

export interface Particle {
  Class: ParticleClass;
  Pic: CPic | null;
  Text: string;
  Char: Character | null;
  ActorUID: number;
  Pos: Vec2;
  Z: number;
  Angle: number;
  DZ: number;
  Spin: number;
  Count: number;
  Range: number;
  thing: Thing;
  isAttached: boolean;
  isInUse: boolean;
}

export interface AddParticle {
  Class: ParticleClass | null;
  ActorUID: number;
  Pos: Vec2;
  Z: number;
  Vel: Vec2;
  Angle: number;
  DZ: number;
  Spin: number;
  DrawScale: Vec2;
  Mask: Color;
  Text: string;
  IsAttached: boolean;
}

export interface Pickup {
  UID: number;
  class: PickupClass;
  thing: Thing;
  IsRandomSpawned: boolean;
  isInUse: boolean;
  PickedUp: boolean;
  SpawnerUID: number;
}

// --- classes ---------------------------------------------------------------------------------------------------

export interface Ammo {
  Name: string;
  Pic: CPic;
  Sound: string | null;
  Amount: number;
  Max: number;
  Price: number;
  DefaultGun: string | null;
}

export const PARTICLE_PIC = 0;
export const PARTICLE_TEXT = 1;
export const PARTICLE_CHAR_SPRITE = 2;
export interface ParticleClass {
  Name: string;
  Type: number;
  Pic: CPic;
  Text: { Value: string | null; Mask: Color };
  CharSprite: string | null;
  RangeLow: number;
  RangeHigh: number;
  GravityFactor: number;
  HitsWalls: boolean;
  Bounces: boolean;
  BounceFriction: number;
  WallBounces: boolean;
  ZDarken: boolean;
  DrawBelow: boolean;
  DrawAbove: boolean;
}

export interface HitProps { Hit: boolean; Sound: string | null }
export interface BulletClass {
  Name: string;
  CPic: CPic;
  Trail: { P: ParticleClass | null; Width: number; TicksPerEmit: number };
  ShadowSize: Vec2i;
  Delay: number;
  SpeedLow: number;
  SpeedHigh: number;
  SpeedScale: boolean;
  Friction: number;
  RangeLow: number;
  RangeHigh: number;
  Power: number;
  Mass: number;
  Size: Vec2i;
  Special: { Effect: number; Ticks: number };
  HurtAlways: boolean;
  Persists: boolean;
  Spark: ParticleClass | null;
  OutOfRangeSpark: ParticleClass | null;
  WallMark: ParticleClass | null;
  WallBounceElasticity: number;
  Hit: { Object: HitProps; Flesh: HitProps; Wall: HitProps };
  Falling: {
    GravityFactor: number;
    FallsDown: boolean;
    DestroyOnDrop: boolean;
    BounceElasticity: number;
    BounceFriction: number;
    DropGuns: WeaponClass[];
  };
  SeekFactor: number;
  Erratic: boolean;
  OutOfRangeGuns: WeaponClass[];
  HitGuns: WeaponClass[];
  ProximityGuns: WeaponClass[];
  node: unknown;
}

export const GUNTYPE_NORMAL = 0;
export const GUNTYPE_MELEE = 1;
export const GUNTYPE_GRENADE = 2;
export const GUNTYPE_MULTI = 3;
export const GUNSTATE_READY = 0;
export const GUNSTATE_FIRING = 1;
export const GUNSTATE_RECOIL = 2;

export interface WeaponClassNormal {
  Sprites: string | null;
  Grips: number;
  Bullets: (BulletClass | null)[];
  AmmoId: number;
  Cost: number;
  ReloadLead: number;
  Sound: SoundRef;
  ReloadSound: SoundRef;
  SoundLockLength: number;
  Recoil: number;
  Spread: { Count: number; Width: number };
  AngleOffset: number;
  MuzzleHeight: number;
  ElevationLow: number;
  ElevationHigh: number;
  MuzzleFlash: ParticleClass | null;
  Brass: ParticleClass | null;
  Shake: { Amount: number; CameraSubjectOnly: boolean };
  Auto: boolean;
}
export interface WeaponClass {
  Icon: Pic | null;
  Type: number;
  Normal: WeaponClassNormal;
  Guns: (string | null)[];
  name: string;
  Description: string | null;
  Prerequisite: string | null;
  Lock: number;
  SwitchSound: SoundRef;
  CanDrop: boolean;
  DropGun: string | null;
  IsRealGun: boolean;
  Price: number;
  OverheatTicks: number;
}

export const PICKUP_NONE = 0;
export const PICKUP_JEWEL = 1;
export const PICKUP_HEALTH = 2;
export const PICKUP_AMMO = 3;
export const PICKUP_KEYCARD = 4;
export const PICKUP_GUN = 5;
export const PICKUP_SHOW_MAP = 6;
export const PICKUP_LIVES = 7;
export const PICKUP_SOUND = 8;
export const PICKUP_MENU = 9;
export interface PickupMenuItem { Text: string | null; Effects: PickupEffect[] }
export interface PickupEffect {
  Type: number;
  Score: number;
  Heal: { Amount: number; ExceedMax: boolean };
  Ammo: { Id: number; Amount: number };
  Keys: number;
  GunId: number;
  Lives: number;
  Sound: string | null;
  Menu: { Text: string | null; Items: PickupMenuItem[] };
}
export interface PickupClass {
  Name: string;
  Effects: PickupEffect[];
  Pic: CPic;
  Sound: string | null;
}

export const MAP_OBJECT_TYPE_NORMAL = 0;
export const MAP_OBJECT_TYPE_PICKUP_SPAWNER = 1;
export const MAP_OBJECT_TYPE_ACTOR_SPAWNER = 2;
export interface MapObjectDestroySpawn { Type: number; SpawnChance: number }
export interface MapObject {
  Name: string;
  Pic: CPic;
  Offset: Vec2i;
  Wreck: { MO: string | null; Sound: SoundRef; Bullet: string };
  Size: Vec2i;
  PosOffset: Vec2;
  Health: number;
  DestroyGuns: WeaponClass[];
  Flags: number;
  DrawBelow: boolean;
  DrawAbove: boolean;
  FootstepSound: string | null;
  FootprintMask: Color;
  Type: number;
  PickupClass: PickupClass | null;
  Character: { CharId: number; Counter: number };
  DestroySpawn: MapObjectDestroySpawn[];
  DamageSmoke: { ParticleClass: string | null; HealthThreshold: number; Z: number; Ticks: number };
}

export interface CharacterClass {
  Name: string;
  Vehicle: boolean;
  HeadSprites: string;
  Body: string;
  DeathSprites: string;
  Mass: number;
  Sprites: CharSprites | null;
  Sounds: string | null;
  Footsteps: string | null;
  FootstepsDistancePlus: number;
  BloodColor: Color;
  Corpse: string | null;
  HasHeadParts: boolean[];
}

export interface CharBot {
  probabilityToMove: number;
  probabilityToTrack: number;
  probabilityToShoot: number;
  actionDelay: number;
}
export interface Character {
  Class: CharacterClass | null;
  PlayerTemplateName: string | null;
  HeadParts: (string | null)[];
  speed: number;
  Gun: WeaponClass | null;
  Melee: WeaponClass | null;
  maxHealth: number;
  excessHealth: number;
  flags: number;
  Colors: CharColors;
  Drop: PickupClass | null;
  bot: CharBot | null;
}
export interface CharacterStore {
  OtherChars: Character[];
  prisonerIds: number[];
  baddieIds: number[];
  specialIds: number[];
}

export interface PlayerStats {
  Score: number;
  Kills: number;
  Suicides: number;
  Friendlies: number;
  TimeTicks: number;
}
export interface WeaponUsage { Shots: number; Hits: number }

export const INPUT_DEVICE_UNSET = 0;
export const INPUT_DEVICE_KEYBOARD = 1;
export const INPUT_DEVICE_JOYSTICK = 2;
export const INPUT_DEVICE_AI = 3;

export interface PlayerData {
  ActorUID: number;
  IsLocal: boolean;
  Ready: boolean;
  Char: Character;
  name: string;
  guns: (WeaponClass | null)[];
  ammo: number[];
  Lives: number;
  HP: number;
  Stats: PlayerStats;
  Totals: PlayerStats;
  /** weapon name -> usage, in insertion order (hashmap in the original) */
  WeaponUsages: Map<string, WeaponUsage>;
  hp: number;
  survived: number;
  missions: number;
  lastMission: number;
  inputDevice: number;
  deviceIndex: number;
  UID: number;
  /** port: this client's own player (online play; the original's IsLocal) */
  isOwn: boolean;
}

// --- tiles -------------------------------------------------------------------------------------------------------

export const TILE_CLASS_FLOOR = 0;
export const TILE_CLASS_WALL = 1;
export const TILE_CLASS_DOOR = 2;
export const TILE_CLASS_NOTHING = 3;

export interface TileClass {
  Name: string | null;
  Pic: Pic | null;
  Style: string | null;
  StyleType: string | null;
  Mask: Color;
  MaskAlt: Color;
  canWalk: boolean;
  isOpaque: boolean;
  shootable: boolean;
  IsRoom: boolean;
  Type: number;
  DamageBullet: string | null;
}
export interface DoorState {
  Count: number;
  IsOpen: boolean;
  Class: TileClass | null;
  Class2: TileClass | null;
  IsHorizontal: boolean;
}
export interface Tile {
  Class: TileClass;
  Door: DoorState;
  triggers: Trigger[];
  things: ThingId[];
  outOfSight: boolean;
  isVisited: boolean;
}
