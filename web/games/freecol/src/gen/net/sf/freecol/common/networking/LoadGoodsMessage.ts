// @ts-nocheck
// FreeCol 1.2.0 src/net/sf/freecol/common/networking/LoadGoodsMessage.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
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
import { $J, Exception, JString, NumberFormatException } from '../../../../../../jre/index.ts';
import { AttributeMessage } from './AttributeMessage.ts';

let Location, Unit, Message$MessagePriority;

/**
 * The message sent when loading goods.
 */
export class LoadGoodsMessage extends AttributeMessage {
  static readonly TAG: string = 'loadGoods';
  static readonly AMOUNT_TAG: string = 'amount';
  static readonly CARRIER_TAG: string = 'carrier';
  static readonly LOCATION_TAG: string = 'location';
  static readonly TYPE_TAG: string = 'type';
  /**
   * Create a new {@code LoadGoodsMessage}.
   *
   * @param loc The {@code Location} of the goods.
   * @param type The {@code GoodsType} to load.
   * @param amount The amount of goods to load.
   * @param carrier The {@code Unit} to load the goods onto.
   */
  _LoadGoodsMessage$Location$GoodsType$int$Unit(loc: Location, type$: GoodsType, amount: number, carrier: Unit): this {
    this._AttributeMessage$String$StringArr(LoadGoodsMessage.TAG, [LoadGoodsMessage.LOCATION_TAG, loc.getId(), LoadGoodsMessage.TYPE_TAG, type$.getId(), LoadGoodsMessage.AMOUNT_TAG, String(amount), LoadGoodsMessage.CARRIER_TAG, carrier.getId()]);
    return this;
  }
  /**
   * Create a new {@code LoadGoodsMessage} from a stream.
   *
   * @param game The {@code Game} to read within.
   * @param xr The {@code FreeColXMLReader} to read from.
   * @exception XMLStreamException if the stream is corrupt.
   */
  _LoadGoodsMessage$Game$FreeColXMLReader(game: Game, xr: FreeColXMLReader): this {
    this._AttributeMessage$String$FreeColXMLReader$StringArr(LoadGoodsMessage.TAG, xr, [LoadGoodsMessage.LOCATION_TAG, LoadGoodsMessage.TYPE_TAG, LoadGoodsMessage.AMOUNT_TAG, LoadGoodsMessage.CARRIER_TAG]);
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
  serverHandler(freeColServer: FreeColServer, serverPlayer: ServerPlayer): ChangeSet {
    let game = freeColServer.getGame();
    let spec = freeColServer.getSpecification();
    let locationId = this.getStringAttribute(LoadGoodsMessage.LOCATION_TAG);
    let typeId = this.getStringAttribute(LoadGoodsMessage.TYPE_TAG);
    let carrierId = this.getStringAttribute(LoadGoodsMessage.CARRIER_TAG);
    let amountString = this.getStringAttribute(LoadGoodsMessage.AMOUNT_TAG);
    let fcgo = game.getFreeColGameObject$String(locationId);
    if (!($J.isa(fcgo, Location))) {
      return serverPlayer.clientError$String('Not a location: ' + locationId);
    }
    let carrier: Unit;
    try {
      carrier = serverPlayer.getOurFreeColGameObject(carrierId, $J.cls(Unit));
    } catch ($e0) {
      if ($J.isa($e0, Exception)) {
        let e = $J.exc($e0);
        return serverPlayer.clientError$String(e.getMessage());
      } else {
        throw $e0;
      }
    }
    if (!carrier.canCarryGoods()) {
      return serverPlayer.clientError$String('Not a goods carrier: ' + carrierId);
    } else if (carrier.getTradeLocation() == null) {
      return serverPlayer.clientError$String('Not at a trade location: ' + carrierId);
    }
    let type$ = spec.getGoodsType(typeId);
    if (type$ == null) {
      return serverPlayer.clientError$String('Not a goods type: ' + typeId);
    }
    let amount: number;
    try {
      amount = $J.parseInt(amountString);
    } catch ($e1) {
      if ($J.isa($e1, NumberFormatException)) {
        let e = $J.exc($e1);
        return serverPlayer.clientError$String('Bad amount: ' + amountString);
      } else {
        throw $e1;
      }
    }
    if (amount <= 0) {
      return serverPlayer.clientError$String('Amount must be positive: ' + amountString);
    }
    return this.igc$FreeColServer(freeColServer).loadGoods(serverPlayer, fcgo, type$, amount, carrier);
  }
}

$J.define(LoadGoodsMessage, 'net.sf.freecol.common.networking.LoadGoodsMessage', { kind: 'class', sup: 'net.sf.freecol.common.networking.AttributeMessage', ctors: { 'net.sf.freecol.common.model.Game,net.sf.freecol.common.io.FreeColXMLReader': '_LoadGoodsMessage$Game$FreeColXMLReader', 'net.sf.freecol.common.model.Location,net.sf.freecol.common.model.GoodsType,int,net.sf.freecol.common.model.Unit': '_LoadGoodsMessage$Location$GoodsType$int$Unit' }, returns: { 'getPriority': 'net.sf.freecol.common.networking.Message$MessagePriority' } });
$J.module(() => {
  Location = $J.load('net.sf.freecol.common.model.Location');
  Unit = $J.load('net.sf.freecol.common.model.Unit');
  Message$MessagePriority = $J.load('net.sf.freecol.common.networking.Message$MessagePriority');
});
