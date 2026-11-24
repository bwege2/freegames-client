// OpenClonk port: the C library as the translated code calls it (re/openclonk/tools/cpp2ts/config.py LIBC), on
// rt/ptr.ts pointers. Strings are char arrays (Int8Array) with a NUL; sizes are numbers.
import { Ptr, S, $fieldOf } from './ptr.ts';
import { sprintf, type PrintfArg } from './printf.ts';
import { crc32 as crc32bytes } from './StdBuf.ts';
import { fileWrite } from './fs.ts';

const dec = new TextDecoder();

/** where printf and the standard streams write: replaceable (tests capture it) */
export const $io = {
  out: (s: string) => { typeof process !== 'undefined' && process.stdout ? process.stdout.write(s) : console.log(s); },
  err: (s: string) => { typeof process !== 'undefined' && process.stderr ? process.stderr.write(s) : console.error(s); },
};
declare const process: any;

export const c$stdout = { fd: 1 };
export const c$stderr = { fd: 2 };
export const c$stdin = { fd: 0 };
export let c$errno = 0;

function u8(c: number): number {
  return c & 0xff;
}

/** the bytes of a C string */
function bytes(p: Ptr): Uint8Array {
  const a = p.a as Int8Array;
  let e = p.o;
  while (e < a.length && a[e]) e++;
  // a std::vector<char> is a JavaScript array
  if (!ArrayBuffer.isView(a)) return Uint8Array.from((a as unknown as number[]).slice(p.o, e), (c) => c & 0xff);
  return new Uint8Array(a.buffer, a.byteOffset + p.o, e - p.o);
}

export function $text(p: Ptr): string {
  return dec.decode(bytes(p));
}

export function c$strlen(p: Ptr): number {
  const a = p.a;
  let e = p.o;
  while (a[e]) e++;
  return e - p.o;
}

export function c$strnlen(p: Ptr, n: number): number {
  const a = p.a;
  let e = p.o;
  while (e - p.o < n && a[e]) e++;
  return e - p.o;
}

export function c$strcmp(p: Ptr, q: Ptr): number {
  const a = p.a, b = q.a;
  let i = p.o, j = q.o;
  for (;;) {
    const x = u8(a[i] ?? 0), y = u8(b[j] ?? 0);
    if (x !== y) return x - y;
    if (!x) return 0;
    i++;
    j++;
  }
}

export function c$strncmp(p: Ptr, q: Ptr, n: number): number {
  const a = p.a, b = q.a;
  for (let k = 0; k < n; k++) {
    const x = u8(a[p.o + k] ?? 0), y = u8(b[q.o + k] ?? 0);
    if (x !== y) return x - y;
    if (!x) return 0;
  }
  return 0;
}

const lower = (c: number) => (c >= 65 && c <= 90 ? c + 32 : c);

export function c$strcasecmp(p: Ptr, q: Ptr): number {
  for (let k = 0; ; k++) {
    const x = lower(u8(p.a[p.o + k] ?? 0)), y = lower(u8(q.a[q.o + k] ?? 0));
    if (x !== y) return x - y;
    if (!x) return 0;
  }
}

export function c$strncasecmp(p: Ptr, q: Ptr, n: number): number {
  for (let k = 0; k < n; k++) {
    const x = lower(u8(p.a[p.o + k] ?? 0)), y = lower(u8(q.a[q.o + k] ?? 0));
    if (x !== y) return x - y;
    if (!x) return 0;
  }
  return 0;
}

export function c$strchr(p: Ptr, c: number): Ptr | null {
  const a = p.a;
  c = (c << 24) >> 24;
  for (let i = p.o; ; i++) {
    if (a[i] === c) return new Ptr(a, i);
    if (!a[i]) return null;
  }
}

export function c$strrchr(p: Ptr, c: number): Ptr | null {
  const a = p.a;
  c = (c << 24) >> 24;
  let r: Ptr | null = null;
  for (let i = p.o; ; i++) {
    if (a[i] === c) r = new Ptr(a, i);
    if (!a[i]) return r;
  }
}

export function c$strstr(h: Ptr, n: Ptr): Ptr | null {
  const nl = c$strlen(n);
  const hl = c$strlen(h);
  outer: for (let i = 0; i + nl <= hl; i++) {
    for (let k = 0; k < nl; k++) if (h.a[h.o + i + k] !== n.a[n.o + k]) continue outer;
    return new Ptr(h.a, h.o + i);
  }
  return null;
}

export function c$strpbrk(p: Ptr, set: Ptr): Ptr | null {
  const s = bytes(set);
  for (let i = p.o; p.a[i]; i++) if (s.includes(u8(p.a[i]))) return new Ptr(p.a, i);
  return null;
}

export function c$strspn(p: Ptr, set: Ptr): number {
  const s = bytes(set);
  let i = p.o;
  while (p.a[i] && s.includes(u8(p.a[i]))) i++;
  return i - p.o;
}

export function c$strcspn(p: Ptr, set: Ptr): number {
  const s = bytes(set);
  let i = p.o;
  while (p.a[i] && !s.includes(u8(p.a[i]))) i++;
  return i - p.o;
}

export function c$strcpy(d: Ptr, s: Ptr): Ptr {
  let i = 0;
  for (;; i++) {
    const c = s.a[s.o + i];
    d.a[d.o + i] = c;
    if (!c) break;
  }
  return d;
}

export function c$strncpy(d: Ptr, s: Ptr, n: number): Ptr {
  let i = 0;
  for (; i < n && s.a[s.o + i]; i++) d.a[d.o + i] = s.a[s.o + i];
  for (; i < n; i++) d.a[d.o + i] = 0;
  return d;
}

export function c$strcat(d: Ptr, s: Ptr): Ptr {
  c$strcpy(d.add(c$strlen(d)), s);
  return d;
}

export function c$strncat(d: Ptr, s: Ptr, n: number): Ptr {
  const e = d.add(c$strlen(d));
  let i = 0;
  for (; i < n && s.a[s.o + i]; i++) e.a[e.o + i] = s.a[s.o + i];
  e.a[e.o + i] = 0;
  return d;
}

export function c$strdup(s: Ptr): Ptr {
  const b = bytes(s);
  const a = new Int8Array(b.length + 1);
  a.set(b);
  return new Ptr(a, 0);
}

function size1(a: any): number {
  return a.BYTES_PER_ELEMENT ?? 1;
}

/** the C++ layout of a plain struct's class (the translator writes it: static $layout, $size) */
function layoutOf(o: any): { layout: [string, number, string, number][]; size: number } | null {
  const c = o?.constructor;
  return c && c.$layout ? { layout: c.$layout, size: c.$size } : null;
}
const GETTERS: Record<string, string> = { i8: 'getInt8', u8: 'getUint8', i16: 'getInt16', u16: 'getUint16', i32: 'getInt32', u32: 'getUint32', f32: 'getFloat32', f64: 'getFloat64' };
const BYTES: Record<string, number> = { i8: 1, u8: 1, i16: 2, u16: 2, i32: 4, u32: 4, f32: 4, f64: 8 };
/** n bytes of consecutive structs (the first, and the ones after it in its array: $a, $i) into bytes, or back */
function structsToBytes(first: any, out: Uint8Array, n: number): void {
  const { layout, size } = layoutOf(first)!;
  const arr: any[] = first.$a ?? [first];
  const start: number = first.$a ? first.$i : 0;
  const view = new DataView(out.buffer, out.byteOffset, out.byteLength);
  for (let k = 0; k * size < n && start + k < arr.length; k++) {
    const o = arr[start + k];
    for (const [path, off, kind, count] of layout) {
      const [holder, name] = $fieldOf(o, path);
      const v = holder[name];
      for (let j = 0; j < Math.max(1, count); j++) {
        const at = k * size + off + j * BYTES[kind];
        if (at + BYTES[kind] > n) break;
        const x = Number(count ? v[j] : typeof v === 'boolean' ? +v : v) || 0;
        (view as any)['s' + GETTERS[kind].slice(1)](at, kind[0] === 'f' ? x : x | 0, true);
      }
    }
  }
}
function bytesOfPtr(p: Ptr, n: number): Uint8Array | null {
  const a: any = p.a;
  return ArrayBuffer.isView(a) ? new Uint8Array(a.buffer, a.byteOffset + (p.o as number) * size1(a), n) : null;
}

export function c$memcpy(d: any, s: any, n: number): any {
  if (d instanceof Ptr && s && typeof s === 'object' && !(s instanceof Ptr) && layoutOf(s) && bytesOfPtr(d, n)) {
    // structs of numbers into bytes (StdMesh::UpdateVBO: memcpy(cursor, &SharedVertices[0], size) into a mapped
    // buffer): their C++ layout
    structsToBytes(s, bytesOfPtr(d, n)!, n);
    return d;
  }
  if (d instanceof Ptr && s && typeof s === 'object' && !(s instanceof Ptr) && 'val' in s) {
    // memcpy(&int32, &C4Fixed, 4): the fixed-point value is the object's field
    d.a[d.o] = s.val;
    return d;
  }
  if (!(d instanceof Ptr) && s instanceof Ptr && d && typeof d === 'object' && 'val' in d) {
    d.val = s.a[s.o];
    return d;
  }
  if (!(d instanceof Ptr)) {
    // A struct copied as bytes. Do not call the class's own $assign: a memcpy of a C4IDList
    // would recurse into C4IDList::operator=. Copy the fields, as the byte copy does.
    if (d && typeof d === 'object' && s && typeof s === 'object') {
      for (const k of Object.keys(s)) {
        if (k.startsWith('$')) continue;
        const v = s[k];
        if (ArrayBuffer.isView(v)) (d as any)[k] = (v as any).slice();
        else if (Array.isArray(v)) (d as any)[k] = v.slice();
        else (d as any)[k] = v;
      }
    }
    return d;
  }
  if ((d as any).$obj !== undefined || (s as any).$obj !== undefined) {
    // a struct's bytes on either side (rt/ptr.ts $bytesView): byte by byte, through typed arrays' bytes
    const bytes = (p: any) => (ArrayBuffer.isView(p.a) ? new Uint8Array(p.a.buffer, p.a.byteOffset + p.o * size1(p.a)) : null);
    const db = bytes(d), sb = bytes(s);
    for (let i = 0; i < n; i++) {
      const b = sb ? sb[i] : s.a[s.o + i] & 0xff;
      if (db) db[i] = b;
      else d.a[d.o + i] = b;
    }
    return d;
  }
  const k = n / size1(d.a);
  if (ArrayBuffer.isView(d.a) && ArrayBuffer.isView(s.a) && (d.a as any).constructor === (s.a as any).constructor) {
    (d.a as any).set((s.a as any).subarray(s.o, s.o + k), d.o);
  } else if (ArrayBuffer.isView(d.a) && ArrayBuffer.isView(s.a)) {
    // between arrays of different element types: the bytes, as C copies them (little-endian, as x86)
    const da = d.a as any, sa = s.a as any;
    new Uint8Array(da.buffer, da.byteOffset + d.o * size1(da), n).set(new Uint8Array(sa.buffer, sa.byteOffset + s.o * size1(sa), n));
  } else {
    for (let i = 0; i < k; i++) d.a[d.o + i] = s.a[s.o + i];
  }
  return d;
}

export function c$memmove(d: any, s: any, n: number): any {
  if (!(d instanceof Ptr)) return c$memcpy(d, s, n);
  const k = n / size1(d.a);
  const tmp = Array.prototype.slice.call(s.a, s.o, s.o + k);
  for (let i = 0; i < k; i++) d.a[d.o + i] = tmp[i];
  return d;
}

export function c$memset(d: any, v: number, n: number): any {
  if (!(d instanceof Ptr)) return d;
  if (ArrayBuffer.isView(d.a)) {
    const k = n / size1(d.a);
    (d.a as any).fill(size1(d.a) === 1 ? v : 0, d.o, d.o + k);
    return d;
  }
  if (d.a.length && ArrayBuffer.isView(d.a[0])) {
    // char[10][4097]: a JS array of typed arrays, zeroed as one block of bytes
    let left = n;
    for (let i = d.o; i < d.a.length && left > 0; i++) {
      const e = d.a[i];
      if (!ArrayBuffer.isView(e)) continue;
      const k = Math.min(e.byteLength, left);
      (e as any).fill(v & 0xff, 0, k);
      left -= k;
    }
    return d;
  }
  const k = n / size1(d.a);
  for (let i = 0; i < k; i++) d.a[d.o + i] = v ? v : (typeof d.a[d.o + i] === 'number' ? 0 : null);
  return d;
}

export function c$memcmp(p: Ptr, q: Ptr, n: number): number {
  if (!p || !q) return p === q ? 0 : (p ? 1 : -1);
  if (!(p instanceof Ptr) || !(q instanceof Ptr)) {
    const av = p && typeof p === 'object' ? ((p as any).v ?? (p as any).GetHandle?.() ?? p) : p;
    const bv = q && typeof q === 'object' ? ((q as any).v ?? (q as any).GetHandle?.() ?? q) : q;
    return av === bv ? 0 : (av < bv ? -1 : 1);
  }
  if (Array.isArray(p.a) && Array.isArray(q.a)) {
    // memcmp over arrays of objects (C4ID: a value per 8-byte element)
    const count = Math.floor(n / 8);
    for (let i = 0; i < count; i++) {
      const a = p.a[p.o + i], b = q.a[q.o + i];
      const av = a && typeof a === 'object' ? (a.v ?? a.GetHandle?.() ?? a) : a;
      const bv = b && typeof b === 'object' ? (b.v ?? b.GetHandle?.() ?? b) : b;
      if (av !== bv) return av < bv ? -1 : 1;
    }
    return 0;
  }
  for (let i = 0; i < n; i++) {
    const x = u8(p.a[p.o + i]), y = u8(q.a[q.o + i]);
    if (x !== y) return x - y;
  }
  return 0;
}

export function c$memchr(p: Ptr, c: number, n: number): Ptr | null {
  c &= 0xff;
  for (let i = 0; i < n; i++) if (u8(p.a[p.o + i]) === c) return new Ptr(p.a, p.o + i);
  return null;
}

// character classes of the "C" locale
export const c$toupper = (c: number) => (c >= 97 && c <= 122 ? c - 32 : c);
export const c$tolower = (c: number) => (c >= 65 && c <= 90 ? c + 32 : c);
export const c$isspace = (c: number) => (c === 32 || (c >= 9 && c <= 13) ? 1 : 0);
export const c$isdigit = (c: number) => (c >= 48 && c <= 57 ? 1 : 0);
export const c$isalpha = (c: number) => ((c >= 65 && c <= 90) || (c >= 97 && c <= 122) ? 1 : 0);
export const c$isalnum = (c: number) => (c$isalpha(c) || c$isdigit(c) ? 1 : 0);
export const c$isupper = (c: number) => (c >= 65 && c <= 90 ? 1 : 0);
export const c$islower = (c: number) => (c >= 97 && c <= 122 ? 1 : 0);
export const c$isxdigit = (c: number) => (c$isdigit(c) || (c >= 65 && c <= 70) || (c >= 97 && c <= 102) ? 1 : 0);
export const c$iscntrl = (c: number) => ((c >= 0 && c < 32) || c === 127 ? 1 : 0);
export const c$isprint = (c: number) => (c >= 32 && c < 127 ? 1 : 0);
export const c$isgraph = (c: number) => (c > 32 && c < 127 ? 1 : 0);
export const c$ispunct = (c: number) => (c$isgraph(c) && !c$isalnum(c) ? 1 : 0);

// math
export const c$sqrt = Math.sqrt, c$sin = Math.sin, c$cos = Math.cos, c$tan = Math.tan, c$atan = Math.atan;
export const c$atan2 = Math.atan2, c$asin = Math.asin, c$acos = Math.acos, c$pow = Math.pow, c$exp = Math.exp;
export const c$log = Math.log, c$log10 = Math.log10, c$log2 = Math.log2, c$floor = Math.floor, c$ceil = Math.ceil;
export const c$fabs = Math.abs, c$trunc = Math.trunc, c$hypot = Math.hypot;
export const c$fmod = (a: number, b: number) => a % b;
export const c$round = (x: number) => (x < 0 ? -Math.round(-x) : Math.round(x));
export const c$lround = c$round;
export const c$sqrtf = (x: number) => Math.fround(Math.sqrt(x));
export const c$sinf = (x: number) => Math.fround(Math.sin(x));
export const c$cosf = (x: number) => Math.fround(Math.cos(x));
export const c$atan2f = (y: number, x: number) => Math.fround(Math.atan2(y, x));
export const c$fabsf = (x: number) => Math.abs(x);
export const c$floorf = (x: number) => Math.floor(x);
export const c$ceilf = (x: number) => Math.ceil(x);
export const c$powf = (x: number, y: number) => Math.fround(Math.pow(x, y));
export const c$fmodf = (a: number, b: number) => Math.fround(a % b);
export const c$roundf = (x: number) => c$round(x);
export const c$hypotf = (x: number, y: number) => Math.fround(Math.hypot(x, y));
export function $isnan(x: number) { return Number.isNaN(x); }
export function $isinf(x: number) { return x === Infinity || x === -Infinity; }
export function $isfinite(x: number) { return Number.isFinite(x); }

// numbers from text
function strtoX(s: Ptr, end: Ptr | null, base: number, unsigned: boolean): number {
  let i = s.o;
  const a = s.a;
  while (c$isspace(u8(a[i]))) i++;
  let neg = false;
  if (a[i] === 45) { neg = true; i++; } else if (a[i] === 43) i++;
  if ((base === 0 || base === 16) && a[i] === 48 && (a[i + 1] === 120 || a[i + 1] === 88) && c$isxdigit(u8(a[i + 2]))) {
    base = 16;
    i += 2;
  } else if (base === 0) base = a[i] === 48 ? 8 : 10;
  let v = 0;
  const start = i;
  for (;; i++) {
    const c = u8(a[i] ?? 0);
    const d = c >= 48 && c <= 57 ? c - 48 : c >= 97 && c <= 122 ? c - 87 : c >= 65 && c <= 90 ? c - 55 : 99;
    if (d >= base) break;
    v = v * base + d;
  }
  if (end) end.a[end.o] = i === start ? s : new Ptr(a, i);
  if (neg) v = -v;
  if (!unsigned) v = Math.max(-(2 ** 63), Math.min(2 ** 63 - 1, v));
  else if (v < 0) v += 2 ** 64;
  return v;
}

export const c$strtol = (s: Ptr, e: Ptr | null, b: number) => strtoX(s, e, b, false);
export const c$strtoll = (s: Ptr, e: Ptr | null, b: number) => BigInt(strtoX(s, e, b, false));
export const c$strtoul = (s: Ptr, e: Ptr | null, b: number) => strtoX(s, e, b, true);
export const c$strtoull = (s: Ptr, e: Ptr | null, b: number) => BigInt(strtoX(s, e, b, true));
export const c$atoi = (s: Ptr) => strtoX(s, null, 10, false) | 0;
export const c$atol = (s: Ptr) => strtoX(s, null, 10, false);
export const c$atoll = (s: Ptr) => BigInt(strtoX(s, null, 10, false));

export function c$strtod(s: Ptr, end: Ptr | null): number {
  const t = $text(s);
  const m = /^\s*[-+]?(\d+\.?\d*([eE][-+]?\d+)?|\.\d+([eE][-+]?\d+)?|inf(inity)?|nan)/i.exec(t);
  if (!m) {
    if (end) end.a[end.o] = s;
    return 0;
  }
  if (end) end.a[end.o] = new Ptr(s.a, s.o + new TextEncoder().encode(m[0]).length);
  return parseFloat(m[0].replace(/inf(inity)?/i, 'Infinity'));
}
export const c$strtof = (s: Ptr, e: Ptr | null) => Math.fround(c$strtod(s, e));
export const c$atof = (s: Ptr) => c$strtod(s, null);

// printf and friends

function args(list: any[]): PrintfArg[] {
  return list.map((x) => (x instanceof Ptr ? bytes(x) : x === null ? null : x));
}

function vargs(va: any): any[] {
  if (va && Array.isArray(va.a)) return va.a.slice(va.i);
  return [];
}

function format(fmt: Ptr, list: any[]): Uint8Array {
  if (list.some((x) => x === undefined)) throw new Error(`printf: an undefined argument for "${$text(fmt)}" (${list.length} arguments)`);
  return sprintf(bytes(fmt), args(list));
}

function store(buf: Ptr, n: number, out: Uint8Array): number {
  if (n > 0) {
    const k = Math.min(out.length, n - 1);
    for (let i = 0; i < k; i++) buf.a[buf.o + i] = (out[i] << 24) >> 24;
    buf.a[buf.o + k] = 0;
  }
  return out.length;
}

export function c$sprintf(buf: Ptr, fmt: Ptr, ...a: any[]): number {
  return store(buf, Infinity, format(fmt, a));
}
export function c$snprintf(buf: Ptr, n: number, fmt: Ptr, ...a: any[]): number {
  return store(buf, n, format(fmt, a));
}
export function c$vsnprintf(buf: Ptr, n: number, fmt: Ptr, va: any): number {
  return store(buf, n, format(fmt, vargs(va)));
}
export function c$vsprintf(buf: Ptr, fmt: Ptr, va: any): number {
  return store(buf, Infinity, format(fmt, vargs(va)));
}
/** vasprintf(&p, fmt, args): a new string */
export function c$vasprintf(strp: Ptr, fmt: Ptr, va: any): number {
  const out = format(fmt, vargs(va));
  const a = new Int8Array(out.length + 1);
  a.set(out);
  strp.a[strp.o] = new Ptr(a, 0);
  return out.length;
}

function write(stream: any, b: Uint8Array): void {
  if (stream !== c$stdout && stream !== c$stderr && stream?.fd > 2) {
    fileWrite(stream, b);
    return;
  }
  const s = dec.decode(b);
  if (stream === c$stderr) $io.err(s); else $io.out(s);
}

export function c$printf(fmt: Ptr, ...a: any[]): number {
  const b = format(fmt, a);
  write(c$stdout, b);
  return b.length;
}
export function c$fprintf(stream: any, fmt: Ptr, ...a: any[]): number {
  const b = format(fmt, a);
  write(stream, b);
  return b.length;
}
export function c$vprintf(fmt: Ptr, va: any): number {
  return c$printf(fmt, ...vargs(va));
}
export function c$vfprintf(stream: any, fmt: Ptr, va: any): number {
  return c$fprintf(stream, fmt, ...vargs(va));
}
export function c$puts(s: Ptr): number {
  write(c$stdout, new Uint8Array([...bytes(s), 10]));
  return 0;
}
export function c$fputs(s: Ptr, stream: any): number {
  write(stream, bytes(s));
  return 0;
}
export function c$fputc(c: number, stream: any): number {
  write(stream, new Uint8Array([c & 0xff]));
  return c;
}
export function c$putchar(c: number): number {
  return c$fputc(c, c$stdout);
}
export function c$fflush(_s: any): number {
  return 0;
}
export function c$perror(s: Ptr): void {
  $io.err($text(s) + '\n');
}

// memory

export function c$malloc(n: number): Ptr {
  return new Ptr(new Int8Array(n), 0);
}
export function c$calloc(n: number, k: number): Ptr {
  return new Ptr(new Int8Array(n * k), 0);
}
export function c$realloc(p: Ptr | null, n: number): Ptr {
  const a = new Int8Array(n);
  if (p) a.set((p.a as Int8Array).subarray(p.o, p.o + Math.min(n, (p.a as Int8Array).length - p.o)));
  return new Ptr(a, 0);
}
export function c$free(_p: any): void {}

// the rest

export function c$abort(): never {
  throw new Error('abort()');
}
/**
 * setjmp/longjmp, as libpng and libjpeg report errors (StdPNG.cpp, C4SurfaceLoaders.cpp: `if (setjmp(...)) return false;`):
 * JavaScript cannot return to a setjmp point a second time, so setjmp returns 0 (the first return) and longjmp throws.
 * The runtime's image libraries (rt/libpng.ts, rt/libjpeg.ts) call longjmp only for a corrupt file, which the original's
 * content does not have.
 */
export function c$_setjmp(_env: unknown): number { return 0; }
export function c$longjmp(_env: unknown, value: number): never {
  throw new Error(`longjmp(${value}): an image library failed`);
}
/** getopt's globals (C4Application::ParseCommandLine reads optind) */
export const $getopt = { optind: 1, optarg: null as Ptr | null, opterr: 1, optopt: 0 };
/**
 * getopt_long(argc, argv, shortopts, longopts, &index) as glibc's for what the original's command line has: long options
 * (--name, --name=value, --name value), options without an argument that set a flag (flag != null: *flag = val, returns
 * 0), the end of the options at the first argument that is no option (glibc permutes; the page passes the options
 * first) or at "--". Short options are not used by the original's calls (its option string is never matched).
 */
export function c$getopt_long(argc: number, argv: Ptr, _short: Ptr, longopts: any, index: Ptr | null): number {
  const g = $getopt;
  g.optarg = null;
  if (g.optind >= argc) return -1;
  const arg: Ptr = argv.a[argv.o + g.optind];
  const text = $text(arg);
  if (text === '--') { g.optind++; return -1; }
  if (!text.startsWith('--')) return -1;
  const eq = text.indexOf('=');
  const name = text.slice(2, eq < 0 ? undefined : eq);
  // &long_options[0]: an element of an object array (it knows its array, $a, and place, $i), or a Ptr
  const list = Array.isArray(longopts) ? longopts : longopts.$a ? longopts.$a.slice(longopts.$i) : longopts.a.slice(longopts.o);
  const i = list.findIndex((o: any) => o.name && $text(o.name) === name);
  g.optind++;
  if (i < 0) return 63;     // '?'
  const o = list[i];
  if (index) index.a[index.o] = i;
  if (o.has_arg === 1) {         // required_argument
    if (eq >= 0) g.optarg = arg.add(eq + 1);
    else if (g.optind < argc) g.optarg = argv.a[argv.o + g.optind++];
    else return 63;
  } else if (o.has_arg === 2 && eq >= 0) g.optarg = arg.add(eq + 1);
  if (o.flag) { o.flag.a[o.flag.o] = o.val; return 0; }
  return o.val;
}
export function c$exit(code: number): never {
  throw new Error(`exit(${code})`);
}
export function c$time(t: Ptr | null): number {
  const s = Math.floor(Date.now() / 1000);
  if (t) t.a[t.o] = s;
  return s;
}
/**
 * the environment of the original's process as the page runs it: HOME (C4Config: the user folder $HOME/.clonk/openclonk,
 * the config file $HOME/.clonk/openclonk/config) is the player's home folder of the in-memory file system; nothing else
 * is set (TMPDIR unset: /tmp/)
 */
export const ENVIRONMENT: Record<string, string> = { HOME: '/home/player' };
const envCache = new Map<string, Ptr>();
export function c$getenv(name: Ptr): Ptr | null {
  const k = $text(name);
  const v = ENVIRONMENT[k];
  if (v === undefined) return null;
  let p = envCache.get(k);
  if (!p || $text(p) !== v) { p = S(v); envCache.set(k, p); }
  return p;
}
export function c$crc32(crc: number, p: Ptr | null, n: number): number {
  if (!p) return 0;
  const a = p.a as Int8Array;
  return crc32bytes(crc >>> 0, new Uint8Array(a.buffer, a.byteOffset + p.o, n));
}
export function c$qsort(base: Ptr, n: number, size: number, cmp: (a: Ptr, b: Ptr) => number): void {
  const k = size / (base.a.BYTES_PER_ELEMENT ?? 8);
  const items: any[][] = [];
  for (let i = 0; i < n; i++) items.push(Array.prototype.slice.call(base.a, base.o + i * k, base.o + (i + 1) * k));
  const ptrs = items.map((it) => new Ptr(it, 0));
  ptrs.sort((x, y) => cmp(x, y));
  ptrs.forEach((p, i) => { for (let j = 0; j < k; j++) base.a[base.o + i * k + j] = p.a[j]; });
}

// files: rt/fs.ts
export * from './fs.ts';
export function c$isatty(): number { return 0; }

/** the small sscanf subset the platform file code uses: %d/%i/%x/%g and %n */
export function c$sscanf(src: Ptr, fmt: Ptr, ...out: Ptr[]): number {
  const text = cstr(src), f = cstr(fmt);
  let ti = 0, fi = 0, n = 0;
  const num = (base: number, float: boolean): number | null => {
    while (ti < text.length && /\s/.test(text[ti])) ti++;
    const m = float ? /^[-+]?(?:\d+\.?\d*|\.\d+)(?:[eE][-+]?\d+)?/.exec(text.slice(ti))
      : (base === 16 ? /^(?:0x)?[0-9a-fA-F]+/.exec(text.slice(ti))
        : /^[-+]?\d+/.exec(text.slice(ti)));
    if (!m) return null;
    ti += m[0].length;
    return float ? Number(m[0]) : parseInt(m[0], base);
  };
  while (fi < f.length && n < out.length) {
    // white space matches any white space of the input, an ordinary character the same character (or the scan stops:
    // C4KeyCodeEx::String2KeyCode tries "\\x%x" on every key name, and "ControllerLeftStickRight" is no hex code)
    if (/\s/.test(f[fi])) {
      while (fi < f.length && /\s/.test(f[fi])) fi++;
      while (ti < text.length && /\s/.test(text[ti])) ti++;
      continue;
    }
    if (f[fi] !== '%' || f[fi + 1] === '%') {
      const c = f[fi] === '%' ? (fi++, '%') : f[fi];
      if (text[ti] !== c) break;
      fi++;
      ti++;
      continue;
    }
    fi++;
    let width = 0;
    while (/\d/.test(f[fi] ?? '')) { width = width * 10 + Number(f[fi]); fi++; }
    const spec = f[fi++] ?? 'd';
    if (spec === 'n') { out[n].a[out[n].o] = ti; n++; continue; }
    if (spec === 's') {
      while (ti < text.length && /\s/.test(text[ti])) ti++;
      const m = /^\S+/.exec(text.slice(ti));
      if (!m) break;
      const take = width ? m[0].slice(0, width) : m[0];
      const p = out[n];
      for (let i = 0; i < take.length; i++) p.a[p.o + i] = take.charCodeAt(i);
      p.a[p.o + take.length] = 0;
      ti += take.length; n++; continue;
    }
    const float = spec === 'f' || spec === 'g' || spec === 'e';
    const base = spec === 'x' ? 16 : spec === 'o' ? 8 : 10;
    const v = num(base, float);
    if (v === null) break;
    out[n].a[out[n].o] = v; n++;
  }
  return n;
}

function cstr(p: Ptr): string {
  const a = p.a as Int8Array;
  let e = p.o;
  while (e < a.length && a[e]) e++;
  return dec.decode(new Uint8Array(a.buffer, a.byteOffset + p.o, e - p.o));
}
export function c$strerror(_errno: number): Ptr { return S('file error'); }
export const c$length = c$strlen;
export function c$npos(): number { return -1; }
/** setlocale: the page's C library formats as the "C" locale only (C4AbstractApp::Init asks for the environment's, "",
 *  which is "C" without LANG). The messages' locale is the environment's LANG (the page sets it from the browser's
 *  language): IsGermanSystem asks setlocale(LC_MESSAGES, NULL) whether it is German (C4ConfigGeneral::DefaultLanguage) */
const C_LOCALE = S('C');
const LC_MESSAGES = 5;
let messages: Ptr | null = null;
export function c$setlocale(category: number, locale: Ptr | null): Ptr {
  if (category === LC_MESSAGES && locale === null && ENVIRONMENT.LANG) {
    if (!messages || $text(messages) !== ENVIRONMENT.LANG) messages = S(ENVIRONMENT.LANG);
    return messages;
  }
  return C_LOCALE;
}
export function c$strftime(_buf: Ptr, _max: number, _fmt: Ptr, _tm: any): number { return 0; }
export function c$localtime(_t: Ptr): any { return { tm_sec: 0, tm_min: 0, tm_hour: 0, tm_mday: 1, tm_mon: 0, tm_year: 0, tm_wday: 0, tm_yday: 0, tm_isdst: 0 }; }
/** execv (RestartApplication): the page cannot start another program */
export function c$execv(_path: Ptr, _argv: Ptr): number { return -1; }
export function c$execvp(_file: Ptr, _argv: Ptr): number { return -1; }
/** sched_yield (CPNGFile::WaitForSaves waits for its saving threads; the page has one thread and saves at once) */
export function c$sched_yield(): number { return 0; }
