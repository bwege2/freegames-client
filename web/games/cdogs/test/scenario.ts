// The oracle's scenario (re/cdogs/oracle/oracle.c main) with the port: load the data, a campaign and players, then
// run the game loop's update with the same scripted commands and dump the same state.
import { f32, resetRandCalls, randCalls, srand, CMD_BUTTON1, CMD_BUTTON2, CMD_DOWN, CMD_LEFT, CMD_RIGHT, CMD_UP } from '../src/core/base.ts';
import { ConfigGet, ConfigGetInt, ConfigResetDefault } from '../src/core/config.ts';
import { CampaignEntryTryLoad, CampaignLoad, CampaignSettingTerminateAll, GameDataLoad, type DataFS } from '../src/core/data.ts';
import { gActors, gCampaign, gMission, gMobObjs, gObjs, gParticles, gPickups, gPlayerDatas } from '../src/core/state.ts';
import { CollisionSystemReset, gMap } from '../src/core/map.ts';
import { INPUT_DEVICE_AI, INPUT_DEVICE_KEYBOARD } from '../src/core/types.ts';
import { platformHooks } from '../src/core/hooks.ts';
import { PlayerAddMinimalWeapons, PlayerAddWeapon, PlayerDataAddOrUpdate, PlayerDataDefault, PlayerDataGetByUID } from '../src/core/player.ts';
import { SetupMission } from '../src/core/missionrun.ts';
import { AICoopSelectWeapons } from '../src/core/aicoop.ts';
import { CampaignSeedRandom, GameInit, GameSimEnter, GameSimUpdate } from '../src/core/game.ts';
import { CameraInit, CameraUpdate } from '../src/core/camera.ts';
import { ACTOR_GET_WEAPON } from '../src/core/actors.ts';
import { gGameEvents } from '../src/core/events.ts';
import { musicPlayer, MUSIC_TYPE_DIRS } from '../src/core/music.ts';

export interface Scenario {
  campaign: string;
  mode: number;
  mission: number;
  players: number;
  ai: number;
  frames: number;
  every: number;
  seed: number;
  scriptSeed: number;
  config: [string, string][];
  /** the oracle's readdir order of the music (music.c keeps it and shuffles it) */
  music?: Record<string, string[]>;
}

const kDirs = [0, CMD_LEFT, CMD_RIGHT, CMD_UP, CMD_DOWN, CMD_LEFT | CMD_UP, CMD_RIGHT | CMD_UP, CMD_LEFT | CMD_DOWN,
  CMD_RIGHT | CMD_DOWN];
const RES_X = 320;
const RES_Y = 200;

/* eslint-disable @typescript-eslint/no-explicit-any */
function dump(frame: number): any {
  const f = (x: number): number => f32(x);
  return {
    frame, rand: randCalls,
    mission: {
      time: gMission.time, state: gMission.state, keys: gMission.KeyFlags,
      done: gMission.missionData!.Objectives.map((o) => o.done), isDone: gMission.isDone ? 1 : 0,
      completed: gMission.MissionCompleted ? 1 : 0,
    },
    players: gPlayerDatas.map((p) => ({ uid: p.UID, actor: p.ActorUID, score: p.Stats.Score, kills: p.Stats.Kills, lives: p.Lives })),
    actors: gActors.filter((a) => a.isInUse).map((a) => ({
      uid: a.uid, x: f(a.Pos.x), y: f(a.Pos.y), vx: f(a.thing.Vel.x), vy: f(a.thing.Vel.y), hp: a.health, dead: a.dead,
      dir: a.direction, flags: a.flags, gun: a.gunIndex, cmd: a.lastCmd, lock: ACTOR_GET_WEAPON(a).barrels[0].lock,
    })),
    objs: gObjs.filter((o) => o.isInUse).map((o) => [o.uid, o.Health]),
    bullets: gMobObjs.filter((m) => m.isInUse).map((m) => ({ uid: m.UID, x: f(m.thing.Pos.x), y: f(m.thing.Pos.y), z: f(m.z), count: m.count })),
    pickups: gPickups.filter((p) => p.isInUse).map((p) => [p.UID, p.class.Name]),
    particles: gParticles.filter((p) => p.isInUse).length,
  };
}

export async function runScenario(fs: DataFS, sc: Scenario): Promise<any[]> {
  resetRandCalls();
  srand(1);
  ConfigResetDefault('');
  ConfigGet('Graphics.ShowHUD').value = true;
  ConfigGet('Graphics.ShakeMultiplier').value = 1;
  ConfigGet('Game.RandomSeed').value = sc.seed;
  for (const [k, v] of sc.config) {
    const c = ConfigGet(k);
    c.value = typeof c.value === 'boolean' ? v === 'true' : parseInt(v, 10);
  }
  platformHooks.hasGrenadeButton = (p) => p.inputDevice === INPUT_DEVICE_KEYBOARD &&
    ConfigGetInt(`Input.PlayerCodes${p.deviceIndex}.grenade`) !== 0;
  gPlayerDatas.length = 0;
  gGameEvents.length = 0;
  CampaignSettingTerminateAll(gCampaign);
  Object.assign(gCampaign, { MissionIndex: 0, IsLoaded: false, IsClient: false, IsQuit: false, IsComplete: false, OptionsSet: false });
  await GameDataLoad(fs);
  musicPlayer.initialised = false;
  if (sc.music) musicPlayer.generalTracks = MUSIC_TYPE_DIRS.map((d) => (sc.music![d] ?? []).map((f) => `music/${d}/${f}`));
  CollisionSystemReset();

  gCampaign.Entry.Mode = sc.mode;
  const entry = await CampaignEntryTryLoad(fs, sc.campaign, sc.mode);
  if (!entry || !(await CampaignLoad(fs, gCampaign, entry))) throw new Error(`cannot load ${sc.campaign}`);
  gCampaign.MissionIndex = sc.mission;

  for (let i = 0; i < sc.players + sc.ai; i++) {
    const pd = PlayerDataDefault(i);
    pd.UID = i;
    PlayerDataAddOrUpdate(pd);
    const p = PlayerDataGetByUID(i)!;
    p.inputDevice = i < sc.players ? INPUT_DEVICE_KEYBOARD : INPUT_DEVICE_AI;
    p.deviceIndex = i;
  }
  CampaignSeedRandom(gCampaign);
  SetupMission(gCampaign.Setting.Missions[gCampaign.MissionIndex], gMission, gCampaign.MissionIndex);
  gPlayerDatas.forEach((p, idx) => {
    if (p.inputDevice === INPUT_DEVICE_AI) {
      AICoopSelectWeapons(p, idx, gMission.missionData!.Weapons);
    } else {
      for (let w = 0; w < gMission.missionData!.Weapons.length && w < 2; w++) PlayerAddWeapon(p, gMission.missionData!.Weapons[w]);
    }
    PlayerAddMinimalWeapons(p);
  });

  const rData = GameInit(gCampaign, gMission, gMap);
  let camera = CameraInit();
  GameSimEnter(rData, 12345, () => {
    camera = CameraInit();
    rData.Camera = camera;
  });
  const out: any[] = [];
  let script = sc.scriptSeed >>> 0;
  const next = (): number => {
    script = (Math.imul(script, 1103515245) + 12345) >>> 0;
    return (script >>> 16) & 0x7fff;
  };
  const held = [0, 0, 0, 0];
  const ms = Math.trunc(1000 / ConfigGetInt('Game.FPS'));
  for (let frame = 0; frame < sc.frames; frame++) {
    if (frame % sc.every === 0) out.push(dump(frame));
    for (let i = 0; i < sc.players; i++) {
      if (frame % 20 === 0) {
        const r = next();
        held[i] = kDirs[r % 9];
        if (Math.trunc(r / 9) % 2) held[i] |= CMD_BUTTON1;
        if (Math.trunc(r / 18) % 8 === 0) held[i] |= CMD_BUTTON2;
      }
      rData.cmds[i] = held[i];
    }
    if (gMission.isDone && gMission.DoneCounter <= 1) break;
    GameSimUpdate(rData, false, false, frame, RES_X, RES_Y, () => CameraUpdate(camera, 1, ms, RES_X, RES_Y));
  }
  out.push(dump(sc.frames));
  return out;
}
