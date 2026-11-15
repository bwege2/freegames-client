// C-Dogs SDL 2.5.0, translated: pickups (pickup.c, actor_pickup.c) and the health and ammo spawners (powerup.c).
// GPL-2.0-or-later / BSD-2-Clause (web/games/cdogs/LICENSE.md).
import { MIN, MAX, SQUARED, svec2_distance_squared, svec2_is_zero, svec2i, type Vec2 } from './base.ts';
import { gMap, MapGenerateFreePosition, MapRemoveThing, MapTryMoveThing, newThing, ThingUpdate, type GameMap } from './map.ts';
import {
  CPICFUNC_PICKUP, GUNTYPE_GRENADE, KIND_PICKUP, PICKUP_AMMO, PICKUP_GUN, PICKUP_HEALTH, PICKUP_JEWEL, PICKUP_KEYCARD,
  PICKUP_LIVES, PICKUP_MENU, PICKUP_SHOW_MAP, PICKUP_SOUND, type Pickup, type PickupEffect, type TActor, type WeaponClass,
} from './types.ts';
import { CPicClone } from './pics.ts';
import { AmmoGetById, FPS_FRAMELIMIT, IdWeaponClass, StrParticleClass, StrPickupClass, StrWeaponClass, WC_BARREL } from './classes.ts';
import { ConfigGetBool } from './config.ts';
import {
  GAME_EVENT_ACTOR_ADD_AMMO, GAME_EVENT_ACTOR_HEAL, GAME_EVENT_ADD_KEYS, GAME_EVENT_ADD_PARTICLE, GAME_EVENT_ADD_PICKUP,
  GAME_EVENT_EXPLORE_TILES, GAME_EVENT_PLAYER_ADD_LIVES, GAME_EVENT_REMOVE_PICKUP, GAME_EVENT_SCORE, GAME_EVENT_SOUND_AT,
  GameEventNew, GameEventsEnqueue, gGameEvents, uidCounters, type GameEventU,
} from './events.ts';
import { AreHealthPickupsAllowed, gCampaign, gMission, gPickups, gPlayerDatas } from './state.ts';
import { OBJECTIVE_COLLECT } from './mission.ts';
import { ActorGetByUID, ActorGetMaxHeal, ActorPickupGun, ActorUsesAmmo, AMMO_STARTING_MULTIPLE } from './actors.ts';
import { AIGetClosestPlayer } from './ai.ts';
import { CampaignGetMaxHP, IsPlayerAlive, PlayersNumUseAmmo } from './player.ts';
import { UpdateMissionObjective } from './missionrun.ts';

// --- pickup.c ------------------------------------------------------------------------------------------------------

export function PickupsInit(): void {
  gPickups.length = 0;
  uidCounters.pickups = 0;
}
export function PickupAdd(ap: GameEventU): void {
  const old = PickupGetByUID(ap.UID);
  if (old != null && old.isInUse) PickupDestroy(ap.UID);
  let i = gPickups.findIndex((p) => !p.isInUse);
  if (i < 0) {
    i = gPickups.length;
    gPickups.push(null as unknown as Pickup);
  }
  const cls = StrPickupClass(ap.PickupClass)!;
  const p: Pickup = {
    UID: ap.UID, class: cls, thing: newThing(i, KIND_PICKUP, svec2i(8, 8), ap.ThingFlags), IsRandomSpawned: ap.IsRandomSpawned,
    isInUse: false, PickedUp: false, SpawnerUID: ap.SpawnerUID,
  };
  gPickups[i] = p;
  p.thing.CPic = CPicClone(cls.Pic);
  p.thing.CPicFunc = CPICFUNC_PICKUP;
  MapTryMoveThing(gMap, p.thing, ap.Pos);
  p.isInUse = true;
}
export function PickupAddGun(w: WeaponClass, pos: Vec2): void {
  if (!w.CanDrop) return;
  const e = GameEventNew(GAME_EVENT_ADD_PICKUP);
  e.u.PickupClass = `gun_${w.name}`;
  e.u.Pos = pos;
  GameEventsEnqueue(gGameEvents, e);
}
export function PickupDestroy(uid: number): void {
  const p = PickupGetByUID(uid)!;
  MapRemoveThing(gMap, p.thing);
  p.isInUse = false;
}
export function PickupsUpdate(ticks: number): void {
  for (const p of gPickups) if (p.isInUse) ThingUpdate(p.thing, ticks);
}
export function PickupGetByUID(uid: number): Pickup | null {
  for (const p of gPickups) if (p.UID === uid) return p;
  return null;
}

// --- actor_pickup.c ------------------------------------------------------------------------------------------------

export function PickupPickup(a: TActor, p: Pickup, pickupAll: boolean): void {
  if (p.PickedUp) return;
  let canPickup = p.class.Effects.length === 0;
  const sound = { s: p.class.Sound };
  for (const pe of p.class.Effects) canPickup = PickupApplyEffect(a, p, pe, pickupAll, sound) || canPickup;
  if (canPickup) {
    if (sound.s != null) {
      const e = GameEventNew(GAME_EVENT_SOUND_AT);
      e.u.Sound = sound.s;
      e.u.Pos = a.thing.Pos;
      GameEventsEnqueue(gGameEvents, e);
    }
    const e = GameEventNew(GAME_EVENT_REMOVE_PICKUP);
    e.u.UID = p.UID;
    e.u.SpawnerUID = p.SpawnerUID;
    GameEventsEnqueue(gGameEvents, e);
    p.PickedUp = true;
    a.PickupAll = false;
  }
}
export function PickupApplyEffect(a: TActor, p: Pickup, pe: PickupEffect, force: boolean, sound: { s: string | null }): boolean {
  let canPickup = false;
  switch (pe.Type) {
    case PICKUP_JEWEL: {
      canPickup = true;
      let e = GameEventNew(GAME_EVENT_SCORE);
      e.u.PlayerUID = a.PlayerUID;
      e.u.Score = pe.Score;
      GameEventsEnqueue(gGameEvents, e);
      e = GameEventNew(GAME_EVENT_ADD_PARTICLE);
      e.u.Class = StrParticleClass('score_text');
      e.u.ActorUID = a.uid;
      e.u.Pos = p.thing.Pos;
      e.u.DZ = 3;
      e.u.Text = gCampaign.Setting.Ammo ? `$${pe.Score}` : `+${pe.Score}`;
      GameEventsEnqueue(gGameEvents, e);
      UpdateMissionObjective(gMission, p.thing.flags, OBJECTIVE_COLLECT, 1);
      break;
    }
    case PICKUP_HEALTH:
      if (a.health < ActorGetMaxHeal(a, pe.Heal.ExceedMax)) {
        canPickup = true;
        const e = GameEventNew(GAME_EVENT_ACTOR_HEAL);
        e.u.UID = a.uid;
        e.u.PlayerUID = a.PlayerUID;
        e.u.Amount = pe.Heal.Amount;
        e.u.ExceedMax = pe.Heal.ExceedMax;
        e.u.IsRandomSpawned = p.IsRandomSpawned;
        GameEventsEnqueue(gGameEvents, e);
      }
      break;
    case PICKUP_AMMO:
    case PICKUP_GUN:
      if (TreatAsGunPickup(pe, a)) canPickup = TryPickupGun(a, pe, force, sound) || canPickup;
      else canPickup = TryPickupAmmo(a, p, pe) || canPickup;
      break;
    case PICKUP_KEYCARD: {
      canPickup = true;
      const e = GameEventNew(GAME_EVENT_ADD_KEYS);
      e.u.KeyFlags = pe.Keys;
      e.u.Pos = a.thing.Pos;
      GameEventsEnqueue(gGameEvents, e);
      if (sound.s == null) sound.s = 'key';
      break;
    }
    case PICKUP_SHOW_MAP: {
      canPickup = true;
      const e = GameEventNew(GAME_EVENT_EXPLORE_TILES);
      e.u.Runs = [{ Tile: { x: 0, y: 0 }, Run: gMap.Size.x * gMap.Size.y }];
      GameEventsEnqueue(gGameEvents, e);
      break;
    }
    case PICKUP_LIVES: {
      canPickup = true;
      const e = GameEventNew(GAME_EVENT_PLAYER_ADD_LIVES);
      e.u.UID = a.PlayerUID;
      e.u.Lives = pe.Lives;
      GameEventsEnqueue(gGameEvents, e);
      break;
    }
    case PICKUP_SOUND:
      canPickup = true;
      sound.s = pe.Sound;
      break;
    case PICKUP_MENU:
      canPickup = force;
      if (force) {
        a.pickupMenu.pickup = p;
        a.pickupMenu.effect = pe;
        a.pickupMenu.index = 0;
      }
      break;
    default:
      break;
  }
  return canPickup;
}
function TreatAsGunPickup(pe: PickupEffect, a: TActor): boolean {
  switch (pe.Type) {
    case PICKUP_AMMO:
      if (!ActorUsesAmmo(a, pe.Ammo.Id) && AmmoGetById(pe.Ammo.Id)!.DefaultGun) return true;
      return false;
    case PICKUP_GUN: {
      const wc = IdWeaponClass(pe.GunId)!;
      return wc.Type !== GUNTYPE_GRENADE || !ActorUsesAmmo(a, wc.Normal.AmmoId);
    }
    default:
      return false;
  }
}
function TryPickupAmmo(a: TActor, p: Pickup, pe: PickupEffect): boolean {
  if (!gCampaign.Setting.Ammo) return false;
  const ammoId = pe.Type === PICKUP_AMMO ? pe.Ammo.Id : IdWeaponClass(pe.GunId)!.Normal.AmmoId;
  const ammo = AmmoGetById(ammoId)!;
  const amount = pe.Type === PICKUP_AMMO ? pe.Ammo.Amount : ammo.Amount;
  if (ammo.Max > 0 && a.ammo[ammoId] >= ammo.Max) return false;
  const e = GameEventNew(GAME_EVENT_ACTOR_ADD_AMMO);
  e.u.UID = a.uid;
  e.u.PlayerUID = a.PlayerUID;
  e.u.Ammo = { Id: ammoId, Amount: amount };
  e.u.IsRandomSpawned = p.IsRandomSpawned;
  GameEventsEnqueue(gGameEvents, e);
  return true;
}
function TryPickupGun(a: TActor, pe: PickupEffect, pickupAll: boolean, sound: { s: string | null }): boolean {
  if (!pickupAll) return false;
  const wc = pe.Type === PICKUP_GUN ? IdWeaponClass(pe.GunId)! : StrWeaponClass(AmmoGetById(pe.Ammo.Id)!.DefaultGun)!;
  ActorPickupGun(a, wc);
  const ammoId = WC_BARREL(wc, 'AmmoId', 0);
  if (ammoId >= 0) {
    const ammo = AmmoGetById(ammoId)!;
    const ammoDeficit = ammo.Amount * AMMO_STARTING_MULTIPLE - a.ammo[ammoId];
    if (ammoDeficit > 0) {
      const e = GameEventNew(GAME_EVENT_ACTOR_ADD_AMMO);
      e.u.UID = a.uid;
      e.u.PlayerUID = a.PlayerUID;
      e.u.Ammo = { Id: ammoId, Amount: ammoDeficit };
      e.u.IsRandomSpawned = false;
      GameEventsEnqueue(gGameEvents, e);
      sound.s = ammo.Sound;
    }
  }
  return true;
}
export function PickupIsManual(a: TActor, p: Pickup): boolean {
  if (p.PickedUp) return false;
  for (const pe of p.class.Effects) {
    switch (pe.Type) {
      case PICKUP_GUN:
        return true;
      case PICKUP_AMMO:
        if (AmmoGetById(pe.Ammo.Id)!.DefaultGun != null && !ActorUsesAmmo(a, pe.Ammo.Id)) return true;
        break;
      case PICKUP_MENU:
        return true;
      default:
        break;
    }
  }
  return false;
}

// --- powerup.c -----------------------------------------------------------------------------------------------------

const TIME_DECAY_EXPONENT = 1.04;
const MAX_TILES_PER_PICKUP = 300;
const INT_MAX = 2147483647;
export interface PowerupSpawner {
  map: GameMap;
  timer: number;
  timeUntilNextSpawn: number;
  numPickups: number;
  Enabled: boolean;
  SpawnTime: number;
  RateScaleFunc: () => number;
  PlaceFunc: (pos: Vec2) => void;
}
function PowerupSpawnerNew(map: GameMap): PowerupSpawner {
  return { map, timer: 0, timeUntilNextSpawn: 0, numPickups: 0, Enabled: true, SpawnTime: 0, RateScaleFunc: () => 0, PlaceFunc: () => {} };
}
export function PowerupSpawnerUpdate(p: PowerupSpawner, ticks: number): void {
  if (!p.Enabled) return;
  let scalar = p.RateScaleFunc();
  if (scalar === Number.MAX_VALUE) {
    p.timeUntilNextSpawn = INT_MAX;
  } else {
    scalar *= Math.pow(TIME_DECAY_EXPONENT, p.numPickups);
    p.timeUntilNextSpawn = Math.trunc(Math.floor(scalar * p.SpawnTime));
  }
  p.timer += ticks;
  if (p.timer >= p.timeUntilNextSpawn && Math.trunc(p.map.NumExplorableTiles / MAX_TILES_PER_PICKUP) + 1 > p.numPickups) {
    p.timer -= p.timeUntilNextSpawn;
    if (TryPlacePickup(p)) p.numPickups++;
  }
}
function TryPlacePickup(p: PowerupSpawner): boolean {
  const size = svec2i(6, 6);
  for (let i = 0; i < 100; i++) {
    const v = MapGenerateFreePosition(p.map, size);
    const closestPlayer = AIGetClosestPlayer(v);
    if (!svec2_is_zero(v) && (!closestPlayer || svec2_distance_squared(v, closestPlayer.Pos) >= SQUARED(150))) {
      p.PlaceFunc(v);
      return true;
    }
  }
  for (let i = 0; i < 100; i++) {
    const v = MapGenerateFreePosition(p.map, size);
    if (!svec2_is_zero(v)) {
      p.PlaceFunc(v);
      return true;
    }
  }
  return false;
}
export function PowerupSpawnerRemoveOne(p: PowerupSpawner): void {
  p.numPickups = MAX(0, p.numPickups - 1);
}
export function HealthSpawnerInit(map: GameMap): PowerupSpawner {
  const p = PowerupSpawnerNew(map);
  p.Enabled = AreHealthPickupsAllowed(gCampaign.Entry.Mode) && ConfigGetBool('Game.HealthPickups') && !gCampaign.IsClient;
  p.SpawnTime = 20 * FPS_FRAMELIMIT;
  p.RateScaleFunc = () => {
    let minHealth = CampaignGetMaxHP(gCampaign);
    const maxHealth = minHealth;
    for (const pd of gPlayerDatas) {
      if (!IsPlayerAlive(pd)) continue;
      minHealth = MIN(minHealth, ActorGetByUID(pd.ActorUID)!.health);
    }
    return (minHealth + maxHealth) / (maxHealth * 2.0);
  };
  p.PlaceFunc = (pos) => {
    const e = GameEventNew(GAME_EVENT_ADD_PICKUP);
    e.u.Pos = pos;
    e.u.PickupClass = 'health';
    e.u.IsRandomSpawned = true;
    GameEventsEnqueue(gGameEvents, e);
  };
  PowerupSpawnerUpdate(p, 0);
  return p;
}
export function AmmoSpawnerInit(map: GameMap, ammoId: number): PowerupSpawner {
  const p = PowerupSpawnerNew(map);
  p.Enabled = gCampaign.Setting.Ammo && !gCampaign.IsClient;
  p.SpawnTime = 20 * FPS_FRAMELIMIT;
  p.RateScaleFunc = () => {
    const n = PlayersNumUseAmmo(ammoId);
    if (n === 0) return Number.MAX_VALUE;
    let minVal = AmmoGetById(ammoId)!.Max;
    const maxVal = minVal;
    for (const pd of gPlayerDatas) {
      if (!IsPlayerAlive(pd)) continue;
      minVal = MIN(minVal, ActorGetByUID(pd.ActorUID)!.ammo[ammoId]);
    }
    return (minVal * 9.0 + maxVal) / (maxVal * 10.0) / n;
  };
  p.PlaceFunc = (pos) => {
    const e = GameEventNew(GAME_EVENT_ADD_PICKUP);
    e.u.Pos = pos;
    e.u.PickupClass = `ammo_${AmmoGetById(ammoId)!.Name}`;
    e.u.IsRandomSpawned = true;
    GameEventsEnqueue(gGameEvents, e);
  };
  PowerupSpawnerUpdate(p, 0);
  return p;
}
