// common/math.c and common/randommt.c: the trig tables (glibc's values, tables.ts), randomMT (Cokus's
// MT19937 variant), rfrac, mod, ON/OFF.
import { TBL_COS_BITS, TBL_SIN_BITS } from './tables.ts';
import { onReset, strncasecmp } from './cutil.ts';

function fromBits(hex: string): number {
  const dv = new DataView(new ArrayBuffer(8));
  dv.setBigUint64(0, BigInt('0x' + hex));
  return dv.getFloat64(0);
}

export const tbl_sin = new Float64Array(TBL_SIN_BITS.map(fromBits));
export const tbl_cos = new Float64Array(TBL_COS_BITS.map(fromBits));
/** tsin(x)/tcos(x) (const.h): no range check, callers keep x in 0..127 */
export const tsin = (x: number): number => tbl_sin[x];
export const tcos = (x: number): number => tbl_cos[x];

/** math.c Make_table: the tables are constant here */
export function Make_table(): void { /* tbl_sin/tbl_cos hold glibc's values */ }

export function ON(v: string): boolean {
  return strncasecmp(v, 'true', 4) === 0 || strncasecmp(v, 'on', 2) === 0 || strncasecmp(v, 'yes', 3) === 0;
}

export function OFF(v: string): boolean {
  return strncasecmp(v, 'false', 5) === 0 || strncasecmp(v, 'off', 3) === 0 || strncasecmp(v, 'no', 2) === 0;
}

export function mod(x: number, y: number): number {
  if (x >= y || x < 0) x = x - y * Math.trunc(x / y);
  if (x < 0) x += y;
  return x;
}

// ---------------------------------------------------------------- randommt.c

const N = 624, M = 397, K = 0x9908b0df;
const state = new Uint32Array(N + 1);
let next = 0;
let left = -1;
onReset(() => {
  state.fill(0);
  next = 0;
  left = -1;
});

export function seedMT(seed: number): void {
  let x = (seed | 1) >>> 0;
  state[0] = x;
  for (let j = 1; j < N; j++) {
    x = Math.imul(x, 69069) >>> 0;
    state[j] = x;
  }
  left = 0;
}

const hiBit = (u: number) => u & 0x80000000;
const loBits = (u: number) => u & 0x7fffffff;
const mixBits = (u: number, v: number) => (hiBit(u) | loBits(v)) >>> 0;

function temper(y: number): number {
  y ^= y >>> 11;
  y ^= (y << 7) & 0x9d2c5680;
  y ^= (y << 15) & 0xefc60000;
  return (y ^ (y >>> 18)) >>> 0;
}

function reloadMT(): number {
  if (left < -1) seedMT(4357);
  left = N - 1;
  next = 1;
  const step = (a: number, b: number, c: number) => (a ^ (mixBits(b, c) >>> 1) ^ (c & 1 ? K : 0)) >>> 0;
  let p0 = 0, p2 = 2, pM = M, s0 = state[0], s1 = state[1];
  let j = N - M + 1;
  while (--j) {
    state[p0++] = step(state[pM++], s0, s1);
    s0 = s1;
    s1 = state[p2++];
  }
  pM = 0;
  j = M;
  while (--j) {
    state[p0++] = step(state[pM++], s0, s1);
    s0 = s1;
    s1 = state[p2++];
  }
  s1 = state[0];
  state[p0] = step(state[pM], s0, s1);
  return temper(s1);
}

export function randomMT(): number {
  if (--left < 0) return reloadMT();
  return temper(state[next++]);
}

/** a fresh generator state (a new client run) */
export function resetMT(): void {
  state.fill(0);
  next = 0;
  left = -1;
}

/** math.c rfrac(): randomMT() / 2^32 */
export const rfrac = (): number => randomMT() * 0.00000000023283064365386962890625;
