// OpenClonk port: C++'s pointers and memory as the translated code uses them
// (re/openclonk/tools/cpp2ts/CONVENTIONS.md):
//   - a pointer to a class object is the object itself (or null);
//   - every other pointer is a Ptr: an array (a typed array for numbers, a JS array for pointers and
//     objects, or an object whose property is meant) and an index into it (or the property's name);
//   - char is Int8Array (signed, as on x86), unsigned char Uint8Array.

/** A C++ pointer to something that is not a class object: array `a`, element `o`. */
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
  get v(): any {
    return this.a[this.o];
  }
  set v(x: any) {
    this.a[this.o] = x;
  }
  // a pointer as a library iterator (std::string::const_iterator, __normal_iterator<const char *>: the same operations
  // as rt/std.ts Iter's)
  eq(p: Ptr | null): boolean { return p != null && p.a === this.a && p.o === this.o; }
  inc(): this { this.o++; return this; }
  dec(): this { this.o--; return this; }
  postinc(): Ptr { const r = new Ptr(this.a, this.o); this.o++; return r; }
  postdec(): Ptr { const r = new Ptr(this.a, this.o); this.o--; return r; }
  copy(): Ptr { return new Ptr(this.a, this.o); }
  get i(): number { return this.o; }
  set i(n: number) { this.o = n; }
}

/** p + n for a pointer that may be null (null + 0 is null, as in C++) */
export function $padd(p: Ptr | null, n: number): Ptr | null {
  if (p === null || p === undefined) return null;
  return n ? new Ptr(p.a, p.o + n) : p;
}

/** &a[o], &obj.field */
export function P(a: any, o: any = 0): Ptr {
  // &*p is p: taking the address of a pointer value that is already a Ptr must not wrap it
  if (a instanceof Ptr) return o ? a.add(o) : a;
  return new Ptr(a, o);
}

const fieldViews = new WeakMap<object, Map<string, any>>();
/**
 * &obj.first for fields that the C++ uses as an array (int32_t x, y; and mkArrayAdaptDefArr(&x, 2, ...) in
 * C4Shape::CompileFunc; cpp2ts config.FIELD_ARRAYS): a pointer into a view whose elements are the fields
 */
export function $fields(o: any, names: string[]): Ptr {
  let views = fieldViews.get(o);
  if (!views) fieldViews.set(o, (views = new Map()));
  const key = names.join(',');
  let v = views.get(key);
  if (!v) {
    v = new Proxy([], {
      get: (_t, k) => (k === 'length' ? names.length : typeof k === 'string' && /^\d+$/.test(k) ? o[names[+k]] : undefined),
      set: (_t, k, x) => {
        if (typeof k !== 'string' || !/^\d+$/.test(k) || +k >= names.length) throw new Error(`$fields: ${String(k)} is outside ${key}`);
        o[names[+k]] = x;
        return true;
      },
    });
    views.set(key, v);
  }
  return new Ptr(v, 0);
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
  return p == null && q == null;
}

/** a value as a pointer to a temporary (a const reference bound to a temporary) */
export function $tmp(v: any): Ptr {
  return new Ptr([v], 0);
}

const enc = new TextEncoder();
const literals = new Map<string, Ptr>();

/** A string literal: its bytes (UTF-8) and the NUL; the same Ptr for the same text */
export function S(s: string): Ptr {
  let p = literals.get(s);
  if (!p) {
    const b = enc.encode(s);
    const a = new Int8Array(b.length + 1);
    a.set(b);
    p = new Ptr(a, 0);
    literals.set(s, p);
  }
  return p;
}

/** A string literal given as bytes (one that is not valid UTF-8) */
export function SB(bytes: number[]): Ptr {
  const a = new Int8Array(bytes.length + 1);
  a.set(bytes.map((b) => (b << 24) >> 24));
  return new Ptr(a, 0);
}

/** char buf[n] = "..." */
export function $cs(p: Ptr, n: number): Int8Array {
  const src = p.a as Int8Array;
  const a = new Int8Array(Math.max(n, src.length));
  a.set(src);
  return a;
}

/**
 * an array of n objects made by make() (an array of class objects, constructed); every object knows its
 * array and index ($a, $i), so that a pointer to it can move along the array
 */
export function $oarr<T>(n: number, make: () => T): T[] {
  const a: T[] = new Array(n);
  for (let i = 0; i < n; i++) {
    const o: any = make();
    if (o && typeof o === 'object') {
      o.$a = a;
      o.$i = i;
    }
    a[i] = o;
  }
  return a;
}

/** an array of objects given element by element: the objects learn their places */
export function $own<T>(a: T[]): T[] {
  for (let i = 0; i < a.length; i++) {
    const o: any = a[i];
    if (o && typeof o === 'object') {
      o.$a = a;
      o.$i = i;
    }
  }
  return a;
}

/** a place outside an array of objects (one past its end, one before its start): it only knows its place */
class OEnd {
  $a: any[];
  $i: number;
  constructor(a: any[], i: number) {
    this.$a = a;
    this.$i = i;
  }
}

/** &arr[i] for an array of objects (places outside it are the same object each time, so that == works) */
export function $oat(a: any, i: number): any {
  if (i >= 0 && i < a.length) return a[i];
  const ends = a.$ends ?? (a.$ends = new Map<number, OEnd>());
  let e = ends.get(i);
  if (!e) {
    e = new OEnd(a, i);
    ends.set(i, e);
  }
  return e;
}

/**
 * &obj.m[i][j] of a field that is an array of arrays of numbers (float m[3][4]): a pointer into row i at j, which also
 * knows its object and field ($owner, $field, $row), so that a reader of more numbers than the row holds goes on as
 * C++'s memory does: the next rows, then the next objects of the array the object is in (rt/gl.ts numbersOf)
 */
export function $rowp(obj: any, field: string, i: number, j: number): Ptr {
  const p = new Ptr(obj[field][i], j) as Ptr & { $owner: any; $field: string; $row: number };
  p.$owner = obj;
  p.$field = field;
  p.$row = i;
  return p;
}

/** p + n for a pointer to an object in an array */
export function $oadd(p: any, n: number): any {
  if (n === 0) return p;
  if (!p || !p.$a) throw new Error('pointer arithmetic on an object that is not in an array');
  return $oat(p.$a, p.$i + n);
}

/** a pointer to an object in an array, for <, <=, >, >=: its index (null is before every object, as address 0) */
export function $oi(p: any): number {
  return p == null ? -Infinity : p.$i;
}

/** p[i] for a pointer to an object in an array */
export function $oidx(p: any, i: number): any {
  if (i === 0) return p;
  if (!p || !p.$a) throw new Error('indexing an object that is not in an array');
  return p.$a[p.$i + i];
}

/** an array of numbers of length n with the first values given */
export function $ta(T: any, n: number, vals: number[]): any {
  const a = new T(Math.max(n, vals.length));
  a.set(vals);
  return a;
}

/** (char *) of an unsigned char * and the other way round: a view of the same bytes */
export function $view8(p: Ptr | null, signed: boolean): Ptr | null {
  if (!p) return p;
  const a = p.a;
  if (!ArrayBuffer.isView(a) || (signed ? a instanceof Int8Array : a instanceof Uint8Array)) return p;
  const v = signed ? new Int8Array(a.buffer, a.byteOffset, (a as any).length) : new Uint8Array(a.buffer, a.byteOffset, (a as any).length);
  return new Ptr(v, p.o);
}

const TYPED: Record<string, any> = {
  i8: Int8Array, u8: Uint8Array, i16: Int16Array, u16: Uint16Array, i32: Int32Array, u32: Uint32Array,
  f32: Float32Array, f64: Float64Array, i64: BigInt64Array, u64: BigUint64Array,
};
const GET: Record<string, string> = {
  i8: 'getInt8', u8: 'getUint8', i16: 'getInt16', u16: 'getUint16', i32: 'getInt32', u32: 'getUint32',
  f32: 'getFloat32', f64: 'getFloat64', i64: 'getBigInt64', u64: 'getBigUint64',
};
/**
 * (T *) p for a pointer into an array of numbers of another type: the same bytes read (and written) as T, little-endian
 * as on x86. An aligned place is a typed array over the same memory; an unaligned one reads through a DataView.
 */
export function $reinterp(p: Ptr | null, kind: string): Ptr | null {
  if (!p) return p;
  const a = p.a;
  if (!ArrayBuffer.isView(a)) throw new Error(`$reinterp: a pointer into ${a?.constructor?.name} is not memory`);
  const T = TYPED[kind];
  const at = a.byteOffset + p.o * ((a as any).BYTES_PER_ELEMENT ?? 1);
  const size = T.BYTES_PER_ELEMENT;
  if (at % size === 0) return new Ptr(new T(a.buffer, at, Math.floor((a.buffer.byteLength - at) / size)), 0);
  const dv = new DataView(a.buffer);
  const get = GET[kind], set = 's' + get.slice(1);
  const view = new Proxy([], {
    get: (_t, k) => (typeof k === 'string' && /^\d+$/.test(k) ? (dv as any)[get](at + +k * size, true) : undefined),
    set: (_t, k, v) => { (dv as any)[set](at + +(k as string) * size, v, true); return true; },
  });
  return new Ptr(view, 0);
}

/** (const T *) of a void * (rt $reinterp for a pointer into memory of another element type; anything else as it is) */
export function $reinterpVoid(p: any, kind: string): any {
  if (!(p instanceof Ptr) || !ArrayBuffer.isView(p.a) || p.a instanceof TYPED[kind]) return p;
  return $reinterp(p, kind);
}

/**
 * (const T *) p for a plain struct T of numbers and a pointer p into memory (bytes): an object whose fields read and
 * write those bytes at their offsets, little-endian (getBufPtr<C4RecordChunkHead>). A pointer that is not into
 * memory (a void * that holds an object) is that object.
 */
export function $structAt(p: any, fields: [string, number, string][]): any {
  if (p instanceof Ptr && (p as any).$obj !== undefined && p.o === 0) return (p as any).$obj;   // a struct's bytes ($bytesView)
  if (!(p instanceof Ptr) || !ArrayBuffer.isView(p.a)) return p;
  const a = p.a as any;
  const at = a.byteOffset + p.o * (a.BYTES_PER_ELEMENT ?? 1);
  const dv = new DataView(a.buffer);
  const o: any = {};
  for (const [name, off, kind] of fields) {
    const get = GET[kind], set = 's' + get.slice(1);
    Object.defineProperty(o, name, {
      get: () => (dv as any)[get](at + off, true),
      set: (v: any) => { (dv as any)[set](at + off, v, true); },
      enumerable: true,
    });
  }
  return o;
}

/** a field of a plain struct: name, byte offset, kind ($reinterp's names), element count (0: not an array) */
export type StructField = [string, number, string, number];
const SIZE: Record<string, number> = { i8: 1, u8: 1, i16: 2, u16: 2, i32: 4, u32: 4, f32: 4, f64: 8 };

/** the object holding a field of a layout ("Head.bfType", "Colors.3.rgbBlue": nested structs) and the field's name */
export function $fieldOf(obj: any, name: string): [any, string] {
  if (name.indexOf('.') < 0) return [obj, name];
  const path = name.split('.');
  for (let i = 0; i < path.length - 1; i++) obj = obj[path[i]];
  return [obj, path[path.length - 1]];
}

/** the field of `layout` that byte `off` of the struct belongs to, and where in it (null: padding) */
function fieldAt(layout: StructField[], off: number): [StructField, number, number] | null {
  for (const f of layout) {
    const [, at, kind, count] = f;
    const es = SIZE[kind];
    if (off >= at && off < at + es * Math.max(1, count)) return [f, Math.floor((off - at) / es), (off - at) % es];
  }
  return null;
}
const scratch = new DataView(new ArrayBuffer(8));
function putNum(kind: string, v: number): void {
  const set = 's' + GET[kind].slice(1);
  (scratch as any)[set](0, kind.startsWith('f') ? Number(v) : Number(v) | 0, true);
}

/**
 * (void *) &s, (BYTE *) &s for a plain struct s (or the first of consecutive structs in an array): a pointer to its
 * bytes as C++ lays them out (`layout`, `size` bytes each, little-endian as on x86; padding reads 0). The bytes read
 * and write the objects' fields, so that a byte loop (C4Group's MemScramble) or a copy into a file buffer
 * (CStdFile::Write of a C4GroupHeader, of C4Record's chunk heads) sees the original's bytes.
 */
export function $bytesView(o: any, layout: StructField[], size: number): any {
  if (o == null || o instanceof Ptr) return o;
  const arr: any[] = Array.isArray(o) ? o : o.$a ?? [o];
  const first = Array.isArray(o) ? 0 : o.$a ? o.$i : 0;
  const get = (i: number): number => {
    const obj = arr[first + Math.floor(i / size)];
    const hit = obj && fieldAt(layout, i % size);
    if (!hit) return 0;
    const [[path, , kind, count], idx, byte] = hit;
    const [o, name] = $fieldOf(obj, path);
    const v = count ? o[name][idx] : o[name];
    putNum(kind, typeof v === 'boolean' ? (v ? 1 : 0) : v ?? 0);
    return scratch.getUint8(byte);
  };
  const set = (i: number, b: number): void => {
    const obj = arr[first + Math.floor(i / size)];
    const hit = obj && fieldAt(layout, i % size);
    if (!hit) return;
    const [[path, , kind, count], idx, byte] = hit;
    const [o, name] = $fieldOf(obj, path);
    const v = count ? o[name][idx] : o[name];
    putNum(kind, typeof v === 'boolean' ? (v ? 1 : 0) : v ?? 0);
    scratch.setUint8(byte, b & 0xff);
    const nv = (scratch as any)[GET[kind]](0, true);
    if (count) o[name][idx] = nv;
    else o[name] = typeof v === 'boolean' ? nv !== 0 : nv;
  };
  // (a plain object as the target: Array.isArray must not take the bytes for an array of objects)
  const view = new Proxy({}, {
    get: (_t, k) => (typeof k === 'string' && /^\d+$/.test(k) ? get(+k) : k === 'length' ? (arr.length - first) * size : undefined),
    set: (_t, k, v) => { if (typeof k === 'string' && /^\d+$/.test(k)) set(+k, v); return true; },
  });
  const p = new Ptr(view, 0);
  (p as any).$obj = o;
  (p as any).$layout = layout;
  (p as any).$size = size;
  return p;
}

/** a JavaScript string of a C string (UTF-8) */
const dec = new TextDecoder();
export function $str(p: Ptr | null): string {
  if (!p) return '';
  const a = p.a as Int8Array;
  let e = p.o;
  while (e < a.length && a[e]) e++;
  return dec.decode(new Uint8Array(a.buffer, a.byteOffset + p.o, e - p.o));
}
