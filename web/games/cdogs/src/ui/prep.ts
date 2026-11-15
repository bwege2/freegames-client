// C-Dogs SDL 2.5.0, translated: the screens before a mission (prep.c: number of players, player selection, game
// options; password.c: level selection). GPL-2.0-or-later / BSD-2-Clause (web/games/cdogs/LICENSE.md).
import { CMD_BUTTON1 } from '../core/base.ts';
import { ConfigGet, ConfigGetInt, ConfigResetChanged } from '../core/config.ts';
import { CanLevelSelect, GAME_MODE_DEATHMATCH, GAME_MODE_DOGFIGHT, GAME_MODE_NORMAL, GAME_MODE_QUICK_PLAY, gCampaign, gMission, gPlayerDatas } from '../core/state.ts';
import { INPUT_DEVICE_AI, INPUT_DEVICE_JOYSTICK, INPUT_DEVICE_KEYBOARD, INPUT_DEVICE_UNSET } from '../core/types.ts';
import { GAME_EVENT_PLAYER_DATA, GameEventNew, GameEventsEnqueue, gGameEvents } from '../core/events.ts';
import { HandleGameEvents } from '../core/handle.ts';
import { GetNumPlayers, PLAYER_ANY, PlayerDataDefault, PlayerTrySetInputDevice, PlayerTrySetUnusedInputDevice, localPlayers } from '../core/player.ts';
import { CampaignUnload } from '../core/data.ts';
import { CampaignSeedRandom } from '../core/game.ts';
import { MissionOptionsTerminate, SetupMission } from '../core/missionrun.ts';
import { MUSIC_BRIEFING, MusicPlayFromChunk } from '../core/music.ts';
import { AutosaveGetCampaign, PlayerSavesApply } from '../core/autosave.ts';
import { EventIsEscape, GetMenuCmd, GetPlayerCmds, KeyIsPressed, ev } from '../platform/input.ts';
import { FontStr, FontStrW, gGfx } from '../render/gfx.ts';
import { DrawButton } from '../render/buttons.ts';
import {
  MENU_SOUND_START, MENU_TYPE_NORMAL, MENU_TYPE_OPTIONS, MENU_TYPE_RETURN, MENU_ALIGN_CENTER, MenuAddConfigOptionsItem, MenuAddExitType,
  MenuAddSubmenu, MenuCreateBack, MenuCreateCustom, MenuCreateNormal, MenuCreateOptionToggle, MenuCreateReturn, MenuCreateSeparator,
  MenuDisplay, MenuDraw, MenuGetSubmenuByName, MenuIsExit, MenuPlaySound, MenuProcessCmd, MenuReset, MenuSystemInit, MenuUpdate,
  type Menu, type MenuSystem,
} from './menu.ts';
import { GameLoopDataNew, UPDATE_RESULT_DRAW, UPDATE_RESULT_OK, type GameLoopData, type LoopRunner } from './loop.ts';
import { NameGenInit, PlayerSelectMenusCreate, type PlayerSelectMenu } from './playerselect.ts';
import { HighScoresDataLoad, HighScoresDraw } from './hiscores.ts';
import { ScreenMissionBriefing } from './briefing.ts';
import { configHooks } from './options.ts';

const MAX_LOCAL_PLAYERS = 4;
const MAX_KEYBOARD_CONFIGS = 2;

/** the number of local players (the original's "Select number of players") */
export function NumPlayersSelection(): GameLoopData {
  const ms = MenuSystemInit({ x: 0, y: 0 }, { x: gGfx.w, y: gGfx.h });
  ms.allowAborts = true;
  ms.root = ms.current = MenuCreateNormal('', 'Select number of players', MENU_TYPE_NORMAL, 0);
  MenuAddSubmenu(ms.current, MenuCreateReturn('(No local players)', 0));
  for (let i = 0; i < MAX_LOCAL_PLAYERS; i++) MenuAddSubmenu(ms.current, MenuCreateReturn(`${i + 1}`, i + 1));
  MenuAddExitType(ms, MENU_TYPE_RETURN);
  ms.current.index = 1;
  return GameLoopDataNew({
    label: 'players',
    OnEnter: () => MusicPlayFromChunk(MUSIC_BRIEFING),
    UpdateFunc: (l: LoopRunner) => {
      const result = MenuUpdate(ms);
      if (result === UPDATE_RESULT_OK) {
        if (ms.hasAbort) {
          CampaignUnload(gCampaign);
          l.pop();
        } else {
          const numPlayers = ms.current!.returnCode;
          for (let i = 0; i < numPlayers; i++) {
            const e = GameEventNew(GAME_EVENT_PLAYER_DATA);
            e.u = PlayerDataDefault(i);
            e.u.UID = localPlayers.firstUID + i;
            GameEventsEnqueue(gGameEvents, e);
          }
          HandleGameEvents(gGameEvents, null, null, null);
          l.change(PlayerSelection());
        }
      }
      return result;
    },
    DrawFunc: () => MenuDraw(ms),
  });
}
function AssignPlayerInputDevices(): void {
  for (const p of gPlayerDatas) {
    if (!p.IsLocal || !p.isOwn) continue;
    for (let j = 0; j < MAX_KEYBOARD_CONFIGS; j++) {
      if (KeyIsPressed(ConfigGetInt(`Input.PlayerCodes${j}.button1`)) && PlayerTrySetUnusedInputDevice(p, INPUT_DEVICE_KEYBOARD, j)) {
        MenuPlaySound(MENU_SOUND_START);
        break;
      }
    }
    for (const joy of ev.joysticks) {
      if ((joy.currentCmd & CMD_BUTTON1) && !(joy.previousCmd & CMD_BUTTON1) && PlayerTrySetUnusedInputDevice(p, INPUT_DEVICE_JOYSTICK, joy.id)) {
        MenuPlaySound(MENU_SOUND_START);
        break;
      }
    }
  }
}
/** the local players, in order (the original's IsLocal) */
function ownPlayers(): typeof gPlayerDatas {
  return gPlayerDatas.filter((p) => p.IsLocal && p.isOwn);
}
export function PlayerSelection(): GameLoopData {
  const ng = NameGenInit();
  const menus: PlayerSelectMenu[] = [];
  const own = ownPlayers();
  own.forEach((p, idx) => menus.push(PlayerSelectMenusCreate(own.length, idx, p.UID, ng)));
  let waitOk = false;
  let endCounter = 0;
  return GameLoopDataNew({
    OnExit: () => {
      if (waitOk) {
        if (!gCampaign.IsClient) gCampaign.MissionIndex = 0;
      } else {
        CampaignUnload(gCampaign);
      }
    },
    UpdateFunc: (l: LoopRunner) => {
      const ps = ownPlayers();
      if (ps.length === 0) {
        waitOk = true;
        l.pop();
        return UPDATE_RESULT_OK;
      }
      const cmds = GetPlayerCmds();
      if (EventIsEscape(cmds, GetMenuCmd(false))) {
        waitOk = false;
        l.pop();
        return UPDATE_RESULT_OK;
      }
      if (endCounter === 0) {
        const useMenuCmd = GetNumPlayers(PLAYER_ANY, true, true) <= 1;
        ps.forEach((p, idx) => {
          if (p.inputDevice === INPUT_DEVICE_UNSET) return;
          const ms = menus[idx].ms;
          if (ms.current!.customPostUpdateFunc) ms.current!.customPostUpdateFunc(ms.current!, ms.current!.customPostUpdateData);
          if (useMenuCmd) cmds[idx] |= GetMenuCmd(ms.current!.mouseHover);
          if (!MenuIsExit(ms) && cmds[idx]) MenuProcessCmd(ms, cmds[idx]);
        });
      }
      let hasAtLeastOneInput = false;
      let isDone = true;
      ps.forEach((p, idx) => {
        if (p.inputDevice !== INPUT_DEVICE_UNSET) {
          hasAtLeastOneInput = true;
          if (menus[idx].ms.current!.name !== 'Done') isDone = false;
        }
      });
      if (isDone && hasAtLeastOneInput) {
        let hasAIPlayers = false;
        ps.forEach((p, idx) => {
          if (p.inputDevice === INPUT_DEVICE_UNSET || p.inputDevice === INPUT_DEVICE_AI) {
            hasAIPlayers = true;
            PlayerTrySetInputDevice(p, INPUT_DEVICE_AI, 0);
            menus[idx].ms.current = MenuGetSubmenuByName(menus[idx].ms.root!, 'Done');
          }
        });
        if (hasAIPlayers && endCounter < 70) {
          endCounter++;
          return UPDATE_RESULT_DRAW;
        }
        waitOk = true;
        if (!gCampaign.IsClient && CanLevelSelect(gCampaign.Entry.Mode)) l.change(LevelSelection());
        else l.change(GameOptions(gCampaign.Entry.Mode));
        return UPDATE_RESULT_OK;
      }
      AssignPlayerInputDevices();
      return UPDATE_RESULT_DRAW;
    },
    DrawFunc: () => {
          const w = gGfx.w;
      const h = gGfx.h;
      const ps = ownPlayers();
      ps.forEach((p, idx) => {
        if (p.inputDevice !== INPUT_DEVICE_UNSET) {
          MenuDisplay(menus[idx].ms);
          return;
        }
        let center = { x: 0, y: 0 };
        switch (ps.length) {
          case 1: center = { x: Math.trunc(w / 2), y: Math.trunc(h / 2) }; break;
          case 2: center = { x: Math.trunc((idx * w) / 2) + Math.trunc(w / 4), y: Math.trunc(h / 2) }; break;
          case 3:
          case 4:
            center = { x: Math.trunc(((idx & 1) * w) / 2) + Math.trunc(w / 4), y: Math.trunc((Math.trunc(idx / 2) * h) / 2) + Math.trunc(h / 4) };
            break;
          default: break;
        }
        let promptW = FontStrW('Press  to join...') + (12 + 4) * 2;
        if (ev.joysticks.length > 0) promptW += 12 + 4;
        let pos = { x: center.x - Math.trunc(promptW / 2), y: center.y - 4 };
        pos = FontStr('Press ', pos);
        if (ev.joysticks.length > 0) {
          pos = DrawButton(INPUT_DEVICE_JOYSTICK, ev.joysticks[0].id, CMD_BUTTON1, pos);
          pos = FontStr('/', pos);
        }
        pos = DrawButton(INPUT_DEVICE_KEYBOARD, 0, CMD_BUTTON1, pos);
        pos = FontStr('/', pos);
        pos = DrawButton(INPUT_DEVICE_KEYBOARD, 1, CMD_BUTTON1, pos);
        FontStr(' to join...', pos);
      });
    },
  });
}
function IsGameOptionsNeeded(mode: number): boolean {
  if (gCampaign.IsClient) return false;
  switch (mode) {
    case GAME_MODE_NORMAL:
    case GAME_MODE_DOGFIGHT:
    case GAME_MODE_QUICK_PLAY:
      return !gCampaign.OptionsSet;
    case GAME_MODE_DEATHMATCH:
      return true;
    default:
      return false;
  }
}
export function CampaignAndMissionSetup(): void {
  const m = gCampaign.Setting.Missions[gCampaign.MissionIndex];
  if (!m) return;
  CampaignSeedRandom(gCampaign);
  SetupMission(m, gMission, gCampaign.MissionIndex);
}
export function GameOptions(gm: number): GameLoopData {
  const ms = MenuSystemInit({ x: 0, y: 0 }, { x: gGfx.w, y: gGfx.h });
  // the weapons the original's menu offers are those of gMission when the screen is created (before the mission is
  // set up in OnEnter), with one "allowed" flag each
  const weapons = [...gMission.Weapons];
  const allowed: boolean[] = weapons.map(() => true);
  ms.align = MENU_ALIGN_CENTER;
  ms.allowAborts = true;
  ms.root = MenuCreateNormal('', '', MENU_TYPE_OPTIONS, 0);
  const I = (name: string): void => MenuAddConfigOptionsItem(ms.root!, ConfigGet(name));
  const allowedMenu = (): Menu => {
    const m = MenuCreateNormal('Weapons...', 'Available Weapons:', MENU_TYPE_OPTIONS, 0);
    weapons.forEach((wc, i) => MenuAddSubmenu(m, MenuCreateOptionToggle(wc.name, () => allowed[i], (v) => { allowed[i] = v; })));
    MenuAddSubmenu(m, MenuCreateSeparator(''));
    MenuAddSubmenu(m, MenuCreateBack('Done'));
    return m;
  };
  // "StartServer" (host a LAN game) is left out: online games go through the website's rooms
  switch (gm) {
    case GAME_MODE_NORMAL:
      I('Game.Difficulty');
      I('Game.EnemyDensity');
      I('Game.NonPlayerHP');
      if (gCampaign.Setting.PlayerMaxHP === 0) I('Game.PlayerHP');
      if (gCampaign.Setting.Lives === 0) I('Game.Lives');
      I('Game.HealthPickups');
      I('Game.RandomSeed');
      break;
    case GAME_MODE_DOGFIGHT:
      I('Dogfight.PlayerHP');
      I('Dogfight.FirstTo');
      I('Game.HealthPickups');
      I('Game.RandomSeed');
      MenuAddSubmenu(ms.root, allowedMenu());
      break;
    case GAME_MODE_DEATHMATCH:
      if (gCampaign.Setting.PlayerMaxHP === 0) I('Game.PlayerHP');
      I('Deathmatch.Lives');
      I('Game.HealthPickups');
      I('Game.RandomSeed');
      MenuAddSubmenu(ms.root, allowedMenu());
      break;
    case GAME_MODE_QUICK_PLAY:
      for (const n of ['WallCount', 'WallLength', 'RoomCount', 'SquareCount', 'EnemyCount', 'EnemySpeed', 'EnemyHealth', 'EnemiesWithExplosives', 'ItemCount']) I(`QuickPlay.${n}`);
      break;
    default:
      break;
  }
  MenuAddSubmenu(ms.root, MenuCreateSeparator(''));
  MenuAddSubmenu(ms.root, MenuCreateReturn('Done', 0));
  MenuAddExitType(ms, MENU_TYPE_RETURN);
  return GameLoopDataNew({
    OnEnter: () => {
      if (!gCampaign.IsQuit) {
        MissionOptionsTerminate(gMission);
        CampaignAndMissionSetup();
      }
      ms.current = ms.root;
      ms.root!.index = ms.root!.subMenus.length - 1;
    },
    UpdateFunc: (l: LoopRunner) => {
      const result = MenuUpdate(ms);
      const isQuit = !gCampaign.IsLoaded || gCampaign.IsComplete || gCampaign.IsQuit || ms.hasAbort || gMission.missionData == null;
      const isDone = !IsGameOptionsNeeded(gCampaign.Entry.Mode) || result === UPDATE_RESULT_OK;
      if (isQuit || isDone) {
        if (isQuit) {
          MissionOptionsTerminate(gMission);
          CampaignUnload(gCampaign);
          l.pop();
          return UPDATE_RESULT_OK;
        }
        if (!configHooks.apply()) ConfigResetChanged();
        else configHooks.save();
        if (allowed.some((a) => a)) {
          for (let i = 0, j = 0; i < allowed.length; i++, j++) {
            if (!allowed[i]) {
              gMission.Weapons.splice(j, 1);
              j--;
            }
          }
        }
        gCampaign.OptionsSet = true;
        l.push(ScreenMissionBriefing());
        return UPDATE_RESULT_OK;
      }
      return UPDATE_RESULT_DRAW;
    },
    DrawFunc: () => MenuDraw(ms),
  });
}

const RETURN_CODE_CONTINUE = -1;
const RETURN_CODE_START = -2;
export function LevelSelection(): GameLoopData {
  const save = AutosaveGetCampaign(gCampaign.Entry.Path);
  const ms: MenuSystem = MenuSystemInit({ x: 0, y: 0 }, { x: gGfx.w, y: gGfx.h });
  ms.root = ms.current = MenuCreateNormal('', '', MENU_TYPE_NORMAL, 0);
  const nm = gCampaign.Setting.Missions.length;
  const canContinue = save != null && save.NextMission > 0 && save.NextMission < nm;
  const mc = MenuCreateReturn(canContinue ? `Continue (Mission ${save!.NextMission + 1})` : 'Continue', RETURN_CODE_CONTINUE);
  mc.isDisabled = !canContinue;
  MenuAddSubmenu(ms.root, mc);
  const levelSelect = MenuCreateNormal('Level select...', 'Select Level', MENU_TYPE_NORMAL, 0);
  levelSelect.maxItems = 20;
  const add = (i: number): void => {
    MenuAddSubmenu(levelSelect, MenuCreateReturn(`${i + 1}: ${gCampaign.Setting.Missions[i].Title}`, i));
  };
  if (save) {
    const levels = new Array(nm).fill(false);
    for (const mi of save.MissionsCompleted) {
      if (mi >= nm) continue;
      add(mi);
      levels[mi] = true;
    }
    if (save.NextMission < nm && !levels[save.NextMission]) add(save.NextMission);
  }
  levelSelect.isDisabled = save == null || save.MissionsCompleted.length === 0 || nm === 1;
  MenuAddSubmenu(ms.root, levelSelect);
  MenuAddSubmenu(ms.root, MenuCreateReturn('Start campaign', RETURN_CODE_START));
  const hData = HighScoresDataLoad(gCampaign);
  const hs = MenuCreateCustom('High Scores', () => HighScoresDraw(hData), null, hData);
  hs.isDisabled = hData.scores.length === 0;
  MenuAddSubmenu(ms.root, hs);
  MenuAddExitType(ms, MENU_TYPE_RETURN);
  return GameLoopDataNew({
    OnEnter: () => {
      MenuReset(ms);
      gCampaign.MissionIndex = 0;
    },
    UpdateFunc: (l: LoopRunner) => {
      const result = MenuUpdate(ms);
      if (result === UPDATE_RESULT_OK) {
        if (ms.hasAbort) {
          l.pop();
        } else {
          const rc = ms.current!.returnCode;
          if (rc === RETURN_CODE_CONTINUE) gCampaign.MissionIndex = save!.NextMission;
          else if (rc !== RETURN_CODE_START) gCampaign.MissionIndex = rc;
          if (save != null && gCampaign.MissionIndex > 0) {
            PlayerSavesApply(save.Players, gCampaign.Setting.Missions[gCampaign.MissionIndex].WeaponPersist);
          }
          l.change(GameOptions(gCampaign.Entry.Mode));
        }
      }
      return result;
    },
    DrawFunc: () => MenuDraw(ms),
  });
}
