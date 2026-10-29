// @ts-nocheck
// FreeCol 1.2.0 src/net/sf/freecol/common/model/StanceTradeItem.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
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

let Messages, Stance, StringTemplate, Utils;

/**
 * A trade item consisting of a change of stance.
 */
export class StanceTradeItem extends TradeItem {
  static readonly TAG: string = 'stanceTradeItem';
  /**
   * The stance between source and destination.
   */
  stance: Stance = null;
  static readonly STANCE_TAG: string = 'stance';
  /**
   * Creates a new {@code StanceTradeItem} instance.
   *
   * @param game The enclosing {@code Game}.
   * @param source The source {@code Player}.
   * @param destination The destination {@code Player}.
   * @param stance The {@code Stance} to trade.
   */
  _StanceTradeItem$Game$Player$Player$Stance(game: Game, source: Player, destination: Player, stance: Stance): this {
    this._TradeItem$Game$String$Player$Player(game, Messages.nameKey$String('model.tradeItem.stance'), source, destination);
    this.stance = stance;
    return this;
  }
  /**
   * Creates a new {@code StanceTradeItem} instance.
   *
   * @param game The enclosing {@code Game}.
   * @param xr A {@code FreeColXMLReader} to read from.
   * @exception XMLStreamException if there is an error reading the stream.
   */
  _StanceTradeItem$Game$FreeColXMLReader(game: Game, xr: FreeColXMLReader): this {
    this._TradeItem$Game$FreeColXMLReader(game, xr);
    return this;
  }
  /**
   * {@inheritDoc}
   */
  isValid(): boolean {
    return this.stance != null;
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
    return StringTemplate.key$Named(this.stance);
  }
  /**
   * {@inheritDoc}
   */
  getStance(): Stance {
    return this.stance;
  }
  /**
   * {@inheritDoc}
   */
  setStance(stance: Stance): void {
    this.stance = stance;
  }
  /**
   * {@inheritDoc}
   */
  evaluateFor(player: Player): number {
    let stance = this.getStance();
    let ratio = player.getStrengthRatio(this.getOther(player), false);
    let value = ($J.round(100 * ratio)) | 0;
    switch (stance) {
      case Stance.WAR:
        if (ratio < 0.33) {
          value = TradeItem.INVALID_TRADE_ITEM;
        } else if (ratio < 0.5) {
          value = -value;
        }
        break;
      case Stance.PEACE:
      case Stance.CEASE_FIRE:
      case Stance.ALLIANCE:
        if (ratio > 0.66) {
          value = TradeItem.INVALID_TRADE_ITEM;
        } else if (ratio > 0.5) {
          value = -value;
        } else if (ratio < 0.33) {
          value = 1000;
        }
        break;
      case Stance.UNCONTACTED:
      default:
        value = TradeItem.INVALID_TRADE_ITEM;
        break;
    }
    return value;
  }
  /**
   * {@inheritDoc}
   */
  copyIn<T>(other: T): boolean {
    let o = this.copyInCast(other, $J.cls(StanceTradeItem));
    if (o == null || !super.copyIn(o)) {
      return false;
    }
    this.stance = o.getStance();
    return true;
  }
  /**
   * {@inheritDoc}
   */
  writeAttributes(xw: FreeColXMLWriter): void {
    super.writeAttributes(xw);
    xw.writeAttribute$String$Enum(StanceTradeItem.STANCE_TAG, this.stance);
  }
  /**
   * {@inheritDoc}
   */
  readAttributes(xr: FreeColXMLReader): void {
    super.readAttributes(xr);
    this.stance = xr.getAttribute$String$Class$Enum(StanceTradeItem.STANCE_TAG, $J.cls(Stance), null);
  }
  /**
   * {@inheritDoc}
   */
  getXMLTagName(): string {
    return StanceTradeItem.TAG;
  }
  /**
   * {@inheritDoc}
   */
  equals(o: any): boolean {
    if (o instanceof StanceTradeItem) {
      let other = o;
      return this.stance === other.stance && super.equals(other);
    }
    return false;
  }
  /**
   * {@inheritDoc}
   */
  hashCode(): number {
    let hash = super.hashCode();
    return (Math.imul(37, hash) + Utils.hashCode(this.stance)) | 0;
  }
  /**
   * {@inheritDoc}
   */
  toString(): string {
    let sb = new StringBuilder(16);
    sb.append(String.fromCharCode(91 /* '[' */)).append(this.getId()).append(String.fromCharCode(32 /* ' ' */)).append($J.str(this.stance)).append(String.fromCharCode(93 /* ']' */));
    return sb.toString();
  }
}

$J.define(StanceTradeItem, 'net.sf.freecol.common.model.StanceTradeItem', { kind: 'class', sup: 'net.sf.freecol.common.model.TradeItem', ctors: { 'net.sf.freecol.common.model.Game,net.sf.freecol.common.io.FreeColXMLReader': '_StanceTradeItem$Game$FreeColXMLReader', 'net.sf.freecol.common.model.Game,net.sf.freecol.common.model.Player,net.sf.freecol.common.model.Player,net.sf.freecol.common.model.Stance': '_StanceTradeItem$Game$Player$Player$Stance' }, returns: { 'hashCode': 'int', 'getXMLTagName': 'java.lang.String', 'getStance': 'net.sf.freecol.common.model.Stance', 'getLabel': 'net.sf.freecol.common.model.StringTemplate', 'isUnique': 'boolean', 'isValid': 'boolean' } });
$J.module(() => {
  Messages = $J.load('net.sf.freecol.common.i18n.Messages');
  Stance = $J.load('net.sf.freecol.common.model.Stance');
  StringTemplate = $J.load('net.sf.freecol.common.model.StringTemplate');
  Utils = $J.load('net.sf.freecol.common.util.Utils');
});
