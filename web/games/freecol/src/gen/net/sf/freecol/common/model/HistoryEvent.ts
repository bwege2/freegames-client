// @ts-nocheck
// FreeCol 1.2.0 src/net/sf/freecol/common/model/HistoryEvent.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
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
import { $J, JEnum, StringBuilder } from '../../../../../../jre/index.ts';
import { StringTemplate } from './StringTemplate.ts';

let Messages, Stance, StringTemplate$TemplateType, Turn, StringUtils, Utils;

/**
 * A notable event in the history of a game.
 */
export class HistoryEvent extends StringTemplate {
  static readonly TAG: string = 'historyEvent';
  /**
   * The turn in which the event took place
   */
  turn: Turn = null;
  /**
   * The type of event.
   */
  eventType: HistoryEvent$HistoryEventType = null;
  /**
   * Which player gets credit for the event, if any.
   */
  playerId: string = null;
  /**
   * Points for this event, if any.
   */
  score: number = 0;
  static readonly EVENT_TYPE_TAG: string = 'eventType';
  static readonly PLAYER_ID_TAG: string = 'playerId';
  static readonly SCORE_TAG: string = 'score';
  static readonly TURN_TAG: string = 'turn';
  /**
   * Trivial constructor to allow creation with Game.newInstance.
   */
  _HistoryEvent$(): this {
    this._StringTemplate$();
    return this;
  }
  /**
   * Create a new history event of given turn and type.
   *
   * @param turn The {@code Turn} of the event.
   * @param eventType The {@code EventType}.
   * @param player An optional {@code Player} responsible for
   *     this event.
   */
  _HistoryEvent$Turn$HistoryEventType$Player(turn: Turn, eventType: HistoryEvent$HistoryEventType, player: Player): this {
    this._StringTemplate$String$String$TemplateType(eventType.getDescriptionKey(), null, StringTemplate$TemplateType.TEMPLATE);
    this.turn = turn;
    this.eventType = eventType;
    this.playerId = (player == null) ? null : player.getId();
    this.score = 0;
    return this;
  }
  /**
   * Create a new history event by reading a stream.
   *
   * @param xr The {@code FreeColXMLReader} to read from.
   * @exception XMLStreamException if there is a problem reading the stream.
   */
  _HistoryEvent$FreeColXMLReader(xr: FreeColXMLReader): this {
    this._StringTemplate$();
    this.readFromXML(xr);
    return this;
  }
  /**
   * Get the turn of this history event.
   *
   * @return The turn.
   */
  getTurn(): Turn {
    return this.turn;
  }
  /**
   * Get the type of this history event.
   *
   * @return The event type.
   */
  getEventType(): HistoryEvent$HistoryEventType {
    return this.eventType;
  }
  /**
   * Given a new stance, get the appropriate event type.
   *
   * @param stance The new {@code Stance}.
   * @return The corresponding event type.
   */
  static getEventTypeFromStance(stance: Stance): HistoryEvent$HistoryEventType {
    switch (stance) {
      case Stance.WAR:
        return HistoryEvent$HistoryEventType.DECLARE_WAR;
      case Stance.CEASE_FIRE:
        return HistoryEvent$HistoryEventType.CEASE_FIRE;
      case Stance.PEACE:
        return HistoryEvent$HistoryEventType.MAKE_PEACE;
      case Stance.ALLIANCE:
        return HistoryEvent$HistoryEventType.FORM_ALLIANCE;
      default:
        break;
    }
    return null;
  }
  /**
   * Get the id for the player that is credited with this event, if any.
   *
   * @return The credited {@code Player} id.
   */
  getPlayerId(): string {
    return this.playerId;
  }
  /**
   * Set the id for the player to credit for this event.
   *
   * @param playerId The new credited {@code Player} id.
   */
  setPlayerId(playerId: string): void {
    this.playerId = playerId;
  }
  /**
   * Get the score for this event.
   *
   * @return The score.
   */
  getScore(): number {
    return this.score;
  }
  /**
   * Set the score for this event.
   *
   * @param score The new score for this event.
   */
  setScore(score: number): void {
    this.score = score;
  }
  /**
   * {@inheritDoc}
   */
  copyIn<T>(other: T): boolean {
    let o = this.copyInCast(other, $J.cls(HistoryEvent));
    if (o == null || !super.copyIn(o)) {
      return false;
    }
    this.turn = o.getTurn();
    this.eventType = o.getEventType();
    this.playerId = o.getPlayerId();
    this.score = o.getScore();
    return true;
  }
  /**
   * {@inheritDoc}
   */
  writeAttributes(xw: FreeColXMLWriter): void {
    super.writeAttributes(xw);
    xw.writeAttribute$String$int(HistoryEvent.TURN_TAG, this.turn.getNumber());
    xw.writeAttribute$String$Enum(HistoryEvent.EVENT_TYPE_TAG, this.eventType);
    if (this.playerId != null) {
      xw.writeAttribute(HistoryEvent.PLAYER_ID_TAG, this.playerId);
    }
    xw.writeAttribute$String$int(HistoryEvent.SCORE_TAG, this.score);
  }
  /**
   * {@inheritDoc}
   */
  readAttributes(xr: FreeColXMLReader): void {
    super.readAttributes(xr);
    this.turn = new Turn()._Turn(xr.getAttribute$String$int(HistoryEvent.TURN_TAG, 0));
    this.eventType = xr.getAttribute$String$Class$Enum(HistoryEvent.EVENT_TYPE_TAG, $J.cls(HistoryEvent$HistoryEventType), null);
    this.playerId = xr.getAttribute$String$String(HistoryEvent.PLAYER_ID_TAG, null);
    this.score = xr.getAttribute$String$int(HistoryEvent.SCORE_TAG, 0);
  }
  /**
   * {@inheritDoc}
   */
  getXMLTagName(): string {
    return HistoryEvent.TAG;
  }
  /**
   * {@inheritDoc}
   */
  equals(o: any): boolean {
    if (this === o) {
      return true;
    }
    if (o instanceof HistoryEvent) {
      let other = o;
      return this.turn === other.turn && this.eventType === other.eventType && this.score === other.score && Utils.equals(this.playerId, other.playerId) && super.equals(other);
    }
    return false;
  }
  /**
   * {@inheritDoc}
   */
  hashCode(): number {
    let hash = super.hashCode();
    hash = (Math.imul(31, hash) + this.turn.hashCode()) | 0;
    hash = (Math.imul(31, hash) + this.eventType.ordinal()) | 0;
    if (this.playerId != null) {
      hash = (Math.imul(31, hash) + $J.hashCode(this.playerId)) | 0;
    }
    hash = (Math.imul(31, hash) + this.score) | 0;
    return hash;
  }
  /**
   * {@inheritDoc}
   */
  toString(): string {
    let sb = new StringBuilder(32);
    sb.append(String.fromCharCode(91 /* '[' */)).append(this.getId()).append(String.fromCharCode(32 /* ' ' */)).append($J.str(this.eventType)).append(' (').append(String(this.turn.getYear())).append(String.fromCharCode(41 /* ')' */));
    if (this.playerId != null) {
      sb.append(' playerId=').append(this.playerId).append(' score=').append(String(this.score));
    }
    sb.append(String.fromCharCode(32 /* ' ' */)).append(super.toString()).append(String.fromCharCode(93 /* ']' */));
    return sb.toString();
  }
}

export class HistoryEvent$HistoryEventType extends JEnum {
  static DISCOVER_NEW_WORLD: HistoryEvent$HistoryEventType = null;
  static DISCOVER_REGION: HistoryEvent$HistoryEventType = null;
  static MEET_NATION: HistoryEvent$HistoryEventType = null;
  static CITY_OF_GOLD: HistoryEvent$HistoryEventType = null;
  static FOUND_COLONY: HistoryEvent$HistoryEventType = null;
  static ABANDON_COLONY: HistoryEvent$HistoryEventType = null;
  static CONQUER_COLONY: HistoryEvent$HistoryEventType = null;
  static COLONY_DESTROYED: HistoryEvent$HistoryEventType = null;
  static COLONY_CONQUERED: HistoryEvent$HistoryEventType = null;
  static DESTROY_SETTLEMENT: HistoryEvent$HistoryEventType = null;
  static DESTROY_NATION: HistoryEvent$HistoryEventType = null;
  static FOUNDING_FATHER: HistoryEvent$HistoryEventType = null;
  static DECLARE_INDEPENDENCE: HistoryEvent$HistoryEventType = null;
  static INDEPENDENCE: HistoryEvent$HistoryEventType = null;
  static SPANISH_SUCCESSION: HistoryEvent$HistoryEventType = null;
  static DECLARE_WAR: HistoryEvent$HistoryEventType = null;
  static CEASE_FIRE: HistoryEvent$HistoryEventType = null;
  static MAKE_PEACE: HistoryEvent$HistoryEventType = null;
  static FORM_ALLIANCE: HistoryEvent$HistoryEventType = null;
  static NATION_DESTROYED: HistoryEvent$HistoryEventType = null;
  static $VALUES: HistoryEvent$HistoryEventType[] = null;
  _HistoryEvent$HistoryEventType($name: string, $ordinal: number): this {
    this._JEnum($name, $ordinal);
    return this;
  }
  /**
   * Get the stem key.
   *
   * @return The stem key for this history event type.
   */
  getKey(): string {
    return 'historyEventType.' + StringUtils.getEnumKey(this);
  }
  getDescriptionKey(): string {
    return Messages.descriptionKey$String('model.' + this.getKey());
  }
  /**
   * {@inheritDoc}
   */
  getNameKey(): string {
    return Messages.nameKey$String('model.' + this.getKey());
  }
  static values(): HistoryEvent$HistoryEventType[] { return HistoryEvent$HistoryEventType.$VALUES.slice(); }
  static valueOf(name: string): HistoryEvent$HistoryEventType { return $J.enumValueOf(HistoryEvent$HistoryEventType, name); }
  static $clinit() {
    HistoryEvent$HistoryEventType.DISCOVER_NEW_WORLD = new HistoryEvent$HistoryEventType()._HistoryEvent$HistoryEventType('DISCOVER_NEW_WORLD', 0);
    HistoryEvent$HistoryEventType.DISCOVER_REGION = new HistoryEvent$HistoryEventType()._HistoryEvent$HistoryEventType('DISCOVER_REGION', 1);
    HistoryEvent$HistoryEventType.MEET_NATION = new HistoryEvent$HistoryEventType()._HistoryEvent$HistoryEventType('MEET_NATION', 2);
    HistoryEvent$HistoryEventType.CITY_OF_GOLD = new HistoryEvent$HistoryEventType()._HistoryEvent$HistoryEventType('CITY_OF_GOLD', 3);
    HistoryEvent$HistoryEventType.FOUND_COLONY = new HistoryEvent$HistoryEventType()._HistoryEvent$HistoryEventType('FOUND_COLONY', 4);
    HistoryEvent$HistoryEventType.ABANDON_COLONY = new HistoryEvent$HistoryEventType()._HistoryEvent$HistoryEventType('ABANDON_COLONY', 5);
    HistoryEvent$HistoryEventType.CONQUER_COLONY = new HistoryEvent$HistoryEventType()._HistoryEvent$HistoryEventType('CONQUER_COLONY', 6);
    HistoryEvent$HistoryEventType.COLONY_DESTROYED = new HistoryEvent$HistoryEventType()._HistoryEvent$HistoryEventType('COLONY_DESTROYED', 7);
    HistoryEvent$HistoryEventType.COLONY_CONQUERED = new HistoryEvent$HistoryEventType()._HistoryEvent$HistoryEventType('COLONY_CONQUERED', 8);
    HistoryEvent$HistoryEventType.DESTROY_SETTLEMENT = new HistoryEvent$HistoryEventType()._HistoryEvent$HistoryEventType('DESTROY_SETTLEMENT', 9);
    HistoryEvent$HistoryEventType.DESTROY_NATION = new HistoryEvent$HistoryEventType()._HistoryEvent$HistoryEventType('DESTROY_NATION', 10);
    HistoryEvent$HistoryEventType.FOUNDING_FATHER = new HistoryEvent$HistoryEventType()._HistoryEvent$HistoryEventType('FOUNDING_FATHER', 11);
    HistoryEvent$HistoryEventType.DECLARE_INDEPENDENCE = new HistoryEvent$HistoryEventType()._HistoryEvent$HistoryEventType('DECLARE_INDEPENDENCE', 12);
    HistoryEvent$HistoryEventType.INDEPENDENCE = new HistoryEvent$HistoryEventType()._HistoryEvent$HistoryEventType('INDEPENDENCE', 13);
    HistoryEvent$HistoryEventType.SPANISH_SUCCESSION = new HistoryEvent$HistoryEventType()._HistoryEvent$HistoryEventType('SPANISH_SUCCESSION', 14);
    HistoryEvent$HistoryEventType.DECLARE_WAR = new HistoryEvent$HistoryEventType()._HistoryEvent$HistoryEventType('DECLARE_WAR', 15);
    HistoryEvent$HistoryEventType.CEASE_FIRE = new HistoryEvent$HistoryEventType()._HistoryEvent$HistoryEventType('CEASE_FIRE', 16);
    HistoryEvent$HistoryEventType.MAKE_PEACE = new HistoryEvent$HistoryEventType()._HistoryEvent$HistoryEventType('MAKE_PEACE', 17);
    HistoryEvent$HistoryEventType.FORM_ALLIANCE = new HistoryEvent$HistoryEventType()._HistoryEvent$HistoryEventType('FORM_ALLIANCE', 18);
    HistoryEvent$HistoryEventType.NATION_DESTROYED = new HistoryEvent$HistoryEventType()._HistoryEvent$HistoryEventType('NATION_DESTROYED', 19);
    HistoryEvent$HistoryEventType.$VALUES = [HistoryEvent$HistoryEventType.DISCOVER_NEW_WORLD, HistoryEvent$HistoryEventType.DISCOVER_REGION, HistoryEvent$HistoryEventType.MEET_NATION, HistoryEvent$HistoryEventType.CITY_OF_GOLD, HistoryEvent$HistoryEventType.FOUND_COLONY, HistoryEvent$HistoryEventType.ABANDON_COLONY, HistoryEvent$HistoryEventType.CONQUER_COLONY, HistoryEvent$HistoryEventType.COLONY_DESTROYED, HistoryEvent$HistoryEventType.COLONY_CONQUERED, HistoryEvent$HistoryEventType.DESTROY_SETTLEMENT, HistoryEvent$HistoryEventType.DESTROY_NATION, HistoryEvent$HistoryEventType.FOUNDING_FATHER, HistoryEvent$HistoryEventType.DECLARE_INDEPENDENCE, HistoryEvent$HistoryEventType.INDEPENDENCE, HistoryEvent$HistoryEventType.SPANISH_SUCCESSION, HistoryEvent$HistoryEventType.DECLARE_WAR, HistoryEvent$HistoryEventType.CEASE_FIRE, HistoryEvent$HistoryEventType.MAKE_PEACE, HistoryEvent$HistoryEventType.FORM_ALLIANCE, HistoryEvent$HistoryEventType.NATION_DESTROYED];
  }
}

$J.define(HistoryEvent, 'net.sf.freecol.common.model.HistoryEvent', { kind: 'class', sup: 'net.sf.freecol.common.model.StringTemplate', ctors: { 'net.sf.freecol.common.io.FreeColXMLReader': '_HistoryEvent$FreeColXMLReader', 'net.sf.freecol.common.model.Turn,net.sf.freecol.common.model.HistoryEvent$HistoryEventType,net.sf.freecol.common.model.Player': '_HistoryEvent$Turn$HistoryEventType$Player', '': '_HistoryEvent$' }, returns: { 'hashCode': 'int', 'getXMLTagName': 'java.lang.String', 'getScore': 'int', 'getPlayerId': 'java.lang.String', 'getEventType': 'net.sf.freecol.common.model.HistoryEvent$HistoryEventType', 'getTurn': 'net.sf.freecol.common.model.Turn' } });
$J.define(HistoryEvent$HistoryEventType, 'net.sf.freecol.common.model.HistoryEvent$HistoryEventType', { kind: 'enum', ifaces: ['net.sf.freecol.common.model.Named'], sup: 'java.lang.Enum', ctors: { '': '_HistoryEvent$HistoryEventType' }, returns: { 'getNameKey': 'java.lang.String', 'getDescriptionKey': 'java.lang.String', 'getKey': 'java.lang.String' }, clinit: true, lazy: ['$VALUES', 'DISCOVER_NEW_WORLD', 'DISCOVER_REGION', 'MEET_NATION', 'CITY_OF_GOLD', 'FOUND_COLONY', 'ABANDON_COLONY', 'CONQUER_COLONY', 'COLONY_DESTROYED', 'COLONY_CONQUERED', 'DESTROY_SETTLEMENT', 'DESTROY_NATION', 'FOUNDING_FATHER', 'DECLARE_INDEPENDENCE', 'INDEPENDENCE', 'SPANISH_SUCCESSION', 'DECLARE_WAR', 'CEASE_FIRE', 'MAKE_PEACE', 'FORM_ALLIANCE', 'NATION_DESTROYED'] });
$J.module(() => {
  Messages = $J.load('net.sf.freecol.common.i18n.Messages');
  Stance = $J.load('net.sf.freecol.common.model.Stance');
  StringTemplate$TemplateType = $J.load('net.sf.freecol.common.model.StringTemplate$TemplateType');
  Turn = $J.load('net.sf.freecol.common.model.Turn');
  StringUtils = $J.load('net.sf.freecol.common.util.StringUtils');
  Utils = $J.load('net.sf.freecol.common.util.Utils');
});
