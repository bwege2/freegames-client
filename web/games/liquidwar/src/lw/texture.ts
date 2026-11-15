// lw/texture.ts: src/texture.c: textures in the datafile's packed form (w, h as little-endian shorts, a
// 16-byte system name, 32 RGB palette entries, then 5 bit planes per 8 pixels), custom textures reduced
// to 32 colours at random as the original does at start, and texture bitmaps for the map's walls and floor.

import { type Bitmap, create_bitmap, getpixel, putpixel } from '../al/bitmap.ts';
import { bestfit_color, type Palette } from '../al/palette.ts';
import { random } from '../glibc.ts';
import { lw_path_get_system_name } from './path.ts';
import {
  BG_TEXTURE_FIRST_COLOR, CHOOSE_COLOR_NUMBER, FG_TEXTURE_FIRST_COLOR, G, LW_MAP_SYSTEM_NAME_SIZE,
  LW_TEXTURE_SYSTEM_NAME_SIZE, TEXTURE_COLOR_NUMBER,
} from './state.ts';

const LW_TEXTURE_RANDOM_MAX_RETRIES = 10000;

function find_color(pal: Palette, r: number, g: number, b: number): number {
  for (let i = 0; i < 256; ++i) if (pal[i * 3] === r && pal[i * 3 + 1] === g && pal[i * 3 + 2] === b) return i;
  return -1;
}

function exist_color(pal: Palette, r: number, g: number, b: number): boolean {
  return find_color(pal, r, g, b) >= 0;
}

function recalculate_number_of_colors(max_number: number, bmp: Bitmap, pal: Palette): number {
  let n = 1;
  const c0 = getpixel(bmp, 0, 0) & 0xff;
  const pal2 = new Uint8Array(768);
  for (let i = 0; i < 256; ++i) pal2.set(pal.subarray(c0 * 3, c0 * 3 + 3), i * 3);
  for (let y = 0; y < bmp.h && n < max_number; ++y) {
    for (let x = 0; x < bmp.w && n < max_number; ++x) {
      const c = getpixel(bmp, x, y) & 0xff;
      const r = pal[c * 3]!, g = pal[c * 3 + 1]!, b = pal[c * 3 + 2]!;
      if (!exist_color(pal2, r, g, b)) {
        pal2[n * 3] = r;
        pal2[n * 3 + 1] = g;
        pal2[n * 3 + 2] = b;
        n++;
      }
    }
  }
  return n;
}

function create_new_palette(dst: Palette, src: Palette, bmp: Bitmap, first_color: number, number_of_colors: number): void {
  let nb_retries = 0;
  let x = random() % bmp.w;
  let y = random() % bmp.h;
  let c = getpixel(bmp, x, y) & 0xff;
  for (let i = 0; i < 256; ++i) dst.set(src.subarray(c * 3, c * 3 + 3), i * 3);
  for (let i = 1; i < number_of_colors;) {
    x = random() % bmp.w;
    y = random() % bmp.h;
    c = getpixel(bmp, x, y) & 0xff;
    const r = src[c * 3]!, g = src[c * 3 + 1]!, b = src[c * 3 + 2]!;
    if (!exist_color(dst, r, g, b) || nb_retries > LW_TEXTURE_RANDOM_MAX_RETRIES) {
      const k = first_color + i++;
      dst[k * 3] = r;
      dst[k * 3 + 1] = g;
      dst[k * 3 + 2] = b;
      nb_retries = 0;
    } else nb_retries++;
  }
}

function correct_palette(pal: Palette, first_color: number, number_of_colors: number): void {
  for (let i = 0; i < first_color; ++i) pal[i * 3] = pal[i * 3 + 1] = pal[i * 3 + 2] = 0;
  for (let i = first_color + number_of_colors; i < 256; ++i) pal[i * 3] = pal[i * 3 + 1] = pal[i * 3 + 2] = 63;
}

function create_converted_bitmap(bmp: Bitmap, dst: Palette, src: Palette, first_color: number, number_of_colors: number): void {
  const corres = new Int8Array(256);
  for (let i = 0; i < 256; ++i) corres[i] = bestfit_color(dst, src[i * 3]!, src[i * 3 + 1]!, src[i * 3 + 2]!);
  for (let y = 0; y < bmp.h; ++y) {
    for (let x = 0; x < bmp.w; ++x) {
      let index = corres[getpixel(bmp, x, y) & 0xff]!;
      index = index < first_color || index >= first_color + number_of_colors ? first_color : index;
      putpixel(bmp, x, y, index);
    }
  }
}

function red8col(bmp: Bitmap, pal: Palette, first_color: number, number_of_colors: number): void {
  const pal2 = pal.slice();
  number_of_colors = recalculate_number_of_colors(number_of_colors, bmp, pal);
  create_new_palette(pal, pal2, bmp, first_color, number_of_colors);
  create_converted_bitmap(bmp, pal, pal2, first_color, number_of_colors);
  correct_palette(pal, first_color, number_of_colors);
}

function texture_8to5(bmp: Bitmap, pal: Palette, result: Uint8Array, first_color: number, number_of_colors: number, filename: string): void {
  result[0] = bmp.w & 0xff;
  result[1] = (bmp.w >> 8) & 0xff;
  result[2] = bmp.h & 0xff;
  result[3] = (bmp.h >> 8) & 0xff;
  const name = lw_path_get_system_name(filename).slice(0, LW_TEXTURE_SYSTEM_NAME_SIZE);
  for (let i = 0; i < LW_TEXTURE_SYSTEM_NAME_SIZE; i++) result[4 + i] = i < name.length ? name.charCodeAt(i) : 0;
  const buffer = 4 + LW_TEXTURE_SYSTEM_NAME_SIZE;
  let pos = 0, pos8 = 0;
  for (let i = 0; i < number_of_colors; ++i) {
    result[buffer + pos++] = pal[(first_color + i) * 3]!;
    result[buffer + pos++] = pal[(first_color + i) * 3 + 1]!;
    result[buffer + pos++] = pal[(first_color + i) * 3 + 2]!;
  }
  const octet = [0, 0, 0, 0, 0];
  for (let y = 0; y < bmp.h; ++y) {
    for (let x = 0; x < bmp.w; ++x) {
      const coul = getpixel(bmp, x, y) - first_color;
      const toadd = (1 << pos8) & 0xff;
      octet[0]! |= coul & 1 ? toadd : 0;
      octet[1]! |= coul & 2 ? toadd : 0;
      octet[2]! |= coul & 4 ? toadd : 0;
      octet[3]! |= coul & 8 ? toadd : 0;
      octet[4]! |= coul & 16 ? toadd : 0;
      if (pos8 === 7 || (y === bmp.h - 1 && x === bmp.w - 1)) {
        for (let i = 0; i < 5; ++i) {
          result[buffer + pos++] = octet[i]!;
          octet[i] = 0;
        }
        pos8 = 0;
      } else pos8++;
    }
  }
}

/** lw_texture_archive_raw for a picture already loaded (a custom texture) */
export function lw_texture_archive_raw_bmp(bmp: Bitmap, pal: Palette, filename: string): Uint8Array | null {
  const w = bmp.w, h = bmp.h;
  if (w <= 0 || h <= 0) return null;
  const size = 4 + LW_TEXTURE_SYSTEM_NAME_SIZE + 3 * TEXTURE_COLOR_NUMBER + Math.trunc((w * h + 7) / 8) * 5;
  const temp = new Uint8Array(size);
  red8col(bmp, pal, 0, TEXTURE_COLOR_NUMBER);
  texture_8to5(bmp, pal, temp, 0, TEXTURE_COLOR_NUMBER, filename);
  return temp;
}

function create_raw_texture(data: Uint8Array, first: number): Bitmap {
  const w = data[0]! | (data[1]! << 8);
  const h = data[2]! | (data[3]! << 8);
  let p = 4 + LW_TEXTURE_SYSTEM_NAME_SIZE + 3 * 32;
  const result = create_bitmap(w, h);
  let pos8 = 0;
  for (let y = 0; y < h; ++y) {
    for (let x = 0; x < w; ++x) {
      const totest = 1 << pos8;
      const color = first + (data[p]! & totest ? 1 : 0) + (data[p + 1]! & totest ? 2 : 0) + (data[p + 2]! & totest ? 4 : 0) +
        (data[p + 3]! & totest ? 8 : 0) + (data[p + 4]! & totest ? 16 : 0);
      putpixel(result, x, y, color);
      if (pos8 === 7) {
        p += 5;
        pos8 = 0;
      } else pos8++;
    }
  }
  return result;
}

export function get_raw_texture(num: number): Uint8Array | null {
  const max = G.RAW_TEXTURE_NUMBER + G.RAW_MAPTEX_NUMBER + CHOOSE_COLOR_NUMBER - 1;
  if (num > max) num = max;
  let texture: Uint8Array | null = null;
  if (num >= CHOOSE_COLOR_NUMBER && num < CHOOSE_COLOR_NUMBER + G.RAW_TEXTURE_NUMBER && G.LOADED_TEXTURE) {
    texture = G.RAW_TEXTURE[num - CHOOSE_COLOR_NUMBER]!;
  }
  if (num >= CHOOSE_COLOR_NUMBER + G.RAW_TEXTURE_NUMBER && num < CHOOSE_COLOR_NUMBER + G.RAW_TEXTURE_NUMBER + G.RAW_MAPTEX_NUMBER &&
    G.LOADED_MAPTEX) {
    texture = G.RAW_MAPTEX[num - (CHOOSE_COLOR_NUMBER + G.RAW_TEXTURE_NUMBER)]!;
  }
  return texture;
}

function create_mono_texture(first: number): Bitmap {
  const result = create_bitmap(1, 1);
  putpixel(result, 0, 0, first);
  return result;
}

function create_texture(num: number, first: number): Bitmap {
  const texture = get_raw_texture(num);
  return texture ? create_raw_texture(texture, first) : create_mono_texture(first);
}

export function lw_texture_create_bg(num: number): Bitmap {
  return create_texture(num, BG_TEXTURE_FIRST_COLOR);
}

export function lw_texture_create_fg(num: number): Bitmap {
  return create_texture(num, FG_TEXTURE_FIRST_COLOR);
}

export function lw_texture_get_system_name(num: number): string {
  const raw = get_raw_texture(num);
  let s = '';
  if (raw) {
    for (let i = 0; i < LW_TEXTURE_SYSTEM_NAME_SIZE && raw[4 + i]; i++) s += String.fromCharCode(raw[4 + i]!);
  } else s = `Color ${num}`;
  return s.slice(0, LW_MAP_SYSTEM_NAME_SIZE);
}
