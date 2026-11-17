// AstroMenace 1.4.3 (Mikhail Kurinnoi, Viewizard; GPL-3.0-or-later), port of src/menu/menu_profile.cpp,
// menu_difficulty.cpp and menu_mission.cpp: the pilot profiles, the difficulty settings and the mission
// list. Changed for the browser by the freegames project, 2026.
import { rect, vw_Draw2D, vw_DrawText, vw_TextWidth, RGB, type RGB as Color } from '../engine/draw2d.ts';
import {
  vw_GetCurrentUnicodeChar, vw_GetKeyStatus, vw_GetMouseLeftClick, vw_GetMouseLeftDoubleClick, vw_GetMousePos, vw_GetText,
  vw_GetTimeThread, vw_GetWheelStatus, vw_MouseOverRect, vw_ResetWheelStatus, vw_SetKeyReleased, mouse,
} from '../engine/core.ts';
import { XMLDocument } from '../core/xml.ts';
import {
  ChangeGameConfig, Cur, DifficultyAction, GameConfig, MAX_PROFILES, PilotProfile, ProfileDifficulty, SDLK,
} from '../game/config.ts';
import { MenuSFX, audio } from '../game/globals.ts';
import { scriptFiles } from '../game/script.ts';
import {
  CursorStatus, DrawButton128_2, DrawButton200_2, DrawButton256, DrawButton384, DrawListDownButton, DrawListUpButton,
  SetCursorStatus, UI, type ButState,
} from '../ui/button.ts';
import { DialogBox, SetCurrentDialogBox, isDialogBoxDrawing } from './dialog.ts';
import { Command } from '../game/gameui.ts';

/** what the menus share (menu.cpp's globals), set by menu.ts */
export const M = {
  MenuContentTransp: 0,
  buttons: Array.from({ length: 15 }, (): ButState => ({ t: 1, u: 0 })),
  command: (_c: number): void => {},
  /** CurrentWorkshop = 3; WorkshopCreate() */
  toWorkshopWeaponry: (): void => {},
};

const idiv = (a: number, b: number): number => Math.trunc(a / b);
const W = (): number => GameConfig().InternalWidth;

export function cloneProfile(p: PilotProfile): PilotProfile {
  return Object.assign(new PilotProfile(), structuredClone({ ...p }));
}

// ---- profiles

export const P = { NewProfileName: '', LastProfileNameTime: 0, CurrentProfileNameTransp: 0.9, SoundOnProfileID: -1, SoundTaping: 0 };

function NewRecord(): void {
  let n = -1;
  for (let i = 4; i >= 0; i--) if (!GameConfig().Profile[i].Used) n = i;
  if (n === -1) {
    SetCurrentDialogBox(DialogBox.ProfileCreationError);
    return;
  }
  if (!P.NewProfileName) return;
  const p = new PilotProfile();
  p.Used = true;
  p.Name = P.NewProfileName;
  ChangeGameConfig().Profile[n] = p;
  P.NewProfileName = '';
  Cur.CurrentProfile = n;
  ChangeGameConfig().LastProfile = n;
  Cur.CurrentMission = 0;
  p.LastMission = 0;
  ProfileDifficulty(n, DifficultyAction.Update);
}

function DuplicateRecord(): void {
  let n = -1;
  for (let i = 4; i >= 0; i--) if (!GameConfig().Profile[i].Used) n = i;
  if (n === -1) {
    SetCurrentDialogBox(DialogBox.ProfileCreationError);
    return;
  }
  ChangeGameConfig().Profile[n] = cloneProfile(GameConfig().Profile[Cur.CurrentProfile]);
  Cur.CurrentProfile = n;
  ChangeGameConfig().LastProfile = n;
  Cur.CurrentMission = GameConfig().Profile[n].LastMission;
  ProfileDifficulty(n, DifficultyAction.Update);
}

export function DeleteRecord(): void {
  if (Cur.CurrentProfile === -1) return;
  const C = ChangeGameConfig();
  if (Cur.CurrentProfile === MAX_PROFILES - 1 || !C.Profile[Cur.CurrentProfile + 1].Used) {
    C.Profile[Cur.CurrentProfile].Used = false;
    Cur.CurrentProfile -= 1;
  } else {
    for (let i = Cur.CurrentProfile; i < MAX_PROFILES - 1; i++) {
      C.Profile[i] = cloneProfile(C.Profile[i + 1]);
      C.Profile[i + 1].Used = false;
    }
  }
  if (Cur.CurrentProfile === -1 && C.Profile[0].Used) Cur.CurrentProfile = 0;
  C.LastProfile = Cur.CurrentProfile;
  ProfileDifficulty(MAX_PROFILES, DifficultyAction.UpdateAll);
}

function ProfileInputText(): void {
  const T = M.MenuContentTransp;
  const ch = vw_GetCurrentUnicodeChar();
  if (ch) {
    if (vw_TextWidth(P.NewProfileName) < 540) {
      P.NewProfileName += ch;
      if (audio.isSoundAvailable(P.SoundTaping)) audio.stopSound(P.SoundTaping, 0);
      P.SoundTaping = audio.playMenuSFX(MenuSFX.TapingClick, 1);
    }
  }
  if (vw_GetKeyStatus(SDLK.BACKSPACE) && P.NewProfileName) {
    P.NewProfileName = [...P.NewProfileName].slice(0, -1).join('');
    if (audio.isSoundAvailable(P.SoundTaping)) audio.stopSound(P.SoundTaping, 0);
    P.SoundTaping = audio.playMenuSFX(MenuSFX.TapingClick, 1);
    vw_SetKeyReleased(SDLK.BACKSPACE);
  }
  if ((vw_GetKeyStatus(SDLK.KP_ENTER) || vw_GetKeyStatus(SDLK.RETURN)) && P.NewProfileName) {
    NewRecord();
    vw_SetKeyReleased(SDLK.KP_ENTER);
    vw_SetKeyReleased(SDLK.RETURN);
  }
  const X1 = idiv(W(), 2) - 372, Y1 = 230;
  const Size = P.NewProfileName ? vw_TextWidth(P.NewProfileName) : 0;
  vw_Draw2D(rect(X1 + Size + 2, Y1 - 2, X1 + 26 + Size, Y1 + 24), rect(0, 0, 2, 2), 'menu/whitepoint.tga', true, P.CurrentProfileNameTransp * T);
  const dt = vw_GetTimeThread(0) - P.LastProfileNameTime;
  P.LastProfileNameTime = vw_GetTimeThread(0);
  P.CurrentProfileNameTransp -= 2 * dt;
  if (P.CurrentProfileNameTransp < 0.2) P.CurrentProfileNameTransp = 0.9;
}

function centered(text: string, x: number, w: number, max: number, y: number, c: Color, T: number): void {
  let Size = vw_TextWidth(text);
  let WScale = 0;
  if (max && Size > max) {
    Size = max;
    WScale = -max;
  }
  vw_DrawText(x + idiv(w - Size, 2), y, WScale, 0, 1, c, T, text);
}

export function ProfileMenu(): void {
  const T = M.MenuContentTransp;
  const C = GameConfig();
  vw_Draw2D(rect(idiv(W(), 2) - 427, 160, idiv(W(), 2) + 432, 160 + 480), rect(2, 2, 861, 482), 'menu/panel800_444_back.tga', true, 0.9 * T);
  const X1 = idiv(W(), 2) - 372;
  let Y1 = 200;
  const Prir1 = 24;
  vw_DrawText(X1, Y1, 0, 0, 1, RGB.orange, T, vw_GetText('New Pilot Profile'));
  Y1 += 30;
  const bp = 'menu/blackpoint.tga', s2 = rect(0, 0, 2, 2);
  vw_Draw2D(rect(X1 - 2, Y1 - 6, X1 + 2 + 590, Y1 - 2 + 30), s2, bp, true, 0.2 * T);
  vw_Draw2D(rect(X1, Y1 - 4, X1 + 590, Y1 - 4 + 30), s2, bp, true, 0.5 * T);
  if (DrawButton128_2(X1 + 616, Y1 - 6, vw_GetText('Create'), T, !P.NewProfileName)) NewRecord();
  if (!isDialogBoxDrawing() && T === 1) ProfileInputText();
  vw_DrawText(X1, Y1, 0, 0, 1, RGB.white, T, P.NewProfileName);
  Y1 += Prir1 * 2;
  vw_DrawText(X1, Y1, 0, 0, 1, RGB.orange, T, vw_GetText('Pilot Profiles'));
  centered(vw_GetText('Money'), idiv(W(), 2) + 2, 130, 70, Y1, RGB.orange, T);
  centered(vw_GetText('Exp'), idiv(W(), 2) + 132, 130, 100, Y1, RGB.orange, T);
  centered(vw_GetText('Difficulty'), idiv(W(), 2) + 262, 130, 100, Y1, RGB.orange, T);
  Y1 += 30;
  vw_Draw2D(rect(X1 - 2, Y1 - 6, X1 + 2 + 750, Y1 - 2 + 230), s2, bp, true, 0.2 * T);
  vw_Draw2D(rect(X1, Y1 - 4, X1 + 750, Y1 - 4 + 230), s2, bp, true, 0.5 * T);
  Y1 += 230;
  let tmpSound = -1;
  let TmpY = Y1 - 230 + 8;
  for (let i = 0; i < 5; i++) {
    const p = C.Profile[i];
    if (p.Used) {
      vw_DrawText(X1 + 10, TmpY, 0, 0, 1, RGB.white, T, `${i + 1}.`);
      if (vw_TextWidth(p.Name) > 300) {
        vw_DrawText(X1 + 50, TmpY, 0, 300, 1, RGB.white, T, p.Name);
        vw_DrawText(X1 + 50 + 310, TmpY, 0, 0, 1, RGB.white, T, '...');
      } else {
        vw_DrawText(X1 + 50, TmpY, 0, 0, 1, RGB.white, T, p.Name);
      }
      centered(String(p.Money), idiv(W(), 2) + 2, 130, 0, TmpY, RGB.white, T);
      centered(String(p.Experience), idiv(W(), 2) + 132, 130, 0, TmpY, RGB.white, T);
      centered(`${ProfileDifficulty(i)}%`, idiv(W(), 2) + 262, 130, 0, TmpY, RGB.white, T);
      if (T >= 0.99 && !isDialogBoxDrawing()) UI.CurrentActiveMenuElement++;
      const kb = UI.CurrentKeyboardSelectMenuElement > 0 && UI.CurrentKeyboardSelectMenuElement === UI.CurrentActiveMenuElement;
      if (!isDialogBoxDrawing() && (vw_MouseOverRect(rect(X1, Y1 - 233 + 46 * i, X1 + 750, Y1 - 234 + 46 + 46 * i)) || kb)) {
        tmpSound = i;
        SetCursorStatus(CursorStatus.ActionAllowed);
        if (P.SoundOnProfileID !== i) {
          P.SoundOnProfileID = i;
          if (UI.CurrentKeyboardSelectMenuElement === 0) audio.playMenuSFX(MenuSFX.OverLine, 1);
        }
        if (vw_GetMouseLeftClick(true) || (kb && (vw_GetKeyStatus(SDLK.KP_ENTER) || vw_GetKeyStatus(SDLK.RETURN)))) {
          if (Cur.CurrentProfile !== i) Cur.CurrentMission = p.LastMission;
          Cur.CurrentProfile = i;
          ChangeGameConfig().LastProfile = i;
          audio.playMenuSFX(MenuSFX.SelectLine, 1);
          if (kb) {
            vw_SetKeyReleased(SDLK.KP_ENTER);
            vw_SetKeyReleased(SDLK.RETURN);
          }
        }
        if (Cur.CurrentProfile !== i) {
          if (vw_GetMouseLeftDoubleClick(true)) {
            Cur.CurrentProfile = i;
            ChangeGameConfig().LastProfile = i;
            Cur.CurrentMission = p.LastMission;
            M.command(Command.SWITCH_TO_MISSION);
          }
          if (Cur.CurrentProfile !== i) {
            vw_Draw2D(rect(X1 + 2, Y1 - 233 + 46 * i, X1 + 748, Y1 - 235 + 46 + 46 * i), s2, 'menu/whitepoint.tga', true, 0.1 * T);
          }
        } else if (vw_GetMouseLeftDoubleClick(true)) {
          M.command(Command.SWITCH_TO_MISSION);
        }
      }
    } else {
      vw_DrawText(X1 + 10, TmpY, 0, 0, 1, RGB.white, 0.3 * T, `${i + 1}.`);
      vw_DrawText(X1 + 50, TmpY, 0, 0, 1, RGB.white, 0.3 * T, vw_GetText('empty'));
    }
    TmpY += 46;
  }
  if (tmpSound === -1) P.SoundOnProfileID = -1;
  if (Cur.CurrentProfile !== -1) {
    vw_Draw2D(rect(X1 + 2, Y1 - 233 + 46 * Cur.CurrentProfile, X1 + 748, Y1 - 235 + 46 + 46 * Cur.CurrentProfile), s2, 'menu/whitepoint.tga', true, 0.1 * T);
  }
  Y1 += Prir1;
  const off = Cur.CurrentProfile < 0;
  if (DrawButton200_2(X1 + 6, Y1 - 6, vw_GetText('Duplicate'), T, off)) DuplicateRecord();
  if (DrawButton128_2(X1 + 240, Y1 - 6, vw_GetText('Delete'), T, Cur.CurrentProfile < 0)) SetCurrentDialogBox(DialogBox.DeleteProfile);
  if (DrawButton200_2(X1 + 544, Y1 - 6, vw_GetText('Difficulty'), T, Cur.CurrentProfile < 0)) M.command(Command.SWITCH_TO_DIFFICULTY);
  const Y = 165 + 100 * 5;
  if (DrawButton256(idiv(W(), 2) - 284, Y, vw_GetText('MAIN MENU'), T, M.buttons[10])) M.command(Command.SWITCH_TO_MAIN_MENU);
  if (DrawButton256(idiv(W(), 2) + 28, Y, vw_GetText('MISSION LIST'), T, M.buttons[11], Cur.CurrentProfile < 0)) M.command(Command.SWITCH_TO_MISSION);
}

// ---- difficulty

const OnOff = ['On', 'Off'];
const ArcadeSim = ['Sim', 'Arcade'];

export function DifficultyMenu(): void {
  const T = M.MenuContentTransp;
  const p = ChangeGameConfig().Profile[Cur.CurrentProfile];
  vw_Draw2D(rect(idiv(W(), 2) - 427, 160, idiv(W(), 2) + 432, 160 + 480), rect(2, 2, 861, 482), 'menu/panel800_444_back.tga', true, 0.9 * T);
  const X1 = idiv(W(), 2) - 372;
  let Y1 = 217;
  const upd = (): void => { ProfileDifficulty(Cur.CurrentProfile, DifficultyAction.Update); };
  const penalty = (label: string, key: 'EnemyWeaponPenalty' | 'EnemyArmorPenalty' | 'EnemyTargetingSpeedPenalty', max: number): void => {
    vw_DrawText(X1, Y1, -340, 0, 1, RGB.white, T, vw_GetText(label));
    if (DrawButton128_2(X1 + 616, Y1 - 6, vw_GetText('Harder'), T, p[key] === 1)) {
      p[key] = Math.max(1, p[key] - 1);
      upd();
    }
    if (DrawButton128_2(X1 + 360, Y1 - 6, vw_GetText('Easier'), T, p[key] === max)) {
      p[key] = Math.min(max, p[key] + 1);
      upd();
    }
    centered(p[key] === 1 ? vw_GetText('None') : `x${p[key]}`, X1 + 498, 110, 0, Y1, RGB.white, T);
    Y1 += 50;
  };
  penalty('Enemy Weapon Penalty', 'EnemyWeaponPenalty', 3);
  penalty('Enemy Armor Penalty', 'EnemyArmorPenalty', 4);
  penalty('Enemy Targeting Penalty', 'EnemyTargetingSpeedPenalty', 4);
  const toggle = (label: string, key: 'UnlimitedAmmo' | 'UndestroyableWeapon' | 'WeaponTargetingMode' | 'SpaceShipControlMode', names: string[], max: number): void => {
    vw_DrawText(X1, Y1, -340, 0, 1, RGB.white, T, vw_GetText(label));
    if (DrawButton128_2(X1 + 616, Y1 - 6, vw_GetText('Harder'), T, !p[key])) {
      p[key] = 0;
      upd();
    }
    if (DrawButton128_2(X1 + 360, Y1 - 6, vw_GetText('Easier'), T, !!p[key])) {
      p[key] = 1;
      upd();
    }
    centered(vw_GetText(names[p[key]]), X1 + 498, 110, max, Y1, RGB.white, T);
    Y1 += 50;
  };
  toggle('Limited Ammo', 'UnlimitedAmmo', OnOff, 0);
  toggle('Destroyable Weapon', 'UndestroyableWeapon', OnOff, 0);
  toggle('Weapon Targeting Mode', 'WeaponTargetingMode', ArcadeSim, 110);
  toggle('SpaceShip Control Mode', 'SpaceShipControlMode', ArcadeSim, 110);
  const s = `${vw_GetText('Current Profile Difficulty')}: ${ProfileDifficulty(Cur.CurrentProfile)}%`;
  vw_DrawText(idiv(W() - vw_TextWidth(s), 2), Y1, 0, 0, 1, RGB.yellow, T, s);
  if (DrawButton384(idiv(W(), 2) - 192, 175 + 95 * 5, vw_GetText('BACK'), T, M.buttons[1])) M.command(Command.SWITCH_TO_PROFILE);
}

// ---- missions

interface Mission { Title: string; Descr: string; TitleColor: Color; DescrColor: Color; Icon: string; File: string }
export const MS = {
  MissionList: [] as Mission[],
  SoundOnMissionID: -1,
  AllMission: 0,
  StartMission: 0,
  EndMission: 4,
  SliderUnderMouseControl: false,
};

export const GetCurrentMissionFileName = (): string =>
  (Cur.CurrentMission >= 0 && MS.MissionList.length > Cur.CurrentMission ? MS.MissionList[Cur.CurrentMission].File : '');

const COLORS: Record<number, Color> = {
  1: RGB.yellow, 2: RGB.red, 3: RGB.green, 4: RGB.orange, 5: { r: 0.5, g: 0.5, b: 0.5 }, 6: { r: 1, g: 0.3, b: 0 },
};

export function MissionListInit(): void {
  if (MS.MissionList.length) return;
  const doc = new XMLDocument(scriptFiles.get('script/list.xml') ?? '');
  const root = doc.root;
  if (!root || root.name !== 'AstroMenaceMissionList') return;
  for (const e of root.children) {
    const m: Mission = { Title: '', Descr: '', TitleColor: RGB.orange, DescrColor: RGB.white, Icon: '', File: '' };
    MS.MissionList.push(m);
    if (e.name !== 'Mission') continue;
    for (const t of e.children) {
      const c = XMLDocument.int(t, 'color');
      if (t.name === 'Title') {
        if (c !== undefined) m.TitleColor = COLORS[c] ?? RGB.white;
        m.Title = t.content;
      } else if (t.name === 'Descr') {
        if (c !== undefined) m.DescrColor = COLORS[c] ?? RGB.white;
        m.Descr = t.content;
      } else if (t.name === 'Icon') {
        m.Icon = t.content;
      } else if (t.name === 'File') {
        m.File = t.content;
      }
    }
  }
  MS.AllMission = MS.MissionList.length;
}

/** the list range around the current mission (menu.cpp SetMenu, command.cpp, game.cpp ExitGameWithSave) */
export function CenterMissionList(): void {
  MS.StartMission = 0;
  MS.EndMission = 4;
  const c = Cur.CurrentMission;
  if (c !== -1 && c > 2) {
    MS.StartMission = c - 2;
    MS.EndMission = c + 2;
    if (c >= MS.AllMission - 2) {
      MS.StartMission = MS.AllMission - 5;
      MS.EndMission = MS.AllMission - 1;
    }
  }
}

function startMissionFlow(): void {
  const p = GameConfig().Profile[Cur.CurrentProfile];
  if (p.MissionReplayCount[Cur.CurrentMission] > 0 && GameConfig().NeedShowHint[5]) {
    SetCurrentDialogBox(DialogBox.StartMissionSecondTime);
  } else {
    M.command(Command.SWITCH_TO_WORKSHOP);
    M.toWorkshopWeaponry();
  }
}

export function MissionMenu(): void {
  const T = M.MenuContentTransp;
  const C = ChangeGameConfig();
  const prof = C.Profile[Cur.CurrentProfile];
  if (prof.OpenLevelNum > MS.AllMission - 1) prof.OpenLevelNum = MS.AllMission - 1;
  vw_Draw2D(rect(idiv(W(), 2) - 427, 175 - 15, idiv(W(), 2) - 427 + 863 - 4, 175 - 15 + 484 - 4), rect(2, 2, 863 - 2, 484 - 2), 'menu/panel800_444_back.tga', true, 0.9 * T);
  const X1 = idiv(W(), 2) - 372;
  let Y1 = 270;
  const label = `${vw_GetText('Pilot Profile')}: `;
  const Size = vw_TextWidth(label);
  vw_DrawText(X1, 208 + 12, 0, 0, 1, RGB.green, T, label);
  if (Size + vw_TextWidth(prof.Name) > 500) {
    vw_DrawText(X1 + Size, 208 + 12, 0, 500 - Size, 1, RGB.white, T, prof.Name);
    vw_DrawText(X1 + 510, 208 + 12, 0, 0, 1, RGB.white, T, '...');
  } else {
    vw_DrawText(X1 + Size, 208 + 12, 0, 0, 1, RGB.white, T, prof.Name);
  }
  if (DrawButton200_2(X1 + 616 - 72, 212, vw_GetText('Change Profile'), T, false)) M.command(Command.SWITCH_TO_PROFILE);
  const s2 = rect(0, 0, 2, 2), bp = 'menu/blackpoint.tga', wp = 'menu/whitepoint.tga';
  vw_Draw2D(rect(X1 - 2, Y1 - 2, X1 + 2 + 710, Y1 + 2 + 320), s2, bp, true, 0.2 * T);
  vw_Draw2D(rect(X1, Y1, X1 + 710, Y1 + 320), s2, bp, true, 0.5 * T);
  const cm = Cur.CurrentMission;
  if (cm !== -1 && MS.StartMission <= cm && cm <= MS.EndMission) {
    const line = cm - MS.StartMission;
    vw_Draw2D(rect(X1 + 1, Y1 + 64 * line + 1, X1 + 709, Y1 + 64 * line + 63), s2, wp, true, 0.1 * T);
  }
  let tmpSound = -1;
  for (let i = MS.StartMission; i <= MS.EndMission; i++) {
    if (MS.AllMission <= i) continue;
    const m = MS.MissionList[i];
    const row = (a: number, full: boolean): void => {
      vw_Draw2D(full ? rect(X1, Y1, X1 + 64, Y1 + 64) : rect(X1 + 2, Y1 + 2, X1 + 62, Y1 + 62), rect(0, 0, 64, 64), m.Icon, true, a * T);
      vw_DrawText(X1 + 20 + 64, Y1 + 9, -610, 0, 1, m.TitleColor, a * T, vw_GetText(m.Title));
      vw_DrawText(X1 + 20 + 64, Y1 + 33, -610, 0, 1, m.DescrColor, a * T, vw_GetText(m.Descr));
    };
    if (i > prof.OpenLevelNum) row(0.3, false);
    if (i <= prof.OpenLevelNum) {
      if (T >= 0.99 && !isDialogBoxDrawing()) UI.CurrentActiveMenuElement++;
      const kb = UI.CurrentKeyboardSelectMenuElement > 0 && UI.CurrentKeyboardSelectMenuElement === UI.CurrentActiveMenuElement;
      if ((vw_MouseOverRect(rect(X1, Y1 + 1, X1 + 710, Y1 + 64)) || kb) && !isDialogBoxDrawing()) {
        tmpSound = i;
        SetCursorStatus(CursorStatus.ActionAllowed);
        if (MS.SoundOnMissionID !== i) {
          MS.SoundOnMissionID = i;
          if (UI.CurrentKeyboardSelectMenuElement === 0) audio.playMenuSFX(MenuSFX.OverLine, 1);
        }
        row(1, true);
        if (Cur.CurrentMission !== i) vw_Draw2D(rect(X1 + 64, Y1 + 1, X1 + 709, Y1 + 63), s2, wp, true, 0.1 * T);
        if (vw_GetMouseLeftClick(true) || (kb && (vw_GetKeyStatus(SDLK.KP_ENTER) || vw_GetKeyStatus(SDLK.RETURN)))) {
          Cur.CurrentMission = i;
          prof.LastMission = i;
          audio.playMenuSFX(MenuSFX.SelectLine, 1);
          if (kb) {
            vw_SetKeyReleased(SDLK.KP_ENTER);
            vw_SetKeyReleased(SDLK.RETURN);
          }
        }
        if (vw_GetMouseLeftDoubleClick(true)) {
          Cur.CurrentMission = i;
          prof.LastMission = i;
          startMissionFlow();
        }
      } else {
        row(0.8, false);
      }
    }
    Y1 += 64;
  }
  if (tmpSound === -1) MS.SoundOnMissionID = -1;
  Y1 = 270;
  if (DrawListUpButton(X1 + 718, Y1, T, !(MS.StartMission > 0))) {
    MS.StartMission--;
    MS.EndMission--;
  }
  if (DrawListDownButton(X1 + 718, Y1 + 320 - 32, T, !(MS.StartMission < MS.AllMission - 5))) {
    MS.StartMission++;
    MS.EndMission++;
  }
  if (vw_MouseOverRect(rect(X1, Y1, X1 + 750, Y1 + 320))) {
    if (vw_GetWheelStatus() !== 0 && !isDialogBoxDrawing()) {
      MS.StartMission += vw_GetWheelStatus();
      MS.EndMission += vw_GetWheelStatus();
      if (MS.StartMission < 0) {
        MS.StartMission = 0;
        MS.EndMission = 4;
      }
      if (MS.EndMission > MS.AllMission - 1) {
        MS.EndMission = MS.AllMission - 1;
        MS.StartMission = MS.EndMission - 4;
      }
      vw_ResetWheelStatus();
    }
  } else if (vw_GetWheelStatus() !== 0) {
    vw_ResetWheelStatus();
  }
  const k = (320 - 64) / MS.AllMission;
  const slider = rect(X1 + 750 - 32 + 4, Math.trunc(Y1 + 32 + k * MS.StartMission), X1 + 750 - 4, Math.trunc(Y1 + 32 + k * (MS.EndMission + 1)));
  vw_Draw2D(slider, rect(0, 0, 32, 32), wp, true, 0.3 * T);
  if (!MS.SliderUnderMouseControl && vw_MouseOverRect(slider) && vw_GetMouseLeftClick(false) && !isDialogBoxDrawing()) {
    MS.SliderUnderMouseControl = true;
    audio.playMenuSFX(MenuSFX.Click, 1);
  }
  const track = rect(X1 + 750 - 32 + 4, Y1 + 32, X1 + 750 - 4, Y1 + 32 + (320 - 64));
  if ((MS.SliderUnderMouseControl && (!vw_MouseOverRect(track) || !vw_GetMouseLeftClick(false))) || isDialogBoxDrawing()) MS.SliderUnderMouseControl = false;
  if (!vw_MouseOverRect(slider) && vw_MouseOverRect(track) && vw_GetMouseLeftClick(false) && !isDialogBoxDrawing()) {
    MS.SliderUnderMouseControl = true;
    audio.playMenuSFX(MenuSFX.Click, 1);
    mouse.leftClick = false;
  }
  if (vw_MouseOverRect(track)) SetCursorStatus(CursorStatus.ActionAllowed);
  if (MS.SliderUnderMouseControl) {
    const [, MouseY] = vw_GetMousePos();
    const pos = Math.trunc((MouseY - Y1 - 32) / k);
    MS.StartMission = 0;
    MS.EndMission = 4;
    if (pos > 2) {
      MS.StartMission = pos - 2;
      MS.EndMission = pos + 2;
      if (pos >= MS.AllMission - 2) {
        MS.StartMission = MS.AllMission - 5;
        MS.EndMission = MS.AllMission - 1;
      }
    }
  }
  const Y = 165 + 100 * 5;
  if (DrawButton256(idiv(W(), 2) - 284, Y, vw_GetText('MAIN MENU'), T, M.buttons[10])) M.command(Command.SWITCH_TO_MAIN_MENU);
  if (DrawButton256(idiv(W(), 2) + 28, Y, vw_GetText('NEXT'), T, M.buttons[11], !(Cur.CurrentMission >= 0))) startMissionFlow();
}
