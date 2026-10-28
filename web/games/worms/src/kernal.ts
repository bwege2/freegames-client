// The parts of the Commodore 64 KERNAL that Worms? goes through, as its RAM variables say they work
// (re/worms/NOTES.md "The KERNAL"): the screen editor's CHROUT ($FFD2: print at the cursor $D1/$D3 in
// the colour at $0286), the keyboard buffer ($0277, 10 keys, count in $C6) that the IRQ's keyboard scan
// fills and GETIN ($FFE4) empties, and the jiffy clock ($A0-$A2). This is the machine the program ran
// on, not the program: the port (machine.ts) and the test harness that runs the original Forth on a
// 6502 (test/c64.ts) share it.

/** A C64 address space as the KERNAL sees it. */
export interface Bus {
  peek(addr: number): number;
  poke(addr: number, v: number): void;
}

export const SCREEN = 0x0400;
export const COLOR_RAM = 0xd800;
/** keyboard buffer and its fill count */
export const KEYD = 0x0277;
export const NDX = 0xc6;
/** maximum keys in the buffer (XMAX, $0289) */
export const XMAX = 10;
/** current screen line address, cursor column, cursor row */
export const PNT = 0xd1;
export const PNTR = 0xd3;
export const TBLX = 0xd6;
/** text colour for printing */
export const COLOR = 0x0286;
/** reverse on, quote mode */
export const RVS = 0xc7;
export const QTSW = 0xd4;
/** jiffy clock, most significant byte first */
export const TIME = 0xa0;

/** PETSCII colour codes and the colour they select (CHROUT) */
const COLOR_CODES: Record<number, number> = {
  0x90: 0, 0x05: 1, 0x1c: 2, 0x9f: 3, 0x9c: 4, 0x1e: 5, 0x1f: 6, 0x9e: 7,
  0x81: 8, 0x95: 9, 0x96: 10, 0x97: 11, 0x98: 12, 0x99: 13, 0x9a: 14, 0x9b: 15,
};

/** The screen code CHROUT puts on the screen for a printable PETSCII character (upper case set). */
export function petsciiToScreen(c: number): number {
  c &= 0xff;
  if (c < 0x80) {
    if (c >= 0x60) return c & 0xdf;
    return c & 0x3f;
  }
  let v = c & 0x7f;
  if (v === 0x7f) v = 0x5e; // pi
  return v | 0x40;
}

function isControl(c: number): boolean {
  return (c & 0x7f) < 0x20;
}

function lineAddr(m: Bus): number {
  return m.peek(PNT) | (m.peek(PNT + 1) << 8);
}

/** Puts the cursor at column x of row y, as the program's XY! does ($D3, $D6 and the line address $D1). */
export function setCursor(m: Bus, x: number, y: number): void {
  m.poke(TBLX, y);
  const a = SCREEN + y * 40;
  m.poke(PNT, a & 0xff);
  m.poke(PNT + 1, a >> 8);
  m.poke(PNTR, x);
}

function scrollUp(m: Bus): void {
  for (let i = 0; i < 24 * 40; i++) {
    m.poke(SCREEN + i, m.peek(SCREEN + i + 40));
    m.poke(COLOR_RAM + i, m.peek(COLOR_RAM + i + 40));
  }
  const color = m.peek(COLOR);
  for (let i = 24 * 40; i < 1000; i++) {
    m.poke(SCREEN + i, 0x20);
    m.poke(COLOR_RAM + i, color);
  }
}

function nextLine(m: Bus): void {
  let y = m.peek(TBLX) + 1;
  if (y > 24) {
    scrollUp(m);
    y = 24;
  }
  setCursor(m, 0, y);
}

/** CHROUT on the screen. */
export function chrout(m: Bus, c: number): void {
  c &= 0xff;
  const quote = m.peek(QTSW) !== 0;
  if (c === 0x0d || c === 0x8d) {
    m.poke(RVS, 0);
    m.poke(QTSW, 0);
    nextLine(m);
    return;
  }
  if (c === 0x14) {
    del(m);
    return;
  }
  if (isControl(c) && !quote) {
    control(m, c);
    return;
  }
  if (c === 0x22) m.poke(QTSW, quote ? 0 : 1);
  // in quote mode a control code prints as its reversed symbol
  let code = isControl(c) ? ((c & 0x80 ? (c & 0x7f) + 0x40 : c + 0x40) | 0x80) : petsciiToScreen(c);
  if (m.peek(RVS)) code |= 0x80;
  put(m, code);
}

/** Writes a screen code with the current colour at the cursor and advances the cursor. */
function put(m: Bus, code: number): void {
  const x = m.peek(PNTR);
  const a = lineAddr(m) + x;
  m.poke(a, code & 0xff);
  m.poke(COLOR_RAM + (a - SCREEN), m.peek(COLOR));
  if (x >= 39) nextLine(m);
  else m.poke(PNTR, x + 1);
}

function control(m: Bus, c: number): void {
  const x = m.peek(PNTR), y = m.peek(TBLX);
  if (c in COLOR_CODES) {
    m.poke(COLOR, COLOR_CODES[c]);
    return;
  }
  switch (c) {
    case 0x93: // CLR: clear the screen (colour RAM in the text colour) and home
      for (let i = 0; i < 1000; i++) {
        m.poke(SCREEN + i, 0x20);
        m.poke(COLOR_RAM + i, m.peek(COLOR));
      }
      setCursor(m, 0, 0);
      return;
    case 0x13: setCursor(m, 0, 0); return;
    case 0x12: m.poke(RVS, 1); return;
    case 0x92: m.poke(RVS, 0); return;
    case 0x11: if (y < 24) setCursor(m, x, y + 1); else { scrollUp(m); setCursor(m, x, 24); } return;
    case 0x91: if (y > 0) setCursor(m, x, y - 1); return;
    case 0x1d: if (x < 39) m.poke(PNTR, x + 1); else nextLine(m); return;
    case 0x9d: if (x > 0) m.poke(PNTR, x - 1); else if (y > 0) setCursor(m, 39, y - 1); return;
    default: return; // the rest (bell, lock, tab, ...) do nothing on the screen
  }
}

/** INST/DEL: the character left of the cursor goes, the rest of the line moves left. */
function del(m: Bus): void {
  const x = m.peek(PNTR);
  if (x === 0) return;
  const base = lineAddr(m);
  for (let i = x - 1; i < 39; i++) {
    m.poke(base + i, m.peek(base + i + 1));
    m.poke(COLOR_RAM + (base - SCREEN) + i, m.peek(COLOR_RAM + (base - SCREEN) + i + 1));
  }
  m.poke(base + 39, 0x20);
  m.poke(COLOR_RAM + (base - SCREEN) + 39, m.peek(COLOR));
  m.poke(PNTR, x - 1);
}

/** GETIN from the keyboard: the first key of the buffer, or 0. */
export function getin(m: Bus): number {
  const n = m.peek(NDX);
  if (n === 0) return 0;
  const c = m.peek(KEYD);
  for (let i = 0; i < n - 1; i++) m.poke(KEYD + i, m.peek(KEYD + i + 1));
  m.poke(NDX, n - 1);
  return c;
}

/** The keyboard scan found a key: into the buffer, unless it is full. */
export function keyIn(m: Bus, c: number): boolean {
  const n = m.peek(NDX);
  if (n >= XMAX) return false;
  m.poke(KEYD + n, c & 0xff);
  m.poke(NDX, n + 1);
  return true;
}

/** UDTIM: one jiffy (1/60 s) on the clock at $A0-$A2. */
export function jiffy(m: Bus): void {
  let t = ((m.peek(TIME) << 16) | (m.peek(TIME + 1) << 8) | m.peek(TIME + 2)) + 1;
  if (t >= 0x4f1a01) t = 0; // 24 hours
  m.poke(TIME, (t >> 16) & 0xff);
  m.poke(TIME + 1, (t >> 8) & 0xff);
  m.poke(TIME + 2, t & 0xff);
}
