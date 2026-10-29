// @ts-nocheck
// FreeCol 1.2.0 src/net/sf/freecol/common/i18n/Number.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
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
import { $J, JEnum, JObject, Logger, NumberFormatException } from '../../../../../../jre/index.ts';

/**
 * Classes implementing this interface can determine the category and
 * the index of a double based on the number rules for a language.
 *
 * See the
 * <a href="http://cldr.unicode.org/index/cldr-spec/plural-rules">
 * Common Locale Data Repository</a>.
 */
export class Number_ extends JObject {
  static logger: Logger = null;
  _Number(): this {
    return this;
  }
  /**
   * {@inheritDoc}
   */
  getKey$String$String(selector: string, template: string): string {
    try {
      return this.getKey$double$Number($J.parseDouble(selector));
    } catch ($e0) {
      if ($J.isa($e0, NumberFormatException)) {
        let e = $J.exc($e0);
        Number_.logger.warning('Syntax error in string template \'' + template + '\'');
        return Number$Category.other.toString();
      } else {
        throw $e0;
      }
    }
  }
  /**
   * Return the key of the rule this selector matches. The key is the
   * string representation of the Category.
   *
   * @param selector a {@code double} value
   * @return a {@code String} value
   */
  getKey$double$Number(selector: number): string {
    return this.getCategory(selector).toString();
  }
  static $clinit() {
    Number_.logger = Logger.getLogger($J.cls(Number_).getName());
  }
}

export class Number$Category extends JEnum {
  static zero: Number$Category = null;
  static one: Number$Category = null;
  static two: Number$Category = null;
  static few: Number$Category = null;
  static many: Number$Category = null;
  static other: Number$Category = null;
  static $VALUES: Number$Category[] = null;
  _Number$Category($name: string, $ordinal: number): this {
    this._JEnum($name, $ordinal);
    return this;
  }
  static values(): Number$Category[] { return Number$Category.$VALUES.slice(); }
  static valueOf(name: string): Number$Category { return $J.enumValueOf(Number$Category, name); }
  static $clinit() {
    Number$Category.zero = new Number$Category()._Number$Category('zero', 0);
    Number$Category.one = new Number$Category()._Number$Category('one', 1);
    Number$Category.two = new Number$Category()._Number$Category('two', 2);
    Number$Category.few = new Number$Category()._Number$Category('few', 3);
    Number$Category.many = new Number$Category()._Number$Category('many', 4);
    Number$Category.other = new Number$Category()._Number$Category('other', 5);
    Number$Category.$VALUES = [Number$Category.zero, Number$Category.one, Number$Category.two, Number$Category.few, Number$Category.many, Number$Category.other];
  }
}

$J.define(Number_, 'net.sf.freecol.common.i18n.Number', { kind: 'class', ifaces: ['net.sf.freecol.common.i18n.Selector'], sup: 'java.lang.Object', ctors: { '': '_Number' }, meths: { 'getKey(double)': 'getKey$double$Number', 'getKey(java.lang.String,java.lang.String)': 'getKey$String$String' }, clinit: true, lazy: ['logger'] });
$J.define(Number$Category, 'net.sf.freecol.common.i18n.Number$Category', { kind: 'enum', sup: 'java.lang.Enum', ctors: { '': '_Number$Category' }, clinit: true, lazy: ['$VALUES', 'zero', 'one', 'two', 'few', 'many', 'other'] });
