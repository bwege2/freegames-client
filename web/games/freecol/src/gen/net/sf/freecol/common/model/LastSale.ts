// @ts-nocheck
// FreeCol 1.2.0 src/net/sf/freecol/common/model/LastSale.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
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
import { $J, StringBuilder } from '../../../../../../jre/index.ts';
import { FreeColObject } from './FreeColObject.ts';

let Turn;

/**
 * This class contains the last sale a player has made, by Settlement
 * and GoodsType.
 */
export class LastSale extends FreeColObject {
  static readonly TAG: string = 'lastSale';
  /**
   * When a sale was made.
   */
  when: Turn = null;
  /**
   * The price per unit returned from the sale.
   */
  price_: number = 0;
  static readonly PRICE_TAG: string = 'price';
  static readonly WHEN_TAG: string = 'when';
  /**
   * Trivial constructor to allow creation with Game.newInstance.
   */
  _LastSale$(): this {
    this._FreeColObject();
    return this;
  }
  /**
   * Make a new LastSale record.
   *
   * @param where The {@code Location} of the sale.
   * @param what The {@code GoodsType} sold.
   * @param when In which {@code Turn} the sale occurred.
   * @param price The per-unit price of the sale.
   */
  _LastSale$Location$GoodsType$Turn$int(where: Location, what: GoodsType, when: Turn, price: number): this {
    this._LastSale$String$Turn$int(LastSale.makeKey(where, what), when, price);
    return this;
  }
  /**
   * Make a new LastSale record.
   *
   * @param id The object identifier.
   * @param when In which {@code Turn} the sale occurred.
   * @param price The per-unit price of the sale.
   */
  _LastSale$String$Turn$int(id: string, when: Turn, price: number): this {
    this._FreeColObject();
    this.setId(id);
    this.when = when;
    this.price_ = price;
    return this;
  }
  /**
   * Create a new last sale by reading a stream.
   *
   * @param xr The {@code FreeColXMLReader} to read from.
   * @exception XMLStreamException if there is a problem reading the stream.
   */
  _LastSale$FreeColXMLReader(xr: FreeColXMLReader): this {
    this._FreeColObject();
    this.readFromXML(xr);
    return this;
  }
  /**
   * Get the {@code Turn} when the sale was made.
   *
   * @return The {@code Turn} when the sale was made.
   */
  getWhen(): Turn {
    return this.when;
  }
  /**
   * Get the price from the sale.
   *
   * @return The price from the sale.
   */
  getPrice(): number {
    return this.price_;
  }
  /**
   * Make a String to be used as a key for looking up sales.
   *
   * @param where The {@code Location} of the sale.
   * @param what The {@code GoodsType} sold.
   *
   * @return A key string.
   */
  static makeKey(where: Location, what: GoodsType): string {
    return what.getId() + '-' + where.getId();
  }
  /**
   * {@inheritDoc}
   */
  copyIn<T>(other: T): boolean {
    let o = this.copyInCast(other, $J.cls(LastSale));
    if (o == null || !super.copyIn(o)) {
      return false;
    }
    this.when = o.getWhen();
    this.price_ = o.getPrice();
    return true;
  }
  /**
   * {@inheritDoc}
   */
  writeAttributes(xw: FreeColXMLWriter): void {
    super.writeAttributes(xw);
    xw.writeAttribute$String$int(LastSale.WHEN_TAG, this.when.getNumber());
    xw.writeAttribute$String$int(LastSale.PRICE_TAG, this.price_);
  }
  /**
   * {@inheritDoc}
   */
  readAttributes(xr: FreeColXMLReader): void {
    super.readAttributes(xr);
    this.when = new Turn()._Turn(xr.getAttribute$String$int(LastSale.WHEN_TAG, 0));
    this.price_ = xr.getAttribute$String$int(LastSale.PRICE_TAG, 0);
  }
  /**
   * {@inheritDoc}
   */
  getXMLTagName(): string {
    return LastSale.TAG;
  }
  /**
   * {@inheritDoc}
   */
  toString(): string {
    let sb = new StringBuilder(32);
    sb.append(String.fromCharCode(91 /* '[' */)).append(this.getId()).append(' when=').append($J.str(this.when)).append(' price=').append(String(this.price_)).append(String.fromCharCode(93 /* ']' */));
    return sb.toString();
  }
}

$J.define(LastSale, 'net.sf.freecol.common.model.LastSale', { kind: 'class', sup: 'net.sf.freecol.common.model.FreeColObject', ctors: { 'net.sf.freecol.common.io.FreeColXMLReader': '_LastSale$FreeColXMLReader', 'java.lang.String,net.sf.freecol.common.model.Turn,int': '_LastSale$String$Turn$int', 'net.sf.freecol.common.model.Location,net.sf.freecol.common.model.GoodsType,net.sf.freecol.common.model.Turn,int': '_LastSale$Location$GoodsType$Turn$int', '': '_LastSale$' }, returns: { 'getXMLTagName': 'java.lang.String', 'getPrice': 'int', 'getWhen': 'net.sf.freecol.common.model.Turn' } });
$J.module(() => {
  Turn = $J.load('net.sf.freecol.common.model.Turn');
});
