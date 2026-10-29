// @ts-nocheck
// FreeCol 1.2.0 src/net/sf/freecol/common/i18n/DefaultNumberRule.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
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
import { $J, EnumMap } from '../../../../../../jre/index.ts';
import { Number_ } from './Number.ts';

let Number$Category, Rule, CollectionUtils;

/**
 * This class handles zero or one rule for each number category.
 */
export class DefaultNumberRule extends Number_ {
  rules: JMap<Number$Category, Rule> = null;
  _DefaultNumberRule(): this {
    this._Number();
    this.rules = new EnumMap($J.cls(Number$Category));
    return this;
  }
  /**
   * Add a parsed rule for category.
   *
   * @param number a {@code Category} value
   * @param rule a {@code Rule} value
   */
  addRule$Category$Rule(number$: Number$Category, rule: Rule): void {
    this.rules.put(number$, rule);
  }
  /**
   * Add an unparsed rule for category.
   *
   * @param number a {@code Category} value
   * @param input a {@code String} value
   */
  addRule$Category$String(number$: Number$Category, input: string): void {
    this.rules.put(number$, new Rule()._Rule(input));
  }
  /**
   * Return the number of rules added.
   *
   * @return an {@code int} value
   */
  countRules(): number {
    return this.rules.size();
  }
  /**
   * Return the rule for the given category.
   *
   * @param category a {@code Category} value
   * @return a {@code Rule} value
   */
  getRule(category: Number$Category): Rule {
    return this.rules.get(category);
  }
  /**
   * {@inheritDoc}
   */
  getCategory(input: number): Number$Category {
    let pred = (category) => {
      let val = this.rules.get(category);
      return val != null && val.matches(input);
    };
    return CollectionUtils.find$ObjectArr$Predicate$Object(Number$Category.values(), pred, Number$Category.other);
  }
}

$J.define(DefaultNumberRule, 'net.sf.freecol.common.i18n.DefaultNumberRule', { kind: 'class', sup: 'net.sf.freecol.common.i18n.Number', ctors: { '': '_DefaultNumberRule' }, meths: { 'addRule(net.sf.freecol.common.i18n.Number$Category,java.lang.String)': 'addRule$Category$String', 'addRule(net.sf.freecol.common.i18n.Number$Category,net.sf.freecol.common.i18n.Rule)': 'addRule$Category$Rule' } });
$J.module(() => {
  Number$Category = $J.load('net.sf.freecol.common.i18n.Number$Category');
  Rule = $J.load('net.sf.freecol.common.i18n.Rule');
  CollectionUtils = $J.load('net.sf.freecol.common.util.CollectionUtils');
});
