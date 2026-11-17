// AstroMenace 1.4.3 (Mikhail Kurinnoi, Viewizard; GPL-3.0-or-later), port of src/menu/menu.cpp (the
// menu frame, its fades and the main menu), menu_top_scores.cpp, menu_credits.cpp, src/command.cpp and
// src/loop_proc.cpp (one frame of the program). Changed for the browser by the freegames project, 2026.
import { rect, vw_Draw2D, vw_DrawText, vw_SetFontSize, vw_TextWidth, RGB } from '../engine/draw2d.ts';
import { vw_GetKeyStatus, vw_GetText, vw_GetTimeThread, vw_ResetWheelStatus, vw_SetKeyReleased } from '../engine/core.ts';
import { Vec3, clamp } from '../core/math.ts';
import { releaseAllLights, releaseAllParticleSystems, updateAllParticleSystems } from '../core/particles.ts';
import { cameraLookAt, resizeScene, setCameraLocation, setCameraMoveAroundPoint } from '../core/camera.ts';
import { ChangeGameConfig, Cur, GameConfig, MAX_PROFILES, SDLK } from '../game/config.ts';
import { MenuSFX, MusicTheme, VoicePhrase, audio } from '../game/globals.ts';
import { MissionScript } from '../game/script.ts';
import { ResetCamera } from '../game/camera.ts';
import {
  DrawType, DrawAllObject3D, ReleaseAllObject3D, StarSystemDraw, StarSystemInitByType, StarSystemRelease, UpdateAllObject3D,
} from '../game/starsystem.ts';
import { Command, GameSpeedUpdate, WeaponPanelViewNext } from '../game/gameui.ts';
import { CursorDraw, CursorUpdate, DrawButton384, SetShowGameCursor, UI } from '../ui/button.ts';
import { DialogBox, DrawDialogBox, SetCurrentDialogBox, dialogHooks, isDialogBoxDrawing } from './dialog.ts';
import {
  CenterMissionList, DifficultyMenu, M, MissionListInit, MissionMenu, P, ProfileMenu,
} from './menus.ts';
import { R } from '../render/gl.ts';

export const MenuStatus = {
  MAIN_MENU: 0, TOP_SCORES: 1, INTERFACE: 2, OPTIONS: 3, OPTIONS_ADVANCED: 4, INFORMATION: 5, CREDITS: 6,
  CONFCONTROL: 7, PROFILE: 8, DIFFICULTY: 9, MISSION: 10, WORKSHOP: 11, GAME: 12,
};

export const MN = {
  MenuStatus: MenuStatus.MAIN_MENU,
  NextMenu: MenuStatus.MAIN_MENU,
  PrevMenu: MenuStatus.MAIN_MENU,
  LastMenuUpdateTime: 0,
  LastMenuOnOffUpdateTime: 0,
  MenuBlackTransp: 0,
  NeedOnMenu: false,
  NeedOffMenu: false,
  NeedShowMenu: false,
  NeedHideMenu: false,
  MenuScript: null as MissionScript | null,
  command: Command.DO_NOTHING,
};

/** the other screens, filled in by their modules (game.ts, workshop.ts, options.ts) */
export const screens = {
  InitGame: (): void => {},
  DrawGame: (): void => {},
  GameContentTransp: (): number => 0,
  WorkshopMenu: (): void => {},
  WorkshopDestroyData: (): void => {},
  WorkshopShowHint: (): void => {},
  OptionsMenu: (_status: number): void => {},
  SetOptionsMenu: (_status: number): void => {},
  InformationMenu: (): void => {},
  InformationInit: (): void => {},
  InformationDrawObject: (): void => {},
  saveConfig: (): void => {},
  stopSounds: (): void => {},
};

const W = (): number => GameConfig().InternalWidth;
const GAME_VERSION = '1.4.3';

export function setCommand(c: number): void {
  MN.command = c;
}
M.command = setCommand;

function resetButtons(time: number): void {
  for (const b of M.buttons) {
    b.t = 1;
    b.u = time;
  }
}

export function InitMenu(status: number): void {
  MN.MenuStatus = status;
  resetButtons(0);
  MN.LastMenuUpdateTime = 0;
  M.MenuContentTransp = 0;
  resizeScene(45, GameConfig().InternalWidth / GameConfig().InternalHeight, 1, 2000);
  setCameraLocation(new Vec3(-50, 30, -50));
  setCameraMoveAroundPoint(new Vec3(), 0, new Vec3());
  ResetCamera();
  StarSystemInitByType(DrawType.MENU);
  const s = new MissionScript();
  MN.MenuScript = s;
  if (GameConfig().MenuScript > 2) ChangeGameConfig().MenuScript = 0;
  s.RunScript(`script/menu${GameConfig().MenuScript + 1}.xml`, vw_GetTimeThread(0));
  ChangeGameConfig().MenuScript++;
  const Time1 = vw_GetTimeThread(0);
  s.StartTime = Time1 - 30;
  s.TimeLastOp = Time1 - 30;
  for (let i = Math.fround(Time1 - 30); i < Time1; i = Math.fround(i + 1)) {
    UpdateAllObject3D(i);
    s.Update(i);
  }
  s.StartTime = Time1;
  s.TimeLastOp = Time1;
  MN.LastMenuUpdateTime = vw_GetTimeThread(0);
  MN.NeedShowMenu = true;
  MN.NeedHideMenu = false;
  MN.LastMenuOnOffUpdateTime = vw_GetTimeThread(0);
  MN.MenuBlackTransp = 1;
  MN.NeedOnMenu = true;
  MN.NeedOffMenu = false;
  SetShowGameCursor(true);
}

export function SetMenu(menu: number): void {
  audio.playMenuSFX(MenuSFX.SwitchToAnotherMenu, 1);
  switch (menu) {
    case MenuStatus.PROFILE:
      P.NewProfileName = '';
      break;
    case MenuStatus.OPTIONS:
    case MenuStatus.OPTIONS_ADVANCED:
    case MenuStatus.CONFCONTROL:
      screens.SetOptionsMenu(menu);
      break;
    case MenuStatus.TOP_SCORES:
      InitTopScoresMenu();
      break;
    case MenuStatus.MISSION:
      MissionListInit();
      vw_ResetWheelStatus();
      CenterMissionList();
      break;
    case MenuStatus.INFORMATION:
      vw_ResetWheelStatus();
      screens.InformationInit();
      break;
    case MenuStatus.CREDITS:
      InitCreditsMenu(vw_GetTimeThread(0));
      break;
  }
  MN.NextMenu = menu;
  MN.NeedShowMenu = false;
  MN.NeedHideMenu = true;
  MN.LastMenuUpdateTime = vw_GetTimeThread(0);
}

function SetMenu2(menu: number): void {
  if (MN.MenuStatus === MenuStatus.WORKSHOP) screens.WorkshopDestroyData();
  MN.PrevMenu = MN.MenuStatus;
  MN.MenuStatus = menu;
  resetButtons(vw_GetTimeThread(0));
}

export function DrawMenu(): void {
  const r = R.gl;
  if (MN.NeedShowMenu) {
    M.MenuContentTransp = 2.4 * (vw_GetTimeThread(0) - MN.LastMenuUpdateTime);
    if (M.MenuContentTransp >= 1) {
      M.MenuContentTransp = 1;
      MN.NeedShowMenu = false;
      MN.LastMenuUpdateTime = vw_GetTimeThread(0);
      if (MN.MenuStatus === MenuStatus.PROFILE && GameConfig().NeedShowHint[0]) SetCurrentDialogBox(DialogBox.ProfileTipsAndTricks);
      if (MN.MenuStatus === MenuStatus.WORKSHOP) screens.WorkshopShowHint();
    }
  }
  if (MN.NeedHideMenu) {
    M.MenuContentTransp = 1 - 2.4 * (vw_GetTimeThread(0) - MN.LastMenuUpdateTime);
    if (M.MenuContentTransp <= 0) {
      M.MenuContentTransp = 0;
      SetMenu2(MN.NextMenu);
      MN.LastMenuUpdateTime = vw_GetTimeThread(0);
      MN.NeedShowMenu = true;
      MN.NeedHideMenu = false;
    }
  }
  setCameraMoveAroundPoint(new Vec3(), 0, new Vec3());
  cameraLookAt();
  r?.cameraLookAt();
  StarSystemDraw(DrawType.MENU);
  const s = MN.MenuStatus;
  if (s !== MenuStatus.WORKSHOP && s !== MenuStatus.INTERFACE && s !== MenuStatus.OPTIONS && s !== MenuStatus.CONFCONTROL
    && s !== MenuStatus.OPTIONS_ADVANCED) {
    const StartX = Math.trunc((W() - 863) / 2);
    vw_Draw2D(rect(StartX, 10, StartX + 863, 10 + 128), rect(0, 0, 863, 128), 'menu/astromenace.tga', true, M.MenuContentTransp);
  }
  end2D();
  DrawAllObject3D(DrawType.MENU);
  UpdateAllObject3D(vw_GetTimeThread(0));
  updateAllParticleSystems(vw_GetTimeThread(0));
  if (MN.MenuScript && !MN.MenuScript.Update(vw_GetTimeThread(0))) MN.MenuScript = null;
  switch (MN.MenuStatus) {
    case MenuStatus.MAIN_MENU: MainMenu(); break;
    case MenuStatus.TOP_SCORES: TopScoresMenu(); break;
    case MenuStatus.INTERFACE:
    case MenuStatus.OPTIONS:
    case MenuStatus.OPTIONS_ADVANCED:
    case MenuStatus.CONFCONTROL:
      screens.OptionsMenu(MN.MenuStatus);
      break;
    case MenuStatus.INFORMATION: screens.InformationMenu(); break;
    case MenuStatus.CREDITS: CreditsMenu(); break;
    case MenuStatus.PROFILE: ProfileMenu(); break;
    case MenuStatus.DIFFICULTY: DifficultyMenu(); break;
    case MenuStatus.MISSION: MissionMenu(); break;
    case MenuStatus.WORKSHOP: screens.WorkshopMenu(); break;
  }
  vw_SetFontSize(10);
  const VSize = vw_TextWidth(vw_GetText('Version'));
  vw_DrawText(6, GameConfig().InternalHeight - 16, 0, 0, 1, RGB.white, 0.99, vw_GetText('Version'));
  vw_DrawText(16 + VSize, GameConfig().InternalHeight - 16, 0, 0, 1, RGB.white, 0.99, GAME_VERSION);
  const cr = 'Copyright © 2007-2025, Viewizard';
  vw_DrawText(W() - 6 - vw_TextWidth(cr), GameConfig().InternalHeight - 16, 0, 0, 1, RGB.white, 0.99, cr);
  vw_SetFontSize(16);
  end2D();
  if (MN.MenuStatus === MenuStatus.INFORMATION) screens.InformationDrawObject();
  if (MN.NeedOnMenu) {
    MN.MenuBlackTransp = 1 - 2.4 * (vw_GetTimeThread(0) - MN.LastMenuOnOffUpdateTime);
    if (MN.MenuBlackTransp <= 0) {
      MN.MenuBlackTransp = 0;
      MN.NeedOnMenu = false;
      MN.LastMenuOnOffUpdateTime = vw_GetTimeThread(0);
    }
    vw_Draw2D(rect(0, 0, W(), 768), rect(0, 0, 2, 2), 'menu/blackpoint.tga', true, MN.MenuBlackTransp);
    end2D();
  }
  if (MN.NeedOffMenu) {
    MN.MenuBlackTransp = 2.4 * (vw_GetTimeThread(0) - MN.LastMenuOnOffUpdateTime);
    if (MN.MenuBlackTransp >= 1) {
      MN.MenuBlackTransp = 1;
      MN.NeedOffMenu = false;
      MN.LastMenuOnOffUpdateTime = vw_GetTimeThread(0);
      screens.WorkshopDestroyData();
      setCommand(Command.SWITCH_FROM_MENU_TO_GAME);
    }
    vw_Draw2D(rect(0, 0, W(), 768), rect(0, 0, 2, 2), 'menu/blackpoint.tga', true, MN.MenuBlackTransp);
    end2D();
  }
}

/** ShortkeyTipsAndTricks' START and the workshop's START: fade out of the menu into the game */
export function StartMissionFromMenu(): void {
  MN.LastMenuOnOffUpdateTime = vw_GetTimeThread(0);
  MN.NeedOffMenu = true;
}
dialogHooks.startMission = (): void => {
  dialogHooks.resetDrag();
  StartMissionFromMenu();
};

function MainMenu(): void {
  const T = M.MenuContentTransp;
  const X = Math.trunc((W() - 384) / 2);
  let Y = 165;
  if (DrawButton384(X, Y, vw_GetText('START GAME'), T, M.buttons[1])) setCommand(Cur.CurrentProfile < 0 ? Command.SWITCH_TO_PROFILE : Command.SWITCH_TO_MISSION);
  Y += 100;
  if (DrawButton384(X, Y, vw_GetText('TOP SCORES'), T, M.buttons[2])) setCommand(Command.SWITCH_TO_TOP_SCORES);
  Y += 100;
  if (DrawButton384(X, Y, vw_GetText('OPTIONS'), T, M.buttons[3])) setCommand(Command.SWITCH_TO_OPTIONS);
  Y += 100;
  if (DrawButton384(X, Y, vw_GetText('INFORMATION'), T, M.buttons[4])) setCommand(Command.SWITCH_TO_INFORMATION);
  Y += 100;
  if (DrawButton384(X, Y, vw_GetText('CREDITS'), T, M.buttons[5])) {
    setCommand(Command.SWITCH_TO_CREDITS);
    audio.playMusicTheme(MusicTheme.CREDITS, 2000, 2000);
  }
  Y += 100;
  if (DrawButton384(X, Y, vw_GetText('QUIT'), T, M.buttons[6])) SetCurrentDialogBox(DialogBox.QuitFromGame);
}

// ---- top scores

let TopScoresList: [string, number][] = [];
const DefaultTopScores: [string, number][] = [
  ['Viewizard', 100000], ['Alex', 90000], ['Michael', 80000], ['Jeffrey', 70000], ['Christopher', 60000],
  ['Becky', 40000], ['Greg', 20000], ['Jay', 10000], ['Kelvin', 5000], ['Stephan', 1000],
];

export function InitTopScoresMenu(): string[] {
  TopScoresList = [...DefaultTopScores];
  for (let i = 0; i < MAX_PROFILES; i++) {
    const p = GameConfig().Profile[i];
    if (p.Used && p.Experience > 0) TopScoresList.push([p.Name, p.Experience]);
  }
  TopScoresList.sort((a, b) => b[1] - a[1]);
  TopScoresList.length = DefaultTopScores.length;
  return TopScoresList.map((t) => `${t[0]} ${t[1]}`);
}

function TopScoresMenu(): void {
  const T = M.MenuContentTransp;
  vw_Draw2D(rect(0, 0, W(), 768), rect(0, 0, 2, 2), 'menu/blackpoint.tga', true, 0.5 * T);
  const X1 = Math.trunc(W() / 2) - 362;
  let Y1 = 165;
  vw_DrawText(X1, Y1, 0, 0, 1, RGB.yellow, T, vw_GetText('NAME'));
  vw_DrawText(X1 + 650, Y1, 0, 0, 1, RGB.yellow, T, vw_GetText('SCORE'));
  Y1 += 10;
  for (const [name, score] of TopScoresList) {
    Y1 += 42;
    vw_DrawText(X1, Y1, 0, 530, 1, RGB.white, T, name);
    vw_DrawText(X1 + 650, Y1, 0, 0, 1, RGB.white, T, String(score));
  }
  if (DrawButton384(Math.trunc((W() - 384) / 2), 165 + 100 * 5, vw_GetText('MAIN MENU'), T, M.buttons[10])) setCommand(Command.SWITCH_TO_MAIN_MENU);
}

// ---- credits

const CreditsArray = [
  'PROJECT LEADER, PROGRAMMING', 'Mikhail Kurinnoi', '', '2D ARTWORK', 'Tatiana Savitskaya', '', '3D MODELS',
  'Max Shelekhov, 3drt.com', 'Oleg Linkov', 'Egor Kurteanu', '', 'PLANETARY TEXTURES', 'Alex (Esgaroth) Reuter', 'Robert Stein', '',
  'MUSIC', 'Alexander Matchugovsky', '', 'SOUND EFFECTS', 'Mikhail Sirotkin', 'Alexander Matchugovsky', 'Alexander Vassilyevsky', '',
  'VOICE', 'Petra Schulten (de)', 'Elena Zavalishina (en, ru)', '', 'TRANSLATORS', 'Bernd Dau (de)', 'Jürgen Buchmüller (de)',
  'Michael Lauenburger (de)', 'Mikhail Kurinnoi (ru)', 'Jacek Fiedorowicz (pl)', 'Juan Francisco Astudillo Palacios (es)', 'p1p2r (tr)', '',
  'COMMUNITY CONTRIBUTORS', 'Alistair Findlay', 'Dmitry Marakasov', 'Gwyn Ciesla', 'Stefan Strogin', 'sevu', '',
  'TESTERS', 'Dmitriy Schigolev', 'Ivan Bobrov', 'Vadim Sosenko', 'Dmitriy Tatarinov', 'Alexey Mosesov', 'Bernd Dau', 'Ryan Foster',
  'Jason Crowell', '', 'SPECIAL THANKS TO', 'Pavel Voylov', 'Richard Benson', 'Alexey Madalinskiy', 'Olga Zhuravleva',
  'Nick O`Connell', 'Mikhail Storcheous', 'Boris Pek', '', '', '', ' ', 'Copyright © 2007-2025, Viewizard', 'https://viewizard.com',
];
const CR = { CurrentTextPos: 0, LastUpdate: 0 };

export function InitCreditsMenu(Time: number): void {
  CR.CurrentTextPos = 0;
  CR.LastUpdate = Time;
}

function CreditsMenu(): void {
  const T = M.MenuContentTransp;
  CR.CurrentTextPos -= 40 * (vw_GetTimeThread(0) - CR.LastUpdate);
  CR.LastUpdate = vw_GetTimeThread(0);
  let TextY = 690 + Math.trunc(CR.CurrentTextPos);
  if (CR.CurrentTextPos <= -(550 + CreditsArray.length * 30)) CR.CurrentTextPos = 0;
  let color = RGB.yellow;
  for (const line of CreditsArray) {
    const tr = clamp(TextY > 300 ? (650 - TextY) / 100 : (TextY - 100) / 100, 0, 1);
    if (line) {
      const t = vw_GetText(line);
      vw_DrawText(Math.trunc((W() - vw_TextWidth(t)) / 2), TextY, 0, 0, 1, color, tr * T, t);
    }
    TextY += 30;
    color = line ? RGB.white : RGB.yellow;
  }
  if (DrawButton384(Math.trunc((W() - 384) / 2), 165 + 100 * 5, vw_GetText('MAIN MENU'), T, M.buttons[10])) {
    setCommand(Command.SWITCH_TO_MAIN_MENU);
    audio.playMusicTheme(MusicTheme.MENU, 2000, 2000);
  }
}

// ---- command.cpp

function PrepareToSwitchStatus(): void {
  screens.saveConfig();
  ReleaseAllObject3D();
  releaseAllParticleSystems();
  releaseAllLights();
  StarSystemRelease();
  screens.stopSounds();
}

export function ProceedCommand(): void {
  const c = MN.command;
  if (c === Command.DO_NOTHING) return;
  MN.command = Command.DO_NOTHING;
  const menu: Record<number, number> = {
    [Command.SWITCH_TO_MAIN_MENU]: MenuStatus.MAIN_MENU, [Command.SWITCH_TO_TOP_SCORES]: MenuStatus.TOP_SCORES,
    [Command.SWITCH_TO_INTERFACE]: MenuStatus.INTERFACE, [Command.SWITCH_TO_OPTIONS]: MenuStatus.OPTIONS,
    [Command.SWITCH_TO_OPTIONS_ADVANCED]: MenuStatus.OPTIONS_ADVANCED, [Command.SWITCH_TO_INFORMATION]: MenuStatus.INFORMATION,
    [Command.SWITCH_TO_CREDITS]: MenuStatus.CREDITS, [Command.SWITCH_TO_CONFCONTROL]: MenuStatus.CONFCONTROL,
    [Command.SWITCH_TO_PROFILE]: MenuStatus.PROFILE, [Command.SWITCH_TO_DIFFICULTY]: MenuStatus.DIFFICULTY,
    [Command.SWITCH_TO_MISSION]: MenuStatus.MISSION, [Command.SWITCH_TO_WORKSHOP]: MenuStatus.WORKSHOP,
  };
  if (menu[c] !== undefined) {
    SetMenu(menu[c]);
    return;
  }
  switch (c) {
    case Command.SWITCH_FROM_MENU_TO_GAME:
      PrepareToSwitchStatus();
      screens.InitGame();
      audio.playMusicTheme(MusicTheme.GAME, 2000, 2000);
      audio.playVoicePhrase(VoicePhrase.PrepareForAction, 1);
      break;
    case Command.SWITCH_FROM_GAME_TO_MISSION_MENU:
      PrepareToSwitchStatus();
      InitMenu(MenuStatus.MISSION);
      audio.playMusicTheme(MusicTheme.MENU, 2000, 2000);
      vw_ResetWheelStatus();
      CenterMissionList();
      break;
    case Command.SWITCH_FROM_GAME_TO_MAIN_MENU:
      PrepareToSwitchStatus();
      InitMenu(MenuStatus.MAIN_MENU);
      audio.playMusicTheme(MusicTheme.MENU, 2000, 2000);
      break;
    case Command.SWITCH_FROM_GAME_TO_CREDITS:
      PrepareToSwitchStatus();
      InitMenu(MenuStatus.CREDITS);
      audio.playMusicTheme(MusicTheme.CREDITS, 2000, 2000);
      InitCreditsMenu(vw_GetTimeThread(0));
      break;
  }
}

// ---- the 2D layer: what was drawn into the canvas goes over the 3D picture now

export const layer2D = { flush: (): void => {} };
export function end2D(): void {
  layer2D.flush();
}

// ---- loop_proc.cpp

export function Loop_Proc(): void {
  CursorUpdate();
  if (MN.MenuStatus === MenuStatus.GAME) screens.DrawGame();
  else DrawMenu();
  DrawDialogBox();
  CursorDraw();
  end2D();
  if (vw_GetKeyStatus(SDLK.ESCAPE)) {
    SetCurrentDialogBox(DialogBox.QuitFromGame);
    vw_SetKeyReleased(SDLK.ESCAPE);
  }
  ProceedCommand();
  GameSpeedUpdate(MN.MenuStatus === MenuStatus.GAME && screens.GameContentTransp() <= 0 && !gameState.missionComplete());
  if (vw_GetKeyStatus(SDLK.TAB)) {
    UI.CurrentKeyboardSelectMenuElement++;
    vw_SetKeyReleased(SDLK.TAB);
  }
  if (MN.MenuStatus !== MenuStatus.GAME || isDialogBoxDrawing() || screens.GameContentTransp() >= 0.99) {
    if (vw_GetKeyStatus(SDLK.RIGHT) || vw_GetKeyStatus(SDLK.DOWN)) {
      UI.CurrentKeyboardSelectMenuElement++;
      vw_SetKeyReleased(SDLK.RIGHT);
      vw_SetKeyReleased(SDLK.DOWN);
    }
    if (vw_GetKeyStatus(SDLK.LEFT) || vw_GetKeyStatus(SDLK.UP)) {
      UI.CurrentKeyboardSelectMenuElement--;
      vw_SetKeyReleased(SDLK.LEFT);
      vw_SetKeyReleased(SDLK.UP);
      if (UI.CurrentKeyboardSelectMenuElement < 1) UI.CurrentKeyboardSelectMenuElement = UI.CurrentActiveMenuElement;
    }
  }
  if (UI.CurrentKeyboardSelectMenuElement > 0) {
    if (UI.CurrentActiveMenuElement > 0) {
      if (UI.CurrentKeyboardSelectMenuElement > UI.CurrentActiveMenuElement) UI.CurrentKeyboardSelectMenuElement = 1;
    } else {
      UI.CurrentKeyboardSelectMenuElement = 0;
    }
  }
  UI.CurrentActiveMenuElement = 0;
  if (MN.MenuStatus === MenuStatus.GAME) {
    const p = ChangeGameConfig().Profile[Cur.CurrentProfile];
    if (vw_GetKeyStatus(SDLK.F8)) {
      WeaponPanelViewNext();
      vw_SetKeyReleased(SDLK.F8);
    }
    if (vw_GetKeyStatus(SDLK.F9)) {
      p.PrimaryWeaponFireMode++;
      if (p.PrimaryWeaponFireMode > 2) p.PrimaryWeaponFireMode = 1;
      vw_SetKeyReleased(SDLK.F9);
    }
    if (vw_GetKeyStatus(SDLK.F10)) {
      p.SecondaryWeaponFireMode++;
      if (p.SecondaryWeaponFireMode > 2) p.SecondaryWeaponFireMode = 1;
      vw_SetKeyReleased(SDLK.F10);
    }
  }
}

export const gameState = { missionComplete: (): boolean => false };
