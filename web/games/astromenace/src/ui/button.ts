// AstroMenace 1.4.3 (Mikhail Kurinnoi, Viewizard; GPL-3.0-or-later), port of src/ui/cursor.cpp and
// src/menu/button.cpp: the cursor and the menu buttons, checkbox and list arrows. A button's
// fade state (ButTransp, Update) is passed by reference in the original; here it is a ButState.
// Changed for the browser by the freegames project, 2026.
import { rect, vw_Draw2D, vw_DrawText, vw_TextWidth, RGB, type Rect } from '../engine/draw2d.ts';
import {
  vw_GetKeyStatus, vw_GetMouseLeftClick, vw_GetMousePos, vw_GetTimeThread, vw_MouseOverRect, vw_SetKeyReleased,
} from '../engine/core.ts';
import { SDLK } from '../game/config.ts';
import { MenuSFX, audio } from '../game/globals.ts';

export const CursorStatus = { Undefined: 0, ActionAllowed: 1, ActionProhibited: 2, DraggingItem: 3 };

export const UI = {
  ShowGameCursor: true,
  CursorStatus: CursorStatus.Undefined,
  CursorBlinking: 1,
  CursorBlinkingLastTime: 0,
  DraggingItemIcon: null as string | null,
  /** keyboard control of the menus */
  CurrentActiveMenuElement: 0,
  CurrentKeyboardSelectMenuElement: 0,
  NeedPlayOnButtonSoundX: 0,
  NeedPlayOnButtonSoundY: 0,
  /** the workshop's drag and drop (menu_workshop_weaponry.cpp) */
  DragWeapon: false,
  /** dialog.cpp isDialogBoxDrawing */
  isDialogBoxDrawing: (): boolean => false,
};

export interface ButState { t: number; u: number }
export const butState = (): ButState => ({ t: 1, u: 0 });

export const SetCursorStatus = (s: number): void => { UI.CursorStatus = s; };
export const GetCursorStatus = (): number => UI.CursorStatus;
export const SetShowGameCursor = (b: boolean): void => { UI.ShowGameCursor = b; };
export const GetShowGameCursor = (): boolean => UI.ShowGameCursor;
export const SetCursorDraggingItemIcon = (t: string | null): void => { UI.DraggingItemIcon = t; };

export function CursorInit(): void {
  UI.CursorBlinkingLastTime = vw_GetTimeThread(0);
}

export function CursorUpdate(): void {
  SetCursorStatus(CursorStatus.Undefined);
  UI.CursorBlinking -= vw_GetTimeThread(0) - UI.CursorBlinkingLastTime;
  if (UI.CursorBlinking < 0.3) UI.CursorBlinking = 1;
  UI.CursorBlinkingLastTime = vw_GetTimeThread(0);
}

export function CursorDraw(): void {
  if (!UI.ShowGameCursor) return;
  const [MouseX, MouseY] = vw_GetMousePos();
  const Src = rect(0, 0, 64, 64);
  const Dst = rect(MouseX - 12, MouseY - 13, MouseX + 64 - 12, MouseY + 64 - 13);
  const shadow = 'menu/cursor_shadow.tga', front = 'menu/cursor.tga';
  switch (UI.CursorStatus) {
    case CursorStatus.Undefined:
      vw_Draw2D(Dst, Src, shadow, true);
      vw_Draw2D(Dst, Src, front, true, 0.8, 0, { r: 0.8, g: 0.7, b: 0 });
      break;
    case CursorStatus.ActionAllowed:
      vw_Draw2D(Dst, Src, shadow, true);
      vw_Draw2D(Dst, Src, front, true, UI.CursorBlinking, 0, RGB.green);
      break;
    case CursorStatus.ActionProhibited:
      vw_Draw2D(Dst, Src, shadow, true);
      vw_Draw2D(Dst, Src, front, true, UI.CursorBlinking, 0, { r: 1, g: 0.2, b: 0 });
      break;
    case CursorStatus.DraggingItem:
      if (UI.DraggingItemIcon) vw_Draw2D(rect(MouseX - 64, MouseY - 32, MouseX + 64, MouseY + 32), rect(0, 0, 128, 64), UI.DraggingItemIcon, true);
      vw_Draw2D(Dst, Src, shadow, true);
      vw_Draw2D(Dst, Src, front, true, 0.8, 0, RGB.green);
      break;
  }
}

const idiv = (a: number, b: number): number => Math.trunc(a / b);

function keyboardFocus(Transp: number): boolean {
  if (Transp >= 0.99 && !UI.isDialogBoxDrawing() && UI.ShowGameCursor) UI.CurrentActiveMenuElement++;
  return UI.CurrentKeyboardSelectMenuElement > 0 && UI.CurrentKeyboardSelectMenuElement === UI.CurrentActiveMenuElement;
}

function clicked(ON: boolean, InFocusByKeyboard: boolean, sound = true): boolean {
  if (GetCursorStatus() === CursorStatus.ActionAllowed && ON
    && (vw_GetMouseLeftClick(true) || (InFocusByKeyboard && (vw_GetKeyStatus(SDLK.KP_ENTER) || vw_GetKeyStatus(SDLK.RETURN))))) {
    if (sound) audio.playMenuSFX(MenuSFX.Click, 1);
    if (InFocusByKeyboard) {
      vw_SetKeyReleased(SDLK.KP_ENTER);
      vw_SetKeyReleased(SDLK.RETURN);
    }
    return true;
  }
  return false;
}

function prohibited(r: Rect, Transp: number): void {
  if (vw_MouseOverRect(r) && !UI.isDialogBoxDrawing() && Transp === 1 && !UI.DragWeapon) {
    SetCursorStatus(CursorStatus.ActionProhibited);
    if (vw_GetMouseLeftClick(true)) audio.playMenuSFX(MenuSFX.CanNotClick, 1);
  }
}

/** the hover fade of the big buttons */
function bigHover(over: Rect, InFocusByKeyboard: boolean, Transp: number, b: ButState, start: number): [boolean, number] {
  let ON = false;
  let IntTransp = Transp;
  if ((vw_MouseOverRect(over) || InFocusByKeyboard) && !UI.isDialogBoxDrawing() && UI.ShowGameCursor) {
    ON = true;
    if (Transp === 1) SetCursorStatus(CursorStatus.ActionAllowed);
    if (b.t === 1) {
      audio.playMenuSFX(MenuSFX.OverBigButton, 1);
      b.u = vw_GetTimeThread(0);
      b.t = start;
    }
    b.t -= 3 * (vw_GetTimeThread(0) - b.u);
    if (b.t < 0.6) b.t = 0.6;
    b.u = vw_GetTimeThread(0);
    IntTransp = b.t * Transp;
  } else {
    if (b.t < 1) {
      b.t += 3 * (vw_GetTimeThread(0) - b.u);
      if (b.t > 1) b.t = 1;
      b.u = vw_GetTimeThread(0);
    }
    IntTransp = b.t * Transp;
  }
  return [ON, IntTransp];
}

export function DrawButton384(X: number, Y: number, Text: string, Transp: number, b: ButState): boolean {
  const InFocusByKeyboard = keyboardFocus(Transp);
  const [ON, IntTransp] = bigHover(rect(X + 2, Y + 1, X + 384, Y + 63), InFocusByKeyboard, Transp, b, 0.99);
  vw_Draw2D(rect(X - 64 + 2, Y - 17 + 2, X - 64 + 512 - 2, Y - 17 + 96 - 2), rect(2, 2, 512 - 2, 96 - 2), 'menu/button384_back.tga', true, IntTransp);
  vw_Draw2D(rect(X, Y, X + 384, Y + 64), rect(0, 0, 384, 64), ON ? 'menu/button384_in.tga' : 'menu/button384_out.tga', true, Transp);
  let Size = vw_TextWidth(Text);
  let WScale = 0;
  if (Size > 310) {
    Size = 310;
    WScale = -310;
  }
  const SizeI = X + idiv(384 - Size, 2);
  vw_DrawText(SizeI, Y + 21, WScale, 0, 1, RGB.white, ON ? Transp : (0.7 * Transp) / 2, Text);
  return clicked(ON, InFocusByKeyboard);
}

export function DrawButton256(X: number, Y: number, Text: string, Transp: number, b: ButState, Off = false): boolean {
  if (Off || UI.DragWeapon) {
    vw_Draw2D(rect(X - 125 + 2, Y - 16 + 2, X - 125 + 512 - 2, Y - 16 + 96 - 2), rect(2, 2, 512 - 2, 96 - 2), 'menu/button256_back.tga', true, Transp);
    vw_Draw2D(rect(X, Y, X + 256, Y + 64), rect(0, 0, 256, 64), 'menu/button256_off.tga', true, Transp);
    const Size = vw_TextWidth(Text);
    vw_DrawText(X + idiv(256 - Size, 2), Y + 21, 0, 0, 1, RGB.white, (0.7 * Transp) / 2, Text);
    prohibited(rect(X + 2, Y + 1, X + 256, Y + 63), Transp);
    return false;
  }
  const InFocusByKeyboard = keyboardFocus(Transp);
  const [ON, IntTransp] = bigHover(rect(X + 2, Y + 1, X + 256, Y + 63), InFocusByKeyboard, Transp, b, 0.98);
  vw_Draw2D(rect(X - 125 + 2, Y - 16 + 2, X - 125 + 512 - 2, Y - 16 + 96 - 2), rect(2, 2, 512 - 2, 96 - 2), 'menu/button256_back.tga', true, IntTransp);
  vw_Draw2D(rect(X, Y, X + 256, Y + 64), rect(0, 0, 256, 64), ON ? 'menu/button256_in.tga' : 'menu/button256_out.tga', true, Transp);
  let Size = vw_TextWidth(Text);
  let WScale = 0;
  if (Size > 190) {
    Size = 190;
    WScale = -190;
  }
  vw_DrawText(X + idiv(256 - Size, 2), Y + 21, WScale, 0, 1, RGB.white, ON ? Transp : (0.7 * Transp) / 2, Text);
  return clicked(ON, InFocusByKeyboard);
}

function smallHover(mouse: Rect, X: number, Y: number, InFocusByKeyboard: boolean, Transp: number): boolean {
  if ((vw_MouseOverRect(mouse) || InFocusByKeyboard) && !UI.isDialogBoxDrawing() && UI.ShowGameCursor) {
    if (Transp === 1) SetCursorStatus(CursorStatus.ActionAllowed);
    if (UI.NeedPlayOnButtonSoundX !== X || UI.NeedPlayOnButtonSoundY !== Y) {
      audio.playMenuSFX(MenuSFX.OverSmallButton, 1);
      UI.NeedPlayOnButtonSoundX = X;
      UI.NeedPlayOnButtonSoundY = Y;
    }
    return true;
  }
  if (UI.NeedPlayOnButtonSoundX === X && UI.NeedPlayOnButtonSoundY === Y) {
    UI.NeedPlayOnButtonSoundX = 0;
    UI.NeedPlayOnButtonSoundY = 0;
  }
  return false;
}

function dialogButton(w: number, tw: number, name: string, X: number, Y: number, Text: string, Transp: number, Off: boolean, sound: boolean): boolean {
  const Src = rect(2, 2, w - 2, 64 - 2);
  const Dst = rect(X - 14 + 2, Y - 14 + 2, X + w - 14 - 2, Y + 64 - 14 - 2);
  const Mouse = rect(X, Y, X + w - 26, Y + 35);
  let Size = vw_TextWidth(Text);
  let WScale = 0;
  if (Size > tw) {
    Size = tw;
    WScale = -tw;
  }
  const SizeI = Dst.left + idiv(Src.right - Src.left - Size, 2);
  if (Off || UI.DragWeapon) {
    vw_Draw2D(Dst, Src, `menu/button_dialog${name}_off.tga`, true, Transp);
    vw_DrawText(SizeI, Y + 6, WScale, 0, 1, RGB.white, (0.7 * Transp) / 2, Text);
    prohibited(Mouse, Transp);
    return false;
  }
  const InFocusByKeyboard = keyboardFocus(Transp);
  const ON = smallHover(Mouse, X, Y, InFocusByKeyboard, Transp);
  vw_Draw2D(Dst, Src, ON ? `menu/button_dialog${name}_in.tga` : `menu/button_dialog${name}_out.tga`, true, Transp);
  vw_DrawText(SizeI, Y + 6, WScale, 0, 1, RGB.white, ON ? Transp : (0.7 * Transp) / 2, Text);
  return clicked(ON, InFocusByKeyboard, sound);
}

export const DrawButton200_2 = (X: number, Y: number, Text: string, Transp: number, Off: boolean): boolean =>
  dialogButton(230, 176, '200', X, Y, Text, Transp, Off, true);
export const DrawButton128_2 = (X: number, Y: number, Text: string, Transp: number, Off: boolean, SoundClick = true): boolean =>
  dialogButton(158, 108, '128', X, Y, Text, Transp, Off, SoundClick);

export function DrawCheckBox(X: number, Y: number, status: { v: boolean }, Text: string, Transp: number): void {
  const Size = vw_TextWidth(Text);
  let ON = false;
  const InFocusByKeyboard = keyboardFocus(Transp);
  if ((vw_MouseOverRect(rect(X + 4, Y + 4, X + 40 + 20 + Size, Y + 40 - 4)) || InFocusByKeyboard) && !UI.isDialogBoxDrawing() && UI.ShowGameCursor) {
    ON = true;
    if (Transp === 1) SetCursorStatus(CursorStatus.ActionAllowed);
  }
  const Src = rect(0, 0, 40, 38), Dst = rect(X, Y, X + 40, Y + 38);
  vw_DrawText(X + 40 + 20, Y + 8, 0, 0, 1, !ON || UI.DragWeapon ? RGB.white : RGB.orange, Transp, Text);
  vw_Draw2D(Dst, Src, 'menu/checkbox_main.tga', true, Transp);
  if (status.v) vw_Draw2D(Dst, Src, 'menu/checkbox_in.tga', true, Transp);
  if (GetCursorStatus() === CursorStatus.ActionAllowed && ON && !UI.DragWeapon
    && (vw_GetMouseLeftClick(true) || (InFocusByKeyboard && (vw_GetKeyStatus(SDLK.KP_ENTER) || vw_GetKeyStatus(SDLK.RETURN))))) {
    status.v = !status.v;
    audio.playMenuSFX(MenuSFX.Click, 1);
    if (InFocusByKeyboard) {
      vw_SetKeyReleased(SDLK.KP_ENTER);
      vw_SetKeyReleased(SDLK.RETURN);
    }
  }
}

function listButton(tex: string, X: number, Y: number, Transp: number, Off: boolean): boolean {
  const Src = rect(0, 0, 32, 32);
  const Mouse = rect(X, Y, X + 32, Y + 32);
  const small = rect(X + 2, Y + 2, X + 32 - 2, Y + 32 - 2);
  if (Off || UI.DragWeapon) {
    vw_Draw2D(small, Src, tex, true, 0.3 * Transp);
    prohibited(Mouse, Transp);
    return false;
  }
  const InFocusByKeyboard = keyboardFocus(Transp);
  const ON = smallHover(Mouse, X, Y, InFocusByKeyboard, Transp);
  if (!ON) vw_Draw2D(small, Src, tex, true, 0.3 * Transp);
  else vw_Draw2D(rect(X, Y, X + 32, Y + 32), Src, tex, true, Transp);
  return clicked(ON, InFocusByKeyboard);
}

export const DrawListUpButton = (X: number, Y: number, Transp: number, Off: boolean): boolean => listButton('menu/arrow_list_up.tga', X, Y, Transp, Off);
export const DrawListDownButton = (X: number, Y: number, Transp: number, Off: boolean): boolean => listButton('menu/arrow_list_down.tga', X, Y, Transp, Off);
