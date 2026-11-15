// The original's hash map (src/cdogs/c_hashmap/hashmap.c, Pete Warden / Elliot Back, public domain), translated
// for the few places where the game walks a map and the walking order matters (a static mission's tile classes,
// the weapon usage statistics). crc32 of the key, Thomas Wang's integer mix in 64-bit unsigned long (x86-64
// Linux), linear probing up to 8 slots, doubling the table when half full or the probe runs out. As in the
// original, put() on an existing key replaces the value but still counts one more element.

const CRC_TABLE = (() => {
  const t = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    t[n] = c >>> 0;
  }
  return t;
})();

const M64 = (1n << 64n) - 1n;
function hashKey(key: string, tableSize: number): number {
  const bytes = new TextEncoder().encode(key);
  let crc = 0;
  for (let i = 0; i < bytes.length; i++) crc = (CRC_TABLE[(crc ^ bytes[i]) & 0xff] ^ (crc >>> 8)) >>> 0;
  let k = BigInt(crc);
  k = (k + (k << 12n)) & M64;
  k ^= k >> 22n;
  k = (k + (k << 4n)) & M64;
  k ^= k >> 9n;
  k = (k + (k << 10n)) & M64;
  k ^= k >> 2n;
  k = (k + (k << 7n)) & M64;
  k ^= k >> 12n;
  k = ((k >> 3n) * 2654435761n) & M64;
  return Number(k % BigInt(tableSize));
}

const MAX_CHAIN_LENGTH = 8;

export class CHashMap<T> {
  private keys: (string | null)[];
  private values: (T | null)[];
  private tableSize = 256;
  private count = 0;

  constructor() {
    this.keys = new Array(256).fill(null);
    this.values = new Array(256).fill(null);
  }

  private slot(key: string): number {
    if (this.count >= this.tableSize / 2) return -1;
    let curr = hashKey(key, this.tableSize);
    for (let i = 0; i < MAX_CHAIN_LENGTH; i++) {
      if (this.keys[curr] === null || this.keys[curr] === key) return curr;
      curr = (curr + 1) % this.tableSize;
    }
    return -1;
  }

  private rehash(): void {
    const oldKeys = this.keys;
    const oldValues = this.values;
    this.tableSize *= 2;
    this.keys = new Array(this.tableSize).fill(null);
    this.values = new Array(this.tableSize).fill(null);
    this.count = 0;
    for (let i = 0; i < oldKeys.length; i++) {
      const k = oldKeys[i];
      if (k !== null) this.set(k, oldValues[i] as T);
    }
  }

  set(key: string, value: T): void {
    let index = this.slot(key);
    while (index < 0) {
      this.rehash();
      index = this.slot(key);
    }
    this.keys[index] = key;
    this.values[index] = value;
    this.count++;
  }

  get(key: string): T | undefined {
    let curr = hashKey(key, this.tableSize);
    for (let i = 0; i < MAX_CHAIN_LENGTH; i++) {
      if (this.keys[curr] === key) return this.values[curr] as T;
      curr = (curr + 1) % this.tableSize;
    }
    return undefined;
  }

  has(key: string): boolean {
    return this.get(key) !== undefined;
  }

  delete(key: string): boolean {
    let curr = hashKey(key, this.tableSize);
    for (let i = 0; i < MAX_CHAIN_LENGTH; i++) {
      if (this.keys[curr] === key) {
        this.keys[curr] = null;
        this.values[curr] = null;
        this.count--;
        return true;
      }
      curr = (curr + 1) % this.tableSize;
    }
    return false;
  }

  get size(): number {
    return this.count;
  }

  /** hashmap_iterate order: table slots in index order */
  *entries(): IterableIterator<[string, T]> {
    for (let i = 0; i < this.tableSize; i++) {
      const k = this.keys[i];
      if (k !== null) yield [k, this.values[i] as T];
    }
  }
  *values_(): IterableIterator<T> {
    for (const [, v] of this.entries()) yield v;
  }
}
