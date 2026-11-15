// al/screen.ts: the screen bitmap (set_gfx_mode in an 8-bit windowed mode: 320x240 to 1024x768, the
// sizes of Liquid War's src/gfxmode.c) and the FNV-1a hashes of the trace (oracle.c sample()).

import { Bitmap } from './bitmap.ts';
import { mouse } from './mouse.ts';
import { current_palette } from './palette.ts';

export const screenRef = {
  screen: new Bitmap(640, 480),
  /** counts mode changes (the page resizes its canvas) */
  serial: 0,
  /** set_gfx_mode(GFX_TEXT) on exit: no screen to sample any more */
  textMode: false,
};

export function set_gfx_mode(w: number, h: number): number {
  screenRef.screen = new Bitmap(w, h);
  screenRef.serial++;
  // set_mouse_etc (mouse.c): the mouse goes to the middle of the new screen
  mouse.x = Math.trunc(w / 2);
  mouse.y = Math.trunc(h / 2);
  return 0;
}

export function SCREEN_W(): number {
  return screenRef.screen.w;
}

export function SCREEN_H(): number {
  return screenRef.screen.h;
}

export function fnv(h: number, data: Uint8Array, from: number, to: number): number {
  for (let i = from; i < to; i++) {
    h ^= data[i]!;
    h = Math.imul(h, 16777619) >>> 0;
  }
  return h >>> 0;
}

export function screenHash(): number {
  const s = screenRef.screen;
  let h = 2166136261;
  for (let y = 0; y < s.h; y++) h = fnv(h, s.data, s.base + y * s.stride, s.base + y * s.stride + s.w);
  return h;
}

export function paletteHash(): number {
  return fnv(2166136261, current_palette, 0, 768);
}

export function hex8(n: number): string {
  return (n >>> 0).toString(16).padStart(8, '0');
}
