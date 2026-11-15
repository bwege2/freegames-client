// Drawing as Pingus does it: DrawingContext (drawing_context.cpp) collects requests with a z position and
// renders them stably sorted by z; SceneContext (scene_context.cpp) renders its colour layer clipped (the
// light layer is not rendered in 0.7.6, its code is #if 0); Font and FontDescription (font.cpp,
// font_description.cpp). The Framebuffer is the window: a canvas in the browser (screen.ts).
import { type Origin, calcOrigin, data, loadImageFile } from './res.ts';
import { SExprReader } from './sexpr.ts';
import type { Sprite } from './sprite.ts';
import type { Surface } from './surface.ts';

export interface Color { r: number; g: number; b: number; a: number }
export const rgba = (r: number, g: number, b: number, a = 255): Color => ({ r, g, b, a });
export interface Rect { left: number; top: number; right: number; bottom: number }
export const rect = (left: number, top: number, right: number, bottom: number): Rect => ({ left, top, right, bottom });

export interface Framebuffer {
  drawSurface(s: Surface, src: { x: number; y: number; w: number; h: number }, x: number, y: number): void;
  fillRect(r: Rect, c: Color): void;
  drawRect(r: Rect, c: Color): void;
  drawLine(x1: number, y1: number, x2: number, y2: number, c: Color): void;
  pushCliprect(r: Rect): void;
  popCliprect(): void;
  width: number;
  height: number;
}

interface Request { z: number; render(fb: Framebuffer, r: Rect): void }

export class DrawingContext {
  private requests: Request[] = [];
  private translate: { x: number; y: number }[] = [{ x: 0, y: 0 }];
  rect: Rect;
  private clip: boolean;
  constructor(r?: Rect, clip = false) {
    this.rect = r ?? rect(0, 0, 800, 600);
    this.clip = clip;
  }
  get width() { return this.rect.right - this.rect.left; }
  get height() { return this.rect.bottom - this.rect.top; }
  private get t() { return this.translate[this.translate.length - 1]; }

  render(fb: Framebuffer, parent: Rect): void {
    const r = rect(Math.max(this.rect.left + parent.left, parent.left), Math.max(this.rect.top + parent.top, parent.top),
      Math.min(this.rect.right + parent.left, parent.right), Math.min(this.rect.bottom + parent.top, parent.bottom));
    if (this.clip) fb.pushCliprect(r);
    // std::stable_sort by z
    const sorted = this.requests.map((q, i) => ({ q, i })).sort((a, b) => a.q.z - b.q.z || a.i - b.i);
    for (const { q } of sorted) q.render(fb, r);
    if (this.clip) fb.popCliprect();
  }
  clear() { this.requests = []; }

  /** a SceneContextDrawingRequest */
  drawScene(sc: SceneContext, z = 0) { this.requests.push({ z, render: (fb, r) => sc.render(fb, r) }); }
  drawContext(dc: DrawingContext, z = 0) { this.requests.push({ z, render: (fb, r) => dc.render(fb, r) }); }
  /** draw(const Sprite&, const Vector2i&, float z): pos taken as ints */
  draw(sprite: Sprite, x: number, y: number, z = 0): void {
    if (!sprite) return;
    const px = x + this.t.x, py = y + this.t.y;
    const src = sprite.frameRect(), surf = sprite.surface, off = sprite.offset;
    this.requests.push({ z, render: (fb, r) => fb.drawSurface(surf, src, px + r.left - off.x, py + r.top - off.y) });
  }
  /** a part of a surface at a position (the ground map's tiles) */
  drawSurface(surf: Surface, src: { x: number; y: number; w: number; h: number }, x: number, y: number, z = 0) {
    const px = x + this.t.x, py = y + this.t.y;
    this.requests.push({ z, render: (fb, r) => fb.drawSurface(surf, src, px + r.left, py + r.top) });
  }
  /** draw(const Sprite&, const Vector3f&): the float position truncated, z from the vector */
  draw3(sprite: Sprite, pos: { x: number; y: number; z?: number }): void {
    this.draw(sprite, Math.trunc(pos.x), Math.trunc(pos.y), pos.z ?? 0);
  }
  drawLine(x1: number, y1: number, x2: number, y2: number, c: Color, z = 0) {
    const t = { ...this.t };
    this.requests.push({ z, render: (fb, r) => fb.drawLine(x1 + t.x + r.left, y1 + t.y + r.top, x2 + t.x + r.left, y2 + t.y + r.top, c) });
  }
  drawFillrect(rc: Rect, c: Color, z = 0) {
    const t = { ...this.t };
    const d = rect(Math.trunc(rc.left + t.x), Math.trunc(rc.top + t.y), Math.trunc(rc.right + t.x), Math.trunc(rc.bottom + t.y));
    this.requests.push({ z, render: (fb, r) => fb.fillRect(rect(d.left + r.left, d.top + r.top, d.right + r.left, d.bottom + r.top), c) });
  }
  drawRect(rc: Rect, c: Color, z = 0) {
    const t = { ...this.t };
    const d = rect(Math.trunc(rc.left + t.x), Math.trunc(rc.top + t.y), Math.trunc(rc.right + t.x), Math.trunc(rc.bottom + t.y));
    this.requests.push({ z, render: (fb, r) => fb.drawRect(rect(d.left + r.left, d.top + r.top, d.right + r.left, d.bottom + r.top), c) });
  }
  fillScreen(c: Color) { this.requests.push({ z: -1000, render: (fb, r) => fb.fillRect(r, c) }); }
  translateBy(x: number, y: number) { this.t.x += x; this.t.y += y; }
  pushModelview() { this.translate.push({ ...this.t }); }
  popModelview() { this.translate.pop(); }
  resetModelview() { this.translate = [{ x: 0, y: 0 }]; }
  getWorldClipRect(): Rect { return rect(-this.t.x, -this.t.y, -this.t.x + this.width, -this.t.y + this.height); }
  screenToWorld(x: number, y: number) { return { x: x - Math.trunc(this.t.x + this.rect.left), y: y - Math.trunc(this.t.y + this.rect.top) }; }
  worldToScreen(x: number, y: number) { return { x: x + Math.trunc(this.t.x + this.rect.left), y: y + Math.trunc(this.t.y + this.rect.top) }; }
  private print(font: Font, origin: Origin, x: number, y: number, text: string, z: number) {
    if (!font) return;
    const px = x + this.t.x, py = y + this.t.y;
    this.requests.push({ z, render: (fb, r) => font.render(origin, Math.trunc(px + r.left), Math.trunc(py + r.top), text, fb) });
  }
  printLeft(font: Font, x: number, y: number, text: string, z = 0) { this.print(font, 'top_left', x, y, text, z); }
  printCenter(font: Font, x: number, y: number, text: string, z = 0) { this.print(font, 'top_center', x, y, text, z); }
  printRight(font: Font, x: number, y: number, text: string, z = 0) { this.print(font, 'top_right', x, y, text, z); }
}

export class SceneContext {
  readonly colorDC: DrawingContext;
  readonly lightDC: DrawingContext;
  readonly highlightDC: DrawingContext;
  private cliprect: Rect | null = null;
  constructor(r: Rect) {
    this.colorDC = new DrawingContext(r);
    this.lightDC = new DrawingContext(r);
    this.highlightDC = new DrawingContext(r);
  }
  color() { return this.colorDC; }
  light() { return this.lightDC; }
  highlight() { return this.highlightDC; }
  setRect(r: Rect) { this.colorDC.rect = r; this.lightDC.rect = r; this.highlightDC.rect = r; }
  setCliprect(r: Rect) { this.cliprect = r; }
  resetCliprect() { this.cliprect = null; }
  translate(x: number, y: number) { for (const d of [this.colorDC, this.lightDC, this.highlightDC]) d.translateBy(x, y); }
  pushModelview() { for (const d of [this.colorDC, this.lightDC, this.highlightDC]) d.pushModelview(); }
  popModelview() { for (const d of [this.colorDC, this.lightDC, this.highlightDC]) d.popModelview(); }
  resetModelview() { for (const d of [this.colorDC, this.lightDC, this.highlightDC]) d.resetModelview(); }
  clear() { this.colorDC.clear(); this.lightDC.clear(); this.highlightDC.clear(); }
  render(fb: Framebuffer, r: Rect) {
    if (this.cliprect) { fb.pushCliprect(this.cliprect); this.colorDC.render(fb, r); fb.popCliprect(); }
    else this.colorDC.render(fb, r);
    this.highlightDC.render(fb, r);
  }
}

interface Glyph { unicode: number; image: number; offset: { x: number; y: number }; advance: number; rect: Rect }

/** Font: a bitmap font of the original (images/fonts/*.font + .png) */
export class Font {
  private glyphs = new Map<number, Glyph>();
  private images: Surface[] = [];
  readonly size: number;
  readonly charSpacing: number;
  readonly verticalSpacing: number;
  constructor(path: string) {
    const r = SExprReader.parse(data().text(path) ?? '');
    if (r.getName() !== 'pingus-font') throw new Error('FontDescription: not a pingus-font file');
    this.charSpacing = r.readFloat('char-spacing') ?? 1;
    const vs = r.readFloat('vertical-spacing') ?? 1;
    this.size = r.readInt('size') ?? 0;
    this.verticalSpacing = Math.fround(this.size * vs);
    for (const img of r.section('images').getSections()) {
      const file = img.readString('filename');
      if (!file || !data().exists(file)) continue; // the CJK glyph images are not shipped (LICENSE.md)
      this.images.push(loadImageFile(file));
      for (const g of img.section('glyphs').getSections()) {
        const u = g.readInt('unicode') ?? 0;
        if (this.glyphs.has(u)) continue;
        this.glyphs.set(u, {
          unicode: u, image: this.images.length - 1, offset: g.readVector2i('offset') ?? { x: 0, y: 0 },
          advance: g.readInt('advance') ?? 0, rect: g.readRect('rect') ?? rect(0, 0, 0, 0),
        });
      }
    }
  }
  get height() { return this.size; }
  charWidth(u: number) { return this.glyphs.get(u)?.advance ?? 0; }
  /** get_width(const std::string&): the widest line */
  width(text: string): number {
    const f = Math.fround;
    let w = 0, last = 0;
    for (const ch of text) {
      const u = ch.codePointAt(0)!;
      if (u === 10) { last = Math.max(last, w); w = 0; }
      else w = f(w + f(this.charWidth(u) + this.charSpacing));
    }
    return Math.max(w, last);
  }
  render(origin: Origin, x: number, y0: number, text: string, fb: Framebuffer) {
    let y = Math.fround(y0 + this.size);
    for (const line of text.split('\n')) {
      this.renderLine(origin, x, Math.trunc(y), line, fb);
      y = Math.fround(y + this.verticalSpacing);
    }
  }
  private renderLine(origin: Origin, x: number, y: number, text: string, fb: Framebuffer) {
    const o = calcOrigin(origin, Math.trunc(this.width(text)), this.size);
    let dx = Math.fround(x - o.x);
    const dy = y - o.y;
    for (const ch of text) {
      const g = this.glyphs.get(ch.codePointAt(0)!);
      if (!g) continue;
      fb.drawSurface(this.images[g.image], { x: g.rect.left, y: g.rect.top, w: g.rect.right - g.rect.left, h: g.rect.bottom - g.rect.top },
        Math.trunc(dx) + g.offset.x, dy + g.offset.y);
      dx = Math.fround(dx + g.advance + this.charSpacing);
    }
  }
}
