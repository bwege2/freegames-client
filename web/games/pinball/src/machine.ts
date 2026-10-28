// The Apple II the translation runs on: its 64 KiB of RAM with the original's memory map, the soft
// switches the listings read ($C000 keyboard, $C010 strobe, $C030 speaker, $C061/$C062 buttons) and
// the two monitor routines they call, WAIT ($FCA8) and PREAD ($FB1E), as functions.
//
// Time is the original's: `io.cycles` counts 6502 cycles (1.023 MHz). WAIT and PREAD add their ROM
// timing, the sound routines add their loops' cycles exactly, and the main loops add what their
// frame's work costs on the original (see run.ts). The routines that wait (WAIT, polling loops) are
// generators: each `yield` hands the time over to the front end, which resumes them when the real
// clock has caught up.
import { CY } from './cycles.ts';
import { IMAGE } from './image.ts';

export const m = new Uint8Array(0x10000);

/** what the routines that wait give back to whoever drives them */
export type Wait = Generator<unknown, void, unknown>;
/** a generator that returns a value */
export type WaitFor<T> = Generator<unknown, T, unknown>;

export interface Io {
  /** $C061 and $C062 (bit 7 set = pressed) */
  btn: [number, number];
  /** what PREAD reads from the two paddles (0..255) */
  pdl: [number, number];
  /** $C000: the last key, bit 7 set until the strobe is cleared */
  key: number;
  /** 6502 cycles since the machine started */
  cycles: number;
  /** cycle stamps of the speaker's clicks (taken by the sound output) */
  clicks: number[];
  waits: number;
  polls: number;
  /** before every input read (scripts, input tapes) */
  onPoll: (() => void) | null;
  /** at every WAIT */
  onWait: (() => void) | null;
  /** at RUN.S DOHIT (tests) */
  onHit: (() => void) | null;
  /** at RUN2.S MAIN4, a player's ball about to begin (online play: whose inputs the program reads) */
  onBall: ((player: number) => void) | null;
  /** how often each charge (src/cycles.ts) was reached, when set (tests) */
  charges: Record<string, number> | null;
}

export const io: Io = {
  btn: [0, 0],
  pdl: [0, 0],
  key: 0,
  cycles: 0,
  clicks: [],
  waits: 0,
  polls: 0,
  onPoll: null,
  onWait: null,
  onHit: null,
  onBall: null,
  charges: null,
};

function poll(): void {
  io.polls++;
  io.onPoll?.();
}

/** LDA $C061 / $C062 */
export function button(n: 0 | 1): number {
  poll();
  return io.btn[n];
}

/** LDA $C000 */
export function keyboard(): number {
  poll();
  return io.key;
}

/** LDA/STA $C010 */
export function strobe(): void {
  io.key &= 0x7f;
}

/** LDA $C030, `at` cycles after io.cycles */
export function click(at = 0): void {
  io.clicks.push(io.cycles + at);
}

/** the monitor's PREAD: paddle `x`'s count (its loop takes 11 cycles a count) */
export function PREAD(x: number): number {
  poll();
  const v = io.pdl[x & 1];
  io.cycles += 6 + 13 + 11 * v + 6; // JSR, the count loop, RTS
  return v;
}

/** WAIT's cycles for A, JSR and RTS included */
export function waitCycles(a: number): number {
  const n = a === 0 ? 256 : a;
  return Math.round((26 + 27 * n + 5 * n * n) / 2);
}

/** the monitor's WAIT ($FCA8): its time is added; the caller yields */
export function WAIT(a: number): void {
  io.cycles += waitCycles(a);
  io.waits++;
  io.onWait?.();
}

export type Charge = keyof typeof CY;

/**
 * The code reaches a charge label (test/gen-cycles.ts CHARGES): the cycles the original spends
 * from there to the next one (src/cycles.ts).
 */
export function cy(k: Charge, times = 1): void {
  io.cycles += CY[k] * times;
  if (io.charges) io.charges[k] = (io.charges[k] ?? 0) + times;
}

// ---- memory helpers for the translation ----

/** the word at a zero page (or any) address, low byte first */
export function w(a: number): number {
  return m[a] | (m[(a + 1) & 0xffff] << 8);
}

export function setw(a: number, v: number): void {
  m[a] = v & 0xff;
  m[(a + 1) & 0xffff] = (v >> 8) & 0xff;
}

/** the byte at (zp),Y */
export function ind(zp: number, y: number): number {
  return m[(w(zp) + y) & 0xffff];
}

/** STA (zp),Y */
export function setind(zp: number, y: number, v: number): void {
  m[(w(zp) + y) & 0xffff] = v & 0xff;
}

/** loads what a listing assembles to (the program pieces SWAP.S reads from the disk) */
export function load(file: keyof typeof IMAGE): void {
  for (const seg of IMAGE[file]) {
    const h = seg.hex;
    for (let i = 0; i < h.length; i += 2) m[seg.org + i / 2] = parseInt(h.slice(i, i + 2), 16);
  }
}

/** a fresh machine: RAM cleared, inputs released, time 0 */
export function reset(): void {
  m.fill(0);
  io.btn = [0, 0];
  io.pdl = [0, 0];
  io.key = 0;
  io.cycles = 0;
  io.clicks = [];
  io.waits = 0;
  io.polls = 0;
}
