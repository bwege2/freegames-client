// @ts-nocheck
// FreeCol 1.2.0 src/net/sf/freecol/common/model/production/TileProductionCalculator.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
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
import { $J, JObject, Stream } from '../../../../../../../jre/index.ts';

let AbstractGoods, FeatureContainer, ProductionInfo, ProductionUtils, CollectionUtils;

/**
 * Calculates the production for a tile.
 */
export class TileProductionCalculator extends JObject {
  owner: Player = null;
  colonyProductionBonus: number = 0;
  /**
   * Creates a calculator for the given owner and colony data.
   *
   * @param owner The {@code Player} owning the building.
   * @param colonyProductionBonus The production bonus for the colony where the building
   *      is located.
   */
  _TileProductionCalculator(owner: Player, colonyProductionBonus: number): this {
    this.owner = owner;
    this.colonyProductionBonus = colonyProductionBonus;
    return this;
  }
  /**
   * Gets the basic production information for the colony tile,
   * ignoring any colony limits (which for now, should be
   * irrelevant).
   *
   * In the original game, the following special rules apply to
   * colony center tiles:
   * - All tile improvements contribute to the production of food
   * - Only natural tile improvements, such as rivers, contribute
   *   to the production of other types of goods.
   * - Artificial tile improvements, such as plowing, are ignored.
   *
   * @param tile The {@code Tile} where the production is happening.
   * @param turn The current game turn.
   * @param workerAssignment If any, the worker assign to this tile.
   * @param colonyCenterTile If true, then the tile will autoproduce.
   * @return The raw production of this colony tile.
   * @see ProductionCache#update
   */
  getBasicProductionInfo(tile: Tile, turn: Turn, workerAssignment: WorkerAssignment, colonyCenterTile: boolean): ProductionInfo {
    let pi = new ProductionInfo()._ProductionInfo();
    if (workerAssignment.getProductionType() == null) {
      return pi;
    }
    if (colonyCenterTile) {
      CollectionUtils.forEach$Stream$Consumer(workerAssignment.getProductionType().getOutputs(), (output) => {
        let n = this.getCenterTileProduction(turn, tile, output.getType());
        if (n > 0) {
          pi.addProduction$AbstractGoods(new AbstractGoods()._AbstractGoods$GoodsType$int(output.getType(), n));
        }
      });
    } else {
      CollectionUtils.forEach$Stream$Consumer(CollectionUtils.map$Stream$Function(workerAssignment.getProductionType().getOutputs(), ($p0) => $p0.getType()), (gt) => {
        let n = this.getUnitProduction(turn, tile, workerAssignment, gt);
        if (n > 0) {
          pi.addProduction$AbstractGoods(new AbstractGoods()._AbstractGoods$GoodsType$int(gt, n));
        }
      });
    }
    return pi;
  }
  /**
   * Gets the productivity of a unit working in this work location,
   * considering *only* the contribution of the unit, exclusive of
   * that of the work location.
   *
   * Used below, only public for the test suite.
   *
   * @param turn The current game turn.
   * @param tile The tile where the production is happening.
   * @param workerAssignment If any, the worker assigned to the {@code Tile}.
   * @param goodsType The {@code GoodsType} to check the production of.
   * @return The maximum return from this unit.
   */
  getUnitProduction(turn: Turn, tile: Tile, workerAssignment: WorkerAssignment, goodsType: GoodsType): number {
    if (workerAssignment == null || workerAssignment.getProductionType().getOutputs().noneMatch((g) => goodsType.equals(g.getType())) || workerAssignment.getUnitType() == null) {
      return 0;
    }
    return Math.max(0, $J.d2i(FeatureContainer.applyModifiers$float$Turn$Stream(Math.fround(this.getBaseProduction(tile, workerAssignment.getProductionType(), goodsType, workerAssignment.getUnitType())), turn, this.getProductionModifiers(turn, tile, goodsType, workerAssignment.getUnitType()))));
  }
  getCenterTileProduction(turn: Turn, tile: Tile, goodsType: GoodsType): number {
    let production = tile.getBaseProduction(null, goodsType, null);
    return Math.max(0, $J.d2i(FeatureContainer.applyModifiers$float$Turn$Stream(Math.fround(production), turn, this.getCenterTileProductionModifiers(turn, tile, goodsType))));
  }
  /**
   * Get the base production exclusive of any bonuses.
   *
   * @param tile The tile where the production is happening.
   * @param productionType An optional {@code ProductionType} to use,
   *     if null the best available one is used.
   * @param goodsType The {@code GoodsType} to produce.
   * @param unitType An optional {@code UnitType} to use.
   * @return The base production due to tile type and resources.
   */
  getBaseProduction(tile: Tile, productionType: ProductionType, goodsType: GoodsType, unitType: UnitType): number {
    if (tile == null || goodsType == null || !goodsType.isFarmed()) {
      return 0;
    }
    let amount = tile.getBaseProduction(productionType, goodsType, unitType);
    return (amount < 0) ? 0 : amount;
  }
  /**
   * Gets the production modifiers for the given type of goods and
   * unit type.
   *
   * @param goodsType The {@code GoodsType} to produce.
   * @param unitType The optional {@code UnitType} to produce them.
   * @return A stream of the applicable modifiers.
   */
  getProductionModifiers(turn: Turn, tile: Tile, goodsType: GoodsType, unitType: UnitType): Stream<Modifier> {
    if (unitType == null || !tile.canProduce(goodsType, unitType)) {
      return Stream.empty();
    }
    return CollectionUtils.concat(tile.getProductionModifiers(goodsType, unitType), [unitType.getModifiers$String$FreeColSpecObjectType$Turn(goodsType.getId(), tile.getType(), turn), ((this.owner == null) ? null : this.owner.getModifiers$String$FreeColSpecObjectType$Turn(goodsType.getId(), unitType, turn)), ProductionUtils.getRebelProductionModifiersForTile(tile, this.colonyProductionBonus, goodsType, unitType)]);
  }
  /**
   * Gets the production modifiers for the given type of goods on
   * the colony center tile.
   *
   * @param goodsType The {@code GoodsType} to produce.
   * @param unitType The optional {@code UnitType} to produce them.
   * @return A stream of the applicable modifiers.
   */
  getCenterTileProductionModifiers(turn: Turn, tile: Tile, goodsType: GoodsType): Stream<Modifier> {
    if (!tile.canProduce(goodsType, null)) {
      return Stream.empty();
    }
    return CollectionUtils.concat(tile.getProductionModifiers(goodsType, null), [ProductionUtils.getRebelProductionModifiersForTile(tile, this.colonyProductionBonus, goodsType, null)]);
  }
}

$J.define(TileProductionCalculator, 'net.sf.freecol.common.model.production.TileProductionCalculator', { kind: 'class', sup: 'java.lang.Object', ctors: { 'net.sf.freecol.common.model.Player,int': '_TileProductionCalculator' } });
$J.module(() => {
  AbstractGoods = $J.load('net.sf.freecol.common.model.AbstractGoods');
  FeatureContainer = $J.load('net.sf.freecol.common.model.FeatureContainer');
  ProductionInfo = $J.load('net.sf.freecol.common.model.ProductionInfo');
  ProductionUtils = $J.load('net.sf.freecol.common.model.production.ProductionUtils');
  CollectionUtils = $J.load('net.sf.freecol.common.util.CollectionUtils');
});
