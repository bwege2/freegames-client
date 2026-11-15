// The window as a canvas: SDLFramebuffer (engine/display/sdl_framebuffer.cpp) on a CanvasRenderingContext2D.
// Surfaces become canvases once (the colour key transparent, alpha as stored, as SDL blits them); the ground
// map's canvas is updated where the level changed.
import type { Color, Framebuffer, Rect } from './gfx.ts';
import type { Surface } from './surface.ts';

export class CanvasFramebuffer implements Framebuffer {
  private ctx: CanvasRenderingContext2D;
  private textures = new WeakMap<Surface, HTMLCanvasElement>();
  private clips: Rect[] = [];
  readonly width: number;
  readonly height: number;
  constructor(ctx: CanvasRenderingContext2D, w: number, h: number) {
    this.ctx = ctx;
    this.width = w;
    this.height = h;
  }

  private texture(s: Surface): HTMLCanvasElement {
    let c = this.textures.get(s);
    if (!c) {
      c = document.createElement('canvas');
      c.width = Math.max(1, s.w);
      c.height = Math.max(1, s.h);
      if (s.w > 0 && s.h > 0) c.getContext('2d')!.putImageData(new ImageData(s.toRGBA() as Uint8ClampedArray<ArrayBuffer>, s.w, s.h), 0, 0);
      this.textures.set(s, c);
      s.dirty = null;
    } else if (s.dirty) {
      const d = s.dirty;
      s.dirty = null;
      const w = d.x1 - d.x0, h = d.y1 - d.y0;
      const img = new ImageData(w, h);
      for (let y = 0; y < h; y++) {
        const o = ((d.y0 + y) * s.w + d.x0) * 4;
        img.data.set(s.px.subarray(o, o + w * 4), y * w * 4);
      }
      c.getContext('2d')!.putImageData(img, d.x0, d.y0);
    }
    return c;
  }

  drawSurface(s: Surface, src: { x: number; y: number; w: number; h: number }, x: number, y: number): void {
    // SDL_BlitSurface clips the source rectangle to the surface
    let sx = src.x, sy = src.y, w = src.w, h = src.h;
    if (sx < 0) { x -= sx; w += sx; sx = 0; }
    if (sy < 0) { y -= sy; h += sy; sy = 0; }
    w = Math.min(w, s.w - sx);
    h = Math.min(h, s.h - sy);
    if (w <= 0 || h <= 0) return;
    this.ctx.drawImage(this.texture(s), sx, sy, w, h, x, y, w, h);
  }

  fillRect(r: Rect, c: Color): void {
    if (c.a === 0) return;
    const x0 = Math.min(r.left, r.right), x1 = Math.max(r.left, r.right);
    const y0 = Math.min(r.top, r.bottom), y1 = Math.max(r.top, r.bottom);
    this.ctx.fillStyle = `rgba(${c.r},${c.g},${c.b},${c.a / 255})`;
    this.ctx.fillRect(x0, y0, x1 - x0, y1 - y0);
  }

  drawRect(r: Rect, c: Color): void {
    this.drawLine(r.left, r.top, r.right - 1, r.top, c);
    this.drawLine(r.left, r.bottom - 1, r.right - 1, r.bottom - 1, c);
    this.drawLine(r.left, r.top, r.left, r.bottom - 1, c);
    this.drawLine(r.right - 1, r.top, r.right - 1, r.bottom - 1, c);
  }

  drawLine(x1: number, y1: number, x2: number, y2: number, c: Color): void {
    // one pixel per step of the longer axis, as SDLFramebuffer::draw_line
    this.ctx.fillStyle = `rgba(${c.r},${c.g},${c.b},${c.a / 255})`;
    const dx = x2 - x1, dy = y2 - y1, n = Math.max(Math.abs(dx), Math.abs(dy));
    if (n === 0) { this.ctx.fillRect(x1, y1, 1, 1); return; }
    for (let i = 0; i <= n; i++) this.ctx.fillRect(Math.round(x1 + dx * i / n), Math.round(y1 + dy * i / n), 1, 1);
  }

  pushCliprect(r: Rect): void {
    const top = this.clips[this.clips.length - 1];
    const c = top ? { left: Math.max(top.left, r.left), top: Math.max(top.top, r.top), right: Math.min(top.right, r.right), bottom: Math.min(top.bottom, r.bottom) } : r;
    this.clips.push(c);
    this.ctx.save();
    this.ctx.beginPath();
    this.ctx.rect(c.left, c.top, Math.max(0, c.right - c.left), Math.max(0, c.bottom - c.top));
    this.ctx.clip();
  }

  popCliprect(): void {
    this.clips.pop();
    this.ctx.restore();
  }

  clear(): void { this.ctx.fillStyle = '#000'; this.ctx.fillRect(0, 0, this.width, this.height); }
}
