// C's pointers and memory, as the translated code uses them (re/nethack/tools/c2ts/CONVENTIONS.md):
//   - a pointer to a struct or union is the object itself (or null); arrays of structs are JS arrays
//     whose elements know their array ($a) and index ($i), for pointer arithmetic;
//   - every other pointer is a Ptr: an array (a typed array for numbers, a JS array for pointers, or an
//     object whose property is pointed to) and an index into it (or a property name);
//   - char is Int8Array (signed, as on x86), unsigned char Uint8Array, long Float64Array.

/** A C pointer to something that is not a struct: array `a`, element `o`. */
export class Ptr {
  a: any;
  o: any;
  constructor(a: any, o: any) {
    this.a = a;
    this.o = o;
  }
  /** this + n */
  add(n: number): Ptr {
    return new Ptr(this.a, this.o + n);
  }
}

/** &a[o] (a row of a 2-dimensional array of numbers: into the whole array, which is contiguous as in C) */
export function P(a: any, o: any = 0): Ptr {
  if (a.$flat) return new Ptr(a.$flat, a.$off + o);
  return new Ptr(a, o);
}

/** rows of numbers made contiguous: one typed array, the rows views of it */
export function $rows(rows: any[]): any[] {
  if (!rows.length || !ArrayBuffer.isView(rows[0])) return rows;
  const T: any = rows[0].constructor;
  const m = (rows[0] as any).length;
  if (!rows.every((r) => r.constructor === T && r.length === m)) return rows;
  const flat = new T(rows.length * m);
  for (let i = 0; i < rows.length; i++) {
    flat.set(rows[i], i * m);
    const v = flat.subarray(i * m, (i + 1) * m);
    v.$flat = flat;
    v.$off = i * m;
    rows[i] = v;
  }
  return rows;
}

/** *(p + k) */
export function $rd(p: Ptr, k = 0): any {
  return p.a[k ? p.o + k : p.o];
}

/** *(p + k) = v */
export function $wr(p: Ptr, k: number, v: any): any {
  p.a[k ? p.o + k : p.o] = v;
  return v;
}

/** p == q for pointers that may be Ptrs */
export function $peq(p: any, q: any): boolean {
  if (p === q) return true;
  if (p instanceof Ptr && q instanceof Ptr) return p.a === q.a && p.o === q.o;
  // a union's pointer member that was never set holds 0
  return (p == null || p === 0) && (q == null || q === 0);
}

const literals = new Map<string, Ptr>();

/** A C string literal (its characters and the NUL), the same Ptr for the same text */
export function S(s: string): Ptr {
  let p = literals.get(s);
  if (!p) {
    const a = new Int8Array(s.length + 1);
    for (let i = 0; i < s.length; i++) a[i] = s.charCodeAt(i);
    p = new Ptr(a, 0);
    literals.set(s, p);
  }
  return p;
}

/** char buf[n] = "..." */
export function $cs(s: string, n: number): Int8Array {
  const a = new Int8Array(Math.max(n, s.length));
  for (let i = 0; i < s.length; i++) a[i] = s.charCodeAt(i);
  return a;
}

/** an array of numbers with initial values */
export function $ta(T: any, n: number, vals: number[]): any {
  const a = new T(Math.max(n, vals.length));
  a.set(vals);
  return a;
}

/** (char *) of an unsigned char * and the other way round: a view of the same bytes */
export function $view8(p: Ptr | null, signed: boolean): Ptr | null {
  if (!p) return p;
  const a = p.a;
  if (signed ? a instanceof Int8Array : a instanceof Uint8Array) return p;
  const v = signed ? new Int8Array(a.buffer, a.byteOffset, a.length) : new Uint8Array(a.buffer, a.byteOffset, a.length);
  return new Ptr(v, p.o);
}

/** (unsigned long) of a signed value. NetHack's unsigned longs are bit masks of 32 bits (monster
 * flags, strategies): a negative int becomes its 32-bit pattern, so that & and | (32-bit in JavaScript)
 * give C's low 32 bits; only values below -2^31 get C's 2^64 + x (CONVENTIONS.md). */
export function $u64(x: number): number {
  if (x >= 0) return x;
  return x >= -2147483648 ? x >>> 0 : x + 18446744073709551616;
}

export function $shl64(a: number, b: number): number {
  return a * 2 ** b;
}

export function $shr64(a: number, b: number): number {
  return Math.floor(a / 2 ** b);
}

// ---- arrays of structs ----

/** an array of n new structs */
export function $sarr<T>(C: new () => T, n: number): T[] {
  const a: any = new Array(n);
  for (let i = 0; i < n; i++) {
    const o: any = new C();
    o.$a = a;
    o.$i = i;
    a[i] = o;
  }
  return a;
}

/** alloc(size) for a struct with size - sizeof(struct) more bytes after it (struct engr's text) */
export function $salloc<T>(C: any, size: number): T {
  const a: any = $sarr(C, 1);
  a.$tail = new Int8Array(Math.max(0, size - C.$size));
  return a[0];
}

/** (char *) of a struct pointer: past a struct allocated by $salloc, its extra bytes; else the struct */
export function $bytes(p: any): any {
  if (p instanceof End && p.$a && (p.$a as any).$tail && p.$i === 1) return new Ptr((p.$a as any).$tail, 0);
  return p;
}

/** an array of the given structs */
export function $sarrOf<T>(list: T[]): T[] {
  for (let i = 0; i < list.length; i++) {
    const o: any = list[i];
    o.$a = list;
    o.$i = i;
  }
  return list;
}

/** an array of n elements made by f (rows of a 2-dimensional array know their place: $p, $pi) */
export function $arr<T>(n: number, f: () => T): T[] {
  const a: any = new Array(n);
  for (let i = 0; i < n; i++) {
    const row: any = f();
    if (Array.isArray(row)) {
      (row as any).$p = a;
      (row as any).$pi = i;
    }
    a[i] = row;
  }
  return $rows(a);
}

/** dst = src for arrays inside structs */
export function $cparr(dst: any[], src: any[]): void {
  for (let i = 0; i < dst.length; i++) {
    const d = dst[i];
    if (d && typeof d === 'object') {
      if (d.$cp) d.$cp(src[i]);
      else if (ArrayBuffer.isView(d)) (d as any).set(src[i]);
      else if (Array.isArray(d)) $cparr(d, src[i]);
      else dst[i] = src[i];
    } else dst[i] = src[i];
  }
}

/** dst = src for arrays of pointers inside structs (nested arrays of them too) */
export function $cpvals(dst: any[], src: any[]): void {
  for (let i = 0; i < dst.length; i++) {
    if (Array.isArray(dst[i])) $cpvals(dst[i], src[i]);
    else dst[i] = src[i];
  }
}

/** past the end of an array of structs: only its place is known */
class End {
  $a: any[];
  $i: number;
  constructor(a: any[], i: number) {
    this.$a = a;
    this.$i = i;
  }
}

/** p + n for a pointer into an array of structs (in a 2-dimensional array, across its rows) */
export function $sadd(p: any, n: number): any {
  if (!p) throw new Error('arithmetic on a null struct pointer');
  let a = p.$a;
  if (!a) {
    // a single struct (alloc(sizeof (struct x))): an array of one
    a = [p];
    p.$a = a;
    p.$i = 0;
  }
  let i = p.$i + n;
  if (i >= 0 && i < a.length) return a[i];
  const outer = a.$p;
  if (outer) {
    let r = a.$pi;
    while (i >= a.length && r + 1 < outer.length) {
      i -= a.length;
      a = outer[++r];
    }
    while (i < 0 && r > 0) {
      a = outer[--r];
      i += a.length;
    }
    if (i >= 0 && i < a.length) return a[i];
  }
  return new End(a, i);
}

/** &a[i] for an array of structs, also past its end */
export function $sat(a: any[], i: number): any {
  return i >= 0 && i < a.length ? a[i] : new End(a, i);
}

const outside = new Map<any, any>();

/**
 * a[x][y] of a 2-dimensional array of structs, as C's memory has it: a y outside the row reaches into
 * the rows before and after (levl[x][-1] is levl[x - 1][ROWNO - 1]); outside the whole array (memory
 * the C program does not own) a struct of zeros.
 */
export function $at2(a: any[], x: number, y: number): any {
  const row = a[x];
  if (row !== undefined) {
    const v = row[y];
    if (v !== undefined) return v;
  }
  const n = a[0].length;
  const i = x * n + y;
  if (i >= 0 && i < a.length * n) return a[Math.floor(i / n)][i % n];
  let z = outside.get(a);
  if (!z) {
    z = new a[0][0].constructor();
    outside.set(a, z);
  }
  z.$cp(new a[0][0].constructor());
  return z;
}

/** the index of a struct in its array (in a 2-dimensional array, counted across the rows) */
export function $sidx(p: any): number {
  const a = p.$a;
  return a && a.$p ? a.$pi * a.length + p.$i : p.$i;
}

/** p - q for pointers into an array of structs */
export function $sdiff(p: any, q: any): number {
  return $sidx(p) - $sidx(q);
}

// ---- unions: one value; after a read() from a file, the raw bytes until a member is used ----

/** a struct or array member of a union */
export function $umember(u: any, desc: any[], make: () => any): any {
  if (u.$raw) {
    const v = make();
    decodeInto(v, desc, u.$raw, 0);
    v.$uval = true;
    u.$v = v;
    u.$raw = null;
    return v;
  }
  if (u.$v && typeof u.$v === 'object' && u.$v.$uval) return u.$v;
  u.$v = make();
  u.$v.$uval = true;
  return u.$v;
}

/** a number or pointer member of a union read from a file */
export function $udecode(u: any, desc: any[]): any {
  return decodeScalar(desc, u.$raw, 0);
}

/** a union's value copied: a struct or array member is copied, a pointer member is not */
export function $uclone(v: any): any {
  if (v && typeof v === 'object' && v.$uval) {
    const c = v.$clone ? v.$clone() : v.slice();
    c.$uval = true;
    return c;
  }
  return v;
}

// ---- C's layout of structs: for write() and read() of whole structs ----

/** A pointer read back from a file: not null, but pointing nowhere (the game sets it again). */
export const STALE: any = Object.freeze({ stale: true });

function rdInt(b: Uint8Array, off: number, n: number, signed: boolean): number {
  if (n === 8) {
    // 64 bits: through BigInt, so that -1 stays -1 (a double has 53 bits)
    let v = 0n;
    for (let i = 7; i >= 0; i--) v = (v << 8n) | BigInt(b[off + i] ?? 0);
    return Number(signed ? BigInt.asIntN(64, v) : v);
  }
  let v = 0;
  for (let i = n - 1; i >= 0; i--) v = v * 256 + (b[off + i] ?? 0);
  if (signed && v >= 2 ** (8 * n - 1)) v -= 2 ** (8 * n);
  return v;
}

function wrInt(b: Uint8Array, off: number, n: number, v: number): void {
  if (typeof v !== 'number' || !Number.isFinite(v)) v = v ? 1 : 0;
  if (n === 8) {
    let w = BigInt.asUintN(64, BigInt(Math.trunc(v)));
    for (let i = 0; i < 8; i++) {
      b[off + i] = Number(w & 255n);
      w >>= 8n;
    }
    return;
  }
  if (v < 0) v += 2 ** (8 * n);
  for (let i = 0; i < n; i++) {
    b[off + i] = v % 256;
    v = Math.floor(v / 256);
  }
}

export function sizeOfDesc(desc: any[]): number {
  switch (desc[0]) {
    case 'i':
    case 'd':
      return desc[1];
    case 'p':
      return 8;
    case 'r':
      return desc[1].$size;
    case 'a':
      return sizeOfDesc(desc[1]) * desc[2];
  }
  throw new Error('bad layout ' + desc);
}

function decodeScalar(desc: any[], b: Uint8Array, off: number): any {
  if (desc[0] === 'i') return rdInt(b, off, desc[1], !!desc[2]);
  if (desc[0] === 'p') return rdInt(b, off, 8, false) ? STALE : null;
  if (desc[0] === 'd') return new DataView(b.buffer, b.byteOffset + off, 8).getFloat64(0, true);
  throw new Error('not a scalar ' + desc);
}

function encodeScalar(desc: any[], v: any, b: Uint8Array, off: number): void {
  if (desc[0] === 'i') wrInt(b, off, desc[1], v);
  else if (desc[0] === 'p') wrInt(b, off, 8, v ? (typeof v === 'number' ? v : 1) : 0);
  else if (desc[0] === 'd') new DataView(b.buffer, b.byteOffset + off, 8).setFloat64(0, v, true);
}

/** writes the struct or union o into b at off, in C's layout */
export function encodeStruct(o: any, b: Uint8Array, off: number): void {
  const C = o.constructor;
  if ('$v' in o) {
    // a union
    if (o.$raw) {
      b.set(o.$raw.subarray(0, C.$size), off);
      return;
    }
    const v = o.$v;
    if (v && typeof v === 'object' && v.$cp) encodeStruct(v, b, off);
    else if (v && typeof v === 'object' && !(v === STALE)) wrInt(b, off, 8, 1);
    else wrInt(b, off, Math.min(8, C.$size), typeof v === 'number' ? v : v ? 1 : 0);
    return;
  }
  for (const [name, foff, desc] of C.$layout()) {
    if (desc[0] === 'b') {
      const [, lo, w] = desc;
      const v = o[name] & ((1 << w) - 1);
      // the bits may cross into the next byte
      let word = b[off + foff] | (b[off + foff + 1] << 8) | (b[off + foff + 2] << 16);
      word = (word & ~(((1 << w) - 1) << lo)) | (v << lo);
      b[off + foff] = word & 255;
      if (lo + w > 8) b[off + foff + 1] = (word >> 8) & 255;
      if (lo + w > 16) b[off + foff + 2] = (word >> 16) & 255;
    } else encodeValue(o[name], desc, b, off + foff);
  }
}

function encodeValue(v: any, desc: any[], b: Uint8Array, off: number): void {
  if (desc[0] === 'r') encodeStruct(v, b, off);
  else if (desc[0] === 'a') {
    const es = sizeOfDesc(desc[1]);
    for (let i = 0; i < desc[2]; i++) encodeValue(v[i], desc[1], b, off + i * es);
  } else encodeScalar(desc, v, b, off);
}

/** reads the struct or union o from b at off */
export function decodeStruct(o: any, b: Uint8Array, off: number): void {
  const C = o.constructor;
  if ('$v' in o) {
    o.$raw = b.slice(off, off + C.$size);
    o.$v = 0;
    return;
  }
  for (const [name, foff, desc] of C.$layout()) {
    if (desc[0] === 'b') {
      const [, lo, w, signed] = desc;
      const word = b[off + foff] | (b[off + foff + 1] << 8) | (b[off + foff + 2] << 16);
      let v = (word >> lo) & ((1 << w) - 1);
      if (signed && v >= 1 << (w - 1)) v -= 1 << w;
      o[name] = v;
    } else if (desc[0] === 'r' || desc[0] === 'a') decodeInto(o[name], desc, b, off + foff);
    else o[name] = decodeScalar(desc, b, off + foff);
  }
}

function decodeInto(target: any, desc: any[], b: Uint8Array, off: number): void {
  if (desc[0] === 'r') decodeStruct(target, b, off);
  else if (desc[0] === 'a') {
    const ed = desc[1];
    const es = sizeOfDesc(ed);
    for (let i = 0; i < desc[2]; i++) {
      if (ed[0] === 'r' || ed[0] === 'a') decodeInto(target[i], ed, b, off + i * es);
      else target[i] = decodeScalar(ed, b, off + i * es);
    }
  }
}

/** the element size of a typed array or JS array that a Ptr points into, for byte copies */
export function elemSize(a: any): number {
  if (ArrayBuffer.isView(a)) return (a as any).BYTES_PER_ELEMENT;
  return 8;
}

/** n bytes of memory starting at p (a Ptr, a struct or a struct in an array), in C's layout */
export function memBytes(p: any, n: number): Uint8Array {
  const out = new Uint8Array(n);
  if (p instanceof Ptr) {
    const a = p.a;
    if (a instanceof Int8Array || a instanceof Uint8Array) {
      for (let i = 0; i < n; i++) out[i] = a[p.o + i] & 255;
      return out;
    }
    if (ArrayBuffer.isView(a)) {
      const es = (a as any).BYTES_PER_ELEMENT;
      const signed = a instanceof Int16Array || a instanceof Int32Array;
      for (let i = 0; i * es < n; i++) {
        const v = (a as any)[p.o + i];
        if (a instanceof Float64Array) wrInt(out, i * es, 8, v);
        else wrInt(out, i * es, es, signed && v < 0 ? v + 2 ** (8 * es) : v);
      }
      return out;
    }
    if (Array.isArray(a)) {
      // an array of arrays (a 2-dimensional array's rows) or of pointers
      let off = 0, i = p.o;
      while (off < n) {
        const v = a[i++];
        if (v && typeof v === 'object' && v.constructor && v.constructor.$size) {
          const tmp = new Uint8Array(v.constructor.$size);
          encodeStruct(v, tmp, 0);
          out.set(tmp.subarray(0, Math.min(tmp.length, n - off)), off);
          off += tmp.length;
        } else if (Array.isArray(v) || ArrayBuffer.isView(v)) {
          const sub = memBytes(new Ptr(v, 0), Math.min(n - off, arrayBytes(v)));
          out.set(sub, off);
          off += sub.length;
        } else {
          wrInt(out, off, 8, v ? 1 : 0);
          off += 8;
        }
      }
      return out;
    }
    // a pointer to a property
    const v = a[p.o];
    wrInt(out, 0, Math.min(n, 8), typeof v === 'number' ? v : v ? 1 : 0);
    return out;
  }
  if (p && typeof p === 'object' && p.constructor && p.constructor.$size) {
    const size = p.constructor.$size;
    if (n <= size) {
      const tmp = new Uint8Array(size);
      encodeStruct(p, tmp, 0);
      return tmp.subarray(0, n);
    }
    // consecutive structs of an array, or a struct and the bytes after it ($salloc)
    let off = 0, q = p;
    while (off < n) {
      if (q instanceof End) {
        const tail = (q.$a as any).$tail;
        if (!tail) throw new Error('memory past the end of an array');
        for (let i = 0; off < n && i < tail.length; i++) out[off++] = tail[i] & 255;
        break;
      }
      const tmp = new Uint8Array(size);
      encodeStruct(q, tmp, 0);
      out.set(tmp.subarray(0, Math.min(size, n - off)), off);
      off += size;
      q = $sadd(q, 1);
    }
    return out;
  }
  throw new Error('memory of ' + String(p));
}

function arrayBytes(v: any): number {
  if (ArrayBuffer.isView(v)) return (v as any).byteLength;
  if (Array.isArray(v)) {
    let n = 0;
    for (const x of v) {
      if (x && typeof x === 'object' && x.constructor && x.constructor.$size) n += x.constructor.$size;
      else if (Array.isArray(x) || ArrayBuffer.isView(x)) n += arrayBytes(x);
      else n += 8;
    }
    return n;
  }
  return 8;
}

/** stores n bytes from b into the memory at p (see memBytes) */
export function memStore(p: any, b: Uint8Array, n: number): void {
  if (p instanceof Ptr) {
    const a = p.a;
    if (a instanceof Int8Array || a instanceof Uint8Array) {
      for (let i = 0; i < n; i++) a[p.o + i] = b[i];
      return;
    }
    if (ArrayBuffer.isView(a)) {
      const es = (a as any).BYTES_PER_ELEMENT;
      const signed = !(a instanceof Uint16Array || a instanceof Uint32Array);
      for (let i = 0; i * es < n; i++) (a as any)[p.o + i] = rdInt(b, i * es, es, signed);
      return;
    }
    if (Array.isArray(a)) {
      let off = 0, i = p.o;
      while (off < n) {
        const v = a[i];
        if (v && typeof v === 'object' && v.constructor && v.constructor.$size) {
          decodeStruct(v, b, off);
          off += v.constructor.$size;
        } else if (Array.isArray(v) || ArrayBuffer.isView(v)) {
          const len = Math.min(n - off, arrayBytes(v));
          memStore(new Ptr(v, 0), b.subarray(off, off + len), len);
          off += len;
        } else {
          a[i] = rdInt(b, off, 8, false) ? STALE : null;
          off += 8;
        }
        i++;
      }
      return;
    }
    a[p.o] = rdInt(b, 0, Math.min(n, 8), true);
    return;
  }
  if (p && typeof p === 'object' && p.constructor && p.constructor.$size) {
    const size = p.constructor.$size;
    if (n <= size) {
      if (n < size) {
        const full = new Uint8Array(size);
        encodeStruct(p, full, 0);
        full.set(b.subarray(0, n), 0);
        decodeStruct(p, full, 0);
      } else decodeStruct(p, b, 0);
      return;
    }
    let off = 0, q = p;
    while (off < n) {
      if (q instanceof End) {
        const tail = (q.$a as any).$tail;
        if (!tail) throw new Error('memory past the end of an array');
        for (let i = 0; off < n && i < tail.length; i++) tail[i] = b[off++];
        break;
      }
      decodeStruct(q, b.subarray(off, off + size), 0);
      off += size;
      q = $sadd(q, 1);
    }
    return;
  }
  throw new Error('memory of ' + String(p));
}
