// What the C code takes from libc, with C's semantics: sprintf for the formats pMARS uses, the C-locale
// <ctype.h> classes, atol, and 32/64-bit integer arithmetic. Strings are byte strings (one char per byte,
// codes 0..255), as the C program sees its files and its terminal.

export const INT_MAX = 2147483647;
export const INT_MIN = -2147483648;
export const LONG_MAX = 9223372036854775807n;
export const LONG_MIN = -9223372036854775808n;

export const isdigit = (c: string | undefined): boolean => c !== undefined && c >= '0' && c <= '9';
export const isalpha = (c: string | undefined): boolean => c !== undefined && ((c >= 'A' && c <= 'Z') || (c >= 'a' && c <= 'z'));
export const isupper = (c: string | undefined): boolean => c !== undefined && c >= 'A' && c <= 'Z';
export const isspace = (c: string | undefined): boolean => c === ' ' || c === '\t' || c === '\n' || c === '\v' || c === '\f' || c === '\r';
export const toupper = (c: string): string => (c >= 'a' && c <= 'z' ? String.fromCharCode(c.charCodeAt(0) - 32) : c);
export const strupper = (s: string): string => s.replace(/[a-z]+/g, (m) => m.toUpperCase());

/** the char at i, or '\0' past the end (C strings end with NUL) */
export const at = (s: string, i: number): string => (i < s.length ? s[i] : '\0');

/** int arithmetic that wraps like the machine (two's complement, 32 bits) */
export const i32 = (n: number): number => n | 0;
export const u32 = (n: number): number => n >>> 0;

/** atol(): optional spaces and sign, then digits; stops at the first non-digit; 64-bit wrap. */
export function atol(s: string): bigint {
  let i = 0;
  while (isspace(s[i])) i++;
  let neg = false;
  if (s[i] === '+' || s[i] === '-') neg = s[i++] === '-';
  let v = 0n;
  while (isdigit(s[i])) v = BigInt.asIntN(64, v * 10n + BigInt(s.charCodeAt(i++) - 48));
  return neg ? BigInt.asIntN(64, -v) : v;
}

/** sscanf(s, "%ld"): like strtol, which saturates at LONG_MIN/LONG_MAX. Returns null if no digits. */
export function scanLong(s: string): bigint | null {
  let i = 0;
  while (isspace(s[i])) i++;
  let neg = false;
  if (s[i] === '+' || s[i] === '-') neg = s[i++] === '-';
  if (!isdigit(s[i])) return null;
  let v = 0n;
  while (isdigit(s[i])) v = v * 10n + BigInt(s.charCodeAt(i++) - 48);
  if (neg) v = -v;
  return v > LONG_MAX ? LONG_MAX : v < LONG_MIN ? LONG_MIN : v;
}

/**
 * sprintf with the conversions pMARS uses: %d %i %u %ld %lu %x %c %s %%, flags '-' and '0', a width
 * (or *). Numbers may be numbers or bigints.
 */
export function sprintf(fmt: string, ...args: (string | number | bigint | null)[]): string {
  let out = '';
  let a = 0;
  for (let i = 0; i < fmt.length; i++) {
    const ch = fmt[i];
    if (ch !== '%') {
      out += ch;
      continue;
    }
    i++;
    let left = false, zero = false, plus = false, space = false;
    for (; ; i++) {
      if (fmt[i] === '-') left = true;
      else if (fmt[i] === '0') zero = true;
      else if (fmt[i] === '+') plus = true;
      else if (fmt[i] === ' ') space = true;
      else break;
    }
    let width = 0;
    if (fmt[i] === '*') {
      width = Number(args[a++]);
      if (width < 0) { left = true; width = -width; }
      i++;
    } else while (isdigit(fmt[i])) width = width * 10 + (fmt.charCodeAt(i++) - 48);
    let prec = -1;
    if (fmt[i] === '.') {
      i++;
      prec = 0;
      while (isdigit(fmt[i])) prec = prec * 10 + (fmt.charCodeAt(i++) - 48);
    }
    while (fmt[i] === 'l' || fmt[i] === 'h') i++;
    const conv = fmt[i];
    let s: string;
    switch (conv) {
      case '%': out += '%'; continue;
      case 'd': case 'i': {
        const v = BigInt(args[a++] as number | bigint);
        s = (v < 0n ? -v : v).toString();
        if (prec >= 0) s = s.padStart(prec, '0');
        const sign = v < 0n ? '-' : plus ? '+' : space ? ' ' : '';
        if (zero && !left && prec < 0) s = s.padStart(width - sign.length, '0');
        s = sign + s;
        break;
      }
      case 'u': {
        const v = BigInt(args[a++] as number | bigint);
        s = (v < 0n ? BigInt.asUintN(64, v) : v).toString();
        if (zero && !left) s = s.padStart(width, '0');
        break;
      }
      case 'x': {
        const v = BigInt(args[a++] as number | bigint);
        s = (v < 0n ? BigInt.asUintN(32, v) : v).toString(16);
        if (zero && !left) s = s.padStart(width, '0');
        break;
      }
      case 'c': s = typeof args[a] === 'string' ? (args[a++] as string).slice(0, 1) : String.fromCharCode(Number(args[a++]) & 255); break;
      case 's': { const v = args[a++]; s = v === null ? '(null)' : String(v); if (prec >= 0) s = s.slice(0, prec); break; }
      default: s = ''; break;
    }
    out += left ? s.padEnd(width) : s.padStart(width);
  }
  return out;
}

/** Bytes (Latin-1 string) of UTF-8 text, and back: the program works on bytes, the screen shows text. */
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
export const fromText = (t: string): string => bstr(new TextEncoder().encode(t));
