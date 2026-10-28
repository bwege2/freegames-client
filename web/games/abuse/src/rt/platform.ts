// What the program takes from the system: the clock, waiting, SDL's input and the window. The browser
// (rt/browser.ts) and the tests (test/harness.ts, the same rules as the oracle's hook.cpp) provide it.

/** an SDL 1.2 event as sdlport/event.cpp reads it */
export interface SDLEvent {
  type: number;
  /** SDLK_* (SDL 1.2) for key events */
  sym?: number;
  /** KMOD_* at the time of the key event */
  mod?: number;
  /** 1..5 for button events */
  button?: number;
  x?: number;
  y?: number;
}

export const SDL_KEYDOWN = 2, SDL_KEYUP = 3, SDL_MOUSEMOTION = 4, SDL_MOUSEBUTTONDOWN = 5, SDL_MOUSEBUTTONUP = 6,
  SDL_QUIT = 12;
export const KMOD_LSHIFT = 0x0001, KMOD_RSHIFT = 0x0002, KMOD_LCTRL = 0x0040, KMOD_RCTRL = 0x0080,
  KMOD_LALT = 0x0100, KMOD_RALT = 0x0200;
export const KMOD_SHIFT = KMOD_LSHIFT | KMOD_RSHIFT, KMOD_CTRL = KMOD_LCTRL | KMOD_RCTRL, KMOD_ALT = KMOD_LALT | KMOD_RALT;

export interface Platform {
  /** gettimeofday: whole seconds and microseconds */
  gettimeofday(): [number, number];
  /** time(NULL) */
  time(): number;
  /** usleep / SDL_Delay */
  usleep(us: number): Promise<void>;
  /** SDL_PollEvent(&ev): the next event, or null */
  pollEvent(): SDLEvent | null;
  /** SDL_PollEvent(NULL) */
  hasEvent(): boolean;
  /** SDL_GetMouseState: x, y (window pixels), button mask (SDL_BUTTON(1) = 1, (2) = 2, (3) = 4) */
  mouseState(): [number, number, number];
  /** SDL_GetModState */
  modState(): number;
  /** SDL_WarpMouse */
  warpMouse(x: number, y: number): void;
  /** the end of a frame: the window's 8-bit pixels and the palette (update_window_done). `counted` is
   *  false for palette::load's own call, which the oracle's frame counter does not see (it is in the
   *  same file as update_window_done, so ld --wrap does not reach it) */
  present(pixels: Uint8Array, palette: Uint8Array, counted: boolean): void;
}

let plat: Platform | null = null;
export function setPlatform(p: Platform): void { plat = p; }
export function platform(): Platform { return plat!; }

const f32 = Math.fround;

/** lol::Timer: milliseconds as a float, as the original computes them */
export class Timer {
  private sec: number;
  private usec: number;

  constructor() {
    [this.sec, this.usec] = plat!.gettimeofday();
  }

  private elapsed(update: boolean): number {
    const [s, u] = plat!.gettimeofday();
    const ret = f32(f32(f32(1e-3) * f32(u - this.usec)) + f32(f32(1e3) * f32(s - this.sec)));
    if (update) {
      this.sec = s;
      this.usec = u;
    }
    return ret;
  }

  GetMs(): number { return this.elapsed(true); }
  PollMs(): number { return this.elapsed(false); }

  async WaitMs(deltams: number): Promise<void> {
    const ret = this.elapsed(false);
    const towait = f32(f32(deltams) - ret);
    if (towait > 0) await plat!.usleep(Math.trunc(f32(towait * f32(1e3))));
  }
}

/** sdlport/timing.cpp time_marker */
export class time_marker {
  seconds = 0;
  micro_seconds = 0;
  constructor() { this.get_time(); }
  get_time(): void { [this.seconds, this.micro_seconds] = plat!.gettimeofday(); }
  diff_time(other: time_marker): number {
    return (this.seconds - other.seconds) + (this.micro_seconds - other.micro_seconds) / 1000000;
  }
}
