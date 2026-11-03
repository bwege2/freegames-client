// C++ semantics the port needs: float (binary32) arithmetic, integer division, Misc.h helpers, and the
// simulation's RNG (common/tpt-rand.cpp, xoroshiro128+).
//
// The original computes with `float` (SSE, no FMA, no x87 excess precision): every float operation rounds to
// binary32. JavaScript computes in double, so a ported float expression rounds each float operation with f()
// (Math.fround). A double operation (a float with a double literal such as 0.5, or std::sqrt of a double) is
// computed in double and rounded only where the C++ stores into a float.

export const f = Math.fround;

/** C integer division (truncates toward zero) for int operands */
export function idiv(a: number, b: number): number {
  return (a / b) | 0;
}

/** (int)x of a float or double: truncation toward zero, as C++ for in-range values */
export function itrunc(x: number): number {
  return x < 0 ? Math.ceil(x) | 0 : Math.floor(x) | 0;
}

/** (unsigned)x */
export function u32(x: number): number {
  return x >>> 0;
}

export function floorDiv(a: number, b: number): [number, number] {
  let quo = (a / b) | 0;
  let rem = a % b;
  if (a < 0 && rem) {
    quo -= 1;
    rem += b;
  }
  return [quo, rem];
}

export function ceilDiv(a: number, b: number): [number, number] {
  return floorDiv(a + b - 1, b);
}

export function isign(i: number): number {
  if (i < 0) return -1;
  if (i > 0) return 1;
  return 0;
}

export function clamp_flt(v: number, min: number, max: number): number {
  if (v < min) return 0;
  if (v > max) return 255;
  return itrunc(f(f(f(255.0) * f(v - min)) / f(max - min)));
}

export function restrict_flt(v: number, min: number, max: number): number {
  if (!Number.isFinite(v)) return min;
  if (v < min) return min;
  if (v > max) return max;
  return v;
}

/** Misc.cpp HSV_to_RGB: h 0..360, s and v 0..255; returns [r, g, b] */
export function HSV_to_RGB(h: number, s: number, v: number): [number, number, number] {
  const hh = f(h / f(60.0));
  const ss = f(s / f(255.0));
  const vv = f(v / f(255.0));
  const c = f(vv * ss);
  // fmod(float, float) is exact; fabs and 1 - ... are float operations
  const x = f(c * f(1 - Math.abs(f(f(hh % f(2.0)) - 1))));
  let r = 0, g = 0, b = 0;
  if (hh < 1) { r = itrunc(c * 255.0); g = itrunc(x * 255.0); b = 0; }
  else if (hh < 2) { r = itrunc(x * 255.0); g = itrunc(c * 255.0); b = 0; }
  else if (hh < 3) { r = 0; g = itrunc(c * 255.0); b = itrunc(x * 255.0); }
  else if (hh < 4) { r = 0; g = itrunc(x * 255.0); b = itrunc(c * 255.0); }
  else if (hh < 5) { r = itrunc(x * 255.0); g = 0; b = itrunc(c * 255.0); }
  else if (hh < 6) { r = itrunc(c * 255.0); g = 0; b = itrunc(x * 255.0); }
  const m = itrunc(f(vv - c) * 255.0);
  return [r + m, g + m, b + m];
}

/** Misc.cpp RGB_to_HSV; returns [h, s, v] */
export function RGB_to_HSV(r: number, g: number, b: number): [number, number, number] {
  const rr = f(r / f(255.0)), gg = f(g / f(255.0)), bb = f(b / f(255.0));
  const a = Math.min(rr, gg, bb);
  const x = Math.max(rr, gg, bb);
  if (a === x) return [0, 0, itrunc(a * 255.0)];
  const c = rr === a ? f(gg - bb) : bb === a ? f(rr - gg) : f(bb - rr);
  const d = rr === a ? 3 : bb === a ? 1 : 5;
  return [itrunc(60.0 * f(d - f(c / f(x - a)))), itrunc(255.0 * f(f(x - a) / x)), itrunc(255.0 * x)];
}

/** an out-parameter (`int *wm`, `unsigned *rr`) */
export interface Ref { v: number }

const TWO32 = 4294967296;

/** common/tpt-rand.cpp: xoroshiro128+ on two 64-bit words, kept as four 32-bit halves */
export class RNG {
  // s[0] = (s0h, s0l), s[1] = (s1h, s1l)
  s0h = 0; s0l = 0; s1h = 0; s1l = 0;
  // the 64-bit result of the last next(): high and low halves
  private rh = 0; private rl = 0;

  constructor() {
    this.s0h = 0; this.s0l = (Date.now() / 1000) >>> 0;
    this.s1h = 0; this.s1l = 614;
  }

  seed(sd: number): void {
    this.s0h = 0; this.s0l = sd >>> 0;
    this.s1h = 0; this.s1l = sd >>> 0;
  }

  state(): [number, number, number, number] {
    return [this.s0h, this.s0l, this.s1h, this.s1l];
  }

  setState(s: readonly number[]): void {
    this.s0h = s[0] >>> 0; this.s0l = s[1] >>> 0; this.s1h = s[2] >>> 0; this.s1l = s[3] >>> 0;
  }

  /** next(): sets rh/rl to the 64-bit result */
  private next(): void {
    const s0h = this.s0h, s0l = this.s0l;
    let s1h = this.s1h, s1l = this.s1l;
    // result = s0 + s1
    const lo = s0l + s1l;
    this.rl = lo >>> 0;
    this.rh = (s0h + s1h + (lo > 0xFFFFFFFF ? 1 : 0)) >>> 0;
    // s1 ^= s0
    s1h = (s1h ^ s0h) >>> 0; s1l = (s1l ^ s0l) >>> 0;
    // rotl(s0, 55) = rotr(s0, 9)
    const rh = ((s0l << 23) | (s0h >>> 9)) >>> 0;
    const rl = ((s0h << 23) | (s0l >>> 9)) >>> 0;
    // s1 << 14
    const shh = ((s1h << 14) | (s1l >>> 18)) >>> 0;
    const shl = (s1l << 14) >>> 0;
    this.s0h = (rh ^ s1h ^ shh) >>> 0;
    this.s0l = (rl ^ s1l ^ shl) >>> 0;
    // rotl(s1, 36) = swap halves then rotl 4
    this.s1h = ((s1l << 4) | (s1h >>> 28)) >>> 0;
    this.s1l = ((s1h << 4) | (s1l >>> 28)) >>> 0;
  }

  /** next() % d for a 64-bit next() and a 32-bit unsigned d */
  private mod64(d: number): number {
    if (d < 2097152) return ((this.rh % d) * TWO32 + this.rl) % d;
    return Number(((BigInt(this.rh) << 32n) | BigInt(this.rl)) % BigInt(d));
  }

  /** gen(): next() & 0x7FFFFFFF */
  gen(): number {
    this.next();
    return this.rl & 0x7FFFFFFF;
  }

  /** operator()(): next() & 0xFFFFFFFF, as unsigned */
  call(): number {
    this.next();
    return this.rl;
  }

  between(lower: number, upper: number): number {
    this.next();
    const r = this.rl;
    const range = ((upper >>> 0) - (lower >>> 0) + 1) >>> 0;
    return ((r % (range === 0 ? TWO32 : range)) | 0) + lower | 0;
  }

  chance(numerator: number, denominator: number): boolean {
    if (numerator < 0) return false;
    this.next();
    return this.mod64(denominator >>> 0) < (numerator >>> 0);
  }

  uniform01(): number {
    this.next();
    return f(f(this.rl) / f(4294967295));
  }

  uniform01Double(): number {
    this.next();
    return Number((BigInt(this.rh) << 32n) | BigInt(this.rl)) / 18446744073709551615;
  }
}
