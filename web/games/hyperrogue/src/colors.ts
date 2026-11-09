// colors.cpp of HyperRogue 13.1o: colour routines. (C) Zeno Rogue, GPL-2.0-or-later; TypeScript port (stage 2,
// package D1).
//
// color_t is a 32-bit unsigned number. `part(col, i)` returns a reference to the i-th byte (little endian: for
// colours with alpha A=0, R=1, G=2, B=3): reading is `part(col, i)`, writing is `col = set_part(col, i, v)`.
// fghostcolor's phase uses the cell's address in C++ ((int)(size_t)c): the port uses the creation serial _id
// (the original is not deterministic there; it only shifts the colour cycle of a Friendly Ghost).
import { G } from './globals.ts';
import { GDIM } from './classes.ts';
import { winf, waMirror, waCloud } from './content.ts';
import { hrand } from './rand.ts';
import { rand } from './rand.ts';
import { frac } from './util.ts';
import { sintick, fractick } from './animations.ts';
import { POLY_TRIANGLES } from './drawing.ts';
import type { cell } from './locations.ts';

/** unsigned char& part(color_t& col, int i): the byte i of col (read) */
export function part(col: number, i: number): number { return (col >>> (8 * i)) & 0xFF; }
/** part(col, i) = v: col with byte i replaced by (unsigned char) v */
export function set_part(col: number, i: number, v: number): number {
  const s = 8 * i;
  return ((col & ~(0xFF << s)) | ((v & 0xFF) << s)) >>> 0;
}

/** static constexpr color_t NOCOLOR = 0 */
export const NOCOLOR = 0;

/** struct colortable: vector<color_t> with a cyclic operator[] */
export class colortable {
  v: number[];
  constructor(v: number[] = [0]) { this.v = v.slice(); }
  get size(): number { return this.v.length; }
  idx(i: number): number { i %= this.v.length; if (i < 0) i += this.v.length; return i; }
  get(i: number): number { return this.v[this.idx(i)]; }
  set(i: number, c: number): void { this.v[this.idx(i)] = c; }
  allocate(num: number): void {
    const q = this.v.length;
    for (let i = q; i < num; i++) this.v.push(this.get(i % q));
  }
}

/* darkening routines */

export function darkena3(c: number, lev: number, a: number): number {
  return ((darkenedby(c, lev) << 8) + a) >>> 0;
}

export function darkena(c: number, lev: number, a: number): number {
  return darkena3(c, lev, GDIM() === 3 ? 255 : a);
}

export function darkenedby(c: number, lev: number): number {
  for (let i = 0; i < lev; i++)
    c = ((c & 0xFEFEFE) >>> 1);
  return c;
}

let fading = false;
let fadeout = 1;
/** (fading / fadeout are file-local in C++; nothing in stage 2 sets them) */
export function set_fading(f: boolean, v: number): void { fading = f; fadeout = v; }

export function darkened(c: number): number {
  if (G.inmirrorcount & 1)
    c = gradient(c, winf[waMirror].color, 0, 0.5, 1);
  else if (G.inmirrorcount)
    c = gradient(c, winf[waCloud].color, 0, 0.5, 1);
  if (fading) c = gradient(G.backcolor, c, 0, fadeout, 1);
  if (G.vid.desaturate) {
    const luminance = 0.2125 * part(c, 2) + 0.7154 * part(c, 1) + 0.0721 * part(c, 0);
    c = gradient(c, Math.imul(Math.trunc(luminance + .5), 0x10101) >>> 0, 0, G.vid.desaturate, 100);
  }
  for (let i = 0; i < G.darken; i++)
    c = (((c & 0xFEFEFE) >>> 1) + ((G.backcolor & 0xFEFEFE) >>> 1)) >>> 0;
  return c >>> 0;
}

/* gradient interpolation */

export function gradient(c0: number, c1: number, v0: number, v: number, v1: number): number {
  const vv = Math.trunc(256 * ((v - v0) / (v1 - v0))) | 0;
  let c = 0;
  for (let a = 0; a < 4; a++) {
    const p0 = part(c0, a);
    const p1 = part(c1, a);
    c = set_part(c, a, (p0 * (256 - vv) + p1 * vv + 127) >> 8);
  }
  return c;
}

export function rcolor(): number {
  let res = 0; // color_t res; (uninitialized in C++: byte 3 is garbage there; 0 here)
  res = set_part(res, 0, hrand(0x80));
  res = set_part(res, 1, hrand(256));
  res = set_part(res, 2, hrand(0x80) + 128);
  {
    const k = rand() % 2; const a = part(res, 1), b = part(res, k);
    res = set_part(res, 1, b); res = set_part(res, k, a);
  }
  {
    const k = rand() % 3; const a = part(res, 2), b = part(res, k);
    res = set_part(res, 2, b); res = set_part(res, k, a);
  }
  return res;
}

export function rainbow_color(sat: number, hue: number): number {
  hue = frac(hue);

  if (hue < 0) hue++;

  hue *= 6;

  let res = 0;

  if (hue < 1) res = gradient(0xFF0000, 0xFFFF00, 0, hue, 1);
  else if (hue < 2) res = gradient(0x00FF00, 0xFFFF00, 2, hue, 1);
  else if (hue < 3) res = gradient(0x00FF00, 0x00FFFF, 2, hue, 3);
  else if (hue < 4) res = gradient(0x0000FF, 0x00FFFF, 4, hue, 3);
  else if (hue < 5) res = gradient(0x0000FF, 0xFF00FF, 4, hue, 5);
  else if (hue <= 6) res = gradient(0xFF0000, 0xFF00FF, 6, hue, 5);

  return gradient(0xFFFFFF, res, 0, sat, 1);
}

/** Adjust col to SDL_gfx functions (SDL2: swap bytes 0/3 and 1/2: RRGGBBAA -> AABBGGRR) */
export function align(col: number): number {
  // SDLVER >= 2
  const p0 = part(col, 0), p1 = part(col, 1), p2 = part(col, 2), p3 = part(col, 3);
  col = set_part(col, 0, p3); col = set_part(col, 3, p0);
  col = set_part(col, 1, p2); col = set_part(col, 2, p1);
  return col;
}

/** enum class eNeon { none, neon, no_boundary, neon2, illustration} */
export const eNeon = { none: 0, neon: 1, no_boundary: 2, neon2: 3, illustration: 4 } as const;

/** apply_neon(color_t& col, int& r): col and r are in/out */
export function apply_neon(col: { v: number }, r: { v: number }): void {
  switch (G.neon_mode) {
    case eNeon.none:
    case eNeon.illustration:
      break;
    case eNeon.neon:
      G.poly_outline = (col.v << 8) >>> 0; col.v = 0;
      break;
    case eNeon.no_boundary:
      r.v = 0;
      break;
    case eNeon.neon2:
      G.poly_outline = (col.v << 8) >>> 0; col.v &= 0xFEFEFE; col.v >>>= 1;
      break;
  }
}

/** used when neon_mode is eNeon::illustration */
export function magentize(x: number): number {
  if (G.neon_mode !== eNeon.illustration) return x;
  const green = part(x, 2);
  const magenta = (part(x, 1) + part(x, 3)) >> 1;
  let nm = Math.max(magenta, green);
  let gm = (magenta + green) >> 1;
  nm = (nm + 255) >> 1;
  gm = gm >> 1;

  return ((Math.imul(nm, 0x1000100) | Math.imul(gm, 0x10000)) | (part(x, 0))) >>> 0;
}

export function monochromatize(x: number): number {
  let c = part(x, 2) + part(x, 1) + part(x, 3);
  c++;
  c = (c / 3) | 0;
  return (Math.imul(c, 0x1010100) | (part(x, 0))) >>> 0;
}

/** apply neon_mode and cblind: pcolor/poutline are the out-parameters (returned as [pcolor, poutline]) */
export function apply_neon_color(col: number, flags: number): [number, number] {
  let pcolor = 0, poutline = 0;
  if (G.cblind) {
    // deuteranopia (the other formulas are commented out in C++)
    const v = ((part(col, 2) * 2 + part(col, 3) + 1) / 3) | 0;
    col = set_part(col, 3, v); col = set_part(col, 2, v);
  }
  if (G.neon_mode === eNeon.none) {
    pcolor = ((darkened(col >>> 8) << 8) + (col & 0xFF)) >>> 0;
    poutline = G.poly_outline;
    if (flags & POLY_TRIANGLES) poutline = 0;
  }
  else switch (G.neon_mode) {
    case eNeon.neon:
      pcolor = ((G.poly_outline & 0xFFFFFF00) | (col & 0xFF)) >>> 0;
      poutline = ((darkened(col >>> 8) << 8) | (col & 0xFF)) >>> 0;
      if (col === 0xFF) poutline = 0xFFFFFFFF;
      if (G.neon_nofill && pcolor === 0xFF) pcolor = 0;
      break;
    case eNeon.no_boundary:
      pcolor = ((darkened(col >>> 8) << 8) + (col & 0xFF)) >>> 0;
      poutline = 0;
      break;
    case eNeon.neon2:
      pcolor = ((darkened(col >>> 8) << 8) + (col & 0xFF) + ((col & 0xFF) >> 2)) >>> 0;
      poutline = ((darkened(col >>> 8) << 8) + (col & 0xFF)) >>> 0;
      if (col === 0xFF) poutline = 0xFFFFFFFF;
      if (G.poly_outline !== 0xFF) poutline = G.poly_outline;
      if (G.neon_nofill && pcolor === 0xFF) pcolor = 0;
      break;
    case eNeon.illustration: {
      if (G.poly_outline && (G.poly_outline >>> 8) !== G.bordcolor) {
        pcolor = magentize(col);
        poutline = 0xFF;
      }
      else {
        poutline = G.poly_outline;
        pcolor = monochromatize(col);
      }
      if (pcolor & 0xFF) pcolor = (pcolor | 0xFF) >>> 0;
      if (poutline & 0xFF) poutline = (poutline | 0xFF) >>> 0;
      break;
    }
  }
  return [pcolor, poutline];
}

/* color of various stuff */

/** cloak color for the given table radius */
export function cloakcolor(rtr: number): number {
  rtr -= 28;
  rtr = (rtr / 2) | 0;
  rtr %= 10;
  if (rtr < 0) rtr += 10;
  // rtr = time(NULL) % 10;
  const cc = [
    0x8080FF, 0x80FFFF, 0x80FF80, 0xFF8080, 0xFF80FF, 0xFFFF80,
    0xFFFFC0, 0xFFD500, 0x421C52, 0,
  ];
  return cc[rtr];
}

export function firegradient(p: number): number {
  return gradient(0xFFFF00, 0xFF0000, 0, p, 1);
}

/** constexpr ld PI1000 = 0.001 / A_PI (A_PI = M_PI written out: module-level code may only use leaf modules) */
const PI1000 = 0.001 / 3.14159265358979323846;

export function firecolor(phase = 0, mul = 1): number {
  return gradient(0xFFFF00, 0xFF0000, -1, sintick(100 * mul, phase * 5 * PI1000), 1);
}

export function watercolor(phase: number): number {
  return (0x0080C0FF + 256 * Math.trunc(63 * sintick(50, phase * 10 * PI1000))) >>> 0;
}

export function aircolor(phase: number, S21: number): number {
  // 0x8080FF00 | int(32 + 32 * sintick(200, phase * 1. / cgi.S21)): the caller passes cgi.S21 (D2's cgi)
  return (0x8080FF00 | Math.trunc(32 + 32 * sintick(200, phase * 1. / S21))) >>> 0;
}

export function fghostcolor(c: cell): number {
  const phase = Math.trunc(fractick(650, c._id) * 4000); // (int)(size_t)c: the address, here the serial
  if (phase < 1000) return gradient(0xFFFF80, 0xA0C0FF, 0, phase, 1000);
  else if (phase < 2000) return gradient(0xA0C0FF, 0xFF80FF, 1000, phase, 2000);
  else if (phase < 3000) return gradient(0xFF80FF, 0xFF8080, 2000, phase, 3000);
  else if (phase < 4000) return gradient(0xFF8080, 0xFFFF80, 3000, phase, 4000);
  return 0xFFD500;
}

export function weakfirecolor(phase: number): number {
  return gradient(0xFF8000, 0xFF0000, -1, sintick(500, phase * PI1000), 1);
}

/* HTML color names */

export const color_names: [string, number][] = [
  ['aliceblue', 0xf0f8ff], ['antiquewhite', 0xfaebd7], ['aqua', 0x00ffff], ['aquamarine', 0x7fffd4], ['azure', 0xf0ffff],
  ['beige', 0xf5f5dc], ['bisque', 0xffe4c4], ['black', 0x000000], ['blanchedalmond', 0xffebcd], ['blue', 0x0000ff], ['blueviolet', 0x8a2be2], ['brown', 0xa52a2a], ['burlywood', 0xdeb887],
  ['cadetblue', 0x5f9ea0], ['chartreuse', 0x7fff00], ['chocolate', 0xd2691e], ['coral', 0xff7f50], ['cornflowerblue', 0x6495ed], ['cornsilk', 0xfff8dc], ['crimson', 0xdc143c], ['cyan', 0x00ffff],
  ['darkblue', 0x00008b], ['darkcyan', 0x008b8b], ['darkgoldenrod', 0xb8860b], ['darkgray', 0xa9a9a9], ['darkgreen', 0x006400], ['darkkhaki', 0xbdb76b], ['darkmagenta', 0x8b008b], ['darkolivegreen', 0x556b2f],
  ['darkorange', 0xff8c00], ['darkorchid', 0x9932cc], ['darkred', 0x8b0000], ['darksalmon', 0xe9967a], ['darkseagreen', 0x8fbc8f], ['darkslateblue', 0x483d8b], ['darkslategray', 0x2f4f4f], ['darkturquoise', 0x00ced1],
  ['darkviolet', 0x9400d3], ['deeppink', 0xff1493], ['deepskyblue', 0x00bfff], ['dimgray', 0x696969], ['dodgerblue', 0x1e90ff],
  ['firebrick', 0xb22222], ['floralwhite', 0xfffaf0], ['forestgreen', 0x228b22], ['fuchsia', 0xff00ff],
  ['gainsboro', 0xdcdcdc], ['ghostwhite', 0xf8f8ff], ['gold', 0xffd700], ['goldenrod', 0xdaa520], ['gray', 0x808080], ['green', 0x008000], ['greenyellow', 0xadff2f],
  ['honeydew', 0xf0fff0], ['hotpink', 0xff69b4],
  ['indianred ', 0xcd5c5c], ['indigo', 0x4b0082], ['ivory', 0xfffff0], ['khaki', 0xf0e68c],
  ['lavender', 0xe6e6fa], ['lavenderblush', 0xfff0f5], ['lawngreen', 0x7cfc00], ['lemonchiffon', 0xfffacd], ['lightblue', 0xadd8e6], ['lightcoral', 0xf08080], ['lightcyan', 0xe0ffff], ['lightgoldenrodyellow', 0xfafad2],
  ['lightgrey', 0xd3d3d3], ['lightgreen', 0x90ee90], ['lightpink', 0xffb6c1], ['lightsalmon', 0xffa07a], ['lightseagreen', 0x20b2aa], ['lightskyblue', 0x87cefa], ['lightslategray', 0x778899], ['lightsteelblue', 0xb0c4de],
  ['lightyellow', 0xffffe0], ['lime', 0x00ff00], ['limegreen', 0x32cd32], ['linen', 0xfaf0e6],
  ['magenta', 0xff00ff], ['maroon', 0x800000], ['mediumaquamarine', 0x66cdaa], ['mediumblue', 0x0000cd], ['mediumorchid', 0xba55d3], ['mediumpurple', 0x9370d8], ['mediumseagreen', 0x3cb371], ['mediumslateblue', 0x7b68ee],
  ['mediumspringgreen', 0x00fa9a], ['mediumturquoise', 0x48d1cc], ['mediumvioletred', 0xc71585], ['midnightblue', 0x191970], ['mintcream', 0xf5fffa], ['mistyrose', 0xffe4e1], ['moccasin', 0xffe4b5],
  ['navajowhite', 0xffdead], ['navy', 0x000080],
  ['oldlace', 0xfdf5e6], ['olive', 0x808000], ['olivedrab', 0x6b8e23], ['orange', 0xffa500], ['orangered', 0xff4500], ['orchid', 0xda70d6],
  ['palegoldenrod', 0xeee8aa], ['palegreen', 0x98fb98], ['paleturquoise', 0xafeeee], ['palevioletred', 0xd87093], ['papayawhip', 0xffefd5], ['peachpuff', 0xffdab9], ['peru', 0xcd853f], ['pink', 0xffc0cb], ['plum', 0xdda0dd], ['powderblue', 0xb0e0e6], ['purple', 0x800080],
  ['rebeccapurple', 0x663399], ['red', 0xff0000], ['rosybrown', 0xbc8f8f], ['royalblue', 0x4169e1],
  ['saddlebrown', 0x8b4513], ['salmon', 0xfa8072], ['sandybrown', 0xf4a460], ['seagreen', 0x2e8b57], ['seashell', 0xfff5ee], ['sienna', 0xa0522d], ['silver', 0xc0c0c0], ['skyblue', 0x87ceeb], ['slateblue', 0x6a5acd], ['slategray', 0x708090], ['snow', 0xfffafa], ['springgreen', 0x00ff7f], ['steelblue', 0x4682b4],
  ['tan', 0xd2b48c], ['teal', 0x008080], ['thistle', 0xd8bfd8], ['tomato', 0xff6347], ['turquoise', 0x40e0d0],
  ['violet', 0xee82ee],
  ['wheat', 0xf5deb3], ['white', 0xffffff], ['whitesmoke', 0xf5f5f5],
  ['yellow', 0xffff00], ['yellowgreen', 0x9acd32],
];

export function find_color_by_name(s: string): [string, number] | null {
  for (const c of color_names) if (c[0] === s) return c;
  return null;
}
