// @ts-nocheck
// ObjectSet.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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
import { $J, IllegalArgumentException, JObject } from '../../../../../jre/index.ts';

let MathUtils;

/**
 * An unordered set where the keys are objects. Null keys are not allowed. No allocation is done except when growing the table
 * size.
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
export class ObjectSet<T> extends JObject {
  size_: number = 0;
  keyTable: T[] = null;
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
  iterator1: ObjectSet$ObjectSetIterator = null;
  iterator2: ObjectSet$ObjectSetIterator = null;
  static tableSize(capacity: number, loadFactor: number): number {
    if (capacity < 0) {
      throw new IllegalArgumentException('capacity must be >= 0: ' + capacity);
    }
    let tableSize = MathUtils.nextPowerOfTwo(Math.max(2, $J.d2i(Math.ceil(Math.fround(capacity / loadFactor)))));
    if (tableSize > 1 << 30) {
      throw new IllegalArgumentException('The required capacity is too large: ' + capacity);
    }
    return tableSize;
  }
}

$J.define(ObjectSet, 'com.badlogic.gdx.utils.ObjectSet', { kind: 'class', ifaces: ['java.lang.Iterable'], sup: 'java.lang.Object', ctors: { 'com.badlogic.gdx.utils.ObjectSet': '_ObjectSet$ObjectSet', 'int,float': '_ObjectSet$int$float', 'int': '_ObjectSet$int', '': '_ObjectSet$' }, meths: { 'toString(java.lang.String)': 'toString$String', 'clear()': 'clear$', 'clear(int)': 'clear$int', 'addAll(com.badlogic.gdx.utils.ObjectSet)': 'addAll$ObjectSet', 'addAll(java.lang.Object[],int,int)': 'addAll$ObjectArr$int$int', 'addAll(java.lang.Object[])': 'addAll$ObjectArr', 'addAll(com.badlogic.gdx.utils.Array,int,int)': 'addAll$Array$int$int', 'addAll(com.badlogic.gdx.utils.Array)': 'addAll$Array' } });
$J.module(() => {
  MathUtils = $J.load('com.badlogic.gdx.math.MathUtils');
});
