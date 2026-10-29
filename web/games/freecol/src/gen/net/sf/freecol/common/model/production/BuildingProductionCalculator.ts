// @ts-nocheck
// FreeCol 1.2.0 src/net/sf/freecol/common/model/production/BuildingProductionCalculator.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
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
import { $J, ArrayList, Collectors, HashMap, JObject, Objects } from '../../../../../../../jre/index.ts';

let Ability, AbstractGoods, FeatureContainer, Modifier, ProductionInfo, ProductionType, ProductionUtils, GameOptions, CollectionUtils;

/**
 * Calculates the production for a building of a given type.
 */
export class BuildingProductionCalculator extends JObject {
  static readonly EPSILON: number = 1E-4;
  owner: Player = null;
  colonyFeatureContainer: FeatureContainer = null;
  colonyProductionBonus: number = 0;
  /**
   * Creates a calculator for the given owner and colony data.
   *
   * @param owner The {@code Player} owning the building.
   * @param colonyFeatureContainer The {@code FeatureContainer} for the colony where the
   *      building is located. This is used for applying bonus to the production.
   * @param colonyProductionBonus The production bonus for the colony where the building
   *      is located.
   */
  _BuildingProductionCalculator(owner: Player, colonyFeatureContainer: FeatureContainer, colonyProductionBonus: number): this {
    this.owner = owner;
    this.colonyFeatureContainer = colonyFeatureContainer;
    this.colonyProductionBonus = colonyProductionBonus;
    return this;
  }
  /**
   * Gets the production information for a building taking account
   * of the available input and output goods.
   *
   * @param buildingType The type of building.
   * @param turn The current game turn.
   * @param workerAssignments A list of workers assigned to the building.
   * @param inputs The input goods available.
   * @param outputs The output goods already available in the colony,
   *     necessary in order to avoid excess production.
   * @param warehouseCapacity The storage capacity of the settlement
   *     producing the goods.
   * @return The production information.
   * @see ProductionCache#update
   */
  getAdjustedProductionInfo(buildingType: BuildingType, turn: Turn, workerAssignments: List<WorkerAssignment>, inputs: List<AbstractGoods>, outputs: List<AbstractGoods>, warehouseCapacity: number): ProductionInfo {
    let result = new ProductionInfo()._ProductionInfo();
    let buildingOutputs = this.getOutputs(buildingType, workerAssignments);
    if (buildingOutputs.isEmpty()) {
      return result;
    }
    let buildingInputs = this.getInputs(buildingType, workerAssignments);
    let spec = buildingType.getSpecification();
    let avoidOverflow = buildingType.hasAbility$String(Ability.AVOID_EXCESS_PRODUCTION);
    let maximumRatio = 0;
    let minimumRatio = 1.7976931348623157E308;
    if (buildingType.hasAbility$String(Ability.AUTO_PRODUCTION)) {
      for (const $it0 = (CollectionUtils.transform$Stream$Predicate(buildingOutputs.stream(), ($p0) => $p0.isPositive())).iterator(); $it0.hasNext(); ) {
        let output = $it0.next();
        let goodsType = output.getType();
        let available = outputs.stream().filter((gt) => gt.getType().equals(goodsType)).findAny().map(($p0) => $p0.getAmount()).orElse(0);
        if (available >= warehouseCapacity) {
          minimumRatio = maximumRatio = 0;
        } else {
          let divisor = $J.d2i(buildingType.apply$float$Turn$String(0, turn, Modifier.BREEDING_DIVISOR));
          let factor = $J.d2i(buildingType.apply$float$Turn$String(0, turn, Modifier.BREEDING_FACTOR));
          let production = (available < goodsType.getBreedingNumber() || divisor <= 0) ? 0 : Math.imul((($J.idiv(((available - 1) | 0), divisor) + 1) | 0), factor);
          let newRatio = production / output.getAmount();
          minimumRatio = Math.min(minimumRatio, newRatio);
          maximumRatio = Math.max(maximumRatio, newRatio);
        }
      }
    } else {
      for (const $it1 = buildingOutputs.iterator(); $it1.hasNext(); ) {
        let output = $it1.next();
        let goodsType = output.getType();
        let production = Math.fround(this.determineProduction(buildingType, workerAssignments, turn, goodsType));
        let newRatio = Math.fround(production / output.getAmount());
        minimumRatio = Math.min(minimumRatio, newRatio);
        maximumRatio = Math.max(maximumRatio, newRatio);
      }
    }
    for (const $it2 = buildingInputs.iterator(); $it2.hasNext(); ) {
      let input = $it2.next();
      let required = $J.d2l(Math.floor(input.getAmount() * minimumRatio));
      let available = this.getAvailable(input.getType(), inputs);
      if (buildingType.hasAbility$String(Ability.AUTO_PRODUCTION)) {
        available = Math.max(0, available);
      }
      let minimumGoodsInput: number;
      if (available < required && buildingType.hasAbility$String(Ability.EXPERTS_USE_CONNECTIONS) && spec.getBoolean(GameOptions.EXPERTS_HAVE_CONNECTIONS) && ((minimumGoodsInput = Math.imul(buildingType.getExpertConnectionProduction(), CollectionUtils.count$Stream$Predicate(workerAssignments.stream().map(($p0) => $p0.getUnitType()), CollectionUtils.matchKey$Object(this.getExpertUnitType(buildingType))))) > available)) {
        available = minimumGoodsInput;
      }
      if (available < required) {
        minimumRatio *= available / required;
      }
    }
    if (avoidOverflow) {
      for (const $it3 = buildingOutputs.iterator(); $it3.hasNext(); ) {
        let output = $it3.next();
        let production = output.getAmount() * minimumRatio;
        if (production <= 0) {
          continue;
        }
        let headroom = warehouseCapacity - this.getAvailable(output.getType(), outputs);
        if (production > headroom) {
          minimumRatio = Math.min(minimumRatio, headroom / output.getAmount());
        }
        production = output.getAmount() * maximumRatio;
        if (production > headroom) {
          maximumRatio = Math.min(maximumRatio, headroom / output.getAmount());
        }
      }
    }
    for (const $it4 = buildingInputs.iterator(); $it4.hasNext(); ) {
      let input = $it4.next();
      let type$ = input.getType();
      let consumption = $J.d2i(Math.floor(input.getAmount() * minimumRatio + BuildingProductionCalculator.EPSILON));
      let maximumConsumption = $J.d2i(Math.floor(input.getAmount() * maximumRatio));
      result.addConsumption(new AbstractGoods()._AbstractGoods$GoodsType$int(type$, consumption));
      if (consumption < maximumConsumption) {
        result.addMaximumConsumption(new AbstractGoods()._AbstractGoods$GoodsType$int(type$, maximumConsumption));
      }
    }
    for (const $it5 = buildingOutputs.iterator(); $it5.hasNext(); ) {
      let output = $it5.next();
      let type$ = output.getType();
      let production = $J.d2i(Math.floor(output.getAmount() * minimumRatio + BuildingProductionCalculator.EPSILON));
      let maximumProduction = $J.d2i(Math.floor(output.getAmount() * maximumRatio));
      result.addProduction$AbstractGoods(new AbstractGoods()._AbstractGoods$GoodsType$int(type$, production));
      if (production < maximumProduction) {
        result.addMaximumProduction(new AbstractGoods()._AbstractGoods$GoodsType$int(type$, maximumProduction));
      }
    }
    return result;
  }
  /**
   * Gets the unit type that is the expert for this work location
   * using its first output for which an expert type can be found.
   *
   * @return The expert {@code UnitType} or null if none found.
   */
  getExpertUnitType(buildingType: BuildingType): UnitType {
    let spec = buildingType.getSpecification();
    let pt = this.getBestProductionType(buildingType);
    return (pt == null) ? null : CollectionUtils.find$Stream$Predicate(CollectionUtils.map$Stream$Function(pt.getOutputs(), (ag) => spec.getExpertForProducing(ag.getType())), CollectionUtils.isNotNull$());
  }
  getBestProductionType(buildingType: BuildingType): ProductionType {
    return ProductionType.getBestProductionType(null, buildingType.getAvailableProductionTypes$boolean(false));
  }
  getOutputs(buildingType: BuildingType, workerAssignments: List<WorkerAssignment>): List<AbstractGoods> {
    let unattendedOutputs = buildingType.getAvailableProductionTypes$boolean(true).stream().map((pt) => pt.getOutputList()).flatMap(($p0) => $p0.stream()).collect(Collectors.toList());
    let workerOutputs = workerAssignments.stream().map(($p0) => $p0.getProductionType()).filter(($p0) => Objects.nonNull($p0)).map((pt) => pt.getOutputList()).flatMap(($p0) => $p0.stream()).collect(Collectors.toList());
    let allOutputs = new ArrayList(unattendedOutputs);
    allOutputs.addAll(workerOutputs);
    let amounts = new HashMap();
    for (const $it6 = allOutputs.iterator(); $it6.hasNext(); ) {
      let ag = $it6.next();
      if (amounts.get(ag.getType()) == null) {
        amounts.put(ag.getType(), 0);
      }
      amounts.put(ag.getType(), (amounts.get(ag.getType()) + ag.getAmount()) | 0);
    }
    return amounts.entrySet().stream().map((e) => new AbstractGoods()._AbstractGoods$GoodsType$int(e.getKey(), e.getValue())).collect(Collectors.toList());
  }
  getInputs(buildingType: BuildingType, workerAssignments: List<WorkerAssignment>): List<AbstractGoods> {
    let unattendedInputs = buildingType.getAvailableProductionTypes$boolean(true).stream().map((pt) => pt.getInputList()).flatMap(($p0) => $p0.stream()).collect(Collectors.toList());
    let workerInputs = workerAssignments.stream().map(($p0) => $p0.getProductionType()).filter(($p0) => Objects.nonNull($p0)).map((pt) => pt.getInputList()).flatMap(($p0) => $p0.stream()).collect(Collectors.toList());
    let allInputs = new ArrayList(unattendedInputs);
    allInputs.addAll(workerInputs);
    let amounts = new HashMap();
    for (const $it7 = allInputs.iterator(); $it7.hasNext(); ) {
      let ag = $it7.next();
      if (amounts.get(ag.getType()) == null) {
        amounts.put(ag.getType(), 0);
      }
      amounts.put(ag.getType(), (amounts.get(ag.getType()) + ag.getAmount()) | 0);
    }
    return amounts.entrySet().stream().map((e) => new AbstractGoods()._AbstractGoods$GoodsType$int(e.getKey(), e.getValue())).collect(Collectors.toList());
  }
  determineProduction(buildingType: BuildingType, workerAssignments: List<WorkerAssignment>, turn: Turn, goodsType: GoodsType): number {
    let production = Math.fround(CollectionUtils.sum$Collection$ToIntFunction(workerAssignments, (wa) => this.getUnitProduction(turn, buildingType, wa, goodsType)));
    production = Math.fround(production + this.getBaseProduction(buildingType, null, goodsType, null));
    production = FeatureContainer.applyModifiers$float$Turn$Stream(production, turn, this.getProductionModifiers(turn, buildingType, goodsType, null));
    return $J.d2i(Math.floor(production));
  }
  /**
   * Convenience function to extract a goods amount from a list of
   * available goods.
   *
   * @param type The {@code GoodsType} to extract the amount for.
   * @param available The list of available goods to query.
   * @return The goods amount, or zero if none found.
   */
  getAvailable(type$: GoodsType, available: List<AbstractGoods>): number {
    return AbstractGoods.getCount(type$, available);
  }
  /**
   * Gets the productivity of a unit working in this work location,
   * considering *only* the contribution of the unit, exclusive of
   * that of the work location.
   *
   * @param turn The current game turn.
   * @param buildingType The type of building.
   * @param workerAssignment The worker assigned to the building.
   * @param goodsType The {@code GoodsType} to check the production of.
   * @return The maximum return from this unit.
   */
  getUnitProduction(turn: Turn, buildingType: BuildingType, workerAssignment: WorkerAssignment, goodsType: GoodsType): number {
    if (workerAssignment == null || workerAssignment.getProductionType().getOutputs().noneMatch((g) => goodsType.equals(g.getType()))) {
      return 0;
    }
    return Math.max(0, $J.d2i(FeatureContainer.applyModifiers$float$Turn$Stream(Math.fround(this.getBaseProduction(buildingType, workerAssignment.getProductionType(), goodsType, workerAssignment.getUnitType())), turn, this.getProductionModifiers(turn, buildingType, goodsType, workerAssignment.getUnitType()))));
  }
  getBaseProduction(buildingType: BuildingType, productionType: ProductionType, goodsType: GoodsType, unitType: UnitType): number {
    return (buildingType == null) ? 0 : buildingType.getBaseProduction(productionType, goodsType, unitType);
  }
  getProductionModifiers(turn: Turn, buildingType: BuildingType, goodsType: GoodsType, unitType: UnitType): Stream<Modifier> {
    let id = (goodsType == null) ? null : goodsType.getId();
    return (unitType != null) ? CollectionUtils.concat(buildingType.getModifiers$String$FreeColSpecObjectType$Turn(id, unitType, turn), [ProductionUtils.getRebelProductionModifiersForBuilding(buildingType, this.colonyProductionBonus, goodsType, unitType), buildingType.getCompetenceModifiers(id, unitType, turn), (this.owner == null) ? null : this.owner.getModifiers$String$FreeColSpecObjectType$Turn(id, unitType, turn)]) : CollectionUtils.concat(this.colonyFeatureContainer.getModifiers(id, buildingType, turn), [(this.owner == null) ? null : this.owner.getModifiers$String$FreeColSpecObjectType$Turn(id, buildingType, turn)]);
  }
}

$J.define(BuildingProductionCalculator, 'net.sf.freecol.common.model.production.BuildingProductionCalculator', { kind: 'class', sup: 'java.lang.Object', ctors: { 'net.sf.freecol.common.model.Player,net.sf.freecol.common.model.FeatureContainer,int': '_BuildingProductionCalculator' } });
$J.module(() => {
  Ability = $J.load('net.sf.freecol.common.model.Ability');
  AbstractGoods = $J.load('net.sf.freecol.common.model.AbstractGoods');
  FeatureContainer = $J.load('net.sf.freecol.common.model.FeatureContainer');
  Modifier = $J.load('net.sf.freecol.common.model.Modifier');
  ProductionInfo = $J.load('net.sf.freecol.common.model.ProductionInfo');
  ProductionType = $J.load('net.sf.freecol.common.model.ProductionType');
  ProductionUtils = $J.load('net.sf.freecol.common.model.production.ProductionUtils');
  GameOptions = $J.load('net.sf.freecol.common.option.GameOptions');
  CollectionUtils = $J.load('net.sf.freecol.common.util.CollectionUtils');
});
