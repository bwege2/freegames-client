// The SDL_gfx (SDL2_gfxPrimitives) functions the original's software renderer calls, on a Canvas 2D context
// (PORTING-STAGE2.md, section 2: the browser draws the non-GL path). Plus drawing.cpp's CAP_SDLGFX wrappers
// (filledPolygonColorI, polylineColor, aapolylineColor), which are the original's code. Stage 2, package D1.
// (C) Zeno Rogue (the wrappers, GPL-2.0-or-later); the shim is the port's own.
//
// Colours: the game passes color_t 0xRRGGBBAA; the wrappers apply colors.cpp align() as the original does (SDL2
// reads the Uint32 as bytes r, g, b, a in memory order), and the shim decodes it the same way. Coordinates: the
// original converts the int pixels to Sint16 for SDL_gfx (filledPolygonColorI): kept. Deviation (README.md): the
// canvas fills paths with antialiasing (even-odd rule, as SDL_gfx's scanline fill) and strokes 1-pixel lines at
// pixel centres; SDL_gfx draws aliased spans. The pixels are not checked by the oracle (its SVG is checked).
//
// Without a canvas (the tests, headless) the renderer has no context and every call draws nothing.
import { align } from './colors.ts';
import { i16 } from './cpp.ts';

/** SDL_Renderer: the canvas the window draws on (null headless) */
export class SDL_Renderer {
  ctx: CanvasRenderingContext2D | null = null;
}

/** the window's renderer (drawing.cpp `srend`) */
const srend = new SDL_Renderer();
export function sdl_srend(): SDL_Renderer { return srend; }
/** the browser's start code sets the canvas */
export function sdl_set_canvas(ctx: CanvasRenderingContext2D | null): void { srend.ctx = ctx; }

/** an SDL2_gfx colour (after align: the bytes r, g, b, a from the lowest) as a CSS colour */
function css(c: number): string {
  let s = css_cache.get(c);
  if (s === undefined) {
    const r = c & 0xFF, g = (c >>> 8) & 0xFF, b = (c >>> 16) & 0xFF, a = (c >>> 24) & 0xFF;
    s = `rgba(${r},${g},${b},${a / 255})`;
    if (css_cache.size >= 4096) css_cache.clear();
    css_cache.set(c, s);
  }
  return s;
}
/** the CSS strings of the colours drawn (performance: the game draws a few hundred colours per frame) */
const css_cache = new Map<number, string>();
const alpha_of = (c: number): number => (c >>> 24) & 0xFF;

/** int filledPolygonColor(SDL_Renderer *renderer, const Sint16 *vx, const Sint16 *vy, int n, Uint32 color) */
export function filledPolygonColor(s: SDL_Renderer, vx: ArrayLike<number>, vy: ArrayLike<number>, n: number, color: number): number {
  if (n < 3) return -1;
  const ctx = s.ctx;
  if (!ctx || alpha_of(color) === 0) return 0;
  ctx.beginPath();
  ctx.moveTo(vx[0], vy[0]);
  for (let i = 1; i < n; i++) ctx.lineTo(vx[i], vy[i]);
  ctx.closePath();
  ctx.fillStyle = css(color);
  ctx.fill('evenodd');
  return 0;
}

/** int lineColor(SDL_Renderer *renderer, Sint16 x1, Sint16 y1, Sint16 x2, Sint16 y2, Uint32 color) */
export function lineColor(s: SDL_Renderer, x1: number, y1: number, x2: number, y2: number, color: number): number {
  const ctx = s.ctx;
  if (!ctx || alpha_of(color) === 0) return 0;
  ctx.beginPath();
  ctx.moveTo(i16(x1) + .5, i16(y1) + .5);
  ctx.lineTo(i16(x2) + .5, i16(y2) + .5);
  ctx.lineWidth = 1;
  ctx.strokeStyle = css(color);
  ctx.stroke();
  return 0;
}

/** int aalineColor(...): the antialiased line (the canvas antialiases every line) */
export function aalineColor(s: SDL_Renderer, x1: number, y1: number, x2: number, y2: number, color: number): number {
  return lineColor(s, x1, y1, x2, y2, color);
}

/** a polyline in one canvas path (what the loops of lineColor calls below draw, faster) */
function polyline(s: SDL_Renderer, x: ArrayLike<number>, y: ArrayLike<number>, polyi: number, color: number): void {
  const ctx = s.ctx;
  if (!ctx || polyi < 2 || alpha_of(color) === 0) return;
  ctx.beginPath();
  ctx.moveTo(i16(x[0]) + .5, i16(y[0]) + .5);
  for (let i = 1; i < polyi; i++) ctx.lineTo(i16(x[i]) + .5, i16(y[i]) + .5);
  ctx.lineWidth = 1;
  ctx.strokeStyle = css(color);
  ctx.stroke();
}

/** int circleColor(SDL_Renderer *renderer, Sint16 x, Sint16 y, Sint16 rad, Uint32 color) */
export function circleColor(s: SDL_Renderer, x: number, y: number, rad: number, color: number): number {
  const ctx = s.ctx;
  if (!ctx || alpha_of(color) === 0) return 0;
  ctx.beginPath();
  ctx.arc(i16(x) + .5, i16(y) + .5, Math.max(0, i16(rad)), 0, 2 * Math.PI);
  ctx.lineWidth = 1;
  ctx.strokeStyle = css(color);
  ctx.stroke();
  return 0;
}

/** int aacircleColor(...) */
export function aacircleColor(s: SDL_Renderer, x: number, y: number, rad: number, color: number): number {
  return circleColor(s, x, y, rad, color);
}

/** int filledCircleColor(SDL_Renderer *renderer, Sint16 x, Sint16 y, Sint16 rad, Uint32 color) */
export function filledCircleColor(s: SDL_Renderer, x: number, y: number, rad: number, color: number): number {
  const ctx = s.ctx;
  if (!ctx || alpha_of(color) === 0) return 0;
  ctx.beginPath();
  ctx.arc(i16(x) + .5, i16(y) + .5, Math.max(0, i16(rad)), 0, 2 * Math.PI);
  ctx.fillStyle = css(color);
  ctx.fill();
  return 0;
}

/** int ellipseColor(SDL_Renderer *renderer, Sint16 x, Sint16 y, Sint16 rx, Sint16 ry, Uint32 color) */
export function ellipseColor(s: SDL_Renderer, x: number, y: number, rx: number, ry: number, color: number): number {
  const ctx = s.ctx;
  if (!ctx || alpha_of(color) === 0) return 0;
  ctx.beginPath();
  ctx.ellipse(i16(x) + .5, i16(y) + .5, Math.max(0, i16(rx)), Math.max(0, i16(ry)), 0, 0, 2 * Math.PI);
  ctx.lineWidth = 1;
  ctx.strokeStyle = css(color);
  ctx.stroke();
  return 0;
}

/** int filledEllipseColor(...) */
export function filledEllipseColor(s: SDL_Renderer, x: number, y: number, rx: number, ry: number, color: number): number {
  const ctx = s.ctx;
  if (!ctx || alpha_of(color) === 0) return 0;
  ctx.beginPath();
  ctx.ellipse(i16(x) + .5, i16(y) + .5, Math.max(0, i16(rx)), Math.max(0, i16(ry)), 0, 0, 2 * Math.PI);
  ctx.fillStyle = css(color);
  ctx.fill();
  return 0;
}

/** SDL_FillSurfaceRect(SDL_Surface *dst, const SDL_Rect *rect, Uint32 color): the surface is the canvas;
 *  color is the surface's pixel format (0xAARRGGBB, as SDL_MapRGB gives for the window surface) */
export function SDL_FillSurfaceRect(s: SDL_Renderer, rect: { x: number; y: number; w: number; h: number } | null, color: number): number {
  const ctx = s.ctx;
  if (!ctx) return 0;
  const r = (color >>> 16) & 0xFF, g = (color >>> 8) & 0xFF, b = color & 0xFF;
  ctx.fillStyle = `rgb(${r},${g},${b})`;
  if (rect) ctx.fillRect(rect.x, rect.y, rect.w, rect.h);
  else ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
  return 0;
}

// --- drawing.cpp, CAP_SDLGFX (the original's wrappers) ---

/** void aapolylineColor(SDL_Renderer *s, int*x, int *y, int polyi, color_t col): aalineColor for each segment */
export function aapolylineColor(s: SDL_Renderer, x: ArrayLike<number>, y: ArrayLike<number>, polyi: number, col: number): void {
  // for(int i=1; i<polyi; i++) aalineColor(s, x[i-1], y[i-1], x[i], y[i], align(col));
  polyline(s, x, y, polyi, align(col));
}

/** void polylineColor(SDL_Renderer *s, int *x, int *y, int polyi, color_t col): lineColor for each segment */
export function polylineColor(s: SDL_Renderer, x: ArrayLike<number>, y: ArrayLike<number>, polyi: number, col: number): void {
  // for(int i=1; i<polyi; i++) lineColor(s, x[i-1], y[i-1], x[i], y[i], align(col));
  polyline(s, x, y, polyi, align(col));
}

/** void filledPolygonColorI(SDL_Renderer *s, int* px, int *py, int polyi, color_t col): Sint16 copies */
export function filledPolygonColorI(s: SDL_Renderer, px: ArrayLike<number>, py: ArrayLike<number>, polyi: number, col: number): void {
  // filledPolygonColor(s, spx, spy, polyi, align(col)) with the Sint16 conversion (i16) done as the points are
  // passed (performance: no copies)
  if (polyi < 3) return;
  const ctx = s.ctx;
  if (!ctx || alpha_of(align(col)) === 0) return;
  ctx.beginPath();
  ctx.moveTo(i16(px[0]), i16(py[0]));
  for (let i = 1; i < polyi; i++) ctx.lineTo(i16(px[i]), i16(py[i]));
  ctx.closePath();
  ctx.fillStyle = css(align(col));
  ctx.fill('evenodd');
}
