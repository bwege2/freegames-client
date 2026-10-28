// (c) Magnus Auvinen. See licence.txt in the root of the distribution for more information.
// If you are missing that file, acquire a complete release at teeworlds.com.
// Altered: the string functions of base/system.c of Teeworlds 0.7.5 in TypeScript.
//
// A C string here is a "byte string": a JS string whose char codes are its bytes (0..255), without the NUL;
// the text inside is UTF-8 as in the original. utf8Encode/utf8Decode convert from and to real text.

export function utf8Encode(text: string): string {
  const b = new TextEncoder().encode(text);
  let s = '';
  for (let i = 0; i < b.length; i++) s += String.fromCharCode(b[i]);
  return s;
}

export function utf8Decode(bytes: string): string {
  const b = new Uint8Array(bytes.length);
  for (let i = 0; i < bytes.length; i++) b[i] = bytes.charCodeAt(i) & 0xff;
  return new TextDecoder().decode(b);
}

export function bytesOf(s: string): Uint8Array {
  const b = new Uint8Array(s.length);
  for (let i = 0; i < s.length; i++) b[i] = s.charCodeAt(i) & 0xff;
  return b;
}

/** a byte string from bytes, up to the first NUL */
export function strOf(b: Uint8Array, off = 0, len = b.length - off): string {
  let s = '';
  for (let i = off; i < off + len; i++) {
    if (!b[i]) break;
    s += String.fromCharCode(b[i]);
  }
  return s;
}

export function str_copy(src: string, dstSize: number): string {
  if (dstSize <= 0) return '';
  return src.length <= dstSize - 1 ? src : src.slice(0, dstSize - 1);
}

export function str_length(s: string): number { return s.length; }

export function str_comp(a: string, b: string): number {
  const n = Math.min(a.length, b.length);
  for (let i = 0; i < n; i++) {
    const d = (a.charCodeAt(i) & 0xff) - (b.charCodeAt(i) & 0xff);
    if (d) return d;
  }
  return a.length - b.length;
}

const lower = (c: number): number => (c >= 65 && c <= 90 ? c + 32 : c);

export function str_comp_nocase(a: string, b: string): number {
  const n = Math.min(a.length, b.length);
  for (let i = 0; i < n; i++) {
    const d = lower(a.charCodeAt(i)) - lower(b.charCodeAt(i));
    if (d) return d;
  }
  return (a.length > n ? lower(a.charCodeAt(n)) : 0) - (b.length > n ? lower(b.charCodeAt(n)) : 0);
}

export function str_comp_num(a: string, b: string, num: number): number { return str_comp(a.slice(0, num), b.slice(0, num)); }
export function str_comp_nocase_num(a: string, b: string, num: number): number { return str_comp_nocase(a.slice(0, num), b.slice(0, num)); }

/** str_find_nocase: the index, or -1 */
export function str_find_nocase(h: string, n: string): number {
  outer: for (let i = 0; i + n.length <= h.length; i++) {
    for (let j = 0; j < n.length; j++) if (lower(h.charCodeAt(i + j)) !== lower(n.charCodeAt(j))) continue outer;
    return i;
  }
  return -1;
}

export function str_find(h: string, n: string): number { return h.indexOf(n); }

export function str_sanitize_strong(s: string): string {
  let o = '';
  for (let i = 0; i < s.length; i++) {
    let c = s.charCodeAt(i) & 0x7f;
    if (c < 32) c = 32;
    o += String.fromCharCode(c);
  }
  return o;
}

export function str_sanitize_cc(s: string): string {
  let o = '';
  for (let i = 0; i < s.length; i++) {
    const c = s.charCodeAt(i);
    o += c < 32 ? ' ' : s[i];
  }
  return o;
}

export function str_sanitize(s: string): string {
  let o = '';
  for (let i = 0; i < s.length; i++) {
    const c = s.charCodeAt(i);
    o += c < 32 && c !== 13 && c !== 10 && c !== 9 ? ' ' : s[i];
  }
  return o;
}

export function str_toint(s: string): number {
  const m = /^[ \t\n\v\f\r]*([+-]?\d+)/.exec(s);
  if (!m) return 0;
  const v = parseInt(m[1], 10);
  return v | 0;
}

export function str_tofloat(s: string): number {
  const m = /^[ \t\n\v\f\r]*([+-]?(\d+\.?\d*|\.\d+)([eE][+-]?\d+)?)/.exec(s);
  return m ? Math.fround(parseFloat(m[1])) : 0;
}

export function str_utf8_is_whitespace(code: number): boolean {
  return !(code > 0x20 && code !== 0xA0 && code !== 0x034F && (code < 0x2000 || code > 0x200F) && (code < 0x2028 || code > 0x202F)
    && (code < 0x205F || code > 0x2064) && (code < 0x206A || code > 0x206F) && code !== 0x3000 && (code < 0xFE00 || code > 0xFE0F)
    && code !== 0xFEFF && (code < 0xFFF9 || code > 0xFFFC));
}

/** str_utf8_decode: the code point at pos.i (or -1), advancing pos.i; the string's end is the NUL */
export function str_utf8_decode(s: string, pos: { i: number }): number {
  const at = (i: number): number => (i < s.length ? s.charCodeAt(i) & 0xff : 0);
  let b = pos.i;
  let ch: number;
  const c = at(b);
  if ((c & 0x80) === 0) {
    pos.i = b + 1;
    return c;
  } else if ((c & 0xE0) === 0xC0) {
    ch = (at(b++) & 0x3F) << 6;
    if (!at(b) || (at(b) & 0xC0) !== 0x80) { pos.i = b; return -1; }
    ch += at(b++) & 0x3F;
    if (ch < 0x80 || ch > 0x7FF) ch = -1;
  } else if ((c & 0xF0) === 0xE0) {
    ch = (at(b++) & 0x1F) << 12;
    if (!at(b) || (at(b) & 0xC0) !== 0x80) { pos.i = b; return -1; }
    ch += (at(b++) & 0x3F) << 6;
    if (!at(b) || (at(b) & 0xC0) !== 0x80) { pos.i = b; return -1; }
    ch += at(b++) & 0x3F;
    if (ch < 0x800 || ch > 0xFFFF) ch = -1;
  } else if ((c & 0xF8) === 0xF0) {
    ch = (at(b++) & 0x0F) << 18;
    if (!at(b) || (at(b) & 0xC0) !== 0x80) { pos.i = b; return -1; }
    ch += (at(b++) & 0x3F) << 12;
    if (!at(b) || (at(b) & 0xC0) !== 0x80) { pos.i = b; return -1; }
    ch += (at(b++) & 0x3F) << 6;
    if (!at(b) || (at(b) & 0xC0) !== 0x80) { pos.i = b; return -1; }
    ch += at(b++) & 0x3F;
    if (ch < 0x10000 || ch > 0x10FFFF) ch = -1;
  } else {
    pos.i = b + 1;
    return -1;
  }
  pos.i = b;
  return ch;
}

export function str_utf8_skip_whitespaces(s: string): string {
  const p = { i: 0 };
  while (p.i < s.length) {
    const old = p.i;
    const code = str_utf8_decode(s, p);
    if (!str_utf8_is_whitespace(code)) return s.slice(old);
  }
  return s.slice(Math.min(p.i, s.length));
}

export function str_utf8_rewind(s: string, cursor: number): number {
  while (cursor > 0) {
    cursor--;
    if (((s.charCodeAt(cursor) & 0xff) & 0xC0) !== 0x80) break;
  }
  return cursor;
}

export function str_utf8_forward(s: string, cursor: number): number {
  const at = (i: number): number => (i < s.length ? s.charCodeAt(i) & 0xff : 0);
  const b0 = at(cursor);
  if (!b0) return cursor;
  if ((b0 & 0x80) === 0) return cursor + 1;
  if ((b0 & 0xE0) === 0xC0) return at(cursor + 1) ? cursor + 2 : cursor + 1;
  if ((b0 & 0xF0) === 0xE0) {
    if (!at(cursor + 1)) return cursor + 1;
    if (!at(cursor + 2)) return cursor + 2;
    return cursor + 3;
  }
  if ((b0 & 0xF8) === 0xF0) {
    if (!at(cursor + 1)) return cursor + 1;
    if (!at(cursor + 2)) return cursor + 2;
    if (!at(cursor + 3)) return cursor + 3;
    return cursor + 4;
  }
  return cursor + 1;
}

export function str_utf8_encode(chr: number): string {
  const c = String.fromCharCode;
  if (chr <= 0x7F) return c(chr);
  if (chr <= 0x7FF) return c(0xC0 | ((chr >> 6) & 0x1F), 0x80 | (chr & 0x3F));
  if (chr <= 0xFFFF) return c(0xE0 | ((chr >> 12) & 0x0F), 0x80 | ((chr >> 6) & 0x3F), 0x80 | (chr & 0x3F));
  if (chr <= 0x10FFFF) return c(0xF0 | ((chr >> 18) & 0x07), 0x80 | ((chr >> 12) & 0x3F), 0x80 | ((chr >> 6) & 0x3F), 0x80 | (chr & 0x3F));
  return '';
}

export function str_utf8_trim_whitespaces_right(s: string): string {
  let cur = s;
  let cursor = cur.length;
  while (str_utf8_is_whitespace(str_utf8_decode(cur, { i: cursor }))) {
    cur = cur.slice(0, cursor);
    cursor = str_utf8_rewind(cur, cursor);
    if (cursor === 0) break;
  }
  return cur;
}

export function str_utf8_check(s: string): boolean {
  let i = 0;
  const at = (k: number): number => (k < s.length ? s.charCodeAt(k) & 0xff : 0);
  while (i < s.length) {
    const c = at(i);
    if ((c & 0x80) === 0) i++;
    else if ((c & 0xE0) === 0xC0 && (at(i + 1) & 0xC0) === 0x80) i += 2;
    else if ((c & 0xF0) === 0xE0 && (at(i + 1) & 0xC0) === 0x80 && (at(i + 2) & 0xC0) === 0x80) i += 3;
    else if ((c & 0xF8) === 0xF0 && (at(i + 1) & 0xC0) === 0x80 && (at(i + 2) & 0xC0) === 0x80 && (at(i + 3) & 0xC0) === 0x80) i += 4;
    else return false;
  }
  return true;
}

/** a small vsnprintf: %d %i %u %x %X %c %s %f %%, with flags, width and precision; truncated to size-1 */
export function str_format(size: number, fmt: string, ...args: (number | string)[]): string {
  let o = '';
  let a = 0;
  for (let i = 0; i < fmt.length; i++) {
    const c = fmt[i];
    if (c !== '%') {
      o += c;
      continue;
    }
    let j = i + 1;
    let flags = '';
    while (j < fmt.length && '-0+ #'.includes(fmt[j])) flags += fmt[j++];
    let width = '';
    while (j < fmt.length && fmt[j] >= '0' && fmt[j] <= '9') width += fmt[j++];
    let prec = -1;
    if (fmt[j] === '.') {
      j++;
      let p = '';
      while (j < fmt.length && fmt[j] >= '0' && fmt[j] <= '9') p += fmt[j++];
      prec = p ? parseInt(p, 10) : 0;
    }
    while (j < fmt.length && 'lh'.includes(fmt[j])) j++;
    const conv = fmt[j] ?? '%';
    i = j;
    let s: string;
    switch (conv) {
      case '%': o += '%'; continue;
      case 'd': case 'i': s = String(Math.trunc(Number(args[a++]))); break;
      case 'u': s = String(Number(args[a++]) >>> 0); break;
      case 'x': s = (Number(args[a++]) >>> 0).toString(16); break;
      case 'X': s = (Number(args[a++]) >>> 0).toString(16).toUpperCase(); break;
      case 'c': s = String.fromCharCode(Number(args[a++]) & 0xff); break;
      case 'f': s = Number(args[a++]).toFixed(prec < 0 ? 6 : prec); break;
      case 's': s = String(args[a++]); if (prec >= 0) s = s.slice(0, prec); break;
      default: s = '';
    }
    const w = width ? parseInt(width, 10) : 0;
    if (s.length < w) {
      if (flags.includes('-')) s = s.padEnd(w, ' ');
      else if (flags.includes('0') && conv !== 's' && conv !== 'c') {
        const neg = s.startsWith('-');
        s = (neg ? '-' : '') + (neg ? s.slice(1) : s).padStart(w - (neg ? 1 : 0), '0');
      } else s = s.padStart(w, ' ');
    }
    o += s;
  }
  return str_copy(o, size);
}

export function str_hex(data: Uint8Array): string {
  let s = '';
  for (const b of data) s += b.toString(16).padStart(2, '0') + ' ';
  return s;
}

/** str_quickhash (chars are signed, as on x86) */
export function str_quickhash(s: string): number {
  let h = 5381;
  for (let i = 0; i < s.length; i++) h = (((h << 5) + h) | 0) + ((s.charCodeAt(i) << 24) >> 24) | 0;
  return h >>> 0;
}
