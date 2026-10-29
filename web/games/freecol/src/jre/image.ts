// @ts-nocheck
// java.awt.image.BufferedImage and javax.imageio.ImageIO for the browser. An image keeps its pixels in
// two places, each made when needed: an ARGB array (getRGB/setRGB, decoded files) and a 2D canvas
// (Graphics2D drawing, drawing the image elsewhere); whichever changed last is copied to the other
// before use. In node (tests) there is no canvas: drawing does nothing and pixels stay in the array.
import { $J, JObject, defineLib, exc, str, IOException, IllegalArgumentException, ArrayIndexOutOfBoundsException, RuntimeException } from './lang.ts';
import { vfs, File, InputStream } from './io.ts';
import { decodePNG, isPNG } from './png.ts';
import { decodeGIF, isGIF } from './gif.ts';
import jpeg from 'jpeg-js';

export const RasterFormatException = exc('RasterFormatException', RuntimeException, 'java.awt.image.RasterFormatException');

/** The canvas layer (set by the client worker): a 2D canvas of a size, or null (no drawing). */
export const canvases: any = {
  create: (_w: number, _h: number): { canvas: any; ctx: any } | null => null,
};

export class BufferedImage extends JObject {
  static TYPE_CUSTOM = 0;
  static TYPE_INT_RGB = 1;
  static TYPE_INT_ARGB = 2;
  static TYPE_INT_ARGB_PRE = 3;
  static TYPE_INT_BGR = 4;
  static TYPE_3BYTE_BGR = 5;
  static TYPE_4BYTE_ABGR = 6;
  static TYPE_4BYTE_ABGR_PRE = 7;
  static TYPE_USHORT_565_RGB = 8;
  static TYPE_USHORT_555_RGB = 9;
  static TYPE_BYTE_GRAY = 10;
  static TYPE_USHORT_GRAY = 11;
  static TYPE_BYTE_BINARY = 12;
  static TYPE_BYTE_INDEXED = 13;
  // java.awt.Image's
  static SCALE_DEFAULT = 1;
  static SCALE_FAST = 2;
  static SCALE_SMOOTH = 4;
  static SCALE_REPLICATE = 8;
  static SCALE_AREA_AVERAGING = 16;
  static UndefinedProperty = {};
  // java.awt.Transparency's
  static OPAQUE = 1;
  static BITMASK = 2;
  static TRANSLUCENT = 3;

  w = 0;
  h = 0;
  type = 2;
  /** Pixels (ARGB, not premultiplied), or null. */
  pix: Int32Array | null = null;
  pixValid = false;
  /** The canvas, or null. */
  surf: { canvas: any; ctx: any } | null = null;
  surfValid = false;
  /** getSubimage: this image is a window on parent's pixels at (ox, oy). */
  parent: BufferedImage | null = null;
  ox = 0;
  oy = 0;
  accelerationPriority = 0.5;

  constructor(a?: any, b?: any, c?: any, d?: any) {
    super();
    if (typeof a === 'number') this.$init(a, b, c ?? 2);
    else if (a !== undefined) {
      // (ColorModel, WritableRaster, premultiplied, properties): an image of a raster's pixels
      const raster = b;
      this.$init(raster.getWidth(), raster.getHeight(), a.hasAlpha() ? 2 : 1);
      const px = this.pixels();
      for (let y = 0; y < this.h; y++) {
        for (let x = 0; x < this.w; x++) px[y * this.w + x] = a.getRGB(raster.getDataElements(x, y, null));
      }
      void d;
    }
  }

  $init(w: number, h: number, type: number) {
    if (w <= 0 || h <= 0) throw new IllegalArgumentException('Width (' + w + ') and height (' + h + ') cannot be <= 0');
    this.w = w;
    this.h = h;
    this.type = type;
    return this;
  }

  /** An image of decoded pixels. */
  static $of(w: number, h: number, type: number, argb: Int32Array) {
    const img = new BufferedImage(w, h, type);
    img.pix = argb;
    img.pixValid = true;
    return img;
  }

  opaque() {
    return this.type === 1 || this.type === 4 || this.type === 5 || this.type === 8 || this.type === 9 || this.type === 10 || this.type === 11;
  }

  /** The pixels, current. */
  pixels(): Int32Array {
    if (this.parent) throw new Error('subimage pixels');
    if (!this.pix) {
      this.pix = new Int32Array(this.w * this.h);
      if (this.opaque()) this.pix.fill(0xff000000 | 0);
      this.pixValid = !this.surf;
    }
    if (!this.pixValid) {
      if (this.surf) {
        const d = this.surf.ctx.getImageData(0, 0, this.w, this.h).data;
        const p = this.pix;
        for (let i = 0, j = 0; i < p.length; i++, j += 4) p[i] = (d[j + 3] << 24) | (d[j] << 16) | (d[j + 1] << 8) | d[j + 2];
      }
      this.pixValid = true;
    }
    return this.pix;
  }

  /** The canvas, current (null without a canvas layer). */
  surface(): { canvas: any; ctx: any } | null {
    if (this.parent) return this.parent.surface();
    if (!this.surf) {
      this.surf = canvases.create(this.w, this.h);
      if (!this.surf) return null;
      if (!this.pix) {
        if (this.opaque()) {
          this.surf.ctx.fillStyle = '#000';
          this.surf.ctx.fillRect(0, 0, this.w, this.h);
        }
        this.surfValid = true;
      }
    }
    if (!this.surfValid && this.pix) {
      const id = this.surf.ctx.createImageData(this.w, this.h);
      const d = id.data, p = this.pix, op = this.opaque();
      for (let i = 0, j = 0; i < p.length; i++, j += 4) {
        const v = p[i];
        d[j] = (v >> 16) & 255;
        d[j + 1] = (v >> 8) & 255;
        d[j + 2] = v & 255;
        d[j + 3] = op ? 255 : (v >>> 24);
      }
      this.surf.ctx.putImageData(id, 0, 0);
    }
    this.surfValid = true;
    return this.surf;
  }

  /** Drawing changed the canvas. */
  $drawn() {
    if (this.parent) return this.parent.$drawn();
    this.pixValid = false;
  }

  /** Pixels changed. */
  $touched() {
    if (this.parent) return this.parent.$touched();
    this.surfValid = false;
  }

  getWidth(_o?: any) {
    return this.w;
  }
  getHeight(_o?: any) {
    return this.h;
  }
  getType() {
    return this.type;
  }
  getTransparency() {
    return this.opaque() ? 1 : this.type === 12 || this.type === 13 ? 2 : 3;
  }
  isAlphaPremultiplied() {
    return this.type === 3 || this.type === 7;
  }
  getColorModel() {
    const ColorModel = $J.load('java.awt.image.ColorModel');
    if (this.opaque()) return $J.make('java.awt.image.DirectColorModel', 'int,int,int,int', 24, 0xff0000, 0xff00, 0xff);
    return ColorModel.getRGBdefault();
  }
  getRGB(x: number, y: number, w?: number, h?: number, arr?: number[], off?: number, scan?: number) {
    if (w === undefined) {
      if (x < 0 || y < 0 || x >= this.w || y >= this.h) throw new ArrayIndexOutOfBoundsException('Coordinate out of bounds!');
      if (this.parent) return this.parent.getRGB(x + this.ox, y + this.oy);
      return this.pixels()[y * this.w + x];
    }
    const out = arr ?? new Array(off + h * scan).fill(0);
    for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) out[off + j * scan + i] = this.getRGB(x + i, y + j);
    return out;
  }
  setRGB(x: number, y: number, a: any, h?: number, arr?: number[], off?: number, scan?: number) {
    if (h === undefined) {
      if (x < 0 || y < 0 || x >= this.w || y >= this.h) throw new ArrayIndexOutOfBoundsException('Coordinate out of bounds!');
      if (this.parent) return this.parent.setRGB(x + this.ox, y + this.oy, a);
      this.pixels()[y * this.w + x] = this.opaque() ? (a | 0xff000000) : a;
      this.$touched();
      return;
    }
    const w = a;
    for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) this.setRGB(x + i, y + j, arr[off + j * scan + i]);
  }
  getSubimage(x: number, y: number, w: number, h: number) {
    if (x < 0 || y < 0 || x + w > this.w || y + h > this.h) throw new RasterFormatException('(x + width) is outside of Raster');
    const s = new BufferedImage(w, h, this.type);
    s.parent = this.parent ?? this;
    s.ox = x + this.ox;
    s.oy = y + this.oy;
    return s;
  }
  createGraphics() {
    return $J.load('java.awt.GraphicsEnvironment').getLocalGraphicsEnvironment().createGraphics(this);
  }
  getGraphics() {
    return this.createGraphics();
  }
  getSource() {
    // an ImageProducer of the pixels
    const px = this.getRGB(0, 0, this.w, this.h, null, 0, this.w);
    return $J.make('java.awt.image.MemoryImageSource', 'int,int,java.awt.image.ColorModel,int[],int,int', this.w, this.h,
      $J.load('java.awt.image.ColorModel').getRGBdefault(), px, 0, this.w);
  }
  getProperty(_n: string, _o?: any) {
    return BufferedImage.UndefinedProperty;
  }
  getPropertyNames() {
    return null;
  }
  getMinX() {
    return 0;
  }
  getMinY() {
    return 0;
  }
  flush() {}
  getAccelerationPriority() {
    return this.accelerationPriority;
  }
  setAccelerationPriority(p: number) {
    this.accelerationPriority = p;
  }
  getCapabilities(_gc: any) {
    return $J.make('java.awt.ImageCapabilities', 'boolean', false);
  }
  /** Image.getScaledInstance: smooth scaling by the canvas (Java's area averaging gives nearly the same). */
  getScaledInstance(w: number, h: number, _hints: number) {
    if (w < 0) w = Math.round((this.w * h) / this.h);
    if (h < 0) h = Math.round((this.h * w) / this.w);
    const out = new BufferedImage(w, h, 2);
    const g = out.createGraphics();
    g.drawImage$Image$int$int$int$int$ImageObserver(this, 0, 0, w, h, null);
    g.dispose();
    return out;
  }
  toString() {
    return 'BufferedImage@' + (this.hashCode() >>> 0).toString(16) + ': type = ' + this.type + ' w = ' + this.w + ' h = ' + this.h;
  }
}
defineLib(BufferedImage, 'java.awt.image.BufferedImage', {
  sup: 'java.awt.Image', ifaces: ['java.awt.image.WritableRenderedImage', 'java.awt.Transparency', 'java.awt.image.RenderedImage'],
});

/* ------------------------------------------------------------------ ImageIO */

/** Decodes an image file (PNG, JPEG) as ImageIO.read does. */
export function decodeImage(bytes: Uint8Array): BufferedImage | null {
  if (isPNG(bytes)) {
    const d = decodePNG(bytes);
    return BufferedImage.$of(d.width, d.height, d.type || (d.alpha ? 6 : 5), d.argb);
  }
  if (isGIF(bytes)) {
    const d = decodeGIF(bytes);
    return BufferedImage.$of(d.width, d.height, 13, d.argb);
  }
  if (bytes[0] === 0xff && bytes[1] === 0xd8) {
    const d = jpeg.decode(bytes, { useTArray: true, formatAsRGBA: true });
    const argb = new Int32Array(d.width * d.height);
    const p = d.data;
    for (let i = 0, j = 0; i < argb.length; i++, j += 4) argb[i] = (255 << 24) | (p[j] << 16) | (p[j + 1] << 8) | p[j + 2];
    return BufferedImage.$of(d.width, d.height, 5, argb);
  }
  return null;
}

function bytesOf(src: any): Uint8Array | null {
  if (src == null) throw new IllegalArgumentException('input == null!');
  if (src instanceof File) return vfs.read(src.getAbsolutePath());
  if (src instanceof InputStream) return src.readAllBytes();
  if (typeof src.openStream === 'function') return src.openStream().readAllBytes(); // URL
  if (typeof src.toFile === 'function') return vfs.read(src.toFile().getAbsolutePath()); // Path
  return null;
}

export class ImageIO {
  static read(src: any) {
    const b = bytesOf(src);
    if (b == null) throw new IOException('Can\'t read input file!');
    return decodeImage(b);
  }
  static write(img: any, format: string, out: any) {
    // saving images (the map editor's thumbnails): PNG through the platform encoder, if any
    if (!canvases.encodePNG) return false;
    const bytes = canvases.encodePNG(img);
    if (out instanceof File) vfs.write(out.getAbsolutePath(), bytes);
    else out.write(bytes);
    void format;
    return true;
  }
  static getReaderFormatNames() {
    return ['png', 'jpg', 'jpeg', 'PNG', 'JPG', 'JPEG'];
  }
  static getWriterFormatNames() {
    return ['png', 'PNG'];
  }
  static setUseCache(_b: boolean) {}
  static scanForPlugins() {}
}
defineLib(ImageIO, 'javax.imageio.ImageIO');
void str;

/* ------------------------------------------------------------------ Toolkit.createImage */

/** The pixels an ImageProducer delivers (MemoryImageSource, filters of Swing's disabled icons), as an image. */
export function imageFromProducer(producer: any): BufferedImage | null {
  let w = 0, h = 0, img: BufferedImage | null = null;
  const consumer = {
    setDimensions(a: number, b: number) {
      w = a;
      h = b;
      if (w > 0 && h > 0) img = new BufferedImage(w, h, 2);
    },
    setProperties(_p: any) {},
    setColorModel(_m: any) {},
    setHints(_h: number) {},
    setPixels(x: number, y: number, pw: number, ph: number, model: any, pixels: any, off: number, scan: number) {
      if (!img) return;
      const px = img.pixels();
      for (let j = 0; j < ph; j++) {
        for (let i = 0; i < pw; i++) {
          const v = pixels[off + j * scan + i];
          px[(y + j) * w + x + i] = model.getRGB(typeof v === 'number' && pixels instanceof Int8Array ? v & 255 : v);
        }
      }
      img.$touched();
    },
    imageComplete(_s: number) {},
  };
  const ImageConsumer = $J.load('java.awt.image.ImageConsumer');
  Object.setPrototypeOf(consumer, Object.create(JObject.prototype));
  (consumer as any).constructor = { $meta: { name: 'sun.awt.image.WebImageConsumer', kind: 'class', ifaces: ['java.awt.image.ImageConsumer'] } };
  void ImageConsumer;
  producer.startProduction(consumer);
  return img;
}

/** Toolkit.createImage and getImage: bytes, a file name, a URL or an ImageProducer. */
export function createImage(src: any): BufferedImage | null {
  if (src == null) return null;
  if (src instanceof Uint8Array || Array.isArray(src)) return decodeImage(Uint8Array.from(src, (x: number) => x & 255));
  if (typeof src === 'string') {
    const b = vfs.read(src);
    return b ? decodeImage(b) : null;
  }
  if (typeof src.startProduction === 'function') return imageFromProducer(src);
  const b = bytesOf(src);
  return b ? decodeImage(b) : null;
}
