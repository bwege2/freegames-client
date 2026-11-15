// C-Dogs SDL 2.5.0, translated: the main menu (mainmenu.c) with its live background, the campaign lists
// (campaigns.c LoadAllCampaigns) and the credits (credits.c). "Join LAN game" becomes "Join online game"
// (the website's rooms, online.ts). GPL-2.0-or-later / BSD-2-Clause (web/games/cdogs/LICENSE.md).
import { RAND_MAX, TILE_HEIGHT, TILE_WIDTH, colorDarker, colorGray, colorPurple, colorYellow, f32, rand, svec2, svec2_zero, type HSV } from '../core/base.ts';
import { ConfigResetChanged } from '../core/config.ts';
import { CampaignEntryTryLoad, CampaignSettingInit, CampaignSettingTerminateAll, gData, type DataFS } from '../core/data.ts';
import { GAME_EVENT_PLAYER_DATA, GameEventNew, GameEventsEnqueue, GameEventsInit, GameEventsTerminate, gGameEvents } from '../core/events.ts';
import { HandleGameEvents } from '../core/handle.ts';
import { GAME_MODE_DEATHMATCH, GAME_MODE_DOGFIGHT, GAME_MODE_NORMAL, GAME_MODE_QUICK_PLAY, gCampaign, gMission, gPlayerDatas, type CampaignEntry } from '../core/state.ts';
import { gMap, LOSSetAllVisible, MapMarkAllAsVisited } from '../core/map.ts';
import { MapBuild } from '../core/mapbuild.ts';
import { INPUT_DEVICE_AI } from '../core/types.ts';
import { PlayerDataDefault, localPlayers } from '../core/player.ts';
import { PlacePlayer } from '../core/actors.ts';
import { CreateEnemies, InitializeBadGuys } from '../core/ai.ts';
import { GameInit, GameUpdate, type RunGameData } from '../core/game.ts';
import { MissionOptionsTerminate } from '../core/missionrun.ts';
import { MUSIC_MENU, MusicPlayGeneral } from '../core/music.ts';
import { SetupQuickPlayCampaign } from '../core/quickplay.ts';
import { AutosaveGetCampaign, AutosaveGetLastCampaign, CampaignSaveIsValid } from '../core/autosave.ts';
import { FontH, FontStrMask, gGfx } from '../render/gfx.ts';
import { DrawBufferNew, type DrawBuffer } from '../render/draw.ts';
import { GrafxDrawBackground } from '../render/bg.ts';
import {
  MENU_DISPLAY_ITEMS_AUTHORS, MENU_DISPLAY_ITEMS_CREDITS, MENU_ALIGN_CENTER, MENU_SOUND_START, MENU_TYPE_NORMAL, MENU_TYPE_QUIT, MENU_TYPE_RETURN,
  MenuAddExitType, MenuAddSubmenu, MenuCreate, MenuCreateBack, MenuCreateNormal, MenuCreateSeparator, MenuDisableSubmenu, MenuDraw,
  MenuGetSubmenuByName, MenuSetPostEnterFunc, MenuSystemInit, MenuUpdate, type Menu, type MenuSystem,
} from './menu.ts';
import { GameLoopDataNew, UPDATE_RESULT_OK, type GameLoopData, type LoopRunner } from './loop.ts';
import { MenuCreateOptions } from './options.ts';
import { ScreenLoading } from './loading.ts';
import { ScreenCampaignIntro } from './briefing.ts';
import { CampaignAndMissionSetup } from './prep.ts';

// --- campaigns.c -----------------------------------------------------------------------------------------------------

export interface CampaignList { Name: string; subFolders: CampaignList[]; list: CampaignEntry[] }
export interface CustomCampaigns { campaignList: CampaignList; dogfightList: CampaignList; quickPlayEntry: CampaignEntry }

/** the entries of a directory, as tinydir_open_sorted gives them: directories first, then by byte order */
function readDirSorted(fs: DataFS, dir: string): { name: string; path: string; isDir: boolean }[] {
  const prefix = `${dir}/`;
  const seen = new Map<string, boolean>();
  for (const f of fs.list(dir)) {
    if (!f.startsWith(prefix)) continue;
    const rest = f.slice(prefix.length);
    const slash = rest.indexOf('/');
    const name = slash < 0 ? rest : rest.slice(0, slash);
    seen.set(name, (seen.get(name) ?? false) || slash >= 0);
  }
  const out = [...seen].map(([name, isDir]) => ({ name, path: prefix + name, isDir }));
  const bytes = (s: string): number[] => [...new TextEncoder().encode(s)];
  out.sort((a, b) => {
    if (a.isDir !== b.isDir) return a.isDir ? -1 : 1;
    const x = bytes(a.name);
    const y = bytes(b.name);
    for (let i = 0; i < Math.min(x.length, y.length); i++) if (x[i] !== y[i]) return x[i] - y[i];
    return x.length - y.length;
  });
  return out;
}
async function LoadCampaignsFromFolder(fs: DataFS, name: string, path: string, mode: number): Promise<CampaignList> {
  const list: CampaignList = { Name: name, subFolders: [], list: [] };
  for (const file of readDirSorted(fs, path)) {
    if (file.name.startsWith('~') || file.name.startsWith('.')) continue;
    const ext = file.name.slice(file.name.lastIndexOf('.') + 1);
    const isArchive = ext === 'cdogscpn' || ext === 'CDOGSCPN';
    if (file.isDir && !isArchive) {
      const sub = await LoadCampaignsFromFolder(fs, file.name, file.path, mode);
      if (sub.subFolders.length > 0 || sub.list.length > 0) list.subFolders.push(sub);
    }
    const entry = isArchive ? await CampaignEntryTryLoad(fs, file.path, mode) : null;
    if (entry) list.list.push(entry);
  }
  return list;
}
export async function LoadAllCampaigns(fs: DataFS): Promise<CustomCampaigns> {
  return {
    campaignList: await LoadCampaignsFromFolder(fs, '', 'missions', GAME_MODE_NORMAL),
    dogfightList: await LoadCampaignsFromFolder(fs, '', 'dogfights', GAME_MODE_DOGFIGHT),
    quickPlayEntry: { Filename: '', Path: '', Info: '', Mode: GAME_MODE_QUICK_PLAY, BuiltinIndex: 0, NumMissions: 0, IsBuiltin: false },
  };
}

// --- credits.c -------------------------------------------------------------------------------------------------------

const CREDIT_DISPLAY_PERIOD_SECONDS = 10.0;
function LoadCredits(): { draw: () => void } {
  const credits: { name: string; message: string }[] = [];
  const text = gData.text.get('doc/CREDITS');
  let counter = 0;
  let nameBuf = '';
  for (let line of (text ?? '').split('\n')) {
    line = line.replace(/\r$/, '');
    if (line.length === 0) {
      counter = 0;
      continue;
    }
    if (counter === 0) {
      nameBuf = line;
      counter = 1;
    } else {
      credits.push({ name: nameBuf, message: line.slice(1) });
      counter = 0;
    }
  }
  let index = 0;
  let lastUpdate = Math.trunc(Date.now() / 1000);
  return {
    draw: () => {
      if (credits.length === 0) return;
      const now = Math.trunc(Date.now() / 1000);
      const c = credits[index];
      let y = gGfx.h - 50;
      FontStrMask('Credits:', { x: 16, y }, colorDarker);
      y += FontH() + 2;
      FontStrMask(c.name, { x: 20, y }, colorPurple);
      y += FontH();
      FontStrMask(c.message, { x: 20, y }, colorDarker);
      if (now - lastUpdate > CREDIT_DISPLAY_PERIOD_SECONDS) {
        index++;
        if (index >= credits.length) index = 0;
        lastUpdate = now;
      }
    },
  };
}

// --- mainmenu.c ------------------------------------------------------------------------------------------------------

/** online.ts: the online game (the original's "Join LAN game" and "StartServer") */
export const mainMenuHooks = {
  /** set by online.ts: the screen of an online game, from the campaign the host picked */
  online: null as null | ((pick: { mode: number; entry: CampaignEntry }) => GameLoopData),
  /** every return to the main menu (an online round is over: leave the room) */
  onMainMenu: null as null | (() => void),
};
/** the online campaign the online menu picked, until the menu returns */
let onlinePick: { mode: number; entry: CampaignEntry } | null = null;

interface MainMenuData {
  ms: MenuSystem;
  campaigns: CustomCampaigns;
  lastGameMode: number;
  wasClient: boolean;
  buffer: DrawBuffer;
  bgTint: HSV;
  rData: RunGameData | null;
  gameMode: number;
  entry: CampaignEntry | null;
}
function GenerateLiveBackground(data: MainMenuData): void {
  MissionOptionsTerminate(gMission);
  // CampaignTerminate + CampaignSettingInit
  CampaignSettingTerminateAll(gCampaign);
  CampaignSettingInit(gCampaign);
  SetupQuickPlayCampaign(gCampaign.Setting, true);
  CampaignAndMissionSetup();
  GameEventsInit(gGameEvents);
  gCampaign.MissionIndex = 0;
  MapBuild(gMap, gMission.missionData!, true, gMission.index, GAME_MODE_NORMAL, gCampaign.Setting.characters);
  const e = GameEventNew(GAME_EVENT_PLAYER_DATA);
  e.u = PlayerDataDefault(0);
  e.u.UID = localPlayers.firstUID;
  GameEventsEnqueue(gGameEvents, e);
  HandleGameEvents(gGameEvents, null, null, null);
  for (const p of gPlayerDatas) {
    p.inputDevice = INPUT_DEVICE_AI;
    PlacePlayer(gMap, p, svec2_zero(), true);
  }
  const h = (rand() * 360.0) / RAND_MAX;
  const s = (rand() * 1.0) / RAND_MAX;
  data.bgTint = { h, s, v: 0.5 };
  data.buffer = DrawBufferNew();
  InitializeBadGuys();
  CreateEnemies();
  MapMarkAllAsVisited(gMap);
  data.rData = GameInit(gCampaign, gMission, gMap);
}
function MenuResetSize(ms: MenuSystem): void {
  ms.pos = { x: 0, y: 0 };
  ms.size = { x: gGfx.w, y: gGfx.h };
}
function CreateStartGameMode(name: string, data: MainMenuData, mode: number, entry: CampaignEntry): Menu {
  const menu = MenuCreate(name, MENU_TYPE_RETURN);
  menu.enterSound = MENU_SOUND_START;
  MenuSetPostEnterFunc(menu, () => {
    data.gameMode = mode;
    data.entry = entry;
  }, null);
  return menu;
}
function MenuCreateCampaigns(name: string, title: string, data: MainMenuData, list: CampaignList, mode: number): Menu {
  const menu = MenuCreateNormal(name, title, MENU_TYPE_NORMAL, 0);
  menu.maxItems = 20;
  menu.align = MENU_ALIGN_CENTER;
  for (const sub of list.subFolders) MenuAddSubmenu(menu, MenuCreateCampaigns(`${sub.Name}/`, title, data, sub, mode));
  for (const e of list.list) {
    const item = CreateStartGameMode(e.Info, data, mode, e);
    const m = AutosaveGetCampaign(e.Path);
    if (m != null) {
      if (m.MissionsCompleted.length === e.NumMissions) item.color = colorGray;
      else if (m.MissionsCompleted.length > 0) item.color = colorYellow;
    }
    MenuAddSubmenu(menu, item);
  }
  // CampaignsDisplayFilename shows nothing in 2.5.0: the items are MENU_TYPE_RETURN, not MENU_TYPE_BASIC
  return menu;
}
/** the original's "Join LAN game": the website's rooms, and the campaign the host will play */
function CreateOnlineGameMode(name: string, mode: number, entry: CampaignEntry): Menu {
  const menu = MenuCreate(name, MENU_TYPE_RETURN);
  menu.enterSound = MENU_SOUND_START;
  MenuSetPostEnterFunc(menu, () => { onlinePick = { mode, entry }; }, null);
  return menu;
}
function MenuCreateOnlineCampaigns(name: string, title: string, list: CampaignList, mode: number): Menu {
  const menu = MenuCreateNormal(name, title, MENU_TYPE_NORMAL, 0);
  menu.maxItems = 20;
  menu.align = MENU_ALIGN_CENTER;
  for (const sub of list.subFolders) MenuAddSubmenu(menu, MenuCreateOnlineCampaigns(`${sub.Name}/`, title, sub, mode));
  for (const e of list.list) MenuAddSubmenu(menu, CreateOnlineGameMode(e.Info, mode, e));
  return menu;
}
function MenuCreateOnline(data: MainMenuData): Menu {
  const menu = MenuCreateNormal('Online', 'Online game:', MENU_TYPE_NORMAL, 0);
  MenuAddSubmenu(menu, MenuCreateOnlineCampaigns('Campaign', 'Select a campaign:', data.campaigns.campaignList, GAME_MODE_NORMAL));
  MenuAddSubmenu(menu, MenuCreateOnlineCampaigns('Dogfight', 'Select a dogfight scenario:', data.campaigns.dogfightList, GAME_MODE_DOGFIGHT));
  MenuAddSubmenu(menu, MenuCreateOnlineCampaigns('Deathmatch', 'Select a deathmatch scenario:', data.campaigns.dogfightList, GAME_MODE_DEATHMATCH));
  MenuAddSubmenu(menu, MenuCreateSeparator(''));
  MenuAddSubmenu(menu, MenuCreateBack('Back'));
  return menu;
}
function MenuCreateStart(name: string, data: MainMenuData): Menu {
  const menu = MenuCreateNormal(name, 'Start:', MENU_TYPE_NORMAL, 0);
  const cs = AutosaveGetLastCampaign();
  if (cs != null) {
    const entry = data.campaigns.campaignList.list.find((e) => e.Path === cs.Campaign.Path) ?? findEntry(data.campaigns.campaignList, cs.Campaign.Path);
    MenuAddSubmenu(menu, CreateStartGameMode('Continue', data, GAME_MODE_NORMAL, entry ?? cs.Campaign));
    const idx = menu.subMenus.length - 1;
    if (CampaignSaveIsValid(cs) && entry != null) {
      // IsCampaignOK gives the campaign's title without the number of missions
      const title = entry.Info.replace(/ \(\d+\)$/, '');
      MenuAddSubmenu(menu, MenuCreateSeparator(`> ${title}`));
    } else {
      MenuDisableSubmenu(menu, idx);
    }
  }
  MenuAddSubmenu(menu, MenuCreateCampaigns('Campaign', 'Select a campaign:', data, data.campaigns.campaignList, GAME_MODE_NORMAL));
  MenuAddSubmenu(menu, MenuCreateCampaigns('Dogfight', 'Select a dogfight scenario:', data, data.campaigns.dogfightList, GAME_MODE_DOGFIGHT));
  MenuAddSubmenu(menu, MenuCreateCampaigns('Deathmatch', 'Select a deathmatch scenario:', data, data.campaigns.dogfightList, GAME_MODE_DEATHMATCH));
  if (mainMenuHooks.online) MenuAddSubmenu(menu, MenuCreateOnline(data));
  MenuAddSubmenu(menu, MenuCreateSeparator(''));
  MenuAddSubmenu(menu, MenuCreateBack('Back'));
  return menu;
}
function findEntry(list: CampaignList, path: string): CampaignEntry | null {
  for (const e of list.list) if (e.Path === path) return e;
  for (const s of list.subFolders) {
    const e = findEntry(s, path);
    if (e) return e;
  }
  return null;
}
/** the main menu; its "Quit" empties the loop stack, which leaves the game (index.ts) */
export function MainMenu(campaigns: CustomCampaigns): GameLoopData {
  const data: MainMenuData = {
    ms: MenuSystemInit({ x: 0, y: 0 }, { x: gGfx.w, y: gGfx.h }), campaigns, lastGameMode: GAME_MODE_QUICK_PLAY, wasClient: false,
    buffer: DrawBufferNew(), bgTint: { h: 0, s: 0, v: 0 }, rData: null, gameMode: GAME_MODE_NORMAL, entry: null,
  };
  const credits = LoadCredits();
  {
    data.ms.root = data.ms.current = MenuCreateNormal('', '', MENU_TYPE_NORMAL, MENU_DISPLAY_ITEMS_CREDITS | MENU_DISPLAY_ITEMS_AUTHORS);
    MenuAddSubmenu(data.ms.root, MenuCreateStart('Start', data));
    MenuAddSubmenu(data.ms.root, MenuCreateOptions('Options...', {
      gfxChangeCallback: (resetBg) => {
        if (resetBg) GenerateLiveBackground(data);
        MenuResetSize(data.ms);
      },
    }));
    MenuAddSubmenu(data.ms.root, MenuCreate('Quit', MENU_TYPE_QUIT));
    MenuAddExitType(data.ms, MENU_TYPE_QUIT);
    MenuAddExitType(data.ms, MENU_TYPE_RETURN);
    data.ms.creditsDisplayer = credits;
  }
  return GameLoopDataNew({
    label: 'menu',
    OnEnter: () => {
      mainMenuHooks.onMainMenu?.();
      if (gCampaign.IsLoaded) return;
      MusicPlayGeneral(MUSIC_MENU);
      ConfigResetChanged();
      CampaignSettingTerminateAll(gCampaign);
      GenerateLiveBackground(data);
      MenuResetSize(data.ms);
      data.entry = null;
      GameEventsTerminate(gGameEvents);
      const startMenu = MenuGetSubmenuByName(data.ms.root!, 'Start')!;
      if (data.wasClient) {
        data.ms.current = startMenu;
      } else {
        switch (data.lastGameMode) {
          case GAME_MODE_NORMAL: data.ms.current = MenuGetSubmenuByName(startMenu, 'Campaign'); break;
          case GAME_MODE_DOGFIGHT: data.ms.current = MenuGetSubmenuByName(startMenu, 'Dogfight'); break;
          case GAME_MODE_DEATHMATCH: data.ms.current = MenuGetSubmenuByName(startMenu, 'Deathmatch'); break;
          default: data.ms.current = data.ms.root; break;
        }
      }
    },
    OnExit: () => {
      gPlayerDatas.length = 0;
      GameEventsInit(gGameEvents);
      data.lastGameMode = gCampaign.Entry.Mode;
      data.wasClient = gCampaign.IsClient;
    },
    UpdateFunc: (l: LoopRunner) => {
      if (gCampaign.IsLoaded) {
        l.push(ScreenCampaignIntro(gCampaign.Entry.Mode, gCampaign.Entry));
        return UPDATE_RESULT_OK;
      }
      LOSSetAllVisible(data.rData!.map);
      // GameUpdate(&rData, 1, NULL): no sound device
      GameUpdate(data.rData!, 1, 0);
      const result = MenuUpdate(data.ms);
      if (result === UPDATE_RESULT_OK) {
        const pick = onlinePick;
        onlinePick = null;
        if (pick && mainMenuHooks.online) {
          l.push(mainMenuHooks.online(pick));
        } else if (data.entry) {
          l.push(ScreenLoading('Loading game...', true, ScreenCampaignIntro(data.gameMode, data.entry), false));
        } else {
          l.push(ScreenLoading('Quitting...', true, null, true));
        }
      }
      return result;
    },
    DrawFunc: () => {
      if (gCampaign.IsLoaded) return;
      MenuDraw(data.ms);
      const pos = svec2(f32(f32((gMap.Size.x + 1) * TILE_WIDTH) * 0.5), f32(f32((gMap.Size.y + 1) * TILE_HEIGHT) * 0.5));
      GrafxDrawBackground(data.buffer, data.bgTint, pos);
    },
  });
}
