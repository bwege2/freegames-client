// The Imlib2 functions COW calls (x11sprite.c loads its images from the pixmap directory, camera.c saves
// screenshots), as the client oracle's Imlib2 stub (re/netrek/oracle/client/imlib.c) does them: a PNG is
// known by its header (width, height, alpha as Imlib2's loader decides it: colour type 4 or 6, or a tRNS
// chunk), rendering makes a pixmap of its size (depth 24) and, with alpha, a mask (depth 1), and every
// load, render and save is logged. The browser also gets the pixels (setImageDecoder), so that the X
// server can draw the images.
import { Ptr } from './ptr.ts';
import { jstr } from './cstring.ts';
import { fsRead, normPath } from './fs.ts';
import { platform } from './platform.ts';
import { newSurface, type Surface } from '../xlib/raster.ts';

interface Image {
  file: string;
  w: number;
  h: number;
  alpha: boolean;
}

let cur: Image | null = null;
let curDrawable = 0;

/** decoded pixels of an image file (RGBA, row by row), for the browser's X server; null in the tests */
export type ImageDecoder = (path: string) => { w: number; h: number; rgba: Uint8ClampedArray } | null;
let decoder: ImageDecoder | null = null;

export function setImageDecoder(d: ImageDecoder | null): void {
  decoder = d;
}

export function resetImlib(): void {
  cur = null;
  curDrawable = 0;
}

const be32 = (b: Uint8Array, i: number) => ((b[i] << 24) | (b[i + 1] << 16) | (b[i + 2] << 8) | b[i + 3]) >>> 0;

function log(line: string): void {
  platform().x.logLine(line);
}

export function imlib_load_image(file: Ptr): Image | null {
  const name = jstr(file);
  const b = fsRead(name);
  const sig = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a];
  if (!b || b.length < 33 || sig.some((v, i) => b[i] !== v) || String.fromCharCode(...b.subarray(12, 16)) !== 'IHDR') {
    log(`imlib_load_image "${name}" none`);
    return null;
  }
  const im: Image = { file: name, w: be32(b, 16) | 0, h: be32(b, 20) | 0, alpha: false };
  const ct = b[25];
  im.alpha = ct === 4 || ct === 6;
  // the chunks after IHDR, up to IDAT: a tRNS chunk gives alpha
  let at = 33;
  while (!im.alpha && at + 8 <= b.length) {
    const len = be32(b, at);
    const type = String.fromCharCode(...b.subarray(at + 4, at + 8));
    if (type === 'tRNS') im.alpha = true;
    if (type === 'IDAT' || type === 'IEND') break;
    at += 8 + len + 4;
  }
  log(`imlib_load_image "${name}" ${im.w}x${im.h} alpha=${im.alpha ? 1 : 0}`);
  return im;
}

export function imlib_context_set_display(_d: any): void {}
export function imlib_context_set_visual(_v: any): void {}
export function imlib_context_set_colormap(_c: any): void {}
export function imlib_context_set_drawable(d: number): void { curDrawable = d; }
export function imlib_context_set_image(im: Image | null): void { cur = im; }
export function imlib_context_set_color_modifier(_m: any): void {}
export function imlib_context_set_operation(_o: number): void {}
export function imlib_image_get_width(): number { return cur ? cur.w : 0; }
export function imlib_image_get_height(): number { return cur ? cur.h : 0; }

export function imlib_render_pixmaps_for_whole_image(pixRet: Ptr | null, maskRet: Ptr | null): void {
  if (!cur) return;
  const x = platform().x;
  const p = x.newPixmap(cur.w, cur.h, 24);
  let m = 0;
  if (maskRet && cur.alpha) m = x.newPixmap(cur.w, cur.h, 1);
  if (pixRet) pixRet.a[pixRet.o] = p;
  if (maskRet) maskRet.a[maskRet.o] = m;
  log(`imlib_render_pixmaps_for_whole_image "${cur.file}" for=${x.dname(curDrawable)} ${cur.w}x${cur.h} -> ${x.dname(p)} mask=${m ? x.dname(m) : 'none'}`);
  if (x.render && decoder) {
    const img = decoder(normPath(cur.file));
    if (img && img.w === cur.w && img.h === cur.h) {
      const s: Surface = newSurface(img.w, img.h, 24);
      const ms: Surface | null = m ? newSurface(img.w, img.h, 1) : null;
      for (let i = 0; i < img.w * img.h; i++) {
        s.data[i] = (img.rgba[4 * i] << 16) | (img.rgba[4 * i + 1] << 8) | img.rgba[4 * i + 2];
        if (ms) ms.data[i] = img.rgba[4 * i + 3] >= 128 ? 1 : 0;
      }
      x.images.set(p, s);
      if (ms) x.images.set(m, ms);
    }
  }
}

export function imlib_free_image_and_decache(): void {
  cur = null;
}

/** camera.c (the screenshot key): the image is not represented; the call and the file are logged */
export function imlib_create_image_from_drawable(_mask: number, x: number, y: number, w: number, h: number, _grab: number): Image {
  const xs = platform().x;
  log(`imlib_create_image_from_drawable ${xs.dname(curDrawable)} ${x | 0},${y | 0} ${w | 0}x${h | 0}`);
  return { file: `(${xs.dname(curDrawable)})`, w, h, alpha: false };
}

export function imlib_image_attach_data_value(key: Ptr, _data: any, value: number, _f: any): void {
  log(`imlib_image_attach_data_value "${jstr(key)}" ${value | 0}`);
}

export function imlib_save_image(file: Ptr): void {
  log(`imlib_save_image "${jstr(file)}"`);
}
