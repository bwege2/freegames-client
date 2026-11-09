// @ts-nocheck
// ObjectMap.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
/*******************************************************************************
 * Copyright 2011 See AUTHORS file.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 ******************************************************************************/
import { $J, Arrays, Collections, GdxRuntimeException, IllegalArgumentException, IllegalStateException, JObject, NoSuchElementException, StringBuilder } from '../../../../../jre/index.ts';

let ObjectSet;

/**
 * An unordered map where the keys and values are objects. Null keys are not allowed. No allocation is done except when growing
 * the table size.
 * <p>
 * This class performs fast contains and remove (typically O(1), worst case O(n) but that is rare in practice). Add may be
 * slightly slower, depending on hash collisions. Hashcodes are rehashed to reduce collisions and the need to resize. Load factors
 * greater than 0.91 greatly increase the chances to resize to the next higher POT size.
 * <p>
 * Unordered sets and maps are not designed to provide especially fast iteration. Iteration is faster with OrderedSet and
 * OrderedMap.
 * <p>
 * This implementation uses linear probing with the backward shift algorithm for removal. Hashcodes are rehashed using Fibonacci
 * hashing, instead of the more common power-of-two mask, to better distribute poor hashCodes (see <a href=
 * "https://probablydance.com/2018/06/16/fibonacci-hashing-the-optimization-that-the-world-forgot-or-a-better-alternative-to-integer-modulo/">Malte
 * Skarupke's blog post</a>). Linear probing continues to work even when all hashCodes collide, just more slowly.
 * @author Nathan Sweet
 * @author Tommy Ettinger
 */
export class ObjectMap<K, V> extends JObject {
  static dummy: any = null;
  size_: number = 0;
  keyTable: K[] = null;
  valueTable: V[] = null;
  loadFactor: number = 0;
  threshold: number = 0;
  /**
   * Used by {@link #place(Object)} to bit shift the upper bits of a {@code long} into a usable range (&gt;= 0 and &lt;=
   * {@link #mask}). The shift can be negative, which is convenient to match the number of bits in mask: if mask is a 7-bit
   * number, a shift of -7 shifts the upper 7 bits into the lowest 7 positions. This class sets the shift &gt; 32 and &lt; 64,
   * which if used with an int will still move the upper bits of an int to the lower bits due to Java's implicit modulus on
   * shifts.
   * <p>
   * {@link #mask} can also be used to mask the low bits of a number, which may be faster for some hashcodes, if
   * {@link #place(Object)} is overridden.
   */
  shift_: number = 0;
  /**
   * A bitmask used to confine hashcodes to the size of the table. Must be all 1 bits in its low positions, ie a power of two
   * minus 1. If {@link #place(Object)} is overriden, this can be used instead of {@link #shift} to isolate usable bits of a
   * hash.
   */
  mask: number = 0;
  entries1: ObjectMap$Entries = null;
  entries2: ObjectMap$Entries = null;
  values1: ObjectMap$Values = null;
  values2: ObjectMap$Values = null;
  keys1: ObjectMap$Keys = null;
  keys2: ObjectMap$Keys = null;
  /**
   * Creates a new map with an initial capacity of 51 and a load factor of 0.8.
   */
  _ObjectMap$(): this {
    this._ObjectMap$int$float(51, Math.fround(0.8));
    return this;
  }
  /**
   * Creates a new map with the specified initial capacity and load factor. This map will hold initialCapacity items before
   * growing the backing table.
   * @param initialCapacity The backing array size is initialCapacity / loadFactor, increased to the next power of two.
   */
  _ObjectMap$int$float(initialCapacity: number, loadFactor: number): this {
    if (loadFactor <= 0 || loadFactor >= 1) {
      throw new IllegalArgumentException('loadFactor must be > 0 and < 1: ' + $J.fstr(loadFactor));
    }
    this.loadFactor = loadFactor;
    let tableSize = ObjectSet.tableSize(initialCapacity, loadFactor);
    this.threshold = $J.d2i((Math.fround(tableSize * loadFactor)));
    this.mask = (tableSize - 1) | 0;
    this.shift_ = $J.Long_numberOfLeadingZeros(BigInt(this.mask));
    this.keyTable = $J.newArray(tableSize, null);
    this.valueTable = $J.newArray(tableSize, null);
    return this;
  }
  /**
   * Returns an index >= 0 and <= {@link #mask} for the specified {@code item}.
   * <p>
   * The default implementation uses Fibonacci hashing on the item's {@link Object#hashCode()}: the hashcode is multiplied by a
   * long constant (2 to the 64th, divided by the golden ratio) then the uppermost bits are shifted into the lowest positions to
   * obtain an index in the desired range. Multiplication by a long may be slower than int (eg on GWT) but greatly improves
   * rehashing, allowing even very poor hashcodes, such as those that only differ in their upper bits, to be used without high
   * collision rates. Fibonacci hashing has increased collision rates when all or most hashcodes are multiples of larger
   * Fibonacci numbers (see <a href=
   * "https://probablydance.com/2018/06/16/fibonacci-hashing-the-optimization-that-the-world-forgot-or-a-better-alternative-to-integer-modulo/">Malte
   * Skarupke's blog post</a>).
   * <p>
   * This method can be overriden to customizing hashing. This may be useful eg in the unlikely event that most hashcodes are
   * Fibonacci numbers, if keys provide poor or incorrect hashcodes, or to simplify hashing if keys provide high quality
   * hashcodes and don't need Fibonacci hashing: {@code return item.hashCode() & mask;}
   */
  place(item: K): number {
    return $J.l2i(($J.lushr(BigInt.asIntN(64, BigInt($J.hashCode(item)) * -7046029254386353131n), this.shift_)));
  }
  /**
   * Returns the index of the key if already present, else -(index + 1) for the next empty index. This can be overridden in this
   * pacakge to compare for equality differently than {@link Object#equals(Object)}.
   */
  locateKey(key: K): number {
    if (key == null) {
      throw new IllegalArgumentException('key cannot be null.');
    }
    let keyTable = this.keyTable;
    for (let i = this.place(key); ; i = ((i + 1) | 0) & this.mask) {
      let other = keyTable[i];
      if (other == null) {
        return -((i + 1) | 0);
      }
      if ($J.equals(other, key)) {
        return i;
      }
    }
  }
  /**
   * Returns the old value associated with the specified key, or null.
   */
  put(key: K, value: V): V {
    let i = this.locateKey(key);
    if (i >= 0) {
      let oldValue = this.valueTable[i];
      this.valueTable[i] = value;
      return oldValue;
    }
    i = -((i + 1) | 0);
    this.keyTable[i] = key;
    this.valueTable[i] = value;
    if (++this.size_ >= this.threshold) {
      this.resize(this.keyTable.length << 1);
    }
    return null;
  }
  /**
   * Skips checks for existing keys, doesn't increment size.
   */
  putResize(key: K, value: V): void {
    let keyTable = this.keyTable;
    for (let i = this.place(key); ; i = ((i + 1) | 0) & this.mask) {
      if (keyTable[i] == null) {
        keyTable[i] = key;
        this.valueTable[i] = value;
        return;
      }
    }
  }
  /**
   * Returns the value for the specified key, or null if the key is not in the map.
   */
  get$Object<T>(key: T): V {
    let i = this.locateKey(key);
    return i < 0 ? null : this.valueTable[i];
  }
  /**
   * Returns the value for the specified key, or the default value if the key is not in the map.
   */
  get$Object$Object(key: K, defaultValue: V): V {
    let i = this.locateKey(key);
    return i < 0 ? defaultValue : this.valueTable[i];
  }
  /**
   * Returns the value for the removed key, or null if the key is not in the map.
   */
  remove(key: K): V {
    let i = this.locateKey(key);
    if (i < 0) {
      return null;
    }
    let keyTable = this.keyTable;
    let valueTable = this.valueTable;
    let oldValue = valueTable[i];
    let mask = this.mask;
    let next = ((i + 1) | 0) & mask;
    while ((key = keyTable[next]) != null) {
      let placement = this.place(key);
      if ((((next - placement) | 0) & mask) > (((i - placement) | 0) & mask)) {
        keyTable[i] = key;
        valueTable[i] = valueTable[next];
        i = next;
      }
      next = ((next + 1) | 0) & mask;
    }
    keyTable[i] = null;
    valueTable[i] = null;
    this.size_--;
    return oldValue;
  }
  clear$(): void {
    if (this.size_ === 0) {
      return;
    }
    this.size_ = 0;
    Arrays.fill(this.keyTable, null);
    Arrays.fill(this.valueTable, null);
  }
  resize(newSize: number): void {
    let oldCapacity = this.keyTable.length;
    this.threshold = $J.d2i((Math.fround(newSize * this.loadFactor)));
    this.mask = (newSize - 1) | 0;
    this.shift_ = $J.Long_numberOfLeadingZeros(BigInt(this.mask));
    let oldKeyTable = this.keyTable;
    let oldValueTable = this.valueTable;
    this.keyTable = $J.newArray(newSize, null);
    this.valueTable = $J.newArray(newSize, null);
    if (this.size_ > 0) {
      for (let i = 0; i < oldCapacity; i++) {
        let key = oldKeyTable[i];
        if (key != null) {
          this.putResize(key, oldValueTable[i]);
        }
      }
    }
  }
  hashCode(): number {
    let h = this.size_;
    let keyTable = this.keyTable;
    let valueTable = this.valueTable;
    for (let i = 0, n = keyTable.length; i < n; i++) {
      let key = keyTable[i];
      if (key != null) {
        h = (h + $J.hashCode(key)) | 0;
        let value = valueTable[i];
        if (value != null) {
          h = (h + $J.hashCode(value)) | 0;
        }
      }
    }
    return h;
  }
  equals(obj: any): boolean {
    if (obj === this) {
      return true;
    }
    if (!(obj instanceof ObjectMap)) {
      return false;
    }
    let other = obj;
    if (other.size_ !== this.size_) {
      return false;
    }
    let keyTable = this.keyTable;
    let valueTable = this.valueTable;
    for (let i = 0, n = keyTable.length; i < n; i++) {
      let key = keyTable[i];
      if (key != null) {
        let value = valueTable[i];
        if (value == null) {
          if (other.get$Object$Object(key, ObjectMap.dummy) != null) {
            return false;
          }
        } else {
          if (!$J.equals(value, other.get$Object(key))) {
            return false;
          }
        }
      }
    }
    return true;
  }
  toString(): string {
    return this.toString$String$boolean(', ', true);
  }
  toString$String$boolean(separator: string, braces: boolean): string {
    if (this.size_ === 0) {
      return braces ? '{}' : '';
    }
    let buffer = new StringBuilder(32);
    if (braces) {
      buffer.append(String.fromCharCode(123 /* '{' */));
    }
    let keyTable = this.keyTable;
    let valueTable = this.valueTable;
    let i = keyTable.length;
    while (i-- > 0) {
      let key = keyTable[i];
      if (key == null) {
        continue;
      }
      buffer.append($J.str(key === this ? '(this)' : key));
      buffer.append(String.fromCharCode(61 /* '=' */));
      let value = valueTable[i];
      buffer.append($J.str(value === this ? '(this)' : value));
      break;
    }
    while (i-- > 0) {
      let key = keyTable[i];
      if (key == null) {
        continue;
      }
      buffer.append(separator);
      buffer.append($J.str(key === this ? '(this)' : key));
      buffer.append(String.fromCharCode(61 /* '=' */));
      let value = valueTable[i];
      buffer.append($J.str(value === this ? '(this)' : value));
    }
    if (braces) {
      buffer.append(String.fromCharCode(125 /* '}' */));
    }
    return buffer.toString();
  }
  iterator(): ObjectMap$Entries<K, V> {
    return this.entries();
  }
  /**
   * Returns an iterator for the entries in the map. Remove is supported.
   * <p>
   * If {@link Collections#allocateIterators} is false, the same iterator instance is returned each time this method is called.
   * Use the {@link Entries} constructor for nested or multithreaded iteration.
   */
  entries(): ObjectMap$Entries<K, V> {
    if (Collections.allocateIterators) {
      return new ObjectMap$Entries()._ObjectMap$Entries(this);
    }
    if (this.entries1 == null) {
      this.entries1 = new ObjectMap$Entries()._ObjectMap$Entries(this);
      this.entries2 = new ObjectMap$Entries()._ObjectMap$Entries(this);
    }
    if (!this.entries1.valid_) {
      this.entries1.reset();
      this.entries1.valid_ = true;
      this.entries2.valid_ = false;
      return this.entries1;
    }
    this.entries2.reset();
    this.entries2.valid_ = true;
    this.entries1.valid_ = false;
    return this.entries2;
  }
  static $clinit() {
    ObjectMap.dummy = new JObject();
  }
}

export class ObjectMap$Entry<K, V> extends JObject {
  key: K = null;
  value_: V = null;
  _ObjectMap$Entry(): this {
    return this;
  }
  toString(): string {
    return $J.str(this.key) + '=' + $J.str(this.value_);
  }
}

export class ObjectMap$MapIterator<K, V, I> extends JObject {
  hasNext_: boolean = false;
  map_: ObjectMap<K, V> = null;
  nextIndex: number = 0;
  currentIndex: number = 0;
  valid_: boolean = false;
  _ObjectMap$MapIterator(map: ObjectMap<K, V>): this {
    this.valid_ = true;
    this.map_ = map;
    this.reset();
    return this;
  }
  reset(): void {
    this.currentIndex = -1;
    this.nextIndex = -1;
    this.findNextIndex();
  }
  findNextIndex(): void {
    let keyTable = this.map_.keyTable;
    for (let n = keyTable.length; ++this.nextIndex < n; ) {
      if (keyTable[this.nextIndex] != null) {
        this.hasNext_ = true;
        return;
      }
    }
    this.hasNext_ = false;
  }
  remove(): void {
    let i = this.currentIndex;
    if (i < 0) {
      throw new IllegalStateException('next must be called before remove.');
    }
    let keyTable = this.map_.keyTable;
    let valueTable = this.map_.valueTable;
    let mask = this.map_.mask;
    let next = ((i + 1) | 0) & mask;
    let key: K;
    while ((key = keyTable[next]) != null) {
      let placement = this.map_.place(key);
      if ((((next - placement) | 0) & mask) > (((i - placement) | 0) & mask)) {
        keyTable[i] = key;
        valueTable[i] = valueTable[next];
        i = next;
      }
      next = ((next + 1) | 0) & mask;
    }
    keyTable[i] = null;
    valueTable[i] = null;
    this.map_.size_--;
    if (i !== this.currentIndex) {
      --this.nextIndex;
    }
    this.currentIndex = -1;
  }
}

export class ObjectMap$Entries<K, V> extends ObjectMap$MapIterator {
  entry: ObjectMap$Entry<K, V> = null;
  _ObjectMap$Entries(map: ObjectMap<K, V>): this {
    this._ObjectMap$MapIterator(map);
    this.entry = new ObjectMap$Entry()._ObjectMap$Entry();
    return this;
  }
  /**
   * Note the same entry instance is returned each time this method is called.
   */
  next(): ObjectMap$Entry<K, V> {
    if (!this.hasNext_) {
      throw new NoSuchElementException();
    }
    if (!this.valid_) {
      throw new GdxRuntimeException('#iterator() cannot be used nested.');
    }
    let keyTable = this.map_.keyTable;
    this.entry.key = keyTable[this.nextIndex];
    this.entry.value_ = this.map_.valueTable[this.nextIndex];
    this.currentIndex = this.nextIndex;
    this.findNextIndex();
    return this.entry;
  }
  hasNext(): boolean {
    if (!this.valid_) {
      throw new GdxRuntimeException('#iterator() cannot be used nested.');
    }
    return this.hasNext_;
  }
  iterator(): ObjectMap$Entries<K, V> {
    return this;
  }
}

$J.define(ObjectMap, 'com.badlogic.gdx.utils.ObjectMap', { kind: 'class', ifaces: ['java.lang.Iterable'], sup: 'java.lang.Object', ctors: { 'com.badlogic.gdx.utils.ObjectMap': '_ObjectMap$ObjectMap', 'int,float': '_ObjectMap$int$float', 'int': '_ObjectMap$int', '': '_ObjectMap$' }, meths: { 'toString(java.lang.String,boolean)': 'toString$String$boolean', 'toString(java.lang.String)': 'toString$String', 'clear()': 'clear$', 'clear(int)': 'clear$int', 'get(java.lang.Object,java.lang.Object)': 'get$Object$Object', 'get(java.lang.Object)': 'get$Object', 'putAll(com.badlogic.gdx.utils.ObjectMap)': 'putAll$ObjectMap' }, clinit: true, lazy: ['dummy'] });
$J.define(ObjectMap$Entry, 'com.badlogic.gdx.utils.ObjectMap$Entry', { kind: 'class', sup: 'java.lang.Object', ctors: { '': '_ObjectMap$Entry' } });
$J.define(ObjectMap$MapIterator, 'com.badlogic.gdx.utils.ObjectMap$MapIterator', { kind: 'class', ifaces: ['java.lang.Iterable', 'java.util.Iterator'], sup: 'java.lang.Object', ctors: { 'com.badlogic.gdx.utils.ObjectMap': '_ObjectMap$MapIterator' } });
$J.define(ObjectMap$Entries, 'com.badlogic.gdx.utils.ObjectMap$Entries', { kind: 'class', sup: 'com.badlogic.gdx.utils.ObjectMap$MapIterator', ctors: { 'com.badlogic.gdx.utils.ObjectMap': '_ObjectMap$Entries' } });
$J.module(() => {
  ObjectSet = $J.load('com.badlogic.gdx.utils.ObjectSet');
});
