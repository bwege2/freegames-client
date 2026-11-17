// AstroMenace 1.4.3 (Mikhail Kurinnoi, Viewizard; GPL-3.0-or-later), port of src/menu/menu_options.cpp:
// the volumes and the brightness. The window settings (full screen, window size, VSync) belong to the
// browser here and are shown switched off; the advanced, interface and controls screens are not ported
// (README.md). Changed for the browser by the freegames project, 2026.
import { rect, vw_Draw2D, vw_DrawText, vw_TextWidth, RGB } from '../engine/draw2d.ts';
import { vw_GetMouseLeftClick, vw_GetText, vw_MouseOverRect } from '../engine/core.ts';
import { ChangeGameConfig, GameConfig } from '../game/config.ts';
import { MenuSFX, VoicePhrase, audio } from '../game/globals.ts';
import { CursorStatus, DrawButton128_2, DrawButton200_2, DrawButton384, SetCursorStatus } from '../ui/button.ts';
import { M } from './menus.ts';
import { MenuStatus, screens, setCommand } from './menu.ts';
import { GM, GameMenuStatus } from '../game/game.ts';
import { Command } from '../game/gameui.ts';

export const optionsHooks = { volumeChanged: (): void => {}, brightnessChanged: (): void => {} };

type Key = 'MusicVolume' | 'VoiceVolume' | 'SoundVolume' | 'Brightness';

function OptionsMenu(T: number, inGame: boolean): void {
  const C = ChangeGameConfig();
  const W = GameConfig().InternalWidth;
  vw_Draw2D(rect(0, 0, W, 768), rect(0, 0, 2, 2), 'menu/blackpoint.tga', true, 0.5 * T);
  const X1 = Math.trunc(W / 2) - 375;
  let Y1 = 65;
  const bar = (key: Key, min: number, click: () => void): void => {
    for (let i = 0; i < 10; i++) {
      const dst = rect(X1 + 443 + 16 * i, Y1 - 4, X1 + 443 + 16 + 16 * i, Y1 + 32 - 4);
      if (vw_MouseOverRect(dst)) {
        SetCursorStatus(CursorStatus.ActionAllowed);
        if (vw_GetMouseLeftClick(true)) {
          C[key] = Math.max(min, i + 1);
          click();
        }
      }
      vw_Draw2D(dst, rect(0, 0, 16, 32), C[key] > i ? 'menu/perc.tga' : 'menu/perc_none.tga', true, T);
    }
  };
  const row = (label: string, key: Key, min: number, sound: boolean, changed: () => void, click: () => void): void => {
    vw_DrawText(X1, Y1, -280, 0, 1, RGB.white, T, vw_GetText(label));
    if (DrawButton128_2(X1 + 300, Y1 - 6, vw_GetText('Decrease'), T, C[key] <= min, sound)) {
      C[key] = Math.max(min, C[key] - 1);
      changed();
    }
    if (DrawButton128_2(X1 + 616, Y1 - 6, vw_GetText('Increase'), T, C[key] >= 10, sound)) {
      C[key] = Math.min(10, C[key] + 1);
      changed();
    }
    bar(key, min, click);
    Y1 += 55;
  };
  row('Music Volume', 'MusicVolume', 0, true, () => optionsHooks.volumeChanged(), () => {
    optionsHooks.volumeChanged();
    audio.playMenuSFX(MenuSFX.Click, 1);
  });
  const voice = (): void => {
    optionsHooks.volumeChanged();
    audio.playVoicePhrase(VoicePhrase.Attention, 1);
  };
  row('Voice Volume', 'VoiceVolume', 0, false, voice, voice);
  row('Sound Effects Volume', 'SoundVolume', 0, true, () => optionsHooks.volumeChanged(), () => {
    optionsHooks.volumeChanged();
    audio.playMenuSFX(MenuSFX.Click, 1);
  });
  const off = (label: string, a: string, b: string, value: string): void => {
    vw_DrawText(X1, Y1, -280, 0, 1, RGB.white, T, vw_GetText(label));
    DrawButton128_2(X1 + 300, Y1 - 6, vw_GetText(a), T, true);
    DrawButton128_2(X1 + 616, Y1 - 6, vw_GetText(b), T, true);
    const v = vw_GetText(value);
    vw_DrawText(X1 + 438 + Math.trunc((170 - vw_TextWidth(v)) / 2), Y1, 0, 0, 1, RGB.white, T, v);
    Y1 += 55;
  };
  off('Full Screen', 'Off', 'On', 'Off');
  off('Window Size', 'Prev', 'Next', `${W}x768`);
  off('Sync to VBlank', 'Off', 'On', 'On');
  row('Brightness', 'Brightness', 1, true, () => optionsHooks.brightnessChanged(), () => {
    optionsHooks.brightnessChanged();
    audio.playMenuSFX(MenuSFX.Click, 1);
  });
  const Y = 165 + 100 * 4;
  DrawButton200_2(Math.trunc(W / 2) - 366, Y + 28, vw_GetText('Advanced'), T, true);
  DrawButton200_2(Math.trunc(W / 2) - 100, Y + 28, vw_GetText('Interface'), T, true);
  DrawButton200_2(Math.trunc(W / 2) + 166, Y + 28, vw_GetText('Config Controls'), T, true);
  const b = inGame ? GM.buttons[1] : M.buttons[10];
  if (DrawButton384(Math.trunc((W - 384) / 2), Y + 100, vw_GetText(inGame ? 'GAME MENU' : 'MAIN MENU'), T, b)) {
    if (inGame) GM.GameMenuStatus = GameMenuStatus.GAME_MENU;
    else setCommand(Command.SWITCH_TO_MAIN_MENU);
  }
}

screens.OptionsMenu = (status: number): void => {
  if (status === MenuStatus.OPTIONS) OptionsMenu(M.MenuContentTransp, false);
  else setCommand(Command.SWITCH_TO_OPTIONS);
};
screens.SetOptionsMenu = (): void => {};
GM.optionsMenu = (status: number, T: number): void => {
  if (status === GameMenuStatus.OPTIONS) OptionsMenu(T, true);
  else GM.GameMenuStatus = GameMenuStatus.OPTIONS;
};

/** the Information screen is not ported: only its way back (README.md) */
screens.InformationMenu = (): void => {
  const W = GameConfig().InternalWidth;
  if (DrawButton384(Math.trunc((W - 384) / 2), 165 + 100 * 5, vw_GetText('MAIN MENU'), M.MenuContentTransp, M.buttons[10])) {
    setCommand(Command.SWITCH_TO_MAIN_MENU);
  }
};
