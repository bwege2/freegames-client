// A PNG decoder for the original's pictures (IMG_Load + SDL_DisplayFormatAlpha): non-interlaced,
// grey, RGB, palette (1, 2, 4, 8 bits, tRNS), grey+alpha and RGBA, 8 bits per channel. Exact pixels,
// unlike a canvas, which premultiplies alpha.
import { unzlibSync } from 'fflate';
import type { Pic } from './fb.ts';

export function decodePng(data: Uint8Array): Pic {
  const dv = new DataView(data.buffer, data.byteOffset, data.byteLength);
  if (dv.getUint32(0) !== 0x89504e47) throw new Error('not a PNG');
  let p = 8;
  let w = 0, h = 0, depth = 0, ctype = 0, interlace = 0;
  let palette: Uint8Array | null = null;
  let trns: Uint8Array | null = null;
  const idat: Uint8Array[] = [];
  while (p < data.length) {
    const len = dv.getUint32(p);
    const type = String.fromCharCode(data[p + 4], data[p + 5], data[p + 6], data[p + 7]);
    const body = data.subarray(p + 8, p + 8 + len);
    if (type === 'IHDR') {
      w = dv.getUint32(p + 8);
      h = dv.getUint32(p + 12);
      depth = body[8];
      ctype = body[9];
      interlace = body[12];
    } else if (type === 'PLTE') palette = body;
    else if (type === 'tRNS') trns = body;
    else if (type === 'IDAT') idat.push(body);
    else if (type === 'IEND') break;
    p += 12 + len;
  }
  if (interlace !== 0) throw new Error('interlaced PNG');
  let total = 0;
  for (const c of idat) total += c.length;
  const z = new Uint8Array(total);
  let o = 0;
  for (const c of idat) { z.set(c, o); o += c.length; }
  const raw = unzlibSync(z);
  const channels = ({ 0: 1, 2: 3, 3: 1, 4: 2, 6: 4 } as Record<number, number>)[ctype];
  const bpp = Math.max(1, (channels * depth) >> 3);
  const stride = (w * channels * depth + 7) >> 3;
  const cur = new Uint8Array(stride);
  let prev = new Uint8Array(stride);
  const px = new Uint8ClampedArray(w * h * 4);
  let rp = 0;
  for (let y = 0; y < h; y++) {
    const filter = raw[rp++];
    for (let i = 0; i < stride; i++) {
      const x = raw[rp++];
      const a = i >= bpp ? cur[i - bpp] : 0;
      const b = prev[i];
      const c = i >= bpp ? prev[i - bpp] : 0;
      let v: number;
      switch (filter) {
        case 0: v = x; break;
        case 1: v = x + a; break;
        case 2: v = x + b; break;
        case 3: v = x + ((a + b) >> 1); break;
        default: {
          const pp = a + b - c;
          const pa = Math.abs(pp - a), pb = Math.abs(pp - b), pc = Math.abs(pp - c);
          v = x + (pa <= pb && pa <= pc ? a : pb <= pc ? b : c);
        }
      }
      cur[i] = v & 255;
    }
    let di = y * w * 4;
    for (let x = 0; x < w; x++, di += 4) {
      switch (ctype) {
        case 6: px[di] = cur[x * 4]; px[di + 1] = cur[x * 4 + 1]; px[di + 2] = cur[x * 4 + 2]; px[di + 3] = cur[x * 4 + 3]; break;
        case 2: {
          const r = cur[x * 3], g = cur[x * 3 + 1], bl = cur[x * 3 + 2];
          px[di] = r; px[di + 1] = g; px[di + 2] = bl;
          px[di + 3] = trns && trns.length >= 6 && ((trns[0] << 8) | trns[1]) === r && ((trns[2] << 8) | trns[3]) === g && ((trns[4] << 8) | trns[5]) === bl ? 0 : 255;
          break;
        }
        case 0: {
          const g = cur[x];
          px[di] = g; px[di + 1] = g; px[di + 2] = g;
          px[di + 3] = trns && trns.length >= 2 && ((trns[0] << 8) | trns[1]) === g ? 0 : 255;
          break;
        }
        case 4: px[di] = px[di + 1] = px[di + 2] = cur[x * 2]; px[di + 3] = cur[x * 2 + 1]; break;
        case 3: {
          const per = 8 / depth;
          const byte = cur[Math.floor(x / per)];
          const shift = 8 - depth * ((x % per) + 1);
          const idx = (byte >> shift) & ((1 << depth) - 1);
          px[di] = palette![idx * 3]; px[di + 1] = palette![idx * 3 + 1]; px[di + 2] = palette![idx * 3 + 2];
          px[di + 3] = trns && idx < trns.length ? trns[idx] : 255;
          break;
        }
      }
    }
    const t = prev;
    prev = cur.slice();
    void t;
  }
  return { w, h, px };
}
