// OpenClonk in the browser: the FreeType functions of the original's font loader, for the translated code.
//
// The original draws text with its own TrueType font (Graphics.ocg/Endeavour.ttf): graphics/C4FontLoader.cpp loads it
// with FreeType 2 (CStdVectorFont: FT_Init_FreeType, FT_New_Memory_Face) and renders each character into its font
// atlas with FT_Set_Pixel_Sizes, FT_Set_Transform (bold) and FT_Load_Char(..., FT_LOAD_RENDER | FT_LOAD_NO_HINTING)
// (CStdFont::AddRenderedChar), then reads the glyph slot's 8-bit coverage bitmap, its bitmap_left/top and advance
// and the face's ascender, descender and units_per_EM. A browser has no FreeType, and its own text rendering
// (canvas fillText) rasterizes differently, so this module is the part of FreeType 2.14.3 (the version of the
// original's build, oracle/build-full.sh) that those calls run, written after its sources:
//  * the TrueType tables the calls read (head, hhea, maxp, hmtx, loca, glyf, cmap formats 4 and 12), the Unicode
//    charmap as FreeType chooses it (find_unicode_charmap);
//  * the glyph loader without hinting (truetype/ttgload.c): font units scaled with FT_MulFix by
//    x_scale = FT_DivFix(ppem << 6, units_per_EM) (tt_size_reset, the font's head flag "integer ppem"), the four
//    phantom points scaled alike, composite glyphs (scale, 2x2 transform, unscaled component offsets as FreeType's
//    default, point matching), the outline moved by -pp1.x; the advance pp2.x - pp1.x (26.6, not rounded);
//  * FT_Set_Transform's matrix applied to the outline and the advance (base/ftobjs.c FT_Load_Glyph);
//  * the bitmap box of ft_glyphslot_preset_bitmap for FT_RENDER_MODE_NORMAL and the anti-aliasing rasterizer
//    smooth/ftgrays.c (64-bit path: cells with cover and area, PIXEL_BITS 8, the DDA for conics, the bisection of
//    cubics, the non-zero sweep), through FT_Outline_Decompose.
// test/freetype.test.ts compares every glyph the game renders with the original's FreeType (re/openclonk/oracle/ft).
import { Ptr } from './ptr.ts';

/** FreeType's error codes the font loader can see (0: no error) */
const FT_Err_Ok = 0, FT_Err_Unknown_File_Format = 2, FT_Err_Invalid_Argument = 6, FT_Err_Invalid_Glyph_Index = 0x10;
const FT_PIXEL_MODE_GRAY = 2;
const FT_LOAD_NO_SCALE = 1, FT_LOAD_NO_HINTING = 2, FT_LOAD_RENDER = 4;

// ---- FreeType's fixed-point arithmetic (base/ftcalc.c, 64-bit)

/** (a * b + 0x8000 + (a * b >> 63)) >> 16: rounds half away from zero */
export function FT_MulFix(a: number, b: number): number {
  const ab = BigInt(a) * BigInt(b);
  return Number((ab + 0x8000n + (ab < 0n ? -1n : 0n)) >> 16n);
}
/** (a << 16 + b / 2) / b with the signs moved out */
export function FT_DivFix(a: number, b: number): number {
  let s = 1;
  if (a < 0) { a = -a; s = -s; }
  if (b < 0) { b = -b; s = -s; }
  const q = b > 0 ? Number((BigInt(a) * 65536n + BigInt(Math.floor(b / 2))) / BigInt(b)) : 0x7fffffff;
  return s < 0 ? -q : q;
}

// ---- the font file

interface Glyph { xMin: number; yMin: number; xMax: number; yMax: number; contours: number; data: DataView; off: number; len: number }

class TrueTypeFont {
  data: DataView;
  tables = new Map<string, { off: number; len: number }>();
  unitsPerEM = 0;
  headFlags = 0;
  indexToLoc = 0;
  numGlyphs = 0;
  ascender = 0;
  descender = 0;
  height = 0;
  numHMetrics = 0;
  maxAdvance = 0;
  cmap: ((code: number) => number) | null = null;

  constructor(bytes: Uint8Array) {
    const d = this.data = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
    const version = d.getUint32(0);
    if (version !== 0x00010000 && version !== 0x74727565) throw FT_Err_Unknown_File_Format;
    const n = d.getUint16(4);
    for (let i = 0; i < n; i++) {
      const at = 12 + 16 * i;
      const tag = String.fromCharCode(d.getUint8(at), d.getUint8(at + 1), d.getUint8(at + 2), d.getUint8(at + 3));
      this.tables.set(tag, { off: d.getUint32(at + 8), len: d.getUint32(at + 12) });
    }
    const head = this.table('head'), hhea = this.table('hhea'), maxp = this.table('maxp');
    this.headFlags = d.getUint16(head + 16);
    this.unitsPerEM = d.getUint16(head + 18);
    this.indexToLoc = d.getInt16(head + 50);
    this.numGlyphs = d.getUint16(maxp + 4);
    // sfobjs.c: the face's ascender and descender are OS/2's typographic ones when fsSelection has USE_TYPO_METRICS,
    // else hhea's (and OS/2's typographic ones again when hhea's are both 0)
    const os2 = this.tables.get('OS/2')?.off;
    const typo = os2 !== undefined && d.getUint16(os2 + 62) & 128;
    if (typo) {
      this.ascender = d.getInt16(os2 + 68);
      this.descender = d.getInt16(os2 + 70);
      this.height = this.ascender - this.descender + d.getInt16(os2 + 72);
    } else {
      this.ascender = d.getInt16(hhea + 4);
      this.descender = d.getInt16(hhea + 6);
      this.height = this.ascender - this.descender + d.getInt16(hhea + 8);
      if (!this.ascender && !this.descender && os2 !== undefined) {
        this.ascender = d.getInt16(os2 + 68);
        this.descender = d.getInt16(os2 + 70);
        this.height = this.ascender - this.descender + d.getInt16(os2 + 72);
      }
    }
    this.maxAdvance = d.getUint16(hhea + 10);
    this.numHMetrics = d.getUint16(hhea + 34);
    this.cmap = this.unicodeCmap();
  }

  table(tag: string): number {
    const t = this.tables.get(tag);
    if (!t) throw FT_Err_Unknown_File_Format;
    return t.off;
  }

  /** find_unicode_charmap (base/ftobjs.c): a UCS-4 table first (3/10, 0/4, 0/6), else the first Unicode one (0/x, 3/1) */
  unicodeCmap(): ((code: number) => number) | null {
    const d = this.data, base = this.table('cmap');
    const n = d.getUint16(base + 2);
    const subs: { pid: number; eid: number; off: number; format: number }[] = [];
    for (let i = 0; i < n; i++) {
      const pid = d.getUint16(base + 4 + 8 * i), eid = d.getUint16(base + 6 + 8 * i), off = base + d.getUint32(base + 8 + 8 * i);
      subs.push({ pid, eid, off, format: d.getUint16(off) });
    }
    const unicode = (s: typeof subs[0]) => s.pid === 0 || (s.pid === 3 && (s.eid === 1 || s.eid === 10));
    const ucs4 = (s: typeof subs[0]) => (s.pid === 3 && s.eid === 10) || (s.pid === 0 && (s.eid === 4 || s.eid === 6));
    // the charmaps in reverse order for UCS-4 (ftobjs.c walks from the last), then the first Unicode one
    let pick = [...subs].reverse().find((s) => ucs4(s) && (s.format === 12 || s.format === 13));
    pick ??= [...subs].reverse().find((s) => unicode(s));
    if (!pick) return null;
    const off = pick.off;
    if (pick.format === 4) {
      const segX2 = d.getUint16(off + 6);
      const ends = off + 14, starts = ends + segX2 + 2, deltas = starts + segX2, ranges = deltas + segX2;
      return (code: number) => {
        if (code > 0xffff) return 0;
        for (let i = 0; i < segX2 / 2; i++) {
          const end = d.getUint16(ends + 2 * i);
          if (code > end) continue;
          const start = d.getUint16(starts + 2 * i);
          if (code < start) return 0;
          const delta = d.getInt16(deltas + 2 * i), ro = d.getUint16(ranges + 2 * i);
          if (ro === 0) return (code + delta) & 0xffff;
          const at = ranges + 2 * i + ro + 2 * (code - start);
          const g = d.getUint16(at);
          return g ? (g + delta) & 0xffff : 0;
        }
        return 0;
      };
    }
    if (pick.format === 12) {
      const groups = d.getUint32(off + 12);
      return (code: number) => {
        for (let i = 0; i < groups; i++) {
          const at = off + 16 + 12 * i;
          const s = d.getUint32(at), e = d.getUint32(at + 4);
          if (code >= s && code <= e) return d.getUint32(at + 8) + (code - s);
        }
        return 0;
      };
    }
    return null;
  }

  /** advance width and left side bearing in font units (tt_face_get_metrics) */
  hmetrics(gi: number): { aw: number; lsb: number } {
    const d = this.data, hmtx = this.table('hmtx');
    if (gi < this.numHMetrics) return { aw: d.getUint16(hmtx + 4 * gi), lsb: d.getInt16(hmtx + 4 * gi + 2) };
    const last = this.numHMetrics - 1;
    return { aw: d.getUint16(hmtx + 4 * last), lsb: d.getInt16(hmtx + 4 * this.numHMetrics + 2 * (gi - this.numHMetrics)) };
  }

  glyph(gi: number): Glyph | null {
    const d = this.data, loca = this.table('loca'), glyf = this.table('glyf');
    const at = (i: number) => (this.indexToLoc === 0 ? d.getUint16(loca + 2 * i) * 2 : d.getUint32(loca + 4 * i));
    const start = at(gi), end = at(gi + 1);
    if (end <= start) return null;
    const off = glyf + start;
    return { contours: d.getInt16(off), xMin: d.getInt16(off + 2), yMin: d.getInt16(off + 4), xMax: d.getInt16(off + 6), yMax: d.getInt16(off + 8), data: d, off, len: end - start };
  }
}

// ---- outlines (26.6 points, tags: bit 0 on the curve)

interface Outline { xs: number[]; ys: number[]; tags: number[]; contours: number[] }
const emptyOutline = (): Outline => ({ xs: [], ys: [], tags: [], contours: [] });

/** the TrueType glyph loader without hinting: scaled points plus pp1, pp2 (load_truetype_glyph) */
function loadGlyph(font: TrueTypeFont, gi: number, xs: number, ys: number, depth: number, out: Outline): { pp1: number; pp2: number } {
  if (depth > 32) throw FT_Err_Invalid_Argument;
  const { aw, lsb } = font.hmetrics(gi);
  const g = font.glyph(gi);
  // tt_loader_set_pp: pp1.x = bbox.xMin - lsb, pp2.x = pp1.x + advance; scaled one by one
  const xMin = g ? g.xMin : 0;
  const pp1 = FT_MulFix(xMin - lsb, xs), pp2 = FT_MulFix(xMin - lsb + aw, xs);
  if (!g || g.contours === 0) return { pp1, pp2 };
  const d = g.data;
  if (g.contours > 0) {
    // TT_Load_Simple_Glyph
    let p = g.off + 10;
    const ends: number[] = [];
    for (let i = 0; i < g.contours; i++, p += 2) ends.push(d.getUint16(p));
    const n = ends[ends.length - 1] + 1;
    p += 2 + d.getUint16(p); // instructions
    const flags: number[] = [];
    while (flags.length < n) {
      const f = d.getUint8(p++);
      flags.push(f);
      if (f & 8) { let r = d.getUint8(p++); while (r-- > 0 && flags.length < n) flags.push(f); }
    }
    const px: number[] = [], py: number[] = [];
    let v = 0;
    for (const f of flags) {
      if (f & 2) { const dx = d.getUint8(p++); v += f & 16 ? dx : -dx; } else if (!(f & 16)) { v += d.getInt16(p); p += 2; }
      px.push(v);
    }
    v = 0;
    for (const f of flags) {
      if (f & 4) { const dy = d.getUint8(p++); v += f & 32 ? dy : -dy; } else if (!(f & 32)) { v += d.getInt16(p); p += 2; }
      py.push(v);
    }
    if (flags[0] & 0x40) throw new Error('freetype: overlapping outline (FT_OUTLINE_OVERLAP) not rendered as FreeType does');
    const base = out.xs.length;
    for (let i = 0; i < n; i++) {
      out.xs.push(FT_MulFix(px[i], xs));
      out.ys.push(FT_MulFix(py[i], ys));
      out.tags.push(flags[i] & 1);
    }
    for (const e of ends) out.contours.push(base + e);
    return { pp1, pp2 };
  }
  // a composite glyph (TT_Load_Composite_Glyph, TT_Process_Composite_Component)
  let p = g.off + 10;
  let pps = { pp1, pp2 };
  for (;;) {
    const flags = d.getUint16(p), index = d.getUint16(p + 2);
    p += 4;
    let arg1: number, arg2: number;
    if (flags & 1) {
      arg1 = flags & 2 ? d.getInt16(p) : d.getUint16(p);
      arg2 = flags & 2 ? d.getInt16(p + 2) : d.getUint16(p + 2);
      p += 4;
    } else {
      arg1 = flags & 2 ? d.getInt8(p) : d.getUint8(p);
      arg2 = flags & 2 ? d.getInt8(p + 1) : d.getUint8(p + 1);
      p += 2;
    }
    let xx = 0x10000, xy = 0, yx = 0, yy = 0x10000;
    if (flags & 8) { xx = yy = d.getInt16(p) * 4; p += 2; }
    else if (flags & 0x40) { xx = d.getInt16(p) * 4; yy = d.getInt16(p + 2) * 4; p += 4; }
    else if (flags & 0x80) { xx = d.getInt16(p) * 4; yx = d.getInt16(p + 2) * 4; xy = d.getInt16(p + 4) * 4; yy = d.getInt16(p + 6) * 4; p += 8; }
    if (flags & 0x400) throw new Error('freetype: overlapping outline (FT_OUTLINE_OVERLAP) not rendered as FreeType does');
    const first = out.xs.length;
    const sub = loadGlyph(font, index, xs, ys, depth + 1, out);
    if (flags & 0x200) pps = sub; // USE_MY_METRICS
    const last = out.xs.length;
    if (last === first) { if (!(flags & 0x20)) break; continue; }
    if (flags & (8 | 0x40 | 0x80)) {
      // FT_Outline_Transform on the component's points (FT_Vector_Transform)
      for (let i = first; i < last; i++) {
        const x = out.xs[i], y = out.ys[i];
        out.xs[i] = FT_MulFix(x, xx) + FT_MulFix(y, xy);
        out.ys[i] = FT_MulFix(x, yx) + FT_MulFix(y, yy);
      }
    }
    let x: number, y: number;
    if (!(flags & 2)) {
      // point matching: arg1 of the glyph so far, arg2 of the component
      const k = first + arg2, l = arg1;
      if (l >= first || k >= last) throw FT_Err_Invalid_Argument;
      x = out.xs[l] - out.xs[k];
      y = out.ys[l] - out.ys[k];
    } else {
      // unscaled component offsets (FreeType's default without TT_CONFIG_OPTION_COMPONENT_OFFSET_SCALED)
      x = arg1; y = arg2;
      if (flags & 0x800) throw new Error('freetype: SCALED_COMPONENT_OFFSET not supported');
      x = FT_MulFix(x, xs);
      y = FT_MulFix(y, ys);
    }
    if (x || y) for (let i = first; i < last; i++) { out.xs[i] += x; out.ys[i] += y; }
    if (!(flags & 0x20)) break;
  }
  return pps;
}

// ---- the anti-aliasing rasterizer (smooth/ftgrays.c with FT_INT64, PIXEL_BITS 8)

const PIXEL_BITS = 8, ONE_PIXEL = 1 << PIXEL_BITS;
const TRUNC = (x: number) => x >> PIXEL_BITS;
const FRACT = (x: number) => x & (ONE_PIXEL - 1);
const UPSCALE = (x: number) => x * (ONE_PIXEL >> 6);

class Gray {
  minEx: number; maxEx: number; minEy: number; maxEy: number;
  /** per row: cells by x (cover, area), kept sorted when swept */
  rows: Map<number, { cover: number; area: number }>[];
  cell: { cover: number; area: number } | null = null;
  x = 0;
  y = 0;
  constructor(width: number, height: number) {
    this.minEx = 0; this.maxEx = width; this.minEy = 0; this.maxEy = height;
    this.rows = Array.from({ length: height }, () => new Map());
  }

  setCell(ex: number, ey: number): void {
    const i = ey - this.minEy;
    if (i < 0 || i >= this.rows.length || ex >= this.maxEx) { this.cell = null; return; }
    ex = Math.max(ex, this.minEx - 1);
    let c = this.rows[i].get(ex);
    if (!c) { c = { cover: 0, area: 0 }; this.rows[i].set(ex, c); }
    this.cell = c;
  }

  /** FT_INTEGRATE: cover += a, area += a * b (on the null cell: nothing) */
  integrate(a: number, b: number): void {
    if (this.cell) { this.cell.cover = (this.cell.cover + a) | 0; this.cell.area = (this.cell.area + a * b) | 0; }
  }

  renderLine(toX: number, toY: number): void {
    let ey1 = TRUNC(this.y);
    const ey2 = TRUNC(toY);
    if ((ey1 >= this.maxEy && ey2 >= this.maxEy) || (ey1 < this.minEy && ey2 < this.minEy)) { this.x = toX; this.y = toY; return; }
    let ex1 = TRUNC(this.x);
    const ex2 = TRUNC(toX);
    let fx1 = FRACT(this.x), fy1 = FRACT(this.y);
    const dx = toX - this.x, dy = toY - this.y;
    let fx2: number, fy2: number;
    if (ex1 === ex2 && ey1 === ey2) {
      // inside one cell
    } else if (dy === 0) {
      this.setCell(ex2, ey2);
      this.x = toX; this.y = toY;
      return;
    } else if (dx === 0) {
      if (dy > 0) {
        do { fy2 = ONE_PIXEL; this.integrate(fy2 - fy1, fx1 * 2); fy1 = 0; ey1++; this.setCell(ex1, ey1); } while (ey1 !== ey2);
      } else {
        do { fy2 = 0; this.integrate(fy2 - fy1, fx1 * 2); fy1 = ONE_PIXEL; ey1--; this.setCell(ex1, ey1); } while (ey1 !== ey2);
      }
    } else {
      // prod and the multiply-shift divisions on 64 bits (FT_UDIVPREP, FT_UDIV)
      let prod = dx * fy1 - dy * fx1;
      // FT_UDIV(a, b): (FT_UInt64)a * (FT_UInt64)b_r >> 32, b_r = (FT_Int64)0xFFFFFFFF / b (FT_UDIVPREP; -dx_r for -dx)
      const udiv = (a: number, r: number) => Number((BigInt.asUintN(64, BigInt(a)) * BigInt.asUintN(64, BigInt(r)) & 0xffffffffffffffffn) >> 32n) | 0;
      const sdivr = (d: number) => Math.trunc(0xffffffff / d);
      const rdx = ex1 !== ex2 ? sdivr(dx) : 0, rmdx = ex1 !== ex2 ? sdivr(-dx) : 0;
      const rdy = ey1 !== ey2 ? sdivr(dy) : 0, rmdy = ey1 !== ey2 ? sdivr(-dy) : 0;
      do {
        if (prod - dx * ONE_PIXEL > 0 && prod <= 0) { // left
          fx2 = 0;
          fy2 = udiv(-prod, rmdx);
          prod -= dy * ONE_PIXEL;
          this.integrate(fy2 - fy1, fx1 + fx2);
          fx1 = ONE_PIXEL; fy1 = fy2; ex1--;
        } else if (prod - dx * ONE_PIXEL + dy * ONE_PIXEL > 0 && prod - dx * ONE_PIXEL <= 0) { // up
          prod -= dx * ONE_PIXEL;
          fx2 = udiv(-prod, rdy);
          fy2 = ONE_PIXEL;
          this.integrate(fy2 - fy1, fx1 + fx2);
          fx1 = fx2; fy1 = 0; ey1++;
        } else if (prod + dy * ONE_PIXEL >= 0 && prod - dx * ONE_PIXEL + dy * ONE_PIXEL <= 0) { // right
          prod += dy * ONE_PIXEL;
          fx2 = ONE_PIXEL;
          fy2 = udiv(prod, rdx);
          this.integrate(fy2 - fy1, fx1 + fx2);
          fx1 = 0; fy1 = fy2; ex1++;
        } else { // down
          fx2 = udiv(prod, rmdy);
          fy2 = 0;
          prod += dx * ONE_PIXEL;
          this.integrate(fy2 - fy1, fx1 + fx2);
          fx1 = fx2; fy1 = ONE_PIXEL; ey1--;
        }
        this.setCell(ex1, ey1);
      } while (ex1 !== ex2 || ey1 !== ey2);
    }
    fx2 = FRACT(toX);
    fy2 = FRACT(toY);
    this.integrate(fy2 - fy1, fx1 + fx2);
    this.x = toX;
    this.y = toY;
  }

  renderConic(cx: number, cy: number, tx: number, ty: number): void {
    const p0x = this.x, p0y = this.y;
    const p1x = UPSCALE(cx), p1y = UPSCALE(cy), p2x = UPSCALE(tx), p2y = UPSCALE(ty);
    if ((TRUNC(p0y) >= this.maxEy && TRUNC(p1y) >= this.maxEy && TRUNC(p2y) >= this.maxEy) ||
        (TRUNC(p0y) < this.minEy && TRUNC(p1y) < this.minEy && TRUNC(p2y) < this.minEy)) {
      this.x = p2x; this.y = p2y;
      return;
    }
    const bx = p1x - p0x, by = p1y - p0y;
    const ax = p2x - p1x - bx, ay = p2y - p1y - by;
    let dx = Math.abs(ax);
    const dy = Math.abs(ay);
    if (dx < dy) dx = dy;
    if (dx <= ONE_PIXEL / 4) { this.renderLine(p2x, p2y); return; }
    let shift = 16;
    do { dx >>= 2; shift--; } while (dx > ONE_PIXEL / 4);
    let count = 0x10000 >>> shift;
    const L = (a: number, b: number) => BigInt.asIntN(64, BigInt(a) << BigInt(b));
    let rx = L(ax, shift + shift), ry = L(ay, shift + shift);
    let qx = L(bx, shift + 17) + rx, qy = L(by, shift + 17) + ry;
    rx *= 2n; ry *= 2n;
    let px = L(p0x, 32), py = L(p0y, 32);
    do {
      px += qx; py += qy;
      qx += rx; qy += ry;
      this.renderLine(Number(px >> 32n), Number(py >> 32n));
    } while (--count);
  }

  renderCubic(c1x: number, c1y: number, c2x: number, c2y: number, tx: number, ty: number): void {
    const ax = [UPSCALE(tx), UPSCALE(c2x), UPSCALE(c1x), this.x], ay = [UPSCALE(ty), UPSCALE(c2y), UPSCALE(c1y), this.y];
    if (ay.every((y) => TRUNC(y) >= this.maxEy) || ay.every((y) => TRUNC(y) < this.minEy)) { this.x = ax[0]; this.y = ay[0]; return; }
    const sx = new Array<number>(16 * 3 + 1).fill(0), sy = new Array<number>(16 * 3 + 1).fill(0);
    for (let i = 0; i < 4; i++) { sx[i] = ax[i]; sy[i] = ay[i]; }
    let a = 0;
    const split = (b: number[], i: number) => {
      b[i + 6] = b[i + 3];
      let A = b[i] + b[i + 1];
      const B = b[i + 1] + b[i + 2];
      let C = b[i + 2] + b[i + 3];
      b[i + 5] = C >> 1;
      C += B;
      b[i + 4] = C >> 2;
      b[i + 1] = A >> 1;
      A += B;
      b[i + 2] = A >> 2;
      b[i + 3] = (A + C) >> 3;
    };
    for (;;) {
      if (Math.abs(2 * sx[a] - 3 * sx[a + 1] + sx[a + 3]) > ONE_PIXEL / 2 || Math.abs(2 * sy[a] - 3 * sy[a + 1] + sy[a + 3]) > ONE_PIXEL / 2 ||
          Math.abs(sx[a] - 3 * sx[a + 2] + 2 * sx[a + 3]) > ONE_PIXEL / 2 || Math.abs(sy[a] - 3 * sy[a + 2] + 2 * sy[a + 3]) > ONE_PIXEL / 2) {
        split(sx, a); split(sy, a);
        a += 3;
        continue;
      }
      this.renderLine(sx[a], sy[a]);
      if (a === 0) return;
      a -= 3;
    }
  }

  moveTo(x: number, y: number): void {
    x = UPSCALE(x); y = UPSCALE(y);
    this.setCell(TRUNC(x), TRUNC(y));
    this.x = x; this.y = y;
  }

  /** FT_Outline_Decompose with the gray raster's callbacks (shift 0, delta 0) */
  decompose(o: Outline): void {
    let last = -1;
    for (const end of o.contours) {
      const first = last + 1;
      last = end;
      let limit = last;
      let vsx = o.xs[first], vsy = o.ys[first];
      const vlx = o.xs[last], vly = o.ys[last];
      let vcx = vsx, vcy = vsy;
      let point = first;
      if ((o.tags[first] & 3) === 0) {
        if ((o.tags[last] & 3) === 1) { vsx = vlx; vsy = vly; limit--; }
        else { vsx = Math.trunc((vsx + vlx) / 2); vsy = Math.trunc((vsy + vly) / 2); }
        point--;
      }
      this.moveTo(vsx, vsy);
      let closed = false;
      while (point < limit) {
        point++;
        if ((o.tags[point] & 3) === 1) { this.renderLine(UPSCALE(o.xs[point]), UPSCALE(o.ys[point])); continue; }
        vcx = o.xs[point]; vcy = o.ys[point];
        for (;;) {
          if (point < limit) {
            point++;
            const x = o.xs[point], y = o.ys[point];
            if ((o.tags[point] & 3) === 1) { this.renderConic(vcx, vcy, x, y); break; }
            this.renderConic(vcx, vcy, Math.trunc((vcx + x) / 2), Math.trunc((vcy + y) / 2));
            vcx = x; vcy = y;
            continue;
          }
          this.renderConic(vcx, vcy, vsx, vsy);
          closed = true;
          break;
        }
        if (closed) break;
      }
      if (!closed) this.renderLine(UPSCALE(vsx), UPSCALE(vsy));
    }
  }

  /** gray_sweep with the non-zero rule into rows of `pitch` bytes, row 0 at the top */
  sweep(buffer: Uint8Array, pitch: number): void {
    const height = this.rows.length;
    const cov = (area: number) => {
      let c = area >> (PIXEL_BITS * 2 + 1 - 8);
      if (c & 0x80000000) c = ~c; // the non-zero rule's fill bit (INT_MIN)
      return c > 255 ? 255 : c;
    };
    for (let y = this.minEy; y < this.maxEy; y++) {
      const cells = [...this.rows[y - this.minEy].entries()].sort((a, b) => a[0] - b[0]);
      const line = (height - 1 - y) * pitch;
      let x = this.minEx;
      let cover = 0;
      for (const [cx, c] of cells) {
        if (cover !== 0 && cx > x) buffer.fill(cov(cover), line + x, line + cx);
        cover = (cover + c.cover * (ONE_PIXEL * 2)) | 0;
        const area = (cover - c.area) | 0;
        if (area !== 0 && cx >= this.minEx) buffer[line + cx] = cov(area);
        x = cx + 1;
      }
      if (cover !== 0) buffer.fill(cov(cover), line + x, line + this.maxEx);
    }
  }
}

// ---- the API (freetype.h), as the translated font loader calls it

/** an FT_Face as C4FontLoader.cpp reads it */
export class FT_FaceRec {
  font: TrueTypeFont;
  units_per_EM: number;
  ascender: number;
  descender: number;
  height: number;
  glyph = new FT_GlyphSlotRec();
  x_scale = 0;
  y_scale = 0;
  matrix: { xx: number; xy: number; yx: number; yy: number } | null = null;
  constructor(font: TrueTypeFont) {
    this.font = font;
    this.units_per_EM = font.unitsPerEM;
    this.ascender = font.ascender;
    this.descender = font.descender;
    this.height = font.height;
  }
}

export class FT_GlyphSlotRec {
  bitmap = { rows: 0, width: 0, pitch: 0, buffer: null as Ptr | null, num_grays: 256, pixel_mode: FT_PIXEL_MODE_GRAY };
  bitmap_left = 0;
  bitmap_top = 0;
  advance = { x: 0, y: 0 };
}

/** the library handle (one per CStdVectorFont) */
export function ft$FT_Init_FreeType(library: Ptr): number {
  store(library, { freetype: '2.14.3' });
  return FT_Err_Ok;
}
export function ft$FT_Done_FreeType(_library: unknown): number { return FT_Err_Ok; }

/** the bytes of a `const FT_Byte *` with its size */
function bytesAt(p: unknown, size: number): Uint8Array {
  if (p instanceof Ptr && ArrayBuffer.isView(p.a)) {
    const a = p.a as Uint8Array;
    const es = (a as unknown as { BYTES_PER_ELEMENT: number }).BYTES_PER_ELEMENT;
    return new Uint8Array(a.buffer, a.byteOffset + (p.o as number) * es, size);
  }
  if (p instanceof Uint8Array) return p.subarray(0, size);
  throw new Error('freetype: font data is not a byte array');
}

function store(p: Ptr, v: unknown): void {
  if (typeof p.o === 'string') p.a[p.o] = v;
  else p.a[p.o] = v;
}

export function ft$FT_New_Memory_Face(_library: unknown, data: unknown, size: number | bigint, index: number, face: Ptr): number {
  if (index !== 0) return FT_Err_Invalid_Argument;
  try {
    store(face, new FT_FaceRec(new TrueTypeFont(bytesAt(data, Number(size)))));
    return FT_Err_Ok;
  } catch (e) {
    if (typeof e === 'number') return e;
    return FT_Err_Unknown_File_Format;
  }
}
/** a font by its file name: the browser has no system fonts (the original then logs the error and goes on) */
export function ft$FT_New_Face(_library: unknown, _path: unknown, _index: number, _face: Ptr): number {
  return 1; // FT_Err_Cannot_Open_Resource
}
export function ft$FT_Done_Face(_face: unknown): number { return FT_Err_Ok; }

/** FT_Set_Pixel_Sizes: the nominal size in whole pixels (FT_Request_Metrics, tt_size_reset) */
export function ft$FT_Set_Pixel_Sizes(face: FT_FaceRec, w: number, h: number): number {
  if (!w) w = h;
  if (!h) h = w;
  if (w < 1) w = 1;
  if (h < 1) h = 1;
  const upem = face.units_per_EM;
  // FT_Request_Metrics: scaled = size * 64; ppem = (scaled + 32) >> 6
  face.x_scale = FT_DivFix(w * 64, upem);
  face.y_scale = FT_DivFix(h * 64, upem);
  if (face.font.headFlags & 8) {
    // tt_size_reset: integer ppem
    face.x_scale = FT_DivFix(((w * 64 + 32) >> 6) << 6, upem);
    face.y_scale = FT_DivFix(((h * 64 + 32) >> 6) << 6, upem);
  }
  return FT_Err_Ok;
}

/** FT_Set_Transform(face, matrix, delta): the outline and advance of later glyphs are transformed (no delta here) */
export function ft$FT_Set_Transform(face: FT_FaceRec, matrix: { xx: number; xy: number; yx: number; yy: number } | null, delta: unknown): void {
  if (delta) throw new Error('freetype: FT_Set_Transform with a delta is not used by the original');
  const m = matrix && (matrix as any).a !== undefined ? (matrix as any).a[(matrix as any).o] : matrix;
  face.matrix = m && !(m.xx === 0x10000 && m.xy === 0 && m.yx === 0 && m.yy === 0x10000) ? { xx: m.xx | 0, xy: m.xy | 0, yx: m.yx | 0, yy: m.yy | 0 } : null;
}

/** FT_Load_Char(face, code, FT_LOAD_RENDER | FT_LOAD_NO_HINTING) */
export function ft$FT_Load_Char(face: FT_FaceRec, code: number | bigint, flags: number): number {
  if (flags & FT_LOAD_NO_SCALE) throw new Error('freetype: FT_LOAD_NO_SCALE is not used by the original');
  if (!(flags & FT_LOAD_NO_HINTING)) throw new Error('freetype: hinted loading is not used by the original');
  const font = face.font;
  const gi = font.cmap ? font.cmap(Number(code)) : 0;
  if (gi >= font.numGlyphs) return FT_Err_Invalid_Glyph_Index;
  const outline = emptyOutline();
  const { pp1, pp2 } = loadGlyph(font, gi, face.x_scale, face.y_scale, 0, outline);
  // TT_Load_Glyph: the origin at pp1
  if (pp1) for (let i = 0; i < outline.xs.length; i++) outline.xs[i] -= pp1;
  const slot = face.glyph;
  slot.advance = { x: pp2 - pp1, y: 0 };
  const m = face.matrix;
  if (m) {
    for (let i = 0; i < outline.xs.length; i++) {
      const x = outline.xs[i], y = outline.ys[i];
      outline.xs[i] = FT_MulFix(x, m.xx) + FT_MulFix(y, m.xy);
      outline.ys[i] = FT_MulFix(x, m.yx) + FT_MulFix(y, m.yy);
    }
    const ax = slot.advance.x, ay = slot.advance.y;
    slot.advance = { x: FT_MulFix(ax, m.xx) + FT_MulFix(ay, m.xy), y: FT_MulFix(ax, m.yx) + FT_MulFix(ay, m.yy) };
  }
  if (flags & FT_LOAD_RENDER) render(slot, outline);
  return FT_Err_Ok;
}

/** ft_smooth_render in FT_RENDER_MODE_NORMAL: the bitmap box of ft_glyphslot_preset_bitmap, then ftgrays */
function render(slot: FT_GlyphSlotRec, o: Outline): void {
  let xMin = 0, yMin = 0, xMax = 0, yMax = 0;
  if (o.xs.length) {
    xMin = Math.min(...o.xs); xMax = Math.max(...o.xs);
    yMin = Math.min(...o.ys); yMax = Math.max(...o.ys);
  }
  const left = (xMin >> 6) + ((xMin & 63) >> 6);
  const bottom = (yMin >> 6) + ((yMin & 63) >> 6);
  const right = (xMax >> 6) + (((xMax & 63) + 63) >> 6);
  const top = (yMax >> 6) + (((yMax & 63) + 63) >> 6);
  const width = right - left, height = top - bottom;
  slot.bitmap_left = left;
  slot.bitmap_top = top;
  slot.bitmap.width = width;
  slot.bitmap.rows = height;
  slot.bitmap.pitch = width;
  slot.bitmap.pixel_mode = FT_PIXEL_MODE_GRAY;
  slot.bitmap.buffer = null;
  if (!height || !width) return;
  const buffer = new Uint8Array(width * height);
  slot.bitmap.buffer = new Ptr(buffer, 0);
  // the outline moved into the bitmap: x - left * 64, y - bottom * 64
  const moved: Outline = { xs: o.xs.map((x) => x - left * 64), ys: o.ys.map((y) => y - bottom * 64), tags: o.tags, contours: o.contours };
  const ras = new Gray(width, height);
  ras.decompose(moved);
  ras.sweep(buffer, width);
}

/** every function of this module (re/openclonk/tools/ft.txt lists the same, for the translator) */
export const FT_FUNCTIONS: readonly string[] = [
  'FT_Init_FreeType', 'FT_Done_FreeType', 'FT_New_Memory_Face', 'FT_New_Face', 'FT_Done_Face', 'FT_Set_Pixel_Sizes',
  'FT_Set_Transform', 'FT_Load_Char',
];
