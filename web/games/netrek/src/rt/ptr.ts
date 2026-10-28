// C's pointers and memory, as the translated COW uses them (re/netrek/tools/c2ts/CONVENTIONS.md; from the
// NetHack port's rt/ptr.ts, with unions as bytes and views of structs in bytes for COW, below):
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
  if (typeof o === 'string' && a.$m) {
    // &view->field: a pointer into the bytes (short.c reads the text after a packet's last char)
    const f = a.constructor.$layout().find((x: any[]) => x[0] === o);
    if (f && (f[2][0] === 'i' || f[2][0] === 'd')) {
      const desc = f[2];
      const m: Mem = a.$m;
      const bytes = new Ptr(new Int8Array(m.u8.buffer, m.u8.byteOffset, m.u8.length), a.$o + f[1]);
      if (desc[0] === 'i' && desc[1] === 1) return desc[2] ? bytes : $view8(bytes, false)!;
      return $pcast(bytes, desc[1], desc[0] === 'd' || !!desc[2], desc[0] === 'd')!;
    }
  }
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
  if (p instanceof StructBytes || q instanceof StructBytes) {
    return p instanceof StructBytes && q instanceof StructBytes && p.obj === q.obj && p.o === q.o;
  }
  if (p instanceof Ptr && q instanceof Ptr) return p.a === q.a && p.o === q.o;
  // a union's pointer member that was never set holds 0
  return (p == null || p === 0) && (q == null || q === 0);
}

const literals = new Map<string, Ptr>();

/** a new process: string literals anew (a run may have written into one) */
export function resetLiterals(): void {
  literals.clear();
}

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

interface ElemInfo { u8: Uint8Array; dv: DataView; phase: number; size: number }
const elemInfo = new WeakMap<object, ElemInfo>();
const elemCache = new WeakMap<ArrayBufferLike, Map<string, any>>();

/**
 * (T *) p for numbers of another size than p's (short.c reads ints out of its char buffer): a pointer to
 * the same bytes as elements of `size` bytes, little-endian as on x86-64 (an array-like that reads and
 * writes them; for chars a typed array on them).
 */
export function $pcast(p: Ptr | null, size: number, signed: boolean, float: boolean): Ptr | null {
  if (!p) return p;
  const a: any = p.a;
  let u8: Uint8Array, bo: number;
  const info = elemInfo.get(a);
  if (info) {
    u8 = info.u8;
    bo = info.phase + p.o * info.size;
  } else if (ArrayBuffer.isView(a)) {
    u8 = new Uint8Array(a.buffer, a.byteOffset, a.byteLength);
    bo = p.o * (a as any).BYTES_PER_ELEMENT;
  } else return p; // a pointer to a property or into an array of pointers: as it is
  let m = elemCache.get(u8.buffer);
  if (!m) {
    m = new Map();
    elemCache.set(u8.buffer, m);
  }
  if (size === 1) {
    const key = `${u8.byteOffset}:${u8.length}:1:${signed}`;
    let v = m.get(key);
    if (!v) {
      v = signed ? new Int8Array(u8.buffer, u8.byteOffset, u8.length) : new Uint8Array(u8.buffer, u8.byteOffset, u8.length);
      m.set(key, v);
    }
    return new Ptr(v, bo);
  }
  const phase = bo % size;
  const key = `${u8.byteOffset}:${u8.length}:${size}:${signed}:${float}:${phase}`;
  let v = m.get(key);
  if (!v) {
    const dv = new DataView(u8.buffer, u8.byteOffset, u8.length);
    const get = (k: number): number => {
      const o = phase + k * size;
      if (float) return size === 4 ? dv.getFloat32(o, true) : dv.getFloat64(o, true);
      if (size === 2) return signed ? dv.getInt16(o, true) : dv.getUint16(o, true);
      if (size === 4) return signed ? dv.getInt32(o, true) : dv.getUint32(o, true);
      const lo = dv.getUint32(o, true), hi = signed ? dv.getInt32(o + 4, true) : dv.getUint32(o + 4, true);
      return hi * 4294967296 + lo;
    };
    const set = (k: number, x: number): void => {
      const o = phase + k * size;
      if (float) { if (size === 4) dv.setFloat32(o, x, true); else dv.setFloat64(o, x, true); return; }
      if (size === 2) { dv.setUint16(o, x & 0xffff, true); return; }
      if (size === 4) { dv.setUint32(o, x >>> 0, true); return; }
      const lo = ((x % 4294967296) + 4294967296) % 4294967296;
      dv.setUint32(o, lo, true);
      dv.setUint32(o + 4, Math.floor((x - lo) / 4294967296) >>> 0, true);
    };
    v = new Proxy({}, {
      get(_t, k) {
        if (typeof k === 'string' && /^-?\d+$/.test(k)) return get(Number(k));
        if (k === 'length') return Math.floor((u8.length - phase) / size);
        return undefined;
      },
      set(_t, k, x) {
        if (typeof k === 'string' && /^-?\d+$/.test(k)) set(Number(k), x);
        return true;
      },
    });
    elemInfo.set(v, { u8, dv, phase, size });
    m.set(key, v);
  }
  return new Ptr(v, (bo - phase) / size);
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
  // a whole number of structs: an array of them (enter.c: ranks = malloc(nranks * sizeof (struct rank)))
  if (size > C.$size && size % C.$size === 0) return $sarr(C, size / C.$size)[0] as T;
  const a: any = $sarr(C, 1);
  a.$tail = new Int8Array(Math.max(0, size - C.$size));
  return a[0];
}

/**
 * (char *) of a struct pointer: a Ptr to the struct's bytes in C's layout (StructBytes: read, they are
 * the struct as it is now; the memory functions work on the struct itself; casting it back to a struct
 * pointer gives the struct). The same struct gives the same Ptr, so that such pointers compare as C's
 * do (COW keeps its windows as char *). Past a struct allocated by $salloc: its extra bytes.
 */
export function $bytes(p: any): any {
  if (p instanceof End && p.$a && (p.$a as any).$tail && p.$i === 1) return new Ptr((p.$a as any).$tail, 0);
  if (p && typeof p === 'object' && !(p instanceof Ptr) && p.constructor && p.constructor.$size) {
    let b = structBytes.get(p);
    if (!b) {
      b = new StructBytes(p, 0);
      structBytes.set(p, b);
    }
    b.stale = true;
    return b;
  }
  return p;
}

const structBytes = new WeakMap<object, StructBytes>();

/** a char pointer into a struct (see $bytes): its bytes are encoded when read */
export class StructBytes extends Ptr {
  obj: any;
  stale = true;
  private bytes: Int8Array | null = null;
  constructor(obj: any, o: number) {
    super(null, o);
    this.obj = obj;
    delete (this as any).a; // Ptr's field: the getter below is the bytes
  }
  // @ts-expect-error: an accessor over Ptr's field (deleted in the constructor)
  get a(): any {
    if (this.stale || !this.bytes) {
      const size = this.obj.constructor.$size;
      const tmp = new Uint8Array(size);
      encodeStruct(this.obj, tmp, 0);
      if (!this.bytes) this.bytes = new Int8Array(size);
      this.bytes.set(new Int8Array(tmp.buffer));
      this.stale = false;
    }
    return this.bytes;
  }
  set a(_v: any) {}
  add(n: number): Ptr {
    const p = new StructBytes(this.obj, this.o + n);
    p.bytes = this.a;
    p.stale = false;
    return p;
  }
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

const ends = new WeakMap<any[], Map<number, End>>();

/** the place outside an array of structs: the same object for the same place, so that pointers to it
 * compare equal (for (j = players; j != players + MAXPLAYER; ++j)) */
function endOf(a: any[], i: number): End {
  let m = ends.get(a);
  if (!m) {
    m = new Map();
    ends.set(a, m);
  }
  let e = m.get(i);
  if (!e) {
    e = new End(a, i);
    m.set(i, e);
  }
  return e;
}

/** p + n for a pointer into an array of structs (in a 2-dimensional array, across its rows) */
export function $sadd(p: any, n: number): any {
  if (!p) throw new Error('arithmetic on a null struct pointer');
  let a = p.$a;
  if (!a && p.$m) {
    // a struct seen in bytes: the next ones are in the bytes after it (short.c walks its packets so)
    const C = p.constructor;
    return viewOf(C, p.$m, p.$o + n * C.$size);
  }
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
  return endOf(a, i);
}

/** &a[i] for an array of structs, also past its end */
export function $sat(a: any[], i: number): any {
  return i >= 0 && i < a.length ? a[i] : endOf(a, i);
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
  if (!a && p.$m) return p.$o / p.constructor.$size;
  return a && a.$p ? a.$pi * a.length + p.$i : p.$i;
}

/** p - q for pointers into an array of structs */
export function $sdiff(p: any, q: any): number {
  return $sidx(p) - $sidx(q);
}

// ---- memory as bytes: unions, and structs seen in bytes (views) ----
//
// COW reads its X events through a union (XEvent) and the struct pointers it casts &event to
// (XKeyEvent *, XButtonEvent *, ...), and its server packets by casting the read buffer (char *) to the
// packet's struct pointer. Both are memory seen as several types. A union is therefore its bytes (a Mem,
// in C's layout, little-endian as on x86-64) and every member reads and writes them; a struct pointer made
// from a union, from bytes (a Ptr into a char array) or from another view is a view: an object of the
// struct's class whose fields read and write the bytes at its place ($cast). Pointers stored in such
// memory are kept beside the bytes (Mem.refs, by offset); the bytes hold 1 for them (0 for NULL).

/** bytes and the pointers stored in them */
export interface Mem {
  u8: Uint8Array;
  dv: DataView;
  refs: Map<number, any>;
}

const memOfArray = new WeakMap<object, Mem>();

/** n zero bytes */
export function $mem(n: number): Mem {
  const u8 = new Uint8Array(n);
  return { u8, dv: new DataView(u8.buffer), refs: new Map() };
}

/** the Mem of a char array (the same for the same array) */
function memOfBytes(a: Int8Array | Uint8Array): Mem {
  let m = memOfArray.get(a);
  if (!m) {
    const u8 = new Uint8Array(a.buffer, a.byteOffset, a.length);
    m = { u8, dv: new DataView(a.buffer, a.byteOffset, a.length), refs: new Map() };
    memOfArray.set(a, m);
  }
  return m;
}

function ldInt(m: Mem, off: number, n: number, signed: boolean): number {
  const dv = m.dv;
  switch (n) {
    case 1: return signed ? dv.getInt8(off) : dv.getUint8(off);
    case 2: return signed ? dv.getInt16(off, true) : dv.getUint16(off, true);
    case 4: return signed ? dv.getInt32(off, true) : dv.getUint32(off, true);
  }
  const lo = dv.getUint32(off, true), hi = dv.getInt32(off + 4, true);
  if (!signed && hi < 0) return (hi + 4294967296) * 4294967296 + lo;
  return hi * 4294967296 + lo;
}

function stInt(m: Mem, off: number, n: number, v: number): void {
  if (typeof v !== 'number') v = v ? 1 : 0;
  const dv = m.dv;
  switch (n) {
    case 1: dv.setUint8(off, v & 255); return;
    case 2: dv.setUint16(off, v & 0xffff, true); return;
    case 4: dv.setUint32(off, v >>> 0, true); return;
  }
  v = Math.trunc(v);
  const lo = ((v % 4294967296) + 4294967296) % 4294967296;
  dv.setUint32(off, lo, true);
  dv.setUint32(off + 4, Math.floor((v - lo) / 4294967296) >>> 0, true);
}

/** the value of the element desc (a layout description) at m + off */
function ld(m: Mem, off: number, desc: any[]): any {
  switch (desc[0]) {
    case 'i': return ldInt(m, off, desc[1], !!desc[2]);
    case 'd': return desc[1] === 4 ? m.dv.getFloat32(off, true) : m.dv.getFloat64(off, true);
    case 'p': return m.refs.has(off) ? m.refs.get(off) : null;
    case 'r': return viewOf(desc[1], m, off);
    case 'a': return arrayView(m, off, desc[1], desc[2]);
  }
  throw new Error('bad layout ' + desc);
}

function st(m: Mem, off: number, desc: any[], v: any): void {
  switch (desc[0]) {
    case 'i': stInt(m, off, desc[1], v); return;
    case 'd': if (desc[1] === 4) m.dv.setFloat32(off, v, true); else m.dv.setFloat64(off, v, true); return;
    case 'p':
      if (v == null || v === 0) { m.refs.delete(off); stInt(m, off, 8, 0); } else { m.refs.set(off, v); stInt(m, off, 8, 1); }
      return;
    case 'r': viewOf(desc[1], m, off).$cp(v); return;
    case 'a': {
      const a = arrayView(m, off, desc[1], desc[2]);
      for (let i = 0; i < desc[2]; i++) {
        if (desc[1][0] === 'r') a[i].$cp(v[i]);
        else a[i] = v[i];
      }
      return;
    }
  }
  throw new Error('bad layout ' + desc);
}

/** an array in memory: a typed array on the bytes for chars, else an array-like that reads and writes them */
function arrayView(m: Mem, off: number, ed: any[], n: number): any {
  if (ed[0] === 'i' && ed[1] === 1) {
    const T: any = ed[2] ? Int8Array : Uint8Array;
    return new T(m.u8.buffer, m.u8.byteOffset + off, n);
  }
  const es = sizeOfDesc(ed);
  if (ed[0] === 'r' || ed[0] === 'a') {
    const out: any[] = [];
    for (let i = 0; i < n; i++) out.push(ld(m, off + i * es, ed));
    return ed[0] === 'r' ? $sarrOf(out) : out;
  }
  return new Proxy([] as any[], {
    get(_t, k) {
      if (typeof k === 'string' && /^\d+$/.test(k)) return ld(m, off + Number(k) * es, ed);
      if (k === 'length') return n;
      return undefined;
    },
    set(_t, k, v) {
      if (typeof k === 'string' && /^\d+$/.test(k)) st(m, off + Number(k) * es, ed, v);
      return true;
    },
  });
}

const viewProtos = new Map<any, any>();

/** the struct class C seen in the bytes at m + off */
function viewOf(C: any, m: Mem, off: number): any {
  if (C.$union) return new C(m, off);
  let proto = viewProtos.get(C);
  if (!proto) {
    proto = Object.create(C.prototype);
    for (const [name, foff, desc] of C.$layout()) {
      if (desc[0] === 'b') {
        const [, lo, w, signed] = desc;
        Object.defineProperty(proto, name, {
          get(this: any) {
            const mm: Mem = this.$m, o = this.$o + foff;
            const word = mm.u8[o] | ((mm.u8[o + 1] ?? 0) << 8) | ((mm.u8[o + 2] ?? 0) << 16);
            let v = (word >> lo) & ((1 << w) - 1);
            if (signed && v >= 1 << (w - 1)) v -= 1 << w;
            return v;
          },
          set(this: any, v: number) {
            const mm: Mem = this.$m, o = this.$o + foff;
            let word = mm.u8[o] | ((mm.u8[o + 1] ?? 0) << 8) | ((mm.u8[o + 2] ?? 0) << 16);
            word = (word & ~(((1 << w) - 1) << lo)) | ((v & ((1 << w) - 1)) << lo);
            mm.u8[o] = word & 255;
            if (lo + w > 8) mm.u8[o + 1] = (word >> 8) & 255;
            if (lo + w > 16) mm.u8[o + 2] = (word >> 16) & 255;
          },
        });
      } else {
        Object.defineProperty(proto, name, {
          get(this: any) { return ld(this.$m, this.$o + foff, desc); },
          set(this: any, v: any) { st(this.$m, this.$o + foff, desc, v); },
        });
      }
    }
    viewProtos.set(C, proto);
  }
  const v = Object.create(proto);
  v.$m = m;
  v.$o = off;
  return v;
}

/** a member of a union (or anything with $m and $o) at its offset k */
export function $uget(u: any, k: number, desc: any[]): any {
  return ld(u.$m, u.$o + k, desc);
}

export function $uset(u: any, k: number, desc: any[], v: any): void {
  st(u.$m, u.$o + k, desc, v);
}

/** d = s for unions: n bytes and the pointers in them */
export function $mcopy(d: any, s: any, n: number): void {
  const dm: Mem = d.$m, sm: Mem = s.$m;
  if (dm === sm && d.$o === s.$o) return;
  if (dm === sm) dm.u8.copyWithin(d.$o, s.$o, s.$o + n);
  else dm.u8.set(sm.u8.subarray(s.$o, s.$o + n), d.$o);
  const refs: [number, any][] = [];
  for (const [k, v] of sm.refs) if (k >= s.$o && k < s.$o + n) refs.push([k - s.$o + d.$o, v]);
  for (const k of [...dm.refs.keys()]) if (k >= d.$o && k < d.$o + n) dm.refs.delete(k);
  for (const [k, v] of refs) dm.refs.set(k, v);
}

/**
 * (T *) p for a struct T: a struct object stays itself (C's code casts between packet structs that share
 * their first fields), a union or a view becomes a view of T on the same bytes, bytes (a Ptr into a char
 * array) a view of T on them.
 */
export function $cast(C: any, p: any): any {
  if (p == null || p === 0) return null;
  if (p instanceof StructBytes) return p.o === 0 ? $cast(C, p.obj) : viewOf(C, memOfBytes(p.a), p.o);
  if (p instanceof Ptr) {
    const a = p.a;
    if (a instanceof Int8Array || a instanceof Uint8Array) return viewOf(C, memOfBytes(a), p.o);
    const e = a[p.o];
    if (e && typeof e === 'object') return e;
    throw new Error(`a struct pointer from ${String(a)}`);
  }
  if (p.$m && p.constructor !== C) return viewOf(C, p.$m, p.$o);
  return p;
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
  if (o.$m) {
    // a union or a view: its bytes
    b.set(o.$m.u8.subarray(o.$o, o.$o + C.$size), off);
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
  if (o.$m) {
    const m: Mem = o.$m;
    m.u8.set(b.subarray(off, off + C.$size), o.$o);
    for (const k of [...m.refs.keys()]) if (k >= o.$o && k < o.$o + C.$size) m.refs.delete(k);
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
  if (p instanceof StructBytes && p.o === 0) p = p.obj;
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
  if (p instanceof StructBytes) {
    if (p.o !== 0) {
      // bytes inside the struct: into its image, and the image back into it
      const size = p.obj.constructor.$size;
      const full = new Uint8Array(size);
      encodeStruct(p.obj, full, 0);
      full.set(b.subarray(0, Math.min(n, size - p.o)), p.o);
      decodeStruct(p.obj, full, 0);
      p.stale = true;
      return;
    }
    p = p.obj;
  }
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
