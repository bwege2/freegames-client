// lw/palette.ts: src/palette.c: the game's palette (fonts 1-17, background 18-63, wall texture 64-95,
// floor texture 96-127, teams 128-255), brightness, plain colours from HSV, team colour ramps, fades.

import { fixsqrt } from '../al/fixed.ts';
import { current_palette, fade_in, fade_out, hsv_to_rgb, newPalette, type Palette, set_palette } from '../al/palette.ts';
import { lw_mouse_update_show_hide } from './mouse.ts';
import {
  BG_TEXTURE_FIRST_COLOR, CHOOSE_COLOR_NUMBER, CONFIG_CONTROL_TYPE_OFF, FG_TEXTURE_FIRST_COLOR, G, LW_TEXTURE_SYSTEM_NAME_SIZE,
  NB_TEAMS,
} from './state.ts';

const BG_TEXTURE_DEFAULT_COLOR = 120;
const FG_TEXTURE_DEFAULT_COLOR = 127;

function sqrt255(i: number): number {
  let result = Math.trunc(fixsqrt(i * 256) / 256);
  if (result > 255) result = 255;
  return result;
}

function sqr255(i: number): number {
  let result = Math.trunc((i * i) / 256);
  if (result > 255) result = 255;
  return result;
}

function change_palette_brightness(old_pal: Palette, new_pal: Palette): void {
  const brightness = G.CONFIG_BRIGHTNESS - 8;
  if (brightness !== 0) {
    for (let i = 0; i < 256; ++i) {
      let r = old_pal[i * 3]! * 4;
      let g = old_pal[i * 3 + 1]! * 4;
      let b = old_pal[i * 3 + 2]! * 4;
      if (brightness > 0) {
        r = Math.trunc((brightness * sqrt255(r) + (8 - brightness) * r) / 8);
        g = Math.trunc((brightness * sqrt255(g) + (8 - brightness) * g) / 8);
        b = Math.trunc((brightness * sqrt255(b) + (8 - brightness) * b) / 8);
      }
      if (brightness < 0) {
        r = Math.trunc((-brightness * sqr255(r) + (8 + brightness) * r) / 8);
        g = Math.trunc((-brightness * sqr255(g) + (8 + brightness) * g) / 8);
        b = Math.trunc((-brightness * sqr255(b) + (8 + brightness) * b) / 8);
      }
      new_pal[i * 3] = Math.trunc(r / 4) & 0xff;
      new_pal[i * 3 + 1] = Math.trunc(g / 4) & 0xff;
      new_pal[i * 3 + 2] = Math.trunc(b / 4) & 0xff;
    }
  } else new_pal.set(old_pal);
}

export function my_set_palette(): void {
  const corrected = newPalette();
  change_palette_brightness(G.GLOBAL_PALETTE, corrected);
  let equal = true;
  for (let i = 0; i < 768 && equal; i++) equal = corrected[i] === current_palette[i];
  if (!equal) set_palette(corrected);
}

function set_raw_texture_palette(data: Uint8Array, first: number): void {
  let p = 4 + LW_TEXTURE_SYSTEM_NAME_SIZE;
  for (let i = first; i < first + 32; ++i) {
    G.GLOBAL_PALETTE[i * 3] = data[p++]!;
    G.GLOBAL_PALETTE[i * 3 + 1] = data[p++]!;
    G.GLOBAL_PALETTE[i * 3 + 2] = data[p++]!;
  }
}

const f = Math.fround;
const H = [0, 20, 40, 70, 110, 150, 180, 210, 240, 270, 300, 330].map(f);
const S = [1, 0.7, 0.4, 1, 0.5, 1, 0.5, 1, 0.5, 1].map(f);
const V = [1, 1, 1, 0.8, 0.8, 0.6, 0.6, 0.3, 0.3, 0.1].map(f);

export function get_mono_texture_color(pal: Palette, index: number, num: number): void {
  const h1 = Math.trunc(num / 10);
  const s1 = num % 10;
  const v1 = s1;
  let h2, s2, v2;
  if (h1 < 12) {
    h2 = H[h1]!;
    s2 = S[s1]!;
    v2 = V[v1]!;
  } else {
    h2 = 0;
    s2 = 0;
    v2 = f(127 - num);
    v2 = f(v2 / 7.0);
  }
  const [r, g, b] = hsv_to_rgb(h2, s2, v2);
  pal[index * 3] = Math.trunc(r / 4);
  pal[index * 3 + 1] = Math.trunc(g / 4);
  pal[index * 3 + 2] = Math.trunc(b / 4);
}

function set_mono_texture_palette(num: number, first: number): void {
  get_mono_texture_color(G.GLOBAL_PALETTE, first, num);
}

function set_texture_palette(num: number, first: number, def: number): void {
  if (num < CHOOSE_COLOR_NUMBER) set_mono_texture_palette(num, first);
  else {
    if (num >= CHOOSE_COLOR_NUMBER && num < CHOOSE_COLOR_NUMBER + G.RAW_TEXTURE_NUMBER) {
      if (G.LOADED_TEXTURE) set_raw_texture_palette(G.RAW_TEXTURE[num - CHOOSE_COLOR_NUMBER]!, first);
      else set_mono_texture_palette(def, first);
    }
    if (num >= CHOOSE_COLOR_NUMBER + G.RAW_TEXTURE_NUMBER && num < CHOOSE_COLOR_NUMBER + G.RAW_TEXTURE_NUMBER + G.RAW_MAPTEX_NUMBER) {
      if (G.LOADED_MAPTEX) set_raw_texture_palette(G.RAW_MAPTEX[num - (CHOOSE_COLOR_NUMBER + G.RAW_TEXTURE_NUMBER)]!, first);
      else set_mono_texture_palette(def, first);
    }
  }
}

export function set_bg_texture_palette(num: number): void {
  set_texture_palette(num, BG_TEXTURE_FIRST_COLOR, BG_TEXTURE_DEFAULT_COLOR);
}

export function set_fg_texture_palette(num: number): void {
  set_texture_palette(num, FG_TEXTURE_FIRST_COLOR, FG_TEXTURE_DEFAULT_COLOR);
}

export function set_palette_for_choose_color(): void {
  for (let i = 0; i < 128; ++i) get_mono_texture_color(G.GLOBAL_PALETTE, 128 + i, i);
}

function set_team_color(teinte: number, first: number, num: number): void {
  const P = G.GLOBAL_PALETTE;
  const last = first + num - 1;
  get_mono_texture_color(P, last, teinte * 10);
  const col_r = P[last * 3]!, col_g = P[last * 3 + 1]!, col_b = P[last * 3 + 2]!;
  const tot = 8 * num - 7;
  for (let i = 0; i < num - 1; ++i) {
    const coeff = num + 7 * i;
    P[(first + i) * 3] = Math.trunc((col_r * coeff) / tot);
    P[(first + i) * 3 + 1] = Math.trunc((col_g * coeff) / tot);
    P[(first + i) * 3 + 2] = Math.trunc((col_b * coeff) / tot);
  }
}

export function set_playing_teams_palette(): void {
  G.COLORS_PER_TEAM = Math.trunc(128 / G.PLAYING_TEAMS);
  for (let i = 0, n = 0; i < NB_TEAMS; ++i) {
    let color = 0;
    let active = 0;
    if (G.LW_NETWORK_ON) {
      for (let j = 0; j < NB_TEAMS; ++j) {
        if (G.LW_NETWORK_INFO[j]!.active && G.LW_NETWORK_INFO[j]!.server_id === i) {
          active = 1;
          color = G.LW_NETWORK_INFO[j]!.color;
        }
      }
    } else if (G.CONFIG_CONTROL_TYPE[i] !== CONFIG_CONTROL_TYPE_OFF) {
      active = 1;
      color = G.CONFIG_TEAM_COLOR[i]!;
    }
    if (active) {
      G.COLOR_FIRST_ENTRY[n] = 128 + n * G.COLORS_PER_TEAM;
      set_team_color(color, G.COLOR_FIRST_ENTRY[n]!, G.COLORS_PER_TEAM);
      n++;
    }
  }
}

export function my_fade_out(): void {
  fade_out();
}

export function my_fade_in(): void {
  const pal = newPalette();
  change_palette_brightness(G.GLOBAL_PALETTE, pal);
  fade_in(pal);
  lw_mouse_update_show_hide();
}
