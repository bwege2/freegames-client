// No Gravity port (GPL-3.0-or-later; translated in 2026 by the freegames project from realtech VR's
// No Gravity 2.0, GPL-2.0-or-later; LICENSE.md): the pictures. PNG_unpack (rlx32/src/gx_png.c) reads
// the PNGs of the data: 8-bit palette pictures (sprites, fonts, textures) and 24-bit RGB pictures
// (the full-screen backgrounds). As there, a palette picture keeps its indices and palette; the
// renderers make index 0 transparent where the original uploads with a colour key
// (RGB_SmartConverter, gx_rgb.c: alpha = index ? 255 : 0).
import { unzlibSync } from 'fflate';

export interface Picture {
  width: number;
  height: number;
  /** palette indices (8-bit palette pictures) or null */
  indices: Uint8Array | null;
  /** 256 x RGB */
  palette: Uint8Array;
  /** RGBA, alpha 255 everywhere (the colour key is applied by whoever needs it) */
  rgba: Uint8Array;
}

export function decodePng(bytes: Uint8Array): Picture {
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  let at = 8;
  let width = 0, height = 0, depth = 8, type = 6;
  const idat: Uint8Array[] = [];
  const palette = new Uint8Array(768);
  let hasPalette = false;
  while (at < bytes.length) {
    const len = view.getUint32(at);
    const kind = String.fromCharCode(bytes[at + 4], bytes[at + 5], bytes[at + 6], bytes[at + 7]);
    const data = bytes.subarray(at + 8, at + 8 + len);
    if (kind === 'IHDR') {
      width = view.getUint32(at + 8);
      height = view.getUint32(at + 12);
      depth = bytes[at + 16];
      type = bytes[at + 17];
      if (bytes[at + 20]) throw new Error('interlaced PNG');
    } else if (kind === 'PLTE') { palette.set(data.subarray(0, 768)); hasPalette = true; }
    else if (kind === 'IDAT') idat.push(data);
    else if (kind === 'IEND') break;
    at += 12 + len;
  }
  if (!hasPalette) for (let i = 0; i < 256; i++) palette[3 * i] = palette[3 * i + 1] = palette[3 * i + 2] = i;
  const z = new Uint8Array(idat.reduce((n, d) => n + d.length, 0));
  let o = 0;
  for (const d of idat) { z.set(d, o); o += d.length; }
  const raw = unzlibSync(z);
  const channels = ({ 0: 1, 2: 3, 3: 1, 4: 2, 6: 4 } as Record<number, number>)[type];
  if (!channels) throw new Error(`PNG colour type ${type}`);
  const bitsPerPixel = channels * depth;
  const stride = Math.ceil((width * bitsPerPixel) / 8);
  const bpp = Math.max(1, bitsPerPixel >> 3);
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
  const n = width * height;
  const rgba = new Uint8Array(n * 4);
  let indices: Uint8Array | null = null;
  if (type === 3 || (type === 0 && depth <= 8)) {
    indices = new Uint8Array(n);
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        let v: number;
        if (depth === 8) v = out[y * stride + x];
        else {
          const bit = x * depth;
          v = (out[y * stride + (bit >> 3)] >> (8 - depth - (bit & 7))) & ((1 << depth) - 1);
          if (type === 0) v = Math.round((v * 255) / ((1 << depth) - 1));
        }
        indices[y * width + x] = v;
      }
    }
    for (let i = 0; i < n; i++) {
      const k = indices[i] * 3;
      rgba[4 * i] = palette[k]; rgba[4 * i + 1] = palette[k + 1]; rgba[4 * i + 2] = palette[k + 2]; rgba[4 * i + 3] = 255;
    }
  } else {
    const step = depth / 8;
    for (let i = 0; i < n; i++) {
      const s = (k: number): number => out[i * bpp + k * step];
      if (channels <= 2) { rgba[4 * i] = rgba[4 * i + 1] = rgba[4 * i + 2] = s(0); }
      else { rgba[4 * i] = s(0); rgba[4 * i + 1] = s(1); rgba[4 * i + 2] = s(2); }
      rgba[4 * i + 3] = 255;
    }
  }
  return { width, height, indices, palette, rgba };
}

/** RGBA with index 0 transparent (the colour key of the original's uploads) */
export function keyedRgba(p: Picture): Uint8Array {
  const out = new Uint8Array(p.rgba);
  if (p.indices) for (let i = 0; i < p.indices.length; i++) if (!p.indices[i]) out[4 * i + 3] = 0;
  return out;
}
