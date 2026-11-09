// The SDL2 names the game uses (PORTING-STAGE2.md, section 5). Created by package U1 with the keycodes the dialogs
// and the HUD need; package U3 added the event queue (SDL_PollEvent), SDL_GetTicks, SDL_GetKeyboardState,
// SDL_GetMouseState, the window size and the mapping of browser events to SDL2 events.
// Keycodes are SDL2's (SDL_keycode.h: printable keys are their character, the others scancode | 1 << 30).
// The PSEUDOKEY_* are HyperRogue's (sysconfig.h).
//
// The mapping functions (sdl_key_of_dom, sdl_wheel_steps, ...) have no DOM: the tests feed them plain objects.
// sdl_attach binds them to the canvas; events are only queued there and handled where mainloopiter polls them
// (SDL_PollEvent), never inside the DOM callback, as SDL does.
import { G } from './globals.ts';
import { ticks_source, SDL_GetTicks } from './util.ts';

export { SDL_GetTicks };

const SC = (scancode: number): number => scancode | 0x40000000;

export const SDLK_BACKSPACE = 8, SDLK_TAB = 9, SDLK_RETURN = 13, SDLK_ESCAPE = 27, SDLK_SPACE = 32, SDLK_DELETE = 127;
export const SDLK_CAPSLOCK = SC(57);
export const SDLK_F1 = SC(58), SDLK_F2 = SC(59), SDLK_F3 = SC(60), SDLK_F4 = SC(61), SDLK_F5 = SC(62), SDLK_F6 = SC(63),
  SDLK_F7 = SC(64), SDLK_F8 = SC(65), SDLK_F9 = SC(66), SDLK_F10 = SC(67), SDLK_F11 = SC(68), SDLK_F12 = SC(69);
export const SDLK_PRINTSCREEN = SC(70), SDLK_SCROLLLOCK = SC(71), SDLK_PAUSE = SC(72);
export const SDLK_INSERT = SC(73), SDLK_HOME = SC(74), SDLK_PAGEUP = SC(75), SDLK_END = SC(77), SDLK_PAGEDOWN = SC(78),
  SDLK_RIGHT = SC(79), SDLK_LEFT = SC(80), SDLK_DOWN = SC(81), SDLK_UP = SC(82);
export const SDLK_NUMLOCKCLEAR = SC(83), SDLK_KP_DIVIDE = SC(84), SDLK_KP_MULTIPLY = SC(85), SDLK_KP_MINUS = SC(86),
  SDLK_KP_PLUS = SC(87);
export const SDLK_KP_ENTER = SC(88), SDLK_KP_1 = SC(89), SDLK_KP_2 = SC(90), SDLK_KP_3 = SC(91), SDLK_KP_4 = SC(92),
  SDLK_KP_5 = SC(93), SDLK_KP_6 = SC(94), SDLK_KP_7 = SC(95), SDLK_KP_8 = SC(96), SDLK_KP_9 = SC(97), SDLK_KP_0 = SC(98),
  SDLK_KP_PERIOD = SC(99);
export const SDLK_APPLICATION = SC(101), SDLK_KP_EQUALS = SC(103);
export const SDLK_LCTRL = SC(224), SDLK_LSHIFT = SC(225), SDLK_LALT = SC(226), SDLK_LGUI = SC(227), SDLK_RCTRL = SC(228),
  SDLK_RSHIFT = SC(229), SDLK_RALT = SC(230), SDLK_RGUI = SC(231);
/** sysconfig.h (SDL2): #define SDLK_KP1 SDLK_KP_1 ... */
export const SDLK_KP0 = SDLK_KP_0, SDLK_KP1 = SDLK_KP_1, SDLK_KP2 = SDLK_KP_2, SDLK_KP3 = SDLK_KP_3, SDLK_KP4 = SDLK_KP_4,
  SDLK_KP5 = SDLK_KP_5, SDLK_KP6 = SDLK_KP_6, SDLK_KP7 = SDLK_KP_7, SDLK_KP8 = SDLK_KP_8, SDLK_KP9 = SDLK_KP_9;

/** sysconfig.h */
export const PSEUDOKEY_WHEELDOWN = 2501, PSEUDOKEY_WHEELUP = 2502, PSEUDOKEY_RELEASE = 2503, PSEUDOKEY_EXIT = 2504,
  PSEUDOKEY_MENU = 2505, PSEUDOKEY_NOHINT = 2506, PSEUDOKEY_LIST_SLIDER = 2507, PSEUDOKEY_SELECT = 2508,
  PSEUDOKEY_ONSCREEN_KEYBOARD = 2509, PSEUDOKEY_TOUCH = 2510, PSEUDOKEY_JOY = 4096;
/** #define JOY_ID 128 */
export const JOY_ID = 128;

// --- scancodes (SDL_scancode.h) ---
export const SDL_SCANCODE_A = 4, SDL_SCANCODE_RIGHT = 79, SDL_SCANCODE_LEFT = 80, SDL_SCANCODE_DOWN = 81,
  SDL_SCANCODE_UP = 82, SDL_SCANCODE_HOME = 74, SDL_SCANCODE_PAGEUP = 75, SDL_SCANCODE_END = 77,
  SDL_SCANCODE_PAGEDOWN = 78, SDL_SCANCODE_LCTRL = 224, SDL_SCANCODE_LSHIFT = 225, SDL_SCANCODE_LALT = 226,
  SDL_SCANCODE_LGUI = 227, SDL_SCANCODE_RCTRL = 228, SDL_SCANCODE_RSHIFT = 229, SDL_SCANCODE_RALT = 230,
  SDL_SCANCODE_RGUI = 231;
export const SDL_NUM_SCANCODES = 512;

// --- key modifiers (SDL_keycode.h, SDL2 values; sysconfig.h names them SDL_KMOD_*) ---
export const SDL_KMOD_LSHIFT = 0x0001, SDL_KMOD_RSHIFT = 0x0002, SDL_KMOD_LCTRL = 0x0040, SDL_KMOD_RCTRL = 0x0080,
  SDL_KMOD_LALT = 0x0100, SDL_KMOD_RALT = 0x0200, SDL_KMOD_LGUI = 0x0400, SDL_KMOD_RGUI = 0x0800,
  SDL_KMOD_NUM = 0x1000, SDL_KMOD_CAPS = 0x2000;

// --- event types (SDL_events.h, SDL2 values; sysconfig.h names them SDL_EVENT_*) ---
export const SDL_EVENT_QUIT = 0x100, SDL_WINDOWEVENT = 0x200, SDL_EVENT_KEY_DOWN = 0x300, SDL_EVENT_KEY_UP = 0x301,
  SDL_EVENT_TEXT_INPUT = 0x303, SDL_EVENT_MOUSE_MOTION = 0x400, SDL_EVENT_MOUSE_BUTTON_DOWN = 0x401,
  SDL_EVENT_MOUSE_BUTTON_UP = 0x402, SDL_EVENT_MOUSE_WHEEL = 0x403;
/** SDL_WindowEventID */
export const SDL_WINDOWEVENT_SHOWN = 1, SDL_WINDOWEVENT_EXPOSED = 3, SDL_WINDOWEVENT_RESIZED = 5,
  SDL_WINDOWEVENT_ENTER = 10, SDL_WINDOWEVENT_LEAVE = 11, SDL_WINDOWEVENT_FOCUS_GAINED = 12,
  SDL_WINDOWEVENT_FOCUS_LOST = 13;
/** mouse buttons */
export const SDL_BUTTON_LEFT = 1, SDL_BUTTON_MIDDLE = 2, SDL_BUTTON_RIGHT = 3;
export const SDL_BUTTON = (x: number): number => 1 << (x - 1);
export const SDL_BUTTON_LMASK = SDL_BUTTON(1), SDL_BUTTON_MMASK = SDL_BUTTON(2), SDL_BUTTON_RMASK = SDL_BUTTON(3);

/** SDL_Event: the fields HyperRogue reads, of the union members it reads (key, text, button, motion, wheel,
 *  window) */
export class SDL_Event {
  type = 0;
  /** ev.key.keysym: sym, mod, scancode */
  key = { keysym: { sym: 0, mod: 0, scancode: 0 } };
  /** ev.text.text */
  text = { text: '' };
  /** ev.button: button, x, y */
  button = { button: 0, x: 0, y: 0 };
  /** ev.motion: x, y, xrel, yrel */
  motion = { x: 0, y: 0, xrel: 0, yrel: 0 };
  /** ev.wheel: y (clicks, positive away from the user), mouseX, mouseY (SDL >= 2.26) */
  wheel = { x: 0, y: 0, mouseX: 0, mouseY: 0 };
  /** ev.window: event, data1, data2 */
  window = { event: 0, data1: 0, data2: 0 };
}

/** the queue SDL_PollEvent drains */
const queue: SDL_Event[] = [];

export function sdl_push_event(ev: SDL_Event): void { queue.push(ev); }

/** int SDL_PollEvent(SDL_Event *event): the next queued event, or null */
export function SDL_PollEvent(): SDL_Event | null { return queue.shift() ?? null; }

/** the queue's length (tests) */
export function sdl_queued(): number { return queue.length; }
export function sdl_clear_queue(): void { queue.length = 0; }

/** const Uint8 *SDL_GetKeyboardState(int *numkeys): indexed by scancode, 1 = held */
const keystate = new Uint8Array(SDL_NUM_SCANCODES);
export function SDL_GetKeyboardState(): Uint8Array { return keystate; }

/** the mouse buttons held (SDL_BUTTON masks) and the pointer position */
const mouse = { buttons: 0, x: 0, y: 0 };
/** Uint32 SDL_GetMouseState(int *x, int *y): the buttons mask */
export function SDL_GetMouseState(): number { return mouse.buttons; }

/** the window = the canvas, in device pixels (SDL_GetWindowSize / SDL_GetCurrentRenderOutputSize) */
export const sdl_window = { w: 0, h: 0 };

/** whether the text input of SDL2 is on (SDL_StartTextInput is the default on the desktop) */
export const sdl_text_input = { on: true };

/** SDL_GetTicks() in the browser: whole milliseconds since the start (performance.now()) */
export function sdl_use_real_ticks(now: () => number): void {
  const t0 = now();
  ticks_source.get = (): number => Math.floor(now() - t0);
}

function set_key(scancode: number, down: boolean): void {
  if (scancode <= 0 || scancode >= SDL_NUM_SCANCODES) return;
  keystate[scancode] = down ? 1 : 0;
  G.sdl_shift_held = !!(keystate[SDL_SCANCODE_LSHIFT] | keystate[SDL_SCANCODE_RSHIFT]);
}

/** all keys up (the window lost the keyboard focus: SDL resets its keyboard state) */
export function sdl_release_all_keys(): void {
  keystate.fill(0);
  G.sdl_shift_held = false;
}

// --- browser events -> SDL2 events (no DOM types: plain objects with the fields used) ---

/** KeyboardEvent.code -> SDL2 scancode (USB HID usage, as SDL_scancode.h) */
const code_scancodes: Record<string, number> = {
  Enter: 40, Escape: 41, Backspace: 42, Tab: 43, Space: 44, Minus: 45, Equal: 46, BracketLeft: 47, BracketRight: 48,
  Backslash: 49, Semicolon: 51, Quote: 52, Backquote: 53, Comma: 54, Period: 55, Slash: 56, CapsLock: 57,
  PrintScreen: 70, ScrollLock: 71, Pause: 72, Insert: 73, Home: 74, PageUp: 75, Delete: 76, End: 77, PageDown: 78,
  ArrowRight: 79, ArrowLeft: 80, ArrowDown: 81, ArrowUp: 82, NumLock: 83, NumpadDivide: 84, NumpadMultiply: 85,
  NumpadSubtract: 86, NumpadAdd: 87, NumpadEnter: 88, Numpad1: 89, Numpad2: 90, Numpad3: 91, Numpad4: 92,
  Numpad5: 93, Numpad6: 94, Numpad7: 95, Numpad8: 96, Numpad9: 97, Numpad0: 98, NumpadDecimal: 99,
  IntlBackslash: 100, ContextMenu: 101, NumpadEqual: 103, ControlLeft: 224, ShiftLeft: 225, AltLeft: 226,
  MetaLeft: 227, ControlRight: 228, ShiftRight: 229, AltRight: 230, MetaRight: 231, OSLeft: 227, OSRight: 231,
};
for (let i = 0; i < 26; i++) code_scancodes['Key' + String.fromCharCode(65 + i)] = 4 + i;
for (let i = 1; i <= 9; i++) code_scancodes['Digit' + i] = 29 + i;
code_scancodes.Digit0 = 39;
for (let i = 1; i <= 12; i++) code_scancodes['F' + i] = 57 + i;

/** the keys whose SDL2 keycode is not scancode | 1<<30 */
const ascii_keycodes: Record<number, number> = { 40: SDLK_RETURN, 41: SDLK_ESCAPE, 42: SDLK_BACKSPACE, 43: SDLK_TAB, 44: SDLK_SPACE, 76: SDLK_DELETE };

/** the unshifted character of the US layout's punctuation keys (KeyboardEvent.key is the shifted one when Shift
 *  is held; SDL2's keycode is the unshifted one) */
const us_unshifted: Record<string, string> = {
  Minus: '-', Equal: '=', BracketLeft: '[', BracketRight: ']', Backslash: '\\', Semicolon: ';', Quote: '\'',
  Backquote: '`', Comma: ',', Period: '.', Slash: '/', IntlBackslash: '<',
};

/** the parts of a KeyboardEvent the mapping reads */
export interface dom_key {
  key: string; code: string; shiftKey: boolean; ctrlKey: boolean; altKey: boolean; metaKey: boolean;
  /** getModifierState('NumLock') */
  numLock?: boolean;
  /** getModifierState('CapsLock') */
  capsLock?: boolean;
}

/** SDL2's default keymap (SDL_keyboard.c SDL_default_keymap): the keycode of each scancode whose keycode is a
 *  character (the others are scancode | 1 << 30) */
const default_keymap_chars: Record<number, number> = {
  40: SDLK_RETURN, 41: SDLK_ESCAPE, 42: SDLK_BACKSPACE, 43: SDLK_TAB, 44: SDLK_SPACE, 45: 45, 46: 61, 47: 91, 48: 93,
  49: 92, 50: 35, 51: 59, 52: 39, 53: 96, 54: 44, 55: 46, 56: 47, 76: SDLK_DELETE,
};
for (let i = 0; i < 26; i++) default_keymap_chars[4 + i] = 97 + i;
for (let i = 0; i < 9; i++) default_keymap_chars[30 + i] = 49 + i;
default_keymap_chars[39] = 48;

/** SDL_Scancode SDL_GetScancodeFromKey(SDL_Keycode key): with the default (US) keymap; 0 (SDL_SCANCODE_UNKNOWN)
 *  for keys not on it */
export function SDL_GetScancodeFromKey(key: number): number {
  for (let sc = 0; sc < SDL_NUM_SCANCODES; sc++) {
    const k = default_keymap_chars[sc] ??
      (((sc >= 57 && sc <= 99) || sc === 101 || sc === 103 || (sc >= 224 && sc <= 231)) ? SC(sc) : -1);
    if (k === key) return sc;
  }
  return 0;
}

/** SDL_GetScancodeName (SDL_keyboard.c SDL_scancode_names, the keys of a PC keyboard); "" for the others */
export function SDL_GetScancodeName(sc: number): string {
  if (sc >= 4 && sc <= 29) return String.fromCharCode(65 + sc - 4);
  if (sc >= 30 && sc <= 38) return String.fromCharCode(49 + sc - 30);
  if (sc >= 58 && sc <= 69) return 'F' + (sc - 57);
  if (sc >= 89 && sc <= 97) return 'Keypad ' + (sc - 88);
  const names: Record<number, string> = {
    39: '0', 40: 'Return', 41: 'Escape', 42: 'Backspace', 43: 'Tab', 44: 'Space', 45: '-', 46: '=', 47: '[', 48: ']',
    49: '\\', 50: '#', 51: ';', 52: '\'', 53: '`', 54: ',', 55: '.', 56: '/', 57: 'CapsLock', 70: 'PrintScreen',
    71: 'ScrollLock', 72: 'Pause', 73: 'Insert', 74: 'Home', 75: 'PageUp', 76: 'Delete', 77: 'End', 78: 'PageDown',
    79: 'Right', 80: 'Left', 81: 'Down', 82: 'Up', 83: 'Numlock', 84: 'Keypad /', 85: 'Keypad *', 86: 'Keypad -',
    87: 'Keypad +', 88: 'Keypad Enter', 98: 'Keypad 0', 99: 'Keypad .', 101: 'Application', 103: 'Keypad =',
    224: 'Left Ctrl', 225: 'Left Shift', 226: 'Left Alt', 227: 'Left GUI', 228: 'Right Ctrl', 229: 'Right Shift',
    230: 'Right Alt', 231: 'Right GUI',
  };
  return names[sc] ?? '';
}

/** the SDL2 scancode of a key (0 = unknown) */
export function sdl_scancode_of_dom(code: string): number { return code_scancodes[code] ?? 0; }

/** the SDL2 keycode of a key: printable keys are the layout's lowercase character (letters from `key`, so that
 *  AZERTY's 'a' is 'a'; the digit row and the punctuation of `code` when Shift changes `key`), the others from
 *  `code` (arrows, Home/End/PageUp/PageDown/Insert/Delete, F1..F12, Escape, Return, Backspace, Tab, Space, the
 *  numpad as SDLK_KP_*, whatever NumLock says, as SDL2 does) */
export function sdl_keycode_of_dom(k: dom_key): number {
  const sc = sdl_scancode_of_dom(k.code);
  if (sc >= 4 && sc <= 29) {
    const ch = k.key.length === 1 ? k.key.toLowerCase() : '';
    if (ch.length === 1 && ch >= 'a' && ch <= 'z') return ch.charCodeAt(0);
    if (ch.length === 1 && ch.charCodeAt(0) > 127) return ch.codePointAt(0)!; // a letter of another alphabet
    return 97 + sc - 4;
  }
  if (sc >= 30 && sc <= 39) return sc === 39 ? 48 : 49 + sc - 30;
  if (ascii_keycodes[sc] !== undefined) return ascii_keycodes[sc];
  if ((sc >= 57 && sc <= 99) || sc === 101 || sc === 103 || (sc >= 224 && sc <= 231)) return SC(sc);
  // printable keys: the punctuation
  const us = us_unshifted[k.code];
  if (us !== undefined && (k.shiftKey || [...k.key].length !== 1)) return us.charCodeAt(0);
  const chars = [...k.key];
  if (chars.length === 1) return chars[0].toLowerCase().codePointAt(0)!;
  if (us !== undefined) return us.charCodeAt(0);
  if (sc) return SC(sc);
  return 0;
}

/** the SDL2 modifier state: the sides from the keys held, NumLock and CapsLock from the event */
export function sdl_mod_of_dom(k: dom_key): number {
  let mod = 0;
  if (k.shiftKey) mod |= keystate[SDL_SCANCODE_RSHIFT] && !keystate[SDL_SCANCODE_LSHIFT] ? SDL_KMOD_RSHIFT : SDL_KMOD_LSHIFT;
  if (k.shiftKey && keystate[SDL_SCANCODE_RSHIFT] && keystate[SDL_SCANCODE_LSHIFT]) mod |= SDL_KMOD_RSHIFT;
  if (k.ctrlKey) mod |= keystate[SDL_SCANCODE_RCTRL] && !keystate[SDL_SCANCODE_LCTRL] ? SDL_KMOD_RCTRL : SDL_KMOD_LCTRL;
  if (k.altKey) mod |= keystate[SDL_SCANCODE_RALT] && !keystate[SDL_SCANCODE_LALT] ? SDL_KMOD_RALT : SDL_KMOD_LALT;
  if (k.metaKey) mod |= keystate[SDL_SCANCODE_RGUI] && !keystate[SDL_SCANCODE_LGUI] ? SDL_KMOD_RGUI : SDL_KMOD_LGUI;
  if (k.numLock) mod |= SDL_KMOD_NUM;
  if (k.capsLock) mod |= SDL_KMOD_CAPS;
  return mod;
}

/** a keydown: SDL_KEYDOWN, then SDL_TEXTINPUT with the typed character (SDL2 sends both; not with Ctrl, Alt or
 *  Meta held, as SDL2 on the desktop, except AltGr) */
export function sdl_dom_keydown(k: dom_key & { altGraph?: boolean }): void {
  const sc = sdl_scancode_of_dom(k.code);
  set_key(sc, true);
  const ev = new SDL_Event();
  ev.type = SDL_EVENT_KEY_DOWN;
  ev.key.keysym.sym = sdl_keycode_of_dom(k);
  ev.key.keysym.mod = sdl_mod_of_dom(k);
  ev.key.keysym.scancode = sc;
  sdl_push_event(ev);
  const chars = [...k.key];
  if (sdl_text_input.on && chars.length === 1 && chars[0] >= ' ' && chars[0] !== '\x7F' &&
    (k.altGraph || (!k.ctrlKey && !k.altKey && !k.metaKey)))
    sdl_text_event(k.key);
}

export function sdl_dom_keyup(k: dom_key): void {
  const sc = sdl_scancode_of_dom(k.code);
  set_key(sc, false);
  const ev = new SDL_Event();
  ev.type = SDL_EVENT_KEY_UP;
  ev.key.keysym.sym = sdl_keycode_of_dom(k);
  ev.key.keysym.mod = sdl_mod_of_dom(k);
  ev.key.keysym.scancode = sc;
  sdl_push_event(ev);
}

/** SDL_TEXTINPUT (typed characters, a paste) */
export function sdl_text_event(text: string): void {
  if (!sdl_text_input.on || text === '') return;
  const ev = new SDL_Event();
  ev.type = SDL_EVENT_TEXT_INPUT;
  ev.text.text = text;
  sdl_push_event(ev);
}

/** pointer moved to (x, y) in window pixels */
export function sdl_mouse_motion(x: number, y: number): void {
  const ev = new SDL_Event();
  ev.type = SDL_EVENT_MOUSE_MOTION;
  ev.motion.x = x; ev.motion.y = y;
  ev.motion.xrel = x - mouse.x; ev.motion.yrel = y - mouse.y;
  mouse.x = x; mouse.y = y;
  sdl_push_event(ev);
}

/** PointerEvent.button (0 left, 1 middle, 2 right, 3/4 back/forward) -> SDL button (1 left, 2 middle, 3 right,
 *  4/5 X1/X2) */
export function sdl_button_of_dom(button: number): number {
  return button === 0 ? SDL_BUTTON_LEFT : button === 1 ? SDL_BUTTON_MIDDLE : button === 2 ? SDL_BUTTON_RIGHT : button + 1;
}

export function sdl_mouse_button(button: number, down: boolean, x: number, y: number): void {
  if (x !== mouse.x || y !== mouse.y) sdl_mouse_motion(x, y);
  if (down) mouse.buttons |= SDL_BUTTON(button); else mouse.buttons &= ~SDL_BUTTON(button);
  const ev = new SDL_Event();
  ev.type = down ? SDL_EVENT_MOUSE_BUTTON_DOWN : SDL_EVENT_MOUSE_BUTTON_UP;
  ev.button.button = button;
  ev.button.x = x; ev.button.y = y;
  sdl_push_event(ev);
}

/** WheelEvent -> SDL wheel clicks: a line-mode or page-mode event is one click per event (Firefox's mouse
 *  wheel); pixel deltas (Chromium, touchpads) are summed, one click per 50 pixels. y > 0 is away from the user
 *  (the browser's deltaY < 0). */
let wheel_acc = 0;
export function sdl_wheel_steps(deltaY: number, deltaMode: number): number {
  if (deltaMode !== 0) return deltaY < 0 ? 1 : deltaY > 0 ? -1 : 0;
  wheel_acc -= deltaY;
  const n = Math.trunc(wheel_acc / 50);
  wheel_acc -= n * 50;
  return n;
}

export function sdl_mouse_wheel(steps: number, x: number, y: number): void {
  const one = steps > 0 ? 1 : -1;
  for (let i = 0; i < Math.abs(steps); i++) {
    const ev = new SDL_Event();
    ev.type = SDL_EVENT_MOUSE_WHEEL;
    ev.wheel.y = one;
    ev.wheel.mouseX = x; ev.wheel.mouseY = y;
    // SDL2 also fills ev.button.x/y from the same memory (the union): the original reads ev.button.x first
    ev.button.x = x; ev.button.y = y;
    sdl_push_event(ev);
  }
}

export function sdl_window_event(event: number, data1 = 0, data2 = 0): void {
  if (event === SDL_WINDOWEVENT_RESIZED) { sdl_window.w = data1; sdl_window.h = data2; }
  const ev = new SDL_Event();
  ev.type = SDL_WINDOWEVENT;
  ev.window.event = event; ev.window.data1 = data1; ev.window.data2 = data2;
  sdl_push_event(ev);
}

export function sdl_quit_event(): void {
  const ev = new SDL_Event();
  ev.type = SDL_EVENT_QUIT;
  sdl_push_event(ev);
}

// --- the DOM binding ---

/** the keys the browser keeps (full screen, developer tools) */
const browser_keys = new Set(['F11', 'F12']);

/** Binds the canvas (inside the focusable host) to the event queue: keys on the host, pointer and wheel on the
 *  canvas, paste as text input, the host's size as the window size (ResizeObserver -> SDL_WINDOWEVENT_RESIZED in
 *  device pixels; the canvas is resized here, the game's resize code runs when it polls the event). Everything
 *  is removed when `signal` aborts. */
export function sdl_attach(host: HTMLElement, canvas: HTMLCanvasElement, signal: AbortSignal): void {
  const opt = { signal };
  const dpr = (): number => window.devicePixelRatio || 1;
  const pos = (e: { clientX: number; clientY: number }): [number, number] => {
    const r = canvas.getBoundingClientRect();
    const sx = r.width ? canvas.width / r.width : 1, sy = r.height ? canvas.height / r.height : 1;
    return [Math.floor((e.clientX - r.left) * sx), Math.floor((e.clientY - r.top) * sy)];
  };
  const dk = (e: KeyboardEvent): dom_key & { altGraph: boolean } => ({
    key: e.key, code: e.code, shiftKey: e.shiftKey, ctrlKey: e.ctrlKey, altKey: e.altKey, metaKey: e.metaKey,
    numLock: e.getModifierState('NumLock'), capsLock: e.getModifierState('CapsLock'),
    altGraph: e.getModifierState('AltGraph'),
  });

  host.addEventListener('keydown', (e) => {
    if (browser_keys.has(e.code)) return;
    // paste: let the browser deliver the 'paste' event
    if ((e.ctrlKey || e.metaKey) && e.code === 'KeyV') { sdl_dom_keydown(dk(e)); return; }
    e.preventDefault();
    sdl_dom_keydown(dk(e));
  }, opt);
  host.addEventListener('keyup', (e) => {
    if (browser_keys.has(e.code)) return;
    e.preventDefault();
    sdl_dom_keyup(dk(e));
  }, opt);
  host.addEventListener('paste', (e) => {
    const t = e.clipboardData?.getData('text') ?? '';
    if (t) { e.preventDefault(); sdl_text_event(t); }
  }, opt);
  host.addEventListener('blur', () => { sdl_release_all_keys(); }, opt);

  canvas.addEventListener('pointerdown', (e) => {
    host.focus({ preventScroll: true });
    try { canvas.setPointerCapture(e.pointerId); } catch { /* not capturable */ }
    const [x, y] = pos(e);
    sdl_mouse_button(sdl_button_of_dom(e.button), true, x, y);
    e.preventDefault();
  }, opt);
  canvas.addEventListener('pointerup', (e) => {
    const [x, y] = pos(e);
    sdl_mouse_button(sdl_button_of_dom(e.button), false, x, y);
    e.preventDefault();
  }, opt);
  canvas.addEventListener('pointercancel', (e) => {
    const [x, y] = pos(e);
    for (const b of [SDL_BUTTON_LEFT, SDL_BUTTON_MIDDLE, SDL_BUTTON_RIGHT])
      if (mouse.buttons & SDL_BUTTON(b)) sdl_mouse_button(b, false, x, y);
  }, opt);
  canvas.addEventListener('pointermove', (e) => {
    const [x, y] = pos(e);
    if (x !== mouse.x || y !== mouse.y) sdl_mouse_motion(x, y);
  }, opt);
  canvas.addEventListener('pointerenter', () => { sdl_window_event(SDL_WINDOWEVENT_ENTER); }, opt);
  canvas.addEventListener('pointerleave', (e) => {
    if (e.pointerType === 'mouse' && !mouse.buttons) sdl_window_event(SDL_WINDOWEVENT_LEAVE);
  }, opt);
  canvas.addEventListener('wheel', (e) => {
    e.preventDefault();
    const [x, y] = pos(e);
    const n = sdl_wheel_steps(e.deltaY, e.deltaMode);
    if (n) sdl_mouse_wheel(n, x, y);
  }, { signal, passive: false });
  canvas.addEventListener('contextmenu', (e) => { e.preventDefault(); }, opt);

  const resize = (): void => {
    const r = host.getBoundingClientRect();
    const w = Math.max(1, Math.round(r.width * dpr())), h = Math.max(1, Math.round(r.height * dpr()));
    if (w === canvas.width && h === canvas.height && w === sdl_window.w && h === sdl_window.h) return;
    canvas.width = w; canvas.height = h;
    sdl_window_event(SDL_WINDOWEVENT_RESIZED, w, h);
  };
  const ro = new ResizeObserver(resize);
  ro.observe(host);
  signal.addEventListener('abort', () => { ro.disconnect(); sdl_clear_queue(); sdl_release_all_keys(); mouse.buttons = 0; }, { once: true });
  // the first size, before the game opens its window
  const r = host.getBoundingClientRect();
  canvas.width = sdl_window.w = Math.max(1, Math.round(r.width * dpr()));
  canvas.height = sdl_window.h = Math.max(1, Math.round(r.height * dpr()));
}
