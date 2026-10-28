// The C64 keyboard on a PC keyboard: what PETSCII code the KERNAL's keyboard scan would have put in
// its buffer. Function keys F1-F8 are the C64's (F2, F4, F6, F8 are its shifted F1, F3, F5, F7), Esc is
// RUN/STOP, Backspace INST/DEL, Home CLR/HOME, the arrows the cursor keys; letters are the C64's
// unshifted letters (with Shift its graphics characters), digits and punctuation as printed.

const FKEYS: Record<string, number> = { F1: 0x85, F3: 0x86, F5: 0x87, F7: 0x88, F2: 0x89, F4: 0x8a, F6: 0x8b, F8: 0x8c };
const SPECIAL: Record<string, number> = {
  Escape: 0x03, Enter: 0x0d, Backspace: 0x14, Delete: 0x14, Insert: 0x94, Home: 0x13,
  ArrowDown: 0x11, ArrowUp: 0x91, ArrowRight: 0x1d, ArrowLeft: 0x9d, ' ': 0x20,
};
/** keys the C64 repeats while held */
export const REPEATS = new Set([0x20, 0x14, 0x94, 0x11, 0x91, 0x1d, 0x9d]);

export function petscii(e: { key: string; shiftKey: boolean; ctrlKey: boolean; altKey: boolean; metaKey: boolean }): number | null {
  if (e.ctrlKey || e.metaKey) return null;
  if (e.key in FKEYS) return FKEYS[e.key];
  if (e.key === 'Home' && e.shiftKey) return 0x93;
  if (e.key in SPECIAL) return SPECIAL[e.key];
  if (e.key.length !== 1) return null;
  const c = e.key.charCodeAt(0);
  if ((c >= 0x41 && c <= 0x5a) || (c >= 0x61 && c <= 0x7a)) return ((c & 0xdf) | (e.shiftKey ? 0x80 : 0)) & 0xff;
  if (c >= 0x20 && c <= 0x5d) return c;
  if (e.key === '£' || e.key === '\\') return 0x5c;
  if (e.key === '^') return 0x5e;
  if (e.key === '_') return 0x5f;
  return null;
}
