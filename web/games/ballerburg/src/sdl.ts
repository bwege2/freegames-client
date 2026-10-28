// The part of SDL 3 that Ballerburg SDL uses: software surfaces (XRGB8888 and the 8-bit font), filling
// and blitting with SDL's clipping, the window surface, the event queue and SDL_Delay. Where the events
// come from and where time passes is a Platform: the browser (index.ts) or a scripted run (the tests).
// Every fill and blit can be recorded (rec), the same way the oracle's stub SDL records them.

export const SDL_PIXELFORMAT_INDEX8 = 0x13000801;
export const SDL_PIXELFORMAT_XRGB8888 = 0x16161804;

export interface SDL_Rect { x: number; y: number; w: number; h: number }

export class SDL_Surface {
  readonly id: number;
  readonly format: number;
  readonly w: number;
  readonly h: number;
  /** XRGB8888: one 0x00RRGGBB per pixel; INDEX8: one palette index per pixel */
  readonly pixels: Uint32Array | Uint8Array;
  clip: SDL_Rect;
  colorKey: number | null = null;
  palette: { r: number; g: number; b: number; a: number }[] | null = null;
  /** the window surface: what is on the screen */
  isWindow = false;

  constructor(id: number, w: number, h: number, format: number) {
    this.id = id;
    this.w = w;
    this.h = h;
    this.format = format;
    this.pixels = format === SDL_PIXELFORMAT_INDEX8 ? new Uint8Array(w * h) : new Uint32Array(w * h);
    this.clip = { x: 0, y: 0, w, h };
  }
}

// ---------------------------------------------------------------- events
export const SDL_EVENT_QUIT = 0x100;
export const SDL_EVENT_WINDOW_EXPOSED = 0x204;
export const SDL_EVENT_WINDOW_RESTORED = 0x209;
export const SDL_EVENT_KEY_DOWN = 0x300;
export const SDL_EVENT_KEY_UP = 0x301;
export const SDL_EVENT_TEXT_INPUT = 0x303;
export const SDL_EVENT_MOUSE_MOTION = 0x400;
export const SDL_EVENT_MOUSE_BUTTON_DOWN = 0x401;
export const SDL_EVENT_MOUSE_BUTTON_UP = 0x402;
/** not SDL's: a move of the online opponent arrived (wakes up a waiting event loop, nothing else) */
export const SDL_EVENT_USER = 0x8000;

export const SDL_BUTTON_LEFT = 1;
export const SDL_BUTTON_RIGHT = 3;

export const SDLK_RETURN = 0x0d;
export const SDLK_ESCAPE = 0x1b;
export const SDLK_BACKSPACE = 0x08;
export const SDLK_DELETE = 0x7f;
export const SDLK_F = 0x66;
export const SDLK_Q = 0x71;
export const SDLK_T = 0x74;
export const SDLK_RIGHT = 0x4000004f;
export const SDLK_LEFT = 0x40000050;
export const SDLK_KP_ENTER = 0x40000058;

export interface SDL_Event {
  type: number;
  /** mouse events (motion.x/y, button.x/y) */
  x: number;
  y: number;
  /** button events */
  button: number;
  /** key events */
  key: number;
  /** text input: the first byte of the text (the only one the original reads), a Latin-1 code here */
  text: number;
}

export function makeEvent(type: number, o: Partial<SDL_Event> = {}): SDL_Event {
  return { type, x: 0, y: 0, button: 0, key: 0, text: 0, ...o };
}

/** Where events come from, where time passes and where the window surface goes. */
export interface Platform {
  /** SDL_WaitEvent: the next event (rejects when the game must stop) */
  wait(): Promise<SDL_Event>;
  /** SDL_PollEvent: the next event if one is there */
  poll(): SDL_Event | null;
  /** SDL_Delay */
  delay(ms: number): Promise<void>;
  /** SDL_UpdateWindowSurfaceRects: this part of the window surface changed */
  present(r: SDL_Rect): void;
  /** a frame boundary of the oracle's recording: "W" (SDL_WaitEvent) or "D<ms>" (SDL_Delay) */
  frame?(kind: string): void;
  textInput?(on: boolean): void;
  toggleFullscreen?(): void;
}

let platform: Platform | null = null;
let nextId = 0;
let window: SDL_Surface | null = null;
/** the recorder of the oracle's call log (tests only) */
export let rec: ((line: string) => void) | null = null;

export function SDL_SetPlatform(p: Platform): void {
  platform = p;
}

export function setRecorder(r: ((line: string) => void) | null): void {
  rec = r;
}

/** a fresh program: no surfaces, no window */
export function sdlReset(): void {
  nextId = 0;
  window = null;
}

export function hex(v: number): string {
  return (v >>> 0).toString(16);
}

// ---------------------------------------------------------------- surfaces
export function SDL_CreateSurface(w: number, h: number, format: number): SDL_Surface {
  const s = new SDL_Surface(nextId++, w, h, format);
  rec?.(`C ${s.id} ${w} ${h} ${format === SDL_PIXELFORMAT_INDEX8 ? 'I' : 'X'}`);
  return s;
}

export function SDL_DestroySurface(s: SDL_Surface): void {
  rec?.(`X ${s.id}`);
}

/** SDL_MapSurfaceRGB(A) for XRGB8888: no alpha bits, the X byte stays 0 */
export function SDL_MapSurfaceRGB(_s: SDL_Surface, r: number, g: number, b: number): number {
  return ((r & 255) << 16 | (g & 255) << 8 | (b & 255)) >>> 0;
}

export function SDL_MapSurfaceRGBA(s: SDL_Surface, r: number, g: number, b: number, _a: number): number {
  return SDL_MapSurfaceRGB(s, r, g, b);
}

/** SDL_GetRectIntersection: null when either is empty or they do not meet */
function intersect(a: SDL_Rect, b: SDL_Rect): SDL_Rect | null {
  if (a.w <= 0 || a.h <= 0 || b.w <= 0 || b.h <= 0) return null;
  const x = Math.max(a.x, b.x), y = Math.max(a.y, b.y);
  const w = Math.min(a.x + a.w, b.x + b.w) - x, h = Math.min(a.y + a.h, b.y + b.h) - y;
  return w > 0 && h > 0 ? { x, y, w, h } : null;
}

function rectStr(r: SDL_Rect | null): string {
  return r ? `${r.x} ${r.y} ${r.w} ${r.h}` : '-';
}

export function SDL_FillSurfaceRect(s: SDL_Surface, rect: SDL_Rect | null, color: number): boolean {
  rec?.(`F ${s.id} ${rectStr(rect)} ${hex(color)}`);
  const r = rect ? intersect(rect, s.clip) : s.clip;
  if (!r) return true;
  const p = s.pixels;
  const c = s.format === SDL_PIXELFORMAT_INDEX8 ? color & 255 : color >>> 0;
  for (let y = r.y; y < r.y + r.h; y++) p.fill(c, y * s.w + r.x, y * s.w + r.x + r.w);
  if (s.isWindow) platform?.present(r);
  return true;
}

export function SDL_BlitSurface(src: SDL_Surface, srcrect: SDL_Rect | null, dst: SDL_Surface, dstrect: SDL_Rect | null): boolean {
  rec?.(`B ${src.id} ${rectStr(srcrect)} ${dst.id} ${dstrect ? `${dstrect.x} ${dstrect.y}` : '-'}`);
  let rs: SDL_Rect = { x: 0, y: 0, w: src.w, h: src.h };
  const rd: SDL_Rect = { x: dstrect ? dstrect.x : 0, y: dstrect ? dstrect.y : 0, w: 0, h: 0 };
  if (srcrect) {
    const t = intersect(srcrect, rs);
    if (!t) return true;
    rd.x += t.x - srcrect.x;
    rd.y += t.y - srcrect.y;
    rs = t;
  }
  rd.w = rs.w;
  rd.h = rs.h;
  const t = intersect(rd, dst.clip);
  if (!t) return true;
  rs.x += t.x - rd.x;
  rs.y += t.y - rd.y;
  const w = t.w, h = t.h;
  const d = dst.pixels as Uint32Array;
  if (src.format === SDL_PIXELFORMAT_INDEX8) {
    // Blit1to4Key: the palette's colours, the colour key left out (blend mode none: alpha unused)
    const sp = src.pixels as Uint8Array;
    const map = src.palette!.map((c) => SDL_MapSurfaceRGB(dst, c.r, c.g, c.b));
    const key = src.colorKey;
    for (let y = 0; y < h; y++) {
      let si = (rs.y + y) * src.w + rs.x, di = (t.y + y) * dst.w + t.x;
      for (let x = 0; x < w; x++, si++, di++) {
        const v = sp[si];
        if (v !== key) d[di] = map[v] ?? 0;
      }
    }
  } else {
    const sp = src.pixels as Uint32Array;
    for (let y = 0; y < h; y++) d.set(sp.subarray((rs.y + y) * src.w + rs.x, (rs.y + y) * src.w + rs.x + w), (t.y + y) * dst.w + t.x);
  }
  if (dst.isWindow) platform?.present(t);
  return true;
}

export function SDL_GetSurfaceClipRect(s: SDL_Surface): SDL_Rect {
  return s.clip;
}

export function SDL_SetSurfaceColorKey(s: SDL_Surface, enabled: boolean, key: number): boolean {
  s.colorKey = enabled ? key : null;
  return true;
}

// ---------------------------------------------------------------- the window
export function SDL_CreateWindow(): void {
  rec?.('WIN');
}

export function SDL_GetWindowSurface(): SDL_Surface {
  if (!window) {
    window = SDL_CreateSurface(640, 480, SDL_PIXELFORMAT_XRGB8888);
    window.isWindow = true;
  }
  return window;
}

export function windowSurface(): SDL_Surface | null {
  return window;
}

export function SDL_UpdateWindowSurfaceRects(): boolean {
  return true;
}

export function SDL_ToggleFullscreen(): void {
  platform?.toggleFullscreen?.();
}

// ---------------------------------------------------------------- events and time
export async function SDL_WaitEvent(): Promise<SDL_Event> {
  platform!.frame?.('W');
  return platform!.wait();
}

export function SDL_PollEvent(): SDL_Event | null {
  return platform!.poll();
}

export async function SDL_Delay(ms: number): Promise<void> {
  platform!.frame?.(`D${ms}`);
  await platform!.delay(ms);
}

export function SDL_PumpEvents(): void {
  // events stay queued until the game reads them
}

export function SDL_StartTextInput(): void {
  platform?.textInput?.(true);
}

export function SDL_StopTextInput(): void {
  platform?.textInput?.(false);
}
