// lw/maptex.ts: src/maptex.c: a map's own texture ("use default texture": the texture with the map's
// system name). calc_real_texture_number reads a flag `found` that the C code never initialises nor
// sets; the x86_64 build passes it as 0 (re/liquidwar/NOTES.md, REA), so the loop always runs to the end
// and the last texture of that name wins.

import type { Bitmap } from '../al/bitmap.ts';
import { lw_map_create_textured, lw_map_get_system_name } from './map.ts';
import { set_bg_texture_palette, set_fg_texture_palette } from './palette.ts';
import { CHOOSE_COLOR_NUMBER, G } from './state.ts';
import { lw_texture_create_bg, lw_texture_create_fg, lw_texture_get_system_name } from './texture.ts';

function calc_real_texture_number(num: number, texture: number, network: number, random: number, use_default_texture: number): number {
  let real_texture = texture;
  if (use_default_texture) {
    const map_name = lw_map_get_system_name(num, network, random);
    for (let i = CHOOSE_COLOR_NUMBER; i < CHOOSE_COLOR_NUMBER + G.RAW_TEXTURE_NUMBER + G.RAW_MAPTEX_NUMBER; ++i) {
      if (map_name === lw_texture_get_system_name(i)) real_texture = i;
    }
  }
  return real_texture;
}

export function lw_maptex_is_custom_texture_used(): number {
  return 0;
}

export function lw_maptex_create_map(num: number, fg: number, bg: number, network: number, random: number,
  min_w: number, min_h: number, use_default_texture: number): Bitmap | null {
  return lw_map_create_textured(num, calc_real_texture_number(num, fg, network, random, use_default_texture),
    calc_real_texture_number(num, bg, network, random, use_default_texture), network, random, min_w, min_h);
}

export function lw_maptex_create_fg(num: number, fg: number, network: number, random: number, use_default_texture: number): Bitmap {
  return lw_texture_create_fg(calc_real_texture_number(num, fg, network, random, use_default_texture));
}

export function lw_maptex_create_bg(num: number, bg: number, network: number, random: number, use_default_texture: number): Bitmap {
  return lw_texture_create_bg(calc_real_texture_number(num, bg, network, random, use_default_texture));
}

export function lw_maptex_set_fg_palette(num: number, fg: number, network: number, random: number, use_default_texture: number): void {
  set_fg_texture_palette(calc_real_texture_number(num, fg, network, random, use_default_texture));
}

export function lw_maptex_set_bg_palette(num: number, bg: number, network: number, random: number, use_default_texture: number): void {
  set_bg_texture_palette(calc_real_texture_number(num, bg, network, random, use_default_texture));
}
