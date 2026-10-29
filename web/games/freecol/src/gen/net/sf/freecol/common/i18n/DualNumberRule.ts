// @ts-nocheck
// FreeCol 1.2.0 src/net/sf/freecol/common/i18n/DualNumberRule.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
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
import { $J } from '../../../../../../jre/index.ts';
import { Number_ } from './Number.ts';

let Number$Category;

/**
 * Number optimized for languages that distinguish the categories one,
 * two and other.
 */
export class DualNumberRule extends Number_ {
  _DualNumberRule(): this {
    this._Number();
    return this;
  }
  /**
   * {@inheritDoc}
   */
  getCategory(input: number): Number$Category {
    if (input === 1) {
      return Number$Category.one;
    } else if (input === 2) {
      return Number$Category.two;
    } else {
      return Number$Category.other;
    }
  }
}

$J.define(DualNumberRule, 'net.sf.freecol.common.i18n.DualNumberRule', { kind: 'class', sup: 'net.sf.freecol.common.i18n.Number', ctors: { '': '_DualNumberRule' } });
$J.module(() => {
  Number$Category = $J.load('net.sf.freecol.common.i18n.Number$Category');
});
