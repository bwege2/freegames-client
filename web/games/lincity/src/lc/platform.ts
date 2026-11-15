// What the program sees of the machine it runs on: the clock, the X server's events and pointer, the
// window's palette and cursor, and the files (fileutil.c's paths). The page (worker.ts) and the tests
// (test/harness.ts) each provide one.

export const KeyPress = 2;
export const ButtonPress = 4;
export const ButtonRelease = 5;
export const MotionNotify = 6;
export const Expose = 12;
export const MapNotify = 19;
export const ConfigureNotify = 22;

export const ShiftMask = 1;
export const ControlMask = 4;
export const Button2Mask = 1 << 9;

/** an XEvent, with what HandleEvent() reads of it */
export interface XEv {
  type: number;
  /** KeyPress: the KeySym and the character XLookupString gives (0 for none) */
  keysym?: number;
  ch?: number;
  /** key and button events: ShiftMask | ControlMask | Button2Mask */
  state?: number;
  /** ButtonPress/Release: 1..5 */
  button?: number;
  /** Expose */
  x?: number; y?: number;
  /** Expose, ConfigureNotify */
  width?: number; height?: number;
}

export interface Platform {
  /** gettimeofday(), in microseconds */
  nowUs(): number;
  /** time(0) */
  time(): number;
  /** select() with a timeout: sleeps */
  sleepUs(us: number): void;
  /** XPending() */
  pending(): boolean;
  /** XNextEvent(): waits for the next event */
  nextEvent(): XEv;
  /** XQueryPointer(): the pointer in window coordinates */
  pointer(): [number, number];
  /** the window's colours: 256 * 3 values of 0..63 (do_setcustompalette) */
  setPalette(pal: Uint8Array): void;
  /** XMapWindow(): the window appears (the X server answers with MapNotify) */
  mapWindow(): void;
  /** XDefineCursor: the pirate cursor (bulldozer) or the default one */
  setCursor(pirate: boolean): void;
  /** the window was drawn to (a hint for the page to show it) */
  dirty(): void;
  /** a file in the save directory was written or removed (for the account's storage) */
  fileChanged(path: string, data: Uint8Array | null): void;
}

let current: Platform | null = null;
export function setPlatform(p: Platform): void { current = p; }
export function platform(): Platform {
  if (!current) throw new Error('no platform');
  return current;
}
