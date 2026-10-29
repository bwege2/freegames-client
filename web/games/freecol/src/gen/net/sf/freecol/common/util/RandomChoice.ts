// @ts-nocheck
// FreeCol 1.2.0 src/net/sf/freecol/common/util/RandomChoice.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
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
import { $J, JObject } from '../../../../../../jre/index.ts';

let CollectionUtils, RandomUtils;

/**
 * A class to provide flat and weighted random selection from a collection.
 */
export class RandomChoice<T> extends JObject {
  probability: number = 0;
  object: T = null;
  _RandomChoice(object$: T, probability: number): this {
    this.probability = probability;
    this.object = object$;
    return this;
  }
  getProbability(): number {
    return this.probability;
  }
  getObject(): T {
    return this.object;
  }
  static select<T>(input: Collection<RandomChoice<T>>, probability: number): T {
    if (input.isEmpty()) {
      return null;
    }
    let total = 0;
    for (const $it0 = input.iterator(); $it0.hasNext(); ) {
      let choice = $it0.next();
      total = (total + choice.getProbability()) | 0;
      if (probability < total) {
        return choice.getObject();
      }
    }
    return CollectionUtils.first$Collection(input).getObject();
  }
  static getTotalProbability<T>(input: Collection<RandomChoice<T>>): number {
    return CollectionUtils.sum$Collection$ToIntFunction(input, ($p0) => $p0.getProbability());
  }
  static getWeightedRandom$Logger$String$Collection$Random<T>(logger: Logger, logMe: string, input: Collection<RandomChoice<T>>, random: Random): T {
    let n: number;
    return (input == null || input.isEmpty() || (n = RandomChoice.getTotalProbability(input)) <= 0) ? null : (input.size() === 1) ? CollectionUtils.first$Collection(input).getObject() : RandomChoice.select(input, RandomUtils.randomInt(logger, logMe, random, n));
  }
  static getWeightedRandom$Logger$String$Stream$Random<T>(logger: Logger, logMe: string, input: Stream<RandomChoice<T>>, random: Random): T {
    return (input == null) ? null : RandomChoice.getWeightedRandom$Logger$String$Collection$Random(logger, logMe, CollectionUtils.toList$Stream(input), random);
  }
  static normalize<T>(input: Collection<RandomChoice<T>>, expectedTotal: number): void {
    let n: number;
    if (input == null || input.isEmpty() || (n = RandomChoice.getTotalProbability(input)) <= 0) {
      return;
    }
    let mult = expectedTotal / n;
    for (const $it1 = input.iterator(); $it1.hasNext(); ) {
      let choice = $it1.next();
      choice.probability = ($J.round(mult * choice.probability)) | 0;
    }
  }
}

$J.define(RandomChoice, 'net.sf.freecol.common.util.RandomChoice', { kind: 'class', sup: 'java.lang.Object', ctors: { 'java.lang.Object,int': '_RandomChoice' }, returns: { 'getProbability': 'int' }, meths: { 'getWeightedRandom(java.util.logging.Logger,java.lang.String,java.util.stream.Stream,java.util.Random)': 'getWeightedRandom$Logger$String$Stream$Random', 'getWeightedRandom(java.util.logging.Logger,java.lang.String,java.util.Collection,java.util.Random)': 'getWeightedRandom$Logger$String$Collection$Random' } });
$J.module(() => {
  CollectionUtils = $J.load('net.sf.freecol.common.util.CollectionUtils');
  RandomUtils = $J.load('net.sf.freecol.common.util.RandomUtils');
});
