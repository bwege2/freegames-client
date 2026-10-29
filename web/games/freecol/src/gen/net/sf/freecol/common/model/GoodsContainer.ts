// @ts-nocheck
// FreeCol 1.2.0 src/net/sf/freecol/common/model/GoodsContainer.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
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
import { $J, ArrayList, HashMap, IllegalStateException, JString, Logger, RuntimeException, StringBuilder, UnsupportedOperationException, XMLStreamException } from '../../../../../../jre/index.ts';
import { FreeColGameObject } from './FreeColGameObject.ts';

let Constants, Goods, GoodsLocation, GoodsType, Ownable, CollectionUtils;

/**
 * Contains goods and can be used by a {@link Location} to make certain
 * tasks easier.
 */
export class GoodsContainer extends FreeColGameObject {
  static logger: Logger = null;
  static readonly TAG: string = 'goodsContainer';
  /**
   * The size of a standard `hold' of data.
   */
  static readonly CARGO_SIZE: number = 100;
  /**
   * Value to use for apparent unlimited quantities of goods
   * (e.g. warehouse contents in Europe, amount of food a colony can
   * import).  Has to be signficantly bigger than any one unit could
   * expect to carry, but not so huge as to look silly in user
   * messages.
   */
  static readonly HUGE_CARGO_SIZE: number = 10000;
  /**
   * The list of Goods stored in this {@code GoodsContainer}.
   *
   * Always accessed synchronized (except I/O).
   */
  storedGoods: JMap<GoodsType, number> = null;
  /**
   * The previous list of Goods stored in this
   * {@code GoodsContainer}.
   *
   * Always accessed synchronized and *after synchronized(storedGoods)*.
   * This is only touched rarely so the extra lock is tolerable.
   * (Not synchronized during I/O)
   */
  oldStoredGoods: JMap<GoodsType, number> = null;
  /**
   * The location for this {@code GoodsContainer}.
   */
  parent: Location = null;
  static readonly AMOUNT_TAG: string = 'amount';
  static readonly OLD_STORED_GOODS_TAG: string = 'oldStoredGoods';
  static readonly STORED_GOODS_TAG: string = 'storedGoods';
  static readonly TYPE_TAG: string = 'type';
  $init_GoodsContainer() {
    this.storedGoods = new HashMap();
    this.oldStoredGoods = new HashMap();
    this.parent = null;
  }
  /**
   * Creates an empty {@code GoodsContainer}.
   *
   * @param game The enclosing {@code Game}.
   * @param parent The {@code Location} this
   *     {@code GoodsContainer} contains goods for.
   */
  _GoodsContainer$Game$Location(game: Game, parent: Location): this {
    this._FreeColGameObject$Game(game);
    this.$init_GoodsContainer();
    this.parent = parent;
    return this;
  }
  /**
   * Create a new {@code GoodsContainer}.
   *
   * @param game The enclosing {@code Game}.
   * @param id The object identifier.
   */
  _GoodsContainer$Game$String(game: Game, id: string): this {
    this._FreeColGameObject$Game$String(game, id);
    this.$init_GoodsContainer();
    return this;
  }
  /**
   * Get the parent location.
   *
   * @return The parent {@code Location}.
   */
  getParent(): Location {
    return this.parent;
  }
  /**
   * Set the goods location.
   *
   * @param location The {@code Location} to set.
   */
  setLocation(location: Location): void {
    if (location == null) {
      throw new RuntimeException('Null GoodsContainer location: ' + $J.str(this));
    }
    this.parent = location;
  }
  /**
   * Get the stored goods.
   *
   * @return A map of the stored goods.
   */
  getStoredGoods(): JMap<GoodsType, number> {
    return this.storedGoods;
  }
  /**
   * Set the stored goods.
   *
   * @param goods A map of the new stored goods.
   */
  setStoredGoods(goods: JMap<GoodsType, number>): void {
    {
      this.storedGoods.clear();
      this.storedGoods.putAll(goods);
    }
  }
  /**
   * Get the old stored goods.
   *
   * @return A map of the old stored goods.
   */
  getOldStoredGoods(): JMap<GoodsType, number> {
    return this.oldStoredGoods;
  }
  /**
   * Set the old stored goods.
   *
   * @param goods A map of the new old stored goods.
   */
  setOldStoredGoods(goods: JMap<GoodsType, number>): void {
    {
      this.oldStoredGoods.clear();
      this.oldStoredGoods.putAll(goods);
    }
  }
  /**
   * Checks if the specified {@code Goods} is in this container.
   *
   * @param <T> The base type of the goods.
   * @param g The goods to test the presence of.
   * @return True if there is enough of the specified goods present that it
   *     can be removed without error.
   */
  contains<T>(g: T): boolean {
    return this.getGoodsCount(g.getType()) >= g.getAmount();
  }
  /**
   * Gets the amount of one type of goods in this container.
   *
   * @param type The {@code GoodsType} being looked for.
   * @return The amount of this type of goods in this container.
   */
  getGoodsCount(type$: GoodsType): number {
    {
      let val = this.storedGoods.get(type$);
      return (val == null) ? 0 : val;
    }
  }
  /**
   * Gets the amount of one type of goods at the beginning of the turn.
   *
   * @param type The {@code GoodsType} being looked for.
   * @return The amount of this type of goods in this container at
   *     the beginning of the turn
   */
  getOldGoodsCount(type$: GoodsType): number {
    {
      let val = this.oldStoredGoods.get(type$);
      return (val == null) ? 0 : val;
    }
  }
  /**
   * Adds goods to this goods container.
   *
   * @param <T> The base type of the goods.
   * @param goods The goods to add.
   * @return True if the addition succeeds.
   */
  addGoods$AbstractGoods<T>(goods: T): boolean {
    return this.addGoods$GoodsType$int(goods.getType(), goods.getAmount());
  }
  /**
   * Adds goods by type and amount to this goods container.
   *
   * Note: negative amounts are allowed.
   *
   * @param type The {@code GoodsType} to add.
   * @param amount The amount of goods to add.
   * @return True if the addition succeeds.
   */
  addGoods$GoodsType$int(type$: GoodsType, amount: number): boolean {
    let oldAmount = this.getGoodsCount(type$);
    let newAmount = (oldAmount + amount) | 0;
    if (newAmount < 0) {
      throw new IllegalStateException('Operation would leave ' + newAmount + ' goods of type ' + $J.str(type$) + ' in Location ' + $J.str(this.parent));
    } else if (newAmount === 0) {
      {
        this.storedGoods.remove(type$);
      }
    } else {
      {
        this.storedGoods.put(type$, newAmount);
      }
    }
    this.invalidateCache();
    return true;
  }
  /**
   * Removes goods from this goods container.
   *
   * @param <T> The base type of the goods.
   * @param goods The goods to remove from this container.
   * @return The {@code Goods} actually removed.
   */
  removeGoods$AbstractGoods<T>(goods: T): Goods {
    return this.removeGoods$GoodsType$int(goods.getType(), goods.getAmount());
  }
  /**
   * Removes all goods of a given type from this goods container.
   *
   * @param type The {@code GoodsType} to remove.
   * @return The {@code Goods} actually removed.
   */
  removeGoods$GoodsType(type$: GoodsType): Goods {
    return this.removeGoods$GoodsType$int(type$, Constants.INFINITY);
  }
  /**
   * Removes goods by type and amount from this goods container.
   *
   * @param type The {@code GoodsType} to remove.
   * @param amount The amount of goods to remove.
   * @return The {@code Goods} actually removed, which may have a
   *     lower actual amount, or null if nothing removed.
   */
  removeGoods$GoodsType$int(type$: GoodsType, amount: number): Goods {
    let oldAmount = this.getGoodsCount(type$);
    if (oldAmount <= 0) {
      return null;
    }
    let newAmount = (oldAmount - amount) | 0;
    let removedGoods: Goods;
    if (newAmount > 0) {
      removedGoods = new Goods()._Goods$Game$Location$GoodsType$int(this.getGame(), null, type$, amount);
      {
        this.storedGoods.put(type$, newAmount);
      }
    } else {
      removedGoods = new Goods()._Goods$Game$Location$GoodsType$int(this.getGame(), null, type$, oldAmount);
      {
        this.storedGoods.remove(type$);
      }
    }
    this.invalidateCache();
    return removedGoods;
  }
  invalidateCache(): void {
    if (this.parent != null && (this.parent instanceof GoodsLocation)) {
      (this.parent).invalidateCache();
    }
  }
  /**
   * Set the amount of goods in this container.
   *
   * @param goodsType The {@code GoodsType} to set the amount of.
   * @param newAmount The new amount.
   */
  setAmount(goodsType: GoodsType, newAmount: number): void {
    if (newAmount === 0) {
      {
        this.storedGoods.remove(goodsType);
      }
    } else {
      {
        this.storedGoods.put(goodsType, newAmount);
      }
    }
    this.invalidateCache();
  }
  /**
   * Remove all goods.
   */
  removeAll(): void {
    {
      this.storedGoods.clear();
    }
    this.invalidateCache();
  }
  /**
   * Clear both containers.
   */
  clearContainers$$GoodsContainer(): void {
    {
      this.storedGoods.clear();
      {
        this.oldStoredGoods.clear();
      }
    }
  }
  /**
   * Removes all goods above given amount, provided that the goods
   * are storable and do not ignore warehouse limits.
   *
   * @param newAmount The threshold.
   */
  removeAbove(newAmount: number): void {
    {
      if (newAmount <= 0) {
        this.storedGoods.clear();
        return;
      }
      let hiPred = (e) => {
        let gt = e.getKey();
        return gt.isStorable() && !gt.limitIgnored() && e.getValue() > newAmount;
      };
      CollectionUtils.forEachMapEntry$Map$Predicate$Consumer(this.storedGoods, hiPred, (e) => this.storedGoods.put(e.getKey(), newAmount));
    }
    this.invalidateCache();
  }
  /**
   * Checks if any storable type of goods has reached the given amount.
   *
   * @param amount The amount to check.
   * @return True if any storable, capacity limited goods has reached the
   *     given amount.
   */
  hasReachedCapacity(amount: number): boolean {
    {
      return CollectionUtils.any$Collection$Predicate(this.storedGoods.entrySet(), (e) => e.getKey().isStorable() && !e.getKey().limitIgnored() && e.getValue() > amount);
    }
  }
  /**
   * Gets the amount of space that the goods in this container will consume.
   * Each occupied cargo slot contains an amount in [1, CARGO_SIZE].
   *
   * @return The amount of space taken by this containers goods.
   */
  getSpaceTaken(): number {
    {
      return CollectionUtils.sum$Collection$ToIntFunction(this.storedGoods.values(), (amount) => ((amount % GoodsContainer.CARGO_SIZE === 0) ? $J.idiv(amount, GoodsContainer.CARGO_SIZE) : ($J.idiv(amount, GoodsContainer.CARGO_SIZE) + 1) | 0));
    }
  }
  /**
   * Gets a list containing all holds of goods in this goods container.
   * Each {@code Goods} returned has a maximum amount of CARGO_SIZE.
   *
   * @return A list of {@code Goods}.
   */
  getGoodsList(): List<Goods> {
    let game = this.getGame();
    let result = new ArrayList();
    {
      CollectionUtils.forEachMapEntry$Map$Consumer(this.storedGoods, (e) => {
        let amount = e.getValue();
        while (amount > 0) {
          result.add(new Goods()._Goods$Game$Location$GoodsType$int(game, this.parent, e.getKey(), ((amount >= GoodsContainer.CARGO_SIZE) ? GoodsContainer.CARGO_SIZE : amount)));
          amount = (amount - GoodsContainer.CARGO_SIZE) | 0;
        }
      });
    }
    return result;
  }
  /**
   * Gets a list of all goods in this goods container.  There is
   * only one {@code Goods} for each distinct {@code GoodsType}.
   *
   * @return A list of {@code Goods}.
   */
  getCompactGoodsList(): List<Goods> {
    let game = this.getGame();
    {
      return CollectionUtils.transform$Collection$Predicate$Function(this.storedGoods.entrySet(), (e) => e.getValue() > 0, (e) => new Goods()._Goods$Game$Location$GoodsType$int(game, this.parent, e.getKey(), e.getValue()));
    }
  }
  /**
   * Save the current stored goods of this goods container in the old
   * stored goods.
   */
  saveState(): void {
    {
      {
        this.oldStoredGoods.clear();
        this.oldStoredGoods.putAll(this.storedGoods);
      }
    }
  }
  /**
   * Restore the current stored goods of this goods container to the
   * old state.
   */
  restoreState(): void {
    {
      {
        this.storedGoods.clear();
        this.storedGoods.putAll(this.oldStoredGoods);
      }
    }
  }
  /**
   * Has this goods containers contents changed from what was recorded
   * last time the state was saved?
   *
   * @return True if the contents have changed.
   */
  hasChanged(): boolean {
    return CollectionUtils.any$Collection$Predicate(this.getSpecification().getGoodsTypeList(), (gt) => this.getOldGoodsCount(gt) !== this.getGoodsCount(gt));
  }
  /**
   * Fire property changes for all goods that have seen level changes
   * since the last saveState().
   *
   * @return True if something changed.
   */
  fireChanges(): boolean {
    let ret = false;
    for (const $it0 = this.getSpecification().getGoodsTypeList().iterator(); $it0.hasNext(); ) {
      let type$ = $it0.next();
      let oldCount = this.getOldGoodsCount(type$);
      let newCount = this.getGoodsCount(type$);
      if (oldCount !== newCount) {
        this.firePropertyChange$String$int$int(type$.getId(), oldCount, newCount);
        ret = true;
      }
    }
    return ret;
  }
  /**
   * Utility to move goods from one location to another.
   *
   * @param src The source {@code GoodsContainer}.
   * @param goodsType The {@code GoodsType} to move.
   * @param amount The amount of goods to move.
   * @param dst The new {@code GoodsContainer}.
   */
  static moveGoods(src: GoodsContainer, goodsType: GoodsType, amount: number, dst: GoodsContainer): void {
    if (src != null) {
      src.saveState();
      src.removeGoods$GoodsType$int(goodsType, amount);
    }
    if (dst != null) {
      dst.saveState();
      dst.addGoods$GoodsType$int(goodsType, amount);
    }
  }
  /**
   * {@inheritDoc}
   */
  getOwner(): Player {
    return ($J.isa(this.parent, Ownable)) ? (this.parent).getOwner() : null;
  }
  /**
   * {@inheritDoc}
   */
  setOwner(p: Player): void {
    throw new UnsupportedOperationException('Can not set GoodsContainer owner');
  }
  /**
   * {@inheritDoc}
   */
  disposeResources(): void {
    this.clearContainers$$GoodsContainer();
    super.disposeResources();
  }
  /**
   * {@inheritDoc}
   */
  copyIn<T>(other: T): boolean {
    let o = this.copyInCast(other, $J.cls(GoodsContainer));
    if (o == null || !super.copyIn(o)) {
      return false;
    }
    this.setStoredGoods(o.getStoredGoods());
    this.setOldStoredGoods(o.getOldStoredGoods());
    return true;
  }
  /**
   * {@inheritDoc}
   */
  writeChildren(xw: FreeColXMLWriter): void {
    super.writeChildren(xw);
    if (xw.validFor(this.getOwner())) {
      {
        this.writeStorage(xw, GoodsContainer.STORED_GOODS_TAG, this.storedGoods);
        {
          this.writeStorage(xw, GoodsContainer.OLD_STORED_GOODS_TAG, this.oldStoredGoods);
        }
      }
    }
  }
  /**
   * Write a storage container to a stream.
   *
   * @param xw The {@code FreeColXMLWriter} to write to.
   * @param tag The element tag.
   * @param storage The storage container.
   * @exception XMLStreamException if there is a problem writing to
   *     the stream.
   */
  writeStorage(xw: FreeColXMLWriter, tag: string, storage: JMap<GoodsType, number>): void {
    if (storage.isEmpty()) {
      return;
    }
    xw.writeStartElement(tag);
    for (const $it1 = CollectionUtils.sort$Collection(storage.keySet()).iterator(); $it1.hasNext(); ) {
      let goodsType = $it1.next();
      xw.writeStartElement(Goods.TAG);
      xw.writeAttribute$String$FreeColObject(GoodsContainer.TYPE_TAG, goodsType);
      xw.writeAttribute$String$Object(GoodsContainer.AMOUNT_TAG, storage.get(goodsType));
      xw.writeEndElement();
    }
    xw.writeEndElement();
  }
  /**
   * {@inheritDoc}
   */
  readChildren(xr: FreeColXMLReader): void {
    this.clearContainers$$GoodsContainer();
    super.readChildren(xr);
  }
  /**
   * {@inheritDoc}
   */
  readChild(xr: FreeColXMLReader): void {
    let tag = xr.getLocalName();
    if ($J.equals(GoodsContainer.OLD_STORED_GOODS_TAG, tag)) {
      {
        this.readStorage(xr, this.oldStoredGoods);
      }
    } else if ($J.equals(GoodsContainer.STORED_GOODS_TAG, tag)) {
      {
        this.readStorage(xr, this.storedGoods);
      }
    } else {
      super.readChild(xr);
    }
  }
  /**
   * Read a storage container from a stream.
   *
   * @param xr The {@code FreeColXMLReader} to read from.
   * @param storage The storage container.
   * @exception XMLStreamException if there is a problem reading from
   *     the stream.
   */
  readStorage(xr: FreeColXMLReader, storage: JMap<GoodsType, number>): void {
    let spec = this.getGame().getSpecification();
    while (xr.moreTags()) {
      let tag = xr.getLocalName();
      if ($J.equals(Goods.TAG, tag)) {
        let goodsType = xr.getType(spec, GoodsContainer.TYPE_TAG, $J.cls(GoodsType), null);
        let amount = xr.getAttribute$String$int(GoodsContainer.AMOUNT_TAG, 0);
        storage.put(goodsType, amount);
      } else {
        throw new XMLStreamException('Bogus GoodsContainer tag: ' + tag);
      }
      xr.closeTag$String(tag);
    }
  }
  /**
   * {@inheritDoc}
   */
  getXMLTagName(): string {
    return GoodsContainer.TAG;
  }
  /**
   * {@inheritDoc}
   */
  toString(): string {
    let sep = ', ';
    let sb = new StringBuilder(128);
    sb.append(String.fromCharCode(91 /* '[' */)).append(this.getId()).append(' [');
    CollectionUtils.forEachMapEntry$Map$Consumer(this.storedGoods, (e) => sb.append($J.str(e.getKey())).append(String.fromCharCode(61 /* '=' */)).append($J.str(e.getValue())).append(sep));
    sb.setLength((sb.length() - sep.length) | 0);
    sb.append('][');
    CollectionUtils.forEachMapEntry$Map$Consumer(this.oldStoredGoods, (e) => sb.append($J.str(e.getKey())).append(String.fromCharCode(61 /* '=' */)).append($J.str(e.getValue())).append(sep));
    sb.setLength((sb.length() - sep.length) | 0);
    sb.append(']]');
    return sb.toString();
  }
  static $clinit() {
    GoodsContainer.logger = Logger.getLogger($J.cls(GoodsContainer).getName());
  }
}

$J.define(GoodsContainer, 'net.sf.freecol.common.model.GoodsContainer', { kind: 'class', ifaces: ['net.sf.freecol.common.model.Ownable'], sup: 'net.sf.freecol.common.model.FreeColGameObject', ctors: { 'net.sf.freecol.common.model.Game,java.lang.String': '_GoodsContainer$Game$String', 'net.sf.freecol.common.model.Game,net.sf.freecol.common.model.Location': '_GoodsContainer$Game$Location' }, returns: { 'getXMLTagName': 'java.lang.String', 'getOwner': 'net.sf.freecol.common.model.Player', 'hasChanged': 'boolean', 'getCompactGoodsList': 'java.util.List', 'getGoodsList': 'java.util.List', 'getSpaceTaken': 'int', 'getOldStoredGoods': 'java.util.Map', 'getStoredGoods': 'java.util.Map', 'getParent': 'net.sf.freecol.common.model.Location' }, meths: { 'clearContainers()': 'clearContainers$$GoodsContainer', 'removeGoods(net.sf.freecol.common.model.GoodsType,int)': 'removeGoods$GoodsType$int', 'removeGoods(net.sf.freecol.common.model.GoodsType)': 'removeGoods$GoodsType', 'removeGoods(net.sf.freecol.common.model.AbstractGoods)': 'removeGoods$AbstractGoods', 'addGoods(net.sf.freecol.common.model.GoodsType,int)': 'addGoods$GoodsType$int', 'addGoods(net.sf.freecol.common.model.AbstractGoods)': 'addGoods$AbstractGoods' }, clinit: true, lazy: ['logger'] });
$J.module(() => {
  Constants = $J.load('net.sf.freecol.common.model.Constants');
  Goods = $J.load('net.sf.freecol.common.model.Goods');
  GoodsLocation = $J.load('net.sf.freecol.common.model.GoodsLocation');
  GoodsType = $J.load('net.sf.freecol.common.model.GoodsType');
  Ownable = $J.load('net.sf.freecol.common.model.Ownable');
  CollectionUtils = $J.load('net.sf.freecol.common.util.CollectionUtils');
});
