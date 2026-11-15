// lw/dialog.ts: src/dialog.c: the menus' layout on a 320x240 virtual screen scaled to the real one, the
// quick buttons (Quit, Back, Play, Main), standard buttons, and the dialog loop (my_update_dialog sleeps
// 100 us per turn, as usleep(100) in the original).

import {
  type Dialog, type DialogPlayer, emptyDialog, init_dialog, shutdown_dialog, update_dialog, D_EXIT,
} from '../al/gui.ts';
import { clear_keybuf, install_keyboard, remove_keyboard } from '../al/keyboard.ts';
import { SCREEN_H, SCREEN_W } from '../al/screen.ts';
import { rest, usleep } from '../al/sys.ts';
import { display_back_image } from './back.ts';
import { lw_lang_string } from './lang.ts';
import { L } from './langids.ts';
import { my_button_proc, my_textbox_proc } from './alleg2.ts';
import { play_click } from './sound.ts';
import { my_exit_poll } from './exit.ts';
import {
  MENU_BG, MENU_FG, MENU_H_QUICK, MENU_H_SPACE, MENU_H_STANDARD, MENU_QUICK_BACK, MENU_QUICK_MAIN, MENU_QUICK_PLAY,
  MENU_QUICK_QUIT, MENU_VIRTUAL_H, MENU_VIRTUAL_W, MENU_W_QUICK, MENU_W_SPACE, MENU_W_STANDARD,
} from './state.ts';

export function menu_real_x(x: number): number {
  return Math.trunc((x * SCREEN_W()) / MENU_VIRTUAL_W);
}

export function menu_real_y(y: number): number {
  return Math.trunc((y * SCREEN_H()) / MENU_VIRTUAL_H);
}

export function menu_real_coord(d: Dialog): void {
  d.x = menu_real_x(d.x);
  d.y = menu_real_y(d.y);
  d.w = menu_real_x(d.w);
  d.h = menu_real_y(d.h);
}

function find_center(pos: number, num: number, space: number, size: number): number {
  let center = Math.trunc((size - num * space) / 2);
  center += pos * space + Math.trunc(space / 2);
  return center;
}

export function color_one_dialog(d: Dialog): void {
  d.fg = MENU_FG;
  d.bg = MENU_BG;
}

function center_one_dialog(d: Dialog, x: number, y: number, w: number, h: number): void {
  d.x = x - Math.trunc(w / 2);
  d.y = y - Math.trunc(h / 2);
  d.w = w;
  d.h = h;
}

export function quick_buttons(d: Dialog[]): void {
  d[MENU_QUICK_QUIT]!.dp = lw_lang_string(L.DIALOG_QUIT);
  d[MENU_QUICK_BACK]!.dp = lw_lang_string(L.DIALOG_BACK);
  d[MENU_QUICK_PLAY]!.dp = lw_lang_string(L.DIALOG_PLAY);
  d[MENU_QUICK_MAIN]!.dp = lw_lang_string(L.DIALOG_MAIN);
  d[MENU_QUICK_QUIT]!.key = 0x71;
  d[MENU_QUICK_BACK]!.key = 0x62;
  d[MENU_QUICK_PLAY]!.key = 0x68;
  d[MENU_QUICK_MAIN]!.key = 0x6d;
  d[MENU_QUICK_BACK]!.x = d[MENU_QUICK_QUIT]!.x = Math.trunc(MENU_W_SPACE / 2);
  d[MENU_QUICK_PLAY]!.x = d[MENU_QUICK_MAIN]!.x = MENU_VIRTUAL_W - 1 - Math.trunc(MENU_W_SPACE / 2) - MENU_W_QUICK;
  d[MENU_QUICK_BACK]!.y = d[MENU_QUICK_PLAY]!.y = Math.trunc(MENU_H_SPACE / 2);
  d[MENU_QUICK_QUIT]!.y = d[MENU_QUICK_MAIN]!.y = MENU_VIRTUAL_H - 1 - Math.trunc(MENU_H_SPACE / 2) - MENU_H_QUICK;
  for (let i = 0; i < 4; ++i) {
    const q = d[i]!;
    q.proc = my_button_proc;
    q.flags = D_EXIT;
    q.h = MENU_H_QUICK;
    q.w = MENU_W_QUICK;
    color_one_dialog(q);
    menu_real_coord(q);
  }
}

function button(d: Dialog, x_pos: number, y_pos: number, x_num: number, y_num: number, w: number): void {
  d.proc = my_button_proc;
  center_one_dialog(d, find_center(x_pos, x_num, w + MENU_W_SPACE, MENU_VIRTUAL_W),
    find_center(y_pos, y_num, MENU_H_STANDARD + MENU_H_SPACE, MENU_VIRTUAL_H), w, MENU_H_STANDARD);
  color_one_dialog(d);
  menu_real_coord(d);
  d.key = 0;
  d.dp = '';
  d.flags = D_EXIT;
}

export function standard_button(d: Dialog, x_pos: number, y_pos: number, x_num: number, y_num: number): void {
  button(d, x_pos, y_pos, x_num, y_num, MENU_W_STANDARD);
}

export function standard_small_button(d: Dialog, x_pos: number, y_pos: number, x_num: number, y_num: number): void {
  button(d, x_pos, y_pos, x_num, y_num, Math.trunc(MENU_W_STANDARD / 2));
}

export function standard_big_button(d: Dialog, x_pos: number, y_pos: number, x_num: number, y_num: number): void {
  button(d, x_pos, y_pos, x_num, y_num, MENU_W_STANDARD * 2);
}

export function main_message(d: Dialog, s: string): void {
  standard_big_button(d, 0, 0, 1, 1);
  d.dp = s;
  d.key = 0;
  d.proc = my_textbox_proc;
  d.flags = 0;
}

export function main_info(d: Dialog, s: string): void {
  color_one_dialog(d);
  d.proc = my_textbox_proc;
  d.dp = s;
  d.key = 0;
  d.flags = 0;
}

/** lw_keyboard_reset_hack (keyboard.c): the Unix version reinstalls the keyboard before every dialog */
export function lw_keyboard_reset_hack(): void {
  clear_keybuf();
  remove_keyboard();
  install_keyboard();
}

export async function my_init_dialog(d: Dialog[], f: number): Promise<DialogPlayer> {
  lw_keyboard_reset_hack();
  return init_dialog(d, f);
}

export async function my_update_dialog(player: DialogPlayer): Promise<boolean> {
  const result = await update_dialog(player);
  await my_exit_poll();
  await usleep(100);
  await rest(0);
  return result;
}

export async function my_do_dialog_no_clear(d: Dialog[], f: number): Promise<number> {
  const player = await my_init_dialog(d, f);
  while (await my_update_dialog(player));
  const result = await shutdown_dialog(player);
  play_click();
  return result;
}

export async function my_do_dialog(d: Dialog[], f: number): Promise<number> {
  display_back_image();
  return my_do_dialog_no_clear(d, f);
}

export async function display_center_message(s: string): Promise<void> {
  const d = [emptyDialog(), emptyDialog()];
  display_back_image();
  main_message(d[0]!, s);
  d[1]!.proc = null;
  const dp = await my_init_dialog(d, 0);
  await my_update_dialog(dp);
  await shutdown_dialog(dp);
}

export function slider_int(dp3: unknown, d2: number): number {
  (dp3 as { set(v: number): void }).set(d2);
  play_click();
  return 0;
}
