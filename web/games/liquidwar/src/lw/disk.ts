// lw/disk.ts: src/disk.c: loading the datafile (fonts, maps, background, sounds, textures, map textures,
// water sounds, musics) and the custom maps, textures and musics, and ordering the maps by name.

import type { Bitmap } from '../al/bitmap.ts';
import { type DataObject, find_datafile_object, type Font, type Midi, type Sample } from '../al/datafile.ts';
import { getpixel, putpixel } from '../al/bitmap.ts';
import { load_bmp, load_midi } from '../al/loaders.ts';
import type { Palette } from '../al/palette.ts';
import { lw_map_archive_raw_bmp, lw_map_get_readable_name } from './map.ts';
import { G } from './state.ts';
import { lw_texture_archive_raw_bmp } from './texture.ts';
import { log_print_str, log_println_str } from './log.ts';

const SAMPLE_SFX_NUMBER = 6;

export interface GameFiles {
  dat: DataObject[];
  /** the custom directories, in the order Allegro's for_each_file_ex hands them over */
  map: [string, Uint8Array][];
  texture: [string, Uint8Array][];
  music: [string, Uint8Array][];
}

function sub(df: DataObject): DataObject[] {
  return df.dat as DataObject[];
}

function read_sfx_dat(df: DataObject[]): void {
  const list: Sample[] = [];
  for (let i = 0; i < SAMPLE_SFX_NUMBER && i < df.length; ++i) list[i] = df[0]!.dat as Sample;
  for (let i = 0; i < 6 && i < df.length; ++i) list[i] = df[i]!.dat as Sample;
  G.SAMPLE_SFX_TIME = list[0] ?? null;
  G.SAMPLE_SFX_WIN = list[1] ?? null;
  G.SAMPLE_SFX_CONNECT = list[2] ?? null;
  G.SAMPLE_SFX_GO = list[3] ?? null;
  G.SAMPLE_SFX_CLICK = list[4] ?? null;
  G.SAMPLE_SFX_LOOSE = list[5] ?? null;
  const names = ['time', 'win', 'connect', 'go', 'click', 'loose'];
  list.forEach((s, i) => {
    if (s && !s.name) s.name = names[i];
  });
}

function read_water_dat(df: DataObject[]): void {
  for (let i = 0; i < 32 && i < df.length; ++i) {
    const s = df[i]!.dat as Sample;
    s.name = `water${i}`;
    G.SAMPLE_WATER[i] = s;
    G.SAMPLE_WATER_NUMBER++;
  }
}

function read_back_dat(df: DataObject[]): void {
  const pal = df[1]!.dat as Palette;
  const back = df[0]!.dat as Bitmap;
  G.BACK_IMAGE = back;
  for (let i = 0; i <= 45; ++i) G.GLOBAL_PALETTE.set(pal.subarray(i * 3, i * 3 + 3), (i + 18) * 3);
  // the original's loop runs y up to the width: for 640x480 the rows below 480 are outside the bitmap
  for (let x = 0; x < back.w; ++x) for (let y = 0; y < back.w; ++y) putpixel(back, x, y, getpixel(back, x, y) + 18);
}

function read_font_dat(df: DataObject[]): void {
  const pal = df[4]!.dat as Palette;
  G.SMALL_FONT = df[0]!.dat as Font;
  G.BIG_FONT = df[1]!.dat as Font;
  G.SMALL_MOUSE_CURSOR = df[2]!.dat as Bitmap;
  G.BIG_MOUSE_CURSOR = df[3]!.dat as Bitmap;
  G.INVISIBLE_MOUSE_CURSOR = df[5]!.dat as Bitmap;
  for (let i = 1; i <= 17; ++i) G.GLOBAL_PALETTE.set(pal.subarray(i * 3, i * 3 + 3), i * 3);
}

export function load_dat(files: GameFiles): boolean {
  const get = (name: string): DataObject | null => find_datafile_object(files.dat, name);
  let df = get('font_dat');
  if (!df) return false;
  read_font_dat(sub(df));
  df = get('map_dat');
  if (!df) return false;
  G.RAW_MAP_NUMBER = 0;
  for (const o of sub(df)) {
    if (G.RAW_MAP_NUMBER >= 512) break;
    G.RAW_MAP[G.RAW_MAP_NUMBER++] = o.dat as Uint8Array;
  }
  if (G.STARTUP_BACK_STATE) {
    df = get('back_dat');
    if (df) {
      read_back_dat(sub(df));
      G.LOADED_BACK = 1;
    }
  }
  if (G.STARTUP_SFX_STATE) {
    df = get('sfx_dat');
    if (df) {
      read_sfx_dat(sub(df));
      G.LOADED_SFX = 1;
    }
  }
  if (G.STARTUP_TEXTURE_STATE) {
    df = get('texture_dat');
    if (df) {
      G.RAW_TEXTURE_NUMBER = 0;
      for (const o of sub(df)) G.RAW_TEXTURE[G.RAW_TEXTURE_NUMBER++] = o.dat as Uint8Array;
      G.LOADED_TEXTURE = 1;
    }
    df = get('maptex_dat');
    if (df) {
      G.RAW_MAPTEX_NUMBER = 0;
      for (const o of sub(df)) G.RAW_MAPTEX[G.RAW_MAPTEX_NUMBER++] = o.dat as Uint8Array;
      G.LOADED_MAPTEX = 1;
    }
  }
  if (G.STARTUP_WATER_STATE) {
    df = get('water_dat');
    if (df) {
      read_water_dat(sub(df));
      G.LOADED_WATER = 1;
    }
  }
  if (G.STARTUP_MUSIC_STATE) {
    df = get('music_dat');
    if (df) {
      G.MIDI_MUSIC_NUMBER = 0;
      for (const o of sub(df)) {
        const m = o.dat as Midi;
        m.name = o.name;
        G.MIDI_MUSIC[G.MIDI_MUSIC_NUMBER++] = m;
      }
      G.LOADED_MUSIC = 1;
    }
  }
  return true;
}

/** the files for_each_file_ex hands over for "*.*" (names with a dot) */
function withDot(list: [string, Uint8Array][]): [string, Uint8Array][] {
  return list.filter(([n]) => n.includes('.'));
}

export function load_custom(files: GameFiles): void {
  if (G.STARTUP_TEXTURE_STATE && G.STARTUP_CUSTOM_STATE) {
    for (const [name, bytes] of withDot(files.texture)) {
      const l = load_bmp(bytes);
      const raw = l ? lw_texture_archive_raw_bmp(l.bmp, l.pal, name) : null;
      if (raw) {
        G.RAW_TEXTURE[G.RAW_TEXTURE_NUMBER++] = raw;
        log_print_str('+');
      } else log_print_str('-');
    }
    log_println_str('');
  }
  if (G.STARTUP_CUSTOM_STATE) {
    for (const [name, bytes] of withDot(files.map)) {
      const l = load_bmp(bytes);
      const raw = l ? lw_map_archive_raw_bmp(l.bmp, l.pal, name) : null;
      if (raw) {
        G.RAW_MAP[G.RAW_MAP_NUMBER++] = raw;
        log_print_str('+');
      } else log_print_str('-');
    }
    log_println_str('');
  }
  if (G.STARTUP_CUSTOM_STATE && G.STARTUP_MUSIC_STATE) {
    for (const [name, bytes] of withDot(files.music)) {
      const m = load_midi(bytes);
      if (m) {
        m.name = name;
        G.MIDI_MUSIC[G.MIDI_MUSIC_NUMBER++] = m;
      }
    }
  }
}

export function order_map(): void {
  for (let i = 0; i < G.RAW_MAP_NUMBER; ++i) G.RAW_MAP_ORDERED[i] = G.RAW_MAP[i]!;
  let incorrect_order = true;
  while (incorrect_order) {
    incorrect_order = false;
    for (let i = 0; i < G.RAW_MAP_NUMBER - 1; ++i) {
      const name1 = lw_map_get_readable_name(i, 0, 0);
      const name2 = lw_map_get_readable_name(i + 1, 0, 0);
      if (strcmp(name1, name2) > 0) {
        incorrect_order = true;
        const t = G.RAW_MAP_ORDERED[i]!;
        G.RAW_MAP_ORDERED[i] = G.RAW_MAP_ORDERED[i + 1]!;
        G.RAW_MAP_ORDERED[i + 1] = t;
      }
    }
  }
}

/** strcmp on byte strings (unsigned chars) */
export function strcmp(a: string, b: string): number {
  const n = Math.min(a.length, b.length);
  for (let i = 0; i < n; i++) {
    const d = (a.charCodeAt(i) & 0xff) - (b.charCodeAt(i) & 0xff);
    if (d) return d;
  }
  return a.length - b.length;
}
