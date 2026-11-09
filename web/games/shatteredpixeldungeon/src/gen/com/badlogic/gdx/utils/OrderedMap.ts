// @ts-nocheck
// OrderedMap.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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
import { $J, Collections, GdxRuntimeException, IllegalStateException, NoSuchElementException, StringBuilder } from '../../../../../jre/index.ts';
import { ObjectMap } from './ObjectMap.ts';
import { ObjectMap$Entries } from './ObjectMap.ts';

let Array_;

/**
 * An {@link ObjectMap} that also stores keys in an {@link Array} using the insertion order. Null keys are not allowed. No
 * allocation is done except when growing the table size.
 * <p>
 * Iteration over the {@link #entries()}, {@link #keys()}, and {@link #values()} is ordered and faster than an unordered map. Keys
 * can also be accessed and the order changed using {@link #orderedKeys()}. There is some additional overhead for put and remove.
 * When used for faster iteration versus ObjectMap and the order does not actually matter, copying during remove can be greatly
 * reduced by setting {@link Array#ordered} to false for {@link OrderedMap#orderedKeys()}.
 * <p>
 * This class performs fast contains (typically O(1), worst case O(n) but that is rare in practice). Remove is somewhat slower due
 * to {@link #orderedKeys()}. Add may be slightly slower, depending on hash collisions. Hashcodes are rehashed to reduce
 * collisions and the need to resize. Load factors greater than 0.91 greatly increase the chances to resize to the next higher POT
 * size.
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
export class OrderedMap<K, V> extends ObjectMap {
  keys_: Array_<K> = null;
  /**
   * Creates a new map with an initial capacity of 51 and a load factor of 0.8.
   */
  _OrderedMap$(): this {
    this._ObjectMap$();
    this.keys_ = new Array_()._Array$();
    return this;
  }
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
    this.keys_.add$Object(key);
    if (++this.size_ >= this.threshold) {
      this.resize(this.keyTable.length << 1);
    }
    return null;
  }
  remove(key: K): V {
    this.keys_.removeValue(key, false);
    return super.remove(key);
  }
  clear$(): void {
    this.keys_.clear();
    super.clear$();
  }
  iterator(): ObjectMap$Entries<K, V> {
    return this.entries();
  }
  /**
   * Returns an iterator for the entries in the map. Remove is supported.
   * <p>
   * If {@link Collections#allocateIterators} is false, the same iterator instance is returned each time this method is called.
   * Use the {@link OrderedMapEntries} constructor for nested or multithreaded iteration.
   */
  entries(): ObjectMap$Entries<K, V> {
    if (Collections.allocateIterators) {
      return new OrderedMap$OrderedMapEntries()._OrderedMap$OrderedMapEntries(this);
    }
    if (this.entries1 == null) {
      this.entries1 = new OrderedMap$OrderedMapEntries()._OrderedMap$OrderedMapEntries(this);
      this.entries2 = new OrderedMap$OrderedMapEntries()._OrderedMap$OrderedMapEntries(this);
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
  toString$String$boolean(separator: string, braces: boolean): string {
    if (this.size_ === 0) {
      return braces ? '{}' : '';
    }
    let buffer = new StringBuilder(32);
    if (braces) {
      buffer.append(String.fromCharCode(123 /* '{' */));
    }
    let keys = this.keys_;
    for (let i = 0, n = keys.size_; i < n; i++) {
      let key = keys.get(i);
      if (i > 0) {
        buffer.append(separator);
      }
      buffer.append($J.str(key === this ? '(this)' : key));
      buffer.append(String.fromCharCode(61 /* '=' */));
      let value = this.get$Object(key);
      buffer.append($J.str(value === this ? '(this)' : value));
    }
    if (braces) {
      buffer.append(String.fromCharCode(125 /* '}' */));
    }
    return buffer.toString();
  }
}

export class OrderedMap$OrderedMapEntries<K, V> extends ObjectMap$Entries {
  keys_: Array_<K> = null;
  _OrderedMap$OrderedMapEntries(map: OrderedMap<K, V>): this {
    this._ObjectMap$Entries(map);
    this.keys_ = map.keys_;
    return this;
  }
  reset(): void {
    this.currentIndex = -1;
    this.nextIndex = 0;
    this.hasNext_ = this.map_.size_ > 0;
  }
  next(): ObjectMap$Entry {
    if (!this.hasNext_) {
      throw new NoSuchElementException();
    }
    if (!this.valid_) {
      throw new GdxRuntimeException('#iterator() cannot be used nested.');
    }
    this.currentIndex = this.nextIndex;
    this.entry.key = this.keys_.get(this.nextIndex);
    this.entry.value_ = this.map_.get$Object(this.entry.key);
    this.nextIndex++;
    this.hasNext_ = this.nextIndex < this.map_.size_;
    return this.entry;
  }
  remove(): void {
    if (this.currentIndex < 0) {
      throw new IllegalStateException('next must be called before remove.');
    }
    this.map_.remove(this.entry.key);
    this.nextIndex--;
    this.currentIndex = -1;
  }
}

$J.define(OrderedMap, 'com.badlogic.gdx.utils.OrderedMap', { kind: 'class', sup: 'com.badlogic.gdx.utils.ObjectMap', ctors: { 'com.badlogic.gdx.utils.OrderedMap': '_OrderedMap$OrderedMap', 'int,float': '_OrderedMap$int$float', 'int': '_OrderedMap$int', '': '_OrderedMap$' }, meths: { 'toString(java.lang.String,boolean)': 'toString$String$boolean', 'clear()': 'clear$', 'clear(int)': 'clear$int', 'putAll(com.badlogic.gdx.utils.OrderedMap)': 'putAll$OrderedMap' } });
$J.define(OrderedMap$OrderedMapEntries, 'com.badlogic.gdx.utils.OrderedMap$OrderedMapEntries', { kind: 'class', sup: 'com.badlogic.gdx.utils.ObjectMap$Entries', ctors: { 'com.badlogic.gdx.utils.OrderedMap': '_OrderedMap$OrderedMapEntries' } });
$J.module(() => {
  Array_ = $J.load('com.badlogic.gdx.utils.Array');
});
