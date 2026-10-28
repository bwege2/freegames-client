// sdlgfx.c: the reduced SDL_gfxPrimitives (Andreas Schiffler) that Ballerburg SDL draws its lines,
// circles and polygons with, on its 32-bit XRGB8888 surface (the only depth it uses): the same clipping,
// the same line stepping, the same scan conversion and the same alpha blend, so every pixel comes out
// as in the original. Colours are 0xRRGGBBAA. The calls from outside are recorded like the oracle does.
//
// This is an altered version (a TypeScript port, freegames project) of sdlgfx.c, whose notice follows:
//
//   sdlgfx.c: This is a reduced version of Andreas Schiffler's SDL_gfxPrimitives.c, original copyright
//   follows:
//
//   SDL_gfxPrimitives.c: graphics primitives for SDL surfaces
//
//   Copyright (C) 2001-2012  Andreas Schiffler
//
//   This software is provided 'as-is', without any express or implied warranty. In no event will the
//   authors be held liable for any damages arising from the use of this software.
//
//   Permission is granted to anyone to use this software for any purpose, including commercial
//   applications, and to alter it and redistribute it freely, subject to the following restrictions:
//
//   1. The origin of this software must not be misrepresented; you must not claim that you wrote the
//   original software. If you use this software in a product, an acknowledgment in the product
//   documentation would be appreciated but is not required.
//
//   2. Altered source versions must be plainly marked as such, and must not be misrepresented as being
//   the original software.
//
//   3. This notice may not be removed or altered from any source distribution.
//
//   Andreas Schiffler -- aschiffler at ferzkopp dot net
import { SDL_MapSurfaceRGBA, rec, hex, type SDL_Surface } from './sdl.ts';

/** C's conversion to Sint16 */
const s16 = (v: number) => (v << 16) >> 16;

const RMASK = 0xff0000, GMASK = 0x00ff00, BMASK = 0x0000ff;

function blend(dc: number, color: number, alpha: number): number {
  const dR = (dc & RMASK) >>> 16, dG = (dc & GMASK) >>> 8, dB = dc & BMASK;
  const sR = (color & RMASK) >>> 16, sG = (color & GMASK) >>> 8, sB = color & BMASK;
  const R = ((dR + (((sR - dR) * alpha) >> 8)) << 16) & RMASK;
  const G = ((dG + (((sG - dG) * alpha) >> 8)) << 8) & GMASK;
  const B = (dB + (((sB - dB) * alpha) >> 8)) & BMASK;
  return (R | G | B) >>> 0;
}

function _putPixelAlpha(dst: SDL_Surface, x: number, y: number, color: number, alpha: number): number {
  const c = dst.clip;
  if (x >= c.x && x < c.x + c.w && y >= c.y && y < c.y + c.h) {
    const p = dst.pixels as Uint32Array;
    const i = y * dst.w + x;
    p[i] = alpha === 255 ? color : blend(p[i], color, alpha);
  }
  return 0;
}

function mapColor(dst: SDL_Surface, color: number): number {
  return SDL_MapSurfaceRGBA(dst, (color >>> 24) & 255, (color >>> 16) & 255, (color >>> 8) & 255, color & 255);
}

function _pixelColor(dst: SDL_Surface, x: number, y: number, color: number): number {
  return _putPixelAlpha(dst, s16(x), s16(y), mapColor(dst, color), color & 255);
}

const pixelColorNolock = _pixelColor;

function _filledRectAlpha(dst: SDL_Surface, x1: number, y1: number, x2: number, y2: number, color: number, alpha: number): number {
  const p = dst.pixels as Uint32Array;
  for (let y = y1; y <= y2; y = s16(y + 1)) {
    const row = y * dst.w;
    for (let x = x1; x <= x2; x = s16(x + 1)) {
      if (alpha === 255) p[row + x] = color;
      else p[row + x] = blend(p[row + x], color, alpha);
    }
  }
  return 0;
}

function filledRectAlpha(dst: SDL_Surface, x1: number, y1: number, x2: number, y2: number, color: number): number {
  return _filledRectAlpha(dst, s16(x1), s16(y1), s16(x2), s16(y2), mapColor(dst, color), color & 255);
}

function _hlineColor(dst: SDL_Surface, x1: number, x2: number, y: number, color: number): number {
  x1 = s16(x1); x2 = s16(x2); y = s16(y);
  const c = dst.clip;
  if (c.w === 0 || c.h === 0) return 0;
  if (x1 > x2) { const t = x1; x1 = x2; x2 = t; }
  const left = c.x;
  if (x2 < left) return 0;
  const right = c.x + c.w - 1;
  if (x1 > right) return 0;
  const top = c.y, bottom = c.y + c.h - 1;
  if (y < top || y > bottom) return 0;
  if (x1 < left) x1 = left;
  if (x2 > right) x2 = right;
  const dx = x2 - x1;
  if ((color & 255) === 255) {
    const m = mapColor(dst, color);
    (dst.pixels as Uint32Array).fill(m, y * dst.w + x1, y * dst.w + x1 + dx + 1);
    return 0;
  }
  return filledRectAlpha(dst, x1, y, x1 + dx, y, color);
}

function _vlineColor(dst: SDL_Surface, x: number, y1: number, y2: number, color: number): number {
  x = s16(x); y1 = s16(y1); y2 = s16(y2);
  const c = dst.clip;
  if (c.w === 0 || c.h === 0) return 0;
  if (y1 > y2) { const t = y1; y1 = y2; y2 = t; }
  const left = c.x, right = c.x + c.w - 1;
  if (x < left || x > right) return 0;
  const top = c.y;
  if (y2 < top) return 0;
  const bottom = c.y + c.h - 1;
  if (y1 > bottom) return 0;
  if (y1 < top) y1 = top;
  if (y2 > bottom) y2 = bottom;
  const h = s16(y2 - y1);
  if ((color & 255) === 255) {
    const m = mapColor(dst, color);
    const p = dst.pixels as Uint32Array;
    for (let i = y1 * dst.w + x, last = i + dst.w * h; i <= last; i += dst.w) p[i] = m;
    return 0;
  }
  return filledRectAlpha(dst, x, y1, x, y1 + h, color);
}

function _rectangleColor(dst: SDL_Surface, x1: number, y1: number, x2: number, y2: number, color: number): number {
  x1 = s16(x1); y1 = s16(y1); x2 = s16(x2); y2 = s16(y2);
  const c = dst.clip;
  if (c.w === 0 || c.h === 0) return 0;
  if (x1 === x2) {
    if (y1 === y2) return _pixelColor(dst, x1, y1, color);
    return _vlineColor(dst, x1, y1, y2, color);
  } else if (y1 === y2) {
    return _hlineColor(dst, x1, x2, y1, color);
  }
  if (x1 > x2) { const t = x1; x1 = x2; x2 = t; }
  if (y1 > y2) { const t = y1; y1 = y2; y2 = t; }
  let result = 0;
  result |= _hlineColor(dst, x1, x2, y1, color);
  result |= _hlineColor(dst, x1, x2, y2, color);
  y1 += 1;
  y2 -= 1;
  if (y1 <= y2) {
    result |= _vlineColor(dst, x1, y1, y2, color);
    result |= _vlineColor(dst, x2, y1, y2, color);
  }
  return result;
}

// ---------------------------------------------------------------- line clipping (Cohen-Sutherland)
const CLIP_LEFT_EDGE = 1, CLIP_RIGHT_EDGE = 2, CLIP_BOTTOM_EDGE = 4, CLIP_TOP_EDGE = 8;

function clipEncode(x: number, y: number, left: number, top: number, right: number, bottom: number): number {
  let code = 0;
  if (x < left) code |= CLIP_LEFT_EDGE;
  else if (x > right) code |= CLIP_RIGHT_EDGE;
  if (y < top) code |= CLIP_TOP_EDGE;
  else if (y > bottom) code |= CLIP_BOTTOM_EDGE;
  return code;
}

const f32 = Math.fround;

/** _clipLine: the line clipped to the surface, or null; the slope in float as the C code computes it */
function clipLine(dst: SDL_Surface, x1: number, y1: number, x2: number, y2: number): [number, number, number, number] | null {
  const c = dst.clip;
  const left = c.x, right = c.x + c.w - 1, top = c.y, bottom = c.y + c.h - 1;
  for (;;) {
    let code1 = clipEncode(x1, y1, left, top, right, bottom);
    let code2 = clipEncode(x2, y2, left, top, right, bottom);
    if (!(code1 | code2)) return [x1, y1, x2, y2];
    if (code1 & code2) return null;
    if (!code1) {
      let t = x2; x2 = x1; x1 = t;
      t = y2; y2 = y1; y1 = t;
      t = code2; code2 = code1; code1 = t;
    }
    const m = x2 !== x1 ? f32(f32(y2 - y1) / f32(x2 - x1)) : 1;
    if (code1 & CLIP_LEFT_EDGE) {
      y1 = s16(y1 + Math.trunc(f32(f32(left - x1) * m)));
      x1 = left;
    } else if (code1 & CLIP_RIGHT_EDGE) {
      y1 = s16(y1 + Math.trunc(f32(f32(right - x1) * m)));
      x1 = right;
    } else if (code1 & CLIP_BOTTOM_EDGE) {
      if (x2 !== x1) x1 = s16(x1 + Math.trunc(f32(f32(bottom - y1) / m)));
      y1 = bottom;
    } else if (code1 & CLIP_TOP_EDGE) {
      if (x2 !== x1) x1 = s16(x1 + Math.trunc(f32(f32(top - y1) / m)));
      y1 = top;
    }
  }
}

function _lineColor(dst: SDL_Surface, x1: number, y1: number, x2: number, y2: number, color: number): number {
  const cl = clipLine(dst, s16(x1), s16(y1), s16(x2), s16(y2));
  if (!cl) return 0;
  [x1, y1, x2, y2] = cl;
  if (x1 === x2) {
    if (y1 < y2) return _vlineColor(dst, x1, y1, y2, color);
    if (y1 > y2) return _vlineColor(dst, x1, y2, y1, color);
    return _pixelColor(dst, x1, y1, color);
  }
  if (y1 === y2) {
    if (x1 < x2) return _hlineColor(dst, x1, x2, y1, color);
    if (x1 > x2) return _hlineColor(dst, x2, x1, y1, color);
  }
  let dx = x2 - x1, dy = y2 - y1;
  const sx = dx >= 0 ? 1 : -1, sy = dy >= 0 ? 1 : -1;
  if ((color & 255) === 255) {
    const m = mapColor(dst, color);
    const p = dst.pixels as Uint32Array;
    dx = sx * dx + 1;
    dy = sy * dy + 1;
    let pixx = sx, pixy = sy * dst.w;
    let pixel = y1 * dst.w + x1;
    if (dx < dy) {
      let t = dx; dx = dy; dy = t;
      t = pixx; pixx = pixy; pixy = t;
    }
    for (let x = 0, y = 0; x < dx; x++, pixel += pixx) {
      p[pixel] = m;
      y += dy;
      if (y >= dx) {
        y -= dx;
        pixel += pixy;
      }
    }
  } else {
    const ax = Math.abs(dx) << 1, ay = Math.abs(dy) << 1;
    let x = x1, y = y1;
    if (ax > ay) {
      let d = ay - (ax >> 1);
      while (x !== x2) {
        pixelColorNolock(dst, x, y, color);
        if (d > 0 || (d === 0 && sx === 1)) {
          y += sy;
          d -= ax;
        }
        x += sx;
        d += ay;
      }
    } else {
      let d = ax - (ay >> 1);
      while (y !== y2) {
        pixelColorNolock(dst, x, y, color);
        if (d > 0 || (d === 0 && sy === 1)) {
          x += sx;
          d -= ay;
        }
        y += sy;
        d += ax;
      }
    }
    pixelColorNolock(dst, x, y, color);
  }
  return 0;
}

function _filledCircleColor(dst: SDL_Surface, x: number, y: number, rad: number, color: number): number {
  x = s16(x); y = s16(y); rad = s16(rad);
  const c = dst.clip;
  if (c.w === 0 || c.h === 0) return 0;
  if (rad < 0) return -1;
  if (rad === 0) return _pixelColor(dst, x, y, color);
  if (s16(x + rad) < c.x) return 0;
  if (s16(x - rad) > c.x + c.w - 1) return 0;
  if (s16(y + rad) < c.y) return 0;
  if (s16(y - rad) > c.y + c.h - 1) return 0;
  let cx = 0, cy = rad, ocx = -1, ocy = -1;
  let df = 1 - rad, d_e = 3, d_se = -2 * rad + 5;
  let result = 0;
  do {
    const xpcx = x + cx, xmcx = x - cx, xpcy = x + cy, xmcy = x - cy;
    if (ocy !== cy) {
      if (cy > 0) {
        result |= _hlineColor(dst, xmcx, xpcx, y + cy, color);
        result |= _hlineColor(dst, xmcx, xpcx, y - cy, color);
      } else {
        result |= _hlineColor(dst, xmcx, xpcx, y, color);
      }
      ocy = cy;
    }
    if (ocx !== cx) {
      if (cx !== cy) {
        if (cx > 0) {
          result |= _hlineColor(dst, xmcy, xpcy, y - cx, color);
          result |= _hlineColor(dst, xmcy, xpcy, y + cx, color);
        } else {
          result |= _hlineColor(dst, xmcy, xpcy, y, color);
        }
      }
      ocx = cx;
    }
    if (df < 0) {
      df += d_e;
      d_e += 2;
      d_se += 2;
    } else {
      df += d_se;
      d_e += 2;
      d_se += 4;
      cy--;
    }
    cx++;
  } while (cx <= cy);
  return result;
}

/** gfxPrimitivesPolyIntsGlobal: the scanline intersections, kept (and grown) from call to call as in C;
 * an odd count on a scanline reads the stale entry after the last one, as the original does */
let polyInts = new Int32Array(0);

export function gfxReset(): void {
  polyInts = new Int32Array(0);
}

function _filledPolygonColor(dst: SDL_Surface, vx: ArrayLike<number>, vy: ArrayLike<number>, n: number, color: number): number {
  const c = dst.clip;
  if (c.w === 0 || c.h === 0) return 0;
  if (n < 3) return -1;
  if (polyInts.length < n) {
    const grown = new Int32Array(n);
    grown.set(polyInts);
    polyInts = grown;
  }
  const pi = polyInts;
  let miny = vy[0], maxy = vy[0];
  for (let i = 1; i < n; i++) {
    if (vy[i] < miny) miny = vy[i];
    else if (vy[i] > maxy) maxy = vy[i];
  }
  let result = 0;
  for (let y = miny; y <= maxy; y++) {
    let ints = 0;
    for (let i = 0; i < n; i++) {
      const ind1 = i ? i - 1 : n - 1, ind2 = i ? i : 0;
      let y1 = vy[ind1], y2 = vy[ind2], x1: number, x2: number;
      if (y1 < y2) {
        x1 = vx[ind1];
        x2 = vx[ind2];
      } else if (y1 > y2) {
        y2 = vy[ind1];
        y1 = vy[ind2];
        x2 = vx[ind1];
        x1 = vx[ind2];
      } else {
        continue;
      }
      if ((y >= y1 && y < y2) || (y === maxy && y > y1 && y <= y2)) {
        pi[ints++] = Math.trunc((65536 * (y - y1)) / (y2 - y1)) * (x2 - x1) + 65536 * x1;
      }
    }
    pi.subarray(0, ints).sort();
    for (let i = 0; i < ints; i += 2) {
      let xa = (pi[i] + 1) | 0;
      xa = (xa >> 16) + ((xa & 32768) >> 15);
      let xb = ((i + 1 < pi.length ? pi[i + 1] : 0) - 1) | 0;
      xb = (xb >> 16) + ((xb & 32768) >> 15);
      result |= _hlineColor(dst, xa, xb, y, color);
    }
  }
  return result;
}

// ---------------------------------------------------------------- what screen.c and cannoneer.c call
export function lineColor(dst: SDL_Surface, x1: number, y1: number, x2: number, y2: number, color: number): number {
  rec?.(`L ${dst.id} ${s16(x1)} ${s16(y1)} ${s16(x2)} ${s16(y2)} ${hex(color)}`);
  return _lineColor(dst, x1, y1, x2, y2, color >>> 0);
}

export function rectangleColor(dst: SDL_Surface, x1: number, y1: number, x2: number, y2: number, color: number): number {
  rec?.(`R ${dst.id} ${s16(x1)} ${s16(y1)} ${s16(x2)} ${s16(y2)} ${hex(color)}`);
  return _rectangleColor(dst, x1, y1, x2, y2, color >>> 0);
}

export function rectangleRGBA(dst: SDL_Surface, x1: number, y1: number, x2: number, y2: number, r: number, g: number, b: number, a: number): number {
  rec?.(`Q ${dst.id} ${s16(x1)} ${s16(y1)} ${s16(x2)} ${s16(y2)} ${r & 255} ${g & 255} ${b & 255} ${a & 255}`);
  return _rectangleColor(dst, x1, y1, x2, y2, ((r & 255) << 24 | (g & 255) << 16 | (b & 255) << 8 | (a & 255)) >>> 0);
}

export function filledCircleColor(dst: SDL_Surface, x: number, y: number, rad: number, color: number): number {
  rec?.(`O ${dst.id} ${s16(x)} ${s16(y)} ${s16(rad)} ${hex(color)}`);
  return _filledCircleColor(dst, x, y, rad, color >>> 0);
}

export function filledPolygonColor(dst: SDL_Surface, vx: Int16Array, vy: Int16Array, n: number, color: number): number {
  if (rec) {
    let s = `P ${dst.id} ${n}`;
    for (let i = 0; i < n; i++) s += ` ${vx[i]},${vy[i]}`;
    rec(`${s} ${hex(color)}`);
  }
  return _filledPolygonColor(dst, vx, vy, n, color >>> 0);
}
