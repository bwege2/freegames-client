// The Apple II speaker: every access to $C030 flips the cone. The sound routines (RUN.S SND, RUN2.S
// SOUND, WIRE.S SOUND) time their clicks by their loops' cycles; machine.ts keeps each click's cycle
// (io.clicks). This turns them into a square wave at the original's 1.023 MHz clock, a block of
// samples for each slice of time the program ran, played back to back.
import { io } from './machine.ts';

const CLOCK = 1_023_000;

export class Speaker {
  private readonly ctx: AudioContext;
  private readonly out: AudioNode;
  private level = 0.12;
  private cycles0 = -1;
  private time0 = 0;
  private sample = 0;
  private quietSince = 0;

  constructor(ctx: AudioContext) {
    this.ctx = ctx;
    // the cone's level has no meaning by itself: only its flips are heard
    const hp = ctx.createBiquadFilter();
    hp.type = 'highpass';
    hp.frequency.value = 30;
    const gain = ctx.createGain();
    gain.gain.value = 0.6;
    hp.connect(gain).connect(ctx.destination);
    this.out = hp;
  }

  /** starts over at the next flush (the clock was set back, or jumped) */
  reset(): void {
    this.cycles0 = -1;
  }

  /** the clicks up to `cycles` into samples, scheduled after the ones before */
  flush(cycles: number): void {
    const sr = this.ctx.sampleRate;
    const now = this.ctx.currentTime;
    if (this.cycles0 < 0 || this.time0 + this.sample / sr < now) {
      // (re)start a little ahead of the audio clock
      this.cycles0 = cycles;
      this.time0 = now + 0.06;
      this.sample = 0;
      io.clicks.length = 0;
      return;
    }
    const end = Math.floor(((cycles - this.cycles0) * sr) / CLOCK);
    const n = end - this.sample;
    if (n <= 0) return;
    const clicks = io.clicks;
    if (clicks.length === 0) {
      this.quietSince += n;
      this.sample = end;
      return;
    }
    const buf = this.ctx.createBuffer(1, n, sr);
    const d = buf.getChannelData(0);
    let i = 0;
    let level = this.quietSince > sr / 10 ? 0 : this.level;
    for (const c of clicks) {
      const at = Math.min(n, Math.max(0, Math.floor(((c - this.cycles0) * sr) / CLOCK) - this.sample));
      while (i < at) d[i++] = level;
      this.level = level === 0 ? 0.12 : -level;
      level = this.level;
    }
    while (i < n) d[i++] = level;
    clicks.length = 0;
    this.quietSince = 0;
    const src = this.ctx.createBufferSource();
    src.buffer = buf;
    src.connect(this.out);
    src.start(this.time0 + this.sample / sr);
    this.sample = end;
  }
}
