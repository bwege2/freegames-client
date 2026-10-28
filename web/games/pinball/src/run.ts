// RUN.S, the pinball runtime: the parts' routines (run, init, hit), the ball (MOVEBALL with its
// pixel steps CHECKHORIZ/CHECKVERT against the table of spans, the bounce ROTATE/BOUNCE), scoring,
// the speaker, the wiring, the world settings, and PLAY, the construction set's test play.
//
// Translated from Bill Budge's listing routine by routine, on the original's memory: a part is its
// bytes in PBDATA as the construction set copied them from the parts library, and its routines are
// found by the addresses those bytes hold (offsets 10, 12, 14), as the 6502 code's JSR $FFFF patches
// did. What the code keeps in its own instructions (WMOD1-4, PMOD1, IMOD2, BMOD1, TMOD1, RMOD1-4)
// stays at those addresses. The carry crosses routines where the 6502 code lets it (a hit routine
// returns it: set, the ball stops there; some hit routines read it), here as `C`.
import { CHARTO, PRCHAR, PRINT, SETMODE, XOFFDRAW, DIV7, MOD7 } from './cdraw.ts';
import { SYM } from './image.ts';
import { PREAD, WAIT, button, click, cy, io, keyboard, m, setw, strobe, w, type Wait } from './machine.ts';
import { GETNEXTOBJ, GETOBJ, LIBOBJ, MAKEHOLE } from './ppak.ts';

const S = SYM.RUN;

// zero page (RUN.S equates)
const T = 0x07;
const XT = 0x08;
const YT = 0x09;
const T2 = 0x0a;
const B1 = 0x10;
export const B2 = 0x12;
const B3 = 0x14;
export const THETA = 0x14;
const BCODE = 0x15;
const KICK = 0x16;
const FLIPR = 0x17;
const FRAME = 0x18;
const LEFTX = 0x19;
const FDIR = 0x1a;
const FX1 = 0x1b;
const FX2 = 0x1c;
const FWIDTH = 0x1d;
export const NOBJ = 0x93;
export const OBJCOUNT = 0x94;
export const OBJID = 0x99;
export const LB = 0x9c;
const MIDTOP = 0xa3;
export const RUNLEN = 0xc0;
export const PDL0 = 0xc1;
export const PDL1 = 0xc2;
export const BTN0 = 0xc3;
export const BTN1 = 0xc4;
export const PTM1 = 0xc5;
export const PTM2 = 0xc6;
export const SERIES = 0xc8;
export const SLICE = 0xc9;
const ST = 0xca;
export const DSCORE = 0xcb;
export const DBONUS = 0xcc;
export const BMULT = 0xcd;
export const INITMODE = 0xce;
const SCB = 0xcf;
export const BST = 0xd1;
export const X1 = 0xd2;
export const Y1 = 0xd3;
export const X2 = 0xd4;
export const Y2 = 0xd5;
export const BDX = 0xd6;
export const BDY = 0xd7;
const BXACC = 0xd8;
const BYACC = 0xd9;
export const BMOVE = 0xda;
const MIDX = 0xdb;
const HCNT = 0xdc;
const HT = 0xdd;
const HVAL = 0xde;
const P1 = 0xdf;
const P2 = 0xe0;
const RTT = 0xe1;
const LFT = 0xe2;
const HTCNT = 0xe3;
export const LASTY = 0xe4;
export const STGL = 0x3e;

export const PBTBLO = 0x400;
export const PBTBHI = 0x4c0;
export const VLO = 0x580;
export const VHI = 0x600;
export const RCN = 0x680;
export const TIME = 0x700;
export const LOGIC = 0x4000;
export const WSET = 0x4018;
export const PBDX = 0x6f40;

/** the 6502 carry where it crosses routines */
let C = 0;
export function carry(): number {
  return C;
}
export function setCarry(c: number): void {
  C = c;
}

// ---- helpers: (LB),Y and (B2),Y, and the part's x five bytes before its bitmap descriptor ----

const lb = (y: number) => m[(w(LB) + y) & 0xffff];
const setlb = (y: number, v: number) => {
  m[(w(LB) + y) & 0xffff] = v & 0xff;
};
const b2 = (y: number) => m[(w(B2) + y) & 0xffff];
const setb2 = (y: number, v: number) => {
  m[(w(B2) + y) & 0xffff] = v & 0xff;
};
/** DEC LB+1; LDY #$xx; LDA (LB),Y; INC LB+1: the byte at LB - 256 + y */
const lbBack = (y: number) => m[(w(LB) - 0x100 + y) & 0xffff];
const b2Back = (y: number) => m[(w(B2) - 0x100 + y) & 0xffff];
const neg = (v: number) => (-v) & 0xff;

// ---- the routines a part's bytes point to ----

type Routine = () => void;
type Hit = () => boolean;

const runs = new Map<number, Routine>();
const hits = new Map<number, Hit>();

/** JSR to the address in a part's bytes (run or init routine) */
export function jsr(addr: number): void {
  const f = runs.get(addr);
  if (!f) throw new Error(`no routine at $${addr.toString(16)}`);
  f();
}

/** JSR to a part's hit routine: the carry it returns */
function jsrHit(addr: number): boolean {
  const f = hits.get(addr);
  if (!f) throw new Error(`no hit routine at $${addr.toString(16)}`);
  const c = f();
  C = c ? 1 : 0;
  return c;
}

// ---- the launcher ----

function LAUNCHRUN(): void {
  cy('LAUNCHRUN');
  if (m[BTN0] & 0x80) {
    if (lb(8) !== 0) RETREAT();
    return;
  }
  const a = m[PDL1] >> 5;
  const f = lb(8);
  if (a < f) {
    RETREAT();
    return;
  }
  if (a === f) return;
  if (f >= 5) return;
  ADVANCE();
}

function LAUNCHHIT(): boolean {
  cy('LAUNCHHIT');
  if (m[BTN0] & 0x80 && m[Y2] < b2(2)) {
    m[BDY] = m[PDL1] >> 2;
    return false; // NULLBOUNCE
  }
  return PBOUNCE();
}

function NULLBOUNCE(): boolean {
  return false;
}

function NULL(): void {}

// ---- the flippers ----

function FLIPRUN(t: number, x: number): void {
  cy('FLIPRUN');
  m[T] = t;
  const f = lb(8);
  if (m[BTN0 + x] & 0x80) {
    if (f >= 7) return;
    const i = f + t;
    m[XT] = i & 0xff;
    setlb(2, lb(2) + m[S.FXDVERT + 1 + i]);
    setlb(5, m[S.FXHEIGHT + 1 + i]);
    ADVANCE();
    setlb(7, m[S.FXLEN + 1 + m[XT]]);
    return;
  }
  if (f === 0) return;
  FLPRUN4(f);
}

/** FLPRUN4: one frame back (A = the frame) */
function FLPRUN4(f: number): void {
  const i = (f + m[T]) & 0xff;
  m[XT] = i;
  setlb(7, m[(S.FXLEN - 1 + i) & 0xffff]);
  RETREAT();
  const x = m[XT];
  setlb(2, lb(2) - m[S.FXDVERT + x]);
  setlb(5, m[(S.FXHEIGHT - 1 + x) & 0xffff]);
}

const LFLIPRUN = () => (cy('LFLIPRUN'), FLIPRUN(0, 0));
const RFLIPRUN = () => (cy('RFLIPRUN'), FLIPRUN(0, 1));
const LFLIP2RUN = () => (cy('LFLIP2RUN'), FLIPRUN(8, 0));
const RFLIP2RUN = () => (cy('RFLIP2RUN'), FLIPRUN(8, 1));

function FLIPINIT2(t: number): void {
  m[T] = t;
  for (;;) {
    const f = lb(8);
    if (f === 0) return;
    FLPRUN4(f);
  }
}
const FLIPINIT = () => (cy('FLIPINIT'), FLIPINIT2(0));
const FLIP2INIT = () => (cy('FLIP2INIT'), FLIPINIT2(8));

/** FLIPHIT: does the ball touch the flipper's frame? then bounce off its surface, with its swing */
function FLIPHIT(t: number, fdir: number, flipr: number): boolean {
  cy('FLIPHIT');
  m[T] = t;
  m[FDIR] = fdir;
  m[FLIPR] = flipr;
  const bm = m[BMOVE];
  // FX1..FX2 and YT: the ball's columns and the row it moves into (horizontal: by its BDY's sign)
  if (!(bm & 0x80)) {
    m[YT] = bm & 0x40 ? (m[Y2] + 1) & 0xff : (m[Y1] - 1) & 0xff;
    m[FX1] = m[X1];
    m[FX2] = m[X2];
  } else {
    const d = bm & 0x40 ? 1 : -1;
    m[FX1] = (m[X1] + d) & 0xff;
    m[FX2] = (m[X2] + d) & 0xff;
    m[YT] = m[BDY] & 0x80 ? (m[Y1] - 1) & 0xff : (m[Y2] + 1) & 0xff;
  }
  const frame = b2(8);
  m[FRAME] = frame;
  const x = (frame + m[T]) & 0xff;
  const top = (b2(2) + m[S.FDDVERT + x]) & 0xff;
  m[T] = top;
  if (top > m[YT]) return false;
  if (((top + m[S.FHEIGHT + x]) & 0xff) < m[YT]) return false;
  m[LEFTX] = b2Back(0xfb);
  m[B3] = m[S.FTBLO + x];
  m[B3 + 1] = m[S.FTBHI + x];
  // the frame's row: two bytes (left, right) a row, from LEFTX
  const d = (m[YT] - m[T]) & 0xff;
  const c0 = d >> 7;
  let y = (d << 1) & 0xff;
  const sh = (i: number) => m[(w(B3) + i) & 0xffff];
  let other: boolean;
  if (!(m[FLIPR] & 0x80)) {
    if (((sh(y) + m[LEFTX] + c0) & 0xff) > m[FX2]) return false;
    y = (y + 1) & 0xff;
    const r = (sh(y) + m[LEFTX]) & 0xff;
    if (r < m[FX1]) return false;
    m[T] = r;
    m[YT] = (m[FX2] - m[LEFTX]) & 0xff;
    m[THETA] = m[S.FTHETA + x];
    // going down, or sideways onto its left part: FLIPH10; else the underside, FLIPH12
    other = bm & 0x80 ? m[T] >= m[FX2] : !(bm & 0x40);
  } else {
    // RFLIPH9: the right flipper, its rows mirrored in FWIDTH
    y = (y + 1) & 0xff;
    const v = m[FWIDTH] - sh(y);
    const c = v >= 0 ? 1 : 0;
    if ((((v & 0xff) + m[LEFTX] + c) & 0xff) > m[FX2]) return false;
    y = (y - 1) & 0xff;
    const r = (((m[FWIDTH] - sh(y)) & 0xff) + m[LEFTX]) & 0xff;
    if (r < m[FX1]) return false;
    m[T] = r;
    m[YT] = (m[FWIDTH] - m[FX1] + m[LEFTX]) & 0xff;
    m[THETA] = (32 - m[S.FTHETA + x]) & 0xff;
    other = bm & 0x80 ? m[T] < m[FX2] : !(bm & 0x40);
  }
  return fliph(other);
}

/** FLIPH10 (the top) or FLIPH12 (the other side): the kick from the flipper's swing, the bounce */
function fliph(other: boolean): boolean {
  let xr = 0;
  if (other) {
    // FLIPH12
    xr = 0x80;
    let a = 16 + m[THETA];
    if (a >= 32) a -= 32;
    m[THETA] = a & 0xff;
  }
  // FLIPH13
  let a = m[(S.FLPVCTR + m[YT]) & 0xffff];
  const frame = m[FRAME];
  if (frame === 0 || frame === 7) a = 0;
  else if (m[FDIR] & 0x80) {
    if (xr !== 0x80) {
      // FLIPH15 → FLIPH17 with the vector as it is
    } else a = 0;
  } else if (xr === 0x80) a = neg(a);
  else a = 0;
  m[KICK] = a;
  m[BCODE] = 0;
  BOUNCE();
  return PUTSP(1);
}

function LFLIPHIT(): boolean {
  cy('LFLIPHIT');
  return FLIPHIT(0, m[BTN0], 0);
}
function LFLIP2HIT(): boolean {
  cy('LFLIP2HIT');
  return FLIPHIT(8, m[BTN0], 0);
}
function RFLIPHIT(): boolean {
  cy('RFLIPHIT');
  m[FWIDTH] = 19;
  return FLIPHIT(0, m[BTN1], 0x80);
}
function RFLIP2HIT(): boolean {
  cy('RFLIP2HIT');
  m[FWIDTH] = 13;
  return FLIPHIT(8, m[BTN1], 0x80);
}

// ---- the ball ----

function INITBALL(): void {
  cy('INITBALL');
  if (!(m[INITMODE] & 0x80)) {
    INITB2();
    return;
  }
  XOFFDRAW(w(LB));
  if (lb(16) & 0x80) return;
  DRAWBALL();
}

/** DRAWBALL: the ball where it is, exclusive-or (IBALL) */
export function DRAWBALL(): void {
  cy('DRAWBALL');
  m[S.IBALL + 2] = lb(18);
  const x = lb(17);
  m[S.IBALL + 3] = m[DIV7 + x];
  m[S.IBALL + 4] = m[MOD7 + x];
  XOFFDRAW(S.IBALL);
}

/** INITB2: the ball back where it was placed, still, BDY = -1 */
export function INITB2(): void {
  cy('INITB2');
  setlb(18, lb(2));
  setlb(17, lbBack(0xfb));
  setlb(7, 0);
  setlb(16, 0);
  setlb(19, 0);
  setlb(20, 0xff);
}

// ---- bumpers, kickers, knockers, rollovers, targets ----

function BUMPRUN(): void {
  cy('BUMPRUN');
  const s = lb(8);
  if (s & 0x80) {
    setlb(8, 0);
    ADVANCE();
    return;
  }
  if (s !== 0) RETREAT();
}

/** TSET: a hit part's state $80 (when it was 0) */
function TSET(): void {
  if (b2(8) === 0) setb2(8, 0x80);
}

function BUMPHIT(): boolean {
  cy('BUMPHIT');
  TSET();
  m[KICK] = m[S.WKICK];
  m[BCODE] = 0x80;
  BOUNCE();
  return PUTSP(1);
}

function BUMPINIT(): void {
  cy('BUMPINIT');
  const s = lb(8);
  if (s & 0x80) setlb(8, s & 0x7f);
  INITB();
}

function KICKHIT(): boolean {
  cy('KICKHIT');
  const t = m[THETA];
  if (t === 4 || t === 28) return BUMPHIT();
  return PBOUNCE();
}

function KNOCKRUN(): void {
  cy('KNOCKRUN');
  const s = lb(8);
  if (s & 0x80) {
    if (s === 0x82) {
      setlb(8, 2);
      return;
    }
    ADVANCE();
    return;
  }
  if (s !== 0) RETREAT();
}

function KNOCK1HIT(): boolean {
  cy('KNOCK1HIT');
  const bm = m[BMOVE];
  if (bm & 0x80) return PBOUNCE();
  const k = m[S.WKICK];
  m[BDY] = bm & 0x40 && k !== 0 ? k : k ^ 0xff;
  TSET();
  return PUTSP(1);
}

function KNOCK2HIT(): boolean {
  cy('KNOCK2HIT');
  const bm = m[BMOVE];
  if (!(bm & 0x80)) return PBOUNCE();
  const k = m[S.WKICK];
  m[BDX] = !(bm & 0x40) && k !== 0 ? k : k ^ 0xff;
  TSET();
  return PUTSP(1);
}

function FLASHRUN(): void {
  cy('FLASHRUN');
  const s = lb(8);
  if (s & 0x80) {
    if (s === 0x80) ADVANCE();
    else RETREAT();
    return;
  }
  if (s !== 0) RETREAT();
}

function FLASHHIT(): boolean {
  cy('FLASHHIT');
  TSET();
  const c = PBOUNCE();
  return PUTSP(c ? 1 : 0);
}

function ROLLHIT(): boolean {
  cy('ROLLHIT');
  TSET();
  PUTSP2();
  return false;
}

function GATEHIT(): boolean {
  cy('GATEHIT');
  const bm = m[BMOVE];
  if (bm & 0x80 || bm & 0x40) {
    const c = PBOUNCE();
    return PUTSP(c ? 1 : 0);
  }
  return false;
}

function GATE2HIT(): boolean {
  cy('GATE2HIT');
  if (m[BDX] & 0x80) {
    const c = PBOUNCE();
    return PUTSP(c ? 1 : 0);
  }
  return false;
}

function GATE3HIT(): boolean {
  cy('GATE3HIT');
  if (!(m[BDX] & 0x80)) {
    const c = PBOUNCE();
    return PUTSP(c ? 1 : 0);
  }
  return false;
}

// ---- drop targets ----

function DROPRUN(t2: number): void {
  cy('DROPRUN');
  m[T2] = t2;
  const s = lb(8) & 0x0f;
  if (s === 0x0f) {
    // all four down: up again, the part on ($80)
    for (let x = 3; x >= 0; x--) DRAWTARG(x);
    DROPRUN6(0x80);
    return;
  }
  const hit = (s ^ 0x0f) & lb(16);
  setlb(8, hit | lb(8));
  let a = hit;
  for (let x = 3; x >= 0; x--) {
    const c = a & 1;
    a >>= 1;
    if (c) DRAWTARG(x);
  }
}

function DROPRUN6(a: number): void {
  setlb(8, a);
  setlb(16, 0);
}

const DROP1RUN = () => (cy('DROP1RUN'), DROPRUN(0));
const DROP2RUN = () => (cy('DROP2RUN'), DROPRUN(0x80));

/** DRAWTARG: target X of a bank (8 pixels apart), exclusive-or */
function DRAWTARG(x: number): void {
  m[XT] = x;
  const off = (x << 3) & 0xff;
  if (!(m[T2] & 0x80)) {
    const px = (lbBack(0xfb) + off) & 0xff;
    m[S.DROPTXB + 3] = m[DIV7 + px];
    m[S.DROPTXB + 4] = m[MOD7 + px];
    m[S.DROPTXB + 2] = lb(2);
    XOFFDRAW(S.DROPTXB);
  } else {
    m[S.DROPTYB + 2] = (off + lb(2)) & 0xff;
    const px = lbBack(0xfb);
    m[S.DROPTYB + 3] = m[DIV7 + px];
    m[S.DROPTYB + 4] = m[MOD7 + px];
    XOFFDRAW(S.DROPTYB);
  }
}

/** which target of the bank (DHITTBL): sets its bit in offset 16, or passes */
function dropHit(a: number): boolean {
  let t = 1;
  for (let x = 3; x >= 0; x--) {
    if (a >= m[S.DHITTBL + x]) {
      m[T] = t;
      setb2(16, b2(16) | t);
      const c = PBOUNCE();
      return PUTSP(c ? 1 : 0);
    }
    t = (t << 1) & 0xff;
  }
  m[T] = t;
  return false;
}

function DROP1HIT(): boolean {
  cy('DROP1HIT');
  return dropHit((m[X2] - b2Back(0xfb)) & 0xff);
}

function DROP2HIT(): boolean {
  cy('DROP2HIT');
  return dropHit((m[Y2] - b2(2)) & 0xff);
}

function DROPINIT(t2: number): void {
  cy('DROPINIT');
  m[T2] = t2;
  let a = lb(8) & 0x0f;
  for (let x = 3; x >= 0; x--) {
    const c = a & 1;
    a >>= 1;
    if (c) DRAWTARG(x);
  }
  DROPRUN6(0);
}
const DROP1INIT = () => (cy('DROP1INIT'), DROPINIT(0));
const DROP2INIT = () => (cy('DROP2INIT'), DROPINIT(0x80));

// ---- catch holes, spinner, magnet ----

function CATCH1HIT(): boolean {
  cy('CATCH1HIT');
  const bm = m[BMOVE];
  if (bm & 0x80 || !(bm & 0x40)) return CTCH1HIT3();
  const a = (b2Back(0xf9) + 3) & 0xff;
  C = a >= m[X1] ? 1 : 0;
  if (a !== m[X1]) return CTCH1HIT3();
  m[YT] = b2(2);
  const t = b2(16);
  m[T] = t;
  if (t & 0x80) {
    // CTCH1HIT4: ROL (the carry is 1 here)
    if (t & 0x40) {
      // CTCH1HIT6: the ball comes out at the bottom
      if (((m[YT] + 16) & 0xff) !== m[Y2]) return false;
      if (!(m[BST] & 0x40)) return false;
      m[T] = (m[T] - 1) & 0xff;
      let v = m[T];
      if (v === 0xc0) {
        setb2(8, 0);
        v = 0;
      }
      setb2(16, v);
      m[BST] = 0;
      return false;
    }
    if (!(m[BST] & 0x20)) return true;
    const x = m[T] & 0x7f;
    const stop = (m[YT] + m[(S.CATCHSTOP + x) & 0xffff] + 1) & 0xff;
    if (stop !== m[Y2]) return false;
    m[T] = (m[T] + 1) & 0xff;
    let v = m[T] & 0x7f;
    let bst = 0x40;
    if (v === 3) {
      bst = 0;
      v = 0xc2;
    }
    setb2(16, v);
    m[BST] = bst;
    return true;
  }
  if (m[BST] & 0x40) return true;
  setb2(16, t | 0x80);
  m[BDX] = 0;
  m[BST] = 0x20;
  PUTSP2();
  return false;
}

function CTCH1HIT3(): boolean {
  if (m[THETA] !== 0) return PBOUNCE();
  m[BDX] = C ? 1 : 0xff;
  return true;
}

function CATCH1INIT(): void {
  cy('CATCH1INIT');
  setlb(8, 0);
  setlb(16, 0);
}

function CATCH2RUN(): void {
  cy('CATCH2RUN');
  const s = lb(8);
  if (!(s & 0x80)) return;
  if (s !== 0x84) {
    ADVANCE();
    return;
  }
  setlb(8, 0);
  setlb(0, S.CATCH2B & 0xff);
  setlb(1, S.CATCH2B >> 8);
}

function CATCH2HIT(): boolean {
  cy('CATCH2HIT');
  TSET();
  m[BST] = 0x80;
  return PUTSP(1);
}

function SPINRUN(): void {
  cy('SPINRUN');
  KNOCKRUN();
  if (lb(8) !== 0) return;
  const n = lb(16);
  if (n === 0) return;
  setlb(16, n - 1);
  setlb(8, 0x80);
  m[DSCORE] = (m[DSCORE] + 1) & 0xff;
  if (m[DSCORE] === 0) m[DSCORE] = 255;
}

function SPININIT(): void {
  cy('SPININIT');
  setlb(16, 0);
  BUMPINIT();
}

function SPINHIT(): boolean {
  cy('SPINHIT');
  let a = m[BDY];
  if (a & 0x80) a ^= 0xff;
  setb2(16, a >> 1);
  TSET();
  PUTSP2();
  return false;
}

function MAGHIT(): boolean {
  cy('MAGHIT');
  const bm = m[BMOVE];
  if (bm & 0x80 || bm & 0x40) {
    const c = PBOUNCE();
    return PUTSP(c ? 1 : 0);
  }
  return true;
}

// ---- the bounce ----

/** ROTATE: the vector (x, y) turned by angle A (32 to the circle): returns [x, y] */
export function ROTATE(angle: number, x: number, y: number): [number, number] {
  cy('ROTATE');
  m[T] = angle;
  m[XT] = angle >> 3;
  let q: number;
  if (x & 0x80) {
    if (y & 0x80) {
      [x, y] = QUAD2(x, y);
      q = 2;
    } else {
      [x, y] = QUAD3(x, y);
      q = 1;
    }
  } else if (y & 0x80) {
    [x, y] = QUAD1(x, y);
    q = 3;
  } else q = 0;
  q += m[XT];
  if (q >= 4) q -= 4;
  // ROT6: magnitudes at most 63
  if (y >= 0x40) y = 0x3f;
  if (x >= 0x40) x = 0x3f;
  const k = m[T] & 7;
  if (k !== 0) {
    m[XT] = x;
    const c1 = m[S.CTBL1LO - 1 + k] | (m[S.CTBL1HI - 1 + k] << 8);
    const c2 = m[S.CTBL2LO - 1 + k] | (m[S.CTBL2HI - 1 + k] << 8);
    setw(S.RMOD1, c1);
    setw(S.RMOD2, c1);
    setw(S.RMOD3, c2);
    setw(S.RMOD4, c2);
    // x' = (x cos - y sin) / 4, signed
    const d = m[(w(S.RMOD1) + x) & 0xffff] - m[(w(S.RMOD3) + y) & 0xffff];
    const c = d >= 0 ? 1 : 0;
    let a = d & 0xff;
    a = (a >> 1) | (c << 7);
    a = (a >> 1) | (c << 7);
    a ^= 0xc0;
    m[T] = a;
    // y' = (x sin + y cos) / 4, at most 63
    let s = m[(w(S.RMOD4) + x) & 0xffff] + m[(w(S.RMOD2) + y) & 0xffff];
    s = s >> 1;
    if (s & 0x80) s = 0x7f;
    y = s >> 1;
    x = m[T];
  }
  // FIXQUAD
  return fixquad(q, x, y);
}

function fixquad(q: number, x: number, y: number): [number, number] {
  const b1 = (q >> 1) & 1;
  const b0 = q & 1;
  if (b1) {
    if (b0) return QUAD3(x, y);
    return QUAD2(x, y);
  }
  if (b0) return QUAD1(x, y);
  return [x, y];
}

/** (x, y) → (-y, x) */
function QUAD1(x: number, y: number): [number, number] {
  m[YT] = x;
  return [neg(y), x];
}
/** (x, y) → (-x, -y) */
function QUAD2(x: number, y: number): [number, number] {
  return [neg(x), neg(y)];
}
/** (x, y) → (y, -x) */
function QUAD3(x: number, y: number): [number, number] {
  m[YT] = y;
  return [y, neg(x)];
}

/** PBOUNCE: a plain bounce off the surface THETA (no kick) */
export function PBOUNCE(): boolean {
  cy('PBOUNCE');
  m[KICK] = 0;
  m[BCODE] = 0;
  return BOUNCE();
}

/**
 * BOUNCE: turn the ball's vector so that the surface THETA is level, reflect it if it goes into the
 * surface, slowed by the elasticity table (unless BCODE: bumpers) and kicked by KICK, turn it back.
 * Always returns the carry set.
 */
export function BOUNCE(): boolean {
  let [x, y] = ROTATE(m[THETA], m[BDX], m[BDY]);
  if (!(y & 0x80)) return true;
  y = neg(y);
  let a: number;
  if (!(m[BCODE] & 0x80)) {
    a = m[(w(S.WMOD2) + y) & 0xffff] >> 2;
    if (a === 0) a = 1;
  } else a = y;
  a = (a + m[KICK]) & 0xff;
  if (!(a & 0x80) && a >= 0x40) a = 0x3f;
  y = a;
  [x, y] = ROTATE((32 - m[THETA]) & 0xff, x, y);
  m[BDX] = x;
  m[BDY] = y;
  return true;
}

// ---- animation frames ----

/** ADVANCE: the part's next frame: its bitmap pointer moves on by a frame, drawn exclusive-or */
export function ADVANCE(): void {
  cy('ADVANCE');
  let t = lb(7) + lb(0);
  setlb(0, t);
  t = lb(1) + (t >> 8);
  setlb(1, t);
  setlb(8, lb(8) + 1 + (t >> 8));
  XOFFDRAW(w(LB));
}

/** RETREAT: the frame drawn again (off), the pointer a frame back; the carry: no borrow */
export function RETREAT(): void {
  cy('RETREAT');
  XOFFDRAW(w(LB));
  let t = lb(0) - lb(7);
  setlb(0, t);
  let c = t >= 0 ? 1 : 0;
  t = lb(1) - (1 - c);
  setlb(1, t);
  c = t >= 0 ? 1 : 0;
  t = lb(8) - 1 - (1 - c);
  setlb(8, t);
  C = t >= 0 ? 1 : 0;
}

/** INITB: back to frame 0 */
export function INITB(): void {
  while (lb(8) !== 0) {
    RETREAT();
    if (!C) return;
  }
}

// ---- score and sound ----

/** PUTSP: with the carry set, the part's score and sound (its byte 9); returns the carry */
function PUTSP(c: number): boolean {
  if (c) PUTSP2();
  return c !== 0;
}

/** PUTSP2: SCORETBL[low nibble] to DSCORE, SNDTBL[high nibble] played */
function PUTSP2(): void {
  const v = b2(9);
  let a = m[S.SCORETBL + (v & 0x0f)] + m[DSCORE];
  if (a > 0xff) a = 255;
  m[DSCORE] = a;
  const s = v >> 4;
  if (s !== 0) DOSND(m[(S.SNDTBL - 1 + s) & 0xffff]);
}

/** DOSND: starts sound effect A unless a later one plays */
export function DOSND(a: number): void {
  if (((a - m[SERIES]) & 0x80) !== 0) return;
  m[SERIES] = a;
  m[SLICE] = 0;
}

// ---- the ball's move ----

/** MOVEBALL: one ball's jiffy: gravity, then pixel steps while the accumulators allow */
function MOVEBALL(): void {
  cy('MOVEBALL');
  const st = lb(16);
  if (st & 0x80) return;
  cy('MOVEBALLON');
  m[BST] = st;
  const x = lb(17);
  m[X1] = x;
  let t = x + 4;
  m[X2] = t & 0xff;
  m[MIDX] = (t - 2 + (t >> 8)) & 0xff;
  m[S.HBALL + 3] = m[S.VBALL + 3] = m[DIV7 + x];
  m[S.HBALL + 4] = m[S.VBALL + 4] = m[MOD7 + x];
  const y = lb(18);
  m[S.HBALL + 2] = m[S.VBALL + 2] = y;
  m[Y1] = y;
  m[Y2] = (y + 4) & 0xff;
  m[BDX] = lb(19);
  m[BDY] = lb(20);
  m[BXACC] = (lb(21) + m[BDX]) & 0xff;
  m[BYACC] = (lb(22) + m[BDY]) & 0xff;
  m[HTCNT] = 0;
  if ((m[PTM1] & m[S.WMOD4]) === 0) {
    // gravity: BDY one down, at most -47
    let v = (m[BDY] - 1) & 0xff;
    if (v & 0x80 && v < 0xd1) v = 0xd1;
    m[BDY] = v;
  }
  for (;;) {
    // MOVEB2
    cy('MOVEB2');
    if (m[BST] & 0x80) break;
    let a = m[BYACC];
    if (a & 0x80) {
      // MOVEB3: a pixel down
      m[BYACC] = (a + 0x20) & 0xff;
      m[BMOVE] = 0x40;
      if (!CHECKVERT((m[Y2] + 1) & 0xff)) BALLDOWN();
    } else if (a >= 0x20) {
      // MOVEB4: a pixel up
      m[BYACC] = a - 0x20;
      m[BMOVE] = 0;
      if (!CHECKVERT((m[Y1] - 1) & 0xff)) BALLUP();
    } else {
      a = m[BXACC];
      if (!(a & 0x80) && a < 0x20) break;
      horiz();
      continue;
    }
    // MOVEB5
    if (m[BST] & 0x80) break;
    a = m[BXACC];
    if (!(a & 0x80) && a < 0x20) continue;
    horiz();
  }
  // MOVEB9: every third jiffy without a hit, the row below is felt (rolling)
  cy('MOVEB9');
  let n = (lb(7) + 1) & 0xff;
  if (m[HTCNT] !== 0) {
    cy('MOVEB10');
    n = 0;
  } else if (n >= 3) {
    m[BMOVE] = 0x40;
    CHECKVERT((m[Y2] + 1) & 0xff);
    cy('MOVEB10');
    n = 0;
  }
  // MOVEB11
  cy('MOVEB11');
  setlb(7, n);
  setlb(16, m[BST]);
  setlb(17, m[X1]);
  setlb(18, m[Y1]);
  setlb(19, m[BDX]);
  setlb(20, m[BDY]);
  setlb(21, m[BXACC]);
  setlb(22, m[BYACC]);
  if (m[BST] & 0x80) DRAWBALL();
}

/** MOVEB6 / MOVEB7: a pixel right or left (both corners of the leading side are tried) */
function horiz(): void {
  const a = m[BXACC];
  if (!(a & 0x80)) {
    // MOVEB6: right
    m[BXACC] = a - 0x20;
    m[BMOVE] = 0xc0;
    if (CHECKHORIZ(m[Y1], (m[X2] + 1) & 0xff)) return;
    if (CHECKHORIZ(m[Y2], (m[X2] + 1) & 0xff)) return;
    BALLRIGHT();
    return;
  }
  // MOVEB7: left
  m[BXACC] = (a + 0x20) & 0xff;
  m[BMOVE] = 0x80;
  if (CHECKHORIZ(m[Y1], (m[X1] - 1) & 0xff)) return;
  if (CHECKHORIZ(m[Y2], (m[X1] - 1) & 0xff)) return;
  BALLLEFT();
}

/** DOHIT: the ball hit object OBJID: a wall bounces, a part's hit routine decides (the carry) */
function DOHIT(y: number): boolean {
  cy('DOHIT');
  io.onHit?.();
  m[HTCNT] = (m[HTCNT] + 1) & 0xff;
  m[HT] = y;
  const o = m[OBJID];
  const hi = m[VHI + o];
  let c: boolean;
  if (hi === 0) c = PBOUNCE();
  else {
    m[B2 + 1] = hi;
    m[B2] = m[VLO + o];
    m[S.BMOD1] = b2(14);
    m[S.BMOD1 + 1] = b2(15);
    c = jsrHit(w(S.BMOD1));
  }
  C = c ? 1 : 0;
  return c;
}

/** CHECKHORIZ: does column A of row Y touch an edge? (carry: blocked) */
function CHECKHORIZ(row: number, hval: number): boolean {
  cy('CHECKHORIZ');
  m[HVAL] = hval;
  m[B1] = m[PBTBLO + row];
  m[B1 + 1] = m[PBTBHI + row];
  m[HCNT] = m[PBDX + row];
  const b1 = () => w(B1);
  let y = 0;
  for (;;) {
    // CHECKHZ2
    cy('CHECKHZ2');
    const a = m[HVAL];
    const xl = m[(b1() + y) & 0xffff];
    let hit = 0; // 1: left edge, 2: right edge
    if (a === xl) hit = 1;
    else {
      y = (y + 2) & 0xff;
      if (a > xl) {
        const xr = m[(b1() + y) & 0xffff];
        if (a === xr) hit = 2;
        else if (a < xr) {
          // inside: an object's span is a right-edge hit, the outline's free space is not
          if (m[(b1() + y - 1) & 0xffff] !== 0) hit = 2;
        }
      }
      if (!hit) {
        y = (y + 2) & 0xff;
        if (y === m[HCNT]) return false;
        continue;
      }
    }
    if (hit === 1) {
      // HITLEFT
      cy('HITLEFT');
      y = (y + 1) & 0xff;
      m[OBJID] = m[(b1() + y) & 0xffff];
      y = (y + 2) & 0xff;
      m[THETA] = m[(b1() + y) & 0xffff] & 0x0f;
      m[THETA] = ((m[OBJID] !== 0 ? 32 : 16) - m[THETA]) & 0xff;
      C = 1;
      const c = DOHIT(y);
      y = m[HT];
      if (c) {
        FIXLEFT();
        return true;
      }
    } else {
      // HITRIGHT
      cy('HITRIGHT');
      y = (y - 1) & 0xff;
      m[OBJID] = m[(b1() + y) & 0xffff];
      y = (y + 2) & 0xff;
      m[THETA] = m[(b1() + y) & 0xffff] >> 4;
      m[THETA] = ((m[OBJID] !== 0 ? 16 : 32) - m[THETA]) & 0xff;
      C = 1;
      const c = DOHIT(y);
      y = m[HT];
      if (c) {
        FIXRIGHT();
        return true;
      }
    }
    // CHECKHZ7
    y = (y + 1) & 0xff;
    if (y === m[HCNT]) return false;
  }
}

function FIXLEFT(): void {
  cy('FIXLEFT');
  if (m[BDX] === 0) m[BDX] = m[OBJID] !== 0 ? 0xff : 1;
  m[BXACC] &= 0x1f;
}

function FIXRIGHT(): void {
  cy('FIXRIGHT');
  if (m[BDX] === 0) m[BDX] = m[OBJID] !== 0 ? 1 : 0xff;
  m[BXACC] &= 0x1f;
}

/** OFFBOARD: a row without spans is a level surface */
function OFFBOARD(): boolean {
  m[THETA] = m[BMOVE] & 0x40 ? 0 : 16;
  return PBOUNCE();
}

/** CHECKVERT: does the ball's row Y (its width X1..X2) touch something? (carry: blocked) */
function CHECKVERT(row: number): boolean {
  cy('CHECKVERT');
  m[B1] = m[PBTBLO + row];
  m[B1 + 1] = m[PBTBHI + row];
  const n = m[PBDX + row];
  if (n === 0) return OFFBOARD();
  m[HCNT] = n;
  const b1 = (i: number) => m[(w(B1) + i) & 0xffff];
  let y = 0;
  // PCHECKV: the records of the parts and walls
  for (;;) {
    cy('PCHECKV');
    let x = b1(y);
    y = (y + 1) & 0xff;
    const o = b1(y);
    m[OBJID] = o;
    if (o === 0) {
      // BCHECKV2: the outline's records: what lies between its free spans is solid
      m[P1] = 0;
      m[LFT] = 8;
      for (;;) {
        // BCHKV2
        if (m[X2] >= m[P1] && x >= m[X1]) {
          m[P2] = x;
          m[RTT] = b1((y + 2) & 0xff) & 0x0f;
          if (DOVHIT(y)) return chkvrt2();
        }
        // BCHKV3
        y = (y + 1) & 0xff;
        m[P1] = b1(y);
        y = (y + 1) & 0xff;
        m[LFT] = b1(y) >> 4;
        y = (y + 1) & 0xff;
        if (y === m[HCNT]) break;
        // BCHECKV
        cy('BCHECKV');
        x = b1(y);
        y = (y + 1) & 0xff;
        const o2 = b1(y);
        if (o2 !== 0) break;
        m[OBJID] = 0;
      }
      // BCHKV4: from the last free span to the right side
      if (m[X2] >= m[P1]) {
        m[P2] = 153;
        m[RTT] = 8;
        if (DOVHIT(y)) return chkvrt2();
      }
      // BCHKV5
      if (y === m[HCNT]) return false;
      y = (y - 1) & 0xff;
      continue;
    }
    if (x <= m[X2]) {
      m[P1] = x;
      y = (y + 1) & 0xff;
      const xr = b1(y);
      if (xr >= m[X1]) {
        m[P2] = xr;
        y = (y + 1) & 0xff;
        m[LFT] = b1(y);
        m[RTT] = m[LFT] >> 4;
        if (DOVHIT(y)) return chkvrt2();
        y = (y + 1) & 0xff;
      } else y = (y + 2) & 0xff;
    } else y = (y + 3) & 0xff;
    if (y === m[HCNT]) return false;
  }
}

function chkvrt2(): boolean {
  m[BYACC] &= 0x1f;
  return true;
}

/**
 * DOVHIT: the ball against span P1..P2 from above or below: its left or right end, or the side the
 * ball's middle is on, with the slope codes LFT/RTT made level where the ball meets them flat.
 */
function DOVHIT(y: number): boolean {
  cy('DOVHIT');
  const p2 = m[P2];
  if (p2 === m[X1]) return VRIGHT2(y);
  let a = ((p2 + m[P1]) >> 1) + 2;
  // (ROR takes the ADC's carry in; the sum's ninth bit)
  a &= 0xff;
  if (a < m[X2]) return VRIGHT(y);
  m[LFT] &= 0x0f;
  if (m[P1] === m[X2]) return VLEFT2(y);
  // VLEFT
  const [v, z, c] = VLFIX(m[LFT]);
  m[LFT] = v;
  if (z) return VLEFT3(v, c, y);
  return VLEFT2(y);
}

function VLEFT2(y: number): boolean {
  const t = 32 - m[LFT];
  return VLEFT3(t & 0xff, t >= 0 ? 1 : 0, y);
}

function VLEFT3(theta: number, c: number, y: number): boolean {
  m[THETA] = theta;
  C = c;
  if (DOHIT(y)) {
    if (m[BDX] === 0) m[BDX] = 0xff;
    return true;
  }
  return false;
}

function VRIGHT(y: number): boolean {
  const [v, z, c] = VRFIX(m[RTT]);
  m[RTT] = v;
  if (z) return VRIGHT3(v, c, y);
  return VRIGHT2(y);
}

function VRIGHT2(y: number): boolean {
  const t = 16 - m[RTT];
  return VRIGHT3(t & 0xff, t >= 0 ? 1 : 0, y);
}

function VRIGHT3(theta: number, c: number, y: number): boolean {
  m[THETA] = theta;
  C = c;
  if (DOHIT(y)) {
    if (m[BDX] === 0) m[BDX] = 1;
    return true;
  }
  return false;
}

/** VLFIX: [A, Z, C] as the 6502 code leaves them */
function VLFIX(a: number): [number, boolean, number] {
  return m[BMOVE] & 0x40 ? fix6(a) : fix11(a);
}
function VRFIX(a: number): [number, boolean, number] {
  return m[BMOVE] & 0x40 ? fix11(a) : fix6(a);
}
/** VLFIX2: below 6 it stays; else VFIX2 */
function fix6(a: number): [number, boolean, number] {
  if (a < 6) return [a, false, 0];
  return VFIX2(1);
}
/** VLFIX3: 11 and above stays (Z when 11); else VFIX2 */
function fix11(a: number): [number, boolean, number] {
  if (a >= 11) return [a, a === 11, 1];
  return VFIX2(0);
}
/** VFIX2: level: 16 going up, 0 going down; Z set */
function VFIX2(c: number): [number, boolean, number] {
  return [m[BMOVE] & 0x40 ? 0 : 16, true, c];
}

function BALLDOWN(): void {
  cy('BALLDOWN');
  XOFFDRAW(S.VBALL);
  m[Y1] = (m[Y1] + 1) & 0xff;
  m[Y2] = (m[Y2] + 1) & 0xff;
  m[S.HBALL + 2] = m[S.VBALL + 2] = m[Y1];
}

function BALLUP(): void {
  cy('BALLUP');
  m[Y1] = (m[Y1] - 1) & 0xff;
  m[Y2] = (m[Y2] - 1) & 0xff;
  m[S.HBALL + 2] = m[S.VBALL + 2] = m[Y1];
  XOFFDRAW(S.VBALL);
}

function BALLRIGHT(): void {
  cy('BALLRIGHT');
  if (m[X2] >= 153) return;
  XOFFDRAW(S.HBALL);
  m[X1] = (m[X1] + 1) & 0xff;
  m[X2] = (m[X2] + 1) & 0xff;
  const x = m[X1];
  m[S.HBALL + 3] = m[S.VBALL + 3] = m[DIV7 + x];
  m[S.HBALL + 4] = m[S.VBALL + 4] = m[MOD7 + x];
}

function BALLLEFT(): void {
  cy('BALLLEFT');
  if (m[X1] === 0) return;
  m[X1] = (m[X1] - 1) & 0xff;
  m[X2] = (m[X2] - 1) & 0xff;
  const x = m[X1];
  m[S.HBALL + 3] = m[S.VBALL + 3] = m[DIV7 + x];
  m[S.HBALL + 4] = m[S.VBALL + 4] = m[MOD7 + x];
  XOFFDRAW(S.HBALL);
}

// ---- the score display (the test play's: one player) ----

function SCORE(): void {
  cy('SCORE');
  m[SYM.CDRAW.CHARBITS + 2] = 0xb0;
  DOSCORE(S.SCORE1, m[DSCORE]);
  m[SYM.CDRAW.CHARBITS + 2] = 0x98;
  setw(SCB, S.BONUS);
  DOSCORE2(5, m[DBONUS]);
  m[DSCORE] = 0;
  m[DBONUS] = 0;
}

function DOSCORE(scb: number, a: number): void {
  cy('DOSCORE');
  setw(SCB, scb);
  DOSCORE2(7, a);
}

/** DOSCORE2: A added to digit Y of the decimal number at SCB, carried, printed */
export function DOSCORE2(y: number, a: number, scbZp = SCB, print: () => void = PRSCORE2): void {
  cy('DOSCORE2');
  const p = (i: number) => (w(scbZp) + i) & 0xffff;
  let t = a + m[p(y)];
  if (t > 0xff) t = 255;
  m[p(y)] = t;
  for (;;) {
    // DOSCOR2
    let x = 0;
    let v = m[p(y)];
    while (v >= 10) {
      v -= 10;
      x++;
    }
    m[p(y)] = v;
    y = (y - 1) & 0xff;
    m[p(y)] = (x + m[p(y)]) & 0xff;
    if (y === 0) break;
  }
  print();
}

function INITSCORE(): void {
  m[DSCORE] = 0;
  m[DBONUS] = 0;
  m[BMULT] = 0;
  for (let y = 17; y >= 0; y--) m[S.SCORE1 + y] = 0;
  CHARTO(0, 0x18, 0x80);
  PRINT(S.BMMSG);
  PRBMULT();
  CHARTO(0, 0x18, 0xb0);
  PRINT(S.P1MSG);
  PRSCORE(S.SCORE1);
  CHARTO(0, 0x18, 0x98);
  PRINT(S.BMSG);
  PRSCORE(S.BONUS);
}

function PRSCORE(at: number): void {
  setw(SCB, at);
  PRSCORE2();
}

/** PRSCORE2: the 8 digits right to left from column 39, row CHAR+2, stored (not exclusive-or) */
export function PRSCORE2(scbZp = SCB): void {
  SETMODE(0);
  CHARTO(0, 0x27, m[SYM.CDRAW.CHARBITS + 2]);
  for (let y = 8; y !== 0; y--) {
    m[YT] = y;
    PRCHAR(m[(w(scbZp) + y) & 0xffff]);
    m[SYM.CDRAW.CHARBITS + 3] = (m[SYM.CDRAW.CHARBITS + 3] - 1) & 0xff;
    m[SYM.CDRAW.CHARBITS + 4] = 0;
  }
  SETMODE(2);
}

/** PRBMULT: the bonus multiplier one up (to 5) and printed */
export function PRBMULT(row = 0x80): void {
  SETMODE(0);
  CHARTO(0, 0x20, row);
  const x = (m[BMULT] + 1) & 0xff;
  if (x < 6) {
    m[BMULT] = x;
    PRCHAR(x);
  }
  SETMODE(2);
}

// ---- the speaker ----

/** cycles of an indexed read: one more when it crosses a page */
const cross = (base: number, i: number) => ((base & 0xff) + i > 0xff ? 1 : 0);
/** a taken branch: 3 cycles, 4 when it lands on another page than the next instruction's */
const taken = (next: number, target: number) => ((next & 0xff00) !== (target & 0xff00) ? 4 : 3);

/**
 * One slice of the current sound effect, as RUN.S SND (and RUN2.S SOUND, WIRE.S SOUND) play it:
 * the speaker clicks at the cycles the 6502 loop reaches LDA $C030. Returns the slice's cycles from
 * SND1. `snd2` and `snd3` are the loop's labels, `effects` and `notes` its tables.
 */
export function soundSlice(series: number, slice: number, st: number, effects: number, notes: number, snd2: number, snd3: number, snd4: number): number {
  let t = 2 + 3 + 2 + 3; // CLC ADC TAX STX
  const x = (series + slice) & 0xff;
  m[st] = x;
  t += 4 + cross(effects, x);
  let y = m[effects + x];
  for (;;) {
    // SND2: LDX NOTES-12,Y; BEQ SND4
    const nbase = (notes - 12) & 0xffff;
    t += 4 + cross(nbase, y);
    const n = m[(nbase + y) & 0xffff];
    if (n === 0) {
      t += taken(snd2 + 5, snd4);
      break;
    }
    t += 2;
    // SND3: PHA PLA DEX BNE, n times
    t += n * 12 - 1 + (n - 1) * (taken(snd3 + 5, snd3) - 3);
    click(t);
    t += 4 + 2; // LDA $C030, INY
    y = (y + 1) & 0xff;
    if (y === 0) {
      t += 2;
      break;
    }
    t += taken(snd3 + 11, snd2);
  }
  return t;
}

/** where a copy of the sound routine and its tables are (RUN.S SND, RUN2.S SOUND) */
export interface SoundCopy {
  effects: number;
  notes: number;
  snd2: number;
  snd3: number;
  snd4: number;
}
const RUNSOUND: SoundCopy = { effects: S.EFFECTS, notes: S.NOTES, snd2: S.SND2, snd3: S.SND3, snd4: S.SND4 };

/** SND: one slice every 4th jiffy; the effect's next slice, or the end */
export function SND(c: SoundCopy = RUNSOUND): void {
  if (m[STGL] & 0x80) {
    io.cycles += 3 + 3;
    return;
  }
  if (m[SERIES] & 0x80) {
    io.cycles += 3 + 2 + 3 + 3;
    return;
  }
  const t = 3 + 2 + 3 + 2 + soundSlice(m[SERIES], m[SLICE], ST, c.effects, c.notes, c.snd2, c.snd3, c.snd4);
  io.cycles += t;
  m[SLICE] = (m[SLICE] + 1) & 0xff;
  if (m[(c.effects + 1 + m[ST]) & 0xffff] === 0) INITSND();
}

export function INITSND(): void {
  m[SERIES] = 0xff;
  m[SLICE] = 0;
}

// ---- the wiring ----

/** where a copy of the wiring routine and its tables are (RUN.S WIRING, RUN2.S WIRING) */
export interface WiringCopy {
  bonustbl: number;
  sndtbl: number;
  tmod1: number;
  prbmult: () => void;
}
const RUNWIRING: WiringCopy = { bonustbl: S.BONUSTBL, sndtbl: S.SNDTBL, tmod1: S.TMOD1, prbmult: () => PRBMULT() };

/** WIRING: an AND gate whose inputs are all on: bonus, multiplier, sound, and its inputs reset */
export function WIRING(c: WiringCopy = RUNWIRING): void {
  cy('WIRING');
  let x = 0;
  for (;;) {
    m[T] = 0;
    m[XT] = x;
    let ok = !(GETST(x) & 0x80) ? false : true;
    if (ok) {
      x++;
      ok = !!(GETST(x) & 0x80);
      if (ok) {
        x++;
        ok = !!(GETST(x) & 0x80);
        if (ok) {
          x++;
          m[XT] = x;
          if (m[T] !== 0) {
            const out = m[LOGIC + x];
            m[YT] = out;
            let b = m[c.bonustbl + (out & 0x0f)] + m[DBONUS];
            if (b > 0xff) b = 255;
            m[DBONUS] = b;
            if (out & 0x80) c.prbmult();
            const s = (m[YT] & 0x70) >> 4;
            if (s !== 0) DOSND(m[(c.sndtbl - 1 + s) & 0xffff]);
            for (let k = 0; k < 3; k++) {
              m[XT] = (m[XT] - 1) & 0xff;
              TURNOFF(c.tmod1);
            }
          }
        }
      }
    }
    // WIR4
    x = ((m[XT] & 0xfc) + 4) & 0xff;
    if (x >= 24) return;
  }
}

/** GETST: the state byte of the part on gate input X ($80 when none) */
function GETST(x: number): number {
  cy('GETST');
  const o = m[LOGIC + x];
  if (o === 0) return 0x80;
  m[T] = (m[T] + 1) & 0xff;
  m[B1] = m[VLO + o];
  m[B1 + 1] = m[VHI + o];
  return m[(w(B1) + 8) & 0xffff];
}

/** TURNOFF: the part on input XT gets its init routine (off again) */
function TURNOFF(tmod1: number): void {
  const o = m[LOGIC + m[XT]];
  if (o === 0) return;
  m[LB] = m[VLO + o];
  m[LB + 1] = m[VHI + o];
  m[tmod1] = lb(12);
  m[tmod1 + 1] = lb(13);
  jsr(w(tmod1));
}

// ---- the world ----

/** INITWORLD: WSET's four settings patched into the code: gravity, speed, kick, elasticity */
export function INITWORLD(): void {
  m[S.WMOD4] = m[S.GRAVTBL + m[WSET]];
  m[S.WMOD1] = m[S.TIMETBL + m[WSET + 1]];
  m[S.WMOD3] = m[S.KICKTBL + m[WSET + 2]];
  m[S.WMOD2] = m[S.ELASTLO + m[WSET + 3]];
  m[S.WMOD2 + 1] = m[S.ELASTHI + m[WSET + 3]];
}

// ---- the test play ----

/** PLAY: the construction set's test play, until Esc */
export function* PLAY(): Wait {
  m[RUNLEN] = 0;
  GETOBJ(0);
  for (;;) {
    // PLAY2
    const x = m[NOBJ];
    if (m[OBJID] === LIBOBJ) {
      m[VLO + x] = m[LB];
      m[VHI + x] = m[LB + 1];
      m[TIME + x] = lb(8);
      setlb(8, 0);
      m[RCN + m[RUNLEN]] = x;
      m[RUNLEN] = (m[RUNLEN] + 1) & 0xff;
    } else {
      m[VLO + x] = 0;
      m[VHI + x] = 0;
    }
    m[NOBJ] = (m[NOBJ] + 1) & 0xff;
    GETNEXTOBJ(m[NOBJ]);
    if (m[NOBJ] === m[OBJCOUNT]) break;
  }
  m[INITMODE] = m[NOBJ];
  INITOBJS();
  INITSCORE();
  INITSND();
  INITWORLD();
  MAKEHOLE(1);
  tables(w(MIDTOP));
  for (;;) {
    // PLAY7
    cy('PLAY7');
    m[PTM1] = (m[PTM1] + 1) & 0xff;
    if (m[PTM1] === 0) m[PTM2] = (m[PTM2] + 1) & 0xff;
    if ((m[PTM1] & 0x1f) === 0) m[PDL0] = PREAD(0);
    if (((m[PTM1] + 0x10) & 0x1f) === 0) m[PDL1] = PREAD(1);
    m[BTN0] = button(0);
    m[BTN1] = button(1);
    WAIT(m[S.WMOD1]);
    yield;
    for (let y = 0; ; ) {
      // PLAY10
      cy('PLAY10');
      if (y >= m[RUNLEN]) break;
      m[NOBJ] = y;
      const x = m[RCN + y];
      if ((m[TIME + x] & m[PTM1]) === 0) {
        cy('PLAYRUN');
        m[LB] = m[VLO + x];
        m[LB + 1] = m[VHI + x];
        m[S.PMOD1] = lb(10);
        m[S.PMOD1 + 1] = lb(11);
        jsr(w(S.PMOD1));
        cy('PLAYBACK');
        const x2 = m[RCN + m[NOBJ]];
        if (m[TIME + x2] === 0) {
          // a ball (runs every jiffy): drained when it reaches the last row
          cy('PLAYBALL');
          const st = lb(16);
          if (!(st & 0x80 || st & 0x40) && m[Y2] === m[LASTY]) {
            setlb(16, 0x80);
            DRAWBALL();
          }
        }
      }
      // PLAY11
      cy('PLAY11');
      y = (m[NOBJ] + 1) & 0xff;
      if (y === 0) break;
    }
    // PLAY12
    cy('PLAY12');
    if ((m[PTM1] & 0x1f) === 0) SCORE();
    if ((m[PTM1] & 0x03) === 0) {
      SND();
      WIRING();
    }
    const k = keyboard();
    if (!(k & 0x80)) continue;
    strobe();
    if (k === 0x9b) {
      // QUIT
      m[INITMODE] = k;
      INITOBJS();
      return;
    }
    if (k === 0x93) m[STGL] ^= k;
  }
}

/** PLAY6, GLSTY: where each row's spans start (PBTBLO/HI), and LASTY, the last row with any */
export function tables(at: number, lasty = LASTY): void {
  let a = at & 0xff;
  let x = at >> 8;
  for (let y = 1; y < 192; y++) {
    const t = a + m[PBDX - 1 + y];
    a = t & 0xff;
    if (t > 0xff) x = (x + 1) & 0xff;
    m[PBTBLO + y] = a;
    m[PBTBHI + y] = x;
  }
  let y = 192;
  do y = (y - 1) & 0xff;
  while (m[PBDX + y] === 0);
  m[lasty] = y;
}

/** INITOBJS: every part's init routine; with INITMODE's bit 7, its state byte back to TIME */
export function INITOBJS(): void {
  for (let y = 0; y !== m[RUNLEN]; y = (m[NOBJ] + 1) & 0xff) {
    m[NOBJ] = y;
    const x = m[RCN + y];
    m[LB] = m[VLO + x];
    m[LB + 1] = m[VHI + x];
    m[S.IMOD2] = lb(12);
    m[S.IMOD2 + 1] = lb(13);
    jsr(w(S.IMOD2));
    if (m[INITMODE] & 0x80) setlb(8, m[TIME + m[RCN + m[NOBJ]]]);
  }
}

// ---- the routine tables (by the addresses the parts library puts in a part's bytes) ----

for (const [k, f] of Object.entries({
  LAUNCHRUN, INITB, NULL, LFLIPRUN, RFLIPRUN, LFLIP2RUN, RFLIP2RUN, FLIPINIT, FLIP2INIT, MOVEBALL, INITBALL,
  BUMPRUN, BUMPINIT, KNOCKRUN, FLASHRUN, DROP1RUN, DROP2RUN, DROP1INIT, DROP2INIT, CATCH1INIT, CATCH2RUN,
  SPINRUN, SPININIT,
})) {
  runs.set((S as Record<string, number>)[k], f as Routine);
}
for (const [k, f] of Object.entries({
  LAUNCHHIT, NULLBOUNCE, LFLIPHIT, RFLIPHIT, LFLIP2HIT, RFLIP2HIT, BUMPHIT, KICKHIT, KNOCK1HIT, KNOCK2HIT,
  FLASHHIT, ROLLHIT, PBOUNCE, GATEHIT, GATE2HIT, GATE3HIT, DROP1HIT, DROP2HIT, CATCH1HIT, CATCH2HIT, SPINHIT,
  MAGHIT,
})) {
  hits.set((S as Record<string, number>)[k], f as Hit);
}

export const library = { runs, hits };
