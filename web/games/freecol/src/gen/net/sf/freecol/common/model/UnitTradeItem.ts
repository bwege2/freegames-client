// @ts-nocheck
// FreeCol 1.2.0 src/net/sf/freecol/common/model/UnitTradeItem.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
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
import { TradeItem } from './TradeItem.ts';

let Messages, Unit, Utils;

/**
 * A trade item consisting of a unit.
 */
export class UnitTradeItem extends TradeItem {
  static readonly TAG: string = 'unitTradeItem';
  /**
   * The unit to change hands.
   */
  unit: Unit = null;
  static readonly UNIT_TAG: string = 'unit';
  /**
   * Creates a new {@code UnitTradeItem} instance.
   *
   * @param game The enclosing {@code Game}.
   * @param source The source {@code Player}.
   * @param destination The destination {@code Player}.
   * @param unit The {@code Unit} to trade.
   */
  _UnitTradeItem$Game$Player$Player$Unit(game: Game, source: Player, destination: Player, unit: Unit): this {
    this._TradeItem$Game$String$Player$Player(game, Messages.nameKey$String('model.tradeItem.unit'), source, destination);
    this.unit = unit;
    return this;
  }
  /**
   * Creates a new {@code UnitTradeItem} instance.
   *
   * @param game The enclosing {@code Game}.
   * @param xr The {@code FreeColXMLReader} to read from.
   * @exception XMLStreamException if there is a problem reading the stream.
   */
  _UnitTradeItem$Game$FreeColXMLReader(game: Game, xr: FreeColXMLReader): this {
    this._TradeItem$Game$FreeColXMLReader(game, xr);
    return this;
  }
  /**
   * {@inheritDoc}
   */
  isValid(): boolean {
    return this.unit.getOwner() === this.getSource() && this.unit.getType().isAvailableTo([this.getDestination()]);
  }
  /**
   * {@inheritDoc}
   */
  isUnique(): boolean {
    return false;
  }
  /**
   * {@inheritDoc}
   */
  getLabel(): StringTemplate {
    return this.unit.getLabel$();
  }
  /**
   * {@inheritDoc}
   */
  getUnit(): Unit {
    return this.unit;
  }
  /**
   * {@inheritDoc}
   */
  setUnit(unit: Unit): void {
    this.unit = unit;
  }
  /**
   * {@inheritDoc}
   */
  evaluateFor(player: Player): number {
    let unit = this.getUnit();
    return (!this.isValid()) ? TradeItem.INVALID_TRADE_ITEM : (this.getSource() === player) ? ((player.isAI() && player.getUnitCount$() < 10) ? TradeItem.INVALID_TRADE_ITEM : -unit.evaluateFor(player)) : unit.evaluateFor(player);
  }
  /**
   * {@inheritDoc}
   */
  copyIn<T>(other: T): boolean {
    let o = this.copyInCast(other, $J.cls(UnitTradeItem));
    if (o == null || !super.copyIn(o)) {
      return false;
    }
    this.unit = this.getGame().updateRef$FreeColGameObject(o.getUnit());
    return true;
  }
  /**
   * {@inheritDoc}
   */
  writeAttributes(xw: FreeColXMLWriter): void {
    super.writeAttributes(xw);
    xw.writeAttribute$String$FreeColObject(UnitTradeItem.UNIT_TAG, this.unit);
  }
  /**
   * {@inheritDoc}
   */
  readAttributes(xr: FreeColXMLReader): void {
    super.readAttributes(xr);
    this.unit = xr.getAttribute$Game$String$Class$FreeColObject(this.getGame(), UnitTradeItem.UNIT_TAG, $J.cls(Unit), null);
  }
  /**
   * {@inheritDoc}
   */
  getXMLTagName(): string {
    return UnitTradeItem.TAG;
  }
  /**
   * {@inheritDoc}
   */
  equals(other: any): boolean {
    if (other instanceof UnitTradeItem) {
      return Utils.equals(this.unit, (other).unit) && super.equals(other);
    }
    return false;
  }
  /**
   * {@inheritDoc}
   */
  hashCode(): number {
    let hash = super.hashCode();
    return (Math.imul(37, hash) + Utils.hashCode(this.unit)) | 0;
  }
  /**
   * {@inheritDoc}
   */
  toString(): string {
    let sb = new StringBuilder(16);
    sb.append(String.fromCharCode(91 /* '[' */)).append(this.getId()).append(String.fromCharCode(32 /* ' ' */)).append(this.unit.getId()).append(String.fromCharCode(93 /* ']' */));
    return sb.toString();
  }
}

$J.define(UnitTradeItem, 'net.sf.freecol.common.model.UnitTradeItem', { kind: 'class', sup: 'net.sf.freecol.common.model.TradeItem', ctors: { 'net.sf.freecol.common.model.Game,net.sf.freecol.common.io.FreeColXMLReader': '_UnitTradeItem$Game$FreeColXMLReader', 'net.sf.freecol.common.model.Game,net.sf.freecol.common.model.Player,net.sf.freecol.common.model.Player,net.sf.freecol.common.model.Unit': '_UnitTradeItem$Game$Player$Player$Unit' }, returns: { 'hashCode': 'int', 'getXMLTagName': 'java.lang.String', 'getUnit': 'net.sf.freecol.common.model.Unit', 'getLabel': 'net.sf.freecol.common.model.StringTemplate', 'isUnique': 'boolean', 'isValid': 'boolean' } });
$J.module(() => {
  Messages = $J.load('net.sf.freecol.common.i18n.Messages');
  Unit = $J.load('net.sf.freecol.common.model.Unit');
  Utils = $J.load('net.sf.freecol.common.util.Utils');
});
