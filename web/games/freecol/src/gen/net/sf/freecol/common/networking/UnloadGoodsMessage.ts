// @ts-nocheck
// FreeCol 1.2.0 src/net/sf/freecol/common/networking/UnloadGoodsMessage.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
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
import { $J, Exception, JString } from '../../../../../../jre/index.ts';
import { AttributeMessage } from './AttributeMessage.ts';

let Unit, Message$MessagePriority;

/**
 * The message sent when unloading goods.
 */
export class UnloadGoodsMessage extends AttributeMessage {
  static readonly TAG: string = 'unloadGoods';
  static readonly AMOUNT_TAG: string = 'amount';
  static readonly CARRIER_TAG: string = 'carrier';
  static readonly TYPE_TAG: string = 'type';
  /**
   * Create a new {@code UnloadGoodsMessage}.
   *
   * @param goodsType The {@code GoodsType} to unload.
   * @param amount The amount of goods to unload.
   * @param carrier The {@code Unit} carrying the goods.
   */
  _UnloadGoodsMessage$GoodsType$int$Unit(goodsType: GoodsType, amount: number, carrier: Unit): this {
    this._AttributeMessage$String$StringArr(UnloadGoodsMessage.TAG, [UnloadGoodsMessage.TYPE_TAG, goodsType.getId(), UnloadGoodsMessage.AMOUNT_TAG, String(amount), UnloadGoodsMessage.CARRIER_TAG, carrier.getId()]);
    return this;
  }
  /**
   * Create a new {@code UnloadGoodsMessage} from a stream.
   *
   * @param game The {@code Game} this message belongs to (null here).
   * @param xr The {@code FreeColXMLReader} to read from.
   * @exception XMLStreamException if the stream is corrupt.
   */
  _UnloadGoodsMessage$Game$FreeColXMLReader(game: Game, xr: FreeColXMLReader): this {
    this._AttributeMessage$String$FreeColXMLReader$StringArr(UnloadGoodsMessage.TAG, xr, [UnloadGoodsMessage.TYPE_TAG, UnloadGoodsMessage.AMOUNT_TAG, UnloadGoodsMessage.CARRIER_TAG]);
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
    let spec = freeColServer.getSpecification();
    let typeId = this.getStringAttribute(UnloadGoodsMessage.TYPE_TAG);
    let amount = this.getIntegerAttribute(UnloadGoodsMessage.AMOUNT_TAG, -1);
    let carrierId = this.getStringAttribute(UnloadGoodsMessage.CARRIER_TAG);
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
    }
    let type$ = spec.getGoodsType(typeId);
    if (type$ == null) {
      return serverPlayer.clientError$String('Not a goods type: ' + typeId);
    }
    if (amount <= 0) {
      return serverPlayer.clientError$String('Invalid amount: ' + amount);
    }
    let present = carrier.getGoodsCount(type$);
    if (present < amount) {
      return serverPlayer.clientError$String('Attempt to unload ' + amount + ' ' + type$.getId() + ' but only ' + present + ' present');
    }
    return this.igc$FreeColServer(freeColServer).unloadGoods(serverPlayer, type$, amount, carrier);
  }
}

$J.define(UnloadGoodsMessage, 'net.sf.freecol.common.networking.UnloadGoodsMessage', { kind: 'class', sup: 'net.sf.freecol.common.networking.AttributeMessage', ctors: { 'net.sf.freecol.common.model.Game,net.sf.freecol.common.io.FreeColXMLReader': '_UnloadGoodsMessage$Game$FreeColXMLReader', 'net.sf.freecol.common.model.GoodsType,int,net.sf.freecol.common.model.Unit': '_UnloadGoodsMessage$GoodsType$int$Unit' }, returns: { 'getPriority': 'net.sf.freecol.common.networking.Message$MessagePriority' } });
$J.module(() => {
  Unit = $J.load('net.sf.freecol.common.model.Unit');
  Message$MessagePriority = $J.load('net.sf.freecol.common.networking.Message$MessagePriority');
});
