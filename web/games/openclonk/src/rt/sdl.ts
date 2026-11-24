// OpenClonk in the browser: the SDL2 functions of the original's platform layer, for the translated code.
//
// The original's Linux build runs on SDL2 (platform/C4AppSDL.cpp: SDL_Init, the event loop of
// C4AbstractApp::FlushMessages and HandleSDLEvent, display modes, the clipboard; platform/C4WindowSDL.cpp: the window).
// Those files are translated as they are; this module is SDL for them (re/openclonk/tools/sdl.txt lists the
// functions, each as sdl$<name>), on the page: the window is the page's canvas, its size the display mode, and the
// page's keyboard and mouse events become SDL events in a queue that SDL_PollEvent hands to the original's
// HandleSDLEvent, as SDL's own event queue does. Keys are SDL scancodes (the USB HID usage of the key's place, as
// KeyboardEvent.code names it); the scancode names are SDL's (sdl2-compat on SDL 3.4.18, the build's SDL:
// src/events/SDL_keymap.c SDL_scancode_names), which the original shows for key bindings (KeycodeToString).
// SDL's OpenGL context functions are in rt/gl.ts.
import { Ptr, S, $str } from './ptr.ts';

// ---- SDL's constants that the page's events carry (SDL_events.h, SDL_keycode.h, SDL_mouse.h, SDL_video.h)
export const SDL_QUIT = 0x100, SDL_WINDOWEVENT = 0x200, SDL_KEYDOWN = 0x300, SDL_KEYUP = 0x301, SDL_TEXTINPUT = 0x303;
export const SDL_MOUSEMOTION = 0x400, SDL_MOUSEBUTTONDOWN = 0x401, SDL_MOUSEBUTTONUP = 0x402, SDL_MOUSEWHEEL = 0x403;
export const SDL_WINDOWEVENT_SIZE_CHANGED = 6, SDL_WINDOWEVENT_FOCUS_GAINED = 12, SDL_WINDOWEVENT_FOCUS_LOST = 13;
export const SDL_PRESSED = 1, SDL_RELEASED = 0;
export const KMOD_LSHIFT = 0x1, KMOD_RSHIFT = 0x2, KMOD_LCTRL = 0x40, KMOD_RCTRL = 0x80, KMOD_LALT = 0x100, KMOD_RALT = 0x200;
export const KMOD_LGUI = 0x400, KMOD_RGUI = 0x800, KMOD_NUM = 0x1000, KMOD_CAPS = 0x2000;
/** SDL_PIXELFORMAT_RGB888 (32 bits per pixel): the canvas's format for SDL_BITSPERPIXEL */
const SDL_PIXELFORMAT_RGB888 = 0x16161804;

/** KeyboardEvent.code -> SDL scancode (the USB HID usage page 7 index of the key) */
export const SCANCODES: Readonly<Record<string, number>> = {
  KeyA: 4, KeyB: 5, KeyC: 6, KeyD: 7, KeyE: 8, KeyF: 9, KeyG: 10, KeyH: 11, KeyI: 12, KeyJ: 13, KeyK: 14, KeyL: 15, KeyM: 16,
  KeyN: 17, KeyO: 18, KeyP: 19, KeyQ: 20, KeyR: 21, KeyS: 22, KeyT: 23, KeyU: 24, KeyV: 25, KeyW: 26, KeyX: 27, KeyY: 28, KeyZ: 29,
  Digit1: 30, Digit2: 31, Digit3: 32, Digit4: 33, Digit5: 34, Digit6: 35, Digit7: 36, Digit8: 37, Digit9: 38, Digit0: 39,
  Enter: 40, Escape: 41, Backspace: 42, Tab: 43, Space: 44, Minus: 45, Equal: 46, BracketLeft: 47, BracketRight: 48,
  Backslash: 49, Semicolon: 51, Quote: 52, Backquote: 53, Comma: 54, Period: 55, Slash: 56, CapsLock: 57,
  F1: 58, F2: 59, F3: 60, F4: 61, F5: 62, F6: 63, F7: 64, F8: 65, F9: 66, F10: 67, F11: 68, F12: 69,
  PrintScreen: 70, ScrollLock: 71, Pause: 72, Insert: 73, Home: 74, PageUp: 75, Delete: 76, End: 77, PageDown: 78,
  ArrowRight: 79, ArrowLeft: 80, ArrowDown: 81, ArrowUp: 82, NumLock: 83, NumpadDivide: 84, NumpadMultiply: 85,
  NumpadSubtract: 86, NumpadAdd: 87, NumpadEnter: 88, Numpad1: 89, Numpad2: 90, Numpad3: 91, Numpad4: 92, Numpad5: 93,
  Numpad6: 94, Numpad7: 95, Numpad8: 96, Numpad9: 97, Numpad0: 98, NumpadDecimal: 99, IntlBackslash: 100, ContextMenu: 101,
  NumpadEqual: 103, F13: 104, F14: 105, F15: 106, F16: 107, F17: 108, F18: 109, F19: 110, F20: 111, F21: 112, F22: 113,
  F23: 114, F24: 115, ControlLeft: 224, ShiftLeft: 225, AltLeft: 226, MetaLeft: 227, OSLeft: 227, ControlRight: 228,
  ShiftRight: 229, AltRight: 230, MetaRight: 231, OSRight: 231,
};

/** SDL_scancode_names of the build's SDL (index: scancode) */
const SCANCODE_NAMES: Readonly<Record<number, string>> = {
  4: "A", 5: "B", 6: "C", 7: "D", 8: "E", 9: "F", 10: "G", 11: "H", 12: "I", 13: "J", 14: "K", 15: "L", 16: "M",
  17: "N", 18: "O", 19: "P", 20: "Q", 21: "R", 22: "S", 23: "T", 24: "U", 25: "V", 26: "W", 27: "X", 28: "Y",
  29: "Z", 30: "1", 31: "2", 32: "3", 33: "4", 34: "5", 35: "6", 36: "7", 37: "8", 38: "9", 39: "0", 40: "Return",
  41: "Escape", 42: "Backspace", 43: "Tab", 44: "Space", 45: "-", 46: "=", 47: "[", 48: "]", 49: "\\", 50: "#",
  51: ";", 52: "'", 53: "`", 54: ",", 55: ".", 56: "/", 57: "CapsLock", 58: "F1", 59: "F2", 60: "F3", 61: "F4",
  62: "F5", 63: "F6", 64: "F7", 65: "F8", 66: "F9", 67: "F10", 68: "F11", 69: "F12", 70: "PrintScreen",
  71: "ScrollLock", 72: "Pause", 73: "Insert", 74: "Home", 75: "PageUp", 76: "Delete", 77: "End", 78: "PageDown",
  79: "Right", 80: "Left", 81: "Down", 82: "Up", 83: "Numlock", 84: "Keypad /", 85: "Keypad *", 86: "Keypad -",
  87: "Keypad +", 88: "Keypad Enter", 89: "Keypad 1", 90: "Keypad 2", 91: "Keypad 3", 92: "Keypad 4", 93: "Keypad 5",
  94: "Keypad 6", 95: "Keypad 7", 96: "Keypad 8", 97: "Keypad 9", 98: "Keypad 0", 99: "Keypad .",
  100: "NonUSBackslash", 101: "Application", 102: "Power", 103: "Keypad =", 104: "F13", 105: "F14", 106: "F15",
  107: "F16", 108: "F17", 109: "F18", 110: "F19", 111: "F20", 112: "F21", 113: "F22", 114: "F23", 115: "F24",
  116: "Execute", 117: "Help", 118: "Menu", 119: "Select", 120: "Stop", 121: "Again", 122: "Undo", 123: "Cut",
  124: "Copy", 125: "Paste", 126: "Find", 127: "Mute", 128: "VolumeUp", 129: "VolumeDown", 133: "Keypad ,",
  134: "Keypad = (AS400)", 135: "International 1", 136: "International 2", 137: "International 3",
  138: "International 4", 139: "International 5", 140: "International 6", 141: "International 7",
  142: "International 8", 143: "International 9", 144: "Language 1", 145: "Language 2", 146: "Language 3",
  147: "Language 4", 148: "Language 5", 149: "Language 6", 150: "Language 7", 151: "Language 8", 152: "Language 9",
  153: "AltErase", 154: "SysReq", 155: "Cancel", 156: "Clear", 157: "Prior", 158: "Return", 159: "Separator",
  160: "Out", 161: "Oper", 162: "Clear / Again", 163: "CrSel", 164: "ExSel", 165: "Front", 176: "Keypad 00",
  177: "Keypad 000", 178: "ThousandsSeparator", 179: "DecimalSeparator", 180: "CurrencyUnit", 181: "CurrencySubUnit",
  182: "Keypad (", 183: "Keypad )", 184: "Keypad {", 185: "Keypad }", 186: "Keypad Tab", 187: "Keypad Backspace",
  188: "Keypad A", 189: "Keypad B", 190: "Keypad C", 191: "Keypad D", 192: "Keypad E", 193: "Keypad F",
  194: "Keypad XOR", 195: "Keypad ^", 196: "Keypad %", 197: "Keypad <", 198: "Keypad >", 199: "Keypad &",
  200: "Keypad &&", 201: "Keypad |", 202: "Keypad ||", 203: "Keypad :", 204: "Keypad #", 205: "Keypad Space",
  206: "Keypad @", 207: "Keypad !", 208: "Keypad MemStore", 209: "Keypad MemRecall", 210: "Keypad MemClear",
  211: "Keypad MemAdd", 212: "Keypad MemSubtract", 213: "Keypad MemMultiply", 214: "Keypad MemDivide",
  215: "Keypad +/-", 216: "Keypad Clear", 217: "Keypad ClearEntry", 218: "Keypad Binary", 219: "Keypad Octal",
  220: "Keypad Decimal", 221: "Keypad Hexadecimal", 224: "Left Ctrl", 225: "Left Shift", 226: "Left Alt",
  227: "Left GUI", 228: "Right Ctrl", 229: "Right Shift", 230: "Right Alt", 231: "Right GUI", 257: "ModeSwitch",
  258: "Sleep", 259: "Wake", 260: "ChannelUp", 261: "ChannelDown", 262: "MediaPlay", 263: "MediaPause",
  264: "MediaRecord", 265: "MediaFastForward", 266: "MediaRewind", 267: "MediaTrackNext", 268: "MediaTrackPrevious",
  269: "MediaStop", 270: "Eject", 271: "MediaPlayPause", 272: "MediaSelect", 273: "AC New", 274: "AC Open",
  275: "AC Close", 276: "AC Exit", 277: "AC Save", 278: "AC Print", 279: "AC Properties", 280: "AC Search",
  281: "AC Home", 282: "AC Back", 283: "AC Forward", 284: "AC Stop", 285: "AC Refresh", 286: "AC Bookmarks",
  287: "SoftLeft", 288: "SoftRight", 289: "Call", 290: "EndCall",
};

// ---- the state SDL keeps: the event queue, the window, the keyboard and mouse

/** an SDL_Event as the translated code reads it (the members of the union it uses) */
export interface SdlEvent {
  type: number;
  key?: { keysym: { scancode: number; sym: number; mod: number }; repeat: number; state: number };
  text?: { text: Int8Array };
  motion?: { x: number; y: number; state: number };
  button?: { button: number; state: number; clicks: number; x: number; y: number };
  wheel?: { x: number; y: number };
  window?: { windowID: number; event: number; data1: number; data2: number };
  caxis?: { which: number; axis: number; value: number };
  cbutton?: { which: number; button: number; state: number };
  cdevice?: { which: number };
  jdevice?: { which: number };
}

interface Window { id: number; title: string; data: Map<string, unknown>; w: number; h: number; grab: boolean }

const state = {
  queue: [] as SdlEvent[],
  window: null as Window | null,
  canvas: null as HTMLCanvasElement | OffscreenCanvas | null,
  mod: 0,
  mouse: { x: 0, y: 0, buttons: 0 },
  error: '',
  clipboard: '',
  cursorShown: true,
};

/** the canvas that is SDL's window (and display) */
export function sdlSetCanvas(canvas: HTMLCanvasElement | OffscreenCanvas | null): void {
  state.canvas = canvas;
}
/** the page adds an event (SDL_PushEvent); SDL_PollEvent hands them out in order */
export function sdlPushEvent(e: SdlEvent): void {
  state.queue.push(e);
}
/** the modifier keys held (SDL_GetModState), kept by the page's key events */
export function sdlSetModState(mod: number): void {
  state.mod = mod;
}
/** the mouse position in the window's pixels and the buttons held (SDL_GetMouseState) */
export function sdlSetMouse(x: number, y: number, buttons: number): void {
  state.mouse = { x, y, buttons };
}
/** the window the original created (the page asks for its C4Window, SDL_GetWindowData) */
export function sdlWindow(): Window | null {
  return state.window;
}
// ---- game controllers: the browser's gamepads (navigator.getGamepads) as SDL's

/** SDL_CONTROLLER* event types (SDL_events.h) */
export const SDL_CONTROLLERAXISMOTION = 0x650, SDL_CONTROLLERBUTTONDOWN = 0x651, SDL_CONTROLLERBUTTONUP = 0x652,
  SDL_CONTROLLERDEVICEADDED = 0x653, SDL_CONTROLLERDEVICEREMOVED = 0x654;

/** a gamepad as SDL sees it: its device index is its place in the list, its instance ID the browser's index */
interface Pad { index: number; id: string; buttons: number[]; axes: number[]; open: boolean }
const pads: Pad[] = [];
/** what the browser reports, read by the page each frame (none in a browser without the Gamepad API) */
export type PadState = { index: number; id: string; connected: boolean; mapping: string; buttons: { value: number; pressed: boolean }[]; axes: number[];
  vibrationActuator?: { playEffect?(type: string, params: object): Promise<unknown>; reset?(): Promise<unknown> } | null };
let readPads: () => (PadState | null)[] = () => (typeof navigator !== 'undefined' && navigator.getGamepads ? [...navigator.getGamepads()] as unknown as PadState[] : []);
/** tests: a stand-in for navigator.getGamepads */
export function sdlSetGamepadSource(f: () => (PadState | null)[]): void { readPads = f; }

/** SDL_GameControllerButton for the standard mapping's buttons 0..16 (A, B, X, Y, LB, RB, LT, RT, back, start, LS, RS,
 *  up, down, left, right, guide); the triggers are SDL axes 4 and 5 (TRIGGERLEFT, TRIGGERRIGHT) */
const BUTTONS: (number | null)[] = [0, 1, 2, 3, 9, 10, null, null, 4, 6, 7, 8, 11, 12, 13, 14, 5];
const axisValue = (v: number) => Math.max(-32768, Math.min(32767, Math.round(v * 32767)));

/** compares the browser's gamepads with what SDL reported and queues SDL's controller events (the page, each frame) */
export function sdlPollGamepads(): void {
  const now = readPads().filter((p): p is PadState => !!p && p.connected && p.mapping === 'standard');
  for (const pad of [...pads]) {
    if (!now.some((p) => p.index === pad.index)) {
      pads.splice(pads.indexOf(pad), 1);
      state.queue.push({ type: SDL_CONTROLLERDEVICEREMOVED, cdevice: { which: pad.index } });
    }
  }
  for (const p of now) {
    let pad = pads.find((x) => x.index === p.index);
    if (!pad) {
      pad = { index: p.index, id: p.id, buttons: new Array(17).fill(0), axes: new Array(6).fill(0), open: false };
      pads.push(pad);
      state.queue.push({ type: SDL_CONTROLLERDEVICEADDED, cdevice: { which: pads.length - 1 } });
    }
    for (let b = 0; b < BUTTONS.length; b++) {
      const sdlButton = BUTTONS[b];
      const v = p.buttons[b]?.pressed ? 1 : 0;
      if (sdlButton !== null && v !== pad.buttons[b]) {
        pad.buttons[b] = v;
        state.queue.push({ type: v ? SDL_CONTROLLERBUTTONDOWN : SDL_CONTROLLERBUTTONUP, cbutton: { which: pad.index, button: sdlButton, state: v } });
      }
    }
    const axes = [p.axes[0] ?? 0, p.axes[1] ?? 0, p.axes[2] ?? 0, p.axes[3] ?? 0, p.buttons[6]?.value ?? 0, p.buttons[7]?.value ?? 0].map(axisValue);
    for (let a = 0; a < 6; a++) {
      if (axes[a] !== pad.axes[a]) {
        pad.axes[a] = axes[a];
        state.queue.push({ type: SDL_CONTROLLERAXISMOTION, caxis: { which: pad.index, axis: a, value: axes[a] } });
      }
    }
  }
}

/** for tests and a new game: SDL as before SDL_Init */
export function sdlReset(): void {
  pads.length = 0;
  state.queue = [];
  state.window = null;
  state.mod = 0;
  state.mouse = { x: 0, y: 0, buttons: 0 };
  state.error = '';
}

const canvasSize = () => ({ w: state.canvas?.width ?? 0, h: state.canvas?.height ?? 0 });

/** stores through an output pointer: a Ptr (P(obj, 'field') or an array element) */
function out(p: unknown, v: number): void {
  if (!(p instanceof Ptr)) return;
  if (typeof p.o === 'string') p.a[p.o] = v;
  else p.a[p.o] = v;
}

/** the object a struct pointer argument points at (the translation passes class objects as themselves) */
function obj<T extends object>(p: unknown): T {
  if (p instanceof Ptr) return (typeof p.o === 'string' ? p.a[p.o] : p.a[p.o]) as T;
  return p as T;
}

// ---- the functions (sdl.txt)

export function sdl$SDL_SetHint(_name: unknown, _value: unknown): number { return 1; }
export function sdl$SDL_InitSubSystem(_flags: number): number { return 0; }
export function sdl$SDL_QuitSubSystem(_flags: number): void { /* nothing to shut down */ }
export function sdl$SDL_GameControllerEventState(state: number): number { return state; }
export function sdl$SDL_NumJoysticks(): number { return pads.length; }
/** every gamepad the page passes on has the standard mapping, which is SDL's game controller layout */
export function sdl$SDL_IsGameController(index: number): number { return index >= 0 && index < pads.length ? 1 : 0; }
const padName = (pad: Pad | undefined) => S(pad?.id ?? '');
export function sdl$SDL_JoystickNameForIndex(index: number): Ptr { return padName(pads[index]); }
/** a controller (and its joystick) is the pad itself */
export function sdl$SDL_GameControllerOpen(index: number): Pad | null {
  const pad = pads[index];
  if (!pad) { state.error = 'There are 0 joysticks available'; return null; }
  pad.open = true;
  return pad;
}
export function sdl$SDL_GameControllerClose(pad: Pad | null): void { if (pad) pad.open = false; }
export function sdl$SDL_GameControllerGetJoystick(pad: Pad | null): Pad | null { return pad; }
export function sdl$SDL_GameControllerGetAttached(pad: Pad | null): number { return pad && pads.includes(pad) ? 1 : 0; }
export function sdl$SDL_JoystickInstanceID(pad: Pad | null): number { return pad ? pad.index : -1; }
export function sdl$SDL_JoystickName(pad: Pad | null): Ptr { return padName(pad ?? undefined); }
/** rumbling: the browser's vibration actuator, where the gamepad has one */
const actuator = (pad: Pad | null) => readPads().find((p) => p && p.index === pad?.index)?.vibrationActuator ?? null;
export function sdl$SDL_HapticOpenFromJoystick(pad: Pad | null): Pad | null { return pad; }
export function sdl$SDL_HapticClose(_pad: Pad | null): void { /* the pad stays */ }
export function sdl$SDL_HapticRumbleSupported(pad: Pad | null): number { return actuator(pad)?.playEffect ? 1 : 0; }
export function sdl$SDL_HapticRumbleInit(pad: Pad | null): number { return actuator(pad)?.playEffect ? 0 : -1; }
export function sdl$SDL_HapticRumblePlay(pad: Pad | null, strength: number, length: number): number {
  void actuator(pad)?.playEffect?.('dual-rumble', { duration: length, strongMagnitude: Math.max(0, Math.min(1, strength)), weakMagnitude: Math.max(0, Math.min(1, strength)) })?.catch(() => {});
  return 0;
}
export function sdl$SDL_HapticRumbleStop(pad: Pad | null): number { void actuator(pad)?.reset?.()?.catch(() => {}); return 0; }

export function sdl$SDL_Init(_flags: number): number { state.error = ''; return 0; }
export function sdl$SDL_Quit(): void { state.window = null; }
export function sdl$SDL_GetError(): Ptr { return S(state.error); }

/** copies the next queued event into *event (the members of the SDL_Event union the original reads) */
export function sdl$SDL_PollEvent(event: unknown): number {
  const e = state.queue.shift();
  if (!e) return 0;
  if (event) Object.assign(obj<SdlEvent>(event), e);
  return 1;
}
export function sdl$SDL_GetModState(): number { return state.mod; }
export function sdl$SDL_GetMouseState(x: unknown, y: unknown): number {
  out(x, state.mouse.x);
  out(y, state.mouse.y);
  return state.mouse.buttons;
}
/** SDL 1.2's key repeat (commented out in the original; SDL2 repeats keys itself, the browser too) */
export function sdl$SDL_EnableKeyRepeat(_delay: number, _interval: number): number { return 0; }

const nameCache = new Map<number, Ptr>();
export function sdl$SDL_GetScancodeName(scancode: number): Ptr {
  let p = nameCache.get(scancode);
  if (!p) { p = S(SCANCODE_NAMES[scancode] ?? ''); nameCache.set(scancode, p); }
  return p;
}
/** SDL_strcasecmp over the names (ASCII case) */
export function sdl$SDL_GetScancodeFromName(name: unknown): number {
  const n = name instanceof Ptr ? $str(name) : String(name ?? '');
  if (!n) return 0;
  const lower = n.replace(/[A-Z]/g, (c) => c.toLowerCase());
  for (const [k, v] of Object.entries(SCANCODE_NAMES)) if (v.replace(/[A-Z]/g, (c) => c.toLowerCase()) === lower) return +k;
  return 0;
}

/** the window: the page's canvas (one window; the original's hidden multisampling test windows succeed and vanish) */
export function sdl$SDL_CreateWindow(title: unknown, _x: number, _y: number, w: number, h: number, flags: number): Window | null {
  const SDL_WINDOW_HIDDEN = 0x8;
  const win: Window = { id: 1, title: title instanceof Ptr ? $str(title) : String(title ?? ''), data: new Map(), w, h, grab: false };
  if (!(flags & SDL_WINDOW_HIDDEN)) state.window = win;
  return win;
}
export function sdl$SDL_DestroyWindow(win: Window | null): void {
  if (win && state.window === win) state.window = null;
}
export function sdl$SDL_SetWindowTitle(win: Window | null, title: unknown): void {
  if (win) win.title = title instanceof Ptr ? $str(title) : String(title ?? '');
}
/** the canvas has the page's size; the window remembers what the original asked for */
export function sdl$SDL_SetWindowSize(win: Window | null, w: number, h: number): void {
  if (win) { win.w = w; win.h = h; }
}
export function sdl$SDL_SetWindowGrab(win: Window | null, grab: number | boolean): void {
  if (win) win.grab = !!grab;
}
export function sdl$SDL_SetWindowData(win: Window | null, name: unknown, data: unknown): unknown {
  if (!win) return null;
  const key = name instanceof Ptr ? $str(name) : String(name);
  const old = win.data.get(key) ?? null;
  win.data.set(key, data);
  return old;
}
export function sdl$SDL_GetWindowData(win: Window | null, name: unknown): unknown {
  if (!win) return null;
  return win.data.get(name instanceof Ptr ? $str(name) : String(name)) ?? null;
}
export function sdl$SDL_GetWindowFromID(id: number): Window | null {
  return state.window && state.window.id === id ? state.window : null;
}
/** the window manager's info (X11 urgency hints): there is none in the browser */
export function sdl$SDL_GetWindowWMInfo(_win: unknown, _info: unknown): number { state.error = 'no window manager in the browser'; return 0; }
/** the canvas fills the page in every mode */
export function sdl$SDL_SetWindowFullscreen(_win: unknown, _flags: number): number { return 0; }
export function sdl$SDL_SetWindowDisplayMode(_win: unknown, _mode: unknown): number { return 0; }
/** one display mode: the canvas's size, 32 bits per pixel, 60 Hz */
export function sdl$SDL_GetNumDisplayModes(_display: number): number { return 1; }
function mode(m: unknown): number {
  const { w, h } = canvasSize();
  Object.assign(obj<object>(m), { format: SDL_PIXELFORMAT_RGB888, w, h, refresh_rate: 60, driverdata: null });
  return 0;
}
export function sdl$SDL_GetDisplayMode(_display: number, index: number, m: unknown): number {
  if (index !== 0) { state.error = 'index out of range'; return -1; }
  return mode(m);
}
export function sdl$SDL_GetDesktopDisplayMode(_display: number, m: unknown): number { return mode(m); }
/** the original hides the system cursor and draws its own */
export function sdl$SDL_ShowCursor(toggle: number): number {
  if (toggle >= 0) state.cursorShown = toggle !== 0;
  if (state.canvas && 'style' in state.canvas) (state.canvas as HTMLCanvasElement).style.cursor = state.cursorShown ? '' : 'none';
  return state.cursorShown ? 1 : 0;
}
/** a message box: the page's log (the original shows it when the system group cannot be opened) */
export function sdl$SDL_ShowSimpleMessageBox(_flags: number, title: unknown, message: unknown, _win: unknown): number {
  console.warn(`${title instanceof Ptr ? $str(title) : title}: ${message instanceof Ptr ? $str(message) : message}`);
  return 0;
}
/** the clipboard: the browser's is asynchronous and needs a gesture, so SDL's is kept here (copy and paste in-game) */
export function sdl$SDL_GetClipboardText(): Ptr { return S(state.clipboard); }
export function sdl$SDL_SetClipboardText(text: unknown): number {
  state.clipboard = text instanceof Ptr ? $str(text) : String(text ?? '');
  try { void navigator.clipboard?.writeText(state.clipboard); } catch { /* not allowed */ }
  return 0;
}
export function sdl$SDL_HasClipboardText(): boolean { return state.clipboard.length > 0; }
export function sdl$SDL_free(_p: unknown): void {}
/** SDL_VERSION(&info.version) is SDL_GetVersion in sdl2-compat's macro */
export function sdl$SDL_GetVersion(v: unknown): void {
  if (v) Object.assign(obj<object>(v), { major: 2, minor: 32, patch: 74 });
}

/** every function of this module (re/openclonk/tools/sdl.txt lists the same, for the translator) */
export const SDL_FUNCTIONS: readonly string[] = [
  'SDL_Init', 'SDL_Quit', 'SDL_GetError', 'SDL_PollEvent', 'SDL_GetModState', 'SDL_GetMouseState', 'SDL_EnableKeyRepeat',
  'SDL_GetScancodeName', 'SDL_GetScancodeFromName', 'SDL_CreateWindow', 'SDL_DestroyWindow', 'SDL_SetWindowTitle',
  'SDL_SetWindowSize', 'SDL_SetWindowGrab', 'SDL_SetWindowData', 'SDL_GetWindowData', 'SDL_GetWindowFromID',
  'SDL_GetWindowWMInfo', 'SDL_SetWindowFullscreen', 'SDL_SetWindowDisplayMode', 'SDL_GetNumDisplayModes',
  'SDL_GetDisplayMode', 'SDL_GetDesktopDisplayMode', 'SDL_ShowCursor', 'SDL_ShowSimpleMessageBox', 'SDL_GetClipboardText',
  'SDL_SetClipboardText', 'SDL_HasClipboardText', 'SDL_free', 'SDL_GetVersion',
  // game controllers and haptics (platform/C4GamePadCon.cpp)
  'SDL_SetHint', 'SDL_InitSubSystem', 'SDL_QuitSubSystem', 'SDL_GameControllerEventState', 'SDL_NumJoysticks',
  'SDL_IsGameController', 'SDL_JoystickNameForIndex', 'SDL_GameControllerOpen', 'SDL_GameControllerClose',
  'SDL_GameControllerGetJoystick', 'SDL_GameControllerGetAttached', 'SDL_JoystickInstanceID', 'SDL_JoystickName',
  'SDL_HapticOpenFromJoystick', 'SDL_HapticClose', 'SDL_HapticRumbleSupported', 'SDL_HapticRumbleInit',
  'SDL_HapticRumblePlay', 'SDL_HapticRumbleStop',
];
