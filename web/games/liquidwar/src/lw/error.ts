// lw/error.ts: src/error.c: error messages in a box, closed by Space, Enter or Escape.

import { D_CLOSE, D_O_K, D_USED_CHAR, type Dialog, dialogArray, MSG_KEY, MSG_START, MSG_XCHAR } from '../al/gui.ts';
import { KEY_ENTER, KEY_ESC } from '../al/keyboard.ts';
import { my_textbox_proc } from './alleg2.ts';
import { color_one_dialog, menu_real_coord, my_do_dialog } from './dialog.ts';
import { lw_lang_string } from './lang.ts';
import { L } from './langids.ts';
import { MENU_VIRTUAL_H, MENU_VIRTUAL_W } from './state.ts';

/** Allegro's d_keyboard_proc */
export async function d_keyboard_proc(msg: number, d: Dialog, c: number): Promise<number> {
  let ret = D_O_K;
  switch (msg) {
    case MSG_START:
      d.w = d.h = 0;
      break;
    case MSG_XCHAR:
      if (c >> 8 !== d.d1 && c >> 8 !== d.d2) break;
      ret |= D_USED_CHAR;
      ret |= await (d.dp as () => number | Promise<number>)();
      break;
    case MSG_KEY:
      ret |= await (d.dp as () => number | Promise<number>)();
      break;
  }
  return ret;
}

export async function standard_error(s: string): Promise<number> {
  const d = dialogArray(3);
  color_one_dialog(d[0]!);
  d[0]!.proc = my_textbox_proc;
  d[0]!.d2 = 0;
  d[0]!.dp = s;
  d[0]!.key = 0;
  d[0]!.flags = 0;
  d[0]!.x = Math.trunc(MENU_VIRTUAL_W / 4);
  d[0]!.y = Math.trunc((3 * MENU_VIRTUAL_H) / 8);
  d[0]!.w = Math.trunc(MENU_VIRTUAL_W / 2);
  d[0]!.h = Math.trunc(MENU_VIRTUAL_H / 4);
  menu_real_coord(d[0]!);
  d[1]!.proc = d_keyboard_proc;
  d[1]!.dp = () => D_CLOSE;
  d[1]!.key = 32;
  d[1]!.d1 = KEY_ENTER;
  d[1]!.d2 = KEY_ESC;
  d[2]!.proc = null;
  await my_do_dialog(d, 0);
  return 0;
}

export const error_not_enough_teams = (): Promise<number> => standard_error(lw_lang_string(L.ERROR_NOTENOUGHTEAMS));
export const error_not_enough_big_data = (): Promise<number> => standard_error(lw_lang_string(L.ERROR_NOTENOUGHBIGDATA));
export const error_network_problem = (): Promise<number> => standard_error(lw_lang_string(L.ERROR_NETWORKPROBLEM));
export const error_unable_to_connect = (): Promise<number> => standard_error(lw_lang_string(L.ERROR_UNABLETOCONNECT));
export const error_server_full = (): Promise<number> => standard_error(lw_lang_string(L.ERROR_SERVERFULL));
export const error_bad_config_range = (): Promise<number> => standard_error(lw_lang_string(L.ERROR_BADCONFIGRANGE));
export const error_cant_receive_map = (): Promise<number> => standard_error(lw_lang_string(L.ERROR_CANTRECEIVEMAP));
