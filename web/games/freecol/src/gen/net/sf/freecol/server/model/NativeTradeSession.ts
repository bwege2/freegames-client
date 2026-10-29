// @ts-nocheck
// FreeCol 1.2.0 src/net/sf/freecol/server/model/NativeTradeSession.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
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
import { $J, JString, Logger, StringBuilder } from '../../../../../../jre/index.ts';
import { Session } from './Session.ts';

let NativeTrade, ChangeSet$See;

/**
 * A type of session to handle trading with a native settlement.
 */
export class NativeTradeSession extends Session {
  static logger: Logger = null;
  /**
   * The moves the trading unit has left at start of session.
   */
  movesLeft: number = 0;
  /**
   * The native trade information.
   */
  nt: NativeTrade = null;
  /**
   * Creates a new {@code NativeTradeSession}.
   *
   * @param nt The {@code NativeTrade}
   */
  _NativeTradeSession(nt: NativeTrade): this {
    this._Session(Session.makeSessionKey$Class$FreeColGameObject$FreeColGameObject($J.cls(NativeTradeSession), nt.getUnit(), nt.getIndianSettlement()));
    this.movesLeft = nt.getUnit().getMovesLeft();
    this.nt = nt;
    return this;
  }
  /**
   * Get the native trade underway.
   *
   * @return The {@code NativeTrade}.
   */
  getNativeTrade(): NativeTrade {
    return this.nt;
  }
  /**
   * Helper function to update a tentative native trade and open
   * a session for it.
   *
   * @param nt The proposed {@code NativeTrade}.
   * @return The updated {@code NativeTrade}.
   */
  static openSession(nt: NativeTrade): NativeTrade {
    nt = new NativeTrade()._NativeTrade$Unit$IndianSettlement(nt.getUnit(), nt.getIndianSettlement());
    new NativeTradeSession()._NativeTradeSession(nt).register();
    nt.initialize();
    return nt;
  }
  /**
   * {@inheritDoc}
   */
  complete$ChangeSet(cs: ChangeSet): boolean {
    let ret = super.complete$ChangeSet(cs);
    if (this.nt.hasNotTraded()) {
      let unit = this.nt.getUnit();
      unit.setMovesLeft(this.movesLeft);
      cs.addPartial(ChangeSet$See.only(unit.getOwner()), unit, ['movesLeft', String(unit.getMovesLeft())]);
    }
    this.nt.setDone();
    return ret;
  }
  /**
   * {@inheritDoc}
   */
  toString(): string {
    let sb = new StringBuilder(64);
    sb.append(String.fromCharCode(91 /* '[' */)).append($J.str($J.getClass(this))).append(' moves=').append(String(this.movesLeft)).append(String.fromCharCode(32 /* ' ' */)).append($J.str(this.nt)).append(String.fromCharCode(93 /* ']' */));
    return sb.toString();
  }
  static $clinit() {
    NativeTradeSession.logger = Logger.getLogger($J.cls(NativeTradeSession).getName());
  }
}

$J.define(NativeTradeSession, 'net.sf.freecol.server.model.NativeTradeSession', { kind: 'class', sup: 'net.sf.freecol.server.model.Session', ctors: { 'net.sf.freecol.common.model.NativeTrade': '_NativeTradeSession' }, returns: { 'getNativeTrade': 'net.sf.freecol.common.model.NativeTrade' }, meths: { 'complete(net.sf.freecol.common.networking.ChangeSet)': 'complete$ChangeSet' }, clinit: true, lazy: ['logger'] });
$J.module(() => {
  NativeTrade = $J.load('net.sf.freecol.common.model.NativeTrade');
  ChangeSet$See = $J.load('net.sf.freecol.common.networking.ChangeSet$See');
});
