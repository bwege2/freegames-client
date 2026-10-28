// Perl semantics the port needs to stay 1:1 with the original's arithmetic and list handling
// (fb_stuff.pm's MDK::Common extract, numeric conversions, sprintf).

/** Perl's % for integers: the operands are truncated, the result has the sign of the right operand */
export function pmod(a: number, b: number): number {
  a = Math.trunc(a); b = Math.trunc(b);
  const r = a % b;
  return r !== 0 && (r < 0) !== (b < 0) ? r + b : r + 0;
}
export const even = (n: number): boolean => pmod(n, 2) === 0;
export const odd = (n: number): boolean => pmod(n, 2) === 1;
export const sqr = (n: number): number => n * n;
/** Perl's int() */
export const int = (n: number): number => (Number.isFinite(n) ? Math.trunc(n) : 0);
/** odd() as a number (Perl's true is 1 and false is "" which is 0 in arithmetic) */
export const oddn = (n: number): number => (odd(n) ? 1 : 0);
export const evenn = (n: number): number => (even(n) ? 1 : 0);

export function member<T>(e: T, list: readonly T[]): boolean {
  for (const x of list) if (x === e) return true;
  return false;
}

/** difference2(a, b): the elements of a not in b, in a's order */
export function difference2<T>(a: readonly T[], b: readonly T[]): T[] {
  const s = new Set(b);
  return a.filter((x) => !s.has(x));
}

/** fastuniq: Perl returns `values %l`, in hash order, which Perl leaves unspecified (random per
 *  process); the oracle and the port both use the order of first occurrence (re/frozenbubble/NOTES.md) */
export function fastuniq<T>(list: readonly T[]): T[] {
  return [...new Set(list)];
}

export const any = <T>(l: readonly T[], f: (x: T) => unknown): boolean => l.some((x) => !!f(x));
export const every = <T>(l: readonly T[], f: (x: T) => unknown): boolean => l.every((x) => !!f(x));

/** Perl's string form of a number (%.15g) */
export function pstr(n: number | string | undefined | null): string {
  if (n === undefined || n === null) return '';
  if (typeof n === 'string') return n;
  if (Number.isInteger(n) && Math.abs(n) < 1e15) return String(n);
  if (!Number.isFinite(n)) return n > 0 ? 'Inf' : n < 0 ? '-Inf' : 'NaN';
  let s = n.toPrecision(15);
  if (s.includes('e')) {
    let [m, e] = s.split('e');
    if (m.includes('.')) m = m.replace(/0+$/, '').replace(/\.$/, '');
    const ex = Number(e);
    return `${m}e${ex < 0 ? '-' : '+'}${String(Math.abs(ex)).padStart(2, '0')}`;
  }
  if (s.includes('.')) s = s.replace(/0+$/, '').replace(/\.$/, '');
  return s;
}

/** Perl's numeric value of a string (leading number, else 0) */
export function pnum(v: string | number | undefined | null): number {
  if (typeof v === 'number') return v;
  if (v === undefined || v === null) return 0;
  const m = /^\s*([+-]?(?:\d+\.?\d*(?:[eE][+-]?\d+)?|\.\d+(?:[eE][+-]?\d+)?))/.exec(v);
  return m ? Number(m[1]) : 0;
}

/** printf's %.<d>f: the exact binary value rounded to d decimals, ties to even (glibc) */
export function fixed(x: number, d: number): string {
  if (!Number.isFinite(x)) return x > 0 ? 'inf' : x < 0 ? '-inf' : 'nan';
  const neg = x < 0 || Object.is(x, -0);
  x = Math.abs(x);
  // exact value = m * 2^e
  const buf = new DataView(new ArrayBuffer(8));
  buf.setFloat64(0, x);
  const hi = buf.getUint32(0), lo = buf.getUint32(4);
  const expBits = (hi >>> 20) & 0x7ff;
  let mant = (BigInt(hi & 0xfffff) << 32n) | BigInt(lo);
  let e: number;
  if (expBits === 0) e = -1074; else { mant |= 1n << 52n; e = expBits - 1075; }
  // value * 10^d = mant * 2^e * 10^d; integer part and remainder
  let num = mant * 10n ** BigInt(d);
  let den = 1n;
  if (e >= 0) num <<= BigInt(e); else den <<= BigInt(-e);
  let q = num / den;
  const r = num % den;
  const twice = r * 2n;
  if (twice > den || (twice === den && (q & 1n) === 1n)) q += 1n;
  let s = q.toString();
  if (d > 0) {
    s = s.padStart(d + 1, '0');
    s = `${s.slice(0, s.length - d)}.${s.slice(s.length - d)}`;
  }
  return (neg && /[1-9]/.test(s) ? '-' : neg ? '-' : '') + s;
}

/** sprintf('%02d') and friends used by the original */
export function pad2(n: number): string {
  const v = Math.trunc(n);
  return v < 0 ? `-${String(-v).padStart(1, '0')}` : String(v).padStart(2, '0');
}

/** printf's %.17g */
export function g17(v: number): string {
  if (!Number.isFinite(v)) return v > 0 ? 'inf' : v < 0 ? '-inf' : 'nan';
  if (v === 0) return Object.is(v, -0) ? '-0' : '0';
  const [m0, ex] = v.toExponential(16).split('e');
  const exp = Number(ex);
  if (exp < -4 || exp >= 17) {
    let m = m0;
    if (m.includes('.')) m = m.replace(/0+$/, '').replace(/\.$/, '');
    return `${m}e${exp < 0 ? '-' : '+'}${String(Math.abs(exp)).padStart(2, '0')}`;
  }
  let s = v.toFixed(Math.max(0, 16 - exp));
  if (s.includes('.')) s = s.replace(/0+$/, '').replace(/\.$/, '');
  return s;
}
