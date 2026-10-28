// HashTable.h: a fixed-size cache keyed by two ints; a colliding insert replaces the older entry.
// The game's map depends on what this cache holds (map.ts), so its size and hash are the original's.
export class HashTable<T> {
  private readonly size: number;
  private readonly table: T[];
  private readonly set: Uint8Array;
  private readonly keysA: Int32Array;
  private readonly keysB: Int32Array;

  constructor(size: number, empty: T) {
    this.size = size;
    this.table = new Array<T>(size).fill(empty);
    this.set = new Uint8Array(size);
    this.keysA = new Int32Array(size);
    this.keysB = new Int32Array(size);
  }

  private hash(a: number, b: number): number {
    // ( inKeyA * 734727 + inKeyB * 263474 ) % mSize in C int arithmetic
    let h = ((Math.imul(a, 734727) + Math.imul(b, 263474)) | 0) % this.size;
    if (h < 0) h += this.size;
    return h;
  }

  /** the value, or undefined when it is not stored (the original then returns whatever is in the slot) */
  lookup(a: number, b: number): T | undefined {
    const h = this.hash(a, b);
    return this.set[h] && this.keysA[h] === a && this.keysB[h] === b ? this.table[h] : undefined;
  }

  insert(a: number, b: number, item: T): void {
    const h = this.hash(a, b);
    this.set[h] = 1;
    this.keysA[h] = a;
    this.keysB[h] = b;
    this.table[h] = item;
  }

  clear(): void {
    this.set.fill(0);
  }
}
