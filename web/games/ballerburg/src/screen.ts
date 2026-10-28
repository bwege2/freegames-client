// screen.c: Ballerburg SDL's drawing on a 640x480 XRGB8888 surface in GEM VDI terms (fill interior and
// style, polylines, fill areas, bars), the "Done" button, the cannonball, saving and restoring parts of
// the screen, and copying the surface to the window.
import {
  SDL_BlitSurface, SDL_CreateSurface, SDL_CreateWindow, SDL_DestroySurface, SDL_FillSurfaceRect, SDL_GetWindowSurface,
  SDL_MapSurfaceRGB, SDL_ToggleFullscreen, SDL_UpdateWindowSurfaceRects, SDL_PIXELFORMAT_XRGB8888, type SDL_Rect, type SDL_Surface,
} from './sdl.ts';
import { filledCircleColor, filledPolygonColor, lineColor, rectangleColor, rectangleRGBA } from './sdlgfx.ts';
import { SDLGui_DrawButton, SDLGui_GetFontSize, SDLGui_Init, SDLGui_SetScreen, SDLGui_Text, SDLGui_UnInit, sdlgui_fontheight, sdlgui_fontwidth } from './sdlgui.ts';
import { obj, SGBOX, SGBUTTON, SG_EXIT, SG_SELECTED, type SGOBJ } from './sdlgui.h.ts';

let windowSurf: SDL_Surface;
export let surf: SDL_Surface;
let the_color = 0, fill_color = 0, bg_color = 0;
let fill_style = 0, fill_interior = 0;

const donebuttondlg: SGOBJ[] = [
  obj(SGBOX, 0, 0, 36, 29, 8, 1, null),
  obj(SGBUTTON, SG_EXIT, 0, 0, 0, 8, 1, 'Done'),
];

export function screenReset(): void {
  the_color = fill_color = bg_color = 0;
  fill_style = fill_interior = 0;
  donebuttondlg[1].state = 0;
}

function scr_sdl2_init(): void {
  SDL_CreateWindow();
  windowSurf = SDL_GetWindowSurface();
}

export function scr_init(): void {
  scr_sdl2_init();
  surf = SDL_CreateSurface(640, 480, SDL_PIXELFORMAT_XRGB8888);
  bg_color = SDL_MapSurfaceRGB(surf, 0xe0, 0xf0, 0xff);
  SDLGui_Init();
  SDLGui_SetScreen(surf);
}

export function scr_exit(): void {
  SDLGui_UnInit();
  SDL_DestroySurface(surf);
}

export function scr_togglefullscreen(): void {
  SDL_ToggleFullscreen();
  scr_update(0, 0, 640, 480);
}

export function scr_clear(): void {
  const white = SDL_MapSurfaceRGB(surf, 0xff, 0xff, 0xff);
  SDL_FillSurfaceRect(surf, { x: 0, y: 0, w: 640, h: 400 }, bg_color);
  for (let i = 0; i < 80; i += 1) {
    SDL_FillSurfaceRect(surf, { x: 0, y: 479 - i, w: 640, h: 1 }, SDL_MapSurfaceRGB(surf, 8 + (i >> 1), 32 + i, 8 + (i >> 1)));
  }
  for (const x of [5, 5 + (629 - 104)]) {
    /* Left and right vane box: */
    const rect = { x, y: 410, w: 104, h: 48 + 16 };
    for (let i = 1; i < 5; i++) {
      rectangleRGBA(surf, rect.x - i, rect.y - i, rect.x + rect.w - 1 + i, rect.y + rect.h - 1 + i, 0xf0, 0xff, 0xf0, 0xff - i * 0x3c);
    }
    SDL_FillSurfaceRect(surf, rect, white);
  }
}

export function scr_l_text(x: number, y: number, text: string): void {
  y -= 12;
  const rect = { x, y, w: text.length * sdlgui_fontwidth, h: sdlgui_fontheight };
  SDL_FillSurfaceRect(surf, rect, SDL_MapSurfaceRGB(surf, 0xff, 0xff, 0xff));
  SDLGui_Text(x, y, text);
  scr_update_rects(surf, 1, rect);
}

/** Draw centered text */
export function scr_ctr_text(cx: number, y: number, text: string): void {
  const w = text.length * sdlgui_fontwidth;
  const rect = { x: cx - Math.trunc(w / 2), y, w, h: sdlgui_fontheight };
  SDL_FillSurfaceRect(surf, rect, SDL_MapSurfaceRGB(surf, 0xff, 0xff, 0xff));
  SDLGui_Text(rect.x, rect.y, text);
  scr_update_rects(surf, 1, rect);
}

export function scr_circle(x: number, y: number, w: number): void {
  filledCircleColor(surf, x, y, w, the_color);
  const rect = { x: Math.max(x - w, 0), y: Math.max(y - w, 0), w: Math.min(2 * w, 640 - x + w), h: Math.min(2 * w, 480 - y + w) };
  scr_update_rects(surf, 1, rect);
}

function update_fill_color(): void {
  if (fill_interior === 0) {
    fill_color = 0xffffffff;
  } else if (fill_interior === 1) {
    fill_color = 0x000000ff;
  } else if (fill_interior === 2) {
    switch (fill_style) {
      case 1: fill_color = 0xc0b0a0ff; break;  // Table color
      case 2: fill_color = 0x602060ff; break;  // King color
      case 9: fill_color = 0x909080ff; break;  // Wall color
      case 11: fill_color = 0xc04020ff; break; // Roof color
    }
  }
}

export function scr_sf_style(val: number): void {
  fill_style = val;
  update_fill_color();
}

export function scr_sf_interior(val: number): void {
  fill_interior = val;
  update_fill_color();
}

export function scr_bar(xy: Int16Array): void {
  const r = fill_color >>> 24, g = (fill_color >>> 16) & 255, b = (fill_color >>> 8) & 255;
  const rect = { x: xy[0], y: xy[1], w: xy[2] - xy[0] + 1, h: xy[3] - xy[1] + 1 };
  SDL_FillSurfaceRect(surf, rect, SDL_MapSurfaceRGB(surf, r, g, b));
  rectangleColor(surf, xy[0], xy[1], xy[2], xy[3], the_color);
  scr_update_rects(surf, 1, rect);
}

export function clr(x: number, y: number, w: number, h: number): void {
  SDL_FillSurfaceRect(surf, { x, y, w, h }, SDL_MapSurfaceRGB(surf, 0xff, 0xff, 0xff));
  scr_update(x, y, w, h);
}

export function clr_bg(x: number, y: number, w: number, h: number): void {
  SDL_FillSurfaceRect(surf, { x, y, w, h }, bg_color);
  scr_update(x, y, w, h);
}

const vx = new Int16Array(512), vy = new Int16Array(512);

export function scr_fillarea(num: number, xy: Int16Array): void {
  if (num > 512) throw new Error('scr_fillarea overflow');
  for (let i = 0; i < num; i++) {
    vx[i] = xy[i * 2];
    vy[i] = xy[i * 2 + 1];
  }
  filledPolygonColor(surf, vx, vy, num, fill_color);
  scr_update(0, 0, 640, 480);
}

export function scr_pline(num: number, xy: Int16Array): void {
  let minx = 639, miny = 399, maxx = 0, maxy = 0;
  let i: number;
  for (i = 0; i < num - 1; i++) {
    if (xy[i * 2] < 0 || xy[i * 2] > 639 || xy[i * 2 + 1] < 0 || xy[i * 2 + 1] > 479) {
      return; // "bad coordinates!"
    }
    if (xy[i * 2] > maxx) maxx = xy[i * 2];
    if (xy[i * 2 + 1] > maxy) maxy = xy[i * 2 + 1];
    if (xy[i * 2] < minx) minx = xy[i * 2];
    if (xy[i * 2 + 1] < miny) miny = xy[i * 2 + 1];
    lineColor(surf, xy[i * 2], xy[i * 2 + 1], xy[i * 2 + 2], xy[i * 2 + 3], (the_color | 0x1000) >>> 0);
  }
  if (xy[i * 2] > maxx) maxx = xy[i * 2];
  if (xy[i * 2 + 1] > maxy) maxy = xy[i * 2 + 1];
  if (xy[i * 2] < minx) minx = xy[i * 2];
  if (xy[i * 2 + 1] < miny) miny = xy[i * 2 + 1];
  scr_update(minx, miny, maxx - minx + 1, maxy - miny + 1);
}

export function scr_line(x1: number, y1: number, x2: number, y2: number, rgb: number): void {
  lineColor(surf, x1, y1, x2, y2, ((rgb << 8) | 0xff) >>> 0);
}

export function scr_getpixel(x: number, y: number): number {
  return (surf.pixels as Uint32Array)[y * 640 + x] & 0xffffff;
}

export function scr_color(c: number): void {
  the_color = ((c << 8) | 0xff) >>> 0;
}

export function scr_fillcolor(c: number): void {
  fill_color = ((c << 8) | 0xff) >>> 0;
}

/** Select foreground (1) or background (0) color */
export function color(c: number): void {
  if (c) the_color = 0x000000ff;
  else the_color = ((bg_color << 8) | 0x0ff) >>> 0;
}

export function scr_init_done_button(): { x: number; y: number; w: number; h: number } {
  const f = SDLGui_GetFontSize();
  return { x: donebuttondlg[0].x * f.w, y: donebuttondlg[0].y * f.h, w: donebuttondlg[0].w * f.w, h: donebuttondlg[0].h * f.h };
}

export function scr_draw_done_button(selected: number): void {
  if (selected) donebuttondlg[1].state |= SG_SELECTED;
  else donebuttondlg[1].state &= ~SG_SELECTED;
  SDLGui_DrawButton(donebuttondlg, 1);
  scr_update(0, 0, 0, 0);
}

/** Draws a fast cannonball */
export function scr_cannonball(x: number, y: number): void {
  lineColor(surf, x - 1, y - 2, x + 1, y - 2, the_color);
  lineColor(surf, x - 2, y - 1, x + 2, y - 1, the_color);
  lineColor(surf, x - 2, y, x + 2, y, the_color);
  lineColor(surf, x - 2, y + 1, x + 2, y + 1, the_color);
  lineColor(surf, x - 1, y + 2, x + 1, y + 2, the_color);
}

/** Stores information about saved background area */
export interface SaveBg { rect: SDL_Rect; bgrect: SDL_Rect; bgsurf: SDL_Surface }

/** Save a part of the background of the screen */
export function scr_save_bg(x: number, y: number, w: number, h: number): SaveBg {
  const s: SaveBg = { rect: { x, y, w, h }, bgrect: { x: 0, y: 0, w, h }, bgsurf: SDL_CreateSurface(w, h, surf.format) };
  SDL_BlitSurface(surf, s.rect, s.bgsurf, s.bgrect);
  return s;
}

/** Restore part of the background */
export function scr_restore_bg(s: SaveBg): void {
  SDL_BlitSurface(s.bgsurf, s.bgrect, surf, s.rect);
  SDL_DestroySurface(s.bgsurf);
  scr_update_rects(surf, 1, s.rect);
}

export function scr_update_rects(_screen: SDL_Surface, _numrects: number, rects: SDL_Rect): void {
  SDL_BlitSurface(surf, rects, windowSurf, rects);
  SDL_UpdateWindowSurfaceRects();
}

export function scr_update(x: number, y: number, w: number, h: number): void {
  if (x >= 640 || y >= 480) return;
  if (x < 0) x = 0;
  if (y < 0) y = 0;
  if (w === 0 && h === 0) {
    w = 640;
    h = 480;
  }
  if (x + w > 640) w = 640 - x;
  if (y + h > 480) h = 480 - y;
  scr_update_rects(surf, 1, { x, y, w, h });
}
