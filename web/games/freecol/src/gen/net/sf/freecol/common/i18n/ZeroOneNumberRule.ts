// @ts-nocheck
// FreeCol 1.2.0 src/net/sf/freecol/common/i18n/ZeroOneNumberRule.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
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
 * Number optimized for languages that place the numbers 0 and 1 in
 * category one, and all others in category other.
 */
export class ZeroOneNumberRule extends Number_ {
  _ZeroOneNumberRule(): this {
    this._Number();
    return this;
  }
  getCategory(input: number): Number$Category {
    if (input === 0 || input === 1) {
      return Number$Category.one;
    } else {
      return Number$Category.other;
    }
  }
}

$J.define(ZeroOneNumberRule, 'net.sf.freecol.common.i18n.ZeroOneNumberRule', { kind: 'class', sup: 'net.sf.freecol.common.i18n.Number', ctors: { '': '_ZeroOneNumberRule' } });
$J.module(() => {
  Number$Category = $J.load('net.sf.freecol.common.i18n.Number$Category');
});
