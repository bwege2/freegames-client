// @ts-nocheck
// FreeCol 1.2.0 src/net/sf/freecol/common/model/production/ProductionUtils.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
import { $J, JObject, Stream } from '../../../../../../../jre/index.ts';

let FeatureContainer, Modifier, Modifier$ModifierType, Specification;

export class ProductionUtils extends JObject {
  _ProductionUtils(): this {
    return this;
  }
  /**
   * Gets the current production {@code Modifier}, which is
   * generated from the current production bonus.
   *
   * @param buildingType A {@code BuildingType} for getting a rebel factor. Use {@code null}
   *      for a tile.
   * @param colonyProductionBonus The production bonus in the colony.
   * @param goodsType The {@code GoodsType} to produce.
   * @param unitType The unit that is working in the building
   * @return A stream of suitable {@code Modifier}s.
   */
  static getRebelProductionModifiersForBuilding(buildingType: BuildingType, colonyProductionBonus: number, goodsType: GoodsType, unitType: UnitType): Stream<Modifier> {
    if (colonyProductionBonus === 0) {
      return Stream.empty();
    }
    let rebelFactor = (buildingType != null) ? buildingType.getRebelFactor() : 1;
    let bonus = $J.d2i(Math.floor(Math.fround(colonyProductionBonus * rebelFactor)));
    return ProductionUtils.createRebelProductionModifierStream(Modifier.COLONY_PRODUCTION_INDEX, goodsType, bonus);
  }
  /**
   * Gets the current production {@code Modifier}, which is
   * generated from the current production bonus.
   *
   * @param colonyProductionBonus The production bonus in the colony.
   * @param goodsType The {@code GoodsType} to produce.
   * @param unitType The unit that is working on the tile.
   * @return A stream of suitable {@code Modifier}s.
   */
  static getRebelProductionModifiersForTile(tile: Tile, colonyProductionBonus: number, goodsType: GoodsType, unitType: UnitType): Stream<Modifier> {
    if (colonyProductionBonus === 0) {
      return Stream.empty();
    }
    if (unitType == null && colonyProductionBonus < 0) {
      return Stream.empty();
    }
    if (unitType == null) {
      return ProductionUtils.createRebelProductionModifierStream(Modifier.COLONYTILE_PRODUCTION_INDEX, goodsType, colonyProductionBonus);
    }
    let rebelFactor = 1;
    if (unitType != null && unitType.getExpertProduction() != null && unitType.getExpertProduction().equals(goodsType)) {
      rebelFactor = Math.fround(rebelFactor * 2);
    }
    if (tile.getResource() != null) {
      let multiplicativeResourceModifiers = tile.getResource().getProductionModifiers(goodsType, unitType).filter((m) => m.getType() === Modifier$ModifierType.MULTIPLICATIVE);
      rebelFactor = FeatureContainer.applyModifiers$float$Turn$Stream(rebelFactor, tile.getGame().getTurn(), multiplicativeResourceModifiers);
    }
    let bonus = $J.d2i(Math.max(colonyProductionBonus, Math.floor(Math.fround(colonyProductionBonus * rebelFactor))));
    return ProductionUtils.createRebelProductionModifierStream(Modifier.COLONYTILE_PRODUCTION_INDEX, goodsType, bonus);
  }
  static createRebelProductionModifierStream(modifierIndex: number, goodsType: GoodsType, bonus: number): Stream<Modifier> {
    let mod = new Modifier()._Modifier$String$float$ModifierType$FreeColObject(goodsType.getId(), Math.fround(bonus), Modifier$ModifierType.ADDITIVE, Specification.SOL_MODIFIER_SOURCE);
    mod.setModifierIndex(modifierIndex);
    return Stream.of(mod);
  }
}

$J.define(ProductionUtils, 'net.sf.freecol.common.model.production.ProductionUtils', { kind: 'class', sup: 'java.lang.Object', ctors: { '': '_ProductionUtils' } });
$J.module(() => {
  FeatureContainer = $J.load('net.sf.freecol.common.model.FeatureContainer');
  Modifier = $J.load('net.sf.freecol.common.model.Modifier');
  Modifier$ModifierType = $J.load('net.sf.freecol.common.model.Modifier$ModifierType');
  Specification = $J.load('net.sf.freecol.common.model.Specification');
});
