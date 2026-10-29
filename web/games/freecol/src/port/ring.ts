// A ring buffer of messages in shared memory, one writer and one reader, for what the client's worker must
// be able to receive while it blocks (Atomics.wait): the server's bytes and the page's input. A doorbell
// (a shared counter) wakes the reader; several rings may ring the same bell.

const HEAD = 0; // where the writer writes next (bytes, wraps)
const TAIL = 1; // where the reader reads next
const DATA = 16;

export class Ring {
  sab: SharedArrayBuffer;
  meta: Int32Array;
  data: Uint8Array;
  size: number;
  bell: Int32Array;

  static create(size = 1 << 22): SharedArrayBuffer {
    return new SharedArrayBuffer(DATA + size);
  }

  static createBell(): SharedArrayBuffer {
    return new SharedArrayBuffer(4);
  }

  constructor(sab: SharedArrayBuffer, bell: SharedArrayBuffer) {
    this.sab = sab;
    this.meta = new Int32Array(sab, 0, 4);
    this.size = sab.byteLength - DATA;
    this.data = new Uint8Array(sab, DATA, this.size);
    this.bell = new Int32Array(bell);
  }

  used(): number {
    const h = Atomics.load(this.meta, HEAD), t = Atomics.load(this.meta, TAIL);
    return (h - t + this.size) % this.size;
  }

  private put(at: number, b: Uint8Array) {
    const first = Math.min(b.length, this.size - at);
    this.data.set(b.subarray(0, first), at);
    if (first < b.length) this.data.set(b.subarray(first), 0);
  }

  private get(at: number, n: number): Uint8Array {
    const r = new Uint8Array(n);
    const first = Math.min(n, this.size - at);
    r.set(this.data.subarray(at, at + first));
    if (first < n) r.set(this.data.subarray(0, n - first), first);
    return r;
  }

  /** Writes a message of a type (0-255); false if it does not fit now. */
  write(type: number, body: Uint8Array): boolean {
    const n = 5 + body.length;
    if (n >= this.size - this.used() - 1) return false;
    const h = Atomics.load(this.meta, HEAD);
    const head = new Uint8Array(5);
    new DataView(head.buffer).setUint32(0, body.length);
    head[4] = type;
    this.put(h, head);
    this.put((h + 5) % this.size, body);
    Atomics.store(this.meta, HEAD, (h + n) % this.size);
    Atomics.add(this.bell, 0, 1);
    Atomics.notify(this.bell, 0);
    return true;
  }

  /** The next message, or null. */
  read(): { type: number; body: Uint8Array } | null {
    if (this.used() === 0) return null;
    const t = Atomics.load(this.meta, TAIL);
    const head = this.get(t, 5);
    const len = new DataView(head.buffer).getUint32(0);
    const body = this.get((t + 5) % this.size, len);
    Atomics.store(this.meta, TAIL, (t + 5 + len) % this.size);
    return { type: head[4], body };
  }

  /** The bell's count now: wait on it with this value. */
  static bellValue(bell: Int32Array): number {
    return Atomics.load(bell, 0);
  }

  /** Sleeps up to ms unless the bell rang since value was read. */
  static waitBell(bell: Int32Array, value: number, ms: number) {
    Atomics.wait(bell, 0, value, ms);
  }
}

/** UTF-8 JSON in a message body. */
export const json = {
  encode: (o: unknown) => new TextEncoder().encode(JSON.stringify(o)),
  decode: (b: Uint8Array) => JSON.parse(new TextDecoder().decode(b)),
};
