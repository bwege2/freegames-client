// @ts-nocheck
// FreeCol 1.2.0 src/net/sf/freecol/common/model/TradeItem.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
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
import { $J } from '../../../../../../jre/index.ts';
import { FreeColGameObject } from './FreeColGameObject.ts';

let Player, Utils;

/**
 * One of the items a DiplomaticTrade consists of.
 */
export class TradeItem extends FreeColGameObject {
  /**
   * Flag for validity tests.
   */
  static readonly INVALID_TRADE_ITEM: number = -2147483648;
  /**
   * The player who is to provide this item.
   */
  source: Player = null;
  /**
   * The player who is to receive this item.
   */
  destination: Player = null;
  static readonly DESTINATION_TAG: string = 'destination';
  static readonly SOURCE_TAG: string = 'source';
  /**
   * Creates a new {@code TradeItem} instance.
   *
   * @param game The enclosing {@code Game}.
   * @param id The object identifier.
   * @param source The source {@code Player}.
   * @param destination The destination {@code Player}.
   */
  _TradeItem$Game$String$Player$Player(game: Game, id: string, source: Player, destination: Player): this {
    this._FreeColGameObject$Game$String(game, id);
    this.source = source;
    this.destination = destination;
    return this;
  }
  /**
   * Creates a new {@code TradeItem} instance.
   *
   * @param game The enclosing {@code Game}.
   * @param xr The {@code FreeColXMLReader} to read from.
   * @exception XMLStreamException if there is a problem reading the stream.
   */
  _TradeItem$Game$FreeColXMLReader(game: Game, xr: FreeColXMLReader): this {
    this._FreeColGameObject$Game$String(game, '');
    this.readFromXML(xr);
    return this;
  }
  /**
   * Get the source player.
   *
   * @return The source {@code Player}.
   */
  getSource(): Player {
    return this.source;
  }
  /**
   * Set the source player.
   *
   * @param newSource The new source {@code Player}.
   */
  setSource(newSource: Player): void {
    this.source = newSource;
  }
  /**
   * Get the destination player.
   *
   * @return The destination {@code Player}.
   */
  getDestination(): Player {
    return this.destination;
  }
  /**
   * Set the destination player.
   *
   * @param newDestination The new destination {@code Player}.
   */
  setDestination(newDestination: Player): void {
    this.destination = newDestination;
  }
  /**
   * Get the other player for this trade item.
   *
   * @param player The {@code Player} we do not want.
   * @return The {@code Player} we want.
   */
  getOther(player: Player): Player {
    return (player === this.source) ? this.destination : this.source;
  }
  /**
   * Get the colony to trade.
   *
   * @param game A {@code Game} to look for the colony in.
   * @return The {@code Colony} to trade.
   */
  getColony(game: Game): Colony {
    return null;
  }
  /**
   * Get the goods to trade.
   *
   * @return The {@code Goods} to trade.
   */
  getGoods(): Goods {
    return null;
  }
  /**
   * Set the goods to trade.
   *
   * @param goods The new {@code Goods} to trade.
   */
  setGoods(goods: Goods): void {
  }
  /**
   * Get the gold to trade.
   *
   * @return The gold to trade.
   */
  getGold(): number {
    return 0;
  }
  /**
   * Set the gold to trade.
   *
   * @param gold The new gold to trade.
   */
  setGold(gold: number): void {
  }
  /**
   * Get the victim player to incite war against.
   *
   * @return The {@code Player} to trade.
   */
  getVictim(): Player {
    return null;
  }
  /**
   * Get the stance to trade.
   *
   * @return The {@code Stance} to trade.
   */
  getStance(): Stance {
    return null;
  }
  /**
   * Set the stance to trade.
   *
   * @param stance The new {@code Stance} to trade.
   */
  setStance(stance: Stance): void {
  }
  /**
   * Get the unit to trade.
   *
   * @return The {@code Unit} to trade.
   */
  getUnit(): Unit {
    return null;
  }
  /**
   * Set the unit to trade.
   *
   * @param unit The new {@code Unit} to trade.
   */
  setUnit(unit: Unit): void {
  }
  /**
   * {@inheritDoc}
   */
  isInternable(): boolean {
    return false;
  }
  /**
   * {@inheritDoc}
   */
  copyIn<T>(other: T): boolean {
    let o = this.copyInCast(other, $J.cls(TradeItem));
    if (o == null || !super.copyIn(o)) {
      return false;
    }
    let game = this.getGame();
    this.source = game.updateRef$FreeColGameObject(o.getSource());
    this.destination = game.updateRef$FreeColGameObject(o.getDestination());
    return true;
  }
  /**
   * {@inheritDoc}
   */
  writeAttributes(xw: FreeColXMLWriter): void {
    super.writeAttributes(xw);
    xw.writeAttribute$String$FreeColObject(TradeItem.SOURCE_TAG, this.source);
    xw.writeAttribute$String$FreeColObject(TradeItem.DESTINATION_TAG, this.destination);
  }
  /**
   * {@inheritDoc}
   */
  readAttributes(xr: FreeColXMLReader): void {
    super.readAttributes(xr);
    this.source = xr.getAttribute$Game$String$Class$FreeColObject(this.getGame(), TradeItem.SOURCE_TAG, $J.cls(Player), null);
    this.destination = xr.getAttribute$Game$String$Class$FreeColObject(this.getGame(), TradeItem.DESTINATION_TAG, $J.cls(Player), null);
  }
  /**
   * {@inheritDoc}
   */
  equals(o: any): boolean {
    if (!(o instanceof TradeItem)) {
      return false;
    }
    let other = o;
    return Utils.equals(this.source, other.source) && Utils.equals(this.destination, other.destination) && super.equals(other);
  }
  /**
   * {@inheritDoc}
   */
  hashCode(): number {
    let hash = super.hashCode();
    hash = (Math.imul(37, hash) + Utils.hashCode(this.source)) | 0;
    return (Math.imul(37, hash) + Utils.hashCode(this.destination)) | 0;
  }
}

$J.define(TradeItem, 'net.sf.freecol.common.model.TradeItem', { kind: 'class', sup: 'net.sf.freecol.common.model.FreeColGameObject', ctors: { 'net.sf.freecol.common.model.Game,net.sf.freecol.common.io.FreeColXMLReader': '_TradeItem$Game$FreeColXMLReader', 'net.sf.freecol.common.model.Game,java.lang.String,net.sf.freecol.common.model.Player,net.sf.freecol.common.model.Player': '_TradeItem$Game$String$Player$Player' }, returns: { 'hashCode': 'int', 'isInternable': 'boolean', 'getUnit': 'net.sf.freecol.common.model.Unit', 'getStance': 'net.sf.freecol.common.model.Stance', 'getVictim': 'net.sf.freecol.common.model.Player', 'getGold': 'int', 'getGoods': 'net.sf.freecol.common.model.Goods', 'getLabel': 'net.sf.freecol.common.model.StringTemplate', 'isUnique': 'boolean', 'isValid': 'boolean', 'getDestination': 'net.sf.freecol.common.model.Player', 'getSource': 'net.sf.freecol.common.model.Player' } });
$J.module(() => {
  Player = $J.load('net.sf.freecol.common.model.Player');
  Utils = $J.load('net.sf.freecol.common.util.Utils');
});
