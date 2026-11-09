// FreeType 2.13 as libGDX's gdx-freetype uses it, for TrueType fonts and the metrics the game's text layout
// reads: the size's metrics (FT_Set_Pixel_Sizes), a glyph's outline and metrics as the TrueType driver loads
// it without hinting (FT_LOAD_NO_HINTING: scaled points in 26.6, the phantom points' advance), the outside
// border of a stroked glyph (stroke.ts), and a bitmap's size and position as FT_Glyph_To_Bitmap renders it
// (FT_RENDER_MODE_NORMAL). What the pixels of a glyph's bitmap are is a separate, replaceable part
// (setGlyphRasterizer): the layout never reads them; headless they are empty, a browser backend draws the
// outline with a canvas. Written for the port after FreeType 2.13.2's sources (ftobjs.c, ftcalc.c, ttgload.c,
// ttobjs.c, ftoutln.c, ftglyph.c; FreeType is under the FreeType License, see LICENSE.md).
import { Sfnt } from './sfnt.ts';
import { strokeOutsideBorder } from './stroke.ts';

/* ------------------------------------------------------------------ fixed-point arithmetic (ftcalc.c) */

/** FT_MulFix: (a * b) / 65536, rounded (half away from zero). */
export function mulFix(a: number, b: number): number {
  const s = (a < 0) !== (b < 0) ? -1 : 1;
  const r = Math.floor((Math.abs(a) * Math.abs(b) + 0x8000) / 65536);
  return s < 0 ? -r : r;
}
/** FT_DivFix: (a * 65536) / b, rounded. */
export function divFix(a: number, b: number): number {
  const s = (a < 0) !== (b < 0) ? -1 : 1;
  const ua = Math.abs(a), ub = Math.abs(b);
  const q = ub > 0 ? Math.floor((ua * 65536 + Math.floor(ub / 2)) / ub) : 0x7fffffff;
  return s < 0 ? -q : q;
}
/** FT_MulDiv: (a * b) / c, rounded. */
export function mulDiv(a: number, b: number, c: number): number {
  const s = ((a < 0) !== (b < 0)) !== (c < 0) ? -1 : 1;
  const ua = Math.abs(a), ub = Math.abs(b), uc = Math.abs(c);
  const d = uc > 0 ? Math.floor((ua * ub + Math.floor(uc / 2)) / uc) : 0x7fffffff;
  return s < 0 ? -d : d;
}
export const pixFloor = (x: number) => x & -64;
export const pixCeil = (x: number) => (x + 63) & -64;
export const pixRound = (x: number) => (x + 32) & -64;

/* ------------------------------------------------------------------ outlines */

/** An FT_Outline: points in 26.6, a tag per point (1: on the curve, 0: conic control, 2: cubic control), contour ends. */
export type Outline = { x: number[]; y: number[]; tags: number[]; contours: number[] };

export function cbox(o: Outline): { xMin: number; yMin: number; xMax: number; yMax: number } {
  if (o.x.length === 0) return { xMin: 0, yMin: 0, xMax: 0, yMax: 0 };
  let xMin = o.x[0], xMax = o.x[0], yMin = o.y[0], yMax = o.y[0];
  for (let i = 1; i < o.x.length; i++) {
    const x = o.x[i], y = o.y[i];
    if (x < xMin) xMin = x;
    if (x > xMax) xMax = x;
    if (y < yMin) yMin = y;
    if (y > yMax) yMax = y;
  }
  return { xMin, yMin, xMax, yMax };
}

/* ------------------------------------------------------------------ bitmaps */

/** A rendered glyph (FT_Bitmap, gray: one byte a pixel) and where it is (bitmap_left, bitmap_top). */
export type Bitmap = { width: number; rows: number; pitch: number; left: number; top: number; buffer: Uint8Array };

/**
 * Draws a glyph's pixels: the outline (26.6, y up, the glyph's origin at (0, 0)) into a gray bitmap of
 * width x rows whose top-left pixel is at (left, top) in whole pixels (y up). The default draws nothing (the
 * headless runtime: nothing is shown, and the layout depends only on the sizes).
 */
export type GlyphRasterizer = (outline: Outline, bitmap: Bitmap) => void;
let rasterizer: GlyphRasterizer = () => {};
export function setGlyphRasterizer(r: GlyphRasterizer) {
  rasterizer = r;
}

/** FT_Glyph_To_Bitmap (FT_RENDER_MODE_NORMAL): the bitmap's box (ft_glyphslot_preset_bitmap), then its pixels. */
export function renderOutline(o: Outline): Bitmap {
  const b = cbox(o);
  const xMin = b.xMin >> 6, yMin = b.yMin >> 6;
  const xMax = (b.xMax >> 6) + (((b.xMax & 63) + 63) >> 6), yMax = (b.yMax >> 6) + (((b.yMax & 63) + 63) >> 6);
  const width = o.x.length ? xMax - xMin : 0, rows = o.x.length ? yMax - yMin : 0;
  const bm: Bitmap = { width, rows, pitch: width, left: xMin, top: yMax, buffer: new Uint8Array(width * rows) };
  if (width > 0 && rows > 0) rasterizer(o, bm);
  return bm;
}

/* ------------------------------------------------------------------ faces */

export type SizeMetrics = { xPpem: number; yPpem: number; xScale: number; yScale: number; ascender: number; descender: number; height: number; maxAdvance: number };
export type GlyphMetrics = { width: number; height: number; horiBearingX: number; horiBearingY: number; horiAdvance: number;
  vertBearingX: number; vertBearingY: number; vertAdvance: number };

export const FT_FACE_FLAG_SCALABLE = 1, FT_FACE_FLAG_FIXED_SIZES = 2, FT_FACE_FLAG_FIXED_WIDTH = 4, FT_FACE_FLAG_SFNT = 8,
  FT_FACE_FLAG_HORIZONTAL = 16, FT_FACE_FLAG_VERTICAL = 32, FT_FACE_FLAG_KERNING = 64, FT_FACE_FLAG_GLYPH_NAMES = 512;

/** An FT_Face of a TrueType font with its size and glyph slot. */
export class Face {
  sf: Sfnt;
  size: SizeMetrics = { xPpem: 0, yPpem: 0, xScale: 0x10000, yScale: 0x10000, ascender: 0, descender: 0, height: 0, maxAdvance: 0 };
  /** The glyph slot: the last loaded glyph's outline (26.6, origin at 0) and metrics. */
  slot: { outline: Outline; metrics: GlyphMetrics; advanceX: number; linearHoriAdvance: number; format: number; bitmap: Bitmap | null } | null = null;

  constructor(bytes: Uint8Array) {
    this.sf = new Sfnt(bytes);
  }
  faceFlags(): number {
    let f = FT_FACE_FLAG_SCALABLE | FT_FACE_FLAG_SFNT | FT_FACE_FLAG_HORIZONTAL;
    if (this.sf.tables.has('vhea')) f |= FT_FACE_FLAG_VERTICAL;
    if (this.sf.kern) f |= FT_FACE_FLAG_KERNING;
    if (this.sf.postIsFixedPitch) f |= FT_FACE_FLAG_FIXED_WIDTH;
    if (this.sf.tables.has('post')) f |= FT_FACE_FLAG_GLYPH_NAMES;
    return f;
  }

  /** FT_Set_Pixel_Sizes (FT_Request_Size, nominal: FT_Request_Metrics with GRID_FIT_METRICS). */
  setPixelSizes(pixelWidth: number, pixelHeight: number): boolean {
    let w = pixelWidth << 6, h = pixelHeight << 6;
    if (w === 0) w = h;
    else if (h === 0) h = w;
    if (w < 64) w = 64;
    if (h < 64) h = 64;
    const upem = this.sf.unitsPerEm;
    const yScale = divFix(h, upem);
    const xScale = pixelWidth ? divFix(w, upem) : yScale;
    let scaledW = pixelWidth ? w : mulDiv(h, upem, upem), scaledH = h;
    scaledW = (scaledW + 32) >> 6;
    scaledH = (scaledH + 32) >> 6;
    this.size = {
      xPpem: scaledW, yPpem: scaledH, xScale, yScale,
      ascender: pixCeil(mulFix(this.sf.ascender, yScale)),
      descender: pixFloor(mulFix(this.sf.descender, yScale)),
      height: pixRound(mulFix(this.sf.height, yScale)),
      maxAdvance: pixRound(mulFix(this.sf.hhea.advanceWidthMax, xScale)),
    };
    return true;
  }

  charIndex(c: number): number {
    return this.sf.cmap(c);
  }

  loadChar(c: number, flags: number): boolean {
    return this.loadGlyph(this.charIndex(c), flags);
  }

  /** FT_Load_Glyph without hinting (the only way gdx-freetype loads the game's fonts: Hinting.None). */
  loadGlyph(gi: number, _flags: number): boolean {
    if (gi >= this.sf.numGlyphs) return false;
    const s = this.size, sf = this.sf;
    const ld = { pp1x: 0, pp2x: 0, linear: 0, linearDef: false };
    const outline: Outline = { x: [], y: [], tags: [], contours: [] };
    this.loadTT(gi, 0, ld, outline);
    // translate so that (0, 0) is the glyph's origin
    if (ld.pp1x) for (let i = 0; i < outline.x.length; i++) outline.x[i] -= ld.pp1x;
    const b = cbox(outline);
    const advance = ld.pp2x - ld.pp1x;
    const metrics: GlyphMetrics = { width: b.xMax - b.xMin, height: b.yMax - b.yMin, horiBearingX: b.xMin, horiBearingY: b.yMax,
      horiAdvance: advance, vertBearingX: 0, vertBearingY: 0, vertAdvance: 0 };
    // vertical metrics as compute_glyph_metrics makes them without a vmtx table (not used by the layout)
    const linear = mulDiv(ld.linear, s.xScale, 64); // linearHoriAdvance in 16.16 (FT_Load_Glyph)
    this.slot = { outline, metrics, advanceX: advance, linearHoriAdvance: linear, format: 0x6f75746c /* 'outl' */, bitmap: null };
    void sf;
    return true;
  }

  /** load_truetype_glyph: a simple glyph's scaled points, or a composite's components, with the phantom points. */
  loadTT(gi: number, depth: number, ld: any, out: Outline) {
    const sf = this.sf, xs = this.size.xScale;
    const [a, b] = sf.glyphRange(gi);
    const hm = sf.hmetrics(gi);
    if (!ld.linearDef) { ld.linearDef = true; ld.linear = hm.advance; }
    const empty = b <= a;
    const g = empty ? 0 : sf.table('glyf') + a;
    const nc = empty ? 0 : sf.d.getInt16(g);
    const xMin = empty ? 0 : sf.d.getInt16(g + 2);
    // tt_loader_set_pp
    let pp1 = xMin - hm.lsb, pp2 = pp1 + hm.advance;
    if (empty || nc === 0) {
      ld.pp1x = mulFix(pp1, xs);
      ld.pp2x = mulFix(pp2, xs);
      return;
    }
    if (nc > 0) {
      const o: any = sf.outline(gi);
      const base = out.x.length;
      for (let i = 0; i < o.x.length; i++) {
        out.x.push(mulFix(o.x[i], xs));
        out.y.push(mulFix(o.y[i], this.size.yScale));
        out.tags.push(o.on[i] ? 1 : 0);
      }
      for (const e of o.ends) out.contours.push(e + base);
      ld.pp1x = mulFix(pp1, xs);
      ld.pp2x = mulFix(pp2, xs);
      return;
    }
    // composite
    ld.pp1x = mulFix(pp1, xs);
    ld.pp2x = mulFix(pp2, xs);
    const comps = sf.components(g + 10);
    const startPoint = out.x.length;
    for (const c of comps) {
      const saved = { pp1x: ld.pp1x, pp2x: ld.pp2x, linear: ld.linear };
      const numBase = out.x.length;
      if (depth < 16) this.loadTT(c.gi, depth + 1, ld, out);
      if (!(c.flags & 0x200)) { ld.pp1x = saved.pp1x; ld.pp2x = saved.pp2x; ld.linear = saved.linear; }
      if (out.x.length === numBase) continue;
      // TT_Process_Composite_Component
      const haveScale = (c.flags & (8 | 0x40 | 0x80)) !== 0;
      if (haveScale) {
        for (let i = numBase; i < out.x.length; i++) {
          const x = out.x[i], y = out.y[i];
          out.x[i] = mulFix(x, c.xx) + mulFix(y, c.xy);
          out.y[i] = mulFix(x, c.yx) + mulFix(y, c.yy);
        }
      }
      let x: number, y: number;
      if (!(c.flags & 2)) {
        const k = c.arg1 + startPoint, l = c.arg2 + numBase;
        if (k >= numBase || l >= out.x.length) throw new Error('invalid composite glyph ' + gi);
        x = out.x[k] - out.x[l];
        y = out.y[k] - out.y[l];
      } else {
        x = c.arg1;
        y = c.arg2;
        if (!x && !y) continue;
        if (haveScale && (c.flags & 0x800)) {
          x = mulFix(x, Math.round(Math.hypot(c.xx, c.xy)));
          y = mulFix(y, Math.round(Math.hypot(c.yy, c.yx)));
        }
        x = mulFix(x, xs);
        y = mulFix(y, this.size.yScale);
      }
      if (x || y) for (let i = numBase; i < out.x.length; i++) { out.x[i] += x; out.y[i] += y; }
    }
  }

  /** FT_Get_Kerning (FT_KERNING_DEFAULT): the kern pair scaled, and rounded to whole pixels. */
  kerning(left: number, right: number): number {
    const k = this.sf.kern?.get(left * 65536 + right) ?? 0;
    if (!k) return 0;
    let x = mulFix(k, this.size.xScale);
    // ft_glyphslot... FT_Get_Kerning: small ppem values scale the kerning down before rounding
    if (this.size.xPpem < 25) x = mulDiv(x, this.size.xPpem, 25);
    return pixRound(x);
  }

  /** FT_Glyph_StrokeBorder(glyph, stroker, inside = false) of the slot's outline. */
  strokeBorder(o: Outline, radius: number, lineCap: number, lineJoin: number, miterLimit: number): Outline {
    return strokeOutsideBorder(o, radius, lineCap, lineJoin, miterLimit);
  }
}
