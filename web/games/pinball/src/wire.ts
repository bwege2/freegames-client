// WIRE.S, the wiring kit (an overlay at $9500): six AND gates. The hand picks a part (its score and
// sound) or a gate (its bonus, multiplier and sound); the screwdriver wires the picked gate to up to
// three parts, the pliers cut a wire. When all of a gate's parts are on, the game adds the gate's
// bonus (RUN.S WIRING).
//
// Translated from Bill Budge's listing routine by routine.
import {
  CHARTO, DOMENU, DRAWRECT, GETBUTNS, GETRECT, HLINE, INITCRSR, JSCTRL, LASTITEM, LFTDIV7, LFTMOD7, PRCHAR,
  PRINT, SETMODE, TOP, BOTTOM, UPDATECRSR, VLINE, XDRAWCRSR, XOFFDRAW, CRSRINRECT, DIV7, MOD7, type MenuRoutine,
} from './cdraw.ts';
import { SYM } from './image.ts';
import { io, m, w, type Wait } from './machine.ts';
import {
  BPOLYGON, DRAWOBJ, GETBOUNDS, GETNEXTOBJ, GETOBJ, LIBOBJ, NEXTOBJ, OBJCOUNT, OBJID, POLYGON, SCANMODE,
  SELECTPOLY, LOGIC,
} from './ppak.ts';
import { soundSlice } from './run.ts';

const S = SYM.WIRE;

// zero page (WIRE.S equates)
const PARAM = 0x00;
const TEMP = 0x07;
const XTEMP = 0x08;
const YTEMP = 0x09;
const CURSORY = 0x82;
const CURSORXDIV7 = 0x83;
const CURSORXMOD7 = 0x84;
const LBASE = 0x9c;
const EDITMODE = 0xa7;
const SLCTMODE = 0xa8;
const CUROBJ = 0xa9;
const CURNOISE = 0xaa;
const CURSCORE = 0xab;
const BMULT = 0xac;
const ETIMER = 0xad;
const SERIES = 0xae;
const SLICE = 0xaf;
const STEMP = 0xb0;
const X1 = 0xb1;
const Y1 = 0xb2;
const X2 = 0xb3;
const Y2 = 0xb4;
const MIDX = 0xb5;
const WIRE = 0xb6;
const CONTACTY = 0xb7;
const POLYB = 0xc0;

const CHAR = SYM.CDRAW.CHARBITS;

/** QUIT's PLA PLA RTS: out of the wiring kit */
class Quit {}

const lbase = (y: number) => m[(w(LBASE) + y) & 0xffff];

/** START: the polygons off, the tools, the gates and the notes drawn; the main loop until Quit */
export function* START(): Wait {
  m[CUROBJ] = 0x80;
  m[SCANMODE] = 0x80;
  DRAWPOLYS();
  m[CURSORY] = 0;
  m[CURSORXDIV7] = 0;
  m[CURSORXMOD7] = 0;
  m[EDITMODE] = 0;
  m[SLCTMODE] = 0;
  m[CURNOISE] = 0;
  INITSOUND();
  SETMODE(2);
  XOFFDRAW(S.HAND);
  XOFFDRAW(S.PLIER);
  XOFFDRAW(S.SCREWDRIVER);
  CHARTO(2, 0x24, 0x38);
  PRINT(S.QUITMSG);
  let a = 1;
  do {
    m[S.ANDGATE + 2] = a;
    XOFFDRAW(S.ANDGATE);
    a = m[S.ANDGATE + 2] + 15;
  } while (a !== 91);
  a = 93;
  m[XTEMP] = 1;
  do {
    m[S.NOTE + 2] = a;
    XOFFDRAW(S.NOTE);
    CHARTO(2, 25, m[S.NOTE + 2]);
    PRCHAR(m[XTEMP]);
    m[XTEMP] = (m[XTEMP] + 1) & 0xff;
    a = m[S.NOTE + 2] + 14;
  } while (a !== 191);
  INITCRSR(S.HAND);
  try {
    for (;;) {
      // MAIN
      m[ETIMER] = (m[ETIMER] + 1) & 0xff;
      SOUND();
      JSCTRL();
      yield* UPDATECRSR();
      if (!(GETBUTNS() & 0x80)) continue;
      if (CRSRINRECT(S.TOOLB)) {
        m[LASTITEM + 1] = 0;
        yield* DOMENU(S.CMDMENU, ROUTINES);
        continue;
      }
      yield* MODE0();
    }
  } catch (e) {
    if (!(e instanceof Quit)) throw e;
  }
}

function* MODE0(): Wait {
  const mode = m[EDITMODE];
  if (mode === 0) yield* SELECTOBJ();
  else if (mode === 1) yield* CUTWIRE();
  else yield* ADDWIRE();
}

/** DRAWPOLYS: every polygon drawn (exclusive-or: off in the kit, on again when it ends) */
function DRAWPOLYS(): void {
  GETOBJ(0);
  for (;;) {
    const id = m[OBJID];
    if (id === BPOLYGON || id === POLYGON) DRAWOBJ();
    m[NEXTOBJ] = (m[NEXTOBJ] + 1) & 0xff;
    GETNEXTOBJ(m[NEXTOBJ]);
    if (m[NEXTOBJ] === m[OBJCOUNT]) return;
  }
}

function setEditMode(cursor: number, mode: number): void {
  m[EDITMODE] = mode;
  INITCRSR(cursor);
}

function INITHAND(): void {
  XDRAWCRSR();
  setEditMode(S.HAND, 0);
}
function INITPLIER(): void {
  XDRAWCRSR();
  setEditMode(S.PLIER, 1);
}
function INITDRIVER(): void {
  XDRAWCRSR();
  setEditMode(S.SCREWDRIVER, 2);
}

function QUIT(): void {
  const s = m[SLCTMODE];
  if (s !== 0) {
    if (s === 1) DISPLAYPOLY();
    else DISPLAYAND();
  }
  DRAWPOLYS();
  throw new Quit();
}

/** waits for the button to be let go */
function* release(): Wait {
  while (GETBUTNS() & 0x80) {
    io.cycles += 40;
    yield;
  }
}

/** SELECTOBJ: the hand: a part on the table, a gate, a note, the multiplier box or a score */
function* SELECTOBJ(): Wait {
  if (CRSRINRECT(S.TABLEB)) {
    SETDSPLY(1);
    const y = SELECTLIB();
    m[CUROBJ] = y;
    if (y === 0) {
      m[CURNOISE] = 0;
      m[CURSCORE] = 0;
      return;
    }
    DISPLAYPOLY();
    DOSOUND();
    yield* release();
    return;
  }
  if (CRSRINRECT(S.ANDB)) {
    SETDSPLY(2);
    m[CUROBJ] = SELECTAND();
    DISPLAYAND();
    DOSOUND();
    yield* release();
    return;
  }
  if (CRSRINRECT(S.NOTEB)) {
    HLNOISE(m[CURNOISE]);
    m[LASTITEM + 1] = 0;
    if (yield* DOMENU(S.NOTEMENU, ROUTINES)) {
      DOSOUND();
      if (m[CUROBJ] !== 0) {
        HLNOISE(m[CURNOISE]);
        FIXOBJ();
        return;
      }
    }
    m[CURNOISE] = 0;
    FIXOBJ();
    return;
  }
  if (m[SLCTMODE] === 2 && CRSRINRECT(S.BMULTBOX)) {
    if (m[BMULT] !== 0) DRAWRECT(S.BMULTBOX);
    m[LASTITEM + 1] = 0;
    if (yield* DOMENU(S.BMULTMENU, ROUTINES)) {
      DRAWRECT(S.BMULTBOX);
      FIXOBJ();
      return;
    }
    m[BMULT] = 0;
    FIXOBJ();
    return;
  }
  if (CRSRINRECT(S.SCOREB)) {
    HLSCORE(m[CURSCORE]);
    m[LASTITEM + 1] = 0;
    if (yield* DOMENU(S.SCOREMENU, ROUTINES)) {
      if (m[CUROBJ] !== 0) {
        HLSCORE(m[CURSCORE]);
        FIXOBJ();
        return;
      }
    }
    m[CURSCORE] = 0;
    FIXOBJ();
  }
}

/** DOSOUND: the current note played (the effect it stands for), unless a later one plays */
function DOSOUND(): void {
  const y = m[CURNOISE];
  if (y === 0) return;
  const a = m[S.SOUNDCODE - 1 + y];
  if ((a - m[SERIES]) & 0x80) return;
  m[SERIES] = a;
}

function SETNOISE(): void {
  m[CURNOISE] = ((m[YTEMP] + 6) & 0xff) >> 2;
}

function SETSCORE(): void {
  m[CURSCORE] = ((m[YTEMP] + 6) & 0xff) >> 2;
}

function SETBMUL(): void {
  m[BMULT] = 0x80;
}

/** ADDWIRE: the screwdriver on a part: a wire from the picked gate to it (three at most) */
function* ADDWIRE(): Wait {
  if (m[SLCTMODE] !== 2) return;
  const o = SELECTLIB();
  if (o === 0) return;
  m[TEMP] = o;
  if (lbase(9) & 0x80) return;
  let y = m[S.TIMES4 - 1 + m[CUROBJ]];
  if (o === m[LOGIC + y] || o === m[LOGIC + y + 1] || o === m[LOGIC + y + 2]) return;
  if (m[LOGIC + y] === 0) {
    m[LOGIC + y] = m[TEMP];
    DRAWWIRE(m[TEMP], 2);
  } else {
    y++;
    if (m[LOGIC + y] === 0) {
      m[LOGIC + y] = m[TEMP];
      DRAWWIRE(m[TEMP], 7);
    } else {
      y++;
      if (m[LOGIC + y] !== 0) return;
      m[LOGIC + y] = m[TEMP];
      DRAWWIRE(m[TEMP], 12);
    }
  }
  yield* release();
}

/** CUTWIRE: the pliers on a part wired to the picked gate: the wire goes */
function* CUTWIRE(): Wait {
  if (m[SLCTMODE] !== 2) return;
  const o = SELECTLIB();
  if (o === 0) return;
  m[TEMP] = o;
  let y = m[S.TIMES4 - 1 + m[CUROBJ]];
  for (const contact of [2, 7, 12]) {
    if (o === m[LOGIC + y]) {
      m[LOGIC + y] = 0;
      DRAWWIRE(m[TEMP], contact);
      yield* release();
      return;
    }
    y++;
  }
}

/** FIXOBJ: the picked part's score byte, or the picked gate's output byte, from the choices */
function FIXOBJ(): void {
  const x = m[CUROBJ];
  if (x === 0) return;
  const s = m[SLCTMODE];
  if (s === 1) {
    m[(w(LBASE) + 9) & 0xffff] = ((m[CURNOISE] << 4) | m[CURSCORE]) & 0xff;
    return;
  }
  if (s !== 2) return;
  m[TEMP] = ((m[CURNOISE] << 4) | m[BMULT] | m[CURSCORE]) & 0xff;
  m[LOGIC + ((m[S.TIMES4 - 1 + x] + 3) & 0xff)] = m[TEMP];
}

/** SETDSPLY: mode A (1 a part, 2 a gate): the same mode's highlight toggles, a new one its menu */
function SETDSPLY(a: number): void {
  if (a === m[SLCTMODE]) {
    SETDSP2(a);
    return;
  }
  SETDSP2(m[SLCTMODE]);
  CLEARSB();
  m[SLCTMODE] = a;
  if (a === 1) SCMENU();
  else BNMENU();
}

function SETDSP2(a: number): void {
  if (a === 0) return;
  if (a === 1) DISPLAYPOLY();
  else DISPLAYAND();
}

/** SELECTLIB: the part under the cursor (its object number), or 0 */
function SELECTLIB(): number {
  const [hit, o] = SELECTPOLY();
  if (!hit) return 0;
  GETOBJ(o);
  if (m[OBJID] !== LIBOBJ) return 0;
  return m[NEXTOBJ];
}

/** SELECTAND: the gate the cursor's row is at (1..6) */
function SELECTAND(): number {
  const a = m[CURSORY];
  for (let y = 6; ; y--) {
    if (a >= m[S.TIMES15 - 1 + y]) return y;
    if (y === 0) return 0;
  }
}

/** DISPLAYPOLY: the picked part's score and note highlighted, a box round it (exclusive-or) */
function DISPLAYPOLY(): void {
  if (m[CUROBJ] === 0) return;
  const v = lbase(9) & 0x7f;
  m[TEMP] = v;
  m[CURSCORE] = v & 0x0f;
  HLSCORE(m[CURSCORE]);
  m[CURNOISE] = m[TEMP] >> 4;
  HLNOISE(m[CURNOISE]);
  GETBOUNDS();
  m[POLYB] = m[PARAM];
  m[POLYB + 3] = (m[PARAM + 1] - m[PARAM] + 1) & 0xff;
  m[POLYB + 1] = m[DIV7 + m[PARAM + 2]];
  m[POLYB + 2] = m[MOD7 + m[PARAM + 2]];
  const x = (m[PARAM + 3] - m[PARAM + 2]) & 0xff;
  m[POLYB + 4] = m[DIV7 + x];
  m[POLYB + 5] = m[MOD7 + x];
  DRAWRECT(POLYB);
}

/** DISPLAYAND: the picked gate's wires, bonus, multiplier and note, a box round it (exclusive-or) */
function DISPLAYAND(): void {
  const x = m[CUROBJ];
  if (x === 0) return;
  m[WIRE] = m[S.TIMES4 - 1 + x];
  for (const contact of [2, 7, 12]) {
    const o = m[LOGIC + m[WIRE]];
    if (o !== 0) DRAWWIRE(o, contact);
    m[WIRE] = (m[WIRE] + 1) & 0xff;
  }
  const v = m[LOGIC + m[WIRE]];
  m[TEMP] = v;
  m[CURSCORE] = v & 0x0f;
  HLSCORE(m[CURSCORE]);
  m[BMULT] = m[TEMP] & 0x80;
  if (m[BMULT] & 0x80) DRAWRECT(S.BMULTBOX);
  m[CURNOISE] = (m[TEMP] >> 4) & 0x07;
  HLNOISE(m[CURNOISE]);
  m[S.ANDBOX] = m[S.TIMES15 - 1 + m[CUROBJ]];
  DRAWRECT(S.ANDBOX);
}

/** HLSCORE: score A's box highlighted (exclusive-or) */
function HLSCORE(a: number): void {
  if (a === 0) return;
  m[S.SCBOX] = m[S.SCVERT - 1 + a];
  DRAWRECT(S.SCBOX);
}

/** HLNOISE: note A's box highlighted */
function HLNOISE(a: number): void {
  if (a === 0) return;
  m[S.NBOX] = m[S.NVERT - 1 + a];
  DRAWRECT(S.NBOX);
}

/** DRAWWIRE: a wire from object A's top right to contact Y of the picked gate (exclusive-or) */
function DRAWWIRE(o: number, contact: number): void {
  m[CONTACTY] = contact;
  GETOBJ(o);
  GETBOUNDS();
  m[X1] = m[PARAM + 3];
  m[Y1] = m[PARAM];
  m[X2] = 160;
  m[Y2] = (m[S.TIMES15 - 1 + m[CUROBJ]] + m[CONTACTY]) & 0xff;
  let x = m[X1];
  m[POLYB + 1] = m[DIV7 + x];
  m[POLYB + 2] = m[MOD7 + x];
  const mid = (m[X2] + m[X1]) >> 1;
  m[MIDX] = mid & 0xff;
  x = (mid - m[X1]) & 0xff;
  m[POLYB + 4] = m[DIV7 + x];
  m[POLYB + 5] = m[MOD7 + x];
  GETRECT(POLYB);
  HLINE(m[Y1]);
  x = m[MIDX];
  m[POLYB + 1] = m[DIV7 + x];
  m[POLYB + 2] = m[MOD7 + x];
  x = (m[X2] - m[MIDX]) & 0xff;
  m[POLYB + 4] = m[DIV7 + x];
  m[POLYB + 5] = m[MOD7 + x];
  GETRECT(POLYB);
  HLINE(m[Y2]);
  GETRECT(POLYB);
  let top = m[Y1];
  let bot = m[Y2];
  if (bot < m[Y1]) {
    top = m[Y2];
    bot = m[Y1];
  }
  m[TOP] = (top + 1) & 0xff;
  m[BOTTOM] = (bot - 1) & 0xff;
  VLINE(m[LFTDIV7], m[LFTMOD7]);
}

/** CLEARSB: the side bar cleared */
function CLEARSB(): void {
  SETMODE(3);
  DRAWRECT(S.SCOREB);
  SETMODE(2);
}

/** SCMENU: the scores' column */
function SCMENU(): void {
  let a = 4;
  for (let y = 0; y < 16; y++) {
    m[XTEMP] = y;
    m[CHAR + 2] = a;
    m[CHAR + 3] = 30;
    m[CHAR + 4] = 0;
    PRINT(m[S.TXTLO + y] | (m[S.TXTHI + y] << 8));
    a = (m[CHAR + 2] + 10) & 0xff;
    y = m[XTEMP];
  }
}

/** BNMENU: the bonuses' column and "BONUSX" */
function BNMENU(): void {
  let a = 4;
  for (let y = 0; y < 16; y++) {
    m[XTEMP] = y;
    m[CHAR + 2] = a;
    m[CHAR + 3] = 30;
    m[CHAR + 4] = 0;
    PRINT(m[S.TXTLO + 16 + y] | (m[S.TXTHI + 16 + y] << 8));
    a = (m[CHAR + 2] + 10) & 0xff;
    y = m[XTEMP];
  }
  m[CHAR + 2] = 0xaa;
  m[CHAR + 3] = 29;
  m[CHAR + 4] = 4;
  PRINT(S.BONUSX);
}

/** SOUND: every other loop, a slice of the current effect (WIRE.S's own copy of the routine) */
function SOUND(): void {
  if (m[ETIMER] & 1) {
    io.cycles += 3 + 2 + 2 + 6;
    return;
  }
  if (m[SERIES] & 0x80) {
    io.cycles += 3 + 2 + 2 + 3 + 2 + 6;
    return;
  }
  const t = soundSlice(m[SERIES], m[SLICE], STEMP, S.EFFECTS, S.NOTES, S.SOUND2, S.SOUND3, S.SOUND4);
  io.cycles += t + 12;
  m[SLICE] = (m[SLICE] + 1) & 0xff;
  if (m[(S.EFFECTS + 1 + m[STEMP]) & 0xffff] === 0) INITSOUND();
}

function INITSOUND(): void {
  m[SERIES] = 0xff;
  m[SLICE] = 0;
}

export const ROUTINES = new Map<number, MenuRoutine>([
  [S.INITHAND, INITHAND],
  [S.INITPLIER, INITPLIER],
  [S.INITDRIVER, INITDRIVER],
  [S.QUIT, QUIT],
  [S.SETNOISE, SETNOISE],
  [S.SETSCORE, SETSCORE],
  [S.SETBMUL, SETBMUL],
]);
