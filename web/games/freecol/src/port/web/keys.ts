// The page's keys as Java's key codes (java.awt.event.KeyEvent.VK_*) and key locations, as the JDK's X11
// toolkit maps a PC keyboard's keys.

const CODES: Record<string, number> = {
  Enter: 10, NumpadEnter: 10, Backspace: 8, Tab: 9, Escape: 27, Space: 32, Delete: 127, Insert: 155,
  Home: 36, End: 35, PageUp: 33, PageDown: 34, ArrowLeft: 37, ArrowUp: 38, ArrowRight: 39, ArrowDown: 40,
  ShiftLeft: 16, ShiftRight: 16, ControlLeft: 17, ControlRight: 17, AltLeft: 18, AltRight: 65406, MetaLeft: 157,
  MetaRight: 157, CapsLock: 20, NumLock: 144, ScrollLock: 145, Pause: 19, PrintScreen: 154, ContextMenu: 525,
  Comma: 44, Period: 46, Slash: 47, Semicolon: 59, Equal: 61, Minus: 45, BracketLeft: 91, Backslash: 92,
  BracketRight: 93, Quote: 222, Backquote: 192, IntlBackslash: 153,
  NumpadMultiply: 106, NumpadAdd: 107, NumpadSubtract: 109, NumpadDecimal: 110, NumpadDivide: 111,
};

/** VK_ code of a key (by its physical position, as X11's keycodes), 0 if Java has none. */
export function javaKeyCode(code: string, numLock: boolean): number {
  if (/^Key[A-Z]$/.test(code)) return code.charCodeAt(3);
  if (/^Digit[0-9]$/.test(code)) return code.charCodeAt(5);
  const f = /^F([0-9]{1,2})$/.exec(code);
  if (f) {
    const n = +f[1];
    return n <= 12 ? 111 + n : 61440 + n - 13; // VK_F1 = 112, VK_F13 = 0xF000
  }
  const np = /^Numpad([0-9])$/.exec(code);
  if (np) {
    if (numLock) return 96 + +np[1];
    return [155, 35, 225, 34, 226, 65368, 227, 36, 224, 33][+np[1]]; // as X11 without Num Lock: KP_Insert, KP_End, ...
  }
  if (code === 'NumpadDecimal' && !numLock) return 127;
  return CODES[code] ?? 0;
}

/** KeyEvent.KEY_LOCATION_*: 1 standard, 2 left, 3 right, 4 numpad. */
export function javaKeyLocation(code: string): number {
  if (code.startsWith('Numpad')) return 4;
  if (code.endsWith('Left') && /^(Shift|Control|Alt|Meta)/.test(code)) return 2;
  if (code.endsWith('Right') && /^(Shift|Control|Alt|Meta)/.test(code)) return 3;
  return 1;
}
