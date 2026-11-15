// al/keyboard.ts: Allegro 4.4's keyboard (src/keyboard.c) as the X11 driver feeds it: the key[] array,
// the 64-key buffer, key_shifts, _handle_key_press/_handle_key_release, and the scancodes
// (include/allegro/keyboard.h). The page's key events are turned into the X11 driver's calls by
// keyFromDom().

import { sys } from './sys.ts';

export const KEY_A = 1, KEY_B = 2, KEY_C = 3, KEY_D = 4, KEY_E = 5, KEY_F = 6, KEY_G = 7, KEY_H = 8,
  KEY_I = 9, KEY_J = 10, KEY_K = 11, KEY_L = 12, KEY_M = 13, KEY_N = 14, KEY_O = 15, KEY_P = 16,
  KEY_Q = 17, KEY_R = 18, KEY_S = 19, KEY_T = 20, KEY_U = 21, KEY_V = 22, KEY_W = 23, KEY_X = 24,
  KEY_Y = 25, KEY_Z = 26, KEY_0 = 27, KEY_1 = 28, KEY_2 = 29, KEY_3 = 30, KEY_4 = 31, KEY_5 = 32,
  KEY_6 = 33, KEY_7 = 34, KEY_8 = 35, KEY_9 = 36, KEY_0_PAD = 37, KEY_1_PAD = 38, KEY_2_PAD = 39,
  KEY_3_PAD = 40, KEY_4_PAD = 41, KEY_5_PAD = 42, KEY_6_PAD = 43, KEY_7_PAD = 44, KEY_8_PAD = 45,
  KEY_9_PAD = 46, KEY_F1 = 47, KEY_F2 = 48, KEY_F3 = 49, KEY_F4 = 50, KEY_F5 = 51, KEY_F6 = 52,
  KEY_F7 = 53, KEY_F8 = 54, KEY_F9 = 55, KEY_F10 = 56, KEY_F11 = 57, KEY_F12 = 58, KEY_ESC = 59,
  KEY_TILDE = 60, KEY_MINUS = 61, KEY_EQUALS = 62, KEY_BACKSPACE = 63, KEY_TAB = 64,
  KEY_OPENBRACE = 65, KEY_CLOSEBRACE = 66, KEY_ENTER = 67, KEY_COLON = 68, KEY_QUOTE = 69,
  KEY_BACKSLASH = 70, KEY_BACKSLASH2 = 71, KEY_COMMA = 72, KEY_STOP = 73, KEY_SLASH = 74,
  KEY_SPACE = 75, KEY_INSERT = 76, KEY_DEL = 77, KEY_HOME = 78, KEY_END = 79, KEY_PGUP = 80,
  KEY_PGDN = 81, KEY_LEFT = 82, KEY_RIGHT = 83, KEY_UP = 84, KEY_DOWN = 85, KEY_SLASH_PAD = 86,
  KEY_ASTERISK = 87, KEY_MINUS_PAD = 88, KEY_PLUS_PAD = 89, KEY_DEL_PAD = 90, KEY_ENTER_PAD = 91,
  KEY_PRTSCR = 92, KEY_PAUSE = 93, KEY_ABNT_C1 = 94, KEY_YEN = 95, KEY_KANA = 96, KEY_CONVERT = 97,
  KEY_NOCONVERT = 98, KEY_AT = 99, KEY_CIRCUMFLEX = 100, KEY_COLON2 = 101, KEY_KANJI = 102,
  KEY_EQUALS_PAD = 103, KEY_BACKQUOTE = 104, KEY_SEMICOLON = 105, KEY_COMMAND = 106,
  KEY_MODIFIERS = 115, KEY_LSHIFT = 115, KEY_RSHIFT = 116, KEY_LCONTROL = 117, KEY_RCONTROL = 118,
  KEY_ALT = 119, KEY_ALTGR = 120, KEY_LWIN = 121, KEY_RWIN = 122, KEY_MENU = 123, KEY_SCRLOCK = 124,
  KEY_NUMLOCK = 125, KEY_CAPSLOCK = 126, KEY_MAX = 127;

export const KB_SHIFT_FLAG = 0x0001, KB_CTRL_FLAG = 0x0002, KB_ALT_FLAG = 0x0004;
export const KB_NORMAL = 1, KB_EXTENDED = 2;

const KEY_BUFFER_SIZE = 64;

/** key[]: -1 (all bits) while held, as _handle_key_press sets it */
export const key = new Int8Array(KEY_MAX + 1);
export let key_shifts = 0;
let installed = false;
const bufKey = new Int32Array(KEY_BUFFER_SIZE);
const bufScan = new Int32Array(KEY_BUFFER_SIZE);
let bufStart = 0;
let bufEnd = 0;

function add_key(keycode: number, scancode: number): void {
  let c = bufEnd + 1;
  if (c >= KEY_BUFFER_SIZE) c = 0;
  if (c !== bufStart) {
    bufKey[bufEnd] = keycode;
    bufScan[bufEnd] = scancode;
    bufEnd = c;
  }
}

function update_shifts(): void {
  let s = 0;
  if (key[KEY_LSHIFT] || key[KEY_RSHIFT]) s |= KB_SHIFT_FLAG;
  if (key[KEY_LCONTROL] || key[KEY_RCONTROL]) s |= KB_CTRL_FLAG;
  if (key[KEY_ALT] || key[KEY_ALTGR]) s |= KB_ALT_FLAG;
  key_shifts = s;
}

/** _handle_key_press (repeat_delay is 250, so a held key adds to the buffer again) */
export function _handle_key_press(keycode: number, scancode: number): void {
  if (!installed) return;
  if (scancode > 0) key[scancode] = -1;
  if (keycode >= 0) add_key(keycode, scancode);
  update_shifts();
}

export function _handle_key_release(scancode: number): void {
  if (!installed) return;
  key[scancode] = 0;
  update_shifts();
}

export function clear_keybuf(): void {
  bufStart = bufEnd = 0;
}

function clear_key(): void {
  key.fill(0);
}

export function install_keyboard(): number {
  if (installed) return 0;
  clear_keybuf();
  clear_key();
  installed = true;
  return 0;
}

export function remove_keyboard(): void {
  if (!installed) return;
  installed = false;
  clear_keybuf();
  clear_key();
  key_shifts = 0;
}

/** keypressed() as Allegro has it, without moving the clock (the GUI's own calls) */
export function keypressedRaw(): boolean {
  return bufStart !== bufEnd;
}

/** keypressed() called from Liquid War's code: the clock moves 1 us (oracle.c) */
export async function keypressed(): Promise<boolean> {
  await sys.advance(1);
  return bufStart !== bufEnd;
}

/** ureadkey: only called with a key in the buffer (the original would wait in rest(1)) */
export function ureadkey(): { ascii: number; scan: number } {
  if (bufStart === bufEnd) return { ascii: 0, scan: 0 };
  const ascii = bufKey[bufStart]!;
  const scan = bufScan[bufStart]!;
  bufStart = bufStart < KEY_BUFFER_SIZE - 1 ? bufStart + 1 : 0;
  return { ascii, scan };
}

export function readkey(): number {
  const { ascii, scan } = ureadkey();
  return (ascii <= 0xff ? ascii : 0x5e) | (scan << 8);
}

/** the names the sessions (test/sessions) and the oracle use */
export const KEY_NAMES: Record<string, [number, number]> = {};
{
  const add = (name: string, sc: number, ascii: number): void => {
    KEY_NAMES[name] = [sc, ascii];
  };
  for (let i = 0; i < 26; i++) add(String.fromCharCode(65 + i), KEY_A + i, 97 + i);
  for (let i = 0; i < 10; i++) add(String(i), KEY_0 + i, 48 + i);
  for (let i = 0; i < 10; i++) add(`PAD${i}`, KEY_0_PAD + i, 48 + i);
  for (let i = 1; i <= 12; i++) add(`F${i}`, KEY_F1 + i - 1, 0);
  add('ESC', KEY_ESC, 27);
  add('MINUS', KEY_MINUS, 45);
  add('EQUALS', KEY_EQUALS, 61);
  add('BACKSPACE', KEY_BACKSPACE, 8);
  add('TAB', KEY_TAB, 9);
  add('ENTER', KEY_ENTER, 13);
  add('SPACE', KEY_SPACE, 32);
  add('COMMA', KEY_COMMA, 44);
  add('STOP', KEY_STOP, 46);
  add('SLASH', KEY_SLASH, 47);
  add('INSERT', KEY_INSERT, 0);
  add('DEL', KEY_DEL, 127);
  add('HOME', KEY_HOME, 0);
  add('END', KEY_END, 0);
  add('PGUP', KEY_PGUP, 0);
  add('PGDN', KEY_PGDN, 0);
  add('LEFT', KEY_LEFT, 0);
  add('RIGHT', KEY_RIGHT, 0);
  add('UP', KEY_UP, 0);
  add('DOWN', KEY_DOWN, 0);
  add('LSHIFT', KEY_LSHIFT, -1);
  add('RSHIFT', KEY_RSHIFT, -1);
  add('LCONTROL', KEY_LCONTROL, -1);
  add('ALT', KEY_ALT, -1);
}

// KeyboardEvent.code -> scancode, as Allegro's X11 driver maps a PC keyboard (src/x/xkeyboard.c)
const DOM_CODES: Record<string, number> = {
  Escape: KEY_ESC, Backquote: KEY_TILDE, Minus: KEY_MINUS, Equal: KEY_EQUALS, Backspace: KEY_BACKSPACE,
  Tab: KEY_TAB, BracketLeft: KEY_OPENBRACE, BracketRight: KEY_CLOSEBRACE, Enter: KEY_ENTER,
  Semicolon: KEY_COLON, Quote: KEY_QUOTE, Backslash: KEY_BACKSLASH, IntlBackslash: KEY_BACKSLASH2,
  Comma: KEY_COMMA, Period: KEY_STOP, Slash: KEY_SLASH, Space: KEY_SPACE, Insert: KEY_INSERT,
  Delete: KEY_DEL, Home: KEY_HOME, End: KEY_END, PageUp: KEY_PGUP, PageDown: KEY_PGDN,
  ArrowLeft: KEY_LEFT, ArrowRight: KEY_RIGHT, ArrowUp: KEY_UP, ArrowDown: KEY_DOWN,
  NumpadDivide: KEY_SLASH_PAD, NumpadMultiply: KEY_ASTERISK, NumpadSubtract: KEY_MINUS_PAD,
  NumpadAdd: KEY_PLUS_PAD, NumpadDecimal: KEY_DEL_PAD, NumpadEnter: KEY_ENTER_PAD,
  PrintScreen: KEY_PRTSCR, Pause: KEY_PAUSE, ShiftLeft: KEY_LSHIFT, ShiftRight: KEY_RSHIFT,
  ControlLeft: KEY_LCONTROL, ControlRight: KEY_RCONTROL, AltLeft: KEY_ALT, AltRight: KEY_ALTGR,
  MetaLeft: KEY_LWIN, MetaRight: KEY_RWIN, ContextMenu: KEY_MENU, ScrollLock: KEY_SCRLOCK,
  NumLock: KEY_NUMLOCK, CapsLock: KEY_CAPSLOCK, IntlYen: KEY_YEN, IntlRo: KEY_ABNT_C1,
};
for (let i = 0; i < 26; i++) DOM_CODES[`Key${String.fromCharCode(65 + i)}`] = KEY_A + i;
for (let i = 0; i < 10; i++) {
  DOM_CODES[`Digit${i}`] = KEY_0 + i;
  DOM_CODES[`Numpad${i}`] = KEY_0_PAD + i;
}
for (let i = 1; i <= 12; i++) DOM_CODES[`F${i}`] = KEY_F1 + i - 1;

/** the scancode and the character the X11 driver would pass for a page key event */
export function keyFromDom(e: KeyboardEvent): { scan: number; ascii: number } | null {
  const scan = DOM_CODES[e.code];
  if (!scan) return null;
  if (scan >= KEY_MODIFIERS) return { scan, ascii: -1 };
  let ascii = 0;
  if (e.key.length === 1) {
    const c = e.key.codePointAt(0)!;
    ascii = c;
  } else if (e.key === 'Escape') ascii = 27;
  else if (e.key === 'Enter') ascii = 13;
  else if (e.key === 'Backspace') ascii = 8;
  else if (e.key === 'Tab') ascii = 9;
  else if (e.key === 'Delete') ascii = 127;
  if (key_shifts & KB_ALT_FLAG) ascii = 0;
  return { scan, ascii };
}
