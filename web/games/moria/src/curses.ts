// The part of curses that Umoria uses (src/ui_io.cpp), with ncurses' rules for writing a window, on
// 80x24 windows in memory: the same rules as the test oracle's recording curses
// (re/moria/oracle/curses_stub.cpp). waddch writes a control character as ^X, '\n' clears to the end
// of the line and goes to the next one, a character in the last column wraps, the bottom-right cell is
// written but the call fails (ERR); waddnstr stops at the first ERR; overwrite() copies the text but not
// the cursor. The platform shows stdscr when the program reads a key or refreshes.
import { platform } from './platform.ts';
import { onReset } from './reset.ts';

export const ERR = -1;
export const OK = 0;
export const LINES = 24;
export const COLS = 80;

export class Window {
  cury = 0;
  curx = 0;
  /** char codes, [row][column] */
  readonly text: Uint8Array[] = Array.from({ length: LINES }, () => new Uint8Array(COLS).fill(32));

  /** A row as text. */
  row(y: number): string {
    return String.fromCharCode(...this.text[y]);
  }

  clearLine(y: number, from: number): void {
    this.text[y].fill(32, from);
  }
}

export let stdscr = new Window();
export let curscr = new Window();

onReset(() => {
  stdscr = new Window();
  curscr = new Window();
});

export function newwin(): Window {
  return new Window();
}

/** copywin(src, dst, ..., FALSE) of the whole window: the text, not the cursor */
export function overwrite(src: Window, dst: Window): number {
  for (let y = 0; y < LINES; y++) dst.text[y].set(src.text[y]);
  return OK;
}

export function clear(): number {
  for (let y = 0; y < LINES; y++) stdscr.clearLine(y, 0);
  stdscr.cury = stdscr.curx = 0;
  return OK;
}

export function clrtoeol(): number {
  stdscr.clearLine(stdscr.cury, stdscr.curx);
  return OK;
}

export function clrtobot(): number {
  stdscr.clearLine(stdscr.cury, stdscr.curx);
  for (let y = stdscr.cury + 1; y < LINES; y++) stdscr.clearLine(y, 0);
  return OK;
}

export function move(y: number, x: number): number {
  if (y < 0 || y >= LINES || x < 0 || x >= COLS) return ERR;
  stdscr.cury = y;
  stdscr.curx = x;
  return OK;
}

/** getyx(stdscr, y, x) */
export function getyx(w: Window = stdscr): { y: number; x: number } {
  return { y: w.cury, x: w.curx };
}

// waddch_literal: the cell, then the cursor; at the right edge it wraps (wrap_to_next_line), at the
// bottom-right cell (no scrollok) the cursor stays and the call fails
function addLiteral(w: Window, c: number): number {
  w.text[w.cury][w.curx] = c;
  if (w.curx + 1 < COLS) {
    w.curx++;
    return OK;
  }
  if (w.cury + 1 >= LINES) {
    w.curx = COLS - 1;
    return ERR;
  }
  w.cury++;
  w.curx = 0;
  return OK;
}

// waddch_nosync for a plain character (no attributes) in the C locale
function addChar(w: Window, c: number): number {
  c &= 0xff;
  if (c >= 0x20 && c < 0x7f) return addLiteral(w, c);
  switch (c) {
    case 9: { // '\t'
      const x = w.curx + (8 - (w.curx % 8));
      if (x <= COLS - 1 || w.cury === LINES - 1) {
        while (w.curx < x) if (addLiteral(w, 32) === ERR) return ERR;
        return OK;
      }
      w.clearLine(w.cury, w.curx);
      if (w.cury + 1 >= LINES) w.curx = COLS - 1;
      else {
        w.cury++;
        w.curx = 0;
      }
      return OK;
    }
    case 10: // '\n'
      w.clearLine(w.cury, w.curx);
      if (w.cury + 1 >= LINES) return ERR;
      w.cury++;
      w.curx = 0;
      return OK;
    case 13: // '\r'
      w.curx = 0;
      return OK;
    case 8: // '\b'
      if (w.curx > 0) w.curx--;
      return OK;
    default:
      break;
  }
  // unctrl(): ^@ .. ^_, ^? ; M-x for the upper half
  const s: number[] = [];
  if (c >= 0x80) {
    s.push(77, 45); // "M-"
    c &= 0x7f;
  }
  if (c < 0x20) s.push(94, c + 64);
  else if (c === 0x7f) s.push(94, 63);
  else s.push(c);
  for (const b of s) if (addLiteral(w, b) === ERR) return ERR;
  return OK;
}

const byte = (ch: string | number): number => (typeof ch === 'number' ? ch : ch.length ? ch.charCodeAt(0) : 0);

export function addch(ch: string | number): number {
  return addChar(stdscr, byte(ch));
}

export function mvaddch(y: number, x: number, ch: string | number): number {
  if (move(y, x) === ERR) return ERR;
  return addch(ch);
}

/** waddnstr(stdscr, str, -1): up to the first NUL or ERR */
export function addstr(str: string): number {
  for (let i = 0; i < str.length; i++) {
    const c = str.charCodeAt(i);
    if (c === 0) break;
    if (addChar(stdscr, c) === ERR) return ERR;
  }
  return OK;
}

export function mvaddstr(y: number, x: number, str: string): number {
  if (move(y, x) === ERR) return ERR;
  return addstr(str);
}

/** refresh(): the platform may show the screen now. */
export function refresh(): Promise<void> {
  return platform().refresh(stdscr);
}

/** getch(): shows stdscr and returns the next key's byte. */
export function getch(): Promise<number> {
  return platform().getch(stdscr);
}
