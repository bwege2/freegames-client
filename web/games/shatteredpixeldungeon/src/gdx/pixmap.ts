// @ts-nocheck
// com.badlogic.gdx.graphics.Pixmap (and Gdx2DPixmap) without a GPU: pixels in memory in the pixmap's format,
// PNG files decoded (png.ts). libGDX's headless backend (the oracle's) loads the game's textures into Pixmaps
// too, and the game reads their sizes while it sets up (TextureFilm of the item sprites when the hero's items
// are made), so the headless port needs them. As libGDX's gdx2d (Apache-2.0, see core.ts): the pixels are
// bytes in the format's layout (Alpha 1 byte, LuminanceAlpha 2, RGB888 3, RGBA8888 4: R, G, B, A), getPixels()
// is a ByteBuffer over them (FreeType's glyph bitmaps are written into it), colours are RGBA8888 ints,
// blending is SourceOver unless set to None, and a decoded PNG has the format of its channels (stb_image).
import { JObject, defineLib } from '../jre/lang.ts';
import { ByteBuffer } from '../jre/nio.ts';
import { GdxRuntimeException } from './core.ts';
import { Pixmap_Format, Pixmap_Blending, Pixmap_Filter } from './stubs.ts';
import jpeg from 'jpeg-js';
import { decodePNG, isPNG } from './png.ts';

const f = Math.fround;

/** gdx2d's blend(src, dst) of two RGBA8888 colours. */
function blend(src: number, dst: number): number {
  const sr = src >>> 24, sg = (src >>> 16) & 0xff, sb = (src >>> 8) & 0xff, sa = src & 0xff;
  let dr = dst >>> 24, dg = (dst >>> 16) & 0xff, db = (dst >>> 8) & 0xff, da = dst & 0xff;
  dr = dr + Math.trunc((sa * (sr - dr)) / 255);
  dg = dg + Math.trunc((sa * (sg - dg)) / 255);
  db = db + Math.trunc((sa * (sb - db)) / 255);
  da = Math.trunc(f(f(1 - f(f(1 - f(sa / 255)) * f(1 - f(da / 255)))) * 255));
  return ((dr << 24) | (dg << 16) | (db << 8) | da) | 0;
}

/** Bytes per pixel of a format (gdx2d_bytes_per_pixel). */
function bpp(format: any): number {
  switch (format) {
  case Pixmap_Format.Alpha: case Pixmap_Format.Intensity: return 1;
  case Pixmap_Format.LuminanceAlpha: case Pixmap_Format.RGB565: case Pixmap_Format.RGBA4444: return 2;
  case Pixmap_Format.RGB888: return 3;
  default: return 4;
  }
}

/** gdx2d's Gdx2DPixmap: the pixel memory of a Pixmap (width, height, format). */
export class Gdx2DPixmap extends JObject {
  static GDX2D_FORMAT_ALPHA = 1;
  static GDX2D_FORMAT_LUMINANCE_ALPHA = 2;
  static GDX2D_FORMAT_RGB888 = 3;
  static GDX2D_FORMAT_RGBA8888 = 4;
  static GDX2D_FORMAT_RGB565 = 5;
  static GDX2D_FORMAT_RGBA4444 = 6;
  width: number;
  height: number;
  format: any;
  data: Int8Array;
  constructor(width: number, height: number, gdx2dFormat: number | any) {
    super();
    this.width = width;
    this.height = height;
    this.format = typeof gdx2dFormat === 'number' ? Pixmap_Format.fromGdx2DPixmapFormat(gdx2dFormat) : gdx2dFormat;
    this.data = new Int8Array(width * height * bpp(this.format));
  }
  getWidth() { return this.width; }
  getHeight() { return this.height; }
  getFormat() { return Pixmap_Format.toGdx2DPixmapFormat(this.format); }
  getPixels() { return new ByteBuffer(this.data); }
  dispose() {}
}
defineLib(Gdx2DPixmap, 'com.badlogic.gdx.graphics.g2d.Gdx2DPixmap');

Object.assign(Pixmap_Format, {
  toGdx2DPixmapFormat(format: any): number {
    switch (format) {
    case Pixmap_Format.Alpha: case Pixmap_Format.Intensity: return 1;
    case Pixmap_Format.LuminanceAlpha: return 2;
    case Pixmap_Format.RGB565: return 5;
    case Pixmap_Format.RGBA4444: return 6;
    case Pixmap_Format.RGB888: return 3;
    case Pixmap_Format.RGBA8888: return 4;
    default: throw new GdxRuntimeException('Unknown Format: ' + format);
    }
  },
  fromGdx2DPixmapFormat(format: number): any {
    switch (format) {
    case 1: return Pixmap_Format.Alpha;
    case 2: return Pixmap_Format.LuminanceAlpha;
    case 5: return Pixmap_Format.RGB565;
    case 6: return Pixmap_Format.RGBA4444;
    case 3: return Pixmap_Format.RGB888;
    case 4: return Pixmap_Format.RGBA8888;
    default: throw new GdxRuntimeException('Unknown Gdx2DPixmap Format: ' + format);
    }
  },
});

export class Pixmap extends JObject {
  pm: Gdx2DPixmap;
  color = 0;
  blending: any = Pixmap_Blending.SourceOver;
  filter: any = Pixmap_Filter.BiLinear;
  disposed = false;
  /** new Pixmap(FileHandle), new Pixmap(byte[], offset, length), new Pixmap(width, height, Format), new Pixmap(Gdx2DPixmap). */
  constructor(a?: any, b?: any, c?: any) {
    super();
    if (a === undefined) return;
    if (a instanceof Gdx2DPixmap) {
      this.pm = a;
      return;
    }
    if (typeof a === 'number') {
      this.pm = new Gdx2DPixmap(a, b, c ?? Pixmap_Format.RGBA8888);
      this.setColor(0, 0, 0, 0);
      this.fill();
      return;
    }
    let bytes: Uint8Array;
    if (Array.isArray(a) || a instanceof Uint8Array || a instanceof Int8Array) {
      const all = Uint8Array.from(a as any, (x: number) => x & 0xff);
      bytes = all.subarray(b ?? 0, (b ?? 0) + (c ?? all.length));
    } else {
      bytes = a.bytesOrThrow();
    }
    if (bytes[0] === 0xff && bytes[1] === 0xd8) {
      // a JPEG (the splash art): RGB888, as stb_image decodes it
      const j = jpeg.decode(bytes, { useTArray: true, formatAsRGBA: true });
      this.pm = new Gdx2DPixmap(j.width, j.height, Pixmap_Format.RGB888);
      const dst = this.pm.data;
      for (let i = 0, n = j.width * j.height; i < n; i++) {
        dst[3 * i] = j.data[4 * i]; dst[3 * i + 1] = j.data[4 * i + 1]; dst[3 * i + 2] = j.data[4 * i + 2];
      }
      return;
    }
    if (!isPNG(bytes)) throw new GdxRuntimeException("Couldn't load file: " + (a.path ? a.path() : 'bytes'));
    const d = decodePNG(bytes);
    // stb_image's channels: grey -> Alpha (1), grey with alpha -> LuminanceAlpha (2), RGB (3), RGBA or with tRNS (4)
    const format = d.type === 10 || d.type === 11 ? Pixmap_Format.Alpha : d.alpha ? Pixmap_Format.RGBA8888 : Pixmap_Format.RGB888;
    this.pm = new Gdx2DPixmap(d.width, d.height, format);
    const old = this.blending;
    this.blending = Pixmap_Blending.None;
    for (let i = 0; i < d.argb.length; i++) {
      const v = d.argb[i];
      this.put(i % d.width, Math.floor(i / d.width), ((v << 8) | (v >>> 24)) | 0);
    }
    this.blending = old;
  }
  getWidth() { return this.pm.width; }
  getHeight() { return this.pm.height; }
  getFormat() { return this.pm.format; }
  getGLFormat() {
    switch (this.pm.format) {
    case Pixmap_Format.Alpha: return 6406; // GL_ALPHA
    case Pixmap_Format.LuminanceAlpha: return 6410; // GL_LUMINANCE_ALPHA
    case Pixmap_Format.RGB888: case Pixmap_Format.RGB565: return 6407; // GL_RGB
    default: return 6408; // GL_RGBA
    }
  }
  getGLInternalFormat() { return this.getGLFormat(); }
  getGLType() {
    switch (this.pm.format) {
    case Pixmap_Format.RGB565: return 33635;
    case Pixmap_Format.RGBA4444: return 32819;
    default: return 5121; // GL_UNSIGNED_BYTE
    }
  }
  setBlending(b: any) { this.blending = b; }
  getBlending() { return this.blending; }
  setFilter(fl: any) { this.filter = fl; }
  getFilter() { return this.filter; }
  /** setColor(int rgba8888), setColor(r, g, b, a), setColor(Color). */
  setColor(r: any, g?: number, b?: number, a?: number) {
    if (typeof r === 'number' && g === undefined) this.color = r | 0;
    else if (typeof r === 'number') this.color = (((r * 255) << 24) | ((g * 255) << 16) | ((b * 255) << 8) | (a * 255)) | 0;
    else this.color = (((r.r * 255) << 24) | ((r.g * 255) << 16) | ((r.b * 255) << 8) | (r.a * 255)) | 0;
  }
  /** The pixel as RGBA8888 (gdx2d_get_pixel, to_RGBA8888). */
  getPixel(x: number, y: number): number {
    const pm = this.pm;
    if (x < 0 || y < 0 || x >= pm.width || y >= pm.height) return 0;
    const d = pm.data, i = (y * pm.width + x) * bpp(pm.format);
    switch (pm.format) {
    case Pixmap_Format.Alpha: case Pixmap_Format.Intensity: return ((d[i] & 0xff) | 0xffffff00) | 0;
    case Pixmap_Format.LuminanceAlpha: { const l = d[i] & 0xff; return ((l << 24) | (l << 16) | (l << 8) | (d[i + 1] & 0xff)) | 0; }
    case Pixmap_Format.RGB888: return (((d[i] & 0xff) << 24) | ((d[i + 1] & 0xff) << 16) | ((d[i + 2] & 0xff) << 8) | 0xff) | 0;
    case Pixmap_Format.RGBA8888: return (((d[i] & 0xff) << 24) | ((d[i + 1] & 0xff) << 16) | ((d[i + 2] & 0xff) << 8) | (d[i + 3] & 0xff)) | 0;
    default: throw new GdxRuntimeException('Pixmap format not supported here: ' + pm.format);
    }
  }
  /** Stores an RGBA8888 colour in the pixmap's format (to_format), without blending. */
  put(x: number, y: number, c: number) {
    const pm = this.pm;
    const d = pm.data, i = (y * pm.width + x) * bpp(pm.format);
    switch (pm.format) {
    case Pixmap_Format.Alpha: case Pixmap_Format.Intensity: d[i] = c; break;
    case Pixmap_Format.LuminanceAlpha: {
      const l = Math.trunc(f(f(f((c >>> 24) * f(0.2126)) + f(((c >>> 16) & 0xff) * f(0.7152))) + f(((c >>> 8) & 0xff) * f(0.0722)))) & 0xff;
      d[i] = l; d[i + 1] = c;
      break;
    }
    case Pixmap_Format.RGB888: d[i] = c >> 24; d[i + 1] = c >> 16; d[i + 2] = c >> 8; break;
    case Pixmap_Format.RGBA8888: d[i] = c >> 24; d[i + 1] = c >> 16; d[i + 2] = c >> 8; d[i + 3] = c; break;
    default: throw new GdxRuntimeException('Pixmap format not supported here: ' + pm.format);
    }
  }
  set(x: number, y: number, c: number) {
    if (x < 0 || y < 0 || x >= this.pm.width || y >= this.pm.height) return;
    this.put(x, y, this.blending === Pixmap_Blending.None ? c : blend(c, this.getPixel(x, y)));
  }
  drawPixel(x: number, y: number, c?: number) { this.set(x, y, c === undefined ? this.color : c); }
  /** fill() sets every pixel to the colour, without blending (gdx2d_clear). */
  fill() {
    for (let y = 0; y < this.pm.height; y++) for (let x = 0; x < this.pm.width; x++) this.put(x, y, this.color);
  }
  fillRectangle(x: number, y: number, w: number, h: number) {
    for (let j = y; j < y + h; j++) for (let i = x; i < x + w; i++) this.set(i, j, this.color);
  }
  drawRectangle(x: number, y: number, w: number, h: number) {
    for (let i = x; i < x + w; i++) { this.set(i, y, this.color); this.set(i, y + h - 1, this.color); }
    for (let j = y + 1; j < y + h - 1; j++) { this.set(x, j, this.color); this.set(x + w - 1, j, this.color); }
  }
  fillCircle(cx: number, cy: number, r: number) {
    for (let j = -r; j <= r; j++) for (let i = -r; i <= r; i++) if (i * i + j * j <= r * r) this.set(cx + i, cy + j, this.color);
  }
  /**
   * drawPixmap(p, x, y), drawPixmap(p, x, y, srcx, srcy, srcw, srch), drawPixmap(p, srcx, srcy, srcw, srch, dstx,
   * dsty, dstw, dsth) (scaled nearest-neighbour).
   */
  drawPixmap(p: Pixmap, a: number, b: number, c?: number, d?: number, e?: number, g?: number, h?: number, k?: number) {
    if (h !== undefined) {
      const [srcx, srcy, srcw, srch, dstx, dsty, dstw, dsth] = [a, b, c, d, e, g, h, k];
      for (let j = 0; j < dsth; j++) for (let i = 0; i < dstw; i++) {
        this.set(dstx + i, dsty + j, p.getPixel(srcx + Math.floor((i * srcw) / dstw), srcy + Math.floor((j * srch) / dsth)));
      }
      return;
    }
    let sx = 0, sy = 0, sw = p.getWidth(), sh = p.getHeight();
    if (c !== undefined) { sx = c; sy = d; sw = e; sh = g; }
    for (let j = 0; j < sh; j++) for (let i = 0; i < sw; i++) {
      if (sx + i < p.getWidth() && sy + j < p.getHeight()) this.set(a + i, b + j, p.getPixel(sx + i, sy + j));
    }
  }
  /** The pixel memory (a ByteBuffer over it: what is put in it changes the pixmap; glTexImage2D reads it). */
  getPixels() { return this.pm.getPixels(); }
  dispose() {
    if (this.disposed) throw new GdxRuntimeException('Pixmap already disposed!');
    this.disposed = true;
  }
  isDisposed() { return this.disposed; }
}
defineLib(Pixmap, 'com.badlogic.gdx.graphics.Pixmap', { ifaces: ['com.badlogic.gdx.utils.Disposable'] });
