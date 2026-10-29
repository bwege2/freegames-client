// @ts-nocheck
// FreeCol 1.2.0 src/net/sf/freecol/common/model/Building.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
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
import { $J, ArrayList, Collections, Collectors, Logger, StringBuilder } from '../../../../../../jre/index.ts';
import { WorkLocation } from './WorkLocation.ts';

let Ability, AbstractGoods, BuildingType, StringTemplate, UnitLocation$NoAddReason, BuildingProductionCalculator, WorkerAssignment, CollectionUtils, StringUtils;

/**
 * Represents a building in a colony.
 */
export class Building extends WorkLocation {
  static logger: Logger = null;
  static readonly EPSILON: number = 1E-4;
  static readonly TAG: string = 'building';
  static readonly UNIT_CHANGE: string = 'UNIT_CHANGE';
  /**
   * The type of building.
   */
  buildingType: BuildingType = null;
  static readonly BUILDING_TYPE_TAG: string = 'buildingType';
  /**
   * Constructor for ServerBuilding.
   *
   * @param game The enclosing {@code Game}.
   * @param colony The {@code Colony} in which this building is located.
   * @param type The {@code BuildingType} of building.
   */
  _Building$Game$Colony$BuildingType(game: Game, colony: Colony, type$: BuildingType): this {
    this._WorkLocation$Game(game);
    this.colony = colony;
    this.buildingType = type$;
    this.updateProductionType();
    return this;
  }
  /**
   * Create a new {@code Building} with the given identifier.
   * The object should later be initialized by calling
   * {@link #readFromXML(FreeColXMLReader)}.
   *
   * @param game The enclosing {@code Game}.
   * @param id The object identifier.
   */
  _Building$Game$String(game: Game, id: string): this {
    this._WorkLocation$Game$String(game, id);
    return this;
  }
  /**
   * Gets the type of this building.
   *
   * @return The building type.
   */
  getType(): BuildingType {
    return this.buildingType;
  }
  /**
   * Changes the type of the Building.  The type of a building may
   * change when it is upgraded or damaged.
   *
   * -til: If this is a defensive building.
   *
   * @see #upgrade
   * @see #downgrade
   * @param newBuildingType The new {@code BuildingType}.
   * @return A list of units present that need to be removed.
   */
  setType(newBuildingType: BuildingType): List<Unit> {
    let colony = this.getColony();
    colony.removeFeatures(this.buildingType);
    let eject = new ArrayList();
    if (newBuildingType != null) {
      this.buildingType = newBuildingType;
      this.updateProductionType();
      colony.addFeatures(this.buildingType);
      eject.addAll(CollectionUtils.transform$Stream$Predicate(this.getUnits(), (u) => !this.canAddType(u.getType())));
    }
    let extra = (this.getUnitCount() - this.getUnitCapacity() - eject.size()) | 0;
    for (const $it0 = this.getUnitList().iterator(); $it0.hasNext(); ) {
      let unit = $it0.next();
      if (extra <= 0) {
        break;
      }
      if (!eject.contains(unit)) {
        eject.add(unit);
        extra = (extra - 1) | 0;
      }
    }
    return eject;
  }
  /**
   * Does this building have a higher level?
   *
   * @return True if this {@code Building} can have a higher level.
   */
  canBuildNext(): boolean {
    return this.getColony().canBuild$BuildableType(this.getType().getUpgradesTo());
  }
  /**
   * Can this building can be damaged?
   *
   * @return True if this building can be damaged.
   */
  canBeDamaged(): boolean {
    return !this.getType().isAutomaticBuild() && !this.getColony().isAutomaticBuild(this.getType());
  }
  /**
   * Downgrade this building.
   *
   * -til: If this is a defensive building.
   *
   * @return A list of units to eject (usually empty) if the
   *     building was downgraded, or null on failure.
   */
  downgrade(): List<Unit> {
    if (!this.canBeDamaged()) {
      return null;
    }
    let ret = this.setType(this.getType().getUpgradesFrom());
    this.getColony().invalidateCache();
    return ret;
  }
  /**
   * Upgrade this building to next level.
   *
   * -til: If this is a defensive building.
   *
   * @return A list of units to eject (usually empty) if the
   *     building was upgraded, or null on failure.
   */
  upgrade(): List<Unit> {
    if (!this.canBuildNext()) {
      return null;
    }
    let ret = this.setType(this.getType().getUpgradesTo());
    this.getColony().invalidateCache();
    return ret;
  }
  /**
   * Can a particular type of unit be added to this building?
   *
   * @param unitType The {@code UnitType} to check.
   * @return True if unit type can be added to this building.
   */
  canAddType(unitType: UnitType): boolean {
    return this.canBeWorked() && this.getType().canAdd(unitType);
  }
  /**
   * Gets the production information for this building taking account
   * of the available input and output goods.
   *
   * @param inputs The input goods available.
   * @param outputs The output goods already available in the colony,
   *     necessary in order to avoid excess production.
   * @return The production information.
   * @see ProductionCache#update
   */
  getAdjustedProductionInfo(inputs: List<AbstractGoods>, outputs: List<AbstractGoods>): ProductionInfo {
    let pc = new BuildingProductionCalculator()._BuildingProductionCalculator(this.getOwner(), this.getColony().getFeatureContainer(), this.getColony().getProductionBonus());
    let workerAssignments = this.getUnits().map((u) => new WorkerAssignment()._WorkerAssignment(u.getType(), this.getProductionType())).collect(Collectors.toList());
    let turn = this.getGame().getTurn();
    let warehouseCapacity = this.getColony().getWarehouseCapacity();
    return pc.getAdjustedProductionInfo(this.buildingType, turn, workerAssignments, inputs, outputs, warehouseCapacity);
  }
  /**
   * Evaluate this work location for a given player.
   *
   * @param player The {@code Player} to evaluate for.
   * @return A value for the player.
   */
  evaluateFor(player: Player): number {
    return (super.evaluateFor(player) + (CollectionUtils.sum$Stream$ToIntFunction(this.getType().getRequiredGoods$(), (ag) => ag.evaluateFor(player)))) | 0;
  }
  /**
   * {@inheritDoc}
   */
  getLocationLabel(): StringTemplate {
    return StringTemplate.template$String('model.building.locationLabel').addNamed$String$Named('%location%', this);
  }
  /**
   * {@inheritDoc}
   */
  up(): Location {
    return this.getColony();
  }
  /**
   * {@inheritDoc}
   */
  toShortString(): string {
    return this.getColony().getName() + '-' + this.getType().getSuffix$();
  }
  /**
   * {@inheritDoc}
   */
  getNoAddReason(locatable: Locatable): UnitLocation$NoAddReason {
    let reason = super.getNoAddReason(locatable);
    if (reason === UnitLocation$NoAddReason.NONE) {
      reason = this.getType().getNoAddReason((locatable).getType());
      if (reason === UnitLocation$NoAddReason.NONE) {
        reason = this.getNoWorkReason();
      }
    }
    return reason;
  }
  /**
   * {@inheritDoc}
   */
  getUnitCapacity(): number {
    return this.getType().getWorkPlaces();
  }
  goodSuggestionCheck$UnitType$Unit$GoodsType(better: UnitType, unit: Unit, goodsType: GoodsType): boolean {
    if (this.canAddType(better)) {
      let colony = this.getColony();
      let bt: BuildableType;
      if (this.getLevel() > 1 || unit != null) {
        return true;
      } else if (colony.getTotalProductionOf(goodsType) === 0 && (bt = colony.getCurrentlyBuilding()) != null && CollectionUtils.any$Stream$Predicate(bt.getRequiredGoods$(), AbstractGoods.matches(goodsType))) {
        return true;
      }
    }
    return false;
  }
  /**
   * {@inheritDoc}
   */
  getLabel(): StringTemplate {
    return (this.buildingType == null) ? null : StringTemplate.key$Named(this.buildingType);
  }
  /**
   * {@inheritDoc}
   */
  isAvailable(): boolean {
    return true;
  }
  /**
   * {@inheritDoc}
   */
  isCurrent(): boolean {
    return true;
  }
  /**
   * {@inheritDoc}
   */
  getNoWorkReason(): UnitLocation$NoAddReason {
    return UnitLocation$NoAddReason.NONE;
  }
  /**
   * {@inheritDoc}
   */
  getWorkTile(): Tile {
    return null;
  }
  /**
   * {@inheritDoc}
   */
  getLevel(): number {
    return this.getType().getLevel();
  }
  /**
   * {@inheritDoc}
   */
  canAutoProduce(): boolean {
    return this.hasAbility$String(Ability.AUTO_PRODUCTION);
  }
  /**
   * {@inheritDoc}
   */
  canProduce(goodsType: GoodsType, unitType: UnitType): boolean {
    let type$ = this.getType();
    return type$ != null && type$.canProduce(goodsType, unitType);
  }
  /**
   * {@inheritDoc}
   */
  getBaseProduction(productionType: ProductionType, goodsType: GoodsType, unitType: UnitType): number {
    let type$ = this.getType();
    return (type$ == null) ? 0 : this.getType().getBaseProduction(productionType, goodsType, unitType);
  }
  /**
   * {@inheritDoc}
   */
  getProductionModifiers(goodsType: GoodsType, unitType: UnitType): Stream<Modifier> {
    let type$ = this.getType();
    let id = (goodsType == null) ? null : goodsType.getId();
    let colony = this.getColony();
    let owner = this.getOwner();
    let turn = this.getGame().getTurn();
    return (unitType != null) ? CollectionUtils.concat(this.getModifiers$String$FreeColSpecObjectType$Turn(id, unitType, turn), [colony.getProductionModifiers(goodsType, unitType, this), this.getType().getCompetenceModifiers(id, unitType, turn), owner.getModifiers$String$FreeColSpecObjectType$Turn(id, unitType, turn)]) : CollectionUtils.concat(colony.getModifiers$String$FreeColSpecObjectType$Turn(id, type$, turn), [owner.getModifiers$String$FreeColSpecObjectType$Turn(id, type$, turn)]);
  }
  /**
   * {@inheritDoc}
   */
  getAvailableProductionTypes(unattended: boolean): List<ProductionType> {
    return (this.buildingType == null) ? Collections.emptyList() : this.getType().getAvailableProductionTypes$boolean(unattended);
  }
  /**
   * {@inheritDoc}
   */
  getCompetenceFactor(): number {
    return this.getType().getCompetenceFactor();
  }
  /**
   * {@inheritDoc}
   */
  getRebelFactor(): number {
    return this.getType().getRebelFactor();
  }
  /**
   * {@inheritDoc}
   */
  getConsumedGoods(): List<AbstractGoods> {
    return CollectionUtils.toList$Stream(this.getInputs());
  }
  /**
   * {@inheritDoc}
   */
  getPriority(): number {
    return this.getType().getPriority();
  }
  /**
   * {@inheritDoc}
   */
  getConsumptionModifiers(id: string): Stream<Modifier> {
    return this.getModifiers$String(id);
  }
  /**
   * {@inheritDoc}
   */
  getNameKey(): string {
    return this.getType().getNameKey();
  }
  /**
   * {@inheritDoc}
   */
  getAbilities$String$FreeColSpecObjectType$Turn(id: string, type$: FreeColSpecObjectType, turn: Turn): Stream<Ability> {
    return this.getType().getAbilities$String$FreeColSpecObjectType$Turn(id, type$, turn);
  }
  /**
   * {@inheritDoc}
   */
  getModifiers$String$FreeColSpecObjectType$Turn(id: string, fcgot: FreeColSpecObjectType, turn: Turn): Stream<Modifier> {
    return this.getType().getModifiers$String$FreeColSpecObjectType$Turn(id, fcgot, turn);
  }
  /**
   * {@inheritDoc}
   */
  copyIn<T>(other: T): boolean {
    let o = this.copyInCast(other, $J.cls(Building));
    if (o == null || !super.copyIn(o)) {
      return false;
    }
    this.buildingType = o.getType();
    return true;
  }
  /**
   * {@inheritDoc}
   */
  getDisplayObject(): FreeColObject {
    return this.getType();
  }
  /**
   * {@inheritDoc}
   */
  writeAttributes(xw: FreeColXMLWriter): void {
    super.writeAttributes(xw);
    xw.writeAttribute$String$FreeColObject(Building.BUILDING_TYPE_TAG, this.buildingType);
  }
  /**
   * {@inheritDoc}
   */
  readAttributes(xr: FreeColXMLReader): void {
    super.readAttributes(xr);
    let spec = this.getSpecification();
    this.buildingType = xr.getType(spec, Building.BUILDING_TYPE_TAG, $J.cls(BuildingType), null);
  }
  /**
   * {@inheritDoc}
   */
  getXMLTagName(): string {
    return Building.TAG;
  }
  /**
   * {@inheritDoc}
   */
  toString(): string {
    let sb = new StringBuilder(32);
    let c = this.getColony();
    sb.append(String.fromCharCode(91 /* '[' */)).append(this.getId()).append(String.fromCharCode(32 /* ' ' */)).append((this.buildingType == null) ? '' : StringUtils.lastPart(this.buildingType.getId(), '.')).append(String.fromCharCode(47 /* \u002f */)).append((c == null) ? 'NO-COLONY' : c.getName()).append(String.fromCharCode(93 /* ']' */));
    return sb.toString();
  }
  static $clinit() {
    Building.logger = Logger.getLogger($J.cls(Building).getName());
  }
}

$J.define(Building, 'net.sf.freecol.common.model.Building', { kind: 'class', ifaces: ['net.sf.freecol.common.model.Named', 'net.sf.freecol.common.model.Consumer'], sup: 'net.sf.freecol.common.model.WorkLocation', ctors: { 'net.sf.freecol.common.model.Game,java.lang.String': '_Building$Game$String', 'net.sf.freecol.common.model.Game,net.sf.freecol.common.model.Colony,net.sf.freecol.common.model.BuildingType': '_Building$Game$Colony$BuildingType' }, returns: { 'getXMLTagName': 'java.lang.String', 'getDisplayObject': 'net.sf.freecol.common.model.FreeColObject', 'getNameKey': 'java.lang.String', 'getPriority': 'int', 'getConsumedGoods': 'java.util.List', 'getRebelFactor': 'float', 'getCompetenceFactor': 'float', 'getLevel': 'int', 'getWorkTile': 'net.sf.freecol.common.model.Tile', 'getNoWorkReason': 'net.sf.freecol.common.model.UnitLocation$NoAddReason', 'isCurrent': 'boolean', 'isAvailable': 'boolean', 'getLabel': 'net.sf.freecol.common.model.StringTemplate', 'getUnitCapacity': 'int', 'getLocationLabel': 'net.sf.freecol.common.model.StringTemplate', 'getType': 'net.sf.freecol.common.model.BuildingType' }, meths: { 'getModifiers(java.lang.String,net.sf.freecol.common.model.FreeColSpecObjectType,net.sf.freecol.common.model.Turn)': 'getModifiers$String$FreeColSpecObjectType$Turn', 'getAbilities(java.lang.String,net.sf.freecol.common.model.FreeColSpecObjectType,net.sf.freecol.common.model.Turn)': 'getAbilities$String$FreeColSpecObjectType$Turn', 'goodSuggestionCheck(net.sf.freecol.common.model.UnitType,net.sf.freecol.common.model.Unit,net.sf.freecol.common.model.GoodsType)': 'goodSuggestionCheck$UnitType$Unit$GoodsType' }, clinit: true, lazy: ['logger'] });
$J.module(() => {
  Ability = $J.load('net.sf.freecol.common.model.Ability');
  AbstractGoods = $J.load('net.sf.freecol.common.model.AbstractGoods');
  BuildingType = $J.load('net.sf.freecol.common.model.BuildingType');
  StringTemplate = $J.load('net.sf.freecol.common.model.StringTemplate');
  UnitLocation$NoAddReason = $J.load('net.sf.freecol.common.model.UnitLocation$NoAddReason');
  BuildingProductionCalculator = $J.load('net.sf.freecol.common.model.production.BuildingProductionCalculator');
  WorkerAssignment = $J.load('net.sf.freecol.common.model.production.WorkerAssignment');
  CollectionUtils = $J.load('net.sf.freecol.common.util.CollectionUtils');
  StringUtils = $J.load('net.sf.freecol.common.util.StringUtils');
});
