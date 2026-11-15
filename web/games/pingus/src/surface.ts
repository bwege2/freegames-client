// The images as Pingus holds them: SDL 1.2 surfaces as SDL_image 1.2's IMG_Load makes them from the PNG
// and JPEG files (paletted with or without a colour key, 24-bit RGB, 32-bit RGBA with alpha), because the
// game logic reads them that way: CollisionMask::init_colmap (collision_mask.cpp), the ground map's
// put_alpha_surface (ground_map.cpp), and SDL_BlitSurface onto the ground tiles. Decoding is our own (fflate
// for the zlib data, jpeg-js for the JPEG backgrounds), so the browser and the headless tests see the same bytes.
import { unzlibSync } from 'fflate';
import jpeg from 'jpeg-js';

export class Surface {
  /** bytes per pixel: 1 (palette index), 3 (R,G,B), 4 (R,G,B,A) */
  readonly w: number;
  readonly h: number;
  readonly bpp: 1 | 3 | 4;
  readonly px: Uint8Array;
  /** 256 * RGB */
  readonly palette: Uint8Array | null;
  colorkey: number;
  /** the area changed since the browser last copied this surface to its canvas (the ground map) */
  dirty: { x0: number; y0: number; x1: number; y1: number } | null = null;
  constructor(w: number, h: number, bpp: 1 | 3 | 4, px: Uint8Array, palette: Uint8Array | null = null, colorkey = -1) {
    this.w = w; this.h = h; this.bpp = bpp; this.px = px; this.palette = palette; this.colorkey = colorkey;
  }

  static rgba(w: number, h: number): Surface { return new Surface(w, h, 4, new Uint8Array(w * h * 4)); }

  get indexed() { return this.bpp === 1; }

  /** Blitter::create_surface_from_format + copy */
  clone(): Surface {
    return new Surface(this.w, this.h, this.bpp, this.px.slice(), this.palette, this.colorkey);
  }

  /** the colour of a pixel as Surface::get_pixel gives it (a colour-keyed pixel is 0,0,0,0) */
  rgbaAt(x: number, y: number): [number, number, number, number] {
    const i = y * this.w + x;
    if (this.bpp === 1) {
      const p = this.px[i];
      if (p === this.colorkey) return [0, 0, 0, 0];
      const pal = this.palette!;
      return [pal[p * 3], pal[p * 3 + 1], pal[p * 3 + 2], 255];
    }
    if (this.bpp === 3) {
      const r = this.px[i * 3], g = this.px[i * 3 + 1], b = this.px[i * 3 + 2];
      if (this.colorkey >= 0 && ((r | (g << 8) | (b << 16)) === this.colorkey)) return [0, 0, 0, 0];
      return [r, g, b, 255];
    }
    return [this.px[i * 4], this.px[i * 4 + 1], this.px[i * 4 + 2], this.px[i * 4 + 3]];
  }

  /** RGBA for drawing: colour key transparent, alpha as stored */
  toRGBA(): Uint8ClampedArray {
    const out = new Uint8ClampedArray(this.w * this.h * 4);
    if (this.bpp === 4) { out.set(this.px); return out; }
    for (let y = 0; y < this.h; y++) {
      for (let x = 0; x < this.w; x++) {
        const c = this.rgbaAt(x, y), o = (y * this.w + x) * 4;
        out[o] = c[0]; out[o + 1] = c[1]; out[o + 2] = c[2]; out[o + 3] = c[3];
      }
    }
    return out;
  }

  /** Surface::subsection */
  subsection(left: number, top: number, w: number, h: number): Surface {
    const out = new Uint8Array(w * h * this.bpp);
    for (let y = 0; y < h; y++) {
      const s = ((y + top) * this.w + left) * this.bpp;
      out.set(this.px.subarray(s, s + w * this.bpp), y * w * this.bpp);
    }
    return new Surface(w, h, this.bpp, out, this.palette, this.colorkey);
  }

  /** Surface::mod: BlitterImpl::modify with the transform of a ResourceModifier */
  mod(modifier: string): Surface {
    const W = this.w, H = this.h;
    type T = [(x: number, y: number) => number, (x: number, y: number) => number, boolean];
    const tr: Record<string, T> = {
      ROT90: [(_x, y) => H - y - 1, (x) => x, true],
      ROT180: [(x) => W - x - 1, (_x, y) => H - y - 1, false],
      ROT270: [(_x, y) => y, (x) => W - x - 1, true],
      ROT0FLIP: [(x) => W - x - 1, (_x, y) => y, false],
      ROT90FLIP: [(_x, y) => y, (x) => x, true],
      ROT180FLIP: [(x) => x, (_x, y) => H - y - 1, false],
      ROT270FLIP: [(_x, y) => H - y - 1, (x) => W - x - 1, true],
    };
    const t = tr[modifier];
    if (!t) return this.clone();
    const [col, row, swap] = t;
    const tw = swap ? H : W, th = swap ? W : H, b = this.bpp;
    const out = new Uint8Array(tw * th * b);
    for (let y = 0; y < H; y++) {
      for (let x = 0; x < W; x++) {
        const ti = (row(x, y) * tw + col(x, y)) * b, si = (y * W + x) * b;
        for (let k = 0; k < b; k++) out[ti + k] = this.px[si + k];
      }
    }
    return new Surface(tw, th, this.bpp, out, this.palette, this.colorkey);
  }

  /** Blitter::scale_surface: nearest for paletted, the averaged bilinear of the original otherwise */
  scale(width: number, height: number): Surface {
    const b = this.bpp;
    const out = new Uint8Array(width * height * b);
    if (b === 1) {
      for (let i = 0; i < height; i++) {
        for (let j = 0; j < width; j++) {
          out[i * width + j] = this.px[Math.trunc(i * this.h / height) * this.w + Math.trunc(j * this.w / width)];
        }
      }
      return new Surface(width, height, 1, out, this.palette, this.colorkey);
    }
    const f = Math.fround, sw = this.w, sh = this.h, p = this.px;
    for (let i = 0; i < height; i++) {
      let fy = f(f(f(i) * f(sh)) / f(height));
      const iy = Math.trunc(fy);
      fy = f(fy - iy);
      for (let j = 0; j < width; j++) {
        let fx = f(f(f(j) * f(sw)) / f(width));
        const ix = Math.trunc(fx);
        fx = f(fx - ix);
        const fz = f(f(fx + fy) / 2);
        const p1 = (iy * sw + ix) * b;
        const p2 = iy !== sh - 1 ? ((iy + 1) * sw + ix) * b : p1;
        const p3 = ix !== sw - 1 ? (iy * sw + ix + 1) * b : p1;
        const p4 = iy !== sh - 1 && ix !== sw - 1 ? ((iy + 1) * sw + ix + 1) * b : p1;
        const o = (i * width + j) * b;
        for (let k = 0; k < b; k++) {
          const s = f(f(f(f(f(f(p[p1 + k] * f(1 - fy)) + f(p[p2 + k] * fy)) + f(p[p1 + k] * f(1 - fx))) + f(p[p3 + k] * fx))
            + f(p[p1 + k] * f(1 - fz))) + f(p[p4 + k] * fz));
          out[o + k] = Math.trunc(s / 3.0 + 0.5) & 0xff;
        }
      }
    }
    return new Surface(width, height, b, out, null, -1);
  }

  /** Surface::convert_to_rgba / convert_to_rgb (surface.cpp) */
  convertToRGBA(): Surface {
    const s = Surface.rgba(this.w, this.h);
    for (let y = 0; y < this.h; y++) for (let x = 0; x < this.w; x++) s.px.set(this.rgbaAt(x, y), (y * this.w + x) * 4);
    return s;
  }
  convertToRGB(): Surface {
    const out = new Uint8Array(this.w * this.h * 3);
    for (let y = 0; y < this.h; y++) for (let x = 0; x < this.w; x++) {
      const c = this.rgbaAt(x, y), o = (y * this.w + x) * 3;
      const i = y * this.w + x, pal = this.palette;
      if (this.bpp === 1 && pal) { out[o] = pal[this.px[i] * 3]; out[o + 1] = pal[this.px[i] * 3 + 1]; out[o + 2] = pal[this.px[i] * 3 + 2]; }
      else { out[o] = c[0]; out[o + 1] = c[1]; out[o + 2] = c[2]; }
    }
    return new Surface(this.w, this.h, 3, out);
  }

  /** Surface::fill: blends a colour over 3- and 4-byte surfaces (alpha untouched) */
  fill(c: { r: number; g: number; b: number; a: number }): void {
    if (c.a === 0 || this.bpp === 1) return;
    const b = this.bpp, p = this.px;
    for (let i = 0; i < this.w * this.h; i++) {
      const o = i * b;
      p[o] = Math.min(255, Math.trunc(((255 - c.a) * p[o] + c.a * c.r) / 255));
      p[o + 1] = Math.min(255, Math.trunc(((255 - c.a) * p[o + 1] + c.a * c.g) / 255));
      p[o + 2] = Math.min(255, Math.trunc(((255 - c.a) * p[o + 2] + c.a * c.b) / 255));
    }
  }
}

/** CollisionMask::init_colmap: 1 where the pixel is solid */
export function collisionMask(s: Surface): Uint8Array {
  const n = s.w * s.h, m = new Uint8Array(n);
  if (s.bpp === 1) {
    if (s.colorkey >= 0) for (let i = 0; i < n; i++) m[i] = s.px[i] === s.colorkey ? 0 : 1;
    else m.fill(1);
  } else if (s.bpp === 3) {
    m.fill(1);
  } else {
    for (let i = 0; i < n; i++) m[i] = s.px[i * 4 + 3] === 255 ? 1 : 0;
  }
  return m;
}

/**
 * SDL_BlitSurface of `src` onto a 32-bit RGBA surface with SDL_SRCALPHA (a ground tile), at x, y, clipped.
 * Paletted and RGB sources copy their pixels opaque (the colour key skipped); an RGBA source blends its
 * colour by its alpha and leaves the target's alpha as it was (SDL 1.2's BlitRGBtoRGBPixelAlpha).
 */
export function blitOntoRGBA(dst: Surface, src: Surface, x: number, y: number): void {
  const x0 = Math.max(0, -x), y0 = Math.max(0, -y);
  const x1 = Math.min(src.w, dst.w - x), y1 = Math.min(src.h, dst.h - y);
  const d = dst.px, s = src.px;
  for (let sy = y0; sy < y1; sy++) {
    let di = ((sy + y) * dst.w + x + x0) * 4;
    for (let sx = x0; sx < x1; sx++, di += 4) {
      const si = sy * src.w + sx;
      if (src.bpp === 1) {
        const p = s[si];
        if (p === src.colorkey) continue;
        const pal = src.palette!;
        d[di] = pal[p * 3]; d[di + 1] = pal[p * 3 + 1]; d[di + 2] = pal[p * 3 + 2]; d[di + 3] = 255;
      } else if (src.bpp === 3) {
        const r = s[si * 3], g = s[si * 3 + 1], b = s[si * 3 + 2];
        if (src.colorkey >= 0 && (r | (g << 8) | (b << 16)) === src.colorkey) continue;
        d[di] = r; d[di + 1] = g; d[di + 2] = b; d[di + 3] = 255;
      } else {
        const a = s[si * 4 + 3];
        if (a === 0) continue;
        if (a === 255) { d[di] = s[si * 4]; d[di + 1] = s[si * 4 + 1]; d[di + 2] = s[si * 4 + 2]; continue; }
        // s1/d1 hold red and blue, s/d green, as the SDL code does it in one 32-bit word
        const sv = s[si * 4] | (s[si * 4 + 1] << 8) | (s[si * 4 + 2] << 16);
        const dv = d[di] | (d[di + 1] << 8) | (d[di + 2] << 16);
        const s1 = sv & 0xff00ff, d1 = dv & 0xff00ff;
        const r1 = (d1 + (((s1 - d1) * a) >> 8)) & 0xff00ff;
        const sg = sv & 0xff00, dg = dv & 0xff00;
        const r2 = (dg + (((sg - dg) * a) >> 8)) & 0xff00;
        const v = r1 | r2;
        d[di] = v & 0xff; d[di + 1] = (v >> 8) & 0xff; d[di + 2] = (v >> 16) & 0xff;
      }
    }
  }
}

// ---- decoding ----

function paeth(a: number, b: number, c: number) {
  const p = a + b - c, pa = Math.abs(p - a), pb = Math.abs(p - b), pc = Math.abs(p - c);
  return pa <= pb && pa <= pc ? a : pb <= pc ? b : c;
}

/** IMG_LoadPNG_RW of SDL_image 1.2 */
export function decodePNG(data: Uint8Array): Surface {
  const dv = new DataView(data.buffer, data.byteOffset, data.byteLength);
  let pos = 8, w = 0, h = 0, depth = 0, ctype = 0;
  let plte: Uint8Array | null = null, trns: Uint8Array | null = null;
  const idat: Uint8Array[] = [];
  while (pos < data.length) {
    const len = dv.getUint32(pos), type = String.fromCharCode(...data.subarray(pos + 4, pos + 8));
    const body = data.subarray(pos + 8, pos + 8 + len);
    if (type === 'IHDR') { w = dv.getUint32(pos + 8); h = dv.getUint32(pos + 12); depth = body[8]; ctype = body[9]; if (body[12]) throw new Error('interlaced PNG'); }
    else if (type === 'PLTE') plte = body;
    else if (type === 'tRNS') trns = body;
    else if (type === 'IDAT') idat.push(body);
    else if (type === 'IEND') break;
    pos += 12 + len;
  }
  let total = 0;
  for (const c of idat) total += c.length;
  const z = new Uint8Array(total);
  let o = 0;
  for (const c of idat) { z.set(c, o); o += c.length; }
  const raw = unzlibSync(z);
  const chans = ctype === 0 ? 1 : ctype === 2 ? 3 : ctype === 3 ? 1 : ctype === 4 ? 2 : 4;
  const bitsPP = chans * depth, bpl = Math.ceil(w * bitsPP / 8), fbpp = Math.max(1, bitsPP >> 3);
  const lines = new Uint8Array(bpl * h);
  let prev = new Uint8Array(bpl);
  for (let y = 0, rp = 0; y < h; y++) {
    const ft = raw[rp++];
    const line = lines.subarray(y * bpl, (y + 1) * bpl);
    for (let i = 0; i < bpl; i++) {
      const x = raw[rp++], a = i >= fbpp ? line[i - fbpp] : 0, b = prev[i], c = i >= fbpp ? prev[i - fbpp] : 0;
      line[i] = (ft === 0 ? x : ft === 1 ? x + a : ft === 2 ? x + b : ft === 3 ? x + ((a + b) >> 1) : x + paeth(a, b, c)) & 0xff;
    }
    prev = line;
  }
  // one value per channel sample, 8 bit (16-bit stripped, 1/2/4-bit unpacked)
  const sample = (y: number, i: number): number => {
    const line = y * bpl;
    if (depth === 8) return lines[line + i];
    if (depth === 16) return lines[line + i * 2];
    const per = 8 / depth, byte = lines[line + Math.floor(i / per)];
    return (byte >> (8 - depth * (i % per + 1))) & ((1 << depth) - 1);
  };
  if (ctype === 3) {
    const pal = new Uint8Array(768);
    pal.set(plte!.subarray(0, Math.min(768, plte!.length)));
    let key = -1, simple = true;
    if (trns) {
      let t = -1, j = 0;
      for (; j < trns.length; j++) {
        if (trns[j] === 0) { if (t >= 0) break; t = j; } else if (trns[j] !== 255) break;
      }
      if (j === trns.length) key = t; else simple = false;
    }
    if (simple) {
      const px = new Uint8Array(w * h);
      for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) px[y * w + x] = sample(y, x);
      return new Surface(w, h, 1, px, pal, key);
    }
    // a palette with partial transparency: png_set_expand to RGBA
    const px = new Uint8Array(w * h * 4);
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
      const p = sample(y, x), q = (y * w + x) * 4;
      px[q] = pal[p * 3]; px[q + 1] = pal[p * 3 + 1]; px[q + 2] = pal[p * 3 + 2]; px[q + 3] = p < trns!.length ? trns![p] : 255;
    }
    return new Surface(w, h, 4, px);
  }
  if (ctype === 0) {
    // grey: 8-bit with a grey ramp palette (low bit depths scaled to 0..255), tRNS as colour key
    const pal = new Uint8Array(768);
    for (let i = 0; i < 256; i++) pal[i * 3] = pal[i * 3 + 1] = pal[i * 3 + 2] = i;
    const scale = depth < 8 ? 255 / ((1 << depth) - 1) : 1;
    const px = new Uint8Array(w * h);
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) px[y * w + x] = Math.round(sample(y, x) * scale);
    let key = -1;
    if (trns) key = Math.round(((trns[0] << 8 | trns[1]) & ((1 << depth) - 1)) * scale);
    return new Surface(w, h, 1, px, pal, key);
  }
  if (ctype === 2) {
    const px = new Uint8Array(w * h * 3);
    for (let y = 0; y < h; y++) for (let x = 0; x < w * 3; x++) px[y * w * 3 + x] = sample(y, x);
    let key = -1;
    if (trns) key = (trns[1] | (trns[3] << 8) | (trns[5] << 16));
    return new Surface(w, h, 3, px, null, key);
  }
  // grey+alpha (png_set_gray_to_rgb) and RGBA
  const px = new Uint8Array(w * h * 4);
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
    const q = (y * w + x) * 4;
    if (ctype === 4) { const g = sample(y, x * 2); px[q] = px[q + 1] = px[q + 2] = g; px[q + 3] = sample(y, x * 2 + 1); }
    else for (let k = 0; k < 4; k++) px[q + k] = sample(y, x * 4 + k);
  }
  return new Surface(w, h, 4, px);
}

export function decodeJPEG(data: Uint8Array): Surface {
  const im = jpeg.decode(data, { useTArray: true, formatAsRGBA: false });
  return new Surface(im.width, im.height, 3, new Uint8Array(im.data.buffer, im.data.byteOffset, im.width * im.height * 3));
}

export function decodeImage(name: string, data: Uint8Array): Surface {
  return name.endsWith('.jpg') ? decodeJPEG(data) : decodePNG(data);
}
