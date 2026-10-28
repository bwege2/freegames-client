// gfx2d.c: pictures (binary PPM from the texture path), rotated copies, scaling by area averaging,
// bounding boxes. Colours are RGB_COLOR: red in the low byte, as the original.
import { G } from './G.ts';
import { sys } from './sys.ts';
import { RES } from './consts.ts';
import { error } from './error.ts';
import { tcos, tsin } from './xpmath.ts';

export const RGB24 = (r: number, g: number, b: number): number => (((b & 255) << 16) | ((g & 255) << 8) | (r & 255)) >>> 0;
export const RED_VALUE = (c: number): number => c & 255;
export const GREEN_VALUE = (c: number): number => (c >> 8) & 255;
export const BLUE_VALUE = (c: number): number => (c >> 16) & 255;

export interface bbox_t { xmin: number; ymin: number; xmax: number; ymax: number }
export interface xp_picture_t { width: number; height: number; count: number; data: Uint32Array[]; bbox: bbox_t[] }

export function newPicture(): xp_picture_t {
  return { width: 0, height: 0, count: 0, data: [], bbox: [] };
}

export function Picture_init(picture: xp_picture_t, filename: string, count: number): number {
  picture.count = count;
  picture.data = new Array(Math.abs(count));
  if (Picture_load(picture, filename) === -1) return -1;
  if (count > 1) if (Picture_rotate(picture) === -1) return -1;
  picture.bbox = Array.from({ length: Math.abs(count) }, () => ({ xmin: 0, ymin: 0, xmax: 0, ymax: 0 }));
  Picture_get_bounding_box(picture);
  return 0;
}

/** Picture_find_path: the file in one of the texture directories */
function Picture_find(filename: string): Uint8Array | null {
  if (!filename) return null;
  if (!filename.includes('/') && G.realTexturePath !== null) {
    for (const dir of G.realTexturePath.split(':')) {
      if (!dir.length) continue;
      const path = dir.endsWith('/') ? dir + filename : `${dir}/${filename}`;
      const data = sys.libFile(path);
      if (data) return data;
    }
  }
  return null;
}

export function Picture_load(picture: xp_picture_t, filename: string): number {
  const f = Picture_find(filename);
  if (!f) {
    error(`Cannot find picture file "${filename}"`);
    return -1;
  }
  let p = 0;
  const EOF = -1;
  const getc = () => (p < f.length ? f[p++] : EOF);
  const pgetc = () => {
    let c = getc();
    if (c === 0x23) do c = getc(); while (c !== 0x0a && c !== EOF);
    return c;
  };
  const isspace = (c: number) => c === 0x20 || (c >= 0x09 && c <= 0x0d);
  const isdigit = (c: number) => c >= 0x30 && c <= 0x39;
  const skip_ws = (c: number) => {
    if (!isspace(c)) return EOF;
    do c = pgetc(); while (isspace(c));
    return c;
  };
  let dec = 0;
  const get_decimal = (c: number) => {
    dec = 0;
    for (; isdigit(c); c = pgetc()) dec = 10 * dec + (c - 0x30);
    return c;
  };
  if (pgetc() !== 0x50 || pgetc() !== 0x36) {
    error(`"${filename}" does not contain a valid binary PPM file.`);
    return -1;
  }
  let c = pgetc();
  c = skip_ws(c);
  c = get_decimal(c);
  const width = dec;
  c = skip_ws(c);
  c = get_decimal(c);
  const height = dec;
  c = skip_ws(c);
  c = get_decimal(c);
  const maxval = dec;
  if (!isspace(c) || maxval !== 255) {
    error(`"${filename}" does not contain a valid binary PPM file.`);
    return -1;
  }
  picture.height = height;
  let count: number;
  if (picture.count > 0) {
    count = 1;
    picture.width = width;
  } else {
    count = -picture.count;
    picture.width = Math.trunc(width / count);
  }
  for (let i = 0; i < count; i++) picture.data[i] = new Uint32Array(picture.width * picture.height);
  for (let y = 0; y < picture.height; y++) {
    for (let i = 0; i < count; i++) {
      for (let x = 0; x < picture.width; x++) {
        const r = getc(), g = getc(), b = getc();
        Picture_set_pixel(picture, i, x, y, RGB24(r, g, b));
      }
    }
    for (let k = (width % count) * 3; k > 0; k--) getc();
  }
  return 0;
}

function Picture_rotate(picture: xp_picture_t): number {
  const size = picture.height;
  for (let image = 1; image < picture.count; image++) {
    picture.data[image] = new Uint32Array(picture.width * picture.height);
    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) Picture_set_pixel(picture, image, x, y, Picture_get_rotated_pixel(picture, x, y, image));
    }
  }
  return 0;
}

export function Picture_set_pixel(picture: xp_picture_t, image: number, x: number, y: number, color: number): void {
  if (x < 0 || y < 0 || x >= picture.width || y >= picture.height) return;
  picture.data[image][x + y * picture.width] = color;
}

export function Picture_get_pixel(picture: xp_picture_t, image: number, x: number, y: number): number {
  if (x < 0 || y < 0 || x >= picture.width || y >= picture.height) return RGB24(0, 0, 0);
  return picture.data[image][x + y * picture.width];
}

/** (unsigned char) of a non-negative double below 256 */
const uc = (v: number) => Math.trunc(v) & 0xff;

function Picture_get_pixel_avg(picture: xp_picture_t, image: number, x: number, y: number): number {
  const frac_x = x - Math.trunc(x), frac_y = y - Math.trunc(y);
  const r_x = Math.trunc(x), r_y = Math.trunc(y);
  const c = [
    Picture_get_pixel(picture, image, r_x, r_y), Picture_get_pixel(picture, image, r_x + 1, r_y),
    Picture_get_pixel(picture, image, r_x, r_y + 1), Picture_get_pixel(picture, image, r_x + 1, r_y + 1),
  ];
  const p = [(1 - frac_x) * (1 - frac_y), frac_x * (1 - frac_y), (1 - frac_x) * frac_y, frac_x * frac_y];
  let r = 0, g = 0, b = 0;
  for (let i = 0; i < 4; i++) {
    r += RED_VALUE(c[i]) * p[i];
    g += GREEN_VALUE(c[i]) * p[i];
    b += BLUE_VALUE(c[i]) * p[i];
  }
  return RGB24(uc(r), uc(g), uc(b));
}

export function Picture_get_rotated_pixel(picture: xp_picture_t, x: number, y: number, image: number): number {
  const angle = Math.trunc((image * RES) / picture.count) % 128;
  x -= Math.trunc(picture.width / 2);
  y -= Math.trunc(picture.height / 2);
  const rot_x = tcos(angle) * x - tsin(angle) * y + Math.trunc(picture.width / 2);
  const rot_y = tsin(angle) * x + tcos(angle) * y + Math.trunc(picture.height / 2);
  return Picture_get_pixel_avg(picture, 0, rot_x, rot_y);
}

function Picture_scale_x_slice(picture: xp_picture_t, image: number, acc: [number, number, number], x: number, y: number,
  xscale: number, xfrac: number, yfrac: number): void {
  const data = picture.data[image];
  let p = x + y * picture.width;
  if (xscale > xfrac) {
    let col = data[p];
    let weight = xfrac * yfrac;
    acc[0] += Math.trunc(RED_VALUE(col) * weight);
    acc[1] += Math.trunc(GREEN_VALUE(col) * weight);
    acc[2] += Math.trunc(BLUE_VALUE(col) * weight);
    xscale -= xfrac;
    p++;
    weight = yfrac;
    if (yfrac === 1) {
      while (xscale >= 1.0) {
        col = data[p];
        acc[0] += RED_VALUE(col);
        acc[1] += GREEN_VALUE(col);
        acc[2] += BLUE_VALUE(col);
        p++;
        xscale -= 1.0;
      }
    } else {
      while (xscale >= 1.0) {
        col = data[p];
        acc[0] += Math.trunc(RED_VALUE(col) * weight);
        acc[1] += Math.trunc(GREEN_VALUE(col) * weight);
        acc[2] += Math.trunc(BLUE_VALUE(col) * weight);
        p++;
        xscale -= 1.0;
      }
    }
  }
  if (xscale > 0.00001) {
    const col = data[p] ?? 0;
    const weight = yfrac * xscale;
    acc[0] += Math.trunc(RED_VALUE(col) * weight);
    acc[1] += Math.trunc(GREEN_VALUE(col) * weight);
    acc[2] += Math.trunc(BLUE_VALUE(col) * weight);
  }
}

export function Picture_get_pixel_area(picture: xp_picture_t, image: number, x_1: number, y_1: number, dx: number, dy: number): number {
  const acc: [number, number, number] = [0, 0, 0];
  const x = Math.trunc(x_1);
  let y = Math.trunc(y_1);
  const xfrac = x + 1 - x_1, yfrac = y + 1 - y_1;
  const area = dx * dy;
  if (dy > yfrac) {
    Picture_scale_x_slice(picture, image, acc, x, y, dx, xfrac, yfrac);
    dy -= yfrac;
    y++;
    while (dy >= 1.0) {
      Picture_scale_x_slice(picture, image, acc, x, y, dx, xfrac, 1.0);
      y++;
      dy -= 1.0;
    }
  }
  if (dy > 0.00001) Picture_scale_x_slice(picture, image, acc, x, y, dx, xfrac, dy);
  return RGB24(uc(acc[0] / area), uc(acc[1] / area), uc(acc[2] / area));
}

export function Picture_get_bounding_box(picture: xp_picture_t): void {
  for (let i = 0; i < Math.abs(picture.count); i++) {
    const box = picture.bbox[i];
    box.xmin = picture.width - 1;
    box.xmax = 0;
    box.ymin = picture.height - 1;
    box.ymax = 0;
    for (let y = 0; y < picture.height; y++) {
      for (let x = 0; x < picture.width; x++) {
        if (Picture_get_pixel(picture, i, x, y)) {
          if (box.xmin > x) box.xmin = x;
          if (box.xmax < x) box.xmax = x;
          if (box.ymin > y) box.ymin = y;
          if (box.ymax < y) box.ymax = y;
        }
      }
    }
  }
}
