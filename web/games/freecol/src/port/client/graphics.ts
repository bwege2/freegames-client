// java.awt.Graphics2D on an HTML canvas: what Java2D's SunGraphics2D and its pipelines do natively. The
// state (transform, clip, colour, paint, stroke, composite, font, hints) is Java's and kept here; each
// drawing operation sets it on the canvas context and draws. Coordinates follow Java2D's rules for
// non-antialiased drawing: shapes cover pixel centres (lines and outlines are drawn half a pixel in).
// Text is placed glyph by glyph at Java's advances (src/jre/fonts.ts), so it lines up with Swing's layout.
import { $J } from '../../jre/index.ts';
import { lateClass } from '../../jre/screen.ts';
import { BufferedImage } from '../../jre/image.ts';

/** A drawing target: an image, or the screen at a window's position. */
export type Target = {
  surface: () => { canvas: any; ctx: any } | null;
  drawn: () => void;
  /** The device origin and bounds of the target (a window's place on the screen). */
  ox: number;
  oy: number;
  w: number;
  h: number;
  image?: any;
};

export function imageTarget(img: any): Target {
  return {
    surface: () => img.surface(),
    drawn: () => img.$drawn(),
    ox: img.parent ? img.ox : 0,
    oy: img.parent ? img.oy : 0,
    w: img.w,
    h: img.h,
    image: img,
  };
}

/** A canvas font for a Java font (its file registered as a family of its own: fonts.ts onLoad). */
export function cssFont(font: any): string {
  const f2d = font.getFont2D();
  const fam = fontFamilyOf(f2d);
  const style = font.getStyle();
  const synthBold = (style & 1) && !(f2d.ttf.macStyle & 1);
  const synthItalic = (style & 2) && !(f2d.ttf.macStyle & 2);
  return (synthItalic ? 'italic ' : '') + (synthBold ? 'bold ' : '') + font.getSize2D() + 'px "' + fam + '"';
}

export const fontFamilies = new Map<any, string>();
function fontFamilyOf(f2d: any): string {
  return fontFamilies.get(f2d.ttf) ?? f2d.familyName;
}

function css(argb: number): string {
  const a = (argb >>> 24) / 255;
  return 'rgba(' + ((argb >> 16) & 255) + ',' + ((argb >> 8) & 255) + ',' + (argb & 255) + ',' + a + ')';
}

type Mat = [number, number, number, number, number, number];
const ID: Mat = [1, 0, 0, 1, 0, 0];
function mul(a: Mat, b: Mat): Mat {
  return [a[0] * b[0] + a[2] * b[1], a[1] * b[0] + a[3] * b[1], a[0] * b[2] + a[2] * b[3], a[1] * b[2] + a[3] * b[3],
    a[0] * b[4] + a[2] * b[5] + a[4], a[1] * b[4] + a[3] * b[5] + a[5]];
}
function inv(m: Mat): Mat {
  const det = m[0] * m[3] - m[1] * m[2];
  return [m[3] / det, -m[1] / det, -m[2] / det, m[0] / det, (m[2] * m[5] - m[3] * m[4]) / det, (m[1] * m[4] - m[0] * m[5]) / det];
}

/** A clip in device space: a list of paths whose intersection is the clip, and its bounds. */
type Clip = { paths: Path2D[]; bounds: [number, number, number, number] } | null;

/** Path2D, or (in node, without canvases) a stand-in that records nothing. */
const Path2D: any = (globalThis as any).Path2D ?? class {
  rect() {}
  moveTo() {}
  lineTo() {}
  quadraticCurveTo() {}
  bezierCurveTo() {}
  closePath() {}
  ellipse() {}
};
type Path2D = any;

function rectPath(x: number, y: number, w: number, h: number): Path2D {
  const p = new Path2D();
  p.rect(x, y, w, h);
  return p;
}

/** The java.awt.Graphics2D class of the client, made when first used (it extends translated classes). */
export const graphicsClass = lateClass(() => {
  const Graphics2D = $J.load('java.awt.Graphics2D');
  const RH = $J.load('java.awt.RenderingHints');
  const AlphaComposite = $J.load('java.awt.AlphaComposite');
  const Color = $J.load('java.awt.Color');
  const m = (sig: string) => $J.m('java.awt.Graphics2D', sig);

  class WebGraphics extends Graphics2D {
    t!: Target;
    tx: Mat = ID;
    clipDev: Clip = null;
    color: any;
    paint: any;
    bg: any;
    font: any;
    stroke: any;
    composite: any;
    hints = new Map<any, any>();
    xor: any = null;
    disposed = false;

    $init(t: Target, font: any, fg: any, bg: any) {
      this[Graphics2D.$meta.ctors['']]();
      this.t = t;
      this.tx = [1, 0, 0, 1, t.ox, t.oy];
      this.clipDev = t.ox || t.oy || t.image?.parent ? { paths: [rectPath(t.ox, t.oy, t.w, t.h)], bounds: [t.ox, t.oy, t.w, t.h] } : null;
      this.color = fg ?? Color.WHITE;
      this.paint = this.color;
      this.bg = bg ?? Color.BLACK;
      this.font = font ?? $J.make('java.awt.Font', 'java.lang.String,int,int', 'Dialog', 0, 12);
      this.stroke = $J.make('java.awt.BasicStroke', '');
      this.composite = AlphaComposite.SrcOver;
      return this;
    }

    // ---- state

    create(x?: number, y?: number, w?: number, h?: number) {
      const g = new WebGraphics();
      g[Graphics2D.$meta.ctors['']]();
      g.t = this.t;
      g.tx = this.tx.slice() as Mat;
      g.clipDev = this.clipDev ? { paths: this.clipDev.paths.slice(), bounds: this.clipDev.bounds.slice() as any } : null;
      g.color = this.color;
      g.paint = this.paint;
      g.bg = this.bg;
      g.font = this.font;
      g.stroke = this.stroke;
      g.composite = this.composite;
      g.hints = new Map(this.hints);
      g.xor = this.xor;
      if (x !== undefined) {
        g.translate(x, y!);
        g.clipRect(0, 0, w!, h!);
      }
      return g;
    }
    dispose() {
      this.disposed = true;
    }
    getColor() {
      return this.color;
    }
    setColor(c: any) {
      if (c == null) return;
      this.color = c;
      this.paint = c;
    }
    setPaint(p: any) {
      if (p == null) return;
      this.paint = p;
      if (p instanceof Color) this.color = p;
    }
    getPaint() {
      return this.paint;
    }
    getBackground() {
      return this.bg;
    }
    setBackground(c: any) {
      this.bg = c;
    }
    getFont() {
      return this.font;
    }
    setFont(f: any) {
      if (f != null) this.font = f;
    }
    getStroke() {
      return this.stroke;
    }
    setStroke(s: any) {
      if (s == null) throw new ($J.load('java.lang.IllegalArgumentException') as any)('null Stroke');
      this.stroke = s;
    }
    getComposite() {
      return this.composite;
    }
    setComposite(c: any) {
      if (c == null) throw new ($J.load('java.lang.IllegalArgumentException') as any)('null Composite');
      this.composite = c;
    }
    setPaintMode() {
      this.xor = null;
    }
    setXORMode(c: any) {
      this.xor = c;
    }
    setRenderingHint(k: any, v: any) {
      this.hints.set(k, v);
    }
    getRenderingHint(k: any) {
      return this.hints.get(k) ?? null;
    }
    setRenderingHints(map: any) {
      this.hints.clear();
      this.addRenderingHints(map);
    }
    addRenderingHints(map: any) {
      for (const e of map.entrySet()) this.hints.set(e.getKey(), e.getValue());
    }
    getRenderingHints() {
      const r = $J.make('java.awt.RenderingHints', 'java.util.Map', null);
      for (const [k, v] of this.hints) r.put(k, v);
      return r;
    }
    aa(): boolean {
      return this.hints.get(RH.KEY_ANTIALIASING) === RH.VALUE_ANTIALIAS_ON;
    }
    getFontRenderContext() {
      const aa = this.hints.get(RH.KEY_TEXT_ANTIALIASING) ?? RH.VALUE_TEXT_ANTIALIAS_DEFAULT;
      const fm = this.hints.get(RH.KEY_FRACTIONALMETRICS) ?? RH.VALUE_FRACTIONALMETRICS_DEFAULT;
      const tx = $J.make('java.awt.geom.AffineTransform', 'double,double,double,double,double,double', this.tx[0], this.tx[1], this.tx[2], this.tx[3], 0, 0);
      return $J.make('java.awt.font.FontRenderContext', 'java.awt.geom.AffineTransform,java.lang.Object,java.lang.Object', tx, aa, fm);
    }
    getFontMetrics(f?: any) {
      return $J.load('sun.font.FontDesignMetrics.$factory').getMetrics(f ?? this.font, this.getFontRenderContext());
    }
    getDeviceConfiguration() {
      return $J.load('java.awt.GraphicsEnvironment').getLocalGraphicsEnvironment().getDefaultScreenDevice().getDefaultConfiguration();
    }

    // ---- transform

    translate(x: number, y: number) {
      this.tx = mul(this.tx, [1, 0, 0, 1, x, y]);
    }
    scale(sx: number, sy: number) {
      this.tx = mul(this.tx, [sx, 0, 0, sy, 0, 0]);
    }
    rotate(th: number, x?: number, y?: number) {
      if (x !== undefined) this.translate(x, y!);
      const c = Math.cos(th), s = Math.sin(th);
      this.tx = mul(this.tx, [c, s, -s, c, 0, 0]);
      if (x !== undefined) this.translate(-x, -y!);
    }
    shear(shx: number, shy: number) {
      this.tx = mul(this.tx, [1, shy, shx, 1, 0, 0]);
    }
    transform(at: any) {
      this.tx = mul(this.tx, [at.getScaleX(), at.getShearY(), at.getShearX(), at.getScaleY(), at.getTranslateX(), at.getTranslateY()]);
    }
    setTransform(at: any) {
      // Java's transforms are relative to the device's default transform (the window's origin)
      this.tx = mul([1, 0, 0, 1, this.t.ox, this.t.oy], [at.getScaleX(), at.getShearY(), at.getShearX(), at.getScaleY(), at.getTranslateX(), at.getTranslateY()]);
    }
    getTransform() {
      const t = mul([1, 0, 0, 1, -this.t.ox, -this.t.oy], this.tx);
      return $J.make('java.awt.geom.AffineTransform', 'double,double,double,double,double,double', t[0], t[1], t[2], t[3], t[4], t[5]);
    }

    // ---- clip

    devRect(x: number, y: number, w: number, h: number): [number, number, number, number] {
      const t = this.tx;
      if (t[1] === 0 && t[2] === 0) {
        let x0 = t[0] * x + t[4], y0 = t[3] * y + t[5], x1 = t[0] * (x + w) + t[4], y1 = t[3] * (y + h) + t[5];
        if (x1 < x0) [x0, x1] = [x1, x0];
        if (y1 < y0) [y0, y1] = [y1, y0];
        return [x0, y0, x1 - x0, y1 - y0];
      }
      const pts = [[x, y], [x + w, y], [x, y + h], [x + w, y + h]].map(([px, py]) => [t[0] * px + t[2] * py + t[4], t[1] * px + t[3] * py + t[5]]);
      const xs = pts.map((p) => p[0]), ys = pts.map((p) => p[1]);
      return [Math.min(...xs), Math.min(...ys), Math.max(...xs) - Math.min(...xs), Math.max(...ys) - Math.min(...ys)];
    }
    shapePathDev(s: any): { path: Path2D; even: boolean; bounds: [number, number, number, number] } {
      // a shape in device space (the current transform applied)
      const t = this.tx;
      const p = new Path2D();
      const it = (s.getPathIterator$AffineTransform ?? s.getPathIterator).call(s, null);
      const c = new Array(6).fill(0);
      let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
      const P = (i: number) => {
        const x = t[0] * c[i] + t[2] * c[i + 1] + t[4], y = t[1] * c[i] + t[3] * c[i + 1] + t[5];
        minX = Math.min(minX, x); minY = Math.min(minY, y); maxX = Math.max(maxX, x); maxY = Math.max(maxY, y);
        return [x, y];
      };
      const seg = $J.m('java.awt.geom.PathIterator', 'currentSegment(double[])');
      while (!it.isDone()) {
        const type = it[seg](c);
        if (type === 0) p.moveTo(...(P(0) as [number, number]));
        else if (type === 1) p.lineTo(...(P(0) as [number, number]));
        else if (type === 2) p.quadraticCurveTo(...(P(0) as [number, number]), ...(P(2) as [number, number]));
        else if (type === 3) p.bezierCurveTo(...(P(0) as [number, number]), ...(P(2) as [number, number]), ...(P(4) as [number, number]));
        else p.closePath();
        (it.next$ ?? it.next).call(it);
      }
      return { path: p, even: it.getWindingRule() === 0, bounds: [minX, minY, maxX - minX, maxY - minY] };
    }
    addClip(path: Path2D, b: [number, number, number, number]) {
      if (!this.clipDev) {
        this.clipDev = { paths: [path], bounds: b };
        return;
      }
      const [x0, y0, w0, h0] = this.clipDev.bounds;
      const x = Math.max(x0, b[0]), y = Math.max(y0, b[1]);
      const x1 = Math.min(x0 + w0, b[0] + b[2]), y1 = Math.min(y0 + h0, b[1] + b[3]);
      this.clipDev = { paths: [...this.clipDev.paths, path], bounds: [x, y, Math.max(0, x1 - x), Math.max(0, y1 - y)] };
    }
    clipRect(x: number, y: number, w: number, h: number) {
      const r = this.devRect(x, y, w, h);
      this.addClip(rectPath(...r), r);
    }
    clip(s: any) {
      if (s == null) {
        this.clipDev = null;
        return;
      }
      const d = this.shapePathDev(s);
      this.addClip(d.path, d.bounds);
    }
    setClip(a: any, y?: number, w?: number, h?: number) {
      this.clipDev = this.t.ox || this.t.oy || this.t.image?.parent
        ? { paths: [rectPath(this.t.ox, this.t.oy, this.t.w, this.t.h)], bounds: [this.t.ox, this.t.oy, this.t.w, this.t.h] } : null;
      if (y !== undefined) this.clipRect(a, y, w!, h!);
      else if (a != null) this.clip(a);
    }
    getClip() {
      const r = this.getClipBounds$();
      return r;
    }
    getClipBounds$() {
      if (!this.clipDev) return null;
      const [x, y, w, h] = this.clipDev.bounds;
      const it = inv(this.tx);
      // back to user space (exact for translations and scales)
      const x0 = it[0] * x + it[2] * y + it[4], y0 = it[1] * x + it[3] * y + it[5];
      const x1 = it[0] * (x + w) + it[2] * (y + h) + it[4], y1 = it[1] * (x + w) + it[3] * (y + h) + it[5];
      const X = Math.floor(Math.min(x0, x1)), Y = Math.floor(Math.min(y0, y1));
      return $J.make('java.awt.Rectangle', 'int,int,int,int', X, Y, Math.ceil(Math.max(x0, x1)) - X, Math.ceil(Math.max(y0, y1)) - Y);
    }
    getClipBounds$Rectangle(r: any) {
      const c = this.getClipBounds$();
      if (c != null) r[$J.m("java.awt.Rectangle", "setBounds(int,int,int,int)")](c.getX(), c.getY(), c.getWidth(), c.getHeight());
      return r;
    }

    // ---- drawing

    /** Sets the context up for one operation; returns it, or null if nothing to draw on. */
    begin(): any {
      if (this.clipDev && (this.clipDev.bounds[2] <= 0 || this.clipDev.bounds[3] <= 0)) return null;
      const s = this.t.surface();
      if (!s) return null;
      const ctx = s.ctx;
      ctx.save();
      // image targets of a parent (subimages) draw at their place in the parent
      if (this.clipDev) {
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        for (const p of this.clipDev.paths) ctx.clip(p);
      }
      const t = this.tx;
      ctx.setTransform(t[0], t[1], t[2], t[3], t[4], t[5]);
      this.applyComposite(ctx);
      return ctx;
    }
    end(ctx: any) {
      ctx.restore();
      this.t.drawn();
    }
    applyComposite(ctx: any) {
      const c = this.composite;
      if (this.xor) {
        ctx.globalCompositeOperation = 'difference';
        return;
      }
      if (c instanceof AlphaComposite) {
        ctx.globalAlpha = c.getAlpha();
        switch (c.getRule()) {
        case 1: ctx.globalCompositeOperation = 'destination-out'; ctx.globalAlpha = 1; break; // CLEAR
        case 2: ctx.globalCompositeOperation = 'copy'; break; // SRC
        case 3: ctx.globalCompositeOperation = 'source-over'; break; // SRC_OVER
        case 4: ctx.globalCompositeOperation = 'destination-over'; break; // DST_OVER
        case 5: ctx.globalCompositeOperation = 'source-in'; break; // SRC_IN
        case 6: ctx.globalCompositeOperation = 'destination-in'; break; // DST_IN
        case 7: ctx.globalCompositeOperation = 'source-out'; break; // SRC_OUT
        case 8: ctx.globalCompositeOperation = 'destination-out'; break; // DST_OUT
        case 9: ctx.globalCompositeOperation = 'destination'; break; // DST
        case 10: ctx.globalCompositeOperation = 'source-atop'; break; // SRC_ATOP
        case 11: ctx.globalCompositeOperation = 'destination-atop'; break; // DST_ATOP
        case 12: ctx.globalCompositeOperation = 'xor'; break; // XOR
        }
      }
    }
    style(ctx: any): any {
      const p = this.paint;
      if (p instanceof Color) return css(p.getRGB());
      const GradientPaint = $J.load('java.awt.GradientPaint');
      if (p instanceof GradientPaint) {
        const a = p.getPoint1(), b = p.getPoint2();
        const g = ctx.createLinearGradient(a.getX(), a.getY(), b.getX(), b.getY());
        g.addColorStop(0, css(p.getColor1().getRGB()));
        g.addColorStop(1, css(p.getColor2().getRGB()));
        return g;
      }
      const TexturePaint = $J.load('java.awt.TexturePaint');
      if (p instanceof TexturePaint) {
        const img = p.getImage();
        const s = img.surface();
        if (!s) return css(this.color.getRGB());
        const pat = ctx.createPattern(s.canvas, 'repeat');
        const r = p.getAnchorRect();
        if (pat.setTransform) pat.setTransform(new DOMMatrix([r.getWidth() / img.w, 0, 0, r.getHeight() / img.h, r.getX(), r.getY()]));
        return pat;
      }
      return css(this.color.getRGB());
    }
    strokeSetup(ctx: any) {
      const s = this.stroke;
      const BasicStroke = $J.load('java.awt.BasicStroke');
      if (s instanceof BasicStroke) {
        ctx.lineWidth = Math.max(s.getLineWidth(), this.aa() ? 0.01 : 1);
        ctx.lineCap = ['butt', 'round', 'square'][s.getEndCap()];
        ctx.lineJoin = ['miter', 'round', 'bevel'][s.getLineJoin()];
        ctx.miterLimit = s.getMiterLimit();
        const dash = s.getDashArray();
        ctx.setLineDash(dash ? [...dash] : []);
        ctx.lineDashOffset = s.getDashPhase();
      }
      ctx.strokeStyle = this.style(ctx);
    }
    /** Non-antialiased thin strokes cover pixel centres: offset by half a pixel. */
    half(): number {
      const BasicStroke = $J.load('java.awt.BasicStroke');
      const w = this.stroke instanceof BasicStroke ? this.stroke.getLineWidth() : 1;
      return !this.aa() && w <= 1 && (Math.round(w) % 2 === 1 || w < 1) ? 0.5 : 0;
    }

    fillRect(x: number, y: number, w: number, h: number) {
      if (w <= 0 || h <= 0) return;
      const ctx = this.begin();
      if (!ctx) return;
      ctx.fillStyle = this.style(ctx);
      ctx.fillRect(x, y, w, h);
      this.end(ctx);
    }
    clearRect(x: number, y: number, w: number, h: number) {
      if (w <= 0 || h <= 0) return;
      const ctx = this.begin();
      if (!ctx) return;
      ctx.globalCompositeOperation = 'copy';
      ctx.globalAlpha = 1;
      ctx.fillStyle = css(this.bg.getRGB());
      ctx.fillRect(x, y, w, h);
      this.end(ctx);
    }
    drawRect(x: number, y: number, w: number, h: number) {
      if (w < 0 || h < 0) return;
      const ctx = this.begin();
      if (!ctx) return;
      this.strokeSetup(ctx);
      const o = this.half();
      ctx.strokeRect(x + o, y + o, w, h);
      this.end(ctx);
    }
    drawLine(x1: number, y1: number, x2: number, y2: number) {
      const ctx = this.begin();
      if (!ctx) return;
      this.strokeSetup(ctx);
      const o = this.half();
      if (x1 === x2 && y1 === y2 && o) {
        // a point: one pixel
        ctx.fillStyle = ctx.strokeStyle;
        ctx.fillRect(x1, y1, 1, 1);
      } else {
        ctx.beginPath();
        ctx.moveTo(x1 + o, y1 + o);
        ctx.lineTo(x2 + o, y2 + o);
        if (o && ctx.lineCap === 'butt') {
          // Java's thin lines include both end points
          ctx.lineCap = 'square';
        }
        ctx.stroke();
      }
      this.end(ctx);
    }
    path(ctx: any, build: (ctx: any) => void, fill: boolean) {
      ctx.beginPath();
      build(ctx);
      if (fill) {
        ctx.fillStyle = this.style(ctx);
        ctx.fill();
      } else {
        this.strokeSetup(ctx);
        ctx.stroke();
      }
    }
    drawRoundRect(x: number, y: number, w: number, h: number, aw: number, ah: number) {
      const ctx = this.begin();
      if (!ctx) return;
      const o = this.half();
      this.path(ctx, (c) => roundRect(c, x + o, y + o, w, h, aw / 2, ah / 2), false);
      this.end(ctx);
    }
    fillRoundRect(x: number, y: number, w: number, h: number, aw: number, ah: number) {
      const ctx = this.begin();
      if (!ctx) return;
      this.path(ctx, (c) => roundRect(c, x, y, w, h, aw / 2, ah / 2), true);
      this.end(ctx);
    }
    drawOval(x: number, y: number, w: number, h: number) {
      const ctx = this.begin();
      if (!ctx) return;
      const o = this.half();
      this.path(ctx, (c) => c.ellipse(x + o + w / 2, y + o + h / 2, w / 2, h / 2, 0, 0, 2 * Math.PI), false);
      this.end(ctx);
    }
    fillOval(x: number, y: number, w: number, h: number) {
      const ctx = this.begin();
      if (!ctx) return;
      this.path(ctx, (c) => c.ellipse(x + w / 2, y + h / 2, w / 2, h / 2, 0, 0, 2 * Math.PI), true);
      this.end(ctx);
    }
    arc(c: any, x: number, y: number, w: number, h: number, start: number, extent: number, pie: boolean) {
      const a0 = (-start * Math.PI) / 180, a1 = (-(start + extent) * Math.PI) / 180;
      if (pie) c.moveTo(x + w / 2, y + h / 2);
      c.ellipse(x + w / 2, y + h / 2, w / 2, h / 2, 0, a0, a1, extent > 0);
      if (pie) c.closePath();
    }
    drawArc(x: number, y: number, w: number, h: number, start: number, extent: number) {
      const ctx = this.begin();
      if (!ctx) return;
      const o = this.half();
      this.path(ctx, (c) => this.arc(c, x + o, y + o, w, h, start, extent, false), false);
      this.end(ctx);
    }
    fillArc(x: number, y: number, w: number, h: number, start: number, extent: number) {
      const ctx = this.begin();
      if (!ctx) return;
      this.path(ctx, (c) => this.arc(c, x, y, w, h, start, extent, true), true);
      this.end(ctx);
    }
    poly(xs: number[], ys: number[], n: number, close: boolean, fill: boolean) {
      if (n <= 0) return;
      const ctx = this.begin();
      if (!ctx) return;
      const o = fill ? 0 : this.half();
      this.path(ctx, (c) => {
        c.moveTo(xs[0] + o, ys[0] + o);
        for (let i = 1; i < n; i++) c.lineTo(xs[i] + o, ys[i] + o);
        if (close) c.closePath();
      }, fill);
      this.end(ctx);
    }
    drawPolyline(xs: number[], ys: number[], n: number) {
      this.poly(xs, ys, n, false, false);
    }
    [m('drawPolygon(int[],int[],int)')](xs: number[], ys: number[], n: number) {
      this.poly(xs, ys, n, true, false);
    }
    [m('fillPolygon(int[],int[],int)')](xs: number[], ys: number[], n: number) {
      this.poly(xs, ys, n, true, true);
    }
    [m('drawPolygon(java.awt.Polygon)')](p: any) {
      this.poly(p.xpoints, p.ypoints, p.npoints, true, false);
    }
    [m('fillPolygon(java.awt.Polygon)')](p: any) {
      this.poly(p.xpoints, p.ypoints, p.npoints, true, true);
    }
    fill(s: any) {
      const ctx = this.begin();
      if (!ctx) return;
      const d = this.shapePathDev(s);
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.fillStyle = this.style(ctx);
      ctx.fill(d.path, d.even ? 'evenodd' : 'nonzero');
      this.end(ctx);
    }
    draw(s: any) {
      const ctx = this.begin();
      if (!ctx) return;
      const o = this.half();
      const d = this.shapePathDev(s);
      ctx.setTransform(1, 0, 0, 1, o, o);
      this.strokeSetup(ctx);
      ctx.stroke(d.path);
      this.end(ctx);
    }
    copyArea(x: number, y: number, w: number, h: number, dx: number, dy: number) {
      const s = this.t.surface();
      if (!s) return;
      const [X, Y] = this.devRect(x, y, w, h);
      const ctx = this.begin();
      if (!ctx) return;
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      // the canvas drawn onto itself (the source is copied first), at device scale
      const sx = this.tx[0], sy = this.tx[3];
      ctx.globalCompositeOperation = 'source-over';
      ctx.drawImage(s.canvas, X, Y, w * sx, h * sy, X + dx * sx, Y + dy * sy, w * sx, h * sy);
      this.end(ctx);
    }

    // ---- images

    img(img: any, dx: number, dy: number, dw: number | null, dh: number | null, sx = 0, sy = 0, sw?: number, sh?: number, bg?: any) {
      if (img == null) return true;
      if (!(img instanceof BufferedImage)) {
        // a VolatileImage, or another Image: its snapshot
        if (img.getSnapshot) img = img.getSnapshot();
        else if (img.$image) img = img.$image;
        else return true;
      }
      const s = img.surface();
      const ctx = this.begin();
      if (!ctx) return true;
      const w = sw ?? img.w, h = sh ?? img.h;
      if (bg) {
        ctx.fillStyle = css(bg.getRGB());
        ctx.fillRect(dx, dy, dw ?? w, dh ?? h);
      }
      if (s) {
        const smooth = this.hints.get(RH.KEY_INTERPOLATION);
        ctx.imageSmoothingEnabled = smooth != null && smooth !== RH.VALUE_INTERPOLATION_NEAREST_NEIGHBOR;
        if (ctx.imageSmoothingEnabled) ctx.imageSmoothingQuality = smooth === RH.VALUE_INTERPOLATION_BICUBIC ? 'high' : 'medium';
        ctx.drawImage(s.canvas, img.ox + sx, img.oy + sy, w, h, dx, dy, dw ?? w, dh ?? h);
      }
      this.end(ctx);
      return true;
    }
    [m('drawImage(java.awt.Image,int,int,java.awt.image.ImageObserver)')](i: any, x: number, y: number, _o: any) {
      return this.img(i, x, y, null, null);
    }
    [m('drawImage(java.awt.Image,int,int,java.awt.Color,java.awt.image.ImageObserver)')](i: any, x: number, y: number, bg: any, _o: any) {
      return this.img(i, x, y, null, null, 0, 0, undefined, undefined, bg);
    }
    [m('drawImage(java.awt.Image,int,int,int,int,java.awt.image.ImageObserver)')](i: any, x: number, y: number, w: number, h: number, _o: any) {
      return this.img(i, x, y, w, h);
    }
    [m('drawImage(java.awt.Image,int,int,int,int,java.awt.Color,java.awt.image.ImageObserver)')](i: any, x: number, y: number, w: number, h: number, bg: any, _o: any) {
      return this.img(i, x, y, w, h, 0, 0, undefined, undefined, bg);
    }
    [m('drawImage(java.awt.Image,int,int,int,int,int,int,int,int,java.awt.image.ImageObserver)')](i: any, dx1: number, dy1: number, dx2: number, dy2: number, sx1: number, sy1: number, sx2: number, sy2: number, _o: any) {
      return this.img9(i, dx1, dy1, dx2, dy2, sx1, sy1, sx2, sy2, null);
    }
    [m('drawImage(java.awt.Image,int,int,int,int,int,int,int,int,java.awt.Color,java.awt.image.ImageObserver)')](i: any, dx1: number, dy1: number, dx2: number, dy2: number, sx1: number, sy1: number, sx2: number, sy2: number, bg: any, _o: any) {
      return this.img9(i, dx1, dy1, dx2, dy2, sx1, sy1, sx2, sy2, bg);
    }
    img9(i: any, dx1: number, dy1: number, dx2: number, dy2: number, sx1: number, sy1: number, sx2: number, sy2: number, bg: any) {
      if (dx1 === dx2 || dy1 === dy2 || sx1 === sx2 || sy1 === sy2) return true;
      // flips: through the transform
      const flipX = (dx2 - dx1) * (sx2 - sx1) < 0, flipY = (dy2 - dy1) * (sy2 - sy1) < 0;
      if (flipX || flipY) {
        const g = this.create();
        g.translate(flipX ? Math.max(dx1, dx2) : 0, flipY ? Math.max(dy1, dy2) : 0);
        g.scale(flipX ? -1 : 1, flipY ? -1 : 1);
        const r = g.img(i, flipX ? 0 : Math.min(dx1, dx2), flipY ? 0 : Math.min(dy1, dy2), Math.abs(dx2 - dx1), Math.abs(dy2 - dy1),
          Math.min(sx1, sx2), Math.min(sy1, sy2), Math.abs(sx2 - sx1), Math.abs(sy2 - sy1), bg);
        g.dispose();
        return r;
      }
      return this.img(i, Math.min(dx1, dx2), Math.min(dy1, dy2), Math.abs(dx2 - dx1), Math.abs(dy2 - dy1),
        Math.min(sx1, sx2), Math.min(sy1, sy2), Math.abs(sx2 - sx1), Math.abs(sy2 - sy1), bg);
    }
    [m('drawImage(java.awt.Image,java.awt.geom.AffineTransform,java.awt.image.ImageObserver)')](i: any, at: any, _o: any) {
      const g = this.create();
      if (at != null) g.transform(at);
      const r = g.img(i, 0, 0, null, null);
      g.dispose();
      return r;
    }
    [m('drawImage(java.awt.image.BufferedImage,java.awt.image.BufferedImageOp,int,int)')](i: any, op: any, x: number, y: number) {
      this.img(op == null ? i : filterImage(op, i), x, y, null, null);
    }
    drawRenderedImage(i: any, at: any) {
      this[m('drawImage(java.awt.Image,java.awt.geom.AffineTransform,java.awt.image.ImageObserver)')](i, at, null);
    }

    // ---- text

    [m('drawString(java.lang.String,int,int)')](s: string, x: number, y: number) {
      this.text(s, x, y);
    }
    [m('drawString(java.lang.String,float,float)')](s: string, x: number, y: number) {
      this.text(s, x, y);
    }
    [m('drawString(java.text.AttributedCharacterIterator,int,int)')](it: any, x: number, y: number) {
      this.text(iterText(it), x, y);
    }
    [m('drawString(java.text.AttributedCharacterIterator,float,float)')](it: any, x: number, y: number) {
      this.text(iterText(it), x, y);
    }
    drawChars(data: number[], off: number, len: number, x: number, y: number) {
      this.text(String.fromCharCode(...data.slice(off, off + len)), x, y);
    }
    drawGlyphVector(gv: any, x: number, y: number) {
      if (gv.$text != null) this.text(gv.$text, x, y, gv.getFont());
    }
    text(s: string, x: number, y: number, font?: any) {
      if (s == null) throw new ($J.load('java.lang.NullPointerException') as any)('String is null');
      if (!s.length) return;
      const ctx = this.begin();
      if (!ctx) return;
      const f = font ?? this.font;
      ctx.font = cssFont(f);
      ctx.fillStyle = this.style(ctx);
      ctx.textBaseline = 'alphabetic';
      if (ctx.fontKerning !== undefined) ctx.fontKerning = 'none';
      const frac = this.hints.get(RH.KEY_FRACTIONALMETRICS) === RH.VALUE_FRACTIONALMETRICS_ON;
      const strike = f.getFont2D().strike(f, this.hints.get(RH.KEY_TEXT_ANTIALIASING), frac ? RH.VALUE_FRACTIONALMETRICS_ON : null);
      let px = x;
      for (let i = 0; i < s.length; i++) {
        const c = s.charCodeAt(i);
        if (c !== 32) ctx.fillText(s[i], px, y);
        px += strike.advance(c);
      }
      if (f.getAttributes?.().get?.($J.load('java.awt.font.TextAttribute').UNDERLINE) != null) {
        ctx.fillRect(x, y + Math.max(1, strike.underlineOffset), px - x, Math.max(1, strike.underlineThickness));
      }
      this.end(ctx);
    }
    hit(r: any, s: any, onStroke: boolean) {
      void onStroke;
      return s.intersects$Rectangle2D ? s.intersects$Rectangle2D(r) : true;
    }
  }
  // Java's overloads have names of their own in the translation: the methods above under those names
  const P = WebGraphics.prototype as any;
  const alias: [string, string][] = [
    ['create()', 'create'], ['create(int,int,int,int)', 'create'],
    ['translate(int,int)', 'translate'], ['translate(double,double)', 'translate'],
    ['rotate(double)', 'rotate'], ['rotate(double,double,double)', 'rotate'],
    ['setClip(java.awt.Shape)', 'setClip'], ['setClip(int,int,int,int)', 'setClip'],
    ['getClipBounds()', 'getClipBounds$'], ['getClipBounds(java.awt.Rectangle)', 'getClipBounds$Rectangle'],
    ['getFontMetrics()', 'getFontMetrics'], ['getFontMetrics(java.awt.Font)', 'getFontMetrics'],
  ];
  for (const [sig, impl] of alias) {
    const n = m(sig);
    if (n !== impl) P[n] = P[impl];
  }
  $J.adoptOverloads(WebGraphics);
  $J.define(WebGraphics, 'sun.java2d.WebGraphics', { kind: 'class', sup: 'java.awt.Graphics2D' });
  return WebGraphics;
});

function roundRect(c: any, x: number, y: number, w: number, h: number, rx: number, ry: number) {
  rx = Math.min(Math.abs(rx), w / 2);
  ry = Math.min(Math.abs(ry), h / 2);
  c.moveTo(x + rx, y);
  c.lineTo(x + w - rx, y);
  c.ellipse(x + w - rx, y + ry, rx, ry, 0, -Math.PI / 2, 0);
  c.lineTo(x + w, y + h - ry);
  c.ellipse(x + w - rx, y + h - ry, rx, ry, 0, 0, Math.PI / 2);
  c.lineTo(x + rx, y + h);
  c.ellipse(x + rx, y + h - ry, rx, ry, 0, Math.PI / 2, Math.PI);
  c.lineTo(x, y + ry);
  c.ellipse(x + rx, y + ry, rx, ry, 0, Math.PI, Math.PI * 1.5);
  c.closePath();
}

function iterText(it: any): string {
  let s = '';
  for (let c = it.first(); c !== 0xffff; c = it.next()) s += String.fromCharCode(c);
  return s;
}

/** A BufferedImageOp applied to an image (RescaleOp: fog of war; others through their own filter). */
export function filterImage(op: any, src: any): any {
  const RescaleOp = $J.load('java.awt.image.RescaleOp');
  if (op instanceof RescaleOp) {
    const scales = op.getScaleFactors(null), offs = op.getOffsets(null);
    const n = scales.length;
    const out = new BufferedImage(src.w, src.h, src.opaque() ? 1 : 2);
    const p = src.parent ? src.getRGB(0, 0, src.w, src.h, null, 0, src.w) : src.pixels();
    const q = out.pixels();
    const ch = (v: number, k: number) => {
      const i = n === 1 ? 0 : k;
      return Math.max(0, Math.min(255, Math.trunc(Math.fround(Math.fround(v * scales[i]) + offs[i]))));
    };
    for (let i = 0; i < q.length; i++) {
      const v = p[i];
      const a = n === 4 ? ch(v >>> 24, 3) : v >>> 24;
      q[i] = (a << 24) | (ch((v >> 16) & 255, 0) << 16) | (ch((v >> 8) & 255, 1) << 8) | ch(v & 255, 2);
    }
    out.$touched();
    return out;
  }
  return op.filter(src, null);
}

/** The graphics for a target, as Component.getGraphics or BufferedImage.createGraphics returns it. */
export function newGraphics(t: Target, font?: any, fg?: any, bg?: any) {
  return new (graphicsClass())().$init(t, font, fg, bg);
}
