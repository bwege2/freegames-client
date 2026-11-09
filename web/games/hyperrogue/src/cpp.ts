// C++ semantics the line-by-line port needs (see PORTING.md, "Integers" and "Floating point").
// A leaf module: imports nothing.

/** int / int (truncating), as C++ */
export function idiv(a: number, b: number): number {
  return Math.trunc(a / b) | 0;
}

/** wrap to int32 (after + - of ints that may overflow; use Math.imul for *) */
export function i32(x: number): number {
  return x | 0;
}

/** wrap to uint32 */
export function u32(x: number): number {
  return x >>> 0;
}

/** wrap to a signed char / short (stores into char/short variables and fields) */
export function i8(x: number): number {
  return (x << 24) >> 24;
}
export function u8(x: number): number {
  return x & 0xFF;
}
export function i16(x: number): number {
  return (x << 16) >> 16;
}
export function u16(x: number): number {
  return x & 0xFFFF;
}

/** (int) of a double: truncation toward zero, wrapped like the x86 cvttsd2si for |x| < 2^31 */
export function itrunc(x: number): number {
  return Math.trunc(x) | 0;
}

/** C++ float (binary32): every store into a float variable or field rounds */
export const fround = Math.fround;

/** C/C++ round(): halves away from zero (Math.round rounds -0.5 to -0) */
export function cround(x: number): number {
  return x < 0 ? -Math.round(-x) : Math.round(x);
}

/** an out-parameter or reference to a scalar (int& x, int *x): pass { v: x } */
export interface Ref<T> { v: T; }

/** dynamicval<T> (hyper.h): set a value for the duration of a scope; restore() in a finally block.
 *  `dynamicval<int> g(x, 1); ...` -> `const g = dynamicval(() => G.x, (v) => { G.x = v; }, 1); try { ... } finally { g.restore(); }` */
export function dynamicval<T>(get: () => T, set: (v: T) => void, val?: T): { restore(): void } {
  const backup = get();
  if (arguments.length > 2) set(val as T);
  return { restore() { set(backup); } };
}

/** the keys of a Map/Set in std::map / std::set order: numbers ascending, cells/heptagons by creation serial */
export function sortedKeys<K>(m: Map<K, unknown> | Set<K>): K[] {
  const ks = [...m.keys()];
  ks.sort((a, b) => {
    const x = typeof a === 'number' ? a : (a as unknown as { _id: number })._id;
    const y = typeof b === 'number' ? b : (b as unknown as { _id: number })._id;
    return x - y;
  });
  return ks;
}

// --- std::sort as libstdc++ implements it (introsort + final insertion sort, threshold 16) ---
// std::sort is not stable: where the original sorts with ties (complex.cpp hive bugtomove), the order of equal
// elements is that of this exact algorithm. Use std_sort for every std::sort; for std::stable_sort,
// Array.prototype.sort (stable) with a comparator built from `less` is exact.

const S_THRESHOLD = 16;

/** std::sort(a.begin() + first, a.begin() + last, less) */
export function std_sort<T>(a: T[], less: (x: T, y: T) => boolean, first = 0, last = a.length): void {
  if (last - first > 1) {
    introsort_loop(a, first, last, Math.floor(Math.log2(last - first)) * 2, less);
    final_insertion_sort(a, first, last, less);
  }
}

function swap<T>(a: T[], i: number, j: number): void { const t = a[i]; a[i] = a[j]; a[j] = t; }

function introsort_loop<T>(a: T[], first: number, last: number, depth: number, less: (x: T, y: T) => boolean): void {
  while (last - first > S_THRESHOLD) {
    if (depth === 0) {
      heap_sort(a, first, last, less);
      return;
    }
    --depth;
    const cut = unguarded_partition_pivot(a, first, last, less);
    introsort_loop(a, cut, last, depth, less);
    last = cut;
  }
}

function move_median_to_first<T>(a: T[], result: number, x: number, y: number, z: number, less: (p: T, q: T) => boolean): void {
  if (less(a[x], a[y])) {
    if (less(a[y], a[z])) swap(a, result, y);
    else if (less(a[x], a[z])) swap(a, result, z);
    else swap(a, result, x);
  }
  else if (less(a[x], a[z])) swap(a, result, x);
  else if (less(a[y], a[z])) swap(a, result, z);
  else swap(a, result, y);
}

function unguarded_partition<T>(a: T[], first: number, last: number, pivot: number, less: (x: T, y: T) => boolean): number {
  for (;;) {
    while (less(a[first], a[pivot])) ++first;
    --last;
    while (less(a[pivot], a[last])) --last;
    if (!(first < last)) return first;
    swap(a, first, last);
    ++first;
  }
}

function unguarded_partition_pivot<T>(a: T[], first: number, last: number, less: (x: T, y: T) => boolean): number {
  const mid = first + Math.floor((last - first) / 2);
  move_median_to_first(a, first, first + 1, mid, last - 1, less);
  return unguarded_partition(a, first + 1, last, first, less);
}

function unguarded_linear_insert<T>(a: T[], last: number, less: (x: T, y: T) => boolean): void {
  const val = a[last];
  let next = last - 1;
  while (less(val, a[next])) { a[last] = a[next]; last = next; --next; }
  a[last] = val;
}

function insertion_sort<T>(a: T[], first: number, last: number, less: (x: T, y: T) => boolean): void {
  if (first === last) return;
  for (let i = first + 1; i !== last; ++i) {
    if (less(a[i], a[first])) {
      const val = a[i];
      for (let k = i; k > first; k--) a[k] = a[k - 1];
      a[first] = val;
    }
    else unguarded_linear_insert(a, i, less);
  }
}

function final_insertion_sort<T>(a: T[], first: number, last: number, less: (x: T, y: T) => boolean): void {
  if (last - first > S_THRESHOLD) {
    insertion_sort(a, first, first + S_THRESHOLD, less);
    for (let i = first + S_THRESHOLD; i !== last; ++i) unguarded_linear_insert(a, i, less);
  }
  else insertion_sort(a, first, last, less);
}

function push_heap<T>(a: T[], first: number, hole: number, top: number, value: T, less: (x: T, y: T) => boolean): void {
  let parent = Math.floor((hole - 1) / 2);
  while (hole > top && less(a[first + parent], value)) {
    a[first + hole] = a[first + parent];
    hole = parent;
    parent = Math.floor((hole - 1) / 2);
  }
  a[first + hole] = value;
}

function adjust_heap<T>(a: T[], first: number, hole: number, len: number, value: T, less: (x: T, y: T) => boolean): void {
  const top = hole;
  let second = hole;
  while (second < Math.floor((len - 1) / 2)) {
    second = 2 * (second + 1);
    if (less(a[first + second], a[first + second - 1])) second--;
    a[first + hole] = a[first + second];
    hole = second;
  }
  if ((len & 1) === 0 && second === Math.floor((len - 2) / 2)) {
    second = 2 * (second + 1);
    a[first + hole] = a[first + second - 1];
    hole = second - 1;
  }
  push_heap(a, first, hole, top, value, less);
}

function heap_sort<T>(a: T[], first: number, last: number, less: (x: T, y: T) => boolean): void {
  // __partial_sort(first, last, last): make_heap, then sort_heap
  const len = last - first;
  if (len >= 2) {
    let parent = Math.floor((len - 2) / 2);
    for (;;) {
      adjust_heap(a, first, parent, len, a[first + parent], less);
      if (parent === 0) break;
      parent--;
    }
  }
  while (last - first > 1) {
    --last;
    const value = a[last];
    a[last] = a[first];
    adjust_heap(a, first, 0, last - first, value, less);
  }
}

/** printf-style %d / %.17g / %x helpers used by dumps and by hprint.ts */
export function fmtG17(x: number): string {
  return fmtG(x, 17);
}

/** C printf %.<p>g, as glibc prints it: the exact decimal value of the double rounded to p significant digits,
 *  ties to even (JS toExponential / toFixed round exact ties up: %.9g of 6696.328125 is "6696.32812") */
export function fmtG(x: number, p: number): string {
  if (!isFinite(x)) return isNaN(x) ? 'nan' : (x < 0 ? '-inf' : 'inf');
  if (x === 0) return (Object.is(x, -0) ? '-0' : '0');
  if (p === 0) p = 1;
  const neg = x < 0;
  // |x| = M * 2^E exactly, as D * 10^K with an integer D
  const dv = new DataView(new ArrayBuffer(8));
  dv.setFloat64(0, Math.abs(x));
  const hi = dv.getUint32(0), lo = dv.getUint32(4);
  const bexp = hi >>> 20;
  let M = (BigInt(hi & 0xFFFFF) << 32n) | BigInt(lo);
  let E: number;
  if (bexp === 0) E = -1074;
  else { M |= 1n << 52n; E = bexp - 1075; }
  let D: bigint, K: number;
  if (E >= 0) { D = M << BigInt(E); K = 0; }
  else { D = M * 5n ** BigInt(-E); K = E; }
  // round D to p significant digits, half to even
  let ds = D.toString();
  if (ds.length > p) {
    const cut = ds.length - p;
    const pow = 10n ** BigInt(cut);
    let q = D / pow;
    const r = D - q * pow;
    const half = pow / 2n;
    if (r > half || (r === half && (q & 1n) === 1n)) q++;
    K += cut;
    ds = q.toString();
    if (ds.length > p) { ds = ds.slice(0, p); K++; } // 999.. rounded up to 1000..
  }
  // value = ds * 10^K; decimal exponent of the first digit
  const exp = ds.length - 1 + K;
  const digits = ds.padEnd(p, '0');
  let s: string;
  if (exp < -4 || exp >= p) {
    let m = digits[0] + (p > 1 ? '.' + digits.slice(1) : '');
    if (m.includes('.')) m = m.replace(/0+$/, '').replace(/\.$/, '');
    s = m + 'e' + (exp < 0 ? '-' : '+') + String(Math.abs(exp)).padStart(2, '0');
  } else if (exp >= 0) {
    s = digits.slice(0, exp + 1) + (p > exp + 1 ? '.' + digits.slice(exp + 1) : '');
    if (s.includes('.')) s = s.replace(/0+$/, '').replace(/\.$/, '');
  } else {
    s = '0.' + '0'.repeat(-exp - 1) + digits;
    s = s.replace(/0+$/, '').replace(/\.$/, '');
  }
  return (neg ? '-' : '') + s;
}

/** C printf %.<p>f, exactly as glibc prints it: the exact decimal value of the double, rounded half to even
 *  (JS toFixed rounds exact ties up: 0.125 -> "0.13", glibc "0.12"); "-0.000" for negative values that round to
 *  zero. The SVG output (screenshot.cpp svg::coord, stylestr) prints with %.1f, %.2f, %.3f and %f. */
export function fmtF(x: number, p: number): string {
  if (!isFinite(x)) return isNaN(x) ? (Math.sign(x) < 0 ? '-nan' : 'nan') : (x < 0 ? '-inf' : 'inf');
  const neg = x < 0 || Object.is(x, -0);
  // |x| = M * 2^E exactly
  const dv = new DataView(new ArrayBuffer(8));
  dv.setFloat64(0, Math.abs(x));
  const hi = dv.getUint32(0), lo = dv.getUint32(4);
  const bexp = hi >>> 20;
  let M = (BigInt(hi & 0xFFFFF) << 32n) | BigInt(lo);
  let E: number;
  if (bexp === 0) E = -1074;
  else { M |= 1n << 52n; E = bexp - 1075; }
  let q = M * 10n ** BigInt(p);
  if (E >= 0) q <<= BigInt(E);
  else {
    const sh = BigInt(-E);
    const whole = q >> sh;
    const r = q - (whole << sh);
    const half = 1n << (sh - 1n);
    q = whole;
    if (r > half || (r === half && (whole & 1n) === 1n)) q++;
  }
  let s = q.toString();
  if (p > 0) {
    s = s.padStart(p + 1, '0');
    s = s.slice(0, s.length - p) + '.' + s.slice(s.length - p);
  }
  return (neg ? '-' : '') + s;
}

/** C time(NULL): seconds since the epoch. The oracle fixes it (harness.cpp HARNESS_TIME = 1767225600); the
 *  test interpreter sets `c_clock.now` to the same constant. */
export const c_clock = { now: (): number => Math.floor(Date.now() / 1000) };
export function time(): number { return c_clock.now(); }

// --- long double (x87 80-bit, 64-bit mantissa), added by stage 2 package D2 ---
// `ld` is double in 13.1o, but a few expressions are long double: polygons.cpp's `vector<long double> polydata`
// (bshape's `polydata[i] * shzoom` is computed in long double, then rounded to the double parameter of hpxy) and
// the user literal `x._deg` (hyperpoint.cpp: `deg * A_PI / 180` with `long double deg`, folded by g++ with correct
// 80-bit rounding at each step). The value is rounded twice: to 64 bits, then to 53 bits.

/** an exact binary value: (-1)^neg * n * 2^e / d */
interface xval { neg: boolean; n: bigint; e: number; d: bigint; }

function xval_of(x: number): xval {
  const dv = new DataView(new ArrayBuffer(8));
  dv.setFloat64(0, Math.abs(x));
  const hi = dv.getUint32(0), lo = dv.getUint32(4);
  const bexp = hi >>> 20;
  let n = (BigInt(hi & 0xFFFFF) << 32n) | BigInt(lo);
  let e: number;
  if (bexp === 0) e = -1074;
  else { n |= 1n << 52n; e = bexp - 1075; }
  return { neg: x < 0 || Object.is(x, -0), n, e, d: 1n };
}

function bitlen(n: bigint): number { return n === 0n ? 0 : n.toString(2).length; }

/** round an exact value to p significant bits, ties to even (normal range only) */
function xround(v: xval, p: number): xval {
  if (v.n === 0n) return { neg: v.neg, n: 0n, e: 0, d: 1n };
  // v = n * 2^e / d; choose k so that q = floor(n * 2^(e-k) / d) has exactly p bits
  let k = v.e + bitlen(v.n) - bitlen(v.d) - p;
  for (;;) {
    let num = v.n, den = v.d;
    const s = v.e - k;
    if (s >= 0) num <<= BigInt(s); else den <<= BigInt(-s);
    let q = num / den;
    const L = bitlen(q);
    if (L > p) { k++; continue; }
    if (L < p) { k--; continue; }
    const r2 = (num - q * den) * 2n;
    if (r2 > den || (r2 === den && (q & 1n) === 1n)) q++;
    if (bitlen(q) > p) { q >>= 1n; k++; }
    return { neg: v.neg, n: q, e: k, d: 1n };
  }
}

function xval_to_number(v: xval): number {
  const r = Number(v.n) * Math.pow(2, v.e);
  return v.neg ? -r : r;
}

/** (double)((long double)a * b): the product rounded to 64 bits, then to 53 */
export function ld_mul(a: number, b: number): number {
  if (a === 0 || b === 0 || !isFinite(a) || !isFinite(b)) return a * b;
  const x = xval_of(a), y = xval_of(b);
  const p = xround({ neg: x.neg !== y.neg, n: x.n * y.n, e: x.e + y.e, d: 1n }, 64);
  return xval_to_number(xround(p, 53));
}

/** `x._deg` (hyperpoint.cpp): (double)((long double)x * A_PI / 180), each step rounded to 64 bits */
export function ld_deg(x: number, A_PI: number): number {
  if (x === 0) return 0;
  const a = xval_of(x), b = xval_of(A_PI);
  const p = xround({ neg: a.neg !== b.neg, n: a.n * b.n, e: a.e + b.e, d: 1n }, 64);
  const q = xround({ neg: p.neg, n: p.n, e: p.e, d: 180n }, 64);
  return xval_to_number(xround(q, 53));
}

// --- glibc's sin and cos (added by stage 2 package D2) ---
// V8's Math.sin / Math.cos (fdlibm) differ from glibc's (the IBM Accurate Mathematical Library, < 0.55 ulp, in
// practice correctly rounded) in the last bit for about 3% of arguments, which shows in the shapes (polygons.cpp:
// sums of sines that cancel). c_sin / c_cos are correctly rounded: the argument is reduced with pi/2 in three
// parts and the series is evaluated in double-double arithmetic (~106 bits), so the result is the double nearest
// the exact value except for arguments within ~2^-100 of a rounding boundary.

/** double-double helpers: [hi, lo] with |lo| <= ulp(hi)/2 */
function dd_two_sum(a: number, b: number): [number, number] {
  const s = a + b, bb = s - a;
  return [s, (a - (s - bb)) + (b - bb)];
}
const DD_SPLIT = 134217729; // 2^27 + 1
function dd_two_prod(a: number, b: number): [number, number] {
  const p = a * b;
  let t = DD_SPLIT * a; const ah = t - (t - a), al = a - ah;
  t = DD_SPLIT * b; const bh = t - (t - b), bl = b - bh;
  return [p, ((ah * bh - p) + ah * bl + al * bh) + al * bl];
}
function dd_add(ah: number, al: number, bh: number, bl: number): [number, number] {
  let [s, e] = dd_two_sum(ah, bh);
  e += al + bl;
  const r = s + e;
  return [r, e - (r - s)];
}
function dd_mul(ah: number, al: number, bh: number, bl: number): [number, number] {
  let [p, e] = dd_two_prod(ah, bh);
  e += ah * bl + al * bh;
  const r = p + e;
  return [r, e - (r - p)];
}

/** 1/n! as double-double, n = 0..45 */
const DD_INVFACT: [number, number][] = ((): [number, number][] => {
  const r: [number, number][] = [];
  // n! exactly as BigInt, then 1/n! to ~110 bits
  let f = 1n;
  for (let n = 0; n <= 45; n++) {
    if (n > 0) f *= BigInt(n);
    // q = round(2^k / f) with 2^k / f in [2^120, 2^121)
    const k = 120 + f.toString(2).length;
    const q = (1n << BigInt(k)) / f;
    const hi = Number(q) * Math.pow(2, -k);
    // lo = (q - hi * 2^k) * 2^-k
    const hiInt = BigInt(Math.round(hi * Math.pow(2, k - 60))) << 60n; // hi has 53 bits, exact in this scale
    const lo = Number(q - hiInt) * Math.pow(2, -k);
    r.push([hi, lo]);
  }
  return r;
})();

/** reduce x to r in [-pi/4, pi/4] (double-double) and the quadrant n: x = n * pi/2 + r */
function dd_reduce(x: number): [number, number, number] {
  // pi/2 in parts of 33 bits (fdlibm's pio2_1, pio2_2, pio2_3) and the rest
  const pio2_1 = 1.57079632673412561417e+00, pio2_2 = 6.07710050630396597660e-11,
    pio2_3 = 2.02226624871116645580e-21, pio2_3t = 8.47842766036889956997e-32;
  if (Math.abs(x) <= 0.7853981633974483) return [x, 0, 0];
  const n = Math.round(x * 0.63661977236758134308);
  // x - n*pio2_1 is exact for |n| < 2^20 (n*pio2_1 has <= 53 bits and is close to x)
  let h = x - n * pio2_1, l = 0;
  [h, l] = dd_add(h, l, -(n * pio2_2), 0); // n*pio2_2 exact (33 + 20 bits)
  [h, l] = dd_add(h, l, -(n * pio2_3), 0);
  [h, l] = dd_add(h, l, -(n * pio2_3t), 0);
  return [h, l, ((n % 4) + 4) % 4];
}

/** sin (k = 0) or cos (k = 1) of a reduced argument r (double-double), |r| <= pi/4 */
function dd_sincos_series(rh: number, rl: number, k: number): [number, number] {
  const [r2h, r2l] = dd_mul(rh, rl, rh, rl);
  // sum_{j} (-1)^j r^(2j+1-k) / (2j+1-k)!, Horner in r^2
  const J = 20;
  let [sh, sl] = [0, 0];
  for (let j = J; j >= 0; j--) {
    const [fh, fl] = DD_INVFACT[2 * j + 1 - k];
    const sg = (j & 1) ? -1 : 1;
    [sh, sl] = dd_mul(sh, sl, r2h, r2l);
    [sh, sl] = dd_add(sh, sl, sg * fh, sg * fl);
  }
  if (k === 0) [sh, sl] = dd_mul(sh, sl, rh, rl);
  return [sh, sl];
}

/** glibc sin(x): correctly rounded */
function c_sin_uncached(x: number): number {
  if (!isFinite(x)) return NaN;
  if (x === 0) return x;
  if (Math.abs(x) > 1e6) return Math.sin(x); // not reached by the game; the reduction above is for |x| < 2^20 * pi/2
  const [rh, rl, q] = dd_reduce(x);
  const [h, l] = (q & 1) ? dd_sincos_series(rh, rl, 1) : dd_sincos_series(rh, rl, 0);
  const v = h + l;
  return (q & 2) ? -v : v;
}

/** glibc cos(x): correctly rounded */
function c_cos_uncached(x: number): number {
  if (!isFinite(x)) return NaN;
  if (Math.abs(x) > 1e6) return Math.cos(x);
  const [rh, rl, q] = dd_reduce(x);
  const [h, l] = (q & 1) ? dd_sincos_series(rh, rl, 0) : dd_sincos_series(rh, rl, 1);
  const v = h + l;
  return (q === 1 || q === 2) ? -v : v;
}

// --- glibc's exp, log, acosh, asinh, atanh, atan, atan2, cosh (added by stage 2 package D2) ---
// Measured against this machine's glibc (Decimal references at 60 digits, 3000 random arguments each): log, acosh,
// asinh, atanh and atan are correctly rounded (glibc 2.4x has CORE-MATH's), exp, sin, cos and atan2 differ from the
// correctly rounded value in about 0.1-0.2% of the arguments (glibc's own algorithms), sinh, tanh, expm1, log1p,
// cosh are fdlibm's (not correctly rounded). V8's Math.* are fdlibm's: they differ from glibc for 2-20% of the
// arguments of exp, log, cosh, acosh, atanh, atan2, ..., enough to change the last bit of the geometry constants
// (tessf, hexf). The oracle links glibc 2.44, whose sinh and cosh are correctly rounded too (CORE-MATH: the shape
// shBigCarpet3 shows it; the machine's 2.43 still has fdlibm's there). The c_* functions here are correctly
// rounded (double-double evaluation): they agree with the oracle's libm except where glibc itself is off (about
// 0.1% of the arguments of exp, log, sin, cos, atan, atan2 in the measurement above).

function dd_div(ah: number, al: number, bh: number, bl: number): [number, number] {
  const q1 = ah / bh;
  let [ph, pl] = dd_mul(q1, 0, bh, bl);
  let [rh, rl] = dd_add(ah, al, -ph, -pl);
  const q2 = rh / bh;
  [ph, pl] = dd_mul(q2, 0, bh, bl);
  [rh, rl] = dd_add(rh, rl, -ph, -pl);
  const q3 = rh / bh;
  let [qh, ql] = dd_two_sum(q1, q2);
  [qh, ql] = dd_add(qh, ql, q3, 0);
  return [qh, ql];
}

function dd_sqrt(ah: number, al: number): [number, number] {
  if (ah <= 0) return [Math.sqrt(ah), 0];
  const s = Math.sqrt(ah);
  const [ph, pl] = dd_two_prod(s, s);
  const [rh, rl] = dd_add(ah, al, -ph, -pl);
  const c = (rh + rl) / (2 * s);
  return dd_two_sum(s, c);
}

const LN2_H = 0.6931471805599453, LN2_L = 2.3190468138462996e-17, LN2_L2 = 5.707708438416212e-34;
const PI_H = 3.141592653589793, PI_L = 1.2246467991473532e-16;

/** e^x for |x| < 709 as double-double */
function dd_exp(x: number): [number, number] {
  const k = Math.round(x / LN2_H);
  // r = x - k ln2 (k ln2 in three parts; k*LN2_H is not exact, so use two_prod)
  let [rh, rl] = dd_two_prod(k, LN2_H);
  [rh, rl] = dd_add(x, 0, -rh, -rl);
  let [th, tl] = dd_two_prod(k, LN2_L);
  [rh, rl] = dd_add(rh, rl, -th, -tl);
  [rh, rl] = dd_add(rh, rl, -k * LN2_L2, 0);
  // Taylor series, |r| <= 0.35
  let [sh, sl] = [0, 0];
  for (let n = 27; n >= 0; n--) {
    [sh, sl] = dd_mul(sh, sl, rh, rl);
    const [fh, fl] = DD_INVFACT[n];
    [sh, sl] = dd_add(sh, sl, fh, fl);
  }
  // multiply by 2^k in two steps (2^k alone may overflow before the product)
  const k1 = Math.trunc(k / 2), k2 = k - k1;
  const s1 = Math.pow(2, k1), s2 = Math.pow(2, k2);
  [th, tl] = [sh * s1 * s2, sl * s1 * s2];
  return [th, tl];
}

/** log of a positive double-double (h, l) as double-double */
function dd_log(h: number, l: number): [number, number] {
  // h = m * 2^e with m in [sqrt(1/2), sqrt(2))
  let e = Math.floor(Math.log2(h));
  let m = h * Math.pow(2, -e), ml = l * Math.pow(2, -e);
  if (m < Math.SQRT1_2) { m *= 2; ml *= 2; e--; }
  else if (m >= Math.SQRT2) { m /= 2; ml /= 2; e++; }
  // log m = 2 atanh(s), s = (m - 1) / (m + 1)
  const [nh, nl] = dd_add(m - 1, 0, ml, 0); // m - 1 is exact (Sterbenz)
  const [d0h, d0l] = dd_two_sum(m, 1);
  const [dh, dl] = dd_add(d0h, d0l, ml, 0);
  const [s, sL] = dd_div(nh, nl, dh, dl);
  const [s2h, s2l] = dd_mul(s, sL, s, sL);
  let [ah, al] = [0, 0];
  for (let n = 61; n >= 1; n -= 2) {
    [ah, al] = dd_mul(ah, al, s2h, s2l);
    const [ih, il] = dd_div(1, 0, n, 0);
    [ah, al] = dd_add(ah, al, ih, il);
  }
  [ah, al] = dd_mul(ah, al, s, sL);
  [ah, al] = [2 * ah, 2 * al];
  // + e ln 2
  let [eh, el] = dd_two_prod(e, LN2_H);
  [eh, el] = dd_add(eh, el, e * LN2_L, e * LN2_L2);
  return dd_add(ah, al, eh, el);
}

/** glibc exp(x) */
function c_exp_uncached(x: number): number {
  if (isNaN(x)) return x;
  if (x > 709.782712893384) return Infinity;
  if (x < -745.2) return 0;
  if (x < -700 || Math.abs(x) < 1e-300) return Math.exp(x); // subnormal results, tiny arguments: not reached
  const [h, l] = dd_exp(x);
  return h + l;
}

/** glibc log(x) (correctly rounded) */
function c_log_uncached(x: number): number {
  if (isNaN(x) || x < 0) return NaN;
  if (x === 0) return -Infinity;
  if (!isFinite(x)) return x;
  if (x === 1) return 0;
  if (x < 1e-300) return Math.log(x); // subnormal arguments: not reached
  const [h, l] = dd_log(x, 0);
  return h + l;
}

/** glibc acosh(x) (correctly rounded) */
function c_acosh_uncached(x: number): number {
  if (isNaN(x) || x < 1) return NaN;
  if (x === 1) return 0;
  if (!isFinite(x) || x > 1e150) return Math.acosh(x);
  // log(x + sqrt((x-1)(x+1)))
  const [ph, pl] = dd_two_sum(x, 1);
  const [mh, ml] = dd_two_sum(x, -1);
  const [qh, ql] = dd_mul(ph, pl, mh, ml);
  const [rh, rl] = dd_sqrt(qh, ql);
  const [sh, sl] = dd_add(rh, rl, x, 0);
  if (x < 1.5) {
    // log(1 + t) with t = (x - 1) + sqrt(...): keep t's bits (log near 1)
    const [th, tl] = dd_add(rh, rl, mh, ml);
    const [ah, al] = dd_log1p_dd(th, tl);
    return ah + al;
  }
  const [h, l] = dd_log(sh, sl);
  return h + l;
}

/** log(1 + t) for a double-double t > -1, through atanh: s = t / (2 + t) */
function dd_log1p_dd(th: number, tl: number): [number, number] {
  if (Math.abs(th) > 0.4) { const [uh, ul] = dd_add(1, 0, th, tl); return dd_log(uh, ul); }
  const [dh, dl] = dd_add(2, 0, th, tl);
  const [s, sL] = dd_div(th, tl, dh, dl);
  const [s2h, s2l] = dd_mul(s, sL, s, sL);
  let [ah, al] = [0, 0];
  for (let n = 81; n >= 1; n -= 2) {
    [ah, al] = dd_mul(ah, al, s2h, s2l);
    const [ih, il] = dd_div(1, 0, n, 0);
    [ah, al] = dd_add(ah, al, ih, il);
  }
  [ah, al] = dd_mul(ah, al, s, sL);
  return [2 * ah, 2 * al];
}

/** glibc asinh(x) (correctly rounded) */
function c_asinh_uncached(x: number): number {
  if (isNaN(x) || !isFinite(x) || x === 0) return x;
  const a = Math.abs(x);
  if (a < 1e-150 || a > 1e150) return Math.asinh(x);
  // log(a + sqrt(a^2 + 1)) = log1p(a + a^2 / (1 + sqrt(a^2 + 1)))
  const [qh, ql] = dd_two_prod(a, a);
  const [ph, pl] = dd_add(qh, ql, 1, 0);
  const [rh, rl] = dd_sqrt(ph, pl);
  let res: [number, number];
  if (a < 0.5) {
    const [dh, dl] = dd_add(rh, rl, 1, 0);
    const [fh, fl] = dd_div(qh, ql, dh, dl);
    const [th, tl] = dd_add(fh, fl, a, 0);
    res = dd_log1p_dd(th, tl);
  }
  else {
    const [sh, sl] = dd_add(rh, rl, a, 0);
    res = dd_log(sh, sl);
  }
  const v = res[0] + res[1];
  return x < 0 ? -v : v;
}

/** glibc atanh(x) (correctly rounded) */
function c_atanh_uncached(x: number): number {
  if (isNaN(x)) return x;
  const a = Math.abs(x);
  if (a > 1) return NaN;
  if (a === 1) return x * Infinity;
  if (a < 1e-150) return x;
  // 0.5 log1p(2a / (1 - a))
  const [dh, dl] = dd_two_sum(1, -a);
  const [th, tl] = dd_div(2 * a, 0, dh, dl);
  const [h, l] = dd_log1p_dd(th, tl);
  const v = (h + l) / 2;
  return x < 0 ? -v : v;
}

/** atan of a double-double (h, l), |h| <= 1 */
function dd_atan_small(h: number, l: number): [number, number] {
  // halve the argument twice: atan(x) = 2 atan(x / (1 + sqrt(1 + x^2)))
  let [xh, xl] = [h, l];
  for (let k = 0; k < 3; k++) {
    const [qh, ql] = dd_mul(xh, xl, xh, xl);
    const [ph, pl] = dd_add(qh, ql, 1, 0);
    const [rh, rl] = dd_sqrt(ph, pl);
    const [dh, dl] = dd_add(rh, rl, 1, 0);
    [xh, xl] = dd_div(xh, xl, dh, dl);
  }
  const [x2h, x2l] = dd_mul(xh, xl, xh, xl);
  let [ah, al] = [0, 0];
  for (let n = 41; n >= 1; n -= 2) {
    [ah, al] = dd_mul(ah, al, x2h, x2l);
    const [ih, il] = dd_div((n & 2) ? -1 : 1, 0, n, 0);
    [ah, al] = dd_add(ah, al, ih, il);
  }
  [ah, al] = dd_mul(ah, al, xh, xl);
  return [8 * ah, 8 * al];
}

/** atan of a double-double, any size */
function dd_atan(h: number, l: number): [number, number] {
  if (Math.abs(h) <= 1) return dd_atan_small(h, l);
  const [ih, il] = dd_div(1, 0, h, l);
  const [ah, al] = dd_atan_small(ih, il);
  // sign(x) pi/2 - atan(1/x)
  const sg = h > 0 ? 1 : -1;
  return dd_add(sg * PI_H / 2, sg * PI_L / 2, -ah, -al);
}

/** glibc atan(x) (correctly rounded) */
function c_atan_uncached(x: number): number {
  if (isNaN(x) || x === 0) return x;
  if (!isFinite(x)) return Math.atan(x);
  const a = Math.abs(x);
  if (a < 1e-150 || a > 1e150) return Math.atan(x);
  const [h, l] = dd_atan(x, 0);
  return h + l;
}

/** glibc atan2(y, x) */
function c_atan2_uncached(y: number, x: number): number {
  if (isNaN(x) || isNaN(y) || !isFinite(x) || !isFinite(y) || x === 0 || y === 0) return Math.atan2(y, x);
  const ay = Math.abs(y), ax = Math.abs(x);
  if (ay / ax > 1e150 || ay / ax < 1e-150) return Math.atan2(y, x);
  const [qh, ql] = dd_div(ay, 0, ax, 0);
  let [h, l] = dd_atan(qh, ql);
  if (x < 0) [h, l] = dd_add(PI_H, PI_L, -h, -l);
  const v = h + l;
  return y < 0 ? -v : v;
}

/** e^x - 1 as double-double: the series for |x| < 0.5, else dd_exp(x) - 1 */
function dd_expm1(x: number): [number, number] {
  if (Math.abs(x) >= 0.5) { const [h, l] = dd_exp(x); return dd_add(h, l, -1, 0); }
  let [sh, sl] = [0, 0];
  for (let n = 30; n >= 1; n--) {
    [sh, sl] = dd_mul(sh, sl, x, 0);
    const [fh, fl] = DD_INVFACT[n];
    [sh, sl] = dd_add(sh, sl, fh, fl);
  }
  return dd_mul(sh, sl, x, 0);
}

/** sinh as double-double, |x| < 700 */
function dd_sinh(x: number): [number, number] {
  const ax = Math.abs(x);
  let h: number, l: number;
  if (ax < 0.5) {
    // x + x^3/3! + ...
    const [x2h, x2l] = dd_two_prod(ax, ax);
    let [sh, sl] = [0, 0];
    for (let n = 31; n >= 1; n -= 2) {
      [sh, sl] = dd_mul(sh, sl, x2h, x2l);
      const [fh, fl] = DD_INVFACT[n];
      [sh, sl] = dd_add(sh, sl, fh, fl);
    }
    [h, l] = dd_mul(sh, sl, ax, 0);
  }
  else {
    const [eh, el] = dd_exp(ax);
    const [ih, il] = dd_div(1, 0, eh, el);
    [h, l] = dd_add(eh, el, -ih, -il);
    h /= 2; l /= 2;
  }
  return x < 0 ? [-h, -l] : [h, l];
}

/** cosh as double-double, |x| < 700 */
function dd_cosh(x: number): [number, number] {
  const ax = Math.abs(x);
  const [eh, el] = dd_exp(ax);
  const [ih, il] = dd_div(1, 0, eh, el);
  const [h, l] = dd_add(eh, el, ih, il);
  return [h / 2, l / 2];
}

/** glibc cosh(x) (2.44: correctly rounded; the oracle's shapes show it) */
function c_cosh_uncached(x: number): number {
  if (isNaN(x)) return x;
  const ax = Math.abs(x);
  if (ax < 1e-150) return 1;
  if (ax > 700) return Math.cosh(x); // overflow range: not reached
  const [h, l] = dd_cosh(ax);
  return h + l;
}

/** glibc sinh(x) (correctly rounded) */
function c_sinh_uncached(x: number): number {
  if (isNaN(x) || x === 0) return x;
  const ax = Math.abs(x);
  if (ax < 1e-150 || ax > 700) return Math.sinh(x);
  const [h, l] = dd_sinh(x);
  return h + l;
}

/** glibc tanh(x) (correctly rounded) */
function c_tanh_uncached(x: number): number {
  if (isNaN(x) || x === 0) return x;
  const ax = Math.abs(x);
  if (ax < 1e-150) return x;
  if (ax > 40) return x > 0 ? 1 : -1;
  const [sh, sl] = dd_sinh(ax);
  const [ch, cl] = dd_cosh(ax);
  const [h, l] = dd_div(sh, sl, ch, cl);
  const v = h + l;
  return x < 0 ? -v : v;
}

/** glibc expm1(x) (correctly rounded) */
function c_expm1_uncached(x: number): number {
  if (isNaN(x) || x === 0) return x;
  if (Math.abs(x) < 1e-150 || x > 709 || x < -700) return Math.expm1(x);
  const [h, l] = dd_expm1(x);
  return h + l;
}

/** glibc log1p(x) (correctly rounded) */
function c_log1p_uncached(x: number): number {
  if (isNaN(x) || x === 0) return x;
  if (x < -1) return NaN;
  if (x === -1) return -Infinity;
  if (!isFinite(x) || Math.abs(x) < 1e-150 || x > 1e300) return Math.log1p(x);
  const [h, l] = dd_log1p_dd(x, 0);
  return h + l;
}

// --- caches of the c_* functions (performance; added after stage 2) ---
// The c_* functions are pure functions of their double arguments, and slow (double-double series). The renderer
// calls them with the same few arguments again and again (the same angles, levels and distances every frame), so
// each keeps a direct-mapped cache: a slot by a hash of the argument's bits, hit only when the stored argument is
// the same double (=== on non-zero, non-NaN numbers: the same bits; f(+0) and f(-0) are kept apart, NaN is not
// cached), so a cached result is the result the function returns for that argument: bit for bit the same output.
const memo_f64 = new Float64Array(2);
const memo_u32 = new Uint32Array(memo_f64.buffer);
const MEMO_BITS = 12;
function memo_slot(): number {
  return Math.imul(memo_u32[0] ^ Math.imul(memo_u32[1], 0x85EBCA6B) ^ Math.imul(memo_u32[2], 0xC2B2AE35) ^ memo_u32[3], 0x9E3779B1) >>> (32 - MEMO_BITS);
}
function memo1(f: (x: number) => number): (x: number) => number {
  const keys = new Float64Array(1 << MEMO_BITS).fill(NaN), vals = new Float64Array(1 << MEMO_BITS);
  // f(+0) and f(-0) (cos(0) is common: spin(0))
  const fp0 = f(0), fn0 = f(-0);
  return (x: number): number => {
    if (x === 0) return 1 / x > 0 ? fp0 : fn0;
    if (x !== x) return f(x);
    memo_f64[0] = x; memo_f64[1] = 0;
    const i = memo_slot();
    if (keys[i] === x) return vals[i];
    const v = f(x);
    keys[i] = x; vals[i] = v;
    return v;
  };
}
function memo2(f: (y: number, x: number) => number): (y: number, x: number) => number {
  const ky = new Float64Array(1 << MEMO_BITS).fill(NaN), kx = new Float64Array(1 << MEMO_BITS), vals = new Float64Array(1 << MEMO_BITS);
  return (y: number, x: number): number => {
    if (y === 0 || x === 0 || y !== y || x !== x) return f(y, x);
    memo_f64[0] = y; memo_f64[1] = x;
    const i = memo_slot();
    if (ky[i] === y && kx[i] === x) return vals[i];
    const v = f(y, x);
    ky[i] = y; kx[i] = x; vals[i] = v;
    return v;
  };
}
/** glibc sin(x), cached (c_sin_uncached) */
export const c_sin = memo1(c_sin_uncached);
/** glibc cos(x), cached (c_cos_uncached) */
export const c_cos = memo1(c_cos_uncached);
/** glibc exp(x), cached (c_exp_uncached) */
export const c_exp = memo1(c_exp_uncached);
/** glibc log(x), cached (c_log_uncached) */
export const c_log = memo1(c_log_uncached);
/** glibc acosh(x), cached (c_acosh_uncached) */
export const c_acosh = memo1(c_acosh_uncached);
/** glibc asinh(x), cached (c_asinh_uncached) */
export const c_asinh = memo1(c_asinh_uncached);
/** glibc atanh(x), cached (c_atanh_uncached) */
export const c_atanh = memo1(c_atanh_uncached);
/** glibc atan(x), cached (c_atan_uncached) */
export const c_atan = memo1(c_atan_uncached);
/** glibc cosh(x), cached (c_cosh_uncached) */
export const c_cosh = memo1(c_cosh_uncached);
/** glibc sinh(x), cached (c_sinh_uncached) */
export const c_sinh = memo1(c_sinh_uncached);
/** glibc tanh(x), cached (c_tanh_uncached) */
export const c_tanh = memo1(c_tanh_uncached);
/** glibc expm1(x), cached (c_expm1_uncached) */
export const c_expm1 = memo1(c_expm1_uncached);
/** glibc log1p(x), cached (c_log1p_uncached) */
export const c_log1p = memo1(c_log1p_uncached);
/** glibc atan2(y, x), cached (c_atan2_uncached) */
export const c_atan2 = memo2(c_atan2_uncached);
