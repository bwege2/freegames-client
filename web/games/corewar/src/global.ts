// global.h, config.h and global.c: pMARS's constants, structures and global variables. pMARS is built
// as its src/Makefile (and Debian) builds it: -DEXT94 -DXWINGRAPHX -DPERMUTATE -DRWLIMIT, so EXT94's
// NEW_OPCODES, NEW_MODES, PSPACE and SHARED_PSPACE are on, SERVER and SMALLMEM are off, ADDR_T is int.
// The globals live in one object, `g`, reset by reset_globals() at every start of the program.
import { INT_MAX } from './libc.ts';

export const PMARSVER = 95;
export const PMARSDATE = '03/01/2026';

/* return codes */
export const GRAPHERR = -4, NOT386 = -3, MEMERR = -2, SERIOUS = -1, FNOFOUND = 1, CLP_NOGOOD = 2, PARSEERR = 3, USERABORT = 4;
export const SUCCESS = 0, WARNING = 0;
/* eval.c */
export const OVERFLOW = 1, OK_EXPR = 0, BAD_EXPR = -1, DIV_ZERO = -2;
/* cdb.c */
export const NOBREAK = 0, BREAK = 1, STEP = 2;
export const SKIP = 1, RESET = 2;
export const UNSHARED = -1, PIN_APPEARED = -2;

/* NEW_MODES: the A-field indirect modes *, {, } are the B-field ones with bit 7 set */
export const INDIR_A = (x: number): number => 0x80 & x;
export const RAW_MODE = (x: number): number => 0x7f & x;
export const SYM_TO_INDIR_A = (x: number): number => ((x - 3) | 0x80) & 0xff;
export const INDIR_A_TO_SYM = (x: number): number => RAW_MODE(x) + 3;

export const MAXCORESIZE = (INT_MAX >> 1) + 1;
export const MAXTASKNUM = INT_MAX;
export const MAXROUND = INT_MAX;
export const MAXWARRIOR = 36;
export const MAXINSTR = 1000;
export const MAXSEPARATION = Math.trunc(MAXCORESIZE / MAXWARRIOR);
export const MAXALLCHAR = 8000;

/* config.h defaults */
export const DEFAULTWARRIOR = 2;
export const DEFAULTCORESIZE = 8000;
export const DEFAULTTASKNUM = 8000;
export const DEFAULTINSTRLIM = 100;
export const DEFAULTSEPARATION = 100;
export const DEFAULTROUNDS = 1;
export const DEFAULTCYCLES = 80000n;
export const DEFAULTSCORE = '(W*W-1)/S';
export const CLRSCR = '\x1b[;H\x1b[2J';
export const SPEEDLEVELS = 9;

/* enum addr_mode */
export const IMMEDIATE = 0, DIRECT = 1, INDIRECT = 2, PREDECR = 3, POSTINC = 4;
/* enum op (asm.c:opname[]) */
export const MOV = 0, ADD = 1, SUB = 2, MUL = 3, DIV = 4, MOD = 5, JMZ = 6, JMN = 7, DJN = 8, CMP = 9, SLT = 10,
  SPL = 11, DAT = 12, JMP = 13, SEQ = 14, SNE = 15, NOP = 16, LDP = 17, STP = 18;
/* enum modifier */
export const mA = 0, mB = 1, mAB = 2, mBA = 3, mF = 4, mX = 5, mI = 6;

/** mem_struct (A_value, B_value: ADDR_T; opcode = op << 3 | modifier, modes, debuginfo: FIELD_T) */
export interface Cell {
  A_value: number;
  B_value: number;
  opcode: number;
  A_mode: number;
  B_mode: number;
  debuginfo: number;
}
export const cell = (c?: Cell): Cell => (c ? { ...c } : { A_value: 0, B_value: 0, opcode: 0, A_mode: 0, B_mode: 0, debuginfo: 0 });

/** The core, a struct of arrays: memory[i].A_value is core.A[i]. */
export class Core {
  A: Int32Array;
  B: Int32Array;
  op: Uint8Array;
  am: Uint8Array;
  bm: Uint8Array;
  dbg: Uint8Array;
  constructor(n: number) {
    this.A = new Int32Array(n);
    this.B = new Int32Array(n);
    this.op = new Uint8Array(n);
    this.am = new Uint8Array(n);
    this.bm = new Uint8Array(n);
    this.dbg = new Uint8Array(n);
  }
  get(i: number): Cell {
    return { A_value: this.A[i], B_value: this.B[i], opcode: this.op[i], A_mode: this.am[i], B_mode: this.bm[i], debuginfo: this.dbg[i] };
  }
  set(i: number, c: Cell): void {
    this.A[i] = c.A_value;
    this.B[i] = c.B_value;
    this.op[i] = c.opcode;
    this.am[i] = c.A_mode;
    this.bm[i] = c.B_mode;
    this.dbg[i] = c.debuginfo;
  }
  copy(to: number, from: number): void {
    this.A[to] = this.A[from];
    this.B[to] = this.B[from];
    this.op[to] = this.op[from];
    this.am[to] = this.am[from];
    this.bm[to] = this.bm[from];
    this.dbg[to] = this.dbg[from];
  }
}

/** warrior_struct; taskHead/taskTail are indices into the task queue, nextWarrior an index into g.warrior */
export interface Warrior {
  pSpaceIDNumber: bigint;
  taskHead: number;
  taskTail: number;
  tasks: number;
  lastResult: number;
  pSpaceIndex: number;
  position: number;
  instLen: number;
  offset: number;
  score: number[];
  name: string | null;
  version: string | null;
  date: string | null;
  fileName: string | null;
  authorName: string | null;
  instBank: Cell[] | null;
  nextWarrior: number;
}

function newWarrior(): Warrior {
  return {
    pSpaceIDNumber: 0n, taskHead: 0, taskTail: 0, tasks: 0, lastResult: 0, pSpaceIndex: 0, position: 0, instLen: 0, offset: 0,
    score: new Array(MAXWARRIOR * 2 - 1).fill(0), name: null, version: null, date: null, fileName: null, authorName: null,
    instBank: null, nextWarrior: 0,
  };
}

function globals() {
  return {
    errorcode: SUCCESS,
    errorlevel: WARNING,
    errmsg: '',
    /* some parameters */
    warriors: 0,
    coreSize: 0,
    taskNum: 0,
    instrLim: 0,
    separation: 0,
    rounds: 0,
    /** long */
    cycles: 0n,
    readLimit: 0,
    writeLimit: 0,
    cmdMod: 0,
    /** S32_T */
    seed: 0,
    useExtRNG: 0,
    SWITCH_e: 0,
    SWITCH_b: 0,
    SWITCH_k: 0,
    SWITCH_8: 0,
    SWITCH_f: 0,
    SWITCH_F: null as string | null,
    SWITCH_Fnum: 0,
    SWITCH_V: 0,
    SWITCH_o: 0,
    SWITCH_Q: -1,
    SWITCH_eq: DEFAULTSCORE,
    SWITCH_P: 0,
    SWITCH_A: 0,
    /* displays (XWINGRAPHX) */
    loopDelay: 0,
    SWITCH_v: 0,
    displayLevel: 0,
    displayMode: 0,
    displaySpeed: 0,
    keyDelay: 0,
    inCdb: false,
    debugState: NOBREAK,
    copyDebugInfo: true,
    inputRedirection: false,
    INITIALINST: cell(),
    warrior: Array.from({ length: MAXWARRIOR }, newWarrior),
    pSpace: new Array<Int32Array | null>(MAXWARRIOR).fill(null),
    pSpaceSize: 0,
    /* sim.h: the simulator's state, also read by cdb and the display */
    round_num: 0,
    cycle: 0,
    progCnt: 0,
    /** index of the running warrior in g.warrior */
    W: 0,
    warriorsLeft: 0,
    memory: new Core(0),
    taskQueue: new Int32Array(0),
    /** index one past the queue (endQueue - taskQueue) */
    totaltask: 0,
    endWar: 0,
    alloc_p: false,
    /** the -display, -geometry and -fn options (xwindisp.c xStorage[]) */
    xStorage: [null, null, null] as (string | null)[],
    xDisplayType: 0,
    /** cdb.c: the panel in use (0 = one panel) and the current address */
    curPanel: 0,
    curAddr: 0,
    curAddr2: 0,
    printAttr: 0,
    /** a SERVER build (no debugger): used for online battles, where every client must run the same */
    server: false,
  };
}

export type Globals = ReturnType<typeof globals>;
export let g: Globals = globals();
export function reset_globals(): void {
  g = globals();
}

export const loopDelayAr = [1, 1, 1, 100, 500, 2500, 10000, 40000, 100000];
export const keyDelayAr = [31, 15, 7, 3, 1, 0, 0, 0, 0];
