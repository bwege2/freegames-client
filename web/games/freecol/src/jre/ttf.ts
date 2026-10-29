// What the client needs to know of a TrueType font file: its names, which characters it has (cmap), their
// advances (hmtx), and its vertical metrics, as FreeType reports them to Java2D.

export class TrueType {
  data: DataView;
  bytes: Uint8Array;
  tables = new Map<string, { off: number; len: number }>();
  unitsPerEm = 2048;
  ascender = 0;
  descender = 0;
  lineGap = 0;
  advances: number[] = [];
  cmap = new Map<number, number>();
  family = '';
  subfamily = '';
  fullName = '';
  underlinePosition = 0;
  underlineThickness = 0;
  strikeoutPosition = 0;
  strikeoutSize = 0;
  italicAngle = 0;
  macStyle = 0;
  xMin = 0;
  yMin = 0;
  xMax = 0;
  yMax = 0;
  maxAdvance = 0;

  constructor(bytes: Uint8Array) {
    this.bytes = bytes;
    this.data = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
    const d = this.data;
    const n = d.getUint16(4);
    for (let i = 0; i < n; i++) {
      const at = 12 + 16 * i;
      const tag = String.fromCharCode(bytes[at], bytes[at + 1], bytes[at + 2], bytes[at + 3]);
      this.tables.set(tag, { off: d.getUint32(at + 8), len: d.getUint32(at + 12) });
    }
    const head = this.t('head');
    this.unitsPerEm = d.getUint16(head + 18);
    this.xMin = d.getInt16(head + 36);
    this.yMin = d.getInt16(head + 38);
    this.xMax = d.getInt16(head + 40);
    this.yMax = d.getInt16(head + 42);
    this.macStyle = d.getUint16(head + 44);
    const hhea = this.t('hhea');
    this.ascender = d.getInt16(hhea + 4);
    this.descender = d.getInt16(hhea + 6);
    this.lineGap = d.getInt16(hhea + 8);
    this.maxAdvance = d.getUint16(hhea + 10);
    const nh = d.getUint16(hhea + 34);
    const hmtx = this.t('hmtx');
    for (let i = 0; i < nh; i++) this.advances.push(d.getUint16(hmtx + 4 * i));
    if (this.tables.has('post')) {
      const post = this.t('post');
      this.italicAngle = d.getInt32(post + 4) / 65536;
      this.underlinePosition = d.getInt16(post + 8);
      this.underlineThickness = d.getInt16(post + 10);
    }
    if (this.tables.has('OS/2')) {
      const os2 = this.t('OS/2');
      this.strikeoutSize = d.getInt16(os2 + 26);
      this.strikeoutPosition = d.getInt16(os2 + 28);
    }
    this.readCmap();
    this.readNames();
  }

  t(tag: string): number {
    const e = this.tables.get(tag);
    if (!e) throw new Error('font has no ' + tag + ' table');
    return e.off;
  }

  readCmap() {
    const d = this.data;
    const co = this.t('cmap');
    const n = d.getUint16(co + 2);
    let best = -1, bestFmt = 0;
    for (let i = 0; i < n; i++) {
      const pid = d.getUint16(co + 4 + 8 * i), eid = d.getUint16(co + 6 + 8 * i), off = d.getUint32(co + 8 + 8 * i);
      const fmt = d.getUint16(co + off);
      if ((pid === 3 && (eid === 10 || eid === 1)) || pid === 0) {
        if (fmt === 12 && bestFmt !== 12) {
          best = co + off;
          bestFmt = 12;
        } else if (fmt === 4 && best < 0) {
          best = co + off;
          bestFmt = 4;
        }
      }
    }
    if (best < 0) return;
    if (bestFmt === 4) {
      const segX2 = d.getUint16(best + 6), seg = segX2 / 2;
      const ends = best + 14, starts = ends + segX2 + 2, deltas = starts + segX2, roffs = deltas + segX2;
      for (let s = 0; s < seg; s++) {
        const end = d.getUint16(ends + 2 * s), start = d.getUint16(starts + 2 * s);
        const delta = d.getInt16(deltas + 2 * s), roff = d.getUint16(roffs + 2 * s);
        for (let c = start; c <= end && c !== 0xffff; c++) {
          let g: number;
          if (roff === 0) g = (c + delta) & 0xffff;
          else {
            g = d.getUint16(roffs + 2 * s + roff + 2 * (c - start));
            if (g) g = (g + delta) & 0xffff;
          }
          if (g) this.cmap.set(c, g);
        }
      }
    } else {
      const groups = d.getUint32(best + 12);
      for (let i = 0; i < groups; i++) {
        const at = best + 16 + 12 * i;
        const s = d.getUint32(at), e = d.getUint32(at + 4), g0 = d.getUint32(at + 8);
        for (let c = s; c <= e; c++) this.cmap.set(c, g0 + (c - s));
      }
    }
  }

  readNames() {
    if (!this.tables.has('name')) return;
    const d = this.data;
    const no = this.t('name');
    const count = d.getUint16(no + 2), strings = no + d.getUint16(no + 4);
    const names = new Map<number, string>();
    for (let i = 0; i < count; i++) {
      const at = no + 6 + 12 * i;
      const pid = d.getUint16(at), eid = d.getUint16(at + 2), lang = d.getUint16(at + 4), id = d.getUint16(at + 6);
      const len = d.getUint16(at + 8), off = d.getUint16(at + 10);
      if (pid === 3 && (eid === 1 || eid === 0) && (lang === 0x409 || !names.has(id))) {
        let s = '';
        for (let j = 0; j < len; j += 2) s += String.fromCharCode(d.getUint16(strings + off + j));
        names.set(id, s);
      } else if (pid === 1 && eid === 0 && !names.has(id)) {
        let s = '';
        for (let j = 0; j < len; j++) s += String.fromCharCode(this.bytes[strings + off + j]);
        names.set(id, s);
      }
    }
    this.family = names.get(1) ?? '';
    this.subfamily = names.get(2) ?? '';
    this.fullName = names.get(4) ?? this.family;
  }

  /** A glyph's outline in font units (y up): contours of points with on-curve flags. */
  outline(g: number, depth = 0): { x: number; y: number; on: boolean }[][] {
    if (!this.tables.has('glyf') || depth > 8) return [];
    const d = this.data;
    const head = this.t('head');
    const longLoca = d.getInt16(head + 50) === 1;
    const loca = this.t('loca'), glyf = this.t('glyf');
    const off = longLoca ? d.getUint32(loca + 4 * g) : 2 * d.getUint16(loca + 2 * g);
    const next = longLoca ? d.getUint32(loca + 4 * g + 4) : 2 * d.getUint16(loca + 2 * g + 2);
    if (next <= off) return [];
    let p = glyf + off;
    const n = d.getInt16(p);
    p += 10;
    if (n >= 0) {
      const ends: number[] = [];
      for (let i = 0; i < n; i++, p += 2) ends.push(d.getUint16(p));
      const count = n ? ends[n - 1] + 1 : 0;
      p += 2 + d.getUint16(p);
      const flags: number[] = [];
      while (flags.length < count) {
        const f = this.bytes[p++];
        flags.push(f);
        if (f & 8) for (let r = this.bytes[p++]; r > 0; r--) flags.push(f);
      }
      const xs: number[] = [], ys: number[] = [];
      let v = 0;
      for (const f of flags) {
        if (f & 2) v += (f & 16 ? 1 : -1) * this.bytes[p++];
        else if (!(f & 16)) { v += d.getInt16(p); p += 2; }
        xs.push(v);
      }
      v = 0;
      for (const f of flags) {
        if (f & 4) v += (f & 32 ? 1 : -1) * this.bytes[p++];
        else if (!(f & 32)) { v += d.getInt16(p); p += 2; }
        ys.push(v);
      }
      const contours: { x: number; y: number; on: boolean }[][] = [];
      let s = 0;
      for (const e of ends) {
        const c: { x: number; y: number; on: boolean }[] = [];
        for (let i = s; i <= e; i++) c.push({ x: xs[i], y: ys[i], on: (flags[i] & 1) !== 0 });
        contours.push(c);
        s = e + 1;
      }
      return contours;
    }
    // a composite glyph
    const out: { x: number; y: number; on: boolean }[][] = [];
    for (;;) {
      const flags = d.getUint16(p), gi = d.getUint16(p + 2);
      p += 4;
      let dx: number, dy: number;
      if (flags & 1) { dx = d.getInt16(p); dy = d.getInt16(p + 2); p += 4; }
      else { dx = d.getInt8(p); dy = d.getInt8(p + 1); p += 2; }
      let a = 1, b = 0, c = 0, e = 1;
      if (flags & 8) { a = e = d.getInt16(p) / 16384; p += 2; }
      else if (flags & 0x40) { a = d.getInt16(p) / 16384; e = d.getInt16(p + 2) / 16384; p += 4; }
      else if (flags & 0x80) { a = d.getInt16(p) / 16384; b = d.getInt16(p + 2) / 16384; c = d.getInt16(p + 4) / 16384; e = d.getInt16(p + 6) / 16384; p += 8; }
      for (const contour of this.outline(gi, depth + 1)) {
        out.push(contour.map((q) => ({ x: a * q.x + c * q.y + dx, y: b * q.x + e * q.y + dy, on: q.on })));
      }
      if (!(flags & 0x20)) break;
    }
    return out;
  }

  /** A glyph's box in font units (y up), from its glyf header: [xMin, yMin, xMax, yMax], or null if empty. */
  glyphBox(g: number): [number, number, number, number] | null {
    if (!this.tables.has('glyf')) return null;
    const d = this.data;
    const longLoca = d.getInt16(this.t('head') + 50) === 1;
    const loca = this.t('loca'), glyf = this.t('glyf');
    const off = longLoca ? d.getUint32(loca + 4 * g) : 2 * d.getUint16(loca + 2 * g);
    const next = longLoca ? d.getUint32(loca + 4 * g + 4) : 2 * d.getUint16(loca + 2 * g + 2);
    if (next <= off) return null;
    const p = glyf + off;
    return [d.getInt16(p + 2), d.getInt16(p + 4), d.getInt16(p + 6), d.getInt16(p + 8)];
  }

  glyph(c: number): number {
    return this.cmap.get(c) ?? 0;
  }

  has(c: number): boolean {
    return this.cmap.has(c);
  }

  /** The advance of a character's glyph in font units. */
  advance(c: number): number {
    const g = this.glyph(c);
    return this.advances[Math.min(g, this.advances.length - 1)];
  }
}
