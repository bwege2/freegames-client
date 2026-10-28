// The Apple II around the test's 6502 core (tests only): 64 KiB of RAM, the soft switches the
// listings touch ($C000 keyboard, $C010 strobe, $C030 speaker, $C050-$C057 display, $C061/$C062
// buttons) and the two monitor ROM routines they call, WAIT ($FCA8) and PREAD ($FB1E), done here
// with their ROM timing. Inputs come from a Script that both this machine and the port's machine
// (src/machine.ts) consult at the same points: every input read and every WAIT.
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { Cpu, FLAGS } from './cpu6502.ts';
import { assemble, FILES, type Assembly } from './merlin.ts';

export const ORIG = join(import.meta.dirname, '../../../../re/pinball/orig/src');

export interface Inputs {
  btn0: number;
  btn1: number;
  pdl0: number;
  pdl1: number;
}

/**
 * Drives the inputs. `wait` is called at every WAIT, `poll` before every input read; both get the
 * counts so far. The same script object must not be shared between two machines.
 */
export interface Script {
  inputs: Inputs;
  /** a key the program has not read yet (bit 7 set), or 0 */
  key: number;
  wait(waits: number): void;
  poll(polls: number, waits: number): void;
}

/** WAIT's cycles for A (the monitor's formula, JSR and RTS included) */
export function waitCycles(a: number): number {
  const n = a === 0 ? 256 : a;
  return Math.round((26 + 27 * n + 5 * n * n) / 2);
}

export function loadAll(): Record<keyof typeof FILES, Assembly> {
  const out = {} as Record<keyof typeof FILES, Assembly>;
  for (const [k, f] of Object.entries(FILES) as [keyof typeof FILES, string][]) {
    out[k] = assemble(readFileSync(join(ORIG, f), 'latin1'), k);
  }
  return out;
}

export class Apple2 {
  readonly ram = new Uint8Array(0x10000);
  readonly cpu: Cpu;
  script: Script | null = null;
  waits = 0;
  polls = 0;
  /** cycle stamps of every speaker access */
  speaker: number[] = [];
  /** called with the PC before each instruction when set (tracing, hooks) */
  onStep: ((pc: number) => void) | null = null;
  /** routines done here instead (SWAP.S's sector reads, DOS's file manager): true when taken */
  trap: ((pc: number) => boolean) | null = null;
  key = 0;

  constructor() {
    this.cpu = new Cpu({
      read: (a) => this.read(a),
      write: (a, v) => this.write(a, v),
    });
  }

  load(asm: Assembly): void {
    for (let a = 0; a < 0x10000; a++) if (asm.written[a]) this.ram[a] = asm.mem[a];
  }

  private poll(): void {
    this.polls++;
    if (this.script) {
      this.script.poll(this.polls, this.waits);
      if (this.script.key) {
        this.key = this.script.key | 0x80;
        this.script.key = 0;
      }
    }
  }

  read(a: number): number {
    if (a >= 0xc000 && a < 0xc100) {
      if (a === 0xc000) {
        this.poll();
        return this.key;
      }
      if (a === 0xc010) {
        this.key &= 0x7f;
        return 0;
      }
      if (a === 0xc030) {
        this.speaker.push(this.cpu.cycles);
        return 0;
      }
      if (a === 0xc061 || a === 0xc062) {
        this.poll();
        const i = this.script?.inputs;
        return (a === 0xc061 ? i?.btn0 : i?.btn1) ?? 0;
      }
      return 0;
    }
    return this.ram[a];
  }

  write(a: number, v: number): void {
    if (a >= 0xc000 && a < 0xc100) {
      if (a === 0xc010) this.key &= 0x7f;
      if (a === 0xc030) this.speaker.push(this.cpu.cycles);
      return;
    }
    this.ram[a] = v;
  }

  /** the monitor routines, done when the PC reaches them (from a JSR) */
  private rom(): boolean {
    const c = this.cpu;
    if (c.pc === 0xfca8) {
      // WAIT: SEC; PHA; SBC #1 ... ; returns A=0, C=1, Z=1, N=0
      c.cycles += waitCycles(c.a) - 6; // the JSR's 6 cycles are counted already
      this.waits++;
      this.script?.wait(this.waits);
      c.a = 0;
      c.p = (c.p & ~(FLAGS.N | FLAGS.Z | FLAGS.C)) | FLAGS.Z | FLAGS.C;
      this.rts();
      return true;
    }
    if (c.pc === 0xfb1e) {
      // PREAD: Y = the paddle's count (0..255), A = its last reading (bit 7 clear but at 255)
      this.poll();
      const i = this.script?.inputs;
      const v = (c.x & 1 ? i?.pdl1 : i?.pdl0) ?? 0;
      c.cycles += 13 + 11 * v;
      c.y = v;
      c.a = v === 255 ? 0x80 : 0;
      c.p = (c.p & ~(FLAGS.N | FLAGS.Z)) | (c.y & 0x80) | (c.y === 0 ? FLAGS.Z : 0);
      this.rts();
      return true;
    }
    return false;
  }

  rts(): void {
    const c = this.cpu;
    const lo = c.pull();
    const hi = c.pull();
    c.pc = (((hi << 8) | lo) + 1) & 0xffff;
    c.cycles += 6;
  }

  /** runs until the PC is `stop` (or a step limit is hit) */
  run(stop: number, limit = 50_000_000): void {
    const c = this.cpu;
    for (let i = 0; i < limit; i++) {
      if (c.pc === stop) return;
      if (c.pc >= 0xf800 && this.rom()) continue;
      if (this.trap?.(c.pc)) continue;
      if (c.pc >= 0xc000) throw new Error(`PC in ROM/IO at $${c.pc.toString(16)}`);
      this.onStep?.(c.pc);
      c.step();
    }
    throw new Error(`no stop at $${stop.toString(16)} after ${limit} steps (PC $${c.pc.toString(16)})`);
  }

  /** JSR to `addr` with registers set, run until it returns */
  call(addr: number, regs: { a?: number; x?: number; y?: number; c?: number } = {}, limit?: number): void {
    const c = this.cpu;
    const ret = 0x02fe; // a return address in the input buffer page, never executed
    c.s = 0xff;
    const r = ret - 1;
    c.push(r >> 8);
    c.push(r & 0xff);
    c.a = regs.a ?? 0;
    c.x = regs.x ?? 0;
    c.y = regs.y ?? 0;
    c.p = (c.p & ~FLAGS.C) | (regs.c ? FLAGS.C : 0);
    c.pc = addr;
    this.run(ret, limit);
  }
}
