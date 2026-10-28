// NetHack 3.6.7's random numbers: ISAAC64 (src/isaac64.c, public domain, by Timothy B. Terriberry after
// Bob Jenkins), the two generators of src/rnd.c (the core one behind rn2() and the one for the display),
// seeded with 8 bytes from /dev/urandom (sys/unix/unixmain.c: sys_random_seed). By hand, because they
// need 64-bit integers: BigInt here.
import { G } from '../globals.ts';
import { rn2 } from '../rnd.ts';
import { platform } from './platform.ts';

const MASK = (1n << 64n) - 1n;
const SZ = 256;

class Isaac64 {
  n = 0;
  r = new BigUint64Array(SZ);
  m = new BigUint64Array(SZ);
  a = 0n;
  b = 0n;
  c = 0n;
}

const lower = (x: bigint) => Number((x >> 3n) & 255n);
const upper = (y: bigint) => Number((y >> 11n) & 255n);

function update(ctx: Isaac64): void {
  const m = ctx.m, r = ctx.r;
  let a = ctx.a;
  ctx.c = (ctx.c + 1n) & MASK;
  let b = (ctx.b + ctx.c) & MASK;
  let x: bigint, y: bigint;
  const step = (i: number, mix: bigint, other: number) => {
    x = m[i];
    a = (mix + m[other]) & MASK;
    y = (m[lower(x)] + a + b) & MASK;
    m[i] = y;
    b = (m[upper(y)] + x) & MASK;
    r[i] = b;
  };
  for (let i = 0; i < SZ; ) {
    const half = i < SZ / 2 ? SZ / 2 : -SZ / 2;
    step(i, MASK ^ (a ^ ((a << 21n) & MASK)), i + half);
    i++;
    step(i, a ^ (a >> 5n), i + half);
    i++;
    step(i, a ^ ((a << 12n) & MASK), i + half);
    i++;
    step(i, a ^ (a >> 33n), i + half);
    i++;
  }
  ctx.b = b;
  ctx.a = a;
  ctx.n = SZ;
}

const SHIFT = [9n, 9n, 23n, 15n, 14n, 20n, 17n, 14n];

function mix(x: BigUint64Array): void {
  for (let i = 0; i < 8; i++) {
    x[i] -= x[(i + 4) & 7];
    x[(i + 5) & 7] ^= x[(i + 7) & 7] >> SHIFT[i];
    x[(i + 7) & 7] += x[i];
    i++;
    x[i] -= x[(i + 4) & 7];
    x[(i + 5) & 7] ^= (x[(i + 7) & 7] << SHIFT[i]) & MASK;
    x[(i + 7) & 7] += x[i];
  }
}

function init(ctx: Isaac64, seed: Uint8Array): void {
  ctx.a = ctx.b = ctx.c = 0n;
  ctx.r.fill(0n);
  const m = ctx.m, r = ctx.r;
  let nseed = seed.length;
  let i = 0;
  for (; i < nseed >> 3; i++) {
    let v = 0n;
    for (let k = 7; k >= 0; k--) v = (v << 8n) | BigInt(seed[(i << 3) | k]);
    r[i] ^= v;
  }
  nseed -= i << 3;
  if (nseed > 0) {
    let ri = BigInt(seed[i << 3]);
    for (let j = 1; j < nseed; j++) ri |= BigInt(seed[(i << 3) | j]) << BigInt(j << 3);
    r[i++] ^= ri;
  }
  const x = new BigUint64Array(8).fill(0x9e3779b97f4a7c13n);
  for (i = 0; i < 4; i++) mix(x);
  for (i = 0; i < SZ; i += 8) {
    for (let j = 0; j < 8; j++) x[j] += r[i + j];
    mix(x);
    m.set(x, i);
  }
  for (i = 0; i < SZ; i += 8) {
    for (let j = 0; j < 8; j++) x[j] += m[i + j];
    mix(x);
    m.set(x, i);
  }
  update(ctx);
}

function next(ctx: Isaac64): bigint {
  platform().rngDraw?.();
  if (!ctx.n) update(ctx);
  return ctx.r[--ctx.n];
}

const CORE = new Isaac64(), DISP = new Isaac64();

/** rnd.c: whichrng() */
export function whichrng(fn: Function): number {
  return fn === rn2 ? 0 : fn === rn2_on_display_rng ? 1 : -1;
}

/** rnd.c: init_isaac64(seed, fn) */
export function init_isaac64(seed: number, fn: Function): void {
  const k = whichrng(fn);
  if (k < 0) throw new Error('Bad rng function passed to init_isaac64().');
  const bytes = new Uint8Array(8);
  let s = BigInt(seed);
  for (let i = 0; i < 8; i++) {
    bytes[i] = Number(s & 255n);
    s >>= 8n;
  }
  init(k === 0 ? CORE : DISP, bytes);
}

/** rnd.c: RND(x), the core generator */
export function RND(x: number): number {
  return Number(next(CORE) % BigInt(x));
}

/** rnd.c: rn2_on_display_rng(x) */
export function rn2_on_display_rng(x: number): number {
  return Number(next(DISP) % BigInt(x));
}

let opened = 0;

/** unixmain.c: sys_random_seed(): 8 bytes of /dev/urandom */
export function sys_random_seed(): number {
  const seed = platform().seed(opened++);
  G.has_strong_rngseed = 1;
  return seed;
}

export function resetRng(): void {
  opened = 0;
  Object.assign(CORE, new Isaac64());
  Object.assign(DISP, new Isaac64());
}
