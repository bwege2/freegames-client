// @ts-nocheck
// FreeCol 1.2.0 src/net/sf/freecol/common/model/GoldTradeItem.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
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

let Messages, ColonyTradeItem, Constants, StringTemplate;

/**
 * A trade item consisting of just some gold.
 */
export class GoldTradeItem extends TradeItem {
  static readonly TAG: string = 'goldTradeItem';
  /**
   * The amount of gold to change hands.
   */
  gold: number = 0;
  static readonly GOLD_TAG: string = 'gold';
  /**
   * Creates a new {@code GoldTradeItem} instance.
   *
   * @param game The enclosing {@code Game}.
   * @param source The source {@code Player}.
   * @param destination The destination {@code Player}.
   * @param gold The amount of gold.
   */
  _GoldTradeItem$Game$Player$Player$int(game: Game, source: Player, destination: Player, gold: number): this {
    this._TradeItem$Game$String$Player$Player(game, Messages.nameKey$String('model.tradeItem.gold'), source, destination);
    this.gold = gold;
    return this;
  }
  /**
   * Creates a new {@code GoldTradeItem} instance.
   *
   * @param game The enclosing {@code Game}.
   * @param xr The {@code FreeColXMLReader} to read from.
   * @exception XMLStreamException if there is an error reading the stream.
   */
  _GoldTradeItem$Game$FreeColXMLReader(game: Game, xr: FreeColXMLReader): this {
    this._TradeItem$Game$FreeColXMLReader(game, xr);
    return this;
  }
  /**
   * {@inheritDoc}
   */
  isValid(): boolean {
    return this.gold >= 0 && this.getSource().checkGold(this.gold);
  }
  /**
   * {@inheritDoc}
   */
  isUnique(): boolean {
    return true;
  }
  /**
   * {@inheritDoc}
   */
  getLabel(): StringTemplate {
    return StringTemplate.template$String(Messages.descriptionKey$String('model.tradeItem.gold')).addAmount('%amount%', this.gold);
  }
  /**
   * {@inheritDoc}
   */
  getGold(): number {
    return this.gold;
  }
  /**
   * {@inheritDoc}
   */
  setGold(gold: number): void {
    this.gold = gold;
  }
  /**
   * {@inheritDoc}
   */
  evaluateFor(player: Player): number {
    return (!this.isValid()) ? TradeItem.INVALID_TRADE_ITEM : (this.getSource() === player) ? -this.getGold() : this.getGold();
  }
  /**
   * {@inheritDoc}
   */
  copyIn<T>(other: T): boolean {
    let o = this.copyInCast(other, $J.cls(ColonyTradeItem));
    if (o == null || !super.copyIn(o)) {
      return false;
    }
    this.gold = o.getGold();
    return true;
  }
  /**
   * {@inheritDoc}
   */
  writeAttributes(xw: FreeColXMLWriter): void {
    super.writeAttributes(xw);
    xw.writeAttribute$String$int(GoldTradeItem.GOLD_TAG, this.gold);
  }
  /**
   * {@inheritDoc}
   */
  readAttributes(xr: FreeColXMLReader): void {
    super.readAttributes(xr);
    this.gold = xr.getAttribute$String$int(GoldTradeItem.GOLD_TAG, Constants.UNDEFINED);
  }
  /**
   * {@inheritDoc}
   */
  getXMLTagName(): string {
    return GoldTradeItem.TAG;
  }
  /**
   * {@inheritDoc}
   */
  equals(other: any): boolean {
    if (other instanceof GoldTradeItem) {
      return this.gold === (other).gold && super.equals(other);
    }
    return false;
  }
  /**
   * {@inheritDoc}
   */
  hashCode(): number {
    let hash = super.hashCode();
    return (Math.imul(37, hash) + this.gold) | 0;
  }
  /**
   * {@inheritDoc}
   */
  toString(): string {
    let sb = new StringBuilder(16);
    sb.append(String.fromCharCode(91 /* '[' */)).append(this.getId()).append(String.fromCharCode(32 /* ' ' */)).append(String(this.gold)).append(String.fromCharCode(93 /* ']' */));
    return sb.toString();
  }
}

$J.define(GoldTradeItem, 'net.sf.freecol.common.model.GoldTradeItem', { kind: 'class', sup: 'net.sf.freecol.common.model.TradeItem', ctors: { 'net.sf.freecol.common.model.Game,net.sf.freecol.common.io.FreeColXMLReader': '_GoldTradeItem$Game$FreeColXMLReader', 'net.sf.freecol.common.model.Game,net.sf.freecol.common.model.Player,net.sf.freecol.common.model.Player,int': '_GoldTradeItem$Game$Player$Player$int' }, returns: { 'hashCode': 'int', 'getXMLTagName': 'java.lang.String', 'getGold': 'int', 'getLabel': 'net.sf.freecol.common.model.StringTemplate', 'isUnique': 'boolean', 'isValid': 'boolean' } });
$J.module(() => {
  Messages = $J.load('net.sf.freecol.common.i18n.Messages');
  ColonyTradeItem = $J.load('net.sf.freecol.common.model.ColonyTradeItem');
  Constants = $J.load('net.sf.freecol.common.model.Constants');
  StringTemplate = $J.load('net.sf.freecol.common.model.StringTemplate');
});
