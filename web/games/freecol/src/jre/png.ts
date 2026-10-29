// A PNG decoder (all colour types and bit depths, transparency, interlacing), synchronous as Java's
// ImageIO.read is: pixels as non-premultiplied ARGB, and the BufferedImage type ImageIO's PNG reader
// gives the file (TYPE_4BYTE_ABGR for RGBA, TYPE_3BYTE_BGR for RGB, TYPE_BYTE_INDEXED for palettes, ...).
import { unzlibSync } from 'fflate';

export type Decoded = { width: number; height: number; argb: Int32Array; type: number; alpha: boolean };

const SIG = [137, 80, 78, 71, 13, 10, 26, 10];

export function isPNG(b: Uint8Array): boolean {
  return b.length > 8 && SIG.every((v, i) => b[i] === v);
}

export function decodePNG(b: Uint8Array): Decoded {
  const d = new DataView(b.buffer, b.byteOffset, b.byteLength);
  let pos = 8;
  let width = 0, height = 0, depth = 8, ctype = 0, interlace = 0;
  let palette: Uint8Array | null = null;
  let trns: Uint8Array | null = null;
  const idat: Uint8Array[] = [];
  while (pos + 8 <= b.length) {
    const len = d.getUint32(pos);
    const type = String.fromCharCode(b[pos + 4], b[pos + 5], b[pos + 6], b[pos + 7]);
    const data = b.subarray(pos + 8, pos + 8 + len);
    pos += 12 + len;
    if (type === 'IHDR') {
      const hd = new DataView(data.buffer, data.byteOffset, data.byteLength);
      width = hd.getUint32(0);
      height = hd.getUint32(4);
      depth = data[8];
      ctype = data[9];
      interlace = data[12];
    } else if (type === 'PLTE') palette = data;
    else if (type === 'tRNS') trns = data;
    else if (type === 'IDAT') idat.push(data);
    else if (type === 'IEND') break;
  }
  let total = 0;
  for (const c of idat) total += c.length;
  const z = new Uint8Array(total);
  let o = 0;
  for (const c of idat) {
    z.set(c, o);
    o += c.length;
  }
  const raw = unzlibSync(z);
  const channels = { 0: 1, 2: 3, 3: 1, 4: 2, 6: 4 }[ctype as 0 | 2 | 3 | 4 | 6];
  const bpp = Math.max(1, (channels * depth) >> 3); // bytes per pixel for filtering
  const argb = new Int32Array(width * height);
  const trnsGray = trns && ctype === 0 ? (trns[0] << 8) | trns[1] : -1;
  const trnsRGB = trns && ctype === 2 ? [(trns[0] << 8) | trns[1], (trns[2] << 8) | trns[3], (trns[4] << 8) | trns[5]] : null;
  const sample = (row: Uint8Array, i: number): number => {
    // the i-th sample of a row, as an integer of the bit depth
    if (depth === 8) return row[i];
    if (depth === 16) return (row[2 * i] << 8) | row[2 * i + 1];
    const perByte = 8 / depth;
    const byte = row[Math.floor(i / perByte)];
    const shift = 8 - depth * ((i % perByte) + 1);
    return (byte >> shift) & ((1 << depth) - 1);
  };
  const to8 = (v: number) => (depth === 16 ? v >> 8 : depth === 8 ? v : Math.round((v * 255) / ((1 << depth) - 1)));
  let rp = 0;
  const unfilter = (w: number, h: number, put: (x: number, y: number, row: Uint8Array) => void) => {
    const stride = Math.ceil((w * channels * depth) / 8);
    let prev = new Uint8Array(stride);
    for (let y = 0; y < h; y++) {
      const f = raw[rp++];
      const row = raw.slice(rp, rp + stride);
      rp += stride;
      for (let i = 0; i < stride; i++) {
        const a = i >= bpp ? row[i - bpp] : 0, up = prev[i], c = i >= bpp ? prev[i - bpp] : 0;
        let v = row[i];
        switch (f) {
        case 1: v += a; break;
        case 2: v += up; break;
        case 3: v += (a + up) >> 1; break;
        case 4: {
          const p = a + up - c, pa = Math.abs(p - a), pb = Math.abs(p - up), pc = Math.abs(p - c);
          v += pa <= pb && pa <= pc ? a : pb <= pc ? up : c;
          break;
        }
        }
        row[i] = v & 0xff;
      }
      for (let x = 0; x < w; x++) put(x, y, row);
      prev = row;
    }
  };
  const pixel = (row: Uint8Array, x: number): number => {
    switch (ctype) {
    case 0: {
      const g = sample(row, x);
      const a = g === trnsGray ? 0 : 255;
      const v = to8(g);
      return (a << 24) | (v << 16) | (v << 8) | v;
    }
    case 2: {
      const r = sample(row, 3 * x), g = sample(row, 3 * x + 1), bl = sample(row, 3 * x + 2);
      const a = trnsRGB && r === trnsRGB[0] && g === trnsRGB[1] && bl === trnsRGB[2] ? 0 : 255;
      return (a << 24) | (to8(r) << 16) | (to8(g) << 8) | to8(bl);
    }
    case 3: {
      const i = sample(row, x);
      const a = trns && i < trns.length ? trns[i] : 255;
      return (a << 24) | (palette![3 * i] << 16) | (palette![3 * i + 1] << 8) | palette![3 * i + 2];
    }
    case 4: {
      const g = to8(sample(row, 2 * x)), a = to8(sample(row, 2 * x + 1));
      return (a << 24) | (g << 16) | (g << 8) | g;
    }
    default: {
      const r = to8(sample(row, 4 * x)), g = to8(sample(row, 4 * x + 1)), bl = to8(sample(row, 4 * x + 2)), a = to8(sample(row, 4 * x + 3));
      return (a << 24) | (r << 16) | (g << 8) | bl;
    }
    }
  };
  if (!interlace) {
    unfilter(width, height, (x, y, row) => (argb[y * width + x] = pixel(row, x)));
  } else {
    const passes = [[0, 0, 8, 8], [4, 0, 8, 8], [0, 4, 4, 8], [2, 0, 4, 4], [0, 2, 2, 4], [1, 0, 2, 2], [0, 1, 1, 2]];
    for (const [x0, y0, dx, dy] of passes) {
      const w = Math.ceil((width - x0) / dx), h = Math.ceil((height - y0) / dy);
      if (w <= 0 || h <= 0) continue;
      unfilter(w, h, (x, y, row) => (argb[(y0 + y * dy) * width + x0 + x * dx] = pixel(row, x)));
    }
  }
  const alpha = ctype === 4 || ctype === 6 || trns != null;
  // ImageIO's PNG reader's image types
  let type = 0;
  if (ctype === 6 && depth === 8) type = 6; // TYPE_4BYTE_ABGR
  else if (ctype === 2 && depth === 8 && !trns) type = 5; // TYPE_3BYTE_BGR
  else if (ctype === 0 && depth === 8 && !trns) type = 10; // TYPE_BYTE_GRAY
  else if (ctype === 0 && depth === 16 && !trns) type = 11; // TYPE_USHORT_GRAY
  else if (ctype === 3 && depth === 8) type = 13; // TYPE_BYTE_INDEXED
  else if (ctype === 3 && depth < 8) type = 12; // TYPE_BYTE_BINARY
  return { width, height, argb, type, alpha };
}
