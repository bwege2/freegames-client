// @ts-nocheck
// FreeCol 1.2.0 src/net/sf/freecol/common/model/RandomRange.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
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
import { $J, IllegalArgumentException, JObject, Logger } from '../../../../../../jre/index.ts';

let RandomUtils;

/**
 * A range of numbers, and support routines to make a random choice therefrom.
 */
export class RandomRange extends JObject {
  static logger: Logger = null;
  /**
   * Percentage probability that the result is not zero.
   */
  probability: number = 0;
  /**
   * The inclusive lower bound of the range.
   */
  minimum: number = 0;
  /**
   * The inclusive upper bound of the range.
   */
  maximum: number = 0;
  /**
   * Factor to multiply the final value with.
   */
  factor: number = 0;
  static readonly FACTOR_TAG: string = 'factor';
  static readonly MAXIMUM_TAG: string = 'maximum';
  static readonly MINIMUM_TAG: string = 'minimum';
  static readonly PROBABILITY_TAG: string = 'probability';
  $init_RandomRange() {
    this.probability = 0;
    this.minimum = 0;
    this.maximum = 0;
    this.factor = 1;
  }
  /**
   * Creates a new {@code RandomRange} instance.
   *
   * @param probability The probability of this result.
   * @param minimum The range inclusive minimum.
   * @param maximum The range inclusive maximum.
   * @param factor The result multiplier.
   */
  _RandomRange$int$int$int$int(probability: number, minimum: number, maximum: number, factor: number): this {
    this.$init_RandomRange();
    if (probability < 0) {
      throw new IllegalArgumentException('Negative probability ' + probability);
    }
    if (minimum > maximum) {
      throw new IllegalArgumentException('Min ' + minimum + ' > Max ' + maximum);
    }
    this.probability = probability;
    this.minimum = minimum;
    this.maximum = maximum;
    this.factor = factor;
    return this;
  }
  /**
   * Read a new {@code RandomRange} instance from a stream.
   *
   * @param xr The {@code FreeColXMLReader} to read from.
   * @exception XMLStreamException if there is a problem reading the
   *     stream.
   */
  _RandomRange$FreeColXMLReader(xr: FreeColXMLReader): this {
    this.$init_RandomRange();
    this.readAttributes(xr);
    return this;
  }
  /**
   * Get the result probability.
   *
   * @return The probability.
   */
  getProbability(): number {
    return this.probability;
  }
  /**
   * Get the range lower bound.
   *
   * @return The lower bound.
   */
  getMinimum(): number {
    return this.minimum;
  }
  /**
   * Get the range upper bound.
   *
   * @return The upper bound.
   */
  getMaximum(): number {
    return this.maximum;
  }
  /**
   * Get the multiplication factor.
   *
   * @return The factor.
   */
  getFactor(): number {
    return this.factor;
  }
  /**
   * Gets a random value from this range.
   *
   * @param prefix A logger prefix.
   * @param random A pseudo-random number source.
   * @param continuous Choose a continuous or discrete result.
   * @return A random amount of plunder as defined by this
   *     {@code RandomRange}.
   */
  getAmount(prefix: string, random: Random, continuous: boolean): number {
    if (this.probability >= 100 || (this.probability > 0 && RandomUtils.randomInt(RandomRange.logger, prefix + ' check-probability', random, 100) < this.probability)) {
      let range = (this.maximum - this.minimum + 1) | 0;
      if (continuous) {
        let r = RandomUtils.randomInt(RandomRange.logger, prefix + ' random-range', random, Math.imul(range, this.factor));
        return (r + Math.imul(this.minimum, this.factor)) | 0;
      } else {
        let r = RandomUtils.randomInt(RandomRange.logger, prefix + ' random-range', random, range);
        return Math.imul(((r + this.minimum) | 0), this.factor);
      }
    }
    return 0;
  }
  /**
   * This method writes an XML-representation of this object to
   * the given stream.
   *
   * @param xw The {@code FreeColXMLWriter} to write to.
   * @exception XMLStreamException if there are any problems writing
   *     to the stream.
   */
  writeAttributes(xw: FreeColXMLWriter): void {
    xw.writeAttribute$String$int(RandomRange.PROBABILITY_TAG, this.probability);
    xw.writeAttribute$String$int(RandomRange.MINIMUM_TAG, this.minimum);
    xw.writeAttribute$String$int(RandomRange.MAXIMUM_TAG, this.maximum);
    xw.writeAttribute$String$int(RandomRange.FACTOR_TAG, this.factor);
  }
  /**
   * Initializes this object from an XML-representation of this object.
   *
   * @param xr The input stream with the XML.
   */
  readAttributes(xr: FreeColXMLReader): void {
    this.probability = xr.getAttribute$String$int(RandomRange.PROBABILITY_TAG, 0);
    this.minimum = xr.getAttribute$String$int(RandomRange.MINIMUM_TAG, 0);
    this.maximum = xr.getAttribute$String$int(RandomRange.MAXIMUM_TAG, 0);
    this.factor = xr.getAttribute$String$int(RandomRange.FACTOR_TAG, 0);
  }
  static $clinit() {
    RandomRange.logger = Logger.getLogger($J.cls(RandomRange).getName());
  }
}

$J.define(RandomRange, 'net.sf.freecol.common.model.RandomRange', { kind: 'class', sup: 'java.lang.Object', ctors: { 'net.sf.freecol.common.io.FreeColXMLReader': '_RandomRange$FreeColXMLReader', 'int,int,int,int': '_RandomRange$int$int$int$int' }, returns: { 'getFactor': 'int', 'getMaximum': 'int', 'getMinimum': 'int', 'getProbability': 'int' }, clinit: true, lazy: ['logger'] });
$J.module(() => {
  RandomUtils = $J.load('net.sf.freecol.common.util.RandomUtils');
});
