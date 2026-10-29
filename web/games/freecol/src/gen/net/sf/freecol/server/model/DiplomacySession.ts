// @ts-nocheck
// FreeCol 1.2.0 src/net/sf/freecol/server/model/DiplomacySession.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
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
import { $J, Logger } from '../../../../../../jre/index.ts';
import { TimedSession } from './TimedSession.ts';

let DiplomaticTrade$TradeContext, DiplomaticTrade$TradeStatus, ChangeSet, ChangeSet$See, CloseMessage, DiplomacyMessage, Session;

/**
 * A type of session to handle diplomacy.
 *
 * Diplomacy may involve human players, so it *must* be a TimedSession.
 */
export class DiplomacySession extends TimedSession {
  static logger: Logger = null;
  /**
   * The agreement under consideration.
   */
  agreement: DiplomaticTrade = null;
  /**
   * The initiating unit.
   */
  unit: Unit = null;
  /**
   * The other player's settlement.
   */
  settlement: Settlement = null;
  /**
   * The other player's unit (only non-null in first contact cases).
   */
  otherUnit: Unit = null;
  /**
   * Start a new diplomacy session with our unit and another player
   * settlement.
   *
   * @param unit The {@code Unit} that is initiating diplomacy.
   * @param settlement The {@code Settlement} that is contacted.
   * @param timeout The amount of time to wait for a response.
   */
  _DiplomacySession$Unit$Settlement$long(unit: Unit, settlement: Settlement, timeout: number): this {
    this._TimedSession(DiplomacySession.makeDiplomacySessionKey(unit, settlement), timeout);
    this.agreement = null;
    this.unit = unit;
    this.settlement = settlement;
    this.otherUnit = null;
    return this;
  }
  /**
   * Start a new diplomacy session with our unit and another player unit.
   *
   * @param unit The {@code Unit} that is initiating diplomacy.
   * @param otherUnit The other {@code Unit} that is contacted.
   * @param timeout The amount of time to wait for a response.
   */
  _DiplomacySession$Unit$Unit$long(unit: Unit, otherUnit: Unit, timeout: number): this {
    this._TimedSession(DiplomacySession.makeDiplomacySessionKey(unit, otherUnit), timeout);
    this.agreement = null;
    this.unit = unit;
    this.settlement = null;
    this.otherUnit = otherUnit;
    return this;
  }
  /**
   * Make a diplomacy session key for the given ownables.
   *
   * @param o1 The first {@code Ownable}.
   * @param o2 The second {@code Ownable}.
   * @return A diplomacy session key.
   */
  static makeDiplomacySessionKey(o1: Ownable, o2: Ownable): string {
    return Session.makeSessionKey$Class$FreeColGameObject$FreeColGameObject($J.cls(DiplomacySession), o1.getOwner(), o2.getOwner());
  }
  /**
   * Get the game this session is in.
   *
   * @return The enclosing {@code ServerGame}.
   */
  getGame(): ServerGame {
    return this.unit.getGame();
  }
  /**
   * Get the session agreement.
   *
   * @return The {@code DiplomaticTrade} under negotiation.
   */
  getAgreement(): DiplomaticTrade {
    return this.agreement;
  }
  /**
   * Set the session agreement.
   *
   * @param agreement The new {@code DiplomaticTrade} to negotiate.
   */
  setAgreement(agreement: DiplomaticTrade): void {
    this.agreement = agreement;
  }
  /**
   * Get the initiating unit.
   *
   * @return The {@code Unit} that started the session.
   */
  getUnit(): Unit {
    return this.unit;
  }
  /**
   * Get the settlement if any.
   *
   * @return The {@code Settlement} that is negotiating.
   */
  getSettlement(): Settlement {
    return this.settlement;
  }
  /**
   * Get the other unit if any.
   *
   * @return The other {@code Unit} that is negotiating.
   */
  getOtherUnit(): Unit {
    return this.otherUnit;
  }
  /**
   * Get the owner of the initiating unit.
   *
   * @return The {@code ServerPlayer} that owns the initiating unit.
   */
  getOwner(): ServerPlayer {
    return this.unit.getOwner();
  }
  /**
   * Get the owner of the other settlement or unit.
   *
   * @return The {@code ServerPlayer} that owns the other settlement or unit.
   */
  getOtherPlayer$$DiplomacySession(): ServerPlayer {
    return ((this.settlement != null) ? this.settlement.getOwner() : this.otherUnit.getOwner());
  }
  /**
   * Utility to find the other player in this session from a given one.
   *
   * @param serverPlayer The {@code ServerPlayer} *not* to find.
   * @return The other {@code ServerPlayer}.
   */
  getOtherPlayer$ServerPlayer(serverPlayer: ServerPlayer): ServerPlayer {
    let other = this.getOwner();
    return (other !== serverPlayer) ? other : this.getOtherPlayer$$DiplomacySession();
  }
  /**
   * Utility to create a message using the current session parameters and
   * trade agreement, given a desired destination player.
   *
   * @param destination The {@code Player} to send the message to.
   * @return A new {@code DiplomacyMessage} for the destination player.
   */
  getMessage(destination: Player): DiplomacyMessage {
    return (destination.owns(this.unit)) ? ((this.otherUnit == null) ? new DiplomacyMessage()._DiplomacyMessage$FreeColGameObject$FreeColGameObject$DiplomaticTrade(this.unit, this.settlement, this.agreement) : new DiplomacyMessage()._DiplomacyMessage$Unit$Unit$DiplomaticTrade(this.unit, this.otherUnit, this.agreement)) : ((this.otherUnit == null) ? new DiplomacyMessage()._DiplomacyMessage$FreeColGameObject$FreeColGameObject$DiplomaticTrade(this.settlement, this.unit, this.agreement) : new DiplomacyMessage()._DiplomacyMessage$Unit$Unit$DiplomaticTrade(this.otherUnit, this.unit, this.agreement));
  }
  /**
   * Was this session started by the given objects?
   *
   * @param fcgo1 The first {@code FreeColGameObject}.
   * @param fcgo2 The second {@code FreeColGameObject}.
   * @return True if the objects started this session.
   */
  isCompatible(fcgo1: FreeColGameObject, fcgo2: FreeColGameObject): boolean {
    return (fcgo1 === this.unit && (fcgo2 === this.settlement || fcgo2 === this.otherUnit)) || (fcgo2 === this.unit && (fcgo1 === this.settlement || fcgo1 === this.otherUnit));
  }
  /**
   * Find any contact session already underway between the owners of
   * the given units.
   *
   * @param unit The first {@code Unit}.
   * @param other The second {@code Unit}.
   * @return Any {@code DiplomacySession} found.
   */
  static findContactSession$Unit$Unit(unit: Unit, other: Unit): DiplomacySession {
    return DiplomacySession.findContactSession$Player$Player(unit.getOwner(), other.getOwner());
  }
  /**
   * Find any contact session already underway between the owners of a 
   * given unit and settlement.
   *
   * @param unit The {@code Unit}.
   * @param settlement The {@code Settlement}.
   * @return Any {@code DiplomacySession} found.
   */
  static findContactSession$Unit$Settlement(unit: Unit, settlement: Settlement): DiplomacySession {
    return DiplomacySession.findContactSession$Player$Player(unit.getOwner(), settlement.getOwner());
  }
  /**
   * Find any contact session already underway between the given players.
   *
   * @param p1 The first {@code Player}.
   * @param p2 The second {@code Player}.
   * @return Any {@code DiplomacySession} found.
   */
  static findContactSession$Player$Player(p1: Player, p2: Player): DiplomacySession {
    let pred = (s) => (s instanceof DiplomacySession) && (s).getAgreement() != null && ((s).getAgreement().getContext() === DiplomaticTrade$TradeContext.CONTACT) && (((s).getOwner() === p1 && (s).getOtherPlayer$$DiplomacySession() === p2) || ((s).getOwner() === p2 && (s).getOtherPlayer$$DiplomacySession() === p1));
    return Session.findSession(pred);
  }
  /**
   * Primitive level to finishing the session with the given result.
   *
   * @param result The result of the session.
   * @param cs A {@code ChangeSet} to update.
   */
  completeInternal(result: boolean, cs: ChangeSet): void {
    DiplomacySession.logger.info('Completing diplomacy session: ' + $J.str(this));
    if (this.agreement != null) {
      if (result) {
        result = this.getGame().csAcceptTrade(this.agreement, this.unit, this.settlement, cs);
      }
      this.agreement.setStatus((result) ? DiplomaticTrade$TradeStatus.ACCEPT_TRADE : DiplomaticTrade$TradeStatus.REJECT_TRADE);
      let sp = this.agreement.getSender();
      cs.add$See$Message(ChangeSet$See.only(sp), this.getMessage(sp));
      let rp = this.agreement.getRecipient();
      cs.add$See$Message(ChangeSet$See.only(rp), this.getMessage(rp));
    }
    this.unit.setMovesLeft(0);
    cs.add$See$FreeColGameObjectArr(ChangeSet$See.only(this.getOwner()), [this.unit]);
  }
  /**
   * Complete first contact session.
   *
   * Just do nothing but superclass action as we do not want the
   * offer accept/reject messages, and the unit already has zero moves.
   *
   * @param cs A {@code ChangeSet} to update.
   * @return Whether the session was already complete.
   */
  completeFirstContact(cs: ChangeSet): boolean {
    return super.complete$ChangeSet(cs);
  }
  /**
   * Explicit completion of the session with a given result.
   *
   * Called from the controller when the player returns a definite response.
   *
   * @param result Whether to accept or reject the demand.
   * @param cs A {@code ChangeSet} to update.
   * @return Whether the session was already complete.
   */
  complete$boolean$ChangeSet(result: boolean, cs: ChangeSet): boolean {
    let ret = super.complete$ChangeSet(cs);
    if (!ret) {
      this.completeInternal(result, cs);
    }
    return ret;
  }
  /**
   * {@inheritDoc}
   */
  complete$boolean(result: boolean): boolean {
    let dialogName = 'net.sf.freecol.client.gui.dialog.NegotiationDialog';
    let cs = new ChangeSet()._ChangeSet$();
    let ret = this.complete$boolean$ChangeSet(false, cs);
    if (!ret) {
      cs.add$See$Message(ChangeSet$See.only(this.agreement.getSender()), new CloseMessage()._CloseMessage$String(dialogName));
      cs.add$See$Message(ChangeSet$See.only(this.agreement.getRecipient()), new CloseMessage()._CloseMessage$String(dialogName));
    }
    this.getGame().sendToAll(cs);
    return ret;
  }
  /**
   * {@inheritDoc}
   */
  complete$ChangeSet(cs: ChangeSet): boolean {
    return this.complete$boolean$ChangeSet(false, cs);
  }
  static $clinit() {
    DiplomacySession.logger = Logger.getLogger($J.cls(DiplomacySession).getName());
  }
}

$J.define(DiplomacySession, 'net.sf.freecol.server.model.DiplomacySession', { kind: 'class', sup: 'net.sf.freecol.server.model.TimedSession', ctors: { 'net.sf.freecol.common.model.Unit,net.sf.freecol.common.model.Unit,long': '_DiplomacySession$Unit$Unit$long', 'net.sf.freecol.common.model.Unit,net.sf.freecol.common.model.Settlement,long': '_DiplomacySession$Unit$Settlement$long' }, returns: { 'getOtherPlayer$$DiplomacySession': 'net.sf.freecol.server.model.ServerPlayer', 'getOwner': 'net.sf.freecol.server.model.ServerPlayer', 'getOtherUnit': 'net.sf.freecol.common.model.Unit', 'getSettlement': 'net.sf.freecol.common.model.Settlement', 'getUnit': 'net.sf.freecol.common.model.Unit', 'getAgreement': 'net.sf.freecol.common.model.DiplomaticTrade', 'getGame': 'net.sf.freecol.server.model.ServerGame' }, meths: { 'complete(net.sf.freecol.common.networking.ChangeSet)': 'complete$ChangeSet', 'complete(boolean)': 'complete$boolean', 'complete(boolean,net.sf.freecol.common.networking.ChangeSet)': 'complete$boolean$ChangeSet', 'findContactSession(net.sf.freecol.common.model.Player,net.sf.freecol.common.model.Player)': 'findContactSession$Player$Player', 'findContactSession(net.sf.freecol.common.model.Unit,net.sf.freecol.common.model.Settlement)': 'findContactSession$Unit$Settlement', 'findContactSession(net.sf.freecol.common.model.Unit,net.sf.freecol.common.model.Unit)': 'findContactSession$Unit$Unit', 'getOtherPlayer(net.sf.freecol.server.model.ServerPlayer)': 'getOtherPlayer$ServerPlayer', 'getOtherPlayer()': 'getOtherPlayer$$DiplomacySession' }, clinit: true, lazy: ['logger'] });
$J.module(() => {
  DiplomaticTrade$TradeContext = $J.load('net.sf.freecol.common.model.DiplomaticTrade$TradeContext');
  DiplomaticTrade$TradeStatus = $J.load('net.sf.freecol.common.model.DiplomaticTrade$TradeStatus');
  ChangeSet = $J.load('net.sf.freecol.common.networking.ChangeSet');
  ChangeSet$See = $J.load('net.sf.freecol.common.networking.ChangeSet$See');
  CloseMessage = $J.load('net.sf.freecol.common.networking.CloseMessage');
  DiplomacyMessage = $J.load('net.sf.freecol.common.networking.DiplomacyMessage');
  Session = $J.load('net.sf.freecol.server.model.Session');
});
