// The SDL_ttf functions basegraph.cpp calls (PORTING-STAGE2.md, section 3), for the interface font
// DejaVuSans-Bold.ttf and the Chinese font NotoSans-Regular.ttf. Stage 2, package U1 (stage 3: the translations'
// characters and Noto Sans). The shim is the port's own; TTF_Size_Internal follows SDL2_ttf 2.24's (zlib license,
// (C) Sam Lantinga) with HarfBuzz's shaping of these fonts reduced to what it does with them.
//
// Measuring (TTF_SizeUTF8) is exact: src/fontmetrics.ts and src/fontmetrics-noto.ts (generated from the oracle's
// libraries by re/hyperrogue/tools/gen-fontmetrics.sh) have, per size, HarfBuzz's (hinted) advances and SDL_ttf's
// glyph boxes. HarfBuzz applies neither kerning nor ligatures to these fonts as SDL_ttf calls it (the buffer's
// script stays unknown, DejaVu has kern/liga only for latn; NOTES.md "Font metrics"), so a glyph per character.
// TTF_Size_Internal then places the glyphs as SDL_ttf does: x in 26.6, the glyph box at FT_FLOOR(x) + left, the
// line box from 0 / the font height, the end of the last advance. test/fontmetrics.test.ts compares with
// TTF_SizeUTF8 for the check strings of both fonts (English and the translations' texts; all equal).
//
// The tables have the characters of the English texts (Latin-1, Latin Extended-A, Greek, symbols) and of all
// translations (Cyrillic, the diacritics, the Chinese characters and punctuation), each those its font has.
// Characters a font lacks are measured as its .notdef box, which is what SDL_ttf does; for characters the font
// has but the table does not, this is a deviation (no text of the game has one). The Noto Sans table (190 KB
// gzipped) is loaded when a font of that file is first opened (`fontmetrics_load`; Chinese, or font_id 3): until it
// has arrived, such a font is measured with DejaVu Sans Bold's table, and re-measured with its own afterwards.
// Other fonts (DejaVu Sans, CMU Sans Serif, OpenDyslexic, font.ttf/otf) are measured with DejaVuSans-Bold's
// metrics and drawn with their own face (a deviation, README.md).
//
// Drawing: TTF_RenderUTF8_* returns a surface that remembers the text, and SDL_BlitSurface onto the window draws it
// with the canvas' fillText at the same rectangle (the baseline at the TTF ascent below the top). Headless (no
// canvas) nothing is drawn; `ttf_record` (the tests) receives every blit as the oracle's harness records it.
import * as dejavu from './fontmetrics.ts';
import { sdl_srend } from './sdlgfx.ts';

const ALPHA = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';

/** a generated metrics module (fontmetrics.ts, fontmetrics-noto.ts) */
interface fm_module {
  FM_UPEM: number;
  FM_GLYPHS: readonly (readonly number[])[];
  FM_SIZES: readonly (readonly number[])[];
  FM_SIZE_DATA: readonly string[];
  FM_LIGS: readonly (readonly number[])[];
  FM_KERN: readonly number[];
}

/** a metrics table with its indices */
class fm_table {
  /** the table index of each codepoint */
  glyph_index = new Map<number, number>();
  size_row = new Map<number, number>();
  /** kerning (font units) by first * 65536 + second table index */
  kern = new Map<number, number>();
  /** the ligatures by their first character's table index: [glyph, the characters...], longer ones first */
  ligs = new Map<number, (readonly number[])[]>();
  m: fm_module;
  constructor(m: fm_module) {
    this.m = m;
    for (let i = 0; i < m.FM_GLYPHS.length; i++) if (m.FM_GLYPHS[i][0] >= 0) this.glyph_index.set(m.FM_GLYPHS[i][0], i);
    for (let i = 0; i < m.FM_SIZES.length; i++) this.size_row.set(m.FM_SIZES[i][0], i);
    for (let i = 0; i < m.FM_KERN.length; i += 3) this.kern.set(m.FM_KERN[i] * 65536 + m.FM_KERN[i + 1], m.FM_KERN[i + 2]);
    for (const l of m.FM_LIGS) {
      if (!this.ligs.has(l[1])) this.ligs.set(l[1], []);
      this.ligs.get(l[1])!.push(l);
    }
  }
}

const table_dejavu = new fm_table(dejavu);
/** the font files with a table of their own, and how to load it */
const table_loaders = new Map<string, () => Promise<fm_module>>([
  ['NotoSans-Regular.ttf', () => import('./fontmetrics-noto.ts')],
]);
const tables = new Map<string, fm_table>([['DejaVuSans-Bold.ttf', table_dejavu]]);
const table_loading = new Map<string, Promise<void>>();

/** loads the metrics table of a font file (once) */
export function fontmetrics_load(name: string): Promise<void> {
  const loader = table_loaders.get(name);
  if (!loader) return Promise.resolve();
  let p = table_loading.get(name);
  if (!p) {
    p = loader().then((m) => { tables.set(name, new fm_table(m)); });
    table_loading.set(name, p);
  }
  return p;
}

/** loads every metrics table (the tests) */
export function fontmetrics_load_all(): Promise<void> {
  return Promise.all([...table_loaders.keys()].map(fontmetrics_load)).then(() => undefined);
}

/** the table a font file is measured with (DejaVu Sans Bold's while its own is loading, or if it has none) */
function table_of(file: string): fm_table {
  for (const [name, t] of tables) if (file.endsWith(name)) return t;
  for (const name of table_loaders.keys()) if (file.endsWith(name)) { void fontmetrics_load(name); break; }
  return table_dejavu;
}

/** TTF_Font: one face at one size (SDL_ttf opens one TTF_Font per size; basegraph.cpp keeps them in fontdata) */
export class TTF_Font {
  filename = '';
  ptsize = 0;
  /** the table the numbers below come from */
  table: fm_table | null = null;
  /** TTF_FontHeight, TTF_FontAscent */
  height = 0;
  ascent = 0;
  /** HarfBuzz's x_scale at this size (the kerning's scale) */
  xscale = 0;
  /** per table glyph: HarfBuzz's advance (26.6), SDL_ttf's sz_left, sz_width, sz_top, sz_rows */
  adv: Int32Array = new Int32Array(0);
  left: Int32Array = new Int32Array(0);
  width: Int32Array = new Int32Array(0);
  top: Int32Array = new Int32Array(0);
  rows: Int32Array = new Int32Array(0);
}

/** the font-unit values the table's per-size numbers are relative to (gen-fontmetrics.py predict) */
const fdiv = (a: number, b: number): number => Math.floor(a / b);
function fm_predict(upem: number, s: number, g: readonly number[]): number[] {
  const [, advfu, xmin, xmax, ymin, ymax] = g;
  const adv = fdiv(advfu * s * 2 + upem, 2 * upem);
  const left = fdiv(xmin * s, upem);
  const right = -fdiv(-xmax * s, upem);
  const top = -fdiv(-ymax * s, upem);
  const bottom = fdiv(ymin * s, upem);
  return [adv, left, right - left, top, top - bottom];
}

/** fills f's numbers from its file's table (again when that table has arrived) */
function ttf_fill(f: TTF_Font): TTF_Font {
  const t = table_of(f.filename);
  if (f.table === t) return f;
  const m = t.m;
  let row = t.size_row.get(f.ptsize);
  if (row === undefined) {
    row = 0;
    for (let i = 0; i < m.FM_SIZES.length; i++) if (m.FM_SIZES[i][0] <= f.ptsize) row = i;
  }
  const [s, height, ascent, xscale] = m.FM_SIZES[row];
  f.table = t; f.height = height; f.ascent = ascent; f.xscale = xscale;
  const n = m.FM_GLYPHS.length, data = m.FM_SIZE_DATA[row];
  f.adv = new Int32Array(n); f.left = new Int32Array(n); f.width = new Int32Array(n); f.top = new Int32Array(n); f.rows = new Int32Array(n);
  for (let i = 0; i < n; i++) {
    const p = fm_predict(m.FM_UPEM, s, m.FM_GLYPHS[i]);
    const d = (k: number): number => p[k] + ALPHA.indexOf(data[i * 5 + k]) - 32;
    f.adv[i] = d(0) * 64; f.left[i] = d(1); f.width[i] = d(2); f.top[i] = d(3); f.rows[i] = d(4);
  }
  return f;
}

/** TTF_OpenFont(file, ptsize): the sizes are fix_font_size's (others take the next smaller size of the table) */
export function TTF_OpenFont(file: string, ptsize: number): TTF_Font | null {
  const f = new TTF_Font();
  f.filename = file; f.ptsize = ptsize;
  return ttf_fill(f);
}

export function TTF_CloseFont(_f: TTF_Font): void { }
export function TTF_Init(): number { return 0; }
export function TTF_Quit(): void { }
export function TTF_FontHeight(f: TTF_Font): number { return ttf_fill(f).height; }
export function TTF_FontAscent(f: TTF_Font): number { return ttf_fill(f).ascent; }

/** TTF_GlyphIsProvided32: whether the font has the character (the table's characters) */
export function TTF_GlyphIsProvided32(f: TTF_Font, ch: number): boolean { return ttf_fill(f).table!.glyph_index.has(ch); }

/** HarfBuzz's shaping of a string with this font: one glyph (table index; 0 = .notdef) per character, its advance
 *  (26.6) */
function shape(f: TTF_Font, text: string): { glyphs: number[]; adv: number[] } {
  ttf_fill(f);
  const t = f.table!;
  const chars: number[] = [];
  for (const ch of text) chars.push(t.glyph_index.get(ch.codePointAt(0)!) ?? 0);
  const glyphs: number[] = [], adv: number[] = [];
  // GSUB liga: at each position the first ligature that matches (the font lists longer ones first)
  for (let p = 0; p < chars.length;) {
    let g = chars[p], len = 1;
    for (const l of t.ligs.get(chars[p]) ?? []) {
      let ok = p + l.length - 1 <= chars.length;
      for (let k = 2; ok && k < l.length; k++) ok = chars[p + k - 1] === l[k];
      if (ok) { g = l[0]; len = l.length - 1; break; }
    }
    glyphs.push(g); adv.push(f.adv[g]);
    p += len;
  }
  // GPOS kern: the first glyph's advance of each pair, scaled as HarfBuzz scales font units (em_mult)
  if (t.kern.size) {
    const xm = Math.floor(f.xscale * 65536 / t.m.FM_UPEM);
    for (let k = 0; k + 1 < glyphs.length; k++) {
      const dx = t.kern.get(glyphs[k] * 65536 + glyphs[k + 1]);
      if (dx !== undefined) adv[k] += Math.floor((dx * xm + 32768) / 65536);
    }
  }
  return { glyphs, adv };
}

const FT_FLOOR = (x: number): number => Math.floor(x / 64);

/** TTF_Size_Internal (SDL2_ttf 2.24, HarfBuzz branch, no outline/style): w, h and where the line starts */
function TTF_Size_Internal(f: TTF_Font, text: string): { w: number; h: number; xstart: number; ystart: number } {
  const { glyphs, adv } = shape(f, text);
  let x = 0;
  let minx = 0, maxx = 0;
  let miny = 0, maxy = f.height;
  for (let g = 0; g < glyphs.length; g++) {
    const idx = glyphs[g];
    let pos_x = x;
    let pos_y = f.ascent * 64;
    x += adv[g];
    pos_x = FT_FLOOR(pos_x) + f.left[idx];
    pos_y = FT_FLOOR(pos_y) - f.top[idx];
    minx = Math.min(minx, pos_x);
    maxx = Math.max(maxx, pos_x + f.width[idx]);
    miny = Math.min(miny, pos_y);
    maxy = Math.max(maxy, pos_y + f.rows[idx]);
  }
  // the advance of the last glyph counts (a string of spaces has a width)
  maxx = Math.max(maxx, FT_FLOOR(x)); // FT_FLOOR(x + prev_advance), prev_advance 0 with HarfBuzz
  return { w: maxx - minx, h: maxy - miny, xstart: minx < 0 ? -minx : 0, ystart: miny < 0 ? -miny : 0 };
}

/** TTF_SizeUTF8(font, text, &w, &h) */
export function TTF_SizeUTF8(f: TTF_Font, text: string): { w: number; h: number } {
  const r = TTF_Size_Internal(f, text);
  return { w: r.w, h: r.h };
}

/** SDL_Color */
export interface SDL_Color { r: number; g: number; b: number; a: number }

/** the surface TTF_RenderUTF8_* makes: its size, and what to draw */
export class SDL_Surface {
  w = 0; h = 0;
  text = '';
  font: TTF_Font | null = null;
  color: SDL_Color = { r: 0, g: 0, b: 0, a: 255 };
  xstart = 0; ystart = 0;
}

/** TTF_RenderUTF8_Blended(font, text, fg) (and _Solid): null for an empty text, as SDL_ttf */
export function TTF_RenderUTF8_Blended(f: TTF_Font, text: string, fg: SDL_Color): SDL_Surface | null {
  if (text === '') return null;
  const r = TTF_Size_Internal(f, text);
  if (r.w === 0) return null;
  const s = new SDL_Surface();
  s.w = r.w; s.h = r.h; s.text = text; s.font = f; s.color = { ...fg }; s.xstart = r.xstart; s.ystart = r.ystart;
  return s;
}
export const TTF_RenderUTF8_Solid = TTF_RenderUTF8_Blended;

/** the record of a blitted text, as harness.cpp prints it: `text x y w h size rrggbb string` */
export interface text_record { x: number; y: number; w: number; h: number; size: number; col: number; str: string }
/** the tests set this to receive every text blitted onto the window */
export const ttf_record: { on: ((t: text_record) => void) | null } = { on: null };

/** the CSS font family of each font file (the browser's start code loads them as FontFaces: ttf_load_fonts) */
const families = new Map<string, string>();

/** the font files that are loaded when first drawn (Noto Sans, 17 MB: Chinese, or font_id 3), not at the start */
const lazy_fonts = new Set(['NotoSans-Regular.ttf']);
/** the fonts whose kerning and ligatures SDL_ttf applies (HarfBuzz under the DFLT script: fontmetrics-noto.ts) */
const kerned_fonts = new Set(['NotoSans-Regular.ttf']);
const font_urls = new Map<string, string>();
const face_loading = new Map<string, Promise<void>>();
let family_count = 0;

/** loads one font file as a FontFace for the canvas (once) */
export function ttf_load_face(name: string): Promise<void> {
  let p = face_loading.get(name);
  if (!p) {
    const url = font_urls.get(name);
    if (url === undefined) return Promise.resolve();
    const family = `hyperrogue-font-${family_count++}`;
    // DejaVu: no kerning, no ligatures, as SDL_ttf shapes it (fontmetrics.ts); Noto Sans: the font's defaults
    const ff = kerned_fonts.has(name) ? new FontFace(family, `url(${url})`) :
      new FontFace(family, `url(${url})`, { featureSettings: '"kern" 0, "liga" 0, "clig" 0' });
    p = ff.load().then(() => {
      (document.fonts as unknown as { add(f: FontFace): void }).add(ff);
      families.set(name, family);
    }, (e: unknown) => { console.warn(`hyperrogue: could not load ${name}`, e); });
    face_loading.set(name, p);
  }
  return p;
}

/** the font files as FontFaces for the canvas (the browser's start code: url of each file by its name): all but
 *  the lazy ones now */
export async function ttf_load_fonts(urls: Map<string, string>): Promise<void> {
  for (const [name, url] of urls) font_urls.set(name, url);
  for (const name of urls.keys()) if (!lazy_fonts.has(name)) await ttf_load_face(name);
}

/** the CSS family of a font file (a lazy one starts loading: until it is there, the browser's sans-serif) */
function family_of(file: string): string {
  for (const [name, fam] of families) if (file.endsWith(name)) return fam;
  for (const name of lazy_fonts) if (file.endsWith(name)) void ttf_load_face(name);
  return 'sans-serif';
}

function kerned(file: string): boolean {
  for (const name of kerned_fonts) if (file.endsWith(name)) return true;
  return false;
}

/** SDL_BlitSurface(src, NULL, dst, &rect): the text drawn on the window (the canvas) at rect's corner */
export function SDL_BlitSurface(src: SDL_Surface, rect: { x: number; y: number }): number {
  if (ttf_record.on) {
    const c = src.color;
    ttf_record.on({ x: rect.x, y: rect.y, w: src.w, h: src.h, size: src.font!.ptsize, col: (c.r << 16 | c.g << 8 | c.b) >>> 0, str: src.text });
  }
  const ctx = sdl_srend().ctx;
  if (!ctx || !src.font) return 0;
  const f = src.font;
  ctx.save();
  ctx.font = `${f.ptsize}px "${family_of(f.filename)}"`;
  ctx.textBaseline = 'alphabetic';
  ctx.textAlign = 'left';
  ctx.fontKerning = kerned(f.filename) ? 'normal' : 'none';
  ctx.fillStyle = `rgba(${src.color.r},${src.color.g},${src.color.b},${src.color.a / 255})`;
  ctx.fillText(src.text, rect.x + src.xstart, rect.y + src.ystart + f.ascent);
  ctx.restore();
  return 0;
}

/** the shift branch of basegraph.cpp displaystr (added by U2: inv::show draws its texts with shift 2 in the non-GL
 *  path): every pixel of the rendered text is ORed into the window, the red part of `color` shifted left by
 *  `shift`, its green and blue right. The canvas approximates the OR with additive ("lighter") drawing of the
 *  glyphs. Not a blit: the harness records no text for it (scenarios-format.md), and neither does this. */
export function SDL_OrText_anaglyph(src: SDL_Surface, rect: { x: number; y: number }, shift: number, color: number): void {
  const ctx = sdl_srend().ctx;
  if (!ctx || !src.font) return;
  const f = src.font;
  ctx.save();
  ctx.font = `${f.ptsize}px "${family_of(f.filename)}"`;
  ctx.textBaseline = 'alphabetic';
  ctx.textAlign = 'left';
  ctx.fontKerning = kerned(f.filename) ? 'normal' : 'none';
  ctx.globalCompositeOperation = 'lighter';
  const r = (color >>> 16) & 255, g = (color >>> 8) & 255, b = color & 255;
  ctx.fillStyle = `rgb(${r},0,0)`;
  ctx.fillText(src.text, rect.x - shift + src.xstart, rect.y + src.ystart + f.ascent);
  ctx.fillStyle = `rgb(0,${g},${b})`;
  ctx.fillText(src.text, rect.x + shift + src.xstart, rect.y + src.ystart + f.ascent);
  ctx.restore();
}

/** SDL_FreeSurface */
export function SDL_FreeSurface(_s: SDL_Surface | null): void { }
