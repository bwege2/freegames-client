// @ts-nocheck
// FreeCol 1.2.0 src/net/sf/freecol/common/model/GoodsLocation.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
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
import { $J, Collections, Logger } from '../../../../../../jre/index.ts';
import { UnitLocation } from './UnitLocation.ts';

let Goods, GoodsContainer, UnitLocation$NoAddReason, CollectionUtils;

/**
 * A {@code GoodsLocation} is a place where {@link Unit}s and
 * {@link Goods} can be put.  It can not store any other Locatables,
 * such as {@link TileItem}s.
 *
 * @see Locatable
 */
export class GoodsLocation extends UnitLocation {
  static logger: Logger = null;
  /**
   * The container for the goods.
   */
  goodsContainer: GoodsContainer = null;
  $init_GoodsLocation() {
    this.goodsContainer = null;
  }
  /**
   * Creates a new {@code GoodsLocation} instance.
   *
   * @param game The enclosing {@code Game}.
   */
  _GoodsLocation$Game(game: Game): this {
    this._UnitLocation$Game(game);
    this.$init_GoodsLocation();
    return this;
  }
  /**
   * Creates a new {@code GoodsLocation} instance.
   *
   * @param game The enclosing {@code Game}.
   * @param id The object identifier.
   */
  _GoodsLocation$Game$String(game: Game, id: string): this {
    this._UnitLocation$Game$String(game, id);
    this.$init_GoodsLocation();
    return this;
  }
  setGoodsContainer(goodsContainer: GoodsContainer): void {
    this.goodsContainer = goodsContainer;
  }
  /**
   * Adds some goods to this location.
   *
   * @param goods The {@code AbstractGoods} to add.
   * @return True if the goods were added.
   */
  addGoods$AbstractGoods(goods: AbstractGoods): boolean {
    return this.addGoods$GoodsType$int(goods.getType(), goods.getAmount());
  }
  /**
   * Adds a list of goods to this location.
   *
   * @param goods The list of {@code AbstractGoods} to add.
   * @return True if the goods were all added.
   */
  addGoods$List(goods: List<AbstractGoods>): boolean {
    return CollectionUtils.all$Collection$Predicate(goods, (ag) => this.addGoods$AbstractGoods(ag));
  }
  /**
   * Removes the some goods from this location.
   *
   * @param goods The {@code AbstractGoods} to remove.
   * @return The goods that was removed, which may be less than that
   *     requested, or null if none.
   */
  removeGoods$AbstractGoods(goods: AbstractGoods): Goods {
    return this.removeGoods$GoodsType$int(goods.getType(), goods.getAmount());
  }
  /**
   * Removes all Goods of the given type from this location.
   *
   * @param type The {@code GoodsType} to remove.
   * @return The goods that was removed, or null if none.
   */
  removeGoods$GoodsType(type$: GoodsType): Goods {
    return this.removeGoods$GoodsType$int(type$, this.getGoodsCount(type$));
  }
  /**
   * Gets the amount of one type of goods at this location.
   *
   * @param type The {@code GoodsType} to look for.
   * @return The amount of goods.
   */
  getGoodsCount(type$: GoodsType): number {
    return (this.goodsContainer == null) ? 0 : this.goodsContainer.getGoodsCount(type$);
  }
  /**
   * Does this location contain enough goods to satisfy a list of
   * requirements?
   *
   * @param goods A list of {@code AbstractGoods} to check.
   * @return True if the goods are all present.
   */
  containsGoods(goods: List<AbstractGoods>): boolean {
    return CollectionUtils.all$Collection$Predicate(goods, (ag) => ag.getAmount() <= this.getGoodsCount(ag.getType()));
  }
  /**
   * Remove all the goods.
   */
  removeAll(): void {
    if (this.goodsContainer != null) {
      this.goodsContainer.removeAll();
      this.invalidateCache();
    }
  }
  /**
   * Gets a list of all the goods in this location.  Each list member is
   * limited to a maximum amount of CARGO_SIZE, thus there may be multiple
   * entries with the same goods type.
   *
   * @return A list of goods.
   */
  getGoodsList(): List<Goods> {
    return (this.goodsContainer == null) ? Collections.emptyList() : this.goodsContainer.getGoodsList();
  }
  /**
   * Gets an list of all the goods in this location.  There is only
   * one {@code Goods} for each {@code GoodsType}, thus the
   * amount of goods may exceed CARGO_SIZE.
   *
   * @return A list of goods.
   */
  getCompactGoodsList(): List<Goods> {
    return (this.goodsContainer == null) ? Collections.emptyList() : this.goodsContainer.getCompactGoodsList();
  }
  /**
   * Move goods from one location to another.
   *
   * @param src The source {@code GoodsLocation}.
   * @param goodsType The {@code GoodsType} to move.
   * @param amount The amount of goods to move.
   * @param dst The new {@code GoodsLocation}.
   */
  static moveGoods(src: GoodsLocation, goodsType: GoodsType, amount: number, dst: GoodsLocation): void {
    let srcC = (src == null) ? null : src.getGoodsContainer();
    let dstC = (dst == null) ? null : dst.getGoodsContainer();
    GoodsContainer.moveGoods(srcC, goodsType, amount, dstC);
  }
  /**
   * {@inheritDoc}
   */
  add(locatable: Locatable): boolean {
    return (locatable instanceof Goods) ? this.addGoods$AbstractGoods(locatable) : super.add(locatable);
  }
  /**
   * {@inheritDoc}
   */
  remove(locatable: Locatable): boolean {
    return (locatable instanceof Goods) ? this.removeGoods$AbstractGoods(locatable) != null : super.remove(locatable);
  }
  /**
   * {@inheritDoc}
   */
  contains(locatable: Locatable): boolean {
    return (locatable instanceof Goods) ? this.goodsContainer.contains(locatable) : super.contains(locatable);
  }
  /**
   * {@inheritDoc}
   */
  getGoodsContainer(): GoodsContainer {
    return this.goodsContainer;
  }
  /**
   * {@inheritDoc}
   */
  getNoAddReason(locatable: Locatable): UnitLocation$NoAddReason {
    if (locatable instanceof Goods) {
      let goods = locatable;
      if (((goods.getSpaceTaken() + ((this.goodsContainer == null) ? 0 : this.goodsContainer.getSpaceTaken())) | 0) > this.getGoodsCapacity()) {
        return UnitLocation$NoAddReason.CAPACITY_EXCEEDED;
      }
      return UnitLocation$NoAddReason.NONE;
    }
    return super.getNoAddReason(locatable);
  }
  /**
   * Adds a specified amount of a type of goods to this location.
   *
   * @param type The {@code GoodsType} to add.
   * @param amount The amount of goods to add.
   * @return True if the goods were added.
   */
  addGoods$GoodsType$int(type$: GoodsType, amount: number): boolean {
    if (this.goodsContainer == null) {
      this.goodsContainer = new GoodsContainer()._GoodsContainer$Game$Location(this.getGame(), this);
    }
    let ret = this.goodsContainer.addGoods$GoodsType$int(type$, amount);
    this.invalidateCache();
    return ret;
  }
  /**
   * Removes a specified amount of a type of Goods from this location.
   *
   * @param type The type of goods to remove.
   * @param amount The amount of goods to remove.
   * @return The goods that was removed, which may be less than that
   *     requested, or null if none.
   */
  removeGoods$GoodsType$int(type$: GoodsType, amount: number): Goods {
    if (this.goodsContainer == null) {
      return null;
    }
    let ret = this.goodsContainer.removeGoods$GoodsType$int(type$, amount);
    this.invalidateCache();
    return ret;
  }
  /**
   * {@inheritDoc}
   */
  getDisposables(): Stream<FreeColGameObject> {
    let up = super.getDisposables();
    return (this.goodsContainer == null) ? up : CollectionUtils.concat(this.goodsContainer.getDisposables(), [up]);
  }
  /**
   * {@inheritDoc}
   */
  copyIn<T>(other: T): boolean {
    let o = this.copyInCast(other, $J.cls(GoodsLocation));
    if (o == null || !super.copyIn(o)) {
      return false;
    }
    this.goodsContainer = this.getGame().update$FreeColGameObject$boolean(o.getGoodsContainer(), true);
    return true;
  }
  /**
   * {@inheritDoc}
   */
  writeChildren(xw: FreeColXMLWriter): void {
    super.writeChildren(xw);
    if (this.goodsContainer != null) {
      this.goodsContainer.toXML$FreeColXMLWriter(xw);
    }
  }
  /**
   * {@inheritDoc}
   */
  readChildren(xr: FreeColXMLReader): void {
    if (this.goodsContainer != null) {
      this.goodsContainer.removeAll();
    }
    super.readChildren(xr);
  }
  /**
   * {@inheritDoc}
   */
  readChild(xr: FreeColXMLReader): void {
    let tag = xr.getLocalName();
    if ($J.equals(GoodsContainer.TAG, tag)) {
      this.goodsContainer = xr.readFreeColObject$Game$Class(this.getGame(), $J.cls(GoodsContainer));
      this.goodsContainer.setLocation(this);
    } else {
      super.readChild(xr);
    }
  }
  static $clinit() {
    GoodsLocation.logger = Logger.getLogger($J.cls(GoodsLocation).getName());
  }
}

$J.define(GoodsLocation, 'net.sf.freecol.common.model.GoodsLocation', { kind: 'class', sup: 'net.sf.freecol.common.model.UnitLocation', ctors: { 'net.sf.freecol.common.model.Game,java.lang.String': '_GoodsLocation$Game$String', 'net.sf.freecol.common.model.Game': '_GoodsLocation$Game' }, returns: { 'getDisposables': 'java.util.stream.Stream', 'getGoodsCapacity': 'int', 'getGoodsContainer': 'net.sf.freecol.common.model.GoodsContainer', 'getCompactGoodsList': 'java.util.List', 'getGoodsList': 'java.util.List' }, meths: { 'removeGoods(net.sf.freecol.common.model.GoodsType,int)': 'removeGoods$GoodsType$int', 'addGoods(net.sf.freecol.common.model.GoodsType,int)': 'addGoods$GoodsType$int', 'removeGoods(net.sf.freecol.common.model.GoodsType)': 'removeGoods$GoodsType', 'removeGoods(net.sf.freecol.common.model.AbstractGoods)': 'removeGoods$AbstractGoods', 'addGoods(java.util.List)': 'addGoods$List', 'addGoods(net.sf.freecol.common.model.AbstractGoods)': 'addGoods$AbstractGoods' }, clinit: true, lazy: ['logger'] });
$J.module(() => {
  Goods = $J.load('net.sf.freecol.common.model.Goods');
  GoodsContainer = $J.load('net.sf.freecol.common.model.GoodsContainer');
  UnitLocation$NoAddReason = $J.load('net.sf.freecol.common.model.UnitLocation$NoAddReason');
  CollectionUtils = $J.load('net.sf.freecol.common.util.CollectionUtils');
});
