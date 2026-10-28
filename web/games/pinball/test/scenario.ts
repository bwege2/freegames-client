// Scenarios that run the same way on the original (the assembled listings in the test's 6502 core)
// and on the port (the TypeScript translation): build a table from the parts library as the
// construction set does, set the start state, drive buttons, paddles and keys, and write one line of
// state per frame (each WAIT of the main loop). test/golden/*.txt holds the original's lines.

export type FileKey = 'CDRAW' | 'PPAK' | 'RUN' | 'RUN2' | 'EDIT' | 'WIRE' | 'DISK' | 'SWAP';

export interface Regs {
  a?: number;
  x?: number;
  y?: number;
  c?: number;
}

/** what a scenario needs from a machine: the original's or the port's */
export interface Target {
  ram: Uint8Array;
  sym(file: FileKey, name: string): number;
  /** runs a routine of a listing to its RTS */
  call(file: FileKey, routine: string, regs?: Regs): void;
  script: InputScript | null;
  /** at every WAIT (after the script's wait) */
  onWait: ((waits: number) => void) | null;
  /** at the entry of RUN.S DOHIT (the ball hit something) */
  onHit: (() => void) | null;
  /** the speaker's clicks of the frame: cycle gaps between clicks of one SND/SOUND call */
  takeClicks(): number[];
  /** loads the RUN2.S overlay at $8554 (the original's SWAPUSER) */
  loadGame(): void;
  /**
   * DISK.S PLAY: MAKEHOLE(191), the RUN2.S overlay, DISKPLAY until it jumps to RELOAD (Esc in the
   * players' count or in a ball)
   */
  playGame(): void;
}

/** what drives a machine's inputs: FrameScript (by frame) or Robot (by the cursor) */
export interface InputScript {
  inputs: Inputs;
  /** a key not read yet (bit 7 set), or 0 */
  key: number;
  wait(waits: number): void;
  poll(polls: number, waits: number): void;
}

export interface Inputs {
  btn0: number;
  btn1: number;
  pdl0: number;
  pdl1: number;
}

export interface InputEvent {
  /** the WAIT count from which it applies (the main loop's frame) */
  frame?: number;
  /**
   * with `frame`: so many input reads after that WAIT (for loops that poll without WAIT); alone:
   * the input-read count from which it applies
   */
  poll?: number;
  /** alone: once so many input reads came without a WAIT (a loop waiting for a key or button) */
  idle?: number;
  btn0?: boolean;
  btn1?: boolean;
  pdl0?: number;
  pdl1?: number;
  /** an Apple II key code (bit 7 set), delivered once */
  key?: number;
}

/** inputs from a list of events; both machines call wait() and poll() at the same points */
export class FrameScript {
  inputs: Inputs = { btn0: 0, btn1: 0, pdl0: 128, pdl1: 0 };
  key = 0;
  private next = 0;
  private readonly events: InputEvent[];
  /** the input reads up to each WAIT */
  private readonly pollsAt: number[] = [0];
  private polls = 0;

  constructor(events: InputEvent[]) {
    this.events = events;
  }

  private due(e: InputEvent, waits: number): boolean {
    if (e.idle !== undefined) return this.polls - (this.pollsAt[waits] ?? 0) >= e.idle;
    if (e.frame !== undefined) {
      if (e.frame > waits) return false;
      if (e.poll === undefined) return true;
      return this.polls - this.pollsAt[e.frame] >= e.poll;
    }
    return e.poll !== undefined && e.poll <= this.polls;
  }

  private apply(e: InputEvent): void {
    if (e.btn0 !== undefined) this.inputs.btn0 = e.btn0 ? 0x80 : 0;
    if (e.btn1 !== undefined) this.inputs.btn1 = e.btn1 ? 0x80 : 0;
    if (e.pdl0 !== undefined) this.inputs.pdl0 = e.pdl0;
    if (e.pdl1 !== undefined) this.inputs.pdl1 = e.pdl1;
    if (e.key !== undefined) this.key = e.key;
  }

  wait(waits: number): void {
    this.pollsAt[waits] = this.polls;
    this.waits = waits;
    this.run();
  }

  poll(polls: number, waits: number): void {
    this.polls = polls;
    this.waits = waits;
    this.run();
  }

  private waits = 0;

  private run(): void {
    // events in order; an `idle` event whenever its loop stalls, wherever it is in the list
    while (this.next < this.events.length && this.events[this.next].idle === undefined && this.due(this.events[this.next], this.waits)) {
      this.apply(this.events[this.next]);
      this.next++;
    }
    for (let i = this.next; i < this.events.length; i++) {
      const e = this.events[i];
      if (e.idle !== undefined && !this.done.has(i) && this.due(e, this.waits)) {
        this.done.add(i);
        this.apply(e);
      }
    }
    while (this.next < this.events.length && this.done.has(this.next)) this.next++;
  }

  private readonly done = new Set<number>();
}

// ---- tables ----

/** the parts box of EDIT.S (BOXLO, OBJLEN, OBJADDRLO): RUN.S's library labels in box order */
export const LIBRARY = [
  'POLY', 'LAUNCHER', 'LEFTFLIPPER', 'RIGHTFLIPPER', 'BALL', 'BMP1', 'BMP2', 'BMP3', 'BMP4', 'BMP5', 'BMP6',
  'LKICK', 'RKICK', 'KICK1', 'KICK2', 'ROLL1', 'ROLL2', 'ROLL3', 'TARG1', 'TARG2', 'TARG3', 'TARG4', 'TARG5', 'TARG6',
  'LFLIPPER2', 'RFLIPPER2', 'POLY1', 'POLY2', 'POLY3', 'POLY4', 'LANE1', 'LANE2', 'LANE3', 'GATE1', 'GATE2', 'GATE3',
  'GATE4', 'DROP1', 'DROP2', 'CATCH1', 'CATCH2', 'SPIN1', 'MAG1',
] as const;
export type LibPart = (typeof LIBRARY)[number];

export type TableObject =
  | { poly: { type: 1 | 2; color: number; x: number[]; y: number[] } }
  /** a library part moved by (dx, dy) from where it sits in the parts box */
  | { part: LibPart; dx: number; dy: number };

export interface TableSpec {
  /** WSET: gravity, speed, kick, elasticity (0..7 each) */
  wset: [number, number, number, number];
  /** LOGIC: 6 AND gates of 3 inputs (object numbers) and an output byte */
  logic?: number[];
  objects: TableObject[];
}

/**
 * The table outline the port starts with (reconstructed: the original's starting table was a file on
 * its disk, which is not published). A B-polygon (type 2): what is inside is the playfield. On the
 * right a launch lane (x 141..151), open to the field above y 40; at the bottom the drain (x 58..94).
 * The first edge goes down (y[0] < y[1]), as PPAK.S ALIGNPOLY leaves every polygon.
 */
export const OUTLINE = {
  type: 2 as const,
  color: 6,
  x: [151, 151, 141, 141, 138, 138, 94, 94, 58, 58, 2, 2, 12, 140],
  y: [12, 190, 190, 40, 40, 150, 180, 190, 190, 180, 150, 12, 1, 1],
};

/**
 * Writes LOGIC, WSET and PBDATA as the construction set leaves them: object 0 first, every part a
 * copy of OBJLEN bytes of its library entry (ADDOBJ), moved as DRAGOBJ moves it (every vertex by
 * DELX/DELY, the bitmap's row by DELY and its column through D7/M7).
 */
export function buildTable(t: Target, spec: TableSpec): void {
  const m = t.ram;
  const LOGIC = 0x4000;
  for (let i = 0; i < 24; i++) m[LOGIC + i] = spec.logic?.[i] ?? 0;
  for (let i = 0; i < 4; i++) m[0x4018 + i] = spec.wset[i];
  const objlen = t.sym('EDIT', 'OBJLEN');
  const d7 = 0x1400, m7 = 0x1500;
  const bodies: number[][] = [];
  for (const o of spec.objects) {
    if ('poly' in o) {
      const p = o.poly;
      bodies.push([p.type, p.color, p.x.length, ...p.x, ...p.y]);
    } else {
      const k = LIBRARY.indexOf(o.part);
      if (k < 0) throw new Error(`no part ${o.part}`);
      const len = m[objlen + k];
      const at = t.sym('RUN', o.part);
      const b = Array.from(m.subarray(at, at + len));
      const n = b[2];
      for (let i = 0; i < n; i++) {
        b[3 + i] = (b[3 + i] + o.dx) & 0xff;
        b[3 + n + i] = (b[3 + n + i] + o.dy) & 0xff;
      }
      if (b[0] === 3) {
        const lb = 3 + 2 * n;
        b[lb + 2] = (b[lb + 2] + o.dy) & 0xff;
        const x = (b[lb + 3] * 7 + b[lb + 4] + o.dx) & 0xff;
        b[lb + 3] = m[d7 + x];
        b[lb + 4] = m[m7 + x];
      }
      bodies.push(b);
    }
  }
  let p = 0x401c;
  m[p++] = bodies.length;
  for (const b of bodies) m[p++] = b.length;
  for (const b of bodies) for (const v of b) m[p++] = v;
}

// ---- capture ----

const hex2 = (v: number) => v.toString(16).padStart(2, '0');

/**
 * The RAM the comparison covers, as one FNV-1a hash: everything below $B000 but the stack page
 * (zero page, the span tables and run lists, the bitmap tables and CDRAW.S, the screen, the table,
 * the bitmaps, RUN.S with its patched operands and data, PPAK.S, EDIT.S or RUN2.S with the players'
 * states and the sleepers).
 */
/** FNV-1a of RAM below $B000 but the stack page; `skip`: more bytes taken as 0 */
export function ramHash(m: Uint8Array, skip: readonly number[] = []): string {
  if (skip.length) {
    m = m.slice(0, 0xb000);
    for (const a of skip) m[a] = 0;
  }
  let h = 0x811c9dc5;
  for (let i = 0; i < 0xb000; i++) {
    if (i === 0x100) i = 0x200;
    h ^= m[i];
    h = Math.imul(h, 0x01000193) >>> 0;
  }
  return h.toString(16).padStart(8, '0');
}

/**
 * One line a frame: the balls' states (BST X1 Y1 BDX BDY BXACC BYACC each, in the run list's
 * order; "." when unchanged since the last frame), the hits since the last frame (object/THETA/BMOVE
 * at DOHIT), DSCORE DBONUS BMULT, the score digits ("." when unchanged), the speaker's clicks (cycles
 * between them) and the RAM hash.
 */
export class Recorder {
  readonly lines: string[] = [];
  private hits: string[] = [];
  private readonly t: Target;
  private readonly moveball: number;
  private readonly digits: number;
  private last: string[] = [];
  private lastDigits = '';

  constructor(t: Target, game = false) {
    this.t = t;
    this.moveball = t.sym('RUN', 'MOVEBALL');
    // the digits: RUN.S SCORE1 and BONUS (test play), RUN2.S SCORE1..SCORE4 and BONUS (a game)
    this.digits = game ? t.sym('RUN2', 'SCORE1') : t.sym('RUN', 'SCORE1');
    this.game = game;
    t.onHit = () => {
      const m = t.ram;
      this.hits.push(`${m[0x99]}/${m[0x14]}/${hex2(m[0xda])}`);
    };
  }

  private readonly game: boolean;

  frame(n: number): void {
    const m = this.t.ram;
    const balls: string[] = [];
    // the run list: RCN (RUN.S) / RUNCHN (RUN2.S) at $680, objects' bases in VLO/VHI
    const runlen = m[0xc0];
    let k = 0;
    for (let i = 0; i < runlen; i++) {
      const o = m[0x680 + i];
      const lb = m[0x580 + o] | (m[0x600 + o] << 8);
      const run = m[lb + 10] | (m[lb + 11] << 8);
      if (run !== this.moveball) continue;
      const s = [16, 17, 18, 19, 20, 21, 22].map((j) => hex2(m[lb + j])).join('');
      balls.push(s === this.last[k] ? '.' : s);
      this.last[k++] = s;
    }
    const nd = this.game ? 45 : 18;
    const d = Array.from(m.subarray(this.digits, this.digits + nd)).join('');
    const digits = d === this.lastDigits ? '.' : d;
    this.lastDigits = d;
    const clicks = this.t.takeClicks();
    this.lines.push(
      `${n} b=${balls.join(',')} h=${this.hits.join(',')} s=${hex2(m[0xcb])}${hex2(m[0xcc])}${hex2(m[0xcd])} d=${digits}` +
        ` k=${clicks.join('.')} r=${ramHash(m)}`,
    );
    this.hits = [];
  }
}

/** the original's editor memory before PLAY: the construction set's routines, tables, a table */
export function prepare(t: Target, spec: TableSpec): void {
  buildTable(t, spec);
  t.call('CDRAW', 'INIT');
  t.call('CDRAW', 'SETMODE', { y: 2 });
  t.ram[0x9e] = 0; // SCANMODE: merge into the ball's table
  t.call('PPAK', 'DRAWDISPLAY');
}
