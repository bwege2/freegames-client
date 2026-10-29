// @ts-nocheck
// FreeCol 1.2.0 src/net/sf/freecol/common/model/BaseProduction.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
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

let ProductionType;

/**
 * The BaseProduction interface eliminates duplicate code in
 *      {@link BuildingType} and {@link TileType} as the
 *      {@link #getBaseProduction(ProductionType, GoodsType, UnitType)}
 *      method originally was identical methods in seperate classes
 */
export class BaseProduction {
  /**
   * Get the base production of a given goods type for an optional
   * unit type.
   *
   * @param productionType An optional {@code ProductionType} to use,
   *     if null the best available one is used.
   * @param goodsType The {@code GoodsType} to produce.
   * @param unitType An optional {@code UnitType} that is to do
   *     the work, if null the unattended production is considered.
   * @return The amount of goods produced.
   */
  getBaseProduction(productionType: ProductionType, goodsType: GoodsType, unitType: UnitType): number {
    if (goodsType == null) {
      return 0;
    }
    if (productionType == null) {
      productionType = ProductionType.getBestProductionType(goodsType, this.getAvailableProductionTypes$boolean(unitType == null));
    }
    if (productionType == null) {
      return 0;
    }
    let best = productionType.getOutput(goodsType);
    return (best == null) ? 0 : best.getAmount();
  }
}

$J.define(BaseProduction, 'net.sf.freecol.common.model.BaseProduction', { kind: 'interface', meths: { 'getAvailableProductionTypes(boolean)': 'getAvailableProductionTypes$boolean' } });
$J.module(() => {
  ProductionType = $J.load('net.sf.freecol.common.model.ProductionType');
});
