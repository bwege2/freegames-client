// A Commodore 64 for the tests: the memory map, the VIC's raster interrupt, CIA 1's 60 Hz timer
// interrupt, the SID's registers (logged) and the few KERNAL routines Worms? calls (CHROUT, GETIN, the
// IRQ handler's jiffy clock and keyboard scan, SETNAM/SETLFS/LOAD/SAVE/CLOSE on a disk kept in memory).
// The KERNAL routines run as TypeScript traps (src/kernal.ts, the same the port uses); everything
// else is the 6502 core running the program. Test-only: the shipped game has no CPU.
import { Cpu, FLAGS } from './cpu6502.ts';
import * as K from '../src/kernal.ts';
import { Raster } from '../src/raster.ts';

/** cycles of an NTSC frame (263 lines of 65 cycles) and of CIA 1 timer A as the KERNAL sets it */
export const FRAME_CYCLES = 17095;
export const CIA_CYCLES = 17045;

export const KERNAL = {
  CHROUT: 0xffd2, GETIN: 0xffe4, SETNAM: 0xffbd, SETLFS: 0xffba, LOAD: 0xffd5, SAVE: 0xffd8, CLOSE: 0xffc3,
  IRQ: 0xea31, IRQ_EXIT: 0xea81, IRQ_ENTRY: 0xff48,
} as const;

export interface SidWrite {
  cycle: number;
  reg: number;
  value: number;
}

export class C64 implements K.Bus {
  readonly ram = new Uint8Array(0x10000);
  private readonly rom = new Uint8Array(0x2000);
  readonly chargen = new Uint8Array(0x1000);
  readonly color = new Uint8Array(0x400);
  readonly vic = new Uint8Array(0x40);
  readonly sid = new Uint8Array(0x20);
  sidLog: SidWrite[] = [];
  readonly cpu: Cpu;
  raster: Raster;
  /** the program's files, by name ("NAME.WRM"): what it saved, as a 1541 would keep them (load address first) */
  readonly disk = new Map<string, Uint8Array>();
  private readonly traps = new Map<number, () => void>();
  private readonly trapAt = new Uint8Array(0x10000);
  private d019 = 0;
  private d01a = 0;
  private cia = { icr: 0, mask: 0x01, cra: 0x11, ddra: 0xff };
  private nextRaster = FRAME_CYCLES;
  private nextCia = CIA_CYCLES;
  private irqLine = false;
  frames = 0;
  /** called by the KERNAL's keyboard scan (every CIA interrupt): the test puts its keys in here */
  onKeyScan: (() => void) | null = null;
  /** watch: called before an instruction at this address */
  readonly watch = new Map<number, () => void>();
  private watchAt = new Uint8Array(0x10000);
  private fileName = '';
  private lfs = { lfn: 0, dev: 0, sa: 0 };

  constructor(chargen: Uint8Array, seed: number) {
    this.chargen.set(chargen.subarray(0, 0x1000));
    if (chargen.length < 0x1000) this.chargen.set(chargen.subarray(0, 0x800), 0x800);
    this.raster = new Raster(seed);
    this.cpu = new Cpu({ read: (a) => this.read(a), write: (a, v) => this.write(a, v) });
    // the KERNAL's IRQ entry, its IRQ exit and the hardware vectors
    this.rom.set([0x48, 0x8a, 0x48, 0x98, 0x48, 0xba, 0xbd, 0x04, 0x01, 0x29, 0x10, 0xf0, 0x03, 0x6c, 0x16, 0x03, 0x6c, 0x14, 0x03], KERNAL.IRQ_ENTRY - 0xe000);
    this.rom.set([0x68, 0xa8, 0x68, 0xaa, 0x68, 0x40], KERNAL.IRQ_EXIT - 0xe000);
    this.rom.set([0x78, 0x6c, 0x18, 0x03], 0xfe43 - 0xe000);
    this.rom.set([0x43, 0xfe, 0x00, 0x00, 0x48, 0xff], 0xfffa - 0xe000);
    // RAM as the KERNAL leaves it
    this.ram[0] = 0x2f;
    this.ram[1] = 0x36; // BASIC ROM out, KERNAL and I/O in
    this.ram.set([0x31, 0xea, 0x66, 0xfe, 0x47, 0xfe], 0x314);
    this.ram[K.COLOR] = 1;
    this.ram[0x289] = 10;
    this.ram[0xcc] = 1; // no cursor blink
    K.setCursor(this, 0, 0);
    this.vic[0x18] = 0x15;
    this.trap(KERNAL.CHROUT, () => { K.chrout(this, this.cpu.a); this.rts(); });
    this.trap(KERNAL.GETIN, () => { this.cpu.a = this.cpu.nz(K.getin(this)); this.cpu.p &= ~FLAGS.C; this.rts(); });
    this.trap(KERNAL.SETNAM, () => {
      const a = this.cpu.x | (this.cpu.y << 8);
      let s = '';
      for (let i = 0; i < this.cpu.a; i++) s += String.fromCharCode(this.ram[(a + i) & 0xffff]);
      this.fileName = s;
      this.rts();
    });
    this.trap(KERNAL.SETLFS, () => { this.lfs = { lfn: this.cpu.a, dev: this.cpu.x, sa: this.cpu.y }; this.rts(); });
    this.trap(KERNAL.SAVE, () => this.save());
    this.trap(KERNAL.LOAD, () => this.load());
    this.trap(KERNAL.CLOSE, () => { this.cpu.p &= ~FLAGS.C; this.rts(); });
    this.trap(KERNAL.IRQ, () => {
      K.jiffy(this);
      this.onKeyScan?.();
      this.cia.icr = 0; // LDA $DC0D
      this.updateIrq();
      this.cpu.pc = KERNAL.IRQ_EXIT;
    });
    this.trap(0xfe66, () => { throw new Error(`BRK at $${this.cpu.pc.toString(16)}`); });
  }

  trap(addr: number, fn: () => void): void {
    this.traps.set(addr, fn);
    this.trapAt[addr] = 1;
  }

  watchPc(addr: number, fn: () => void): void {
    this.watch.set(addr, fn);
    this.watchAt[addr] = 1;
  }

  /** returns from a JSR to a trap */
  rts(): void {
    const lo = this.cpu.pull();
    const hi = this.cpu.pull();
    this.cpu.pc = (((hi << 8) | lo) + 1) & 0xffff;
    this.cpu.cycles += 6;
  }

  peek(a: number): number {
    return this.read(a);
  }

  poke(a: number, v: number): void {
    this.write(a, v);
  }

  private io(): boolean {
    return (this.ram[1] & 3) !== 0 && (this.ram[1] & 4) !== 0;
  }

  read(a: number): number {
    if (a < 0xa000 || (a >= 0xc000 && a < 0xd000)) return this.ram[a];
    if (a < 0xc000) return this.ram[a]; // BASIC is banked out
    if (a >= 0xe000) return this.ram[1] & 2 ? this.rom[a - 0xe000] : this.ram[a];
    const p = this.ram[1];
    if ((p & 3) === 0) return this.ram[a];
    if ((p & 4) === 0) return this.chargen[a & 0xfff];
    if (a < 0xd400) {
      const r = a & 0x3f;
      if (r === 0x12) return this.raster.d012();
      if (r === 0x11) return this.vic[0x11] & 0x7f;
      if (r === 0x19) return this.d019 | 0x70 | (this.d019 & this.d01a & 0x0f ? 0x80 : 0);
      if (r === 0x1a) return this.d01a | 0xf0;
      return this.vic[r];
    }
    if (a < 0xd800) return 0;
    if (a < 0xdc00) return this.color[a & 0x3ff] | 0xf0;
    if (a < 0xdd00) {
      const r = a & 0x0f;
      if (r === 0x00 || r === 0x01) return 0xff; // no joystick, no key held
      if (r === 0x02) return this.cia.ddra;
      if (r === 0x0d) {
        const v = this.cia.icr ? 0x81 : 0;
        this.cia.icr = 0;
        this.updateIrq();
        return v;
      }
      if (r === 0x0e) return this.cia.cra;
      return 0;
    }
    if (a < 0xde00) return (a & 0x0f) === 0 ? 0x97 : 0xff;
    return 0;
  }

  write(a: number, v: number): void {
    if (a < 0xd000 || a >= 0xe000 || !this.io()) {
      this.ram[a] = v;
      return;
    }
    if (a < 0xd400) {
      const r = a & 0x3f;
      if (r === 0x19) this.d019 &= ~v & 0x0f;
      else if (r === 0x1a) this.d01a = v & 0x0f;
      else this.vic[r] = v;
      this.updateIrq();
      return;
    }
    if (a < 0xd800) {
      const r = a & 0x1f;
      this.sid[r] = v;
      this.sidLog.push({ cycle: this.cpu.cycles, reg: r, value: v });
      return;
    }
    if (a < 0xdc00) {
      this.color[a & 0x3ff] = v & 0x0f;
      return;
    }
    if (a < 0xdd00) {
      const r = a & 0x0f;
      if (r === 0x02) this.cia.ddra = v;
      else if (r === 0x0d) this.cia.mask = v & 0x80 ? this.cia.mask | (v & 0x1f) : this.cia.mask & ~v;
      else if (r === 0x0e) this.cia.cra = v;
      this.updateIrq();
    }
  }

  private updateIrq(): void {
    this.irqLine = (this.d019 & this.d01a & 0x0f) !== 0 || (this.cia.icr & this.cia.mask & 1) !== 0;
  }

  private events(): void {
    const c = this.cpu.cycles;
    while (c >= this.nextRaster) {
      this.nextRaster += FRAME_CYCLES;
      this.d019 |= 1;
      this.frames++;
    }
    while (c >= this.nextCia) {
      this.nextCia += CIA_CYCLES;
      if (this.cia.cra & 1) this.cia.icr = 1;
    }
    this.updateIrq();
  }

  /** Runs the 6502 until `done()` is true (checked before each instruction) or `limit` cycles pass. */
  run(done: () => boolean, limit = Infinity): void {
    const cpu = this.cpu;
    const end = cpu.cycles + limit;
    let next = Math.min(this.nextRaster, this.nextCia);
    while (!done()) {
      if (cpu.cycles >= next) {
        this.events();
        next = Math.min(this.nextRaster, this.nextCia);
        if (cpu.cycles >= end) throw new Error(`no end after ${limit} cycles (pc $${cpu.pc.toString(16)})`);
      }
      if (this.irqLine && (cpu.p & FLAGS.I) === 0) {
        const r = cpu.pc;
        cpu.push(r >> 8);
        cpu.push(r & 0xff);
        cpu.push((cpu.p & ~FLAGS.B) | FLAGS.U);
        cpu.p |= FLAGS.I;
        cpu.pc = cpu.rd16(0xfffe);
        cpu.cycles += 7;
      }
      const pc = cpu.pc;
      if (this.watchAt[pc]) this.watch.get(pc)!();
      if (this.trapAt[pc]) {
        this.traps.get(pc)!();
        continue;
      }
      cpu.step();
    }
  }

  private static fileKey(name: string): string {
    return name.replace(/^@/, '').replace(/^[0-9]?:/, '');
  }

  private save(): void {
    const cpu = this.cpu;
    const start = this.ram[cpu.a] | (this.ram[(cpu.a + 1) & 0xff] << 8);
    const end = cpu.x | (cpu.y << 8);
    const f = new Uint8Array(2 + Math.max(0, end - start));
    f[0] = start & 0xff;
    f[1] = start >> 8;
    for (let i = 0; i < end - start; i++) f[2 + i] = this.read(start + i);
    this.disk.set(C64.fileKey(this.fileName), f);
    cpu.a = 0;
    cpu.p &= ~FLAGS.C;
    this.rts();
  }

  private load(): void {
    const cpu = this.cpu;
    const f = this.disk.get(C64.fileKey(this.fileName));
    if (!f) {
      cpu.a = 4; // FILE NOT FOUND
      cpu.p |= FLAGS.C;
      this.rts();
      return;
    }
    let at = this.lfs.sa === 0 ? cpu.x | (cpu.y << 8) : f[0] | (f[1] << 8);
    for (let i = 2; i < f.length; i++) this.write(at++, f[i]);
    cpu.x = at & 0xff;
    cpu.y = at >> 8;
    cpu.a = 0;
    cpu.p &= ~FLAGS.C;
    this.rts();
  }

  /** the 1000 screen codes and their colours */
  screen(): { chars: Uint8Array; colors: Uint8Array } {
    return { chars: this.ram.slice(0x400, 0x400 + 1000), colors: this.color.slice(0, 1000) };
  }
}
