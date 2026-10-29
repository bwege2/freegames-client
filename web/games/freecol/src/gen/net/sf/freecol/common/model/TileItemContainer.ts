// @ts-nocheck
// FreeCol 1.2.0 src/net/sf/freecol/common/model/TileItemContainer.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
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
import { $J, ArrayList, Logger, RuntimeException, StringBuilder } from '../../../../../../jre/index.ts';
import { FreeColGameObject } from './FreeColGameObject.ts';

let Constants, LostCityRumour, Map$Layer, Resource, Tile, TileImprovement, CollectionUtils;

/**
 * Contains {@code TileItem}s and can be used by a {@link Tile}
 * to make certain tasks easier.
 */
export class TileItemContainer extends FreeColGameObject {
  static logger: Logger = null;
  static readonly TAG: string = 'tileItemContainer';
  /**
   * The tile owner for which this is the container.
   */
  tile: Tile = null;
  /**
   * All tile items, sorted by zIndex.
   */
  tileItems: List<TileItem> = null;
  static readonly TILE_TAG: string = 'tile';
  static readonly OLD_TILE_IMPROVEMENT_TAG: string = 'tileimprovement';
  $init_TileItemContainer() {
    this.tileItems = new ArrayList();
  }
  /**
   * Create an empty {@code TileItemContainer}.
   *
   * @param game The enclosing {@code Game}.
   * @param tile The {@code Tile} this {@code TileItemContainer}
   *     contains {@code TileItems} for.
   */
  _TileItemContainer$Game$Tile(game: Game, tile: Tile): this {
    this._FreeColGameObject$Game(game);
    this.$init_TileItemContainer();
    if (tile == null) {
      throw new RuntimeException('Tile must not be null: ' + $J.str(this));
    }
    this.tile = tile;
    return this;
  }
  /**
   * Create a new {@code TileItemContainer}.
   *
   * @param game The enclosing {@code Game}.
   * @param id The object identifier.
   */
  _TileItemContainer$Game$String(game: Game, id: string): this {
    this._FreeColGameObject$Game$String(game, id);
    this.$init_TileItemContainer();
    return this;
  }
  /**
   * Get the tile this container belongs to.
   *
   * @return The owning {@code Tile}.
   */
  getTile(): Tile {
    return this.tile;
  }
  /**
   * Invalidate the production cache of the owning colony if any
   * but only if the tile is actually being used.
   */
  invalidateCache(): void {
    let colony = this.tile.getColony();
    if (colony != null && colony.isTileInUse(this.tile)) {
      colony.invalidateCache();
    }
  }
  /**
   * Get a copy of the tile items list.
   *
   * @return A copy of the {@code TileItem}s.
   */
  getTileItems(): List<TileItem> {
    {
      return new ArrayList(this.tileItems);
    }
  }
  /**
   * Clear the tile items list.
   */
  clearTileItems(): void {
    {
      this.tileItems.clear();
    }
  }
  /**
   * Set the tile items.
   *
   * @param newTileItems The new tile items list.
   */
  setTileItems(newTileItems: List<TileItem>): void {
    this.clearTileItems();
    if (newTileItems != null) {
      {
        this.tileItems.addAll(newTileItems);
      }
    }
    this.invalidateCache();
  }
  /**
   * Add a tile item to this container.
   *
   * @param item The {@code TileItem} to add.
   */
  addTileItem(item: TileItem): void {
    let zIndex = item.getZIndex();
    let i = 0;
    {
      for (const $it0 = this.tileItems.iterator(); $it0.hasNext(); ) {
        let ti = $it0.next();
        if (ti.getZIndex() < zIndex) {
          break;
        }
        i++;
      }
      this.tileItems.add(i, item);
    }
  }
  /**
   * Try to add a {@code TileItem} to this container.
   *
   * @param item The {@code TileItem} to add to this container.
   * @return The added {@code TileItem} or the existing
   *     {@code TileItem} if of higher magnitude, or null on error.
   */
  tryAddTileItem(item: TileItem): TileItem {
    if (item == null) {
      return null;
    }
    if (item instanceof TileImprovement) {
      let newTip = item;
      for (const $it1 = this.getTileItems().iterator(); $it1.hasNext(); ) {
        let oldItem = $it1.next();
        if (!(oldItem instanceof TileImprovement)) {
          continue;
        }
        let oldTip = oldItem;
        if ($J.equals(oldTip.getType().getId(), newTip.getType().getId())) {
          if (oldTip.getMagnitude() < newTip.getMagnitude()) {
            oldTip.setMagnitude(newTip.getMagnitude());
            oldTip.setStyle(newTip.getStyle());
            oldTip.setVirtual(newTip.getVirtual());
            this.invalidateCache();
          }
          return oldItem;
        } else if (oldItem.getZIndex() > item.getZIndex()) {
          break;
        }
      }
    }
    this.addTileItem(item);
    this.invalidateCache();
    return item;
  }
  /**
   * Removes a {@code TileItem} from this container.
   *
   * @param <T> The actual {@code TileItem} type.
   * @param item The {@code TileItem} to remove from this container.
   * @return The {@code TileItem} that has been removed from
   *     this container (if any).
   */
  removeTileItem<T>(item: T): T {
    let removed: boolean;
    {
      removed = this.tileItems.remove(item);
    }
    if (removed) {
      item.setLocation(null);
      this.invalidateCache();
      return item;
    }
    return null;
  }
  /**
   * Removes all tile items of a given class.
   *
   * @param <T> The actual {@code TileItem} type.
   * @param c The {@code Class} to remove.
   */
  removeAll<T>(c: JClass<T>): void {
    {
      CollectionUtils.removeInPlace$Collection$Predicate(this.tileItems, (ti) => c.isInstance(ti));
    }
  }
  /**
   * Get the completed tile items.
   *
   * @return A list of complete {@code TileItem}s.
   */
  getCompleteItems(): List<TileItem> {
    return CollectionUtils.transform$Collection$Predicate(this.getTileItems(), ($p0) => $p0.isComplete());
  }
  /**
   * Gets the tile improvement of the given type if any.
   *
   * @param type The {@code TileImprovementType} to look for.
   * @return The {@code TileImprovement} of the given type if
   *     present, otherwise null.
   */
  getImprovement(type$: TileImprovementType): TileImprovement {
    {
      return CollectionUtils.find$Collection$Predicate(this.tileItems, (ti) => (ti instanceof TileImprovement && (ti).getType() === type$));
    }
  }
  /**
   * Gets a list of the {@code TileImprovement}s in this
   * {@code TileItemContainer}.
   *
   * @param completedOnly If true select only the completed improvements.
   * @return A list of {@code TileImprovement}s.
   */
  getImprovements$boolean$TileItemContainer(completedOnly: boolean): List<TileImprovement> {
    {
      return CollectionUtils.transform$Collection$Predicate$Function(this.tileItems, (ti) => ti instanceof TileImprovement && (!completedOnly || (ti).isComplete()), (ti) => ti);
    }
  }
  /**
   * Gets a list of the {@code TileImprovement}s in this
   * {@code TileItemContainer}.
   *
   * @return A list of {@code TileImprovement}s.
   */
  getImprovements$(): List<TileImprovement> {
    return this.getImprovements$boolean$TileItemContainer(false);
  }
  /**
   * Gets a list of the completed {@code TileImprovement}s in
   * this {@code TileItemContainer}.
   *
   * @return A list of {@code TileImprovement}s.
   */
  getCompleteImprovements(): List<TileImprovement> {
    return this.getImprovements$boolean$TileItemContainer(true);
  }
  /**
   * Find a tile item matching a predicate.
   *
   * @param pred The {@code Predicate} to match.
   * @return The {@code TileItem} found, or null if none present.
   */
  findTileItem(pred: Predicate<TileItem>): TileItem {
    {
      return CollectionUtils.find$Collection$Predicate(this.tileItems, pred);
    }
  }
  /**
   * Gets any lost city rumour in this container.
   *
   * @return A {@code LostCityRumour} item if any, or null if
   *     not found.
   */
  getLostCityRumour(): LostCityRumour {
    return this.findTileItem((ti) => ti instanceof LostCityRumour);
  }
  /**
   * Gets any resource item.
   *
   * @return A {@code Resource} item, or null is none found.
   */
  getResource(): Resource {
    return this.findTileItem((ti) => ti instanceof Resource);
  }
  /**
   * Gets any road improvement in this container.
   *
   * @return A road {@code TileImprovement} if any, or null if
   *     not found.
   */
  getRoad(): TileImprovement {
    return this.findTileItem((ti) => ti instanceof TileImprovement && (ti).isRoad());
  }
  /**
   * Gets any river improvement in this container.
   *
   * @return A river {@code TileImprovement} if any, or null if
   *     not found.
   */
  getRiver(): TileImprovement {
    return this.findTileItem((ti) => ti instanceof TileImprovement && (ti).isRiver());
  }
  /**
   * Check whether this tile has a completed improvement of the given
   * type.
   *
   * @param type The {@code TileImprovementType} to check for.
   * @return Whether the tile has the improvement and the improvement is
   *     completed.
   */
  hasImprovement(type$: TileImprovementType): boolean {
    let improvement = this.getImprovement(type$);
    return improvement != null && improvement.isComplete();
  }
  /**
   * Remove improvements incompatible with the given TileType.  This
   * method is called whenever the type of the container's tile
   * changes, i.e. due to clearing.
   */
  removeIncompatibleImprovements(): void {
    let tileType = this.tile.getType();
    let removed = false;
    {
      let river = this.getRiver();
      if (river != null && !river.isTileTypeAllowed(tileType) && !tileType.isWater()) {
        river.updateRiverConnections(null);
      }
      removed = CollectionUtils.removeInPlace$Collection$Predicate(this.tileItems, (ti) => !ti.isTileTypeAllowed(tileType));
    }
    if (removed) {
      this.invalidateCache();
    }
  }
  /**
   * Determine the total bonus for a goods type.  Checks resources
   * and all improvements, unless onlyNatural is true, in which case
   * only natural improvements will be considered.
   *
   * This is not used for normal production, but is necessary to
   * calculate colony center tile secondary production, which does
   * not profit from artificial improvements such as plowing.  It is
   * also used to assess which goods are likely to be most
   * productive on a tile.
   *
   * @param goodsType The {@code GoodsType} to check.
   * @param unitType The {@code UnitType} to check.
   * @param potential The base potential production.
   * @param onlyNatural Only allow natural improvements.
   * @return The resulting production.
   */
  getTotalBonusPotential(goodsType: GoodsType, unitType: UnitType, potential: number, onlyNatural: boolean): number {
    let result = potential;
    for (const $it2 = (CollectionUtils.transform$Collection$Predicate(this.getTileItems(), (ti) => !onlyNatural || ti.isNatural())).iterator(); $it2.hasNext(); ) {
      let item = $it2.next();
      result = item.applyBonus(goodsType, unitType, result);
    }
    return result;
  }
  /**
   * Gets the production modifiers for the given type of goods and unit.
   *
   * @param goodsType The {@code GoodsType} to produce.
   * @param unitType The optional {@code unitType} to produce them.
   * @return A stream of the applicable {@code Modifier}s.
   */
  getProductionModifiers(goodsType: GoodsType, unitType: UnitType): Stream<Modifier> {
    {
      return CollectionUtils.flatten$Collection$Function(this.tileItems, (ti) => ti.getProductionModifiers(goodsType, unitType));
    }
  }
  /**
   * Does this container contain an item that allows the tile to
   * produce a goods type?
   *
   * @param goodsType The {@code GoodsType} to produce.
   * @param unitType The optional {@code unitType} to produce with.
   * @return True if this container allows the goods type to be produced.
   */
  canProduce(goodsType: GoodsType, unitType: UnitType): boolean {
    {
      return CollectionUtils.any$Collection$Predicate(this.tileItems, (ti) => ti.canProduce(goodsType, unitType));
    }
  }
  /**
   * Determine the movement cost to this {@code Tile} from
   * another {@code Tile}.
   * Does not consider special unit abilities.
   *
   * @param fromTile The {@code Tile} to move from.
   * @param targetTile The {@code Tile} to move to.
   * @param basicMoveCost The basic cost.
   * @return The movement cost.
   */
  getMoveCost(fromTile: Tile, targetTile: Tile, basicMoveCost: number): number {
    let moveCost = basicMoveCost;
    for (const $it3 = (CollectionUtils.transform$Collection$Predicate(this.getTileItems(), (ti) => (ti instanceof TileImprovement && (ti).isComplete()))).iterator(); $it3.hasNext(); ) {
      let item = $it3.next();
      let direction = targetTile.getDirection(fromTile);
      if (direction == null) {
        return Constants.INFINITY;
      }
      moveCost = Math.min(moveCost, (item).getMoveCost(direction, moveCost));
    }
    return moveCost;
  }
  /**
   * Copy the tile items from another {@code TileItemContainer},
   * observing a layer maximum.
   *
   * Note that some types need to be looked up in the spec as the tic
   * parameter might be an import from a different game.
   *
   * @param tic The {@code TileItemContainer} to copy from.
   * @param layer The maximum {@code Layer} to import from.
   */
  copyFrom(tic: TileItemContainer, layer: Map$Layer): void {
    let spec = this.getSpecification();
    let game = this.getGame();
    let otherItems = tic.getTileItems();
    let result = new ArrayList();
    for (const $it4 = (CollectionUtils.transform$Collection$Predicate(otherItems, (ti) => layer.compareTo(ti.getLayer()) >= 0)).iterator(); $it4.hasNext(); ) {
      let item = $it4.next();
      if (item instanceof Resource) {
        let resource = item;
        let type$ = spec.getResourceType(resource.getType().getId());
        result.add(new Resource()._Resource$Game$Tile$ResourceType$int(game, this.tile, type$, resource.getQuantity()));
      } else if (item instanceof LostCityRumour) {
        let rumour = item;
        result.add(new LostCityRumour()._LostCityRumour$Game$Tile$RumourType$String(game, this.tile, rumour.getType(), rumour.getName()));
      } else if (item instanceof TileImprovement) {
        let improvement = item;
        if (layer.compareTo(Map$Layer.ALL) >= 0 || improvement.getType().isNatural()) {
          let type$ = spec.getTileImprovementType(improvement.getType().getId());
          let tileImprovement = new TileImprovement()._TileImprovement$Game$Tile$TileImprovementType$TileImprovementStyle(game, this.tile, type$, improvement.getStyle());
          tileImprovement.setMagnitude(improvement.getMagnitude());
          result.add(tileImprovement);
        }
      } else {
        TileItemContainer.logger.warning('Bogus tile item: ' + item.getId());
      }
    }
    this.setTileItems(result);
  }
  /**
   * Checks if the specified {@code TileItem} is in this container.
   *
   * @param t The {@code TileItem} to test the presence of.
   * @return True if the tile item is present.
   */
  contains(t: TileItem): boolean {
    {
      return this.tileItems.contains(t);
    }
  }
  /**
   * Removes all references to this object.
   */
  disposeResources(): void {
    this.clearTileItems();
    super.disposeResources();
  }
  /**
   * {@inheritDoc}
   */
  checkIntegrity(fix: boolean, lb: LogBuilder): Constants$IntegrityType {
    let result = super.checkIntegrity(fix, lb);
    for (const $it5 = this.getTileItems().iterator(); $it5.hasNext(); ) {
      let ti = $it5.next();
      let integ = ti.checkIntegrity(fix, lb);
      if (fix) {
        if (ti instanceof TileImprovement) {
          let tim = ti;
          if (tim.isRiver()) {
            if (tim.getStyle() == null) {
              lb.add(['\n  TileImprovement null river style: ', tim]);
              integ = integ.fail();
            } else if ($J.equals('0000', tim.getStyle().toString())) {
              lb.add(['\n  TileImprovement 0000 river: ', tim]);
              integ = integ.fail();
            }
          }
        }
        if (!integ.safe()) {
          TileItemContainer.logger.warning('Removing broken TileImprovement: ' + ti.getId());
          this.removeTileItem(ti);
          integ = integ.fix();
        }
      }
      result = result.combine(integ);
    }
    return result;
  }
  /**
   * {@inheritDoc}
   */
  copyIn<T>(other: T): boolean {
    let o = this.copyInCast(other, $J.cls(TileItemContainer));
    if (o == null || !super.copyIn(o)) {
      return false;
    }
    let game = this.getGame();
    this.tile = game.updateRef$FreeColGameObject(o.getTile());
    this.clearTileItems();
    for (const $it6 = o.getTileItems().iterator(); $it6.hasNext(); ) {
      let ti = $it6.next();
      let nti = game.update$FreeColGameObject$boolean(ti, true);
      if (nti == null) {
        throw new RuntimeException('TileItem class fail ' + $J.str(ti));
      }
      this.addTileItem(nti);
    }
    return true;
  }
  /**
   * {@inheritDoc}
   */
  writeAttributes(xw: FreeColXMLWriter): void {
    super.writeAttributes(xw);
    xw.writeAttribute$String$FreeColObject(TileItemContainer.TILE_TAG, this.tile);
  }
  /**
   * {@inheritDoc}
   */
  writeChildren(xw: FreeColXMLWriter): void {
    super.writeChildren(xw);
    for (const $it7 = this.getTileItems().iterator(); $it7.hasNext(); ) {
      let item = $it7.next();
      item.toXML$FreeColXMLWriter(xw);
    }
  }
  /**
   * {@inheritDoc}
   */
  readAttributes(xr: FreeColXMLReader): void {
    super.readAttributes(xr);
    this.tile = xr.findFreeColGameObject(this.getGame(), TileItemContainer.TILE_TAG, $J.cls(Tile), null, true);
  }
  /**
   * {@inheritDoc}
   */
  readChildren(xr: FreeColXMLReader): void {
    this.clearTileItems();
    super.readChildren(xr);
  }
  /**
   * {@inheritDoc}
   */
  readChild(xr: FreeColXMLReader): void {
    let game = this.getGame();
    let tag = xr.getLocalName();
    if ($J.equals(LostCityRumour.TAG, tag)) {
      let lcr = xr.readFreeColObject$Game$Class(game, $J.cls(LostCityRumour));
      if (lcr != null) {
        this.addTileItem(lcr);
      }
    } else if ($J.equals(Resource.TAG, tag)) {
      this.addTileItem(xr.readFreeColObject$Game$Class(game, $J.cls(Resource)));
    } else if ($J.equals(TileImprovement.TAG, tag) || $J.equals(TileItemContainer.OLD_TILE_IMPROVEMENT_TAG, tag)) {
      this.addTileItem(xr.readFreeColObject$Game$Class(game, $J.cls(TileImprovement)));
    } else {
      super.readChild(xr);
    }
  }
  /**
   * {@inheritDoc}
   */
  getXMLTagName(): string {
    return TileItemContainer.TAG;
  }
  /**
   * {@inheritDoc}
   */
  toString(): string {
    let sb = new StringBuilder(64);
    sb.append(String.fromCharCode(91 /* '[' */)).append(this.getId());
    for (const $it8 = this.getTileItems().iterator(); $it8.hasNext(); ) {
      let item = $it8.next();
      sb.append(String.fromCharCode(32 /* ' ' */)).append($J.str(item));
    }
    sb.append(String.fromCharCode(93 /* ']' */));
    return sb.toString();
  }
  static $clinit() {
    TileItemContainer.logger = Logger.getLogger($J.cls(TileItemContainer).getName());
  }
}

$J.define(TileItemContainer, 'net.sf.freecol.common.model.TileItemContainer', { kind: 'class', sup: 'net.sf.freecol.common.model.FreeColGameObject', ctors: { 'net.sf.freecol.common.model.Game,java.lang.String': '_TileItemContainer$Game$String', 'net.sf.freecol.common.model.Game,net.sf.freecol.common.model.Tile': '_TileItemContainer$Game$Tile' }, returns: { 'getXMLTagName': 'java.lang.String', 'getRiver': 'net.sf.freecol.common.model.TileImprovement', 'getRoad': 'net.sf.freecol.common.model.TileImprovement', 'getResource': 'net.sf.freecol.common.model.Resource', 'getLostCityRumour': 'net.sf.freecol.common.model.LostCityRumour', 'getCompleteImprovements': 'java.util.List', 'getImprovements$': 'java.util.List', 'getCompleteItems': 'java.util.List', 'getTileItems': 'java.util.List', 'getTile': 'net.sf.freecol.common.model.Tile' }, meths: { 'getImprovements()': 'getImprovements$', 'getImprovements(boolean)': 'getImprovements$boolean$TileItemContainer' }, clinit: true, lazy: ['logger'] });
$J.module(() => {
  Constants = $J.load('net.sf.freecol.common.model.Constants');
  LostCityRumour = $J.load('net.sf.freecol.common.model.LostCityRumour');
  Map$Layer = $J.load('net.sf.freecol.common.model.Map$Layer');
  Resource = $J.load('net.sf.freecol.common.model.Resource');
  Tile = $J.load('net.sf.freecol.common.model.Tile');
  TileImprovement = $J.load('net.sf.freecol.common.model.TileImprovement');
  CollectionUtils = $J.load('net.sf.freecol.common.util.CollectionUtils');
});
