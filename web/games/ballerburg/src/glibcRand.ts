// glibc's rand() (random_r's TYPE_3 additive feedback generator), as srand(seed) leaves it; never seeded
// it is seed 1. (From the Passage port.)
export const RAND_MAX = 2147483647;

export class GlibcRand {
  /** the 31-word state; fptr = rptr + 3 (mod 31) */
  private readonly state: Int32Array = new Int32Array(31);
  private rptr = 0;

  constructor(seed = 1) {
    const s = this.state;
    s[0] = seed === 0 ? 1 : seed;
    for (let i = 1; i < 31; i++) {
      // 16807 * s[i-1] % 2147483647 by Schrage's method, as srandom_r
      const hi = Math.trunc(s[i - 1] / 127773), lo = s[i - 1] % 127773;
      let word = 16807 * lo - 2836 * hi;
      if (word < 0) word += 2147483647;
      s[i] = word;
    }
    for (let n = 0; n < 310; n++) this.next(); // srandom_r discards 10 * 31 results
  }

  next(): number {
    const f = (this.rptr + 3) % 31;
    const val = (this.state[f] + this.state[this.rptr]) | 0; // *fptr += *rptr (uint32 wrap)
    this.state[f] = val;
    this.rptr = (this.rptr + 1) % 31;
    return val >>> 1; // (uint32) val >> 1
  }
}
