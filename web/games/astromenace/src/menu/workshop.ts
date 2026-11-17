// AstroMenace 1.4.3 (Mikhail Kurinnoi, Viewizard; GPL-3.0-or-later), port of the frame of
// src/menu/menu_workshop.cpp (WorkshopMenu: BACK, the three shop tabs, START). The shops themselves
// (menu_workshop_shipyard.cpp, menu_workshop_workshop.cpp, menu_workshop_weaponry.cpp) are not ported
// yet: their tabs are shown switched off (README.md). Changed for the browser by the freegames project, 2026.
import { vw_GetText, vw_GetTimeThread } from '../engine/core.ts';
import { GameConfig } from '../game/config.ts';
import { DrawButton128_2, DrawButton200_2, UI } from '../ui/button.ts';
import { DialogBox, SetCurrentDialogBox, dialogHooks } from './dialog.ts';
import { M } from './menus.ts';
import { StartMissionFromMenu, screens, setCommand } from './menu.ts';
import { Command } from '../game/gameui.ts';

export const WS = { CurrentWorkshop: 3, CanDrawWorkshop: false, LastTime: 0 };

function resetDrag(): void {
  UI.DragWeapon = false;
}
dialogHooks.resetDrag = resetDrag;
dialogHooks.startMissionSecondTime = (): void => {
  setCommand(Command.SWITCH_TO_WORKSHOP);
  WorkshopCreate();
};
M.toWorkshopWeaponry = (): void => {
  WS.CurrentWorkshop = 3;
  WorkshopCreate();
};

export function WorkshopCreate(): void {
  WS.CanDrawWorkshop = true;
  WS.LastTime = vw_GetTimeThread(0);
}

function WorkshopMenu(): void {
  const T = M.MenuContentTransp;
  const W = GameConfig().InternalWidth;
  const Y = 180 + 100 * 5;
  if (DrawButton128_2(Math.trunc(W / 2) - 482, Y, vw_GetText('BACK'), T, false)) {
    setCommand(Command.SWITCH_TO_MISSION);
    WS.CanDrawWorkshop = false;
    resetDrag();
  }
  DrawButton200_2(Math.trunc(W / 2) - 320, Y, vw_GetText('Shipyard'), T, true);
  DrawButton200_2(Math.trunc(W / 2) - 100, Y, vw_GetText('Workshop'), T, true);
  DrawButton200_2(Math.trunc(W / 2) + 120, Y, vw_GetText('Weaponry'), T, true);
  if (DrawButton128_2(Math.trunc(W / 2) + 354, Y, vw_GetText('START'), T, false)) {
    if (GameConfig().NeedShowHint[4]) {
      SetCurrentDialogBox(DialogBox.ShortkeyTipsAndTricks);
    } else {
      M.MenuContentTransp = 0.98;
      resetDrag();
      StartMissionFromMenu();
    }
  }
}

screens.WorkshopMenu = WorkshopMenu;
screens.WorkshopDestroyData = (): void => {};
screens.WorkshopShowHint = (): void => {};
