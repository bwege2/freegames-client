// @ts-nocheck
// FreeCol 1.2.0 src/net/sf/freecol/common/networking/AssignTradeRouteMessage.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
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
import { $J, Exception } from '../../../../../../jre/index.ts';
import { AttributeMessage } from './AttributeMessage.ts';

let TradeRoute, Unit, Message$MessagePriority;

/**
 * The message sent when assigning a trade route to a unit.
 */
export class AssignTradeRouteMessage extends AttributeMessage {
  static readonly TAG: string = 'assignTradeRoute';
  static readonly TRADE_ROUTE_TAG: string = 'tradeRoute';
  static readonly UNIT_TAG: string = 'unit';
  /**
   * Create a new {@code AssignTradeRouteMessage} with the
   * supplied unit and route.
   *
   * @param unit The {@code Unit} to assign a trade route to.
   * @param tradeRoute The {@code TradeRoute} to assign.
   */
  _AssignTradeRouteMessage$Unit$TradeRoute(unit: Unit, tradeRoute: TradeRoute): this {
    this._AttributeMessage$String$StringArr(AssignTradeRouteMessage.TAG, [AssignTradeRouteMessage.UNIT_TAG, unit.getId(), AssignTradeRouteMessage.TRADE_ROUTE_TAG, ((tradeRoute == null) ? null : tradeRoute.getId())]);
    return this;
  }
  /**
   * Create a new {@code AssignTradeRouteMessage} from a stream.
   *
   * @param game The {@code Game} this message belongs to.
   * @param xr The {@code FreeColXMLReader} to read from.
   * @exception XMLStreamException if the stream is corrupt.
   */
  _AssignTradeRouteMessage$Game$FreeColXMLReader(game: Game, xr: FreeColXMLReader): this {
    this._AttributeMessage$String$FreeColXMLReader$StringArr(AssignTradeRouteMessage.TAG, xr, [AssignTradeRouteMessage.UNIT_TAG, AssignTradeRouteMessage.TRADE_ROUTE_TAG]);
    return this;
  }
  /**
   * {@inheritDoc}
   */
  currentPlayerMessage(): boolean {
    return true;
  }
  /**
   * {@inheritDoc}
   */
  getPriority(): Message$MessagePriority {
    return Message$MessagePriority.NORMAL;
  }
  /**
   * {@inheritDoc}
   */
  aiHandler(freeColServer: FreeColServer, aiPlayer: AIPlayer): void {
  }
  /**
   * {@inheritDoc}
   */
  serverHandler(freeColServer: FreeColServer, serverPlayer: ServerPlayer): ChangeSet {
    let unitId = this.getStringAttribute(AssignTradeRouteMessage.UNIT_TAG);
    let tradeRouteId = this.getStringAttribute(AssignTradeRouteMessage.TRADE_ROUTE_TAG);
    let unit: Unit;
    try {
      unit = serverPlayer.getOurFreeColGameObject(unitId, $J.cls(Unit));
    } catch ($e0) {
      if ($J.isa($e0, Exception)) {
        let e = $J.exc($e0);
        return serverPlayer.clientError$String(e.getMessage());
      } else {
        throw $e0;
      }
    }
    let tradeRoute: TradeRoute;
    if (tradeRouteId == null) {
      tradeRoute = null;
    } else {
      try {
        tradeRoute = serverPlayer.getOurFreeColGameObject(tradeRouteId, $J.cls(TradeRoute));
      } catch ($e1) {
        if ($J.isa($e1, Exception)) {
          let e = $J.exc($e1);
          return serverPlayer.clientError$String(e.getMessage());
        } else {
          throw $e1;
        }
      }
    }
    return this.igc$FreeColServer(freeColServer).assignTradeRoute(serverPlayer, unit, tradeRoute);
  }
}

$J.define(AssignTradeRouteMessage, 'net.sf.freecol.common.networking.AssignTradeRouteMessage', { kind: 'class', sup: 'net.sf.freecol.common.networking.AttributeMessage', ctors: { 'net.sf.freecol.common.model.Game,net.sf.freecol.common.io.FreeColXMLReader': '_AssignTradeRouteMessage$Game$FreeColXMLReader', 'net.sf.freecol.common.model.Unit,net.sf.freecol.common.model.TradeRoute': '_AssignTradeRouteMessage$Unit$TradeRoute' }, returns: { 'getPriority': 'net.sf.freecol.common.networking.Message$MessagePriority' } });
$J.module(() => {
  TradeRoute = $J.load('net.sf.freecol.common.model.TradeRoute');
  Unit = $J.load('net.sf.freecol.common.model.Unit');
  Message$MessagePriority = $J.load('net.sf.freecol.common.networking.Message$MessagePriority');
});
