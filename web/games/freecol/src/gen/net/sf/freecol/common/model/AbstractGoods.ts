// @ts-nocheck
// FreeCol 1.2.0 src/net/sf/freecol/common/model/AbstractGoods.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
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
import { $J, Comparator } from '../../../../../../jre/index.ts';
import { FreeColObject } from './FreeColObject.ts';

let GoodsType, StringTemplate, CollectionUtils, Utils;

/**
 * Represents a certain amount of a GoodsType.  This does not
 * correspond to actual cargo present in a Location, but is intended
 * to represent things such as the amount of Lumber necessary to build
 * something, or the amount of cargo to load at a certain Location.
 */
export class AbstractGoods extends FreeColObject {
  /**
   * Compare the amount of abstract goods.
   */
  static ascendingAmountComparator: Comparator<AbstractGoods> = null;
  /**
   * A comparator to sort by descending goods amount and then by a
   * predictable goods type order.
   */
  static descendingAmountComparator: Comparator<AbstractGoods> = null;
  /**
   * The type of goods.
   */
  type: GoodsType = null;
  /**
   * The amount of goods.
   */
  amount: number = 0;
  /**
   * Empty constructor.
   */
  _AbstractGoods$(): this {
    this._FreeColObject();
    return this;
  }
  /**
   * Creates a new {@code AbstractGoods} instance.
   *
   * @param type The {@code GoodsType} to create.
   * @param amount The amount of goods to create.
   */
  _AbstractGoods$GoodsType$int(type$: GoodsType, amount: number): this {
    this._FreeColObject();
    this.setId(type$.getId());
    this.type = type$;
    this.amount = amount;
    return this;
  }
  /**
   * Creates a new {@code AbstractGoods} instance.
   *
   * @param other Another {@code AbstractGoods} to copy.
   */
  _AbstractGoods$AbstractGoods(other: AbstractGoods): this {
    this._FreeColObject();
    this.setId(other.type.getId());
    this.type = other.type;
    this.amount = other.amount;
    return this;
  }
  /**
   * Get the goods type.
   *
   * @return The {@code GoodsType}.
   */
  getType(): GoodsType {
    return this.type;
  }
  /**
   * Set the goods type.
   *
   * @param newType The new {@code GoodsType}.
   */
  setType(newType: GoodsType): void {
    this.type = newType;
  }
  /**
   * Is the goods type a food type?
   *
   * @return True if this is food.
   */
  isFoodType(): boolean {
    return this.getType().isFoodType();
  }
  /**
   * Get the goods amount.
   *
   * @return The goods amount.
   */
  getAmount(): number {
    return this.amount;
  }
  /**
   * Set the goods amount.
   *
   * @param newAmount The new goods amount.
   */
  setAmount(newAmount: number): void {
    this.amount = newAmount;
  }
  /**
   * Is the amount positive?
   *
   * @return True if the amount is greater than zero.
   */
  isPositive(): boolean {
    return this.getAmount() > 0;
  }
  /**
   * Are these goods storable.
   *
   * @return True if the goods are storable.
   */
  isStorable(): boolean {
    return this.getType().isStorable();
  }
  /**
   * Get a label for these goods.
   *
   * @return The label for these goods.
   */
  getLabel$(): StringTemplate {
    return StringTemplate.template$String('model.abstractGoods.label').addNamed$String$Named('%goods%', this.getType()).addAmount('%amount%', this.getAmount());
  }
  /**
   * Get a label for these goods.
   *
   * @param sellable Whether these goods can be sold.
   * @return A label for these goods.
   */
  getLabel$boolean(sellable: boolean): StringTemplate {
    return (sellable) ? this.getLabel$() : StringTemplate.template$String('model.abstractGoods.boycotted').addNamed$String$Named('%goods%', this.getType()).addAmount('%amount%', this.getAmount());
  }
  /**
   * Get a label given a key and amount.
   *
   * Used for arbitrary objects, such as the missionary's bible.
   *
   * @param key A key for the goods to display.
   * @param amount The amount of goods.
   * @return The goods label.
   */
  static getAbstractLabel(key: string, amount: number): StringTemplate {
    return StringTemplate.template$String('model.abstractGoods.label').add$String$String('%goods%', key).addAmount('%amount%', amount);
  }
  /**
   * Convenience lookup of the goods count in a collection of
   * abstract goods given a goods type.
   *
   * @param type The {@code GoodsType} to look for.
   * @param goods The collection of {@code AbstractGoods} to look in.
   * @return The goods count found, or zero if not found.
   */
  static getCount(type$: GoodsType, goods: Collection<AbstractGoods>): number {
    let ag = CollectionUtils.find$Collection$Predicate(goods, AbstractGoods.matches(type$));
    return (ag == null) ? 0 : ag.getAmount();
  }
  /**
   * Evaluate goods for trade purposes.
   *
   * @param player The {@code Player} to evaluate for.
   * @return A value for the goods.
   */
  evaluateFor(player: Player): number {
    let market = player.getMarket();
    return (market == null) ? Math.imul(this.getAmount(), 2) : market.getSalePrice$GoodsType$int(this.getType(), this.getAmount());
  }
  /**
   * A predicate maker to match by type.
   *
   * @param key The key of type {@link GoodsType}
   * @return A suitable {@code Predicate}.
   */
  static matches(key: GoodsType): Predicate<any> {
    return CollectionUtils.matchKey$Object$Function(key, ($p0) => $p0.getType());
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
  getXMLTagName(): string {
    return null;
  }
  /**
   * {@inheritDoc}
   */
  copyIn<T>(other: T): boolean {
    let o = this.copyInCast(other, $J.cls(AbstractGoods));
    if (o == null || !super.copyIn(o)) {
      return false;
    }
    this.type = o.getType();
    this.amount = o.getAmount();
    return true;
  }
  /**
   * {@inheritDoc}
   */
  equals(o: any): boolean {
    if (this === o) {
      return true;
    }
    if (o instanceof AbstractGoods) {
      let other = o;
      return this.type === other.type && this.amount === other.amount && super.equals(other);
    }
    return false;
  }
  /**
   * {@inheritDoc}
   */
  hashCode(): number {
    let hash = super.hashCode();
    hash = (Math.imul(31, hash) + Utils.hashCode(this.type)) | 0;
    hash = (Math.imul(31, hash) + this.amount) | 0;
    return hash;
  }
  /**
   * {@inheritDoc}
   */
  toString(): string {
    return AbstractGoods.toFullString(this.getType(), this.getAmount());
  }
  /**
   * Simple string version of the component parts of some goods.
   *
   * @param goodsType The {@code GoodsType} to use.
   * @param amount The amount of goods.
   * @return A string version of the goods.
   */
  static toFullString(goodsType: GoodsType, amount: number): string {
    return amount + ' ' + ((goodsType == null) ? '(null)' : goodsType.getSuffix$());
  }
  static $clinit() {
    AbstractGoods.ascendingAmountComparator = Comparator.thenComparing((Comparator.comparingInt(($p0) => $p0.getAmount())), ($p0) => $p0.getType(), GoodsType.goodsTypeComparator);
    AbstractGoods.descendingAmountComparator = Comparator.thenComparing(Comparator.reversed((Comparator.comparingInt(($p0) => $p0.getAmount()))), ($p0) => $p0.getType(), GoodsType.goodsTypeComparator);
  }
}

$J.define(AbstractGoods, 'net.sf.freecol.common.model.AbstractGoods', { kind: 'class', ifaces: ['net.sf.freecol.common.model.Named'], sup: 'net.sf.freecol.common.model.FreeColObject', ctors: { 'net.sf.freecol.common.model.AbstractGoods': '_AbstractGoods$AbstractGoods', 'net.sf.freecol.common.model.GoodsType,int': '_AbstractGoods$GoodsType$int', '': '_AbstractGoods$' }, returns: { 'hashCode': 'int', 'getXMLTagName': 'java.lang.String', 'getNameKey': 'java.lang.String', 'getLabel$': 'net.sf.freecol.common.model.StringTemplate', 'isStorable': 'boolean', 'isPositive': 'boolean', 'getAmount': 'int', 'isFoodType': 'boolean', 'getType': 'net.sf.freecol.common.model.GoodsType' }, meths: { 'getLabel(boolean)': 'getLabel$boolean', 'getLabel()': 'getLabel$' }, clinit: true, lazy: ['ascendingAmountComparator', 'descendingAmountComparator'] });
$J.module(() => {
  GoodsType = $J.load('net.sf.freecol.common.model.GoodsType');
  StringTemplate = $J.load('net.sf.freecol.common.model.StringTemplate');
  CollectionUtils = $J.load('net.sf.freecol.common.util.CollectionUtils');
  Utils = $J.load('net.sf.freecol.common.util.Utils');
});
