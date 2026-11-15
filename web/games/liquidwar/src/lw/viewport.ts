// lw/viewport.ts: src/viewport.c: the part of the screen the battle is drawn in (NEXT_SCREEN, a sub-bitmap
// of the screen), its frame, and page flipping (which needs a virtual screen twice as high: the windowed
// modes the port has do not have one, so pages are never flipped, as in the original's windowed modes).

import { type Bitmap, create_sub_bitmap, rect, set_clip_rect } from '../al/bitmap.ts';
import { screenRef } from '../al/screen.ts';
import { init_distorsion_displayer } from './distor.ts';
import { lw_info_get_room_for_viewport } from './info.ts';
import { G, MENU_FG } from './state.ts';

let pageFlipH = 0;
export function PAGE_FLIP_H(): number {
  return pageFlipH;
}

export const VP = { NEXT_SCREEN: null as Bitmap | null };
let VIEWPORT_X = 0, VIEWPORT_Y = 0, VIEWPORT_W = 0, VIEWPORT_H = 0;
let VIEWPORT_CHANGE_REGISTERED = 0;

export function rect_for_viewport(): void {
  rect(screenRef.screen, VIEWPORT_X - 1, VIEWPORT_Y - 1 + pageFlipH, VIEWPORT_X + VIEWPORT_W, VIEWPORT_Y + VIEWPORT_H + pageFlipH, MENU_FG);
}

const viewport_sizes = [18, 24, 27, 30, 33, 35, 36];

function init_viewport_size(x: number, y: number, w: number, h: number): void {
  const scale_w = 10 * w;
  const scale_h = 10 * h;
  const AW = G.CURRENT_AREA_W, AH = G.CURRENT_AREA_H;
  if (G.CONFIG_VIEWPORT_SIZE >= 8) {
    VIEWPORT_W = scale_w;
    VIEWPORT_H = scale_h;
  }
  if (G.CONFIG_VIEWPORT_SIZE > 0 && G.CONFIG_VIEWPORT_SIZE < 8) {
    if (scale_w * AH < scale_h * AW) {
      VIEWPORT_W = Math.trunc((scale_w * viewport_sizes[G.CONFIG_VIEWPORT_SIZE - 1]!) / viewport_sizes[6]!);
      VIEWPORT_H = Math.trunc((VIEWPORT_W * AH) / AW);
    } else {
      VIEWPORT_H = Math.trunc((scale_h * viewport_sizes[G.CONFIG_VIEWPORT_SIZE - 1]!) / viewport_sizes[6]!);
      VIEWPORT_W = Math.trunc((VIEWPORT_H * AW) / AH);
    }
  }
  if (G.CONFIG_VIEWPORT_SIZE <= 0) {
    VIEWPORT_W = AW;
    VIEWPORT_H = AH;
    while (VIEWPORT_W > w || VIEWPORT_H > h) {
      VIEWPORT_W = Math.trunc(VIEWPORT_W / 2);
      VIEWPORT_H = Math.trunc(VIEWPORT_H / 2);
    }
  } else {
    VIEWPORT_W *= w;
    VIEWPORT_H *= h;
    VIEWPORT_W = Math.trunc(VIEWPORT_W / scale_w);
    VIEWPORT_H = Math.trunc(VIEWPORT_H / scale_h);
  }
  VIEWPORT_X = x + Math.trunc((w - VIEWPORT_W) / 8) * 4;
  VIEWPORT_Y = y + Math.trunc((h - VIEWPORT_H) / 2);
}

export function page_flip(): Bitmap {
  const screen = screenRef.screen;
  pageFlipH = 0;
  if (VIEWPORT_CHANGE_REGISTERED || !VP.NEXT_SCREEN) {
    set_clip_rect(screen, 0, 0, screen.w - 1, screen.h - 1);
    const r = lw_info_get_room_for_viewport();
    init_viewport_size(r.x, r.y, r.w, r.h);
    VP.NEXT_SCREEN = create_sub_bitmap(screen, VIEWPORT_X, VIEWPORT_Y, VIEWPORT_W, VIEWPORT_H);
  }
  if (VIEWPORT_CHANGE_REGISTERED > 0) {
    rect_for_viewport();
    init_distorsion_displayer();
    VIEWPORT_CHANGE_REGISTERED--;
  }
  return VP.NEXT_SCREEN!;
}

export function last_flip(): void {
  if (VP.NEXT_SCREEN) VP.NEXT_SCREEN = null;
}

export function lw_viewport_register_change(count: number): void {
  VIEWPORT_CHANGE_REGISTERED = count;
}
