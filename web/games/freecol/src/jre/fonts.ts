// @ts-nocheck
// The native bottom of Java2D's fonts (sun.font): font files, their metrics, the font manager. The
// translated java.awt.Font asks for these. Java's logical fonts are the DejaVu fonts (as the oracle's client
// runs with them, re/freecol/oracle/run.sh); fonts the game makes from its own files (Font.createFont) are
// read here. Integer advances and metrics, as Swing lays out text with them, come from Java2D itself
// (javametrics.bin, made by re/freecol/oracle/FontTable.java: FreeType's hinted advances at small sizes
// cannot be computed from the font's tables); what the table does not have is computed from the font.
import { $J, JObject, defineLib, str, IOException, NullPointerException, IndexOutOfBoundsException } from './lang.ts';
import { vfs } from './io.ts';
import { TrueType } from './ttf.ts';

/* ------------------------------------------------------------------ files and the metrics table */

/** Where the font files are: logical font name -> files by style (plain, bold, italic, bold italic). */
export const fontFiles: any = {
  dir: '/fonts',
  logical: {
    dialog: ['DejaVuSans', 'DejaVuSans-Bold', 'DejaVuSans-Oblique', 'DejaVuSans-BoldOblique'],
    sansserif: ['DejaVuSans', 'DejaVuSans-Bold', 'DejaVuSans-Oblique', 'DejaVuSans-BoldOblique'],
    serif: ['DejaVuSerif', 'DejaVuSerif-Bold', 'DejaVuSerif-Italic', 'DejaVuSerif-BoldItalic'],
    monospaced: ['DejaVuSansMono', 'DejaVuSansMono-Bold', 'DejaVuSansMono-Oblique', 'DejaVuSansMono-BoldOblique'],
    dialoginput: ['DejaVuSansMono', 'DejaVuSansMono-Bold', 'DejaVuSansMono-Oblique', 'DejaVuSansMono-BoldOblique'],
  },
  /** The table's font index of each logical font, and of fonts the game creates, by family. */
  tableIndex: { dialog: 0, sansserif: 0, serif: 1, monospaced: 2, dialoginput: 2, shadowedblack: 3 } as Record<string, number>,
  /** Makes a font usable for drawing (the client's canvas layer registers it). */
  onLoad: (_name: string, _bytes: Uint8Array, _ttf: TrueType) => {},
};

const ttfCache = new Map<string, TrueType>();
function loadTTF(path: string): TrueType {
  let t = ttfCache.get(path);
  if (!t) {
    const bytes = vfs.read(path);
    if (!bytes) throw new IOException('no font file ' + path);
    t = new TrueType(bytes);
    ttfCache.set(path, t);
  }
  return t;
}

/** Java2D's integer text metrics (FontTable.java's format). */
class MetricsTable {
  fonts: number;
  styles: number;
  min: number;
  max: number;
  ranges: [number, number][] = [];
  perSize: number;
  chars = 0;
  d: DataView;
  start: number;
  constructor(bytes: Uint8Array) {
    const d = (this.d = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength));
    if (String.fromCharCode(bytes[0], bytes[1], bytes[2], bytes[3]) !== 'JFM1') throw new Error('not a metrics table');
    this.fonts = d.getUint16(4);
    this.styles = d.getUint16(6);
    this.min = d.getUint16(8);
    this.max = d.getUint16(10);
    const n = d.getUint16(12);
    let at = 14;
    for (let i = 0; i < n; i++, at += 4) {
      const r: [number, number] = [d.getUint16(at), d.getUint16(at + 2)];
      this.ranges.push(r);
      this.chars += r[1] - r[0] + 1;
    }
    this.start = at;
    this.perSize = 8 + 28 + this.chars;
  }
  entry(font: number, style: number, size: number): number {
    if (font < 0 || font >= this.fonts || size < this.min || size > this.max || size !== Math.floor(size)) return -1;
    return this.start + ((font * this.styles + style) * (this.max - this.min + 1) + (size - this.min)) * this.perSize;
  }
  ints(e: number) {
    const d = this.d;
    return { ascent: d.getInt16(e), descent: d.getInt16(e + 2), leading: d.getInt16(e + 4), maxAdvance: d.getInt16(e + 6) };
  }
  floats(e: number) {
    const d = this.d, f = (i: number) => d.getFloat32(e + 8 + 4 * i);
    return { ascent: f(0), descent: f(1), leading: f(2), strikeOffset: f(3), strikeThickness: f(4), underlineOffset: f(5), underlineThickness: f(6) };
  }
  /** The advance of c, or -1 if not in the table, 255 if Java cannot display it. */
  width(e: number, c: number): number {
    let i = 0;
    for (const [a, b] of this.ranges) {
      if (c >= a && c <= b) return this.d.getUint8(e + 36 + i + (c - a));
      i += b - a + 1;
    }
    return -1;
  }
}
let table: MetricsTable | null | undefined;
function metricsTable(): MetricsTable | null {
  if (table === undefined) {
    const b = vfs.read(fontFiles.dir + '/javametrics.bin');
    table = b ? new MetricsTable(b) : null;
  }
  return table;
}

/* ------------------------------------------------------------------ Font2D */

/** A font as Java2D knows it: a physical font file, or a logical font (Java's composite fonts). */
export class Font2D extends JObject {
  ttf: TrueType;
  familyName: string;
  fullName: string;
  style: number;
  tableFont: number;
  handle: any;
  constructor(ttf?: TrueType, family?: string, fullName?: string, style = 0, tableFont = -1) {
    super();
    this.ttf = ttf;
    this.familyName = family;
    this.fullName = fullName;
    this.style = style;
    this.tableFont = tableFont;
    this.handle = { font2D: this };
  }
  getFontName(_l?: any) {
    return this.fullName;
  }
  getFamilyName(_l?: any) {
    return this.familyName;
  }
  getStyle() {
    return this.style;
  }
  getPostscriptName() {
    return this.fullName.replace(/ /g, '');
  }
  canDisplay(c: number) {
    return this.ttf.has(c);
  }
  getNumGlyphs() {
    return this.ttf.advances.length;
  }
  getMissingGlyphCode() {
    return 0;
  }
  charToGlyph(c: number) {
    return this.ttf.glyph(c);
  }
  /** The metrics of a strike: a font (size, style) through a render context. */
  strike(font: any, aa: any, fm: any): Strike {
    return strikeOf(this, font, isOn(aa, 'ANTIALIAS'), isOn(fm, 'FRACTIONALMETRICS'));
  }
  /** metrics: ascent, descent, leading, maxAdvance, strikethrough offset and thickness, underline offset and thickness. */
  getFontMetrics(font: any, _at: any, aa: any, fm: any, metrics: number[]) {
    const s = this.strike(font, aa, fm);
    metrics[0] = s.ascent;
    metrics[1] = s.descent;
    metrics[2] = s.leading;
    metrics[3] = s.maxAdvance;
    metrics[4] = s.strikeOffset;
    metrics[5] = s.strikeThickness;
    metrics[6] = s.underlineOffset;
    metrics[7] = s.underlineThickness;
  }
  getItalicAngle(font: any, _at: any, _aa: any, _fm: any) {
    // the slope of the font's own italic angle (post table), negated as Java2D reports it
    const a = this.ttf.italicAngle;
    if (!a && (font.getStyle() & 2) && !(this.ttf.macStyle & 2)) return Math.fround(-0.2); // algorithmic italic
    return Math.fround(-Math.tan((a * Math.PI) / 180));
  }
}
defineLib(Font2D, 'sun.font.Font2D');

/** Java's logical fonts are composite fonts (one physical font here). */
export class CompositeFont extends Font2D {}
defineLib(CompositeFont, 'sun.font.CompositeFont');

/** Whether a render context's hint turns antialiasing or fractional metrics on. */
function isOn(hint: any, what: string): boolean {
  if (hint == null) return false;
  const RH = $J.load('java.awt.RenderingHints');
  if (what === 'FRACTIONALMETRICS') return hint === RH.VALUE_FRACTIONALMETRICS_ON;
  return hint !== RH.VALUE_TEXT_ANTIALIAS_OFF && hint !== RH.VALUE_TEXT_ANTIALIAS_DEFAULT;
}

/** A font at a size, through a render context: metrics and advances in pixels. */
export class Strike {
  ascent = 0;
  descent = 0;
  leading = 0;
  maxAdvance = 0;
  strikeOffset = 0;
  strikeThickness = 0;
  underlineOffset = 0;
  underlineThickness = 0;
  f2d: Font2D;
  size: number;
  frac: boolean;
  entry = -1;
  scale: number;
  bold: boolean;
  cache = new Map<number, number>();
  constructor(f2d: Font2D, size: number, style: number, aa: boolean, frac: boolean) {
    this.f2d = f2d;
    this.size = size;
    this.frac = frac;
    const t = f2d.ttf;
    this.scale = size / t.unitsPerEm;
    this.bold = (style & 1) !== 0 && !(t.macStyle & 1);
    const mt = metricsTable();
    if (mt && f2d.tableFont >= 0 && !frac) this.entry = mt.entry(f2d.tableFont, style, size);
    if (this.entry >= 0) {
      const fl = mt.floats(this.entry);
      this.ascent = fl.ascent;
      this.descent = fl.descent;
      this.leading = fl.leading;
      this.strikeOffset = fl.strikeOffset;
      this.strikeThickness = fl.strikeThickness;
      this.underlineOffset = fl.underlineOffset;
      this.underlineThickness = fl.underlineThickness;
      this.maxAdvance = mt.ints(this.entry).maxAdvance;
    } else {
      // FreeType's scaled metrics of the font (hhea), as Java2D's FreetypeFontScaler reports them
      const s = this.scale;
      this.ascent = Math.fround(t.ascender * s);
      this.descent = Math.fround(-t.descender * s);
      this.leading = Math.fround(t.lineGap * s);
      this.maxAdvance = Math.fround(t.maxAdvance * s);
      this.strikeOffset = Math.fround(-t.strikeoutPosition * s);
      this.strikeThickness = Math.fround(t.strikeoutSize * s);
      this.underlineOffset = Math.fround(-t.underlinePosition * s);
      this.underlineThickness = Math.fround(t.underlineThickness * s);
    }
    void aa;
  }
  /** The advance of a code point, in pixels. */
  advance(c: number): number {
    let w = this.cache.get(c);
    if (w !== undefined) return w;
    if (this.entry >= 0) {
      const tw = metricsTable().width(this.entry, c);
      if (tw >= 0 && tw !== 255) w = tw;
    }
    if (w === undefined) {
      const lin = this.f2d.ttf.advance(c) * this.scale + (this.bold ? this.size / 24 : 0);
      w = this.frac ? Math.fround(lin) : Math.round(lin);
    }
    this.cache.set(c, w);
    return w;
  }
}

const strikes = new Map<string, Strike>();
function strikeOf(f2d: Font2D, font: any, aa: boolean, frac: boolean): Strike {
  const size = font.getSize2D();
  const style = font.getStyle();
  const key = f2d.fullName + '|' + style + '|' + size + '|' + aa + '|' + frac;
  let s = strikes.get(key);
  if (!s) strikes.set(key, (s = new Strike(f2d, size, style, aa, frac)));
  return s;
}

/* ------------------------------------------------------------------ the font manager */

class WebFontManager extends JObject {
  logical = new Map<string, Font2D>();
  created: Font2D[] = [];
  byName = new Map<string, Font2D>();
  /** A Font2D by family or font name and style; fallback 2: the default font (Dialog). */
  findFont2D(name: string, style: number, fallback: number): Font2D {
    const n = name.toLowerCase();
    const files = fontFiles.logical[n];
    if (files) {
      const key = n + ':' + style;
      let f = this.logical.get(key);
      if (!f) {
        const ttf = loadTTF(fontFiles.dir + '/' + files[style & 3] + '.ttf');
        const fam = { dialog: 'Dialog', sansserif: 'SansSerif', serif: 'Serif', monospaced: 'Monospaced', dialoginput: 'DialogInput' }[n];
        const styleName = ['plain', 'bold', 'italic', 'bolditalic'][style & 3];
        f = new CompositeFont(ttf, fam, fam + '.' + styleName, style & 3, fontFiles.tableIndex[n] ?? -1);
        fontFiles.onLoad(files[style & 3], ttf.bytes, ttf);
        this.logical.set(key, f);
      }
      return f;
    }
    const c = this.byName.get(n);
    if (c) return c;
    if (fallback === 0) return null;
    return this.findFont2D('dialog', style, 0);
  }
  /** Font.createFont: the fonts of a file the game supplies. */
  createFont2D(file: any, _format: number, _all: boolean, _isCopy: boolean, _tracker: any): Font2D[] {
    const bytes = vfs.read(file.getAbsolutePath ? file.getAbsolutePath() : str(file));
    if (!bytes) throw new IOException('Problem reading font data.');
    const ttf = new TrueType(bytes);
    const f = new Font2D(ttf, ttf.family, ttf.fullName, 0, fontFiles.tableIndex[ttf.family.toLowerCase()] ?? -1);
    fontFiles.onLoad(ttf.fullName, bytes, ttf);
    this.created.push(f);
    return [f];
  }
  /** GraphicsEnvironment.registerFont. */
  registerFont(font: any): boolean {
    const f2d = font.getFont2D();
    const k = f2d.getFamilyName(null).toLowerCase();
    if (this.byName.has(k)) return false;
    this.byName.set(k, f2d);
    this.byName.set(f2d.getFontName(null).toLowerCase(), f2d);
    return true;
  }
  usingAlternateCompositeFonts() {
    return false;
  }
  getFamilyNames(): string[] {
    return ['DejaVu Sans', 'DejaVu Sans Mono', 'DejaVu Serif', 'Dialog', 'DialogInput', 'Monospaced', 'SansSerif', 'Serif',
      ...[...this.byName.values()].map((f) => f.getFamilyName(null))].sort();
  }
}
const manager = new WebFontManager();

export const FontManagerFactory: any = { getInstance: () => manager };
defineLib(FontManagerFactory, 'sun.font.FontManagerFactory');
export const SunFontManager: any = { getInstance: () => manager };
defineLib(SunFontManager, 'sun.font.SunFontManager');

export const FontUtilities: any = {
  MIN_LAYOUT_CHARCODE: 0x300,
  MAX_LAYOUT_CHARCODE: 0x206f,
  isLogging: () => false,
  getFont2D: (font: any) => font.getFont2D(),
  fontSupportsDefaultEncoding: (_font: any) => true,
  getCompositeFontUIResource: (font: any) => $J.make('javax.swing.plaf.FontUIResource', 'java.awt.Font', font),
  isComplexCharCode(code: number) {
    if (code < 0x300 || code > 0x206f) return false;
    if (code <= 0x36f) return true;
    if (code < 0x590) return false;
    if (code <= 0x6ff) return true;
    if (code < 0x900) return false;
    if (code <= 0xe7f) return true;
    if (code < 0xf00) return false;
    if (code <= 0xfff) return true;
    if (code < 0x10a0) return true;
    if (code < 0x1100) return false;
    if (code < 0x11ff) return true;
    if (code < 0x1780) return false;
    if (code <= 0x17ff) return true;
    if (code < 0x200c) return false;
    if (code <= 0x200d) return true;
    if (code >= 0x202a && code <= 0x202e) return true;
    if (code >= 0x206a && code <= 0x206f) return true;
    return false;
  },
  isNonSimpleChar(ch: number) {
    return FontUtilities.isComplexCharCode(ch) || (ch >= 0xd800 && ch <= 0xdfff);
  },
  isComplexText(chs: number[], start: number, limit: number) {
    for (let i = start; i < limit; i++) {
      if (chs[i] < 0x300) continue;
      if (FontUtilities.isNonSimpleChar(chs[i])) return true;
    }
    return false;
  },
};
defineLib(FontUtilities, 'sun.font.FontUtilities');

/** sun.font.FontAccess: java.awt.Font's package back door. */
export class FontAccess extends JObject {
  static access: any = null;
  static getFontAccess() {
    return FontAccess.access;
  }
  static setFontAccess(a: any) {
    FontAccess.access = a;
  }
  _FontAccess() {
    return this;
  }
}
defineLib(FontAccess, 'sun.font.FontAccess');

const tracker = {
  acquirePermit: () => true,
  releasePermit() {},
  add() {},
  set() {},
  remove() {},
  addBytes() {},
  subBytes() {},
  getNumBytes: () => 0,
};
export const CreatedFontTracker: any = { getTracker: () => tracker, MAX_FILE_SIZE: 33554432, MAX_TOTAL_BYTES: 335544320 };
defineLib(CreatedFontTracker, 'sun.font.CreatedFontTracker');

/* ------------------------------------------------------------------ line metrics */

export class CoreMetrics extends JObject {
  ascent: number;
  descent: number;
  leading: number;
  height: number;
  baselineIndex: number;
  baselineOffsets: number[];
  strikethroughOffset: number;
  strikethroughThickness: number;
  underlineOffset: number;
  underlineThickness: number;
  ssOffset: number;
  italicAngle: number;
  constructor(ascent: number, descent: number, leading: number, height: number, baselineIndex: number, baselineOffsets: number[],
    strikethroughOffset: number, strikethroughThickness: number, underlineOffset: number, underlineThickness: number,
    ssOffset: number, italicAngle: number) {
    super();
    Object.assign(this, { ascent, descent, leading, height, baselineIndex, baselineOffsets, strikethroughOffset,
      strikethroughThickness, underlineOffset, underlineThickness, ssOffset, italicAngle });
  }
  static get(lm: any) {
    return lm.cm;
  }
  equals(o: any) {
    return o instanceof CoreMetrics && o.ascent === this.ascent && o.descent === this.descent && o.leading === this.leading
      && o.baselineIndex === this.baselineIndex && o.italicAngle === this.italicAngle;
  }
  hashCode() {
    return $J.hashCode(Math.fround(this.ascent + this.ssOffset));
  }
  effectiveBaselineOffset(fullOffsets: number[]) {
    switch (this.baselineIndex) {
    case -1: return Math.fround(fullOffsets[4] + this.ascent);
    case -2: return Math.fround(fullOffsets[3] - this.descent);
    default: return Math.fround(fullOffsets[this.baselineIndex]);
    }
  }
}
defineLib(CoreMetrics, 'sun.font.CoreMetrics');

/** sun.font.FontLineMetrics: java.awt.font.LineMetrics of a run of characters. */
export class FontLineMetrics extends JObject {
  numchars: number;
  cm: CoreMetrics;
  frc: any;
  constructor(numchars: number, cm: CoreMetrics, frc: any) {
    super();
    this.numchars = numchars;
    this.cm = cm;
    this.frc = frc;
  }
  getNumChars() { return this.numchars; }
  getAscent() { return this.cm.ascent; }
  getDescent() { return this.cm.descent; }
  getLeading() { return this.cm.leading; }
  getHeight() { return this.cm.height; }
  getBaselineIndex() { return this.cm.baselineIndex; }
  getBaselineOffsets() { return this.cm.baselineOffsets.slice(); }
  getStrikethroughOffset() { return this.cm.strikethroughOffset; }
  getStrikethroughThickness() { return this.cm.strikethroughThickness; }
  getUnderlineOffset() { return this.cm.underlineOffset; }
  getUnderlineThickness() { return this.cm.underlineThickness; }
  clone() {
    const c = new FontLineMetrics(this.numchars, this.cm, this.frc);
    return c;
  }
  equals(o: any) {
    return o instanceof FontLineMetrics && o.numchars === this.numchars && this.cm.equals(o.cm);
  }
}
defineLib(FontLineMetrics, 'sun.font.FontLineMetrics', { sup: 'java.awt.font.LineMetrics' });

/* ------------------------------------------------------------------ FontDesignMetrics */

let FDM: any = null;
/** sun.font.FontDesignMetrics, a java.awt.FontMetrics: made when first asked for (it extends a translated class). */
function fdmClass() {
  if (FDM) return FDM;
  const FontMetrics = $J.load('java.awt.FontMetrics');
  const ctorFM = FontMetrics.$meta.ctors['java.awt.Font'];
  FDM = class FontDesignMetrics extends FontMetrics {
    frc: any;
    s: Strike;
    heightCache = -1;
    $init(font: any, frc: any) {
      this[ctorFM](font);
      this.frc = frc;
      this.s = font.getFont2D().strike(font, frc.getAntiAliasingHint(), frc.getFractionalMetricsHint());
      return this;
    }
    getFontRenderContext() {
      return this.frc;
    }
    charWidth(ch: any) {
      const c = typeof ch === 'string' ? ch.charCodeAt(0) : ch;
      return Math.trunc(0.5 + this.s.advance(c));
    }
    stringWidth(s: string) {
      if (s == null) throw new NullPointerException('str is null');
      let w = 0;
      for (let i = 0; i < s.length; i++) w = Math.fround(w + this.s.advance(s.charCodeAt(i)));
      return Math.trunc(0.5 + w);
    }
    charsWidth(data: number[], off: number, len: number) {
      if (len < 0) throw new IndexOutOfBoundsException('len=' + len);
      let w = 0;
      for (let i = off; i < off + len; i++) w = Math.fround(w + this.s.advance(data[i]));
      return Math.trunc(0.5 + w);
    }
    getSimpleBounds(data: number[], off: number, len: number) {
      let w = 0;
      for (let i = off; i < off + len; i++) w = Math.fround(w + this.s.advance(data[i]));
      const h = Math.fround(Math.fround(this.s.ascent + this.s.descent) + this.s.leading);
      return $J.make('java.awt.geom.Rectangle2D$Float', 'float,float,float,float', 0, -this.s.ascent, w, h);
    }
    getWidths() {
      const r: number[] = [];
      for (let c = 0; c < 256; c++) r.push(Math.trunc(0.5 + this.s.advance(c)));
      return r;
    }
    getMaxAdvance() {
      return Math.trunc(Math.fround(0.99 + this.s.maxAdvance));
    }
    getAscent() {
      return Math.trunc(Math.fround(0.95 + this.s.ascent));
    }
    getDescent() {
      return Math.trunc(Math.fround(0.95 + this.s.descent));
    }
    getLeading() {
      return Math.trunc(Math.fround(0.95 + this.s.descent + this.s.leading)) - Math.trunc(Math.fround(0.95 + this.s.descent));
    }
    getHeight() {
      if (this.heightCache < 0) this.heightCache = this.getAscent() + Math.trunc(Math.fround(0.95 + this.s.descent + this.s.leading));
      return this.heightCache;
    }
  };
  $J.adoptOverloads(FDM);
  $J.define(FDM, 'sun.font.FontDesignMetrics', { kind: 'class', sup: 'java.awt.FontMetrics' });
  return FDM;
}

const metricsCache = new Map<string, any>();
let defaultFrc: any = null;
export const FontDesignMetrics: any = {
  getMetrics(font: any, frc?: any) {
    if (frc == null) {
      defaultFrc ??= $J.make('java.awt.font.FontRenderContext', 'java.awt.geom.AffineTransform,boolean,boolean', null, false, false);
      frc = defaultFrc;
    }
    const key = font.hashCode() + '|' + str(font) + '|' + frc.isAntiAliased() + '|' + frc.usesFractionalMetrics();
    let m = metricsCache.get(key);
    if (!m) metricsCache.set(key, (m = new (fdmClass())().$init(font, frc)));
    return m;
  },
};
defineLib(FontDesignMetrics, 'sun.font.FontDesignMetrics.$factory');
