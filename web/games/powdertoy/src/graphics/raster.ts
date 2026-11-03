// graphics/Pixel.h (RGB/RGBA arithmetic), common/RasterGeometry.h, graphics/RasterDrawMethods.h +
// RasterDrawMethodsImpl.h, graphics/VideoBuffer.h + Graphics.h + Graphics.cpp.
//
// Pixels: a buffer is a Uint32Array of `pixel` as in the C++: 0x00RRGGBB (blue in the low byte, the top byte 0).
// toCanvasPixels() converts a buffer for an ImageData (little endian 0xAABBGGRR with alpha 255).
//
// Colours are numbers: an RGB is 0xRRGGBB (`0x123456_rgb` is `0x123456`), an RGBA is 0xAARRGGBB as an unsigned
// number (`0x123456_rgb .WithAlpha(a)` is `WithAlpha(0x123456, a)`, `RGBA(r, g, b, a)` is `RGBA(r, g, b, a)`).
//
// The methods take plain ints instead of Vec2 / Rect (no allocation per pixel):
//   DrawPixel(Vec2 pos, RGB c)            -> DrawPixel(x, y, c)
//   DrawLine(Vec2 p1, Vec2 p2, RGB c)     -> DrawLine(x1, y1, x2, y2, c)
//   DrawRect(RectSized(pos, size), RGB c) -> DrawRect(x, y, w, h, c)   (RectBetween(a, b): w = b.X - a.X + 1)
//   BlendText(Vec2 pos, String s, RGBA c) -> BlendText(x, y, s, c), returns { X, Y }
import { FONT_H, FontReader, fontCharWidth } from './font.ts';
import * as I from './icons.ts';
import { WINDOWW, WINDOWH } from '../sim/config.ts';

// ---------------------------------------------------------------------------------------------------------------
// Pixel.h

/** RGBA(r, g, b, a) packed as 0xAARRGGBB (unsigned); each component keeps its low 8 bits as uint8_t does */
export function RGBA(r: number, g: number, b: number, a = 0xFF): number {
  return (((a & 0xFF) << 24) | ((r & 0xFF) << 16) | ((g & 0xFF) << 8) | (b & 0xFF)) >>> 0;
}
/** RGB::WithAlpha */
export function WithAlpha(rgb: number, a: number): number {
  return (((a & 0xFF) << 24) | (rgb & 0xFFFFFF)) >>> 0;
}
/** RGBA::NoAlpha */
export function NoAlpha(rgba: number): number {
  return rgba & 0xFFFFFF;
}
export function AlphaOf(rgba: number): number {
  return rgba >>> 24;
}
/** RGB(r, g, b).Pack() */
export function RGB(r: number, g: number, b: number): number {
  return ((r & 0xFF) << 16) | ((g & 0xFF) << 8) | (b & 0xFF);
}

/** RGB::Blend(RGBA): px is a pixel, the result too */
export function Blend(px: number, rgba: number): number {
  const a = rgba >>> 24;
  if (a === 0xFF) return rgba & 0xFFFFFF;
  const na = 0xFF - a;
  const r = ((a * ((rgba >>> 16) & 0xFF) + na * ((px >>> 16) & 0xFF)) / 0xFF) | 0;
  const g = ((a * ((rgba >>> 8) & 0xFF) + na * ((px >>> 8) & 0xFF)) / 0xFF) | 0;
  const b = ((a * (rgba & 0xFF) + na * (px & 0xFF)) / 0xFF) | 0;
  return (r << 16) | (g << 8) | b;
}

/** RGB::Add(RGBA) */
export function Add(px: number, rgba: number): number {
  const a = rgba >>> 24;
  let r = ((px >>> 16) & 0xFF) + (((a * ((rgba >>> 16) & 0xFF)) / 0xFF) | 0);
  let g = ((px >>> 8) & 0xFF) + (((a * ((rgba >>> 8) & 0xFF)) / 0xFF) | 0);
  let b = (px & 0xFF) + (((a * (rgba & 0xFF)) / 0xFF) | 0);
  if (r > 0xFF) r = 0xFF;
  if (g > 0xFF) g = 0xFF;
  if (b > 0xFF) b = 0xFF;
  return (r << 16) | (g << 8) | b;
}

/** RGB::AddFire(RGB other, int fireAlpha) */
export function AddFire(px: number, other: number, fireAlpha: number): number {
  let r = ((px >>> 16) & 0xFF) + (((fireAlpha * ((other >>> 16) & 0xFF)) / 0xFF) | 0);
  let g = ((px >>> 8) & 0xFF) + (((fireAlpha * ((other >>> 8) & 0xFF)) / 0xFF) | 0);
  let b = (px & 0xFF) + (((fireAlpha * (other & 0xFF)) / 0xFF) | 0);
  if (r > 0xFF) r = 0xFF;
  if (g > 0xFF) g = 0xFF;
  if (b > 0xFF) b = 0xFF;
  return ((r & 0xFF) << 16) | ((g & 0xFF) << 8) | (b & 0xFF);
}

/** RGB::Decay: decrement each component that is nonzero */
export function Decay(px: number): number {
  const colour = px & 0xFFFFFF;
  let mask = colour;
  mask |= mask >>> 4;
  mask |= mask >>> 2;
  mask |= mask >>> 1;
  mask &= 0x00010101;
  return (colour - mask) & 0xFFFFFF;
}

/** RGB::Inverse */
export function Inverse(rgb: number): number {
  return (~rgb) & 0xFFFFFF;
}

/** pixel buffer (0x00RRGGBB) to ImageData pixels (Uint32Array view of ImageData.data, little endian) */
export function toCanvasPixels(src: Uint32Array, dst: Uint32Array, count = src.length): void {
  for (let i = 0; i < count; i++) {
    const p = src[i];
    dst[i] = (0xFF000000 | ((p & 0xFF) << 16) | (p & 0xFF00) | ((p >>> 16) & 0xFF)) >>> 0;
  }
}

// ---------------------------------------------------------------------------------------------------------------
// common/RasterGeometry.h

export type PointFn = (x: number, y: number) => void;

/** rasterizeLineZW<Ortho>: f(z, w) */
function rasterizeLineZW(ortho: boolean, dz: number, dw: number, f: (z: number, w: number) => void): void {
  const incW = dw >= 0 ? 1 : -1;
  let w = 0, err = 0;
  for (let z = 0; z <= dz; z++) {
    f(z, w);
    err += 2 * dw * incW;
    if (err >= dz) {
      w += incW;
      err -= 2 * dz;
      if (ortho && z < dz) f(z, w);
    }
  }
}

/** RasterizeLine<Ortho>(p1, p2, f): f is called for every point of the line */
export function RasterizeLine(ortho: boolean, x1: number, y1: number, x2: number, y2: number, f: PointFn): void {
  if (Math.abs(x1 - x2) >= Math.abs(y1 - y2)) {
    const sx = x1 < x2 ? x1 : x2, sy = x1 < x2 ? y1 : y2;
    const dx = x1 < x2 ? x2 - x1 : x1 - x2, dy = x1 < x2 ? y2 - y1 : y1 - y2;
    rasterizeLineZW(ortho, dx, dy, (z, w) => f(sx + z, sy + w));
  } else {
    const sx = y1 < y2 ? x1 : x2, sy = y1 < y2 ? y1 : y2;
    const dx = y1 < y2 ? x2 - x1 : x1 - x2, dy = y1 < y2 ? y2 - y1 : y1 - y2;
    rasterizeLineZW(ortho, dy, dx, (z, w) => f(sx + w, sy + z));
  }
}

const fr = Math.fround;

/** rasterizeEllipseQuadrant(radiusSquared, f(x1, x2, y)) */
function rasterizeEllipseQuadrant(rsX: number, rsY: number, f: (x1: number, x2: number, y: number) => void): void {
  rsX = fr(rsX); rsY = fr(rsY);
  const prod = fr(rsX * rsY);
  const inEllipse = (x: number, y: number) => fr(fr(fr(y * y) * rsX) + fr(fr(x * x) * rsY)) <= prod;
  let x = Math.floor(fr(Math.sqrt(rsX))) | 0;
  const maxY = Math.floor(fr(Math.sqrt(rsY))) | 0;
  for (let y = 0; y <= maxY; y++) {
    if (inEllipse(x, y + 1)) {
      f(x, x, y);
    } else {
      const xStart = x;
      do {
        x--;
      } while (x >= 0 && !inEllipse(x, y + 1));
      f(x + 1, xStart, y);
    }
  }
}

/** RasterizeEllipsePoints: f(dx, dy) for every point on the boundary */
export function RasterizeEllipsePoints(rsX: number, rsY: number, f: PointFn): void {
  rasterizeEllipseQuadrant(rsX, rsY, (x1, x2, y) => {
    for (let x = x1; x <= x2; x++) {
      f(x, y);
      if (x) f(-x, y);
      if (y) f(x, -y);
      if (x && y) f(-x, -y);
    }
  });
}

/** RasterizeEllipseRows: f(xLim, dy) for every row */
export function RasterizeEllipseRows(rsX: number, rsY: number, f: (xLim: number, dy: number) => void): void {
  rasterizeEllipseQuadrant(rsX, rsY, (_x1, xLim, y) => {
    f(xLim, y);
    if (y) f(xLim, -y);
  });
}

/** RasterizeRect(RectSized(x, y, w, h), f) */
export function RasterizeRect(rx: number, ry: number, rw: number, rh: number, f: PointFn): void {
  for (let x = rx; x < rx + rw; x++) f(x, ry);
  if (ry !== ry + rh - 1)
    for (let x = rx; x < rx + rw; x++) f(x, ry + rh - 1);
  // corners already drawn
  for (let y = ry + 1; y < ry + rh - 1; y++) f(rx, y);
  if (rx !== rx + rw - 1)
    for (let y = ry + 1; y < ry + rh - 1; y++) f(rx + rw - 1, y);
}

/** RasterizeDottedRect */
export function RasterizeDottedRect(rx: number, ry: number, rw: number, rh: number, f: PointFn): void {
  for (let x = rx; x < rx + rw; x += 2) f(x, ry);
  const bottomOff = (ry + rh - 1 - ry) % 2;
  if (ry !== ry + rh - 1)
    for (let x = rx + bottomOff; x < rx + rw; x += 2) f(x, ry + rh - 1);
  // corners already drawn
  for (let y = ry + 1 + 1; y < ry + rh - 1; y += 2) f(rx, y);
  const leftOff = (rx + rw - 1 - rx + 1) % 2;
  if (rx !== rx + rw - 1)
    for (let y = ry + 1 + leftOff; y < ry + rh - 1; y += 2) f(rx + rw - 1, y);
}

// ---------------------------------------------------------------------------------------------------------------
// RasterDrawMethods

export interface Size { X: number; Y: number }

const sharedReader: { r: FontReader | null } = { r: null };
function reader(ch: number): FontReader {
  if (!sharedReader.r) sharedReader.r = new FontReader(ch);
  else sharedReader.r.reset(ch);
  return sharedReader.r;
}

/** RasterDrawMethods::CharWidth */
export function CharWidth(ch: number): number {
  return fontCharWidth(ch);
}

/** code unit at i of a String (UTF-32 in C++); a surrogate pair counts as its code point */
function charAt(str: string, i: number): number {
  return str.codePointAt(i)!;
}

/**
 * RasterDrawMethods::TextSize: considers the first line to be FONT_H-2 tall with successive lines adding FONT_H
 * each
 */
export function TextSize(str: string): Size {
  const size = { X: 0, Y: FONT_H - 2 };
  let curX = 0; // characters have 1px of spacing between them
  for (let i = 0; i < str.length; i++) {
    const c = charAt(str, i);
    if (c === 0x0A) {
      size.X = Math.max(curX, size.X);
      size.Y += FONT_H;
      curX = 0;
    } else if (c === 0x0F) {
      if (str.length <= i + 3) break;
      i += 3;
    } else if (c === 0x0E) continue;
    else if (c === 0x01) continue;
    else if (c === 0x08) {
      if (str.length <= i + 1) break;
      i++;
    } else {
      curX += CharWidth(c);
      if (c > 0xFFFF) i++;
    }
  }
  size.X = Math.max(curX, size.X);
  return size;
}

/** RasterDrawMethods::TextFit: index (in str) of the end of an initial portion of text that fits in width */
export function TextFit(str: string, width: number): number {
  let curX = 0;
  for (let i = 0; i < str.length; i++) {
    const c = charAt(str, i);
    if (c === 0x0A) curX = 0;
    else if (c === 0x0F) {
      if (str.length <= i + 3) break;
      i += 3;
    } else if (c === 0x0E) continue;
    else if (c === 0x01) continue;
    else if (c === 0x08) {
      if (str.length <= i + 1) break;
      i++;
    } else {
      const dx = CharWidth(c);
      if (curX + ((dx / 2) | 0) >= width) return i;
      curX += dx;
      if (c > 0xFFFF) i++;
    }
  }
  return str.length;
}

/**
 * The drawing methods of VideoBuffer, Graphics and Renderer (RasterDrawMethods<Derived>). `video` is the pixel
 * buffer (row stride = width), the clip rect is (clipX, clipY, clipW, clipH): the whole buffer except for
 * Graphics, whose SwapClipRect changes it.
 */
export class RasterDrawMethods {
  video: Uint32Array;
  width: number;
  height: number;
  clipX = 0;
  clipY = 0;
  clipW: number;
  clipH: number;

  constructor(width: number, height: number, video?: Uint32Array) {
    this.width = width;
    this.height = height;
    this.video = video ?? new Uint32Array(width * height);
    this.clipW = width;
    this.clipH = height;
  }

  static CharWidth = CharWidth;
  static TextSize = TextSize;
  static TextFit = TextFit;

  Size(): Size {
    return { X: this.width, Y: this.height };
  }

  Data(): Uint32Array {
    return this.video;
  }

  GetClipRect(): { pos: Size; size: Size } {
    return { pos: { X: this.clipX, Y: this.clipY }, size: { X: this.clipW, Y: this.clipH } };
  }

  protected contains(x: number, y: number): boolean {
    return x >= this.clipX && x < this.clipX + this.clipW && y >= this.clipY && y < this.clipY + this.clipH;
  }

  // drawPixelUnchecked / blendPixelUnchecked / xorPixelUnchecked
  protected blendPixelUnchecked(x: number, y: number, rgba: number): void {
    const o = y * this.width + x;
    this.video[o] = Blend(this.video[o], rgba);
  }

  protected xorPixelUnchecked(x: number, y: number): void {
    const o = y * this.width + x;
    const c = this.video[o];
    if (2 * ((c >>> 16) & 0xFF) + 3 * ((c >>> 8) & 0xFF) + (c & 0xFF) < 512) this.video[o] = 0xC0C0C0;
    else this.video[o] = 0x404040;
  }

  DrawPixel(x: number, y: number, rgb: number): void {
    if (this.contains(x, y)) this.video[y * this.width + x] = rgb & 0xFFFFFF;
  }

  BlendPixel(x: number, y: number, rgba: number): void {
    if (this.contains(x, y)) {
      const o = y * this.width + x;
      this.video[o] = Blend(this.video[o], rgba);
    }
  }

  AddPixel(x: number, y: number, rgba: number): void {
    if (this.contains(x, y)) {
      const o = y * this.width + x;
      this.video[o] = Add(this.video[o], rgba);
    }
  }

  AddFirePixel(x: number, y: number, rgb: number, fireAlpha: number): void {
    if (this.contains(x, y)) {
      const o = y * this.width + x;
      this.video[o] = AddFire(this.video[o], rgb, fireAlpha);
    }
  }

  XorPixel(x: number, y: number): void {
    if (this.contains(x, y)) this.xorPixelUnchecked(x, y);
  }

  DrawLine(x1: number, y1: number, x2: number, y2: number, rgb: number): void {
    RasterizeLine(false, x1, y1, x2, y2, (x, y) => this.DrawPixel(x, y, rgb));
  }

  BlendLine(x1: number, y1: number, x2: number, y2: number, rgba: number): void {
    RasterizeLine(false, x1, y1, x2, y2, (x, y) => this.BlendPixel(x, y, rgba));
  }

  AddLine(x1: number, y1: number, x2: number, y2: number, rgba: number): void {
    RasterizeLine(false, x1, y1, x2, y2, (x, y) => this.AddPixel(x, y, rgba));
  }

  XorLine(x1: number, y1: number, x2: number, y2: number): void {
    RasterizeLine(false, x1, y1, x2, y2, (x, y) => this.XorPixel(x, y));
  }

  DrawRect(x: number, y: number, w: number, h: number, rgb: number): void {
    RasterizeRect(x, y, w, h, (px, py) => this.DrawPixel(px, py, rgb));
  }

  BlendRect(x: number, y: number, w: number, h: number, rgba: number): void {
    RasterizeRect(x, y, w, h, (px, py) => this.BlendPixel(px, py, rgba));
  }

  XorDottedRect(x: number, y: number, w: number, h: number): void {
    RasterizeDottedRect(x, y, w, h, (px, py) => this.XorPixel(px, py));
  }

  /** rect & clipRect as [x0, y0, x1, y1) (empty: x1 <= x0 or y1 <= y0) */
  private clipped(x: number, y: number, w: number, h: number): [number, number, number, number] {
    const x0 = Math.max(x, this.clipX), y0 = Math.max(y, this.clipY);
    const x1 = Math.min(x + w, this.clipX + this.clipW), y1 = Math.min(y + h, this.clipY + this.clipH);
    return [x0, y0, x1, y1];
  }

  DrawFilledRect(x: number, y: number, w: number, h: number, rgb: number): void {
    const [x0, y0, x1, y1] = this.clipped(x, y, w, h);
    if (x1 > x0 && y1 > y0) {
      const packed = rgb & 0xFFFFFF;
      for (let yy = y0; yy < y1; yy++) this.video.fill(packed, yy * this.width + x0, yy * this.width + x1);
    }
  }

  BlendFilledRect(x: number, y: number, w: number, h: number, rgba: number): void {
    const [x0, y0, x1, y1] = this.clipped(x, y, w, h);
    for (let yy = y0; yy < y1; yy++)
      for (let xx = x0; xx < x1; xx++) this.blendPixelUnchecked(xx, yy, rgba);
  }

  /** BlendEllipse(center, size, colour) */
  BlendEllipse(cx: number, cy: number, sx: number, sy: number, rgba: number): void {
    RasterizeEllipsePoints(sx * sx, sy * sy, (dx, dy) => this.BlendPixel(cx + dx, cy + dy, rgba));
  }

  /** BlendFilledEllipse(center, size, colour) */
  BlendFilledEllipse(cx: number, cy: number, sx: number, sy: number, rgba: number): void {
    RasterizeEllipseRows(sx * sx, sy * sy, (xLim, dy) => {
      // clipRect() & RectBetween(center + (-xLim, dy), center + (xLim, dy))
      const [x0, y0, x1, y1] = this.clipped(cx - xLim, cy + dy, 2 * xLim + 1, 1);
      for (let yy = y0; yy < y1; yy++)
        for (let xx = x0; xx < x1; xx++) this.blendPixelUnchecked(xx, yy, rgba);
    });
  }

  /** BlendImage(pixel const *data, uint8_t alpha, Rect rect, size_t rowStride = rect.size.X) */
  BlendImage(data: Uint32Array, alpha: number, x: number, y: number, w: number, h: number, rowStride = w): void {
    const ox = x, oy = y;
    const [x0, y0, x1, y1] = this.clipped(x, y, w, h);
    if (x1 <= x0 || y1 <= y0) return;
    if ((alpha & 0xFF) === 0xFF) {
      for (let yy = y0; yy < y1; yy++) {
        const s = (x0 - ox) + (yy - oy) * rowStride;
        this.video.set(data.subarray(s, s + (x1 - x0)), yy * this.width + x0);
      }
    } else {
      for (let yy = y0; yy < y1; yy++)
        for (let xx = x0; xx < x1; xx++) {
          const px = data[(xx - ox) + (yy - oy) * rowStride];
          this.blendPixelUnchecked(xx, yy, WithAlpha(px, alpha));
        }
    }
  }

  /** XorImage(unsigned char const *data, Rect rect, size_t rowStride = rect.size.X) */
  XorImage(data: Uint8Array, x: number, y: number, w: number, h: number, rowStride = w): void {
    const ox = x, oy = y;
    const [x0, y0, x1, y1] = this.clipped(x, y, w, h);
    for (let yy = y0; yy < y1; yy++)
      for (let xx = x0; xx < x1; xx++)
        if (data[(xx - ox) + (yy - oy) * rowStride]) this.xorPixelUnchecked(xx, yy);
  }

  /** BlendRGBAImage(pixel_rgba const *data, Rect rect, size_t rowStride): data is 0xAARRGGBB */
  BlendRGBAImage(data: Uint32Array, x: number, y: number, w: number, h: number, rowStride = w): void {
    const ox = x, oy = y;
    const [x0, y0, x1, y1] = this.clipped(x, y, w, h);
    for (let yy = y0; yy < y1; yy++)
      for (let xx = x0; xx < x1; xx++)
        this.blendPixelUnchecked(xx, yy, data[(xx - ox) + (yy - oy) * rowStride] >>> 0);
  }

  /** returns the width of the character */
  BlendChar(x: number, y: number, ch: number, rgba: number): number {
    const r = reader(ch);
    const w = r.GetWidth();
    const rgb = rgba & 0xFFFFFF, a = rgba >>> 24;
    for (let oy = -2; oy < -2 + FONT_H; oy++)
      for (let ox = 0; ox < w; ox++) {
        const alpha = ((r.NextPixel() * a) / 3) | 0;
        this.BlendPixel(x + ox, y + oy, WithAlpha(rgb, alpha));
      }
    return w;
  }

  AddChar(x: number, y: number, ch: number, rgba: number): number {
    const r = reader(ch);
    const w = r.GetWidth();
    const rgb = rgba & 0xFFFFFF, a = rgba >>> 24;
    for (let oy = -2; oy < -2 + FONT_H; oy++)
      for (let ox = 0; ox < w; ox++) {
        const alpha = ((r.NextPixel() * a) / 3) | 0;
        this.AddPixel(x + ox, y + oy, WithAlpha(rgb, alpha));
      }
    return w;
  }

  /**
   * Returns the offset between the first character and the would-be-next character. Escapes: '\n', '\x0F' r g b
   * (colour from the next three characters), '\x0E' (back to the original colour), '\x01' (toggle invert), '\b'
   * followed by U (underline) or a colour letter w g o r l b t u.
   */
  BlendText(origX: number, origY: number, str: string, origColour: number): Size {
    let underline = false;
    let invert = false;
    let colour = origColour & 0xFFFFFF;
    const alpha = origColour >>> 24;
    let px = origX, py = origY;
    for (let i = 0; i < str.length; i++) {
      const c = charAt(str, i);
      if (c === 0x0A) {
        px = origX;
        py += FONT_H;
      } else if (c === 0x0F) {
        if (str.length <= i + 3) break;
        colour = RGB(charAt(str, i + 1), charAt(str, i + 2), charAt(str, i + 3));
        i += 3;
      } else if (c === 0x0E) {
        colour = origColour & 0xFFFFFF;
      } else if (c === 0x01) {
        invert = !invert;
        colour = Inverse(colour);
      } else if (c === 0x08) {
        if (str.length <= i + 1) break;
        let colourCode = true;
        switch (str[i + 1]) {
          case 'U': underline = !underline; colourCode = false; break;
          case 'w': colour = 0xFFFFFF; break;
          case 'g': colour = 0xC0C0C0; break;
          case 'o': colour = 0xFFD820; break;
          case 'r': colour = 0xFF0000; break;
          case 'l': colour = 0xFF4B4B; break;
          case 'b': colour = 0x0000FF; break;
          case 't': colour = 0x20AAFF; break;
          case 'u': colour = 0x9353D3; break;
        }
        if (colourCode && invert) colour = Inverse(colour);
        i++;
      } else {
        const dx = this.BlendChar(px, py, c, WithAlpha(colour, alpha));
        if (underline)
          for (let j = 0; j < dx; j++) this.BlendPixel(px + j, py + FONT_H, WithAlpha(colour, alpha));
        px += dx;
        if (c > 0xFFFF) i++;
      }
    }
    return { X: px - origX, Y: py - origY };
  }

  BlendTextOutline(x: number, y: number, str: string, rgba: number): Size {
    this.BlendText(x - 1, y - 1, str, WithAlpha(0x000000, 0x78));
    this.BlendText(x - 1, y + 1, str, WithAlpha(0x000000, 0x78));
    this.BlendText(x + 1, y - 1, str, WithAlpha(0x000000, 0x78));
    this.BlendText(x + 1, y + 1, str, WithAlpha(0x000000, 0x78));
    return this.BlendText(x, y, str, rgba);
  }

  Clear(): void {
    this.video.fill(0);
  }
}

// ---------------------------------------------------------------------------------------------------------------
// VideoBuffer.h / Graphics.cpp (VideoBuffer)

export class VideoBuffer extends RasterDrawMethods {
  /** VideoBuffer(Vec2 size), VideoBuffer(pixel const *data, Vec2 size[, size_t rowStride]) */
  constructor(width: number, height: number, data?: Uint32Array, rowStride = width) {
    super(width, height);
    if (data) {
      for (let y = 0; y < height; y++)
        this.video.set(data.subarray(rowStride * y, rowStride * y + width), y * width);
    }
  }

  Crop(x: number, y: number, w: number, h: number): void {
    const x0 = Math.max(x, 0), y0 = Math.max(y, 0);
    const x1 = Math.min(x + w, this.width), y1 = Math.min(y + h, this.height);
    const nw = Math.max(x1 - x0, 0), nh = Math.max(y1 - y0, 0);
    if (x0 === 0 && y0 === 0 && nw === this.width && nh === this.height) return;
    const nv = new Uint32Array(nw * nh);
    for (let yy = 0; yy < nh; yy++)
      nv.set(this.video.subarray((y0 + yy) * this.width + x0, (y0 + yy) * this.width + x0 + nw), yy * nw);
    this.video = nv;
    this.width = this.clipW = nw;
    this.height = this.clipH = nh;
  }

  /**
   * Resize(Vec2 size, bool resample): the resampling branch of the original (lanczos12 from resampler/) is not
   * ported; it is only used for save thumbnails. Both branches use the nearest-neighbour scaling here.
   */
  Resize(w: number, h: number, _resample = false): void {
    if (w === this.width && h === this.height) return;
    const nv = new Uint32Array(w * h);
    for (let y = 0; y < h; y++)
      for (let x = 0; x < w; x++) {
        const oldX = ((x * this.width) / w) | 0, oldY = ((y * this.height) / h) | 0;
        nv[y * w + x] = this.video[oldY * this.width + oldX];
      }
    this.video = nv;
    this.width = this.clipW = w;
    this.height = this.clipH = h;
  }

  /** Resize(float factor, bool resample) */
  ResizeFactor(factor: number, resample = false): void {
    this.Resize(Math.trunc(this.width * Math.fround(factor)), Math.trunc(this.height * Math.fround(factor)), resample);
  }

  /** Automatically choose a size to fit within the given box, keeping aspect ratio */
  ResizeToFit(boundX: number, boundY: number, resample = false): void {
    let sx = this.width, sy = this.height;
    if (sx > boundX || sy > boundY) {
      const ceilDiv = (a: number, b: number) => ((a / b) | 0) + ((a % b) ? 1 : 0);
      if (boundX * sy < boundY * sx) { const ny = ceilDiv(sy * boundX, sx); sx = boundX; sy = ny; }
      else { const nx = ceilDiv(sx * boundY, sy); sx = nx; sy = boundY; }
    }
    this.Resize(sx, sy, resample);
  }
}

// ---------------------------------------------------------------------------------------------------------------
// Graphics.h / Graphics.cpp (Graphics): the WINDOWW x WINDOWH window buffer

export class Graphics extends RasterDrawMethods {
  zoomWindowPosition = { X: 0, Y: 0 };
  zoomScopePosition = { X: 0, Y: 0 };
  zoomScopeSize = 32;
  zoomEnabled = false;
  ZFACTOR = 8;

  constructor() {
    super(WINDOWW, WINDOWH);
  }

  DumpFrame(): VideoBuffer {
    return new VideoBuffer(this.width, this.height, this.video);
  }

  Finalise(): void {
  }

  /** SwapClipRect(Rect &rect): sets the clip rect to rect & the window, returns the previous one */
  SwapClipRect(x: number, y: number, w: number, h: number): { pos: Size; size: Size } {
    const old = this.GetClipRect();
    const x0 = Math.max(x, 0), y0 = Math.max(y, 0);
    const x1 = Math.min(x + w, this.width), y1 = Math.min(y + h, this.height);
    this.clipX = x0; this.clipY = y0;
    this.clipW = Math.max(x1 - x0, 0); this.clipH = Math.max(y1 - y0, 0);
    return old;
  }

  draw_icon(x: number, y: number, icon: number, alpha = 255, invert = false): void {
    y--;
    const W = (c: number) => WithAlpha(c, alpha);
    switch (icon) {
      case I.IconOpen:
        this.BlendChar(x, y, 0xE001, W(invert ? 0x000000 : 0xFFFFFF));
        break;
      case I.IconReload:
        this.BlendChar(x, y, 0xE011, W(invert ? 0x000000 : 0xFFFFFF));
        break;
      case I.IconSave:
        this.BlendChar(x, y, 0xE002, W(invert ? 0x000000 : 0xFFFFFF));
        break;
      case I.IconVoteUp:
        if (invert) {
          this.BlendChar(x - 11, y + 1, 0xE04B, W(0x006400));
          this.BlendText(x + 2, y + 1, 'Vote', W(0x006400));
        } else {
          this.BlendChar(x - 11, y + 1, 0xE04B, W(0x00BB12));
          this.BlendText(x + 2, y + 1, 'Vote', W(0x00BB12));
        }
        break;
      case I.IconVoteDown:
        this.BlendChar(x, y, 0xE04A, W(invert ? 0x640A00 : 0xBB2800));
        break;
      case I.IconTag:
        this.BlendChar(x, y, 0xE003, W(invert ? 0x000000 : 0xFFFFFF));
        break;
      case I.IconNew:
        this.BlendChar(x, y, 0xE012, W(invert ? 0x000000 : 0xFFFFFF));
        break;
      case I.IconLogin:
        this.BlendChar(x, y + 1, 0xE004, W(invert ? 0x000000 : 0xFFFFFF));
        break;
      case I.IconSimulationSettings:
        this.BlendChar(x, y + 1, 0xE04F, W(invert ? 0x000000 : 0xFFFFFF));
        break;
      case I.IconRenderSettings:
        if (invert) {
          this.BlendChar(x, y + 1, 0xE058, W(0xFF0000));
          this.BlendChar(x, y + 1, 0xE059, W(0x00FF00));
          this.BlendChar(x, y + 1, 0xE05A, W(0x0000FF));
        } else {
          this.AddChar(x, y + 1, 0xE058, W(0xFF0000));
          this.AddChar(x, y + 1, 0xE059, W(0x00FF00));
          this.AddChar(x, y + 1, 0xE05A, W(0x0000FF));
        }
        break;
      case I.IconPause:
        this.BlendChar(x, y, 0xE010, W(invert ? 0x000000 : 0xFFFFFF));
        break;
      case I.IconFavourite:
        this.BlendChar(x, y, 0xE04C, W(invert ? 0x645020 : 0xC0A040));
        break;
      case I.IconReport:
        this.BlendChar(x, y, 0xE063, W(invert ? 0x8C8C00 : 0xFFFF00));
        break;
      case I.IconUsername:
        this.BlendChar(x, y, 0xE00B, W(0x204080));
        this.BlendChar(x, y, 0xE00A, W(invert ? 0x000000 : 0xFFFFFF));
        break;
      case I.IconPassword:
        this.BlendChar(x, y, 0xE00C, W(0xA09020));
        this.BlendChar(x, y, 0xE004, W(invert ? 0x000000 : 0xFFFFFF));
        break;
      case I.IconClose:
        this.BlendChar(x, y, 0xE02A, W(invert ? 0x141414 : 0xE6E6E6));
        break;
      case I.IconVoteSort:
        if (invert) {
          this.BlendChar(x, y, 0xE029, W(0x2C3020));
          this.BlendChar(x, y, 0xE028, W(0x202C20));
          this.BlendChar(x, y, 0xE027, W(0x808080));
        } else {
          this.BlendChar(x, y, 0xE029, W(0x903020));
          this.BlendChar(x, y, 0xE028, W(0x209020));
          this.BlendChar(x, y, 0xE027, W(0xFFFFFF));
        }
        break;
      case I.IconDateSort:
        this.BlendChar(x, y, 0xE026, W(invert ? 0x202020 : 0xFFFFFF));
        break;
      case I.IconMyOwn:
        this.BlendChar(x, y, 0xE014, W(0xC0A040));
        this.BlendChar(x, y, 0xE013, W(invert ? 0x202020 : 0xFFFFFF));
        break;
      case I.IconSearch:
        this.BlendChar(x, y, 0xE00E, W(0x1E1EB4));
        this.BlendChar(x, y, 0xE00F, W(0xFFFFFF));
        break;
      case I.IconDelete:
        this.BlendChar(x, y, 0xE006, W(0x9F2F1F));
        this.BlendChar(x, y, 0xE005, W(invert ? 0x000000 : 0xFFFFFF));
        break;
      case I.IconAdd:
        this.BlendChar(x, y, 0xE006, W(0x209020));
        this.BlendChar(x, y, 0xE009, W(invert ? 0x000000 : 0xFFFFFF));
        break;
      case I.IconVelocity:
        this.BlendChar(x + 1, y, 0xE018, W(0x80A0FF));
        break;
      case I.IconPressure:
        this.BlendChar(x + 1, y + 1, 0xE019, W(invert ? 0xB4A010 : 0xFFD420));
        break;
      case I.IconPersistant:
        this.BlendChar(x + 1, y + 1, 0xE01A, W(invert ? 0x141414 : 0xD4D4D4));
        break;
      case I.IconFire:
        this.BlendChar(x + 1, y + 1, 0xE01B, W(0xFF0000));
        this.BlendChar(x + 1, y + 1, 0xE01C, W(0xFFFF40));
        break;
      case I.IconBlob:
        this.BlendChar(x + 1, y, 0xE03F, W(invert ? 0x37B437 : 0x37FF37));
        break;
      case I.IconHeat:
        this.BlendChar(x + 3, y, 0xE03E, W(0xFF0000));
        this.BlendChar(x + 3, y, 0xE03D, W(invert ? 0x000000 : 0xFFFFFF));
        break;
      case I.IconBlur:
        this.BlendChar(x + 1, y, 0xE044, W(invert ? 0x3246B4 : 0x6496FF));
        break;
      case I.IconGradient:
        this.BlendChar(x + 1, y + 1, 0xE053, W(invert ? 0xFF32FF : 0xCD32CD));
        break;
      case I.IconLife:
        this.BlendChar(x, y + 1, 0xE060, W(invert ? 0x000000 : 0xFFFFFF));
        break;
      case I.IconEffect:
        this.BlendChar(x + 1, y, 0xE061, W(0xFFFFA0));
        break;
      case I.IconGlow:
        this.BlendChar(x + 1, y, 0xE05F, W(0xC8FFFF));
        break;
      case I.IconWarp:
        this.BlendChar(x + 1, y, 0xE05E, W(0xFFFFFF));
        break;
      case I.IconBasic:
        this.BlendChar(x + 1, y + 1, 0xE05B, W(invert ? 0x323200 : 0xFFFFC8));
        break;
      case I.IconAltAir:
        if (invert) {
          this.BlendChar(x + 1, y + 1, 0xE054, W(0xB43737));
          this.BlendChar(x + 1, y + 1, 0xE055, W(0x37B437));
        } else {
          this.BlendChar(x + 1, y + 1, 0xE054, W(0xFF3737));
          this.BlendChar(x + 1, y + 1, 0xE055, W(0x37FF37));
        }
        break;
      case I.IconVort:
        this.BlendChar(x + 1, y + 1, 0xE054, W(invert ? 0xA64D79 : 0xC27BA0));
        break;
      default:
        this.BlendChar(x, y, 't'.charCodeAt(0), W(invert ? 0x000000 : 0xFFFFFF));
        break;
    }
  }

  RenderZoom(): void {
    if (!this.zoomEnabled) return;
    const zw = this.zoomWindowPosition, zs = this.zoomScopePosition, size = this.zoomScopeSize, Z = this.ZFACTOR;
    this.DrawFilledRect(zw.X, zw.Y, size * Z, size * Z, 0x000000);
    this.DrawRect(zw.X - 2, zw.Y - 2, size * Z + 3, size * Z + 3, 0xC0C0C0);
    this.DrawRect(zw.X - 1, zw.Y - 1, size * Z + 1, size * Z + 1, 0x000000);
    const W = this.width;
    for (let j = 0; j < size; j++)
      for (let i = 0; i < size; i++) {
        const pix = this.video[(j + zs.Y) * W + i + zs.X];
        for (let y = 0; y < Z - 1; y++)
          for (let x = 0; x < Z - 1; x++)
            this.video[(j * Z + y + zw.Y) * W + i * Z + x + zw.X] = pix;
      }
    if (this.zoomEnabled) {
      for (let j = -1; j <= size; j++) {
        this.XorPixel(zs.X + j, zs.Y - 1);
        this.XorPixel(zs.X + j, zs.Y + size);
      }
      for (let j = 0; j < size; j++) {
        this.XorPixel(zs.X - 1, zs.Y + j);
        this.XorPixel(zs.X + size, zs.Y + j);
      }
    }
  }
}
