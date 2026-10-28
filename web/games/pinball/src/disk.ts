// DISK.S, "PCS disk I/O and keyboard handlers" (an overlay at $9500): Load and Save a table, Make a
// game disk, Play the game (RUN2.S), Quit; the slot and drive choices; typing a file name.
//
// Translated from Bill Budge's listing routine by routine. DISK.S reads and writes through DOS 3.3's
// file manager (JSR FMGR with its parameter list FMPL): the port's file manager below does the same
// calls on the player's server storage, a file a name. A table file is what the original's was: a
// DOS binary file (load address, length, then LOGIC, WSET, PBDATA and the painted screen, packed).
import {
  CHARTO, DOMENU, DRAWBITS, DRAWRECT, FRAMERECT3, INIT, INITCRSR, JSCTRL, LASTITEM, PRCHAR, PRINT, SETMODE,
  UPDATECRSR, XDRAWCRSR, XOFFDRAW, CRSRINRECT, type MenuRoutine,
} from './cdraw.ts';
import { SYM } from './image.ts';
import { button, io, keyboard, load, m, setw, strobe, w, type Wait, type WaitFor } from './machine.ts';
import { DRAWDISPLAY, GETOBJ, MAKEHOLE, MIDBTM, OBJ, PBDATA, SCANMODE } from './ppak.ts';
import { DISKPLAY, ONLINEPLAY, Reload } from './run2.ts';
import { CHARBUF, FM, FMPL, FileManager, fileName } from './fm.ts';

const S = SYM.DISK;

// zero page (DISK.S equates)
const PARAM = 0x00;
const TEMP = 0x07;
const XTEMP = 0x08;
const YTEMP = 0x09;
const BASE1 = 0x10;
const CHARINDX = 0xa6;
const CHARASCII = 0xa7;
const BOXCURSORON = 0xa8;
const DTIMER1 = 0xa9;
const DTIMER2 = 0xaa;
const DRIVE = 0xab;
const SLOT = 0xac;
const DISKCMD = 0xad;
const STACKTEMP = 0xae;

const GAMEBTM = 0x177d;
const GAMESTART = 0x8554;
const GAMETOP = 0x8f00;
const LINELEN = 0x1f1e;
const HIRES1 = 0x2000;
const HTOP = 0x4000;
const ERRMSGS = 0xa971;
const ERRTBL = 0xaa3f;
const PBBASE = 0x4000;

const CHAR = SYM.CDRAW.CHARBITS;

/** QUIT (LDX STACKTEMP; TXS; RTS): out of the disk menu, back to the construction set */
export class DiskQuit {}
/** LDX STACKTEMP; TXS; JMP START: the disk menu again */
class Again {}

// ---- DOS 3.3's file manager, on the player's storage ----

/** where files go: the player's server storage (or a test's map) */
export interface Files {
  read(name: string): Uint8Array | null | Promise<Uint8Array | null>;
  write(name: string, data: Uint8Array): void | Promise<void>;
}

export const files: { store: Files | null } = { store: null };

const fm = new FileManager();

/**
 * DOS 3.3's messages for its error codes, where DOS keeps them (ERRTBL, ERRMSGS: DISK.S prints them
 * letter by letter). DOS is not in Bill Budge's sources: the messages are DOS's words.
 */
export function dosMessages(ram: Uint8Array = m): void {
  const msgs = [
    '', 'LANGUAGE NOT AVAILABLE', 'RANGE ERROR', 'RANGE ERROR', 'WRITE PROTECTED', 'END OF DATA', 'FILE NOT FOUND',
    'VOLUME MISMATCH', 'I/O ERROR', 'DISK FULL', 'FILE LOCKED', 'SYNTAX ERROR', 'NO BUFFERS AVAILABLE', 'FILE TYPE MISMATCH',
  ];
  let at = 0;
  msgs.forEach((text, code) => {
    ram[ERRTBL + code] = at;
    const t = text || ' ';
    for (let i = 0; i < t.length; i++) ram[ERRMSGS + at + i] = t.charCodeAt(i) | (i === t.length - 1 ? 0x80 : 0);
    at += t.length;
  });
}

/** JSR FMGR: the call in FMPL; returns the carry (an error, its code in FMPL+10) */
function* FMGR(x: number): WaitFor<boolean> {
  const op = m[FMPL];
  let err: number = FM.OK;
  io.cycles += 20000;
  if (op === 1) {
    const store = files.store;
    if (!store) err = FM.IO_ERROR;
    else {
      let data: Uint8Array | null = null;
      try {
        const r = store.read(fileName(m));
        data = r instanceof Promise ? ((yield r) as Uint8Array | null) : r;
        err = fm.open(m, x, data);
      } catch {
        err = FM.IO_ERROR;
      }
    }
  } else if (op === 2) {
    const f = fm.close(m);
    if (f && files.store) {
      try {
        const r = files.store.write(f.name, f.data);
        if (r instanceof Promise) yield r;
      } catch {
        err = FM.DISK_FULL;
      }
    }
  } else if (op === 3 || op === 4) err = fm.rw(m);
  else err = FM.RANGE;
  m[FMPL + 10] = err;
  return err !== FM.OK;
}

// ---- the menu ----

/** the disk menu: the overlay's entry ($9500: TSX; STX STACKTEMP) */
export function* DISK(): Wait {
  // TSX: the 6502's stack pointer, which the port does not have. The original's is $F7 the first
  // time (BOOT2's $FF less DOCMD's JSR DOMENU, DISKIO's JSR SWAPDISK, SWAPDISK's JSR SWAPPIECE and
  // SWAPPIECE's JSR $9500) and lower after each visit here or to the wiring kit (SWAPDISK and
  // SWAPWIRE leave by a JMP into EDIT.S); it only ever goes back into S (QUIT, RELOAD).
  m[STACKTEMP] = 0xf7;
  for (;;) {
    try {
      yield* START();
      return;
    } catch (e) {
      if (e instanceof DiskQuit) return;
      if (!(e instanceof Again)) throw e;
    }
  }
}

function* START(): Wait {
  // the menu's words: LOAD, SAVE, QUIT, MAKE GAME, PLAY GAME at column $18; SLOT 4-7, DRIVE 1-2 at $20
  let a = 0x4d;
  let y = 0;
  for (;;) {
    m[XTEMP] = y;
    m[CHAR + 2] = a;
    m[CHAR + 3] = 0x18;
    m[CHAR + 4] = 0;
    PRINT(m[S.TXTLO + y] | (m[S.TXTHI + y] << 8));
    a = m[CHAR + 2] + 10;
    y = m[XTEMP];
    if (y === 2 || y === 4) a += 11;
    a &= 0xff;
    y++;
    if (y === 7) break;
  }
  a = 0x4d;
  for (;;) {
    m[XTEMP] = y;
    m[CHAR + 2] = a;
    m[CHAR + 3] = 0x20;
    m[CHAR + 4] = 0;
    PRINT(m[S.TXTLO + y] | (m[S.TXTHI + y] << 8));
    a = m[CHAR + 2] + 10;
    y = m[XTEMP] + 1;
    if (y === 11) a += 11;
    a &= 0xff;
    if (y === 13) break;
  }
  INITCRSR(S.HAND);
  m[DRIVE] = 1;
  HLDRIVE(1);
  m[SLOT] = 6;
  HLSLOT(6);
  for (;;) {
    // MAIN: button 0 only
    JSCTRL();
    yield* UPDATECRSR();
    if (!(button(0) & 0x80)) continue;
    if (CRSRINRECT(S.SLOTB)) {
      HLSLOT(m[SLOT]);
      m[LASTITEM + 1] = 0;
      if (!(yield* DOMENU(S.SLOTMENU, ROUTINES))) m[SLOT] = 6;
      HLSLOT(m[SLOT]);
      continue;
    }
    if (CRSRINRECT(S.DRIVEB)) {
      HLDRIVE(m[DRIVE]);
      m[LASTITEM + 1] = 0;
      if (!(yield* DOMENU(S.DRIVEMENU, ROUTINES))) m[DRIVE] = 1;
      HLDRIVE(m[DRIVE]);
      continue;
    }
    if (CRSRINRECT(S.MENUBOX)) {
      m[LASTITEM + 1] = 0;
      yield* DOMENU(S.DISKMENU, ROUTINES);
    }
  }
}

function SETSLOT(): void {
  m[SLOT] = ((m[YTEMP] + 18) & 0xff) >> 2;
}

function SETDRIVE(): void {
  m[DRIVE] = ((m[YTEMP] + 6) & 0xff) >> 2;
}

function HLSLOT(a: number): void {
  m[S.SLOTBOX] = m[S.SLVERT - 4 + a];
  DRAWRECT(S.SLOTBOX);
}

function HLDRIVE(a: number): void {
  m[S.DRIVEBOX] = m[S.DRVERT - 1 + a];
  DRAWRECT(S.DRIVEBOX);
}

/** LOAD: a table file into PBBASE, its painted screen unpacked, the table drawn; the menu again */
function* LOAD(): Wait {
  yield* GETNAME();
  INPROMPT1();
  m[DISKCMD] = 0;
  yield* OPEN(1);
  m[FMPL] = 3;
  m[FMPL + 1] = 4;
  ZPOSN();
  m[FMPL + 6] = 4;
  m[FMPL + 7] = 0;
  m[FMPL + 8] = (PBBASE - 4) & 0xff;
  m[FMPL + 9] = (PBBASE - 4) >> 8;
  yield* DOFCMD();
  m[FMPL + 1] = 2;
  m[FMPL + 6] = m[PBBASE - 2];
  m[FMPL + 7] = m[PBBASE - 1];
  m[FMPL + 8] = PBBASE & 0xff;
  m[FMPL + 9] = PBBASE >> 8;
  yield* DOFCMD();
  yield* CLOSE();
  INIT();
  GETOBJ(m[PBDATA]);
  DECOMPRESS();
  m[SCANMODE] = 0;
  DRAWDISPLAY();
  throw new Again();
}

/** SAVE: the table's parts off the screen, the painting packed after them, all of it saved */
function* SAVE(): Wait {
  yield* GETNAME();
  INPROMPT1();
  m[DISKCMD] = 1;
  m[SCANMODE] = 0x80;
  DRAWDISPLAY();
  COMPRESS();
  setw(PARAM, PBBASE);
  setw(PARAM + 2, (w(MIDBTM) - PBBASE) & 0xffff);
  yield* BSAVE();
  m[SCANMODE] = 0;
  DRAWDISPLAY();
  throw new Again();
}

/** BSAVE: a DOS binary file: PARAM's address and length in front (at PARAM-4), then the bytes */
function* BSAVE(): Wait {
  yield* OPEN(0);
  m[FMPL] = 4;
  m[FMPL + 1] = 4;
  ZPOSN();
  const at = (w(PARAM) - 4) & 0xffff;
  setw(FMPL + 8, at);
  setw(TEMP, at);
  // the length "LESS 1": DOS writes a range one byte longer than it is told (fm.ts)
  setw(FMPL + 6, (w(PARAM + 2) + 3) & 0xffff);
  m[at] = m[PARAM];
  m[(at + 1) & 0xffff] = m[PARAM + 1];
  m[(at + 2) & 0xffff] = m[PARAM + 2];
  m[(at + 3) & 0xffff] = m[PARAM + 3];
  yield* DOFCMD();
  yield* CLOSE();
}

function ZPOSN(): void {
  m[FMPL + 2] = 0;
  m[FMPL + 3] = 0;
  m[FMPL + 4] = 0;
  m[FMPL + 5] = 0;
}

function* CLOSE(): Wait {
  m[FMPL] = 2;
  yield* DOFCMD(1);
}

function* OPEN(x: number): Wait {
  m[FMPL] = 1;
  ZPOSN();
  m[FMPL + 5] = m[DRIVE];
  m[FMPL + 6] = m[SLOT];
  m[FMPL + 7] = 4;
  m[FMPL + 8] = CHARBUF & 0xff;
  m[FMPL + 9] = CHARBUF >> 8;
  yield* DOFCMD(x);
}

/** DOFCMD: the file manager call; an error is shown (and the menu comes back) */
function* DOFCMD(x = 1): Wait {
  m[FMPL + 12] = 0x00;
  m[FMPL + 13] = 0x04;
  m[FMPL + 14] = 0x00;
  m[FMPL + 15] = 0x05;
  m[FMPL + 16] = 0x00;
  m[FMPL + 17] = 0x06;
  if (yield* FMGR(x)) yield* ERROR();
}

/** ERROR: DOS's message in the dialog box until a key; then the menu (or out, after Make) */
function* ERROR(): Wait {
  if (m[DISKCMD] === 1) {
    m[SCANMODE] = 1;
    DRAWDISPLAY();
  }
  DODIALOG();
  CHARTO(0, 1, 0x59);
  let x = m[ERRTBL + m[FMPL + 10]];
  for (;;) {
    const c = m[ERRMSGS + x];
    m[XTEMP] = x;
    const a = c & 0x7f;
    if (a === 0x20) {
      let mod = m[CHAR + 4] + 4;
      if (mod >= 7) {
        mod -= 7;
        m[CHAR + 3] = (m[CHAR + 3] + 1) & 0xff;
      }
      m[CHAR + 4] = mod;
    } else if (a >= 0x41 && a < 0x5b) PRCHAR(a - 0x37);
    x = m[XTEMP];
    if (m[ERRMSGS + x] & 0x80) break;
    x = (x + 1) & 0xff;
  }
  yield* waitKey();
  UNDODIALOG();
  if (m[DISKCMD] === 2) MAKEOUT();
  throw new Again();
}

function* waitKey(): Wait {
  for (;;) {
    io.cycles += 10;
    if (keyboard() & 0x80) break;
    yield;
  }
  strobe();
}

function QUIT(): void {
  throw new DiskQuit();
}

/** MAKE: a game disk: RUN2.S in, the whole game (CDRAW.S to RUN2.S, the screen, the table) saved */
function* MAKE(): Wait {
  yield* GETNAME();
  const y = m[CHARINDX];
  m[CHARBUF + y] = 0xa0;
  m[CHARBUF + y + 1] = 0xa0;
  m[CHARBUF + y + 2] = 0xa0;
  m[DISKCMD] = 2;
  CLEARMENU();
  MAKEHOLE(191);
  SWAPUSER();
  INPROMPT1();
  m[GAMEBTM] = 0x4c;
  m[GAMEBTM + 1] = GAMESTART & 0xff;
  m[GAMEBTM + 2] = GAMESTART >> 8;
  setw(PARAM, GAMEBTM);
  setw(PARAM + 2, GAMETOP - GAMEBTM);
  yield* BSAVE();
  MAKEOUT();
}

/** MAKEOUT: the HI table's end back (BSAVE's header went over it); then RELOAD */
function MAKEOUT(): never {
  setw(TEMP, GAMEBTM - 4);
  let a = 0x3f;
  for (let y = 6; y >= 0; y--) {
    m[GAMEBTM - 4 + y] = a;
    a = (a - 4) & 0xff;
  }
  throw new Reload(m[STACKTEMP]);
}

/** PLAY: the game on this table (RUN2.S DISKPLAY), Esc back to the construction set */
function* PLAY(): Wait {
  CLEARMENU();
  MAKEHOLE(191);
  SWAPUSER();
  yield* DISKPLAY();
  throw new Reload(m[STACKTEMP]);
}

/**
 * Online play (not in the original): what LOAD does with a table file once DOS has read it (its
 * address and length to PBBASE-4, its bytes to PBBASE), then PLAY's game for the room's players.
 * The game ends after the last ball (no Esc back to the construction set: the page goes back).
 */
export function* ONLINEGAME(file: Uint8Array, players: number): Wait {
  m.set(file, PBBASE - 4);
  INIT();
  GETOBJ(m[PBDATA]);
  DECOMPRESS();
  m[SCANMODE] = 0;
  DRAWDISPLAY();
  // the disk menu's cursor, as START puts it up after LOAD, in the menu's pen mode, exclusive-or
  // (CLEARMENU takes it off again)
  SETMODE(2);
  INITCRSR(S.HAND);
  CLEARMENU();
  MAKEHOLE(191);
  SWAPUSER();
  yield* ONLINEPLAY(players);
}

/**
 * A table file that LOAD and DECOMPRESS take as the original would: loaded at PBBASE, its length
 * within the room up to the bitmaps, its parts within it, the packed screen after them unpacked
 * within the hi-res page and ended (PinballModule.validTable checks the same). Returns the file
 * without what follows its length (the rest of DOS's last sector), or null.
 */
export function tableFile(f: Uint8Array): Uint8Array | null {
  if (f.length < 4 + 0x1e) return null;
  const length = f[2] | (f[3] << 8);
  if ((f[0] | (f[1] << 8)) !== PBBASE || length < 0x1e || length > 0x3000 || f.length < 4 + length) return null;
  const t = f.slice(0, 4 + length);
  const n = t[4 + 0x1c];
  if (n === 0 || 0x1d + n > length) return null;
  let at = 0x1d + n;
  for (let i = 1; i <= n; i++) at += t[4 + 0x1c + i];
  let out = 0x2000;
  for (;;) {
    if (at >= length) return null;
    const a = t[4 + at];
    if (a === 1) {
      if (at + 1 >= length) return null;
      const z = t[4 + at + 1];
      if (z === 1) return t;
      out += z || 256;
      at += 2;
    } else {
      const k = a || 256;
      out += k;
      at += 1 + k;
    }
    if (out > 0x4100) return null;
  }
}

/** SWAP.S SWAPUSER: RUN2.S read in over $8500 */
export function SWAPUSER(): void {
  load('RUN2');
}

/**
 * INPROMPT1: "INSERT YOUR GAME DISK AND HIT A KEY". The port has no disks to put in: it goes on as
 * the original does once the key is hit (the box drawn and taken away again), without waiting for
 * one (a deviation the browser forces).
 */
function INPROMPT1(): void {
  DODIALOG();
  CHARTO(0, 1, 0x59);
  PRINT(S.INSERTMSG);
  strobe();
  // WAIT1: a key
  strobe();
  UNDODIALOG();
}

/** CLEARMENU: the menu's area cleared */
function CLEARMENU(): void {
  XDRAWCRSR();
  SETMODE(3);
  DRAWRECT(S.MENUBOX);
  SETMODE(2);
}

/** DODIALOG: the screen under the dialog box saved ($A000), the box cleared and framed */
function DODIALOG(): void {
  SETMODE(1);
  DRAWBITS(S.DIALOGBITS);
  SETMODE(3);
  DRAWRECT(S.DIALOGBOX);
  SETMODE(2);
  FRAMERECT3();
}

/** UNDODIALOG: the screen under the box back; the file manager's buffers ($400-$6FF) cleared */
function UNDODIALOG(): void {
  SETMODE(0);
  DRAWBITS(S.DIALOGBITS);
  m.fill(0, 0x400, 0x700);
  SETMODE(2);
}

/** GETNAME: a file name typed in the dialog box (Return; Esc: the menu again); ".PB" put after it */
function* GETNAME(): Wait {
  CLEARMENU();
  DODIALOG();
  for (let y = 29; y >= 0; y--) m[CHARBUF + y] = 0xa0;
  m[S.BOXCURSOR + 3] = 1;
  m[S.BOXCURSOR + 4] = 0;
  m[BOXCURSORON] = 0;
  m[CHARINDX] = 0;
  CHARTO(0, 1, 0x59);
  let ok: boolean;
  for (;;) {
    // GETN3
    CHECKCURSOR();
    io.cycles += 30;
    const k = keyboard();
    if (!(k & 0x80)) {
      yield;
      continue;
    }
    strobe();
    m[CHARASCII] = k;
    if (k === 0x9b) {
      ok = false;
      break;
    }
    if (k === 0x8d) {
      ok = true;
      break;
    }
    CURSOROFF();
    DOKBD(m[CHARASCII]);
    CURSOROFF();
  }
  CURSOROFF();
  UNDODIALOG();
  const y = m[CHARINDX];
  m[CHARBUF + y] = 0xae;
  m[CHARBUF + y + 1] = 0xd0;
  m[CHARBUF + y + 2] = 0xc2;
  if (!ok) throw new Again();
}

/** DOKBD: a key in the name: a letter, a digit, a space, or backspace (at most 27) */
function DOKBD(a: number): void {
  const y = m[CHARINDX];
  if (a === 0x88) {
    // DOKB7
    const p = (y - 1) & 0xff;
    if (p & 0x80) return;
    m[CHARINDX] = p;
    const c3 = m[LINELEN + p];
    m[CHAR + 3] = c3;
    m[S.CLRRECT + 1] = c3;
    m[S.BOXCURSOR + 3] = c3;
    const c4 = m[LINELEN + 27 + p];
    m[CHAR + 4] = c4;
    m[S.CLRRECT + 2] = c4;
    m[S.BOXCURSOR + 4] = c4;
    m[CHARBUF + p] = 0xa0;
    SETMODE(3);
    DRAWRECT(S.CLRRECT);
    SETMODE(2);
    return;
  }
  if (y >= 27) return;
  if (a === 0xa0) {
    m[CHARBUF + y] = a;
    m[LINELEN + y] = m[CHAR + 3];
    let x = m[CHAR + 3];
    m[LINELEN + 27 + y] = m[CHAR + 4];
    let mod = m[CHAR + 4] + 4;
    if (mod >= 7) {
      mod -= 7;
      x = (x + 1) & 0xff;
    }
    m[CHAR + 3] = x;
    m[S.BOXCURSOR + 3] = x;
    m[CHAR + 4] = mod;
    m[S.BOXCURSOR + 4] = mod;
    m[CHARINDX] = (m[CHARINDX] + 1) & 0xff;
    return;
  }
  let ch: number;
  if (a >= 0xb0 && a < 0xba) ch = a - 0xb0;
  else if (a >= 0xc1 && a < 0xdb) ch = a - 0xb7;
  else return;
  // DOKB3
  m[CHARBUF + y] = m[CHARASCII];
  m[LINELEN + y] = m[CHAR + 3];
  m[LINELEN + 27 + y] = m[CHAR + 4];
  PRCHAR(ch);
  m[S.BOXCURSOR + 3] = m[CHAR + 3];
  m[S.BOXCURSOR + 4] = m[CHAR + 4];
  m[CHARINDX] = (m[CHARINDX] + 1) & 0xff;
}

/** CURSOROFF: the box cursor drawn again if it is on (exclusive-or) */
function CURSOROFF(): void {
  if (m[BOXCURSORON]) XOFFDRAW(S.BOXCURSOR);
}

/** CHECKCURSOR: the box cursor blinks (every 8192 polls) */
function CHECKCURSOR(): void {
  m[DTIMER1] = (m[DTIMER1] + 1) & 0xff;
  if (m[DTIMER1] !== 0) return;
  m[DTIMER2] = (m[DTIMER2] + 1) & 0xff;
  if (m[DTIMER2] & 0x1f) return;
  m[BOXCURSORON] ^= 0xff;
  XOFFDRAW(S.BOXCURSOR);
}

// ---- the painted screen, packed ----

/**
 * COMPRESS: hi-res page 1 packed after MIDBTM: [1, n] n zeros (0: 256), [n, n bytes] bytes as they
 * are (0: 256), [1, 1] the end. $3FFF and $4000 hold $FF while it runs (the end of the zeros).
 */
function COMPRESS(): void {
  setw(BASE1, HIRES1);
  const keep = m[HTOP];
  m[HTOP - 1] = 0xff;
  m[HTOP] = 0xff;
  const b = (i: number) => m[(w(BASE1) + i) & 0xffff];
  const put = (i: number, v: number) => {
    m[(w(MIDBTM) + i) & 0xffff] = v & 0xff;
  };
  const addw = (zp: number, n: number) => setw(zp, (w(zp) + n) & 0xffff);
  /** FINDNZ3, FINDNZ4: 256 bytes as they are */
  const literal256 = () => {
    put(0, 0);
    addw(MIDBTM, 1);
    for (let k = 0; k < 256; k++) put(k, b(k));
    m[BASE1 + 1] = (m[BASE1 + 1] + 1) & 0xff;
    m[MIDBTM + 1] = (m[MIDBTM + 1] + 1) & 0xff;
  };
  for (;;) {
    // FINDZ
    let y = 0;
    let zeros256 = true;
    do {
      if (b(y) !== 0) {
        zeros256 = false;
        break;
      }
      y = (y + 1) & 0xff;
    } while (y !== 0);
    if (zeros256) {
      put(0, 1);
      put(1, 0);
      m[BASE1 + 1] = (m[BASE1 + 1] + 1) & 0xff;
      addw(MIDBTM, 2);
      continue;
    }
    // FINDZ3
    if (m[BASE1 + 1] < HTOP >> 8 && y < 2) {
      // FINDNZ: bytes as they are, up to two zeros in a row
      y = (y + 1) & 0xff;
      for (;;) {
        // FINDNZ2
        if (b(y) === 0) {
          // FINDNZ5
          y = (y + 1) & 0xff;
          if (y === 0) {
            literal256();
            break;
          }
          if (b(y) !== 0) continue;
          m[TEMP] = y;
          put(0, y);
          addw(MIDBTM, 1);
          for (let k = 0; k < 256; k++) put(k, b(k));
          addw(BASE1, m[TEMP]);
          addw(MIDBTM, m[TEMP]);
          break;
        }
        y = (y + 1) & 0xff;
        if (y === 0) {
          literal256();
          break;
        }
      }
      continue;
    }
    // FINDZ4: y zeros (or the end)
    m[TEMP] = y;
    put(0, 1);
    put(1, y);
    addw(BASE1, y);
    addw(MIDBTM, 2);
    if (m[BASE1 + 1] < HTOP >> 8) continue;
    put(0, 1);
    put(1, 1);
    addw(MIDBTM, 2);
    m[HTOP] = keep;
    return;
  }
}

/** DECOMPRESS: COMPRESS's records from OBJ (after the parts) back onto hi-res page 1 */
function DECOMPRESS(): void {
  setw(BASE1, HIRES1);
  const keep = m[HTOP];
  for (;;) {
    // DCMP2
    const o = w(OBJ);
    const a = m[o];
    if (a === 1) {
      const n = m[(o + 1) & 0xffff];
      if (n === 1) {
        m[HTOP] = keep;
        return;
      }
      m[TEMP] = n;
      let y = (n - 1) & 0xff;
      do {
        m[(w(BASE1) + y) & 0xffff] = 0;
        y = (y - 1) & 0xff;
      } while (y !== 0);
      m[w(BASE1)] = 0;
      if (n === 0) m[BASE1 + 1] = (m[BASE1 + 1] + 1) & 0xff;
      else setw(BASE1, (w(BASE1) + n) & 0xffff);
      setw(OBJ, (w(OBJ) + 2) & 0xffff);
      continue;
    }
    // DCMP6: a bytes as they are
    m[TEMP] = a;
    setw(OBJ, (w(OBJ) + 1) & 0xffff);
    let y = (a - 1) & 0xff;
    do {
      m[(w(BASE1) + y) & 0xffff] = m[(w(OBJ) + y) & 0xffff];
      y = (y - 1) & 0xff;
    } while (y !== 0);
    m[w(BASE1)] = m[w(OBJ)];
    if (a === 0) m[BASE1 + 1] = (m[BASE1 + 1] + 1) & 0xff;
    else setw(BASE1, (w(BASE1) + a) & 0xffff);
    if (a === 0) m[OBJ + 1] = (m[OBJ + 1] + 1) & 0xff;
    else setw(OBJ, (w(OBJ) + a) & 0xffff);
  }
}

export const ROUTINES = new Map<number, MenuRoutine>([
  [S.SETSLOT, SETSLOT],
  [S.SETDRIVE, SETDRIVE],
  [S.LOAD, LOAD],
  [S.SAVE, SAVE],
  [S.QUIT, QUIT],
  [S.MAKE, MAKE],
  [S.PLAY, PLAY],
]);
