// al/bitmap.ts: Allegro 4.4's 8-bit memory bitmaps and the drawing primitives Liquid War uses, with
// Allegro's clipping and pixel rules (src/c/cgfx.h, cspr.h, cstretch.c, blit.c, gfx.c, graphics.c).
// A sub-bitmap (create_sub_bitmap) shares its parent's pixels.

export const DRAW_MODE_SOLID = 0;
export const DRAW_MODE_COPY_PATTERN = 2;

export class Bitmap {
  readonly w: number;
  readonly h: number;
  /** the pixel store, shared with sub-bitmaps */
  readonly data: Uint8Array;
  /** offset of this bitmap's (0,0) in data, and the store's line length */
  readonly base: number;
  readonly stride: number;
  /** the root bitmap (screen for sub-bitmaps of the screen) */
  readonly root: Bitmap;
  readonly ox: number;
  readonly oy: number;
  clip = true;
  cl = 0;
  cr: number;
  ct = 0;
  cb: number;

  constructor(w: number, h: number, parent?: Bitmap, x = 0, y = 0) {
    this.w = w;
    this.h = h;
    this.cr = w;
    this.cb = h;
    if (parent) {
      this.data = parent.data;
      this.stride = parent.stride;
      this.base = parent.base + y * parent.stride + x;
      this.root = parent.root;
      this.ox = parent.ox + x;
      this.oy = parent.oy + y;
    } else {
      this.data = new Uint8Array(Math.max(1, w * h));
      this.stride = w;
      this.base = 0;
      this.root = this;
      this.ox = 0;
      this.oy = 0;
    }
  }
}

export function create_bitmap(w: number, h: number): Bitmap {
  return new Bitmap(w, h);
}

/** create_sub_bitmap, clamped like Allegro's */
export function create_sub_bitmap(parent: Bitmap, x: number, y: number, w: number, h: number): Bitmap {
  if (x + w > parent.w) w = parent.w - x;
  if (y + h > parent.h) h = parent.h - y;
  return new Bitmap(w, h, parent, x, y);
}

export function set_clip_rect(b: Bitmap, x1: number, y1: number, x2: number, y2: number): void {
  x2++;
  y2++;
  const clamp = (lo: number, v: number, hi: number): number => Math.max(lo, Math.min(v, hi));
  b.cl = clamp(0, x1, b.w - 1);
  b.ct = clamp(0, y1, b.h - 1);
  b.cr = clamp(0, x2, b.w);
  b.cb = clamp(0, y2, b.h);
}

let drawingMode = DRAW_MODE_SOLID;
let pattern: Bitmap | null = null;
let patX = 0;
let patY = 0;

export function drawing_mode(mode: number, pat: Bitmap | null, xAnchor: number, yAnchor: number): void {
  drawingMode = mode;
  pattern = pat;
  patX = xAnchor;
  patY = yAnchor;
}

export function solid_mode(): void {
  drawing_mode(DRAW_MODE_SOLID, null, 0, 0);
}

function patternPixel(x: number, y: number): number {
  const p = pattern!;
  // GET_PATTERN_PIXEL: pattern sizes are powers of two
  return p.data[p.base + ((y - patY) & (p.h - 1)) * p.stride + ((x - patX) & (p.w - 1))]!;
}

export function putpixel(b: Bitmap, x: number, y: number, color: number): void {
  if (b.clip && (x < b.cl || x >= b.cr || y < b.ct || y >= b.cb)) return;
  if (drawingMode === DRAW_MODE_SOLID) b.data[b.base + y * b.stride + x] = color & 0xff;
  else b.data[b.base + y * b.stride + x] = patternPixel(x, y);
}

export function getpixel(b: Bitmap, x: number, y: number): number {
  if (x < 0 || x >= b.w || y < 0 || y >= b.h) return -1;
  return b.data[b.base + y * b.stride + x]!;
}

/** _linear_hline8 */
export function hline(b: Bitmap, x1: number, y: number, x2: number, color: number): void {
  if (x1 > x2) {
    const t = x1;
    x1 = x2;
    x2 = t;
  }
  if (b.clip) {
    if (x1 < b.cl) x1 = b.cl;
    if (x2 >= b.cr) x2 = b.cr - 1;
    if (x1 > x2 || y < b.ct || y >= b.cb) return;
  }
  const o = b.base + y * b.stride;
  if (drawingMode === DRAW_MODE_SOLID) b.data.fill(color & 0xff, o + x1, o + x2 + 1);
  else for (let x = x1; x <= x2; x++) b.data[o + x] = patternPixel(x, y);
}

/** _linear_vline8 */
export function vline(b: Bitmap, x: number, y1: number, y2: number, color: number): void {
  if (y1 > y2) {
    const t = y1;
    y1 = y2;
    y2 = t;
  }
  if (b.clip) {
    if (y1 < b.ct) y1 = b.ct;
    if (y2 >= b.cb) y2 = b.cb - 1;
    if (x < b.cl || x >= b.cr || y1 > y2) return;
  }
  if (drawingMode === DRAW_MODE_SOLID) {
    for (let y = y1; y <= y2; y++) b.data[b.base + y * b.stride + x] = color & 0xff;
  } else {
    for (let y = y1; y <= y2; y++) b.data[b.base + y * b.stride + x] = patternPixel(x, y);
  }
}

/** _soft_rect */
export function rect(b: Bitmap, x1: number, y1: number, x2: number, y2: number, color: number): void {
  let t;
  if (x2 < x1) {
    t = x1;
    x1 = x2;
    x2 = t;
  }
  if (y2 < y1) {
    t = y1;
    y1 = y2;
    y2 = t;
  }
  hline(b, x1, y1, x2, color);
  if (y2 > y1) hline(b, x1, y2, x2, color);
  if (y2 - 1 >= y1 + 1) {
    vline(b, x1, y1 + 1, y2 - 1, color);
    if (x2 > x1) vline(b, x2, y1 + 1, y2 - 1, color);
  }
}

/** _normal_rectfill */
export function rectfill(b: Bitmap, x1: number, y1: number, x2: number, y2: number, color: number): void {
  let t;
  if (y1 > y2) {
    t = y1;
    y1 = y2;
    y2 = t;
  }
  let wasClip = false;
  if (b.clip) {
    if (x1 > x2) {
      t = x1;
      x1 = x2;
      x2 = t;
    }
    if (x1 < b.cl) x1 = b.cl;
    if (x2 >= b.cr) x2 = b.cr - 1;
    if (x2 < x1) return;
    if (y1 < b.ct) y1 = b.ct;
    if (y2 >= b.cb) y2 = b.cb - 1;
    if (y2 < y1) return;
    b.clip = false;
    wasClip = true;
  }
  while (y1 <= y2) {
    hline(b, x1, y1, x2, color);
    y1++;
  }
  b.clip = wasClip;
}

export function clear_to_color(b: Bitmap, color: number): void {
  rectfill(b, b.cl, b.ct, b.cr - 1, b.cb - 1, color);
}

export function clear_bitmap(b: Bitmap): void {
  clear_to_color(b, 0);
}

interface Clipped {
  sx: number;
  sy: number;
  dx: number;
  dy: number;
  w: number;
  h: number;
}

/** BLIT_CLIP (blit.c) */
function blitClip(src: Bitmap, dst: Bitmap, sx: number, sy: number, dx: number, dy: number, w: number, h: number): Clipped | null {
  if (sx >= src.w || sy >= src.h || dx >= dst.cr || dy >= dst.cb) return null;
  if (sx < 0) {
    w += sx;
    dx -= sx;
    sx = 0;
  }
  if (sy < 0) {
    h += sy;
    dy -= sy;
    sy = 0;
  }
  if (sx + w > src.w) w = src.w - sx;
  if (sy + h > src.h) h = src.h - sy;
  if (dx < dst.cl) {
    dx -= dst.cl;
    w += dx;
    sx -= dx;
    dx = dst.cl;
  }
  if (dy < dst.ct) {
    dy -= dst.ct;
    h += dy;
    sy -= dy;
    dy = dst.ct;
  }
  if (dx + w > dst.cr) w = dst.cr - dx;
  if (dy + h > dst.cb) h = dst.cb - dy;
  if (w <= 0 || h <= 0) return null;
  return { sx, sy, dx, dy, w, h };
}

export function blit(src: Bitmap, dst: Bitmap, sx: number, sy: number, dx: number, dy: number, w: number, h: number): void {
  const c = blitClip(src, dst, sx, sy, dx, dy, w, h);
  if (!c) return;
  if (src.data === dst.data) {
    // blit_to_self on overlapping regions: copy through a temporary
    const tmp = new Uint8Array(c.w * c.h);
    for (let y = 0; y < c.h; y++) {
      const so = src.base + (c.sy + y) * src.stride + c.sx;
      tmp.set(src.data.subarray(so, so + c.w), y * c.w);
    }
    for (let y = 0; y < c.h; y++) dst.data.set(tmp.subarray(y * c.w, (y + 1) * c.w), dst.base + (c.dy + y) * dst.stride + c.dx);
    return;
  }
  for (let y = 0; y < c.h; y++) {
    const so = src.base + (c.sy + y) * src.stride + c.sx;
    dst.data.set(src.data.subarray(so, so + c.w), dst.base + (c.dy + y) * dst.stride + c.dx);
  }
}

export function masked_blit(src: Bitmap, dst: Bitmap, sx: number, sy: number, dx: number, dy: number, w: number, h: number): void {
  const c = blitClip(src, dst, sx, sy, dx, dy, w, h);
  if (!c) return;
  for (let y = 0; y < c.h; y++) {
    const so = src.base + (c.sy + y) * src.stride + c.sx;
    const d0 = dst.base + (c.dy + y) * dst.stride + c.dx;
    for (let x = 0; x < c.w; x++) {
      const v = src.data[so + x]!;
      if (v !== 0) dst.data[d0 + x] = v;
    }
  }
}

/** _linear_draw_sprite8 (and draw_256_sprite on an 8-bit bitmap) */
export function draw_sprite(dst: Bitmap, src: Bitmap, dx: number, dy: number): void {
  let w, h, sxbeg, sybeg, dxbeg, dybeg;
  if (dst.clip) {
    let tmp = dst.cl - dx;
    sxbeg = tmp < 0 ? 0 : tmp;
    dxbeg = sxbeg + dx;
    tmp = dst.cr - dx;
    w = (tmp > src.w ? src.w : tmp) - sxbeg;
    if (w <= 0) return;
    tmp = dst.ct - dy;
    sybeg = tmp < 0 ? 0 : tmp;
    dybeg = sybeg + dy;
    tmp = dst.cb - dy;
    h = (tmp > src.h ? src.h : tmp) - sybeg;
    if (h <= 0) return;
  } else {
    w = src.w;
    h = src.h;
    sxbeg = 0;
    sybeg = 0;
    dxbeg = dx;
    dybeg = dy;
  }
  for (let y = 0; y < h; y++) {
    const so = src.base + (sybeg + y) * src.stride + sxbeg;
    const d0 = dst.base + (dybeg + y) * dst.stride + dxbeg;
    for (let x = 0; x < w; x++) {
      const v = src.data[so + x]!;
      if (v !== 0) dst.data[d0 + x] = v;
    }
  }
}

/** _linear_draw_character8: the glyph's set pixels in color, the others in bg (bg < 0: left alone) */
export function draw_character(dst: Bitmap, src: Bitmap, dx: number, dy: number, color: number, bg: number): void {
  let w, h, sxbeg, sybeg, dxbeg, dybeg;
  if (dst.clip) {
    let tmp = dst.cl - dx;
    sxbeg = tmp < 0 ? 0 : tmp;
    dxbeg = sxbeg + dx;
    tmp = dst.cr - dx;
    w = (tmp > src.w ? src.w : tmp) - sxbeg;
    if (w <= 0) return;
    tmp = dst.ct - dy;
    sybeg = tmp < 0 ? 0 : tmp;
    dybeg = sybeg + dy;
    tmp = dst.cb - dy;
    h = (tmp > src.h ? src.h : tmp) - sybeg;
    if (h <= 0) return;
  } else {
    w = src.w;
    h = src.h;
    sxbeg = 0;
    sybeg = 0;
    dxbeg = dx;
    dybeg = dy;
  }
  for (let y = 0; y < h; y++) {
    const so = src.base + (sybeg + y) * src.stride + sxbeg;
    const d0 = dst.base + (dybeg + y) * dst.stride + dxbeg;
    for (let x = 0; x < w; x++) {
      const v = src.data[so + x]!;
      if (v !== 0) dst.data[d0 + x] = color & 0xff;
      else if (bg >= 0) dst.data[d0 + x] = bg & 0xff;
    }
  }
}

/** _al_stretch_blit (src/c/cstretch.c), 8-bit, not masked */
export function stretch_blit(src: Bitmap, dst: Bitmap, sx: number, sy: number, sw: number, sh: number,
  dx: number, dy: number, dw: number, dh: number): void {
  if (sw <= 0 || sh <= 0 || dw <= 0 || dh <= 0) return;
  let dxbeg, dxend, dybeg, dyend;
  if (dst.clip) {
    dybeg = dy > dst.ct ? dy : dst.ct;
    dyend = dy + dh < dst.cb ? dy + dh : dst.cb;
    if (dybeg >= dyend) return;
    dxbeg = dx > dst.cl ? dx : dst.cl;
    dxend = dx + dw < dst.cr ? dx + dw : dst.cr;
    if (dxbeg >= dxend) return;
  } else {
    dxbeg = dx;
    dxend = dx + dw;
    dybeg = dy;
    dyend = dy + dh;
  }
  const syinc = Math.trunc(sh / dh);
  const ycdec = sh - syinc * dh;
  const ycinc = dh - ycdec;
  let yc = ycinc;
  let sxofs = sx;
  let dxofs = dx;
  const sxinc = Math.trunc(sw / dw);
  const xcdec = sw - Math.trunc(sw / dw) * dw;
  const xcinc = dw - xcdec;
  const linesize = dxend - dxbeg;
  let xcstart = xcinc;
  let i;
  for (i = 0; i < dxbeg - dx; i++, sxofs += sxinc) {
    if (xcstart <= 0) {
      xcstart += xcinc;
      sxofs += 1;
    } else xcstart -= xcdec;
  }
  dxofs += i;
  let y;
  for (y = dy; y < dybeg; y++, sy += syinc) {
    if (yc <= 0) {
      sy++;
      yc += ycinc;
    } else yc -= ycdec;
  }
  const sd = src.data;
  const dd = dst.data;
  for (; y < dyend; y++, sy += syinc) {
    let dp = dst.base + y * dst.stride + dxofs;
    const dend = dp + linesize;
    let sp = src.base + sy * src.stride + sxofs;
    let xc = xcstart;
    for (; dp < dend; dp++, sp += sxinc) {
      dd[dp] = sd[sp]!;
      if (xc <= 0) {
        sp++;
        xc += xcinc;
      } else xc -= xcdec;
    }
    if (yc <= 0) {
      sy++;
      yc += ycinc;
    } else yc -= ycdec;
  }
}

const fr = Math.fround;

/** do_ellipse (gfx.c), with its float arithmetic */
function do_ellipse(b: Bitmap, ix: number, iy: number, rx0: number, ry0: number, d: number): void {
  const rx = Math.max(rx0, 0), ry = Math.max(ry0, 0);
  const two_a_sq = fr(2 * rx * rx);
  const two_b_sq = fr(2 * ry * ry);
  let x = rx, y = 0;
  let x_change = fr(ry * ry * (1 - 2 * rx));
  let y_change = fr(rx * rx);
  let ellipse_error = 0;
  let stopping_x = fr(two_b_sq * rx);
  let stopping_y = 0;
  let midway_x = 0;
  const proc = (px: number, py: number): void => putpixel(b, px, py, d);
  while (y <= ry) {
    proc(ix + x, iy + y);
    if (x !== 0) proc(ix - x, iy + y);
    if (y !== 0) {
      proc(ix + x, iy - y);
      if (x !== 0) proc(ix - x, iy - y);
    }
    y++;
    stopping_y = fr(stopping_y + two_a_sq);
    ellipse_error = fr(ellipse_error + y_change);
    y_change = fr(y_change + two_a_sq);
    midway_x = x;
    if (stopping_x < stopping_y && x > 1) break;
    if (fr(fr(2 * ellipse_error) + x_change) > 0) {
      if (x) {
        x--;
        stopping_x = fr(stopping_x - two_b_sq);
        ellipse_error = fr(ellipse_error + x_change);
        x_change = fr(x_change + two_b_sq);
      }
    }
  }
  x = 0;
  y = ry;
  x_change = fr(ry * ry);
  y_change = fr(rx * rx * (1 - 2 * ry));
  ellipse_error = 0;
  while (x < midway_x) {
    proc(ix + x, iy + y);
    if (x !== 0) proc(ix - x, iy + y);
    if (y !== 0) {
      proc(ix + x, iy - y);
      if (x !== 0) proc(ix - x, iy - y);
    }
    x++;
    ellipse_error = fr(ellipse_error + x_change);
    x_change = fr(x_change + two_b_sq);
    if (fr(fr(2 * ellipse_error) + y_change) > 0) {
      if (y) {
        y--;
        ellipse_error = fr(ellipse_error + y_change);
        y_change = fr(y_change + two_a_sq);
      }
    }
  }
}

export function ellipse(b: Bitmap, x: number, y: number, rx: number, ry: number, color: number): void {
  let clip = false;
  if (b.clip) {
    const sx = x - rx - 1, sy = y - ry - 1, dx = x + rx + 1, dy = y + ry + 1;
    if (sx >= b.cr || sy >= b.cb || dx < b.cl || dy < b.ct) return;
    if (sx >= b.cl && sy >= b.ct && dx < b.cr && dy < b.cb) b.clip = false;
    clip = true;
  }
  do_ellipse(b, x, y, rx, ry, color);
  b.clip = clip;
}

export function ellipsefill(b: Bitmap, ix: number, iy: number, rx0: number, ry0: number, color: number): void {
  const rx = Math.max(rx0, 0), ry = Math.max(ry0, 0);
  let clip = false;
  if (b.clip) {
    const sx = ix - rx - 1, sy = iy - ry - 1, dx = ix + rx + 1, dy = iy + ry + 1;
    if (sx >= b.cr || sy >= b.cb || dx < b.cl || dy < b.ct) return;
    if (sx >= b.cl && sy >= b.ct && dx < b.cr && dy < b.cb) b.clip = false;
    clip = true;
  }
  const two_a_sq = fr(2 * rx * rx);
  const two_b_sq = fr(2 * ry * ry);
  let x = rx, y = 0;
  let x_change = fr(ry * ry * (1 - 2 * rx));
  let y_change = fr(rx * rx);
  let ellipse_error = 0;
  let stopping_x = fr(two_b_sq * rx);
  let stopping_y = 0;
  let midway_x = 0;
  while (y <= ry) {
    hline(b, ix - x, iy + y, ix + x, color);
    if (y) hline(b, ix - x, iy - y, ix + x, color);
    y++;
    stopping_y = fr(stopping_y + two_a_sq);
    ellipse_error = fr(ellipse_error + y_change);
    y_change = fr(y_change + two_a_sq);
    midway_x = x;
    if (stopping_x < stopping_y && x > 1) break;
    if (fr(fr(2 * ellipse_error) + x_change) > 0) {
      if (x) {
        x--;
        stopping_x = fr(stopping_x - two_b_sq);
        ellipse_error = fr(ellipse_error + x_change);
        x_change = fr(x_change + two_b_sq);
      }
    }
  }
  const last_drawn_y = y - 1;
  x = 0;
  y = ry;
  x_change = fr(ry * ry);
  y_change = fr(rx * rx * (1 - 2 * ry));
  ellipse_error = 0;
  let old_y = y;
  while (x < midway_x) {
    if (old_y !== y) {
      hline(b, ix - x + 1, iy + old_y, ix + x - 1, color);
      if (old_y) hline(b, ix - x + 1, iy - old_y, ix + x - 1, color);
    }
    x++;
    ellipse_error = fr(ellipse_error + x_change);
    x_change = fr(x_change + two_b_sq);
    old_y = y;
    if (fr(fr(2 * ellipse_error) + y_change) > 0) {
      if (y) {
        y--;
        ellipse_error = fr(ellipse_error + y_change);
        y_change = fr(y_change + two_a_sq);
      }
    }
  }
  if (old_y !== last_drawn_y) {
    hline(b, ix - x + 1, iy + old_y, ix + x - 1, color);
    if (old_y) hline(b, ix - x + 1, iy - old_y, ix + x - 1, color);
  }
  b.clip = clip;
}
