// psg.c: libpsg, a YM-2149 sound chip emulation (Stefan Berndtsson, NoCrew; Thomas Huth): square waves,
// noise and the envelope, mixed into 16-bit samples at 44100 Hz, the way SDL's audio callback asked for
// them; and Giaccess/Dosound, the Atari ST's XBIOS calls the game uses to set the chip's registers.
// The chip runs in an audio worklet (psg.worklet.ts); the game's register writes go there (setPsgSink),
// and a copy of the registers stays here for Giaccess's reads. Nothing here touches the DOM.
import { GlibcRand } from './glibcRand.ts';
import { rec } from './sdl.ts';

const PSG_FREQUENCY = 2000000;
const QUALITY = 1 << 14;
const SAMPLE_MAX = 0x7fff;
const SAMPLE_MIN = -0x8000; /* 0x8000 as int16_t */
const NOISE_MAX = 0xffff;
export const SAMPLE_FREQ = 44100;

const ONE = 1, PI = Math.PI;

function fmod(a: number, b: number): number {
  return a % b;
}

function env_wave(input: number, mode: number): number {
  switch (mode) {
    case 0: case 1: case 2: case 3:
    case 9:
      return input < PI ? ONE - input / PI : 0;
    case 4: case 5: case 6: case 7:
      return input < PI ? input / PI : 0;
    case 8:
      return ONE - fmod(input, PI) / PI;
    case 10: {
      const tmp = fmod(input, PI * 2);
      return tmp < PI ? ONE - tmp / PI : (tmp - PI) / PI;
    }
    case 11:
      return input < PI ? ONE - input / PI : ONE;
    case 12:
      return fmod(input, PI) / PI;
    case 13:
      return input < PI ? input / PI : ONE;
    case 14: {
      const tmp = fmod(input, PI * 2);
      return tmp < PI ? tmp / PI : ONE - (tmp - PI) / PI;
    }
    case 15:
      return input < PI ? input / PI : ONE;
  }
  return 0;
}

/* Values stolen from STonX */
const amps = [0, 1, 1, 2, 3, 4, 5, 7, 12, 20, 28, 44, 70, 110, 165, 255];

/** int16_t _clip(int) */
function clip(input: number): number {
  if (input < -32768) return -32768;
  if (input > 32767) return 32767;
  return input;
}

/** (int16_t) of an int */
const i16 = (v: number) => (v << 16) >> 16;

function get_real_freq(psgfreq: number, sample_freq: number): number {
  if (psgfreq) {
    const denominator = sample_freq * psgfreq;
    return Math.trunc((QUALITY * (PSG_FREQUENCY / 16.0) + (denominator >> 1)) / denominator);
  }
  return 0;
}

/** psg_struct and tdata: the registers and the state of the three channels */
export class PsgChip {
  /** int regs[15], and env_kept after it (regs[15]) */
  readonly regs = new Int32Array(16);
  private readonly wave_period = [0, 0, 0];
  private readonly rfreq = [0, 0, 0];
  private readonly rvol = [0, 0, 0];
  private readonly tone = [0, 0, 0];
  private readonly noise = [0, 0, 0];
  private readonly env = [0, 0, 0];
  private env_mode = 0;
  private env_period = 0;
  private env_freq = 0;
  private readonly sample_freq = SAMPLE_FREQ;
  /** the noise's rand(): in the original the game's own, called from the audio thread */
  private readonly random: GlibcRand;

  constructor(random = new GlibcRand(1)) {
    this.random = random;
  }

  private update(): void {
    const r = this.regs;
    for (let i = 0; i < 3; i++) {
      if (r[8 + i] === 16) {
        this.rvol[i] = 0;
        this.env[i] = 1;
        if (r[13] !== 0xff) this.env_mode = r[13];
      } else {
        this.rvol[i] = r[8 + i];
        this.env[i] = 0;
      }
      const tmp = r[11] + (r[12] << 8);
      this.env_freq = tmp ? PSG_FREQUENCY / (256.0 * tmp) : 0;
      this.rfreq[i] = get_real_freq((r[1 + i * 2] << 8) + r[0 + i * 2], this.sample_freq);
      this.tone[i] = r[7] & (1 << i) ? 0 : 1;
      this.noise[i] = r[7] & (8 << i) ? 0 : 1;
    }
  }

  giaccess(data: number, reg: number): number {
    if (reg & 0x80) {
      this.regs[reg & 0x0f] = data;
      this.update();
      if ((reg & 0x0f) === 13) this.env_period = 0;
      return 0;
    }
    return this.regs[reg & 0x0f];
  }

  dosound(buf: ArrayLike<number>): void {
    for (let i = 0; buf[i] !== 0xff; i += 2) {
      if (buf[i] < 16) {
        this.regs[buf[i]] = buf[i + 1];
        if (buf[i] === 13) this.env_period = 0;
      }
    }
    this.update();
  }

  private tonesample(offset: number): number {
    return (offset & (QUALITY - 1)) < QUALITY / 2 ? SAMPLE_MAX : SAMPLE_MIN;
  }

  private noisesample(): number {
    return i16((NOISE_MAX & this.random.next()) - SAMPLE_MAX);
  }

  private volume(i: number): number {
    return this.env[i] ? amps[Math.trunc(15 * env_wave(this.env_period * Math.PI * 2 / QUALITY, this.env_mode))] : amps[this.rvol[i]];
  }

  private sample(): number {
    let tmp = 0;
    for (let i = 0; i < 3; i++) {
      if (this.tone[i] && !this.noise[i]) {
        tmp = clip(tmp + ((this.tonesample(this.wave_period[i]) * this.volume(i)) >> 8));
        this.wave_period[i] = (this.wave_period[i] + this.rfreq[i]) | 0;
      }
      if (this.noise[i] && !this.tone[i]) {
        tmp = clip(tmp + ((this.noisesample() * this.volume(i)) >> 8));
      }
      if (this.noise[i] && this.tone[i]) {
        // _clip(tone + noise) * amps >> 8 (the tone first: the order of C's operands as gcc evaluates them)
        const t = this.tonesample(this.wave_period[i]);
        const s = clip(t + this.noisesample());
        tmp = clip(tmp + ((s * this.volume(i)) >> 8));
        this.wave_period[i] = (this.wave_period[i] + this.rfreq[i]) | 0;
      }
    }
    if (this.env_freq) this.env_period = Math.trunc(this.env_period + 2 * (QUALITY / (this.sample_freq * this.env_freq)));
    return tmp;
  }

  /** psg_create_samples in stereo: the same sample on both channels */
  createSamples(out: Int16Array, samples: number): void {
    for (let i = 0; i < samples; i++) out[i] = this.sample();
  }
}

// ---------------------------------------------------------------- the game's side
export type PsgWrite = ['g', number, number] | ['d', number[]];

let chip = new PsgChip();
let sink: ((w: PsgWrite) => void) | null = null;

/** a new program: the registers as at power-on (the sink stays: it is the platform's) */
export function psgReset(): void {
  chip = new PsgChip();
}

/** where the register writes go (the audio worklet) */
export function setPsgSink(s: ((w: PsgWrite) => void) | null): void {
  sink = s;
}

/** the original opens SDL's audio device here; the browser's audio is set up by index.ts */
export function psg_audio_init(): void {
  // nothing to do
}

export function Giaccess(data: number, reg: number): number {
  if (reg & 0x80) {
    rec?.(`G ${data >>> 0} ${reg >>> 0}`);
    sink?.(['g', data >>> 0, reg >>> 0]);
  }
  return chip.giaccess(data >>> 0, reg >>> 0);
}

export function Dosound(buf: ArrayLike<number>): void {
  const bytes: number[] = [];
  for (let i = 0; buf[i] !== 0xff; i += 2) bytes.push(buf[i], buf[i + 1]);
  bytes.push(0xff);
  rec?.(`S ${bytes.join(' ')}`);
  sink?.(['d', bytes]);
  chip.dosound(bytes);
}

// ---------------------------------------------------------------- the audio thread's side
/** the chip played at the output's sample rate: SDL's audio callback, resampled (linearly) from 44100 Hz */
export class PsgPlayer {
  readonly chip = new PsgChip();
  private readonly ratio: number;
  private pos = 0;
  private prev = 0;
  private cur = 0;
  private readonly one = new Int16Array(1);

  constructor(outputRate: number) {
    this.ratio = SAMPLE_FREQ / outputRate;
  }

  apply(w: PsgWrite): void {
    if (w[0] === 'g') this.chip.giaccess(w[1], w[2]);
    else this.chip.dosound(w[1]);
  }

  render(out: Float32Array): void {
    for (let k = 0; k < out.length; k++) {
      out[k] = (this.prev + (this.cur - this.prev) * this.pos) / 32768;
      this.pos += this.ratio;
      while (this.pos >= 1) {
        this.pos -= 1;
        this.prev = this.cur;
        this.chip.createSamples(this.one, 1);
        this.cur = this.one[0];
      }
    }
  }
}
