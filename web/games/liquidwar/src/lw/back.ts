// lw/back.ts: src/back.c: the menus' background picture, stretched over the screen.

import { stretch_blit } from '../al/bitmap.ts';
import { screenRef } from '../al/screen.ts';
import { G } from './state.ts';
import { PAGE_FLIP_H } from './viewport.ts';

export function display_back_image(): void {
  const s = screenRef.screen;
  const b = G.BACK_IMAGE!;
  stretch_blit(b, s, 0, 0, b.w, b.h, 0, PAGE_FLIP_H(), s.w, s.h);
}
