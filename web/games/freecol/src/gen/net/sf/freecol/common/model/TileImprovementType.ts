// @ts-nocheck
// FreeCol 1.2.0 src/net/sf/freecol/common/model/TileImprovementType.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
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
import { $J, ArrayList, HashMap, HashSet, Stream } from '../../../../../../jre/index.ts';
import { FreeColSpecObjectType } from './FreeColSpecObjectType.ts';

let Disaster, FreeColObject, Role, TileTypeChange, CollectionUtils, RandomChoice;

/**
 * An improvement to make to a tile.
 */
export class TileImprovementType extends FreeColSpecObjectType {
  static readonly TAG: string = 'tile-improvement-type';
  /**
   * Is this improvement natural or man-made?
   */
  natural: boolean = false;
  /**
   * The magnitude of the improvement.
   */
  magnitude: number = 0;
  /**
   * The number of turns to build this improvement.
   */
  addWorkTurns: number = 0;
  /**
   * Any improvement that is required before this one.
   */
  requiredImprovementType: TileImprovementType = null;
  /**
   * The role required to make this improvement.
   */
  requiredRole: Role = null;
  /**
   * The amount of the equipment expended in making this improvement.
   */
  expendedAmount: number = 0;
  /**
   * The change to the movement cost due to this tile improvement.
   */
  movementCost: number = 0;
  /**
   * Can this improvement expose a resource when completed? This
   * should only apply to improvement types that change the
   * underlying tile type (e.g. clearing forests).
   */
  exposeResourcePercent: number = 0;
  /**
   * The layer a TileItem belongs to. Items with higher zIndex
   * will be displayed above items with a lower zIndex. E.g. the
   * LostCityRumour would be displayed above the Plow improvement.
   */
  zIndex: number = 0;
  /**
   * The workers that can make this improvement.
   */
  allowedWorkers: JSet<string> = null;
  /**
   * The changes this improvement makes to a particular tile type.
   */
  tileTypeChanges: JMap<TileType, TileTypeChange> = null;
  /**
   * The disasters that may strike this type of tile improvement.
   */
  disasters: List<RandomChoice<Disaster>> = null;
  static readonly ADD_WORK_TURNS_TAG: string = 'add-work-turns';
  static readonly DISASTER_TAG: string = 'disaster';
  static readonly EXPENDED_AMOUNT_TAG: string = 'expended-amount';
  static readonly EXPOSE_RESOURCE_PERCENT_TAG: string = 'expose-resource-percent';
  static readonly FROM_TAG: string = 'from';
  static readonly MAGNITUDE_TAG: string = 'magnitude';
  static readonly MOVEMENT_COST_TAG: string = 'movement-cost';
  static readonly NATURAL_TAG: string = 'natural';
  static readonly PROBABILITY_TAG: string = 'probability';
  static readonly REQUIRED_IMPROVEMENT_TAG: string = 'required-improvement';
  static readonly REQUIRED_ROLE_TAG: string = 'required-role';
  static readonly TILE_TYPE_CHANGE_TAG: string = 'tile-type-change';
  static readonly TO_TAG: string = 'to';
  static readonly WORKER_TAG: string = 'worker';
  static readonly ZINDEX_TAG: string = 'zIndex';
  static readonly OLD_EXPENDED_EQUIPMENT_TYPE_TAG: string = 'expended-equipment-type';
  static readonly OLD_EXPOSE_RESOURCE_PERCENT_TAG: string = 'exposeResourcePercent';
  static readonly OLD_CHANGE_TAG: string = 'change';
  /**
   * Create a new tile improvement type.
   *
   * @param id The object identifier.
   * @param specification The {@code Specification} to refer to.
   */
  _TileImprovementType(id: string, specification: Specification): this {
    this._FreeColSpecObjectType$String$Specification(id, specification);
    this.movementCost = -1;
    this.allowedWorkers = null;
    this.tileTypeChanges = null;
    this.disasters = null;
    return this;
  }
  /**
   * Is this tile improvement type natural?
   *
   * @return True if this is a natural tile improvement type.
   */
  isNatural(): boolean {
    return this.natural;
  }
  /**
   * Get the magnitude of this tile improvement type.
   *
   * @return The magnitude.
   */
  getMagnitude(): number {
    return this.magnitude;
  }
  /**
   * Get the number of turns to build this tile improvement type.
   *
   * @return The number of build turns.
   */
  getAddWorkTurns(): number {
    return this.addWorkTurns;
  }
  /**
   * Gets the required improvement type.
   *
   * @return The required improvement type if any.
   */
  getRequiredImprovementType(): TileImprovementType {
    return this.requiredImprovementType;
  }
  /**
   * Get the role required to perform this improvement, if any.
   *
   * @return The required {@code Role}.
   */
  getRequiredRole(): Role {
    return this.requiredRole;
  }
  /**
   * Gets the amount of equipment expended in building this improvement type.
   *
   * @return The expended equipment amount, if any.
   */
  getExpendedAmount(): number {
    return this.expendedAmount;
  }
  /**
   * Get the standard movement cost of the tile improvement type.
   *
   * @return The movement cost.
   */
  getMoveCost$(): number {
    return this.movementCost;
  }
  /**
   * Possibly reduce the cost of moving due to this tile improvement
   * type.
   *
   * Only applies if movementCost is positive (see spec).  Do not
   * return zero from a movement costing routine or units get free
   * moves!
   *
   * @param originalCost The original movement cost.
   * @return The movement cost after any change.
   */
  getMoveCost$int(originalCost: number): number {
    return (this.movementCost > 0 && this.movementCost < originalCost) ? this.movementCost : originalCost;
  }
  /**
   * Gets the percent chance that this tile improvement can expose a
   * resource on the tile. This only applies to TileImprovementTypes
   * that change the underlying tile type (e.g. clearing forests).
   *
   * @return The exposure chance.
   */
  getExposeResourcePercent(): number {
    return this.exposeResourcePercent;
  }
  /**
   * Get the layer.
   *
   * @return The layer.
   */
  getZIndex(): number {
    return this.zIndex;
  }
  /**
   * Set the layer.
   *
   * @param newZIndex The new layer.
   */
  setZIndex(newZIndex: number): void {
    this.zIndex = newZIndex;
  }
  /**
   * Get the set of allowed worker identifiers.
   *
   * @return The set of allowed worker identifiers.
   */
  getAllowedWorkers(): JSet<string> {
    if (this.allowedWorkers == null) {
      this.allowedWorkers = new HashSet();
    }
    return this.allowedWorkers;
  }
  /**
   * Set the set of allowed worker identifiers.
   *
   * @param allowed The new set of allowed worker identifiers.
   */
  setAllowedWorkers(allowed: JSet<string>): void {
    if (this.allowedWorkers == null) {
      this.allowedWorkers = new HashSet();
    } else {
      this.allowedWorkers.clear();
    }
    this.allowedWorkers.addAll(allowed);
  }
  /**
   * Add an allowed worker identifier.
   *
   * @param id The worker identifier to add.
   */
  addAllowedWorker(id: string): void {
    this.getAllowedWorkers().add(id);
  }
  /**
   * Is a particular unit type allowed to build this improvement?
   *
   * @param unitType The {@code UnitType} to check.
   * @return True if the {@code UnitType} can build this improvement.
   */
  isWorkerTypeAllowed(unitType: UnitType): boolean {
    return this.allowedWorkers == null || this.allowedWorkers.isEmpty() || this.allowedWorkers.contains(unitType.getId());
  }
  /**
   * Is a particular unit allowed to build this improvement?
   *
   * Checks both the unit type and the available equipment.
   *
   * @param unit The {@code Unit} to check.
   * @return True if the {@code Unit} can build this improvement.
   */
  isWorkerAllowed(unit: Unit): boolean {
    return this.isWorkerTypeAllowed(unit.getType()) && (this.requiredRole == null || unit.getRole() === this.requiredRole);
  }
  /**
   * This will check if in principle this type of improvement can be
   * used on this kind of tile, disregarding the current state of an
   * actual tile.
   *
   * If you want to find out if an improvement is allowed for a tile, call
   * {@link Tile#isImprovementAllowed(TileImprovement)}.
   *
   * @param tileType The {@code TileType} to check.
   * @return True if improvement is possible.
   */
  isTileTypeAllowed(tileType: TileType): boolean {
    return CollectionUtils.all$Stream$Predicate(this.getScopes(), (s) => s.appliesTo(tileType));
  }
  getBonus(goodsType: GoodsType): number {
    let result = this.getProductionModifier(goodsType);
    if (result == null) {
      return 0;
    } else {
      return $J.d2i(result.getValue$());
    }
  }
  getProductionModifier(goodsType: GoodsType): Modifier {
    return CollectionUtils.first$Stream(this.getModifiers$String(goodsType.getId()));
  }
  /**
   * Get the tile type change map.
   *
   * @return The map of tile type to changes.
   */
  getTileTypeChanges(): JMap<TileType, TileTypeChange> {
    if (this.tileTypeChanges == null) {
      this.tileTypeChanges = new HashMap();
    }
    return this.tileTypeChanges;
  }
  /**
   * Set the tile type change map.
   *
   * @param changes A new map of tile type to changes.
   */
  setTileTypeChanges(changes: JMap<TileType, TileTypeChange>): void {
    if (this.tileTypeChanges == null) {
      this.tileTypeChanges = new HashMap();
    } else {
      this.tileTypeChanges.clear();
    }
    this.tileTypeChanges.putAll(changes);
  }
  /**
   * Does this tile improvement change the underlying tile type.
   *
   * @return True if this tile improvement changes the tile type.
   */
  isChangeType(): boolean {
    return this.tileTypeChanges != null && !this.tileTypeChanges.isEmpty();
  }
  /**
   * Gets the goods produced by applying this TileImprovementType
   * to a Tile with the given TileType.
   *
   * @param from The original {@code TileType}.
   * @return The {@code AbstractGoods} produced.
   */
  getProduction(from: TileType): AbstractGoods {
    if (this.tileTypeChanges == null) {
      return null;
    }
    let change = this.tileTypeChanges.get(from);
    return (change == null) ? null : change.getProduction();
  }
  /**
   * Gets the destination type of a tile type change (or null).
   *
   * @param tileType The {@code TileType} that is to change.
   * @return The resulting {@code TileType}.
   */
  getChange(tileType: TileType): TileType {
    if (this.tileTypeChanges == null) {
      return null;
    }
    let change = this.tileTypeChanges.get(tileType);
    return (change == null) ? null : change.getTo();
  }
  /**
   * Can this tile improvement type change a tile type to the given
   * tile type.
   *
   * @param tileType The required {@code TileType}.
   * @return True if the required {@code TileType} can be changed to.
   */
  changeContainsTarget(tileType: TileType): boolean {
    return (this.tileTypeChanges == null) ? false : CollectionUtils.any$Collection$Predicate(this.tileTypeChanges.values(), CollectionUtils.matchKey$Object$Function(tileType, ($p0) => $p0.getTo()));
  }
  /**
   * Add a tile type change.
   *
   * @param change The {@code TileTypeChange} to add.
   */
  addChange(change: TileTypeChange): void {
    if (this.tileTypeChanges == null) {
      this.tileTypeChanges = new HashMap();
    }
    this.tileTypeChanges.put(change.getFrom(), change);
  }
  /**
   * Gets the increase in production of the given GoodsType
   * this tile improvement type would yield at a specified tile.
   *
   * @param tile The {@code Tile} to be considered.
   * @param goodsType An optional preferred {@code GoodsType}.
   * @return The increase in production
   */
  getImprovementValue$Tile$GoodsType(tile: Tile, goodsType: GoodsType): number {
    let colonistType = this.getSpecification().getDefaultUnitType$();
    return this.getImprovementValue$Tile$GoodsType$UnitType(tile, goodsType, colonistType);
  }
  /**
   * Gets the increase in production of the given GoodsType
   * this tile improvement type would yield at a specified tile.
   *
   * @param tile The {@code Tile} to be considered.
   * @param goodsType An optional preferred {@code GoodsType}.
   * @param unitType The unit type working on the tile.
   * @return The increase in production
   */
  getImprovementValue$Tile$GoodsType$UnitType(tile: Tile, goodsType: GoodsType, unitType: UnitType): number {
    let value = 0;
    if (goodsType.isFarmed()) {
      let oldProduction = tile.getType().getPotentialProduction(goodsType, unitType);
      let tt = this.getChange(tile.getType());
      if (tt == null) {
        let production = tile.getPotentialProduction(goodsType, unitType);
        if (production > 0) {
          let chg = this.apply$float$Turn$String(Math.fround(production), null, goodsType.getId());
          value = $J.d2i((Math.fround(chg - production)));
        }
      } else {
        let chg = (tt.getPotentialProduction(goodsType, unitType) - oldProduction) | 0;
        value = chg;
      }
    }
    return value;
  }
  /**
   * Gets the increase in production of the given GoodsType
   * this tile improvement type would yield at a specified tile.
   *
   * @param tile The {@code Tile} to be considered.
   * @param goodsType An optional preferred {@code GoodsType}.
   * @return The increase in production
   */
  getImprovementValue$TileType$GoodsType$UnitType(tileType: TileType, goodsType: GoodsType, unitType: UnitType): number {
    let value = 0;
    if (goodsType.isFarmed()) {
      let oldProduction = tileType.getPotentialProduction(goodsType, unitType);
      let tt = this.getChange(tileType);
      if (tt == null) {
        let production = tileType.getPotentialProduction(goodsType, unitType);
        if (production > 0) {
          let chg = this.apply$float$Turn$String(Math.fround(production), null, goodsType.getId());
          value = $J.d2i((Math.fround(chg - production)));
        }
      } else {
        let chg = (tt.getPotentialProduction(goodsType, unitType) - oldProduction) | 0;
        value = chg;
      }
    }
    return value;
  }
  /**
   * Get the list of disasters for this tile type.
   *
   * @return The disaster list.
   */
  getDisasters(): List<RandomChoice<Disaster>> {
    if (this.disasters == null) {
      this.disasters = new ArrayList();
    }
    return this.disasters;
  }
  /**
   * Set the list of disasters for this tile type.
   *
   * @param disasters The new list of {@code Disaster}s.
   */
  setDisasters(disasters: List<RandomChoice<Disaster>>): void {
    if (this.disasters == null) {
      this.disasters = new ArrayList();
    } else {
      this.disasters.clear();
    }
    this.disasters.addAll(disasters);
  }
  /**
   * Get a weighted list of natural disasters than can strike this
   * tile improvement type.
   *
   * @return A stream of {@code Disaster} choices.
   */
  getDisasterChoices(): Stream<RandomChoice<Disaster>> {
    return (this.disasters == null) ? Stream.empty() : this.disasters.stream();
  }
  /**
   * Add a disaster.
   *
   * @param disaster The {@code Disaster} to add.
   * @param probability The probability of the disaster.
   */
  addDisaster(disaster: Disaster, probability: number): void {
    if (this.disasters == null) {
      this.disasters = new ArrayList();
    }
    this.disasters.add(new RandomChoice()._RandomChoice(disaster, probability));
  }
  /**
   * {@inheritDoc}
   */
  copyIn<T>(other: T): boolean {
    let o = this.copyInCast(other, $J.cls(TileImprovementType));
    if (o == null || !super.copyIn(o)) {
      return false;
    }
    this.natural = o.isNatural();
    this.magnitude = o.getMagnitude();
    this.addWorkTurns = o.getAddWorkTurns();
    this.requiredImprovementType = o.getRequiredImprovementType();
    this.requiredRole = o.getRequiredRole();
    this.expendedAmount = o.getExpendedAmount();
    this.movementCost = o.getMoveCost$();
    this.exposeResourcePercent = o.getExposeResourcePercent();
    this.zIndex = o.getZIndex();
    this.setAllowedWorkers(o.getAllowedWorkers());
    this.setTileTypeChanges(o.getTileTypeChanges());
    this.setDisasters(o.getDisasters());
    return true;
  }
  /**
   * {@inheritDoc}
   */
  writeAttributes(xw: FreeColXMLWriter): void {
    super.writeAttributes(xw);
    xw.writeAttribute$String$boolean(TileImprovementType.NATURAL_TAG, this.natural);
    xw.writeAttribute$String$int(TileImprovementType.MAGNITUDE_TAG, this.magnitude);
    xw.writeAttribute$String$int(TileImprovementType.ADD_WORK_TURNS_TAG, this.addWorkTurns);
    if (this.requiredImprovementType != null) {
      xw.writeAttribute$String$FreeColObject(TileImprovementType.REQUIRED_IMPROVEMENT_TAG, this.requiredImprovementType);
    }
    if (this.requiredRole != null) {
      xw.writeAttribute$String$FreeColObject(TileImprovementType.REQUIRED_ROLE_TAG, this.requiredRole);
    }
    if (this.expendedAmount !== 0) {
      xw.writeAttribute$String$int(TileImprovementType.EXPENDED_AMOUNT_TAG, this.expendedAmount);
    }
    xw.writeAttribute$String$int(TileImprovementType.MOVEMENT_COST_TAG, this.movementCost);
    xw.writeAttribute$String$int(TileImprovementType.ZINDEX_TAG, this.zIndex);
    xw.writeAttribute$String$int(TileImprovementType.EXPOSE_RESOURCE_PERCENT_TAG, this.exposeResourcePercent);
  }
  /**
   * {@inheritDoc}
   */
  writeChildren(xw: FreeColXMLWriter): void {
    super.writeChildren(xw);
    if (this.allowedWorkers != null) {
      for (const $it0 = this.allowedWorkers.iterator(); $it0.hasNext(); ) {
        let id = $it0.next();
        xw.writeStartElement(TileImprovementType.WORKER_TAG);
        xw.writeAttribute(FreeColObject.ID_ATTRIBUTE_TAG, id);
        xw.writeEndElement();
      }
    }
    if (this.tileTypeChanges != null) {
      for (const $it1 = CollectionUtils.mapEntriesByValue$Map(this.tileTypeChanges).iterator(); $it1.hasNext(); ) {
        let e = $it1.next();
        e.getValue().toXML$FreeColXMLWriter(xw);
      }
    }
    for (const $it2 = CollectionUtils.iterable(this.getDisasterChoices()).iterator(); $it2.hasNext(); ) {
      let choice = $it2.next();
      xw.writeStartElement(TileImprovementType.DISASTER_TAG);
      xw.writeAttribute(FreeColObject.ID_ATTRIBUTE_TAG, choice.getObject().getId());
      xw.writeAttribute$String$int(TileImprovementType.PROBABILITY_TAG, choice.getProbability());
      xw.writeEndElement();
    }
  }
  /**
   * {@inheritDoc}
   */
  readAttributes(xr: FreeColXMLReader): void {
    super.readAttributes(xr);
    let spec = this.getSpecification();
    this.natural = xr.getAttribute$String$boolean(TileImprovementType.NATURAL_TAG, false);
    this.magnitude = xr.getAttribute$String$int(TileImprovementType.MAGNITUDE_TAG, 1);
    this.addWorkTurns = xr.getAttribute$String$int(TileImprovementType.ADD_WORK_TURNS_TAG, 0);
    this.requiredImprovementType = xr.getType(spec, TileImprovementType.REQUIRED_IMPROVEMENT_TAG, $J.cls(TileImprovementType), null);
    this.requiredRole = xr.getType(spec, TileImprovementType.REQUIRED_ROLE_TAG, $J.cls(Role), null);
    if (xr.hasAttribute(TileImprovementType.OLD_EXPENDED_EQUIPMENT_TYPE_TAG)) {
      this.requiredRole = spec.getRole('model.role.pioneer');
    }
    this.expendedAmount = xr.getAttribute$String$int(TileImprovementType.EXPENDED_AMOUNT_TAG, 0);
    this.movementCost = xr.getAttribute$String$int(TileImprovementType.MOVEMENT_COST_TAG, 0);
    this.zIndex = xr.getAttribute$String$int(TileImprovementType.ZINDEX_TAG, 0);
    if (xr.hasAttribute(TileImprovementType.OLD_EXPOSE_RESOURCE_PERCENT_TAG)) {
      this.exposeResourcePercent = xr.getAttribute$String$int(TileImprovementType.OLD_EXPOSE_RESOURCE_PERCENT_TAG, 0);
    } else {
      this.exposeResourcePercent = xr.getAttribute$String$int(TileImprovementType.EXPOSE_RESOURCE_PERCENT_TAG, 0);
    }
  }
  /**
   * {@inheritDoc}
   */
  clearContainers$FreeColXMLReader(xr: FreeColXMLReader): void {
    super.clearContainers$FreeColXMLReader(xr);
    this.allowedWorkers = null;
    this.tileTypeChanges = null;
    this.disasters = null;
  }
  /**
   * {@inheritDoc}
   */
  readChildren(xr: FreeColXMLReader): void {
    super.readChildren(xr);
  }
  /**
   * {@inheritDoc}
   */
  readChild(xr: FreeColXMLReader): void {
    let spec = this.getSpecification();
    let tag = xr.getLocalName();
    if ($J.equals(TileImprovementType.TILE_TYPE_CHANGE_TAG, tag) || $J.equals(TileImprovementType.OLD_CHANGE_TAG, tag)) {
      this.addChange(new TileTypeChange()._TileTypeChange$FreeColXMLReader$Specification(xr, spec));
    } else if ($J.equals(TileImprovementType.DISASTER_TAG, tag)) {
      let disaster = xr.getType(spec, FreeColObject.ID_ATTRIBUTE_TAG, $J.cls(Disaster), null);
      let probability = xr.getAttribute$String$int(TileImprovementType.PROBABILITY_TAG, 100);
      this.addDisaster(disaster, probability);
      xr.closeTag$String(TileImprovementType.DISASTER_TAG);
    } else if ($J.equals(TileImprovementType.WORKER_TAG, tag)) {
      this.addAllowedWorker(xr.readId());
      xr.closeTag$String(TileImprovementType.WORKER_TAG);
    } else {
      super.readChild(xr);
    }
  }
  /**
   * {@inheritDoc}
   */
  getXMLTagName(): string {
    return TileImprovementType.TAG;
  }
}

$J.define(TileImprovementType, 'net.sf.freecol.common.model.TileImprovementType', { kind: 'class', sup: 'net.sf.freecol.common.model.FreeColSpecObjectType', ctors: { 'java.lang.String,net.sf.freecol.common.model.Specification': '_TileImprovementType' }, returns: { 'getXMLTagName': 'java.lang.String', 'getDisasterChoices': 'java.util.stream.Stream', 'getDisasters': 'java.util.List', 'isChangeType': 'boolean', 'getTileTypeChanges': 'java.util.Map', 'getAllowedWorkers': 'java.util.Set', 'getZIndex': 'int', 'getExposeResourcePercent': 'int', 'getMoveCost$': 'int', 'getExpendedAmount': 'int', 'getRequiredRole': 'net.sf.freecol.common.model.Role', 'getRequiredImprovementType': 'net.sf.freecol.common.model.TileImprovementType', 'getAddWorkTurns': 'int', 'getMagnitude': 'int', 'isNatural': 'boolean' }, meths: { 'clearContainers(net.sf.freecol.common.io.FreeColXMLReader)': 'clearContainers$FreeColXMLReader', 'getImprovementValue(net.sf.freecol.common.model.TileType,net.sf.freecol.common.model.GoodsType,net.sf.freecol.common.model.UnitType)': 'getImprovementValue$TileType$GoodsType$UnitType', 'getImprovementValue(net.sf.freecol.common.model.Tile,net.sf.freecol.common.model.GoodsType,net.sf.freecol.common.model.UnitType)': 'getImprovementValue$Tile$GoodsType$UnitType', 'getImprovementValue(net.sf.freecol.common.model.Tile,net.sf.freecol.common.model.GoodsType)': 'getImprovementValue$Tile$GoodsType', 'getMoveCost(int)': 'getMoveCost$int', 'getMoveCost()': 'getMoveCost$' } });
$J.module(() => {
  Disaster = $J.load('net.sf.freecol.common.model.Disaster');
  FreeColObject = $J.load('net.sf.freecol.common.model.FreeColObject');
  Role = $J.load('net.sf.freecol.common.model.Role');
  TileTypeChange = $J.load('net.sf.freecol.common.model.TileTypeChange');
  CollectionUtils = $J.load('net.sf.freecol.common.util.CollectionUtils');
  RandomChoice = $J.load('net.sf.freecol.common.util.RandomChoice');
});
