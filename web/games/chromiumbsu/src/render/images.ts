// Chromium B.S.U. port (GPL-3.0-or-later, LICENSE.md): the textures. The original PNGs are decoded
// here (no colour management, no premultiplying: the bytes as the original's SDL_image saw them) and
// prepared as src/Image.cpp's SDL path does: grey becomes luminance (alpha 1), RGB keeps alpha 1, and
// the blend modes compute alpha from the colour (BLEND1: r+g+b clipped, BLEND2: (r+g+b)/2 clipped,
// BLEND3: (r+g+b)/3) for the rows y < width only, as the original's loop does (h = tmp->w).
import { unzlibSync } from 'fflate';
import {
  GL_CLAMP, GL_LINEAR, IMG_ALPHA, IMG_BLEND1, IMG_BLEND2, IMG_BLEND3, IMG_NOMIPMAPS, IMG_SOLID,
  type Images, type Texture,
} from '../gl.ts';
import type { WebGLRenderer } from './webgl.ts';

export interface Png {
  width: number;
  height: number;
  /** RGBA */
  rgba: Uint8Array;
}

/** a non-interlaced PNG of grey, grey+alpha, RGB or RGBA, 8 or 16 bits per channel */
export function decodePng(bytes: Uint8Array): Png {
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  let at = 8;
  let width = 0, height = 0, depth = 8, type = 6;
  const idat: Uint8Array[] = [];
  while (at < bytes.length) {
    const len = view.getUint32(at);
    const kind = String.fromCharCode(...bytes.subarray(at + 4, at + 8));
    const data = bytes.subarray(at + 8, at + 8 + len);
    if (kind === 'IHDR') {
      width = view.getUint32(at + 8);
      height = view.getUint32(at + 12);
      depth = bytes[at + 16];
      type = bytes[at + 17];
      if (bytes[at + 20]) throw new Error('interlaced PNG');
    } else if (kind === 'IDAT') idat.push(data);
    else if (kind === 'IEND') break;
    at += 12 + len;
  }
  const z = new Uint8Array(idat.reduce((n, d) => n + d.length, 0));
  let o = 0;
  for (const d of idat) { z.set(d, o); o += d.length; }
  const raw = unzlibSync(z);
  const channels = ({ 0: 1, 2: 3, 4: 2, 6: 4 } as Record<number, number>)[type];
  if (!channels) throw new Error(`PNG colour type ${type}`);
  const bpp = channels * (depth / 8);
  const stride = width * bpp;
  const out = new Uint8Array(height * stride);
  let prev = new Uint8Array(stride);
  for (let y = 0; y < height; y++) {
    const filter = raw[y * (stride + 1)];
    const line = raw.subarray(y * (stride + 1) + 1, (y + 1) * (stride + 1));
    const cur = out.subarray(y * stride, (y + 1) * stride);
    for (let x = 0; x < stride; x++) {
      const a = x >= bpp ? cur[x - bpp] : 0;
      const b = prev[x];
      const c = x >= bpp ? prev[x - bpp] : 0;
      let v = line[x];
      switch (filter) {
        case 1: v += a; break;
        case 2: v += b; break;
        case 3: v += (a + b) >> 1; break;
        case 4: {
          const p = a + b - c;
          const pa = Math.abs(p - a), pb = Math.abs(p - b), pc = Math.abs(p - c);
          v += pa <= pb && pa <= pc ? a : pb <= pc ? b : c;
          break;
        }
      }
      cur[x] = v & 255;
    }
    prev = cur;
  }
  const rgba = new Uint8Array(width * height * 4);
  const step = depth / 8;
  for (let i = 0; i < width * height; i++) {
    const s = (k: number) => out[i * bpp + k * step]; // the high byte of 16-bit samples
    let r: number, g: number, b: number, al = 255;
    if (channels === 1) r = g = b = s(0);
    else if (channels === 2) { r = g = b = s(0); al = s(1); }
    else { r = s(0); g = s(1); b = s(2); if (channels === 4) al = s(3); }
    rgba.set([r, g, b, al], i * 4);
  }
  return { width, height, rgba };
}

/** Image::load's alpha for the blend types */
export function blendAlpha(png: Png, trans: number): Uint8Array {
  const rgba = new Uint8Array(png.rgba);
  if (trans === IMG_SOLID || trans === IMG_ALPHA) return rgba;
  const w = png.width;
  const rows = Math.min(w, png.height); // the original loops y < w
  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < w; x++) {
      const p = (y * w + x) * 4;
      const a = rgba[p] + rgba[p + 1] + rgba[p + 2];
      if (trans === IMG_BLEND1) rgba[p + 3] = a > 255 ? 255 : a;
      else if (trans === IMG_BLEND2) rgba[p + 3] = a > 0x1fe ? 255 : a >> 1;
      else if (trans === IMG_BLEND3) rgba[p + 3] = Math.floor(a / 3);
    }
  }
  return rgba;
}

/** Image::load on decoded PNGs; GL_CLAMP becomes clamp-to-edge (WebGL has no border) */
export class ImageLoader implements Images {
  private readonly pngs: Map<string, Png>;
  private readonly gl: WebGLRenderer;
  private readonly cache = new Map<string, Texture>();

  constructor(gl: WebGLRenderer, pngs: Map<string, Png>) {
    this.gl = gl;
    this.pngs = pngs;
  }

  load(file: string, mipmap = IMG_NOMIPMAPS, trans = IMG_ALPHA, wrap = GL_CLAMP, min = GL_LINEAR, mag = GL_LINEAR): Texture {
    const key = `${file} ${mipmap} ${trans} ${wrap} ${min} ${mag}`;
    const hit = this.cache.get(key);
    if (hit) return hit;
    const png = this.pngs.get(file);
    if (!png) throw new Error(`no texture ${file}`);
    const g = this.gl.gl;
    const wrapGL = wrap === GL_CLAMP ? g.CLAMP_TO_EDGE : wrap;
    const t = this.gl.upload(file, blendAlpha(png, trans), png.width, png.height, mipmap !== IMG_NOMIPMAPS, wrapGL, min, mag);
    this.cache.set(key, t);
    return t;
  }
}
