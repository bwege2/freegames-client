// geometry.c: where everything is on the screen, and the buttons drawn from code.
import { G, GR, scr, display, type Rect } from './g.ts';
import * as C from './consts.ts';
import { Fgl_putbox, Fgl_fillbox, Fgl_hline, Fgl_line, Fgl_setfontcolors, Fgl_write } from './lcx11.ts';
import { resize_pixmap } from './pixmap.ts';
import { screen_full_refresh, refresh_main_screen } from './screen.ts';
import { hide_mouse, redraw_mouse } from './mouse.ts';

const set = (r: Rect, x: number, y: number, h: number, w: number): void => { r.x = x; r.y = y; r.h = h; r.w = w; };

export function initialize_geometry(): void {
  scr.border_x = 0;
  scr.border_y = 0;
  scr.client_w = 640;
  scr.client_h = 480;
  set(scr.client_win, 0, 0, 480, 640);
  set(scr.main_win, C.MAIN_WIN_X, C.MAIN_WIN_Y, C.MAIN_WIN_H, C.MAIN_WIN_W);
  set(scr.pause_button, C.PAUSE_BUTTON_X, C.PAUSE_BUTTON_Y, C.PAUSE_BUTTON_H, C.PAUSE_BUTTON_W);
  set(scr.slow_button, C.SLOW_BUTTON_X, C.SLOW_BUTTON_Y, C.SLOW_BUTTON_H, C.SLOW_BUTTON_W);
  set(scr.med_button, C.MED_BUTTON_X, C.MED_BUTTON_Y, C.MED_BUTTON_H, C.MED_BUTTON_W);
  set(scr.fast_button, C.FAST_BUTTON_X, C.FAST_BUTTON_Y, C.FAST_BUTTON_H, C.FAST_BUTTON_W);
  set(scr.menu_button, C.MENU_BUTTON_X, C.MENU_BUTTON_Y, C.MENU_BUTTON_H, C.MENU_BUTTON_W);
  set(scr.load_button, C.LOAD_BUTTON_X, C.LOAD_BUTTON_Y, C.LOAD_BUTTON_H, C.LOAD_BUTTON_W);
  set(scr.save_button, C.SAVE_BUTTON_X, C.SAVE_BUTTON_Y, C.SAVE_BUTTON_H, C.SAVE_BUTTON_W);
  set(scr.quit_button, C.QUIT_BUTTON_X, C.QUIT_BUTTON_Y, C.QUIT_BUTTON_H, C.QUIT_BUTTON_W);
  set(scr.help_button, C.HELP_BUTTON_X, C.HELP_BUTTON_Y, C.HELP_BUTTON_H, C.HELP_BUTTON_W);
  set(scr.results_button, C.RESULTS_BUTTON_X, C.RESULTS_BUTTON_Y, C.RESULTS_BUTTON_H, C.RESULTS_BUTTON_W);
  set(scr.tover_button, C.TOVER_BUTTON_X, C.TOVER_BUTTON_Y, C.TOVER_BUTTON_H, C.TOVER_BUTTON_W);
  set(scr.confine_button, C.CONFINE_BUTTON_X, C.CONFINE_BUTTON_Y, C.CONFINE_BUTTON_H, C.CONFINE_BUTTON_W);
  set(scr.module_buttons, C.SELECT_BUTTON_WIN_X, C.SELECT_BUTTON_WIN_Y, C.SELECT_BUTTON_WIN_H, C.SELECT_BUTTON_WIN_W);
  set(scr.pbar_area, C.PBAR_AREA_X, C.PBAR_AREA_Y, C.PBAR_AREA_H, C.PBAR_AREA_W);
  set(scr.pbar_pop, C.PBAR_POP_X, C.PBAR_POP_Y, C.PBAR_H, C.PBAR_W);
  set(scr.pbar_tech, C.PBAR_TECH_X, C.PBAR_TECH_Y, C.PBAR_H, C.PBAR_W);
  set(scr.pbar_food, C.PBAR_FOOD_X, C.PBAR_FOOD_Y, C.PBAR_H, C.PBAR_W);
  set(scr.pbar_jobs, C.PBAR_JOBS_X, C.PBAR_JOBS_Y, C.PBAR_H, C.PBAR_W);
  set(scr.pbar_money, C.PBAR_MONEY_X, C.PBAR_MONEY_Y, C.PBAR_H, C.PBAR_W);
  set(scr.pbar_coal, C.PBAR_COAL_X, C.PBAR_COAL_Y, C.PBAR_H, C.PBAR_W);
  set(scr.pbar_goods, C.PBAR_GOODS_X, C.PBAR_GOODS_Y, C.PBAR_H, C.PBAR_W);
  set(scr.pbar_ore, C.PBAR_ORE_X, C.PBAR_ORE_Y, C.PBAR_H, C.PBAR_W);
  set(scr.pbar_steel, C.PBAR_STEEL_X, C.PBAR_STEEL_Y, C.PBAR_H, C.PBAR_W);
  set(scr.sust, C.SUST_SCREEN_X, C.SUST_SCREEN_Y, C.SUST_SCREEN_H, C.SUST_SCREEN_W);
  set(scr.select_message, C.SELECT_BUTTON_MESSAGE_X, C.SELECT_BUTTON_MESSAGE_Y, 0, 0);
  scr.date.w = C.DATE_W;
  scr.date.x = scr.main_win.x + scr.main_win.w - scr.date.w;
  scr.date.y = scr.main_win.y + scr.main_win.h + 16;
  scr.date.h = 16;
  scr.money.w = C.MONEY_W;
  scr.money.x = scr.main_win.x;
  scr.money.y = scr.main_win.y + scr.main_win.h + 16;
  scr.money.h = 16;
  set(scr.time_for_year, C.TIME_FOR_YEAR_X, C.TIME_FOR_YEAR_Y, 0, 0);
  set(scr.status_message_1, scr.main_win.x, C.STATUS_MESSAGE_1_Y, 8, scr.main_win.w);
  set(scr.status_message_2, scr.main_win.x, C.STATUS_MESSAGE_2_Y, 8, scr.main_win.w);
  set(scr.mini_map, C.MINI_SCREEN_X, C.MINI_SCREEN_Y, C.MINI_SCREEN_H, C.MINI_SCREEN_W);
  set(scr.mini_map_aux, C.MINI_MAP_AUX_X, C.MINI_MAP_AUX_Y, C.MINI_MAP_AUX_H, C.MINI_MAP_AUX_W);
  set(scr.mini_map_area, C.MINI_MAP_AREA_X, C.MINI_MAP_AREA_Y, C.MINI_MAP_AREA_H, C.MINI_MAP_AREA_W);
  set(scr.monthgraph, C.MONTHGRAPH_X, C.MONTHGRAPH_Y, C.MONTHGRAPH_H, C.MONTHGRAPH_W);
  set(scr.mappoint_stats, C.MAPPOINT_STATS_X, C.MAPPOINT_STATS_Y, C.MAPPOINT_STATS_H, C.MAPPOINT_STATS_W);
  // scr->market_cb = scr->pbar_area: a copy of the struct
  set(scr.market_cb, scr.pbar_area.x, scr.pbar_area.y, scr.pbar_area.h, scr.pbar_area.w);
}

export function resize_geometry(new_width: number, new_height: number): void {
  if (display.winW === new_width && display.winH === new_height) return;
  initialize_geometry();
  scr.client_win.w = new_width;
  scr.client_win.h = new_height;
  if (G.pix_double) {
    new_width = (new_width / 2) | 0;
    new_height = (new_height / 2) | 0;
  }
  display.winW = new_width;
  display.winH = new_height;
  scr.client_w = new_width - 2 * G.borderx;
  scr.client_h = new_height - 2 * G.bordery;
  resize_pixmap(scr.client_w, scr.client_h);
  resize_main_win(scr.client_w, scr.client_h);
  scr.select_message.y = C.SELECT_BUTTON_MESSAGE_Y + (scr.client_h - 480);
  scr.time_for_year.y = C.TIME_FOR_YEAR_Y + (scr.client_h - 480);
  scr.status_message_1.y = C.STATUS_MESSAGE_1_Y + (scr.client_h - 480);
  scr.status_message_1.w = scr.main_win.w;
  scr.status_message_2.y = C.STATUS_MESSAGE_2_Y + (scr.client_h - 480);
  scr.status_message_2.w = scr.main_win.w;
  scr.date.y = scr.main_win.y + scr.main_win.h + 16;
  scr.date.x = scr.main_win.x + scr.main_win.w - scr.date.w;
  scr.pbar_area.x = 56 + scr.main_win.w + 16 + 2;
  for (const r of [scr.pbar_pop, scr.pbar_tech, scr.pbar_food, scr.pbar_jobs, scr.pbar_money, scr.pbar_coal,
    scr.pbar_goods, scr.pbar_ore, scr.pbar_steel]) r.x = scr.pbar_area.x + 4;
  scr.monthgraph.x = scr.pbar_area.x + 4;
  scr.mappoint_stats.x = scr.pbar_area.x + 4;
  scr.market_cb.x = scr.pbar_area.x;
  scr.mini_map_aux.x = scr.pbar_area.x + 4;
  scr.mini_map_area.x = scr.pbar_area.x + 4;
  scr.mini_map.x = scr.mini_map_aux.x + (((scr.mini_map_aux.w - scr.mini_map.w) / 2) | 0);
  scr.money.x = scr.main_win.x;
  scr.money.y = scr.main_win.y + scr.main_win.h + 16;
  scr.pause_button.y = C.PAUSE_BUTTON_Y + (scr.main_win.h - C.MAIN_WIN_H);
  scr.slow_button.y = C.SLOW_BUTTON_Y + (scr.main_win.h - C.MAIN_WIN_H);
  scr.med_button.y = C.MED_BUTTON_Y + (scr.main_win.h - C.MAIN_WIN_H);
  scr.fast_button.y = C.FAST_BUTTON_Y + (scr.main_win.h - C.MAIN_WIN_H);
  screen_full_refresh();
}

export function mouse_in_rect(b: Rect, x: number, y: number): boolean {
  return x > b.x && x < b.x + b.w && y > b.y && y < b.y + b.h;
}

function resize_main_win(new_width: number, new_height: number): void {
  const mw = scr.main_win;
  mw.w = new_width - 640 + C.MAIN_WIN_W;
  mw.w = ((mw.w / 16) | 0) * 16;
  mw.h = new_height - 480 + C.MAIN_WIN_H;
  mw.h = ((mw.h / 16) | 0) * 16;
  adjust_main_origin(G.main_screen_originx, G.main_screen_originy, 0);
}

/** pixel_to_mappoint: [in the main window, mpx, mpy] (mpx can be negative) */
export function pixel_to_mappoint(px: number, py: number): [boolean, number, number] {
  const mw = scr.main_win;
  const mpx = (((px - mw.x) / 16) | 0) + G.main_screen_originx;
  const mpy = (((py - mw.y) / 16) | 0) + G.main_screen_originy;
  if (px > mw.x + mw.w || py > mw.y + mw.h || px < mw.x || py < mw.y) return [false, mpx, mpy];
  return [true, mpx, mpy];
}

export function pixel_to_winpoint(px: number, py: number): [boolean, number, number] {
  const mw = scr.main_win;
  const wpx = ((px - mw.x) / 16) | 0;
  const wpy = ((py - mw.y) / 16) | 0;
  if (px > mw.x + mw.w || py > mw.y + mw.h || px < mw.x || py < mw.y) return [false, wpx, wpy];
  return [true, wpx, wpy];
}

export function adjust_main_origin(new_origin_x: number, new_origin_y: number, refresh: number): void {
  const mw = scr.main_win;
  if (new_origin_x < 1) new_origin_x = 1;
  else if (new_origin_x > C.WORLD_SIDE_LEN - ((mw.w / 16) | 0) - 1) new_origin_x = C.WORLD_SIDE_LEN - ((mw.w / 16) | 0) - 1;
  if (new_origin_y < 1) new_origin_y = 1;
  else if (new_origin_y > C.WORLD_SIDE_LEN - ((mw.h / 16) | 0) - 1) new_origin_y = C.WORLD_SIDE_LEN - ((mw.h / 16) | 0) - 1;
  if (new_origin_x === G.main_screen_originx && new_origin_y === G.main_screen_originy) return;
  G.main_screen_originx = new_origin_x;
  G.main_screen_originy = new_origin_y;
  if (refresh) {
    hide_mouse();
    refresh_main_screen();
    redraw_mouse();
  }
}

function drawButton(b: Rect, on: number, a1: Uint8Array, a2: Uint8Array, o1: Uint8Array, o2: Uint8Array): void {
  if (on) {
    Fgl_putbox(b.x, b.y, 16, 16, a1);
    Fgl_putbox(b.x + 16, b.y, 16, 16, a2);
  } else {
    Fgl_putbox(b.x, b.y, 16, 16, o1);
    Fgl_putbox(b.x + 16, b.y, 16, 16, o2);
  }
}
export const draw_pause = (active: number): void => drawButton(scr.pause_button, active, GR.pause_button1_on, GR.pause_button2_on, GR.pause_button1_off, GR.pause_button2_off);
export const draw_slow = (active: number): void => drawButton(scr.slow_button, active, GR.slow_button1_on, GR.slow_button2_on, GR.slow_button1_off, GR.slow_button2_off);
export const draw_med = (active: number): void => drawButton(scr.med_button, active, GR.med_button1_on, GR.med_button2_on, GR.med_button1_off, GR.med_button2_off);
export const draw_fast = (active: number): void => drawButton(scr.fast_button, active, GR.fast_button1_on, GR.fast_button2_on, GR.fast_button1_off, GR.fast_button2_off);

function menuStyleButton(b: Rect, inner: number, textX: number, textY: number, text: string): void {
  const menu_bg_color = 80;
  const menu_fg_color = 226;
  Fgl_fillbox(b.x, b.y, b.w, b.h, C.white(20));
  Fgl_fillbox(b.x + 5, b.y + 4, b.w - 10, b.h - inner, menu_bg_color);
  const bot = inner === 5 ? b.h - 2 : b.h - 4;
  Fgl_hline(b.x + 5, b.y + 4, b.x + b.w - 5, C.white(8));
  Fgl_line(b.x + 5, b.y + 4, b.x + 5, b.y + bot, C.white(8));
  Fgl_hline(b.x + 5, b.y + bot, b.x + b.w - 5, C.white(8));
  Fgl_line(b.x + b.w - 5, b.y + 4, b.x + b.w - 5, b.y + bot, C.white(8));
  Fgl_setfontcolors(menu_bg_color, menu_fg_color);
  Fgl_write(b.x + textX, b.y + textY, text);
  Fgl_setfontcolors(C.TEXT_BG_COLOUR, C.TEXT_FG_COLOUR);
}
export const draw_menu = (): void => menuStyleButton(scr.menu_button, 5, 12, 10, 'Menu');
export const draw_help = (): void => menuStyleButton(scr.help_button, 8, 13, 9, 'Help');
export const draw_results = (): void => menuStyleButton(scr.results_button, 8, 9, 9, 'Stats');

export function draw_ms_button(graphic: Uint8Array): void {
  const mma = scr.mini_map_aux;
  Fgl_putbox(mma.x + 4, mma.y, 16, 16, graphic);
}

export function draw_ms_text(txt: string): void {
  const mma = scr.mini_map_aux;
  Fgl_write(mma.x + 28, mma.y + 4, txt);
}

export function draw_small_bezel(x: number, y: number, w: number, h: number, colour: number): void {
  for (let i = 1; i < 4; i++) {
    Fgl_hline(x - 1 - i, y - 1 - i, x + w + i, colour + 16);
    Fgl_line(x - 1 - i, y - 1 - i, x - 1 - i, y + h + i, colour + 14);
    Fgl_hline(x - 1 - i, y + h + i, x + w + i, colour + 22);
    Fgl_line(x + w + i, y - 1 - i, x + w + i, y + h + i, colour + 24);
  }
}

export function draw_bezel(r: Rect, width: number, color: number): void {
  for (let i = 0; i < width; i++) {
    const c = color + (width - i) * 2;
    Fgl_hline(r.x + i, r.y + i, r.x + r.w - i - 1, c);
    Fgl_hline(r.x + i, r.y + r.h - i - 1, r.x + r.w - i - 1, c);
    Fgl_line(r.x + i, r.y + i, r.x + i, r.y + r.h - i - 1, c);
    Fgl_line(r.x + r.w - i - 1, r.y + i, r.x + r.w - i - 1, r.y + r.h - i - 1, c);
  }
}
