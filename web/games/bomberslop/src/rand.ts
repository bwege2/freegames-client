// Bomberslop: GPL-3.0-or-later (web/games/bomberslop/LICENSE.md).
// The C library's rand() as ClanBomber 2.2.0 gets it on Linux: glibc's random_r (stdlib/random_r.c), the default
// TYPE_3 additive feedback generator of 31 words, seeded by srand() through the 16807 linear congruential steps and
// 310 discarded results. The original calls rand() for random boxes, start positions, extras, where things fly and
// the slop puddles' wobble; the port calls this one in the same places, so the same seed gives the same game
// (test/oracle.test.ts compares it with the original built against glibc).

export class CRand {
  private readonly state = new Int32Array(31);
  private f = 3;
  private r = 0;
  /** how many numbers were drawn (the oracle counts the original's calls the same way) */
  calls = 0;

  constructor(seed = 1) {
    this.srand(seed);
  }

  srand(seed: number): void {
    let s = seed >>> 0;
    if (s === 0) s = 1;
    let word = s | 0;
    this.state[0] = word;
    for (let i = 1; i < 31; i++) {
      // state[i] = (16807 * state[i - 1]) % 2147483647, by Schrage's method as glibc writes it
      const hi = Math.trunc(word / 127773);
      const lo = word % 127773;
      word = 16807 * lo - 2836 * hi;
      if (word < 0) word += 2147483647;
      this.state[i] = word;
    }
    this.f = 3;
    this.r = 0;
    for (let i = 0; i < 310; i++) this.next();
    this.calls = 0;
  }

  private next(): number {
    const val = (this.state[this.f] + this.state[this.r]) | 0;
    this.state[this.f] = val;
    const out = val >>> 1;
    this.f++;
    if (this.f >= 31) {
      this.f = 0;
      this.r++;
    } else {
      this.r++;
      if (this.r >= 31) this.r = 0;
    }
    return out;
  }

  /** rand(): 0 .. 2^31-1 */
  rand(): number {
    this.calls++;
    return this.next();
  }

  /** the generator's whole state, for a desync check */
  hash(h: number): number {
    for (let i = 0; i < 31; i++) h = Math.imul(h ^ this.state[i], 16777619) >>> 0;
    return Math.imul(h ^ (this.f * 32 + this.r), 16777619) >>> 0;
  }
}
