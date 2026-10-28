// PPAK.S, "polygon scan conversion, pinball data base construction": the object list in PBDATA
// (GETOBJ ...), drawing an object (DRAWOBJ), scan converting its polygon into hi-res bars and into the
// ball's table of spans per row (SCANPOLY, PROCESSPOLY, DOSCAN), the hole that keeps that table in
// two parts (GETSCAN, MAKEHOLE), and what the construction set asks of polygons (SELECTPOLY,
// POLYPOINTS, REMOVEPOLY, GETBOUNDS, ALIGNPOLY).
//
// The table of spans: for every row y, PBDX[y] bytes of 4-byte records [left x, object, right x,
// slope codes (right << 4 | left)]. Rows 1..MIDY lie packed below MIDBTM, rows MIDY+1..191 packed
// from MIDTOP up to PBDX; the free space between them is the hole a polygon is merged into.
import { ADDIYX, DIV7, LO, HI, MOD7, MOVEDOWN, MOVEUP, SUBYX, XOFFDRAW, GETCURSORX, CURSORY } from './cdraw.ts';
import { SYM } from './image.ts';
import { cy, m, setw, w } from './machine.ts';

const S = SYM.PPAK;

export const POLYGON = 1;
export const BPOLYGON = 2;
export const LIBOBJ = 3;

// zero page (PPAK.S equates)
export const PARAM = 0x00;
export const TEMP = 0x07;
export const XTEMP = 0x08;
export const YTEMP = 0x09;
const BASE1 = 0x10;
const LFTDIV7 = 0x15;
const LEFTMASK = 0x18;
const RTDIV7 = 0x1a;
const RIGHTMASK = 0x1d;
const X1 = 0x10;
const Y1 = 0x11;
const X2 = 0x12;
const Y2 = 0x13;
const DX = 0x14;
const DY = 0x15;
const DXCOEFF = 0x16;
const DXFRACT = 0x17;
const DXCODE = 0x18;
const QUOT = 0x19;
const DVSR = 0x1b;
const DVDND = 0x1d;
const SCANLINE = 0x1f;
const NEXTSTART = 0x20;
const STARTCOUNT = 0x21;
const FIRSTACTV = 0x22;
const LASTLINK = 0x23;
const WRAPPOINT = 0x24;
export const HCNT = 0x25;
const HCNT2 = 0x26;
export const OBJ = 0x91;
export const NEXTOBJ = 0x93;
export const OBJCOUNT = 0x94;
export const PLYPTRX = 0x95;
export const PLYPTRY = 0x97;
export const OBJID = 0x99;
export const FILLCOLOR = 0x9a;
export const VRTXCOUNT = 0x9b;
export const LBASE = 0x9c;
export const SCANMODE = 0x9e;
export const MEMBTM = 0x9f;
export const MIDBTM = 0xa1;
export const MIDTOP = 0xa3;
export const MIDY = 0xa5;
const ANEXT = 0xc0;
const ANVRTX = 0xc8;
const AYFLG = 0xd0;
const AXCOEFF = 0xd8;
const AXFRACT = 0xe0;
const ADXCOEFF = 0xe8;
const ADXFRACT = 0xf0;
const ADXCODE = 0xf8;
const COLORBAR = 0x200;
const NVRTX = 0x240;
const NDXCOEFF = 0x280;
const NDXFRACT = 0x2c0;
const NDXCODE = 0x300;
const DXBUFR = 0x340;

export const LOGIC = 0x4000;
export const WSET = 0x4018;
export const PBDATA = 0x401c;
export const PBDX = 0x6f40;

/** a polygon's x / y of vertex i */
const px = (i: number) => m[(w(PLYPTRX) + i) & 0xffff];
const py = (i: number) => m[(w(PLYPTRY) + i) & 0xffff];

/** the scan was given up: too many starts, a full table or a row with too many spans */
class Abort {}

// ---- the object list ----

/** DRAWDISPLAY: draws every object and builds the ball's table from scratch */
export function DRAWDISPLAY(): void {
  m[OBJCOUNT] = m[PBDATA];
  GETOBJ(m[PBDATA]);
  m[MEMBTM] = m[OBJ];
  m[MIDBTM] = m[OBJ];
  m[MEMBTM + 1] = m[OBJ + 1];
  m[MIDBTM + 1] = m[OBJ + 1];
  setw(MIDTOP, PBDX);
  m[MIDY] = 1;
  m.fill(0, PBDX, PBDX + 192);
  GETOBJ(0);
  for (;;) {
    DRAWOBJ();
    m[NEXTOBJ] = (m[NEXTOBJ] + 1) & 0xff;
    GETNEXTOBJ(m[NEXTOBJ]);
    if (m[NEXTOBJ] === m[OBJCOUNT]) return;
  }
}

/** GETOBJ: object Y: OBJ, OBJID and its polygon (PLYPTRX/Y, LBASE); NEXTOBJ = Y */
export function GETOBJ(y: number): void {
  setw(OBJ, PBDATA + 1);
  m[NEXTOBJ] = y;
  GETNEXTOBJ(0);
}

/** GETNEXTOBJ: adds the sizes from PBDATA,Y up to NEXTOBJ to OBJ, then GETOBJ3 */
export function GETNEXTOBJ(y: number): void {
  for (;;) {
    setw(OBJ, (w(OBJ) + m[PBDATA + y]) & 0xffff);
    if (y === m[NEXTOBJ]) break;
    y = (y + 1) & 0xff;
    if (y === 0) break; // (BNE falls through into GETOBJ3)
  }
  GETOBJ3();
}

/** GETOBJ3: SCANMODE keeps only "no merge", then GETINFO */
export function GETOBJ3(): void {
  m[SCANMODE] &= 0x80;
  GETINFO();
}

/** GETINFO (GETOBJ3+6): the object at OBJ */
export function GETINFO(): void {
  const id = m[w(OBJ)];
  m[OBJID] = id;
  if (id === POLYGON) GETOBJ4();
  else if (id === BPOLYGON) {
    m[SCANMODE] |= 0x40;
    GETOBJ4();
  } else {
    GETOBJ4();
    ADDIYX(m[VRTXCOUNT], PLYPTRY, LBASE);
  }
}

function GETOBJ4(): void {
  const o = w(OBJ);
  m[FILLCOLOR] = m[(o + 1) & 0xffff];
  m[VRTXCOUNT] = m[(o + 2) & 0xffff];
  ADDIYX(3, OBJ, PLYPTRX);
  ADDIYX(m[VRTXCOUNT], PLYPTRX, PLYPTRY);
}

/**
 * DRAWOBJ: a part's bitmap (exclusive-or), then its polygon: drawn and merged into the ball's table
 * unless SCANMODE says not to. Returns the carry: true when the scan was given up.
 */
export function DRAWOBJ(): boolean {
  cy('DRAWOBJ');
  const id = m[OBJID];
  if (id >= LIBOBJ + 1) return true;
  if (id === LIBOBJ) XOFFDRAW(w(LBASE));
  return SCANPOLY();
}

/** SETCOLOR: COLORBAR, the 40 bytes of a row in colour Y (CLRPATCH: two bytes a colour) */
export function SETCOLOR(y: number): void {
  cy('SETCOLOR');
  for (let x = 39; x >= 0; x -= 2) {
    m[COLORBAR + x] = m[S.CLRPATCH + 1 + y];
    m[COLORBAR + x - 1] = m[S.CLRPATCH + y];
  }
}

// ---- scan conversion ----

/** SCANPOLY: true (carry) when given up */
export function SCANPOLY(): boolean {
  cy('SCANPOLY');
  try {
    if (!(m[SCANMODE] & 0x80)) {
      const y = GETMINY();
      MAKEHOLE((y + 1) & 0xff);
    }
    SETCOLOR(m[FILLCOLOR]);
    if (m[FILLCOLOR] === 0) POLYPOINTS();
    PROCESSPOLY();
    // INITSTARTS
    if (m[NEXTSTART] & 0x80) return false;
    m[SCANLINE] = m[AYFLG + m[NEXTSTART]];
    for (;;) {
      ADDSTARTS();
      // SCANPLY2
      cy('SCANPLY2');
      m[HCNT] = 0;
      let a = m[FIRSTACTV];
      if (a & 0x80) return false;
      do {
        // SCANPLY3
        cy('SCANPLY3');
        const x = a;
        let skip = false;
        if (m[AYFLG + x] === m[SCANLINE]) {
          const y = m[ANVRTX + x];
          const nv = m[NVRTX + y];
          if (nv & 0x80) {
            // the edge ends: off the active list
            if (x === m[FIRSTACTV]) {
              a = m[ANEXT + x];
              m[FIRSTACTV] = a;
            } else {
              a = m[ANEXT + x];
              m[ANEXT + m[XTEMP]] = a;
            }
            skip = true;
          } else {
            // SCANPLY5: it chains on to the next edge
            m[ANVRTX + x] = nv;
            m[ADXCOEFF + x] = m[NDXCOEFF + y];
            m[ADXFRACT + x] = m[NDXFRACT + y];
            m[ADXCODE + x] = m[NDXCODE + y];
            m[AXCOEFF + x] = px(y);
            m[AXFRACT + x] = 0;
            m[AYFLG + x] = py(m[ANVRTX + x]);
          }
        }
        if (!skip) {
          // SCANPLY6: the edge's x halfway through the row
          cy('SCANPLY6');
          let t = m[AXFRACT + x] + m[ADXFRACT + x];
          m[AXFRACT + x] = t & 0xff;
          const old = m[AXCOEFF + x];
          m[TEMP] = old;
          t = old + m[ADXCOEFF + x] + (t >> 8);
          const nw = t & 0xff;
          m[AXCOEFF + x] = nw;
          const mid = (nw + old) >> 1;
          let hc = m[HCNT];
          m[(w(MIDBTM) + hc) & 0xffff] = mid;
          hc++;
          m[(w(MIDBTM) + hc) & 0xffff] = m[NEXTOBJ];
          m[DXBUFR + hc] = m[ADXCODE + x];
          hc++;
          m[HCNT] = hc & 0xff;
          m[XTEMP] = x;
          a = m[ANEXT + x];
        }
      } while (!(a & 0x80));
      DOSCAN();
      m[SCANLINE] = (m[SCANLINE] + 1) & 0xff;
    }
  } catch (e) {
    if (e instanceof Abort) return true;
    throw e;
  }
}

/** ADDSTARTS: the starts at this scan line join the active list, sorted by x (then slope) */
function ADDSTARTS(): void {
  cy('ADDSTARTS');
  let x = m[NEXTSTART];
  if (x & 0x80) return;
  for (;;) {
    // ADDSTARTS2
    cy('ADDSTARTS2');
    if (m[AYFLG + x] !== m[SCANLINE]) {
      m[NEXTSTART] = x;
      return;
    }
    m[AYFLG + x] = py(m[ANVRTX + x]);
    m[TEMP] = m[ANEXT + x];
    let a = m[FIRSTACTV];
    let head = false;
    if (a & 0x80) head = true;
    else {
      let y = a;
      for (;;) {
        // ADDSTARTS3
        cy('ADDSTARTS3');
        let after: boolean;
        const ax = m[AXCOEFF + x];
        const ay = m[AXCOEFF + y];
        if (ax < ay) after = false;
        else if (ax > ay) after = true;
        else {
          // ADDSTARTS6: the slopes, signed
          const borrow = m[ADXFRACT + x] < m[ADXFRACT + y] ? 1 : 0;
          const hx = m[ADXCOEFF + x];
          const hy = m[ADXCOEFF + y];
          const r = (hx - hy - borrow) & 0xff;
          const v = ((hx ^ hy) & (hx ^ r) & 0x80) !== 0;
          const n = v ? hx & 0x80 : r & 0x80;
          after = n === 0;
        }
        if (after) {
          // ADDSTARTS4
          m[YTEMP] = y;
          a = m[ANEXT + y];
          if (!(a & 0x80)) {
            y = a;
            continue;
          }
          m[ANEXT + x] = a;
          m[ANEXT + y] = x;
          break;
        }
        // ADDSTARTS7: ahead of y
        if (y === m[FIRSTACTV]) {
          a = y;
          head = true;
          break;
        }
        m[ANEXT + x] = y;
        m[ANEXT + m[YTEMP]] = x;
        break;
      }
    }
    if (head) {
      // ADDSTARTS5
      m[ANEXT + x] = a;
      m[FIRSTACTV] = x;
    }
    // ADDSTARTS8
    x = m[TEMP];
    if (x & 0x80) {
      m[NEXTSTART] = x;
      return;
    }
  }
}

/** PROCESSPOLY: walks the polygon's edges: starts, chains and ends (PROCESSVERTEX) */
function PROCESSPOLY(): void {
  cy('PROCESSPOLY');
  m[STARTCOUNT] = 0;
  m[LASTLINK] = 0;
  m[Y1] = py(0);
  m[X1] = px(0);
  let y = 1;
  m[WRAPPOINT] = 1;
  let c = 1;
  for (;;) {
    [y, c] = PROCESSVERTEX(y, c);
    m[X1] = px(y);
    m[Y1] = py(y);
    y = (y + 1) & 0xff;
    if (y === m[WRAPPOINT]) break;
    if (y === m[VRTXCOUNT]) y = 0;
  }
  PROCESSVERTEX(y, c);
  SORTSTARTS();
}

/** SORTSTARTS: the start records into a list by row (NEXTSTART, ANEXT) */
function SORTSTARTS(): void {
  cy('SORTSTARTS');
  let x = 0;
  m[NEXTSTART] = 0;
  m[ANEXT] = 0x80;
  m[FIRSTACTV] = 0x80;
  for (;;) {
    x = (x + 1) & 0xff;
    if (x === m[STARTCOUNT]) return;
    let a = m[NEXTSTART];
    for (;;) {
      const y = a;
      if (m[AYFLG + x] < m[AYFLG + y]) {
        m[ANEXT + x] = y;
        if (y === m[NEXTSTART]) m[NEXTSTART] = x;
        else m[ANEXT + m[YTEMP]] = x;
        break;
      }
      // SORTST5
      m[YTEMP] = y;
      a = m[ANEXT + y];
      if (!(a & 0x80)) continue;
      m[ANEXT + x] = a;
      m[ANEXT + y] = x;
      break;
    }
  }
}

/**
 * PROCESSVERTEX: the edge from V1 (X1, Y1) to vertex Y, with the carry telling whether the edge
 * before went down. Returns the vertex index to go on from (horizontal edges after it are skipped)
 * and the carry for the next one.
 */
function PROCESSVERTEX(y: number, cin: number): [number, number] {
  cy('PROCESSVERTEX');
  const p0 = cin;
  m[X2] = px(y);
  let t = m[X2] - m[X1];
  m[DX] = t & 0xff;
  const p1 = t >= 0 ? 1 : 0;
  const a = py(y);
  m[Y2] = a;
  m[TEMP] = y;
  // skip the horizontal edges that follow
  do {
    y = (y + 1) & 0xff;
    if (y >= m[VRTXCOUNT]) y = 0;
  } while (a === py(y));
  y = (y - 1) & 0xff;
  if (y & 0x80) y = (m[VRTXCOUNT] - 1) & 0xff;
  t = a - m[Y1];
  m[DY] = t & 0xff;
  if (t >= 0) {
    // V2 below V1: the edge goes down
    DIVIDE(p1);
    if (p0) {
      // chain
      const x = m[LASTLINK];
      m[NVRTX + x] = y;
      m[NDXCOEFF + x] = m[DXCOEFF];
      m[NDXFRACT + x] = m[DXFRACT];
      m[NDXCODE + x] = m[DXCODE];
      m[LASTLINK] = y;
      return [y, 1];
    }
    // PRVRTX3: a start
    const x = m[STARTCOUNT];
    if (x >= 8) throw new Abort();
    m[YTEMP] = y;
    m[ANVRTX + x] = y;
    m[AXCOEFF + x] = m[X1];
    m[ADXCOEFF + x] = m[DXCOEFF];
    m[ADXFRACT + x] = m[DXFRACT];
    m[ADXCODE + x] = m[DXCODE];
    const l = m[LASTLINK];
    m[ANVRTX + x + 1] = m[NVRTX + l];
    m[AXCOEFF + x + 1] = px(l);
    m[ADXCOEFF + x + 1] = m[NDXCOEFF + l];
    m[ADXFRACT + x + 1] = m[NDXFRACT + l];
    m[ADXCODE + x + 1] = m[NDXCODE + l];
    m[AYFLG + x] = m[Y1];
    m[AYFLG + x + 1] = m[Y1];
    m[AXFRACT + x] = 0;
    m[AXFRACT + x + 1] = 0;
    m[STARTCOUNT] = (x + 2) & 0xff;
    y = m[YTEMP];
    m[LASTLINK] = y;
    return [y, 1];
  }
  // PRVRTX4: the edge goes up: DY and DX negated
  m[DY] = (-t) & 0xff;
  m[DX] = (-m[DX]) & 0xff;
  DIVIDE(p1 ? 0 : 1);
  m[YTEMP] = y;
  y = m[TEMP];
  if (p0) {
    // an end: V1 above V2 below V3
    m[NVRTX + m[LASTLINK]] = 0x80;
  }
  // PRVRTX5
  m[NVRTX + y] = m[LASTLINK];
  m[NDXCOEFF + y] = m[DXCOEFF];
  m[NDXFRACT + y] = m[DXFRACT];
  m[NDXCODE + y] = m[DXCODE];
  m[LASTLINK] = y;
  return [m[YTEMP], 0];
}

/** DIVIDE: DX/DY as 8.8 (DXCOEFF.DXFRACT) and its slope code 0..16; carry = DX's sign (1: right) */
function DIVIDE(c: number): void {
  cy('DIVIDE');
  const dx = m[DX];
  if (dx === 0) {
    m[DXCOEFF] = 0;
    m[DXFRACT] = 0;
    m[DXCODE] = 8;
    return;
  }
  const mag = c ? dx : (-dx) & 0xff;
  let x = mag;
  let a = m[DY];
  if (a !== 0) {
    m[DVSR + 1] = a;
    m[DVDND + 1] = x;
    [a, x] = QDIV();
  }
  m[DXCOEFF] = x;
  m[DXFRACT] = a;
  let code: number;
  if (x >= 16) code = 0;
  else if (x >= 1) code = m[S.DXCODESA + x];
  else code = m[S.DXCODESB + (a >> 4)];
  m[DXCODE] = code;
  if (!c) {
    m[DXCODE] = (16 - code) & 0xff;
    const f = (~m[DXFRACT] & 0xff) + 1;
    m[DXFRACT] = f & 0xff;
    m[DXCOEFF] = ((~m[DXCOEFF] & 0xff) + (f >> 8)) & 0xff;
  }
}

/** QDIV: DVDND (high byte set) / DVSR (high byte set): 16-bit quotient in A (low), X (high) */
function QDIV(): [number, number] {
  cy('QDIV');
  m[QUOT] = 0;
  m[QUOT + 1] = 0;
  m[DVSR] = 0;
  m[DVDND] = 0;
  let x = 8;
  let a = m[DVSR + 1];
  let c: number;
  // QDV1: scale the divisor up to the dividend
  for (;;) {
    x++;
    c = a >> 7;
    a = (a << 1) & 0xff;
    if (c) break;
    if (a >= m[DVDND + 1]) {
      c = 0;
      break;
    }
  }
  // QDV2
  const nc = a & 1;
  a = (a >> 1) | (c << 7);
  c = nc;
  m[DVSR + 1] = a;
  x--;
  let sub = x === 0;
  for (;;) {
    if (!sub) {
      // QDV5: compare
      if (m[DVDND + 1] < m[DVSR + 1]) c = 0;
      else if (m[DVDND + 1] > m[DVSR + 1]) {
        c = 1;
        sub = true;
      } else if (m[DVDND] >= m[DVSR]) {
        c = 1;
        sub = true;
      } else c = 0;
    }
    if (sub) {
      // QDV3
      let t = m[DVDND] - m[DVSR] - (1 - c);
      m[DVDND] = t & 0xff;
      c = t >= 0 ? 1 : 0;
      t = m[DVDND + 1] - m[DVSR + 1] - (1 - c);
      m[DVDND + 1] = t & 0xff;
      c = t >= 0 ? 1 : 0;
      sub = false;
    }
    // QDV4
    let t = (m[QUOT] << 1) | c;
    m[QUOT] = t & 0xff;
    c = t >> 8;
    t = (m[QUOT + 1] << 1) | c;
    m[QUOT + 1] = t & 0xff;
    x = (x - 1) & 0xff;
    if (x & 0x80) return [m[QUOT], m[QUOT + 1]];
    const lc = m[DVSR + 1] & 1;
    m[DVSR + 1] >>= 1;
    m[DVSR] = (m[DVSR] >> 1) | (lc << 7);
  }
}

/** DOSCAN: draws the row's bars and merges its records into the ball's table */
function DOSCAN(): void {
  cy('DOSCAN');
  const line = m[SCANLINE];
  m[BASE1] = m[LO + line];
  m[BASE1 + 1] = m[HI + line];
  let y = m[HCNT];
  if (y !== 0) {
    const mb = w(MIDBTM);
    let x = 0;
    let first = true;
    for (;;) {
      if (first && m[SCANMODE] & 0x40) {
        x = 153; // a B-polygon: from the last edge to the right side
      } else {
        // DOSCN2
        cy('DOSCN2');
        y = (y - 2) & 0xff;
        if (y & 0x80) break;
        x = m[(mb + y) & 0xffff];
      }
      first = false;
      // DOSCN3
      cy('DOSCN3');
      y = (y - 2) & 0xff;
      const a = m[(mb + y) & 0xffff];
      m[YTEMP] = y;
      DOBAR(a, x);
      y = m[YTEMP];
      if (y === 2) {
        // a B-polygon: from the left side to the first edge
        y = 0;
        DOBAR(0, m[mb]);
        break;
      }
    }
  }
  // DOSCN4: merge
  cy('DOSCN4');
  if (m[SCANMODE] & 0x80) return;
  let hc = m[HCNT];
  if (hc === 0) return;
  const sum = hc + m[PBDX + line];
  const rowFull = sum > 0xff;
  m[PBDX + line] = sum & 0xff;
  // the hole's size (more than 255: $80), less the new records: at least 32 must stay free
  const lo = m[MIDTOP] - m[MIDBTM];
  let c = lo >= 0 ? 1 : 0;
  let room = lo & 0xff;
  const hi = m[MIDTOP + 1] - m[MIDBTM + 1] - (1 - c);
  c = hi >= 0 ? 1 : 0;
  if ((hi & 0xff) !== 0) room = 0x80;
  const enough = ((room - hc - (1 - c)) & 0xff) >= 32;
  // DOSCN5: the slope codes of each pair into the record's last byte
  const mb = w(MIDBTM);
  let yy = hc;
  do {
    cy('DOSCN5');
    yy = (yy - 1) & 0xff;
    m[(mb + yy) & 0xffff] = ((m[DXBUFR + yy] << 4) & 0xff) | m[DXBUFR + yy - 2];
    yy = (yy - 3) & 0xff;
  } while (yy !== 0);
  ADDIYX(m[HCNT], MIDBTM, MIDBTM);
  if (!enough) throw new Abort();
  if (rowFull) throw new Abort();
  if (line >= 191) return;
  m[MIDY] = (m[MIDY] + 1) & 0xff;
  hc = m[PBDX + line + 1];
  if (hc === 0) return;
  // the next row's records come down from MIDTOP
  const mt = w(MIDTOP);
  const nb = w(MIDBTM);
  let k = hc;
  do {
    // DOSCN6
    cy('DOSCN6');
    k--;
    m[(nb + k) & 0xffff] = m[(mt + k) & 0xffff];
  } while (k !== 0);
  m[TEMP] = hc;
  ADDIYX(hc, MIDBTM, MIDBTM);
  ADDIYX(m[TEMP], MIDTOP, MIDTOP);
}

/** DOBAR: a bar from A to X in COLORBAR's colour, exclusive-or, on the row at BASE1 */
function DOBAR(a: number, x: number): void {
  cy('DOBAR');
  m[TEMP] = x;
  if (a >= x) {
    const t = a;
    a = x;
    x = t;
  }
  m[LFTDIV7] = m[DIV7 + a];
  m[LEFTMASK] = m[SYM.CDRAW.MASKS + m[MOD7 + a]] ^ 0xff;
  m[RTDIV7] = m[DIV7 + x];
  m[RIGHTMASK] = m[SYM.CDRAW.MASKS + 1 + m[MOD7 + x]] ^ 0x80;
  const b1 = w(BASE1);
  let y = m[LFTDIV7];
  let v = m[LEFTMASK];
  if (y === m[RTDIV7]) {
    v = v ^ m[RIGHTMASK] ^ 0xff;
    if (v !== 0) {
      // DOBAR4
      cy('DOBAR4');
      plot(b1, y, v);
      return;
    }
    v = 0xff;
  }
  for (;;) {
    // DOBAR3
    cy('DOBAR3');
    plot(b1, y, v);
    y = (y + 1) & 0xff;
    if (y >= m[RTDIV7]) break;
    v = 0xff;
  }
  // DOBAR4
  cy('DOBAR4');
  plot(b1, y, m[RIGHTMASK]);
}

function plot(b1: number, y: number, mask: number): void {
  const p = (b1 + y) & 0xffff;
  m[p] = (mask & m[COLORBAR + y]) ^ m[p];
}

// ---- the table of spans ----

/** GETSCAN: TEMP = where row Y's records start */
export function GETSCAN(y: number): void {
  m[YTEMP] = y;
  if (y <= m[MIDY]) {
    let t = w(MIDBTM);
    for (;;) {
      t = (t - m[PBDX + y]) & 0xffff;
      y = (y + 1) & 0xff;
      if (y > m[MIDY]) break;
    }
    setw(TEMP, t);
    return;
  }
  let t = w(MIDTOP);
  for (;;) {
    y = (y - 1) & 0xff;
    if (y === m[MIDY]) break;
    t = t + m[PBDX + y];
    if (t > 0xffff) {
      // (the original falls into GETMINY here)
      setw(TEMP, t & 0xffff);
      return;
    }
  }
  setw(TEMP, t);
}

/** GETMINY: the polygon's smallest y */
export function GETMINY(): number {
  cy('GETMINY');
  let a = py(0);
  let y = 1;
  for (;;) {
    if (py(y) < a) a = py(y);
    y = (y + 1) & 0xff;
    if (y === m[VRTXCOUNT]) return a;
  }
}

/** MAKEHOLE: moves the hole to just below row Y (MIDY = Y - 1) */
export function MAKEHOLE(y: number): void {
  cy('MAKEHOLE');
  GETSCAN(y);
  y = (y - 1) & 0xff;
  const below = y < m[MIDY];
  m[MIDY] = y;
  if (below) {
    MOVEUP(MIDBTM, TEMP, MIDTOP);
    SUBYX(TEMP, MIDBTM);
    SUBYX(MIDBTM, MIDTOP);
    m[MIDBTM] = m[TEMP];
    m[MIDBTM + 1] = m[TEMP + 1];
    return;
  }
  MOVEDOWN(TEMP, MIDTOP, MIDBTM);
  SUBYX(TEMP, MIDTOP);
  SUBYX(MIDTOP, MIDBTM);
  m[MIDTOP] = m[TEMP];
  m[MIDTOP + 1] = m[TEMP + 1];
}

// ---- for the construction set ----

/** SELECTPOLY: the object under the cursor (not the outline): [true, object] or [false] */
export function SELECTPOLY(): [boolean, number] {
  const row = m[CURSORY];
  const n = m[PBDX + row];
  if (n === 0) return [false, 0];
  m[HCNT] = n;
  GETSCAN(row);
  let a = GETCURSORX();
  m[YTEMP] = a;
  const t = w(TEMP);
  let y = m[HCNT];
  for (;;) {
    // SELPLY2
    y = (y - 2) & 0xff;
    const right = m[(t + y) & 0xffff];
    if (a <= right) {
      y = (y - 2) & 0xff;
      if (a >= m[(t + y) & 0xffff]) {
        y = (y + 1) & 0xff;
        const o = m[(t + y) & 0xffff];
        if (o !== 0) return [true, o];
        // SELPLY3: inside the outline's free space
        y = (y + 1) & 0xff;
        a = m[YTEMP];
        y = (y - 2) & 0xff;
      }
    } else {
      // SELPLY4
      y = (y - 2) & 0xff;
    }
    // SELPLY5
    if (y === 0) return [false, a];
  }
}

/** POLYPOINTS: the polygon's vertices as 3x3 dots, exclusive-or */
export function POLYPOINTS(): void {
  const P = S.POINT;
  let y = 0;
  for (;;) {
    m[P + 2] = (py(y) - 1) & 0xff;
    const x = (px(y) - 1) & 0xff;
    m[P + 3] = m[DIV7 + x];
    m[P + 4] = m[MOD7 + x];
    m[YTEMP] = y;
    XOFFDRAW(P);
    y = (m[YTEMP] + 1) & 0xff;
    if (y === m[VRTXCOUNT]) return;
  }
}

/** REMOVEPOLY: takes object NEXTOBJ's records out of the ball's table */
export function REMOVEPOLY(): void {
  MAKEHOLE(GETMINY());
  let x = m[MIDY];
  for (;;) {
    x = (x + 1) & 0xff;
    if (x >= 191 || m[PBDX + x] === 0) {
      m[MIDY] = (x - 1) & 0xff;
      return;
    }
    m[HCNT] = m[PBDX + x] >> 2;
    m[HCNT2] = 0;
    do {
      const mt = w(MIDTOP);
      const o = m[(mt + 1) & 0xffff];
      if (o === m[NEXTOBJ]) {
        m[HCNT2] = (m[HCNT2] + 1) & 0xff;
      } else {
        const mb = w(MIDBTM);
        m[(mb + 1) & 0xffff] = o;
        m[(mb + 2) & 0xffff] = m[(mt + 2) & 0xffff];
        m[(mb + 3) & 0xffff] = m[(mt + 3) & 0xffff];
        m[mb] = m[mt];
        setw(MIDBTM, (mb + 4) & 0xffff);
      }
      setw(MIDTOP, (w(MIDTOP) + 4) & 0xffff);
      m[HCNT] = (m[HCNT] - 1) & 0xff;
    } while (m[HCNT] !== 0);
    if (m[HCNT2] === 0) {
      m[MIDY] = x;
      return;
    }
    m[TEMP] = (m[HCNT2] << 2) & 0xff;
    m[PBDX + x] = (m[PBDX + x] - m[TEMP]) & 0xff;
  }
}

/** GETBOUNDS: PARAM = min y, +1 max y, +2 min x, +3 max x */
export function GETBOUNDS(): void {
  m[PARAM] = m[PARAM + 1] = py(0);
  m[PARAM + 2] = m[PARAM + 3] = px(0);
  let y = 1;
  for (;;) {
    const vy = py(y);
    if (vy < m[PARAM]) m[PARAM] = vy;
    if (vy >= m[PARAM + 1]) m[PARAM + 1] = vy;
    const vx = px(y);
    if (vx < m[PARAM + 2]) m[PARAM + 2] = vx;
    if (vx >= m[PARAM + 3]) m[PARAM + 3] = vx;
    y = (y + 1) & 0xff;
    if (y === m[VRTXCOUNT]) return;
  }
}

/** ALIGNPOLY: rotates the vertices until the first edge goes down; false (carry clear) when done */
export function ALIGNPOLY(): boolean {
  m[YTEMP] = 0;
  for (;;) {
    if (py(0) < py(1)) return false;
    m[YTEMP] = (m[YTEMP] + 1) & 0xff;
    if (m[YTEMP] === m[VRTXCOUNT]) return true;
    const y0 = py(0);
    const x0 = px(0);
    const bx = w(PLYPTRX);
    const by = w(PLYPTRY);
    let y = 1;
    do {
      const vy = m[(by + y) & 0xffff];
      const vx = m[(bx + y) & 0xffff];
      m[(bx + y - 1) & 0xffff] = vx;
      m[(by + y - 1) & 0xffff] = vy;
      y = (y + 1) & 0xff;
    } while (y !== m[VRTXCOUNT]);
    y = (y - 1) & 0xff;
    m[(bx + y) & 0xffff] = x0;
    m[(by + y) & 0xffff] = y0;
    if (y0 === 0) return false;
  }
}
