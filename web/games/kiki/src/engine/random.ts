// glibc's random() (TYPE_3: x[i] = x[i-3] + x[i-31], the additive feedback generator) with
// srandom(seed). The original seeds it with srandom(1) at start-up (KikiController::init, "repeatable
// random sequence") and draws from it only in KikiMutant::moveBot, as RANDOM = (float)random()/RAND_MAX.

export class GlibcRandom {
  private ring: number[] = [];

  constructor(seed = 1) { this.srandom(seed); }

  srandom(seed: number): void {
    const r: number[] = [];
    r[0] = seed === 0 ? 1 : seed | 0;
    for (let i = 1; i < 31; i++) {
      // 16807 * r[i-1] % 2147483647 without overflow (glibc's Schrage form)
      const hi = Math.trunc(r[i - 1] / 127773);
      const lo = r[i - 1] % 127773;
      let word = 16807 * lo - 2836 * hi;
      if (word < 0) word += 2147483647;
      r[i] = word;
    }
    for (let i = 31; i < 34; i++) r[i] = r[i - 31];
    this.ring = r.slice();
    // glibc discards the first 310 outputs
    for (let k = 0; k < 310; k++) this.next();
  }

  private next(): number {
    const n = this.ring.length;
    const v = (this.ring[n - 31] + this.ring[n - 3]) | 0;
    this.ring.push(v);
    if (this.ring.length > 64) this.ring.splice(0, this.ring.length - 34);
    return v;
  }

  /** random(): 0 .. 2^31-1 */
  random(): number { return this.next() >>> 1; }

  /** RANDOM: ((float)random()/RAND_MAX), in float precision as the original computes it */
  RANDOM(): number { return Math.fround(Math.fround(this.random()) / Math.fround(2147483647)); }
}
