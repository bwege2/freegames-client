// C-Dogs SDL 2.5.0, translated: game_events.c (the event queue every change of the game goes through).
// GPL-2.0-or-later / BSD-2-Clause (web/games/cdogs/LICENSE.md).
//
// The original sends most events as nanopb messages to network peers too; the port's online play runs every
// client's simulation in lockstep instead (README.md), so the events stay in the queue. Their fields keep the
// types of the original's messages (src/proto/msg.proto): float fields are rounded to float, int32 fields to
// int, uint32 fields wrap.
import { rand, cmod, svec2_zero, colorTransparent, DIRECTION_COUNT, type Vec2, type Color } from './base.ts';
import type { AddParticle } from './types.ts';

export const GAME_EVENT_NONE = 0;
export const GAME_EVENT_CLIENT_CONNECT = 1;
export const GAME_EVENT_CLIENT_ID = 2;
export const GAME_EVENT_CAMPAIGN_DEF = 3;
export const GAME_EVENT_PLAYER_DATA = 4;
export const GAME_EVENT_PLAYER_REMOVE = 5;
export const GAME_EVENT_TILE_SET = 6;
export const GAME_EVENT_THING_DAMAGE = 7;
export const GAME_EVENT_MAP_OBJECT_ADD = 8;
export const GAME_EVENT_MAP_OBJECT_REMOVE = 9;
export const GAME_EVENT_CLIENT_READY = 10;
export const GAME_EVENT_NET_GAME_START = 11;
export const GAME_EVENT_CONFIG = 12;
export const GAME_EVENT_SCORE = 13;
export const GAME_EVENT_SOUND_AT = 14;
export const GAME_EVENT_SCREEN_SHAKE = 15;
export const GAME_EVENT_SET_MESSAGE = 16;
export const GAME_EVENT_GAME_START = 17;
export const GAME_EVENT_GAME_BEGIN = 18;
export const GAME_EVENT_ACTOR_ADD = 19;
export const GAME_EVENT_ACTOR_MOVE = 20;
export const GAME_EVENT_ACTOR_STATE = 21;
export const GAME_EVENT_ACTOR_DIR = 22;
export const GAME_EVENT_ACTOR_SLIDE = 23;
export const GAME_EVENT_ACTOR_IMPULSE = 24;
export const GAME_EVENT_ACTOR_SWITCH_GUN = 25;
export const GAME_EVENT_ACTOR_PICKUP_ALL = 26;
export const GAME_EVENT_ACTOR_REPLACE_GUN = 27;
export const GAME_EVENT_ACTOR_HEAL = 28;
export const GAME_EVENT_ACTOR_ADD_AMMO = 29;
export const GAME_EVENT_ACTOR_USE_AMMO = 30;
export const GAME_EVENT_ACTOR_DIE = 31;
export const GAME_EVENT_PLAYER_ADD_LIVES = 32;
export const GAME_EVENT_ACTOR_MELEE = 33;
export const GAME_EVENT_ACTOR_PILOT = 34;
export const GAME_EVENT_ACTOR_BARK = 35;
export const GAME_EVENT_ADD_PICKUP = 36;
export const GAME_EVENT_REMOVE_PICKUP = 37;
export const GAME_EVENT_BULLET_BOUNCE = 38;
export const GAME_EVENT_REMOVE_BULLET = 39;
export const GAME_EVENT_PARTICLE_REMOVE = 40;
export const GAME_EVENT_GUN_FIRE = 41;
export const GAME_EVENT_GUN_RELOAD = 42;
export const GAME_EVENT_GUN_STATE = 43;
export const GAME_EVENT_ADD_BULLET = 44;
export const GAME_EVENT_ADD_PARTICLE = 45;
export const GAME_EVENT_TRIGGER = 46;
export const GAME_EVENT_EXPLORE_TILES = 47;
export const GAME_EVENT_RESCUE_CHARACTER = 48;
export const GAME_EVENT_OBJECTIVE_UPDATE = 49;
export const GAME_EVENT_ADD_KEYS = 50;
export const GAME_EVENT_DOOR_TOGGLE = 51;
export const GAME_EVENT_MISSION_COMPLETE = 52;
export const GAME_EVENT_MISSION_INCOMPLETE = 53;
export const GAME_EVENT_MISSION_PICKUP = 54;
export const GAME_EVENT_MISSION_END = 55;

export const GAME_EVENT_NAMES = [
  'NONE', 'CLIENT_CONNECT', 'CLIENT_ID', 'CAMPAIGN_DEF', 'PLAYER_DATA', 'PLAYER_REMOVE', 'TILE_SET', 'THING_DAMAGE',
  'MAP_OBJECT_ADD', 'MAP_OBJECT_REMOVE', 'CLIENT_READY', 'NET_GAME_START', 'CONFIG', 'SCORE', 'SOUND_AT',
  'SCREEN_SHAKE', 'SET_MESSAGE', 'GAME_START', 'GAME_BEGIN', 'ACTOR_ADD', 'ACTOR_MOVE', 'ACTOR_STATE', 'ACTOR_DIR',
  'ACTOR_SLIDE', 'ACTOR_IMPULSE', 'ACTOR_SWITCH_GUN', 'ACTOR_PICKUP_ALL', 'ACTOR_REPLACE_GUN', 'ACTOR_HEAL',
  'ACTOR_ADD_AMMO', 'ACTOR_USE_AMMO', 'ACTOR_DIE', 'PLAYER_ADD_LIVES', 'ACTOR_MELEE', 'ACTOR_PILOT', 'ACTOR_BARK',
  'ADD_PICKUP', 'REMOVE_PICKUP', 'BULLET_BOUNCE', 'REMOVE_BULLET', 'PARTICLE_REMOVE', 'GUN_FIRE', 'GUN_RELOAD',
  'GUN_STATE', 'ADD_BULLET', 'ADD_PARTICLE', 'TRIGGER', 'EXPLORE_TILES', 'RESCUE_CHARACTER', 'OBJECTIVE_UPDATE',
  'ADD_KEYS', 'DOOR_TOGGLE', 'MISSION_COMPLETE', 'MISSION_INCOMPLETE', 'MISSION_PICKUP', 'MISSION_END',
];

/* eslint-disable @typescript-eslint/no-explicit-any */
/** an event's message (the union of game_events.h) */
export type GameEventU = any;
export interface GameEvent {
  Type: number;
  Delay: number;
  /** the message of the event type (the union of game_events.h); field names as in msg.proto */
  u: any;
}

export const gGameEvents: GameEvent[] = [];

/** the pickup UID counter of pickup.c (GameEventNew(GAME_EVENT_ADD_PICKUP) takes the next one) */
export const uidCounters = { pickups: 0, actors: 0, objs: 0, mobObjs: 0 };
export function PickupsGetNextUID(): number {
  return uidCounters.pickups++;
}

export function newAddParticle(): AddParticle {
  return {
    Class: null, ActorUID: 0, Pos: svec2_zero(), Z: 0, Vel: svec2_zero(), Angle: 0, DZ: 0, Spin: 0,
    DrawScale: svec2_zero(), Mask: { ...colorTransparent }, Text: '', IsAttached: false,
  };
}

export function GameEventNew(type: number): GameEvent {
  const u: any = {};
  switch (type) {
    case GAME_EVENT_MAP_OBJECT_REMOVE:
      Object.assign(u, { UID: 0, ActorUID: -1, Flags: 0 });
      break;
    case GAME_EVENT_ADD_PICKUP:
      Object.assign(u, {
        UID: PickupsGetNextUID(), PickupClass: '', IsRandomSpawned: false, SpawnerUID: -1, ThingFlags: 0,
        Pos: svec2_zero(),
      });
      break;
    case GAME_EVENT_ACTOR_ADD:
      Object.assign(u, {
        UID: 0, PilotUID: -1, VehicleUID: -1, CharId: 0, Direction: cmod(rand(), DIRECTION_COUNT), Health: 0,
        PlayerUID: -1, ThingFlags: 0, Pos: svec2_zero(), Ammo: [] as { Id: number; Amount: number }[],
      });
      break;
    case GAME_EVENT_ACTOR_ADD_AMMO:
      Object.assign(u, { UID: 0, PlayerUID: 0, Ammo: { Id: 0, Amount: 0 }, IsRandomSpawned: false });
      break;
    case GAME_EVENT_ACTOR_USE_AMMO:
      Object.assign(u, { UID: 0, PlayerUID: 0, Ammo: { Id: 0, Amount: 0 } });
      break;
    case GAME_EVENT_ACTOR_IMPULSE:
      Object.assign(u, { UID: 0, Vel: svec2_zero(), Pos: svec2_zero() });
      break;
    case GAME_EVENT_ACTOR_MOVE:
      Object.assign(u, { UID: 0, Pos: svec2_zero(), MoveVel: svec2_zero() });
      break;
    case GAME_EVENT_ACTOR_SLIDE:
      Object.assign(u, { UID: 0, Vel: svec2_zero() });
      break;
    case GAME_EVENT_ACTOR_DIE:
      Object.assign(u, { UID: -1 });
      break;
    case GAME_EVENT_PLAYER_ADD_LIVES:
      Object.assign(u, { UID: -1, Lives: 0 });
      break;
    case GAME_EVENT_ADD_BULLET:
      Object.assign(u, {
        UID: 0, BulletClass: '', MuzzlePos: svec2_zero(), MuzzleHeight: 0, Angle: 0, Elevation: 0, Flags: 0,
        ActorUID: -1, Gun: '',
      });
      break;
    case GAME_EVENT_ADD_KEYS:
      Object.assign(u, { KeyFlags: 0, Pos: svec2_zero() });
      break;
    case GAME_EVENT_BULLET_BOUNCE:
      Object.assign(u, {
        UID: 0, HitType: 0, Spark: false, BouncePos: svec2_zero(), Pos: svec2_zero(), Vel: svec2_zero(),
        HitSound: false, WallMark: false,
      });
      break;
    case GAME_EVENT_GUN_FIRE:
      Object.assign(u, {
        ActorUID: 0, Gun: '', MuzzlePos: svec2_zero(), Z: 0, Angle: 0, Sound: false, Flags: 0, IsGun: false,
      });
      break;
    case GAME_EVENT_GUN_RELOAD:
      Object.assign(u, { PlayerUID: 0, Gun: '', Pos: svec2_zero(), Direction: 0 });
      break;
    case GAME_EVENT_MAP_OBJECT_ADD:
      Object.assign(u, { UID: 0, MapObjectClass: '', Pos: svec2_zero(), ThingFlags: 0, Health: 0, Mask: { ...colorTransparent } as Color });
      break;
    case GAME_EVENT_SOUND_AT:
      Object.assign(u, { Sound: '', Pos: svec2_zero(), Distance: 0 });
      break;
    case GAME_EVENT_THING_DAMAGE:
      Object.assign(u, {
        UID: 0, Kind: 0, SourceActorUID: 0, Power: 0, Vel: svec2_zero(), Mass: 0, Flags: 0, Special: 0,
        SpecialTicks: 0, SourceWeaponClassName: '',
      });
      break;
    case GAME_EVENT_TILE_SET:
      Object.assign(u, { Pos: { x: 0, y: 0 }, ClassName: '', DoorClassName: '', DoorClass2Name: '', RunLength: 0 });
      break;
    case GAME_EVENT_TRIGGER:
      Object.assign(u, { ID: 0, Tile: { x: 0, y: 0 } });
      break;
    case GAME_EVENT_ADD_PARTICLE:
      Object.assign(u, newAddParticle());
      break;
    case GAME_EVENT_SCORE:
      Object.assign(u, { PlayerUID: 0, Score: 0 });
      break;
    case GAME_EVENT_SET_MESSAGE:
      Object.assign(u, { Message: '', Ticks: 0 });
      break;
    case GAME_EVENT_SCREEN_SHAKE:
      Object.assign(u, { Amount: 0, CameraSubjectOnly: false, ActorUID: 0 });
      break;
    case GAME_EVENT_GAME_BEGIN:
      Object.assign(u, { MissionTime: 0 });
      break;
    case GAME_EVENT_ACTOR_STATE:
      Object.assign(u, { UID: 0, State: 0 });
      break;
    case GAME_EVENT_ACTOR_DIR:
      Object.assign(u, { UID: 0, Dir: 0 });
      break;
    case GAME_EVENT_ACTOR_SWITCH_GUN:
      Object.assign(u, { UID: 0, GunIdx: 0 });
      break;
    case GAME_EVENT_ACTOR_PICKUP_ALL:
      Object.assign(u, { UID: 0, PickupAll: false });
      break;
    case GAME_EVENT_ACTOR_REPLACE_GUN:
      Object.assign(u, { UID: 0, GunIdx: 0, Gun: '' });
      break;
    case GAME_EVENT_ACTOR_HEAL:
      Object.assign(u, { UID: 0, PlayerUID: 0, Amount: 0, IsRandomSpawned: false, ExceedMax: false });
      break;
    case GAME_EVENT_ACTOR_MELEE:
      Object.assign(u, { UID: 0, BulletClass: '', HitType: 0, TargetKind: 0, TargetUID: 0 });
      break;
    case GAME_EVENT_ACTOR_PILOT:
      Object.assign(u, { UID: 0, VehicleUID: 0, On: false });
      break;
    case GAME_EVENT_ACTOR_BARK:
      Object.assign(u, { UID: 0, Sound: '' });
      break;
    case GAME_EVENT_REMOVE_PICKUP:
      Object.assign(u, { UID: 0, SpawnerUID: 0 });
      break;
    case GAME_EVENT_REMOVE_BULLET:
      Object.assign(u, { UID: 0 });
      break;
    case GAME_EVENT_PARTICLE_REMOVE:
      Object.assign(u, { ParticleRemoveId: 0 });
      break;
    case GAME_EVENT_GUN_STATE:
      Object.assign(u, { ActorUID: 0, Barrel: 0, State: 0 });
      break;
    case GAME_EVENT_EXPLORE_TILES:
      Object.assign(u, { Runs: [] as { Tile: { x: number; y: number }; Run: number }[] });
      break;
    case GAME_EVENT_RESCUE_CHARACTER:
      Object.assign(u, { UID: 0 });
      break;
    case GAME_EVENT_OBJECTIVE_UPDATE:
      Object.assign(u, { ObjectiveId: 0, Count: 0 });
      break;
    case GAME_EVENT_DOOR_TOGGLE:
      Object.assign(u, { IsOpen: false, Pos: { x: 0, y: 0 } });
      break;
    case GAME_EVENT_MISSION_COMPLETE:
      Object.assign(u, { ShowMsg: false });
      break;
    case GAME_EVENT_MISSION_END:
      Object.assign(u, { Delay: 0, IsQuit: false, Msg: '', Mission: 0 });
      break;
    case GAME_EVENT_PLAYER_DATA:
    case GAME_EVENT_PLAYER_REMOVE:
    case GAME_EVENT_CONFIG:
    default:
      break;
  }
  return { Type: type, Delay: 0, u };
}

/** a copy of an event (the original copies events by value: Action.u.Event, EmitterStart's AddParticle) */
export function GameEventCopy(e: GameEvent): GameEvent {
  return { Type: e.Type, Delay: e.Delay, u: structuredCloneShallow(e.u) };
}
function structuredCloneShallow(u: any): any {
  const o: any = {};
  for (const k of Object.keys(u)) {
    const v = u[k];
    if (v && typeof v === 'object' && !Array.isArray(v) && !('Name' in v) && !('pics' in v)) o[k] = { ...v };
    else if (Array.isArray(v)) o[k] = v.map((x: any) => (x && typeof x === 'object' ? { ...x } : x));
    else o[k] = v;
  }
  return o;
}

/** for tests: a hook that sees every enqueued event */
export const eventHooks: { onEnqueue: ((e: GameEvent) => void) | null } = { onEnqueue: null };

/** GameEventsInit / GameEventsTerminate: a terminated queue drops every event (elemSize == 0) */
export const gameEventsState = { enabled: true };
export function GameEventsInit(store: GameEvent[]): void {
  store.length = 0;
  gameEventsState.enabled = true;
}
export function GameEventsTerminate(store: GameEvent[]): void {
  store.length = 0;
  gameEventsState.enabled = false;
}
export function GameEventsEnqueue(store: GameEvent[], e: GameEvent): void {
  if (!gameEventsState.enabled) return;
  if (eventHooks.onEnqueue) eventHooks.onEnqueue(e);
  store.push(e);
}

/** GameEventsClear: remove the handled events (Delay < 0) */
export function GameEventsClear(store: GameEvent[]): void {
  let n = 0;
  for (let i = 0; i < store.length; i++) if (!(store[i].Delay < 0)) store[n++] = store[i];
  store.length = n;
}

export type { Vec2 };
