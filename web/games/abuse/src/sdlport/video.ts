// sdlport/video.cpp and imlib/video.cpp: the screen image, the window's 8-bit surface it is copied to
// (only its dirty rectangles), the palette. The window is 320x200 (the port scales it in the page),
// so put_part_image takes the original's unscaled path.
import { image } from '../imlib/image.ts';
import { palette } from '../imlib/palette.ts';
import { platform } from '../rt/platform.ts';
import { G } from '../globals.ts';

/** the SDL surface the screen is copied to */
export let surface = new Uint8Array(320 * 200);
/** the palette last loaded (lastl) */
export let lastl: palette | null = null;
const shown = new Uint8Array(768);

export function set_mode(): void {
  G.screen = new image(G.xres, G.yres, null, 2);
  G.screen.clear();
  surface = new Uint8Array(G.xres * G.yres);
  update_dirty(G.screen);
}

export function close_graphics(): void {
  lastl = null;
}

export function put_part_image(im: image, x: number, y: number, x1: number, y1: number, x2: number, y2: number): void {
  const xres = G.xres, yres = G.yres;
  if (y > yres || x > xres) return;
  if (x < 0) {
    x1 += -x;
    x = 0;
  }
  const sx = x1;
  const xe = x + (x2 - x1) >= xres ? xres - x + x1 - 1 : x2;
  if (y < 0) {
    y1 += -y;
    y = 0;
  }
  const sy = y1;
  const ye = y + (y2 - y1) >= yres ? yres - y + y1 - 1 : y2;
  if (sx >= xe || sy >= ye) return;
  const w = xe - sx, h = ye - sy;
  let srcy = sy;
  let d = y * xres + x;
  for (let ii = 0; ii < h; ii++) {
    const s = srcy * im.w + sx;
    surface.set(im.m_data.subarray(s, s + w), d);
    d += xres;
    srcy++;
  }
}

export function update_window_done(counted = true): void {
  const p = lastl;
  if (p) {
    shown.fill(0);
    shown.set(p.pal.subarray(0, Math.min(768, p.ncolors * 3)));
  }
  platform().present(surface, shown, counted);
}

/** imlib/video.cpp update_dirty */
export function update_dirty(im: image, xoff = 0, yoff = 0): void {
  const sp = im.m_special!;
  if (sp.keep_dirt === 0) put_part_image(im, xoff, yoff, 0, 0, im.w - 1, im.h - 1);
  else {
    let count = sp.dirties.Count();
    let dr = sp.dirties.first();
    while (count > 0 && dr) {
      put_part_image(im, xoff + dr.dx1, yoff + dr.dy1, dr.dx1, dr.dy1, dr.dx2 + 1, dr.dy2 + 1);
      const tmp = dr;
      dr = dr.Next() as typeof dr;
      sp.dirties.unlink(tmp);
      count--;
    }
  }
  update_window_done();
}

/** palette::load */
export function palette_load(p: palette): void {
  lastl = p.copy();
  update_window_done(false);
}
