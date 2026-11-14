// Typing Warriors: GPL-3.0-or-later (LICENSE.md).
// Keyboard layouts as data (layouts.data.ts, generated), and what the game asks of them: which key
// and level types a character, which finger presses a key, and which layout a pressed key fits.
//
// What the browser tells about a key press: KeyboardEvent.code, the physical key ("KeyD", the same
// on every layout), and KeyboardEvent.key, the character the active layout made of it ("a" on Neo 2).
// It never tells the layout itself. A pair (code, character) either fits a layout (that key types
// that character on one of its levels) or not: that is all the detection here rests on.
import { LAYOUT_DATA } from './layouts.data.ts';

export interface LayoutData {
  id: string;
  name: string;
  about: string;
  /** "neo": levels 3 and 4 by Mod3 and Mod4; "standard": level 3 by AltGr */
  family: 'standard' | 'neo';
  /** the keyboard it is drawn on: ISO (a key next to left Shift, tall Enter) or ANSI */
  form: 'iso' | 'ansi';
  source: string;
  /** what reaches each level: ["", "Shift", "Mod3", "Mod4"] */
  levels: string[];
  /** the keys (codes) that hold level 3 and level 4 */
  mod3: string[];
  mod4: string[];
  /** code -> the character of each level ("" = none, "◌…" = a dead key) */
  keys: Record<string, string[]>;
}

export interface Layout extends LayoutData {
  /** character -> where it is typed (the lowest level that has it) */
  where: Map<string, { code: string; level: number }>;
}

export const DEAD = '◌';

function build(d: LayoutData): Layout {
  const where = new Map<string, { code: string; level: number }>();
  where.set(' ', { code: 'Space', level: 0 });
  for (let level = 0; level < 4; level++) {
    for (const [code, chars] of Object.entries(d.keys)) {
      // an ANSI keyboard has no key next to left Shift: what xkb puts there is typed elsewhere
      if (d.form === 'ansi' && code === 'IntlBackslash') continue;
      const c = chars[level];
      if (c && !c.startsWith(DEAD) && !where.has(c)) where.set(c, { code, level });
    }
  }
  return { ...d, where };
}

export const LAYOUTS: Layout[] = LAYOUT_DATA.map(build);
export const layoutById = (id: string): Layout | undefined => LAYOUTS.find((l) => l.id === id);
export const DEFAULT_LAYOUT = 'qwertz';

/** The rows of the helper keyboard, as codes (without the keys only one form has). */
export const ROWS: string[][] = [
  ['Backquote', 'Digit1', 'Digit2', 'Digit3', 'Digit4', 'Digit5', 'Digit6', 'Digit7', 'Digit8', 'Digit9', 'Digit0', 'Minus', 'Equal'],
  ['KeyQ', 'KeyW', 'KeyE', 'KeyR', 'KeyT', 'KeyY', 'KeyU', 'KeyI', 'KeyO', 'KeyP', 'BracketLeft', 'BracketRight'],
  ['KeyA', 'KeyS', 'KeyD', 'KeyF', 'KeyG', 'KeyH', 'KeyJ', 'KeyK', 'KeyL', 'Semicolon', 'Quote'],
  ['KeyZ', 'KeyX', 'KeyC', 'KeyV', 'KeyB', 'KeyN', 'KeyM', 'Comma', 'Period', 'Slash'],
];

/** Fingers: 0..3 left little to index, 4..7 right index to little, 8 thumbs. */
export const FINGER_NAMES_EN = ['left little finger', 'left ring finger', 'left middle finger', 'left index finger',
  'right index finger', 'right middle finger', 'right ring finger', 'right little finger', 'thumb'];
export const FINGER_NAMES_DE = ['linker kleiner Finger', 'linker Ringfinger', 'linker Mittelfinger', 'linker Zeigefinger',
  'rechter Zeigefinger', 'rechter Mittelfinger', 'rechter Ringfinger', 'rechter kleiner Finger', 'Daumen'];

const COLUMN_FINGER = [0, 1, 2, 3, 3, 4, 4, 5, 6, 7, 7, 7, 7];
const FINGERS = new Map<string, number>();
// the number row sits half a key to the left of the letters: 1 and 2 are the little and ring finger's
ROWS[0].forEach((c, i) => FINGERS.set(c, COLUMN_FINGER[Math.max(0, i - 1)]));
for (const r of [1, 2, 3]) ROWS[r].forEach((c, i) => FINGERS.set(c, COLUMN_FINGER[i]));
FINGERS.set('Backslash', 7);
FINGERS.set('IntlBackslash', 0);
FINGERS.set('Space', 8);
FINGERS.set('ShiftLeft', 0);
FINGERS.set('ShiftRight', 7);
FINGERS.set('CapsLock', 0);
FINGERS.set('AltRight', 8);

/** the finger that presses a key in ten-finger typing */
export const fingerOf = (code: string): number => FINGERS.get(code) ?? 7;
/** true for a key of the left hand */
export const leftHand = (code: string): boolean => fingerOf(code) <= 3;

/** What it takes to type a character: the key, and the modifier keys to hold (as codes). */
export interface Stroke {
  code: string;
  level: number;
  hold: string[];
}

export function strokeFor(l: Layout, char: string): Stroke | null {
  const w = l.where.get(char);
  if (!w) return null;
  const left = leftHand(w.code);
  // a modifier is held with the other hand where there is one on each side
  const other = (codes: string[]) => {
    const fit = codes.filter((c) => leftHand(c) !== left);
    return fit[0] ?? codes[0];
  };
  let hold: string[] = [];
  if (w.level === 1) hold = [left ? 'ShiftRight' : 'ShiftLeft'];
  else if (w.level === 2) hold = l.mod3.length ? [other(l.mod3)] : [];
  else if (w.level === 3) hold = l.family === 'neo' ? (l.mod4.length ? [other(l.mod4)] : []) : [left ? 'ShiftRight' : 'ShiftLeft', 'AltRight'];
  return { code: w.code, level: w.level, hold };
}

/** The characters of a text that a layout cannot type. */
export function untypeable(l: Layout, text: string): string[] {
  const out = new Set<string>();
  for (const c of text) if (!l.where.has(c)) out.add(c);
  return [...out];
}

/** A key press as the game sees it: the character, and the physical key ("" when the browser gave none). */
export interface Key {
  char: string;
  code: string;
}

/**
 * Does this key press fit the layout? true: that key types that character on one of its levels.
 * false: it does not. null: nothing to go by (no code: a phone's keyboard, an input method; or a key
 * the layout data does not cover).
 */
export function fits(l: Layout, k: Key): boolean | null {
  if (!k.code) return null;
  if (k.code === 'Space') return k.char === ' ' ? null : false;
  const chars = l.keys[k.code];
  // a key that holds a level here (Neo's Mod3 and Mod4 on # and <) types no character
  if (!chars) return l.mod3.includes(k.code) || l.mod4.includes(k.code) ? false : null;
  return chars.includes(k.char);
}

/** Which of two layouts a key press was typed with. */
export type Which = 'a' | 'b' | 'both' | 'neither' | 'unknown';

export function whichOf(a: Layout, b: Layout, k: Key): Which {
  const fa = fits(a, k), fb = fits(b, k);
  if (fa === null || fb === null) return 'unknown';
  if (fa && fb) return 'both';
  if (fa) return 'a';
  if (fb) return 'b';
  return 'neither';
}

/**
 * Follows the keys of a session and says which layouts they fit. Layouts share keys (QWERTZ and
 * NeoQwertz have the same letters), so the answer is a set: every layout that all of the last
 * {@link LayoutDetector.WINDOW} informative keys fit.
 */
export class LayoutDetector {
  static readonly WINDOW = 12;
  private recent: Key[] = [];

  add(k: Key): void {
    // only keys the layout data covers say anything
    if (!k.code || !(k.code in LAYOUTS[0].keys) || k.char.length !== 1) return;
    this.recent.push(k);
    if (this.recent.length > LayoutDetector.WINDOW) this.recent.shift();
  }

  reset(): void {
    this.recent = [];
  }

  /** keys seen that say something */
  get seen(): number {
    return this.recent.length;
  }

  /** the layouts every recent key fits (all of them before the first key) */
  candidates(): Layout[] {
    return LAYOUTS.filter((l) => this.recent.every((k) => fits(l, k) !== false));
  }

  /**
   * What the keys say about one layout: "yes" (they all fit it), "no" (at least two do not, or one
   * of fewer than four), "open" (too little to say).
   */
  verdict(l: Layout): 'yes' | 'no' | 'open' {
    if (this.recent.length < 3) return 'open';
    const misses = this.recent.filter((k) => fits(l, k) === false).length;
    if (misses === 0) return 'yes';
    return misses >= 2 || this.recent.length < 4 ? 'no' : 'open';
  }
}

/** How many letter keys two layouts type differently: the keys that give a switch away. */
export function differingKeys(a: Layout, b: Layout): number {
  let n = 0;
  for (const row of ROWS.slice(1)) for (const code of row) if ((a.keys[code]?.[0] ?? '') !== (b.keys[code]?.[0] ?? '')) n++;
  return n;
}
