// glibc's rand(), the generator the original server uses for country assignment, turn order,
// missions, dice and card draws (common/common.h random_between(), server/*.cpp). It is the
// TYPE_3 additive feedback generator of random_r(): a 31-word state, fptr = rptr + 3, and
// srandom_r() discards 310 results. Written from the C library's algorithm, not copied from
// another port. The original calls srand(seed) in main() and never reseeds during a game.
export const RAND_MAX = 2147483647;

export class GlibcRand {
  private readonly state = new Int32Array(31);
  private rptr = 0;

  constructor(seed = 1) {
    const s = this.state;
    s[0] = seed === 0 ? 1 : seed | 0;
    for (let i = 1; i < 31; i++) {
      // 16807 * s[i-1] mod 2147483647, by Schrage's method as srandom_r() does it
      const hi = Math.trunc(s[i - 1] / 127773);
      const lo = s[i - 1] % 127773;
      let word = 16807 * lo - 2836 * hi;
      if (word < 0) word += 2147483647;
      s[i] = word;
    }
    for (let n = 0; n < 310; n++) this.next();
  }

  /** the next rand(): 0..RAND_MAX */
  next(): number {
    const f = (this.rptr + 3) % 31;
    const val = (this.state[f] + this.state[this.rptr]) | 0; // uint32 wraparound
    this.state[f] = val;
    this.rptr = (this.rptr + 1) % 31;
    return val >>> 1;
  }

  /** random_between(min, max), both ends included, as common/common.h has it */
  between(min: number, max: number): number {
    const f = this.next() / (RAND_MAX + 1.0);
    return Math.floor(min + (1 + max - min) * f);
  }

  /** a copy, for a snapshot that does not advance this generator */
  clone(): GlibcRand {
    const c = new GlibcRand(1);
    c.state.set(this.state);
    c.rptr = this.rptr;
    return c;
  }

  save(): { state: number[]; rptr: number } {
    return { state: Array.from(this.state), rptr: this.rptr };
  }

  load(v: { state: number[]; rptr: number }): void {
    this.state.set(v.state);
    this.rptr = v.rptr;
  }
}
