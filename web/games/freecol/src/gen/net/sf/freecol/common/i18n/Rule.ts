// @ts-nocheck
// FreeCol 1.2.0 src/net/sf/freecol/common/i18n/Rule.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
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
import { $J, ArrayList, JObject, JString, StringBuilder, StringTokenizer } from '../../../../../../jre/index.ts';

let Relation, CollectionUtils, StringUtils;

/**
 * A rule consists of any number of relations combined with "and" and
 * "or" operators. The "and" operator binds more strongly, and there
 * are no grouping features.
 */
export class Rule extends JObject {
  conditions: List<List<Relation>> = null;
  _Rule(input: string): this {
    this.conditions = new ArrayList();
    this.parse(input);
    return this;
  }
  /**
   * Adds a list of relations combined with the "and" operator.
   *
   * @param condition a list of relations combined with the "and" operator
   */
  add(condition: List<Relation>): void {
    this.conditions.add(condition);
  }
  /**
   * Returns true if this rule matches the given number.
   *
   * The outer conditions are or-combined (using anyMatch), the
   * inner conditions are and-combined (using allMatch).
   *
   * @param number The number to test.
   * @return True if the number matches this rule.
   */
  matches(number$: number): boolean {
    return CollectionUtils.any$Collection$Predicate(this.conditions, (andConditions) => CollectionUtils.all$Collection$Predicate(andConditions, (r) => r.matches(number$)));
  }
  /**
   * Parses a string.
   *
   * @param input a {@code String} value
   */
  parse(input: string): void {
    let st = new StringTokenizer(StringUtils.downCase$String(input), ' .');
    let tokens = new ArrayList();
    while (st.hasMoreTokens()) {
      let token = st.nextToken();
      if ($J.equals('or', token)) {
        this.conditions.add(this.parseCondition(tokens));
        tokens.clear();
      } else {
        tokens.add(token);
      }
    }
    this.conditions.add(this.parseCondition(tokens));
  }
  parseCondition(input: List<string>): List<Relation> {
    let tokens = new ArrayList();
    let result = new ArrayList();
    for (const $it0 = input.iterator(); $it0.hasNext(); ) {
      let token = $it0.next();
      if ($J.equals('and', token)) {
        result.add(new Relation()._Relation$List(tokens));
        tokens.clear();
      } else {
        tokens.add(token);
      }
    }
    result.add(new Relation()._Relation$List(tokens));
    return result;
  }
  /**
   * {@inheritDoc}
   */
  toString(): string {
    let andString = ' and ';
    let orString = ' or ';
    let sb = new StringBuilder(32);
    for (const $it1 = this.conditions.iterator(); $it1.hasNext(); ) {
      let andCondition = $it1.next();
      for (const $it2 = andCondition.iterator(); $it2.hasNext(); ) {
        let relation = $it2.next();
        sb.append($J.str(relation)).append(andString);
      }
      sb.setLength((sb.length() - andString.length) | 0);
      sb.insert(0, orString);
    }
    sb.delete(0, orString.length);
    return sb.toString();
  }
}

$J.define(Rule, 'net.sf.freecol.common.i18n.Rule', { kind: 'class', sup: 'java.lang.Object', ctors: { 'java.lang.String': '_Rule' } });
$J.module(() => {
  Relation = $J.load('net.sf.freecol.common.i18n.Relation');
  CollectionUtils = $J.load('net.sf.freecol.common.util.CollectionUtils');
  StringUtils = $J.load('net.sf.freecol.common.util.StringUtils');
});
