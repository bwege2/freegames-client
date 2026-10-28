// RUN2.S, "PCS -- pinball stuff": the game on a table, as the construction set's Play Game (DISK.S
// PLAY) and a made game disk run it: 1 to 4 players taking turns, five balls each, every player's
// table state kept apart (P1STATE ...), the balls caught in holes kept for their player
// ("sleepers"). MAKETBLS also makes the bitmap tables the drawing routines use ($0800-$177F).
//
// RUN2.S is an overlay: it comes in over the end of RUN.S at $8554 (SWAP.S SWAPUSER) and uses
// RUN.S's part routines, MOVEBALL, DRAWBALL, INITB2 and ADVANCE where they stay.
import { CHARTO, PRINT, XOFFDRAW } from './cdraw.ts';
import { SYM } from './image.ts';
import { PREAD, WAIT, button, cy, io, keyboard, m, setw, strobe, w, type Wait } from './machine.ts';
import { LIBOBJ } from './ppak.ts';
import {
  ADVANCE, DOSCORE2, DOSND, DRAWBALL, INITB2, PRBMULT, PRSCORE2, SND, WIRING, jsr, tables,
  type SoundCopy, type WiringCopy,
} from './run.ts';

const S2 = SYM.RUN2;

// zero page (RUN2.S equates)
const PARAM = 0x00;
const TEMP = 0x07;
const XTEMP = 0x08;
const YTEMP = 0x09;
const BASE1 = 0x10;
const BASE2 = 0x12;
const SHIFTOUT = 0x14;
const SIGN = 0x15;
const SHIFTCOUNT = 0x16;
export const PLAYER = 0x80;
export const PLAYERCNT = 0x81;
export const BALLS = 0x82;
export const SLEEPCNT = 0x83;
const PBASE1 = 0x84;
const PBASE2 = 0x86;
const PBASE3 = 0x88;
const PBASE4 = 0x8a;
export const LASTY = 0x8c;
export const LIVEBALLS = 0x8d;
export const GAMEMODE = 0x8e;
const STGL = 0x3e;
const OBJ = 0x91;
const NEXTOBJ = 0x93;
const OBJCOUNT = 0x94;
const OBJID = 0x99;
const FILLCOLOR = 0x9a;
const VRTXCOUNT = 0x9b;
const LBASE = 0x9c;
export const STACKTEMP = 0xae;
const RUNLEN = 0xc0;
const PDL0 = 0xc1;
const PDL1 = 0xc2;
const BUTN0 = 0xc3;
const BUTN1 = 0xc4;
export const PTIMER1 = 0xc5;
const PTIMER2 = 0xc6;
const SERIES = 0xc8;
const SLICE = 0xc9;
const STEMP = 0xca;
const DSCORE = 0xcb;
const DBONUS = 0xcc;
const BMULT = 0xcd;
const INITMODE = 0xce;
const SCBASE = 0xcf;
const BSTAT = 0xd1;
const Y2 = 0xd5;

export const SHFRSLT = 0x800;
export const SHFOUT = 0xe00;
export const DIV7 = 0x1400;
export const MOD7 = 0x1500;
export const LO = 0x1600;
export const HI = 0x16c0;

export const P1STATE = 0x8f00;
export const SLEEPCODE = 0x9700;
export const SLEEPLO = 0x9800;
export const SLEEPHI = 0x9900;
export const SLEEPERS = 0x9a00;

const VECTLO = 0x580;
const VECTHI = 0x600;
const RUNCHN = 0x680;
const TIME = 0x700;
const WSET = 0x4018;
const PBDATA = 0x401c;
const WMOD2 = 0x80bc;
const WMOD3 = 0x7cd6;
const WMOD4 = 0x81da;

const CHAR = SYM.CDRAW.CHARBITS;

/** JMP RELOAD: back to the construction set (SWAP.S reloads it); thrown through the game's calls */
export class Reload {
  readonly stacktemp: number;
  constructor(stacktemp: number) {
    this.stacktemp = stacktemp;
  }
}

const lb = (y: number) => m[(w(LBASE) + y) & 0xffff];
const setlb = (y: number, v: number) => {
  m[(w(LBASE) + y) & 0xffff] = v & 0xff;
};

const SOUND: SoundCopy = { effects: S2.EFFECTS, notes: S2.NOTES, snd2: S2.SOUND2, snd3: S2.SOUND3, snd4: S2.SOUND4 };
const WIRES: WiringCopy = { bonustbl: S2.BONUSTBL, sndtbl: S2.SOUNDTBL, tmod1: S2.TMOD1, prbmult: () => PRBMULT(0x48) };

// ---- the main loop ----

/** MAIN: a game disk's game (Esc does not quit) */
export function* MAIN(): Wait {
  m[STGL] = 0;
  yield* MAIN0(0xff);
}

/** DISKPLAY: the construction set's Play Game (Esc goes back) */
export function* DISKPLAY(): Wait {
  yield* MAIN0(0);
}

function* MAIN0(mode: number): Wait {
  m[GAMEMODE] = mode;
  MAKETBLS();
  INITWORLD();
  // STA $C050, $C052, $C054, $C057: graphics, full screen, page 1, hi-res (what the port shows)
  for (;;) yield* MAIN2();
}

/**
 * Online play (not in the original): DISKPLAY's start, then one game for the room's players, who
 * are counted in as if the space bar had been pressed for each but the first (GETPLAYERCNT's
 * screen and the button that ends it are skipped: the room's seats are the players).
 */
export function* ONLINEPLAY(players: number): Wait {
  m[GAMEMODE] = 0;
  MAKETBLS();
  INITWORLD();
  yield* MAIN2(players);
}

/** GETPLAYERCNT's drawing for a count chosen elsewhere: space for each player but the first, a button */
function COUNTPLAYERS(players: number): void {
  PRINTPLAYER(0);
  strobe();
  let y = 0;
  while (y + 1 < players) {
    y++;
    m[XTEMP] = y;
    PRINTPLAYER(y);
    y = m[XTEMP];
  }
  m[PLAYERCNT] = y;
  for (let k = y; ; k--) {
    m[XTEMP] = k;
    PRINTPLAYER(k);
    if (k === 0) break;
  }
  m[PLAYERCNT] = (m[PLAYERCNT] + 1) & 0xff;
}

/** MAIN2: one game: the players' count, then five balls each in turn */
function* MAIN2(players = 0): Wait {
  MAKEBDSPLY();
  m[TEMP] = 14;
  do {
    WAIT(0);
    yield;
    m[TEMP] = (m[TEMP] - 1) & 0xff;
  } while (m[TEMP] !== 0);
  m[SLEEPCNT] = 0;
  INITPLAYERS();
  if (players) COUNTPLAYERS(players);
  else yield* GETPLAYERCNT();
  let b = 0;
  for (;;) {
    // MAIN3
    m[BALLS] = b;
    let p = 0;
    for (;;) {
      // MAIN4
      m[PLAYER] = p;
      io.onBall?.(p);
      PRINTPLAYER(p);
      DOSOUND(0x38);
      yield* DOBALL();
      TALLY();
      m[BMULT] = 0;
      PRBMULT(0x48);
      PRINTPLAYER(m[PLAYER]);
      p = (m[PLAYER] + 1) & 0xff;
      if (p >= m[PLAYERCNT]) break;
    }
    MAKEBALL(m[BALLS]);
    b = (m[BALLS] + 1) & 0xff;
    if (b >= 5) return;
  }
}

/** GETPLAYERCNT: space for one more player (up to 4, then back to 1), a button starts */
function* GETPLAYERCNT(): Wait {
  PRINTPLAYER(0);
  strobe();
  for (;;) {
    // GETPL2
    let y = 0;
    for (;;) {
      // GETPL3
      io.cycles += 4 + 4 + 2;
      if ((button(0) | button(1)) & 0x80) {
        m[PLAYERCNT] = y;
        for (let k = y; ; k--) {
          m[XTEMP] = k;
          PRINTPLAYER(k);
          if (k === 0) break;
        }
        m[PLAYERCNT] = (m[PLAYERCNT] + 1) & 0xff;
        // WAIT3: until the button is let go
        for (;;) {
          io.cycles += 4 + 4 + 2;
          if (!((button(0) | button(1)) & 0x80)) break;
          yield;
        }
        return;
      }
      // GETPL5
      io.cycles += 4 + 2;
      const k = keyboard();
      if (!(k & 0x80)) {
        yield;
        continue;
      }
      strobe();
      if (k === 0x9b && !(m[GAMEMODE] & 0x80)) QUIT();
      if ((k & 0x7f) !== 0x20) continue;
      y++;
      if (y >= 4) {
        PRINTPLAYER(1);
        PRINTPLAYER(2);
        PRINTPLAYER(3);
        break;
      }
      m[XTEMP] = y;
      PRINTPLAYER(y);
      y = m[XTEMP];
    }
  }
}

/** QUIT: Esc in the players' count: the parts as the construction set had them, then RELOAD */
function QUIT(): never {
  CLOSE2();
  throw new Reload(m[STACKTEMP]);
}

/** MAKEBDSPLY: the five balls' row */
function MAKEBDSPLY(): void {
  for (let y = 4; y >= 0; y--) {
    m[YTEMP] = y;
    MAKEBALL(y);
  }
}

/** MAKEBALL: ball Y of the row, exclusive-or */
function MAKEBALL(y: number): void {
  m[S2.MBALL + 3] = (y + 0x23) & 0xff;
  XOFFDRAW(S2.MBALL);
}

function INITPLAYERS(): void {
  m[DSCORE] = 0;
  m[DBONUS] = 0;
  for (let y = 44; y >= 0; y--) m[S2.SCORE1 + y] = 0;
  INITSOUND();
  m[INITMODE] = 0;
  INITOBJS();
  for (let x = 0; x < 4; x++) SAVEPLAYER(x);
}

/** TALLY: the bonus times the multiplier into the player's score */
function TALLY(): void {
  const y0 = m[PLAYER];
  m[SCBASE] = m[S2.SCTBLO + y0];
  m[SCBASE + 1] = m[S2.SCTBHI + y0];
  const sc = (i: number) => (w(SCBASE) + i) & 0xffff;
  for (;;) {
    // TALLY2
    let y = 7;
    for (;;) {
      let x = 0;
      let a = m[sc(y)] + m[S2.BONUS + y];
      a &= 0xff;
      while (a >= 10) {
        a -= 10;
        x++;
      }
      m[sc(y)] = a;
      y--;
      m[sc(y)] = (x + m[sc(y)]) & 0xff;
      if (y === 0) break;
    }
    if (m[BMULT] === 1) break;
    m[BMULT] = (m[BMULT] - 1) & 0xff;
    if (m[BMULT] & 0x80) break;
  }
  for (let y = 7; y >= 0; y--) m[S2.BONUS + y] = 0;
  SCORE();
}

// ---- the tables, the table's setup, the score display ----

/**
 * MAKETBLS: the bitmap tables; the sleepers' places; the parts' run list (VECTLO/HI, RUNCHN, TIME)
 * and the rows' spans (PBTBLO/HI, LASTY); the score display.
 */
export function MAKETBLS(): void {
  MAKETABLES();
  // SLEEPLO, SLEEPHI: 22 bytes a sleeper from SLEEPERS
  m[TEMP] = SLEEPERS & 0xff;
  m[TEMP + 1] = SLEEPERS >> 8;
  m[SLEEPCNT] = 0;
  let a = SLEEPERS >> 8;
  for (let y = 0; y < 256; y++) {
    m[SLEEPHI + y] = a;
    let t = m[TEMP];
    m[SLEEPLO + y] = t;
    t += 22;
    m[TEMP] = t & 0xff;
    a = (m[TEMP + 1] + (t >> 8)) & 0xff;
    m[TEMP + 1] = a;
  }
  // the game's setup
  m[OBJCOUNT] = m[PBDATA];
  m[RUNLEN] = 0;
  GETOBJ(0);
  for (;;) {
    // SETUP2
    const x = m[NEXTOBJ];
    if (m[OBJID] === LIBOBJ) {
      m[VECTLO + x] = m[LBASE];
      m[VECTHI + x] = m[LBASE + 1];
      m[TIME + x] = lb(8);
      setlb(8, 0);
      m[RUNCHN + m[RUNLEN]] = x;
      m[RUNLEN] = (m[RUNLEN] + 1) & 0xff;
    } else {
      m[VECTLO + x] = 0;
      m[VECTHI + x] = 0;
    }
    m[NEXTOBJ] = (m[NEXTOBJ] + 1) & 0xff;
    GETNEXTOBJ(m[NEXTOBJ]);
    if (m[NEXTOBJ] === m[OBJCOUNT]) break;
  }
  tables(w(OBJ), LASTY);
  // INITSCORES
  m[BMULT] = 0;
  CHARTO(0, 0x18, 0x48);
  PRINT(S2.BMMSG);
  PRBMULT(0x48);
  for (let x = 3; x >= 0; x--) {
    m[PLAYER] = x;
    m[CHAR + 2] = m[S2.SCVERT + x];
    PRSCORE(m[S2.SCTBLO + x] | (m[S2.SCTBHI + x] << 8));
  }
  CHARTO(0, 0x18, 0x58);
  PRINT(S2.BMSG);
  PRSCORE(S2.BONUS);
}

function PRSCORE(at: number): void {
  setw(SCBASE, at);
  PRSCORE2(SCBASE);
}

/** SCORE: DSCORE into the player's score, DBONUS into the bonus, both printed */
function SCORE(): void {
  cy('SCORE');
  const x = m[PLAYER];
  m[CHAR + 2] = m[S2.SCVERT + x];
  setw(SCBASE, m[S2.SCTBLO + x] | (m[S2.SCTBHI + x] << 8));
  // JSR DOSCORE: SCBASE, Y = 7, into DOSCORE2
  cy('DOSCORE');
  DOSCORE2(7, m[DSCORE], SCBASE, () => PRSCORE2(SCBASE));
  m[CHAR + 2] = 0x58;
  setw(SCBASE, S2.BONUS);
  DOSCORE2(5, m[DBONUS], SCBASE, () => PRSCORE2(SCBASE));
  m[DSCORE] = 0;
  m[DBONUS] = 0;
}

/** PRINTPLAYER: "PLAYER n" at the player's score row, exclusive-or */
function PRINTPLAYER(y: number): void {
  m[CHAR + 2] = m[S2.SCVERT + y];
  m[CHAR + 3] = 0x18;
  m[CHAR + 4] = 0;
  PRINT(m[S2.PMSGLO + y] | (m[S2.PMSGHI + y] << 8));
}

/** DOSOUND: as RUN.S DOSND */
function DOSOUND(a: number): void {
  DOSND(a);
}

function INITSOUND(): void {
  m[SERIES] = 0xff;
  m[SLICE] = 0;
}

// ---- a ball ----

/** DOBALL: the player's turn: their table back, play until no ball lives, then 256 jiffies more */
function* DOBALL(): Wait {
  cy('DOBALL');
  m[INITMODE] = 0;
  INITOBJS();
  RESTOREPLAYER(m[PLAYER]);
  for (;;) {
    // DOBALL2
    m[LIVEBALLS] = 0;
    yield* PLAY();
    const k = keyboard();
    if (k & 0x80) {
      strobe();
      if (k === 0x9b) {
        if (!(m[GAMEMODE] & 0x80)) {
          CLOSEOBJS();
          SAVEPLAYER(m[PLAYER]);
          throw new Reload(m[STACKTEMP]);
        }
      } else if (k === 0x93) m[STGL] ^= k;
    }
    if (m[LIVEBALLS] === 0) break;
  }
  m[PTIMER1] = 0;
  do yield* PLAY();
  while (m[PTIMER1] !== 0);
  SAVEPLAYER(m[PLAYER]);
  m[INITMODE] = 0x80;
  INITOBJS();
}

/** PLAY: one jiffy of the game (RUN.S PLAY's loop, with the sleepers and LIVEBALLS) */
function* PLAY(): Wait {
  cy('GAMEPLAY');
  m[PTIMER1] = (m[PTIMER1] + 1) & 0xff;
  if (m[PTIMER1] === 0) m[PTIMER2] = (m[PTIMER2] + 1) & 0xff;
  if ((m[PTIMER1] & 0x1f) === 0) m[PDL0] = PREAD(0);
  if (((m[PTIMER1] + 0x10) & 0x1f) === 0) m[PDL1] = PREAD(1);
  m[BUTN0] = button(0);
  m[BUTN1] = button(1);
  WAIT(m[S2.WMOD1]);
  yield;
  for (let y = 0; ; ) {
    // PLAY4
    cy('GAMEPLAY4');
    if (y >= m[RUNLEN]) break;
    m[NEXTOBJ] = y;
    const x = m[RUNCHN + y];
    if ((m[TIME + x] & m[PTIMER1]) === 0) PLAYOBJ();
    // PLAY9
    cy('PLAY9');
    y = (m[NEXTOBJ] + 1) & 0xff;
    if (y === 0) break;
  }
  // PLAY10
  cy('GAMEPLAY10');
  if ((m[PTIMER1] & 0x1f) === 0) SCORE();
  if ((m[PTIMER1] & 0x03) === 0) {
    SND(SOUND);
    WIRING(WIRES);
  }
  SLEEP();
}

/** PLAY4's object whose turn it is: its routine, then for a ball: caught, out, or on the table */
function PLAYOBJ(): void {
  cy('GAMERUN');
  const x = m[RUNCHN + m[NEXTOBJ]];
  m[LBASE] = m[VECTLO + x];
  m[LBASE + 1] = m[VECTHI + x];
  m[S2.PMOD1] = lb(10);
  m[S2.PMOD1 + 1] = lb(11);
  jsr(w(S2.PMOD1));
  cy('GAMEBACK');
  if (m[TIME + m[RUNCHN + m[NEXTOBJ]]] !== 0) return;
  cy('GAMEBALL');
  const st = lb(16);
  if (st & 0x80) return;
  if (st & 0x40) {
    // caught in a hole: the ball goes to the sleepers, a new one where it was placed
    const s = m[SLEEPCNT];
    if (s === 255) return;
    m[SLEEPCNT] = (s + 1) & 0xff;
    m[SLEEPCODE + s] = m[PLAYER];
    m[BASE1] = m[SLEEPLO + s];
    m[BASE1 + 1] = m[SLEEPHI + s];
    const to = w(BASE1);
    for (let k = 22; k >= 0; k--) m[(to + k) & 0xffff] = lb(k);
    INITB2();
    DRAWBALL();
    m[LIVEBALLS] = 0xff;
    return;
  }
  // PLAY6
  if (m[Y2] === m[LASTY]) {
    setlb(16, 0x80);
    DRAWBALL();
  } else m[LIVEBALLS] = 0xff;
}

/** SLEEP: the player's sleepers move (MOVEBALL); eaten or off the table they leave the list */
function SLEEP(): void {
  cy('SLEEP');
  for (let y = 0; ; ) {
    // SLEEP2
    cy('SLEEP2');
    if (y >= m[SLEEPCNT]) return;
    m[NEXTOBJ] = y;
    if (m[SLEEPCODE + y] === m[PLAYER]) SLEEPER();
    // SLEEP6
    cy('SLEEP6');
    y = (m[NEXTOBJ] + 1) & 0xff;
    if (y === 0) return;
  }
}

/** one sleeper of the player whose ball it is: moved; eaten or off the table it leaves the list */
function SLEEPER(): void {
  cy('SLEEPRUN');
  const y = m[NEXTOBJ];
  m[LBASE] = m[SLEEPLO + y];
  m[LBASE + 1] = m[SLEEPHI + y];
  m[S2.PMOD2] = lb(10);
  m[S2.PMOD2 + 1] = lb(11);
  jsr(w(S2.PMOD2));
  cy('SLEEPBACK');
  const b = m[BSTAT];
  if (!(b & 0x80)) {
    if (b & 0x40) return;
    if (m[Y2] !== m[LASTY]) {
      m[LIVEBALLS] = 0xff;
      return;
    }
  }
  // SLEEP3: the last sleeper takes its place
  DRAWBALL();
  const yy = m[NEXTOBJ];
  if (yy !== m[SLEEPCNT]) {
    const x = m[SLEEPCNT];
    m[BASE1] = m[SLEEPLO - 1 + x];
    m[BASE1 + 1] = m[SLEEPHI - 1 + x];
    m[SLEEPCODE + yy] = m[SLEEPCODE - 1 + x];
    const from = w(BASE1);
    const to = w(LBASE);
    for (let k = 22; k >= 0; k--) m[(to + k) & 0xffff] = m[(from + k) & 0xffff];
  }
  m[SLEEPCNT] = (m[SLEEPCNT] - 1) & 0xff;
}

/** INITOBJS: every part's init routine */
function INITOBJS(): void {
  for (let y = 0; y !== m[RUNLEN]; y = (m[NEXTOBJ] + 1) & 0xff) {
    m[NEXTOBJ] = y;
    const x = m[RUNCHN + y];
    m[LBASE] = m[VECTLO + x];
    m[LBASE + 1] = m[VECTHI + x];
    m[S2.IMOD2] = lb(12);
    m[S2.IMOD2 + 1] = lb(13);
    jsr(w(S2.IMOD2));
  }
}

/** CLOSEOBJS: the parts' init routines in close mode, then CLOSE2 */
function CLOSEOBJS(): void {
  m[INITMODE] = 0xff;
  INITOBJS();
  CLOSE2();
}

/** CLOSE2: every part's state byte back to its TIME, as the construction set keeps it */
function CLOSE2(): void {
  for (let y = 0; y !== m[RUNLEN]; y = (m[NEXTOBJ] + 1) & 0xff) {
    m[NEXTOBJ] = y;
    const x = m[RUNCHN + y];
    m[LBASE] = m[VECTLO + x];
    m[LBASE + 1] = m[VECTHI + x];
    setlb(8, m[TIME + x]);
  }
}

/** GETOBJ: object Y at OBJ, its id, colour, vertex count and LBASE */
function GETOBJ(y: number): void {
  setw(OBJ, PBDATA + 1);
  m[NEXTOBJ] = y;
  GETNEXTOBJ(0);
}

function GETNEXTOBJ(y: number): void {
  for (;;) {
    setw(OBJ, (w(OBJ) + m[PBDATA + y]) & 0xffff);
    if (y === m[NEXTOBJ]) break;
    y = (y + 1) & 0xff;
    if (y === 0) break;
  }
  // GETOBJ3
  const o = w(OBJ);
  m[OBJID] = m[o];
  m[FILLCOLOR] = m[(o + 1) & 0xffff];
  m[VRTXCOUNT] = m[(o + 2) & 0xffff];
  const t = ((m[VRTXCOUNT] << 1) & 0xff) + 3 + (m[VRTXCOUNT] >> 7) + m[OBJ];
  m[LBASE] = t & 0xff;
  m[LBASE + 1] = (m[OBJ + 1] + (t >> 8)) & 0xff;
}

// ---- the players' states ----

/** SAVEPLAYER: each part's bitmap pointer, state and byte 16 into player X's state; the sleepers drawn */
function SAVEPLAYER(x: number): void {
  PBASES(x);
  for (let y = 0; y < m[RUNLEN]; y = m[NEXTOBJ] + 1) {
    m[NEXTOBJ] = y;
    const o = m[RUNCHN + y];
    m[LBASE] = m[VECTLO + o];
    m[LBASE + 1] = m[VECTHI + o];
    m[PARAM] = lb(0);
    m[PARAM + 1] = lb(1);
    m[PARAM + 2] = lb(8);
    m[PARAM + 3] = lb(16);
    const yy = m[NEXTOBJ];
    m[(w(PBASE1) + yy) & 0xffff] = m[PARAM];
    m[(w(PBASE2) + yy) & 0xffff] = m[PARAM + 1];
    m[(w(PBASE3) + yy) & 0xffff] = m[PARAM + 2];
    m[(w(PBASE4) + yy) & 0xffff] = m[PARAM + 3];
  }
  SAVEP3();
}

/** SAVEP3: the player's sleepers drawn (exclusive-or: on or off) */
function SAVEP3(): void {
  for (let y = 0; y < m[SLEEPCNT]; y = m[NEXTOBJ] + 1) {
    m[NEXTOBJ] = y;
    if (m[SLEEPCODE + y] !== m[PLAYER]) continue;
    m[LBASE] = m[SLEEPLO + y];
    m[LBASE + 1] = m[SLEEPHI + y];
    DRAWBALL();
  }
}

/** RESTOREPLAYER: every part moved on to the frame player X left it in, its state back */
function RESTOREPLAYER(x: number): void {
  PBASES(x);
  m[BUTN0] = 0x80;
  m[BUTN1] = 0x80; // "flipper problem"
  for (let y = 0; y < m[RUNLEN]; y = m[NEXTOBJ] + 1) {
    m[NEXTOBJ] = y;
    const o = m[RUNCHN + y];
    m[LBASE] = m[VECTLO + o];
    m[LBASE + 1] = m[VECTHI + o];
    m[STEMP] = m[TIME + o];
    m[PARAM] = m[(w(PBASE1) + y) & 0xffff];
    m[PARAM + 1] = m[(w(PBASE2) + y) & 0xffff];
    m[PARAM + 2] = m[(w(PBASE3) + y) & 0xffff];
    m[PARAM + 3] = m[(w(PBASE4) + y) & 0xffff];
    // RESTP3: until the bitmap pointer is the saved one (a flipper by running, others by ADVANCE)
    for (let guard = 0; lb(0) !== m[PARAM] || lb(1) !== m[PARAM + 1]; guard++) {
      if (guard > 100000) throw new Error('RESTOREPLAYER: a part never reaches its saved frame');
      if (m[STEMP] === 3) {
        m[S2.RMOD1] = lb(10);
        m[S2.RMOD1 + 1] = lb(11);
        jsr(w(S2.RMOD1));
      } else ADVANCE();
    }
    // RESTP6
    const t = m[STEMP];
    if (t !== 0x1f) setlb(8, m[PARAM + 2]);
    if (t !== 0) {
      let a = m[PARAM + 3];
      if (t === 0x1f) a |= m[PARAM + 2];
      setlb(16, a);
    }
  }
  SAVEP3();
}

/** PBASES: player X's four state tables (P1STATE + $200 X) */
function PBASES(x: number): void {
  m[PBASE1] = 0;
  m[PBASE3] = 0;
  m[PBASE2] = 0x80;
  m[PBASE4] = 0x80;
  const hi = m[S2.PLTBHI + x];
  m[PBASE1 + 1] = hi;
  m[PBASE2 + 1] = hi;
  m[PBASE3 + 1] = (hi + 1) & 0xff;
  m[PBASE4 + 1] = (hi + 1) & 0xff;
}

/** INITWORLD: RUN2.S's copy: its own speed patch, RUN.S's gravity, kick and elasticity patches */
export function INITWORLD(): void {
  m[WMOD4] = m[S2.GRAVTBL + m[WSET]];
  m[S2.WMOD1] = m[S2.TIMETBL + m[WSET + 1]];
  m[WMOD3] = m[S2.KICKTBL + m[WSET + 2]];
  m[WMOD2] = m[S2.ELASTLO + m[WSET + 3]];
  m[WMOD2 + 1] = m[S2.ELASTHI + m[WSET + 3]];
}

/**
 * MAKETBLS, its first part: SHFRSLT/SHFOUT (a byte's 7 pixels shifted 1..6 to the right, what stays
 * in the byte and what goes over into the next, the colour bit kept), DIV7, MOD7, and LO/HI (the
 * hi-res row addresses).
 */
export function MAKETABLES(): void {
  m[BASE1 + 1] = SHFRSLT >> 8;
  m[BASE2 + 1] = SHFOUT >> 8;
  m[BASE1] = 0;
  m[BASE2] = 0;
  m[SHIFTCOUNT] = 1;
  for (;;) {
    for (let y = 0; y < 256; y++) {
      // MAKT2
      m[SHIFTOUT] = 0;
      m[SIGN] = y & 0x80;
      let a = y & 0x7f;
      let c = 0;
      for (let x = m[SHIFTCOUNT]; x > 0; x--) {
        // ASL; ROL SHIFTOUT
        c = a >> 7;
        a = (a << 1) & 0xff;
        const s = m[SHIFTOUT];
        m[SHIFTOUT] = ((s << 1) | c) & 0xff;
        c = s >> 7;
      }
      // ROL; ROL SHIFTOUT; LSR: to the 7-bit format
      const ac = a >> 7;
      a = ((a << 1) | c) & 0xff;
      const s = m[SHIFTOUT];
      m[SHIFTOUT] = ((s << 1) | ac) & 0xff;
      a >>= 1;
      a |= m[SIGN];
      if (a === 0x80) a = 0;
      m[(m[BASE1] | (m[BASE1 + 1] << 8)) + y] = a;
      let b = m[SHIFTOUT] | m[SIGN];
      if (b === 0x80) b = 0;
      m[(m[BASE2] | (m[BASE2 + 1] << 8)) + y] = b;
    }
    m[BASE1 + 1]++;
    m[BASE2 + 1]++;
    m[SHIFTCOUNT]++;
    if (m[SHIFTCOUNT] === 7) break;
  }
  // DIV7, MOD7
  let a = 0;
  let x = 0;
  for (let y = 0; y < 256; y++) {
    m[MOD7 + y] = a;
    m[DIV7 + y] = x;
    a++;
    if (a >= 7) {
      x++;
      a -= 7;
    }
  }
  // LO, HI
  let y = 0;
  a = 0x20;
  m[TEMP] = 0x20;
  for (;;) {
    // MAKT5
    m[HI + y] = a;
    m[HI + 8 + y] = a;
    m[HI + 64 + y] = a;
    m[HI + 72 + y] = a;
    m[HI + 128 + y] = a;
    m[HI + 136 + y] = a;
    m[LO + y] = 0x00;
    m[LO + 8 + y] = 0x80;
    m[LO + 64 + y] = 0x28;
    m[LO + 72 + y] = 0xa8;
    m[LO + 128 + y] = 0x50;
    m[LO + 136 + y] = 0xd0;
    a = (a + 4) & 0xff;
    if (a >= 0x40) {
      // MAKT7
      m[TEMP]++;
      y = (y + 8) & 0xff;
      a = m[TEMP];
      if (a >= 0x24) break;
    }
    // MAKT6
    y = (y + 1) & 0xff;
    if (y === 0) break;
  }
}

