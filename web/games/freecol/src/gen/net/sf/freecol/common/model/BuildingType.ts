// @ts-nocheck
// FreeCol 1.2.0 src/net/sf/freecol/common/model/BuildingType.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
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
import { $J, ArrayList, Collectors, List } from '../../../../../../jre/index.ts';
import { BuildableType } from './BuildableType.ts';

let Ability, AbstractGoods, Colony$NoBuildReason, Constants, Consumer, FeatureContainer, FreeColSpecObjectType, Modifier, Modifier$ModifierType, ProductionType, Turn, UnitLocation$NoAddReason, BuildingProductionCalculator, WorkerAssignment, CollectionUtils;

/**
 * Encapsulates data common to all instances of a particular kind of
 * {@link Building}, such as the number of workplaces, and the types
 * of goods it produces and consumes.
 */
export class BuildingType extends BuildableType {
  static readonly TAG: string = 'building-type';
  /**
   * The level of building.
   */
  level: number = 0;
  /**
   * The number of work places a unit can work in buildings of this type.
   */
  workPlaces: number = 0;
  /**
   * The minimum unit skill to work in buildings of this type.
   */
  minSkill: number = 0;
  /**
   * The maximum unit skill to work in buildings of this type.
   */
  maxSkill: number = 0;
  /**
   * Upkeep per turn for buildings ot this type.
   */
  upkeep: number = 0;
  /**
   * Consumption order.
   */
  priority: number = 0;
  /**
   * Maximum production from the "experts have connections" option.
   */
  expertConnectionProduction: number = 0;
  /**
   * A multiplier for any unit goods-specific bonus for this building type.
   */
  competenceFactor: number = 0;
  /**
   * The multiplier for the colony rebel bonus for this building type.
   */
  rebelFactor: number = 0;
  /**
   * The building type this upgrades from.
   */
  upgradesFrom: BuildingType = null;
  /**
   * The building type this upgrades to.
   */
  upgradesTo: BuildingType = null;
  /**
   * The possible production types of this building type.
   */
  productionTypes: List<ProductionType> = null;
  static readonly COMPETENCE_FACTOR_TAG: string = 'competence-factor';
  static readonly EXPERTS_WITH_CONNECTION_PRODUCTION_TAG: string = 'experts-with-connections-production';
  static readonly MAXIMUM_SKILL_TAG: string = 'maximum-skill';
  static readonly MINIMUM_SKILL_TAG: string = 'minimum-skill';
  static readonly PRIORITY_TAG: string = 'priority';
  static readonly PRODUCTION_TAG: string = 'production';
  static readonly REBEL_FACTOR_TAG: string = 'rebel-factor';
  static readonly UPGRADES_FROM_TAG: string = 'upgrades-from';
  static readonly UPKEEP_TAG: string = 'upkeep';
  static readonly WORKPLACES_TAG: string = 'workplaces';
  static readonly OLD_MAX_SKILL_TAG: string = 'maxSkill';
  static readonly OLD_MIN_SKILL_TAG: string = 'minSkill';
  static readonly OLD_UPGRADES_FROM_TAG: string = 'upgradesFrom';
  /**
   * Creates a new {@code BuildingType} instance.
   *
   * @param id The object identifier.
   * @param specification The {@code Specification} to refer to.
   */
  _BuildingType(id: string, specification: Specification): this {
    this._BuildableType(id, specification);
    this.level = 1;
    this.workPlaces = 3;
    this.minSkill = Constants.UNDEFINED;
    this.maxSkill = Constants.INFINITY;
    this.upkeep = 0;
    this.priority = Consumer.BUILDING_PRIORITY;
    this.expertConnectionProduction = 0;
    this.competenceFactor = 1;
    this.rebelFactor = 1;
    this.upgradesFrom = null;
    this.upgradesTo = null;
    this.productionTypes = new ArrayList();
    return this;
  }
  /**
   * Get the level of this BuildingType.
   *
   * @return The building level.
   */
  getLevel(): number {
    return this.level;
  }
  /**
   * Gets the number of workplaces, that is the maximum number of
   * Units that can work in this BuildingType.
   *
   * @return The number of work places.
   */
  getWorkPlaces(): number {
    return this.workPlaces;
  }
  getMinimumSkill(): number {
    return this.minSkill;
  }
  getMaximumSkill(): number {
    return this.maxSkill;
  }
  /**
   * Gets the amount of gold necessary to maintain a Building of
   * this type for one turn.
   *
   * @return The per turn upkeep for this building type.
   */
  getUpkeep(): number {
    return this.upkeep;
  }
  /**
   * Get the maximum production for the Experts-With-Connections option.
   *
   * @return The production amount.
   */
  getExpertConnectionProduction(): number {
    return this.expertConnectionProduction;
  }
  /**
   * Get a work location specific factor to multiply any unit goods specific
   * bonuses by.
   *
   * @return The competence factor.
   */
  getCompetenceFactor(): number {
    return this.competenceFactor;
  }
  /**
   * Get a work location specific factor to multiply the colony
   * rebel bonus by.
   *
   * @return The rebel factor.
   */
  getRebelFactor(): number {
    return this.rebelFactor;
  }
  /**
   * The consumption priority of a Building of this type. The higher
   * the priority, the earlier will the Consumer be allowed to
   * consume the goods it requires.
   *
   * @return The consumption priority.
   */
  getPriority(): number {
    return this.priority;
  }
  /**
   * Gets the reason why a given unit type can not be added to a
   * building of this type.
   *
   * @param unitType The {@code UnitType} to test.
   * @return The reason why adding would fail.
   */
  getNoAddReason(unitType: UnitType): UnitLocation$NoAddReason {
    return (this.workPlaces === 0) ? UnitLocation$NoAddReason.CAPACITY_EXCEEDED : (!unitType.hasSkill()) ? UnitLocation$NoAddReason.MISSING_SKILL : (unitType.getSkill() < this.minSkill) ? UnitLocation$NoAddReason.MINIMUM_SKILL : (unitType.getSkill() > this.maxSkill) ? UnitLocation$NoAddReason.MAXIMUM_SKILL : UnitLocation$NoAddReason.NONE;
  }
  /**
   * Can a unit of a given type be added to a Building of this type?
   *
   * @param unitType The {@code UnitType} to check.
   * @return True if the unit type can be added.
   */
  canAdd(unitType: UnitType): boolean {
    return this.getNoAddReason(unitType) === UnitLocation$NoAddReason.NONE;
  }
  /**
   * Gets the type of the building type, which is trivially just this
   * object.
   *
   * @return This.
   */
  getType(): FreeColSpecObjectType {
    return this;
  }
  /**
   * Gets the BuildingType this BuildingType upgrades from.
   *
   * @return The {@code BuildingType} that upgrades to this one.
   */
  getUpgradesFrom(): BuildingType {
    return this.upgradesFrom;
  }
  /**
   * Get the BuildingType this BuildingType upgrades to.
   *
   * @return The {@code BuildingType} to upgrade to from this one.
   */
  getUpgradesTo(): BuildingType {
    return this.upgradesTo;
  }
  /**
   * Gets the first level of this BuildingType.
   *
   * @return The base {@code BuildingType}.
   */
  getFirstLevel(): BuildingType {
    let buildingType = this;
    while (buildingType.getUpgradesFrom() != null) {
      buildingType = buildingType.getUpgradesFrom();
    }
    return buildingType;
  }
  /**
   * Is this building type automatically built in any colony?
   *
   * @return True if this building type is automatically built.
   */
  isAutomaticBuild(): boolean {
    return !this.needsGoodsToBuild() && this.getUpgradesFrom() == null;
  }
  /**
   * Get the production type list.
   *
   * @return The {@code ProductionType} list.
   */
  getProductionTypes(): List<ProductionType> {
    return this.productionTypes;
  }
  /**
   * Set the production type list.
   *
   * @param productionTypes The new {@code ProductionType} list.
   */
  setProductionTypes(productionTypes: List<ProductionType>): void {
    this.productionTypes.clear();
    this.productionTypes.addAll(productionTypes);
  }
  /**
   * Add a production type to this building type.
   *
   * @param productionType The {@code ProductionType} to add.
   */
  addProductionType(productionType: ProductionType): void {
    if (productionType != null) {
      this.productionTypes.add(productionType);
    }
  }
  /**
   * Get the production types provided by this building type at the
   * current difficulty level.
   *
   * @param unattended Whether the production is unattended.
   * @return A list of {@code ProductionType}s.
   */
  getAvailableProductionTypes$boolean(unattended: boolean): List<ProductionType> {
    return this.getAvailableProductionTypes$boolean$String(unattended, null);
  }
  /**
   * Gets the production types available at the current difficulty
   * level.
   *
   * FIXME: TileType.getAvailableProductionTypes(boolean) uses the
   * GameOptions.TILE_PRODUCTION option.  Should we implement a
   * corresponding one for BuildingTypes?
   *
   * @param unattended Whether the production is unattended.
   * @param level The production level (NYI).
   * @return A list of {@code ProductionType}s.
   */
  getAvailableProductionTypes$boolean$String(unattended: boolean, level: string): List<ProductionType> {
    return CollectionUtils.transform$Collection$Predicate(this.productionTypes, (pt) => pt.getUnattended() === unattended && pt.appliesTo(level));
  }
  /**
   * Gets the type of goods produced by this BuildingType.
   *
   * @return The produced {@code GoodsType}.
   */
  getProducedGoodsType(): GoodsType {
    if (this.productionTypes.isEmpty()) {
      return null;
    }
    let ag = CollectionUtils.first$Stream(CollectionUtils.first$Collection(this.productionTypes).getOutputs());
    return (ag == null) ? null : ag.getType();
  }
  /**
   * Is this a defence-related building type?  Such buildings
   * (stockade et al) are visible to other players.
   *
   * @return True if this is a defence related building.
   */
  isDefenceType(): boolean {
    return this.containsModifierKey(Modifier.DEFENCE);
  }
  /**
   * Can a tile of this type produce a given goods type?
   *
   * @param goodsType The {@code GoodsType} to produce.
   * @param unitType An optional {@code UnitType} that is to do
   *     the work, if null the unattended production is considered.
   * @return True if this tile type produces the goods.
   */
  canProduce(goodsType: GoodsType, unitType: UnitType): boolean {
    return goodsType != null && ProductionType.canProduce(goodsType, this.getAvailableProductionTypes$boolean(unitType == null));
  }
  /**
   * Get the amount of goods of a given goods type the given unit
   * type could produce on a tile of this tile type.
   *
   * No production bonuses, like rebel colony bonus, is added.
   * Sufficient input goods are assumed.
   *
   * @param goodsType The {@code GoodsType} to produce.
   * @param unitType An optional {@code UnitType} that is to do
   *     the work, if null the unattended production is considered.
   * @return The amount of goods produced.
   */
  getPotentialProduction(goodsType: GoodsType, unitType: UnitType): number {
    let bpc = new BuildingProductionCalculator()._BuildingProductionCalculator(null, new FeatureContainer()._FeatureContainer(), 0);
    let productionType = ProductionType.getBestProductionType(goodsType, this.getAvailableProductionTypes$boolean(unitType == null));
    let MORE_THAN_ENOUGH_INPUT_GOODS = 1000;
    let MORE_THAN_ENOUGH_WAREHOUSE_CAPACITY = 10000;
    let inputGoods = productionType.getInputList().stream().map((ag) => new AbstractGoods()._AbstractGoods$GoodsType$int(ag.getType(), MORE_THAN_ENOUGH_INPUT_GOODS)).collect(Collectors.toList());
    let turn = (this.getGame() != null && this.getGame().getTurn() != null) ? this.getGame().getTurn() : new Turn()._Turn(1);
    let pi = bpc.getAdjustedProductionInfo(this, turn, List.of(new WorkerAssignment()._WorkerAssignment(unitType, productionType)), inputGoods, List.of(), MORE_THAN_ENOUGH_WAREHOUSE_CAPACITY);
    return pi.getProduction().stream().filter((a) => a.getType().equals(goodsType)).map(($p0) => $p0.getAmount()).findFirst().orElse(0);
  }
  /**
   * {@inheritDoc}
   */
  canBeBuiltInColony(colony: Colony, assumeBuilt: List<BuildableType>): Colony$NoBuildReason {
    let colonyBuilding = colony.getBuilding(this);
    if (colonyBuilding == null) {
      let from = this.getUpgradesFrom();
      if (from != null && !assumeBuilt.contains(from)) {
        return Colony$NoBuildReason.WRONG_UPGRADE;
      }
    } else {
      let from = colonyBuilding.getType().getUpgradesTo();
      if (from !== this && !assumeBuilt.contains(from)) {
        return Colony$NoBuildReason.WRONG_UPGRADE;
      }
    }
    return Colony$NoBuildReason.NONE;
  }
  getMinimumIndex(colony: Colony, buildQueueList: JList<BuildableType>, UNABLE_TO_BUILD: number): number {
    let buildQueue = buildQueueList.getModel();
    let upgradesFrom = this.getUpgradesFrom();
    if (upgradesFrom == null) {
      return 0;
    }
    let building = colony.getBuilding(this);
    let buildingType = (building == null) ? null : building.getType();
    if (buildingType === upgradesFrom) {
      return 0;
    }
    for (let index = 0; index < buildQueue.getSize(); index++) {
      if (upgradesFrom.equals(buildQueue.getElementAt(index))) {
        return (index + 1) | 0;
      }
    }
    return UNABLE_TO_BUILD;
  }
  getMaximumIndex(colony: Colony, buildQueueList: JList<BuildableType>, UNABLE_TO_BUILD: number): number {
    let buildQueue = buildQueueList.getModel();
    let buildQueueLastPos = buildQueue.getSize();
    let canBuild = false;
    if (colony.canBuild$BuildableType(this)) {
      canBuild = true;
    }
    let upgradesFrom = this.getUpgradesFrom();
    let upgradesTo = this.getUpgradesTo();
    if (!canBuild && upgradesFrom == null) {
      return UNABLE_TO_BUILD;
    }
    if (canBuild && upgradesTo == null) {
      return buildQueueLastPos;
    }
    let foundUpgradesFrom = canBuild;
    for (let index = 0; index < buildQueue.getSize(); index++) {
      let toBuild = buildQueue.getElementAt(index);
      if (toBuild === this) {
        continue;
      }
      if (!canBuild && !foundUpgradesFrom && upgradesFrom.equals(toBuild)) {
        foundUpgradesFrom = true;
        if (upgradesTo == null) {
          return buildQueueLastPos;
        }
      }
      if (foundUpgradesFrom && upgradesTo != null && upgradesTo.equals(toBuild)) {
        return index;
      }
      if (this.hasAbility$String$FreeColSpecObjectType(Ability.BUILD, toBuild)) {
        return index;
      }
    }
    return buildQueueLastPos;
  }
  /**
   * Gets the production modifiers for the given type of goods and
   * unit type.
   *
   * We use UnitType.getModifiers but modify this according to the
   * competence factor of this building type.  Note that we do not modify
   * *multiplicative* modifiers, as this would capture the master blacksmith
   * doubling.
   *
   * @param id The String identifier
   * @param turn The turn number of type {@link Turn}
   * @param unitType The optional {@code UnitType} to produce them.
   * @return A stream of the applicable modifiers.
   */
  getCompetenceModifiers(id: string, unitType: UnitType, turn: Turn): Stream<Modifier> {
    let competence = this.getCompetenceFactor();
    return (competence === 1) ? unitType.getModifiers$String$FreeColSpecObjectType$Turn(id, this.getType(), turn) : CollectionUtils.map$Stream$Function(unitType.getModifiers$String$FreeColSpecObjectType$Turn(id, this.getType(), turn), (m) => {
      return (m.getType() === Modifier$ModifierType.ADDITIVE) ? Modifier.makeModifier(m).setValue(Math.fround(m.getValue$() * competence)) : m;
    });
  }
  /**
   * {@inheritDoc}
   */
  compareTo(other: FreeColObject): number {
    let cmp = 0;
    if (other instanceof BuildingType) {
      let bt = other;
      cmp = (this.getIndex() - bt.getIndex()) | 0;
    }
    if (cmp === 0) {
      cmp = super.compareTo(other);
    }
    return cmp;
  }
  /**
   * {@inheritDoc}
   */
  copyIn<T>(other: T): boolean {
    let o = this.copyInCast(other, $J.cls(BuildingType));
    if (o == null || !super.copyIn(o)) {
      return false;
    }
    this.level = o.getLevel();
    this.workPlaces = o.getWorkPlaces();
    this.minSkill = o.getMinimumSkill();
    this.maxSkill = o.getMaximumSkill();
    this.upkeep = o.getUpkeep();
    this.priority = o.getPriority();
    this.expertConnectionProduction = o.getExpertConnectionProduction();
    this.competenceFactor = o.getCompetenceFactor();
    this.rebelFactor = o.getRebelFactor();
    this.upgradesFrom = o.getUpgradesFrom();
    this.upgradesTo = o.getUpgradesTo();
    this.setProductionTypes(o.getProductionTypes());
    return true;
  }
  /**
   * {@inheritDoc}
   */
  writeAttributes(xw: FreeColXMLWriter): void {
    super.writeAttributes(xw);
    if (this.upgradesFrom != null) {
      xw.writeAttribute$String$FreeColObject(BuildingType.UPGRADES_FROM_TAG, this.upgradesFrom);
    }
    xw.writeAttribute$String$int(BuildingType.WORKPLACES_TAG, this.workPlaces);
    if (this.minSkill !== Constants.UNDEFINED) {
      xw.writeAttribute$String$int(BuildingType.MINIMUM_SKILL_TAG, this.minSkill);
    }
    if (this.maxSkill < Constants.INFINITY) {
      xw.writeAttribute$String$int(BuildingType.MAXIMUM_SKILL_TAG, this.maxSkill);
    }
    if (this.upkeep > 0) {
      xw.writeAttribute$String$int(BuildingType.UPKEEP_TAG, this.upkeep);
    }
    if (this.priority !== Consumer.BUILDING_PRIORITY) {
      xw.writeAttribute$String$int(BuildingType.PRIORITY_TAG, this.priority);
    }
    xw.writeAttribute$String$int(BuildingType.EXPERTS_WITH_CONNECTION_PRODUCTION_TAG, this.expertConnectionProduction);
    xw.writeAttribute$String$float(BuildingType.COMPETENCE_FACTOR_TAG, this.competenceFactor);
    xw.writeAttribute$String$float(BuildingType.REBEL_FACTOR_TAG, this.rebelFactor);
  }
  /**
   * {@inheritDoc}
   */
  writeChildren(xw: FreeColXMLWriter): void {
    super.writeChildren(xw);
    for (const $it0 = this.productionTypes.iterator(); $it0.hasNext(); ) {
      let productionType = $it0.next();
      productionType.toXML$FreeColXMLWriter(xw);
    }
  }
  /**
   * {@inheritDoc}
   */
  readAttributes(xr: FreeColXMLReader): void {
    super.readAttributes(xr);
    let spec = this.getSpecification();
    let parent = xr.getAlreadyInitializedType(spec, FreeColSpecObjectType.EXTENDS_TAG, $J.cls(BuildingType), this);
    if (xr.hasAttribute(BuildingType.OLD_UPGRADES_FROM_TAG)) {
      this.upgradesFrom = xr.getType(spec, BuildingType.OLD_UPGRADES_FROM_TAG, $J.cls(BuildingType), null);
    } else {
      this.upgradesFrom = xr.getType(spec, BuildingType.UPGRADES_FROM_TAG, $J.cls(BuildingType), null);
    }
    if (this.upgradesFrom == null) {
      this.level = 1;
    } else {
      this.upgradesFrom.upgradesTo = this;
      this.level = (this.upgradesFrom.level + 1) | 0;
    }
    this.workPlaces = xr.getAttribute$String$int(BuildingType.WORKPLACES_TAG, parent.workPlaces);
    if (xr.hasAttribute(BuildingType.OLD_MIN_SKILL_TAG)) {
      this.minSkill = xr.getAttribute$String$int(BuildingType.OLD_MIN_SKILL_TAG, parent.minSkill);
    } else {
      this.minSkill = xr.getAttribute$String$int(BuildingType.MINIMUM_SKILL_TAG, parent.minSkill);
    }
    if (xr.hasAttribute(BuildingType.OLD_MAX_SKILL_TAG)) {
      this.maxSkill = xr.getAttribute$String$int(BuildingType.OLD_MAX_SKILL_TAG, parent.maxSkill);
    } else {
      this.maxSkill = xr.getAttribute$String$int(BuildingType.MAXIMUM_SKILL_TAG, parent.maxSkill);
    }
    this.upkeep = xr.getAttribute$String$int(BuildingType.UPKEEP_TAG, parent.upkeep);
    this.priority = xr.getAttribute$String$int(BuildingType.PRIORITY_TAG, parent.priority);
    this.expertConnectionProduction = xr.getAttribute$String$int(BuildingType.EXPERTS_WITH_CONNECTION_PRODUCTION_TAG, parent.expertConnectionProduction);
    this.competenceFactor = xr.getAttribute$String$float(BuildingType.COMPETENCE_FACTOR_TAG, parent.competenceFactor);
    this.rebelFactor = xr.getAttribute$String$float(BuildingType.REBEL_FACTOR_TAG, parent.rebelFactor);
    if (parent !== this) {
      if (!xr.hasAttribute(BuildableType.REQUIRED_POPULATION_TAG)) {
        this.setRequiredPopulation(parent.getRequiredPopulation());
      }
      this.addFeatures(parent);
      if (parent.isAbstractType()) {
        this.getFeatureContainer().replaceSource(parent, this);
      }
    }
  }
  /**
   * {@inheritDoc}
   */
  readChild(xr: FreeColXMLReader): void {
    let spec = this.getSpecification();
    let tag = xr.getLocalName();
    if ($J.equals(BuildingType.PRODUCTION_TAG, tag)) {
      if (xr.getAttribute$String$boolean(FreeColSpecObjectType.DELETE_TAG, false)) {
        this.productionTypes.clear();
        xr.closeTag$String(BuildingType.PRODUCTION_TAG);
      } else {
        this.addProductionType(new ProductionType()._ProductionType$FreeColXMLReader$Specification(xr, spec));
      }
    } else {
      super.readChild(xr);
    }
    if (this.expertConnectionProduction === 0 && this.hasAbility$String(Ability.EXPERTS_USE_CONNECTIONS)) {
      this.expertConnectionProduction = 4;
    }
  }
  /**
   * {@inheritDoc}
   */
  getXMLTagName(): string {
    return BuildingType.TAG;
  }
}

$J.define(BuildingType, 'net.sf.freecol.common.model.BuildingType', { kind: 'class', ifaces: ['net.sf.freecol.common.model.BaseProduction'], sup: 'net.sf.freecol.common.model.BuildableType', ctors: { 'java.lang.String,net.sf.freecol.common.model.Specification': '_BuildingType' }, returns: { 'getXMLTagName': 'java.lang.String', 'isDefenceType': 'boolean', 'getProducedGoodsType': 'net.sf.freecol.common.model.GoodsType', 'getProductionTypes': 'java.util.List', 'isAutomaticBuild': 'boolean', 'getFirstLevel': 'net.sf.freecol.common.model.BuildingType', 'getUpgradesTo': 'net.sf.freecol.common.model.BuildingType', 'getUpgradesFrom': 'net.sf.freecol.common.model.BuildingType', 'getType': 'net.sf.freecol.common.model.FreeColSpecObjectType', 'getPriority': 'int', 'getRebelFactor': 'float', 'getCompetenceFactor': 'float', 'getExpertConnectionProduction': 'int', 'getUpkeep': 'int', 'getMaximumSkill': 'int', 'getMinimumSkill': 'int', 'getWorkPlaces': 'int', 'getLevel': 'int' }, meths: { 'getAvailableProductionTypes(boolean,java.lang.String)': 'getAvailableProductionTypes$boolean$String', 'getAvailableProductionTypes(boolean)': 'getAvailableProductionTypes$boolean' } });
$J.module(() => {
  Ability = $J.load('net.sf.freecol.common.model.Ability');
  AbstractGoods = $J.load('net.sf.freecol.common.model.AbstractGoods');
  Colony$NoBuildReason = $J.load('net.sf.freecol.common.model.Colony$NoBuildReason');
  Constants = $J.load('net.sf.freecol.common.model.Constants');
  Consumer = $J.load('net.sf.freecol.common.model.Consumer');
  FeatureContainer = $J.load('net.sf.freecol.common.model.FeatureContainer');
  FreeColSpecObjectType = $J.load('net.sf.freecol.common.model.FreeColSpecObjectType');
  Modifier = $J.load('net.sf.freecol.common.model.Modifier');
  Modifier$ModifierType = $J.load('net.sf.freecol.common.model.Modifier$ModifierType');
  ProductionType = $J.load('net.sf.freecol.common.model.ProductionType');
  Turn = $J.load('net.sf.freecol.common.model.Turn');
  UnitLocation$NoAddReason = $J.load('net.sf.freecol.common.model.UnitLocation$NoAddReason');
  BuildingProductionCalculator = $J.load('net.sf.freecol.common.model.production.BuildingProductionCalculator');
  WorkerAssignment = $J.load('net.sf.freecol.common.model.production.WorkerAssignment');
  CollectionUtils = $J.load('net.sf.freecol.common.util.CollectionUtils');
});
