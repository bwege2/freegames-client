// light.cpp: light sources, the light and tint tables, and lighting the screen in 8x4 pixel patches
import type { image } from './imlib/image.ts';
import { palette } from './imlib/palette.ts';
import { Filter } from './imlib/filter.ts';
import { SEEK_SET, spec_entry, SPEC_LIGHT_LIST, type bFILE, type spec_directory } from './imlib/specs.ts';
import { dprintf } from './imlib/dprint.ts';
import { G } from './globals.ts';

export const TTINTS = 9;
export const REVERSE_GREEN_TINT = 8;
export const HIGH_DETAIL = 0, MEDIUM_DETAIL = 1, LOW_DETAIL = 2, POOR_DETAIL = 3;

export class light_source {
  type: number;
  x: number;
  xshift: number;
  y: number;
  yshift: number;
  outer_radius: number;
  mul_div = 0;
  inner_radius: number;
  x1 = 0;
  y1 = 0;
  x2 = 0;
  y2 = 0;
  known = 0;
  next: light_source | null;

  constructor(Type: number, X: number, Y: number, Inner: number, Outer: number, Xshift: number, Yshift: number, Next: light_source | null) {
    this.type = (Type << 24) >> 24; // char Type
    this.x = X | 0;
    this.y = Y | 0;
    this.inner_radius = Inner | 0;
    this.outer_radius = Outer | 0;
    this.next = Next;
    this.xshift = Xshift | 0;
    this.yshift = Yshift | 0;
    this.calc_range();
  }

  calc_range(): void {
    const o = this.outer_radius, x = this.x, y = this.y;
    const ox = o >> this.xshift, oy = o >> this.yshift;
    switch (this.type) {
      case 0: this.x1 = x - ox; this.y1 = y - oy; this.x2 = x + ox; this.y2 = y + oy; break;
      case 1: this.x1 = x - ox; this.y1 = y - oy; this.x2 = x + ox; this.y2 = y; break;
      case 2: this.x1 = x - ox; this.y1 = y; this.x2 = x + ox; this.y2 = y + oy; break;
      case 3: this.x1 = x; this.y1 = y - oy; this.x2 = x + ox; this.y2 = y + oy; break;
      case 4: this.x1 = x - ox; this.y1 = y - oy; this.x2 = x; this.y2 = y + oy; break;
      case 5: this.x1 = x; this.y1 = y - oy; this.x2 = x + ox; this.y2 = y; break;
      case 6: this.x1 = x - ox; this.y1 = y - oy; this.x2 = x; this.y2 = y; break;
      case 7: this.x1 = x - ox; this.y1 = y; this.x2 = x; this.y2 = y + oy; break;
      case 8: this.x1 = x; this.y1 = y; this.x2 = x + ox; this.y2 = y + oy; break;
      case 9: this.x1 = x; this.y1 = y; this.x2 = x + this.xshift; this.y2 = y + this.yshift; break;
    }
    const d = this.outer_radius - this.inner_radius;
    this.mul_div = d ? Math.imul(((1 << 16) / d) | 0, 64) : 0;
  }

  copy(): light_source {
    this.next = new light_source(this.type, this.x, this.y, this.inner_radius, this.outer_radius, this.xshift, this.yshift, this.next);
    return this.next;
  }
}

export const LG = {
  first_light_source: null as light_source | null,
  white_light: new Uint8Array(256 * 64),
  tints: [] as Uint8Array[],
  bright_tint: new Uint8Array(256),
  ambient_ramp: 0,
  shutdown_lighting_value: 0,
  shutdown_lighting: 0,
  light_detail: MEDIUM_DETAIL,
  min_light_level: 0,
  disable_autolight: 0,
  /** dev_cont->notify_deleted_light */
  notify_deleted_light: null as ((l: light_source) => void) | null,
};

export function light_to_number(l: light_source | null): number {
  if (!l) return 0;
  let x = 1;
  for (let s = LG.first_light_source; s; s = s.next, x++) if (s === l) return x;
  return 0;
}

export function number_to_light(x: number): light_source | null {
  if (x === 0) return null;
  x--;
  let s = LG.first_light_source;
  for (; x && s; x--, s = s.next);
  return s;
}

export function delete_all_lights(): void {
  while (LG.first_light_source) {
    if (LG.notify_deleted_light) LG.notify_deleted_light(LG.first_light_source);
    LG.first_light_source = LG.first_light_source.next;
  }
}

export function delete_light(which: light_source): void {
  if (LG.notify_deleted_light) LG.notify_deleted_light(which);
  if (which === LG.first_light_source) LG.first_light_source = LG.first_light_source.next;
  else {
    let f = LG.first_light_source;
    for (; f && f.next !== which; f = f.next);
    if (f) f.next = which.next;
  }
}

export function add_light_source(type: number, x: number, y: number, inner: number, outer: number, xshift: number, yshift: number): light_source {
  LG.first_light_source = new light_source(type, x, y, inner, outer, xshift, yshift, LG.first_light_source);
  return LG.first_light_source;
}

function calc_tint(tint: Uint8Array, rs: number, gs: number, bs: number, ra: number, ga: number, ba: number, pal: palette): void {
  const npal = new palette();
  npal.addr().fill(0, 0, 256);
  for (let i = 0; i < 256; i++) {
    npal.set(i, rs, gs, bs);
    rs += ra; if (rs > 255) rs = 255; else if (rs < 0) rs = 0;
    gs += ga; if (gs > 255) gs = 255; else if (gs < 0) gs = 0;
    bs += ba; if (bs > 255) bs = 255; else if (bs < 0) bs = 0;
  }
  const f = Filter.between(pal, npal);
  const f2 = Filter.between(npal, pal);
  for (let i = 0; i < 256; i++) tint[i] = f2.GetMapping(f.GetMapping(i));
}

/** calc_light_table: computed every time (the original keeps light.tbl in the save directory only to save time) */
export function calc_light_table(pal: palette): void {
  LG.white_light = new Uint8Array(256 * 64);
  LG.tints = [];
  for (let i = 0; i < TTINTS; i++) LG.tints[i] = new Uint8Array(256);
  const wl = LG.white_light;
  for (let color = 0; color < 256; color++) {
    let [r, g, b] = pal.get(color);
    for (let intensity = 63; intensity >= 0; intensity--) {
      if (r > 0 || g > 0 || b > 0) wl[intensity * 256 + color] = pal.find_closest(r, g, b);
      else wl[intensity * 256 + color] = 0;
      if (r) r--;
      if (g) g--;
      if (b) b--;
    }
  }
  const t = [0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 1, 1, 1, 0, 0, 0, 0, 1, 0,
    0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0];
  for (let i = 0; i < 256; i++) LG.tints[0][i] = i;
  for (let i = 0; i < 256; i++) {
    const r = (pal.red(i) / 2) | 0;
    let g = 255 - pal.green(i) - 30;
    let b = (((pal.blue(i) * 3) / 5) | 0) + 50;
    if (g < 0) g = 0;
    if (b > 255) b = 0;
    LG.tints[TTINTS - 1][i] = pal.find_closest(r, g, b);
  }
  for (let i = 0; i < 256; i++) {
    const r = pal.red(i) + (((255 - pal.red(i)) / 2) | 0), g = pal.green(i) + (((255 - pal.green(i)) / 2) | 0),
      b = pal.blue(i) + (((255 - pal.blue(i)) / 2) | 0);
    LG.bright_tint[i] = pal.find_closest(r, g, b);
  }
  let ti = 6;
  for (let i = 1; i < TTINTS - 1; i++) {
    calc_tint(LG.tints[i], t[ti], t[ti + 1], t[ti + 2], t[ti + 3], t[ti + 4], t[ti + 5], pal);
    ti += 6;
  }
}

class light_patch {
  total = 0;
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  lights: light_source[] = [];
  next: light_patch | null;
  constructor(X1: number, Y1: number, X2: number, Y2: number, Next: light_patch | null) {
    this.x1 = X1;
    this.y1 = Y1;
    this.x2 = X2;
    this.y2 = Y2;
    this.next = Next;
  }
  copy(Next: light_patch | null): light_patch {
    const p = new light_patch(this.x1, this.y1, this.x2, this.y2, Next);
    p.total = this.total;
    p.lights = this.lights.slice();
    return p;
  }
}

const MAX_LP = 6;

function insert_light(first: { v: light_patch | null }, l: light_patch): void {
  if (!first.v) first.v = l;
  else if (l.y1 < first.v.y1) {
    l.next = first.v;
    first.v = l;
  } else {
    let p = first.v;
    for (; p.next && p.next.y1 < l.y1; p = p.next);
    l.next = p.next;
    p.next = l;
  }
}

function add_light(first: { v: light_patch | null }, x1: number, y1: number, x2: number, y2: number, who: light_source): void {
  let next: light_patch | null;
  for (let p = first.v; p; p = next) {
    next = p.next;
    if (x1 >= p.x1 && y1 >= p.y1 && x2 <= p.x2 && y2 <= p.y2) {
      if (p.total === MAX_LP) return;
      if (x1 > p.x1) {
        const l = p.copy(null);
        l.x2 = x1 - 1;
        insert_light(first, l);
      }
      if (x2 < p.x2) {
        const l = p.copy(null);
        l.x1 = x2 + 1;
        insert_light(first, l);
      }
      if (y1 > p.y1) {
        const l = p.copy(null);
        l.x1 = x1;
        l.x2 = x2;
        l.y2 = y1 - 1;
        insert_light(first, l);
      }
      if (y2 < p.y2) {
        const l = p.copy(null);
        l.x1 = x1;
        l.x2 = x2;
        l.y1 = y2 + 1;
        insert_light(first, l);
      }
      p.x1 = x1;
      p.y1 = y1;
      p.x2 = x2;
      p.y2 = y2;
      if (first.v === p) first.v = first.v.next;
      else {
        let q = first.v!;
        for (; q.next !== p; q = q.next!);
        q.next = p.next;
      }
      insert_light(first, p);
      p.total++;
      p.lights.length = p.total - 1;
      p.lights.push(who);
      return;
    }
    if (x1 <= p.x1 && y1 <= p.y1 && x2 >= p.x2 && y2 >= p.y2) {
      if (x1 < p.x1) add_light(first, x1, y1, p.x1 - 1, y2, who);
      if (x2 > p.x2) add_light(first, p.x2 + 1, y1, x2, y2, who);
      if (y1 < p.y1) add_light(first, p.x1, y1, p.x2, p.y1 - 1, who);
      if (y2 > p.y2) add_light(first, p.x1, p.y2 + 1, p.x2, y2, who);
      if (p.total === MAX_LP) return;
      p.total++;
      p.lights.length = p.total - 1;
      p.lights.push(who);
      return;
    }
    if (!(x2 < p.x1 || y2 < p.y1 || x1 > p.x2 || y1 > p.y2)) {
      let ax1: number, ay1: number, ax2: number, ay2: number;
      if (x1 < p.x1) {
        add_light(first, x1, Math.max(y1, p.y1), p.x1 - 1, Math.min(y2, p.y2), who);
        ax1 = p.x1;
      } else ax1 = x1;
      if (x2 > p.x2) {
        add_light(first, p.x2 + 1, Math.max(y1, p.y1), x2, Math.min(y2, p.y2), who);
        ax2 = p.x2;
      } else ax2 = x2;
      if (y1 < p.y1) {
        add_light(first, x1, y1, x2, p.y1 - 1, who);
        ay1 = p.y1;
      } else ay1 = y1;
      if (y2 > p.y2) {
        add_light(first, x1, p.y2 + 1, x2, y2, who);
        ay2 = p.y2;
      } else ay2 = y2;
      add_light(first, ax1, ay1, ax2, ay2, who);
      return;
    }
  }
}

function make_patch_list(width: number, height: number, screenx: number, screeny: number): light_patch {
  const first = { v: new light_patch(0, 0, width - 1, height - 1, null) as light_patch | null };
  for (let f = LG.first_light_source; f; f = f.next) {
    let x1 = f.x1 - screenx, y1 = f.y1 - screeny, x2 = f.x2 - screenx, y2 = f.y2 - screeny;
    if (x1 < 0) x1 = 0;
    if (y1 < 0) y1 = 0;
    if (x2 >= width) x2 = width - 1;
    if (y2 >= height) y2 = height - 1;
    if (x1 <= x2 && y1 <= y2) add_light(first, x1, y1, x2, y2, f);
  }
  return first.v!;
}

function calc_light_value(lp: light_patch, sx: number, sy: number): number {
  let lv = LG.min_light_level;
  for (let i = 0; i < lp.total; i++) {
    const fn = lp.lights[i];
    if (fn.type === 9) return fn.inner_radius;
    const dx = Math.abs(fn.x - sx) << fn.xshift;
    const dy = Math.abs(fn.y - sy) << fn.yshift;
    const r2 = dx < dy ? dx + dy - (dx >> 1) : dx + dy - (dy >> 1);
    if (r2 < fn.outer_radius) {
      const v = fn.outer_radius - r2;
      lv += Math.imul(v, fn.mul_div) >> 16;
    }
  }
  return lv > 63 ? 63 : lv;
}

function find(f: light_patch, y: number, x: number): light_patch {
  let lp: light_patch | null = f;
  for (; lp!.y1 > y || lp!.y2 < y || lp!.x1 > x || lp!.x2 < x; lp = lp!.next);
  return lp!;
}

function map_put(d: Uint8Array, at: number, light: Uint8Array, r: number, w: number): void {
  for (let i = 0; i < w; i++) d[at + i] = light[r + d[at + i]];
}

/** light_screen(sc, screenx, screeny, light_lookup, ambient) */
export function light_screen(sc: image, screenx: number, screeny: number, light_lookup: Uint8Array, ambient: number): void {
  let lx_run = 0;
  ambient &= 0xffff;
  if (LG.shutdown_lighting && !LG.disable_autolight) ambient = LG.shutdown_lighting_value & 0xffff;
  switch (LG.light_detail) {
    case HIGH_DETAIL: lx_run = 2; break;
    case MEDIUM_DETAIL: lx_run = 3; break;
    case LOW_DETAIL: lx_run = 4; break;
    case POOR_DETAIL: return;
  }
  if (ambient + LG.ambient_ramp < 0) LG.min_light_level = 0;
  else if (ambient + LG.ambient_ramp > 63) LG.min_light_level = 63;
  else LG.min_light_level = (ambient + LG.ambient_ramp) & 0xffff;
  if (ambient === 63) return;
  const [cx1, cy1, cx2, cy2] = sc.GetClip();
  const first = make_patch_list(cx2 - cx1, cy2 - cy1, screenx, screeny);
  const prefix_x = screenx & 7;
  let prefix = screenx & 7;
  if (prefix) prefix = 8 - prefix;
  const suffix_x = cx2 - 1 - cx1 - (screenx & 7);
  const suffix = (cx2 - cx1 - prefix) & 7;
  const remap_size = (cx2 - cx1 - prefix - suffix) >> lx_run;
  const remap_line = new Uint8Array(Math.max(0, remap_size));
  const screen = G.screen;
  const d = screen.m_data;
  const scr_w = screen.w;
  let screen_line = cy1 * scr_w + cx1;
  const f = first;
  for (let y = cy1; y < cy2;) {
    let todoy = 4 - ((screeny + y) & 3);
    if (y + todoy >= cy2) todoy = cy2 - y;
    const calcy = ((y + screeny) & ~3) - cy1;
    if (suffix) {
      const lp = find(f, y - cy1, suffix_x);
      let caddr = screen_line + cx2 - cx1 - suffix;
      const r = calc_light_value(lp, suffix_x + screenx, calcy) << 8;
      for (let k = todoy; k >= 1; k--) {
        map_put(d, caddr, light_lookup, r, suffix);
        caddr += scr_w;
      }
    }
    if (prefix) {
      const lp = find(f, y - cy1, prefix_x);
      const r = calc_light_value(lp, prefix_x + screenx, calcy) << 8;
      let caddr = screen_line;
      for (let k = todoy; k >= 1; k--) {
        map_put(d, caddr, light_lookup, r, prefix);
        caddr += scr_w;
      }
      screen_line += prefix;
    }
    let x: number, count: number;
    for (x = prefix, count = 0; count < remap_size; count++, x += 8) {
      const lp = find(f, y - cy1, x);
      remap_line[count] = calc_light_value(lp, x + screenx, calcy);
    }
    for (let k = todoy; k >= 1; k--) {
      let a = screen_line;
      for (let c = 0; c < count; c++) {
        const off = remap_line[c] << 8;
        for (let j = 0; j < 8; j++) d[a + j] = light_lookup[off + d[a + j]];
        a += 8;
      }
      y++;
      screen_line += scr_w;
    }
    screen_line -= prefix;
  }
}

export function add_light_spec(sd: spec_directory): void {
  let size = 4 + 4;
  for (let f = LG.first_light_source; f; f = f.next) size += 6 * 4 + 1;
  sd.add_by_hand(new spec_entry(SPEC_LIGHT_LIST, 'lights', null, size, 0));
}

export function write_lights(fp: bFILE): void {
  let t = 0;
  for (let f = LG.first_light_source; f; f = f.next) t++;
  fp.write_uint32(t);
  fp.write_uint32(LG.min_light_level);
  for (let f = LG.first_light_source; f; f = f.next) {
    fp.write_uint32(f.x);
    fp.write_uint32(f.y);
    fp.write_uint32(f.xshift);
    fp.write_uint32(f.yshift);
    fp.write_uint32(f.inner_radius);
    fp.write_uint32(f.outer_radius);
    fp.write_uint8(f.type);
  }
}

export function read_lights(sd: spec_directory, fp: bFILE): void {
  delete_all_lights();
  const se = sd.find('lights');
  if (se) {
    fp.seek(se.offset, SEEK_SET);
    let t = fp.read_uint32() | 0;
    LG.min_light_level = fp.read_uint32() & 0xffff;
    let last: light_source | null = null;
    while (t) {
      t--;
      const x = fp.read_uint32() | 0, y = fp.read_uint32() | 0, xshift = fp.read_uint32() | 0, yshift = fp.read_uint32() | 0;
      const ir = fp.read_uint32() | 0, ora = fp.read_uint32() | 0, ty = fp.read_uint8();
      const p = new light_source(ty, x, y, ir, ora, xshift, yshift, null);
      if (LG.first_light_source) last!.next = p;
      else LG.first_light_source = p;
      last = p;
    }
  }
}

export function light_debug(): void { dprintf(''); }
