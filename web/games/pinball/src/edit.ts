// EDIT.S, the construction set: the table on the left, the parts box and the tools on the right.
// The hand drags parts (out of the box onto the table, around it, off it to delete them), the arrow
// drags a polygon's corners, the scissors cut a corner, the hammer adds one, the brush paints a
// polygon in the chosen colour; the menu column has the colours, Play (the test play, RUN.S PLAY),
// the magnifier (painting single pixels), the world (gravity, speed, kick, elasticity), the wiring
// (WIRE.S) and the disk (DISK.S).
//
// Translated from Bill Budge's listing routine by routine; the JMP DRAWKIT / REEDIT that end a mode
// throw Restart, which EDITOR catches (the original left the stack behind and jumped).
import {
  ADDIYX, CHARTO, CRSRINRECT, CURSORY, DIV7, DOCRSRX, DOCRSRY, DOMENU, DRAWBITS, DRAWRECT, FRAMERECT,
  GETBUTNS, GETCURSORX, HI, INIT, INITCRSR, INRECT, JSCTRL, LASTITEM, LO, MOD7, MOVEDOWN, MOVEUP,
  PRINT, SETMODE, SUBIYX, UPDATECRSR, XDRAWCRSR, XOFFDRAW, type MenuRoutine,
} from './cdraw.ts';
import { SYM } from './image.ts';
import { WAIT, button, cy, io, m, setw, w, type Wait } from './machine.ts';
import {
  ALIGNPOLY, BPOLYGON, DRAWDISPLAY, DRAWOBJ, FILLCOLOR, GETBOUNDS, GETINFO, GETNEXTOBJ, GETOBJ, LIBOBJ,
  MAKEHOLE, MEMBTM, MIDBTM, MIDTOP, NEXTOBJ, OBJ, OBJCOUNT, OBJID, PBDATA, PBDX, PLYPTRX, PLYPTRY, POLYGON,
  POLYPOINTS, REMOVEPOLY, SCANMODE, SELECTPOLY, SETCOLOR, VRTXCOUNT, LOGIC, WSET,
} from './ppak.ts';
import { PLAY as PLAYSTART } from './run.ts';
import { SWAPDISK, SWAPWIRE } from './shell.ts';

const S = SYM.EDIT;

// zero page (EDIT.S equates)
const PARAM = 0x00;
const TEMP = 0x07;
const XTEMP = 0x08;
const YTEMP = 0x09;
const TEMP2 = 0x0a;
const B1 = 0x10;
const CY = CURSORY;
const CXD7 = 0x83;
const CXM7 = 0x84;
const LB = 0x9c;
const COLOR = 0xa6;
const CX = 0xa7;
export const EDITMODE = 0xa8;
const OBJ2 = 0xa9;
const MINX = 0xad;
const MINY = 0xae;
const LFTSTOP = 0xaf;
const RTSTOP = 0xb0;
const TOPSTOP = 0xb1;
const BTMSTOP = 0xb2;
const DELX = 0xb3;
const DELY = 0xb4;
const DRAGX = 0xb5;
const DRAGY = 0xb6;
const MINPT = 0xaf;
const MINDIST = 0xb0;
const MINPOLY = 0xb1;
const VERTA = 0x14;
const D7A = 0x15;
const M7A = 0x16;
const VERTB = 0x17;
const BYTE2 = 0x1a;
const DRCNT = 0x1b;
const ZONE = 0x1c;
const NEXTZONE = 0x1d;
const COLBW = 0xc0;
const GRIDON = 0xc1;
const MCOLOR = 0xc2;
const XDIR = 0xc3;
const YDIR = 0xc4;
const VR = 0xc5;
const VRY = 0xc5;
const VRXD7 = 0xc6;
const VRXM7 = 0xc7;
const SLB = 0xc0;
const SLOLD = 0xc2;
const SLNEW = 0xc3;
const COLORBAR = 0x200;
const OBJDX = PBDATA + 1;

/** JMP DRAWKIT (saveLogo false) or JMP REEDIT (true): back to the construction set's kit */
export class Restart {
  readonly saveLogo: boolean;
  constructor(saveLogo: boolean) {
    this.saveLogo = saveLogo;
  }
}

/** WQUIT (PLA PLA RTS): out of the magnifier or the world settings */
class Quit {}

const lb = (y: number) => m[(w(LB) + y) & 0xffff];
const setlb = (y: number, v: number) => {
  m[(w(LB) + y) & 0xffff] = v & 0xff;
};
const px = (i: number) => m[(w(PLYPTRX) + i) & 0xffff];
const py = (i: number) => m[(w(PLYPTRY) + i) & 0xffff];
const setpx = (i: number, v: number) => {
  m[(w(PLYPTRX) + i) & 0xffff] = v & 0xff;
};
const setpy = (i: number, v: number) => {
  m[(w(PLYPTRY) + i) & 0xffff] = v & 0xff;
};
const rect = (r: number) => r;
const CINR = (r: number) => CRSRINRECT(r);
const UPDATEC = UPDATECRSR;
const XDRAWC = XDRAWCRSR;
const GETB = GETBUTNS;

/** a loop's iteration that only polls (its 6502 time, roughly) */
function* idle(cycles = 40): Wait {
  io.cycles += cycles;
  yield;
}

// ---- the construction set ----

/** EDITOR: START (from the boot), then the kit and its main loop for good */
export function* EDITOR(entry: 'START' | 'REEDIT' | 'DRAWKIT' = 'START'): Wait {
  let at = entry;
  for (;;) {
    try {
      if (at === 'START') START();
      if (at === 'REEDIT') SAVELOGO();
      DRAWKIT();
      yield* MAIN();
    } catch (e) {
      if (!(e instanceof Restart)) throw e;
      at = e.saveLogo ? 'REEDIT' : 'DRAWKIT';
    }
  }
}

/** START: the screen cleared, the table drawn (and merged into the ball's table), the logo saved */
export function START(): void {
  INIT();
  m[CY] = 0;
  m[CXD7] = 0;
  m[CXM7] = 0;
  m[SCANMODE] = 0;
  DRAWDISPLAY();
  SAVELOGO();
}

/** DRAWKIT: the kit cleared, its icons and the parts box drawn, the hand */
export function DRAWKIT(): void {
  CLEARKIT();
  m[COLOR] = 6;
  m[EDITMODE] = 0;
  for (let y = 0; y < 108; y += 2) {
    m[YTEMP] = y;
    XOFFDRAW(m[S.ICONS + y] | (m[S.ICONS + y + 1] << 8));
  }
  m[SCANMODE] = 0x80;
  for (let y = 0; y < 8; y += 2) {
    m[NEXTOBJ] = y;
    m[OBJ] = m[S.POLYS + y];
    m[OBJ + 1] = m[S.POLYS + y + 1];
    GETINFO();
    DRAWOBJ();
  }
  INITCRSR(S.HAND);
}

/** MAIN: the button pressed on the table (the tool's work), the tools (a menu) or the parts box */
function* MAIN(): Wait {
  for (;;) {
    JSCTRL();
    yield* UPDATEC();
    if (!(GETB() & 0x80)) continue;
    if (CINR(S.TABLEB)) {
      yield* MODE0();
      continue;
    }
    if (CINR(S.TOOLB)) {
      m[LASTITEM + 1] = 0;
      yield* DOMENU(S.CMDMENU, ROUTINES);
      continue;
    }
    if (m[EDITMODE] !== 0) continue;
    for (let y = 0; y < 43; y++) {
      m[YTEMP] = y;
      if (CINR(m[S.BOXLO + y] | (m[S.BOXHI + y] << 8))) {
        y = m[YTEMP];
        m[TEMP] = m[S.OBJADDRHI + y];
        yield* ADDOBJ(m[S.OBJLEN + y], m[S.OBJADDRLO + y] | (m[S.OBJADDRHI + y] << 8));
        break;
      }
      y = m[YTEMP];
    }
  }
}

function* MODE0(): Wait {
  const mode = m[EDITMODE];
  if (mode === 0) yield* DRAGOBJ();
  else if (mode === 0x80) yield* DRAGPOINT();
  else if (mode === 0x81) yield* CUTPOINT();
  else if (mode === 0x82) yield* PASTEPOINT();
  else yield* PAINTOBJ();
}

// ---- the tools ----

function setEditMode(cursor: number, mode: number): void {
  m[EDITMODE] = mode;
  INITCRSR(cursor);
}

function INITHAND(): void {
  POINTSOFF();
  setEditMode(S.HAND, 0);
}
function INITPOINTER(): void {
  POINTSON();
  setEditMode(S.POINTER, 0x80);
}
function INITSCISSOR(): void {
  POINTSON();
  setEditMode(S.SCISSOR, 0x81);
}
function INITHAMMER(): void {
  POINTSON();
  setEditMode(S.HAMMER, 0x82);
}
function INITBRUSH(): void {
  POINTSOFF();
  setEditMode(S.BRUSH, 1);
}

/** POINTSON: the black polygons' corners shown (unless they are), the cursor off */
function POINTSON(): void {
  if (!(m[EDITMODE] & 0x80)) DRAWPOINTS();
  XDRAWC();
}

/** POINTSOFF: the corners off again (if shown), the cursor off */
function POINTSOFF(): void {
  if (m[EDITMODE] & 0x80) DRAWPOINTS();
  XDRAWC();
}

/** DRAWLOGO: the saved logo, in the pen mode */
function DRAWLOGO(): void {
  DRAWBITS(S.LOGO);
}

/** SAVELOGO: the kit's top (the logo) grabbed into $380 */
export function SAVELOGO(): void {
  SETMODE(1);
  DRAWBITS(S.LOGO);
}

function setColor(y: number): void {
  m[COLOR] = y;
  SETCOLOR(y);
}

/** CLEARKIT: the kit area cleared */
function CLEARKIT(): void {
  SETMODE(3);
  DRAWRECT(S.KITB);
  SETMODE(2);
}

/** PLAY: the test play; then REEDIT */
function* PLAY(): Wait {
  POINTSOFF();
  CLEARKIT();
  DRAWLOGO();
  yield* PLAYSTART();
  throw new Restart(true);
}

function* MAGPAINT(): Wait {
  POINTSOFF();
  CLEARKIT();
  DRAWLOGO();
  yield* MAGSTART();
  throw new Restart(true);
}

function* SETWORLD(): Wait {
  POINTSOFF();
  CLEARKIT();
  yield* WORLDSTART();
  throw new Restart(false);
}

function* WIREKIT(): Wait {
  POINTSOFF();
  CLEARKIT();
  yield* SWAPWIRE();
  throw new Restart(false);
}

function* DISKIO(): Wait {
  POINTSOFF();
  CLEARKIT();
  DRAWLOGO();
  yield* SWAPDISK();
  throw new Restart(true);
}

// ---- dragging parts ----

/** DRAGOBJ: the hand on an object: it comes out of the ball's table and follows the cursor */
function* DRAGOBJ(): Wait {
  const [hit, o] = SELECTPOLY();
  if (!hit) return;
  m[SCANMODE] = 0x80;
  GETOBJ(o);
  REMOVEPOLY();
  yield* DRAGOBJ2();
}

function* DRAGOBJ2(): Wait {
  XDRAWC();
  GETBOUNDS();
  const x = m[PARAM + 3];
  m[CXD7] = m[DIV7 + x];
  m[CXM7] = m[MOD7 + x];
  XDRAWC();
  m[RTSTOP] = 0;
  m[BTMSTOP] = 0;
  m[LFTSTOP] = 0xff;
  m[TOPSTOP] = 0xff;
  for (let y = 0; y !== m[VRTXCOUNT]; y = (y + 1) & 0xff) {
    const vx = px(y);
    if (vx < m[LFTSTOP]) m[LFTSTOP] = vx;
    if (vx >= m[RTSTOP]) m[RTSTOP] = vx;
    const vy = py(y);
    if (vy < m[TOPSTOP]) m[TOPSTOP] = vy;
    if (vy >= m[BTMSTOP]) m[BTMSTOP] = vy;
  }
  const cx = GETCURSORX();
  m[DRAGX] = cx;
  m[LFTSTOP] = (cx - m[LFTSTOP] + 1) & 0xff;
  m[RTSTOP] = (255 - m[RTSTOP] + cx - 1) & 0xff;
  m[DRAGY] = m[CY];
  m[TOPSTOP] = (m[CY] - m[TOPSTOP] + 1) & 0xff;
  m[BTMSTOP] = (191 - m[BTMSTOP] + m[CY] - 1) & 0xff;
  for (;;) {
    // DRAGO6
    DRAWOBJ();
    let a = GETCURSORX();
    if (a < m[LFTSTOP]) a = m[LFTSTOP];
    if (a >= m[RTSTOP]) a = m[RTSTOP];
    let x = a;
    a = (a - m[DRAGX]) & 0xff;
    if (a < 0x10 || a >= 0xf0) {
      m[DELX] = a;
      m[DRAGX] = x;
      a = m[CY];
      if (a < m[TOPSTOP]) a = m[TOPSTOP];
      if (a >= m[BTMSTOP]) a = m[BTMSTOP];
      x = a;
      m[DELY] = (a - m[DRAGY]) & 0xff;
      m[DRAGY] = x;
      for (let y = 0; y !== m[VRTXCOUNT]; y = (y + 1) & 0xff) {
        setpx(y, px(y) + m[DELX]);
        setpy(y, py(y) + m[DELY]);
      }
      if (m[OBJID] >= LIBOBJ) {
        setlb(2, lb(2) + m[DELY]);
        m[TEMP] = lb(3);
        const t = ((((m[TEMP] << 3) & 0xff) - m[TEMP]) & 0xff) + lb(4) + m[DELX];
        const xx = t & 0xff;
        setlb(4, m[MOD7 + xx]);
        setlb(3, m[DIV7 + xx]);
      }
    }
    // DRAGO8
    if (!(GETB() & 0x80)) break;
    DRAWOBJ();
    yield* UPDATEC();
  }
  // DRAGO9: let go on the table: drawn and merged; else deleted
  if (!CINR(S.TABLEB)) {
    DELETEOBJ();
    return;
  }
  m[SCANMODE] &= 0x7f;
  if (!DRAWOBJ()) return;
  REMOVEPOLY();
  DRAWOBJ();
  REMOVEPOLY();
  DELETEOBJ();
}

/** DELETEOBJ: object NEXTOBJ out of PBDATA (its size byte, its bytes); the others renumbered */
function DELETEOBJ(): void {
  const y0 = m[NEXTOBJ];
  m[YTEMP] = m[OBJDX + y0];
  setw(TEMP, OBJDX + y0);
  ADDIYX(1, TEMP, OBJ2);
  MOVEDOWN(OBJ, OBJ2, TEMP);
  ADDIYX(m[YTEMP], OBJ, OBJ2);
  SUBIYX(1, OBJ, OBJ);
  MOVEDOWN(MIDBTM, OBJ2, OBJ);
  m[OBJCOUNT] = (m[OBJCOUNT] - 1) & 0xff;
  m[PBDATA] = (m[PBDATA] - 1) & 0xff;
  const n = (m[YTEMP] + 1) & 0xff;
  m[TEMP] = n;
  SUBIYX(n, MEMBTM, MEMBTM);
  SUBIYX(m[TEMP], MIDBTM, MIDBTM);
  MAKEHOLE(1);
  // the objects above it in the ball's table one number down
  setw(B1, w(MIDTOP));
  do {
    const p = (w(B1) + 1) & 0xffff;
    if (m[p] >= m[NEXTOBJ]) m[p] = (m[p] - 1) & 0xff;
    setw(B1, (w(B1) + 4) & 0xffff);
  } while (w(B1) !== PBDX);
  // and in the wiring
  for (let y = 0; y < 24; y += 4) {
    FIXINDX(y);
    FIXINDX(y + 1);
    FIXINDX(y + 2);
  }
}

/** FIXINDX: a wiring input on the deleted object goes, one above it moves down */
function FIXINDX(y: number): void {
  const a = m[LOGIC + y];
  if (a < m[NEXTOBJ]) return;
  m[LOGIC + y] = a === m[NEXTOBJ] ? 0 : (a - 1) & 0xff;
}

/** ADDOBJ: a copy of the library part (A bytes at X/Y) at the end of PBDATA, then dragged */
function* ADDOBJ(len: number, from: number): Wait {
  setw(OBJ2, from);
  m[YTEMP] = len;
  if (((m[OBJCOUNT] + 1) & 0xff) & 0x80) return;
  const lo = m[MIDTOP] - m[MIDBTM];
  const hi = m[MIDTOP + 1] - m[MIDBTM + 1] - (lo < 0 ? 1 : 0);
  if ((hi & 0xff) === 0 && (lo & 0xff) < 32) return;
  ADDIYX(m[YTEMP], MIDBTM, TEMP);
  setw(TEMP, (w(TEMP) + 1) & 0xffff);
  MOVEUP(MIDBTM, MEMBTM, TEMP);
  m[MIDBTM] = m[TEMP];
  m[MIDBTM + 1] = m[TEMP + 1];
  GETOBJ(0);
  ADDIYX(1, MEMBTM, TEMP);
  MOVEUP(MEMBTM, OBJ, TEMP);
  setw(MEMBTM, (w(MEMBTM) + 1) & 0xffff);
  for (let y = 0; y !== m[YTEMP]; y = (y + 1) & 0xff) m[(w(MEMBTM) + y) & 0xffff] = m[(w(OBJ2) + y) & 0xffff];
  m[OBJCOUNT] = (m[OBJCOUNT] + 1) & 0xff;
  m[PBDATA] = (m[PBDATA] + 1) & 0xff;
  m[PBDATA + m[OBJCOUNT]] = m[YTEMP];
  ADDIYX(m[YTEMP], MEMBTM, MEMBTM);
  m[SCANMODE] = 0x80;
  GETOBJ((m[OBJCOUNT] - 1) & 0xff);
  if (DRAWOBJ()) {
    REMOVEPOLY();
    DRAWOBJ();
    DELETEOBJ();
    return;
  }
  yield* DRAGOBJ2();
}

// ---- corners ----

/** DRAGPOINT: the arrow on a corner: it follows the cursor (within 1..152, 1..190) */
function* DRAGPOINT(): Wait {
  if (SELECTPOINT()) return;
  REMOVEPOLY();
  m[SCANMODE] |= 0x80;
  if (m[FILLCOLOR] !== 0) POLYPOINTS();
  yield* DRAGP2(false);
}

/** DRAGP2 (or from DRAGP3): the corner MINPT follows the cursor until the button is let go */
function* DRAGP2(fromP3: boolean): Wait {
  for (let first = true; ; first = false) {
    if (!(first && fromP3)) {
      DRAWOBJ();
      const y = m[MINPT];
      m[DRAGX] = px(y);
      m[DRAGY] = py(y);
      let a = GETCURSORX();
      if (a === 0) a = 1;
      if (a >= 152) a = 152;
      setpx(y, a);
      a = m[CY];
      if (a === 0) a = 1;
      if (a >= 190) a = 190;
      setpy(y, a);
    }
    DRAGP3();
    // DRAGP4
    if (!(GETB() & 0x80)) {
      yield* ENDPTEDIT();
      return;
    }
    if (DRAWOBJ()) {
      // CUTPOINT3
      DRAWOBJ();
      yield* CUTPOINT4();
      return;
    }
    yield* UPDATEC();
  }
}

/** DRAGP3: the polygon realigned (its corner number moves along); if it cannot be, the corner back */
function DRAGP3(): void {
  const fail = ALIGNPOLY();
  let a = m[MINPT] - m[YTEMP];
  if (a < 0) a += m[VRTXCOUNT];
  a &= 0xff;
  m[MINPT] = a;
  if (!fail) return;
  setpx(a, m[DRAGX]);
  setpy(a, m[DRAGY]);
  ALIGNPOLY();
}

/** ENDPTEDIT: the polygon drawn and merged; if it does not fit, the corner goes (CUTPOINT4) */
function* ENDPTEDIT(): Wait {
  m[SCANMODE] &= 0x7f;
  if (m[FILLCOLOR] !== 0) POLYPOINTS();
  if (!DRAWOBJ()) return;
  REMOVEPOLY();
  if (m[FILLCOLOR] !== 0) POLYPOINTS();
  DRAWOBJ();
  REMOVEPOLY();
  yield* CUTPOINT4();
}

/** CUTPOINT: the scissors on a corner: it goes (a polygon of three goes, but the outline) */
function* CUTPOINT(): Wait {
  if (SELECTPOINT()) return;
  REMOVEPOLY();
  m[SCANMODE] |= 0x80;
  if (m[FILLCOLOR] !== 0) POLYPOINTS();
  DRAWOBJ();
  yield* CUTPOINT4();
}

function* CUTPOINT4(): Wait {
  let x = m[VRTXCOUNT];
  if (x < 4) {
    if (m[NEXTOBJ] === 0) yield* ENDPTEDIT();
    else DELETEOBJ();
    return;
  }
  x--;
  m[(w(OBJ) + 2) & 0xffff] = x;
  ADDIYX(m[MINPT], PLYPTRX, PLYPTRX);
  ADDIYX(1, PLYPTRX, TEMP);
  ADDIYX(m[MINPT], PLYPTRY, PLYPTRY);
  MOVEDOWN(PLYPTRY, TEMP, PLYPTRX);
  SUBIYX(1, PLYPTRY, PLYPTRY);
  ADDIYX(2, PLYPTRY, TEMP);
  MOVEDOWN(MIDBTM, TEMP, PLYPTRY);
  SUBIYX(2, MEMBTM, MEMBTM);
  SUBIYX(2, MIDBTM, MIDBTM);
  const y = m[NEXTOBJ];
  m[PBDATA + 1 + y] = (m[PBDATA + 1 + y] - 2) & 0xff;
  GETOBJ(m[NEXTOBJ]);
  if (ALIGNPOLY()) {
    DELETEOBJ();
    return;
  }
  // CUTP2: until the button is let go
  while (GETB() & 0x80) yield* idle();
  yield* ENDPTEDIT();
}

/** PASTEPOINT: the hammer on an edge's middle: a new corner there, dragged */
function* PASTEPOINT(): Wait {
  if (SELECTPOINT()) return;
  if (m[VRTXCOUNT] >= 63) return;
  const lo = m[MIDTOP] - m[MIDBTM];
  const hi = m[MIDTOP + 1] - m[MIDBTM + 1] - (lo < 0 ? 1 : 0);
  if ((hi & 0xff) === 0 && (lo & 0xff) < 0x20) return;
  REMOVEPOLY();
  m[SCANMODE] |= 0x80;
  if (m[FILLCOLOR] !== 0) POLYPOINTS();
  DRAWOBJ();
  m[(w(OBJ) + 2) & 0xffff] = (m[VRTXCOUNT] + 1) & 0xff;
  ADDIYX(m[MINPT], PLYPTRY, PLYPTRY);
  ADDIYX(2, MIDBTM, TEMP);
  MOVEUP(MIDBTM, PLYPTRY, TEMP);
  ADDIYX(m[MINPT], PLYPTRX, PLYPTRX);
  ADDIYX(1, PLYPTRY, TEMP);
  MOVEUP(PLYPTRY, PLYPTRX, TEMP);
  GETOBJ(m[NEXTOBJ]);
  setpx(m[MINPT], m[MINX]);
  setpy(m[MINPT], m[MINY]);
  ADDIYX(2, MEMBTM, MEMBTM);
  ADDIYX(2, MIDBTM, MIDBTM);
  const y = m[NEXTOBJ];
  m[PBDATA + 1 + y] = (m[PBDATA + 1 + y] + 2) & 0xff;
  yield* DRAGP2(true);
}

/** DRAWPOINTS: every coloured polygon's corners (exclusive-or) */
function DRAWPOINTS(): void {
  GETOBJ(0);
  for (;;) {
    const id = m[OBJID];
    if ((id === POLYGON || id === BPOLYGON) && m[FILLCOLOR] !== 0) POLYPOINTS();
    m[NEXTOBJ] = (m[NEXTOBJ] + 1) & 0xff;
    GETNEXTOBJ(m[NEXTOBJ]);
    if (m[NEXTOBJ] === m[OBJCOUNT]) return;
  }
}

/**
 * SELECTPOINT: the polygon corner nearest the cursor (within 8 in x and in y; for the hammer the
 * middles of the edges). Returns true (carry) when there is none; else the polygon is the object.
 */
function SELECTPOINT(): boolean {
  m[CX] = GETCURSORX();
  m[MINDIST] = 0xff;
  GETOBJ(0);
  for (;;) {
    const id = m[OBJID];
    if (id === POLYGON || id === BPOLYGON) {
      for (let y = 0; y !== m[VRTXCOUNT]; y = (y + 1) & 0xff) {
        m[XTEMP] = px(y);
        m[YTEMP] = py(y);
        if (m[EDITMODE] === 0x82) {
          m[TEMP] = y;
          let p = (y - 1) & 0xff;
          if (p & 0x80) p = (m[VRTXCOUNT] - 1) & 0xff;
          m[XTEMP] = (px(p) + m[XTEMP]) >> 1;
          m[YTEMP] = (py(p) + m[YTEMP]) >> 1;
          y = m[TEMP];
        }
        let d = (m[XTEMP] - m[CX]) & 0xff;
        if (d & 0x80) d = (-d) & 0xff;
        if (d >= 8) continue;
        m[TEMP] = d;
        let e = (m[YTEMP] - m[CY]) & 0xff;
        if (e & 0x80) e = (-e) & 0xff;
        if (e >= 8) continue;
        e = (e + m[TEMP]) & 0xff;
        if (e >= m[MINDIST]) continue;
        m[MINDIST] = e;
        m[MINPT] = y;
        m[MINX] = m[XTEMP];
        m[MINY] = m[YTEMP];
        m[MINPOLY] = m[NEXTOBJ];
      }
    }
    m[NEXTOBJ] = (m[NEXTOBJ] + 1) & 0xff;
    GETNEXTOBJ(m[NEXTOBJ]);
    if (m[NEXTOBJ] === m[OBJCOUNT]) break;
  }
  if (m[MINDIST] === 0xff) return true;
  m[NEXTOBJ] = m[MINPOLY];
  GETOBJ(m[MINPOLY]);
  return false;
}

// ---- painting ----

/** PAINTOBJ: the brush on a polygon (or outside every one: the outline): its colour, or black */
function* PAINTOBJ(): Wait {
  XDRAWC();
  const [hit, o] = SELECTPOLY();
  GETOBJ(hit ? o : 0);
  if (m[OBJID] !== LIBOBJ) {
    m[SCANMODE] |= 0x80;
    const f = m[FILLCOLOR];
    if (f === 0 || (f ^ m[COLOR]) === 0) POLYPOINTS();
    let a = m[COLOR];
    if (a === m[FILLCOLOR]) a = 0;
    m[(w(OBJ) + 1) & 0xffff] = a;
    a ^= m[FILLCOLOR];
    if (a !== 0) {
      m[FILLCOLOR] = a;
      DRAWOBJ();
    }
    while (GETB() & 0x80) yield* idle();
  }
  XDRAWC();
}

// ---- the magnifier ----

/** MAGSTART: the magnifier: the panel (14 x 16 pixels blown up) and its menu, until Quit */
function* MAGSTART(): Wait {
  XOFFDRAW(S.ICON1);
  DRAWQUIT();
  XOFFDRAW(S.ICON2);
  INITMAG();
  INITCRSR(S.BRUSH);
  try {
    for (;;) {
      // MMAIN
      JSCTRL();
      yield* UPDATEC();
      if (!(GETB() & 0x80)) continue;
      if (CINR(rect(VR))) {
        yield* DRAG();
        continue;
      }
      if (CINR(S.MAGB)) {
        if (CINR(S.MAG)) yield* PLOT();
        else yield* SLIDEMAG();
        continue;
      }
      if (!CINR(S.MCMDB)) {
        yield* DRAG();
        continue;
      }
      m[LASTITEM + 1] = 0;
      yield* DOMENU(S.MCMDMENU, ROUTINES);
    }
  } catch (e) {
    if (!(e instanceof Quit)) throw e;
  }
}

function MQUIT(): void {
  DRAWVIEWR();
  throw new Quit();
}

function WQUIT(): void {
  throw new Quit();
}

/** DRAWQUIT: "QUIT" at the panel's bottom */
function DRAWQUIT(): void {
  CHARTO(3, 26, 178);
  PRINT(S.QUITMSG);
}

function msetclr(y: number): void {
  if (m[COLBW] & 0x80) return;
  m[MCOLOR] = y;
  SETCOLOR(y);
}

/** PLOT: the brush in the blown-up square: a pixel on in the colour, or off if it already was */
function* PLOT(): Wait {
  DRAWVIEWR();
  let [inMag, x, y, a] = INSQR();
  m[XTEMP] = x;
  m[YTEMP] = y;
  m[TEMP] = a;
  let first = true;
  for (;;) {
    if (first) {
      first = false;
      if (!INMAG()) {
        let c: number;
        if (HPLOT(m[XTEMP], m[YTEMP], m[TEMP])) c = m[MCOLOR];
        else c = m[MCOLOR] & 0x08;
        SETCOLOR(c);
        HPLOT(m[XTEMP], m[YTEMP], m[TEMP]);
        DISPLAYPLOT();
      }
    } else {
      // PLOT4
      [inMag, x, y, a] = INSQR();
      if (inMag) {
        m[XTEMP] = x;
        m[YTEMP] = y;
        m[TEMP] = a;
        if (!INMAG() && HPLOT(m[XTEMP], m[YTEMP], m[TEMP])) DISPLAYPLOT();
      }
    }
    // PLOT6
    yield* UPDATEC();
    if (!(GETB() & 0x80)) break;
  }
  SETCOLOR(m[MCOLOR]);
  DRAWVIEWR();
}

/** DISPLAYPLOT: the blown-up row the cursor is on, again */
function DISPLAYPLOT(): void {
  XDRAWC();
  const x = m[DIV7 - 71 + m[CY]];
  m[VERTA] = (x + m[VRY]) & 0xff;
  m[VERTB] = (m[S.MUL7 + x] + 71) & 0xff;
  m[D7A] = m[VRXD7];
  m[M7A] = m[VRXM7];
  DOROW();
  XDRAWC();
}

/** INMAG: is the hi-res point (XTEMP column, TEMP bit, YTEMP row) under the panel? (carry) */
function INMAG(): boolean {
  m[PARAM + 3] = m[XTEMP];
  m[PARAM + 4] = m[TEMP];
  m[PARAM + 5] = m[YTEMP];
  return INRECT(S.MCMDB);
}

/**
 * HPLOT: the pixel at column X (byte), bit A, row Y in COLORBAR's colour: black and white (one bit,
 * button 1 for the colour bit) or colour (a pixel pair). Returns the carry: the screen changed.
 */
function HPLOT(x: number, y: number, a: number): boolean {
  m[B1] = m[LO + y];
  m[B1 + 1] = m[HI + y];
  const b1 = w(B1);
  if (m[COLBW] & 0x80) {
    m[TEMP2] = m[S.MASK + a];
    const p = (b1 + x) & 0xffff;
    let v = ((button(1) & 0x80) | m[COLORBAR + x]) ^ m[p];
    v = (v & m[TEMP2]) ^ m[p];
    if (v === 0x80) v = 0;
    const changed = v !== m[p];
    m[p] = v;
    return changed;
  }
  // HPLOT2: colour pixels are pairs of bits, perhaps across two bytes
  const odd = x & 1;
  const yy = x & 0xfe;
  let i = a;
  if (odd) i += 7;
  i &= 0xfe;
  m[TEMP2] = m[S.CLRMASK + i];
  m[TEMP2 + 1] = m[S.CLRMASK + i + 1];
  const p0 = (b1 + yy) & 0xffff;
  let v = ((m[COLORBAR + yy] ^ m[p0]) & m[TEMP2]) ^ m[p0];
  if (v === 0x80) v = 0;
  let c = v !== m[p0];
  m[p0] = v;
  const p1 = (b1 + yy + 1) & 0xffff;
  v = ((m[COLORBAR + yy + 1] ^ m[p1]) & m[TEMP2 + 1]) ^ m[p1];
  if (v === 0x80) v = 0;
  if (!c) c = v !== m[p1];
  m[p1] = v;
  return c;
}

/** INITMAG: the slider bars, black and white off, the grid off, white, the viewer at the top left */
function INITMAG(): void {
  SETMODE(4);
  DRAWRECT(S.MBAR1);
  DRAWRECT(S.MBAR2);
  DRAWRECT(S.MBAR3);
  DRAWRECT(S.MBAR4);
  m[COLBW] = 0;
  m[GRIDON] = 0;
  m[MCOLOR] = 6;
  SETCOLOR(6);
  m[VRY] = 0;
  m[VRXD7] = 0;
  m[VRXM7] = 0;
  m[VR + 3] = 13;
  m[VR + 4] = 2;
  m[VR + 5] = 1;
  BLOWUP();
  SETMODE(2);
  DRAWVIEWR();
}

/** DRAWVIEWR: the viewer's frame on the table, exclusive-or */
function DRAWVIEWR(): void {
  FRAMERECT(VR);
}

function SWITCHCOLBW(): void {
  m[COLBW] ^= 0x80;
  m[MCOLOR] = 6;
  SETCOLOR(6);
  MAGNIFY();
}

/** GRIDTOGL: the grid between the blown-up pixels on or off (patches DOROW's colours) */
function GRIDTOGL(): void {
  m[GRIDON] ^= 0x80;
  if (!(m[GRIDON] & 0x80)) {
    m[S.GMOD1] = 0x7f;
    m[S.GMOD2] = 0x7f;
    m[S.GMOD3] = 0x7f;
    m[S.GMOD4] = 0x7f;
    m[S.GMOD5] = 0x2a;
    m[S.GMOD6] = 0xaa;
    m[S.GM7] = 0x55;
    m[S.GMOD8] = 0xd5;
  } else {
    m[S.GMOD1] = 0x3f;
    m[S.GMOD3] = 0x3f;
    m[S.GMOD4] = 0x3f;
    m[S.GMOD2] = 0x77;
    m[S.GMOD5] = 0x0a;
    m[S.GMOD6] = 0x8a;
    m[S.GM7] = 0x15;
    m[S.GMOD8] = 0x95;
  }
  MAGNIFY();
}

/** INSQR: the cursor in the blown-up square → [carry, column byte, row, bit] of the table */
function INSQR(): [boolean, number, number, number] {
  const c = CINR(S.MAG);
  const y = (m[DIV7 - 71 + m[CY]] + m[VRY]) & 0xff;
  let a = (((m[CXD7] - 23) & 0xff) + m[VRXM7]) & 0xff;
  let x = m[VRXD7];
  while (a >= 7) {
    a -= 7;
    x = (x + 1) & 0xff;
  }
  return [c, x, y, a];
}

/** SLIDEMAG: a slider bar pressed: the viewer moves that way while the button is down */
function* SLIDEMAG(): Wait {
  m[XDIR] = 0;
  m[YDIR] = 0;
  if (CINR(S.MBAR1)) m[YDIR] = 0xfe;
  else if (CINR(S.MBAR4)) m[YDIR] = 2;
  if (CINR(S.MBAR2)) m[XDIR] = 0xfe;
  else if (CINR(S.MBAR3)) m[XDIR] = 2;
  XDRAWC();
  yield* SLIDEVIEWR();
  XDRAWC();
}

function* SLIDEVIEWR(): Wait {
  for (;;) {
    DRAWVIEWR();
    let x = m[VRXD7];
    const dir = m[XDIR];
    if (!(dir & 0x80)) {
      let a = dir + m[VRXM7];
      if (a >= 7) {
        a -= 7;
        x++;
      }
      if (x < 37 || (x === 37 && a < 6)) {
        m[VRXD7] = x;
        m[VRXM7] = a;
      }
    } else {
      let a = (dir + m[VRXM7]) & 0xff;
      if (a & 0x80) {
        a = (a + 7) & 0xff;
        x = (x - 1) & 0xff;
      }
      if (!(x & 0x80)) {
        m[VRXD7] = x;
        m[VRXM7] = a;
      }
    }
    // SLIDEVWR4
    const yd = m[YDIR];
    if (!(yd & 0x80)) {
      const a = yd + m[VRY];
      if (a < 179) m[VRY] = a;
    } else {
      const t = yd + m[VRY];
      if (t > 0xff) m[VRY] = t & 0xff;
    }
    BLOWUP();
    DRAWVIEWR();
    WAIT(50);
    yield;
    if (!(GETB() & 0x80)) return;
  }
}

/** DRAG: the viewer follows the cursor (even columns) while the button is down */
function* DRAG(): Wait {
  XDRAWC();
  for (;;) {
    DRAWVIEWR();
    const [cx, cm] = yield* DOCRSRX();
    m[CXD7] = cx;
    m[CXM7] = cm;
    let a = yield* DOCRSRY();
    m[CY] = a;
    if (a >= 178) a = 178;
    m[VRY] = a;
    let x = m[CXD7];
    a = m[CXM7];
    if (x & 1) {
      a |= 1;
      if (a >= 7) {
        a = 0;
        x = (x + 1) & 0xff;
      }
    } else a &= 0xfe;
    if (x > 37 || (x === 37 && a >= 5)) {
      x = 37;
      a = 5;
    }
    m[VRXD7] = x;
    m[VRXM7] = a;
    BLOWUP();
    DRAWVIEWR();
    WAIT(80);
    yield;
    if (!(GETB() & 0x80)) break;
  }
  XDRAWC();
}

function MAGNIFY(): void {
  DRAWVIEWR();
  BLOWUP();
  DRAWVIEWR();
}

/** BLOWUP: the 14 rows under the viewer, blown up 7 times into the square */
function BLOWUP(): void {
  m[VERTB] = 71;
  m[VERTA] = m[VRY];
  m[D7A] = m[VRXD7];
  m[M7A] = m[VRXM7];
  do {
    DOROW();
    m[VERTA] = (m[VERTA] + 1) & 0xff;
    m[VERTB] = (m[VERTB] + 7) & 0xff;
  } while (m[VERTB] < 169);
}

/** the six STA $FFFF,X of ZAPBW (or ZAPCLR's two chains): the rows the blown-up pixels go to */
function patchRows(at: number, rows: number, firstRow: number): void {
  for (let k = 0; k < rows; k++) {
    m[at + 3 * k] = m[LO + firstRow + k];
    m[at + 3 * k + 1] = m[HI + firstRow + k];
  }
}

/**
 * DOROW: source row VERTA, from column D7A/M7A, blown up into 6 rows from VERTB at column 23:
 * black and white (16 pixels, a byte each, the colour bit's half-pixel shift shown) or colour (8
 * pixel pairs, two bytes each). The 6502 code keeps the pixel bits in A as a shift register with a
 * marker bit and the last pixel in the carry; so does this.
 */
function DOROW(): void {
  cy('DOROW');
  const row = m[VERTA];
  m[B1] = m[LO + row];
  m[B1 + 1] = m[HI + row];
  const b1 = w(B1);
  const to = m[VERTB];
  const zap = (chain: number, x: number, v: number) => {
    for (let k = 0; k < 6; k++) m[(w(chain + 3 * k) + x) & 0xffff] = v;
  };
  if (m[COLBW] & 0x80) {
    // DOROWBW, six times
    cy('DOROWBW', 6);
    patchRows(S.UNWND1, 6, to);
    let [a, y, c] = INITROW();
    m[DRCNT] = 16;
    let x = 23;
    for (;;) {
      // DODOTBW: PHP (the last pixel), the next bit out
      cy('DODOTBW');
      const prev = c;
      c = a & 1;
      a >>= 1;
      if (a === 0) {
        y = (y + 1) & 0xff;
        a = m[(b1 + y) & 0xffff];
        m[ZONE] = a;
        a |= 0x80;
        c = a & 1;
        a >>= 1;
      }
      let v: number;
      const hi = m[ZONE] & 0x80;
      if (c) {
        if (!hi) {
          v = m[S.GMOD1];
          c = 1;
        } else if (prev) {
          v = m[S.GMOD2];
          c = 1;
        } else {
          v = 0x70;
          c = 1;
        }
      } else if (!hi) {
        v = 0;
        c = 0;
      } else if (prev) {
        v = 0x0f;
        c = 0;
      } else {
        v = 0;
        c = 0;
      }
      zap(S.UNWND1, x, v);
      x++;
      m[DRCNT] = (m[DRCNT] - 1) & 0xff;
      if (m[DRCNT] === 0) return;
    }
  }
  // DOROWCLR, six times
  cy('DOROWCLR', 6);
  patchRows(S.UNWND2A, 6, to);
  patchRows(S.UNWND2B, 6, to);
  let [a, y, c] = INITROW();
  m[DRCNT] = 8;
  let x = 23;
  for (;;) {
    // DODOTCLR: P0 = the last pair's carry
    cy('DODOTCLR');
    const p0 = c;
    c = a & 1;
    a >>= 1;
    if (a === 0) {
      y = (y + 1) & 0xff;
      a = m[(b1 + y) & 0xffff];
      m[ZONE] = a;
      m[NEXTZONE] = a;
      a |= 0x80;
      c = a & 1;
      a >>= 1;
    }
    // DODOTCLR2: P1 = the pair's first bit
    const p1 = c;
    c = a & 1;
    a >>= 1;
    if (a === 0) {
      y = (y + 1) & 0xff;
      a = m[(b1 + y) & 0xffff];
      m[NEXTZONE] = a;
      a |= 0x80;
      c = a & 1;
      a >>= 1;
    }
    let v: number;
    if (c) {
      if (p1) {
        // both on: white
        c = 1;
        m[BYTE2] = m[S.GMOD3];
        v = 0x7f;
      } else {
        // DODOTCLR4: the second on: does the next pair start on?
        let t = a;
        let nc = t & 1;
        t >>= 1;
        if (t === 0) {
          nc = m[(b1 + y + 1) & 0xffff] & 1;
        }
        if (nc) {
          c = 1;
          m[BYTE2] = m[S.GMOD4];
          v = 0;
        } else {
          // DODOTCLR5
          c = 1;
          if (!(m[NEXTZONE] & 0x80)) {
            m[BYTE2] = m[S.GMOD5];
            v = 0x55;
          } else {
            m[BYTE2] = m[S.GMOD6];
            v = 0xd5;
          }
        }
      }
    } else if (p1) {
      // DODOTCLR6: the first on, the second off
      if (p0) {
        c = 0;
        m[BYTE2] = 0;
        v = 0x7f;
      } else {
        // DODOTCLR7
        c = 0;
        if (!(m[ZONE] & 0x80)) {
          m[BYTE2] = m[S.GM7];
          v = 0x2a;
        } else {
          m[BYTE2] = m[S.GMOD8];
          v = 0xaa;
        }
      }
    } else {
      // DODOTCLR8: both off
      c = 0;
      m[BYTE2] = 0;
      v = 0;
    }
    // ZAPCLR
    zap(S.UNWND2A, x, v);
    x++;
    zap(S.UNWND2B, x, m[BYTE2]);
    m[ZONE] = m[NEXTZONE];
    x++;
    m[DRCNT] = (m[DRCNT] - 1) & 0xff;
    if (m[DRCNT] === 0) return;
  }
}

/** INITROW: the shift register at the viewer's first pixel; the pixel left of it in the carry */
function INITROW(): [number, number, number] {
  cy('INITROW');
  const b1 = w(B1);
  let y = m[D7A];
  let x = m[M7A];
  let a: number;
  let c = 0;
  if (x === 0) {
    c = 0;
    y = (y - 1) & 0xff;
    if (!(y & 0x80)) {
      a = m[(b1 + y) & 0xffff];
      // ROL; ROL: bit 6 into the carry
      c = (a >> 6) & 1;
      y = (y + 1) & 0xff;
      a = m[(b1 + y) & 0xffff];
      m[ZONE] = a;
      m[NEXTZONE] = a;
      return [a | 0x80, y, c];
    }
  }
  // INITROW2
  a = m[(b1 + y) & 0xffff];
  m[ZONE] = a;
  m[NEXTZONE] = a;
  a |= 0x80;
  do {
    c = a & 1;
    a >>= 1;
    x = (x - 1) & 0xff;
  } while (x !== 0);
  return [a, y, c];
}

// ---- the world ----

/** WORLDSTART: four sliders (gravity, speed, kick, elasticity: WSET), until Quit */
function* WORLDSTART(): Wait {
  DRAWQUIT();
  for (let y = 0; y < 4; y++) {
    m[YTEMP] = y;
    XOFFDRAW(m[S.SLIDESLO + y] | (m[S.SLIDESHI + y] << 8));
    y = m[YTEMP];
    INITSLIDE(y);
  }
  CHARTO(0, 24, 6);
  PRINT(S.HEAD1);
  CHARTO(2, 33, 6);
  PRINT(S.HEAD2);
  CHARTO(2, 25, 70);
  PRINT(S.HEAD3);
  CHARTO(0, 31, 70);
  PRINT(S.HEAD4);
  INITCRSR(S.HAND);
  try {
    for (;;) {
      // WMAIN
      JSCTRL();
      yield* UPDATEC();
      if (!(GETB() & 0x80)) continue;
      let done = false;
      for (let y = 0; y < 4; y++) {
        m[YTEMP] = y;
        if (CINR(m[S.SLBLO + y] | (m[S.SLBHI + y] << 8))) {
          yield* DOSLIDE(m[YTEMP]);
          done = true;
          break;
        }
        y = m[YTEMP];
      }
      if (done) continue;
      if (!CINR(S.MCMDB)) continue;
      m[LASTITEM + 1] = 0;
      yield* DOMENU(S.WCMDMENU, ROUTINES);
    }
  } catch (e) {
    if (!(e instanceof Quit)) throw e;
  }
}

/** DOSLIDE: slider Y follows the cursor's row while the button is down */
function* DOSLIDE(y: number): Wait {
  m[SLB] = m[S.SLIDESLO + y];
  m[SLB + 1] = m[S.SLIDESHI + y];
  for (;;) {
    // DOSL2
    m[SLOLD] = m[WSET + y];
    let a = m[CY] - m[(w(SLB) + 2) & 0xffff];
    let k = 0;
    if (a >= 0) {
      a &= 0xff;
      k = 7;
      while (k !== 0 && a < m[S.SLDXDY + k]) k--;
    }
    m[SLNEW] = k;
    y = m[YTEMP];
    m[WSET + y] = k;
    MOVESLIDE();
    yield* UPDATEC();
    y = m[YTEMP];
    if (!(GETB() & 0x80)) return;
  }
}

/** INITSLIDE: slider Y drawn from 0 to its setting */
function INITSLIDE(y: number): void {
  m[SLB] = m[S.SLIDESLO + y];
  m[SLB + 1] = m[S.SLIDESHI + y];
  m[SLOLD] = 0;
  m[SLNEW] = m[WSET + y];
  MOVESLIDE();
}

/** MOVESLIDE: the knob's marks from SLOLD to SLNEW, a step at a time, exclusive-or */
function MOVESLIDE(): void {
  m[TEMP] = m[(w(SLB) + 2) & 0xffff];
  m[S.SLDX + 3] = m[(w(SLB) + 3) & 0xffff];
  for (;;) {
    const y = m[SLOLD];
    if (y === m[SLNEW]) return;
    let a: number;
    if (y < m[SLNEW]) {
      m[SLOLD] = (y + 1) & 0xff;
      a = m[S.SLDXDY + y];
    } else {
      m[SLOLD] = (y - 1) & 0xff;
      a = m[S.SLDXDY - 1 + y];
    }
    m[S.SLDX + 2] = (a + m[TEMP]) & 0xff;
    XOFFDRAW(S.SLDX);
  }
}

// ---- the menus' routines (CMDMENU, MCMDMENU, WCMDMENU) ----

export const ROUTINES = new Map<number, MenuRoutine>([
  [S.INITHAND, INITHAND],
  [S.INITPOINTER, INITPOINTER],
  [S.INITSCISSOR, INITSCISSOR],
  [S.INITHAMMER, INITHAMMER],
  [S.INITBRUSH, INITBRUSH],
  [S.WHITE, () => setColor(6)],
  [S.GREEN, () => setColor(2)],
  [S.VIOLET, () => setColor(4)],
  [S.RED, () => setColor(10)],
  [S.BLUE, () => setColor(12)],
  [S.PLAY, PLAY],
  [S.MAGPAINT, MAGPAINT],
  [S.SETWORLD, SETWORLD],
  [S.WIREKIT, WIREKIT],
  [S.DISKIO, DISKIO],
  [S.SWITCHCOLBW, SWITCHCOLBW],
  [S.GRIDTOGL, GRIDTOGL],
  [S.MQUIT, MQUIT],
  [S.MWHITE, () => msetclr(6)],
  [S.MGREEN, () => msetclr(2)],
  [S.MVIOLET, () => msetclr(4)],
  [S.MRED, () => msetclr(10)],
  [S.MBLUE, () => msetclr(12)],
  [S.WQUIT, WQUIT],
]);

