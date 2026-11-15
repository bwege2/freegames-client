// C-Dogs SDL 2.5.0, translated: the game screen (game.c RunGame: input, update, drawing, next screen) and the pause
// menu (pause_menu.c). The simulation step itself is core/game.ts. GPL-2.0-or-later / BSD-2-Clause
// (web/games/cdogs/LICENSE.md).
import { CMD_ESC, CMD_MAP, Vec2CenterOfTile, colorBlack, svec2i_scale_divide } from '../core/base.ts';
import { ConfigGetBool, ConfigGetInt } from '../core/config.ts';
import { GAME_EVENT_MISSION_END, GameEventNew, GameEventsEnqueue, gGameEvents } from '../core/events.ts';
import { GAME_MODE_DEATHMATCH, GAME_MODE_DOGFIGHT, HasRounds, IsAutoMapEnabled, gCampaign, gMission, gPlayerDatas } from '../core/state.ts';
import { gMap } from '../core/map.ts';
import { INPUT_DEVICE_KEYBOARD, INPUT_DEVICE_UNSET } from '../core/types.ts';
import { GetNumPlayers, PLAYER_ALIVE, PLAYER_ANY } from '../core/player.ts';
import { MissionAllObjectivesComplete } from '../core/missionrun.ts';
import { GameInit, GameSimEnter, GameSimExit, GameSimPersist, GameSimUpdate, UPDATE_RESULT_NEXT, type RunGameData } from '../core/game.ts';
import { CameraInit, CameraInput, CameraUpdate, type Camera } from '../core/camera.ts';
import { gSoundDevice, SoundPlay, StrSound } from '../core/sounds.ts';
import { GetGameCmd, GetKeyboardCmd, JoyLock, KeyIsPressed, KeyLockKeys, SDL_SCANCODE_ESCAPE, ARROW_LEFT, ARROW_RIGHT, ev } from '../platform/input.ts';
import { DrawRectangle, FontH, FontStr, FontStrSize, gGfx } from '../render/gfx.ts';
import { AutomapDraw, CameraDraw, CameraDrawMode, HUDDraw } from '../render/draw.ts';
import { GrafxRedrawBackground } from '../render/bg.ts';
import { DrawButton } from '../render/buttons.ts';
import {
  MENU_TYPE_NORMAL, MENU_TYPE_QUIT, MENU_TYPE_RETURN, MenuAddExitType, MenuAddSubmenu, MenuCreate, MenuCreateNormal, MenuCreateReturn,
  MenuCreateSeparator, MenuDraw, MenuReset, MenuSystemInit, MenuUpdate, type MenuSystem,
} from './menu.ts';
import { GameLoopDataNew, UPDATE_RESULT_DRAW, UPDATE_RESULT_OK, type GameLoopData, type LoopRunner } from './loop.ts';
import { MenuCreateBriefing, MenuCreateOptions } from './options.ts';
import { ScreenLoading } from './loading.ts';
import { ScreenMissionSummary } from './briefing.ts';
import { ScreenDeathmatchFinalScores, ScreenDogfightScores } from './end.ts';

/**
 * Online play (lockstep): exchange gives this frame's commands of all local players (gPlayerDatas order, IsLocal)
 * from the client's own ones, or null while the other clients' commands for this frame have not arrived. The pvp
 * seed is the room's. Offline: null.
 */
export const runGameHooks = {
  online: null as null | {
    exchange: (own: number[]) => number[] | null;
    pvpSeed: () => number;
    shakeRand: () => number;
    /** the local game is over (the mission summary follows): report it to the others */
    ended?: () => void;
    /** the screens below have exited (they clear the players): make this round's players, before GameSimEnter */
    beforeEnter?: () => void;
  },
};

// --- pause_menu.c ----------------------------------------------------------------------------------------------------

interface PauseMenu { ms: MenuSystem; pausingDevice: number; controllerUnplugged: boolean }
function PauseMenuInit(rData: RunGameData, gfxChange: (resetBg: boolean) => void): PauseMenu {
  const ms = MenuSystemInit({ x: 0, y: 0 }, { x: gGfx.w, y: gGfx.h });
  ms.current = ms.root = MenuCreateNormal('', '', MENU_TYPE_NORMAL, 0);
  MenuAddSubmenu(ms.root, MenuCreate('Resume', MENU_TYPE_QUIT));
  MenuAddSubmenu(ms.root, MenuCreateSeparator(''));
  const m = rData.m;
  if (m.missionData!.Description && m.missionData!.Description.length > 0) MenuAddSubmenu(ms.root, MenuCreateBriefing('Briefing...', m));
  MenuAddSubmenu(ms.root, MenuCreateOptions('Options...', { gfxChangeCallback: gfxChange }));
  MenuAddSubmenu(ms.root, MenuCreateSeparator(''));
  MenuAddSubmenu(ms.root, MenuCreateReturn('Quit', 0));
  MenuAddExitType(ms, MENU_TYPE_RETURN);
  ms.allowAborts = true;
  return { ms, pausingDevice: INPUT_DEVICE_UNSET, controllerUnplugged: false };
}
const PauseMenuIsShown = (pm: PauseMenu): boolean => pm.pausingDevice !== INPUT_DEVICE_UNSET || pm.controllerUnplugged;
function PauseMenuUpdate(pm: PauseMenu, cmds: number[], lastCmds: number[]): boolean {
  let pausingDevice = INPUT_DEVICE_UNSET;
  let firstPausingDevice = INPUT_DEVICE_UNSET;
  if (GetNumPlayers(PLAYER_ANY, false, true) === 0) {
    firstPausingDevice = INPUT_DEVICE_KEYBOARD;
  } else {
    let idx = 0;
    for (const p of gPlayerDatas) {
      if (!p.IsLocal || !p.isOwn) continue;
      if (firstPausingDevice === INPUT_DEVICE_UNSET) firstPausingDevice = p.inputDevice;
      if (idx === 0 && (cmds[idx] & CMD_ESC) && !(lastCmds[idx] & CMD_ESC)) pausingDevice = p.inputDevice;
      idx++;
    }
  }
  if (KeyIsPressed(SDL_SCANCODE_ESCAPE)) pausingDevice = INPUT_DEVICE_KEYBOARD;
  pm.controllerUnplugged = gPlayerDatas.some((p) => p.inputDevice === INPUT_DEVICE_UNSET && p.IsLocal && p.isOwn);
  if (pm.pausingDevice !== INPUT_DEVICE_UNSET) {
    const result = MenuUpdate(pm.ms);
    if (result === UPDATE_RESULT_OK || pm.ms.current!.type === MENU_TYPE_QUIT) {
      pm.pausingDevice = INPUT_DEVICE_UNSET;
      gSoundDevice.musicReduced = false;
      if (pm.ms.current!.type === MENU_TYPE_RETURN) {
        const e = GameEventNew(GAME_EVENT_MISSION_END);
        e.u.IsQuit = true;
        GameEventsEnqueue(gGameEvents, e);
        pm.pausingDevice = INPUT_DEVICE_UNSET;
        pm.controllerUnplugged = false;
        SoundPlay(gSoundDevice, StrSound('menu_back'));
        return true;
      }
      MenuReset(pm.ms);
    }
  } else if (pm.controllerUnplugged || ev.HasLostFocus) {
    pm.pausingDevice = firstPausingDevice;
    SoundPlay(gSoundDevice, StrSound('menu_error'));
    gSoundDevice.musicReduced = true;
  } else if (pausingDevice !== INPUT_DEVICE_UNSET) {
    pm.pausingDevice = pausingDevice;
    SoundPlay(gSoundDevice, StrSound('menu_back'));
    gSoundDevice.musicReduced = true;
  }
  return false;
}
function PauseMenuDraw(pm: PauseMenu): void {
  if (!PauseMenuIsShown(pm)) return;
  DrawRectangle({ x: 0, y: 0 }, { x: gGfx.w, y: gGfx.h }, { ...colorBlack, a: 128 }, true);
  if (pm.controllerUnplugged) {
    const s = FontStrSize(`${ARROW_LEFT}Paused${ARROW_RIGHT}\nFoobar\nPlease reconnect controller`);
    let pos = { x: Math.trunc((gGfx.w - s.x) / 2), y: Math.trunc((gGfx.h - s.y) / 2) };
    const x = pos.x;
    FontStr(`${ARROW_LEFT}Paused${ARROW_RIGHT}`, pos);
    pos.y += FontH();
    pos = FontStr('Press ', pos);
    pos = DrawButton(INPUT_DEVICE_KEYBOARD, 0, CMD_ESC, pos);
    FontStr(' to quit', pos);
    pos.x = x;
    pos.y += FontH();
    FontStr('Please reconnect controller', pos);
  } else if (pm.pausingDevice !== INPUT_DEVICE_UNSET) {
    MenuDraw(pm.ms);
  }
}

// --- game.c ----------------------------------------------------------------------------------------------------------

export function RunGame(): GameLoopData {
  const rData = GameInit(gCampaign, gMission, gMap);
  let camera: Camera = CameraInit();
  let pm: PauseMenu | null = null;
  let isMap = false;
  /** the own players' commands (the original's cmds of its local players) */
  let own = [0, 0, 0, 0];
  let lastOwn = [0, 0, 0, 0];
  /** online: this frame's commands have not arrived yet */
  let waiting = false;
  const online = runGameHooks.online;
  const resetCamera = (): void => {
    // BlitFillBuf black, BlitUpdateFromBuf(bkg)
    gGfx.bkgBlack = true;
    const shake = camera.shakeRand;
    camera = CameraInit();
    camera.shakeRand = shake;
    rData.Camera = camera;
  };
  const g = GameLoopDataNew({
    label: 'game',
    OnEnter: () => {
      online?.beforeEnter?.();
      resetCamera();
      GameSimEnter(rData, online ? online.pvpSeed() : Math.trunc(Date.now() / 1000), () => {
        camera = CameraInit();
        camera.shakeRand = online ? online.shakeRand : null;
        rData.Camera = camera;
      });
      if (GetNumPlayers(PLAYER_ANY, false, true) === 0) {
        camera.lastPosition = Vec2CenterOfTile(svec2i_scale_divide(rData.map.Size, 2));
        camera.FollowNextPlayer = true;
      }
      pm = PauseMenuInit(rData, (resetBg) => {
        if (resetBg) resetCamera();
        pm!.ms.size = { x: gGfx.w, y: gGfx.h };
      });
    },
    OnExit: () => {
      GameSimExit();
      GrafxRedrawBackground(camera.lastPosition);
    },
    InputFunc: () => {
      if (ev.HasQuit) {
        const e = GameEventNew(GAME_EVENT_MISSION_END);
        e.u.IsQuit = true;
        GameEventsEnqueue(gGameEvents, e);
        return;
      }
      let lastCmdAll = 0;
      lastOwn = own;
      for (const c of lastOwn) lastCmdAll |= c;
      own = [0, 0, 0, 0];
      let cmdAll = 0;
      if (GetNumPlayers(PLAYER_ANY, false, true) === 0) {
        own[0] = GetKeyboardCmd(0, false);
      } else {
        let idx = 0;
        for (const p of gPlayerDatas) {
          if (!p.IsLocal || !p.isOwn) continue;
          own[idx] = GetGameCmd(p);
          cmdAll |= own[idx];
          idx++;
        }
      }
      g.SkipNextFrame = g.SuperhotMode && !lastCmdAll;
      const wasPaused = PauseMenuIsShown(pm!);
      if (PauseMenuUpdate(pm!, own, lastOwn)) g.SkipNextFrame = true;
      if (!PauseMenuIsShown(pm!)) {
        if (IsAutoMapEnabled(gCampaign.Entry.Mode) && (KeyIsPressed(ConfigGetInt('Input.PlayerCodes0.map')) || ((cmdAll & CMD_MAP) && !(lastCmdAll & CMD_MAP)))) {
          isMap = !isMap;
          SoundPlay(gSoundDevice, StrSound(isMap ? 'map_open' : 'map_close'));
        }
        if (wasPaused) {
          own = [0, 0, 0, 0];
          lastOwn = [0, 0, 0, 0];
          KeyLockKeys();
          JoyLock();
        }
      }
      if (!wasPaused && PauseMenuIsShown(pm!)) {
        isMap = false;
        own = [0, 0, 0, 0];
        lastOwn = [0, 0, 0, 0];
      }
      CameraInput(camera, own[0], lastOwn[0]);
      // the simulation's commands: offline the own players are all the local players
      waiting = false;
      if (online) {
        const all = online.exchange(online && PauseMenuIsShown(pm!) ? [0, 0, 0, 0] : own);
        if (all == null) waiting = true;
        else rData.cmds = all;
      } else {
        rData.cmds = [...own];
      }
    },
    UpdateFunc: (l: LoopRunner) => {
      const paused = PauseMenuIsShown(pm!) || isMap;
      // as the original: only a game that nobody else plays pauses (online the game runs on)
      const pauses = !online && paused && !ev.HasQuit;
      if (waiting && !rData.m.isDone) return UPDATE_RESULT_DRAW;
      const r = GameSimUpdate(rData, pauses, g.SkipNextFrame, g.Frames, gGfx.w, gGfx.h,
        () => CameraUpdate(camera, 1, Math.trunc(1000 / g.FPS), gGfx.w, gGfx.h));
      if (r === UPDATE_RESULT_NEXT) {
        NextLoop(rData, l);
        return UPDATE_RESULT_OK;
      }
      return r;
    },
    DrawFunc: () => {
      CameraDraw(camera);
      CameraDrawMode(camera);
      HUDDraw(camera, camera.NumViews, PauseMenuIsShown(pm!));
      PauseMenuDraw(pm!);
      if (isMap) AutomapDraw(0, camera.HUD.showExit);
    },
  });
  g.FPS = ConfigGetInt('Game.FPS');
  g.SuperhotMode = ConfigGetBool('Game.Superhot(tm)Mode');
  return g;
}
function NextLoop(rData: RunGameData, l: LoopRunner): void {
  runGameHooks.online?.ended?.();
  const hasLocalPlayers = GetNumPlayers(PLAYER_ANY, false, true) > 0;
  const survivedAndCompleted = GetNumPlayers(PLAYER_ALIVE, false, false) > 0 && MissionAllObjectivesComplete(gMission);
  GameSimPersist();
  let next: GameLoopData | null = null;
  const showScores = !rData.co.IsQuit && hasLocalPlayers;
  const mode = rData.co.Entry.Mode;
  if (showScores) {
    if (mode === GAME_MODE_DOGFIGHT) next = ScreenDogfightScores();
    else if (mode === GAME_MODE_DEATHMATCH) next = ScreenDeathmatchFinalScores();
    else next = ScreenMissionSummary(rData.co, rData.m, survivedAndCompleted);
  }
  l.push(ScreenLoading('Debriefing...', true, next, true));
  if (!HasRounds(mode) && !rData.co.IsComplete) rData.co.MissionIndex = rData.m.NextMission;
}
