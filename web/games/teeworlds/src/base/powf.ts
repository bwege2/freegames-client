// glibc's powf (2.44, x86-64): the Arm optimized-routines powf with POWF_LOG2_TABLE_BITS 4, EXP2F_TABLE_BITS 5 and
// no TOINT intrinsics, bit for bit. It is not correctly rounded (0.82 ulp), and the game core calls it
// (VelocityRamp), so Math.pow rounded to float would differ from the original on a few inputs.
//
// Copyright (c) 2017-2019, Arm Limited. SPDX-License-Identifier: MIT OR Apache-2.0 WITH LLVM-exception
// (math/powf.c, powf_log2_data.c and exp2f_data.c of github.com/ARM-software/optimized-routines), translated to
// TypeScript. The tables are the original's hexadecimal doubles written as exact decimals.

const INVC = [1.398907162146528, 1.3403141896637998, 1.286432210124115, 1.2367150214269895, 1.1906977166711752, 1.1479821020556429,
  1.1082251448272158, 1.0711297413057381, 1.036437278977283, 1.0, 0.9492859795739057, 0.8951049428609004, 0.8476821620351103,
  0.8050314851692001, 0.7664671008843108, 0.731428603316328];
const LOGC = [-0.48430022186289673, -0.42257122959194704, -0.3633754347673556, -0.30651309567405577, -0.25180720160537634,
  -0.19910014943794563, -0.14825100623281615, -0.09913323807318392, -0.051632812977629436, 0.0, 0.07508531937943004,
  0.15987125980713107, 0.2384046664317681, 0.31288288605863257, 0.38370422656453185, 0.451211048935815];
const A = [0.288457581109214, -0.36092606229713164, 0.480898481472577, -0.7213474675006291, 1.4426950408774342];
const C = [0.05550361559341535, 0.2402284522445722, 0.6931471806916203];
/** exp2f_data.tab (N = 32) as [hi, lo] 32-bit halves */
const T2: [number, number][] = [
  [0x3ff00000, 0x00000000], [0x3fefd9b0, 0xd3158574], [0x3fefb558, 0x6cf9890f], [0x3fef9301, 0xd0125b51],
  [0x3fef72b8, 0x3c7d517b], [0x3fef5487, 0x3168b9aa], [0x3fef387a, 0x6e756238], [0x3fef1e9d, 0xf51fdee1],
  [0x3fef06fe, 0x0a31b715], [0x3feef1a7, 0x373aa9cb], [0x3feedea6, 0x4c123422], [0x3feece08, 0x6061892d],
  [0x3feebfda, 0xd5362a27], [0x3feeb42b, 0x569d4f82], [0x3feeab07, 0xdd485429], [0x3feea47e, 0xb03a5585],
  [0x3feea09e, 0x667f3bcd], [0x3fee9f75, 0xe8ec5f74], [0x3feea114, 0x73eb0187], [0x3feea589, 0x994cce13],
  [0x3feeace5, 0x422aa0db], [0x3feeb737, 0xb0cdc5e5], [0x3feec491, 0x82a3f090], [0x3feed503, 0xb23e255d],
  [0x3feee89f, 0x995ad3ad], [0x3feeff76, 0xf2fb5e47], [0x3fef199b, 0xdd85529c], [0x3fef3720, 0xdcef9069],
  [0x3fef5818, 0xdcfba487], [0x3fef7c97, 0x337b9b5f], [0x3fefa4af, 0xa2a490da], [0x3fefd076, 0x5b6e4540],
];
const OFF = 0x3f330000;
const SHIFT = 0x18000000000000 / 32; // 0x1.8p+52 / N
const SIGN_BIAS = 1 << (5 + 11);

const buf = new ArrayBuffer(8);
const f64 = new Float64Array(buf);
const u32 = new Uint32Array(buf); // little endian: [lo, hi]
const f32 = new Float32Array(buf);
const i32 = new Int32Array(buf);

function asuint(x: number): number {
  f32[0] = x;
  return i32[0] | 0;
}
function asfloat(i: number): number {
  i32[0] = i;
  return f32[0];
}

function log2_inline(ix: number): number {
  const tmp = (ix - OFF) | 0;
  const i = ((tmp >>> 19) % 16) | 0;
  const top = tmp & 0xff800000;
  const iz = (ix - top) | 0;
  const k = top >> 23;
  const invc = INVC[i], logc = LOGC[i];
  const z = asfloat(iz);
  const r = z * invc - 1;
  const y0 = logc + k;
  const r2 = r * r;
  let y = A[0] * r + A[1];
  const p = A[2] * r + A[3];
  const r4 = r2 * r2;
  let q = A[4] * r + y0;
  q = p * r2 + q;
  y = y * r4 + q;
  return y;
}

function exp2_inline(xd: number, sign_bias: number): number {
  let kd = xd + SHIFT;
  f64[0] = kd;
  const kiLo = u32[0];
  kd -= SHIFT;
  const r = xd - kd;
  const t = T2[kiLo % 32];
  const ski = (kiLo + sign_bias) >>> 0;
  // t += ski << 47: only bits 47..63, i.e. the high word, change (without a carry from the low word)
  u32[0] = t[1];
  u32[1] = (t[0] + ((ski & 0x1ffff) << 15)) >>> 0;
  const s = f64[0];
  const z = C[0] * r + C[1];
  const r2 = r * r;
  let y = C[2] * r + 1;
  y = z * r2 + y;
  y = y * s;
  return Math.fround(y);
}

function checkint(iy: number): number {
  const e = (iy >>> 23) & 0xff;
  if (e < 0x7f) return 0;
  if (e > 0x7f + 23) return 2;
  if (iy & ((1 << (0x7f + 23 - e)) - 1)) return 0;
  if (iy & (1 << (0x7f + 23 - e))) return 1;
  return 2;
}

function zeroinfnan(ix: number): boolean { return ((2 * ix - 1) >>> 0) >= ((2 * 0x7f800000 - 1) >>> 0); }

export function powf(x: number, y: number): number {
  x = Math.fround(x);
  y = Math.fround(y);
  let sign_bias = 0;
  let ix = asuint(x) >>> 0;
  const iy = asuint(y) >>> 0;
  if (((ix - 0x00800000) >>> 0) >= 0x7f800000 - 0x00800000 || zeroinfnan(iy)) {
    if (zeroinfnan(iy)) {
      if (((2 * iy) >>> 0) === 0) return 1;
      if (ix === 0x3f800000) return 1;
      if (((2 * ix) >>> 0) > ((2 * 0x7f800000) >>> 0) || ((2 * iy) >>> 0) > ((2 * 0x7f800000) >>> 0)) return Math.fround(x + y);
      if (((2 * ix) >>> 0) === ((2 * 0x3f800000) >>> 0)) return 1;
      if ((((2 * ix) >>> 0) < ((2 * 0x3f800000) >>> 0)) === !(iy & 0x80000000)) return 0;
      return Math.fround(y * y);
    }
    if (zeroinfnan(ix)) {
      let x2 = Math.fround(x * x);
      if (ix & 0x80000000 && checkint(iy) === 1) x2 = -x2;
      return iy & 0x80000000 ? Math.fround(1 / x2) : x2;
    }
    if (ix & 0x80000000) {
      const yint = checkint(iy);
      if (yint === 0) return NaN;
      if (yint === 1) sign_bias = SIGN_BIAS;
      ix = (ix & 0x7fffffff) >>> 0;
    }
    if (ix < 0x00800000) {
      ix = asuint(Math.fround(x * 8388608)) & 0x7fffffff;
      ix = (ix - (23 << 23)) >>> 0;
    }
  }
  const logx = log2_inline(ix | 0);
  const ylogx = y * logx;
  f64[0] = ylogx;
  // asuint64(ylogx) >> 47 & 0xffff against asuint64(126.0) >> 47
  const top16 = ((u32[1] >>> 15) & 0xffff) >>> 0;
  f64[0] = 126.0;
  const lim = u32[1] >>> 15;
  if (top16 >= lim) {
    if (ylogx > 127.99999995700433) return sign_bias ? -Infinity : Infinity;
    if (ylogx <= -150.0) return sign_bias ? -0 : 0;
  }
  return exp2_inline(ylogx, sign_bias);
}
