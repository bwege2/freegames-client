// @ts-nocheck
// java.nio's buffers as the game and libGDX use them (the GL wrappers' vertex and index arrays, pixmap pixels,
// FreeType's bitmaps): position, limit, capacity, relative, absolute and bulk gets and puts, and byte order.
// A ByteBuffer is big-endian unless ordered otherwise, as Java's; its float, int and short views follow its
// order: in the platform's order (little-endian) a view is a typed array `a` (what WebGL takes, shared with
// the bytes), in big-endian order it reads and writes the bytes through a DataView.
import { JObject, defineLib, IllegalArgumentException } from './lang.ts';

export class ByteOrder extends JObject {
  name: string;
  constructor(name: string) {
    super();
    this.name = name;
  }
  static BIG_ENDIAN = new ByteOrder('BIG_ENDIAN');
  static LITTLE_ENDIAN = new ByteOrder('LITTLE_ENDIAN');
  static nativeOrder() { return ByteOrder.LITTLE_ENDIAN; }
  toString() { return this.name; }
}
defineLib(ByteOrder, 'java.nio.ByteOrder');

export class Buffer extends JObject {
  a: any;
  pos = 0;
  lim: number;
  markPos = -1;
  constructor(a: any) {
    super();
    this.a = a;
    this.lim = a.length;
  }
  at(i: number): any { return this.a[i]; }
  set(i: number, v: any) { this.a[i] = v; }
  capacity() { return this.a.length; }
  position(p?: number) { if (p === undefined) return this.pos; this.pos = p; return this; }
  limit(l?: number) { if (l === undefined) return this.lim; this.lim = l; if (this.pos > l) this.pos = l; return this; }
  remaining() { return this.lim - this.pos; }
  hasRemaining() { return this.pos < this.lim; }
  rewind() { this.pos = 0; return this; }
  clear() { this.pos = 0; this.lim = this.capacity(); return this; }
  flip() { this.lim = this.pos; this.pos = 0; return this; }
  mark() { this.markPos = this.pos; return this; }
  reset() { this.pos = this.markPos; return this; }
  isDirect() { return true; }
  /** get(), get(index), get(dst[]), get(dst[], offset, length). */
  get(x?: any, off?: number, len?: number): any {
    if (x === undefined) {
      if (this.pos >= this.lim) throw new IllegalArgumentException('BufferUnderflowException');
      return this.at(this.pos++);
    }
    if (typeof x === 'number') return this.at(x);
    const o = off ?? 0, n = len ?? x.length;
    if (n > this.remaining()) throw new IllegalArgumentException('BufferUnderflowException');
    for (let i = 0; i < n; i++) x[o + i] = this.at(this.pos++);
    return this;
  }
  /** put(v), put(index, v), put(src[]), put(src[], offset, length), put(Buffer). */
  put(x: any, y?: any, z?: any): this {
    if (typeof x === 'number' && typeof y === 'number' && z === undefined) {
      this.set(x, y);
      return this;
    }
    if (typeof x === 'number') {
      if (this.pos >= this.lim) throw new IllegalArgumentException('BufferOverflowException');
      this.set(this.pos++, x);
      return this;
    }
    if (x instanceof Buffer) {
      const n = x.remaining();
      if (n > this.remaining()) throw new IllegalArgumentException('BufferOverflowException');
      for (let i = 0; i < n; i++) this.set(this.pos++, x.at(x.pos++));
      return this;
    }
    const o = y ?? 0, n = z ?? x.length - o;
    if (n > this.remaining()) throw new IllegalArgumentException('BufferOverflowException');
    for (let i = 0; i < n; i++) this.set(this.pos++, x[o + i]);
    return this;
  }
}
defineLib(Buffer, 'java.nio.Buffer');

/** A big-endian view of 2- or 4-byte elements on bytes. */
function bigEndianView(B: any, bytes: Int8Array, size: number, read: string, write: string): any {
  const n = Math.floor(bytes.byteLength / size);
  const b = new B({ length: n });
  const dv = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  b.at = (i: number) => dv[read](i * size, false);
  b.set = (i: number, v: number) => dv[write](i * size, v, false);
  b.dv = dv;
  return b;
}

export class ByteBuffer extends Buffer {
  bigEndian = true;
  order(o?: any): any {
    if (o === undefined) return this.bigEndian ? ByteOrder.BIG_ENDIAN : ByteOrder.LITTLE_ENDIAN;
    this.bigEndian = o === ByteOrder.BIG_ENDIAN;
    return this;
  }
  static allocate(n: number) { return new ByteBuffer(new Int8Array(n)); }
  static allocateDirect(n: number) { return new ByteBuffer(new Int8Array(n)); }
  static wrap(a: any) { return new ByteBuffer(a instanceof Int8Array ? a : Int8Array.from(a)); }
  /** The bytes from the position to the limit, unsigned (a view, for the platform: WebGL, canvas). */
  bytes(): Uint8Array { return new Uint8Array(this.a.buffer, this.a.byteOffset + this.pos, this.lim - this.pos); }
  view(T: any, B: any, size: number, read: string, write: string) {
    const off = this.a.byteOffset + this.pos;
    const len = this.lim - this.pos;
    if (this.bigEndian) return bigEndianView(B, new Int8Array(this.a.buffer, off, len), size, read, write);
    if (off % size === 0) return new B(new T(this.a.buffer, off, Math.floor(len / size)));
    // an unaligned little-endian view: through a DataView too
    const b = bigEndianView(B, new Int8Array(this.a.buffer, off, len), size, read, write);
    b.at = (i: number) => b.dv[read](i * size, true);
    b.set = (i: number, v: number) => b.dv[write](i * size, v, true);
    return b;
  }
  asFloatBuffer() { return this.view(Float32Array, FloatBuffer, 4, 'getFloat32', 'setFloat32'); }
  asIntBuffer() { return this.view(Int32Array, IntBuffer, 4, 'getInt32', 'setInt32'); }
  asShortBuffer() { return this.view(Int16Array, ShortBuffer, 2, 'getInt16', 'setInt16'); }
}
defineLib(ByteBuffer, 'java.nio.ByteBuffer');
export class FloatBuffer extends Buffer {}
defineLib(FloatBuffer, 'java.nio.FloatBuffer');
export class IntBuffer extends Buffer {}
defineLib(IntBuffer, 'java.nio.IntBuffer');
export class ShortBuffer extends Buffer {}
defineLib(ShortBuffer, 'java.nio.ShortBuffer');
