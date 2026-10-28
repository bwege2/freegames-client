// <string.h>, <ctype.h> and the number parsing of <stdlib.h>, on Ptrs to char arrays (C locale; from the
// NetHack port's rt/cstring.ts, with what COW uses besides at the end).
import { Ptr, StructBytes, memBytes, memStore } from './ptr.ts';

/** the JavaScript string of a C string (Latin-1) */
export function jstr(p: Ptr | null, max = Infinity): string {
  if (!p) return '(null)';
  const a = p.a;
  let s = '';
  for (let i = p.o; i - p.o < max; i++) {
    const c = a[i] & 255;
    if (!c) break;
    s += String.fromCharCode(c);
  }
  return s;
}

/** writes the JavaScript string s and a NUL at p */
export function putstr(p: Ptr, s: string): void {
  const a = p.a;
  let o = p.o;
  for (let i = 0; i < s.length; i++) a[o++] = s.charCodeAt(i);
  a[o] = 0;
}

export function strlen(p: Ptr): number {
  const a = p.a;
  let i = p.o;
  while (a[i]) i++;
  return i - p.o;
}

export function strcpy(d: Ptr, s: Ptr): Ptr {
  const da = d.a, sa = s.a;
  let i = d.o, j = s.o;
  if (da === sa && i > j) {
    // overlapping (undefined in C, but the original's copies go forward)
    for (;;) {
      const c = sa[j++];
      da[i++] = c;
      if (!c) break;
    }
    return d;
  }
  for (;;) {
    const c = sa[j++];
    da[i++] = c;
    if (!c) break;
  }
  return d;
}

export function strncpy(d: Ptr, s: Ptr, n: number): Ptr {
  const da = d.a, sa = s.a;
  let k = 0;
  for (; k < n; k++) {
    const c = sa[s.o + k];
    da[d.o + k] = c;
    if (!c) break;
  }
  for (; k < n; k++) da[d.o + k] = 0;
  return d;
}

export function strcat(d: Ptr, s: Ptr): Ptr {
  strcpy(new Ptr(d.a, d.o + strlen(d)), s);
  return d;
}

export function strncat(d: Ptr, s: Ptr, n: number): Ptr {
  const da = d.a, sa = s.a;
  let i = d.o + strlen(d);
  for (let k = 0; k < n; k++) {
    const c = sa[s.o + k];
    if (!c) break;
    da[i++] = c;
  }
  da[i] = 0;
  return d;
}

export function strcmp(p: Ptr, q: Ptr): number {
  const a = p.a, b = q.a;
  let i = p.o, j = q.o;
  for (;;) {
    const x = a[i++] & 255, y = b[j++] & 255;
    if (x !== y) return x - y;
    if (!x) return 0;
  }
}

export function strncmp(p: Ptr, q: Ptr, n: number): number {
  const a = p.a, b = q.a;
  for (let k = 0; k < n; k++) {
    const x = a[p.o + k] & 255, y = b[q.o + k] & 255;
    if (x !== y) return x - y;
    if (!x) return 0;
  }
  return 0;
}

export function strchr(p: Ptr, c: number): Ptr | null {
  const a = p.a;
  c &= 255;
  for (let i = p.o; ; i++) {
    const x = a[i] & 255;
    if (x === c) return new Ptr(a, i);
    if (!x) return null;
  }
}

export function strrchr(p: Ptr, c: number): Ptr | null {
  const a = p.a;
  c &= 255;
  let r: Ptr | null = null;
  for (let i = p.o; ; i++) {
    const x = a[i] & 255;
    if (x === c) r = new Ptr(a, i);
    if (!x) return r;
  }
}

export function strstr(h: Ptr, n: Ptr): Ptr | null {
  const nl = strlen(n);
  const hl = strlen(h);
  for (let i = 0; i + nl <= hl; i++) {
    let k = 0;
    while (k < nl && h.a[h.o + i + k] === n.a[n.o + k]) k++;
    if (k === nl) return new Ptr(h.a, h.o + i);
  }
  return null;
}

export function strerror(e: number): Ptr {
  return cstr(`error ${e}`);
}

/** a new C string */
export function cstr(s: string): Ptr {
  const a = new Int8Array(s.length + 1);
  for (let i = 0; i < s.length; i++) a[i] = s.charCodeAt(i);
  return new Ptr(a, 0);
}

export function memset(p: any, c: number, n: number): any {
  if (p instanceof StructBytes && p.o === 0) {
    memset(p.obj, c, n);
    return p;
  }
  if (p instanceof Ptr && !(p instanceof StructBytes)) {
    const a = p.a;
    if (a instanceof Int8Array || a instanceof Uint8Array) {
      a.fill(c, p.o, p.o + n);
      return p;
    }
    if (c === 0 && ArrayBuffer.isView(a)) {
      const es = (a as any).BYTES_PER_ELEMENT;
      (a as any).fill(0, p.o, p.o + Math.ceil(n / es));
      return p;
    }
    if (c === 0 && Array.isArray(a) && !(a[p.o] && typeof a[p.o] === 'object' && a[p.o].$cp)) {
      for (let i = 0; i < n / 8; i++) a[p.o + i] = Array.isArray(a[p.o + i]) || ArrayBuffer.isView(a[p.o + i]) ? zeroed(a[p.o + i]) : null;
      return p;
    }
  } else if (p && typeof p === 'object' && p.constructor && p.constructor.$size && c === 0) {
    const size = p.constructor.$size;
    if (n === size) {
      p.$cp(new p.constructor());
      return p;
    }
    const tail = p.$a && p.$a.$tail;
    if (tail && p.$i === 0 && p.$a.length === 1) {
      // a struct and the bytes after it ($salloc)
      p.$cp(new p.constructor());
      tail.fill(0, 0, Math.min(tail.length, n - size));
      return p;
    }
  }
  memStore(p, new Uint8Array(n).fill(c), n);
  return p;
}

function zeroed(a: any): any {
  if (ArrayBuffer.isView(a)) {
    (a as any).fill(0);
    return a;
  }
  for (let i = 0; i < a.length; i++) {
    const v = a[i];
    if (v && typeof v === 'object' && v.$cp) v.$cp(new v.constructor());
    else if (Array.isArray(v) || ArrayBuffer.isView(v)) zeroed(v);
    else a[i] = typeof v === 'number' ? 0 : null;
  }
  return a;
}

export function memcpy(d: any, s: any, n: number): any {
  if (d instanceof StructBytes && d.o === 0) {
    memcpy(d.obj, s instanceof StructBytes && s.o === 0 ? s.obj : s, n);
    return d;
  }
  if (s instanceof StructBytes && s.o === 0) s = s.obj;
  if (d instanceof Ptr && !(d instanceof StructBytes) && s instanceof Ptr && (d.a instanceof Int8Array || d.a instanceof Uint8Array) &&
      (s.a instanceof Int8Array || s.a instanceof Uint8Array)) {
    for (let i = 0; i < n; i++) d.a[d.o + i] = s.a[s.o + i];
    return d;
  }
  if (d && s && typeof d === 'object' && d.constructor === s.constructor && d.$cp && n === d.constructor.$size) {
    d.$cp(s);
    return d;
  }
  // whole structs from an array of structs into one: struct by struct (their pointers too)
  const ds = structRun(d), ss = structRun(s);
  if (ds && ss && ds.a[ds.i].constructor === ss.a[ss.i].constructor && n % ds.a[ds.i].constructor.$size === 0) {
    const k = n / ds.a[ds.i].constructor.$size;
    if (ds.i + k <= ds.a.length && ss.i + k <= ss.a.length) {
      for (let j = 0; j < k; j++) ds.a[ds.i + j].$cp(ss.a[ss.i + j]);
      return d;
    }
  }
  if (d && d.$cp && s && !(s instanceof Ptr) && !s.constructor.$size) {
    // a plain object of the runtime (struct passwd): its fields
    for (const k of Object.keys(s)) if (k in d) d[k] = s[k];
    return d;
  }
  memStore(d, memBytes(s, n), n);
  return d;
}

/** the array of structs (and the place in it) that p points into, or null */
function structRun(p: any): { a: any[]; i: number } | null {
  if (p instanceof Ptr) {
    const e = Array.isArray(p.a) ? p.a[p.o] : null;
    return e && typeof e === 'object' && e.$cp && e.constructor.$size ? { a: p.a, i: p.o } : null;
  }
  if (p && typeof p === 'object' && p.$cp && p.constructor && p.constructor.$size && !p.$m) return p.$a ? { a: p.$a, i: p.$i } : { a: [p], i: 0 };
  return null;
}

export function memcmp(p: any, q: any, n: number): number {
  const a = memBytes(p, n), b = memBytes(q, n);
  for (let i = 0; i < n; i++) if (a[i] !== b[i]) return a[i] - b[i];
  return 0;
}

// ---- ctype, C locale ----
export function isspace(c: number): number { return c === 32 || (c >= 9 && c <= 13) ? 1 : 0; }
export function isupper(c: number): number { return c >= 65 && c <= 90 ? 1 : 0; }
export function islower(c: number): number { return c >= 97 && c <= 122 ? 1 : 0; }
export function isalpha(c: number): number { return isupper(c) || islower(c) ? 1 : 0; }
export function isdigit(c: number): number { return c >= 48 && c <= 57 ? 1 : 0; }
export function isalnum(c: number): number { return isalpha(c) || isdigit(c) ? 1 : 0; }
export function isxdigit(c: number): number { return isdigit(c) || (c >= 65 && c <= 70) || (c >= 97 && c <= 102) ? 1 : 0; }
export function isprint(c: number): number { return c >= 32 && c < 127 ? 1 : 0; }
export function isgraph(c: number): number { return c > 32 && c < 127 ? 1 : 0; }
export function iscntrl(c: number): number { return (c >= 0 && c < 32) || c === 127 ? 1 : 0; }
export function ispunct(c: number): number { return isgraph(c) && !isalnum(c) ? 1 : 0; }
export function tolower(c: number): number { return isupper(c) ? c + 32 : c; }
export function toupper(c: number): number { return islower(c) ? c - 32 : c; }

// ---- numbers ----
/** strtol's parse: [whitespace][sign]digits in base 10 (or 16 with 0x, 8 with 0 when base is 0) */
export function parseNumber(s: string, base = 10): { value: number; len: number } {
  let i = 0;
  while (i < s.length && isspace(s.charCodeAt(i))) i++;
  let neg = false;
  if (s[i] === '+' || s[i] === '-') {
    neg = s[i] === '-';
    i++;
  }
  if (base === 0) {
    if (s[i] === '0' && (s[i + 1] === 'x' || s[i + 1] === 'X')) {
      base = 16;
      i += 2;
    } else if (s[i] === '0') base = 8;
    else base = 10;
  } else if (base === 16 && s[i] === '0' && (s[i + 1] === 'x' || s[i + 1] === 'X')) i += 2;
  const start = i;
  let v = 0;
  for (; i < s.length; i++) {
    const d = parseInt(s[i], 36);
    if (Number.isNaN(d) || d >= base) break;
    v = v * base + d;
  }
  if (i === start) return { value: 0, len: 0 };
  return { value: neg ? -v : v, len: i };
}

export function atoi(p: Ptr): number {
  return parseNumber(jstr(p)).value | 0;
}

export function atol(p: Ptr): number {
  return parseNumber(jstr(p)).value;
}

export function strtol(p: Ptr, end: Ptr | null, base: number): number {
  const r = parseNumber(jstr(p), base);
  if (end) end.a[end.o] = new Ptr(p.a, p.o + r.len);
  return r.value;
}

export function abs(x: number): number {
  return Math.abs(x);
}

// ---- what COW uses besides (glibc's behaviour) ----

/** glibc's ctype table (C locale) as its macros read it: (*__ctype_b_loc())[c] for c from -128 to 255 */
const ctypeTable = (() => {
  const t = new Uint16Array(384);
  const UPPER = 256, LOWER = 512, ALPHA = 1024, DIGIT = 2048, XDIGIT = 4096, SPACE = 8192, PRINT = 16384, GRAPH = 32768,
    BLANK = 1, CNTRL = 2, PUNCT = 4, ALNUM = 8;
  for (let c = 0; c < 128; c++) {
    let v = 0;
    if (isupper(c)) v |= UPPER | ALPHA | ALNUM;
    if (islower(c)) v |= LOWER | ALPHA | ALNUM;
    if (isdigit(c)) v |= DIGIT | ALNUM;
    if (isxdigit(c)) v |= XDIGIT;
    if (isspace(c)) v |= SPACE;
    if (c === 32 || c === 9) v |= BLANK;
    if (isprint(c)) v |= PRINT;
    if (isgraph(c)) v |= GRAPH;
    if (iscntrl(c)) v |= CNTRL;
    if (ispunct(c)) v |= PUNCT;
    t[128 + c] = v;
  }
  return new Ptr([new Ptr(t, 128)], 0);
})();

export function __ctype_b_loc(): Ptr {
  return ctypeTable;
}

export function strdup(s: Ptr): Ptr {
  return cstr(jstr(s));
}

export function strncasecmp(p: Ptr, q: Ptr, n: number): number {
  for (let k = 0; k < n; k++) {
    const x = tolower(p.a[p.o + k] & 255), y = tolower(q.a[q.o + k] & 255);
    if (x !== y) return x - y;
    if (!x) return 0;
  }
  return 0;
}

export function strcasecmp(p: Ptr, q: Ptr): number {
  return strncasecmp(p, q, Infinity);
}

/** memccpy(): copies up to n bytes, up to and including the first c; the place after it, or NULL */
export function memccpy(d: Ptr, s: Ptr, c: number, n: number): Ptr | null {
  c &= 255;
  for (let i = 0; i < n; i++) {
    const v = s.a[s.o + i];
    d.a[d.o + i] = v;
    if ((v & 255) === c) return new Ptr(d.a, d.o + i + 1);
  }
  return null;
}

export function bzero(p: any, n: number): void {
  memset(p, 0, n);
}

let tokSave: Ptr | null = null;

/** strtok() */
export function strtok(s: Ptr | null, delim: Ptr): Ptr | null {
  const d = jstr(delim);
  const p = s ?? tokSave;
  if (!p) return null;
  let i = p.o;
  while (p.a[i] && d.includes(String.fromCharCode(p.a[i] & 255))) i++;
  if (!p.a[i]) {
    tokSave = null;
    return null;
  }
  const start = i;
  while (p.a[i] && !d.includes(String.fromCharCode(p.a[i] & 255))) i++;
  if (p.a[i]) {
    p.a[i] = 0;
    tokSave = new Ptr(p.a, i + 1);
  } else tokSave = null;
  return new Ptr(p.a, start);
}
