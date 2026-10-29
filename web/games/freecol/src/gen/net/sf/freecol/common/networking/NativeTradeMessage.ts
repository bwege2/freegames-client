// @ts-nocheck
// FreeCol 1.2.0 src/net/sf/freecol/common/networking/NativeTradeMessage.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
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
import { ObjectMessage } from './ObjectMessage.ts';

let FreeColXMLReader$ReadScope, NativeTrade, NativeTrade$NativeTradeAction, Message$MessagePriority;

/**
 * The message sent to handle native trade sessions.
 */
export class NativeTradeMessage extends ObjectMessage {
  static readonly TAG: string = 'nativeTrade';
  static readonly ACTION_TAG: string = 'action';
  /**
   * Create a new {@code NativeTradeMessage} request with the
   * supplied unit and settlement.
   *
   * @param unit The {@code Unit} performing the trade.
   * @param is The {@code IndianSettlement} where the
   *     trade occurs.
   */
  _NativeTradeMessage$Unit$IndianSettlement(unit: Unit, is$: IndianSettlement): this {
    this._NativeTradeMessage$NativeTradeAction$NativeTrade(NativeTrade$NativeTradeAction.OPEN, new NativeTrade()._NativeTrade$Unit$IndianSettlement(unit, is$));
    return this;
  }
  /**
   * Create a new {@code NativetradeMessage} with the
   * supplied unit and native settlement.
   *
   * @param action The {@code NativeTradeAction}
   * @param nt The {@code NativeTrade}
   */
  _NativeTradeMessage$NativeTradeAction$NativeTrade(action: NativeTrade$NativeTradeAction, nt: NativeTrade): this {
    this._ObjectMessage$String$StringArr(NativeTradeMessage.TAG, [NativeTradeMessage.ACTION_TAG, action.toString()]);
    this.appendChild(nt);
    return this;
  }
  /**
   * Create a new {@code NativeTradeMessage} from a stream.
   *
   * @param game The {@code Game} this message belongs to.
   * @param xr The {@code FreeColXMLReader} to read from.
   * @exception XMLStreamException if there is a problem reading the stream.
   */
  _NativeTradeMessage$Game$FreeColXMLReader(game: Game, xr: FreeColXMLReader): this {
    this._ObjectMessage$String$FreeColXMLReader$StringArr(NativeTradeMessage.TAG, xr, [NativeTradeMessage.ACTION_TAG]);
    let nt = null;
    let rs = xr.replaceScope(FreeColXMLReader$ReadScope.NOINTERN);
    try {
      while (xr.moreTags()) {
        let tag = xr.getLocalName();
        if ($J.equals(NativeTrade.TAG, tag)) {
          if (nt == null) {
            nt = xr.readFreeColObject$Game$Class(game, $J.cls(NativeTrade));
          } else {
            this.expected(NativeTradeMessage.TAG, tag);
          }
        } else {
          this.expected(NativeTrade.TAG, tag);
        }
        xr.expectTag(tag);
      }
      xr.expectTag(NativeTradeMessage.TAG);
    } finally {
      xr.replaceScope(rs);
    }
    this.appendChild(nt);
    return this;
  }
  getAction(): NativeTrade$NativeTradeAction {
    return this.getEnumAttribute(NativeTradeMessage.ACTION_TAG, $J.cls(NativeTrade$NativeTradeAction), null);
  }
  getNativeTrade(): NativeTrade {
    return this.getChild(0, $J.cls(NativeTrade));
  }
  /**
   * {@inheritDoc}
   */
  getPriority(): Message$MessagePriority {
    return Message$MessagePriority.LATE;
  }
  /**
   * {@inheritDoc}
   */
  aiHandler(freeColServer: FreeColServer, aiPlayer: AIPlayer): void {
    let nt = this.getNativeTrade();
    let action = this.getAction();
    aiPlayer.nativeTradeHandler(action, nt);
  }
  /**
   * {@inheritDoc}
   */
  clientHandler(freeColClient: FreeColClient): void {
    let action = this.getAction();
    let nt = this.getNativeTrade();
    this.igc$FreeColClient(freeColClient).nativeTradeHandler(action, nt);
    this.clientGeneric(freeColClient);
  }
  /**
   * {@inheritDoc}
   */
  serverHandler(freeColServer: FreeColServer, serverPlayer: ServerPlayer): ChangeSet {
    let nt = this.getNativeTrade();
    if (nt == null) {
      return serverPlayer.clientError$String('Null native trade');
    }
    let unit = nt.getUnit();
    if (unit == null) {
      return serverPlayer.clientError$String('Null unit');
    }
    if (!unit.hasTile()) {
      return serverPlayer.clientError$String('Unit not on the map: ' + unit.getId());
    }
    let is$ = nt.getIndianSettlement();
    if (is$ == null) {
      return serverPlayer.clientError$String('Null settlement');
    }
    if (!unit.getTile$().isAdjacent(is$.getTile$())) {
      return serverPlayer.clientError$String('Unit not adjacent to settlement');
    }
    return this.igc$FreeColServer(freeColServer).nativeTrade(serverPlayer, this.getAction(), nt);
  }
}

$J.define(NativeTradeMessage, 'net.sf.freecol.common.networking.NativeTradeMessage', { kind: 'class', sup: 'net.sf.freecol.common.networking.ObjectMessage', ctors: { 'net.sf.freecol.common.model.Game,net.sf.freecol.common.io.FreeColXMLReader': '_NativeTradeMessage$Game$FreeColXMLReader', 'net.sf.freecol.common.model.NativeTrade$NativeTradeAction,net.sf.freecol.common.model.NativeTrade': '_NativeTradeMessage$NativeTradeAction$NativeTrade', 'net.sf.freecol.common.model.Unit,net.sf.freecol.common.model.IndianSettlement': '_NativeTradeMessage$Unit$IndianSettlement' }, returns: { 'getPriority': 'net.sf.freecol.common.networking.Message$MessagePriority', 'getNativeTrade': 'net.sf.freecol.common.model.NativeTrade', 'getAction': 'net.sf.freecol.common.model.NativeTrade$NativeTradeAction' } });
$J.module(() => {
  FreeColXMLReader$ReadScope = $J.load('net.sf.freecol.common.io.FreeColXMLReader$ReadScope');
  NativeTrade = $J.load('net.sf.freecol.common.model.NativeTrade');
  NativeTrade$NativeTradeAction = $J.load('net.sf.freecol.common.model.NativeTrade$NativeTradeAction');
  Message$MessagePriority = $J.load('net.sf.freecol.common.networking.Message$MessagePriority');
});
