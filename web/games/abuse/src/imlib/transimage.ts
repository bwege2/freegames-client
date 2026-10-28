// imlib/transimage.cpp: run-length coded sprites with transparency (0 = transparent)
//   per run: skip count, solid count, solid pixels; no run wraps a scan line
import { image } from './image.ts';
import type { ColorFilter } from './filter.ts';
import type { palette } from './palette.ts';

const NORMAL = 0, REMAP = 1, REMAP2 = 2, FADE = 3, FADE_TINT = 4, COLOR = 5, FILLED = 6, PREDATOR = 7, BLEND = 8,
  SCANLINE = 9;
const Min = (a: number, b: number): number => (a < b ? a : b);
const Max = (a: number, b: number): number => (a > b ? a : b);

export class TransImage {
  w: number;
  h: number;
  m_data: Uint8Array;

  constructor(im: image, _name: string) {
    this.w = im.w;
    this.h = im.h;
    const src = im.m_data;
    const out: number[] = [];
    for (let y = 0; y < this.h; y++) {
      let sl = y * im.w;
      for (let x = 0; x < this.w;) {
        let len = 0;
        while (x + len < this.w && src[sl + len] === 0) len = (len + 1) & 0xff;
        out.push(len);
        x += len;
        sl += len;
        if (x >= this.w) break;
        len = 0;
        const at = out.length;
        out.push(0);
        while (x + len < this.w && src[sl + len] !== 0) {
          out.push(src[sl + len]);
          len = (len + 1) & 0xff;
        }
        out[at] = len;
        x += len;
        sl += len;
      }
    }
    this.m_data = Uint8Array.from(out);
  }

  Size(): { x: number; y: number } { return { x: this.w, y: this.h }; }

  ToImage(): image {
    const im = new image(this.w, this.h);
    this.PutImage(im, 0, 0);
    return im;
  }

  /** ClipToLine: returns [data offset, y, ysteps] or null */
  private ClipToLine(screen: image, p1x: number, p1y: number, p2x: number, p2y: number, px: number, py: number): [number, number, number] | null {
    if (py + this.h <= p1y || py >= p2y || px >= p2x || px + this.w <= p1x) return null;
    let parser = 0;
    const d = this.m_data;
    let skiplines = Max(p1y - py, 0);
    const ysteps = Min(p2y - py, this.h - skiplines);
    py += skiplines;
    while (skiplines--) {
      for (let ix = 0; ix < this.w;) {
        ix += d[parser++];
        if (ix >= this.w) break;
        ix += d[parser];
        parser += d[parser] + 1;
      }
    }
    screen.AddDirty(Max(px, p1x), py, Min(px + this.w, p2x), py + this.h);
    return [parser, py, ysteps];
  }

  private put(N: number, screen: image, px: number, py: number, color: number, map: Uint8Array | null,
    map2: Uint8Array | null, amount: number, nframes: number, tint: Uint8Array | null, f: ColorFilter | null,
    pal: palette | null): void {
    let [p1x, p1y, p2x, p2y] = screen.GetClip();
    let mul = 0;
    if (N === SCANLINE) {
      p1y = Max(p1y, py + amount);
      p2y = Min(p2y, py + amount + 1);
      if (p1y >= p2y) return;
    }
    const c = this.ClipToLine(screen, p1x, p1y, p2x, p2y, px, py);
    if (!c) return;
    let datap = c[0];
    py = c[1];
    let ysteps = c[2];
    let paddr: Uint8Array | null = null;
    if (N === FADE || N === FADE_TINT || N === BLEND) paddr = pal!.addr();
    if (N === FADE || N === FADE_TINT) mul = ((amount << 16) / nframes) | 0;
    if (N === PREDATOR) ysteps = Min(ysteps, p2y - 1 - py - 2);
    const sd = screen.m_data, d = this.m_data;
    let sline = py * screen.w + px;
    const sw = screen.w;
    p1x -= px;
    p2x -= px;
    for (; ysteps > 0; ysteps--, py++) {
      for (let ix = 0; ix < this.w;) {
        let todo = d[datap++];
        ix += todo;
        sline += todo;
        if (ix >= this.w) break;
        todo = d[datap++];
        const tochop = Min(todo, Max(p1x - ix, 0));
        ix += tochop;
        sline += tochop;
        datap += tochop;
        todo -= tochop;
        let count = Min(todo, Max(p2x - ix, 0));
        if (count <= 0) {
          // nothing to put
        } else if (N === NORMAL || N === SCANLINE) {
          sd.set(d.subarray(datap, datap + count), sline);
        } else if (N === COLOR) {
          sd.fill(color, sline, sline + count);
        } else if (N === PREDATOR) {
          sd.copyWithin(sline, sline + 2 * this.w, sline + 2 * this.w + count);
        } else if (N === REMAP) {
          for (let s = sline, s2 = datap; count--;) sd[s++] = map![d[s2++]];
        } else if (N === REMAP2) {
          for (let s = sline, s2 = datap; count--;) sd[s++] = map2![map![d[s2++]]];
        } else if (N === FADE || N === FADE_TINT) {
          const pa = paddr!;
          for (let s = sline, s3 = datap; count--; s++) {
            const p1 = 3 * sd[s];
            const p2 = 3 * (N === FADE_TINT ? tint![d[s3++]] : d[s3++]);
            const r = ((((pa[p1] - pa[p2]) * mul) >> 16) + pa[p2]) & 0xff;
            const g = ((((pa[p1 + 1] - pa[p2 + 1]) * mul) >> 16) + pa[p2 + 1]) & 0xff;
            const b = ((((pa[p1 + 2] - pa[p2 + 2]) * mul) >> 16) + pa[p2 + 2]) & 0xff;
            sd[s] = f!.Lookup(r >> 3, g >> 3, b >> 3);
          }
        }
        datap += todo;
        ix += todo;
        sline += todo;
      }
      sline += sw - this.w;
    }
  }

  PutImage(screen: image, x: number, y: number): void {
    this.put(NORMAL, screen, x, y, 0, null, null, 0, 1, null, null, null);
  }
  PutRemap(screen: image, x: number, y: number, map: Uint8Array): void {
    this.put(REMAP, screen, x, y, 0, map, null, 0, 1, null, null, null);
  }
  PutDoubleRemap(screen: image, x: number, y: number, map: Uint8Array, map2: Uint8Array): void {
    this.put(REMAP2, screen, x, y, 0, map, map2, 0, 1, null, null, null);
  }
  PutFade(screen: image, x: number, y: number, amount: number, nframes: number, f: ColorFilter, pal: palette): void {
    this.put(FADE, screen, x, y, 0, null, null, amount, nframes, null, f, pal);
  }
  PutFadeTint(screen: image, x: number, y: number, amount: number, nframes: number, tint: Uint8Array, f: ColorFilter, pal: palette): void {
    this.put(FADE_TINT, screen, x, y, 0, null, null, amount, nframes, tint, f, pal);
  }
  PutColor(screen: image, x: number, y: number, color: number): void {
    this.put(COLOR, screen, x, y, color, null, null, 0, 1, null, null, null);
  }
  PutFilled(screen: image, x: number, y: number, color: number): void {
    this.put(FILLED, screen, x, y, color, null, null, 0, 1, null, null, null);
  }
  PutPredator(screen: image, x: number, y: number): void {
    this.put(PREDATOR, screen, x, y, 0, null, null, 0, 1, null, null, null);
  }
  PutScanLine(screen: image, x: number, y: number, line: number): void {
    this.put(SCANLINE, screen, x, y, 0, null, null, line, 1, null, null, null);
  }

  DiskUsage(): number {
    let ret = 0, di = 0;
    const d = this.m_data;
    for (let y = 0; y < this.h; y++) {
      for (let x = 0; x < this.w; x++) {
        x += d[di++];
        ret++;
        if (x >= this.w) break;
        const run = d[di++];
        ret += run + 1;
        di += run;
        x += run;
      }
    }
    return ret + 8 + 8;
  }
}
