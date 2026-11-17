// AstroMenace 1.4.3 (Mikhail Kurinnoi, Viewizard; GPL-3.0-or-later), port of src/menu/dialog.cpp: the
// dialog boxes (questions, errors, the tips). The workshop's information boxes are in workshop code.
// "Quit" leaves to the website. Changed for the browser by the freegames project, 2026.
import { rect, vw_Draw2D, vw_DrawText, vw_TextWidth, vw_SetFontSize, RGB } from '../engine/draw2d.ts';
import {
  vw_GetKeyStatus, vw_GetMouseLeftClick, vw_GetText, vw_GetTimeThread, vw_MouseOverRect, vw_SetKeyReleased,
} from '../engine/core.ts';
import { ChangeGameConfig, Cur, GameConfig, SDLK } from '../game/config.ts';
import { MenuSFX, audio } from '../game/globals.ts';
import { CursorStatus, GetCursorStatus, GetShowGameCursor, SetCursorStatus, UI } from '../ui/button.ts';
import { TIPS } from './tips.ts';

export const DialogBox = {
  None: 0, QuitFromGame: 1, ProfileCreationError: 2, DeleteProfile: 3, RepairShip: 4, QuitNoSave: 5, QuiToMenuNoSave: 6,
  RestartLevelNoSave: 7, ShowShipInfo: 8, ShowWeaponsInfo: 9, ShowSystemsInfo: 10, ProfileTipsAndTricks: 11,
  ShipyardTipsAndTricks: 12, SystemsTipsAndTricks: 13, WeaponryTipsAndTricks: 14, ShortkeyTipsAndTricks: 15,
  StartMissionSecondTime: 16, ChoseLanguage: 17, RestartOnAdvOptChanged: 18,
};

export const D = {
  Current: DialogBox.None,
  LastDialogUpdateTime: 0,
  DialogContentTransp: 0,
  NeedShowDialog: false,
  NeedHideDialog: false,
  StartHideTransp: 1,
  NeedPlayX: 0,
  NeedPlayY: 0,
};

/** what the dialogs do in other parts of the game */
export const dialogHooks = {
  quit: (): void => {},
  exitGame: (_cmd: number): void => {},
  deleteRecord: (): void => {},
  startMission: (): void => {},
  startMissionSecondTime: (): void => {},
  resetDrag: (): void => {},
  /** the workshop's information boxes (ShowShipInfo, ShowWeaponsInfo, ShowSystemsInfo): X, Y, title offset, button offset */
  drawInfo: (_box: number, _X: number, _Y: number, _TitleOffset: number, _ButtonOffset: number, _transp: number): void => {},
};

export const isDialogBoxDrawing = (): boolean => D.Current !== DialogBox.None;
UI.isDialogBoxDrawing = isDialogBoxDrawing;

export function InitDialogBoxes(): void {
  D.LastDialogUpdateTime = 0;
  D.DialogContentTransp = 0;
  D.NeedShowDialog = false;
  D.NeedHideDialog = false;
  D.StartHideTransp = 1;
  D.Current = DialogBox.None;
}

export function SetCurrentDialogBox(box: number): void {
  if (isDialogBoxDrawing()) return;
  D.Current = box;
  D.LastDialogUpdateTime = vw_GetTimeThread(0);
  D.DialogContentTransp = 0;
  D.NeedShowDialog = true;
  D.NeedHideDialog = false;
  D.StartHideTransp = 1;
  dialogHooks.resetDrag();
  vw_GetMouseLeftClick(true);
}

export function CloseDialog(): void {
  D.StartHideTransp = D.DialogContentTransp;
  D.NeedShowDialog = false;
  D.NeedHideDialog = true;
  D.LastDialogUpdateTime = vw_GetTimeThread(0);
}

function keyboard(Transp: number): boolean {
  if (Transp >= 0.99) UI.CurrentActiveMenuElement++;
  return UI.CurrentKeyboardSelectMenuElement > 0 && UI.CurrentKeyboardSelectMenuElement === UI.CurrentActiveMenuElement;
}

function dialogButton(w: number, tw: number, name: string, X: number, Y: number, Text: string, Transp: number): boolean {
  const kb = keyboard(Transp);
  let ON = false;
  if (vw_MouseOverRect(rect(X, Y, X + w - 26, Y + 35)) || kb) {
    ON = true;
    if (Transp === 1) SetCursorStatus(CursorStatus.ActionAllowed);
    if (D.NeedPlayX !== X || D.NeedPlayY !== Y) {
      audio.playMenuSFX(MenuSFX.OverSmallButton, 1);
      D.NeedPlayX = X;
      D.NeedPlayY = Y;
    }
  } else if (D.NeedPlayX === X && D.NeedPlayY === Y) {
    D.NeedPlayX = 0;
    D.NeedPlayY = 0;
  }
  const Src = rect(2, 2, w - 2, 64 - 2);
  const Dst = rect(X - 14 + 2, Y - 14 + 2, X + w - 14 - 2, Y + 64 - 14 - 2);
  vw_Draw2D(Dst, Src, `menu/button_dialog${name}_${ON ? 'in' : 'out'}.tga`, true, 0.8 * Transp);
  let Size = vw_TextWidth(Text);
  let WScale = 0;
  if (Size > tw) {
    Size = tw;
    WScale = -tw;
  }
  const SizeI = Dst.left + Math.trunc((Src.right - Src.left - Size) / 2);
  vw_DrawText(SizeI, Y + 6, WScale, 0, 1, RGB.white, ON ? Transp : (0.7 * Transp) / 2, Text);
  // NOTE as the original: any click while the cursor shows "allowed" counts for every dialog button drawn after it
  if (GetCursorStatus() === CursorStatus.ActionAllowed
    && (vw_GetMouseLeftClick(true) || (kb && (vw_GetKeyStatus(SDLK.KP_ENTER) || vw_GetKeyStatus(SDLK.RETURN))))) {
    audio.playMenuSFX(MenuSFX.Click, 1);
    if (kb) {
      vw_SetKeyReleased(SDLK.KP_ENTER);
      vw_SetKeyReleased(SDLK.RETURN);
    }
    return true;
  }
  return false;
}
export const DrawDialogButton200 = (X: number, Y: number, T: string, Tr: number): boolean => dialogButton(230, 176, '200', X, Y, T, Tr);
export const DrawDialogButton128 = (X: number, Y: number, T: string, Tr: number): boolean => dialogButton(158, 108, '128', X, Y, T, Tr);

function DrawCheckBox_2(X: number, Y: number, status: { v: boolean }, Text: string, Transp: number): void {
  const Size = vw_TextWidth(Text);
  let ON = false;
  if (Transp >= 0.99 && GetShowGameCursor()) UI.CurrentActiveMenuElement++;
  const kb = UI.CurrentKeyboardSelectMenuElement > 0 && UI.CurrentKeyboardSelectMenuElement === UI.CurrentActiveMenuElement;
  if ((vw_MouseOverRect(rect(X + 4, Y + 4, X + 40 + 20 + Size, Y + 40 - 4)) || kb) && GetShowGameCursor()) {
    ON = true;
    if (Transp === 1) SetCursorStatus(CursorStatus.ActionAllowed);
  }
  const Src = rect(0, 0, 40, 38), Dst = rect(X, Y, X + 40, Y + 38);
  vw_DrawText(X + 40 + 16, Y + 8, 0, 0, 1, !ON || UI.DragWeapon ? RGB.white : RGB.orange, Transp, Text);
  vw_Draw2D(Dst, Src, 'menu/checkbox_main.tga', true, Transp);
  if (status.v) vw_Draw2D(Dst, Src, 'menu/checkbox_in.tga', true, Transp);
  if (GetCursorStatus() === CursorStatus.ActionAllowed && !UI.DragWeapon
    && (vw_GetMouseLeftClick(true) || (kb && (vw_GetKeyStatus(SDLK.KP_ENTER) || vw_GetKeyStatus(SDLK.RETURN))))) {
    status.v = !status.v;
    audio.playMenuSFX(MenuSFX.Click, 1);
    if (kb) {
      vw_SetKeyReleased(SDLK.KP_ENTER);
      vw_SetKeyReleased(SDLK.RETURN);
    }
  }
}

const idiv = (a: number, b: number): number => Math.trunc(a / b);

/** a question or message box of 512x256: title, two lines, buttons */
function simple(X: number, Y: number, W: number, TitleOffset: number, title: string, line1: string, line2: string): void {
  const t = D.DialogContentTransp;
  const WTitle = 234;
  vw_DrawText(X + 17 + idiv(WTitle - vw_TextWidth(vw_GetText(title)), 2), Y + TitleOffset, 0, 0, 1, RGB.white, 0.7 * t, vw_GetText(title));
  const line = (s: string, y: number, c: typeof RGB.white, a: number): void => {
    const w = vw_TextWidth(vw_GetText(s));
    if (w > 470) vw_DrawText(X + idiv(W - 470, 2), Y + y, -470, 0, 1, c, a, vw_GetText(s));
    else vw_DrawText(X + idiv(W - w, 2), Y + y, 0, 0, 1, c, a, vw_GetText(s));
  };
  line(line1, 100, RGB.yellow, t);
  line(line2, 130, RGB.white, 0.5 * t);
}

const TIP_HINT: Record<number, [string, number]> = {
  [DialogBox.ProfileTipsAndTricks]: ['ProfileTipsAndTricks', 0],
  [DialogBox.ShipyardTipsAndTricks]: ['ShipyardTipsAndTricks', 1],
  [DialogBox.SystemsTipsAndTricks]: ['SystemsTipsAndTricks', 2],
  [DialogBox.WeaponryTipsAndTricks]: ['WeaponryTipsAndTricks', 3],
  [DialogBox.ShortkeyTipsAndTricks]: ['ShortkeyTipsAndTricks', 4],
  [DialogBox.StartMissionSecondTime]: ['StartMissionSecondTime', 5],
};

export function DrawDialogBox(): void {
  if (D.NeedHideDialog) {
    D.DialogContentTransp = D.StartHideTransp - 3 * (vw_GetTimeThread(0) - D.LastDialogUpdateTime);
    if (D.DialogContentTransp <= 0) D.Current = DialogBox.None;
  }
  if (D.NeedShowDialog && D.DialogContentTransp < 1) {
    D.DialogContentTransp = 3 * (vw_GetTimeThread(0) - D.LastDialogUpdateTime);
    if (D.DialogContentTransp >= 1) {
      D.DialogContentTransp = 1;
      D.NeedShowDialog = false;
      D.LastDialogUpdateTime = vw_GetTimeThread(0);
    }
  }
  if (!isDialogBoxDrawing()) return;
  const box = D.Current;
  const t = D.DialogContentTransp;
  let type = 0;
  if (box === DialogBox.ShowShipInfo || box === DialogBox.ShowWeaponsInfo || box === DialogBox.ShowSystemsInfo) type = 1;
  if (TIP_HINT[box]) type = 2;
  const W = type === 0 ? 512 : type === 1 ? 512 : 768;
  const H = type === 0 ? 256 : type === 1 ? 512 : 600;
  const IW = GameConfig().InternalWidth;
  const X = idiv(IW - W, 2);
  const Y = idiv(768 - H, 2);
  vw_Draw2D(rect(0, 0, IW, 768), rect(0, 0, 2, 2), 'menu/blackpoint.tga', true, 0.6 * t);
  if (type === 0) vw_Draw2D(rect(X + 2 - 30, Y + 2 - 30, X + 572 - 2 - 30, Y + 316 - 2 - 30), rect(2, 2, 572 - 2, 316 - 2), 'menu/dialog512_256.tga', true, t);
  else if (type === 1) vw_Draw2D(rect(X + 4 - 30, Y + 2 - 30, X + 564 - 30, Y + 564 - 2 - 30), rect(2, 2, 564 - 2, 564 - 2), 'menu/dialog512_512.tga', true, t);
  else vw_Draw2D(rect(X + 2 - 30, Y + 2 - 30, X + 828 - 2 - 30, Y + 659 - 2 - 30), rect(2, 2, 828 - 2, 659 - 2), 'menu/dialog768_600.tga', true, t);
  const TitleOffset = type === 1 ? 20 : 25;
  const ButtonOffset = type === 0 ? 190 : type === 1 ? 256 + 190 : 256 + 88 + 190;
  const yesNo = (yes: () => void): void => {
    if (DrawDialogButton128(X + 94, Y + ButtonOffset, vw_GetText('YES'), t)) {
      yes();
      CloseDialog();
    }
    if (DrawDialogButton128(X + 256 + 34, Y + ButtonOffset, vw_GetText('NO'), t)) CloseDialog();
  };
  switch (box) {
    case DialogBox.QuitFromGame:
      simple(X, Y, W, TitleOffset, 'QUIT', 'Are you sure you want to quit?', 'Note: all game data will be saved.');
      yesNo(() => dialogHooks.quit());
      break;
    case DialogBox.ProfileCreationError:
      simple(X, Y, W, TitleOffset, 'ERROR', 'Cannot create a Pilot Profile.', 'Tip: you should clear one line first.');
      if (DrawDialogButton200(X + 128 + 64 - 36, Y + ButtonOffset, vw_GetText('CLOSE'), t)) CloseDialog();
      break;
    case DialogBox.DeleteProfile:
      simple(X, Y, W, TitleOffset, 'DELETE', 'Are you sure you want to delete the Profile?', 'Note: all Pilot Profile data will be lost.');
      yesNo(() => {
        dialogHooks.deleteRecord();
        if (Cur.CurrentProfile !== -1) Cur.CurrentMission = GameConfig().Profile[Cur.CurrentProfile].LastMission;
      });
      break;
    case DialogBox.RepairShip:
      simple(X, Y, W, TitleOffset, 'REPAIR', 'Not enough money for a full hull repair.', 'Note: Repair has been limited by money.');
      if (DrawDialogButton128(X + 192, Y + ButtonOffset, vw_GetText('OK'), t)) CloseDialog();
      break;
    case DialogBox.QuitNoSave:
      simple(X, Y, W, TitleOffset, 'QUIT', 'Are you sure you want to quit?', 'Note: the current game data will be lost.');
      yesNo(() => dialogHooks.quit());
      break;
    case DialogBox.QuiToMenuNoSave:
      simple(X, Y, W, TitleOffset, 'QUIT', 'Are you sure you want to quit?', 'Note: the current game data will be lost.');
      yesNo(() => dialogHooks.exitGame(15));
      break;
    case DialogBox.RestartLevelNoSave:
      simple(X, Y, W, TitleOffset, 'RESTART', 'Are you sure you want to restart the game?', 'Note: the current game data will be lost.');
      yesNo(() => dialogHooks.exitGame(13));
      break;
    case DialogBox.ShowShipInfo:
    case DialogBox.ShowWeaponsInfo:
    case DialogBox.ShowSystemsInfo:
      dialogHooks.drawInfo(box, X, Y, TitleOffset, ButtonOffset, t);
      break;
    case DialogBox.ChoseLanguage:
    case DialogBox.RestartOnAdvOptChanged:
      CloseDialog();
      break;
    default: {
      const tip = TIP_HINT[box];
      if (!tip) break;
      const WTitle = 234;
      const tt = vw_GetText('Tips and hints');
      const s1 = vw_TextWidth(tt);
      vw_DrawText(X + (s1 > 210 ? 17 + idiv(WTitle - 210, 2) : 17 + idiv(WTitle - s1, 2)), Y + TitleOffset, s1 > 210 ? -210 : 0, 0, 1, RGB.white, 0.7 * t, tt);
      for (const [x, y, mode, measure, a, text] of TIPS[tip[0]]) {
        const s = vw_GetText(text);
        const xx = x === 'SizeI' ? idiv(W - vw_TextWidth(s), 2) : Number(x);
        let sw = -716;
        if (mode === 'j') sw = vw_TextWidth(measure ? vw_GetText(measure) : s) > 716 ? -716 : 716;
        vw_DrawText(X + xx, Y + y, sw, 0, 1, RGB.white, a * t, s);
      }
      if (box === DialogBox.StartMissionSecondTime) {
        const p = GameConfig().Profile[Cur.CurrentProfile];
        vw_DrawText(X + 25, Y + 80 + 30, -716, 0, 1, RGB.white, t, `${vw_GetText('Your previous best result:')} ${p.ByMissionExperience[Cur.CurrentMission]}`);
      }
      const hint = { v: !GameConfig().NeedShowHint[tip[1]] };
      DrawCheckBox_2(X + 36, Y + ButtonOffset, hint, vw_GetText('Do not show this tip again.'), t);
      ChangeGameConfig().NeedShowHint[tip[1]] = !hint.v;
      if (box === DialogBox.ShortkeyTipsAndTricks) {
        if (DrawDialogButton128(X + 512 + 90, Y + ButtonOffset, vw_GetText('START'), t)) {
          dialogHooks.startMission();
          CloseDialog();
        }
      } else if (DrawDialogButton200(X + 512 + 90 - 72, Y + ButtonOffset, vw_GetText('CLOSE'), t)) {
        CloseDialog();
        if (box === DialogBox.StartMissionSecondTime) dialogHooks.startMissionSecondTime();
      }
    }
  }
  if (vw_GetKeyStatus(SDLK.ESCAPE)) {
    CloseDialog();
    vw_SetKeyReleased(SDLK.ESCAPE);
  }
  void vw_SetFontSize;
}
