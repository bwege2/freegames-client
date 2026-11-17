// No Gravity port (GPL-3.0-or-later; translated in 2026 by the freegames project from realtech VR's
// No Gravity 2.0, GPL-2.0-or-later; LICENSE.md): the system layer the game runs on (rlx32): the files
// of the data archive, the clock and the frame timer (linux/systime.c), the C library's rand()
// (glibc, the Linux build), the keyboard and the mouse (linux/syskeyb.c, sysmouse) and the frame flip.

/** normalise a DOS path of the game (".\\menu\\lit_mn02.png") to the archive's lower-case names */
export function normPath(p: string): string {
  let n = p.replace(/\\/g, '/').toLowerCase();
  while (n.startsWith('./')) n = n.slice(2);
  n = n.replace(/\/+/g, '/').replace(/^\//, '');
  return n;
}

/** the archive (FIO_res): files loaded so far, by normalised name */
export const files = new Map<string, Uint8Array>();
export function fileExists(path: string): boolean { return files.has(normPath(path)); }
export function fileGet(path: string): Uint8Array {
  const f = files.get(normPath(path));
  if (!f) throw new Error(`file not found: ${path}`);
  return f;
}
export function fileText(path: string): string {
  const b = fileGet(path);
  let s = '';
  for (let i = 0; i < b.length; i++) s += String.fromCharCode(b[i]);
  return s;
}

// ---------------------------------------------------------------- rand (glibc random_r TYPE_3)
class GlibcRand {
  private readonly state = new Int32Array(31);
  private front = 3;
  private rear = 0;
  constructor(seed: number) { this.seed(seed); }
  seed(seed: number): void {
    let word = (seed >>> 0 === 0 ? 1 : seed) | 0;
    this.state[0] = word;
    for (let k = 1; k < 31; k++) {
      const hi = Math.trunc(word / 127773), lo = word % 127773;
      word = 16807 * lo - 2836 * hi;
      if (word < 0) word += 2147483647;
      this.state[k] = word;
    }
    this.front = 3; this.rear = 0;
    for (let k = 0; k < 310; k++) this.next();
  }
  next(): number {
    const s = this.state;
    s[this.front] = s[this.front] + s[this.rear];
    const result = s[this.front] >>> 1;
    if (++this.front >= 31) { this.front = 0; ++this.rear; } else if (++this.rear >= 31) this.rear = 0;
    return result;
  }
}
/** the game never calls srand(): glibc's default seed is 1 */
const libc = new GlibcRand(1);
export const RAND_MAX = 2147483647;
export function srand(seed: number): void { libc.seed(seed); }
export const rand = (): number => libc.next();
/** sysRand(a) = rand() % a */
export const sysRand = (a: number): number => rand() % a;
/** randomf(i_max) = i_max * (float)rand() / (float)RAND_MAX */
export const randomf = (iMax: number): number => Math.fround(Math.fround(iMax) * Math.fround(Math.fround(rand()) / Math.fround(RAND_MAX)));

// ---------------------------------------------------------------- clock
/** milliseconds since start (SDL_GetTicks); advanced by the frame loop */
export const clock = { ms: 0 };
export const timer_ms = (): number => Math.floor(clock.ms);
export const timer_sec = (): number => Math.floor(clock.ms / 1000);

/** SYS_TIMER and timer_Update (linux/systime.c): the frame delta, in 1/frequency seconds */
export const g_cTimer = { iFreq: 70, iMinFrame: 1, fFrameDelta: 0, fCounter: 0, iCounter: 0, tStart: 0 };
export function timer_Start(freq: number, minFrame: number): void {
  g_cTimer.iFreq = freq; g_cTimer.iMinFrame = minFrame;
  g_cTimer.tStart = timer_ms();
  timer_Update();
}
/** the minimum time a frame takes (iMinFrame / iFreq), in milliseconds */
export function minFrameMs(): number { return g_cTimer.iMinFrame ? (g_cTimer.iMinFrame * 1000) / g_cTimer.iFreq : 0; }
export function timer_Update(): void {
  const now = timer_ms();
  const passed = now - g_cTimer.tStart; // ms, as SDL_GetTicks counts
  g_cTimer.fFrameDelta = Math.fround(passed / 1000);
  g_cTimer.fCounter = Math.fround(g_cTimer.fFrameDelta * g_cTimer.iFreq);
  g_cTimer.iCounter = Math.trunc(Math.fround(g_cTimer.fCounter * 65535));
  g_cTimer.tStart = now;
}
export function timer_Reset(): void { g_cTimer.iCounter = 0; g_cTimer.fCounter = 0; }

// ---------------------------------------------------------------- keyboard and mouse
/** the scan codes of the game (sysctrl.h, PC set 1) */
export const s = {
  esc: 1, n1: 2, n2: 3, n3: 4, n4: 5, n5: 6, n6: 7, n7: 8, n8: 9, n9: 10, n0: 11, minus: 12, equals: 13, backspace: 14, tab: 15,
  q: 16, w: 17, e: 18, r: 19, t: 20, y: 21, u: 22, i: 23, o: 24, p: 25, opensquare: 26, closesquare: 27, return: 28, ctrl: 29,
  a: 30, s: 31, d: 32, f: 33, g: 34, h: 35, j: 36, k: 37, l: 38, semicolon: 39, quote: 40, tilda: 41, leftshift: 42, backslash: 43,
  z: 44, x: 45, c: 46, v: 47, b: 48, n: 49, m: 50, coma: 51, period: 52, slash: 53, rightshift: 54, printscreen: 55, alt: 56,
  space: 57, capslock: 58, f1: 59, f2: 60, f3: 61, f4: 62, f5: 63, f6: 64, f7: 65, f8: 66, f9: 67, f10: 68, numlock: 69,
  scrolllock: 70, numhome: 71, numup: 72, numpageup: 73, numminus: 74, numleft: 75, num5: 76, numright: 77, numplus: 78,
  numend: 79, numdown: 80, numpagedown: 81, numinsert: 82, numdelete: 83, f11: 87, f12: 88, winleft: 91, winright: 92, winapp: 93,
  home: 199, up: 200, pageup: 201, left: 203, right: 205, end: 207, down: 208, pagedown: 209, insert: 210, delete: 211,
} as const;
/** KeyboardEvent.code -> scan code (the SDL keysym map of linux/syskeyb.c) */
export const CODE_TO_SCAN: Record<string, number> = {
  Escape: s.esc, Digit1: s.n1, Digit2: s.n2, Digit3: s.n3, Digit4: s.n4, Digit5: s.n5, Digit6: s.n6, Digit7: s.n7, Digit8: s.n8,
  Digit9: s.n9, Digit0: s.n0, Minus: s.minus, Equal: s.equals, Backspace: s.backspace, Tab: s.tab, KeyQ: s.q, KeyW: s.w, KeyE: s.e,
  KeyR: s.r, KeyT: s.t, KeyY: s.y, KeyU: s.u, KeyI: s.i, KeyO: s.o, KeyP: s.p, BracketLeft: s.opensquare, BracketRight: s.closesquare,
  Enter: s.return, ControlLeft: s.ctrl, ControlRight: s.ctrl, KeyA: s.a, KeyS: s.s, KeyD: s.d, KeyF: s.f, KeyG: s.g, KeyH: s.h,
  KeyJ: s.j, KeyK: s.k, KeyL: s.l, Semicolon: s.semicolon, Quote: s.quote, Backquote: s.tilda, ShiftLeft: s.leftshift,
  KeyZ: s.z, KeyX: s.x, KeyC: s.c, KeyV: s.v, KeyB: s.b, KeyN: s.n, KeyM: s.m, Comma: s.coma, Period: s.period,
  Slash: s.slash, ShiftRight: s.rightshift, PrintScreen: s.printscreen, AltLeft: s.alt, AltRight: s.alt, Space: s.space,
  CapsLock: s.capslock, F1: s.f1, F2: s.f2, F3: s.f3, F4: s.f4, F5: s.f5, F6: s.f6, F7: s.f7, F8: s.f8, F9: s.f9, F10: s.f10,
  NumLock: s.numlock, ScrollLock: s.scrolllock, Numpad7: s.numhome, Numpad8: s.numup, Numpad9: s.numpageup,
  NumpadSubtract: s.numminus, Numpad4: s.numleft, Numpad5: s.num5, Numpad6: s.numright, NumpadAdd: s.numplus, Numpad1: s.numend,
  Numpad2: s.numdown, Numpad3: s.numpagedown, Numpad0: s.numinsert, NumpadDecimal: s.numdelete, NumpadEnter: s.return,
  F11: s.f11, F12: s.f12, MetaLeft: s.winleft, MetaRight: s.winright, ContextMenu: s.winapp, Home: s.home, ArrowUp: s.up,
  PageUp: s.pageup, ArrowLeft: s.left, ArrowRight: s.right, End: s.end, ArrowDown: s.down, PageDown: s.pagedown,
  Insert: s.insert, Delete: s.delete, NumpadDivide: s.slash, NumpadMultiply: s.printscreen,
};
/** KeyboardNameScanCode */
export const SCAN_NAMES: string[] = (() => {
  const a = [
    '', 'ESCAPE', '1', '2', '3', '4', '5', '6', '7', '8', '9', '0', '-', '=', 'BACKSPACE', 'TAB',
    'Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P', '[', ']', 'RETURN', 'CTRL', 'A', 'S',
    'D', 'F', 'G', 'H', 'J', 'K', 'L', ';', "'", '~', 'LEFT SHIFT', '\\', 'Z', 'X', 'C', 'V',
    'B', 'N', 'M', ',', '.', '/', 'RIGHT SHIFT', 'PRINT SCREEN', 'ALT', 'SPACE', 'CAPS LOCK', 'F1', 'F2', 'F3', 'F4', 'F5',
    'F6', 'F7', 'F8', 'F9', 'F10', 'NUM LOCK', 'SCROLL LOCK', 'KEYPAD 7', 'KEYPAD 8', 'KEYPAD 9', 'KEYPAD -', 'KEYPAD 4', 'KEYPAD 5', 'KEYPAD 6', 'KEYPAD +', 'KEYPAD 1',
    'KEYPAD 2', 'KEYPAD 3', 'KEYPAD 0', 'KEYPAD .', '', '', '', 'F11', 'F12', '', '', 'LEFT WINDOWS', 'RIGHT WINDOWS', 'MENU', '', '',
  ];
  const n = new Array<string>(256).fill('');
  a.forEach((v, i) => { n[i] = v; });
  n[199] = 'HOME'; n[200] = 'UP'; n[201] = 'PAGE UP'; n[203] = 'LEFT'; n[205] = 'RIGHT'; n[207] = 'END';
  n[208] = 'DOWN'; n[209] = 'PAGE DOWN'; n[210] = 'INSERT'; n[211] = 'DELETE';
  return n;
})();

/** sKEY: rgbButtons is the state after the last Update, steButtons the one before */
export const sKEY = {
  rgbButtons: new Uint8Array(256),
  steButtons: new Uint8Array(256),
  scanCode: 0,
  charCode: 0,
  /** what the events since the last Update set */
  live: new Uint8Array(256),
  events: [] as { down: boolean; scan: number; char: number }[],
  Update(): void {
    this.steButtons.set(this.rgbButtons);
    // a key pressed and released between two updates still counts as pressed for one update (a quick tap
    // would otherwise be lost; with SDL's polling at the original's frame rate it is held at least one poll)
    const later: typeof this.events = [];
    const down = new Set<number>();
    for (const e of this.events) {
      if (e.down) { this.live[e.scan] = 1; this.scanCode = e.scan; if (e.char) this.charCode = e.char; down.add(e.scan); }
      else if (down.has(e.scan)) later.push(e);
      else { this.live[e.scan] = 0; this.scanCode = 0; this.charCode = 0; }
    }
    this.events = later;
    this.rgbButtons.set(this.live);
  },
};
export const sKEY_IsHeld = (k: number): boolean => !!sKEY.rgbButtons[k];
export const sKEY_IsClicked = (k: number): boolean => !!sKEY.rgbButtons[k] && !sKEY.steButtons[k];

/** sMOU: the position on the 640x480 screen, the motion since the last Update, wheel and buttons */
export const sMOU = {
  x: 320, y: 240, lX: 0, lY: 0, lZ: 0, numControllers: 1, numButtons: 3,
  rgbButtons: new Uint8Array(8), steButtons: new Uint8Array(8),
  live: { x: 320, y: 240, dx: 0, dy: 0, dz: 0, buttons: new Uint8Array(8), pressed: new Uint8Array(8) },
  Update(): void {
    this.steButtons.set(this.rgbButtons);
    for (let b = 0; b < 8; b++) this.rgbButtons[b] = this.live.buttons[b] | this.live.pressed[b];
    this.live.pressed.fill(0);
    this.x = Math.max(0, Math.min(639, Math.trunc(this.live.x)));
    this.y = Math.max(0, Math.min(479, Math.trunc(this.live.y)));
    this.lX = this.live.dx; this.lY = this.live.dy; this.lZ = this.live.dz;
    this.live.dx = this.live.dy = this.live.dz = 0;
  },
  SetPosition(x: number, y: number): void { this.live.x = x; this.live.y = y; this.x = x; this.y = y; },
};
export const sMOU_IsHeld = (b: number): boolean => !!sMOU.rgbButtons[b];
export const sMOU_IsClicked = (b: number): boolean => !!sMOU.rgbButtons[b] && !sMOU.steButtons[b];
export const sMOU_IsReleased = (b: number): boolean => !sMOU.rgbButtons[b] && !!sMOU.steButtons[b];

// ---------------------------------------------------------------- the frame
/** the host: shows the frame drawn so far and waits for the next (GX.View.Flip) */
export const host = {
  flip: async (): Promise<void> => {},
  /** STUB_TaskControl: the game should end (the player left) */
  quit: false,
};
export class GameAbort extends Error {}
/** GX.View.Flip as NG_InstallHandlers makes it (TaskFlip): show the frame, then timer_Update */
export async function Flip(): Promise<void> {
  await host.flip();
  if (host.quit) throw new GameAbort('stopped');
  timer_Update();
}
export const STUB_TaskControl = (): boolean => host.quit;
/** a busy wait of the original (no flip): lets the browser run; the screen keeps its last frame */
export async function idle(): Promise<void> {
  await host.flip();
  if (host.quit) throw new GameAbort('stopped');
}
