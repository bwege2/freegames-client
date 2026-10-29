// @ts-nocheck
// java.awt.font.TextLayout and LineBreakMeasurer for left-to-right text in one font (what FreeCol draws:
// the version label, golden titles, map labels, tooltips): advances and line metrics are Java2D's
// (fonts.ts), glyph bounds and outlines come from the font's own glyphs. The JDK's TextLayout shapes text
// with its native layout engine; for this text it places the glyphs at the same advances.
import { $J, JObject, defineLib, str, IllegalArgumentException, NullPointerException } from './lang.ts';
import { BreakIterator } from './text.ts';

const RH = () => $J.load('java.awt.RenderingHints');

function fontOf(attrs: any): any {
  const Font = $J.load('java.awt.Font');
  if (attrs == null) return $J.make('java.awt.Font', 'java.lang.String,int,int', 'Dialog', 0, 12);
  const TextAttribute = $J.load('java.awt.font.TextAttribute');
  const f = attrs.get(TextAttribute.FONT);
  if (f != null) return f;
  return Font[$J.m('java.awt.Font', 'getFont(java.util.Map)')](attrs);
}

export class TextLayout extends JObject {
  text: string;
  font: any;
  frc: any;
  attrs: any;
  constructor(a: any, b: any, c?: any) {
    super();
    if (typeof a === 'string') {
      if (a.length === 0) throw new IllegalArgumentException('Zero length string passed to TextLayout constructor.');
      this.text = a;
      const Font = $J.load('java.awt.Font');
      this.font = b instanceof Font ? b : fontOf(b);
      this.attrs = b instanceof Font ? null : b;
      this.frc = c;
    } else {
      // an AttributedCharacterIterator: its text in the font of its first run
      if (a == null) throw new NullPointerException('Null iterator passed to TextLayout constructor.');
      let s = '';
      for (let ch = a.first(); ch !== 0xffff; ch = a.next()) s += String.fromCharCode(ch);
      if (!s.length) throw new IllegalArgumentException('Zero length iterator passed to TextLayout constructor.');
      a.first();
      this.text = s;
      this.attrs = a.getAttributes();
      this.font = fontOf(this.attrs);
      this.frc = b;
    }
    if (this.frc == null) throw new IllegalArgumentException('Null font render context passed to TextLayout constructor.');
  }
  strike() {
    const f2d = this.font.getFont2D();
    return f2d.strike(this.font, this.frc.getAntiAliasingHint(), this.frc.getFractionalMetricsHint());
  }
  /** The pen positions of the glyphs (one per char), and the total advance. */
  pens(): { xs: number[]; adv: number } {
    const s = this.strike();
    const xs: number[] = [];
    let x = 0;
    for (let i = 0; i < this.text.length; i++) {
      xs.push(x);
      x = Math.fround(x + s.advance(this.text.charCodeAt(i)));
    }
    return { xs, adv: x };
  }
  getAdvance() {
    return this.pens().adv;
  }
  getVisibleAdvance() {
    const t = this.text.replace(/\s+$/, '');
    const s = this.strike();
    let x = 0;
    for (let i = 0; i < t.length; i++) x = Math.fround(x + s.advance(t.charCodeAt(i)));
    return x;
  }
  getAscent() {
    return this.strike().ascent;
  }
  getDescent() {
    return this.strike().descent;
  }
  getLeading() {
    return this.strike().leading;
  }
  getCharacterCount() {
    return this.text.length;
  }
  isLeftToRight() {
    return true;
  }
  isVertical() {
    return false;
  }
  getBaseline() {
    return 0;
  }
  getBaselineOffsets() {
    return [0, Math.fround((this.getDescent() / 2 - this.getAscent()) / 2), -this.getAscent()];
  }
  /** The glyphs' ink, as Java2D's TextLayout.getBounds (relative to the origin on the baseline). */
  getBounds() {
    const f2d = this.font.getFont2D(), ttf = f2d.ttf;
    const scale = this.font.getSize2D() / ttf.unitsPerEm;
    const { xs } = this.pens();
    let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
    for (let i = 0; i < this.text.length; i++) {
      const b = ttf.glyphBox(ttf.glyph(this.text.charCodeAt(i)));
      if (!b) continue;
      x0 = Math.min(x0, xs[i] + b[0] * scale);
      x1 = Math.max(x1, xs[i] + b[2] * scale);
      y0 = Math.min(y0, -b[3] * scale);
      y1 = Math.max(y1, -b[1] * scale);
    }
    if (x0 === Infinity) return $J.make('java.awt.geom.Rectangle2D$Float', 'float,float,float,float', 0, 0, 0, 0);
    return $J.make('java.awt.geom.Rectangle2D$Float', 'float,float,float,float', Math.fround(x0), Math.fround(y0), Math.fround(x1 - x0), Math.fround(y1 - y0));
  }
  getPixelBounds(_frc: any, x: number, y: number) {
    const b = this.getBounds();
    const X = Math.floor(b.getX() + x), Y = Math.floor(b.getY() + y);
    return $J.make('java.awt.Rectangle', 'int,int,int,int', X, Y, Math.ceil(b.getX() + x + b.getWidth()) - X, Math.ceil(b.getY() + y + b.getHeight()) - Y);
  }
  /** The glyphs' outlines as a shape (TextLayout.getOutline). */
  getOutline(at: any) {
    const f2d = this.font.getFont2D(), ttf = f2d.ttf;
    const scale = this.font.getSize2D() / ttf.unitsPerEm;
    const p = $J.make('java.awt.geom.GeneralPath', '');
    const M = $J.m('java.awt.geom.Path2D$Float', 'moveTo(double,double)');
    const L = $J.m('java.awt.geom.Path2D$Float', 'lineTo(double,double)');
    const Q = $J.m('java.awt.geom.Path2D$Float', 'quadTo(double,double,double,double)');
    const { xs } = this.pens();
    for (let i = 0; i < this.text.length; i++) {
      const ox = xs[i];
      for (const c of ttf.outline(ttf.glyph(this.text.charCodeAt(i)))) {
        if (!c.length) continue;
        const pt = (q: any) => [ox + q.x * scale, -q.y * scale];
        // start at an on-curve point (or the midpoint of the first two off-curve points)
        let start = c.findIndex((q: any) => q.on);
        let first: number[];
        if (start < 0) {
          const a = pt(c[0]), b = pt(c[1 % c.length]);
          first = [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
          start = 0;
        } else first = pt(c[start]);
        p[M](first[0], first[1]);
        let ctrl: number[] | null = null;
        for (let k = 1; k <= c.length; k++) {
          const q = c[(start + k) % c.length];
          const xy = pt(q);
          if (q.on) {
            if (ctrl) p[Q](ctrl[0], ctrl[1], xy[0], xy[1]);
            else p[L](xy[0], xy[1]);
            ctrl = null;
          } else {
            if (ctrl) {
              const mx = (ctrl[0] + xy[0]) / 2, my = (ctrl[1] + xy[1]) / 2;
              p[Q](ctrl[0], ctrl[1], mx, my);
            }
            ctrl = xy;
          }
        }
        if (ctrl) p[Q](ctrl[0], ctrl[1], first[0], first[1]);
        p.closePath();
      }
    }
    if (at != null) p.transform(at);
    return p;
  }
  draw(g: any, x: number, y: number) {
    if (g == null) throw new IllegalArgumentException('Null Graphics2D passed to TextLayout.draw()');
    if (typeof g.text === 'function') {
      // the port's graphics: the text at the layout's own advances
      const hints = g.hints;
      const old = [hints.get(RH().KEY_FRACTIONALMETRICS)];
      if (this.frc.usesFractionalMetrics()) hints.set(RH().KEY_FRACTIONALMETRICS, RH().VALUE_FRACTIONALMETRICS_ON);
      g.text(this.text, x, y, this.font);
      if (old[0] === undefined) hints.delete(RH().KEY_FRACTIONALMETRICS);
      else hints.set(RH().KEY_FRACTIONALMETRICS, old[0]);
      return;
    }
    const f = g.getFont();
    g.setFont(this.font);
    g[$J.m('java.awt.Graphics2D', 'drawString(java.lang.String,float,float)')](this.text, x, y);
    g.setFont(f);
  }
  getFont() {
    return this.font;
  }
  toString() {
    return 'TextLayout[' + str(this.text) + ']';
  }
}
defineLib(TextLayout, 'java.awt.font.TextLayout', { ifaces: ['java.lang.Cloneable'] });

/** java.awt.font.LineBreakMeasurer: lines of at most a width, broken where BreakIterator's line instance allows. */
export class LineBreakMeasurer extends JObject {
  text: string;
  begin: number;
  pos: number;
  attrs: any;
  frc: any;
  font: any;
  constructor(it: any, a: any, b?: any) {
    super();
    const frc = b ?? a;
    let s = '';
    this.begin = it.getBeginIndex();
    for (let ch = it.first(); ch !== 0xffff; ch = it.next()) s += String.fromCharCode(ch);
    it.first();
    this.text = s;
    this.attrs = it.getAttributes();
    this.font = fontOf(this.attrs);
    this.frc = frc;
    this.pos = this.begin;
  }
  getPosition() {
    return this.pos;
  }
  setPosition(p: number) {
    this.pos = p;
  }
  nextOffset(width: number, limit?: number, requireNextWord = false) {
    const start = this.pos - this.begin, end = (limit ?? this.begin + this.text.length) - this.begin;
    const f2d = this.font.getFont2D();
    const strike = f2d.strike(this.font, this.frc.getAntiAliasingHint(), this.frc.getFractionalMetricsHint());
    let x = 0, fit = start;
    for (let i = start; i < end; i++) {
      x = Math.fround(x + strike.advance(this.text.charCodeAt(i)));
      if (x > width && !/\s/.test(this.text[i])) break;
      fit = i + 1;
    }
    if (fit >= end) return this.begin + end;
    const bi = BreakIterator.getLineInstance();
    bi.setText(this.text);
    let br = bi.preceding(fit + 1 > end ? end : fit + 1);
    if (br <= start) {
      if (requireNextWord) return this.begin + start;
      br = Math.max(fit, start + 1);
    }
    return this.begin + br;
  }
  nextLayout(width: number, limit?: number, requireNextWord?: boolean) {
    if (this.pos >= this.begin + this.text.length) return null;
    const next = this.nextOffset(width, limit, requireNextWord);
    if (next === this.pos) return null;
    const s = this.text.substring(this.pos - this.begin, next - this.begin);
    this.pos = next;
    const l = new TextLayout(s, this.font, this.frc);
    l.attrs = this.attrs;
    return l;
  }
}
defineLib(LineBreakMeasurer, 'java.awt.font.LineBreakMeasurer');

/**
 * sun.font.StandardGlyphVector: the glyphs of a text in one font, unshaped (Swing asks it for a glyph's pixel
 * bounds: the left side bearing of LCD text, SwingUtilities2.LSBCacheEntry).
 */
export class StandardGlyphVector extends JObject {
  font: any;
  frc: any;
  glyphs: number[];
  chars: number[];
  constructor(font: any, text: any, frc: any) {
    super();
    this.font = font;
    this.frc = frc;
    const f2d = font.getFont2D();
    let codes: number[];
    if (typeof text === 'string') codes = Array.from(text, (c) => c.charCodeAt(0));
    else if (Array.isArray(text) && frc != null && text.$glyphCodes) codes = text;
    else if (Array.isArray(text)) codes = text.map((c: number) => c);
    else {
      codes = [];
      for (let c = text.first(); c !== 0xffff; c = text.next()) codes.push(c);
    }
    this.chars = codes;
    this.glyphs = codes.map((c) => f2d.charToGlyph(c));
  }
  scale() {
    return this.font.getSize2D() / this.font.getFont2D().ttf.unitsPerEm;
  }
  getFont() {
    return this.font;
  }
  getFontRenderContext() {
    return this.frc;
  }
  getNumGlyphs() {
    return this.glyphs.length;
  }
  getGlyphCode(i: number) {
    return this.glyphs[i];
  }
  getGlyphCodes(begin: number, n: number, out?: number[]) {
    const r = out ?? new Array(n);
    for (let i = 0; i < n; i++) r[i] = this.glyphs[begin + i];
    return r;
  }
  /** The pixels a glyph covers when drawn at (x, y): its outline's box at the font's size. */
  getGlyphPixelBounds(i: number, _frc: any, x: number, y: number) {
    const ttf = this.font.getFont2D().ttf;
    const s = this.scale();
    let px = x;
    for (let k = 0; k < i; k++) px += ttf.advance(this.chars[k]) * s;
    const box = ttf.glyphBox(this.glyphs[i]);
    if (!box) return $J.make('java.awt.Rectangle', 'int,int,int,int', 0, 0, 0, 0);
    const x0 = Math.floor(px + box[0] * s), y0 = Math.floor(y - box[3] * s);
    const x1 = Math.ceil(px + box[2] * s), y1 = Math.ceil(y - box[1] * s);
    return $J.make('java.awt.Rectangle', 'int,int,int,int', x0, y0, x1 - x0, y1 - y0);
  }
}
defineLib(StandardGlyphVector, 'sun.font.StandardGlyphVector');
