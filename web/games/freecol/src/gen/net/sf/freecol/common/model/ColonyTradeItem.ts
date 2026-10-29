// @ts-nocheck
// FreeCol 1.2.0 src/net/sf/freecol/common/model/ColonyTradeItem.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
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
import { $J, IllegalArgumentException, StringBuilder } from '../../../../../../jre/index.ts';
import { TradeItem } from './TradeItem.ts';

let Messages, Colony, StringTemplate, Utils;

/**
 * A trade item consisting of a colony.
 */
export class ColonyTradeItem extends TradeItem {
  static readonly TAG: string = 'colonyTradeItem';
  /**
   * The identifier of the colony to change hands.
   */
  colonyId: string = null;
  /**
   * The colony name, which is useful when the colony is unknown to
   * the offer recipient.
   */
  colonyName: string = null;
  static readonly COLONY_TAG: string = 'colony';
  static readonly COLONY_NAME_TAG: string = 'colonyName';
  /**
   * Creates a new {@code ColonyTradeItem} instance.
   *
   * @param game The enclosing {@code Game}.
   * @param source The source {@code Player}.
   * @param destination The destination {@code Player}.
   * @param colony The {@code Colony} to trade.
   */
  _ColonyTradeItem$Game$Player$Player$Colony(game: Game, source: Player, destination: Player, colony: Colony): this {
    this._TradeItem$Game$String$Player$Player(game, Messages.nameKey$String('model.tradeItem.colony'), source, destination);
    this.colonyId = colony.getId();
    this.colonyName = colony.getName();
    if (colony.getOwner() !== source) {
      throw new IllegalArgumentException('Bad source for colony ' + colony.getId());
    }
    if (destination == null || !destination.isEuropean()) {
      throw new IllegalArgumentException('Bad destination: ' + $J.str(destination));
    }
    return this;
  }
  /**
   * Creates a new {@code ColonyTradeItem} instance.
   *
   * @param game The enclosing {@code Game}.
   * @param xr The {@code FreeColXMLReader} to read from.
   * @exception XMLStreamException if there is an error reading the stream.
   */
  _ColonyTradeItem$Game$FreeColXMLReader(game: Game, xr: FreeColXMLReader): this {
    this._TradeItem$Game$FreeColXMLReader(game, xr);
    return this;
  }
  getColonyId(): string {
    return this.colonyId;
  }
  getColonyName(): string {
    return this.colonyName;
  }
  /**
   * {@inheritDoc}
   */
  isValid(): boolean {
    return this.colonyId != null;
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
    return StringTemplate.template$String(Messages.descriptionKey$String('model.tradeItem.colony')).addName$String$String('%colony%', this.colonyName);
  }
  /**
   * {@inheritDoc}
   */
  getColony(game: Game): Colony {
    return game.getFreeColGameObject$String$Class(this.colonyId, $J.cls(Colony));
  }
  /**
   * {@inheritDoc}
   */
  evaluateFor(player: Player): number {
    let colony = this.getColony(player.getGame());
    if (colony == null || (this.getSource() === player) !== player.owns(colony)) {
      return TradeItem.INVALID_TRADE_ITEM;
    }
    let value = colony.evaluateFor(player);
    if (value === -2147483648) {
      return TradeItem.INVALID_TRADE_ITEM;
    }
    return (player.owns(colony)) ? -value : value;
  }
  /**
   * {@inheritDoc}
   */
  copyIn<T>(other: T): boolean {
    let o = this.copyInCast(other, $J.cls(ColonyTradeItem));
    if (o == null || !super.copyIn(o)) {
      return false;
    }
    this.colonyId = o.getColonyId();
    this.colonyName = o.getColonyName();
    return true;
  }
  /**
   * {@inheritDoc}
   */
  writeAttributes(xw: FreeColXMLWriter): void {
    super.writeAttributes(xw);
    xw.writeAttribute(ColonyTradeItem.COLONY_TAG, this.colonyId);
    xw.writeAttribute(ColonyTradeItem.COLONY_NAME_TAG, this.colonyName);
  }
  /**
   * {@inheritDoc}
   */
  readAttributes(xr: FreeColXMLReader): void {
    super.readAttributes(xr);
    this.colonyId = xr.getAttribute$String$String(ColonyTradeItem.COLONY_TAG, null);
    this.colonyName = xr.getAttribute$String$String(ColonyTradeItem.COLONY_NAME_TAG, null);
  }
  /**
   * {@inheritDoc}
   */
  getXMLTagName(): string {
    return ColonyTradeItem.TAG;
  }
  /**
   * {@inheritDoc}
   */
  equals(o: any): boolean {
    if (!(o instanceof ColonyTradeItem)) {
      return false;
    }
    let other = o;
    return Utils.equals(this.colonyId, other.colonyId) && Utils.equals(this.colonyName, other.colonyName) && super.equals(other);
  }
  /**
   * {@inheritDoc}
   */
  hashCode(): number {
    let hash = super.hashCode();
    hash = (Math.imul(37, hash) + Utils.hashCode(this.colonyId)) | 0;
    return (Math.imul(37, hash) + Utils.hashCode(this.colonyName)) | 0;
  }
  /**
   * {@inheritDoc}
   */
  toString(): string {
    let sb = new StringBuilder(16);
    sb.append(String.fromCharCode(91 /* '[' */)).append(this.getId()).append(String.fromCharCode(32 /* ' ' */)).append(this.colonyName).append(String.fromCharCode(93 /* ']' */));
    return sb.toString();
  }
}

$J.define(ColonyTradeItem, 'net.sf.freecol.common.model.ColonyTradeItem', { kind: 'class', sup: 'net.sf.freecol.common.model.TradeItem', ctors: { 'net.sf.freecol.common.model.Game,net.sf.freecol.common.io.FreeColXMLReader': '_ColonyTradeItem$Game$FreeColXMLReader', 'net.sf.freecol.common.model.Game,net.sf.freecol.common.model.Player,net.sf.freecol.common.model.Player,net.sf.freecol.common.model.Colony': '_ColonyTradeItem$Game$Player$Player$Colony' }, returns: { 'hashCode': 'int', 'getXMLTagName': 'java.lang.String', 'getLabel': 'net.sf.freecol.common.model.StringTemplate', 'isUnique': 'boolean', 'isValid': 'boolean', 'getColonyName': 'java.lang.String', 'getColonyId': 'java.lang.String' } });
$J.module(() => {
  Messages = $J.load('net.sf.freecol.common.i18n.Messages');
  Colony = $J.load('net.sf.freecol.common.model.Colony');
  StringTemplate = $J.load('net.sf.freecol.common.model.StringTemplate');
  Utils = $J.load('net.sf.freecol.common.util.Utils');
});
