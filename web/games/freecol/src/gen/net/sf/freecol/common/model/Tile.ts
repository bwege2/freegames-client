// @ts-nocheck
// FreeCol 1.2.0 src/net/sf/freecol/common/model/Tile.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
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
import { $J, ArrayList, Collections, Collectors, Comparator, HashMap, IllegalStateException, JFunction, JObject, JString, Level, Logger, NumberFormatException, Stream, StringBuilder } from '../../../../../../jre/index.ts';
import { UnitLocation } from './UnitLocation.ts';

let FreeColXMLReader$ReadScope, FreeColXMLWriter$WriteScope, Ability, AbstractGoods, Colony, Constants, FreeColObject, IndianSettlement, Map_, Modifier, Player, ProductionType, Region, Settlement, StringTemplate, TileImprovement, TileImprovementStyle, TileItem, TileItemContainer, TileType, Unit, Unit$UnitState, TileProductionCalculator, WorkerAssignment, CollectionUtils, RandomUtils;

/**
 * Represents a single tile on the {@code Map}.
 *
 * @see Map
 */
export class Tile extends UnitLocation {
  static logger: Logger = null;
  static readonly TAG: string = 'tile';
  /**
   * Comparator to sort tiles by increasing distance from the edge.
   */
  static edgeDistanceComparator: Comparator<Tile> = null;
  /**
   * Comparator to find the smallest high seas count.
   */
  static highSeasComparator: Comparator<Tile> = null;
  /**
   * Predicate to identify ordinary sea tiles.
   */
  static isSeaTile: Predicate<Tile> = null;
  /**
   * This must be distinct from ColonyTile/Building.UNIT_CHANGE or
   * the colony panel can get confused.
   */
  static readonly UNIT_CHANGE: string = 'TILE_UNIT_CHANGE';
  /**
   * Flag to assign to the high seas count to flag that the high seas
   * connectivity needs recalculation after reading in the map.
   */
  static readonly FLAG_RECALCULATE: number = 2147483647;
  /**
   * Warn about colonies that can not produce this amount of
   * a building material.
   */
  static readonly LOW_PRODUCTION_WARNING_VALUE: number = 4;
  /**
   * The maximum distance that will still be considered "near" when
   * determining the location name.
   *
   * @see #getLocationLabel
   */
  static readonly NEAR_RADIUS: number = 8;
  static readonly OVERLAY_ZINDEX: number = 100;
  static readonly FOREST_ZINDEX: number = 200;
  static readonly RESOURCE_ZINDEX: number = 400;
  static readonly RUMOUR_ZINDEX: number = 500;
  /**
   * The type of the tile.
   * Beware: this may appear to be null in the client when the tile is
   * unexplored.
   */
  type: TileType = null;
  /**
   * The tile coordinates in the enclosing map.
   */
  x_: number = 0;
  /**
   * The tile coordinates in the enclosing map.
   */
  y_: number = 0;
  /**
   * The player that consider this tile to be their land.
   */
  owner: Player = null;
  /**
   * The settlement located on this tile, if any.
   */
  settlement: Settlement = null;
  /**
   * Indicates which settlement owns this tile (null indicates no
   * owner).  A colony owns the tile it is located on, and every
   * tile it has claimed by successfully moving a worker on to it.
   * Native settlements make more extensive and unpredictable claims.
   * Note that while units and settlements are owned by a player, a
   * tile is owned by a settlement.
   */
  owningSettlement: Settlement = null;
  /**
   * Stores all Improvements and Resources (if any).
   */
  tileItemContainer: TileItemContainer = null;
  /**
   * The region this tile is in.
   */
  region: Region = null;
  /**
   * The number of tiles to traverse to get to the high seas.
   */
  highSeasCount: number = 0;
  /**
   * Does this tile have an explicit moveToEurope state.  If null,
   * just use the defaults (usually not, unless water and on map edge),
   * otherwise use the explicit value provided here.
   */
  moveToEurope_: boolean = null;
  /**
   * The style of this Tile, as determined by adjacent tiles.
   */
  style: number = 0;
  /**
   * An artificial contiguous-region number to identify connected
   * parts of the map.  That is, all land tiles with the same
   * contiguity number can be reached by a land unit on any of
   * those tiles in the absence of extra-geographic blockages like
   * settlements and other units.  Similarly for water tiles/naval
   * units.
   *
   * This is used to quickly scope out the sort of paths available
   * to a unit attempting to reach some destination.  It only needs
   * serialization from server to client, as it is set by the
   * TerrainGenerator on map import or creation.
   */
  contiguity: number = 0;
  /**
   * A map of cached tiles for each European player, null in clients.
   */
  cachedTiles: JMap<Player, Tile> = null;
  /**
   * A cache of native settlement internals for each European
   * player, null in clients.
   */
  playerIndianSettlements: JMap<Player, Tile$IndianSettlementInternals> = null;
  static readonly CACHED_TILE_TAG: string = 'cachedTile';
  static readonly CONNECTED_TAG: string = 'connected';
  static readonly CONTIGUITY_TAG: string = 'contiguity';
  static readonly COPIED_TAG: string = 'copied';
  static readonly MOVE_TO_EUROPE_TAG: string = 'moveToEurope';
  static readonly OWNER_TAG: string = 'owner';
  static readonly OWNING_SETTLEMENT_TAG: string = 'owningSettlement';
  static readonly PLAYER_TAG: string = 'player';
  static readonly REGION_TAG: string = 'region';
  static readonly STYLE_TAG: string = 'style';
  static readonly TYPE_TAG: string = 'type';
  static readonly X_TAG: string = 'x';
  static readonly Y_TAG: string = 'y';
  static readonly OLD_PLAYER_EXPLORED_TILE_TAG: string = 'playerExploredTile';
  static readonly OLD_TILE_ITEM_CONTAINER_TAG: string = 'tileitemcontainer';
  $init_Tile() {
    this.highSeasCount = -1;
    this.contiguity = -1;
  }
  /**
   * The main tile constructor.
   *
   * @param game The enclosing {@code Game}.
   * @param type The {@code TileType}.
   * @param locX The x-position of this tile on the map.
   * @param locY The y-position of this tile on the map.
   */
  _Tile$Game$TileType$int$int(game: Game, type$: TileType, locX: number, locY: number): this {
    this._UnitLocation$Game(game);
    this.$init_Tile();
    this.type = type$;
    this.x_ = locX;
    this.y_ = locY;
    this.owningSettlement = null;
    this.settlement = null;
    if (game.isInServer()) {
      this.cachedTiles = new HashMap();
      this.playerIndianSettlements = new HashMap();
    } else {
      this.cachedTiles = null;
      this.playerIndianSettlements = null;
    }
    return this;
  }
  /**
   * Create a new {@code Tile} with the given identifier.
   * The object should later be initialized by calling either
   * {@link #readFromXML(FreeColXMLReader)}.
   *
   * @param game The enclosing {@code Game}.
   * @param id The object identifier.
   */
  _Tile$Game$String(game: Game, id: string): this {
    this._UnitLocation$Game$String(game, id);
    this.$init_Tile();
    if (game.isInServer()) {
      this.cachedTiles = new HashMap();
      this.playerIndianSettlements = new HashMap();
    } else {
      this.cachedTiles = null;
      this.playerIndianSettlements = null;
    }
    return this;
  }
  /**
   * Gets the type of this Tile.
   *
   * @return The {@code TileType}.
   */
  getType(): TileType {
    return this.type;
  }
  /**
   * Sets the type for this Tile.
   *
   * -til: Changes appearance.
   *
   * @param t The new {@code TileType} for this {@code Tile}.
   */
  setType(t: TileType): void {
    this.type = t;
  }
  /**
   * Check if the tile has been explored.
   *
   * @return True if this is an explored {@code Tile}.
   */
  isExplored(): boolean {
    return this.type != null;
  }
  /**
   * Is this a land tile?
   *
   * @return True if this a land {@code Tile}.
   */
  isLand(): boolean {
    return this.type != null && !this.type.isWater();
  }
  /**
   * Is this a forested tile?
   *
   * @return True if this is a forested {@code Tile}.
   */
  isForested(): boolean {
    return this.type != null && this.type.isForested();
  }
  /**
   * Gets the x-coordinate of this tile.
   *
   * @return The x-coordinate of this {@code Tile}.
   */
  getX(): number {
    return this.x_;
  }
  /**
   * Gets the y-coordinate of this tile.
   *
   * @return The y-coordinate of this {@code Tile}.
   */
  getY(): number {
    return this.y_;
  }
  /**
   * Get the map in which this tile belongs.
   *
   * @return The enclosing {@code Map}.
   */
  getMap(): Map_ {
    return this.getGame().getMap();
  }
  /**
   * Gets the settlement on this tile.
   *
   * @return The {@code Settlement} that is located on this
   *     {@code Tile}, or null if none is present.
   * @see #setSettlement
   */
  getSettlement(): Settlement {
    return this.settlement;
  }
  /**
   * Put a settlement onto this tile.  A tile can only have one
   * settlement located on it.  The settlement will also become the
   * owner of this tile.
   *
   * -til: Changes appearance.
   *
   * @param settlement A {@code Settlement} to put on this
   *     {@code Tile}.
   * @see #getSettlement
   */
  setSettlement(settlement: Settlement): void {
    this.settlement = settlement;
  }
  /**
   * Does this tile have a settlement.
   *
   * @return True if there is a settlement present.
   */
  hasSettlement(): boolean {
    return this.settlement != null;
  }
  /**
   * Gets the owning settlement for this tile.
   *
   * @return The {@code Settlement} that owns this {@code Tile}.
   * @see #setOwner
   */
  getOwningSettlement(): Settlement {
    return this.owningSettlement;
  }
  /**
   * Sets the settlement that owns this tile.
   *
   * -til: Changes appearance.
   *
   * @param owner The {@code Settlement} to own this {@code Tile}.
   * @see #getOwner
   */
  setOwningSettlement(owner: Settlement): void {
    this.owningSettlement = owner;
  }
  /**
   * Gets this tiles {@code TileItemContainer}.
   *
   * @return The {@code TileItemContainer}.
   */
  getTileItemContainer(): TileItemContainer {
    return this.tileItemContainer;
  }
  /**
   * Sets the {@code TileItemContainer}.
   *
   * @param newTileItemContainer The new {@code TileItemContainer} value.
   */
  setTileItemContainer(newTileItemContainer: TileItemContainer): void {
    this.tileItemContainer = newTileItemContainer;
  }
  /**
   * Get the completed tile items for this tile.
   *
   * @return A list of completed {@code TileItem}s.
   */
  getCompleteItems(): List<TileItem> {
    return (this.tileItemContainer == null) ? Collections.emptyList() : this.tileItemContainer.getCompleteItems();
  }
  /**
   * Get the tile region.
   *
   * @return The tile {@code Region}.
   */
  getRegion(): Region {
    return this.region;
  }
  /**
   * Set the tile region.
   *
   * -til: Changes appearance.
   *
   * @param newRegion The new {@code Region} value.
   */
  setRegion(newRegion: Region): void {
    this.region = newRegion;
  }
  /**
   * Get the discoverable region of this tile.
   *
   * @return Any discoverable {@code Region}.
   */
  getDiscoverableRegion(): Region {
    return (this.region == null) ? null : this.region.getDiscoverableRegion();
  }
  /**
   * Gets whether this tile is connected to the high seas.
   *
   * @return True if this {@code Tile} is connected to the high seas.
   */
  isHighSeasConnected(): boolean {
    return this.highSeasCount >= 0;
  }
  /**
   * Gets the high seas count.
   *
   * @return The high seas count value.
   */
  getHighSeasCount(): number {
    return this.highSeasCount;
  }
  /**
   * Set the high seas count.
   *
   * @param count The new high seas count value.
   */
  setHighSeasCount(count: number): void {
    this.highSeasCount = count;
  }
  /**
   * Is this a land tile on the sea coast (lakes do not count).
   *
   * @return True if this is a coastland tile.
   */
  isCoastland(): boolean {
    return this.isLand() && this.getHighSeasCount() > 0;
  }
  /**
   * Get the move-to-Europe state of the tile.
   *
   * @return The move-to-Europe state of the {@code Tile}.
   */
  getMoveToEurope(): boolean {
    return this.moveToEurope_;
  }
  /**
   * Set the move-to-Europe state of the tile.
   *
   * @param moveToEurope The new move-to-Europe state for the
   *     {@code Tile}.
   */
  setMoveToEurope(moveToEurope: boolean): void {
    this.moveToEurope_ = moveToEurope;
  }
  /**
   * Can a unit move to the high seas from this tile?
   *
   * @return True if a unit can move to high seas from this tile.
   */
  isDirectlyHighSeasConnected(): boolean {
    return (this.moveToEurope_ != null) ? this.moveToEurope_ : (this.type == null) ? false : this.type.isDirectlyHighSeasConnected();
  }
  /**
   * Is this tile on a river corner?
   *
   * @return True if this is a river corner.
   */
  isRiverCorner(): boolean {
    let tiles = CollectionUtils.transform$Collection$Predicate(this.getSurroundingTiles$int$int(0, 1), ($p0) => $p0.isOnRiver());
    switch (tiles.size()) {
      case 0:
      case 1:
        return false;
      case 2:
        return tiles.get(0).isAdjacent(tiles.get(1));
      case 3:
        return tiles.get(0).isAdjacent(tiles.get(1)) || tiles.get(1).isAdjacent(tiles.get(2)) || tiles.get(2).isAdjacent(tiles.get(0));
      default:
        break;
    }
    return true;
  }
  /**
   * Get the minimum distance in tiles from this tile to the map edge.
   *
   * @return The distance to the edge.
   */
  getEdgeDistance(): number {
    let map = this.getMap();
    let x = this.getX();
    let y = this.getY();
    return Math.min(Math.min(x, (map.getWidth() - x) | 0), Math.min(y, (map.getHeight() - y) | 0));
  }
  /**
   * Get the style value.
   *
   * @return The {@code Tile} style.
   */
  getStyle(): number {
    return this.style;
  }
  /**
   * Set the tile style.
   *
   * -til: Changes appearance.
   *
   * @param newStyle The new style value.
   */
  setStyle(newStyle: number): void {
    this.style = newStyle;
  }
  /**
   * Get the contiguity identifier for this tile.
   *
   * @return A contiguity number.
   */
  getContiguity(): number {
    return this.contiguity;
  }
  /**
   * Sets the contiguity identifier for this tile.
   *
   * @param contiguity A contiguity number.
   */
  setContiguity(contiguity: number): void {
    this.contiguity = contiguity;
  }
  /**
   * Is this tile connected to another across the same contiguous piece
   * of land or water?
   *
   * @param other The other {@code Tile} to check.
   * @return True if the {@code Tile}s are connected.
   */
  isConnectedTo(other: Tile): boolean {
    return this.getContiguity() === other.getContiguity();
  }
  /**
   * Get the adjacent tiles that have a given contiguity.
   *
   * @param contiguity The contiguity to search for.
   * @return A set of {@code Tile}s with the required contiguity.
   */
  getContiguityAdjacent(contiguity: number): JSet<Tile> {
    return CollectionUtils.transform$Collection$Predicate$Function$Collector(this.getSurroundingTiles$int$int(1, 1), CollectionUtils.matchKey$Object$Function(contiguity, ($p0) => $p0.getContiguity()), JFunction.identity(), Collectors.toSet());
  }
  /**
   * Is this tile on or adjacent to a navigable river but not the ocean.
   *
   * @return True if on a navigable river.
   */
  isOnRiver(): boolean {
    let greatRiver = this.getSpecification().getTileType('model.tile.greatRiver');
    let ocean = this.getSpecification().getTileType('model.tile.ocean');
    let ret = this.getType() === greatRiver;
    for (const $it0 = this.getSurroundingTiles$int(1).iterator(); $it0.hasNext(); ) {
      let t = $it0.next();
      if (t.getType() === ocean) {
        return false;
      }
      ret = !!(ret | t.getType() === greatRiver);
    }
    return ret;
  }
  /**
   * Quick test whether this tile is trivially blocked to moves from
   * a unit.  This is a simplification, use getMoveType().isProgress()
   * for the full details.
   *
   * @param unit The {@code Unit} to test.
   * @return True if the unit can not move to this tile.
   */
  isBlocked(unit: Unit): boolean {
    let owner = unit.getOwner();
    let u = this.getFirstUnit();
    if (u != null && !owner.owns(u)) {
      return true;
    }
    if (this.isLand()) {
      let s = this.getSettlement();
      if (unit.isNaval()) {
        return s == null || !owner.owns(s);
      } else {
        return s != null && !owner.owns(s);
      }
    } else {
      return !unit.isNaval();
    }
  }
  /**
   * Gets the {@code IndianSettlementInternals} for the given player.
   *
   * @param player The {@code Player} to query.
   * @return The {@code IndianSettlementInternals} for the given player,
   *     or null if none present.
   */
  getPlayerIndianSettlement(player: Player): Tile$IndianSettlementInternals {
    return (this.playerIndianSettlements == null) ? null : this.playerIndianSettlements.get(player);
  }
  /**
   * Gets a list of {@code TileImprovements}.
   *
   * @return A list of all the {@code TileImprovements}.
   */
  getTileImprovements(): List<TileImprovement> {
    return (this.tileItemContainer == null) ? Collections.emptyList() : this.tileItemContainer.getImprovements$();
  }
  /**
   * Gets a list of completed {@code TileImprovements}.
   *
   * @return A list of all completed {@code TileImprovements}.
   */
  getCompleteTileImprovements(): List<TileImprovement> {
    return (this.tileItemContainer == null) ? Collections.emptyList() : this.tileItemContainer.getCompleteImprovements();
  }
  /**
   * Does this tile contain a completed improvement of the given type?
   *
   * @param type The {@code TileImprovementType} to look for.
   * @return True if there is a completed improvement present.
   */
  hasTileImprovement(type$: TileImprovementType): boolean {
    return (type$.isChangeType()) ? type$.changeContainsTarget(this.getType()) : (this.tileItemContainer == null) ? false : this.tileItemContainer.hasImprovement(type$);
  }
  /**
   * Gets the TileImprovement of a given type, or null if there is no match.
   *
   * @param type The {@code TileImprovementType} to look for.
   * @return The {@code TileImprovement} of the requested type found,
   *     or null if none.
   */
  getTileImprovement(type$: TileImprovementType): TileImprovement {
    return (this.tileItemContainer == null) ? null : this.tileItemContainer.getImprovement(type$);
  }
  /**
   * Does this tile have a LCR?
   *
   * @return True if this {@code Tile} has a
   *     {@code LostCityRumour} on it.
   */
  hasLostCityRumour(): boolean {
    return this.tileItemContainer != null && this.tileItemContainer.getLostCityRumour() != null;
  }
  /**
   * Gets a lost city rumour on this tile.
   *
   * @return The {@code LostCityRumour} on this
   *     {@code Tile}, or null if none found.
   */
  getLostCityRumour(): LostCityRumour {
    return (this.tileItemContainer == null) ? null : this.tileItemContainer.getLostCityRumour();
  }
  /**
   * Does this tile have a resource?
   *
   * @return True if this is a resource {@code Tile}.
   */
  hasResource(): boolean {
    return this.tileItemContainer != null && this.tileItemContainer.getResource() != null;
  }
  /**
   * Does this tile have a river?
   *
   * @return True if this is a river {@code Tile}.
   */
  hasRiver(): boolean {
    return this.getRiver() != null;
  }
  /**
   * Gets the river on this tile.
   *
   * @return A river {@code TileImprovement}, or null if none present.
   */
  getRiver(): TileImprovement {
    return (this.tileItemContainer == null) ? null : this.tileItemContainer.getRiver();
  }
  /**
   * Gets the style of a river improvement on this tile.
   *
   * @return The river {@code TileImprovementStyle}.
   */
  getRiverStyle(): TileImprovementStyle {
    let river: TileImprovement;
    return (this.tileItemContainer == null) ? null : ((river = this.tileItemContainer.getRiver()) == null) ? null : river.getStyle();
  }
  /**
   * Does this tile have a road?
   *
   * @return True if this {@code Tile} has a road.
   */
  hasRoad(): boolean {
    return this.getRoad() != null;
  }
  /**
   * Gets the road on this tile.
   *
   * @return A road {@code TileImprovement}, or null if none present.
   */
  getRoad(): TileImprovement {
    return (this.tileItemContainer == null) ? null : this.tileItemContainer.getRoad();
  }
  /**
   * Adds a tile item to this tile.
   *
   * -til: Changes appearance.
   *
   * @param item The {@code TileItem} to add.
   * @return True if the item was added.
   */
  addTileItem(item: TileItem): boolean {
    if (item == null) {
      return false;
    }
    if (this.tileItemContainer == null) {
      this.tileItemContainer = new TileItemContainer()._TileItemContainer$Game$Tile(this.getGame(), this);
    }
    let added = this.tileItemContainer.tryAddTileItem(item);
    return added != null;
  }
  /**
   * Removes a tile item from this tile.
   *
   * -til: Changes appearance.
   *
   * @param <T> The actual {@code TileItem} type.
   * @param item The {@code TileItem} to remove.
   * @return The item removed, or null on failure.
   */
  removeTileItem<T>(item: T): T {
    if (item == null || this.tileItemContainer == null) {
      return null;
    }
    return this.tileItemContainer.removeTileItem(item);
  }
  /**
   * Adds a lost city rumour to this tile.
   *
   * -til: Changes appearance.
   *
   * @param rumour The {@code LostCityRumour} to add.
   */
  addLostCityRumour(rumour: LostCityRumour): void {
    this.addTileItem(rumour);
  }
  /**
   * Removes the lost city rumour from this {@code Tile} if there
   * is one.
   *
   * -til: Changes appearance.
   *
   * @return The removed {@code LostCityRumour}.
   */
  removeLostCityRumour(): LostCityRumour {
    return this.removeTileItem(this.getLostCityRumour());
  }
  /**
   * Adds a new river to this tile.
   *
   * -til: Changes appearance.
   *
   * @param magnitude The magnitude of the river to be created
   * @param conns The encoded river size/connections.
   * @return The new river added, or null on failure.
   */
  addRiver(magnitude: number, conns: string): TileImprovement {
    if (magnitude === TileImprovement.NO_RIVER) {
      return null;
    }
    let riverType = this.getSpecification().getTileImprovementType('model.improvement.river');
    let river = new TileImprovement()._TileImprovement$Game$Tile$TileImprovementType$TileImprovementStyle(this.getGame(), this, riverType, TileImprovementStyle.getInstance(TileImprovement.EMPTY_RIVER_STYLE));
    river.setTurnsToComplete(0);
    river.setMagnitude(magnitude);
    river.updateRiverConnections(conns);
    return (this.addTileItem(river)) ? this.getRiver() : null;
  }
  /**
   * Removes a river from this tile.
   *
   * -til: Changes appearance.
   */
  removeRiver(): void {
    let river = this.getRiver();
    if (river == null) {
      return;
    }
    river.updateRiverConnections(null);
    this.removeTileItem(river);
  }
  /**
   * Adds a road to this tile.  It is not complete.
   *
   * -til: Changes appearance.
   *
   * @return The new road added, or the existing one.
   */
  addRoad(): TileImprovement {
    let roadType = this.getSpecification().getTileImprovementType('model.improvement.road');
    let road = new TileImprovement()._TileImprovement$Game$Tile$TileImprovementType$TileImprovementStyle(this.getGame(), this, roadType, TileImprovementStyle.getInstance(TileImprovement.EMPTY_ROAD_STYLE));
    road.setMagnitude(1);
    return (this.addTileItem(road)) ? road : null;
  }
  /**
   * Removes a road from this tile.
   *
   * -til: Changes appearance.
   *
   * @return The removed road.
   */
  removeRoad(): TileImprovement {
    let road = this.getRoad();
    if (road == null) {
      return null;
    }
    road.updateRoadConnections(false);
    return this.removeTileItem(road);
  }
  /**
   * Gets the resource on this tile.
   *
   * @return A {@code Resource}, or null if none present.
   */
  getResource(): Resource {
    return (this.tileItemContainer == null) ? null : this.tileItemContainer.getResource();
  }
  /**
   * Adds a resource to this tile.
   *
   * -til: Changes appearance.
   *
   * @param resource The {@code Resource} to add.
   */
  addResource(resource: Resource): void {
    this.addTileItem(resource);
  }
  /**
   * Removes a resource from this tile.
   *
   * -til: Changes appearance.
   *
   * @return The removed {@code Resource}.
   */
  removeResource(): Resource {
    let resource = this.getResource();
    if (resource == null) {
      return null;
    }
    return this.removeTileItem(resource);
  }
  /**
   * Get the number of turns it takes for a non-expert pioneer to build
   * the given {@code TileImprovementType}.
   * It will check if it is valid for this {@code TileType}.
   *
   * @param workType The {@code TileImprovementType} to check.
   * @return The number of turns it should take a non-expert pioneer
   *     to finish the work.
   */
  getWorkAmount(workType: TileImprovementType): number {
    return (workType == null) ? -1 : (this.getTileImprovement(workType) != null) ? -1 : (this.getType().getBasicWorkTurns() + workType.getAddWorkTurns()) | 0;
  }
  /**
   * Check if a given improvement type is valid for this tile.
   *
   * @param type The {@code TileImprovementType} to check.
   * @return True if this tile can be improved with the improvement type.
   */
  isImprovementTypeAllowed(type$: TileImprovementType): boolean {
    let ti: TileImprovement;
    return type$ != null && type$.isTileTypeAllowed(this.getType()) && ((ti = this.getTileImprovement(type$)) == null || !ti.isComplete());
  }
  /**
   * Check if a given improvement is valid for this tile.
   *
   * @param tip The {@code TileImprovement} to check.
   * @return True if this tile can be improved with the improvement.
   */
  isImprovementAllowed(tip: TileImprovement): boolean {
    let type$ = tip.getType();
    if (!this.isImprovementTypeAllowed(type$)) {
      return false;
    }
    let req = type$.getRequiredImprovementType();
    if (req != null && this.getTileImprovement(req) == null) {
      return false;
    }
    let ti = this.getTileImprovement(type$);
    return ti == null || !ti.isComplete();
  }
  /**
   * Gets a weighted list of natural disasters than can strike
   * this tile.  This list comprises all natural disasters that can
   * strike a tile of this type or a completed tile improvement
   * present.
   *
   * @return A stream of {@code Disaster} choices.
   */
  getDisasterChoices(): Stream<RandomChoice<Disaster>> {
    return CollectionUtils.concat(this.type.getDisasterChoices(), [CollectionUtils.flatten$Collection$Function(this.getCompleteTileImprovements(), ($p0) => $p0.getDisasterChoices())]);
  }
  /**
   * Gets a description of the {@code Tile}, with the name of
   * the tile and any improvements on it (road/plow/etc) from
   * {@code TileItemContainer}.
   *
   * @return The description label for this {@code Tile}.
   */
  getLabel(): StringTemplate {
    let label = (this.type != null) ? StringTemplate.key$Named(this.type) : StringTemplate.key$String('unexplored');
    if (this.tileItemContainer != null) {
      let keys = this.tileItemContainer.getCompleteItems();
      if (!keys.isEmpty()) {
        label = StringTemplate.label('/').addNamed$Named(this.type);
        for (const $it1 = keys.iterator(); $it1.hasNext(); ) {
          let key = $it1.next();
          label.addNamed$Named(key);
        }
      }
    }
    return label;
  }
  /**
   * Get a simple label for this tile, with just its coordinates.
   *
   * @return A simple {@code StringTemplate} label.
   */
  getSimpleLabel(): StringTemplate {
    return StringTemplate.template$String('model.tile.simpleLabel').addAmount('%x%', this.getX()).addAmount('%y%', this.getY());
  }
  /**
   * Get a label for a nearby location.
   *
   * @param direction The {@code Direction} from this tile to the
   *     nearby location.
   * @param location A {@code StringTemplate} describing the location.
   * @return A {@code StringTemplate} stating that the location
   *     is nearby.
   */
  getNearLocationLabel(direction: Direction, location: StringTemplate): StringTemplate {
    return StringTemplate.template$String('model.tile.nearLocation').addNamed$String$Named('%direction%', direction).addStringTemplate$String$StringTemplate('%location%', location);
  }
  /**
   * Get a detailed label for this tile.
   *
   * @return A suitable {@code StringTemplate}.
   */
  getDetailedLocationLabel(): StringTemplate {
    let nearSettlement = null;
    for (const $it2 = this.getSurroundingTiles$int(Tile.NEAR_RADIUS).iterator(); $it2.hasNext(); ) {
      let tile = $it2.next();
      nearSettlement = tile.getSettlement();
      if (nearSettlement != null && nearSettlement.getName() != null) {
        let d = Map_.getRoughDirection(tile, this);
        let t = StringTemplate.template$String('model.tile.nameLocation');
        if (d == null) {
          t.addName$String$String('%location%', nearSettlement.getName());
        } else {
          t.addStringTemplate$String$StringTemplate('%location%', this.getNearLocationLabel(d, nearSettlement.getLocationLabel()));
        }
        if (this.type == null) {
          t.add$String$String('%name%', 'unexplored');
        } else {
          t.addNamed$String$Named('%name%', this.type);
        }
        return t;
      }
    }
    return (this.region != null && this.region.getName() != null) ? StringTemplate.template$String('model.tile.nameLocation').addNamed$String$Named('%name%', this.type).addStringTemplate$String$StringTemplate('%location%', this.region.getLabel()) : this.getSimpleLabel();
  }
  /**
   * Get a detailed label for this tile for a given player.
   *
   * @param player The {@code Player} to produce a label for.
   * @return A suitable {@code StringTemplate}.
   */
  getDetailedLocationLabelFor(player: Player): StringTemplate {
    let nearSettlement = null;
    for (const $it3 = this.getSurroundingTiles$int(Tile.NEAR_RADIUS).iterator(); $it3.hasNext(); ) {
      let tile = $it3.next();
      nearSettlement = tile.getSettlement();
      if (nearSettlement != null && nearSettlement.hasContacted(player)) {
        let d = Map_.getRoughDirection(tile, this);
        let t = StringTemplate.template$String('model.tile.nameLocation').addStringTemplate$String$StringTemplate('%location%', (d == null) ? nearSettlement.getLocationLabelFor(player) : this.getNearLocationLabel(d, nearSettlement.getLocationLabelFor(player)));
        if (this.type == null) {
          t.add$String$String('%name%', 'unexplored');
        } else {
          t.addNamed$String$Named('%name%', this.type);
        }
        return t;
      }
    }
    return (this.region != null && this.region.getName() != null) ? StringTemplate.template$String('model.tile.nameLocation').addNamed$String$Named('%name%', this.type).addStringTemplate$String$StringTemplate('%location%', this.region.getLabel()) : this.getSimpleLabel();
  }
  /**
   * Get a label for this tile assuming it is a colony tile of
   * a given colony.
   *
   * @param colony The {@code Colony} assumed to own this tile.
   * @return A suitable {@code StringTemplate}, or null if this
   *     tile is not close enough to the colony to be a colony tile.
   */
  getColonyTileLocationLabel(colony: Colony): StringTemplate {
    let ct = colony.getTile$();
    let t = StringTemplate.template$String('model.tile.nameLocation');
    if (ct === this) {
      t.addStringTemplate$String$StringTemplate('%location%', StringTemplate.key$String('colonyCenter'));
    } else {
      let d = this.getMap().getDirection(ct, this);
      if (d == null) {
        return null;
      }
      t.addNamed$String$Named('%location%', d);
    }
    if (this.type == null) {
      t.add$String$String('%name%', 'unexplored');
    } else {
      t.addNamed$String$Named('%name%', this.type);
    }
    return t;
  }
  /**
   * Gets the distance in tiles between this tile and the specified
   * one.
   *
   * @param tile The {@code Tile} to check the distance to.
   * @return The distance.
   */
  getDistanceTo(tile: Tile): number {
    return this.getMap().getDistance(this, tile);
  }
  /**
   * Gets the direction to a neighbouring tile from this one.
   *
   * @param tile The other {@code Tile}.
   * @return The direction to the other {@code Tile}, or null
   *     if the other tile is not a neighbour.
   */
  getDirection(tile: Tile): Direction {
    return this.getMap().getDirection(this, tile);
  }
  /**
   * Get the neighbouring tile in the given direction.
   *
   * @param direction The {@code Direction} to check in.
   * @return The neighbouring {@code Tile} in the given
   *     {@code Direction}, or null if none present.
   */
  getNeighbourOrNull(direction: Direction): Tile {
    return this.getMap().getAdjacentTile$int$int$Direction(this.x_, this.y_, direction);
  }
  /**
   * Determines whether this tile is adjacent to the specified tile.
   *
   * @param tile A potentially adjacent {@code Tile}.
   * @return True if the {@code Tile} is adjacent to this
   *     {@code Tile}.
   */
  isAdjacent(tile: Tile): boolean {
    return (tile == null) ? false : CollectionUtils.any$Collection$Predicate(this.getSurroundingTiles$int$int(1, 1), CollectionUtils.matchKey$Object(tile));
  }
  /**
   * Is this tile in the polar regions?
   *
   * @return True if the {@code Tile} is polar.
   */
  isPolar(): boolean {
    return this.getMap().isPolar(this);
  }
  /**
   * Is this tile land locked?
   *
   * @return True if land locked.
   */
  isLandLocked(): boolean {
    return (!this.isLand()) ? false : CollectionUtils.all$Collection$Predicate(this.getSurroundingTiles$int$int(1, 1), ($p0) => $p0.isLand());
  }
  /**
   * Is this a shoreline tile?
   *
   * The tile can be water or land, and the water can be ocean,
   * river or an inland lake.  If this is true for a land tile with
   * a colony, the colony can build docks.
   *
   * @return True if this {@code Tile} is on the shore.
   */
  isShore(): boolean {
    return CollectionUtils.any$Collection$Predicate(this.getSurroundingTiles$int$int(1, 1), (t) => t.isLand() !== this.isLand());
  }
  /**
   * Is this a good tile to put hills on?
   *
   * Used by the terrain generator.
   *
   * @return True if this is a good potential hill tile.
   */
  isGoodHillTile(): boolean {
    return this.isLand() && !this.getType().isElevation() && (CollectionUtils.all$Collection$Predicate(this.getSurroundingTiles$int$int(1, 1), ($p0) => $p0.isLand()));
  }
  /**
   * Is this a good tile to put mountains on?
   *
   * Used by the terrain generator.
   *
   * @param mountains The mountain tile type.
   * @return True if this is a good potential elevated tile.
   */
  isGoodMountainTile(): boolean {
    return this.isGoodHillTile() && (CollectionUtils.none$Collection$Predicate(this.getSurroundingTiles$int$int(1, 3), (t) => t.getType().isMountains()));
  }
  /**
   * Is this a good tile to start a river on?
   *
   * Used by the terrain generator.
   *
   * @param riverType The river <code>TileImprovementType</code>.
   * @return True if this is a good place to start a river.
   */
  isGoodRiverTile(riverType: TileImprovementType): boolean {
    return riverType.isTileTypeAllowed(this.getType()) && (CollectionUtils.all$Collection$Predicate(this.getSurroundingTiles$int$int(1, 1), ($p0) => $p0.isLand()));
  }
  /**
   * Gets all the tiles surrounding a tile within the given range.
   * The center tile is not included.
   *
   * @param range How far away do we need to go starting from this.
   * @return The tiles surrounding this {@code Tile}.
   */
  getSurroundingTiles$int(range: number): Iterable<Tile> {
    return this.getMap().getCircleTiles(this, true, range);
  }
  /**
   * Gets all the tiles surrounding this tile within the given
   * inclusive upper and lower bounds.
   *
   * getSurroundingTiles(r) is equivalent to getSurroundingTiles(1, r),
   * thus this tile is included if rangeMin is zero.
   *
   * @param rangeMin The inclusive minimum distance from this
   *     {@code Tile}.
   * @param rangeMax The inclusive maximum distance from this
   *     {@code Tile}.
   * @return A list of the tiles surrounding this {@code Tile}.
   */
  getSurroundingTiles$int$int(rangeMin: number, rangeMax: number): List<Tile> {
    let result = new ArrayList();
    if (rangeMin > rangeMax || rangeMin < 0) {
      return result;
    }
    if (rangeMin === 0) {
      result.add(this);
    }
    if (rangeMax > 0) {
      for (const $it4 = this.getSurroundingTiles$int(rangeMax).iterator(); $it4.hasNext(); ) {
        let t = $it4.next();
        result.add(t);
      }
    }
    if (rangeMin > 1) {
      for (const $it5 = (this.getSurroundingTiles$int((rangeMin - 1) | 0)).iterator(); $it5.hasNext(); ) {
        let t = $it5.next();
        result.remove(t);
      }
    }
    return result;
  }
  /**
   * Determine whether this tile has adjacent tiles that are unexplored.
   *
   * @return True if at least one neighbouring {@code Tile}s is
   *     unexplored.
   */
  hasUnexploredAdjacent(): boolean {
    return !(CollectionUtils.all$Collection$Predicate(this.getSurroundingTiles$int$int(1, 1), ($p0) => $p0.isExplored()));
  }
  /**
   * Get the number of tiles adjacent to this one that are of the same
   * land/water type such as to be nominally accessible to a unit.
   *
   * @return The number of adjacent available tiles.
   */
  getAvailableAdjacentCount(): number {
    return CollectionUtils.count$Collection$Predicate(this.getSurroundingTiles$int$int(1, 1), CollectionUtils.matchKey$Object$Function(this.isLand(), ($p0) => $p0.isLand()));
  }
  /**
   * Get the adjacent colonies.
   *
   * @return A list of adjacent {@code Colony}s.
   */
  getAdjacentColonies(): List<Colony> {
    return CollectionUtils.transform$Collection$Predicate$Function(this.getSurroundingTiles$int$int(0, 1), CollectionUtils.isNotNull$Function(($p0) => $p0.getColony()), ($p0) => $p0.getColony());
  }
  /**
   * Finds the nearest settlement to this tile.
   *
   * @param owner If non-null, the settlement should be owned by this player.
   * @param radius The maximum radius of the search.
   * @param same If true, require the settlement to be on the same land mass.
   * @return The nearest settlement, or null if none.
   */
  getNearestSettlement(owner: Player, radius: number, same: boolean): Settlement {
    if (radius <= 0) {
      radius = Constants.INFINITY;
    }
    let map = this.getMap();
    for (const $it6 = map.getCircleTiles(this, true, radius).iterator(); $it6.hasNext(); ) {
      let t = $it6.next();
      if (t === this || (same && !this.isConnectedTo(t))) {
        continue;
      }
      let settlement = t.getSettlement();
      if (settlement != null && (owner == null || owner.owns(settlement))) {
        return settlement;
      }
    }
    return null;
  }
  /**
   * Finds a safe tile to put a unit on, near to this one.
   * Useful on return from Europe.
   *
   * @param player The owner of the unit to place (may be null).
   * @param random An optional pseudo-random number source.
   * @return A vacant {@code Tile} near this one.
   */
  getSafeTile(player: Player, random: Random): Tile {
    if ((this.getFirstUnit() == null || this.getFirstUnit().getOwner() === player) && (!this.hasSettlement() || this.getSettlement().getOwner() === player)) {
      return this;
    }
    for (let r = 1; true; r++) {
      let tiles = this.getSurroundingTiles$int$int(r, r);
      if (tiles.isEmpty()) {
        return null;
      }
      if (random != null) {
        RandomUtils.randomShuffle(Tile.logger, 'Safe tile', tiles, random);
      }
      for (const $it7 = tiles.iterator(); $it7.hasNext(); ) {
        let t = $it7.next();
        if ((t.getFirstUnit() == null || t.getFirstUnit().getOwner() === player) && (t.getSettlement() == null || t.getSettlement().getOwner() === player)) {
          return t;
        }
      }
    }
  }
  /**
   * Get the defence value for this tile type.
   *
   * @return The defence value.
   */
  getDefenceValue(): number {
    let type$ = this.getType();
    return (type$ == null) ? 0 : FreeColObject.applyModifiers$float$Turn$Collection(1, null, type$.getDefenceModifiers());
  }
  /**
   * Get the defence bonus as a percent.
   *
   * @return The percentage defence bonus.
   */
  getDefenceBonusPercentage(): number {
    return ($J.d2i(this.getType().apply$float$Turn$String(100, this.getGame().getTurn(), Modifier.DEFENCE)) - 100) | 0;
  }
  /**
   * Get a list of surrounding land tiles, sorted with the most
   * defensible first.  Useful when planning an attack.
   *
   * @param player A {@code Player} to use to check for
   *     tile access.
   * @return A list of land {@code Tile}s.
   */
  getSafestSurroundingLandTiles(player: Player): List<Tile> {
    let safeTilePred = (t) => (t.isLand() && (!t.hasSettlement() || player.owns(t.getSettlement())));
    let defenceComp = Comparator.reversed((CollectionUtils.cachingDoubleComparator(($p0) => $p0.getDefenceValue())));
    return CollectionUtils.transform$Collection$Predicate$Function$Comparator(this.getSurroundingTiles$int$int(0, 1), safeTilePred, JFunction.identity(), defenceComp);
  }
  /**
   * Get the adjacent land tile with the best defence bonus.
   * Useful for incoming attackers as a disembark site.
   *
   * @param player A {@code Player} to use to check for
   *     tile access.
   * @return The most defensible adjacent land {@code Tile}.
   */
  getBestDisembarkTile(player: Player): Tile {
    return CollectionUtils.find$Collection$Predicate(this.getSafestSurroundingLandTiles(player), ($p0) => $p0.isHighSeasConnected());
  }
  /**
   * Is this tile dangerous for a naval unit to enter?
   * That is, is there an adjacent settlement that is likely to bombard it.
   *
   * @param ship The naval {@code Unit} to check.
   * @return True if moving the ship to this tile exposes it to attack.
   */
  isDangerousToShip(ship: Unit): boolean {
    let player = ship.getOwner();
    let dangerPred = (t) => {
      let settlement = t.getSettlement();
      return (settlement == null) ? false : !player.owns(settlement) && settlement.canBombardEnemyShip() && (player.atWarWith(settlement.getOwner()) || ship.hasAbility$String(Ability.PIRACY));
    };
    return CollectionUtils.any$Collection$Predicate(this.getSurroundingTiles$int$int(0, 1), dangerPred);
  }
  /**
   * Get any safe sites for a naval transport unit to stop at to disembark
   * a unit to this tile.  To be safe, the tile must be adjacent to this
   * one but not adjacent to a dangerous settlement.
   *
   * @param unit The transport {@code Unit} that needs a anchoring site.
   * @return A list of suitable {@code Tile}s.
   */
  getSafeAnchoringTiles(unit: Unit): List<Tile> {
    return CollectionUtils.transform$Collection$Predicate(this.getSurroundingTiles$int$int(0, 1), (t) => (!t.isLand() && t.isHighSeasConnected() && !t.isDangerousToShip(unit)));
  }
  /**
   * Changes the type of this tile.
   * The map generator et al should just use setType(), whereas this
   * routine should be called for the special case of a change of an
   * existing tile type (e.g. pioneer clearing forest).
   *
   * -til: Changes appearance.
   *
   * @param type The new {@code TileType}.
   */
  changeType(type$: TileType): void {
    this.setType(type$);
    if (this.tileItemContainer != null) {
      this.tileItemContainer.removeIncompatibleImprovements();
    }
    if (!this.isLand()) {
      this.settlement = null;
    }
    this.updateColonyTiles();
  }
  /**
   * Is this tile under active use?
   *
   * @return True if a {@code Colony} is using this {@code Tile}.
   */
  isInUse(): boolean {
    return this.getOwningSettlement() instanceof Colony && (this.getOwningSettlement()).isTileInUse(this);
  }
  /**
   * Changes the owning settlement for this tile.
   *
   * -til: Changes appearance.
   *
   * @param settlement The new owning {@code Settlement} for
   *     this {@code Tile}.
   */
  changeOwningSettlement(settlement: Settlement): void {
    if (this.owningSettlement != null) {
      this.owningSettlement.removeTile(this);
    }
    this.setOwningSettlement(settlement);
    if (settlement != null) {
      settlement.addTile(this);
    }
  }
  /**
   * Change the tile ownership.  Also change the owning settlement
   * as the two are commonly related.
   *
   * -til: Changes appearance.
   *
   * @param player The {@code Player} to own the tile.
   * @param settlement The {@code Settlement} to own the
   *     {@code Tile}.
   */
  changeOwnership(player: Player, settlement: Settlement): void {
    this.setOwner(player);
    this.changeOwningSettlement(settlement);
  }
  /**
   * A colony is proposed to be built on this tile.  Collect
   * warnings if this has disadvantages.
   *
   * @param unit The {@code Unit} which is to build the colony.
   * @return A {@code StringTemplate} containing the warnings,
   *      or null if none.
   */
  getBuildColonyWarnings(unit: Unit): StringTemplate {
    let spec = this.getSpecification();
    let owner = unit.getOwner();
    let landLocked = true;
    let ownedByEuropeans = false;
    let ownedBySelf = false;
    let ownedByIndians = false;
    let typeList = spec.getGoodsTypeList();
    let goodsMap = new HashMap(typeList.size());
    for (const $it8 = typeList.iterator(); $it8.hasNext(); ) {
      let goodsType = $it8.next();
      if (goodsType.isBuildingMaterial()) {
        while (goodsType.isRefined()) {
          goodsType = goodsType.getInputType();
        }
      } else if (!goodsType.isFoodType()) {
        continue;
      }
      goodsMap.put(goodsType, 0);
    }
    for (const $it9 = this.getType().getAvailableProductionTypes$boolean(true).iterator(); $it9.hasNext(); ) {
      let productionType = $it9.next();
      for (const $it10 = productionType.getOutputList().iterator(); $it10.hasNext(); ) {
        let ag = $it10.next();
        let goodsType = ag.getType();
        if (!goodsMap.containsKey(goodsType)) {
          continue;
        }
        let potential = this.getPotentialProduction(goodsType, null);
        let oldPotential = goodsMap.get(goodsType);
        if (oldPotential == null || potential > oldPotential) {
          goodsMap.put(goodsType, potential);
        }
      }
    }
    for (const $it11 = this.getSurroundingTiles$int(1).iterator(); $it11.hasNext(); ) {
      let t = $it11.next();
      if (!t.isLand()) {
        landLocked = false;
      }
      CollectionUtils.forEachMapEntry$Map$Consumer(goodsMap, (e) => e.setValue((e.getValue() + t.getPotentialProduction(e.getKey(), spec.getDefaultUnitType$Player(owner))) | 0));
      let tileOwner = t.getOwner();
      if (owner === tileOwner) {
        if (t.getOwningSettlement() != null) {
          ownedBySelf = true;
        } else {
          for (const $it12 = t.getSurroundingTiles$int(1).iterator(); $it12.hasNext(); ) {
            let ownTile = $it12.next();
            let colony = ownTile.getColony();
            if (colony != null && colony.getOwner() === owner) {
              ownedBySelf = true;
              break;
            }
          }
        }
      } else if (tileOwner != null && tileOwner.isEuropean()) {
        ownedByEuropeans = true;
      } else if (tileOwner != null) {
        ownedByIndians = true;
      }
    }
    let ret = StringTemplate.label('\n');
    if (landLocked) {
      ret.add$String('warning.landLocked');
    }
    let food = CollectionUtils.sum$Collection$Predicate$ToIntFunction(goodsMap.entrySet(), (e) => e.getKey().isFoodType(), ($p0) => $p0.getValue());
    if (food < 8) {
      ret.add$String('warning.noFood');
    }
    let loPred = (e) => !e.getKey().isFoodType() && e.getValue() < Tile.LOW_PRODUCTION_WARNING_VALUE;
    CollectionUtils.forEachMapEntry$Map$Predicate$Consumer(goodsMap, loPred, (e) => ret.addStringTemplate$StringTemplate(StringTemplate.template$String('warning.noBuildingMaterials').addNamed$String$Named('%goods%', e.getKey())));
    if (ownedBySelf) {
      ret.add$String('warning.ownLand');
    }
    if (ownedByEuropeans) {
      ret.add$String('warning.europeanLand');
    }
    if (ownedByIndians) {
      ret.add$String('warning.nativeLand');
    }
    return ret;
  }
  /**
   * Can this tile produce a given goods type?  To produce goods
   * either the tile type must have a suitable production type, or
   * the tile item container contains suitable resource.
   *
   * @param goodsType The {@code GoodsType} to produce.
   * @param unitType An optional {@code UnitType} to use.
   * @return True if the tile can produce the goods.
   */
  canProduce(goodsType: GoodsType, unitType: UnitType): boolean {
    return (this.type != null && this.type.canProduce(goodsType, unitType)) || (this.tileItemContainer != null && this.tileItemContainer.canProduce(goodsType, unitType));
  }
  /**
   * Get the base production exclusive of any bonuses.
   *
   * @param productionType An optional {@code ProductionType} to use,
   *     if null the best available one is used.
   * @param goodsType The {@code GoodsType} to produce.
   * @param unitType An optional {@code UnitType} to use.
   * @return The base production due to tile type and resources.
   */
  getBaseProduction(productionType: ProductionType, goodsType: GoodsType, unitType: UnitType): number {
    if (this.type == null || goodsType == null || !goodsType.isFarmed()) {
      return 0;
    }
    let amount = this.type.getBaseProduction(productionType, goodsType, unitType);
    return (amount < 0) ? 0 : amount;
  }
  /**
   * Get the potential production of this tile for a given goods type
   * and optional worker type.
   *
   * @param goodsType The {@code GoodsType} to check the
   *     potential for.
   * @param unitType An optional {@code UnitType} to do the work.
   * @return The potential production of this {@code Tile} to
   *     produce the given {@code GoodsType}.
   */
  getPotentialProduction(goodsType: GoodsType, unitType: UnitType): number {
    let tpc = new TileProductionCalculator()._TileProductionCalculator(null, 0);
    let productionType = ProductionType.getBestProductionType(goodsType, this.getType().getAvailableProductionTypes$boolean(unitType == null));
    let colonyCenterTile = (unitType == null);
    let pi = tpc.getBasicProductionInfo(this, this.getGame().getTurn(), new WorkerAssignment()._WorkerAssignment(unitType, productionType), colonyCenterTile);
    return pi.getProduction().stream().filter((a) => a.getType().equals(goodsType)).map(($p0) => $p0.getAmount()).findFirst().orElse(0);
  }
  /**
   * Get the production modifiers for this tile.
   *
   * @param goodsType The {@code GoodsType} to produce.
   * @param unitType An optional {@code UnitType} to do the work.
   * @return A stream of production {@code Modifier}s.
   */
  getProductionModifiers(goodsType: GoodsType, unitType: UnitType): Stream<Modifier> {
    return (this.tileItemContainer != null && this.canProduce(goodsType, unitType)) ? this.tileItemContainer.getProductionModifiers(goodsType, unitType) : Stream.empty();
  }
  /**
   * Gets the maximum potential for producing the given type of
   * goods with a given unit if this tile is (perhaps changed to)
   * a given tile type.
   *
   * @param goodsType The {@code GoodsType} to check.
   * @param unitType A {@code UnitType} to do the work.
   * @param tileType A {@code TileType} to change to.
   * @return The maximum potential.
   */
  getMaximumPotential$GoodsType$UnitType$TileType$Tile(goodsType: GoodsType, unitType: UnitType, tileType: TileType): number {
    let potential = Math.fround(tileType.getPotentialProduction(goodsType, unitType));
    if (tileType === this.getType()) {
      let resource = (this.tileItemContainer == null) ? null : this.tileItemContainer.getResource();
      if (resource != null) {
        potential = Math.fround(resource.applyBonus(goodsType, unitType, $J.d2i(potential)));
      }
    }
    let improvements = this.getSpecification().getTileImprovementTypeList();
    if (this.canProduce(goodsType, unitType)) {
      for (const $it13 = (CollectionUtils.transform$Collection$Predicate(improvements, (ti) => (!ti.isNatural() && ti.isTileTypeAllowed(tileType) && ti.getBonus(goodsType) > 0))).iterator(); $it13.hasNext(); ) {
        let ti = $it13.next();
        potential = ti.getProductionModifier(goodsType).applyTo$float(potential);
      }
    }
    return $J.d2i(potential);
  }
  /**
   * Gets the maximum potential for producing the given type of
   * goods.  The maximum potential is the potential of a tile after
   * the tile has been plowed/built road on.
   *
   * @param goodsType The {@code GoodsType} to check.
   * @param unitType A {@code UnitType} to do the work.
   * @return The maximum potential.
   */
  getMaximumPotential$GoodsType$UnitType(goodsType: GoodsType, unitType: UnitType): number {
    let improvements = this.getSpecification().getTileImprovementTypeList();
    let tileTypes = CollectionUtils.transform$Collection$Predicate$Function(improvements, (ti) => !ti.isNatural() && ti.getChange(this.getType()) != null, (ti) => ti.getChange(this.getType()));
    tileTypes.add(0, this.getType());
    return CollectionUtils.max$Collection$ToIntFunction(tileTypes, (tt) => this.getMaximumPotential$GoodsType$UnitType$TileType$Tile(goodsType, unitType, tt));
  }
  /**
   * Sort possible goods types according to potential of autoproduction.
   *
   * @return A list of goods, highest potential production first.
   */
  getSortedAutoPotential(): List<AbstractGoods> {
    return this.getSortedPotential$UnitType$Player$boolean$Tile(null, null, false);
  }
  /**
   * Sort possible goods types according to potential with an expert working the tile.
   *
   * @return A list of goods, highest potential production first.
   */
  getSortedPotential$(): List<AbstractGoods> {
    return this.getSortedPotential$UnitType$Player$boolean$Tile(null, null, true);
  }
  /**
   * Sort possible goods types according to potential.
   *
   * @param unit the {@code Unit} to work on this {@code Tile}
   * @return A list of goods, highest potential production first.
   */
  getSortedPotential$Unit(unit: Unit): List<AbstractGoods> {
    return this.getSortedPotential$UnitType$Player$boolean$Tile(unit.getType(), unit.getOwner(), false);
  }
  /**
   * Sort possible goods types according to potential.
   *
   * @param unitType The {@code UnitType} to do the work.
   * @param owner the {@code Player} owning the unit.
   * @param useExperts Use the best expert for the given goods if
   *      {@code unitType == null}.
   * @return A list of goods, highest potential production first.
   */
  getSortedPotential$UnitType$Player$boolean$Tile(unitType: UnitType, owner: Player, useExperts: boolean): List<AbstractGoods> {
    if (this.getType() == null) {
      return Collections.emptyList();
    }
    let productionMapper = CollectionUtils.cacheInt((gt) => {
      let ut: UnitType;
      if (unitType != null) {
        ut = unitType;
      } else if (useExperts) {
        ut = this.getSpecification().getExpertForProducing(gt);
      } else {
        ut = null;
      }
      return this.getPotentialProduction(gt, ut);
    });
    let productionPred = (gt) => productionMapper(gt) > 0;
    let goodsMapper = (gt) => new AbstractGoods()._AbstractGoods$GoodsType$int(gt, productionMapper(gt));
    let goodsComp = ((owner == null || owner.getMarket() == null) ? AbstractGoods.descendingAmountComparator : owner.getMarket().getSalePriceComparator());
    return CollectionUtils.transform$Collection$Predicate$Function$Comparator(this.getSpecification().getFarmedGoodsTypeList(), productionPred, goodsMapper, goodsComp);
  }
  /**
   * Get the best food type to produce here.
   *
   * @return The {@code AbstractGoods} to produce.
   */
  getBestFoodProduction(): AbstractGoods {
    let goodsComp = Comparator.comparingInt((ag) => this.getPotentialProduction(ag.getType(), null));
    return CollectionUtils.maximize$Stream$Predicate$Comparator(CollectionUtils.flatten$Collection$Function(this.getType().getAvailableProductionTypes$boolean(true), ($p0) => $p0.getOutputs()), ($p0) => $p0.isFoodType(), goodsComp);
  }
  /**
   * Get the best food type to produce here with an appropriate expert.,
   *
   * @return The {@code AbstractGoods} to produce.
   */
  getMaximumPotentialFoodProductionWithExpert(): AbstractGoods {
    return this.getSpecification().getFoodGoodsTypeList().stream().map((goodsType) => new AbstractGoods()._AbstractGoods$GoodsType$int(goodsType, this.getMaximumPotential$GoodsType$UnitType(goodsType, this.getSpecification().getExpertForProducing(goodsType)))).max(Comparator.comparingInt(($p0) => $p0.getAmount())).orElse(null);
  }
  /**
   * Update production after a change to this tile.
   */
  updateColonyTiles(): void {
    let wl = CollectionUtils.find$Stream$Predicate(CollectionUtils.flatten$Stream$Function(this.getGame().getAllColonies(null), ($p0) => $p0.getAvailableWorkLocations()), CollectionUtils.matchKey$Object$Function(this, ($p0) => $p0.getWorkTile()));
    if (wl != null) {
      wl.updateProductionType();
    }
  }
  /**
   * Get the cached tile map.
   *
   * @return The map of cached tiles.
   */
  getCachedTiles(): JMap<Player, Tile> {
    return this.cachedTiles;
  }
  /**
   * Get the cached tile map.
   *
   * @param cachedTiles The new map of cached {@code Tile}s.
   */
  setCachedTiles(cachedTiles: JMap<Player, Tile>): void {
    if (this.cachedTiles != null) {
      this.cachedTiles.clear();
      if (cachedTiles != null) {
        this.cachedTiles.putAll(cachedTiles);
      }
    }
  }
  /**
   * Get a players view of this tile.
   *
   * @param player The {@code Player} who owns the view.
   * @return The view of this {@code Tile}.
   */
  getCachedTile(player: Player): Tile {
    return (this.cachedTiles == null) ? null : (player.isEuropean()) ? this.cachedTiles.get(player) : this;
  }
  /**
   * Set a players view of this tile.
   *
   * @param player The {@code Player} who owns the view.
   * @param tile The view of the {@code Tile} (either this
   *     tile, or an uninterned copy of it).
   */
  setCachedTile(player: Player, tile: Tile): void {
    if (this.cachedTiles == null || !player.isEuropean()) {
      return;
    }
    this.cachedTiles.put(player, tile);
  }
  /**
   * Set the players view of this tile to the tile itself if
   * the player can see it.  Useful when the cache needs to be cleared
   * forcibly such as when a native settlement is removed.
   */
  seeTile$(): void {
    for (const $it14 = (CollectionUtils.transform$Stream$Predicate(this.getGame().getLiveEuropeanPlayers([]), (p) => p.canSee(this))).iterator(); $it14.hasNext(); ) {
      let p = $it14.next();
      this.seeTile$Player(p);
    }
  }
  /**
   * Set a players view of this tile to the tile itself.
   *
   * @param player The {@code Player} who owns the view.
   */
  seeTile$Player(player: Player): void {
    this.setCachedTile(player, this);
  }
  /**
   * Get a copy of this tile suitable for caching (lacking units).
   *
   * @return An uninterned copy of this {@code Tile}.
   */
  getTileToCache(): Tile {
    let tile = this.copy$Game(this.getGame());
    tile.clearUnitList();
    let colony = this.getColony();
    if (colony != null) {
      tile.getColony().setDisplayUnitCount(Math.max(1, colony.getUnitCount()));
    }
    return tile;
  }
  /**
   * A change is about to occur on this tile.  Cache it if unseen.
   */
  cacheUnseen$(): void {
    this.cacheUnseen$Player$Tile$Tile(null, null);
  }
  /**
   * A change is about to occur on this tile.  Cache it if unseen.
   *
   * @param player A {@code Player} that currently may not be able
   *     to see the tile, but will as a result of the change, and so
   *     should not cache it.
   */
  cacheUnseen$Player(player: Player): void {
    this.cacheUnseen$Player$Tile$Tile(player, null);
  }
  /**
   * A change may have occured on this tile.  Establish caches where
   * needed.  Use the copied tile if supplied (which should have
   * been created previously with {@link #getTileToCache},
   *
   * @param copied An optional {@code Tile} to cache.
   */
  cacheUnseen$Tile(copied: Tile): void {
    this.cacheUnseen$Player$Tile$Tile(null, copied);
  }
  /**
   * A change may have occured on this tile.  Establish caches where
   * needed.  Use the copied tile if supplied (which should have
   * been created previously with {@link #getTileToCache}.
   *
   * @param player A {@code Player} that currently may not be able
   *     to see the tile, but will as a result of the change, and so
   *     should not cache it.
   * @param copied An optional {@code Tile} to cache.
   */
  cacheUnseen$Player$Tile$Tile(player: Player, copied: Tile): void {
    if (this.cachedTiles == null) {
      return;
    }
    for (const $it15 = (CollectionUtils.transform$Stream$Predicate(this.getGame().getLiveEuropeanPlayers([player]), (p) => !p.canSee(this) && this.getCachedTile(p) === this)).iterator(); $it15.hasNext(); ) {
      let p = $it15.next();
      if (copied == null) {
        copied = this.getTileToCache();
      }
      this.setCachedTile(p, copied);
    }
  }
  /**
   * Updates the information about the native settlement on this
   * {@code Tile} for the given {@code Player}.
   *
   * @param player The {@code Player}.
   */
  updateIndianSettlement(player: Player): void {
    if (this.playerIndianSettlements == null || !player.isEuropean()) {
      return;
    }
    let isi = this.getPlayerIndianSettlement(player);
    let is$ = this.getIndianSettlement();
    if (is$ == null) {
      if (isi != null) {
        this.removeIndianSettlementInternals(player);
      }
    } else {
      if (isi == null) {
        isi = new Tile$IndianSettlementInternals()._Tile$IndianSettlementInternals();
        this.playerIndianSettlements.put(player, isi);
      }
      isi.update(is$);
    }
  }
  removeIndianSettlementInternals(player: Player): void {
    if (this.playerIndianSettlements == null) {
      return;
    }
    this.playerIndianSettlements.remove(player);
  }
  getLearnableSkill(player: Player): UnitType {
    let isi = this.getPlayerIndianSettlement(player);
    return (isi == null) ? null : isi.skill;
  }
  getWantedGoods(player: Player): List<GoodsType> {
    let isi = this.getPlayerIndianSettlement(player);
    return (isi == null) ? null : isi.wantedGoods;
  }
  /**
   * Set native settlement information.  Do not check the current
   * map state as we might leak destruction information.
   *
   * @param player The {@code Player} to pet belonged to.
   * @param skill The skill taught by the settlement.
   * @param wanted The goods wanted by the settlement.
   */
  setIndianSettlementInternals(player: Player, skill: UnitType, wanted: List<GoodsType>): void {
    let isi = this.getPlayerIndianSettlement(player);
    if (isi == null) {
      isi = new Tile$IndianSettlementInternals()._Tile$IndianSettlementInternals();
      this.playerIndianSettlements.put(player, isi);
    }
    isi.setValues(skill, wanted);
  }
  /**
   * Checks if this {@code Tile} has been explored by the given
   * {@code Player}.
   *
   * If we are in the server, then the presence of a cached tile
   * determines whether exploration has happened.  In the client
   * there are no cached tiles, but if the tile is explored the
   * server will have updated the client with the tile type (checked
   * by isExplored()).
   *
   * @param player The {@code Player}.
   * @return True if this {@code Tile} has been explored
   *     by the given {@code Player}.
   */
  isExploredBy(player: Player): boolean {
    return (!player.isEuropean()) ? true : (!this.isExplored()) ? false : (this.cachedTiles == null) ? true : this.getCachedTile(player) != null;
  }
  /**
   * Explore/unexplore a tile for a player.
   *
   * @param player The {@code Player} that is exploring.
   * @param reveal The exploration state.
   */
  setExplored(player: Player, reveal: boolean): void {
    if (this.cachedTiles == null || !player.isEuropean()) {
      return;
    }
    if (reveal) {
      this.seeTile$Player(player);
    } else {
      this.cachedTiles.remove(player);
    }
  }
  /**
   * Gets the unit that is currently defending this tile.
   * <p>If this tile has a settlement, the units inside the
   * settlement are also considered as potential defenders.
   * <p>As this method is quite expensive, it should not be used to
   * test for the presence of enemy units.
   *
   * @param attacker The {@code Unit} that would be attacking
   *     this {@code Tile}.
   * @return The {@code Unit} that has been chosen to defend this
   *     {@code Tile}.
   */
  getDefendingUnit(attacker: Unit): Unit {
    let cm = this.getGame().getCombatModel();
    let defender = null;
    let defenderPower = -1;
    let power: number;
    for (const $it16 = (CollectionUtils.transform$Stream$Predicate(this.getUnits(), (u) => this.isLand() !== u.isNaval())).iterator(); $it16.hasNext(); ) {
      let u = $it16.next();
      power = cm.getDefencePower$FreeColGameObject$FreeColGameObject(attacker, u);
      if (Unit.betterDefender(defender, defenderPower, u, power)) {
        defender = u;
        defenderPower = power;
      }
    }
    if ((defender == null || !defender.isDefensiveUnit()) && this.hasSettlement()) {
      let u = null;
      try {
        u = this.settlement.getDefendingUnit(attacker);
      } catch ($e17) {
        if ($J.isa($e17, IllegalStateException)) {
          let e = $J.exc($e17);
          Tile.logger.log(Level.WARNING, 'Empty settlement: ' + this.settlement.getName(), e);
        } else {
          throw $e17;
        }
      }
      if (u != null) {
        power = cm.getDefencePower$FreeColGameObject$FreeColGameObject(attacker, u);
        if (Unit.betterDefender(defender, defenderPower, u, power)) {
          defender = u;
        }
      }
    }
    if (defender == null && this.isLand()) {
      defender = this.getFirstUnit();
    }
    return defender;
  }
  /**
   * Gets the unit that is occupying the tile.
   *
   * @return The {@code Unit} that is occupying this {@code Tile}.
   * @see #isOccupied()
   */
  getOccupyingUnit(): Unit {
    let unit = this.getFirstUnit();
    let owner = null;
    if (this.getOwningSettlement() != null) {
      owner = this.getOwningSettlement().getOwner();
    }
    return (owner != null && unit != null && unit.getOwner() !== owner && unit.getOwner().atWarWith(owner)) ? (CollectionUtils.find$Stream$Predicate(this.getUnits(), ($p0) => $p0.isOffensiveUnit())) : null;
  }
  /**
   * Checks whether there is an enemy unit occupying this tile.
   * Units can not produce in occupied tiles.
   *
   * @return True if an enemy unit is occupying this {@code Tile}.
   */
  isOccupied(): boolean {
    return this.getOccupyingUnit() != null;
  }
  /**
   * {@inheritDoc}
   */
  getTile$(): Tile {
    return this;
  }
  /**
   * {@inheritDoc}
   */
  getLocationLabel(): StringTemplate {
    return (this.settlement != null) ? this.settlement.getLocationLabel() : this.getDetailedLocationLabel();
  }
  /**
   * {@inheritDoc}
   */
  getLocationLabelFor(player: Player): StringTemplate {
    return (this.settlement != null) ? this.settlement.getLocationLabelFor(player) : this.getDetailedLocationLabelFor(player);
  }
  /**
   * {@inheritDoc}
   *
   * -til: Changes appearance with TileItems.
   */
  add(locatable: Locatable): boolean {
    if (locatable instanceof TileItem) {
      return this.addTileItem(locatable);
    } else if (locatable instanceof Unit) {
      if (super.add(locatable)) {
        (locatable).setState(Unit$UnitState.ACTIVE);
        return true;
      }
      return false;
    } else {
      return super.add(locatable);
    }
  }
  /**
   * {@inheritDoc}
   *
   * -til: Changes appearance with TileItems.
   */
  remove(locatable: Locatable): boolean {
    if (locatable instanceof TileItem) {
      return this.removeTileItem(locatable) === locatable;
    } else {
      return super.remove(locatable);
    }
  }
  /**
   * {@inheritDoc}
   */
  contains(locatable: Locatable): boolean {
    if (locatable instanceof TileItem) {
      return this.tileItemContainer != null && this.tileItemContainer.contains(locatable);
    } else {
      return super.contains(locatable);
    }
  }
  /**
   * {@inheritDoc}
   */
  canAdd(locatable: Locatable): boolean {
    if (locatable instanceof Unit) {
      return (locatable).isTileAccessible(this);
    } else if (locatable instanceof TileImprovement) {
      return (locatable).getType().isTileTypeAllowed(this.getType());
    } else {
      return false;
    }
  }
  /**
   * {@inheritDoc}
   */
  up(): Location {
    return (this.hasSettlement()) ? this.getSettlement() : this;
  }
  /**
   * {@inheritDoc}
   */
  getRank(): number {
    return (this.getX() + Math.imul(this.getY(), this.getMap().getWidth())) | 0;
  }
  /**
   * {@inheritDoc}
   */
  toShortString(): string {
    let sb = new StringBuilder(16);
    let type$ = this.getType();
    sb.append(String(this.getX())).append(String.fromCharCode(44 /* ',' */)).append(String(this.getY())).append(String.fromCharCode(45 /* '-' */)).append((type$ == null) ? '?' : type$.getSuffix$());
    return sb.toString();
  }
  /**
   * {@inheritDoc}
   */
  getNameKey(): string {
    if (this.getGame().isInClient()) {
      return (this.isExplored()) ? this.getType().getNameKey() : 'unexplored';
    } else {
      let player = this.getGame().getCurrentPlayer();
      if (player != null) {
        return (this.getCachedTile(player) == null) ? 'unexplored' : this.getType().getNameKey();
      } else {
        Tile.logger.warning('player == null');
        return '';
      }
    }
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
   * -til: Changes appearance.
   */
  setOwner(owner: Player): void {
    this.owner = owner;
  }
  /**
   * {@inheritDoc}
   */
  disposeResources(): void {
    if (this.settlement != null) {
      this.settlement.disposeResources();
      this.settlement = null;
    }
    if (this.tileItemContainer != null) {
      this.tileItemContainer.disposeResources();
      this.tileItemContainer = null;
    }
    super.disposeResources();
  }
  /**
   * {@inheritDoc}
   */
  getLinkTarget(player: Player): FreeColGameObject {
    return this;
  }
  /**
   * {@inheritDoc}
   */
  checkIntegrity(fix: boolean, lb: LogBuilder): Constants$IntegrityType {
    let result = super.checkIntegrity(fix, lb);
    let settlement = this.getSettlement();
    if (settlement != null) {
      result = result.combine(settlement.checkIntegrity(fix, lb));
    }
    if (this.tileItemContainer != null) {
      result = result.combine(this.tileItemContainer.checkIntegrity(fix, lb));
    }
    if (this.type == null) {
      lb.add(['\n  Tile has no type: ', this.getId()]);
      result = result.fail();
    } else if (this.isLand() && $J.equals(true, this.moveToEurope_)) {
      lb.add(['\n  Tile is land but has move-to-Europe: ', this.getId()]);
      if (fix) {
        this.moveToEurope_ = false;
        result = result.fix();
      } else {
        result = result.fail();
      }
    }
    return result;
  }
  /**
   * {@inheritDoc}
   */
  getAbilities$String$FreeColSpecObjectType$Turn(id: string, fcgot: FreeColSpecObjectType, turn: Turn): Stream<Ability> {
    return this.getType().getAbilities$String$FreeColSpecObjectType$Turn(id, fcgot, turn);
  }
  /**
   * {@inheritDoc}
   */
  copyIn<T>(other: T): boolean {
    let o = this.copyInCast(other, $J.cls(Tile));
    if (o == null || !super.copyIn(o)) {
      return false;
    }
    let game = this.getGame();
    this.type = o.getType();
    this.x_ = o.getX();
    this.y_ = o.getY();
    this.owner = game.updateRef$FreeColGameObject(o.getOwner());
    this.settlement = game.update$FreeColGameObject$boolean(o.getSettlement(), true);
    let owning = null;
    if (o.getOwningSettlement() != null) {
      owning = game.updateRef$FreeColGameObject(o.getOwningSettlement());
      if (owning == null) {
        owning = game.update$FreeColGameObject$boolean(o.getOwningSettlement(), true);
      }
    }
    this.owningSettlement = owning;
    this.tileItemContainer = game.update$FreeColGameObject$boolean(o.getTileItemContainer(), true);
    this.region = game.updateRef$FreeColGameObject(o.getRegion());
    this.highSeasCount = o.getHighSeasCount();
    this.moveToEurope_ = o.getMoveToEurope();
    this.style = o.getStyle();
    this.contiguity = o.getContiguity();
    this.setCachedTiles(o.getCachedTiles());
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
  toXML$FreeColXMLWriter$String(xw: FreeColXMLWriter, tag: string): void {
    let player = xw.getClientPlayer();
    let tile: Tile;
    if (player == null) {
      this.internalToXML(xw, tag);
    } else if ((tile = this.getCachedTile(player)) != null) {
      tile.internalToXML(xw, tag);
    } else if (this.isExploredBy(player)) {
      this.internalToXML(xw, tag);
    } else {
      xw.writeStartElement(tag);
      xw.writeAttribute(FreeColObject.ID_ATTRIBUTE_TAG, this.getId());
      xw.writeAttribute$String$int(Tile.X_TAG, this.x_);
      xw.writeAttribute$String$int(Tile.Y_TAG, this.y_);
      xw.writeEndElement();
    }
  }
  /**
   * Fundamental (post-cache) version of toXML.
   *
   * @param xw The {@code FreeColXMLWriter} to write to.
   * @param tag The tag to use.
   * @exception XMLStreamException if there are any problems writing
   *     to the stream.
   */
  internalToXML(xw: FreeColXMLWriter, tag: string): void {
    xw.writeStartElement(tag);
    this.writeAttributes(xw);
    this.writeChildren(xw);
    xw.writeEndElement();
  }
  /**
   * {@inheritDoc}
   */
  writeAttributes(xw: FreeColXMLWriter): void {
    super.writeAttributes(xw);
    xw.writeAttribute$String$int(Tile.X_TAG, this.x_);
    xw.writeAttribute$String$int(Tile.Y_TAG, this.y_);
    xw.writeAttribute$String$FreeColObject(Tile.TYPE_TAG, this.type);
    if (this.owner != null) {
      xw.writeAttribute$String$FreeColObject(Tile.OWNER_TAG, this.owner);
    }
    if (this.owningSettlement != null) {
      if (this.owningSettlement.isDisposed() || this.owningSettlement.getId() == null) {
        this.owningSettlement = null;
      } else {
        xw.writeAttribute$String$FreeColObject(Tile.OWNING_SETTLEMENT_TAG, this.owningSettlement);
      }
    }
    xw.writeAttribute$String$int(Tile.STYLE_TAG, this.style);
    if (this.region != null) {
      xw.writeAttribute$String$FreeColObject(Tile.REGION_TAG, this.region);
    }
    if (this.moveToEurope_ != null) {
      xw.writeAttribute$String$boolean(Tile.MOVE_TO_EUROPE_TAG, this.moveToEurope_);
    }
    if (this.highSeasCount >= 0) {
      xw.writeAttribute$String$int(Tile.CONNECTED_TAG, this.highSeasCount);
    }
    if (this.contiguity >= 0) {
      xw.writeAttribute$String$int(Tile.CONTIGUITY_TAG, this.contiguity);
    }
  }
  /**
   * {@inheritDoc}
   */
  writeChildren(xw: FreeColXMLWriter): void {
    let player = xw.getClientPlayer();
    if ((player == null || player.canSee(this)) && (this.settlement == null || xw.validFor(this.settlement.getOwner()))) {
      super.writeChildren(xw);
    }
    if (this.settlement != null) {
      this.settlement.toXML$FreeColXMLWriter(xw);
    }
    if (this.tileItemContainer != null) {
      this.tileItemContainer.toXML$FreeColXMLWriter(xw);
    }
    if (this.cachedTiles != null && xw.validForSave()) {
      for (const $it18 = this.getGame().getLiveEuropeanPlayerList([]).iterator(); $it18.hasNext(); ) {
        let p = $it18.next();
        let t = this.getCachedTile(p);
        if (t == null) {
          continue;
        }
        if (t === this && this.getIndianSettlement() != null) {
          t = this.getTileToCache();
          t.setIndianSettlementInternals(p, this.getLearnableSkill(p), this.getWantedGoods(p));
        }
        xw.writeStartElement(Tile.CACHED_TILE_TAG);
        xw.writeAttribute$String$FreeColObject(Tile.PLAYER_TAG, p);
        xw.writeAttribute$String$boolean(Tile.COPIED_TAG, t !== this);
        if (t !== this) {
          let ws = xw.replaceScope(FreeColXMLWriter$WriteScope.toClient(p));
          try {
            t.internalToXML(xw, Tile.TAG);
          } finally {
            xw.replaceScope(ws);
          }
        }
        xw.writeEndElement();
      }
    }
  }
  /**
   * {@inheritDoc}
   */
  readAttributes(xr: FreeColXMLReader): void {
    super.readAttributes(xr);
    let spec = this.getSpecification();
    let game = this.getGame();
    this.x_ = xr.getAttribute$String$int(Tile.X_TAG, 0);
    this.y_ = xr.getAttribute$String$int(Tile.Y_TAG, 0);
    this.type = xr.getType(spec, Tile.TYPE_TAG, $J.cls(TileType), null);
    if (this.type == null) {
      this.style = 0;
      this.highSeasCount = -1;
      this.owner = null;
      this.region = null;
      this.moveToEurope_ = null;
      this.contiguity = -1;
      this.owningSettlement = null;
      return;
    }
    this.style = xr.getAttribute$String$int(Tile.STYLE_TAG, 0);
    let str = xr.getAttribute$String$String(Tile.CONNECTED_TAG, null);
    if (str == null || (str.length === 0)) {
      this.highSeasCount = -1;
    } else {
      try {
        this.highSeasCount = $J.parseInt(str);
      } catch ($e19) {
        if ($J.isa($e19, NumberFormatException)) {
          let nfe = $J.exc($e19);
          this.highSeasCount = -1;
        } else {
          throw $e19;
        }
      }
    }
    this.owner = xr.findFreeColGameObject(game, Tile.OWNER_TAG, $J.cls(Player), null, false);
    this.region = xr.findFreeColGameObject(game, Tile.REGION_TAG, $J.cls(Region), null, false);
    this.moveToEurope_ = (xr.hasAttribute(Tile.MOVE_TO_EUROPE_TAG)) ? xr.getAttribute$String$boolean(Tile.MOVE_TO_EUROPE_TAG, false) : null;
    this.contiguity = xr.getAttribute$String$int(Tile.CONTIGUITY_TAG, -1);
    let loc = xr.getLocationAttribute(game, Tile.OWNING_SETTLEMENT_TAG, true);
    this.owningSettlement = (loc instanceof Settlement) ? loc : null;
  }
  /**
   * {@inheritDoc}
   */
  readChildren(xr: FreeColXMLReader): void {
    this.settlement = null;
    super.readChildren(xr);
  }
  /**
   * {@inheritDoc}
   */
  readChild(xr: FreeColXMLReader): void {
    let game = this.getGame();
    let tag = xr.getLocalName();
    if ($J.equals(Tile.CACHED_TILE_TAG, tag)) {
      let player = xr.findFreeColGameObject(game, Tile.PLAYER_TAG, $J.cls(Player), null, true);
      let copied = xr.getAttribute$String$boolean(Tile.COPIED_TAG, false);
      if (copied) {
        let rs = xr.replaceScope(FreeColXMLReader$ReadScope.NOINTERN);
        try {
          xr.nextTag();
          xr.expectTag(Tile.TAG);
          let tile = xr.readFreeColObject$Game$Class(game, $J.cls(Tile));
          let colony = tile.getColony();
          let apparent: number;
          if (colony != null && (apparent = colony.getApparentUnitCount()) <= 0) {
            Tile.logger.warning('Copied colony ' + colony.getId() + ' display unit count set to 1 from corrupt: ' + apparent);
            colony.setDisplayUnitCount(1);
          }
          let is$ = tile.getIndianSettlement();
          if (is$ == null) {
            this.removeIndianSettlementInternals(player);
          } else {
            this.setIndianSettlementInternals(player, is$.getLearnableSkill(), is$.getWantedGoods$());
          }
          this.setCachedTile(player, tile);
        } finally {
          xr.replaceScope(rs);
        }
      } else {
        this.setCachedTile(player, this);
      }
      xr.closeTag$String(Tile.CACHED_TILE_TAG);
    } else if ($J.equals(Colony.TAG, tag)) {
      this.settlement = xr.readFreeColObject$Game$Class(game, $J.cls(Colony));
    } else if ($J.equals(IndianSettlement.TAG, tag)) {
      this.settlement = xr.readFreeColObject$Game$Class(game, $J.cls(IndianSettlement));
    } else if ($J.equals(Tile.OLD_PLAYER_EXPLORED_TILE_TAG, tag)) {
      let player = xr.findFreeColGameObject(game, Tile.PLAYER_TAG, $J.cls(Player), null, true);
      xr.swallowTag(Tile.OLD_PLAYER_EXPLORED_TILE_TAG);
      if (player != null) {
        this.setCachedTile(player, this);
      }
    } else if ($J.equals(TileItemContainer.TAG, tag) || $J.equals(Tile.OLD_TILE_ITEM_CONTAINER_TAG, tag)) {
      this.tileItemContainer = xr.readFreeColObject$Game$Class(game, $J.cls(TileItemContainer));
    } else {
      super.readChild(xr);
    }
  }
  /**
   * {@inheritDoc}
   */
  getXMLTagName(): string {
    return Tile.TAG;
  }
  /**
   * {@inheritDoc}
   */
  toString(): string {
    let sb = new StringBuilder(64);
    sb.append(String.fromCharCode(91 /* '[' */)).append(this.getId()).append(String.fromCharCode(32 /* ' ' */)).append((this.type == null) ? 'unknown' : this.type.getSuffix$()).append(String.fromCharCode(32 /* ' ' */)).append(String(this.x_)).append(String.fromCharCode(44 /* ',' */)).append(String(this.y_)).append((!this.hasSettlement()) ? '' : ' ' + this.getSettlement().getName()).append(String.fromCharCode(93 /* ']' */));
    return sb.toString();
  }
  static $clinit() {
    Tile.logger = Logger.getLogger($J.cls(Tile).getName());
    Tile.edgeDistanceComparator = Comparator.comparingInt(($p0) => $p0.getEdgeDistance());
    Tile.highSeasComparator = Comparator.comparingInt(($p0) => $p0.getHighSeasCount());
    Tile.isSeaTile = (t) => !t.isLand() && t.getHighSeasCount() >= 0;
  }
}

/**
 * Information that is internal to the native settlements, and only
 * updated on close contact.
 */
export class Tile$IndianSettlementInternals extends JObject {
  /**
   * The skill taught at the settlement.
   */
  skill: UnitType = null;
  /**
   * The goods the settlement is interested in.
   */
  wantedGoods: List<GoodsType> = null;
  _Tile$IndianSettlementInternals(): this {
    this.skill = null;
    this.wantedGoods = null;
    return this;
  }
  /**
   * Update the internal information from a native settlement.
   *
   * @param is The {@code IndianSettlement} to update.
   */
  update(is$: IndianSettlement): void {
    this.setValues(is$.getLearnableSkill(), is$.getWantedGoods$());
  }
  /**
   * Set the internal values.
   *
   * @param skill The skill taught.
   * @param wanted The wanted goods.
   */
  setValues(skill: UnitType, wanted: List<GoodsType>): void {
    this.skill = skill;
    if (wanted == null) {
      this.wantedGoods = null;
    } else if (this.wantedGoods == null) {
      this.wantedGoods = new ArrayList(wanted);
    } else {
      this.wantedGoods.clear();
      this.wantedGoods.addAll(wanted);
    }
  }
}

$J.define(Tile, 'net.sf.freecol.common.model.Tile', { kind: 'class', ifaces: ['net.sf.freecol.common.model.Named', 'net.sf.freecol.common.model.Ownable'], sup: 'net.sf.freecol.common.model.UnitLocation', ctors: { 'net.sf.freecol.common.model.Game,java.lang.String': '_Tile$Game$String', 'net.sf.freecol.common.model.Game,net.sf.freecol.common.model.TileType,int,int': '_Tile$Game$TileType$int$int' }, returns: { 'getXMLTagName': 'java.lang.String', 'getDisplayObject': 'net.sf.freecol.common.model.FreeColObject', 'getOwner': 'net.sf.freecol.common.model.Player', 'getNameKey': 'java.lang.String', 'getRank': 'int', 'getLocationLabel': 'net.sf.freecol.common.model.StringTemplate', 'getTile$': 'net.sf.freecol.common.model.Tile', 'isOccupied': 'boolean', 'getOccupyingUnit': 'net.sf.freecol.common.model.Unit', 'getTileToCache': 'net.sf.freecol.common.model.Tile', 'getCachedTiles': 'java.util.Map', 'getMaximumPotentialFoodProductionWithExpert': 'net.sf.freecol.common.model.AbstractGoods', 'getBestFoodProduction': 'net.sf.freecol.common.model.AbstractGoods', 'getSortedPotential$': 'java.util.List', 'getSortedAutoPotential': 'java.util.List', 'isInUse': 'boolean', 'getDefenceBonusPercentage': 'int', 'getDefenceValue': 'double', 'getAdjacentColonies': 'java.util.List', 'getAvailableAdjacentCount': 'int', 'hasUnexploredAdjacent': 'boolean', 'isGoodMountainTile': 'boolean', 'isGoodHillTile': 'boolean', 'isShore': 'boolean', 'isLandLocked': 'boolean', 'isPolar': 'boolean', 'getDetailedLocationLabel': 'net.sf.freecol.common.model.StringTemplate', 'getSimpleLabel': 'net.sf.freecol.common.model.StringTemplate', 'getLabel': 'net.sf.freecol.common.model.StringTemplate', 'getDisasterChoices': 'java.util.stream.Stream', 'getResource': 'net.sf.freecol.common.model.Resource', 'getRoad': 'net.sf.freecol.common.model.TileImprovement', 'hasRoad': 'boolean', 'getRiverStyle': 'net.sf.freecol.common.model.TileImprovementStyle', 'getRiver': 'net.sf.freecol.common.model.TileImprovement', 'hasRiver': 'boolean', 'hasResource': 'boolean', 'getLostCityRumour': 'net.sf.freecol.common.model.LostCityRumour', 'hasLostCityRumour': 'boolean', 'getCompleteTileImprovements': 'java.util.List', 'getTileImprovements': 'java.util.List', 'isOnRiver': 'boolean', 'getContiguity': 'int', 'getStyle': 'int', 'getEdgeDistance': 'int', 'isRiverCorner': 'boolean', 'isDirectlyHighSeasConnected': 'boolean', 'getMoveToEurope': 'java.lang.Boolean', 'isCoastland': 'boolean', 'getHighSeasCount': 'int', 'isHighSeasConnected': 'boolean', 'getDiscoverableRegion': 'net.sf.freecol.common.model.Region', 'getRegion': 'net.sf.freecol.common.model.Region', 'getCompleteItems': 'java.util.List', 'getTileItemContainer': 'net.sf.freecol.common.model.TileItemContainer', 'getOwningSettlement': 'net.sf.freecol.common.model.Settlement', 'hasSettlement': 'boolean', 'getSettlement': 'net.sf.freecol.common.model.Settlement', 'getMap': 'net.sf.freecol.common.model.Map', 'getY': 'int', 'getX': 'int', 'isForested': 'boolean', 'isLand': 'boolean', 'isExplored': 'boolean', 'getType': 'net.sf.freecol.common.model.TileType' }, meths: { 'toXML(net.sf.freecol.common.io.FreeColXMLWriter,java.lang.String)': 'toXML$FreeColXMLWriter$String', 'getAbilities(java.lang.String,net.sf.freecol.common.model.FreeColSpecObjectType,net.sf.freecol.common.model.Turn)': 'getAbilities$String$FreeColSpecObjectType$Turn', 'getTile()': 'getTile$', 'cacheUnseen(net.sf.freecol.common.model.Player,net.sf.freecol.common.model.Tile)': 'cacheUnseen$Player$Tile$Tile', 'cacheUnseen(net.sf.freecol.common.model.Tile)': 'cacheUnseen$Tile', 'cacheUnseen(net.sf.freecol.common.model.Player)': 'cacheUnseen$Player', 'cacheUnseen()': 'cacheUnseen$', 'seeTile(net.sf.freecol.common.model.Player)': 'seeTile$Player', 'seeTile()': 'seeTile$', 'getSortedPotential(net.sf.freecol.common.model.UnitType,net.sf.freecol.common.model.Player,boolean)': 'getSortedPotential$UnitType$Player$boolean$Tile', 'getSortedPotential(net.sf.freecol.common.model.Unit)': 'getSortedPotential$Unit', 'getSortedPotential()': 'getSortedPotential$', 'getMaximumPotential(net.sf.freecol.common.model.GoodsType,net.sf.freecol.common.model.UnitType)': 'getMaximumPotential$GoodsType$UnitType', 'getMaximumPotential(net.sf.freecol.common.model.GoodsType,net.sf.freecol.common.model.UnitType,net.sf.freecol.common.model.TileType)': 'getMaximumPotential$GoodsType$UnitType$TileType$Tile', 'getSurroundingTiles(int,int)': 'getSurroundingTiles$int$int', 'getSurroundingTiles(int)': 'getSurroundingTiles$int' }, clinit: true, lazy: ['logger', 'edgeDistanceComparator', 'highSeasComparator', 'isSeaTile'] });
$J.define(Tile$IndianSettlementInternals, 'net.sf.freecol.common.model.Tile$IndianSettlementInternals', { kind: 'class', sup: 'java.lang.Object', ctors: { '': '_Tile$IndianSettlementInternals' } });
$J.module(() => {
  FreeColXMLReader$ReadScope = $J.load('net.sf.freecol.common.io.FreeColXMLReader$ReadScope');
  FreeColXMLWriter$WriteScope = $J.load('net.sf.freecol.common.io.FreeColXMLWriter$WriteScope');
  Ability = $J.load('net.sf.freecol.common.model.Ability');
  AbstractGoods = $J.load('net.sf.freecol.common.model.AbstractGoods');
  Colony = $J.load('net.sf.freecol.common.model.Colony');
  Constants = $J.load('net.sf.freecol.common.model.Constants');
  FreeColObject = $J.load('net.sf.freecol.common.model.FreeColObject');
  IndianSettlement = $J.load('net.sf.freecol.common.model.IndianSettlement');
  Map_ = $J.load('net.sf.freecol.common.model.Map');
  Modifier = $J.load('net.sf.freecol.common.model.Modifier');
  Player = $J.load('net.sf.freecol.common.model.Player');
  ProductionType = $J.load('net.sf.freecol.common.model.ProductionType');
  Region = $J.load('net.sf.freecol.common.model.Region');
  Settlement = $J.load('net.sf.freecol.common.model.Settlement');
  StringTemplate = $J.load('net.sf.freecol.common.model.StringTemplate');
  TileImprovement = $J.load('net.sf.freecol.common.model.TileImprovement');
  TileImprovementStyle = $J.load('net.sf.freecol.common.model.TileImprovementStyle');
  TileItem = $J.load('net.sf.freecol.common.model.TileItem');
  TileItemContainer = $J.load('net.sf.freecol.common.model.TileItemContainer');
  TileType = $J.load('net.sf.freecol.common.model.TileType');
  Unit = $J.load('net.sf.freecol.common.model.Unit');
  Unit$UnitState = $J.load('net.sf.freecol.common.model.Unit$UnitState');
  TileProductionCalculator = $J.load('net.sf.freecol.common.model.production.TileProductionCalculator');
  WorkerAssignment = $J.load('net.sf.freecol.common.model.production.WorkerAssignment');
  CollectionUtils = $J.load('net.sf.freecol.common.util.CollectionUtils');
  RandomUtils = $J.load('net.sf.freecol.common.util.RandomUtils');
});
