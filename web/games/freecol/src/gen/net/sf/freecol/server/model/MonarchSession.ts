// @ts-nocheck
// FreeCol 1.2.0 src/net/sf/freecol/server/model/MonarchSession.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
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
import { Session } from './Session.ts';

let Monarch$MonarchAction;

/**
 * A type of session to handle monarch actions that require response.
 */
export class MonarchSession extends Session {
  static logger: Logger = null;
  /**
   * The player whose monarch is active.
   */
  serverPlayer: ServerPlayer = null;
  /**
   * The action to be considered.
   */
  action_: Monarch$MonarchAction = null;
  /**
   * The amount of tax to raise.
   */
  tax: number = 0;
  /**
   * The goods for the goods party.
   */
  goods: Goods = null;
  /**
   * Mercenaries on offer.
   */
  mercenaries: List<AbstractUnit> = null;
  /**
   * Mercenary price.
   */
  price_: number = 0;
  $init_MonarchSession() {
    this.goods = null;
    this.mercenaries = null;
  }
  _MonarchSession$ServerPlayer$MonarchAction$int$Goods(serverPlayer: ServerPlayer, action: Monarch$MonarchAction, tax: number, goods: Goods): this {
    this._Session(Session.makeSessionKey$Class$String$String($J.cls(MonarchSession), serverPlayer.getId(), ''));
    this.$init_MonarchSession();
    this.serverPlayer = serverPlayer;
    this.action_ = action;
    this.tax = tax;
    this.goods = goods;
    this.mercenaries = null;
    this.price_ = 0;
    return this;
  }
  _MonarchSession$ServerPlayer$MonarchAction$List$int(serverPlayer: ServerPlayer, action: Monarch$MonarchAction, mercenaries: List<AbstractUnit>, price: number): this {
    this._Session(Session.makeSessionKey$Class$String$String($J.cls(MonarchSession), serverPlayer.getId(), ''));
    this.$init_MonarchSession();
    this.serverPlayer = serverPlayer;
    this.action_ = action;
    this.tax = 0;
    this.goods = null;
    this.mercenaries = mercenaries;
    this.price_ = price;
    return this;
  }
  /**
   * Primitive level to finishing the session with the given result.
   *
   * @param result The result of the session, null means ignored.
   * @param cs A {@code ChangeSet} to update.
   */
  completeInternal(result: boolean, cs: ChangeSet): void {
    switch (this.action_) {
      case Monarch$MonarchAction.RAISE_TAX_ACT:
      case Monarch$MonarchAction.RAISE_TAX_WAR:
        if (result == null) {
          this.serverPlayer.ignoreTax(this.tax, this.goods, cs);
        } else {
          this.serverPlayer.csRaiseTax(this.tax, this.goods, result, cs);
        }
        break;
      case Monarch$MonarchAction.MONARCH_MERCENARIES:
      case Monarch$MonarchAction.HESSIAN_MERCENARIES:
        if (result == null) {
          this.serverPlayer.ignoreMercenaries(cs);
        } else if (result) {
          this.serverPlayer.csAddMercenaries(this.mercenaries, this.price_, null, cs);
        }
        break;
      default:
        break;
    }
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
  complete$ChangeSet(cs: ChangeSet): boolean {
    let ret = super.complete$ChangeSet(cs);
    if (!ret) {
      this.completeInternal(null, cs);
    }
    return ret;
  }
  getAction(): Monarch$MonarchAction {
    return this.action_;
  }
  getTax(): number {
    return this.tax;
  }
  getGoods(): Goods {
    return this.goods;
  }
  getMercenaries(): List<AbstractUnit> {
    return this.mercenaries;
  }
  getPrice(): number {
    return this.price_;
  }
  static $clinit() {
    MonarchSession.logger = Logger.getLogger($J.cls(MonarchSession).getName());
  }
}

$J.define(MonarchSession, 'net.sf.freecol.server.model.MonarchSession', { kind: 'class', sup: 'net.sf.freecol.server.model.Session', ctors: { 'net.sf.freecol.server.model.ServerPlayer,net.sf.freecol.common.model.Monarch$MonarchAction,java.util.List,int': '_MonarchSession$ServerPlayer$MonarchAction$List$int', 'net.sf.freecol.server.model.ServerPlayer,net.sf.freecol.common.model.Monarch$MonarchAction,int,net.sf.freecol.common.model.Goods': '_MonarchSession$ServerPlayer$MonarchAction$int$Goods' }, returns: { 'getPrice': 'int', 'getMercenaries': 'java.util.List', 'getGoods': 'net.sf.freecol.common.model.Goods', 'getTax': 'int', 'getAction': 'net.sf.freecol.common.model.Monarch$MonarchAction' }, meths: { 'complete(net.sf.freecol.common.networking.ChangeSet)': 'complete$ChangeSet', 'complete(boolean,net.sf.freecol.common.networking.ChangeSet)': 'complete$boolean$ChangeSet' }, clinit: true, lazy: ['logger'] });
$J.module(() => {
  Monarch$MonarchAction = $J.load('net.sf.freecol.common.model.Monarch$MonarchAction');
});
