// The SID's three voices, rendered from the register writes the program makes (Worms? plays notes with
// C64SOUND: frequency, attack/decay, sustain/release, then the waveform with the gate; the master
// volume in $D418). This renders the sound hardware, the way the VIC renderer draws the screen; it runs
// none of the program. What is modelled: the 24-bit phase accumulators and the four waveforms (triangle,
// sawtooth, pulse, noise; combined ones as AND), ring modulation and sync, the envelope generator with
// the chip's rate periods and its exponential decay, the master volume. Not modelled: the filter (the
// game never routes a voice through it) and the analogue output stage.
// DOM-free: the audio worklet (sid.worklet.ts) runs it, and tests can.

export const SID_CLOCK = 1022727; // NTSC

/** cycles per envelope step for the 16 attack (and decay/release) settings */
const RATE = [9, 32, 63, 95, 149, 220, 267, 313, 392, 977, 1954, 3126, 3907, 11720, 19532, 31251];

/** a register write at a point of 6502 time */
export interface SidWrite {
  cycles: number;
  reg: number;
  value: number;
}

class Voice {
  freq = 0;
  pw = 0;
  control = 0;
  ad = 0;
  sr = 0;
  acc = 0;
  noise = 0x7ffff8;
  env = 0;
  state: 'attack' | 'decay' | 'release' = 'release';
  rateCount = 0;
  expCount = 0;
  prevMsb = 0;

  gate(on: boolean): void {
    if (on) {
      this.state = 'attack';
      this.expCount = 0;
    } else this.state = 'release';
  }

  /** advances the envelope by `cycles` */
  envelope(cycles: number): void {
    let left = cycles;
    while (left > 0) {
      const period = this.state === 'attack' ? RATE[this.ad >> 4] : this.state === 'decay' ? RATE[this.ad & 15] : RATE[this.sr & 15];
      const need = period - this.rateCount;
      if (need > left) {
        this.rateCount += left;
        return;
      }
      left -= need;
      this.rateCount = 0;
      if (this.state === 'attack') {
        this.env++;
        if (this.env >= 0xff) {
          this.env = 0xff;
          this.state = 'decay';
        }
        continue;
      }
      // decay and release: slower as the level falls (the exponential counter)
      const exp = this.env >= 0x5d ? 1 : this.env >= 0x36 ? 2 : this.env >= 0x1a ? 4 : this.env >= 0x0e ? 8 : this.env >= 0x06 ? 16 : 30;
      if (++this.expCount < exp) continue;
      this.expCount = 0;
      if (this.state === 'decay') {
        const sustain = (this.sr >> 4) * 0x11;
        if (this.env > sustain) this.env--;
      } else if (this.env > 0) this.env--;
    }
  }

  /** the 12-bit waveform output */
  wave(ringMsb: number): number {
    const c = this.control;
    if ((c & 0xf0) === 0) return 0;
    let out = 0xfff;
    if (c & 0x10) {
      let msb = this.acc & 0x800000;
      if (c & 0x04) msb ^= ringMsb;
      out &= ((msb ? ~this.acc : this.acc) >> 11) & 0xfff;
    }
    if (c & 0x20) out &= this.acc >> 12;
    if (c & 0x40) out &= (this.acc >> 12) >= this.pw ? 0xfff : 0;
    if (c & 0x80) {
      const n = this.noise;
      out &= (((n >> 20) & 1) << 11) | (((n >> 18) & 1) << 10) | (((n >> 14) & 1) << 9) | (((n >> 11) & 1) << 8)
        | (((n >> 9) & 1) << 7) | (((n >> 5) & 1) << 6) | (((n >> 2) & 1) << 5) | ((n & 1) << 4);
    }
    return out;
  }
}

export class Sid {
  readonly regs = new Uint8Array(0x20);
  private readonly v = [new Voice(), new Voice(), new Voice()];
  private readonly cyclesPerSample: number;
  private frac = 0;

  constructor(sampleRate: number) {
    this.cyclesPerSample = SID_CLOCK / sampleRate;
  }

  write(reg: number, value: number): void {
    reg &= 0x1f;
    value &= 0xff;
    this.regs[reg] = value;
    if (reg >= 0x15) return;
    const v = this.v[Math.floor(reg / 7)];
    switch (reg % 7) {
      case 0: v.freq = (v.freq & 0xff00) | value; break;
      case 1: v.freq = (v.freq & 0x00ff) | (value << 8); break;
      case 2: v.pw = (v.pw & 0xf00) | value; break;
      case 3: v.pw = (v.pw & 0x0ff) | ((value & 0x0f) << 8); break;
      case 4: {
        const was = v.control & 1;
        v.control = value;
        if ((value & 1) !== was) v.gate((value & 1) === 1);
        if (value & 0x08) v.acc = 0; // test bit
        break;
      }
      case 5: v.ad = value; break;
      case 6: v.sr = value; break;
    }
  }

  /** renders samples into out[from..to), adding nothing else */
  render(out: Float32Array, from = 0, to = out.length): void {
    const vol = (this.regs[0x18] & 15) / 15;
    for (let i = from; i < to; i++) {
      this.frac += this.cyclesPerSample;
      const n = Math.floor(this.frac);
      this.frac -= n;
      let mix = 0;
      for (let k = 0; k < 3; k++) {
        const v = this.v[k];
        const src = this.v[(k + 2) % 3];
        if (!(v.control & 0x08)) {
          const before = v.acc;
          const total = before + v.freq * n;
          v.acc = total % 0x1000000;
          // noise: the shift register steps whenever bit 19 rises
          const steps = Math.floor(total / 0x100000) - Math.floor(before / 0x100000);
          for (let s = 0; s < Math.min(steps, 8); s++) {
            const bit = ((v.noise >> 22) ^ (v.noise >> 17)) & 1;
            v.noise = ((v.noise << 1) | bit) & 0x7fffff;
          }
          // hard sync: reset when the source's bit 23 rises
          if (v.control & 0x02 && !(src.prevMsb) && src.acc & 0x800000) v.acc = 0;
        }
        v.envelope(n);
        mix += ((v.wave(src.acc & 0x800000) - 0x800) * v.env) / (0x800 * 255);
      }
      for (const v of this.v) v.prevMsb = v.acc & 0x800000;
      out[i] = (mix / 3) * vol;
    }
  }
}

/**
 * The SID in time: writes are queued with their 6502 time and applied at the sample they fall on.
 * 6502 time is tied to the output once (at the first write, plus a latency) and again whenever the
 * program falls behind or runs ahead of the audio by more than a quarter second.
 */
export class SidPlayer {
  readonly sid: Sid;
  private readonly rate: number;
  private queue: SidWrite[] = [];
  /** samples rendered so far */
  private t = 0;
  /** sample = cycles * rate / SID_CLOCK + offset */
  private offset: number | null = null;
  private readonly latency: number;

  constructor(sampleRate: number, latencySeconds = 0.06) {
    this.sid = new Sid(sampleRate);
    this.rate = sampleRate;
    this.latency = latencySeconds * sampleRate;
  }

  push(writes: SidWrite[]): void {
    for (const w of writes) {
      const at = (w.cycles * this.rate) / SID_CLOCK;
      if (this.offset === null || Math.abs(at + this.offset - (this.t + this.latency)) > this.rate / 4) {
        this.offset = this.t + this.latency - at;
      }
      this.queue.push(w);
    }
  }

  private sampleOf(w: SidWrite): number {
    return Math.round((w.cycles * this.rate) / SID_CLOCK + (this.offset ?? 0));
  }

  render(out: Float32Array): void {
    let i = 0;
    while (i < out.length) {
      while (this.queue.length && this.sampleOf(this.queue[0]) <= this.t + i) {
        const w = this.queue.shift()!;
        this.sid.write(w.reg, w.value);
      }
      const next = this.queue.length ? Math.min(out.length, Math.max(i + 1, this.sampleOf(this.queue[0]) - this.t)) : out.length;
      this.sid.render(out, i, next);
      i = next;
    }
    this.t += out.length;
  }
}
