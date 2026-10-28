// C semantics the port needs to stay 1:1 with XPilot's C: integer division, rint, float arithmetic,
// the string functions on Latin-1 strings (one character per byte, 0..255), and printf/sscanf with
// glibc's rounding (exact ties go to even).

/** C integer division (truncates toward zero) */
export const idiv = (a: number, b: number): number => Math.trunc(a / b);
/** (int) cast of a double */
export const toInt = (v: number): number => (Number.isFinite(v) ? Math.trunc(v) | 0 : 0);
/** C float arithmetic: every float result rounded to single precision */
export const f32 = Math.fround;
export const s16 = (v: number): number => (v << 16) >> 16;
export const u16 = (v: number): number => v & 0xffff;
export const s8 = (v: number): number => (v << 24) >> 24;
export const u8 = (v: number): number => v & 0xff;
export const u32 = (v: number): number => v >>> 0;

/** rint(): round to nearest, ties to even (the default rounding mode) */
export function rint(v: number): number {
  const r = Math.round(v);
  if (Math.abs(v - Math.trunc(v)) === 0.5) return 2 * Math.round(v / 2);
  return r;
}

export const MIN = (a: number, b: number): number => (a > b ? b : a);
export const MAX = (a: number, b: number): number => (a > b ? a : b);
export const ABS = (a: number): number => (a < 0 ? -a : a);
export const LIMIT = (v: number, lo: number, hi: number): number => (v > hi ? hi : v < lo ? lo : v);
export const BIT = (w: number, b: number): number => w & b;

export const isdigit = (c: string | undefined): boolean => !!c && c >= '0' && c <= '9';
export const isspace = (c: string | undefined): boolean => !!c && (c === ' ' || c === '\t' || c === '\n' || c === '\r' || c === '\v' || c === '\f');
export const isupper = (c: string | undefined): boolean => !!c && c >= 'A' && c <= 'Z';
export const islower = (c: string | undefined): boolean => !!c && c >= 'a' && c <= 'z';
export const isalpha = (c: string | undefined): boolean => isupper(c) || islower(c);
export const isprint = (c: string | undefined): boolean => !!c && c.charCodeAt(0) >= 0x20 && c.charCodeAt(0) < 0x7f;

/** strlcpy into a char[size]: at most size - 1 characters */
export const strlcpy = (s: string, size: number): string => (s.length < size ? s : s.slice(0, Math.max(0, size - 1)));

export function strcasecmp(a: string, b: string): number {
  const x = a.toLowerCase(), y = b.toLowerCase();
  return x < y ? -1 : x > y ? 1 : 0;
}

export function strncasecmp(a: string, b: string, n: number): number {
  return strcasecmp(a.slice(0, n), b.slice(0, n));
}

/** strchr(s, c) != NULL: true for c == 0 too (the terminator) */
export const strchrc = (s: string, c: number): boolean => c === 0 || s.includes(String.fromCharCode(c));

/** a C string cut at its first NUL */
export const cstr = (s: string): string => {
  const i = s.indexOf('\0');
  return i < 0 ? s : s.slice(0, i);
};

/** atoi(): leading whitespace, sign, digits; 0 when there are none */
export function atoi(s: string): number {
  const m = /^[ \t\n\r\v\f]*([+-]?\d+)/.exec(s);
  return m ? parseInt(m[1], 10) | 0 : 0;
}

/** atof()/strtod() on a prefix */
export function atof(s: string): number {
  const m = /^[ \t\n\r\v\f]*([+-]?(?:\d+\.?\d*(?:[eE][+-]?\d+)?|\.\d+(?:[eE][+-]?\d+)?|inf(?:inity)?|nan))/i.exec(s);
  if (!m) return 0;
  const t = m[1].toLowerCase();
  if (t.includes('inf')) return t.startsWith('-') ? -Infinity : Infinity;
  if (t.includes('nan')) return NaN;
  return parseFloat(m[1]);
}

/** sscanf(s, "%d,%d"): [x, y] or null */
export function scanIntPair(s: string): [number, number] | null {
  const m = /^[ \t\n\r\v\f]*([+-]?\d+),[ \t\n\r\v\f]*([+-]?\d+)/.exec(s);
  return m ? [parseInt(m[1], 10) | 0, parseInt(m[2], 10) | 0] : null;
}

// ---------------------------------------------------------------- printf

/** %.<p>f as glibc writes it: the exact binary value rounded to p decimals, ties to even */
export function fixed(v: number, p: number): string {
  if (!Number.isFinite(v)) return Number.isNaN(v) ? 'nan' : v > 0 ? 'inf' : '-inf';
  const neg = v < 0 || Object.is(v, -0);
  const a = Math.abs(v);
  const dv = new DataView(new ArrayBuffer(8));
  dv.setFloat64(0, a);
  const bits = dv.getBigUint64(0);
  const be = Number(bits >> 52n);
  const mant = be === 0 ? bits & 0xfffffffffffffn : (bits & 0xfffffffffffffn) | (1n << 52n);
  const e = (be === 0 ? 1 : be) - 1075;
  const scale = 10n ** BigInt(p);
  let n: bigint;
  if (e >= 0) n = (mant << BigInt(e)) * scale;
  else {
    const num = mant * scale, den = 1n << BigInt(-e);
    const q = num / den, r = num % den;
    n = 2n * r > den || (2n * r === den && q % 2n === 1n) ? q + 1n : q;
  }
  let digits = n.toString();
  if (p > 0) {
    digits = digits.padStart(p + 1, '0');
    digits = digits.slice(0, digits.length - p) + '.' + digits.slice(digits.length - p);
  }
  return (neg ? '-' : '') + digits;
}

function expo(v: number, p: number, upper: boolean): string {
  let s = v.toExponential(p);
  const m = /^(-?[\d.]+)e([+-])(\d+)$/.exec(s)!;
  s = `${m[1]}e${m[2]}${m[3].padStart(2, '0')}`;
  return upper ? s.toUpperCase() : s;
}

function gfmt(v: number, p: number, alt: boolean, upper: boolean): string {
  if (!Number.isFinite(v)) return Number.isNaN(v) ? 'nan' : v > 0 ? 'inf' : '-inf';
  if (p === 0) p = 1;
  if (v === 0) return alt ? '0.' + '0'.repeat(p - 1) : '0';
  const e = Number(/e([+-]\d+)$/.exec(v.toExponential(p - 1))![1]);
  let s: string;
  if (e < -4 || e >= p) {
    s = expo(v, p - 1, upper);
    if (!alt) s = s.replace(/\.?0+e/, 'e').replace(/\.?0+E/, 'E');
  } else {
    s = fixed(v, p - 1 - e);
    if (!alt && s.includes('.')) s = s.replace(/0+$/, '').replace(/\.$/, '');
  }
  return s;
}

/** C's sprintf for the conversions XPilot uses (d i u x X o c s f e g, flags, width, precision, *) */
export function sprintf(fmt: string, ...args: unknown[]): string {
  let out = '';
  let ai = 0;
  const next = () => args[ai++];
  for (let i = 0; i < fmt.length; i++) {
    const ch = fmt[i];
    if (ch !== '%') { out += ch; continue; }
    i++;
    if (fmt[i] === '%') { out += '%'; continue; }
    let flags = '';
    while ('-+ #0'.includes(fmt[i])) flags += fmt[i++];
    let width = -1;
    if (fmt[i] === '*') { width = Number(next()); i++; if (width < 0) { flags += '-'; width = -width; } }
    else { let w = ''; while (isdigit(fmt[i])) w += fmt[i++]; if (w) width = parseInt(w, 10); }
    let prec = -1;
    if (fmt[i] === '.') {
      i++;
      if (fmt[i] === '*') { prec = Number(next()); i++; }
      else { let p = ''; while (isdigit(fmt[i])) p += fmt[i++]; prec = p ? parseInt(p, 10) : 0; }
    }
    while ('hlLqjzt'.includes(fmt[i])) i++;
    const conv = fmt[i];
    let body = '';
    let sign = '';
    const left = flags.includes('-'), zero = flags.includes('0') && !left;
    switch (conv) {
      case 'd': case 'i': {
        let v = Math.trunc(Number(next()));
        if (v < 0) { sign = '-'; v = -v; } else if (flags.includes('+')) sign = '+'; else if (flags.includes(' ')) sign = ' ';
        body = String(v);
        if (prec >= 0) body = prec === 0 && v === 0 ? '' : body.padStart(prec, '0');
        break;
      }
      case 'u': {
        const v = Math.trunc(Number(next())) >>> 0;
        body = String(v);
        if (prec >= 0) body = body.padStart(prec, '0');
        break;
      }
      case 'x': case 'X': case 'o': {
        const v = Math.trunc(Number(next())) >>> 0;
        body = v.toString(conv === 'o' ? 8 : 16);
        if (conv === 'X') body = body.toUpperCase();
        if (prec >= 0) body = body.padStart(prec, '0');
        if (flags.includes('#') && v) body = (conv === 'o' ? '0' : conv === 'x' ? '0x' : '0X') + body;
        break;
      }
      case 'c': body = String.fromCharCode(Number(next()) & 0xff); break;
      case 's': {
        let v = cstr(String(next() ?? '(null)'));
        if (prec >= 0) v = v.slice(0, prec);
        body = v;
        break;
      }
      case 'f': case 'F': case 'e': case 'E': case 'g': case 'G': {
        let v = Number(next());
        const neg = v < 0 || Object.is(v, -0);
        if (neg) v = -v;
        sign = neg ? '-' : flags.includes('+') ? '+' : flags.includes(' ') ? ' ' : '';
        const p = prec < 0 ? 6 : prec;
        if (conv === 'f' || conv === 'F') body = fixed(v, p);
        else if (conv === 'e' || conv === 'E') body = expo(v, p, conv === 'E');
        else body = gfmt(v, p, flags.includes('#'), conv === 'G');
        if (body.startsWith('-')) body = body.slice(1);
        break;
      }
      default:
        body = '%' + conv;
    }
    const numeric = 'diuxXofFeEgG'.includes(conv);
    let len = sign.length + body.length;
    if (width > len) {
      if (left) body = sign + body + ' '.repeat(width - len);
      else if (zero && numeric && !(prec >= 0 && 'diuxXo'.includes(conv))) body = sign + '0'.repeat(width - len) + body;
      else body = ' '.repeat(width - len) + sign + body;
      sign = '';
    }
    out += sign + body;
    len = 0;
  }
  return out;
}

/** snprintf into char[size] */
export const snprintf = (size: number, fmt: string, ...args: unknown[]): string => strlcpy(sprintf(fmt, ...args), size);

/** strtok over a string: the tokens separated by any of `delim` */
export function strtokAll(s: string, delim: string): string[] {
  const out: string[] = [];
  let cur = '';
  for (const c of s) {
    if (delim.includes(c)) { if (cur) out.push(cur); cur = ''; } else cur += c;
  }
  if (cur) out.push(cur);
  return out;
}

/** Latin-1 string <-> bytes */
export function latin1(bytes: Uint8Array, start = 0, end = bytes.length): string {
  let s = '';
  for (let i = start; i < end; i++) s += String.fromCharCode(bytes[i]);
  return s;
}

export function bytesOf(s: string): Uint8Array {
  const b = new Uint8Array(s.length);
  for (let i = 0; i < s.length; i++) b[i] = s.charCodeAt(i) & 0xff;
  return b;
}

/** a function reset on every new client run (C's static variables back to their initial values) */
const resets: (() => void)[] = [];
export function onReset(f: () => void): void {
  resets.push(f);
  f();
}
export function resetAll(): void {
  for (const f of resets) f();
}
