// What the original took from the C library, with its exact results: glibc's rand()/srand() (the
// TYPE_3 additive feedback generator), int division and casts as C does them, single-precision float
// arithmetic, and printf's formatting (round-half-even on the exact binary value, as glibc does).

/* ---- glibc random() ---- */
const R = new Int32Array(34);
let rIdx = 0;
/** how many numbers rand() has drawn since the last srand() (for the tests) */
export let randCount = 0;

export function srand(seed: number): void {
  seed >>>= 0;
  if (seed === 0) seed = 1;
  const r = new Int32Array(344);
  r[0] = seed | 0;
  let word = seed | 0; // an int32_t in glibc's __srandom_r
  for (let i = 1; i < 31; i++) {
    // word = (16807 * word) % 2147483647, computed as glibc does without overflow
    const hi = Math.trunc(word / 127773);
    const lo = word % 127773;
    word = (16807 * lo - 2836 * hi) | 0;
    if (word < 0) word += 2147483647;
    r[i] = word;
  }
  for (let i = 31; i < 34; i++) r[i] = r[i - 31];
  for (let i = 34; i < 344; i++) r[i] = (r[i - 31] + r[i - 3]) | 0;
  for (let i = 0; i < 34; i++) R[i] = r[310 + i];
  rIdx = 0;
  randCount = 0;
}

export function rand(): number {
  // R holds the last 34 values; the next is r[n-31] + r[n-3]
  const v = (R[(rIdx + 3) % 34] + R[(rIdx + 31) % 34]) | 0;
  R[rIdx] = v;
  rIdx = (rIdx + 1) % 34;
  randCount++;
  return v >>> 1;
}

srand(1);

/* ---- integers ---- */
/** C's int division (truncates toward zero) */
export const idiv = (a: number, b: number): number => (b === 0 ? 0 : Math.trunc(a / b) | 0);
/** (int) of a double: truncation toward zero, as gcc on x86-64 for values in range */
export const toInt = (d: number): number => {
  if (Number.isNaN(d) || d >= 2147483648 || d < -2147483648) return -2147483648; // cvttsd2si's "indefinite"
  return Math.trunc(d) | 0;
};
export const f32 = Math.fround;
export const abs = (a: number): number => (a < 0 ? (-a | 0) : a);
/** unsigned short */
export const u16 = (a: number): number => a & 0xffff;
/** short */
export const s16 = (a: number): number => (a << 16) >> 16;

/* ---- printf ---- */
/** %.<prec>f of a double, rounded half-to-even on its exact binary value like glibc */
export function fixed(x: number, prec: number): string {
  // x86's default NaN (0.0 / 0.0) has its sign bit set: glibc prints it as -nan
  if (!Number.isFinite(x)) return Number.isNaN(x) ? '-nan' : x < 0 ? '-inf' : 'inf';
  const neg = x < 0 || Object.is(x, -0);
  const ax = Math.abs(x);
  // the exact decimal expansion (toFixed computes it exactly up to 100 digits)
  const ex = ax.toFixed(Math.min(100, prec + 60));
  const dot = ex.indexOf('.');
  const intPart = ex.slice(0, dot);
  const frac = ex.slice(dot + 1);
  const keep = frac.slice(0, prec);
  const rest = frac.slice(prec);
  let digits = intPart + keep;
  let up = false;
  if (rest.length > 0) {
    const first = rest.charCodeAt(0) - 48;
    if (first > 5) up = true;
    else if (first === 5) {
      if (/[1-9]/.test(rest.slice(1))) up = true;
      else up = ((digits.charCodeAt(digits.length - 1) - 48) & 1) === 1; // tie: to even
    }
  }
  if (up) {
    const a = digits.split('');
    let i = a.length - 1;
    for (; i >= 0; i--) {
      if (a[i] === '9') a[i] = '0';
      else { a[i] = String.fromCharCode(a[i].charCodeAt(0) + 1); break; }
    }
    digits = (i < 0 ? '1' : '') + a.join('');
  }
  let s = prec > 0 ? `${digits.slice(0, digits.length - prec)}.${digits.slice(digits.length - prec)}` : digits;
  if (s.startsWith('.')) s = `0${s}`;
  return neg ? `-${s}` : s;
}

/** sprintf for the conversions the original uses: d i u x X c s f %, flags - + space 0, width and precision (also *) */
export function sprintf(fmt: string, ...args: (number | string)[]): string {
  let out = '';
  let ai = 0;
  for (let i = 0; i < fmt.length; i++) {
    const ch = fmt[i];
    if (ch !== '%') { out += ch; continue; }
    i++;
    let left = false, plus = false, space = false, zero = false;
    for (;; i++) {
      const f = fmt[i];
      if (f === '-') left = true;
      else if (f === '+') plus = true;
      else if (f === ' ') space = true;
      else if (f === '0') zero = true;
      else if (f === '#') { /* unused */ } else break;
    }
    let width = -1;
    if (fmt[i] === '*') { width = args[ai++] as number; i++; if (width < 0) { left = true; width = -width; } } else {
      let w = '';
      while (fmt[i] >= '0' && fmt[i] <= '9') w += fmt[i++];
      if (w) width = parseInt(w, 10);
    }
    let prec = -1;
    if (fmt[i] === '.') {
      i++;
      if (fmt[i] === '*') { prec = args[ai++] as number; i++; } else {
        let p = '';
        while (fmt[i] >= '0' && fmt[i] <= '9') p += fmt[i++];
        prec = p ? parseInt(p, 10) : 0;
      }
    }
    while (fmt[i] === 'l' || fmt[i] === 'h' || fmt[i] === 'L') i++;
    const conv = fmt[i];
    let body = '';
    let sign = '';
    switch (conv) {
      case '%': out += '%'; continue;
      case 'd': case 'i': {
        const v = (args[ai++] as number) | 0;
        body = Math.abs(v).toString();
        if (v === -2147483648) body = '2147483648';
        sign = v < 0 ? '-' : plus ? '+' : space ? ' ' : '';
        if (prec >= 0) { zero = false; while (body.length < prec) body = `0${body}`; if (prec === 0 && v === 0) body = ''; }
        break;
      }
      case 'u': body = ((args[ai++] as number) >>> 0).toString(); break;
      case 'x': body = ((args[ai++] as number) >>> 0).toString(16); break;
      case 'X': body = ((args[ai++] as number) >>> 0).toString(16).toUpperCase(); break;
      case 'c': body = String.fromCharCode((args[ai++] as number) & 0xff); zero = false; break;
      case 's': {
        body = String(args[ai++]);
        if (prec >= 0) body = body.slice(0, prec);
        zero = false;
        break;
      }
      case 'f': {
        const v = args[ai++] as number;
        let s = fixed(v, prec < 0 ? 6 : prec);
        if (s.startsWith('-')) { sign = '-'; s = s.slice(1); } else sign = plus ? '+' : space ? ' ' : '';
        body = s;
        break;
      }
      default: out += `%${conv}`; continue;
    }
    const len = sign.length + body.length;
    if (width > len) {
      if (left) out += sign + body + ' '.repeat(width - len);
      else if (zero) out += sign + '0'.repeat(width - len) + body;
      else out += ' '.repeat(width - len) + sign + body;
    } else out += sign + body;
  }
  return out;
}

/* ---- C strings in byte buffers (where the original's buffer sizes show) ---- */
const enc = (s: string): number[] => Array.from(s, (c) => c.charCodeAt(0) & 0xff);

/** snprintf into buf at off with C's size limit; returns the length the full string would have */
export function snprintfBuf(buf: Uint8Array, off: number, size: number, fmt: string, ...args: (number | string)[]): number {
  const s = enc(sprintf(fmt, ...args));
  if (size > 0) {
    const n = Math.min(s.length, size - 1);
    for (let i = 0; i < n; i++) buf[off + i] = s[i];
    buf[off + n] = 0;
  }
  return s.length;
}

/** the NUL-terminated string at buf[off] (reading on past a row, as C does) */
export function cstr(buf: Uint8Array, off: number): string {
  let s = '';
  for (let i = off; i < buf.length && buf[i] !== 0; i++) s += String.fromCharCode(buf[i]);
  return s;
}

/** snprintf to a string: C's truncation to size - 1 characters */
export function snprintf(size: number, fmt: string, ...args: (number | string)[]): string {
  const s = sprintf(fmt, ...args);
  return size <= 0 ? '' : s.slice(0, size - 1);
}

/* ---- scanf (the cases the original needs) ---- */
/** sscanf with %d and %s (and literal text); returns the converted values, stops at the first mismatch */
export function sscanf(str: string, fmt: string): (number | string)[] {
  const out: (number | string)[] = [];
  let si = 0;
  const isSpace = (c: string): boolean => c === ' ' || c === '\t' || c === '\n' || c === '\r' || c === '\v' || c === '\f';
  for (let fi = 0; fi < fmt.length; fi++) {
    const f = fmt[fi];
    if (isSpace(f)) { while (si < str.length && isSpace(str[si])) si++; continue; }
    if (f !== '%') {
      if (str[si] !== f) return out;
      si++;
      continue;
    }
    fi++;
    let w = '';
    while (fmt[fi] >= '0' && fmt[fi] <= '9') w += fmt[fi++];
    const width = w ? parseInt(w, 10) : Infinity;
    const conv = fmt[fi];
    while (si < str.length && isSpace(str[si])) si++;
    if (si >= str.length) return out;
    if (conv === 'd') {
      const m = /^[+-]?\d+/.exec(str.slice(si));
      if (!m) return out;
      si += m[0].length;
      out.push(Number(BigInt.asIntN(32, BigInt(m[0]))));
    } else if (conv === 'f') {
      const m = /^[+-]?(\d+\.?\d*|\.\d+)([eE][+-]?\d+)?/.exec(str.slice(si));
      if (!m) return out;
      si += m[0].length;
      out.push(Math.fround(parseFloat(m[0])));
    } else if (conv === 's') {
      let s = '';
      while (si < str.length && !isSpace(str[si]) && s.length < width) s += str[si++];
      out.push(s);
    } else return out;
  }
  return out;
}

export const isspace = (c: number): boolean => c === 32 || (c >= 9 && c <= 13);
export const isalnum = (c: number): boolean => (c >= 48 && c <= 57) || (c >= 65 && c <= 90) || (c >= 97 && c <= 122);

/** exit(): unwinds the program */
export class ExitProgram extends Error {
  readonly code: number;
  constructor(code: number) { super(`exit(${code})`); this.code = code; }
}
