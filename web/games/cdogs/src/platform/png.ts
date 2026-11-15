// PNG decoder with the semantics of stb_image (the original loads its pictures with stb_image through
// SDL_stbimage.h, utils.c LoadImgToSurface): every colour type and bit depth, tRNS, 16-bit samples reduced to
// 8 bits by taking the high byte (stbi__convert_16_to_8), no gamma or colour management. The result is RGBA,
// 8 bits per channel, exactly the pixels the original works with. Browsers' own decoders premultiply and
// colour-manage, so the port decodes the original files itself (in the browser and in the node tests).
import { unzlibSync } from 'fflate';

export interface RGBAImage {
  width: number;
  height: number;
  /** r, g, b, a per pixel */
  data: Uint8Array;
}

function u32(b: Uint8Array, o: number): number {
  return ((b[o] << 24) | (b[o + 1] << 16) | (b[o + 2] << 8) | b[o + 3]) >>> 0;
}

export function decodePNG(buf: Uint8Array): RGBAImage {
  const sig = [137, 80, 78, 71, 13, 10, 26, 10];
  for (let i = 0; i < 8; i++) if (buf[i] !== sig[i]) throw new Error('not a PNG');
  let pos = 8;
  let width = 0;
  let height = 0;
  let depth = 8;
  let ctype = 0;
  let interlace = 0;
  let palette: Uint8Array | null = null;
  let trns: Uint8Array | null = null;
  const idat: Uint8Array[] = [];
  while (pos < buf.length) {
    const len = u32(buf, pos);
    const type = String.fromCharCode(buf[pos + 4], buf[pos + 5], buf[pos + 6], buf[pos + 7]);
    const data = buf.subarray(pos + 8, pos + 8 + len);
    pos += 12 + len;
    if (type === 'IHDR') {
      width = u32(data, 0);
      height = u32(data, 4);
      depth = data[8];
      ctype = data[9];
      interlace = data[12];
    } else if (type === 'PLTE') {
      palette = data.slice();
    } else if (type === 'tRNS') {
      trns = data.slice();
    } else if (type === 'IDAT') {
      idat.push(data);
    } else if (type === 'IEND') {
      break;
    }
  }
  let total = 0;
  for (const d of idat) total += d.length;
  const z = new Uint8Array(total);
  let o = 0;
  for (const d of idat) {
    z.set(d, o);
    o += d.length;
  }
  const raw = unzlibSync(z);
  const channels = ctype === 0 ? 1 : ctype === 2 ? 3 : ctype === 3 ? 1 : ctype === 4 ? 2 : 4;
  const out = new Uint8Array(width * height * 4);

  const passes = interlace
    ? [[0, 0, 8, 8], [4, 0, 8, 8], [0, 4, 4, 8], [2, 0, 4, 4], [0, 2, 2, 4], [1, 0, 2, 2], [0, 1, 1, 2]]
    : [[0, 0, 1, 1]];
  let rp = 0;
  for (const [x0, y0, dx, dy] of passes) {
    const pw = Math.ceil((width - x0) / dx);
    const ph = Math.ceil((height - y0) / dy);
    if (pw <= 0 || ph <= 0) continue;
    const bitsPP = depth * channels;
    const stride = Math.ceil((pw * bitsPP) / 8);
    const bpp = Math.max(1, Math.ceil(bitsPP / 8));
    let prev = new Uint8Array(stride);
    let cur = new Uint8Array(stride);
    for (let y = 0; y < ph; y++) {
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
          case 4: {
            const p = a + b - c;
            const pa = Math.abs(p - a);
            const pb = Math.abs(p - b);
            const pc = Math.abs(p - c);
            v = x + (pa <= pb && pa <= pc ? a : pb <= pc ? b : c);
            break;
          }
          default: throw new Error('bad PNG filter');
        }
        cur[i] = v & 255;
      }
      // unpack the row
      for (let px = 0; px < pw; px++) {
        const sample = (ch: number): number => {
          if (depth === 8) return cur[px * channels + ch];
          if (depth === 16) return cur[(px * channels + ch) * 2];
          const bit = (px * channels + ch) * depth;
          return (cur[bit >> 3] >> (8 - depth - (bit & 7))) & ((1 << depth) - 1);
        };
        const sample16 = (ch: number): number => (cur[(px * channels + ch) * 2] << 8) | cur[(px * channels + ch) * 2 + 1];
        const X = x0 + px * dx;
        const Y = y0 + y * dy;
        const oi = (Y * width + X) * 4;
        let r = 0;
        let g = 0;
        let bl = 0;
        let al = 255;
        if (ctype === 3) {
          const idx = sample(0);
          r = palette ? palette[idx * 3] : 0;
          g = palette ? palette[idx * 3 + 1] : 0;
          bl = palette ? palette[idx * 3 + 2] : 0;
          al = trns && idx < trns.length ? trns[idx] : 255;
        } else if (ctype === 0 || ctype === 4) {
          let v = sample(0);
          if (ctype === 0 && trns) {
            const key = depth === 16 ? sample16(0) : v;
            const t = (trns[0] << 8) | trns[1];
            if (key === t) al = 0;
          }
          // stb_image scales 1/2/4-bit grey to 8 bits (stbi__depth_scale_table)
          if (depth < 8) v = v * (depth === 1 ? 0xff : depth === 2 ? 0x55 : 0x11);
          r = g = bl = v;
          if (ctype === 4) al = sample(1);
        } else {
          r = sample(0);
          g = sample(1);
          bl = sample(2);
          if (ctype === 6) al = sample(3);
          else if (trns) {
            const k = depth === 16 ? [sample16(0), sample16(1), sample16(2)] : [r, g, bl];
            if (k[0] === ((trns[0] << 8) | trns[1]) && k[1] === ((trns[2] << 8) | trns[3]) &&
              k[2] === ((trns[4] << 8) | trns[5])) al = 0;
          }
        }
        out[oi] = r;
        out[oi + 1] = g;
        out[oi + 2] = bl;
        out[oi + 3] = al;
      }
      const t = prev;
      prev = cur;
      cur = t;
    }
  }
  return { width, height, data: out };
}
