// al/font.ts: Allegro 4.4's colour fonts (src/font.c: color_render, color_render_char, length,
// _color_find_glyph with the missing-glyph '^') and the text functions Liquid War calls. Strings are
// byte strings (one char per byte, U_ASCII), as set_uformat(U_ASCII) has them.

import { type Bitmap, draw_character, draw_sprite, rectfill } from './bitmap.ts';
import type { Font } from './datafile.ts';

const ALLEGRO_404_CHAR = 0x5e;

/** the global `font` */
export let font: Font = { height: 8, ranges: [] };
export function setFont(f: Font): void {
  font = f;
}

function findGlyph(f: Font, ch: number): Bitmap | null {
  for (const r of f.ranges) if (ch >= r.begin && ch < r.end) return r.bitmaps[ch - r.begin]!;
  if (ch !== ALLEGRO_404_CHAR) return findGlyph(f, ALLEGRO_404_CHAR);
  return null;
}

function charLength(f: Font, ch: number): number {
  const g = findGlyph(f, ch);
  return g ? g.w : 0;
}

export function text_length(f: Font, s: string): number {
  let w = 0;
  for (let i = 0; i < s.length; i++) w += charLength(f, s.charCodeAt(i));
  return w;
}

export function text_height(f: Font): number {
  return f.height;
}

function renderChar(f: Font, ch: number, fg: number, bg: number, bmp: Bitmap, x: number, y: number): number {
  const h = f.height;
  if (fg < 0 && bg >= 0) rectfill(bmp, x, y, x + charLength(f, ch) - 1, y + h - 1, bg);
  const g = findGlyph(f, ch);
  if (!g) return 0;
  const gy = y + Math.trunc((h - g.h) / 2);
  if (fg < 0) draw_sprite(bmp, g, x, gy);
  else draw_character(bmp, g, x, gy, fg, bg);
  return g.w;
}

export function textout_ex(bmp: Bitmap, f: Font, s: string, x: number, y: number, fg: number, bg: number): void {
  if (fg < 0 && bg >= 0) {
    rectfill(bmp, x, y, x + text_length(f, s) - 1, y + f.height - 1, bg);
    bg = -1;
  }
  for (let i = 0; i < s.length; i++) x += renderChar(f, s.charCodeAt(i), fg, bg, bmp, x, y);
}

export function textout_centre_ex(bmp: Bitmap, f: Font, s: string, x: number, y: number, fg: number, bg: number): void {
  const len = text_length(f, s);
  textout_ex(bmp, f, s, x - Math.trunc(len / 2), y, fg, bg);
}
