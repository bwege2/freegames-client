// The random number generators of HyperRogue 13.1o, bit exact:
//
// * std::mt19937 (the C++ standard library's Mersenne Twister): `hrngen` (game.cpp), every random decision of the
//   game rules and the map generator; `inv::invr` (inventory.cpp, Orb Strategy); local generators copied from
//   hrngen (hrandstate) or saved by the change log (value_keep(hrngen) in pcmove.cpp): use clone()/copyFrom().
// * glibc rand()/srand() (TYPE_3 additive feedback generator, RAND_MAX = 2^31-1): only cosmetic uses and the
//   names of Camelot's knights (complex2.cpp, knight_id), which reach the messages. initAll() seeds it with
//   srand(time(NULL)); the oracle fixes time() (re/hyperrogue/oracle/harness.cpp, HARNESS_TIME).
//
// The functions of game.cpp built on hrngen (hrand, hrandpos, hrandf, chance, hrandstate, hrandom_shuffle, pick,
// hrand_elt, randf_from) are here too, so every package can import them without importing game.ts.

/** std::mt19937 */
export class mt19937 {
  readonly mt = new Uint32Array(624);
  mti = 625;

  constructor(seed = 5489) {
    this.seed(seed);
  }

  static readonly min = 0;
  static readonly max = 0xFFFFFFFF;

  /** std::mt19937::seed(result_type): the seed is taken modulo 2^32 (an int seed -1 becomes 0xFFFFFFFF) */
  seed(s: number): void {
    const mt = this.mt;
    mt[0] = s >>> 0;
    for (let i = 1; i < 624; i++) {
      const prev = mt[i - 1] ^ (mt[i - 1] >>> 30);
      // 1812433253 * prev + i, mod 2^32
      mt[i] = (Math.imul(1812433253, prev) + i) >>> 0;
    }
    this.mti = 624;
  }

  private twist(): void {
    const mt = this.mt;
    for (let i = 0; i < 624; i++) {
      const y = (mt[i] & 0x80000000) | (mt[(i + 1) % 624] & 0x7FFFFFFF);
      let v = mt[(i + 397) % 624] ^ (y >>> 1);
      if (y & 1) v ^= 0x9908B0DF;
      mt[i] = v >>> 0;
    }
    this.mti = 0;
  }

  /** operator(): the next value, 0 .. 2^32-1 */
  next(): number {
    if (this.mti >= 624) this.twist();
    let y = this.mt[this.mti++];
    y ^= y >>> 11;
    y ^= (y << 7) & 0x9D2C5680;
    y ^= (y << 15) & 0xEFC60000;
    y ^= y >>> 18;
    return y >>> 0;
  }

  /** a copy (std::mt19937 r2 = hrngen) */
  clone(): mt19937 {
    const r = new mt19937(0);
    r.copyFrom(this);
    return r;
  }

  /** assignment (hrngen = saved) */
  copyFrom(o: mt19937): void {
    this.mt.set(o.mt);
    this.mti = o.mti;
  }
}

/** game.cpp: EX std::mt19937 hrngen; (default-constructed: seed 5489) */
export const hrngen = new mt19937();

export const HRANDMAX = 0x7FFFFFFF;

/** game.cpp shrand */
export function shrand(i: number): void {
  hrngen.seed(i);
}

/** game.cpp hrandpos */
export function hrandpos(): number {
  return hrngen.next() & HRANDMAX;
}

/** game.cpp hrand: a random integer from [0..i); the original's own rejection method */
export function hrand(i: number): number {
  for (;;) {
    let d = hrngen.next() - mt19937.min;                   // unsigned d
    const m = Math.trunc((mt19937.max - mt19937.min + 1) / i);  // long long m = 2^32; m /= i;
    d = Math.trunc(d / m) >>> 0;                            // d /= m (computed in long long, stored unsigned)
    if (d < (i >>> 0)) return d;
  }
}

/** game.cpp randf_from: (r() - r.min()) / (r.max() + 1.0 - r.min()) */
export function randf_from(r: mt19937): number {
  return (r.next() - mt19937.min) / (mt19937.max + 1.0 - mt19937.min);
}

/** game.cpp hrandf */
export function hrandf(): number {
  return randf_from(hrngen);
}

/** game.cpp chance: true with probability p (l is uint_fast32_t = 64-bit unsigned on x86-64 Linux) */
export function chance(p: number): boolean {
  for (;;) {
    p *= mt19937.max + 1;
    const l = hrngen.next();
    const pv = Math.trunc(p);   // (decltype(l)) p; p >= 0 in all calls
    if (l < pv) return true;
    if (l === pv) { p = p - pv; continue; }
    return false;
  }
}

/** game.cpp hrandstate */
export function hrandstate(): number {
  const r2 = hrngen.clone();
  return r2.next() & HRANDMAX;
}

/** game.cpp pick(x, u...) */
export function pick<T>(...xs: T[]): T {
  return xs[hrand(xs.length)];
}

/** game.cpp hrandom_shuffle(T* x, int n) / hrandom_shuffle(container) */
export function hrandom_shuffle<T>(x: T[], n = x.length): void {
  for (let k = 1; k < n; k++) {
    const j = hrand(k + 1);
    const t = x[k]; x[k] = x[j]; x[j] = t;
  }
}

/** game.cpp hrand_elt(container) / hrand_elt(container, default_value) */
export function hrand_elt<T>(container: T[], default_value?: T): T {
  if (default_value !== undefined && container.length === 0) return default_value;
  return container[hrand(container.length)];
}

/** game.cpp hrandom_permutation */
export function hrandom_permutation(qty: number): number[] {
  const res: number[] = [];
  for (let i = 0; i < qty; i++) res.push(i);
  hrandom_shuffle(res);
  return res;
}

// --- glibc rand() ---

export const RAND_MAX = 0x7FFFFFFF;

const glibc = { r: new Int32Array(34 + 310 + 1), state: new Int32Array(34), f: 3, b: 0 };

/** glibc srand (random_r.c __srandom_r, TYPE_3: degree 31, separation 3, 310 discarded outputs) */
export function srand(seed: number): void {
  let s = seed >>> 0;
  if (s === 0) s = 1;
  const r = new Int32Array(34);
  r[0] = s | 0;
  for (let i = 1; i < 31; i++) {
    // r[i] = (16807 * r[i-1]) % 2147483647, computed as glibc does (Schrage), then made non-negative
    const hi = Math.trunc(r[i - 1] / 127773);
    const lo = r[i - 1] % 127773;
    let word = 16807 * lo - 2836 * hi;
    if (word < 0) word += 2147483647;
    r[i] = word;
  }
  for (let i = 31; i < 34; i++) r[i] = r[i - 31];
  glibc.state.set(r);
  glibc.f = 0;
  // the ring buffer: keep the last 34 values; discard 310 outputs
  for (let i = 0; i < 310; i++) rand();
}

/** glibc rand(): o[i] = (r[i-3] + r[i-31]) mod 2^32, returned >> 1 */
export function rand(): number {
  const r = glibc.state;
  // r is a ring of the last 34 values; f indexes the oldest (r[i-34])
  const i = glibc.f;
  const v = (r[(i + 34 - 31) % 34] + r[(i + 34 - 3) % 34]) | 0;
  r[i] = v;
  glibc.f = (i + 1) % 34;
  return (v >>> 1) & 0x7FFFFFFF;
}

srand(1);

// --- online lockstep (ONLINE.md, not in the original): drawing with generators of its own ---
// The original draws its particles, flashes, snowballs, ... with glibc rand() (and a Snake Nest's undecided snake
// with hrand) in the middle of the game's own sequence, so how many frames a client draws changes the rules'
// rand() (Camelot's knight names) and could change hrngen. In an online round (G.online_isolated) graph.ts calls
// drawing_rng_begin/end around every frame: they swap in generators of the drawing's own and give the rules theirs
// back untouched. Otherwise (the original's behaviour) they are not called.
const glibc_drawing = { state: new Int32Array(34), f: 0 };
const hrngen_drawing = new mt19937(1);
const glibc_saved = { state: new Int32Array(34), f: 0 };
const hrngen_saved = new mt19937(0);
export const drawing_rng = { depth: 0 };

export function drawing_rng_begin(): void {
  if (drawing_rng.depth++) return;
  glibc_saved.state.set(glibc.state); glibc_saved.f = glibc.f;
  glibc.state.set(glibc_drawing.state); glibc.f = glibc_drawing.f;
  hrngen_saved.copyFrom(hrngen);
  hrngen.copyFrom(hrngen_drawing);
}

export function drawing_rng_end(): void {
  if (--drawing_rng.depth) return;
  glibc_drawing.state.set(glibc.state); glibc_drawing.f = glibc.f;
  glibc.state.set(glibc_saved.state); glibc.f = glibc_saved.f;
  hrngen_drawing.copyFrom(hrngen);
  hrngen.copyFrom(hrngen_saved);
}

/** the drawing's glibc state starts as srand(1) leaves it */
{
  const s = new Int32Array(glibc.state); const f = glibc.f;
  glibc_drawing.state.set(s); glibc_drawing.f = f;
}

/** geometry2.cpp randd(): (rand() + .5) / (RAND_MAX + 1.) */
export function randd(): number {
  return (rand() + .5) / (RAND_MAX + 1.);
}
