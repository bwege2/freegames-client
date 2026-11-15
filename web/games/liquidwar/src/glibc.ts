// glibc.ts: the C library's random()/srandom() (random_r.c, TYPE_3: the additive feedback generator
// with 31 words of state), as Liquid War calls them: srandom(time(NULL)) at start, then random() for
// the computer players, the cursors' colours, the custom textures, the water sounds and the music.

class GlibcRandom {
  private readonly state = new Int32Array(31);
  private f = 3;
  private r = 0;
  /** random() calls since start (the oracle's R lines) */
  calls = 0;

  srandom(seed: number): void {
    const s = this.state;
    seed = seed >>> 0;
    s[0] = seed === 0 ? 1 : seed | 0;
    for (let i = 1; i < 31; i++) {
      const prev = s[i - 1]!;
      const hi = Math.trunc(prev / 127773);
      const lo = prev % 127773;
      let word = 16807 * lo - 2836 * hi;
      if (word < 0) word += 2147483647;
      s[i] = word;
    }
    this.f = 3;
    this.r = 0;
    for (let i = 0; i < 310; i++) this.step();
  }

  private step(): number {
    const s = this.state;
    const val = (s[this.f]! + s[this.r]!) | 0;
    s[this.f] = val;
    this.f = this.f + 1 >= 31 ? 0 : this.f + 1;
    this.r = this.r + 1 >= 31 ? 0 : this.r + 1;
    return val >>> 1;
  }

  random(): number {
    this.calls++;
    return this.step();
  }
}

export const libc = new GlibcRandom();
libc.srandom(1);

export function random(): number {
  return libc.random();
}

export function srandom(seed: number): void {
  libc.srandom(seed);
}
