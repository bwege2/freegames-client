// SDL_keycode.h / SDL_scancode.h / SDL_mouse.h values the original's GUI compares against, the browser's
// KeyboardEvent mapped to them (SDL2 semantics: `key` is the layout's unshifted character for printable keys,
// `scan` is the physical key), and the few platform helpers (PowderToySDL.cpp GetTicks, ClipboardPush/Pull,
// Platform::GetTime).

export const SDL_BUTTON_LEFT = 1, SDL_BUTTON_MIDDLE = 2, SDL_BUTTON_RIGHT = 3;

const MASK = 1 << 30;
const sc = (s: number): number => s | MASK;

// scancodes
export const SDL_SCANCODE_A = 4, SDL_SCANCODE_B = 5, SDL_SCANCODE_C = 6, SDL_SCANCODE_D = 7, SDL_SCANCODE_E = 8,
  SDL_SCANCODE_F = 9, SDL_SCANCODE_G = 10, SDL_SCANCODE_H = 11, SDL_SCANCODE_I = 12, SDL_SCANCODE_J = 13,
  SDL_SCANCODE_K = 14, SDL_SCANCODE_L = 15, SDL_SCANCODE_M = 16, SDL_SCANCODE_N = 17, SDL_SCANCODE_O = 18,
  SDL_SCANCODE_P = 19, SDL_SCANCODE_Q = 20, SDL_SCANCODE_R = 21, SDL_SCANCODE_S = 22, SDL_SCANCODE_T = 23,
  SDL_SCANCODE_U = 24, SDL_SCANCODE_V = 25, SDL_SCANCODE_W = 26, SDL_SCANCODE_X = 27, SDL_SCANCODE_Y = 28,
  SDL_SCANCODE_Z = 29;
export const SDL_SCANCODE_1 = 30, SDL_SCANCODE_0 = 39;
export const SDL_SCANCODE_RETURN = 40, SDL_SCANCODE_ESCAPE = 41, SDL_SCANCODE_BACKSPACE = 42, SDL_SCANCODE_TAB = 43,
  SDL_SCANCODE_SPACE = 44, SDL_SCANCODE_MINUS = 45, SDL_SCANCODE_EQUALS = 46, SDL_SCANCODE_LEFTBRACKET = 47,
  SDL_SCANCODE_RIGHTBRACKET = 48, SDL_SCANCODE_BACKSLASH = 49, SDL_SCANCODE_SEMICOLON = 51,
  SDL_SCANCODE_APOSTROPHE = 52, SDL_SCANCODE_GRAVE = 53, SDL_SCANCODE_COMMA = 54, SDL_SCANCODE_PERIOD = 55,
  SDL_SCANCODE_SLASH = 56, SDL_SCANCODE_CAPSLOCK = 57;
export const SDL_SCANCODE_F1 = 58, SDL_SCANCODE_F2 = 59, SDL_SCANCODE_F3 = 60, SDL_SCANCODE_F4 = 61,
  SDL_SCANCODE_F5 = 62, SDL_SCANCODE_F6 = 63, SDL_SCANCODE_F7 = 64, SDL_SCANCODE_F8 = 65, SDL_SCANCODE_F9 = 66,
  SDL_SCANCODE_F10 = 67, SDL_SCANCODE_F11 = 68, SDL_SCANCODE_F12 = 69;
export const SDL_SCANCODE_INSERT = 73, SDL_SCANCODE_HOME = 74, SDL_SCANCODE_PAGEUP = 75, SDL_SCANCODE_DELETE = 76,
  SDL_SCANCODE_END = 77, SDL_SCANCODE_PAGEDOWN = 78, SDL_SCANCODE_RIGHT = 79, SDL_SCANCODE_LEFT = 80,
  SDL_SCANCODE_DOWN = 81, SDL_SCANCODE_UP = 82, SDL_SCANCODE_KP_ENTER = 88;
export const SDL_SCANCODE_LCTRL = 224, SDL_SCANCODE_LSHIFT = 225, SDL_SCANCODE_LALT = 226, SDL_SCANCODE_LGUI = 227,
  SDL_SCANCODE_RCTRL = 228, SDL_SCANCODE_RSHIFT = 229, SDL_SCANCODE_RALT = 230, SDL_SCANCODE_RGUI = 231;
export const SDL_SCANCODE_AC_BACK = 270;

// keycodes
export const SDLK_RETURN = 13, SDLK_ESCAPE = 27, SDLK_BACKSPACE = 8, SDLK_TAB = 9, SDLK_SPACE = 32, SDLK_DELETE = 127;
export const SDLK_F1 = sc(SDL_SCANCODE_F1);
export const SDLK_INSERT = sc(SDL_SCANCODE_INSERT), SDLK_HOME = sc(SDL_SCANCODE_HOME),
  SDLK_PAGEUP = sc(SDL_SCANCODE_PAGEUP), SDLK_END = sc(SDL_SCANCODE_END), SDLK_PAGEDOWN = sc(SDL_SCANCODE_PAGEDOWN),
  SDLK_RIGHT = sc(SDL_SCANCODE_RIGHT), SDLK_LEFT = sc(SDL_SCANCODE_LEFT), SDLK_DOWN = sc(SDL_SCANCODE_DOWN),
  SDLK_UP = sc(SDL_SCANCODE_UP), SDLK_KP_ENTER = sc(SDL_SCANCODE_KP_ENTER), SDLK_AC_BACK = sc(SDL_SCANCODE_AC_BACK),
  SDLK_LCTRL = sc(SDL_SCANCODE_LCTRL), SDLK_LSHIFT = sc(SDL_SCANCODE_LSHIFT), SDLK_LALT = sc(SDL_SCANCODE_LALT),
  SDLK_RCTRL = sc(SDL_SCANCODE_RCTRL), SDLK_RSHIFT = sc(SDL_SCANCODE_RSHIFT), SDLK_RALT = sc(SDL_SCANCODE_RALT);

/** KeyboardEvent.code -> [scancode, US-layout keycode] */
const CODES: Record<string, [number, number]> = {
  Enter: [SDL_SCANCODE_RETURN, SDLK_RETURN], NumpadEnter: [SDL_SCANCODE_KP_ENTER, SDLK_KP_ENTER],
  Escape: [SDL_SCANCODE_ESCAPE, SDLK_ESCAPE], Backspace: [SDL_SCANCODE_BACKSPACE, SDLK_BACKSPACE],
  Tab: [SDL_SCANCODE_TAB, SDLK_TAB], Space: [SDL_SCANCODE_SPACE, SDLK_SPACE],
  Minus: [SDL_SCANCODE_MINUS, 45], Equal: [SDL_SCANCODE_EQUALS, 61], BracketLeft: [SDL_SCANCODE_LEFTBRACKET, 91],
  BracketRight: [SDL_SCANCODE_RIGHTBRACKET, 93], Backslash: [SDL_SCANCODE_BACKSLASH, 92],
  Semicolon: [SDL_SCANCODE_SEMICOLON, 59], Quote: [SDL_SCANCODE_APOSTROPHE, 39], Backquote: [SDL_SCANCODE_GRAVE, 96],
  Comma: [SDL_SCANCODE_COMMA, 44], Period: [SDL_SCANCODE_PERIOD, 46], Slash: [SDL_SCANCODE_SLASH, 47],
  CapsLock: [SDL_SCANCODE_CAPSLOCK, sc(SDL_SCANCODE_CAPSLOCK)],
  Insert: [SDL_SCANCODE_INSERT, SDLK_INSERT], Home: [SDL_SCANCODE_HOME, SDLK_HOME],
  PageUp: [SDL_SCANCODE_PAGEUP, SDLK_PAGEUP], Delete: [SDL_SCANCODE_DELETE, SDLK_DELETE],
  End: [SDL_SCANCODE_END, SDLK_END], PageDown: [SDL_SCANCODE_PAGEDOWN, SDLK_PAGEDOWN],
  ArrowRight: [SDL_SCANCODE_RIGHT, SDLK_RIGHT], ArrowLeft: [SDL_SCANCODE_LEFT, SDLK_LEFT],
  ArrowDown: [SDL_SCANCODE_DOWN, SDLK_DOWN], ArrowUp: [SDL_SCANCODE_UP, SDLK_UP],
  ControlLeft: [SDL_SCANCODE_LCTRL, SDLK_LCTRL], ShiftLeft: [SDL_SCANCODE_LSHIFT, SDLK_LSHIFT],
  AltLeft: [SDL_SCANCODE_LALT, SDLK_LALT], ControlRight: [SDL_SCANCODE_RCTRL, SDLK_RCTRL],
  ShiftRight: [SDL_SCANCODE_RSHIFT, SDLK_RSHIFT], AltRight: [SDL_SCANCODE_RALT, SDLK_RALT],
  MetaLeft: [SDL_SCANCODE_LGUI, sc(SDL_SCANCODE_LGUI)], MetaRight: [SDL_SCANCODE_RGUI, sc(SDL_SCANCODE_RGUI)],
  BrowserBack: [SDL_SCANCODE_AC_BACK, SDLK_AC_BACK],
};
for (let i = 0; i < 26; i++) CODES['Key' + String.fromCharCode(65 + i)] = [SDL_SCANCODE_A + i, 97 + i];
for (let i = 1; i <= 9; i++) CODES['Digit' + i] = [SDL_SCANCODE_1 + i - 1, 48 + i];
CODES.Digit0 = [SDL_SCANCODE_0, 48];
for (let i = 1; i <= 12; i++) CODES['F' + i] = [SDL_SCANCODE_F1 + i - 1, sc(SDL_SCANCODE_F1 + i - 1)];
for (let i = 0; i <= 9; i++) CODES['Numpad' + i] = [89 + ((i + 9) % 10), 48 + i];

export interface SdlKey {
  key: number;
  scan: number;
  repeat: boolean;
  shift: boolean;
  ctrl: boolean;
  alt: boolean;
}

/**
 * A KeyboardEvent as SDL reports it: `scan` from the physical key, `key` from the layout (a letter key that types
 * a latin letter gives that letter, as SDL does on AZERTY etc.; other printable keys use the US layout).
 * Cmd on macOS counts as Ctrl, like the original's macOS build.
 */
export function sdlKeyOf(e: { code: string; key: string; repeat: boolean; shiftKey: boolean; ctrlKey: boolean; altKey: boolean; metaKey: boolean }): SdlKey {
  const m = CODES[e.code];
  let scan = 0, key = 0;
  if (m) [scan, key] = m;
  if (e.key.length === 1) {
    const lower = e.key.toLowerCase();
    if (lower >= 'a' && lower <= 'z' && (!m || (key >= 97 && key <= 122))) key = lower.charCodeAt(0);
    else if (!m) key = lower.codePointAt(0)!;
  }
  return { key, scan, repeat: e.repeat, shift: e.shiftKey, ctrl: e.ctrlKey || e.metaKey, alt: e.altKey };
}

/** the text an SDL_TEXTINPUT event would carry for this key, or '' */
export function textInputOf(e: { key: string; ctrlKey: boolean; metaKey: boolean; altKey: boolean }): string {
  if (e.ctrlKey || e.metaKey) return '';
  if ([...e.key].length !== 1) return '';
  return e.key;
}

// ---- Platform ----

const t0 = typeof performance !== 'undefined' ? performance.now() : Date.now();
let timeSource: () => number = () => (typeof performance !== 'undefined' ? performance.now() : Date.now()) - t0;
/** Platform::GetTime / GetTicks: milliseconds */
export function GetTicks(): number {
  return Math.floor(timeSource());
}
/** tests set a fake clock */
export function SetTimeSource(f: () => number): void {
  timeSource = f;
}

let clipboardText = '';
/** ClipboardPush: kept in memory and offered to the browser's clipboard */
export function ClipboardPush(text: string): void {
  clipboardText = text;
  try {
    void navigator.clipboard?.writeText(text).catch(() => {});
  } catch { /* no clipboard */ }
}
/** ClipboardPull: the last text pushed or pasted (the paste event updates it, see index.ts) */
export function ClipboardPull(): string {
  return clipboardText;
}
export function SetClipboardText(text: string): void {
  clipboardText = text;
}

/** Platform::OpenURI */
export function OpenURI(uri: string): void {
  try {
    window.open(uri, '_blank', 'noopener');
  } catch { /* headless */ }
}
