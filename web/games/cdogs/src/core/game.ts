// C-Dogs SDL 2.5.0, translated: the game's simulation step (game.c: RunGameOnEnter, RunGameUpdate, GameUpdate,
// CheckMissionCompletion, PlayerSpecialCommands) without its drawing, and campaigns.c CampaignSeedRandom.
// GPL-2.0-or-later / BSD-2-Clause (web/games/cdogs/LICENSE.md).
import { Button2, CMD_HAS_DIRECTION, Vec2CenterOfTile, Vec2ToTile, f32, srand, svec2, svec2_is_zero, svec2_scale, svec2_zero, svec2i, svec2i_add, svec2i_assign_vec2, svec2i_scale_divide } from './base.ts';
import { gMap, LOSCalcFrom, LOSReset, LOSSetAllVisible, MapGetExploredPercentage, MapHasExits, MapMarkAllAsVisited, MapUpdate, UpdateWatches, type GameMap } from './map.ts';
import { MapBuild } from './mapbuild.ts';
import { ConfigGetEnum, ConfigGetInt, SPLITSCREEN_NEVER, SWITCHMOVE_SLIDE } from './config.ts';
import {
  GAME_EVENT_ACTOR_IMPULSE, GAME_EVENT_ACTOR_PILOT, GAME_EVENT_GAME_BEGIN, GAME_EVENT_GAME_START, GAME_EVENT_MISSION_END,
  GAME_EVENT_MISSION_INCOMPLETE, GAME_EVENT_MISSION_PICKUP, GAME_EVENT_OBJECTIVE_UPDATE, GAME_EVENT_PLAYER_DATA,
  GAME_EVENT_SET_MESSAGE, GameEventNew, GameEventsEnqueue, gGameEvents,
} from './events.ts';
import {
  gCampaign, gMission, gPlayerDatas, HasRounds, IsPVP, MISSION_STATE_PICKUP, MISSION_STATE_PLAY, MISSION_STATE_WAITING,
  type Campaign, type MissionOptions,
} from './state.ts';
import { INPUT_DEVICE_AI, type TActor } from './types.ts';
import { AmmoGetNumClasses, FPS_FRAMELIMIT } from './classes.ts';
import { OBJECTIVE_INVESTIGATE } from './mission.ts';
import {
  ActorGetByUID, ActorPersistPlayerWeaponsAndAmmo, ActorsPilotVehicles, ActorTrySwitchWeapon,
  CommandActor, GameEventNewActorAdd, PlacePlayer, SlideActor, UpdateAllActors,
} from './actors.ts';
import { AICommand, AICommandLast, AIAddRandomEnemies, CreateEnemies, InitializeBadGuys } from './ai.ts';
import { AICoopGetCmd } from './aicoop.ts';
import { ObjAdd, ObjsGetNextUID, UpdateMobileObjects, UpdateObjects } from './objs.ts';
import { AmmoSpawnerInit, HealthSpawnerInit, PickupsUpdate, PowerupSpawnerUpdate, type PowerupSpawner } from './pickups.ts';
import { ParticlesUpdate } from './particles.ts';
import { gParticles } from './state.ts';
import {
  AreAllPlayersDeadAndNoLives, GetNumPlayers, IsPlayerAlive, PLAYER_ALIVE_OR_DYING, PLAYER_ANY, PlayerDataMissionReset,
  PlayersGetMidpoint,
} from './player.ts';
import { AllSurvivingPlayersInSameExit, GAME_OVER_DELAY, IsMissionComplete, MissionCanBegin, MissionSetMessageIfComplete } from './missionrun.ts';
import { HandleGameEvents } from './handle.ts';
import { buildHooks, type CameraRef } from './hooks.ts';
import { gSoundDevice } from './sounds.ts';

buildHooks.objAdd = (m) => ObjAdd(m);
buildHooks.objsGetNextUID = ObjsGetNextUID;
buildHooks.gameEventNewActorAdd = GameEventNewActorAdd;
buildHooks.actorsPilotVehicles = ActorsPilotVehicles;
buildHooks.handleGameEvents = () => HandleGameEvents(gGameEvents, null, null, null);

export const PICKUP_LIMIT = FPS_FRAMELIMIT * 5;
export const CAMERA_SPLIT_PADDING = 40;
export const MAX_LOCAL_PLAYERS = 4;

export function CampaignSeedRandom(c: Campaign): void {
  srand(10 * c.MissionIndex + ConfigGetInt('Game.RandomSeed'));
}

/** the simulation side of RunGameData (game.h) */
export interface RunGameData {
  co: Campaign;
  m: MissionOptions;
  map: GameMap;
  Camera: CameraRef | null;
  healthSpawner: PowerupSpawner | null;
  ammoSpawners: PowerupSpawner[];
  aiUpdateCounter: number;
  /** the commands of the players, in the order of gPlayerDatas (the original: of the local players) */
  cmds: number[];
  lastCmds: number[];
  isMap: boolean;
}
export function GameInit(co: Campaign, m: MissionOptions, map: GameMap): RunGameData {
  return {
    co, m, map, Camera: null, healthSpawner: null, ammoSpawners: [], aiUpdateCounter: 0, cmds: [0, 0, 0, 0],
    lastCmds: [0, 0, 0, 0], isMap: false,
  };
}

/**
 * The simulation part of RunGameOnEnter. pvpSeed: the original reseeds PVP games from the clock after building the
 * map; the port takes the seed from the caller (the room's seed online, the clock offline). cameraInit runs where
 * the original calls CameraInit.
 */
export function GameSimEnter(rData: RunGameData, pvpSeed: number, cameraInit: () => void): void {
  CampaignSeedRandom(rData.co);
  MapBuild(rData.map, rData.m.missionData!, !rData.co.IsClient, rData.m.index, rData.co.Entry.Mode, rData.co.Setting.characters);
  if (IsPVP(rData.co.Entry.Mode)) srand(pvpSeed >>> 0);
  if (!rData.co.IsClient) {
    if (IsPVP(rData.co.Entry.Mode)) MapMarkAllAsVisited(rData.map);
    for (const p of gPlayerDatas) {
      if (!p.IsLocal) continue;
      const e = GameEventNew(GAME_EVENT_PLAYER_DATA);
      e.u = PlayerDataMissionReset(p);
      GameEventsEnqueue(gGameEvents, e);
    }
    HandleGameEvents(gGameEvents, null, null, null);
    let firstPos = svec2_zero();
    for (const p of gPlayerDatas) {
      if (!p.Ready) continue;
      firstPos = PlacePlayer(gMap, p, firstPos, true);
    }
    if (!IsPVP(rData.co.Entry.Mode)) {
      InitializeBadGuys();
      CreateEnemies();
    }
  }
  cameraInit();
  if (GetNumPlayers(PLAYER_ANY, false, true) === 0) LOSSetAllVisible(rData.map);
  if (rData.co.Setting.RandomPickups) {
    rData.healthSpawner = HealthSpawnerInit(rData.map);
    rData.ammoSpawners = [];
    for (let i = 0; i < AmmoGetNumClasses(); i++) rData.ammoSpawners.push(AmmoSpawnerInit(rData.map, i));
  }
  rData.m.state = MISSION_STATE_WAITING;
  rData.m.isDone = false;
  rData.m.DoneCounter = 0;
  GameEventsEnqueue(gGameEvents, GameEventNew(GAME_EVENT_GAME_START));
  const e = GameEventNew(GAME_EVENT_SET_MESSAGE);
  if (HasRounds(rData.co.Entry.Mode)) {
    let totalScores = 0;
    for (const p of gPlayerDatas) totalScores += p.Totals.Score;
    e.u.Message = `Round ${totalScores + 1}`;
  } else if (IsPVP(rData.co.Entry.Mode)) {
    e.u.Message = 'Fight!';
  } else {
    e.u.Message = rData.m.missionData!.Title;
  }
  e.u.Ticks = 3000;
  GameEventsEnqueue(gGameEvents, e);
}

/** RunGameOnExit's bookkeeping */
export function GameSimExit(): void {
  HandleGameEvents(gGameEvents, null, null, null);
  for (const p of gPlayerDatas) p.Ready = false;
  for (const p of gPlayerDatas) {
    p.survived = IsPlayerAlive(p) ? 1 : 0;
    if (IsPlayerAlive(p)) p.hp = ActorGetByUID(p.ActorUID)!.health;
  }
}

function PlayerSpecialCommands(actor: TActor, cmd: number): void {
  if (Button2(cmd) && CMD_HAS_DIRECTION(cmd)) {
    if (ConfigGetEnum('Game.SwitchMoveStyle') === SWITCHMOVE_SLIDE && actor.vehicleUID === -1) SlideActor(actor, cmd);
  } else if (!Button2(actor.lastCmd) && Button2(cmd) && !actor.specialCmdDir && !actor.CanPickupSpecial &&
    !(ConfigGetEnum('Game.SwitchMoveStyle') === SWITCHMOVE_SLIDE && CMD_HAS_DIRECTION(cmd))) {
    if (actor.vehicleUID >= 0) {
      const e = GameEventNew(GAME_EVENT_ACTOR_PILOT);
      e.u.On = false;
      e.u.UID = actor.uid;
      e.u.VehicleUID = actor.vehicleUID;
      GameEventsEnqueue(gGameEvents, e);
    } else {
      ActorTrySwitchWeapon(actor);
    }
  }
}

export const UPDATE_RESULT_OK = 0;
export const UPDATE_RESULT_DRAW = 1;
export const UPDATE_RESULT_NEXT = 2;

/**
 * RunGameUpdate. cmds: one command per entry of gPlayerDatas that is local (the original's cmds[idx]). paused: the
 * pause menu or the map is shown (offline only, as in the original). Returns UPDATE_RESULT_NEXT when the mission
 * is over (the original's NextLoop).
 */
export function GameSimUpdate(rData: RunGameData, paused: boolean, skipFrame: boolean, frames: number,
  resX: number, resY: number, cameraUpdate: () => void): number {
  if (rData.m.isDone) {
    rData.m.DoneCounter--;
    if (rData.m.DoneCounter <= 0) return UPDATE_RESULT_NEXT;
    return UPDATE_RESULT_DRAW;
  }
  if (!rData.m.HasBegun && MissionCanBegin()) {
    const begin = GameEventNew(GAME_EVENT_GAME_BEGIN);
    begin.u.MissionTime = gMission.time;
    GameEventsEnqueue(gGameEvents, begin);
  }
  MissionSetMessageIfComplete(rData.m);
  if (paused) return UPDATE_RESULT_DRAW;
  if (skipFrame) return UPDATE_RESULT_DRAW;
  if (ConfigGetEnum('Interface.Splitscreen') === SPLITSCREEN_NEVER && GetNumPlayers(PLAYER_ALIVE_OR_DYING, true, true) > 1 &&
    !IsPVP(gCampaign.Entry.Mode)) {
    const w = resX;
    const h = resY;
    const screen = svec2i_add(svec2i_assign_vec2(PlayersGetMidpoint()), svec2i(-Math.trunc(w / 2), -Math.trunc(h / 2)));
    for (const pd of gPlayerDatas) {
      if (!pd.IsLocal || !IsPlayerAlive(pd)) continue;
      const p = ActorGetByUID(pd.ActorUID)!;
      const pad = CAMERA_SPLIT_PADDING;
      const vel = { x: 0, y: 0 };
      const P = p.thing.Pos;
      const V = p.thing.Vel;
      if (screen.x + pad > P.x && V.x < 1) vel.x = f32(screen.x + pad - P.x);
      else if (screen.x + w - pad < P.x && V.x > -1) vel.x = f32(screen.x + w - pad - P.x);
      if (screen.y + pad > P.y && V.y < 1) vel.y = f32(screen.y + pad - P.y);
      else if (screen.y + h - pad < P.y && V.y > -1) vel.y = f32(screen.y + h - pad - P.y);
      if (!svec2_is_zero(vel)) {
        const ei = GameEventNew(GAME_EVENT_ACTOR_IMPULSE);
        ei.u.UID = p.uid;
        ei.u.Vel = svec2_scale(vel, f32(0.25));
        ei.u.Pos = svec2_zero();
        GameEventsEnqueue(gGameEvents, ei);
      }
    }
  }
  const ticksPerFrame = 1;
  if (gPlayerDatas.length > 0) {
    LOSReset(gMap);
    for (let i = 0, idx = 0; i < gPlayerDatas.length; i++, idx++) {
      const p = gPlayerDatas[i];
      if (p.ActorUID === -1) continue;
      const player = ActorGetByUID(p.ActorUID)!;
      LOSCalcFrom(gMap, Vec2ToTile(player.thing.Pos), !gCampaign.IsClient);
      if (player.dead) continue;
      if (!p.IsLocal) {
        idx--;
        continue;
      }
      if (p.inputDevice === INPUT_DEVICE_AI) rData.cmds[idx] = AICoopGetCmd(player, ticksPerFrame);
      PlayerSpecialCommands(player, rData.cmds[idx]);
      rData.cmds[idx] = CommandActor(player, rData.cmds[idx], ticksPerFrame);
    }
  }
  GameUpdate(rData, ticksPerFrame, frames);
  cameraUpdate();
  return UPDATE_RESULT_DRAW;
}

export function GameUpdate(data: RunGameData, ticksPerFrame: number, frames: number): void {
  if (!gCampaign.IsClient) {
    data.aiUpdateCounter -= ticksPerFrame;
    if (data.aiUpdateCounter <= 0) {
      const enemies = AICommand(ticksPerFrame);
      AIAddRandomEnemies(enemies, data.m.missionData!);
      data.aiUpdateCounter = 4;
    } else {
      AICommandLast(ticksPerFrame);
    }
  }
  UpdateAllActors(ticksPerFrame);
  UpdateObjects(ticksPerFrame);
  UpdateMobileObjects(ticksPerFrame);
  PickupsUpdate(ticksPerFrame);
  ParticlesUpdate(gParticles, ticksPerFrame);
  MapUpdate(data.map);
  UpdateWatches(data.map.triggers, ticksPerFrame);
  if (data.healthSpawner) PowerupSpawnerUpdate(data.healthSpawner, ticksPerFrame);
  for (const a of data.ammoSpawners) PowerupSpawnerUpdate(a, ticksPerFrame);
  if (!gCampaign.IsClient) CheckMissionCompletion(data.m);
  // the original passes no sound device on the first frame: nothing of that frame is heard
  gSoundDevice.muted = frames === 0;
  HandleGameEvents(gGameEvents, data.Camera, data.healthSpawner, data.ammoSpawners);
  gSoundDevice.muted = false;
  data.m.time += ticksPerFrame;
}

function CheckMissionCompletion(mo: MissionOptions): void {
  const objs = mo.missionData!.Objectives;
  for (let i = 0; i < objs.length; i++) {
    const o = objs[i];
    if (o.Type !== OBJECTIVE_INVESTIGATE) continue;
    const update = MapGetExploredPercentage(gMap) - o.done;
    if (update > 0 && !gCampaign.IsClient) {
      const e = GameEventNew(GAME_EVENT_OBJECTIVE_UPDATE);
      e.u.ObjectiveId = i;
      e.u.Count = update;
      GameEventsEnqueue(gGameEvents, e);
    }
  }
  const complete = GetNumPlayers(PLAYER_ALIVE_OR_DYING, false, false) > 0 && IsMissionComplete(mo);
  const exitIndex = AllSurvivingPlayersInSameExit();
  const canExit = complete && (!MapHasExits(gMap) || exitIndex >= 0);
  if (mo.state === MISSION_STATE_PLAY && canExit) GameEventsEnqueue(gGameEvents, GameEventNew(GAME_EVENT_MISSION_PICKUP));
  if (mo.state === MISSION_STATE_PICKUP && !canExit) GameEventsEnqueue(gGameEvents, GameEventNew(GAME_EVENT_MISSION_INCOMPLETE));
  if (mo.state === MISSION_STATE_PICKUP && mo.pickupTime + PICKUP_LIMIT <= mo.time) {
    const e = GameEventNew(GAME_EVENT_MISSION_END);
    e.u.Mission = exitIndex >= 0 ? gMap.exits[exitIndex].Mission : mo.index + 1;
    GameEventsEnqueue(gGameEvents, e);
  }
  if (gPlayerDatas.length > 0) {
    const allPlayersDestroyed = gPlayerDatas.every((p) => p.ActorUID === -1);
    if (allPlayersDestroyed && AreAllPlayersDeadAndNoLives()) {
      const e = GameEventNew(GAME_EVENT_MISSION_END);
      e.u.Delay = GAME_OVER_DELAY;
      e.u.Mission = mo.index;
      GameEventsEnqueue(gGameEvents, e);
    }
  }
}

/** NextLoop's bookkeeping: the players keep their weapons; the next mission */
export function GameSimPersist(): void {
  for (const p of gPlayerDatas) if (IsPlayerAlive(p)) ActorPersistPlayerWeaponsAndAmmo(ActorGetByUID(p.ActorUID)!);
}
export function GameSimNext(rData: RunGameData): void {
  GameSimPersist();
  if (!HasRounds(rData.co.Entry.Mode) && !rData.co.IsComplete) rData.co.MissionIndex = rData.m.NextMission;
}
export { svec2, Vec2CenterOfTile, svec2i_scale_divide };
