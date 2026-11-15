// C-Dogs SDL 2.5.0, translated: the game's global state (gActors, gObjs, gMobObjs, gParticles, gPickups,
// gPlayerDatas, gMission, gCampaign of actors.c, objs.c, particle.c, pickup.c, player.c, mission.c,
// campaigns.c). GPL-2.0-or-later / BSD-2-Clause (web/games/cdogs/LICENSE.md).
import type { TActor, TObject, TMobileObject, Particle, Pickup, PlayerData, CharacterStore, WeaponClass } from './types.ts';
import type { Mission } from './mission.ts';
import { newCharacterStore } from './classes.ts';

export const gActors: TActor[] = [];
export const gObjs: TObject[] = [];
export const gMobObjs: TMobileObject[] = [];
export const gParticles: Particle[] = [];
export const gPickups: Pickup[] = [];
export const gPlayerDatas: PlayerData[] = [];

export const GAME_MODE_NORMAL = 0;
export const GAME_MODE_DOGFIGHT = 1;
export const GAME_MODE_DEATHMATCH = 2;
export const GAME_MODE_QUICK_PLAY = 3;

export const MISSION_STATE_WAITING = 0;
export const MISSION_STATE_PLAY = 1;
export const MISSION_STATE_PICKUP = 2;

export interface MissionOptions {
  index: number;
  KeyFlags: number;
  missionData: Mission | null;
  Weapons: WeaponClass[];
  time: number;
  pickupTime: number;
  state: number;
  HasStarted: boolean;
  HasBegun: boolean;
  isDone: boolean;
  DoneCounter: number;
  NextMission: number;
  MissionCompleted: boolean;
}
export function newMissionOptions(): MissionOptions {
  return {
    index: 0, KeyFlags: 0, missionData: null, Weapons: [], time: 0, pickupTime: 0, state: MISSION_STATE_WAITING,
    HasStarted: false, HasBegun: false, isDone: false, DoneCounter: 0, NextMission: 0, MissionCompleted: false,
  };
}
export const gMission: MissionOptions = newMissionOptions();

export interface CampaignSetting {
  Title: string;
  Author: string;
  Description: string;
  Ammo: boolean;
  SkipWeaponMenu: boolean;
  BuyAndSell: boolean;
  RandomPickups: boolean;
  DoorOpenTicks: number;
  Lives: number;
  MaxLives: number;
  PlayerHP: number;
  PlayerMaxHP: number;
  PlayerExcessHP: number;
  Missions: Mission[];
  characters: CharacterStore;
}
export function newCampaignSetting(): CampaignSetting {
  return {
    Title: '', Author: '', Description: '', Ammo: false, SkipWeaponMenu: false, BuyAndSell: false,
    RandomPickups: true, DoorOpenTicks: 70, Lives: 0, MaxLives: 0, PlayerHP: 0, PlayerMaxHP: 0, PlayerExcessHP: 0,
    Missions: [], characters: newCharacterStore(),
  };
}
export interface CampaignEntry {
  Filename: string;
  Path: string;
  Info: string;
  Mode: number;
  BuiltinIndex: number;
  NumMissions: number;
  IsBuiltin: boolean;
}
export interface Campaign {
  Entry: CampaignEntry;
  Setting: CampaignSetting;
  MissionIndex: number;
  IsLoaded: boolean;
  IsClient: boolean;
  IsQuit: boolean;
  IsComplete: boolean;
  OptionsSet: boolean;
}
export const gCampaign: Campaign = {
  Entry: { Filename: '', Path: '', Info: '', Mode: GAME_MODE_NORMAL, BuiltinIndex: 0, NumMissions: 0, IsBuiltin: false },
  Setting: newCampaignSetting(),
  MissionIndex: 0,
  IsLoaded: false,
  IsClient: false,
  IsQuit: false,
  IsComplete: false,
  OptionsSet: false,
};

// game_mode.c
export function IsPVP(mode: number): boolean {
  return mode === GAME_MODE_DOGFIGHT || mode === GAME_MODE_DEATHMATCH;
}
export function IsIntroNeeded(mode: number): boolean {
  return mode === GAME_MODE_NORMAL;
}
export function IsScoreNeeded(mode: number): boolean {
  return mode !== GAME_MODE_DOGFIGHT && mode !== GAME_MODE_DEATHMATCH;
}
export function HasObjectives(mode: number): boolean {
  return mode === GAME_MODE_NORMAL || mode === GAME_MODE_QUICK_PLAY;
}
export function IsAutoMapEnabled(mode: number): boolean {
  return mode !== GAME_MODE_DOGFIGHT && mode !== GAME_MODE_DEATHMATCH;
}
export function CanLevelSelect(mode: number): boolean {
  return mode === GAME_MODE_NORMAL;
}
export function AreKeysAllowed(mode: number): boolean {
  return mode === GAME_MODE_NORMAL || mode === GAME_MODE_QUICK_PLAY;
}
export function AreHealthPickupsAllowed(mode: number): boolean {
  return mode === GAME_MODE_NORMAL || mode === GAME_MODE_QUICK_PLAY;
}
export function IsMultiplayer(mode: number): boolean {
  return mode === GAME_MODE_DOGFIGHT || mode === GAME_MODE_DEATHMATCH;
}
export function HasExit(mode: number): boolean {
  return mode !== GAME_MODE_DOGFIGHT && mode !== GAME_MODE_DEATHMATCH;
}
export function HasRounds(mode: number): boolean {
  return mode === GAME_MODE_DOGFIGHT;
}
export function ModeHasNPCs(mode: number): boolean {
  return mode !== GAME_MODE_DOGFIGHT && mode !== GAME_MODE_DEATHMATCH;
}
export function GameModeStr(g: number): string {
  return ['Campaign', 'Dogfight', 'Deathmatch', 'Quick Play'][g] ?? '';
}
