// OpenCity calls the C library's srand()/rand(); on Linux that is glibc's random() (TYPE_3: an additive
// feedback generator over 31 words, glibc stdlib/random_r.c). This is that generator, so the same seed
// gives the same map, the same trees and the same simulation as the original on Linux.
export const RAND_MAX = 2147483647;

export class GlibcRandom {
  private readonly r = new Int32Array(31);
  private f = 3;
  private b = 0;

  constructor(seed = 1) { this.srand(seed); }

  /** srandom_r: the seed is an unsigned int; 0 becomes 1 */
  srand(seed: number): void {
    let word = seed | 0;
    if (word === 0) word = 1;
    this.r[0] = word;
    for (let i = 1; i < 31; i++) {
      const hi = Math.trunc(word / 127773);
      const lo = word % 127773;
      word = 16807 * lo - 2836 * hi;
      if (word < 0) word += 2147483647;
      this.r[i] = word;
    }
    this.f = 3;
    this.b = 0;
    for (let i = 0; i < 310; i++) this.rand();
  }

  /** random_r: 0 .. RAND_MAX */
  rand(): number {
    const r = this.r;
    r[this.f] = (r[this.f] + r[this.b]) | 0;
    const result = (r[this.f] >>> 1) & 0x7fffffff;
    if (++this.f >= 31) { this.f = 0; ++this.b; } else if (++this.b >= 31) this.b = 0;
    return result;
  }
}
