// The construction set on the original and on the port, driven by the same robot (robot.ts): from
// EDIT.S START on the starting table, through the kit, the wiring kit (WIRE.S), the disk menu (DISK.S)
// and the game (RUN2.S). One line a WAIT: the cursor and a hash of all RAM below $B000 but the stack.
// The original's SWAP.S sector reads and DOS's file manager are done by the test machine (the same
// file manager model the port uses, src/fm.ts).
import { bitmapOverride } from '../src/bitmaps.ts';
import { pointer } from '../src/cdraw.ts';
import { dosMessages, files } from '../src/disk.ts';
import { EDITOR } from '../src/edit.ts';
import { FileManager, FMPL, fileName } from '../src/fm.ts';
import { io, m } from '../src/machine.ts';
import { startTable } from '../src/shell.ts';
import { bitmapPattern } from './bitmaps.ts';
import { Original } from './original.ts';
import { Port } from './port.ts';
import { Robot, type Act } from './robot.ts';
import { buildTable, ramHash, type TableSpec, type Target } from './scenario.ts';

export interface Session {
  name: string;
  acts: Act[];
  /** a table instead of the starting one */
  table?: TableSpec;
  /** files on the disk at the start */
  files?: Record<string, number[]>;
}

class Stop {}

/**
 * DISK.S's STACKTEMP ($AE): the stack pointer at the disk menu's entry (TSX). Like the stack page it
 * is the 6502's stack, which the port does not have: in the original it drifts down by the return
 * addresses each visit to the disk menu or the wiring kit leaves behind (SWAPDISK and SWAPWIRE end
 * with a JMP into EDIT.S, not an RTS), and it is only ever put back into S. Not compared.
 */
const STACK = [0xae];

function capture(t: Target, robot: Robot, lines: string[], tail = 6): (n: number) => void {
  let after = 0;
  return (n) => {
    const r = t.ram;
    lines.push(`${n} c=${r[0x83] * 7 + r[0x84]},${r[0x82]} r=${ramHash(r, STACK)}`);
    if (robot.done && ++after > tail) throw new Stop();
    if (n > 200_000) throw new Error('the session does not end');
  };
}

function setTable(t: Target, s: Session): void {
  if (s.table) buildTable(t, s.table);
  else startTable(t.ram);
  dosMessages(t.ram);
}

/** the original: EDIT.S START at $9500 as SWAPEDIT jumps to it */
export function runOriginal(s: Session, limit = 2_000_000_000, seen?: (r: Robot, o: Original) => void): { lines: string[]; files: Map<string, Uint8Array> } {
  const o = new Original();
  setTable(o, s);
  const store = new Map<string, Uint8Array>(Object.entries(s.files ?? {}).map(([k, v]) => [k, Uint8Array.from(v)]));
  const fm = new FileManager();
  const A = o.A;
  const swapSectors = A.SWAP.symbols.get('SWAPSECTORS')!;
  const diskWait1 = A.DISK.symbols.get('WAIT1')!;
  o.m.trap = (pc) => {
    const c = o.m.cpu;
    const ram = o.ram;
    if (pc === diskWait1 && ram[diskWait1] === 0xad) {
      // DISK.S INPROMPT1's wait for a key after "INSERT YOUR GAME DISK": over, as in the port
      c.pc = diskWait1 + 5;
      return true;
    }
    if (pc === swapSectors) {
      const piece = c.x;
      if (piece === 0) {
        bitmapPattern(ram);
        for (const k of ['RUN', 'PPAK', 'EDIT'] as const) o.m.load(A[k]);
      } else o.m.load(A[(['', 'WIRE', 'DISK', 'RUN2'] as const)[piece] as 'WIRE']);
      o.m.rts();
      return true;
    }
    if (pc === 0xaafd) {
      // DOS's file manager
      const op = ram[FMPL];
      let err = 0;
      if (op === 1) err = fm.open(ram, c.x, store.get(fileName(ram)) ?? null);
      else if (op === 2) {
        const f = fm.close(ram);
        if (f) store.set(f.name, f.data);
      } else if (op === 3 || op === 4) err = fm.rw(ram);
      else err = 2;
      ram[FMPL + 10] = err;
      if (process.env.DEBUG_FM) console.log('FM', op, ram[FMPL + 1], fileName(ram), 'x', c.x, 'err', err);
      c.p = (c.p & ~1) | (err ? 1 : 0);
      o.m.rts();
      return true;
    }
    return false;
  };
  const robot = new Robot(structuredClone(s.acts), () => o.ram);
  seen?.(robot, o);
  o.script = robot;
  const lines: string[] = [];
  o.onWait = capture(o, robot, lines);
  const c = o.m.cpu;
  c.s = 0xff;
  c.pc = A.EDIT.symbols.get('START')!;
  try {
    o.m.run(-1, limit);
  } catch (e) {
    if (!(e instanceof Stop)) throw e;
  }
  return { lines, files: store };
}

/** the port: the EDITOR generator from START */
export function runPort(s: Session, seen?: (r: Robot) => void): { lines: string[]; files: Map<string, Uint8Array> } {
  const p = new Port();
  bitmapOverride.load = bitmapPattern;
  try {
    setTable(p, s);
    const store = new Map<string, Uint8Array>(Object.entries(s.files ?? {}).map(([k, v]) => [k, Uint8Array.from(v)]));
    files.store = { read: (n) => store.get(n) ?? null, write: (n, d) => void store.set(n, d) };
    pointer.x = null;
    pointer.y = null;
    const robot = new Robot(structuredClone(s.acts), () => m);
    seen?.(robot);
    p.script = robot;
    const lines: string[] = [];
    p.onWait = capture(p, robot, lines);
    try {
      for (const v of EDITOR('START')) if (v instanceof Promise) throw new Error('a file call waited');
    } catch (e) {
      if (!(e instanceof Stop)) throw e;
    }
    void io;
    return { lines, files: store };
  } finally {
    bitmapOverride.load = null;
    files.store = null;
  }
}

/** a run's lines and then each file left on the disk (name and bytes in hex), as the goldens have them */
export function editorLines(r: { lines: string[]; files: Map<string, Uint8Array> }): string[] {
  const out = [...r.lines];
  for (const [name, data] of [...r.files.entries()].sort(([a], [b]) => (a < b ? -1 : 1))) {
    out.push(`file ${name} ${Buffer.from(data).toString('hex')}`);
  }
  return out;
}
