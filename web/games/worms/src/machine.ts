// The Commodore 64 around the port: the memory the program and the chips share (screen RAM at $0400,
// the character set it builds at $0800, sprite data, colour RAM, the VIC's and the SID's registers,
// the KERNAL's variables), the 60 Hz interrupt, and time. It runs no 6502 code: the program is the
// TypeScript translation in worms.ts, which reads and writes this memory where the original did.
//
// Time: the original's main loop waits for things its interrupt routine changes (count-down timers,
// the jiffy clock, the keyboard buffer). The translation is async and waits for frames there
// (`idle()`); its long computations spend 6502 time (`cpu(cycles)`, measured on the original in the
// tests), so a frame comes when the 6502 would have reached it. SID writes carry that time.
import * as K from './kernal.ts';
import { Raster } from './raster.ts';
import type { VicView } from './vic.ts';

/** 6502 cycles per NTSC frame (263 lines of 65 cycles), and the clock */
export const FRAME_CYCLES = 17095;
export const CPU_HZ = 1022727;

export class Stopped extends Error {
  constructor() {
    super('stopped');
  }
}

export class Machine implements K.Bus, VicView {
  readonly ram = new Uint8Array(0x10000);
  readonly chargen = new Uint8Array(0x1000);
  readonly color = new Uint8Array(0x400);
  readonly vic = new Uint8Array(0x40);
  readonly sid = new Uint8Array(0x20);
  raster: Raster;
  /** 6502 time spent so far (cycles) */
  cycles = 0;
  private frameEnd = FRAME_CYCLES;
  frames = 0;
  /** a SID register write, at `cycles` */
  onSid: ((reg: number, value: number, cycles: number) => void) | null = null;
  /** the program's interrupt routine (DOIRQ: BUMP and VBI), when installed */
  rasterIrq: (() => void) | null = null;
  /** keys waiting for the KERNAL's keyboard scan, which takes one per jiffy */
  private keys: number[] = [];
  /** a key held down that the KERNAL repeats (space, INST/DEL, cursor keys) */
  private held: { code: number; count: number } | null = null;
  /** called before every keyboard scan (the tests deliver their keys here) */
  onKeyScan: (() => void) | null = null;
  private wake: (() => void) | null = null;
  private blocked: (() => void) | null = null;
  private stopped = false;

  constructor(chargen: Uint8Array, seed: number) {
    this.chargen.set(chargen.subarray(0, Math.min(chargen.length, 0x1000)));
    if (chargen.length <= 0x800) this.chargen.set(chargen.subarray(0, 0x800), 0x800);
    this.raster = new Raster(seed);
    this.ram[K.COLOR] = 1;
    this.ram[0xcc] = 1;
    K.setCursor(this, 0, 0);
    this.vic[0x18] = 0x15;
    // EA FORTH's DISPLAY of the load screen: white text, black border and background
    this.vic[0x20] = 0;
    this.vic[0x21] = 0;
  }

  // ---- memory ----
  peek(a: number): number {
    if (a >= 0xd000 && a < 0xe000) {
      if (a < 0xd400) {
        const r = a & 0x3f;
        if (r === 0x12) return this.raster.d012();
        return this.vic[r];
      }
      if (a < 0xd800) return 0;
      if (a < 0xdc00) return this.color[a & 0x3ff] | 0xf0;
      return 0xff;
    }
    return this.ram[a & 0xffff];
  }

  poke(a: number, v: number): void {
    v &= 0xff;
    if (a >= 0xd000 && a < 0xe000) {
      if (a < 0xd400) this.vic[a & 0x3f] = v;
      else if (a < 0xd800) {
        const r = a & 0x1f;
        this.sid[r] = v;
        this.onSid?.(r, v, this.cycles);
      } else if (a < 0xdc00) this.color[a & 0x3ff] = v & 0x0f;
      return;
    }
    this.ram[a & 0xffff] = v;
  }

  peek16(a: number): number {
    return this.peek(a) | (this.peek(a + 1) << 8);
  }

  poke16(a: number, v: number): void {
    this.poke(a, v & 0xff);
    this.poke(a + 1, (v >> 8) & 0xff);
  }

  // ---- time ----
  /** The program spends `n` cycles of 6502 time; frames pass when it crosses them. */
  async cpu(n: number): Promise<void> {
    this.cycles += n;
    while (this.cycles >= this.frameEnd) await this.nextFrame();
  }

  /** The program waits (polls) until the next frame. */
  async idle(): Promise<void> {
    if (this.cycles < this.frameEnd) this.cycles = this.frameEnd;
    await this.nextFrame();
  }

  private nextFrame(): Promise<void> {
    if (this.stopped) return Promise.reject(new Stopped());
    return new Promise<void>((res) => {
      this.wake = res;
      const b = this.blocked;
      this.blocked = null;
      b?.();
    });
  }

  /** The program is done (or failed): the driver must not wait for it. */
  release(): void {
    const b = this.blocked;
    this.blocked = null;
    b?.();
  }

  /** Ends the program at its next wait. */
  stop(): void {
    this.stopped = true;
    this.release();
  }

  /**
   * One frame of the C64: the interrupts (the program's raster routine, then the KERNAL's: jiffy
   * clock and keyboard), then the program runs until it waits again.
   */
  async frame(): Promise<void> {
    if (this.stopped) return;
    this.frames++;
    this.rasterIrq?.();
    K.jiffy(this);
    this.keyScan();
    if (this.cycles < this.frameEnd) this.cycles = this.frameEnd;
    this.frameEnd += FRAME_CYCLES;
    const w = this.wake;
    this.wake = null;
    if (w) {
      const p = new Promise<void>((res) => { this.blocked = res; });
      w();
      await p;
    }
  }

  // ---- keyboard ----
  /** A key went down (PETSCII). Keys that repeat on the C64 repeat while held. */
  keyDown(code: number, repeats = false): void {
    if (this.keys.length < 16) this.keys.push(code);
    this.held = repeats ? { code, count: 0 } : null;
  }

  keyUp(code: number): void {
    if (this.held?.code === code) this.held = null;
  }

  /** the KERNAL's SCNKEY: one new key per jiffy into the buffer; held keys repeat after 16, then every 4 */
  private keyScan(): void {
    this.onKeyScan?.();
    const k = this.keys.shift();
    if (k !== undefined) {
      K.keyIn(this, k);
      return;
    }
    if (this.held) {
      this.held.count++;
      if (this.held.count >= 16 && (this.held.count - 16) % 4 === 0) K.keyIn(this, this.held.code);
    }
  }
}
