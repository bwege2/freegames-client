// @ts-nocheck
// FreeCol 1.2.0 src/net/sf/freecol/common/model/ColonyTile.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
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
import { $J, Collections, Logger, StringBuilder } from '../../../../../../jre/index.ts';
import { WorkLocation } from './WorkLocation.ts';

let Ability, AbstractGoods, Player$NoClaimReason, StringTemplate, Tile, UnitLocation$NoAddReason, TileProductionCalculator, WorkerAssignment, CollectionUtils;

/**
 * Represents a work location on a tile. Each ColonyTile except the
 * colony center tile provides a work place for a single unit and
 * produces a single type of goods. The colony center tile generally
 * produces two different of goods, one food type and one new world
 * raw material.
 */
export class ColonyTile extends WorkLocation {
  static logger: Logger = null;
  static readonly TAG: string = 'colonyTile';
  static readonly UNIT_CHANGE: string = 'UNIT_CHANGE';
  /**
   * The maximum number of units a ColonyTile can hold.
   */
  static readonly UNIT_CAPACITY: number = 1;
  /**
   * The tile to work.  This is accessed through getWorkTile().
   * Beware!  Do not confuse this with getTile(), which returns
   * the colony center tile (because every work location belongs to
   * the enclosing colony).
   */
  workTile: Tile = null;
  static readonly WORK_TILE_TAG: string = 'workTile';
  /**
   * Constructor for ServerColonyTile.
   *
   * @param game The enclosing {@code Game}.
   * @param colony The {@code Colony} this object belongs to.
   * @param workTile The tile in which this {@code ColonyTile}
   *                 represents a {@code WorkLocation} for.
   */
  _ColonyTile$Game$Colony$Tile(game: Game, colony: Colony, workTile: Tile): this {
    this._WorkLocation$Game(game);
    this.colony = colony;
    this.workTile = workTile;
    this.updateProductionType();
    return this;
  }
  /**
   * Create a new {@code ColonyTile} with the given identifier.
   * The object should later be initialized by calling either
   * {@link #readFromXML(FreeColXMLReader)}.
   *
   * @param game The enclosing {@code Game}.
   * @param id The object identifier.
   */
  _ColonyTile$Game$String(game: Game, id: string): this {
    this._WorkLocation$Game$String(game, id);
    return this;
  }
  /**
   * Is this the tile where the {@code Colony} is located?
   *
   * @return True if this is the colony center tile.
   */
  isColonyCenterTile(): boolean {
    return this.workTile === this.getTile$();
  }
  /**
   * Gets the work tile, that is the actual tile being worked.
   *
   * @return The {@code Tile} in which this
   *     {@code ColonyTile} represents a
   *     {@code WorkLocation} for.
   */
  getWorkTile(): Tile {
    return this.workTile;
  }
  /**
   * Sets the work tile.  Needed to fix copied colonies.  Do not use
   * otherwise!
   *
   * @param workTile The new work {@code Tile}.
   */
  setWorkTile(workTile: Tile): void {
    this.workTile = workTile;
  }
  /**
   * Gets a unit who is occupying the tile.
   *
   * @return A {@code Unit} who is occupying the work tile, if any.
   * @see #isOccupied()
   */
  getOccupyingUnit(): Unit {
    return this.workTile.getOccupyingUnit();
  }
  /**
   * Is there a fortified enemy unit on the work tile?
   * Production can not occur on occupied tiles.
   *
   * @return True if an fortified enemy unit is in the tile.
   */
  isOccupied(): boolean {
    return this.workTile.isOccupied();
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
   * @return The raw production of this colony tile.
   * @see ProductionCache#update
   */
  getBasicProductionInfo(): ProductionInfo {
    let tpc = new TileProductionCalculator()._TileProductionCalculator(this.getOwner(), this.colony.getProductionBonus());
    let workerUnitType = this.getUnits().findFirst().map(($p0) => $p0.getType()).orElse(null);
    return tpc.getBasicProductionInfo(this.workTile, this.getGame().getTurn(), new WorkerAssignment()._WorkerAssignment(workerUnitType, this.getProductionType()), this.isColonyCenterTile());
  }
  /**
   * Would a given tile improvement be beneficial to this colony tile?
   *
   * @param ti The {@code TileImprovementType} to assess.
   * @return A measure of improvement (negative is a bad idea).
   */
  improvedBy(ti: TileImprovementType): number {
    let tile = this.getWorkTile();
    let colony = this.getColony();
    if (tile == null || tile.getOwningSettlement() !== colony || tile.hasTileImprovement(ti)) {
      return 0;
    }
    let oldType = tile.getType();
    if (!ti.isTileTypeAllowed(oldType)) {
      return 0;
    }
    let productionType = this.getProductionType();
    if (productionType == null) {
      return 0;
    }
    let resource = tile.getResource();
    let newType = ti.getChange(oldType);
    if (productionType.getUnattended()) {
      if (newType == null) {
        return CollectionUtils.sum$Collection$ToIntFunction(this.getSpecification().getFoodGoodsTypeList(), (gt) => ti.getBonus(gt));
      }
      let newProd = CollectionUtils.toList$Stream(newType.getPossibleProduction(true));
      let food = CollectionUtils.sum$Collection$Predicate$ToIntFunction(newProd, ($p0) => $p0.isFoodType(), ($p0) => $p0.getAmount());
      for (const $it0 = this.getProduction().iterator(); $it0.hasNext(); ) {
        let ag = $it0.next();
        let goodsType = ag.getType();
        if (goodsType.isFoodType()) {
          food = (food - ag.getAmount()) | 0;
        } else if (colony.isConsuming(goodsType)) {
          let change = (-ag.getAmount() + (CollectionUtils.sum$Collection$Predicate$ToIntFunction(newProd, AbstractGoods.matches(goodsType), ($p0) => $p0.getAmount()))) | 0;
          if (change < 0 && ((change + colony.getNetProductionOf(goodsType)) | 0) < 0) {
            return change;
          }
        }
      }
      return food;
    }
    let unit = this.getFirstUnit();
    if (unit == null) {
      return 0;
    }
    let work = this.getCurrentWorkType();
    let unitType = unit.getType();
    return (work == null) ? 0 : (newType == null) ? ti.getBonus(work) : (resource == null) ? (newType.getPotentialProduction(work, unitType) - oldType.getPotentialProduction(work, unitType)) | 0 : (newType.getPotentialProduction(work, unitType) - resource.applyBonus(work, unitType, oldType.getPotentialProduction(work, unitType))) | 0;
  }
  /**
   * Evaluate this work location for a given player.
   *
   * @param player The {@code Player} to evaluate for.
   * @return A value for the player.
   */
  evaluateFor(player: Player): number {
    return (super.evaluateFor(player) + (CollectionUtils.sum$Collection$ToIntFunction(this.getProductionInfo().getProduction(), (ag) => ag.evaluateFor(player)))) | 0;
  }
  /**
   * {@inheritDoc}
   */
  getLocationLabel(): StringTemplate {
    return (this.workTile == null) ? null : this.workTile.getColonyTileLocationLabel(this.getColony());
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
    return this.getColony().getName() + '-' + this.getWorkTile().getType().getSuffix$() + '-' + $J.str(this.getTile$().getDirection(this.getWorkTile()));
  }
  /**
   * {@inheritDoc}
   */
  getNoAddReason(locatable: Locatable): UnitLocation$NoAddReason {
    let reason = super.getNoAddReason(locatable);
    return (reason !== UnitLocation$NoAddReason.NONE) ? reason : this.getNoWorkReason();
  }
  /**
   * {@inheritDoc}
   */
  getUnitCapacity(): number {
    return (this.isColonyCenterTile()) ? 0 : ColonyTile.UNIT_CAPACITY;
  }
  goodSuggestionCheck$UnitType$Unit$GoodsType(unitType: UnitType, unit: Unit, goodsType: GoodsType): boolean {
    let tile = this.getWorkTile();
    let owner = this.getOwner();
    return owner.owns(tile) || owner.canClaimForSettlement(tile);
  }
  /**
   * {@inheritDoc}
   */
  getLabel(): StringTemplate {
    return (this.workTile == null) ? null : this.workTile.getLabel();
  }
  /**
   * {@inheritDoc}
   */
  isAvailable(): boolean {
    return this.isCurrent() || this.getOwner().canClaimForSettlement(this.getWorkTile());
  }
  /**
   * {@inheritDoc}
   */
  isCurrent(): boolean {
    return this.getWorkTile().getOwningSettlement() === this.getColony();
  }
  /**
   * {@inheritDoc}
   */
  getNoWorkReason(): UnitLocation$NoAddReason {
    let tile = this.getWorkTile();
    let claim: Player$NoClaimReason;
    return (this.isColonyCenterTile()) ? UnitLocation$NoAddReason.COLONY_CENTER : (!this.getColony().hasAbility$String(Ability.PRODUCE_IN_WATER) && !tile.isLand()) ? UnitLocation$NoAddReason.MISSING_ABILITY : (tile.getOwningSettlement() === this.getColony()) ? UnitLocation$NoAddReason.NONE : ((claim = this.getOwner().canClaimForSettlementReason(tile)) === Player$NoClaimReason.NONE) ? UnitLocation$NoAddReason.CLAIM_REQUIRED : (claim === Player$NoClaimReason.TERRAIN || claim === Player$NoClaimReason.RUMOUR || claim === Player$NoClaimReason.WATER) ? UnitLocation$NoAddReason.MISSING_ABILITY : (claim === Player$NoClaimReason.SETTLEMENT) ? ((this.getOwner().owns(tile.getSettlement())) ? UnitLocation$NoAddReason.ANOTHER_COLONY : UnitLocation$NoAddReason.OWNED_BY_ENEMY) : (claim === Player$NoClaimReason.OCCUPIED) ? UnitLocation$NoAddReason.OCCUPIED_BY_ENEMY : (claim === Player$NoClaimReason.WORKED) ? UnitLocation$NoAddReason.ANOTHER_COLONY : (claim === Player$NoClaimReason.EUROPEANS) ? UnitLocation$NoAddReason.OWNED_BY_ENEMY : (claim === Player$NoClaimReason.NATIVES) ? UnitLocation$NoAddReason.CLAIM_REQUIRED : UnitLocation$NoAddReason.WRONG_TYPE;
  }
  /**
   * {@inheritDoc}
   */
  getLevel(): number {
    return 0;
  }
  /**
   * {@inheritDoc}
   */
  canAutoProduce(): boolean {
    return this.isColonyCenterTile();
  }
  /**
   * {@inheritDoc}
   */
  canProduce(goodsType: GoodsType, unitType: UnitType): boolean {
    let workTile = this.getWorkTile();
    return workTile != null && workTile.canProduce(goodsType, unitType);
  }
  /**
   * {@inheritDoc}
   */
  getBaseProduction(productionType: ProductionType, goodsType: GoodsType, unitType: UnitType): number {
    let tile = this.getWorkTile();
    return (tile == null) ? 0 : tile.getBaseProduction(productionType, goodsType, unitType);
  }
  /**
   * {@inheritDoc}
   */
  getProductionModifiers(goodsType: GoodsType, unitType: UnitType): Stream<Modifier> {
    return new TileProductionCalculator()._TileProductionCalculator(this.getOwner(), this.getColony().getProductionBonus()).getProductionModifiers(this.getGame().getTurn(), this.workTile, goodsType, unitType);
  }
  /**
   * {@inheritDoc}
   */
  getAvailableProductionTypes(unattended: boolean): List<ProductionType> {
    return (this.workTile == null || this.workTile.getType() == null || unattended !== this.isColonyCenterTile()) ? Collections.emptyList() : this.workTile.getType().getAvailableProductionTypes$boolean(unattended);
  }
  /**
   * {@inheritDoc}
   */
  getCompetenceFactor(): number {
    return 1;
  }
  /**
   * {@inheritDoc}
   */
  getRebelFactor(): number {
    return 1;
  }
  /**
   * {@inheritDoc}
   */
  getClaimTemplate(): StringTemplate {
    return (this.isColonyCenterTile()) ? super.getClaimTemplate() : (StringTemplate.template$String('model.colonyTile.claim').addNamed$String$Named('%direction%', this.getTile$().getDirection(this.workTile)));
  }
  /**
   * {@inheritDoc}
   */
  copyIn<T>(other: T): boolean {
    let o = this.copyInCast(other, $J.cls(ColonyTile));
    if (o == null || !super.copyIn(o)) {
      return false;
    }
    let game = this.getGame();
    this.workTile = game.updateRef$FreeColGameObject(o.getWorkTile());
    return true;
  }
  /**
   * {@inheritDoc}
   */
  getDisplayObject(): FreeColObject {
    return this.getTile$().getDisplayObject();
  }
  /**
   * {@inheritDoc}
   */
  writeAttributes(xw: FreeColXMLWriter): void {
    super.writeAttributes(xw);
    xw.writeAttribute$String$FreeColObject(ColonyTile.WORK_TILE_TAG, this.workTile);
  }
  /**
   * {@inheritDoc}
   */
  readAttributes(xr: FreeColXMLReader): void {
    super.readAttributes(xr);
    this.workTile = xr.makeFreeColObject(this.getGame(), ColonyTile.WORK_TILE_TAG, $J.cls(Tile), true);
  }
  /**
   * {@inheritDoc}
   */
  getXMLTagName(): string {
    return ColonyTile.TAG;
  }
  /**
   * {@inheritDoc}
   */
  toString(): string {
    let sb = new StringBuilder(64);
    let c = this.getColony();
    sb.append(String.fromCharCode(91 /* '[' */)).append(this.getId()).append(String.fromCharCode(32 /* ' ' */)).append($J.str(this.getWorkTile())).append(String.fromCharCode(47 /* \u002f */)).append((c == null) ? 'NO-COLONY' : c.getName()).append(String.fromCharCode(93 /* ']' */));
    return sb.toString();
  }
  static $clinit() {
    ColonyTile.logger = Logger.getLogger($J.cls(ColonyTile).getName());
  }
}

$J.define(ColonyTile, 'net.sf.freecol.common.model.ColonyTile', { kind: 'class', sup: 'net.sf.freecol.common.model.WorkLocation', ctors: { 'net.sf.freecol.common.model.Game,java.lang.String': '_ColonyTile$Game$String', 'net.sf.freecol.common.model.Game,net.sf.freecol.common.model.Colony,net.sf.freecol.common.model.Tile': '_ColonyTile$Game$Colony$Tile' }, returns: { 'getXMLTagName': 'java.lang.String', 'getDisplayObject': 'net.sf.freecol.common.model.FreeColObject', 'getClaimTemplate': 'net.sf.freecol.common.model.StringTemplate', 'getRebelFactor': 'float', 'getCompetenceFactor': 'float', 'getLevel': 'int', 'getNoWorkReason': 'net.sf.freecol.common.model.UnitLocation$NoAddReason', 'isCurrent': 'boolean', 'isAvailable': 'boolean', 'getLabel': 'net.sf.freecol.common.model.StringTemplate', 'getUnitCapacity': 'int', 'getLocationLabel': 'net.sf.freecol.common.model.StringTemplate', 'getBasicProductionInfo': 'net.sf.freecol.common.model.ProductionInfo', 'isOccupied': 'boolean', 'getOccupyingUnit': 'net.sf.freecol.common.model.Unit', 'getWorkTile': 'net.sf.freecol.common.model.Tile', 'isColonyCenterTile': 'boolean' }, meths: { 'goodSuggestionCheck(net.sf.freecol.common.model.UnitType,net.sf.freecol.common.model.Unit,net.sf.freecol.common.model.GoodsType)': 'goodSuggestionCheck$UnitType$Unit$GoodsType' }, clinit: true, lazy: ['logger'] });
$J.module(() => {
  Ability = $J.load('net.sf.freecol.common.model.Ability');
  AbstractGoods = $J.load('net.sf.freecol.common.model.AbstractGoods');
  Player$NoClaimReason = $J.load('net.sf.freecol.common.model.Player$NoClaimReason');
  StringTemplate = $J.load('net.sf.freecol.common.model.StringTemplate');
  Tile = $J.load('net.sf.freecol.common.model.Tile');
  UnitLocation$NoAddReason = $J.load('net.sf.freecol.common.model.UnitLocation$NoAddReason');
  TileProductionCalculator = $J.load('net.sf.freecol.common.model.production.TileProductionCalculator');
  WorkerAssignment = $J.load('net.sf.freecol.common.model.production.WorkerAssignment');
  CollectionUtils = $J.load('net.sf.freecol.common.util.CollectionUtils');
});
