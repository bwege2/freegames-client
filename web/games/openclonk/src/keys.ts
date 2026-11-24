// OpenClonk in the browser: the keyboard as the original's SDL build reads it. platform/C4AppSDL.cpp turns an SDL
// key event into Game.DoKeyboardInput(sdl_scancode_to_keycode(scancode), KEYEV_Down/KEYEV_Up, alt, ctrl, shift,
// repeat, nullptr). An SDL scancode is the key's place on the keyboard (USB HID usage), as KeyboardEvent.code is in
// the browser, so a browser code maps to the SDL scancode of the same key, that to the engine's K_ code by the
// original's table (SDL_SCANCODE_KEYCODE in C4AppSDL.cpp), and the K_ code is found by its name in the original's
// KeyCodeMap (gui/C4KeyboardInput.cpp) with C4KeyCodeEx::String2KeyCode, so the values are those of the build the
// engine was translated from. test/keys.test.ts checks every line against both tables of the original.

/** KeyboardEvent.code -> the KeyCodeMap name of the K_ code the original's SDL build gives that key */
export const KEY_NAMES: Readonly<Record<string, string>> = {
  ShiftLeft: 'LeftShift', ShiftRight: 'RightShift', ControlLeft: 'LeftControl', ControlRight: 'RightControl',
  AltLeft: 'LeftAlt', AltRight: 'RightAlt',
  F1: 'F1', F2: 'F2', F3: 'F3', F4: 'F4', F5: 'F5', F6: 'F6', F7: 'F7', F8: 'F8', F9: 'F9', F10: 'F10', F11: 'F11', F12: 'F12',
  NumpadAdd: 'Add', NumpadSubtract: 'Subtract', NumpadMultiply: 'Multiply',
  Escape: 'Escape', Pause: 'Pause', Tab: 'Tab', Enter: 'Return', Delete: 'Delete', Insert: 'Insert', Backspace: 'BackSpace',
  Space: 'Space', ArrowUp: 'Up', ArrowDown: 'Down', ArrowLeft: 'Left', ArrowRight: 'Right', Home: 'Home', End: 'End',
  ScrollLock: 'ScrollLock', PageUp: 'PageUp', PageDown: 'PageDown',
  Digit1: '1', Digit2: '2', Digit3: '3', Digit4: '4', Digit5: '5', Digit6: '6', Digit7: '7', Digit8: '8', Digit9: '9', Digit0: '0',
  KeyA: 'A', KeyB: 'B', KeyC: 'C', KeyD: 'D', KeyE: 'E', KeyF: 'F', KeyG: 'G', KeyH: 'H', KeyI: 'I', KeyJ: 'J', KeyK: 'K',
  KeyL: 'L', KeyM: 'M', KeyN: 'N', KeyO: 'O', KeyP: 'P', KeyQ: 'Q', KeyR: 'R', KeyS: 'S', KeyT: 'T', KeyU: 'U', KeyV: 'V',
  KeyW: 'W', KeyX: 'X', KeyY: 'Y', KeyZ: 'Z',
  Minus: 'Minus', Equal: 'Equal', BracketLeft: 'LeftBracket', BracketRight: 'RightBracket', Semicolon: 'Semicolon',
  Quote: 'Apostrophe', Backquote: 'GraveAccent', Backslash: 'Backslash', Comma: 'Comma', Period: 'Period', Slash: 'Slash',
  CapsLock: 'Capslock', NumLock: 'NumLock',
  Numpad7: 'Num7', Numpad8: 'Num8', Numpad9: 'Num9', Numpad4: 'Num4', Numpad5: 'Num5', Numpad6: 'Num6',
  Numpad1: 'Num1', Numpad2: 'Num2', Numpad3: 'Num3', Numpad0: 'Num0', NumpadDecimal: 'Decimal',
  IntlBackslash: '|<>', NumpadEnter: 'NumReturn', NumpadDivide: 'Divide',
  MetaLeft: 'LeftWin', MetaRight: 'RightWin', OSLeft: 'LeftWin', OSRight: 'RightWin', PrintScreen: 'Print',
};

/** C4KeyEventType (gui/C4KeyboardInput.h) */
export const KEYEV_Down = 1;
export const KEYEV_Up = 2;

/** keys the browser would act on itself (scrolling, find, the context menu); the page takes them for the game */
const BROWSER_KEYS = new Set(['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Space', 'PageUp', 'PageDown', 'Home', 'End',
  'Tab', 'Slash', 'Quote', 'Backspace', 'F1', 'F3', 'F6', 'F7', 'F10', 'ContextMenu']);

/** whether the page should call preventDefault() for this key (the browser's own use of it) */
export function isBrowserKey(code: string, ctrl: boolean): boolean {
  if (ctrl) return ['KeyF', 'KeyG', 'KeyS', 'KeyP', 'KeyO', 'KeyD', 'KeyH', 'KeyJ', 'KeyU'].includes(code);
  return BROWSER_KEYS.has(code);
}

/**
 * The engine's key code of a browser key, or null for keys the original's SDL table does not have (they are
 * 0 there: sdl_scancode_to_keycode's default). `toKeyCode` is the engine's C4KeyCodeEx::String2KeyCode on a name.
 */
export function engineKeyCode(code: string, toKeyCode: (name: string) => number | null): number | null {
  const name = KEY_NAMES[code];
  return name ? toKeyCode(name) : null;
}
