// lw/info.ts: src/info.c: the info bar (time left and each team's size), on one of the screen's four
// sides or hidden (F1, F2), drawn over the map's own textures.

import { type Bitmap, create_bitmap, draw_sprite, getpixel, hline, putpixel, rectfill, vline } from '../al/bitmap.ts';
import { font, text_height, text_length, textout_ex } from '../al/font.ts';
import { KEY_F1, KEY_F2 } from '../al/keyboard.ts';
import { screenRef } from '../al/screen.ts';
import { display_back_image } from './back.ts';
import { lw_maptex_create_bg, lw_maptex_create_fg } from './maptex.ts';
import { G, MENU_BG, MENU_FG } from './state.ts';
import { lw_viewport_register_change, PAGE_FLIP_H } from './viewport.ts';

let INFO_BAR_BACK: Bitmap | null = null;
let INFO_BAR: Bitmap | null = null;
const INFO_BAR_POS_X = [0, 0, 0, 0, 0, 0];
const INFO_BAR_POS_Y = [0, 0, 0, 0, 0, 0];
let INFO_BAR_POS_W = 0;
let INFO_BAR_POS_H = 0;

function init_info_bar(w: number, h: number, epaisseur: number): void {
  INFO_BAR = create_bitmap(w, h);
  INFO_BAR_BACK = create_bitmap(w, h);
  const PT = G.PLAYING_TEAMS;
  const front = lw_maptex_create_fg(G.CONFIG_LEVEL_MAP, G.CONFIG_LEVEL_FG, G.LW_NETWORK_ON, G.LW_RANDOM_ON, G.CONFIG_USE_DEFAULT_TEXTURE);
  const back = lw_maptex_create_bg(G.CONFIG_LEVEL_MAP, G.CONFIG_LEVEL_BG, G.LW_NETWORK_ON, G.LW_RANDOM_ON, G.CONFIG_USE_DEFAULT_TEXTURE);
  if (w > h) {
    rectfill(INFO_BAR, 0, 0, epaisseur - 1, h - 1, MENU_BG);
    vline(INFO_BAR, epaisseur, 0, h - 1, MENU_FG);
    for (let y = 0; y < h; y += front.h) for (let x = epaisseur + 1; x < w; x += front.w) draw_sprite(INFO_BAR, front, x, y);
    INFO_BAR_POS_W = w - epaisseur - 5;
    INFO_BAR_POS_H = Math.trunc((h - 1) / PT) - 1;
    for (let i = 0; i < PT; ++i) {
      INFO_BAR_POS_X[i] = epaisseur + 3;
      INFO_BAR_POS_Y[i] = Math.trunc((h + 1 - PT * (INFO_BAR_POS_H + 1)) / 2) + i * (INFO_BAR_POS_H + 1);
      for (let y = INFO_BAR_POS_Y[i]!; y < INFO_BAR_POS_Y[i]! + INFO_BAR_POS_H; y++) {
        for (let x = INFO_BAR_POS_X[i]!; x < INFO_BAR_POS_X[i]! + INFO_BAR_POS_W; x++) {
          putpixel(INFO_BAR, x, y, getpixel(back, (x - epaisseur - 1) % back.w, y % back.h));
        }
      }
    }
  } else {
    rectfill(INFO_BAR, 0, 0, w - 1, epaisseur - 1, MENU_BG);
    hline(INFO_BAR, 0, epaisseur, w - 1, MENU_FG);
    for (let y = epaisseur + 1; y < h; y += front.h) for (let x = 0; x < w; x += front.w) draw_sprite(INFO_BAR, front, x, y);
    INFO_BAR_POS_W = Math.trunc((w - 1) / PT) - 1;
    INFO_BAR_POS_H = h - epaisseur - 5;
    for (let i = 0; i < PT; ++i) {
      INFO_BAR_POS_X[i] = Math.trunc((w + 1 - PT * (INFO_BAR_POS_W + 1)) / 2) + i * (INFO_BAR_POS_W + 1);
      INFO_BAR_POS_Y[i] = epaisseur + 3;
      for (let y = INFO_BAR_POS_Y[i]!; y < INFO_BAR_POS_Y[i]! + INFO_BAR_POS_H; y++) {
        for (let x = INFO_BAR_POS_X[i]!; x < INFO_BAR_POS_X[i]! + INFO_BAR_POS_W; x++) {
          putpixel(INFO_BAR, x, y, getpixel(back, x % back.w, (y - epaisseur - 1) % back.h));
        }
      }
    }
  }
  draw_sprite(INFO_BAR_BACK, INFO_BAR, 0, 0);
}

export function free_info_bar(): void {
  INFO_BAR = null;
  INFO_BAR_BACK = null;
}

function display_time(x: number, y: number): void {
  let time = G.TIME_LEFT;
  if (time < 0) time = 0;
  const min = Math.trunc(time / 60), sec = time % 60;
  const b = String.fromCharCode(48 + Math.trunc(min / 10), 48 + (min % 10), 58, 48 + Math.trunc(sec / 10), 48 + (sec % 10));
  textout_ex(INFO_BAR!, font, b, x + 1, y + 1, -1, -1);
}

function display_horizontal_info(): void {
  display_time(0, 0);
  for (let i = 0; i < G.PLAYING_TEAMS; ++i) {
    const barre_w = Math.trunc((G.ACTIVE_FIGHTERS[i]! * (INFO_BAR_POS_W - 1)) / G.CURRENT_ARMY_SIZE) + 1;
    const barre_x = INFO_BAR_POS_X[i]! + INFO_BAR_POS_W - barre_w;
    const barre_y = INFO_BAR_POS_Y[i]!;
    rectfill(INFO_BAR!, barre_x, barre_y, barre_x + barre_w - 1, barre_y + INFO_BAR_POS_H - 1, G.COLOR_FIRST_ENTRY[i]! + G.COLORS_PER_TEAM - 1);
  }
}

function display_vertical_info(): void {
  display_time(0, 0);
  for (let i = 0; i < G.PLAYING_TEAMS; ++i) {
    const barre_h = Math.trunc((G.ACTIVE_FIGHTERS[i]! * (INFO_BAR_POS_H - 1)) / G.CURRENT_ARMY_SIZE) + 1;
    const barre_y = INFO_BAR_POS_Y[i]! + INFO_BAR_POS_H - barre_h;
    const barre_x = INFO_BAR_POS_X[i]!;
    rectfill(INFO_BAR!, barre_x, barre_y, barre_x + INFO_BAR_POS_W - 1, barre_y + barre_h - 1, G.COLOR_FIRST_ENTRY[i]! + G.COLORS_PER_TEAM - 1);
  }
}

export function display_info(): void {
  if (G.CONFIG_INFO_BAR & 4) return;
  const screen = screenRef.screen;
  const SW = screen.w, SH = screen.h;
  const temp_w = text_length(font, '00:00') + 2;
  const temp_h = text_height(font) + 2;
  let w, h, epaisseur;
  switch (G.CONFIG_INFO_BAR) {
    case 0:
    case 2:
      w = SW;
      h = temp_h;
      if (h < 13) h = 13;
      epaisseur = temp_w;
      break;
    default:
      w = temp_w;
      if (w < 13) w = 13;
      h = SH;
      epaisseur = temp_h;
      break;
  }
  if (!INFO_BAR) init_info_bar(w, h, epaisseur);
  draw_sprite(INFO_BAR!, INFO_BAR_BACK!, 0, 0);
  let x, y;
  switch (G.CONFIG_INFO_BAR) {
    case 0:
      x = 0;
      y = PAGE_FLIP_H();
      hline(screen, x, y + h, x + w - 1, MENU_FG);
      display_horizontal_info();
      break;
    case 1:
      x = SW - w;
      y = PAGE_FLIP_H();
      vline(screen, x - 1, y, y + h - 1, MENU_FG);
      display_vertical_info();
      break;
    case 2:
      x = 0;
      y = PAGE_FLIP_H() + SH - h;
      hline(screen, x, y - 1, x + w - 1, MENU_FG);
      display_horizontal_info();
      break;
    default:
      x = 0;
      y = PAGE_FLIP_H();
      vline(screen, x + w, y, y + h - 1, MENU_FG);
      display_vertical_info();
      break;
  }
  draw_sprite(screen, INFO_BAR!, x, y);
}

export function lw_info_get_room_for_viewport(): { x: number; y: number; w: number; h: number } {
  const SW = screenRef.screen.w, SH = screenRef.screen.h;
  if (!(G.CONFIG_INFO_BAR & 4)) {
    let temp_w = text_length(font, '00:00') + 2;
    let temp_h = text_height(font) + 2;
    if (temp_h < 13) temp_h = 13;
    if (temp_w < 13) temp_w = 13;
    switch (G.CONFIG_INFO_BAR) {
      case 0:
        return { x: 0, y: temp_h + 1, w: SW, h: SH - temp_h - 1 };
      case 1:
        return { x: 0, y: 0, w: SW - temp_w - 1, h: SH };
      case 2:
        return { x: 0, y: 0, w: SW, h: SH - temp_h - 1 };
      default:
        return { x: temp_w + 1, y: 0, w: SW - temp_w - 1, h: SH };
    }
  }
  return { x: 0, y: 0, w: SW, h: SH };
}

let changed = 0;

export function check_info_state(): void {
  if (G.WATCHDOG_SCANCODE[KEY_F1]) {
    if (G.CONFIG_INFO_BAR >= 4) G.CONFIG_INFO_BAR -= 4;
    else G.CONFIG_INFO_BAR += 4;
    free_info_bar();
    changed = G.CONFIG_PAGE_FLIP ? 2 : 1;
    lw_viewport_register_change(changed);
  }
  if (G.WATCHDOG_SCANCODE[KEY_F2] && G.CONFIG_INFO_BAR < 4) {
    G.CONFIG_INFO_BAR++;
    if (G.CONFIG_INFO_BAR === 4) G.CONFIG_INFO_BAR = 0;
    if (G.CONFIG_INFO_BAR === 8) G.CONFIG_INFO_BAR = 4;
    free_info_bar();
    changed = G.CONFIG_PAGE_FLIP ? 2 : 1;
    lw_viewport_register_change(changed);
  }
  if (changed > 0) {
    display_back_image();
    changed--;
  }
}
