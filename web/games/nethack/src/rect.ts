// @ts-nocheck
// NetHack 3.6.7 rect.c, translated to TypeScript by re/nethack/tools/c2ts (do not edit).
import { pline } from './pline.ts';
import { rn2 } from './rnd.ts';
import { struct_nhrect } from './structs.ts';
import { $sadd, $sarr, $sat, G, S } from './rt/index.ts';
import { COLNO, FALSE, MAXRECT, ROWNO, TRUE, XLIM, YLIM } from './consts.ts';

let rect: any;
let rect_cnt: number;

export function init_rect(): void {
  rect_cnt = 1;
  rect[0].lx = rect[0].ly = 0;
  rect[0].hx = COLNO - 1;
  rect[0].hy = ROWNO - 1;
}

export function get_rect_ind(r: struct_nhrect | null): number {
  let rectp = null;
  let lx = 0;
  let ly = 0;
  let hx = 0;
  let hy = 0;
  let i = 0;
  lx = r.lx;
  ly = r.ly;
  hx = r.hx;
  hy = r.hy;
  for (i = 0, rectp = rect[0]; i < rect_cnt; ++i, rectp = $sadd(rectp, 1)) {
    if (lx === rectp.lx && ly === rectp.ly && hx === rectp.hx && hy === rectp.hy) {
      return i;
    }
  }
  return -1;
}

export function get_rect(r: struct_nhrect | null): struct_nhrect | null {
  let rectp = null;
  let lx = 0;
  let ly = 0;
  let hx = 0;
  let hy = 0;
  let i = 0;
  lx = r.lx;
  ly = r.ly;
  hx = r.hx;
  hy = r.hy;
  for (i = 0, rectp = rect[0]; i < rect_cnt; ++i, rectp = $sadd(rectp, 1)) {
    if (lx >= rectp.lx && ly >= rectp.ly && hx <= rectp.hx && hy <= rectp.hy) {
      return rectp;
    }
  }
  return null;
}

export function rnd_rect(): struct_nhrect | null {
  return rect_cnt > 0 ? $sat(rect, rn2(rect_cnt)) : null;
}

function intersect(r1: struct_nhrect | null, r2: struct_nhrect | null, r3: struct_nhrect | null): number {
  if (r2.lx > r1.hx || r2.ly > r1.hy || r2.hx < r1.lx || r2.hy < r1.ly) {
    return FALSE;
  }
  r3.lx = (r2.lx > r1.lx ? r2.lx : r1.lx) << 24 >> 24;
  r3.ly = (r2.ly > r1.ly ? r2.ly : r1.ly) << 24 >> 24;
  r3.hx = (r2.hx > r1.hx ? r1.hx : r2.hx) << 24 >> 24;
  r3.hy = (r2.hy > r1.hy ? r1.hy : r2.hy) << 24 >> 24;
  if (r3.lx > r3.hx || r3.ly > r3.hy) {
    return FALSE;
  }
  return TRUE;
}

export function remove_rect(r: struct_nhrect | null): void {
  let ind = 0;
  ind = get_rect_ind(r);
  if (ind >= 0) {
    rect[ind].$cp(rect[--rect_cnt]);
  }
}

export async function add_rect(r: struct_nhrect | null): Promise<void> {
  if (rect_cnt >= MAXRECT) {
    if (G.flags.debug) {
      await pline(S("MAXRECT may be too small."));
    }
    return;
  }
  if (get_rect(r)) {
    return;
  }
  rect[rect_cnt].$cp(r);
  ++rect_cnt;
}

export async function split_rects(r1: struct_nhrect | null, r2: struct_nhrect | null): Promise<void> {
  let r = new struct_nhrect();
  let old_r = new struct_nhrect();
  let i = 0;
  old_r.$cp(r1);
  remove_rect(r1);
  for (i = rect_cnt - 1; i >= 0; --i) {
    if (intersect($sat(rect, i), r2, r)) {
      await split_rects($sat(rect, i), r);
    }
  }
  if (r2.ly - old_r.ly - 1 > (old_r.hy < ROWNO - 1 ? 2 * YLIM : YLIM + 1) + 4) {
    r.$cp(old_r);
    r.hy = r2.ly - 2 << 24 >> 24;
    await add_rect(r);
  }
  if (r2.lx - old_r.lx - 1 > (old_r.hx < COLNO - 1 ? 2 * XLIM : XLIM + 1) + 4) {
    r.$cp(old_r);
    r.hx = r2.lx - 2 << 24 >> 24;
    await add_rect(r);
  }
  if (old_r.hy - r2.hy - 1 > (old_r.ly > 0 ? 2 * YLIM : YLIM + 1) + 4) {
    r.$cp(old_r);
    r.ly = r2.hy + 2 << 24 >> 24;
    await add_rect(r);
  }
  if (old_r.hx - r2.hx - 1 > (old_r.lx > 0 ? 2 * XLIM : XLIM + 1) + 4) {
    r.$cp(old_r);
    r.lx = r2.hx + 2 << 24 >> 24;
    await add_rect(r);
  }
}

export function $init(): void {
  rect = $sarr(struct_nhrect, 51);
  rect_cnt = 0;
}
