// AstroMenace 1.4.3 (Mikhail Kurinnoi, Viewizard; GPL-3.0-or-later), port of src/game/game.cpp: a
// mission (InitGame, DrawGame with its game menu and the results, ExitGame, ExitGameWithSave).
// Changed for the browser by the freegames project, 2026.
import { Vec3 } from '../core/math.ts';
import { releaseParticleSystem, updateAllParticleSystems } from '../core/particles.ts';
import { cameraLookAt, resizeScene, setCameraLocation, setCameraMoveAroundPoint } from '../core/camera.ts';
import { rect, vw_Draw2D, vw_DrawText, vw_TextWidth, RGB } from '../engine/draw2d.ts';
import { vw_GetKeyStatus, vw_GetMouseLeftClick, vw_GetText, vw_GetTimeThread, vw_ResetMouseButtons, vw_ResetWheelStatus, vw_SetKeyReleased } from '../engine/core.ts';
import { world, playerFighter } from '../object3d/world.ts';
import { ReleaseSpaceShip } from '../object3d/spaceship.ts';
import { GS, DetectCollisionAllObject3D } from '../object3d/collisions.ts';
import { ChangeGameConfig, Cur, GameConfig, SDLK } from './config.ts';
import { G, MenuSFX, audio } from './globals.ts';
import { InitCamera, CameraUpdate } from './camera.ts';
import { MissionScript, scriptHooks } from './script.ts';
import { GamePlayerShip, GetShipMaxEnergy, InitGamePlayerShip, PS } from './playership.ts';
import { DrawHUD, InitHUD, SetupHUDText, UpdateHUD, vw_ReleaseAllParticleSystems2D } from './hud.ts';
import {
  Command, DrawMissionFailedText, DrawMissionNumberText, DrawWeaponPanels, GameSpeedDraw, InitGameSpeed, SetThreadSpeed,
  SetupMissionFailedText, SetupMissionNumberText, StopwatchDraw, StopwatchReset, StopwatchUpdate, textHooks,
} from './gameui.ts';
import {
  DrawType, DrawAllObject3D, StarSystemDraw, StarSystemInit, StarSystemInitByType, StarSystemLayer1Transp, StarSystemLayer3Transp,
  UpdateAllObject3D,
} from './starsystem.ts';
import { DrawButton384, SetShowGameCursor, butState } from '../ui/button.ts';
import { DialogBox, SetCurrentDialogBox, dialogHooks, isDialogBoxDrawing } from '../menu/dialog.ts';
import { M, MS, CenterMissionList, GetCurrentMissionFileName } from '../menu/menus.ts';
import { MN, MenuStatus, end2D, gameState, screens, setCommand } from '../menu/menu.ts';
import { R } from '../render/gl.ts';

export const GameMenuStatus = { GAME_MENU: 0, OPTIONS: 1, OPTIONS_ADVANCED: 2, INTERFACE: 3, CONFCONTROL: 4 };

export const GM = {
  MissionScript: null as MissionScript | null,
  GameExitCommand: Command.DO_NOTHING,
  GameMissionCompleteStatus: false,
  GameMissionCompleteStatusShowDialog: false,
  GameMenu: false,
  GameContentTransp: 0,
  LastGameUpdateTime: 0,
  GameMenuStatus: GameMenuStatus.GAME_MENU,
  buttons: [butState(), butState(), butState(), butState(), butState()],
  NeedShowGameMenu: false,
  NeedHideGameMenu: false,
  CurrentTime: 0,
  SoundShowHideMenu: 0,
  LastGameOnOffUpdateTime: 0,
  GameBlackTransp: 0,
  NeedOnGame: false,
  NeedOffGame: false,
  /** the game menu's options screens (options.ts) */
  optionsMenu: (_status: number, _transp: number): void => {},
};

scriptHooks.StarSystemInit = StarSystemInit;
scriptHooks.StarSystemLayer1Transp = StarSystemLayer1Transp;
scriptHooks.StarSystemLayer3Transp = StarSystemLayer3Transp;
scriptHooks.StopwatchReset = StopwatchReset;
GS.onScore = (exp: number, money: number): void => SetupHUDText(exp, money);
G.onMissionComplete = (): void => SetGameMissionComplete();
PS.onPlayerDead = (): void => SetupMissionFailedText(20);
textHooks.exitGame = (c: number): void => ExitGame(c);
dialogHooks.exitGame = (c: number): void => ExitGame(c);
gameState.missionComplete = (): boolean => GM.GameMissionCompleteStatus;

export function InitGame(): void {
  if (Cur.CurrentProfile < 0 || Cur.CurrentProfile > 4) Cur.CurrentProfile = 0;
  if (Cur.CurrentMission === -1) Cur.CurrentMission = 0;
  const p = GameConfig().Profile[Cur.CurrentProfile];
  G.GameEnemyWeaponPenalty = p.EnemyWeaponPenalty;
  G.GameEnemyArmorPenalty = p.EnemyArmorPenalty;
  G.GameEnemyTargetingSpeedPenalty = p.EnemyTargetingSpeedPenalty;
  G.GameUnlimitedAmmo = p.UnlimitedAmmo;
  G.GameUndestroyableWeapon = p.UndestroyableWeapon;
  G.GameWeaponTargetingMode = p.WeaponTargetingMode;
  G.GameSpaceShipControlMode = p.SpaceShipControlMode;
  G.GameEngineSystem = p.EngineSystem;
  if (G.GameSpaceShipControlMode === 1 && G.GameEngineSystem === 0) G.GameEngineSystem = 1;
  G.GameTargetingSystem = p.TargetingSystem;
  G.GameAdvancedProtectionSystem = p.AdvancedProtectionSystem;
  G.GamePowerSystem = p.PowerSystem;
  G.GameTargetingMechanicSystem = p.TargetingMechanicSystem;
  G.ShipHull = p.ShipHull;
  G.GameMoney = p.Money;
  G.GameExperience = p.Experience - p.ByMissionExperience[Cur.CurrentMission];
  vw_ResetMouseButtons();
  SetShowGameCursor(false);
  InitGameSpeed();
  StopwatchReset(false);
  InitCamera(vw_GetTimeThread(1));
  InitGamePlayerShip();
  StarSystemInitByType(DrawType.GAME);
  GM.MissionScript = new MissionScript();
  if (!GM.MissionScript.RunScript(GetCurrentMissionFileName(), vw_GetTimeThread(1))) GM.MissionScript = null;
  SetupMissionNumberText(3, Cur.CurrentMission + 1);
  SetupMissionFailedText(0);
  resizeScene(45, GameConfig().InternalWidth / GameConfig().InternalHeight, 1, 2000);
  setCameraLocation(new Vec3(0, 65, -100 + 10));
  setCameraMoveAroundPoint(new Vec3(0, 0, 10), 0, new Vec3());
  InitHUD(playerFighter(), G.GamePowerSystem ? PS.CurrentPlayerShipEnergy / GetShipMaxEnergy(G.GamePowerSystem) : 0,
    p.Experience - p.ByMissionExperience[Cur.CurrentMission], p.Money);
  GM.GameContentTransp = 0;
  PS.GameContentTransp = 0;
  GM.LastGameUpdateTime = vw_GetTimeThread(0);
  for (const b of GM.buttons) {
    b.t = 1;
    b.u = 0;
  }
  GM.GameMenu = false;
  GM.NeedShowGameMenu = false;
  GM.NeedHideGameMenu = false;
  GM.GameMenuStatus = GameMenuStatus.GAME_MENU;
  for (const k of ['AlienShips', 'AlienMotherShips', 'PirateShips', 'PirateVehicles', 'PirateBuildings', 'Asteroids'] as const) {
    GS[`${k}KillQuant`] = 0;
    GS[`${k}KillBonus`] = 0;
  }
  GM.CurrentTime = vw_GetTimeThread(0);
  PS.CurrentAlert2 = 1;
  PS.CurrentAlert3 = 1;
  MN.MenuStatus = MenuStatus.GAME;
  GM.GameMissionCompleteStatus = false;
  PS.GameMissionCompleteStatus = false;
  GM.GameMissionCompleteStatusShowDialog = false;
  GM.SoundShowHideMenu = 0;
  GM.LastGameOnOffUpdateTime = vw_GetTimeThread(0);
  GM.GameBlackTransp = 1;
  GM.NeedOnGame = true;
}

export function ExitGame(c: number): void {
  GM.GameExitCommand = c;
  GM.NeedOffGame = true;
  GM.LastGameOnOffUpdateTime = vw_GetTimeThread(0);
  if (GM.GameMenu) {
    GM.GameMenu = false;
    GM.NeedShowGameMenu = false;
    GM.NeedHideGameMenu = true;
    SetShowGameCursor(false);
  }
}

function RealExitGame(): void {
  ReleaseSpaceShip(playerFighter());
  vw_ReleaseAllParticleSystems2D();
  releaseParticleSystem(PS.Shild1);
  releaseParticleSystem(PS.Shild2);
}

export function ExitGameWithSave(c: number): void {
  const C = ChangeGameConfig();
  const p = C.Profile[Cur.CurrentProfile];
  p.Money = Math.trunc(G.GameMoney);
  if (p.Experience < Math.trunc(G.GameExperience)) {
    const Incr = Math.trunc(G.GameExperience) - p.Experience;
    p.ByMissionExperience[Cur.CurrentMission] += Incr;
    p.Experience += Incr;
  }
  p.MissionReplayCount[Cur.CurrentMission]++;
  const f = playerFighter();
  if (f) {
    p.ArmorStatus = f.ArmorCurrentStatus;
    for (let i = 0; i < f.WeaponSlots.length; i++) {
      if (p.Weapon[i] === 0) continue;
      const w = f.WeaponSlots[i].Weapon;
      if (w && !w.released) {
        if (w.ArmorCurrentStatus <= 0) {
          p.WeaponAmmo[i] = 0;
          p.Weapon[i] = 0;
        } else {
          p.WeaponAmmo[i] = w.Ammo;
        }
      }
    }
  }
  Cur.CurrentMission++;
  if (p.OpenLevelNum < Cur.CurrentMission) p.OpenLevelNum = Cur.CurrentMission;
  if (Cur.CurrentMission > MS.AllMission - 1) {
    Cur.CurrentMission = -1;
    c = Command.SWITCH_FROM_GAME_TO_CREDITS;
  }
  vw_ResetWheelStatus();
  CenterMissionList();
  p.LastMission = Cur.CurrentMission;
  ExitGame(c);
}

export function SetGameMissionComplete(): void {
  if (!playerFighter()) return;
  GM.GameMissionCompleteStatus = true;
  PS.GameMissionCompleteStatus = true;
  GM.GameMissionCompleteStatusShowDialog = true;
}

const W = (): number => GameConfig().InternalWidth;
const pad = (n: number, w: number): string => {
  const s = String(Math.round(Math.abs(n)));
  return (n < 0 ? '-' : '') + s.padStart(n < 0 ? w - 1 : w, '0');
};

function drawResults(T: number): void {
  vw_Draw2D(rect(W() / 2 - 256 - 26, 128 - 28, W() / 2 - 256 + 534, 128 + 532), rect(2, 2, 564 - 2, 564 - 2), 'menu/dialog512_512.tga', true, T);
  const fit = (s: string, max: number): [number, number] => {
    const w = vw_TextWidth(s);
    return w > max ? [max, -max] : [w, 0];
  };
  let [Size, WScale] = fit(vw_GetText('Mission Complete'), 190);
  vw_DrawText(W() / 2 - 123 - Math.trunc(Size / 2), 128 + 21, WScale, 0, 1, RGB.yellow, 0.7 * T, vw_GetText('Mission Complete'));
  let Y = 128 + 90;
  const Prir = 36;
  vw_DrawText(W() / 2 - 256 + 38, Y, 0, 0, 1, RGB.yellow, 0.5 * T, vw_GetText('Type'));
  [Size, WScale] = fit(vw_GetText('Killed'), 70);
  vw_DrawText(W() / 2 - 31 + Math.trunc(Size / 2), Y, WScale, 0, 1, RGB.yellow, 0.5 * T, vw_GetText('Killed'));
  [Size, WScale] = fit(vw_GetText('Bonus'), 70);
  vw_DrawText(W() / 2 + 97 + Math.trunc(Size / 2), Y, WScale, 0, 1, RGB.yellow, 0.5 * T, vw_GetText('Bonus'));
  Y += Prir;
  const rows: [string, number, number, number][] = [
    ['Alien Spaceships', GS.AlienShipsKillQuant, GS.AlienShipsKillBonus, -210],
    ['Alien Motherships', GS.AlienMotherShipsKillQuant, GS.AlienMotherShipsKillBonus, -210],
    ['Pirate Spaceships', GS.PirateShipsKillQuant, GS.PirateShipsKillBonus, -210],
    ['Pirate Vehicles', GS.PirateVehiclesKillQuant, GS.PirateVehiclesKillBonus, -210],
    ['Pirate Buildings', GS.PirateBuildingsKillQuant, GS.PirateBuildingsKillBonus, -210],
    ['Asteroids', GS.AsteroidsKillQuant, GS.AsteroidsKillBonus, 0],
  ];
  let total = 0;
  for (const [name, q, b, ws] of rows) {
    vw_DrawText(W() / 2 - 256 + 38, Y, ws, 0, 1, RGB.white, T, vw_GetText(name));
    vw_DrawText(W() / 2 + 10, Y, 0, 0, 1, RGB.white, T, pad(q, 4));
    vw_DrawText(W() / 2 + 126, Y, 0, 0, 1, RGB.white, T, pad(b, 6));
    total += q;
    Y += Prir;
  }
  Y += Math.trunc(Prir * 1.5) - Prir;
  vw_DrawText(W() / 2 - 256 + 38, Y, -210, 0, 1, RGB.yellow, T, vw_GetText('Total'));
  vw_DrawText(W() / 2 + 10, Y, 0, 0, 1, RGB.white, T, pad(total, 4));
  vw_DrawText(W() / 2 + 126, Y, 0, 0, 1, RGB.white, T, pad(G.GameMoney - GameConfig().Profile[Cur.CurrentProfile].Money, 6));
  if (DrawButton384(W() / 2 - 192, 545, vw_GetText('NEXT'), T, GM.buttons[4])) ExitGameWithSave(Command.SWITCH_FROM_GAME_TO_MISSION_MENU);
}

function showHideSFX(sfx: number): void {
  if (audio.isSoundAvailable(GM.SoundShowHideMenu)) audio.stopSound(GM.SoundShowHideMenu, 150);
  GM.SoundShowHideMenu = audio.playMenuSFX(sfx, 1);
}

export function DrawGame(): void {
  const r = R.gl;
  const now0 = vw_GetTimeThread(0);
  const TimeDelta = now0 - GM.CurrentTime;
  GM.CurrentTime = now0;
  PS.CurrentAlert2 -= TimeDelta;
  if (PS.CurrentAlert2 < 0.1) PS.CurrentAlert2 = 1;
  PS.CurrentAlert3 -= 1.9 * TimeDelta;
  if (PS.CurrentAlert3 < 0.1) PS.CurrentAlert3 = 1;
  CameraUpdate(vw_GetTimeThread(1));
  cameraLookAt();
  r?.cameraLookAt();
  StarSystemDraw(DrawType.GAME);
  DrawAllObject3D(DrawType.GAME);
  UpdateAllObject3D(vw_GetTimeThread(1));
  updateAllParticleSystems(vw_GetTimeThread(1));
  if (GM.GameContentTransp < 0.99) DetectCollisionAllObject3D();
  if (GM.MissionScript && !GM.MissionScript.Update(vw_GetTimeThread(1))) GM.MissionScript = null;
  PS.GameContentTransp = GM.GameContentTransp;
  GamePlayerShip();
  const f = playerFighter();
  UpdateHUD(f, G.GamePowerSystem ? PS.CurrentPlayerShipEnergy / GetShipMaxEnergy(G.GamePowerSystem) : 0);
  DrawHUD();
  DrawWeaponPanels(f);
  GameSpeedDraw();
  DrawMissionNumberText();
  DrawMissionFailedText();
  const C = GameConfig();
  if (GM.NeedShowGameMenu) {
    GM.GameContentTransp += 2 * (vw_GetTimeThread(0) - GM.LastGameUpdateTime);
    if (GM.GameContentTransp >= 1) {
      GM.GameContentTransp = 1;
      GM.NeedShowGameMenu = false;
      SetShowGameCursor(true);
    }
    if (GM.GameContentTransp !== 0) SetThreadSpeed((1 - GM.GameContentTransp) * C.GameSpeed);
  }
  if (GM.NeedHideGameMenu) {
    GM.GameContentTransp -= vw_GetTimeThread(0) - GM.LastGameUpdateTime;
    if (GM.GameContentTransp <= 0) {
      GM.GameContentTransp = 0;
      GM.NeedHideGameMenu = false;
      GM.GameMenuStatus = GameMenuStatus.GAME_MENU;
    }
    SetThreadSpeed((1 - GM.GameContentTransp) * C.GameSpeed);
  }
  GM.LastGameUpdateTime = vw_GetTimeThread(0);
  const T = GM.GameContentTransp;
  M.MenuContentTransp = T;
  if (T > 0) {
    if (GM.GameMissionCompleteStatus) {
      drawResults(T);
    } else {
      if (GM.GameMenuStatus === GameMenuStatus.GAME_MENU) {
        vw_Draw2D(rect(W() / 2 - 256 + 4 - 30, 128 + 2 - 30, W() / 2 - 256 + 564 - 30, 128 + 564 - 2 - 30), rect(2, 2, 564 - 2, 564 - 2), 'menu/dialog512_512.tga', true, T);
        const SizeI = 17 + Math.trunc((234 - vw_TextWidth(vw_GetText('GAME MENU'))) / 2);
        vw_DrawText(W() / 2 - 256 + SizeI, 128 + 22, 0, 0, 1, RGB.yellow, 0.7 * T, vw_GetText('GAME MENU'));
        const X = W() / 2 - 192;
        let Y = 225;
        if (DrawButton384(X, Y, vw_GetText('RESUME'), T, GM.buttons[1])) {
          GM.GameMenu = false;
          GM.NeedShowGameMenu = false;
          GM.NeedHideGameMenu = true;
          SetShowGameCursor(false);
          showHideSFX(MenuSFX.MissionHideMenu);
        }
        Y += 100;
        if (DrawButton384(X, Y, vw_GetText('OPTIONS'), T, GM.buttons[2])) {
          screens.SetOptionsMenu(MenuStatus.OPTIONS);
          GM.GameMenuStatus = GameMenuStatus.OPTIONS;
        }
        Y += 100;
        if (DrawButton384(X, Y, vw_GetText('RESTART'), T, GM.buttons[3])) {
          if (!playerFighter()) ExitGame(Command.SWITCH_FROM_MENU_TO_GAME);
          else SetCurrentDialogBox(DialogBox.RestartLevelNoSave);
        }
        Y += 100;
        if (DrawButton384(X, Y, vw_GetText('QUIT'), T, GM.buttons[4])) {
          if (!playerFighter()) ExitGame(Command.SWITCH_FROM_GAME_TO_MAIN_MENU);
          else SetCurrentDialogBox(DialogBox.QuiToMenuNoSave);
        }
      } else {
        GM.optionsMenu(GM.GameMenuStatus, T);
      }
      const pause = vw_GetText('lang/en/game/pause.tga');
      vw_Draw2D(rect(W() - 256 + 60, 768 - 54, W() + 60, 768 + 10), rect(0, 0, 256, 64), pause, true, T === 1 ? PS.CurrentAlert2 * T : T);
    }
  }
  if (!isDialogBoxDrawing() && playerFighter()) {
    if (vw_GetKeyStatus(SDLK.ESCAPE) || GM.GameMissionCompleteStatusShowDialog) {
      let NeedPlaySfx = true;
      if (GM.GameMissionCompleteStatusShowDialog) {
        if (GM.GameMenu) NeedPlaySfx = false;
        else GM.GameMenu = true;
      } else {
        GM.GameMenu = !GM.GameMenu;
      }
      if (GM.GameMenu && (!GM.GameMissionCompleteStatus || GM.GameMissionCompleteStatusShowDialog)) {
        GM.NeedShowGameMenu = true;
        GM.NeedHideGameMenu = false;
        if (NeedPlaySfx) showHideSFX(MenuSFX.MissionShowMenu);
        vw_GetMouseLeftClick(true);
      } else if (!GM.GameMenu && !GM.GameMissionCompleteStatus) {
        GM.NeedShowGameMenu = false;
        GM.NeedHideGameMenu = true;
        if (NeedPlaySfx) showHideSFX(MenuSFX.MissionHideMenu);
        SetShowGameCursor(false);
      }
      if (GM.GameMissionCompleteStatus && !GM.GameMissionCompleteStatusShowDialog) SetCurrentDialogBox(DialogBox.QuiToMenuNoSave);
      GM.GameMissionCompleteStatusShowDialog = false;
      vw_SetKeyReleased(SDLK.ESCAPE);
    }
  }
  if (GM.NeedOnGame) {
    GM.GameBlackTransp = 1 - 2.4 * (vw_GetTimeThread(0) - GM.LastGameOnOffUpdateTime);
    if (GM.GameBlackTransp <= 0) {
      GM.GameBlackTransp = 0;
      GM.NeedOnGame = false;
    }
    vw_Draw2D(rect(0, 0, W(), 768), rect(0, 0, 2, 2), 'menu/blackpoint.tga', true, GM.GameBlackTransp);
  }
  if (GM.NeedOffGame) {
    GM.GameBlackTransp = 2.4 * (vw_GetTimeThread(0) - GM.LastGameOnOffUpdateTime);
    if (GM.GameBlackTransp >= 1) {
      GM.GameBlackTransp = 1;
      GM.NeedOffGame = false;
      RealExitGame();
      setCommand(GM.GameExitCommand);
    }
    vw_Draw2D(rect(0, 0, W(), 768), rect(0, 0, 2, 2), 'menu/blackpoint.tga', true, GM.GameBlackTransp);
  }
  StopwatchUpdate();
  StopwatchDraw();
  end2D();
  void world;
}

screens.InitGame = InitGame;
screens.DrawGame = DrawGame;
screens.GameContentTransp = (): number => GM.GameContentTransp;
