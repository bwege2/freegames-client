// IMG_Load of SDL_image 1.2.12 for the files the game has: PNG through libpng with the transformations
// IMG_png.c asks for (strip_16, packing, expand for grey and for palettes with translucency,
// gray_to_rgb), and GIF as IMG_gif.c reads it (8 bpp, the colour map, the GIF89 transparent index as
// colour key). The surfaces get exactly the formats SDL_image gives them.
import { inflate } from './inflate.ts';
import { createRGBSurface, setColorKey, SRCCOLORKEY, SWSURFACE, type Surface } from './video.ts';

function be32(b: Uint8Array, o: number): number { return ((b[o] << 24) | (b[o + 1] << 16) | (b[o + 2] << 8) | b[o + 3]) >>> 0; }

export function loadImage(data: Uint8Array, name = ''): Surface {
  let s: Surface;
  if (data[0] === 0x89 && data[1] === 0x50) s = loadPNG(data);
  else if (data[0] === 0x47 && data[1] === 0x49) s = loadGIF(data);
  else throw new Error(`unsupported image ${name}`);
  s.name = name;
  return s;
}

function loadPNG(b: Uint8Array): Surface {
  let pos = 8;
  let width = 0, height = 0, depth = 0, ctype = 0, interlace = 0;
  let plte: Uint8Array | null = null;
  let trns: Uint8Array | null = null;
  const idat: Uint8Array[] = [];
  while (pos < b.length) {
    const len = be32(b, pos);
    const type = String.fromCharCode(b[pos + 4], b[pos + 5], b[pos + 6], b[pos + 7]);
    const d = b.subarray(pos + 8, pos + 8 + len);
    if (type === 'IHDR') { width = be32(d, 0); height = be32(d, 4); depth = d[8]; ctype = d[9]; interlace = d[12]; }
    else if (type === 'PLTE') plte = d;
    else if (type === 'tRNS') trns = d;
    else if (type === 'IDAT') idat.push(d);
    else if (type === 'IEND') break;
    pos += 12 + len;
  }
  if (interlace) throw new Error('interlaced PNG');
  const total = idat.reduce((a, c) => a + c.length, 0);
  const z = new Uint8Array(total);
  let o = 0;
  for (const c of idat) { z.set(c, o); o += c.length; }
  const raw = inflate(z);
  // unfilter
  const chans = ctype === 0 ? 1 : ctype === 2 ? 3 : ctype === 3 ? 1 : ctype === 4 ? 2 : 4;
  const bpp = Math.max(1, (chans * depth) >> 3);
  const stride = (width * chans * depth + 7) >> 3;
  const img = new Uint8Array(stride * height);
  let rp = 0;
  for (let y = 0; y < height; y++) {
    const f = raw[rp++];
    const line = img.subarray(y * stride, (y + 1) * stride);
    const prev = y ? img.subarray((y - 1) * stride, y * stride) : null;
    for (let x = 0; x < stride; x++) {
      const a = x >= bpp ? line[x - bpp] : 0;
      const up = prev ? prev[x] : 0;
      const c = prev && x >= bpp ? prev[x - bpp] : 0;
      let v = raw[rp++];
      switch (f) {
        case 1: v += a; break;
        case 2: v += up; break;
        case 3: v += (a + up) >> 1; break;
        case 4: {
          const p = a + up - c;
          const pa = Math.abs(p - a), pb = Math.abs(p - up), pc = Math.abs(p - c);
          v += pa <= pb && pa <= pc ? a : pb <= pc ? up : c;
          break;
        }
      }
      line[x] = v;
    }
  }
  // sample getter (strip_16: the high byte; packing: sub-byte samples to bytes)
  const sample = (row: number, i: number): number => {
    const r = row * stride;
    if (depth === 8) return img[r + i];
    if (depth === 16) return img[r + i * 2];
    const per = 8 / depth;
    const byte = img[r + Math.floor(i / per)];
    const shift = 8 - depth * (1 + (i % per));
    return (byte >> shift) & ((1 << depth) - 1);
  };
  if (ctype === 3) {
    let ckey = -1;
    let expand = false;
    if (trns) {
      let t = -1, i = 0;
      for (; i < trns.length; i++) {
        if (trns[i] === 0) { if (t >= 0) break; t = i; } else if (trns[i] !== 255) break;
      }
      if (i === trns.length) ckey = t; else expand = true;
    }
    if (expand) {
      const s = createRGBSurface(SWSURFACE, width, height, 32, 0xff, 0xff00, 0xff0000, 0xff000000);
      for (let y = 0; y < height; y++) for (let x = 0; x < width; x++) {
        const idx = sample(y, x);
        const p = y * s.pitch + x * 4;
        s.pixels[p] = plte![idx * 3]; s.pixels[p + 1] = plte![idx * 3 + 1]; s.pixels[p + 2] = plte![idx * 3 + 2];
        s.pixels[p + 3] = idx < trns!.length ? trns![idx] : 255;
      }
      return s;
    }
    const s = createRGBSurface(SWSURFACE, width, height, 8, 0, 0, 0, 0);
    if (ckey !== -1) setColorKey(s, SRCCOLORKEY, ckey);
    for (let y = 0; y < height; y++) for (let x = 0; x < width; x++) s.pixels[y * s.pitch + x] = sample(y, x);
    const pal = s.format.palette!;
    const n = plte ? plte.length / 3 : 0;
    if (n > 0) {
      pal.ncolors = n;
      for (let i = 0; i < n; i++) { pal.colors[i * 4] = plte![i * 3]; pal.colors[i * 4 + 1] = plte![i * 3 + 1]; pal.colors[i * 4 + 2] = plte![i * 3 + 2]; }
    }
    return s;
  }
  if (ctype === 0) {
    if (trns || depth !== 8) throw new Error('unsupported grey PNG');
    const s = createRGBSurface(SWSURFACE, width, height, 8, 0, 0, 0, 0);
    for (let y = 0; y < height; y++) for (let x = 0; x < width; x++) s.pixels[y * s.pitch + x] = sample(y, x);
    const pal = s.format.palette!;
    pal.ncolors = 256;
    for (let i = 0; i < 256; i++) { pal.colors[i * 4] = i; pal.colors[i * 4 + 1] = i; pal.colors[i * 4 + 2] = i; }
    return s;
  }
  if (trns) throw new Error('unsupported tRNS');
  const outCh = ctype === 2 ? 3 : 4;
  const s = createRGBSurface(SWSURFACE, width, height, outCh * 8, 0xff, 0xff00, 0xff0000, outCh === 4 ? 0xff000000 : 0);
  for (let y = 0; y < height; y++) for (let x = 0; x < width; x++) {
    const p = y * s.pitch + x * outCh;
    if (ctype === 4) {
      const g = sample(y, x * 2), a = sample(y, x * 2 + 1);
      s.pixels[p] = g; s.pixels[p + 1] = g; s.pixels[p + 2] = g; s.pixels[p + 3] = a;
    } else {
      for (let c = 0; c < outCh; c++) s.pixels[p + c] = sample(y, x * outCh + c);
    }
  }
  return s;
}

function loadGIF(b: Uint8Array): Surface {
  let pos = 6;
  const screenFlags = b[pos + 4];
  pos += 7;
  const globalSize = 2 << (screenFlags & 7);
  let global = new Uint8Array(256 * 3);
  if (screenFlags & 0x80) { global = b.slice(pos, pos + globalSize * 3); pos += globalSize * 3; }
  let transparent = -1;
  for (;;) {
    const c = b[pos++];
    if (c === 0x3b) throw new Error('GIF without image');
    if (c === 0x21) {
      const label = b[pos++];
      let first = true;
      for (;;) {
        const n = b[pos++];
        if (n === 0) break;
        if (label === 0xf9 && first && (b[pos] & 1)) transparent = b[pos + 3];
        first = false;
        pos += n;
      }
      continue;
    }
    if (c !== 0x2c) continue;
    const w = b[pos + 4] | (b[pos + 5] << 8), h = b[pos + 6] | (b[pos + 7] << 8);
    const flags = b[pos + 8];
    pos += 9;
    let cmap = global, cmapSize = globalSize;
    if (flags & 0x80) { cmapSize = 1 << ((flags & 7) + 1); cmap = b.slice(pos, pos + cmapSize * 3); pos += cmapSize * 3; }
    const interlace = (flags & 0x40) !== 0;
    const s = createRGBSurface(SWSURFACE, w, h, 8, 0, 0, 0, 0);
    const pal = s.format.palette!;
    for (let i = 0; i < cmapSize; i++) {
      pal.colors[i * 4] = cmap[i * 3] ?? 0; pal.colors[i * 4 + 1] = cmap[i * 3 + 1] ?? 0; pal.colors[i * 4 + 2] = cmap[i * 3 + 2] ?? 0;
    }
    // the LZW data blocks
    const minCode = b[pos++];
    const chunks: number[] = [];
    for (;;) {
      const n = b[pos++];
      if (n === 0) break;
      for (let i = 0; i < n; i++) chunks.push(b[pos + i]);
      pos += n;
    }
    const pixels = lzw(Uint8Array.from(chunks), minCode, w * h);
    let xpos = 0, ypos = 0, pass = 0;
    for (let i = 0; i < pixels.length; i++) {
      s.pixels[xpos + ypos * s.pitch] = pixels[i];
      if (++xpos === w) {
        xpos = 0;
        if (interlace) {
          ypos += pass < 2 ? 8 : pass === 2 ? 4 : 2;
          if (ypos >= h) {
            ++pass;
            if (pass === 1) ypos = 4; else if (pass === 2) ypos = 2; else if (pass === 3) ypos = 1; else break;
          }
        } else ypos++;
      }
      if (ypos >= h) break;
    }
    if (transparent >= 0) setColorKey(s, SRCCOLORKEY, transparent);
    return s;
  }
}

function lzw(data: Uint8Array, minCode: number, max: number): Uint8Array {
  const out = new Uint8Array(max);
  let olen = 0;
  const clear = 1 << minCode, end = clear + 1;
  let codeSize = minCode + 1;
  const prefix = new Int32Array(4096), suffix = new Uint8Array(4096), stack = new Uint8Array(4097);
  let next = end + 1, old = -1, firstChar = 0;
  let bitbuf = 0, bitcnt = 0, p = 0;
  for (let i = 0; i < clear; i++) suffix[i] = i;
  while (olen < max) {
    while (bitcnt < codeSize) {
      if (p >= data.length) return out;
      bitbuf |= data[p++] << bitcnt;
      bitcnt += 8;
    }
    const code = bitbuf & ((1 << codeSize) - 1);
    bitbuf >>>= codeSize;
    bitcnt -= codeSize;
    if (code === clear) { codeSize = minCode + 1; next = end + 1; old = -1; continue; }
    if (code === end) break;
    if (old === -1) { out[olen++] = suffix[code]; old = code; firstChar = code; continue; }
    let sp = 0, cur = code;
    if (code >= next) { stack[sp++] = firstChar; cur = old; }
    while (cur >= clear) { stack[sp++] = suffix[cur]; cur = prefix[cur]; }
    firstChar = suffix[cur];
    stack[sp++] = firstChar;
    while (sp > 0 && olen < max) out[olen++] = stack[--sp];
    if (next < 4096) {
      prefix[next] = old;
      suffix[next] = firstChar;
      next++;
      if (next >= (1 << codeSize) && codeSize < 12) codeSize++;
    }
    old = code;
  }
  return out;
}
