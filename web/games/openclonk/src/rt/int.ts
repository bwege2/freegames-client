// OpenClonk port: C++'s integer and float conversions as the translated code (src/sim) uses them, as on
// x86-64 with clang (re/openclonk/tools/cpp2ts/CONVENTIONS.md). 64-bit integers are bigints; everything
// narrower is a number.

const TWO63 = 2 ** 63;

/** a bigint as int64_t (two's complement wrap-around) */
export function i64(x: bigint): bigint {
  return BigInt.asIntN(64, x);
}

/** a bigint as uint64_t */
export function u64(x: bigint): bigint {
  return BigInt.asUintN(64, x);
}

/** a 64-bit integer converted to int32_t (its low 32 bits) */
export function n32(x: bigint): number {
  return Number(BigInt.asIntN(32, x));
}

/** a 64-bit integer converted to uint32_t */
export function nu32(x: bigint): number {
  return Number(BigInt.asUintN(32, x));
}

/** float/double -> int32_t: truncation; NaN and values out of range give INT32_MIN (x86 cvttss2si) */
export function ftoi32(x: number): number {
  const t = Math.trunc(x);
  return t >= -2147483648 && t <= 2147483647 ? t : -2147483648;
}

/** float/double -> uint32_t: clang converts through int64_t and keeps the low 32 bits */
export function ftou32(x: number): number {
  const t = Math.trunc(x);
  if (!(t > -TWO63 && t < TWO63)) return 0;
  return Number(BigInt.asUintN(32, BigInt(t)));
}

/** float/double -> int64_t: truncation; NaN and values out of range give INT64_MIN (x86 cvttsd2si) */
export function ftoi64(x: number): bigint {
  const t = Math.trunc(x);
  if (!(t >= -TWO63 && t < TWO63)) return -(1n << 63n);
  return BigInt(t);
}

/** float/double -> uint64_t (values out of range: 0) */
export function ftou64(x: number): bigint {
  const t = Math.trunc(x);
  if (!(t >= 0 && t < 2 ** 64)) return 0n;
  return BigInt(t);
}

// ---- 64-bit integers kept as numbers (long, unsigned long, size_t: values below 2^53)

const TWO64 = 2 ** 64;

/** a bigint as a (signed) 64-bit number */
export function n64(x: bigint): number {
  return Number(BigInt.asIntN(64, x));
}

/** a bigint as an unsigned 64-bit number */
export function nu64(x: bigint): number {
  return Number(BigInt.asUintN(64, x));
}

/** a signed value as unsigned long (size_t): negative values wrap around */
export function $u64n(x: number): number {
  return x < 0 ? x + TWO64 : x;
}

/** an unsigned long as long */
export function $i64n(x: number): number {
  return x >= TWO63 ? x - TWO64 : x;
}

export function $shl64n(a: number, b: number): number {
  return Number(BigInt.asIntN(64, BigInt(a) << BigInt(b)));
}

export function $shr64n(a: number, b: number): number {
  return Math.floor(a / 2 ** b);
}

export function $and64n(a: number, b: number): number {
  if ((a | 0) === a && (b | 0) === b) return a & b;
  return Number(BigInt(a) & BigInt(b));
}

export function $or64n(a: number, b: number): number {
  if ((a | 0) === a && (b | 0) === b) return a | b;
  return Number(BigInt(a) | BigInt(b));
}

export function $xor64n(a: number, b: number): number {
  if ((a | 0) === a && (b | 0) === b) return a ^ b;
  return Number(BigInt(a) ^ BigInt(b));
}

export function $not64n(a: number, signed: boolean): number {
  return signed ? -a - 1 : TWO64 - 1 - a;
}
