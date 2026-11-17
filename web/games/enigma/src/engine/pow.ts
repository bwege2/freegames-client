// pow(x, y) bit for bit as the original calls it: glibc's __pow (sysdeps/ieee754/dbl-64/e_pow.c, glibc 2.44,
// Copyright (C) 2018-2026 Free Software Foundation, Inc., LGPL-2.1-or-later), in the variant x86-64 runs on CPUs
// with FMA (e_pow-fma.c, built with -mfma, where GCC also fuses a * b + c into one rounding). World::advance_actor
// (world.cc) feeds pow(|v|, 0.8) into every actor's velocity 400 times a second; V8's Math.pow differs from glibc
// in the last bit for about 9 % of the arguments, and a correctly rounded pow in 0.1 %, enough to send the marble
// elsewhere after a few seconds. Only positive finite x and the y the engine uses are needed: the special cases
// (zero, infinity, NaN, negative or subnormal x, overflow) fall back to Math.pow.
import { LN2HI, LN2LO, A, LOGTAB, INVLN2N, NEGLN2HIN, NEGLN2LON, SHIFT, EXPPOLY, EXPTAB } from './pow-data.ts';

const fb = new Float64Array(1), ub = new BigUint64Array(fb.buffer);
const asU = (v: number): bigint => { fb[0] = v; return ub[0]; };
const asD = (u: bigint): number => { ub[0] = BigInt.asUintN(64, u); return fb[0]; };

// v = m * 2^e exactly, m a signed integer
function split(v: number): [bigint, number] {
  const u = asU(v), be = Number((u >> 52n) & 0x7ffn), frac = u & 0xfffffffffffffn;
  const m = be === 0 ? frac : frac | 0x10000000000000n;
  return [u >> 63n ? -m : m, be === 0 ? -1074 : be - 1075];
}
const P2 = (k: number): number => (k > 1023 ? 2 ** 1023 * 2 ** (k - 1023) : k < -1022 ? 2 ** -1022 * 2 ** (k + 1022) : 2 ** k);

/** fma(a, b, c): a * b + c with one rounding (to nearest, ties to even). Normal results only. */
export function fma(a: number, b: number, c: number): number {
  if (a === 0 || b === 0 || c === 0 || !Number.isFinite(a * b) || !Number.isFinite(c)) {
    if (c === 0 && a !== 0 && b !== 0) { /* exact product rounded once */ } else return a * b + c;
  }
  const [ma, ea] = split(a), [mb, eb] = split(b), [mc, ec] = split(c);
  let mp = ma * mb, ep = ea + eb, mcc = mc;
  let e = Math.min(ep, ec);
  mp <<= BigInt(ep - e); mcc <<= BigInt(ec - e);
  let s = mp + mcc;
  if (s === 0n) return a * b + c; // exact zero: the sign follows IEEE rules
  const neg = s < 0n;
  if (neg) s = -s;
  const L = s.toString(2).length;
  if (L > 53) {
    const sh = BigInt(L - 53);
    let q = s >> sh;
    const rem = s & ((1n << sh) - 1n), half = 1n << (sh - 1n);
    if (rem > half || (rem === half && (q & 1n))) q += 1n;
    s = q; e += L - 53;
  }
  const r = Number(s) * P2(e);
  return neg ? -r : r;
}

const OFF = 0x3fe6955500000000n;

// log_inline: returns [y, tail] with y + tail = log(x)
function logInline(ix: bigint): [number, number] {
  const tmp = BigInt.asUintN(64, ix - OFF);
  const i = Number((tmp >> 45n) % 128n);
  const k = Number(BigInt.asIntN(64, tmp) >> 52n);
  const iz = ix - (tmp & (0xfffn << 52n));
  const z = asD(iz);
  const kd = k;
  const invc = LOGTAB[3 * i], logc = LOGTAB[3 * i + 1], logctail = LOGTAB[3 * i + 2];
  const r = fma(z, invc, -1.0);
  const t1 = fma(kd, LN2HI, logc);
  const t2 = t1 + r;
  const lo1 = fma(kd, LN2LO, logctail);
  const lo2 = t1 - t2 + r;
  const ar = A[0] * r;
  const ar2 = r * ar;
  const ar3 = r * ar2;
  const hi = t2 + ar2;
  const lo3 = fma(ar, r, -ar2);
  const lo4 = t2 - hi + ar2;
  const p = ar3 * fma(ar2, fma(ar2, fma(r, A[6], A[5]), fma(r, A[4], A[3])), fma(r, A[2], A[1]));
  const lo = lo1 + lo2 + lo3 + lo4 + p;
  const y = hi + lo;
  return [y, hi - y + lo];
}

// exp_inline without the sign bias, for arguments where the result is a normal number
function expInline(x: number, xtail: number): number {
  let kd = fma(INVLN2N, x, SHIFT);
  const ki = asU(kd);
  kd -= SHIFT;
  let r = fma(kd, NEGLN2LON, fma(kd, NEGLN2HIN, x));
  r += xtail;
  const idx = Number(2n * (ki % 128n));
  const top = BigInt.asUintN(64, ki << 45n);
  const tail = asD(EXPTAB[idx]);
  const sbits = BigInt.asUintN(64, EXPTAB[idx + 1] + top);
  const r2 = r * r;
  const tmp = fma(r2 * r2, fma(r, EXPPOLY[3], EXPPOLY[2]), fma(r2, fma(r, EXPPOLY[1], EXPPOLY[0]), tail + r));
  const scale = asD(sbits);
  return fma(scale, tmp, scale);
}

export function pow(x: number, y: number): number {
  // the fast path of __pow: x normal and positive, 2^-65 <= |y| < 2^63, |y log x| < 512
  if (!(x >= 2.2250738585072014e-308) || x === Infinity || !(Math.abs(y) >= 2 ** -65 && Math.abs(y) < 2 ** 63)) return Math.pow(x, y);
  const [hi, lo] = logInline(asU(x));
  const ehi = y * hi;
  const elo = fma(y, lo, fma(y, hi, -ehi));
  if (!(Math.abs(ehi) >= 2 ** -54 && Math.abs(ehi) < 512)) return Math.abs(ehi) < 2 ** -54 ? 1.0 + ehi : Math.pow(x, y);
  return expInline(ehi, elo);
}

export const pow08 = (x: number): number => pow(x, 0.8);
