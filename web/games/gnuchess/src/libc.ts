// What the C/C++ code of GNU Chess takes from libc, with C's semantics: printf-style formatting for the
// conversions the sources use, the C-locale <ctype.h> classes, atoi/atof/strtol, the parts of sscanf they
// use, and glibc's rand()/srand(). Strings are byte strings (one char per byte, codes 0..255), as the C
// program sees its files and its terminal.

export const INT_MAX = 2147483647;
export const INT_MIN = -2147483648;
export const RAND_MAX = 2147483647;

export const isdigit = (c: string | undefined): boolean => c !== undefined && c >= '0' && c <= '9';
export const isalpha = (c: string | undefined): boolean =>
  c !== undefined && ((c >= 'A' && c <= 'Z') || (c >= 'a' && c <= 'z'));
export const isalnum = (c: string | undefined): boolean => isdigit(c) || isalpha(c);
export const isupper = (c: string | undefined): boolean => c !== undefined && c >= 'A' && c <= 'Z';
export const islower = (c: string | undefined): boolean => c !== undefined && c >= 'a' && c <= 'z';
export const isspace = (c: string | undefined): boolean =>
  c === ' ' || c === '\t' || c === '\n' || c === '\v' || c === '\f' || c === '\r';
export const toupper = (c: string): string => (c >= 'a' && c <= 'z' ? String.fromCharCode(c.charCodeAt(0) - 32) : c);
export const tolower = (c: string): string => (c >= 'A' && c <= 'Z' ? String.fromCharCode(c.charCodeAt(0) + 32) : c);

/** the char at i, or '\0' past the end (C strings end with NUL) */
export const at = (s: string, i: number): string => (i < s.length ? s[i] : '\0');

/** int arithmetic that wraps like the machine (two's complement, 32 bits) */
export const i32 = (n: number): number => n | 0;
export const u32 = (n: number): number => n >>> 0;
/** C's (int)x for a double: truncation toward zero, wrapped to 32 bits like x86 cvttsd2si does for small values */
export const dtoi = (x: number): number => (Number.isFinite(x) ? Math.trunc(x) | 0 : INT_MIN);

/** strtol(s, &end, 10) for an int: optional spaces and sign, then digits; saturates at INT_MIN/INT_MAX like strtol on a 32-bit long would not, so callers that need long semantics use strtoll */
export function strtol(s: string, start = 0): { value: number; end: number } {
  let i = start;
  while (isspace(s[i])) i++;
  let neg = false;
  if (s[i] === '+' || s[i] === '-') neg = s[i++] === '-';
  if (!isdigit(s[i])) return { value: 0, end: start };
  let v = 0n;
  while (isdigit(s[i])) v = v * 10n + BigInt(s.charCodeAt(i++) - 48);
  if (neg) v = -v;
  const LMAX = 9223372036854775807n, LMIN = -9223372036854775808n;
  if (v > LMAX) v = LMAX;
  if (v < LMIN) v = LMIN;
  return { value: Number(v), end: i };
}

/** strtoll as a bigint (sint64), saturating like glibc */
export function strtoll(s: string, start = 0): { value: bigint; end: number } {
  let i = start;
  while (isspace(s[i])) i++;
  let neg = false;
  if (s[i] === '+' || s[i] === '-') neg = s[i++] === '-';
  if (!isdigit(s[i])) return { value: 0n, end: start };
  let v = 0n;
  while (isdigit(s[i])) v = v * 10n + BigInt(s.charCodeAt(i++) - 48);
  if (neg) v = -v;
  const LMAX = 9223372036854775807n, LMIN = -9223372036854775808n;
  if (v > LMAX) v = LMAX;
  if (v < LMIN) v = LMIN;
  return { value: v, end: i };
}

/** atoi(): (int) strtol(s, NULL, 10) on an LP64 machine: the long result truncated to 32 bits */
export function atoi(s: string): number {
  const { value } = strtoll(s);
  return Number(BigInt.asIntN(32, value));
}

/** strtod / atof for the decimal forms the sources read (sign, digits, '.', exponent; inf/nan) */
export function strtod(s: string, start = 0): { value: number; end: number } {
  let i = start;
  while (isspace(s[i])) i++;
  const m = /^[+-]?(?:(?:\d+\.?\d*|\.\d+)(?:[eE][+-]?\d+)?|inf(?:inity)?|nan)/i.exec(s.slice(i));
  if (!m) return { value: 0, end: start };
  let t = m[0];
  const end = i + t.length;
  const neg = t[0] === '-';
  if (t[0] === '+' || t[0] === '-') t = t.slice(1);
  let v: number;
  if (/^inf/i.test(t)) v = Infinity;
  else if (/^nan/i.test(t)) v = NaN;
  else v = Number(t.endsWith('.') ? t.slice(0, -1) : t);
  return { value: neg ? -v : v, end };
}
export const atof = (s: string): number => strtod(s).value;

/** float(x): rounds a double to single precision, as storing into a C float does */
export const f32 = (x: number): number => Math.fround(x);

// -------------------------------------------------------------------------------------------------
// printf

/** the exact decimal digits of x rounded to prec decimals, round-half-even like glibc */
function fixedDigits(x: number, prec: number): string {
  // x is finite and >= 0. x = mant * 2^exp exactly.
  if (x === 0) return prec > 0 ? '0.' + '0'.repeat(prec) : '0';
  const buf = new DataView(new ArrayBuffer(8));
  buf.setFloat64(0, x);
  const hi = buf.getUint32(0), lo = buf.getUint32(4);
  const bexp = (hi >>> 20) & 0x7ff;
  let mant = (BigInt(hi & 0xfffff) << 32n) | BigInt(lo);
  let exp: number;
  if (bexp === 0) exp = -1074;
  else {
    mant |= 1n << 52n;
    exp = bexp - 1075;
  }
  const scale = 10n ** BigInt(prec);
  let q: bigint;
  if (exp >= 0) q = (mant << BigInt(exp)) * scale;
  else {
    const num = mant * scale;
    const sh = BigInt(-exp);
    q = num >> sh;
    const r = num - (q << sh);
    const half = 1n << (sh - 1n);
    if (r > half || (r === half && (q & 1n) === 1n)) q += 1n;
  }
  let s = q.toString();
  if (prec === 0) return s;
  if (s.length <= prec) s = '0'.repeat(prec - s.length + 1) + s;
  return s.slice(0, s.length - prec) + '.' + s.slice(s.length - prec);
}

/** %e digits: d.ddde[+-]xx, round-half-even on the exact value */
function expDigits(x: number, prec: number, upper: boolean): string {
  if (x === 0) return (prec > 0 ? '0.' + '0'.repeat(prec) : '0') + (upper ? 'E+00' : 'e+00');
  let e = Math.floor(Math.log10(x));
  // find e with 10^e <= x < 10^(e+1) after rounding to prec+1 significant digits
  for (let tries = 0; tries < 3; tries++) {
    const digits = sigDigits(x, prec + 1, e);
    if (digits.length > prec + 1) { e++; continue; }
    if (digits.length < prec + 1) { e--; continue; }
    const mant = prec > 0 ? digits[0] + '.' + digits.slice(1) : digits;
    const ee = Math.abs(e);
    return mant + (upper ? 'E' : 'e') + (e < 0 ? '-' : '+') + (ee < 10 ? '0' + ee : String(ee));
  }
  return x.toExponential(prec);
}

/** round x / 10^(e-n+1) to an integer (round-half-even, exact), as a digit string */
function sigDigits(x: number, n: number, e: number): string {
  const p = n - 1 - e; // x * 10^p rounded
  if (p >= 0) {
    const s = fixedDigits(x, p).replace('.', '');
    return s.replace(/^0+/, '') || '0';
  }
  // scale down: exact rational x / 10^-p
  const buf = new DataView(new ArrayBuffer(8));
  buf.setFloat64(0, x);
  const hi = buf.getUint32(0), lo = buf.getUint32(4);
  const bexp = (hi >>> 20) & 0x7ff;
  let mant = (BigInt(hi & 0xfffff) << 32n) | BigInt(lo);
  let exp: number;
  if (bexp === 0) exp = -1074;
  else {
    mant |= 1n << 52n;
    exp = bexp - 1075;
  }
  let num = mant, den = 10n ** BigInt(-p);
  if (exp >= 0) num <<= BigInt(exp);
  else den <<= BigInt(-exp);
  let q = num / den;
  const r = num - q * den;
  if (2n * r > den || (2n * r === den && (q & 1n) === 1n)) q += 1n;
  return q.toString();
}

function gFormat(x: number, prec: number, alt: boolean, upper: boolean): string {
  if (prec === 0) prec = 1;
  if (x === 0) return '0';
  // exponent X of %e with precision prec-1
  const es = expDigits(x, prec - 1, false);
  const X = parseInt(es.slice(es.indexOf('e') + 1), 10);
  let s: string;
  if (prec > X && X >= -4) s = fixedDigits(x, prec - 1 - X);
  else s = expDigits(x, prec - 1, upper);
  if (!alt) {
    const ei = s.search(/[eE]/);
    let m = ei >= 0 ? s.slice(0, ei) : s;
    const tail = ei >= 0 ? s.slice(ei) : '';
    if (m.includes('.')) m = m.replace(/0+$/, '').replace(/\.$/, '');
    s = m + tail;
  }
  return s;
}

export type Arg = string | number | bigint | null;

/**
 * sprintf with the conversions the GNU Chess sources use: d i u o x X c s f e g % with the flags
 * '-' '+' ' ' '0' '#', a width and a precision (or *), and the length modifiers h l ll (ignored: numbers
 * are numbers or bigints and are printed as given). %c takes a char code or a one-char string.
 */
export function sprintf(fmt: string, ...args: Arg[]): string {
  let out = '';
  let a = 0;
  for (let i = 0; i < fmt.length; i++) {
    const ch = fmt[i];
    if (ch !== '%') {
      out += ch;
      continue;
    }
    i++;
    let left = false, zero = false, plus = false, space = false, alt = false;
    for (; ; i++) {
      const f = fmt[i];
      if (f === '-') left = true;
      else if (f === '0') zero = true;
      else if (f === '+') plus = true;
      else if (f === ' ') space = true;
      else if (f === '#') alt = true;
      else break;
    }
    let width = 0;
    if (fmt[i] === '*') {
      width = Number(args[a++]);
      if (width < 0) {
        left = true;
        width = -width;
      }
      i++;
    } else while (isdigit(fmt[i])) width = width * 10 + (fmt.charCodeAt(i++) - 48);
    let prec = -1;
    if (fmt[i] === '.') {
      i++;
      prec = 0;
      if (fmt[i] === '*') {
        prec = Number(args[a++]);
        if (prec < 0) prec = -1;
        i++;
      } else while (isdigit(fmt[i])) prec = prec * 10 + (fmt.charCodeAt(i++) - 48);
    }
    while (fmt[i] === 'l' || fmt[i] === 'h' || fmt[i] === 'L' || fmt[i] === 'q' || fmt[i] === 'j' || fmt[i] === 'z') i++;
    const conv = fmt[i];
    let s: string;
    let sign = '';
    let numeric = false;
    switch (conv) {
      case '%':
        out += '%';
        continue;
      case 'd':
      case 'i': {
        const raw = args[a++];
        const v = typeof raw === 'bigint' ? raw : BigInt(Math.trunc(Number(raw ?? 0)));
        s = (v < 0n ? -v : v).toString();
        if (prec >= 0) s = prec === 0 && v === 0n ? '' : s.padStart(prec, '0');
        sign = v < 0n ? '-' : plus ? '+' : space ? ' ' : '';
        numeric = prec < 0;
        break;
      }
      case 'u':
      case 'o':
      case 'x':
      case 'X': {
        let v = BigInt(args[a++] as number | bigint);
        if (v < 0n) v = BigInt.asUintN(typeof args[a - 1] === 'bigint' ? 64 : 32, v);
        s = v.toString(conv === 'u' ? 10 : conv === 'o' ? 8 : 16);
        if (conv === 'X') s = s.toUpperCase();
        if (prec >= 0) s = prec === 0 && v === 0n ? '' : s.padStart(prec, '0');
        if (alt && v !== 0n) {
          if (conv === 'x') sign = '0x';
          else if (conv === 'X') sign = '0X';
          else if (conv === 'o' && s[0] !== '0') s = '0' + s;
        }
        numeric = prec < 0;
        break;
      }
      case 'c': {
        const v = args[a++];
        s = typeof v === 'string' ? v.slice(0, 1) : String.fromCharCode(Number(v) & 255);
        break;
      }
      case 's': {
        const v = args[a++];
        s = v === null ? '(null)' : String(v);
        if (prec >= 0) s = s.slice(0, prec);
        break;
      }
      case 'f':
      case 'F':
      case 'e':
      case 'E':
      case 'g':
      case 'G': {
        const x = Number(args[a++]);
        const p = prec < 0 ? 6 : prec;
        const neg = x < 0 || Object.is(x, -0);
        const ax = Math.abs(x);
        if (!Number.isFinite(ax)) s = Number.isNaN(ax) ? 'nan' : 'inf';
        else if (conv === 'f' || conv === 'F') s = fixedDigits(ax, p);
        else if (conv === 'e' || conv === 'E') s = expDigits(ax, p, conv === 'E');
        else s = gFormat(ax, p, alt, conv === 'G');
        if (alt && p === 0 && (conv === 'f' || conv === 'F') && Number.isFinite(ax)) s += '.';
        if (conv === 'F' || conv === 'E' || conv === 'G') s = s.toUpperCase();
        sign = neg ? '-' : plus ? '+' : space ? ' ' : '';
        numeric = Number.isFinite(ax);
        break;
      }
      default:
        s = '';
        break;
    }
    const len = sign.length + s.length;
    if (len >= width) out += sign + s;
    else if (left) out += sign + s + ' '.repeat(width - len);
    else if (zero && numeric) out += sign + '0'.repeat(width - len) + s;
    else out += ' '.repeat(width - len) + sign + s;
  }
  return out;
}

// -------------------------------------------------------------------------------------------------
// sscanf, for the directives the sources use: %d %ld %lld %f %s %c (with widths), literal characters
// and whitespace. Returns the converted values; its length is sscanf's return value (an empty
// input before the first conversion gives -1 in C; callers that care check `eof`).

export interface ScanResult {
  values: (number | bigint | string)[];
  /** C's return value: the number of conversions, or -1 (EOF) if the input ended before the first one */
  count: number;
}

export function sscanf(input: string, fmt: string): ScanResult {
  const values: (number | bigint | string)[] = [];
  let i = 0;
  let f = 0;
  let failed = false;
  while (f < fmt.length && !failed) {
    const c = fmt[f];
    if (isspace(c)) {
      while (isspace(fmt[f])) f++;
      while (isspace(input[i])) i++;
      continue;
    }
    if (c !== '%') {
      if (i >= input.length) {
        if (values.length === 0) return { values, count: -1 };
        break;
      }
      if (input[i] !== c) break;
      i++;
      f++;
      continue;
    }
    f++;
    if (fmt[f] === '%') {
      while (isspace(input[i])) i++;
      if (input[i] !== '%') break;
      i++;
      f++;
      continue;
    }
    let suppress = false;
    if (fmt[f] === '*') {
      suppress = true;
      f++;
    }
    let width = 0;
    while (isdigit(fmt[f])) width = width * 10 + (fmt.charCodeAt(f++) - 48);
    let longs = 0;
    while (fmt[f] === 'l' || fmt[f] === 'h') {
      if (fmt[f] === 'l') longs++;
      f++;
    }
    const conv = fmt[f++];
    if (conv !== 'c') while (isspace(input[i])) i++;
    if (i >= input.length) {
      if (values.length === 0) return { values, count: -1 };
      break;
    }
    const lim = width > 0 ? Math.min(input.length, i + width) : input.length;
    switch (conv) {
      case 'd':
      case 'u': {
        let j = i;
        if (j < lim && (input[j] === '+' || input[j] === '-')) j++;
        if (j >= lim || !isdigit(input[j])) {
          failed = true;
          break;
        }
        while (j < lim && isdigit(input[j])) j++;
        const { value } = strtoll(input.slice(i, j));
        i = j;
        if (!suppress) values.push(longs >= 2 ? BigInt.asIntN(64, value) : longs === 1 ? Number(BigInt.asIntN(64, value)) : Number(BigInt.asIntN(32, value)));
        break;
      }
      case 'f':
      case 'e':
      case 'g': {
        const m = /^[+-]?(?:\d+\.?\d*|\.\d+)(?:[eE][+-]?\d+)?/.exec(input.slice(i, lim));
        if (!m) {
          failed = true;
          break;
        }
        i += m[0].length;
        if (!suppress) values.push(longs ? Number(m[0]) : Math.fround(Number(m[0])));
        break;
      }
      case 's': {
        let j = i;
        while (j < lim && !isspace(input[j])) j++;
        if (!suppress) values.push(input.slice(i, j));
        i = j;
        break;
      }
      case 'c': {
        const n = width > 0 ? width : 1;
        if (i + n > input.length) {
          failed = true;
          break;
        }
        if (!suppress) values.push(input.slice(i, i + n));
        i += n;
        break;
      }
      default:
        failed = true;
        break;
    }
  }
  return { values, count: values.length };
}

// -------------------------------------------------------------------------------------------------
// glibc's rand(): the TYPE_3 additive feedback generator (random_r.c) that srand()/rand() use. All
// threads of the original process share it; so do the frontend and the adapter here.

let randF = 3; // index of the front pointer into the 31-word table (r[i-3])
let randR = 0; // r[i-31]
const randTable = new Int32Array(31);

export function srand(seed: number): void {
  seed = seed >>> 0;
  if (seed === 0) seed = 1;
  randTable[0] = seed | 0;
  let word = seed | 0;
  for (let i = 1; i < 31; i++) {
    // word = (16807 * word) % 2147483647 computed without overflow (Schrage), as random_r.c does
    const hi = Math.trunc(word / 127773);
    const lo = word % 127773;
    word = 16807 * lo - 2836 * hi;
    if (word < 0) word += 2147483647;
    randTable[i] = word;
  }
  randF = 3;
  randR = 0;
  for (let i = 0; i < 310; i++) rand();
}

/** rand(): 0..RAND_MAX */
export function rand(): number {
  const v = (randTable[randF] + randTable[randR]) | 0;
  randTable[randF] = v;
  const result = (v >>> 1) & 0x7fffffff;
  randF = randF + 1 >= 31 ? 0 : randF + 1;
  randR = randR + 1 >= 31 ? 0 : randR + 1;
  return result;
}
srand(1); // glibc's initial state is srand(1)

// -------------------------------------------------------------------------------------------------
// bytes

/** Bytes (Latin-1 string) of a byte array, and back: the program works on bytes. */
export function bstr(b: Uint8Array): string {
  let s = '';
  for (let i = 0; i < b.length; i += 8192) s += String.fromCharCode(...b.subarray(i, i + 8192));
  return s;
}
export function bytes(s: string): Uint8Array {
  const b = new Uint8Array(s.length);
  for (let i = 0; i < s.length; i++) b[i] = s.charCodeAt(i) & 255;
  return b;
}
