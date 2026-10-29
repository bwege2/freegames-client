// @ts-nocheck
// FreeCol 1.2.0 src/net/sf/freecol/common/model/Settlement.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
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
import { $J, ArrayList, Collections, HashSet, Logger, RuntimeException } from '../../../../../../jre/index.ts';
import { GoodsLocation } from './GoodsLocation.ts';

let ImageLibrary, FreeColException, Ability, Constants, FeatureContainer, Goods, Location, Modifier, Player, StringTemplate, Tile, Unit, UnitLocation$NoAddReason, CollectionUtils;

/**
 * The super class of all settlements on the map (that is colonies and
 * indian settlements).
 */
export class Settlement extends GoodsLocation {
  static logger: Logger = null;
  static readonly FOOD_PER_COLONIST: number = 200;
  /**
   * The type of settlement.
   */
  type: SettlementType = null;
  /**
   * The {@code Player} owning this {@code Settlement}.
   */
  owner: Player = null;
  /**
   * The name of the Settlement.
   */
  name: string = null;
  /**
   * The {@code Tile} where this {@code Settlement} is located.
   */
  tile: Tile = null;
  /**
   * The tiles this settlement owns.
   */
  ownedTiles: JSet<Tile> = null;
  /**
   * Contains the abilities and modifiers of this Settlement.
   */
  featureContainer: FeatureContainer = null;
  static readonly NAME_TAG: string = 'name';
  static readonly OWNER_TAG: string = 'owner';
  static readonly SETTLEMENT_TYPE_TAG: string = 'settlementType';
  static readonly TILE_TAG: string = 'tile';
  $init_Settlement() {
    this.type = null;
    this.ownedTiles = new HashSet();
    this.featureContainer = new FeatureContainer()._FeatureContainer();
  }
  /**
   * Create a new {@code Settlement}.
   *
   * @param game The enclosing {@code Game}.
   * @param owner The owning {@code Player}.
   * @param name The settlement name.
   * @param tile The containing {@code Tile}.
   */
  _Settlement$Game$Player$String$Tile(game: Game, owner: Player, name: string, tile: Tile): this {
    this._GoodsLocation$Game(game);
    this.$init_Settlement();
    this.owner = owner;
    this.name = name;
    this.tile = tile;
    this.changeType(owner.getNationType().getSettlementType$boolean(false));
    return this;
  }
  /**
   * Initiates a new {@code Settlement} with the given identifier.
   *
   * The object should be initialized later.
   *
   * @param game The enclosing {@code Game}.
   * @param id The object identifier.
   */
  _Settlement$Game$String(game: Game, id: string): this {
    this._GoodsLocation$Game$String(game, id);
    this.$init_Settlement();
    return this;
  }
  /**
   * Get the type of this settlement.
   *
   * @return The settlement type.
   */
  getType(): SettlementType {
    return this.type;
  }
  /**
   * Set the settlement type.
   *
   * @param newType The new {@code SettlementType}.
   */
  setType(newType: SettlementType): void {
    this.type = newType;
  }
  /**
   * Gets the immigration points.
   *
   * @return The current immigration.
   */
  getImmigration(): number {
    return 0;
  }
  /**
   * Gets the liberty points.
   *
   * @return The current liberty.
   */
  getLiberty(): number {
    return 0;
  }
  /**
   * Is this settlement landlocked?
   *
   * @return True if no adjacent tiles are water.
   */
  isLandLocked(): boolean {
    return this.tile.isLandLocked();
  }
  /**
   * Change the settlement type, setting the consequent features.
   *
   * @param newType The new {@code SettlementType}.
   */
  changeType(newType: SettlementType): void {
    if (this.type != null) {
      this.removeFeatures(this.type);
    }
    this.setType(newType);
    if (newType != null) {
      this.addFeatures(newType);
    }
  }
  /**
   * Is this a national capital?
   *
   * @return True if this is a national capital.
   */
  isCapital(): boolean {
    return this.getType().isCapital();
  }
  setCapital(capital: boolean): void {
    if (this.isCapital() !== capital) {
      this.changeType(this.owner.getNationType().getSettlementType$boolean(capital));
    }
  }
  /**
   * Get the tiles this settlement owns.
   *
   * @return A set of tiles.
   */
  getOwnedTiles(): JSet<Tile> {
    return new HashSet(this.ownedTiles);
  }
  /**
   * Set the owned tiles set.
   *
   * @param ownedTiles The new set of owned {@code Tile}s.
   */
  setOwnedTiles(ownedTiles: Collection<Tile>): void {
    this.ownedTiles.clear();
    this.ownedTiles.addAll(ownedTiles);
  }
  /**
   * Adds a tile to this settlement.
   *
   * We can not clear the settlement owned tiles container when the
   * settlement is read because this is called when the Tile is
   * read, and tiles can appear before and after the settlement in
   * the map definition.  So we just accumulate and defend against
   * duplicates.
   *
   * @param tile The {@code Tile} to add.
   */
  addTile(tile: Tile): void {
    this.ownedTiles.add(tile);
  }
  /**
   * Removes a tile from this settlement.
   *
   * @param tile The {@code Tile} to remove.
   */
  removeTile(tile: Tile): void {
    this.ownedTiles.remove(tile);
  }
  /**
   * Gets the radius of what the {@code Settlement} considers
   * as it's own land.
   *
   * @return Settlement radius
   */
  getRadius(): number {
    return this.getType().getClaimableRadius();
  }
  /**
   * Gets this settlement's line of sight value.
   *
   * @return The line of sight value.
   */
  getLineOfSight(): number {
    return $J.d2i(this.apply$float$Turn$String(Math.fround(this.getType().getVisibleRadius()), this.getGame().getTurn(), Modifier.LINE_OF_SIGHT_BONUS));
  }
  /**
   * Gets an amount of plunder when this settlement is taken.
   *
   * @param attacker The {@code Unit} that takes the settlement.
   * @param random A pseudo-random number source.
   * @return An amount of gold plundered.
   */
  getPlunder(attacker: Unit, random: Random): number {
    let range = this.getPlunderRange(attacker);
    return (range == null) ? 0 : range.getAmount('Plunder ' + this.getName(), random, false);
  }
  /**
   * Get the tiles visible from this settlement.
   *
   * @return A set of visible tiles.
   */
  getVisibleTileSet(): JSet<Tile> {
    let tile = this.getTile$();
    return (tile == null) ? Collections.emptySet() : new HashSet(tile.getSurroundingTiles$int$int(0, this.getLineOfSight()));
  }
  /**
   * Put a prepared settlement onto the map.
   *
   * -vis: Several visibility issues accumulated here.
   * -til: Several tile appearance issues accumulated here.
   *
   * @param maximal If true, also claim all the tiles possible.
   */
  placeSettlement(maximal: boolean): void {
    let tiles: List<Tile>;
    if (maximal) {
      tiles = this.owner.getClaimableTiles(this.tile, this.getRadius());
    } else {
      tiles = new ArrayList();
      tiles.add(this.tile);
    }
    this.tile.setSettlement(this);
    for (const $it0 = tiles.iterator(); $it0.hasNext(); ) {
      let t = $it0.next();
      t.changeOwnership(this.owner, this);
    }
    if (!this.tile.hasRoad()) {
      let road = this.tile.addRoad();
      road.setTurnsToComplete(0);
      road.setVirtual(true);
      road.updateRoadConnections(true);
    }
  }
  /**
   * Remove a settlement from the map.
   *
   * -vis: Visibility reduced when settlement goes away.
   * -til: Several tile appearance issues accumulated here.
   *
   * Several visibility issues accumulated here.
   */
  exciseSettlement(): void {
    let settlementTile = this.getTile$();
    for (const $it1 = this.getOwnedTiles().iterator(); $it1.hasNext(); ) {
      let tile = $it1.next();
      tile.changeOwnership(null, null);
    }
    settlementTile.setSettlement(null);
    settlementTile.changeOwnership(null, null);
    let road = settlementTile.getRoad();
    if (road != null && road.getVirtual()) {
      settlementTile.removeRoad();
    }
  }
  /**
   * Change the owner of this {@code Settlement}.
   *
   * Does not fix up the units!  That is handled in the server.
   *
   * -vis: Changes visibility.
   * -til: Changes tile appearance.
   *
   * @param newOwner The {@code Player} that shall own this
   *            {@code Settlement}.
   * @see #getOwner
   */
  changeOwner(newOwner: Player): void {
    let oldOwner = this.owner;
    if (newOwner.isIndian() !== oldOwner.isIndian()) {
      throw new RuntimeException('Can not transfer settlements between native and European players: ' + $J.str(oldOwner) + ' -> ' + $J.str(newOwner));
    }
    this.getGame().notifyOwnerChanged(this, oldOwner, newOwner);
    this.setOwner(newOwner);
    this.getGame().checkOwners(this, oldOwner);
    for (const $it2 = this.getOwnedTiles().iterator(); $it2.hasNext(); ) {
      let t = $it2.next();
      t.changeOwnership(newOwner, this);
    }
  }
  /**
   * Gets whether this settlement is connected to the high seas.
   * This is more than merely non-landlocked, because the settlement
   * could be on an inland lake.
   *
   * @return True if the settlement is connected to the high seas.
   */
  isConnectedPort(): boolean {
    return CollectionUtils.any$Collection$Predicate(this.getTile$().getSurroundingTiles$int$int(1, 1), (t) => !t.isLand() && t.isHighSeasConnected());
  }
  /**
   * Gets the minimum high seas count of the adjacent high-seas-connected
   * tiles.  This is a measure of how close this settlement is to Europe.
   *
   * @return A high seas count, INFINITY if not connected.
   */
  getHighSeasCount(): number {
    let best = CollectionUtils.minimize$Collection$Predicate$Comparator(this.getTile$().getSurroundingTiles$int$int(1, 1), Tile.isSeaTile, Tile.highSeasComparator);
    return (best == null) ? Constants.INFINITY : best.getHighSeasCount();
  }
  /**
   * Returns the number of goods of a given type used by the settlement
   * each turn.
   *
   * @param goodsType a {@code GoodsType} value
   * @return an {@code int} value
   */
  getConsumptionOf$GoodsType(goodsType: GoodsType): number {
    return Math.max(0, CollectionUtils.sum$Stream$ToIntFunction(this.getUnits(), (u) => u.getType().getConsumptionOf(goodsType)));
  }
  /**
   * Returns the number of goods of all given types used by the
   * settlement each turn.
   *
   * @param goodsTypes {@code GoodsType} values
   * @return an {@code int} value
   */
  getConsumptionOf$List(goodsTypes: List<GoodsType>): number {
    return (goodsTypes == null) ? 0 : CollectionUtils.sum$Collection$ToIntFunction(goodsTypes, (gt) => this.getConsumptionOf$GoodsType(gt));
  }
  /**
   * Gives the food needed to keep all units alive in this Settlement.
   *
   * @return The amount of food eaten in this colony each this turn.
   */
  getFoodConsumption(): number {
    return this.getConsumptionOf$List(this.getSpecification().getFoodGoodsTypeList());
  }
  /**
   * Determines if this settlement can build the given type of
   * equipment.  Unlike priceGoods, this takes goods "reserved" for
   * other purposes into account (e.g. breeding).
   *
   * @param goods A list of {@code AbstractGoods}
   * @return True if the settlement can provide the equipment.
   */
  canProvideGoods(goods: List<AbstractGoods>): boolean {
    return CollectionUtils.all$Collection$Predicate(goods, (ag) => {
      let available = this.getGoodsCount(ag.getType());
      let breedingNumber = ag.getType().getBreedingNumber();
      if (breedingNumber !== Constants.INFINITY) {
        available = (available - breedingNumber) | 0;
      }
      return available >= ag.getAmount();
    });
  }
  /**
   * Gets the storage capacity of this settlement.
   *
   * @return The storage capacity of this settlement.
   * @see #getGoodsCapacity
   */
  getWarehouseCapacity(): number {
    return this.getGoodsCapacity();
  }
  /**
   * Check if colony has the ability to bombard an enemy ship
   * adjacent to it.  Only sea-side colonies can bombard.  Does it
   * have the buildings that give such abilities?
   *
   * @return True if bombarding is allowed.
   */
  canBombardEnemyShip(): boolean {
    return (this.isLandLocked()) ? false : this.hasAbility$String(Ability.BOMBARD_SHIPS);
  }
  /**
   * Can this settlement provide the goods to improve a given unit's
   * role?
   *
   * @param unit The {@code Unit} to check.
   * @return The {@code Role} that this settlement could provide.
   */
  canImproveUnitMilitaryRole(unit: Unit): Role {
    let spec = this.getSpecification();
    let role = unit.getRole();
    let military = spec.getMilitaryRolesList();
    let index = military.indexOf(role);
    if (index >= 0) {
      military = military.subList(0, index);
    }
    return CollectionUtils.find$Stream$Predicate(unit.getAvailableRoles(military), (r) => this.canProvideGoods(unit.getGoodsDifference(r, 1)));
  }
  /**
   * Get all the units present here.  That is, not just the units in the
   * settlement but also the units on the tile.
   *
   * @return A list of {@code Unit}s.
   */
  getAllUnitsList(): List<Unit> {
    let units = this.getUnitList();
    if (units.isEmpty()) {
      return this.getTile$().getUnitList();
    }
    units.addAll(this.getTile$().getUnitList());
    return units;
  }
  /**
   * {@inheritDoc}
   */
  getLinkTarget(player: Player): FreeColGameObject {
    return (player === this.getOwner()) ? this : this.getTile$();
  }
  /**
   * {@inheritDoc}
   */
  getFeatureContainer(): FeatureContainer {
    return this.featureContainer;
  }
  /**
   * {@inheritDoc}
   *
   * -vis: Visibility changes when the settlement is removed.
   */
  disposeResources(): void {
    if (this.owner != null) {
      this.owner.removeSettlement(this);
    }
    super.disposeResources();
  }
  /**
   * Get the name of this {@code Settlement}.
   *
   * @return The settlement name.
   */
  getName(): string {
    return this.name;
  }
  /**
   * Sets the name of this {@code Settlement}.
   *
   * -til: Changes the tile appearance.
   *
   * @param newName The new name.
   */
  setName(newName: string): void {
    this.name = newName;
  }
  /**
   * {@inheritDoc}
   */
  getOwner(): Player {
    return this.owner;
  }
  /**
   * {@inheritDoc}
   *
   * -vis: Changes visibility.
   * -til: Changes tile appearance.
   */
  setOwner(player: Player): void {
    this.owner = player;
  }
  /**
   * {@inheritDoc}
   */
  getTile$(): Tile {
    return this.tile;
  }
  /**
   * {@inheritDoc}
   */
  getLocationLabel(): StringTemplate {
    return StringTemplate.name_(this.getName());
  }
  /**
   * {@inheritDoc}
   */
  getSettlement(): Settlement {
    return this;
  }
  /**
   * {@inheritDoc}
   */
  getRank(): number {
    return Location.rankOf(this.getTile$());
  }
  /**
   * {@inheritDoc}
   */
  getLocationImageKey(): string {
    return ImageLibrary.getSettlementKey(this);
  }
  /**
   * {@inheritDoc}
   */
  getNoAddReason(locatable: Locatable): UnitLocation$NoAddReason {
    if (locatable instanceof Unit) {
      if ((locatable).getOwner() !== this.getOwner()) {
        return UnitLocation$NoAddReason.OWNED_BY_ENEMY;
      }
    } else if (locatable instanceof Goods) {
      return UnitLocation$NoAddReason.NONE;
    }
    return super.getNoAddReason(locatable);
  }
  /**
   * {@inheritDoc}
   */
  priceGoods(goods: List<AbstractGoods>): number {
    let pred = (ag) => this.getGoodsCount(ag.getType()) < ag.getAmount();
    let missing = CollectionUtils.find$Collection$Predicate(goods, pred);
    if (missing != null) {
      throw new FreeColException()._FreeColException$String('Goods missing: ' + $J.str(missing));
    }
    return 0;
  }
  /**
   * {@inheritDoc}
   */
  equipForRole(unit: Unit, role: Role, roleCount: number): boolean {
    if (!unit.roleIsAvailable(role)) {
      return false;
    }
    let req = unit.getGoodsDifference(role, roleCount);
    try {
      this.priceGoods(req);
    } catch ($e3) {
      if ($J.isa($e3, FreeColException)) {
        let fce = $J.exc($e3);
        return false;
      } else {
        throw $e3;
      }
    }
    for (const $it4 = req.iterator(); $it4.hasNext(); ) {
      let ag = $it4.next();
      this.addGoods$GoodsType$int(ag.getType(), -ag.getAmount());
    }
    unit.changeRole(role, roleCount);
    return true;
  }
  /**
   * {@inheritDoc}
   */
  checkIntegrity(fix: boolean, lb: LogBuilder): Constants$IntegrityType {
    let result = super.checkIntegrity(fix, lb);
    let owner = this.getOwner();
    if (owner == null) {
      lb.add(['\n  Settlement without owner: ', this.getId()]);
      result = result.fail();
    }
    return result;
  }
  /**
   * {@inheritDoc}
   */
  copyIn<T>(other: T): boolean {
    let o = this.copyInCast(other, $J.cls(Settlement));
    if (o == null || !super.copyIn(o)) {
      return false;
    }
    let game = this.getGame();
    this.type = o.getType();
    this.owner = game.updateRef$FreeColGameObject(o.getOwner());
    this.name = o.getName();
    this.tile = game.updateRef$FreeColGameObject(o.getTile$());
    this.setOwnedTiles(game.updateRef$Collection(o.getOwnedTiles()));
    this.featureContainer.copy(o.getFeatureContainer());
    if (this.owner != null) {
      this.owner.addSettlement(this);
    }
    return true;
  }
  /**
   * {@inheritDoc}
   */
  writeAttributes(xw: FreeColXMLWriter): void {
    super.writeAttributes(xw);
    xw.writeAttribute$String$FreeColObject(Settlement.OWNER_TAG, this.owner);
    xw.writeAttribute$String$FreeColObject(Settlement.TILE_TAG, this.tile);
    xw.writeAttribute$String$FreeColObject(Settlement.SETTLEMENT_TYPE_TAG, this.getType());
  }
  /**
   * {@inheritDoc}
   */
  writeChildren(xw: FreeColXMLWriter): void {
    if (xw.validFor(this.getOwner())) {
      super.writeChildren(xw);
      for (const $it5 = this.getSortedAbilities().iterator(); $it5.hasNext(); ) {
        let ability = $it5.next();
        if (ability.isIndependent()) {
          ability.toXML$FreeColXMLWriter(xw);
        }
      }
      let turn = this.getGame().getTurn();
      for (const $it6 = this.getSortedModifiers().iterator(); $it6.hasNext(); ) {
        let modifier = $it6.next();
        if (modifier.hasIncrement() && modifier.isOutOfDate(turn)) {
          continue;
        }
        if (modifier.isIndependent()) {
          modifier.toXML$FreeColXMLWriter(xw);
        }
      }
    }
  }
  /**
   * {@inheritDoc}
   */
  readAttributes(xr: FreeColXMLReader): void {
    super.readAttributes(xr);
    let game = this.getGame();
    this.name = xr.getAttribute$String$String(Settlement.NAME_TAG, null);
    let oldOwner = this.owner;
    this.owner = xr.findFreeColGameObject(game, Settlement.OWNER_TAG, $J.cls(Player), null, true);
    this.tile = xr.findFreeColGameObject(game, Settlement.TILE_TAG, $J.cls(Tile), null, true);
    let newType = xr.getAttribute$String$String(Settlement.SETTLEMENT_TYPE_TAG, null);
    this.type = this.owner.getNationType().getSettlementType$String(newType);
    if (xr.shouldIntern()) {
      game.checkOwners(this, oldOwner);
    }
  }
  /**
   * {@inheritDoc}
   */
  readChildren(xr: FreeColXMLReader): void {
    this.featureContainer.clear();
    super.readChildren(xr);
    this.addFeatures(this.type);
  }
  /**
   * {@inheritDoc}
   */
  readChild(xr: FreeColXMLReader): void {
    let spec = this.getSpecification();
    let tag = xr.getLocalName();
    if ($J.equals(Ability.TAG, tag)) {
      let ability = new Ability()._Ability$FreeColXMLReader$Specification(xr, spec);
      if (ability.isIndependent()) {
        this.addAbility(ability);
      }
    } else if ($J.equals(Modifier.TAG, tag)) {
      let modifier = new Modifier()._Modifier$FreeColXMLReader$Specification(xr, spec);
      if (modifier.isIndependent()) {
        this.addModifier(modifier);
      }
    } else {
      super.readChild(xr);
    }
  }
  static $clinit() {
    Settlement.logger = Logger.getLogger($J.cls(Settlement).getName());
  }
}

$J.define(Settlement, 'net.sf.freecol.common.model.Settlement', { kind: 'class', ifaces: ['net.sf.freecol.common.model.Nameable', 'net.sf.freecol.common.model.Ownable'], sup: 'net.sf.freecol.common.model.GoodsLocation', ctors: { 'net.sf.freecol.common.model.Game,java.lang.String': '_Settlement$Game$String', 'net.sf.freecol.common.model.Game,net.sf.freecol.common.model.Player,java.lang.String,net.sf.freecol.common.model.Tile': '_Settlement$Game$Player$String$Tile' }, returns: { 'getUpkeep': 'int', 'getSonsOfLiberty': 'int', 'isBadlyDefended': 'boolean', 'getDefenceRatio': 'double', 'getLocationImageKey': 'java.lang.String', 'getRank': 'int', 'getSettlement': 'net.sf.freecol.common.model.Settlement', 'getLocationLabel': 'net.sf.freecol.common.model.StringTemplate', 'getTile$': 'net.sf.freecol.common.model.Tile', 'getOwner': 'net.sf.freecol.common.model.Player', 'getName': 'java.lang.String', 'getFeatureContainer': 'net.sf.freecol.common.model.FeatureContainer', 'getAllUnitsList': 'java.util.List', 'getWarehouseCapacity': 'int', 'getFoodConsumption': 'int', 'getHighSeasCount': 'int', 'isConnectedPort': 'boolean', 'getVisibleTileSet': 'java.util.Set', 'getLineOfSight': 'int', 'getRadius': 'int', 'getOwnedTiles': 'java.util.Set', 'isCapital': 'boolean', 'isLandLocked': 'boolean', 'getLiberty': 'int', 'getImmigration': 'int', 'getType': 'net.sf.freecol.common.model.SettlementType' }, meths: { 'getTile()': 'getTile$', 'getConsumptionOf(java.util.List)': 'getConsumptionOf$List', 'getConsumptionOf(net.sf.freecol.common.model.GoodsType)': 'getConsumptionOf$GoodsType' }, clinit: true, lazy: ['logger'] });
$J.module(() => {
  ImageLibrary = $J.load('net.sf.freecol.client.gui.ImageLibrary');
  FreeColException = $J.load('net.sf.freecol.common.FreeColException');
  Ability = $J.load('net.sf.freecol.common.model.Ability');
  Constants = $J.load('net.sf.freecol.common.model.Constants');
  FeatureContainer = $J.load('net.sf.freecol.common.model.FeatureContainer');
  Goods = $J.load('net.sf.freecol.common.model.Goods');
  Location = $J.load('net.sf.freecol.common.model.Location');
  Modifier = $J.load('net.sf.freecol.common.model.Modifier');
  Player = $J.load('net.sf.freecol.common.model.Player');
  StringTemplate = $J.load('net.sf.freecol.common.model.StringTemplate');
  Tile = $J.load('net.sf.freecol.common.model.Tile');
  Unit = $J.load('net.sf.freecol.common.model.Unit');
  UnitLocation$NoAddReason = $J.load('net.sf.freecol.common.model.UnitLocation$NoAddReason');
  CollectionUtils = $J.load('net.sf.freecol.common.util.CollectionUtils');
});
