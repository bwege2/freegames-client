// lw/map.ts: src/map.c: maps in the datafile's packed form (an 8-byte header: size, w, h, little endian;
// a 16-byte system name, a 32-byte readable name, then runs: n > 0 wall pixels, n < 0 playable pixels,
// 0 ends), made from a picture (custom maps, random maps) and unpacked to two-colour or textured bitmaps.

import { type Bitmap, blit, create_bitmap, getpixel, hline, putpixel, vline } from '../al/bitmap.ts';
import type { Palette } from '../al/palette.ts';
import { G, LW_MAP_READABLE_NAME_SIZE, LW_MAP_SYSTEM_NAME_SIZE } from './state.ts';
import { lw_texture_create_bg, lw_texture_create_fg } from './texture.ts';
import { lw_path_get_system_name } from './path.ts';
import { log_println_str } from './log.ts';

const LIGHT_OR_DARK_TRESHOLD = 315;
const CONSIDERED_AS_DARK = 0;
const CONSIDERED_AS_LIGHT = 2;
const PLAYABLE_AREA = 1;
const MINI_SIDE_SIZE = 4;
const MINI_PLAYABLE_AREA = 1024;

export function my_create_bitmap(w: number, h: number): Bitmap {
  return create_bitmap(w, h);
}

function calc_zoom_factor(w: number, h: number, min_w: number, min_h: number): number {
  if (w <= 0 || h <= 0) {
    log_println_str('Error: map size is null or negative!');
    w = h = 1;
  }
  const factor_w = Math.trunc((min_w - 1) / w) + 1;
  const factor_h = Math.trunc((min_h - 1) / h) + 1;
  return factor_w > factor_h ? factor_w : factor_h;
}

function sort_light_and_dark(bmp: Bitmap, pal: Palette): void {
  const table = new Uint8Array(256);
  for (let i = 0; i < 256; ++i) {
    table[i] = 6 * pal[i * 3]! + 3 * pal[i * 3 + 1]! + pal[i * 3 + 2]! > LIGHT_OR_DARK_TRESHOLD ? CONSIDERED_AS_LIGHT : CONSIDERED_AS_DARK;
  }
  for (let y = 0; y < bmp.h; ++y) for (let x = 0; x < bmp.w; ++x) putpixel(bmp, x, y, table[getpixel(bmp, x, y)]!);
}

function extract_significant_part(src: Bitmap): Bitmap | null {
  let min_x = src.w, min_y = src.h, max_x = -1, max_y = -1;
  for (let y = 0; y < src.h; ++y) {
    for (let x = 0; x < src.w; ++x) {
      if (getpixel(src, x, y) === CONSIDERED_AS_DARK) {
        if (min_x > x) min_x = x;
        if (min_y > y) min_y = y;
        if (max_x < x) max_x = x;
        if (max_y < y) max_y = y;
      }
    }
  }
  const dst_w = max_x - min_x + 1;
  const dst_h = max_y - min_y + 1;
  if (dst_w < MINI_SIDE_SIZE || dst_h < MINI_SIDE_SIZE) return null;
  const result = my_create_bitmap(dst_w, dst_h);
  blit(src, result, min_x, min_y, 0, 0, dst_w, dst_h);
  return result;
}

function spread_color_down(bmp: Bitmap, color1: number, color2: number): number {
  let found = 0;
  for (let y = 0; y < bmp.h; ++y) {
    for (let x = 0; x < bmp.w; ++x) {
      if (getpixel(bmp, x, y) === color2) {
        let x1 = x - 1;
        if (x1 < 0) x1 = 0;
        let x2 = x + 1;
        if (x2 > bmp.w - 1) x2 = bmp.w - 1;
        let y2 = y + 1;
        if (y2 > bmp.h - 1) y2 = bmp.h - 1;
        if (getpixel(bmp, x2, y) === color1) {
          putpixel(bmp, x2, y, color2);
          found++;
        }
        if (getpixel(bmp, x2, y2) === color1) {
          putpixel(bmp, x2, y2, color2);
          found++;
        }
        if (getpixel(bmp, x, y2) === color1) {
          putpixel(bmp, x, y2, color2);
          found++;
        }
        if (getpixel(bmp, x1, y2) === color1) {
          putpixel(bmp, x1, y2, color2);
          found++;
        }
      }
    }
  }
  return found;
}

function spread_color_up(bmp: Bitmap, color1: number, color2: number): number {
  let found = 0;
  for (let y = bmp.h - 1; y >= 0; --y) {
    for (let x = bmp.w - 1; x >= 0; --x) {
      if (getpixel(bmp, x, y) === color2) {
        let x1 = x - 1;
        if (x1 < 0) x1 = 0;
        let x2 = x + 1;
        if (x2 > bmp.w - 1) x2 = bmp.w - 1;
        let y1 = y - 1;
        if (y1 < 0) y1 = 0;
        if (getpixel(bmp, x1, y) === color1) {
          putpixel(bmp, x1, y, color2);
          found++;
        }
        if (getpixel(bmp, x1, y1) === color1) {
          putpixel(bmp, x1, y1, color2);
          found++;
        }
        if (getpixel(bmp, x, y1) === color1) {
          putpixel(bmp, x, y1, color2);
          found++;
        }
        if (getpixel(bmp, x2, y1) === color1) {
          putpixel(bmp, x2, y1, color2);
          found++;
        }
      }
    }
  }
  return found;
}

function check_if_playable(bmp: Bitmap): boolean {
  let x = 0, y = 0;
  let unplayable = 0;
  let playable_place = 0;
  hline(bmp, 0, 0, bmp.w - 1, CONSIDERED_AS_DARK);
  hline(bmp, 0, bmp.h - 1, bmp.w - 1, CONSIDERED_AS_DARK);
  vline(bmp, 0, 0, bmp.h - 1, CONSIDERED_AS_DARK);
  vline(bmp, bmp.w - 1, 0, bmp.h - 1, CONSIDERED_AS_DARK);
  let x0 = -1, y0 = -1;
  for (y = 0; y < bmp.h && y0 < 0; ++y) {
    for (x = 0; x < bmp.w && x0 < 0; ++x) {
      if (getpixel(bmp, x, y) === CONSIDERED_AS_LIGHT) {
        x0 = x;
        y0 = y;
      }
    }
  }
  if (x0 > 0 && y0 > 0) {
    // the loops have stepped past the point: the original starts the fill at (x0 + 1, y0 + 1)
    putpixel(bmp, x, y, PLAYABLE_AREA);
    while (spread_color_down(bmp, CONSIDERED_AS_LIGHT, PLAYABLE_AREA) + spread_color_up(bmp, CONSIDERED_AS_LIGHT, PLAYABLE_AREA));
  } else unplayable |= 1;
  for (y = 0; y < bmp.h; ++y) for (x = 0; x < bmp.w; ++x) if (getpixel(bmp, x, y) === PLAYABLE_AREA) ++playable_place;
  unplayable |= playable_place < MINI_PLAYABLE_AREA ? 1 : 0;
  return !unplayable;
}

function fill_with_fg_and_bg(bmp: Bitmap, fg: number, bg: number): void {
  for (let y = 0; y < bmp.h; ++y) for (let x = 0; x < bmp.w; ++x) putpixel(bmp, x, y, getpixel(bmp, x, y) === PLAYABLE_AREA ? bg : fg);
}

function convert_to_buffer(bmp: Bitmap, buffer: Int8Array): { size: number; bg_size: number } {
  const wh = bmp.h * bmp.w;
  const data = bmp.data;
  let pos_src = 0;
  let size = 0;
  let bg_size = 0;
  while (pos_src < wh) {
    let l = 0;
    if (data[pos_src] !== PLAYABLE_AREA) {
      while (pos_src < wh && data[pos_src] !== PLAYABLE_AREA && l < 127) {
        l++;
        pos_src++;
      }
      buffer[size++] = l;
    } else {
      while (pos_src < wh && data[pos_src] === PLAYABLE_AREA && l < 127) {
        l++;
        pos_src++;
      }
      buffer[size++] = -l;
      bg_size += l;
    }
  }
  buffer[size++] = 0;
  return { size, bg_size };
}

export function setInt(b: Uint8Array, o: number, v: number): void {
  b[o] = v & 0xff;
  b[o + 1] = (v >> 8) & 0xff;
  b[o + 2] = (v >> 16) & 0xff;
  b[o + 3] = (v >> 24) & 0xff;
}

export function getInt(b: Uint8Array, o: number): number {
  return (b[o]! | (b[o + 1]! << 8) | (b[o + 2]! << 16) | (b[o + 3]! << 24)) | 0;
}

export function getShort(b: Uint8Array, o: number): number {
  const v = b[o]! | (b[o + 1]! << 8);
  return v >= 0x8000 ? v - 0x10000 : v;
}

function setShort(b: Uint8Array, o: number, v: number): void {
  b[o] = v & 0xff;
  b[o + 1] = (v >> 8) & 0xff;
}

/** a NUL-padded C string field */
export function cstr(b: Uint8Array, o: number, n: number): string {
  let s = '';
  for (let i = 0; i < n && b[o + i]; i++) s += String.fromCharCode(b[o + i]!);
  return s;
}

function putCstr(b: Uint8Array, o: number, n: number, s: string): void {
  for (let i = 0; i < n; i++) b[o + i] = i < s.length ? s.charCodeAt(i) & 0xff : 0;
}

let customIndex = 1;

export function lw_map_archive_raw_bmp(bmp: Bitmap | null, pal: Palette, filename: string): Uint8Array | null {
  let w = 0, h = 0, size = 0;
  let temp: Int8Array | null = null;
  if (bmp) {
    sort_light_and_dark(bmp, pal);
    const sub_bmp = extract_significant_part(bmp);
    if (sub_bmp) {
      w = sub_bmp.w;
      h = sub_bmp.h;
      if (check_if_playable(sub_bmp)) {
        temp = new Int8Array(w * h + 1);
        size = convert_to_buffer(sub_bmp, temp).size;
      }
    }
  }
  if (!temp) return null;
  const result = new Uint8Array(size + 8 + LW_MAP_SYSTEM_NAME_SIZE + LW_MAP_READABLE_NAME_SIZE);
  setInt(result, 0, size);
  setShort(result, 4, w);
  setShort(result, 6, h);
  putCstr(result, 8, LW_MAP_SYSTEM_NAME_SIZE, lw_path_get_system_name(filename).slice(0, LW_MAP_SYSTEM_NAME_SIZE));
  const readable = filename === 'lwmapgen' ? 'Random map' : `Custom map ${customIndex++}`;
  putCstr(result, 8 + LW_MAP_SYSTEM_NAME_SIZE, LW_MAP_READABLE_NAME_SIZE, readable);
  result.set(new Uint8Array(temp.buffer, 0, size), 8 + LW_MAP_SYSTEM_NAME_SIZE + LW_MAP_READABLE_NAME_SIZE);
  return result;
}

function lw_map_get_safe(num: number, network: number, random: number): Uint8Array {
  if (num > G.RAW_MAP_NUMBER - 1) num = G.RAW_MAP_NUMBER - 1;
  if (num < 0) num = 0;
  if (network && G.LW_NETWORK_RAW_MAP) return G.LW_NETWORK_RAW_MAP;
  if (random && G.LW_RANDOM_RAW_MAP) return G.LW_RANDOM_RAW_MAP;
  return G.RAW_MAP_ORDERED[num]!;
}

export function lw_map_create_bicolor(num: number, fg: number, bg: number, network: number, random: number,
  min_w: number, min_h: number, zoom: { v: number }): Bitmap | null {
  const raw = lw_map_get_safe(num, network, random);
  const base = 8 + LW_MAP_SYSTEM_NAME_SIZE + LW_MAP_READABLE_NAME_SIZE;
  const size = getInt(raw, 0);
  const w = getShort(raw, 4);
  const h = getShort(raw, 6);
  const surface = w * h;
  zoom.v = calc_zoom_factor(w, h, min_w, min_h);
  let pos_src = 0, pos_dst = 0;
  let result: Bitmap | null = null;
  const temp = my_create_bitmap(w, h);
  const data_dst = temp.data;
  let l;
  while (pos_src < size && (l = (raw[base + pos_src++]! << 24) >> 24) !== 0) {
    let color;
    if (l > 0) color = CONSIDERED_AS_DARK;
    else {
      l = -l;
      color = CONSIDERED_AS_LIGHT;
    }
    for (let i = 0; i < l && pos_dst < surface; ++i) data_dst[pos_dst++] = color;
  }
  if (check_if_playable(temp)) {
    fill_with_fg_and_bg(temp, fg, bg);
    const z = zoom.v;
    result = my_create_bitmap(w * z, h * z);
    for (let y = 0; y < h; ++y) {
      for (let x = 0; x < w; ++x) {
        const color = getpixel(temp, x, y);
        for (let i = 0; i < z; ++i) for (let j = 0; j < z; ++j) putpixel(result, x * z + j, y * z + i, color);
      }
    }
  } else log_println_str('Error: unplayable map!');
  return result;
}

export function lw_map_create_textured(num: number, fg: number, bg: number, network: number, random: number,
  min_w: number, min_h: number): Bitmap | null {
  const bg_tex = lw_texture_create_bg(bg);
  const fg_tex = lw_texture_create_fg(fg);
  const zoom = { v: 1 };
  const result = lw_map_create_bicolor(num, 1, 0, network, random, min_w, min_h, zoom);
  if (!result) return null;
  const zoom_factor = zoom.v;
  const bg_w = bg_tex.w, bg_h = bg_tex.h, fg_w = fg_tex.w, fg_h = fg_tex.h;
  const w = result.w, h = result.h;
  let zoom_factor_fg = zoom_factor, zoom_factor_bg = zoom_factor;
  if (w !== zoom_factor * fg_tex.w || h !== zoom_factor * fg_tex.h) zoom_factor_fg = 1;
  if (w !== zoom_factor * bg_tex.w || h !== zoom_factor * bg_tex.h) zoom_factor_bg = 1;
  for (let y = 0; y < h; ++y) {
    for (let x = 0; x < w; ++x) {
      let color;
      if (getpixel(result, x, y)) {
        // the original divides y by the background's zoom here too
        color = getpixel(fg_tex, Math.trunc(x / zoom_factor_fg) % fg_w, Math.trunc(y / zoom_factor_bg) % fg_h);
      } else {
        color = getpixel(bg_tex, Math.trunc(x / zoom_factor_bg) % bg_w, Math.trunc(y / zoom_factor_bg) % bg_h);
      }
      putpixel(result, x, y, color);
    }
  }
  return result;
}

export function lw_map_get_system_name(num: number, network: number, random: number): string {
  return cstr(lw_map_get_safe(num, network, random), 8, LW_MAP_SYSTEM_NAME_SIZE);
}

export function lw_map_get_readable_name(num: number, network: number, random: number): string {
  return cstr(lw_map_get_safe(num, network, random), 8 + LW_MAP_SYSTEM_NAME_SIZE, LW_MAP_READABLE_NAME_SIZE);
}

export function lw_map_get_res(num: number, network: number, random: number, min_w: number, min_h: number): { w: number; h: number } {
  const raw = lw_map_get_safe(num, network, random);
  const res_w = getShort(raw, 4);
  const res_h = getShort(raw, 6);
  const z = calc_zoom_factor(res_w, res_h, min_w, min_h);
  return { w: res_w * z, h: res_h * z };
}
