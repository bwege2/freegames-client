// @ts-nocheck
// FreeCol 1.2.0 src/net/sf/freecol/common/model/NativeTradeItem.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
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
import { $J, Comparator, StringBuilder } from '../../../../../../jre/index.ts';
import { GoodsTradeItem } from './GoodsTradeItem.ts';

let Messages, GoodsType, CollectionUtils;

/**
 * A trade item consisting of some goods to be traded with the natives.
 * Therefore we include the current valuation and the haggle count.
 */
export class NativeTradeItem extends GoodsTradeItem {
  static readonly TAG: string = 'nativeTradeItem';
  /**
   * Compare the trade item price.
   */
  static descendingPriceComparator: Comparator<NativeTradeItem> = null;
  /**
   * Magic number to denote that the price has not been initialized.
   */
  static readonly PRICE_UNSET: number = 0;
  /**
   * Magic number for price to denote an invalid item.
   */
  static readonly PRICE_INVALID: number = -1;
  /**
   * The current valuation by the natives.
   */
  price_: number = 0;
  /**
   * The number of haggling rounds.
   */
  haggleCount: number = 0;
  static readonly HAGGLE_COUNT_TAG: string = 'haggleCount';
  static readonly PRICE_TAG: string = 'price';
  /**
   * Creates a new {@code NativeTradeItem} instance.
   *
   * @param game The enclosing {@code Game}.
   * @param source The source {@code Player}.
   * @param destination The destination {@code Player}.
   * @param goods The {@code Goods} to trade.
   */
  _NativeTradeItem$Game$Player$Player$Goods(game: Game, source: Player, destination: Player, goods: Goods): this {
    this._GoodsTradeItem$Game$Player$Player$Goods(game, source, destination, goods);
    this.price_ = NativeTradeItem.PRICE_UNSET;
    this.haggleCount = 0;
    return this;
  }
  /**
   * Copy a new {@code NativeTradeItem} instance.  Used by readList.
   *
   * @param nti The {@code NativeTradeItem} to copy.
   */
  _NativeTradeItem$NativeTradeItem(nti: NativeTradeItem): this {
    this._GoodsTradeItem$Game$Player$Player$Goods(nti.getGoods().getGame(), nti.getSource(), nti.getDestination(), nti.getGoods());
    this.price_ = nti.getPrice();
    this.haggleCount = nti.getHaggleCount();
    return this;
  }
  /**
   * Creates a new {@code NativeTradeItem} instance.
   *
   * @param game The enclosing {@code Game}.
   * @param xr The {@code FreeColXMLReader} to read from.
   * @exception XMLStreamException if there is an error reading the stream.
   */
  _NativeTradeItem$Game$FreeColXMLReader(game: Game, xr: FreeColXMLReader): this {
    this._GoodsTradeItem$Game$FreeColXMLReader(game, xr);
    return this;
  }
  /**
   * Has a price been set for this item?
   *
   * @return True if a price has been set.
   */
  priceIsSet(): boolean {
    return this.price_ !== NativeTradeItem.PRICE_UNSET;
  }
  /**
   * Is the price valid for trade.
   *
   * @return True if the price is positive.
   */
  priceIsValid(): boolean {
    return this.price_ > 0;
  }
  /**
   * Get the price for this item.
   *
   * @return The current price.
   */
  getPrice(): number {
    return this.price_;
  }
  /**
   * Set the price for this item.
   *
   * @param price The new price.
   */
  setPrice(price: number): void {
    this.price_ = price;
  }
  /**
   * Get the haggle count for this item.
   *
   * @return The current haggle count.
   */
  getHaggleCount(): number {
    return this.haggleCount;
  }
  /**
   * Set the haggle count for this item.
   *
   * @param haggleCount The new haggle count.
   */
  setHaggleCount(haggleCount: number): void {
    this.haggleCount = haggleCount;
  }
  /**
   * Get a predicate to match this native trade item by its goods.
   *
   * @return A suitable {@code Predicate}.
   */
  goodsMatcher(): Predicate<NativeTradeItem> {
    return CollectionUtils.matchKeyEquals$Object$Function(this.getGoods(), ($p0) => $p0.getGoods());
  }
  /**
   * {@inheritDoc}
   */
  copyIn<T>(other: T): boolean {
    let o = this.copyInCast(other, $J.cls(NativeTradeItem));
    if (o == null || !super.copyIn(o)) {
      return false;
    }
    this.price_ = o.getPrice();
    this.haggleCount = o.getHaggleCount();
    return true;
  }
  /**
   * {@inheritDoc}
   */
  writeAttributes(xw: FreeColXMLWriter): void {
    super.writeAttributes(xw);
    xw.writeAttribute$String$int(NativeTradeItem.PRICE_TAG, this.price_);
    xw.writeAttribute$String$int(NativeTradeItem.HAGGLE_COUNT_TAG, this.haggleCount);
  }
  /**
   * {@inheritDoc}
   */
  readAttributes(xr: FreeColXMLReader): void {
    super.readAttributes(xr);
    this.price_ = xr.getAttribute$String$int(NativeTradeItem.PRICE_TAG, NativeTradeItem.PRICE_INVALID);
    this.haggleCount = xr.getAttribute$String$int(NativeTradeItem.HAGGLE_COUNT_TAG, -1);
  }
  /**
   * {@inheritDoc}
   */
  getXMLTagName(): string {
    return NativeTradeItem.TAG;
  }
  /**
   * {@inheritDoc}
   */
  equals(o: any): boolean {
    if (!(o instanceof NativeTradeItem)) {
      return false;
    }
    let other = o;
    return this.price_ === other.price_ && this.haggleCount === other.haggleCount && super.equals(other);
  }
  /**
   * {@inheritDoc}
   */
  hashCode(): number {
    let hash = super.hashCode();
    hash = (Math.imul(37, hash) + this.price_) | 0;
    return (Math.imul(37, hash) + this.haggleCount) | 0;
  }
  /**
   * {@inheritDoc}
   */
  toString(): string {
    let sb = new StringBuilder(16);
    sb.append(String.fromCharCode(91 /* '[' */)).append(this.getId()).append(String.fromCharCode(32 /* ' ' */)).append(String(this.goods.getAmount())).append(String.fromCharCode(32 /* ' ' */)).append(Messages.getName$Named(this.goods)).append(String.fromCharCode(32 /* ' ' */)).append(String(this.price_)).append(String.fromCharCode(32 /* ' ' */)).append(String(this.haggleCount)).append(String.fromCharCode(93 /* ']' */));
    return sb.toString();
  }
  static $clinit() {
    NativeTradeItem.descendingPriceComparator = Comparator.thenComparing(Comparator.thenComparingInt(Comparator.reversed((Comparator.comparingInt(($p0) => $p0.getPrice()))), ($p0) => $p0.getHaggleCount()), (nti) => nti.getGoods().getType(), GoodsType.goodsTypeComparator);
  }
}

$J.define(NativeTradeItem, 'net.sf.freecol.common.model.NativeTradeItem', { kind: 'class', sup: 'net.sf.freecol.common.model.GoodsTradeItem', ctors: { 'net.sf.freecol.common.model.Game,net.sf.freecol.common.io.FreeColXMLReader': '_NativeTradeItem$Game$FreeColXMLReader', 'net.sf.freecol.common.model.NativeTradeItem': '_NativeTradeItem$NativeTradeItem', 'net.sf.freecol.common.model.Game,net.sf.freecol.common.model.Player,net.sf.freecol.common.model.Player,net.sf.freecol.common.model.Goods': '_NativeTradeItem$Game$Player$Player$Goods' }, returns: { 'hashCode': 'int', 'getXMLTagName': 'java.lang.String', 'getHaggleCount': 'int', 'getPrice': 'int' }, clinit: true, lazy: ['descendingPriceComparator'] });
$J.module(() => {
  Messages = $J.load('net.sf.freecol.common.i18n.Messages');
  GoodsType = $J.load('net.sf.freecol.common.model.GoodsType');
  CollectionUtils = $J.load('net.sf.freecol.common.util.CollectionUtils');
});
