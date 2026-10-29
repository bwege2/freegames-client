// @ts-nocheck
// FreeCol 1.2.0 src/net/sf/freecol/common/util/RandomUtils.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
/**
 *  Copyright (C) 2002-2022   The FreeCol Team
 *
 *  This file is part of FreeCol.
 *
 *  FreeCol is free software: you can redistribute it and/or modify
 *  it under the terms of the GNU General Public License as published by
 *  the Free Software Foundation, either version 2 of the License, or
 *  (at your option) any later version.
 *
 *  FreeCol is distributed in the hope that it will be useful,
 *  but WITHOUT ANY WARRANTY; without even the implied warranty of
 *  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *  GNU General Public License for more details.
 *
 *  You should have received a copy of the GNU General Public License
 *  along with FreeCol.  If not, see <http://www.gnu.org/licenses/>.
 */
import { $J, Collections, Collectors, JObject, JString, Level, StringBuilder } from '../../../../../../jre/index.ts';

/**
 * Collection of small static helper routines for logged pseudo-random
 * number generation.
 */
export class RandomUtils extends JObject {
  _RandomUtils(): this {
    return this;
  }
  /**
   * Convenience to aid logging uses of Randoms.
   *
   * @param logger The {@code Logger} to log to.
   * @param logMe A string to log with the result.
   * @param random A pseudo-{@code Random} number source.
   * @param range The exclusive maximum integer to return.
   * @return A pseudo-random integer r, 0 &le; r &lt; range.
   */
  static randomInt(logger: Logger, logMe: string, random: Random, range: number): number {
    let ret = random.nextInt(range);
    if (logger != null) {
      logger.finest(logMe + ' random(' + range + ') = ' + ret);
    }
    return ret;
  }
  /**
   * Log an array of ints at Level.FINEST.
   *
   * @param logger The {@code Logger} to log to.
   * @param logMe A string to log with the result.
   * @param arr The array of ints to log.
   */
  static logArray(logger: Logger, logMe: string, arr: number[]): void {
    if (logger != null && logger.isLoggable(Level.FINEST)) {
      let sb = new StringBuilder(64);
      sb.append(logMe).append(' random').append(' = [');
      for (let i = 0; i < arr.length; i++) {
        sb.append(String.fromCharCode(32 /* ' ' */)).append(String(arr[i]));
      }
      sb.append(' ]');
      logger.finest(sb.toString());
    }
  }
  /**
   * Convenience to aid logging uses of Randoms.
   *
   * @param logger The {@code Logger} to log to.
   * @param logMe A string to log with the result.
   * @param random A pseudo-{@code Random} number source.
   * @param range The exclusive maximum integer to return.
   * @param n The number of randoms.
   * @return A vector of pseudo-random integers r, 0 &le; r &lt; range.
   */
  static randomInts(logger: Logger, logMe: string, random: Random, range: number, n: number): number[] {
    let ret = random.ints(n, 0, range).toArray();
    RandomUtils.logArray(logger, logMe, ret);
    return ret;
  }
  /**
   * Convenience to aid logging uses of Randoms.
   *
   * @param logger The {@code Logger} to log to.
   * @param logMe A string to log with the result.
   * @param random A pseudo-{@code Random} number source.
   * @return A pseudo-random double r, 0 &le; r &lt; 1.0.
   */
  static randomFloat(logger: Logger, logMe: string, random: Random): number {
    let ret = random.nextFloat();
    if (logger != null && logger.isLoggable(Level.FINEST)) {
      logger.finest(logMe + ' random(1.0f) = ' + $J.fstr(ret));
    }
    return ret;
  }
  /**
   * Convenience to aid logging uses of Randoms.
   *
   * @param logger The {@code Logger} to log to.
   * @param logMe A string to log with the result.
   * @param random A pseudo-{@code Random} number source.
   * @return A pseudo-random double r, 0 &le; r &lt; 1.0.
   */
  static randomDouble(logger: Logger, logMe: string, random: Random): number {
    let ret = random.nextDouble();
    if (logger != null && logger.isLoggable(Level.FINEST)) {
      logger.finest(logMe + ' random(1.0) = ' + $J.dstr(ret));
    }
    return ret;
  }
  /**
   * Gets a random member of a list.
   *
   * @param <T> The list member type.
   * @param logger The {@code Logger} to log to.
   * @param logMe A string to log with the result.
   * @param list The list.
   * @param random A random number source.
   * @return A random member from the list.
   */
  static getRandomMember$Logger$String$List$Random<T>(logger: Logger, logMe: string, list: List<T>, random: Random): T {
    switch (list.size()) {
      case 0:
        return null;
      case 1:
        return list.get(0);
      default:
        break;
    }
    return list.get(RandomUtils.randomInt(logger, logMe, random, list.size()));
  }
  /**
   * Gets a random member of a stream.
   *
   * @param <T> The list member type.
   * @param logger The {@code Logger} to log to.
   * @param logMe A string to log with the result.
   * @param stream The {@code Stream} to pick from.
   * @param random A random number source.
   * @return A random member from the stream.
   */
  static getRandomMember$Logger$String$Stream$Random<T>(logger: Logger, logMe: string, stream: Stream<T>, random: Random): T {
    return (stream == null) ? null : RandomUtils.getRandomMember$Logger$String$List$Random(logger, logMe, stream.collect(Collectors.toList()), random);
  }
  /**
   * Shuffle a list.
   *
   * @param logger The {@code Logger} to log to.
   * @param logMe A string to log with the result.
   * @param list The list.
   * @param random A random number source.
   */
  static randomShuffle(logger: Logger, logMe: string, list: List<any>, random: Random): void {
    if (list.size() <= 1 || random == null) {
      return;
    }
    if (logger != null && logger.isLoggable(Level.FINEST)) {
      logger.finest(logMe + ' shuffle.');
    }
    Collections.shuffle(list, random);
  }
}

export class RandomUtils$RandomIntCache extends JObject {
  logger: Logger = null;
  logMe: string = null;
  random: Random = null;
  range_: number = 0;
  size_: number = 0;
  generation: number = 0;
  cache: number[] = null;
  index_: number = 0;
  _RandomUtils$RandomIntCache(logger: Logger, logMe: string, random: Random, range: number, size: number): this {
    this.logger = logger;
    this.logMe = logMe;
    this.random = random;
    this.range_ = range;
    this.size_ = size;
    this.generation = 0;
    this.refill();
    return this;
  }
  refill(): void {
    this.cache = this.random.ints(this.size_, 0, this.range_).toArray();
    this.index_ = 0;
    RandomUtils.logArray(this.logger, this.logMe + '/' + String(this.generation), this.cache);
    this.generation++;
  }
  nextInt$(): number {
    if (this.index_ >= this.size_) {
      this.refill();
    }
    return this.cache[this.index_++];
  }
  nextInt$int(tighterRange: number): number {
    return this.nextInt$() % tighterRange;
  }
}

$J.define(RandomUtils, 'net.sf.freecol.common.util.RandomUtils', { kind: 'class', sup: 'java.lang.Object', ctors: { '': '_RandomUtils' }, meths: { 'getRandomMember(java.util.logging.Logger,java.lang.String,java.util.stream.Stream,java.util.Random)': 'getRandomMember$Logger$String$Stream$Random', 'getRandomMember(java.util.logging.Logger,java.lang.String,java.util.List,java.util.Random)': 'getRandomMember$Logger$String$List$Random' } });
$J.define(RandomUtils$RandomIntCache, 'net.sf.freecol.common.util.RandomUtils$RandomIntCache', { kind: 'class', sup: 'java.lang.Object', ctors: { 'java.util.logging.Logger,java.lang.String,java.util.Random,int,int': '_RandomUtils$RandomIntCache' }, meths: { 'nextInt(int)': 'nextInt$int', 'nextInt()': 'nextInt$' } });
