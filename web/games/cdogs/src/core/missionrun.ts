// C-Dogs SDL 2.5.0, translated: a mission in play (mission.c: SetupMission, objectives, completion, MissionBegin).
// GPL-2.0-or-later / BSD-2-Clause (web/games/cdogs/LICENSE.md).
import { THING_OBJECTIVE } from './types.ts';
import {
  GAME_EVENT_MISSION_COMPLETE, GAME_EVENT_MISSION_END, GAME_EVENT_OBJECTIVE_UPDATE, GameEventNew,
  GameEventsEnqueue, gGameEvents, type GameEventU,
} from './events.ts';
import {
  gActors, gCampaign, gMission, gParticles, gPlayerDatas, newMissionOptions, GAME_MODE_NORMAL, IsPVP, MISSION_STATE_PLAY,
  MISSION_STATE_WAITING, type MissionOptions,
} from './state.ts';
import { OBJECTIVE_RESCUE, ObjectiveFromThing, ObjectiveIsComplete, ObjectiveIsRequired, ObjectiveSetup, type Mission } from './mission.ts';
import { CharacterIsPrisoner } from './classes.ts';
import { gMap, MapIsTileInExit, WatchesInit } from './map.ts';
import { ActorGetByUID, ActorGetCharacter, ActorsInit } from './actors.ts';
import { MobObjsInit, ObjsInit } from './objs.ts';
import { PickupsInit } from './pickups.ts';
import { GetNumPlayers, IsPlayerAliveOrDying, PLAYER_ALIVE_OR_DYING, PLAYER_ANY } from './player.ts';
import { MUSIC_GAME, MusicPlayFile, MusicPlayGeneral } from './music.ts';
import { FPS_FRAMELIMIT } from './classes.ts';

export const GAME_OVER_DELAY = FPS_FRAMELIMIT * 2;

function MissionOptionsInit(mo: MissionOptions): void {
  Object.assign(mo, {
    index: 0, KeyFlags: 0, missionData: null, Weapons: [], time: 0, pickupTime: 0, state: MISSION_STATE_WAITING,
    HasStarted: false, HasBegun: false, isDone: false, DoneCounter: 0, NextMission: 0, MissionCompleted: false,
  });
}
function SetupBadguysForMission(mission: Mission): void {
  const s = gCampaign.Setting.characters;
  s.prisonerIds.length = 0;
  s.baddieIds.length = 0;
  s.specialIds.length = 0;
  if (s.OtherChars.length === 0) return;
  for (const o of mission.Objectives) {
    if (o.Type === OBJECTIVE_RESCUE) {
      s.prisonerIds.push(o.Index);
      break;
    }
  }
  for (const e of mission.Enemies) s.baddieIds.push(e);
  for (const sc of mission.SpecialChars) s.specialIds.push(sc);
}
export function SetupMission(m: Mission, mo: MissionOptions, missionIndex: number): void {
  MissionOptionsInit(mo);
  mo.index = missionIndex;
  mo.missionData = m;
  ActorsInit();
  ObjsInit();
  MobObjsInit();
  PickupsInit();
  gParticles.length = 0;
  WatchesInit();
  for (const o of m.Objectives) ObjectiveSetup(o);
  SetupBadguysForMission(m);
  mo.Weapons = [...m.Weapons];
}
/** MissionOptionsTerminate (gamedata.c) */
export function MissionOptionsTerminate(mo: MissionOptions): void {
  ActorsInit();
  ObjsInit();
  MobObjsInit();
  PickupsInit();
  gParticles.length = 0;
  WatchesInit();
  for (const p of gPlayerDatas) p.ActorUID = -1;
  Object.assign(mo, newMissionOptions());
}
function ObjectiveActorsAlive(objective: number): number {
  let count = 0;
  for (const a of gActors) if (a.isInUse && a.health > 0 && ObjectiveFromThing(a.thing.flags) === objective) count++;
  return count;
}
export function MissionSetMessageIfComplete(options: MissionOptions): void {
  if (gCampaign.IsClient) return;
  if (CanCompleteMission(options) && !gMission.MissionCompleted) {
    const msg = GameEventNew(GAME_EVENT_MISSION_COMPLETE);
    msg.u.ShowMsg = MissionHasRequiredObjectives(options);
    GameEventsEnqueue(gGameEvents, msg);
  } else if (options.HasBegun && gCampaign.Entry.Mode === GAME_MODE_NORMAL) {
    const objs = options.missionData!.Objectives;
    for (let i = 0; i < objs.length; i++) {
      const o = objs[i];
      if (o.Type === OBJECTIVE_RESCUE && ObjectiveActorsAlive(i) < o.Required) {
        const e = GameEventNew(GAME_EVENT_MISSION_END);
        e.u.Delay = GAME_OVER_DELAY;
        e.u.Msg = 'Mission failed';
        GameEventsEnqueue(gGameEvents, e);
      }
    }
  }
}
export function MissionHasRequiredObjectives(mo: MissionOptions): boolean {
  return mo.missionData!.Objectives.some((o) => ObjectiveIsRequired(o));
}
export function UpdateMissionObjective(options: MissionOptions, flags: number, type: number, count: number): void {
  if (!(flags & THING_OBJECTIVE)) return;
  const idx = ObjectiveFromThing(flags);
  const o = options.missionData!.Objectives[idx];
  if (o.Type !== type) return;
  if (!gCampaign.IsClient) {
    const e = GameEventNew(GAME_EVENT_OBJECTIVE_UPDATE);
    e.u.ObjectiveId = idx;
    e.u.Count = count;
    GameEventsEnqueue(gGameEvents, e);
  }
}
export function MissionCanBegin(): boolean {
  if (IsPVP(gCampaign.Entry.Mode)) return GetNumPlayers(PLAYER_ALIVE_OR_DYING, false, false) > 1;
  return GetNumPlayers(PLAYER_ALIVE_OR_DYING, false, false) > 0;
}
export function MissionBegin(m: MissionOptions, gb: GameEventU): void {
  m.HasBegun = true;
  m.state = MISSION_STATE_PLAY;
  const song = m.missionData!.Song;
  if (song) MusicPlayFile(MUSIC_GAME, gCampaign.Entry.Path, song);
  else MusicPlayGeneral(MUSIC_GAME);
  m.time = gb.MissionTime;
  m.pickupTime = 0;
}
export function CanCompleteMission(options: MissionOptions): boolean {
  if (!options.HasBegun) return false;
  if (IsPVP(gCampaign.Entry.Mode)) {
    return GetNumPlayers(PLAYER_ANY, false, false) > 1 && GetNumPlayers(PLAYER_ALIVE_OR_DYING, false, false) <= 1;
  }
  return MissionAllObjectivesComplete(options);
}
export function MissionAllObjectivesComplete(mo: MissionOptions): boolean {
  return mo.missionData!.Objectives.every((o) => ObjectiveIsComplete(o));
}
export function IsMissionComplete(mo: MissionOptions): boolean {
  if (!CanCompleteMission(mo)) return false;
  if (IsPVP(gCampaign.Entry.Mode) && GetNumPlayers(PLAYER_ALIVE_OR_DYING, false, false) <= 1) {
    let numPlayersWithLives = 0;
    for (const p of gPlayerDatas) if (p.Lives > 0) numPlayersWithLives++;
    if (numPlayersWithLives <= 1) return true;
  }
  const exit = AllSurvivingPlayersInSameExit();
  return !MoreRescuesNeeded(mo, exit);
}
export function MissionNeedsMoreRescuesInExit(mo: MissionOptions): boolean {
  const exit = AllSurvivingPlayersInSameExit();
  return CanCompleteMission(mo) && exit !== -1 && MoreRescuesNeeded(mo, exit);
}
export function AllSurvivingPlayersInSameExit(): number {
  let exit = -1;
  for (const p of gPlayerDatas) {
    if (!IsPlayerAliveOrDying(p)) continue;
    const player = ActorGetByUID(p.ActorUID)!;
    const playerExit = MapIsTileInExit(gMap, player.thing, exit);
    if (playerExit === -1) return -1;
    exit = playerExit;
  }
  return exit;
}
function MoreRescuesNeeded(mo: MissionOptions, exit: number): boolean {
  let rescuesRequired = 0;
  for (const o of mo.missionData!.Objectives) {
    if (o.Type === OBJECTIVE_RESCUE) {
      rescuesRequired = o.Required;
      break;
    }
  }
  if (rescuesRequired > 0) {
    let prisonersRescued = 0;
    for (const a of gActors) {
      if (!a.isInUse) continue;
      if (CharacterIsPrisoner(gCampaign.Setting.characters, ActorGetCharacter(a)) && MapIsTileInExit(gMap, a.thing, exit) === exit) {
        prisonersRescued++;
      }
    }
    if (prisonersRescued < rescuesRequired) return true;
  }
  return false;
}
export function MissionDone(mo: MissionOptions, end: GameEventU): void {
  mo.isDone = true;
  mo.DoneCounter = end.Delay;
  gCampaign.IsQuit = end.IsQuit;
  mo.NextMission = end.Mission;
}
