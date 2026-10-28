// What the port needs of C and C++'s libraries, with their semantics: integer conversions and
// division, printf formatting, <cctype> on characters (a C char is a 1-character string here), and a
// box for out-parameters (C++ references to scalars and char buffers).

/** A C++ reference to a scalar (`int &x`) or an output buffer (`char *out`): the callee sets `.v`. */
export interface Ref<T> {
  v: T;
}

export function ref<T>(v: T): Ref<T> {
  return { v };
}

// ------------------------------------------------------------------ integers

export const i8 = (v: number): number => (v << 24) >> 24;
export const u8 = (v: number): number => v & 0xff;
export const i16 = (v: number): number => (v << 16) >> 16;
export const u16 = (v: number): number => v & 0xffff;
export const i32 = (v: number): number => v | 0;
export const u32 = (v: number): number => v >>> 0;

/** C integer division: truncates toward zero. */
export function idiv(a: number, b: number): number {
  return Math.trunc(a / b);
}

/** abs() of an int */
export const abs = Math.abs;

// ------------------------------------------------------------------ characters

/** The character of a char code ((char) n). */
export function chr(n: number): string {
  return String.fromCharCode(n & 0xff);
}

/** The char code of a character ((unsigned char) c). */
export function ord(c: string): number {
  return c.length ? c.charCodeAt(0) & 0xff : 0;
}

const code = (c: string | number): number => (typeof c === 'number' ? c : ord(c));

export const isprint = (c: string | number): boolean => { const n = code(c); return n >= 0x20 && n < 0x7f; };
export const isdigit = (c: string | number): boolean => { const n = code(c); return n >= 0x30 && n <= 0x39; };
export const isupper = (c: string | number): boolean => { const n = code(c); return n >= 0x41 && n <= 0x5a; };
export const islower = (c: string | number): boolean => { const n = code(c); return n >= 0x61 && n <= 0x7a; };
export const isalpha = (c: string | number): boolean => isupper(c) || islower(c);
export const isalnum = (c: string | number): boolean => isalpha(c) || isdigit(c);
export const isspace = (c: string | number): boolean => { const n = code(c); return n === 0x20 || (n >= 0x09 && n <= 0x0d); };
export const iscntrl = (c: string | number): boolean => { const n = code(c); return n < 0x20 || n === 0x7f; };
export const tolower = (c: string): string => (isupper(c) ? chr(ord(c) + 32) : c);
export const toupper = (c: string): string => (islower(c) ? chr(ord(c) - 32) : c);

// ------------------------------------------------------------------ strings

/** A char buffer of `size` bytes as C sees it: at most size - 1 characters (strncpy + terminating NUL). */
export function fit(s: string, size: number): string {
  return s.length < size ? s : s.slice(0, size - 1);
}

/** The C string in a std::string or a buffer: up to the first NUL. */
export function cstr(s: string): string {
  const i = s.indexOf('\0');
  return i < 0 ? s : s.slice(0, i);
}

// ------------------------------------------------------------------ printf

/**
 * C's sprintf: %d %i %u %x %X %o %c %s %%, with the flags - + space 0 #, a width and a precision (also
 * as `*`) and the length modifiers h, hh, l, ll (which only change how a value is read). A %c takes a
 * char code or a 1-character string.
 */
export function sprintf(fmt: string, ...args: (string | number | boolean | null | undefined)[]): string {
  let out = '';
  let a = 0;
  for (let i = 0; i < fmt.length; i++) {
    const c = fmt[i];
    if (c !== '%') {
      out += c;
      continue;
    }
    i++;
    if (fmt[i] === '%') {
      out += '%';
      continue;
    }
    let left = false, plus = false, space = false, zero = false, alt = false;
    for (;; i++) {
      const f = fmt[i];
      if (f === '-') left = true;
      else if (f === '+') plus = true;
      else if (f === ' ') space = true;
      else if (f === '0') zero = true;
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
    } else {
      while (fmt[i] >= '0' && fmt[i] <= '9') width = width * 10 + Number(fmt[i++]);
    }
    let prec = -1;
    if (fmt[i] === '.') {
      i++;
      prec = 0;
      if (fmt[i] === '*') {
        prec = Number(args[a++]);
        i++;
      } else {
        while (fmt[i] >= '0' && fmt[i] <= '9') prec = prec * 10 + Number(fmt[i++]);
      }
    }
    let short = 0;
    while ('hlLqjzt'.includes(fmt[i])) {
      if (fmt[i] === 'h') short++;
      i++;
    }
    const conv = fmt[i];
    let body: string;
    let sign = '';
    let numeric = true;
    const arg = args[a++];
    switch (conv) {
      case 'd':
      case 'i': {
        let n = Math.trunc(Number(arg));
        if (short === 1) n = i16(n);
        else if (short >= 2) n = i8(n);
        if (n < 0) {
          sign = '-';
          n = -n;
        } else if (plus) sign = '+';
        else if (space) sign = ' ';
        body = prec === 0 && n === 0 ? '' : String(n);
        if (prec > body.length) body = body.padStart(prec, '0');
        break;
      }
      case 'u':
      case 'x':
      case 'X':
      case 'o': {
        let n = Math.trunc(Number(arg));
        n = short === 1 ? u16(n) : short >= 2 ? u8(n) : n >>> 0;
        const radix = conv === 'u' ? 10 : conv === 'o' ? 8 : 16;
        body = prec === 0 && n === 0 ? '' : n.toString(radix);
        if (conv === 'X') body = body.toUpperCase();
        if (prec > body.length) body = body.padStart(prec, '0');
        if (alt && n !== 0) {
          if (conv === 'x') sign = '0x';
          else if (conv === 'X') sign = '0X';
          else if (conv === 'o' && !body.startsWith('0')) body = '0' + body;
        }
        break;
      }
      case 'c':
        body = typeof arg === 'number' ? chr(arg) : String(arg ?? '\0').slice(0, 1);
        numeric = false;
        break;
      case 's': {
        body = arg === null || arg === undefined ? '(null)' : String(arg);
        if (prec >= 0) body = body.slice(0, prec);
        numeric = false;
        break;
      }
      default:
        throw new Error(`sprintf: unsupported conversion %${conv} in ${JSON.stringify(fmt)}`);
    }
    const len = sign.length + body.length;
    if (len >= width) out += sign + body;
    else if (left) out += sign + body + ' '.repeat(width - len);
    else if (zero && numeric && prec < 0) out += sign + '0'.repeat(width - len) + body;
    else out += ' '.repeat(width - len) + sign + body;
  }
  return out;
}

/** std::to_string of an integer */
export function to_string(n: number): string {
  return String(Math.trunc(n));
}
