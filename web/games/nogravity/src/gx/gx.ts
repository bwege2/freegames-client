// No Gravity port (GPL-3.0-or-later; translated in 2026 by the freegames project from realtech VR's
// No Gravity 2.0, GPL-2.0-or-later; LICENSE.md): the 2D graphics the game draws with (the GX layer of
// rlx32: GX.csp sprite drawers, GX.gi primitives, gx_csp.c text writers, sprite groups) as the
// OpenGL driver does them (renderers/opengl/gl_gx.cpp): sprites are textured quads modulated by
// GX.csp_cfg.color, index 0 of a palette picture is transparent; put blends by alpha, pset is opaque,
// TrspADD adds (GL_ONE, GL_ONE), Trsp50/TrspALPHA blend with GX.csp_cfg.alpha. The commands of a
// frame are recorded here and drawn in order by the screen (screen.ts), with the 3D views in between.
import type { Picture } from './png.ts';

/** a picture uploaded once (a sprite sheet, a texture, a background) */
export interface Sheet {
  id: number;
  width: number;
  height: number;
  /** RGBA, index 0 transparent for keyed palette pictures */
  rgba: Uint8Array;
  /** for the renderer: its texture */
  tex?: unknown;
  /** changed pixels (animated sheets) */
  version: number;
}
/** GXSPRITE: a rectangle of a sheet */
export interface Sprite {
  LX: number;
  LY: number;
  sheet: Sheet;
  x: number;
  y: number;
}
/** GXSPRITEGROUP */
export interface SpriteGroup {
  item: Sprite[];
  maxItem: number;
  speed: number;
  HSpacing: number;
  VSpacing: number;
  Caps: number;
}

export const BLEND_PUT = 1, BLEND_PSET = 2, BLEND_ADD = 3, BLEND_ALPHA = 4, BLEND_SUB = 5;

export type GxCommand =
  | { k: 'q'; sheet: Sheet | null; blend: number; x0: number; y0: number; x1: number; y1: number; u0: number; v0: number; u1: number; v1: number; c: number; a: number }
  | { k: 'l'; x0: number; y0: number; x1: number; y1: number; c0: number; a0: number; c1: number; a1: number }
  | { k: 'v'; view: { xmin: number; ymin: number; xmax: number; ymax: number }; camera: Float32Array; focal: number; cx: number; cy: number; fill: number | null; only: unknown };

let sheetIds = 1;
export function makeSheet(width: number, height: number, rgba: Uint8Array): Sheet {
  return { id: sheetIds++, width, height, rgba, version: 0 };
}
export function sheetFromPicture(p: Picture, keyed = true): Sheet {
  const rgba = new Uint8Array(p.rgba);
  if (keyed && p.indices) for (let i = 0; i < p.indices.length; i++) if (!p.indices[i]) rgba[4 * i + 3] = 0;
  return makeSheet(p.width, p.height, rgba);
}
export function spriteOfSheet(s: Sheet): Sprite { return { LX: s.width, LY: s.height, sheet: s, x: 0, y: 0 }; }

/** packed 0xRRGGBB, the colour format of the 16/32-bit modes (RGB_PixelFormat) */
export const rgb = (r: number, g: number, b: number): number => ((r & 255) << 16) | ((g & 255) << 8) | (b & 255);

export const GX = {
  View: { xmin: 0, ymin: 0, xmax: 639, ymax: 479, lWidth: 640, lHeight: 480, lRatio: 16, BytePerPixel: 4 },
  csp_cfg: { color: 0xffffff, alpha: 255 },
  /** the frame's commands */
  commands: [] as GxCommand[],
};

function quad(sp: Sprite, x: number, y: number, lx: number, ly: number, blend: number): void {
  GX.commands.push({
    k: 'q', sheet: sp.sheet, blend, x0: x, y0: y, x1: x + lx, y1: y + ly,
    u0: sp.x / sp.sheet.width, v0: sp.y / sp.sheet.height, u1: (sp.x + sp.LX) / sp.sheet.width, v1: (sp.y + sp.LY) / sp.sheet.height,
    c: GX.csp_cfg.color, a: blend === BLEND_ALPHA ? GX.csp_cfg.alpha : 255,
  });
}
/** GX.csp */
export const csp = {
  put: (x: number, y: number, sp: Sprite): void => quad(sp, x, y, sp.LX, sp.LY, BLEND_PUT),
  pset: (x: number, y: number, sp: Sprite): void => quad(sp, x, y, sp.LX, sp.LY, BLEND_PSET),
  TrspADD: (x: number, y: number, sp: Sprite): void => quad(sp, x, y, sp.LX, sp.LY, BLEND_ADD),
  Trsp50: (x: number, y: number, sp: Sprite): void => quad(sp, x, y, sp.LX, sp.LY, BLEND_ALPHA),
  TrspALPHA: (x: number, y: number, sp: Sprite): void => quad(sp, x, y, sp.LX, sp.LY, BLEND_ALPHA),
  TrspSUB: (x: number, y: number, sp: Sprite): void => quad(sp, x, y, sp.LX, sp.LY, BLEND_SUB),
  zoom_put: (sp: Sprite, x: number, y: number, lx: number, ly: number): void => quad(sp, x, y, lx, ly, BLEND_PUT),
  zoom_pset: (sp: Sprite, x: number, y: number, lx: number, ly: number): void => quad(sp, x, y, lx, ly, BLEND_PSET),
  zoom_TrspADD: (sp: Sprite, x: number, y: number, lx: number, ly: number): void => quad(sp, x, y, lx, ly, BLEND_ADD),
  zoom_Trsp50: (sp: Sprite, x: number, y: number, lx: number, ly: number): void => quad(sp, x, y, lx, ly, BLEND_ALPHA),
  zoom_TrspALPHA: (sp: Sprite, x: number, y: number, lx: number, ly: number): void => quad(sp, x, y, lx, ly, BLEND_ALPHA),
  zoom_TrspSUB: (sp: Sprite, x: number, y: number, lx: number, ly: number): void => quad(sp, x, y, lx, ly, BLEND_SUB),
};
export type SpriteDrawer = (x: number, y: number, sp: Sprite) => void;

function rect(x0: number, y0: number, x1: number, y1: number, c: number, a: number, blend: number): void {
  GX.commands.push({ k: 'q', sheet: null, blend, x0, y0, x1, y1, u0: 0, v0: 0, u1: 1, v1: 1, c, a });
}
/** GX.gi (gl_gx.cpp) */
export const gi = {
  drawAnyLine(x1: number, y1: number, x2: number, y2: number, c: number): void {
    GX.commands.push({ k: 'l', x0: x1, y0: y1, x1: x2, y1: y2, c0: c, a0: 255, c1: c, a1: 255 });
  },
  drawHorizontalLine(x: number, y: number, lx: number, c: number): void { rect(x, y, x + lx, y + 1, c, 255, BLEND_PSET); },
  drawVerticalLine(x: number, y: number, ly: number, c: number): void { rect(x, y, x + 1, y + ly, c, 255, BLEND_PSET); },
  drawWiredRect(x1: number, y1: number, x2: number, y2: number, c: number): void {
    rect(x1, y1, x2, y1 + 1, c, 255, BLEND_PSET); rect(x1, y2, x2 + 1, y2 + 1, c, 255, BLEND_PSET);
    rect(x1, y1, x1 + 1, y2, c, 255, BLEND_PSET); rect(x2, y1, x2 + 1, y2, c, 255, BLEND_PSET);
  },
  drawFilledRect(x1: number, y1: number, x2: number, y2: number, c: number): void { rect(x1, y1, x2 + 1, y2 + 1, c, 255, BLEND_PSET); },
  /** blended with csp_cfg.color and csp_cfg.alpha */
  drawShadedRect(x1: number, y1: number, x2: number, y2: number): void { rect(x1, y1, x2 + 1, y2 + 1, GX.csp_cfg.color, GX.csp_cfg.alpha, BLEND_ALPHA); },
  drawMeshedRect(x1: number, y1: number, x2: number, y2: number, c: number): void { rect(x1, y1, x2 + 1, y2 + 1, c, GX.csp_cfg.alpha, BLEND_ALPHA); },
  clearBackBuffer(): void { rect(0, 0, GX.View.lWidth, GX.View.lHeight, 0, 255, BLEND_PSET); },
};
/** a line with a colour per end (the V3X line buffer of the starfield) */
export function gradientLine(x0: number, y0: number, x1: number, y1: number, c0: number, a0: number, c1: number, a1: number): void {
  GX.commands.push({ k: 'l', x0, y0, x1, y1, c0, a0, c1, a1 });
}

export const CSP_Color = (c: number): void => { GX.csp_cfg.color = c; };

// ---------------------------------------------------------------- text (gx_csp.c)
/** CSP_Offset: character -> glyph of a 54-glyph font (A-Z, 0-9, punctuation) */
const CSP_Offset = [
  -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
  -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
  -1, 36, -1, 53, 51, 45, -1, 47, 41, 42, 49, 43, 51, 44, 38, 40,
  26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 39, -1, -1, 46, -1, 37,
  52, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14,
  15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, -1, 50, -1, -1, 48,
  -1, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14,
  15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, -1, -1, -1, -1, -1,
  -1, -1, 4, -1, -1, 0, -1, -1, 0, -1, 4, -1, -1, -1, 4, -1,
  -1, -1, -1, 14, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
  -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
  -1, -1, -1, -1, -1, -1, -1, -1, 4, -1, -1, -1, -1, -1, -1, -1,
  -1, -1, -1, -1, 0, -1, -1, -1, -1, -1, -1, 4, -1, 8, -1, 8,
  -1, 13, -1, 14, -1, -1, 14, -1, -1, -1, -1, -1, 20, -1, -1, -1,
  -1, -1, -1, -1, 0, -1, -1, -1, -1, 4, -1, -1, -1, -1, -1, -1,
  -1, -1, -1, 14, -1, -1, 14, -1, -1, -1, -1, -1, 20, -1, -1, -1,
];
/** the game's strings are Latin-1 (the .msg and .cmx files) */
const glyph = (ch: number): number => CSP_Offset[ch & 255];

export function TxLen(text: string, font: SpriteGroup): number {
  let ll = 0;
  const llx = font.item[0].LX >> 1;
  for (let i = 0; i < text.length; i++) {
    const a = glyph(text.charCodeAt(i));
    ll += a >= font.maxItem || a < 0 ? font.HSpacing + llx : font.HSpacing + font.item[a].LX;
  }
  return ll;
}
export function DrawText(text: string, xx: number, yy: number, font: SpriteGroup, fn: SpriteDrawer): void {
  const ox = xx, sp0 = font.item[0];
  for (let i = 0; i < text.length; i++) {
    const ch = text.charCodeAt(i);
    if (ch === 10 || ch === 0xa7) { xx = ox; yy += font.VSpacing + sp0.LY; continue; }
    const a = glyph(ch);
    let l: number;
    if (a >= font.maxItem || a < 0) l = font.HSpacing + (sp0.LX >> 1);
    else {
      const sp = font.item[a];
      l = font.HSpacing + sp.LX;
      if (font.Caps & 2) xx += sp0.LX - sp.LX;
      fn(xx, yy, sp);
    }
    xx += l;
  }
}
/** CSP_DrawTextC: '~' toggles between the two colours */
export function DrawTextC(text: string, xx: number, yy: number, attr1: number, attr2: number, font: SpriteGroup, fn: SpriteDrawer): void {
  const ox = xx, sp0 = font.item[0];
  let col = 0;
  CSP_Color(attr1);
  for (let i = 0; i < text.length; i++) {
    const ch = text.charCodeAt(i);
    if (ch === 126) { col ^= 1; CSP_Color(col ? attr2 : attr1); continue; }
    if (ch === 10 || ch === 0xa7) { xx = ox; yy += font.HSpacing + sp0.LY; continue; }
    if (ch === 0xb0) { const tz = 10 * sp0.LX; const bz = Math.trunc((xx - ox) / tz); xx = ox + (bz + 1) * tz; continue; }
    const a = glyph(ch);
    let l: number;
    if (a >= font.maxItem || a < 0) l = font.HSpacing + (sp0.LX >> 1);
    else {
      const sp = font.item[a];
      l = font.HSpacing + sp.LX;
      if (font.Caps & 2) xx += sp0.LX - sp.LX;
      fn(xx, yy, sp);
    }
    xx += l;
  }
}
export const WriteText = (t: string, x: number, y: number, f: SpriteGroup): void => DrawText(t, x, y, f, csp.put);
export function centerX(t: string, f: SpriteGroup): number { return GX.View.xmin + (((GX.View.xmax - GX.View.xmin) - TxLen(t, f)) >> 1); }
export const WriteCenterText = (t: string, y: number, f: SpriteGroup): void => DrawText(t, centerX(t, f), y, f, csp.put);
export const DrawCenterText = (t: string, y: number, f: SpriteGroup, fn: SpriteDrawer): void => DrawText(t, centerX(t, f), y, f, fn);
export const DrawCenterCText = (t: string, y: number, a: number, b: number, f: SpriteGroup): void => DrawTextC(t, centerX(t, f), y, a, b, f, csp.put);

// ---------------------------------------------------------------- sprite groups (CSPG_GetFn)
/** a .spc: "SPC?" + u16 count + count x {a, b, c, d} (left, top, right, bottom, inclusive) */
export function parseSpc(b: Uint8Array): { a: number; b: number; c: number; d: number }[] {
  const dv = new DataView(b.buffer, b.byteOffset, b.byteLength);
  const n = dv.getUint16(4, true);
  const out = [];
  for (let i = 0; i < n; i++) {
    const o = 6 + 8 * i;
    out.push({ a: dv.getInt16(o, true), b: dv.getInt16(o + 2, true), c: dv.getInt16(o + 4, true), d: dv.getInt16(o + 6, true) });
  }
  return out;
}
export function spriteGroupFromSheet(sheet: Sheet, rects: { a: number; b: number; c: number; d: number }[]): SpriteGroup {
  const item = rects.map((r) => ({ LX: r.c - r.a + 1, LY: r.d - r.b + 1, sheet, x: r.a, y: r.b }));
  return { item, maxItem: item.length, speed: 0, HSpacing: 0, VSpacing: 0, Caps: 0 };
}

// ---------------------------------------------------------------- clipped lines (v3xrend.c)
/** GX_ClippedLine: a 2D line clipped to GX.View; returns whether something was drawn */
export function ClippedLine(a: { x: number; y: number }, b: { x: number; y: number }, c: number): number {
  let x0 = a.x, y0 = a.y, x1 = b.x, y1 = b.y;
  const { xmin, ymin, xmax, ymax } = GX.View;
  const code = (x: number, y: number): number => (x < xmin ? 1 : 0) | (x > xmax ? 2 : 0) | (y < ymin ? 4 : 0) | (y > ymax ? 8 : 0);
  let c0 = code(x0, y0), c1 = code(x1, y1);
  for (let k = 0; k < 8; k++) {
    if (!(c0 | c1)) { gi.drawAnyLine(Math.trunc(x0), Math.trunc(y0), Math.trunc(x1), Math.trunc(y1), c); return 1; }
    if (c0 & c1) return 0;
    const out = c0 || c1;
    let x = 0, y = 0;
    if (out & 8) { x = x0 + ((x1 - x0) * (ymax - y0)) / (y1 - y0); y = ymax; }
    else if (out & 4) { x = x0 + ((x1 - x0) * (ymin - y0)) / (y1 - y0); y = ymin; }
    else if (out & 2) { y = y0 + ((y1 - y0) * (xmax - x0)) / (x1 - x0); x = xmax; }
    else { y = y0 + ((y1 - y0) * (xmin - x0)) / (x1 - x0); x = xmin; }
    if (out === c0) { x0 = x; y0 = y; c0 = code(x0, y0); } else { x1 = x; y1 = y; c1 = code(x1, y1); }
  }
  return 0;
}
