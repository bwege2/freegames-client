// lw/gfxmode.ts: src/gfxmode.c: the video modes (320x240 to 1024x768, the Unix list), set_resolution with
// the font and mouse cursor that go with the size. The port is always windowed (in the page); the
// "fullscreen" setting is kept and shown, the page's own full screen button does the rest (README.md).

import { set_palette, black_palette } from '../al/palette.ts';
import { setFont } from '../al/font.ts';
import { set_gfx_mode, SCREEN_W } from '../al/screen.ts';
import { lw_mouse_show } from './mouse.ts';
import { G } from './state.ts';
import { VP } from './viewport.ts';

export const GFX_MODE_W = [320, 512, 640, 800, 1024];
export const GFX_MODE_H = [240, 384, 480, 600, 768];

export function need_to_change_mode(res1: number, res2: number, flip: number): boolean {
  return !(res1 === res2 && !flip);
}

export function set_resolution(res: number, flip: number, fullscreen: number): number {
  void flip;
  void fullscreen;
  if (res < 0 || res > 4) res = 2;
  set_gfx_mode(GFX_MODE_W[res]!, GFX_MODE_H[res]!);
  VP.NEXT_SCREEN = null;
  set_palette(black_palette);
  setFont(SCREEN_W() >= 640 ? G.BIG_FONT! : G.SMALL_FONT!);
  lw_mouse_show();
  return 0;
}
