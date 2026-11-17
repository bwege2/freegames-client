// AstroMenace 1.4.3 (Mikhail Kurinnoi, Viewizard; GPL-3.0-or-later), port of src/game/weapon_panel.cpp,
// src/ui/game/text.cpp, src/ui/game/stopwatch.cpp and src/ui/game_speed.cpp.
// Changed for the browser by the freegames project, 2026.
import { mat33, m33InverseRotate, m33CalcPoint } from '../core/math.ts';
import { alive } from '../core/particles.ts';
import { rect, vw_Draw2D, vw_DrawText, vw_SetFontSize, vw_TextWidth, RGB } from '../engine/draw2d.ts';
import {
  SDL_GetTicks, vw_GetKeyStatus, vw_GetMouseLeftClick, vw_GetText, vw_GetTimeThread, vw_InitTimeThread, vw_SetKeyReleased,
  vw_SetTimeThreadSpeed,
} from '../engine/core.ts';
import { ChangeGameConfig, GameConfig, SDLK, WeaponPanelView } from './config.ts';
import type { SpaceShip } from '../object3d/spaceship.ts';
import type { Weapon } from '../object3d/weapon.ts';
import { DrawButton200_2, SetShowGameCursor, UI } from '../ui/button.ts';

// ---- weapon panels

export const GetWeaponIconName = (n: number): string => `menu/weapon${n}_icon.tga`;

const PBW = 8, PBH = 64, IW = 128, IH = 64, SB = 2, SS = 2, FB = 2, FS = 2, FPW = 164, FPH = 88, FPBH = 56;
const WP = { LastUpdateTick: 0, Blinking: 1 };

const ammoProgress = (w: Weapon, h: number): number => Math.trunc((h * (w.AmmoStart - w.Ammo)) / w.AmmoStart);
function reloadProgress(w: Weapon, t: number, h: number): number {
  let r = h - Math.trunc((h * (t - w.LastFireTime)) / w.NextFireTime);
  if (w.InternalType === 17 && w.SwarmNum > 0) r = 64;
  else if (r < 0) r = 0;
  return r;
}

function bars(X: number, Y: number, ax: number, rx: number, w: Weapon, t: number, h: number, ammo: string, energy: string, y0: number): void {
  const a = ammoProgress(w, h);
  vw_Draw2D(rect(X + ax, Y + y0 + a, X + ax + PBW, Y + y0 + h), rect(0, a, PBW, h), ammo, true, 1);
  const r = reloadProgress(w, t, h);
  vw_Draw2D(rect(X + rx, Y + y0 + r, X + rx + PBW, Y + y0 + h), rect(0, r, PBW, h), energy, true, 1);
}

function status(dst: ReturnType<typeof rect>, w: Weapon): boolean {
  const src = rect(0, 0, IW, IH);
  const icon = 'menu/weapon_on_icon.tga';
  if (w.ArmorCurrentStatus <= 0) {
    vw_Draw2D(dst, src, icon, true, WP.Blinking, 0, RGB.red);
    vw_Draw2D(dst, src, GetWeaponIconName(w.InternalType), true, 1);
    return false;
  }
  if (w.CurrentEnergyAccumulated < w.EnergyUse) vw_Draw2D(dst, src, icon, true, WP.Blinking, 0, { r: 0, g: 1, b: 1 });
  else if (w.Ammo === 0) vw_Draw2D(dst, src, icon, true, WP.Blinking, 0, { r: 1, g: 0.5, b: 0.2 });
  else vw_Draw2D(dst, src, icon, true, 1, 0, RGB.green);
  vw_Draw2D(dst, src, GetWeaponIconName(w.InternalType), true, 1);
  return true;
}

function slim(X: number, Y: number, ax: number, rx: number, w: Weapon, t: number): void {
  const bp = 'menu/blackpoint.tga', s = rect(0, 0, 2, 2);
  vw_Draw2D(rect(X, Y, X + SB * 2 + SS + PBW * 2, Y + SB * 2 + PBH), s, bp, true, 0.2);
  vw_Draw2D(rect(X + SB + ax, Y + SB, X + SB + ax + PBW, Y + SB + PBH), s, bp, true, 0.5);
  vw_Draw2D(rect(X + SB + rx, Y + SB, X + SB + rx + PBW, Y + SB + PBH), s, bp, true, 0.5);
  if (w.ArmorCurrentStatus <= 0) return;
  bars(X, Y, SB + ax, SB + rx, w, t, PBH, 'game/ammo.tga', 'game/energy.tga', SB);
}

function flat(X: number, Y: number, ax: number, rx: number, ix: number, w: Weapon, t: number): void {
  const bp = 'menu/blackpoint.tga', s = rect(0, 0, 2, 2);
  vw_Draw2D(rect(X, Y, X + FB * 2 + FS * 2 + PBW * 2 + IW, Y + FB * 2 + IH), s, bp, true, 0.2);
  vw_Draw2D(rect(X + FB + ax, Y + FB, X + FB + ax + PBW, Y + FB + PBH), s, bp, true, 0.5);
  vw_Draw2D(rect(X + FB + rx, Y + FB, X + FB + rx + PBW, Y + FB + PBH), s, bp, true, 0.5);
  const d = rect(X + FB + ix, Y + FB, X + FB + ix + IW, Y + FB + IH);
  vw_Draw2D(d, s, bp, true, 0.5);
  if (!status(d, w)) return;
  bars(X, Y, FB + ax, FB + rx, w, t, PBH, 'game/ammo.tga', 'game/energy.tga', FB);
}

function full(X: number, Y: number, ax: number, rx: number, ix: number, border: string, w: Weapon, t: number): void {
  vw_Draw2D(rect(X, Y, X + FPW, Y + FPH), rect(0, 0, FPW, FPH), border, true, 1);
  if (!status(rect(X + ix, Y + 12, X + ix + IW, Y + 12 + IH), w)) return;
  bars(X, Y, ax, rx, w, t, FPBH, 'game/weapon_ammo.tga', 'game/weapon_energy.tga', 16);
}

export function DrawWeaponPanels(ship: SpaceShip | null): void {
  const view = GameConfig().WeaponPanelView;
  if (!ship || view < WeaponPanelView.hide || view > WeaponPanelView.full) return;
  const now = SDL_GetTicks();
  WP.Blinking -= (1.9 * (now - WP.LastUpdateTick)) / 1000;
  if (WP.Blinking < 0.1 || WP.Blinking > 1) WP.Blinking = 1;
  WP.LastUpdateTick = now;
  const inv = Float64Array.from(ship.CurrentRotationMat);
  m33InverseRotate(inv);
  let right = 0, left = 0;
  const W = GameConfig().InternalWidth;
  const t = ship.TimeLastUpdate;
  for (const s of ship.WeaponSlots) {
    const loc = s.Location.clone();
    m33CalcPoint(loc, inv);
    const w = alive(s.Weapon);
    if (!w) continue;
    if (loc.x > -0.01) {
      if (view === WeaponPanelView.full) full(0, 70 + left * 85, 2, 12, 24, 'game/weapon_panel_left.tga', w, t);
      else if (view === WeaponPanelView.flat) flat(0, 80 + left * 70, 0, PBW + FS, (PBW + FS) * 2, w, t);
      else if (view === WeaponPanelView.slim) slim(0, 80 + left * 70, 0, PBW + SS, w, t);
      left++;
    } else {
      if (view === WeaponPanelView.full) full(W - 164, 70 + right * 85, 154, 144, 12, 'game/weapon_panel_right.tga', w, t);
      else if (view === WeaponPanelView.flat) flat(W - (IW + (PBW + SS + SB) * 2), 80 + right * 70, IW + PBW + FS * 2, IW + FS, 0, w, t);
      else if (view === WeaponPanelView.slim) slim(W - (PBW * 2 + SS + SB * 2), 80 + right * 70, PBW + SS, 0, w, t);
      right++;
    }
  }
}

export function WeaponPanelViewNext(): void {
  let v = GameConfig().WeaponPanelView + 1;
  if (v > WeaponPanelView.full) v = WeaponPanelView.hide;
  ChangeGameConfig().WeaponPanelView = v;
}
export function WeaponPanelViewPrev(): void {
  let v = GameConfig().WeaponPanelView - 1;
  if (v < WeaponPanelView.hide) v = WeaponPanelView.full;
  ChangeGameConfig().WeaponPanelView = v;
}
void mat33;

// ---- mission number and mission failed (ui/game/text.cpp)

const TX = {
  MissionNumberLifeTime: 0, MissionNumberLastUpdateTime: 0, MissionNumberString: '',
  MissionFailedLifeTime: 0, MissionFailedLastUpdateTime: 0,
  /** game.cpp's ExitGame */
  exitGame: (_cmd: number): void => {},
};
export const textHooks = TX;

export function SetupMissionNumberText(time: number, n: number): void {
  TX.MissionNumberLifeTime = time;
  if (time <= 0) return;
  TX.MissionNumberLastUpdateTime = vw_GetTimeThread(0);
  TX.MissionNumberString = String(n);
}

const NUMS: Record<string, [number, number, number, number]> = {
  1: [15, 1, 48, 63], 2: [48, 1, 86, 63], 3: [86, 1, 124, 63], 4: [124, 1, 160, 63], 5: [161, 1, 200, 63],
  6: [200, 1, 238, 63], 7: [239, 1, 275, 63], 8: [276, 1, 315, 63], 9: [319, 1, 385, 63], 0: [360, 1, 399, 63],
};

export function DrawMissionNumberText(): void {
  if (TX.MissionNumberLifeTime <= 0) return;
  const now = vw_GetTimeThread(0);
  TX.MissionNumberLifeTime -= now - TX.MissionNumberLastUpdateTime;
  TX.MissionNumberLastUpdateTime = now;
  let numW = 0;
  for (const c of TX.MissionNumberString) numW += NUMS[c][2] - NUMS[c][0];
  const w = 226 + 20 + numW;
  const XStart = Math.trunc((GameConfig().InternalWidth - w) / 2);
  const tr = TX.MissionNumberLifeTime > 1 ? 1 : TX.MissionNumberLifeTime;
  vw_Draw2D(rect(XStart, 352, XStart + 226, 352 + 64), rect(0, 0, 226, 64), vw_GetText('lang/en/game/mission.tga'), true, tr);
  let x = XStart + 226 + 20;
  for (const c of TX.MissionNumberString) {
    const s = NUMS[c];
    vw_Draw2D(rect(x, 352, x + s[2] - s[0], 352 + s[3] - s[1]), rect(...s), 'game/nums.tga', true, tr);
    x += s[2] - s[0];
  }
}

export function SetupMissionFailedText(time: number): void {
  TX.MissionFailedLifeTime = time;
  if (time <= 0) return;
  TX.MissionFailedLastUpdateTime = vw_GetTimeThread(0);
  SetShowGameCursor(true);
  vw_GetMouseLeftClick(true);
}

/** Command values of command.h used here */
export const Command = {
  DO_NOTHING: 0, SWITCH_TO_MAIN_MENU: 1, SWITCH_TO_TOP_SCORES: 2, SWITCH_TO_INTERFACE: 3, SWITCH_TO_OPTIONS: 4,
  SWITCH_TO_OPTIONS_ADVANCED: 5, SWITCH_TO_INFORMATION: 6, SWITCH_TO_CREDITS: 7, SWITCH_TO_CONFCONTROL: 8,
  SWITCH_TO_PROFILE: 9, SWITCH_TO_DIFFICULTY: 10, SWITCH_TO_MISSION: 11, SWITCH_TO_WORKSHOP: 12,
  SWITCH_FROM_MENU_TO_GAME: 13, SWITCH_FROM_GAME_TO_MISSION_MENU: 14, SWITCH_FROM_GAME_TO_MAIN_MENU: 15,
  SWITCH_FROM_GAME_TO_CREDITS: 16,
};

export function DrawMissionFailedText(): void {
  if (TX.MissionFailedLifeTime <= 0) return;
  const now = vw_GetTimeThread(0);
  TX.MissionFailedLifeTime -= now - TX.MissionFailedLastUpdateTime;
  TX.MissionFailedLastUpdateTime = now;
  const W = GameConfig().InternalWidth;
  vw_Draw2D(rect(Math.trunc((W - 512) / 2), 342, Math.trunc((W + 512) / 2), 342 + 84), rect(0, 0, 512, 84),
    vw_GetText('lang/en/game/missionfailed.tga'), true);
  if (TX.MissionFailedLifeTime <= 0) TX.exitGame(Command.SWITCH_FROM_GAME_TO_MISSION_MENU);
  if (!UI.isDialogBoxDrawing() && vw_GetKeyStatus(SDLK.ESCAPE)) {
    TX.exitGame(Command.SWITCH_FROM_GAME_TO_MAIN_MENU);
    vw_SetKeyReleased(SDLK.ESCAPE);
  }
  if (DrawButton200_2(W / 2 - 230, 180 + 270, vw_GetText('QUIT'), 1, false)) TX.exitGame(Command.SWITCH_FROM_GAME_TO_MAIN_MENU);
  if (DrawButton200_2(W / 2 + 30, 180 + 270, vw_GetText('RESTART'), 1, false)) TX.exitGame(Command.SWITCH_FROM_MENU_TO_GAME);
}

// ---- stopwatch

const SW = { Enabled: false, LastTick: 0, InitialTime: 0, text: '' };
export function StopwatchReset(enable: boolean): void {
  SW.Enabled = enable;
  if (!enable) return;
  SW.LastTick = SDL_GetTicks();
  SW.InitialTime = vw_GetTimeThread(1);
  SW.text = '';
}
export function StopwatchDraw(): void {
  if (SW.Enabled) vw_DrawText(6, 45, 0, 0, 1, RGB.white, 1, SW.text);
}
export function StopwatchUpdate(): void {
  if (!SW.Enabled) return;
  const now = SDL_GetTicks();
  if (now < SW.LastTick + 100) return;
  SW.LastTick = now;
  SW.text = `mission time: ${(vw_GetTimeThread(1) - SW.InitialTime).toFixed(1)}`;
}

// ---- game speed

const GSP = { RemainingDrawTime: 0, LastUpdateTick: 0, text: '' };
export function InitGameSpeed(): void {
  vw_InitTimeThread(1);
  SetSpeed(GameConfig().GameSpeed);
}
export function SetThreadSpeed(s: number): void {
  vw_SetTimeThreadSpeed(1, s);
}
export function SetSpeed(s: number): void {
  s = Math.fround(Math.min(3, Math.max(0.1, s)));
  ChangeGameConfig().GameSpeed = s;
  SetThreadSpeed(s);
  GSP.RemainingDrawTime = 2;
  GSP.LastUpdateTick = SDL_GetTicks();
  GSP.text = `${vw_GetText('Game Speed:')} ${s.toFixed(1)}`;
}
export function GameSpeedUpdate(inGame: boolean): void {
  if (inGame) {
    if (vw_GetKeyStatus(SDLK.F5)) {
      SetSpeed(Math.fround(GameConfig().GameSpeed - Math.fround(0.1)));
      vw_SetKeyReleased(SDLK.F5);
    }
    if (vw_GetKeyStatus(SDLK.F6)) {
      SetSpeed(1.5);
      vw_SetKeyReleased(SDLK.F6);
    }
    if (vw_GetKeyStatus(SDLK.F7)) {
      SetSpeed(Math.fround(GameConfig().GameSpeed + Math.fround(0.1)));
      vw_SetKeyReleased(SDLK.F7);
    }
  }
  if (GSP.RemainingDrawTime <= 0) return;
  const now = SDL_GetTicks();
  if (GSP.LastUpdateTick < now) GSP.RemainingDrawTime -= (now - GSP.LastUpdateTick) / 1000;
  GSP.LastUpdateTick = now;
}
export function GameSpeedDraw(): void {
  if (GSP.RemainingDrawTime <= 0) return;
  vw_SetFontSize(20);
  vw_DrawText(Math.trunc((GameConfig().InternalWidth - vw_TextWidth(GSP.text)) / 2), 80, 0, 0, 1, RGB.white,
    GSP.RemainingDrawTime > 1 ? 1 : GSP.RemainingDrawTime, GSP.text);
  vw_SetFontSize(16);
}
