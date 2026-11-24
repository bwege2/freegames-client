// A small PNG reader for the original's solid masks (graphics/StdPNG.cpp is a libpng wrapper;
// the browser port only needs the pixels). 8-bit gray/RGB/RGBA/palette, no interlacing.
import { unzlibSync } from 'fflate';

export interface PngImage {
  width: number;
  height: number;
  /** RGBA, row-major */
  rgba: Uint8Array;
}

function u32(b: Uint8Array, o: number): number {
  return ((b[o] << 24) | (b[o + 1] << 16) | (b[o + 2] << 8) | b[o + 3]) >>> 0;
}

function paeth(a: number, b: number, c: number): number {
  const p = a + b - c;
  const pa = Math.abs(p - a), pb = Math.abs(p - b), pc = Math.abs(p - c);
  return pa <= pb && pa <= pc ? a : pb <= pc ? b : c;
}

/** decode a PNG; returns null for the shapes the original's solid masks do not use */
export function decodePng(file: Uint8Array): PngImage | null {
  if (file.length < 8 || file[0] !== 0x89 || file[1] !== 0x50 || file[2] !== 0x4e || file[3] !== 0x47) return null;
  let pos = 8;
  let width = 0, height = 0, depth = 0, color = 0, interlace = 0;
  let palette: Uint8Array | null = null;
  let trns: Uint8Array | null = null;
  const idat: Uint8Array[] = [];
  while (pos + 12 <= file.length) {
    const len = u32(file, pos);
    const type = String.fromCharCode(file[pos + 4], file[pos + 5], file[pos + 6], file[pos + 7]);
    const data = file.subarray(pos + 8, pos + 8 + len);
    pos += 12 + len;
    if (type === 'IHDR') {
      width = u32(data, 0); height = u32(data, 4);
      depth = data[8]; color = data[9]; interlace = data[12];
    } else if (type === 'PLTE') palette = data;
    else if (type === 'tRNS') trns = data;
    else if (type === 'IDAT') idat.push(data);
    else if (type === 'IEND') break;
  }
  if (!width || !height || interlace !== 0) return null;
  if (depth !== 8 && depth !== 16 && !(color === 0 || color === 3)) return null;
  const channels = color === 0 ? 1 : color === 2 ? 3 : color === 3 ? 1 : color === 4 ? 2 : color === 6 ? 4 : 0;
  if (!channels) return null;
  if (color === 3 && !palette) return null;

  let raw: Uint8Array;
  try {
    const all = new Uint8Array(idat.reduce((n, d) => n + d.length, 0));
    let o = 0;
    for (const d of idat) { all.set(d, o); o += d.length; }
    raw = unzlibSync(all);
  } catch { return null; }

  const bitsPerPixel = channels * depth;
  const rowBytes = Math.ceil(width * bitsPerPixel / 8);
  const bpp = Math.max(1, Math.ceil(bitsPerPixel / 8));
  const rows = new Uint8Array(rowBytes * height);
  let src = 0;
  for (let y = 0; y < height; y++) {
    if (src + 1 + rowBytes > raw.length) return null;
    const filter = raw[src++];
    const row = raw.subarray(src, src + rowBytes);
    src += rowBytes;
    const out = rows.subarray(y * rowBytes, (y + 1) * rowBytes);
    const prev = y ? rows.subarray((y - 1) * rowBytes, y * rowBytes) : null;
    for (let i = 0; i < rowBytes; i++) {
      const a = i >= bpp ? out[i - bpp] : 0;
      const b = prev ? prev[i] : 0;
      const c = prev && i >= bpp ? prev[i - bpp] : 0;
      let v = row[i];
      switch (filter) {
        case 0: break;
        case 1: v = (v + a) & 0xff; break;
        case 2: v = (v + b) & 0xff; break;
        case 3: v = (v + ((a + b) >> 1)) & 0xff; break;
        case 4: v = (v + paeth(a, b, c)) & 0xff; break;
        default: return null;
      }
      out[i] = v;
    }
  }

  const rgba = new Uint8Array(width * height * 4);
  const sample = (row: Uint8Array, index: number): number => {
    if (depth === 8) return row[index];
    if (depth === 16) return row[index * 2];       // high byte
    const perByte = 8 / depth;
    const b = row[Math.floor(index / perByte)];
    const shift = 8 - depth * ((index % perByte) + 1);
    return (b >> shift) & ((1 << depth) - 1);
  };
  for (let y = 0; y < height; y++) {
    const row = rows.subarray(y * rowBytes, (y + 1) * rowBytes);
    for (let x = 0; x < width; x++) {
      let r = 0, g = 0, b = 0, a = 255;
      if (color === 3) {
        const i = sample(row, x);
        if (!palette || i * 3 + 2 >= palette.length) return null;
        r = palette[i * 3]; g = palette[i * 3 + 1]; b = palette[i * 3 + 2];
        if (trns && i < trns.length) a = trns[i];
      } else if (color === 0) {
        r = g = b = sample(row, x);
        if (trns && trns.length >= 2) {
          const t = depth === 16 ? (trns[0] << 8) | trns[1] : trns[1];
          if (r === t) a = 0;
        }
      } else if (color === 4) {
        r = g = b = sample(row, x * 2);
        a = sample(row, x * 2 + 1);
      } else if (color === 2) {
        r = sample(row, x * 3); g = sample(row, x * 3 + 1); b = sample(row, x * 3 + 2);
      } else {
        r = sample(row, x * 4); g = sample(row, x * 4 + 1); b = sample(row, x * 4 + 2); a = sample(row, x * 4 + 3);
      }
      const o = (y * width + x) * 4;
      rgba[o] = r; rgba[o + 1] = g; rgba[o + 2] = b; rgba[o + 3] = a;
    }
  }
  return { width, height, rgba };
}
