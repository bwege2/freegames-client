// @ts-nocheck
// FreeCol 1.2.0 src/net/sf/freecol/common/option/RangeOption.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
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
import { $J, Logger } from '../../../../../../jre/index.ts';
import { SelectOption } from './SelectOption.ts';

let Constants;

/**
 * Represents an option where the valid choice is an integer and the
 * choices are represented by strings. In general, these strings are
 * localized by looking up the key of the choice, which consists of
 * the identifier of the AbstractObject followed by a "." followed by
 * the value of the option string.
 *
 * RangeOption differs from SelectOption, as the value being selected
 * represents a numeric measurement, defined by a bounded range of
 * comparable values.  As the graphical component rendering a range
 * option only works with a conventional index, this implies to manage
 * a fixed rank for each possible values.
 */
export class RangeOption extends SelectOption {
  static logger: Logger = null;
  static readonly TAG: string = 'rangeOption';
  /**
   * Creates a new {@code RangeOption}.
   *
   * @param specification The {@code Specification} to refer to.
   */
  _RangeOption$Specification(specification: Specification): this {
    this._SelectOption$Specification(specification);
    return this;
  }
  /**
   * Creates a new {@code RangeOption}.
   *
   * @param id The object identifier.
   * @param specification The {@code Specification} to refer to.
   */
  _RangeOption$String$Specification(id: string, specification: Specification): this {
    this._SelectOption$String$Specification(id, specification);
    return this;
  }
  /**
   * Gets the rank of the current selected value in the list of
   * values of this {@code RangeOption}.
   *
   * @return The value.
   */
  getValueRank(): number {
    let rank = 0;
    for (const $it0 = this.getItemValues().keySet().iterator(); $it0.hasNext(); ) {
      let i = $it0.next();
      if ($J.compareTo(i, this.getValue$()) === 0) {
        return rank;
      }
      rank++;
    }
    return 0;
  }
  /**
   * Sets the value through the rank in the list of values of this
   * {@code RangeOption}.
   *
   * @param rank The rank of the value to be set.
   */
  setValueRank(rank: number): void {
    let curValue = Constants.UNDEFINED;
    let iterator = this.getItemValues().keySet().iterator();
    while (rank >= 0) {
      if (!iterator.hasNext()) {
        break;
      }
      curValue = iterator.next();
      rank--;
    }
    this.setValue$Object(curValue);
  }
  /**
   * Gets the tag name of the contained object.
   *
   * @return "rangeValue".
   */
  getXMLItemElementTagName(): string {
    return 'rangeValue';
  }
  /**
   * {@inheritDoc}
   */
  getXMLTagName(): string {
    return RangeOption.TAG;
  }
  static $clinit() {
    RangeOption.logger = Logger.getLogger($J.cls(RangeOption).getName());
  }
}

$J.define(RangeOption, 'net.sf.freecol.common.option.RangeOption', { kind: 'class', sup: 'net.sf.freecol.common.option.SelectOption', ctors: { 'java.lang.String,net.sf.freecol.common.model.Specification': '_RangeOption$String$Specification', 'net.sf.freecol.common.model.Specification': '_RangeOption$Specification' }, returns: { 'getXMLTagName': 'java.lang.String', 'getXMLItemElementTagName': 'java.lang.String', 'getValueRank': 'int' }, clinit: true, lazy: ['logger'] });
$J.module(() => {
  Constants = $J.load('net.sf.freecol.common.model.Constants');
});
