// lw/level.ts: src/level.c: the map menu: the map, its wall and floor textures or colours (sliders, +/-,
// number fields, two palettes of 128 plain colours), "use default texture", "random map", a preview.

import { stretch_blit } from '../al/bitmap.ts';
import {
  broadcast_dialog_message, D_CLOSE, D_DISABLED, D_EXIT, D_GOTFOCUS, D_HIDDEN, D_O_K, D_SELECTED, D_WANTFOCUS,
  type Dialog, dialogArray, d_box_proc, dotted_rect, gui_get_screen, gui_mg_color, gui_textout_ex, MSG_CLICK, MSG_DRAW,
  MSG_IDLE, MSG_KEY, MSG_WANTFOCUS, object_message, shutdown_dialog,
} from '../al/gui.ts';
import { hline, rect, rectfill, vline } from '../al/bitmap.ts';
import { font, text_height } from '../al/font.ts';
import { gui_mouse_b, gui_mouse_x, gui_mouse_y } from '../al/mouse.ts';
import { makecol } from '../al/palette.ts';
import { screenRef } from '../al/screen.ts';
import { CharBuf, my_button_proc, my_edit_proc, my_slider_proc, my_textbox_proc, str } from './alleg2.ts';
import { display_back_image } from './back.ts';
import { MIN_MAP_RES_H, MIN_MAP_RES_W } from './core.ts';
import { color_one_dialog, menu_real_coord, menu_real_x, menu_real_y, my_do_dialog_no_clear, my_init_dialog, my_update_dialog, quick_buttons } from './dialog.ts';
import { lw_lang_string } from './lang.ts';
import { L } from './langids.ts';
import { lw_map_get_readable_name, lw_map_get_res } from './map.ts';
import { lw_maptex_create_bg, lw_maptex_create_fg, lw_maptex_create_map, lw_maptex_is_custom_texture_used, lw_maptex_set_bg_palette, lw_maptex_set_fg_palette } from './maptex.ts';
import { confirm_quit } from './menu.ts';
import { my_set_palette, set_palette_for_choose_color } from './palette.ts';
import { play_click } from './sound.ts';
import {
  CHOOSE_COLOR_NUMBER, G, MENU_BG, MENU_EXIT, MENU_FG, MENU_H_LEVEL, MENU_H_SAMPLE, MENU_H_SPACE, MENU_PLAY,
  MENU_QUICK_BACK, MENU_QUICK_MAIN, MENU_QUICK_PLAY, MENU_QUICK_QUIT, MENU_TOP, MENU_VIRTUAL_H, MENU_VIRTUAL_W,
  MENU_W_LEVEL, MENU_W_SAMPLE, MENU_W_SPACE,
} from './state.ts';

const BUFFER_EDIT_NUMBER = 33;

export const levelHooks = {
  /** lw_random_generate_map (random.c with the lwmapgen program): true when a map was made */
  random_map: null as (() => Promise<boolean>) | null,
};

/** Allegro's d_button_proc (guiproc.c) */
async function d_button_proc(msg: number, d: Dialog, c: number): Promise<number> {
  void c;
  const gui_bmp = gui_get_screen();
  switch (msg) {
    case MSG_DRAW: {
      let g, state1, state2;
      if (d.flags & D_SELECTED) {
        g = 1;
        state1 = d.bg;
        state2 = d.flags & D_DISABLED ? gui_mg_color : d.fg;
      } else {
        g = 0;
        state1 = d.flags & D_DISABLED ? gui_mg_color : d.fg;
        state2 = d.bg;
      }
      rectfill(gui_bmp, d.x + 1 + g, d.y + 1 + g, d.x + d.w - 3 + g, d.y + d.h - 3 + g, state2);
      rect(gui_bmp, d.x + g, d.y + g, d.x + d.w - 2 + g, d.y + d.h - 2 + g, state1);
      gui_textout_ex(gui_bmp, str(d.dp), d.x + Math.trunc(d.w / 2) + g, d.y + Math.trunc(d.h / 2) - Math.trunc(text_height(font) / 2) + g, state1, -1, true);
      if (d.flags & D_SELECTED) {
        vline(gui_bmp, d.x, d.y, d.y + d.h - 2, d.bg);
        hline(gui_bmp, d.x, d.y, d.x + d.w - 2, d.bg);
      } else {
        const black = makecol(0, 0, 0);
        vline(gui_bmp, d.x + d.w - 1, d.y + 1, d.y + d.h - 2, black);
        hline(gui_bmp, d.x + 1, d.y + d.h - 1, d.x + d.w - 1, black);
      }
      if (d.flags & D_GOTFOCUS && (!(d.flags & D_SELECTED) || !(d.flags & D_EXIT))) {
        dotted_rect(d.x + 1 + g, d.y + 1 + g, d.x + d.w - 3 + g, d.y + d.h - 3 + g, state1, state2);
      }
      break;
    }
    case MSG_WANTFOCUS:
      return D_WANTFOCUS;
    case MSG_KEY:
      if (d.flags & D_EXIT) return D_CLOSE;
      d.flags ^= D_SELECTED;
      await object_message(d, MSG_DRAW, 0);
      break;
    case MSG_CLICK: {
      let state1 = d.flags & D_SELECTED;
      const swap = d.flags & D_EXIT ? 0 : state1;
      while (await gui_mouse_b()) {
        let state2 = gui_mouse_x() >= d.x && gui_mouse_y() >= d.y && gui_mouse_x() < d.x + d.w && gui_mouse_y() < d.y + d.h ? 1 : 0;
        if (swap) state2 = state2 ? 0 : 1;
        if ((state1 && !state2) || (state2 && !state1)) {
          d.flags ^= D_SELECTED;
          state1 = d.flags & D_SELECTED;
          await object_message(d, MSG_DRAW, 0);
        }
        await broadcast_dialog_message(MSG_IDLE, 0);
      }
      if (d.flags & D_SELECTED && d.flags & D_EXIT) {
        d.flags ^= D_SELECTED;
        return D_CLOSE;
      }
      break;
    }
  }
  return D_O_K;
}

function palette_128(d: Dialog[], b: number, x: number, y: number, w: number, h: number): void {
  w += 2;
  h += 2;
  const w1 = Math.trunc(w / 10), h1 = Math.trunc(h / 13);
  const w2 = w1 - 2, h2 = h1 - 2;
  for (let k = 0; k < 128; ++k) {
    const o = d[b + k]!;
    o.proc = d_button_proc;
    o.key = 0;
    o.dp = '';
    o.w = w2;
    o.h = h2;
    o.fg = MENU_FG;
    o.flags = D_EXIT;
    o.bg = k + 128;
  }
  let k = 0;
  for (let i = 0; i < 12; ++i) {
    for (let j = 0; j < 10; ++j) {
      d[b + k]!.x = x + j * w1;
      d[b + k]!.y = y + i * h1;
      ++k;
    }
  }
  d[b + k]!.x = x;
  d[b + k]!.y = y + 12 * h1;
  d[b + k]!.w = 2 * w2 + 2;
  k++;
  for (let j = 0; j < 6; ++j) {
    d[b + k]!.x = x + (j + 2) * w1;
    d[b + k]!.y = y + 12 * h1;
    ++k;
  }
  d[b + k]!.x = x + 8 * w1;
  d[b + k]!.y = y + 12 * h1;
  d[b + k]!.w = 2 * w2 + 2;
}

function xy(): Record<string, number> {
  const x1 = Math.trunc((MENU_VIRTUAL_W - MENU_W_LEVEL * 2 - MENU_H_LEVEL * 2 - MENU_W_SPACE * 2 - MENU_H_SPACE * 2 - MENU_W_SAMPLE) / 2);
  const x2 = x1 + MENU_H_SPACE + MENU_H_LEVEL;
  const x3 = x1 + MENU_W_SPACE + MENU_W_LEVEL;
  const x4 = x3 + MENU_H_LEVEL + MENU_H_SPACE;
  const x5 = x4 + MENU_H_SPACE + MENU_H_LEVEL;
  const x7 = x4 + MENU_W_SAMPLE + MENU_W_SPACE;
  const x6 = x7 - MENU_H_SPACE - MENU_H_LEVEL;
  const x8 = x7 + MENU_H_LEVEL + MENU_H_SPACE;
  const y1 = Math.trunc((MENU_VIRTUAL_H - MENU_H_LEVEL * 4 - MENU_H_SPACE * 4 - MENU_H_SAMPLE) / 2);
  const y2 = y1 + MENU_H_LEVEL + MENU_H_SPACE;
  const y3 = y1 + MENU_W_LEVEL + MENU_H_SPACE;
  const y4 = y1 + MENU_H_SAMPLE - MENU_H_LEVEL;
  const y5 = y4 + MENU_H_LEVEL + MENU_H_SPACE;
  const y6 = y5 + MENU_H_LEVEL + MENU_H_SPACE;
  const y7 = y6 + MENU_H_LEVEL + MENU_H_SPACE;
  const y8 = y7 + MENU_H_LEVEL + MENU_H_SPACE;
  return { x1, x2, x3, x4, x5, x6, x7, x8, y1, y2, y3, y4, y5, y6, y7, y8 };
}

function display_chosen_level(): void {
  const { x1, x4, x8, y1 } = xy();
  const screen = screenRef.screen;
  rectfill(screen, menu_real_x(x4), menu_real_y(y1), menu_real_x(x4 + MENU_W_SAMPLE) - 1, menu_real_y(y1 + MENU_H_SAMPLE) - 1, MENU_BG);
  lw_maptex_set_fg_palette(G.CONFIG_LEVEL_MAP, G.CONFIG_LEVEL_FG, 0, G.LW_RANDOM_ON, G.CONFIG_USE_DEFAULT_TEXTURE);
  lw_maptex_set_bg_palette(G.CONFIG_LEVEL_MAP, G.CONFIG_LEVEL_BG, 0, G.LW_RANDOM_ON, G.CONFIG_USE_DEFAULT_TEXTURE);
  my_set_palette();
  let pour_voir = lw_maptex_create_map(G.CONFIG_LEVEL_MAP, G.CONFIG_LEVEL_FG, G.CONFIG_LEVEL_BG, 0, G.LW_RANDOM_ON,
    MIN_MAP_RES_W[G.CONFIG_MIN_MAP_RES]!, MIN_MAP_RES_H[G.CONFIG_MIN_MAP_RES]!, G.CONFIG_USE_DEFAULT_TEXTURE);
  if (pour_voir) {
    const max_w = menu_real_x(MENU_W_SAMPLE), max_h = menu_real_y(MENU_H_SAMPLE);
    const bmp_w = pour_voir.w, bmp_h = pour_voir.h;
    let sample_w, sample_h;
    if (max_w * bmp_h < max_h * bmp_w) {
      sample_w = max_w;
      sample_h = Math.trunc((max_w * bmp_h) / bmp_w);
    } else {
      sample_w = Math.trunc((max_h * bmp_w) / bmp_h);
      sample_h = max_h;
    }
    const sample_x = menu_real_x(x4) + Math.trunc((max_w - sample_w) / 2);
    const sample_y = menu_real_y(y1) + Math.trunc((max_h - sample_h) / 2);
    stretch_blit(pour_voir, screen, 0, 0, bmp_w, bmp_h, sample_x, sample_y, sample_w, sample_h);
  }
  if (!lw_maptex_is_custom_texture_used()) {
    rectfill(screen, menu_real_x(x1), menu_real_y(y1), menu_real_x(x1 + MENU_W_LEVEL) - 1, menu_real_y(y1 + MENU_W_LEVEL) - 1, MENU_BG);
    pour_voir = lw_maptex_create_fg(G.CONFIG_LEVEL_MAP, G.CONFIG_LEVEL_FG, 0, G.LW_RANDOM_ON, G.CONFIG_USE_DEFAULT_TEXTURE);
    // the original takes the y position through menu_real_x as well
    stretch_blit(pour_voir, screen, 0, 0, pour_voir.w, pour_voir.h, menu_real_x(x1), menu_real_x(y1), menu_real_x(MENU_W_LEVEL), menu_real_x(MENU_W_LEVEL));
  }
  if (!lw_maptex_is_custom_texture_used()) {
    rectfill(screen, menu_real_x(x8), menu_real_y(y1), menu_real_x(x8 + MENU_W_LEVEL) - 1, menu_real_y(y1 + MENU_W_LEVEL) - 1, MENU_BG);
    pour_voir = lw_maptex_create_bg(G.CONFIG_LEVEL_MAP, G.CONFIG_LEVEL_BG, 0, G.LW_RANDOM_ON, G.CONFIG_USE_DEFAULT_TEXTURE);
    stretch_blit(pour_voir, screen, 0, 0, pour_voir.w, pour_voir.h, menu_real_x(x8), menu_real_x(y1), menu_real_x(MENU_W_LEVEL), menu_real_x(MENU_W_LEVEL));
  }
}

async function set_dialog_visibility(d: Dialog, state: boolean): Promise<void> {
  if (state) d.flags &= ~D_HIDDEN;
  else d.flags |= D_HIDDEN;
  if (!(d.flags & D_HIDDEN)) await d.proc!(MSG_DRAW, d, 0);
}

let fg_last_state = 1;
let bg_last_state = 1;

async function set_fg_dialogs_visibility(d: Dialog[], just_hidden: { v: number }): Promise<void> {
  const state = !lw_maptex_is_custom_texture_used() ? 1 : 0;
  if (state === 0 && fg_last_state !== 0) just_hidden.v = 1;
  fg_last_state = state;
  for (const i of [5, 9, 10, 14]) await set_dialog_visibility(d[i]!, !!state);
  for (let i = 21; i < 149; ++i) await set_dialog_visibility(d[i]!, !!state);
}

async function set_bg_dialogs_visibility(d: Dialog[], just_hidden: { v: number }): Promise<void> {
  const state = !lw_maptex_is_custom_texture_used() ? 1 : 0;
  if (state === 0 && bg_last_state !== 0) just_hidden.v = 1;
  bg_last_state = state;
  for (const i of [6, 11, 12, 15]) await set_dialog_visibility(d[i]!, !!state);
  for (let i = 149; i < 277; ++i) await set_dialog_visibility(d[i]!, !!state);
}

async function box_for_choose_map(): Promise<void> {
  const d = dialogArray(10);
  const { x1, x4, x8, y1, y4, y5 } = xy();
  const set = (o: Dialog, x: number, y: number, w: number, h: number): void => {
    o.x = x;
    o.y = y;
    o.w = w;
    o.h = h;
  };
  set(d[0]!, x4, y1, MENU_W_SAMPLE, MENU_H_SAMPLE);
  set(d[1]!, x1, y1, MENU_W_LEVEL, MENU_W_LEVEL);
  set(d[2]!, x8, y1, MENU_W_LEVEL, MENU_W_LEVEL);
  set(d[3]!, x8, y5, MENU_W_LEVEL, MENU_H_LEVEL);
  set(d[4]!, x1, y4, MENU_W_LEVEL, MENU_H_LEVEL);
  set(d[5]!, x8, y4, MENU_W_LEVEL, MENU_H_LEVEL);
  for (let i = 0; i < 6; ++i) {
    const o = d[i]!;
    o.proc = d_box_proc;
    o.flags = 0;
    color_one_dialog(o);
    menu_real_coord(o);
    o.x--;
    o.y--;
    o.w += 2;
    o.h += 2;
  }
  d[6]!.proc = null;
  const dp = await my_init_dialog(d, 0);
  await my_update_dialog(dp);
  await shutdown_dialog(dp);
}

async function update_choose_map(d: Dialog[], map: number, fg: number, bg: number, random: number, use_default_texture: number): Promise<void> {
  G.CONFIG_LEVEL_MAP = map;
  G.CONFIG_LEVEL_FG = fg;
  G.CONFIG_LEVEL_BG = bg;
  G.LW_RANDOM_ON = random;
  G.CONFIG_USE_DEFAULT_TEXTURE = use_default_texture;
  const just_hidden = { v: 0 };
  await set_fg_dialogs_visibility(d, just_hidden);
  await set_bg_dialogs_visibility(d, just_hidden);
  if (just_hidden.v) {
    display_back_image();
    for (let i = 0; d[i]!.proc; ++i) if (!(d[i]!.flags & D_HIDDEN)) await d[i]!.proc!(MSG_DRAW, d[i]!, 0);
  }
  await box_for_choose_map();
  (d[13]!.dp as CharBuf).s = String(G.CONFIG_LEVEL_MAP + 1).slice(0, BUFFER_EDIT_NUMBER - 1);
  if (!(d[13]!.flags & D_HIDDEN)) await my_edit_proc(MSG_DRAW, d[13]!, 0);
  (d[14]!.dp as CharBuf).s = String(G.CONFIG_LEVEL_FG + 1).slice(0, BUFFER_EDIT_NUMBER - 1);
  if (!(d[14]!.flags & D_HIDDEN)) await my_edit_proc(MSG_DRAW, d[14]!, 0);
  (d[15]!.dp as CharBuf).s = String(G.CONFIG_LEVEL_BG + 1).slice(0, BUFFER_EDIT_NUMBER - 1);
  if (!(d[15]!.flags & D_HIDDEN)) await my_edit_proc(MSG_DRAW, d[15]!, 0);
  d[4]!.d2 = G.CONFIG_LEVEL_MAP;
  if (G.CONFIG_LEVEL_FG >= CHOOSE_COLOR_NUMBER) d[5]!.d2 = G.CONFIG_LEVEL_FG - CHOOSE_COLOR_NUMBER;
  if (G.CONFIG_LEVEL_BG >= CHOOSE_COLOR_NUMBER) d[6]!.d2 = G.CONFIG_LEVEL_BG - CHOOSE_COLOR_NUMBER;
  for (const k of [4, 5, 6]) {
    const o = d[k]!;
    if (o.d2 < 0) o.d2 = o.d1;
    if (o.d2 > o.d1) o.d2 = 0;
    if (!(o.flags & D_HIDDEN)) await my_slider_proc(MSG_DRAW, o, 0);
  }
  const res = lw_map_get_res(G.CONFIG_LEVEL_MAP, 0, G.LW_RANDOM_ON, MIN_MAP_RES_W[G.CONFIG_MIN_MAP_RES]!, MIN_MAP_RES_H[G.CONFIG_MIN_MAP_RES]!);
  d[16]!.dp = `${res.w}x${res.h}`;
  await my_textbox_proc(MSG_DRAW, d[16]!, 0);
  d[17]!.dp = lw_map_get_readable_name(G.CONFIG_LEVEL_MAP, 0, G.LW_RANDOM_ON);
  await my_textbox_proc(MSG_DRAW, d[17]!, 0);
  display_chosen_level();
}

export async function choose_map(): Promise<number> {
  let retour = 0, choix = MENU_QUICK_BACK;
  const d = dialogArray(278);
  const buf1 = CharBuf.of(), buf2 = CharBuf.of(), buf3 = CharBuf.of();
  display_back_image();
  set_palette_for_choose_color();
  quick_buttons(d);
  const { x1, x3, x4, x5, x6, x7, x8, y1, y2, y3, y4, y5, y6, y7, y8 } = xy();
  const slider_map = async (_dp3: unknown, d2: number): Promise<number> => {
    play_click();
    await update_choose_map(d, d2, G.CONFIG_LEVEL_FG, G.CONFIG_LEVEL_BG, 0, G.CONFIG_USE_DEFAULT_TEXTURE);
    return 0;
  };
  const slider_fg = async (_dp3: unknown, d2: number): Promise<number> => {
    play_click();
    await update_choose_map(d, G.CONFIG_LEVEL_MAP, d2 + CHOOSE_COLOR_NUMBER, G.CONFIG_LEVEL_BG, G.LW_RANDOM_ON, G.CONFIG_USE_DEFAULT_TEXTURE);
    return 0;
  };
  const slider_bg = async (_dp3: unknown, d2: number): Promise<number> => {
    play_click();
    await update_choose_map(d, G.CONFIG_LEVEL_MAP, G.CONFIG_LEVEL_FG, d2 + CHOOSE_COLOR_NUMBER, G.LW_RANDOM_ON, G.CONFIG_USE_DEFAULT_TEXTURE);
    return 0;
  };
  for (const k of [4, 5, 6]) {
    d[k]!.proc = my_slider_proc;
    d[k]!.dp = null;
    d[k]!.key = 0;
    d[k]!.dp3 = d;
    d[k]!.flags = 0;
  }
  d[4]!.dp2 = slider_map;
  d[5]!.dp2 = slider_fg;
  d[6]!.dp2 = slider_bg;
  d[4]!.d1 = G.RAW_MAP_NUMBER - 1;
  d[5]!.d1 = d[6]!.d1 = G.RAW_TEXTURE_NUMBER - 1;
  d[4]!.d2 = G.CONFIG_LEVEL_MAP;
  d[5]!.d2 = G.CONFIG_LEVEL_FG;
  d[6]!.d2 = G.CONFIG_LEVEL_BG;
  d[4]!.x = x4;
  d[4]!.y = y5;
  d[4]!.w = MENU_W_SAMPLE;
  d[4]!.h = MENU_H_LEVEL;
  d[5]!.x = x3;
  d[6]!.x = x7;
  d[5]!.y = d[6]!.y = y2;
  d[5]!.w = d[6]!.w = MENU_H_LEVEL;
  d[5]!.h = d[6]!.h = y4 - y2 - MENU_H_SPACE;
  for (let i = 7; i < 13; ++i) {
    d[i]!.proc = my_button_proc;
    d[i]!.key = 0;
    d[i]!.flags = D_EXIT;
    d[i]!.w = d[i]!.h = MENU_H_LEVEL;
  }
  d[7]!.dp = d[9]!.dp = d[11]!.dp = '-';
  d[8]!.dp = d[10]!.dp = d[12]!.dp = '+';
  d[7]!.x = x3;
  d[7]!.y = d[8]!.y = y5;
  d[8]!.x = x7;
  d[9]!.x = d[10]!.x = x3;
  d[11]!.x = d[12]!.x = x7;
  d[9]!.y = d[11]!.y = y4;
  d[10]!.y = d[12]!.y = y1;
  for (const k of [13, 14, 15]) {
    d[k]!.proc = my_edit_proc;
    d[k]!.flags = D_EXIT;
    d[k]!.d1 = BUFFER_EDIT_NUMBER;
    d[k]!.d2 = 0;
    d[k]!.w = MENU_W_LEVEL;
    d[k]!.h = MENU_H_LEVEL;
  }
  d[13]!.dp = buf1;
  d[14]!.dp = buf2;
  d[15]!.dp = buf3;
  d[13]!.x = d[15]!.x = x8;
  d[14]!.x = x1;
  d[13]!.y = y5;
  d[14]!.y = d[15]!.y = y4;
  const tb = (k: number, x: number, y: number, w: number, dp: string): void => {
    d[k]!.proc = my_textbox_proc;
    d[k]!.x = x;
    d[k]!.y = y;
    d[k]!.w = w;
    d[k]!.h = MENU_H_LEVEL;
    d[k]!.flags = 0;
    d[k]!.dp = dp;
  };
  tb(16, x1, y6, x5 - x1 - MENU_W_SPACE, '');
  tb(17, x5, y6, x8 - x5 + MENU_W_LEVEL, '');
  tb(18, x1, y7, x6 - x1 - MENU_W_SPACE, lw_lang_string(L.LEVEL_USEDEFAULTTEXTURE));
  d[19]!.proc = my_button_proc;
  d[19]!.x = x6;
  d[19]!.y = y7;
  d[19]!.w = x8 - x6 + MENU_W_LEVEL;
  d[19]!.h = MENU_H_LEVEL;
  d[19]!.flags = D_EXIT;
  d[19]!.dp = '';
  d[20]!.proc = my_button_proc;
  d[20]!.x = x3;
  d[20]!.y = y8;
  d[20]!.w = x8 - x3 - MENU_W_SPACE;
  d[20]!.h = MENU_H_LEVEL;
  d[20]!.flags = D_EXIT;
  d[20]!.dp = lw_lang_string(L.LEVEL_RANDOMMAP);
  for (let i = 4; i < 21; ++i) {
    color_one_dialog(d[i]!);
    menu_real_coord(d[i]!);
  }
  palette_128(d, 21, menu_real_x(x1), menu_real_y(y3), menu_real_x(MENU_W_LEVEL), menu_real_y(y4 - y3 - MENU_H_SPACE));
  palette_128(d, 149, menu_real_x(x8), menu_real_y(y3), menu_real_x(MENU_W_LEVEL), menu_real_y(y4 - y3 - MENU_H_SPACE));
  await box_for_choose_map();
  d[277]!.proc = null;
  const update_use_default_texture_state = async (): Promise<void> => {
    d[19]!.dp = lw_lang_string(G.CONFIG_USE_DEFAULT_TEXTURE ? L.LEVEL_ON : L.LEVEL_OFF).slice(0, 29);
    await my_button_proc(MSG_DRAW, d[19]!, 0);
  };
  await update_use_default_texture_state();
  await update_choose_map(d, G.CONFIG_LEVEL_MAP, G.CONFIG_LEVEL_FG, G.CONFIG_LEVEL_BG, G.LW_RANDOM_ON, G.CONFIG_USE_DEFAULT_TEXTURE);
  while (retour === 0) {
    choix = await my_do_dialog_no_clear(d, choix);
    switch (choix) {
      case -1:
      case MENU_QUICK_BACK:
        retour = 1;
        break;
      case MENU_QUICK_MAIN:
        retour = MENU_TOP;
        break;
      case MENU_QUICK_QUIT:
        if (await confirm_quit()) retour = MENU_EXIT;
        else {
          display_back_image();
          await box_for_choose_map();
          await update_choose_map(d, G.CONFIG_LEVEL_MAP, G.CONFIG_LEVEL_FG, G.CONFIG_LEVEL_BG, G.LW_RANDOM_ON, G.CONFIG_USE_DEFAULT_TEXTURE);
        }
        break;
      case MENU_QUICK_PLAY:
        retour = MENU_PLAY;
        break;
      case 7:
      case 8: {
        d[4]!.d2 += choix === 7 ? -1 : 1;
        if (d[4]!.d2 < 0) d[4]!.d2 = d[4]!.d1;
        if (d[4]!.d2 > d[4]!.d1) d[4]!.d2 = 0;
        await slider_map(d, d[4]!.d2);
        break;
      }
      case 9:
      case 10: {
        d[5]!.d2 += choix === 9 ? -1 : 1;
        if (d[5]!.d2 < 0) d[5]!.d2 = d[5]!.d1;
        if (d[5]!.d2 > d[5]!.d1) d[5]!.d2 = 0;
        await slider_fg(d, d[5]!.d2);
        break;
      }
      case 11:
      case 12: {
        d[6]!.d2 += choix === 11 ? -1 : 1;
        if (d[6]!.d2 < 0) d[6]!.d2 = d[6]!.d1;
        if (d[6]!.d2 > d[6]!.d1) d[6]!.d2 = 0;
        await slider_bg(d, d[6]!.d2);
        break;
      }
      case 13: {
        let i = atoi(buf1.s) - 1;
        if (!(i >= 0 && i < G.RAW_MAP_NUMBER)) i = G.CONFIG_LEVEL_MAP;
        play_click();
        await update_choose_map(d, i, G.CONFIG_LEVEL_FG, G.CONFIG_LEVEL_BG, 0, G.CONFIG_USE_DEFAULT_TEXTURE);
        break;
      }
      case 14: {
        let i = atoi(buf2.s) - 1;
        if (!(i >= 0 && i < G.RAW_TEXTURE_NUMBER + CHOOSE_COLOR_NUMBER)) i = G.CONFIG_LEVEL_FG;
        play_click();
        await update_choose_map(d, G.CONFIG_LEVEL_MAP, i, G.CONFIG_LEVEL_BG, G.LW_RANDOM_ON, G.CONFIG_USE_DEFAULT_TEXTURE);
        break;
      }
      case 15: {
        let i = atoi(buf3.s) - 1;
        if (!(i >= 0 && i < G.RAW_TEXTURE_NUMBER + CHOOSE_COLOR_NUMBER)) i = G.CONFIG_LEVEL_BG;
        play_click();
        await update_choose_map(d, G.CONFIG_LEVEL_MAP, G.CONFIG_LEVEL_FG, i, G.LW_RANDOM_ON, G.CONFIG_USE_DEFAULT_TEXTURE);
        break;
      }
      case 19:
        await update_choose_map(d, G.CONFIG_LEVEL_MAP, G.CONFIG_LEVEL_FG, G.CONFIG_LEVEL_BG, G.LW_RANDOM_ON, G.CONFIG_USE_DEFAULT_TEXTURE ? 0 : 1);
        await update_use_default_texture_state();
        break;
      case 20:
        if (levelHooks.random_map && (await levelHooks.random_map())) {
          await update_choose_map(d, G.CONFIG_LEVEL_MAP, G.CONFIG_LEVEL_FG, G.CONFIG_LEVEL_BG, 1, G.CONFIG_USE_DEFAULT_TEXTURE);
        }
        break;
      default:
        if (choix >= 21 && choix < 149) {
          await update_choose_map(d, G.CONFIG_LEVEL_MAP, choix - 21, G.CONFIG_LEVEL_BG, G.LW_RANDOM_ON, G.CONFIG_USE_DEFAULT_TEXTURE);
        }
        if (choix >= 149 && choix < 277) {
          await update_choose_map(d, G.CONFIG_LEVEL_MAP, G.CONFIG_LEVEL_FG, choix - 149, G.LW_RANDOM_ON, G.CONFIG_USE_DEFAULT_TEXTURE);
        }
    }
  }
  if (retour > 0) retour--;
  return retour;
}

function atoi(s: string): number {
  const m = /^\s*([+-]?\d+)/.exec(s);
  return m ? parseInt(m[1]!, 10) | 0 : 0;
}

void MENU_FG;
