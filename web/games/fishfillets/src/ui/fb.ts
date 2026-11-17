// The screen as an SDL surface: a 32-bit framebuffer, blits with alpha as SDL 1.2 does them
// (SDL_DisplayFormatAlpha surfaces onto the display), and the few SDL_gfx primitives the game uses.
// Pictures are decoded once into RGBA pixels.

export interface Pic {
  w: number;
  h: number;
  /** RGBA, rows from the top */
  px: Uint8ClampedArray;
}

export class Framebuffer implements Pic {
  w: number;
  h: number;
  px: Uint8ClampedArray;
  constructor(w: number, h: number) {
    this.w = w;
    this.h = h;
    this.px = new Uint8ClampedArray(w * h * 4);
  }

  clear(): void {
    this.px.fill(0);
    for (let i = 3; i < this.px.length; i += 4) this.px[i] = 255;
  }

  /** SDL_BlitSurface of an alpha surface: dst += (src - dst) * a / 256 (alpha 255 copies) */
  blit(src: Pic, dx: number, dy: number, sx = 0, sy = 0, sw = src.w, sh = src.h): void {
    // clip
    if (sx < 0) { sw += sx; dx -= sx; sx = 0; }
    if (sy < 0) { sh += sy; dy -= sy; sy = 0; }
    if (sx + sw > src.w) sw = src.w - sx;
    if (sy + sh > src.h) sh = src.h - sy;
    if (dx < 0) { sw += dx; sx -= dx; dx = 0; }
    if (dy < 0) { sh += dy; sy -= dy; dy = 0; }
    if (dx + sw > this.w) sw = this.w - dx;
    if (dy + sh > this.h) sh = this.h - dy;
    if (sw <= 0 || sh <= 0) return;
    const s = src.px, d = this.px;
    for (let y = 0; y < sh; y++) {
      let si = ((sy + y) * src.w + sx) * 4;
      let di = ((dy + y) * this.w + dx) * 4;
      for (let x = 0; x < sw; x++, si += 4, di += 4) {
        const a = s[si + 3];
        if (a === 255) {
          d[di] = s[si]; d[di + 1] = s[si + 1]; d[di + 2] = s[si + 2];
        } else if (a !== 0) {
          d[di] += ((s[si] - d[di]) * a) >> 8;
          d[di + 1] += ((s[si + 1] - d[di + 1]) * a) >> 8;
          d[di + 2] += ((s[si + 2] - d[di + 2]) * a) >> 8;
        }
      }
    }
  }

  get(x: number, y: number): [number, number, number, number] {
    if (x < 0 || y < 0 || x >= this.w || y >= this.h) return [0, 0, 0, 0];
    const i = (y * this.w + x) * 4;
    return [this.px[i], this.px[i + 1], this.px[i + 2], 255];
  }

  put(x: number, y: number, r: number, g: number, b: number): void {
    if (x < 0 || y < 0 || x >= this.w || y >= this.h) return;
    const i = (y * this.w + x) * 4;
    this.px[i] = r; this.px[i + 1] = g; this.px[i + 2] = b;
  }

  /** pixelRGBA of SDL_gfx: blend with alpha a */
  blend(x: number, y: number, r: number, g: number, b: number, a: number): void {
    if (x < 0 || y < 0 || x >= this.w || y >= this.h) return;
    const i = (y * this.w + x) * 4;
    const d = this.px;
    if (a === 255) { d[i] = r; d[i + 1] = g; d[i + 2] = b; return; }
    d[i] += ((r - d[i]) * a) >> 8;
    d[i + 1] += ((g - d[i + 1]) * a) >> 8;
    d[i + 2] += ((b - d[i + 2]) * a) >> 8;
  }

  /** SurfaceTool::alphaFill over the whole surface */
  alphaFill(r: number, g: number, b: number, a: number): void {
    for (let y = 0; y < this.h; y++) for (let x = 0; x < this.w; x++) this.blend(x, y, r, g, b, a);
  }

  /** SDL_gfx lineColor: a Bresenham line */
  line(x1: number, y1: number, x2: number, y2: number, rgba: number): void {
    const r = (rgba >>> 24) & 255, g = (rgba >>> 16) & 255, b = (rgba >>> 8) & 255, a = rgba & 255;
    let dx = Math.abs(x2 - x1), dy = -Math.abs(y2 - y1);
    const sx = x1 < x2 ? 1 : -1, sy = y1 < y2 ? 1 : -1;
    let err = dx + dy;
    let x = x1, y = y1;
    for (;;) {
      this.blend(x, y, r, g, b, a);
      if (x === x2 && y === y2) break;
      const e2 = 2 * err;
      if (e2 >= dy) { err += dy; x += sx; }
      if (e2 <= dx) { err += dx; y += sy; }
    }
    void dx;
  }

  /** SDL_gfx aalineColor (Wu's antialiased line) */
  aaline(x1: number, y1: number, x2: number, y2: number, rgba: number): void {
    const r = (rgba >>> 24) & 255, g = (rgba >>> 16) & 255, b = (rgba >>> 8) & 255, a = rgba & 255;
    const steep = Math.abs(y2 - y1) > Math.abs(x2 - x1);
    if (steep) { [x1, y1] = [y1, x1]; [x2, y2] = [y2, x2]; }
    if (x1 > x2) { [x1, x2] = [x2, x1]; [y1, y2] = [y2, y1]; }
    const dx = x2 - x1, dy = y2 - y1;
    const grad = dx === 0 ? 1 : dy / dx;
    let y = y1;
    for (let x = x1; x <= x2; x++) {
      const fy = Math.floor(y), f = y - fy;
      const p = (px: number, py: number, w: number) => (steep ? this.blend(py, px, r, g, b, Math.round(a * w)) : this.blend(px, py, r, g, b, Math.round(a * w)));
      p(x, fy, 1 - f);
      if (f > 0) p(x, fy + 1, f);
      y += grad;
    }
  }

  /** SDL_gfx filledCircleColor */
  filledCircle(cx: number, cy: number, rad: number, rgba: number): void {
    const r = (rgba >>> 24) & 255, g = (rgba >>> 16) & 255, b = (rgba >>> 8) & 255, a = rgba & 255;
    for (let y = -rad; y <= rad; y++) {
      const w = Math.floor(Math.sqrt(rad * rad - y * y));
      for (let x = -w; x <= w; x++) this.blend(cx + x, cy + y, r, g, b, a);
    }
  }
}

/** decodes a picture file into pixels */
export async function decodePic(url: string, signal?: AbortSignal): Promise<Pic> {
  const res = await fetch(url, { signal });
  const blob = await res.blob();
  const bmp = await createImageBitmap(blob, { premultiplyAlpha: 'none', colorSpaceConversion: 'none' });
  const c = new OffscreenCanvas(bmp.width, bmp.height);
  const g = c.getContext('2d', { willReadFrequently: true })!;
  g.drawImage(bmp, 0, 0);
  const d = g.getImageData(0, 0, bmp.width, bmp.height);
  bmp.close();
  return { w: d.width, h: d.height, px: d.data };
}
