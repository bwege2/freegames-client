// @ts-nocheck
// FreeCol 1.2.0 src/net/sf/freecol/common/networking/DeliverGiftMessage.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
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
import { ObjectMessage } from './ObjectMessage.ts';

let Goods, IndianSettlement, Unit, Message$MessagePriority;

/**
 * The message sent when delivering a gift to a Settlement.
 */
export class DeliverGiftMessage extends ObjectMessage {
  static readonly TAG: string = 'deliverGift';
  static readonly SETTLEMENT_TAG: string = 'settlement';
  static readonly UNIT_TAG: string = 'unit';
  /**
   * Create a new {@code DeliverGiftMessage}.
   *
   * @param unit The {@code Unit} that is trading.
   * @param is The {@code IndianSettlement} that is trading.
   * @param goods The {@code Goods} to deliverGift.
   */
  _DeliverGiftMessage$Unit$IndianSettlement$Goods(unit: Unit, is$: IndianSettlement, goods: Goods): this {
    this._ObjectMessage$String$StringArr(DeliverGiftMessage.TAG, [DeliverGiftMessage.UNIT_TAG, unit.getId(), DeliverGiftMessage.SETTLEMENT_TAG, is$.getId()]);
    this.appendChild(goods);
    return this;
  }
  /**
   * Create a new {@code DeliverGiftMessage} from stream.
   *
   * @param game The {@code Game} this message belongs to.
   * @param xr The {@code FreeColXMLReader} to read from.
   * @exception XMLStreamException if there a problem reading the stream.
   */
  _DeliverGiftMessage$Game$FreeColXMLReader(game: Game, xr: FreeColXMLReader): this {
    this._ObjectMessage$String$FreeColXMLReader$StringArr(DeliverGiftMessage.TAG, xr, [DeliverGiftMessage.UNIT_TAG, DeliverGiftMessage.SETTLEMENT_TAG]);
    let goods = null;
    while (xr.moreTags()) {
      let tag = xr.getLocalName();
      if ($J.equals(Goods.TAG, tag)) {
        if (goods == null) {
          goods = xr.readFreeColObject$Game$Class(game, $J.cls(Goods));
        } else {
          this.expected(DeliverGiftMessage.TAG, tag);
        }
      } else {
        this.expected(Goods.TAG, tag);
      }
      xr.expectTag(tag);
    }
    xr.expectTag(DeliverGiftMessage.TAG);
    this.appendChild(goods);
    return this;
  }
  /**
   * Get the {@code Goods} delivered as a gift.
   *
   * @return The {@code Goods}, or null if none.
   */
  getGoods(): Goods {
    return this.getChild(0, $J.cls(Goods));
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
    let unitId = this.getStringAttribute(DeliverGiftMessage.UNIT_TAG);
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
    let is$: IndianSettlement;
    try {
      is$ = unit.getAdjacentSettlement(this.getStringAttribute(DeliverGiftMessage.SETTLEMENT_TAG), $J.cls(IndianSettlement));
    } catch ($e1) {
      if ($J.isa($e1, Exception)) {
        let e = $J.exc($e1);
        return serverPlayer.clientError$String(e.getMessage());
      } else {
        throw $e1;
      }
    }
    let goods = this.getGoods();
    if (goods == null) {
      return serverPlayer.clientError$String('No goods found');
    } else if (goods.getLocation() !== unit) {
      return serverPlayer.clientError$String('Gift ' + goods.getId() + ' is not with unit ' + unitId);
    }
    return this.igc$FreeColServer(freeColServer).deliverGiftToSettlement(serverPlayer, unit, is$, goods);
  }
}

$J.define(DeliverGiftMessage, 'net.sf.freecol.common.networking.DeliverGiftMessage', { kind: 'class', sup: 'net.sf.freecol.common.networking.ObjectMessage', ctors: { 'net.sf.freecol.common.model.Game,net.sf.freecol.common.io.FreeColXMLReader': '_DeliverGiftMessage$Game$FreeColXMLReader', 'net.sf.freecol.common.model.Unit,net.sf.freecol.common.model.IndianSettlement,net.sf.freecol.common.model.Goods': '_DeliverGiftMessage$Unit$IndianSettlement$Goods' }, returns: { 'getPriority': 'net.sf.freecol.common.networking.Message$MessagePriority', 'getGoods': 'net.sf.freecol.common.model.Goods' } });
$J.module(() => {
  Goods = $J.load('net.sf.freecol.common.model.Goods');
  IndianSettlement = $J.load('net.sf.freecol.common.model.IndianSettlement');
  Unit = $J.load('net.sf.freecol.common.model.Unit');
  Message$MessagePriority = $J.load('net.sf.freecol.common.networking.Message$MessagePriority');
});
