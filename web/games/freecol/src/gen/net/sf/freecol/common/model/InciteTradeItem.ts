// @ts-nocheck
// FreeCol 1.2.0 src/net/sf/freecol/common/model/InciteTradeItem.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
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

let Messages, Player, Stance, StringTemplate, Utils;

/**
 * A trade item consisting of a player to incite war against.
 */
export class InciteTradeItem extends TradeItem {
  static readonly TAG: string = 'inciteTradeItem';
  /**
   * The victim player.
   */
  victim: Player = null;
  static readonly VICTIM_TAG: string = 'victim';
  /**
   * Creates a new {@code InciteTradeItem} inincite.
   *
   * @param game The enclosing {@code Game}.
   * @param source The source {@code Player}.
   * @param destination The destination {@code Player}.
   * @param victim The {@code Player} to incite against.
   */
  _InciteTradeItem$Game$Player$Player$Player(game: Game, source: Player, destination: Player, victim: Player): this {
    this._TradeItem$Game$String$Player$Player(game, Messages.nameKey$String('model.tradeItem.incite'), source, destination);
    this.victim = victim;
    return this;
  }
  /**
   * Creates a new {@code InciteTradeItem} inincite.
   *
   * @param game The enclosing {@code Game}.
   * @param xr A {@code FreeColXMLReader} to read from.
   * @exception XMLStreamException if there is an error reading the stream.
   */
  _InciteTradeItem$Game$FreeColXMLReader(game: Game, xr: FreeColXMLReader): this {
    this._TradeItem$Game$FreeColXMLReader(game, xr);
    return this;
  }
  /**
   * {@inheritDoc}
   */
  isValid(): boolean {
    return this.victim != null && this.victim !== this.getSource() && this.victim !== this.getDestination();
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
    return StringTemplate.template$String(Messages.descriptionKey$String('model.tradeItem.incite')).addStringTemplate$String$StringTemplate('%nation%', this.victim.getNationLabel());
  }
  /**
   * {@inheritDoc}
   */
  getVictim(): Player {
    return this.victim;
  }
  /**
   * {@inheritDoc}
   */
  evaluateFor(player: Player): number {
    let victim = this.getVictim();
    switch (player.getStance(victim)) {
      case Stance.ALLIANCE:
        return TradeItem.INVALID_TRADE_ITEM;
      case Stance.WAR:
        return 0;
      default:
        break;
    }
    return -(($J.round(50 / player.getStrengthRatio(victim, false))) | 0);
  }
  /**
   * {@inheritDoc}
   */
  copyIn<T>(other: T): boolean {
    let o = this.copyInCast(other, $J.cls(InciteTradeItem));
    if (o == null || !super.copyIn(o)) {
      return false;
    }
    this.victim = this.getGame().updateRef$FreeColGameObject(o.getVictim());
    return true;
  }
  /**
   * {@inheritDoc}
   */
  writeAttributes(xw: FreeColXMLWriter): void {
    super.writeAttributes(xw);
    xw.writeAttribute$String$FreeColObject(InciteTradeItem.VICTIM_TAG, this.victim);
  }
  /**
   * {@inheritDoc}
   */
  readAttributes(xr: FreeColXMLReader): void {
    super.readAttributes(xr);
    this.victim = xr.findFreeColGameObject(this.getGame(), InciteTradeItem.VICTIM_TAG, $J.cls(Player), null, true);
  }
  /**
   * {@inheritDoc}
   */
  getXMLTagName(): string {
    return InciteTradeItem.TAG;
  }
  /**
   * {@inheritDoc}
   */
  equals(o: any): boolean {
    if (!(o instanceof InciteTradeItem)) {
      return false;
    }
    let other = o;
    return Utils.equals(this.victim, other.victim) && super.equals(other);
  }
  /**
   * {@inheritDoc}
   */
  hashCode(): number {
    let hash = super.hashCode();
    return (Math.imul(37, hash) + Utils.hashCode(this.victim)) | 0;
  }
  /**
   * {@inheritDoc}
   */
  toString(): string {
    let sb = new StringBuilder(16);
    sb.append(String.fromCharCode(91 /* '[' */)).append(this.getId()).append(String.fromCharCode(32 /* ' ' */)).append(this.victim.getId()).append(String.fromCharCode(93 /* ']' */));
    return sb.toString();
  }
}

$J.define(InciteTradeItem, 'net.sf.freecol.common.model.InciteTradeItem', { kind: 'class', sup: 'net.sf.freecol.common.model.TradeItem', ctors: { 'net.sf.freecol.common.model.Game,net.sf.freecol.common.io.FreeColXMLReader': '_InciteTradeItem$Game$FreeColXMLReader', 'net.sf.freecol.common.model.Game,net.sf.freecol.common.model.Player,net.sf.freecol.common.model.Player,net.sf.freecol.common.model.Player': '_InciteTradeItem$Game$Player$Player$Player' }, returns: { 'hashCode': 'int', 'getXMLTagName': 'java.lang.String', 'getVictim': 'net.sf.freecol.common.model.Player', 'getLabel': 'net.sf.freecol.common.model.StringTemplate', 'isUnique': 'boolean', 'isValid': 'boolean' } });
$J.module(() => {
  Messages = $J.load('net.sf.freecol.common.i18n.Messages');
  Player = $J.load('net.sf.freecol.common.model.Player');
  Stance = $J.load('net.sf.freecol.common.model.Stance');
  StringTemplate = $J.load('net.sf.freecol.common.model.StringTemplate');
  Utils = $J.load('net.sf.freecol.common.util.Utils');
});
