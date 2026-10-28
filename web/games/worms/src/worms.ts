// Worms? (David S. Maynard, Electronic Arts 1983), Commodore 64 version: the program, translated word
// by word from its EA FORTH source ("MASTER OCT. 9, 1983. COMMODORE 64 FINAL", the source disk of
// savetz/worms). Each method is the Forth word of the same name; "screen n" is the disk's screen it is
// on (re/worms/NOTES.md lists the load order and what each screen holds). Memory the C64's chips or
// KERNAL see stays at its address in Machine: screen RAM, colour RAM, the character set, sprite data
// and registers, SID registers, the grid WDATA ($AC48), the keyboard buffer. The rest is in fields.
//
// Words that wait for the interrupt routine (KEY, the move timers, JIFFYS) are async and wait for
// frames; long computations spend the 6502 time they took on the original (COST, measured by the
// tests on the original running in a 6502 core).
import * as K from './kernal.ts';
import { Machine } from './machine.ts';
import { Raster } from './raster.ts';
import {
  CV84, NMOVE, XINCE, XINCO, YINC, TMASK, MAPCLR, MMASK, PWT, RCVEC, LCVEC, MAPMASK, CRMAP, VBIMASKT, SCALE,
  SPMEM, SP_PTR, SPCOLR, SEVEN, VALFN, SIX0, WRM_NAME, TXT, DED, NEW, AUTO, WILD, SAME, GETNEW, DOAI_, DIE,
  UNDFMOVE, NOMOVE,
} from './data.ts';

/** F1: QUIT, which the release image points at GRIDGLIDERS (the program starts over) */
export class Quit extends Error {
  constructor() {
    super('QUIT');
  }
}

// screen 2-4
const H = 0x14, V = 0x16, DH = 0x12, DV = 0x12, H0 = 1, V0 = 1;
const STX = DH >> 1, STY = DV >> 1;
const MAXW = 4;
const C64SCR = 0x0400;
const APMAREA = 0xc000 - 0x1000;
const WCHSET = APMAREA - 0x200;
export const WDATA = WCHSET - H * V;
// screen 89, 36, 138
const CHRMEM = 0x0800, DM = 0x0400, COLRMEM = 0xd800;
const LCS = CHRMEM + 0xc0 * 8, RCS = LCS + 0x40;
const SCRMEM = C64SCR + 0x14 * 0x28;
const COLRL0 = COLRMEM + 0x28 * 0x15;
const CLKLO = 0x14;
const COLCRS = 0xd3, ROWCRS = 0xd6;
/** screen 151 (and its delay DLY 2, part of COST.FSOUND) */
const WV = 0x11, SR = 0x00, AR = 0x19;

/** a worm's 88 bytes (screens 12-16: HERE 58 ALLOT) */
export const XPOS = 0, YPOS = 1, LOC = 2, NMOVES = 4, STATUS = 6, WRMNUM = 7, HPOS = 8, VPOS = 9, CRIX = 0x0a;
export const MOVES = 0x0b, KIND = 0x4b, SCORE = 0x4c, NAME = 0x4e;

/**
 * 6502 cycles the original spends in its long words, as test/cost.ts measured them on the original
 * (the screens compiled by the rebuilt EA FORTH, so the kernel's speed is fig-FORTH's), interrupts
 * included. The port spends them as time so that the game runs at the original's pace.
 */
export const COST = {
  /** a worm that moves, without asking (GETNEWMOVE), the computer's choice (DOAI) or dying (TKILLW) */
  MAKEMOVE: 66000,
  /** a dead worm's turn */
  MAKEMOVE_DEAD: 8000,
  DOAI: 144000,
  /** one note of TKILLW, its loops included */
  FSOUND: 5083,
  BUILDCHSET: 1966000,
  CLEARF: 219000,
  INITMOVES: 94600,
  RANDOMIZE: 737000,
  /** the payoff's picture of one worm, before its wait */
  SHOWPTS: 520000,
  SHOWALL: 480000,
};

/**
 * Online play: who answers when a worm meets a situation its table does not know (GETNEW#). The
 * original asks at the keyboard (GETNEWMOVE); online, the worm's owner answers at theirs and everyone
 * applies the answer when the server has relayed it.
 */
export interface Seats {
  /** null: this keyboard, as in the original; 'ai': the computer chooses (DOAI), as for a departed player */
  decider(worm: number, situation: number): Decider | 'ai' | null;
}

export interface Decider {
  /** true: this keyboard chooses (GETNEWMOVE's question) and the choice goes to send() */
  local: boolean;
  send(move: number): void;
  /** the decision once it has come back from the server, else null; -1: the computer is to choose */
  poll(): number | null;
}

export interface Hooks {
  /** a word of the original begins (the tests take the state here) */
  enter?(word: string): void;
}

export class Worms {
  readonly m: Machine;
  hooks: Hooks = {};
  seats: Seats | null = null;
  /** W1..W4 */
  readonly w: Uint8Array[] = [0, 1, 2, 3].map(() => new Uint8Array(0x58));
  // variables (screen they are made on)
  fncur = 0; chcur = 0; // 1
  qflg = 0; // 2
  wormsN = 0; // 3: #WORMS
  sto = 7; // 3
  lock = 0; // 3
  cdt = new Uint8Array(8); // 5
  mapcdt = new Uint8Array(8); // 6
  mapmove = new Uint8Array(8); // 6
  anonb = 0; // 21
  vbismask = 0; vbimapmask = 1; // 23
  sch = 0; // 151
  seed = 0x37a7; // 40
  keypot = 0; // 46
  tbuf = new Uint8Array(18); ccnt = 0; sel = 0; // 50
  legal = new Uint8Array(6); nlegal = 0; // 51
  six = Uint8Array.from(SIX0); temp = 0; // 54-55
  cmdok = 1; diskerr = 0; // 56, 100
  wscr = new Uint16Array(4); // 60
  csbuilt = 0; // 70
  /** the constants W# and 2*W#, which the program changes through their parameter fields */
  wNum = 0; w2Num = 0;
  /** PAD (IOBUF): the 64 bytes of a worm file */
  readonly iobuf = new Uint8Array(0x40);
  /** what PAD held for SCORE2 (colour RAM saved, and the payoff picture) */
  private readonly pad = new Uint8Array(0x640);
  /** online play (online.ts): the round to play, set when it has started; whether it is being played */
  online: OnlineRun | null = null;
  inOnline = false;
  /** the player left the online round: it ends as a function key ends a game */
  leaveOnline = false;
  /** the disk: what READ-WORM/WRITE-WORM do (the port: the player's files on the server) */
  disk: { read(name: string): Promise<Uint8Array | null>; write(name: string, data: Uint8Array): Promise<void> } | null = null;

  constructor(m: Machine) {
    this.m = m;
  }

  private enter(word: string): void {
    this.hooks.enter?.(word);
  }

  // ---------------------------------------------------------------- screen 1: keyboard
  /** (?CH): the first key in the KERNAL's buffer, or 0 */
  private qch0(): number {
    return this.m.peek(K.NDX) ? this.m.peek(K.KEYD) : 0;
  }

  /** ?CH: function keys go to FNCUR, other keys to CHCUR; the buffer is emptied. Returns CHCUR. */
  QCH(): number {
    this.enter('?CH');
    do {
      const c = this.qch0();
      if (c) {
        const f = CV84[Math.min(Math.max(c, 0x84), 0x89) - 0x84];
        if (f) this.fncur = f;
        else this.chcur = c;
        while (K.getin(this.m) !== 0); // FLKBD
      }
    } while (this.qch0() !== 0);
    return this.chcur;
  }

  /** KEY: waits for a (non-function) key */
  async KEY(): Promise<number> {
    while (this.chcur === 0) {
      this.QCH();
      if (this.chcur === 0) await this.m.idle();
    }
    const c = this.chcur;
    this.chcur = 0;
    return c;
  }

  /** =KEY ( c k -- f ): if the waiting key is k, take it */
  private eqKey(c: number, k: number): number {
    if (c !== k) return 0;
    this.chcur = 0; // KEY returns at once: the key is there
    return 1;
  }

  /** ?TERMINAL: the function key pressed (8 F1, 4 F3, 2 F5, 1 F7), or 0. F1 restarts (QUIT). */
  TERMINAL(): number {
    this.QCH();
    const f = this.fncur;
    this.fncur = 0;
    if (f === 8) throw new Quit();
    return f;
  }

  // ---------------------------------------------------------------- screen 2
  STOP(): number {
    let t = this.TERMINAL();
    // online: function keys do not end the shared game (leaving does); a round waiting ends a local one
    if (this.inOnline) t = this.leaveOnline ? 1 : 0;
    else if (this.online) t = 1;
    const q = t | this.qflg;
    this.qflg = q;
    return q;
  }

  CONT(): boolean {
    return this.STOP() === 0;
  }

  // ---------------------------------------------------------------- screens 12-16: a worm's fields
  xpos(w: number): number { return this.w[w][XPOS]; }
  ypos(w: number): number { return this.w[w][YPOS]; }
  loc(w: number): number { return this.w[w][LOC] | (this.w[w][LOC + 1] << 8); }
  status(w: number): number { return this.w[w][STATUS]; }
  wrmNum(w: number): number { return this.w[w][WRMNUM]; }
  hpos(w: number): number { return this.w[w][HPOS]; }
  vpos(w: number): number { return this.w[w][VPOS]; }
  crix(w: number): number { return this.w[w][CRIX]; }
  move(w: number, m: number): number { return this.w[w][(MOVES + m) & 0xffff] ?? 0; }
  kind(w: number): number { return this.w[w][KIND]; }
  private set16(w: number, off: number, v: number): void {
    this.w[w][off] = v & 0xff;
    this.w[w][off + 1] = (v >> 8) & 0xff;
  }
  setXpos(w: number, v: number): void { this.w[w][XPOS] = v; }
  setYpos(w: number, v: number): void { this.w[w][YPOS] = v; }
  setLoc(w: number, v: number): void { this.set16(w, LOC, v); }
  setStatus(w: number, v: number): void { this.w[w][STATUS] = v; }
  setCrix(w: number, v: number): void { this.w[w][CRIX] = v; }
  /** !MOVE ( W N MOVE ) */
  setMove(w: number, n: number, m: number): void { this.w[w][MOVES + n] = m; }
  setKind(w: number, v: number): void { this.w[w][KIND] = v; }
  setScore(w: number, v: number): void { this.set16(w, SCORE, v); }
  /** .VAL: the node the worm is on (its paths eaten, and in bits 6-7 the worm that coloured it) */
  val(w: number): number { return this.m.peek(this.loc(w)); }
  /** [.VAL] */
  val6(w: number): number { return this.val(w) & 0x3f; }
  /** !VAL ( W VAL ) */
  setVal(w: number, v: number): void {
    this.m.poke(this.loc(w), v);
    this.C64VAL(w, v);
  }

  // ---------------------------------------------------------------- screen 14
  static BITS(b: number): number {
    let n = 0;
    for (let i = 0; i < 6; i++) if (b & (1 << i)) n++;
    return n;
  }

  /** JIFFYS: waits n jiffies (at least one: a fig DO loop runs once) */
  async JIFFYS(n: number): Promise<void> {
    const count = n & 0xffff;
    for (let i = 0; i === 0 || i < count; i++) await this.m.idle();
  }

  // ---------------------------------------------------------------- screen 16: the cursor
  private X(x: number): void { this.m.poke(COLCRS, x); }
  private Y(y: number): void {
    this.m.poke(ROWCRS, y);
    this.m.poke16(0xd1, y * 40 + C64SCR);
  }
  XY(x: number, y: number): void {
    this.Y(y);
    this.X(x);
  }
  /** P": the prompt line, in white */
  P(): void {
    this.XY(0, 0x14);
    this.m.poke(K.COLOR, 1);
  }
  private type(s: number[]): void {
    for (const c of s) K.chrout(this.m, c);
  }
  /** . (fig): the number and a blank */
  private dot(n: number): void {
    this.type([...((n << 16) >> 16).toString(10)].map((c) => c.charCodeAt(0)).concat([0x20]));
  }

  // ---------------------------------------------------------------- screens 90-91, 138-141: characters
  SOFT_CHARS(): void {
    for (let i = 0; i < 0x800; i++) this.m.poke(CHRMEM + i, this.m.chargen[i]);
    this.m.poke(0xd018, (this.m.peek(0xd018) & 0xf0) + (CHRMEM >> 10));
  }

  static EXPAND(b: number): number {
    let n = 0;
    for (let i = 7; i >= 0; i--) {
      const bit = (b >> i) & 1;
      n = (n << 2) | (bit << 1) | bit;
    }
    return n;
  }

  /** EXP.SET: characters 0-63 at double width as characters 64-191 */
  EXP_SET(): void {
    for (let i = 0; i < 0x40; i++) {
      const src = i * 8 + CHRMEM, dst = i * 0x10 + CHRMEM + 0x200;
      for (let r = 0; r < 8; r++) {
        const e = Worms.EXPAND(this.m.peek(src + r));
        this.m.poke(dst + r, e >> 8);
        this.m.poke(dst + r + 8, e & 0xff);
      }
    }
  }

  private ORCHAR(chb: number, cindx: number, cvec: number[][]): void {
    for (let i = 0; i < 4; i++) {
      if (cindx & TMASK[i]) {
        const a = chb + cindx * 8;
        const v = cvec[i];
        for (let r = 0; r < 8; r++) this.m.poke(a + r, this.m.peek(a + r) | v[r]);
      }
    }
  }

  BUILDCHSET(): void {
    this.SOFT_CHARS();
    this.EXP_SET();
    for (let i = 0; i < 0x40; i++) this.m.poke(LCS + i, 0);
    for (let i = 0; i < 0x40; i++) this.m.poke(RCS + i, 0);
    for (let i = 0; i < 8; i++) this.ORCHAR(LCS, i, LCVEC);
    for (let i = 0; i < 8; i++) this.ORCHAR(RCS, i, RCVEC);
    this.m.poke(LCS + 3, 1);
    // FF KEYMASK ! (an EA FORTH variable; nothing in the game reads it)
  }

  /** INITL0: the colours of the score line and the selection line */
  INITL0(): void {
    for (let i = 0; i < 0x28; i++) this.m.poke(COLRL0 + i, MAPCLR[(i / 10) | 0]);
    for (let i = 0; i < 0x28; i++) this.m.poke(COLRL0 + 0x50 + i, MAPCLR[(i / 10) | 0]);
  }

  /** XFORM ( 6bit -- R L ): a node's paths as the right and the left half of its two characters */
  static XFORM(v: number): [number, number] {
    const a = (v & 0x3f) << 1;
    const s = a + ((a & 0x40) ? 1 : 0);
    return [0xc8 | (s & 7), 0xc0 | ((s >> 3) & 7)];
  }

  /** C64!CELL ( 8BIT X Y ): draws a node; odd rows half a node to the right */
  C64CELL(v: number, x: number, y: number): void {
    const off = y * 40 - ((y & 1) === 0 ? 1 : 0) + x * 2;
    const [r, l] = Worms.XFORM(v);
    this.m.poke(DM + off, l);
    this.m.poke(DM + off + 1, r);
    const c = MAPCLR[(v & 0xff) >> 6];
    this.m.poke(COLRMEM + off + 1, c);
    this.m.poke(COLRMEM + off, c);
  }

  /** 64!VAL ( W 8BIT -- ) */
  C64VAL(w: number, v: number): void {
    this.C64CELL(v, this.xpos(w), this.ypos(w));
  }

  /** CLEAR64PF: two rows of empty nodes, copied down the screen; white */
  CLEAR64PF(): void {
    for (let j = 0; j < 2; j++) for (let i = 0; i < H; i++) this.C64CELL(0, i, j);
    for (let i = 0; i < 0x2d0; i++) this.m.poke(DM + 0x50 + i, this.m.peek(DM + i));
    for (let i = 0; i < 0x348; i++) this.m.poke(COLRMEM + i, 1);
  }

  // ---------------------------------------------------------------- screen 102
  /** SEMIT: a screen code at the cursor, no colour */
  SEMIT(c: number): void {
    const x = this.m.peek(COLCRS);
    this.m.poke(this.m.peek16(0xd1) + x, c);
    this.m.poke(COLCRS, x + 1);
  }

  /** TEMIT: a character at double width */
  TEMIT(c: number): void {
    if (c < 0x40) c += 0x40;
    const v = c * 2 - 0x40;
    this.SEMIT(v & 0xff);
    this.SEMIT((v + 1) & 0xff);
  }

  // ---------------------------------------------------------------- screens 145, 147: sprites
  SPON(): void {
    this.m.poke(0xd015, 0x0f);
    this.m.poke(0xd017, 0x0f);
    this.m.poke(0xd01d, 0x0f);
    for (let i = 0; i < 4; i++) this.m.poke(0x07f8 + i, SP_PTR[i]);
    for (let i = 0; i < 4; i++) this.m.poke(0xd027 + i, SPCOLR[i]);
  }

  SPOFF(): void {
    this.m.poke(0xd015, 0);
  }

  YXSPRITE(y: number, x: number, w: number): void {
    const mask = PWT[w & 7];
    let d010 = this.m.peek(0xd010) & (mask ^ 0xff);
    if ((x >> 8) & 1) d010 |= mask;
    this.m.poke(0xd010, d010);
    this.m.poke(0xd000 + w * 2, x & 0xff);
    this.m.poke(0xd001 + w * 2, y & 0xff);
  }

  INITSPRITES(): void {
    for (let i = 0; i < 0x11; i++) this.m.poke(0xd000 + i, 0);
    for (let s = 0; s < 4; s++) for (let i = 0; i < 0x40; i++) this.m.poke(SPMEM[s] + i, 0);
    this.SPON();
  }

  // ---------------------------------------------------------------- screens 5-6, 21-26, 118-119: the interrupt
  /** DOIRQ's raster part: BUMP, then VBI */
  private irq = (): void => {
    const c = (this.m.peek(CLKLO) | (this.m.peek(CLKLO + 1) << 8)) + 1;
    this.m.poke(CLKLO, c & 0xff);
    this.m.poke(CLKLO + 1, (c >> 8) & 0xff);
    this.VBI();
  };

  /** VBI: on every VBIMAPMASK-th frame, the cursors' reveal and the move timers */
  VBI(): void {
    if ((this.m.peek(CLKLO) & this.vbimapmask) !== 0) return;
    for (let x = 0; x < 8; x += 2) {
      if (this.mapcdt[x] !== 0) {
        // CSOURCE, CDEST2, CANDM, WRTP, DECMAP
        const src = CRMAP_OFF(this.mapmove[x]);
        const dst = SPMEM[x >> 1];
        const mask = ((8 - this.mapcdt[x]) & 0xff) * 24;
        if (this.lock === 0) {
          for (let y = 0x17; y >= 0; y--) this.m.poke(dst + y, (CRMAP[src + y] ?? 0) & (MAPMASK[mask + y] ?? 0));
        }
        this.mapcdt[x]--;
      }
      if (this.cdt[x] !== 0) this.cdt[x]--; // DECCDT
    }
  }

  INSTALL_DOIRQ(): void {
    this.m.poke(0xd012, 0xfb);
    this.m.poke(0xd011, this.m.peek(0xd011) & 0x7f);
    this.m.poke(0xd01a, this.m.peek(0xd01a) | 1);
    this.m.rasterIrq = this.irq;
  }

  RESET_IRQ(): void {
    this.m.poke(0xd01a, this.m.peek(0xd01a) & 0xfe);
    this.m.rasterIrq = null;
  }

  // ---------------------------------------------------------------- screen 27-28
  static RANGE(n: number, lo: number, hi: number): boolean {
    return n < hi + 1 && n > lo - 1;
  }

  /** (?SPEED2): a digit key sets the speed */
  private async SPEED2(): Promise<void> {
    const k = await this.KEY();
    const i = ((0x39 - k) * 2) & 0xffff;
    const v = VBIMASKT[i] ?? 0;
    this.vbismask = v;
    this.vbimapmask = Math.max(v, 1) & 0xff;
    this.sto = VBIMASKT[i + 1] ?? 0;
  }

  /** ?SPEED */
  async SPEED(): Promise<void> {
    const c = this.QCH();
    if (c && Worms.RANGE(c, 0x30, 0x39)) await this.SPEED2();
  }

  PROMPT2(): void {
    this.P();
    for (let i = 0; i < 0x28; i++) this.m.poke(C64SCR + 0x14 * 40 + i, 0x20);
  }

  async CNFRM(): Promise<boolean> {
    const f = (await this.KEY()) === 0x0d;
    if (!f) this.PROMPT2();
    return f;
  }

  START(): number {
    this.enter('?START');
    return this.TERMINAL() & 7;
  }

  async CLEAR(): Promise<void> {
    while (this.START() !== 0) await this.m.idle();
  }

  // ---------------------------------------------------------------- screens 29-30: the cursor sprites
  UPDCRLOC(w: number): void {
    let h = this.xpos(w) * 8 + 4;
    if (this.ypos(w) & 1) h += 4;
    this.w[w][HPOS] = h & 0xff;
    this.w[w][VPOS] = (this.ypos(w) * 8 + 0x2e) & 0xff;
  }

  ZRMAP(x: number): void {
    this.mapcdt[x] = 0;
    this.mapcdt[x + 1] = 0;
    const a = SPMEM[x >> 1];
    for (let i = 0; i < 0x18; i++) this.m.poke(a + i, 0);
  }

  ZMAP(): void {
    this.ZRMAP(this.w2Num);
  }

  UPDMAP(w: number): void {
    this.ZRMAP(this.w2Num);
    this.YXSPRITE(this.vpos(w), this.hpos(w) * 2, this.wNum);
    this.mapcdt[this.w2Num] = 7;
    this.mapcdt[this.w2Num + 1] = 0;
    this.cdt[this.w2Num] = this.sto & 0xff;
    this.cdt[this.w2Num + 1] = 0;
  }

  UPDMV(w: number): void {
    this.mapmove[this.w2Num] = this.crix(w);
    this.mapmove[this.w2Num + 1] = 0;
  }

  // ---------------------------------------------------------------- screen 31: worms
  INITWORM(w: number): void {
    const n = this.wormsN;
    const b = this.w[w];
    b[XPOS] = STX;
    b[YPOS] = STY;
    this.setLoc(w, 0);
    this.set16(w, NMOVES, 0);
    b[STATUS] = 1;
    b[WRMNUM] = n;
    b[HPOS] = 0;
    b[VPOS] = 0;
    b[CRIX] = 6;
    for (let i = 0; i < 0x40; i++) b[MOVES + i] = GETNEW;
    b[KIND] = 0;
    this.setScore(w, 0);
    b.set([0x53, 0x41, 0x4d, 0x45, 0x20, 0x20, 0x20, 0x20], NAME);
    this.wormsN = n + 1;
  }

  // ---------------------------------------------------------------- screens 150-151: sound
  C64SOUND(wv: number, sr: number, ad: number, f: number, n: number): void {
    const r = 0xd400 + SEVEN[n];
    this.m.poke(r + 4, 0);
    this.m.poke16(r, f);
    this.m.poke(r + 5, ad);
    this.m.poke(r + 6, sr);
    this.m.poke(r + 4, wv);
  }

  XSND(): void {
    for (let i = 0; i < 3; i++) this.C64SOUND(0, 0, 0, 0, i);
  }

  ROVR(): number {
    let s = this.sch + 1;
    if (s === 3) s = 0;
    this.sch = s;
    return s;
  }

  FSOUND(f: number): void {
    this.C64SOUND(WV, SR, AR, f, this.ROVR());
  }

  /** TKILLW: the falling sweeps when a worm dies (spends the 6502's time per note) */
  async TKILLW(): Promise<void> {
    for (let i = 0x64; ; i -= 8) {
      const top = (i << 8) & 0xffff;
      const bottom = Math.max(sgn(top - 0x2000), 0);
      for (let j = top; ; j -= 0x200) {
        this.FSOUND(j & 0xffff);
        await this.m.cpu(COST.FSOUND); // the note, and its DLY loop of NOOPs

        if (!(sgn(j - 0x200) > bottom)) break;
      }
      if (this.STOP()) break;
      if (!(i - 8 > 9)) break;
    }
  }

  // ---------------------------------------------------------------- screens 33-35
  async UPDSTATUS(w: number): Promise<void> {
    if (this.status(w)) {
      if (this.val6(w) === 0x3f) {
        await this.TKILLW(); // KILLW
        this.setStatus(w, 0);
      } else this.setStatus(w, 1);
    }
  }

  UPDLOC(w: number): void {
    this.setLoc(w, (this.xpos(w) + this.ypos(w) * H + WDATA) & 0xffff);
  }

  UPDCOL(w: number): void {
    this.setVal(w, (this.val6(w) + this.wNum * 0x40) & 0xffff);
  }

  INITAUTO(w: number): void {
    for (let i = 0; i < 0x40; i++) this.setMove(w, i, DOAI_);
    this.forced(w);
  }

  private forced(w: number): void {
    this.setMove(w, 0x3e, 0);
    this.setMove(w, 0x3d, 1);
    this.setMove(w, 0x3b, 2);
    this.setMove(w, 0x37, 3);
    this.setMove(w, 0x2f, 4);
    this.setMove(w, 0x3f, DIE);
    this.setMove(w, 0x1f, 5);
  }

  async INITPOS(w: number): Promise<void> {
    this.setXpos(w, STX);
    this.setYpos(w, STY);
    this.setCrix(w, NOMOVE);
    this.UPDLOC(w);
    this.UPDCRLOC(w);
    this.set16(w, SCORE, 0x258); // !TMO: the timeout shares the score's cell
    await this.UPDSTATUS(w);
  }

  INITMOVES(w: number): void {
    for (let i = 0; i < 0x40; i++) this.setMove(w, i, GETNEW);
    this.forced(w);
  }

  // ---------------------------------------------------------------- screens 40-43
  /** RAND: the raster line added to SEED */
  RAND(): number {
    this.seed = (this.seed + this.m.peek(0xd012)) & 0xffff;
    return this.seed & 0xff;
  }

  async CLEARF(): Promise<void> {
    for (let i = 0; i < H * V; i++) this.m.poke(WDATA + i, 0);
    this.CLEAR64PF();
    await this.m.cpu(COST.CLEARF);
  }

  static WX(x: number): number {
    if (x > DH - 1 + H0) return x - DH;
    if (x < H0) return x + DH;
    return x;
  }

  static WY(y: number): number {
    if (y > DV - 1 + V0) return y - DV;
    if (y < V0) return y + DV;
    return y;
  }

  /** MSND ( W M ): the note of this worm and move */
  MSND(w: number, m: number): void {
    if (this.status(w)) this.C64SOUND(WV, SR, AR, SCALE[(this.wNum * 3 + m) & 0xffff] ?? 0, this.ROVR());
  }

  // ---------------------------------------------------------------- screens 44-46
  /** [MOVE]: a move along an eaten path becomes GETNEW# */
  static MOVE_(val: number, m: number): number {
    if (m > 5) return m;
    return val & TMASK[m] ? GETNEW : m;
  }

  GXINC(w: number): number[] {
    return this.ypos(w) & 1 ? XINCO : XINCE;
  }

  SPACE(): number {
    return this.eqKey(this.QCH(), 0x20);
  }

  async NOTSP(): Promise<number> {
    const c = this.QCH();
    if (c === 0 || c === 0x20) return 0;
    return this.KEY();
  }

  /** ?PAUSE: RUN/STOP pauses until RUN/STOP again (or a function key) */
  async PAUSE(): Promise<void> {
    if (this.QCH() !== 0x03) return;
    this.P();
    this.type(TXT.PAUSED);
    await this.KEY();
    for (;;) {
      // BEGIN ?CH IF 0 ELSE KEY 03 = THEN ?TERMINAL OR UNTIL: a key that is not RUN/STOP, waiting when
      // the loop comes round, is never taken (only a function key ends the pause then)
      const pending = this.QCH() !== 0;
      const f = pending ? 0 : (await this.KEY()) === 0x03 ? 1 : 0;
      if (f | this.TERMINAL()) break;
      if (pending) await this.m.idle();
    }
    this.PROMPT2();
  }

  /** TIMEOUT ( move -- move f ) */
  async TIMEOUT(): Promise<number> {
    await this.PAUSE();
    await this.SPEED();
    const c = await this.NOTSP();
    return c | this.STOP();
  }

  static NXTMOVE(m: number): number {
    return Math.max(Math.min(NMOVE[m] ?? 0, 5), 0);
  }

  async CLRKBD(): Promise<void> {
    while (this.QCH()) await this.KEY();
  }

  // ---------------------------------------------------------------- screen 49
  /** PUTSCORE ( N A ): a number in double-width digits, its last digit ending at A */
  PUTSCORE(n: number, a: number): void {
    for (;;) {
      const q = Math.trunc(n / 10), r = n - q * 10;
      const c = r * 2 + 0xa0;
      this.m.poke(a - 1, c);
      this.m.poke(a, c + 1);
      a -= 2;
      n = q;
      if (n === 0) break;
    }
  }

  // ---------------------------------------------------------------- screens 50-52: asking a person
  GKEYPOT(): number {
    this.keypot = (this.keypot + this.SPACE()) & 0xffff;
    return this.keypot;
  }

  CHKMOVES(w: number): void {
    this.nlegal = 0;
    const v = this.val6(w);
    for (let i = 0; i < 6; i++) {
      if ((v & MMASK[i]) === 0) {
        this.legal[this.nlegal] = i;
        this.nlegal++;
      }
    }
  }

  GPOT(): number {
    this.enter('GPOT');
    const k = sgn(this.GKEYPOT());
    const n = Math.max(this.nlegal, 1);
    const r = k - Math.trunc(k / n) * n;
    return Math.min(Math.max(this.legal[r] ?? 0, 0), 5);
  }

  // ---------------------------------------------------------------- screens 53-55: the computer's worms
  PEEKMAP(w: number, m: number): number {
    const x = Worms.WX(this.xpos(w) + this.GXINC(w)[m]);
    const y = Worms.WY(this.ypos(w) + YINC[m]);
    return Worms.BITS(this.m.peek(WDATA + x + y * H));
  }

  /** SAMEDIR? ( W M -- n ): 2 for going straight on from a fresh node, else 1 if the way back is eaten */
  SAMEDIR(w: number, m: number): number {
    const v = this.val6(w);
    const back = TMASK[Worms.NXTMOVE(m)];
    if (Worms.BITS(v) === 1) return v === back ? 2 : 0;
    return v & back ? 1 : 0;
  }

  EVAL(w: number, m: number): void {
    if (this.val(w) & TMASK[m]) {
      this.six[m] = 0;
      return;
    }
    const r = (VALFN[this.PEEKMAP(w, m)] ?? 0) + 0; // + HOME? (not implemented: 0)
    this.six[m] = (r - this.SAMEDIR(w, m)) & 0xff;
  }

  /** PICKBEST: one of the best moves, by RAND */
  PICKBEST(): number {
    this.temp = 0;
    for (let i = 0; i < 6; i++) this.temp = Math.max(this.six[i], this.temp);
    let n = 0;
    for (let i = 0; i < 6; i++) if (this.six[i] === this.temp) n++;
    let k = (this.RAND() % n) + 1;
    let pick = 0;
    let picked = false;
    for (let i = 0; i < 6; i++) {
      if (this.six[i] === this.temp) {
        k--;
        if (k === 0) {
          pick = i;
          picked = true;
          break;
        }
      }
    }
    return picked ? pick : k;
  }

  DOAI(w: number): number {
    for (let i = 0; i < 6; i++) this.EVAL(w, i);
    return this.PICKBEST();
  }

  // ---------------------------------------------------------------- screens 57-59: the next move
  /**
   * GETNEWMOVE: shows the free paths; space turns, any other key takes it. Online (`d`), the choice
   * is sent, and the move is the decision that comes back (or the owner's, on another keyboard).
   */
  async GETNEWMOVE(w: number, d: Decider | null = null): Promise<number> {
    this.enter('GETNEWMOVE');
    this.setCrix(w, 7);
    await this.CLRKBD();
    this.XSND();
    const r = this.w2Num;
    this.UPDCRLOC(w);
    this.CHKMOVES(w);
    this.UPDMAP(w);
    let idx = 6;
    const show = (i: number) => {
      if (this.crix(w) !== i) {
        this.setCrix(w, i);
        this.UPDMV(w);
      }
      if (this.mapcdt[r] === 0) {
        this.mapcdt[r] = 7;
        this.mapcdt[r + 1] = 0;
      }
    };
    if (!d || d.local) {
      for (;;) {
        idx = this.GPOT();
        show(idx);
        if (await this.TIMEOUT()) break;
        // online: the server gave the worm to the computer (this player did nothing for too long)
        if (d && d.poll() === -1) return -1;
        await this.m.idle();
      }
      // TRIGCLR: waits for the joystick's button to be let go (there is none)
    }
    if (d) {
      if (d.local) d.send(idx);
      for (;;) {
        const v = d.poll();
        if (v !== null) {
          if (v < 0) return -1;
          idx = v;
          show(idx);
          break;
        }
        show(this.crix(w));
        await this.SPEED();
        await this.m.idle();
      }
    }
    return idx;
  }

  /** after GETNEWMOVE: the move goes into the table ([MOVE] turns an eaten path into GETNEW#) */
  private learn(w: number, idx: number): number {
    const m = Worms.MOVE_(this.val(w), idx);
    this.setMove(w, this.val6(w), m);
    return m;
  }

  MVHILTE(n: number): void {
    const a = DM + 0x28 * 0x17 + n * 0x0a;
    for (let i = 0; i < 0x0a; i++) this.m.poke(a + i, 0xf7);
    this.m.poke(0xd027 + n, MAPCLR[n] ?? 0);
  }

  MVDELITE(): void {
    for (let i = 0; i < 0x28; i++) this.m.poke(DM + 0x28 * 0x17 + i, 0x20);
    this.m.poke(0xd027 + this.wNum, SPCOLR[this.wNum] ?? 0);
  }

  /** GETMOVE ( W -- M ) */
  async GETMOVE(w: number): Promise<number> {
    let m = this.move(w, this.val6(w));
    if (m >= 6) {
      if (m === GETNEW) {
        const d = this.seats?.decider(w, this.val6(w)) ?? null;
        let v = -1;
        if (d !== 'ai') {
          this.MVHILTE(this.wNum);
          v = await this.GETNEWMOVE(w, d);
          this.MVDELITE();
        }
        if (v < 0) {
          // online: a departed player's worm, the computer chooses (as DOAI# does)
          m = this.DOAI(w);
          this.setMove(w, this.val6(w), m);
          await this.m.cpu(COST.DOAI);
        } else m = this.learn(w, v);
      } else if (m === DOAI_) {
        m = this.DOAI(w);
        this.setMove(w, this.val6(w), m);
        await this.m.cpu(COST.DOAI);
      } else if (m === DIE) {
        await this.UPDSTATUS(w);
        m = UNDFMOVE;
      }
    }
    return m;
  }

  // ---------------------------------------------------------------- screens 60-62: moving
  UPDXPOS(w: number, m: number): void {
    this.setXpos(w, Worms.WX(this.xpos(w) + this.GXINC(w)[m]) & 0xff);
  }

  UPDYPOS(w: number, m: number): void {
    this.setYpos(w, Worms.WY(this.ypos(w) + YINC[m]) & 0xff);
  }

  UPDSCR(w: number): void {
    const n = this.wrmNum(w);
    const a = n * 0x0a + SCRMEM + 0x2e;
    this.wscr[n & 3] = (this.wscr[n & 3] + 1) & 0xffff;
    this.PUTSCORE(this.wscr[n & 3], a);
  }

  /** UPDCNODE ( W M ): eats path M of the node; a full node scores */
  UPDCNODE(w: number, m: number): void {
    this.setCrix(w, m);
    const v = (this.val(w) | TMASK[m]) & 0xffff;
    if ((v & 0x3f) === 0x3f) {
      this.setCrix(w, 7);
      this.UPDSCR(w);
    }
    this.setVal(w, v);
  }

  /** MAKEMOVE ( W -- status ) */
  async MAKEMOVE(w: number): Promise<number> {
    this.enter('MAKEMOVE');
    await this.UPDSTATUS(w);
    let cost = COST.MAKEMOVE_DEAD;
    if (this.status(w)) {
      const m = await this.GETMOVE(w);
      if (m < 6) {
        cost = COST.MAKEMOVE;
        this.ZMAP();
        this.UPDCRLOC(w);
        this.MSND(w, m);
        this.UPDCNODE(w, m);
        this.UPDMV(w);
        this.UPDMAP(w);
        this.UPDCOL(w);
        this.UPDXPOS(w, m);
        this.UPDYPOS(w, m);
        this.UPDLOC(w);
        this.UPDCOL(w);
        this.UPDCNODE(w, Worms.NXTMOVE(m));
        await this.UPDSTATUS(w);
      }
    }
    await this.UPDSTATUS(w);
    await this.m.cpu(cost);
    return this.status(w);
  }

  // ---------------------------------------------------------------- screen 63
  SETW(n: number): void {
    this.wNum = n;
    this.w2Num = (n * 2) & 0xffff;
  }

  async GAME(n: number): Promise<void> {
    this.enter('GAME');
    this.qflg = 0;
    for (let i = 0; i < n; i++) this.UPDCRLOC(i);
    for (;;) {
      let alive = 0;
      for (let i = 0; i < n; i++) {
        await this.PAUSE();
        this.SETW(i);
        while (this.cdt[i * 2] !== 0) await this.m.idle();
        alive += await this.MAKEMOVE(i);
      }
      await this.SPEED();
      if (alive === 0 || !this.CONT()) break;
    }
    this.XSND();
  }

  // ---------------------------------------------------------------- screen 143: the payoff
  private C64COLR(n: number, x: number, y: number): void {
    const off = y * 40 - ((y & 1) === 0 ? 1 : 0) + x * 2;
    const c = MAPCLR[n] ?? 0;
    this.pad[off + 1] = c;
    this.pad[off] = c;
  }

  /** SHOWPTS: only the nodes this worm completed last, in its colour */
  async SHOWPTS(n: number): Promise<void> {
    this.pad.fill(0, 0, 0x320);
    const mask = (n * 0x40 + 0x3f) & 0xffff;
    let a = WDATA;
    for (let j = 0; j < 0x14; j++) {
      for (let i = 0; i < 0x14; i++) {
        if (this.m.peek(a) === mask) this.C64COLR(n, i, j);
        a++;
      }
    }
    const score = this.wscr[n];
    for (let i = 0; i < 0x320; i++) this.m.poke(COLRMEM + i, this.pad[i]);
    await this.m.cpu(COST.SHOWPTS);
    if (this.CONT()) await this.JIFFYS(Math.max(score, 0x80));
  }

  async SCORE2(): Promise<void> {
    this.enter('SCORE2');
    if (!this.CONT()) return;
    for (let i = 0; i < 0x320; i++) this.pad[0x320 + i] = this.m.peek(COLRMEM + i) & 0x0f;
    for (let i = 0; i < 4; i++) {
      if (this.kind(i)) await this.SHOWPTS(i);
      if (this.STOP()) break;
    }
    for (let i = 0; i < 0x320; i++) this.m.poke(COLRMEM + i, this.pad[0x320 + i]);
  }

  // ---------------------------------------------------------------- screens 66-67
  INITSTAT(w: number): void {
    this.setStatus(w, this.kind(w) ? 1 : 0);
  }

  async PLAYGAME(): Promise<void> {
    this.enter('PLAYGAME');
    await this.CLEARF();
    for (let i = 0; i < this.wormsN; i++) {
      await this.INITPOS(i);
      this.wNum = i;
      this.MVDELITE();
      this.INITSTAT(i);
    }
    await this.GAME(this.wormsN);
    if (this.CONT()) await this.SCORE2();
    await this.CLRKBD();
  }

  /** !NMOVE ( W MOVE INDEX -- F ) */
  private NMOVE_(w: number, m: number, i: number): boolean {
    const n = Math.min(i, 0x3e);
    if (TMASK[m] & n) return false;
    this.setMove(w, n, m);
    return true;
  }

  RANDOMIZE(w: number): void {
    for (let i = 0; i < 0x3f; i++) {
      while (!this.NMOVE_(w, Math.min(this.RAND() & 7, 5), i));
    }
  }

  WLDISPLAY(): void {
    for (let i = 0x28; i < 0x50; i++) this.m.poke(SCRMEM + i, 0x20);
    this.wscr.fill(0);
  }

  // ---------------------------------------------------------------- screen 68: worm files
  /** VMOVE ( I MOVE -- MOVE ): a move read from a file, made valid */
  static VMOVE(i: number, m: number): number {
    if (m < 6) return TMASK[m] & i ? GETNEW : m;
    if (m === GETNEW || m === DOAI_ || m === DIE) return m;
    return GETNEW;
  }

  RWORM(w: number): void {
    this.setKind(w, SAME);
    for (let i = 0; i < 4; i++) this.w[w][NAME + i] = this.tbuf[i];
    for (let i = 0; i < 0x40; i++) this.setMove(w, i, Worms.VMOVE(i, this.iobuf[i]));
  }

  WWORM(w: number): void {
    for (let i = 0; i < 0x40; i++) this.iobuf[i] = this.move(w, i);
  }

  // ---------------------------------------------------------------- screens 69-70: the demonstration
  async INTROGAME(): Promise<void> {
    this.enter('INTROGAME');
    await this.CLEARF();
    for (let i = 0; i < this.wormsN; i++) {
      if (this.CONT()) {
        if (this.RAND() & 3) {
          this.setKind(i, WILD);
          this.INITMOVES(i);
          this.RANDOMIZE(i);
          await this.m.cpu(COST.INITMOVES + COST.RANDOMIZE);
        } else {
          this.setKind(i, AUTO);
          this.INITAUTO(i);
          await this.m.cpu(COST.INITMOVES);
        }
      } else this.setKind(i, DED);
      await this.INITPOS(i);
      this.INITSTAT(i);
    }
    if (this.CONT()) {
      this.WLDISPLAY();
      await this.GAME(this.wormsN);
      this.PROMPT2();
      await this.SCORE2();
    }
    for (let i = 0; i < this.wormsN; i++) this.setScore(i, 0);
  }

  async SUMO(): Promise<void> {
    if (!this.csbuilt) {
      this.BUILDCHSET();
      await this.CLEARF();
      this.csbuilt = 1;
    }
    this.qflg = 0;
    if (this.TERMINAL() === 0) {
      do await this.INTROGAME();
      while (!this.STOP());
    }
    this.WLDISPLAY();
    this.setKind(0, NEW);
    this.setKind(1, AUTO);
    this.setKind(2, WILD);
    this.setKind(3, DED);
  }

  // ---------------------------------------------------------------- screens 71-75: the menu
  HILINE(): void {
    this.MVHILTE(this.sel);
  }

  static CINC(max: number, v: number): number {
    const n = v + 1;
    return n === max ? 0 : n;
  }

  NAMESAME(w: number): void {
    this.w[w].fill(0x20, NAME, NAME + 8);
    this.w[w].set([0x53, 0x41, 0x4d, 0x45], NAME);
  }

  async DOKIND(w: number, k: number): Promise<void> {
    switch (Math.min(k, 5)) {
      case NEW:
        this.NAMESAME(w);
        this.INITMOVES(w);
        await this.m.cpu(COST.INITMOVES);
        break;
      case AUTO:
        this.NAMESAME(w);
        this.INITAUTO(w);
        await this.m.cpu(COST.INITMOVES);
        break;
      case WILD:
        this.NAMESAME(w);
        this.RANDOMIZE(w);
        await this.m.cpu(COST.RANDOMIZE);
        break;
      default: // DED, SAME: as they are
    }
  }

  async SETOPTS(): Promise<void> {
    this.WLDISPLAY();
    for (let i = 0; i < this.wormsN; i++) await this.DOKIND(i, this.kind(i));
  }

  CURW(): number {
    return this.sel;
  }

  /** TNAMED: a blank and the selected worm's name at double width */
  TNAMED(): void {
    K.chrout(this.m, 0x20);
    const w = this.CURW();
    for (let i = 0; i < 4; i++) this.TEMIT(this.w[w][NAME + i]);
  }

  /** TYKIND ( W# ): the worm's kind under its score, in its colour */
  TYKIND(n: number): void {
    this.m.poke(K.COLOR, MAPCLR[n] ?? 0);
    this.XY(n * 0x0a, 0x16);
    switch (this.kind(n)) {
      case DED: this.type(TXT.TDED); break;
      case NEW: this.type(TXT.TNEW); break;
      case AUTO: this.type(TXT.TSMART); break;
      case WILD: this.type(TXT.TMYST); break;
      case SAME: this.TNAMED(); break;
      default: break; // NOOP
    }
  }

  PROMPT(): void {
    this.P();
    this.type(TXT.PROMPT);
  }

  WOPTION(): void {
    const k = Worms.CINC(5, this.kind(this.CURW()));
    this.setKind(this.CURW(), k);
    this.TYKIND(this.sel);
  }

  WSELECT(): void {
    this.MVDELITE();
    this.sel++;
    if (this.sel === MAXW) this.sel = 0;
    this.MVHILTE(this.sel);
  }

  async SHOWALL(): Promise<void> {
    this.INITL0();
    const s = this.sel;
    for (let i = 0; i < MAXW; i++) {
      this.sel = i;
      this.TYKIND(i);
    }
    this.sel = s;
    this.HILINE();
    await this.m.cpu(COST.SHOWALL);
  }

  // ---------------------------------------------------------------- screens 76-86: files
  DON(): void {
    this.SPON();
    this.INSTALL_DOIRQ();
  }

  DOFF(): void {
    this.SPOFF();
    this.RESET_IRQ();
  }

  private fileName(): string {
    const n = WRM_NAME.slice();
    for (let i = 0; i < 4; i++) n[3 + i] = this.tbuf[i];
    return String.fromCharCode(...n);
  }

  /** WRITE-WORM: IOBUF as "@0:NAME.WRM" (a PRG file: load address, then 64 moves) */
  async WRITE_WORM(): Promise<void> {
    const f = new Uint8Array(2 + 0x40);
    f[0] = IOBUF_ADDR & 0xff;
    f[1] = IOBUF_ADDR >> 8;
    f.set(this.iobuf, 2);
    try {
      if (!this.disk) throw new Error('no disk');
      await this.disk.write(this.fileName(), f);
    } catch {
      this.cmdok = 0;
      this.diskerr = 0x105; // DEVICE NOT PRESENT
    }
  }

  /** READ-WORM: "@0:NAME.WRM" into IOBUF */
  async READ_WORM(): Promise<void> {
    let f: Uint8Array | null = null;
    let err = 0;
    try {
      if (!this.disk) throw new Error('no disk');
      f = await this.disk.read(this.fileName());
      if (!f) err = 0x104; // FILE NOT FOUND
    } catch {
      err = 0x105;
    }
    if (err) {
      this.cmdok = 0;
      this.diskerr = err;
      return;
    }
    for (let i = 2; i < f!.length; i++) if (i - 2 < this.iobuf.length) this.iobuf[i - 2] = f![i];
  }

  DECCNT(): void {
    if (this.ccnt) {
      this.ccnt--;
      K.chrout(this.m, 0x14);
      this.tbuf[this.ccnt] = 0x20;
    }
  }

  BMPCNT(c: number): void {
    if (this.ccnt > 3) {
      K.chrout(this.m, 0x14);
      K.chrout(this.m, c);
    } else {
      this.ccnt++;
      K.chrout(this.m, c);
    }
    this.tbuf[(this.ccnt - 1) & 0xffff] = c;
  }

  /** GTBUF: up to four letters of a file name, RETURN ends */
  async GTBUF(): Promise<void> {
    this.ccnt = 0;
    for (;;) {
      const k = await this.KEY();
      if (Worms.RANGE(k, 0x30, 0x61)) this.BMPCNT(k);
      else if (Worms.RANGE(k, 0x61, 0x7a)) this.BMPCNT(k - 0x20);
      else if (k === 0x14) this.DECCNT();
      else if (Worms.RANGE(k, 0x20, 0x2b)) this.BMPCNT(k);
      else if (k === 0x0d) return;
      else K.chrout(this.m, 0x07); // BELL
    }
  }

  FIXTBUF(): void {
    this.tbuf[8] = 0x57;
    this.tbuf[9] = 0x52;
    this.tbuf[10] = 0x4d;
  }

  TBUFINIT(): void {
    for (let i = 0; i < 0x0b; i++) this.tbuf[i] = 0x20;
  }

  async GNAME(): Promise<void> {
    this.P();
    this.PROMPT2();
    this.P();
    this.DON();
    this.type(TXT.FILENAME);
    this.TBUFINIT();
    await this.GTBUF();
    this.FIXTBUF();
    this.DOFF();
  }

  NOK(): boolean {
    let f = false;
    for (let i = 0; i < 4; i++) f ||= this.tbuf[i] !== 0x20;
    return f;
  }

  async READF(): Promise<void> {
    this.DOFF();
    this.cmdok = 1;
    await this.GNAME();
    if (this.NOK()) await this.READ_WORM();
    else {
      this.P();
      this.type(TXT.NOTLEGAL);
      this.cmdok = 0;
    }
    this.DON();
  }

  async WRITEF(): Promise<void> {
    this.DOFF();
    this.cmdok = 1;
    await this.GNAME();
    if (this.NOK()) await this.WRITE_WORM();
    this.DON();
  }

  async SAVEF(): Promise<void> {
    this.cmdok = 1;
    this.DOFF();
    await this.WRITE_WORM();
    this.DON();
  }

  /** P*: PROMPT2 P" */
  private Pstar(): void {
    this.PROMPT2();
    this.P();
  }

  NWORM(w: number): void {
    for (let i = 0; i < 4; i++) this.w[w][NAME + i] = this.tbuf[i];
    this.setKind(w, SAME);
  }

  FINCMD(): void {
    if (this.cmdok) this.PROMPT();
    else {
      this.P();
      this.PROMPT2();
      this.P();
      this.type(TXT.DISKERROR);
      this.dot(this.diskerr & 0xff);
    }
  }

  async DOREAD(): Promise<void> {
    this.Pstar();
    this.type(TXT.LOAD);
    if (await this.CNFRM()) {
      await this.READF();
      if (this.cmdok) this.RWORM(this.CURW());
    }
    this.FINCMD();
  }

  DOQ(): void {
    this.Pstar();
    this.type(TXT.DOQ);
  }

  async DOWRITE(): Promise<void> {
    this.Pstar();
    this.type(TXT.SAVE);
    if (await this.CNFRM()) {
      this.WWORM(this.CURW());
      await this.WRITEF();
      if (this.cmdok) this.NWORM(this.CURW());
    }
    this.FINCMD();
  }

  SNAME(): void {
    this.TBUFINIT();
    for (let i = 0; i < 4; i++) this.tbuf[i] = this.w[this.CURW()][NAME + i];
    this.FIXTBUF();
  }

  async DOSAVE(): Promise<void> {
    this.Pstar();
    this.type(TXT.UPDATE);
    this.TNAMED();
    this.type(TXT.RET);
    if (await this.CNFRM()) {
      this.SNAME();
      this.WWORM(this.CURW());
      await this.SAVEF();
    }
    this.FINCMD();
  }

  GCMD(): void {
    const a = WCHSET + 3;
    if (this.m.peek16(a)) this.m.poke(a, 0);
    else this.m.poke(a, 8);
  }

  /** ?CMD: speed keys, and L(oad) S(ave) U(pdate) G ? in the menu */
  /**
   * ?CMD. It leaves the key it handled on the stack (`?CH -DUP IF KEY DUP ... DROP SHOWALL THEN`:
   * -DUP's copy is never dropped), which ?WAITTERM's UNTIL then takes: the key, or 0 for none.
   */
  async CMD(): Promise<number> {
    await this.SPEED();
    const c = this.QCH();
    if (!c) return 0;
    const k = await this.KEY();
    const is = (a: number, b: number) => k === a || k === b;
    if (is(0x4c, 0x6c)) await this.DOREAD();
    else if (is(0x53, 0x73)) await this.DOWRITE();
    else if (is(0x55, 0x75)) await this.DOSAVE();
    else if (is(0x47, 0x67)) this.GCMD();
    else if (is(0x3f, 0x2f)) this.DOQ();
    await this.SHOWALL();
    return c;
  }

  async WSTART(): Promise<void> {
    await this.SETOPTS();
    this.PROMPT2();
    this.MVDELITE();
    await this.PLAYGAME();
    await this.SHOWALL();
    this.PROMPT();
    this.MVHILTE(this.sel);
  }

  async TERMCHOICE(n: number): Promise<void> {
    switch (Math.min(n, 4)) {
      case 1: await this.WSTART(); break;
      case 2: this.WSELECT(); break;
      case 4: this.WOPTION(); break;
      default: break; // NOP
    }
  }

  /** ?WAITTERM: ?CMD runs on every pass, also the one that ends with a function key */
  /**
   * ?WAITTERM: `BEGIN ?START -DUP ?CMD UNTIL`. UNTIL takes what ?CMD left when it handled a key, so a
   * key ends the wait too. Returns the stack it leaves, top last: [n], or [n, n] (a function key and
   * a key at once; one n stays on the stack for good).
   */
  async WAITTERM(): Promise<number[]> {
    this.enter('?WAITTERM');
    for (;;) {
      if (this.online) return [ONLINE];
      const n = this.START();
      const stack = n ? [n, n] : [0];
      const c = await this.CMD();
      if (c) stack.push(c);
      if (stack.pop()) return stack;
      await this.m.idle();
    }
  }

  async RUNLOOP(): Promise<never> {
    await this.SHOWALL();
    this.PROMPT();
    /** what stays on the data stack (DEPTH): the second n ?WAITTERM can leave */
    let depth = 0;
    for (;;) {
      await this.CLEAR();
      const stack = await this.WAITTERM();
      const n = stack.pop()!;
      depth += stack.length;
      if (n === ONLINE) await this.playOnline();
      else if (n < 5) {
        await this.TERMCHOICE(n);
        if (depth) { // DEPTH -DUP IF P" . THEN
          this.P();
          this.dot(depth);
        }
      }
      while (this.QCH()) await this.KEY();
    }
  }

  // ---------------------------------------------------------------- online (not in the original)
  /**
   * An online round, from the menu: the four worms as the server dealt them, RAND's SEED as at the
   * start of the program and the raster register from the round's seed, then F7's game (WSTART). The
   * server relays the people's decisions (Seats); a resync (this client came back) plays it again.
   */
  async playOnline(): Promise<void> {
    const r = this.online!;
    this.inOnline = true;
    this.leaveOnline = false;
    try {
      for (;;) {
        try {
          for (let i = 0; i < 4; i++) {
            const s = r.setup.worms[i];
            this.setKind(i, s.kind);
            this.w[i].fill(0x20, NAME, NAME + 8);
            this.w[i].set(s.name.subarray(0, 4), NAME);
            this.w[i].set(s.moves.subarray(0, 0x40), MOVES);
          }
          this.seed = 0x37a7;
          this.m.raster = new Raster(r.seed);
          this.seats = r.seats;
          r.begin();
          await this.WSTART();
          break;
        } catch (e) {
          if (!(e instanceof Error && e.message === 'resync')) throw e;
        }
      }
    } finally {
      this.inOnline = false;
      this.seats = null;
      this.online = null;
      r.done();
    }
  }

  // ---------------------------------------------------------------- screens 86-88, 106: the start
  INSTALLEM(): void {
    this.INSTALL_DOIRQ();
  }

  HEARLD(): void {
    this.XY(0, 0x14);
    this.type(TXT.PRESS);
    this.XY(0, 0x16);
    this.type(TXT.COPYRIGHT);
    this.XY(0, 0x17);
    this.type(TXT.VERSION);
    this.XY(0, 0x18);
    this.type(TXT.EA);
  }

  async GRIDGLIDERS(): Promise<never> {
    this.enter('GRIDGLIDERS');
    K.chrout(this.m, 0x93); // PAGE
    this.m.poke(0xd418, 0x0a); // VL D418 C!
    this.anonb = 0;
    this.INITL0();
    this.HEARLD();
    this.wormsN = 0;
    this.sel = 0;
    for (let i = 0; i < 4; i++) this.INITWORM(i);
    if (!this.csbuilt) {
      this.BUILDCHSET();
      await this.m.cpu(COST.BUILDCHSET);
      this.csbuilt = 1;
      await this.CLEARF();
      this.INITSPRITES();
      this.INSTALLEM();
    }
    await this.SUMO();
    K.chrout(this.m, 0x93);
    await this.CLEARF();
    this.INITL0();
    this.m.poke(0x9d, 0);
    for (let i = 0; i < 4; i++) this.INITMOVES(i);
    this.wormsN = 4;
    return this.RUNLOOP();
  }

  /** The program: GRIDGLIDERS, and again after every F1. */
  async run(): Promise<never> {
    for (;;) {
      try {
        await this.GRIDGLIDERS();
      } catch (e) {
        if (!(e instanceof Quit)) throw e;
      }
    }
  }
}

/** what ?WAITTERM returns when an online round is to be played */
const ONLINE = 0x100;

/** an online round for the program (onlinegame.ts) */
export interface OnlineRun {
  setup: { worms: { kind: number; name: Uint8Array; moves: Uint8Array }[]; owners: number[] };
  /** the raster sequence's seed */
  seed: number;
  seats: Seats;
  /** the game starts (again): decisions count from 0 */
  begin(): void;
  /** the game is over */
  done(): void;
}

/** PAD in the release image (where WRITE-WORM saves from: the files' load address) */
export const IOBUF_ADDR = 0x828f;

function CRMAP_OFF(crix: number): number {
  return (crix & 0x7f) * 24;
}

/** a 16-bit cell read as signed */
function sgn(v: number): number {
  v &= 0xffff;
  return v & 0x8000 ? v - 0x10000 : v;
}
