// @ts-nocheck
// FreeCol 1.2.0 src/net/sf/freecol/common/networking/DeleteTradeRouteMessage.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
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

let TradeRoute, Message$MessagePriority;

/**
 * The message sent when deleting a trade route.
 */
export class DeleteTradeRouteMessage extends AttributeMessage {
  static readonly TAG: string = 'deleteTradeRoute';
  static readonly TRADE_ROUTE_TAG: string = 'tradeRoute';
  /**
   * Create a new {@code DeleteTradeRouteMessage} with the
   * supplied unit and route.
   *
   * @param tradeRoute The {@code TradeRoute} to delete.
   */
  _DeleteTradeRouteMessage$TradeRoute(tradeRoute: TradeRoute): this {
    this._AttributeMessage$String$StringArr(DeleteTradeRouteMessage.TAG, [DeleteTradeRouteMessage.TRADE_ROUTE_TAG, tradeRoute.getId()]);
    return this;
  }
  /**
   * Create a new {@code DeleteTradeRouteMessage} from a stream.
   *
   * @param game The {@code Game} this message belongs to.
   * @param xr The {@code FreeColXMLReader} to read from.
   * @exception XMLStreamException if the stream is corrupt.
   */
  _DeleteTradeRouteMessage$Game$FreeColXMLReader(game: Game, xr: FreeColXMLReader): this {
    this._AttributeMessage$String$FreeColXMLReader$StringArr(DeleteTradeRouteMessage.TAG, xr, [DeleteTradeRouteMessage.TRADE_ROUTE_TAG]);
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
    let tradeRouteId = this.getStringAttribute(DeleteTradeRouteMessage.TRADE_ROUTE_TAG);
    let tradeRoute: TradeRoute;
    try {
      tradeRoute = serverPlayer.getOurFreeColGameObject(tradeRouteId, $J.cls(TradeRoute));
    } catch ($e0) {
      if ($J.isa($e0, Exception)) {
        let e = $J.exc($e0);
        return serverPlayer.clientError$String(e.getMessage());
      } else {
        throw $e0;
      }
    }
    return this.igc$FreeColServer(freeColServer).deleteTradeRoute(serverPlayer, tradeRoute);
  }
}

$J.define(DeleteTradeRouteMessage, 'net.sf.freecol.common.networking.DeleteTradeRouteMessage', { kind: 'class', sup: 'net.sf.freecol.common.networking.AttributeMessage', ctors: { 'net.sf.freecol.common.model.Game,net.sf.freecol.common.io.FreeColXMLReader': '_DeleteTradeRouteMessage$Game$FreeColXMLReader', 'net.sf.freecol.common.model.TradeRoute': '_DeleteTradeRouteMessage$TradeRoute' }, returns: { 'getPriority': 'net.sf.freecol.common.networking.Message$MessagePriority' } });
$J.module(() => {
  TradeRoute = $J.load('net.sf.freecol.common.model.TradeRoute');
  Message$MessagePriority = $J.load('net.sf.freecol.common.networking.Message$MessagePriority');
});
