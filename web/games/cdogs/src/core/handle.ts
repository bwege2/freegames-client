// C-Dogs SDL 2.5.0, translated: handle_game_events.c (every game event is applied here) and thing.c ThingDamage.
// GPL-2.0-or-later / BSD-2-Clause (web/games/cdogs/LICENSE.md).
import { Z_FACTOR, svec2_add, svec2_is_zero, svec2_scale, svec2_zero } from './base.ts';
import {
  DoorStateInit, gMap, MapGetTile, MapMarkAsVisited, MapShowExitArea, PathCacheClear, StrTileClass, ThingAddDrawShake,
  TriggerActivate, FLAGS_PRISONER,
} from './map.ts';
import { KIND_CHARACTER, KIND_OBJECT } from './types.ts';
import {
  GAME_EVENT_ACTOR_ADD, GAME_EVENT_ACTOR_ADD_AMMO, GAME_EVENT_ACTOR_BARK, GAME_EVENT_ACTOR_DIE, GAME_EVENT_ACTOR_DIR,
  GAME_EVENT_ACTOR_HEAL, GAME_EVENT_ACTOR_IMPULSE, GAME_EVENT_ACTOR_MELEE, GAME_EVENT_ACTOR_MOVE,
  GAME_EVENT_ACTOR_PICKUP_ALL, GAME_EVENT_ACTOR_PILOT, GAME_EVENT_ACTOR_REPLACE_GUN, GAME_EVENT_ACTOR_SLIDE,
  GAME_EVENT_ACTOR_STATE, GAME_EVENT_ACTOR_SWITCH_GUN, GAME_EVENT_ACTOR_USE_AMMO, GAME_EVENT_ADD_BULLET,
  GAME_EVENT_ADD_KEYS, GAME_EVENT_ADD_PARTICLE, GAME_EVENT_ADD_PICKUP, GAME_EVENT_BULLET_BOUNCE, GAME_EVENT_CONFIG,
  GAME_EVENT_DOOR_TOGGLE, GAME_EVENT_EXPLORE_TILES, GAME_EVENT_GAME_BEGIN, GAME_EVENT_GAME_START, GAME_EVENT_GUN_FIRE,
  GAME_EVENT_GUN_RELOAD, GAME_EVENT_GUN_STATE, GAME_EVENT_MAP_OBJECT_ADD, GAME_EVENT_MAP_OBJECT_REMOVE,
  GAME_EVENT_MISSION_COMPLETE, GAME_EVENT_MISSION_END, GAME_EVENT_MISSION_INCOMPLETE, GAME_EVENT_MISSION_PICKUP,
  GAME_EVENT_OBJECTIVE_UPDATE, GAME_EVENT_PARTICLE_REMOVE, GAME_EVENT_PLAYER_ADD_LIVES, GAME_EVENT_PLAYER_DATA,
  GAME_EVENT_PLAYER_REMOVE, GAME_EVENT_REMOVE_BULLET, GAME_EVENT_REMOVE_PICKUP, GAME_EVENT_RESCUE_CHARACTER,
  GAME_EVENT_SCORE, GAME_EVENT_SCREEN_SHAKE, GAME_EVENT_SET_MESSAGE, GAME_EVENT_SOUND_AT, GAME_EVENT_THING_DAMAGE,
  GAME_EVENT_TILE_SET, GAME_EVENT_TRIGGER, GameEventNew, GameEventsClear, GameEventsEnqueue, gGameEvents,
  type GameEvent, type GameEventU,
} from './events.ts';
import { GAME_MODE_DOGFIGHT, gCampaign, gMission, gParticles, gPlayerDatas, IsPVP, MISSION_STATE_PICKUP, MISSION_STATE_PLAY } from './state.ts';
import { gSoundDevice, SoundPlay, SoundPlayAt, SoundPlayAtPlusDistance, StrSound } from './sounds.ts';
import { AmmoGetById, AmmoIsLow, StrParticleClass, StrWeaponClass } from './classes.ts';
import { ConfigGet } from './config.ts';
import {
  ACTOR_GET_WEAPON, ActorAdd, ActorAddAmmo, ActorBark, ActorDestroy, ActorGetByUID, ActorHeal, ActorHit, ActorMove,
  ActorPilot, ActorReplaceGun, ActorSwitchGun, DamageMelee, FLAGS_FOLLOWER, FLAGS_RESCUED, OnGunFire, PlacePlayer,
  WeaponClassAddBrass,
} from './actors.ts';
import { AnimationGetActorAnimation, BULLET_Z, ParticleAdd, ParticleDestroy } from './particles.ts';
import {
  AMMO_SPAWNER_RESPAWN_TICKS, BulletAdd, BulletBounce, BulletDestroy, DamageObject, MobObjGetByUID, ObjAdd, ObjGetByUID,
  ObjRemove, ThingGetByUID,
} from './objs.ts';
import { PickupAdd, PickupDestroy, PowerupSpawnerRemoveOne, type PowerupSpawner } from './pickups.ts';
import { PlayerDataAddOrUpdate, PlayerDataGetByUID, PlayerRemove, PlayerScore } from './player.ts';
import { AIGetClosestPlayer } from './ai.ts';
import { MissionBegin, MissionDone, MissionSetMessageIfComplete } from './missionrun.ts';
import { WeaponBarrelSetState } from './weapon.ts';
import { cameraHooks, type CameraRef } from './hooks.ts';

const RELOAD_DISTANCE_PLUS = 200;
export const NUMBER_POPUP_SCORE = 0;
export const NUMBER_POPUP_OBJECTIVE = 1;

export function ThingDamage(d: GameEventU): void {
  const ti = ThingGetByUID(d.Kind, d.UID);
  switch (d.Kind) {
    case KIND_CHARACTER: ActorHit(d); break;
    case KIND_OBJECT: DamageObject(d); break;
    default: break;
  }
  if (ti != null && d.Power > 0) ThingAddDrawShake(ti, svec2_scale(d.Vel, d.Mass));
}

/** HandleGameEvents: events appended while handling are handled in the same pass */
export function HandleGameEvents(store: GameEvent[], camera: CameraRef | null, healthSpawner: PowerupSpawner | null,
  ammoSpawners: PowerupSpawner[] | null): void {
  for (let i = 0; i < store.length; i++) {
    const e = store[i];
    e.Delay--;
    if (e.Delay >= 0) continue;
    HandleGameEvent(e, camera, healthSpawner, ammoSpawners);
  }
  GameEventsClear(store);
}

function addText(cls: string, pos: { x: number; y: number }, dz: number, text: string): void {
  const s = GameEventNew(GAME_EVENT_ADD_PARTICLE);
  s.u.Class = StrParticleClass(cls);
  s.u.Pos = pos;
  s.u.Z = BULLET_Z * Z_FACTOR;
  s.u.DZ = dz;
  s.u.Text = text;
  GameEventsEnqueue(gGameEvents, s);
}

function HandleGameEvent(e: GameEvent, camera: CameraRef | null, healthSpawner: PowerupSpawner | null,
  ammoSpawners: PowerupSpawner[] | null): void {
  const u = e.u;
  const sd = gSoundDevice.muted ? null : gSoundDevice;
  switch (e.Type) {
    case GAME_EVENT_PLAYER_DATA:
      PlayerDataAddOrUpdate(u);
      break;
    case GAME_EVENT_PLAYER_REMOVE:
      PlayerRemove(u.UID);
      if (gPlayerDatas.length === 0 && camera) cameraHooks.followNextPlayer(camera);
      break;
    case GAME_EVENT_TILE_SET: {
      const pos = { x: u.Pos.x, y: u.Pos.y };
      const tileClass = StrTileClass(gMap.TileClasses, u.ClassName);
      const doorClass = StrTileClass(gMap.TileClasses, u.DoorClassName);
      const doorClass2 = StrTileClass(gMap.TileClasses, u.DoorClass2Name);
      for (let i = 0; i <= u.RunLength; i++) {
        const t = MapGetTile(gMap, pos)!;
        t.Class = tileClass;
        t.Door.Class = doorClass;
        t.Door.Class2 = doorClass2;
        DoorStateInit(t.Door, false);
        pos.x++;
        if (pos.x === gMap.Size.x) {
          pos.x = 0;
          pos.y++;
        }
      }
      break;
    }
    case GAME_EVENT_THING_DAMAGE:
      ThingDamage(u);
      break;
    case GAME_EVENT_MAP_OBJECT_ADD:
      ObjAdd(u);
      break;
    case GAME_EVENT_MAP_OBJECT_REMOVE:
      ObjRemove(u);
      break;
    case GAME_EVENT_CONFIG: {
      const c = ConfigGet(u.Name);
      if (typeof c.value === 'boolean') c.value = u.Value === 'true';
      else if (typeof c.value === 'number') c.value = Number.parseInt(u.Value, 10) || 0;
      break;
    }
    case GAME_EVENT_SCORE:
      if (gCampaign.Entry.Mode !== GAME_MODE_DOGFIGHT) {
        PlayerScore(PlayerDataGetByUID(u.PlayerUID), u.Score);
        if (camera != null) cameraHooks.numPopup(camera, NUMBER_POPUP_SCORE, u.PlayerUID, u.Score);
      }
      break;
    case GAME_EVENT_SOUND_AT:
      SoundPlayAtPlusDistance(sd, StrSound(u.Sound), u.Pos, u.Distance);
      break;
    case GAME_EVENT_SCREEN_SHAKE:
      if (camera != null) cameraHooks.shake(camera, u.Amount, u.CameraSubjectOnly, u.ActorUID);
      break;
    case GAME_EVENT_SET_MESSAGE:
      if (camera != null) cameraHooks.message(camera, u.Message, u.Ticks);
      break;
    case GAME_EVENT_GAME_START:
      gMission.HasStarted = true;
      gMission.HasBegun = false;
      break;
    case GAME_EVENT_GAME_BEGIN:
      MissionBegin(gMission, u);
      break;
    case GAME_EVENT_ACTOR_ADD: {
      ActorAdd(u);
      const a = ActorGetByUID(u.UID)!;
      if (u.PlayerUID >= 0) SoundPlayAt(sd, StrSound('spawn'), a.Pos);
      break;
    }
    case GAME_EVENT_ACTOR_MOVE:
      ActorMove(u);
      break;
    case GAME_EVENT_ACTOR_STATE: {
      const a = ActorGetByUID(u.UID)!;
      if (!a.isInUse) break;
      a.anim = AnimationGetActorAnimation(u.State);
      break;
    }
    case GAME_EVENT_ACTOR_DIR: {
      const a = ActorGetByUID(u.UID)!;
      if (!a.isInUse) break;
      a.direction = u.Dir;
      break;
    }
    case GAME_EVENT_ACTOR_SLIDE: {
      const a = ActorGetByUID(u.UID)!;
      if (!a.isInUse) break;
      a.thing.Vel = { ...u.Vel };
      if (ConfigGet('Sound.Footsteps').value) SoundPlayAt(sd, StrSound('slide'), a.thing.Pos);
      break;
    }
    case GAME_EVENT_ACTOR_IMPULSE: {
      const a = ActorGetByUID(u.UID)!;
      if (!a.isInUse) break;
      a.thing.Vel = svec2_add(a.thing.Vel, u.Vel);
      if (!svec2_is_zero(u.Pos)) a.Pos = { ...u.Pos };
      break;
    }
    case GAME_EVENT_ACTOR_SWITCH_GUN:
      ActorSwitchGun(u);
      break;
    case GAME_EVENT_ACTOR_PICKUP_ALL: {
      const a = ActorGetByUID(u.UID)!;
      if (!a.isInUse) break;
      a.PickupAll = u.PickupAll;
      break;
    }
    case GAME_EVENT_ACTOR_REPLACE_GUN:
      ActorReplaceGun(u);
      break;
    case GAME_EVENT_ACTOR_HEAL: {
      const a = ActorGetByUID(u.UID)!;
      if (!a.isInUse || a.dead) break;
      ActorHeal(a, u.Amount, u.ExceedMax);
      if (u.IsRandomSpawned && !gCampaign.IsClient && healthSpawner) PowerupSpawnerRemoveOne(healthSpawner);
      if (u.PlayerUID >= 0) addText('heal_text', a.Pos, 3, `+${u.Amount}`);
      break;
    }
    case GAME_EVENT_ACTOR_ADD_AMMO: {
      const a = ActorGetByUID(u.UID)!;
      if (!a.isInUse || a.dead) break;
      ActorAddAmmo(a, u.Ammo.Id, u.Ammo.Amount);
      if (u.IsRandomSpawned && gCampaign.Setting.RandomPickups && !gCampaign.IsClient && ammoSpawners) {
        PowerupSpawnerRemoveOne(ammoSpawners[u.Ammo.Id]);
      }
      if (u.PlayerUID >= 0) addText('ammo_text', a.Pos, 10, `+${u.Ammo.Amount} ${AmmoGetById(u.Ammo.Id)!.Name}`);
      break;
    }
    case GAME_EVENT_ACTOR_USE_AMMO: {
      const a = ActorGetByUID(u.UID)!;
      if (!a.isInUse || a.dead) break;
      const ammoBefore = a.ammo[u.Ammo.Id];
      const ammo = AmmoGetById(u.Ammo.Id)!;
      const wasAmmoLow = AmmoIsLow(ammo, ammoBefore);
      ActorAddAmmo(a, u.Ammo.Id, -u.Ammo.Amount);
      const p = PlayerDataGetByUID(u.PlayerUID);
      if (p != null && p.IsLocal && p.isOwn) {
        const ammoAfter = a.ammo[u.Ammo.Id];
        if (ammoAfter === 0) SoundPlay(sd, StrSound('ammo_none'));
        else if (!wasAmmoLow && AmmoIsLow(ammo, ammoAfter)) SoundPlay(sd, StrSound('ammo_low'));
      }
      break;
    }
    case GAME_EVENT_ACTOR_DIE: {
      const a = ActorGetByUID(u.UID)!;
      const p = PlayerDataGetByUID(a.PlayerUID);
      if (p != null) {
        p.Lives--;
        if (p.Lives > 0 && !gCampaign.IsClient) {
          let defaultSpawnPosition = svec2_zero();
          const closestActor = AIGetClosestPlayer(a.Pos);
          if (closestActor != null) defaultSpawnPosition = closestActor.Pos;
          PlacePlayer(gMap, p, defaultSpawnPosition, false);
        }
      }
      ActorDestroy(a);
      break;
    }
    case GAME_EVENT_ACTOR_BARK:
      ActorBark(u);
      break;
    case GAME_EVENT_PLAYER_ADD_LIVES: {
      const p = PlayerDataGetByUID(u.UID)!;
      p.Lives += u.Lives;
      const a = ActorGetByUID(p.ActorUID);
      if (a && a.isInUse && !a.dead) addText('lives_text', a.Pos, 4, `+${u.Lives} ${u.Lives > 1 ? 'Lives' : 'Life'}`);
      break;
    }
    case GAME_EVENT_ACTOR_MELEE:
      DamageMelee(u);
      break;
    case GAME_EVENT_ACTOR_PILOT:
      ActorPilot(u);
      break;
    case GAME_EVENT_ADD_PICKUP:
      PickupAdd(u);
      SoundPlayAt(sd, StrSound('spawn_item'), u.Pos);
      break;
    case GAME_EVENT_REMOVE_PICKUP:
      PickupDestroy(u.UID);
      if (u.SpawnerUID >= 0) ObjGetByUID(u.SpawnerUID)!.counter = AMMO_SPAWNER_RESPAWN_TICKS;
      break;
    case GAME_EVENT_BULLET_BOUNCE:
      BulletBounce(u);
      break;
    case GAME_EVENT_REMOVE_BULLET: {
      const o = MobObjGetByUID(u.UID);
      if (o == null || !o.isInUse) break;
      BulletDestroy(o);
      break;
    }
    case GAME_EVENT_PARTICLE_REMOVE:
      ParticleDestroy(gParticles, u.ParticleRemoveId);
      break;
    case GAME_EVENT_GUN_FIRE:
      OnGunFire(u, sd);
      break;
    case GAME_EVENT_GUN_RELOAD: {
      const wc = StrWeaponClass(u.Gun)!;
      SoundPlayAtPlusDistance(sd, wc.Normal.ReloadSound, u.Pos, RELOAD_DISTANCE_PLUS);
      if (wc.Normal.Brass && wc.Normal.ReloadLead !== 0) WeaponClassAddBrass(wc, u.Direction, u.Pos);
      break;
    }
    case GAME_EVENT_GUN_STATE: {
      const a = ActorGetByUID(u.ActorUID)!;
      if (!a.isInUse) break;
      WeaponBarrelSetState(ACTOR_GET_WEAPON(a), u.Barrel, u.State);
      break;
    }
    case GAME_EVENT_ADD_BULLET:
      BulletAdd(u);
      break;
    case GAME_EVENT_ADD_PARTICLE:
      ParticleAdd(gParticles, u);
      break;
    case GAME_EVENT_TRIGGER: {
      const t = MapGetTile(gMap, u.Tile)!;
      for (const tp of t.triggers) {
        if (tp.id === u.ID) {
          TriggerActivate(tp, gMap.triggers);
          break;
        }
      }
      break;
    }
    case GAME_EVENT_EXPLORE_TILES:
      for (const run of u.Runs) {
        const tile = { x: run.Tile.x, y: run.Tile.y };
        for (let j = 0; j < run.Run; j++) {
          MapMarkAsVisited(gMap, tile);
          tile.x++;
          if (tile.x === gMap.Size.x) {
            tile.x = 0;
            tile.y++;
          }
        }
      }
      break;
    case GAME_EVENT_RESCUE_CHARACTER: {
      const a = ActorGetByUID(u.UID)!;
      if (!a.isInUse) break;
      a.flags &= ~FLAGS_PRISONER;
      if (!(a.flags & FLAGS_FOLLOWER)) a.flags |= FLAGS_RESCUED;
      SoundPlayAt(sd, StrSound('rescue'), a.Pos);
      break;
    }
    case GAME_EVENT_OBJECTIVE_UPDATE: {
      const o = gMission.missionData!.Objectives[u.ObjectiveId];
      o.done += u.Count;
      if (camera != null) cameraHooks.numPopup(camera, NUMBER_POPUP_OBJECTIVE, u.ObjectiveId, u.Count);
      MissionSetMessageIfComplete(gMission);
      break;
    }
    case GAME_EVENT_ADD_KEYS: {
      gMission.KeyFlags |= u.KeyFlags;
      if (!svec2_is_zero(u.Pos)) addText('key_text', u.Pos, 10, '+key');
      PathCacheClear();
      break;
    }
    case GAME_EVENT_DOOR_TOGGLE:
      DoorStateInit(MapGetTile(gMap, u.Pos)!.Door, u.IsOpen);
      break;
    case GAME_EVENT_MISSION_COMPLETE:
      if (u.ShowMsg) {
        if (!gMission.MissionCompleted) SoundPlay(sd, StrSound('mission_complete'));
        if (camera != null) cameraHooks.message(camera, 'Mission complete', -1);
      }
      gMission.MissionCompleted = true;
      if (!IsPVP(gCampaign.Entry.Mode)) {
        if (camera != null) cameraHooks.showExit(camera);
        for (let i = 0; i < gMap.exits.length; i++) MapShowExitArea(gMap, i);
      }
      break;
    case GAME_EVENT_MISSION_INCOMPLETE:
      gMission.state = MISSION_STATE_PLAY;
      break;
    case GAME_EVENT_MISSION_PICKUP:
      gMission.state = MISSION_STATE_PICKUP;
      gMission.pickupTime = gMission.time;
      SoundPlay(sd, StrSound('whistle'));
      break;
    case GAME_EVENT_MISSION_END:
      MissionDone(gMission, u);
      if (u.Msg.length > 0 && camera != null) cameraHooks.message(camera, u.Msg, -1);
      break;
    default:
      break;
  }
}
