// x11/bitmaps.c: the textures as X pixmaps with clip masks, drawn point by point as the original does
// (XDrawPoint for every pixel of the image and of its mask), created when first used.
import { G } from './G.ts';
import { BMS_UNINITIALIZED, BMS_INITIALIZED, BMS_READY, BMS_ERROR, BM_LOGO, BM_SCORE_BG, NUM_OBJECT_BITMAPS } from './consts.ts';
import { onReset } from './cutil.ts';
import { error } from './error.ts';
import * as X from '../xlib/xlib.ts';
import type { GC } from '../xlib/xlib.ts';
import type { irec_t } from './G.ts';
import { newPicture, Picture_get_pixel, Picture_get_pixel_area, Picture_init, RED_VALUE, GREEN_VALUE, BLUE_VALUE, RGB24, type bbox_t, type xp_picture_t } from './gfx2d.ts';
import { RGB } from './colors.ts';
import { SET_FG } from './paintdata.ts';
import { UWINSCALE } from './paint.ts';

export interface xp_bitmap_t { bitmap: number; mask: number; bbox: bbox_t; rgb: number }
export interface xp_pixmap_t {
  filename: string;
  count: number;
  state: number;
  width: number;
  height: number;
  scalable: boolean;
  bitmaps: xp_bitmap_t[];
  picture: xp_picture_t;
}

const OBJECT_PIXMAPS: [string, number][] = [
  ['holder1.ppm', 1], ['holder2.ppm', 1], ['ball.ppm', 1], ['ship_red.ppm', 128], ['ship_blue.ppm', 128], ['ship_red2.ppm', 128],
  ['bullet.ppm', -16], ['bullet_blue.ppm', -16], ['base_down.ppm', 1], ['base_left.ppm', 1], ['base_up.ppm', 1], ['base_right.ppm', 1],
  ['fuelcell.ppm', 1], ['fuel2.ppm', -16], ['allitems.ppm', -30], ['cannon_down.ppm', 1], ['cannon_left.ppm', 1], ['cannon_up.ppm', 1],
  ['cannon_right.ppm', 1], ['sparks.ppm', -8], ['paused.ppm', -2], ['wall_top.ppm', 1], ['wall_left.ppm', 1], ['wall_bottom.ppm', 1],
  ['wall_right.ppm', 1], ['wall_ul.ppm', 1], ['wall_ur.ppm', 1], ['wall_dl.ppm', 1], ['wall_dr.ppm', 1], ['wall_fi.ppm', 1],
  ['wall_url.ppm', 1], ['wall_ull.ppm', 1], ['clouds.ppm', 1], ['logo.ppm', 1], ['refuel.ppm', -4], ['wormhole.ppm', 8],
  ['mine_team.ppm', 1], ['mine_other.ppm', 1], ['concentrator.ppm', 32], ['plus.ppm', 1], ['minus.ppm', 1], ['checkpoint.ppm', -2],
  ['meter.ppm', -2], ['asteroidconcentrator.ppm', 32], ['ball_gray16.ppm', -16],
];

/** every texture file the client may load (the object textures above; maps name others of lib/textures) */
export const TEXTURE_FILES = OBJECT_PIXMAPS.map(([f]) => f);

const B = { pixmaps: [] as xp_pixmap_t[], maskGC: null as GC | null };
onReset(() => Object.assign(B, { pixmaps: [], maskGC: null }));

export const pixmaps = (): xp_pixmap_t[] => B.pixmaps;

function newPixmap(filename: string, count: number, scalable: boolean): xp_pixmap_t {
  return { filename, count, state: BMS_UNINITIALIZED, width: 0, height: 0, scalable, bitmaps: [], picture: newPicture() };
}

export function Bitmaps_init(): number {
  for (let i = 0; i < NUM_OBJECT_BITMAPS; i++) {
    const [f, c] = OBJECT_PIXMAPS[i];
    B.pixmaps.push(newPixmap(f, c, !(i === BM_LOGO || i === BM_SCORE_BG)));
  }
  return 0;
}

export function Bitmaps_cleanup(): void {
  B.pixmaps = [];
}

export function Bitmap_add(filename: string, count: number, scalable: boolean): number {
  B.pixmaps.push(newPixmap(filename, count, scalable));
  return B.pixmaps.length - 1;
}

function Bitmap_init(img: number): number {
  const pm = B.pixmaps[img];
  const count = Math.abs(pm.count);
  pm.bitmaps = Array.from({ length: count }, () => ({ bitmap: 0, mask: 0, bbox: { xmin: 0, ymin: 0, xmax: 0, ymax: 0 }, rgb: -1 }));
  if (Picture_init(pm.picture, pm.filename, pm.count) === -1) {
    pm.state = BMS_ERROR;
    return -1;
  }
  pm.width = pm.picture.width;
  pm.height = pm.picture.height;
  pm.state = BMS_INITIALIZED;
  return 0;
}

export function Bitmap_create(d: number, img: number): number {
  const pix = B.pixmaps[img];
  if (pix.state === BMS_UNINITIALIZED) Bitmap_init(img);
  if (pix.state !== BMS_INITIALIZED) return -1;
  for (let j = 0; j < Math.abs(pix.count); j++) {
    if (pix.scalable) {
      pix.width = UWINSCALE(pix.picture.width);
      pix.height = UWINSCALE(pix.picture.height);
    }
    if (Bitmap_create_begin(d, pix, j) === -1) {
      pix.state = BMS_ERROR;
      return -1;
    }
    if (pix.height === pix.picture.height && pix.width === pix.picture.width) Bitmap_picture_copy(pix, j);
    else Bitmap_picture_scale(pix, j);
  }
  pix.state = BMS_READY;
  return 0;
}

export function Bitmap_update_scale(): void {
  for (const p of B.pixmaps) if (p.state === BMS_READY && p.scalable) p.state = BMS_INITIALIZED;
}

export function Bitmap_get(d: number, img: number, bmp: number): xp_bitmap_t | null {
  if (!G.fullColor || img < 0 || img >= B.pixmaps.length) return null;
  if (B.pixmaps[img].state !== BMS_READY) if (Bitmap_create(d, img) === -1) return null;
  return B.pixmaps[img].bitmaps[bmp] ?? null;
}

function Bitmap_blend_with_color(img: number, bmp: number, rgb: number): void {
  const pix = B.pixmaps[img];
  pix.bitmaps[bmp].rgb = rgb;
  const scaled = pix.height !== pix.picture.height || pix.width !== pix.picture.width;
  let dxs = 0, dys = 0, ys = 0;
  if (scaled) {
    dxs = pix.picture.width / pix.width;
    dys = pix.picture.height / pix.height;
  }
  const r2 = (rgb >> 16) & 0xff, g2 = (rgb >> 8) & 0xff, b2 = rgb & 0xff;
  for (let y = 0; y < pix.height; y++) {
    let xs = 0;
    for (let x = 0; x < pix.width; x++) {
      const color = scaled ? Picture_get_pixel_area(pix.picture, bmp, xs, ys, dxs, dys) : Picture_get_pixel(pix.picture, bmp, x, y);
      const r = Math.trunc((RED_VALUE(color) * r2) / 0xff), g = Math.trunc((GREEN_VALUE(color) * g2) / 0xff), b = Math.trunc((BLUE_VALUE(color) * b2) / 0xff);
      Bitmap_set_pixel(pix, bmp, x, y, RGB24(r, g, b));
      if (scaled) xs += dxs;
    }
    if (scaled) ys += dys;
  }
}

export function Bitmap_get_blended(d: number, img: number, rgb: number): xp_bitmap_t | null {
  if (!G.fullColor || img < 0 || img >= B.pixmaps.length) return null;
  if (B.pixmaps[img].state !== BMS_READY) if (Bitmap_create(d, img) === -1) return null;
  const pm = B.pixmaps[img];
  for (let i = 0; i < Math.abs(pm.count); i++) {
    if (pm.bitmaps[i].rgb === rgb) return pm.bitmaps[i];
    if (pm.bitmaps[i].rgb === -1) {
      Bitmap_blend_with_color(img, i, rgb);
      return pm.bitmaps[i];
    }
  }
  return pm.bitmaps[0];
}

function Bitmap_picture_copy(pm: xp_pixmap_t, image: number): void {
  for (let y = 0; y < pm.height; y++) {
    for (let x = 0; x < pm.width; x++) Bitmap_set_pixel(pm, image, x, y, Picture_get_pixel(pm.picture, image, x, y));
  }
  pm.bitmaps[image].bbox = { ...pm.picture.bbox[image] };
}

function Bitmap_picture_scale(pm: xp_pixmap_t, image: number): void {
  const orig_height = pm.picture.height, orig_width = pm.picture.width;
  const height = pm.height, width = pm.width;
  const dxs = orig_width / width, dys = orig_height / height;
  let ys = 0;
  for (let y = 0; y < height; y++) {
    let xs = 0;
    for (let x = 0; x < width; x++) {
      Bitmap_set_pixel(pm, image, x, y, Picture_get_pixel_area(pm.picture, image, xs, ys, dxs, dys));
      xs += dxs;
    }
    ys += dys;
  }
  const src = pm.picture.bbox[image], dst = pm.bitmaps[image].bbox;
  dst.xmin = Math.trunc((width * src.xmin) / orig_width);
  dst.ymin = Math.trunc((height * src.ymin) / orig_height);
  dst.xmax = Math.trunc((width * src.xmax + (orig_width - 1)) / orig_width);
  dst.ymax = Math.trunc((height * src.ymax + (orig_height - 1)) / orig_height);
}

export function Bitmap_paint(d: number, img: number, x: number, y: number, bmp: number): void {
  const bit = Bitmap_get(d, img, bmp);
  if (!bit) return;
  const box = bit.bbox;
  const area: irec_t = { x: box.xmin, y: box.ymin, w: box.xmax + 1 - box.xmin, h: box.ymax + 1 - box.ymin };
  Bitmap_paint_area(d, bit, x + area.x, y + area.y, area);
}

export function Bitmap_paint_blended(d: number, img: number, x: number, y: number, rgb: number): void {
  const bit = Bitmap_get_blended(d, img, rgb);
  if (!bit) return;
  const box = bit.bbox;
  const area: irec_t = { x: box.xmin, y: box.ymin, w: box.xmax + 1 - box.xmin, h: box.ymax + 1 - box.ymin };
  Bitmap_paint_area(d, bit, x + area.x, y + area.y, area);
}

function Bitmap_create_begin(d: number, pm: xp_pixmap_t, bmp: number): number {
  const b = pm.bitmaps[bmp];
  if (b.bitmap) {
    X.XFreePixmap(G.dpy, b.bitmap);
    b.bitmap = 0;
  }
  if (b.mask) {
    X.XFreePixmap(G.dpy, b.mask);
    b.mask = 0;
  }
  b.bitmap = X.XCreatePixmap(G.dpy, d, pm.width, pm.height, G.dispDepth);
  b.mask = X.XCreatePixmap(G.dpy, d, pm.width, pm.height, 1);
  if (!b.bitmap || !b.mask) {
    error('Could not create pixmap');
    return -1;
  }
  if (!B.maskGC) {
    B.maskGC = X.XCreateGC(G.dpy, b.mask, X.GCLineWidth | X.GCLineStyle | X.GCCapStyle | X.GCJoinStyle | X.GCGraphicsExposures,
      { line_width: 0, line_style: X.LineSolid, cap_style: X.CapButt, join_style: X.JoinMiter, graphics_exposures: false });
  }
  return 0;
}

function Bitmap_set_pixel(pm: xp_pixmap_t, bmp: number, x: number, y: number, color: number): void {
  const pixel = RGB(RED_VALUE(color), GREEN_VALUE(color), BLUE_VALUE(color));
  SET_FG(pixel);
  X.XDrawPoint(G.dpy, pm.bitmaps[bmp].bitmap, G.gameGC, x, y);
  X.XSetForeground(G.dpy, B.maskGC!, color ? 1 : 0);
  X.XDrawPoint(G.dpy, pm.bitmaps[bmp].mask, B.maskGC!, x, y);
}

export function Bitmap_paint_area(d: number, bit: xp_bitmap_t, x: number, y: number, r: irec_t): void {
  X.XSetClipOrigin(G.dpy, G.gameGC, x - r.x, y - r.y);
  X.XSetClipMask(G.dpy, G.gameGC, bit.mask);
  X.XCopyArea(G.dpy, bit.bitmap, d, G.gameGC, r.x, r.y, r.w >>> 0, r.h >>> 0, x, y);
  X.XSetClipMask(G.dpy, G.gameGC, 0);
}
