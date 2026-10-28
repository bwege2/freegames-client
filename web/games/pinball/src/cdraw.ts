// CDRAW.S, "rectangle and bitmap drawing routines": bitmaps (DRAWBITS, XOFFDRAW), rectangles
// (FRAMERECT, DRAWRECT, INRECT), the joystick cursor and menus (UPDATECRSR, DOMENU, SELECT), block
// moves (MOVEUP, MOVEDOWN), 16-bit helpers (ADDIYX ...) and the mini font (CHARTO, PRCHAR, PRINT).
//
// Translated routine by routine from Bill Budge's listing. The routines keep their zero page
// variables, and what the 6502 code keeps in its own instructions (the pen mode patches PMPATCH1-4,
// BITMAP, SHIFTOUT, SHIFTRESULT, CMOD1/CMOD2, the menu jump DOMNU6) stays at those addresses too.
import { SYM } from './image.ts';
import { PREAD, WAIT, button, cy, keyboard, m, setw, strobe, w, type Wait, type WaitFor } from './machine.ts';

const S = SYM.CDRAW;

// zero page (CDRAW.S equates)
export const PARAM = 0x00;
export const TEMP = 0x07;
export const XTEMP = 0x08;
export const YTEMP = 0x09;
const BASE1 = 0x10;
const BASE2 = 0x12;
const TEMPBITS = 0x14;
const VERT = 0x16;
const HDIV7 = 0x17;
const HMOD7 = 0x18;
const WIDTH = 0x19;
const HEIGHT = 0x1a;
const TEMPRECT = BASE2;
export const TOP = 0x14;
export const LFTDIV7 = 0x15;
export const LFTMOD7 = 0x16;
const LEFTEDGE = 0x17;
const LEFTMASK = 0x18;
export const BOTTOM = 0x19;
const RTDIV7 = 0x1a;
const RTMOD7 = 0x1b;
const RIGHTMASK = 0x1d;
const SBEGIN = 0x10;
const SEND = 0x12;
const DBEGIN = 0x14;
const DEND = DBEGIN;
const EXTRA = 0x16;
const TBASE = 0x1b;
export const CURSOR = 0x80;
export const CURSORY = 0x82;
export const CURSORXDIV7 = 0x83;
export const CURSORXMOD7 = 0x84;
const CURSORHEIGHT = 0x85;
const CURSORWIDTH = 0x86;
const CRSRXACC = 0x87;
const CRSRYACC = 0x88;
const NEWCURSORXDIV7 = 0x89;
const NEWCURSORXMOD7 = 0x8a;
const NEWCURSORY = 0x8b;
const CRSRRTSTOP = 0x8c;
const NEWITEM = 0x8d;
export const LASTITEM = 0x8f;

// the tables before the code (made by RUN2.S MAKETBLS)
export const SHFRSLT = 0x800;
export const SHFOUT = 0xe00;
export const DIV7 = 0x1400;
export const MOD7 = 0x1500;
export const LO = 0x1600;
export const HI = 0x16c0;

/** the hi-res row address of scan line y (LO,Y / HI,Y) */
export function rowAddr(y: number): number {
  return m[LO + y] | (m[HI + y] << 8);
}

// ---- bitmaps ----

/** GETBITS: a bitmap descriptor (pointer, row, column DIV7, MOD7, height, width) into BASE2 ... */
export function GETBITS(desc: number): void {
  cy('GETBITS');
  setw(TEMPBITS, desc);
  const d = desc;
  m[BASE2] = m[d];
  m[S.BITMAP] = m[d];
  m[BASE2 + 1] = m[(d + 1) & 0xffff];
  m[S.BITMAP + 1] = m[(d + 1) & 0xffff];
  m[VERT] = m[(d + 2) & 0xffff];
  m[HDIV7] = m[(d + 3) & 0xffff];
  m[HMOD7] = m[(d + 4) & 0xffff];
  m[HEIGHT] = m[(d + 5) & 0xffff];
  m[WIDTH] = (m[(d + 6) & 0xffff] - 1) & 0xff;
}

/** SETMODE: Y = pen mode (0 store, 1 grab, 2 xor, 3 clear, 4 or); patches the jumps */
export function SETMODE(y: number): void {
  m[S.PMPATCH1] = m[S.PTBL1 + y];
  m[S.PMPATCH2] = m[S.PTBL2 + y];
  m[S.PMPATCH3] = m[S.PTBL3 + y];
  m[S.PMPATCH4] = m[S.PTBL3 + y];
}

/** where a patched JMP/JSR goes: the patched low byte with the instruction's own high byte */
function patched(at: number): number {
  return m[at] | (m[at + 1] << 8);
}

/** DRAWBITS: draws a bitmap byte-aligned in the pen mode */
export function DRAWBITS(desc: number): void {
  GETBITS(desc);
  DRAWBTS2();
}

function DRAWBTS2(): void {
  for (;;) {
    cy('DRAWBTS2');
    const v = m[VERT];
    if (v >= 192) return;
    // LO,Y + HDIV7 (no carry into the high byte)
    m[BASE1] = (m[LO + v] + m[HDIV7]) & 0xff;
    m[BASE1 + 1] = m[HI + v];
    const mode = patched(S.PMPATCH1);
    const b1 = w(BASE1);
    const b2 = w(BASE2);
    let y = m[WIDTH];
    do {
      if (mode === S.STORE) {
        cy('STORE');
        m[(b1 + y) & 0xffff] = m[(b2 + y) & 0xffff];
      } else if (mode === S.GRAB) {
        cy('GRAB');
        m[(b2 + y) & 0xffff] = m[(b1 + y) & 0xffff];
      } else {
        // XOR (and CLR, OR, which are XOR for bitmaps)
        cy('XOR');
        m[(b1 + y) & 0xffff] ^= m[(b2 + y) & 0xffff];
      }
      y = (y - 1) & 0xff;
    } while (y < 0x80);
    // DRAWBTS3
    cy('DRAWBTS3');
    m[HEIGHT] = (m[HEIGHT] - 1) & 0xff;
    if (m[HEIGHT] === 0) return;
    setw(BASE2, (b2 + m[WIDTH] + 1) & 0xffff);
    m[VERT] = (m[VERT] + 1) & 0xff;
    if (m[VERT] === 0) return;
  }
}

/** XOFFDRAW: draws a bitmap at any column, exclusive-or, through the shift tables */
export function XOFFDRAW(desc: number): void {
  GETBITS(desc);
  const mod = m[HMOD7];
  if (mod === 0) {
    DRAWBTS2();
    return;
  }
  m[S.SHIFTRESULT] = m[S.SRADDR - 1 + mod];
  m[S.SHIFTOUT] = m[S.SOADDR - 1 + mod];
  for (;;) {
    cy('XOFFDRW2');
    const v = m[VERT];
    if (v >= 192) return;
    // LO,Y + HDIV7 + 1 (no carry into the high byte)
    m[BASE1] = (m[LO + v] + m[HDIV7] + 1) & 0xff;
    m[BASE1 + 1] = m[HI + v];
    const b1 = w(BASE1);
    const bm = w(S.BITMAP);
    const so = w(S.SHIFTOUT - 1);
    const sr = w(S.SHIFTRESULT - 1);
    let y = m[WIDTH];
    let a = 0;
    do {
      cy('XOFFDRW3');
      const x = m[(bm + y) & 0xffff];
      a |= m[(so + x) & 0xffff];
      a ^= m[(b1 + y) & 0xffff];
      m[(b1 + y) & 0xffff] = a;
      a = m[(sr + x) & 0xffff];
      y = (y - 1) & 0xff;
    } while (y < 0x80);
    // DEC BASE1+1 with Y = $FF: the byte left of the row's first
    cy('XOFFROW');
    const left = ((b1 - 0x100) & 0xffff) + 0xff;
    m[BASE1 + 1] = (m[BASE1 + 1] - 1) & 0xff;
    m[left & 0xffff] ^= a;
    m[HEIGHT] = (m[HEIGHT] - 1) & 0xff;
    if (m[HEIGHT] === 0) return;
    setw(S.BITMAP, (bm + m[WIDTH] + 1) & 0xffff);
    m[VERT] = (m[VERT] + 1) & 0xff;
    if (m[VERT] === 0) return;
  }
}

// ---- rectangles ----

/** GETRECT: a rectangle (top, left DIV7, MOD7, height, width DIV7, MOD7) into TOP ... RIGHTMASK */
export function GETRECT(r: number): void {
  setw(TEMPRECT, r);
  m[TOP] = m[r];
  m[LFTDIV7] = m[r + 1];
  const lm = m[r + 2];
  m[LFTMOD7] = lm;
  m[LEFTMASK] = m[S.MASKS + lm] ^ 0x7f;
  m[BOTTOM] = (m[r + 3] + m[TOP]) & 0xff;
  let a = m[r + 5] + m[LFTMOD7];
  let c = 0;
  if ((a & 0xff) >= 7) {
    a = (a & 0xff) - 7;
    c = 1;
  } else a &= 0xff;
  // (an ADC that carried out above 255 cannot happen with MOD7 values)
  m[RTMOD7] = a;
  m[RTDIV7] = (m[r + 4] + m[LFTDIV7] + c) & 0xff;
  m[RIGHTMASK] = m[S.MASKS + 1 + a];
}

/** one byte of a rectangle's row in the pen mode the patch at `at` selects */
function rectEnd(at: number, base: number, y: number, a: number): void {
  const mode = patched(at) & 0xff;
  const p = (base + y) & 0xffff;
  if (mode === (S.CLR3 & 0xff)) m[p] = (a ^ 0x7f) & m[p];
  else if (mode === (S.OR3 & 0xff)) m[p] = a | m[p];
  else m[p] = a ^ m[p]; // XOR3 (= STORE3 = GRAB3)
}

/** HLINE: row X of the rectangle GETRECT set up */
export function HLINE(x: number): void {
  cy('HLINE');
  m[BASE1] = m[LO + x];
  m[BASE1 + 1] = m[HI + x];
  const base = w(BASE1);
  let y = m[LFTDIV7];
  if (y === m[RTDIV7]) {
    // HLIN2: the rectangle is within one byte
    rectEnd(S.PMPATCH3, base, y, m[LEFTMASK] ^ m[RIGHTMASK] ^ 0x7f);
    return;
  }
  const entry = patched(S.PMPATCH2);
  let a = m[LEFTMASK];
  // STORE2 = GRAB2 = XOR2A: start with A = $7F; CLR2A, OR2A likewise
  const kind = entry === S.CLR2 || entry === S.CLR2 - 2 ? 'clr' : entry === S.OR2 || entry === S.OR2 - 2 ? 'or' : 'xor';
  if (entry === S.XOR2 - 2 || entry === S.CLR2 - 2 || entry === S.OR2 - 2) a = 0x7f;
  for (;;) {
    const p = (base + y) & 0xffff;
    if (kind === 'xor') {
      cy('XOR2');
      m[p] ^= a;
    } else if (kind === 'clr') {
      cy('CLR2');
      m[p] = (a ^ 0x7f) & m[p];
    } else {
      cy('OR2');
      m[p] |= a;
    }
    y = (y + 1) & 0xff;
    if (y >= m[RTDIV7]) break;
    a = 0x7f;
  }
  // HLIN3
  rectEnd(S.PMPATCH3, base, y, m[RIGHTMASK]);
}

/** VLINE: Y = column DIV7, X = MOD7; from TOP to BOTTOM */
export function VLINE(col: number, mod: number): void {
  m[LEFTEDGE] = m[S.EDGES + mod];
  let x = m[TOP];
  for (;;) {
    m[BASE1] = m[LO + x];
    m[BASE1 + 1] = m[HI + x];
    rectEnd(S.PMPATCH4, w(BASE1), col, m[LEFTEDGE]);
    x = (x + 1) & 0xff;
    if (x > m[BOTTOM]) return;
  }
}

/** FRAMERECT */
export function FRAMERECT(r: number): void {
  GETRECT(r);
  FRAMERECT3();
}

/** FRAMERECT+3: with the rectangle GETRECT set up last */
export function FRAMERECT3(): void {
  HLINE(m[TOP]);
  const x = m[BOTTOM];
  if (x === m[TOP]) return;
  HLINE(x);
  m[TOP] = (m[TOP] + 1) & 0xff;
  m[BOTTOM] = (m[BOTTOM] - 1) & 0xff;
  if (x < m[TOP]) return;
  VLINE(m[LFTDIV7], m[LFTMOD7]);
  VLINE(m[RTDIV7], m[RTMOD7]);
}

/** DRAWRECT: fills the rectangle in the pen mode */
export function DRAWRECT(r: number): void {
  GETRECT(r);
  DRAWRECT3();
}

/** DRAWRECT+3 */
export function DRAWRECT3(): void {
  let x = m[TOP];
  for (;;) {
    HLINE(x);
    x = (x + 1) & 0xff;
    if (x > m[BOTTOM]) return;
  }
}

/** INRECT: is the point PARAM+3 (DIV7), +4 (MOD7), +5 (row) in the rectangle? (carry) */
export function INRECT(r: number): boolean {
  GETRECT(r);
  return INRECT2();
}

export function INRECT2(): boolean {
  const x = m[PARAM + 3];
  const a = m[PARAM + 4];
  const y = m[PARAM + 5];
  if (x < m[LFTDIV7]) return false;
  if (x === m[LFTDIV7] && a < m[LFTMOD7]) return false;
  if (x > m[RTDIV7]) return false;
  if (x === m[RTDIV7] && a > m[RTMOD7]) return false;
  if (y < m[TOP]) return false;
  if (y > m[BOTTOM]) return false;
  return true;
}

// ---- user interface ----

/** GETBUTNS: $C061 OR $C062 (bit 7: a button is down) */
export function GETBUTNS(): number {
  return button(0) | button(1);
}

/** INITCRSR: the bitmap becomes the cursor (descriptor at CURSOR), drawn */
export function INITCRSR(desc: number): void {
  GETBITS(desc);
  m[CURSOR] = m[BASE2];
  m[CURSOR + 1] = m[BASE2 + 1];
  m[CURSORHEIGHT] = m[HEIGHT];
  m[CURSORWIDTH] = (m[WIDTH] + 1) & 0xff;
  m[CRSRRTSTOP] = (40 - m[CURSORWIDTH]) & 0xff;
  XDRAWCRSR();
}

/** XDRAWCRSR: the cursor, exclusive-or */
export function XDRAWCRSR(): void {
  XOFFDRAW(CURSOR);
}

/**
 * The mouse, when the front end has one: where on the 280 x 192 screen it points. DOCRSRX and
 * DOCRSRY then put the cursor there instead of moving it by the joystick's deflection, after the
 * same WAIT and paddle read (the cursor's pace stays the original's) and with the same limits.
 * (A deviation the browser forces: the original was steered with a joystick or paddles.) The cursor
 * follows the mouse by at most POINTERSTEP pixels an update: the joystick moves it 5 at the most,
 * and the construction set's drags rely on small steps (DRAGOBJ2 leaves an object where it is
 * while the cursor is 16 or more pixels away from it).
 */
export const pointer: { x: number | null; y: number | null } = { x: null, y: null };
const POINTERSTEP = 12;
const toward = (to: number, from: number, max: number) => Math.max(0, Math.min(max, Math.max(from - POINTERSTEP, Math.min(from + POINTERSTEP, Math.round(to)))));

/** UPDATECRSR: reads the joystick, moves the cursor */
export function* UPDATECRSR(): Wait {
  const [x, a] = yield* DOCRSRX();
  m[NEWCURSORXDIV7] = x;
  m[NEWCURSORXMOD7] = a;
  m[NEWCURSORY] = yield* DOCRSRY();
  XDRAWCRSR();
  m[CURSORXDIV7] = m[NEWCURSORXDIV7];
  m[CURSORXMOD7] = m[NEWCURSORXMOD7];
  m[CURSORY] = m[NEWCURSORY];
  XDRAWCRSR();
}

/** DOCRSRX: paddle 0 (the joystick's x) → new column (DIV7, MOD7), log-scaled speed */
export function* DOCRSRX(): WaitFor<[number, number]> {
  WAIT(50);
  yield;
  const p = PREAD(0);
  const i = ((p ^ m[S.CMOD1]) & 0xff) >> 4;
  let t = m[S.LOGLO + i] + m[CRSRXACC];
  m[CRSRXACC] = t & 0xff;
  const c = t >> 8;
  let x = m[CURSORXDIV7];
  let a = (m[S.LOGHI + i] + m[CURSORXMOD7] + c) & 0xff;
  if (pointer.x !== null) {
    const px = toward(pointer.x, m[CURSORXDIV7] * 7 + m[CURSORXMOD7], 279);
    x = Math.floor(px / 7);
    a = px - x * 7;
  } else if (a & 0x80) {
    // DCRSRX2: borrow columns until A is positive
    do {
      x = (x - 1) & 0xff;
      t = a + 7;
      a = t & 0xff;
    } while (a & 0x80);
  } else {
    while (a >= 7) {
      a -= 7;
      x = (x + 1) & 0xff;
      if (x === 0) break;
    }
  }
  // DCRSRX4: no further right than CRSRRTSTOP
  const stop = m[CRSRRTSTOP];
  if (x < stop) return [x, a];
  if (x === stop || ((x - stop) & 0x80) === 0) return [stop, 0];
  return [0, 0];
}

/** GETCURSORX: the cursor's x (0..258), or $FF right of column 36 */
export function GETCURSORX(): number {
  const d = m[CURSORXDIV7];
  if (d >= 37) return 0xff;
  m[YTEMP] = d;
  const v = ((d << 3) & 0xff) - d;
  const t = (v & 0xff) + m[CURSORXMOD7];
  if (t > 0xff) return 0xff;
  return t;
}

/** DOCRSRY: paddle 1 → new row */
export function* DOCRSRY(): WaitFor<number> {
  WAIT(50);
  yield;
  const p = PREAD(1);
  const i = ((p ^ m[S.CMOD2]) & 0xff) >> 4;
  const t = m[S.LOGLO + i] + m[CRSRYACC];
  m[CRSRYACC] = t & 0xff;
  const a = (m[S.LOGHI + i] + m[CURSORY] + (t >> 8)) & 0xff;
  if (pointer.y !== null) return toward(pointer.y, m[CURSORY], 191);
  if (a < 192) return a;
  if (a < 224) return 191;
  return 0;
}

/** JSCTRL: keys X and Y turn the joystick's axes round */
export function JSCTRL(): void {
  const k = keyboard();
  if (!(k & 0x80)) return;
  strobe();
  if (k === 0xd8) m[S.CMOD1] ^= 0xff;
  if (k === 0xd9) m[S.CMOD2] ^= 0xff;
}

/** CRSRINRECT: is the cursor in the rectangle? (it becomes NEWITEM) */
export function CRSRINRECT(r: number): boolean {
  m[PARAM + 3] = m[CURSORXDIV7];
  m[PARAM + 4] = m[CURSORXMOD7];
  m[PARAM + 5] = m[CURSORY];
  setw(NEWITEM, r);
  return INRECT(r);
}

/** a routine a menu jumps to; its own JSRs and exits (it ends the menu like the original's RTS) */
export type MenuRoutine = () => Wait | void;

/**
 * DOMENU: a menu of (rectangle, routine) pairs: highlights the item under the cursor while the
 * button is down, runs the one it is let go on. Returns false when none was chosen (the original's
 * Z flag), else true. The routines' addresses are looked up in `routines`, the overlay's own (EDIT.S,
 * WIRE.S and DISK.S all sit at $9500).
 */
export function* DOMENU(menu: number, routines: Map<number, MenuRoutine>): WaitFor<boolean> {
  setw(PARAM, menu);
  for (;;) {
    // DOMNU2
    let y = 0;
    for (;;) {
      const lo = m[(w(PARAM) + y) & 0xffff];
      if (lo !== 0) {
        // DOMNU5
        m[YTEMP] = y;
        const hi = m[(w(PARAM) + y + 1) & 0xffff];
        if (CRSRINRECT(lo | (hi << 8))) {
          const chosen = yield* SELECT();
          y = m[YTEMP];
          if (!chosen) continue;
          const p = (w(PARAM) + y + 2) & 0xffff;
          m[S.DOMNU6 + 1] = m[p];
          m[S.DOMNU6 + 2] = m[(p + 1) & 0xffff];
          const target = w(S.DOMNU6 + 1);
          const fn = routines.get(target);
          if (!fn) throw new Error(`menu routine $${target.toString(16)} is not translated`);
          const r = fn();
          if (r) yield* r;
          return true;
        }
        // DOMNU7
        y = (m[YTEMP] + 4) & 0xff;
        continue;
      }
      // the end of the list
      if (m[LASTITEM + 1] !== 0) {
        DRAWRECT(m[LASTITEM] | (m[LASTITEM + 1] << 8));
        m[LASTITEM + 1] = 0;
      }
      yield* UPDATECRSR();
      if (GETBUTNS() & 0x80) break; // DOMNU2 again
      if (m[LASTITEM + 1] === 0) return false;
      DRAWRECT(m[LASTITEM] | (m[LASTITEM + 1] << 8));
      return true;
    }
  }
}

/** SELECT: highlights NEWITEM (and takes the highlight off LASTITEM); carry: let go on it */
export function* SELECT(): WaitFor<boolean> {
  const last = m[LASTITEM] | (m[LASTITEM + 1] << 8);
  const nw = m[NEWITEM] | (m[NEWITEM + 1] << 8);
  if (m[LASTITEM + 1] === 0) {
    DRAWRECT3();
    m[LASTITEM] = m[NEWITEM];
    m[LASTITEM + 1] = m[NEWITEM + 1];
  } else if (last !== nw) {
    DRAWRECT3();
    m[LASTITEM] = m[NEWITEM];
    m[LASTITEM + 1] = m[NEWITEM + 1];
    DRAWRECT(last);
  }
  yield* UPDATECRSR();
  if (GETBUTNS() & 0x80) return false;
  DRAWRECT(m[LASTITEM] | (m[LASTITEM + 1] << 8));
  return true;
}

/** INIT: clears hi-res page 1 */
export function INIT(): void {
  cy('INIT');
  m.fill(0, 0x2000, 0x4000);
  m[BASE1] = 0;
  m[BASE1 + 1] = 0x40;
}

// ---- block moves and 16-bit helpers (zero page pointers given by their addresses) ----

function GETPTRS(a: number, x: number, y: number): void {
  m[SBEGIN] = m[x];
  m[SBEGIN + 1] = m[(x + 1) & 0xff];
  m[DBEGIN] = m[y];
  m[DBEGIN + 1] = m[y + 1];
  m[SEND] = m[a];
  m[SEND + 1] = m[(a + 1) & 0xff];
}

/** MOVEUP: moves [(X), (A)) up so that it ends at (Y), copying from the top */
export function MOVEUP(a: number, x: number, y: number): void {
  cy('MOVEUP');
  GETPTRS(a, x, y);
  for (;;) {
    // MOVUP2
    cy('MOVUP2');
    m[SEND + 1] = (m[SEND + 1] - 1) & 0xff;
    m[DEND + 1] = (m[DEND + 1] - 1) & 0xff;
    const sb = w(SBEGIN);
    const se = w(SEND);
    // SBEGIN+1 < SEND+1, or the same page with SBEGIN <= SEND: a whole page
    const page = m[SBEGIN + 1] < m[SEND + 1] || (m[SBEGIN + 1] === m[SEND + 1] && m[SBEGIN] <= m[SEND]);
    const de = w(DEND);
    if (page) {
      // MOVUP6
      let yy = 0xff;
      do {
        cy('MOVUP7');
        m[(de + yy) & 0xffff] = m[(se + yy) & 0xffff];
        yy--;
      } while (yy !== 0);
      m[de] = m[se];
      continue;
    }
    // MOVUP3: the last part
    const extra = (m[SBEGIN] - m[SEND]) & 0xff;
    void sb;
    if (extra === 0) return;
    m[EXTRA] = extra;
    let yy = 0xff;
    do {
      cy('MOVUP4');
      m[(de + yy) & 0xffff] = m[(se + yy) & 0xffff];
      yy--;
    } while (yy >= extra);
    return;
  }
}

/** MOVEDOWN: moves [(X), (A)) down to (Y), copying from the bottom */
export function MOVEDOWN(a: number, x: number, y: number): void {
  cy('MOVEDOWN');
  GETPTRS(a, x, y);
  for (;;) {
    // MOVDN2
    cy('MOVDN2');
    const nx = (m[SBEGIN + 1] + 1) & 0xff;
    const whole = nx < m[SEND + 1] || (nx === m[SEND + 1] && m[SBEGIN] <= m[SEND]);
    const sb = w(SBEGIN);
    const db = w(DBEGIN);
    if (whole) {
      // MOVDN6
      for (let yy = 0; yy < 256; yy++) {
        cy('MOVDN7');
        m[(db + yy) & 0xffff] = m[(sb + yy) & 0xffff];
      }
      m[SBEGIN + 1] = (m[SBEGIN + 1] + 1) & 0xff;
      m[DBEGIN + 1] = (m[DBEGIN + 1] + 1) & 0xff;
      if (m[DBEGIN + 1] === 0) return;
      continue;
    }
    // MOVDN3
    const extra = (m[SEND] - m[SBEGIN]) & 0xff;
    if (extra === 0) return;
    m[EXTRA] = extra;
    let yy = 0;
    for (;;) {
      cy('MOVDN4');
      m[(db + yy) & 0xffff] = m[(sb + yy) & 0xffff];
      if (yy === extra) return;
      yy = (yy + 1) & 0xff;
      if (yy === 0) return;
    }
  }
}

/** ADDIYX: (X) = (Y) + A */
export function ADDIYX(a: number, y: number, x: number): void {
  const t = a + m[y];
  m[x] = t & 0xff;
  m[(x + 1) & 0xffff] = (m[(y + 1) & 0xffff] + (t >> 8)) & 0xff;
}

/** ADDYX: (X) = (X) + (Y) */
export function ADDYX(y: number, x: number): void {
  const t = m[x] + m[y];
  m[x] = t & 0xff;
  m[(x + 1) & 0xffff] = (m[(x + 1) & 0xffff] + m[(y + 1) & 0xffff] + (t >> 8)) & 0xff;
}

/** SUBIYX: (X) = (Y) - A */
export function SUBIYX(a: number, y: number, x: number): void {
  m[TEMP] = a;
  const t = m[y] - a;
  m[x] = t & 0xff;
  m[(x + 1) & 0xffff] = (m[(y + 1) & 0xffff] - (t < 0 ? 1 : 0)) & 0xff;
}

/** SUBYX: (X) = (X) - (Y) */
export function SUBYX(y: number, x: number): void {
  const t = m[x] - m[y];
  m[x] = t & 0xff;
  m[(x + 1) & 0xffff] = (m[(x + 1) & 0xffff] - m[(y + 1) & 0xffff] - (t < 0 ? 1 : 0)) & 0xff;
}

// ---- the mini font ----

const CHARBITS = S.CHARBITS;

/** CHARTO: the next character's column (DIV7 in X, MOD7 in A) and row (Y) */
export function CHARTO(a: number, x: number, y: number): void {
  m[CHARBITS + 4] = a;
  m[CHARBITS + 3] = x;
  m[CHARBITS + 2] = y;
}

/** PRCHAR: character A (0-9, A-Z = 10-35, 36 space), exclusive-or, then moves right */
export function PRCHAR(ch: number): void {
  cy('PRCHAR');
  m[TEMP] = ch;
  if (ch !== 36) {
    const a7 = (((ch << 3) & 0xff) - ch) & 0xff;
    const t = a7 + (S.FONT & 0xff);
    m[CHARBITS] = t & 0xff;
    m[CHARBITS + 1] = ((S.FONT >> 8) + (t >> 8)) & 0xff;
    XOFFDRAW(CHARBITS);
  }
  // SPACE
  let a = m[S.CWIDTH + m[TEMP]] + 1 + m[CHARBITS + 4];
  a &= 0xff;
  while (a >= 7) {
    m[CHARBITS + 3] = (m[CHARBITS + 3] + 1) & 0xff;
    a -= 7;
  }
  m[CHARBITS + 4] = a;
}

/** PRINT: a message, characters with bit 7 set on the last */
export function PRINT(msg: number): void {
  setw(TBASE, msg);
  let y = 0;
  for (;;) {
    const c = m[(w(TBASE) + y) & 0xffff];
    if (c & 0x80) {
      PRCHAR(c & 0x7f);
      return;
    }
    m[YTEMP] = y;
    PRCHAR(c);
    y = (m[YTEMP] + 1) & 0xff;
    if (y === 0) return;
  }
}
