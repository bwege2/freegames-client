// @ts-nocheck
// FreeCol 1.2.0 src/net/sf/freecol/common/networking/UpdateTradeRouteMessage.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
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

let FreeColXMLReader$ReadScope, TradeRoute, Message$MessagePriority;

/**
 * The message sent when updating a trade route.
 */
export class UpdateTradeRouteMessage extends ObjectMessage {
  static readonly TAG: string = 'updateTradeRoute';
  /**
   * Create a new {@code UpdateTradeRouteMessage} with the
   * supplied trade route.
   *
   * @param tradeRoute The {@code TradeRoute} to update.
   */
  _UpdateTradeRouteMessage$TradeRoute(tradeRoute: TradeRoute): this {
    this._ObjectMessage$String(UpdateTradeRouteMessage.TAG);
    this.appendChild(tradeRoute);
    return this;
  }
  /**
   * Create a new {@code UpdateTradeRouteMessage} from a stream.
   *
   * @param game The {@code Game} this message belongs to.
   * @param xr The {@code FreeColXMLReader} to read from.
   * @exception XMLStreamException if there is a problem reading the stream.
   */
  _UpdateTradeRouteMessage$Game$FreeColXMLReader(game: Game, xr: FreeColXMLReader): this {
    this._UpdateTradeRouteMessage$TradeRoute(null);
    let rs = xr.replaceScope(FreeColXMLReader$ReadScope.NOINTERN);
    let tradeRoute = null;
    try {
      while (xr.moreTags()) {
        let tag = xr.getLocalName();
        if ($J.equals(TradeRoute.TAG, tag)) {
          if (tradeRoute == null) {
            tradeRoute = xr.readFreeColObject$Game$Class(game, $J.cls(TradeRoute));
          } else {
            this.expected(UpdateTradeRouteMessage.TAG, tag);
          }
        } else {
          this.expected(TradeRoute.TAG, tag);
        }
        xr.expectTag(tag);
      }
      xr.expectTag(UpdateTradeRouteMessage.TAG);
    } finally {
      xr.replaceScope(rs);
    }
    this.appendChild(tradeRoute);
    return this;
  }
  /**
   * Accessor for the trade route.
   *
   * @return The attached {@code TradeRoute}.
   */
  getTradeRoute(): TradeRoute {
    return this.getChild(0, $J.cls(TradeRoute));
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
  serverHandler(freeColServer: FreeColServer, serverPlayer: ServerPlayer): ChangeSet {
    let tradeRoute = this.getTradeRoute();
    if (tradeRoute == null) {
      return serverPlayer.clientError$String('No trade route to update.');
    }
    return this.igc$FreeColServer(freeColServer).updateTradeRoute(serverPlayer, tradeRoute);
  }
}

$J.define(UpdateTradeRouteMessage, 'net.sf.freecol.common.networking.UpdateTradeRouteMessage', { kind: 'class', sup: 'net.sf.freecol.common.networking.ObjectMessage', ctors: { 'net.sf.freecol.common.model.Game,net.sf.freecol.common.io.FreeColXMLReader': '_UpdateTradeRouteMessage$Game$FreeColXMLReader', 'net.sf.freecol.common.model.TradeRoute': '_UpdateTradeRouteMessage$TradeRoute' }, returns: { 'getPriority': 'net.sf.freecol.common.networking.Message$MessagePriority', 'getTradeRoute': 'net.sf.freecol.common.model.TradeRoute' } });
$J.module(() => {
  FreeColXMLReader$ReadScope = $J.load('net.sf.freecol.common.io.FreeColXMLReader$ReadScope');
  TradeRoute = $J.load('net.sf.freecol.common.model.TradeRoute');
  Message$MessagePriority = $J.load('net.sf.freecol.common.networking.Message$MessagePriority');
});
