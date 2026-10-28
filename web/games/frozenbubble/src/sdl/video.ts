// SDL 1.2.15's software surfaces and blitters, as the original ran on them: pixel formats
// (src/video/SDL_pixels.c), surfaces, colour keys and alpha (SDL_surface.c), the choice of blitter
// (SDL_blit.c SDL_CalculateBlit, SDL_blit_1.c, SDL_blit_N.c SDL_CalculateBlitN, SDL_blit_A.c
// SDL_CalculateAlphaBlit) and the C blitters themselves for every case Frozen Bubble reaches
// (built with --disable-assembly, so the C paths). Arithmetic is done in unsigned 32 bits as the C code
// does, including the overflow of the unsigned ALPHA_BLEND into the unused top byte.
// Little-endian pixel memory, as on x86.

export const SWSURFACE = 0x00000000;
export const SRCCOLORKEY = 0x00001000;
export const RLEACCELOK = 0x00002000;
export const SRCALPHA = 0x00010000;
export const ALPHA_OPAQUE = 255;

export class Rect {
  // SDL_Rect: Sint16 x, y; Uint16 w, h (values from Perl are truncated by SvIV, then stored in 16 bits)
  private _x = 0; private _y = 0; private _w = 0; private _h = 0;
  constructor(x = 0, y = 0, w = 0, h = 0) { this.x = x; this.y = y; this.w = w; this.h = h; }
  get x(): number { return this._x; } set x(v: number) { this._x = (iv(v) << 16) >> 16; }
  get y(): number { return this._y; } set y(v: number) { this._y = (iv(v) << 16) >> 16; }
  get w(): number { return this._w; } set w(v: number) { this._w = iv(v) & 0xffff; }
  get h(): number { return this._h; } set h(v: number) { this._h = iv(v) & 0xffff; }
  clone(): Rect { return new Rect(this._x, this._y, this._w, this._h); }
}

/** Perl's SvIV of a number: truncation toward zero (NaN and undef are 0) */
export function iv(v: number): number {
  if (!Number.isFinite(v)) return 0;
  return Math.trunc(v) | 0;
}

export interface Palette { ncolors: number; colors: Uint8Array /* r,g,b,unused per entry, 256 entries */ }

export class PixelFormat {
  BitsPerPixel: number;
  BytesPerPixel: number;
  palette: Palette | null = null;
  Rloss = 8; Gloss = 8; Bloss = 8; Aloss = 8;
  Rshift = 0; Gshift = 0; Bshift = 0; Ashift = 0;
  Rmask = 0; Gmask = 0; Bmask = 0; Amask = 0;
  colorkey = 0;
  alpha = ALPHA_OPAQUE;

  // SDL_AllocFormat
  constructor(bpp: number, Rmask: number, Gmask: number, Bmask: number, Amask: number) {
    this.BitsPerPixel = bpp;
    this.BytesPerPixel = (bpp + 7) >> 3;
    Rmask >>>= 0; Gmask >>>= 0; Bmask >>>= 0; Amask >>>= 0;
    if (Rmask || Bmask || Gmask) {
      const sl = (m: number): [number, number] => {
        let shift = 0, loss = 8;
        if (m) {
          while (!(m & 1)) { m >>>= 1; shift++; }
          while (m & 1) { m >>>= 1; loss--; }
        }
        return [shift, loss];
      };
      [this.Rshift, this.Rloss] = sl(Rmask);
      [this.Gshift, this.Gloss] = sl(Gmask);
      [this.Bshift, this.Bloss] = sl(Bmask);
      [this.Ashift, this.Aloss] = sl(Amask);
      this.Rmask = Rmask; this.Gmask = Gmask; this.Bmask = Bmask; this.Amask = Amask;
    } else if (bpp > 8) {
      let b = bpp > 24 ? 24 : bpp;
      this.Rloss = 8 - ((b / 3) | 0);
      this.Gloss = 8 - ((b / 3) | 0) - (b % 3);
      this.Bloss = 8 - ((b / 3) | 0);
      this.Rshift = (((b / 3) | 0) + (b % 3)) + ((b / 3) | 0);
      this.Gshift = (b / 3) | 0;
      this.Bshift = 0;
      this.Rmask = ((0xff >>> this.Rloss) << this.Rshift) >>> 0;
      this.Gmask = ((0xff >>> this.Gloss) << this.Gshift) >>> 0;
      this.Bmask = ((0xff >>> this.Bloss) << this.Bshift) >>> 0;
      b = 0;
    }
    if (bpp <= 8) {
      const ncolors = 1 << bpp;
      const colors = new Uint8Array(256 * 4);
      if (ncolors === 2 && !(Rmask || Gmask || Bmask)) {
        colors.set([0xff, 0xff, 0xff, 0, 0, 0, 0, 0]);
      }
      this.palette = { ncolors, colors };
    }
  }
}

export class Surface {
  flags: number;
  format: PixelFormat;
  readonly w: number;
  readonly h: number;
  pitch: number;
  pixels: Uint8Array;
  /** the same memory as 32-bit words (32 bpp surfaces; pitch is a multiple of 4) */
  u32: Uint32Array;
  clip: Rect;
  /** a name for traces and debugging */
  name = '';

  constructor(flags: number, w: number, h: number, depth: number, R: number, G: number, B: number, A: number) {
    if (w >= 16384 || h >= 65536) throw new Error('Width or height is too large');
    this.format = new PixelFormat(depth, R, G, B, A);
    this.flags = SWSURFACE;
    if (this.format.Amask) this.flags |= SRCALPHA;
    this.w = w;
    this.h = h;
    // SDL_CalculatePitch: bytes per line rounded up to 4
    let pitch = w * this.format.BitsPerPixel;
    switch (this.format.BitsPerPixel) {
      case 1: pitch = (pitch + 7) >> 3; break;
      case 4: pitch = (pitch + 7) >> 3; break;
      default: pitch = (pitch + 7) >> 3; break;
    }
    this.pitch = (pitch + 3) & ~3;
    this.pixels = new Uint8Array(this.pitch * h);
    this.u32 = new Uint32Array(this.pixels.buffer, 0, (this.pitch * h) >> 2);
    this.clip = new Rect(0, 0, w, h);
    void flags;
  }
}

/** SDL_perl 2's $surface->display_format: the surface itself becomes the converted one */
export function displayFormatInPlace(s: Surface, screen: Surface): Surface {
  const c = displayFormat(s, screen);
  s.flags = c.flags;
  s.format = c.format;
  s.pitch = c.pitch;
  s.pixels = c.pixels;
  s.u32 = c.u32;
  s.clip = c.clip;
  return s;
}

/** a copy of a surface (a fresh IMG_Load of the same file) */
export function cloneSurface(s: Surface): Surface {
  const f = s.format;
  const c = new Surface(SWSURFACE, s.w, s.h, f.BitsPerPixel, f.Rmask, f.Gmask, f.Bmask, f.Amask);
  c.flags = s.flags;
  c.format.colorkey = f.colorkey;
  c.format.alpha = f.alpha;
  if (f.palette && c.format.palette) { c.format.palette.colors.set(f.palette.colors); c.format.palette.ncolors = f.palette.ncolors; }
  c.pixels.set(s.pixels);
  c.name = s.name;
  return c;
}

/** SDL_CreateRGBSurface */
export function createRGBSurface(flags: number, w: number, h: number, depth: number, R: number, G: number, B: number, A: number): Surface {
  return new Surface(flags, w, h, depth, R, G, B, A);
}

/** SDL_SetColorKey */
export function setColorKey(s: Surface, flag: number, key: number): void {
  if (flag & SRCCOLORKEY) flag = flag & (RLEACCELOK) ? (SRCCOLORKEY | RLEACCELOK) : SRCCOLORKEY;
  else flag = 0;
  if (flag) {
    s.flags |= SRCCOLORKEY;
    s.format.colorkey = key >>> 0;
    if (flag & RLEACCELOK) s.flags |= RLEACCELOK; else s.flags &= ~RLEACCELOK;
  } else {
    s.flags &= ~(SRCCOLORKEY | RLEACCELOK);
    s.format.colorkey = 0;
  }
}

/** SDL_SetAlpha */
export function setAlpha(s: Surface, flag: number, value: number): void {
  if (flag & SRCALPHA) flag = flag & RLEACCELOK ? (SRCALPHA | RLEACCELOK) : SRCALPHA;
  else flag = 0;
  value &= 0xff;
  if ((flag === (s.flags & (SRCALPHA | RLEACCELOK))) && (!flag || value === s.format.alpha)) return;
  if (flag) {
    s.flags |= SRCALPHA;
    s.format.alpha = value;
    if (flag & RLEACCELOK) s.flags |= RLEACCELOK; else s.flags &= ~RLEACCELOK;
  } else {
    s.flags &= ~SRCALPHA;
    s.format.alpha = ALPHA_OPAQUE;
  }
}

/** SDL_MapRGB for packed formats (and SDL_FindColor for palettes) */
export function mapRGB(f: PixelFormat, r: number, g: number, b: number): number {
  if (f.palette === null) {
    return (((r >>> f.Rloss) << f.Rshift) | ((g >>> f.Gloss) << f.Gshift) | ((b >>> f.Bloss) << f.Bshift) | f.Amask) >>> 0;
  }
  // SDL_FindColor: the nearest palette entry (smallest squared distance, first wins)
  const pal = f.palette;
  let best = 0, smallest = 0xffffffff;
  for (let i = 0; i < pal.ncolors; i++) {
    const rd = pal.colors[i * 4] - r, gd = pal.colors[i * 4 + 1] - g, bd = pal.colors[i * 4 + 2] - b;
    const d = rd * rd + gd * gd + bd * bd;
    if (d < smallest) { best = i; if (d === 0) break; smallest = d; }
  }
  return best;
}

/** SDL_GetRGB */
export function getRGB(pixel: number, f: PixelFormat): [number, number, number] {
  if (f.palette === null) {
    let v = (pixel & f.Rmask) >>> f.Rshift;
    const r = ((v << f.Rloss) + (v >>> (8 - (f.Rloss << 1)))) & 0xff;
    v = (pixel & f.Gmask) >>> f.Gshift;
    const g = ((v << f.Gloss) + (v >>> (8 - (f.Gloss << 1)))) & 0xff;
    v = (pixel & f.Bmask) >>> f.Bshift;
    const b = ((v << f.Bloss) + (v >>> (8 - (f.Bloss << 1)))) & 0xff;
    return [r, g, b];
  }
  const c = f.palette.colors;
  return [c[pixel * 4], c[pixel * 4 + 1], c[pixel * 4 + 2]];
}

// ---------------------------------------------------------------- blitting

interface BlitInfo {
  src: Surface; dst: Surface;
  sx: number; sy: number; dx: number; dy: number; w: number; h: number;
}

type Blitter = (b: BlitInfo) => void;

function formatEqual(a: PixelFormat, b: PixelFormat): boolean {
  return a.BitsPerPixel === b.BitsPerPixel && a.Rmask === b.Rmask && a.Amask === b.Amask;
}

/** SDL_UpperBlit: clips srcrect and dstrect (dstrect is written back, as SDL does), then blits */
export function blitSurface(src: Surface, srcrect: Rect | null, dst: Surface, dstrect: Rect | null): number {
  if (dstrect === null) dstrect = new Rect(0, 0, 0, 0);
  let srcx: number, srcy: number, w: number, h: number;
  if (srcrect) {
    srcx = srcrect.x;
    w = srcrect.w;
    if (srcx < 0) { w += srcx; dstrect.x -= srcx; srcx = 0; }
    const maxw = src.w - srcx;
    if (maxw < w) w = maxw;
    srcy = srcrect.y;
    h = srcrect.h;
    if (srcy < 0) { h += srcy; dstrect.y -= srcy; srcy = 0; }
    const maxh = src.h - srcy;
    if (maxh < h) h = maxh;
  } else {
    srcx = srcy = 0;
    w = src.w;
    h = src.h;
  }
  const clip = dst.clip;
  let dx = clip.x - dstrect.x;
  if (dx > 0) { w -= dx; dstrect.x += dx; srcx += dx; }
  dx = dstrect.x + w - clip.x - clip.w;
  if (dx > 0) w -= dx;
  let dy = clip.y - dstrect.y;
  if (dy > 0) { h -= dy; dstrect.y += dy; srcy += dy; }
  dy = dstrect.y + h - clip.y - clip.h;
  if (dy > 0) h -= dy;
  if (w > 0 && h > 0) {
    dstrect.w = w;
    dstrect.h = h;
    lowerBlit(src, srcx, srcy, dst, dstrect.x, dstrect.y, w, h);
    return 0;
  }
  dstrect.w = 0;
  dstrect.h = 0;
  return 0;
}

/** SDL_LowerBlit after SDL_MapSurface/SDL_CalculateBlit: the blitter for the surfaces' current state */
export function lowerBlit(src: Surface, sx: number, sy: number, dst: Surface, dx: number, dy: number, w: number, h: number): void {
  const blit = chooseBlit(src, dst);
  blit({ src, dst, sx, sy, dx, dy, w, h });
}

function chooseBlit(src: Surface, dst: Surface): Blitter {
  const sf = src.format, df = dst.format;
  let identity = false;
  if (sf.BytesPerPixel === 1) {
    if (df.BytesPerPixel === 1) throw new Error('8 bpp to 8 bpp blits are not used by the game');
  } else if (df.BytesPerPixel !== 1 && formatEqual(sf, df)) {
    identity = true;
  }
  let index = (src.flags & SRCCOLORKEY) ? 1 : 0;
  if ((src.flags & SRCALPHA) && (sf.alpha !== ALPHA_OPAQUE || sf.Amask)) index |= 2;
  if (identity && index === 0) return src === dst ? blitCopyOverlap : blitCopy;
  if (sf.BytesPerPixel === 1) {
    if (df.BytesPerPixel < 2) throw new Error('unsupported blit');
    switch (index) {
      case 0: return blit1toN;
      case 1: return blit1toNKey;
      case 2: return blit1toNAlpha;
      default: return blit1toNAlphaKey;
    }
  }
  if (index & 2) {
    if (sf.Amask === 0) {
      if (src.flags & SRCCOLORKEY) return blitNtoNSurfaceAlphaKey;
      if (df.BytesPerPixel === 4 && sf.Rmask === df.Rmask && sf.Gmask === df.Gmask && sf.Bmask === df.Bmask
          && sf.BytesPerPixel === 4 && ((sf.Rmask | sf.Gmask | sf.Bmask) >>> 0) === 0xffffff) {
        return blitRGBtoRGBSurfaceAlpha;
      }
      return blitNtoNSurfaceAlpha;
    }
    if (df.BytesPerPixel === 4 && sf.Rmask === df.Rmask && sf.Gmask === df.Gmask && sf.Bmask === df.Bmask
        && sf.BytesPerPixel === 4 && sf.Amask === 0xff000000) {
      return blitRGBtoRGBPixelAlpha;
    }
    return blitNtoNPixelAlpha;
  }
  if (index === 1) {
    return sf.Amask && df.Amask ? blitNtoNKeyCopyAlpha : blitNtoNKey;
  }
  // index 0: normal_blit tables; with 32/24-bit RGB sources and 32-bit destinations only the C fallbacks remain
  const aNeed = df.Amask ? (sf.Amask ? 'copy' : 'set') : 'no';
  if (sf.BytesPerPixel === 4 && df.BytesPerPixel === 4 && sf.Rmask === df.Rmask && sf.Gmask === df.Gmask && sf.Bmask === df.Bmask) {
    return blit4to4MaskAlpha;
  }
  if (aNeed === 'copy') return blitNtoNCopyAlpha;
  return blitNtoN;
}

// pixel access helpers (little endian)
function getPixel(s: Surface, off: number, bpp: number): number {
  const p = s.pixels;
  switch (bpp) {
    case 2: return p[off] | (p[off + 1] << 8);
    case 3: return p[off] + (p[off + 1] << 8) + (p[off + 2] << 16);
    case 4: return s.u32[off >> 2];
    default: return 0;
  }
}

function putPixel(s: Surface, off: number, bpp: number, v: number): void {
  const p = s.pixels;
  switch (bpp) {
    case 2: p[off] = v; p[off + 1] = v >>> 8; break;
    case 3: p[off] = v; p[off + 1] = v >>> 8; p[off + 2] = v >>> 16; break;
    case 4: s.u32[off >> 2] = v; break;
  }
}

/** ASSEMBLE_RGBA for 2/4 bpp (PIXEL_FROM_RGBA, unmasked as in C) */
function pixelFromRGBA(f: PixelFormat, r: number, g: number, b: number, a: number): number {
  return (((r >>> f.Rloss) << f.Rshift) | ((g >>> f.Gloss) << f.Gshift) | ((b >>> f.Bloss) << f.Bshift)
    | ((a >>> f.Aloss) << f.Ashift)) >>> 0;
}

function assembleRGBA(s: Surface, off: number, bpp: number, f: PixelFormat, r: number, g: number, b: number, a: number): void {
  if (bpp === 3) {
    const p = s.pixels;
    p[off + (f.Rshift >> 3)] = r;
    p[off + (f.Gshift >> 3)] = g;
    p[off + (f.Bshift >> 3)] = b;
    return;
  }
  putPixel(s, off, bpp, pixelFromRGBA(f, r, g, b, a));
}

function blitCopy(b: BlitInfo): void {
  const { src, dst } = b;
  const bpp = dst.format.BytesPerPixel;
  const len = b.w * bpp;
  for (let y = 0; y < b.h; y++) {
    const so = (b.sy + y) * src.pitch + b.sx * bpp;
    const d = (b.dy + y) * dst.pitch + b.dx * bpp;
    dst.pixels.set(src.pixels.subarray(so, so + len), d);
  }
}

function blitCopyOverlap(b: BlitInfo): void {
  const { src, dst } = b;
  const bpp = dst.format.BytesPerPixel;
  const len = b.w * bpp;
  const rows: Uint8Array[] = [];
  for (let y = 0; y < b.h; y++) {
    const so = (b.sy + y) * src.pitch + b.sx * bpp;
    rows.push(src.pixels.slice(so, so + len));
  }
  for (let y = 0; y < b.h; y++) dst.pixels.set(rows[y], (b.dy + y) * dst.pitch + b.dx * bpp);
}

/** Map1toN: palette -> destination pixels (alpha from the source's per-surface alpha if dst has alpha) */
function map1toN(sf: PixelFormat, df: PixelFormat): Uint32Array {
  const pal = sf.palette!;
  const map = new Uint32Array(pal.ncolors);
  const alpha = df.Amask ? sf.alpha : 0;
  for (let i = 0; i < pal.ncolors; i++) {
    map[i] = pixelFromRGBA(df, pal.colors[i * 4], pal.colors[i * 4 + 1], pal.colors[i * 4 + 2], alpha);
  }
  return map;
}

function blit1toN(b: BlitInfo): void {
  const { src, dst } = b;
  const map = map1toN(src.format, dst.format);
  const dbpp = dst.format.BytesPerPixel;
  for (let y = 0; y < b.h; y++) {
    let so = (b.sy + y) * src.pitch + b.sx;
    let d = (b.dy + y) * dst.pitch + b.dx * dbpp;
    for (let x = 0; x < b.w; x++, so++, d += dbpp) {
      const v = map[src.pixels[so]];
      if (dbpp === 3) { dst.pixels[d] = v; dst.pixels[d + 1] = v >>> 8; dst.pixels[d + 2] = v >>> 16; } else putPixel(dst, d, dbpp, v);
    }
  }
}

function blit1toNKey(b: BlitInfo): void {
  const { src, dst } = b;
  const map = map1toN(src.format, dst.format);
  const ckey = src.format.colorkey;
  const dbpp = dst.format.BytesPerPixel;
  for (let y = 0; y < b.h; y++) {
    let so = (b.sy + y) * src.pitch + b.sx;
    let d = (b.dy + y) * dst.pitch + b.dx * dbpp;
    for (let x = 0; x < b.w; x++, so++, d += dbpp) {
      const c = src.pixels[so];
      if (c !== ckey) {
        const v = map[c];
        if (dbpp === 3) { dst.pixels[d] = v; dst.pixels[d + 1] = v >>> 8; dst.pixels[d + 2] = v >>> 16; } else putPixel(dst, d, dbpp, v);
      }
    }
  }
}

/** Blit1toNAlpha(Key): int arithmetic, so ALPHA_BLEND shifts arithmetically; ASSEMBLE_RGB (no alpha) */
function blit1toNAlphaImpl(b: BlitInfo, keyed: boolean): void {
  const { src, dst } = b;
  const pal = src.format.palette!.colors;
  const ckey = src.format.colorkey;
  const A = src.format.alpha;
  const df = dst.format;
  const dbpp = df.BytesPerPixel;
  for (let y = 0; y < b.h; y++) {
    let so = (b.sy + y) * src.pitch + b.sx;
    let d = (b.dy + y) * dst.pitch + b.dx * dbpp;
    for (let x = 0; x < b.w; x++, so++, d += dbpp) {
      const c = src.pixels[so];
      if (keyed && c === ckey) continue;
      const sR = pal[c * 4], sG = pal[c * 4 + 1], sB = pal[c * 4 + 2];
      const pixel = getPixel(dst, d, dbpp);
      let dR = ((pixel & df.Rmask) >>> df.Rshift) << df.Rloss;
      let dG = ((pixel & df.Gmask) >>> df.Gshift) << df.Gloss;
      let dB = ((pixel & df.Bmask) >>> df.Bshift) << df.Bloss;
      dR = (((sR - dR) * A + 255) >> 8) + dR;
      dG = (((sG - dG) * A + 255) >> 8) + dG;
      dB = (((sB - dB) * A + 255) >> 8) + dB;
      if (dbpp === 3) { dst.pixels[d + (df.Rshift >> 3)] = dR; dst.pixels[d + (df.Gshift >> 3)] = dG; dst.pixels[d + (df.Bshift >> 3)] = dB; } else {
        putPixel(dst, d, dbpp, (((dR >>> df.Rloss) << df.Rshift) | ((dG >>> df.Gloss) << df.Gshift) | ((dB >>> df.Bloss) << df.Bshift)) >>> 0);
      }
    }
  }
}
function blit1toNAlpha(b: BlitInfo): void { blit1toNAlphaImpl(b, false); }
function blit1toNAlphaKey(b: BlitInfo): void { blit1toNAlphaImpl(b, true); }

function blitNtoN(b: BlitInfo): void {
  const { src, dst } = b;
  const sf = src.format, df = dst.format;
  const sbpp = sf.BytesPerPixel, dbpp = df.BytesPerPixel;
  const alpha = df.Amask ? sf.alpha : 0;
  for (let y = 0; y < b.h; y++) {
    let so = (b.sy + y) * src.pitch + b.sx * sbpp;
    let d = (b.dy + y) * dst.pitch + b.dx * dbpp;
    for (let x = 0; x < b.w; x++, so += sbpp, d += dbpp) {
      const p = getPixel(src, so, sbpp);
      const r = ((p & sf.Rmask) >>> sf.Rshift) << sf.Rloss;
      const g = ((p & sf.Gmask) >>> sf.Gshift) << sf.Gloss;
      const bl = ((p & sf.Bmask) >>> sf.Bshift) << sf.Bloss;
      assembleRGBA(dst, d, dbpp, df, r, g, bl, alpha);
    }
  }
}

function blitNtoNCopyAlpha(b: BlitInfo): void {
  const { src, dst } = b;
  const sf = src.format, df = dst.format;
  const sbpp = sf.BytesPerPixel, dbpp = df.BytesPerPixel;
  for (let y = 0; y < b.h; y++) {
    let so = (b.sy + y) * src.pitch + b.sx * sbpp;
    let d = (b.dy + y) * dst.pitch + b.dx * dbpp;
    for (let x = 0; x < b.w; x++, so += sbpp, d += dbpp) {
      const p = getPixel(src, so, sbpp);
      assembleRGBA(dst, d, dbpp, df,
        ((p & sf.Rmask) >>> sf.Rshift) << sf.Rloss, ((p & sf.Gmask) >>> sf.Gshift) << sf.Gloss,
        ((p & sf.Bmask) >>> sf.Bshift) << sf.Bloss, ((p & sf.Amask) >>> sf.Ashift) << sf.Aloss);
    }
  }
}

function blit4to4MaskAlpha(b: BlitInfo): void {
  const { src, dst } = b;
  const sf = src.format, df = dst.format;
  let mask: number, or: boolean;
  if (df.Amask) { mask = ((sf.alpha >>> df.Aloss) << df.Ashift) >>> 0; or = true; } else { mask = (sf.Rmask | sf.Gmask | sf.Bmask) >>> 0; or = false; }
  for (let y = 0; y < b.h; y++) {
    let s = ((b.sy + y) * src.pitch >> 2) + b.sx;
    let d = ((b.dy + y) * dst.pitch >> 2) + b.dx;
    for (let x = 0; x < b.w; x++, s++, d++) dst.u32[d] = or ? (src.u32[s] | mask) : (src.u32[s] & mask);
  }
}

function blitNtoNKey(b: BlitInfo): void {
  const { src, dst } = b;
  const sf = src.format, df = dst.format;
  const sbpp = sf.BytesPerPixel, dbpp = df.BytesPerPixel;
  const alpha = df.Amask ? sf.alpha : 0;
  const rgbmask = (~sf.Amask) >>> 0;
  const ckey = (sf.colorkey & rgbmask) >>> 0;
  for (let y = 0; y < b.h; y++) {
    let so = (b.sy + y) * src.pitch + b.sx * sbpp;
    let d = (b.dy + y) * dst.pitch + b.dx * dbpp;
    for (let x = 0; x < b.w; x++, so += sbpp, d += dbpp) {
      const p = getPixel(src, so, sbpp);
      if (((p & rgbmask) >>> 0) !== ckey) {
        assembleRGBA(dst, d, dbpp, df, ((p & sf.Rmask) >>> sf.Rshift) << sf.Rloss,
          ((p & sf.Gmask) >>> sf.Gshift) << sf.Gloss, ((p & sf.Bmask) >>> sf.Bshift) << sf.Bloss, alpha);
      }
    }
  }
}

function blitNtoNKeyCopyAlpha(b: BlitInfo): void {
  const { src, dst } = b;
  const sf = src.format, df = dst.format;
  const sbpp = sf.BytesPerPixel, dbpp = df.BytesPerPixel;
  const rgbmask = (~sf.Amask) >>> 0;
  const ckey = (sf.colorkey & rgbmask) >>> 0;
  for (let y = 0; y < b.h; y++) {
    let so = (b.sy + y) * src.pitch + b.sx * sbpp;
    let d = (b.dy + y) * dst.pitch + b.dx * dbpp;
    for (let x = 0; x < b.w; x++, so += sbpp, d += dbpp) {
      let p = getPixel(src, so, sbpp);
      const r = ((p & sf.Rmask) >>> sf.Rshift) << sf.Rloss, g = ((p & sf.Gmask) >>> sf.Gshift) << sf.Gloss;
      const bl = ((p & sf.Bmask) >>> sf.Bshift) << sf.Bloss, a = ((p & sf.Amask) >>> sf.Ashift) << sf.Aloss;
      p = (p & ~sf.Amask) >>> 0;
      if (((p & rgbmask) >>> 0) !== ckey) assembleRGBA(dst, d, dbpp, df, r, g, bl, a);
    }
  }
}

/** BlitRGBtoRGBPixelAlpha: ARGB8888-style source (alpha in the top byte) onto the same RGB layout */
function blitRGBtoRGBPixelAlpha(b: BlitInfo): void {
  const { src, dst } = b;
  const su = src.u32, du = dst.u32;
  for (let y = 0; y < b.h; y++) {
    let sp = ((b.sy + y) * src.pitch >> 2) + b.sx;
    let dp = ((b.dy + y) * dst.pitch >> 2) + b.dx;
    for (let x = 0; x < b.w; x++, sp++, dp++) {
      let s = su[sp];
      const alpha = s >>> 24;
      if (alpha) {
        if (alpha === ALPHA_OPAQUE) {
          du[dp] = ((s & 0x00ffffff) | (du[dp] & 0xff000000)) >>> 0;
        } else {
          let d = du[dp];
          const dalpha = (d & 0xff000000) >>> 0;
          const s1 = s & 0xff00ff;
          let d1 = d & 0xff00ff;
          d1 = ((d1 + (Math.imul((s1 - d1) | 0, alpha) >>> 8)) & 0xff00ff) >>> 0;
          s &= 0xff00;
          d &= 0xff00;
          d = ((d + (Math.imul((s - d) | 0, alpha) >>> 8)) & 0xff00) >>> 0;
          du[dp] = (d1 | d | dalpha) >>> 0;
        }
      }
    }
  }
}

/** ALPHA_BLEND on unsigned ints, as in BlitNtoNPixelAlpha (results may carry into bit 24 and up) */
function blendU(s: number, d: number, A: number): number {
  return ((((Math.imul((s - d) | 0, A) + 255) >>> 0) >>> 8) + d) >>> 0;
}

function blitNtoNPixelAlpha(b: BlitInfo): void {
  const { src, dst } = b;
  const sf = src.format, df = dst.format;
  const sbpp = sf.BytesPerPixel, dbpp = df.BytesPerPixel;
  for (let y = 0; y < b.h; y++) {
    let so = (b.sy + y) * src.pitch + b.sx * sbpp;
    let d = (b.dy + y) * dst.pitch + b.dx * dbpp;
    for (let x = 0; x < b.w; x++, so += sbpp, d += dbpp) {
      const sp = getPixel(src, so, sbpp);
      const sA = ((sp & sf.Amask) >>> sf.Ashift) << sf.Aloss;
      if (sA) {
        const sR = ((sp & sf.Rmask) >>> sf.Rshift) << sf.Rloss;
        const sG = ((sp & sf.Gmask) >>> sf.Gshift) << sf.Gloss;
        const sB = ((sp & sf.Bmask) >>> sf.Bshift) << sf.Bloss;
        const dp = getPixel(dst, d, dbpp);
        let dR = ((dp & df.Rmask) >>> df.Rshift) << df.Rloss;
        let dG = ((dp & df.Gmask) >>> df.Gshift) << df.Gloss;
        let dB = ((dp & df.Bmask) >>> df.Bshift) << df.Bloss;
        const dA = ((dp & df.Amask) >>> df.Ashift) << df.Aloss;
        dR = blendU(sR, dR, sA);
        dG = blendU(sG, dG, sA);
        dB = blendU(sB, dB, sA);
        assembleRGBA(dst, d, dbpp, df, dR, dG, dB, dA);
      }
    }
  }
}

/** BlitRGBtoRGBSurfaceAlpha: per-surface alpha, same RGB layout, 8 bits per channel */
function blitRGBtoRGBSurfaceAlpha(b: BlitInfo): void {
  const { src, dst } = b;
  const alpha = src.format.alpha;
  const su = src.u32, du = dst.u32;
  for (let y = 0; y < b.h; y++) {
    let sp = ((b.sy + y) * src.pitch >> 2) + b.sx;
    let dp = ((b.dy + y) * dst.pitch >> 2) + b.dx;
    for (let x = 0; x < b.w; x++, sp++, dp++) {
      let s = su[sp], d = du[dp];
      const s1 = s & 0xff00ff;
      let d1 = d & 0xff00ff;
      d1 = ((d1 + (Math.imul((s1 - d1) | 0, alpha) >>> 8)) & 0xff00ff) >>> 0;
      s &= 0xff00;
      d &= 0xff00;
      d = ((d + (Math.imul((s - d) | 0, alpha) >>> 8)) & 0xff00) >>> 0;
      du[dp] = (d1 | d | 0xff000000) >>> 0;
    }
  }
}

function blitNtoNSurfaceAlphaImpl(b: BlitInfo, keyed: boolean): void {
  const { src, dst } = b;
  const sf = src.format, df = dst.format;
  const sbpp = sf.BytesPerPixel, dbpp = df.BytesPerPixel;
  const sA = sf.alpha;
  const ckey = sf.colorkey;
  for (let y = 0; y < b.h; y++) {
    let so = (b.sy + y) * src.pitch + b.sx * sbpp;
    let d = (b.dy + y) * dst.pitch + b.dx * dbpp;
    for (let x = 0; x < b.w; x++, so += sbpp, d += dbpp) {
      const sp = getPixel(src, so, sbpp);
      if (keyed && sp === ckey) continue;
      if (!sA) continue;
      const sR = ((sp & sf.Rmask) >>> sf.Rshift) << sf.Rloss;
      const sG = ((sp & sf.Gmask) >>> sf.Gshift) << sf.Gloss;
      const sB = ((sp & sf.Bmask) >>> sf.Bshift) << sf.Bloss;
      const dp = getPixel(dst, d, dbpp);
      const dA = ((dp & df.Amask) >>> df.Ashift) << df.Aloss;
      const dR = blendU(sR, ((dp & df.Rmask) >>> df.Rshift) << df.Rloss, sA);
      const dG = blendU(sG, ((dp & df.Gmask) >>> df.Gshift) << df.Gloss, sA);
      const dB = blendU(sB, ((dp & df.Bmask) >>> df.Bshift) << df.Bloss, sA);
      assembleRGBA(dst, d, dbpp, df, dR, dG, dB, dA);
    }
  }
}
function blitNtoNSurfaceAlpha(b: BlitInfo): void { blitNtoNSurfaceAlphaImpl(b, false); }
function blitNtoNSurfaceAlphaKey(b: BlitInfo): void { blitNtoNSurfaceAlphaImpl(b, true); }

/** SDL_FillRect (8 and 32 bpp) */
export function fillRect(dst: Surface, rect: Rect | null, color: number): void {
  let x = 0, y = 0, w = dst.w, h = dst.h;
  if (rect) {
    // SDL_IntersectRect with the clip rectangle; the rect is written back
    const c = dst.clip;
    let amin = rect.x, amax = amin + rect.w;
    if (c.x > amin) amin = c.x;
    if (c.x + c.w < amax) amax = c.x + c.w;
    rect.x = amin; rect.w = amax - amin > 0 ? amax - amin : 0;
    amin = rect.y; amax = amin + rect.h;
    if (c.y > amin) amin = c.y;
    if (c.y + c.h < amax) amax = c.y + c.h;
    rect.y = amin; rect.h = amax - amin > 0 ? amax - amin : 0;
    x = rect.x; y = rect.y; w = rect.w; h = rect.h;
    if (w <= 0 || h <= 0) return;
  }
  const bpp = dst.format.BytesPerPixel;
  for (let j = 0; j < h; j++) {
    let off = (y + j) * dst.pitch + x * bpp;
    for (let i = 0; i < w; i++, off += bpp) {
      if (bpp === 1) dst.pixels[off] = color; else putPixel(dst, off, bpp, color >>> 0);
    }
  }
}

/** SDL_ConvertSurface */
export function convertSurface(s: Surface, format: PixelFormat, flags: number): Surface {
  const c = createRGBSurface(flags, s.w, s.h, format.BitsPerPixel, format.Rmask, format.Gmask, format.Bmask, format.Amask);
  if (format.palette && c.format.palette) {
    c.format.palette.colors.set(format.palette.colors);
    c.format.palette.ncolors = format.palette.ncolors;
  }
  let surfaceFlags = s.flags;
  let colorkey = 0, alpha = 0;
  if ((surfaceFlags & SRCCOLORKEY) === SRCCOLORKEY) {
    if ((flags & SRCCOLORKEY) !== SRCCOLORKEY && format.Amask) {
      surfaceFlags &= ~SRCCOLORKEY;
    } else {
      colorkey = s.format.colorkey;
      setColorKey(s, 0, 0);
    }
  }
  if ((surfaceFlags & SRCALPHA) === SRCALPHA) {
    if (format.Amask) s.flags &= ~SRCALPHA;
    else { alpha = s.format.alpha; setAlpha(s, 0, 0); }
  }
  lowerBlit(s, 0, 0, c, 0, 0, s.w, s.h);
  c.clip = s.clip.clone();
  if ((surfaceFlags & SRCCOLORKEY) === SRCCOLORKEY) {
    const cflags = surfaceFlags & (SRCCOLORKEY | RLEACCELOK);
    const [r, g, b] = getRGB(colorkey, s.format);
    setColorKey(c, cflags | (flags & RLEACCELOK), mapRGB(c.format, r, g, b));
    setColorKey(s, cflags, colorkey);
  }
  if ((surfaceFlags & SRCALPHA) === SRCALPHA) {
    const aflags = surfaceFlags & (SRCALPHA | RLEACCELOK);
    setAlpha(c, aflags | (flags & RLEACCELOK), alpha);
    if (format.Amask) s.flags |= SRCALPHA; else setAlpha(s, aflags, alpha);
  }
  return c;
}

/** SDL_DisplayFormat: the screen's format, keeping colour key and alpha flags (no AUTORLE) */
export function displayFormat(s: Surface, screen: Surface): Surface {
  const flags = SWSURFACE | (s.flags & (SRCCOLORKEY | SRCALPHA | RLEACCELOK));
  return convertSurface(s, screen.format, flags);
}

/** the RGB of every pixel, row-major, through the surface's masks (for frame hashes) */
export function rgbAt(s: Surface, x: number, y: number): [number, number, number] {
  const f = s.format;
  const p = getPixel(s, y * s.pitch + x * f.BytesPerPixel, f.BytesPerPixel);
  return [((p & f.Rmask) >>> f.Rshift) << f.Rloss & 0xff, ((p & f.Gmask) >>> f.Gshift) << f.Gloss & 0xff,
    ((p & f.Bmask) >>> f.Bshift) << f.Bloss & 0xff];
}
