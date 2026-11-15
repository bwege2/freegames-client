// utils/random.c: the TGFSR random number generator TT800 (Matsumoto and Kurita, 1994), and the
// random seed of utils/gg_utils.c (set_random_seed, update_random_seed, reuse_random_seed).

const N = 25;
const m = 7;
const s = 7;
const t = 15;
const a = 0x8ebfd028;
const b = 0x2b5b2500;
const c = 0xdb8b0000 | 0;

const x = new Uint32Array(N);
let k = 0;
let rand_initialized = false;

function iterate_tgfsr(): void {
  let i;
  for (i = 0; i < N - m; i++) x[i] = x[i + m] ^ (x[i] >>> 1) ^ (x[i] & 1 ? a : 0);
  for (; i < N; i++) x[i] = x[i + m - N] ^ (x[i] >>> 1) ^ (x[i] & 1 ? a : 0);
}

function next_rand(): number {
  if (!rand_initialized) gg_srand(1);
  if (++k === N) {
    iterate_tgfsr();
    k = 0;
  }
  let y = x[k] ^ ((x[k] << s) & b);
  y ^= (y << t) & c;
  return y >>> 0;
}

export function gg_srand(seed: number): void {
  seed >>>= 0;
  for (let i = 0; i < N; i++) {
    x[i] = seed;
    seed = (Math.imul(seed, 1313) + 88897) >>> 0;
  }
  k = N - 1;
  rand_initialized = true;
}

/** [0, 2^31-1] */
export function gg_rand(): number {
  return next_rand() & 0x7fffffff;
}

/** [0, 2^32-1] */
export function gg_urand(): number {
  return next_rand();
}

/** [0.0, 1.0) */
export function gg_drand(): number {
  return next_rand() * 2.328306436538696e-10;
}

let random_seed = 0;

export function get_random_seed(): number {
  return random_seed;
}

export function set_random_seed(seed: number): void {
  random_seed = seed >>> 0;
  gg_srand(random_seed);
}

export function update_random_seed(): void {
  gg_srand(random_seed);
  random_seed = gg_rand();
  if (random_seed === 0) random_seed = 1;
  gg_srand(random_seed);
}

export function reuse_random_seed(): void {
  gg_srand(random_seed);
}
