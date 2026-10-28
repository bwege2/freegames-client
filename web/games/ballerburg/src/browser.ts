// What SDL does for Ballerburg on a desktop, in the browser: the window is the SDK's PixelScreen (640x480),
// the mouse and the keys become SDL events, SDL_Delay is a timer, and the window surface is copied to the
// canvas once per animation frame where it changed. interrupt() makes every wait and delay throw, so a
// running program unwinds (stop, or switching between the local and the online game).
import type { PixelScreen } from '../../../src/sdk/index.ts';
import {
  makeEvent, windowSurface, type Platform, type SDL_Event, type SDL_Rect,
  SDL_EVENT_MOUSE_MOTION, SDL_EVENT_MOUSE_BUTTON_DOWN, SDL_EVENT_MOUSE_BUTTON_UP, SDL_EVENT_KEY_DOWN, SDL_EVENT_KEY_UP,
  SDL_EVENT_TEXT_INPUT, SDL_EVENT_USER, SDL_BUTTON_LEFT, SDL_BUTTON_RIGHT,
  SDLK_RETURN, SDLK_ESCAPE, SDLK_BACKSPACE, SDLK_DELETE, SDLK_LEFT, SDLK_RIGHT, SDLK_KP_ENTER,
} from './sdl.ts';

const KEYS: Record<string, number> = {
  Escape: SDLK_ESCAPE, Enter: SDLK_RETURN, Backspace: SDLK_BACKSPACE, Delete: SDLK_DELETE, ArrowLeft: SDLK_LEFT,
  ArrowRight: SDLK_RIGHT, Tab: 0x09,
};

/** an SDL keycode for a browser key (printable keys: their lower-case character, as SDL 3) */
export function sdlKey(e: KeyboardEvent): number {
  if (e.code === 'NumpadEnter') return SDLK_KP_ENTER;
  if (KEYS[e.key] !== undefined) return KEYS[e.key];
  if (e.key.length === 1) return e.key.toLowerCase().charCodeAt(0);
  return 0;
}

export class Interrupt extends Error {}

export class BrowserPlatform implements Platform {
  private readonly queue: SDL_Event[] = [];
  private waiter: ((e: SDL_Event | null) => void) | null = null;
  private readonly timers = new Set<{ id: ReturnType<typeof setTimeout>; reject: (e: Error) => void }>();
  private interrupted: Error | null = null;
  private dirty: SDL_Rect | null = null;
  private text = false;
  private lastX = -1;
  private lastY = -1;
  private readonly image: ImageData;
  /** an online replay: no waiting, no drawing until it is over */
  fast = false;
  /** false while the lobby is open over the game: its mouse and keys are not the game's */
  input = true;
  private readonly screen: PixelScreen;
  private readonly host: HTMLElement;

  constructor(host: HTMLElement, screen: PixelScreen, signal: AbortSignal) {
    this.host = host;
    this.screen = screen;
    this.image = screen.ctx.createImageData(640, 480);
    const canvas = screen.canvas;
    canvas.style.touchAction = 'none';
    const at = (e: PointerEvent) => {
      const r = canvas.getBoundingClientRect();
      const x = Math.floor((e.clientX - r.left) / r.width * 640), y = Math.floor((e.clientY - r.top) / r.height * 480);
      return { x: Math.max(0, Math.min(639, x)), y: Math.max(0, Math.min(479, y)), inside: x >= 0 && y >= 0 && x < 640 && y < 480 };
    };
    const motion = (x: number, y: number) => {
      if (x === this.lastX && y === this.lastY) return;
      this.lastX = x;
      this.lastY = y;
      this.push(makeEvent(SDL_EVENT_MOUSE_MOTION, { x, y }));
    };
    const button = (b: number) => (b === 0 ? SDL_BUTTON_LEFT : b === 2 ? SDL_BUTTON_RIGHT : 2);
    canvas.addEventListener('pointermove', (e) => {
      const p = at(e);
      if (p.inside || canvas.hasPointerCapture(e.pointerId)) motion(p.x, p.y);
    }, { signal });
    canvas.addEventListener('pointerdown', (e) => {
      e.preventDefault();
      host.focus({ preventScroll: true });
      canvas.setPointerCapture(e.pointerId);
      const p = at(e);
      motion(p.x, p.y);
      this.push(makeEvent(SDL_EVENT_MOUSE_BUTTON_DOWN, { x: p.x, y: p.y, button: button(e.button) }));
    }, { signal });
    canvas.addEventListener('pointerup', (e) => {
      const p = at(e);
      motion(p.x, p.y);
      this.push(makeEvent(SDL_EVENT_MOUSE_BUTTON_UP, { x: p.x, y: p.y, button: button(e.button) }));
    }, { signal });
    canvas.addEventListener('contextmenu', (e) => e.preventDefault(), { signal });
    const ours = (e: KeyboardEvent) => this.input && !(e.target instanceof Element && e.target.closest('input, textarea, select, button'));
    window.addEventListener('keydown', (e) => {
      if (!ours(e) || e.ctrlKey || e.metaKey || e.altKey || /^F([0-9]|1[0-2])$/.test(e.key)) return; // the browser's own
      const k = sdlKey(e);
      if (!k) return;
      e.preventDefault();
      this.push(makeEvent(SDL_EVENT_KEY_DOWN, { key: k }));
      if (this.text && e.key.length === 1 && e.key.charCodeAt(0) < 256) this.push(makeEvent(SDL_EVENT_TEXT_INPUT, { text: e.key.charCodeAt(0) }));
    }, { signal });
    window.addEventListener('keyup', (e) => {
      const k = sdlKey(e);
      if (!ours(e) || !k || e.ctrlKey || e.metaKey || e.altKey) return;
      e.preventDefault();
      this.push(makeEvent(SDL_EVENT_KEY_UP, { key: k }));
    }, { signal });
    signal.addEventListener('abort', () => this.interrupt(new Interrupt('stopped')), { once: true });
  }

  push(e: SDL_Event): void {
    if (!this.input && e.type !== SDL_EVENT_USER) return;
    if (this.waiter) {
      const w = this.waiter;
      this.waiter = null;
      w(e);
    } else {
      this.queue.push(e);
    }
  }

  /** wakes up a waiting event loop (an online move arrived) */
  wake(): void {
    this.push(makeEvent(SDL_EVENT_USER));
  }

  /** every wait and delay throws `why` until resume() */
  interrupt(why: Error): void {
    this.interrupted = why;
    if (this.waiter) {
      const w = this.waiter;
      this.waiter = null;
      w(null);
    }
    for (const t of this.timers) {
      clearTimeout(t.id);
      t.reject(why);
    }
    this.timers.clear();
  }

  resume(): void {
    this.interrupted = null;
    this.queue.length = 0;
  }

  wait(): Promise<SDL_Event> {
    if (this.interrupted) return Promise.reject(this.interrupted);
    const e = this.queue.shift();
    if (e) return Promise.resolve(e);
    return new Promise((resolve, reject) => {
      this.waiter = (ev) => (ev ? resolve(ev) : reject(this.interrupted));
    });
  }

  poll(): SDL_Event | null {
    if (this.interrupted) throw this.interrupted;
    return this.queue.shift() ?? null;
  }

  delay(ms: number): Promise<void> {
    if (this.interrupted) return Promise.reject(this.interrupted);
    if (this.fast) return Promise.resolve();
    return new Promise((resolve, reject) => {
      const t = { id: setTimeout(() => { this.timers.delete(t); resolve(); }, ms), reject };
      this.timers.add(t);
    });
  }

  present(r: SDL_Rect): void {
    const d = this.dirty;
    if (!d) {
      this.dirty = { ...r };
      return;
    }
    const x = Math.min(d.x, r.x), y = Math.min(d.y, r.y);
    d.w = Math.max(d.x + d.w, r.x + r.w) - x;
    d.h = Math.max(d.y + d.h, r.y + r.h) - y;
    d.x = x;
    d.y = y;
  }

  /** the window surface's changed part onto the canvas (once per animation frame) */
  flush(): void {
    const d = this.dirty, w = windowSurface();
    if (!d || !w || this.fast) return;
    this.dirty = null;
    const src = w.pixels as Uint32Array;
    const dst = new Uint32Array(this.image.data.buffer);
    for (let y = d.y; y < d.y + d.h; y++) {
      for (let i = y * 640 + d.x, e = i + d.w; i < e; i++) {
        const c = src[i];
        dst[i] = 0xff000000 | (c & 0xff) << 16 | (c & 0xff00) | (c >>> 16 & 0xff);
      }
    }
    this.screen.ctx.putImageData(this.image, 0, 0, d.x, d.y, d.w, d.h);
  }

  /** after a replay: everything again */
  redraw(): void {
    this.dirty = { x: 0, y: 0, w: 640, h: 480 };
  }

  textInput(on: boolean): void {
    this.text = on;
  }

  toggleFullscreen(): void {
    if (document.fullscreenElement) void document.exitFullscreen().catch(() => {});
    else void this.host.requestFullscreen?.().catch(() => {});
  }
}
