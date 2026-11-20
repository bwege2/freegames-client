// The original's random numbers: PCG32 from crawl-ref/source/pcg.cc (a from-scratch TypeScript
// implementation of the public PCG algorithm) and random.cc's random2, roll_dice, random_range,
// random2avg, div_rand_round, one_chance_in and weighted choice. The seed is the game seed, and the
// streams are seeded as rng::_do_seeding does: master = PCG(seed), then for each stream two 64-bit
// draws (state, sequence).
const MASK64 = (1n << 64n) - 1n;
const MULT = 6364136223846793005n;
const DEFAULT_SEQUENCE = 2305843009213693951n;

export class Pcg {
  state: bigint;
  inc: bigint;

  constructor(state = 0n, sequence = 1n) {
    this.state = 0n;
    this.inc = 1n;
    this.seed(state, sequence);
  }

  private seed(initState: bigint, sequence: bigint): void {
    this.inc = ((sequence << 1n) | 1n) & MASK64;
    this.next32();
    this.state = (this.state + initState) & MASK64;
    this.next32();
  }

  clone(): Pcg {
    const p = new Pcg(0n, 1n);
    p.state = this.state;
    p.inc = this.inc;
    return p;
  }

  next32(): number {
    const old = this.state;
    this.state = (old * MULT + (this.inc | 1n)) & MASK64;
    const xorshifted = Number(((old >> 18n) ^ old) >> 27n) >>> 0;
    const rot = Number(old >> 59n);
    return ((xorshifted >>> rot) | (xorshifted << ((-rot) & 31))) >>> 0;
  }

  next64(): bigint {
    return (BigInt(this.next32()) << 32n) | BigInt(this.next32());
  }

  /** PcgRNG::get_bounded_uint32: Lemire's method with the loop DCSS uses. */
  bounded(range: number): number {
    if (range <= 1) return 0;
    const r = range >>> 0;
    let x = this.next32();
    let m = BigInt(x) * BigInt(r);
    let l = Number(m & 0xffffffffn) >>> 0;
    if (l < r) {
      let t = (-r) >>> 0;
      if (t >= r) {
        t = (t - r) >>> 0;
        if (t >= r) t = t % r;
      }
      while (l < t) {
        x = this.next32();
        m = BigInt(x) * BigInt(r);
        l = Number(m & 0xffffffffn) >>> 0;
      }
    }
    return Number(m >> 32n);
  }
}

/** GAMEPLAY, UI, SYSTEM_SPECIFIC, SPARE2, SPARE3, then one levelgen stream per branch. */
export const NUM_RNGS = 64;
export const GAMEPLAY = 0;
export const UI = 1;
export const LEVELGEN = 5;

export class Rng {
  seed = 0n;
  streams: Pcg[] = [];
  current = GAMEPLAY;

  constructor(seed: bigint | number = 0n) {
    this.reset(seed);
  }

  reset(seed: bigint | number): void {
    this.seed = BigInt(seed) & MASK64;
    const master = new Pcg(this.seed, DEFAULT_SEQUENCE);
    this.streams = [];
    for (let i = 0; i < NUM_RNGS; i++) {
      const s = master.next64();
      const seq = master.next64();
      this.streams.push(new Pcg(s, seq));
    }
    this.current = GAMEPLAY;
  }

  /** Uses one stream for the duration of fn, then returns to the previous one. */
  withStream<T>(index: number, fn: () => T): T {
    const old = this.current;
    this.current = index;
    try {
      return fn();
    } finally {
      this.current = old;
    }
  }

  next32(): number {
    return this.streams[this.current].next32();
  }

  next64(): bigint {
    return this.streams[this.current].next64();
  }

  /** random2(max): [0, max) */
  int(max: number): number {
    if (max <= 1) return 0;
    return this.streams[this.current].bounded(max);
  }

  /** random_range(low, high): [low, high] */
  range(low: number, high: number): number {
    return low + this.int(high - low + 1);
  }

  /** random_range(low, high, nrolls) */
  rangeAvg(low: number, high: number, rolls: number): number {
    return low + this.intAvg(high - low + 1, rolls);
  }

  /** random2avg(max, rolls): [0, max), same mean, lower variance */
  intAvg(max: number, rolls: number): number {
    let sum = this.int(max);
    for (let i = 0; i < rolls - 1; i++) sum += this.int(max + 1);
    return Math.trunc(sum / rolls);
  }

  /** roll_dice(num, size): [num, num*size] */
  dice(num: number, size: number): number {
    if (num <= 0 || size <= 0) return 0;
    let ret = num;
    for (let i = 0; i < num; i++) ret += this.int(size);
    return ret;
  }

  oneChanceIn(n: number): boolean {
    return this.xChanceInY(1, n);
  }

  /** x_chance_in_y(x, y) */
  xChanceInY(x: number, y: number): boolean {
    if (x <= 0 || y <= 0) return false;
    if (x >= y) return true;
    return this.int(y) < x;
  }

  /** div_rand_round(num, den) */
  divRandRound(num: number, den: number): number {
    const rem = num % den;
    if (rem) return Math.trunc(num / den) + (this.int(den) < rem ? 1 : 0);
    return Math.trunc(num / den);
  }

  coinflip(): boolean {
    return this.int(2) === 1;
  }

  choose<T>(a: T[]): T {
    return a[this.int(a.length)];
  }

  /** random_choose_weighted: one choice per [weight, value] pair */
  weighted<T>(pairs: [number, T][]): T {
    let total = 0;
    for (const [w] of pairs) total += w;
    let r = this.int(total);
    for (const [w, v] of pairs) {
      if (r < w) return v;
      r -= w;
    }
    return pairs[pairs.length - 1][1];
  }

  shuffle<T>(a: T[]): T[] {
    for (let i = a.length - 1; i > 0; i--) {
      const j = this.int(i + 1);
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  save(): { seed: string; streams: [string, string][]; current: number } {
    return { seed: this.seed.toString(), streams: this.streams.map((p) => [p.state.toString(), p.inc.toString()]), current: this.current };
  }

  static load(s: { seed: string; streams: [string, string][]; current: number }): Rng {
    const r = new Rng(0n);
    r.seed = BigInt(s.seed);
    r.streams = s.streams.map(([a, b]) => {
      const p = new Pcg(0n, 1n);
      p.state = BigInt(a);
      p.inc = BigInt(b);
      return p;
    });
    r.current = s.current;
    return r;
  }
}
