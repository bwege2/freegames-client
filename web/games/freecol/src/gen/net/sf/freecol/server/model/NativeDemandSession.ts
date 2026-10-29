// @ts-nocheck
// FreeCol 1.2.0 src/net/sf/freecol/server/model/NativeDemandSession.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
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
import { $J, Logger, StringBuilder } from '../../../../../../jre/index.ts';
import { TimedSession } from './TimedSession.ts';

let Constants$IndianDemandAction, ChangeSet, ChangeSet$See, CloseMessage, Session;

/**
 * A type of session to handle trading with a native settlement.
 */
export class NativeDemandSession extends TimedSession {
  static logger: Logger = null;
  unit: Unit = null;
  colony: Colony = null;
  type: GoodsType = null;
  amount: number = 0;
  /**
   * Creates a new {@code NativeDemandSession}.
   *
   * @param unit The {@code Unit} making the demand.
   * @param colony The {@code Colony} where the demand is made.
   * @param goodsType The {@code GoodsType} to demand.
   * @param amount The amount of goods.
   * @param timeout The amount of time to wait for a response.
   */
  _NativeDemandSession(unit: Unit, colony: Colony, goodsType: GoodsType, amount: number, timeout: number): this {
    this._TimedSession(Session.makeSessionKey$Class$FreeColGameObject$FreeColGameObject($J.cls(NativeDemandSession), unit, colony), timeout);
    this.unit = unit;
    this.colony = colony;
    this.type = goodsType;
    this.amount = amount;
    return this;
  }
  getColonyOwner(): ServerPlayer {
    return this.colony.getOwner();
  }
  getUnitOwner(): ServerPlayer {
    return this.unit.getOwner();
  }
  /**
   * Get the game.
   *
   * @return The {@code ServerGame}.
   */
  getGame(): ServerGame {
    return this.unit.getGame();
  }
  /**
   * Primitive level to finishing the session with the given result.
   *
   * @param result The result of the demand.
   * @param cs A {@code ChangeSet} to update.
   */
  completeInternal(result: boolean, cs: ChangeSet): void {
    let demandPlayer = this.getUnitOwner();
    let colonyPlayer = this.getColonyOwner();
    colonyPlayer.csCompleteNativeDemand(demandPlayer, this.unit, this.colony, this.type, this.amount, ((result) ? Constants$IndianDemandAction.INDIAN_DEMAND_ACCEPT : Constants$IndianDemandAction.INDIAN_DEMAND_REJECT), cs);
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
    let cs = new ChangeSet()._ChangeSet$();
    let ret = super.complete$ChangeSet(cs);
    if (!ret) {
      this.completeInternal(result, cs);
      cs.add$See$Message(ChangeSet$See.only(this.getColonyOwner()), new CloseMessage()._CloseMessage$String('net.sf.freecol.client.gui.dialog.NativeDemandDialog'));
      this.getGame().sendToAll(cs);
    }
    return ret;
  }
  /**
   * {@inheritDoc}
   */
  complete$ChangeSet(cs: ChangeSet): boolean {
    let ret = super.complete$ChangeSet(cs);
    if (!ret) {
      this.completeInternal(false, cs);
    }
    return ret;
  }
  /**
   * {@inheritDoc}
   */
  toString(): string {
    let sb = new StringBuilder(64);
    sb.append(String.fromCharCode(91 /* '[' */)).append($J.str($J.getClass(this))).append(' unit=').append($J.str(this.unit)).append(' colony=').append($J.str(this.colony)).append(' goods=').append(String(this.amount)).append(String.fromCharCode(32 /* ' ' */)).append(this.type.getSuffix$()).append(String.fromCharCode(93 /* ']' */));
    return sb.toString();
  }
  static $clinit() {
    NativeDemandSession.logger = Logger.getLogger($J.cls(NativeDemandSession).getName());
  }
}

$J.define(NativeDemandSession, 'net.sf.freecol.server.model.NativeDemandSession', { kind: 'class', sup: 'net.sf.freecol.server.model.TimedSession', ctors: { 'net.sf.freecol.common.model.Unit,net.sf.freecol.common.model.Colony,net.sf.freecol.common.model.GoodsType,int,long': '_NativeDemandSession' }, returns: { 'getGame': 'net.sf.freecol.server.model.ServerGame', 'getUnitOwner': 'net.sf.freecol.server.model.ServerPlayer', 'getColonyOwner': 'net.sf.freecol.server.model.ServerPlayer' }, meths: { 'complete(net.sf.freecol.common.networking.ChangeSet)': 'complete$ChangeSet', 'complete(boolean)': 'complete$boolean', 'complete(boolean,net.sf.freecol.common.networking.ChangeSet)': 'complete$boolean$ChangeSet' }, clinit: true, lazy: ['logger'] });
$J.module(() => {
  Constants$IndianDemandAction = $J.load('net.sf.freecol.common.model.Constants$IndianDemandAction');
  ChangeSet = $J.load('net.sf.freecol.common.networking.ChangeSet');
  ChangeSet$See = $J.load('net.sf.freecol.common.networking.ChangeSet$See');
  CloseMessage = $J.load('net.sf.freecol.common.networking.CloseMessage');
  Session = $J.load('net.sf.freecol.server.model.Session');
});
