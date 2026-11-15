// Decodes tiles.png as SDL_image (libpng) reads it for Brogue: the palette's values as they are, without the
// colour management a browser would apply to its iCCP profile. Only what the file uses: 8-bit palette or
// greyscale, not interlaced.
import { unzlibSync } from 'fflate';

export interface GrayImage {
  width: number;
  height: number;
  /** one byte per pixel: the blue channel of 0xffRRGGBB, the value tiles.c reads (the sheet is grey) */
  gray: Uint8Array;
}

export function decodePng(bytes: Uint8Array): GrayImage {
  const dv = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  let pos = 8;
  let width = 0, height = 0, depth = 0, colorType = 0, interlace = 0;
  let palette: Uint8Array | null = null;
  const idat: Uint8Array[] = [];
  while (pos < bytes.length) {
    const len = dv.getUint32(pos);
    const type = String.fromCharCode(...bytes.subarray(pos + 4, pos + 8));
    const data = bytes.subarray(pos + 8, pos + 8 + len);
    if (type === 'IHDR') {
      width = dv.getUint32(pos + 8);
      height = dv.getUint32(pos + 12);
      depth = data[8];
      colorType = data[9];
      interlace = data[12];
    } else if (type === 'PLTE') palette = data;
    else if (type === 'IDAT') idat.push(data);
    else if (type === 'IEND') break;
    pos += 12 + len;
  }
  if (depth !== 8 || interlace !== 0 || (colorType !== 3 && colorType !== 0)) throw new Error('png: unsupported format');
  let total = 0;
  for (const c of idat) total += c.length;
  const z = new Uint8Array(total);
  let o = 0;
  for (const c of idat) {
    z.set(c, o);
    o += c.length;
  }
  const raw = unzlibSync(z);
  const gray = new Uint8Array(width * height);
  const prev = new Uint8Array(width);
  const cur = new Uint8Array(width);
  let rp = 0;
  for (let y = 0; y < height; y++) {
    const filter = raw[rp++];
    for (let x = 0; x < width; x++) {
      const v = raw[rp++];
      const a = x > 0 ? cur[x - 1] : 0, b = prev[x], c = x > 0 ? prev[x - 1] : 0;
      let r: number;
      switch (filter) {
        case 0: r = v; break;
        case 1: r = v + a; break;
        case 2: r = v + b; break;
        case 3: r = v + ((a + b) >> 1); break;
        case 4: {
          const p = a + b - c, pa = Math.abs(p - a), pb = Math.abs(p - b), pc = Math.abs(p - c);
          r = v + (pa <= pb && pa <= pc ? a : pb <= pc ? b : c);
          break;
        }
        default: throw new Error('png: bad filter');
      }
      cur[x] = r & 255;
    }
    for (let x = 0; x < width; x++) gray[y * width + x] = palette ? palette[cur[x] * 3 + 2] : cur[x];
    prev.set(cur);
  }
  return { width, height, gray };
}
