// The two random number generators the original uses.
//
// Perl's rand/srand (Perl >= 5.20 everywhere, and the libc drand48 Perl 5.8 used on Linux): the 48-bit
// linear congruential generator of drand48, seeded by srand48 (util.c Perl_drand48_init_r /
// Perl_drand48_r). srand takes the seed as U32. rand(n) = n * drand48().
//
// glibc's random()/srand() (TYPE_3, the additive feedback generator of random_r.c), which the C
// extension c_stuff uses through rand(): plasma noise, the choice of transition effect, the logo
// effects. It starts with seed 1 (the C library's default) until init_effects calls srand(time()).

export class PerlRand {
  // the 48-bit state as three 16-bit words (x0 low)
  private x0 = 0x330e;
  private x1 = 0;
  private x2 = 0;
  /** calls since the last srand, for traces */
  count = 0;
  onSrand: ((seed: number) => void) | null = null;

  /** srand(seed): the seed as U32, state = seed << 16 | 0x330e */
  srand(seed: number): void {
    const s = Number.isFinite(seed) ? (Math.trunc(seed) >>> 0) : 0;
    this.x0 = 0x330e;
    this.x1 = s & 0xffff;
    this.x2 = s >>> 16;
    this.count = 0;
    this.onSrand?.(seed);
  }

  /** drand48: x = (0x5DEECE66D * x + 0xB) mod 2^48, returns x / 2^48 */
  drand(): number {
    const a0 = 0xe66d, a1 = 0xdeec, a2 = 0x5;
    const x0 = this.x0, x1 = this.x1, x2 = this.x2;
    let t = a0 * x0 + 0xb;
    const n0 = t & 0xffff;
    t = Math.floor(t / 65536) + a0 * x1 + a1 * x0;
    const n1 = t % 65536;
    t = Math.floor(t / 65536) + a0 * x2 + a1 * x1 + a2 * x0;
    const n2 = t % 65536;
    this.x0 = n0; this.x1 = n1; this.x2 = n2;
    this.count++;
    return (n2 * 4294967296 + n1 * 65536 + n0) / 281474976710656;
  }

  /** Perl's rand(n) (n = 0 means 1) */
  rand(n = 1): number {
    if (n === 0) n = 1;
    return n * this.drand();
  }

  /** int(rand(n)) */
  int(n: number): number {
    return Math.trunc(this.rand(n));
  }
}

export const RAND_MAX = 2147483647;

export class GlibcRand {
  private r = new Int32Array(34);
  private f = 3;
  private b = 0;

  constructor(seed = 1) { this.srand(seed); }

  srand(seed: number): void {
    // srandom_r for TYPE_3 (degree 31, separation 3)
    let word = seed | 0;
    if (word === 0) word = 1;
    const r = new Int32Array(31);
    r[0] = word;
    for (let i = 1; i < 31; i++) {
      const hi = Math.trunc(word / 127773);
      const lo = word % 127773;
      word = 16807 * lo - 2836 * hi;
      if (word < 0) word += 2147483647;
      r[i] = word;
    }
    this.r = r;
    this.f = 3;
    this.b = 0;
    for (let i = 0; i < 310; i++) this.next();
  }

  /** random() / rand(): 0 .. RAND_MAX */
  next(): number {
    const r = this.r;
    r[this.f] = (r[this.f] + r[this.b]) | 0;
    const result = (r[this.f] >>> 1) & 0x7fffffff;
    if (++this.f >= 31) { this.f = 0; this.b++; } else if (++this.b >= 31) this.b = 0;
    return result;
  }

  /** c_stuff's rand_(val) = 1 + (int)(val * rand() / (RAND_MAX + 1.0)) */
  rand_(val: number): number {
    return 1 + Math.trunc(val * this.next() / (RAND_MAX + 1.0));
  }
}
