// @ts-nocheck
// FreeCol 1.2.0 src/net/sf/freecol/client/gui/panel/DropTarget.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
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
import { $J } from '../../../../../../../jre/index.ts';

export class DropTarget {
  /**
   * Can the given goods be dropped on this target?
   *
   * @param goods The {@code Goods} to check.
   * @return True if the goods are acceptable.
   */
  accepts$Goods(goods: Goods): boolean {
    return false;
  }
  /**
   * Can the given type of goods be dropped on this target?
   *
   * @param goodsType The {@code GoodsType} to check.
   * @return True if the goods type is acceptable.
   */
  accepts$GoodsType(goodsType: GoodsType): boolean {
    return false;
  }
  /**
   * Can the given unit be dropped on this target?
   *
   * @param unit The {@code Unit} to check.
   * @return True if the unit is acceptable.
   */
  accepts$Unit(unit: Unit): boolean {
    return false;
  }
  /**
   * Get a suggested amount of goods to add, used when partial
   * amounts are selected.
   *
   * @param goodsType The {@code GoodsType} proposed to add.
   * @return A good amount of goods to add.
   */
  suggested(goodsType: GoodsType): number {
    return -1;
  }
}

$J.define(DropTarget, 'net.sf.freecol.client.gui.panel.DropTarget', { kind: 'interface', meths: { 'add(java.awt.Component,boolean)': 'add$Component$boolean', 'accepts(net.sf.freecol.common.model.Unit)': 'accepts$Unit', 'accepts(net.sf.freecol.common.model.GoodsType)': 'accepts$GoodsType', 'accepts(net.sf.freecol.common.model.Goods)': 'accepts$Goods' } });
