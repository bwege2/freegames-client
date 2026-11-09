// @ts-nocheck
// RandomXS128.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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
import { $J, IllegalArgumentException, Random as Random$lib } from '../../../../../jre/index.ts';

/**
 * This class implements the xorshift128+ algorithm that is a very fast, top-quality 64-bit pseudo-random number generator. The
 * quality of this PRNG is much higher than {@link Random}'s, and its cycle length is 2<sup>128</sup>&nbsp;&minus;&nbsp;1, which
 * is more than enough for any single-thread application. More details and algorithms can be found
 * <a href="http://xorshift.di.unimi.it/">here</a>.
 * <p>
 * Instances of RandomXS128 are not thread-safe.
 *
 * @author Inferno
 * @author davebaol
 */
export class RandomXS128 extends Random$lib {
  /**
   * Normalization constant for double.
   */
  static readonly NORM_DOUBLE: number = 1.1102230246251565E-16;
  /**
   * Normalization constant for float.
   */
  static readonly NORM_FLOAT: number = 5.960464477539063E-8;
  /**
   * The first half of the internal state of this pseudo-random number generator.
   */
  seed0: bigint = 0n;
  /**
   * The second half of the internal state of this pseudo-random number generator.
   */
  seed1: bigint = 0n;
  /**
   * Creates a new random number generator. This constructor sets the seed of the random number generator to a value very likely
   * to be distinct from any other invocation of this constructor.
   * <p>
   * This implementation creates a {@link Random} instance to generate the initial seed.
   */
  _RandomXS128$(): this {
    this._Random();
    this.setSeed(new Random$lib().nextLong());
    return this;
  }
  /**
   * Returns the next pseudo-random, uniformly distributed {@code long} value from this random number generator's sequence.
   * <p>
   * Subclasses should override this, as this is used by all other methods.
   */
  nextLong(): bigint {
    let s1 = this.seed0;
    let s0 = this.seed1;
    this.seed0 = s0;
    s1 = s1 ^ $J.lshl(s1, 23);
    return BigInt.asIntN(64, (this.seed1 = (s1 ^ s0 ^ ($J.lushr(s1, 17)) ^ ($J.lushr(s0, 26)))) + s0);
  }
  /**
   * This protected method is final because, contrary to the superclass, it's not used anymore by the other methods.
   */
  next(bits: number): number {
    return $J.l2i((this.nextLong() & (BigInt.asIntN(64, ($J.lshl(1n, bits)) - 1n))));
  }
  /**
   * Returns the next pseudo-random, uniformly distributed {@code int} value from this random number generator's sequence.
   * <p>
   * This implementation uses {@link #nextLong()} internally.
   */
  nextInt$(): number {
    return $J.l2i(this.nextLong());
  }
  /**
   * Returns a pseudo-random, uniformly distributed {@code int} value between 0 (inclusive) and the specified value (exclusive),
   * drawn from this random number generator's sequence.
   * <p>
   * This implementation uses {@link #nextLong()} internally.
   * @param n the positive bound on the random number to be returned.
   * @return the next pseudo-random {@code int} value between {@code 0} (inclusive) and {@code n} (exclusive).
   */
  nextInt$int(n: number): number {
    return $J.l2i(this.nextLong$long(BigInt(n)));
  }
  /**
   * Returns a pseudo-random, uniformly distributed {@code long} value between 0 (inclusive) and the specified value
   * (exclusive), drawn from this random number generator's sequence. The algorithm used to generate the value guarantees that
   * the result is uniform, provided that the sequence of 64-bit values produced by this generator is.
   * <p>
   * This implementation uses {@link #nextLong()} internally.
   * @param n the positive bound on the random number to be returned.
   * @return the next pseudo-random {@code long} value between {@code 0} (inclusive) and {@code n} (exclusive).
   */
  nextLong$long(n: bigint): bigint {
    if (n <= 0n) {
      throw new IllegalArgumentException('n must be positive');
    }
    for (; ; ) {
      let bits = $J.lushr(this.nextLong(), 1);
      let value = $J.lrem(bits, n);
      if (BigInt.asIntN(64, BigInt.asIntN(64, bits - value) + (BigInt.asIntN(64, n - 1n))) >= 0n) {
        return value;
      }
    }
  }
  /**
   * Returns a pseudo-random, uniformly distributed {@code double} value between 0.0 and 1.0 from this random number generator's
   * sequence.
   * <p>
   * This implementation uses {@link #nextLong()} internally.
   */
  nextDouble(): number {
    return Number(($J.lushr(this.nextLong(), 11))) * RandomXS128.NORM_DOUBLE;
  }
  /**
   * Returns a pseudo-random, uniformly distributed {@code float} value between 0.0 and 1.0 from this random number generator's
   * sequence.
   * <p>
   * This implementation uses {@link #nextLong()} internally.
   */
  nextFloat(): number {
    return Math.fround((Number(($J.lushr(this.nextLong(), 40))) * RandomXS128.NORM_FLOAT));
  }
  /**
   * Returns a pseudo-random, uniformly distributed {@code boolean } value from this random number generator's sequence.
   * <p>
   * This implementation uses {@link #nextLong()} internally.
   */
  nextBoolean(): boolean {
    return (this.nextLong() & 1n) !== 0n;
  }
  /**
   * Generates random bytes and places them into a user-supplied byte array. The number of random bytes produced is equal to the
   * length of the byte array.
   * <p>
   * This implementation uses {@link #nextLong()} internally.
   */
  nextBytes(bytes: number[]): void {
    let n = 0;
    let i = bytes.length;
    while (i !== 0) {
      n = i < 8 ? i : 8;
      for (let bits = this.nextLong(); n-- !== 0; bits = $J.lshr(bits, 8)) {
        bytes[--i] = ($J.l2i(bits) << 24) >> 24;
      }
    }
  }
  /**
   * Sets the internal seed of this generator based on the given {@code long} value.
   * <p>
   * The given seed is passed twice through a hash function. This way, if the user passes a small value we avoid the short
   * irregular transient associated with states having a very small number of bits set.
   * @param seed a nonzero seed for this generator (if zero, the generator will be seeded with {@link Long#MIN_VALUE}).
   */
  setSeed(seed: bigint): void {
    let seed0 = RandomXS128.murmurHash3(seed === 0n ? -9223372036854775808n : seed);
    this.setState(seed0, RandomXS128.murmurHash3(seed0));
  }
  /**
   * Sets the internal state of this generator.
   * @param seed0 the first part of the internal state
   * @param seed1 the second part of the internal state
   */
  setState(seed0: bigint, seed1: bigint): void {
    this.seed0 = seed0;
    this.seed1 = seed1;
  }
  static murmurHash3(x: bigint): bigint {
    x = x ^ $J.lushr(x, 33);
    x = BigInt.asIntN(64, x * -49064778989728563n);
    x = x ^ $J.lushr(x, 33);
    x = BigInt.asIntN(64, x * -4265267296055464877n);
    x = x ^ $J.lushr(x, 33);
    return x;
  }
  nextInt(...a: any[]): any {
    if (a.length === 0) return this.nextInt$(...a);
    if (a.length === 1 && typeof a[0] === 'number') return this.nextInt$int(...a);
    return super.nextInt(...a);
  }
}

$J.define(RandomXS128, 'com.badlogic.gdx.math.RandomXS128', { kind: 'class', sup: 'java.util.Random', ctors: { 'long,long': '_RandomXS128$long$long', 'long': '_RandomXS128$long', '': '_RandomXS128$' }, meths: { 'nextLong(long)': 'nextLong$long', 'nextInt(int)': 'nextInt$int', 'nextInt()': 'nextInt$' } });
