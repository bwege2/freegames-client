// imlib/keys.cpp: the engine's key codes (below 256 they are the characters)
export const JK_BACKSPACE = 8, JK_TAB = 9, JK_ENTER = 13, JK_ESC = 27, JK_SPACE = 32, JK_UP = 256, JK_DOWN = 257,
  JK_LEFT = 258, JK_RIGHT = 259, JK_CTRL_L = 260, JK_CTRL_R = 261, JK_ALT_L = 262, JK_ALT_R = 263, JK_SHIFT_L = 264,
  JK_SHIFT_R = 265, JK_CAPS = 266, JK_NUM_LOCK = 267, JK_HOME = 268, JK_END = 269, JK_DEL = 270, JK_F1 = 271,
  JK_F2 = 272, JK_F3 = 273, JK_F4 = 274, JK_F5 = 275, JK_F6 = 276, JK_F7 = 277, JK_F8 = 278, JK_F9 = 279,
  JK_F10 = 280, JK_INSERT = 281, JK_PAGEUP = 282, JK_PAGEDOWN = 283, JK_COMMAND = 284, JK_MAX_KEY = 284;

const jk_key_names = ['Up Arrow', 'Down Arrow', 'Left Arrow', 'Right Arrow', 'Left Ctrl', 'Right Ctrl', 'Left Alt',
  'Right Alt', 'Left Shift', 'Right Shift', 'Caps Lock', 'Num Lock', 'Home', 'End', 'Del', 'F1', 'F2', 'F3', 'F4',
  'F5', 'F6', 'F7', 'F8', 'F9', 'F10', 'Insert', 'PageUp', 'PageDown', 'Command'];

export function key_name(key: number): string {
  if (key > 255 && key <= JK_MAX_KEY) return jk_key_names[key - 256];
  if (key === JK_BACKSPACE) return 'Backspace';
  if (key === JK_TAB) return 'Tab';
  if (key === JK_ENTER) return 'Enter';
  if (key === JK_ESC) return 'Esc';
  if (key === JK_SPACE) return 'Space';
  if (key >= 32 && key < 127) return String.fromCharCode(key);
  return '';
}

const VALUES: [string, number][] = [['Backspace', JK_BACKSPACE], ['Tab', JK_TAB], ['Enter', JK_ENTER], ['ESC', JK_ESC],
  ['Space', JK_SPACE], ['Up', JK_UP], ['Down', JK_DOWN], ['Left', JK_LEFT], ['Right', JK_RIGHT], ['CTRL_L', JK_CTRL_L],
  ['CTRL_R', JK_CTRL_R], ['ALT_L', JK_ALT_L], ['ALT_R', JK_ALT_R], ['SHIFT_L', JK_SHIFT_L], ['SHIFT_R', JK_SHIFT_R],
  ['Caps', JK_CAPS], ['Num_Lock', JK_NUM_LOCK], ['Home', JK_HOME], ['End', JK_END], ['Del', JK_DEL], ['F1', JK_F1],
  ['F2', JK_F2], ['F3', JK_F3], ['F4', JK_F4], ['F5', JK_F5], ['F6', JK_F6], ['F7', JK_F7], ['F8', JK_F8], ['F9', JK_F9],
  ['F10', JK_F10], ['Insert', JK_INSERT], ['PageUp', JK_PAGEUP], ['PageDown', JK_PAGEDOWN]];

export function key_value(buffer: string): number {
  for (const [n, v] of VALUES) if (n.toLowerCase() === buffer.toLowerCase()) return v;
  return buffer.length ? (buffer.charCodeAt(0) << 24) >> 24 : 0;
}
