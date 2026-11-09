// A TrueType font file (sfnt) as FreeType's TrueType driver reads it, for the port's FreeType (ft.ts): the
// header tables (head, hhea, maxp, OS/2), the Unicode character map (cmap formats 4 and 12, chosen as
// FreeType chooses its default charmap), horizontal metrics (hmtx), glyph outlines (loca, glyf: simple and
// composite glyphs, in font units) and kerning pairs (kern format 0). Written for the port from the OpenType
// specification and FreeType 2.13's sfnt and truetype modules (sfobjs.c, ttcmap.c, ttgload.c).

/** A composite glyph's component: 16.16 transform (xx, xy, yx, yy as FreeType's FT_Matrix: x' = xx*x + xy*y). */
export type Component = { gi: number; flags: number; arg1: number; arg2: number; xx: number; xy: number; yx: number; yy: number };
/** A glyph's outline in font units, as TrueType stores it: points with on/off-curve flags, contour ends. */
export type GlyphOutline = { x: number[]; y: number[]; on: boolean[]; ends: number[]; xMin: number; yMin: number; xMax: number; yMax: number;
  /** a composite glyph's component that gives it its metrics (USE_MY_METRICS), or -1 */
  metricsFrom: number };

export class Sfnt {
  d: DataView;
  tables = new Map<string, { off: number; len: number }>();
  unitsPerEm = 0;
  headFlags = 0;
  bbox = { xMin: 0, yMin: 0, xMax: 0, yMax: 0 };
  indexToLocFormat = 0;
  numGlyphs = 0;
  hhea = { ascender: 0, descender: 0, lineGap: 0, advanceWidthMax: 0, numberOfHMetrics: 0 };
  os2: { version: number; fsSelection: number; typoAscender: number; typoDescender: number; typoLineGap: number; winAscent: number; winDescent: number } | null = null;
  /** FreeType's root metrics (sfobjs.c): ascender, descender, height (with the line gap), in font units. */
  ascender = 0;
  descender = 0;
  height = 0;
  cmap: (c: number) => number = () => 0;
  kern: Map<number, number> | null = null;
  postIsFixedPitch = false;

  constructor(bytes: Uint8Array) {
    this.d = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
    const d = this.d;
    const n = d.getUint16(4);
    for (let i = 0; i < n; i++) {
      const r = 12 + 16 * i;
      const tag = String.fromCharCode(d.getUint8(r), d.getUint8(r + 1), d.getUint8(r + 2), d.getUint8(r + 3));
      this.tables.set(tag, { off: d.getUint32(r + 8), len: d.getUint32(r + 12) });
    }
    const head = this.table('head');
    this.headFlags = d.getUint16(head + 16);
    this.unitsPerEm = d.getUint16(head + 18);
    this.bbox = { xMin: d.getInt16(head + 36), yMin: d.getInt16(head + 38), xMax: d.getInt16(head + 40), yMax: d.getInt16(head + 42) };
    this.indexToLocFormat = d.getInt16(head + 50);
    this.numGlyphs = d.getUint16(this.table('maxp') + 4);
    const hh = this.table('hhea');
    this.hhea = { ascender: d.getInt16(hh + 4), descender: d.getInt16(hh + 6), lineGap: d.getInt16(hh + 8),
      advanceWidthMax: d.getUint16(hh + 10), numberOfHMetrics: d.getUint16(hh + 34) };
    if (this.tables.has('OS/2')) {
      const o = this.table('OS/2');
      this.os2 = { version: d.getUint16(o), fsSelection: d.getUint16(o + 62), typoAscender: d.getInt16(o + 68), typoDescender: d.getInt16(o + 70),
        typoLineGap: d.getInt16(o + 72), winAscent: d.getUint16(o + 74), winDescent: d.getUint16(o + 76) };
    }
    if (this.tables.has('post')) this.postIsFixedPitch = d.getUint32(this.table('post') + 12) !== 0;
    // sfobjs.c: the root metrics
    const os2 = this.os2;
    if (os2 && os2.fsSelection & 128) {
      this.ascender = os2.typoAscender;
      this.descender = os2.typoDescender;
      this.height = this.ascender - this.descender + os2.typoLineGap;
    } else {
      this.ascender = this.hhea.ascender;
      this.descender = this.hhea.descender;
      this.height = this.ascender - this.descender + this.hhea.lineGap;
      if (!(this.ascender || this.descender) && os2) {
        if (os2.typoAscender || os2.typoDescender) {
          this.ascender = os2.typoAscender;
          this.descender = os2.typoDescender;
          this.height = this.ascender - this.descender + os2.typoLineGap;
        } else {
          this.ascender = os2.winAscent;
          this.descender = -os2.winDescent;
          this.height = this.ascender - this.descender;
        }
      }
    }
    this.readCmap();
    this.readKern();
  }

  table(tag: string): number {
    const t = this.tables.get(tag);
    if (!t) throw new Error('font has no ' + tag + ' table');
    return t.off;
  }

  /** The charmap FreeType selects (find_unicode_charmap: a UCS-4 one first, else any Unicode one). */
  readCmap() {
    const d = this.d, base = this.table('cmap');
    const n = d.getUint16(base + 2);
    const subs: { pid: number; eid: number; off: number; format: number }[] = [];
    for (let i = 0; i < n; i++) {
      const r = base + 4 + 8 * i;
      const off = base + d.getUint32(r + 4);
      subs.push({ pid: d.getUint16(r), eid: d.getUint16(r + 2), off, format: d.getUint16(off) });
    }
    const unicode = (s: any) => s.pid === 0 || (s.pid === 3 && (s.eid === 1 || s.eid === 10));
    const ucs4 = (s: any) => (s.pid === 3 && s.eid === 10) || (s.pid === 0 && (s.eid === 4 || s.eid === 6));
    // FreeType walks the charmaps from the last to the first for UCS-4 ones, then from the first for any
    let pick = null;
    for (let i = subs.length - 1; i >= 0; i--) if (ucs4(subs[i]) && (subs[i].format === 12 || subs[i].format === 4)) { pick = subs[i]; break; }
    if (!pick) for (const s of subs) if (unicode(s) && (s.format === 4 || s.format === 12)) { pick = s; break; }
    if (!pick) return;
    const o = pick.off;
    if (pick.format === 4) {
      const segX2 = d.getUint16(o + 6);
      const ends = o + 14, starts = ends + segX2 + 2, deltas = starts + segX2, ranges = deltas + segX2;
      this.cmap = (c: number) => {
        if (c > 0xffff) return 0;
        for (let i = 0; i < segX2; i += 2) {
          const end = d.getUint16(ends + i);
          if (c > end) continue;
          const start = d.getUint16(starts + i);
          if (c < start) return 0;
          const delta = d.getInt16(deltas + i), ro = d.getUint16(ranges + i);
          if (ro === 0) return (c + delta) & 0xffff;
          const gi = d.getUint16(ranges + i + ro + 2 * (c - start));
          return gi === 0 ? 0 : (gi + delta) & 0xffff;
        }
        return 0;
      };
    } else {
      const ng = d.getUint32(o + 12);
      this.cmap = (c: number) => {
        for (let i = 0; i < ng; i++) {
          const r = o + 16 + 12 * i;
          const s = d.getUint32(r), e = d.getUint32(r + 4);
          if (c >= s && c <= e) return d.getUint32(r + 8) + (c - s);
        }
        return 0;
      };
    }
  }

  /** kern table, version 0, format 0 horizontal subtables: pairs (left << 16 | right) -> value. */
  readKern() {
    if (!this.tables.has('kern')) return;
    const d = this.d, base = this.table('kern');
    if (d.getUint16(base) !== 0) return;
    const n = d.getUint16(base + 2);
    let p = base + 4;
    for (let i = 0; i < n; i++) {
      const len = d.getUint16(p + 2), coverage = d.getUint16(p + 4);
      if ((coverage >> 8) === 0 && (coverage & 7) === 1) {
        this.kern ??= new Map();
        const np = d.getUint16(p + 6);
        for (let k = 0; k < np; k++) {
          const r = p + 14 + 6 * k;
          const key = d.getUint16(r) * 65536 + d.getUint16(r + 2);
          this.kern.set(key, (this.kern.get(key) ?? 0) + d.getInt16(r + 4));
        }
      }
      p += len;
    }
  }

  /** Advance width and left side bearing of a glyph (hmtx, the last width repeated). */
  hmetrics(gi: number): { advance: number; lsb: number } {
    const d = this.d, h = this.table('hmtx'), nh = this.hhea.numberOfHMetrics;
    if (gi < nh) return { advance: d.getUint16(h + 4 * gi), lsb: d.getInt16(h + 4 * gi + 2) };
    return { advance: d.getUint16(h + 4 * (nh - 1)), lsb: d.getInt16(h + 4 * nh + 2 * (gi - nh)) };
  }

  glyphRange(gi: number): [number, number] {
    const d = this.d, loca = this.table('loca');
    if (this.indexToLocFormat === 0) return [d.getUint16(loca + 2 * gi) * 2, d.getUint16(loca + 2 * gi + 2) * 2];
    return [d.getUint32(loca + 4 * gi), d.getUint32(loca + 4 * gi + 4)];
  }

  /** A glyph's outline in font units; composite glyphs are combined (offsets and 2x2 transforms applied). */
  outline(gi: number, depth = 0): GlyphOutline {
    const empty: GlyphOutline = { x: [], y: [], on: [], ends: [], xMin: 0, yMin: 0, xMax: 0, yMax: 0, metricsFrom: -1 };
    if (gi >= this.numGlyphs || depth > 16) return empty;
    const [a, b] = this.glyphRange(gi);
    if (b <= a) return empty;
    const d = this.d, g = this.table('glyf') + a;
    const nc = d.getInt16(g);
    const box = { xMin: d.getInt16(g + 2), yMin: d.getInt16(g + 4), xMax: d.getInt16(g + 6), yMax: d.getInt16(g + 8) };
    if (nc >= 0) {
      const ends: number[] = [];
      for (let i = 0; i < nc; i++) ends.push(d.getUint16(g + 10 + 2 * i));
      const np = nc ? ends[nc - 1] + 1 : 0;
      let p = g + 10 + 2 * nc;
      const il = d.getUint16(p);
      p += 2 + il;
      const flags: number[] = [];
      while (flags.length < np) {
        const fl = d.getUint8(p++);
        flags.push(fl);
        if (fl & 8) {
          let r = d.getUint8(p++);
          while (r-- > 0) flags.push(fl);
        }
      }
      const x: number[] = [], y: number[] = [];
      let v = 0;
      for (let i = 0; i < np; i++) {
        const fl = flags[i];
        if (fl & 2) { const dx = d.getUint8(p++); v += fl & 16 ? dx : -dx; } else if (!(fl & 16)) { v += d.getInt16(p); p += 2; }
        x.push(v);
      }
      v = 0;
      for (let i = 0; i < np; i++) {
        const fl = flags[i];
        if (fl & 4) { const dy = d.getUint8(p++); v += fl & 32 ? dy : -dy; } else if (!(fl & 32)) { v += d.getInt16(p); p += 2; }
        y.push(v);
      }
      return { x, y, on: flags.map((f) => (f & 1) !== 0), ends, ...box, metricsFrom: -1 };
    }
    return { x: [], y: [], on: [], ends: [], ...box, metricsFrom: -1, components: this.components(g + 10) } as any;
  }

  /**
   * A composite glyph's components (ttgload.c, TT_Load_Composite_Glyph): glyph index, flags, offsets (or point
   * numbers to match) and the 2x2 transform as 2.14 fixed point values (16384 = 1).
   */
  components(p: number): Component[] {
    const d = this.d;
    const out: Component[] = [];
    for (;;) {
      const fl = d.getUint16(p), gi = d.getUint16(p + 2);
      p += 4;
      let a1: number, a2: number;
      if (fl & 1) {
        if (fl & 2) { a1 = d.getInt16(p); a2 = d.getInt16(p + 2); } else { a1 = d.getUint16(p); a2 = d.getUint16(p + 2); }
        p += 4;
      } else {
        if (fl & 2) { a1 = d.getInt8(p); a2 = d.getInt8(p + 1); } else { a1 = d.getUint8(p); a2 = d.getUint8(p + 1); }
        p += 2;
      }
      let xx = 0x10000, xy = 0, yx = 0, yy = 0x10000;
      if (fl & 8) { xx = yy = d.getInt16(p) * 4; p += 2; } else if (fl & 0x40) { xx = d.getInt16(p) * 4; yy = d.getInt16(p + 2) * 4; p += 4; }
      else if (fl & 0x80) { xx = d.getInt16(p) * 4; yx = d.getInt16(p + 2) * 4; xy = d.getInt16(p + 4) * 4; yy = d.getInt16(p + 6) * 4; p += 8; }
      out.push({ gi, flags: fl, arg1: a1, arg2: a2, xx, xy, yx, yy });
      if (!(fl & 0x20)) break;
    }
    return out;
  }
}
