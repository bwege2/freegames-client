// C-Dogs SDL 2.5.0, translated: the camera's state and update (camera.c without its drawing, screen_shake.c) and
// the HUD state the game events change (hud.c HUDDisplayMessage/HUDUpdate/HUDGetDrawData, hud_num_popup.c).
// Drawing is in ../render/. GPL-2.0-or-later / BSD-2-Clause (web/games/cdogs/LICENSE.md).
import {
  CMD_HAS_DIRECTION, CLAMP_OPPOSITE, MAX, MIN, RAND_FLOAT, TILE_HEIGHT, TILE_WIDTH, AnyButton, Button1, Down, Left, Right, Up,
  f32, svec2, svec2_zero, type Vec2,
} from './base.ts';
import { ConfigGetEnum, ConfigGetInt, SPLITSCREEN_ALWAYS, SPLITSCREEN_NEVER } from './config.ts';
import { gMap } from './map.ts';
import { gCampaign, gMission, gPlayerDatas, IsPVP } from './state.ts';
import type { PlayerData } from './types.ts';
import { ActorGetByUID } from './actors.ts';
import {
  FindLocalPlayerIndex, GetNumPlayers, IsPlayerAliveOrDying, IsPlayerScreen, PLAYER_ALIVE_OR_DYING, PlayerDataGetByUID,
  PlayersGetBoundingRectangle, PlayersGetMidpoint,
} from './player.ts';
import { SoundSetEar, SoundSetEars, SoundSetEarsSide } from './sounds.ts';
import { cameraHooks, type CameraRef } from './hooks.ts';
import { rand } from './base.ts';

export const CAMERA_SPLIT_PADDING = 40;
export const SPECTATE_NONE = 0;
export const SPECTATE_FOLLOW = 1;
export const SPECTATE_FREE = 2;
const PAN_SPEED = 4;

export interface ScreenShake { ticks: number; Delta: Vec2 }
/** hud_num_popup.c */
export interface NumPopup { PlayerUID: number; Amount: number; Timer: number; TimerMax: number }
export interface HUDState {
  message: string;
  messageTicks: number;
  showExit: boolean;
  DrawData: { NumScreens: number; Players: (PlayerData | null)[] };
  /** the score popups of the local players and the popups of the objectives */
  score: NumPopup[];
  objective: NumPopup[];
  /** hud.c's per-player state (health/ammo gauges), kept by the renderer */
  playersState: unknown[];
  clockMs: number;
  fps: number;
  fpsFrames: number;
  fpsMs: number;
}
export interface Camera {
  lastPosition: Vec2;
  HUD: HUDState;
  shake: ScreenShake;
  FollowNextPlayer: boolean;
  FollowActorUID: number;
  FocusActorUID: number;
  spectateMode: number;
  NumViews: number;
  /** the port: online, the screen shake draws its noise from its own generator, so that every client's
   * simulation keeps the same random numbers (each client has its own camera); offline it uses rand() */
  shakeRand: (() => number) | null;
}

export function HUDGetDrawData(): HUDState['DrawData'] {
  const d: HUDState['DrawData'] = { NumScreens: 0, Players: [null, null, null, null] };
  for (const p of gPlayerDatas) {
    if (!IsPlayerScreen(p)) continue;
    d.Players[d.NumScreens] = p;
    d.NumScreens++;
  }
  return d;
}
export function CameraInit(): Camera {
  return {
    lastPosition: svec2_zero(),
    HUD: {
      message: '', messageTicks: 0, showExit: false, DrawData: { NumScreens: 0, Players: [null, null, null, null] },
      score: [0, 1, 2, 3].map(newPopup), objective: (gMission.missionData?.Objectives ?? []).map(newPopup), playersState: [],
      clockMs: 0, fps: 0, fpsFrames: 0, fpsMs: 0,
    },
    shake: { ticks: 0, Delta: svec2_zero() },
    FollowNextPlayer: false, FollowActorUID: 0, FocusActorUID: 0, spectateMode: SPECTATE_NONE, NumViews: 0,
    shakeRand: null,
  };
}
export function HUDDisplayMessage(c: Camera, msg: string, ticks: number): void {
  c.HUD.message = msg;
  c.HUD.messageTicks = ticks;
}
function newPopup(): NumPopup {
  return { PlayerUID: 0, Amount: 0, Timer: 0, TimerMax: 0 };
}
export function HUDNumPopupsAdd(c: Camera, type: number, idxOrUID: number, amount: number): void {
  let dst: NumPopup | undefined;
  let timer = 0;
  if (type === 0) {
    const localIdx = FindLocalPlayerIndex(idxOrUID);
    if (localIdx < 0) return;
    dst = c.HUD.score[localIdx];
    timer = 1000;
  } else {
    dst = c.HUD.objective[idxOrUID];
    timer = 2000;
  }
  if (!dst) return;
  if (dst.Timer <= 0) dst.Amount = amount;
  else dst.Amount += amount;
  dst.Timer = timer;
  dst.TimerMax = timer;
  dst.PlayerUID = type === 0 ? idxOrUID : 0;
}


// --- screen_shake.c ----------------------------------------------------------------------------------------------

export function ScreenShakeAdd(s: ScreenShake, force: number, multiplier: number): ScreenShake {
  const fps = ConfigGetInt('Game.FPS');
  const extra = Math.trunc((force * multiplier * fps) / 100);
  const maxShake = Math.trunc((100 * fps) / 100);
  return { ticks: MIN(s.ticks + extra, maxShake), Delta: s.Delta };
}
function ScreenShakeUpdate(c: Camera, s: ScreenShake, ticks: number): ScreenShake {
  const t = MAX(s.ticks - ticks, 0);
  const shakeStandard = Math.trunc((70 * 1 * ConfigGetInt('Game.FPS')) / 100);
  const maxDelta = Math.trunc((t * 28) / shakeStandard);
  if (maxDelta === 0) return { ticks: t, Delta: svec2_zero() };
  const r = c.shakeRand ?? rand;
  const rf = (hi: number): number => f32(0 + (r() / 2147483647) * (hi - 0));
  const x = c.shakeRand ? rf(maxDelta) : RAND_FLOAT(0, maxDelta);
  const y = c.shakeRand ? rf(maxDelta) : RAND_FLOAT(0, maxDelta);
  return { ticks: t, Delta: svec2(x, y) };
}

// --- camera.c ------------------------------------------------------------------------------------------------------

export function CameraInput(camera: Camera, cmd: number, lastCmd: number): void {
  if (camera.spectateMode === SPECTATE_NONE) return;
  if (CMD_HAS_DIRECTION(cmd)) {
    camera.spectateMode = SPECTATE_FREE;
    const lp = { ...camera.lastPosition };
    if (Left(cmd)) lp.x = f32(lp.x - PAN_SPEED);
    else if (Right(cmd)) lp.x = f32(lp.x + PAN_SPEED);
    if (Up(cmd)) lp.y = f32(lp.y - PAN_SPEED);
    else if (Down(cmd)) lp.y = f32(lp.y + PAN_SPEED);
    camera.lastPosition = lp;
  } else if ((AnyButton(cmd) && !AnyButton(lastCmd)) || camera.FollowNextPlayer) {
    if (GetNumPlayers(PLAYER_ALIVE_OR_DYING, false, false) === 0) return;
    camera.spectateMode = SPECTATE_FOLLOW;
    const playerIndex = gPlayerDatas.findIndex((p) => p.ActorUID === camera.FollowActorUID);
    const d = Button1(cmd) ? 1 : -1;
    for (let i = playerIndex + d; ; i += d) {
      i = CLAMP_OPPOSITE(i, 0, gPlayerDatas.length - 1);
      if (i === playerIndex) break;
      const p = gPlayerDatas[i];
      if (IsPlayerAliveOrDying(p)) {
        camera.FollowActorUID = p.ActorUID;
        camera.FollowNextPlayer = false;
        break;
      }
    }
  }
}
export function CameraUpdate(camera: Camera, ticks: number, ms: number, resX: number, resY: number): void {
  camera.HUD.DrawData = HUDGetDrawData();
  camera.FocusActorUID = -1;
  if (camera.HUD.DrawData.NumScreens === 0) {
    if (camera.spectateMode === SPECTATE_NONE) {
      camera.spectateMode = SPECTATE_FREE;
      for (const p of gPlayerDatas) {
        if (IsPlayerAliveOrDying(p)) {
          camera.spectateMode = SPECTATE_FOLLOW;
          camera.FollowActorUID = p.ActorUID;
          break;
        }
      }
    }
  } else {
    camera.spectateMode = SPECTATE_NONE;
  }
  if (camera.spectateMode === SPECTATE_FOLLOW) {
    const a = ActorGetByUID(camera.FollowActorUID);
    if (a != null) {
      const p = PlayerDataGetByUID(a.PlayerUID);
      camera.HUD.DrawData.Players[0] = p;
      if (p != null) {
        camera.HUD.DrawData.NumScreens = 1;
        const fa = ActorGetByUID(p.ActorUID);
        if (fa != null) camera.lastPosition = fa.Pos;
      }
    }
  }
  HUDUpdate(camera, ms);
  camera.shake = ScreenShakeUpdate(camera, camera.shake, ticks);
  const dd = camera.HUD.DrawData;
  if (dd.NumScreens === 0) {
    camera.NumViews = 1;
    SoundSetEars(camera.lastPosition);
    return;
  }
  const onePlayer = dd.NumScreens === 1;
  const singleScreen = CameraIsSingleScreen(resX, resY);
  if (onePlayer || singleScreen) {
    if (onePlayer) {
      const p = ActorGetByUID(dd.Players[0]!.ActorUID)!;
      camera.lastPosition = p.thing.Pos;
      camera.FocusActorUID = p.uid;
    } else {
      camera.lastPosition = PlayersGetMidpoint();
    }
    const earPos = camera.lastPosition;
    if (gMap.Size.x * TILE_WIDTH < resX) {
      camera.lastPosition = { x: f32((gMap.Size.x * TILE_WIDTH) / 2), y: camera.lastPosition.y };
      camera.FocusActorUID = -1;
    }
    if (gMap.Size.y * TILE_HEIGHT < resY) {
      camera.lastPosition = { x: camera.lastPosition.x, y: f32((gMap.Size.y * TILE_HEIGHT) / 2) };
      camera.FocusActorUID = -1;
    }
    SoundSetEars(earPos);
    camera.NumViews = 1;
  } else if (dd.NumScreens === 2) {
    for (let i = 0; i < dd.NumScreens; i++) {
      const a = ActorGetByUID(dd.Players[i]!.ActorUID)!;
      camera.lastPosition = a.thing.Pos;
      SoundSetEarsSide(i === 0, camera.lastPosition);
    }
    camera.NumViews = 2;
  } else if (dd.NumScreens >= 3 && dd.NumScreens <= 4) {
    const alive = [false, false, false, false];
    for (let i = 0; i < dd.NumScreens; i++) {
      const p = dd.Players[i]!;
      alive[i] = IsPlayerAliveOrDying(p);
      if (!alive[i]) continue;
      const a = ActorGetByUID(p.ActorUID)!;
      camera.lastPosition = a.thing.Pos;
      const isLeft = i === 0 || i === 2;
      const isUpper = i <= 2;
      SoundSetEar(isLeft, isUpper ? 0 : 1, camera.lastPosition);
      const other = i ^ 2;
      if (!alive[other]) SoundSetEar(isLeft, !isUpper ? 0 : 1, camera.lastPosition);
      else if (!alive[3 - i] && !alive[3 - other]) SoundSetEarsSide(!isLeft, camera.lastPosition);
    }
    camera.NumViews = 4;
  }
}
function HUDUpdate(camera: Camera, ms: number): void {
  const hud = camera.HUD;
  if (hud.messageTicks >= 0) {
    hud.messageTicks -= ms;
    if (hud.messageTicks < 0) hud.messageTicks = 0;
  }
  hud.clockMs += ms;
  hud.fpsFrames++;
  hud.fpsMs += ms;
  if (hud.fpsMs >= 1000) {
    hud.fps = hud.fpsFrames;
    hud.fpsFrames = 0;
    hud.fpsMs -= 1000;
  }
  for (const p of hud.score) if (p.Timer > 0) p.Timer -= ms;
  for (const p of hud.objective) if (p.Timer > 0) p.Timer -= ms;
  hudHooks.update(camera, ms);
}
/** the renderer's HUD state (gauges) updates with the camera */
export const hudHooks = { update: (_c: Camera, _ms: number): void => {}, rumble: (): void => {} };

export function CameraIsSingleScreen(resX: number, resY: number): boolean {
  if (ConfigGetEnum('Interface.Splitscreen') === SPLITSCREEN_ALWAYS) return false;
  const mapFitsInScreen = gMap.Size.x * TILE_WIDTH < resX && gMap.Size.y * TILE_HEIGHT < resY;
  if (IsPVP(gCampaign.Entry.Mode) && !mapFitsInScreen && GetNumPlayers(PLAYER_ALIVE_OR_DYING, true, true) > 0) return false;
  if (ConfigGetEnum('Interface.Splitscreen') === SPLITSCREEN_NEVER) return true;
  const { min, max } = PlayersGetBoundingRectangle();
  return f32(max.x - min.x) < resX - CAMERA_SPLIT_PADDING && f32(max.y - min.y) < resY - CAMERA_SPLIT_PADDING;
}

cameraHooks.followNextPlayer = (c: CameraRef) => {
  (c as Camera).FollowNextPlayer = true;
};
cameraHooks.numPopup = (c: CameraRef, type: number, idx: number, amount: number) => HUDNumPopupsAdd(c as Camera, type, idx, amount);
cameraHooks.shake = (c: CameraRef, amount: number, subjectOnly: boolean, actorUID: number) => {
  const cam = c as Camera;
  if (subjectOnly && actorUID !== cam.FollowActorUID) return;
  cam.shake = ScreenShakeAdd(cam.shake, amount, ConfigGetInt('Graphics.ShakeMultiplier'));
  hudHooks.rumble();
};
cameraHooks.message = (c: CameraRef, msg: string, ticks: number) => HUDDisplayMessage(c as Camera, msg, ticks);
cameraHooks.showExit = (c: CameraRef) => {
  (c as Camera).HUD.showExit = true;
};
